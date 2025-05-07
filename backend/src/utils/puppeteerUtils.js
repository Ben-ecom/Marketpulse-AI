/**
 * Utility functies voor Puppeteer
 * Bevat helper functies voor error handling, retry logica en optimale wachtfuncties
 */

import { logger } from './logger.js';

/**
 * Classificeert Puppeteer errors in specifieke types voor betere afhandeling
 * @param {Error} error - De error die geclassificeerd moet worden
 * @returns {string} - Het error type
 */
export const classifyPuppeteerError = (error) => {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('timeout') || errorMessage.includes('exceeded')) {
    return 'TIMEOUT_ERROR';
  } else if (errorMessage.includes('navigation') || errorMessage.includes('navigate')) {
    return 'NAVIGATION_ERROR';
  } else if (errorMessage.includes('selector') || errorMessage.includes('element')) {
    return 'SELECTOR_ERROR';
  } else if (errorMessage.includes('protocol') || errorMessage.includes('connection')) {
    return 'CONNECTION_ERROR';
  } else if (errorMessage.includes('context') || errorMessage.includes('target closed')) {
    return 'CONTEXT_ERROR';
  } else {
    return 'UNKNOWN_ERROR';
  }
};

/**
 * Berekent de wachttijd voor exponentiële backoff
 * @param {number} attempt - Huidige poging (0-based)
 * @param {number} baseDelay - Basis vertraging in ms
 * @param {number} maxDelay - Maximale vertraging in ms
 * @param {number} factor - Vermenigvuldigingsfactor
 * @returns {number} - Wachttijd in ms
 */
export const calculateBackoff = (attempt, baseDelay = 1000, maxDelay = 30000, factor = 2) => {
  // Bereken exponentiële backoff met jitter
  const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(factor, attempt));
  // Voeg jitter toe (±20%) om thundering herd te voorkomen
  const jitter = 0.8 + Math.random() * 0.4;
  return Math.floor(exponentialDelay * jitter);
};

/**
 * Voert een functie uit met retry logica en exponentiële backoff
 * @param {Function} fn - De async functie om uit te voeren
 * @param {Object} options - Opties voor de retry logica
 * @returns {Promise<any>} - Het resultaat van de functie
 */
export const withRetry = async (fn, options = {}) => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    retryableErrors = ['TIMEOUT_ERROR', 'NAVIGATION_ERROR', 'CONNECTION_ERROR'],
    onRetry = null
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const errorType = classifyPuppeteerError(error);
      
      // Log de error
      logger.warn(`Poging ${attempt + 1}/${maxAttempts} mislukt: ${error.message} [${errorType}]`);
      
      // Controleer of we deze error moeten retrien
      if (!retryableErrors.includes(errorType) || attempt >= maxAttempts - 1) {
        break;
      }
      
      // Bereken backoff tijd
      const delay = calculateBackoff(attempt, baseDelay, maxDelay, factor);
      logger.info(`Wachten ${delay}ms voor volgende poging...`);
      
      // Roep onRetry callback aan indien aanwezig
      if (onRetry && typeof onRetry === 'function') {
        await onRetry(error, attempt, delay);
      }
      
      // Wacht voor de volgende poging
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Als we hier komen, zijn alle pogingen mislukt
  throw lastError;
};

/**
 * Wacht op een selector met verbeterde error handling en timeout
 * @param {Page} page - Puppeteer Page object
 * @param {string} selector - CSS selector om op te wachten
 * @param {Object} options - Opties voor het wachten
 * @returns {Promise<ElementHandle|null>} - Het element of null
 */
export const waitForSelectorSafe = async (page, selector, options = {}) => {
  const {
    timeout = 10000,
    visible = false,
    hidden = false,
    retryOnFailure = true,
    maxAttempts = 2,
    logFailure = true
  } = options;
  
  try {
    if (retryOnFailure) {
      return await withRetry(async () => {
        return await page.waitForSelector(selector, { timeout, visible, hidden });
      }, { maxAttempts });
    } else {
      return await page.waitForSelector(selector, { timeout, visible, hidden });
    }
  } catch (error) {
    if (logFailure) {
      logger.warn(`Kon selector '${selector}' niet vinden binnen ${timeout}ms: ${error.message}`);
    }
    return null;
  }
};

