/**
 * Utilities voor het normaliseren van topic frequentiedata voor eerlijke vergelijking
 */

/**
 * Normaliseert topic frequenties op basis van het totale volume
 * @param {Array} topicFrequencies - Array van topic frequentie objecten
 * @param {Object} options - Configuratie opties
 * @param {String} options.frequencyField - Naam van het veld dat de frequentie bevat
 * @param {Boolean} options.asPercentage - Of de genormaliseerde waarden als percentages moeten worden weergegeven
 * @returns {Array} Array van genormaliseerde topic frequentie objecten
 */
export const normalizeByVolume = (topicFrequencies, options = {}) => {
  const {
    frequencyField = 'frequency',
    asPercentage = true
  } = options;
  
  // Controleer of er data is
  if (!topicFrequencies || !topicFrequencies.length) {
    return [];
  }
  
  // Bereken totaal volume
  const totalVolume = topicFrequencies.reduce((sum, item) => sum + (item[frequencyField] || 0), 0);
  
  // Als totaal volume 0 is, return originele data
  if (totalVolume === 0) {
    return topicFrequencies;
  }
  
  // Normaliseer frequenties
  return topicFrequencies.map(item => {
    const normalizedValue = (item[frequencyField] || 0) / totalVolume;
    
    return {
      ...item,
      normalizedFrequency: asPercentage ? normalizedValue * 100 : normalizedValue
    };
  });
};

/**
 * Normaliseert topic frequenties op basis van Z-scores
 * @param {Array} topicFrequencies - Array van topic frequentie objecten
 * @param {Object} options - Configuratie opties
 * @param {String} options.frequencyField - Naam van het veld dat de frequentie bevat
 * @returns {Array} Array van genormaliseerde topic frequentie objecten met Z-scores
 */
export const normalizeByZScore = (topicFrequencies, options = {}) => {
  const {
    frequencyField = 'frequency'
  } = options;
  
  // Controleer of er data is
  if (!topicFrequencies || topicFrequencies.length < 2) {
    return topicFrequencies;
  }
  
  // Bereken gemiddelde
  const values = topicFrequencies.map(item => item[frequencyField] || 0);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Bereken standaarddeviatie
  const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Als standaarddeviatie 0 is, return originele data
  if (stdDev === 0) {
    return topicFrequencies;
  }
  
  // Bereken Z-scores
  return topicFrequencies.map(item => {
    const zScore = ((item[frequencyField] || 0) - mean) / stdDev;
    
    return {
      ...item,
      zScore,
      isSignificant: Math.abs(zScore) > 1.96 // Significant op 95% betrouwbaarheidsniveau
    };
  });
};

/**
 * Normaliseert topic frequenties relatief ten opzichte van een baseline periode
 * @param {Array} currentTopicFrequencies - Array van huidige topic frequentie objecten
 * @param {Array} baselineTopicFrequencies - Array van baseline topic frequentie objecten
 * @param {Object} options - Configuratie opties
 * @param {String} options.topicField - Naam van het veld dat de topic bevat
 * @param {String} options.frequencyField - Naam van het veld dat de frequentie bevat
 * @returns {Array} Array van topic frequentie objecten met relatieve verandering
 */
export const normalizeByBaseline = (currentTopicFrequencies, baselineTopicFrequencies, options = {}) => {
  const {
    topicField = 'topic',
    frequencyField = 'frequency'
  } = options;
  
  // Controleer of er data is
  if (!currentTopicFrequencies || !currentTopicFrequencies.length || !baselineTopicFrequencies || !baselineTopicFrequencies.length) {
    return currentTopicFrequencies;
  }
  
  // Maak een map van baseline topics voor snelle lookup
  const baselineMap = {};
  baselineTopicFrequencies.forEach(item => {
    baselineMap[item[topicField]] = item[frequencyField] || 0;
  });
  
  // Bereken relatieve verandering
  return currentTopicFrequencies.map(item => {
    const currentFreq = item[frequencyField] || 0;
    const baselineFreq = baselineMap[item[topicField]] || 0;
    
    // Bereken verschillende metrieken voor relatieve verandering
    let percentChange = 0;
    let absoluteChange = currentFreq - baselineFreq;
    let changeRatio = 1;
    
    if (baselineFreq > 0) {
      percentChange = ((currentFreq - baselineFreq) / baselineFreq) * 100;
      changeRatio = currentFreq / baselineFreq;
    } else if (currentFreq > 0) {
      // Als baseline 0 is maar huidige freq > 0, dan is het een nieuwe trend
      percentChange = Infinity;
      changeRatio = Infinity;
    }
    
    return {
      ...item,
      baselineFrequency: baselineFreq,
      absoluteChange,
      percentChange,
      changeRatio,
      trend: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable',
      isNew: baselineFreq === 0 && currentFreq > 0,
      isGone: baselineFreq > 0 && currentFreq === 0
    };
  });
};

/**
 * Normaliseert tijdreeksdata voor topics om seizoenseffecten te verwijderen
 * @param {Object} timeseriesData - Object met tijdreeksdata voor topics
 * @param {Object} options - Configuratie opties
 * @param {Number} options.windowSize - Grootte van het voortschrijdend gemiddelde venster
 * @param {Boolean} options.removeOutliers - Of uitschieters moeten worden verwijderd
 * @returns {Object} Object met genormaliseerde tijdreeksdata
 */
