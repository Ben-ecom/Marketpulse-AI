/**
 * Trending Topics Utilities
 * 
 * Functies voor het analyseren en visualiseren van trending topics
 */

/**
 * Berekent de frequentie van topics in een dataset
 * @param {Array} data - Array van objecten met tekst
 * @param {string} textField - Naam van het veld dat de tekst bevat
 * @param {Array} stopwords - Array van stopwoorden die genegeerd moeten worden
 * @returns {Object} - Object met topics en hun frequentie
 */
export const calculateTopicFrequency = (data, textField = 'text', stopwords = []) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {};
  }
  
  // Standaard stopwoorden
  const defaultStopwords = [
    'de', 'het', 'een', 'en', 'in', 'is', 'dat', 'op', 'te', 'van', 'voor', 'met', 'zijn', 'er', 'aan', 'niet', 'ook',
    'the', 'a', 'an', 'and', 'in', 'is', 'that', 'on', 'to', 'of', 'for', 'with', 'are', 'there', 'not', 'also',
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
    'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'would',
    'should', 'could', 'ought', 'i\'m', 'you\'re', 'he\'s', 'she\'s', 'it\'s', 'we\'re', 'they\'re', 'i\'ve',
    'you\'ve', 'we\'ve', 'they\'ve', 'i\'d', 'you\'d', 'he\'d', 'she\'d', 'we\'d', 'they\'d', 'i\'ll', 'you\'ll',
    'he\'ll', 'she\'ll', 'we\'ll', 'they\'ll', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t', 'haven\'t',
    'hadn\'t', 'doesn\'t', 'don\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'shan\'t', 'shouldn\'t', 'can\'t', 'cannot',
    'couldn\'t', 'mustn\'t', 'let\'s', 'that\'s', 'who\'s', 'what\'s', 'here\'s', 'there\'s', 'when\'s', 'where\'s',
    'why\'s', 'how\'s', 'because', 'while', 'about', 'against', 'between', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'from', 'up', 'down', 'out', 'over', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'now',
    'maar', 'dan', 'dus', 'als', 'nog', 'al', 'bij', 'zo', 'toch', 'wel', 'naar', 'ja', 'nee', 'hoe', 'wat',
    'wie', 'waar', 'wanneer', 'waarom', 'kan', 'kunnen', 'zal', 'zullen', 'moet', 'moeten', 'mogen', 'mag'
  ];
  
  // Combineer standaard en aangepaste stopwoorden
  const allStopwords = [...new Set([...defaultStopwords, ...stopwords])];
  
  // Frequentie teller
  const topicFrequency = {};
  
  // Analyseer elke tekst
  data.forEach(item => {
    const text = item[textField] || '';
    
    if (!text) return;
    
    // Tokenize de tekst (eenvoudige implementatie)
    const tokens = text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Verwijder leestekens
      .split(/\s+/) // Split op whitespace
      .filter(token => 
        token.length > 2 && // Negeer korte woorden
        !allStopwords.includes(token) // Negeer stopwoorden
      );
    
    // Tel frequentie van tokens
    tokens.forEach(token => {
      topicFrequency[token] = (topicFrequency[token] || 0) + 1;
    });
  });
  
  return topicFrequency;
};

/**
 * Extraheert n-grams (phrases) uit tekst
 * @param {Array} data - Array van objecten met tekst
 * @param {string} textField - Naam van het veld dat de tekst bevat
 * @param {number} n - Lengte van de n-grams (2 voor bigrams, 3 voor trigrams, etc.)
 * @param {Array} stopwords - Array van stopwoorden die genegeerd moeten worden
 * @returns {Object} - Object met n-grams en hun frequentie
 */
