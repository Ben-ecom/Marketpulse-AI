/**
 * Utility functies voor het analyseren van data patronen voor het aanbevelingssysteem
 */

/**
 * Analyseert sentiment data en identificeert significante patronen
 * @param {Array} sentimentData - Array met sentiment data
 * @param {Object} options - Configuratie opties
 * @returns {Array} Array met geïdentificeerde patronen
 */
export const analyzeSentimentPatterns = (sentimentData = [], options = {}) => {
  const {
    significanceThreshold = 0.15, // Minimaal verschil om als significant te beschouwen
    minSampleSize = 10,          // Minimale steekproefgrootte voor betrouwbare analyse
    timeRangeInDays = 30         // Tijdsbereik voor trend analyse in dagen
  } = options;
  
  if (!Array.isArray(sentimentData) || sentimentData.length < minSampleSize) {
    return [];
  }
  
  const patterns = [];
  
  // 1. Analyseer algemene sentiment verdeling
  const sentimentDistribution = calculateSentimentDistribution(sentimentData);
  
  // Controleer op dominante sentiment categorie
  const dominantCategory = getDominantCategory(sentimentDistribution);
  if (dominantCategory) {
    patterns.push({
      type: 'dominant_sentiment',
      category: dominantCategory.category,
      percentage: dominantCategory.percentage,
      significance: dominantCategory.significance,
      description: `${dominantCategory.category.charAt(0).toUpperCase() + dominantCategory.category.slice(1)} sentiment is dominant met ${dominantCategory.percentage.toFixed(1)}%`
    });
  }
  
  // 2. Analyseer sentiment per platform
  const platformSentiment = analyzeSentimentByPlatform(sentimentData);
  
  // Zoek platforms met afwijkend sentiment
  Object.entries(platformSentiment).forEach(([platform, distribution]) => {
    const platformDominant = getDominantCategory(distribution);
    
    if (platformDominant && Math.abs(platformDominant.percentage - sentimentDistribution[platformDominant.category]) > significanceThreshold * 100) {
      patterns.push({
        type: 'platform_sentiment_deviation',
        platform,
        category: platformDominant.category,
        percentage: platformDominant.percentage,
        overallPercentage: sentimentDistribution[platformDominant.category],
        difference: platformDominant.percentage - sentimentDistribution[platformDominant.category],
        description: `${platform} toont ${platformDominant.percentage.toFixed(1)}% ${platformDominant.category} sentiment, wat ${Math.abs(platformDominant.percentage - sentimentDistribution[platformDominant.category]).toFixed(1)}% ${platformDominant.percentage > sentimentDistribution[platformDominant.category] ? 'hoger' : 'lager'} is dan gemiddeld`
      });
    }
  });
  
  // 3. Analyseer sentiment trends over tijd
  const sentimentTrends = analyzeSentimentTrends(sentimentData, timeRangeInDays);
  
  // Voeg significante trends toe aan patronen
  sentimentTrends.forEach(trend => {
    if (Math.abs(trend.changePercentage) > significanceThreshold * 100) {
      patterns.push({
        type: 'sentiment_trend',
        category: trend.category,
        direction: trend.changePercentage > 0 ? 'increasing' : 'decreasing',
        changePercentage: trend.changePercentage,
        description: `${trend.category.charAt(0).toUpperCase() + trend.category.slice(1)} sentiment is ${trend.changePercentage > 0 ? 'toegenomen' : 'afgenomen'} met ${Math.abs(trend.changePercentage).toFixed(1)}% in de afgelopen ${timeRangeInDays} dagen`
      });
    }
  });
  
  return patterns;
};

/**
 * Analyseert competitor data en identificeert significante patronen
 * @param {Array} competitorData - Array met competitor data
 * @param {Object} options - Configuratie opties
 * @returns {Array} Array met geïdentificeerde patronen
 */
