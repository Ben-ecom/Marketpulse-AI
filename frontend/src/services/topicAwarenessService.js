/**
 * Topic Awareness Service
 * 
 * Deze service biedt functies voor het ophalen van topic awareness data.
 * In een productieomgeving zouden deze functies API calls maken naar de backend,
 * maar voor demonstratiedoeleinden gebruiken we hier mock data.
 */

// Mock data voor topics per fase
const mockTopicsByPhase = {
  unaware: [
    { name: 'digitale transformatie', relevance: 0.92, frequency: 245, growth: 0.08, sentiment: 0.3 },
    { name: 'marktonderzoek', relevance: 0.88, frequency: 198, growth: 0.05, sentiment: 0.4 },
    { name: 'data analyse', relevance: 0.85, frequency: 176, growth: 0.12, sentiment: 0.6 },
    { name: 'industrie trends', relevance: 0.82, frequency: 145, growth: 0.03, sentiment: 0.2 },
    { name: 'concurrentieanalyse', relevance: 0.79, frequency: 132, growth: -0.01, sentiment: 0.1 }
  ],
  problem_aware: [
    { name: 'klantinzichten', relevance: 0.94, frequency: 267, growth: 0.15, sentiment: 0.2 },
    { name: 'doelgroepanalyse', relevance: 0.91, frequency: 234, growth: 0.09, sentiment: 0.3 },
    { name: 'marktonderzoek methoden', relevance: 0.87, frequency: 189, growth: 0.07, sentiment: 0.4 },
    { name: 'consumentengedrag', relevance: 0.85, frequency: 167, growth: 0.06, sentiment: 0.1 },
    { name: 'markttrends', relevance: 0.82, frequency: 154, growth: 0.04, sentiment: 0.2 }
  ],
  solution_aware: [
    { name: 'MarketPulse AI', relevance: 0.95, frequency: 312, growth: 0.18, sentiment: 0.7 },
    { name: 'AI marktanalyse', relevance: 0.92, frequency: 278, growth: 0.14, sentiment: 0.6 },
    { name: 'data-gedreven besluitvorming', relevance: 0.89, frequency: 245, growth: 0.11, sentiment: 0.5 },
    { name: 'automatische marktanalyse', relevance: 0.86, frequency: 213, growth: 0.08, sentiment: 0.4 },
    { name: 'topic awareness analyse', relevance: 0.84, frequency: 187, growth: 0.09, sentiment: 0.5 }
  ],
  product_aware: [
    { name: 'MarketPulse AI platform', relevance: 0.96, frequency: 345, growth: 0.22, sentiment: 0.8 },
    { name: 'MarketPulse AI features', relevance: 0.93, frequency: 298, growth: 0.17, sentiment: 0.7 },
    { name: 'MarketPulse AI prijzen', relevance: 0.91, frequency: 267, growth: 0.12, sentiment: 0.3 },
    { name: 'MarketPulse AI vs concurrentie', relevance: 0.88, frequency: 234, growth: 0.09, sentiment: 0.5 },
    { name: 'MarketPulse AI implementatie', relevance: 0.85, frequency: 198, growth: 0.07, sentiment: 0.4 }
  ],
  most_aware: [
    { name: 'MarketPulse AI case studies', relevance: 0.97, frequency: 378, growth: 0.25, sentiment: 0.9 },
    { name: 'MarketPulse AI ROI', relevance: 0.95, frequency: 345, growth: 0.21, sentiment: 0.8 },
    { name: 'MarketPulse AI integraties', relevance: 0.92, frequency: 312, growth: 0.18, sentiment: 0.7 },
    { name: 'MarketPulse AI support', relevance: 0.89, frequency: 287, growth: 0.14, sentiment: 0.6 },
    { name: 'MarketPulse AI updates', relevance: 0.87, frequency: 256, growth: 0.11, sentiment: 0.7 }
  ]
};

// Mock data voor awareness distributie
const mockAwarenessDistribution = [
  { phaseId: 'unaware', phase: 'Unaware', awareness: 0.15, count: 145, color: '#9CA3AF' },
  { phaseId: 'problem_aware', phase: 'Problem Aware', awareness: 0.25, count: 245, color: '#60A5FA' },
  { phaseId: 'solution_aware', phase: 'Solution Aware', awareness: 0.30, count: 298, color: '#34D399' },
  { phaseId: 'product_aware', phase: 'Product Aware', awareness: 0.20, count: 198, color: '#FBBF24' },
  { phaseId: 'most_aware', phase: 'Most Aware', awareness: 0.10, count: 98, color: '#F87171' }
];

