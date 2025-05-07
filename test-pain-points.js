/**
 * Test script voor de Pain Points en Desires Extraction Service
 * 
 * Dit script test de functionaliteit van de Pain Points en Desires Extraction Service
 * met verschillende soorten tekst input.
 */

const { getPainPointsExtractionService } = require('./src/services/nlp/pain-points-extraction');

// Controleer of Supabase omgevingsvariabelen zijn ingesteld
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.warn('⚠️ SUPABASE_URL of SUPABASE_SERVICE_KEY is niet ingesteld. Database functionaliteit is uitgeschakeld.');
}

// Test functie voor Pain Points en Desires extractie
async function testPainPointsExtraction() {
  console.log('🧪 Testen van de Pain Points en Desires Extraction Engine...\n');
  
  // Haal service instance op
  const painPointsService = getPainPointsExtractionService();
  
  try {
    // Test 1: Basis extractie van pijnpunten en wensen
    console.log('🧪 Test 1: Basis extractie van pijnpunten en wensen');
    const testText1 = "Ik ben niet tevreden met de levertijd van dit product. Het duurde meer dan twee weken voordat het werd bezorgd. Ik zou graag zien dat de levertijd in de toekomst wordt verbeterd.";
    const result1 = await painPointsService.extractPainPointsAndDesires(testText1);
    console.log(JSON.stringify(result1, null, 2));
    console.log('\n');
    
    // Test 2: Extractie van pijnpunten met verschillende intensiteit
    console.log('🧪 Test 2: Extractie van pijnpunten met verschillende intensiteit');
    const testText2 = "De website is erg traag en het inloggen werkt soms niet. Het is zeer frustrerend dat ik steeds opnieuw moet proberen om in te loggen. Ik zou willen dat de website sneller en betrouwbaarder zou zijn.";
    const result2 = await painPointsService.extractPainPointsAndDesires(testText2);
    
    console.log('Pijnpunten:');
    for (const painPoint of result2.painPoints) {
      console.log(`   - "${painPoint.text}" (Intensiteit: ${painPoint.intensity}, Score: ${painPoint.score})`);
    }
    
    console.log('\nWensen:');
    for (const desire of result2.desires) {
      console.log(`   - "${desire.text}" (Intensiteit: ${desire.intensity}, Score: ${desire.score})`);
    }
    console.log('\n');
    
    // Test 3: Categorisatie van pijnpunten en wensen
    console.log('🧪 Test 3: Categorisatie van pijnpunten en wensen');
    const testText3 = "De checkout pagina is erg verwarrend en het is moeilijk om mijn bestelling af te ronden. Ik zou graag een eenvoudiger betaalproces willen zien. Ook is de verzendkosten berekening niet duidelijk. Het zou fijn zijn als er een duidelijke prijsopgave zou zijn voordat ik begin met het afrekenen.";
    const result3 = await painPointsService.extractPainPointsAndDesires(testText3, { domain: 'ecommerce' });
    
    console.log('Pijnpunten per categorie:');
    const painPointsByCategory = {};
    for (const painPoint of result3.painPoints) {
      if (!painPointsByCategory[painPoint.category]) {
        painPointsByCategory[painPoint.category] = [];
      }
      painPointsByCategory[painPoint.category].push(painPoint);
    }
    
    for (const [category, points] of Object.entries(painPointsByCategory)) {
      console.log(`   Categorie: ${category}`);
      for (const point of points) {
        console.log(`      - "${point.text}" (Score: ${point.score})`);
      }
    }
    
    console.log('\nWensen per categorie:');
    const desiresByCategory = {};
    for (const desire of result3.desires) {
      if (!desiresByCategory[desire.category]) {
        desiresByCategory[desire.category] = [];
      }
      desiresByCategory[desire.category].push(desire);
    }
    
    for (const [category, desires] of Object.entries(desiresByCategory)) {
      console.log(`   Categorie: ${category}`);
      for (const desire of desires) {
        console.log(`      - "${desire.text}" (Score: ${desire.score})`);
      }
    }
    console.log('\n');
    
    // Test 4: Engelstalige tekst
    console.log('🧪 Test 4: Engelstalige tekst');
    const testText4 = "The app crashes frequently when I try to upload photos. It's very frustrating and I've lost my work multiple times. I wish the developers would fix this issue soon. It would be great if there was an auto-save feature to prevent data loss.";
    const result4 = await painPointsService.extractPainPointsAndDesires(testText4, { domain: 'technology' });
    
    console.log('Pijnpunten:');
    for (const painPoint of result4.painPoints) {
      console.log(`   - "${painPoint.text}" (Categorie: ${painPoint.category}, Score: ${painPoint.score})`);
      console.log(`     Keywords: ${painPoint.keywords.join(', ')}`);
    }
    
    console.log('\nWensen:');
    for (const desire of result4.desires) {
      console.log(`   - "${desire.text}" (Categorie: ${desire.category}, Score: ${desire.score})`);
      console.log(`     Keywords: ${desire.keywords.join(', ')}`);
    }
    console.log('\n');
    
    // Test 5: Frequentie indicatoren
    console.log('🧪 Test 5: Frequentie indicatoren');
    const testText5 = "De app crasht altijd als ik probeer om foto's te uploaden. Soms werkt de zoekfunctie niet goed. Ik zou graag zien dat deze problemen regelmatig worden aangepakt in updates.";
    const result5 = await painPointsService.extractPainPointsAndDesires(testText5);
    
    console.log('Pijnpunten met frequentie:');
    for (const painPoint of result5.painPoints) {
      console.log(`   - "${painPoint.text}" (Frequentie: ${painPoint.frequency || 'onbekend'}, Score: ${painPoint.score})`);
    }
    
    console.log('\nWensen met frequentie:');
    for (const desire of result5.desires) {
      console.log(`   - "${desire.text}" (Frequentie: ${desire.frequency || 'onbekend'}, Score: ${desire.score})`);
    }
    console.log('\n');
    
    // Test 6: Lege en ongeldige input
    console.log('🧪 Test 6: Lege en ongeldige input');
    const result6a = await painPointsService.extractPainPointsAndDesires('');
    console.log('Lege input resultaat:', JSON.stringify(result6a, null, 2));
    
    const result6b = await painPointsService.extractPainPointsAndDesires(null);
    console.log('Null input resultaat:', JSON.stringify(result6b, null, 2));
    console.log('\n');
    
    console.log('✅ Alle tests voltooid');
  } catch (error) {
    console.error('❌ Fout bij het testen van de Pain Points en Desires Extraction Engine:', error);
  }
}

// Voer de tests uit
testPainPointsExtraction();
