/**
 * Centrale recommendation engine die alle componenten integreert
 */
import { analyzeSentimentPatterns, analyzeCompetitorPatterns, analyzeAudiencePatterns } from './patternAnalysis';
import { categorizeInsights, groupInsightsBySubcategory, prioritizeInsights } from './insightCategorization';
import { prioritizeRecommendations, groupRecommendationsByCategory, filterRecommendations } from './recommendationPrioritization';
import { generateRecommendations, generateRecommendationReport } from './recommendationTemplates';

/**
 * Genereert aanbevelingen op basis van verschillende databronnen en context
 * @param {Object} data - Object met verschillende databronnen
 * @param {Object} context - Context informatie voor aanbevelingen
 * @param {Object} options - Configuratie opties
 * @returns {Object} Object met aanbevelingen en metadata
 */
export const generateMarketingRecommendations = (data = {}, context = {}, options = {}) => {
  const {
    maxRecommendations = 15,
    includePatterns = false,
    includeRawData = false,
    filterCriteria = {}
  } = options;
  
  // Stap 1: Analyseer patronen in verschillende databronnen
  const patterns = analyzeDataPatterns(data, options);
  
  // Stap 2: Genereer aanbevelingen op basis van patronen
  let recommendations = generateRecommendations(patterns, context);
  
  // Stap 3: Prioriteer aanbevelingen
  recommendations = prioritizeRecommendations(recommendations, context);
  
  // Stap 4: Filter aanbevelingen indien nodig
  if (Object.keys(filterCriteria).length > 0) {
    recommendations = filterRecommendations(recommendations, filterCriteria);
  }
  
  // Stap 5: Beperk aantal aanbevelingen
  recommendations = recommendations.slice(0, maxRecommendations);
  
  // Stap 6: Groepeer aanbevelingen per categorie en prioriteit
  const groupedRecommendations = groupRecommendationsByCategory(recommendations);
  
  // Stap 7: Genereer aanbevelingsrapport
  const report = generateRecommendationReport(recommendations, {
    projectName: context.projectName || 'MarketPulse AI Analyse',
    includePatterns,
    maxRecommendations
  });
  
  // Bereid resultaat voor
  const result = {
    recommendations,
    groupedRecommendations,
    report,
    metadata: {
      totalRecommendations: recommendations.length,
      generatedAt: new Date().toISOString(),
      context: { ...context }
    }
  };
  
  // Voeg patronen toe indien gewenst
  if (includePatterns) {
    result.patterns = patterns;
  }
  
  // Voeg ruwe data toe indien gewenst
  if (includeRawData) {
    result.rawData = data;
  }
  
  return result;
};

/**
 * Analyseert patronen in verschillende databronnen
 * @param {Object} data - Object met verschillende databronnen
 * @param {Object} options - Configuratie opties
 * @returns {Array} Array met geïdentificeerde patronen
 */
const analyzeDataPatterns = (data, options = {}) => {
  const patterns = [];
  
  // Analyseer sentiment data
  if (data.sentimentData && Array.isArray(data.sentimentData) && data.sentimentData.length > 0) {
    const sentimentPatterns = analyzeSentimentPatterns(data.sentimentData, options.sentimentOptions || {});
    patterns.push(...sentimentPatterns);
  }
  
  // Analyseer competitor data
  if (data.competitorData && Array.isArray(data.competitorData) && data.competitorData.length > 0) {
    const competitorPatterns = analyzeCompetitorPatterns(data.competitorData, options.competitorOptions || {});
    patterns.push(...competitorPatterns);
  }
  
  // Analyseer audience data
  if (data.audienceData) {
    const audiencePatterns = analyzeAudiencePatterns(data.audienceData, options.audienceOptions || {});
    patterns.push(...audiencePatterns);
  }
  
  return patterns;
};

/**
 * Verwerkt inzichten en genereert aanbevelingen
 * @param {Array} insights - Array met inzichten
 * @param {Object} context - Context informatie
 * @param {Object} options - Configuratie opties
 * @returns {Object} Object met aanbevelingen en metadata
 */
export const processInsightsToRecommendations = (insights = [], context = {}, options = {}) => {
  // Stap 1: Categoriseer inzichten
  const categorizedInsights = categorizeInsights(insights);
  
  // Stap 2: Groepeer inzichten per subcategorie
  const groupedInsights = groupInsightsBySubcategory(categorizedInsights);
  
  // Stap 3: Prioriteer inzichten
  const prioritizedInsights = prioritizeInsights(groupedInsights, options);
  
  // Stap 4: Converteer inzichten naar patronen
  const patterns = convertInsightsToPatterns(prioritizedInsights);
  
  // Stap 5: Genereer aanbevelingen op basis van patronen
  return generateMarketingRecommendations({ insightPatterns: patterns }, context, options);
};

/**
 * Converteert geprioriteerde inzichten naar patronen
 * @param {Object} prioritizedInsights - Object met geprioriteerde inzichten
 * @returns {Array} Array met patronen
 */
