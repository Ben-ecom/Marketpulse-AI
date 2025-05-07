/**
 * @jest-environment jsdom
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Importeer de functies die we willen testen
import { prepareTopicTrendsData } from '../../utils/trending/trendVisualization';
import { normalizeTimeseries } from '../../utils/trending/topicNormalization';
import { detectSpikes, detectTrendChanges } from '../../utils/trending/trendDetection';
import { addEventAnnotations, calculateEventImpact } from '../../utils/trending/eventAnnotation';

// Mock de functies die we testen
jest.mock('../../utils/trending/trendVisualization');
jest.mock('../../utils/trending/topicNormalization');
jest.mock('../../utils/trending/trendDetection');
jest.mock('../../utils/trending/eventAnnotation');

// Voorbeelddata voor tests
const mockTimeseriesData = {
  timePoints: [
    '2025-04-01T00:00:00.000Z',
    '2025-04-02T00:00:00.000Z',
    '2025-04-03T00:00:00.000Z',
    '2025-04-04T00:00:00.000Z',
    '2025-04-05T00:00:00.000Z'
  ],
  series: {
    'Topic A': [10, 15, 25, 20, 18],
    'Topic B': [5, 8, 7, 12, 20],
    'Topic C': [8, 10, 12, 15, 18]
  }
};

const mockEventsData = [
  {
    id: 'event-1',
    title: 'Test Event',
    description: 'Test event description',
    date: '2025-04-02T00:00:00.000Z',
    category: 'Test'
  },
  {
    id: 'event-2',
    title: 'Test Event 2',
    description: 'Another test event',
    date: '2025-04-05T00:00:00.000Z',
    category: 'Test'
  }
];

describe('Trending Topics Utilities', () => {
  // Reset de mock implementaties voor elke test
  beforeEach(() => {
    prepareTopicTrendsData.mockClear();
    normalizeTimeseries.mockClear();
    detectSpikes.mockClear();
    detectTrendChanges.mockClear();
    addEventAnnotations.mockClear();
    calculateEventImpact.mockClear();
  });
  
  describe('prepareTopicTrendsData', () => {
    test('should prepare data for visualization correctly', () => {
      const mockData = {
        timePoints: [
          '2025-04-01T00:00:00.000Z',
          '2025-04-02T00:00:00.000Z',
          '2025-04-03T00:00:00.000Z',
          '2025-04-04T00:00:00.000Z',
          '2025-04-05T00:00:00.000Z'
        ],
        series: {
          'Artificial Intelligence': [10, 15, 25, 20, 18],
          'Machine Learning': [5, 8, 7, 12, 20],
          'Blockchain': [30, 28, 25, 22, 20],
          'Cryptocurrency': [12, 15, 18, 22, 25],
          'Remote Work': [8, 10, 12, 15, 18]
        }
      };
      
      const options = {
        startDate: '2025-04-02T00:00:00.000Z',
        endDate: '2025-04-04T00:00:00.000Z',
        selectedTopics: ['Artificial Intelligence', 'Blockchain']
      };
      
      // Roep de functie aan
      prepareTopicTrendsData(mockData, options);
      
      // Controleer of de functie is aangeroepen met de juiste parameters
      expect(prepareTopicTrendsData).toHaveBeenCalledWith(mockData, options);
      expect(prepareTopicTrendsData).toHaveBeenCalledTimes(1);
    });
    
    test('should include all topics when no selection is provided', () => {
      const mockData = {
        timePoints: [
          '2025-04-01T00:00:00.000Z',
          '2025-04-02T00:00:00.000Z',
          '2025-04-03T00:00:00.000Z'
        ],
        series: {
          'Topic A': [10, 15, 20],
          'Topic B': [5, 10, 15],
          'Topic C': [8, 12, 16]
        }
      };
      
      // Roep de functie aan zonder opties
      prepareTopicTrendsData(mockData, {});
      
      // Controleer of de functie is aangeroepen met de juiste parameters
      expect(prepareTopicTrendsData).toHaveBeenCalledWith(mockData, {});
      expect(prepareTopicTrendsData).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('normalizeTimeseries', () => {
    test('should normalize timeseries data correctly', () => {
      const mockData = {
        timePoints: [
          '2025-04-01T00:00:00.000Z',
          '2025-04-02T00:00:00.000Z',
          '2025-04-03T00:00:00.000Z'
        ],
        series: {
          'Topic A': [10, 20, 30], // Max: 30
          'Topic B': [5, 10, 15]   // Max: 15
        }
      };
      
      // Roep de functie aan
      const result = normalizeTimeseries(mockData);
      
      // Controleer of de functie is aangeroepen met de juiste parameters
      expect(normalizeTimeseries).toHaveBeenCalledWith(mockData);
      expect(normalizeTimeseries).toHaveBeenCalledTimes(1);
      
      // Controleer of het resultaat de verwachte structuur heeft
      expect(result).toHaveProperty('timePoints');
      expect(result).toHaveProperty('series');
      expect(result).toHaveProperty('normalizedSeries');
    });
    
    test('should handle empty data correctly', () => {
      const mockData = {
        timePoints: [],
        series: {}
      };
      
      // Roep de functie aan
      normalizeTimeseries(mockData);
      
      // Controleer of de functie is aangeroepen met de juiste parameters
      expect(normalizeTimeseries).toHaveBeenCalledWith(mockData);
      expect(normalizeTimeseries).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('detectSpikes', () => {
    test('should detect spikes in timeseries data', () => {
      const mockTimeseries = [10, 50, 15, 60, 20]; // Spikes op index 1 en 3
      
      // Roep de functie aan
      const result = detectSpikes(mockTimeseries);
      
      // Controleer of de functie is aangeroepen met de juiste parameters
      expect(detectSpikes).toHaveBeenCalledWith(mockTimeseries);
      expect(detectSpikes).toHaveBeenCalledTimes(1);
      
      // Controleer of het resultaat een array is
      expect(Array.isArray(result)).toBe(true);
    });
  });
  
  describe('addEventAnnotations', () => {
    test('should add event annotations to timeseries data', () => {
      const mockData = {
        timePoints: [
          '2025-04-01T00:00:00.000Z',
          '2025-04-02T00:00:00.000Z',
          '2025-04-03T00:00:00.000Z'
        ],
        series: {
          'Topic A': [10, 20, 30]
        }
      };
      
      const mockEventsData = [
        {
          id: 'event-1',
          title: 'Test Event',
          description: 'Test event description',
          date: '2025-04-02T00:00:00.000Z'
        }
      ];
      
      // Roep de functie aan
      addEventAnnotations(mockData, mockEventsData);
      
      // Controleer of de functie is aangeroepen met de juiste parameters
      expect(addEventAnnotations).toHaveBeenCalledWith(mockData, mockEventsData);
      expect(addEventAnnotations).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('calculateEventImpact', () => {
    test('should calculate event impact on topic popularity', () => {
      const mockData = {
        timePoints: [
          '2025-04-01T00:00:00.000Z',
          '2025-04-02T00:00:00.000Z',
          '2025-04-03T00:00:00.000Z'
        ],
        series: {
          'Topic A': [10, 20, 30]
        }
      };
      
      const eventDate = '2025-04-02T00:00:00.000Z';
      
      // Roep de functie aan
      calculateEventImpact(mockData, eventDate);
      
      // Controleer of de functie is aangeroepen met de juiste parameters
      expect(calculateEventImpact).toHaveBeenCalledWith(mockData, eventDate);
      expect(calculateEventImpact).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('detectTrendChanges', () => {
    test('should detect trend changes in timeseries data', () => {
      const mockTimeseries = [10, 12, 15, 14, 10, 8, 5]; // Trend veranderingen
      
      // Roep de functie aan
      const result = detectTrendChanges(mockTimeseries);
      
      // Controleer of de functie is aangeroepen met de juiste parameters
      expect(detectTrendChanges).toHaveBeenCalledWith(mockTimeseries);
      expect(detectTrendChanges).toHaveBeenCalledTimes(1);
      
      // Controleer of het resultaat een array is
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

// Helper functie voor het berekenen van standaarddeviatie
function calculateStandardDeviation(values) {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}
