/**
 * Help-punten data voor verschillende views in de applicatie
 * 
 * Deze data definieert de posities en inhoud van help-markers die worden getoond
 * in de HelpOverlayManager component. De posities zijn relatief ten opzichte van
 * het parent element waarin de HelpOverlayManager is geplaatst.
 */

/**
 * Help-punten voor het TopicAwarenessReport
 * @type {Array}
 */
export const topicAwarenessReportHelpPoints = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    content: 'De Executive Summary geeft een beknopt overzicht van de belangrijkste inzichten uit de topic awareness analyse. Het is ontworpen voor besluitvormers die snel de kernpunten willen begrijpen zonder in details te duiken.',
    position: {
      top: 100,
      left: 100
    },
    contentPosition: {
      top: 150,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/executive-summary.mp4',
    learnMoreUrl: 'https://docs.example.com/topic-awareness/executive-summary'
  },
  {
    id: 'topic-details',
    title: 'Topic Details',
    content: 'Deze sectie toont de belangrijkste topics per awareness fase. Hiermee kun je zien welke onderwerpen relevant zijn in elke fase van de customer journey, van Unaware tot Most Aware.',
    position: {
      top: 200,
      left: 100
    },
    contentPosition: {
      top: 250,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/topic-details.mp4',
    learnMoreUrl: 'https://docs.example.com/topic-awareness/topic-details'
  },
  {
    id: 'awareness-distribution',
    title: 'Awareness Distributie',
    content: 'Deze visualisatie toont de verdeling van topics over de verschillende awareness fasen. Dit geeft inzicht in waar je doelgroep zich bevindt in hun customer journey en waar je content strategie op moet focussen.',
    position: {
      top: 300,
      left: 100
    },
    contentPosition: {
      top: 350,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/awareness-distribution.mp4',
    learnMoreUrl: 'https://docs.example.com/topic-awareness/distribution'
  },
  {
    id: 'content-recommendations',
    title: 'Content Aanbevelingen',
    content: 'Deze sectie bevat specifieke content aanbevelingen voor elke awareness fase. Gebruik deze suggesties om content te creëren die aansluit bij de behoeften van je doelgroep in elke fase van hun journey.',
    position: {
      top: 400,
      left: 100
    },
    contentPosition: {
      top: 450,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/content-recommendations.mp4',
    learnMoreUrl: 'https://docs.example.com/topic-awareness/recommendations'
  },
  {
    id: 'trending-topics',
    title: 'Trending Topics',
    content: 'Deze sectie toont de topics die het snelst in populariteit stijgen. Gebruik deze inzichten om in te spelen op opkomende trends en je content strategie aan te passen aan veranderende interesses.',
    position: {
      top: 500,
      left: 100
    },
    contentPosition: {
      top: 550,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/trending-topics.mp4',
    learnMoreUrl: 'https://docs.example.com/topic-awareness/trending'
  },
  {
    id: 'report-options',
    title: 'Rapport Opties',
    content: 'Pas hier de inhoud en opmaak van je rapport aan. Je kunt secties toevoegen of verwijderen, productinformatie aanpassen en privacy-instellingen beheren om het rapport af te stemmen op je specifieke behoeften.',
    position: {
      top: 600,
      left: 100
    },
    contentPosition: {
      top: 650,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/report-options.mp4',
    learnMoreUrl: 'https://docs.example.com/topic-awareness/options'
  },
  {
    id: 'export-options',
    title: 'Export Opties',
    content: 'Exporteer je rapport in verschillende formaten zoals PDF of Excel. Je kunt het rapport delen met stakeholders of gebruiken voor presentaties en strategische planning.',
    position: {
      top: 700,
      left: 100
    },
    contentPosition: {
      top: 750,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/export-options.mp4',
    learnMoreUrl: 'https://docs.example.com/topic-awareness/export'
  }
];

/**
 * Help-punten voor het Dashboard
 * @type {Array}
 */
export const dashboardHelpPoints = [
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overzicht',
    content: 'Het dashboard biedt een overzicht van je belangrijkste metrics en inzichten. Hier kun je snel de status van je projecten en analyses bekijken.',
    position: {
      top: 100,
      left: 100
    },
    contentPosition: {
      top: 150,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/dashboard-overview.mp4',
    learnMoreUrl: 'https://docs.example.com/dashboard/overview'
  },
  {
    id: 'recent-projects',
    title: 'Recente Projecten',
    content: 'Hier vind je je meest recente projecten. Klik op een project om de details te bekijken of om verder te werken aan de analyse.',
    position: {
      top: 200,
      left: 100
    },
    contentPosition: {
      top: 250,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/recent-projects.mp4',
    learnMoreUrl: 'https://docs.example.com/dashboard/projects'
  },
  {
    id: 'quick-actions',
    title: 'Snelle Acties',
    content: 'Gebruik deze knoppen om snel nieuwe projecten te starten of het dashboard te verversen. Dit helpt je om efficiënt te werken en altijd toegang te hebben tot de meest recente data.',
    position: {
      top: 100,
      left: 500
    },
    contentPosition: {
      top: 350,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/quick-actions.mp4',
    learnMoreUrl: 'https://docs.example.com/dashboard/actions'
  },
  {
    id: 'statistics-cards',
    title: 'Statistieken Kaarten',
    content: 'Deze kaarten tonen je belangrijkste statistieken zoals het aantal projecten, dataverzamelingen en gegenereerde inzichten. Dit geeft je een snel overzicht van je MarketPulse AI activiteiten.',
    position: {
      top: 220,
      left: 300
    },
    contentPosition: {
      top: 270,
      left: 350,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/statistics-cards.mp4',
    learnMoreUrl: 'https://docs.example.com/dashboard/statistics'
  },
  {
    id: 'recent-activity',
    title: 'Recente Activiteit',
    content: 'Hier zie je de meest recente activiteiten in je MarketPulse AI account, zoals nieuwe projecten, dataverzamelingen en inzichten. Dit helpt je om bij te blijven met de laatste ontwikkelingen.',
    position: {
      top: 350,
      left: 200
    },
    contentPosition: {
      top: 400,
      left: 250,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/recent-activity.mp4',
    learnMoreUrl: 'https://docs.example.com/dashboard/activity'
  },
  {
    id: 'popular-trends',
    title: 'Populaire Trends',
    content: 'Deze sectie toont de meest populaire trends in je markt. Gebruik deze inzichten om op de hoogte te blijven van belangrijke ontwikkelingen en je strategie hierop aan te passen.',
    position: {
      top: 450,
      left: 200
    },
    contentPosition: {
      top: 500,
      left: 250,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/popular-trends.mp4',
    learnMoreUrl: 'https://docs.example.com/dashboard/trends'
  },
  {
    id: 'recent-insights',
    title: 'Recente Inzichten',
    content: 'Hier vind je de meest recente inzichten uit je projecten, zoals pijnpunten, verlangens en markttrends. Deze inzichten helpen je om je marketingstrategie te optimaliseren.',
    position: {
      top: 450,
      left: 500
    },
    contentPosition: {
      top: 500,
      left: 550,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/recent-insights.mp4',
    learnMoreUrl: 'https://docs.example.com/dashboard/insights'
  }
];

/**
 * Help-punten voor de Sentiment Analysis
 * @type {Array}
 */
export const sentimentAnalysisHelpPoints = [
  {
    id: 'sentiment-overview',
    title: 'Sentiment Overzicht',
    content: 'Het sentiment overzicht toont de verdeling van positief, neutraal en negatief sentiment in je data. Dit helpt je te begrijpen hoe je doelgroep zich voelt over bepaalde onderwerpen.',
    position: {
      top: 100,
      left: 100
    },
    contentPosition: {
      top: 150,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/sentiment-overview.mp4',
    learnMoreUrl: 'https://docs.example.com/sentiment/overview'
  },
  {
    id: 'sentiment-trends',
    title: 'Sentiment Trends',
    content: 'Deze grafiek toont hoe het sentiment over tijd verandert. Gebruik deze inzichten om te zien hoe gebeurtenissen of campagnes het sentiment beïnvloeden.',
    position: {
      top: 200,
      left: 100
    },
    contentPosition: {
      top: 250,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/sentiment-trends.mp4',
    learnMoreUrl: 'https://docs.example.com/sentiment/trends'
  },
  {
    id: 'sentiment-by-platform',
    title: 'Sentiment per Platform',
    content: 'Hier zie je hoe het sentiment verschilt per platform. Dit kan helpen om te begrijpen waar je merk het beste presteert of waar verbeteringen nodig zijn.',
    position: {
      top: 300,
      left: 100
    },
    contentPosition: {
      top: 350,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/sentiment-by-platform.mp4',
    learnMoreUrl: 'https://docs.example.com/sentiment/platforms'
  },
  {
    id: 'sentiment-tabs',
    title: 'Analyse Weergaven',
    content: 'Gebruik deze tabs om tussen verschillende weergaven van de sentiment analyse te schakelen. Elke weergave biedt verschillende inzichten in het sentiment van uw doelgroep.',
    position: {
      top: 150,
      left: 300
    },
    contentPosition: {
      top: 200,
      left: 350,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/sentiment-tabs.mp4',
    learnMoreUrl: 'https://docs.example.com/sentiment-analysis/views'
  },
  {
    id: 'platform-filter',
    title: 'Platform Filter',
    content: 'Filter de sentiment analyse resultaten per platform om te zien hoe het sentiment verschilt tussen verschillende platforms zoals Reddit, Amazon, Instagram en TikTok.',
    position: {
      top: 200,
      left: 300
    },
    contentPosition: {
      top: 250,
      left: 350,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/sentiment-platforms.mp4',
    learnMoreUrl: 'https://docs.example.com/sentiment-analysis/platforms'
  },
  {
    id: 'sentiment-examples',
    title: 'Sentiment Voorbeelden',
    content: 'Bekijk concrete voorbeelden van positieve, neutrale en negatieve uitspraken van uw doelgroep. Deze voorbeelden helpen u om het sentiment beter te begrijpen en uw communicatie aan te passen.',
    position: {
      top: 400,
      left: 300
    },
    contentPosition: {
      top: 450,
      left: 350,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/sentiment-examples.mp4',
    learnMoreUrl: 'https://docs.example.com/sentiment-analysis/examples'
  },
  {
    id: 'sentiment-export',
    title: 'Exporteer Sentiment Data',
    content: 'Exporteer de sentiment analyse resultaten naar verschillende formaten zoals PDF, Excel of CSV voor verder gebruik in presentaties of rapporten.',
    position: {
      top: 100,
      left: 500
    },
    contentPosition: {
      top: 150,
      left: 550,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/sentiment-export.mp4',
    learnMoreUrl: 'https://docs.example.com/sentiment-analysis/export'
  }
];

/**
 * Help-punten voor de Market Trends
 * @type {Array}
 */
export const marketTrendsHelpPoints = [
  {
    id: 'market-trends-overview',
    title: 'Markttrends Overzicht',
    content: 'Het markttrends overzicht toont de belangrijkste trends in je markt. Gebruik deze inzichten om je strategie aan te passen aan veranderende marktomstandigheden.',
    position: {
      top: 100,
      left: 100
    },
    contentPosition: {
      top: 150,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/market-trends-overview.mp4',
    learnMoreUrl: 'https://docs.example.com/market-trends/overview'
  },
  {
    id: 'competitor-analysis',
    title: 'Concurrentieanalyse',
    content: 'De concurrentieanalyse vergelijkt je merk met concurrenten op verschillende metrics. Dit helpt je sterke punten en verbeterpunten te identificeren.',
    position: {
      top: 200,
      left: 100
    },
    contentPosition: {
      top: 250,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/competitor-analysis.mp4',
    learnMoreUrl: 'https://docs.example.com/market-trends/competitors'
  },
  {
    id: 'market-size',
    title: 'Marktgrootte',
    content: 'Deze sectie toont de geschatte marktgrootte en groeipercentages. Gebruik deze informatie voor strategische planning en investeringsbeslissingen.',
    position: {
      top: 300,
      left: 100
    },
    contentPosition: {
      top: 350,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/market-size.mp4',
    learnMoreUrl: 'https://docs.example.com/market-trends/size'
  }
];

/**
 * Help-punten voor de Market Insights pagina
 * @type {Array}
 */
export const marketInsightsHelpPoints = [
  {
    id: 'market-insights-overview',
    title: 'Marktinzichten Dashboard',
    content: 'Dit dashboard biedt een compleet overzicht van uw marktpositie, concurrentie-analyse en klantfeedback. Gebruik deze inzichten om uw marketingstrategie te optimaliseren.',
    position: {
      top: 100,
      left: 100
    },
    contentPosition: {
      top: 150,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/market-insights-overview.mp4',
    learnMoreUrl: 'https://docs.example.com/market-insights/overview'
  },
  {
    id: 'awareness-visualization',
    title: 'Awareness Fasen Visualisatie',
    content: 'Deze visualisatie toont de verdeling van uw doelgroep over de verschillende awareness fasen volgens het model van Eugene Schwartz. Gebruik deze inzichten om uw marketingboodschap aan te passen aan het bewustzijnsniveau van uw doelgroep.',
    position: {
      top: 200,
      left: 100
    },
    contentPosition: {
      top: 250,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/awareness-visualization.mp4',
    learnMoreUrl: 'https://docs.example.com/awareness/visualization'
  },
  {
    id: 'competitor-analysis',
    title: 'Concurrentie-analyse',
    content: 'Deze analyse vergelijkt uw merk met concurrenten op verschillende metrics zoals marktaandeel, online zichtbaarheid en klanttevredenheid. Gebruik deze inzichten om uw concurrentiepositie te versterken.',
    position: {
      top: 300,
      left: 100
    },
    contentPosition: {
      top: 350,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/competitor-analysis.mp4',
    learnMoreUrl: 'https://docs.example.com/market-insights/competitors'
  },
  {
    id: 'reviews-analysis',
    title: 'Klantreviews Analyse',
    content: 'Deze sectie toont een analyse van klantreviews van verschillende platforms. Gebruik deze inzichten om uw product of dienst te verbeteren en beter aan te sluiten bij de behoeften van uw klanten.',
    position: {
      top: 400,
      left: 100
    },
    contentPosition: {
      top: 450,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/reviews-analysis.mp4',
    learnMoreUrl: 'https://docs.example.com/market-insights/reviews'
  },
  {
    id: 'market-insights-export',
    title: 'Exporteer Marktinzichten',
    content: 'Exporteer de marktinzichten naar Excel, PDF of CSV formaat voor gebruik in presentaties of rapporten.',
    position: {
      top: 500,
      left: 100
    },
    contentPosition: {
      top: 550,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/market-insights-export.mp4',
    learnMoreUrl: 'https://docs.example.com/market-insights/export'
  }
];

/**
 * Help-punten voor de Awareness Fasen
 * @type {Array}
 */
export const awarenessHelpPoints = [
  {
    id: 'awareness-overview',
    title: 'Awareness Fasen Overzicht',
    content: 'De awareness fasen van Eugene Schwartz helpen u te begrijpen in welke fase van bewustzijn uw doelgroep zich bevindt. Dit dashboard toont de verdeling van uw doelgroep over deze fasen.',
    position: {
      top: 100,
      left: 100
    },
    contentPosition: {
      top: 150,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/awareness-overview.mp4',
    learnMoreUrl: 'https://docs.example.com/awareness/overview'
  },
  {
    id: 'unaware-phase',
    title: 'Unaware Fase',
    content: 'In deze fase heeft uw doelgroep nog geen bewustzijn van het probleem dat uw product oplost. Dit dashboard toont hoeveel van uw doelgroep zich in deze fase bevindt en geeft aanbevelingen voor effectieve communicatie.',
    position: {
      top: 200,
      left: 100
    },
    contentPosition: {
      top: 250,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/unaware-phase.mp4',
    learnMoreUrl: 'https://docs.example.com/awareness/unaware'
  },
  {
    id: 'problem-aware-phase',
    title: 'Problem Aware Fase',
    content: 'In deze fase is uw doelgroep zich bewust van het probleem, maar weet nog niet welke oplossingen er zijn. Dit dashboard toont hoeveel van uw doelgroep zich in deze fase bevindt en geeft aanbevelingen voor effectieve communicatie.',
    position: {
      top: 300,
      left: 100
    },
    contentPosition: {
      top: 350,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/problem-aware-phase.mp4',
    learnMoreUrl: 'https://docs.example.com/awareness/problem-aware'
  },
  {
    id: 'solution-aware-phase',
    title: 'Solution Aware Fase',
    content: 'In deze fase kent uw doelgroep de mogelijke oplossingstypen, maar niet de specifieke producten. Dit dashboard toont hoeveel van uw doelgroep zich in deze fase bevindt en geeft aanbevelingen voor effectieve communicatie.',
    position: {
      top: 400,
      left: 100
    },
    contentPosition: {
      top: 450,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/solution-aware-phase.mp4',
    learnMoreUrl: 'https://docs.example.com/awareness/solution-aware'
  },
  {
    id: 'product-aware-phase',
    title: 'Product Aware Fase',
    content: 'In deze fase kent uw doelgroep uw product, maar is nog niet overtuigd om het te kopen. Dit dashboard toont hoeveel van uw doelgroep zich in deze fase bevindt en geeft aanbevelingen voor effectieve communicatie.',
    position: {
      top: 500,
      left: 100
    },
    contentPosition: {
      top: 550,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/product-aware-phase.mp4',
    learnMoreUrl: 'https://docs.example.com/awareness/product-aware'
  },
  {
    id: 'most-aware-phase',
    title: 'Most Aware Fase',
    content: 'In deze fase is uw doelgroep volledig bewust van uw product en klaar om te kopen. Dit dashboard toont hoeveel van uw doelgroep zich in deze fase bevindt en geeft aanbevelingen voor effectieve communicatie.',
    position: {
      top: 600,
      left: 100
    },
    contentPosition: {
      top: 650,
      left: 150,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/most-aware-phase.mp4',
    learnMoreUrl: 'https://docs.example.com/awareness/most-aware'
  },
  {
    id: 'awareness-recommendations',
    title: 'Marketing Aanbevelingen',
    content: 'Op basis van de awareness fasen verdeling krijgt u hier specifieke aanbevelingen voor uw marketingcommunicatie. Deze aanbevelingen helpen u om uw boodschap aan te passen aan het bewustzijnsniveau van uw doelgroep.',
    position: {
      top: 200,
      left: 400
    },
    contentPosition: {
      top: 250,
      left: 450,
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/awareness-recommendations.mp4',
    learnMoreUrl: 'https://docs.example.com/awareness/recommendations'
  }
];

/**
 * Functie om de juiste help-punten te krijgen voor een specifieke view
 * @param {string} view - De actieve view (dashboard, report, sentiment, trends, awareness, market-insights)
 * @returns {Array} - De help-punten voor de opgegeven view
 */
export const getHelpPointsForView = (view) => {
  switch (view) {
    case 'dashboard':
      return dashboardHelpPoints;
    case 'report':
      return topicAwarenessReportHelpPoints;
    case 'sentiment':
      return sentimentAnalysisHelpPoints;
    case 'trends':
      return marketTrendsHelpPoints;
    case 'awareness':
      return awarenessHelpPoints;
    case 'market-insights':
      return marketInsightsHelpPoints;
    default:
      return [];
  }
};
