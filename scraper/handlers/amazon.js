const ScraperHandler = require('./scraper');
const { getLogger } = require('../utils/logger');

const logger = getLogger('AmazonScraper');

/**
 * AmazonScraper - Implementeert scraping functionaliteit specifiek voor Amazon product reviews
 */
class AmazonScraper extends ScraperHandler {
  constructor() {
    super('amazon');
  }
  
  /**
   * Verwerkt een SQS bericht voor Amazon reviews scraping
   * @param {Object} event - AWS Lambda event object
   */
  async handler(event) {
    return await this.handleMessage(event);
  }
  
  /**
   * Implementeert de Amazon-specifieke scraping logica
   * @param {Object} params - Scraping parameters
   * @param {String} params.productId - Amazon product ID (ASIN)
   * @param {String} params.domain - Amazon domain (com, co.uk, etc.)
   * @param {Number} params.maxReviews - Maximum aantal reviews om te scrapen
   * @param {Array} params.starFilters - Array van sterrenratings om te filteren (1-5)
   * @param {String} params.sortBy - Sorteermethode (recent, helpful)
   * @param {String} params.language - Taal van reviews (en, nl, etc.)
   * @returns {Promise<Object>} - Gescrapete data
   */
  async scrape(params = {}) {
    const {
      productId,
      domain = 'com',
      maxReviews = 100,
      starFilters = [],
      sortBy = 'recent',
      language = 'all'
    } = params;
    
    if (!productId) {
      throw new Error('Product ID (ASIN) is vereist');
    }
    
    logger.info(`Scraping van Amazon product reviews voor ${productId} op amazon.${domain}`);
    
    try {
      // Configureer de browser voor Amazon
      await this.configureForAmazon(domain);
      
      // Navigeer naar de product pagina
      const productUrl = await this.navigateToProduct(productId, domain);
      
      // Navigeer naar de reviews pagina
      const reviewsUrl = await this.navigateToReviews(productUrl);
      
      // Pas filters toe indien nodig
      if (starFilters.length > 0 || sortBy !== 'recent' || language !== 'all') {
        await this.applyFilters(reviewsUrl, starFilters, sortBy, language);
      }
      
      // Verzamel product metadata
      const productMetadata = await this.extractProductMetadata();
      
      // Verzamel reviews
      const reviews = await this.extractReviews(maxReviews);
      
      // Return het resultaat
      return {
        productId,
        domain,
        scrapedAt: new Date().toISOString(),
        productMetadata,
        reviewsCount: reviews.length,
        filters: {
          stars: starFilters.length > 0 ? starFilters : 'all',
          sortBy,
          language
        },
        reviews
      };
    } catch (error) {
      logger.error(`Fout bij scrapen van Amazon reviews: ${error.message}`);
      
      // Controleer op captcha
      if (await this.isCaptchaDetected()) {
        logger.warn('Captcha gedetecteerd, sessie wordt vernieuwd');
        throw new Error('Amazon captcha gedetecteerd');
      }
      
      throw error;
    }
  }
  
  /**
   * Configureert de browser specifiek voor Amazon scraping
   * @param {String} domain - Amazon domain
   */
  async configureForAmazon(domain) {
    logger.info('Browser configureren voor Amazon scraping');
    
    try {
      // Stel user agent in die minder verdacht is
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      
      // Stel extra headers in
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br'
      });
      
      // Stel cookies in voor de juiste regio
      const regionCookies = this.getRegionCookies(domain);
      
      if (regionCookies.length > 0) {
        const url = `https://www.amazon.${domain}`;
        for (const cookie of regionCookies) {
          await this.page.setCookie({
            ...cookie,
            url
          });
        }
        logger.info(`Regio cookies ingesteld voor amazon.${domain}`);
      }
      
      // Schakel afbeeldingen uit voor snellere laadtijden
      await this.page.setRequestInterception(true);
      this.page.on('request', (request) => {
        if (request.resourceType() === 'image' || request.resourceType() === 'font') {
          request.abort();
        } else {
          request.continue();
        }
      });
      