const convertInsightsToPatterns = (prioritizedInsights) => {
  const patterns = [];
  
  // Converteer pijnpunten naar patronen
  if (prioritizedInsights.painPoints) {
    Object.entries(prioritizedInsights.painPoints).forEach(([subcategory, insights]) => {
      if (insights.length > 0) {
        patterns.push({
          type: 'dominant_pain_points',
          categories: [{ category: subcategory, count: insights.length, percentage: 100 }],
          description: `Dominante pijnpunten: ${subcategory}`
        });
      }
    });
  }
  
  // Converteer verlangens naar patronen
  if (prioritizedInsights.desires) {
    Object.entries(prioritizedInsights.desires).forEach(([subcategory, insights]) => {
      if (insights.length > 0) {
        patterns.push({
          type: 'dominant_desires',
          categories: [{ category: subcategory, count: insights.length, percentage: 100 }],
          description: `Dominante verlangens: ${subcategory}`
        });
      }
    });
  }
  
  // Converteer kansen naar patronen
  if (prioritizedInsights.opportunities) {
    Object.entries(prioritizedInsights.opportunities).forEach(([subcategory, insights]) => {
      if (insights.length > 0) {
        const highPriorityInsights = insights.filter(insight => insight.priority === 'high');
        if (highPriorityInsights.length > 0) {
          patterns.push({
            type: 'market_opportunity',
            category: subcategory,
            count: highPriorityInsights.length,
            percentage: (highPriorityInsights.length / insights.length) * 100,
            description: `Marktkans: ${subcategory}`
          });
        }
      }
    });
  }
  
  // Converteer bedreigingen naar patronen
  if (prioritizedInsights.threats) {
    Object.entries(prioritizedInsights.threats).forEach(([subcategory, insights]) => {
      if (insights.length > 0) {
        const highPriorityInsights = insights.filter(insight => insight.priority === 'high');
        if (highPriorityInsights.length > 0) {
          patterns.push({
            type: 'market_threat',
            category: subcategory,
            count: highPriorityInsights.length,
            percentage: (highPriorityInsights.length / insights.length) * 100,
            description: `Marktbedreiging: ${subcategory}`
          });
        }
      }
    });
  }
  
  return patterns;
};

/**
 * Haalt aanbevelingen op voor een specifieke context
 * @param {Object} data - Object met verschillende databronnen
 * @param {Object} context - Context informatie
 * @param {Object} filters - Filter criteria
 * @returns {Array} Array met gefilterde aanbevelingen
 */
export const getRecommendationsForContext = (data, context, filters = {}) => {
  // Genereer alle aanbevelingen
  const { recommendations } = generateMarketingRecommendations(data, context);
  
  // Pas context-specifieke filtering toe
  let contextualRecommendations = recommendations;
  
  // Filter op basis van huidige business doelen
  if (context.currentGoals && Array.isArray(context.currentGoals) && context.currentGoals.length > 0) {
    contextualRecommendations = contextualRecommendations.filter(rec => {
      if (!rec.businessGoals || !Array.isArray(rec.businessGoals)) return true;
      return rec.businessGoals.some(goal => context.currentGoals.includes(goal));
    });
  }
  
  // Filter op basis van beschikbare resources
  if (context.availableResources) {
    const resourceLevels = {
      'low': ['quick_win', 'low'],
      'medium': ['quick_win', 'low', 'medium'],
      'high': ['quick_win', 'low', 'medium', 'high']
    };
    
    const allowedEffortLevels = resourceLevels[context.availableResources] || resourceLevels.medium;
    
    contextualRecommendations = contextualRecommendations.filter(rec => {
      return allowedEffortLevels.includes(rec.effortCategory);
    });
  }
  
  // Filter op basis van tijdsperiode
  if (context.timeFrame) {
    const timeFrames = {
      'short': ['immediate', 'days', 'weeks'],
      'medium': ['immediate', 'days', 'weeks', 'months'],
      'long': ['immediate', 'days', 'weeks', 'months', 'quarters']
    };
    
    const allowedTimeFrames = timeFrames[context.timeFrame] || timeFrames.medium;
    
    contextualRecommendations = contextualRecommendations.filter(rec => {
      return allowedTimeFrames.includes(rec.implementationTime);
    });
  }
  
  // Pas gebruikergedefinieerde filters toe
  if (Object.keys(filters).length > 0) {
    contextualRecommendations = filterRecommendations(contextualRecommendations, filters);
  }
  
  return contextualRecommendations;
};

/**
 * Genereert een bundel van gerelateerde aanbevelingen
 * @param {Array} recommendations - Array met aanbevelingen
 * @param {Object} options - Configuratie opties
 * @returns {Array} Array met aanbevelingsbundels
 */