export const analyzeCompetitorPatterns = (competitorData = [], options = {}) => {
  const {
    significanceThreshold = 0.15, // Minimaal verschil om als significant te beschouwen
    minSampleSize = 3            // Minimale aantal concurrenten voor vergelijking
  } = options;
  
  if (!Array.isArray(competitorData) || competitorData.length < minSampleSize) {
    return [];
  }
  
  const patterns = [];
  
  // 1. Analyseer marktaandeel verdeling
  const marketShareDistribution = calculateMarketShareDistribution(competitorData);
  
  // Identificeer dominante spelers
  const dominantCompetitors = marketShareDistribution
    .filter(item => item.percentage > (1 / competitorData.length) + significanceThreshold)
    .sort((a, b) => b.percentage - a.percentage);
  
  if (dominantCompetitors.length > 0) {
    patterns.push({
      type: 'dominant_competitors',
      competitors: dominantCompetitors,
      description: `${dominantCompetitors.map(c => c.name).join(', ')} ${dominantCompetitors.length === 1 ? 'is dominant' : 'zijn dominant'} in de markt met ${dominantCompetitors.map(c => `${c.percentage.toFixed(1)}%`).join(', ')} marktaandeel`
    });
  }
  
  // 2. Analyseer prijspositionering
  const pricePositioning = analyzePricePositioning(competitorData);
  
  // Identificeer prijsuitschieters
  if (pricePositioning.outliers.length > 0) {
    patterns.push({
      type: 'price_outliers',
      outliers: pricePositioning.outliers,
      description: `${pricePositioning.outliers.map(o => o.name).join(', ')} ${pricePositioning.outliers.length === 1 ? 'heeft een' : 'hebben een'} ${pricePositioning.outliers[0].position} prijspositie in vergelijking met concurrenten`
    });
  }
  
  // 3. Analyseer feature differentiatie
  const featureDifferentiation = analyzeFeatureDifferentiation(competitorData);
  
  // Identificeer unieke features
  if (featureDifferentiation.uniqueFeatures.length > 0) {
    patterns.push({
      type: 'unique_features',
      features: featureDifferentiation.uniqueFeatures,
      description: `Unieke features in de markt: ${featureDifferentiation.uniqueFeatures.map(f => f.feature).join(', ')}`
    });
  }
  
  // Identificeer feature gaps
  if (featureDifferentiation.featureGaps.length > 0) {
    patterns.push({
      type: 'feature_gaps',
      gaps: featureDifferentiation.featureGaps,
      description: `Feature gaps geïdentificeerd: ${featureDifferentiation.featureGaps.join(', ')}`
    });
  }
  
  return patterns;
};

/**
 * Analyseert audience data en identificeert significante patronen
 * @param {Array} audienceData - Array met audience data
 * @param {Object} options - Configuratie opties
 * @returns {Array} Array met geïdentificeerde patronen
 */
