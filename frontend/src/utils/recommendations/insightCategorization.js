/**
 * Utility functies voor het categoriseren van inzichten voor het aanbevelingssysteem
 */

/**
 * Categoriseert inzichten op basis van type en inhoud
 * @param {Array} insights - Array met inzichten
 * @returns {Object} Object met gecategoriseerde inzichten
 */
export const categorizeInsights = (insights = []) => {
  if (!Array.isArray(insights) || insights.length === 0) {
    return {
      painPoints: [],
      desires: [],
      opportunities: [],
      threats: [],
      strengths: [],
      weaknesses: []
    };
  }
  
  // Categoriseer inzichten op basis van type en inhoud
  return insights.reduce((acc, insight) => {
    const category = determineInsightCategory(insight);
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push({
      ...insight,
      category
    });
    
    return acc;
  }, {
    painPoints: [],
    desires: [],
    opportunities: [],
    threats: [],
    strengths: [],
    weaknesses: []
  });
};

/**
 * Bepaalt de categorie van een inzicht op basis van type en inhoud
 * @param {Object} insight - Inzicht object
 * @returns {String} Categorie naam
 */
const determineInsightCategory = (insight) => {
  // Als het inzicht al een categorie heeft, gebruik deze
  if (insight.category && typeof insight.category === 'string') {
    const category = insight.category.toLowerCase();
    
    // Normaliseer categorienamen
    if (category.includes('pain') || category.includes('pijn')) {
      return 'painPoints';
    } else if (category.includes('desire') || category.includes('verlang')) {
      return 'desires';
    } else if (category.includes('opportunit') || category.includes('kans')) {
      return 'opportunities';
    } else if (category.includes('threat') || category.includes('dreig') || category.includes('bedreig')) {
      return 'threats';
    } else if (category.includes('strength') || category.includes('sterk')) {
      return 'strengths';
    } else if (category.includes('weakness') || category.includes('zwak')) {
      return 'weaknesses';
    }
  }
  
  // Als het inzicht een type heeft, gebruik deze voor categorisatie
  if (insight.type && typeof insight.type === 'string') {
    const type = insight.type.toLowerCase();
    
    if (type.includes('pain') || type.includes('pijn') || type.includes('problem') || type.includes('issue')) {
      return 'painPoints';
    } else if (type.includes('desire') || type.includes('verlang') || type.includes('wish') || type.includes('wens')) {
      return 'desires';
    } else if (type.includes('opportunit') || type.includes('kans')) {
      return 'opportunities';
    } else if (type.includes('threat') || type.includes('dreig') || type.includes('bedreig')) {
      return 'threats';
    } else if (type.includes('strength') || type.includes('sterk')) {
      return 'strengths';
    } else if (type.includes('weakness') || type.includes('zwak')) {
      return 'weaknesses';
    }
  }
  
  // Als er geen expliciete categorie of type is, probeer te categoriseren op basis van inhoud
  if (insight.text || insight.content || insight.description) {
    const text = (insight.text || insight.content || insight.description || '').toLowerCase();
    
    // Zoek naar trefwoorden die duiden op verschillende categorieën
    const keywords = {
      painPoints: ['probleem', 'pijn', 'frustratie', 'moeilijk', 'uitdaging', 'obstakel', 'barrière', 'klacht', 'issue'],
      desires: ['wens', 'verlang', 'behoefte', 'wil', 'zoek', 'hoop', 'verwacht', 'zou willen', 'ideaal'],
      opportunities: ['kans', 'mogelijkheid', 'potentieel', 'groei', 'verbetering', 'trend', 'opkomend', 'nieuw'],
      threats: ['bedreiging', 'risico', 'gevaar', 'concurrent', 'verlies', 'daling', 'afname', 'negatief'],
      strengths: ['sterk', 'voordeel', 'uniek', 'beter', 'goed', 'positief', 'excellent', 'superieur'],
      weaknesses: ['zwak', 'nadeel', 'tekortkoming', 'slechter', 'minder', 'achterstand', 'gebrek']
    };
    
    // Tel het aantal trefwoorden per categorie
    const scores = Object.entries(keywords).reduce((acc, [category, words]) => {
      acc[category] = words.reduce((sum, word) => {
        return sum + (text.includes(word) ? 1 : 0);
      }, 0);
      return acc;
    }, {});
    
    // Bepaal de categorie met de hoogste score
    const topCategory = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0)[0];
    
    if (topCategory) {
      return topCategory[0];
    }
  }
  
  // Als sentiment score beschikbaar is, gebruik deze voor categorisatie
  if (insight.sentiment_score !== undefined) {
    if (insight.sentiment_score < -0.2) {
      return 'painPoints';
    } else if (insight.sentiment_score > 0.2) {
      return 'desires';
    }
  }
  
  // Standaard categorie als geen andere categorisatie mogelijk is
  return 'uncategorized';
};

