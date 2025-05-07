/**
 * Scraping Platforms Index
 *
 * Dit bestand exporteert alle beschikbare platform-specifieke scrapers.
 */

const { getAmazonScraper } = require('./amazon');
const { getRedditScraper } = require('./reddit');
const { getInstagramScraper } = require('./instagram');
const { getTikTokScraper } = require('./tiktok');
const { getTrustpilotScraper } = require('./trustpilot');

// Exporteer alle scrapers
const scrapers = {
  amazon: getAmazonScraper(),
  reddit: getRedditScraper(),
  instagram: getInstagramScraper(),
  tiktok: getTikTokScraper(),
  trustpilot: getTrustpilotScraper(),
};

/**
 * Krijg een scraper voor een specifiek platform
 * @param {String} platform - Naam van het platform
 * @returns {Object} - Scraper voor het platform
 * @throws {Error} - Als het platform niet wordt ondersteund
 */
const getScraper = (platform) => {
  const scraper = scrapers[platform.toLowerCase()];

  if (!scraper) {
    throw new Error(`Platform '${platform}' wordt niet ondersteund`);
  }

  return scraper;
};

module.exports = {
  scrapers,
  getScraper,
};
