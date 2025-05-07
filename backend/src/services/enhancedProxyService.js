import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Laad omgevingsvariabelen
dotenv.config();

/**
 * Verbeterde Proxy Service met rotatie en health checking
 */
class EnhancedProxyService {
  constructor() {
    this.proxyPool = [];
    this.blacklistedProxies = new Map(); // Map van proxy -> timestamp wanneer blacklist verloopt
    this.proxyStats = new Map(); // Map van proxy -> {successes, failures, lastUsed}
    this.blacklistDuration = 10 * 60 * 1000; // 10 minuten in ms
    this.initialized = false;
    
    // Configuratie
    this.rotationStrategy = process.env.PROXY_ROTATION_STRATEGY || 'random'; // 'random', 'round-robin', 'smart'
    this.currentProxyIndex = 0; // Voor round-robin strategie
  }
  
  /**
   * Initialiseer de proxy pool
   * @param {Array<string>} proxies - Array van proxy strings (optioneel, anders uit .env)
   */
  initialize(proxies = null) {
    if (this.initialized) return;
    
    // Gebruik meegeleverde proxies of haal ze uit .env
    if (proxies && Array.isArray(proxies) && proxies.length > 0) {
      this.proxyPool = [...proxies];
    } else {
      const envProxies = process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [];
      this.proxyPool = envProxies.map(proxy => proxy.trim()).filter(proxy => proxy);
    }
    
    if (this.proxyPool.length === 0) {
      logger.warn('Geen proxies geconfigureerd in proxy service');
    } else {
      logger.info(`Proxy service geïnitialiseerd met ${this.proxyPool.length} proxies`);
      
      // Initialiseer stats voor elke proxy
      this.proxyPool.forEach(proxy => {
        this.proxyStats.set(proxy, {
          successes: 0,
          failures: 0,
          lastUsed: 0
        });
      });
    }
    
    this.initialized = true;
  }
  
  /**
   * Voeg nieuwe proxies toe aan de pool
   * @param {Array<string>} proxies - Array van proxy strings
   */
  addProxies(proxies) {
    if (!this.initialized) this.initialize();
    
    if (!Array.isArray(proxies)) {
      logger.error('addProxies verwacht een array van proxies');
      return;
    }
    
    const newProxies = proxies.filter(proxy => !this.proxyPool.includes(proxy));
    
    if (newProxies.length > 0) {
      this.proxyPool.push(...newProxies);
      
      // Initialiseer stats voor nieuwe proxies
      newProxies.forEach(proxy => {
        this.proxyStats.set(proxy, {
          successes: 0,
          failures: 0,
          lastUsed: 0
        });
      });
      
      logger.info(`${newProxies.length} nieuwe proxies toegevoegd aan de pool`);
    }
  }
  
  /**
   * Verwijder proxies uit de pool
   * @param {Array<string>} proxies - Array van proxy strings
   */
  removeProxies(proxies) {
    if (!this.initialized) this.initialize();
    
    if (!Array.isArray(proxies)) {
      logger.error('removeProxies verwacht een array van proxies');
      return;
    }
    
    const initialCount = this.proxyPool.length;
    this.proxyPool = this.proxyPool.filter(proxy => !proxies.includes(proxy));
    
    // Verwijder ook uit stats en blacklist
    proxies.forEach(proxy => {
      this.proxyStats.delete(proxy);
      this.blacklistedProxies.delete(proxy);
    });
    
    const removedCount = initialCount - this.proxyPool.length;
    logger.info(`${removedCount} proxies verwijderd uit de pool`);
  }
  
