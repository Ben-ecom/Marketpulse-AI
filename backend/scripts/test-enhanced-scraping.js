import { scrapingApiService } from '../src/services/scrapingApiService.js';
import { textAnalysisUtils } from '../src/utils/textAnalysisUtils.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Laad omgevingsvariabelen
dotenv.config();

/**
 * Test functie voor verbeterde Reddit scraping met extractie van pijnpunten en verlangens
 * @param {string} query - Zoekwoord of subreddit naam
 * @param {boolean} isSubreddit - Of de query een subreddit naam is
 * @param {string} domain - Domein voor terminologie extractie
 */
async function testEnhancedRedditScraping(query, isSubreddit = false, domain = 'general') {
  console.log(`\n=== ENHANCED REDDIT SCRAPING TEST: "${query}" ===`);
  try {
    console.log(`Scraping Reddit ${isSubreddit ? 'subreddit' : 'zoekresultaten'} voor: ${query}`);
    console.log(`Domein voor terminologie extractie: ${domain}`);
    
    const results = await scrapingApiService.scrapeRedditPosts(query, isSubreddit, { domain });
    
    // Toon inzichten
    if (results.insights) {
      console.log('\n=== PIJNPUNTEN ===');
      console.log(`Totaal aantal pijnpunten: ${results.insights.painPoints.all.length}`);
      console.log('Top categorieën:');
      results.insights.painPoints.topCategories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.category} (${category.count} items)`);
        category.items.forEach(item => console.log(`   - "${item.text}" (score: ${item.score.toFixed(2)})`));
      });
      
      console.log('\n=== VERLANGENS ===');
      console.log(`Totaal aantal verlangens: ${results.insights.desires.all.length}`);
      console.log('Top categorieën:');
      results.insights.desires.topCategories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.category} (${category.count} items)`);
        category.items.forEach(item => console.log(`   - "${item.text}" (score: ${item.score.toFixed(2)})`));
      });
      
      console.log('\n=== TERMINOLOGIE ===');
      console.log(`Totaal aantal termen: ${results.insights.terminology.all.length}`);
      console.log('Top 10 termen:');
      results.insights.terminology.top.slice(0, 10).forEach((term, index) => {
        console.log(`${index + 1}. "${term.term}" (frequentie: ${term.frequency})`);
      });
      
      console.log('\n=== SAMENVATTING ===');
      console.log(`Top pijnpunt categorieën: ${results.insights.summary.topPainPointCategories.join(', ')}`);
      console.log(`Top verlangen categorieën: ${results.insights.summary.topDesireCategories.join(', ')}`);
      console.log(`Top termen: ${results.insights.summary.topTerms.join(', ')}`);
    }
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('reddit', query, results);
    
    console.log(`\nResultaten opgeslagen in bestand`);
  } catch (error) {
    console.error('Fout bij enhanced Reddit scraping test:', error.message);
  }
}

/**
 * Test functie voor verbeterde Amazon review scraping met extractie van pijnpunten en verlangens
 * @param {string} productId - Amazon product ID (ASIN)
 * @param {string} countryCode - Amazon landcode (bijv. 'nl', 'de', 'com')
 * @param {string} domain - Domein voor terminologie extractie
 */
