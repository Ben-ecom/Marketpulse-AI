/**
 * Reddit Utilities
 * 
 * Deze module bevat functies voor het automatisch configureren van Reddit scraping.
 * Het bepaalt relevante subreddits op basis van product categorie, subcategorie en doelgroep.
 */

import { supabase } from './supabaseClient.js';

/**
 * Haal relevante subreddits op basis van categorie, subcategorie en doelgroep
 * @param {string} category - Productcategorie
 * @param {string} subcategory - Productsubcategorie
 * @param {string} targetGender - Doelgroep geslacht ('male', 'female', 'both')
 * @returns {Array} Array van relevante subreddits
 */
const getRelevantSubreddits = async (category, subcategory, targetGender) => {
  try {
    // Zoek eerst in de database naar voorgedefinieerde subreddits voor deze categorie/subcategorie
    const { data: predefinedSubreddits, error } = await supabase
      .from('subreddit_mappings')
      .select('subreddit_name')
      .or(`category.eq.${category},subcategory.eq.${subcategory}`)
      .limit(20);
    
    if (error) {
      console.error('Fout bij ophalen voorgedefinieerde subreddits:', error);
    }
    
    // Als we voorgedefinieerde subreddits hebben gevonden, gebruik deze
    if (predefinedSubreddits && predefinedSubreddits.length > 0) {
      return predefinedSubreddits.map(item => item.subreddit_name);
    }
    
    // Anders, gebruik de fallback methode
    return getSubredditsFallback(category, subcategory, targetGender);
  } catch (error) {
    console.error('Fout bij het bepalen van relevante subreddits:', error);
    return getSubredditsFallback(category, subcategory, targetGender);
  }
};

/**
 * Fallback methode voor het bepalen van relevante subreddits
 * @param {string} category - Productcategorie
 * @param {string} subcategory - Productsubcategorie
 * @param {string} targetGender - Doelgroep geslacht ('male', 'female', 'both')
 * @returns {Array} Array van relevante subreddits
 */
const getSubredditsFallback = (category, subcategory, targetGender) => {
  // Mapping van categorieën naar relevante subreddits
  const categoryMapping = {
    'Gezondheid': ['health', 'nutrition', 'supplements', 'fitness', 'weightloss', 'wellness'],
    'Schoonheid': ['beauty', 'SkincareAddiction', 'MakeupAddiction', 'HaircareScience'],
    'Elektronica': ['gadgets', 'electronics', 'tech', 'homeautomation'],
    'Kleding & Fashion': ['fashion', 'malefashionadvice', 'femalefashionadvice', 'streetwear'],
    'Huishoudelijke apparaten': ['homeautomation', 'smarthome', 'homeimprovement'],
    'Meubels & Interieur': ['InteriorDesign', 'HomeDecorating', 'furniture'],
    'Sport & Outdoor': ['sports', 'running', 'camping', 'hiking', 'cycling'],
    'Speelgoed & Games': ['toys', 'gaming', 'boardgames'],
    'Boeken & Media': ['books', 'movies', 'television', 'Music'],
    'Voedsel & Dranken': ['food', 'cooking', 'recipes', 'coffee', 'tea'],
    'Sieraden & Accessoires': ['jewelry', 'watches', 'accessories'],
    'Huisdierbenodigdheden': ['pets', 'dogs', 'cats', 'aquariums'],
    'Auto & Motor': ['cars', 'motorcycles', 'autodetailing'],
    'Kunst & Ambachten': ['crafts', 'art', 'DIY'],
    'Overig': ['BuyItForLife', 'shutupandtakemymoney', 'ProductPorn']
  };
  
  // Mapping van subcategorieën naar relevante subreddits
  const subcategoryMapping = {
    // Gezondheid subcategorieën
    'Supplementen': ['Supplements', 'nootropics', 'vitamins'],
    'Fitness apparatuur': ['homegym', 'fitness', 'weightlifting'],
    'Persoonlijke verzorging': ['SkincareAddiction', 'HaircareScience'],
    'Medische hulpmiddelen': ['medical', 'health'],
    'Wellness producten': ['wellness', 'selfcare'],
    
    // Schoonheid subcategorieën
    'Huidverzorging': ['SkincareAddiction', 'AsianBeauty'],
    'Make-up': ['MakeupAddiction', 'BeautyGuruChatter'],
    'Haarverzorging': ['HaircareScience', 'curlyhair'],
    'Parfum': ['fragrance', 'perfume'],
    'Nagelverzorging': ['RedditLaqueristas'],
    
    // Elektronica subcategorieën
    'Smartphones': ['Android', 'iphone', 'smartphones'],
    'Laptops & Computers': ['laptops', 'buildapc', 'pcmasterrace'],
    'Audio apparatuur': ['audiophile', 'headphones'],
    'Smart home': ['homeautomation', 'smarthome'],
    'Gaming': ['gaming', 'pcgaming', 'gamingpc'],
    
    // Kleding & Fashion subcategorieën
    'Dameskleding': ['femalefashionadvice', 'womensfashion'],
    'Herenkleding': ['malefashionadvice', 'mensfashion'],
    'Schoenen': ['sneakers', 'goodyearwelt'],
    'Jassen & Blazers': ['malefashionadvice', 'femalefashionadvice'],
    
    // Voeg hier meer subcategorie mappings toe indien nodig
  };
  
  // Geslacht-specifieke subreddits
  const genderMapping = {
    'male': ['malefashionadvice', 'malegrooming', 'malelifestyle'],
    'female': ['femalefashionadvice', 'TheGirlSurvivalGuide', 'FemaleLifeStrategy'],
    'both': []
  };
  
  // Verzamel alle relevante subreddits
  let subreddits = [];
  
  // Voeg categorie-specifieke subreddits toe
  if (category && categoryMapping[category]) {
    subreddits = [...subreddits, ...categoryMapping[category]];
  }
  
  // Voeg subcategorie-specifieke subreddits toe
  if (subcategory && subcategoryMapping[subcategory]) {
    subreddits = [...subreddits, ...subcategoryMapping[subcategory]];
  }
  
  // Voeg geslacht-specifieke subreddits toe
  if (targetGender && targetGender !== 'both' && genderMapping[targetGender]) {
    subreddits = [...subreddits, ...genderMapping[targetGender]];
  }
  
  // Voeg algemene subreddits toe
  const generalSubreddits = ['BuyItForLife', 'Frugal', 'ProductReviews', 'shutupandtakemymoney'];
  subreddits = [...subreddits, ...generalSubreddits];
  
  // Verwijder duplicaten en beperk tot 15 subreddits
  return [...new Set(subreddits)].slice(0, 15);
};

export {
  getRelevantSubreddits
};
