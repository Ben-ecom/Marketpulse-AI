/**
 * Utility functies voor het genereren van mock data voor trending topics visualisatie
 */

/**
 * Genereert mock trending topics data
 * @param {string} timeframe - Tijdsperiode ('day', 'week', 'month', 'quarter', 'year', 'all')
 * @param {Object} options - Extra opties
 * @returns {Array} - Array met mock trending topics data
 */
export const generateMockTopicData = (timeframe = 'month', options = {}) => {
  const { count = 50 } = options;
  
  const topics = [
    'Artificial Intelligence', 'Machine Learning', 'Data Science', 
    'Blockchain', 'Cryptocurrency', 'Bitcoin', 'Ethereum',
    'Climate Change', 'Renewable Energy', 'Sustainability',
    'COVID-19', 'Vaccination', 'Public Health',
    'Remote Work', 'Digital Nomad', 'Work-Life Balance',
    'Social Media', 'TikTok', 'Instagram', 'Twitter',
    'Cybersecurity', 'Data Privacy', 'Hacking',
    'Startup', 'Entrepreneurship', 'Venture Capital',
    'Cloud Computing', 'SaaS', 'Serverless',
    'Mobile Apps', 'iOS', 'Android',
    'E-commerce', 'Online Shopping', 'Retail',
    'Gaming', 'Esports', 'Virtual Reality', 'Augmented Reality',
    'Electric Vehicles', 'Tesla', 'Autonomous Driving',
    'Space Exploration', 'SpaceX', 'NASA', 'Mars',
    'Mental Health', 'Wellness', 'Meditation',
    'NFT', 'Digital Art', 'Metaverse'
  ];
  
  const sources = ['twitter', 'reddit', 'news', 'google', 'facebook'];
  
  const result = [];
  
  // Genereer timestamps op basis van timeframe
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'day':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
  }
  
  // Genereer data punten
  for (let i = 0; i < count; i++) {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    
    // Genereer random timestamp tussen startDate en now
    const timestamp = new Date(startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime()));
    
    result.push({
      topic: randomTopic,
      count: Math.floor(Math.random() * 10000) + 100,
      source: randomSource,
      timestamp: timestamp.toISOString()
    });
  }
  
  return result;
};

/**
 * Genereert mock events data
 * @param {string} timeframe - Tijdsperiode ('day', 'week', 'month', 'quarter', 'year', 'all')
 * @param {Object} options - Extra opties
 * @returns {Array} - Array met mock events data
 */
export const generateMockEventsData = (timeframe = 'month', options = {}) => {
  const { count = 10 } = options;
  
  const eventTitles = [
    'Major Product Launch', 'Industry Conference', 'Company Acquisition',
    'New Regulation Announced', 'Market Crash', 'Viral Social Media Trend',
    'Celebrity Endorsement', 'Security Breach', 'Research Breakthrough',
    'Global Summit', 'Policy Change', 'Award Ceremony',
    'Public Scandal', 'Viral Marketing Campaign', 'Major Update Release'
  ];
  
  const categories = ['Product', 'Industry', 'Market', 'Social', 'Technology', 'Policy', 'PR'];
  
  const result = [];
  
  // Genereer timestamps op basis van timeframe
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'day':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
  }
  
  // Genereer events
  for (let i = 0; i < count; i++) {
    const randomTitle = eventTitles[Math.floor(Math.random() * eventTitles.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Genereer random timestamp tussen startDate en now
    const date = new Date(startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime()));
    
    result.push({
      id: `event-${i}`,
      title: randomTitle,
      description: `Dit is een beschrijving van ${randomTitle.toLowerCase()}. Dit event heeft impact gehad op verschillende trending topics.`,
      date: date.toISOString(),
      category: randomCategory,
      source: 'https://example.com/event'
    });
  }
  
  return result;
};

/**
 * Genereert mock tijdreeks data voor trending topics
 * @param {Array} topics - Array met topic namen
 * @param {string} timeframe - Tijdsperiode ('day', 'week', 'month', 'quarter', 'year', 'all')
 * @param {Object} options - Extra opties
 * @returns {Object} - Object met timePoints en series data
 */
export const generateMockTimeseriesData = (topics = [], timeframe = 'month', options = {}) => {
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
  
  // Als geen topics zijn opgegeven, gebruik standaard topics
  const topicsToUse = topics.length > 0 ? topics : [
    'Artificial Intelligence', 'Blockchain', 'Climate Change', 
    'Remote Work', 'Cybersecurity'
  ];
  
  // Genereer data voor elk topic
  const series = {};
  
  topicsToUse.forEach(topic => {
    const values = [];
    let prevValue = Math.floor(Math.random() * 50) + 10;
    
    // Genereer patroon op basis van topic
    const pattern = getTopicPattern(topic);
    
    for (let i = 0; i < numPoints; i++) {
      // Bereken waarde op basis van patroon en vorige waarde
      const patternValue = pattern[i % pattern.length];
      const randomFactor = Math.random() * 10 - 5;
      
      const newValue = Math.max(0, prevValue + patternValue + randomFactor);
      values.push(Math.round(newValue));
      prevValue = newValue;
    }
    
    series[topic] = values;
  });
  
  return {
    timePoints,
    series
  };
};

/**
 * Genereert een patroon voor een topic
 * @param {string} topic - Topic naam
 * @returns {Array} - Array met patroonwaarden
 */
function getTopicPattern(topic) {
  // Verschillende patronen voor verschillende topics
  const patterns = {
    'Artificial Intelligence': [5, 8, 10, 12, 8, 5, 2],
    'Machine Learning': [3, 6, 9, 12, 9, 6, 3],
    'Blockchain': [2, -1, -3, -2, 0, 5, 10],
    'Cryptocurrency': [8, 15, 20, 15, 0, -10, -5],
    'Climate Change': [1, 2, 3, 4, 5, 6, 7],
    'COVID-19': [20, 15, 10, 5, 0, -5, -10],
    'Remote Work': [0, 2, 4, 6, 4, 2, 0],
    'Social Media': [5, 5, 5, 15, 25, 15, 5],
    'Cybersecurity': [2, 4, 6, 8, 6, 4, 2],
    'Startup': [1, 3, 5, 7, 9, 7, 5],
    'Gaming': [10, 8, 6, 4, 6, 8, 10],
    'Electric Vehicles': [2, 5, 8, 11, 14, 17, 20],
    'Space Exploration': [0, 0, 0, 15, 0, 0, 0],
    'Mental Health': [3, 3, 3, 3, 3, 3, 3]
  };
  
  // Gebruik patroon voor topic indien beschikbaar, anders willekeurig patroon
  if (patterns[topic]) {
    return patterns[topic];
  }
  
  // Genereer willekeurig patroon
  const randomPattern = [];
  for (let i = 0; i < 7; i++) {
    randomPattern.push(Math.floor(Math.random() * 10) - 3);
  }
  
  return randomPattern;
}
