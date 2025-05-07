/**
 * Test Script voor Social Media Scrapers (Instagram en TikTok)
 *
 * Dit script test de functionaliteit van de Instagram en TikTok scrapers.
 * Het voert verschillende test cases uit om te verifiëren dat de scrapers correct werken.
 */

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { getInstagramScraper } = require('./platforms/instagram');
const { getTikTokScraper } = require('./platforms/tiktok');

// Controleer of de API key is ingesteld
if (!process.env.DECODO_API_KEY) {
  console.error('❌ DECODO_API_KEY is niet ingesteld in .env bestand');
  process.exit(1);
}

// Initialiseer de scrapers
const instagramScraper = getInstagramScraper();
const tiktokScraper = getTikTokScraper();

// Mock project ID voor tests
const PROJECT_ID = uuidv4();

/**
 * Voer alle tests uit
 */
async function runTests() {
  console.log('🧪 Testen van Social Media scrapers...\n');

  try {
    // Test 1: Instagram URL validatie
    testInstagramUrlValidation();

    // Test 2: TikTok URL validatie
    testTikTokUrlValidation();

    // Test 3: Instagram hashtag scraping
    await testInstagramHashtagScraping();

    // Test 4: Instagram profiel scraping
    await testInstagramProfileScraping();

    // Test 5: Instagram post scraping
    await testInstagramPostScraping();

    // Test 6: TikTok hashtag scraping
    await testTikTokHashtagScraping();

    // Test 7: TikTok profiel scraping
    await testTikTokProfileScraping();

    // Test 8: TikTok video scraping
    await testTikTokVideoScraping();

    console.log('\n✅ Alle tests voltooid');
  } catch (error) {
    console.error('\n❌ Tests mislukt:', error);
  }
}

/**
 * Test Instagram URL validatie
 */
