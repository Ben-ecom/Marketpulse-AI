// Test script voor de Sentiment Analysis Engine
const { sentimentAnalysisService } = require('./src/services/nlp/index');

async function testSentimentAnalysis() {
  console.log('🧪 Testen van de Sentiment Analysis Engine...\n');
  
  // Test 1: Basis sentiment analyse
  console.log('🧪 Test 1: Basis sentiment analyse');
  const result1 = await sentimentAnalysisService.analyzeSentiment(
    'Ik ben zeer tevreden met dit product. De kwaliteit is uitstekend, maar de prijs is aan de hoge kant. Toch zou ik het zeker aanraden aan anderen.'
  );
  console.log(JSON.stringify(result1, null, 2));
  console.log('\n');
  
  // Test 2: Multi-level sentiment classificatie
  console.log('🧪 Test 2: Multi-level sentiment classificatie');
  const result2 = await sentimentAnalysisService.analyzeSentiment(
    'Dit is absoluut het beste product dat ik ooit heb gekocht! Ik ben er ontzettend blij mee en kan het iedereen aanraden.'
  );
  console.log(`Sentiment: ${result2.sentiment}`);
  console.log(`Intensiteit: ${result2.intensityLevel}`);
  console.log(`Score: ${result2.score}`);
  console.log(`Confidence: ${result2.confidence}`);
  console.log('\n');
  
  // Test 3: Emotionele intensiteit scoring
  console.log('🧪 Test 3: Emotionele intensiteit scoring');
  const result3 = await sentimentAnalysisService.analyzeSentiment(
    'Ik ben teleurgesteld in de kwaliteit van dit product. Het werkt niet zoals verwacht en de klantenservice reageert traag.'
  );
  console.log(`Sentiment: ${result3.sentiment}`);
  console.log(`Intensiteit: ${result3.intensityLevel}`);
  console.log(`Top emoties:`);
  Object.entries(result3.emotions).slice(0, 3).forEach(([emotion, score]) => {
    console.log(`   - ${emotion}: ${score}`);
  });
  console.log('\n');
  
  // Test 4: Aspect-gebaseerde sentiment analyse
  console.log('🧪 Test 4: Aspect-gebaseerde sentiment analyse');
  const result4 = await sentimentAnalysisService.analyzeSentiment(
    'De kwaliteit van het product is uitstekend, maar de levering duurde veel te lang. De klantenservice was echter zeer behulpzaam bij het oplossen van het probleem.'
  );
  console.log('Aspecten:');
  result4.aspects.forEach(aspect => {
    console.log(`   - ${aspect.term}: ${aspect.sentiment} (${aspect.intensityLevel}, score: ${aspect.score})`);
  });
  console.log('\n');
  
  // Test 5: Contextual sentiment detectie
  console.log('🧪 Test 5: Contextual sentiment detectie');
  const result5 = await sentimentAnalysisService.analyzeSentiment(
    'Het product is goed, maar de prijs is te hoog. Als de prijs lager zou zijn, zou ik het zeker aanraden.'
  );
  console.log('Zinnen:');
  result5.sentences.forEach((sentence, index) => {
    console.log(`   ${index+1}. "${sentence.text}": ${sentence.sentiment} (score: ${sentence.score})`);
    if (sentence.hasContrast) console.log('      - Bevat contrast patroon');
    if (sentence.hasCondition) console.log('      - Bevat conditie patroon');
    if (sentence.hasEmphasis) console.log('      - Bevat nadruk patroon');
  });
  console.log('\n');
  
  // Test 6: Domein-specifieke sentiment analyse
  console.log('🧪 Test 6: Domein-specifieke sentiment analyse');
  const result6 = await sentimentAnalysisService.analyzeSentiment(
    'De website is gebruiksvriendelijk en de checkout was eenvoudig. Helaas was het product niet op voorraad en moest ik lang wachten op de levering. De klantenservice was echter zeer behulpzaam.',
    { domain: 'ecommerce' }
  );
  console.log(`Gedetecteerd domein: ${result6.domain}`);
  console.log(`Sentiment: ${result6.sentiment} (${result6.intensityLevel})`);
  console.log(`Score: ${result6.score}`);
  console.log('Aspecten:');
  result6.aspects.slice(0, 3).forEach(aspect => {
    console.log(`   - ${aspect.term}: ${aspect.sentiment} (score: ${aspect.score})`);
  });
  
  console.log('\n✅ Alle tests voltooid');
}

testSentimentAnalysis().catch(error => {
  console.error('❌ Fout bij testen:', error);
});