export const extractNgrams = (data, textField = 'text', n = 2, stopwords = []) => {
  if (!data || !Array.isArray(data) || data.length === 0 || n < 2) {
    return {};
  }
  
  // Standaard stopwoorden
  const defaultStopwords = [
    'de', 'het', 'een', 'en', 'in', 'is', 'dat', 'op', 'te', 'van', 'voor', 'met', 'zijn', 'er', 'aan', 'niet', 'ook',
    'the', 'a', 'an', 'and', 'in', 'is', 'that', 'on', 'to', 'of', 'for', 'with', 'are', 'there', 'not', 'also'
  ];
  
  // Combineer standaard en aangepaste stopwoorden
  const allStopwords = [...new Set([...defaultStopwords, ...stopwords])];
  
  // Frequentie teller
  const ngramFrequency = {};
  
  // Analyseer elke tekst
  data.forEach(item => {
    const text = item[textField] || '';
    
    if (!text) return;
    
    // Tokenize de tekst
    const tokens = text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Verwijder leestekens
      .split(/\s+/) // Split op whitespace
      .filter(token => 
        token.length > 2 && // Negeer korte woorden
        !allStopwords.includes(token) // Negeer stopwoorden
      );
    
    // Genereer n-grams
    for (let i = 0; i <= tokens.length - n; i++) {
      const ngram = tokens.slice(i, i + n).join(' ');
      ngramFrequency[ngram] = (ngramFrequency[ngram] || 0) + 1;
    }
  });
  
  return ngramFrequency;
};

/**
 * Berekent trending topics op basis van frequentie en groei
 * @param {Array} currentData - Huidige dataset
 * @param {Array} previousData - Vorige dataset (voor vergelijking)
 * @param {string} textField - Naam van het veld dat de tekst bevat
 * @param {Object} options - Opties voor de berekening
 * @returns {Array} - Array van trending topics met scores
 */
export const calculateTrendingTopics = (
  currentData, 
  previousData = [], 
  textField = 'text', 
  options = {}
) => {
  const { 
    minFrequency = 2, 
    maxTopics = 50,
    includeNgrams = true,
    ngramSize = 2,
    stopwords = []
  } = options;
  
  // Bereken frequentie voor huidige data
  const currentFrequency = calculateTopicFrequency(currentData, textField, stopwords);
  
  // Bereken n-grams voor huidige data indien gewenst
  const currentNgrams = includeNgrams 
    ? extractNgrams(currentData, textField, ngramSize, stopwords) 
    : {};
  
  // Combineer single tokens en n-grams
  const currentTopics = { ...currentFrequency, ...currentNgrams };
  
  // Bereken frequentie voor vorige data indien beschikbaar
  const previousFrequency = previousData.length > 0 
    ? calculateTopicFrequency(previousData, textField, stopwords) 
    : {};
  
  // Bereken n-grams voor vorige data indien gewenst en beschikbaar
  const previousNgrams = previousData.length > 0 && includeNgrams 
    ? extractNgrams(previousData, textField, ngramSize, stopwords) 
    : {};
  
  // Combineer single tokens en n-grams voor vorige data
  const previousTopics = { ...previousFrequency, ...previousNgrams };
  
  // Bereken trending score voor elk topic
  const trendingTopics = Object.entries(currentTopics)
    .filter(([topic, frequency]) => frequency >= minFrequency) // Filter op minimum frequentie
    .map(([topic, frequency]) => {
      const previousFrequency = previousTopics[topic] || 0;
      
      // Bereken groei (als percentage)
      const growth = previousFrequency > 0 
        ? ((frequency - previousFrequency) / previousFrequency) * 100 
        : frequency > 1 ? 100 : 0; // Als het topic nieuw is, geef het een boost als het vaker dan 1x voorkomt
      
      // Bereken trending score (combinatie van frequentie en groei)
      const trendingScore = (frequency * 0.7) + (growth * 0.3);
      
      return {
        topic,
        frequency,
        previousFrequency,
        growth: growth.toFixed(2),
        trendingScore: trendingScore.toFixed(2),
        isNew: previousFrequency === 0 && frequency > 1
      };
    })
    .sort((a, b) => b.trendingScore - a.trendingScore) // Sorteer op trending score
    .slice(0, maxTopics); // Beperk tot maximum aantal topics
  
  return trendingTopics;
};

/**
 * Groepeert trending topics per platform
 * @param {Array} data - Array van objecten met tekst
 * @param {Array} trendingTopics - Array van trending topics
 * @param {string} textField - Naam van het veld dat de tekst bevat
 * @param {string} platformField - Naam van het veld dat het platform bevat
 * @returns {Object} - Object met platforms en hun trending topics
 */
