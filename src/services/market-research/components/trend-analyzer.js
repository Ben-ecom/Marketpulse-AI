/**
 * Trend Analyzer
 *
 * Deze component is verantwoordelijk voor het identificeren en analyseren
 * van trends in marktgegevens.
 */

/**
 * Trend Analyzer klasse
 */
class TrendAnalyzer {
  constructor() {
    // Configuratie voor trendanalyse
    this.config = {
      minDataPoints: 5,
      significanceThreshold: 0.05,
      forecastHorizon: 12, // Aantal perioden vooruit te voorspellen
      seasonalityPeriods: [4, 12], // Kwartaal en jaarlijkse seizoensgebondenheid
    };
  }

  /**
   * Analyseer trends in marktgegevens
   * @param {Object} trendData - Trend- of historische gegevens
   * @param {Object} options - Analyse-opties
   * @returns {Promise<Object>} - Trendanalyse resultaten
   */
  async analyze(trendData, options = {}) {
    try {
      // Valideer input
      if (!trendData || !this.isValidTrendData(trendData)) {
        console.warn('⚠️ Trend analysis: Ongeldige trendgegevens ontvangen');
        return {
          trends: [],
          seasonality: null,
          forecast: [],
          confidence: 0,
          method: 'none',
          error: 'Ongeldige trendgegevens',
        };
      }

      // Normaliseer gegevens
      const normalizedData = this.normalizeData(trendData);

      // Identificeer trends
      const trends = this.identifyTrends(normalizedData, options);

      // Analyseer seizoensgebondenheid
      const seasonality = this.analyzeSeasonality(normalizedData, options);

      // Maak voorspelling
      const forecast = this.generateForecast(normalizedData, trends, seasonality, options);

      // Bereken betrouwbaarheid
      const confidence = this.calculateConfidence(trends, normalizedData);

      return {
        trends,
        seasonality,
        forecast,
        confidence,
        method: this.determineMethod(normalizedData, options),
      };
    } catch (error) {
      console.error('❌ Fout bij trendanalyse:', error);
      return {
        trends: [],
        seasonality: null,
        forecast: [],
        confidence: 0,
        method: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Controleer of de trendgegevens geldig zijn
   * @param {Object} trendData - Trendgegevens om te valideren
   * @returns {Boolean} - True als de gegevens geldig zijn
   */
  isValidTrendData(trendData) {
    // Controleer of trendData een object is
    if (typeof trendData !== 'object' || trendData === null) {
      return false;
    }

    // Controleer of er tijdreeksgegevens zijn
    if (trendData.timeSeries) {
      // Controleer of timeSeries een array is met voldoende datapunten
      return Array.isArray(trendData.timeSeries)
             && trendData.timeSeries.length >= this.config.minDataPoints
             && trendData.timeSeries.every((point) => typeof point === 'object'
               && point !== null
               && (point.date || point.period)
               && typeof point.value === 'number');
    }

    // Controleer of er historische gegevens zijn
    if (trendData.historicalData) {
      // Controleer of historicalData een array is met voldoende datapunten
      return Array.isArray(trendData.historicalData)
             && trendData.historicalData.length >= this.config.minDataPoints
             && trendData.historicalData.every((point) => typeof point === 'object'
               && point !== null
               && (point.date || point.period || point.year)
               && typeof point.value === 'number');
    }

    // Controleer of er periodegegevens zijn
    if (trendData.periods && trendData.values) {
      // Controleer of periods en values arrays zijn met voldoende datapunten
      return Array.isArray(trendData.periods)
             && Array.isArray(trendData.values)
             && trendData.periods.length === trendData.values.length
             && trendData.periods.length >= this.config.minDataPoints
             && trendData.values.every((value) => typeof value === 'number');
    }

    return false;
  }

  /**
   * Normaliseer trendgegevens voor analyse
   * @param {Object} trendData - Trendgegevens om te normaliseren
   * @returns {Array<Object>} - Genormaliseerde trendgegevens
   */
  normalizeData(trendData) {
    let normalizedData = [];

    // Normaliseer tijdreeksgegevens
    if (trendData.timeSeries) {
      normalizedData = trendData.timeSeries.map((point) => ({
        period: point.date || point.period,
        value: point.value,
        timestamp: this.getTimestamp(point.date || point.period),
      }));
    }
    // Normaliseer historische gegevens
    else if (trendData.historicalData) {
      normalizedData = trendData.historicalData.map((point) => ({
        period: point.date || point.period || point.year,
        value: point.value,
        timestamp: this.getTimestamp(point.date || point.period || point.year),
      }));
    }
    // Normaliseer periodegegevens
    else if (trendData.periods && trendData.values) {
      normalizedData = trendData.periods.map((period, index) => ({
        period,
        value: trendData.values[index],
        timestamp: this.getTimestamp(period),
      }));
    }

    // Sorteer op timestamp
    normalizedData.sort((a, b) => a.timestamp - b.timestamp);

    return normalizedData;
  }

  /**
   * Converteer een periode naar een timestamp
   * @param {String|Number|Date} period - Periode om te converteren
   * @returns {Number} - Timestamp
   */
  getTimestamp(period) {
    // Als period een Date object is
    if (period instanceof Date) {
      return period.getTime();
    }

    // Als period een string is
    if (typeof period === 'string') {
      // Probeer als ISO datumstring
      const date = new Date(period);
      if (!isNaN(date.getTime())) {
        return date.getTime();
      }

      // Probeer als jaar-kwartaal (bijv. "2023-Q1")
      const quarterMatch = period.match(/^(\d{4})-Q(\d)$/);
      if (quarterMatch) {
        const year = parseInt(quarterMatch[1]);
        const quarter = parseInt(quarterMatch[2]);
        const month = (quarter - 1) * 3;
        return new Date(year, month, 1).getTime();
      }

      // Probeer als jaar-maand (bijv. "2023-01")
      const monthMatch = period.match(/^(\d{4})-(\d{2})$/);
      if (monthMatch) {
        const year = parseInt(monthMatch[1]);
        const month = parseInt(monthMatch[2]) - 1;
        return new Date(year, month, 1).getTime();
      }

      // Probeer als jaar (bijv. "2023")
      const yearMatch = period.match(/^(\d{4})$/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        return new Date(year, 0, 1).getTime();
      }
    }

    // Als period een nummer is (bijv. jaar)
    if (typeof period === 'number') {
      // Als het een redelijk jaar is
      if (period >= 1900 && period <= 2100) {
        return new Date(period, 0, 1).getTime();
      }

      // Anders, gebruik als timestamp
      return period;
    }

    // Fallback: gebruik huidige timestamp
    return Date.now();
  }

  /**
   * Identificeer trends in de gegevens
   * @param {Array<Object>} normalizedData - Genormaliseerde trendgegevens
   * @param {Object} options - Analyse-opties
   * @returns {Array<Object>} - Geïdentificeerde trends
   */
  identifyTrends(normalizedData, options = {}) {
    const trends = [];

    // Haal waarden op
    const values = normalizedData.map((point) => point.value);

    // Identificeer lineaire trend
    const linearTrend = this.calculateLinearTrend(values);
    if (Math.abs(linearTrend.slope) > this.config.significanceThreshold) {
      trends.push({
        type: 'linear',
        direction: linearTrend.slope > 0 ? 'increasing' : 'decreasing',
        strength: Math.abs(linearTrend.slope),
        equation: `y = ${linearTrend.slope.toFixed(4)}x + ${linearTrend.intercept.toFixed(4)}`,
        r2: linearTrend.r2,
      });
    }

    // Identificeer exponentiële trend (als alle waarden positief zijn)
    if (values.every((value) => value > 0)) {
      const logValues = values.map((value) => Math.log(value));
      const expTrend = this.calculateLinearTrend(logValues);

      if (Math.abs(expTrend.slope) > this.config.significanceThreshold) {
        trends.push({
          type: 'exponential',
          direction: expTrend.slope > 0 ? 'increasing' : 'decreasing',
          strength: Math.abs(expTrend.slope),
          equation: `y = ${Math.exp(expTrend.intercept).toFixed(4)} * e^(${expTrend.slope.toFixed(4)}x)`,
          r2: expTrend.r2,
        });
      }
    }

    // Identificeer trendbreekpunten
    const breakpoints = this.identifyBreakpoints(normalizedData);
    if (breakpoints.length > 0) {
      trends.push({
        type: 'breakpoints',
        points: breakpoints,
      });
    }

    return trends;
  }

  /**
   * Bereken lineaire trend met lineaire regressie
   * @param {Array<Number>} values - Waarden om te analyseren
   * @returns {Object} - Lineaire trendparameters
   */
  calculateLinearTrend(values) {
    const n = values.length;

    // Als er te weinig waarden zijn, return een neutrale trend
    if (n < 2) {
      return { slope: 0, intercept: 0, r2: 0 };
    }

    // Bereken x-waarden (0, 1, 2, ...)
    const x = Array.from({ length: n }, (_, i) => i);

    // Bereken gemiddelden
    const meanX = x.reduce((sum, val) => sum + val, 0) / n;
    const meanY = values.reduce((sum, val) => sum + val, 0) / n;

    // Bereken sommen voor regressie
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - meanX;
      const yDiff = values[i] - meanY;
      sumXY += xDiff * yDiff;
      sumXX += xDiff * xDiff;
      sumYY += yDiff * yDiff;
    }

    // Bereken regressieparameters
    const slope = sumXX === 0 ? 0 : sumXY / sumXX;
    const intercept = meanY - slope * meanX;

    // Bereken R-kwadraat
    const r2 = sumXY === 0 ? 0 : (sumXY * sumXY) / (sumXX * sumYY);

    return { slope, intercept, r2 };
  }

  /**
   * Identificeer trendbreekpunten in de gegevens
   * @param {Array<Object>} normalizedData - Genormaliseerde trendgegevens
   * @returns {Array<Object>} - Geïdentificeerde breekpunten
   */
  identifyBreakpoints(normalizedData) {
    const breakpoints = [];
    const values = normalizedData.map((point) => point.value);
    const n = values.length;

    // Als er te weinig waarden zijn, return geen breekpunten
    if (n < this.config.minDataPoints * 2) {
      return breakpoints;
    }

    // Zoek naar breekpunten door de gegevens in twee delen te splitsen
    // en te kijken of de trends significant verschillen
    for (let i = this.config.minDataPoints; i <= n - this.config.minDataPoints; i++) {
      const firstSegment = values.slice(0, i);
      const secondSegment = values.slice(i);

      const firstTrend = this.calculateLinearTrend(firstSegment);
      const secondTrend = this.calculateLinearTrend(secondSegment);

      // Als de richtingen verschillen of de hellingshoek significant verschilt
      const slopeChange = Math.abs(firstTrend.slope - secondTrend.slope);
      const directionChange = (firstTrend.slope > 0 && secondTrend.slope < 0)
                             || (firstTrend.slope < 0 && secondTrend.slope > 0);

      if (directionChange || slopeChange > this.config.significanceThreshold * 2) {
        breakpoints.push({
          index: i,
          period: normalizedData[i].period,
          timestamp: normalizedData[i].timestamp,
          value: normalizedData[i].value,
          slopeChange,
          directionChange,
        });
      }
    }

    // Combineer nabije breekpunten
    const combinedBreakpoints = [];
    let lastBreakpoint = null;

    for (const breakpoint of breakpoints) {
      if (lastBreakpoint === null
          || breakpoint.index - lastBreakpoint.index > this.config.minDataPoints / 2) {
        combinedBreakpoints.push(breakpoint);
        lastBreakpoint = breakpoint;
      } else if (breakpoint.slopeChange > lastBreakpoint.slopeChange) {
        // Vervang het laatste breekpunt als het nieuwe sterker is
        combinedBreakpoints.pop();
        combinedBreakpoints.push(breakpoint);
        lastBreakpoint = breakpoint;
      }
    }

    return combinedBreakpoints;
  }

  /**
   * Analyseer seizoensgebondenheid in de gegevens
   * @param {Array<Object>} normalizedData - Genormaliseerde trendgegevens
   * @param {Object} options - Analyse-opties
   * @returns {Object} - Seizoensgebondenheidsanalyse
   */
  analyzeSeasonality(normalizedData, options = {}) {
    // Haal waarden op
    const values = normalizedData.map((point) => point.value);
    const n = values.length;

    // Als er te weinig waarden zijn, return geen seizoensgebondenheid
    if (n < Math.max(...this.config.seasonalityPeriods) * 2) {
      return null;
    }

    // Controleer op seizoensgebondenheid voor verschillende perioden
    const seasonalityResults = {};
    let bestPeriod = null;
    let bestStrength = 0;

    for (const period of this.config.seasonalityPeriods) {
      // Skip als er niet genoeg datapunten zijn voor deze periode
      if (n < period * 2) continue;

      // Bereken seizoensindexen
      const seasonalIndexes = this.calculateSeasonalIndexes(values, period);

      // Bereken seizoenssterkte
      const seasonalStrength = this.calculateSeasonalStrength(seasonalIndexes);

      seasonalityResults[period] = {
        indexes: seasonalIndexes,
        strength: seasonalStrength,
      };

      // Bijhouden van de beste periode
      if (seasonalStrength > bestStrength) {
        bestStrength = seasonalStrength;
        bestPeriod = period;
      }
    }

    // Als er geen significante seizoensgebondenheid is gevonden
    if (bestStrength < this.config.significanceThreshold) {
      return null;
    }

    // Return seizoensgebondenheidsanalyse
    return {
      period: bestPeriod,
      strength: bestStrength,
      indexes: seasonalityResults[bestPeriod].indexes,
      type: this.determineSeasonalityType(bestPeriod),
    };
  }

  /**
   * Bereken seizoensindexen
   * @param {Array<Number>} values - Waarden om te analyseren
   * @param {Number} period - Seizoensperiode
   * @returns {Array<Number>} - Seizoensindexen
   */
  calculateSeasonalIndexes(values, period) {
    const n = values.length;
    const numCycles = Math.floor(n / period);

    // Bereken gemiddelde per seizoen
    const seasonalSums = Array(period).fill(0);
    const seasonalCounts = Array(period).fill(0);

    for (let i = 0; i < n; i++) {
      const seasonIndex = i % period;
      seasonalSums[seasonIndex] += values[i];
      seasonalCounts[seasonIndex]++;
    }

    const seasonalAverages = seasonalSums.map((sum, i) => sum / seasonalCounts[i]);

    // Bereken het algemene gemiddelde
    const overallAverage = values.reduce((sum, val) => sum + val, 0) / n;

    // Bereken seizoensindexen
    const seasonalIndexes = seasonalAverages.map((avg) => avg / overallAverage);

    return seasonalIndexes;
  }

  /**
   * Bereken seizoenssterkte
   * @param {Array<Number>} seasonalIndexes - Seizoensindexen
   * @returns {Number} - Seizoenssterkte
   */
  calculateSeasonalStrength(seasonalIndexes) {
    // Bereken variantie van seizoensindexen
    const mean = seasonalIndexes.reduce((sum, val) => sum + val, 0) / seasonalIndexes.length;
    const variance = seasonalIndexes.reduce((sum, val) => sum + (val - mean) ** 2, 0) / seasonalIndexes.length;

    // Normaliseer naar 0-1 bereik
    return Math.min(variance * 10, 1);
  }

  /**
   * Bepaal het type seizoensgebondenheid
   * @param {Number} period - Seizoensperiode
   * @returns {String} - Type seizoensgebondenheid
   */
  determineSeasonalityType(period) {
    switch (period) {
      case 4:
        return 'quarterly';
      case 12:
        return 'monthly';
      case 52:
        return 'weekly';
      case 365:
        return 'daily';
      default:
        return 'custom';
    }
  }

  /**
   * Genereer voorspelling op basis van trends en seizoensgebondenheid
   * @param {Array<Object>} normalizedData - Genormaliseerde trendgegevens
   * @param {Array<Object>} trends - Geïdentificeerde trends
   * @param {Object} seasonality - Seizoensgebondenheidsanalyse
   * @param {Object} options - Voorspellingsopties
   * @returns {Array<Object>} - Voorspelling
   */
  generateForecast(normalizedData, trends, seasonality, options = {}) {
    const forecastHorizon = options.forecastHorizon || this.config.forecastHorizon;
    const forecast = [];

    // Haal de laatste waarde en timestamp op
    const lastPoint = normalizedData[normalizedData.length - 1];
    const lastValue = lastPoint.value;
    const lastTimestamp = lastPoint.timestamp;

    // Bepaal de tijdstap op basis van de gegevens
    const timeStep = this.determineTimeStep(normalizedData);

    // Vind de beste trend voor voorspelling
    const bestTrend = this.findBestTrend(trends);

    // Genereer voorspelling voor elke periode
    for (let i = 1; i <= forecastHorizon; i++) {
      // Bereken nieuwe timestamp
      const timestamp = this.calculateNextTimestamp(lastTimestamp, timeStep, i);

      // Bereken basisvoorspelling op basis van trend
      let forecastValue = this.calculateTrendForecast(lastValue, bestTrend, i);

      // Pas seizoensgebondenheid toe als beschikbaar
      if (seasonality) {
        const seasonalIndex = seasonality.indexes[i % seasonality.indexes.length];
        forecastValue *= seasonalIndex;
      }

      // Bereken betrouwbaarheidsinterval
      const confidenceInterval = this.calculateConfidenceInterval(forecastValue, i, bestTrend);

      // Voeg voorspelling toe
      forecast.push({
        period: this.formatTimestamp(timestamp),
        timestamp,
        value: forecastValue,
        lowerBound: forecastValue - confidenceInterval,
        upperBound: forecastValue + confidenceInterval,
      });
    }

    return forecast;
  }

  /**
   * Bepaal de tijdstap tussen datapunten
   * @param {Array<Object>} normalizedData - Genormaliseerde trendgegevens
   * @returns {Number} - Tijdstap in milliseconden
   */
  determineTimeStep(normalizedData) {
    const n = normalizedData.length;

    // Als er minder dan 2 punten zijn, gebruik standaard tijdstap
    if (n < 2) {
      return 30 * 24 * 60 * 60 * 1000; // 30 dagen in milliseconden
    }

    // Bereken gemiddelde tijdstap
    let totalStep = 0;
    for (let i = 1; i < n; i++) {
      totalStep += normalizedData[i].timestamp - normalizedData[i - 1].timestamp;
    }

    return totalStep / (n - 1);
  }

  /**
   * Vind de beste trend voor voorspelling
   * @param {Array<Object>} trends - Geïdentificeerde trends
   * @returns {Object} - Beste trend
   */
  findBestTrend(trends) {
    // Als er geen trends zijn, return een neutrale trend
    if (!trends || trends.length === 0) {
      return { type: 'linear', slope: 0, intercept: 0 };
    }

    // Filter lineaire en exponentiële trends
    const forecastableTrends = trends.filter((trend) => trend.type === 'linear' || trend.type === 'exponential');

    // Als er geen voorspelbare trends zijn, return een neutrale trend
    if (forecastableTrends.length === 0) {
      return { type: 'linear', slope: 0, intercept: 0 };
    }

    // Sorteer op R-kwadraat (hoogste eerst)
    forecastableTrends.sort((a, b) => b.r2 - a.r2);

    return forecastableTrends[0];
  }

  /**
   * Bereken de volgende timestamp
   * @param {Number} lastTimestamp - Laatste timestamp
   * @param {Number} timeStep - Tijdstap in milliseconden
   * @param {Number} steps - Aantal stappen vooruit
   * @returns {Number} - Nieuwe timestamp
   */
  calculateNextTimestamp(lastTimestamp, timeStep, steps) {
    return lastTimestamp + (timeStep * steps);
  }

  /**
   * Bereken trendvoorspelling
   * @param {Number} lastValue - Laatste waarde
   * @param {Object} trend - Trend om te gebruiken
   * @param {Number} steps - Aantal stappen vooruit
   * @returns {Number} - Voorspelde waarde
   */
  calculateTrendForecast(lastValue, trend, steps) {
    if (!trend) {
      return lastValue;
    }

    switch (trend.type) {
      case 'linear':
        // y = mx + b
        return lastValue + (trend.slope * steps);

      case 'exponential':
        // y = a * e^(bx)
        const growthRate = Math.exp(trend.slope) - 1;
        return lastValue * (1 + growthRate) ** steps;

      default:
        return lastValue;
    }
  }

  /**
   * Bereken betrouwbaarheidsinterval
   * @param {Number} forecastValue - Voorspelde waarde
   * @param {Number} steps - Aantal stappen vooruit
   * @param {Object} trend - Gebruikte trend
   * @returns {Number} - Betrouwbaarheidsinterval
   */
  calculateConfidenceInterval(forecastValue, steps, trend) {
    // Basis betrouwbaarheidsinterval
    const baseInterval = forecastValue * 0.1; // 10% van de voorspelde waarde

    // Vergroot interval met aantal stappen (verder in de toekomst = minder zeker)
    const stepFactor = 1 + (steps * 0.05); // 5% toename per stap

    // Pas aan op basis van trendkwaliteit
    const trendQuality = trend && trend.r2 ? trend.r2 : 0.5;
    const qualityFactor = 2 - trendQuality; // Hogere R² = kleinere factor

    return baseInterval * stepFactor * qualityFactor;
  }

  /**
   * Formatteer timestamp naar leesbare periode
   * @param {Number} timestamp - Timestamp om te formatteren
   * @returns {String} - Geformatteerde periode
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // Formatteer als jaar-maand
    return `${year}-${month.toString().padStart(2, '0')}`;
  }

  /**
   * Bereken betrouwbaarheid van de analyse
   * @param {Array<Object>} trends - Geïdentificeerde trends
   * @param {Array<Object>} normalizedData - Genormaliseerde trendgegevens
   * @returns {Number} - Betrouwbaarheidsscore (0-1)
   */
  calculateConfidence(trends, normalizedData) {
    // Basis betrouwbaarheid op basis van aantal datapunten
    const dataPointsFactor = Math.min(normalizedData.length / 20, 1); // Max 1 bij 20+ datapunten

    // Betrouwbaarheid op basis van trendkwaliteit
    let trendQuality = 0;
    if (trends && trends.length > 0) {
      // Gebruik R² van de beste trend
      const bestTrend = this.findBestTrend(trends);
      trendQuality = bestTrend.r2 || 0;
    }

    // Combineer factoren
    return (dataPointsFactor * 0.4) + (trendQuality * 0.6);
  }

  /**
   * Bepaal welke analysemethode is gebruikt
   * @param {Array<Object>} normalizedData - Genormaliseerde trendgegevens
   * @param {Object} options - Analyse-opties
   * @returns {String} - Gebruikte methode
   */
  determineMethod(normalizedData, options) {
    const n = normalizedData.length;

    // Als er weinig datapunten zijn
    if (n < 10) {
      return 'basic';
    }

    // Als er veel datapunten zijn
    if (n >= 20) {
      return 'advanced';
    }

    // Standaard
    return 'standard';
  }
}

module.exports = {
  TrendAnalyzer,
};