export const analyzeAudiencePatterns = (audienceData = {}, options = {}) => {
  const {
    significanceThreshold = 0.15, // Minimaal verschil om als significant te beschouwen
    minSampleSize = 10           // Minimale steekproefgrootte voor betrouwbare analyse
  } = options;
  
  if (!audienceData || !audienceData.painPoints || !audienceData.desires) {
    return [];
  }
  
  const patterns = [];
  
  // 1. Analyseer pijnpunten
  if (Array.isArray(audienceData.painPoints) && audienceData.painPoints.length >= minSampleSize) {
    const painPointCategories = categorizePainPoints(audienceData.painPoints);
    
    // Identificeer dominante pijnpunt categorieën
    const dominantPainPoints = painPointCategories
      .filter(item => item.percentage > (1 / painPointCategories.length) + significanceThreshold)
      .sort((a, b) => b.percentage - a.percentage);
    
    if (dominantPainPoints.length > 0) {
      patterns.push({
        type: 'dominant_pain_points',
        categories: dominantPainPoints,
        description: `Dominante pijnpunten: ${dominantPainPoints.map(p => p.category).join(', ')}`
      });
    }
  }
  
  // 2. Analyseer verlangens/wensen
  if (Array.isArray(audienceData.desires) && audienceData.desires.length >= minSampleSize) {
    const desireCategories = categorizeDesires(audienceData.desires);
    
    // Identificeer dominante verlangen categorieën
    const dominantDesires = desireCategories
      .filter(item => item.percentage > (1 / desireCategories.length) + significanceThreshold)
      .sort((a, b) => b.percentage - a.percentage);
    
    if (dominantDesires.length > 0) {
      patterns.push({
        type: 'dominant_desires',
        categories: dominantDesires,
        description: `Dominante verlangens: ${dominantDesires.map(d => d.category).join(', ')}`
      });
    }
  }
  
  // 3. Analyseer demografische patronen
  if (audienceData.demographics && audienceData.demographics.length >= minSampleSize) {
    const demographicPatterns = analyzeDemographics(audienceData.demographics);
    
    // Voeg significante demografische patronen toe
    Object.entries(demographicPatterns).forEach(([key, value]) => {
      if (value.significance > significanceThreshold) {
        patterns.push({
          type: 'demographic_pattern',
          demographic: key,
          value: value.dominant,
          percentage: value.percentage,
          description: `Dominante ${key}: ${value.dominant} (${value.percentage.toFixed(1)}%)`
        });
      }
    });
  }
  
  return patterns;
};

/**
 * Berekent de sentiment verdeling in de data
 * @param {Array} data - Array met sentiment data
 * @returns {Object} Object met sentiment verdeling percentages
 */
const calculateSentimentDistribution = (data) => {
  const total = data.length;
  const counts = data.reduce((acc, item) => {
    const score = item.sentiment_score || 0;
    
    if (score > 0.2) {
      acc.positive += 1;
    } else if (score < -0.2) {
      acc.negative += 1;
    } else {
      acc.neutral += 1;
    }
    
    return acc;
  }, { positive: 0, negative: 0, neutral: 0 });
  
  return {
    positive: (counts.positive / total) * 100,
    negative: (counts.negative / total) * 100,
    neutral: (counts.neutral / total) * 100
  };
};

/**
 * Bepaalt de dominante categorie in een sentiment verdeling
 * @param {Object} distribution - Object met sentiment verdeling percentages
 * @returns {Object|null} Dominante categorie object of null
 */
const getDominantCategory = (distribution) => {
  const categories = Object.entries(distribution)
    .map(([category, percentage]) => ({ category, percentage }))
    .sort((a, b) => b.percentage - a.percentage);
  
  if (categories.length < 2) return null;
  
  const [dominant, second] = categories;
  const significance = (dominant.percentage - second.percentage) / 100;
  
  // Als het verschil significant is (>10%), beschouw het als dominant
  if (dominant.percentage - second.percentage > 10) {
    return { ...dominant, significance };
  }
  
  return null;
};

/**
 * Analyseert sentiment per platform
 * @param {Array} data - Array met sentiment data
 * @returns {Object} Object met sentiment verdeling per platform
 */
const analyzeSentimentByPlatform = (data) => {
  // Groepeer data per platform
  const platformGroups = data.reduce((acc, item) => {
    const platform = item.platform || 'unknown';
    
    if (!acc[platform]) {
      acc[platform] = [];
    }
    
    acc[platform].push(item);
    
    return acc;
  }, {});
  
  // Bereken sentiment verdeling per platform
  const result = {};
  
  Object.entries(platformGroups).forEach(([platform, items]) => {
    if (items.length > 5) { // Minimaal 5 items voor betrouwbare analyse
      result[platform] = calculateSentimentDistribution(items);
    }
  });
  
  return result;
};

