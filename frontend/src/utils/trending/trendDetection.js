/**
 * Utilities voor het detecteren van significante veranderingen in topic populariteit
 */

/**
 * Detecteert plotselinge stijgingen (spikes) in topic populariteit
 * @param {Array} timeseriesData - Array van tijdreekswaarden
 * @param {Object} options - Configuratie opties
 * @param {Number} options.threshold - Drempelwaarde voor spike detectie (standaard: 2 standaarddeviaties)
 * @param {Number} options.minValue - Minimale absolute waarde om als spike te worden beschouwd
 * @param {Boolean} options.consecutive - Of alleen opeenvolgende spikes moeten worden geteld
 * @returns {Array} Array van gedetecteerde spike indices
 */
export const detectSpikes = (timeseriesData, options = {}) => {
  const {
    threshold = 2,
    minValue = 1,
    consecutive = false
  } = options;
  
  // Controleer of er data is
  if (!timeseriesData || timeseriesData.length < 3) {
    return [];
  }
  
  // Bereken gemiddelde en standaarddeviatie
  const mean = timeseriesData.reduce((sum, val) => sum + val, 0) / timeseriesData.length;
  const squaredDifferences = timeseriesData.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / timeseriesData.length;
  const stdDev = Math.sqrt(variance);
  
  // Detecteer spikes
  const spikes = [];
  let consecutiveCount = 0;
  
  for (let i = 0; i < timeseriesData.length; i++) {
    const value = timeseriesData[i];
    const zScore = (value - mean) / stdDev;
    
    if (zScore > threshold && value >= minValue) {
      if (!consecutive || consecutiveCount > 0) {
        spikes.push(i);
      }
      consecutiveCount++;
    } else {
      consecutiveCount = 0;
    }
  }
  
  return spikes;
};

/**
 * Detecteert plotselinge dalingen (dips) in topic populariteit
 * @param {Array} timeseriesData - Array van tijdreekswaarden
 * @param {Object} options - Configuratie opties
 * @param {Number} options.threshold - Drempelwaarde voor dip detectie (standaard: 2 standaarddeviaties)
 * @param {Number} options.minPreviousValue - Minimale voorgaande waarde om als dip te worden beschouwd
 * @param {Boolean} options.consecutive - Of alleen opeenvolgende dips moeten worden geteld
 * @returns {Array} Array van gedetecteerde dip indices
 */
