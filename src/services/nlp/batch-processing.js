/**
 * Batch Processing Service
 *
 * Dit bestand bevat de service voor batch processing van teksten.
 * Het biedt functionaliteit voor het efficiënt verwerken van grote hoeveelheden
 * teksten met parallelle verwerking en rate limiting.
 */

const pThrottle = require('p-throttle');

/**
 * Batch Processing Service klasse
 */
class BatchProcessingService {
  constructor() {
    // Standaard batch grootte
    this.defaultBatchSize = 10;

    // Standaard concurrency
    this.defaultConcurrency = 5;

    // Standaard rate limiting
    this.defaultRateLimit = {
      calls: 10,
      period: 1000, // 10 calls per seconde
    };

    // Initialiseer throttle functie
    this.throttle = pThrottle({
      limit: this.defaultRateLimit.calls,
      interval: this.defaultRateLimit.period,
    });
  }

  /**
   * Verwerk een batch teksten met een processor functie
   * @param {Array<String|Object>} items - Array van teksten of objecten om te verwerken
   * @param {Function} processorFn - Functie om een individueel item te verwerken
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Array<Object>>} - Resultaten van de verwerking
   */
  async processBatch(items, processorFn, options = {}) {
    try {
      if (!items || items.length === 0) {
        return [];
      }

      // Configureer opties
      const batchSize = options.batchSize || this.defaultBatchSize;
      const concurrency = options.concurrency || this.defaultConcurrency;

      // Configureer rate limiting indien nodig
      if (options.rateLimit) {
        this.throttle = pThrottle({
          limit: options.rateLimit.calls || this.defaultRateLimit.calls,
          interval: options.rateLimit.period || this.defaultRateLimit.period,
        });
      }

      // Verdeel items in batches
      const batches = this.splitIntoBatches(items, batchSize);
      console.log(`🔄 Verwerken van ${items.length} items in ${batches.length} batches (grootte: ${batchSize}, concurrency: ${concurrency})`);

      // Verwerk batches sequentieel, maar items binnen een batch parallel
      const results = [];
      let processedCount = 0;

      for (const [batchIndex, batch] of batches.entries()) {
        console.log(`🔄 Verwerken van batch ${batchIndex + 1}/${batches.length} (${batch.length} items)...`);

        // Maak throttled processor functie
        const throttledProcessor = this.throttle(async (item) => {
          try {
            return await processorFn(item);
          } catch (error) {
            console.error('❌ Fout bij verwerken van item:', error);
            return {
              error: error.message,
              item,
            };
          }
        });

        // Verwerk items in batch parallel met beperkte concurrency
        const batchPromises = [];
        const activeBatchPromises = new Set();

        for (const item of batch) {
          // Wacht indien nodig tot er ruimte is voor een nieuwe belofte
          while (activeBatchPromises.size >= concurrency) {
            await Promise.race([
              ...activeBatchPromises,
            ]).then((result) => {
              // Verwijder voltooide beloftes uit de actieve set
              for (const promise of activeBatchPromises) {
                Promise.resolve(promise).then((r) => {
                  if (r === result) {
                    activeBatchPromises.delete(promise);
                  }
                });
              }
            });
          }

          // Maak een nieuwe belofte aan en voeg toe aan de actieve set
          const promise = throttledProcessor(item).then((result) => {
            processedCount++;

            // Log voortgang periodiek
            if (processedCount % 10 === 0 || processedCount === items.length) {
              console.log(`✅ Verwerkt: ${processedCount}/${items.length} items (${Math.round(processedCount / items.length * 100)}%)`);
            }

            return result;
          });

          activeBatchPromises.add(promise);
          batchPromises.push(promise);
        }

        // Wacht tot alle items in de batch zijn verwerkt
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Voeg een pauze toe tussen batches indien aangegeven
        if (options.batchPauseMs && batchIndex < batches.length - 1) {
          console.log(`⏱️ Pauzeren voor ${options.batchPauseMs}ms tussen batches...`);
          await new Promise((resolve) => setTimeout(resolve, options.batchPauseMs));
        }
      }

      console.log(`✅ Batch verwerking voltooid: ${results.length} resultaten`);

      return results;
    } catch (error) {
      console.error('❌ Fout bij batch verwerking:', error);
      throw error;
    }
  }

  /**
   * Verdeel items in batches van een bepaalde grootte
   * @param {Array<any>} items - Array van items
   * @param {Number} batchSize - Grootte van elke batch
   * @returns {Array<Array<any>>} - Array van batches
   */
  splitIntoBatches(items, batchSize) {
    const batches = [];

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Verwerk items in parallelle streams met rate limiting
   * @param {Array<any>} items - Array van items
   * @param {Function} processorFn - Functie om een individueel item te verwerken
   * @param {Number} concurrency - Maximum aantal parallelle verwerkingen
   * @param {Object} rateLimit - Rate limiting configuratie
   * @returns {Promise<Array<any>>} - Resultaten van de verwerking
   */
  async processParallel(items, processorFn, concurrency = 5, rateLimit = null) {
    return this.processBatch(items, processorFn, {
      batchSize: items.length,
      concurrency,
      rateLimit,
    });
  }

  /**
   * Verwerk items sequentieel met rate limiting
   * @param {Array<any>} items - Array van items
   * @param {Function} processorFn - Functie om een individueel item te verwerken
   * @param {Object} rateLimit - Rate limiting configuratie
   * @returns {Promise<Array<any>>} - Resultaten van de verwerking
   */
  async processSequential(items, processorFn, rateLimit = null) {
    return this.processBatch(items, processorFn, {
      batchSize: items.length,
      concurrency: 1,
      rateLimit,
    });
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de BatchProcessingService
 * @returns {BatchProcessingService} - BatchProcessingService instance
 */
const getBatchProcessingService = () => {
  if (!instance) {
    instance = new BatchProcessingService();
  }
  return instance;
};

module.exports = {
  getBatchProcessingService,
};
