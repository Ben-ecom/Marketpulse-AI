/**
 * cacheUtils.js
 * 
 * Geavanceerde utilities voor het cachen van data met time-to-live (TTL) functionaliteit,
 * prioriteitscache en automatische garbage collection.
 */

// Cache configuratie
const CONFIG = {
  DEFAULT_TTL: 300, // 5 minuten in seconden
  MAX_CACHE_SIZE: 1000, // Maximum aantal items in de cache
  GARBAGE_COLLECTION_INTERVAL: 60000, // 1 minuut in milliseconden
  PRIORITY_LEVELS: {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  }
};

// In-memory cache object
const cache = {};

// Cache statistieken
const stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  evictions: 0,
  garbageCollections: 0
};

/**
 * Slaat data op in de cache met een opgegeven time-to-live (TTL) en prioriteit
 * @param {string} key - De sleutel om de data onder op te slaan
 * @param {any} data - De data om op te slaan
 * @param {Object} options - Opties voor het cachen
 * @param {number} options.ttlSeconds - Time-to-live in seconden (standaard 5 minuten)
 * @param {number} options.priority - Prioriteit van het item (1=laag, 2=medium, 3=hoog)
 * @param {boolean} options.compress - Of de data moet worden gecomprimeerd (voor grote datasets)
 */
export const setCache = (key, data, options = {}) => {
  const {
    ttlSeconds = CONFIG.DEFAULT_TTL,
    priority = CONFIG.PRIORITY_LEVELS.MEDIUM,
    compress = false
  } = options;
  
  const now = new Date().getTime();
  const expiry = now + (ttlSeconds * 1000);
  
  // Controleer of de cache vol is en maak ruimte indien nodig
  if (Object.keys(cache).length >= CONFIG.MAX_CACHE_SIZE) {
    evictCacheItems();
  }
  
  // Comprimeer grote datasets indien nodig
  const storedData = compress ? compressData(data) : data;
  
  cache[key] = {
    data: storedData,
    expiry,
    priority,
    compressed: compress,
    lastAccessed: now,
    accessCount: 0
  };
  
  stats.sets++;
};

/**
 * Haalt data op uit de cache als deze bestaat en niet verlopen is
 * @param {string} key - De sleutel om op te zoeken
 * @returns {any|null} - De opgeslagen data of null als deze niet bestaat of verlopen is
 */
export const getCache = (key) => {
  const now = new Date().getTime();
  const cacheItem = cache[key];
  
  if (!cacheItem) {
    stats.misses++;
    return null;
  }
  
  if (now > cacheItem.expiry) {
    // Cache is verlopen, verwijder het
    delete cache[key];
    stats.misses++;
    return null;
  }
  
  // Update statistieken en metadata
  cacheItem.lastAccessed = now;
  cacheItem.accessCount++;
  stats.hits++;
  
  // Decomprimeer indien nodig
  return cacheItem.compressed ? decompressData(cacheItem.data) : cacheItem.data;
};

/**
 * Verwijdert een item uit de cache
 * @param {string} key - De sleutel om te verwijderen
 */
export const removeCache = (key) => {
  delete cache[key];
};

/**
 * Verwijdert alle items uit de cache
 */
export const clearCache = () => {
  Object.keys(cache).forEach(key => {
    delete cache[key];
  });
};

/**
 * Verwijdert alle items uit de cache die beginnen met het opgegeven prefix
 * @param {string} prefix - Het prefix om op te filteren
 */
export const clearCacheByPrefix = (prefix) => {
  Object.keys(cache).forEach(key => {
    if (key.startsWith(prefix)) {
      delete cache[key];
    }
  });
};

/**
 * Verwijdert verlopen items uit de cache
 * @returns {number} - Het aantal verwijderde items
 */
export const removeExpiredItems = () => {
  const now = new Date().getTime();
  let count = 0;
  
  Object.keys(cache).forEach(key => {
    if (cache[key].expiry < now) {
      delete cache[key];
      count++;
    }
  });
  
  return count;
};

/**
 * Verwijdert items uit de cache op basis van prioriteit en laatst gebruikt
 * @private
 */
