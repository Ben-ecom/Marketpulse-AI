/**
 * URL Utilities
 * 
 * Deze module bevat hulpfuncties voor het werken met URLs.
 */

/**
 * Extraheert een Amazon product ID uit een URL
 * @param {string} url - Amazon product URL
 * @returns {string|null} Amazon product ID of null als niet gevonden
 */
const extractAmazonProductId = (url) => {
  if (!url) return null;
  
  try {
    // Controleer of het een Amazon URL is
    if (!url.includes('amazon.com') && !url.includes('amazon.') && !url.includes('amzn')) {
      return null;
    }
    
    // Probeer het product ID te extraheren met verschillende methodes
    
    // Methode 1: /dp/PRODUCTID patroon
    const dpMatch = url.match(/\/dp\/([A-Z0-9]{10})/i);
    if (dpMatch && dpMatch[1]) {
      return dpMatch[1];
    }
    
    // Methode 2: /gp/product/PRODUCTID patroon
    const gpMatch = url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    if (gpMatch && gpMatch[1]) {
      return gpMatch[1];
    }
    
    // Methode 3: /ASIN/PRODUCTID patroon
    const asinMatch = url.match(/\/ASIN\/([A-Z0-9]{10})/i);
    if (asinMatch && asinMatch[1]) {
      return asinMatch[1];
    }
    
    // Methode 4: ?asin=PRODUCTID patroon
    const queryMatch = url.match(/[?&]asin=([A-Z0-9]{10})/i);
    if (queryMatch && queryMatch[1]) {
      return queryMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Fout bij het extraheren van Amazon product ID:', error);
    return null;
  }
};

/**
 * Extraheert een domein uit een URL
 * @param {string} url - URL
 * @returns {string|null} Domein of null als niet gevonden
 */
const extractDomain = (url) => {
  if (!url) return null;
  
  try {
    // Verwijder protocol (http://, https://, etc.)
    let domain = url.replace(/^(https?:\/\/)?(www\.)?/i, '');
    
    // Haal alleen het domein (tot de eerste /)
    domain = domain.split('/')[0];
    
    return domain;
  } catch (error) {
    console.error('Fout bij het extraheren van domein:', error);
    return null;
  }
};

/**
 * Controleert of een URL geldig is
 * @param {string} url - URL om te controleren
 * @returns {boolean} True als de URL geldig is, anders false
 */
const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    // Eenvoudige URL validatie met regex
    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
    return urlPattern.test(url);
  } catch (error) {
    console.error('Fout bij het valideren van URL:', error);
    return false;
  }
};

export {
  extractAmazonProductId,
  extractDomain,
  isValidUrl
};
