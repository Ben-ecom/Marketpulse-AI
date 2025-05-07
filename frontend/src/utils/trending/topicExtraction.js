/**
 * Utilities voor het extraheren van topics uit tekstdata en het berekenen van frequenties
 */

/**
 * Extraheert topics uit tekstdata met behulp van de opgegeven methode
 * @param {Array|String} textData - Array van tekstdocumenten of één tekst string
 * @param {Object} options - Configuratie opties
 * @param {String} options.extractionMethod - Methode voor topic extractie ('tfidf', 'count', 'ngram')
 * @param {Number} options.minFrequency - Minimale frequentie voor een topic om opgenomen te worden
 * @param {Array} options.stopWords - Array van stop woorden om uit te sluiten
 * @param {Number} options.maxTopics - Maximum aantal topics om terug te geven
 * @returns {Array} Array van geëxtraheerde topics met scores
 */
export const extractTopics = (textData, options = {}) => {
  const {
    extractionMethod = 'tfidf',
    minFrequency = 2,
    stopWords = [],
    maxTopics = 50,
    ngramRange = [1, 2]  // Standaard: unigrams en bigrams
  } = options;
  
  // Zorg ervoor dat textData een array is
  const documents = Array.isArray(textData) ? textData : [textData];
  
  // Controleer of er data is
  if (!documents.length || !documents[0]) {
    return [];
  }
  
  // Standaard stopwoorden in het Nederlands en Engels
  const defaultStopWords = [
    'de', 'het', 'een', 'en', 'is', 'dat', 'in', 'op', 'voor', 'met', 'van', 'te', 'aan',
    'the', 'a', 'an', 'and', 'is', 'that', 'in', 'on', 'for', 'with', 'to', 'of', 'at'
  ];
  
  // Combineer standaard en aangepaste stopwoorden
  const allStopWords = [...new Set([...defaultStopWords, ...stopWords])];
  
  // Tokenize en filter tekst
  const tokenizedDocuments = documents.map(doc => {
    if (!doc) return [];
    
    // Converteer naar lowercase en verwijder speciale tekens
    const cleanText = doc.toLowerCase().replace(/[^\w\s]/g, ' ');
    
    // Split op whitespace en filter lege strings en stopwoorden
    return cleanText.split(/\s+/)
      .filter(token => token && token.length > 1 && !allStopWords.includes(token));
  });
  
  let topics = [];
  
  // Verschillende extractiemethoden
  switch (extractionMethod) {
    case 'tfidf':
      topics = extractTopicsWithTFIDF(tokenizedDocuments, { maxTopics });
      break;
    case 'count':
      topics = extractTopicsWithCount(tokenizedDocuments, { minFrequency, maxTopics });
      break;
    case 'ngram':
      topics = extractTopicsWithNgrams(tokenizedDocuments, { ngramRange, minFrequency, maxTopics });
      break;
    default:
      topics = extractTopicsWithCount(tokenizedDocuments, { minFrequency, maxTopics });
  }
  
  return topics;
};

/**
 * Extraheert topics met behulp van TF-IDF (Term Frequency-Inverse Document Frequency)
 * @param {Array} tokenizedDocuments - Array van getokeniseerde documenten
 * @param {Object} options - Configuratie opties
 * @returns {Array} Array van topics met TF-IDF scores
 */
const extractTopicsWithTFIDF = (tokenizedDocuments, options = {}) => {
  const { maxTopics = 50 } = options;
  
  // Bereken term frequency (TF) voor elk document
  const documentTermFrequencies = tokenizedDocuments.map(tokens => {
    const termFreq = {};
    tokens.forEach(token => {
      termFreq[token] = (termFreq[token] || 0) + 1;
    });
    return termFreq;
  });
  
  // Bereken document frequency (DF) voor elke term
  const documentFrequency = {};
  const totalDocuments = tokenizedDocuments.length;
  
  documentTermFrequencies.forEach(termFreq => {
    Object.keys(termFreq).forEach(term => {
      documentFrequency[term] = (documentFrequency[term] || 0) + 1;
    });
  });
  
  // Bereken TF-IDF voor elke term in elk document
  const tfidfScores = {};
  
  documentTermFrequencies.forEach(termFreq => {
    Object.entries(termFreq).forEach(([term, freq]) => {
      // TF = term frequency in document
      const tf = freq;
      
      // IDF = log(total documents / document frequency of term)
      const idf = Math.log(totalDocuments / (documentFrequency[term] || 1));
      
      // TF-IDF = TF * IDF
      const tfidf = tf * idf;
      
      // Accumuleer TF-IDF scores over alle documenten
      tfidfScores[term] = (tfidfScores[term] || 0) + tfidf;
    });
  });
  
  // Sorteer terms op TF-IDF score en neem de top N
  const topics = Object.entries(tfidfScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTopics)
    .map(([term, score]) => ({
      topic: term,
      score: score,
      type: 'tfidf'
    }));
  
  return topics;
};

