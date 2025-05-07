/**
 * Sentiment Analyse Utilities
 * 
 * Deze utilities bieden functies voor het verwerken en analyseren van sentiment data
 * voor visualisatie en filtering in de MarketPulse AI applicatie.
 */

/**
 * Categoriseert sentiment in positief, negatief of neutraal op basis van een score
 * @param {number} score - Sentiment score tussen -1 en 1
 * @returns {string} - 'positive', 'negative', of 'neutral'
 */
export const categorizeSentiment = (score) => {
  if (score > 0.1) return 'positive';
  if (score < -0.1) return 'negative';
  return 'neutral';
};

/**
 * Transformeert sentiment data voor gebruik in een pie chart
 * @param {Object} data - Ruwe sentiment data
 * @param {string} platform - Platform filter (optioneel)
 * @returns {Array} - Array met data voor pie chart
 */
export const transformForPieChart = (data, platform = 'all') => {
  if (!data) return [];
  
  let sentimentData = data;
  
  // Filter op platform indien nodig
  if (platform !== 'all' && data.platforms && data.platforms[platform]) {
    sentimentData = data.platforms[platform];
  } else if (platform !== 'all') {
    // Als platform niet bestaat, gebruik overall data
    sentimentData = data.overall || data;
  }
  
  return [
    { name: 'Positief', value: sentimentData.positive || 0 },
    { name: 'Neutraal', value: sentimentData.neutral || 0 },
    { name: 'Negatief', value: sentimentData.negative || 0 }
  ];
};

/**
 * Groepeert sentiment data per platform
 * @param {Object} data - Ruwe sentiment data
 * @returns {Array} - Array met data per platform
 */
export const groupByPlatform = (data) => {
  if (!data || !data.platforms) return [];
  
  return Object.entries(data.platforms).map(([platform, values]) => ({
    platform,
    positive: values.positive || 0,
    neutral: values.neutral || 0,
    negative: values.negative || 0,
    score: values.score || 0
  }));
};

/**
 * Transformeert sentiment data voor gebruik in een trend chart
 * @param {Object} data - Ruwe sentiment data
 * @param {string} timeRange - Tijdsperiode ('daily', 'weekly', 'monthly')
 * @param {string} platform - Platform filter (optioneel)
 * @returns {Array} - Array met data voor trend chart
 */
export const transformForTrendChart = (data, timeRange = 'daily', platform = 'all') => {
  if (!data || !data.trends || !data.trends[timeRange]) return [];
  
  let trendData = data.trends[timeRange];
  
  // Filter op platform indien nodig
  if (platform !== 'all' && data.platforms && data.platforms[platform] && 
      data.platforms[platform].trends && data.platforms[platform].trends[timeRange]) {
    trendData = data.platforms[platform].trends[timeRange];
  }
  
  return trendData.map(item => ({
    date: item.date,
    positive: item.positive || 0,
    neutral: item.neutral || 0,
    negative: item.negative || 0,
    score: item.score || 0
  }));
};

/**
 * Filtert sentiment data op basis van zoekwoorden
 * @param {Object} data - Ruwe sentiment data
 * @param {string} keyword - Zoekwoord
 * @returns {Object} - Gefilterde sentiment data
 */
export const filterByKeyword = (data, keyword) => {
  if (!data || !keyword || keyword.trim() === '') return data;
  
  const lowercaseKeyword = keyword.toLowerCase().trim();
  
  // Filter examples
  const filteredExamples = {
    positive: (data.examples?.positive || []).filter(example => 
      example.toLowerCase().includes(lowercaseKeyword)
    ),
    neutral: (data.examples?.neutral || []).filter(example => 
      example.toLowerCase().includes(lowercaseKeyword)
    ),
    negative: (data.examples?.negative || []).filter(example => 
      example.toLowerCase().includes(lowercaseKeyword)
    )
  };
  
  // Filter categories
  const filteredCategories = {};
  if (data.categories) {
    Object.entries(data.categories).forEach(([category, values]) => {
      if (category.toLowerCase().includes(lowercaseKeyword) || 
          (values.keywords && values.keywords.some(kw => kw.toLowerCase().includes(lowercaseKeyword)))) {
        filteredCategories[category] = values;
      }
    });
  }
  
  return {
    ...data,
    examples: filteredExamples,
    categories: Object.keys(filteredCategories).length > 0 ? filteredCategories : data.categories
  };
};

/**
 * Berekent sentiment statistieken
 * @param {Object} data - Ruwe sentiment data
 * @param {string} platform - Platform filter (optioneel)
 * @returns {Object} - Berekende statistieken
 */
export const calculateSentimentStats = (data, platform = 'all') => {
  if (!data) return { average: 0, median: 0, mode: 0, stdDev: 0 };
  
  let sentimentData = data;
  
  // Filter op platform indien nodig
  if (platform !== 'all' && data.platforms && data.platforms[platform]) {
    sentimentData = data.platforms[platform];
  } else if (platform !== 'all') {
    // Als platform niet bestaat, gebruik overall data
    sentimentData = data.overall || data;
  }
  
  // Bereken gemiddelde
  const average = sentimentData.score || 0;
  
  // Voor complexere statistieken hebben we meer data nodig
  // In een echte implementatie zou dit berekend worden op basis van alle individuele scores
  return {
    average,
    median: average, // Vereenvoudigde implementatie
    mode: average > 0 ? 'positive' : average < 0 ? 'negative' : 'neutral',
    stdDev: 0.2 // Dummy waarde
  };
};

