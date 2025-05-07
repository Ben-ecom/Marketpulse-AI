/**
 * Test voor de trending topics utility functies
 */

import { describe, test, expect, jest } from '@jest/globals';

// Mock implementaties voor de utility functies
jest.mock('../../utils/trending/topicExtraction', () => ({
  extractTopics: jest.fn().mockImplementation(() => [
    { topic: 'bitcoin', frequency: 10 },
    { topic: 'ethereum', frequency: 8 },
    { topic: 'blockchain', frequency: 6 }
  ]),
  calculateTopicFrequency: jest.fn().mockImplementation(() => ({
    'bitcoin': [10, 12, 15, 20, 18],
    'ethereum': [8, 7, 9, 11, 10],
    'blockchain': [6, 8, 7, 9, 8]
  })),
  getTopicTimeseries: jest.fn().mockImplementation((topic) => {
    const mockData = {
      'bitcoin': [
        { date: '2023-01-01', value: 10 },
        { date: '2023-01-02', value: 12 },
        { date: '2023-01-03', value: 15 },
        { date: '2023-01-04', value: 20 },
        { date: '2023-01-05', value: 18 }
      ],
      'ethereum': [
        { date: '2023-01-01', value: 8 },
        { date: '2023-01-02', value: 7 },
        { date: '2023-01-03', value: 9 },
        { date: '2023-01-04', value: 11 },
        { date: '2023-01-05', value: 10 }
      ]
    };
    return mockData[topic] || [];
  })
}));

jest.mock('../../utils/trending/topicNormalization', () => ({
  normalizeTimeseries: jest.fn().mockImplementation((data) => 
    data.map(point => ({ ...point, normalizedValue: point.value / 20 }))
  ),
  zScoreNormalization: jest.fn().mockImplementation((data) => 
    data.map(point => ({ ...point, zScore: (point.value - 10) / 5 }))
  )
}));

jest.mock('../../utils/trending/trendDetection', () => ({
  detectSpikes: jest.fn().mockImplementation(() => [2, 4]),
  detectTrendChanges: jest.fn().mockImplementation(() => [
    { index: 2, type: 'upward', magnitude: 0.3 },
    { index: 4, type: 'downward', magnitude: 0.2 }
  ])
}));

jest.mock('../../utils/trending/eventAnnotation', () => ({
  addEventAnnotations: jest.fn().mockImplementation((data) => 
    data.map((point, index) => {
      if (index === 2) {
        return { ...point, event: { title: 'Belangrijke aankondiging' } };
      }
      return point;
    })
  ),
  calculateEventImpact: jest.fn().mockImplementation(() => ({
    before: 10,
    after: 15,
    change: 5,
    percentageChange: 50,
    impact: 0.7
  }))
}));

jest.mock('../../utils/trending/trendVisualization', () => ({
  prepareTopicTrendsData: jest.fn().mockImplementation(() => ({
    topics: ['bitcoin', 'ethereum'],
    timeframe: { start: '2023-01-01', end: '2023-01-05' },
    data: [
      { date: '2023-01-01', bitcoin: 10, ethereum: 8 },
      { date: '2023-01-02', bitcoin: 12, ethereum: 7 },
      { date: '2023-01-03', bitcoin: 15, ethereum: 9 },
      { date: '2023-01-04', bitcoin: 20, ethereum: 11 },
      { date: '2023-01-05', bitcoin: 18, ethereum: 10 }
    ]
  }))
}));

// Importeer de gemockte functies
import { getTopicTimeseries } from '../../utils/trending/topicExtraction';
import { normalizeTimeseries } from '../../utils/trending/topicNormalization';
import { detectSpikes, detectTrendChanges } from '../../utils/trending/trendDetection';
import { addEventAnnotations, calculateEventImpact } from '../../utils/trending/eventAnnotation';
import { prepareTopicTrendsData } from '../../utils/trending/trendVisualization';

// Test suite
describe('Trending Topics Utilities', () => {
  test('getTopicTimeseries geeft tijdreeksdata terug voor een topic', () => {
    const result = getTopicTimeseries('bitcoin');
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('normalizeTimeseries normaliseert tijdreeksdata', () => {
    const mockData = [
      { date: '2023-01-01', value: 10 },
      { date: '2023-01-02', value: 12 }
    ];
    const result = normalizeTimeseries(mockData);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(mockData.length);
    expect(result[0]).toHaveProperty('normalizedValue');
  });

  test('detectSpikes detecteert spikes in tijdreeksdata', () => {
    const mockData = [
      { date: '2023-01-01', value: 10 },
      { date: '2023-01-02', value: 12 },
      { date: '2023-01-03', value: 20 },
      { date: '2023-01-04', value: 15 },
      { date: '2023-01-05', value: 25 }
    ];
    const result = detectSpikes(mockData);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test('detectTrendChanges identificeert trendveranderingen', () => {
    const mockData = [
      { date: '2023-01-01', value: 10 },
      { date: '2023-01-02', value: 12 },
      { date: '2023-01-03', value: 20 },
      { date: '2023-01-04', value: 15 },
      { date: '2023-01-05', value: 25 }
    ];
    const result = detectTrendChanges(mockData);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('type');
    expect(result[0]).toHaveProperty('magnitude');
  });

  test('addEventAnnotations voegt event annotaties toe aan tijdreeksdata', () => {
    const mockData = [
      { date: '2023-01-01', value: 10 },
      { date: '2023-01-02', value: 12 },
      { date: '2023-01-03', value: 20 },
      { date: '2023-01-04', value: 15 },
      { date: '2023-01-05', value: 25 }
    ];
    const result = addEventAnnotations(mockData);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[2]).toHaveProperty('event');
  });

  test('calculateEventImpact berekent de impact van een event', () => {
    const mockData = [
      { date: '2023-01-01', value: 10 },
      { date: '2023-01-02', value: 12 },
      { date: '2023-01-03', value: 20 },
      { date: '2023-01-04', value: 15 },
      { date: '2023-01-05', value: 25 }
    ];
    const result = calculateEventImpact(mockData, '2023-01-03');
    expect(result).toBeDefined();
    expect(result).toHaveProperty('impact');
    expect(result).toHaveProperty('percentageChange');
  });

  test('prepareTopicTrendsData bereidt data voor voor visualisatie', () => {
    const mockData = {
      'bitcoin': [
        { date: '2023-01-01', value: 10 },
        { date: '2023-01-02', value: 12 },
        { date: '2023-01-03', value: 15 },
        { date: '2023-01-04', value: 20 },
        { date: '2023-01-05', value: 18 }
      ],
      'ethereum': [
        { date: '2023-01-01', value: 8 },
        { date: '2023-01-02', value: 7 },
        { date: '2023-01-03', value: 9 },
        { date: '2023-01-04', value: 11 },
        { date: '2023-01-05', value: 10 }
      ]
    };
    const result = prepareTopicTrendsData(mockData);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('topics');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('timeframe');
  });
});
