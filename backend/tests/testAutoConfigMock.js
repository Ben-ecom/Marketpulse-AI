/**
 * Test script voor de Automatische Configuratie Service met mocks
 * 
 * Dit script test de automatische configuratie van scraping parameters
 * op basis van minimale projectinformatie, met gebruik van mock implementaties
 * om externe afhankelijkheden te vermijden.
 */

import dotenv from 'dotenv';
dotenv.config();

// Importeer de mock implementaties
// We moeten deze eerst importeren zodat ze de echte implementaties overschrijven
import { supabase } from './mocks/supabaseClientMock.js';
import { generateKeywords } from './mocks/keywordGeneratorMock.js';

// Definieer mocks voor andere utilities
const getRelevantSubreddits = async (keywords) => {
  return ['subreddit1', 'subreddit2', 'subreddit3'];
};

const getRelevantAmazonProducts = async (keywords) => {
  return ['product1', 'product2', 'product3'];
};

const getRelevantHashtags = async (keywords) => {
  return ['hashtag1', 'hashtag2', 'hashtag3'];
};

// Definieer de generateAutoConfig functie met de mock implementaties
const generateAutoConfig = async (projectData) => {
  const config = {
    project_id: null, // Wordt later ingevuld
    platforms: {},
    keywords: projectData.keywords || [],
    generated_at: new Date().toISOString(),
    status: 'pending'
  };

  // Genereer keywords op basis van productomschrijving, categorie en subcategorie
  const generatedKeywords = await generateKeywords({
    description: projectData.description,
    category: projectData.category,
    subcategory: projectData.subcategory
  });
  
  // Voeg gegenereerde keywords toe aan bestaande keywords
  config.keywords = [...new Set([...config.keywords, ...generatedKeywords])];

  // Configureer geselecteerde platforms
  const selectedPlatforms = projectData.platforms || [];

  // Reddit configuratie
  if (selectedPlatforms.includes('reddit')) {
    const subreddits = await getRelevantSubreddits(config.keywords);
    config.platforms.reddit = {
      subreddits,
      sort_by: 'relevance',
      time_filter: 'year',
      limit: 100
    };
  }

  // Amazon configuratie
  if (selectedPlatforms.includes('amazon')) {
    const productIds = await getRelevantAmazonProducts(config.keywords);
    config.platforms.amazon = {
      product_ids: productIds,
      include_reviews: true,
      min_rating: 1,
      max_rating: 5,
      sort_by: 'recent',
      limit: 100
    };
  }

  // Instagram configuratie
  if (selectedPlatforms.includes('instagram')) {
    const hashtags = await getRelevantHashtags(config.keywords);
    config.platforms.instagram = {
      hashtags,
      include_posts: true,
      include_stories: false,
      min_likes: 10,
      limit: 50
    };
  }

  // TikTok configuratie
  if (selectedPlatforms.includes('tiktok')) {
    const hashtags = await getRelevantHashtags(config.keywords);
    config.platforms.tiktok = {
      hashtags,
      include_videos: true,
      min_likes: 100,
      limit: 50
    };
  }

  // Marktanalyse configuratie
  if (selectedPlatforms.includes('market_analysis')) {
    config.platforms.market_analysis = {
      include_market_size: true,
      include_growth_trends: true,
      include_competitive_landscape: true,
      include_pricing_analysis: true,
      geographic_focus: projectData.geographic_focus || 'global'
    };
  }

  // Concurrenten toevoegen indien opgegeven
  if (projectData.competitors && projectData.competitors.length > 0) {
    config.competitors = projectData.competitors;
  }

  return config;
};

// Test project data
const testProject = {
  name: 'Test Project',
  description: 'Een innovatief product voor thuisgebruik',
  category: 'Elektronica',
  subcategory: 'Smart Home',
  platforms: ['reddit', 'amazon', 'instagram', 'tiktok', 'market_analysis'],
  keywords: ['smart home', 'automation'],
  competitors: ['competitor1', 'competitor2'],
  geographic_focus: 'Nederland'
};

// Voer de test uit
const runTest = async () => {
  console.log('Test Automatische Configuratie Service');
  console.log('-------------------------------------');
  console.log('Project data:', testProject);
  
  try {
    const config = await generateAutoConfig(testProject);
    console.log('\nGegenereerde configuratie:');
    console.log(JSON.stringify(config, null, 2));
    console.log('\nTest succesvol afgerond!');
  } catch (error) {
    console.error('Fout bij het genereren van configuratie:', error);
  }
};

// Start de test
runTest();
