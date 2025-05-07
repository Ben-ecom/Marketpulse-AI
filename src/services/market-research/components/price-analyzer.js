/**
 * Price Analyzer
 *
 * Deze component is verantwoordelijk voor het analyseren van prijzen
 * en prijsstrategieën in de markt.
 */

/**
 * Price Analyzer klasse
 */
class PriceAnalyzer {
  constructor() {
    // Configuratie voor prijsanalyse
    this.config = {
      elasticityThresholds: {
        inelastic: 0.5,
        unitElastic: 1.5,
      },
      priceTiers: {
        budget: 0.7,
        midRange: 1.3,
        premium: 2.0,
        luxury: 3.0,
      },
    };
  }

  /**
   * Analyseer prijzen en prijsstrategieën
   * @param {Object} priceData - Prijsgegevens
   * @param {Object} options - Analyse-opties
   * @returns {Promise<Object>} - Prijsanalyse resultaten
   */
  async analyze(priceData, options = {}) {
    try {
      // Valideer input
      if (!priceData) {
        console.warn('⚠️ Price analysis: Ongeldige prijsgegevens ontvangen');
        return {
          priceRange: null,
          priceDistribution: null,
          priceElasticity: null,
          competitivePricing: null,
          optimumPricePoints: null,
          confidence: 0,
          method: 'none',
          error: 'Ongeldige prijsgegevens',
        };
      }

      // Analyseer prijsbereik
      const priceRange = this.analyzePriceRange(priceData);

      // Analyseer prijsdistributie
      const priceDistribution = this.analyzePriceDistribution(priceData);

      // Analyseer prijselasticiteit
      const priceElasticity = this.analyzePriceElasticity(priceData, options);

      // Analyseer concurrerende prijzen
      const competitivePricing = this.analyzeCompetitivePricing(priceData, options);

      // Bepaal optimale prijspunten
      const optimumPricePoints = this.determineOptimumPricePoints(
        priceRange,
        priceElasticity,
        competitivePricing,
        options,
      );

      return {
        priceRange,
        priceDistribution,
        priceElasticity,
        competitivePricing,
        optimumPricePoints,
        confidence: this.calculateConfidence(priceData),
        method: this.determineMethod(priceData, options),
      };
    } catch (error) {
      console.error('❌ Fout bij prijsanalyse:', error);
      return {
        priceRange: null,
        priceDistribution: null,
        priceElasticity: null,
        competitivePricing: null,
        optimumPricePoints: null,
        confidence: 0,
        method: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Analyseer prijsbereik
   * @param {Object} priceData - Prijsgegevens
   * @returns {Object} - Prijsbereik analyse
   */
  analyzePriceRange(priceData) {
    // Haal prijzen op uit verschillende bronnen
    const prices = this.extractPrices(priceData);

    // Als er geen prijzen zijn, return null
    if (prices.length === 0) {
      return null;
    }

    // Bereken statistieken
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Bereken mediaan
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const middle = Math.floor(sortedPrices.length / 2);
    const median = sortedPrices.length % 2 === 0
      ? (sortedPrices[middle - 1] + sortedPrices[middle]) / 2
      : sortedPrices[middle];

    // Bereken standaarddeviatie
    const variance = prices.reduce((sum, price) => sum + (price - avg) ** 2, 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    return {
      min,
      max,
      avg,
      median,
      stdDev,
      range: max - min,
      count: prices.length,
    };
  }

  /**
   * Extraheer prijzen uit prijsgegevens
   * @param {Object} priceData - Prijsgegevens
   * @returns {Array<Number>} - Geëxtraheerde prijzen
   */
  extractPrices(priceData) {
    const prices = [];

    // Als priceData een array is van prijzen
    if (Array.isArray(priceData)) {
      return priceData.filter((price) => typeof price === 'number');
    }

    // Als priceData een array is van objecten met prijsinformatie
    if (Array.isArray(priceData.prices)) {
      return priceData.prices.filter((price) => typeof price === 'number');
    }

    // Als priceData een array is van producten met prijsinformatie
    if (Array.isArray(priceData.products)) {
      priceData.products.forEach((product) => {
        if (product.price && typeof product.price === 'number') {
          prices.push(product.price);
        }
      });
      return prices;
    }

    // Als priceData een array is van concurrenten met prijsinformatie
    if (Array.isArray(priceData)) {
      priceData.forEach((competitor) => {
        if (competitor.pricing) {
          if (typeof competitor.pricing.average === 'number') {
            prices.push(competitor.pricing.average);
          }

          if (Array.isArray(competitor.pricing.range)) {
            competitor.pricing.range.forEach((price) => {
              if (typeof price === 'number') {
                prices.push(price);
              }
            });
          }
        }
      });
      return prices;
    }

    return prices;
  }

  /**
   * Analyseer prijsdistributie
   * @param {Object} priceData - Prijsgegevens
   * @returns {Object} - Prijsdistributie analyse
   */
  analyzePriceDistribution(priceData) {
    // Haal prijzen op
    const prices = this.extractPrices(priceData);

    // Als er geen prijzen zijn, return null
    if (prices.length === 0) {
      return null;
    }

    // Bereken prijsbereik
    const priceRange = this.analyzePriceRange(prices);

    // Maak histogram
    const numBins = Math.min(10, Math.ceil(Math.sqrt(prices.length)));
    const binWidth = (priceRange.max - priceRange.min) / numBins;

    const histogram = Array(numBins).fill(0);
    const binEdges = Array(numBins + 1).fill(0).map((_, i) => priceRange.min + (i * binWidth));

    prices.forEach((price) => {
      const binIndex = Math.min(
        Math.floor((price - priceRange.min) / binWidth),
        numBins - 1,
      );
      histogram[binIndex]++;
    });

    // Bereken percentiles
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const percentiles = {};

    [10, 25, 50, 75, 90].forEach((p) => {
      const index = Math.floor((p / 100) * sortedPrices.length);
      percentiles[p] = sortedPrices[index];
    });

    // Bepaal prijssegmenten
    const segments = this.determinePriceSegments(prices, priceRange.avg);

    return {
      histogram,
      binEdges,
      percentiles,
      segments,
    };
  }

  /**
   * Bepaal prijssegmenten
   * @param {Array<Number>} prices - Prijzen
   * @param {Number} avgPrice - Gemiddelde prijs
   * @returns {Object} - Prijssegmenten
   */
  determinePriceSegments(prices, avgPrice) {
    const segments = {
      budget: 0,
      midRange: 0,
      premium: 0,
      luxury: 0,
    };

    // Bepaal segmentgrenzen op basis van gemiddelde prijs
    const budgetThreshold = avgPrice * this.config.priceTiers.budget;
    const midRangeThreshold = avgPrice * this.config.priceTiers.midRange;
    const premiumThreshold = avgPrice * this.config.priceTiers.premium;

    // Tel aantal prijzen in elk segment
    prices.forEach((price) => {
      if (price < budgetThreshold) {
        segments.budget++;
      } else if (price < midRangeThreshold) {
        segments.midRange++;
      } else if (price < premiumThreshold) {
        segments.premium++;
      } else {
        segments.luxury++;
      }
    });

    // Converteer naar percentages
    const total = prices.length;
    Object.keys(segments).forEach((key) => {
      segments[key] = segments[key] / total;
    });

    return segments;
  }

  /**
   * Analyseer prijselasticiteit
   * @param {Object} priceData - Prijsgegevens
   * @param {Object} options - Analyse-opties
   * @returns {Object} - Prijselasticiteit analyse
   */
  analyzePriceElasticity(priceData, options = {}) {
    // Als er geen verkoop- of vraaggegevens zijn, return null
    if (!priceData.sales && !priceData.demand) {
      return null;
    }

    let elasticity = null;
    let elasticityType = null;

    // Bereken elasticiteit als er verkoop- en prijsgegevens zijn
    if (priceData.sales && priceData.prices
        && Array.isArray(priceData.sales) && Array.isArray(priceData.prices)
        && priceData.sales.length === priceData.prices.length && priceData.sales.length >= 2) {
      elasticity = this.calculatePriceElasticity(priceData.prices, priceData.sales);
      elasticityType = this.determineElasticityType(elasticity);
    }
    // Bereken elasticiteit als er vraag- en prijsgegevens zijn
    else if (priceData.demand && priceData.prices
             && Array.isArray(priceData.demand) && Array.isArray(priceData.prices)
             && priceData.demand.length === priceData.prices.length && priceData.demand.length >= 2) {
      elasticity = this.calculatePriceElasticity(priceData.prices, priceData.demand);
      elasticityType = this.determineElasticityType(elasticity);
    }

    return {
      elasticity,
      elasticityType,
      interpretation: this.interpretElasticity(elasticity, elasticityType),
    };
  }

  /**
   * Bereken prijselasticiteit
   * @param {Array<Number>} prices - Prijzen
   * @param {Array<Number>} quantities - Hoeveelheden (verkoop of vraag)
   * @returns {Number} - Prijselasticiteit
   */
  calculatePriceElasticity(prices, quantities) {
    // Bereken procentuele veranderingen
    const percentChanges = [];

    for (let i = 1; i < prices.length; i++) {
      const priceChange = (prices[i] - prices[i - 1]) / prices[i - 1];
      const quantityChange = (quantities[i] - quantities[i - 1]) / quantities[i - 1];

      // Voorkom delen door nul
      if (priceChange !== 0) {
        percentChanges.push(Math.abs(quantityChange / priceChange));
      }
    }

    // Bereken gemiddelde elasticiteit
    if (percentChanges.length === 0) {
      return null;
    }

    return percentChanges.reduce((sum, val) => sum + val, 0) / percentChanges.length;
  }

  /**
   * Bepaal type elasticiteit
   * @param {Number} elasticity - Prijselasticiteit
   * @returns {String} - Type elasticiteit
   */
  determineElasticityType(elasticity) {
    if (elasticity === null) {
      return null;
    }

    if (elasticity < this.config.elasticityThresholds.inelastic) {
      return 'inelastic';
    } if (elasticity < this.config.elasticityThresholds.unitElastic) {
      return 'unitElastic';
    }
    return 'elastic';
  }

  /**
   * Interpreteer elasticiteit
   * @param {Number} elasticity - Prijselasticiteit
   * @param {String} elasticityType - Type elasticiteit
   * @returns {String} - Interpretatie
   */
  interpretElasticity(elasticity, elasticityType) {
    if (elasticity === null || elasticityType === null) {
      return 'Onvoldoende gegevens om elasticiteit te bepalen';
    }

    switch (elasticityType) {
      case 'inelastic':
        return 'De vraag is inelastisch: een prijsverandering heeft relatief weinig invloed op de vraag. Prijsverhogingen kunnen de omzet verhogen.';
      case 'unitElastic':
        return 'De vraag is ongeveer unit-elastisch: een prijsverandering heeft een evenredige invloed op de vraag. De totale omzet blijft ongeveer gelijk bij prijsveranderingen.';
      case 'elastic':
        return 'De vraag is elastisch: een prijsverandering heeft een relatief grote invloed op de vraag. Prijsverlagingen kunnen de omzet verhogen.';
      default:
        return 'Onbekend elasticiteitstype';
    }
  }

  /**
   * Analyseer concurrerende prijzen
   * @param {Object} priceData - Prijsgegevens
   * @param {Object} options - Analyse-opties
   * @returns {Object} - Concurrerende prijzen analyse
   */
  analyzeCompetitivePricing(priceData, options = {}) {
    // Als er geen concurrentiegegevens zijn, return null
    if (!Array.isArray(priceData) && !priceData.competitors) {
      return null;
    }

    // Haal concurrenten op
    const competitors = Array.isArray(priceData) ? priceData : priceData.competitors;

    // Als er geen concurrenten zijn, return null
    if (!Array.isArray(competitors) || competitors.length === 0) {
      return null;
    }

    // Haal prijzen op per concurrent
    const competitorPrices = {};
    let ownPrice = null;

    competitors.forEach((competitor) => {
      if (competitor.pricing) {
        if (typeof competitor.pricing.average === 'number') {
          competitorPrices[competitor.name] = competitor.pricing.average;
        } else if (Array.isArray(competitor.pricing.range) && competitor.pricing.range.length === 2) {
          competitorPrices[competitor.name] = (competitor.pricing.range[0] + competitor.pricing.range[1]) / 2;
        }
      }

      // Als dit de eigen prijsgegevens zijn
      if (competitor.isOwn || competitor.name === 'Own' || competitor.name === options.ownName) {
        ownPrice = competitorPrices[competitor.name];
      }
    });

    // Als er geen eigen prijs is, gebruik de gemiddelde prijs van alle concurrenten
    if (ownPrice === null && Object.keys(competitorPrices).length > 0) {
      ownPrice = Object.values(competitorPrices).reduce((sum, price) => sum + price, 0)
                / Object.values(competitorPrices).length;
    }

    // Bereken prijsverschillen
    const priceDifferences = {};
    const pricePositioning = {};

    Object.entries(competitorPrices).forEach(([name, price]) => {
      if (ownPrice !== null) {
        priceDifferences[name] = ((price - ownPrice) / ownPrice) * 100; // Percentage verschil

        // Bepaal positionering
        if (price < ownPrice * 0.9) {
          pricePositioning[name] = 'lower';
        } else if (price > ownPrice * 1.1) {
          pricePositioning[name] = 'higher';
        } else {
          pricePositioning[name] = 'similar';
        }
      }
    });

    return {
      competitorPrices,
      ownPrice,
      priceDifferences,
      pricePositioning,
      averageMarketPrice: Object.values(competitorPrices).reduce((sum, price) => sum + price, 0)
                         / Object.values(competitorPrices).length,
    };
  }

  /**
   * Bepaal optimale prijspunten
   * @param {Object} priceRange - Prijsbereik analyse
   * @param {Object} priceElasticity - Prijselasticiteit analyse
   * @param {Object} competitivePricing - Concurrerende prijzen analyse
   * @param {Object} options - Analyse-opties
   * @returns {Object} - Optimale prijspunten
   */
  determineOptimumPricePoints(priceRange, priceElasticity, competitivePricing, options = {}) {
    // Als er onvoldoende gegevens zijn, return null
    if (!priceRange) {
      return null;
    }

    // Basis prijspunten op basis van prijsbereik
    const basePricePoints = {
      budget: priceRange.min + (priceRange.range * 0.2),
      midRange: priceRange.avg,
      premium: priceRange.max - (priceRange.range * 0.2),
      luxury: priceRange.max + (priceRange.range * 0.1),
    };

    // Pas prijspunten aan op basis van elasticiteit
    if (priceElasticity && priceElasticity.elasticityType) {
      switch (priceElasticity.elasticityType) {
        case 'inelastic':
          // Bij inelastische vraag kunnen prijzen hoger zijn
          Object.keys(basePricePoints).forEach((key) => {
            basePricePoints[key] *= 1.1;
          });
          break;
        case 'elastic':
          // Bij elastische vraag moeten prijzen lager zijn
          Object.keys(basePricePoints).forEach((key) => {
            basePricePoints[key] *= 0.9;
          });
          break;
      }
    }

    // Pas prijspunten aan op basis van concurrentie
    if (competitivePricing && competitivePricing.averageMarketPrice) {
      // Zorg ervoor dat midRange dicht bij marktgemiddelde ligt
      const marketAvg = competitivePricing.averageMarketPrice;
      const midRangeAdjustment = (marketAvg - basePricePoints.midRange) * 0.5;

      Object.keys(basePricePoints).forEach((key) => {
        basePricePoints[key] += midRangeAdjustment;
      });
    }

    // Rond prijzen af
    Object.keys(basePricePoints).forEach((key) => {
      basePricePoints[key] = Math.round(basePricePoints[key] * 100) / 100;
    });

    return {
      recommendedPricePoints: basePricePoints,
      explanation: this.explainPriceRecommendations(basePricePoints, priceElasticity, competitivePricing),
    };
  }

  /**
   * Leg prijsaanbevelingen uit
   * @param {Object} pricePoints - Prijspunten
   * @param {Object} priceElasticity - Prijselasticiteit analyse
   * @param {Object} competitivePricing - Concurrerende prijzen analyse
   * @returns {String} - Uitleg
   */
  explainPriceRecommendations(pricePoints, priceElasticity, competitivePricing) {
    let explanation = 'Prijsaanbevelingen zijn gebaseerd op ';
    const factors = [];

    // Voeg factoren toe
    factors.push('marktprijsbereik');

    if (priceElasticity && priceElasticity.elasticityType) {
      factors.push(`prijselasticiteit (${priceElasticity.elasticityType})`);
    }

    if (competitivePricing && competitivePricing.averageMarketPrice) {
      factors.push('concurrerende prijzen');
    }

    // Combineer factoren
    explanation += factors.join(', ');

    return explanation;
  }

  /**
   * Bereken betrouwbaarheid van de analyse
   * @param {Object} priceData - Prijsgegevens
   * @returns {Number} - Betrouwbaarheidsscore (0-1)
   */
  calculateConfidence(priceData) {
    let confidence = 0.5; // Basis betrouwbaarheid

    // Verhoog betrouwbaarheid op basis van beschikbare gegevens
    if (Array.isArray(priceData) || Array.isArray(priceData.prices)) {
      confidence += 0.1;
    }

    if (priceData.sales || priceData.demand) {
      confidence += 0.2;
    }

    if (Array.isArray(priceData) && priceData.length > 5) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Bepaal welke analysemethode is gebruikt
   * @param {Object} priceData - Prijsgegevens
   * @param {Object} options - Analyse-opties
   * @returns {String} - Gebruikte methode
   */
  determineMethod(priceData, options) {
    // Als er elasticiteitsgegevens zijn
    if (priceData.sales || priceData.demand) {
      return 'elasticity';
    }

    // Als er concurrentiegegevens zijn
    if (Array.isArray(priceData) || priceData.competitors) {
      return 'competitive';
    }

    // Standaard
    return 'basic';
  }
}

module.exports = {
  PriceAnalyzer,
};