  /**
   * Haal een proxy op volgens de geconfigureerde strategie
   * @returns {string|null} - Proxy string of null als geen beschikbaar
   */
  getProxy() {
    if (!this.initialized) this.initialize();
    
    // Filter blacklisted proxies
    const availableProxies = this.getAvailableProxies();
    
    if (availableProxies.length === 0) {
      // Als alle proxies blacklisted zijn, probeer de oudste te resetten
      this.resetOldestBlacklistedProxy();
      return null;
    }
    
    let selectedProxy;
    
    switch (this.rotationStrategy) {
      case 'round-robin':
        selectedProxy = this.getRoundRobinProxy(availableProxies);
        break;
      case 'smart':
        selectedProxy = this.getSmartProxy(availableProxies);
        break;
      case 'random':
      default:
        selectedProxy = this.getRandomProxy(availableProxies);
        break;
    }
    
    if (selectedProxy) {
      // Update lastUsed timestamp
      const stats = this.proxyStats.get(selectedProxy);
      if (stats) {
        stats.lastUsed = Date.now();
        this.proxyStats.set(selectedProxy, stats);
      }
      
      logger.debug(`Proxy geselecteerd: ${this.maskProxy(selectedProxy)}`);
    }
    
    return selectedProxy;
  }
  
  /**
   * Haal een willekeurige proxy op
   * @param {Array<string>} availableProxies - Beschikbare proxies
   * @returns {string|null} - Proxy string of null
   */
  getRandomProxy(availableProxies) {
    if (availableProxies.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableProxies.length);
    return availableProxies[randomIndex];
  }
  
  /**
   * Haal een proxy op via round-robin
   * @param {Array<string>} availableProxies - Beschikbare proxies
   * @returns {string|null} - Proxy string of null
   */
  getRoundRobinProxy(availableProxies) {
    if (availableProxies.length === 0) return null;
    
    // Reset index als nodig
    if (this.currentProxyIndex >= availableProxies.length) {
      this.currentProxyIndex = 0;
    }
    
    const proxy = availableProxies[this.currentProxyIndex];
    this.currentProxyIndex++;
    
    return proxy;
  }
  
  /**
   * Haal een proxy op op basis van succes/faal ratio
   * @param {Array<string>} availableProxies - Beschikbare proxies
   * @returns {string|null} - Proxy string of null
   */
  getSmartProxy(availableProxies) {
    if (availableProxies.length === 0) return null;
    
    // Bereken scores voor elke proxy
    const proxyScores = availableProxies.map(proxy => {
      const stats = this.proxyStats.get(proxy) || { successes: 0, failures: 0, lastUsed: 0 };
      
      // Voorkom delen door nul
      const totalRequests = stats.successes + stats.failures;
      const successRate = totalRequests > 0 ? stats.successes / totalRequests : 0.5;
      
      // Factor in hoe lang geleden de proxy is gebruikt (voorkom overbelasting)
      const timeSinceLastUse = Date.now() - stats.lastUsed;
      const timeBonus = Math.min(1, timeSinceLastUse / (5 * 60 * 1000)); // Max bonus na 5 minuten
      
      // Bereken totale score (successRate + timeBonus)
      const score = successRate + (timeBonus * 0.5);
      
      return { proxy, score };
    });
    
    // Sorteer op score (hoog naar laag)
    proxyScores.sort((a, b) => b.score - a.score);
    
    // 80% kans om de beste proxy te gebruiken, 20% kans op een willekeurige andere
    // Dit zorgt voor exploratie van mogelijk goede proxies
    if (Math.random() < 0.8 || proxyScores.length === 1) {
      return proxyScores[0].proxy;
    } else {
      const randomIndex = 1 + Math.floor(Math.random() * (proxyScores.length - 1));
      return proxyScores[randomIndex].proxy;
    }
  }
  
  /**
   * Rapporteer succes voor een proxy
   * @param {string} proxy - Proxy string
   */
  reportSuccess(proxy) {
    if (!proxy) return;
    
    const stats = this.proxyStats.get(proxy);
    if (stats) {
      stats.successes++;
      this.proxyStats.set(proxy, stats);
    }
  }
  
  /**
   * Rapporteer falen voor een proxy
   * @param {string} proxy - Proxy string
   * @param {boolean} blacklist - Of de proxy op de blacklist moet (default: false)
   */
  reportFailure(proxy, blacklist = false) {
    if (!proxy) return;
    
    const stats = this.proxyStats.get(proxy);
    if (stats) {
      stats.failures++;
      this.proxyStats.set(proxy, stats);
    }
    
    if (blacklist) {
      this.blacklistProxy(proxy);
    }
  }
  