export const groupTrendingTopicsByPlatform = (
  data, 
  trendingTopics, 
  textField = 'text', 
  platformField = 'platform'
) => {
  if (!data || !Array.isArray(data) || data.length === 0 || !trendingTopics || !Array.isArray(trendingTopics)) {
    return {};
  }
  
  // Groepeer data per platform
  const platformData = {};
  
  data.forEach(item => {
    const platform = item[platformField] || 'unknown';
    
    if (!platformData[platform]) {
      platformData[platform] = [];
    }
    
    platformData[platform].push(item);
  });
  
  // Bereken trending topics per platform
  const platformTrendingTopics = {};
  
  Object.entries(platformData).forEach(([platform, platformItems]) => {
    // Filter trending topics die voorkomen in dit platform
    const platformTopics = trendingTopics.filter(({ topic }) => {
      return platformItems.some(item => {
        const text = item[textField] || '';
        return text.toLowerCase().includes(topic.toLowerCase());
      });
    });
    
    platformTrendingTopics[platform] = platformTopics;
  });
  
  return platformTrendingTopics;
};

/**
 * Berekent correlatie tussen trending topics
 * @param {Array} data - Array van objecten met tekst
 * @param {Array} trendingTopics - Array van trending topics
 * @param {string} textField - Naam van het veld dat de tekst bevat
 * @returns {Array} - Array van topic paren met correlatie score
 */
export const calculateTopicCorrelations = (data, trendingTopics, textField = 'text') => {
  if (!data || !Array.isArray(data) || data.length === 0 || !trendingTopics || !Array.isArray(trendingTopics)) {
    return [];
  }
  
  const topicPairs = [];
  const topics = trendingTopics.map(t => t.topic);
  
  // Bereken co-occurrence voor elk paar topics
  for (let i = 0; i < topics.length; i++) {
    for (let j = i + 1; j < topics.length; j++) {
      const topic1 = topics[i];
      const topic2 = topics[j];
      
      // Tel hoe vaak beide topics samen voorkomen
      const coOccurrence = data.filter(item => {
        const text = item[textField] || '';
        const lowerText = text.toLowerCase();
        return lowerText.includes(topic1.toLowerCase()) && lowerText.includes(topic2.toLowerCase());
      }).length;
      
      // Alleen paren met co-occurrence toevoegen
      if (coOccurrence > 0) {
        // Bereken Jaccard similarity (co-occurrence / (freq1 + freq2 - co-occurrence))
        const topic1Frequency = trendingTopics.find(t => t.topic === topic1).frequency;
        const topic2Frequency = trendingTopics.find(t => t.topic === topic2).frequency;
        
        const jaccardSimilarity = coOccurrence / (topic1Frequency + topic2Frequency - coOccurrence);
        
        topicPairs.push({
          topics: [topic1, topic2],
          coOccurrence,
          correlationScore: jaccardSimilarity.toFixed(3)
        });
      }
    }
  }
  
  // Sorteer op correlatie score
  return topicPairs.sort((a, b) => b.correlationScore - a.correlationScore);
};

/**
 * Genereert een tijdreeks voor trending topics
 * @param {Array} data - Array van objecten met tekst en datum
 * @param {Array} topics - Array van topics om te tracken
 * @param {string} textField - Naam van het veld dat de tekst bevat
 * @param {string} dateField - Naam van het veld dat de datum bevat
 * @param {string} interval - Interval voor de tijdreeks ('day', 'week', 'month')
 * @returns {Object} - Object met tijdreeksen per topic
 */
export const generateTopicTimeSeries = (
  data, 
  topics, 
  textField = 'text', 
  dateField = 'date', 
  interval = 'day'
) => {
  if (!data || !Array.isArray(data) || data.length === 0 || !topics || !Array.isArray(topics)) {
    return {};
  }
  
  // Sorteer data op datum
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return dateA - dateB;
  });
  
  // Bepaal start en eind datum
  const startDate = new Date(sortedData[0][dateField]);
  const endDate = new Date(sortedData[sortedData.length - 1][dateField]);
  
  // Genereer tijdsperiodes op basis van interval
  const periods = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const periodStart = new Date(currentDate);
    
    // Bereken einde van periode op basis van interval
    let periodEnd;
    if (interval === 'day') {
      periodEnd = new Date(currentDate.setDate(currentDate.getDate() + 1));
    } else if (interval === 'week') {
      periodEnd = new Date(currentDate.setDate(currentDate.getDate() + 7));
    } else if (interval === 'month') {
      periodEnd = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    } else {
      // Standaard: dag
      periodEnd = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }
    
    periods.push({
      start: periodStart,
      end: periodEnd,
      label: periodStart.toISOString().split('T')[0] // YYYY-MM-DD
    });
    
    currentDate = new Date(periodEnd);
  }
  
  // Initialiseer tijdreeksen
  const timeSeries = {};
  
  topics.forEach(topic => {
    timeSeries[topic] = periods.map(period => ({
      period: period.label,
      count: 0
    }));
  });
  
  // Tel frequentie per periode
  sortedData.forEach(item => {
    const text = item[textField] || '';
    const date = new Date(item[dateField]);
    
    // Vind de juiste periode
    const periodIndex = periods.findIndex(period => date >= period.start && date < period.end);
    
    if (periodIndex === -1) return;
    
    // Tel voor elk topic
    topics.forEach(topic => {
      if (text.toLowerCase().includes(topic.toLowerCase())) {
        timeSeries[topic][periodIndex].count += 1;
      }
    });
  });
  
  return timeSeries;
};

