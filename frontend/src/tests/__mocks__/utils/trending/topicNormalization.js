/**
 * Mock voor topicNormalization.js
 * Bevat mock implementaties van de functies in topicNormalization.js
 */

// Mock functie voor het normaliseren van tijdreeksdata
export const normalizeTimeseries = jest.fn().mockImplementation((timeseriesData, options = {}) => {
  // Retourneer een genormaliseerde versie van de input data
  return timeseriesData.map(dataPoint => ({
    ...dataPoint,
    value: dataPoint.value / 20, // Eenvoudige normalisatie door te delen door 20
    normalizedValue: dataPoint.value / 20
  }));
});

// Mock functie voor Z-score normalisatie
export const zScoreNormalization = jest.fn().mockImplementation((timeseriesData) => {
  // Retourneer een Z-score genormaliseerde versie van de input data
  return timeseriesData.map(dataPoint => ({
    ...dataPoint,
    value: (dataPoint.value - 10) / 5, // Eenvoudige Z-score normalisatie
    zScore: (dataPoint.value - 10) / 5
  }));
});

// Mock functie voor baseline vergelijking
export const baselineComparison = jest.fn().mockImplementation((timeseriesData, baseline) => {
  // Retourneer een baseline vergelijking van de input data
  return timeseriesData.map(dataPoint => ({
    ...dataPoint,
    value: dataPoint.value / baseline, // Eenvoudige baseline vergelijking
    relativeChange: dataPoint.value / baseline - 1
  }));
});

// Mock functie voor cross-platform relevantie berekening
export const calculateCrossPlatformRelevance = jest.fn().mockImplementation((topic, platforms) => {
  // Retourneer een mock cross-platform relevantie score
  return {
    topic,
    relevanceScores: {
      twitter: 0.8,
      reddit: 0.7,
      news: 0.6,
      overall: 0.75
    }
  };
});