export const detectDips = (timeseriesData, options = {}) => {
  const {
    threshold = 2,
    minPreviousValue = 1,
    consecutive = false
  } = options;
  
  // Controleer of er data is
  if (!timeseriesData || timeseriesData.length < 3) {
    return [];
  }
  
  // Bereken gemiddelde en standaarddeviatie
  const mean = timeseriesData.reduce((sum, val) => sum + val, 0) / timeseriesData.length;
  const squaredDifferences = timeseriesData.map(val => Math.pow(val - mean, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / timeseriesData.length;
  const stdDev = Math.sqrt(variance);
  
  // Detecteer dips
  const dips = [];
  let consecutiveCount = 0;
  
  for (let i = 1; i < timeseriesData.length; i++) {
    const value = timeseriesData[i];
    const previousValue = timeseriesData[i - 1];
    const zScore = (mean - value) / stdDev;
    
    if (zScore > threshold && previousValue >= minPreviousValue) {
      if (!consecutive || consecutiveCount > 0) {
        dips.push(i);
      }
      consecutiveCount++;
    } else {
      consecutiveCount = 0;
    }
  }
  
  return dips;
};

/**
 * Detecteert trendveranderingen in topic populariteit
 * @param {Array} timeseriesData - Array van tijdreekswaarden
 * @param {Object} options - Configuratie opties
 * @param {Number} options.windowSize - Grootte van het venster voor trendberekening
 * @param {Number} options.minChange - Minimale verandering om als trendverandering te worden beschouwd
 * @returns {Array} Array van gedetecteerde trendveranderingspunten
 */
export const detectTrendChanges = (timeseriesData, options = {}) => {
  const {
    windowSize = 3,
    minChange = 0.2
  } = options;
  
  // Controleer of er data is
  if (!timeseriesData || timeseriesData.length < windowSize * 2) {
    return [];
  }
  
  const trendChanges = [];
  
  // Bereken trends voor opeenvolgende vensters
  for (let i = windowSize; i < timeseriesData.length - windowSize; i++) {
    // Bereken trend voor voorgaand venster
    const previousWindow = timeseriesData.slice(i - windowSize, i);
    const previousTrend = calculateTrend(previousWindow);
    
    // Bereken trend voor huidig venster
    const currentWindow = timeseriesData.slice(i, i + windowSize);
    const currentTrend = calculateTrend(currentWindow);
    
    // Detecteer trendverandering
    if (Math.abs(currentTrend - previousTrend) >= minChange) {
      trendChanges.push({
        index: i,
        previousTrend,
        currentTrend,
        change: currentTrend - previousTrend,
        type: currentTrend > previousTrend ? 'acceleration' : 'deceleration'
      });
    }
  }
  
  return trendChanges;
};

/**
 * Berekent de trend (helling) van een tijdreeks
 * @param {Array} values - Array van waarden
 * @returns {Number} Trendwaarde (helling)
 */
const calculateTrend = (values) => {
  if (!values || values.length < 2) {
    return 0;
  }
  
  // Eenvoudige lineaire regressie
  const n = values.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = values.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
  
  // Bereken helling (m) van regressielijn y = mx + b
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  return slope;
};

/**
 * Identificeert opkomende topics die een consistente groei vertonen
 * @param {Object} timeseriesData - Object met tijdreeksdata voor topics
 * @param {Object} options - Configuratie opties
 * @param {Number} options.minConsecutiveGrowth - Minimaal aantal opeenvolgende periodes met groei
 * @param {Number} options.minGrowthRate - Minimale groeisnelheid per periode
 * @param {Number} options.minTotalGrowth - Minimale totale groei
 * @returns {Array} Array van opkomende topics met groeistatistieken
 */
export const identifyEmergingTopics = (timeseriesData, options = {}) => {
  const {
    minConsecutiveGrowth = 3,
    minGrowthRate = 0.1,
    minTotalGrowth = 0.5
  } = options;
  
  // Controleer of er data is
  if (!timeseriesData || !timeseriesData.timePoints || !timeseriesData.series) {
    return [];
  }
  
  const { timePoints, series } = timeseriesData;
  const emergingTopics = [];
  
  // Analyseer elk topic
  Object.entries(series).forEach(([topic, values]) => {
    if (values.length < minConsecutiveGrowth + 1) {
      return;
    }
    
    let maxConsecutiveGrowth = 0;
    let currentConsecutiveGrowth = 0;
    let growthStartIndex = -1;
    let totalGrowth = 0;
    
    // Zoek naar opeenvolgende groeiperiodes
    for (let i = 1; i < values.length; i++) {
      const growthRate = values[i] > 0 ? (values[i] - values[i - 1]) / Math.max(values[i - 1], 1) : 0;
      
      if (growthRate >= minGrowthRate) {
        if (currentConsecutiveGrowth === 0) {
          growthStartIndex = i - 1;
        }
        currentConsecutiveGrowth++;
        
        if (currentConsecutiveGrowth > maxConsecutiveGrowth) {
          maxConsecutiveGrowth = currentConsecutiveGrowth;
        }
      } else {
        currentConsecutiveGrowth = 0;
      }
    }
    
    // Bereken totale groei
    if (maxConsecutiveGrowth >= minConsecutiveGrowth && growthStartIndex >= 0) {
      const startValue = values[growthStartIndex];
      const endValue = values[growthStartIndex + maxConsecutiveGrowth];
      totalGrowth = startValue > 0 ? (endValue - startValue) / startValue : 0;
      
      if (totalGrowth >= minTotalGrowth) {
        emergingTopics.push({
          topic,
          consecutiveGrowthPeriods: maxConsecutiveGrowth,
          totalGrowth,
          growthPercentage: totalGrowth * 100,
          startIndex: growthStartIndex,
          endIndex: growthStartIndex + maxConsecutiveGrowth,
          startValue,
          endValue,
          startDate: timePoints[growthStartIndex],
          endDate: timePoints[growthStartIndex + maxConsecutiveGrowth]
        });
      }
    }
  });
  
  // Sorteer op totale groei
  return emergingTopics.sort((a, b) => b.totalGrowth - a.totalGrowth);
};

/**
 * Identificeert afnemende topics die een consistente daling vertonen
 * @param {Object} timeseriesData - Object met tijdreeksdata voor topics
 * @param {Object} options - Configuratie opties
 * @param {Number} options.minConsecutiveDecline - Minimaal aantal opeenvolgende periodes met daling
 * @param {Number} options.minDeclineRate - Minimale dalingssnelheid per periode
 * @param {Number} options.minTotalDecline - Minimale totale daling
 * @returns {Array} Array van afnemende topics met dalingsstatistieken
 */
export const identifyDecliningTopics = (timeseriesData, options = {}) => {
  const {
    minConsecutiveDecline = 3,
    minDeclineRate = 0.1,
    minTotalDecline = 0.3
  } = options;
  
  // Controleer of er data is
  if (!timeseriesData || !timeseriesData.timePoints || !timeseriesData.series) {
    return [];
  }
  
  const { timePoints, series } = timeseriesData;
  const decliningTopics = [];
  
  // Analyseer elk topic
  Object.entries(series).forEach(([topic, values]) => {
    if (values.length < minConsecutiveDecline + 1) {
      return;
    }
    
    let maxConsecutiveDecline = 0;
    let currentConsecutiveDecline = 0;
    let declineStartIndex = -1;
    let totalDecline = 0;
    
    // Zoek naar opeenvolgende dalingsperiodes
    for (let i = 1; i < values.length; i++) {
      const declineRate = values[i - 1] > 0 ? (values[i - 1] - values[i]) / values[i - 1] : 0;
      
      if (declineRate >= minDeclineRate) {
        if (currentConsecutiveDecline === 0) {
          declineStartIndex = i - 1;
        }
        currentConsecutiveDecline++;
        
        if (currentConsecutiveDecline > maxConsecutiveDecline) {
          maxConsecutiveDecline = currentConsecutiveDecline;
        }
      } else {
        currentConsecutiveDecline = 0;
      }
    }
    
    // Bereken totale daling
    if (maxConsecutiveDecline >= minConsecutiveDecline && declineStartIndex >= 0) {
      const startValue = values[declineStartIndex];
      const endValue = values[declineStartIndex + maxConsecutiveDecline];
      totalDecline = startValue > 0 ? (startValue - endValue) / startValue : 0;
      
      if (totalDecline >= minTotalDecline) {
        decliningTopics.push({
          topic,
          consecutiveDeclinePeriods: maxConsecutiveDecline,
          totalDecline,
          declinePercentage: totalDecline * 100,
          startIndex: declineStartIndex,
          endIndex: declineStartIndex + maxConsecutiveDecline,
          startValue,
          endValue,
          startDate: timePoints[declineStartIndex],
          endDate: timePoints[declineStartIndex + maxConsecutiveDecline]
        });
      }
    }
  });
  
  // Sorteer op totale daling
  return decliningTopics.sort((a, b) => b.totalDecline - a.totalDecline);
};

/**
 * Identificeert cyclische patronen in topic populariteit
 * @param {Array} timeseriesData - Array van tijdreekswaarden
 * @param {Object} options - Configuratie opties
 * @param {Number} options.maxPeriod - Maximale periode om te zoeken
 * @param {Number} options.minCorrelation - Minimale autocorrelatie om als cyclisch te worden beschouwd
 * @returns {Object} Object met gedetecteerde cyclische patronen
 */
export const detectCyclicPatterns = (timeseriesData, options = {}) => {
  const {
    maxPeriod = 12,
    minCorrelation = 0.5
  } = options;
  
  // Controleer of er data is
  if (!timeseriesData || timeseriesData.length < maxPeriod * 2) {
    return { hasCyclicPattern: false };
  }
  
  // Bereken autocorrelatie voor verschillende periodes
  const correlations = [];
  let maxCorrelation = 0;
  let bestPeriod = 0;
  
  for (let period = 2; period <= Math.min(maxPeriod, Math.floor(timeseriesData.length / 2)); period++) {
    const correlation = calculateAutocorrelation(timeseriesData, period);
    correlations.push({ period, correlation });
    
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      bestPeriod = period;
    }
  }
  
  // Bepaal of er een cyclisch patroon is
  const hasCyclicPattern = maxCorrelation >= minCorrelation;
  
  return {
    hasCyclicPattern,
    bestPeriod,
    maxCorrelation,
    correlations: correlations.sort((a, b) => b.correlation - a.correlation)
  };
};

/**
 * Berekent de autocorrelatie van een tijdreeks met een bepaalde vertraging
 * @param {Array} values - Array van waarden
 * @param {Number} lag - Vertraging (lag) voor autocorrelatie
 * @returns {Number} Autocorrelatie waarde
 */
const calculateAutocorrelation = (values, lag) => {
  if (!values || values.length <= lag) {
    return 0;
  }
  
  // Bereken gemiddelde
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Bereken autocorrelatie
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < values.length - lag; i++) {
    numerator += (values[i] - mean) * (values[i + lag] - mean);
  }
  
  for (let i = 0; i < values.length; i++) {
    denominator += Math.pow(values[i] - mean, 2);
  }
  
  return denominator !== 0 ? numerator / denominator : 0;
};

