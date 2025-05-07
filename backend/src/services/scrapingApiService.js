import axios from 'axios';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
import { textAnalysisUtils } from '../utils/textAnalysisUtils.js';

// Laad omgevingsvariabelen
dotenv.config();

/**
 * Service voor het gebruik van een professionele Scraping API
 */
class ScrapingApiService {
  constructor() {
    this.apiKey = process.env.SCRAPING_API_KEY;
    this.apiBaseUrl = process.env.SCRAPING_API_URL || 'https://scraper-api.decodo.com/v2/scrape';
    this.requestCount = 0;
    this.monthlyLimit = parseInt(process.env.SCRAPING_API_MONTHLY_LIMIT || '1000', 10); // Free trial limit
    this.requestsThisMonth = 0;
    this.lastResetDate = new Date();
    
    // Controleer of API key is geconfigureerd
    if (!this.apiKey) {
      logger.warn('Scraping API key is niet geconfigureerd in .env bestand');
    }
  }
  
  /**
   * Scrape een URL via de Decodo Scraping API
   * @param {string} url - URL om te scrapen
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - Response data
   */
  async scrapeUrl(url, options = {}) {
    if (!this.apiKey) {
      throw new Error('Scraping API key is niet geconfigureerd');
    }
    
    // Controleer limiet
    this.checkAndUpdateLimits();
    
    if (this.requestsThisMonth >= this.monthlyLimit) {
      logger.warn(`Maandelijkse limiet bereikt (${this.monthlyLimit} requests). Scraping API request geweigerd.`);
      throw new Error('Maandelijkse API limiet bereikt');
    }
    
    try {
      logger.info(`Scraping API: URL scrapen: ${url}`);
      
      // Bereid request body voor
      const requestBody = {
        url: url,
        headless: options.render_js === false ? "no" : "html", // Standaard met JS rendering
        ...this.mapOptionsToDecodo(options)
      };
      
      // Voer request uit met Basic Authentication
      const response = await axios.post(this.apiBaseUrl, requestBody, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.apiKey}`
        }
      });
      
      // Update tellers
      this.requestCount++;
      this.requestsThisMonth++;
      
      logger.info(`Scraping API: URL succesvol gescraped: ${url}`);
      return response.data;
    } catch (error) {
      // Controleer op API-specifieke errors
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.error || error.message;
        
        logger.error(`Scraping API error (${statusCode}): ${errorMessage}`);
        
        // Specifieke error handling
        if (statusCode === 401) {
          throw new Error('Ongeldige Scraping API key');
        } else if (statusCode === 429) {
          throw new Error('Scraping API rate limit bereikt');
        }
      }
      
      logger.error(`Scraping API: Fout bij scrapen URL ${url}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Vertaal opties naar Decodo API formaat
   * @param {object} options - Oorspronkelijke opties
   * @returns {object} - Decodo API opties
   */
  mapOptionsToDecodo(options) {
    const decodoOptions = {};
    
    // Locatie/land mapping
    if (options.country) {
      decodoOptions.geo = options.country;
    }
    
    // HTTP methode
    if (options.method) {
      decodoOptions.http_method = options.method;
    }
    
    // Taal instelling
    if (options.locale) {
      decodoOptions.locale = options.locale;
    } else if (options.country) {
      // Standaard locale op basis van land
      const countryToLocale = {
        'nl': 'nl-NL',
        'us': 'en-US',
        'uk': 'en-GB',
        'de': 'de-DE',
        'fr': 'fr-FR',
        'es': 'es-ES'
      };
      decodoOptions.locale = countryToLocale[options.country] || 'en-US';
    }
    
    // Device type
    if (options.device_type) {
      decodoOptions.device_type = options.device_type;
    } else {
      decodoOptions.device_type = 'desktop'; // Standaard desktop
    }
    
    // Headers
    if (options.headers) {
      decodoOptions.headers = options.headers;
    }
    
    // Cookies
    if (options.cookies) {
      decodoOptions.cookies = options.cookies;
    }
    
    // Session ID voor consistente scraping sessies
    if (options.session_id) {
      decodoOptions.session_id = options.session_id;
    }
    
    return decodoOptions;
  }
  
  /**
   * Scrape een URL en parse het resultaat als JSON
   * @param {string} url - URL om te scrapen
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - Geparsed JSON resultaat
   */
  async scrapeJson(url, options = {}) {
    const result = await this.scrapeUrl(url, {
      ...options,
      render_js: true
    });
    
    // Decodo API retourneert altijd een object met een html property
    // We moeten het resultaat zelf parsen als JSON
    if (result && result.html) {
      try {
        // Probeer de HTML te parsen als JSON
        return JSON.parse(result.html);
      } catch (error) {
        logger.warn(`Kon HTML niet parsen als JSON: ${error.message}`);
        return result; // Return originele resultaat als fallback
      }
    }
    
    return result;
  }
  
  /**
   * Scrape een URL met JavaScript rendering
   * @param {string} url - URL om te scrapen
   * @param {object} options - Opties voor de API
   * @returns {Promise<string>} - HTML resultaat
   */
  async scrapeWithJs(url, options = {}) {
    const result = await this.scrapeUrl(url, {
      ...options,
      render_js: true
    });
    
    // Decodo API retourneert een object met een html property
    return result.html || result;
  }
  
  /**
   * Scrape een URL vanuit een specifiek land
   * @param {string} url - URL om te scrapen
   * @param {string} country - Land code (bijv. 'us', 'nl', 'de')
   * @param {object} options - Opties voor de API
   * @returns {Promise<string|object>} - Scrape resultaat
   */
  async scrapeFromCountry(url, country, options = {}) {
    const result = await this.scrapeUrl(url, {
      ...options,
      country: country
    });
    
    // Decodo API retourneert een object met een html property
    return options.output === 'json' ? result : result.html || result;
  }
  
  /**
   * Scrape social media platform met speciale template
   * @param {string} platform - Platform naam ('tiktok', 'instagram', 'trustpilot', etc.)
   * @param {string} target - Target URL of identifier
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - Geparsed resultaat
   */
  async scrapeSocialMedia(platform, target, options = {}) {
    // Controleer of platform ondersteund wordt
    const supportedPlatforms = ['tiktok', 'instagram', 'trustpilot', 'facebook', 'twitter', 'linkedin', 'youtube', 'reddit', 'amazon'];
    
    if (!supportedPlatforms.includes(platform.toLowerCase())) {
      throw new Error(`Platform ${platform} wordt niet ondersteund. Ondersteunde platforms: ${supportedPlatforms.join(', ')}`);
    }
    
    return await this.scrapeUrl(target, {
      ...options,
      render_js: true,
      template: platform.toLowerCase(),
      output: 'json'
    });
  }
  
  /**
   * Scrape TikTok video's op basis van zoekwoord
   * @param {string} keyword - Zoekwoord
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - TikTok video's met geanalyseerde data
   */
  async scrapeTikTokVideos(keyword, options = {}) {
    const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`;
    
    logger.info(`Scraping TikTok video's voor zoekwoord: ${keyword}`);
    
    // Bepaal het domein op basis van de opties of standaard
    const domain_type = options.domain || 'social';
    
    // Haal ruwe data op via de API
    const rawData = await this.scrapeSocialMedia('tiktok', searchUrl, {
      ...options,
      search_term: keyword
    });
    
    // Verrijk de data met geanalyseerde inzichten
    return await this.enrichTikTokData(rawData, domain_type, options);
  }
  
  /**
   * Scrape TikTok posts
   * @param {string} username - TikTok gebruikersnaam
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - TikTok posts met geanalyseerde data
   */
  async scrapeTikTokPosts(username, options = {}) {
    const url = `https://www.tiktok.com/@${username}`;
    
    logger.info(`Scraping TikTok posts voor gebruiker: ${username}`);
    
    // Bepaal het domein op basis van de opties of standaard
    const domain_type = options.domain || 'social';
    
    // Haal ruwe data op via de API
    const rawData = await this.scrapeSocialMedia('tiktok', url, {
      ...options,
      username,
      content_type: 'posts'
    });
    
    // Verrijk de data met geanalyseerde inzichten
    return await this.enrichTikTokData(rawData, domain_type, options);
  }
  
  /**
   * Scrape TikTok hashtag posts
   * @param {string} hashtag - TikTok hashtag (zonder #)
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - TikTok hashtag posts met geanalyseerde data
   */
  async scrapeTikTokHashtag(hashtag, options = {}) {
    // Verwijder # als die is toegevoegd
    const sanitizedHashtag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
    const url = `https://www.tiktok.com/tag/${sanitizedHashtag}`;
    
    logger.info(`Scraping TikTok posts voor hashtag: #${sanitizedHashtag}`);
    
    // Bepaal het domein op basis van de opties of standaard
    const domain_type = options.domain || 'social';
    
    // Haal ruwe data op via de API
    const rawData = await this.scrapeSocialMedia('tiktok', url, {
      ...options,
      hashtag: sanitizedHashtag,
      content_type: 'hashtag'
    });
    
    // Verrijk de data met geanalyseerde inzichten
    return await this.enrichTikTokData(rawData, domain_type, options);
  }
  
  /**
   * Verrijk TikTok data met geanalyseerde inzichten
   * @param {object} rawData - Ruwe TikTok data
   * @param {string} domain - Domein voor terminologie extractie
   * @param {object} options - Opties voor analyse
   * @returns {Promise<object>} - Verrijkte TikTok data
   */
  async enrichTikTokData(rawData, domain = 'social', options = {}) {
    try {
      // Controleer of er posts/videos zijn
      if (!rawData || !rawData.videos || !Array.isArray(rawData.videos)) {
        logger.warn('Geen geldige TikTok videos gevonden om te verrijken');
        return rawData;
      }
      
      // Analyseer elke video
      const enrichedVideos = await Promise.all(rawData.videos.map(async video => {
        // Combineer beschrijving en comments voor analyse
        const videoContent = (video.description || '');
        const videoAnalysis = textAnalysisUtils.analyzeText(videoContent, domain);
        
        // Analyseer ook de comments als die beschikbaar zijn
        let enrichedComments = [];
        if (video.comments && Array.isArray(video.comments)) {
          enrichedComments = await Promise.all(video.comments.map(async comment => {
            const commentContent = comment.text || '';
            const commentAnalysis = textAnalysisUtils.analyzeText(commentContent, domain);
            
            return {
              ...comment,
              analysis: commentAnalysis
            };
          }));
        }
        
        // Return verrijkte video
        return {
          ...video,
          analysis: videoAnalysis,
          comments: enrichedComments.length > 0 ? enrichedComments : video.comments
        };
      }));
      
      // Verzamel alle pijnpunten, verlangens en terminologie
      let allPainPoints = [];
      let allDesires = [];
      let allTerminology = [];
      
      // Verzamel video statistieken
      const videoStats = [];
      
      // Doorloop alle verrijkte videos
      enrichedVideos.forEach(video => {
        // Voeg video analyse toe
        if (video.analysis) {
          if (video.analysis.painPoints) allPainPoints = [...allPainPoints, ...video.analysis.painPoints];
          if (video.analysis.desires) allDesires = [...allDesires, ...video.analysis.desires];
          if (video.analysis.terminology) allTerminology = [...allTerminology, ...video.analysis.terminology];
        }
        
        // Voeg comment analyses toe
        if (video.comments && Array.isArray(video.comments)) {
          video.comments.forEach(comment => {
            if (comment.analysis) {
              if (comment.analysis.painPoints) allPainPoints = [...allPainPoints, ...comment.analysis.painPoints];
              if (comment.analysis.desires) allDesires = [...allDesires, ...comment.analysis.desires];
              if (comment.analysis.terminology) allTerminology = [...allTerminology, ...comment.analysis.terminology];
            }
          });
        }
        
        // Verzamel video statistieken
        videoStats.push({
          id: video.id,
          url: video.url,
          description: video.description,
          likes: video.likes || 0,
          comments_count: video.comments_count || 0,
          shares: video.shares || 0,
          views: video.views || 0,
          engagement: (video.likes || 0) + (video.comments_count || 0) + (video.shares || 0),
          painPoints: video.analysis?.painPoints?.length || 0,
          desires: video.analysis?.desires?.length || 0
        });
      });
      
      // Groepeer pijnpunten per categorie
      const painPointsByCategory = this.groupByCategory(allPainPoints);
      
      // Groepeer verlangens per categorie
      const desiresByCategory = this.groupByCategory(allDesires);
      
      // Groepeer terminologie op frequentie
      const terminologyByFrequency = this.groupTerminologyByFrequency(allTerminology);
      
      // Sorteer video statistieken op engagement
      const sortedVideoStats = videoStats.sort((a, b) => b.engagement - a.engagement);
      
      // Genereer samenvatting
      const summary = {
        topPainPointCategories: this.getTopCategories(painPointsByCategory, 3).map(cat => cat.category),
        topDesireCategories: this.getTopCategories(desiresByCategory, 3).map(cat => cat.category),
        topTerms: allTerminology.slice(0, 10).map(term => term.term),
        totalVideos: enrichedVideos.length,
        totalPainPoints: allPainPoints.length,
        totalDesires: allDesires.length,
        totalTerminology: allTerminology.length,
        mostEngagedVideos: sortedVideoStats.slice(0, 5),
        averageEngagement: sortedVideoStats.reduce((sum, video) => sum + video.engagement, 0) / (sortedVideoStats.length || 1),
        averageViews: sortedVideoStats.reduce((sum, video) => sum + (video.views || 0), 0) / (sortedVideoStats.length || 1)
      };
      
      // Return verrijkte data
      return {
        ...rawData,
        videos: enrichedVideos,
        insights: {
          painPoints: {
            all: allPainPoints,
            byCategory: painPointsByCategory,
            topCategories: this.getTopCategories(painPointsByCategory, 5)
          },
          desires: {
            all: allDesires,
            byCategory: desiresByCategory,
            topCategories: this.getTopCategories(desiresByCategory, 5)
          },
          terminology: {
            all: allTerminology,
            byFrequency: terminologyByFrequency,
            top: allTerminology.slice(0, 20) // Top 20 termen
          },
          videoStats: {
            all: sortedVideoStats,
            top: sortedVideoStats.slice(0, 10)
          },
          summary
        }
      };
    } catch (error) {
      logger.error(`Fout bij verrijken van TikTok data: ${error.message}`);
      return rawData; // Return originele data bij fout
    }
  }
  
  /**
   * Scrape Instagram posts
   * @param {string} username - Instagram gebruikersnaam
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - Instagram posts met geanalyseerde data
   */
  async scrapeInstagramPosts(username, options = {}) {
    const url = `https://www.instagram.com/${username}/`;
    
    logger.info(`Scraping Instagram posts voor gebruiker: ${username}`);
    
    // Bepaal het domein op basis van de opties of standaard
    const domain_type = options.domain || 'social';
    
    // Haal ruwe data op via de API
    const rawData = await this.scrapeSocialMedia('instagram', url, {
      ...options,
      username,
      content_type: 'posts'
    });
    
    // Verrijk de data met geanalyseerde inzichten
    return await this.enrichInstagramData(rawData, domain_type, options);
  }
  
  /**
   * Scrape Instagram hashtag posts
   * @param {string} hashtag - Instagram hashtag (zonder #)
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - Instagram hashtag posts met geanalyseerde data
   */
  async scrapeInstagramHashtag(hashtag, options = {}) {
    // Verwijder # als die is toegevoegd
    const sanitizedHashtag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
    const url = `https://www.instagram.com/explore/tags/${sanitizedHashtag}/`;
    
    logger.info(`Scraping Instagram posts voor hashtag: #${sanitizedHashtag}`);
    
    // Bepaal het domein op basis van de opties of standaard
    const domain_type = options.domain || 'social';
    
    // Haal ruwe data op via de API
    const rawData = await this.scrapeSocialMedia('instagram', url, {
      ...options,
      hashtag: sanitizedHashtag,
      content_type: 'hashtag'
    });
    
    // Verrijk de data met geanalyseerde inzichten
    return await this.enrichInstagramData(rawData, domain_type, options);
  }
  
  /**
   * Verrijk Instagram data met geanalyseerde inzichten
   * @param {object} rawData - Ruwe Instagram data
   * @param {string} domain - Domein voor terminologie extractie
   * @param {object} options - Opties voor analyse
   * @returns {Promise<object>} - Verrijkte Instagram data
   */
  async enrichInstagramData(rawData, domain = 'social', options = {}) {
    try {
      // Controleer of er posts zijn
      if (!rawData || !rawData.posts || !Array.isArray(rawData.posts)) {
        logger.warn('Geen geldige Instagram posts gevonden om te verrijken');
        return rawData;
      }
      
      // Analyseer elke post
      const enrichedPosts = await Promise.all(rawData.posts.map(async post => {
        // Combineer caption en comments voor analyse
        const postContent = (post.caption || '');
        const postAnalysis = textAnalysisUtils.analyzeText(postContent, domain);
        
        // Analyseer ook de comments als die beschikbaar zijn
        let enrichedComments = [];
        if (post.comments && Array.isArray(post.comments)) {
          enrichedComments = await Promise.all(post.comments.map(async comment => {
            const commentContent = comment.text || '';
            const commentAnalysis = textAnalysisUtils.analyzeText(commentContent, domain);
            
            return {
              ...comment,
              analysis: commentAnalysis
            };
          }));
        }
        
        // Return verrijkte post
        return {
          ...post,
          analysis: postAnalysis,
          comments: enrichedComments.length > 0 ? enrichedComments : post.comments
        };
      }));
      
      // Verzamel alle pijnpunten, verlangens en terminologie
      let allPainPoints = [];
      let allDesires = [];
      let allTerminology = [];
      
      // Doorloop alle verrijkte posts
      enrichedPosts.forEach(post => {
        // Voeg post analyse toe
        if (post.analysis) {
          if (post.analysis.painPoints) allPainPoints = [...allPainPoints, ...post.analysis.painPoints];
          if (post.analysis.desires) allDesires = [...allDesires, ...post.analysis.desires];
          if (post.analysis.terminology) allTerminology = [...allTerminology, ...post.analysis.terminology];
        }
        
        // Voeg comment analyses toe
        if (post.comments && Array.isArray(post.comments)) {
          post.comments.forEach(comment => {
            if (comment.analysis) {
              if (comment.analysis.painPoints) allPainPoints = [...allPainPoints, ...comment.analysis.painPoints];
              if (comment.analysis.desires) allDesires = [...allDesires, ...comment.analysis.desires];
              if (comment.analysis.terminology) allTerminology = [...allTerminology, ...comment.analysis.terminology];
            }
          });
        }
      });
      
      // Groepeer pijnpunten per categorie
      const painPointsByCategory = this.groupByCategory(allPainPoints);
      
      // Groepeer verlangens per categorie
      const desiresByCategory = this.groupByCategory(allDesires);
      
      // Groepeer terminologie op frequentie
      const terminologyByFrequency = this.groupTerminologyByFrequency(allTerminology);
      
      // Genereer samenvatting
      const summary = {
        topPainPointCategories: this.getTopCategories(painPointsByCategory, 3).map(cat => cat.category),
        topDesireCategories: this.getTopCategories(desiresByCategory, 3).map(cat => cat.category),
        topTerms: allTerminology.slice(0, 10).map(term => term.term),
        totalPosts: enrichedPosts.length,
        totalPainPoints: allPainPoints.length,
        totalDesires: allDesires.length,
        totalTerminology: allTerminology.length,
        mostEngagedPosts: this.getMostEngagedPosts(enrichedPosts, 5)
      };
      
      // Return verrijkte data
      return {
        ...rawData,
        posts: enrichedPosts,
        insights: {
          painPoints: {
            all: allPainPoints,
            byCategory: painPointsByCategory,
            topCategories: this.getTopCategories(painPointsByCategory, 5)
          },
          desires: {
            all: allDesires,
            byCategory: desiresByCategory,
            topCategories: this.getTopCategories(desiresByCategory, 5)
          },
          terminology: {
            all: allTerminology,
            byFrequency: terminologyByFrequency,
            top: allTerminology.slice(0, 20) // Top 20 termen
          },
          summary
        }
      };
    } catch (error) {
      logger.error(`Fout bij verrijken van Instagram data: ${error.message}`);
      return rawData; // Return originele data bij fout
    }
  }
  
  /**
   * Haal de meest betrokken posts op basis van likes en comments
   * @param {Array} posts - Lijst met posts
   * @param {number} limit - Maximum aantal posts om terug te geven
   * @returns {Array} - Meest betrokken posts
   */
  getMostEngagedPosts(posts, limit = 5) {
    return posts
      .map(post => ({
        id: post.id,
        url: post.url,
        caption: post.caption,
        likes: post.likes || 0,
        comments_count: post.comments_count || 0,
        engagement: (post.likes || 0) + (post.comments_count || 0),
        painPoints: post.analysis?.painPoints?.length || 0,
        desires: post.analysis?.desires?.length || 0
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit);
  }
  
  /**
   * Scrape Instagram posts op basis van hashtag
   * @param {string} hashtag - Hashtag (zonder #)
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - Instagram posts
   */
  async scrapeInstagramPosts(hashtag, options = {}) {
    // Verwijder # indien aanwezig
    const cleanHashtag = hashtag.startsWith('#') ? hashtag.substring(1) : hashtag;
    const url = `https://www.instagram.com/explore/tags/${encodeURIComponent(cleanHashtag)}/`;
    
    return await this.scrapeSocialMedia('instagram', url, options);
  }
  
  /**
   * Scrape Trustpilot reviews voor een bedrijf
   * @param {string} companyName - Bedrijfsnaam
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - Trustpilot reviews
   */
  async scrapeTrustpilotReviews(companyName, options = {}) {
    // Probeer eerst directe URL
    const directUrl = `https://www.trustpilot.com/review/${companyName.toLowerCase().replace(/\s+/g, '-')}`;
    
    try {
      return await this.scrapeSocialMedia('trustpilot', directUrl, options);
    } catch (error) {
      // Als directe URL faalt, probeer zoekpagina
      logger.info(`Directe Trustpilot URL faalde, proberen via zoekpagina...`);
      const searchUrl = `https://www.trustpilot.com/search?query=${encodeURIComponent(companyName)}`;
      
      return await this.scrapeSocialMedia('trustpilot', searchUrl, options);
    }
  }
  
  /**
   * Scrape Reddit posts op basis van zoekwoord of subreddit
   * @param {string} query - Zoekwoord of subreddit naam
   * @param {boolean} isSubreddit - Of de query een subreddit naam is
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - Reddit posts met geanalyseerde data
   */
  async scrapeRedditPosts(query, isSubreddit = false, options = {}) {
    let url;
    
    if (isSubreddit) {
      // Verwijder r/ indien aanwezig
      const cleanSubreddit = query.startsWith('r/') ? query.substring(2) : query;
      url = `https://www.reddit.com/r/${cleanSubreddit}/`;
      logger.info(`Scraping Reddit subreddit: r/${cleanSubreddit}`);
    } else {
      // Zoekwoord
      url = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`;
      logger.info(`Scraping Reddit zoekresultaten voor: ${query}`);
    }
    
    // Bepaal het domein op basis van de query of opties
    const domain = options.domain || this.determineDomain(query);
    
    // Haal ruwe data op via de API
    const rawData = await this.scrapeSocialMedia('reddit', url, {
      ...options,
      search_term: query
    });
    
    // Verrijk de data met geanalyseerde inzichten
    return await this.enrichRedditData(rawData, domain, options);
  }
  
  /**
   * Verrijk Reddit data met geanalyseerde inzichten
   * @param {object} rawData - Ruwe Reddit data
   * @param {string} domain - Domein voor terminologie extractie
   * @param {object} options - Opties voor analyse
   * @returns {Promise<object>} - Verrijkte Reddit data
   */
  async enrichRedditData(rawData, domain = 'general', options = {}) {
    try {
      // Controleer of er posts zijn
      if (!rawData || !rawData.posts || !Array.isArray(rawData.posts)) {
        logger.warn('Geen geldige Reddit posts gevonden om te verrijken');
        return rawData;
      }
      
      // Analyseer elke post en comment
      const enrichedPosts = await Promise.all(rawData.posts.map(async post => {
        // Analyseer de post tekst
        const postContent = post.title + ' ' + (post.selftext || '');
        const postAnalysis = textAnalysisUtils.analyzeText(postContent, domain);
        
        // Analyseer comments als ze beschikbaar zijn
        let enrichedComments = [];
        if (post.comments && Array.isArray(post.comments)) {
          enrichedComments = await Promise.all(post.comments.map(async comment => {
            const commentAnalysis = textAnalysisUtils.analyzeText(comment.body || '', domain);
            return {
              ...comment,
              analysis: commentAnalysis
            };
          }));
        }
        
        // Return verrijkte post
        return {
          ...post,
          analysis: postAnalysis,
          comments: enrichedComments
        };
      }));
      
      // Aggregeer alle inzichten voor een overzicht
      const aggregatedInsights = this.aggregateRedditInsights(enrichedPosts, domain);
      
      // Return verrijkte data
      return {
        ...rawData,
        posts: enrichedPosts,
        insights: aggregatedInsights
      };
    } catch (error) {
      logger.error(`Fout bij verrijken van Reddit data: ${error.message}`);
      return rawData; // Return originele data bij fout
    }
  }
  
  /**
   * Aggregeer inzichten uit meerdere Reddit posts
   * @param {Array} posts - Verrijkte Reddit posts
   * @param {string} domain - Domein voor categorisering
   * @returns {object} - Geaggregeerde inzichten
   */
  aggregateRedditInsights(posts, domain = 'general') {
    try {
      // Verzamel alle pijnpunten, verlangens en terminologie
      let allPainPoints = [];
      let allDesires = [];
      let allTerminology = [];
      
      // Doorloop alle posts
      posts.forEach(post => {
        // Voeg post analyse toe
        if (post.analysis) {
          if (post.analysis.painPoints) allPainPoints = [...allPainPoints, ...post.analysis.painPoints];
          if (post.analysis.desires) allDesires = [...allDesires, ...post.analysis.desires];
          if (post.analysis.terminology) allTerminology = [...allTerminology, ...post.analysis.terminology];
        }
        
        // Doorloop alle comments
        if (post.comments && Array.isArray(post.comments)) {
          post.comments.forEach(comment => {
            if (comment.analysis) {
              if (comment.analysis.painPoints) allPainPoints = [...allPainPoints, ...comment.analysis.painPoints];
              if (comment.analysis.desires) allDesires = [...allDesires, ...comment.analysis.desires];
              if (comment.analysis.terminology) allTerminology = [...allTerminology, ...comment.analysis.terminology];
            }
          });
        }
      });
      
      // Groepeer pijnpunten per categorie
      const painPointsByCategory = this.groupByCategory(allPainPoints);
      
      // Groepeer verlangens per categorie
      const desiresByCategory = this.groupByCategory(allDesires);
      
      // Groepeer terminologie op frequentie
      const terminologyByFrequency = this.groupTerminologyByFrequency(allTerminology);
      
      // Return geaggregeerde inzichten
      return {
        painPoints: {
          all: allPainPoints,
          byCategory: painPointsByCategory,
          topCategories: this.getTopCategories(painPointsByCategory, 5)
        },
        desires: {
          all: allDesires,
          byCategory: desiresByCategory,
          topCategories: this.getTopCategories(desiresByCategory, 5)
        },
        terminology: {
          all: allTerminology,
          byFrequency: terminologyByFrequency,
          top: allTerminology.slice(0, 20) // Top 20 termen
        },
        summary: this.generateInsightsSummary(painPointsByCategory, desiresByCategory, terminologyByFrequency)
      };
    } catch (error) {
      logger.error(`Fout bij aggregeren van Reddit inzichten: ${error.message}`);
      return {
        painPoints: { all: [], byCategory: {}, topCategories: [] },
        desires: { all: [], byCategory: {}, topCategories: [] },
        terminology: { all: [], byFrequency: {}, top: [] },
        summary: {}
      };
    }
  }
  
  /**
   * Groepeer items per categorie
   * @param {Array} items - Items met een category eigenschap
   * @returns {object} - Items gegroepeerd per categorie
   */
  groupByCategory(items) {
    return items.reduce((acc, item) => {
      const category = item.category || 'overig';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }
  
  /**
   * Groepeer terminologie op frequentie
   * @param {Array} terminology - Terminologie items
   * @returns {object} - Terminologie gegroepeerd op frequentie
   */
  groupTerminologyByFrequency(terminology) {
    return terminology.reduce((acc, item) => {
      const frequency = item.frequency || 1;
      if (!acc[frequency]) acc[frequency] = [];
      acc[frequency].push(item);
      return acc;
    }, {});
  }
  
  /**
   * Haal de top categorieën op basis van aantal items
   * @param {object} categorizedItems - Items gegroepeerd per categorie
   * @param {number} limit - Maximum aantal categorieën om terug te geven
   * @returns {Array} - Top categorieën met aantal items
   */
  getTopCategories(categorizedItems, limit = 5) {
    return Object.entries(categorizedItems)
      .map(([category, items]) => ({
        category,
        count: items.length,
        items: items.slice(0, 3) // Top 3 items per categorie
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  /**
   * Genereer een samenvatting van de inzichten
   * @param {object} painPointsByCategory - Pijnpunten per categorie
   * @param {object} desiresByCategory - Verlangens per categorie
   * @param {object} terminologyByFrequency - Terminologie per frequentie
   * @returns {object} - Samenvatting van inzichten
   */
  generateInsightsSummary(painPointsByCategory, desiresByCategory, terminologyByFrequency) {
    // Top pijnpunt categorieën
    const topPainPointCategories = Object.entries(painPointsByCategory)
      .map(([category, items]) => ({ category, count: items.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.category);
    
    // Top verlangen categorieën
    const topDesireCategories = Object.entries(desiresByCategory)
      .map(([category, items]) => ({ category, count: items.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.category);
    
    // Top terminologie
    const allTerminology = Object.values(terminologyByFrequency).flat();
    const topTerms = allTerminology
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)
      .map(item => item.term);
    
    return {
      topPainPointCategories,
      topDesireCategories,
      topTerms,
      totalPainPoints: Object.values(painPointsByCategory).flat().length,
      totalDesires: Object.values(desiresByCategory).flat().length,
      totalTerms: allTerminology.length
    };
  }
  
  /**
   * Bepaal het domein op basis van een query
   * @param {string} query - De zoekopdracht of subreddit
   * @returns {string} - Het bepaalde domein
   */
  determineDomain(query) {
    const query_lower = query.toLowerCase();
    
    // E-commerce gerelateerde termen
    if (/\b(ecommerce|webshop|online\s+shop|product|shopping|retail)\b/i.test(query_lower)) {
      return 'ecommerce';
    }
    
    // Beauty gerelateerde termen
    if (/\b(beauty|skin|hair|makeup|cosmetic|skincare|haircare)\b/i.test(query_lower)) {
      return 'beauty';
    }
    
    // Tech gerelateerde termen
    if (/\b(tech|software|hardware|app|gadget|computer|smartphone|laptop)\b/i.test(query_lower)) {
      return 'tech';
    }
    
    // Food gerelateerde termen
    if (/\b(food|recipe|cooking|diet|nutrition|meal|restaurant|ingredient)\b/i.test(query_lower)) {
      return 'food';
    }
    
    // Standaard domein
    return 'general';
  }
  
  /**
   * Scrape Amazon product details
   * @param {string} productId - Amazon product ID (ASIN)
   * @param {string} countryCode - Amazon landcode (bijv. 'nl', 'de', 'com')
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - Amazon product details
   */
  async scrapeAmazonProduct(productId, countryCode = 'nl', options = {}) {
    const domain = countryCode === 'com' ? 'com' : `${countryCode}`;
    const url = `https://www.amazon.${domain}/dp/${productId}`;
    
    logger.info(`Scraping Amazon product: ${productId} van amazon.${domain}`);
    
    return await this.scrapeSocialMedia('amazon', url, {
      ...options,
      product_id: productId,
      country: countryCode
    });
  }
  
  /**
   * Scrape Amazon product reviews
   * @param {string} productId - Amazon product ID (ASIN)
   * @param {string} countryCode - Amazon landcode (bijv. 'nl', 'de', 'com')
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - Amazon product reviews met geanalyseerde data
   */
  async scrapeAmazonReviews(productId, countryCode = 'nl', options = {}) {
    const domain = countryCode === 'com' ? 'com' : `${countryCode}`;
    const url = `https://www.amazon.${domain}/product-reviews/${productId}`;
    
    logger.info(`Scraping Amazon reviews voor product: ${productId} van amazon.${domain}`);
    
    // Bepaal het domein op basis van de product categorie of opties
    const domain_type = options.domain || 'ecommerce';
    
    // Haal ruwe data op via de API
    const rawData = await this.scrapeSocialMedia('amazon', url, {
      ...options,
      product_id: productId,
      country: countryCode,
      content_type: 'reviews'
    });
    
    // Verrijk de data met geanalyseerde inzichten
    return await this.enrichAmazonReviews(rawData, domain_type, options);
  }
  
  /**
   * Verrijk Amazon reviews met geanalyseerde inzichten
   * @param {object} rawData - Ruwe Amazon reviews data
   * @param {string} domain - Domein voor terminologie extractie
   * @param {object} options - Opties voor analyse
   * @returns {Promise<object>} - Verrijkte Amazon reviews data
   */
  async enrichAmazonReviews(rawData, domain = 'ecommerce', options = {}) {
    try {
      // Controleer of er reviews zijn
      if (!rawData || !rawData.reviews || !Array.isArray(rawData.reviews)) {
        logger.warn('Geen geldige Amazon reviews gevonden om te verrijken');
        return rawData;
      }
      
      // Analyseer elke review
      const enrichedReviews = await Promise.all(rawData.reviews.map(async review => {
        // Combineer titel en tekst voor analyse
        const reviewContent = (review.title || '') + ' ' + (review.content || '');
        const reviewAnalysis = textAnalysisUtils.analyzeText(reviewContent, domain);
        
        // Bepaal of het een positieve of negatieve review is op basis van rating
        const rating = parseFloat(review.rating) || 0;
        const sentiment = rating >= 4 ? 'positief' : (rating <= 2 ? 'negatief' : 'neutraal');
        
        // Return verrijkte review
        return {
          ...review,
          analysis: reviewAnalysis,
          sentiment: sentiment
        };
      }));
      
      // Splits reviews in positief, neutraal en negatief
      const positiveReviews = enrichedReviews.filter(review => review.sentiment === 'positief');
      const neutralReviews = enrichedReviews.filter(review => review.sentiment === 'neutraal');
      const negativeReviews = enrichedReviews.filter(review => review.sentiment === 'negatief');
      
      // Aggregeer alle inzichten voor een overzicht
      const aggregatedInsights = this.aggregateAmazonReviewInsights(enrichedReviews, domain);
      
      // Return verrijkte data
      return {
        ...rawData,
        reviews: enrichedReviews,
        reviewsByType: {
          positive: positiveReviews,
          neutral: neutralReviews,
          negative: negativeReviews
        },
        insights: aggregatedInsights
      };
    } catch (error) {
      logger.error(`Fout bij verrijken van Amazon reviews: ${error.message}`);
      return rawData; // Return originele data bij fout
    }
  }
  
  /**
   * Aggregeer inzichten uit Amazon reviews
   * @param {Array} reviews - Verrijkte Amazon reviews
   * @param {string} domain - Domein voor categorisering
   * @returns {object} - Geaggregeerde inzichten
   */
  aggregateAmazonReviewInsights(reviews, domain = 'ecommerce') {
    try {
      // Verzamel alle pijnpunten, verlangens en terminologie
      let allPainPoints = [];
      let allDesires = [];
      let allTerminology = [];
      
      // Verzamel positieve en negatieve aspecten
      const positiveAspects = [];
      const negativeAspects = [];
      
      // Doorloop alle reviews
      reviews.forEach(review => {
        // Voeg review analyse toe
        if (review.analysis) {
          if (review.analysis.painPoints) allPainPoints = [...allPainPoints, ...review.analysis.painPoints];
          if (review.analysis.desires) allDesires = [...allDesires, ...review.analysis.desires];
          if (review.analysis.terminology) allTerminology = [...allTerminology, ...review.analysis.terminology];
          
          // Categoriseer op basis van sentiment
          if (review.sentiment === 'positief') {
            // Voeg verlangens toe aan positieve aspecten
            review.analysis.desires.forEach(desire => {
              positiveAspects.push({
                aspect: desire.text,
                category: desire.category,
                score: desire.score,
                source: 'desire',
                reviewId: review.id
              });
            });
          } else if (review.sentiment === 'negatief') {
            // Voeg pijnpunten toe aan negatieve aspecten
            review.analysis.painPoints.forEach(painPoint => {
              negativeAspects.push({
                aspect: painPoint.text,
                category: painPoint.category,
                score: painPoint.score,
                source: 'painPoint',
                reviewId: review.id
              });
            });
          }
        }
      });
      
      // Groepeer pijnpunten per categorie
      const painPointsByCategory = this.groupByCategory(allPainPoints);
      
      // Groepeer verlangens per categorie
      const desiresByCategory = this.groupByCategory(allDesires);
      
      // Groepeer terminologie op frequentie
      const terminologyByFrequency = this.groupTerminologyByFrequency(allTerminology);
      
      // Groepeer positieve en negatieve aspecten per categorie
      const positiveAspectsByCategory = this.groupAspectsByCategory(positiveAspects);
      const negativeAspectsByCategory = this.groupAspectsByCategory(negativeAspects);
      
      // Identificeer productkenmerken die vaak genoemd worden
      const productFeatures = this.identifyProductFeatures(allTerminology, reviews);
      
      // Return geaggregeerde inzichten
      return {
        painPoints: {
          all: allPainPoints,
          byCategory: painPointsByCategory,
          topCategories: this.getTopCategories(painPointsByCategory, 5)
        },
        desires: {
          all: allDesires,
          byCategory: desiresByCategory,
          topCategories: this.getTopCategories(desiresByCategory, 5)
        },
        terminology: {
          all: allTerminology,
          byFrequency: terminologyByFrequency,
          top: allTerminology.slice(0, 20) // Top 20 termen
        },
        productFeatures: productFeatures,
        positiveAspects: {
          all: positiveAspects,
          byCategory: positiveAspectsByCategory,
          top: this.getTopAspects(positiveAspects, 10)
        },
        negativeAspects: {
          all: negativeAspects,
          byCategory: negativeAspectsByCategory,
          top: this.getTopAspects(negativeAspects, 10)
        },
        summary: this.generateProductInsightsSummary(painPointsByCategory, desiresByCategory, positiveAspectsByCategory, negativeAspectsByCategory, productFeatures)
      };
    } catch (error) {
      logger.error(`Fout bij aggregeren van Amazon review inzichten: ${error.message}`);
      return {
        painPoints: { all: [], byCategory: {}, topCategories: [] },
        desires: { all: [], byCategory: {}, topCategories: [] },
        terminology: { all: [], byFrequency: {}, top: [] },
        productFeatures: [],
        positiveAspects: { all: [], byCategory: {}, top: [] },
        negativeAspects: { all: [], byCategory: {}, top: [] },
        summary: {}
      };
    }
  }
  
  /**
   * Groepeer aspecten per categorie
   * @param {Array} aspects - Aspecten met een category eigenschap
   * @returns {object} - Aspecten gegroepeerd per categorie
   */
  groupAspectsByCategory(aspects) {
    return aspects.reduce((acc, aspect) => {
      const category = aspect.category || 'overig';
      if (!acc[category]) acc[category] = [];
      acc[category].push(aspect);
      return acc;
    }, {});
  }
  
  /**
   * Haal de top aspecten op basis van score
   * @param {Array} aspects - Lijst met aspecten
   * @param {number} limit - Maximum aantal aspecten om terug te geven
   * @returns {Array} - Top aspecten
   */
  getTopAspects(aspects, limit = 10) {
    return aspects
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  /**
   * Identificeer productkenmerken uit terminologie en reviews
   * @param {Array} terminology - Geëxtraheerde terminologie
   * @param {Array} reviews - Verrijkte reviews
   * @returns {Array} - Geïdentificeerde productkenmerken
   */
  identifyProductFeatures(terminology, reviews) {
    // Productkenmerken patronen
    const featurePatterns = [
      /\b(kwaliteit|quality)\b/i,
      /\b(prijs|price)\b/i,
      /\b(design|ontwerp)\b/i,
      /\b(gebruiksgemak|ease of use|user-friendly)\b/i,
      /\b(duurzaamheid|durability)\b/i,
      /\b(functionaliteit|functionality)\b/i,
      /\b(betrouwbaarheid|reliability)\b/i,
      /\b(materiaal|material)\b/i,
      /\b(formaat|size)\b/i,
      /\b(gewicht|weight)\b/i,
      /\b(batterij|battery)\b/i,
      /\b(snelheid|speed)\b/i,
      /\b(prestatie|performance)\b/i
    ];
    
    // Zoek naar productkenmerken in terminologie
    const features = [];
    const addedFeatures = new Set(); // Voorkom duplicaten
    
    terminology.forEach(term => {
      featurePatterns.forEach(pattern => {
        if (pattern.test(term.term) && !addedFeatures.has(term.term)) {
          // Zoek positieve en negatieve mentions
          const positiveMentions = reviews.filter(review => 
            review.sentiment === 'positief' && 
            (review.content || '').toLowerCase().includes(term.term.toLowerCase())
          ).length;
          
          const negativeMentions = reviews.filter(review => 
            review.sentiment === 'negatief' && 
            (review.content || '').toLowerCase().includes(term.term.toLowerCase())
          ).length;
          
          features.push({
            feature: term.term,
            frequency: term.frequency,
            positiveMentions,
            negativeMentions,
            sentiment: positiveMentions > negativeMentions ? 'positief' : 
                      (negativeMentions > positiveMentions ? 'negatief' : 'neutraal'),
            sentimentScore: (positiveMentions - negativeMentions) / (positiveMentions + negativeMentions || 1)
          });
          
          addedFeatures.add(term.term);
        }
      });
    });
    
    // Sorteer op frequentie (hoog naar laag)
    return features.sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Genereer een samenvatting van de product inzichten
   * @param {object} painPointsByCategory - Pijnpunten per categorie
   * @param {object} desiresByCategory - Verlangens per categorie
   * @param {object} positiveAspectsByCategory - Positieve aspecten per categorie
   * @param {object} negativeAspectsByCategory - Negatieve aspecten per categorie
   * @param {Array} productFeatures - Geïdentificeerde productkenmerken
   * @returns {object} - Samenvatting van inzichten
   */
  generateProductInsightsSummary(painPointsByCategory, desiresByCategory, positiveAspectsByCategory, negativeAspectsByCategory, productFeatures) {
    // Top pijnpunt categorieën
    const topPainPointCategories = Object.entries(painPointsByCategory)
      .map(([category, items]) => ({ category, count: items.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.category);
    
    // Top verlangen categorieën
    const topDesireCategories = Object.entries(desiresByCategory)
      .map(([category, items]) => ({ category, count: items.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.category);
    
    // Top positieve aspect categorieën
    const topPositiveCategories = Object.entries(positiveAspectsByCategory)
      .map(([category, items]) => ({ category, count: items.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.category);
    
    // Top negatieve aspect categorieën
    const topNegativeCategories = Object.entries(negativeAspectsByCategory)
      .map(([category, items]) => ({ category, count: items.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.category);
    
    // Top productkenmerken
    const topFeatures = productFeatures
      .slice(0, 5)
      .map(feature => ({
        feature: feature.feature,
        sentiment: feature.sentiment,
        score: feature.sentimentScore
      }));
    
    // Identificeer verbeterpunten (negatieve aspecten met hoge frequentie)
    const improvementAreas = this.getTopAspects(negativeAspectsByCategory.flat() || [], 3)
      .map(aspect => aspect.category || 'overig');
    
    return {
      topPainPointCategories,
      topDesireCategories,
      topPositiveCategories,
      topNegativeCategories,
      topFeatures,
      improvementAreas,
      totalPainPoints: Object.values(painPointsByCategory).flat().length,
      totalDesires: Object.values(desiresByCategory).flat().length,
      totalPositiveAspects: Object.values(positiveAspectsByCategory).flat().length,
      totalNegativeAspects: Object.values(negativeAspectsByCategory).flat().length
    };
  }
  
  /**
   * Scrape Amazon zoekresultaten
   * @param {string} keyword - Zoekwoord
   * @param {string} countryCode - Amazon landcode (bijv. 'nl', 'de', 'com')
   * @param {object} options - Opties voor de API
   * @returns {Promise<object>} - Amazon zoekresultaten
   */
  async scrapeAmazonSearch(keyword, countryCode = 'nl', options = {}) {
    const domain = countryCode === 'com' ? 'com' : `${countryCode}`;
    const url = `https://www.amazon.${domain}/s?k=${encodeURIComponent(keyword)}`;
    
    logger.info(`Scraping Amazon zoekresultaten voor: ${keyword} op amazon.${domain}`);
    
    return await this.scrapeSocialMedia('amazon', url, {
      ...options,
      search_term: keyword,
      country: countryCode
    });
  }
  
  /**
   * Haal standaard opties op voor de API
   * @returns {object} - Standaard opties
   */
  getDefaultOptions() {
    return {
      headless: "html", // Standaard met JS rendering
      device_type: "desktop",
      locale: "nl-NL",
      http_method: "GET"
    };
  }
  
  /**
   * Controleer en update de maandelijkse limieten
   */
  checkAndUpdateLimits() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const lastMonth = this.lastResetDate.getMonth();
    
    // Reset teller als we in een nieuwe maand zijn
    if (currentMonth !== lastMonth) {
      this.requestsThisMonth = 0;
      this.lastResetDate = now;
      logger.info(`Scraping API maandelijkse teller gereset. Nieuwe maand: ${currentMonth + 1}`);
    }
  }
  
  /**
   * Krijg statistieken over API gebruik
   * @returns {object} - Statistieken
   */
  getStats() {
    this.checkAndUpdateLimits();
    
    const usagePercentage = (this.requestsThisMonth / this.monthlyLimit) * 100;
    const remaining = this.monthlyLimit - this.requestsThisMonth;
    
    return {
      totalRequests: this.requestCount,
      requestsThisMonth: this.requestsThisMonth,
      monthlyLimit: this.monthlyLimit,
      remaining: remaining,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
      lastResetDate: this.lastResetDate.toISOString()
    };
  }
}

// Singleton instantie
export const scrapingApiService = new ScrapingApiService();

export default scrapingApiService;
