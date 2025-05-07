/**
 * Basis test voor trending topics utilities
 * Deze test controleert of de Jest configuratie correct werkt met ES modules
 */

import { describe, test, expect, jest } from '@jest/globals';

// Import de utility functies die we willen testen
// We gebruiken dynamic imports om problemen met ES modules te vermijden
const importUtilities = async () => {
  try {
    // Importeer de utility functies
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
  } catch (error) {
    console.error('Error importing utilities:', error);
    return null;
  }
};

// Basis test om te controleren of de imports werken
describe('Trending Topics Utilities - Basic Test', () => {
  test('Utilities kunnen worden geïmporteerd', async () => {
    const utils = await importUtilities();
    expect(utils).not.toBeNull();
  });
  
  test('Topic Extractie functies zijn beschikbaar', async () => {
    const utils = await importUtilities();
    // Controleer of de getTopicTimeseries functie bestaat
    expect(typeof utils.topicExtraction.getTopicTimeseries).toBe('function');
  });
  
  test('Topic Normalisatie functies zijn beschikbaar', async () => {
    const utils = await importUtilities();
    // Controleer of de normalizeTimeseries functie bestaat
    expect(typeof utils.topicNormalization.normalizeTimeseries).toBe('function');
  });
  
  test('Trend Detectie functies zijn beschikbaar', async () => {
    const utils = await importUtilities();
    // Controleer of de detectSpikes functie bestaat
    expect(typeof utils.trendDetection.detectSpikes).toBe('function');
    // Controleer of de detectTrendChanges functie bestaat
    expect(typeof utils.trendDetection.detectTrendChanges).toBe('function');
  });
  
  test('Event Annotatie functies zijn beschikbaar', async () => {
    const utils = await importUtilities();
    // Controleer of de addEventAnnotations functie bestaat
    expect(typeof utils.eventAnnotation.addEventAnnotations).toBe('function');
    // Controleer of de calculateEventImpact functie bestaat
    expect(typeof utils.eventAnnotation.calculateEventImpact).toBe('function');
  });
  
  test('Trend Visualisatie functies zijn beschikbaar', async () => {
    const utils = await importUtilities();
    // Controleer of de prepareTopicTrendsData functie bestaat
    expect(typeof utils.trendVisualization.prepareTopicTrendsData).toBe('function');
  });
});
