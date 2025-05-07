/**
 * Data Processing Service
 *
 * Deze service biedt functies voor het verwerken en analyseren van gegevens
 * voor gebruik in verschillende modules van MarketPulse AI.
 */

/**
 * Verwerk ruwe marktgegevens en bereid ze voor op analyse
 * @param {Object} data - Ruwe marktgegevens
 * @returns {Object} - Verwerkte gegevens
 */
function processMarketData(data) {
  if (!data) {
    return null;
  }

  try {
    // Valideer en normaliseer marktgegevens
    const processed = {
      ...data,
      processed: true,
      timestamp: new Date().toISOString(),
    };

    // Voeg afgeleide velden toe indien nodig
    if (data.marketData && data.marketData.totalMarketSize && data.marketData.growthRate) {
      processed.projectedMarketSize = calculateProjectedMarketSize(
        data.marketData.totalMarketSize,
        data.marketData.growthRate,
      );
    }

    return processed;
  } catch (error) {
    console.error('Error processing market data:', error);
    return null;
  }
}

/**
 * Bereken de geprojecteerde marktomvang op basis van huidige omvang en groeipercentage
 * @param {number} currentSize - Huidige marktomvang
 * @param {number} growthRate - Jaarlijks groeipercentage (bijv. 0.12 voor 12%)
 * @param {number} years - Aantal jaren vooruit (standaard: 5)
 * @returns {number} - Geprojecteerde marktomvang
 */
function calculateProjectedMarketSize(currentSize, growthRate, years = 5) {
  return currentSize * (1 + growthRate) ** years;
}

/**
 * Normaliseer concurrentiegegevens voor consistente analyse
 * @param {Array} competitorData - Array met concurrentiegegevens
 * @returns {Array} - Genormaliseerde concurrentiegegevens
 */
function normalizeCompetitorData(competitorData) {
  if (!competitorData || !Array.isArray(competitorData)) {
    return [];
  }

  return competitorData.map((competitor) => ({
    name: competitor.name || 'Onbekend',
    marketShare: parseFloat(competitor.marketShare) || 0,
    strengths: competitor.strengths || '',
    weaknesses: competitor.weaknesses || '',
    pricing: competitor.pricing || 'Onbekend',
    isOwn: !!competitor.isOwn,
  }));
}

/**
 * Bereken statistieken voor een reeks numerieke waarden
 * @param {Array} values - Array met numerieke waarden
 * @returns {Object} - Statistieken (gemiddelde, mediaan, min, max, etc.)
 */
function calculateStatistics(values) {
  if (!values || !Array.isArray(values) || values.length === 0) {
    return {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      count: 0,
    };
  }

  // Verwijder niet-numerieke waarden
  const numericValues = values.filter((v) => typeof v === 'number' && Number.isFinite(v));

  if (numericValues.length === 0) {
    return {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      count: 0,
    };
  }

  // Sorteer voor mediaan en min/max
  const sortedValues = [...numericValues].sort((a, b) => a - b);

  // Bereken gemiddelde
  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  const mean = sum / numericValues.length;

  // Bereken mediaan
  const midIndex = Math.floor(sortedValues.length / 2);
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2
    : sortedValues[midIndex];

  // Bereken standaarddeviatie
  const squaredDiffs = numericValues.map((value) => (value - mean) ** 2);
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / numericValues.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean,
    median,
    min: sortedValues[0],
    max: sortedValues[sortedValues.length - 1],
    stdDev,
    count: numericValues.length,
  };
}

/**
 * Bereken marktaandeel voor 'Overige' op basis van bekende concurrenten
 * @param {Array} competitors - Array met concurrentiegegevens
 * @returns {number} - Marktaandeel voor 'Overige'
 */
function calculateOthersMarketShare(competitors) {
  if (!competitors || !Array.isArray(competitors)) {
    return 0;
  }

  const totalKnownShare = competitors.reduce((sum, competitor) => {
    return sum + (parseFloat(competitor.marketShare) || 0);
  }, 0);

  // Zorg ervoor dat het resultaat tussen 0 en 1 ligt
  return Math.max(0, Math.min(1, 1 - totalKnownShare));
}

/**
 * Genereer een unieke hash voor caching doeleinden
 * @param {Object} data - Gegevens om te hashen
 * @returns {string} - Hash string
 */
function generateCacheKey(data) {
  if (!data) {
    return '';
  }

  try {
    // Eenvoudige hash-functie voor caching
    const str = JSON.stringify(data);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      // Vervang bitwise operaties door standaard wiskundige operaties
      hash = Math.imul(hash, 32) - hash + char;
      // Converteer naar 32-bit integer zonder bitwise operaties
      hash = Math.floor(hash % (2 ** 32));
    }

    return `market_${Math.abs(hash).toString(16)}`;
  } catch (error) {
    console.error('Error generating cache key:', error);
    return `market_${Date.now()}`;
  }
}

/**
 * Bereken de betrouwbaarheidsscore voor analyseresultaten op basis van beschikbare gegevens
 * @param {Object} data - Invoergegevens voor analyse
 * @returns {number} - Betrouwbaarheidsscore tussen 0 en 1
 */
function calculateConfidenceScore(data) {
  if (!data) {
    return 0;
  }

  let score = 0;
  let totalFactors = 0;

  // Marktgegevens
  if (data.marketData) {
    totalFactors += 5;
    if (data.marketData.industry) score += 1;
    if (data.marketData.region) score += 1;
    if (data.marketData.totalMarketSize) score += 1;
    if (data.marketData.growthRate) score += 1;
    if (data.marketData.maturityLevel) score += 1;
  }

  // Demografische gegevens
  if (data.demographicData) {
    totalFactors += 3;
    if (data.demographicData.ageGroups && data.demographicData.ageGroups.length > 0) score += 1;
    if (data.demographicData.incomeLevel && data.demographicData.incomeLevel.length > 0) score += 1;
    if (data.demographicData.location && data.demographicData.location.length > 0) score += 1;
  }

  // Concurrentiegegevens
  if (data.competitorData && Array.isArray(data.competitorData)) {
    totalFactors += 3;
    if (data.competitorData.length >= 3) score += 1;
    if (data.competitorData.some((c) => c.marketShare)) score += 1;
    if (data.competitorData.some((c) => c.isOwn)) score += 1;
  }

  // Prijsgegevens
  if (data.priceData) {
    totalFactors += 3;
    if (data.priceData.minPrice && data.priceData.maxPrice) score += 1;
    if (data.priceData.averagePrice) score += 1;
    if (data.priceData.pricePoints && data.priceData.pricePoints.length > 0) score += 1;
  }

  // Trendgegevens
  if (data.trendData && data.trendData.trends && Array.isArray(data.trendData.trends)) {
    totalFactors += 1;
    if (data.trendData.trends.length > 0) score += 1;
  }

  // Bereken de uiteindelijke score
  return totalFactors > 0 ? score / totalFactors : 0;
}

// Exporteer alle functies
module.exports = {
  processMarketData,
  calculateProjectedMarketSize,
  normalizeCompetitorData,
  calculateStatistics,
  calculateOthersMarketShare,
  generateCacheKey,
  calculateConfidenceScore,
};
