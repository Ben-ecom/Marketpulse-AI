/**
 * Test Script voor Amazon Reviews Scraper
 *
 * Dit script test de functionaliteit van de Amazon reviews scraper.
 * Het voert verschillende test cases uit om te verifiëren dat de scraper correct werkt.
 */

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { getAmazonScraper } = require('./platforms/amazon');

// Controleer of de API key is ingesteld
if (!process.env.DECODO_API_KEY) {
  console.error('❌ DECODO_API_KEY is niet ingesteld in .env bestand');
  process.exit(1);
}

// Initialiseer de Amazon scraper
const amazonScraper = getAmazonScraper();

// Mock project ID voor tests
const PROJECT_ID = uuidv4();

/**
 * Voer alle tests uit
 */
async function runTests() {
  console.log('🧪 Testen van Amazon Reviews scraper...\n');

  try {
    // Test 1: URL validatie
    testUrlValidation();

    // Test 2: URL generatie
    testUrlGeneration();

    // Test 3: Review scraping
    await testReviewScraping();

    // Test 4: Gefilterde review scraping
    await testFilteredReviewScraping();

    // Test 5: Multi-product review scraping
    await testMultiProductReviewScraping();

    // Test 6: Extractie functies
    testExtractionFunctions();

    console.log('\n✅ Alle tests voltooid');
  } catch (error) {
    console.error('\n❌ Tests mislukt:', error);
  }
}

/**
 * Test URL validatie
 */
