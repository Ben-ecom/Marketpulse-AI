/**
 * Competitor Analyzer
 *
 * Deze component is verantwoordelijk voor het analyseren van concurrenten
 * en hun positionering in de markt.
 */

/**
 * Competitor Analyzer klasse
 */
class CompetitorAnalyzer {
  constructor() {
    // Configuratie voor concurrentieanalyse
    this.config = {
      positioningDimensions: [
        'price',
        'quality',
        'innovation',
        'marketShare',
        'customerSatisfaction',
      ],
      swotCategories: [
        'strengths',
        'weaknesses',
        'opportunities',
        'threats',
      ],
    };
  }

  /**
   * Analyseer concurrenten en hun positionering
   * @param {Array|Object} competitorData - Gegevens over concurrenten
   * @param {Object} options - Analyse-opties
   * @returns {Promise<Object>} - Concurrentieanalyse resultaten
   */
  async analyze(competitorData, options = {}) {
    try {
      // Valideer input
      if (!competitorData || !Array.isArray(competitorData) || competitorData.length === 0) {
        console.warn('⚠️ Competitor analysis: Ongeldige concurrentiegegevens ontvangen');
        return {
          competitors: [],
          positioning: null,
          marketShare: null,
          competitiveAdvantages: null,
          swotAnalysis: null,
          confidence: 0,
          method: 'none',
          error: 'Ongeldige concurrentiegegevens',
        };
      }

      // Normaliseer concurrentiegegevens
      const competitors = this.normalizeCompetitorData(competitorData);

      // Analyseer marktpositie
      const positioning = this.analyzePositioning(competitors, options);

      // Analyseer marktaandeel
      const marketShare = this.analyzeMarketShare(competitors);

      // Identificeer concurrentievoordelen
      const competitiveAdvantages = this.identifyCompetitiveAdvantages(
        competitors,
        positioning,
        options,
      );

      // Genereer SWOT analyse
      const swotAnalysis = this.generateSwotAnalysis(
        competitors,
        positioning,
        marketShare,
        options,
      );

      return {
        competitors,
        positioning,
        marketShare,
        competitiveAdvantages,
        swotAnalysis,
        confidence: this.calculateConfidence(competitors),
        method: this.determineMethod(competitors, options),
      };
    } catch (error) {
      console.error('❌ Fout bij concurrentieanalyse:', error);
      return {
        competitors: [],
        positioning: null,
        marketShare: null,
        competitiveAdvantages: null,
        swotAnalysis: null,
        confidence: 0,
        method: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Normaliseer concurrentiegegevens
   * @param {Array|Object} competitorData - Ruwe concurrentiegegevens
   * @returns {Array} - Genormaliseerde concurrentiegegevens
   */
  normalizeCompetitorData(competitorData) {
    // Als competitorData al een array is
    if (Array.isArray(competitorData)) {
      return competitorData.map((competitor) => {
        // Zorg ervoor dat elke concurrent een naam heeft
        if (!competitor.name) {
          // Maak een kopie van de competitor in plaats van direct te wijzigen
          return {
            ...competitor,
            name: `Competitor ${Math.random().toString(36).substring(2, 7)}`,
          };
        }
        return competitor;
      });
    }

    // Als competitorData een object is met een competitors eigenschap
    if (competitorData.competitors && Array.isArray(competitorData.competitors)) {
      return this.normalizeCompetitorData(competitorData.competitors);
    }

    // Als het geen van beide is, return een lege array
    return [];
  }

  /**
   * Analyseer positionering van concurrenten
   * @param {Array} competitors - Genormaliseerde concurrentiegegevens
   * @param {Object} options - Analyse-opties
   * @returns {Object} - Positioneringsanalyse
   */
  analyzePositioning(competitors, options = {}) {
    // Bepaal welke dimensies te gebruiken
    const dimensions = options.dimensions || this.config.positioningDimensions;

    // Initialiseer positioneringsmatrix
    const matrix = {};
    dimensions.forEach((dimension) => {
      matrix[dimension] = {};

      competitors.forEach((competitor) => {
        // Haal score voor deze dimensie op
        let score = null;

        if (competitor[dimension] !== undefined) {
          // Direct beschikbare score
          score = competitor[dimension];
        } else if (competitor.scores && competitor.scores[dimension] !== undefined) {
          // Score in scores object
          score = competitor.scores[dimension];
        } else if (competitor.positioning && competitor.positioning[dimension] !== undefined) {
          // Score in positioning object
          score = competitor.positioning[dimension];
        }

        // Normaliseer score naar 0-100 schaal indien nodig
        if (score !== null) {
          if (score < 0 || score > 100) {
            // Aanname: score is op een andere schaal, normaliseer naar 0-100
            // Minimumwaarde is altijd 0
            // const min = 0; // Ongebruikte variabele verwijderd
            let max;
            // Bepaal de juiste maximumwaarde op basis van de score
            if (score > 10) {
              max = 100;
            } else if (score > 1) {
              max = 10;
            } else {
              max = 1;
            }
            score = (score / max) * 100;
          }

          matrix[dimension][competitor.name] = score;
        }
      });
    });

    // Bereken relatieve posities
    const relativePositions = {};
    competitors.forEach((competitor) => {
      relativePositions[competitor.name] = {};

      dimensions.forEach((dimension) => {
        if (matrix[dimension][competitor.name] !== undefined) {
          // Bereken gemiddelde score voor deze dimensie
          const scores = Object.values(matrix[dimension]).filter((score) => score !== undefined);
          const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;

          // Bereken relatieve positie
          let position;
          if (matrix[dimension][competitor.name] > avg) {
            position = 'above';
          } else {
            position = 'below';
          }

          relativePositions[competitor.name][dimension] = {
            score: matrix[dimension][competitor.name],
            relativeTo: avg,
            position,
          };
        }
      });
    });

    return {
      dimensions,
      matrix,
      relativePositions,
    };
  }

  /**
   * Analyseer marktaandeel van concurrenten
   * @param {Array} competitors - Genormaliseerde concurrentiegegevens
   * @returns {Object} - Marktaandeelanalyse
   */
  analyzeMarketShare(competitors) {
    // Verzamel marktaandeelgegevens
    const marketShares = {};
    let totalExplicitShare = 0;
    let companiesWithExplicitShare = 0;

    competitors.forEach((competitor) => {
      let share = null;

      if (competitor.marketShare !== undefined) {
        // Direct beschikbaar marktaandeel
        share = competitor.marketShare;
      } else if (competitor.market && competitor.market.share !== undefined) {
        // Marktaandeel in market object
        share = competitor.market.share;
      }

      // Normaliseer naar percentage indien nodig
      if (share !== null) {
        if (share > 1) {
          // Aanname: al een percentage
          share = share > 100 ? share / 100 : share;
        }

        marketShares[competitor.name] = share;
        totalExplicitShare += share;
        companiesWithExplicitShare++;
      }
    });

    // Als er ontbrekende marktaandelen zijn, schat deze
    if (companiesWithExplicitShare > 0 && companiesWithExplicitShare < competitors.length) {
      const remainingShare = Math.max(0, 100 - totalExplicitShare * 100);
      const remainingCompetitors = competitors.length - companiesWithExplicitShare;
      const averageRemainingShare = remainingShare / remainingCompetitors / 100;

      competitors.forEach((competitor) => {
        if (marketShares[competitor.name] === undefined) {
          marketShares[competitor.name] = averageRemainingShare;
        }
      });
    }

    // Als er geen marktaandelen zijn, maak een schatting
    if (companiesWithExplicitShare === 0) {
      const equalShare = 1 / competitors.length;

      competitors.forEach((competitor) => {
        marketShares[competitor.name] = equalShare;
      });
    }

    // Bereken concentratiegraad
    const sortedShares = Object.values(marketShares).sort((a, b) => b - a);
    const concentrationRatio = {
      cr3: sortedShares.slice(0, 3).reduce((sum, share) => sum + share, 0),
      cr5: sortedShares.slice(0, 5).reduce((sum, share) => sum + share, 0),
    };

    // Bereken Herfindahl-Hirschman Index (HHI)
    const hhi = Object.values(marketShares).reduce((sum, share) => sum + (share * 100) ** 2, 0);

    // Bepaal marktconcentratie
    let concentration = 'unknown';
    if (hhi < 1500) {
      concentration = 'unconcentrated';
    } else if (hhi < 2500) {
      concentration = 'moderately concentrated';
    } else {
      concentration = 'highly concentrated';
    }

    return {
      marketShares,
      concentrationRatio,
      hhi,
      concentration,
    };
  }

  /**
   * Identificeer concurrentievoordelen
   * @param {Array} competitors - Genormaliseerde concurrentiegegevens
   * @param {Object} positioning - Positioneringsanalyse
   * @param {Object} options - Analyse-opties
   * @returns {Object} - Concurrentievoordelen
   */
  identifyCompetitiveAdvantages(competitors, positioning, options = {}) {
    const advantages = {};
    const ownCompanyName = options.ownCompanyName || this.findOwnCompanyName(competitors);

    // Als er geen eigen bedrijfsnaam is, return null
    if (!ownCompanyName) {
      return null;
    }

    // Identificeer voordelen per dimensie
    positioning.dimensions.forEach((dimension) => {
      const dimensionData = positioning.matrix[dimension];
      const ownScore = dimensionData[ownCompanyName];

      // Als er geen eigen score is voor deze dimensie, skip
      if (ownScore === undefined) {
        return;
      }

      // Vergelijk met concurrenten
      const competitorScores = Object.entries(dimensionData)
        .filter(([name]) => name !== ownCompanyName)
        .map(([name, score]) => ({ name, score }));

      // Sorteer concurrenten op score
      competitorScores.sort((a, b) => b.score - a.score);

      // Bepaal relatieve positie
      const topCompetitor = competitorScores[0];
      const advantageThreshold = 10; // 10% verschil voor een significant voordeel

      if (topCompetitor && ownScore > topCompetitor.score + advantageThreshold) {
        // Significant voordeel
        advantages[dimension] = {
          type: 'significant advantage',
          score: ownScore,
          gap: ownScore - topCompetitor.score,
          topCompetitor: topCompetitor.name,
        };
      } else if (topCompetitor && ownScore > topCompetitor.score) {
        // Klein voordeel
        advantages[dimension] = {
          type: 'slight advantage',
          score: ownScore,
          gap: ownScore - topCompetitor.score,
          topCompetitor: topCompetitor.name,
        };
      } else if (topCompetitor && ownScore < topCompetitor.score - advantageThreshold) {
        // Significant nadeel
        advantages[dimension] = {
          type: 'significant disadvantage',
          score: ownScore,
          gap: topCompetitor.score - ownScore,
          topCompetitor: topCompetitor.name,
        };
      } else if (topCompetitor && ownScore < topCompetitor.score) {
        // Klein nadeel
        advantages[dimension] = {
          type: 'slight disadvantage',
          score: ownScore,
          gap: topCompetitor.score - ownScore,
          topCompetitor: topCompetitor.name,
        };
      } else {
        // Gelijk
        advantages[dimension] = {
          type: 'parity',
          score: ownScore,
          gap: 0,
          topCompetitor: topCompetitor ? topCompetitor.name : null,
        };
      }
    });

    // Identificeer algemene voordelen en nadelen
    const significantAdvantages = Object.entries(advantages)
      .filter(([_, data]) => data.type === 'significant advantage')
      .map(([dimension]) => dimension);

    const slightAdvantages = Object.entries(advantages)
      .filter(([_, data]) => data.type === 'slight advantage')
      .map(([dimension]) => dimension);

    const significantDisadvantages = Object.entries(advantages)
      .filter(([_, data]) => data.type === 'significant disadvantage')
      .map(([dimension]) => dimension);

    const slightDisadvantages = Object.entries(advantages)
      .filter(([_, data]) => data.type === 'slight disadvantage')
      .map(([dimension]) => dimension);

    return {
      byDimension: advantages,
      summary: {
        significantAdvantages,
        slightAdvantages,
        significantDisadvantages,
        slightDisadvantages,
      },
    };
  }

  /**
   * Vind eigen bedrijfsnaam in concurrentiegegevens
   * @param {Array} competitors - Genormaliseerde concurrentiegegevens
   * @returns {String|null} - Eigen bedrijfsnaam of null
   */
  findOwnCompanyName(competitors) {
    // Zoek concurrent met isOwn flag
    const ownCompany = competitors.find((competitor) => competitor.isOwn
      || competitor.isOwnCompany
      || competitor.name === 'Own'
      || competitor.name === 'Self');

    return ownCompany ? ownCompany.name : null;
  }

  /**
   * Genereer SWOT analyse
   * @param {Array} competitors - Genormaliseerde concurrentiegegevens
   * @param {Object} positioning - Positioneringsanalyse
   * @param {Object} marketShare - Marktaandeelanalyse
   * @param {Object} options - Analyse-opties
   * @returns {Object} - SWOT analyse
   */
  generateSwotAnalysis(competitors, positioning, marketShare, options = {}) {
    const ownCompanyName = options.ownCompanyName || this.findOwnCompanyName(competitors);

    // Als er geen eigen bedrijfsnaam is, return null
    if (!ownCompanyName) {
      return null;
    }

    // Vind eigen bedrijf
    const ownCompany = competitors.find((competitor) => competitor.name === ownCompanyName);

    // Als eigen bedrijf niet gevonden is, return null
    if (!ownCompany) {
      return null;
    }

    // Initialiseer SWOT analyse
    const swot = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    };

    // Analyseer sterktes en zwaktes op basis van positionering
    if (positioning && positioning.relativePositions[ownCompanyName]) {
      const relativePositions = positioning.relativePositions[ownCompanyName];

      Object.entries(relativePositions).forEach(([dimension, data]) => {
        if (data.position === 'above' && data.score - data.relativeTo > 10) {
          swot.strengths.push(`Sterke ${dimension} positie vergeleken met concurrenten`);
        } else if (data.position === 'below' && data.relativeTo - data.score > 10) {
          swot.weaknesses.push(`Zwakke ${dimension} positie vergeleken met concurrenten`);
        }
      });
    }

    // Analyseer sterktes en zwaktes op basis van marktaandeel
    if (marketShare && marketShare.marketShares[ownCompanyName]) {
      const ownShare = marketShare.marketShares[ownCompanyName];
      const avgShare = 1 / competitors.length;

      if (ownShare > avgShare * 1.5) {
        swot.strengths.push('Sterk marktaandeel vergeleken met industrie gemiddelde');
      } else if (ownShare < avgShare * 0.5) {
        swot.weaknesses.push('Zwak marktaandeel vergeleken met industrie gemiddelde');
      }
    }

    // Analyseer kansen en bedreigingen
    competitors.forEach((competitor) => {
      if (competitor.name === ownCompanyName) {
        return;
      }

      // Vergelijk met concurrenten
      if (positioning && positioning.relativePositions[competitor.name]) {
        const competitorPositions = positioning.relativePositions[competitor.name];
        const ownPositions = positioning.relativePositions[ownCompanyName];

        Object.entries(competitorPositions).forEach(([dimension, data]) => {
          if (ownPositions[dimension]) {
            // Identificeer kansen
            if (data.position === 'below' && data.relativeTo - data.score > 15) {
              swot.opportunities.push(`Kans om marktaandeel te winnen van ${competitor.name} op ${dimension}`);
            }

            // Identificeer bedreigingen
            if (data.position === 'above' && data.score - data.relativeTo > 15) {
              swot.threats.push(`Bedreiging van ${competitor.name}'s sterke positie op ${dimension}`);
            }
          }
        });
      }
    });

    // Voeg algemene kansen en bedreigingen toe
    if (marketShare) {
      if (marketShare.concentration === 'highly concentrated') {
        swot.opportunities.push('Kans om marktaandeel te winnen in een geconcentreerde markt door differentiatie');
      } else if (marketShare.concentration === 'unconcentrated') {
        swot.opportunities.push('Kans om marktleider te worden in een gefragmenteerde markt');
        swot.threats.push('Bedreiging van intense concurrentie in een gefragmenteerde markt');
      }
    }

    return swot;
  }

  /**
   * Bereken betrouwbaarheid van de analyse
   * @param {Array} competitors - Genormaliseerde concurrentiegegevens
   * @returns {Number} - Betrouwbaarheidsscore (0-1)
   */
  calculateConfidence(competitors) {
    let confidence = 0.5; // Basis betrouwbaarheid

    // Verhoog betrouwbaarheid op basis van beschikbare gegevens
    if (competitors.length > 1) {
      confidence += 0.1;
    }

    if (competitors.length > 3) {
      confidence += 0.1;
    }

    // Controleer of er voldoende dimensies zijn
    const dimensionsCount = this.countAvailableDimensions(competitors);
    if (dimensionsCount > 2) {
      confidence += 0.1;
    }

    if (dimensionsCount > 4) {
      confidence += 0.1;
    }

    // Controleer of er marktaandeelgegevens zijn
    const hasMarketShare = competitors.some((competitor) => competitor.marketShare !== undefined
      || (competitor.market && competitor.market.share !== undefined));

    if (hasMarketShare) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Tel beschikbare dimensies in concurrentiegegevens
   * @param {Array} competitors - Genormaliseerde concurrentiegegevens
   * @returns {Number} - Aantal beschikbare dimensies
   */
  countAvailableDimensions(competitors) {
    const dimensions = new Set();

    competitors.forEach((competitor) => {
      // Tel directe eigenschappen
      this.config.positioningDimensions.forEach((dimension) => {
        if (competitor[dimension] !== undefined) {
          dimensions.add(dimension);
        }
      });

      // Tel scores
      if (competitor.scores) {
        Object.keys(competitor.scores).forEach((dimension) => {
          dimensions.add(dimension);
        });
      }

      // Tel positioning
      if (competitor.positioning) {
        Object.keys(competitor.positioning).forEach((dimension) => {
          dimensions.add(dimension);
        });
      }
    });

    return dimensions.size;
  }

  /**
   * Bepaal welke analysemethode is gebruikt
   * @param {Array} competitors - Genormaliseerde concurrentiegegevens
   * @param {Object} options - Analyse-opties
   * @returns {String} - Gebruikte methode
   */
  determineMethod(competitors, _options) {
    // Als er marktaandeelgegevens zijn
    const hasMarketShare = competitors.some((competitor) => competitor.marketShare !== undefined
      || (competitor.market && competitor.market.share !== undefined));

    // Als er positioneringsgegevens zijn
    const hasPositioning = competitors.some((competitor) => competitor.positioning !== undefined
      || competitor.scores !== undefined);

    if (hasMarketShare && hasPositioning) {
      return 'comprehensive';
    } if (hasMarketShare) {
      return 'market-share';
    } if (hasPositioning) {
      return 'positioning';
    }

    // Standaard
    return 'basic';
  }
}

module.exports = {
  CompetitorAnalyzer,
};
