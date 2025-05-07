/**
 * Unit tests voor de Price Analyzer component
 */

import { PriceAnalyzer } from '../../../../src/services/market-research/components/price-analyzer.js';

describe('PriceAnalyzer', () => {
  let priceAnalyzer;
  
  beforeEach(() => {
    priceAnalyzer = new PriceAnalyzer();
  });
  
  describe('constructor', () => {
    test('initialiseert met de juiste configuratie', () => {
      expect(priceAnalyzer.config).toBeDefined();
      expect(priceAnalyzer.config.elasticityThresholds).toBeDefined();
      expect(priceAnalyzer.config.priceTiers).toBeDefined();
    });
  });
  
  describe('analyze', () => {
    test('retourneert een foutmelding bij ongeldige input', async () => {
      const result = await priceAnalyzer.analyze(null);
      
      expect(result).toEqual(expect.objectContaining({
        priceRange: null,
        priceDistribution: null,
        priceElasticity: null,
        competitivePricing: null,
        optimumPricePoints: null,
        confidence: 0,
        method: 'none',
        error: expect.any(String)
      }));
    });
    
    test('analyseert prijsgegevens correct', async () => {
      const priceData = [10, 15, 20, 25, 30];
      
      const result = await priceAnalyzer.analyze(priceData);
      
      expect(result).toEqual(expect.objectContaining({
        priceRange: expect.objectContaining({
          min: 10,
          max: 30,
          avg: 20,
          median: 20
        }),
        priceDistribution: expect.any(Object),
        confidence: expect.any(Number),
        method: expect.any(String)
      }));
    });
    
    test('verwerkt een array van producten met prijzen', async () => {
      const priceData = {
        products: [
          { name: 'Product A', price: 10 },
          { name: 'Product B', price: 20 },
          { name: 'Product C', price: 30 }
        ]
      };
      
      const result = await priceAnalyzer.analyze(priceData);
      
      expect(result.priceRange).toEqual(expect.objectContaining({
        min: 10,
        max: 30,
        avg: 20,
        median: 20
      }));
    });
    
    test('handelt fouten correct af', async () => {
      // Mock een functie om een fout te forceren
      priceAnalyzer.analyzePriceRange = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const result = await priceAnalyzer.analyze([10, 20, 30]);
      
      expect(result).toEqual(expect.objectContaining({
        priceRange: null,
        error: 'Test error',
        method: 'error'
      }));
    });
  });
  
  describe('analyzePriceRange', () => {
    test('berekent correcte statistieken voor prijsbereik', () => {
      const prices = [10, 20, 30, 40, 50];
      
      const result = priceAnalyzer.analyzePriceRange(prices);
      
      expect(result).toEqual(expect.objectContaining({
        min: 10,
        max: 50,
        avg: 30,
        median: 30,
        stdDev: expect.any(Number),
        range: 40,
        count: 5
      }));
    });
    
    test('retourneert null bij lege prijslijst', () => {
      const result = priceAnalyzer.analyzePriceRange([]);
      
      expect(result).toBeNull();
    });
  });
  
  describe('extractPrices', () => {
    test('extraheert prijzen uit een array van getallen', () => {
      const prices = priceAnalyzer.extractPrices([10, 20, 30]);
      expect(prices).toEqual([10, 20, 30]);
    });
    
    test('extraheert prijzen uit een object met prices array', () => {
      const prices = priceAnalyzer.extractPrices({ prices: [10, 20, 30] });
      expect(prices).toEqual([10, 20, 30]);
    });
    
    test('extraheert prijzen uit een object met products array', () => {
      const prices = priceAnalyzer.extractPrices({
        products: [
          { name: 'Product A', price: 10 },
          { name: 'Product B', price: 20 }
        ]
      });
      expect(prices).toEqual([10, 20]);
    });
    
    test('retourneert lege array bij ongeldige input', () => {
      const prices = priceAnalyzer.extractPrices({});
      expect(prices).toEqual([]);
    });
  });
  
  describe('analyzePriceDistribution', () => {
    test('analyseert prijsdistributie correct', () => {
      const prices = [10, 15, 20, 25, 30, 35, 40, 45, 50];
      
      const result = priceAnalyzer.analyzePriceDistribution(prices);
      
      expect(result).toEqual(expect.objectContaining({
        histogram: expect.any(Array),
        binEdges: expect.any(Array),
        percentiles: expect.objectContaining({
          10: expect.any(Number),
          25: expect.any(Number),
          50: expect.any(Number),
          75: expect.any(Number),
          90: expect.any(Number)
        }),
        segments: expect.objectContaining({
          budget: expect.any(Number),
          midRange: expect.any(Number),
          premium: expect.any(Number),
          luxury: expect.any(Number)
        })
      }));
    });
    
    test('retourneert null bij lege prijslijst', () => {
      const result = priceAnalyzer.analyzePriceDistribution([]);
      
      expect(result).toBeNull();
    });
  });
  
  describe('determinePriceSegments', () => {
    test('bepaalt prijssegmenten correct', () => {
      const prices = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const avgPrice = 55;
      
      const result = priceAnalyzer.determinePriceSegments(prices, avgPrice);
      
      expect(result).toEqual(expect.objectContaining({
        budget: expect.any(Number),
        midRange: expect.any(Number),
        premium: expect.any(Number),
        luxury: expect.any(Number)
      }));
      
      // Controleer of de som van de percentages ongeveer 1 is
      const sum = Object.values(result).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 5);
    });
  });
  
  describe('analyzePriceElasticity', () => {
    test('berekent elasticiteit op basis van prijzen en verkopen', () => {
      const priceData = {
        prices: [10, 12, 14, 16, 18],
        sales: [100, 90, 85, 80, 70]
      };
      
      const result = priceAnalyzer.analyzePriceElasticity(priceData);
      
      expect(result).toEqual(expect.objectContaining({
        elasticity: expect.any(Number),
        elasticityType: expect.any(String),
        interpretation: expect.any(String)
      }));
    });
    
    test('berekent elasticiteit op basis van prijzen en vraag', () => {
      const priceData = {
        prices: [10, 12, 14, 16, 18],
        demand: [100, 90, 85, 80, 70]
      };
      
      const result = priceAnalyzer.analyzePriceElasticity(priceData);
      
      expect(result).toEqual(expect.objectContaining({
        elasticity: expect.any(Number),
        elasticityType: expect.any(String),
        interpretation: expect.any(String)
      }));
    });
    
    test('retourneert null bij onvoldoende gegevens', () => {
      const result = priceAnalyzer.analyzePriceElasticity({});
      
      expect(result).toBeNull();
    });
  });
  
  describe('calculatePriceElasticity', () => {
    test('berekent elasticiteit correct', () => {
      const prices = [10, 12, 14, 16, 18];
      const quantities = [100, 90, 85, 80, 70];
      
      const result = priceAnalyzer.calculatePriceElasticity(prices, quantities);
      
      expect(result).toBeGreaterThan(0);
    });
    
    test('retourneert null bij ongeldige input', () => {
      const result = priceAnalyzer.calculatePriceElasticity([10], [100]);
      
      expect(result).toBeNull();
    });
  });
  
  describe('determineElasticityType', () => {
    test('bepaalt inelastisch type correct', () => {
      const result = priceAnalyzer.determineElasticityType(0.3);
      
      expect(result).toBe('inelastic');
    });
    
    test('bepaalt unit-elastisch type correct', () => {
      const result = priceAnalyzer.determineElasticityType(1.0);
      
      expect(result).toBe('unitElastic');
    });
    
    test('bepaalt elastisch type correct', () => {
      const result = priceAnalyzer.determineElasticityType(2.0);
      
      expect(result).toBe('elastic');
    });
    
    test('retourneert null bij ongeldige input', () => {
      const result = priceAnalyzer.determineElasticityType(null);
      
      expect(result).toBeNull();
    });
  });
  
  describe('analyzeCompetitivePricing', () => {
    test('analyseert concurrerende prijzen correct', () => {
      const priceData = [
        {
          name: 'Competitor A',
          pricing: { average: 100 }
        },
        {
          name: 'Competitor B',
          pricing: { average: 120 }
        },
        {
          name: 'Own',
          isOwn: true,
          pricing: { average: 110 }
        }
      ];
      
      const result = priceAnalyzer.analyzeCompetitivePricing(priceData);
      
      expect(result).toEqual(expect.objectContaining({
        competitorPrices: expect.objectContaining({
          'Competitor A': 100,
          'Competitor B': 120,
          'Own': 110
        }),
        ownPrice: 110,
        priceDifferences: expect.objectContaining({
          'Competitor A': expect.any(Number),
          'Competitor B': expect.any(Number)
        }),
        pricePositioning: expect.objectContaining({
          'Competitor A': expect.any(String),
          'Competitor B': expect.any(String)
        }),
        averageMarketPrice: expect.any(Number)
      }));
    });
    
    test('gebruikt prijsbereik als er geen gemiddelde prijs is', () => {
      const priceData = [
        {
          name: 'Competitor A',
          pricing: { range: [90, 110] }
        },
        {
          name: 'Own',
          isOwn: true,
          pricing: { range: [100, 120] }
        }
      ];
      
      const result = priceAnalyzer.analyzeCompetitivePricing(priceData);
      
      expect(result.competitorPrices['Competitor A']).toBe(100); // Gemiddelde van [90, 110]
      expect(result.ownPrice).toBe(110); // Gemiddelde van [100, 120]
    });
    
    test('retourneert null bij ongeldige input', () => {
      const result = priceAnalyzer.analyzeCompetitivePricing({});
      
      expect(result).toBeNull();
    });
  });
  
  describe('determineOptimumPricePoints', () => {
    test('bepaalt optimale prijspunten correct', () => {
      const priceRange = {
        min: 10,
        max: 100,
        avg: 50,
        range: 90
      };
      
      const result = priceAnalyzer.determineOptimumPricePoints(priceRange, null, null);
      
      expect(result).toEqual(expect.objectContaining({
        recommendedPricePoints: expect.objectContaining({
          budget: expect.any(Number),
          midRange: expect.any(Number),
          premium: expect.any(Number),
          luxury: expect.any(Number)
        }),
        explanation: expect.any(String)
      }));
    });
    
    test('past prijspunten aan op basis van elasticiteit', () => {
      const priceRange = {
        min: 10,
        max: 100,
        avg: 50,
        range: 90
      };
      
      const priceElasticity = {
        elasticity: 2.0,
        elasticityType: 'elastic'
      };
      
      const result = priceAnalyzer.determineOptimumPricePoints(priceRange, priceElasticity, null);
      
      // Bij elastische vraag zouden prijzen lager moeten zijn
      expect(result.recommendedPricePoints.midRange).toBeLessThan(priceRange.avg);
    });
    
    test('past prijspunten aan op basis van concurrentie', () => {
      const priceRange = {
        min: 10,
        max: 100,
        avg: 50,
        range: 90
      };
      
      const competitivePricing = {
        averageMarketPrice: 60
      };
      
      const result = priceAnalyzer.determineOptimumPricePoints(priceRange, null, competitivePricing);
      
      // Prijspunten zouden aangepast moeten worden richting het marktgemiddelde
      expect(result.recommendedPricePoints.midRange).toBeGreaterThan(priceRange.avg);
    });
    
    test('retourneert null bij ongeldige input', () => {
      const result = priceAnalyzer.determineOptimumPricePoints(null, null, null);
      
      expect(result).toBeNull();
    });
  });
  
  describe('calculateConfidence', () => {
    test('berekent betrouwbaarheid correct', () => {
      const priceData = [10, 20, 30, 40, 50];
      
      const result = priceAnalyzer.calculateConfidence(priceData);
      
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
    
    test('verhoogt betrouwbaarheid bij meer gegevens', () => {
      const basicData = [10, 20, 30];
      const detailedData = {
        prices: [10, 20, 30],
        sales: [100, 90, 80]
      };
      
      const basicResult = priceAnalyzer.calculateConfidence(basicData);
      const detailedResult = priceAnalyzer.calculateConfidence(detailedData);
      
      expect(detailedResult).toBeGreaterThan(basicResult);
    });
  });
  
  describe('determineMethod', () => {
    test('bepaalt basic methode correct', () => {
      const priceData = [10, 20, 30];
      
      const result = priceAnalyzer.determineMethod(priceData);
      
      expect(result).toBe('basic');
    });
    
    test('bepaalt elasticity methode correct', () => {
      const priceData = {
        prices: [10, 20, 30],
        sales: [100, 90, 80]
      };
      
      const result = priceAnalyzer.determineMethod(priceData);
      
      expect(result).toBe('elasticity');
    });
    
    test('bepaalt competitive methode correct', () => {
      const priceData = [
        { name: 'Competitor A', pricing: { average: 100 } },
        { name: 'Competitor B', pricing: { average: 120 } }
      ];
      
      const result = priceAnalyzer.determineMethod(priceData);
      
      expect(result).toBe('competitive');
    });
  });
});
