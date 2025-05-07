import ProductAdvertisingAPIv1 from 'paapi5-nodejs-sdk';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Laad omgevingsvariabelen
dotenv.config();

// Configuratie voor Amazon Product Advertising API
const defaultConfig = {
  accessKey: process.env.AMAZON_ACCESS_KEY,
  secretKey: process.env.AMAZON_SECRET_KEY,
  partnerTag: process.env.AMAZON_PARTNER_TAG,
  partnerType: 'Associates',
  marketplace: 'www.amazon.nl', // Standaard marketplace, kan worden overschreven
  host: 'webservices.amazon.nl', // Standaard host, kan worden overschreven
  region: 'eu-west-1' // Standaard regio, kan worden overschreven
};

/**
 * Service voor het ophalen van product informatie via de Amazon Product Advertising API
 */
export const amazonApiService = {
  /**
   * Initialiseer de Amazon API client met de juiste configuratie
   * @param {object} config - Optionele configuratie om de standaard te overschrijven
   * @returns {object} - Geconfigureerde API client
   */
  initClient(config = {}) {
    try {
      // Combineer standaard config met eventuele aangepaste config
      const apiConfig = { ...defaultConfig, ...config };
      
      // Controleer of alle vereiste configuratiewaarden aanwezig zijn
      if (!apiConfig.accessKey || !apiConfig.secretKey || !apiConfig.partnerTag) {
        throw new Error('Ontbrekende Amazon API configuratie. Controleer je .env bestand.');
      }
      
      // Initialiseer de API client
      const api = new ProductAdvertisingAPIv1.DefaultApi();
      
      // Configureer de API client
      const apiClient = api.apiClient;
      apiClient.accessKey = apiConfig.accessKey;
      apiClient.secretKey = apiConfig.secretKey;
      apiClient.host = apiConfig.host;
      apiClient.region = apiConfig.region;
      
      logger.info(`Amazon API client geïnitialiseerd voor marketplace: ${apiConfig.marketplace}`);
      return { api, apiConfig };
    } catch (error) {
      logger.error(`Fout bij initialiseren Amazon API client: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Zoek producten op basis van zoekwoorden
   * @param {string} keyword - Zoekwoord
   * @param {object} options - Opties voor de zoekopdracht
   * @returns {Promise<Array>} - Array met gevonden producten
   */
  async searchProducts(keyword, options = {}) {
    try {
      logger.info(`Amazon producten zoeken voor: ${keyword}`);
      
      // Initialiseer de API client
      const { api, apiConfig } = this.initClient(options.config);
      
      // Stel het zoekverzoek samen
      const searchItemsRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
      searchItemsRequest.PartnerTag = apiConfig.partnerTag;
      searchItemsRequest.PartnerType = apiConfig.partnerType;
      searchItemsRequest.Keywords = keyword;
      searchItemsRequest.SearchIndex = options.searchIndex || 'All';
      searchItemsRequest.ItemCount = options.itemCount || 10;
      searchItemsRequest.Resources = options.resources || [
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'ItemInfo.ByLineInfo',
        'Images.Primary.Large',
        'Offers.Listings.Price',
        'CustomerReviews'
      ];
      
      // Voer het zoekverzoek uit
      const response = await api.searchItems(searchItemsRequest);
      
      if (response.SearchResult && response.SearchResult.Items) {
        logger.info(`${response.SearchResult.Items.length} Amazon producten gevonden voor: ${keyword}`);
        return response.SearchResult.Items;
      } else {
        logger.warn(`Geen Amazon producten gevonden voor: ${keyword}`);
        return [];
      }
    } catch (error) {
      logger.error(`Fout bij zoeken Amazon producten: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal productdetails op voor specifieke ASIN's
   * @param {Array<string>} asins - Array met ASIN's
   * @param {object} options - Opties voor het verzoek
   * @returns {Promise<Array>} - Array met productdetails
   */
  async getProductsByAsin(asins, options = {}) {
    try {
      if (!asins || asins.length === 0) {
        throw new Error('Geen ASIN\'s opgegeven');
      }
      
      logger.info(`Amazon productdetails ophalen voor ${asins.length} ASIN's`);
      
      // Initialiseer de API client
      const { api, apiConfig } = this.initClient(options.config);
      
      // Stel het verzoek samen
      const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest();
      getItemsRequest.PartnerTag = apiConfig.partnerTag;
      getItemsRequest.PartnerType = apiConfig.partnerType;
      getItemsRequest.ItemIds = asins;
      getItemsRequest.Resources = options.resources || [
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'ItemInfo.ByLineInfo',
        'Images.Primary.Large',
        'Offers.Listings.Price',
        'CustomerReviews'
      ];
      
      // Voer het verzoek uit
      const response = await api.getItems(getItemsRequest);
      
      if (response.ItemsResult && response.ItemsResult.Items) {
        logger.info(`${response.ItemsResult.Items.length} Amazon producten opgehaald`);
        return response.ItemsResult.Items;
      } else {
        logger.warn('Geen Amazon producten gevonden voor de opgegeven ASIN\'s');
        return [];
      }
    } catch (error) {
      logger.error(`Fout bij ophalen Amazon productdetails: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal reviews op voor een specifiek product (via de CustomerReviews resource)
   * @param {string} asin - ASIN van het product
   * @param {object} options - Opties voor het verzoek
   * @returns {Promise<object>} - Review informatie
   */
  async getProductReviews(asin, options = {}) {
    try {
      if (!asin) {
        throw new Error('Geen ASIN opgegeven');
      }
      
      logger.info(`Amazon reviews ophalen voor ASIN: ${asin}`);
      
      // Initialiseer de API client
      const { api, apiConfig } = this.initClient(options.config);
      
      // Stel het verzoek samen
      const getItemsRequest = new ProductAdvertisingAPIv1.GetItemsRequest();
      getItemsRequest.PartnerTag = apiConfig.partnerTag;
      getItemsRequest.PartnerType = apiConfig.partnerType;
      getItemsRequest.ItemIds = [asin];
      getItemsRequest.Resources = [
        'CustomerReviews.Count',
        'CustomerReviews.StarRating',
        'CustomerReviews.Url'
      ];
      
      // Voer het verzoek uit
      const response = await api.getItems(getItemsRequest);
      
      if (response.ItemsResult && response.ItemsResult.Items && response.ItemsResult.Items.length > 0) {
        const item = response.ItemsResult.Items[0];
        if (item.CustomerReviews) {
          logger.info(`Amazon reviews opgehaald voor ASIN: ${asin}`);
          return item.CustomerReviews;
        } else {
          logger.warn(`Geen reviews gevonden voor ASIN: ${asin}`);
          return null;
        }
      } else {
        logger.warn(`Product niet gevonden voor ASIN: ${asin}`);
        return null;
      }
    } catch (error) {
      logger.error(`Fout bij ophalen Amazon reviews: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal bestsellers op voor een specifieke categorie
   * @param {string} category - Categorie om bestsellers voor op te halen
   * @param {object} options - Opties voor het verzoek
   * @returns {Promise<Array>} - Array met bestseller producten
   */
  async getBestSellers(category, options = {}) {
    try {
      logger.info(`Amazon bestsellers ophalen voor categorie: ${category}`);
      
      // Initialiseer de API client
      const { api, apiConfig } = this.initClient(options.config);
      
      // Stel het verzoek samen
      const searchItemsRequest = new ProductAdvertisingAPIv1.SearchItemsRequest();
      searchItemsRequest.PartnerTag = apiConfig.partnerTag;
      searchItemsRequest.PartnerType = apiConfig.partnerType;
      searchItemsRequest.SearchIndex = category;
      searchItemsRequest.SortBy = 'Relevance';
      searchItemsRequest.ItemCount = options.itemCount || 10;
      searchItemsRequest.Resources = options.resources || [
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo',
        'ItemInfo.ByLineInfo',
        'Images.Primary.Large',
        'Offers.Listings.Price',
        'CustomerReviews'
      ];
      
      // Voer het verzoek uit
      const response = await api.searchItems(searchItemsRequest);
      
      if (response.SearchResult && response.SearchResult.Items) {
        logger.info(`${response.SearchResult.Items.length} Amazon bestsellers gevonden voor categorie: ${category}`);
        return response.SearchResult.Items;
      } else {
        logger.warn(`Geen Amazon bestsellers gevonden voor categorie: ${category}`);
        return [];
      }
    } catch (error) {
      logger.error(`Fout bij ophalen Amazon bestsellers: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verwerk ruwe productdata naar een gestandaardiseerd formaat
   * @param {Array} products - Ruwe productdata van Amazon API
   * @returns {Array} - Gestandaardiseerde productdata
   */
  processProductData(products) {
    try {
      if (!products || products.length === 0) {
        return [];
      }
      
      return products.map(product => {
        // Basisinformatie
        const processedProduct = {
          asin: product.ASIN,
          title: product.ItemInfo?.Title?.DisplayValue || '',
          url: product.DetailPageURL || '',
          brand: product.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || '',
          imageUrl: product.Images?.Primary?.Large?.URL || '',
          features: product.ItemInfo?.Features?.DisplayValues || []
        };
        
        // Prijsinformatie
        if (product.Offers && product.Offers.Listings && product.Offers.Listings.length > 0) {
          const listing = product.Offers.Listings[0];
          processedProduct.price = {
            amount: listing.Price?.Amount || 0,
            currency: listing.Price?.Currency || 'EUR',
            displayAmount: listing.Price?.DisplayAmount || '',
            savings: listing.Price?.Savings?.Amount || 0,
            savingsPercent: listing.Price?.Savings?.Percentage || 0
          };
        }
        
        // Review informatie
        if (product.CustomerReviews) {
          processedProduct.reviews = {
            count: product.CustomerReviews.Count || 0,
            rating: product.CustomerReviews.StarRating?.Value || 0,
            url: product.CustomerReviews.Url || ''
          };
        }
        
        return processedProduct;
      });
    } catch (error) {
      logger.error(`Fout bij verwerken productdata: ${error.message}`);
      throw error;
    }
  }
};

export default amazonApiService;
