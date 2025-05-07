/**
 * Mock Keyword Generator voor tests
 * 
 * Deze module biedt een mock implementatie van de keywordGenerator voor testdoeleinden.
 * Hiermee kunnen we tests uitvoeren zonder afhankelijk te zijn van de Claude API.
 */

/**
 * Mock implementatie van de generateKeywords functie
 * 
 * @param {Object} productInfo - Informatie over het product
 * @returns {Promise<string[]>} Array van mock keywords
 */
const generateKeywords = async (productInfo) => {
  // Retourneer een vaste set mock keywords voor tests
  return [
    'product review',
    'best product',
    'product comparison',
    'product features',
    'product benefits',
    'product problems',
    'product alternatives',
    'product price',
    'product quality',
    'product durability',
    'product warranty',
    'product support',
    'product manual',
    'product installation',
    'product maintenance'
  ];
};

/**
 * Mock implementatie van de generateKeywordsFallback functie
 * 
 * @param {Object} productInfo - Informatie over het product
 * @returns {Array} Array van mock keywords
 */
const generateKeywordsFallback = (productInfo) => {
  // Retourneer een vaste set mock keywords voor tests
  return [
    'product review',
    'best product',
    'product comparison',
    'product features',
    'product benefits'
  ];
};

export {
  generateKeywords,
  generateKeywordsFallback
};
