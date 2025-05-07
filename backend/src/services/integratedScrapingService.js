import { logger } from '../utils/logger.js';
import { puppeteerService } from './puppeteerService.js';
import { scrapingApiService } from './scrapingApiService.js';
import dotenv from 'dotenv';

// Laad omgevingsvariabelen
dotenv.config();

/**
 * Geïntegreerde scraping service die verschillende methoden combineert
 * Kiest automatisch de beste methode op basis van configuratie en beschikbaarheid
 */
class IntegratedScrapingService {
  constructor() {
    // Bepaal prioriteit van scraping methoden
    this.apiPriority = process.env.SCRAPING_API_PRIORITY || 'medium';
    this.useApi = process.env.USE_SCRAPING_API === 'true';
    this.usePuppeteer = process.env.USE_PUPPETEER === 'true';
    
    // Statistieken
    this.stats = {
      totalRequests: 0,
      apiRequests: 0,
      puppeteerRequests: 0,
      apiSuccesses: 0,
      puppeteerSuccesses: 0,
      apiFailures: 0,
      puppeteerFailures: 0
    };
  }
  
  /**
   * Bepaal de volgorde van scraping methoden op basis van configuratie
   * @returns {Array<string>} - Array van methoden in volgorde van prioriteit
   */
  getMethodOrder() {
    if (!this.useApi) return ['puppeteer'];
    if (!this.usePuppeteer) return ['api'];
    
    switch (this.apiPriority.toLowerCase()) {
      case 'high':
        return ['api', 'puppeteer'];
      case 'low':
        return ['puppeteer', 'api'];
      case 'medium':
      default:
        return ['puppeteer', 'api'];
    }
  }
  
  /**
   * Scrape TikTok video's met de beste beschikbare methode
   * @param {string} keyword - Zoekwoord voor video's
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Array>} - Array met TikTok video gegevens
   */
  async scrapeTikTokVideos(keyword, options = {}) {
    this.stats.totalRequests++;
    logger.info(`Integrated Scraping: TikTok video's ophalen voor keyword: ${keyword}`);
    
    const methodOrder = this.getMethodOrder();
    let result = null;
    let error = null;
    
    for (const method of methodOrder) {
      try {
        if (method === 'api' && this.useApi) {
          logger.info(`Proberen via Scraping API...`);
          this.stats.apiRequests++;
          
          result = await scrapingApiService.scrapeTikTokVideos(keyword, options);
          
          if (result) {
            this.stats.apiSuccesses++;
            logger.info(`Scraping API succesvol voor TikTok video's`);
            return result;
          }
        } else if (method === 'puppeteer' && this.usePuppeteer) {
          logger.info(`Proberen via Puppeteer...`);
          this.stats.puppeteerRequests++;
          
          result = await puppeteerService.scrapeTikTokVideos(keyword, options);
          
          if (result && result.length > 0) {
            this.stats.puppeteerSuccesses++;
            logger.info(`Puppeteer succesvol voor TikTok video's`);
            return result;
          } else {
            this.stats.puppeteerFailures++;
            logger.warn(`Puppeteer leverde geen resultaten voor TikTok video's`);
          }
        }
      } catch (err) {
        error = err;
        if (method === 'api') {
          this.stats.apiFailures++;
          logger.error(`Scraping API fout voor TikTok: ${err.message}`);
        } else {
          this.stats.puppeteerFailures++;
          logger.error(`Puppeteer fout voor TikTok: ${err.message}`);
        }
      }
    }
    
    // Als we hier komen, zijn alle methoden gefaald
    if (error) {
      logger.error(`Alle scraping methoden gefaald voor TikTok video's: ${error.message}`);
    } else {
      logger.error(`Alle scraping methoden gefaald voor TikTok video's: Geen resultaten`);
    }
    
    return [];
  }
  