async function testEnhancedAmazonReviewScraping(productId, countryCode = 'nl', domain = 'ecommerce') {
  console.log(`\n=== ENHANCED AMAZON REVIEW SCRAPING TEST: "${productId}" ===`);
  try {
    console.log(`Scraping Amazon reviews voor product: ${productId} van amazon.${countryCode}`);
    console.log(`Domein voor terminologie extractie: ${domain}`);
    
    const results = await scrapingApiService.scrapeAmazonReviews(productId, countryCode, { domain });
    
    // Toon inzichten
    if (results.insights) {
      console.log('\n=== REVIEW VERDELING ===');
      console.log(`Positieve reviews: ${results.reviewsByType.positive.length}`);
      console.log(`Neutrale reviews: ${results.reviewsByType.neutral.length}`);
      console.log(`Negatieve reviews: ${results.reviewsByType.negative.length}`);
      
      console.log('\n=== PRODUCTKENMERKEN ===');
      console.log(`Totaal aantal geïdentificeerde kenmerken: ${results.insights.productFeatures.length}`);
      console.log('Top 5 kenmerken:');
      results.insights.productFeatures.slice(0, 5).forEach((feature, index) => {
        console.log(`${index + 1}. ${feature.feature} (sentiment: ${feature.sentiment}, score: ${feature.sentimentScore.toFixed(2)})`);
        console.log(`   Positieve mentions: ${feature.positiveMentions}, Negatieve mentions: ${feature.negativeMentions}`);
      });
      
      console.log('\n=== POSITIEVE ASPECTEN ===');
      console.log(`Totaal aantal positieve aspecten: ${results.insights.positiveAspects.all.length}`);
      console.log('Top 5 positieve aspecten:');
      results.insights.positiveAspects.top.slice(0, 5).forEach((aspect, index) => {
        console.log(`${index + 1}. "${aspect.aspect}" (categorie: ${aspect.category}, score: ${aspect.score.toFixed(2)})`);
      });
      
      console.log('\n=== NEGATIEVE ASPECTEN ===');
      console.log(`Totaal aantal negatieve aspecten: ${results.insights.negativeAspects.all.length}`);
      console.log('Top 5 negatieve aspecten:');
      results.insights.negativeAspects.top.slice(0, 5).forEach((aspect, index) => {
        console.log(`${index + 1}. "${aspect.aspect}" (categorie: ${aspect.category}, score: ${aspect.score.toFixed(2)})`);
      });
      
      console.log('\n=== VERBETERPUNTEN ===');
      console.log(`Belangrijkste verbeterpunten: ${results.insights.summary.improvementAreas.join(', ')}`);
    }
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('amazon', productId, results);
    
    console.log(`\nResultaten opgeslagen in bestand`);
  } catch (error) {
    console.error('Fout bij enhanced Amazon review scraping test:', error.message);
  }
}

/**
 * Test functie voor de textAnalysisUtils met voorbeeldtekst
 * @param {string} text - Voorbeeldtekst om te analyseren
 * @param {string} domain - Domein voor terminologie extractie
 */
async function testTextAnalysis(text, domain = 'general') {
  console.log(`\n=== TEXT ANALYSIS TEST ===`);
  try {
    console.log(`Analyseren van voorbeeldtekst (${text.length} karakters)`);
    console.log(`Domein voor terminologie extractie: ${domain}`);
    
    const results = textAnalysisUtils.analyzeText(text, domain);
    
    // Toon resultaten
    console.log('\n=== PIJNPUNTEN ===');
    console.log(`Aantal geïdentificeerde pijnpunten: ${results.painPoints.length}`);
    results.painPoints.forEach((painPoint, index) => {
      console.log(`${index + 1}. "${painPoint.text}" (categorie: ${painPoint.category}, score: ${painPoint.score.toFixed(2)})`);
      console.log(`   Indicators: ${painPoint.indicators.map(i => i.indicator).join(', ')}`);
    });
    
    console.log('\n=== VERLANGENS ===');
    console.log(`Aantal geïdentificeerde verlangens: ${results.desires.length}`);
    results.desires.forEach((desire, index) => {
      console.log(`${index + 1}. "${desire.text}" (categorie: ${desire.category}, score: ${desire.score.toFixed(2)})`);
      console.log(`   Indicators: ${desire.indicators.map(i => i.indicator).join(', ')}`);
    });
    
    console.log('\n=== TERMINOLOGIE ===');
    console.log(`Aantal geëxtraheerde termen: ${results.terminology.length}`);
    results.terminology.slice(0, 10).forEach((term, index) => {
      console.log(`${index + 1}. "${term.term}" (frequentie: ${term.frequency})`);
      if (term.context) console.log(`   Context: "${term.context}"`);
    });
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('text-analysis', 'sample', results);
    
    console.log(`\nResultaten opgeslagen in bestand`);
  } catch (error) {
    console.error('Fout bij text analysis test:', error.message);
  }
}

