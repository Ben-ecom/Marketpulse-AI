/**
 * Scraping Service Index
 *
 * Dit bestand exporteert alle scraping functionaliteit vanuit één centraal punt.
 */

const { getDecodoApiClient } = require('./decodo-api');
const { getJobQueueService, JOB_STATUS, JOB_PRIORITY } = require('./job-queue');
const { scrapers, getScraper } = require('./platforms');

// Controleer of we in ontwikkelingsmodus zijn of geen API key hebben
const isDevelopment = process.env.NODE_ENV === 'development';
const hasApiKey = !!process.env.DECODO_API_KEY;

// Definieer de ScrapingService
const ScrapingService = {
  // Gebruik mock implementatie in ontwikkelingsmodus of wanneer er geen API key is
  useMock: isDevelopment || !hasApiKey,
  
  // Decodo API client (wordt niet gebruikt in mock modus)
  api: null,

  // Job queue service
  jobQueue: getJobQueueService(),

  // Platform-specifieke scrapers
  platforms: scrapers,
  
  // Initialiseer de service
  init() {
    if (!this.useMock) {
      this.api = getDecodoApiClient();
    } else {
      console.log('🔧 Gebruik mock scraping service voor testdoeleinden');
    }
    return this;
  },

  // Helper functies

  /**
   * Start de job queue processor
   * @param {Number} interval - Interval in milliseconden
   */
  startJobProcessor(interval = 10000) {
    this.jobQueue.startProcessing(interval);
  },

  /**
   * Stop de job queue processor
   */
  stopJobProcessor() {
    this.jobQueue.stopProcessing();
  },

  /**
   * Genereer mock data voor verschillende jobTypes
   * @param {String} platform - Platform (amazon, instagram, etc.)
   * @param {String} projectId - Project ID
   * @param {String} jobType - Type job (product, search, etc.)
   * @param {Array<String>} urls - URLs om te scrapen
   * @returns {Object} - Mock data
   */
  _generateMockData(platform, projectId, jobType, urls) {
    const { v4: uuidv4 } = require('uuid');
    const jobId = uuidv4();
    const now = new Date().toISOString();
    
    // Basis mock data
    const mockData = {
      id: jobId,
      projectId,
      platform,
      jobType,
      status: 'completed',
      createdAt: now,
      updatedAt: now,
      results: []
    };
    
    // Voeg mock resultaten toe op basis van jobType
    switch (jobType) {
      case 'product':
        mockData.results = urls.map(url => ({
          url,
          title: `Product op ${platform} - ${url.split('/').pop()}`,
          price: Math.floor(Math.random() * 10000) / 100,
          currency: 'EUR',
          rating: (Math.random() * 5).toFixed(1),
          reviewCount: Math.floor(Math.random() * 1000),
          description: 'Dit is een voorbeeld productbeschrijving voor mock data.',
          features: [
            'Kenmerk 1: Hoge kwaliteit',
            'Kenmerk 2: Duurzaam materiaal',
            'Kenmerk 3: Eenvoudig in gebruik'
          ],
          images: [
            `https://example.com/images/${platform}/product1.jpg`,
            `https://example.com/images/${platform}/product2.jpg`
          ]
        }));
        break;
        
      case 'search':
        mockData.results = Array.from({ length: 5 }, (_, i) => ({
          url: `https://${platform}.com/product-${i + 1}`,
          title: `Zoekresultaat ${i + 1} voor ${urls[0]}`,
          price: Math.floor(Math.random() * 10000) / 100,
          currency: 'EUR',
          position: i + 1
        }));
        break;
        
      case 'reviews':
        mockData.results = Array.from({ length: 10 }, (_, i) => ({
          id: uuidv4(),
          rating: Math.floor(Math.random() * 5) + 1,
          title: `Review ${i + 1}`,
          content: `Dit is een voorbeeld review tekst voor mock data. Deze review is ${Math.random() > 0.7 ? 'positief' : 'negatief'}.`,
          author: `Gebruiker${Math.floor(Math.random() * 1000)}`,
          date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
          verified: Math.random() > 0.3
        }));
        break;
        
      default:
        mockData.results = urls.map(url => ({
          url,
          content: `Mock data voor ${url}`,
          timestamp: now
        }));
    }
    
    return mockData;
  },

  /**
   * Maak een nieuwe scrape job aan
   * @param {String} platform - Platform (amazon, instagram, etc.)
   * @param {String} projectId - Project ID
   * @param {String} jobType - Type job (product, search, etc.)
   * @param {Array<String>} urls - URLs om te scrapen
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createJob(platform, projectId, jobType, urls, options = {}) {
    try {
      // Gebruik mock data in ontwikkelingsmodus of wanneer er geen API key is
      if (this.useMock) {
        console.log(`🔄 [MOCK] Scrape job aangemaakt voor ${platform}, type: ${jobType}`);
        return this._generateMockData(platform, projectId, jobType, urls);
      }
      
      const scraper = getScraper(platform);

      switch (jobType) {
        case 'product':
          return await scraper.createProductScrapeJob(projectId, urls, options);
        case 'search':
          return await scraper.createSearchScrapeJob(projectId, urls, options);
        case 'review':
          return await scraper.createReviewScrapeJob(projectId, urls, options);
        default:
          throw new Error(`Onbekend job type: ${jobType}`);
      }
    } catch (error) {
      console.error(`❌ Fout bij aanmaken van scrape job (${platform}, ${jobType}):`, error);
      throw error;
    }
  },

  /**
   * Haal een job op
   * @param {String} jobId - Job ID
   * @returns {Promise<Object>} - Job
   */
  async getJob(jobId) {
    return await this.jobQueue.getJob(jobId);
  },

  /**
   * Haal jobs op voor een project
   * @param {String} projectId - Project ID
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} - Jobs
   */
  async getJobsByProject(projectId, filters = {}) {
    return await this.jobQueue.getJobsByProject(projectId, filters);
  },

  /**
   * Annuleer een job
   * @param {String} jobId - Job ID
   * @returns {Promise<Object>} - Geannuleerde job
   */
  async cancelJob(jobId) {
    return await this.jobQueue.cancelJob(jobId);
  },

  /**
   * Haal resultaten op voor een job
   * @param {String} jobId - Job ID
   * @returns {Promise<Array>} - Resultaten
   */
  async getJobResults(jobId) {
    return await this.jobQueue.getJobResults(jobId);
  },

  /**
   * Haal statistieken op voor een project
   * @param {String} projectId - Project ID
   * @returns {Promise<Object>} - Statistieken
   */
  async getProjectStats(projectId) {
    return await this.jobQueue.getProjectStats(projectId);
  },
};

// Initialiseer de ScrapingService
ScrapingService.init();

// Exporteer alle modules
module.exports = {
  getDecodoApiClient,
  getJobQueueService,
  JOB_STATUS,
  JOB_PRIORITY,
  scrapers,
  getScraper,
  ScrapingService,
};

module.exports.ScrapingService = ScrapingService;