export const normalizeTimeseries = (timeseriesData, options = {}) => {
  const {
    windowSize = 3,
    removeOutliers = true
  } = options;
  
  // Controleer of er data is
  if (!timeseriesData || !timeseriesData.timePoints || !timeseriesData.timePoints.length || !timeseriesData.series) {
    return timeseriesData;
  }
  
  const { timePoints, series } = timeseriesData;
  const normalizedSeries = {};
  
  // Normaliseer elke tijdreeks
  Object.entries(series).forEach(([topic, values]) => {
    // Pas voortschrijdend gemiddelde toe
    const smoothedValues = applyMovingAverage(values, windowSize);
    
    // Verwijder uitschieters indien nodig
    const cleanedValues = removeOutliers ? removeTimeseriesOutliers(smoothedValues) : smoothedValues;
    
    // Sla genormaliseerde waarden op
    normalizedSeries[topic] = cleanedValues;
  });
  
  return {
    ...timeseriesData,
    normalizedSeries
  };
};

/**
 * Past een voortschrijdend gemiddelde toe op een tijdreeks
 * @param {Array} values - Array van waarden
 * @param {Number} windowSize - Grootte van het voortschrijdend gemiddelde venster
 * @returns {Array} Array van gladgestreken waarden
 */
const applyMovingAverage = (values, windowSize) => {
  if (!values || values.length < windowSize) {
    return values;
  }
  
  const result = [];
  
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    let count = 0;
    
    // Bereken gemiddelde over venster
    for (let j = Math.max(0, i - Math.floor(windowSize / 2)); j <= Math.min(values.length - 1, i + Math.floor(windowSize / 2)); j++) {
      sum += values[j];
      count++;
    }
    
    result.push(count > 0 ? sum / count : values[i]);
  }
  
  return result;
};

/**
 * Verwijdert uitschieters uit een tijdreeks met behulp van IQR methode
 * @param {Array} values - Array van waarden
 * @returns {Array} Array van waarden zonder uitschieters
 */
const removeTimeseriesOutliers = (values) => {
  if (!values || values.length < 4) {
    return values;
  }
  
  // Sorteer waarden voor berekening van kwartielen
  const sortedValues = [...values].sort((a, b) => a - b);
  
  // Bereken kwartielen
  const q1Index = Math.floor(sortedValues.length * 0.25);
  const q3Index = Math.floor(sortedValues.length * 0.75);
  const q1 = sortedValues[q1Index];
  const q3 = sortedValues[q3Index];
  
  // Bereken IQR en grenzen
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  // Vervang uitschieters door grenzen
  return values.map(value => {
    if (value < lowerBound) return lowerBound;
    if (value > upperBound) return upperBound;
    return value;
  });
};

/**
 * Berekent relatieve populariteit van topics tussen verschillende platforms
 * @param {Object} platformData - Object met topic frequenties per platform
 * @param {Object} options - Configuratie opties
 * @param {String} options.topicField - Naam van het veld dat de topic bevat
 * @param {String} options.frequencyField - Naam van het veld dat de frequentie bevat
 * @returns {Object} Object met relatieve populariteit per topic per platform
 */
export const calculateCrossPlatformRelevance = (platformData, options = {}) => {
  const {
    topicField = 'topic',
    frequencyField = 'frequency'
  } = options;
  
  // Controleer of er data is
  if (!platformData || Object.keys(platformData).length === 0) {
    return {};
  }
  
  // Verzamel alle unieke topics
  const allTopics = new Set();
  Object.values(platformData).forEach(platformTopics => {
    platformTopics.forEach(item => {
      allTopics.add(item[topicField]);
    });
  });
  
  // Bereken totale frequentie per platform voor normalisatie
  const platformTotals = {};
  Object.entries(platformData).forEach(([platform, topics]) => {
    platformTotals[platform] = topics.reduce((sum, item) => sum + (item[frequencyField] || 0), 0);
  });
  
  // Bereken genormaliseerde frequenties per topic per platform
  const result = {};
  
  allTopics.forEach(topic => {
    result[topic] = {};
    
    Object.entries(platformData).forEach(([platform, topics]) => {
      const topicItem = topics.find(item => item[topicField] === topic);
      const frequency = topicItem ? (topicItem[frequencyField] || 0) : 0;
      const normalizedFrequency = platformTotals[platform] > 0 ? frequency / platformTotals[platform] : 0;
      
      result[topic][platform] = {
        frequency,
        normalizedFrequency,
        percentage: normalizedFrequency * 100
      };
    });
    
    // Bereken platform affiniteit (op welk platform is het topic relatief populairder)
    const platforms = Object.keys(platformData);
    if (platforms.length > 1) {
      const maxPlatform = platforms.reduce((max, platform) => {
        return result[topic][platform].normalizedFrequency > result[topic][max].normalizedFrequency ? platform : max;
      }, platforms[0]);
      
      // Bereken affiniteitsscores relatief tot het gemiddelde
      const avgNormalized = platforms.reduce((sum, platform) => sum + result[topic][platform].normalizedFrequency, 0) / platforms.length;
      
      platforms.forEach(platform => {
        const relativeAffinity = avgNormalized > 0 ? result[topic][platform].normalizedFrequency / avgNormalized : 1;
        result[topic][platform].relativeAffinity = relativeAffinity;
        result[topic][platform].affinityScore = Math.log2(relativeAffinity + 0.1); // Log-transformatie voor betere schaalbaarheid
      });
      
      result[topic].dominantPlatform = maxPlatform;
    }
  });
  
  return result;
};