  /**
   * Zet een proxy op de blacklist
   * @param {string} proxy - Proxy string
   */
  blacklistProxy(proxy) {
    if (!proxy) return;
    
    const expiryTime = Date.now() + this.blacklistDuration;
    this.blacklistedProxies.set(proxy, expiryTime);
    
    logger.warn(`Proxy ${this.maskProxy(proxy)} is op de blacklist gezet voor ${this.blacklistDuration / 60000} minuten`);
  }
  
  /**
   * Haal een proxy van de blacklist
   * @param {string} proxy - Proxy string
   */
  whitelistProxy(proxy) {
    if (!proxy) return;
    
    if (this.blacklistedProxies.has(proxy)) {
      this.blacklistedProxies.delete(proxy);
      logger.info(`Proxy ${this.maskProxy(proxy)} is van de blacklist gehaald`);
    }
  }
  
  /**
   * Haal de oudste blacklisted proxy van de blacklist
   */
  resetOldestBlacklistedProxy() {
    if (this.blacklistedProxies.size === 0) return;
    
    // Vind de proxy met de vroegste expiry time
    let oldestProxy = null;
    let oldestExpiryTime = Infinity;
    
    for (const [proxy, expiryTime] of this.blacklistedProxies.entries()) {
      if (expiryTime < oldestExpiryTime) {
        oldestExpiryTime = expiryTime;
        oldestProxy = proxy;
      }
    }
    
    if (oldestProxy) {
      this.whitelistProxy(oldestProxy);
      logger.info(`Oudste blacklisted proxy ${this.maskProxy(oldestProxy)} is gereset wegens gebrek aan beschikbare proxies`);
    }
  }
  
  /**
   * Haal alle beschikbare (niet-blacklisted) proxies op
   * @returns {Array<string>} - Array van beschikbare proxies
   */
  getAvailableProxies() {
    // Verwijder verlopen blacklist entries
    const now = Date.now();
    for (const [proxy, expiryTime] of this.blacklistedProxies.entries()) {
      if (expiryTime <= now) {
        this.blacklistedProxies.delete(proxy);
      }
    }
    
    // Filter proxies die niet op de blacklist staan
    return this.proxyPool.filter(proxy => !this.blacklistedProxies.has(proxy));
  }
  
  /**
   * Maskeer een proxy voor logging (verberg wachtwoord)
   * @param {string} proxy - Proxy string
   * @returns {string} - Gemaskeerde proxy string
   */
  maskProxy(proxy) {
    if (!proxy) return 'null';
    
    try {
      // Format: protocol://username:password@host:port
      const regex = /^(https?):\/\/(?:([^:@]+):([^@]+)@)?([^:]+):(\d+)$/;
      const match = proxy.match(regex);
      
      if (match) {
        const [, protocol, username, password, host, port] = match;
        const maskedPassword = password ? '*'.repeat(Math.min(password.length, 8)) : '';
        
        if (username && password) {
          return `${protocol}://${username}:${maskedPassword}@${host}:${port}`;
        } else {
          return `${protocol}://${host}:${port}`;
        }
      }
      
      return proxy; // Kon niet parsen, geef origineel terug
    } catch (error) {
      return proxy; // Bij error, geef origineel terug
    }
  }
  
