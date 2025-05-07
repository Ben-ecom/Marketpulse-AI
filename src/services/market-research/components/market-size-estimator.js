/**
 * Market Size Estimator
 *
 * Deze component is verantwoordelijk voor het schatten van de marktomvang
 * op basis van verschillende gegevens en methoden.
 */

/**
 * Market Size Estimator klasse
 */
class MarketSizeEstimator {
  constructor() {
    // Standaard groeifactoren per industrie
    this.industryGrowthFactors = {
      technology: 0.12, // 12% jaarlijkse groei
      healthcare: 0.08, // 8% jaarlijkse groei
      retail: 0.04, // 4% jaarlijkse groei
      finance: 0.05, // 5% jaarlijkse groei
      manufacturing: 0.03, // 3% jaarlijkse groei
      energy: 0.06, // 6% jaarlijkse groei
      education: 0.04, // 4% jaarlijkse groei
      entertainment: 0.07, // 7% jaarlijkse groei
      food: 0.03, // 3% jaarlijkse groei
      transportation: 0.05, // 5% jaarlijkse groei
    };

    // Standaard marktpenetratiefactoren per industrie
    this.marketPenetrationFactors = {
      technology: 0.65, // 65% maximale penetratie
      healthcare: 0.80, // 80% maximale penetratie
      retail: 0.90, // 90% maximale penetratie
      finance: 0.75, // 75% maximale penetratie
      manufacturing: 0.70, // 70% maximale penetratie
      energy: 0.85, // 85% maximale penetratie
      education: 0.80, // 80% maximale penetratie
      entertainment: 0.95, // 95% maximale penetratie
      food: 0.95, // 95% maximale penetratie
      transportation: 0.85, // 85% maximale penetratie
    };
  }

