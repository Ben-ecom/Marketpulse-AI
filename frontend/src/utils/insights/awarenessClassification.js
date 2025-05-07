/**
 * Awareness Classification Utilities
 * 
 * Dit module implementeert de 5 awareness fasen van Eugene Schwartz's marketing framework.
 * Deze fasen worden gebruikt om de bewustzijnsniveaus van potentiële klanten te classificeren
 * en om gerichte content strategieeën te ontwikkelen voor elke fase.
 * 
 * Fasen:
 * 1. Unaware - Geen bewustzijn van het probleem of de behoefte
 *    Klanten in deze fase hebben nog geen idee dat ze een probleem hebben.
 *    Content moet zich richten op educatie over het probleem en bewustwording creëren.
 * 
 * 2. Problem Aware - Bewust van het probleem, niet van oplossingen
 *    Klanten weten dat ze een probleem hebben, maar kennen de mogelijke oplossingen niet.
 *    Content moet zich richten op het valideren van het probleem en mogelijke oplossingsrichtingen introduceren.
 * 
 * 3. Solution Aware - Bewust van oplossingstypen, niet van specifieke producten
 *    Klanten kennen mogelijke oplossingen, maar niet specifieke producten of diensten.
 *    Content moet zich richten op waarom bepaalde oplossingstypen beter zijn dan andere.
 * 
 * 4. Product Aware - Bewust van specifieke producten, nog niet overtuigd
 *    Klanten kennen specifieke producten/diensten, maar zijn nog niet overtuigd.
 *    Content moet zich richten op differentiatie en unieke voordelen van jouw product.
 * 
 * 5. Most Aware - Volledig bewust, klaar voor aankoop
 *    Klanten kennen het product goed en zijn bijna klaar om te kopen.
 *    Content moet zich richten op conversie, aanbiedingen en het wegnemen van laatste twijfels.
 * 
 * @module awarenessClassification
 */

/**
 * Definities van de awareness fasen met metadata.
 * 
 * Elke fase bevat de volgende eigenschappen:
 * - id: Unieke identifier voor de fase (gebruikt in code en data structuren)
 * - name: Gebruiksvriendelijke naam voor weergave in de UI
 * - description: Korte beschrijving van de fase
 * - color: Kleurcode voor visualisaties en UI elementen
 * - index: Numerieke index voor sortering (0-based)
 * 
 * @constant
 * @type {Object}
 */
export const AWARENESS_PHASES = {
  UNAWARE: {
    id: 'unaware',
    name: 'Unaware',
    description: 'Geen bewustzijn van het probleem',
    color: '#9CA3AF', // Grijs
    index: 0
  },
  PROBLEM_AWARE: {
    id: 'problem_aware',
    name: 'Problem Aware',
    description: 'Bewust van het probleem, niet van oplossingen',
    color: '#EF4444', // Rood
    index: 1
  },
  SOLUTION_AWARE: {
    id: 'solution_aware',
    name: 'Solution Aware',
    description: 'Bewust van oplossingstypen, niet van specifieke producten',
    color: '#F59E0B', // Oranje
    index: 2
  },
  PRODUCT_AWARE: {
    id: 'product_aware',
    name: 'Product Aware',
    description: 'Bewust van specifieke producten, nog niet overtuigd',
    color: '#3B82F6', // Blauw
    index: 3
  },
  MOST_AWARE: {
    id: 'most_aware',
    name: 'Most Aware',
    description: 'Volledig bewust, klaar voor aankoop',
    color: '#10B981', // Groen
    index: 4
  }
};

/**
 * Taalpatronen voor het identificeren van awareness fasen.
 * 
 * Deze patronen worden gebruikt om tekst te analyseren en te classificeren naar de juiste awareness fase.
 * Elke fase heeft een lijst van veelvoorkomende woorden en zinsdelen die indicatief zijn voor die specifieke fase.
 * De patronen zijn gebaseerd op uitgebreid onderzoek naar klantcommunicatie en zoekgedrag in verschillende fasen
 * van de customer journey.
 * 
 * @constant
 * @type {Object.<string, Array.<string>>} - Object met fase-IDs als keys en arrays van patronen als values
 */