// Mock data voor content aanbevelingen
const mockContentRecommendations = {
  unaware: [
    { 
      phase: 'Unaware', 
      contentIdeas: [
        'Blogpost over de laatste trends in digitale transformatie',
        'Infographic over de waarde van data-gedreven besluitvorming',
        'Whitepaper over de toekomst van marktonderzoek',
        'Podcast over de uitdagingen van moderne marktanalyse'
      ], 
      channels: ['Blog', 'Social media', 'Email nieuwsbrief'], 
      callToAction: 'Lees meer',
      contentTypes: ['Blog', 'Infographic', 'Whitepaper', 'Podcast'],
      tone: 'Informatief en educatief'
    }
  ],
  problem_aware: [
    { 
      phase: 'Problem Aware', 
      contentIdeas: [
        'Case study over hoe bedrijven worstelen met marktinzichten',
        'Webinar over de uitdagingen van traditioneel marktonderzoek',
        'Checklist voor het evalueren van uw huidige marktonderzoeksproces',
        'E-book over veelvoorkomende problemen bij doelgroepanalyse'
      ], 
      channels: ['Webinar', 'Email marketing', 'LinkedIn'], 
      callToAction: 'Ontdek meer',
      contentTypes: ['Case study', 'Webinar', 'Checklist', 'E-book'],
      tone: 'Empathisch en probleemgericht'
    }
  ],
  solution_aware: [
    { 
      phase: 'Solution Aware', 
      contentIdeas: [
        'Vergelijkingsgids voor marktanalyse oplossingen',
        'Webinar over de voordelen van AI in marktonderzoek',
        'Demo video van MarketPulse AI functionaliteiten',
        'Blogpost over hoe AI marktonderzoek transformeert'
      ], 
      channels: ['Webinar', 'YouTube', 'Product pagina'], 
      callToAction: 'Vergelijk oplossingen',
      contentTypes: ['Vergelijkingsgids', 'Webinar', 'Video', 'Blog'],
      tone: 'Informatief en oplossingsgericht'
    }
  ],
  product_aware: [
    { 
      phase: 'Product Aware', 
      contentIdeas: [
        'Gedetailleerde productdemo van MarketPulse AI',
        'Prijsvergelijking met concurrerende oplossingen',
        'Feature overview van het MarketPulse AI platform',
        'Implementatiegids voor MarketPulse AI'
      ], 
      channels: ['Product pagina', 'Email', 'Retargeting ads'], 
      callToAction: 'Probeer gratis',
      contentTypes: ['Demo', 'Prijsoverzicht', 'Feature guide', 'Implementatiegids'],
      tone: 'Overtuigend en productgericht'
    }
  ],
  most_aware: [
    { 
      phase: 'Most Aware', 
      contentIdeas: [
        'Klantcase studies met ROI berekeningen',
        'Geavanceerde tips & tricks voor MarketPulse AI',
        'Webinar over integratiemogelijkheden',
        'Nieuwsbrief over product updates en nieuwe features'
      ], 
      channels: ['Email', 'Klantenportaal', 'Webinar'], 
      callToAction: 'Upgrade nu',
      contentTypes: ['Case study', 'Tutorial', 'Webinar', 'Nieuwsbrief'],
      tone: 'Ondersteunend en waardetoevoegend'
    }
  ]
};

// Mock data voor trending topics
const mockTrendingTopics = [
  { 
    topic: 'AI marktanalyse', 
    trendingScore: 0.95, 
    frequency: 345, 
    growth: 0.22,
    relevantPhases: ['solution_aware', 'product_aware']
  },
  { 
    topic: 'topic awareness', 
    trendingScore: 0.92, 
    frequency: 312, 
    growth: 0.18,
    relevantPhases: ['problem_aware', 'solution_aware']
  },
  { 
    topic: 'MarketPulse AI', 
    trendingScore: 0.90, 
    frequency: 298, 
    growth: 0.15,
    relevantPhases: ['solution_aware', 'product_aware', 'most_aware']
  },
  { 
    topic: 'data-gedreven marketing', 
    trendingScore: 0.87, 
    frequency: 267, 
    growth: 0.12,
    relevantPhases: ['unaware', 'problem_aware']
  },
  { 
    topic: 'klantinzichten', 
    trendingScore: 0.85, 
    frequency: 245, 
    growth: 0.10,
    relevantPhases: ['problem_aware', 'solution_aware']
  }
];

/**
 * Haalt topics op gegroepeerd per awareness fase
 * 
 * @param {string} dataSource - De databron (all, social, blog, etc.)
 * @param {Object} dateRange - Het datumbereik { startDate, endDate }
 * @returns {Promise<Object>} - Object met topics per fase
 */
export const fetchTopicsByPhase = async (dataSource, dateRange) => {
  // Simuleer API call met een kleine vertraging
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In een echte implementatie zou hier filtering op basis van dataSource en dateRange plaatsvinden
  return mockTopicsByPhase;
};