/**
 * Analyseert sentiment trends over tijd
 * @param {Array} data - Array met sentiment data
 * @param {Number} timeRangeInDays - Tijdsbereik voor analyse in dagen
 * @returns {Array} Array met trend objecten
 */
const analyzeSentimentTrends = (data, timeRangeInDays) => {
  const now = new Date();
  const timeThreshold = new Date(now.getTime() - (timeRangeInDays * 24 * 60 * 60 * 1000));
  
  // Verdeel data in recente en oudere items
  const recentItems = data.filter(item => {
    const date = new Date(item.timestamp || item.created_at || 0);
    return date >= timeThreshold;
  });
  
  const olderItems = data.filter(item => {
    const date = new Date(item.timestamp || item.created_at || 0);
    return date < timeThreshold;
  });
  
  // Als er niet genoeg data is voor beide periodes, return lege array
  if (recentItems.length < 5 || olderItems.length < 5) {
    return [];
  }
  
  // Bereken sentiment verdeling voor beide periodes
  const recentDistribution = calculateSentimentDistribution(recentItems);
  const olderDistribution = calculateSentimentDistribution(olderItems);
  
  // Bereken veranderingen
  return Object.keys(recentDistribution).map(category => {
    const recent = recentDistribution[category];
    const older = olderDistribution[category];
    const changePercentage = recent - older;
    
    return {
      category,
      recent,
      older,
      changePercentage
    };
  });
};

/**
 * Berekent de marktaandeel verdeling
 * @param {Array} competitors - Array met competitor data
 * @returns {Array} Array met marktaandeel objecten
 */
const calculateMarketShareDistribution = (competitors) => {
  const totalMarketShare = competitors.reduce((sum, comp) => sum + (comp.marketShare || 0), 0);
  
  return competitors.map(comp => ({
    id: comp.id,
    name: comp.name,
    marketShare: comp.marketShare || 0,
    percentage: totalMarketShare > 0 ? ((comp.marketShare || 0) / totalMarketShare) * 100 : 0
  }));
};

/**
 * Analyseert prijspositionering van concurrenten
 * @param {Array} competitors - Array met competitor data
 * @returns {Object} Object met prijspositionering analyse
 */
const analyzePricePositioning = (competitors) => {
  // Verzamel prijzen
  const prices = competitors.map(comp => ({
    id: comp.id,
    name: comp.name,
    price: comp.price || 0
  }));
  
  // Bereken gemiddelde en standaarddeviatie
  const avgPrice = prices.reduce((sum, item) => sum + item.price, 0) / prices.length;
  
  const stdDev = Math.sqrt(
    prices.reduce((sum, item) => sum + Math.pow(item.price - avgPrice, 2), 0) / prices.length
  );
  
  // Identificeer uitschieters (>1.5 standaarddeviatie van gemiddelde)
  const outliers = prices.filter(item => {
    const zScore = Math.abs(item.price - avgPrice) / stdDev;
    return zScore > 1.5;
  }).map(item => ({
    ...item,
    position: item.price > avgPrice ? 'premium' : 'budget'
  }));
  
  return {
    average: avgPrice,
    stdDev,
    outliers
  };
};

/**
 * Analyseert feature differentiatie tussen concurrenten
 * @param {Array} competitors - Array met competitor data
 * @returns {Object} Object met feature differentiatie analyse
 */
const analyzeFeatureDifferentiation = (competitors) => {
  // Verzamel alle features
  const allFeatures = new Set();
  const featureCounts = {};
  
  competitors.forEach(comp => {
    if (Array.isArray(comp.features)) {
      comp.features.forEach(feature => {
        allFeatures.add(feature);
        featureCounts[feature] = (featureCounts[feature] || 0) + 1;
      });
    }
  });
  
  // Identificeer unieke features (slechts bij één concurrent)
  const uniqueFeatures = Object.entries(featureCounts)
    .filter(([_, count]) => count === 1)
    .map(([feature]) => {
      const competitor = competitors.find(comp => 
        Array.isArray(comp.features) && comp.features.includes(feature)
      );
      
      return {
        feature,
        competitorId: competitor ? competitor.id : null,
        competitorName: competitor ? competitor.name : 'Unknown'
      };
    });
  
  // Identificeer feature gaps (features die bij de meeste concurrenten voorkomen maar niet bij alle)
  const featureGaps = Object.entries(featureCounts)
    .filter(([_, count]) => count > competitors.length / 2 && count < competitors.length)
    .map(([feature]) => feature);
  
  return {
    uniqueFeatures,
    featureGaps
  };
};