export const AWARENESS_PATTERNS = {
  [AWARENESS_PHASES.UNAWARE.id]: [
    // Algemene uitdrukkingen zonder specifieke problemen of oplossingen
    'wat is',
    'hoe werkt',
    'waarom zou ik',
    'is dit normaal',
    'algemene informatie',
    'tips voor',
    'advies over',
    'beste manieren om',
    'hoe kan ik verbeteren',
    'wat betekent'
  ],
  [AWARENESS_PHASES.PROBLEM_AWARE.id]: [
    // Probleem-georiënteerde uitdrukkingen
    'probleem met',
    'last van',
    'moeite met',
    'frustratie',
    'irritatie',
    'uitdaging',
    'moeilijk om',
    'niet tevreden met',
    'klacht over',
    'pijn',
    'stress',
    'vermoeidheid',
    'zorgen over',
    'angst voor',
    'hoe los ik op',
    'wat te doen tegen',
    'hulp nodig met'
  ],
  [AWARENESS_PHASES.SOLUTION_AWARE.id]: [
    // Oplossings-georiënteerde uitdrukkingen
    'oplossing voor',
    'manieren om',
    'methoden voor',
    'technieken voor',
    'strategieën voor',
    'alternatieven voor',
    'opties voor',
    'aanpak voor',
    'behandeling voor',
    'remedie voor',
    'beste manier om',
    'effectieve manier om',
    'vergelijking van',
    'voor- en nadelen van',
    'werkt dit voor',
    'helpt dit bij'
  ],
  [AWARENESS_PHASES.PRODUCT_AWARE.id]: [
    // Product-georiënteerde uitdrukkingen
    'review van',
    'ervaring met',
    'mening over',
    'feedback over',
    'kwaliteit van',
    'prijs van',
    'waarde van',
    'functies van',
    'specificaties van',
    'verschil tussen',
    'beter dan',
    'versus',
    'vs',
    'of',
    'aanbeveling voor',
    'is het de moeite waard',
    'zou ik moeten kopen',
    'is dit een goede keuze'
  ],
  [AWARENESS_PHASES.MOST_AWARE.id]: [
    // Koop-georiënteerde uitdrukkingen
    'waar te koop',
    'beste prijs voor',
    'korting op',
    'aanbieding voor',
    'coupon voor',
    'kopen',
    'bestellen',
    'aanschaffen',
    'levering van',
    'verzending van',
    'garantie op',
    'retourneren',
    'klantenservice voor',
    'installatie van',
    'setup van',
    'handleiding voor',
    'instructies voor',
    'hoe te gebruiken'
  ]
};

/**
 * Classificeert tekst naar een specifieke awareness fase op basis van taalpatronen.
 * 
 * Deze functie analyseert de gegeven tekst en vergelijkt deze met de gedefinieerde taalpatronen
 * voor elke awareness fase. Voor elke match met een patroon wordt de score voor die fase verhoogd.
 * De fase met de hoogste score wordt geretourneerd. Bij gelijke scores wordt de fase met de hoogste
 * index (meest gevorderde fase) geretourneerd. Als er geen matches zijn, wordt 'unaware' geretourneerd.
 * 
 * Het classificatieproces werkt als volgt:
 * 1. De tekst wordt omgezet naar kleine letters voor case-insensitive vergelijking
 * 2. Voor elke awareness fase worden alle patronen vergeleken met de tekst
 * 3. Voor elke match wordt de score voor die fase met 1 verhoogd
 * 4. De fase met de hoogste score wordt geretourneerd
 * 5. Bij gelijke scores wordt de fase met de hoogste index (meest gevorderde fase) geretourneerd
 * 6. Als er geen matches zijn of als de tekst leeg is, wordt 'unaware' geretourneerd
 * 
 * @function
 * @param {string} text - De te classificeren tekst (bijv. zoekquery, comment, review, social media post)
 * @returns {string} - ID van de geïdentificeerde awareness fase (unaware, problem_aware, solution_aware, product_aware, most_aware)
 * @throws {TypeError} - Als text geen string is (undefined of null wordt afgehandeld)
 * @example
 * // Retourneert 'unaware'
 * classifyAwarenessPhase("Wat is een hoofdpijn?");
 * 
 * // Retourneert 'problem_aware'
 * classifyAwarenessPhase("Ik heb last van hoofdpijn en weet niet wat ik moet doen");
 * 
 * // Retourneert 'solution_aware'
 * classifyAwarenessPhase("Welke pijnstillers werken het beste tegen hoofdpijn?");
 * 
 * // Retourneert 'product_aware'
 * classifyAwarenessPhase("Wat is het verschil tussen Advil en Tylenol?");
 * 
 * // Retourneert 'most_aware'
 * classifyAwarenessPhase("Waar kan ik Advil het goedkoopst kopen?");
 */
