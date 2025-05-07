import { scrapingApiService } from '../src/services/scrapingApiService.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Laad omgevingsvariabelen
dotenv.config();

/**
 * Test functie voor het scrapen van TikTok video's via de Scraping API
 * @param {string} keyword - Zoekwoord voor video's
 */
async function testTikTokScraping(keyword) {
  console.log(`\n=== SCRAPING API TIKTOK TEST: "${keyword}" ===`);
  try {
    const result = await scrapingApiService.scrapeTikTokVideos(keyword);
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('tiktok', keyword, result);
    
    console.log(`Scraping API: TikTok resultaten opgeslagen in bestand`);
    console.log(`API statistieken:`, scrapingApiService.getStats());
  } catch (error) {
    console.error('Fout bij TikTok API scraping test:', error.message);
  }
}

/**
 * Test functie voor het scrapen van Instagram posts via de Scraping API
 * @param {string} hashtag - Hashtag voor posts
 */
async function testInstagramScraping(hashtag) {
  console.log(`\n=== SCRAPING API INSTAGRAM TEST: "#${hashtag}" ===`);
  try {
    const result = await scrapingApiService.scrapeInstagramPosts(hashtag);
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('instagram', hashtag, result);
    
    console.log(`Scraping API: Instagram resultaten opgeslagen in bestand`);
    console.log(`API statistieken:`, scrapingApiService.getStats());
  } catch (error) {
    console.error('Fout bij Instagram API scraping test:', error.message);
  }
}

/**
 * Test functie voor het scrapen van Trustpilot reviews via de Scraping API
 * @param {string} companyName - Naam van het bedrijf
 */
async function testTrustpilotScraping(companyName) {
  console.log(`\n=== SCRAPING API TRUSTPILOT TEST: "${companyName}" ===`);
  try {
    const result = await scrapingApiService.scrapeTrustpilotReviews(companyName);
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('trustpilot', companyName, result);
    
    console.log(`Scraping API: Trustpilot resultaten opgeslagen in bestand`);
    console.log(`API statistieken:`, scrapingApiService.getStats());
  } catch (error) {
    console.error('Fout bij Trustpilot API scraping test:', error.message);
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
  const filename = `${platform}_${sanitizedQuery}_${timestamp}.json`;
  const filePath = path.join(resultsDir, filename);
  
  // Schrijf data naar bestand
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log(`Resultaten opgeslagen in: ${filePath}`);
}

/**
 * Hoofdfunctie voor het uitvoeren van de tests
 */
async function runTests() {
  // Controleer of API key is geconfigureerd
  if (!process.env.SCRAPING_API_KEY) {
    console.error('FOUT: SCRAPING_API_KEY is niet geconfigureerd in .env bestand');
    console.log('Voeg de API key toe aan het .env bestand en probeer opnieuw.');
    process.exit(1);
  }
  
  // Haal de zoekwoorden op uit de command line argumenten of gebruik standaardwaarden
  const tiktokKeyword = process.argv[2] || 'marketingtrends';
  const instagramHashtag = process.argv[3] || 'marketing';
  const companyName = process.argv[4] || 'coolblue';
  
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
