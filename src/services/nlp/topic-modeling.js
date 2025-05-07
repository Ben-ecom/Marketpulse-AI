/**
 * Topic Modeling Service
 *
 * Dit bestand bevat de service voor topic modeling.
 * Het biedt functionaliteit voor het extraheren van onderwerpen uit tekst
 * en het identificeren van sleutelwoorden en thema's.
 */

const { getTextCleaningService } = require('./text-cleaning');

/**
 * Topic Modeling Service klasse
 */
class TopicModelingService {
  constructor() {
    this.textCleaningService = getTextCleaningService();

    // Voorgedefinieerde onderwerpen voor verschillende domeinen
    this.domainTopics = {
      ecommerce: [
        { name: 'product_quality', keywords: ['quality', 'durable', 'sturdy', 'material', 'construction', 'build', 'made', 'solid', 'cheap', 'flimsy'] },
        { name: 'customer_service', keywords: ['service', 'support', 'helpful', 'responsive', 'assistance', 'staff', 'representative', 'agent', 'contact', 'response'] },
        { name: 'shipping', keywords: ['shipping', 'delivery', 'arrived', 'package', 'box', 'shipment', 'carrier', 'tracking', 'shipped', 'postage'] },
        { name: 'price_value', keywords: ['price', 'value', 'worth', 'expensive', 'cheap', 'affordable', 'cost', 'priced', 'overpriced', 'bargain'] },
        { name: 'usability', keywords: ['easy', 'simple', 'intuitive', 'difficult', 'complicated', 'user-friendly', 'confusing', 'straightforward', 'complex', 'learning curve'] },
      ],
      social_media: [
        { name: 'engagement', keywords: ['like', 'comment', 'share', 'follow', 'engagement', 'viral', 'trending', 'popular', 'reach', 'impression'] },
        { name: 'content_quality', keywords: ['content', 'post', 'video', 'photo', 'quality', 'creative', 'original', 'authentic', 'fake', 'clickbait'] },
        { name: 'platform_features', keywords: ['feature', 'update', 'interface', 'app', 'website', 'functionality', 'design', 'layout', 'navigation', 'algorithm'] },
        { name: 'privacy_security', keywords: ['privacy', 'security', 'data', 'information', 'personal', 'tracking', 'surveillance', 'breach', 'hack', 'protection'] },
        { name: 'community', keywords: ['community', 'group', 'connection', 'network', 'friend', 'follower', 'member', 'audience', 'fan', 'subscriber'] },
      ],
      reviews: [
        { name: 'positive_experience', keywords: ['excellent', 'amazing', 'great', 'love', 'perfect', 'best', 'wonderful', 'fantastic', 'outstanding', 'superb'] },
        { name: 'negative_experience', keywords: ['terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'disappointing', 'disappointed', 'waste', 'regret'] },
        { name: 'recommendation', keywords: ['recommend', 'suggestion', 'advise', 'recommendation', 'suggested', 'advice', 'suggest', 'recommended', 'referral', 'endorsement'] },
        { name: 'comparison', keywords: ['better', 'worse', 'compared', 'comparison', 'alternative', 'competitor', 'similar', 'difference', 'versus', 'competition'] },
        { name: 'expectation', keywords: ['expected', 'expectation', 'anticipate', 'hope', 'thought', 'assume', 'surprise', 'unexpected', 'exceed', 'disappoint'] },
      ],
    };
  }

  /**
   * Extraheer onderwerpen uit tekst
   * @param {String} text - Tekst om te analyseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Geëxtraheerde onderwerpen
   */
  async extractTopics(text, options = {}) {
    try {
      if (!text) {
        return { topics: [] };
      }

      // Bepaal welke methode te gebruiken
      if (options.useExternalApi) {
        // In een productie-omgeving zou je hier een externe topic modeling API aanroepen
        return await this.mockExternalTopicModeling(text, options);
      }
      // Gebruik keyword-gebaseerde topic extractie
      return await this.keywordBasedTopicExtraction(text, options);
    } catch (error) {
      console.error('❌ Fout bij topic extractie:', error);
      return { topics: [], error: error.message };
    }
  }

  /**
   * Keyword-gebaseerde topic extractie
   * @param {String} text - Tekst om te analyseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Geëxtraheerde onderwerpen
   */
  async keywordBasedTopicExtraction(text, options = {}) {
    // Schoonmaak en tokenize tekst
    const cleanedText = await this.textCleaningService.cleanText(text, {
      removeStopwords: true,
      lowercase: true,
    });

    const tokens = this.textCleaningService.tokenize(cleanedText);

    // Bereken term frequenties
    const termFrequencies = this.calculateTermFrequencies(tokens);

    // Bepaal domein voor topic matching
    const domain = options.domain || this.detectDomain(text);
    const domainTopics = this.domainTopics[domain] || this.combineDomainTopics();

    // Match tokens met domein onderwerpen
    const topicScores = {};

    for (const topic of domainTopics) {
      topicScores[topic.name] = {
        score: 0,
        keywords: [],
        count: 0,
      };

      for (const keyword of topic.keywords) {
        const keywordTokens = keyword.split(' ');
        let found = false;

        // Controleer op exacte matches
        if (keywordTokens.length === 1) {
          const token = keywordTokens[0];
          if (termFrequencies[token]) {
            topicScores[topic.name].score += termFrequencies[token];
            topicScores[topic.name].count += termFrequencies[token];
            topicScores[topic.name].keywords.push(token);
            found = true;
          }
        } else {
          // Controleer op phrase matches (eenvoudige implementatie)
          const phrase = keywordTokens.join(' ');
          if (cleanedText.includes(phrase)) {
            topicScores[topic.name].score += keywordTokens.length * 2; // Geef hogere score aan phrases
            topicScores[topic.name].count += 1;
            topicScores[topic.name].keywords.push(phrase);
            found = true;
          }
        }

        // Controleer op gedeeltelijke matches
        if (!found) {
          for (const token of keywordTokens) {
            if (termFrequencies[token]) {
              topicScores[topic.name].score += termFrequencies[token] * 0.5; // Geef lagere score aan gedeeltelijke matches
              topicScores[topic.name].count += termFrequencies[token];
              topicScores[topic.name].keywords.push(token);
            }
          }
        }
      }
    }

    // Extraheer ook belangrijke n-grams
    const nGrams = this.extractNGrams(tokens, 2, 3);
    const topNGrams = this.getTopNGrams(nGrams, 10);

    // Extraheer ook keywords op basis van TF-IDF (gesimuleerd)
    const keywords = this.extractKeywords(termFrequencies, 15);

    // Sorteer onderwerpen op score
    const sortedTopics = Object.entries(topicScores)
      .map(([name, data]) => ({
        name,
        score: data.score,
        keywords: [...new Set(data.keywords)], // Verwijder duplicaten
        count: data.count,
      }))
      .filter((topic) => topic.score > 0)
      .sort((a, b) => b.score - a.score);

    return {
      topics: sortedTopics.slice(0, 5), // Top 5 onderwerpen
      keywords,
      ngrams: topNGrams,
      domain,
    };
  }

  /**
   * Mock externe topic modeling API (in productie vervangen door echte API call)
   * @param {String} text - Tekst om te analyseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Geëxtraheerde onderwerpen
   */
  async mockExternalTopicModeling(text, options = {}) {
    // In een productie-omgeving zou je hier een externe topic modeling API aanroepen
    console.log(`🔍 Mock externe topic modeling voor: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

    // Simuleer een vertraging om een API call na te bootsen
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Gebruik de keyword-gebaseerde methode als fallback
    return await this.keywordBasedTopicExtraction(text, options);
  }

  /**
   * Bereken term frequenties voor tokens
   * @param {Array<String>} tokens - Array van tokens
   * @returns {Object} - Term frequenties
   */
  calculateTermFrequencies(tokens) {
    const termFrequencies = {};

    for (const token of tokens) {
      if (token.length < 2) continue; // Skip te korte tokens

      if (!termFrequencies[token]) {
        termFrequencies[token] = 0;
      }

      termFrequencies[token]++;
    }

    return termFrequencies;
  }

  /**
   * Extraheer n-grams uit tokens
   * @param {Array<String>} tokens - Array van tokens
   * @param {Number} minSize - Minimale n-gram grootte
   * @param {Number} maxSize - Maximale n-gram grootte
   * @returns {Object} - N-gram frequenties
   */
  extractNGrams(tokens, minSize = 2, maxSize = 3) {
    const nGrams = {};

    for (let size = minSize; size <= maxSize; size++) {
      for (let i = 0; i <= tokens.length - size; i++) {
        const nGram = tokens.slice(i, i + size).join(' ');

        if (!nGrams[nGram]) {
          nGrams[nGram] = 0;
        }

        nGrams[nGram]++;
      }
    }

    return nGrams;
  }

  /**
   * Krijg top n-grams op basis van frequentie
   * @param {Object} nGrams - N-gram frequenties
   * @param {Number} limit - Maximum aantal n-grams om te retourneren
   * @returns {Array<Object>} - Top n-grams
   */
  getTopNGrams(nGrams, limit = 10) {
    return Object.entries(nGrams)
      .map(([ngram, frequency]) => ({ ngram, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  /**
   * Extraheer keywords op basis van term frequenties (gesimuleerde TF-IDF)
   * @param {Object} termFrequencies - Term frequenties
   * @param {Number} limit - Maximum aantal keywords om te retourneren
   * @returns {Array<Object>} - Top keywords
   */
  extractKeywords(termFrequencies, limit = 15) {
    return Object.entries(termFrequencies)
      .map(([term, frequency]) => ({ term, score: frequency * (1 + Math.random() * 0.5) })) // Simuleer IDF component
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Detecteer domein op basis van tekst inhoud
   * @param {String} text - Tekst om te analyseren
   * @returns {String} - Gedetecteerd domein
   */
  detectDomain(text) {
    const lowerText = text.toLowerCase();

    // Eenvoudige heuristiek voor domein detectie
    const domainKeywords = {
      ecommerce: ['product', 'order', 'shipping', 'delivery', 'purchase', 'bought', 'seller', 'shop', 'store', 'amazon', 'ebay', 'price'],
      social_media: ['post', 'like', 'share', 'follow', 'friend', 'profile', 'comment', 'instagram', 'facebook', 'twitter', 'tiktok', 'social'],
      reviews: ['review', 'rating', 'recommend', 'experience', 'star', 'opinion', 'feedback', 'trustpilot', 'yelp', 'testimonial'],
    };

    const domainScores = {};

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      domainScores[domain] = 0;

      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          domainScores[domain]++;
        }
      }
    }

    // Bepaal domein met hoogste score
    let maxScore = 0;
    let detectedDomain = 'reviews'; // Default domein

    for (const [domain, score] of Object.entries(domainScores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedDomain = domain;
      }
    }

    return detectedDomain;
  }

  /**
   * Combineer alle domein onderwerpen voor algemene topic extractie
   * @returns {Array<Object>} - Gecombineerde domein onderwerpen
   */
  combineDomainTopics() {
    const combinedTopics = [];

    for (const topics of Object.values(this.domainTopics)) {
      combinedTopics.push(...topics);
    }

    return combinedTopics;
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de TopicModelingService
 * @returns {TopicModelingService} - TopicModelingService instance
 */
const getTopicModelingService = () => {
  if (!instance) {
    instance = new TopicModelingService();
  }
  return instance;
};

module.exports = {
  getTopicModelingService,
};