/**
 * Groepeert inzichten per categorie en subcategorie
 * @param {Object} categorizedInsights - Object met gecategoriseerde inzichten
 * @returns {Object} Object met gegroepeerde inzichten
 */
export const groupInsightsBySubcategory = (categorizedInsights) => {
  const result = {};
  
  // Loop door elke categorie
  Object.entries(categorizedInsights).forEach(([category, insights]) => {
    if (!Array.isArray(insights) || insights.length === 0) {
      result[category] = {};
      return;
    }
    
    // Groepeer inzichten per subcategorie
    result[category] = insights.reduce((acc, insight) => {
      const subcategory = determineSubcategory(insight, category);
      
      if (!acc[subcategory]) {
        acc[subcategory] = [];
      }
      
      acc[subcategory].push(insight);
      
      return acc;
    }, {});
  });
  
  return result;
};

/**
 * Bepaalt de subcategorie van een inzicht op basis van inhoud en categorie
 * @param {Object} insight - Inzicht object
 * @param {String} category - Hoofdcategorie
 * @returns {String} Subcategorie naam
 */
const determineSubcategory = (insight, category) => {
  // Als het inzicht al een subcategorie heeft, gebruik deze
  if (insight.subcategory && typeof insight.subcategory === 'string') {
    return insight.subcategory;
  }
  
  // Subcategorieën per hoofdcategorie
  const subcategories = {
    painPoints: {
      'usability': ['gebruiksgemak', 'interface', 'navigatie', 'ervaring', 'ux', 'ui', 'design'],
      'performance': ['snelheid', 'prestatie', 'traag', 'langzaam', 'wachten', 'laden'],
      'functionality': ['functie', 'werking', 'feature', 'mogelijkheid', 'optie'],
      'support': ['hulp', 'ondersteuning', 'service', 'klantenservice', 'assistentie'],
      'pricing': ['prijs', 'kosten', 'duur', 'betaalbaar', 'betaling', 'abonnement']
    },
    desires: {
      'convenience': ['gemak', 'eenvoudig', 'simpel', 'makkelijk', 'toegankelijk'],
      'quality': ['kwaliteit', 'betrouwbaar', 'degelijk', 'goed', 'premium'],
      'innovation': ['innovatie', 'nieuw', 'modern', 'vooruitstrevend', 'geavanceerd'],
      'personalization': ['persoonlijk', 'op maat', 'aangepast', 'customization', 'flexibel'],
      'value': ['waarde', 'voordeel', 'besparing', 'rendement', 'investering']
    },
    opportunities: {
      'market_gap': ['gat', 'niche', 'onvervuld', 'behoefte', 'vraag', 'markt'],
      'trend': ['trend', 'opkomend', 'groeiend', 'populair', 'viral'],
      'technology': ['technologie', 'tech', 'innovatie', 'platform', 'systeem'],
      'partnership': ['partner', 'samenwerking', 'alliantie', 'netwerk', 'ecosysteem'],
      'expansion': ['uitbreiding', 'groei', 'schaal', 'internationaal', 'nieuw segment']
    },
    threats: {
      'competition': ['concurrent', 'competitie', 'rivaliteit', 'marktaandeel'],
      'market_change': ['verandering', 'verschuiving', 'transformatie', 'disruptie'],
      'regulation': ['regelgeving', 'compliance', 'wet', 'juridisch', 'beleid'],
      'technology': ['technologie', 'veroudering', 'achterhaald', 'legacy'],
      'economic': ['economisch', 'recessie', 'inflatie', 'crisis', 'kosten']
    },
    strengths: {
      'expertise': ['expertise', 'kennis', 'ervaring', 'vaardigheid', 'specialist'],
      'reputation': ['reputatie', 'merk', 'bekendheid', 'imago', 'vertrouwen'],
      'resources': ['middelen', 'kapitaal', 'financieel', 'investering', 'assets'],
      'innovation': ['innovatie', 'r&d', 'ontwikkeling', 'patent', 'intellectueel'],
      'customer_base': ['klanten', 'gebruikers', 'community', 'loyaliteit', 'retentie']
    },
    weaknesses: {
      'resources': ['middelen', 'kapitaal', 'financieel', 'budget', 'beperkt'],
      'expertise': ['expertise', 'kennis', 'ervaring', 'vaardigheid', 'capaciteit'],
      'process': ['proces', 'workflow', 'efficiëntie', 'schaal', 'operationeel'],
      'technology': ['technologie', 'systeem', 'platform', 'infrastructuur', 'tools'],
      'market_position': ['positie', 'bekendheid', 'marktaandeel', 'concurrentiepositie']
    }
  };
  
  // Als de categorie geen subcategorieën heeft, return 'general'
  if (!subcategories[category]) {
    return 'general';
  }
  
  const text = (insight.text || insight.content || insight.description || '').toLowerCase();
  
  // Bereken scores voor elke subcategorie
  const scores = Object.entries(subcategories[category]).reduce((acc, [subcategory, keywords]) => {
    acc[subcategory] = keywords.reduce((sum, keyword) => {
      return sum + (text.includes(keyword) ? 1 : 0);
    }, 0);
    return acc;
  }, {});
  
  // Bepaal de subcategorie met de hoogste score
  const topSubcategory = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, score]) => score > 0)[0];
  
  if (topSubcategory) {
    return topSubcategory[0];
  }
  
  // Standaard subcategorie als geen andere categorisatie mogelijk is
  return 'general';
};