/**
 * Extraheert sentiment keywords uit data
 * @param {Object} data - Ruwe sentiment data
 * @param {string} category - Categorie filter (optioneel)
 * @returns {Array} - Array met keywords
 */
export const extractSentimentKeywords = (data, category = 'all') => {
  if (!data || !data.categories) return [];
  
  if (category !== 'all' && data.categories[category]) {
    return data.categories[category].keywords || [];
  }
  
  // Combineer keywords van alle categorieën
  const allKeywords = [];
  Object.values(data.categories).forEach(cat => {
    if (cat.keywords) {
      allKeywords.push(...cat.keywords);
    }
  });
  
  // Verwijder duplicaten
  return [...new Set(allKeywords)];
};

/**
 * Vergelijkt sentiment tussen twee tijdsperiodes
 * @param {Object} data - Ruwe sentiment data
 * @param {string} period1 - Eerste tijdsperiode
 * @param {string} period2 - Tweede tijdsperiode
 * @returns {Object} - Vergelijking resultaten
 */
export const compareSentimentPeriods = (data, period1, period2) => {
  if (!data || !data.trends || !data.trends[period1] || !data.trends[period2]) {
    return { change: 0, trend: 'stable' };
  }
  
  const period1Data = data.trends[period1][data.trends[period1].length - 1] || {};
  const period2Data = data.trends[period2][data.trends[period2].length - 1] || {};
  
  const score1 = period1Data.score || 0;
  const score2 = period2Data.score || 0;
  
  const change = score2 - score1;
  const percentChange = score1 !== 0 ? (change / Math.abs(score1)) * 100 : 0;
  
  let trend = 'stable';
  if (percentChange > 10) trend = 'significant_improvement';
  else if (percentChange > 5) trend = 'improvement';
  else if (percentChange < -10) trend = 'significant_decline';
  else if (percentChange < -5) trend = 'decline';
  
  return {
    change,
    percentChange,
    trend,
    period1Score: score1,
    period2Score: score2
  };
};

/**
 * Identificeert top sentiment drivers (factoren die het meest bijdragen aan sentiment)
 * @param {Object} data - Ruwe sentiment data
 * @param {string} sentimentType - Type sentiment ('positive', 'negative', 'neutral')
 * @param {number} limit - Maximum aantal resultaten
 * @returns {Array} - Array met top drivers
 */
export const identifySentimentDrivers = (data, sentimentType = 'all', limit = 5) => {
  if (!data || !data.categories) return [];
  
  const drivers = [];
  
  Object.entries(data.categories).forEach(([category, values]) => {
    if (sentimentType === 'all' || 
        (sentimentType === 'positive' && values.positive > 50) ||
        (sentimentType === 'negative' && values.negative > 50) ||
        (sentimentType === 'neutral' && values.neutral > 50)) {
      
      drivers.push({
        category,
        score: values.score || 0,
        keywords: values.keywords || [],
        impact: sentimentType === 'positive' ? values.positive : 
                sentimentType === 'negative' ? values.negative : 
                sentimentType === 'neutral' ? values.neutral : 
                Math.max(values.positive || 0, values.negative || 0, values.neutral || 0)
      });
    }
  });
  
  // Sorteer op impact en beperk tot limit
  return drivers
    .sort((a, b) => b.impact - a.impact)
    .slice(0, limit);
};

/**
 * Genereert aanbevelingen op basis van sentiment analyse
 * @param {Object} data - Ruwe sentiment data
 * @returns {Object} - Aanbevelingen per categorie
 */
export const generateSentimentRecommendations = (data) => {
  if (!data || !data.categories) return {};
  
  const recommendations = {};
  
  Object.entries(data.categories).forEach(([category, values]) => {
    if (values.score < 0) {
      // Negatief sentiment - verbeterpunten
      recommendations[category] = {
        sentiment: 'negative',
        score: values.score,
        title: `Verbeter ${category}`,
        suggestions: [
          `Onderzoek specifieke klachten over ${category}`,
          `Ontwikkel een actieplan om ${category} te verbeteren`,
          `Communiceer verbeteringen in ${category} naar klanten`
        ]
      };
    } else if (values.score > 0.5) {
      // Zeer positief sentiment - sterke punten
      recommendations[category] = {
        sentiment: 'positive',
        score: values.score,
        title: `Versterk ${category}`,
        suggestions: [
          `Benadruk ${category} in marketing materialen`,
          `Deel positieve feedback over ${category} op sociale media`,
          `Gebruik ${category} als onderscheidend kenmerk`
        ]
      };
    } else if (values.score > 0) {
      // Positief sentiment - verbetermogelijkheden
      recommendations[category] = {
        sentiment: 'neutral',
        score: values.score,
        title: `Optimaliseer ${category}`,
        suggestions: [
          `Identificeer specifieke aspecten van ${category} die verder verbeterd kunnen worden`,
          `Vergelijk ${category} met concurrenten`,
          `Verzamel meer gedetailleerde feedback over ${category}`
        ]
      };
    }
  });
  
  return recommendations;
};

export default {
  categorizeSentiment,
  transformForPieChart,
  groupByPlatform,
  transformForTrendChart,
  filterByKeyword,
  calculateSentimentStats,
  extractSentimentKeywords,
  compareSentimentPeriods,
  identifySentimentDrivers,
  generateSentimentRecommendations
};
