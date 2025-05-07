import { logger } from '../utils/logger.js';

/**
 * Service voor geavanceerde tekstanalyse van verzamelde data
 */
export const textAnalysisService = {
  /**
   * Analyseer tekst en extraheer belangrijke informatie
   * @param {string} text - Tekst om te analyseren
   * @param {object} options - Analyse-opties
   * @returns {object} - Resultaten van de analyse
   */
  async analyzeText(text, options = {}) {
    try {
      logger.info('Tekstanalyse gestart');
      
      const results = {
        sentiment: await this.analyzeSentiment(text),
        entities: await this.extractEntities(text),
        keywords: await this.extractKeywords(text),
        topics: await this.identifyTopics(text),
        summary: options.includeSummary ? await this.generateSummary(text) : null
      };
      
      logger.info('Tekstanalyse voltooid');
      return results;
    } catch (error) {
      logger.error(`Fout bij tekstanalyse: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Analyseer sentiment van tekst
   * @param {string} text - Tekst om te analyseren
   * @returns {object} - Sentiment analyse resultaten
   */
  async analyzeSentiment(text) {
    // Eenvoudige sentiment analyse op basis van positieve en negatieve woorden
    const positiveWords = [
      'goed', 'geweldig', 'uitstekend', 'fantastisch', 'prima', 'tevreden', 
      'blij', 'positief', 'aanrader', 'top', 'perfect', 'superieur', 
      'indrukwekkend', 'briljant', 'excellent', 'prachtig', 'mooi'
    ];
    
    const negativeWords = [
      'slecht', 'teleurstellend', 'matig', 'zwak', 'probleem', 'fout', 
      'defect', 'kapot', 'ontevreden', 'negatief', 'afrader', 'verschrikkelijk', 
      'vreselijk', 'waardeloos', 'irritant', 'frustrerend', 'gebrekkig'
    ];
    
    // Normaliseer tekst voor analyse
    const normalizedText = text.toLowerCase();
    const words = normalizedText.split(/\\W+/);
    
    // Tel positieve en negatieve woorden
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) {
        positiveCount++;
      } 
      if (negativeWords.includes(word)) {
        negativeCount++;
      }
    }
    
    // Bereken sentiment score (-1 tot 1)
    const totalWords = words.length || 1; // Voorkom delen door nul
    const positiveScore = positiveCount / totalWords;
    const negativeScore = negativeCount / totalWords;
    const score = positiveScore - negativeScore;
    
    // Bepaal sentiment label
    let label = 'neutral';
    if (score > 0.05) {
      label = 'positive';
    } else if (score < -0.05) {
      label = 'negative';
    }
    
    return {
      score: parseFloat(score.toFixed(2)),
      label,
      positiveScore: parseFloat(positiveScore.toFixed(2)),
      negativeScore: parseFloat(negativeScore.toFixed(2)),
      positiveCount,
      negativeCount
    };
  },
  
  /**
   * Extraheer entiteiten uit tekst
   * @param {string} text - Tekst om te analyseren
   * @returns {Array} - Geëxtraheerde entiteiten
   */
  async extractEntities(text) {
    // Eenvoudige entiteitsextractie op basis van patronen
    const entities = [];
    
    // Personen (namen met hoofdletters)
    const nameRegex = /\\b[A-Z][a-z]+ [A-Z][a-z]+\\b/g;
    const names = text.match(nameRegex) || [];
    
    names.forEach(name => {
      entities.push({
        text: name,
        type: 'PERSON',
        confidence: 0.8
      });
    });
    
    // Locaties (landen en steden)
    const locations = [
      'Nederland', 'Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven',
      'België', 'Brussel', 'Antwerpen', 'Gent', 'Brugge',
      'Duitsland', 'Berlijn', 'München', 'Hamburg', 'Frankfurt',
      'Frankrijk', 'Parijs', 'Lyon', 'Marseille', 'Nice',
      'Spanje', 'Madrid', 'Barcelona', 'Valencia', 'Sevilla'
    ];
    
    locations.forEach(location => {
      if (text.includes(location)) {
        entities.push({
          text: location,
          type: 'LOCATION',
          confidence: 0.9
        });
      }
    });
    
    // Organisaties (woorden eindigend op BV, NV, etc.)
    const orgRegex = /\\b[A-Z][A-Za-z]*(\\s[A-Z][A-Za-z]*)*\\s?(BV|NV|Inc|LLC|Ltd|GmbH)\\b/g;
    const orgs = text.match(orgRegex) || [];
    
    orgs.forEach(org => {
      entities.push({
        text: org,
        type: 'ORGANIZATION',
        confidence: 0.7
      });
    });
    
    return entities;
  },
  
  /**
   * Extraheer keywords uit tekst
   * @param {string} text - Tekst om te analyseren
   * @returns {Array} - Geëxtraheerde keywords
   */
  async extractKeywords(text) {
    // Eenvoudige keyword extractie op basis van woordfrequentie
    const stopwords = [
      'de', 'het', 'een', 'en', 'in', 'van', 'te', 'dat', 'die', 'op', 'zijn',
      'voor', 'met', 'is', 'was', 'aan', 'niet', 'er', 'maar', 'als', 'dan',
      'bij', 'zo', 'door', 'over', 'om', 'ook', 'naar', 'uit', 'nog', 'wel',
      'geen', 'wordt', 'worden', 'heeft', 'hebben', 'had', 'hadden', 'kan', 'kunnen',
      'zal', 'zullen', 'zou', 'zouden', 'moet', 'moeten', 'mocht', 'mochten'
    ];
    
    // Normaliseer tekst
    const normalizedText = text.toLowerCase();
    
    // Split op niet-woord karakters en filter lege strings
    const words = normalizedText.split(/\\W+/).filter(word => word.length > 0);
    
    // Filter stopwoorden en woorden korter dan 3 karakters
    const filteredWords = words.filter(word => 
      !stopwords.includes(word) && word.length >= 3
    );
    
    // Tel woordfrequenties
    const wordFrequency = {};
    filteredWords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    // Converteer naar array en sorteer op frequentie
    const keywords = Object.entries(wordFrequency)
      .map(([text, frequency]) => ({
        text,
        frequency,
        score: frequency / filteredWords.length
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20); // Top 20 keywords
    
    return keywords;
  },
  
  /**
   * Identificeer topics in tekst
   * @param {string} text - Tekst om te analyseren
   * @returns {Array} - Geïdentificeerde topics
   */
  async identifyTopics(text) {
    // Eenvoudige topic identificatie op basis van voorgedefinieerde categorieën
    const topicCategories = [
      {
        name: 'Technologie',
        keywords: ['software', 'hardware', 'app', 'computer', 'smartphone', 'internet', 'digitaal', 'technologie', 'tech']
      },
      {
        name: 'Gezondheid',
        keywords: ['gezondheid', 'medisch', 'ziekte', 'arts', 'ziekenhuis', 'medicijn', 'behandeling', 'symptoom', 'patiënt']
      },
      {
        name: 'Financiën',
        keywords: ['geld', 'financieel', 'bank', 'investering', 'aandeel', 'beurs', 'economie', 'budget', 'kosten', 'prijs']
      },
      {
        name: 'Onderwijs',
        keywords: ['onderwijs', 'school', 'studie', 'leren', 'student', 'docent', 'opleiding', 'cursus', 'kennis']
      },
      {
        name: 'Entertainment',
        keywords: ['film', 'muziek', 'game', 'serie', 'boek', 'entertainment', 'kunst', 'festival', 'concert', 'theater']
      },
      {
        name: 'Reizen',
        keywords: ['reis', 'vakantie', 'hotel', 'vlucht', 'bestemming', 'toerisme', 'accommodatie', 'buitenland']
      },
      {
        name: 'Voeding',
        keywords: ['eten', 'drinken', 'voedsel', 'restaurant', 'recept', 'koken', 'dieet', 'maaltijd', 'ingrediënt']
      },
      {
        name: 'Sport',
        keywords: ['sport', 'wedstrijd', 'team', 'speler', 'competitie', 'training', 'coach', 'fitness', 'voetbal', 'tennis']
      }
    ];
    
    // Normaliseer tekst
    const normalizedText = text.toLowerCase();
    
    // Bereken scores voor elke categorie
    const topicScores = topicCategories.map(category => {
      let score = 0;
      let matchedKeywords = [];
      
      category.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = (normalizedText.match(regex) || []).length;
        
        if (matches > 0) {
          score += matches;
          matchedKeywords.push({
            keyword,
            count: matches
          });
        }
      });
      
      return {
        name: category.name,
        score,
        matchedKeywords
      };
    });
    
    // Filter topics met score > 0 en sorteer op score
    const relevantTopics = topicScores
      .filter(topic => topic.score > 0)
      .sort((a, b) => b.score - a.score);
    
    return relevantTopics;
  },
  
  /**
   * Genereer een samenvatting van tekst
   * @param {string} text - Tekst om samen te vatten
   * @returns {string} - Gegenereerde samenvatting
   */
  async generateSummary(text) {
    // Eenvoudige samenvatting op basis van belangrijke zinnen
    // Split tekst in zinnen
    const sentences = text.split(/[.!?]+/).filter(sentence => 
      sentence.trim().length > 10
    );
    
    if (sentences.length === 0) {
      return '';
    }
    
    // Extraheer keywords uit de tekst
    const keywords = await this.extractKeywords(text);
    const keywordTexts = keywords.map(k => k.text);
    
    // Score zinnen op basis van keyword voorkomen
    const scoredSentences = sentences.map(sentence => {
      const normalizedSentence = sentence.toLowerCase();
      let score = 0;
      
      keywordTexts.forEach(keyword => {
        if (normalizedSentence.includes(keyword)) {
          score += 1;
        }
      });
      
      // Bonus voor zinnen aan het begin of einde
      const index = sentences.indexOf(sentence);
      if (index === 0 || index === sentences.length - 1) {
        score += 0.5;
      }
      
      return {
        sentence: sentence.trim(),
        score
      };
    });
    
    // Sorteer zinnen op score
    const sortedSentences = [...scoredSentences].sort((a, b) => b.score - a.score);
    
    // Selecteer top zinnen (max 3 of 30% van de tekst)
    const numSentences = Math.min(3, Math.ceil(sentences.length * 0.3));
    const topSentences = sortedSentences.slice(0, numSentences);
    
    // Sorteer terug in originele volgorde
    const orderedTopSentences = topSentences.sort((a, b) => 
      sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence)
    );
    
    // Combineer tot samenvatting
    const summary = orderedTopSentences.map(s => s.sentence).join('. ');
    
    return summary;
  },
  
  /**
   * Analyseer een collectie van tekstuele items
   * @param {Array} textItems - Array van tekstuele items
   * @param {object} options - Analyse-opties
   * @returns {object} - Resultaten van de collectie-analyse
   */
  async analyzeTextCollection(textItems, options = {}) {
    try {
      logger.info(`Tekstcollectie-analyse gestart voor ${textItems.length} items`);
      
      // Analyseer elk item individueel
      const individualAnalyses = [];
      for (const item of textItems) {
        const itemText = item.content || item.text || '';
        if (itemText.length === 0) continue;
        
        const analysis = await this.analyzeText(itemText);
        individualAnalyses.push({
          itemId: item.id,
          analysis
        });
      }
      
      // Bereken gemiddeld sentiment
      const sentiments = individualAnalyses.map(item => item.analysis.sentiment.score);
      const averageSentiment = sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length;
      
      // Aggregeer keywords
      const allKeywords = {};
      individualAnalyses.forEach(item => {
        item.analysis.keywords.forEach(keyword => {
          if (allKeywords[keyword.text]) {
            allKeywords[keyword.text].frequency += keyword.frequency;
            allKeywords[keyword.text].count += 1;
          } else {
            allKeywords[keyword.text] = {
              text: keyword.text,
              frequency: keyword.frequency,
              count: 1
            };
          }
        });
      });
      
      // Converteer geaggregeerde keywords naar array en sorteer
      const aggregatedKeywords = Object.values(allKeywords)
        .map(keyword => ({
          ...keyword,
          score: keyword.count / individualAnalyses.length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 keywords
      
      // Aggregeer topics
      const allTopics = {};
      individualAnalyses.forEach(item => {
        item.analysis.topics.forEach(topic => {
          if (allTopics[topic.name]) {
            allTopics[topic.name].score += topic.score;
            allTopics[topic.name].count += 1;
          } else {
            allTopics[topic.name] = {
              name: topic.name,
              score: topic.score,
              count: 1
            };
          }
        });
      });
      
      // Converteer geaggregeerde topics naar array en sorteer
      const aggregatedTopics = Object.values(allTopics)
        .map(topic => ({
          ...topic,
          relevance: topic.count / individualAnalyses.length
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10 topics
      
      // Aggregeer entiteiten
      const allEntities = {};
      individualAnalyses.forEach(item => {
        item.analysis.entities.forEach(entity => {
          const key = `${entity.text}-${entity.type}`;
          if (allEntities[key]) {
            allEntities[key].count += 1;
          } else {
            allEntities[key] = {
              text: entity.text,
              type: entity.type,
              count: 1
            };
          }
        });
      });
      
      // Converteer geaggregeerde entiteiten naar array en sorteer
      const aggregatedEntities = Object.values(allEntities)
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 entiteiten
      
      // Genereer overall samenvatting als gevraagd
      let summary = null;
      if (options.includeSummary) {
        // Combineer de top 10 teksten op basis van sentiment (5 meest positief, 5 meest negatief)
        const sortedByPositiveSentiment = [...individualAnalyses]
          .sort((a, b) => b.analysis.sentiment.score - a.analysis.sentiment.score);
        
        const topPositive = sortedByPositiveSentiment.slice(0, 5);
        const topNegative = sortedByPositiveSentiment.slice(-5).reverse();
        
        const representativeTexts = [...topPositive, ...topNegative]
          .map(item => {
            const source = textItems.find(t => t.id === item.itemId);
            return source ? (source.content || source.text || '') : '';
          })
          .filter(text => text.length > 0)
          .join(' ');
        
        summary = await this.generateSummary(representativeTexts);
      }
      
      logger.info('Tekstcollectie-analyse voltooid');
      
      return {
        itemCount: individualAnalyses.length,
        sentiment: {
          averageScore: parseFloat(averageSentiment.toFixed(2)),
          distribution: {
            positive: sentiments.filter(s => s > 0.05).length,
            neutral: sentiments.filter(s => s >= -0.05 && s <= 0.05).length,
            negative: sentiments.filter(s => s < -0.05).length
          }
        },
        keywords: aggregatedKeywords,
        topics: aggregatedTopics,
        entities: aggregatedEntities,
        summary
      };
    } catch (error) {
      logger.error(`Fout bij tekstcollectie-analyse: ${error.message}`);
      throw error;
    }
  }
};

export default textAnalysisService;