/**
 * Categoriseert pijnpunten in categorieën
 * @param {Array} painPoints - Array met pijnpunt data
 * @returns {Array} Array met gecategoriseerde pijnpunten
 */
const categorizePainPoints = (painPoints) => {
  // Groepeer pijnpunten per categorie
  const categories = painPoints.reduce((acc, item) => {
    const category = item.category || 'uncategorized';
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += 1;
    
    return acc;
  }, {});
  
  // Converteer naar array met percentages
  const total = painPoints.length;
  
  return Object.entries(categories).map(([category, count]) => ({
    category,
    count,
    percentage: (count / total) * 100
  })).sort((a, b) => b.percentage - a.percentage);
};

/**
 * Categoriseert verlangens in categorieën
 * @param {Array} desires - Array met verlangen data
 * @returns {Array} Array met gecategoriseerde verlangens
 */
const categorizeDesires = (desires) => {
  // Groepeer verlangens per categorie
  const categories = desires.reduce((acc, item) => {
    const category = item.category || 'uncategorized';
    
    if (!acc[category]) {
      acc[category] = 0;
    }
    
    acc[category] += 1;
    
    return acc;
  }, {});
  
  // Converteer naar array met percentages
  const total = desires.length;
  
  return Object.entries(categories).map(([category, count]) => ({
    category,
    count,
    percentage: (count / total) * 100
  })).sort((a, b) => b.percentage - a.percentage);
};

/**
 * Analyseert demografische data
 * @param {Array} demographics - Array met demografische data
 * @returns {Object} Object met demografische patronen
 */
const analyzeDemographics = (demographics) => {
  const result = {};
  const total = demographics.length;
  
  // Analyseer leeftijdsgroepen
  if (demographics.some(d => d.ageGroup)) {
    const ageGroups = demographics.reduce((acc, item) => {
      const group = item.ageGroup;
      if (group) {
        acc[group] = (acc[group] || 0) + 1;
      }
      return acc;
    }, {});
    
    const dominantAgeGroup = Object.entries(ageGroups)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (dominantAgeGroup) {
      const [group, count] = dominantAgeGroup;
      const percentage = (count / total) * 100;
      const secondHighest = Object.entries(ageGroups)
        .sort((a, b) => b[1] - a[1])[1];
      
      const significance = secondHighest 
        ? (count - secondHighest[1]) / total 
        : 1;
      
      result.ageGroup = {
        dominant: group,
        percentage,
        significance
      };
    }
  }
  
  // Analyseer geslacht
  if (demographics.some(d => d.gender)) {
    const genders = demographics.reduce((acc, item) => {
      const gender = item.gender;
      if (gender) {
        acc[gender] = (acc[gender] || 0) + 1;
      }
      return acc;
    }, {});
    
    const dominantGender = Object.entries(genders)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (dominantGender) {
      const [gender, count] = dominantGender;
      const percentage = (count / total) * 100;
      const secondHighest = Object.entries(genders)
        .sort((a, b) => b[1] - a[1])[1];
      
      const significance = secondHighest 
        ? (count - secondHighest[1]) / total 
        : 1;
      
      result.gender = {
        dominant: gender,
        percentage,
        significance
      };
    }
  }
  
  // Voeg hier meer demografische analyses toe indien nodig
  
  return result;
};
