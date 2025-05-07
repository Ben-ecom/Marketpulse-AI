/**
 * Utility functies voor sentiment analyse en data transformatie
 */

/**
 * Categoriseert sentiment data in positief, negatief en neutraal
 * @param {Array} data - Ruwe data array met sentiment scores
 * @returns {Object} Object met gecategoriseerde sentiment data
 */
export const categorizeSentiment = (data = []) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { positive: 0, negative: 0, neutral: 0, total: 0 };
  }

  const result = data.reduce((acc, item) => {
    const score = item.sentiment_score || 0;
    
    if (score > 0.2) {
      acc.positive += 1;
    } else if (score < -0.2) {
      acc.negative += 1;
    } else {
      acc.neutral += 1;
    }
    
    return acc;
  }, { positive: 0, negative: 0, neutral: 0 });
  
  result.total = data.length;
  
  return result;
};

/**
 * Transformeert sentiment data voor gebruik in een pie chart
 * @param {Object} sentimentData - Gecategoriseerde sentiment data
 * @returns {Array} Array met data voor pie chart
 */
export const transformForPieChart = (sentimentData) => {
  if (!sentimentData) return [];
  
  return [
    { name: 'Positief', value: sentimentData.positive, color: '#10b981' }, // Groen
    { name: 'Neutraal', value: sentimentData.neutral, color: '#3b82f6' },  // Blauw
    { name: 'Negatief', value: sentimentData.negative, color: '#ef4444' }  // Rood
  ];
};

/**
 * Groepeert sentiment data per platform
 * @param {Array} data - Ruwe data array met sentiment scores en platform info
 * @returns {Object} Object met sentiment data per platform
 */
export const groupByPlatform = (data = []) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {};
  }
  
  return data.reduce((acc, item) => {
    const platform = item.platform || 'unknown';
    
    if (!acc[platform]) {
      acc[platform] = [];
    }
    
    acc[platform].push(item);
    
    return acc;
  }, {});
};

/**
 * Transformeert sentiment data voor gebruik in een trend chart
 * @param {Array} data - Ruwe data array met sentiment scores en timestamps
 * @param {String} timeInterval - Tijdsinterval voor groepering ('day', 'week', 'month')
 * @returns {Array} Array met data voor trend chart
 */
export const transformForTrendChart = (data = [], timeInterval = 'day') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  // Sorteer data op timestamp
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.created_at || 0);
    const dateB = new Date(b.timestamp || b.created_at || 0);
    return dateA - dateB;
  });
  
  // Groepeer data per tijdsinterval
  const groupedData = sortedData.reduce((acc, item) => {
    const date = new Date(item.timestamp || item.created_at || 0);
    let key;
    
    switch (timeInterval) {
      case 'week':
        // ISO week (1-52)
        const weekNumber = getWeekNumber(date);
        key = `Week ${weekNumber}, ${date.getFullYear()}`;
        break;
      case 'month':
        // Maand (Jan, Feb, etc.)
        key = `${date.toLocaleString('nl-NL', { month: 'short' })} ${date.getFullYear()}`;
        break;
      case 'day':
      default:
        // Dag (DD-MM-YYYY)
        key = date.toLocaleDateString('nl-NL');
    }
    
    if (!acc[key]) {
      acc[key] = { positive: 0, negative: 0, neutral: 0, date: key };
    }
    
    const score = item.sentiment_score || 0;
    
    if (score > 0.2) {
      acc[key].positive += 1;
    } else if (score < -0.2) {
      acc[key].negative += 1;
    } else {
      acc[key].neutral += 1;
    }
    
    return acc;
  }, {});
  
  // Converteer naar array voor chart
  return Object.values(groupedData);
};

/**
 * Berekent het ISO weeknummer voor een datum
 * @param {Date} date - Datum object
 * @returns {Number} Weeknummer (1-52)
 */
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Filtert sentiment data op basis van zoekwoorden
 * @param {Array} data - Ruwe data array
 * @param {String} keyword - Zoekwoord
 * @returns {Array} Gefilterde data array
 */
export const filterByKeyword = (data = [], keyword = '') => {
  if (!data || !Array.isArray(data) || data.length === 0 || !keyword) {
    return data;
  }
  
  const lowercaseKeyword = keyword.toLowerCase();
  
  return data.filter(item => {
    const text = (item.text || item.content || '').toLowerCase();
    return text.includes(lowercaseKeyword);
  });
};

/**
 * Berekent sentiment statistieken (gemiddelde, mediaan, etc.)
 * @param {Array} data - Ruwe data array met sentiment scores
 * @returns {Object} Object met sentiment statistieken
 */
export const calculateSentimentStats = (data = []) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      positivePercentage: 0,
      negativePercentage: 0,
      neutralPercentage: 0
    };
  }
  
  const scores = data.map(item => item.sentiment_score || 0);
  const sortedScores = [...scores].sort((a, b) => a - b);
  
  const categorized = categorizeSentiment(data);
  const total = data.length;
  
  return {
    average: scores.reduce((sum, score) => sum + score, 0) / total,
    median: sortedScores[Math.floor(sortedScores.length / 2)],
    min: sortedScores[0],
    max: sortedScores[sortedScores.length - 1],
    positivePercentage: (categorized.positive / total) * 100,
    negativePercentage: (categorized.negative / total) * 100,
    neutralPercentage: (categorized.neutral / total) * 100
  };
};
