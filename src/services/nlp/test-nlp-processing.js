/**
 * Test Script voor NLP Processing Module
 *
 * Dit script test de functionaliteit van de NLP processing module.
 * Het voert verschillende test cases uit om te verifiëren dat de module correct werkt.
 */

const { config } = require('dotenv');
const { nlpProcessingService } = require('./index');

config();

/**
 * Voer alle tests uit
 */
async function runTests() {
  console.log('🧪 Testen van NLP Processing Module...\n');

  try {
    // Test 1: Tekst normalisatie en schoonmaak
    await testTextCleaning();

    // Test 2: Taaldetectie en vertaling
    await testLanguageDetection();

    // Test 3: Entity recognition
    await testEntityRecognition();

    // Test 4: Sentiment analyse
    await testSentimentAnalysis();

    // Test 5: Topic modeling
    await testTopicModeling();

    // Test 6: Volledige NLP pipeline
    await testFullPipeline();

    // Test 7: Batch processing
    await testBatchProcessing();

    console.log('\n✅ Alle tests voltooid');
  } catch (error) {
    console.error('\n❌ Tests mislukt:', error);
  }
}

/**
 * Test tekst normalisatie en schoonmaak
 */
async function testTextCleaning() {
  console.log('🧪 Test 1: Tekst normalisatie en schoonmaak');

  const testCases = [
    {
      input: 'Dit is een <b>test</b> met HTML tags en https://example.com URLs.',
      expected: 'dit is een test met en urls',
    },
    {
      input: 'Product review: I really LOVED this product! It\'s amazing! 😍 Contact: test@example.com',
      expected: 'product review i really loved this product its amazing contact',
    },
    {
      input: 'Special characters: @#$%^&*() and numbers: 12345',
      expected: 'special characters and numbers 12345',
    },
  ];

  for (const [index, testCase] of testCases.entries()) {
    const result = await nlpProcessingService.textCleaningService.cleanText(testCase.input);
    console.log(`✅ Test case ${index + 1}:`);
    console.log(`📋 Input: "${testCase.input}"`);
    console.log(`📋 Output: "${result}"`);
    console.log(`📋 Expected: "${testCase.expected}"`);
    console.log('');
  }
}

/**
 * Test taaldetectie en vertaling
 */
async function testLanguageDetection() {
  console.log('🧪 Test 2: Taaldetectie en vertaling');

  const testCases = [
    {
      input: 'This is a test sentence in English.',
      expectedLanguage: 'en',
    },
    {
      input: 'Dit is een testzin in het Nederlands.',
      expectedLanguage: 'nl',
    },
    {
      input: 'Dies ist ein Testsatz auf Deutsch.',
      expectedLanguage: 'de',
    },
    {
      input: 'Ceci est une phrase de test en français.',
      expectedLanguage: 'fr',
    },
  ];

  for (const [index, testCase] of testCases.entries()) {
    const result = await nlpProcessingService.languageService.detectAndTranslate(
      testCase.input,
      { translateTo: 'en' },
    );

    console.log(`✅ Test case ${index + 1}:`);
    console.log(`📋 Input: "${testCase.input}"`);
    console.log(`📋 Gedetecteerde taal: ${result.language} (verwacht: ${testCase.expectedLanguage})`);

    if (result.translatedText) {
      console.log(`📋 Vertaalde tekst: "${result.translatedText}"`);
    }

    console.log('');
  }
}

/**
 * Test entity recognition
 */
async function testEntityRecognition() {
  console.log('🧪 Test 3: Entity recognition');

  const testCases = [
    {
      input: 'Apple is releasing a new iPhone in September. Contact Tim Cook at tim@apple.com.',
      expectedEntities: ['Apple', 'iPhone', 'September', 'Tim Cook', 'tim@apple.com'],
    },
    {
      input: 'I visited Amsterdam last summer and stayed at the Hilton Hotel.',
      expectedEntities: ['Amsterdam', 'summer', 'Hilton Hotel'],
    },
    {
      input: 'The price of the product is $299.99 and it will be available from 01/15/2023.',
      expectedEntities: ['$299.99', '01/15/2023'],
    },
  ];

  for (const [index, testCase] of testCases.entries()) {
    const result = await nlpProcessingService.entityRecognitionService.extractEntities(testCase.input);

    console.log(`✅ Test case ${index + 1}:`);
    console.log(`📋 Input: "${testCase.input}"`);
    console.log(`📋 Geëxtraheerde entiteiten (${result.entities.length}):`);

    result.entities.forEach((entity) => {
      console.log(`   - ${entity.text} (${entity.type}, confidence: ${entity.confidence.toFixed(2)})`);
    });

    console.log(`📋 Verwachte entiteiten: ${testCase.expectedEntities.join(', ')}`);
    console.log('');
  }
}

