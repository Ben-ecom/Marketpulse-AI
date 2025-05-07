const browserService = require('../services/browser');
const queueService = require('../services/queue');
const errorHandler = require('../services/errorHandler');
const { getLogger } = require('../utils/logger');
const AWS = require('aws-sdk');

// Initialiseer S3 client voor data opslag
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'eu-west-1',
  ...(process.env.IS_OFFLINE && {
    endpoint: 'http://localhost:4569',
    s3ForcePathStyle: true,
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  })
});

// Bucket naam voor opslag van gescrapete data
const BUCKET_NAME = process.env.SCRAPED_DATA_BUCKET || 'marketpulse-ai-scraper-dev-data';

/**
 * Basis scraper handler die gemeenschappelijke functionaliteit biedt voor alle platform-specifieke scrapers
 */
class ScraperHandler {
  constructor(platform) {
    this.platform = platform;
    this.logger = getLogger(`${platform}Scraper`);
    this.browser = null;
    this.page = null;
  }

  /**
   * Verwerkt een SQS bericht en voert de scraping taak uit
   * @param {Object} event - AWS Lambda event object
   * @returns {Promise<Object>} - Resultaat van de scraping taak
   */
  async handleMessage(event) {
    this.logger.info(`Verwerken van ${this.platform} scraping taak`);
    
    if (!event.Records || event.Records.length === 0) {
      throw new Error('Geen records gevonden in event');
    }
    
    const record = event.Records[0];
    let job;
    
    try {
      job = JSON.parse(record.body);
      this.logger.info(`Job ontvangen: ${job.id} (${job.source})`);
      
      // Valideer dat de job voor dit platform is
      if (job.source !== this.platform) {
        throw new Error(`Verkeerde job source: ${job.source}, verwacht: ${this.platform}`);
      }
      
      // Initialiseer browser met stealth mode en proxy
      this.browser = await browserService.launch();
      this.page = await browserService.newPage();
      
      // Voer platform-specifieke scraping uit met automatische retries
      const result = await errorHandler.withRetry(
        async (attempt) => {
          // Als dit niet de eerste poging is, controleer of we een nieuwe proxy nodig hebben
          if (attempt > 0) {
            await browserService.rotateProxyIfNeeded();
            // Maak een nieuwe pagina aan als de vorige mogelijk corrupt is
            if (this.page) {
              try {
                await this.page.close();
              } catch (e) {
                this.logger.warn(`Fout bij sluiten van pagina: ${e.message}`);
              }
            }
            this.page = await browserService.newPage();
          }
          
          // Voer de platform-specifieke scraping uit
          return await this.scrape(job.params);
        },
        {
          maxRetries: 5,
          retryCondition: (error, attempt) => {
            // Controleer of de fout proxy-gerelateerd is
            const proxyError = errorHandler.handleProxyError(
              error, 
              browserService.currentProxy
            );
            
            // Als het een proxy fout is, hebben we al een nieuwe proxy aangevraagd
            return proxyError || errorHandler.isRetryableError(error);
          },
          onRetry: async (error, attempt, delay) => {
            this.logger.warn(`Poging ${attempt + 1} mislukt: ${error.message}. Wachten ${delay}ms voor nieuwe poging.`);
          }
        }
      );
      
      // Sla de gescrapete data op in S3
      const key = `${this.platform}/${job.id}/${new Date().toISOString()}.json`;
      await this.storeResult(key, result);
      
      this.logger.info(`Scraping taak succesvol voltooid: ${job.id}`);
      
      return {
        jobId: job.id,
        platform: this.platform,
        status: 'success',
        resultKey: key,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Fout bij verwerken van job: ${error.message}`);
      
      // Sla de fout op voor debugging
      if (job && job.id) {
        const errorKey = `errors/${this.platform}/${job.id}/${new Date().toISOString()}.json`;
        await this.storeResult(errorKey, {
          error: error.message,
          stack: error.stack,
          jobId: job.id,
          platform: this.platform,
          timestamp: new Date().toISOString()
        });
      }
      
      throw error;
    } finally {
      // Ruim resources op
      if (this.page) {
        try {
          await this.page.close();
        } catch (e) {
          this.logger.warn(`Fout bij sluiten van pagina: ${e.message}`);
        }
        this.page = null;
      }
      
      if (this.browser) {
        await browserService.close();
        this.browser = null;
      }
    }
  }
  
  /**
   * Platform-specifieke scraping implementatie
   * @param {Object} params - Scraping parameters
   * @returns {Promise<Object>} - Gescrapete data
   */
  async scrape(params) {
    throw new Error('scrape() moet worden geïmplementeerd door subklassen');
  }
  
  /**
   * Slaat het scraping resultaat op in S3
   * @param {String} key - S3 object key
   * @param {Object} data - Data om op te slaan
   * @returns {Promise<Object>} - S3 response
   */
  async storeResult(key, data) {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(data, null, 2),
        ContentType: 'application/json'
      };
      
      this.logger.info(`Data opslaan in S3: ${key}`);
      return await s3.putObject(params).promise();
    } catch (error) {
      this.logger.error(`Fout bij opslaan van data in S3: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ScraperHandler;