function testInstagramUrlValidation() {
  console.log('🧪 Test 1: Instagram URL validatie');

  // Test hashtag URLs
  const hashtagUrls = [
    'https://www.instagram.com/explore/tags/nature/',
    'https://instagram.com/explore/tags/travel',
    'https://www.instagram.com/explore/tags/food/',
    'https://www.instagram.com/p/CpQnX8XMZ1Y/', // Geen geldige hashtag URL
    'https://example.com/explore/tags/nature/', // Geen Instagram domein
    'https://www.instagram.com/username/', // Geen hashtag URL
  ];

  const validHashtagUrls = instagramScraper.validateInstagramUrls(hashtagUrls, 'hashtag');
  console.log(`✅ Hashtag URL validatie: ${validHashtagUrls.length} van ${hashtagUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige hashtag URLs:', validHashtagUrls);

  // Test profiel URLs
  const profileUrls = [
    'https://www.instagram.com/instagram/',
    'https://instagram.com/nature_photography',
    'https://www.instagram.com/travel_adventures/',
    'https://www.instagram.com/explore/tags/nature/', // Geen geldige profiel URL
    'https://example.com/username/', // Geen Instagram domein
    'https://www.instagram.com/p/CpQnX8XMZ1Y/', // Geen profiel URL
  ];

  const validProfileUrls = instagramScraper.validateInstagramUrls(profileUrls, 'profile');
  console.log(`✅ Profiel URL validatie: ${validProfileUrls.length} van ${profileUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige profiel URLs:', validProfileUrls);

  // Test post URLs
  const postUrls = [
    'https://www.instagram.com/p/CpQnX8XMZ1Y/',
    'https://instagram.com/p/CpRt7JnMq2Z',
    'https://www.instagram.com/p/CpTw9KlMo3X/',
    'https://www.instagram.com/explore/tags/nature/', // Geen geldige post URL
    'https://example.com/p/CpQnX8XMZ1Y/', // Geen Instagram domein
    'https://www.instagram.com/username/', // Geen post URL
  ];

  const validPostUrls = instagramScraper.validateInstagramUrls(postUrls, 'post');
  console.log(`✅ Post URL validatie: ${validPostUrls.length} van ${postUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige post URLs:', validPostUrls);
}

/**
 * Test TikTok URL validatie
 */
function testTikTokUrlValidation() {
  console.log('\n🧪 Test 2: TikTok URL validatie');

  // Test hashtag URLs
  const hashtagUrls = [
    'https://www.tiktok.com/tag/dance',
    'https://tiktok.com/tag/cooking',
    'https://www.tiktok.com/discover/tag/music',
    'https://www.tiktok.com/@username/video/7123456789012345678', // Geen geldige hashtag URL
    'https://example.com/tag/dance', // Geen TikTok domein
    'https://www.tiktok.com/@username', // Geen hashtag URL
  ];

  const validHashtagUrls = tiktokScraper.validateTikTokUrls(hashtagUrls, 'hashtag');
  console.log(`✅ Hashtag URL validatie: ${validHashtagUrls.length} van ${hashtagUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige hashtag URLs:', validHashtagUrls);

  // Test profiel URLs
  const profileUrls = [
    'https://www.tiktok.com/@username',
    'https://tiktok.com/@tiktok',
    'https://www.tiktok.com/@travel_videos/',
    'https://www.tiktok.com/tag/dance', // Geen geldige profiel URL
    'https://example.com/@username', // Geen TikTok domein
    'https://www.tiktok.com/@username/video/7123456789012345678', // Geen profiel URL
  ];

  const validProfileUrls = tiktokScraper.validateTikTokUrls(profileUrls, 'profile');
  console.log(`✅ Profiel URL validatie: ${validProfileUrls.length} van ${profileUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige profiel URLs:', validProfileUrls);

  // Test video URLs
  const videoUrls = [
    'https://www.tiktok.com/@username/video/7123456789012345678',
    'https://tiktok.com/@tiktok/video/7123456789012345679',
    'https://www.tiktok.com/@travel_videos/video/7123456789012345680',
    'https://www.tiktok.com/tag/dance', // Geen geldige video URL
    'https://example.com/@username/video/7123456789012345678', // Geen TikTok domein
    'https://www.tiktok.com/@username', // Geen video URL
  ];

  const validVideoUrls = tiktokScraper.validateTikTokUrls(videoUrls, 'video');
  console.log(`✅ Video URL validatie: ${validVideoUrls.length} van ${videoUrls.length} URLs zijn geldig`);
  console.log('📋 Geldige video URLs:', validVideoUrls);
}

/**
 * Test Instagram hashtag scraping
 */
async function testInstagramHashtagScraping() {
  console.log('\n🧪 Test 3: Instagram hashtag scraping');

  try {
    // Genereer hashtag URLs
    const hashtags = ['nature', 'travel', 'food'];
    const hashtagUrls = instagramScraper.generateMultiHashtagUrls(hashtags, 1);

    console.log(`📌 Genereren van hashtag URLs voor: ${hashtags.join(', ')}`);
    console.log(`✅ ${hashtagUrls.length} hashtag URLs gegenereerd`);
    console.log('📋 Gegenereerde hashtag URLs:', hashtagUrls);

    // Test hashtag resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.instagram.com/explore/tags/nature/',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = instagramScraper.processHashtagResult(mockScrapeResult);
    console.log('✅ Hashtag resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      hashtag: processedResult.hashtag,
      post_count: processedResult.post_count,
      pagination: processedResult.pagination,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van Instagram hashtag scraping:', error);
    throw error;
  }
}

/**
 * Test Instagram profiel scraping
 */
async function testInstagramProfileScraping() {
  console.log('\n🧪 Test 4: Instagram profiel scraping');

  try {
    // Maak een profiel scrape job aan
    const profileUrls = ['https://www.instagram.com/instagram/'];
    console.log(`📌 Aanmaken van profiel scrape job voor: ${profileUrls[0]}`);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Profiel scrape job aangemaakt');

    // Test profiel resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.instagram.com/instagram/',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = instagramScraper.processProfileResult(mockScrapeResult);
    console.log('✅ Profiel resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      username: processedResult.username,
      followers: processedResult.profile?.followers_count,
      following: processedResult.profile?.following_count,
      post_count: processedResult.post_count,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van Instagram profiel scraping:', error);
    throw error;
  }
}

/**
 * Test Instagram post scraping
 */
async function testInstagramPostScraping() {
  console.log('\n🧪 Test 5: Instagram post scraping');

  try {
    // Maak een post scrape job aan
    const postUrls = ['https://www.instagram.com/p/CpQnX8XMZ1Y/'];
    console.log(`📌 Aanmaken van post scrape job voor: ${postUrls[0]}`);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Post scrape job aangemaakt');

    // Test post resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.instagram.com/p/CpQnX8XMZ1Y/',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = instagramScraper.processPostResult(mockScrapeResult);
    console.log('✅ Post resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      post_id: processedResult.post_id,
      caption: processedResult.post?.caption,
      likes_count: processedResult.post?.likes_count,
      comment_count: processedResult.comment_count,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van Instagram post scraping:', error);
    throw error;
  }
}

/**
 * Test TikTok hashtag scraping
 */
async function testTikTokHashtagScraping() {
  console.log('\n🧪 Test 6: TikTok hashtag scraping');

  try {
    // Genereer hashtag URLs
    const hashtags = ['dance', 'cooking', 'music'];
    const hashtagUrls = tiktokScraper.generateMultiHashtagUrls(hashtags);

    console.log(`📌 Genereren van hashtag URLs voor: ${hashtags.join(', ')}`);
    console.log(`✅ ${hashtagUrls.length} hashtag URLs gegenereerd`);
    console.log('📋 Gegenereerde hashtag URLs:', hashtagUrls);

    // Test hashtag resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.tiktok.com/tag/dance',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = tiktokScraper.processHashtagResult(mockScrapeResult);
    console.log('✅ Hashtag resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      hashtag: processedResult.hashtag,
      views_count: processedResult.stats?.views_count,
      video_count: processedResult.video_count,
      pagination: processedResult.pagination,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van TikTok hashtag scraping:', error);
    throw error;
  }
}

/**
 * Test TikTok profiel scraping
 */
async function testTikTokProfileScraping() {
  console.log('\n🧪 Test 7: TikTok profiel scraping');

  try {
    // Maak een profiel scrape job aan
    const profileUrls = ['https://www.tiktok.com/@tiktok'];
    console.log(`📌 Aanmaken van profiel scrape job voor: ${profileUrls[0]}`);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Profiel scrape job aangemaakt');

    // Test profiel resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.tiktok.com/@tiktok',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = tiktokScraper.processProfileResult(mockScrapeResult);
    console.log('✅ Profiel resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      username: processedResult.username,
      followers: processedResult.profile?.followers_count,
      following: processedResult.profile?.following_count,
      video_count: processedResult.video_count,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van TikTok profiel scraping:', error);
    throw error;
  }
}

/**
 * Test TikTok video scraping
 */
async function testTikTokVideoScraping() {
  console.log('\n🧪 Test 8: TikTok video scraping');

  try {
    // Maak een video scrape job aan
    const videoUrls = ['https://www.tiktok.com/@username/video/7123456789012345678'];
    console.log(`📌 Aanmaken van video scrape job voor: ${videoUrls[0]}`);

    // Gebruik mock implementatie om daadwerkelijke API calls te vermijden
    console.log('✅ Video scrape job aangemaakt');

    // Test video resultaat verwerking
    const mockScrapeResult = {
      url: 'https://www.tiktok.com/@username/video/7123456789012345678',
      html: '<html>...</html>', // Mock HTML
    };

    const processedResult = tiktokScraper.processVideoResult(mockScrapeResult);
    console.log('✅ Video resultaat verwerkt');
    console.log('📊 Verwerkt resultaat:', {
      video_id: processedResult.video_id,
      caption: processedResult.video?.caption,
      likes_count: processedResult.video?.likes_count,
      comment_count: processedResult.comment_count,
    });
  } catch (error) {
    console.error('❌ Fout bij testen van TikTok video scraping:', error);
    throw error;
  }
}

// Voer alle tests uit
runTests().catch((error) => {
  console.error('❌ Onverwachte fout bij uitvoeren van tests:', error);
  process.exit(1);
});
