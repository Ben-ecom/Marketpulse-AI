import { puppeteerService } from '../src/services/puppeteerService.js';
import dotenv from 'dotenv';

// Laad omgevingsvariabelen
dotenv.config();

/**
 * Test functie voor het scrapen van TikTok video's
 * @param {string} keyword - Zoekwoord voor video's
 */
async function testTikTokScraping(keyword) {
  console.log(`\n=== TIKTOK SCRAPING TEST: "${keyword}" ===`);
  try {
    const videos = await puppeteerService.scrapeTikTokVideos(keyword);
    console.log(`Aantal gevonden video's: ${videos.length}`);
    
    if (videos.length > 0) {
      console.log('\nVoorbeeld video:');
      console.log(JSON.stringify(videos[0], null, 2));
    }
  } catch (error) {
    console.error('Fout bij TikTok scraping test:', error.message);
  }
}

/**
 * Test functie voor het scrapen van Instagram posts
 * @param {string} hashtag - Hashtag voor posts
 */
async function testInstagramScraping(hashtag) {
  console.log(`\n=== INSTAGRAM SCRAPING TEST: "#${hashtag}" ===`);
  try {
    const posts = await puppeteerService.scrapeInstagramPosts(hashtag);
    console.log(`Aantal gevonden posts: ${posts.length}`);
    
    if (posts.length > 0) {
      console.log('\nVoorbeeld post:');
      console.log(JSON.stringify(posts[0], null, 2));
    }
  } catch (error) {
    console.error('Fout bij Instagram scraping test:', error.message);
  }
}

/**
 * Test functie voor het scrapen van Trustpilot reviews
 * @param {string} companyName - Naam van het bedrijf
 */
async function testTrustpilotScraping(companyName) {
  console.log(`\n=== TRUSTPILOT SCRAPING TEST: "${companyName}" ===`);
  try {
    const result = await puppeteerService.scrapeTrustpilotReviews(companyName);
    console.log(`Bedrijf: ${result.companyName}`);
    console.log(`Rating: ${result.rating}`);
    console.log(`Aantal reviews: ${result.reviewCount}`);
    
    if (result.reviews && result.reviews.length > 0) {
      console.log('\nVoorbeeld review:');
      console.log(JSON.stringify(result.reviews[0], null, 2));
    }
  } catch (error) {
    console.error('Fout bij Trustpilot scraping test:', error.message);
  }
}

/**
 * Hoofdfunctie voor het uitvoeren van de tests
 */
async function runTests() {
  // Haal de zoekwoorden op uit de command line argumenten of gebruik standaardwaarden
  const tiktokKeyword = process.argv[2] || 'marketingtrends';
  const instagramHashtag = process.argv[3] || 'marketing';
  const companyName = process.argv[4] || 'bol.com';
  
  // Voer de tests uit
  await testTikTokScraping(tiktokKeyword);
  await testInstagramScraping(instagramHashtag);
  await testTrustpilotScraping(companyName);
  
  console.log('\n=== ALLE TESTS VOLTOOID ===');
}

// Voer de tests uit
runTests().catch(error => {
  console.error('Onverwachte fout bij uitvoeren tests:', error);
  process.exit(1);
});
