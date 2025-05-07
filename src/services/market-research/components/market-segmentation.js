/**
 * Market Segmentation
 *
 * Deze component is verantwoordelijk voor het segmenteren van de markt
 * op basis van demografische en psychografische gegevens.
 */

/**
 * Market Segmentation klasse
 */
class MarketSegmentation {
  constructor() {
    // Standaard segmentatiecriteria
    this.demographicCriteria = [
      'age', 'gender', 'income', 'education', 'occupation',
      'location', 'urbanicity', 'familySize', 'maritalStatus',
    ];

    this.psychographicCriteria = [
      'interests', 'activities', 'opinions', 'attitudes', 'values',
      'lifestyle', 'personality', 'socialClass', 'buyingBehavior',
    ];

    // Standaard segmentclusteringdrempels
    this.clusteringThresholds = {
      minClusterSize: 0.05, // Minimaal 5% van de totale markt
      maxClusterCount: 8, // Maximaal 8 segmenten
      similarityThreshold: 0.7, // Minimale gelijkenis voor clustering
    };
  }

  /**
   * Segmenteer de markt op basis van demografische en psychografische gegevens
   * @param {Object} demographicData - Demografische gegevens
   * @param {Object} psychographicData - Psychografische gegevens
   * @param {Object} options - Segmentatieopties
   * @returns {Promise<Object>} - Marktsegmentatie resultaten
   */
  async segment(demographicData, psychographicData, options = {}) {
    try {
      // Valideer input
      if (!demographicData && !psychographicData) {
        console.warn('⚠️ Market segmentation: Ongeldige segmentatiegegevens ontvangen');
        return {
          segments: [],
          demographic: {},
          psychographic: {},
          coverage: 0,
          confidence: 0,
          method: 'none',
          error: 'Ongeldige segmentatiegegevens',
        };
      }

      // Bepaal de segmentatiemethode op basis van beschikbare gegevens
      const method = this.determineSegmentationMethod(demographicData, psychographicData);

      // Voer segmentatie uit op basis van de gekozen methode
      let result;
      switch (method) {
        case 'demographic':
          result = this.segmentDemographic(demographicData, options);
          break;
        case 'psychographic':
          result = this.segmentPsychographic(psychographicData, options);
          break;
        case 'hybrid':
          result = this.segmentHybrid(demographicData, psychographicData, options);
          break;
        default:
          result = this.segmentBasic(demographicData || psychographicData, options);
      }

      // Bereken de marktdekking
      result.coverage = this.calculateCoverage(result.segments);

      return result;
    } catch (error) {
      console.error('❌ Fout bij marktsegmentatie:', error);
      return {
        segments: [],
        demographic: {},
        psychographic: {},
        coverage: 0,
        confidence: 0,
        method: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Bepaal de beste segmentatiemethode op basis van beschikbare gegevens
   * @param {Object} demographicData - Demografische gegevens
   * @param {Object} psychographicData - Psychografische gegevens
   * @returns {String} - Segmentatiemethode
   */
  determineSegmentationMethod(demographicData, psychographicData) {
    // Hybrid methode vereist zowel demografische als psychografische gegevens
    if (demographicData && psychographicData) {
      return 'hybrid';
    }

    // Demografische methode vereist demografische gegevens
    if (demographicData) {
      return 'demographic';
    }

    // Psychografische methode vereist psychografische gegevens
    if (psychographicData) {
      return 'psychographic';
    }

    // Basis methode als fallback
    return 'basic';
  }

  /**
   * Segmenteer de markt op basis van demografische gegevens
   * @param {Object} demographicData - Demografische gegevens
   * @param {Object} options - Segmentatieopties
   * @returns {Object} - Segmentatieresultaten
   */
  segmentDemographic(demographicData, options = {}) {
    // Identificeer relevante demografische criteria
    const relevantCriteria = this.identifyRelevantCriteria(
      demographicData,
      this.demographicCriteria,
    );

    // Genereer segmenten op basis van relevante criteria
    const segments = this.generateSegments(
      demographicData,
      relevantCriteria,
      options,
    );

    // Bereken de grootte van elk segment
    const segmentsWithSize = this.calculateSegmentSizes(segments, demographicData);

    return {
      segments: segmentsWithSize,
      demographic: this.summarizeDemographicData(demographicData, relevantCriteria),
      psychographic: {},
      confidence: 0.7, // Demografische segmentatie heeft goede betrouwbaarheid
      method: 'demographic',
    };
  }

  /**
   * Segmenteer de markt op basis van psychografische gegevens
   * @param {Object} psychographicData - Psychografische gegevens
   * @param {Object} options - Segmentatieopties
   * @returns {Object} - Segmentatieresultaten
   */
  segmentPsychographic(psychographicData, options = {}) {
    // Identificeer relevante psychografische criteria
    const relevantCriteria = this.identifyRelevantCriteria(
      psychographicData,
      this.psychographicCriteria,
    );

    // Genereer segmenten op basis van relevante criteria
    const segments = this.generateSegments(
      psychographicData,
      relevantCriteria,
      options,
    );

    // Bereken de grootte van elk segment
    const segmentsWithSize = this.calculateSegmentSizes(segments, psychographicData);

    return {
      segments: segmentsWithSize,
      demographic: {},
      psychographic: this.summarizePsychographicData(psychographicData, relevantCriteria),
      confidence: 0.65, // Psychografische segmentatie heeft redelijke betrouwbaarheid
      method: 'psychographic',
    };
  }

  /**
   * Segmenteer de markt op basis van zowel demografische als psychografische gegevens
   * @param {Object} demographicData - Demografische gegevens
   * @param {Object} psychographicData - Psychografische gegevens
   * @param {Object} options - Segmentatieopties
   * @returns {Object} - Segmentatieresultaten
   */
  segmentHybrid(demographicData, psychographicData, options = {}) {
    // Identificeer relevante demografische criteria
    const relevantDemographicCriteria = this.identifyRelevantCriteria(
      demographicData,
      this.demographicCriteria,
    );

    // Identificeer relevante psychografische criteria
    const relevantPsychographicCriteria = this.identifyRelevantCriteria(
      psychographicData,
      this.psychographicCriteria,
    );

    // Combineer de gegevens
    const combinedData = this.combineData(demographicData, psychographicData);
    const combinedCriteria = [...relevantDemographicCriteria, ...relevantPsychographicCriteria];

    // Genereer segmenten op basis van gecombineerde criteria
    const segments = this.generateSegments(
      combinedData,
      combinedCriteria,
      options,
    );

    // Bereken de grootte van elk segment
    const segmentsWithSize = this.calculateSegmentSizes(segments, combinedData);

    return {
      segments: segmentsWithSize,
      demographic: this.summarizeDemographicData(demographicData, relevantDemographicCriteria),
      psychographic: this.summarizePsychographicData(psychographicData, relevantPsychographicCriteria),
      confidence: 0.85, // Hybride segmentatie heeft hoge betrouwbaarheid
      method: 'hybrid',
    };
  }

  /**
   * Segmenteer de markt met een basis methode
   * @param {Object} data - Beschikbare gegevens
   * @param {Object} options - Segmentatieopties
   * @returns {Object} - Segmentatieresultaten
   */
  segmentBasic(data, options = {}) {
    // Identificeer alle beschikbare criteria
    const allCriteria = [...this.demographicCriteria, ...this.psychographicCriteria];
    const relevantCriteria = this.identifyRelevantCriteria(data, allCriteria);

    // Genereer eenvoudige segmenten
    const segments = this.generateBasicSegments(data, relevantCriteria);

    // Bereken de grootte van elk segment
    const segmentsWithSize = this.calculateSegmentSizes(segments, data);

    return {
      segments: segmentsWithSize,
      demographic: {},
      psychographic: {},
      confidence: 0.4, // Basis segmentatie heeft lage betrouwbaarheid
      method: 'basic',
    };
  }

  /**
   * Identificeer relevante criteria in de gegevens
   * @param {Object} data - Gegevens om te analyseren
   * @param {Array<String>} allCriteria - Alle mogelijke criteria
   * @returns {Array<String>} - Relevante criteria
   */
  identifyRelevantCriteria(data, allCriteria) {
    const relevantCriteria = [];

    // Controleer welke criteria aanwezig zijn in de gegevens
    for (const criterion of allCriteria) {
      if (data[criterion]
          || (data.distributions && data.distributions[criterion])
          || (data.segments && Object.values(data.segments).some((segment) => segment[criterion]))) {
        relevantCriteria.push(criterion);
      }
    }

    return relevantCriteria;
  }

  /**
   * Genereer segmenten op basis van criteria
   * @param {Object} data - Gegevens om te segmenteren
   * @param {Array<String>} criteria - Criteria om te gebruiken
   * @param {Object} options - Segmentatieopties
   * @returns {Array<Object>} - Gegenereerde segmenten
   */
  generateSegments(data, criteria, options = {}) {
    const segments = [];

    // Als er al segmenten zijn gedefinieerd, gebruik deze
    if (data.segments && Object.keys(data.segments).length > 0) {
      for (const [name, segment] of Object.entries(data.segments)) {
        segments.push({
          name,
          criteria: this.extractSegmentCriteria(segment, criteria),
          ...segment,
        });
      }
      return segments;
    }

    // Als er distributies zijn, gebruik deze om segmenten te genereren
    if (data.distributions) {
      return this.generateSegmentsFromDistributions(data.distributions, criteria, options);
    }

    // Als er geen segmenten of distributies zijn, genereer basis segmenten
    return this.generateBasicSegments(data, criteria);
  }

  /**
   * Extraheer criteria voor een segment
   * @param {Object} segment - Segment om te analyseren
   * @param {Array<String>} allCriteria - Alle mogelijke criteria
   * @returns {Object} - Geëxtraheerde criteria
   */
  extractSegmentCriteria(segment, allCriteria) {
    const extractedCriteria = {};

    for (const criterion of allCriteria) {
      if (segment[criterion]) {
        extractedCriteria[criterion] = segment[criterion];
      }
    }

    return extractedCriteria;
  }

  /**
   * Genereer segmenten op basis van distributies
   * @param {Object} distributions - Distributiegegevens
   * @param {Array<String>} criteria - Criteria om te gebruiken
   * @param {Object} options - Segmentatieopties
   * @returns {Array<Object>} - Gegenereerde segmenten
   */
  generateSegmentsFromDistributions(distributions, criteria, options = {}) {
    const segments = [];
    const maxSegments = options.maxSegments || this.clusteringThresholds.maxClusterCount;

    // Kies de belangrijkste criteria voor segmentatie
    const primaryCriteria = criteria.slice(0, 3); // Gebruik maximaal 3 criteria

    // Genereer segmenten voor elke combinatie van primaire criteria
    for (const criterion of primaryCriteria) {
      if (!distributions[criterion]) continue;

      const distribution = distributions[criterion];

      // Voor elk belangrijk segment in de distributie
      for (const [value, share] of Object.entries(distribution)) {
        // Skip kleine segmenten
        if (share < this.clusteringThresholds.minClusterSize) continue;

        // Maak een nieuw segment
        const segment = {
          name: `${criterion.charAt(0).toUpperCase() + criterion.slice(1)}: ${value}`,
          criteria: { [criterion]: value },
          share,
          description: `Segment gebaseerd op ${criterion}: ${value}`,
        };

        segments.push(segment);

        // Stop als we het maximale aantal segmenten hebben bereikt
        if (segments.length >= maxSegments) break;
      }

      // Stop als we het maximale aantal segmenten hebben bereikt
      if (segments.length >= maxSegments) break;
    }

    return segments;
  }

  /**
   * Genereer basis segmenten
   * @param {Object} data - Gegevens om te segmenteren
   * @param {Array<String>} criteria - Criteria om te gebruiken
   * @returns {Array<Object>} - Gegenereerde segmenten
   */
  generateBasicSegments(data, criteria) {
    // Als er geen criteria zijn, maak een enkel segment
    if (criteria.length === 0) {
      return [{
        name: 'Algemeen segment',
        criteria: {},
        share: 1.0,
        description: 'Algemeen marktsegment zonder specifieke criteria',
      }];
    }

    // Maak eenvoudige segmenten op basis van het eerste criterium
    const segments = [];
    const primaryCriterion = criteria[0];

    // Maak standaard segmenten op basis van het type criterium
    switch (primaryCriterion) {
      case 'age':
        segments.push(
          {
            name: 'Jongeren', criteria: { age: '18-24' }, share: 0.2, description: 'Jongeren tussen 18 en 24 jaar',
          },
          {
            name: 'Jongvolwassenen', criteria: { age: '25-34' }, share: 0.25, description: 'Jongvolwassenen tussen 25 en 34 jaar',
          },
          {
            name: 'Volwassenen', criteria: { age: '35-54' }, share: 0.35, description: 'Volwassenen tussen 35 en 54 jaar',
          },
          {
            name: 'Senioren', criteria: { age: '55+' }, share: 0.2, description: 'Senioren van 55 jaar en ouder',
          },
        );
        break;
      case 'income':
        segments.push(
          {
            name: 'Laag inkomen', criteria: { income: 'low' }, share: 0.3, description: 'Consumenten met een laag inkomen',
          },
          {
            name: 'Gemiddeld inkomen', criteria: { income: 'medium' }, share: 0.5, description: 'Consumenten met een gemiddeld inkomen',
          },
          {
            name: 'Hoog inkomen', criteria: { income: 'high' }, share: 0.2, description: 'Consumenten met een hoog inkomen',
          },
        );
        break;
      case 'gender':
        segments.push(
          {
            name: 'Mannen', criteria: { gender: 'male' }, share: 0.5, description: 'Mannelijke consumenten',
          },
          {
            name: 'Vrouwen', criteria: { gender: 'female' }, share: 0.5, description: 'Vrouwelijke consumenten',
          },
        );
        break;
      case 'location':
        segments.push(
          {
            name: 'Stedelijk', criteria: { location: 'urban' }, share: 0.6, description: 'Consumenten in stedelijke gebieden',
          },
          {
            name: 'Voorstedelijk', criteria: { location: 'suburban' }, share: 0.3, description: 'Consumenten in voorstedelijke gebieden',
          },
          {
            name: 'Landelijk', criteria: { location: 'rural' }, share: 0.1, description: 'Consumenten in landelijke gebieden',
          },
        );
        break;
      case 'lifestyle':
        segments.push(
          {
            name: 'Traditioneel', criteria: { lifestyle: 'traditional' }, share: 0.3, description: 'Consumenten met een traditionele levensstijl',
          },
          {
            name: 'Modern', criteria: { lifestyle: 'modern' }, share: 0.4, description: 'Consumenten met een moderne levensstijl',
          },
          {
            name: 'Avontuurlijk', criteria: { lifestyle: 'adventurous' }, share: 0.3, description: 'Consumenten met een avontuurlijke levensstijl',
          },
        );
        break;
      default:
        segments.push(
          {
            name: 'Segment A', criteria: {}, share: 0.4, description: 'Algemeen marktsegment A',
          },
          {
            name: 'Segment B', criteria: {}, share: 0.3, description: 'Algemeen marktsegment B',
          },
          {
            name: 'Segment C', criteria: {}, share: 0.3, description: 'Algemeen marktsegment C',
          },
        );
    }

    return segments;
  }

  /**
   * Bereken de grootte van elk segment
   * @param {Array<Object>} segments - Segmenten om te berekenen
   * @param {Object} data - Gegevens voor berekening
   * @returns {Array<Object>} - Segmenten met grootte
   */
  calculateSegmentSizes(segments, data) {
    // Als de segmenten al een share hebben, gebruik deze
    if (segments.every((segment) => segment.share)) {
      return segments.map((segment) => ({
        ...segment,
        size: segment.share,
        potentialValue: segment.share * (data.totalMarketValue || 1000000), // Standaard marktwaarde als niet gespecificeerd
      }));
    }

    // Als er geen shares zijn, bereken deze op basis van criteria
    const totalSize = segments.reduce((sum, segment) => sum + (segment.size || 1), 0);

    return segments.map((segment) => ({
      ...segment,
      share: (segment.size || 1) / totalSize,
      potentialValue: (segment.size || 1) / totalSize * (data.totalMarketValue || 1000000),
    }));
  }

  /**
   * Combineer demografische en psychografische gegevens
   * @param {Object} demographicData - Demografische gegevens
   * @param {Object} psychographicData - Psychografische gegevens
   * @returns {Object} - Gecombineerde gegevens
   */
  combineData(demographicData, psychographicData) {
    return {
      ...demographicData,
      ...psychographicData,
      distributions: {
        ...(demographicData.distributions || {}),
        ...(psychographicData.distributions || {}),
      },
      segments: {
        ...(demographicData.segments || {}),
        ...(psychographicData.segments || {}),
      },
    };
  }

  /**
   * Bereken de marktdekking van de segmenten
   * @param {Array<Object>} segments - Segmenten om te berekenen
   * @returns {Number} - Marktdekking (0-1)
   */
  calculateCoverage(segments) {
    // Bereken de totale marktdekking
    const totalShare = segments.reduce((sum, segment) => sum + (segment.share || 0), 0);

    // Normaliseer naar 0-1
    return Math.min(totalShare, 1);
  }

  /**
   * Maak een samenvatting van demografische gegevens
   * @param {Object} demographicData - Demografische gegevens
   * @param {Array<String>} relevantCriteria - Relevante criteria
   * @returns {Object} - Samenvatting
   */
  summarizeDemographicData(demographicData, relevantCriteria) {
    const summary = {};

    // Voeg relevante criteria toe aan de samenvatting
    for (const criterion of relevantCriteria) {
      if (demographicData.distributions && demographicData.distributions[criterion]) {
        summary[criterion] = demographicData.distributions[criterion];
      } else if (demographicData[criterion]) {
        summary[criterion] = demographicData[criterion];
      }
    }

    return summary;
  }

  /**
   * Maak een samenvatting van psychografische gegevens
   * @param {Object} psychographicData - Psychografische gegevens
   * @param {Array<String>} relevantCriteria - Relevante criteria
   * @returns {Object} - Samenvatting
   */
  summarizePsychographicData(psychographicData, relevantCriteria) {
    const summary = {};

    // Voeg relevante criteria toe aan de samenvatting
    for (const criterion of relevantCriteria) {
      if (psychographicData.distributions && psychographicData.distributions[criterion]) {
        summary[criterion] = psychographicData.distributions[criterion];
      } else if (psychographicData[criterion]) {
        summary[criterion] = psychographicData[criterion];
      }
    }

    return summary;
  }
}

module.exports = {
  MarketSegmentation,
};
