const axios = require('axios');
const { getLogger } = require('../utils/logger');

const logger = getLogger('ProxyService');

// Cache voor proxy's om herhaalde API-calls te verminderen
let proxyCache = [];
let lastFetchTime = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minuten in milliseconden

/**
 * Haalt een lijst van beschikbare proxy's op van de proxy provider
 * @returns {Promise<Array>} Lijst van beschikbare proxy's
 */
async function fetchProxies() {
  try {
    // Controleer of we de cache kunnen gebruiken
    const now = Date.now();
    if (proxyCache.length > 0 && lastFetchTime && (now - lastFetchTime < CACHE_TTL)) {
      logger.info(`Gebruik ${proxyCache.length} proxy's uit cache`);
      return proxyCache;
    }

    // Haal nieuwe proxy's op van de provider
    const apiKey = process.env.PROXY_API_KEY;
    const serviceUrl = process.env.PROXY_SERVICE_URL;
    
    if (!apiKey || !serviceUrl) {
      throw new Error('Proxy API configuratie ontbreekt. Controleer PROXY_API_KEY en PROXY_SERVICE_URL omgevingsvariabelen.');
    }
    
    logger.info('Nieuwe proxy\'s ophalen van provider...');
    
    const response = await axios.get(serviceUrl, {
      params: {
        api_key: apiKey,
        protocol: 'http',
        country: 'all',
        status: 'active',
        format: 'json'
      },
      timeout: 10000 // 10 seconden timeout
    });
    
    if (!response.data || !response.data.proxies || !Array.isArray(response.data.proxies)) {
      throw new Error('Ongeldig antwoord van proxy provider');
    }
    
    // Update de cache
    proxyCache = response.data.proxies.map(proxy => ({
      host: proxy.ip,
      port: proxy.port,
      username: proxy.username || process.env.PROXY_USERNAME,
      password: proxy.password || process.env.PROXY_PASSWORD,
      country: proxy.country,
      lastUsed: null
    }));
    
    lastFetchTime = now;
    
    logger.info(`${proxyCache.length} nieuwe proxy's opgehaald van provider`);
    return proxyCache;
  } catch (error) {
    logger.error(`Fout bij het ophalen van proxy's: ${error.message}`);
    
    // Als we een cache hebben, gebruik die als fallback
    if (proxyCache.length > 0) {
      logger.warn(`Gebruik ${proxyCache.length} proxy's uit cache als fallback`);
      return proxyCache;
    }
    
    // Als laatste redmiddel, gebruik een mock proxy voor lokale ontwikkeling
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Gebruik mock proxy voor lokale ontwikkeling');
      return [{
        host: 'localhost',
        port: 8888,
        username: 'user',
        password: 'pass',
        country: 'local',
        lastUsed: null
      }];
    }
    
    throw error;
  }
}

/**
 * Selecteert een geschikte proxy uit de beschikbare pool
 * @param {Object} options - Opties voor proxy selectie
 * @param {String} options.country - Specifiek land voor de proxy (optioneel)
 * @param {String} options.exclude - IP om uit te sluiten (optioneel)
 * @returns {Promise<Object>} Geselecteerde proxy object
 */
async function getProxy(options = {}) {
  try {
    const proxies = await fetchProxies();
    
    if (proxies.length === 0) {
      throw new Error('Geen proxy\'s beschikbaar');
    }
    
    // Filter proxy's op basis van opties
    let filteredProxies = [...proxies];
    
    if (options.country) {
      filteredProxies = filteredProxies.filter(proxy => 
        proxy.country && proxy.country.toLowerCase() === options.country.toLowerCase()
      );
    }
    
    if (options.exclude) {
      filteredProxies = filteredProxies.filter(proxy => proxy.host !== options.exclude);
    }
    
    // Als er geen proxy's overblijven na filtering, gebruik de originele lijst
    if (filteredProxies.length === 0) {
      logger.warn('Geen proxy\'s voldoen aan de filtercriteria, gebruik volledige lijst');
      filteredProxies = proxies;
    }
    
    // Sorteer op laatst gebruikt (null eerst, dan oudste eerst)
    filteredProxies.sort((a, b) => {
      if (a.lastUsed === null) return -1;
      if (b.lastUsed === null) return 1;
      return a.lastUsed - b.lastUsed;
    });
    
    // Selecteer de eerste proxy (minst recent gebruikt)
    const selectedProxy = filteredProxies[0];
    
    // Update lastUsed timestamp
    selectedProxy.lastUsed = Date.now();
    
    logger.info(`Proxy geselecteerd: ${selectedProxy.host}:${selectedProxy.port} (${selectedProxy.country || 'onbekend land'})`);
    
    return selectedProxy;
  } catch (error) {
    logger.error(`Fout bij het selecteren van een proxy: ${error.message}`);
    throw error;
  }
}

/**
 * Markeert een proxy als niet-werkend
 * @param {String} host - IP-adres van de proxy
 */
function markProxyAsFailed(host) {
  if (!host || !proxyCache.length) return;
  
  const index = proxyCache.findIndex(proxy => proxy.host === host);
  
  if (index !== -1) {
    // Verwijder de proxy uit de cache
    proxyCache.splice(index, 1);
    logger.info(`Proxy ${host} gemarkeerd als niet-werkend en verwijderd uit cache`);
  }
}

module.exports = {
  getProxy,
  markProxyAsFailed
};
