# NLP Processing Module

Deze module bevat de Natural Language Processing (NLP) pipeline voor het analyseren van tekst data in MarketPulse AI. De module biedt uitgebreide functionaliteit voor tekstnormalisatie, taaldetectie, entity recognition, sentiment analyse, topic modeling en batch processing.

## Functionaliteit

De NLP Processing Module biedt de volgende functionaliteit:

1. **Tekst Normalisatie en Schoonmaak**
   - Verwijderen van HTML tags, URLs, e-mailadressen en speciale tekens
   - Normaliseren van witruimte en interpunctie
   - Verwijderen van stopwoorden
   - Tokenization van tekst

2. **Taaldetectie en Vertaling**
   - Automatische detectie van de taal van tekst
   - Ondersteuning voor meer dan 50 talen
   - Optionele vertaling naar een doeltaal

3. **Named Entity Recognition (NER)**
   - Herkennen van personen, organisaties, locaties, producten en andere entiteiten
   - Extractie van datums, tijden, geldbedragen en percentages
   - Ondersteuning voor e-mailadressen, URLs, telefoonnummers en IP-adressen

4. **Sentiment Analyse**
   - Bepalen van sentiment (positief, negatief, neutraal)
   - Extractie van emoties (vreugde, verdriet, woede, angst, etc.)
   - Aspect-gebaseerd sentiment voor specifieke onderwerpen

5. **Topic Modeling**
   - Extractie van onderwerpen en thema's uit tekst
   - Identificatie van sleutelwoorden en belangrijke termen
   - Domein-specifieke topic extractie (e-commerce, social media, reviews)

6. **Batch Processing**
   - Efficiënte verwerking van grote hoeveelheden tekst
   - Parallelle verwerking met rate limiting
   - Voortgangsrapportage en foutafhandeling

## Gebruik

### Initialisatie

```javascript
import { nlpProcessingService } from './services/nlp';

// Of importeer specifieke services
import {
  textCleaningService,
  languageService,
  entityRecognitionService,
  sentimentAnalysisService,
  topicModelingService,
  batchProcessingService
} from './services/nlp';
```

### Volledige NLP Pipeline

```javascript
// Verwerk een enkele tekst met de volledige NLP pipeline
const result = await nlpProcessingService.processText(
  'I really love this product! The quality is excellent and the price is reasonable.',
  {
    performTopicModeling: true,
    translateTo: 'nl',
    saveResults: true,
    projectId: 'project-123'
  }
);

console.log(`Taal: ${result.language}`);
console.log(`Sentiment: ${result.sentiment.sentiment} (score: ${result.sentiment.score})`);
console.log(`Entiteiten: ${result.entities.map(e => e.text).join(', ')}`);
console.log(`Onderwerpen: ${result.topics.map(t => t.name).join(', ')}`);
```

### Tekst Normalisatie en Schoonmaak

```javascript
// Maak tekst schoon
const cleanedText = await textCleaningService.cleanText(
  'Dit is een <b>test</b> met HTML tags en https://example.com URLs.',
  {
    removeHtml: true,
    removeUrls: true,
    removeEmails: true,
    removeEmojis: true,
    removeSpecialChars: true,
    removeNumbers: false,
    removeStopwords: true,
    language: 'nl',
    lowercase: true
  }
);

// Tokenize tekst
const tokens = textCleaningService.tokenize(cleanedText);
```

### Taaldetectie en Vertaling

```javascript
// Detecteer taal en vertaal indien nodig
const languageResult = await languageService.detectAndTranslate(
  'Dit is een Nederlandse tekst die vertaald kan worden naar het Engels.',
  {
    translateTo: 'en',
    useTranslatedText: true
  }
);

console.log(`Gedetecteerde taal: ${languageResult.language}`);
console.log(`Vertaalde tekst: ${languageResult.translatedText}`);
```

### Named Entity Recognition

