/**
 * Utility functies voor het genereren van aanbevelingssjablonen
 */

/**
 * Genereert aanbevelingen op basis van geïdentificeerde patronen
 * @param {Array} patterns - Array met geïdentificeerde patronen
 * @param {Object} context - Context informatie
 * @returns {Array} Array met gegenereerde aanbevelingen
 */
export const generateRecommendations = (patterns = [], context = {}) => {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    return [];
  }
  
  const recommendations = [];
  
  // Genereer aanbevelingen voor elk patroon
  patterns.forEach(pattern => {
    const patternRecommendations = generateRecommendationsForPattern(pattern, context);
    recommendations.push(...patternRecommendations);
  });
  
  // Verwijder duplicaten
  const uniqueRecommendations = removeDuplicateRecommendations(recommendations);
  
  return uniqueRecommendations;
};

/**
 * Genereert aanbevelingen voor een specifiek patroon
 * @param {Object} pattern - Patroon object
 * @param {Object} context - Context informatie
 * @returns {Array} Array met gegenereerde aanbevelingen
 */
const generateRecommendationsForPattern = (pattern, context) => {
  // Selecteer sjablonen op basis van patroon type
  const templates = getTemplatesForPatternType(pattern.type);
  
  if (!templates || templates.length === 0) {
    return [];
  }
  
  // Genereer aanbevelingen voor elk sjabloon
  return templates.map(template => {
    // Vul sjabloon in met patroon data
    const recommendation = {
      id: generateId(),
      title: fillTemplate(template.title, pattern, context),
      description: fillTemplate(template.description, pattern, context),
      category: template.category,
      type: template.type,
      pattern: pattern,
      steps: template.steps ? template.steps.map(step => fillTemplate(step, pattern, context)) : [],
      impactCategory: template.impactCategory,
      effortCategory: template.effortCategory,
      implementationTime: template.implementationTime,
      businessGoals: template.businessGoals,
      createdAt: new Date().toISOString()
    };
    
    return recommendation;
  });
};

/**
 * Genereert een unieke ID voor een aanbeveling
 * @returns {String} Unieke ID
 */
