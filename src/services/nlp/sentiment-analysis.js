/**
 * Sentiment Analysis Service
 *
 * Dit bestand bevat de service voor sentiment analyse.
 * Het biedt functionaliteit voor het analyseren van het sentiment (positief, negatief, neutraal)
 * in tekst en het extraheren van emoties en aspecten.
 *
 * Functionaliteiten:
 * - Multi-level sentiment classificatie (positief/negatief/neutraal)
 * - Emotionele intensiteit scoring
 * - Aspect-gebaseerde sentiment analyse
 * - Contextual sentiment detectie
 * - Ondersteuning voor meerdere talen
 */

/**
 * Sentiment Analysis Service klasse
 */
class SentimentAnalysisService {
  constructor() {
    // Sentiment lexicons voor verschillende talen
    this.lexicons = {
      en: this.loadEnglishLexicon(),
      nl: this.loadDutchLexicon(),
      de: this.loadGermanLexicon(),
      fr: this.loadFrenchLexicon(),
      es: this.loadSpanishLexicon(),
      // Voeg meer talen toe indien nodig
    };

    // Emotie categorieën volgens Plutchik's wiel van emoties
    this.emotions = [
      'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation',
      // Secundaire emoties
      'love', 'submission', 'awe', 'disappointment', 'remorse', 'contempt', 'aggressiveness', 'optimism',
    ];

    // Intensifiers en negators
    this.intensifiers = {
      en: new Set(['very', 'extremely', 'really', 'so', 'too', 'absolutely', 'completely', 'totally', 'highly', 'incredibly', 'tremendously']),
      nl: new Set(['heel', 'erg', 'zeer', 'enorm', 'ontzettend', 'absoluut', 'compleet', 'totaal', 'uiterst', 'buitengewoon']),
      de: new Set(['sehr', 'extrem', 'wirklich', 'absolut', 'komplett', 'total', 'äußerst', 'unglaublich']),
      fr: new Set(['très', 'extrêmement', 'vraiment', 'absolument', 'complètement', 'totalement', 'incroyablement']),
      es: new Set(['muy', 'extremadamente', 'realmente', 'absolutamente', 'completamente', 'totalmente', 'increíblemente']),
    };

    this.negators = {
      en: new Set(['not', 'no', 'never', 'neither', 'nor', 'none', 'nothing', 'nowhere', 'hardly', 'scarcely', 'barely', 'without', 'lacks', 'lacking']),
      nl: new Set(['niet', 'geen', 'nooit', 'nergens', 'niemand', 'niets', 'noch', 'nauwelijks', 'zonder', 'ontbreekt', 'ontbrekend']),
      de: new Set(['nicht', 'kein', 'nie', 'niemals', 'weder', 'noch', 'nichts', 'nirgendwo', 'kaum', 'ohne']),
      fr: new Set(['ne', 'pas', 'jamais', 'aucun', 'ni', 'rien', 'nulle part', 'à peine', 'sans']),
      es: new Set(['no', 'nunca', 'ni', 'nada', 'ningún', 'ninguno', 'en ninguna parte', 'apenas', 'sin']),
    };

    // Sentiment classificatie niveaus
    this.sentimentLevels = {
      positive: ['slightly positive', 'moderately positive', 'very positive', 'extremely positive'],
      negative: ['slightly negative', 'moderately negative', 'very negative', 'extremely negative'],
      neutral: ['neutral'],
    };

    // Sentiment intensiteit drempels
    this.intensityThresholds = {
      positive: [0.2, 0.5, 0.8, 1.0], // Drempels voor verschillende positieve niveaus
      negative: [-0.2, -0.5, -0.8, -1.0], // Drempels voor verschillende negatieve niveaus
    };

    // Context patronen voor sentiment analyse
    this.contextPatterns = {
      contrast: [
        // Engels
        'but', 'however', 'although', 'though', 'nevertheless', 'nonetheless', 'yet', 'still', 'despite', 'in spite of',
        // Nederlands
        'maar', 'echter', 'hoewel', 'toch', 'desondanks', 'niettemin', 'ondanks',
      ],
      condition: [
        // Engels
        'if', 'unless', 'provided that', 'assuming that', 'as long as', 'in case',
        // Nederlands
        'als', 'tenzij', 'mits', 'aangenomen dat', 'zolang', 'in het geval dat',
      ],
      emphasis: [
        // Engels
        'especially', 'particularly', 'notably', 'significantly', 'indeed', 'certainly',
        // Nederlands
        'vooral', 'met name', 'in het bijzonder', 'zeker', 'inderdaad',
      ],
    };

    // Domein-specifieke sentiment lexicons
    this.domainLexicons = {
      ecommerce: this.loadEcommerceLexicon(),
      finance: this.loadFinanceLexicon(),
      healthcare: this.loadHealthcareLexicon(),
      hospitality: this.loadHospitalityLexicon(),
      technology: this.loadTechnologyLexicon(),
    };
  }

  /**
   * Analyseer sentiment in tekst
   * @param {String} text - Tekst om te analyseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Sentiment analyse resultaat
   */
  async analyzeSentiment(text, options = {}) {
    try {
      // Controleer of text is gedefinieerd en een string is
      if (!text || typeof text !== 'string') {
        console.warn('⚠️ Sentiment analyse: Ongeldige tekst input ontvangen', text);
        return {
          sentiment: 'neutral',
          intensityLevel: 'neutral',
          score: 0,
          confidence: 0.5,
          emotions: {},
          aspects: [],
          sentences: [],
          domain: null,
          metadata: {
            wordCount: 0,
            positiveCount: 0,
            negativeCount: 0,
            language: options.language || 'en',
          },
        };
      }

      // Zorg ervoor dat tekst wordt getrimd
      const trimmedText = text.trim();

      if (trimmedText.length === 0) {
        console.warn('⚠️ Sentiment analyse: Lege tekst ontvangen');
        return {
          sentiment: 'neutral',
          intensityLevel: 'neutral',
          score: 0,
          confidence: 0.5,
          emotions: {},
          aspects: [],
          sentences: [],
          domain: null,
          metadata: {
            wordCount: 0,
            positiveCount: 0,
            negativeCount: 0,
            language: options.language || 'en',
          },
        };
      }

      // Bepaal welke methode te gebruiken
      if (options.useExternalApi) {
        // In een productie-omgeving zou je hier een externe sentiment API aanroepen
        return await this.mockExternalSentimentAnalysis(trimmedText, options);
      }
      // Gebruik lexicon-gebaseerde sentiment analyse
      return await this.lexiconBasedSentimentAnalysis(trimmedText, options);
    } catch (error) {
      console.error('❌ Fout bij sentiment analyse:', error);
      return {
        sentiment: 'neutral',
        intensityLevel: 'neutral',
        score: 0,
        confidence: 0.5,
        emotions: {},
        aspects: [],
        sentences: [],
        domain: null,
        error: error.message,
        metadata: {
          wordCount: 0,
          positiveCount: 0,
          negativeCount: 0,
          language: options.language || 'en',
        },
      };
    }
  }