/**
 * Sla resultaat op in een JSON bestand
 * @param {string} type - Type test (reddit, amazon, text-analysis)
 * @param {string} identifier - Identifier voor het bestand
 * @param {object} data - Data om op te slaan
 */
function saveResultToFile(type, identifier, data) {
  // Maak directory als die niet bestaat
  const resultsDir = path.join(process.cwd(), 'enhanced-scraping-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Maak bestandsnaam
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const sanitizedIdentifier = identifier.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const filename = `${type}_${sanitizedIdentifier}_${timestamp}.json`;
  const filePath = path.join(resultsDir, filename);
  
  // Schrijf data naar bestand
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  
  console.log(`Resultaten opgeslagen in: ${filePath}`);
}

/**
 * Test functie voor verbeterde Instagram scraping met extractie van pijnpunten en verlangens
 * @param {string} username - Instagram gebruikersnaam
 * @param {string} domain - Domein voor terminologie extractie
 */
async function testEnhancedInstagramScraping(username, domain = 'social') {
  console.log(`\n=== ENHANCED INSTAGRAM SCRAPING TEST: "${username}" ===`);
  try {
    console.log(`Scraping Instagram posts voor gebruiker: ${username}`);
    console.log(`Domein voor terminologie extractie: ${domain}`);
    
    const results = await scrapingApiService.scrapeInstagramPosts(username, { domain });
    
    // Toon inzichten
    if (results.insights) {
      console.log('\n=== PIJNPUNTEN ===');
      console.log(`Totaal aantal pijnpunten: ${results.insights.painPoints.all.length}`);
      console.log('Top categorieën:');
      results.insights.painPoints.topCategories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.category} (${category.count} items)`);
        category.items.slice(0, 3).forEach(item => console.log(`   - "${item.text}" (score: ${item.score.toFixed(2)})`));
      });
      
      console.log('\n=== VERLANGENS ===');
      console.log(`Totaal aantal verlangens: ${results.insights.desires.all.length}`);
      console.log('Top categorieën:');
      results.insights.desires.topCategories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.category} (${category.count} items)`);
        category.items.slice(0, 3).forEach(item => console.log(`   - "${item.text}" (score: ${item.score.toFixed(2)})`));
      });
      
      console.log('\n=== TERMINOLOGIE ===');
      console.log(`Totaal aantal termen: ${results.insights.terminology.all.length}`);
      console.log('Top 10 termen:');
      results.insights.terminology.top.slice(0, 10).forEach((term, index) => {
        console.log(`${index + 1}. "${term.term}" (frequentie: ${term.frequency})`);
      });
      
      console.log('\n=== MEEST BETROKKEN POSTS ===');
      results.insights.summary.mostEngagedPosts.forEach((post, index) => {
        console.log(`${index + 1}. Post ID: ${post.id}`);
        console.log(`   Likes: ${post.likes}, Comments: ${post.comments_count}`);
        console.log(`   Pijnpunten: ${post.painPoints}, Verlangens: ${post.desires}`);
        console.log(`   Caption: ${post.caption ? post.caption.substring(0, 100) + '...' : 'Geen caption'}`);
      });
    }
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('instagram', username, results);
    
    console.log(`\nResultaten opgeslagen in bestand`);
  } catch (error) {
    console.error('Fout bij enhanced Instagram scraping test:', error.message);
  }
}

/**
 * Test functie voor verbeterde Instagram hashtag scraping
 * @param {string} hashtag - Instagram hashtag (zonder #)
 * @param {string} domain - Domein voor terminologie extractie
 */
