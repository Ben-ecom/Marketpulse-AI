const { getLogger } = require('../utils/logger');
const { markProxyAsFailed } = require('./proxy');

const logger = getLogger('ErrorHandler');

// Configuratie voor retry strategie
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 seconde
  maxDelay: 30000, // 30 seconden
  factor: 2, // Exponentiële factor
  jitter: true // Voeg willekeurige variatie toe
};

/**
 * ErrorHandler - Verantwoordelijk voor het afhandelen van fouten en implementeren van retry strategieën
 */
class ErrorHandler {
  constructor() {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG };
  }
  
  /**
   * Configureert de retry strategie
   * @param {Object} config - Retry configuratie
   */
  configure(config = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    logger.debug(`Retry configuratie bijgewerkt: ${JSON.stringify(this.retryConfig)}`);
  }
  
  /**
   * Berekent de wachttijd voor een retry poging met exponentiële backoff
   * @param {Number} attempt - Huidige poging (0-based)
   * @returns {Number} - Wachttijd in milliseconden
   */
  calculateBackoff(attempt) {
    const { initialDelay, maxDelay, factor, jitter } = this.retryConfig;
    
    // Bereken basis wachttijd met exponentiële backoff
    let delay = initialDelay * Math.pow(factor, attempt);
    
    // Beperk tot maximale wachttijd
    delay = Math.min(delay, maxDelay);
    
    // Voeg jitter toe om "thundering herd" probleem te voorkomen
    if (jitter) {
      // Voeg tot 30% willekeurige variatie toe
      const jitterFactor = 0.7 + (Math.random() * 0.6);
      delay = Math.floor(delay * jitterFactor);
    }
    
    return delay;
  }
  
  /**
   * Voert een functie uit met automatische retries bij fouten
   * @param {Function} fn - Functie om uit te voeren
   * @param {Object} options - Opties voor retry gedrag
   * @param {Number} options.maxRetries - Maximum aantal retries
   * @param {Function} options.retryCondition - Functie die bepaalt of retry nodig is
   * @param {Function} options.onRetry - Callback functie bij elke retry
   * @returns {Promise<any>} - Resultaat van de functie
   */
  async withRetry(fn, options = {}) {
    const config = { ...this.retryConfig, ...options };
    const { maxRetries, retryCondition, onRetry } = config;
    
    let attempt = 0;
    let lastError = null;
    
    while (attempt <= maxRetries) {
      try {
        return await fn(attempt);
      } catch (error) {
        lastError = error;
        
        // Controleer of we moeten retrien
        const shouldRetry = retryCondition ? 
          retryCondition(error, attempt) : 
          this.isRetryableError(error);
        
        if (!shouldRetry || attempt >= maxRetries) {
          logger.error(`Maximaal aantal retries bereikt (${attempt}/${maxRetries}) of niet-retryable fout: ${error.message}`);
          break;
        }
        
        // Bereken wachttijd voor volgende poging
        const delay = this.calculateBackoff(attempt);
        
        logger.warn(`Poging ${attempt + 1}/${maxRetries + 1} mislukt: ${error.message}. Opnieuw proberen na ${delay}ms`);
        
        // Voer onRetry callback uit indien aanwezig
        if (onRetry) {
          try {
            await onRetry(error, attempt, delay);
          } catch (callbackError) {
            logger.error(`Fout in onRetry callback: ${callbackError.message}`);
          }
        }
        
        // Wacht voor volgende poging
        await new Promise(resolve => setTimeout(resolve, delay));
        
        attempt++;
      }
    }
    
    // Als we hier komen, zijn alle retries mislukt
    throw lastError;
  }
  
  /**
   * Controleert of een fout retryable is
   * @param {Error} error - De fout om te controleren
   * @returns {Boolean} - True als de fout retryable is
   */
  isRetryableError(error) {
    // Netwerk gerelateerde fouten zijn meestal retryable
    if (error.name === 'TimeoutError' || 
        error.message.includes('timeout') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('network error') ||
        error.message.includes('net::ERR_') ||
        error.message.includes('Navigation timeout') ||
        error.message.includes('failed to load') ||
        error.message.includes('429') || // Too Many Requests
        error.message.includes('503') || // Service Unavailable
        error.message.includes('502') || // Bad Gateway
        error.message.includes('504')) { // Gateway Timeout
      return true;
    }
    
    // HTTP status codes die retryable zijn
    if (error.statusCode && (
        error.statusCode === 408 || // Request Timeout
        error.statusCode === 429 || // Too Many Requests
        error.statusCode === 500 || // Internal Server Error
        error.statusCode === 502 || // Bad Gateway
        error.statusCode === 503 || // Service Unavailable
        error.statusCode === 504)) { // Gateway Timeout
      return true;
    }
    
    // Puppeteer specifieke fouten die retryable zijn
    if (error.message.includes('Protocol error') ||
        error.message.includes('Target closed') ||
        error.message.includes('Session closed') ||
        error.message.includes('Browser has disconnected')) {
      return true;
    }
    
    // Standaard niet retryable
    return false;
  }
  
  /**
   * Handelt proxy-gerelateerde fouten af
   * @param {Error} error - De fout om te controleren
   * @param {Object} proxy - Het proxy object dat werd gebruikt
   * @returns {Boolean} - True als de proxy werd gemarkeerd als mislukt
   */
  handleProxyError(error, proxy) {
    if (!proxy || !proxy.host) {
      return false;
    }
    
    // Controleer of de fout proxy-gerelateerd is
    if (error.message.includes('proxy') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('403') || // Forbidden
        error.message.includes('407') || // Proxy Authentication Required
        error.message.includes('net::ERR_PROXY_CONNECTION_FAILED')) {
      
      logger.warn(`Proxy-gerelateerde fout gedetecteerd: ${error.message}`);
      
      // Markeer de proxy als mislukt
      markProxyAsFailed(proxy.host);
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Handelt een fout af en bepaalt de juiste actie
   * @param {Error} error - De fout om af te handelen
   * @param {Object} context - Context informatie voor betere foutafhandeling
   * @returns {Object} - Actie informatie
   */
  handleError(error, context = {}) {
    const { proxy, url, source, jobId } = context;
    
    logger.error(`Fout bij ${source || 'onbekende bron'}${url ? ` (${url})` : ''}${jobId ? ` [Job: ${jobId}]` : ''}: ${error.message}`);
    
    // Controleer op proxy-gerelateerde fouten
    const isProxyError = this.handleProxyError(error, proxy);
    
    // Controleer of de fout retryable is
    const isRetryable = this.isRetryableError(error);
    
    // Bepaal de aanbevolen actie
    let action = 'fail';
    
    if (isProxyError) {
      action = 'rotate_proxy';
    } else if (isRetryable) {
      action = 'retry';
    }
    
    return {
      error,
      isRetryable,
      isProxyError,
      action,
      context
    };
  }
  
  /**
   * Creëert een gestructureerd foutobject voor consistente foutrapportage
   * @param {String} code - Foutcode
   * @param {String} message - Foutbericht
   * @param {Object} details - Extra details
   * @returns {Error} - Gestructureerde fout
   */
  createError(code, message, details = {}) {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
  }
}

// Singleton instantie
const errorHandler = new ErrorHandler();

module.exports = errorHandler;
