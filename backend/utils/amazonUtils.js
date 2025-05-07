/**
 * Amazon Utilities
 * 
 * Deze module bevat functies voor het automatisch configureren van Amazon scraping.
 * Het bepaalt relevante producten en categorieën op basis van productinformatie.
 */

import { supabase } from './supabaseClient.js';
import { extractAmazonProductId } from './urlUtils.js';

/**
 * Bepaal relevante Amazon producten en categorieën
 * @param {string} productUrl - URL naar het product (optioneel)
 * @param {string} description - Productomschrijving
 * @param {string} category - Productcategorie
 * @param {string} subcategory - Productsubcategorie
 * @returns {Object} Object met relevante producten en categorieën
 */
const getRelevantAmazonProducts = async (productUrl, description, category, subcategory) => {
  try {
    const result = {
      products: [],
      categories: []
    };
    
    // Als er een product URL is opgegeven, probeer deze te gebruiken
    if (productUrl) {
      const productId = extractAmazonProductId(productUrl);
      if (productId) {
        result.products.push(productUrl);
      }
    }
    
    // Zoek in de database naar voorgedefinieerde Amazon categorieën voor deze categorie/subcategorie
    const { data: amazonCategories, error } = await supabase
      .from('amazon_category_mappings')
      .select('amazon_category')
      .or(`category.eq.${category},subcategory.eq.${subcategory}`)
      .limit(10);
    
    if (error) {
      console.error('Fout bij ophalen Amazon categorieën:', error);
    } else if (amazonCategories && amazonCategories.length > 0) {
      result.categories = amazonCategories.map(item => item.amazon_category);
    } else {
      // Gebruik fallback categorieën als er geen in de database zijn gevonden
      result.categories = getAmazonCategoriesFallback(category, subcategory);
    }
    
    // Zoek in de database naar populaire producten in deze categorie/subcategorie
    const { data: popularProducts, error: productsError } = await supabase
      .from('amazon_popular_products')
      .select('product_url')
      .or(`category.eq.${category},subcategory.eq.${subcategory}`)
      .limit(5);
    
    if (productsError) {
      console.error('Fout bij ophalen populaire producten:', productsError);
    } else if (popularProducts && popularProducts.length > 0) {
      // Voeg populaire producten toe aan de lijst
      result.products = [...result.products, ...popularProducts.map(item => item.product_url)];
    }
    
    // Als we nog steeds minder dan 3 producten hebben, gebruik de fallback methode
    if (result.products.length < 3) {
      const fallbackProducts = await getAmazonProductsFallback(description, category, subcategory);
      result.products = [...new Set([...result.products, ...fallbackProducts])];
    }
    
    return result;
  } catch (error) {
    console.error('Fout bij het bepalen van relevante Amazon producten:', error);
    // Gebruik fallback methodes bij fouten
    return {
      products: await getAmazonProductsFallback(description, category, subcategory),
      categories: getAmazonCategoriesFallback(category, subcategory)
    };
  }
};

/**
 * Fallback methode voor het bepalen van relevante Amazon categorieën
 * @param {string} category - Productcategorie
 * @param {string} subcategory - Productsubcategorie
 * @returns {Array} Array van relevante Amazon categorieën
 */
const getAmazonCategoriesFallback = (category, subcategory) => {
  // Mapping van categorieën naar Amazon categorieën
  const categoryMapping = {
    'Gezondheid': ['Health & Personal Care', 'Vitamins & Dietary Supplements'],
    'Schoonheid': ['Beauty & Personal Care', 'Luxury Beauty', 'Professional Skin Care'],
    'Elektronica': ['Electronics', 'Computers & Accessories', 'Cell Phones & Accessories'],
    'Kleding & Fashion': ['Clothing, Shoes & Jewelry', 'Fashion'],
    'Huishoudelijke apparaten': ['Appliances', 'Home & Kitchen'],
    'Meubels & Interieur': ['Furniture', 'Home & Kitchen', 'Home Décor'],
    'Sport & Outdoor': ['Sports & Outdoors', 'Outdoor Recreation'],
    'Speelgoed & Games': ['Toys & Games', 'Video Games'],
    'Boeken & Media': ['Books', 'Movies & TV', 'Music'],
    'Voedsel & Dranken': ['Grocery & Gourmet Food', 'Beverages'],
    'Sieraden & Accessoires': ['Jewelry', 'Watches', 'Handbags & Wallets'],
    'Huisdierbenodigdheden': ['Pet Supplies'],
    'Auto & Motor': ['Automotive', 'Motorcycle & Powersports'],
    'Kunst & Ambachten': ['Arts, Crafts & Sewing'],
    'Overig': ['All Departments']
  };
  
  // Mapping van subcategorieën naar Amazon categorieën
  const subcategoryMapping = {
    // Gezondheid subcategorieën
    'Supplementen': ['Vitamins & Dietary Supplements', 'Herbal Supplements'],
    'Fitness apparatuur': ['Exercise & Fitness', 'Sports & Fitness'],
    'Persoonlijke verzorging': ['Personal Care', 'Skin Care'],
    'Medische hulpmiddelen': ['Medical Supplies & Equipment', 'Health Care'],
    'Wellness producten': ['Wellness & Relaxation', 'Alternative Medicine'],
    
    // Schoonheid subcategorieën
    'Huidverzorging': ['Skin Care', 'Face', 'Professional Skin Care'],
    'Make-up': ['Makeup', 'Face Makeup', 'Eye Makeup', 'Lip Makeup'],
    'Haarverzorging': ['Hair Care', 'Hair Styling Products', 'Hair Accessories'],
    'Parfum': ['Fragrance', 'Women\'s Fragrance', 'Men\'s Fragrance'],
    'Nagelverzorging': ['Nail Care', 'Nail Art & Polish'],
    
    // Elektronica subcategorieën
    'Smartphones': ['Cell Phones & Accessories', 'Smartphones'],
    'Laptops & Computers': ['Computers & Accessories', 'Laptops', 'Desktops'],
    'Audio apparatuur': ['Headphones', 'Speakers', 'Home Audio'],
    'Smart home': ['Smart Home', 'Home Automation'],
    'Gaming': ['Video Games', 'PC Gaming', 'Gaming Accessories'],
    
    // Kleding & Fashion subcategorieën
    'Dameskleding': ['Women\'s Fashion', 'Women\'s Clothing'],
    'Herenkleding': ['Men\'s Fashion', 'Men\'s Clothing'],
    'Schoenen': ['Shoes', 'Women\'s Shoes', 'Men\'s Shoes'],
    'Jassen & Blazers': ['Jackets & Coats', 'Blazers'],
    
    // Voeg hier meer subcategorie mappings toe indien nodig
  };
  
  let amazonCategories = [];
  
  // Voeg categorie-specifieke Amazon categorieën toe
  if (category && categoryMapping[category]) {
    amazonCategories = [...amazonCategories, ...categoryMapping[category]];
  }
  
  // Voeg subcategorie-specifieke Amazon categorieën toe
  if (subcategory && subcategoryMapping[subcategory]) {
    amazonCategories = [...amazonCategories, ...subcategoryMapping[subcategory]];
  }
  
  // Als er geen categorieën zijn gevonden, gebruik een algemene categorie
  if (amazonCategories.length === 0) {
    amazonCategories = ['All Departments'];
  }
  
  // Verwijder duplicaten en beperk tot 5 categorieën
  return [...new Set(amazonCategories)].slice(0, 5);
};