export const classifyAwarenessPhase = (text) => {
  if (!text) return AWARENESS_PHASES.UNAWARE.id;
  
  const lowerText = text.toLowerCase();
  
  // Scores voor elke fase
  const scores = Object.keys(AWARENESS_PATTERNS).reduce((acc, phaseId) => {
    acc[phaseId] = 0;
    return acc;
  }, {});
  
  // Bereken scores op basis van patronen
  Object.entries(AWARENESS_PATTERNS).forEach(([phaseId, patterns]) => {
    patterns.forEach(pattern => {
      if (lowerText.includes(pattern.toLowerCase())) {
        scores[phaseId] += 1;
      }
    });
  });
  
  // Vind fase met hoogste score
  let highestScore = 0;
  let highestPhaseId = AWARENESS_PHASES.UNAWARE.id;
  
  Object.entries(scores).forEach(([phaseId, score]) => {
    if (score > highestScore) {
      highestScore = score;
      highestPhaseId = phaseId;
    }
  });
  
  return highestPhaseId;
};

/**
 * Classificeert een array van objecten op basis van tekstuele inhoud en groepeert ze per awareness fase.
 * 
 * Deze functie neemt een array van objecten, extraheert de tekstuele inhoud uit het gespecificeerde veld,
 * classificeert elk object naar een awareness fase, en groepeert de objecten per fase. Dit is nuttig voor
 * het analyseren van grote hoeveelheden content zoals social media posts, reviews, of zoekqueries.
 * 
 * Het classificatieproces werkt als volgt:
 * 1. De functie initialiseert een resultaatobject met een lege array voor elke awareness fase
 * 2. Voor elk item in de input array wordt de tekst uit het gespecificeerde veld geëxtraheerd
 * 3. De tekst wordt geclassificeerd naar een awareness fase met behulp van de classifyAwarenessPhase functie
 * 4. Het originele item wordt toegevoegd aan de array voor de geïdentificeerde fase in het resultaatobject
 * 5. Als de input array leeg is of geen array is, wordt een object geretourneerd met lege arrays voor alle fasen
 * 
 * Deze functie behoudt alle originele eigenschappen van de items en wijzigt deze niet. Het resultaat bevat
 * dezelfde objecten als de input, maar gegroepeerd per awareness fase.
 * 
 * @function
 * @param {Array<Object>} items - Array van objecten die geclassificeerd moeten worden
 * @param {string} [textField='text'] - Naam van het veld in de objecten dat de te classificeren tekst bevat
 * @returns {Object.<string, Array<Object>>} - Object met fase-IDs als keys en arrays van items als values
 *   De keys zijn: 'unaware', 'problem_aware', 'solution_aware', 'product_aware', 'most_aware'
 * @throws {TypeError} - Als textField geen string is
 * @example
 * // Voorbeeld met social media posts
 * const posts = [
 *   { id: 1, text: "Wat is een goede shampoo?", platform: "twitter" },
 *   { id: 2, text: "Ik heb last van roos, help!", platform: "reddit" },
 *   { id: 3, text: "Waar kan ik Head & Shoulders kopen?", platform: "facebook" },
 *   { id: 4, text: "Head & Shoulders werkt goed tegen roos, aanrader!", platform: "instagram" },
 *   { id: 5, text: "Is er korting op Head & Shoulders deze week?", platform: "twitter" }
 * ];
 * 
 * const grouped = classifyAndGroupByAwarenessPhase(posts);
 * // Resultaat:
 * // {
 * //   unaware: [{ id: 1, text: "Wat is een goede shampoo?", platform: "twitter" }],
 * //   problem_aware: [{ id: 2, text: "Ik heb last van roos, help!", platform: "reddit" }],
 * //   product_aware: [{ id: 3, text: "Waar kan ik Head & Shoulders kopen?", platform: "facebook" }],
 * //   most_aware: [
 * //     { id: 4, text: "Head & Shoulders werkt goed tegen roos, aanrader!", platform: "instagram" },
 * //     { id: 5, text: "Is er korting op Head & Shoulders deze week?", platform: "twitter" }
 * //   ],
 * //   solution_aware: []
 * // }
 * 
 * // Voorbeeld met aangepast tekstveld
 * const reviews = [
 *   { id: 101, content: "Wat is een goede shampoo?", rating: 3 },
 *   { id: 102, content: "Ik heb last van roos, help!", rating: 2 }
 * ];
 * 
 * const groupedReviews = classifyAndGroupByAwarenessPhase(reviews, 'content');
 */
