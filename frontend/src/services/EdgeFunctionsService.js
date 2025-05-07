/**
 * EdgeFunctionsService.js
 * Service voor het communiceren met Supabase Edge Functions
 */

import { supabase } from '../utils/supabaseClient';

/**
 * EdgeFunctionsService klasse voor het aanroepen van Supabase Edge Functions
 */
class EdgeFunctionsService {
  constructor() {
    this.supabaseUrl = 'https://iyeyypnvcickhdlqvhqq.supabase.co';
    this.initialized = true;
  }

  /**
   * Roept de decodo-scraper Edge Function aan
   * @param {Object} params - Parameters voor de functie
   * @returns {Promise<Object>} - Het resultaat van de functie
   */
  async callDecodoScraper(params) {
    try {
      const { data, error } = await supabase.functions.invoke('decodo-scraper', {
        body: params
      });

      if (error) {
        console.error('Fout bij het aanroepen van decodo-scraper functie:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Fout bij het aanroepen van decodo-scraper functie:', error);
      throw error;
    }
  }

  /**
   * Voert een synchrone scraping request uit via de Edge Function
   * @param {string} url - De URL om te scrapen
   * @param {string} platform - Het platform (reddit, amazon, etc.)
   * @param {string} projectId - Optioneel project ID om resultaten op te slaan
   * @param {string} contentType - Type content (post, review, etc.)
   * @param {Object} customParams - Aangepaste parameters die de standaardconfiguratie overschrijven
   * @returns {Promise<Object>} - De scraping resultaten
   */
  async scrapeSynchronous(url, platform, projectId = null, contentType = 'page', customParams = {}) {
    return this.callDecodoScraper({
      action: 'scrape_sync',
      url,
      platform,
      projectId,
      contentType,
      customParams
    });
  }

  /**
   * Voert een asynchrone scraping request uit via de Edge Function
   * @param {string} url - De URL om te scrapen
   * @param {string} platform - Het platform (reddit, amazon, etc.)
   * @param {Object} customParams - Aangepaste parameters die de standaardconfiguratie overschrijven
   * @returns {Promise<Object>} - De task ID voor het ophalen van resultaten
   */
  async scrapeAsynchronous(url, platform, customParams = {}) {
    return this.callDecodoScraper({
      action: 'scrape_async',
      url,
      platform,
      customParams
    });
  }

  /**
   * Voert een batch scraping request uit via de Edge Function
   * @param {Array<Object>} tasks - Array van taken om uit te voeren
   * @returns {Promise<Object>} - De batch task ID voor het ophalen van resultaten
   */
  async scrapeBatch(tasks) {
    return this.callDecodoScraper({
      action: 'scrape_batch',
      tasks
    });
  }

  /**
   * Haalt de resultaten op van een asynchrone taak via de Edge Function
   * @param {string} taskId - De task ID om resultaten voor op te halen
   * @param {string} projectId - Optioneel project ID om resultaten op te slaan
   * @param {string} platform - Het platform (reddit, amazon, etc.)
   * @param {string} contentType - Type content (post, review, etc.)
   * @returns {Promise<Object>} - De scraping resultaten
   */
  async getTaskResult(taskId, projectId = null, platform = null, contentType = 'page') {
    return this.callDecodoScraper({
      action: 'get_task_result',
      taskId,
      projectId,
      platform,
      contentType
    });
  }

  /**
   * Haalt de resultaten op van een batch taak via de Edge Function
   * @param {string} batchId - De batch ID om resultaten voor op te halen
   * @returns {Promise<Object>} - De batch scraping resultaten
   */
  async getBatchResult(batchId) {
    return this.callDecodoScraper({
      action: 'get_batch_result',
      batchId
    });
  }

  /**
   * Slaat scraping resultaten direct op in de database via de Edge Function
   * @param {string} projectId - Het project ID
   * @param {string} platform - Het platform (reddit, amazon, etc.)
   * @param {string} contentType - Het type content (post, review, etc.)
   * @param {Object} data - De data om op te slaan
   * @returns {Promise<Object>} - Het resultaat van de database operatie
   */
  async saveScrapingResults(projectId, platform, contentType, data) {
    return this.callDecodoScraper({
      action: 'save_results',
      projectId,
      platform,
      contentType,
      data
    });
  }

  /**
   * Roept de generate-recommendations Edge Function aan
   * @param {Object} params - Parameters voor de functie
   * @returns {Promise<Object>} - Het resultaat van de functie
   */
  async callGenerateRecommendations(params) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: params
      });

      if (error) {
        console.error('Fout bij het aanroepen van generate-recommendations functie:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Fout bij het aanroepen van generate-recommendations functie:', error);
      throw error;
    }
  }

  /**
   * Genereert aanbevelingen op basis van scraping resultaten
   * @param {string} projectId - Het project ID
   * @returns {Promise<Object>} - De gegenereerde aanbevelingen
   */
  async generateRecommendations(projectId) {
    return this.callGenerateRecommendations({
      action: 'generate_recommendations',
      projectId
    });
  }

  /**
   * Genereert aanbevelingen voor de 5 awareness fasen van Eugene Schwartz
   * @param {string} projectId - Het project ID
   * @returns {Promise<Object>} - De gegenereerde awareness fase aanbevelingen
   */
  async generateAwarenessRecommendations(projectId) {
    return this.callGenerateRecommendations({
      action: 'generate_awareness_recommendations',
      projectId
    });
  }
}

// Exporteer een singleton instance
export const edgeFunctionsService = new EdgeFunctionsService();

export default edgeFunctionsService;