```javascript
// Extraheer entiteiten uit tekst
const entitiesResult = await entityRecognitionService.extractEntities(
  'Apple is releasing a new iPhone in September. Contact Tim Cook at tim@apple.com.',
  {
    useSpacy: true // Gebruik geavanceerde NER (mock in huidige implementatie)
  }
);

console.log('Geëxtraheerde entiteiten:');
entitiesResult.entities.forEach(entity => {
  console.log(`- ${entity.text} (${entity.type}, confidence: ${entity.confidence})`);
});
```

### Sentiment Analyse

```javascript
// Analyseer sentiment in tekst
const sentimentResult = await sentimentAnalysisService.analyzeSentiment(
  'I absolutely love this product! It\'s amazing and works perfectly.',
  {
    useExternalApi: false // Gebruik lexicon-gebaseerde analyse
  }
);

console.log(`Sentiment: ${sentimentResult.sentiment}`);
console.log(`Score: ${sentimentResult.score}`);
console.log(`Confidence: ${sentimentResult.confidence}`);

// Emoties
Object.entries(sentimentResult.emotions).forEach(([emotion, score]) => {
  console.log(`${emotion}: ${score}`);
});

// Aspect-gebaseerd sentiment
sentimentResult.aspects.forEach(aspect => {
  console.log(`${aspect.text}: ${aspect.sentiment} (${aspect.score})`);
});
```

### Topic Modeling

```javascript
// Extraheer onderwerpen uit tekst
const topicsResult = await topicModelingService.extractTopics(
  'The product quality is excellent. The materials used are durable and the construction is solid.',
  {
    domain: 'ecommerce', // Domein voor topic matching (ecommerce, social_media, reviews)
    useExternalApi: false // Gebruik keyword-gebaseerde extractie
  }
);

console.log(`Gedetecteerd domein: ${topicsResult.domain}`);

// Onderwerpen
topicsResult.topics.forEach(topic => {
  console.log(`${topic.name} (score: ${topic.score})`);
  console.log(`Keywords: ${topic.keywords.join(', ')}`);
});

// Keywords
topicsResult.keywords.forEach(keyword => {
  console.log(`${keyword.term} (score: ${keyword.score})`);
});
```

### Batch Processing

```javascript
// Verwerk meerdere teksten in batch
const texts = [
  'I love this product! It\'s amazing and works perfectly.',
  'This is the worst experience I\'ve ever had. Terrible customer service.',
  'The product arrived on time. It works as described.'
];

const batchResults = await nlpProcessingService.processBatch(texts, 
  async (text) => await nlpProcessingService.processText(text),
  {
    batchSize: 10, // Aantal teksten per batch
    concurrency: 5, // Maximum aantal parallelle verwerkingen
    rateLimit: {
      calls: 10,
      period: 1000 // 10 calls per seconde
    },
    batchPauseMs: 1000 // Pauze tussen batches
  }
);

console.log(`Verwerkt: ${batchResults.length} teksten`);
```

### Verwerken van Scrape Resultaten

```javascript
// Verwerk scrape resultaten met de NLP pipeline
const nlpResults = await nlpProcessingService.processScrapeResults(
  'project-123', // Project ID
  'job-456', // Scrape job ID
  {
    performTopicModeling: true,
    translateTo: 'en',
    saveResults: true
  }
);

console.log(`Verwerkt: ${nlpResults.processed_count} teksten`);
```

## Resultaat Structuur

### Volledige NLP Pipeline Resultaat

```javascript
{
  original_text: 'Dit is de originele tekst.',
  cleaned_text: 'dit is de originele tekst',
  language: 'nl',
  translated_text: 'This is the original text.',
  entities: [
    {
      text: 'originele tekst',
      type: 'MISC',
      start: 11,
      end: 26,
      confidence: 0.8,
      method: 'regex'
    }
  ],
  sentiment: {
    sentiment: 'neutral',
    score: 0.1,
    confidence: 0.7,
    distribution: {
      positive: 0.2,
      negative: 0.1,
      neutral: 0.7
    },
    emotions: {
      joy: 0.2,
      sadness: 0.1,
      anger: 0.0,
      fear: 0.0,
      surprise: 0.1,
      disgust: 0.0,
      trust: 0.3,
      anticipation: 0.1
    },
    aspects: [
      {
        text: 'tekst',
        sentiment: 'neutral',
        score: 0.1,
        sentimentWords: ['originele']
      }
    ]
  },
  topics: [
    {
      name: 'content_quality',
      score: 0.5,
      keywords: ['originele', 'tekst'],
      count: 2
    }
  ],
  metadata: {
    processing_time: '2023-01-20T10:15:30Z',
    options: {
      performTopicModeling: true,
      translateTo: 'en',
      saveResults: true
    }
  }
}
```