const generateId = () => {
  return 'rec_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Vult een sjabloon in met patroon data
 * @param {String} template - Sjabloon tekst
 * @param {Object} pattern - Patroon object
 * @param {Object} context - Context informatie
 * @returns {String} Ingevulde sjabloon tekst
 */
const fillTemplate = (template, pattern, context) => {
  if (!template) return '';
  
  let result = template;
  
  // Vervang patroon variabelen
  if (pattern) {
    Object.entries(pattern).forEach(([key, value]) => {
      // Skip complexe objecten
      if (typeof value === 'object' && value !== null) return;
      
      const placeholder = `{pattern.${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Speciale gevallen voor complexe patroon eigenschappen
    if (pattern.competitors && Array.isArray(pattern.competitors)) {
      const competitorNames = pattern.competitors.map(c => c.name).join(', ');
      result = result.replace(/{pattern.competitorNames}/g, competitorNames);
    }
    
    if (pattern.categories && Array.isArray(pattern.categories)) {
      const categoryNames = pattern.categories.map(c => c.category).join(', ');
      result = result.replace(/{pattern.categoryNames}/g, categoryNames);
    }
    
    if (pattern.features && Array.isArray(pattern.features)) {
      const featureNames = pattern.features.map(f => f.feature).join(', ');
      result = result.replace(/{pattern.featureNames}/g, featureNames);
    }
    
    if (pattern.gaps && Array.isArray(pattern.gaps)) {
      const gapNames = pattern.gaps.join(', ');
      result = result.replace(/{pattern.gapNames}/g, gapNames);
    }
  }
  
  // Vervang context variabelen
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      // Skip complexe objecten
      if (typeof value === 'object' && value !== null) return;
      
      const placeholder = `{context.${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Speciale gevallen voor complexe context eigenschappen
    if (context.project && context.project.name) {
      result = result.replace(/{context.projectName}/g, context.project.name);
    }
    
    if (context.businessGoals && Array.isArray(context.businessGoals)) {
      const goalNames = context.businessGoals.join(', ');
      result = result.replace(/{context.businessGoalNames}/g, goalNames);
    }
  }
  
  return result;
};

/**
 * Verwijdert duplicaten uit een lijst met aanbevelingen
 * @param {Array} recommendations - Array met aanbevelingen
 * @returns {Array} Array met unieke aanbevelingen
 */
const removeDuplicateRecommendations = (recommendations) => {
  const uniqueTitles = new Set();
  return recommendations.filter(recommendation => {
    const title = recommendation.title.toLowerCase();
    if (uniqueTitles.has(title)) {
      return false;
    }
    uniqueTitles.add(title);
    return true;
  });
};

/**
 * Haalt sjablonen op voor een specifiek patroon type
 * @param {String} patternType - Type patroon
 * @returns {Array} Array met sjablonen
 */
const getTemplatesForPatternType = (patternType) => {
  // Sjablonen voor verschillende patroon types
  const templateMap = {
    // Sentiment patronen
    'dominant_sentiment': [
      {
        title: "Optimaliseer content strategie voor {pattern.category} sentiment",
        description: "Uit analyse blijkt dat {pattern.category} sentiment dominant is met {pattern.percentage}%. Pas je content strategie hierop aan om dit te {pattern.category === 'positive' ? 'versterken' : 'verbeteren'}.",
        category: "content",
        type: "strategic",
        impactCategory: "customer_satisfaction",
        effortCategory: "medium",
        implementationTime: "weeks",
        businessGoals: ["engagement", "brand_perception"],
        steps: [
          "Analyseer content die {pattern.category === 'positive' ? 'positief' : 'negatief'} sentiment genereert",
          "Identificeer gemeenschappelijke thema's en elementen",
          "Ontwikkel content richtlijnen op basis van deze inzichten",
          "Train content team in nieuwe richtlijnen",
          "Implementeer A/B tests om effectiviteit te meten"
        ]
      },
      {
        title: "Ontwikkel gerichte {pattern.category === 'negative' ? 'herstel' : 'versterkings'} campagne",
        description: "Met {pattern.percentage}% {pattern.category} sentiment, is er een kans om een gerichte campagne te ontwikkelen die {pattern.category === 'negative' ? 'negatieve percepties aanpakt' : 'positieve associaties versterkt'}.",
        category: "marketing",
        type: "tactical",
        impactCategory: "brand_awareness",
        effortCategory: "medium",
        implementationTime: "weeks",
        businessGoals: ["brand_perception", "customer_acquisition"],
        steps: [
          "Identificeer specifieke {pattern.category === 'negative' ? 'pijnpunten' : 'sterke punten'} in klantfeedback",
          "Ontwikkel campagneboodschap die hierop inspeelt",
          "Creëer content voor verschillende kanalen",
          "Lanceer campagne met duidelijke KPI's",
          "Meet sentiment verandering na campagne"
        ]
      }
    ],
    
    'platform_sentiment_deviation': [
      {
        title: "Optimaliseer {pattern.platform} strategie voor verbeterd sentiment",
        description: "Op {pattern.platform} is het sentiment {pattern.percentage}% {pattern.category}, wat {Math.abs(pattern.difference).toFixed(1)}% {pattern.difference > 0 ? 'hoger' : 'lager'} is dan gemiddeld. Pas je strategie aan voor dit platform.",
        category: "social_media",
        type: "tactical",
        impactCategory: "customer_satisfaction",
        effortCategory: "low",
        implementationTime: "weeks",
        businessGoals: ["engagement", "brand_perception"],
        steps: [
          "Analyseer {pattern.platform} content met {pattern.category} sentiment",
          "Identificeer platform-specifieke factoren die sentiment beïnvloeden",
          "Ontwikkel aangepaste content richtlijnen voor {pattern.platform}",
          "Test nieuwe content aanpak",
          "Monitor sentiment verandering"
        ]
      },
      {
        title: "Herzie {pattern.platform} engagement strategie",
        description: "{pattern.platform} toont afwijkend {pattern.category} sentiment ({pattern.difference > 0 ? 'hoger' : 'lager'} dan gemiddeld). Herzie je engagement aanpak op dit platform.",
        category: "social_media",
        type: "operational",
        impactCategory: "customer_satisfaction",
        effortCategory: "low",
        implementationTime: "days",
        businessGoals: ["engagement"],
        steps: [
          "Analyseer huidige engagement praktijken op {pattern.platform}",
          "Vergelijk met best practices in de industrie",
          "Ontwikkel verbeterde reactieprotocollen",
          "Train team in nieuwe engagement aanpak",
          "Implementeer en monitor resultaten"
        ]
      }
    ],
    
    'sentiment_trend': [
      {
        title: "Reageer op {pattern.direction === 'increasing' ? 'stijgende' : 'dalende'} {pattern.category} sentiment trend",
        description: "{pattern.category.charAt(0).toUpperCase() + pattern.category.slice(1)} sentiment is {pattern.direction === 'increasing' ? 'toegenomen' : 'afgenomen'} met {Math.abs(pattern.changePercentage).toFixed(1)}%. Ontwikkel een strategie om hierop in te spelen.",
        category: "strategic",
        type: "tactical",
        impactCategory: "customer_satisfaction",
        effortCategory: "medium",
        implementationTime: "weeks",
        businessGoals: ["brand_perception"],
        steps: [
          "Analyseer factoren die bijdragen aan de {pattern.direction === 'increasing' ? 'stijging' : 'daling'} in {pattern.category} sentiment",
          "Identificeer specifieke content of productelementen die dit veroorzaken",
          "Ontwikkel een actieplan om de trend te {pattern.direction === 'increasing' && pattern.category !== 'negative' ? 'versterken' : 'keren'}",
          "Implementeer gerichte verbeteringen",
          "Monitor sentiment verandering na implementatie"
        ]
      },
      {
        title: "{pattern.direction === 'increasing' && pattern.category !== 'negative' ? 'Versterk' : 'Keer'} {pattern.category} sentiment trend met gerichte campagne",
        description: "Er is een {pattern.direction === 'increasing' ? 'stijgende' : 'dalende'} trend in {pattern.category} sentiment ({Math.abs(pattern.changePercentage).toFixed(1)}%). Lanceer een campagne om hierop in te spelen.",
        category: "marketing",
        type: "tactical",
        impactCategory: "brand_awareness",
        effortCategory: "medium",
        implementationTime: "weeks",
        businessGoals: ["brand_perception", "customer_acquisition"],
        steps: [
          "Onderzoek oorzaken van sentiment verandering",
          "Ontwikkel campagneboodschap die inspeelt op de trend",
          "Creëer content voor verschillende kanalen",
          "Lanceer campagne met duidelijke KPI's",
          "Meet sentiment verandering na campagne"
        ]
      }
    ],
    
    // Competitor patronen
    'dominant_competitors': [
      {
        title: "Ontwikkel differentiatiestrategie t.o.v. {pattern.competitors[0].name}",
        description: "{pattern.competitors[0].name} is dominant in de markt met {pattern.competitors[0].percentage.toFixed(1)}% marktaandeel. Ontwikkel een duidelijke differentiatiestrategie.",
        category: "strategic",
        type: "strategic",
        impactCategory: "market_share",
        effortCategory: "high",
        implementationTime: "months",
        businessGoals: ["market_position", "competitive_advantage"],
        steps: [
          "Voer diepgaande concurrentieanalyse uit van {pattern.competitors[0].name}",
          "Identificeer zwakke punten en gaten in hun aanbod",
          "Bepaal unieke waardepropositie die hierop inspeelt",
          "Ontwikkel marketingboodschap die differentiatie benadrukt",
          "Implementeer strategie over alle kanalen"
        ]
      },
      {
        title: "Ontwikkel nichestrategie om dominante spelers te omzeilen",
        description: "Met {pattern.competitors.map(c => c.name).join(', ')} als dominante spelers, focus op een nichestrategie voor groei.",
        category: "strategic",
        type: "strategic",
        impactCategory: "market_share",
        effortCategory: "medium",
        implementationTime: "months",
        businessGoals: ["market_position", "customer_acquisition"],
        steps: [
          "Identificeer ondergeserveerde niches in de markt",
          "Onderzoek klantbehoeften in deze niches",
          "Ontwikkel aangepast aanbod voor de gekozen niche",
          "Creëer gerichte marketingcampagne",
          "Meet resultaten en verfijn strategie"
        ]
      }
    ],
    
    'price_outliers': [
      {
        title: "Herzie prijsstrategie in relatie tot {pattern.outliers[0].name}",
        description: "{pattern.outliers[0].name} heeft een {pattern.outliers[0].position} prijspositie in de markt. Herzie je eigen prijsstrategie om hierop in te spelen.",
        category: "pricing",
        type: "strategic",
        impactCategory: "revenue",
        effortCategory: "medium",
        implementationTime: "weeks",
        businessGoals: ["profitability", "market_position"],
        steps: [
          "Analyseer prijselasticiteit in je markt",
          "Onderzoek waardeperceptie van klanten",
          "Ontwikkel prijsstrategie die zich {pattern.outliers[0].position === 'premium' ? 'onderscheidt van' : 'positioneert tegen'} {pattern.outliers[0].name}",
          "Test nieuwe prijspunten met A/B tests",
          "Implementeer en monitor impact op conversie en omzet"
        ]
      },
      {
        title: "Ontwikkel waardecommunicatiestrategie t.o.v. {pattern.outliers[0].position} concurrenten",
        description: "Met {pattern.outliers.map(o => o.name).join(', ')} als {pattern.outliers[0].position} geprijsde concurrenten, verbeter je waardecommunicatie.",
        category: "marketing",
        type: "tactical",
        impactCategory: "conversion_rate",
        effortCategory: "low",
        implementationTime: "weeks",
        businessGoals: ["conversion_optimization", "customer_acquisition"],
        steps: [
          "Analyseer huidige waardecommunicatie",
          "Identificeer unieke waarde-elementen van je product",
          "Ontwikkel boodschap die prijs-kwaliteitverhouding benadrukt",
          "Implementeer op website en in marketingmaterialen",
          "Test effectiviteit met A/B tests"
        ]
      }
    ],
    
    'unique_features': [
      {
        title: "Ontwikkel concurrentiestrategie op basis van unieke features",
        description: "Er zijn unieke features geïdentificeerd in de markt: {pattern.features.map(f => f.feature).join(', ')}. Ontwikkel een strategie om hierop in te spelen.",
        category: "product",
        type: "strategic",
        impactCategory: "market_share",
        effortCategory: "high",
        implementationTime: "months",
        businessGoals: ["product_development", "competitive_advantage"],
        steps: [
          "Analyseer de waarde van de unieke features voor klanten",
          "Bepaal welke features te ontwikkelen of te verbeteren",
          "Prioriteer feature ontwikkeling op basis van impact en effort",
          "Ontwikkel roadmap voor implementatie",
          "Communiceer verbeteringen naar de markt"
        ]
      },
      {
        title: "Versterk marketingboodschap met onderscheidende features",
        description: "Concurrenten hebben unieke features: {pattern.features.map(f => f.feature).join(', ')}. Versterk je eigen marketingboodschap met onderscheidende elementen.",
        category: "marketing",
        type: "tactical",
        impactCategory: "conversion_rate",
        effortCategory: "low",
        implementationTime: "weeks",
        businessGoals: ["brand_perception", "conversion_optimization"],
        steps: [
          "Identificeer je eigen unieke features en voordelen",
          "Ontwikkel marketingboodschap die deze benadrukt",
          "Herzie website en marketingmaterialen",
          "Train verkoopteam in nieuwe boodschap",
          "Monitor impact op conversie en klantfeedback"
        ]
      }
    ],
    
    'feature_gaps': [
      {
        title: "Vul feature gaps om concurrentiepositie te versterken",
        description: "Er zijn feature gaps geïdentificeerd: {pattern.gaps.join(', ')}. Implementeer deze om je concurrentiepositie te versterken.",
        category: "product",
        type: "strategic",
        impactCategory: "market_share",
        effortCategory: "high",
        implementationTime: "months",
        businessGoals: ["product_development", "competitive_advantage"],
        steps: [
          "Prioriteer feature gaps op basis van klantwaarde",
          "Onderzoek technische haalbaarheid en resources",
          "Ontwikkel implementatieplan met tijdlijn",
          "Implementeer features in fases",
          "Communiceer nieuwe features naar klanten"
        ]
      },
      {
        title: "Ontwikkel marketingstrategie rond feature pariteit",
        description: "Feature gaps in de markt: {pattern.gaps.join(', ')}. Ontwikkel een marketingstrategie die feature pariteit of alternatieven benadrukt.",
        category: "marketing",
        type: "tactical",
        impactCategory: "conversion_rate",
        effortCategory: "low",
        implementationTime: "weeks",
        businessGoals: ["brand_perception", "conversion_optimization"],
        steps: [
          "Analyseer hoe concurrenten deze features promoten",
          "Identificeer alternatieve features of voordelen in je product",
          "Ontwikkel boodschap die je sterke punten benadrukt",
          "Implementeer in marketingmaterialen",
          "Monitor klantfeedback en pas aan indien nodig"
        ]
      }
    ],
    
    // Audience patronen
    'dominant_pain_points': [
      {
        title: "Ontwikkel oplossingen voor dominante pijnpunten",
        description: "Dominante pijnpunten in de doelgroep: {pattern.categories.map(c => c.category).join(', ')}. Ontwikkel gerichte oplossingen hiervoor.",
        category: "product",
        type: "strategic",
        impactCategory: "customer_satisfaction",
        effortCategory: "high",
        implementationTime: "months",
        businessGoals: ["product_development", "customer_retention"],
        steps: [
          "Analyseer de specifieke aspecten van elk pijnpunt",
          "Brainstorm over potentiële oplossingen",
          "Prioriteer oplossingen op basis van impact en haalbaarheid",
          "Ontwikkel implementatieplan",
          "Test oplossingen met klanten en verfijn"
        ]
      },
      {
        title: "Creëer content die inspeelt op pijnpunten",
        description: "Met {pattern.categories.map(c => c.category).join(', ')} als dominante pijnpunten, ontwikkel content die hierop inspeelt.",
        category: "content",
        type: "tactical",
        impactCategory: "engagement",
        effortCategory: "low",
        implementationTime: "weeks",
        businessGoals: ["engagement", "lead_generation"],
        steps: [
          "Ontwikkel contentplan rond elk pijnpunt",
          "Creëer blog posts, video's en social media content",
          "Optimaliseer voor SEO met relevante keywords",
          "Promoot content via relevante kanalen",
          "Monitor engagement en conversie"
        ]
      }
    ],
    
    'dominant_desires': [
      {
        title: "Ontwikkel productfuncties die inspelen op klantverlangens",
        description: "Dominante verlangens in de doelgroep: {pattern.categories.map(c => c.category).join(', ')}. Ontwikkel productfuncties die hierop inspelen.",
        category: "product",
        type: "strategic",
        impactCategory: "customer_satisfaction",
        effortCategory: "high",
        implementationTime: "months",
        businessGoals: ["product_development", "customer_acquisition"],
        steps: [
          "Analyseer specifieke aspecten van elk verlangen",
          "Brainstorm over productfuncties die hierop inspelen",
          "Prioriteer functies op basis van impact en haalbaarheid",
          "Ontwikkel implementatieplan",
          "Test nieuwe functies met klanten en verfijn"
        ]
      },
      {
        title: "Versterk marketingboodschap met focus op klantverlangens",
        description: "Met {pattern.categories.map(c => c.category).join(', ')} als dominante verlangens, herzie je marketingboodschap.",
        category: "marketing",
        type: "tactical",
        impactCategory: "conversion_rate",
        effortCategory: "low",
        implementationTime: "weeks",
        businessGoals: ["brand_perception", "conversion_optimization"],
        steps: [
          "Herzie huidige marketingboodschap",
          "Ontwikkel nieuwe boodschap die verlangens centraal stelt",
          "Update website en marketingmaterialen",
          "Train verkoopteam in nieuwe boodschap",
          "Test effectiviteit met A/B tests"
        ]
      }
    ],
    
    'demographic_pattern': [
      {
        title: "Optimaliseer targeting voor dominante {pattern.demographic}",
        description: "Dominante {pattern.demographic}: {pattern.value} ({pattern.percentage.toFixed(1)}%). Pas je targeting strategie hierop aan.",
        category: "marketing",
        type: "tactical",
        impactCategory: "conversion_rate",
        effortCategory: "low",
        implementationTime: "weeks",
        businessGoals: ["customer_acquisition", "marketing_efficiency"],
        steps: [
          "Verfijn doelgroepsegmentatie in advertentieplatforms",
          "Pas advertentie-content aan voor deze demografische groep",
          "Optimaliseer mediakanalen op basis van demografische voorkeuren",
          "Test verschillende boodschappen voor deze groep",
          "Monitor resultaten en optimaliseer continu"
        ]
      },
      {
        title: "Ontwikkel demografisch gerichte content strategie",
        description: "Met {pattern.value} als dominante {pattern.demographic} ({pattern.percentage.toFixed(1)}%), creëer gerichte content.",
        category: "content",
        type: "tactical",
        impactCategory: "engagement",
        effortCategory: "medium",
        implementationTime: "weeks",
        businessGoals: ["engagement", "brand_perception"],
        steps: [
          "Onderzoek content voorkeuren van de demografische groep",
          "Ontwikkel content thema's en formats die aansluiten",
          "Creëer content kalender met gerichte content",
          "Distribueer via relevante kanalen",
          "Meet engagement en pas strategie aan"
        ]
      }
    ]
  };
  
  return templateMap[patternType] || [];
};

/**
 * Genereert een aanbevelingsrapport op basis van een lijst met aanbevelingen
 * @param {Array} recommendations - Array met aanbevelingen
 * @param {Object} options - Opties voor het rapport
 * @returns {Object} Rapport object
 */
export const generateRecommendationReport = (recommendations = [], options = {}) => {
  const {
    projectName = 'MarketPulse AI Analyse',
    date = new Date().toLocaleDateString('nl-NL'),
    includeSteps = true,
    includePatterns = false,
    maxRecommendations = 10
  } = options;
  
  // Beperk aantal aanbevelingen indien nodig
  const limitedRecommendations = recommendations.slice(0, maxRecommendations);
  
  // Groepeer aanbevelingen per categorie
  const categorizedRecommendations = limitedRecommendations.reduce((acc, recommendation) => {
    const category = recommendation.category || 'general';
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(recommendation);
    
    return acc;
  }, {});
  
  // Genereer rapport
  return {
    title: `Aanbevelingsrapport: ${projectName}`,
    date,
    summary: `Dit rapport bevat ${limitedRecommendations.length} aanbevelingen op basis van data-analyse.`,
    categories: Object.entries(categorizedRecommendations).map(([category, recs]) => ({
      name: formatCategoryName(category),
      recommendations: recs.map(rec => ({
        title: rec.title,
        description: rec.description,
        priority: rec.priority || 'medium',
        steps: includeSteps ? rec.steps : undefined,
        pattern: includePatterns ? rec.pattern : undefined
      }))
    }))
  };
};

/**
 * Formatteert een categorienaam voor weergave
 * @param {String} category - Categorienaam
 * @returns {String} Geformatteerde categorienaam
 */
const formatCategoryName = (category) => {
  const categoryMap = {
    'content': 'Content Strategie',
    'marketing': 'Marketing',
    'product': 'Product Ontwikkeling',
    'pricing': 'Prijsstrategie',
    'social_media': 'Social Media',
    'strategic': 'Strategische Initiatieven',
    'general': 'Algemene Aanbevelingen'
  };
  
  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
};
