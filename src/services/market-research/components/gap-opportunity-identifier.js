/**
 * Gap Opportunity Identifier
 *
 * Deze component identificeert gaten en kansen in de markt
 * op basis van marktonderzoeksgegevens.
 */

/**
 * Gap Opportunity Identifier klasse
 */
class GapOpportunityIdentifier {
  constructor() {
    // Configuratie voor gap-opportunity identificatie
    this.config = {
      minGapSize: 0.1, // 10% van de markt
      minOpportunityScore: 60, // Minimale score voor een kans
      opportunityFactors: {
        marketSize: 0.3,
        competitionLevel: 0.3,
        growthRate: 0.2,
        profitMargin: 0.2,
      },
    };
  }

  /**
   * Identificeer gaten en kansen in de markt
   * @param {Object} marketSize - Marktgrootte analyse
   * @param {Object} segmentation - Marktsegmentatie analyse
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @param {Object} options - Identificatie-opties
   * @returns {Promise<Object>} - Geïdentificeerde gaten en kansen
   */
  async identify(marketSize, segmentation, competitorAnalysis, options = {}) {
    try {
      // Valideer input
      if (!marketSize || !segmentation || !competitorAnalysis) {
        console.warn('⚠️ Gap opportunity identification: Ongeldige gegevens ontvangen');
        return {
          gaps: [],
          opportunities: [],
          potentialMarketSize: 0,
          confidence: 0,
          method: 'none',
          error: 'Ongeldige gegevens',
        };
      }

      // Identificeer gaten in de markt
      const gaps = this.identifyMarketGaps(
        marketSize,
        segmentation,
        competitorAnalysis,
        options,
      );

      // Identificeer kansen
      const opportunities = this.identifyOpportunities(
        gaps,
        marketSize,
        competitorAnalysis,
        options,
      );

      // Bereken potentiële marktgrootte
      const potentialMarketSize = this.calculatePotentialMarketSize(
        gaps,
        marketSize,
      );

      return {
        gaps,
        opportunities,
        potentialMarketSize,
        confidence: this.calculateConfidence(marketSize, segmentation, competitorAnalysis),
        method: this.determineMethod(marketSize, segmentation, competitorAnalysis, options),
      };
    } catch (error) {
      console.error('❌ Fout bij gap-opportunity identificatie:', error);
      return {
        gaps: [],
        opportunities: [],
        potentialMarketSize: 0,
        confidence: 0,
        method: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Identificeer gaten in de markt
   * @param {Object} marketSize - Marktgrootte analyse
   * @param {Object} segmentation - Marktsegmentatie analyse
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @param {Object} options - Identificatie-opties
   * @returns {Array} - Geïdentificeerde gaten
   */
  identifyMarketGaps(marketSize, segmentation, competitorAnalysis, options = {}) {
    const gaps = [];

    // Identificeer gaten op basis van segmentatie
    if (segmentation && segmentation.segments && Array.isArray(segmentation.segments)) {
      segmentation.segments.forEach((segment) => {
        // Controleer of dit segment voldoende is gedekt door concurrenten
        const coverage = this.calculateSegmentCoverage(segment, competitorAnalysis);

        if (coverage < 0.7) { // Minder dan 70% gedekt
          gaps.push({
            type: 'segment',
            name: segment.name,
            description: `Onvoldoende dekking in segment: ${segment.name}`,
            coverage,
            size: segment.size || (segment.percentage * marketSize.totalMarketSize),
            targetCustomers: segment.demographics || segment.description,
            competitorPresence: this.getCompetitorsInSegment(segment, competitorAnalysis),
          });
        }
      });
    }

    // Identificeer gaten op basis van demografische segmentatie
    if (segmentation && segmentation.demographic) {
      Object.entries(segmentation.demographic).forEach(([demographic, data]) => {
        // Controleer of er demografische groepen zijn met lage dekking
        if (Array.isArray(data)) {
          data.forEach((group) => {
            if (group.coverage && group.coverage < 0.6) { // Minder dan 60% gedekt
              gaps.push({
                type: 'demographic',
                name: `${demographic}: ${group.name}`,
                description: `Onvoldoende dekking in demografische groep: ${demographic} - ${group.name}`,
                coverage: group.coverage,
                size: group.size || (group.percentage * marketSize.totalMarketSize),
                targetCustomers: `${demographic}: ${group.name}`,
                competitorPresence: [],
              });
            }
          });
        }
      });
    }

    // Identificeer gaten op basis van psychografische segmentatie
    if (segmentation && segmentation.psychographic) {
      Object.entries(segmentation.psychographic).forEach(([psychographic, data]) => {
        // Controleer of er psychografische groepen zijn met lage dekking
        if (Array.isArray(data)) {
          data.forEach((group) => {
            if (group.coverage && group.coverage < 0.6) { // Minder dan 60% gedekt
              gaps.push({
                type: 'psychographic',
                name: `${psychographic}: ${group.name}`,
                description: `Onvoldoende dekking in psychografische groep: ${psychographic} - ${group.name}`,
                coverage: group.coverage,
                size: group.size || (group.percentage * marketSize.totalMarketSize),
                targetCustomers: `${psychographic}: ${group.name}`,
                competitorPresence: [],
              });
            }
          });
        }
      });
    }

    // Identificeer gaten op basis van concurrentieanalyse
    if (competitorAnalysis && competitorAnalysis.positioning) {
      const { dimensions } = competitorAnalysis.positioning;

      dimensions.forEach((dimension) => {
        // Controleer of er dimensies zijn met lage concurrentie
        const competitorScores = this.getCompetitorScoresForDimension(dimension, competitorAnalysis);

        // Bereken gemiddelde en standaarddeviatie
        if (competitorScores.length > 0) {
          const avg = competitorScores.reduce((sum, score) => sum + score, 0) / competitorScores.length;
          const variance = competitorScores.reduce((sum, score) => sum + (score - avg) ** 2, 0) / competitorScores.length;
          const stdDev = Math.sqrt(variance);

          // Als de standaarddeviatie hoog is, is er mogelijk een gat
          if (stdDev > 15) {
            // Sorteer scores
            const sortedScores = [...competitorScores].sort((a, b) => a - b);

            // Zoek het grootste gat tussen scores
            let maxGap = 0;
            let gapPosition = 0;

            for (let i = 1; i < sortedScores.length; i++) {
              const gap = sortedScores[i] - sortedScores[i - 1];
              if (gap > maxGap) {
                maxGap = gap;
                gapPosition = (sortedScores[i] + sortedScores[i - 1]) / 2;
              }
            }

            // Als het gat groot genoeg is, voeg toe
            if (maxGap > 20) {
              gaps.push({
                type: 'positioning',
                name: `${dimension} gap`,
                description: `Gat in positionering op dimensie: ${dimension} rond score ${gapPosition.toFixed(1)}`,
                size: this.estimateGapSize(maxGap, dimension, marketSize),
                targetCustomers: `Klanten die waarde hechten aan ${dimension} niveau ${gapPosition.toFixed(1)}`,
                competitorPresence: [],
              });
            }
          }
        }
      });
    }

    // Sorteer gaten op grootte
    gaps.sort((a, b) => b.size - a.size);

    return gaps;
  }

  /**
   * Bereken dekking van een segment door concurrenten
   * @param {Object} segment - Marktsegment
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @returns {Number} - Dekkingspercentage (0-1)
   */
  calculateSegmentCoverage(segment, competitorAnalysis) {
    // Als er geen concurrentieanalyse is, return 0
    if (!competitorAnalysis || !competitorAnalysis.competitors) {
      return 0;
    }

    // Tel aantal concurrenten in dit segment
    let competitorsInSegment = 0;

    competitorAnalysis.competitors.forEach((competitor) => {
      if (competitor.segments && Array.isArray(competitor.segments)) {
        // Als de concurrent expliciet dit segment heeft
        if (competitor.segments.includes(segment.name)) {
          competitorsInSegment++;
        }
      }
    });

    // Bereken dekking op basis van aantal concurrenten
    const totalCompetitors = competitorAnalysis.competitors.length;

    if (totalCompetitors === 0) {
      return 0;
    }

    return competitorsInSegment / totalCompetitors;
  }

  /**
   * Haal concurrenten in een segment op
   * @param {Object} segment - Marktsegment
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @returns {Array} - Concurrenten in het segment
   */
  getCompetitorsInSegment(segment, competitorAnalysis) {
    // Als er geen concurrentieanalyse is, return lege array
    if (!competitorAnalysis || !competitorAnalysis.competitors) {
      return [];
    }

    // Filter concurrenten in dit segment
    return competitorAnalysis.competitors
      .filter((competitor) => {
        if (competitor.segments && Array.isArray(competitor.segments)) {
          return competitor.segments.includes(segment.name);
        }
        return false;
      })
      .map((competitor) => competitor.name);
  }

  /**
   * Haal concurrentscores voor een dimensie op
   * @param {String} dimension - Dimensie
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @returns {Array} - Scores
   */
  getCompetitorScoresForDimension(dimension, competitorAnalysis) {
    const scores = [];

    // Als er geen positioneringsmatrix is, return lege array
    if (!competitorAnalysis || !competitorAnalysis.positioning || !competitorAnalysis.positioning.matrix) {
      return scores;
    }

    // Haal scores op uit positioneringsmatrix
    const dimensionData = competitorAnalysis.positioning.matrix[dimension];

    if (dimensionData) {
      Object.values(dimensionData).forEach((score) => {
        if (typeof score === 'number') {
          scores.push(score);
        }
      });
    }

    return scores;
  }

  /**
   * Schat de grootte van een gat
   * @param {Number} gapSize - Grootte van het gat
   * @param {String} dimension - Dimensie
   * @param {Object} marketSize - Marktgrootte analyse
   * @returns {Number} - Geschatte marktgrootte
   */
  estimateGapSize(gapSize, dimension, marketSize) {
    // Basis schatting: grootte van het gat als percentage van de totale markt
    const baseEstimate = (gapSize / 100) * marketSize.totalMarketSize;

    // Pas aan op basis van dimensie
    let multiplier = 1.0;

    switch (dimension.toLowerCase()) {
      case 'price':
        multiplier = 1.2; // Prijsgaten zijn vaak groter
        break;
      case 'quality':
        multiplier = 1.1; // Kwaliteitsgaten zijn belangrijk
        break;
      case 'innovation':
        multiplier = 0.9; // Innovatiegaten zijn moeilijker te benutten
        break;
      case 'marketshare':
        multiplier = 0.8; // Marktaandeelgaten zijn moeilijker te benutten
        break;
    }

    return baseEstimate * multiplier;
  }

  /**
   * Identificeer kansen op basis van geïdentificeerde gaten
   * @param {Array} gaps - Geïdentificeerde gaten
   * @param {Object} marketSize - Marktgrootte analyse
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @param {Object} options - Identificatie-opties
   * @returns {Array} - Geïdentificeerde kansen
   */
  identifyOpportunities(gaps, marketSize, competitorAnalysis, options = {}) {
    const opportunities = [];

    // Converteer gaten naar kansen
    gaps.forEach((gap) => {
      // Bereken opportunityscore
      const opportunityScore = this.calculateOpportunityScore(
        gap,
        marketSize,
        competitorAnalysis,
      );

      // Als de score hoog genoeg is, voeg toe als kans
      if (opportunityScore >= this.config.minOpportunityScore) {
        opportunities.push({
          name: `Opportunity: ${gap.name}`,
          description: this.generateOpportunityDescription(gap),
          score: opportunityScore,
          potentialMarketSize: gap.size,
          targetCustomers: gap.targetCustomers,
          competitiveAdvantage: this.suggestCompetitiveAdvantage(gap, competitorAnalysis),
          entryBarriers: this.identifyEntryBarriers(gap, competitorAnalysis),
          timeToMarket: this.estimateTimeToMarket(gap),
          riskLevel: this.assessRiskLevel(gap, opportunityScore),
        });
      }
    });

    // Sorteer kansen op score
    opportunities.sort((a, b) => b.score - a.score);

    return opportunities;
  }

  /**
   * Bereken opportunityscore
   * @param {Object} gap - Geïdentificeerd gat
   * @param {Object} marketSize - Marktgrootte analyse
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @returns {Number} - Opportunityscore (0-100)
   */
  calculateOpportunityScore(gap, marketSize, competitorAnalysis) {
    // Bereken score op basis van verschillende factoren
    let score = 0;

    // Factor 1: Marktgrootte (30%)
    const marketSizeScore = this.calculateMarketSizeScore(gap, marketSize);
    score += marketSizeScore * this.config.opportunityFactors.marketSize;

    // Factor 2: Concurrentieniveau (30%)
    const competitionScore = this.calculateCompetitionScore(gap, competitorAnalysis);
    score += competitionScore * this.config.opportunityFactors.competitionLevel;

    // Factor 3: Groeisnelheid (20%)
    const growthScore = this.calculateGrowthScore(gap, marketSize);
    score += growthScore * this.config.opportunityFactors.growthRate;

    // Factor 4: Winstmarge (20%)
    const profitScore = this.calculateProfitScore(gap);
    score += profitScore * this.config.opportunityFactors.profitMargin;

    return Math.round(score);
  }

  /**
   * Bereken markgroottescore
   * @param {Object} gap - Geïdentificeerd gat
   * @param {Object} marketSize - Marktgrootte analyse
   * @returns {Number} - Markgroottescore (0-100)
   */
  calculateMarketSizeScore(gap, marketSize) {
    // Als er geen marktgrootte is, return 50
    if (!marketSize || !marketSize.totalMarketSize) {
      return 50;
    }

    // Bereken percentage van totale markt
    const percentage = gap.size / marketSize.totalMarketSize;

    // Score op basis van percentage
    if (percentage < this.config.minGapSize) {
      return 30; // Te klein
    } if (percentage < 0.2) {
      return 60; // Redelijk
    } if (percentage < 0.3) {
      return 80; // Goed
    }
    return 100; // Uitstekend
  }

  /**
   * Bereken concurrentiescore
   * @param {Object} gap - Geïdentificeerd gat
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @returns {Number} - Concurrentiescore (0-100)
   */
  calculateCompetitionScore(gap, competitorAnalysis) {
    // Als er geen concurrentieanalyse is, return 50
    if (!competitorAnalysis) {
      return 50;
    }

    // Bereken score op basis van concurrentieaanwezigheid
    if (gap.competitorPresence && Array.isArray(gap.competitorPresence)) {
      const competitors = gap.competitorPresence.length;

      if (competitors === 0) {
        return 100; // Geen concurrentie
      } if (competitors === 1) {
        return 80; // Weinig concurrentie
      } if (competitors <= 3) {
        return 60; // Gemiddelde concurrentie
      }
      return 40; // Veel concurrentie
    }

    // Als er geen concurrentieaanwezigheid is, gebruik coverage
    if (gap.coverage !== undefined) {
      return (1 - gap.coverage) * 100;
    }

    return 50; // Standaard
  }

  /**
   * Bereken groeiscore
   * @param {Object} gap - Geïdentificeerd gat
   * @param {Object} marketSize - Marktgrootte analyse
   * @returns {Number} - Groeiscore (0-100)
   */
  calculateGrowthScore(gap, marketSize) {
    // Als er geen marktgrootte of forecast is, return 50
    if (!marketSize || !marketSize.forecast || !Array.isArray(marketSize.forecast)) {
      return 50;
    }

    // Bereken CAGR (Compound Annual Growth Rate)
    const { forecast } = marketSize;

    if (forecast.length >= 2) {
      const firstYear = forecast[0].value;
      const lastYear = forecast[forecast.length - 1].value;
      const years = forecast.length - 1;

      if (firstYear > 0) {
        const cagr = (lastYear / firstYear) ** (1 / years) - 1;

        // Score op basis van CAGR
        if (cagr < 0) {
          return 20; // Krimpende markt
        } if (cagr < 0.05) {
          return 40; // Langzame groei
        } if (cagr < 0.1) {
          return 60; // Gemiddelde groei
        } if (cagr < 0.2) {
          return 80; // Snelle groei
        }
        return 100; // Zeer snelle groei
      }
    }

    return 50; // Standaard
  }

  /**
   * Bereken winstmargescore
   * @param {Object} gap - Geïdentificeerd gat
   * @returns {Number} - Winstmargescore (0-100)
   */
  calculateProfitScore(gap) {
    // Schat winstmarge op basis van type gat
    if (gap.type === 'segment') {
      return 70; // Segmentgaten hebben vaak goede marges
    } if (gap.type === 'demographic') {
      return 60; // Demografische gaten hebben redelijke marges
    } if (gap.type === 'psychographic') {
      return 80; // Psychografische gaten hebben vaak hoge marges
    } if (gap.type === 'positioning') {
      // Voor positioneringsgaten, kijk naar de dimensie
      if (gap.name.toLowerCase().includes('premium')
          || gap.name.toLowerCase().includes('luxury')) {
        return 90; // Premium positionering heeft hoge marges
      } if (gap.name.toLowerCase().includes('budget')
                || gap.name.toLowerCase().includes('low')) {
        return 40; // Budget positionering heeft lage marges
      }
    }

    return 60; // Standaard
  }

  /**
   * Genereer beschrijving voor een kans
   * @param {Object} gap - Geïdentificeerd gat
   * @returns {String} - Beschrijving
   */
  generateOpportunityDescription(gap) {
    let description = '';

    switch (gap.type) {
      case 'segment':
        description = `Ontwikkel een aanbod specifiek gericht op het ${gap.name} segment, dat momenteel onvoldoende wordt bediend door concurrenten.`;
        break;
      case 'demographic':
        description = `Richt je op de ${gap.name} demografische groep met een op maat gemaakt product of dienst.`;
        break;
      case 'psychographic':
        description = `Ontwikkel een aanbod dat aansluit bij de waarden en behoeften van de ${gap.name} psychografische groep.`;
        break;
      case 'positioning':
        description = `Positioneer een product of dienst in het gat op de ${gap.name.replace(' gap', '')} dimensie, waar weinig concurrentie is.`;
        break;
      default:
        description = `Ontwikkel een aanbod gericht op ${gap.name}, een onderbediend gebied in de markt.`;
    }

    return description;
  }

  /**
   * Suggereer concurrentievoordeel
   * @param {Object} gap - Geïdentificeerd gat
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @returns {String} - Gesuggereerd concurrentievoordeel
   */
  suggestCompetitiveAdvantage(gap, competitorAnalysis) {
    switch (gap.type) {
      case 'segment':
        return `Specialisatie in de specifieke behoeften van het ${gap.name} segment`;
      case 'demographic':
        return `Diepgaand begrip van de ${gap.name} demografische groep`;
      case 'psychographic':
        return `Afstemming op de waarden en levensstijl van de ${gap.name} psychografische groep`;
      case 'positioning':
        const dimension = gap.name.replace(' gap', '');
        return `Unieke positionering op de ${dimension} dimensie, tussen bestaande concurrenten in`;
      default:
        return 'First-mover voordeel in een onderbediend marktgebied';
    }
  }

  /**
   * Identificeer toetredingsbarrières
   * @param {Object} gap - Geïdentificeerd gat
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @returns {Array} - Toetredingsbarrières
   */
  identifyEntryBarriers(gap, competitorAnalysis) {
    const barriers = [];

    // Algemene barrières
    if (gap.size < marketSize.totalMarketSize * 0.1) {
      barriers.push('Beperkte marktgrootte kan schaalvoordelen beperken');
    }

    // Specifieke barrières per type
    switch (gap.type) {
      case 'segment':
        barriers.push('Benodigde specialistische kennis van het segment');
        barriers.push('Mogelijk hoge kosten voor aangepaste productontwikkeling');
        break;
      case 'demographic':
        barriers.push('Uitdaging om effectief te communiceren met de doelgroep');
        break;
      case 'psychographic':
        barriers.push('Complexiteit van het begrijpen van psychografische motivaties');
        barriers.push('Uitdaging om authentiek over te komen bij de doelgroep');
        break;
      case 'positioning':
        barriers.push('Risico van "stuck in the middle" tussen bestaande posities');
        barriers.push('Uitdaging om een duidelijke waardepropositie te communiceren');
        break;
    }

    return barriers;
  }

  /**
   * Schat tijd tot marktintroductie
   * @param {Object} gap - Geïdentificeerd gat
   * @returns {String} - Geschatte tijd
   */
  estimateTimeToMarket(gap) {
    switch (gap.type) {
      case 'segment':
        return 'Medium (6-12 maanden)';
      case 'demographic':
        return 'Kort-Medium (3-9 maanden)';
      case 'psychographic':
        return 'Medium-Lang (9-18 maanden)';
      case 'positioning':
        return 'Medium (6-12 maanden)';
      default:
        return 'Medium (6-12 maanden)';
    }
  }

  /**
   * Beoordeel risiconiveau
   * @param {Object} gap - Geïdentificeerd gat
   * @param {Number} opportunityScore - Opportunityscore
   * @returns {String} - Risiconiveau
   */
  assessRiskLevel(gap, opportunityScore) {
    // Basis risico-inschatting op basis van opportunityscore
    if (opportunityScore >= 80) {
      return 'Laag';
    } if (opportunityScore >= 60) {
      return 'Laag-Medium';
    } if (opportunityScore >= 40) {
      return 'Medium';
    }
    return 'Hoog';
  }

  /**
   * Bereken potentiële marktgrootte
   * @param {Array} gaps - Geïdentificeerde gaten
   * @param {Object} marketSize - Marktgrootte analyse
   * @returns {Number} - Potentiële marktgrootte
   */
  calculatePotentialMarketSize(gaps, marketSize) {
    // Som van alle gaten, met correctie voor overlap
    let totalSize = 0;
    const overlapFactor = 0.8; // Aanname: 20% overlap tussen gaten

    gaps.forEach((gap, index) => {
      // Eerste gat volledig meetellen
      if (index === 0) {
        totalSize += gap.size;
      } else {
        // Volgende gaten met overlapfactor
        totalSize += gap.size * overlapFactor ** index;
      }
    });

    // Begrens tot maximaal 30% van de totale markt
    if (marketSize && marketSize.totalMarketSize) {
      return Math.min(totalSize, marketSize.totalMarketSize * 0.3);
    }

    return totalSize;
  }

  /**
   * Bereken betrouwbaarheid van de analyse
   * @param {Object} marketSize - Marktgrootte analyse
   * @param {Object} segmentation - Marktsegmentatie analyse
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @returns {Number} - Betrouwbaarheidsscore (0-1)
   */
  calculateConfidence(marketSize, segmentation, competitorAnalysis) {
    let confidence = 0.5; // Basis betrouwbaarheid

    // Verhoog betrouwbaarheid op basis van beschikbare gegevens
    if (marketSize && marketSize.confidence) {
      confidence += marketSize.confidence * 0.1;
    }

    if (segmentation && segmentation.confidence) {
      confidence += segmentation.confidence * 0.1;
    }

    if (competitorAnalysis && competitorAnalysis.confidence) {
      confidence += competitorAnalysis.confidence * 0.1;
    }

    // Controleer of er segmenten zijn
    if (segmentation && segmentation.segments && segmentation.segments.length > 0) {
      confidence += 0.1;
    }

    // Controleer of er concurrenten zijn
    if (competitorAnalysis && competitorAnalysis.competitors && competitorAnalysis.competitors.length > 0) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Bepaal welke analysemethode is gebruikt
   * @param {Object} marketSize - Marktgrootte analyse
   * @param {Object} segmentation - Marktsegmentatie analyse
   * @param {Object} competitorAnalysis - Concurrentieanalyse
   * @param {Object} options - Identificatie-opties
   * @returns {String} - Gebruikte methode
   */
  determineMethod(marketSize, segmentation, competitorAnalysis, options) {
    // Tel aantal beschikbare analyses
    let count = 0;

    if (marketSize && !marketSize.error) count++;
    if (segmentation && !segmentation.error) count++;
    if (competitorAnalysis && !competitorAnalysis.error) count++;

    if (count === 3) {
      return 'comprehensive';
    } if (count === 2) {
      return 'partial';
    } if (count === 1) {
      return 'limited';
    }

    return 'basic';
  }
}

module.exports = {
  GapOpportunityIdentifier,
};
