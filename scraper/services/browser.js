const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const proxyChain = require('proxy-chain');
const { getLogger } = require('../utils/logger');
const { getProxy } = require('./proxy');

// Configureer plugins
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const logger = getLogger('BrowserService');

/**
 * BrowserService - Verantwoordelijk voor het beheren van Puppeteer browser instanties
 * met stealth mode en proxy rotatie
 */
class BrowserService {
  constructor() {
    this.browser = null;
    this.currentProxy = null;
    this.proxyUrl = null;
  }

  /**
   * Initialiseert een nieuwe browser instantie met stealth mode en een roterende proxy
   * @param {Object} options - Browser configuratie opties
   * @returns {Promise<Browser>} - Puppeteer browser instantie
   */
  async launch(options = {}) {
    try {
      // Haal een nieuwe proxy op van de proxy service
      const proxy = await getProxy();
      
      if (!proxy || !proxy.host || !proxy.port) {
        throw new Error('Geen geldige proxy ontvangen van proxy service');
      }
      
      this.currentProxy = proxy;
      
      // Formatteer de proxy URL
      const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
      
      // Maak een anonieme proxy URL met proxyChain om credentials te verbergen
      this.proxyUrl = await proxyChain.anonymizeProxy(proxyUrl);
      
      logger.info(`Browser wordt gestart met proxy: ${proxy.host}:${proxy.port}`);
      
      // Standaard browser opties
      const defaultOptions = {
        headless: true,
        args: [
          `--proxy-server=${this.proxyUrl}`,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
        ],
        ignoreHTTPSErrors: true,
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
      };
      
      // Combineer standaard opties met aangepaste opties
      const browserOptions = { ...defaultOptions, ...options };
      
      // Start de browser
      this.browser = await puppeteer.launch(browserOptions);
      
      // Voeg event listener toe voor als de browser onverwacht sluit
      this.browser.on('disconnected', () => {
        logger.warn('Browser disconnected onverwacht');
        this.browser = null;
        this.cleanup();
      });
      
      return this.browser;
    } catch (error) {
      logger.error(`Fout bij het starten van de browser: ${error.message}`);
      this.cleanup();
      throw error;
    }
  }
  
  /**
   * Maakt een nieuwe pagina aan in de browser
   * @param {Object} options - Pagina configuratie opties
   * @returns {Promise<Page>} - Puppeteer page instantie
   */
  async newPage(options = {}) {
    if (!this.browser) {
      await this.launch();
    }
    
    try {
      const page = await this.browser.newPage();
      
      // Configureer extra page opties
      await page.setDefaultNavigationTimeout(options.navigationTimeout || 60000);
      await page.setDefaultTimeout(options.timeout || 30000);
      
      // Configureer user agent
      if (options.userAgent) {
        await page.setUserAgent(options.userAgent);
      } else {
        // Standaard user agent die minder verdacht is
        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
        );
      }
      
      // Configureer extra HTTP headers
      if (options.headers) {
        await page.setExtraHTTPHeaders(options.headers);
      }
      
      // Voeg request interception toe indien nodig
      if (options.interceptRequests) {
        await page.setRequestInterception(true);
        page.on('request', (request) => {
          // Blokkeer ongewenste resource types om snelheid te verbeteren
          const resourceType = request.resourceType();
          if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
            request.abort();
          } else {
            request.continue();
          }
        });
      }
      
      return page;
    } catch (error) {
      logger.error(`Fout bij het aanmaken van een nieuwe pagina: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Sluit de browser en ruimt resources op
   */
  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        logger.info('Browser succesvol gesloten');
      }
    } catch (error) {
      logger.error(`Fout bij het sluiten van de browser: ${error.message}`);
    } finally {
      this.cleanup();
    }
  }
  
  /**
   * Ruimt resources op, zoals de anonieme proxy
   */
  async cleanup() {
    try {
      if (this.proxyUrl) {
        await proxyChain.closeAnonymizedProxy(this.proxyUrl, true);
        logger.info('Proxy resources opgeruimd');
      }
    } catch (error) {
      logger.error(`Fout bij het opruimen van proxy resources: ${error.message}`);
    } finally {
      this.browser = null;
      this.currentProxy = null;
      this.proxyUrl = null;
    }
  }
  
  /**
   * Controleert of de huidige proxy nog steeds werkt
   * @returns {Promise<boolean>} - True als de proxy werkt, anders false
   */
  async isProxyWorking() {
    if (!this.browser) {
      return false;
    }
    
    try {
      const page = await this.newPage();
      await page.goto('https://api.ipify.org?format=json', { waitUntil: 'networkidle0' });
      const content = await page.content();
      await page.close();
      
      // Controleer of we een IP-adres hebben ontvangen
      return content.includes('ip') && !content.includes('error');
    } catch (error) {
      logger.error(`Proxy check mislukt: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Roteert naar een nieuwe proxy als de huidige niet meer werkt
   * @returns {Promise<boolean>} - True als rotatie succesvol was, anders false
   */
  async rotateProxyIfNeeded() {
    const isWorking = await this.isProxyWorking();
    
    if (!isWorking) {
      logger.info('Huidige proxy werkt niet meer, rotatie naar nieuwe proxy...');
      await this.close();
      await this.launch();
      return true;
    }
    
    return false;
  }
}

// Singleton instantie
const browserService = new BrowserService();

module.exports = browserService;