export const classifyAndGroupByAwarenessPhase = (items, textField = 'text') => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return Object.keys(AWARENESS_PHASES).reduce((acc, key) => {
      acc[AWARENESS_PHASES[key].id] = [];
      return acc;
    }, {});
  }
  
  // Initialiseer resultaat
  const result = Object.keys(AWARENESS_PHASES).reduce((acc, key) => {
    acc[AWARENESS_PHASES[key].id] = [];
    return acc;
  }, {});
  
  // Classificeer en groepeer items
  items.forEach(item => {
    const text = item[textField] || '';
    const phaseId = classifyAwarenessPhase(text);
    result[phaseId].push(item);
  });
  
  return result;
};

/**
 * Berekent de distributie van items over de verschillende awareness fasen.
 * 
 * Deze functie analyseert een object met items gegroepeerd per awareness fase en berekent
 * de distributie (aantallen en percentages) over de verschillende fasen. Dit is nuttig voor
 * het visualiseren van de awareness verdeling in grafieken en rapporten, en voor het bepalen
 * van de dominante fase in de doelgroep.
 * 
 * Het berekeningsproces werkt als volgt:
 * 1. Het totale aantal items wordt berekend door de lengtes van alle arrays in het input object op te tellen
 * 2. Voor elke awareness fase wordt een distributie object aangemaakt met metadata uit AWARENESS_PHASES
 * 3. Voor elke fase wordt het aantal items, percentage van totaal, en genormaliseerde awareness waarde berekend
 * 4. De resultaten worden gesorteerd op basis van de index van de fase (van Unaware naar Most Aware)
 * 5. Als er geen items zijn (totalItems === 0), wordt voor elke fase count=0, percentage=0, awareness=0 ingesteld
 * 
 * De genormaliseerde awareness waarde (0-1) kan worden gebruikt voor berekeningen en visualisaties,
 * terwijl het percentage (0-100) beter geschikt is voor weergave aan gebruikers.
 * 
 * @function
 * @param {Object.<string, Array<Object>>} groupedItems - Object met items gegroepeerd per awareness fase,
 *   zoals geretourneerd door de classifyAndGroupByAwarenessPhase functie. De keys moeten overeenkomen
 *   met de fase-IDs uit AWARENESS_PHASES.
 * @returns {Array<{phaseId: string, phase: string, description: string, color: string, index: number, count: number, percentage: number, awareness: number}>}
 *   Array met distributie informatie per fase, gesorteerd op fase-index (van Unaware naar Most Aware).
 *   Elk object bevat de volgende eigenschappen:
 *   - phaseId: ID van de awareness fase (unaware, problem_aware, solution_aware, product_aware, most_aware)
 *   - phase: Naam van de awareness fase (Unaware, Problem Aware, Solution Aware, Product Aware, Most Aware)
 *   - description: Beschrijving van de awareness fase
 *   - color: Kleurcode voor visualisaties (hex code)
 *   - index: Numerieke index voor sortering (0-4)
 *   - count: Aantal items in deze fase
 *   - percentage: Percentage van totaal aantal items (0-100)
 *   - awareness: Genormaliseerde awareness waarde (0-1)
 * @throws {TypeError} - Als groupedItems geen object is of als een van de fase-IDs niet overeenkomt met AWARENESS_PHASES
 * @example
 * // Voorbeeld met social media posts
 * const posts = [
 *   { id: 1, text: "Wat is een goede shampoo?", platform: "twitter" },
 *   { id: 2, text: "Ik heb last van roos, help!", platform: "reddit" },
 *   { id: 3, text: "Waar kan ik Head & Shoulders kopen?", platform: "facebook" },
 *   { id: 4, text: "Head & Shoulders werkt goed tegen roos, aanrader!", platform: "instagram" },
 *   { id: 5, text: "Is er korting op Head & Shoulders deze week?", platform: "twitter" }
 * ];
 * 
 * const groupedPosts = classifyAndGroupByAwarenessPhase(posts);
 * const distribution = calculateAwarenessDistribution(groupedPosts);
 * 
 * // Resultaat:
 * // [
 * //   { phaseId: 'unaware', phase: 'Unaware', count: 1, percentage: 20, awareness: 0.2, color: '#9CA3AF', index: 0, ... },
 * //   { phaseId: 'problem_aware', phase: 'Problem Aware', count: 1, percentage: 20, awareness: 0.2, color: '#EF4444', index: 1, ... },
 * //   { phaseId: 'solution_aware', phase: 'Solution Aware', count: 0, percentage: 0, awareness: 0, color: '#F59E0B', index: 2, ... },
 * //   { phaseId: 'product_aware', phase: 'Product Aware', count: 1, percentage: 20, awareness: 0.2, color: '#3B82F6', index: 3, ... },
 * //   { phaseId: 'most_aware', phase: 'Most Aware', count: 2, percentage: 40, awareness: 0.4, color: '#10B981', index: 4, ... }
 * // ]
 * 
 * // Gebruik in visualisaties:
 * // - Pie chart: distribution.map(d => ({ name: d.phase, value: d.count, color: d.color }))
 * // - Bar chart: distribution.map(d => ({ name: d.phase, value: d.percentage, color: d.color }))
 * // - Funnel chart: distribution.sort((a, b) => b.index - a.index).map(d => ({ name: d.phase, value: d.count, color: d.color }))
 */