  /**
   * Scrape Instagram posts met de beste beschikbare methode
   * @param {string} hashtag - Hashtag voor posts
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Array>} - Array met Instagram post gegevens
   */
  async scrapeInstagramPosts(hashtag, options = {}) {
    this.stats.totalRequests++;
    logger.info(`Integrated Scraping: Instagram posts ophalen voor hashtag: ${hashtag}`);
    
    const methodOrder = this.getMethodOrder();
    let result = null;
    let error = null;
    
    for (const method of methodOrder) {
      try {
        if (method === 'api' && this.useApi) {
          logger.info(`Proberen via Scraping API...`);
          this.stats.apiRequests++;
          
          result = await scrapingApiService.scrapeInstagramPosts(hashtag, options);
          
          if (result) {
            this.stats.apiSuccesses++;
            logger.info(`Scraping API succesvol voor Instagram posts`);
            return result;
          }
        } else if (method === 'puppeteer' && this.usePuppeteer) {
          logger.info(`Proberen via Puppeteer...`);
          this.stats.puppeteerRequests++;
          
          result = await puppeteerService.scrapeInstagramPosts(hashtag, options);
          
          if (result && result.length > 0) {
            this.stats.puppeteerSuccesses++;
            logger.info(`Puppeteer succesvol voor Instagram posts`);
            return result;
          } else {
            this.stats.puppeteerFailures++;
            logger.warn(`Puppeteer leverde geen resultaten voor Instagram posts`);
          }
        }
      } catch (err) {
        error = err;
        if (method === 'api') {
          this.stats.apiFailures++;
          logger.error(`Scraping API fout voor Instagram: ${err.message}`);
        } else {
          this.stats.puppeteerFailures++;
          logger.error(`Puppeteer fout voor Instagram: ${err.message}`);
        }
      }
    }
    
    // Als we hier komen, zijn alle methoden gefaald
    if (error) {
      logger.error(`Alle scraping methoden gefaald voor Instagram posts: ${error.message}`);
    } else {
      logger.error(`Alle scraping methoden gefaald voor Instagram posts: Geen resultaten`);
    }
    
    return [];
  }
  
  /**
   * Scrape Trustpilot reviews met de beste beschikbare methode
   * @param {string} companyName - Naam van het bedrijf
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Object>} - Object met bedrijfsinfo en reviews
   */
  async scrapeTrustpilotReviews(companyName, options = {}) {
    this.stats.totalRequests++;
    logger.info(`Integrated Scraping: Trustpilot reviews ophalen voor bedrijf: ${companyName}`);
    
    const methodOrder = this.getMethodOrder();
    let result = null;
    let error = null;
    
    for (const method of methodOrder) {
      try {
        if (method === 'api' && this.useApi) {
          logger.info(`Proberen via Scraping API...`);
          this.stats.apiRequests++;
          
          result = await scrapingApiService.scrapeTrustpilotReviews(companyName, options);
          
          if (result) {
            this.stats.apiSuccesses++;
            logger.info(`Scraping API succesvol voor Trustpilot reviews`);
            return result;
          }
        } else if (method === 'puppeteer' && this.usePuppeteer) {
          logger.info(`Proberen via Puppeteer...`);
          this.stats.puppeteerRequests++;
          
          result = await puppeteerService.scrapeTrustpilotReviews(companyName, options);
          
          if (result && result.reviews && result.reviews.length > 0) {
            this.stats.puppeteerSuccesses++;
            logger.info(`Puppeteer succesvol voor Trustpilot reviews`);
            return result;
          } else {
            this.stats.puppeteerFailures++;
            logger.warn(`Puppeteer leverde geen resultaten voor Trustpilot reviews`);
          }
        }
      } catch (err) {
        error = err;
        if (method === 'api') {
          this.stats.apiFailures++;
          logger.error(`Scraping API fout voor Trustpilot: ${err.message}`);
        } else {
          this.stats.puppeteerFailures++;
          logger.error(`Puppeteer fout voor Trustpilot: ${err.message}`);
        }
      }
    }
    
    // Als we hier komen, zijn alle methoden gefaald
    if (error) {
      logger.error(`Alle scraping methoden gefaald voor Trustpilot reviews: ${error.message}`);
    } else {
      logger.error(`Alle scraping methoden gefaald voor Trustpilot reviews: Geen resultaten`);
    }
    
    return { companyName, rating: 0, reviewCount: 0, reviews: [] };
  }
  