  /**
   * Configureer Puppeteer met een proxy
   * @param {object} options - Puppeteer opties
   * @returns {object} - Geconfigureerde opties
   */
  configurePuppeteerWithProxy(options = {}) {
    if (!this.initialized) this.initialize();
    
    // Maak een kopie van de opties
    const browserOptions = { ...options };
    
    // Controleer of we proxies moeten gebruiken
    if (process.env.USE_PROXIES !== 'true' || this.proxyPool.length === 0) {
      return browserOptions;
    }
    
    // Haal een proxy op
    const proxy = this.getProxy();
    
    if (proxy) {
      try {
        // Parse de proxy string (formaat: protocol://username:password@host:port)
        const proxyParts = proxy.match(/^(https?):\/\/(?:([^:@]+):([^@]+)@)?([^:]+):(\d+)$/);
        
        if (!proxyParts) {
          logger.error(`Ongeldige proxy string: ${this.maskProxy(proxy)}`);
          return browserOptions;
        }
        
        const [, protocol, username, password, host, port] = proxyParts;
        
        // Voeg proxy toe aan de browser argumenten
        browserOptions.args = browserOptions.args || [];
        browserOptions.args.push(`--proxy-server=${protocol}://${host}:${port}`);
        
        // Sla de gebruikte proxy op voor later gebruik
        browserOptions._proxy = proxy;
        
        // Voeg authenticatie toe als nodig
        if (username && password) {
          // Puppeteer heeft een speciale manier om proxy auth te doen
          // We moeten dit doen met een page.authenticate() call na het maken van de pagina
          browserOptions._proxyAuth = {
            username,
            password
          };
        }
        
        logger.info(`Puppeteer geconfigureerd met proxy: ${this.maskProxy(proxy)}`);
      } catch (error) {
        logger.error(`Fout bij configureren Puppeteer met proxy: ${error.message}`);
      }
    }
    
    return browserOptions;
  }
  
  /**
   * Configureer een Puppeteer pagina met proxy authenticatie
   * @param {Page} page - Puppeteer Page object
   * @param {object} options - Browser opties met _proxyAuth
   */
  async configureProxyAuthentication(page, options) {
    if (options && options._proxyAuth) {
      try {
        await page.authenticate(options._proxyAuth);
        logger.debug('Proxy authenticatie geconfigureerd');
      } catch (error) {
        logger.error(`Fout bij configureren proxy authenticatie: ${error.message}`);
        
        // Rapporteer falen voor deze proxy
        if (options._proxy) {
          this.reportFailure(options._proxy, true);
        }
      }
    }
  }
  
  /**
   * Rapporteer resultaat van een scraping sessie
   * @param {object} options - Browser opties met _proxy
   * @param {boolean} success - Of de sessie succesvol was
   * @param {boolean} blacklistOnFailure - Of de proxy op de blacklist moet bij falen
   */
  reportProxyResult(options, success, blacklistOnFailure = false) {
    if (options && options._proxy) {
      if (success) {
        this.reportSuccess(options._proxy);
      } else {
        this.reportFailure(options._proxy, blacklistOnFailure);
      }
    }
  }
  
  /**
   * Krijg statistieken over de proxy pool
   * @returns {object} - Statistieken
   */
  getStats() {
    if (!this.initialized) this.initialize();
    
    const totalProxies = this.proxyPool.length;
    const blacklistedCount = this.blacklistedProxies.size;
    const availableCount = this.getAvailableProxies().length;
    
    // Bereken totale successen en failures
    let totalSuccesses = 0;
    let totalFailures = 0;
    
    for (const stats of this.proxyStats.values()) {
      totalSuccesses += stats.successes;
      totalFailures += stats.failures;
    }
    
    // Bereken top 5 beste proxies
    const proxyPerformance = Array.from(this.proxyStats.entries())
      .map(([proxy, stats]) => {
        const totalRequests = stats.successes + stats.failures;
        const successRate = totalRequests > 0 ? (stats.successes / totalRequests) * 100 : 0;
        return { 
          proxy: this.maskProxy(proxy), 
          successRate: Math.round(successRate * 100) / 100,
          totalRequests,
          blacklisted: this.blacklistedProxies.has(proxy)
        };
      })
      .filter(item => item.totalRequests > 0)
      .sort((a, b) => b.successRate - a.successRate);
    
    const topProxies = proxyPerformance.slice(0, 5);
    
    return {
      totalProxies,
      blacklistedCount,
      availableCount,
      totalSuccesses,
      totalFailures,
      successRate: totalSuccesses + totalFailures > 0 
        ? Math.round((totalSuccesses / (totalSuccesses + totalFailures)) * 10000) / 100 
        : 0,
      rotationStrategy: this.rotationStrategy,
      topProxies
    };
  }
}

// Singleton instantie
export const enhancedProxyService = new EnhancedProxyService();

export default enhancedProxyService;