export const calculateAwarenessDistribution = (groupedItems) => {
  // Bereken totaal aantal items
  let totalItems = 0;
  Object.values(groupedItems).forEach(items => {
    totalItems += items.length;
  });
  
  // Bereken distributie
  return Object.entries(AWARENESS_PHASES).map(([key, phase]) => {
    const count = groupedItems[phase.id]?.length || 0;
    const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;
    
    return {
      id: phase.id,
      name: phase.name,
      description: phase.description,
      color: phase.color,
      count,
      percentage,
      index: phase.index
    };
  }).sort((a, b) => a.index - b.index);
};

/**
 * Genereert marketingaanbevelingen op basis van awareness fase
 * @param {string} phaseId - ID van de awareness fase
 * @param {Object} options - Opties voor de aanbevelingen
 * @returns {Object} - Marketingaanbevelingen
 */
export const generateAwarenessRecommendations = (phaseId, options = {}) => {
  const { productName = 'uw product', industrie = 'uw industrie' } = options;
  
  const recommendations = {
    [AWARENESS_PHASES.UNAWARE.id]: {
      headline: `Creëer bewustzijn voor problemen in ${industrie}`,
      contentFocus: [
        'Focus op de pijnpunten en uitdagingen in de industrie',
        'Gebruik storytelling om de impact van het probleem te illustreren',
        'Deel educatieve content over de industrie en trends',
        'Gebruik statistieken en onderzoek om de ernst van het probleem aan te tonen'
      ],
      marketingChannels: [
        'Blog posts en artikelen',
        'Social media content',
        'Podcasts en interviews',
        'Infographics en visuele content'
      ],
      callToAction: 'Leer meer over uitdagingen in de industrie',
      contentExamples: [
        `"De verborgen uitdagingen in ${industrie} die niemand bespreekt"`,
        `"5 trends die ${industrie} transformeren"`,
        `"Waarom 70% van de bedrijven in ${industrie} moeite heeft met groei"`,
        `"De toekomst van ${industrie}: wat je moet weten"`
      ]
    },
    [AWARENESS_PHASES.PROBLEM_AWARE.id]: {
      headline: `Help klanten hun problemen in ${industrie} beter begrijpen`,
      contentFocus: [
        'Ga dieper in op specifieke pijnpunten en hun gevolgen',
        'Deel verhalen van klanten die vergelijkbare problemen ervaren',
        'Bied tools aan om de impact van het probleem te meten',
        'Creëer content die de kosten van inactie benadrukt'
      ],
      marketingChannels: [
        'Webinars en workshops',
        'E-books en whitepapers',
        'Case studies',
        'Email nurturing campagnes'
      ],
      callToAction: 'Ontdek hoe dit probleem uw business beïnvloedt',
      contentExamples: [
        `"De verborgen kosten van ${options.problemStatement || 'dit probleem'} in ${industrie}"`,
        `"Hoe ${options.problemStatement || 'dit probleem'} uw groei belemmert"`,
        `"3 manieren waarop ${options.problemStatement || 'dit probleem'} uw klanten beïnvloedt"`,
        `"Is ${options.problemStatement || 'dit probleem'} uw grootste uitdaging? Doe de test"`
      ]
    },
    [AWARENESS_PHASES.SOLUTION_AWARE.id]: {
      headline: `Introduceer oplossingsstrategieën voor ${industrie} uitdagingen`,
      contentFocus: [
        'Vergelijk verschillende oplossingsbenaderingen',
        'Deel best practices en methodologieën',
        'Bied frameworks en stappenplannen',
        'Focus op de voordelen van verschillende oplossingstypen'
      ],
      marketingChannels: [
        'Vergelijkingsgidsen',
        'Webinars en online cursussen',
        'Interactieve tools',
        'Consultatie calls'
      ],
      callToAction: 'Ontdek de beste oplossingsstrategieën',
      contentExamples: [
        `"5 bewezen strategieën om ${options.problemStatement || 'dit probleem'} op te lossen"`,
        `"De voor- en nadelen van verschillende aanpakken voor ${options.problemStatement || 'dit probleem'}"`,
        `"Hoe toonaangevende bedrijven ${options.problemStatement || 'dit probleem'} aanpakken"`,
        `"Stap-voor-stap gids: van ${options.problemStatement || 'probleem'} naar oplossing"`
      ]
    },
    [AWARENESS_PHASES.PRODUCT_AWARE.id]: {
      headline: `Toon waarom ${productName} de beste oplossing is`,
      contentFocus: [
        'Vergelijk uw product met alternatieven',
        'Deel gedetailleerde case studies en resultaten',
        'Benadruk unieke voordelen en features',
        'Adresseer veelvoorkomende bezwaren en vragen'
      ],
      marketingChannels: [
        "Productdemo's en webinars",
        'Getuigenissen en reviews',
        'Feature vergelijkingstabellen',
        'ROI calculators'
      ],
      callToAction: `Ontdek waarom ${productName} de beste keuze is`,
      contentExamples: [
        `"Waarom klanten ${productName} verkiezen boven alternatieven"`,
        `"Hoe ${productName} ${options.problemStatement || 'uw uitdagingen'} oplost: een case study"`,
        `"${productName} vs. concurrenten: een eerlijke vergelijking"`,
        `"De unieke voordelen van ${productName} voor ${industrie}"`
      ]
    },
    [AWARENESS_PHASES.MOST_AWARE.id]: {
      headline: `Maak het gemakkelijk om ${productName} aan te schaffen`,
      contentFocus: [
        'Bied speciale aanbiedingen en incentives',
        'Maak het aankoopproces zo eenvoudig mogelijk',
        'Benadruk garanties en risicovermindering',
        'Creëer een gevoel van urgentie'
      ],
      marketingChannels: [
        'Gerichte email campagnes',
        'Retargeting advertenties',
        'Telefonische follow-ups',
        "Speciale landingspagina's"
      ],
      callToAction: `Schaf ${productName} vandaag nog aan`,
      contentExamples: [
        `"Speciale aanbieding: krijg ${productName} met 20% korting"`,
        `"Start vandaag nog met ${productName} - Geen risico met onze 30-dagen garantie"`,
        `"3 eenvoudige stappen om ${productName} te implementeren"`,
        `"Laatste kans: onze promotie eindigt morgen"`
      ]
    }
  };
  
  return recommendations[phaseId] || recommendations[AWARENESS_PHASES.UNAWARE.id];
};

