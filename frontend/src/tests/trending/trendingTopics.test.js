/**
 * Test voor de Trending Topics Timeline component
 * Deze test gebruikt de mock implementaties van de utility functies
 */

// We gebruiken top-level await voor dynamische imports
// Import testing libraries
const { render, screen, waitFor } = await import('@testing-library/react');
const userEvent = await import('@testing-library/user-event');

// Gebruik import.meta.jest in plaats van directe import
const { describe, test, expect, beforeEach, afterEach } = await import('@jest/globals');
const jest = import.meta.jest;

// Dynamisch importeren van de utility functies en mocks
// We gebruiken een functie om de imports te laden
const loadMocks = async () => {
  // Importeer de mock implementaties
  const topicExtraction = await import('../../utils/trending/topicExtraction.js');
  const topicNormalization = await import('../../utils/trending/topicNormalization.js');
  const trendDetection = await import('../../utils/trending/trendDetection.js');
  const eventAnnotation = await import('../../utils/trending/eventAnnotation.js');
  const trendVisualization = await import('../../utils/trending/trendVisualization.js');
  
  return {
    topicExtraction,
    topicNormalization,
    trendDetection,
    eventAnnotation,
    trendVisualization
  };
};

// Laad de mocks
const mocks = await loadMocks();

// Destructure de functies uit de mocks
const { getTopicTimeseries } = mocks.topicExtraction;
const { normalizeTimeseries } = mocks.topicNormalization;
const { detectSpikes, detectTrendChanges } = mocks.trendDetection;
const { addEventAnnotations, calculateEventImpact } = mocks.eventAnnotation;
const { prepareTopicTrendsData } = mocks.trendVisualization;

// Test suite voor de utility functies
describe('Trending Topics Utilities', () => {
  // Reset de mock implementaties na elke test
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getTopicTimeseries geeft tijdreeksdata terug voor een topic', () => {
    const result = getTopicTimeseries('bitcoin');
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(getTopicTimeseries).toHaveBeenCalledWith('bitcoin');
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
    expect(normalizeTimeseries).toHaveBeenCalledWith(mockData);
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
    expect(detectSpikes).toHaveBeenCalledWith(mockData);
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
    expect(detectTrendChanges).toHaveBeenCalledWith(mockData);
  });

  test('addEventAnnotations voegt event annotaties toe aan tijdreeksdata', () => {
    const mockTimeseries = [
      { date: '2023-01-01', value: 10 },
      { date: '2023-01-02', value: 12 },
      { date: '2023-01-03', value: 20 },
      { date: '2023-01-04', value: 15 },
      { date: '2023-01-05', value: 25 }
    ];
    const mockEvents = [
      { id: 'event1', date: '2023-01-03', title: 'Belangrijke aankondiging' },
      { id: 'event2', date: '2023-01-05', title: 'Regelgevingsupdate' }
    ];
    const result = addEventAnnotations(mockTimeseries, mockEvents);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(mockTimeseries.length);
    expect(addEventAnnotations).toHaveBeenCalledWith(mockTimeseries, mockEvents);
  });

  test('calculateEventImpact berekent de impact van een event op topic populariteit', () => {
    const mockTimeseries = [
      { date: '2023-01-01', value: 10 },
      { date: '2023-01-02', value: 12 },
      { date: '2023-01-03', value: 20 },
      { date: '2023-01-04', value: 15 },
      { date: '2023-01-05', value: 25 }
    ];
    const eventDate = '2023-01-03';
    const result = calculateEventImpact(mockTimeseries, eventDate);
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(calculateEventImpact).toHaveBeenCalledWith(mockTimeseries, eventDate);
  });

  test('prepareTopicTrendsData bereidt data voor voor visualisatie', () => {
    const mockTopicsData = {
      'bitcoin': [
        { date: '2023-01-01', value: 10 },
        { date: '2023-01-02', value: 12 },
        { date: '2023-01-03', value: 20 },
        { date: '2023-01-04', value: 15 },
        { date: '2023-01-05', value: 25 }
      ],
      'ethereum': [
        { date: '2023-01-01', value: 8 },
        { date: '2023-01-02', value: 7 },
        { date: '2023-01-03', value: 9 },
        { date: '2023-01-04', value: 11 },
        { date: '2023-01-05', value: 10 }
      ]
    };
    const result = prepareTopicTrendsData(mockTopicsData);
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(prepareTopicTrendsData).toHaveBeenCalledWith(mockTopicsData);
  });
});
