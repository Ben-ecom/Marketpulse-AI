/**
 * Social Media Utilities
 * 
 * Deze module bevat functies voor het automatisch configureren van social media scraping.
 * Het genereert relevante hashtags op basis van productinformatie.
 */

import { supabase } from './supabaseClient.js';

/**
 * Genereer relevante hashtags voor social media scraping
 * @param {string} category - Productcategorie
 * @param {string} subcategory - Productsubcategorie
 * @param {Array} keywords - Gegenereerde keywords
 * @returns {Array} Array van relevante hashtags
 */
const getRelevantHashtags = async (category, subcategory, keywords) => {
  try {
    // Zoek in de database naar trending hashtags voor deze categorie/subcategorie
    const { data: trendingHashtags, error } = await supabase
      .from('trending_hashtags')
      .select('hashtag')
      .or(`category.eq.${category},subcategory.eq.${subcategory}`)
      .order('popularity', { ascending: false })
      .limit(15);
    
    if (error) {
      console.error('Fout bij ophalen trending hashtags:', error);
    }
    
    // Als we trending hashtags hebben gevonden, gebruik deze
    if (trendingHashtags && trendingHashtags.length > 0) {
      const hashtags = trendingHashtags.map(item => item.hashtag);
      return combineHashtags(hashtags, keywords, category, subcategory);
    }
    
    // Anders, gebruik de fallback methode
    return getHashtagsFallback(category, subcategory, keywords);
  } catch (error) {
    console.error('Fout bij het genereren van relevante hashtags:', error);
    return getHashtagsFallback(category, subcategory, keywords);
  }
};

/**
 * Combineer verschillende bronnen van hashtags en verwijder duplicaten
 * @param {Array} trendingHashtags - Trending hashtags uit de database
 * @param {Array} keywords - Gegenereerde keywords
 * @param {string} category - Productcategorie
 * @param {string} subcategory - Productsubcategorie
 * @returns {Array} Gecombineerde lijst van hashtags
 */
const combineHashtags = (trendingHashtags, keywords, category, subcategory) => {
  // Converteer keywords naar hashtags
  const keywordHashtags = keywords.map(keyword => {
    // Verwijder spaties en speciale tekens
    return '#' + keyword.replace(/[^\w]/g, '');
  });
  
  // Voeg categorie en subcategorie toe als hashtags
  const categoryHashtags = [];
  if (category) {
    categoryHashtags.push('#' + category.replace(/[^\w]/g, ''));
  }
  if (subcategory) {
    categoryHashtags.push('#' + subcategory.replace(/[^\w]/g, ''));
  }
  
  // Combineer alle hashtags
  const allHashtags = [...trendingHashtags, ...keywordHashtags, ...categoryHashtags];
  
  // Verwijder duplicaten, lege hashtags en hashtags die alleen '#' bevatten
  const uniqueHashtags = [...new Set(allHashtags)]
    .filter(hashtag => hashtag.length > 1 && hashtag !== '#');
  
  // Beperk tot maximaal 20 hashtags
  return uniqueHashtags.slice(0, 20);
};

/**
 * Fallback methode voor het genereren van relevante hashtags
 * @param {string} category - Productcategorie
 * @param {string} subcategory - Productsubcategorie
 * @param {Array} keywords - Gegenereerde keywords
 * @returns {Array} Array van relevante hashtags
 */