  /**
   * Lexicon-gebaseerde sentiment analyse
   * @param {String} text - Tekst om te analyseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Sentiment analyse resultaat
   */
  async lexiconBasedSentimentAnalysis(text, options = {}) {
    // Controleer of text is gedefinieerd
    if (!text) {
      return {
        sentiment: 'neutral',
        intensityLevel: 'neutral',
        score: 0,
        confidence: 0.5,
        emotions: {},
        aspects: [],
        sentences: [],
        domain: null,
        metadata: {
          wordCount: 0,
          positiveCount: 0,
          negativeCount: 0,
          language: options.language || 'en',
        },
      };
    }

    // Bepaal taal
    const language = options.language || 'en';
    const lexicon = this.lexicons[language] || this.lexicons.en;
    const intensifiers = this.intensifiers[language] || this.intensifiers.en;
    const negators = this.negators[language] || this.negators.en;

    // Bepaal domein-specifiek lexicon indien van toepassing
    const domain = options.domain || this.detectDomain(text);
    const domainLexicon = domain && this.domainLexicons[domain] ? this.domainLexicons[domain] : {};

    // Combineer algemeen lexicon met domein-specifiek lexicon
    const combinedLexicon = { ...lexicon, ...domainLexicon };

    // Tokenize tekst en behoud originele case voor entiteiten
    const originalTokens = text.split(/\s+/);
    const tokens = text.toLowerCase().split(/\s+/);

    // Verdeel tekst in zinnen voor contextuele analyse
    const sentences = text.split(/[.!?]\s+/);

    // Analyseer sentiment
    let score = 0;
    let wordCount = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let lastMultiplier = 1;
    let intensityMultiplier = 1;

    // Emotie scores
    const emotions = {};
    this.emotions.forEach((emotion) => {
      emotions[emotion] = 0;
    });

    // Aspect-gebaseerd sentiment
    const aspects = [];
    const aspectCandidates = this.extractAspectCandidates(text);

    // Contextuele sentiment analyse per zin
    const sentenceResults = [];

    for (const sentence of sentences) {
      if (!sentence.trim()) continue;

      const sentenceTokens = sentence.toLowerCase().split(/\s+/);
      let sentenceScore = 0;
      let sentenceWordCount = 0;

      // Detecteer context patronen in de zin
      const hasContrastPattern = this.contextPatterns.contrast.some((pattern) => sentenceTokens.includes(pattern));
      const hasConditionPattern = this.contextPatterns.condition.some((pattern) => sentenceTokens.includes(pattern));
      const hasEmphasisPattern = this.contextPatterns.emphasis.some((pattern) => sentenceTokens.includes(pattern));

      // Pas contextuele multipliers toe
      let contextMultiplier = 1;
      if (hasEmphasisPattern) contextMultiplier = 1.5;

      // Verwerk tokens in de zin
      for (let i = 0; i < sentenceTokens.length; i++) {
        const token = sentenceTokens[i];

        // Controleer op intensifiers
        if (intensifiers.has(token)) {
          intensityMultiplier = 2;
          continue;
        }

        // Controleer op negators
        if (negators.has(token)) {
          lastMultiplier = -1;
          continue;
        }

        // Controleer op sentiment woorden
        if (combinedLexicon[token]) {
          const sentimentInfo = combinedLexicon[token];

          // Bereken token score met alle multipliers
          const tokenScore = sentimentInfo.score * lastMultiplier * intensityMultiplier * contextMultiplier;

          // Pas contrast pattern toe indien nodig
          let adjustedTokenScore = tokenScore;
          if (hasContrastPattern) {
            // Zoek positie van contrast woord
            const contrastIndex = sentenceTokens.findIndex((t) => this.contextPatterns.contrast.includes(t));

            // Pas score aan op basis van positie ten opzichte van contrast woord
            if (contrastIndex !== -1) {
              if (i < contrastIndex) {
                // Voor contrast woord: verminder impact
                adjustedTokenScore = tokenScore * 0.5;
              } else if (i > contrastIndex) {
                // Na contrast woord: verhoog impact
                adjustedTokenScore = tokenScore * 1.5;
              }
            }
          }

          // Pas conditional pattern toe indien nodig
          if (hasConditionPattern && tokenScore !== 0) {
            // Zoek positie van conditie woord
            const conditionIndex = sentenceTokens.findIndex((t) => this.contextPatterns.condition.includes(t));

            // Pas score aan op basis van positie ten opzichte van conditie woord
            if (conditionIndex !== -1 && i > conditionIndex) {
              // Na conditie woord: verminder zekerheid
              adjustedTokenScore = tokenScore * 0.7;
            }
          }

          sentenceScore += adjustedTokenScore;
          sentenceWordCount++;

          score += adjustedTokenScore;
          wordCount++;

          if (adjustedTokenScore > 0) {
            positiveCount++;
          } else if (adjustedTokenScore < 0) {
            negativeCount++;
          }

          // Update emotie scores
          if (sentimentInfo.emotions) {
            Object.entries(sentimentInfo.emotions).forEach(([emotion, value]) => {
              if (emotions[emotion] !== undefined) {
                emotions[emotion] += value * Math.abs(lastMultiplier) * intensityMultiplier;
              }
            });
          }

          // Reset multipliers na gebruik
          lastMultiplier = 1;
          intensityMultiplier = 1;
        }
      }

      // Bereken gemiddelde sentiment score voor de zin
      const sentenceAvgScore = sentenceWordCount > 0 ? sentenceScore / sentenceWordCount : 0;

      // Bepaal sentiment label voor de zin
      let sentenceSentiment = 'neutral';
      let sentenceConfidence = 0.5;

      if (sentenceAvgScore > 0.1) {
        sentenceSentiment = 'positive';
        sentenceConfidence = 0.5 + Math.min(sentenceAvgScore / 2, 0.45);
      } else if (sentenceAvgScore < -0.1) {
        sentenceSentiment = 'negative';
        sentenceConfidence = 0.5 + Math.min(Math.abs(sentenceAvgScore) / 2, 0.45);
      }

      // Voeg zin resultaat toe
      sentenceResults.push({
        text: sentence.trim(),
        sentiment: sentenceSentiment,
        score: parseFloat(sentenceAvgScore.toFixed(2)),
        confidence: parseFloat(sentenceConfidence.toFixed(2)),
        hasContrast: hasContrastPattern,
        hasCondition: hasConditionPattern,
        hasEmphasis: hasEmphasisPattern,
      });
    }

    // Bereken gemiddelde sentiment score voor de hele tekst
    const avgScore = wordCount > 0 ? score / wordCount : 0;

    // Bepaal sentiment label en intensiteit
    let sentiment = 'neutral';
    let intensityLevel = 'neutral';
    let confidence = 0.5;

    if (avgScore > 0) {
      sentiment = 'positive';
      confidence = 0.5 + Math.min(avgScore / 2, 0.45);

      // Bepaal intensiteitsniveau voor positief sentiment
      for (let i = 0; i < this.intensityThresholds.positive.length; i++) {
        if (avgScore <= this.intensityThresholds.positive[i]) {
          intensityLevel = this.sentimentLevels.positive[i];
          break;
        }
      }
    } else if (avgScore < 0) {
      sentiment = 'negative';
      confidence = 0.5 + Math.min(Math.abs(avgScore) / 2, 0.45);

      // Bepaal intensiteitsniveau voor negatief sentiment
      for (let i = 0; i < this.intensityThresholds.negative.length; i++) {
        if (avgScore >= this.intensityThresholds.negative[i]) {
          intensityLevel = this.sentimentLevels.negative[i];
          break;
        }
      }
    }

    // Normaliseer emotie scores
    const totalEmotionScore = Object.values(emotions).reduce((sum, val) => sum + val, 0);
    if (totalEmotionScore > 0) {
      Object.keys(emotions).forEach((emotion) => {
        emotions[emotion] = parseFloat((emotions[emotion] / totalEmotionScore).toFixed(2));
      });
    }

    // Sorteer emoties op score (hoogste eerst)
    const sortedEmotions = Object.entries(emotions)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [emotion, score]) => {
        obj[emotion] = score;
        return obj;
      }, {});

    // Bereken aspect-gebaseerd sentiment met verbeterde context
    for (const aspect of aspectCandidates) {
      // Zoek naar sentiment woorden in de buurt van het aspect
      const aspectTokens = aspect.term.toLowerCase().split(/\s+/);
      const aspectSentiment = {};

      // Bepaal in welke zin het aspect voorkomt
      let aspectSentence = '';
      let sentenceIndex = -1;
      let tokenPosition = 0;
      let currentPosition = 0;

      for (let i = 0; i < sentences.length; i++) {
        const sentenceTokenCount = sentences[i].split(/\s+/).length;
        if (currentPosition <= aspect.position && aspect.position < currentPosition + sentenceTokenCount) {
          aspectSentence = sentences[i];
          sentenceIndex = i;
          tokenPosition = aspect.position - currentPosition;
          break;
        }
        currentPosition += sentenceTokenCount;
      }

      // Analyseer sentiment in de context van het aspect
      if (aspectSentence) {
        const sentenceTokens = aspectSentence.toLowerCase().split(/\s+/);

        // Zoek naar sentiment woorden in de hele zin
        for (const token of sentenceTokens) {
          if (combinedLexicon[token] && !aspectTokens.includes(token)) {
            // Bereken afstand tot het aspect
            const distance = Math.abs(sentenceTokens.indexOf(token) - tokenPosition);
            const proximityWeight = 1 / (1 + distance * 0.5); // Dichter bij = meer gewicht

            aspectSentiment[token] = combinedLexicon[token].score * proximityWeight;
          }
        }
      }

      // Bereken gemiddelde sentiment voor het aspect
      const aspectScores = Object.values(aspectSentiment);
      const aspectAvgScore = aspectScores.length > 0
        ? aspectScores.reduce((sum, score) => sum + score, 0) / aspectScores.length
        : 0;

      // Bepaal aspect sentiment label en intensiteit
      let aspectSentimentLabel = 'neutral';
      let aspectIntensityLevel = 'neutral';

      if (aspectAvgScore > 0) {
        aspectSentimentLabel = 'positive';

        // Bepaal intensiteitsniveau voor positief sentiment
        for (let i = 0; i < this.intensityThresholds.positive.length; i++) {
          if (aspectAvgScore <= this.intensityThresholds.positive[i]) {
            aspectIntensityLevel = this.sentimentLevels.positive[i];
            break;
          }
        }
      } else if (aspectAvgScore < 0) {
        aspectSentimentLabel = 'negative';

        // Bepaal intensiteitsniveau voor negatief sentiment
        for (let i = 0; i < this.intensityThresholds.negative.length; i++) {
          if (aspectAvgScore >= this.intensityThresholds.negative[i]) {
            aspectIntensityLevel = this.sentimentLevels.negative[i];
            break;
          }
        }
      }

      // Voeg aspect met sentiment toe aan resultaten
      aspects.push({
        term: aspect.term,
        sentiment: aspectSentimentLabel,
        intensityLevel: aspectIntensityLevel,
        score: parseFloat(aspectAvgScore.toFixed(2)),
        position: aspect.position,
        sentenceIndex: sentenceIndex,
        relatedTerms: Object.keys(aspectSentiment),
      });
    }

    // Return resultaat
    return {
      sentiment,
      intensityLevel,
      score: parseFloat(avgScore.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2)),
      emotions: sortedEmotions,
      aspects,
      sentences: sentenceResults,
      domain,
      metadata: {
        wordCount,
        positiveCount,
        negativeCount,
        language,
      },
    };
  }

  /**
   * Mock externe sentiment analyse API (in productie vervangen door echte API call)
   * @param {String} text - Tekst om te analyseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Sentiment analyse resultaat
   */
  async mockExternalSentimentAnalysis(text, options = {}) {
    // In een productie-omgeving zou je hier een externe sentiment API aanroepen
    console.log(`🔍 Mock externe sentiment analyse voor: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

    // Simuleer een vertraging om een API call na te bootsen
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Genereer een mock sentiment score op basis van de tekst
    let score = 0;

    // Eenvoudige heuristiek voor mock sentiment
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'best', 'perfect', 'happy', 'pleased'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'disappointing', 'sad', 'angry'];

    const lowerText = text.toLowerCase();

    for (const word of positiveWords) {
      if (lowerText.includes(word)) {
        score += 0.2;
      }
    }

    for (const word of negativeWords) {
      if (lowerText.includes(word)) {
        score -= 0.2;
      }
    }

    // Begrens score tussen -1 en 1
    score = Math.max(-1, Math.min(1, score));

    // Bepaal sentiment label
    let sentiment = 'neutral';
    if (score > 0.1) {
      sentiment = 'positive';
    } else if (score < -0.1) {
      sentiment = 'negative';
    }

    // Genereer mock emoties
    const emotions = {};
    this.emotions.forEach((emotion) => {
      emotions[emotion] = Math.random() * 0.5; // Random waarden tussen 0 en 0.5
    });

    // Verhoog relevante emoties op basis van sentiment
    if (sentiment === 'positive') {
      emotions.joy = Math.min(emotions.joy + 0.4, 1);
      emotions.trust = Math.min(emotions.trust + 0.3, 1);
    } else if (sentiment === 'negative') {
      emotions.sadness = Math.min(emotions.sadness + 0.3, 1);
      emotions.anger = Math.min(emotions.anger + 0.3, 1);
      emotions.disgust = Math.min(emotions.disgust + 0.2, 1);
    }

    return {
      sentiment,
      score,
      confidence: 0.85,
      distribution: {
        positive: Math.max(0, score) * 0.8,
        negative: Math.abs(Math.min(0, score)) * 0.8,
        neutral: 1 - Math.abs(score) * 0.8,
      },
      emotions,
      aspects: [], // Geen aspect-gebaseerd sentiment in mock implementatie
    };
  }

  /**
   * Detecteer het domein van de tekst
   * @param {String} text - Tekst om te analyseren
   * @returns {String|null} - Gedetecteerd domein of null
   */
  detectDomain(text) {
    // Controleer of text is gedefinieerd en een string is
    if (!text || typeof text !== 'string') {
      return null;
    }
    // Domein-specifieke keywords
    const domainKeywords = {
      ecommerce: ['product', 'order', 'shipping', 'delivery', 'purchase', 'customer', 'shop', 'store', 'price', 'payment', 'cart', 'checkout', 'return', 'refund', 'quality'],
      finance: ['bank', 'investment', 'loan', 'credit', 'debit', 'mortgage', 'interest', 'payment', 'transaction', 'account', 'money', 'financial', 'budget', 'tax', 'income'],
      healthcare: ['doctor', 'patient', 'hospital', 'clinic', 'treatment', 'medicine', 'medical', 'health', 'care', 'symptom', 'disease', 'diagnosis', 'therapy', 'prescription', 'appointment'],
      hospitality: ['hotel', 'restaurant', 'booking', 'reservation', 'room', 'stay', 'guest', 'accommodation', 'service', 'staff', 'food', 'menu', 'breakfast', 'dinner', 'travel'],
      technology: ['software', 'hardware', 'app', 'application', 'device', 'computer', 'mobile', 'phone', 'tablet', 'internet', 'website', 'online', 'digital', 'tech', 'technology'],
    };

    // Normaliseer tekst
    const normalizedText = text.toLowerCase();

    // Tel domein keywords
    const domainScores = {};

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      domainScores[domain] = 0;

      for (const keyword of keywords) {
        // Tel hoe vaak het keyword voorkomt
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = normalizedText.match(regex);

        if (matches) {
          domainScores[domain] += matches.length;
        }
      }
    }

    // Vind het domein met de hoogste score
    let maxScore = 0;
    let detectedDomain = null;

    for (const [domain, score] of Object.entries(domainScores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedDomain = domain;
      }
    }

    // Alleen een domein retourneren als er voldoende bewijs is
    return maxScore >= 2 ? detectedDomain : null;
  }

  /**
   * Extraheer aspect kandidaten uit tekst
   * @param {String} text - Tekst om te analyseren
   * @returns {Array<Object>} - Aspect kandidaten
   */
  extractAspectCandidates(text) {
    // Controleer of text is gedefinieerd en een string is
    if (!text || typeof text !== 'string') {
      return [];
    }
    const aspects = [];
    const tokens = text.split(/\s+/);

    // Eenvoudige zelfstandige naamwoorden extractie (in productie vervangen door POS tagging)
    // We gebruiken hier een eenvoudige heuristiek: woorden die niet voorkomen in stopwoorden
    // en langer zijn dan 3 tekens zijn kandidaten voor aspecten
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].toLowerCase().replace(/[^\w]/g, '');

      if (token.length > 3
          && !this.negators.en.has(token)
          && !this.intensifiers.en.has(token)) {
        aspects.push({
          term: token,
          position: i,
          sentimentWords: [],
        });
      }
    }

    return aspects;
  }

  /**
   * Laad Engels sentiment lexicon
   * @returns {Object} - Sentiment lexicon
   */
  loadEnglishLexicon() {
    // In een productie-omgeving zou je hier een volledig lexicon laden
    // Voor nu gebruiken we een beperkt lexicon
    return {
      good: { score: 0.7, emotions: { joy: 0.5, trust: 0.6 } },
      great: { score: 0.8, emotions: { joy: 0.7, trust: 0.5 } },
      excellent: { score: 0.9, emotions: { joy: 0.8, trust: 0.7 } },
      amazing: { score: 0.9, emotions: { joy: 0.9, surprise: 0.7 } },
      wonderful: { score: 0.8, emotions: { joy: 0.8, trust: 0.6 } },
      love: { score: 0.9, emotions: { joy: 0.9, trust: 0.8 } },
      best: { score: 0.8, emotions: { joy: 0.6, trust: 0.7 } },
      perfect: { score: 0.9, emotions: { joy: 0.7, trust: 0.8 } },
      happy: { score: 0.8, emotions: { joy: 0.9, trust: 0.5 } },
      pleased: { score: 0.7, emotions: { joy: 0.7, trust: 0.5 } },

      bad: { score: -0.7, emotions: { sadness: 0.5, disgust: 0.5 } },
      terrible: { score: -0.9, emotions: { sadness: 0.6, disgust: 0.8 } },
      awful: { score: -0.8, emotions: { sadness: 0.5, disgust: 0.7 } },
      horrible: { score: -0.9, emotions: { sadness: 0.6, disgust: 0.8, fear: 0.5 } },
      worst: { score: -0.9, emotions: { sadness: 0.5, disgust: 0.8, anger: 0.6 } },
      hate: { score: -0.8, emotions: { anger: 0.8, disgust: 0.7 } },
      poor: { score: -0.6, emotions: { sadness: 0.5, disgust: 0.3 } },
      disappointing: { score: -0.7, emotions: { sadness: 0.7, disgust: 0.4 } },
      sad: { score: -0.7, emotions: { sadness: 0.9 } },
      angry: { score: -0.7, emotions: { anger: 0.9 } },

      okay: { score: 0.2, emotions: { trust: 0.3 } },
      fine: { score: 0.3, emotions: { trust: 0.4 } },
      decent: { score: 0.4, emotions: { trust: 0.4 } },
      average: { score: 0.1, emotions: {} },
      mediocre: { score: -0.2, emotions: { disappointment: 0.3 } },
    };
  }

  /**
   * Laad Nederlands sentiment lexicon
   * @returns {Object} - Sentiment lexicon
   */
  loadDutchLexicon() {
    // In een productie-omgeving zou je hier een volledig lexicon laden
    // Voor nu gebruiken we een beperkt lexicon
    return {
      goed: { score: 0.7, emotions: { joy: 0.5, trust: 0.6 } },
      geweldig: { score: 0.8, emotions: { joy: 0.7, trust: 0.5 } },
      uitstekend: { score: 0.9, emotions: { joy: 0.8, trust: 0.7 } },
      fantastisch: { score: 0.9, emotions: { joy: 0.9, surprise: 0.7 } },
      prachtig: { score: 0.8, emotions: { joy: 0.8, trust: 0.6 } },
      'houden van': { score: 0.9, emotions: { joy: 0.9, trust: 0.8 } },
      beste: { score: 0.8, emotions: { joy: 0.6, trust: 0.7 } },
      perfect: { score: 0.9, emotions: { joy: 0.7, trust: 0.8 } },
      blij: { score: 0.8, emotions: { joy: 0.9, trust: 0.5 } },
      tevreden: { score: 0.7, emotions: { joy: 0.7, trust: 0.5 } },

      slecht: { score: -0.7, emotions: { sadness: 0.5, disgust: 0.5 } },
      verschrikkelijk: { score: -0.9, emotions: { sadness: 0.6, disgust: 0.8 } },
      afschuwelijk: { score: -0.8, emotions: { sadness: 0.5, disgust: 0.7 } },
      vreselijk: { score: -0.9, emotions: { sadness: 0.6, disgust: 0.8, fear: 0.5 } },
      slechtste: { score: -0.9, emotions: { sadness: 0.5, disgust: 0.8, anger: 0.6 } },
      haat: { score: -0.8, emotions: { anger: 0.8, disgust: 0.7 } },
      matig: { score: -0.6, emotions: { sadness: 0.5, disgust: 0.3 } },
      teleurstellend: { score: -0.7, emotions: { sadness: 0.7, disgust: 0.4 } },
      verdrietig: { score: -0.7, emotions: { sadness: 0.9 } },
      boos: { score: -0.7, emotions: { anger: 0.9 } },

      oké: { score: 0.2, emotions: { trust: 0.3 } },
      prima: { score: 0.3, emotions: { trust: 0.4 } },
      redelijk: { score: 0.4, emotions: { trust: 0.4 } },
      gemiddeld: { score: 0.1, emotions: {} },
      middelmatig: { score: -0.2, emotions: { disappointment: 0.3 } },
    };
  }

  /**
   * Laad Duits sentiment lexicon
   * @returns {Object} - Sentiment lexicon
   */
  loadGermanLexicon() {
    // Beperkt Duits lexicon voor demonstratie
    return {
      gut: { score: 0.7, emotions: { joy: 0.5, trust: 0.6 } },
      großartig: { score: 0.8, emotions: { joy: 0.7, trust: 0.5 } },
      ausgezeichnet: { score: 0.9, emotions: { joy: 0.8, trust: 0.7 } },
      fantastisch: { score: 0.9, emotions: { joy: 0.9, surprise: 0.7 } },
      wunderbar: { score: 0.8, emotions: { joy: 0.8, trust: 0.6 } },
      lieben: { score: 0.9, emotions: { joy: 0.9, trust: 0.8 } },
      beste: { score: 0.8, emotions: { joy: 0.6, trust: 0.7 } },
      perfekt: { score: 0.9, emotions: { joy: 0.7, trust: 0.8 } },
      glücklich: { score: 0.8, emotions: { joy: 0.9, trust: 0.5 } },
      zufrieden: { score: 0.7, emotions: { joy: 0.7, trust: 0.5 } },

      schlecht: { score: -0.7, emotions: { sadness: 0.5, disgust: 0.5 } },
      schrecklich: { score: -0.9, emotions: { sadness: 0.6, disgust: 0.8 } },
      furchtbar: { score: -0.8, emotions: { sadness: 0.5, disgust: 0.7 } },
      entsetzlich: { score: -0.9, emotions: { sadness: 0.6, disgust: 0.8, fear: 0.5 } },
      schlechteste: { score: -0.9, emotions: { sadness: 0.5, disgust: 0.8, anger: 0.6 } },
      hassen: { score: -0.8, emotions: { anger: 0.8, disgust: 0.7 } },
      mittelmäßig: { score: -0.6, emotions: { sadness: 0.5, disgust: 0.3 } },
      enttäuschend: { score: -0.7, emotions: { sadness: 0.7, disgust: 0.4 } },
      traurig: { score: -0.7, emotions: { sadness: 0.9 } },
      wütend: { score: -0.7, emotions: { anger: 0.9 } },

      okay: { score: 0.2, emotions: { trust: 0.3 } },
      'in ordnung': { score: 0.3, emotions: { trust: 0.4 } },
      angemessen: { score: 0.4, emotions: { trust: 0.4 } },
      durchschnittlich: { score: 0.1, emotions: {} },
    };
  }

  /**
   * Laad Frans sentiment lexicon
   * @returns {Object} - Sentiment lexicon
   */
  loadFrenchLexicon() {
    // Beperkt Frans lexicon voor demonstratie
    return {
      bon: { score: 0.7, emotions: { joy: 0.5, trust: 0.6 } },
      excellent: { score: 0.9, emotions: { joy: 0.8, trust: 0.7 } },
      fantastique: { score: 0.9, emotions: { joy: 0.9, surprise: 0.7 } },
      merveilleux: { score: 0.8, emotions: { joy: 0.8, trust: 0.6 } },
      aimer: { score: 0.9, emotions: { joy: 0.9, trust: 0.8 } },
      meilleur: { score: 0.8, emotions: { joy: 0.6, trust: 0.7 } },
      parfait: { score: 0.9, emotions: { joy: 0.7, trust: 0.8 } },
      heureux: { score: 0.8, emotions: { joy: 0.9, trust: 0.5 } },
      content: { score: 0.7, emotions: { joy: 0.7, trust: 0.5 } },

      mauvais: { score: -0.7, emotions: { sadness: 0.5, disgust: 0.5 } },
      terrible: { score: -0.9, emotions: { sadness: 0.6, disgust: 0.8 } },
      affreux: { score: -0.8, emotions: { sadness: 0.5, disgust: 0.7 } },
      horrible: { score: -0.9, emotions: { sadness: 0.6, disgust: 0.8, fear: 0.5 } },
      pire: { score: -0.9, emotions: { sadness: 0.5, disgust: 0.8, anger: 0.6 } },
      détester: { score: -0.8, emotions: { anger: 0.8, disgust: 0.7 } },
      médiocre: { score: -0.6, emotions: { sadness: 0.5, disgust: 0.3 } },
      décevant: { score: -0.7, emotions: { sadness: 0.7, disgust: 0.4 } },
      triste: { score: -0.7, emotions: { sadness: 0.9 } },
      'en colère': { score: -0.7, emotions: { anger: 0.9 } },

      'd\'accord': { score: 0.2, emotions: { trust: 0.3 } },
      bien: { score: 0.3, emotions: { trust: 0.4 } },
      correct: { score: 0.4, emotions: { trust: 0.4 } },
      moyen: { score: 0.1, emotions: {} },
    };
  }

  /**
   * Laad Spaans sentiment lexicon
   * @returns {Object} - Sentiment lexicon
   */
  loadSpanishLexicon() {
    // Beperkt Spaans lexicon voor demonstratie
    return {
      bueno: { score: 0.7, emotions: { joy: 0.5, trust: 0.6 } },
      excelente: { score: 0.9, emotions: { joy: 0.8, trust: 0.7 } },
      fantástico: { score: 0.9, emotions: { joy: 0.9, surprise: 0.7 } },
      maravilloso: { score: 0.8, emotions: { joy: 0.8, trust: 0.6 } },
      amar: { score: 0.9, emotions: { joy: 0.9, trust: 0.8 } },
      mejor: { score: 0.8, emotions: { joy: 0.6, trust: 0.7 } },
      perfecto: { score: 0.9, emotions: { joy: 0.7, trust: 0.8 } },
      feliz: { score: 0.8, emotions: { joy: 0.9, trust: 0.5 } },
      contento: { score: 0.7, emotions: { joy: 0.7, trust: 0.5 } },

      malo: { score: -0.7, emotions: { sadness: 0.5, disgust: 0.5 } },
      terrible: { score: -0.9, emotions: { sadness: 0.6, disgust: 0.8 } },
      horrible: { score: -0.8, emotions: { sadness: 0.5, disgust: 0.7 } },
      espantoso: { score: -0.9, emotions: { sadness: 0.6, disgust: 0.8, fear: 0.5 } },
      peor: { score: -0.9, emotions: { sadness: 0.5, disgust: 0.8, anger: 0.6 } },
      odiar: { score: -0.8, emotions: { anger: 0.8, disgust: 0.7 } },
      mediocre: { score: -0.6, emotions: { sadness: 0.5, disgust: 0.3 } },
      decepcionante: { score: -0.7, emotions: { sadness: 0.7, disgust: 0.4 } },
      triste: { score: -0.7, emotions: { sadness: 0.9 } },
      enfadado: { score: -0.7, emotions: { anger: 0.9 } },

      vale: { score: 0.2, emotions: { trust: 0.3 } },
      bien: { score: 0.3, emotions: { trust: 0.4 } },
      correcto: { score: 0.4, emotions: { trust: 0.4 } },
      promedio: { score: 0.1, emotions: {} },
    };
  }

  /**
   * Laad E-commerce domein-specifiek sentiment lexicon
   * @returns {Object} - Domein-specifiek sentiment lexicon
   */
  loadEcommerceLexicon() {
    return {
      // Positieve termen specifiek voor e-commerce
      'fast shipping': { score: 0.8, emotions: { joy: 0.6, trust: 0.7 } },
      'quick delivery': { score: 0.8, emotions: { joy: 0.6, trust: 0.7 } },
      'easy checkout': { score: 0.7, emotions: { joy: 0.5, trust: 0.6 } },
      'free shipping': { score: 0.9, emotions: { joy: 0.8, trust: 0.6 } },
      'secure payment': { score: 0.7, emotions: { trust: 0.9 } },
      'user-friendly': { score: 0.7, emotions: { joy: 0.5, trust: 0.6 } },
      'responsive customer service': { score: 0.8, emotions: { joy: 0.6, trust: 0.8 } },
      'high quality': { score: 0.8, emotions: { joy: 0.6, trust: 0.7 } },
      durable: { score: 0.7, emotions: { trust: 0.8 } },
      'value for money': { score: 0.8, emotions: { joy: 0.7, trust: 0.6 } },
      affordable: { score: 0.7, emotions: { joy: 0.6, trust: 0.5 } },

      // Negatieve termen specifiek voor e-commerce
      'late delivery': { score: -0.8, emotions: { anger: 0.7, disgust: 0.5 } },
      'shipping delay': { score: -0.7, emotions: { anger: 0.6, disgust: 0.4 } },
      'poor packaging': { score: -0.6, emotions: { disgust: 0.6, anger: 0.4 } },
      'damaged product': { score: -0.9, emotions: { anger: 0.8, disgust: 0.7 } },
      'wrong item': { score: -0.8, emotions: { anger: 0.7, disgust: 0.6 } },
      'difficult return': { score: -0.7, emotions: { anger: 0.6, disgust: 0.5 } },
      'expensive shipping': { score: -0.6, emotions: { anger: 0.5, disgust: 0.4 } },
      'hidden fees': { score: -0.8, emotions: { anger: 0.7, disgust: 0.6 } },
      'out of stock': { score: -0.5, emotions: { sadness: 0.6, disgust: 0.3 } },
      'website crashed': { score: -0.7, emotions: { anger: 0.6, disgust: 0.5 } },
      'payment issues': { score: -0.7, emotions: { anger: 0.6, fear: 0.5 } },
    };
  }

  /**
   * Laad Finance domein-specifiek sentiment lexicon
   * @returns {Object} - Domein-specifiek sentiment lexicon
   */
  loadFinanceLexicon() {
    return {
      // Positieve termen specifiek voor finance
      'high return': { score: 0.8, emotions: { joy: 0.7, trust: 0.6 } },
      'low interest': { score: 0.7, emotions: { joy: 0.6, trust: 0.5 } },
      'secure investment': { score: 0.7, emotions: { trust: 0.9 } },
      profitable: { score: 0.8, emotions: { joy: 0.7, trust: 0.6 } },
      dividend: { score: 0.6, emotions: { joy: 0.5, trust: 0.6 } },
      growth: { score: 0.7, emotions: { joy: 0.6, anticipation: 0.7 } },
      savings: { score: 0.7, emotions: { joy: 0.5, trust: 0.7 } },
      'financial stability': { score: 0.8, emotions: { joy: 0.6, trust: 0.8 } },
      'wealth management': { score: 0.6, emotions: { trust: 0.7 } },
      'tax benefit': { score: 0.7, emotions: { joy: 0.6, trust: 0.5 } },

      // Negatieve termen specifiek voor finance
      debt: { score: -0.7, emotions: { fear: 0.7, sadness: 0.5 } },
      bankruptcy: { score: -0.9, emotions: { fear: 0.8, sadness: 0.7 } },
      'market crash': { score: -0.9, emotions: { fear: 0.9, sadness: 0.7 } },
      recession: { score: -0.8, emotions: { fear: 0.7, sadness: 0.6 } },
      inflation: { score: -0.6, emotions: { fear: 0.5, anger: 0.4 } },
      'financial loss': { score: -0.8, emotions: { sadness: 0.7, fear: 0.6 } },
      'high fees': { score: -0.6, emotions: { anger: 0.6, disgust: 0.4 } },
      penalty: { score: -0.7, emotions: { anger: 0.6, fear: 0.5 } },
      fraud: { score: -0.9, emotions: { anger: 0.8, disgust: 0.7, fear: 0.6 } },
      'tax audit': { score: -0.7, emotions: { fear: 0.8, anxiety: 0.7 } },
    };
  }

  /**
   * Laad Healthcare domein-specifiek sentiment lexicon
   * @returns {Object} - Domein-specifiek sentiment lexicon
   */
  loadHealthcareLexicon() {
    return {
      // Positieve termen specifiek voor healthcare
      recovery: { score: 0.8, emotions: { joy: 0.7, trust: 0.6, anticipation: 0.5 } },
      healing: { score: 0.8, emotions: { joy: 0.7, trust: 0.6, anticipation: 0.5 } },
      'effective treatment': { score: 0.8, emotions: { joy: 0.7, trust: 0.7 } },
      'caring staff': { score: 0.8, emotions: { joy: 0.6, trust: 0.8 } },
      professional: { score: 0.7, emotions: { trust: 0.8 } },
      'prompt attention': { score: 0.7, emotions: { joy: 0.5, trust: 0.6 } },
      'pain relief': { score: 0.9, emotions: { joy: 0.8, trust: 0.6 } },
      'accurate diagnosis': { score: 0.8, emotions: { joy: 0.6, trust: 0.8 } },
      improvement: { score: 0.7, emotions: { joy: 0.7, anticipation: 0.5 } },
      wellness: { score: 0.8, emotions: { joy: 0.8, trust: 0.6 } },

      // Negatieve termen specifiek voor healthcare
      misdiagnosis: { score: -0.9, emotions: { fear: 0.8, anger: 0.7 } },
      'side effect': { score: -0.7, emotions: { fear: 0.6, disgust: 0.5 } },
      complication: { score: -0.8, emotions: { fear: 0.7, sadness: 0.6 } },
      infection: { score: -0.8, emotions: { fear: 0.7, disgust: 0.6 } },
      'long wait': { score: -0.6, emotions: { anger: 0.6, sadness: 0.4 } },
      'expensive treatment': { score: -0.6, emotions: { anger: 0.5, sadness: 0.4 } },
      'rude staff': { score: -0.8, emotions: { anger: 0.8, disgust: 0.6 } },
      unresponsive: { score: -0.7, emotions: { anger: 0.7, disgust: 0.5 } },
      pain: { score: -0.8, emotions: { sadness: 0.7, fear: 0.6 } },
      chronic: { score: -0.6, emotions: { sadness: 0.7, fear: 0.5 } },
    };
  }

  /**
   * Laad Hospitality domein-specifiek sentiment lexicon
   * @returns {Object} - Domein-specifiek sentiment lexicon
   */
  loadHospitalityLexicon() {
    return {
      // Positieve termen specifiek voor hospitality
      'comfortable room': { score: 0.8, emotions: { joy: 0.7, trust: 0.6 } },
      'friendly staff': { score: 0.8, emotions: { joy: 0.7, trust: 0.7 } },
      'delicious food': { score: 0.9, emotions: { joy: 0.8, trust: 0.6 } },
      clean: { score: 0.7, emotions: { joy: 0.5, trust: 0.7 } },
      spacious: { score: 0.7, emotions: { joy: 0.6, trust: 0.5 } },
      'convenient location': { score: 0.7, emotions: { joy: 0.6, trust: 0.5 } },
      amenities: { score: 0.6, emotions: { joy: 0.5, trust: 0.5 } },
      peaceful: { score: 0.8, emotions: { joy: 0.7, trust: 0.6 } },
      luxurious: { score: 0.8, emotions: { joy: 0.8, trust: 0.5 } },
      'attentive service': { score: 0.8, emotions: { joy: 0.7, trust: 0.7 } },

      // Negatieve termen specifiek voor hospitality
      'dirty room': { score: -0.9, emotions: { disgust: 0.9, anger: 0.7 } },
      noisy: { score: -0.7, emotions: { anger: 0.7, disgust: 0.5 } },
      'uncomfortable bed': { score: -0.8, emotions: { anger: 0.6, disgust: 0.5 } },
      'rude staff': { score: -0.9, emotions: { anger: 0.8, disgust: 0.7 } },
      'poor service': { score: -0.8, emotions: { anger: 0.7, disgust: 0.6 } },
      overpriced: { score: -0.7, emotions: { anger: 0.6, disgust: 0.5 } },
      'bad food': { score: -0.8, emotions: { disgust: 0.8, anger: 0.6 } },
      'slow service': { score: -0.7, emotions: { anger: 0.7, disgust: 0.5 } },
      outdated: { score: -0.6, emotions: { disgust: 0.5, sadness: 0.4 } },
      'small room': { score: -0.6, emotions: { disgust: 0.5, sadness: 0.4 } },
    };
  }

  /**
   * Laad Technology domein-specifiek sentiment lexicon
   * @returns {Object} - Domein-specifiek sentiment lexicon
   */
  loadTechnologyLexicon() {
    return {
      // Positieve termen specifiek voor technology
      'user-friendly': { score: 0.8, emotions: { joy: 0.7, trust: 0.6 } },
      innovative: { score: 0.8, emotions: { joy: 0.7, surprise: 0.6, trust: 0.5 } },
      fast: { score: 0.7, emotions: { joy: 0.6, trust: 0.5 } },
      reliable: { score: 0.8, emotions: { trust: 0.9 } },
      seamless: { score: 0.8, emotions: { joy: 0.7, trust: 0.6 } },
      intuitive: { score: 0.7, emotions: { joy: 0.6, trust: 0.6 } },
      powerful: { score: 0.7, emotions: { joy: 0.6, trust: 0.5 } },
      efficient: { score: 0.7, emotions: { joy: 0.6, trust: 0.6 } },
      compatible: { score: 0.6, emotions: { trust: 0.7 } },
      secure: { score: 0.7, emotions: { trust: 0.9 } },

      // Negatieve termen specifiek voor technology
      bug: { score: -0.7, emotions: { anger: 0.7, disgust: 0.5 } },
      crash: { score: -0.8, emotions: { anger: 0.8, disgust: 0.6 } },
      slow: { score: -0.7, emotions: { anger: 0.7, disgust: 0.5 } },
      glitch: { score: -0.6, emotions: { anger: 0.6, disgust: 0.4 } },
      incompatible: { score: -0.7, emotions: { anger: 0.6, disgust: 0.5 } },
      outdated: { score: -0.6, emotions: { disgust: 0.5, sadness: 0.4 } },
      complicated: { score: -0.6, emotions: { anger: 0.5, disgust: 0.4 } },
      'security breach': { score: -0.9, emotions: { fear: 0.9, anger: 0.7 } },
      'data loss': { score: -0.9, emotions: { fear: 0.8, anger: 0.7, sadness: 0.6 } },
      expensive: { score: -0.6, emotions: { anger: 0.5, sadness: 0.4 } },
    };
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de SentimentAnalysisService
 * @returns {SentimentAnalysisService} - SentimentAnalysisService instance
 */
const getSentimentAnalysisService = () => {
  if (!instance) {
    instance = new SentimentAnalysisService();
  }
  return instance;
};

module.exports = {
  getSentimentAnalysisService,
};
