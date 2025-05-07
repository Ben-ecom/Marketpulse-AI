import axios from 'axios';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Laad omgevingsvariabelen
dotenv.config();

/**
 * Service voor het beheren van proxies en web scraping API's
 */
export const proxyService = {
  /**
   * Haal een willekeurige proxy op uit de proxy pool
   * @returns {Object} - Proxy configuratie voor Puppeteer
   */
  getRandomProxy() {
    try {
      // Controleer of we proxies moeten gebruiken
      if (process.env.USE_PROXIES !== 'true') {
        return null;
      }
      
      // Haal proxy configuratie op uit .env
      const proxyList = process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [];
      
      if (proxyList.length === 0) {
        logger.warn('Geen proxies geconfigureerd in .env bestand');
        return null;
      }
      
      // Kies een willekeurige proxy uit de lijst
      const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
      
      // Parse de proxy string (formaat: protocol://username:password@host:port)
      const proxyParts = randomProxy.match(/^(https?):\/\/(?:([^:@]+):([^@]+)@)?([^:]+):(\d+)$/);
      
      if (!proxyParts) {
        logger.error(`Ongeldige proxy string: ${randomProxy}`);
        return null;
      }
      
      const [, protocol, username, password, host, port] = proxyParts;
      
      // Maak proxy configuratie voor Puppeteer
      return {
        server: `${protocol}://${host}:${port}`,
        username: username || undefined,
        password: password || undefined
      };
    } catch (error) {
      logger.error(`Fout bij ophalen random proxy: ${error.message}`);
      return null;
    }
  },
  
  /**
   * Haal een pagina op via de Web Scraping API
   * @param {string} url - URL om op te halen
   * @param {object} options - Opties voor de API
   * @returns {Promise<string>} - HTML content van de pagina
   */
  async fetchViaScrapingApi(url, options = {}) {
    try {
      // Controleer of we de Web Scraping API moeten gebruiken
      if (process.env.USE_SCRAPING_API !== 'true') {
        throw new Error('Web Scraping API is niet ingeschakeld');
      }
      
      // Haal API configuratie op uit .env
      const apiKey = process.env.SCRAPING_API_KEY;
      const apiUrl = process.env.SCRAPING_API_URL;
      
      if (!apiKey || !apiUrl) {
        throw new Error('Web Scraping API configuratie ontbreekt in .env bestand');
      }
      
      // Stel request parameters samen
      const params = {
        api_key: apiKey,
        url: url,
        ...options
      };
      
      // Voeg optionele parameters toe
      if (options.country) params.country = options.country;
      if (options.device) params.device = options.device;
      if (options.premium) params.premium = options.premium ? 1 : 0;
      if (options.render_js) params.render_js = options.render_js ? 1 : 0;
      
      // Voer de request uit
      const response = await axios.get(apiUrl, { params });
      
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      logger.info(`Pagina succesvol opgehaald via Web Scraping API: ${url}`);
      return response.data;
    } catch (error) {
      logger.error(`Fout bij ophalen pagina via Web Scraping API: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Configureer Puppeteer browser met proxy
   * @param {object} options - Opties voor de browser
   * @returns {object} - Geconfigureerde browser opties
   */
  configurePuppeteerWithProxy(options = {}) {
    try {
      // Maak een kopie van de opties
      const browserOptions = { ...options };
      
      // Haal een willekeurige proxy op
      const proxy = this.getRandomProxy();
      
      if (proxy) {
        // Voeg proxy toe aan de browser argumenten
        browserOptions.args = browserOptions.args || [];
        browserOptions.args.push(`--proxy-server=${proxy.server}`);
        
        // Voeg authenticatie toe als nodig
        if (proxy.username && proxy.password) {
          browserOptions.proxyAuth = `${proxy.username}:${proxy.password}`;
        }
        
        logger.info(`Puppeteer geconfigureerd met proxy: ${proxy.server}`);
      }
      
      return browserOptions;
    } catch (error) {
      logger.error(`Fout bij configureren Puppeteer met proxy: ${error.message}`);
      return options;
    }
  }
};

export default proxyService;
