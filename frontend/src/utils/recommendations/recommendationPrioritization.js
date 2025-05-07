/**
 * Utility functies voor het prioriteren van aanbevelingen voor het aanbevelingssysteem
 */

/**
 * Prioriteert aanbevelingen op basis van verschillende factoren
 * @param {Array} recommendations - Array met aanbevelingen
 * @param {Object} context - Context informatie voor prioritering
 * @returns {Array} Geprioriteerde aanbevelingen
 */
export const prioritizeRecommendations = (recommendations = [], context = {}) => {
  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return [];
  }
  
  // Bereken prioriteit scores voor elke aanbeveling
  const scoredRecommendations = recommendations.map(recommendation => {
    const priorityScore = calculatePriorityScore(recommendation, context);
    
    // Bepaal prioriteit niveau
    let priority;
    if (priorityScore >= 0.7) {
      priority = 'high';
    } else if (priorityScore >= 0.4) {
      priority = 'medium';
    } else {
      priority = 'low';
    }
    
    return {
      ...recommendation,
      priorityScore,
      priority
    };
  });
  
  // Sorteer aanbevelingen op prioriteit
  return scoredRecommendations.sort((a, b) => b.priorityScore - a.priorityScore);
};

/**
 * Berekent een prioriteit score voor een aanbeveling
 * @param {Object} recommendation - Aanbeveling object
 * @param {Object} context - Context informatie voor prioritering
 * @returns {Number} Prioriteit score (0-1)
 */
const calculatePriorityScore = (recommendation, context) => {
  // Definieer gewichten voor verschillende factoren
  const weights = {
    impact: 0.3,         // Impact op business doelen
    effort: 0.2,         // Benodigde inspanning (omgekeerd: minder = hoger)
    urgency: 0.2,        // Urgentie
    relevance: 0.15,     // Relevantie voor huidige context
    confidence: 0.15     // Betrouwbaarheid van de aanbeveling
  };
  
  // Bereken scores voor elke factor
  const scores = {
    impact: calculateImpactScore(recommendation, context),
    effort: calculateEffortScore(recommendation),
    urgency: calculateUrgencyScore(recommendation, context),
    relevance: calculateRelevanceScore(recommendation, context),
    confidence: calculateConfidenceScore(recommendation)
  };
  
  // Bereken gewogen gemiddelde
  return Object.entries(weights).reduce((total, [factor, weight]) => {
    return total + (scores[factor] * weight);
  }, 0);
};

/**
 * Berekent een impact score voor een aanbeveling
 * @param {Object} recommendation - Aanbeveling object
 * @param {Object} context - Context informatie
 * @returns {Number} Impact score (0-1)
 */
const calculateImpactScore = (recommendation, context) => {
  // Als er een expliciete impact score is, gebruik deze
  if (recommendation.impact !== undefined) {
    return normalizeScore(recommendation.impact);
  }
  
  // Als er een impact categorie is, gebruik deze
  if (recommendation.impactCategory) {
    const impactCategories = {
      'revenue': 0.9,
      'cost_reduction': 0.8,
      'customer_satisfaction': 0.7,
      'market_share': 0.8,
      'brand_awareness': 0.6,
      'operational_efficiency': 0.5,
      'risk_mitigation': 0.7
    };
    
    return impactCategories[recommendation.impactCategory] || 0.5;
  }
  
  // Bereken impact op basis van type aanbeveling
  if (recommendation.type) {
    const typeImpacts = {
      'strategic': 0.8,
      'tactical': 0.6,
      'operational': 0.4
    };
    
    if (typeImpacts[recommendation.type]) {
      return typeImpacts[recommendation.type];
    }
  }
  
  // Als er een pattern is waarop de aanbeveling is gebaseerd, gebruik de significance
  if (recommendation.pattern && recommendation.pattern.significance !== undefined) {
    return normalizeScore(recommendation.pattern.significance);
  }
  
  // Standaard impact score
  return 0.5;
};

/**
 * Berekent een effort score voor een aanbeveling (omgekeerd: minder inspanning = hogere score)
 * @param {Object} recommendation - Aanbeveling object
 * @returns {Number} Effort score (0-1)
 */
const calculateEffortScore = (recommendation) => {
  // Als er een expliciete effort score is, gebruik deze (omgekeerd)
  if (recommendation.effort !== undefined) {
    return 1 - normalizeScore(recommendation.effort);
  }
  
  // Als er een effort categorie is, gebruik deze
  if (recommendation.effortCategory) {
    const effortCategories = {
      'quick_win': 0.9,
      'low': 0.8,
      'medium': 0.5,
      'high': 0.2,
      'very_high': 0.1
    };
    
    return effortCategories[recommendation.effortCategory] || 0.5;
  }
  
  // Als er een implementatie tijd is, gebruik deze
  if (recommendation.implementationTime) {
    const timeCategories = {
      'immediate': 0.9,
      'days': 0.8,
      'weeks': 0.6,
      'months': 0.3,
      'quarters': 0.1
    };
    
    return timeCategories[recommendation.implementationTime] || 0.5;
  }
  
  // Als er een aantal stappen is, gebruik deze
  if (recommendation.steps && Array.isArray(recommendation.steps)) {
    // Meer stappen = meer effort = lagere score
    return Math.max(0.1, 1 - (recommendation.steps.length * 0.1));
  }
  
  // Standaard effort score
  return 0.5;
};

