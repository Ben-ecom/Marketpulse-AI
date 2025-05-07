/**
 * Trustpilot Scraper
 *
 * Dit bestand bevat de scraper voor Trustpilot content.
 * Het gebruikt de Decodo API wrapper om Trustpilot pagina's te scrapen en
 * bedrijfsreviews, ratings en andere gegevens te extraheren.
 */

const { getDecodoApiClient } = require('../decodo-api');
const { getJobQueueService } = require('../job-queue');

/**
 * Trustpilot Scraper klasse
 */
class TrustpilotScraper {
  constructor() {
    this.decodoClient = getDecodoApiClient();
    this.jobQueueService = getJobQueueService();
    this.platform = 'trustpilot';
  }

  /**
   * Maak een nieuwe scrape job aan voor Trustpilot bedrijven
   * @param {String} projectId - ID van het project
   * @param {Array<String>} businessUrls - Array van bedrijfs URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createBusinessScrapeJob(projectId, businessUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateTrustpilotUrls(businessUrls, 'business');

      if (validUrls.length === 0) {
        throw new Error('Geen geldige Trustpilot bedrijfs URLs gevonden');
      }

      // Standaard opties voor Trustpilot bedrijf scraping
      const defaultOptions = {
        wait_for: '.business-unit-profile', // Wacht op bedrijfsprofiel element
        device_type: options.device_type || 'desktop',
        javascript: true,
        timeout: 30000,
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor bedrijfsgegevens
        selectors: {
          businessName: '.multi-size-header__headline',
          businessRating: '.star-rating--medium',
          businessTotalReviews: '.typography_body-l__KUYFJ',
          businessCategories: '.categories-list a',
          businessAddress: '.address-info__details',
          businessWebsite: '.business-website-link',
          businessPhone: '.business-phone-number',
          businessDescription: '.business-description',
          reviewsDistribution: '.review-distribution',
          reviewsDistributionItem: '.review-distribution__item',
        },
      };

      // Combineer standaard opties met aangepaste opties
      const scrapeOptions = { ...defaultOptions, ...options };

      // Maak job aan
      const jobData = {
        project_id: projectId,
        platform: this.platform,
        job_type: 'business',
        config: {
          urls: validUrls,
          options: scrapeOptions,
        },
        priority: options.priority || 'medium',
      };

      return await this.jobQueueService.createJob(jobData);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van Trustpilot bedrijf scrape job:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe scrape job aan voor Trustpilot reviews
   * @param {String} projectId - ID van het project
   * @param {Array<String>} reviewUrls - Array van review pagina URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createReviewsScrapeJob(projectId, reviewUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateTrustpilotUrls(reviewUrls, 'reviews');

      if (validUrls.length === 0) {
        throw new Error('Geen geldige Trustpilot reviews URLs gevonden');
      }

      // Standaard opties voor Trustpilot reviews scraping
      const defaultOptions = {
        wait_for: '.review-list', // Wacht op reviews list element
        device_type: options.device_type || 'desktop',
        javascript: true,
        timeout: 30000,
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor reviews
        selectors: {
          businessName: '.multi-size-header__headline',
          businessRating: '.star-rating--medium',
          reviewList: '.review-list',
          reviewItem: '.review',
          reviewTitle: '.link__header',
          reviewContent: '.review-content__text',
          reviewRating: '.star-rating--medium',
          reviewDate: '.review-content-header__dates',
          reviewAuthor: '.consumer-information__name',
          reviewLocation: '.consumer-information__location',
          reviewVerified: '.review-content-header__verification',
          businessReply: '.business-response',
          businessReplyContent: '.business-response__content',
          businessReplyDate: '.business-response__date',
          pagination: '.pagination-container',
        },
      };

      // Combineer standaard opties met aangepaste opties
      const scrapeOptions = { ...defaultOptions, ...options };

      // Maak job aan
      const jobData = {
        project_id: projectId,
        platform: this.platform,
        job_type: 'reviews',
        config: {
          urls: validUrls,
          options: scrapeOptions,
        },
        priority: options.priority || 'medium',
      };

      return await this.jobQueueService.createJob(jobData);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van Trustpilot reviews scrape job:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe scrape job aan voor Trustpilot reviews met filtering
   * @param {String} projectId - ID van het project
   * @param {String} businessDomain - Domein van het bedrijf
   * @param {Object} filters - Filter opties (stars, language, timeperiod)
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createFilteredReviewsScrapeJob(projectId, businessDomain, filters = {}, options = {}) {
    try {
      if (!businessDomain) {
        throw new Error('Bedrijfsdomein is vereist');
      }

      // Genereer gefilterde URL
      const reviewUrl = this.generateFilteredReviewUrl(businessDomain, filters);

      // Maak een reguliere reviews scrape job aan met de gefilterde URL
      return await this.createReviewsScrapeJob(projectId, [reviewUrl], options);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van gefilterde Trustpilot reviews scrape job:', error);
      throw error;
    }
  }

  /**
   * Valideer Trustpilot URLs
   * @param {Array<String>} urls - Array van URLs om te valideren
   * @param {String} type - Type URL (business, reviews)
   * @returns {Array<String>} - Array van geldige URLs
   */
  validateTrustpilotUrls(urls, type = 'business') {
    if (!Array.isArray(urls)) {
      return [];
    }

    return urls.filter((url) => {
      try {
        // Controleer of het een geldige URL is
        const urlObj = new URL(url);

        // Controleer of het een Trustpilot domein is
        const isTrustpilotDomain = urlObj.hostname === 'www.trustpilot.com'
                                  || urlObj.hostname === 'trustpilot.com';

        if (!isTrustpilotDomain) {
          return false;
        }

        // Controleer het type URL
        const { pathname } = urlObj;

        switch (type) {
          case 'business':
            // Bedrijfspagina's hebben /review/[domain] in het pad
            return pathname.startsWith('/review/') && !pathname.includes('/reviews');
          case 'reviews':
            // Reviews pagina's hebben /reviews/ in het pad
            return pathname.includes('/reviews');
          default:
            return false;
        }
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Verwerk de resultaten van een Trustpilot bedrijf scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte bedrijfsgegevens
   */
  processBusinessResult(scrapeResult) {
    try {
      const { url, html } = scrapeResult;

      if (!html) {
        throw new Error('Geen HTML gevonden in scrape resultaat');
      }

      // Extraheer bedrijfsdomein uit URL
      const businessDomain = this.extractBusinessDomainFromUrl(url);

      // Extraheer bedrijfsgegevens uit HTML
      const businessData = this.extractBusinessData(html);

      // Extraheer reviews distributie
      const reviewsDistribution = this.extractReviewsDistribution(html);

      return {
        business_domain: businessDomain,
        url,
        business: businessData,
        reviews_distribution: reviewsDistribution,
        scraped_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Fout bij verwerken van Trustpilot bedrijf resultaat:', error);
      return {
        url: scrapeResult.url,
        error: error.message,
        scraped_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Verwerk de resultaten van een Trustpilot reviews scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte reviews
   */
  processReviewsResult(scrapeResult) {
    try {
      const { url, html } = scrapeResult;

      if (!html) {
        throw new Error('Geen HTML gevonden in scrape resultaat');
      }

      // Extraheer bedrijfsdomein uit URL
      const businessDomain = this.extractBusinessDomainFromUrl(url);

      // Extraheer bedrijfsnaam en rating
      const businessName = this.extractText(html, '.multi-size-header__headline');
      const businessRating = this.extractRating(html, '.star-rating--medium');

      // Extraheer reviews uit HTML
      const reviews = this.extractReviews(html);

      // Extraheer paginering
      const pagination = this.extractPagination(html);

      // Extraheer filters
      const filters = this.extractFiltersFromUrl(url);

      return {
        business_domain: businessDomain,
        business_name: businessName,
        business_rating: businessRating,
        url,
        reviews,
        pagination,
        filters,
        review_count: reviews.length,
        scraped_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Fout bij verwerken van Trustpilot reviews resultaat:', error);
      return {
        url: scrapeResult.url,
        error: error.message,
        scraped_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Extraheer bedrijfsdomein uit URL
   * @param {String} url - Bedrijfs URL
   * @returns {String} - Geëxtraheerd bedrijfsdomein
   */
  extractBusinessDomainFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const { pathname } = urlObj;

      // Extraheer domein uit /review/[domain]
      const match = pathname.match(/\/review\/([^/]+)/);

      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer filters uit URL
   * @param {String} url - Reviews URL
   * @returns {Object} - Geëxtraheerde filters
   */
  extractFiltersFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const { searchParams } = urlObj;

      const filters = {};

      // Extraheer star filter
      const stars = searchParams.get('stars');
      if (stars) {
        filters.stars = parseInt(stars, 10);
      }

      // Extraheer language filter
      const languages = searchParams.get('languages');
      if (languages) {
        filters.languages = languages.split(',');
      }

      // Extraheer timeperiod filter
      const timeperiod = searchParams.get('timeperiod');
      if (timeperiod) {
        filters.timeperiod = timeperiod;
      }

      return filters;
    } catch (error) {
      return {};
    }
  }

  /**
   * Genereer gefilterde review URL
   * @param {String} businessDomain - Domein van het bedrijf
   * @param {Object} filters - Filter opties
   * @returns {String} - Gefilterde review URL
   */
  generateFilteredReviewUrl(businessDomain, filters = {}) {
    // Basis URL voor reviews
    let url = `https://www.trustpilot.com/review/${businessDomain}/reviews`;

    // Voeg query parameters toe voor filters
    const queryParams = [];

    // Voeg sterrenfilter toe
    if (filters.stars && filters.stars >= 1 && filters.stars <= 5) {
      queryParams.push(`stars=${filters.stars}`);
    }

    // Voeg taalfilter toe
    if (filters.languages && Array.isArray(filters.languages) && filters.languages.length > 0) {
      queryParams.push(`languages=${filters.languages.join(',')}`);
    }

    // Voeg tijdsperiode filter toe
    if (filters.timeperiod) {
      queryParams.push(`timeperiod=${filters.timeperiod}`);
    }

    // Voeg query parameters toe aan URL
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    return url;
  }

  /**
   * Genereer review URLs met paginering
   * @param {String} businessDomain - Domein van het bedrijf
   * @param {Number} pages - Aantal pagina's om te genereren
   * @param {Object} filters - Filter opties
   * @returns {Array<String>} - Array van review URLs
   */
  generateReviewUrls(businessDomain, pages = 1, filters = {}) {
    const urls = [];

    // Genereer basis URL met filters
    const baseUrl = this.generateFilteredReviewUrl(businessDomain, filters);

    // Voeg URL voor eerste pagina toe
    urls.push(baseUrl);

    // Genereer URLs voor extra pagina's
    for (let page = 2; page <= pages; page++) {
      // Voeg page parameter toe aan URL
      const separator = baseUrl.includes('?') ? '&' : '?';
      urls.push(`${baseUrl}${separator}page=${page}`);
    }

    return urls;
  }

  /**
   * Genereer review URLs voor meerdere bedrijven
   * @param {Array<String>} businessDomains - Array van bedrijfsdomeinen
   * @param {Number} pagesPerBusiness - Aantal pagina's per bedrijf
   * @param {Object} filters - Filter opties
   * @returns {Array<String>} - Array van review URLs
   */
  generateMultiBusinessReviewUrls(businessDomains, pagesPerBusiness = 1, filters = {}) {
    let urls = [];

    for (const domain of businessDomains) {
      const businessUrls = this.generateReviewUrls(domain, pagesPerBusiness, filters);
      urls = [...urls, ...businessUrls];
    }

    return urls;
  }

  /**
   * Extraheer tekst uit HTML met een selector
   * @param {String} html - HTML string
   * @param {String} selector - CSS selector
   * @returns {String} - Geëxtraheerde tekst
   */
  extractText(html, selector) {
    // In een echte implementatie zou je hier de tekst uit de HTML extraheren
    // met behulp van een HTML parser zoals cheerio of JSDOM

    // Voor nu gebruiken we een mock implementatie
    return `Mock tekst voor selector: ${selector}`;
  }

  /**
   * Extraheer rating uit HTML
   * @param {String} html - HTML string
   * @param {String} selector - CSS selector
   * @returns {Number} - Geëxtraheerde rating
   */
  extractRating(html, selector) {
    // In een echte implementatie zou je hier de rating uit de HTML extraheren
    // met behulp van een HTML parser

    // Voor nu gebruiken we een mock implementatie
    return 4.2;
  }

  /**
   * Extraheer bedrijfsgegevens uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Geëxtraheerde bedrijfsgegevens
   */
  extractBusinessData(html) {
    // In een echte implementatie zou je hier de bedrijfsgegevens uit de HTML extraheren
    // met behulp van een HTML parser

    // Voor nu gebruiken we een mock implementatie
    return {
      name: 'Voorbeeld Bedrijf',
      domain: 'voorbeeldbedrijf.nl',
      rating: 4.2,
      total_reviews: 1234,
      categories: ['E-commerce', 'Electronics'],
      address: '123 Voorbeeldstraat, 1234 AB Amsterdam, Nederland',
      website: 'https://www.voorbeeldbedrijf.nl',
      phone: '+31 20 123 4567',
      description: 'Voorbeeld Bedrijf is een toonaangevende leverancier van elektronische producten.',
    };
  }

  /**
   * Extraheer reviews distributie uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Geëxtraheerde reviews distributie
   */
  extractReviewsDistribution(html) {
    // In een echte implementatie zou je hier de reviews distributie uit de HTML extraheren
    // met behulp van een HTML parser

    // Voor nu gebruiken we een mock implementatie
    return {
      five_star: { count: 950, percentage: 77 },
      four_star: { count: 150, percentage: 12 },
      three_star: { count: 75, percentage: 6 },
      two_star: { count: 35, percentage: 3 },
      one_star: { count: 24, percentage: 2 },
    };
  }

  /**
   * Extraheer reviews uit HTML
   * @param {String} html - HTML string
   * @returns {Array<Object>} - Geëxtraheerde reviews
   */
  extractReviews(html) {
    // In een echte implementatie zou je hier de reviews uit de HTML extraheren
    // met behulp van een HTML parser

    // Voor nu gebruiken we een mock implementatie
    return [
      {
        id: 'review1',
        title: 'Uitstekende service',
        content: 'Ik ben zeer tevreden met de service van dit bedrijf. De levering was snel en het product is van hoge kwaliteit.',
        rating: 5,
        date: '2023-03-01T18:45:30Z',
        author: {
          name: 'Jan Jansen',
          location: 'Amsterdam, Nederland',
          reviews_count: 12,
        },
        verified: true,
        business_reply: {
          content: 'Bedankt voor uw positieve feedback! We zijn blij dat u tevreden bent met onze service.',
          date: '2023-03-02T10:15:45Z',
        },
      },
      {
        id: 'review2',
        title: 'Goede producten, maar trage levering',
        content: 'De producten zijn van goede kwaliteit, maar de levering duurde langer dan verwacht. Verder ben ik tevreden.',
        rating: 4,
        date: '2023-02-15T12:30:15Z',
        author: {
          name: 'Piet Pietersen',
          location: 'Rotterdam, Nederland',
          reviews_count: 5,
        },
        verified: true,
        business_reply: {
          content: 'Bedankt voor uw feedback. We nemen uw opmerking over de levertijd serieus en werken eraan om dit te verbeteren.',
          date: '2023-02-16T09:45:30Z',
        },
      },
      {
        id: 'review3',
        title: 'Teleurstellende ervaring',
        content: 'Het product voldeed niet aan mijn verwachtingen en de klantenservice was moeilijk te bereiken.',
        rating: 2,
        date: '2023-02-10T14:20:45Z',
        author: {
          name: 'Klaas Klaassen',
          location: 'Utrecht, Nederland',
          reviews_count: 8,
        },
        verified: true,
        business_reply: {
          content: 'We vinden het jammer dat u een teleurstellende ervaring heeft gehad. We zouden graag contact met u opnemen om dit op te lossen. U kunt ons bereiken via support@voorbeeldbedrijf.nl.',
          date: '2023-02-11T11:30:15Z',
        },
      },
    ];
  }

  /**
   * Extraheer paginering uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Geëxtraheerde paginering
   */
  extractPagination(html) {
    // In een echte implementatie zou je hier de paginering uit de HTML extraheren
    // met behulp van een HTML parser

    // Voor nu gebruiken we een mock implementatie
    return {
      current_page: 1,
      total_pages: 10,
      has_next: true,
      has_previous: false,
      next_url: 'https://www.trustpilot.com/review/voorbeeldbedrijf.nl/reviews?page=2',
      previous_url: null,
    };
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de TrustpilotScraper
 * @returns {TrustpilotScraper} - TrustpilotScraper instance
 */
const getTrustpilotScraper = () => {
  if (!instance) {
    instance = new TrustpilotScraper();
  }
  return instance;
};

module.exports = {
  getTrustpilotScraper,
};