async function testEnhancedInstagramHashtagScraping(hashtag, domain = 'social') {
  console.log(`\n=== ENHANCED INSTAGRAM HASHTAG SCRAPING TEST: "#${hashtag}" ===`);
  try {
    console.log(`Scraping Instagram posts voor hashtag: #${hashtag}`);
    console.log(`Domein voor terminologie extractie: ${domain}`);
    
    const results = await scrapingApiService.scrapeInstagramHashtag(hashtag, { domain });
    
    // Toon inzichten (vergelijkbaar met de gebruiker test)
    if (results.insights) {
      console.log(`\n=== SAMENVATTING ===`);
      console.log(`Totaal aantal posts: ${results.insights.summary.totalPosts}`);
      console.log(`Totaal aantal pijnpunten: ${results.insights.summary.totalPainPoints}`);
      console.log(`Totaal aantal verlangens: ${results.insights.summary.totalDesires}`);
      console.log(`Top pijnpunt categorieën: ${results.insights.summary.topPainPointCategories.join(', ')}`);
      console.log(`Top verlangen categorieën: ${results.insights.summary.topDesireCategories.join(', ')}`);
      console.log(`Top termen: ${results.insights.summary.topTerms.join(', ')}`);
    }
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('instagram-hashtag', hashtag, results);
    
    console.log(`\nResultaten opgeslagen in bestand`);
  } catch (error) {
    console.error('Fout bij enhanced Instagram hashtag scraping test:', error.message);
  }
}

/**
 * Test functie voor verbeterde TikTok scraping met extractie van pijnpunten en verlangens
 * @param {string} username - TikTok gebruikersnaam
 * @param {string} domain - Domein voor terminologie extractie
 */