/**
 * Berekent een urgentie score voor een aanbeveling
 * @param {Object} recommendation - Aanbeveling object
 * @param {Object} context - Context informatie
 * @returns {Number} Urgentie score (0-1)
 */
const calculateUrgencyScore = (recommendation, context) => {
  // Als er een expliciete urgentie score is, gebruik deze
  if (recommendation.urgency !== undefined) {
    return normalizeScore(recommendation.urgency);
  }
  
  // Als er een urgentie categorie is, gebruik deze
  if (recommendation.urgencyCategory) {
    const urgencyCategories = {
      'critical': 0.9,
      'high': 0.8,
      'medium': 0.5,
      'low': 0.3
    };
    
    return urgencyCategories[recommendation.urgencyCategory] || 0.5;
  }
  
  // Als er een deadline is, bereken urgentie op basis van nabijheid
  if (recommendation.deadline) {
    const deadline = new Date(recommendation.deadline);
    const now = new Date();
    
    if (isNaN(deadline.getTime())) {
      return 0.5;
    }
    
    const daysUntilDeadline = (deadline - now) / (1000 * 60 * 60 * 24);
    
    if (daysUntilDeadline < 0) {
      return 0.9; // Deadline is al verstreken
    } else if (daysUntilDeadline < 7) {
      return 0.8; // Binnen een week
    } else if (daysUntilDeadline < 30) {
      return 0.6; // Binnen een maand
    } else if (daysUntilDeadline < 90) {
      return 0.4; // Binnen een kwartaal
    } else {
      return 0.2; // Meer dan een kwartaal
    }
  }
  
  // Als er een trend is waarop de aanbeveling is gebaseerd, gebruik de trend richting
  if (recommendation.pattern && recommendation.pattern.type === 'sentiment_trend') {
    // Negatieve trends zijn urgenter
    return recommendation.pattern.direction === 'decreasing' ? 0.8 : 0.6;
  }
  
  // Standaard urgentie score
  return 0.5;
};

/**
 * Berekent een relevantie score voor een aanbeveling op basis van de huidige context
 * @param {Object} recommendation - Aanbeveling object
 * @param {Object} context - Context informatie
 * @returns {Number} Relevantie score (0-1)
 */
const calculateRelevanceScore = (recommendation, context) => {
  let relevanceScore = 0.5; // Standaard relevantie
  
  // Als er geen context is, return standaard relevantie
  if (!context || Object.keys(context).length === 0) {
    return relevanceScore;
  }
  
  // Controleer relevantie voor business doelen
  if (context.businessGoals && recommendation.businessGoals) {
    const matchingGoals = context.businessGoals.filter(goal => 
      recommendation.businessGoals.includes(goal)
    );
    
    if (matchingGoals.length > 0) {
      relevanceScore += 0.2 * (matchingGoals.length / context.businessGoals.length);
    }
  }
  
  // Controleer relevantie voor doelgroep
  if (context.targetAudience && recommendation.targetAudience) {
    if (recommendation.targetAudience === context.targetAudience) {
      relevanceScore += 0.2;
    }
  }
  
  // Controleer relevantie voor platform
  if (context.platform && recommendation.platform) {
    if (recommendation.platform === context.platform) {
      relevanceScore += 0.2;
    }
  }
  
  // Controleer relevantie voor seizoen/periode
  if (context.season && recommendation.season) {
    if (recommendation.season === context.season) {
      relevanceScore += 0.1;
    }
  }
  
  // Controleer relevantie voor huidige campagnes
  if (context.currentCampaigns && recommendation.relatedCampaigns) {
    const matchingCampaigns = context.currentCampaigns.filter(campaign => 
      recommendation.relatedCampaigns.includes(campaign)
    );
    
    if (matchingCampaigns.length > 0) {
      relevanceScore += 0.1 * (matchingCampaigns.length / context.currentCampaigns.length);
    }
  }
  
  // Begrens score tussen 0 en 1
  return Math.min(1, Math.max(0, relevanceScore));
};

/**
 * Berekent een betrouwbaarheid score voor een aanbeveling
 * @param {Object} recommendation - Aanbeveling object
 * @returns {Number} Betrouwbaarheid score (0-1)
 */
