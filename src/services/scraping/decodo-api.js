/**
 * Decodo Scraping API Wrapper
 *
 * Dit bestand bevat de wrapper voor de Decodo Scraping API, waarmee we
 * verschillende websites kunnen scrapen voor data-analyse.
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
// Configuratie
const API_BASE_URL = process.env.DECODO_API_BASE_URL || 'https://api.decodo.io/v1';
const API_KEY = process.env.DECODO_API_KEY;
const DEFAULT_TIMEOUT = 60000; // 60 seconden
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconden

// Rate limiting configuratie
const MAX_REQUESTS_PER_MINUTE = 60; // Aanpassen op basis van je API limiet
const INTERVAL = 60 * 1000; // 60 seconden in milliseconden

// Eenvoudige throttling implementatie als vervanging voor p-throttle
const createThrottle = () => {
  const queue = [];
  let activeCount = 0;
  let requestsThisInterval = 0;
  let intervalStart = Date.now();

  const processQueue = () => {
    const now = Date.now();
    // Reset counter als een nieuwe interval is begonnen
    if (now - intervalStart >= INTERVAL) {
      intervalStart = now;
      requestsThisInterval = 0;
    }

    // Verwerk de wachtrij als er ruimte is binnen de rate limit
    while (queue.length > 0 && activeCount < MAX_REQUESTS_PER_MINUTE && requestsThisInterval < MAX_REQUESTS_PER_MINUTE) {
      const { fn, resolve, reject } = queue.shift();
      activeCount++;
      requestsThisInterval++;

      Promise.resolve()
        .then(() => fn())
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeCount--;
          if (queue.length > 0) {
            setTimeout(processQueue, 50);
          }
        });
    }

    // Als er nog items in de wachtrij staan maar we hebben de rate limit bereikt,
    // plan een nieuwe verwerking in voor de volgende interval
    if (queue.length > 0 && requestsThisInterval >= MAX_REQUESTS_PER_MINUTE) {
      const timeUntilNextInterval = INTERVAL - (now - intervalStart);
      setTimeout(processQueue, timeUntilNextInterval + 50);
    }
  };

  return (fn) => {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      if (activeCount < MAX_REQUESTS_PER_MINUTE) {
        processQueue();
      }
    });
  };
};

const throttle = createThrottle();

// Controleer of we in ontwikkelingsmodus zijn
const isDevelopment = process.env.NODE_ENV === 'development';
const hasApiKey = !!process.env.DECODO_API_KEY;
const useMockApi = isDevelopment || !hasApiKey;

// Throttled axios instance met mock ondersteuning
const throttledAxios = async (config) => {
  // In ontwikkelingsmodus of zonder API key, gebruik mock data
  if (useMockApi) {
    console.log('🔄 [MOCK] Axios request overgeslagen in ontwikkelingsmodus');
    return { data: { message: 'Mock response' } };
  }
  
  // Valideer de URL voordat we de request doen
  if (!config || !config.url || typeof config.url !== 'string') {
    console.error('❌ Ongeldige URL in axios request:', config?.url);
    throw new Error(`Ongeldige URL: ${config?.url}`);
  }
  
  // Valideer de baseURL+url combinatie
  if (config.baseURL && config.url) {
    try {
      // Test of de URL geldig is
      new URL(config.url, config.baseURL);
    } catch (error) {
      console.error('❌ Ongeldige URL combinatie:', config.baseURL, config.url);
      throw new Error(`Ongeldige URL combinatie: ${config.baseURL} + ${config.url}`);
    }
  }
  
  // Gebruik throttle voor rate limiting in productie
  return await throttle(async () => axios(config))();
};

/**
 * API client voor Decodo Scraping API
 */
