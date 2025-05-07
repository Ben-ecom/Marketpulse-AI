/**
 * Pain Points en Desires Extraction Service
 *
 * Dit bestand bevat de service voor het identificeren en extraheren van pijnpunten
 * en wensen uit verwerkte tekstgegevens. Het biedt functionaliteit voor het herkennen
 * van probleemstellingen, uitdrukkingen van verlangens, frustratie- en aspiratiepatronen.
 */

const { getSentimentAnalysisService } = require('./sentiment-analysis');

/**
 * Pain Points en Desires Extraction Service klasse
 */
class PainPointsExtractionService {
  constructor() {
    // Sentiment analyse service
    this.sentimentAnalysisService = getSentimentAnalysisService();

    // Patronen voor pijnpunten (probleem statements)
    this.painPointPatterns = {
      nl: [
        // Directe klachten
        /(?:niet|geen)\s+(?:goed|tevreden|blij|gelukkig|fijn)/i,
        /(?:slecht|verschrikkelijk|vreselijk|teleurstellend|frustrerend)/i,
        /(?:probleem|problemen|issue|issues|bug|bugs|fout|fouten)/i,
        /(?:werkt|functioneert)\s+(?:niet|slecht|nauwelijks)/i,
        /(?:moeilijk|lastig|ingewikkeld|complex)/i,
        /(?:traag|langzaam|vertraging)/i,
        /(?:duur|prijzig|te\s+(?:duur|kostbaar))/i,
        /(?:mis|mist|ontbreekt|ontbrekend)/i,
        /(?:kapot|defect|beschadigd)/i,

        // Frustratie uitdrukkingen
        /(?:gefrustreerd|boos|geïrriteerd|erger|ergste)/i,
        /(?:waarom\s+(?:moet|moeten|kan|kunnen|is|zijn))/i,
        /(?:jammer|helaas|spijtig)/i,
        /(?:zou\s+(?:moeten|beter|fijner))/i,

        // Vergelijkingen (negatief)
        /(?:slechter|minder|erger)\s+dan/i,
        /(?:niet\s+zo\s+(?:goed|fijn|prettig))\s+als/i,
      ],

      en: [
        // Direct complaints
        /(?:not|no)\s+(?:good|happy|satisfied|pleased)/i,
        /(?:bad|terrible|awful|disappointing|frustrating)/i,
        /(?:problem|problems|issue|issues|bug|bugs|error|errors)/i,
        /(?:doesn't|does\s+not|didn't|did\s+not)\s+(?:work|function)/i,
        /(?:difficult|hard|complicated|complex)/i,
        /(?:slow|delay|laggy|sluggish)/i,
        /(?:expensive|pricey|costly|overpriced)/i,
        /(?:missing|lacks|lacking|absence)/i,
        /(?:broken|damaged|defective)/i,

        // Frustration expressions
        /(?:frustrated|angry|annoyed|irritated|worst)/i,
        /(?:why\s+(?:do|does|is|are|can't|cannot|won't|will\s+not))/i,
        /(?:unfortunately|sadly|regrettably)/i,
        /(?:should|could|would\s+(?:be|have\s+been))\s+(?:better|easier|nicer)/i,

        // Comparisons (negative)
        /(?:worse|less|poorer)\s+than/i,
        /(?:not\s+as\s+(?:good|nice|pleasant))\s+as/i,
      ],
    };

    // Patronen voor wensen (desires)
    this.desirePatterns = {
      nl: [
        // Directe wensen
        /(?:wil|willen|wens|wensen|verlang|verlangen|hoop|hopen)/i,
        /(?:zou\s+(?:graag|willen|wensen|hopen))/i,
        /(?:had\s+(?:graag|liever))/i,
        /(?:moet|moeten|dient|dienen|hoort|horen)\s+(?:te\s+zijn|te\s+hebben|te\s+doen)/i,

        // Suggesties
        /(?:suggestie|suggesties|voorstel|voorstellen|idee|ideeën)/i,
        /(?:misschien|wellicht|mogelijk|eventueel)/i,
        /(?:kan|kunnen|zou|zouden)\s+(?:beter|fijner|handiger|makkelijker)/i,
        /(?:verbeter|verbeterd|verbetering|verbeteringen)/i,

        // Vergelijkingen (positief)
        /(?:beter|meer|fijner)\s+als/i,
        /(?:zoals|net\s+als|vergelijkbaar\s+met)/i,

        // Toekomstige verwachtingen
        /(?:verwacht|verwachten|hoop|hopen|kijk\s+uit\s+naar|uitkijken\s+naar)/i,
        /(?:in\s+de\s+toekomst|binnenkort|later|volgende\s+keer)/i,
      ],

      en: [
        // Direct desires
        /(?:want|wish|desire|hope|need|needs|looking\s+for)/i,
        /(?:would\s+(?:like|love|prefer|appreciate))/i,
        /(?:should\s+(?:be|have|include|offer))/i,

        // Suggestions
        /(?:suggest|suggestion|suggestions|idea|ideas|recommendation)/i,
        /(?:maybe|perhaps|possibly|potentially)/i,
        /(?:could|can|would|should)\s+(?:be|have)\s+(?:better|easier|nicer)/i,
        /(?:improve|improved|improvement|improvements)/i,

        // Comparisons (positive)
        /(?:better|more|nicer)\s+than/i,
        /(?:like|similar\s+to|same\s+as)/i,

        // Future expectations
        /(?:expect|expecting|hope|hoping|look\s+forward\s+to)/i,
        /(?:in\s+the\s+future|soon|later|next\s+time)/i,
      ],
    };

    // Categorieën voor pijnpunten en wensen
    this.categories = {
      // Algemene categorieën
      general: [
        'usability', 'functionality', 'performance', 'reliability',
        'price', 'quality', 'service', 'support', 'delivery',
        'design', 'features', 'compatibility', 'accessibility',
      ],

      // Domein-specifieke categorieën
      ecommerce: [
        'shipping', 'returns', 'product_quality', 'checkout', 'payment',
        'product_selection', 'product_information', 'website_navigation',
        'customer_service', 'pricing', 'discounts', 'loyalty_program',
      ],

      technology: [
        'user_interface', 'bugs', 'speed', 'features', 'compatibility',
        'installation', 'updates', 'security', 'privacy', 'documentation',
        'learning_curve', 'customization', 'integration',
      ],

      hospitality: [
        'cleanliness', 'comfort', 'amenities', 'staff', 'food_quality',
        'location', 'noise', 'value', 'booking_process', 'check_in',
        'check_out', 'room_service', 'facilities',
      ],
    };

    // Intensiteit indicatoren
    this.intensityIndicators = {
      nl: {
        high: ['zeer', 'erg', 'enorm', 'extreem', 'ontzettend', 'verschrikkelijk', 'vreselijk', 'compleet', 'totaal', 'absoluut'],
        medium: ['behoorlijk', 'redelijk', 'vrij', 'tamelijk', 'best', 'flink'],
        low: ['een beetje', 'enigszins', 'lichtelijk', 'ietwat', 'minimaal'],
      },

      en: {
        high: ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'utterly', 'highly', 'terribly', 'thoroughly'],
        medium: ['quite', 'rather', 'fairly', 'pretty', 'moderately', 'reasonably', 'somewhat'],
        low: ['slightly', 'a bit', 'a little', 'marginally', 'minimally', 'barely'],
      },
    };