/**
 * Test sentiment analyse
 */
async function testSentimentAnalysis() {
  console.log('🧪 Test 4: Sentiment analyse');

  const testCases = [
    {
      input: 'I absolutely love this product! It\'s amazing and works perfectly.',
      expectedSentiment: 'positive',
    },
    {
      input: 'This is the worst experience I\'ve ever had. Terrible customer service.',
      expectedSentiment: 'negative',
    },
    {
      input: 'The product arrived on time. It works as described.',
      expectedSentiment: 'neutral',
    },
    {
      input: 'The quality is good but the price is too high.',
      expectedSentiment: 'mixed',
    },
  ];

  for (const [index, testCase] of testCases.entries()) {
    const result = await nlpProcessingService.sentimentAnalysisService.analyzeSentiment(testCase.input);

    console.log(`✅ Test case ${index + 1}:`);
    console.log(`📋 Input: "${testCase.input}"`);
    console.log(`📋 Sentiment: ${result.sentiment} (score: ${result.score.toFixed(2)}, confidence: ${result.confidence.toFixed(2)})`);
    console.log(`📋 Verwacht sentiment: ${testCase.expectedSentiment}`);

    if (result.emotions) {
      console.log('📋 Top emoties:');
      const topEmotions = Object.entries(result.emotions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      topEmotions.forEach(([emotion, score]) => {
        console.log(`   - ${emotion}: ${score.toFixed(2)}`);
      });
    }

    if (result.aspects && result.aspects.length > 0) {
      console.log('📋 Aspect-gebaseerd sentiment:');
      result.aspects.slice(0, 3).forEach((aspect) => {
        console.log(`   - ${aspect.text}: ${aspect.sentiment} (${aspect.score.toFixed(2)})`);
      });
    }

    console.log('');
  }
}

/**
 * Test topic modeling
 */
async function testTopicModeling() {
  console.log('🧪 Test 5: Topic modeling');

  const testCases = [
    {
      input: 'The product quality is excellent. The materials used are durable and the construction is solid. However, the shipping was delayed and customer service was not responsive when I contacted them about the delay.',
      domain: 'ecommerce',
    },
    {
      input: 'I posted a video on Instagram yesterday and it got a lot of engagement. Many people liked and commented on it. The content was original and authentic, which I think contributed to its popularity.',
      domain: 'social_media',
    },
    {
      input: 'This is the best restaurant in town. The food is amazing and the service is excellent. I highly recommend trying their signature dish. Will definitely come back again!',
      domain: 'reviews',
    },
  ];

  for (const [index, testCase] of testCases.entries()) {
    const result = await nlpProcessingService.topicModelingService.extractTopics(
      testCase.input,
      { domain: testCase.domain },
    );

    console.log(`✅ Test case ${index + 1}:`);
    console.log(`📋 Input: "${testCase.input}"`);
    console.log(`📋 Gedetecteerd domein: ${result.domain} (verwacht: ${testCase.domain})`);
    console.log(`📋 Geëxtraheerde onderwerpen (${result.topics.length}):`);

    result.topics.forEach((topic) => {
      console.log(`   - ${topic.name} (score: ${topic.score.toFixed(2)})`);
      console.log(`     Keywords: ${topic.keywords.join(', ')}`);
    });

    if (result.keywords && result.keywords.length > 0) {
      console.log('📋 Top keywords:');
      result.keywords.slice(0, 5).forEach((keyword) => {
        console.log(`   - ${keyword.term} (score: ${keyword.score.toFixed(2)})`);
      });
    }

    console.log('');
  }
}

/**
 * Test volledige NLP pipeline
 */
async function testFullPipeline() {
  console.log('🧪 Test 6: Volledige NLP pipeline');

  const testText = 'I recently purchased the new iPhone 13 Pro from Apple. The camera quality is outstanding and the battery life is much better than my old phone. However, the price is quite high at $999. I contacted customer service at support@apple.com about an issue with Apple Pay, and they were very helpful. Overall, I would recommend this product to anyone looking for a high-end smartphone.';

  console.log(`📋 Input tekst: "${testText}"`);

  const result = await nlpProcessingService.processText(testText, {
    performTopicModeling: true,
  });

  console.log('\n📊 NLP Pipeline Resultaat:');
  console.log('------------------------');

  console.log(`📋 Schoongemaakte tekst: "${result.cleaned_text.substring(0, 100)}..."`);
  console.log(`📋 Gedetecteerde taal: ${result.language}`);

  if (result.translated_text) {
    console.log(`📋 Vertaalde tekst: "${result.translated_text.substring(0, 100)}..."`);
  }

  console.log(`\n📋 Entiteiten (${result.entities.length}):`);
  result.entities.slice(0, 5).forEach((entity) => {
    console.log(`   - ${entity.text} (${entity.type}, confidence: ${entity.confidence.toFixed(2)})`);
  });

  console.log(`\n📋 Sentiment: ${result.sentiment.sentiment} (score: ${result.sentiment.score.toFixed(2)})`);

  if (result.sentiment.emotions) {
    console.log('📋 Top emoties:');
    const topEmotions = Object.entries(result.sentiment.emotions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    topEmotions.forEach(([emotion, score]) => {
      console.log(`   - ${emotion}: ${score.toFixed(2)}`);
    });
  }

  if (result.topics && result.topics.length > 0) {
    console.log(`\n📋 Onderwerpen (${result.topics.length}):`);
    result.topics.forEach((topic) => {
      console.log(`   - ${topic.name} (score: ${topic.score.toFixed(2)})`);
      console.log(`     Keywords: ${topic.keywords.join(', ')}`);
    });
  }

  console.log('\n✅ Volledige NLP pipeline test voltooid');
}

/**
 * Test batch processing
 */
async function testBatchProcessing() {
  console.log('🧪 Test 7: Batch processing');

  const testTexts = [
    'I love this product! It\'s amazing and works perfectly.',
    'This is the worst experience I\'ve ever had. Terrible customer service.',
    'The product arrived on time. It works as described.',
    'The quality is good but the price is too high.',
    'I recently purchased the new iPhone 13 Pro from Apple. The camera quality is outstanding.',
    'I visited Amsterdam last summer and stayed at the Hilton Hotel.',
    'The price of the product is $299.99 and it will be available from 01/15/2023.',
    'This is a neutral statement without much sentiment or opinion.',
    'I highly recommend this restaurant. The food is delicious and the service is excellent.',
    'I would not recommend this hotel. The rooms are dirty and the staff is rude.',
  ];

  console.log(`📋 Verwerken van ${testTexts.length} teksten in batch...`);

  const startTime = Date.now();

  const results = await nlpProcessingService.processBatch(testTexts, async (text) => {
    return await nlpProcessingService.processText(text, {
      performTopicModeling: false,
    });
  }, {
    batchSize: 3,
    concurrency: 2,
  });

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  console.log(`\n✅ Batch verwerking voltooid in ${duration.toFixed(2)} seconden`);
  console.log(`📋 Verwerkte ${results.length} teksten`);

  // Toon sentiment distributie
  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0,
  };

  results.forEach((result) => {
    if (result.sentiment && result.sentiment.sentiment) {
      sentimentCounts[result.sentiment.sentiment] = (sentimentCounts[result.sentiment.sentiment] || 0) + 1;
    }
  });

  console.log('\n📊 Sentiment Distributie:');
  Object.entries(sentimentCounts).forEach(([sentiment, count]) => {
    console.log(`   - ${sentiment}: ${count} (${(count / results.length * 100).toFixed(1)}%)`);
  });

  // Toon taal distributie
  const languageCounts = {};

  results.forEach((result) => {
    if (result.language) {
      languageCounts[result.language] = (languageCounts[result.language] || 0) + 1;
    }
  });

  console.log('\n📊 Taal Distributie:');
  Object.entries(languageCounts).forEach(([language, count]) => {
    console.log(`   - ${language}: ${count} (${(count / results.length * 100).toFixed(1)}%)`);
  });
}

// Voer alle tests uit
runTests().catch((error) => {
  console.error('❌ Onverwachte fout bij uitvoeren van tests:', error);
  process.exit(1);
});
