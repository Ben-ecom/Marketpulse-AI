/**
 * Awareness Classification Service
 * Classificeert content in de 5 awareness fasen van Eugene Schwartz
 * Gebruikt NLP technieken om tekstpatronen te herkennen en te categoriseren
 */

import natural from 'natural';
import AwarenessPhase from '../models/awarenessPhase.js';

// Initialiseer NLP tools
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

class AwarenessClassificationService {
  constructor() {
    this.phases = null;
    this.initialized = false;
  }

  /**
   * Initialiseer de classificatie-engine voor een specifiek project
   * @param {string} projectId - Project ID
   */
  async initialize(projectId) {
    try {
      // Haal awareness fasen op voor dit project
      this.phases = await AwarenessPhase.find({ projectId }).sort('order');
      
      if (!this.phases || this.phases.length === 0) {
        // Initialiseer fasen als ze nog niet bestaan
        this.phases = await AwarenessPhase.initializeForProject(projectId);
      }
      
      // Voeg indicatoren toe aan TF-IDF voor betere patroonherkenning
      this.phases.forEach(phase => {
        phase.indicators.forEach(indicator => {
          tfidf.addDocument(indicator.pattern, phase.name);
        });
      });
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing awareness classification:', error);
      return false;
    }
  }

  /**
   * Preprocess tekst voor analyse
   * @param {string} text - Ruwe tekst
   * @returns {string} - Gepreprocesste tekst
   */
  preprocessText(text) {
    if (!text) return '';
    
    // Converteer naar lowercase
    let processedText = text.toLowerCase();
    
    // Verwijder speciale tekens, maar behoud spaties en punten
    processedText = processedText.replace(/[^\w\s\.\?]/gi, '');
    
    // Tokenize en stem woorden
    const tokens = tokenizer.tokenize(processedText);
    const stemmedTokens = tokens.map(token => stemmer.stem(token));
    
    return stemmedTokens.join(' ');
  }

  /**
   * Classificeer een content item in een awareness fase
   * @param {Object} contentItem - Content item om te classificeren
   * @param {Object} productContext - Context over het product/onderwerp
   * @returns {Object} - Classificatieresultaat
   */
  async classifyContent(contentItem, productContext) {
    if (!this.initialized) {
      throw new Error('Classification engine not initialized. Call initialize() first.');
    }
    
    // Extraheer tekst uit content item
    const text = contentItem.text || contentItem.content || '';
    
    // Preprocess tekst
    const processedText = this.preprocessText(text);
    
    // Bereken scores voor elke fase
    const scores = {};
    
    for (const phase of this.phases) {
      scores[phase.name] = this.calculatePhaseScore(processedText, phase, productContext);
    }
    
    // Bepaal de fase met de hoogste score
    let highestScore = 0;
    let classifiedPhase = 'unaware'; // Default fase
    
    Object.keys(scores).forEach(phaseName => {
      if (scores[phaseName] > highestScore) {
        highestScore = scores[phaseName];
        classifiedPhase = phaseName;
      }
    });
    
    // Bereken confidence score (0-1)
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? highestScore / totalScore : 0;
    
    return {
      item: contentItem,
      classifiedPhase,
      confidence,
      allScores: scores
    };
  }