/**
 * Wacht op navigatie met verbeterde error handling
 * @param {Page} page - Puppeteer Page object
 * @param {Object} options - Opties voor de navigatie
 * @returns {Promise<HTTPResponse|null>} - De response of null
 */
export const waitForNavigationSafe = async (page, options = {}) => {
  const {
    timeout = 30000,
    waitUntil = 'networkidle2',
    retryOnFailure = true,
    maxAttempts = 2,
    logFailure = true
  } = options;
  
  try {
    if (retryOnFailure) {
      return await withRetry(async () => {
        return await page.waitForNavigation({ timeout, waitUntil });
      }, { maxAttempts });
    } else {
      return await page.waitForNavigation({ timeout, waitUntil });
    }
  } catch (error) {
    if (logFailure) {
      logger.warn(`Navigatie timeout na ${timeout}ms: ${error.message}`);
    }
    return null;
  }
};

/**
 * Veilige versie van page.goto met retry logica
 * @param {Page} page - Puppeteer Page object
 * @param {string} url - URL om naartoe te navigeren
 * @param {Object} options - Opties voor de navigatie
 * @returns {Promise<HTTPResponse|null>} - De response of null
 */
export const gotoSafe = async (page, url, options = {}) => {
  const {
    timeout = 30000,
    waitUntil = 'networkidle2',
    retryOnFailure = true,
    maxAttempts = 3,
    logFailure = true
  } = options;
  
  try {
    if (retryOnFailure) {
      return await withRetry(async () => {
        return await page.goto(url, { timeout, waitUntil });
      }, { 
        maxAttempts,
        onRetry: async (error, attempt) => {
          // Bij retry, probeer de pagina te verversen of cache te wissen
          try {
            await page.evaluate(() => window.stop());
            await page.evaluate(() => localStorage.clear());
            await page.evaluate(() => sessionStorage.clear());
            await page.evaluate(() => {
              const cookies = document.cookie.split(';');
              for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
              }
            });
          } catch (e) {
            // Negeer errors bij cleanup
          }
        }
      });
    } else {
      return await page.goto(url, { timeout, waitUntil });
    }
  } catch (error) {
    if (logFailure) {
      logger.warn(`Kon niet navigeren naar ${url}: ${error.message}`);
    }
    return null;
  }
};

/**
 * Voert een actie uit (zoals klikken) met retry logica
 * @param {Page} page - Puppeteer Page object
 * @param {string} selector - CSS selector om op te klikken
 * @param {Object} options - Opties voor de actie
 * @returns {Promise<boolean>} - True als succesvol, anders false
 */
export const clickSafe = async (page, selector, options = {}) => {
  const {
    timeout = 5000,
    retryOnFailure = true,
    maxAttempts = 3,
    waitForNavigation = false,
    navigationOptions = {},
    logFailure = true
  } = options;
  
  try {
    // Wacht eerst op de selector
    const element = await waitForSelectorSafe(page, selector, { 
      timeout, 
      visible: true, 
      retryOnFailure,
      maxAttempts,
      logFailure
    });
    
    if (!element) {
      return false;
    }
    
    if (retryOnFailure) {
      await withRetry(async () => {
        if (waitForNavigation) {
          await Promise.all([
            waitForNavigationSafe(page, navigationOptions),
            element.click()
          ]);
        } else {
          await element.click();
        }
      }, { maxAttempts });
    } else {
      if (waitForNavigation) {
        await Promise.all([
          waitForNavigationSafe(page, navigationOptions),
          element.click()
        ]);
      } else {
        await element.click();
      }
    }
    
    return true;
  } catch (error) {
    if (logFailure) {
      logger.warn(`Kon niet klikken op selector '${selector}': ${error.message}`);
    }
    return false;
  }
};