/**
 * Fallback methode voor het bepalen van relevante Amazon producten
 * @param {string} description - Productomschrijving
 * @param {string} category - Productcategorie
 * @param {string} subcategory - Productsubcategorie
 * @returns {Array} Array van relevante Amazon product URLs
 */
const getAmazonProductsFallback = async (description, category, subcategory) => {
  // In een echte implementatie zou je hier een API kunnen aanroepen om producten te zoeken
  // Voor nu gebruiken we een mock implementatie met voorgedefinieerde product URLs
  
  // Voorgedefinieerde product URLs per categorie
  const productMapping = {
    'Gezondheid': [
      'https://www.amazon.com/dp/B07NDYJX36', // Multivitamine
      'https://www.amazon.com/dp/B00M9TD6LS', // Proteïne supplement
      'https://www.amazon.com/dp/B07HNHQ1K7'  // Fitness tracker
    ],
    'Schoonheid': [
      'https://www.amazon.com/dp/B00L3PDMG8', // Gezichtscrème
      'https://www.amazon.com/dp/B01N9SPQHQ', // Mascara
      'https://www.amazon.com/dp/B003WQMSFE'  // Shampoo
    ],
    'Elektronica': [
      'https://www.amazon.com/dp/B08L5TNJHG', // Smartphone
      'https://www.amazon.com/dp/B08N5M7S6K', // Laptop
      'https://www.amazon.com/dp/B07PXGQC1Q'  // Draadloze koptelefoon
    ],
    'Kleding & Fashion': [
      'https://www.amazon.com/dp/B07BJKRR25', // T-shirt
      'https://www.amazon.com/dp/B07DFPKM9B', // Jeans
      'https://www.amazon.com/dp/B07JW9H4J1'  // Jas
    ],
    // Voeg hier meer categorie mappings toe indien nodig
  };
  
  // Voorgedefinieerde product URLs per subcategorie
  const subcategoryProductMapping = {
    'Supplementen': [
      'https://www.amazon.com/dp/B0B8N5L5FD', // Vitamine D
      'https://www.amazon.com/dp/B07H9P7HY7', // Omega-3
      'https://www.amazon.com/dp/B07ND3YWBJ'  // Magnesium
    ],
    'Huidverzorging': [
      'https://www.amazon.com/dp/B01MSSDEPK', // Gezichtsserum
      'https://www.amazon.com/dp/B01N9SPQHQ', // Gezichtsmasker
      'https://www.amazon.com/dp/B00L3PDMG8'  // Moisturizer
    ],
    'Smartphones': [
      'https://www.amazon.com/dp/B08L5TNJHG', // iPhone
      'https://www.amazon.com/dp/B08FYVMRM5', // Samsung Galaxy
      'https://www.amazon.com/dp/B08CK62S61'  // Google Pixel
    ],
    // Voeg hier meer subcategorie mappings toe indien nodig
  };
  
  let products = [];
  
  // Voeg categorie-specifieke producten toe
  if (category && productMapping[category]) {
    products = [...products, ...productMapping[category]];
  }
  
  // Voeg subcategorie-specifieke producten toe
  if (subcategory && subcategoryProductMapping[subcategory]) {
    products = [...products, ...subcategoryProductMapping[subcategory]];
  }
  
  // Als er geen producten zijn gevonden, gebruik algemene populaire producten
  if (products.length === 0) {
    products = [
      'https://www.amazon.com/dp/B08L5TNJHG',
      'https://www.amazon.com/dp/B00L3PDMG8',
      'https://www.amazon.com/dp/B07PXGQC1Q'
    ];
  }
  
  // Verwijder duplicaten en beperk tot 5 producten
  return [...new Set(products)].slice(0, 5);
};

export {
  getRelevantAmazonProducts
};