export const bundleRelatedRecommendations = (recommendations = [], options = {}) => {
  const {
    maxBundles = 5,
    minRecommendationsPerBundle = 2,
    similarityThreshold = 0.3
  } = options;
  
  // Als er niet genoeg aanbevelingen zijn, return lege array
  if (!Array.isArray(recommendations) || recommendations.length < minRecommendationsPerBundle) {
    return [];
  }
  
  // Stap 1: Bereken similariteit tussen aanbevelingen
  const similarityMatrix = calculateRecommendationSimilarity(recommendations);
  
  // Stap 2: Groepeer aanbevelingen op basis van similariteit
  const bundles = [];
  const assignedRecommendations = new Set();
  
  // Begin met de aanbevelingen met hoogste prioriteit
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityScore = { 'high': 3, 'medium': 2, 'low': 1 };
    return (priorityScore[b.priority] || 2) - (priorityScore[a.priority] || 2);
  });
  
  // Maak bundels
  for (const recommendation of sortedRecommendations) {
    if (assignedRecommendations.has(recommendation.id)) continue;
    
    // Vind gerelateerde aanbevelingen
    const relatedRecommendations = recommendations
      .filter(rec => 
        rec.id !== recommendation.id && 
        !assignedRecommendations.has(rec.id) &&
        similarityMatrix[recommendation.id][rec.id] >= similarityThreshold
      )
      .sort((a, b) => 
        similarityMatrix[recommendation.id][b.id] - similarityMatrix[recommendation.id][a.id]
      );
    
    // Als er genoeg gerelateerde aanbevelingen zijn, maak een bundel
    if (relatedRecommendations.length >= minRecommendationsPerBundle - 1) {
      const bundle = {
        id: `bundle_${bundles.length + 1}`,
        title: generateBundleTitle(recommendation, relatedRecommendations),
        description: generateBundleDescription(recommendation, relatedRecommendations),
        recommendations: [recommendation, ...relatedRecommendations.slice(0, minRecommendationsPerBundle - 1)],
        category: recommendation.category,
        priority: recommendation.priority
      };
      
      bundles.push(bundle);
      
      // Markeer aanbevelingen als toegewezen
      bundle.recommendations.forEach(rec => assignedRecommendations.add(rec.id));
      
      // Stop als we het maximum aantal bundels hebben bereikt
      if (bundles.length >= maxBundles) break;
    }
  }
  
  return bundles;
};

/**
 * Berekent similariteit tussen aanbevelingen
 * @param {Array} recommendations - Array met aanbevelingen
 * @returns {Object} Similariteitsmatrix
 */
const calculateRecommendationSimilarity = (recommendations) => {
  const similarityMatrix = {};
  
  // Initialiseer matrix
  recommendations.forEach(rec1 => {
    similarityMatrix[rec1.id] = {};
    recommendations.forEach(rec2 => {
      similarityMatrix[rec1.id][rec2.id] = 0;
    });
  });
  
  // Bereken similariteit
  recommendations.forEach(rec1 => {
    recommendations.forEach(rec2 => {
      if (rec1.id === rec2.id) {
        similarityMatrix[rec1.id][rec2.id] = 1;
        return;
      }
      
      let similarity = 0;
      
      // Zelfde categorie
      if (rec1.category === rec2.category) {
        similarity += 0.3;
      }
      
      // Zelfde type
      if (rec1.type === rec2.type) {
        similarity += 0.2;
      }
      
      // Zelfde business goals
      if (rec1.businessGoals && rec2.businessGoals) {
        const commonGoals = rec1.businessGoals.filter(goal => rec2.businessGoals.includes(goal));
        similarity += 0.1 * (commonGoals.length / Math.max(rec1.businessGoals.length, rec2.businessGoals.length));
      }
      
      // Zelfde patroon type
      if (rec1.pattern && rec2.pattern && rec1.pattern.type === rec2.pattern.type) {
        similarity += 0.2;
      }
      
      // Vergelijkbare effort/impact
      if (rec1.effortCategory === rec2.effortCategory) {
        similarity += 0.1;
      }
      
      if (rec1.impactCategory === rec2.impactCategory) {
        similarity += 0.1;
      }
      
      similarityMatrix[rec1.id][rec2.id] = similarity;
    });
  });
  
  return similarityMatrix;
};

/**
 * Genereert een titel voor een aanbevelingsbundel
 * @param {Object} mainRecommendation - Hoofdaanbeveling
 * @param {Array} relatedRecommendations - Gerelateerde aanbevelingen
 * @returns {String} Bundeltitel
 */
const generateBundleTitle = (mainRecommendation, relatedRecommendations) => {
  const categoryMap = {
    'content': 'Content Strategie',
    'marketing': 'Marketing',
    'product': 'Product Ontwikkeling',
    'pricing': 'Prijsstrategie',
    'social_media': 'Social Media',
    'strategic': 'Strategische Initiatieven'
  };
  
  const category = categoryMap[mainRecommendation.category] || mainRecommendation.category;
  
  return `${category} Initiatief: ${mainRecommendation.title.split(':')[0]}`;
};

/**
 * Genereert een beschrijving voor een aanbevelingsbundel
 * @param {Object} mainRecommendation - Hoofdaanbeveling
 * @param {Array} relatedRecommendations - Gerelateerde aanbevelingen
 * @returns {String} Bundelbeschrijving
 */
const generateBundleDescription = (mainRecommendation, relatedRecommendations) => {
  return `Een gecoördineerde aanpak met ${relatedRecommendations.length + 1} gerelateerde initiatieven om ${mainRecommendation.description.toLowerCase()}`;
};