/**
 * Veilige versie van page.evaluate met retry logica
 * @param {Page} page - Puppeteer Page object
 * @param {Function|string} pageFunction - Functie om uit te voeren in de browser
 * @param {Array} args - Argumenten voor de pageFunction
 * @param {Object} options - Opties voor de evaluatie
 * @returns {Promise<any>} - Het resultaat van de evaluatie
 */
export const evaluateSafe = async (page, pageFunction, args = [], options = {}) => {
  const {
    retryOnFailure = true,
    maxAttempts = 2,
    defaultValue = null,
    logFailure = true
  } = options;
  
  try {
    if (retryOnFailure) {
      return await withRetry(async () => {
        return await page.evaluate(pageFunction, ...args);
      }, { maxAttempts });
    } else {
      return await page.evaluate(pageFunction, ...args);
    }
  } catch (error) {
    if (logFailure) {
      logger.warn(`Evaluatie mislukt: ${error.message}`);
    }
    return defaultValue;
  }
};

/**
 * Veilige versie van delay/sleep functie
 * @param {number} ms - Aantal milliseconden om te wachten
 * @returns {Promise<void>}
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Detecteert en gaat om met captcha's en cookie banners
 * @param {Page} page - Puppeteer Page object
 * @returns {Promise<boolean>} - True als obstakels zijn opgelost, anders false
 */
export const handleCommonObstacles = async (page) => {
  let obstaclesHandled = false;
  
  // Probeer cookie banners te detecteren en te accepteren
  try {
    const cookieSelectors = [
      'button[id*="cookie"][id*="accept"]',
      'button[class*="cookie"][class*="accept"]',
      'button[id*="cookie"][id*="agree"]',
      'button[class*="cookie"][class*="agree"]',
      'button[id*="accept-cookies"]',
      'button[id*="acceptCookies"]',
      'button[class*="accept-cookies"]',
      'button[class*="acceptCookies"]',
      'a[id*="cookie"][id*="accept"]',
      'a[class*="cookie"][class*="accept"]',
      'div[id*="cookie"] button',
      'div[class*="cookie"] button',
      'div[id*="cookie-banner"] button',
      'div[class*="cookie-banner"] button',
      '[aria-label*="cookie"] button'
    ];
    
    for (const selector of cookieSelectors) {
      const cookieButton = await waitForSelectorSafe(page, selector, { 
        timeout: 2000, 
        visible: true,
        logFailure: false
      });
      
      if (cookieButton) {
        await clickSafe(page, selector, { logFailure: false });
        logger.info('Cookie banner gedetecteerd en geaccepteerd');
        obstaclesHandled = true;
        await delay(1000);
        break;
      }
    }
  } catch (error) {
    logger.debug('Geen cookie banner gevonden of kon niet accepteren');
  }
  
  // Detecteer en probeer captcha's te omzeilen (beperkte mogelijkheden)
  try {
    const captchaSelectors = [
      'iframe[src*="recaptcha"]',
      'iframe[src*="captcha"]',
      'div[class*="captcha"]',
      'div[id*="captcha"]'
    ];
    
    for (const selector of captchaSelectors) {
      const captchaElement = await waitForSelectorSafe(page, selector, { 
        timeout: 2000, 
        visible: true,
        logFailure: false
      });
      
      if (captchaElement) {
        logger.warn('Captcha gedetecteerd - kan niet automatisch worden opgelost');
        obstaclesHandled = true;
        break;
      }
    }
  } catch (error) {
    logger.debug('Geen captcha gedetecteerd');
  }
  
  return obstaclesHandled;
};

export default {
  withRetry,
  waitForSelectorSafe,
  waitForNavigationSafe,
  gotoSafe,
  clickSafe,
  evaluateSafe,
  delay,
  handleCommonObstacles
};
