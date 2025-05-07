/**
 * Test script voor de Language Analysis Module
 * 
 * Dit script test de functionaliteit van de Language Analysis Module
 * met verschillende soorten tekst input.
 */

const { getLanguageAnalysisService } = require('./src/services/nlp/language-analysis');

// Controleer of Supabase omgevingsvariabelen zijn ingesteld
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn('⚠️ SUPABASE_URL of SUPABASE_SERVICE_KEY is niet ingesteld. Database functionaliteit is uitgeschakeld.');
}

// Test functie voor Language Analysis
async function testLanguageAnalysis() {
  console.log('🧪 Testen van de Language Analysis Module...\n');
  
  // Haal service instance op
  const languageAnalysisService = getLanguageAnalysisService();
  
  try {
    // Test 1: Basis taalanalyse
    console.log('🧪 Test 1: Basis taalanalyse');
    const testText1 = "De webshop heeft een gebruiksvriendelijke interface, maar de checkout pagina is wat verwarrend. Het betaalproces zou eenvoudiger kunnen. De verzendkosten zijn redelijk.";
    const result1 = await languageAnalysisService.analyzeLanguage(testText1);
    console.log('Gedetecteerde taal:', result1.metadata.language);
    console.log('Gedetecteerd domein:', result1.metadata.domain);
    console.log('Aantal woorden:', result1.metadata.wordCount);
    console.log('Aantal unieke woorden:', result1.metadata.uniqueWordCount);
    console.log('\n');
    
    // Test 2: Terminologie extractie
    console.log('🧪 Test 2: Terminologie extractie');
    const testText2 = "Onze webshop biedt een breed assortiment producten aan. Klanten kunnen eenvoudig bestellen en betalen via verschillende betaalmethoden. De verzending is snel en betrouwbaar. Bij problemen staat onze klantenservice klaar om te helpen.";
    const result2 = await languageAnalysisService.analyzeLanguage(testText2, { domain: 'ecommerce' });
    
    console.log('Geëxtraheerde terminologie:');
    for (const term of result2.terminology.slice(0, 10)) { // Toon top 10
      console.log(`   - "${term.term}" (${term.count}x)`);
    }
    console.log('\n');
    
    // Test 3: Phrase mining
    console.log('🧪 Test 3: Phrase mining');
    const testText3 = "De gebruikerservaring is zeer belangrijk voor onze applicatie. We streven naar een intuïtieve gebruikerservaring die aansluit bij de verwachtingen van onze gebruikers. Een goede gebruikerservaring zorgt voor tevreden klanten en meer conversies.";
    const result3 = await languageAnalysisService.analyzeLanguage(testText3);
    
    console.log('Geëxtraheerde phrases:');
    for (const phrase of result3.phrases.slice(0, 10)) { // Toon top 10
      console.log(`   - "${phrase.phrase}" (${phrase.count}x, ${phrase.size} woorden)`);
    }
    console.log('\n');
    
    // Test 4: Jargon identificatie
    console.log('🧪 Test 4: Jargon identificatie');
    const testText4 = "We gebruiken een CI/CD pipeline voor onze deployments. De frontend is gebouwd met React en de backend draait op Node.js. We hebben een microservices architectuur met Docker containers. De API is RESTful en we gebruiken JWT voor authenticatie.";
    const result4 = await languageAnalysisService.analyzeLanguage(testText4, { domain: 'technology' });
    
    console.log('Geïdentificeerd jargon:');
    for (const term of result4.jargon) {
      console.log(`   - "${term.term}" (${term.count}x)`);
    }
    console.log('\n');
    
    // Test 5: Informele uitdrukkingen
    console.log('🧪 Test 5: Informele uitdrukkingen');
    const testText5 = "De app is echt super cool! Het werkt geweldig en is vet handig. Soms is het een beetje traag, maar dat is oké. Lol, ik gebruik het elke dag. Wtf, waarom wist ik hier niet eerder van?";
    const result5 = await languageAnalysisService.analyzeLanguage(testText5);
    
    console.log('Gedetecteerde informele uitdrukkingen:');
    for (const expression of result5.colloquialExpressions) {
      console.log(`   - "${expression.term}" (${expression.count}x)`);
    }
    console.log('\n');
    
    // Test 6: Woordfrequentie analyse
    console.log('🧪 Test 6: Woordfrequentie analyse');
    const testText6 = "De klant is koning. Een tevreden klant komt terug. Klantervaring is belangrijk voor klantbehoud. Klanten waarderen goede service en snelle levering. Klantfeedback helpt ons te verbeteren.";
    const result6 = await languageAnalysisService.analyzeLanguage(testText6);
    
    console.log('Woordfrequentie (top 10):');
    const sortedWords = Object.entries(result6.wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [word, count] of sortedWords) {
      console.log(`   - "${word}": ${count}x`);
    }
    console.log('\n');
    
    // Test 7: Visualisatie data
    console.log('🧪 Test 7: Visualisatie data');
    const testText7 = "De webshop heeft een responsive design. De checkout pagina is geoptimaliseerd voor conversie. We gebruiken A/B testing om de user experience te verbeteren. De bounce rate is gedaald na de laatste update.";
    const result7 = await languageAnalysisService.analyzeLanguage(testText7, { domain: 'ecommerce' });
    
    console.log('Word cloud data (top 5):');
    for (const item of result7.visualizationData.wordCloud.slice(0, 5)) {
      console.log(`   - "${item.text}": ${item.value}`);
    }
    
    console.log('\nTerminologie per domein:');
    for (const [domain, terms] of Object.entries(result7.visualizationData.terminologyByDomain)) {
      console.log(`   Domein: ${domain}`);
      for (const term of terms.slice(0, 3)) { // Toon top 3 per domein
        console.log(`      - "${term.term}": ${term.count}x`);
      }
    }
    console.log('\n');
    
    // Test 8: Engelstalige tekst
    console.log('🧪 Test 8: Engelstalige tekst');
    const testText8 = "Our online store offers a wide range of products. Customers can easily order and pay using various payment methods. Shipping is fast and reliable. Our customer service is ready to help with any issues.";
    const result8 = await languageAnalysisService.analyzeLanguage(testText8);
    
    console.log('Gedetecteerde taal:', result8.metadata.language);
    console.log('Gedetecteerd domein:', result8.metadata.domain);
    
    console.log('\nGeëxtraheerde terminologie (top 5):');
    for (const term of result8.terminology.slice(0, 5)) {
      console.log(`   - "${term.term}" (${term.count}x)`);
    }
    console.log('\n');
    
    // Test 9: Lege en ongeldige input
    console.log('🧪 Test 9: Lege en ongeldige input');
    const result9a = await languageAnalysisService.analyzeLanguage('');
    console.log('Lege input resultaat:', JSON.stringify(result9a.metadata, null, 2));
    
    const result9b = await languageAnalysisService.analyzeLanguage(null);
    console.log('Null input resultaat:', JSON.stringify(result9b.metadata, null, 2));
    console.log('\n');
    
    console.log('✅ Alle tests voltooid');
  } catch (error) {
    console.error('❌ Fout bij het testen van de Language Analysis Module:', error);
  }
}

// Voer de tests uit
testLanguageAnalysis();