const calculateConfidenceScore = (recommendation) => {
  // Als er een expliciete confidence score is, gebruik deze
  if (recommendation.confidence !== undefined) {
    return normalizeScore(recommendation.confidence);
  }
  
  let confidenceScore = 0.5; // Standaard betrouwbaarheid
  
  // Controleer data kwaliteit
  if (recommendation.dataQuality) {
    const qualityScores = {
      'high': 0.3,
      'medium': 0.2,
      'low': 0.1
    };
    
    confidenceScore += qualityScores[recommendation.dataQuality] || 0;
  }
  
  // Controleer sample size
  if (recommendation.sampleSize) {
    if (recommendation.sampleSize >= 1000) {
      confidenceScore += 0.3;
    } else if (recommendation.sampleSize >= 100) {
      confidenceScore += 0.2;
    } else if (recommendation.sampleSize >= 10) {
      confidenceScore += 0.1;
    }
  }
  
  // Controleer of er vergelijkbare aanbevelingen zijn
  if (recommendation.similarRecommendations) {
    confidenceScore += 0.1 * Math.min(3, recommendation.similarRecommendations) / 3;
  }
  
  // Controleer of er externe bronnen zijn
  if (recommendation.externalSources && Array.isArray(recommendation.externalSources)) {
    confidenceScore += 0.1 * Math.min(3, recommendation.externalSources.length) / 3;
  }
  
  // Begrens score tussen 0 en 1
  return Math.min(1, Math.max(0, confidenceScore));
};

/**
 * Normaliseert een score naar een 0-1 bereik
 * @param {Number|String} score - Score om te normaliseren
 * @returns {Number} Genormaliseerde score (0-1)
 */
const normalizeScore = (score) => {
  // Als score een string is, converteer naar nummer
  if (typeof score === 'string') {
    // Probeer percentage string te parsen
    if (score.endsWith('%')) {
      return parseFloat(score) / 100;
    }
    
    // Probeer numerieke string te parsen
    const parsed = parseFloat(score);
    if (!isNaN(parsed)) {
      // Als score tussen 0-10 is, deel door 10
      if (parsed >= 0 && parsed <= 10) {
        return parsed / 10;
      }
      
      // Als score tussen 0-100 is, deel door 100
      if (parsed > 10 && parsed <= 100) {
        return parsed / 100;
      }
    }
    
    // Als score niet numeriek is, gebruik categorieën
    const categories = {
      'very_high': 0.9,
      'high': 0.8,
      'medium_high': 0.7,
      'medium': 0.5,
      'medium_low': 0.4,
      'low': 0.3,
      'very_low': 0.1
    };
    
    return categories[score.toLowerCase()] || 0.5;
  }
  
  // Als score een nummer is
  if (typeof score === 'number') {
    // Als score al tussen 0-1 is, return als is
    if (score >= 0 && score <= 1) {
      return score;
    }
    
    // Als score tussen 0-10 is, deel door 10
    if (score > 1 && score <= 10) {
      return score / 10;
    }
    
    // Als score tussen 0-100 is, deel door 100
    if (score > 10 && score <= 100) {
      return score / 100;
    }
  }
  
  // Standaard score
  return 0.5;
};

/**
 * Groepeert aanbevelingen per categorie en prioriteit
 * @param {Array} recommendations - Array met geprioriteerde aanbevelingen
 * @returns {Object} Object met gegroepeerde aanbevelingen
 */
export const groupRecommendationsByCategory = (recommendations = []) => {
  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return {};
  }
  
  // Groepeer aanbevelingen per categorie
  const categorized = recommendations.reduce((acc, recommendation) => {
    const category = recommendation.category || 'general';
    
    if (!acc[category]) {
      acc[category] = {
        high: [],
        medium: [],
        low: []
      };
    }
    
    const priority = recommendation.priority || 'medium';
    acc[category][priority].push(recommendation);
    
    return acc;
  }, {});
  
  return categorized;
};

/**
 * Filtert aanbevelingen op basis van context en criteria
 * @param {Array} recommendations - Array met aanbevelingen
 * @param {Object} filters - Filter criteria
 * @returns {Array} Gefilterde aanbevelingen
 */
export const filterRecommendations = (recommendations = [], filters = {}) => {
  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    return [];
  }
  
  // Als er geen filters zijn, return alle aanbevelingen
  if (!filters || Object.keys(filters).length === 0) {
    return recommendations;
  }
  
  return recommendations.filter(recommendation => {
    // Filter op categorie
    if (filters.category && recommendation.category !== filters.category) {
      return false;
    }
    
    // Filter op prioriteit
    if (filters.priority && recommendation.priority !== filters.priority) {
      return false;
    }
    
    // Filter op type
    if (filters.type && recommendation.type !== filters.type) {
      return false;
    }
    
    // Filter op minimale impact score
    if (filters.minImpact !== undefined && recommendation.priorityScore < filters.minImpact) {
      return false;
    }
    
    // Filter op maximale effort
    if (filters.maxEffort !== undefined) {
      const effortScore = calculateEffortScore(recommendation);
      if (1 - effortScore > filters.maxEffort) {
        return false;
      }
    }
    
    // Filter op doelgroep
    if (filters.targetAudience && recommendation.targetAudience !== filters.targetAudience) {
      return false;
    }
    
    // Filter op platform
    if (filters.platform && recommendation.platform !== filters.platform) {
      return false;
    }
    
    // Filter op implementatie tijd
    if (filters.implementationTime && recommendation.implementationTime !== filters.implementationTime) {
      return false;
    }
    
    // Filter op business doel
    if (filters.businessGoal && recommendation.businessGoals) {
      if (!recommendation.businessGoals.includes(filters.businessGoal)) {
        return false;
      }
    }
    
    return true;
  });
};