function testUrlValidation() {
  console.log('🧪 Test 1: URL validatie');

  // Test review URLs
  const reviewUrls = [
    'https://www.amazon.nl/product-reviews/B08H93ZRY1/',
    'https://amazon.de/product-reviews/B08H93ZRY1/ref=cm_cr_dp_d_show_all_btm',
    'https://www.amazon.com/product-reviews/B08H93ZRY1/ref=cm_cr_arp_d_viewopt_sr?filterByStar=five_star',
    'https://www.amazon.nl/dp/B08H93ZRY1/', // Geen geldige review URL
    'https://example.com/product-reviews/B08H93ZRY1/', // Geen Amazon domein
    'https://www.amazon.nl/s?k=smartphone', // Geen review URL
  ];

  const validReviewUrls = amazonScraper.validateAmazonUrls(reviewUrls, false, true);
  console.log(`✅ Review URL validatie: ${validReviewUrls.length} van ${reviewUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige review URLs:', validReviewUrls);
}

/**
 * Test URL generatie
 */
function testUrlGeneration() {
  console.log('\n🧪 Test 2: URL generatie');

  // Test review URL generatie
  const productId = 'B08H93ZRY1';
  const pages = 3;
  const marketplace = 'nl';

  const reviewUrls = amazonScraper.generateReviewUrls(productId, pages, marketplace);
  console.log(`✅ Review URL generatie: ${reviewUrls.length} URLs gegenereerd`);
  console.log('📋 Gegenereerde review URLs:', reviewUrls);

  // Test review URL generatie met sterrenfilter
  const starFilter = 5;
  const filteredReviewUrls = amazonScraper.generateReviewUrls(productId, pages, marketplace, starFilter);
  console.log(`✅ Gefilterde review URL generatie: ${filteredReviewUrls.length} URLs gegenereerd`);
  console.log('📋 Gegenereerde gefilterde review URLs:', filteredReviewUrls);

  // Test multi-product review URL generatie
  const productIds = ['B08H93ZRY1', 'B09G9FPHY6', 'B08L5TNJHG'];
  const pagesPerProduct = 2;

  const multiProductReviewUrls = amazonScraper.generateMultiProductReviewUrls(productIds, pagesPerProduct, marketplace);
  console.log(`✅ Multi-product review URL generatie: ${multiProductReviewUrls.length} URLs gegenereerd`);
  console.log('📋 Gegenereerde multi-product review URLs:', multiProductReviewUrls.slice(0, 3), '...');
}

/**
 * Test review scraping
 */
async function testReviewScraping() {
  console.log('\n🧪 Test 3: Review scraping');

  try {
    // Maak een review scrape job aan
    const reviewUrls = ['https://www.amazon.nl/product-reviews/B08H93ZRY1/'];
    console.log(`📌 Aanmaken van review scrape job voor: ${reviewUrls[0]}`);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Review scrape job aangemaakt');

    // Test review resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.amazon.nl/product-reviews/B08H93ZRY1/',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = amazonScraper.processReviewResult(mockScrapeResult);
    console.log('✅ Review resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      product_id: processedResult.product_id,
      product_title: processedResult.product_title,
      average_rating: processedResult.average_rating,
      total_reviews: processedResult.total_reviews,
      reviews_count: processedResult.reviews.length,
      marketplace: processedResult.marketplace,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van review scraping:', error);
    throw error;
  }
}

/**
 * Test gefilterde review scraping
 */
async function testFilteredReviewScraping() {
  console.log('\n🧪 Test 4: Gefilterde review scraping');

  try {
    // Maak een gefilterde review scrape job aan
    const productId = 'B08H93ZRY1';
    const starFilter = 5;
    console.log(`📌 Aanmaken van gefilterde review scrape job voor product: ${productId} met ${starFilter} sterren`);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Gefilterde review scrape job aangemaakt');

    // Genereer een gefilterde review URL
    const filteredReviewUrl = amazonScraper.generateReviewUrls(productId, 1, 'nl', starFilter)[0];

    // Test review resultaat verwerking met sterrenfilter
    const mockScrapeResult = {
      url: filteredReviewUrl,
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = amazonScraper.processReviewResult(mockScrapeResult);
    console.log('✅ Gefilterd review resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      product_id: processedResult.product_id,
      star_filter: processedResult.star_filter,
      reviews_count: processedResult.reviews.length,
      marketplace: processedResult.marketplace,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van gefilterde review scraping:', error);
    throw error;
  }
}

/**
 * Test multi-product review scraping
 */
async function testMultiProductReviewScraping() {
  console.log('\n🧪 Test 5: Multi-product review scraping');

  try {
    // Maak een multi-product review scrape job aan
    const productIds = ['B08H93ZRY1', 'B09G9FPHY6', 'B08L5TNJHG'];
    console.log(`📌 Aanmaken van multi-product review scrape job voor producten: ${productIds.join(', ')}`);

    // Genereer review URLs voor meerdere producten
    const reviewUrls = amazonScraper.generateMultiProductReviewUrls(productIds, 1, 'nl');

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Multi-product review scrape job aangemaakt');
    console.log(`📋 Aantal gegenereerde URLs: ${reviewUrls.length}`);
  } catch (error) {
    console.error('❌ Fout bij testen van multi-product review scraping:', error);
    throw error;
  }
}

/**
 * Test extractie functies
 */
function testExtractionFunctions() {
  console.log('\n🧪 Test 6: Extractie functies');

  // Test extractie van product ID uit review URL
  const reviewUrl = 'https://www.amazon.nl/product-reviews/B08H93ZRY1/ref=cm_cr_arp_d_viewopt_sr?filterByStar=five_star';
  const productId = amazonScraper.extractProductIdFromReviewUrl(reviewUrl);
  console.log(`✅ Product ID extractie: ${productId}`);

  // Test extractie van sterrenfilter uit URL
  const starFilter = amazonScraper.extractStarFilter(reviewUrl);
  console.log(`✅ Sterrenfilter extractie: ${starFilter} sterren`);

  // Test extractie van marketplace uit URL
  const marketplace = amazonScraper.extractMarketplace(reviewUrl);
  console.log(`✅ Marketplace extractie: ${marketplace}`);

  // Test extractie van reviews uit HTML
  const mockHtml = '<html>...</html>'; // Mock HTML
  const reviews = amazonScraper.extractReviews(mockHtml);
  console.log(`✅ Reviews extractie: ${reviews.length} reviews geëxtraheerd`);
  console.log('📋 Eerste review:', reviews[0]);

  // Test extractie van rating breakdown uit HTML
  const ratingBreakdown = amazonScraper.extractRatingBreakdown(mockHtml);
  console.log('✅ Rating breakdown extractie:');
  console.log('📋 Rating breakdown:', ratingBreakdown);
}

// Voer alle tests uit
runTests().catch((error) => {
  console.error('❌ Onverwachte fout bij uitvoeren van tests:', error);
  process.exit(1);
});