/**
 * Prioriteert inzichten op basis van verschillende factoren
 * @param {Object} groupedInsights - Object met gegroepeerde inzichten
 * @param {Object} options - Configuratie opties
 * @returns {Object} Object met geprioriteerde inzichten
 */
export const prioritizeInsights = (groupedInsights, options = {}) => {
  const {
    sentimentWeight = 0.3,     // Gewicht van sentiment score
    frequencyWeight = 0.4,     // Gewicht van frequentie
    recencyWeight = 0.2,       // Gewicht van recentheid
    engagementWeight = 0.1     // Gewicht van engagement (likes, shares, etc.)
  } = options;
  
  const result = {};
  
  // Loop door elke categorie
  Object.entries(groupedInsights).forEach(([category, subcategories]) => {
    result[category] = {};
    
    // Loop door elke subcategorie
    Object.entries(subcategories).forEach(([subcategory, insights]) => {
      // Bereken prioriteit voor elk inzicht
      const prioritizedInsights = insights.map(insight => {
        // Bereken sentiment score (0-1)
        const sentimentScore = calculateSentimentScore(insight);
        
        // Bereken frequentie score (0-1)
        const frequencyScore = calculateFrequencyScore(insight, insights);
        
        // Bereken recentheid score (0-1)
        const recencyScore = calculateRecencyScore(insight);
        
        // Bereken engagement score (0-1)
        const engagementScore = calculateEngagementScore(insight);
        
        // Bereken totale prioriteit score
        const priorityScore = 
          (sentimentScore * sentimentWeight) +
          (frequencyScore * frequencyWeight) +
          (recencyScore * recencyWeight) +
          (engagementScore * engagementWeight);
        
        // Bepaal prioriteit niveau
        let priority;
        if (priorityScore >= 0.7) {
          priority = 'high';
        } else if (priorityScore >= 0.4) {
          priority = 'medium';
        } else {
          priority = 'low';
        }
        
        return {
          ...insight,
          priorityScore,
          priority
        };
      });
      
      // Sorteer inzichten op prioriteit
      result[category][subcategory] = prioritizedInsights.sort((a, b) => b.priorityScore - a.priorityScore);
    });
  });
  
  return result;
};

/**
 * Berekent een genormaliseerde sentiment score (0-1)
 * @param {Object} insight - Inzicht object
 * @returns {Number} Genormaliseerde sentiment score
 */
