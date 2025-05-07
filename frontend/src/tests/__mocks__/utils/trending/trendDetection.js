/**
 * Mock voor trendDetection.js
 * Bevat mock implementaties van de functies in trendDetection.js
 */

// Mock functie voor het detecteren van spikes in tijdreeksdata
export const detectSpikes = jest.fn().mockImplementation((timeseriesData, options = {}) => {
  // Retourneer indices van gesimuleerde spikes
  return [2, 4]; // Indices van gesimuleerde spikes
});

// Mock functie voor het detecteren van dips in tijdreeksdata
export const detectDips = jest.fn().mockImplementation((timeseriesData, options = {}) => {
  // Retourneer indices van gesimuleerde dips
  return [1, 3]; // Indices van gesimuleerde dips
});

// Mock functie voor het identificeren van trendveranderingen
export const detectTrendChanges = jest.fn().mockImplementation((timeseriesData, options = {}) => {
  // Retourneer gesimuleerde trendveranderingen
  return [
    { index: 2, type: 'upward', magnitude: 0.3 },
    { index: 4, type: 'downward', magnitude: 0.2 }
  ];
});

// Mock functie voor het analyseren van opkomende topics
export const identifyEmergingTopics = jest.fn().mockImplementation((topicsData, timeframe = {}) => {
  // Retourneer gesimuleerde opkomende topics
  return [
    { topic: 'bitcoin', growthRate: 0.25, confidence: 0.8 },
    { topic: 'nft', growthRate: 0.35, confidence: 0.7 }
  ];
});

// Mock functie voor het analyseren van afnemende topics
export const identifyDecliningTopics = jest.fn().mockImplementation((topicsData, timeframe = {}) => {
  // Retourneer gesimuleerde afnemende topics
  return [
    { topic: 'altcoin', declineRate: 0.15, confidence: 0.6 },
    { topic: 'ico', declineRate: 0.25, confidence: 0.7 }
  ];
});

// Mock functie voor het berekenen van topic volatiliteit
export const calculateTopicVolatility = jest.fn().mockImplementation((timeseriesData) => {
  // Retourneer gesimuleerde volatiliteit score
  return 0.42; // Gesimuleerde volatiliteit score tussen 0 en 1
});