  /**
   * Scrape Reddit posts met de beste beschikbare methode
   * @param {string} query - Zoekwoord of subreddit naam
   * @param {boolean} isSubreddit - Of de query een subreddit naam is
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Array>} - Array met Reddit posts
   */
  async scrapeRedditPosts(query, isSubreddit = false, options = {}) {
    this.stats.totalRequests++;
    logger.info(`Integrated Scraping: Reddit posts ophalen voor ${isSubreddit ? 'subreddit' : 'zoekwoord'}: ${query}`);
    
    const methodOrder = this.getMethodOrder();
    let result = null;
    let error = null;
    
    for (const method of methodOrder) {
      try {
        if (method === 'api' && this.useApi) {
          logger.info(`Proberen via Scraping API...`);
          this.stats.apiRequests++;
          
          result = await scrapingApiService.scrapeRedditPosts(query, isSubreddit, options);
          
          if (result) {
            this.stats.apiSuccesses++;
            logger.info(`Scraping API succesvol voor Reddit posts`);
            return result;
          }
        } else if (method === 'puppeteer' && this.usePuppeteer) {
          logger.info(`Proberen via Puppeteer...`);
          this.stats.puppeteerRequests++;
          
          // Puppeteer implementatie voor Reddit is nog niet beschikbaar
          // Hier zou je puppeteerService.scrapeRedditPosts kunnen aanroepen als het beschikbaar is
          logger.warn(`Puppeteer implementatie voor Reddit is nog niet beschikbaar`);
          this.stats.puppeteerFailures++;
        }
      } catch (err) {
        error = err;
        if (method === 'api') {
          this.stats.apiFailures++;
          logger.error(`Scraping API fout voor Reddit: ${err.message}`);
        } else {
          this.stats.puppeteerFailures++;
          logger.error(`Puppeteer fout voor Reddit: ${err.message}`);
        }
      }
    }
    
    // Als we hier komen, zijn alle methoden gefaald
    if (error) {
      logger.error(`Alle scraping methoden gefaald voor Reddit posts: ${error.message}`);
    } else {
      logger.error(`Alle scraping methoden gefaald voor Reddit posts: Geen resultaten`);
    }
    
    return [];
  }
  
  /**
   * Scrape Amazon product details met de beste beschikbare methode
   * @param {string} productId - Amazon product ID (ASIN)
   * @param {string} countryCode - Amazon landcode (bijv. 'nl', 'de', 'com')
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Object>} - Object met product details
   */
  async scrapeAmazonProduct(productId, countryCode = 'nl', options = {}) {
    this.stats.totalRequests++;
    logger.info(`Integrated Scraping: Amazon product ophalen: ${productId} van amazon.${countryCode}`);
    
    const methodOrder = this.getMethodOrder();
    let result = null;
    let error = null;
    
    for (const method of methodOrder) {
      try {
        if (method === 'api' && this.useApi) {
          logger.info(`Proberen via Scraping API...`);
          this.stats.apiRequests++;
          
          result = await scrapingApiService.scrapeAmazonProduct(productId, countryCode, options);
          
          if (result) {
            this.stats.apiSuccesses++;
            logger.info(`Scraping API succesvol voor Amazon product`);
            return result;
          }
        } else if (method === 'puppeteer' && this.usePuppeteer) {
          logger.info(`Proberen via Puppeteer...`);
          this.stats.puppeteerRequests++;
          
          // Puppeteer implementatie voor Amazon is nog niet beschikbaar
          // Hier zou je puppeteerService.scrapeAmazonProduct kunnen aanroepen als het beschikbaar is
          logger.warn(`Puppeteer implementatie voor Amazon is nog niet beschikbaar`);
          this.stats.puppeteerFailures++;
        }
      } catch (err) {
        error = err;
        if (method === 'api') {
          this.stats.apiFailures++;
          logger.error(`Scraping API fout voor Amazon product: ${err.message}`);
        } else {
          this.stats.puppeteerFailures++;
          logger.error(`Puppeteer fout voor Amazon product: ${err.message}`);
        }
      }
    }
    
    // Als we hier komen, zijn alle methoden gefaald
    if (error) {
      logger.error(`Alle scraping methoden gefaald voor Amazon product: ${error.message}`);
    } else {
      logger.error(`Alle scraping methoden gefaald voor Amazon product: Geen resultaten`);
    }
    
    return { productId, title: '', price: '', rating: 0, reviewCount: 0, available: false };
  }
  
  /**
   * Scrape Amazon product reviews met de beste beschikbare methode
   * @param {string} productId - Amazon product ID (ASIN)
   * @param {string} countryCode - Amazon landcode (bijv. 'nl', 'de', 'com')
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Object>} - Object met product reviews
   */
  async scrapeAmazonReviews(productId, countryCode = 'nl', options = {}) {
    this.stats.totalRequests++;
    logger.info(`Integrated Scraping: Amazon reviews ophalen voor product: ${productId} van amazon.${countryCode}`);
    
    const methodOrder = this.getMethodOrder();
    let result = null;
    let error = null;
    
    for (const method of methodOrder) {
      try {
        if (method === 'api' && this.useApi) {
          logger.info(`Proberen via Scraping API...`);
          this.stats.apiRequests++;
          
          result = await scrapingApiService.scrapeAmazonReviews(productId, countryCode, options);
          
          if (result) {
            this.stats.apiSuccesses++;
            logger.info(`Scraping API succesvol voor Amazon reviews`);
            return result;
          }
        } else if (method === 'puppeteer' && this.usePuppeteer) {
          logger.info(`Proberen via Puppeteer...`);
          this.stats.puppeteerRequests++;
          
          // Puppeteer implementatie voor Amazon reviews is nog niet beschikbaar
          // Hier zou je puppeteerService.scrapeAmazonReviews kunnen aanroepen als het beschikbaar is
          logger.warn(`Puppeteer implementatie voor Amazon reviews is nog niet beschikbaar`);
          this.stats.puppeteerFailures++;
        }
      } catch (err) {
        error = err;
        if (method === 'api') {
          this.stats.apiFailures++;
          logger.error(`Scraping API fout voor Amazon reviews: ${err.message}`);
        } else {
          this.stats.puppeteerFailures++;
          logger.error(`Puppeteer fout voor Amazon reviews: ${err.message}`);
        }
      }
    }
    
    // Als we hier komen, zijn alle methoden gefaald
    if (error) {
      logger.error(`Alle scraping methoden gefaald voor Amazon reviews: ${error.message}`);
    } else {
      logger.error(`Alle scraping methoden gefaald voor Amazon reviews: Geen resultaten`);
    }
    
    return { productId, rating: 0, reviewCount: 0, reviews: [] };
  }
  