const calculateSentimentScore = (insight) => {
  // Als er geen sentiment score is, return 0.5 (neutraal)
  if (insight.sentiment_score === undefined) {
    return 0.5;
  }
  
  // Normaliseer sentiment score naar 0-1 bereik
  // Originele score is tussen -1 en 1
  return (Math.abs(insight.sentiment_score) + 0.2) / 1.2;
};

/**
 * Berekent een frequentie score op basis van hoe vaak vergelijkbare inzichten voorkomen
 * @param {Object} insight - Inzicht object
 * @param {Array} allInsights - Alle inzichten in dezelfde categorie
 * @returns {Number} Frequentie score (0-1)
 */
const calculateFrequencyScore = (insight, allInsights) => {
  // Als er geen tekst is om te vergelijken, return 0.5 (gemiddeld)
  const text = insight.text || insight.content || insight.description;
  if (!text) {
    return 0.5;
  }
  
  // Tel het aantal vergelijkbare inzichten
  const keywords = extractKeywords(text);
  
  if (keywords.length === 0) {
    return 0.5;
  }
  
  let matchCount = 0;
  
  allInsights.forEach(otherInsight => {
    if (otherInsight === insight) return;
    
    const otherText = otherInsight.text || otherInsight.content || otherInsight.description || '';
    const matches = keywords.filter(keyword => otherText.toLowerCase().includes(keyword.toLowerCase()));
    
    if (matches.length > 0) {
      matchCount += matches.length / keywords.length;
    }
  });
  
  // Normaliseer frequentie score naar 0-1 bereik
  return Math.min(1, matchCount / (allInsights.length * 0.5));
};

/**
 * Extraheert keywords uit een tekst
 * @param {String} text - Tekst om keywords uit te extraheren
 * @returns {Array} Array met keywords
 */
const extractKeywords = (text) => {
  if (!text) return [];
  
  // Verwijder stopwoorden en haal keywords eruit
  const stopwords = ['de', 'het', 'een', 'en', 'in', 'is', 'dat', 'op', 'te', 'van', 'voor', 'met'];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopwords.includes(word));
};

/**
 * Berekent een recentheid score op basis van de datum van het inzicht
 * @param {Object} insight - Inzicht object
 * @returns {Number} Recentheid score (0-1)
 */
const calculateRecencyScore = (insight) => {
  const date = new Date(insight.timestamp || insight.created_at || insight.date);
  
  // Als er geen geldige datum is, return 0.5 (gemiddeld)
  if (isNaN(date.getTime())) {
    return 0.5;
  }
  
  const now = new Date();
  const ageInDays = (now - date) / (1000 * 60 * 60 * 24);
  
  // Bereken recentheid score (nieuwer = hoger)
  // 0 dagen oud = 1, 30 dagen oud = 0.5, 90+ dagen oud = 0
  if (ageInDays <= 30) {
    return 1 - (ageInDays / 60);
  } else if (ageInDays <= 90) {
    return 0.5 - ((ageInDays - 30) / 120);
  } else {
    return 0;
  }
};

/**
 * Berekent een engagement score op basis van likes, shares, etc.
 * @param {Object} insight - Inzicht object
 * @returns {Number} Engagement score (0-1)
 */
const calculateEngagementScore = (insight) => {
  // Als er geen engagement metrics zijn, return 0.5 (gemiddeld)
  if (!insight.engagement && !insight.likes && !insight.shares && !insight.comments) {
    return 0.5;
  }
  
  // Bereken totale engagement
  const likes = insight.likes || 0;
  const shares = insight.shares || 0;
  const comments = insight.comments || 0;
  const views = insight.views || 0;
  
  // Als er een expliciete engagement score is, gebruik deze
  if (insight.engagement !== undefined) {
    // Normaliseer naar 0-1 bereik
    return Math.min(1, insight.engagement / 100);
  }
  
  // Bereken gewogen engagement score
  const totalEngagement = (likes * 1) + (shares * 2) + (comments * 1.5);
  
  // Normaliseer naar 0-1 bereik op basis van views
  if (views > 0) {
    return Math.min(1, totalEngagement / (views * 0.1));
  }
  
  // Als er geen views zijn, normaliseer op basis van absolute waarden
  // 10+ likes, 5+ shares, 7+ comments zou een score van 1 geven
  return Math.min(1, (likes / 10) + (shares / 5) + (comments / 7));
};