## Database Schema

De NLP resultaten worden opgeslagen in de `nlp_results` tabel met de volgende structuur:

```sql
CREATE TABLE nlp_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  scrape_result_id UUID REFERENCES scrape_results(id),
  source_type TEXT,
  source_id TEXT,
  original_text TEXT,
  cleaned_text TEXT,
  language TEXT,
  translated_text TEXT,
  entities JSONB,
  sentiment JSONB,
  topics JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Afhankelijkheden

De NLP Processing Module maakt gebruik van de volgende afhankelijkheden:

- **franc**: Taaldetectie
- **iso-639-1**: ISO taalcode conversie
- **p-throttle**: Rate limiting voor batch processing
- **@supabase/supabase-js**: Database interactie

In een productie-omgeving zou de module ook gebruik kunnen maken van:

- **natural**: NLP toolkit voor Node.js
- **compromise**: Lichtgewicht NLP library
- **sentiment**: Sentiment analyse
- **node-nlp**: Uitgebreide NLP functionaliteit
- **spacy**: Via een API voor geavanceerde NER
- **Google Cloud Natural Language API**: Voor geavanceerde NLP functionaliteit
- **AWS Comprehend**: Voor taaldetectie, entiteiten, sentiment en topics
- **Azure Text Analytics**: Voor sentiment analyse en entiteiten

## Beperkingen

De huidige implementatie heeft de volgende beperkingen:

1. **Mock Implementaties**: Sommige functionaliteit zoals geavanceerde NER en vertaling gebruikt mock implementaties die in een productie-omgeving vervangen moeten worden door echte API calls.

2. **Beperkte Lexicons**: De sentiment lexicons en gazetteers zijn beperkt en moeten uitgebreid worden voor betere resultaten.

3. **Eenvoudige Topic Modeling**: De topic modeling is gebaseerd op keyword matching en niet op geavanceerde algoritmes zoals LDA of BERT.

4. **Taalondersteuning**: Volledige functionaliteit is alleen beschikbaar voor Engels en Nederlands, andere talen hebben beperkte ondersteuning.

## Toekomstige Verbeteringen

1. **Integratie met Externe APIs**: Integreren met Google Cloud Natural Language API, AWS Comprehend of Azure Text Analytics voor geavanceerde NLP functionaliteit.

2. **Verbeterde Topic Modeling**: Implementeren van LDA (Latent Dirichlet Allocation) of BERT-gebaseerde topic modeling.

3. **Uitgebreide Lexicons**: Toevoegen van uitgebreide sentiment lexicons en gazetteers voor meer talen.

4. **Contextual Sentiment**: Verbeteren van sentiment analyse met contextuele informatie en negatie detectie.

5. **Entiteit Linking**: Koppelen van geëxtraheerde entiteiten aan een kennisbank of externe bronnen.

6. **Meertalige Ondersteuning**: Uitbreiden van volledige functionaliteit naar meer talen.

7. **Verbeterde Aspect Extractie**: Implementeren van geavanceerde aspect extractie met dependency parsing.

## Testen

Je kunt de NLP Processing Module testen met het test script:

```bash
node src/services/nlp/test-nlp-processing.js
```

Dit script test de volgende functionaliteit:

1. Tekst normalisatie en schoonmaak
2. Taaldetectie en vertaling
3. Entity recognition
4. Sentiment analyse
5. Topic modeling
6. Volledige NLP pipeline
7. Batch processing
