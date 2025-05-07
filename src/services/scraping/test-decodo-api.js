/**
 * Test Script voor Decodo API Wrapper
 *
 * Dit script test de functionaliteit van de Decodo API wrapper.
 * Het voert verschillende test cases uit om te verifiëren dat de wrapper correct werkt.
 */

require('dotenv').config();
const { getDecodoApiClient } = require('./decodo-api');

// Controleer of de API key is ingesteld
if (!process.env.DECODO_API_KEY) {
  console.error('❌ DECODO_API_KEY is niet ingesteld in .env bestand');
  process.exit(1);
}

// Initialiseer de Decodo API client
const decodoClient = getDecodoApiClient();

/**
 * Voer alle tests uit
 */
async function runTests() {
  console.log('🧪 Testen van Decodo API wrapper...\n');

  try {
    // Test 1: Account informatie ophalen
    await testGetAccountInfo();

    // Test 2: Enkele URL scrapen
    await testScrape();

    // Test 3: Batch scrape
    await testBatchScrape();

    // Test 4: Error handling
    await testErrorHandling();

    // Test 5: Rate limiting
    await testRateLimiting();

    console.log('\n✅ Alle tests voltooid');
  } catch (error) {
    console.error('\n❌ Tests mislukt:', error);
  }
}

/**
 * Test het ophalen van account informatie
 */
async function testGetAccountInfo() {
  console.log('🧪 Test 1: Account informatie ophalen');

  try {
    const accountInfo = await decodoClient.getAccountInfo();
    console.log('✅ Account informatie opgehaald:', accountInfo);
  } catch (error) {
    console.error('❌ Fout bij ophalen van account informatie:', error);
    throw error;
  }
}

/**
 * Test het scrapen van een enkele URL
 */
async function testScrape() {
  console.log('\n🧪 Test 2: Enkele URL scrapen');

  try {
    const url = 'https://example.com';
    console.log(`📌 Scraping URL: ${url}`);

    const result = await decodoClient.scrape(url, {
      wait_for: 'body',
      timeout: 10000,
    });

    console.log('✅ URL succesvol gescraped');
    console.log('📊 Resultaat:', {
      url: result.url,
      status: result.status,
      hasHtml: !!result.html,
      htmlLength: result.html ? result.html.length : 0,
    });
  } catch (error) {
    console.error('❌ Fout bij scrapen van URL:', error);
    throw error;
  }
}

/**
 * Test het scrapen van meerdere URLs in batch
 */
async function testBatchScrape() {
  console.log('\n🧪 Test 3: Batch scrape');

  try {
    const urls = [
      { url: 'https://example.com', options: { wait_for: 'body' } },
      { url: 'https://example.org', options: { wait_for: 'body' } },
    ];

    console.log(`📌 Scraping ${urls.length} URLs in batch`);

    const results = await decodoClient.batchScrape(urls);

    console.log('✅ Batch scrape succesvol');
    console.log('📊 Resultaten:', results.map((result) => ({
      url: result.url,
      status: result.status,
      hasHtml: !!result.html,
      htmlLength: result.html ? result.html.length : 0,
    })));
  } catch (error) {
    console.error('❌ Fout bij batch scrape:', error);
    throw error;
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  console.log('\n🧪 Test 4: Error handling');

  try {
    // Test met ongeldige URL
    const invalidUrl = 'invalid-url';
    console.log(`📌 Scraping ongeldige URL: ${invalidUrl}`);

    try {
      await decodoClient.scrape(invalidUrl);
      console.error('❌ Scrape van ongeldige URL zou moeten mislukken, maar is geslaagd');
    } catch (error) {
      console.log('✅ Scrape van ongeldige URL mislukt zoals verwacht:', error.message);
    }

    // Test met niet-bestaande URL
    const nonExistentUrl = 'https://this-domain-does-not-exist-123456789.com';
    console.log(`📌 Scraping niet-bestaande URL: ${nonExistentUrl}`);

    try {
      await decodoClient.scrape(nonExistentUrl);
      console.error('❌ Scrape van niet-bestaande URL zou moeten mislukken, maar is geslaagd');
    } catch (error) {
      console.log('✅ Scrape van niet-bestaande URL mislukt zoals verwacht:', error.message);
    }

    // Test met timeout
    const timeoutUrl = 'https://example.com';
    console.log(`📌 Scraping URL met zeer korte timeout: ${timeoutUrl}`);

    try {
      await decodoClient.scrape(timeoutUrl, { timeout: 1 }); // 1ms timeout
      console.error('❌ Scrape met zeer korte timeout zou moeten mislukken, maar is geslaagd');
    } catch (error) {
      console.log('✅ Scrape met zeer korte timeout mislukt zoals verwacht:', error.message);
    }
  } catch (error) {
    console.error('❌ Fout bij testen van error handling:', error);
    throw error;
  }
}

/**
 * Test rate limiting
 */
async function testRateLimiting() {
  console.log('\n🧪 Test 5: Rate limiting');

  try {
    const url = 'https://example.com';
    const numRequests = 5;
    const concurrentRequests = [];

    console.log(`📌 Versturen van ${numRequests} gelijktijdige requests`);

    // Maak meerdere gelijktijdige requests
    for (let i = 0; i < numRequests; i++) {
      concurrentRequests.push(decodoClient.scrape(url, {
        wait_for: 'body',
        timeout: 10000,
      }));
    }

    // Wacht tot alle requests zijn voltooid
    const results = await Promise.allSettled(concurrentRequests);

    // Tel succesvolle en mislukte requests
    const successful = results.filter((result) => result.status === 'fulfilled').length;
    const failed = results.filter((result) => result.status === 'rejected').length;

    console.log('✅ Rate limiting test voltooid');
    console.log('📊 Resultaten:', {
      successful,
      failed,
      total: numRequests,
    });

    // Toon details van mislukte requests
    if (failed > 0) {
      console.log('❌ Mislukte requests:');
      results
        .filter((result) => result.status === 'rejected')
        .forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.reason.message}`);
        });
    }
  } catch (error) {
    console.error('❌ Fout bij testen van rate limiting:', error);
    throw error;
  }
}

// Voer alle tests uit
runTests().catch((error) => {
  console.error('❌ Onverwachte fout bij uitvoeren van tests:', error);
  process.exit(1);
});