/**
 * Identificeert gerelateerde topics voor een gegeven topic
 * @param {Array} data - Array van objecten met tekst
 * @param {string} topic - Topic om gerelateerde topics voor te vinden
 * @param {string} textField - Naam van het veld dat de tekst bevat
 * @param {Object} options - Opties voor de berekening
 * @returns {Array} - Array van gerelateerde topics met scores
 */
export const findRelatedTopics = (data, topic, textField = 'text', options = {}) => {
  const { 
    maxTopics = 10, 
    minCoOccurrence = 2,
    stopwords = []
  } = options;
  
  if (!data || !Array.isArray(data) || data.length === 0 || !topic) {
    return [];
  }
  
  // Vind items die het topic bevatten
  const topicItems = data.filter(item => {
    const text = item[textField] || '';
    return text.toLowerCase().includes(topic.toLowerCase());
  });
  
  if (topicItems.length === 0) {
    return [];
  }
  
  // Bereken frequentie van andere woorden in deze items
  const relatedFrequency = calculateTopicFrequency(topicItems, textField, [...stopwords, topic]);
  
  // Bereken totale frequentie in alle data
  const totalFrequency = calculateTopicFrequency(data, textField, stopwords);
  
  // Bereken relevantie score voor elk gerelateerd topic
  const relatedTopics = Object.entries(relatedFrequency)
    .filter(([relatedTopic, frequency]) => frequency >= minCoOccurrence) // Filter op minimum co-occurrence
    .map(([relatedTopic, frequency]) => {
      const totalFreq = totalFrequency[relatedTopic] || 0;
      
      // Bereken PMI (Pointwise Mutual Information)
      // PMI = log( P(x,y) / (P(x) * P(y)) )
      const pmi = Math.log2(
        (frequency / topicItems.length) / 
        ((totalFreq / data.length) * (topicItems.length / data.length))
      );
      
      return {
        topic: relatedTopic,
        coOccurrence: frequency,
        totalFrequency: totalFreq,
        relevanceScore: isNaN(pmi) ? 0 : pmi.toFixed(3)
      };
    })
    .filter(item => item.relevanceScore > 0) // Filter op positieve relevantie
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sorteer op relevantie score
    .slice(0, maxTopics); // Beperk tot maximum aantal topics
  
  return relatedTopics;
};

/**
 * Genereert een topic network voor visualisatie
 * @param {Array} trendingTopics - Array van trending topics
 * @param {Array} correlations - Array van topic correlaties
 * @returns {Object} - Object met nodes en links voor network visualisatie
 */
export const generateTopicNetwork = (trendingTopics, correlations) => {
  if (!trendingTopics || !Array.isArray(trendingTopics) || !correlations || !Array.isArray(correlations)) {
    return { nodes: [], links: [] };
  }
  
  // Maak nodes
  const nodes = trendingTopics.map(({ topic, frequency, trendingScore, isNew }) => ({
    id: topic,
    label: topic,
    value: parseInt(frequency),
    score: parseFloat(trendingScore),
    isNew
  }));
  
  // Maak links
  const links = correlations.map(({ topics, correlationScore }) => ({
    source: topics[0],
    target: topics[1],
    value: parseFloat(correlationScore)
  }));
  
  return { nodes, links };
};

export default {
  calculateTopicFrequency,
  extractNgrams,
  calculateTrendingTopics,
  groupTrendingTopicsByPlatform,
  calculateTopicCorrelations,
  generateTopicTimeSeries,
  findRelatedTopics,
  generateTopicNetwork
};