  /**
   * Bereken score voor een specifieke fase
   * @param {string} text - Gepreprocesste tekst
   * @param {Object} phase - Awareness fase
   * @param {Object} productContext - Context over het product/onderwerp
   * @returns {number} - Score voor deze fase
   */
  calculatePhaseScore(text, phase, productContext) {
    let score = 0;
    
    // Check voor indicatoren
    phase.indicators.forEach(indicator => {
      if (text.includes(this.preprocessText(indicator.pattern))) {
        score += indicator.weight;
      }
    });
    
    // Check voor productcontext-specifieke patronen
    if (productContext && productContext.keywords) {
      // Unaware fase: weinig tot geen productgerelateerde termen
      if (phase.name === 'unaware') {
        const keywordMatches = this.countKeywordMatches(text, productContext.keywords);
        if (keywordMatches === 0) {
          score += 5;
        } else if (keywordMatches <= 2) {
          score += 3;
        }
      }
      
      // Problem Aware fase: probleem-gerelateerde termen
      if (phase.name === 'problemAware' && productContext.painPoints) {
        productContext.painPoints.forEach(painPoint => {
          if (text.includes(this.preprocessText(painPoint))) {
            score += 5;
          }
        });
      }
      
      // Solution Aware fase: oplossing-gerelateerde termen
      if (phase.name === 'solutionAware' && productContext.solutionTypes) {
        productContext.solutionTypes.forEach(solutionType => {
          if (text.includes(this.preprocessText(solutionType))) {
            score += 5;
          }
        });
      }
      
      // Product Aware fase: product-gerelateerde termen
      if (phase.name === 'productAware' && productContext.productNames) {
        productContext.productNames.forEach(productName => {
          if (text.includes(this.preprocessText(productName))) {
            score += 5;
          }
        });
      }
      
      // Most Aware fase: aankoop-gerelateerde termen
      if (phase.name === 'mostAware' && productContext.purchaseTerms) {
        productContext.purchaseTerms.forEach(term => {
          if (text.includes(this.preprocessText(term))) {
            score += 5;
          }
        });
      }
    }
    
    return score;
  }

  /**
   * Tel het aantal keyword matches in een tekst
   * @param {string} text - Gepreprocesste tekst
   * @param {Array} keywords - Array van keywords
   * @returns {number} - Aantal matches
   */
  countKeywordMatches(text, keywords) {
    let count = 0;
    keywords.forEach(keyword => {
      if (text.includes(this.preprocessText(keyword))) {
        count++;
      }
    });
    return count;
  }

