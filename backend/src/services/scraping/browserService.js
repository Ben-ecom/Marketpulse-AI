/**
 * BrowserService voor het configureren en beheren van Puppeteer met anti-detectie maatregelen
 * Maakt gebruik van puppeteer-extra en diverse plugins om detectie te voorkomen
 */

import puppeteer from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';

// Import alle anti-detectie plugins
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AnonymizeUAPlugin from 'puppeteer-extra-plugin-anonymize-ua';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import BlockResourcesPlugin from 'puppeteer-extra-plugin-block-resources';
import UserPrefsPlugin from 'puppeteer-extra-plugin-user-preferences';
import UserDataDirPlugin from 'puppeteer-extra-plugin-user-data-dir';
import DevToolsPlugin from 'puppeteer-extra-plugin-devtools';

import proxyManager from './proxyManager.js';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Configuratie voor 2captcha of andere reCAPTCHA oplossers
const RECAPTCHA_PROVIDER = process.env.RECAPTCHA_PROVIDER || '2captcha';
const RECAPTCHA_API_KEY = process.env.RECAPTCHA_API_KEY || '';

// Voeg alle plugins toe aan puppeteer-extra met optimale configuratie

// 1. Stealth plugin - de belangrijkste anti-detectie plugin
puppeteerExtra.use(StealthPlugin());

// 2. Anonymize User Agent plugin - verandert de user agent op een intelligente manier
const anonymizeUA = AnonymizeUAPlugin({
  customFn: (ua) => ua.replace(/(headless|puppeteer)/gi, ''),
  makeWindows: true,  // Simuleer Windows als platform
  stripHeadless: true // Verwijder headless verwijzingen
});
puppeteerExtra.use(anonymizeUA);

// 3. reCAPTCHA plugin - helpt bij het oplossen van CAPTCHAs
if (RECAPTCHA_API_KEY) {
  puppeteerExtra.use(
    RecaptchaPlugin({
      provider: {
        id: RECAPTCHA_PROVIDER,
        token: RECAPTCHA_API_KEY
      },
      visualFeedback: true,  // Visuele feedback tijdens oplossen
      solveInactiveChallenges: true,  // Los inactieve challenges op
      solveScoreBased: true,  // Los score-based v3 challenges op
      solveInViewport: true   // Los challenges op in viewport
    })
  );
  console.log(`reCAPTCHA solver geconfigureerd met provider: ${RECAPTCHA_PROVIDER}`);
} else {
  console.log('Geen reCAPTCHA API key gevonden, solver niet geconfigureerd');
}

// 4. Block Resources plugin - blokkeert onnodige resources voor betere prestaties
const blockResources = BlockResourcesPlugin({
  // Blokkeer afbeeldingen, fonts, media en stylesheets voor snelheid
  blockedTypes: new Set(['image', 'font', 'media', 'stylesheet']),
  // Maar sta belangrijke resources toe voor specifieke domeinen
  allowedDomains: new Set(['reddit.com', 'www.reddit.com']),
  // Sta specifieke URL patronen toe (bijv. voor login functionaliteit)
  allowedURLs: new Set(['https://www.reddit.com/login'])
});
puppeteerExtra.use(blockResources);

// 5. User Preferences plugin - stelt browser preferences in om detectie te vermijden
puppeteerExtra.use(
  UserPrefsPlugin({
    userPrefs: {
      // WebKit voorkeuren
      webkit: {
        webprefs: {
          default_font_size: 16,
          default_fixed_font_size: 13,
          default_encoding: 'UTF-8'
        }
      },
      // Profiel instellingen
      profile: {
        content_settings: {
          exceptions: {
            plugins: {},
            images: {},
            javascript: {}
          }
        },
        default_content_setting_values: {
          notifications: 2  // Blokkeer notificaties
        }
      },
      // Browser instellingen
      browser: {
        check_default_browser: false,
        enable_spellchecking: false,
        window_placement: {}
      },
      // Vertaling uitschakelen
      translate: {
        enabled: false
      },
      // Autofill uitschakelen
      autofill: {
        enabled: false
      },
      // Credentials service uitschakelen
      credentials_enable_service: false,
      // Download instellingen
      download: {
        prompt_for_download: false,
        default_directory: path.join(os.tmpdir(), 'puppeteer_downloads')
      },
      // Safe browsing uitschakelen
      safebrowsing: {
        enabled: false
      },
      // Privacy instellingen
      privacy: {
        services: {
          account_id_service: {
            enabled: false
          },
          autofill_assistant_service: {
            enabled: false
          }
        }
      }
    }
  })
);