  /**
   * Schat de marktomvang op basis van marktgegevens
   * @param {Object} marketData - Marktgegevens
   * @param {Object} options - Schattingsopties
   * @returns {Promise<Object>} - Geschatte marktomvang
   */
  async estimate(marketData, options = {}) {
    try {
      // Controleer of marketData is gedefinieerd
      if (!marketData) {
        console.warn('⚠️ Market size estimation: Ongeldige marktgegevens ontvangen');
        return {
          totalMarketSize: 0,
          segmentSizes: {},
          growthRate: 0,
          forecast: [],
          confidence: 0,
          method: 'none',
          error: 'Ongeldige marktgegevens',
        };
      }

      // Bepaal de schattingsmethode op basis van beschikbare gegevens
      const method = this.determineEstimationMethod(marketData);

      // Schat de marktomvang op basis van de gekozen methode
      let result;
      switch (method) {
        case 'top-down':
          result = this.estimateTopDown(marketData, options);
          break;
        case 'bottom-up':
          result = this.estimateBottomUp(marketData, options);
          break;
        case 'value-chain':
          result = this.estimateValueChain(marketData, options);
          break;
        case 'comparable':
          result = this.estimateComparable(marketData, options);
          break;
        default:
          result = this.estimateBasic(marketData, options);
      }

      // Voeg forecast toe
      result.forecast = this.generateForecast(result, marketData, options);

      return result;
    } catch (error) {
      console.error('❌ Fout bij marktomvang schatting:', error);
      return {
        totalMarketSize: 0,
        segmentSizes: {},
        growthRate: 0,
        forecast: [],
        confidence: 0,
        method: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Bepaal de beste schattingsmethode op basis van beschikbare gegevens
   * @param {Object} marketData - Marktgegevens
   * @returns {String} - Schattingsmethode
   */
  determineEstimationMethod(marketData) {
    // Top-down methode vereist totale marktomvang en segmentaandelen
    if (marketData.totalMarketSize && marketData.segments) {
      return 'top-down';
    }

    // Bottom-up methode vereist klantaantallen en gemiddelde uitgaven
    if (marketData.customerCount && marketData.averageSpending) {
      return 'bottom-up';
    }

    // Value-chain methode vereist waardeketen gegevens
    if (marketData.valueChain) {
      return 'value-chain';
    }

    // Comparable methode vereist vergelijkbare marktgegevens
    if (marketData.comparableMarkets) {
      return 'comparable';
    }

    // Basis methode als fallback
    return 'basic';
  }

  /**
   * Schat de marktomvang met de top-down methode
   * @param {Object} marketData - Marktgegevens
   * @param {Object} options - Schattingsopties
   * @returns {Object} - Geschatte marktomvang
   */
  estimateTopDown(marketData, options = {}) {
    const { totalMarketSize } = marketData;
    const segments = marketData.segments || {};
    const segmentSizes = {};

    // Bereken de omvang van elk segment
    for (const [segment, share] of Object.entries(segments)) {
      segmentSizes[segment] = totalMarketSize * share;
    }

    // Bepaal de groeivoet
    const growthRate = marketData.growthRate
                      || this.industryGrowthFactors[marketData.industry]
                      || 0.05; // Standaard 5% groei

    return {
      totalMarketSize,
      segmentSizes,
      growthRate,
      confidence: 0.8, // Top-down heeft relatief hoge betrouwbaarheid
      method: 'top-down',
    };
  }

  /**
   * Schat de marktomvang met de bottom-up methode
   * @param {Object} marketData - Marktgegevens
   * @param {Object} options - Schattingsopties
   * @returns {Object} - Geschatte marktomvang
   */
  estimateBottomUp(marketData, options = {}) {
    const { customerCount } = marketData;
    const { averageSpending } = marketData;
    const totalMarketSize = customerCount * averageSpending;

    // Bereken de omvang van elk segment als segmentatie beschikbaar is
    const segmentSizes = {};
    if (marketData.customerSegments) {
      for (const [segment, share] of Object.entries(marketData.customerSegments)) {
        segmentSizes[segment] = totalMarketSize * share;
      }
    }

    // Bepaal de groeivoet
    const growthRate = marketData.growthRate
                      || this.industryGrowthFactors[marketData.industry]
                      || 0.05; // Standaard 5% groei

    return {
      totalMarketSize,
      segmentSizes,
      growthRate,
      confidence: 0.75, // Bottom-up heeft goede betrouwbaarheid
      method: 'bottom-up',
    };
  }

  /**
   * Schat de marktomvang met de value-chain methode
   * @param {Object} marketData - Marktgegevens
   * @param {Object} options - Schattingsopties
   * @returns {Object} - Geschatte marktomvang
   */
  estimateValueChain(marketData, options = {}) {
    const valueChain = marketData.valueChain || {};
    let totalMarketSize = 0;

    // Bereken de totale marktomvang op basis van de waardeketen
    for (const [stage, value] of Object.entries(valueChain)) {
      totalMarketSize += value;
    }

    // Gebruik de waardeketen als segmenten
    const segmentSizes = { ...valueChain };

    // Bepaal de groeivoet
    const growthRate = marketData.growthRate
                      || this.industryGrowthFactors[marketData.industry]
                      || 0.05; // Standaard 5% groei

    return {
      totalMarketSize,
      segmentSizes,
      growthRate,
      confidence: 0.7, // Value-chain heeft redelijke betrouwbaarheid
      method: 'value-chain',
    };
  }

  /**
   * Schat de marktomvang met de comparable methode
   * @param {Object} marketData - Marktgegevens
   * @param {Object} options - Schattingsopties
   * @returns {Object} - Geschatte marktomvang
   */
  estimateComparable(marketData, options = {}) {
    const comparableMarkets = marketData.comparableMarkets || [];
    let totalMarketSize = 0;
    let totalWeight = 0;

    // Bereken de gewogen gemiddelde marktomvang
    for (const market of comparableMarkets) {
      const weight = market.similarity || 1;
      totalMarketSize += market.size * weight;
      totalWeight += weight;
    }

    // Bereken het gewogen gemiddelde
    totalMarketSize /= (totalWeight || 1);

    // Segmenten zijn moeilijker te bepalen met deze methode
    const segmentSizes = {};

    // Bepaal de groeivoet
    const growthRate = marketData.growthRate
                      || this.industryGrowthFactors[marketData.industry]
                      || 0.05; // Standaard 5% groei

    return {
      totalMarketSize,
      segmentSizes,
      growthRate,
      confidence: 0.6, // Comparable heeft lagere betrouwbaarheid
      method: 'comparable',
    };
  }

  /**
   * Schat de marktomvang met een basis methode
   * @param {Object} marketData - Marktgegevens
   * @param {Object} options - Schattingsopties
   * @returns {Object} - Geschatte marktomvang
   */
  estimateBasic(marketData, options = {}) {
    // Gebruik beschikbare gegevens of maak een ruwe schatting
    const totalMarketSize = marketData.estimatedSize
                           || (marketData.potentialCustomers * (marketData.averagePrice || 100));

    // Segmenten zijn moeilijk te bepalen met deze methode
    const segmentSizes = {};

    // Bepaal de groeivoet
    const growthRate = marketData.growthRate
                      || this.industryGrowthFactors[marketData.industry]
                      || 0.05; // Standaard 5% groei

    return {
      totalMarketSize,
      segmentSizes,
      growthRate,
      confidence: 0.4, // Basis methode heeft lage betrouwbaarheid
      method: 'basic',
    };
  }

  /**
   * Genereer een marktomvang forecast voor de komende jaren
   * @param {Object} result - Marktomvang schattingsresultaat
   * @param {Object} marketData - Marktgegevens
   * @param {Object} options - Forecast opties
   * @returns {Array<Object>} - Forecast voor de komende jaren
   */
  generateForecast(result, marketData, options = {}) {
    const forecastYears = options.forecastYears || 5;
    const forecast = [];

    // Bepaal de groeivoet en penetratiefactor
    const { growthRate } = result;
    const industry = marketData.industry || 'technology';
    const maxPenetration = this.marketPenetrationFactors[industry] || 0.8;
    const currentPenetration = marketData.currentPenetration || 0.2;

    // Bereken de S-curve parameters voor marktpenetratie
    const sCurveRate = 0.5; // Standaard S-curve groeisnelheid

    // Genereer forecast voor elk jaar
    let currentSize = result.totalMarketSize;
    let penetration = currentPenetration;

    for (let year = 1; year <= forecastYears; year++) {
      // Bereken nieuwe penetratie met S-curve model
      penetration = this.calculateSCurvePenetration(
        currentPenetration,
        maxPenetration,
        sCurveRate,
        year,
      );

      // Bereken nieuwe marktomvang
      const penetrationGrowth = penetration / (year === 1 ? currentPenetration : forecast[year - 2].penetration);
      const yearGrowth = Math.min(growthRate * penetrationGrowth, growthRate * 2);
      currentSize *= (1 + yearGrowth);

      // Voeg jaar toe aan forecast
      forecast.push({
        year: new Date().getFullYear() + year,
        marketSize: currentSize,
        growthRate: yearGrowth,
        penetration,
      });
    }

    return forecast;
  }

  /**
   * Bereken marktpenetratie met S-curve model
   * @param {Number} currentPenetration - Huidige penetratie
   * @param {Number} maxPenetration - Maximale penetratie
   * @param {Number} rate - Groeisnelheid
   * @param {Number} year - Jaar (vanaf nu)
   * @returns {Number} - Nieuwe penetratie
   */
  calculateSCurvePenetration(currentPenetration, maxPenetration, rate, year) {
    // S-curve formule: P(t) = Pmax / (1 + exp(-r * (t - t0)))
    // Waarbij t0 het punt is waarop de curve het steilst is

    // Bereken t0 op basis van huidige penetratie
    const t0 = -Math.log((maxPenetration / currentPenetration) - 1) / rate;

    // Bereken nieuwe penetratie
    const newPenetration = maxPenetration / (1 + Math.exp(-rate * (year - t0)));

    return Math.min(newPenetration, maxPenetration);
  }
}

module.exports = {
  MarketSizeEstimator,
};
