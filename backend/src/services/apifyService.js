import { ApifyClient } from 'apify-client';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Laad omgevingsvariabelen
dotenv.config();

// Apify client initialiseren
const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

/**
 * Constanten voor Apify actor IDs
 */
const APIFY_ACTORS = {
  AMAZON_PRODUCT_SCRAPER: 'logical_scrapers/amazon-product-scraper',
  AMAZON_REVIEWS_SCRAPER: 'getdataforme/amazon-product-reviews-scraper',
  REDDIT_SCRAPER: 'trudax/reddit-scraper',
  TIKTOK_SCRAPER: 'clockworks/tiktok-scraper',
  INSTAGRAM_SCRAPER: 'apify/instagram-scraper',
  TRUSTPILOT_SCRAPER: 'vaclavrut/trustpilot-scraper'
};

/**
 * Service voor het ophalen van data via Apify API's
 */
export const apifyService = {
  /**
   * Haal productgegevens op van Amazon via Apify
   * @param {string} keyword - Zoekwoord voor producten
   * @param {object} options - Opties voor de zoekopdracht
   * @returns {Promise<Array>} - Array met productgegevens
   */
  async getAmazonProducts(keyword, options = {}) {
    try {
      logger.info(`Apify: Amazon producten ophalen voor keyword: ${keyword}`);
      
      // Stel de input samen voor de Amazon product scraper
      const input = {
        search: keyword,
        country: options.country || 'NL', // Standaard Nederland
        maxItems: options.maxItems || 20,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        },
        extendOutputFunction: options.extendOutputFunction || '',
        customMapFunction: options.customMapFunction || ''
      };
      
      // Start een run van de Amazon product scraper
      const run = await apifyClient.actor('logical_scrapers/amazon-product-scraper').call({
        runInput: input
      });
      
      // Haal de resultaten op uit de dataset
      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      
      logger.info(`Apify: ${items.length} Amazon producten opgehaald voor keyword: ${keyword}`);
      return items;
    } catch (error) {
      logger.error(`Apify: Fout bij ophalen Amazon producten: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal productreviews op van Amazon via Apify
   * @param {string} asin - ASIN van het product
   * @param {object} options - Opties voor de zoekopdracht
   * @returns {Promise<Array>} - Array met reviews
   */
  async getAmazonProductReviews(asin, options = {}) {
    try {
      logger.info(`Apify: Amazon reviews ophalen voor ASIN: ${asin}`);
      
      // Stel de input samen voor de Amazon product reviews scraper
      const input = {
        asins: [asin],
        country: options.country || 'NL', // Standaard Nederland
        maxReviews: options.maxReviews || 50,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        }
      };
      
      // Start een run van de Amazon product reviews scraper
      const run = await apifyClient.actor('getdataforme/amazon-product-reviews-scraper').call({
        runInput: input
      });
      
      // Haal de resultaten op uit de dataset
      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      
      logger.info(`Apify: ${items.length} Amazon reviews opgehaald voor ASIN: ${asin}`);
      return items;
    } catch (error) {
      logger.error(`Apify: Fout bij ophalen Amazon reviews: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal posts op van Reddit via Apify
   * @param {string} keyword - Zoekwoord voor posts
   * @param {object} options - Opties voor de zoekopdracht
   * @returns {Promise<Array>} - Array met Reddit posts
   */
  async getRedditPosts(keyword, options = {}) {
    try {
      logger.info(`Apify: Reddit posts ophalen voor keyword: ${keyword}`);
      
      // Stel de input samen voor de Reddit scraper
      const input = {
        searchType: 'search',
        searchTerms: [keyword],
        maxItems: options.maxItems || 50,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        },
        extendOutputFunction: options.extendOutputFunction || '',
        customMapFunction: options.customMapFunction || '',
        includeComments: options.includeComments || true,
        maxComments: options.maxComments || 20,
        maxCommentsDepth: options.maxCommentsDepth || 2
      };
      
      // Als er specifieke subreddits zijn opgegeven, voeg ze toe aan de input
      if (options.subreddits && options.subreddits.length > 0) {
        input.subreddits = options.subreddits;
      }
      
      // Start een run van de Reddit scraper
      const run = await apifyClient.actor('trudax/reddit-scraper').call({
        runInput: input
      });
      
      // Haal de resultaten op uit de dataset
      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      
      logger.info(`Apify: ${items.length} Reddit posts opgehaald voor keyword: ${keyword}`);
      return items;
    } catch (error) {
      logger.error(`Apify: Fout bij ophalen Reddit posts: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal subreddit informatie op via Apify
   * @param {string} subreddit - Naam van de subreddit
   * @param {object} options - Opties voor de zoekopdracht
   * @returns {Promise<Object>} - Subreddit informatie
   */
  async getSubredditInfo(subreddit, options = {}) {
    try {
      logger.info(`Apify: Informatie ophalen voor subreddit: ${subreddit}`);
      
      // Stel de input samen voor de Reddit scraper
      const input = {
        searchType: 'communities',
        communities: [subreddit],
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL'],
        }
      };
      
      // Start een run van de Reddit scraper
      const run = await apifyClient.actor('trudax/reddit-scraper').call({
        runInput: input
      });
      
      // Haal de resultaten op uit de dataset
      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      
      if (items.length === 0) {
        logger.warn(`Apify: Geen informatie gevonden voor subreddit: ${subreddit}`);
        return null;
      }
      
      logger.info(`Apify: Informatie opgehaald voor subreddit: ${subreddit}`);
      return items[0];
    } catch (error) {
      logger.error(`Apify: Fout bij ophalen subreddit informatie: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verwerk Amazon productdata naar een gestandaardiseerd formaat
   * @param {Array} products - Ruwe productdata van Apify
   * @returns {Array} - Gestandaardiseerde productdata
   */
  processAmazonProducts(products) {
    try {
      if (!products || products.length === 0) {
        return [];
      }
      
      return products.map(product => {
        // Basisinformatie
        return {
          asin: product.asin || '',
          title: product.title || '',
          url: product.url || '',
          brand: product.brand || '',
          imageUrl: product.images && product.images.length > 0 ? product.images[0] : '',
          price: {
            amount: parseFloat(product.price?.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0,
            currency: product.priceCurrency || 'EUR',
            displayAmount: product.price || ''
          },
          rating: parseFloat(product.rating) || 0,
          reviewCount: parseInt(product.reviewsCount) || 0,
          features: product.features || [],
          description: product.description || '',
          categories: product.categories || []
        };
      });
    } catch (error) {
      logger.error(`Apify: Fout bij verwerken Amazon productdata: ${error.message}`);
      return [];
    }
  },
  
  /**
   * Verwerk Reddit posts naar een gestandaardiseerd formaat
   * @param {Array} posts - Ruwe postdata van Apify
   * @returns {Array} - Gestandaardiseerde postdata
   */
  processRedditPosts(posts) {
    try {
      if (!posts || posts.length === 0) {
        return [];
      }
      
      return posts.map(post => {
        // Basisinformatie
        const processedPost = {
          id: post.id || '',
          title: post.title || '',
          content: post.text || '',
          url: post.url || '',
          author: post.author || '',
          subreddit: post.communityName || '',
          score: post.score || 0,
          upvoteRatio: post.upvoteRatio || 0,
          commentCount: post.numComments || 0,
          created: post.createdAt || new Date().toISOString(),
          isOriginalContent: post.isOriginalContent || false
        };
        
        // Voeg comments toe als ze beschikbaar zijn
        if (post.comments && post.comments.length > 0) {
          processedPost.comments = post.comments.map(comment => ({
            id: comment.id || '',
            author: comment.author || '',
            content: comment.text || '',
            score: comment.score || 0,
            created: comment.createdAt || new Date().toISOString()
          }));
        } else {
          processedPost.comments = [];
        }
        
        return processedPost;
      });
    } catch (error) {
      logger.error(`Apify: Fout bij verwerken Reddit postdata: ${error.message}`);
      return [];
    }
  }
};

export default apifyService;
