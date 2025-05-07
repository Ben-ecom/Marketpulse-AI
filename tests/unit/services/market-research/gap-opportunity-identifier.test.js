/**
 * Unit tests voor de Gap Opportunity Identifier component
 */

import { GapOpportunityIdentifier } from '../../../../src/services/market-research/components/gap-opportunity-identifier.js';

describe('GapOpportunityIdentifier', () => {
  let gapIdentifier;
  
  beforeEach(() => {
    gapIdentifier = new GapOpportunityIdentifier();
  });
  
  describe('constructor', () => {
    test('initialiseert met de juiste configuratie', () => {
      expect(gapIdentifier.config).toBeDefined();
      expect(gapIdentifier.config.minGapSize).toBeDefined();
      expect(gapIdentifier.config.minOpportunityScore).toBeDefined();
      expect(gapIdentifier.config.opportunityFactors).toBeDefined();
    });
  });
  
  describe('identify', () => {
    test('retourneert een foutmelding bij ongeldige input', async () => {
      const result = await gapIdentifier.identify(null, null, null);
      
      expect(result).toEqual(expect.objectContaining({
        gaps: [],
        opportunities: [],
        potentialMarketSize: 0,
        confidence: 0,
        method: 'none',
        error: expect.any(String)
      }));
    });
    
    test('identificeert gaten en kansen correct', async () => {
      const marketSize = {
        totalMarketSize: 1000000,
        segmentSizes: {
          segment1: 300000,
          segment2: 400000,
          segment3: 300000
        },
        forecast: [
          { year: 2022, value: 1000000 },
          { year: 2023, value: 1100000 },
          { year: 2024, value: 1210000 }
        ],
        confidence: 0.8
      };
      
      const segmentation = {
        segments: [
          {
            name: 'segment1',
            size: 300000,
            percentage: 0.3,
            demographics: 'Young professionals'
          },
          {
            name: 'segment2',
            size: 400000,
            percentage: 0.4,
            demographics: 'Families'
          },
          {
            name: 'segment3',
            size: 300000,
            percentage: 0.3,
            demographics: 'Seniors'
          }
        ],
        confidence: 0.7
      };
      
      const competitorAnalysis = {
        competitors: [
          {
            name: 'Competitor A',
            segments: ['segment1', 'segment2']
          },
          {
            name: 'Competitor B',
            segments: ['segment1', 'segment3']
          },
          {
            name: 'Own',
            isOwn: true,
            segments: ['segment2']
          }
        ],
        positioning: {
          dimensions: ['price', 'quality', 'innovation'],
          matrix: {
            price: {
              'Competitor A': 80,
              'Competitor B': 60,
              'Own': 90
            },
            quality: {
              'Competitor A': 70,
              'Competitor B': 50,
              'Own': 85
            },
            innovation: {
              'Competitor A': 60,
              'Competitor B': 40,
              'Own': 75
            }
          }
        },
        confidence: 0.7
      };
      
      const result = await gapIdentifier.identify(marketSize, segmentation, competitorAnalysis);
      
      expect(result).toEqual(expect.objectContaining({
        gaps: expect.any(Array),
        opportunities: expect.any(Array),
        potentialMarketSize: expect.any(Number),
        confidence: expect.any(Number),
        method: expect.any(String)
      }));
      
      // Er zou ten minste één gat moeten zijn (segment3 is onderbediend)
      expect(result.gaps.length).toBeGreaterThan(0);
      
      // Er zouden kansen moeten zijn gebaseerd op de gaten
      expect(result.opportunities.length).toBeGreaterThan(0);
    });
    
    test('handelt fouten correct af', async () => {
      // Mock een functie om een fout te forceren
      gapIdentifier.identifyMarketGaps = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      const result = await gapIdentifier.identify({}, {}, {});
      
      expect(result).toEqual(expect.objectContaining({
        gaps: [],
        opportunities: [],
        error: 'Test error',
        method: 'error'
      }));
    });
  });
  
  describe('identifyMarketGaps', () => {
    test('identificeert segmentgaten correct', () => {
      const marketSize = {
        totalMarketSize: 1000000
      };
      
      const segmentation = {
        segments: [
          {
            name: 'segment1',
            size: 300000,
            percentage: 0.3
          },
          {
            name: 'segment2',
            size: 400000,
            percentage: 0.4
          }
        ]
      };
      
      const competitorAnalysis = {
        competitors: [
          {
            name: 'Competitor A',
            segments: ['segment1']
          },
          {
            name: 'Own',
            isOwn: true,
            segments: ['segment1']
          }
        ]
      };
      
      // Mock calculateSegmentCoverage om lage dekking voor segment2 te simuleren
      gapIdentifier.calculateSegmentCoverage = jest.fn()
        .mockReturnValueOnce(0.8) // segment1
        .mockReturnValueOnce(0.2); // segment2
      
      const result = gapIdentifier.identifyMarketGaps(marketSize, segmentation, competitorAnalysis);
      
      // Er zou een gat moeten zijn voor segment2 (lage dekking)
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(gap => gap.name === 'segment2')).toBeTruthy();
    });
    
    test('identificeert positioneringsgaten correct', () => {
      const marketSize = {
        totalMarketSize: 1000000
      };
      
      const segmentation = {
        segments: []
      };
      
      const competitorAnalysis = {
        positioning: {
          dimensions: ['price'],
          matrix: {
            price: {
              'Competitor A': 30,
              'Competitor B': 90
            }
          }
        }
      };
      
      // Mock getCompetitorScoresForDimension om een groot gat te simuleren
      gapIdentifier.getCompetitorScoresForDimension = jest.fn()
        .mockReturnValue([30, 90]);
      
      const result = gapIdentifier.identifyMarketGaps(marketSize, segmentation, competitorAnalysis);
      
      // Er zou een gat moeten zijn voor price (groot gat tussen scores)
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(gap => gap.name.includes('price'))).toBeTruthy();
    });
  });
  
  describe('calculateSegmentCoverage', () => {
    test('berekent segmentdekking correct', () => {
      const segment = {
        name: 'segment1'
      };
      
      const competitorAnalysis = {
        competitors: [
          {
            name: 'Competitor A',
            segments: ['segment1', 'segment2']
          },
          {
            name: 'Competitor B',
            segments: ['segment2', 'segment3']
          },
          {
            name: 'Own',
            isOwn: true,
            segments: ['segment1', 'segment3']
          }
        ]
      };
      
      const result = gapIdentifier.calculateSegmentCoverage(segment, competitorAnalysis);
      
      // 2 van de 3 concurrenten bedienen segment1
      expect(result).toBeCloseTo(2/3);
    });
    
    test('retourneert 0 bij ongeldige input', () => {
      const result = gapIdentifier.calculateSegmentCoverage({}, null);
      
      expect(result).toBe(0);
    });
  });
  
  describe('getCompetitorsInSegment', () => {
    test('haalt concurrenten in een segment correct op', () => {
      const segment = {
        name: 'segment1'
      };
      
      const competitorAnalysis = {
        competitors: [
          {
            name: 'Competitor A',
            segments: ['segment1', 'segment2']
          },
          {
            name: 'Competitor B',
            segments: ['segment2', 'segment3']
          },
          {
            name: 'Own',
            isOwn: true,
            segments: ['segment1', 'segment3']
          }
        ]
      };
      
      const result = gapIdentifier.getCompetitorsInSegment(segment, competitorAnalysis);
      
      expect(result).toEqual(['Competitor A', 'Own']);
    });
    
    test('retourneert lege array bij ongeldige input', () => {
      const result = gapIdentifier.getCompetitorsInSegment({}, null);
      
      expect(result).toEqual([]);
    });
  });
  
  describe('getCompetitorScoresForDimension', () => {
    test('haalt scores voor een dimensie correct op', () => {
      const competitorAnalysis = {
        positioning: {
          matrix: {
            price: {
              'Competitor A': 80,
              'Competitor B': 60,
              'Own': 90
            }
          }
        }
      };
      
      const result = gapIdentifier.getCompetitorScoresForDimension('price', competitorAnalysis);
      
      expect(result).toEqual([80, 60, 90]);
    });
    
    test('retourneert lege array bij ongeldige input', () => {
      const result = gapIdentifier.getCompetitorScoresForDimension('price', null);
      
      expect(result).toEqual([]);
    });
  });
  
  describe('estimateGapSize', () => {
    test('schat gapgrootte correct', () => {
      const gapSize = 20; // 20% verschil
      const dimension = 'price';
      const marketSize = {
        totalMarketSize: 1000000
      };
      
      const result = gapIdentifier.estimateGapSize(gapSize, dimension, marketSize);
      
      // Basisschatting: (gapSize / 100) * totalMarketSize * multiplier
      // Voor prijs is de multiplier 1.2
      expect(result).toBeCloseTo((20 / 100) * 1000000 * 1.2);
    });
  });
  
  describe('identifyOpportunities', () => {
    test('converteert gaten naar kansen correct', () => {
      const gaps = [
        {
          type: 'segment',
          name: 'segment3',
          description: 'Onvoldoende dekking in segment: segment3',
          size: 300000,
          targetCustomers: 'Seniors',
          competitorPresence: ['Competitor B']
        }
      ];
      
      const marketSize = {
        totalMarketSize: 1000000,
        forecast: [
          { year: 2022, value: 1000000 },
          { year: 2023, value: 1100000 },
          { year: 2024, value: 1210000 }
        ]
      };
      
      const competitorAnalysis = {
        competitors: [
          {
            name: 'Competitor A',
            segments: ['segment1', 'segment2']
          },
          {
            name: 'Competitor B',
            segments: ['segment1', 'segment3']
          },
          {
            name: 'Own',
            isOwn: true,
            segments: ['segment2']
          }
        ]
      };
      
      // Mock calculateOpportunityScore om een hoge score te simuleren
      gapIdentifier.calculateOpportunityScore = jest.fn().mockReturnValue(80);
      
      const result = gapIdentifier.identifyOpportunities(gaps, marketSize, competitorAnalysis);
      
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(expect.objectContaining({
        name: expect.stringContaining('segment3'),
        score: 80,
        potentialMarketSize: 300000,
        targetCustomers: 'Seniors',
        competitiveAdvantage: expect.any(String),
        entryBarriers: expect.any(Array),
        timeToMarket: expect.any(String),
        riskLevel: expect.any(String)
      }));
    });
    
    test('filtert kansen op basis van opportunityscore', () => {
      const gaps = [
        {
          type: 'segment',
          name: 'segment3',
          description: 'Onvoldoende dekking in segment: segment3',
          size: 300000,
          targetCustomers: 'Seniors',
          competitorPresence: ['Competitor B']
        },
        {
          type: 'segment',
          name: 'segment4',
          description: 'Onvoldoende dekking in segment: segment4',
          size: 200000,
          targetCustomers: 'Students',
          competitorPresence: ['Competitor A', 'Competitor B']
        }
      ];
      
      // Mock calculateOpportunityScore om verschillende scores te simuleren
      gapIdentifier.calculateOpportunityScore = jest.fn()
        .mockReturnValueOnce(80) // segment3: hoge score
        .mockReturnValueOnce(50); // segment4: lage score
      
      // Stel minOpportunityScore in op 60
      gapIdentifier.config.minOpportunityScore = 60;
      
      const result = gapIdentifier.identifyOpportunities(gaps, {}, {});
      
      // Alleen segment3 zou moeten worden opgenomen (score 80 > 60)
      expect(result.length).toBe(1);
      expect(result[0].name).toContain('segment3');
    });
  });
  
  describe('calculateOpportunityScore', () => {
    test('berekent opportunityscore correct', () => {
      const gap = {
        type: 'segment',
        name: 'segment3',
        size: 300000,
        competitorPresence: ['Competitor B']
      };
      
      const marketSize = {
        totalMarketSize: 1000000,
        forecast: [
          { year: 2022, value: 1000000 },
          { year: 2023, value: 1100000 },
          { year: 2024, value: 1210000 }
        ]
      };
      
      // Mock individuele scorefuncties
      gapIdentifier.calculateMarketSizeScore = jest.fn().mockReturnValue(80);
      gapIdentifier.calculateCompetitionScore = jest.fn().mockReturnValue(70);
      gapIdentifier.calculateGrowthScore = jest.fn().mockReturnValue(60);
      gapIdentifier.calculateProfitScore = jest.fn().mockReturnValue(90);
      
      const result = gapIdentifier.calculateOpportunityScore(gap, marketSize, {});
      
      // Gewogen gemiddelde van de scores
      const expectedScore = 
        80 * gapIdentifier.config.opportunityFactors.marketSize +
        70 * gapIdentifier.config.opportunityFactors.competitionLevel +
        60 * gapIdentifier.config.opportunityFactors.growthRate +
        90 * gapIdentifier.config.opportunityFactors.profitMargin;
      
      expect(result).toBeCloseTo(expectedScore);
    });
  });
  
  describe('calculateMarketSizeScore', () => {
    test('berekent markgroottescore correct', () => {
      const gap = {
        size: 200000
      };
      
      const marketSize = {
        totalMarketSize: 1000000
      };
      
      const result = gapIdentifier.calculateMarketSizeScore(gap, marketSize);
      
      // Gap is 20% van de markt, zou een score van 60 moeten geven
      expect(result).toBe(60);
    });
    
    test('retourneert 50 bij ongeldige input', () => {
      const result = gapIdentifier.calculateMarketSizeScore({}, null);
      
      expect(result).toBe(50);
    });
  });
  
  describe('calculateCompetitionScore', () => {
    test('berekent concurrentiescore op basis van aanwezigheid', () => {
      const gap = {
        competitorPresence: ['Competitor A']
      };
      
      const result = gapIdentifier.calculateCompetitionScore(gap, {});
      
      // 1 concurrent, zou een score van 80 moeten geven
      expect(result).toBe(80);
    });
    
    test('berekent concurrentiescore op basis van coverage', () => {
      const gap = {
        coverage: 0.3
      };
      
      const result = gapIdentifier.calculateCompetitionScore(gap, {});
      
      // 30% dekking, zou een score van 70 moeten geven (1 - 0.3) * 100
      expect(result).toBe(70);
    });
    
    test('retourneert 50 bij ongeldige input', () => {
      const result = gapIdentifier.calculateCompetitionScore({}, null);
      
      expect(result).toBe(50);
    });
  });
  
  describe('calculateGrowthScore', () => {
    test('berekent groeiscore correct', () => {
      const marketSize = {
        forecast: [
          { year: 2022, value: 1000000 },
          { year: 2023, value: 1100000 },
          { year: 2024, value: 1210000 }
        ]
      };
      
      const result = gapIdentifier.calculateGrowthScore({}, marketSize);
      
      // CAGR van 10%, zou een score van 60 moeten geven
      expect(result).toBe(60);
    });
    
    test('retourneert 50 bij ongeldige input', () => {
      const result = gapIdentifier.calculateGrowthScore({}, null);
      
      expect(result).toBe(50);
    });
  });
  
  describe('calculateProfitScore', () => {
    test('berekent winstmargescore op basis van type gat', () => {
      expect(gapIdentifier.calculateProfitScore({ type: 'segment' })).toBe(70);
      expect(gapIdentifier.calculateProfitScore({ type: 'demographic' })).toBe(60);
      expect(gapIdentifier.calculateProfitScore({ type: 'psychographic' })).toBe(80);
      
      expect(gapIdentifier.calculateProfitScore({ 
        type: 'positioning', 
        name: 'premium price gap' 
      })).toBe(90);
      
      expect(gapIdentifier.calculateProfitScore({ 
        type: 'positioning', 
        name: 'budget price gap' 
      })).toBe(40);
    });
    
    test('retourneert standaardwaarde voor onbekende types', () => {
      const result = gapIdentifier.calculateProfitScore({ type: 'unknown' });
      
      expect(result).toBe(60);
    });
  });
  
  describe('generateOpportunityDescription', () => {
    test('genereert beschrijving op basis van type gat', () => {
      expect(gapIdentifier.generateOpportunityDescription({ 
        type: 'segment', 
        name: 'segment3' 
      })).toContain('segment3 segment');
      
      expect(gapIdentifier.generateOpportunityDescription({ 
        type: 'demographic', 
        name: 'young adults' 
      })).toContain('young adults demografische groep');
      
      expect(gapIdentifier.generateOpportunityDescription({ 
        type: 'psychographic', 
        name: 'eco-conscious' 
      })).toContain('eco-conscious psychografische groep');
      
      expect(gapIdentifier.generateOpportunityDescription({ 
        type: 'positioning', 
        name: 'quality gap' 
      })).toContain('quality dimensie');
    });
  });
  
  describe('suggestCompetitiveAdvantage', () => {
    test('suggereert concurrentievoordeel op basis van type gat', () => {
      expect(gapIdentifier.suggestCompetitiveAdvantage({ 
        type: 'segment', 
        name: 'segment3' 
      }, {})).toContain('segment3 segment');
      
      expect(gapIdentifier.suggestCompetitiveAdvantage({ 
        type: 'demographic', 
        name: 'young adults' 
      }, {})).toContain('young adults demografische groep');
      
      expect(gapIdentifier.suggestCompetitiveAdvantage({ 
        type: 'psychographic', 
        name: 'eco-conscious' 
      }, {})).toContain('eco-conscious psychografische groep');
      
      expect(gapIdentifier.suggestCompetitiveAdvantage({ 
        type: 'positioning', 
        name: 'quality gap' 
      }, {})).toContain('quality dimensie');
    });
  });
  
  describe('calculatePotentialMarketSize', () => {
    test('berekent potentiële marktgrootte correct', () => {
      const gaps = [
        { size: 200000 },
        { size: 300000 },
        { size: 100000 }
      ];
      
      const marketSize = {
        totalMarketSize: 1000000
      };
      
      const result = gapIdentifier.calculatePotentialMarketSize(gaps, marketSize);
      
      // Zou de som van de gaten moeten zijn met een overlapfactor
      // en begrensd tot 30% van de totale markt
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(300000); // 30% van 1000000
    });
  });
  
  describe('calculateConfidence', () => {
    test('berekent betrouwbaarheid correct', () => {
      const marketSize = {
        confidence: 0.8
      };
      
      const segmentation = {
        confidence: 0.7,
        segments: [{ name: 'segment1' }, { name: 'segment2' }]
      };
      
      const competitorAnalysis = {
        confidence: 0.6,
        competitors: [{ name: 'Competitor A' }, { name: 'Own', isOwn: true }]
      };
      
      const result = gapIdentifier.calculateConfidence(marketSize, segmentation, competitorAnalysis);
      
      expect(result).toBeGreaterThan(0.5); // Basis betrouwbaarheid
      expect(result).toBeLessThanOrEqual(1.0);
    });
  });
  
  describe('determineMethod', () => {
    test('bepaalt comprehensive methode correct', () => {
      const marketSize = { totalMarketSize: 1000000 };
      const segmentation = { segments: [{ name: 'segment1' }] };
      const competitorAnalysis = { competitors: [{ name: 'Competitor A' }] };
      
      const result = gapIdentifier.determineMethod(marketSize, segmentation, competitorAnalysis);
      
      expect(result).toBe('comprehensive');
    });
    
    test('bepaalt partial methode correct', () => {
      const marketSize = { totalMarketSize: 1000000 };
      const segmentation = { segments: [{ name: 'segment1' }] };
      
      const result = gapIdentifier.determineMethod(marketSize, segmentation, null);
      
      expect(result).toBe('partial');
    });
    
    test('bepaalt limited methode correct', () => {
      const marketSize = { totalMarketSize: 1000000 };
      
      const result = gapIdentifier.determineMethod(marketSize, null, null);
      
      expect(result).toBe('limited');
    });
    
    test('bepaalt basic methode correct', () => {
      const result = gapIdentifier.determineMethod(null, null, null);
      
      expect(result).toBe('basic');
    });
  });
});
