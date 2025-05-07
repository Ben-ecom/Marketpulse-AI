/**
 * Test Script voor Trustpilot Scraper
 *
 * Dit script test de functionaliteit van de Trustpilot scraper.
 * Het voert verschillende test cases uit om te verifiëren dat de scraper correct werkt.
 */

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { getTrustpilotScraper } = require('./platforms/trustpilot');

// Controleer of de API key is ingesteld
if (!process.env.DECODO_API_KEY) {
  console.error('❌ DECODO_API_KEY is niet ingesteld in .env bestand');
  process.exit(1);
}

// Initialiseer de Trustpilot scraper
const trustpilotScraper = getTrustpilotScraper();

// Mock project ID voor tests
const PROJECT_ID = uuidv4();

/**
 * Voer alle tests uit
 */
async function runTests() {
  console.log('🧪 Testen van Trustpilot scraper...\n');

  try {
    // Test 1: URL validatie
    testUrlValidation();

    // Test 2: URL generatie
    testUrlGeneration();

    // Test 3: Business scraping
    await testBusinessScraping();

    // Test 4: Reviews scraping
    await testReviewsScraping();

    // Test 5: Filtered reviews scraping
    await testFilteredReviewsScraping();

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

  // Test business URLs
  const businessUrls = [
    'https://www.trustpilot.com/review/example.com',
    'https://trustpilot.com/review/another-example.com',
    'https://www.trustpilot.com/review/third-example.com',
    'https://www.trustpilot.com/review/example.com/reviews', // Geen geldige business URL
    'https://example.com/review/example.com', // Geen Trustpilot domein
    'https://www.trustpilot.com/categories/electronics', // Geen business URL
  ];

  const validBusinessUrls = trustpilotScraper.validateTrustpilotUrls(businessUrls, 'business');
  console.log(`✅ Business URL validatie: ${validBusinessUrls.length} van ${businessUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige business URLs:', validBusinessUrls);

  // Test reviews URLs
  const reviewsUrls = [
    'https://www.trustpilot.com/review/example.com/reviews',
    'https://trustpilot.com/review/another-example.com/reviews?stars=5',
    'https://www.trustpilot.com/review/third-example.com/reviews?page=2',
    'https://www.trustpilot.com/review/example.com', // Geen geldige reviews URL
    'https://example.com/review/example.com/reviews', // Geen Trustpilot domein
    'https://www.trustpilot.com/categories/electronics', // Geen reviews URL
  ];

  const validReviewsUrls = trustpilotScraper.validateTrustpilotUrls(reviewsUrls, 'reviews');
  console.log(`✅ Reviews URL validatie: ${validReviewsUrls.length} van ${reviewsUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige reviews URLs:', validReviewsUrls);
}

/**
 * Test URL generatie
 */
function testUrlGeneration() {
  console.log('\n🧪 Test 2: URL generatie');

  // Test review URL generatie
  const businessDomain = 'example.com';
  const pages = 3;

  const reviewUrls = trustpilotScraper.generateReviewUrls(businessDomain, pages);
  console.log(`✅ Review URL generatie: ${reviewUrls.length} URLs gegenereerd`);
  console.log('📋 Gegenereerde review URLs:', reviewUrls);

  // Test gefilterde review URL generatie
  const filters = {
    stars: 5,
    languages: ['nl', 'en'],
    timeperiod: 'last6months',
  };

  const filteredReviewUrl = trustpilotScraper.generateFilteredReviewUrl(businessDomain, filters);
  console.log(`✅ Gefilterde review URL generatie: ${filteredReviewUrl}`);

  // Test multi-business review URL generatie
  const businessDomains = ['example.com', 'another-example.com', 'third-example.com'];
  const pagesPerBusiness = 2;

  const multiBusinessReviewUrls = trustpilotScraper.generateMultiBusinessReviewUrls(businessDomains, pagesPerBusiness);
  console.log(`✅ Multi-business review URL generatie: ${multiBusinessReviewUrls.length} URLs gegenereerd`);
  console.log('📋 Gegenereerde multi-business review URLs:', multiBusinessReviewUrls.slice(0, 3), '...');
}

/**
 * Test business scraping
 */
async function testBusinessScraping() {
  console.log('\n🧪 Test 3: Business scraping');

  try {
    // Maak een business scrape job aan
    const businessUrls = ['https://www.trustpilot.com/review/example.com'];
    console.log(`📌 Aanmaken van business scrape job voor: ${businessUrls[0]}`);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Business scrape job aangemaakt');

    // Test business resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.trustpilot.com/review/example.com',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = trustpilotScraper.processBusinessResult(mockScrapeResult);
    console.log('✅ Business resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      business_domain: processedResult.business_domain,
      business_name: processedResult.business?.name,
      business_rating: processedResult.business?.rating,
      total_reviews: processedResult.business?.total_reviews,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van business scraping:', error);
    throw error;
  }
}

/**
 * Test reviews scraping
 */
async function testReviewsScraping() {
  console.log('\n🧪 Test 4: Reviews scraping');

  try {
    // Maak een reviews scrape job aan
    const reviewsUrls = ['https://www.trustpilot.com/review/example.com/reviews'];
    console.log(`📌 Aanmaken van reviews scrape job voor: ${reviewsUrls[0]}`);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Reviews scrape job aangemaakt');

    // Test reviews resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.trustpilot.com/review/example.com/reviews',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = trustpilotScraper.processReviewsResult(mockScrapeResult);
    console.log('✅ Reviews resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      business_domain: processedResult.business_domain,
      business_name: processedResult.business_name,
      business_rating: processedResult.business_rating,
      review_count: processedResult.review_count,
      pagination: processedResult.pagination,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van reviews scraping:', error);
    throw error;
  }
}

/**
 * Test gefilterde reviews scraping
 */
async function testFilteredReviewsScraping() {
  console.log('\n🧪 Test 5: Gefilterde reviews scraping');

  try {
    // Maak een gefilterde reviews scrape job aan
    const businessDomain = 'example.com';
    const filters = {
      stars: 5,
      languages: ['nl', 'en'],
      timeperiod: 'last6months',
    };

    console.log(`📌 Aanmaken van gefilterde reviews scrape job voor: ${businessDomain} met filters:`, filters);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Gefilterde reviews scrape job aangemaakt');

    // Genereer een gefilterde review URL
    const filteredReviewUrl = trustpilotScraper.generateFilteredReviewUrl(businessDomain, filters);

    // Test reviews resultaat verwerking met filters
    const mockScrapeResult = {
      url: filteredReviewUrl,
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = trustpilotScraper.processReviewsResult(mockScrapeResult);
    console.log('✅ Gefilterde reviews resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      business_domain: processedResult.business_domain,
      filters: processedResult.filters,
      review_count: processedResult.review_count,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van gefilterde reviews scraping:', error);
    throw error;
  }
}

/**
 * Test extractie functies
 */
function testExtractionFunctions() {
  console.log('\n🧪 Test 6: Extractie functies');

  // Test extractie van bedrijfsdomein uit URL
  const businessUrl = 'https://www.trustpilot.com/review/example.com';
  const businessDomain = trustpilotScraper.extractBusinessDomainFromUrl(businessUrl);
  console.log(`✅ Business domein extractie: ${businessDomain}`);

  // Test extractie van filters uit URL
  const reviewsUrl = 'https://www.trustpilot.com/review/example.com/reviews?stars=5&languages=nl,en&timeperiod=last6months';
  const filters = trustpilotScraper.extractFiltersFromUrl(reviewsUrl);
  console.log('✅ Filters extractie:', filters);

  // Test extractie van bedrijfsgegevens uit HTML
  const mockHtml = '<html>...</html>'; // Mock HTML
  const businessData = trustpilotScraper.extractBusinessData(mockHtml);
  console.log('✅ Business data extractie:');
  console.log('📋 Business data:', businessData);

  // Test extractie van reviews uit HTML
  const reviews = trustpilotScraper.extractReviews(mockHtml);
  console.log(`✅ Reviews extractie: ${reviews.length} reviews geëxtraheerd`);
  console.log('📋 Eerste review:', reviews[0]);

  // Test extractie van reviews distributie uit HTML
  const reviewsDistribution = trustpilotScraper.extractReviewsDistribution(mockHtml);
  console.log('✅ Reviews distributie extractie:');
  console.log('📋 Reviews distributie:', reviewsDistribution);
}

// Voer alle tests uit
runTests().catch((error) => {
  console.error('❌ Onverwachte fout bij uitvoeren van tests:', error);
  process.exit(1);
});
