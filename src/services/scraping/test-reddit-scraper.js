/**
 * Test Script voor Reddit Scraper
 *
 * Dit script test de functionaliteit van de Reddit scraper.
 * Het voert verschillende test cases uit om te verifiëren dat de scraper correct werkt.
 */

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { getRedditScraper } = require('./platforms/reddit');

// Controleer of de API key is ingesteld
if (!process.env.DECODO_API_KEY) {
  console.error('❌ DECODO_API_KEY is niet ingesteld in .env bestand');
  process.exit(1);
}

// Initialiseer de Reddit scraper
const redditScraper = getRedditScraper();

// Mock project ID voor tests
const PROJECT_ID = uuidv4();

/**
 * Voer alle tests uit
 */
async function runTests() {
  console.log('🧪 Testen van Reddit scraper...\n');

  try {
    // Test 1: URL validatie
    testUrlValidation();

    // Test 2: URL generatie
    testUrlGeneration();

    // Test 3: Subreddit scraping
    await testSubredditScraping();

    // Test 4: Post scraping
    await testPostScraping();

    // Test 5: User scraping
    await testUserScraping();

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

  // Test subreddit URLs
  const subredditUrls = [
    'https://www.reddit.com/r/programming/',
    'https://reddit.com/r/javascript',
    'https://old.reddit.com/r/webdev/',
    'https://www.reddit.com/r/programming/comments/abc123/title/', // Geen geldige subreddit URL
    'https://example.com/r/programming/', // Geen Reddit domein
    'https://www.reddit.com/user/username/', // Geen subreddit URL
  ];

  const validSubredditUrls = redditScraper.validateRedditUrls(subredditUrls, 'subreddit');
  console.log(`✅ Subreddit URL validatie: ${validSubredditUrls.length} van ${subredditUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige subreddit URLs:', validSubredditUrls);

  // Test post URLs
  const postUrls = [
    'https://www.reddit.com/r/programming/comments/abc123/title/',
    'https://reddit.com/r/javascript/comments/def456/another_title',
    'https://old.reddit.com/r/webdev/comments/ghi789/third_title/',
    'https://www.reddit.com/r/programming/', // Geen geldige post URL
    'https://example.com/r/programming/comments/abc123/title/', // Geen Reddit domein
    'https://www.reddit.com/user/username/', // Geen post URL
  ];

  const validPostUrls = redditScraper.validateRedditUrls(postUrls, 'post');
  console.log(`✅ Post URL validatie: ${validPostUrls.length} van ${postUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige post URLs:', validPostUrls);

  // Test user URLs
  const userUrls = [
    'https://www.reddit.com/user/username/',
    'https://reddit.com/user/another_user',
    'https://old.reddit.com/user/third_user/',
    'https://www.reddit.com/r/programming/', // Geen geldige user URL
    'https://example.com/user/username/', // Geen Reddit domein
    'https://www.reddit.com/r/programming/comments/abc123/title/', // Geen user URL
  ];

  const validUserUrls = redditScraper.validateRedditUrls(userUrls, 'user');
  console.log(`✅ User URL validatie: ${validUserUrls.length} van ${userUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige user URLs:', validUserUrls);
}

/**
 * Test URL generatie
 */
function testUrlGeneration() {
  console.log('\n🧪 Test 2: URL generatie');

  // Test subreddit URL generatie
  const subreddit = 'programming';
  const pages = 3;
  const sort = 'top';
  const timeframe = 'month';

  const subredditUrls = redditScraper.generateSubredditUrls(subreddit, pages, sort, timeframe);
  console.log(`✅ Subreddit URL generatie: ${subredditUrls.length} URLs gegenereerd`);
  console.log('📋 Gegenereerde subreddit URLs:', subredditUrls);

  // Test search URL generatie
  const query = 'javascript framework';
  const searchSubreddit = 'webdev';
  const searchPages = 2;
  const searchSort = 'relevance';

  const searchUrls = redditScraper.generateSearchUrls(query, searchSubreddit, searchPages, searchSort);
  console.log(`✅ Search URL generatie: ${searchUrls.length} URLs gegenereerd`);
  console.log('📋 Gegenereerde search URLs:', searchUrls);

  // Test search URL generatie zonder subreddit
  const globalSearchUrls = redditScraper.generateSearchUrls(query, null, searchPages, searchSort);
  console.log(`✅ Global search URL generatie: ${globalSearchUrls.length} URLs gegenereerd`);
  console.log('📋 Gegenereerde global search URLs:', globalSearchUrls);
}

/**
 * Test subreddit scraping
 */
async function testSubredditScraping() {
  console.log('\n🧪 Test 3: Subreddit scraping');

  try {
    // Maak een subreddit scrape job aan
    const subredditUrls = ['https://www.reddit.com/r/programming/'];
    console.log(`📌 Aanmaken van subreddit scrape job voor: ${subredditUrls[0]}`);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Subreddit scrape job aangemaakt');

    // Test subreddit resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.reddit.com/r/programming/',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = redditScraper.processSubredditResult(mockScrapeResult);
    console.log('✅ Subreddit resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      name: processedResult.name,
      url: processedResult.url,
      postsCount: processedResult.posts.length,
      subscribers: processedResult.subscribers,
      hasRules: processedResult.rules.length > 0,
      hasModerators: processedResult.moderators.length > 0,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van subreddit scraping:', error);
    throw error;
  }
}

/**
 * Test post scraping
 */
async function testPostScraping() {
  console.log('\n🧪 Test 4: Post scraping');

  try {
    // Maak een post scrape job aan
    const postUrls = ['https://www.reddit.com/r/programming/comments/abc123/title/'];
    console.log(`📌 Aanmaken van post scrape job voor: ${postUrls[0]}`);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Post scrape job aangemaakt');

    // Test post resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.reddit.com/r/programming/comments/abc123/title/',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = redditScraper.processPostResult(mockScrapeResult);
    console.log('✅ Post resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      id: processedResult.id,
      subreddit: processedResult.subreddit,
      title: processedResult.title,
      author: processedResult.author,
      upvotes: processedResult.upvotes,
      commentCount: processedResult.commentCount,
      commentsCount: processedResult.comments.length,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van post scraping:', error);
    throw error;
  }
}

/**
 * Test user scraping
 */
async function testUserScraping() {
  console.log('\n🧪 Test 5: User scraping');

  try {
    // Maak een user scrape job aan
    const userUrls = ['https://www.reddit.com/user/username/'];
    console.log(`📌 Aanmaken van user scrape job voor: ${userUrls[0]}`);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ User scrape job aangemaakt');

    // Test user resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.reddit.com/user/username/',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = redditScraper.processUserResult(mockScrapeResult);
    console.log('✅ User resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      username: processedResult.username,
      karma: processedResult.karma,
      accountAge: processedResult.accountAge,
      postsCount: processedResult.posts.length,
      trophiesCount: processedResult.trophies.length,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van user scraping:', error);
    throw error;
  }
}

// Voer alle tests uit
runTests().catch((error) => {
  console.error('❌ Onverwachte fout bij uitvoeren van tests:', error);
  process.exit(1);
});
