/**
 * Amazon Scraper
 *
 * Dit bestand bevat de scraper voor Amazon producten.
 * Het gebruikt de Decodo API wrapper om Amazon pagina's te scrapen en
 * productgegevens te extraheren.
 */

const { getDecodoApiClient } = require('../decodo-api');
const { getJobQueueService } = require('../job-queue');

/**
 * Amazon Scraper klasse
 */
class AmazonScraper {
  constructor() {
    this.decodoClient = getDecodoApiClient();
    this.jobQueueService = getJobQueueService();
    this.platform = 'amazon';
  }

  /**
   * Maak een nieuwe scrape job aan voor Amazon producten
   * @param {String} projectId - ID van het project
   * @param {Array<String>} productUrls - Array van product URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createProductScrapeJob(projectId, productUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateAmazonUrls(productUrls);

      if (validUrls.length === 0) {
        throw new Error('Geen geldige Amazon product URLs gevonden');
      }

      // Standaard opties voor Amazon product scraping
      const defaultOptions = {
        wait_for: '#productTitle', // Wacht op product titel element
        device_type: 'desktop',
        geo: 'nl',
        locale: 'nl-NL',
        javascript: true,
        timeout: 30000,
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor productgegevens
        selectors: {
          title: '#productTitle',
          price: '.a-price .a-offscreen',
          rating: '#acrPopover',
          reviewCount: '#acrCustomerReviewText',
          availability: '#availability',
          features: '#feature-bullets .a-list-item',
          description: '#productDescription p',
          images: '#imgTagWrapperId img',
          brand: '#bylineInfo',
          categories: '#wayfinding-breadcrumbs_feature_div .a-link-normal',
        },
      };

      // Combineer standaard opties met aangepaste opties
      const scrapeOptions = { ...defaultOptions, ...options };

      // Maak job aan
      const jobData = {
        project_id: projectId,
        platform: this.platform,
        job_type: 'product',
        config: {
          urls: validUrls,
          options: scrapeOptions,
        },
        priority: options.priority || 'medium',
      };

      return await this.jobQueueService.createJob(jobData);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van Amazon product scrape job:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe scrape job aan voor Amazon zoekresultaten
   * @param {String} projectId - ID van het project
   * @param {Array<String>} searchUrls - Array van zoek URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createSearchScrapeJob(projectId, searchUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateAmazonUrls(searchUrls, true);

      if (validUrls.length === 0) {
        throw new Error('Geen geldige Amazon zoek URLs gevonden');
      }

      // Standaard opties voor Amazon zoekresultaten scraping
      const defaultOptions = {
        wait_for: '.s-result-list', // Wacht op zoekresultaten element
        device_type: 'desktop',
        geo: 'nl',
        locale: 'nl-NL',
        javascript: true,
        timeout: 30000,
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor zoekresultaten
        selectors: {
          products: '.s-result-item[data-asin]',
          productTitle: '.a-size-medium.a-color-base.a-text-normal',
          productPrice: '.a-price .a-offscreen',
          productRating: '.a-icon-star-small .a-icon-alt',
          productReviewCount: '.a-size-small .a-link-normal',
          productImage: '.s-image',
          productUrl: '.a-link-normal.a-text-normal',
          sponsored: '.s-sponsored-label-info-icon',
          pagination: '.a-pagination',
        },
      };

      // Combineer standaard opties met aangepaste opties
      const scrapeOptions = { ...defaultOptions, ...options };

      // Maak job aan
      const jobData = {
        project_id: projectId,
        platform: this.platform,
        job_type: 'search',
        config: {
          urls: validUrls,
          options: scrapeOptions,
        },
        priority: options.priority || 'medium',
      };

      return await this.jobQueueService.createJob(jobData);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van Amazon zoek scrape job:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe scrape job aan voor Amazon reviews
   * @param {String} projectId - ID van het project
   * @param {Array<String>} reviewUrls - Array van review URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createReviewScrapeJob(projectId, reviewUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateAmazonUrls(reviewUrls, false, true);

      if (validUrls.length === 0) {
        throw new Error('Geen geldige Amazon review URLs gevonden');
      }

      // Standaard opties voor Amazon review scraping
      const defaultOptions = {
        wait_for: '#cm_cr-review_list', // Wacht op reviews element
        device_type: 'desktop',
        geo: options.geo || 'nl',
        locale: options.locale || 'nl-NL',
        javascript: true,
        timeout: 30000,
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor reviews
        selectors: {
          reviews: '[data-hook="review"]',
          reviewTitle: '[data-hook="review-title"]',
          reviewRating: '[data-hook="review-star-rating"]',
          reviewDate: '[data-hook="review-date"]',
          reviewText: '[data-hook="review-body"]',
          reviewerName: '.a-profile-name',
          verifiedPurchase: '[data-hook="avp-badge"]',
          helpfulVotes: '[data-hook="helpful-vote-statement"]',
          pagination: '.a-pagination',
          productTitle: '#productTitle',
          productRating: '#averageCustomerReviews .a-icon-alt',
          totalReviews: '#acrCustomerReviewText',
          ratingBreakdown: '#histogramTable tr',
          filterByStar: '#reviews-filter-wrapper .a-link-normal',
        },
      };

      // Combineer standaard opties met aangepaste opties
      const scrapeOptions = { ...defaultOptions, ...options };

      // Maak job aan
      const jobData = {
        project_id: projectId,
        platform: this.platform,
        job_type: 'review',
        config: {
          urls: validUrls,
          options: scrapeOptions,
        },
        priority: options.priority || 'medium',
      };

      return await this.jobQueueService.createJob(jobData);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van Amazon review scrape job:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe scrape job aan voor Amazon reviews met filtering op sterren
   * @param {String} projectId - ID van het project
   * @param {String} productId - ASIN van het product
   * @param {Number} starFilter - Filter op aantal sterren (1-5)
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createFilteredReviewScrapeJob(projectId, productId, starFilter, options = {}) {
    try {
      if (!productId || typeof productId !== 'string') {
        throw new Error('Geldig product ID (ASIN) is vereist');
      }

      if (!starFilter || starFilter < 1 || starFilter > 5) {
        throw new Error('Geldige sterrenfilter (1-5) is vereist');
      }

      // Genereer review URL met sterrenfilter
      const domain = options.marketplace || 'nl';
      const reviewUrl = `https://www.amazon.${domain}/product-reviews/${productId}/ref=cm_cr_arp_d_viewopt_sr?filterByStar=one_star&pageNumber=1`;

      // Vervang 'one_star' met de juiste waarde op basis van starFilter
      const starMapping = {
        1: 'one_star',
        2: 'two_star',
        3: 'three_star',
        4: 'four_star',
        5: 'five_star',
      };

      const filteredReviewUrl = reviewUrl.replace('one_star', starMapping[starFilter]);

      // Maak een reguliere review scrape job aan met de gefilterde URL
      return await this.createReviewScrapeJob(projectId, [filteredReviewUrl], options);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van gefilterde Amazon review scrape job:', error);
      throw error;
    }
  }

  /**
   * Valideer Amazon URLs
   * @param {Array<String>} urls - Array van URLs om te valideren
   * @param {Boolean} isSearch - Of het zoek URLs zijn
   * @param {Boolean} isReview - Of het review URLs zijn
   * @returns {Array<String>} - Array van geldige URLs
   */
  validateAmazonUrls(urls, isSearch = false, isReview = false) {
    if (!urls || !Array.isArray(urls)) {
      return [];
    }

    return urls.filter((url) => {
      // Controleer of het een geldige URL is
      try {
        const urlObj = new URL(url);

        // Controleer of het een Amazon domein is
        const isAmazonDomain = urlObj.hostname.includes('amazon.');

        if (!isAmazonDomain) {
          return false;
        }

        // Controleer of het een product URL is (bevat /dp/ of /gp/product/)
        const isProductUrl = urlObj.pathname.includes('/dp/') || urlObj.pathname.includes('/gp/product/');

        // Controleer of het een zoek URL is (bevat /s? of /search/)
        const isSearchUrl = urlObj.pathname.includes('/s') || urlObj.pathname.includes('/search/');

        // Controleer of het een review URL is (bevat /product-reviews/)
        const isReviewUrl = urlObj.pathname.includes('/product-reviews/');

        if (isSearch) {
          return isSearchUrl;
        } if (isReview) {
          return isReviewUrl;
        }
        return isProductUrl;
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Verwerk de resultaten van een Amazon product scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte productgegevens
   */
  processProductResult(scrapeResult) {
    try {
      if (!scrapeResult || !scrapeResult.html) {
        throw new Error('Geen geldige scrape resultaat');
      }

      // Hier zou normaal gesproken HTML parsing en extractie van productgegevens gebeuren
      // Voor nu geven we een mock implementatie

      // Voorbeeld van geëxtraheerde gegevens
      const productData = {
        title: this.extractText(scrapeResult.html, '#productTitle'),
        price: this.extractPrice(scrapeResult.html, '.a-price .a-offscreen'),
        currency: this.extractCurrency(scrapeResult.html, '.a-price .a-offscreen'),
        rating: this.extractRating(scrapeResult.html, '#acrPopover'),
        reviewCount: this.extractReviewCount(scrapeResult.html, '#acrCustomerReviewText'),
        availability: this.extractText(scrapeResult.html, '#availability'),
        features: this.extractList(scrapeResult.html, '#feature-bullets .a-list-item'),
        description: this.extractText(scrapeResult.html, '#productDescription p'),
        images: this.extractImages(scrapeResult.html, '#imgTagWrapperId img'),
        brand: this.extractText(scrapeResult.html, '#bylineInfo'),
        categories: this.extractList(scrapeResult.html, '#wayfinding-breadcrumbs_feature_div .a-link-normal'),
        asin: this.extractAsin(scrapeResult.url),
        url: scrapeResult.url,
        scrapedAt: new Date().toISOString(),
      };

      return productData;
    } catch (error) {
      console.error('❌ Fout bij verwerken van Amazon product resultaat:', error);
      throw error;
    }
  }

  /**
   * Verwerk de resultaten van een Amazon zoekresultaten scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte zoekresultaten
   */
  processSearchResult(scrapeResult) {
    try {
      if (!scrapeResult || !scrapeResult.html) {
        throw new Error('Geen geldige scrape resultaat');
      }

      // Hier zou normaal gesproken HTML parsing en extractie van zoekresultaten gebeuren
      // Voor nu geven we een mock implementatie

      // Voorbeeld van geëxtraheerde gegevens
      const searchData = {
        query: this.extractSearchQuery(scrapeResult.url),
        totalResults: this.extractTotalResults(scrapeResult.html),
        products: this.extractSearchProducts(scrapeResult.html),
        filters: this.extractSearchFilters(scrapeResult.html),
        pagination: this.extractPagination(scrapeResult.html),
        url: scrapeResult.url,
        scrapedAt: new Date().toISOString(),
      };

      return searchData;
    } catch (error) {
      console.error('❌ Fout bij verwerken van Amazon zoek resultaat:', error);
      throw error;
    }
  }

  /**
   * Verwerk de resultaten van een Amazon review scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte reviews
   */
  processReviewResult(scrapeResult) {
    try {
      const { url, html } = scrapeResult;

      if (!html) {
        throw new Error('Geen HTML gevonden in scrape resultaat');
      }

      // Extraheer product ID uit URL
      const productId = this.extractProductIdFromReviewUrl(url);

      // Extraheer product informatie
      const productTitle = this.extractText(html, '#productTitle');
      const productUrl = url.split('/product-reviews')[0];

      // Extraheer reviews uit HTML
      const reviews = this.extractReviews(html);

      // Extraheer gemiddelde rating
      const averageRating = this.extractAverageRating(html);

      // Extraheer totaal aantal reviews
      const totalReviews = this.extractTotalReviews(html);

      // Extraheer rating breakdown
      const ratingBreakdown = this.extractRatingBreakdown(html);

      // Extraheer paginering
      const pagination = this.extractPagination(html);

      // Bepaal of er een sterrenfilter actief is
      const starFilter = this.extractStarFilter(url);

      return {
        product_id: productId,
        product_title: productTitle,
        product_url: productUrl,
        url,
        average_rating: averageRating,
        total_reviews: totalReviews,
        rating_breakdown: ratingBreakdown,
        star_filter: starFilter,
        reviews,
        pagination,
        marketplace: this.extractMarketplace(url),
        scraped_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Fout bij verwerken van Amazon review resultaat:', error);
      return {
        url: scrapeResult.url,
        error: error.message,
        scraped_at: new Date().toISOString(),
      };
    }
  }

  // Helper functies voor het extraheren van gegevens uit HTML

  /**
   * Extraheer tekst uit HTML met een selector
   * @param {String} html - HTML string
   * @param {String} selector - CSS selector
   * @returns {String} - Geëxtraheerde tekst
   */
  extractText(html, selector) {
    // Mock implementatie
    return `Extracted text from ${selector}`;
  }

  /**
   * Extraheer prijs uit HTML
   * @param {String} html - HTML string
   * @param {String} selector - CSS selector
   * @returns {Number} - Geëxtraheerde prijs
   */
  extractPrice(html, selector) {
    // Mock implementatie
    return 29.99;
  }

  /**
   * Extraheer valuta uit HTML
   * @param {String} html - HTML string
   * @param {String} selector - CSS selector
   * @returns {String} - Geëxtraheerde valuta
   */
  extractCurrency(html, selector) {
    // Mock implementatie
    return 'EUR';
  }

  /**
   * Extraheer rating uit HTML
   * @param {String} html - HTML string
   * @param {String} selector - CSS selector
   * @returns {Number} - Geëxtraheerde rating
   */
  extractRating(html, selector) {
    // Mock implementatie
    return 4.5;
  }

  /**
   * Extraheer aantal reviews uit HTML
   * @param {String} html - HTML string
   * @param {String} selector - CSS selector
   * @returns {Number} - Geëxtraheerd aantal reviews
   */
  extractReviewCount(html, selector) {
    // Mock implementatie
    return 123;
  }

  /**
   * Extraheer lijst uit HTML
   * @param {String} html - HTML string
   * @param {String} selector - CSS selector
   * @returns {Array<String>} - Geëxtraheerde lijst
   */
  extractList(html, selector) {
    // Mock implementatie
    return ['Item 1', 'Item 2', 'Item 3'];
  }

  /**
   * Extraheer afbeeldingen uit HTML
   * @param {String} html - HTML string
   * @param {String} selector - CSS selector
   * @returns {Array<String>} - Geëxtraheerde afbeelding URLs
   */
  extractImages(html, selector) {
    // Mock implementatie
    return ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'];
  }

  /**
   * Extraheer ASIN uit URL
   * @param {String} url - Product URL
   * @returns {String} - Geëxtraheerde ASIN
   */
  extractAsin(url) {
    try {
      const urlObj = new URL(url);
      const { pathname } = urlObj;

      // Zoek ASIN in /dp/ASIN of /gp/product/ASIN
      const dpMatch = pathname.match(/\/dp\/([A-Z0-9]{10})/);
      const gpMatch = pathname.match(/\/gp\/product\/([A-Z0-9]{10})/);

      if (dpMatch && dpMatch[1]) {
        return dpMatch[1];
      } if (gpMatch && gpMatch[1]) {
        return gpMatch[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer zoekquery uit URL
   * @param {String} url - Zoek URL
   * @returns {String} - Geëxtraheerde zoekquery
   */
  extractSearchQuery(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('k') || '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Extraheer totaal aantal resultaten uit HTML
   * @param {String} html - HTML string
   * @returns {Number} - Geëxtraheerd totaal aantal resultaten
   */
  extractTotalResults(html) {
    // Mock implementatie
    return 1234;
  }

  /**
   * Extraheer zoekresultaten uit HTML
   * @param {String} html - HTML string
   * @returns {Array<Object>} - Geëxtraheerde zoekresultaten
   */
  extractSearchProducts(html) {
    // Mock implementatie
    return [
      {
        title: 'Product 1',
        price: 19.99,
        currency: 'EUR',
        rating: 4.5,
        reviewCount: 123,
        image: 'https://example.com/image1.jpg',
        url: 'https://amazon.nl/dp/B00ABCDEF',
        asin: 'B00ABCDEF',
        sponsored: false,
      },
      {
        title: 'Product 2',
        price: 29.99,
        currency: 'EUR',
        rating: 4.0,
        reviewCount: 456,
        image: 'https://example.com/image2.jpg',
        url: 'https://amazon.nl/dp/B00GHIJKL',
        asin: 'B00GHIJKL',
        sponsored: true,
      },
    ];
  }

  /**
   * Extraheer zoekfilters uit HTML
   * @param {String} html - HTML string
   * @returns {Array<Object>} - Geëxtraheerde zoekfilters
   */
  extractSearchFilters(html) {
    // Mock implementatie
    return [
      {
        name: 'Brand',
        options: ['Brand 1', 'Brand 2', 'Brand 3'],
      },
      {
        name: 'Price',
        options: ['Under €10', '€10 to €20', 'Over €20'],
      },
    ];
  }

  /**
   * Extraheer paginering uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Geëxtraheerde paginering
   */
  extractPagination(html) {
    // Mock implementatie
    return {
      currentPage: 1,
      totalPages: 10,
      hasNext: true,
      hasPrevious: false,
      nextUrl: 'https://amazon.nl/s?k=query&page=2',
      previousUrl: null,
    };
  }

  /**
   * Extraheer product ID uit review URL
   * @param {String} url - Review URL
   * @returns {String} - Geëxtraheerd product ID
   */
  extractProductIdFromReviewUrl(url) {
    try {
      const urlObj = new URL(url);
      const { pathname } = urlObj;

      // Zoek product ID in /product-reviews/ID
      const match = pathname.match(/\/product-reviews\/([A-Z0-9]{10})/);

      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer gemiddelde rating uit HTML
   * @param {String} html - HTML string
   * @returns {Number} - Geëxtraheerde gemiddelde rating
   */
  extractAverageRating(html) {
    // Mock implementatie
    return 4.3;
  }

  /**
   * Extraheer totaal aantal reviews uit HTML
   * @param {String} html - HTML string
   * @returns {Number} - Geëxtraheerd totaal aantal reviews
   */
  extractTotalReviews(html) {
    try {
      // Zoek het element met het totaal aantal reviews
      const totalReviewsText = this.extractText(html, '#acrCustomerReviewText');

      if (!totalReviewsText) return 0;

      // Extraheer het getal uit de tekst (bijv. "123 reviews")
      const match = totalReviewsText.match(/([\d,.]+)/);

      if (match && match[1]) {
        // Verwijder komma's en punten en converteer naar een getal
        return parseInt(match[1].replace(/[,.]/g, ''), 10);
      }

      return 0;
    } catch (error) {
      console.error('Fout bij extraheren van totaal aantal reviews:', error);
      return 0;
    }
  }

  /**
   * Extraheer reviews uit HTML
   * @param {String} html - HTML string
   * @returns {Array<Object>} - Geëxtraheerde reviews
   */
  extractReviews(html) {
    try {
      // In een echte implementatie zou je hier de reviews uit de HTML extraheren
      // met behulp van een HTML parser zoals cheerio of JSDOM

      // Voor nu gebruiken we een mock implementatie die meer velden bevat
      return [
        {
          id: 'R1ABC123456789',
          title: 'Great product',
          rating: 5,
          date: '2023-01-15',
          text: 'This is a great product, I love it! The quality is excellent and it works exactly as described. I would definitely recommend this to anyone looking for this type of product.',
          reviewerName: 'John Doe',
          reviewerId: 'A1XYZ98765432',
          verifiedPurchase: true,
          helpfulVotes: 10,
          images: [
            'https://images-na.ssl-images-amazon.com/images/S/review-image-1.jpg',
          ],
          profileUrl: 'https://www.amazon.nl/gp/profile/amzn1.account.ABCDEFGHIJKLMNO',
          variant: 'Size: Large, Color: Blue',
          badges: ['Top 500 Reviewer', 'Vine Voice'],
        },
        {
          id: 'R2DEF987654321',
          title: 'Good but could be better',
          rating: 4,
          date: '2023-01-10',
          text: 'Good product but there are some issues. The build quality is great, but the instructions could be clearer. It took me a while to figure out how to set it up properly.',
          reviewerName: 'Jane Smith',
          reviewerId: 'A2ABC12345678',
          verifiedPurchase: true,
          helpfulVotes: 5,
          images: [],
          profileUrl: 'https://www.amazon.nl/gp/profile/amzn1.account.PQRSTUVWXYZ12345',
          variant: 'Size: Medium, Color: Red',
          badges: [],
        },
        {
          id: 'R3GHI123789456',
          title: 'Not worth the money',
          rating: 2,
          date: '2023-01-05',
          text: 'Disappointed with this purchase. The product arrived damaged and doesn\'t work as advertised. Customer service was not helpful when I tried to resolve the issue.',
          reviewerName: 'Bob Johnson',
          reviewerId: 'A3DEF98765432',
          verifiedPurchase: false,
          helpfulVotes: 20,
          images: [
            'https://images-na.ssl-images-amazon.com/images/S/review-image-2.jpg',
            'https://images-na.ssl-images-amazon.com/images/S/review-image-3.jpg',
          ],
          profileUrl: 'https://www.amazon.nl/gp/profile/amzn1.account.ABCDEF123456789',
          variant: 'Size: Small, Color: Green',
          badges: [],
        },
      ];
    } catch (error) {
      console.error('Fout bij extraheren van reviews:', error);
      return [];
    }
  }

  /**
   * Extraheer rating breakdown uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Geëxtraheerde rating breakdown
   */
  extractRatingBreakdown(html) {
    try {
      // In een echte implementatie zou je hier de rating breakdown uit de HTML extraheren
      // met behulp van een HTML parser

      // Voor nu gebruiken we een mock implementatie
      return {
        five_star: { percentage: 70, count: 553 },
        four_star: { percentage: 15, count: 118 },
        three_star: { percentage: 7, count: 55 },
        two_star: { percentage: 3, count: 24 },
        one_star: { percentage: 5, count: 39 },
      };
    } catch (error) {
      console.error('Fout bij extraheren van rating breakdown:', error);
      return {};
    }
  }

  /**
   * Extraheer actieve sterrenfilter uit URL
   * @param {String} url - Review URL
   * @returns {Number|null} - Geëxtraheerde sterrenfilter (1-5) of null als geen filter
   */
  extractStarFilter(url) {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      const filterByStar = params.get('filterByStar');

      if (!filterByStar) return null;

      const starMapping = {
        one_star: 1,
        two_star: 2,
        three_star: 3,
        four_star: 4,
        five_star: 5,
      };

      return starMapping[filterByStar] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer marketplace uit URL
   * @param {String} url - Amazon URL
   * @returns {String} - Geëxtraheerde marketplace (nl, de, com, etc.)
   */
  extractMarketplace(url) {
    try {
      const urlObj = new URL(url);
      const { hostname } = urlObj;

      // Extraheer de marketplace uit de hostname (bijv. amazon.nl -> nl)
      const match = hostname.match(/amazon\.([a-z]{2,})/i);

      if (match && match[1]) {
        return match[1].toLowerCase();
      }

      return 'com'; // Standaard marketplace
    } catch (error) {
      return 'com';
    }
  }

  /**
   * Genereer review URLs voor een product met paginering
   * @param {String} productId - ASIN van het product
   * @param {Number} pages - Aantal pagina's om te genereren
   * @param {String} marketplace - Marketplace (nl, de, com, etc.)
   * @param {Number} starFilter - Optionele filter op aantal sterren (1-5)
   * @returns {Array<String>} - Array van review URLs
   */
  generateReviewUrls(productId, pages = 1, marketplace = 'nl', starFilter = null) {
    const urls = [];

    // Basis URL voor reviews
    let baseUrl = `https://www.amazon.${marketplace}/product-reviews/${productId}/ref=cm_cr_arp_d_viewopt_srt`;

    // Voeg sterrenfilter toe indien nodig
    if (starFilter && starFilter >= 1 && starFilter <= 5) {
      const starMapping = {
        1: 'one_star',
        2: 'two_star',
        3: 'three_star',
        4: 'four_star',
        5: 'five_star',
      };

      baseUrl += `?filterByStar=${starMapping[starFilter]}`;
    }

    // Genereer URLs voor elke pagina
    for (let page = 1; page <= pages; page++) {
      // Voor pagina 1 hoeven we geen pageNumber parameter toe te voegen
      if (page === 1 && !starFilter) {
        urls.push(baseUrl);
      } else {
        // Voor pagina > 1 of met sterrenfilter, voeg pageNumber parameter toe
        const separator = baseUrl.includes('?') ? '&' : '?';
        urls.push(`${baseUrl}${separator}pageNumber=${page}`);
      }
    }

    return urls;
  }

  /**
   * Genereer review URLs voor meerdere producten
   * @param {Array<String>} productIds - Array van product ASINs
   * @param {Number} pagesPerProduct - Aantal pagina's per product
   * @param {String} marketplace - Marketplace (nl, de, com, etc.)
   * @returns {Array<String>} - Array van review URLs
   */
  generateMultiProductReviewUrls(productIds, pagesPerProduct = 1, marketplace = 'nl') {
    let urls = [];

    for (const productId of productIds) {
      const productUrls = this.generateReviewUrls(productId, pagesPerProduct, marketplace);
      urls = [...urls, ...productUrls];
    }

    return urls;
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de AmazonScraper
 * @returns {AmazonScraper} - AmazonScraper instance
 */
const getAmazonScraper = () => {
  if (!instance) {
    instance = new AmazonScraper();
  }
  return instance;
};

module.exports = {
  getAmazonScraper,
};