const getHashtagsFallback = (category, subcategory, keywords) => {
  // Populaire hashtags per categorie
  const categoryHashtags = {
    'Gezondheid': ['#health', '#wellness', '#fitness', '#healthylifestyle', '#nutrition'],
    'Schoonheid': ['#beauty', '#skincare', '#makeup', '#selfcare', '#glowup'],
    'Elektronica': ['#tech', '#gadgets', '#technology', '#innovation', '#electronics'],
    'Kleding & Fashion': ['#fashion', '#style', '#ootd', '#outfitoftheday', '#fashionista'],
    'Huishoudelijke apparaten': ['#home', '#homedecor', '#homeappliances', '#kitchen', '#cleaning'],
    'Meubels & Interieur': ['#interiordesign', '#homedecor', '#furniture', '#homesweethome', '#decoration'],
    'Sport & Outdoor': ['#sports', '#fitness', '#workout', '#training', '#outdoor'],
    'Speelgoed & Games': ['#toys', '#games', '#gaming', '#fun', '#play'],
    'Boeken & Media': ['#books', '#reading', '#bookstagram', '#movie', '#film'],
    'Voedsel & Dranken': ['#food', '#foodie', '#delicious', '#yummy', '#instafood'],
    'Sieraden & Accessoires': ['#jewelry', '#accessories', '#fashion', '#style', '#trendy'],
    'Huisdierbenodigdheden': ['#pets', '#dog', '#cat', '#petlovers', '#animals'],
    'Auto & Motor': ['#car', '#auto', '#automotive', '#carlifestyle', '#carsofinstagram'],
    'Kunst & Ambachten': ['#art', '#handmade', '#craft', '#creative', '#artist'],
    'Overig': ['#trending', '#viral', '#musthave', '#new', '#popular']
  };
  
  // Populaire hashtags per subcategorie
  const subcategoryHashtags = {
    // Gezondheid subcategorieën
    'Supplementen': ['#supplements', '#vitamins', '#nutrition', '#healthsupplements', '#natural'],
    'Fitness apparatuur': ['#fitnessgear', '#workout', '#gym', '#training', '#homegym'],
    'Persoonlijke verzorging': ['#selfcare', '#personalcare', '#skincare', '#bodycare', '#hygiene'],
    'Medische hulpmiddelen': ['#medical', '#health', '#healthcare', '#wellness', '#recovery'],
    'Wellness producten': ['#wellness', '#selfcare', '#relax', '#mindfulness', '#wellbeing'],
    
    // Schoonheid subcategorieën
    'Huidverzorging': ['#skincare', '#glowingskin', '#skincareproducts', '#skincareroutine', '#beauty'],
    'Make-up': ['#makeup', '#makeuptutorial', '#makeuplover', '#makeupjunkie', '#cosmetics'],
    'Haarverzorging': ['#haircare', '#hairstyle', '#hairproducts', '#healthyhair', '#hairtips'],
    'Parfum': ['#perfume', '#fragrance', '#scent', '#parfum', '#luxuryfragrance'],
    'Nagelverzorging': ['#nails', '#nailcare', '#manicure', '#nailart', '#nailsofinstagram'],
    
    // Elektronica subcategorieën
    'Smartphones': ['#smartphone', '#iphone', '#android', '#mobile', '#phonephotography'],
    'Laptops & Computers': ['#laptop', '#computer', '#tech', '#workstation', '#pcgaming'],
    'Audio apparatuur': ['#audio', '#headphones', '#music', '#sound', '#audiophile'],
    'Smart home': ['#smarthome', '#homeautomation', '#iot', '#smarttech', '#homegadgets'],
    'Gaming': ['#gaming', '#gamer', '#videogames', '#gamingsetup', '#gamingcommunity'],
    
    // Kleding & Fashion subcategorieën
    'Dameskleding': ['#womensfashion', '#womenswear', '#womenstyle', '#fashionista', '#outfitinspo'],
    'Herenkleding': ['#mensfashion', '#menswear', '#menstyle', '#mensstyle', '#guysfashion'],
    'Schoenen': ['#shoes', '#sneakers', '#footwear', '#shoesaddict', '#shoestagram'],
    'Jassen & Blazers': ['#jacket', '#blazer', '#coat', '#outerwear', '#jacketstyle'],
    
    // Voeg hier meer subcategorie mappings toe indien nodig
  };
  
  // Algemene trending hashtags
  const generalTrendingHashtags = [
    '#trending', '#viral', '#musthave', '#love', '#instagood', 
    '#photooftheday', '#fashion', '#beautiful', '#happy', '#cute', 
    '#followme', '#picoftheday', '#follow', '#me', '#selfie', 
    '#summer', '#instadaily', '#friends', '#fitness', '#girl', 
    '#food', '#fun', '#style', '#smile', '#nature'
  ];
  
  // Verzamel alle relevante hashtags
  let hashtags = [];
  
  // Voeg categorie-specifieke hashtags toe
  if (category && categoryHashtags[category]) {
    hashtags = [...hashtags, ...categoryHashtags[category]];
  }
  
  // Voeg subcategorie-specifieke hashtags toe
  if (subcategory && subcategoryHashtags[subcategory]) {
    hashtags = [...hashtags, ...subcategoryHashtags[subcategory]];
  }
  
  // Voeg keyword-gebaseerde hashtags toe
  const keywordHashtags = keywords.map(keyword => {
    // Verwijder spaties en speciale tekens
    return '#' + keyword.replace(/[^\w]/g, '');
  });
  hashtags = [...hashtags, ...keywordHashtags];
  
  // Voeg enkele algemene trending hashtags toe
  hashtags = [...hashtags, ...generalTrendingHashtags.slice(0, 5)];
  
  // Verwijder duplicaten, lege hashtags en hashtags die alleen '#' bevatten
  const uniqueHashtags = [...new Set(hashtags)]
    .filter(hashtag => hashtag.length > 1 && hashtag !== '#');
  
  // Beperk tot maximaal 20 hashtags
  return uniqueHashtags.slice(0, 20);
};

export {
  getRelevantHashtags
};