  /**
   * Scrape Amazon zoekresultaten met de beste beschikbare methode
   * @param {string} keyword - Zoekwoord
   * @param {string} countryCode - Amazon landcode (bijv. 'nl', 'de', 'com')
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Array>} - Array met zoekresultaten
   */
  async scrapeAmazonSearch(keyword, countryCode = 'nl', options = {}) {
    this.stats.totalRequests++;
    logger.info(`Integrated Scraping: Amazon zoekresultaten ophalen voor: ${keyword} op amazon.${countryCode}`);
    
    const methodOrder = this.getMethodOrder();
    let result = null;
    let error = null;
    
    for (const method of methodOrder) {
      try {
        if (method === 'api' && this.useApi) {
          logger.info(`Proberen via Scraping API...`);
          this.stats.apiRequests++;
          
          result = await scrapingApiService.scrapeAmazonSearch(keyword, countryCode, options);
          
          if (result) {
            this.stats.apiSuccesses++;
            logger.info(`Scraping API succesvol voor Amazon zoekresultaten`);
            return result;
          }
        } else if (method === 'puppeteer' && this.usePuppeteer) {
          logger.info(`Proberen via Puppeteer...`);
          this.stats.puppeteerRequests++;
          
          // Puppeteer implementatie voor Amazon zoekresultaten is nog niet beschikbaar
          // Hier zou je puppeteerService.scrapeAmazonSearch kunnen aanroepen als het beschikbaar is
          logger.warn(`Puppeteer implementatie voor Amazon zoekresultaten is nog niet beschikbaar`);
          this.stats.puppeteerFailures++;
        }
      } catch (err) {
        error = err;
        if (method === 'api') {
          this.stats.apiFailures++;
          logger.error(`Scraping API fout voor Amazon zoekresultaten: ${err.message}`);
        } else {
          this.stats.puppeteerFailures++;
          logger.error(`Puppeteer fout voor Amazon zoekresultaten: ${err.message}`);
        }
      }
    }
    
    // Als we hier komen, zijn alle methoden gefaald
    if (error) {
      logger.error(`Alle scraping methoden gefaald voor Amazon zoekresultaten: ${error.message}`);
    } else {
      logger.error(`Alle scraping methoden gefaald voor Amazon zoekresultaten: Geen resultaten`);
    }
    
    return [];
  }
  
  /**
   * Krijg statistieken over scraping gebruik
   * @returns {object} - Statistieken
   */
  getStats() {
    const apiSuccessRate = this.stats.apiRequests > 0 
      ? (this.stats.apiSuccesses / this.stats.apiRequests) * 100 
      : 0;
      
    const puppeteerSuccessRate = this.stats.puppeteerRequests > 0 
      ? (this.stats.puppeteerSuccesses / this.stats.puppeteerRequests) * 100 
      : 0;
      
    const overallSuccessRate = this.stats.totalRequests > 0
      ? ((this.stats.apiSuccesses + this.stats.puppeteerSuccesses) / this.stats.totalRequests) * 100
      : 0;
    
    return {
      ...this.stats,
      apiSuccessRate: Math.round(apiSuccessRate * 100) / 100,
      puppeteerSuccessRate: Math.round(puppeteerSuccessRate * 100) / 100,
      overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
      apiPriority: this.apiPriority,
      methodOrder: this.getMethodOrder(),
      apiEnabled: this.useApi,
      puppeteerEnabled: this.usePuppeteer
    };
  }
}

// Singleton instantie
export const integratedScrapingService = new IntegratedScrapingService();

export default integratedScrapingService;
