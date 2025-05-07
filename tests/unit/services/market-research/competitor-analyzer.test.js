/**
 * Unit tests voor de Competitor Analyzer component
 */

import { CompetitorAnalyzer } from '../../../../src/services/market-research/components/competitor-analyzer.js';

describe('CompetitorAnalyzer', () => {
  let competitorAnalyzer;
  
  beforeEach(() => {
    competitorAnalyzer = new CompetitorAnalyzer();
  });
  
  describe('constructor', () => {
    test('initialiseert met de juiste configuratie', () => {
      expect(competitorAnalyzer.config).toBeDefined();
      expect(competitorAnalyzer.config.positioningDimensions).toBeDefined();
      expect(competitorAnalyzer.config.swotCategories).toBeDefined();
    });
  });
  
  describe('analyze', () => {
    test('retourneert een foutmelding bij ongeldige input', async () => {
      const result = await competitorAnalyzer.analyze(null);
      
      expect(result).toEqual(expect.objectContaining({
        competitors: [],
        positioning: null,
        marketShare: null,
        competitiveAdvantages: null,
        swotAnalysis: null,
        confidence: 0,
        method: 'none',
        error: expect.any(String)
      }));
    });
    
    test('analyseert concurrentiegegevens correct', async () => {
      const competitorData = [
        {
          name: 'Competitor A',
          price: 80,
          quality: 70,
          innovation: 60,
          marketShare: 0.2
        },
        {
          name: 'Competitor B',
          price: 100,
          quality: 90,
          innovation: 80,
          marketShare: 0.3
        },
        {
          name: 'Own',
          isOwn: true,
          price: 90,
          quality: 85,
          innovation: 75,
          marketShare: 0.15
        }
      ];
      
      const result = await competitorAnalyzer.analyze(competitorData);
      
      expect(result).toEqual(expect.objectContaining({
        competitors: expect.any(Array),
        positioning: expect.any(Object),
        marketShare: expect.any(Object),
        competitiveAdvantages: expect.any(Object),
        swotAnalysis: expect.any(Object),
        confidence: expect.any(Number),
        method: expect.any(String)
      }));
      
      expect(result.competitors.length).toBe(3);
    });
    
    test('handelt fouten correct af', async () => {
      // Mock een functie om een fout te forceren
      competitorAnalyzer.normalizeCompetitorData = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const result = await competitorAnalyzer.analyze([{ name: 'Test' }]);
      
      expect(result).toEqual(expect.objectContaining({
        competitors: [],
        error: 'Test error',
        method: 'error'
      }));
    });
  });
  
  describe('normalizeCompetitorData', () => {
    test('normaliseert een array van concurrenten', () => {
      const competitors = [
        { name: 'Competitor A' },
        { name: 'Competitor B' }
      ];
      
      const result = competitorAnalyzer.normalizeCompetitorData(competitors);
      
      expect(result).toEqual(competitors);
    });
    
    test('genereert namen voor concurrenten zonder naam', () => {
      const competitors = [
        { price: 100 },
        { quality: 80 }
      ];
      
      const result = competitorAnalyzer.normalizeCompetitorData(competitors);
      
      expect(result[0].name).toBeDefined();
      expect(result[1].name).toBeDefined();
    });
    
    test('extraheert concurrenten uit een object met competitors eigenschap', () => {
      const data = {
        competitors: [
          { name: 'Competitor A' },
          { name: 'Competitor B' }
        ]
      };
      
      const result = competitorAnalyzer.normalizeCompetitorData(data);
      
      expect(result).toEqual(data.competitors);
    });
    
    test('retourneert lege array bij ongeldige input', () => {
      const result = competitorAnalyzer.normalizeCompetitorData({});
      
      expect(result).toEqual([]);
    });
  });
  
  describe('analyzePositioning', () => {
    test('analyseert positionering correct', () => {
      const competitors = [
        {
          name: 'Competitor A',
          price: 80,
          quality: 70
        },
        {
          name: 'Competitor B',
          price: 100,
          quality: 90
        },
        {
          name: 'Own',
          price: 90,
          quality: 85
        }
      ];
      
      const result = competitorAnalyzer.analyzePositioning(competitors);
      
      expect(result).toEqual(expect.objectContaining({
        dimensions: expect.any(Array),
        matrix: expect.objectContaining({
          price: expect.any(Object),
          quality: expect.any(Object)
        }),
        relativePositions: expect.objectContaining({
          'Competitor A': expect.any(Object),
          'Competitor B': expect.any(Object),
          'Own': expect.any(Object)
        })
      }));
    });
    
    test('gebruikt aangepaste dimensies indien opgegeven', () => {
      const competitors = [
        {
          name: 'Competitor A',
          customDim1: 80,
          customDim2: 70
        },
        {
          name: 'Competitor B',
          customDim1: 100,
          customDim2: 90
        }
      ];
      
      const options = {
        dimensions: ['customDim1', 'customDim2']
      };
      
      const result = competitorAnalyzer.analyzePositioning(competitors, options);
      
      expect(result.dimensions).toEqual(['customDim1', 'customDim2']);
      expect(result.matrix.customDim1).toBeDefined();
      expect(result.matrix.customDim2).toBeDefined();
    });
    
    test('normaliseert scores naar 0-100 schaal indien nodig', () => {
      const competitors = [
        {
          name: 'Competitor A',
          score: 0.8 // Op 0-1 schaal
        },
        {
          name: 'Competitor B',
          score: 0.9 // Op 0-1 schaal
        }
      ];
      
      const options = {
        dimensions: ['score']
      };
      
      const result = competitorAnalyzer.analyzePositioning(competitors, options);
      
      // Scores zouden genormaliseerd moeten zijn naar 0-100 schaal
      expect(result.matrix.score['Competitor A']).toBeCloseTo(80);
      expect(result.matrix.score['Competitor B']).toBeCloseTo(90);
    });
  });
  
  describe('analyzeMarketShare', () => {
    test('analyseert marktaandeel correct', () => {
      const competitors = [
        {
          name: 'Competitor A',
          marketShare: 0.2
        },
        {
          name: 'Competitor B',
          marketShare: 0.3
        },
        {
          name: 'Competitor C',
          marketShare: 0.15
        },
        {
          name: 'Own',
          marketShare: 0.25
        }
      ];
      
      const result = competitorAnalyzer.analyzeMarketShare(competitors);
      
      expect(result).toEqual(expect.objectContaining({
        marketShares: expect.objectContaining({
          'Competitor A': 0.2,
          'Competitor B': 0.3,
          'Competitor C': 0.15,
          'Own': 0.25
        }),
        concentrationRatio: expect.objectContaining({
          cr3: expect.any(Number),
          cr5: expect.any(Number)
        }),
        hhi: expect.any(Number),
        concentration: expect.any(String)
      }));
      
      // CR3 zou de som van de 3 grootste marktaandelen moeten zijn
      expect(result.concentrationRatio.cr3).toBeCloseTo(0.2 + 0.3 + 0.25);
    });
    
    test('normaliseert marktaandelen naar percentages indien nodig', () => {
      const competitors = [
        {
          name: 'Competitor A',
          marketShare: 20 // Als percentage
        },
        {
          name: 'Competitor B',
          marketShare: 30 // Als percentage
        }
      ];
      
      const result = competitorAnalyzer.analyzeMarketShare(competitors);
      
      // Marktaandelen zouden genormaliseerd moeten zijn naar 0-1 schaal
      expect(result.marketShares['Competitor A']).toBeCloseTo(0.2);
      expect(result.marketShares['Competitor B']).toBeCloseTo(0.3);
    });
    
    test('schat ontbrekende marktaandelen indien nodig', () => {
      const competitors = [
        {
          name: 'Competitor A',
          marketShare: 0.2
        },
        {
          name: 'Competitor B',
          marketShare: 0.3
        },
        {
          name: 'Competitor C'
          // Geen marktaandeel opgegeven
        }
      ];
      
      const result = competitorAnalyzer.analyzeMarketShare(competitors);
      
      // Competitor C zou een geschat marktaandeel moeten hebben
      expect(result.marketShares['Competitor C']).toBeDefined();
      
      // De som van alle marktaandelen zou ongeveer 1 moeten zijn
      const sum = Object.values(result.marketShares).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 1);
    });
    
    test('bepaalt marktconcentratie correct', () => {
      // Test voor ongeconcentreerde markt
      const lowConcentrationCompetitors = Array(20).fill().map((_, i) => ({
        name: `Competitor ${i}`,
        marketShare: 0.05
      }));
      
      const lowResult = competitorAnalyzer.analyzeMarketShare(lowConcentrationCompetitors);
      expect(lowResult.concentration).toBe('unconcentrated');
      
      // Test voor hoog geconcentreerde markt
      const highConcentrationCompetitors = [
        { name: 'Competitor A', marketShare: 0.5 },
        { name: 'Competitor B', marketShare: 0.3 },
        { name: 'Competitor C', marketShare: 0.2 }
      ];
      
      const highResult = competitorAnalyzer.analyzeMarketShare(highConcentrationCompetitors);
      expect(highResult.concentration).toBe('highly concentrated');
    });
  });
  
  describe('identifyCompetitiveAdvantages', () => {
    test('identificeert concurrentievoordelen correct', () => {
      const competitors = [
        {
          name: 'Competitor A',
          price: 80,
          quality: 70
        },
        {
          name: 'Own',
          isOwn: true,
          price: 90,
          quality: 85
        }
      ];
      
      const positioning = {
        dimensions: ['price', 'quality'],
        matrix: {
          price: {
            'Competitor A': 80,
            'Own': 90
          },
          quality: {
            'Competitor A': 70,
            'Own': 85
          }
        }
      };
      
      const result = competitorAnalyzer.identifyCompetitiveAdvantages(competitors, positioning);
      
      expect(result).toEqual(expect.objectContaining({
        byDimension: expect.objectContaining({
          price: expect.any(Object),
          quality: expect.any(Object)
        }),
        summary: expect.objectContaining({
          significantAdvantages: expect.any(Array),
          slightAdvantages: expect.any(Array),
          significantDisadvantages: expect.any(Array),
          slightDisadvantages: expect.any(Array)
        })
      }));
      
      // Quality zou een significant voordeel moeten zijn
      expect(result.byDimension.quality.type).toBe('significant advantage');
      
      // Price zou een nadeel moeten zijn (hoger is slechter voor prijs)
      expect(result.byDimension.price.type).toContain('disadvantage');
    });
    
    test('retourneert null als er geen eigen bedrijf is', () => {
      const competitors = [
        {
          name: 'Competitor A',
          price: 80,
          quality: 70
        },
        {
          name: 'Competitor B',
          price: 90,
          quality: 85
        }
      ];
      
      const positioning = {
        dimensions: ['price', 'quality'],
        matrix: {
          price: {
            'Competitor A': 80,
            'Competitor B': 90
          },
          quality: {
            'Competitor A': 70,
            'Competitor B': 85
          }
        }
      };
      
      const result = competitorAnalyzer.identifyCompetitiveAdvantages(competitors, positioning);
      
      expect(result).toBeNull();
    });
  });
  
  describe('findOwnCompanyName', () => {
    test('vindt eigen bedrijfsnaam op basis van isOwn flag', () => {
      const competitors = [
        { name: 'Competitor A' },
        { name: 'MyCompany', isOwn: true },
        { name: 'Competitor B' }
      ];
      
      const result = competitorAnalyzer.findOwnCompanyName(competitors);
      
      expect(result).toBe('MyCompany');
    });
    
    test('vindt eigen bedrijfsnaam op basis van isOwnCompany flag', () => {
      const competitors = [
        { name: 'Competitor A' },
        { name: 'MyCompany', isOwnCompany: true },
        { name: 'Competitor B' }
      ];
      
      const result = competitorAnalyzer.findOwnCompanyName(competitors);
      
      expect(result).toBe('MyCompany');
    });
    
    test('vindt eigen bedrijfsnaam op basis van naam "Own" of "Self"', () => {
      const competitors = [
        { name: 'Competitor A' },
        { name: 'Own' },
        { name: 'Competitor B' }
      ];
      
      const result = competitorAnalyzer.findOwnCompanyName(competitors);
      
      expect(result).toBe('Own');
      
      const competitors2 = [
        { name: 'Competitor A' },
        { name: 'Self' },
        { name: 'Competitor B' }
      ];
      
      const result2 = competitorAnalyzer.findOwnCompanyName(competitors2);
      
      expect(result2).toBe('Self');
    });
    
    test('retourneert null als er geen eigen bedrijf is', () => {
      const competitors = [
        { name: 'Competitor A' },
        { name: 'Competitor B' }
      ];
      
      const result = competitorAnalyzer.findOwnCompanyName(competitors);
      
      expect(result).toBeNull();
    });
  });
  
  describe('generateSwotAnalysis', () => {
    test('genereert SWOT analyse correct', () => {
      const competitors = [
        {
          name: 'Competitor A',
          price: 80,
          quality: 70,
          innovation: 60,
          marketShare: 0.2
        },
        {
          name: 'Own',
          isOwn: true,
          price: 90,
          quality: 85,
          innovation: 75,
          marketShare: 0.25
        }
      ];
      
      const positioning = {
        dimensions: ['price', 'quality', 'innovation'],
        relativePositions: {
          'Competitor A': {
            price: { position: 'above', score: 80, relativeTo: 85 },
            quality: { position: 'below', score: 70, relativeTo: 77.5 },
            innovation: { position: 'below', score: 60, relativeTo: 67.5 }
          },
          'Own': {
            price: { position: 'below', score: 90, relativeTo: 85 },
            quality: { position: 'above', score: 85, relativeTo: 77.5 },
            innovation: { position: 'above', score: 75, relativeTo: 67.5 }
          }
        }
      };
      
      const marketShare = {
        marketShares: {
          'Competitor A': 0.2,
          'Own': 0.25
        },
        concentration: 'moderately concentrated'
      };
      
      const result = competitorAnalyzer.generateSwotAnalysis(competitors, positioning, marketShare);
      
      expect(result).toEqual(expect.objectContaining({
        strengths: expect.any(Array),
        weaknesses: expect.any(Array),
        opportunities: expect.any(Array),
        threats: expect.any(Array)
      }));
      
      // Quality zou een sterkte moeten zijn
      expect(result.strengths.some(s => s.includes('quality') || s.includes('kwaliteit'))).toBeTruthy();
      
      // Price zou een zwakte moeten zijn
      expect(result.weaknesses.some(w => w.includes('price') || w.includes('prijs'))).toBeTruthy();
    });
    
    test('retourneert null als er geen eigen bedrijf is', () => {
      const competitors = [
        {
          name: 'Competitor A',
          price: 80,
          quality: 70
        },
        {
          name: 'Competitor B',
          price: 90,
          quality: 85
        }
      ];
      
      const positioning = {
        dimensions: ['price', 'quality'],
        relativePositions: {
          'Competitor A': {
            price: { position: 'above', score: 80, relativeTo: 85 },
            quality: { position: 'below', score: 70, relativeTo: 77.5 }
          },
          'Competitor B': {
            price: { position: 'below', score: 90, relativeTo: 85 },
            quality: { position: 'above', score: 85, relativeTo: 77.5 }
          }
        }
      };
      
      const marketShare = {
        marketShares: {
          'Competitor A': 0.4,
          'Competitor B': 0.6
        }
      };
      
      const result = competitorAnalyzer.generateSwotAnalysis(competitors, positioning, marketShare);
      
      expect(result).toBeNull();
    });
  });
  
  describe('calculateConfidence', () => {
    test('berekent betrouwbaarheid correct', () => {
      const competitors = [
        {
          name: 'Competitor A',
          price: 80,
          quality: 70,
          marketShare: 0.2
        },
        {
          name: 'Competitor B',
          price: 90,
          quality: 85,
          marketShare: 0.3
        },
        {
          name: 'Own',
          isOwn: true,
          price: 85,
          quality: 80,
          marketShare: 0.25
        }
      ];
      
      const result = competitorAnalyzer.calculateConfidence(competitors);
      
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
    
    test('verhoogt betrouwbaarheid bij meer concurrenten', () => {
      const fewCompetitors = [
        { name: 'Competitor A', price: 80 },
        { name: 'Own', isOwn: true, price: 85 }
      ];
      
      const manyCompetitors = [
        { name: 'Competitor A', price: 80 },
        { name: 'Competitor B', price: 90 },
        { name: 'Competitor C', price: 70 },
        { name: 'Competitor D', price: 85 },
        { name: 'Own', isOwn: true, price: 85 }
      ];
      
      const fewResult = competitorAnalyzer.calculateConfidence(fewCompetitors);
      const manyResult = competitorAnalyzer.calculateConfidence(manyCompetitors);
      
      expect(manyResult).toBeGreaterThan(fewResult);
    });
    
    test('verhoogt betrouwbaarheid bij meer dimensies', () => {
      const fewDimensions = [
        { name: 'Competitor A', price: 80 },
        { name: 'Own', isOwn: true, price: 85 }
      ];
      
      const manyDimensions = [
        { name: 'Competitor A', price: 80, quality: 70, innovation: 60, service: 75 },
        { name: 'Own', isOwn: true, price: 85, quality: 80, innovation: 70, service: 85 }
      ];
      
      const fewResult = competitorAnalyzer.calculateConfidence(fewDimensions);
      const manyResult = competitorAnalyzer.calculateConfidence(manyDimensions);
      
      expect(manyResult).toBeGreaterThan(fewResult);
    });
  });
  
  describe('countAvailableDimensions', () => {
    test('telt beschikbare dimensies correct', () => {
      const competitors = [
        {
          name: 'Competitor A',
          price: 80,
          quality: 70
        },
        {
          name: 'Competitor B',
          price: 90,
          scores: {
            innovation: 80,
            service: 85
          }
        },
        {
          name: 'Own',
          isOwn: true,
          positioning: {
            design: 90,
            reliability: 95
          }
        }
      ];
      
      const result = competitorAnalyzer.countAvailableDimensions(competitors);
      
      // price, quality, innovation, service, design, reliability
      expect(result).toBe(6);
    });
  });
  
  describe('determineMethod', () => {
    test('bepaalt comprehensive methode correct', () => {
      const competitors = [
        {
          name: 'Competitor A',
          marketShare: 0.2,
          positioning: {
            price: 80,
            quality: 70
          }
        },
        {
          name: 'Own',
          isOwn: true,
          marketShare: 0.25,
          positioning: {
            price: 85,
            quality: 80
          }
        }
      ];
      
      const result = competitorAnalyzer.determineMethod(competitors);
      
      expect(result).toBe('comprehensive');
    });
    
    test('bepaalt market-share methode correct', () => {
      const competitors = [
        {
          name: 'Competitor A',
          marketShare: 0.2
        },
        {
          name: 'Own',
          isOwn: true,
          marketShare: 0.25
        }
      ];
      
      const result = competitorAnalyzer.determineMethod(competitors);
      
      expect(result).toBe('market-share');
    });
    
    test('bepaalt positioning methode correct', () => {
      const competitors = [
        {
          name: 'Competitor A',
          positioning: {
            price: 80,
            quality: 70
          }
        },
        {
          name: 'Own',
          isOwn: true,
          positioning: {
            price: 85,
            quality: 80
          }
        }
      ];
      
      const result = competitorAnalyzer.determineMethod(competitors);
      
      expect(result).toBe('positioning');
    });
    
    test('bepaalt basic methode correct', () => {
      const competitors = [
        {
          name: 'Competitor A'
        },
        {
          name: 'Own',
          isOwn: true
        }
      ];
      
      const result = competitorAnalyzer.determineMethod(competitors);
      
      expect(result).toBe('basic');
    });
  });
});