    // Frequentie indicatoren
    this.frequencyIndicators = {
      nl: {
        high: ['altijd', 'constant', 'voortdurend', 'steeds', 'telkens', 'elke keer', 'zonder uitzondering'],
        medium: ['vaak', 'regelmatig', 'herhaaldelijk', 'meerdere keren', 'meestal'],
        low: ['soms', 'af en toe', 'incidenteel', 'een enkele keer', 'zelden', 'nauwelijks'],
      },

      en: {
        high: ['always', 'constantly', 'continuously', 'every time', 'without exception', 'invariably'],
        medium: ['often', 'frequently', 'regularly', 'multiple times', 'usually', 'normally'],
        low: ['sometimes', 'occasionally', 'once in a while', 'rarely', 'seldom', 'hardly ever'],
      },
    };
  }

  /**
   * Extraheer pijnpunten en wensen uit tekst
   * @param {String} text - Tekst om te analyseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Geëxtraheerde pijnpunten en wensen
   */
  async extractPainPointsAndDesires(text, options = {}) {
    try {
      // Controleer of text is gedefinieerd en een string is
      if (!text || typeof text !== 'string') {
        console.warn('⚠️ Pain points extractie: Ongeldige tekst input ontvangen', text);
        return {
          painPoints: [],
          desires: [],
          metadata: {
            language: options.language || 'en',
            domain: options.domain || null,
          },
        };
      }

      // Zorg ervoor dat tekst wordt getrimd
      const trimmedText = text.trim();

      if (trimmedText.length === 0) {
        console.warn('⚠️ Pain points extractie: Lege tekst ontvangen');
        return {
          painPoints: [],
          desires: [],
          metadata: {
            language: options.language || 'en',
            domain: options.domain || null,
          },
        };
      }

      // Bepaal taal
      const language = options.language || this.detectLanguage(trimmedText);

      // Verdeel tekst in zinnen
      const sentences = trimmedText.split(/[.!?]\s+/);

      // Extraheer pijnpunten
      const painPoints = await this.extractPainPoints(sentences, language, options);

      // Extraheer wensen
      const desires = await this.extractDesires(sentences, language, options);

      // Categoriseer en rangschik de resultaten
      const categorizedPainPoints = this.categorizeInsights(painPoints, options);
      const categorizedDesires = this.categorizeInsights(desires, options);

      // Bereken frequentie en intensiteit
      const rankedPainPoints = this.rankByFrequencyAndIntensity(categorizedPainPoints, language);
      const rankedDesires = this.rankByFrequencyAndIntensity(categorizedDesires, language);

      return {
        painPoints: rankedPainPoints,
        desires: rankedDesires,
        metadata: {
          language,
          domain: options.domain || null,
          sentenceCount: sentences.length,
          painPointCount: rankedPainPoints.length,
          desireCount: rankedDesires.length,
        },
      };
    } catch (error) {
      console.error('❌ Fout bij extraheren van pijnpunten en wensen:', error);
      return {
        painPoints: [],
        desires: [],
        error: error.message,
        metadata: {
          language: options.language || 'en',
          domain: options.domain || null,
        },
      };
    }
  }

  /**
   * Detecteer de taal van de tekst
   * @param {String} text - Tekst om te analyseren
   * @returns {String} - Gedetecteerde taal (nl of en)
   */
  detectLanguage(text) {
    // Eenvoudige taaldetectie op basis van stopwoorden
    const dutchWords = ['de', 'het', 'een', 'en', 'van', 'in', 'is', 'op', 'dat', 'niet', 'zijn', 'met'];
    const englishWords = ['the', 'a', 'an', 'and', 'of', 'in', 'is', 'on', 'that', 'not', 'are', 'with'];

    const lowerText = text.toLowerCase();
    let dutchCount = 0;
    let englishCount = 0;

    // Tel Nederlandse woorden
    for (const word of dutchWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        dutchCount += matches.length;
      }
    }

    // Tel Engelse woorden
    for (const word of englishWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        englishCount += matches.length;
      }
    }

    // Bepaal taal op basis van tellingen
    return dutchCount > englishCount ? 'nl' : 'en';
  }

  /**
   * Extraheer pijnpunten uit zinnen
   * @param {Array<String>} sentences - Zinnen om te analyseren
   * @param {String} language - Taal van de tekst
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Array<Object>>} - Geëxtraheerde pijnpunten
   */
  async extractPainPoints(sentences, language, options = {}) {
    const painPoints = [];
    const patterns = this.painPointPatterns[language] || this.painPointPatterns.en;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;

      // Controleer op pijnpunt patronen
      for (const pattern of patterns) {
        if (pattern.test(sentence)) {
          // Analyseer sentiment van de zin
          const sentimentResult = await this.sentimentAnalysisService.analyzeSentiment(sentence, {
            language,
            ...options,
          });

          // Pijnpunten hebben meestal een negatief sentiment
          if (sentimentResult.sentiment === 'negative'
              || sentimentResult.score < 0
              || this.containsNegativeKeywords(sentence, language)) {
            // Bepaal intensiteit
            const intensity = this.determineIntensity(sentence, language, sentimentResult);

            // Bepaal frequentie
            const frequency = this.determineFrequency(sentence, language);

            // Extraheer kernwoorden
            const keywords = this.extractKeywords(sentence, language);

            painPoints.push({
              text: sentence,
              sentiment: sentimentResult.sentiment,
              sentimentScore: sentimentResult.score,
              intensity,
              frequency,
              keywords,
              category: null, // Wordt later ingevuld
              index: i,
            });

            // Eén patroon match is genoeg per zin
            break;
          }
        }
      }
    }

    return painPoints;
  }

  /**
   * Extraheer wensen uit zinnen
   * @param {Array<String>} sentences - Zinnen om te analyseren
   * @param {String} language - Taal van de tekst
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Array<Object>>} - Geëxtraheerde wensen
   */
  async extractDesires(sentences, language, options = {}) {
    const desires = [];
    const patterns = this.desirePatterns[language] || this.desirePatterns.en;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (!sentence) continue;

      // Controleer op wens patronen
      for (const pattern of patterns) {
        if (pattern.test(sentence)) {
          // Analyseer sentiment van de zin
          const sentimentResult = await this.sentimentAnalysisService.analyzeSentiment(sentence, {
            language,
            ...options,
          });

          // Wensen kunnen zowel positief als neutraal sentiment hebben
          if (sentimentResult.sentiment !== 'negative'
              || this.containsPositiveKeywords(sentence, language)) {
            // Bepaal intensiteit
            const intensity = this.determineIntensity(sentence, language, sentimentResult);

            // Bepaal frequentie
            const frequency = this.determineFrequency(sentence, language);

            // Extraheer kernwoorden
            const keywords = this.extractKeywords(sentence, language);

            desires.push({
              text: sentence,
              sentiment: sentimentResult.sentiment,
              sentimentScore: sentimentResult.score,
              intensity,
              frequency,
              keywords,
              category: null, // Wordt later ingevuld
              index: i,
            });

            // Eén patroon match is genoeg per zin
            break;
          }
        }
      }
    }

    return desires;
  }

  /**
   * Controleer of tekst negatieve keywords bevat
   * @param {String} text - Tekst om te controleren
   * @param {String} language - Taal van de tekst
   * @returns {Boolean} - True als tekst negatieve keywords bevat
   */
  containsNegativeKeywords(text, language) {
    const negativeKeywords = {
      nl: ['niet', 'geen', 'slecht', 'probleem', 'fout', 'moeilijk', 'lastig', 'traag', 'duur', 'kapot', 'vervelend', 'irritant', 'frustrerend', 'teleurstellend', 'onhandig', 'ingewikkeld', 'onbruikbaar'],
      en: ['not', 'no', 'bad', 'problem', 'error', 'difficult', 'hard', 'slow', 'expensive', 'broken', 'annoying', 'irritating', 'frustrating', 'disappointing', 'inconvenient', 'complicated', 'unusable', 'crashes', 'crash', 'bug', 'bugs', 'issue', 'issues', 'fails', 'failure', 'lost', 'lose'],
    };

    const keywords = negativeKeywords[language] || negativeKeywords.en;
    const lowerText = text.toLowerCase();

    return keywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Controleer of tekst positieve keywords bevat
   * @param {String} text - Tekst om te controleren
   * @param {String} language - Taal van de tekst
   * @returns {Boolean} - True als tekst positieve keywords bevat
   */
  containsPositiveKeywords(text, language) {
    const positiveKeywords = {
      nl: ['goed', 'beter', 'best', 'fijn', 'prettig', 'handig', 'makkelijk', 'snel', 'goedkoop', 'geweldig'],
      en: ['good', 'better', 'best', 'nice', 'pleasant', 'useful', 'easy', 'fast', 'cheap', 'great'],
    };

    const keywords = positiveKeywords[language] || positiveKeywords.en;
    const lowerText = text.toLowerCase();

    return keywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Bepaal de intensiteit van een zin
   * @param {String} sentence - Zin om te analyseren
   * @param {String} language - Taal van de tekst
   * @param {Object} sentimentResult - Sentiment analyse resultaat
   * @returns {String} - Intensiteit (high, medium, low)
   */
  determineIntensity(sentence, language, sentimentResult) {
    const indicators = this.intensityIndicators[language] || this.intensityIndicators.en;
    const lowerSentence = sentence.toLowerCase();

    // Controleer op high intensity indicators
    for (const indicator of indicators.high) {
      if (lowerSentence.includes(indicator)) {
        return 'high';
      }
    }

    // Controleer op medium intensity indicators
    for (const indicator of indicators.medium) {
      if (lowerSentence.includes(indicator)) {
        return 'medium';
      }
    }

    // Controleer op low intensity indicators
    for (const indicator of indicators.low) {
      if (lowerSentence.includes(indicator)) {
        return 'low';
      }
    }

    // Gebruik sentiment score als fallback
    const score = Math.abs(sentimentResult.score || 0);
    if (score > 0.7) return 'high';
    if (score > 0.3) return 'medium';
    return 'low';
  }

  /**
   * Bepaal de frequentie van een zin
   * @param {String} sentence - Zin om te analyseren
   * @param {String} language - Taal van de tekst
   * @returns {String} - Frequentie (high, medium, low, null)
   */
  determineFrequency(sentence, language) {
    const indicators = this.frequencyIndicators[language] || this.frequencyIndicators.en;
    const lowerSentence = sentence.toLowerCase();

    // Controleer op high frequency indicators
    for (const indicator of indicators.high) {
      if (lowerSentence.includes(indicator)) {
        return 'high';
      }
    }

    // Controleer op medium frequency indicators
    for (const indicator of indicators.medium) {
      if (lowerSentence.includes(indicator)) {
        return 'medium';
      }
    }

    // Controleer op low frequency indicators
    for (const indicator of indicators.low) {
      if (lowerSentence.includes(indicator)) {
        return 'low';
      }
    }

    // Geen frequentie indicator gevonden
    return null;
  }

  /**
   * Extraheer kernwoorden uit een zin
   * @param {String} sentence - Zin om te analyseren
   * @param {String} language - Taal van de tekst
   * @returns {Array<String>} - Geëxtraheerde kernwoorden
   */
  extractKeywords(sentence, language) {
    // Verwijder stopwoorden
    const stopwords = {
      nl: ['de', 'het', 'een', 'en', 'van', 'in', 'is', 'op', 'dat', 'niet', 'zijn', 'met', 'voor', 'naar', 'bij', 'ook', 'maar', 'om', 'als', 'dan', 'wat', 'nog', 'wel', 'door', 'nu', 'je', 'mij', 'hij', 'zij', 'wij', 'jullie', 'hun', 'hem', 'haar', 'ons', 'deze', 'dit', 'die', 'ik', 'me', 'mijn', 'jou', 'jouw', 'zich', 'ze', 'zelf', 'te', 'zo', 'al', 'dus', 'daar', 'hier', 'toen', 'hoe', 'wie', 'waar', 'waarom', 'welke', 'welk'],
      en: ['the', 'a', 'an', 'and', 'of', 'in', 'is', 'on', 'that', 'not', 'are', 'with', 'for', 'to', 'at', 'also', 'but', 'as', 'if', 'then', 'what', 'still', 'by', 'now', 'you', 'me', 'he', 'she', 'we', 'they', 'them', 'him', 'her', 'us', 'this', 'these', 'those', 'i', 'my', 'your', 'his', 'our', 'their', 'it', 'its', 'itself', 'too', 'so', 'already', 'thus', 'there', 'here', 'when', 'how', 'who', 'where', 'why', 'which', 'what'],
    };

    const words = sentence.toLowerCase().split(/\s+/);
    const filteredWords = words.filter((word) => {
      // Verwijder leestekens
      const cleanWord = word.replace(/[^\w\s]/g, '');

      // Filter stopwoorden en korte woorden
      return cleanWord.length > 3
             && !(stopwords[language] || stopwords.en).includes(cleanWord);
    });

    // Verwijder duplicaten
    return [...new Set(filteredWords)];
  }

  /**
   * Categoriseer inzichten op basis van keywords
   * @param {Array<Object>} insights - Inzichten om te categoriseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Array<Object>} - Gecategoriseerde inzichten
   */
  categorizeInsights(insights, options = {}) {
    // Bepaal domein
    const domain = options.domain || 'general';

    // Krijg relevante categorieën
    const categories = this.categories[domain] || this.categories.general;

    // Categoriseer inzichten
    for (const insight of insights) {
      // Zoek beste categorie match op basis van keywords
      let bestCategory = null;
      let bestScore = 0;

      for (const category of categories) {
        // Bereken score voor deze categorie
        let score = 0;

        // Check keywords in insight
        for (const keyword of insight.keywords) {
          if (category.includes(keyword) || keyword.includes(category)) {
            score += 2;
          } else {
            // Check voor gedeeltelijke matches
            for (const part of category.split('_')) {
              if (keyword.includes(part) || part.includes(keyword)) {
                score += 1;
                break;
              }
            }
          }
        }

        // Check tekst voor categorie woorden
        const lowerText = insight.text.toLowerCase();
        if (lowerText.includes(category) || category.split('_').some((part) => lowerText.includes(part))) {
          score += 3;
        }

        // Update beste categorie
        if (score > bestScore) {
          bestScore = score;
          bestCategory = category;
        }
      }

      // Wijs categorie toe als er een match is
      if (bestScore > 0) {
        insight.category = bestCategory;
      } else {
        insight.category = 'other';
      }
    }

    return insights;
  }

  /**
   * Rangschik inzichten op basis van frequentie en intensiteit
   * @param {Array<Object>} insights - Inzichten om te rangschikken
   * @param {String} language - Taal van de tekst
   * @returns {Array<Object>} - Gerangschikte inzichten
   */
  rankByFrequencyAndIntensity(insights, language) {
    // Groepeer inzichten per categorie
    const categorizedInsights = {};

    for (const insight of insights) {
      const category = insight.category || 'other';

      if (!categorizedInsights[category]) {
        categorizedInsights[category] = [];
      }

      categorizedInsights[category].push(insight);
    }

    // Bereken scores en rangschik per categorie
    const rankedInsights = [];

    for (const [category, categoryInsights] of Object.entries(categorizedInsights)) {
      // Bereken score voor elk inzicht
      for (const insight of categoryInsights) {
        let score = 0;

        // Score op basis van intensiteit
        if (insight.intensity === 'high') score += 3;
        else if (insight.intensity === 'medium') score += 2;
        else if (insight.intensity === 'low') score += 1;

        // Score op basis van frequentie
        if (insight.frequency === 'high') score += 3;
        else if (insight.frequency === 'medium') score += 2;
        else if (insight.frequency === 'low') score += 1;

        // Score op basis van sentiment
        score += Math.abs(insight.sentimentScore || 0) * 5;

        // Sla score op
        insight.score = parseFloat(score.toFixed(2));
      }

      // Sorteer op score (hoog naar laag)
      categoryInsights.sort((a, b) => b.score - a.score);

      // Voeg toe aan resultaat
      rankedInsights.push(...categoryInsights);
    }

    // Sorteer alle inzichten op score (hoog naar laag)
    rankedInsights.sort((a, b) => b.score - a.score);

    return rankedInsights;
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de PainPointsExtractionService
 * @returns {PainPointsExtractionService} - PainPointsExtractionService instance
 */
const getPainPointsExtractionService = () => {
  if (!instance) {
    instance = new PainPointsExtractionService();
  }
  return instance;
};

module.exports = {
  getPainPointsExtractionService,
};