/**
 * Extraheert topics op basis van eenvoudige frequentietelling
 * @param {Array} tokenizedDocuments - Array van getokeniseerde documenten
 * @param {Object} options - Configuratie opties
 * @returns {Array} Array van topics met frequentiescores
 */
const extractTopicsWithCount = (tokenizedDocuments, options = {}) => {
  const { minFrequency = 2, maxTopics = 50 } = options;
  
  // Combineer alle tokens uit alle documenten
  const allTokens = tokenizedDocuments.flat();
  
  // Tel frequentie van elke token
  const termFrequency = {};
  allTokens.forEach(token => {
    termFrequency[token] = (termFrequency[token] || 0) + 1;
  });
  
  // Filter op minimale frequentie, sorteer op frequentie en neem de top N
  const topics = Object.entries(termFrequency)
    .filter(([_, freq]) => freq >= minFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTopics)
    .map(([term, frequency]) => ({
      topic: term,
      score: frequency,
      type: 'frequency'
    }));
  
  return topics;
};

/**
 * Extraheert topics met behulp van n-grams (sequenties van n woorden)
 * @param {Array} tokenizedDocuments - Array van getokeniseerde documenten
 * @param {Object} options - Configuratie opties
 * @returns {Array} Array van topics met frequentiescores
 */
const extractTopicsWithNgrams = (tokenizedDocuments, options = {}) => {
  const { 
    ngramRange = [1, 2],
    minFrequency = 2, 
    maxTopics = 50 
  } = options;
  
  const [minN, maxN] = ngramRange;
  const ngramFrequency = {};
  
  // Genereer n-grams voor elk document
  tokenizedDocuments.forEach(tokens => {
    // Voor elke n-gram grootte van minN tot maxN
    for (let n = minN; n <= maxN; n++) {
      // Genereer alle n-grams van grootte n
      for (let i = 0; i <= tokens.length - n; i++) {
        const ngram = tokens.slice(i, i + n).join(' ');
        ngramFrequency[ngram] = (ngramFrequency[ngram] || 0) + 1;
      }
    }
  });
  
  // Filter op minimale frequentie, sorteer op frequentie en neem de top N
  const topics = Object.entries(ngramFrequency)
    .filter(([_, freq]) => freq >= minFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTopics)
    .map(([term, frequency]) => ({
      topic: term,
      score: frequency,
      type: 'ngram',
      words: term.split(' ').length
    }));
  
  return topics;
};

/**
 * Berekent de frequentie van topics binnen een specifieke tijdsperiode
 * @param {Array} topicsData - Array van data items met topics en timestamps
 * @param {Object} options - Configuratie opties
 * @param {Date|String} options.startDate - Startdatum voor de periode
 * @param {Date|String} options.endDate - Einddatum voor de periode
 * @param {String} options.topicField - Naam van het veld dat de topic bevat
 * @param {String} options.timestampField - Naam van het veld dat de timestamp bevat
 * @param {Number} options.maxTopics - Maximum aantal topics om terug te geven
 * @returns {Array} Array van topics met frequenties binnen de opgegeven periode
 */
export const calculateTopicFrequency = (topicsData, options = {}) => {
  const {
    startDate,
    endDate,
    topicField = 'topic',
    timestampField = 'timestamp',
    maxTopics = 50
  } = options;
  
  // Controleer of er data is
  if (!topicsData || !topicsData.length) {
    return [];
  }
  
  // Converteer datums naar timestamps als ze als strings zijn opgegeven
  const start = startDate ? new Date(startDate).getTime() : 0;
  const end = endDate ? new Date(endDate).getTime() : Date.now();
  
  // Filter data op tijdsperiode
  const filteredData = topicsData.filter(item => {
    const timestamp = new Date(item[timestampField]).getTime();
    return timestamp >= start && timestamp <= end;
  });
  
  // Tel frequentie van elk topic
  const topicFrequency = {};
  
  filteredData.forEach(item => {
    let topics = item[topicField];
    
    // Als topics een string is, zet het om naar een array
    if (typeof topics === 'string') {
      topics = [topics];
    } else if (!Array.isArray(topics)) {
      return;
    }
    
    // Tel elk topic
    topics.forEach(topic => {
      if (topic) {
        topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
      }
    });
  });
  
  // Sorteer op frequentie en neem de top N
  const result = Object.entries(topicFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTopics)
    .map(([topic, frequency]) => ({
      topic,
      frequency,
      percentage: (frequency / filteredData.length) * 100
    }));
  
  return result;
};