  /**
   * Classificeer meerdere content items in bulk
   * @param {Array} contentItems - Array van content items
   * @param {Object} productContext - Context over het product/onderwerp
   * @returns {Array} - Array van classificatieresultaten
   */
  async classifyBulk(contentItems, productContext) {
    if (!this.initialized) {
      throw new Error('Classification engine not initialized. Call initialize() first.');
    }
    
    const results = [];
    
    for (const item of contentItems) {
      const result = await this.classifyContent(item, productContext);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Update de awareness fase distributie voor een project
   * @param {string} projectId - Project ID
   * @param {Array} classificationResults - Classificatieresultaten
   */
  async updatePhaseDistribution(projectId, classificationResults) {
    if (!this.initialized) {
      throw new Error('Classification engine not initialized. Call initialize() first.');
    }
    
    // Reset percentages
    for (const phase of this.phases) {
      phase.percentage = 0;
    }
    
    // Tel items per fase
    const phaseCounts = {};
    this.phases.forEach(phase => {
      phaseCounts[phase.name] = 0;
    });
    
    classificationResults.forEach(result => {
      if (phaseCounts[result.classifiedPhase] !== undefined) {
        phaseCounts[result.classifiedPhase]++;
      }
    });
    
    // Bereken percentages
    const totalItems = classificationResults.length;
    if (totalItems > 0) {
      for (const phase of this.phases) {
        phase.percentage = (phaseCounts[phase.name] / totalItems) * 100;
        await phase.save();
      }
    }
    
    return this.phases;
  }

  /**
   * Voeg geclassificeerde content toe aan awareness fasen
   * @param {string} projectId - Project ID
   * @param {Array} classificationResults - Classificatieresultaten
   */
  async addContentToPhases(projectId, classificationResults) {
    if (!this.initialized) {
      throw new Error('Classification engine not initialized. Call initialize() first.');
    }
    
    // Groepeer resultaten per fase
    const contentByPhase = {};
    this.phases.forEach(phase => {
      contentByPhase[phase.name] = [];
    });
    
    classificationResults.forEach(result => {
      if (contentByPhase[result.classifiedPhase]) {
        const contentItem = {
          sourceId: result.item.id || result.item._id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          text: result.item.text || result.item.content || '',
          platform: result.item.platform || 'other',
          url: result.item.url || '',
          author: result.item.author || '',
          timestamp: result.item.timestamp || new Date(),
          confidence: result.confidence
        };
        
        contentByPhase[result.classifiedPhase].push(contentItem);
      }
    });
    
    // Update fasen met nieuwe content
    for (const phase of this.phases) {
      const newContent = contentByPhase[phase.name];
      if (newContent.length > 0) {
        // Voeg nieuwe content toe, maar beperk tot maximaal 100 items per fase
        phase.content = [...newContent, ...phase.content].slice(0, 100);
        await phase.save();
      }
    }
    
    return this.phases;
  }

  /**
   * Genereer marketing aanbevelingen op basis van awareness fase distributie
   * @param {string} projectId - Project ID
   * @returns {Object} - Marketing aanbevelingen
   */
  async generateMarketingRecommendations(projectId) {
    if (!this.initialized) {
      throw new Error('Classification engine not initialized. Call initialize() first.');
    }
    
    // Vind de dominante fase (hoogste percentage)
    let dominantPhase = this.phases[0];
    this.phases.forEach(phase => {
      if (phase.percentage > dominantPhase.percentage) {
        dominantPhase = phase;
      }
    });
    
    // Vind de tweede fase voor transitie-focus
    const otherPhases = this.phases.filter(phase => phase.name !== dominantPhase.name)
      .sort((a, b) => b.percentage - a.percentage);
    const secondaryPhase = otherPhases[0];
    
    // Bepaal de marketing focus (transitie tussen twee fasen)
    const recommendations = {
      dominantPhase: {
        name: dominantPhase.name,
        displayName: dominantPhase.displayName,
        percentage: dominantPhase.percentage,
        recommendedAngles: dominantPhase.recommendedAngles
      },
      secondaryPhase: secondaryPhase ? {
        name: secondaryPhase.name,
        displayName: secondaryPhase.displayName,
        percentage: secondaryPhase.percentage,
        recommendedAngles: secondaryPhase.recommendedAngles
      } : null,
      transitionFocus: this.getTransitionFocus(dominantPhase, secondaryPhase)
    };
    
    return recommendations;
  }

  /**
   * Bepaal de transitiefocus tussen twee fasen
   * @param {Object} fromPhase - Huidige fase
   * @param {Object} toPhase - Doelfase
   * @returns {Object} - Transitiefocus
   */
  getTransitionFocus(fromPhase, toPhase) {
    if (!fromPhase || !toPhase) {
      return null;
    }
    
    // Bepaal de richting van de transitie
    const fromOrder = fromPhase.order;
    const toOrder = toPhase.order;
    
    // Als de doelfase verder in de funnel is, focus op progressie
    if (toOrder > fromOrder) {
      return {
        type: 'progression',
        description: `Focus op het helpen van klanten om van ${fromPhase.displayName} naar ${toPhase.displayName} te bewegen`,
        recommendations: [
          `Gebruik content die specifiek gericht is op de transitie van ${fromPhase.displayName} naar ${toPhase.displayName}`,
          `Adresseer de belangrijkste barrières die klanten tegenhouden om naar ${toPhase.displayName} te gaan`,
          `Gebruik testimonials van klanten die deze transitie hebben gemaakt`
        ]
      };
    } 
    // Als de doelfase eerder in de funnel is, focus op verbreding
    else {
      return {
        type: 'expansion',
        description: `Focus op het bereiken van een nieuwe doelgroep in de ${toPhase.displayName}`,
        recommendations: [
          `Ontwikkel content die specifiek gericht is op klanten in de ${toPhase.displayName}`,
          `Gebruik verschillende kanalen om nieuwe klanten te bereiken die zich in de ${toPhase.displayName} bevinden`,
          `Pas je boodschap aan om relevanter te zijn voor klanten in de ${toPhase.displayName}`
        ]
      };
    }
  }
}

export default new AwarenessClassificationService();