/**
 * Berekent de volatiliteit (instabiliteit) van topic populariteit
 * @param {Array} timeseriesData - Array van tijdreekswaarden
 * @param {Object} options - Configuratie opties
 * @param {Number} options.windowSize - Grootte van het venster voor volatiliteitsberekening
 * @returns {Object} Object met volatiliteitsstatistieken
 */
export const calculateTopicVolatility = (timeseriesData, options = {}) => {
  const {
    windowSize = 3
  } = options;
  
  // Controleer of er data is
  if (!timeseriesData || timeseriesData.length < windowSize) {
    return { volatility: 0, isVolatile: false };
  }
  
  // Bereken procentuele veranderingen
  const percentChanges = [];
  for (let i = 1; i < timeseriesData.length; i++) {
    const prevValue = timeseriesData[i - 1];
    const currValue = timeseriesData[i];
    
    if (prevValue > 0) {
      const percentChange = Math.abs((currValue - prevValue) / prevValue);
      percentChanges.push(percentChange);
    } else if (currValue > 0) {
      percentChanges.push(1); // 100% verandering als vorige waarde 0 was
    } else {
      percentChanges.push(0);
    }
  }
  
  // Bereken gemiddelde volatiliteit
  const volatility = percentChanges.reduce((sum, val) => sum + val, 0) / percentChanges.length;
  
  // Bereken volatiliteit per venster
  const windowVolatility = [];
  for (let i = 0; i <= percentChanges.length - windowSize; i++) {
    const windowValues = percentChanges.slice(i, i + windowSize);
    const avgVolatility = windowValues.reduce((sum, val) => sum + val, 0) / windowSize;
    windowVolatility.push(avgVolatility);
  }
  
  // Bepaal of topic volatiel is (bovengemiddelde volatiliteit)
  const avgWindowVolatility = windowVolatility.reduce((sum, val) => sum + val, 0) / windowVolatility.length;
  const isVolatile = volatility > 0.2; // Arbitraire drempel
  
  return {
    volatility,
    isVolatile,
    percentChanges,
    windowVolatility,
    avgWindowVolatility,
    maxVolatilityWindow: Math.max(...windowVolatility),
    volatilityScore: volatility * 10 // Schaal naar 0-10 voor eenvoudige interpretatie
  };
};