/**
 * Haalt awareness distributie data op
 * 
 * @param {string} dataSource - De databron (all, social, blog, etc.)
 * @param {Object} dateRange - Het datumbereik { startDate, endDate }
 * @returns {Promise<Array>} - Array met awareness distributie data
 */
export const fetchAwarenessDistribution = async (dataSource, dateRange) => {
  // Simuleer API call met een kleine vertraging
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // In een echte implementatie zou hier filtering op basis van dataSource en dateRange plaatsvinden
  return mockAwarenessDistribution;
};

/**
 * Haalt content aanbevelingen op per awareness fase
 * 
 * @param {string} dataSource - De databron (all, social, blog, etc.)
 * @param {Object} dateRange - Het datumbereik { startDate, endDate }
 * @returns {Promise<Object>} - Object met content aanbevelingen per fase
 */
export const fetchContentRecommendations = async (dataSource, dateRange) => {
  // Simuleer API call met een kleine vertraging
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // In een echte implementatie zou hier filtering op basis van dataSource en dateRange plaatsvinden
  return mockContentRecommendations;
};

/**
 * Haalt trending topics data op
 * 
 * @param {string} dataSource - De databron (all, social, blog, etc.)
 * @param {Object} dateRange - Het datumbereik { startDate, endDate }
 * @returns {Promise<Array>} - Array met trending topics data
 */
export const fetchTrendingTopics = async (dataSource, dateRange) => {
  // Simuleer API call met een kleine vertraging
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In een echte implementatie zou hier filtering op basis van dataSource en dateRange plaatsvinden
  return mockTrendingTopics;
};

/**
 * Haalt tijdreeks data op voor trend analyse
 * 
 * @param {Object} options - Opties voor de data ophaling
 * @param {string} options.dataSource - Databron (reddit, amazon, instagram, trustpilot, all)
 * @param {string} options.startDate - Startdatum in YYYY-MM-DD formaat
 * @param {string} options.endDate - Einddatum in YYYY-MM-DD formaat
 * @returns {Promise<Array>} - Promise met tijdreeks data
 */
export const fetchTimeSeriesData = async ({ dataSource = 'all', startDate, endDate } = {}) => {
  // Simuleer API call met timeout
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Genereer mock tijdreeks data voor de afgelopen 30 dagen
  const data = [];
  const today = new Date();
  const startDateObj = startDate ? new Date(startDate) : new Date(today - 30 * 24 * 60 * 60 * 1000);
  const endDateObj = endDate ? new Date(endDate) : today;
  
  // Genereer een array van datums tussen startDate en endDate
  const dates = [];
  let currentDate = new Date(startDateObj);
  while (currentDate <= endDateObj) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Genereer data voor elke topic en datum
  const topics = [
    'Product kwaliteit',
    'Prijs-kwaliteitverhouding',
    'Klantenservice',
    'Gebruiksgemak',
    'Betrouwbaarheid',
    'Duurzaamheid',
    'Innovatie',
    'Verzending',
    'Retourbeleid',
    'Garantie'
  ];
  
  // Filter topics op basis van dataSource
  let filteredTopics = [...topics];
  if (dataSource !== 'all') {
    // Simuleer verschillende topics per databron
    if (dataSource === 'reddit') {
      filteredTopics = topics.filter((_, index) => index % 3 === 0);
    } else if (dataSource === 'amazon') {
      filteredTopics = topics.filter((_, index) => index % 3 === 1);
    } else if (dataSource === 'instagram') {
      filteredTopics = topics.filter((_, index) => index % 3 === 2);
    } else if (dataSource === 'trustpilot') {
      filteredTopics = topics.filter((_, index) => index % 2 === 0);
    }
  }
  
  // Genereer data voor elke topic en datum
  dates.forEach(date => {
    filteredTopics.forEach(topic => {
      // Genereer een base volume en sentiment voor elke topic
      const baseVolume = Math.floor(Math.random() * 100) + 50;
      const baseSentiment = Math.random() * 0.6 + 0.2; // Tussen 0.2 en 0.8
      
      // Voeg wat variatie toe op basis van de datum
      const dayOfWeek = date.getDay();
      const volumeMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.2; // Minder volume in het weekend
      const sentimentOffset = dayOfWeek === 5 ? 0.1 : 0; // Hogere sentiment op vrijdag
      
      // Bereken het uiteindelijke volume en sentiment
      const volume = Math.floor(baseVolume * volumeMultiplier);
      const sentiment = Math.min(1, Math.max(0, baseSentiment + sentimentOffset));
      
      // Voeg de data toe aan de array
      data.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD
        topic,
        volume,
        sentiment
      });
    });
  });
  
  return data;
};