async function testEnhancedTikTokScraping(username, domain = 'social') {
  console.log(`\n=== ENHANCED TIKTOK SCRAPING TEST: "${username}" ===`);
  try {
    console.log(`Scraping TikTok posts voor gebruiker: ${username}`);
    console.log(`Domein voor terminologie extractie: ${domain}`);
    
    const results = await scrapingApiService.scrapeTikTokPosts(username, { domain });
    
    // Toon inzichten
    if (results.insights) {
      console.log('\n=== PIJNPUNTEN ===');
      console.log(`Totaal aantal pijnpunten: ${results.insights.painPoints.all.length}`);
      console.log('Top categorieën:');
      results.insights.painPoints.topCategories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.category} (${category.count} items)`);
        category.items.slice(0, 3).forEach(item => console.log(`   - "${item.text}" (score: ${item.score.toFixed(2)})`));
      });
      
      console.log('\n=== VERLANGENS ===');
      console.log(`Totaal aantal verlangens: ${results.insights.desires.all.length}`);
      console.log('Top categorieën:');
      results.insights.desires.topCategories.forEach((category, index) => {
        console.log(`${index + 1}. ${category.category} (${category.count} items)`);
        category.items.slice(0, 3).forEach(item => console.log(`   - "${item.text}" (score: ${item.score.toFixed(2)})`));
      });
      
      console.log('\n=== VIDEO STATISTIEKEN ===');
      console.log(`Totaal aantal videos: ${results.insights.summary.totalVideos}`);
      console.log(`Gemiddelde engagement: ${results.insights.summary.averageEngagement.toFixed(2)}`);
      console.log(`Gemiddelde views: ${results.insights.summary.averageViews.toFixed(2)}`);
      
      console.log('\n=== MEEST BETROKKEN VIDEOS ===');
      results.insights.summary.mostEngagedVideos.forEach((video, index) => {
        console.log(`${index + 1}. Video ID: ${video.id}`);
        console.log(`   Likes: ${video.likes}, Comments: ${video.comments_count}, Shares: ${video.shares}`);
        console.log(`   Views: ${video.views}, Engagement: ${video.engagement}`);
        console.log(`   Pijnpunten: ${video.painPoints}, Verlangens: ${video.desires}`);
        console.log(`   Beschrijving: ${video.description ? video.description.substring(0, 100) + '...' : 'Geen beschrijving'}`);
      });
    }
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('tiktok', username, results);
    
    console.log(`\nResultaten opgeslagen in bestand`);
  } catch (error) {
    console.error('Fout bij enhanced TikTok scraping test:', error.message);
  }
}

/**
 * Test functie voor verbeterde TikTok hashtag scraping
 * @param {string} hashtag - TikTok hashtag (zonder #)
 * @param {string} domain - Domein voor terminologie extractie
 */
async function testEnhancedTikTokHashtagScraping(hashtag, domain = 'social') {
  console.log(`\n=== ENHANCED TIKTOK HASHTAG SCRAPING TEST: "#${hashtag}" ===`);
  try {
    console.log(`Scraping TikTok posts voor hashtag: #${hashtag}`);
    console.log(`Domein voor terminologie extractie: ${domain}`);
    
    const results = await scrapingApiService.scrapeTikTokHashtag(hashtag, { domain });
    
    // Toon inzichten (vergelijkbaar met de gebruiker test)
    if (results.insights) {
      console.log(`\n=== SAMENVATTING ===`);
      console.log(`Totaal aantal videos: ${results.insights.summary.totalVideos}`);
      console.log(`Totaal aantal pijnpunten: ${results.insights.summary.totalPainPoints}`);
      console.log(`Totaal aantal verlangens: ${results.insights.summary.totalDesires}`);
      console.log(`Top pijnpunt categorieën: ${results.insights.summary.topPainPointCategories.join(', ')}`);
      console.log(`Top verlangen categorieën: ${results.insights.summary.topDesireCategories.join(', ')}`);
      console.log(`Top termen: ${results.insights.summary.topTerms.join(', ')}`);
    }
    
    // Sla resultaat op in een JSON bestand voor inspectie
    saveResultToFile('tiktok-hashtag', hashtag, results);
    
    console.log(`\nResultaten opgeslagen in bestand`);
  } catch (error) {
    console.error('Fout bij enhanced TikTok hashtag scraping test:', error.message);
  }
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
  
  // Voorbeeldtekst voor textAnalysisUtils test
  const sampleText = `
    Ik ben echt gefrustreerd door mijn huidige smartphone. Het batterijleven is verschrikkelijk en ik moet hem elke paar uur opladen. 
    De camera is ook teleurstellend, vooral bij weinig licht. Ik haat het dat de foto's altijd wazig zijn.
    
    Ik zou graag een telefoon willen die minstens een hele dag meegaat zonder opladen. Het zou geweldig zijn als de camera ook goede foto's maakt in het donker.
    Ik verlang naar een gebruiksvriendelijke interface die niet traag wordt na een paar maanden gebruik.
    
    De prijs is ook een probleem. Ik vind het belachelijk dat je tegenwoordig meer dan €1000 moet betalen voor een goede smartphone. Er zouden meer betaalbare opties moeten zijn.
    
    Mijn ideale telefoon zou waterdicht zijn, een lange batterijduur hebben, een uitstekende camera, en dat alles voor een redelijke prijs.
  `;
  
  // Bepaal welke tests uit te voeren op basis van command line argumenten
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  console.log(`\n=== UITVOEREN VAN ${testType.toUpperCase()} TESTS ===\n`);
  
  // Voer de geselecteerde tests uit
  if (testType === 'all' || testType === 'text') {
    await testTextAnalysis(sampleText, 'tech');
  }
  
  if (testType === 'all' || testType === 'reddit') {
    await testEnhancedRedditScraping('smartphone problems', false, 'tech');
    await testEnhancedRedditScraping('GalaxyS23', true, 'tech');
  }
  
  if (testType === 'all' || testType === 'amazon') {
    await testEnhancedAmazonReviewScraping('B0BDJH3V3Q', 'com', 'tech'); // Samsung Galaxy S23 Ultra
  }
  
  if (testType === 'all' || testType === 'instagram') {
    await testEnhancedInstagramScraping('samsung', 'tech');
    await testEnhancedInstagramHashtagScraping('galaxys23', 'tech');
  }
  
  if (testType === 'all' || testType === 'tiktok') {
    await testEnhancedTikTokScraping('samsung', 'tech');
    await testEnhancedTikTokHashtagScraping('galaxys23', 'tech');
  }
  
  console.log('\n=== ALLE TESTS VOLTOOID ===');
}

// Voer de tests uit
runTests().catch(error => {
  console.error('Onverwachte fout bij uitvoeren tests:', error);
  process.exit(1);
});
