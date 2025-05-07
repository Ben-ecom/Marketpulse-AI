/**
 * ProxyManager service voor het beheren van roterende proxies
 * Deze service beheert een pool van proxies en biedt functionaliteit om proxies te roteren
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { SocksProxyAgent } from 'socks-proxy-agent';
import pkg from 'https-proxy-agent';
const { HttpsProxyAgent } = pkg;

// ES modules equivalent voor __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ProxyManager {
  constructor() {
    this.proxies = [];
    this.currentProxyIndex = 0;
    this.proxyConfigPath = process.env.PROXY_CONFIG_PATH || path.join(__dirname, '../../../config/proxies.json');
    this.loadedFromFile = false;
  }

  /**
   * Laad proxies uit een configuratiebestand
   */
  async loadProxiesFromFile() {
    try {
      const data = await fs.readFile(this.proxyConfigPath, 'utf8');
      const proxyConfig = JSON.parse(data);
      
      if (Array.isArray(proxyConfig.proxies) && proxyConfig.proxies.length > 0) {
        this.proxies = proxyConfig.proxies;
        this.loadedFromFile = true;
        console.log(`Loaded ${this.proxies.length} proxies from configuration file`);
        return true;
      } else {
        console.warn('No proxies found in configuration file or invalid format');
        return false;
      }
    } catch (error) {
      console.error('Error loading proxy configuration:', error.message);
      return false;
    }
  }

  /**
   * Voeg een proxy toe aan de pool
   * @param {Object} proxy - Proxy configuratie object
   * @param {string} proxy.host - Proxy hostname of IP
   * @param {number} proxy.port - Proxy poort
   * @param {string} [proxy.protocol='http'] - Proxy protocol (http, https, socks4, socks5)
   * @param {string} [proxy.username] - Optionele gebruikersnaam voor authenticatie
   * @param {string} [proxy.password] - Optionele wachtwoord voor authenticatie
   */
  addProxy(proxy) {
    if (!proxy || !proxy.host || !proxy.port) {
      throw new Error('Invalid proxy configuration: host and port are required');
    }
    
    // Standaard protocol is http als niet gespecificeerd
    if (!proxy.protocol) {
      proxy.protocol = 'http';
    }
    
    this.proxies.push(proxy);
  }

  /**
   * Verwijder een proxy uit de pool
   * @param {number} index - Index van de proxy om te verwijderen
   */
  removeProxy(index) {
    if (index >= 0 && index < this.proxies.length) {
      this.proxies.splice(index, 1);
      
      // Reset de huidige index als nodig
      if (this.currentProxyIndex >= this.proxies.length) {
        this.currentProxyIndex = 0;
      }
    }
  }

  /**
   * Krijg de volgende proxy in de rotatie
   * @returns {Object} Proxy configuratie object
   */
  getNextProxy() {
    if (this.proxies.length === 0) {
      return null;
    }
    
    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    return proxy;
  }

  /**
   * Krijg een proxy agent voor gebruik met Puppeteer
   * @returns {Object} Proxy agent object
   */
  getProxyAgent() {
    const proxy = this.getNextProxy();
    
    if (!proxy) {
      return null;
    }
    
    let proxyUrl;
    
    // Bouw de proxy URL op basis van het protocol en authenticatie
    if (proxy.username && proxy.password) {
      proxyUrl = `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    } else {
      proxyUrl = `${proxy.protocol}://${proxy.host}:${proxy.port}`;
    }
    
    // Maak de juiste agent op basis van het protocol
    if (proxy.protocol.startsWith('socks')) {
      return new SocksProxyAgent(proxyUrl);
    } else {
      return new HttpsProxyAgent(proxyUrl);
    }
  }

  /**
   * Krijg een proxy URL voor gebruik met Puppeteer
   * @returns {string} Proxy URL
   */
  getProxyUrl() {
    const proxy = this.getNextProxy();
    
    if (!proxy) {
      return null;
    }
    
    // Bouw de proxy URL op basis van het protocol en authenticatie
    if (proxy.username && proxy.password) {
      return `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
    } else {
      return `${proxy.protocol}://${proxy.host}:${proxy.port}`;
    }
  }

  /**
   * Controleer of er proxies beschikbaar zijn
   * @returns {boolean} True als er proxies beschikbaar zijn
   */
  hasProxies() {
    return this.proxies.length > 0;
  }

  /**
   * Krijg het aantal beschikbare proxies
   * @returns {number} Aantal proxies
   */
  getProxyCount() {
    return this.proxies.length;
  }
}

// Singleton instantie
const proxyManager = new ProxyManager();

export default proxyManager;