// 6. User Data Directory plugin - maakt persistente browser sessies mogelijk
const userDataDirPath = path.join(os.tmpdir(), 'puppeteer_user_data');
if (!fs.existsSync(userDataDirPath)) {
  fs.mkdirSync(userDataDirPath, { recursive: true });
}
puppeteerExtra.use(UserDataDirPlugin({ 
  userDataDir: userDataDirPath,
  clearOnStart: false,  // Behoud cookies en sessies tussen runs
  deleteTemporary: true // Verwijder tijdelijke bestanden
}));

// 7. DevTools plugin - voegt DevTools protocol conveniences toe
puppeteerExtra.use(DevToolsPlugin({
  port: 9222,  // DevTools debug port
  path: '/devtools'  // DevTools URL path
}));

console.log('Alle Puppeteer plugins succesvol geconfigureerd voor optimale anti-detectie');


class BrowserService {
  constructor() {
    this.browser = null;
    this.activeBrowsers = new Map();
    this.defaultLaunchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials',
        '--disable-features=BlockInsecurePrivateNetworkRequests',
        '--disable-blink-features=AutomationControlled'
      ],
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    };
  }

  /**
   * Lanceert een nieuwe browser instantie met anti-detectie maatregelen
   * @param {Object} options - Extra opties voor het lanceren van de browser
   * @param {boolean} useProxy - Of een proxy moet worden gebruikt
   * @param {string} sessionId - Optionele sessie ID voor het bijhouden van browser instanties
   * @returns {Promise<Browser>} Puppeteer browser instantie
   */
  async launchBrowser(options = {}, useProxy = true, sessionId = null) {
    // Combineer standaard opties met aangepaste opties
    const launchOptions = { ...this.defaultLaunchOptions, ...options };

    // Voeg proxy toe als nodig
    if (useProxy && proxyManager.hasProxies()) {
      const proxyUrl = proxyManager.getProxyUrl();
      if (proxyUrl) {
        launchOptions.args.push(`--proxy-server=${proxyUrl}`);
        console.log(`Using proxy: ${proxyUrl}`);
      }
    }

    // Lanceer de browser met puppeteer-extra
    const browser = await puppeteerExtra.launch(launchOptions);

    // Sla de browser op als een sessie ID is opgegeven
    if (sessionId) {
      this.activeBrowsers.set(sessionId, browser);
    } else {
      this.browser = browser;
    }

    return browser;
  }

  /**
   * Krijg een bestaande browser instantie of lanceer een nieuwe
   * @param {string} sessionId - Optionele sessie ID voor het bijhouden van browser instanties
   * @param {Object} options - Extra opties voor het lanceren van de browser
   * @param {boolean} useProxy - Of een proxy moet worden gebruikt
   * @returns {Promise<Browser>} Puppeteer browser instantie
   */
  async getBrowser(sessionId = null, options = {}, useProxy = true) {
    if (sessionId && this.activeBrowsers.has(sessionId)) {
      return this.activeBrowsers.get(sessionId);
    } else if (!sessionId && this.browser) {
      return this.browser;
    }

    return this.launchBrowser(options, useProxy, sessionId);
  }

  /**
   * Sluit een browser instantie
   * @param {string} sessionId - Optionele sessie ID voor het bijhouden van browser instanties
   */
  async closeBrowser(sessionId = null) {
    if (sessionId && this.activeBrowsers.has(sessionId)) {
      const browser = this.activeBrowsers.get(sessionId);
      await browser.close();
      this.activeBrowsers.delete(sessionId);
    } else if (!sessionId && this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Sluit alle actieve browser instanties
   */
  async closeAllBrowsers() {
    // Sluit alle sessie browsers
    for (const [sessionId, browser] of this.activeBrowsers.entries()) {
      await browser.close();
      this.activeBrowsers.delete(sessionId);
    }

    // Sluit de standaard browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Creëer een nieuwe pagina met extra anti-detectie maatregelen
   * @param {Browser} browser - Puppeteer browser instantie
   * @returns {Promise<Page>} Puppeteer pagina instantie
   */
  async createPage(browser) {
    const page = await browser.newPage();

    // Extra pagina-niveau anti-detectie maatregelen
    await this.applyPageAntiDetection(page);

    return page;
  }

  /**
   * Pas extra anti-detectie maatregelen toe op pagina niveau
   * @param {Page} page - Puppeteer pagina instantie
   */
  async applyPageAntiDetection(page) {
    // Willekeurige user agent (als niet al ingesteld door de plugin)
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
    ];
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    await page.setUserAgent(randomUserAgent);

    // Verberg webdriver
    await page.evaluateOnNewDocument(() => {
      // Verberg webdriver eigenschappen
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      });

      // Verberg Chrome
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          // Nep plugins array
          return [
            {
              0: {
                type: 'application/x-google-chrome-pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format'
              },
              name: 'Chrome PDF Plugin',
              filename: 'internal-pdf-viewer',
              description: 'Portable Document Format'
            },
            {
              0: {
                type: 'application/pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format'
              },
              name: 'Chrome PDF Viewer',
              filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
              description: 'Portable Document Format'
            },
            {
              0: {
                type: 'application/x-nacl',
                suffixes: '',
                description: 'Native Client Executable'
              },
              1: {
                type: 'application/x-pnacl',
                suffixes: '',
                description: 'Portable Native Client Executable'
              },
              name: 'Native Client',
              filename: 'internal-nacl-plugin',
              description: 'Native Client'
            }
          ];
        }
      });

      // Voeg talen toe
      Object.defineProperty(navigator, 'languages', {
        get: () => ['nl-NL', 'nl', 'en-US', 'en']
      });

      // Verberg automation
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Verberg webgl vendor en renderer
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) {
          return 'Intel Inc.';
        }
        if (parameter === 37446) {
          return 'Intel Iris OpenGL Engine';
        }
        return getParameter.apply(this, arguments);
      };
    });

    // Stel standaard timeout in
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(30000);

    // Voeg willekeurige muisbewegingen toe
    await this.addMouseMovementSimulation(page);
  }

  /**
   * Voeg willekeurige muisbewegingen toe om menselijk gedrag te simuleren
   * @param {Page} page - Puppeteer pagina instantie
   */
  async addMouseMovementSimulation(page) {
    await page.evaluateOnNewDocument(() => {
      // Simuleer willekeurige muisbewegingen
      const simulateMouseMovement = () => {
        const randomX = Math.floor(Math.random() * window.innerWidth);
        const randomY = Math.floor(Math.random() * window.innerHeight);
        
        const mouseEvent = new MouseEvent('mousemove', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: randomX,
          clientY: randomY
        });
        
        document.dispatchEvent(mouseEvent);
        
        // Plan de volgende beweging
        setTimeout(simulateMouseMovement, Math.floor(Math.random() * 5000) + 1000);
      };
      
      // Start de simulatie na het laden van de pagina
      window.addEventListener('load', () => {
        setTimeout(simulateMouseMovement, 1000);
      });
    });
  }

  /**
   * Navigeer naar een URL met retry mechanisme en wacht op netwerk idle
   * @param {Page} page - Puppeteer pagina instantie
   * @param {string} url - URL om naar te navigeren
   * @param {number} maxRetries - Maximum aantal retries
   * @param {number} retryDelay - Vertraging tussen retries in ms
   * @returns {Promise<boolean>} True als navigatie succesvol was
   */
  async navigateWithRetry(page, url, maxRetries = 3, retryDelay = 2000) {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        await page.goto(url, { 
          waitUntil: 'networkidle2',
          timeout: 60000
        });
        return true;
      } catch (error) {
        console.error(`Navigation error (attempt ${retries + 1}/${maxRetries}):`, error.message);
        retries++;
        
        if (retries >= maxRetries) {
          console.error(`Failed to navigate to ${url} after ${maxRetries} attempts`);
          return false;
        }
        
        // Wacht voor volgende poging
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    return false;
  }

  /**
   * Wacht een willekeurige tijd om menselijk gedrag te simuleren
   * @param {number} minMs - Minimum wachttijd in ms
   * @param {number} maxMs - Maximum wachttijd in ms
   */
  async randomDelay(minMs = 1000, maxMs = 5000) {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Los reCAPTCHA op als aanwezig op de pagina
   * @param {Page} page - Puppeteer pagina instantie
   * @returns {Promise<boolean>} True als reCAPTCHA succesvol is opgelost
   */
  async solveRecaptcha(page) {
    try {
      if (!process.env.RECAPTCHA_PROVIDER || !process.env.RECAPTCHA_API_KEY) {
        console.warn('reCAPTCHA solving is not configured');
        return false;
      }
      
      const result = await page.solveRecaptchas();
      
      if (result && result.solved && result.solved.length > 0) {
        console.log('reCAPTCHA solved successfully');
        return true;
      } else {
        console.warn('No reCAPTCHA found or solving failed');
        return false;
      }
    } catch (error) {
      console.error('Error solving reCAPTCHA:', error.message);
      return false;
    }
  }
}

// Singleton instantie
const browserService = new BrowserService();

export default browserService;
