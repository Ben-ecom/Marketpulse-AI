import { marketResearchService } from '../src/services/marketResearchService.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Laad omgevingsvariabelen
dotenv.config();

/**
 * Test functie voor het verzamelen van marktgrootte en groeivoorspellingen
 * @param {string} marketSegment - Marktsegment om te onderzoeken
 * @param {Array} keywords - Zoekwoorden gerelateerd aan het marktsegment
 */
async function testMarketSizeAndGrowth(marketSegment, keywords = []) {
  console.log(`\n=== MARKET RESEARCH TEST: "${marketSegment}" ===`);
  try {
    console.log(`Verzamelen marktgrootte en groeivoorspellingen voor: ${marketSegment}`);
    console.log(`Keywords: ${keywords.join(', ')}`);
    
    const results = await marketResearchService.collectMarketSizeAndGrowth(marketSegment, keywords);
    
    // Toon resultaten
    console.log('\n=== RESULTATEN ===');
    console.log(`Marktgrootte: ${results.marketSize.current} ${results.marketSize.unit} ${results.marketSize.currency} (${results.marketSize.year})`);
    console.log(`Groeipercentage: ${results.growthRate.cagr}% (${results.growthRate.period})`);
    console.log(`Voorspelling: ${results.forecast.size} ${results.forecast.unit} ${results.forecast.currency} (${results.forecast.year})`);
    
    console.log('\n=== BRONNEN ===');
    results.sources.forEach((source, index) => {
      console.log(`${index + 1}. ${source.name} - ${source.url}`);
      if (source.error) {
        console.log(`   Fout: ${source.error}`);
      } else if (source.data) {
        const data = source.data;
        if (data.marketSize) {
          console.log(`   Marktgrootte: ${data.marketSize} miljard (${data.marketSizeYear || 'onbekend jaar'})`);
        }
        if (data.cagr) {
          console.log(`   CAGR: ${data.cagr}% (${data.growthPeriod || 'onbekende periode'})`);
        }
        if (data.forecast) {
          console.log(`   Voorspelling: ${data.forecast} miljard (${data.forecastYear || 'onbekend jaar'})`);
        }
      }
    });
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile(marketSegment, results);
    
    console.log(`\nResultaten opgeslagen in bestand`);
  } catch (error) {
    console.error('Fout bij marktonderzoek test:', error.message);
  }
}

/**
 * Sla resultaat op in een JSON bestand
 * @param {string} marketSegment - Marktsegment
 * @param {object} data - Data om op te slaan
 */
function saveResultToFile(marketSegment, data) {
  // Maak directory als die niet bestaat
  const resultsDir = path.join(process.cwd(), 'market-research-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Maak bestandsnaam
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const sanitizedSegment = marketSegment.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const filename = `market_research_${sanitizedSegment}_${timestamp}.json`;
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
  
  // Haal de marktsegmenten op uit de command line argumenten of gebruik standaardwaarden
  const marketSegment1 = process.argv[2] || 'e-commerce software';
  const marketSegment2 = process.argv[3] || 'social media analytics';
  const marketSegment3 = process.argv[4] || 'artificial intelligence';
  
  // Voer de tests uit
  await testMarketSizeAndGrowth(marketSegment1, ['online shopping', 'e-commerce platform', 'webshop software']);
  await testMarketSizeAndGrowth(marketSegment2, ['social listening', 'social media monitoring', 'sentiment analysis']);
  await testMarketSizeAndGrowth(marketSegment3, ['machine learning', 'deep learning', 'neural networks']);
  
  console.log('\n=== ALLE TESTS VOLTOOID ===');
}

// Voer de tests uit
runTests().catch(error => {
  console.error('Onverwachte fout bij uitvoeren tests:', error);
  process.exit(1);
});
