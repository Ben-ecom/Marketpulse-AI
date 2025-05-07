import { 
  scrapeTrendingTopics, 
  scrapeRelatedEvents, 
  generateMockTopicData, 
  generateMockEventsData 
} from './scraperService';

/**
 * Haalt trending topics data op
 * @param {string} timeframe - Tijdsperiode ('day', 'week', 'month', 'quarter', 'year', 'all')
 * @param {Object} options - Extra opties voor de request
 * @returns {Promise<Object>} - Promise met de opgehaalde data
 */
export const fetchTopicData = async (timeframe = 'month', options = {}) => {
  const { 
    useMockData = true, 
    sources = ['twitter', 'google', 'reddit'],
    proxyConfig = {}
  } = options;
  
  try {
    if (useMockData) {
      // Gebruik mock data voor ontwikkeling en testen
      await new Promise(resolve => setTimeout(resolve, 800)); // Simuleer netwerk vertraging
      
      const topicsData = generateMockTopicData(timeframe, { count: 50 });
      const eventsData = generateMockEventsData(timeframe, { count: 10 });
      
      return {
        topics: topicsData,
        events: eventsData
      };
    } else {
      // Gebruik echte scraper voor productie
      const topicsData = await scrapeTrendingTopics({
        sources,
        timeframe,
        proxyConfig
      });
      
      // Haal gerelateerde events op
      const eventsData = await scrapeRelatedEvents(topicsData, {
        maxEvents: 10,
        proxyServer: proxyConfig.events
      });
      
      return {
        topics: topicsData,
        events: eventsData
      };
    }
  } catch (error) {
    console.error('Error fetching topic data:', error);
    throw new Error('Failed to fetch trending topics data');
  }
};

/**
 * Haalt details van een specifiek topic op
 * @param {string} topicId - ID of naam van het topic
 * @returns {Promise<Object>} - Promise met de topic details
 */
export const fetchTopicDetails = async (topicId) => {
  try {
    // Simuleer netwerk vertraging voor ontwikkeling
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock data voor een specifiek topic
    return {
      id: topicId,
      name: topicId,
      description: `Gedetailleerde beschrijving van ${topicId}`,
      frequency: Math.floor(Math.random() * 1000) + 100,
      sentiment: (Math.random() * 2 - 1).toFixed(2),
      trend: (Math.random() * 20 - 10).toFixed(1),
      relatedTopics: [
        `Related Topic ${Math.floor(Math.random() * 10) + 1}`,
        `Related Topic ${Math.floor(Math.random() * 10) + 1}`,
        `Related Topic ${Math.floor(Math.random() * 10) + 1}`
      ],
      sources: [
        { name: 'Twitter', percentage: Math.floor(Math.random() * 100) },
        { name: 'News', percentage: Math.floor(Math.random() * 100) },
        { name: 'Blogs', percentage: Math.floor(Math.random() * 100) },
        { name: 'Forums', percentage: Math.floor(Math.random() * 100) }
      ]
    };
  } catch (error) {
    console.error('Error fetching topic details:', error);
    throw new Error('Failed to fetch topic details');
  }
};

/**
 * Haalt trending topics tijdreeks data op
 * @param {Array} topicIds - Array met topic IDs of namen
 * @param {string} timeframe - Tijdsperiode ('day', 'week', 'month', 'quarter', 'year', 'all')
 * @param {Object} options - Extra opties voor de request
 * @returns {Promise<Object>} - Promise met de tijdreeks data
 */
export const fetchTopicTimeseries = async (topicIds, timeframe = 'month', options = {}) => {
  try {
    // Simuleer netwerk vertraging voor ontwikkeling
    await new Promise(resolve => setTimeout(resolve, 900));
    
    // Bepaal aantal datapunten op basis van timeframe
    let numPoints;
    switch (timeframe) {
      case 'day':
        numPoints = 24; // Uurlijks voor een dag
        break;
      case 'week':
        numPoints = 7; // Dagelijks voor een week
        break;
      case 'month':
        numPoints = 30; // Dagelijks voor een maand
        break;
      case 'quarter':
        numPoints = 13; // Wekelijks voor een kwartaal
        break;
      case 'year':
        numPoints = 12; // Maandelijks voor een jaar
        break;
      default:
        numPoints = 30; // Standaard
    }
    
    // Genereer tijdpunten
    const now = new Date();
    const timePoints = [];
    
    for (let i = 0; i < numPoints; i++) {
      const date = new Date(now);
      
      switch (timeframe) {
        case 'day':
          date.setHours(now.getHours() - (numPoints - i - 1));
          timePoints.push(date.toISOString());
          break;
        case 'week':
        case 'month':
          date.setDate(now.getDate() - (numPoints - i - 1));
          timePoints.push(date.toISOString());
          break;
        case 'quarter':
          date.setDate(now.getDate() - (numPoints - i - 1) * 7);
          timePoints.push(date.toISOString());
          break;
        case 'year':
          date.setMonth(now.getMonth() - (numPoints - i - 1));
          timePoints.push(date.toISOString());
          break;
        default:
          date.setDate(now.getDate() - (numPoints - i - 1));
          timePoints.push(date.toISOString());
      }
    }
    
    // Genereer data voor elk topic
    const series = {};
    
    topicIds.forEach(topicId => {
      const values = [];
      let prevValue = Math.floor(Math.random() * 50) + 10;
      
      for (let i = 0; i < numPoints; i++) {
        // Genereer een waarde die enigszins gerelateerd is aan de vorige waarde
        const change = Math.floor(Math.random() * 20) - 10;
        const newValue = Math.max(0, prevValue + change);
        values.push(newValue);
        prevValue = newValue;
      }
      
      series[topicId] = values;
    });
    
    return {
      timePoints,
      series
    };
  } catch (error) {
    console.error('Error fetching topic timeseries:', error);
    throw new Error('Failed to fetch topic timeseries data');
  }
};