class DecodoApiClient {
  constructor(apiKey = API_KEY, baseUrl = API_BASE_URL) {
    this.useMock = !apiKey;
    
    if (!apiKey) {
      console.warn('⚠️ Geen Decodo API key gevonden, gebruik mock implementatie');
      // Gebruik mock implementatie in plaats van te falen
      this.isMock = true;
      this.apiKey = 'mock-api-key';
      this.baseUrl = 'https://api.decodo.io/v1';
      return;
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Request logging
    this.client.interceptors.request.use((request) => {
      console.log(`🔄 Decodo API Request: ${request.method.toUpperCase()} ${request.url}`);
      return request;
    });

    // Response logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Decodo API Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        console.error(`❌ Decodo API Error: ${error.message}`);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Maak een API request met retry logica
   * @param {String} method - HTTP method (GET, POST, etc.)
   * @param {String} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} params - Query parameters
   * @param {Object} options - Extra opties
   * @returns {Promise<Object>} - API response
   */
  async request(method, endpoint, data = null, params = {}, options = {}) {
    // Als we in mock modus zijn, retourneer mock data
    if (this.isMock) {
      console.log(`🔄 [MOCK] Decodo API Request: ${method.toUpperCase()} ${endpoint}`);
      return this._getMockResponse(endpoint, params, data);
    }
    
    const config = {
      method,
      url: endpoint,
      params,
      ...options,
    };

    if (data) {
      config.data = data;
    }

    // Retry logica
    let retries = 0;
    let lastError = null;

    while (retries < MAX_RETRIES) {
      try {
        // Gebruik throttled axios voor rate limiting
        const response = await throttledAxios(config);
        return response.data;
      } catch (error) {
        lastError = error;

        // Controleer of de error retryable is
        if (this.isRetryableError(error) && retries < MAX_RETRIES - 1) {
          retries++;
          console.warn(`🔄 Retry ${retries}/${MAX_RETRIES} voor ${method} ${endpoint} na ${RETRY_DELAY}ms`);
          await this.sleep(RETRY_DELAY * retries); // Exponentiële backoff
          continue;
        }

        // Log de error details
        this.logApiError(error, method, endpoint);
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Controleer of een error retryable is
   * @param {Error} error - De error om te controleren
   * @returns {Boolean} - True als de error retryable is
   */
  isRetryableError(error) {
    // Netwerk errors zijn retryable
    if (!error.response) {
      return true;
    }

    // Server errors (5xx) zijn retryable
    if (error.response.status >= 500 && error.response.status < 600) {
      return true;
    }

    // Rate limiting (429) is retryable
    if (error.response.status === 429) {
      return true;
    }

    // Andere errors zijn niet retryable
    return false;
  }

  /**
   * Log API error details
   * @param {Error} error - De error om te loggen
   * @param {String} method - HTTP method
   * @param {String} endpoint - API endpoint
   */
  logApiError(error, method, endpoint) {
    console.error(`❌ Decodo API Error in ${method} ${endpoint}:`);

    if (error.response) {
      // Server responded met een non-2xx status
      console.error(`Status: ${error.response.status} ${error.response.statusText}`);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // Request was gemaakt maar geen response ontvangen
      console.error('No response received:', error.request);
    } else {
      // Iets ging mis bij het opzetten van de request
      console.error('Request error:', error.message);
    }
  }

  /**
   * Helper functie voor sleep/delay
   * @param {Number} ms - Milliseconden om te wachten
   * @returns {Promise} - Promise die resolvet na de gegeven tijd
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Helper methode voor het genereren van mock responses
   * @param {String} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} data - Request data
   * @returns {Object} - Mock response
   */
  _getMockResponse(endpoint, params, data) {
    // Genereer verschillende mock responses op basis van het endpoint
    switch (endpoint) {
      case '/scrape':
        return {
          id: uuidv4(),
          status: 'completed',
          url: data?.url || 'https://example.com',
          data: {
            title: 'Voorbeeld Website',
            description: 'Dit is een voorbeeld website voor mock data',
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            metadata: {
              lastUpdated: new Date().toISOString(),
              language: 'nl',
            },
          },
        };
      case '/jobs':
        return {
          jobs: [
            {
              id: uuidv4(),
              status: 'completed',
              url: 'https://example.com/page1',
              createdAt: new Date().toISOString(),
            },
            {
              id: uuidv4(),
              status: 'pending',
              url: 'https://example.com/page2',
              createdAt: new Date().toISOString(),
            },
          ],
          total: 2,
          page: params?.page || 1,
          pageSize: params?.pageSize || 10,
        };
      default:
        return {
          status: 'success',
          message: 'Mock response',
          timestamp: new Date().toISOString(),
        };
    }
  }

  /**
   * Scrape een URL met de gegeven parameters
   * @param {String} url - De URL om te scrapen
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Scrape resultaat
   */
  async scrape(url, options = {}) {
    const defaultOptions = {
      headless: true,
      geo: 'nl',
      locale: 'nl-NL',
      device_type: 'desktop',
      session_id: uuidv4(),
      wait_for: '#content', // Element om op te wachten, aanpassen per website
      timeout: 30000, // 30 seconden
      proxy: null, // Optionele proxy
      javascript: true, // JavaScript uitvoeren
      cookies: [], // Cookies om te gebruiken
      headers: {}, // Extra headers
      screenshot: false, // Screenshot maken
      html: true, // HTML response teruggeven
    };

    const scrapeOptions = { ...defaultOptions, ...options };

    return this.request('POST', '/scrape', {
      url,
      ...scrapeOptions,
    });
  }

  /**
   * Scrape meerdere URLs in batch
   * @param {Array<Object>} urlsWithOptions - Array van {url, options} objecten
   * @returns {Promise<Array<Object>>} - Array van scrape resultaten
   */
  async batchScrape(urlsWithOptions) {
    const batch = urlsWithOptions.map(({ url, options = {} }) => {
      const defaultOptions = {
        headless: true,
        geo: 'nl',
        locale: 'nl-NL',
        device_type: 'desktop',
        session_id: uuidv4(),
        wait_for: '#content',
        timeout: 30000,
        proxy: null,
        javascript: true,
        cookies: [],
        headers: {},
        screenshot: false,
        html: true,
      };

      return {
        url,
        ...defaultOptions,
        ...options,
      };
    });

    return this.request('POST', '/batch-scrape', { batch });
  }

  /**
   * Haal de status van een scrape job op
   * @param {String} jobId - ID van de scrape job
   * @returns {Promise<Object>} - Job status
   */
  async getJobStatus(jobId) {
    return this.request('GET', `/jobs/${jobId}`);
  }

  /**
   * Haal het resultaat van een scrape job op
   * @param {String} jobId - ID van de scrape job
   * @returns {Promise<Object>} - Job resultaat
   */
  async getJobResult(jobId) {
    return this.request('GET', `/jobs/${jobId}/result`);
  }

  /**
   * Annuleer een scrape job
   * @param {String} jobId - ID van de scrape job
   * @returns {Promise<Object>} - Annuleer resultaat
   */
  async cancelJob(jobId) {
    return this.request('POST', `/jobs/${jobId}/cancel`);
  }

  /**
   * Haal account informatie op
   * @returns {Promise<Object>} - Account informatie
   */
  async getAccountInfo() {
    return this.request('GET', '/account');
  }

  /**
   * Haal API usage statistieken op
   * @param {String} period - Periode (day, week, month)
   * @returns {Promise<Object>} - Usage statistieken
   */
  async getUsageStats(period = 'day') {
    return this.request('GET', '/usage', null, { period });
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de DecodoApiClient
 * @param {String} apiKey - Optionele API key
 * @param {String} baseUrl - Optionele base URL
 * @returns {DecodoApiClient} - DecodoApiClient instance
 */
const getDecodoApiClient = (apiKey = API_KEY, baseUrl = API_BASE_URL) => {
  if (!instance) {
    instance = new DecodoApiClient(apiKey, baseUrl);
  }
  return instance;
};

module.exports = {
  getDecodoApiClient,
};