const evictCacheItems = () => {
  // Sorteer cache items op prioriteit (laagste eerst) en dan op laatst gebruikt (oudste eerst)
  const sortedKeys = Object.keys(cache).sort((a, b) => {
    if (cache[a].priority !== cache[b].priority) {
      return cache[a].priority - cache[b].priority;
    }
    return cache[a].lastAccessed - cache[b].lastAccessed;
  });
  
  // Verwijder 10% van de cache items of minimaal 1
  const itemsToRemove = Math.max(1, Math.floor(sortedKeys.length * 0.1));
  for (let i = 0; i < itemsToRemove; i++) {
    delete cache[sortedKeys[i]];
    stats.evictions++;
  }
};

/**
 * Comprimeert data voor opslag (eenvoudige implementatie)
 * @param {any} data - De data om te comprimeren
 * @returns {any} - De gecomprimeerde data
 * @private
 */
const compressData = (data) => {
  // Eenvoudige implementatie: JSON stringify en dan comprimeer
  // In een echte implementatie zou je een compressie-algoritme gebruiken
  try {
    const jsonString = JSON.stringify(data);
    // Hier zou je compressie toepassen, voor nu retourneren we gewoon de string
    return jsonString;
  } catch (error) {
    console.error('Fout bij comprimeren van cache data:', error);
    return data;
  }
};

/**
 * Decomprimeert data uit de cache (eenvoudige implementatie)
 * @param {any} data - De data om te decomprimeren
 * @returns {any} - De gedecomprimeerde data
 * @private
 */
const decompressData = (data) => {
  // Eenvoudige implementatie: decomprimeer en dan JSON parse
  // In een echte implementatie zou je een decompressie-algoritme gebruiken
  try {
    // Hier zou je decompressie toepassen, voor nu parsen we gewoon de string
    return JSON.parse(data);
  } catch (error) {
    console.error('Fout bij decomprimeren van cache data:', error);
    return data;
  }
};

/**
 * Voert garbage collection uit op de cache
 * @private
 */
const garbageCollect = () => {
  const removedCount = removeExpiredItems();
  if (removedCount > 0) {
    stats.garbageCollections++;
  }
};

/**
 * Haalt statistieken op over de cache
 * @returns {Object} - Cache statistieken
 */
export const getCacheStats = () => {
  return {
    ...stats,
    size: Object.keys(cache).length,
    maxSize: CONFIG.MAX_CACHE_SIZE,
    hitRatio: stats.hits / (stats.hits + stats.misses) || 0
  };
};

/**
 * Configureert de cache
 * @param {Object} config - Configuratie opties
 */
export const configureCache = (config = {}) => {
  Object.assign(CONFIG, config);
};

/**
 * Genereert een cache key op basis van de functienaam en parameters
 * @param {string} functionName - Naam van de functie
 * @param {Object} params - Parameters van de functie
 * @returns {string} - De gegenereerde cache key
 */
export const generateCacheKey = (functionName, params = {}) => {
  return `${functionName}:${JSON.stringify(params)}`;
};

/**
 * Wrapper functie voor het cachen van asynchrone functies
 * @param {Function} fn - De functie om te cachen
 * @param {string} functionName - Naam van de functie (voor de cache key)
 * @param {Object} options - Opties voor het cachen
 * @param {number} options.ttlSeconds - Time-to-live in seconden
 * @returns {Function} - De gecachte functie
 */
export const withCache = (fn, functionName, options = {}) => {
  return async (...args) => {
    const params = args[0] || {};
    const cacheKey = generateCacheKey(functionName, params);
    
    // Controleer of de data in de cache zit
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Haal de data op en sla deze op in de cache
    const data = await fn(...args);
    setCache(cacheKey, data, options);
    
    return data;
  };
};

// Start garbage collection interval
setInterval(garbageCollect, CONFIG.GARBAGE_COLLECTION_INTERVAL);

export default {
  setCache,
  getCache,
  removeCache,
  clearCache,
  clearCacheByPrefix,
  removeExpiredItems,
  getCacheStats,
  configureCache,
  generateCacheKey,
  withCache
};