/**
 * Genereert tijdreeksdata voor topics binnen een bepaalde periode
 * @param {Array} topicsData - Array van data items met topics en timestamps
 * @param {Object} options - Configuratie opties
 * @param {Date|String} options.startDate - Startdatum voor de periode
 * @param {Date|String} options.endDate - Einddatum voor de periode
 * @param {String} options.interval - Interval voor tijdreeks ('hour', 'day', 'week', 'month')
 * @param {String} options.topicField - Naam van het veld dat de topic bevat
 * @param {String} options.timestampField - Naam van het veld dat de timestamp bevat
 * @param {Array} options.topics - Specifieke topics om te volgen (indien leeg, worden alle topics gevolgd)
 * @param {Number} options.topN - Aantal top topics om te volgen als geen specifieke topics zijn opgegeven
 * @returns {Object} Object met tijdreeksdata voor elk topic
 */
export const getTopicTimeseries = (topicsData, options = {}) => {
  const {
    startDate,
    endDate,
    interval = 'day',
    topicField = 'topic',
    timestampField = 'timestamp',
    topics = [],
    topN = 10
  } = options;
  
  // Controleer of er data is
  if (!topicsData || !topicsData.length) {
    return { timePoints: [], series: {} };
  }
  
  // Converteer datums naar timestamps als ze als strings zijn opgegeven
  const start = startDate ? new Date(startDate).getTime() : Math.min(...topicsData.map(item => new Date(item[timestampField]).getTime()));
  const end = endDate ? new Date(endDate).getTime() : Math.max(...topicsData.map(item => new Date(item[timestampField]).getTime()));
  
  // Bepaal interval in milliseconden
  let intervalMs;
  switch (interval) {
    case 'hour':
      intervalMs = 60 * 60 * 1000;
      break;
    case 'day':
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case 'week':
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case 'month':
      intervalMs = 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      intervalMs = 24 * 60 * 60 * 1000; // default: dag
  }
  
  // Genereer tijdpunten
  const timePoints = [];
  for (let time = start; time <= end; time += intervalMs) {
    timePoints.push(new Date(time));
  }
  
  // Als er geen specifieke topics zijn opgegeven, bepaal de top N topics over de hele periode
  let topicsToTrack = topics;
  if (!topicsToTrack.length) {
    const topicFrequencies = calculateTopicFrequency(topicsData, {
      startDate: new Date(start),
      endDate: new Date(end),
      topicField,
      timestampField,
      maxTopics: topN
    });
    
    topicsToTrack = topicFrequencies.map(item => item.topic);
  }
  
  // Initialiseer tijdreeksen voor elk topic
  const series = {};
  topicsToTrack.forEach(topic => {
    series[topic] = timePoints.map(() => 0);
  });
  
  // Vul de tijdreeksen
  topicsData.forEach(item => {
    const timestamp = new Date(item[timestampField]).getTime();
    if (timestamp < start || timestamp > end) return;
    
    // Bepaal index in de tijdreeks
    const timeIndex = Math.floor((timestamp - start) / intervalMs);
    if (timeIndex < 0 || timeIndex >= timePoints.length) return;
    
    let itemTopics = item[topicField];
    
    // Als topics een string is, zet het om naar een array
    if (typeof itemTopics === 'string') {
      itemTopics = [itemTopics];
    } else if (!Array.isArray(itemTopics)) {
      return;
    }
    
    // Increment frequentie voor elk topic dat we volgen
    itemTopics.forEach(topic => {
      if (topicsToTrack.includes(topic)) {
        series[topic][timeIndex]++;
      }
    });
  });
  
  // Formateer tijdpunten voor weergave
  const formattedTimePoints = timePoints.map(date => {
    switch (interval) {
      case 'hour':
        return date.toLocaleString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      case 'day':
        return date.toLocaleString(undefined, { 
          month: 'short', 
          day: 'numeric' 
        });
      case 'week':
        return `Week ${Math.ceil(date.getDate() / 7)} ${date.toLocaleString(undefined, { month: 'short' })}`;
      case 'month':
        return date.toLocaleString(undefined, { 
          month: 'long', 
          year: 'numeric' 
        });
      default:
        return date.toLocaleString();
    }
  });
  
  return {
    timePoints: formattedTimePoints,
    rawTimePoints: timePoints,
    series,
    interval,
    startDate: new Date(start),
    endDate: new Date(end)
  };
};