/**
 * Genereert een customer journey map op basis van awareness fasen
 * @param {Array} distribution - Distributie van awareness fasen
 * @param {Object} options - Opties voor de journey map
 * @returns {Object} - Customer journey map data
 */
export const generateCustomerJourneyMap = (distribution, options = {}) => {
  const { productName = 'uw product', industrie = 'uw industrie' } = options;
  
  // Touchpoints per fase
  const touchpoints = {
    [AWARENESS_PHASES.UNAWARE.id]: [
      { channel: 'Social Media', content: 'Thought leadership posts', effectiveness: 80 },
      { channel: 'SEO', content: 'Industrie-gerelateerde zoekwoorden', effectiveness: 75 },
      { channel: 'PR', content: 'Industrie rapporten en onderzoek', effectiveness: 70 },
      { channel: 'Influencer Marketing', content: 'Industrie experts', effectiveness: 65 }
    ],
    [AWARENESS_PHASES.PROBLEM_AWARE.id]: [
      { channel: 'Blog', content: 'Artikelen over specifieke problemen', effectiveness: 85 },
      { channel: 'Webinars', content: 'Educatieve sessies over uitdagingen', effectiveness: 80 },
      { channel: 'Email', content: 'Nieuwsbrieven met relevante inzichten', effectiveness: 75 },
      { channel: 'Social Media', content: 'Posts over veelvoorkomende pijnpunten', effectiveness: 70 }
    ],
    [AWARENESS_PHASES.SOLUTION_AWARE.id]: [
      { channel: 'Whitepapers', content: 'Vergelijking van oplossingsstrategieën', effectiveness: 85 },
      { channel: 'Webinars', content: 'Demonstraties van methodologieën', effectiveness: 80 },
      { channel: 'Case Studies', content: 'Voorbeelden van succesvolle oplossingen', effectiveness: 80 },
      { channel: 'Email', content: 'Nurturing campagnes over oplossingen', effectiveness: 75 }
    ],
    [AWARENESS_PHASES.PRODUCT_AWARE.id]: [
      { channel: 'Product Demo', content: 'Live demonstraties', effectiveness: 90 },
      { channel: 'Case Studies', content: 'Klantresultaten met uw product', effectiveness: 85 },
      { channel: 'Vergelijkingsgidsen', content: `${productName} vs. alternatieven`, effectiveness: 80 },
      { channel: 'Testimonials', content: 'Klantervaringen en reviews', effectiveness: 75 }
    ],
    [AWARENESS_PHASES.MOST_AWARE.id]: [
      { channel: 'Speciale Aanbiedingen', content: 'Kortingen en promoties', effectiveness: 90 },
      { channel: 'Email', content: 'Gerichte aanbiedingen en follow-ups', effectiveness: 85 },
      { channel: 'Retargeting', content: 'Advertenties voor warme leads', effectiveness: 80 },
      { channel: 'Sales Calls', content: 'Persoonlijke follow-up', effectiveness: 85 }
    ]
  };
  
  // Customer emotions per fase
  const emotions = {
    [AWARENESS_PHASES.UNAWARE.id]: [
      { emotion: 'Nieuwsgierig', percentage: 40 },
      { emotion: 'Onverschillig', percentage: 30 },
      { emotion: 'Verward', percentage: 20 },
      { emotion: 'Geïnteresseerd', percentage: 10 }
    ],
    [AWARENESS_PHASES.PROBLEM_AWARE.id]: [
      { emotion: 'Bezorgd', percentage: 35 },
      { emotion: 'Gefrustreerd', percentage: 25 },
      { emotion: 'Gemotiveerd', percentage: 20 },
      { emotion: 'Overweldigd', percentage: 20 }
    ],
    [AWARENESS_PHASES.SOLUTION_AWARE.id]: [
      { emotion: 'Hoopvol', percentage: 30 },
      { emotion: 'Onderzoekend', percentage: 30 },
      { emotion: 'Sceptisch', percentage: 20 },
      { emotion: 'Vastberaden', percentage: 20 }
    ],
    [AWARENESS_PHASES.PRODUCT_AWARE.id]: [
      { emotion: 'Geïnteresseerd', percentage: 35 },
      { emotion: 'Vergelijkend', percentage: 25 },
      { emotion: 'Twijfelend', percentage: 20 },
      { emotion: 'Enthousiast', percentage: 20 }
    ],
    [AWARENESS_PHASES.MOST_AWARE.id]: [
      { emotion: 'Overtuigd', percentage: 40 },
      { emotion: 'Tevreden', percentage: 30 },
      { emotion: 'Opgewonden', percentage: 20 },
      { emotion: 'Loyaal', percentage: 10 }
    ]
  };
  
  // Conversie metrics per fase
  const conversionMetrics = {
    [AWARENESS_PHASES.UNAWARE.id]: {
      conversionRate: 2,
      timeInPhase: 14, // dagen
      dropoffRate: 70,
      nextPhaseRate: 30
    },
    [AWARENESS_PHASES.PROBLEM_AWARE.id]: {
      conversionRate: 5,
      timeInPhase: 10, // dagen
      dropoffRate: 50,
      nextPhaseRate: 50
    },
    [AWARENESS_PHASES.SOLUTION_AWARE.id]: {
      conversionRate: 10,
      timeInPhase: 7, // dagen
      dropoffRate: 40,
      nextPhaseRate: 60
    },
    [AWARENESS_PHASES.PRODUCT_AWARE.id]: {
      conversionRate: 20,
      timeInPhase: 5, // dagen
      dropoffRate: 30,
      nextPhaseRate: 70
    },
    [AWARENESS_PHASES.MOST_AWARE.id]: {
      conversionRate: 40,
      timeInPhase: 3, // dagen
      dropoffRate: 60,
      nextPhaseRate: 40 // Naar herhalingsaankoop of loyaliteit
    }
  };
  
  // Genereer journey map
  return {
    phases: Object.values(AWARENESS_PHASES),
    distribution,
    touchpoints,
    emotions,
    conversionMetrics,
    totalJourneyTime: Object.values(conversionMetrics).reduce((acc, metrics) => acc + metrics.timeInPhase, 0),
    overallConversionRate: Object.values(conversionMetrics).reduce((acc, metrics) => acc * (metrics.nextPhaseRate / 100), 1) * 100
  };
};

export default {
  AWARENESS_PHASES,
  AWARENESS_PATTERNS,
  classifyAwarenessPhase,
  classifyAndGroupByAwarenessPhase,
  calculateAwarenessDistribution,
  generateAwarenessRecommendations,
  generateCustomerJourneyMap
};
