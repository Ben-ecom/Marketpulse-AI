/**
 * Integratie tests voor de Market Research Service
 * 
 * Deze tests valideren de integratie van alle market research componenten
 * en de end-to-end functionaliteit van de service.
 */

import { MarketResearchService } from '../../../src/services/market-research/market-research-service.js';

describe('MarketResearchService Integration', () => {
  let marketResearchService;
  
  beforeEach(() => {
    marketResearchService = new MarketResearchService();
  });
  
  describe('analyzeMarket', () => {
    test('voert een volledige marktanalyse uit met alle componenten', async () => {
      // Test data voor een volledige marktanalyse
      const marketData = {
        // Marktgrootte gegevens
        marketSize: {
          totalAddressableMarket: 5000000,
          serviceableAvailableMarket: 3000000,
          serviceableObtainableMarket: 1000000,
          historicalData: [
            { year: 2022, value: 900000 },
            { year: 2023, value: 950000 },
            { year: 2024, value: 1000000 }
          ],
          growthRate: 0.05
        },
        
        // Segmentatie gegevens
        segmentation: {
          demographic: {
            age: [
              { name: '18-24', percentage: 0.15 },
              { name: '25-34', percentage: 0.35 },
              { name: '35-44', percentage: 0.25 },
              { name: '45-54', percentage: 0.15 },
              { name: '55+', percentage: 0.1 }
            ],
            gender: [
              { name: 'Male', percentage: 0.55 },
              { name: 'Female', percentage: 0.45 }
            ],
            income: [
              { name: 'Low', percentage: 0.2 },
              { name: 'Medium', percentage: 0.5 },
              { name: 'High', percentage: 0.3 }
            ]
          },
          psychographic: {
            lifestyle: [
              { name: 'Active', percentage: 0.4 },
              { name: 'Balanced', percentage: 0.35 },
              { name: 'Relaxed', percentage: 0.25 }
            ],
            values: [
              { name: 'Quality-focused', percentage: 0.3 },
              { name: 'Price-sensitive', percentage: 0.4 },
              { name: 'Innovation-driven', percentage: 0.3 }
            ]
          },
          segments: [
            {
              name: 'Premium Segment',
              size: 300000,
              percentage: 0.3,
              description: 'Quality-focused consumers with high income'
            },
            {
              name: 'Value Segment',
              size: 500000,
              percentage: 0.5,
              description: 'Price-sensitive consumers seeking balanced value'
            },
            {
              name: 'Budget Segment',
              size: 200000,
              percentage: 0.2,
              description: 'Price-sensitive consumers with lower income'
            }
          ]
        },
        
        // Trend gegevens
        trends: {
          timeSeries: [
            { period: '2023-Q1', value: 230000 },
            { period: '2023-Q2', value: 240000 },
            { period: '2023-Q3', value: 235000 },
            { period: '2023-Q4', value: 245000 },
            { period: '2024-Q1', value: 250000 },
            { period: '2024-Q2', value: 255000 }
          ],
          keywords: [
            { term: 'sustainable', growth: 0.25 },
            { term: 'eco-friendly', growth: 0.3 },
            { term: 'premium', growth: 0.1 },
            { term: 'affordable', growth: -0.05 }
          ],
          seasonality: {
            pattern: 'quarterly',
            peakPeriods: ['Q4', 'Q1']
          }
        },
        
        // Prijsgegevens
        pricing: {
          products: [
            { name: 'Premium Product', price: 199.99 },
            { name: 'Standard Product', price: 99.99 },
            { name: 'Basic Product', price: 49.99 }
          ],
          competitors: [
            { name: 'Competitor A', pricing: { average: 149.99, range: [99.99, 199.99] } },
            { name: 'Competitor B', pricing: { average: 89.99, range: [49.99, 129.99] } },
            { name: 'Competitor C', pricing: { average: 179.99, range: [129.99, 229.99] } }
          ],
          elasticity: {
            prices: [49.99, 69.99, 89.99, 109.99, 129.99],
            sales: [1000, 850, 700, 500, 300]
          }
        },
        
        // Concurrentiegegevens
        competitors: [
          {
            name: 'Competitor A',
            marketShare: 0.25,
            positioning: {
              price: 70,  // 0-100 schaal, lager is goedkoper
              quality: 80, // 0-100 schaal, hoger is beter
              innovation: 75, // 0-100 schaal, hoger is innovatiever
              customerSatisfaction: 85 // 0-100 schaal, hoger is beter
            },
            segments: ['Premium Segment', 'Value Segment'],
            strengths: ['Strong brand', 'High quality'],
            weaknesses: ['Higher prices', 'Limited product range']
          },
          {
            name: 'Competitor B',
            marketShare: 0.2,
            positioning: {
              price: 50,
              quality: 65,
              innovation: 60,
              customerSatisfaction: 70
            },
            segments: ['Value Segment', 'Budget Segment'],
            strengths: ['Competitive pricing', 'Wide distribution'],
            weaknesses: ['Lower quality perception', 'Less innovation']
          },
          {
            name: 'Competitor C',
            marketShare: 0.15,
            positioning: {
              price: 85,
              quality: 90,
              innovation: 85,
              customerSatisfaction: 80
            },
            segments: ['Premium Segment'],
            strengths: ['Premium quality', 'Innovation leader'],
            weaknesses: ['High prices', 'Limited market reach']
          },
          {
            name: 'Own',
            isOwn: true,
            marketShare: 0.15,
            positioning: {
              price: 60,
              quality: 75,
              innovation: 80,
              customerSatisfaction: 75
            },
            segments: ['Value Segment', 'Premium Segment'],
            strengths: ['Good price-quality ratio', 'Innovation'],
            weaknesses: ['Brand awareness', 'Market reach']
          }
        ]
      };
      
      // Voer de marktanalyse uit
      const result = await marketResearchService.analyzeMarket(marketData);
      
      // Valideer het resultaat
      expect(result).toEqual(expect.objectContaining({
        success: true,
        results: expect.objectContaining({
          marketSize: expect.any(Object),
          segmentation: expect.any(Object),
          trends: expect.any(Object),
          priceAnalysis: expect.any(Object),
          competitorAnalysis: expect.any(Object),
          gapOpportunities: expect.any(Object),
          visualizationData: expect.any(Object),
          metadata: expect.any(Object)
        })
      }));
      
      // Valideer individuele componenten
      
      // Marktgrootte
      expect(result.results.marketSize).toEqual(expect.objectContaining({
        totalMarketSize: expect.any(Number),
        segmentSizes: expect.any(Object),
        growthRate: expect.any(Number),
        forecast: expect.any(Array)
      }));
      
      // Segmentatie
      expect(result.results.segmentation).toEqual(expect.objectContaining({
        segments: expect.any(Array),
        demographic: expect.any(Object),
        psychographic: expect.any(Object)
      }));
      
      // Trends
      expect(result.results.trends).toEqual(expect.objectContaining({
        trends: expect.any(Array),
        seasonality: expect.any(Object),
        forecast: expect.any(Array)
      }));
      
      // Prijsanalyse
      expect(result.results.priceAnalysis).toEqual(expect.objectContaining({
        priceRange: expect.any(Object),
        priceDistribution: expect.any(Object),
        priceElasticity: expect.any(Object),
        competitivePricing: expect.any(Object),
        optimumPricePoints: expect.any(Object)
      }));
      
      // Concurrentieanalyse
      expect(result.results.competitorAnalysis).toEqual(expect.objectContaining({
        competitors: expect.any(Array),
        positioning: expect.any(Object),
        marketShare: expect.any(Object),
        competitiveAdvantages: expect.any(Object),
        swotAnalysis: expect.any(Object)
      }));
      
      // Gaten en kansen
      expect(result.results.gapOpportunities).toEqual(expect.objectContaining({
        gaps: expect.any(Array),
        opportunities: expect.any(Array),
        potentialMarketSize: expect.any(Number)
      }));
    });
    
    test('handelt ongeldige input correct af', async () => {
      const result = await marketResearchService.analyzeMarket(null);
      
      expect(result).toEqual(expect.objectContaining({
        success: false,
        error: expect.any(String)
      }));
    });
    
    test('verwerkt gedeeltelijke gegevens correct', async () => {
      // Test data met alleen marktgrootte en concurrentiegegevens
      const partialData = {
        marketSize: {
          totalAddressableMarket: 5000000,
          serviceableAvailableMarket: 3000000,
          serviceableObtainableMarket: 1000000
        },
        competitors: [
          {
            name: 'Competitor A',
            marketShare: 0.25
          },
          {
            name: 'Own',
            isOwn: true,
            marketShare: 0.15
          }
        ]
      };
      
      const result = await marketResearchService.analyzeMarket(partialData);
      
      expect(result).toEqual(expect.objectContaining({
        success: true,
        results: expect.objectContaining({
          marketSize: expect.any(Object),
          competitorAnalysis: expect.any(Object)
        })
      }));
      
      // Componenten waarvoor geen gegevens zijn, zouden null moeten zijn
      expect(result.results.trends).toBeNull();
      expect(result.results.priceAnalysis).toBeNull();
    });
  });
  
  describe('generateMarketInsights', () => {
    test('genereert inzichten op basis van marktanalyse', async () => {
      // Mock een marktanalyseresultaat
      const marketAnalysis = {
        success: true,
        results: {
          marketSize: {
            totalMarketSize: 1000000,
            growthRate: 0.05,
            forecast: [
              { year: 2024, value: 1000000 },
              { year: 2025, value: 1050000 }
            ]
          },
          segmentation: {
            segments: [
              { name: 'Premium Segment', size: 300000, percentage: 0.3 },
              { name: 'Value Segment', size: 500000, percentage: 0.5 },
              { name: 'Budget Segment', size: 200000, percentage: 0.2 }
            ]
          },
          trends: {
            trends: [
              { name: 'Sustainability', growth: 0.25, confidence: 0.8 },
              { name: 'Digital Transformation', growth: 0.3, confidence: 0.9 }
            ]
          },
          priceAnalysis: {
            priceRange: { min: 49.99, max: 199.99, avg: 99.99 },
            priceElasticity: { elasticity: 1.2, elasticityType: 'elastic' },
            optimumPricePoints: {
              recommendedPricePoints: {
                budget: 59.99,
                midRange: 99.99,
                premium: 149.99
              }
            }
          },
          competitorAnalysis: {
            marketShare: {
              marketShares: {
                'Competitor A': 0.25,
                'Competitor B': 0.2,
                'Own': 0.15
              },
              concentration: 'moderately concentrated'
            },
            swotAnalysis: {
              strengths: ['Good price-quality ratio', 'Innovation'],
              weaknesses: ['Brand awareness', 'Market reach'],
              opportunities: ['Growing premium segment', 'Sustainability trend'],
              threats: ['Intense competition', 'Price pressure']
            }
          },
          gapOpportunities: {
            opportunities: [
              {
                name: 'Premium Eco-friendly Products',
                score: 85,
                potentialMarketSize: 150000,
                riskLevel: 'Medium'
              },
              {
                name: 'Digital Value Solutions',
                score: 75,
                potentialMarketSize: 200000,
                riskLevel: 'Low-Medium'
              }
            ]
          }
        }
      };
      
      // Mock de analyzeMarket methode
      marketResearchService.analyzeMarket = jest.fn().mockResolvedValue(marketAnalysis);
      
      // Genereer inzichten
      const result = await marketResearchService.generateMarketInsights({});
      
      expect(result).toEqual(expect.objectContaining({
        success: true,
        insights: expect.objectContaining({
          marketOverview: expect.any(Object),
          keyOpportunities: expect.any(Array),
          competitiveLandscape: expect.any(Object),
          recommendations: expect.any(Array)
        })
      }));
      
      // Valideer dat de inzichten gebaseerd zijn op de marktanalyse
      expect(result.insights.marketOverview.size).toBe(1000000);
      expect(result.insights.marketOverview.growthRate).toBe(0.05);
      expect(result.insights.keyOpportunities.length).toBeGreaterThan(0);
      expect(result.insights.recommendations.length).toBeGreaterThan(0);
    });
    
    test('handelt mislukte marktanalyse correct af', async () => {
      // Mock een mislukte marktanalyse
      marketResearchService.analyzeMarket = jest.fn().mockResolvedValue({
        success: false,
        error: 'Ongeldige marktgegevens'
      });
      
      const result = await marketResearchService.generateMarketInsights({});
      
      expect(result).toEqual(expect.objectContaining({
        success: false,
        error: expect.any(String)
      }));
    });
  });
  
  describe('generateVisualizationData', () => {
    test('genereert visualisatiegegevens op basis van marktanalyse', async () => {
      // Mock een marktanalyseresultaat
      const marketAnalysis = {
        success: true,
        results: {
          marketSize: {
            totalMarketSize: 1000000,
            segmentSizes: {
              'Premium Segment': 300000,
              'Value Segment': 500000,
              'Budget Segment': 200000
            }
          },
          segmentation: {
            segments: [
              { name: 'Premium Segment', size: 300000, percentage: 0.3 },
              { name: 'Value Segment', size: 500000, percentage: 0.5 },
              { name: 'Budget Segment', size: 200000, percentage: 0.2 }
            ]
          },
          competitorAnalysis: {
            marketShare: {
              marketShares: {
                'Competitor A': 0.25,
                'Competitor B': 0.2,
                'Competitor C': 0.15,
                'Own': 0.15
              }
            },
            positioning: {
              matrix: {
                price: {
                  'Competitor A': 70,
                  'Competitor B': 50,
                  'Competitor C': 85,
                  'Own': 60
                },
                quality: {
                  'Competitor A': 80,
                  'Competitor B': 65,
                  'Competitor C': 90,
                  'Own': 75
                }
              }
            }
          }
        }
      };
      
      // Genereer visualisatiegegevens
      const result = marketResearchService.generateVisualizationData(marketAnalysis.results);
      
      expect(result).toEqual(expect.objectContaining({
        marketSegmentation: expect.any(Object),
        competitorPositioning: expect.any(Object),
        marketShareDistribution: expect.any(Object)
      }));
      
      // Valideer de visualisatiegegevens
      expect(result.marketSegmentation.labels.length).toBe(3); // 3 segmenten
      expect(result.marketSegmentation.data.length).toBe(3);
      
      expect(result.competitorPositioning.xAxis).toBe('price');
      expect(result.competitorPositioning.yAxis).toBe('quality');
      expect(result.competitorPositioning.competitors.length).toBe(4);
      
      expect(result.marketShareDistribution.labels.length).toBe(4); // 4 concurrenten
      expect(result.marketShareDistribution.data.length).toBe(4);
    });
    
    test('retourneert lege visualisatiegegevens bij onvolledige marktanalyse', () => {
      const result = marketResearchService.generateVisualizationData({});
      
      expect(result).toEqual(expect.objectContaining({
        marketSegmentation: expect.objectContaining({
          labels: [],
          data: []
        }),
        competitorPositioning: expect.objectContaining({
          competitors: []
        }),
        marketShareDistribution: expect.objectContaining({
          labels: [],
          data: []
        })
      }));
    });
  });
});
