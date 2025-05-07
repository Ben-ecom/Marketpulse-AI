const axios = require('axios');
const logger = require('../utils/logger');

/**
 * DecodoApiService - Service voor het uitvoeren van scraping requests via de Decodo Scraping API
 */
class DecodoApiService {
  constructor() {
    this.apiKey = process.env.DECODO_API_KEY;
    this.baseUrl = 'https://scraper-api.decodo.com/v2/scrape';
    
    if (!this.apiKey && process.env.NODE_ENV !== 'development') {
      logger.warn('DECODO_API_KEY is niet geconfigureerd, API calls zullen mislukken');
    }
  }
  
  /**
   * Voert een scraping request uit via de Decodo API
   * @param {Object} options - Scraping opties
   * @param {String} options.url - URL om te scrapen
   * @param {String} options.headless - Rendering mode ('html' of 'browser')
   * @param {String} options.geo - Locatie voor geo-targeting
   * @param {String} options.locale - Taal voor de request
   * @param {String} options.device_type - Type apparaat en browser
   * @param {String} options.session_id - Sessie ID voor het hergebruiken van sessies
   * @param {Object} options.headers - Custom headers
   * @param {Object} options.cookies - Custom cookies
   * @returns {Promise<Object>} - Response data
   */
  async scrape(options) {
    const {
      url,
      headless = 'html',
      geo,
      locale,
      device_type,
      session_id,
      headers,
      cookies
    } = options;
    
    if (!url) {
      throw new Error('URL is vereist voor scraping');
    }
    
    logger.info(`Scraping request uitvoeren voor URL: ${url}`);
    
    try {
      // Stel request opties samen
      const requestData = {
        url,
        headless
      };
      
      // Voeg optionele parameters toe indien aanwezig
      if (geo) requestData.geo = geo;
      if (locale) requestData.locale = locale;
      if (device_type) requestData.device_type = device_type;
      if (session_id) requestData.session_id = session_id;
      if (headers) requestData.headers = headers;
      if (cookies) requestData.cookies = cookies;
      
      // Voer de API request uit
      const response = await axios({
        method: 'POST',
        url: this.baseUrl,
        headers: {
          'Accept': 'application/json',
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        data: requestData,
        timeout: 60000 // 60 seconden timeout
      });
      
      logger.info(`Scraping request succesvol voor URL: ${url}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        // De request is voltooid maar de server antwoordde met een error status
        logger.error(`API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
        throw new Error(`Decodo API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // De request is gedaan maar er is geen response ontvangen
        logger.error(`Geen response ontvangen: ${error.message}`);
        throw new Error(`Geen response van Decodo API: ${error.message}`);
      } else {
        // Er is iets misgegaan bij het opzetten van de request
        logger.error(`Request error: ${error.message}`);
        throw error;
      }
    }
  }
  
  /**
   * Voert een scraping request uit voor Amazon product reviews
   * @param {Object} options - Scraping opties
   * @param {String} options.productId - Amazon product ID (ASIN)
   * @param {String} options.domain - Amazon domain (com, co.uk, etc.)
   * @param {Array} options.starFilters - Array van sterrenratings om te filteren (1-5)
   * @param {String} options.sortBy - Sorteermethode (recent, helpful)
   * @returns {Promise<Object>} - Gescrapete data
   */
  async scrapeAmazonReviews(options) {
    const {
      productId,
      domain = 'com',
      starFilters = [],
      sortBy = 'recent'
    } = options;
    
    if (!productId) {
      throw new Error('Product ID (ASIN) is vereist');
    }
    
    // Bouw de URL op basis van de opties
    let url = `https://www.amazon.${domain}/product-reviews/${productId}`;
    
    // Voeg query parameters toe indien nodig
    const queryParams = [];
    
    if (sortBy === 'recent') {
      queryParams.push('sortBy=recent');
    } else if (sortBy === 'helpful') {
      queryParams.push('sortBy=helpful');
    }
    
    // Voeg sterrenfilter toe indien nodig
    if (starFilters.length === 1) {
      queryParams.push(`filterByStar=${starFilters[0]}_star`);
    }
    
    // Voeg query parameters toe aan de URL
    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }
    
    // Configureer de scraping opties
    const scrapeOptions = {
      url,
      headless: 'browser', // Gebruik browser rendering voor dynamische content
      geo: domain === 'com' ? 'us' : domain.replace('.', ''), // Stel geo in op basis van domain
      device_type: 'desktop_chrome',
      session_id: `amazon_${domain}_${Date.now()}` // Unieke sessie ID
    };
    
    // Voer de scraping request uit
    return await this.scrape(scrapeOptions);
  }
  
  /**
   * Voert een scraping request uit voor Instagram content
   * @param {Object} options - Scraping opties
   * @param {String} options.type - Type content (hashtag, profile, location)
   * @param {String} options.query - Zoekopdracht (hashtag naam, profiel naam, etc.)
   * @returns {Promise<Object>} - Gescrapete data
   */
  async scrapeInstagram(options) {
    const {
      type = 'hashtag',
      query
    } = options;
    
    if (!query) {
      throw new Error('Query parameter is vereist (hashtag, profiel naam, etc.)');
    }
    
    // Bouw de URL op basis van de opties
    let url;
    
    switch (type) {
      case 'hashtag':
        url = `https://www.instagram.com/explore/tags/${encodeURIComponent(query)}/`;
        break;
      case 'profile':
        url = `https://www.instagram.com/${encodeURIComponent(query)}/`;
        break;
      case 'location':
        url = `https://www.instagram.com/explore/locations/${encodeURIComponent(query)}/`;
        break;
      default:
        throw new Error(`Ongeldig type: ${type}`);
    }
    
    // Configureer de scraping opties
    const scrapeOptions = {
      url,
      headless: 'browser', // Gebruik browser rendering voor dynamische content
      device_type: 'desktop_chrome',
      session_id: `instagram_${type}_${Date.now()}` // Unieke sessie ID
    };
    
    // Voer de scraping request uit
    return await this.scrape(scrapeOptions);
  }
  
  /**
   * Voert een scraping request uit voor TikTok content
   * @param {Object} options - Scraping opties
   * @param {String} options.type - Type content (hashtag, user, video)
   * @param {String} options.query - Zoekopdracht (hashtag naam, gebruikersnaam, video ID)
   * @returns {Promise<Object>} - Gescrapete data
   */
  async scrapeTikTok(options) {
    const {
      type = 'hashtag',
      query
    } = options;
    
    if (!query) {
      throw new Error('Query parameter is vereist (hashtag, gebruikersnaam, video ID)');
    }
    
    // Bouw de URL op basis van de opties
    let url;
    
    switch (type) {
      case 'hashtag':
        url = `https://www.tiktok.com/tag/${encodeURIComponent(query)}`;
        break;
      case 'user':
        url = `https://www.tiktok.com/@${encodeURIComponent(query)}`;
        break;
      case 'video':
        url = `https://www.tiktok.com/@placeholder/video/${encodeURIComponent(query)}`;
        break;
      default:
        throw new Error(`Ongeldig type: ${type}`);
    }
    
    // Configureer de scraping opties
    const scrapeOptions = {
      url,
      headless: 'browser', // Gebruik browser rendering voor dynamische content
      device_type: 'mobile_chrome', // TikTok werkt beter met mobiele user agent
      session_id: `tiktok_${type}_${Date.now()}` // Unieke sessie ID
    };
    
    // Voer de scraping request uit
    return await this.scrape(scrapeOptions);
  }
  
  /**
   * Voert een scraping request uit voor Trustpilot reviews
   * @param {Object} options - Scraping opties
   * @param {String} options.companyName - Bedrijfsnaam of domein
   * @param {String} options.locale - Taal voor reviews (en, nl, etc.)
   * @param {Number} options.page - Paginanummer
   * @returns {Promise<Object>} - Gescrapete data
   */
  async scrapeTrustpilot(options) {
    const {
      companyName,
      locale = 'en-US',
      page = 1
    } = options;
    
    if (!companyName) {
      throw new Error('Bedrijfsnaam is vereist');
    }
    
    // Bouw de URL op basis van de opties
    const url = `https://www.trustpilot.com/review/${encodeURIComponent(companyName)}?languages=${locale}&page=${page}`;
    
    // Configureer de scraping opties
    const scrapeOptions = {
      url,
      headless: 'browser', // Gebruik browser rendering voor dynamische content
      locale,
      device_type: 'desktop_chrome',
      session_id: `trustpilot_${companyName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}` // Unieke sessie ID
    };
    
    // Voer de scraping request uit
    return await this.scrape(scrapeOptions);
  }
}

// Singleton instantie
const decodoApiService = new DecodoApiService();

module.exports = decodoApiService;
