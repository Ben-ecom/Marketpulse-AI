/**
 * DecodoService.js
 * Service voor het uitvoeren van scraping requests via de Decodo API
 */

import { supabase } from '../utils/supabaseClient';

// Platform-specifieke configuraties
const PLATFORM_CONFIGS = {
  reddit: {
    headless: 'html',
    geo: 'us',
    locale: 'en-US',
    device_type: 'desktop',
  },
  amazon: {
    headless: 'html',
    geo: 'nl',
    locale: 'nl-NL',
    device_type: 'desktop',
  },
  instagram: {
    headless: 'html',
    geo: 'nl',
    locale: 'nl-NL',
    device_type: 'mobile',
  },
  tiktok: {
    headless: 'html',
    geo: 'nl',
    locale: 'nl-NL',
    device_type: 'mobile',
  },
  trustpilot: {
    headless: 'html',
    geo: 'nl',
    locale: 'nl-NL',
    device_type: 'desktop',
  }
};

/**
 * DecodoService klasse voor het uitvoeren van scraping requests
 */
class DecodoService {
  constructor() {
    // De Basic auth token uit de curl request
    this.apiKey = 'VTAwMDAyNjQzMzE6UFdfMWY3MmE3ZTY5NGUzMzlkYmE4MjczMGYwMDY5ZWE5ZWVk';
    this.baseUrl = 'https://scraper-api.decodo.com/v2';
    this.initialized = true;
  }

  /**
   * Initialiseer de service
   * 
   * We gebruiken nu een hardcoded API key, dus deze methode doet niet veel meer
   * maar we houden hem voor backward compatibility
   */
  async initialize() {
    // We zijn altijd geïnitialiseerd omdat we de API key hardcoded hebben
    return true;
  }

  /**
   * Voer een synchrone scraping request uit
   * @param {string} url - De URL om te scrapen
   * @param {string} platform - Het platform (reddit, amazon, etc.)
   * @param {Object} customParams - Aangepaste parameters die de standaardconfiguratie overschrijven
   * @returns {Promise<Object>} - De scraping resultaten
   */
  async scrapeSync(url, platform, customParams = {}) {
    await this.initialize();

    // Haal de platform-specifieke configuratie op
    const platformConfig = PLATFORM_CONFIGS[platform] || {};

    // Combineer de platform-specifieke configuratie met aangepaste parameters
    const params = {
      url,
      headless: customParams.headless || platformConfig.headless || 'html',
      geo: customParams.geo || platformConfig.geo || 'nl',
      locale: customParams.locale || platformConfig.locale || 'nl-NL',
      device_type: customParams.device_type || platformConfig.device_type || 'desktop',
      session_id: customParams.session_id || `${platform}_session_${new Date().getTime()}`
    };

    try {
      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Decodo API request failed: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fout bij het uitvoeren van synchrone scraping:', error);
      throw error;
    }
  }

  /**
   * Voer een asynchrone scraping request uit
   * @param {string} url - De URL om te scrapen
   * @param {string} platform - Het platform (reddit, amazon, etc.)
   * @param {Object} customParams - Aangepaste parameters die de standaardconfiguratie overschrijven
   * @returns {Promise<Object>} - De task ID voor het ophalen van resultaten
   */
  async scrapeAsync(url, platform, customParams = {}) {
    await this.initialize();

    // Haal de platform-specifieke configuratie op
    const platformConfig = PLATFORM_CONFIGS[platform] || {};

    // Combineer de platform-specifieke configuratie met aangepaste parameters
    const params = {
      url,
      headless: customParams.headless || platformConfig.headless || 'html',
      geo: customParams.geo || platformConfig.geo || 'nl',
      locale: customParams.locale || platformConfig.locale || 'nl-NL',
      device_type: customParams.device_type || platformConfig.device_type || 'desktop',
      session_id: customParams.session_id || `${platform}_session_${new Date().getTime()}`
    };

    try {
      const response = await fetch(`${this.baseUrl}/task`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Decodo API request failed: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fout bij het uitvoeren van asynchrone scraping:', error);
      throw error;
    }
  }

  /**
   * Voer een batch scraping request uit
   * @param {Array<Object>} tasks - Array van taken om uit te voeren
   * @returns {Promise<Object>} - De batch task ID voor het ophalen van resultaten
   */
  async scrapeBatch(tasks) {
    await this.initialize();

    // Bereid elke taak voor met de juiste platform-specifieke configuratie
    const preparedTasks = tasks.map(task => {
      const { url, platform, ...customParams } = task;
      const platformConfig = PLATFORM_CONFIGS[platform] || {};

      return {
        url,
        headless: customParams.headless || platformConfig.headless || 'html',
        geo: customParams.geo || platformConfig.geo || 'nl',
        locale: customParams.locale || platformConfig.locale || 'nl-NL',
        device_type: customParams.device_type || platformConfig.device_type || 'desktop',
        session_id: customParams.session_id || `${platform}_session_${new Date().getTime()}`
      };
    });

    try {
      const response = await fetch(`${this.baseUrl}/task/batch`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preparedTasks)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Decodo API batch request failed: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fout bij het uitvoeren van batch scraping:', error);
      throw error;
    }
  }

  /**
   * Haal de resultaten op van een asynchrone taak
   * @param {string} taskId - De task ID om resultaten voor op te halen
   * @returns {Promise<Object>} - De scraping resultaten
   */
  async getTaskResult(taskId) {
    await this.initialize();

    try {
      const response = await fetch(`${this.baseUrl}/task/${taskId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Decodo API task result request failed: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fout bij het ophalen van taakresultaten:', error);
      throw error;
    }
  }

  /**
   * Haal de resultaten op van een batch taak
   * @param {string} batchId - De batch ID om resultaten voor op te halen
   * @returns {Promise<Object>} - De batch scraping resultaten
   */
  async getBatchResult(batchId) {
    await this.initialize();

    try {
      const response = await fetch(`${this.baseUrl}/task/batch/${batchId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Decodo API batch result request failed: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fout bij het ophalen van batch resultaten:', error);
      throw error;
    }
  }

  /**
   * Sla scraping resultaten op in de database
   * @param {string} projectId - Het project ID
   * @param {string} platform - Het platform (reddit, amazon, etc.)
   * @param {string} contentType - Het type content (post, review, etc.)
   * @param {Object} rawData - De ruwe scraping data
   * @returns {Promise<Object>} - Het resultaat van de database operatie
   */
  async saveScrapingResults(projectId, platform, contentType, rawData) {
    try {
      // Maak eerst een scrape job aan
      const { data: scrapeJob, error: scrapeJobError } = await supabase
        .from('scrape_jobs')
        .insert({
          project_id: projectId,
          platform,
          status: 'completed',
          parameters: { platform },
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (scrapeJobError) {
        console.error('Fout bij het aanmaken van scrape job:', scrapeJobError);
        return { success: false, error: scrapeJobError };
      }

      // Sla de resultaten op
      const { data, error } = await supabase
        .from('scrape_results')
        .insert({
          scrape_job_id: scrapeJob.id,
          platform,
          content_type: contentType,
          raw_data: rawData,
          processed_data: null,
          sentiment: null
        });

      if (error) {
        console.error('Fout bij het opslaan van scraping resultaten:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Fout bij het opslaan van scraping resultaten:', error);
      return { success: false, error };
    }
  }
}

// Exporteer een singleton instance
export const decodoService = new DecodoService();

export default decodoService;