      logger.info('Browser succesvol geconfigureerd voor Amazon scraping');
    } catch (error) {
      logger.error(`Fout bij configureren van browser: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Genereert cookies voor een specifieke Amazon regio
   * @param {String} domain - Amazon domain
   * @returns {Array} - Array van cookie objecten
   */
  getRegionCookies(domain) {
    const cookies = [];
    
    // Voeg basis cookies toe
    cookies.push({
      name: 'session-id',
      value: `${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      domain: `.amazon.${domain}`
    });
    
    // Voeg regio-specifieke cookies toe
    switch (domain) {
      case 'com':
        cookies.push({
          name: 'i18n-prefs',
          value: 'USD',
          domain: `.amazon.${domain}`
        });
        cookies.push({
          name: 'lc-main',
          value: 'en_US',
          domain: `.amazon.${domain}`
        });
        break;
      case 'co.uk':
        cookies.push({
          name: 'i18n-prefs',
          value: 'GBP',
          domain: `.amazon.${domain}`
        });
        cookies.push({
          name: 'lc-main',
          value: 'en_GB',
          domain: `.amazon.${domain}`
        });
        break;
      case 'nl':
        cookies.push({
          name: 'i18n-prefs',
          value: 'EUR',
          domain: `.amazon.${domain}`
        });
        cookies.push({
          name: 'lc-main',
          value: 'nl_NL',
          domain: `.amazon.${domain}`
        });
        break;
      default:
        cookies.push({
          name: 'i18n-prefs',
          value: 'USD',
          domain: `.amazon.${domain}`
        });
    }
    
    return cookies;
  }
  
  /**
   * Navigeert naar de productpagina
   * @param {String} productId - Amazon product ID (ASIN)
   * @param {String} domain - Amazon domain
   * @returns {Promise<String>} - URL van de productpagina
   */
  async navigateToProduct(productId, domain) {
    const productUrl = `https://www.amazon.${domain}/dp/${productId}`;
    logger.info(`Navigeren naar product pagina: ${productUrl}`);
    
    try {
      await this.page.goto(productUrl, { 
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Controleer of de pagina correct is geladen
      const title = await this.page.title();
      
      if (title.includes('Robot Check') || title.includes('CAPTCHA')) {
        throw new Error('Amazon captcha gedetecteerd op productpagina');
      }
      
      if (title.includes('Page Not Found') || title.includes('niet gevonden')) {
        throw new Error(`Product met ID ${productId} niet gevonden`);
      }
      
      logger.info(`Succesvol genavigeerd naar product: ${title}`);
      return productUrl;
    } catch (error) {
      logger.error(`Fout bij navigeren naar product: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Navigeert naar de reviews pagina
   * @param {String} productUrl - URL van de productpagina
   * @returns {Promise<String>} - URL van de reviews pagina
   */
  async navigateToReviews(productUrl) {
    logger.info('Navigeren naar reviews pagina');
    
    try {
      // Zoek de link naar de reviews pagina
      const reviewsLinkSelector = 'a[data-hook="see-all-reviews-link-foot"]';
      
      // Wacht tot de reviews link zichtbaar is
      await this.page.waitForSelector(reviewsLinkSelector, { timeout: 10000 })
        .catch(() => {
          logger.warn('Reviews link niet gevonden via standaard selector, alternatieve methode proberen');
        });
      
      // Probeer de reviews link te vinden
      let reviewsUrl = null;
      
      try {
        // Probeer eerst de standaard link
        reviewsUrl = await this.page.evaluate((selector) => {
          const link = document.querySelector(selector);
          return link ? link.href : null;
        }, reviewsLinkSelector);
      } catch (e) {
        logger.warn(`Fout bij evalueren van reviews link: ${e.message}`);
      }
      
      // Als de standaard methode faalt, probeer alternatieve methoden
      if (!reviewsUrl) {
        // Probeer de reviews sectie op de productpagina
        reviewsUrl = await this.page.evaluate(() => {
          // Zoek naar verschillende mogelijke selectors
          const selectors = [
            'a[data-hook="see-all-reviews-link-foot"]',
            'a[data-hook="see-all-reviews-link"]',
            'a[href*="product-reviews"]',
            'a[href*="/reviews/"]'
          ];
          
          for (const selector of selectors) {
            const link = document.querySelector(selector);
            if (link && link.href) return link.href;
          }
          
          return null;
        });
      }
      
      // Als we nog steeds geen URL hebben, construeer deze handmatig
      if (!reviewsUrl) {
        logger.warn('Reviews link niet gevonden, URL handmatig construeren');
        
        // Haal het ASIN uit de huidige URL
        const asin = await this.page.evaluate(() => {
          const match = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
          return match ? match[1] : null;
        });
        
        if (!asin) {
          throw new Error('Kan ASIN niet extraheren uit productpagina URL');
        }
        
        // Construeer de reviews URL
        const domain = new URL(productUrl).hostname;
        reviewsUrl = `https://${domain}/product-reviews/${asin}`;
      }
      
      logger.info(`Navigeren naar reviews pagina: ${reviewsUrl}`);
      
      // Navigeer naar de reviews pagina
      await this.page.goto(reviewsUrl, { 
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Controleer of de pagina correct is geladen
      const title = await this.page.title();
      
      if (title.includes('Robot Check') || title.includes('CAPTCHA')) {
        throw new Error('Amazon captcha gedetecteerd op reviews pagina');
      }
      
      logger.info('Succesvol genavigeerd naar reviews pagina');
      return reviewsUrl;
    } catch (error) {
      logger.error(`Fout bij navigeren naar reviews pagina: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Past filters toe op de reviews pagina
   * @param {String} reviewsUrl - Basis URL van de reviews pagina
   * @param {Array} starFilters - Array van sterrenratings om te filteren (1-5)
   * @param {String} sortBy - Sorteermethode (recent, helpful)
   * @param {String} language - Taal van reviews
   */
  async applyFilters(reviewsUrl, starFilters, sortBy, language) {
    logger.info(`Filters toepassen: sterren=${starFilters.join(',')}, sortBy=${sortBy}, taal=${language}`);
    
    try {
      let filterUrl = new URL(reviewsUrl);
      const searchParams = filterUrl.searchParams;
      
      // Voeg sorteerparameter toe
      if (sortBy === 'recent') {
        searchParams.set('sortBy', 'recent');
      } else if (sortBy === 'helpful') {
        searchParams.set('sortBy', 'helpful');
      }
      
      // Voeg sterrenfilter toe indien nodig
      if (starFilters.length === 1) {
        searchParams.set('filterByStar', `${starFilters[0]}_star`);
      }
      
      // Voeg taalfilter toe indien nodig
      if (language !== 'all') {
        searchParams.set('filterByLanguage', language);
      }
      
      // Navigeer naar de gefilterde URL
      filterUrl = filterUrl.toString();
      logger.info(`Navigeren naar gefilterde URL: ${filterUrl}`);
      
      await this.page.goto(filterUrl, { 
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Als we meerdere sterrenfilters hebben, moeten we deze via de UI toepassen
      if (starFilters.length > 1) {
        logger.info(`Meerdere sterrenfilters toepassen via UI: ${starFilters.join(', ')}`);
        
        // Implementatie voor meerdere sterrenfilters via UI zou hier komen
        // Dit is complex en vereist interactie met de UI elementen
        // Voor nu laten we dit weg en gebruiken we alleen de URL parameter
      }
      
      // Wacht tot de reviews geladen zijn
      await this.page.waitForSelector('div[data-hook="review"]', { timeout: 10000 })
        .catch(() => {
          logger.warn('Reviews niet gevonden na toepassen filters, mogelijk geen reviews beschikbaar met deze filters');
        });
      
      logger.info('Filters succesvol toegepast');
    } catch (error) {
      logger.error(`Fout bij toepassen van filters: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Extraheert metadata van het product
   * @returns {Promise<Object>} - Product metadata
   */
  async extractProductMetadata() {
    logger.info('Product metadata extraheren');
    
    try {
      return await this.page.evaluate(() => {
        // Zoek de product titel
        const titleElement = document.querySelector('a[data-hook="product-link"] h1');
        const title = titleElement ? titleElement.textContent.trim() : null;
        
        // Zoek de gemiddelde rating
        const ratingElement = document.querySelector('div[data-hook="rating-out-of-text"]');
        const rating = ratingElement ? ratingElement.textContent.trim() : null;
        
        // Zoek het totaal aantal reviews
        const totalReviewsElement = document.querySelector('div[data-hook="cr-filter-info-review-rating-count"]');
        let totalReviews = null;
        
        if (totalReviewsElement) {
          const match = totalReviewsElement.textContent.match(/(\d+(?:,\d+)*) (?:global|totaal|total)/i);
          totalReviews = match ? match[1].replace(/,/g, '') : null;
        }
        
        // Zoek de rating distributie
        const ratingDistribution = {};
        const ratingRows = document.querySelectorAll('tr[data-hook="rating-distribution-row"]');
        
        ratingRows.forEach(row => {
          const stars = row.querySelector('td:first-child')?.textContent.trim();
          const percentage = row.querySelector('td:last-child')?.textContent.trim();
          
          if (stars && percentage) {
            const starsMatch = stars.match(/(\d+)/);
            const starValue = starsMatch ? starsMatch[1] : null;
            
            if (starValue) {
              ratingDistribution[starValue] = percentage;
            }
          }
        });
        
        return {
          title,
          rating,
          totalReviews,
          ratingDistribution
        };
      });
    } catch (error) {
      logger.error(`Fout bij extraheren van product metadata: ${error.message}`);
      return {
        error: error.message
      };
    }
  }
  
  /**
   * Extraheert reviews van de huidige pagina en laadt meer indien nodig
   * @param {Number} maxReviews - Maximum aantal reviews om te extraheren
   * @returns {Promise<Array>} - Array van review objecten
   */
  async extractReviews(maxReviews) {
    logger.info(`Reviews extraheren (max ${maxReviews})`);
    
    try {
      const reviews = [];
      let currentPage = 1;
      const maxPages = Math.ceil(maxReviews / 10); // Amazon toont meestal 10 reviews per pagina
      
      while (reviews.length < maxReviews && currentPage <= maxPages) {
        logger.info(`Reviews extraheren van pagina ${currentPage}`);
        
        // Extraheer reviews van de huidige pagina
        const pageReviews = await this.extractReviewsFromCurrentPage();
        
        if (pageReviews.length === 0) {
          logger.info('Geen reviews gevonden op huidige pagina, stoppen met extractie');
          break;
        }
        
        // Voeg reviews toe aan de resultaten
        reviews.push(...pageReviews);
        logger.info(`${pageReviews.length} reviews geëxtraheerd, totaal: ${reviews.length}`);
        
        // Controleer of we genoeg reviews hebben
        if (reviews.length >= maxReviews) {
          logger.info(`Maximum aantal reviews bereikt (${maxReviews})`);
          break;
        }
        
        // Navigeer naar de volgende pagina
        const hasNextPage = await this.goToNextPage();
        
        if (!hasNextPage) {
          logger.info('Geen volgende pagina beschikbaar, stoppen met extractie');
          break;
        }
        
        currentPage++;
        
        // Wacht kort tussen paginanavigaties om detectie te vermijden
        await this.page.waitForTimeout(2000 + Math.random() * 2000);
      }
      
      // Beperk tot het gevraagde maximum
      return reviews.slice(0, maxReviews);
    } catch (error) {
      logger.error(`Fout bij extraheren van reviews: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Extraheert reviews van de huidige pagina
   * @returns {Promise<Array>} - Array van review objecten
   */
  async extractReviewsFromCurrentPage() {
    try {
      return await this.page.evaluate(() => {
        const reviews = [];
        const reviewElements = document.querySelectorAll('div[data-hook="review"]');
        
        reviewElements.forEach(review => {
          try {
            // Extraheer review ID
            const idMatch = review.id.match(/R([A-Z0-9]+)/);
            const reviewId = idMatch ? idMatch[1] : null;
            
            // Extraheer profiel naam
            const profileElement = review.querySelector('span[class*="profile-name"]');
            const profileName = profileElement ? profileElement.textContent.trim() : null;
            
            // Extraheer rating
            const ratingElement = review.querySelector('i[data-hook="review-star-rating"], i[data-hook="cmps-review-star-rating"]');
            let rating = null;
            
            if (ratingElement) {
              const ratingText = ratingElement.textContent.trim();
              const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
              rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
            }
            
            // Extraheer titel
            const titleElement = review.querySelector('a[data-hook="review-title"], [data-hook="review-title"]');
            const title = titleElement ? titleElement.textContent.trim() : null;
            
            // Extraheer datum
            const dateElement = review.querySelector('[data-hook="review-date"]');
            const date = dateElement ? dateElement.textContent.trim() : null;
            
            // Extraheer verified purchase
            const verifiedElement = review.querySelector('[data-hook="avp-badge"]');
            const verified = verifiedElement ? true : false;
            
            // Extraheer review tekst
            const bodyElement = review.querySelector('[data-hook="review-body"]');
            const body = bodyElement ? bodyElement.textContent.trim() : null;
            
            // Extraheer helpful votes
            const helpfulElement = review.querySelector('[data-hook="helpful-vote-statement"]');
            let helpfulVotes = null;
            
            if (helpfulElement) {
              const helpfulText = helpfulElement.textContent.trim();
              const helpfulMatch = helpfulText.match(/(\d+(?:,\d+)*)/);
              helpfulVotes = helpfulMatch ? parseInt(helpfulMatch[1].replace(/,/g, '')) : 0;
            }
            
            // Voeg review toe aan resultaten
            reviews.push({
              reviewId,
              profileName,
              rating,
              title,
              date,
              verified,
              body,
              helpfulVotes: helpfulVotes || 0
            });
          } catch (e) {
            // Negeer fouten bij individuele reviews
            console.error(`Fout bij extraheren van review: ${e.message}`);
          }
        });
        
        return reviews;
      });
    } catch (error) {
      logger.error(`Fout bij extraheren van reviews van huidige pagina: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Navigeert naar de volgende pagina met reviews
   * @returns {Promise<Boolean>} - True als navigatie succesvol was, anders False
   */
  async goToNextPage() {
    try {
      // Controleer of er een "Volgende pagina" knop is
      const hasNextPage = await this.page.evaluate(() => {
        const nextButton = document.querySelector('li.a-last a');
        return !!nextButton;
      });
      
      if (!hasNextPage) {
        return false;
      }
      
      logger.info('Navigeren naar volgende pagina');
      
      // Klik op de "Volgende pagina" knop
      await this.page.click('li.a-last a');
      
      // Wacht tot de pagina is geladen
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      
      // Controleer of de pagina correct is geladen
      const title = await this.page.title();
      
      if (title.includes('Robot Check') || title.includes('CAPTCHA')) {
        throw new Error('Amazon captcha gedetecteerd bij paginanavigatie');
      }
      
      // Wacht tot de reviews geladen zijn
      await this.page.waitForSelector('div[data-hook="review"]', { timeout: 10000 })
        .catch(() => {
          logger.warn('Reviews niet gevonden na navigatie naar volgende pagina');
        });
      
      return true;
    } catch (error) {
      logger.error(`Fout bij navigeren naar volgende pagina: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Controleert of er een captcha is gedetecteerd
   * @returns {Promise<Boolean>} - True als captcha is gedetecteerd, anders False
   */
  async isCaptchaDetected() {
    try {
      return await this.page.evaluate(() => {
        const title = document.title;
        const body = document.body.textContent;
        
        return title.includes('Robot Check') || 
               title.includes('CAPTCHA') || 
               body.includes('Type the characters you see in this image') ||
               body.includes('Enter the characters you see below') ||
               document.querySelector('form[action*="/errors/validateCaptcha"]') !== null;
      });
    } catch (error) {
      logger.error(`Fout bij controleren op captcha: ${error.message}`);
      return false;
    }
  }
}

// Instantieer de scraper
const amazonScraper = new AmazonScraper();

// Lambda handler functie
module.exports.handler = async (event) => {
  return await amazonScraper.handler(event);
};
