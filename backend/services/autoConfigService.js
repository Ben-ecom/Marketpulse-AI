/**
 * Automatische Configuratie Service
 * 
 * Deze service genereert automatisch scraping configuraties op basis van minimale projectinformatie.
 * Volgens de geconsolideerde PRD worden de volgende platforms automatisch geconfigureerd:
 * - Reddit
 * - Amazon
 * - Instagram
 * - TikTok
 * - Marktanalyse
 */

import { supabase } from '../utils/supabaseClient.js';
import { generateKeywords } from '../utils/keywordGenerator.js';
import { getRelevantSubreddits } from '../utils/redditUtils.js';
import { getRelevantAmazonProducts } from '../utils/amazonUtils.js';
import { getRelevantHashtags } from '../utils/socialMediaUtils.js';

/**
 * Genereer automatisch een volledige scraping configuratie op basis van minimale projectinformatie
 * @param {Object} projectData - Basisinformatie van het project
 * @returns {Object} Volledige configuratie voor alle geselecteerde platforms
 */
const generateAutoConfig = async (projectData) => {
  const config = {
    project_id: null, // Wordt later ingevuld
    platforms: {},
    keywords: projectData.keywords || [],
    generated_at: new Date().toISOString(),
    status: 'pending'
  };

  // Genereer keywords op basis van productomschrijving, categorie en subcategorie
  // met de verbeterde keywordGenerator
  const keywordResult = await generateKeywords({
    description: projectData.description,
    category: projectData.category,
    subcategory: projectData.subcategory,
    target_audience: projectData.target_audience,
    geographic_focus: projectData.geographic_focus,
    competitors: projectData.competitors
  }, {
    language: 'nl',
    count: 30, // Meer keywords genereren voor betere dekking
    includeCompetitors: true
  });
  
  // Log de bron van de keywords voor debugging
  console.log(`Keywords gegenereerd met bron: ${keywordResult.source}, betrouwbaarheid: ${keywordResult.confidence}`);
  
  // Voeg gegenereerde keywords toe aan bestaande keywords
  config.keywords = [...new Set([...config.keywords, ...keywordResult.keywords])];
  
  // Configureer geselecteerde platforms
  // Controleer of platforms een object is met boolean waarden of een array
  const selectedPlatforms = Array.isArray(projectData.platforms) 
    ? projectData.platforms 
    : Object.entries(projectData.platforms)
        .filter(([_, isSelected]) => isSelected)
        .map(([platform]) => platform);
  
  console.log('Geselecteerde platforms:', selectedPlatforms);
  
  // Configureer Reddit
  if ((Array.isArray(projectData.platforms) && projectData.platforms.includes('reddit')) ||
      (!Array.isArray(projectData.platforms) && projectData.platforms.reddit)) {
    try {
      config.platforms.reddit = await configureReddit(projectData, config.keywords);
      console.log('Reddit configuratie gegenereerd');
    } catch (error) {
      console.error('Fout bij het configureren van Reddit:', error);
      config.platforms.reddit = {
        enabled: true,
        subreddits: ['technology', 'gadgets', 'smarthome'],
        keywords: config.keywords,
        filters: {
          time_period: 'year',
          sort_by: 'top',
          min_upvotes: 10,
          min_comments: 5,
          include_comments: true,
          min_data_points: 200
        },
        geographic_focus: projectData.geographic_focus
      };
    }
  }
  
  // Configureer Amazon
  if ((Array.isArray(projectData.platforms) && projectData.platforms.includes('amazon')) ||
      (!Array.isArray(projectData.platforms) && projectData.platforms.amazon)) {
    try {
      config.platforms.amazon = await configureAmazon(projectData, config.keywords);
      console.log('Amazon configuratie gegenereerd');
    } catch (error) {
      console.error('Fout bij het configureren van Amazon:', error);
      config.platforms.amazon = {
        enabled: true,
        products: projectData.competitors || [],
        categories: [projectData.category],
        keywords: config.keywords,
        filters: {
          min_reviews: 10,
          min_rating: 1,
          max_rating: 5,
          time_period: 'year',
          include_q_and_a: true,
          min_data_points: 500
        },
        geographic_focus: projectData.geographic_focus
      };
    }
  }
  
  // Configureer Social Media (Instagram/TikTok)
  if ((Array.isArray(projectData.platforms) && 
       (projectData.platforms.includes('instagram') || projectData.platforms.includes('tiktok'))) ||
      (!Array.isArray(projectData.platforms) && 
       (projectData.platforms.instagram || projectData.platforms.tiktok))) {
    try {
      config.platforms.social_media = await configureSocialMedia(projectData, config.keywords);
      console.log('Social Media configuratie gegenereerd');
    } catch (error) {
      console.error('Fout bij het configureren van Social Media:', error);
      config.platforms.social_media = {
        enabled: true,
        platforms: {
          instagram: projectData.platforms.instagram || false,
          tiktok: projectData.platforms.tiktok || false
        },
        hashtags: config.keywords.map(kw => kw.replace(/\s+/g, '')),
        keywords: config.keywords,
        filters: {
          min_likes: 100,
          min_comments: 10,
          time_period: 'month',
          include_captions: true,
          include_comments: true,
          min_data_points: 300
        },
        geographic_focus: projectData.geographic_focus
      };
    }
  }
  
  // Configureer Marktanalyse
  if ((Array.isArray(projectData.platforms) && projectData.platforms.includes('market_analysis')) ||
      (!Array.isArray(projectData.platforms) && projectData.platforms.market_analysis)) {
    try {
      config.platforms.market_analysis = await configureMarketAnalysis(projectData, config.keywords);
      console.log('Marktanalyse configuratie gegenereerd');
    } catch (error) {
      console.error('Fout bij het configureren van Marktanalyse:', error);
      config.platforms.market_analysis = {
        enabled: true,
        include_market_size: true,
        include_growth_trends: true,
        include_competitive_landscape: true,
        include_pricing_analysis: true,
        geographic_focus: projectData.geographic_focus,
        keywords: config.keywords,
        competitors: projectData.competitors || []
      };
    }
  }
  
  return config;
};

