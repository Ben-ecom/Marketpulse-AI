import { integratedScrapingService } from '../src/services/integratedScrapingService.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Laad omgevingsvariabelen
dotenv.config();

/**
 * Test functie voor het scrapen van TikTok video's via de geïntegreerde service
 * @param {string} keyword - Zoekwoord voor video's
 */
async function testTikTokScraping(keyword) {
  console.log(`\n=== INTEGRATED SCRAPING TIKTOK TEST: "${keyword}" ===`);
  try {
    const videos = await integratedScrapingService.scrapeTikTokVideos(keyword);
    console.log(`Aantal gevonden video's: ${Array.isArray(videos) ? videos.length : 'onbekend'}`);
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('tiktok', keyword, videos);
    
    console.log(`Resultaten opgeslagen in bestand`);
  } catch (error) {
    console.error('Fout bij TikTok scraping test:', error.message);
  }
}

/**
 * Test functie voor het scrapen van Instagram posts via de geïntegreerde service
 * @param {string} hashtag - Hashtag voor posts
 */
async function testInstagramScraping(hashtag) {
  console.log(`\n=== INTEGRATED SCRAPING INSTAGRAM TEST: "#${hashtag}" ===`);
  try {
    const posts = await integratedScrapingService.scrapeInstagramPosts(hashtag);
    console.log(`Aantal gevonden posts: ${Array.isArray(posts) ? posts.length : 'onbekend'}`);
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('instagram', hashtag, posts);
    
    console.log(`Resultaten opgeslagen in bestand`);
  } catch (error) {
    console.error('Fout bij Instagram scraping test:', error.message);
  }
}

/**
 * Test functie voor het scrapen van Trustpilot reviews via de geïntegreerde service
 * @param {string} companyName - Naam van het bedrijf
 */
async function testTrustpilotScraping(companyName) {
  console.log(`\n=== INTEGRATED SCRAPING TRUSTPILOT TEST: "${companyName}" ===`);
  try {
    const result = await integratedScrapingService.scrapeTrustpilotReviews(companyName);
    console.log(`Bedrijf: ${result.companyName}`);
    console.log(`Rating: ${result.rating}`);
    console.log(`Aantal reviews: ${result.reviewCount}`);
    
    if (result.reviews && result.reviews.length > 0) {
      console.log('\nVoorbeeld review:');
      console.log(JSON.stringify(result.reviews[0], null, 2));
    }
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('trustpilot', companyName, result);
    
    console.log(`Resultaten opgeslagen in bestand`);
  } catch (error) {
    console.error('Fout bij Trustpilot scraping test:', error.message);
  }
}

/**
 * Sla resultaat op in een JSON bestand
 * @param {string} platform - Naam van het platform
 * @param {string} query - Zoekterm of identifier
 * @param {object} data - Data om op te slaan
 */
function saveResultToFile(platform, query, data) {
  // Maak directory als die niet bestaat
  const resultsDir = path.join(process.cwd(), 'scraping-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Maak bestandsnaam
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const sanitizedQuery = query.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const filename = `integrated_${platform}_${sanitizedQuery}_${timestamp}.json`;
  const filePath = path.join(resultsDir, filename);
  
  // Schrijf data naar bestand
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log(`Resultaten opgeslagen in: ${filePath}`);
}

/**
 * Hoofdfunctie voor het uitvoeren van de tests
 */
async function runTests() {
  // Haal de zoekwoorden op uit de command line argumenten of gebruik standaardwaarden
  const tiktokKeyword = process.argv[2] || 'marketingtrends';
  const instagramHashtag = process.argv[3] || 'marketing';
  const companyName = process.argv[4] || 'coolblue';
  
  // Voer de tests uit
  await testTikTokScraping(tiktokKeyword);
  await testInstagramScraping(instagramHashtag);
  await testTrustpilotScraping(companyName);
  
  // Toon statistieken
  console.log('\n=== SCRAPING STATISTIEKEN ===');
  console.log(JSON.stringify(integratedScrapingService.getStats(), null, 2));
  
  console.log('\n=== ALLE TESTS VOLTOOID ===');
}

// Voer de tests uit
runTests().catch(error => {
  console.error('Onverwachte fout bij uitvoeren tests:', error);
  process.exit(1);
});