/**
 * Configureer Reddit scraping parameters
 * @param {Object} projectData - Basisinformatie van het project
 * @param {Array} keywords - Gegenereerde keywords
 * @returns {Object} Reddit configuratie
 */
const configureReddit = async (projectData, keywords) => {
  // Haal relevante subreddits op basis van categorie en subcategorie
  const subreddits = await getRelevantSubreddits(
    projectData.category,
    projectData.subcategory,
    projectData.target_gender
  );
  
  return {
    enabled: true,
    subreddits,
    keywords,
    filters: {
      time_period: 'year', // Default: laatste jaar
      sort_by: 'top', // Default: top posts
      min_upvotes: 10,
      min_comments: 5,
      include_comments: true,
      min_data_points: 200
    },
    geographic_focus: projectData.geographic_focus
  };
};

/**
 * Configureer Amazon scraping parameters
 * @param {Object} projectData - Basisinformatie van het project
 * @param {Array} keywords - Gegenereerde keywords
 * @returns {Object} Amazon configuratie
 */
const configureAmazon = async (projectData, keywords) => {
  // Bepaal relevante Amazon producten en categorieën
  const { products, categories } = await getRelevantAmazonProducts(
    projectData.product_url,
    projectData.description,
    projectData.category,
    projectData.subcategory
  );
  
  // Voeg concurrerende producten toe als ze zijn opgegeven
  if (projectData.competitors && projectData.competitors.length > 0) {
    products.push(...projectData.competitors);
  }
  
  return {
    enabled: true,
    products,
    categories,
    keywords,
    filters: {
      min_reviews: 10,
      min_rating: 1, // Alle ratings (1-5 sterren)
      max_rating: 5,
      time_period: 'year', // Default: laatste jaar
      include_q_and_a: true,
      min_data_points: 500
    },
    geographic_focus: projectData.geographic_focus
  };
};

/**
 * Configureer Social Media scraping parameters
 * @param {Object} projectData - Basisinformatie van het project
 * @param {Array} keywords - Gegenereerde keywords
 * @returns {Object} Social Media configuratie
 */
const configureSocialMedia = async (projectData, keywords) => {
  // Genereer relevante hashtags
  const hashtags = await getRelevantHashtags(
    projectData.category,
    projectData.subcategory,
    keywords
  );
  
  const platforms = [];
  if (projectData.platforms.instagram) platforms.push('instagram');
  if (projectData.platforms.tiktok) platforms.push('tiktok');
  
  return {
    enabled: true,
    platforms,
    hashtags,
    keywords,
    accounts: [], // Kan later worden aangevuld met relevante accounts
    filters: {
      time_period: 'year', // Default: laatste 12 maanden
      content_type: 'all', // Alle content types
      min_likes: 100,
      min_comments: 5,
      include_comments: true,
      min_data_points: 200
    },
    geographic_focus: projectData.geographic_focus
  };
};

/**
 * Configureer Marktanalyse parameters
 * @param {Object} projectData - Basisinformatie van het project
 * @param {Array} keywords - Gegenereerde keywords
 * @returns {Object} Marktanalyse configuratie
 */
const configureMarketAnalysis = async (projectData, keywords) => {
  return {
    enabled: true,
    sectors: [projectData.category],
    subsectors: projectData.subcategory ? [projectData.subcategory] : [],
    keywords,
    filters: {
      time_period: 'year', // Default: laatste jaar
      include_trends: true,
      include_market_size: true,
      include_growth_rate: true,
      include_segments: true,
      include_competitors: true
    },
    geographic_focus: projectData.geographic_focus
  };
};

/**
 * Sla de gegenereerde configuratie op in de database
 * @param {Object} config - Gegenereerde configuratie
 * @param {String} projectId - ID van het project
 * @returns {Object} Opgeslagen configuratie
 */
const saveConfiguration = async (config, projectId) => {
  config.project_id = projectId;
  
  // Sla de configuratie op in Supabase
  const { data, error } = await supabase
    .from('scraping_configs')
    .insert(config)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Fout bij opslaan configuratie: ${error.message}`);
  }
  
  return data;
};

export {
  generateAutoConfig,
  saveConfiguration
};
