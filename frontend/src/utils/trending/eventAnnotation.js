/**
 * Utilities voor het annoteren van events en correleren met topic populariteit
 */

/**
 * Voegt event annotaties toe aan tijdreeksdata
 * @param {Object} topicTimeseries - Object met tijdreeksdata voor topics
 * @param {Array} eventsData - Array van event objecten
 * @param {Object} options - Configuratie opties
 * @returns {Object} Tijdreeksdata verrijkt met event annotaties
 */
export const addEventAnnotations = (topicTimeseries, eventsData, options = {}) => {
  const {
    timestampField = 'date',
    titleField = 'title',
    descriptionField = 'description',
    categoryField = 'category'
  } = options;
  
  // Controleer of er data is
  if (!topicTimeseries || !topicTimeseries.timePoints || !topicTimeseries.rawTimePoints || !eventsData || !eventsData.length) {
    return topicTimeseries;
  }
  
  const { rawTimePoints } = topicTimeseries;
  const annotations = [];
  
  // Converteer events naar annotaties
  eventsData.forEach(event => {
    const eventDate = new Date(event[timestampField]);
    const eventTimestamp = eventDate.getTime();
    
    // Vind dichtstbijzijnde tijdpunt
    let closestIndex = -1;
    let minDistance = Infinity;
    
    rawTimePoints.forEach((timePoint, index) => {
      const distance = Math.abs(timePoint.getTime() - eventTimestamp);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    if (closestIndex >= 0) {
      annotations.push({
        index: closestIndex,
        date: eventDate,
        title: event[titleField] || 'Onbekend event',
        description: event[descriptionField] || '',
        category: event[categoryField] || 'general',
        original: event
      });
    }
  });
  
  return {
    ...topicTimeseries,
    annotations
  };
};

/**
 * Vindt events die correleren met topic spikes
 * @param {Object} topicSpike - Object met spike informatie
 * @param {Array} eventsData - Array van event objecten
 * @param {Object} options - Configuratie opties
 * @returns {Array} Array van gecorreleerde events
 */
export const findCorrelatedEvents = (topicSpike, eventsData, options = {}) => {
  const {
    window = 1, // Aantal dagen voor/na spike om te zoeken
    timestampField = 'date',
    titleField = 'title',
    descriptionField = 'description',
    categoryField = 'category'
  } = options;
  
  // Controleer of er data is
  if (!topicSpike || !topicSpike.date || !eventsData || !eventsData.length) {
    return [];
  }
  
  const spikeDate = new Date(topicSpike.date);
  const spikeTimestamp = spikeDate.getTime();
  const windowMs = window * 24 * 60 * 60 * 1000; // Converteer dagen naar milliseconden
  
  // Vind events binnen venster
  const correlatedEvents = eventsData.filter(event => {
    const eventTimestamp = new Date(event[timestampField]).getTime();
    return Math.abs(eventTimestamp - spikeTimestamp) <= windowMs;
  });
  
  // Sorteer op nabijheid tot spike
  return correlatedEvents
    .map(event => {
      const eventTimestamp = new Date(event[timestampField]).getTime();
      const distance = Math.abs(eventTimestamp - spikeTimestamp);
      const timeDifference = eventTimestamp - spikeTimestamp;
      
      return {
        title: event[titleField] || 'Onbekend event',
        description: event[descriptionField] || '',
        category: event[categoryField] || 'general',
        date: new Date(event[timestampField]),
        distance,
        timeDifference,
        isBefore: timeDifference < 0,
        isAfter: timeDifference > 0,
        isSameDay: Math.abs(timeDifference) < 24 * 60 * 60 * 1000,
        original: event
      };
    })
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Berekent de impact van een event op topic populariteit
 * @param {Object} topicTimeseries - Object met tijdreeksdata voor een topic
 * @param {Date|String} eventTime - Tijdstip van het event
 * @param {Object} options - Configuratie opties
 * @returns {Object} Object met impact statistieken
 */
export const calculateEventImpact = (topicTimeseries, eventTime, options = {}) => {
  const {
    beforeWindow = 3, // Aantal tijdpunten voor event
    afterWindow = 5,  // Aantal tijdpunten na event
    topic = null      // Specifiek topic om te analyseren
  } = options;
  
  // Controleer of er data is
  if (!topicTimeseries || !topicTimeseries.timePoints || !topicTimeseries.rawTimePoints || !topicTimeseries.series) {
    return { impact: 0, hasImpact: false };
  }
  
  const { rawTimePoints, series } = topicTimeseries;
  const eventDate = new Date(eventTime);
  const eventTimestamp = eventDate.getTime();
  
  // Vind dichtstbijzijnde tijdpunt
  let eventIndex = -1;
  let minDistance = Infinity;
  
  rawTimePoints.forEach((timePoint, index) => {
    const distance = Math.abs(timePoint.getTime() - eventTimestamp);
    if (distance < minDistance) {
      minDistance = distance;
      eventIndex = index;
    }
  });
  
  if (eventIndex < 0 || eventIndex < beforeWindow || eventIndex + afterWindow >= rawTimePoints.length) {
    return { impact: 0, hasImpact: false };
  }
  
  const results = {};
  
  // Analyseer impact voor elk topic of voor specifiek topic
  const topicsToAnalyze = topic ? [topic] : Object.keys(series);
  
  topicsToAnalyze.forEach(topicName => {
    if (!series[topicName]) return;
    
    const values = series[topicName];
    
    // Bereken gemiddelde voor/na event
    const beforeValues = values.slice(eventIndex - beforeWindow, eventIndex);
    const afterValues = values.slice(eventIndex + 1, eventIndex + 1 + afterWindow);
    
    const beforeAvg = beforeValues.reduce((sum, val) => sum + val, 0) / beforeValues.length;
    const afterAvg = afterValues.reduce((sum, val) => sum + val, 0) / afterValues.length;
    
    // Bereken impact
    const absoluteChange = afterAvg - beforeAvg;
    const percentChange = beforeAvg > 0 ? (absoluteChange / beforeAvg) * 100 : 0;
    const hasImpact = Math.abs(percentChange) >= 10; // Arbitraire drempel
    
    results[topicName] = {
      beforeAvg,
      afterAvg,
      absoluteChange,
      percentChange,
      hasImpact,
      impact: percentChange,
      direction: percentChange > 0 ? 'positive' : percentChange < 0 ? 'negative' : 'neutral',
      beforeValues,
      afterValues
    };
  });
  
  // Als er maar één topic is, return direct dat resultaat
  if (topic && results[topic]) {
    return results[topic];
  }
  
  return {
    byTopic: results,
    topImpacts: Object.entries(results)
      .map(([topic, data]) => ({ topic, ...data }))
      .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
      .slice(0, 5)
  };
};

/**
 * Genereert een samenvatting van topic-event relaties
 * @param {String} topic - Topic naam
 * @param {Array} events - Array van event objecten
 * @param {Object} timeframe - Object met start- en einddatum
 * @param {Object} options - Configuratie opties
 * @returns {Object} Samenvatting van topic-event relaties
 */
export const generateEventSummary = (topic, events, timeframe, options = {}) => {
  const {
    timestampField = 'date',
    titleField = 'title',
    descriptionField = 'description',
    categoryField = 'category',
    impactField = 'impact',
    maxEvents = 5
  } = options;
  
  // Controleer of er data is
  if (!topic || !events || !events.length || !timeframe) {
    return { topic, relatedEvents: [] };
  }
  
  const startDate = new Date(timeframe.startDate);
  const endDate = new Date(timeframe.endDate);
  
  // Filter events binnen tijdsperiode
  const filteredEvents = events
    .filter(event => {
      const eventDate = new Date(event[timestampField]);
      return eventDate >= startDate && eventDate <= endDate;
    })
    .map(event => ({
      title: event[titleField] || 'Onbekend event',
      description: event[descriptionField] || '',
      category: event[categoryField] || 'general',
      date: new Date(event[timestampField]),
      impact: event[impactField] || 0,
      original: event
    }))
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, maxEvents);
  
  // Groepeer events per categorie
  const eventsByCategory = {};
  filteredEvents.forEach(event => {
    if (!eventsByCategory[event.category]) {
      eventsByCategory[event.category] = [];
    }
    eventsByCategory[event.category].push(event);
  });
  
  // Bepaal dominante event categorie
  let dominantCategory = 'general';
  let maxCount = 0;
  
  Object.entries(eventsByCategory).forEach(([category, events]) => {
    if (events.length > maxCount) {
      maxCount = events.length;
      dominantCategory = category;
    }
  });
  
  // Bereken gemiddelde impact
  const avgImpact = filteredEvents.length > 0
    ? filteredEvents.reduce((sum, event) => sum + event.impact, 0) / filteredEvents.length
    : 0;
  
  return {
    topic,
    relatedEvents: filteredEvents,
    eventCount: filteredEvents.length,
    eventsByCategory,
    dominantCategory,
    avgImpact,
    hasPositiveCorrelation: avgImpact > 10,
    hasNegativeCorrelation: avgImpact < -10,
    timeframe: {
      startDate,
      endDate
    }
  };
};

/**
 * Identificeert key events die de grootste impact hebben gehad op topics
 * @param {Object} topicTimeseries - Object met tijdreeksdata voor topics
 * @param {Array} eventsData - Array van event objecten
 * @param {Object} options - Configuratie opties
 * @returns {Array} Array van key events met impact informatie
 */
export const identifyKeyEvents = (topicTimeseries, eventsData, options = {}) => {
  const {
    timestampField = 'date',
    titleField = 'title',
    descriptionField = 'description',
    categoryField = 'category',
    minImpact = 20,
    maxEvents = 10
  } = options;
  
  // Controleer of er data is
  if (!topicTimeseries || !topicTimeseries.timePoints || !topicTimeseries.series || !eventsData || !eventsData.length) {
    return [];
  }
  
  const keyEvents = [];
  
  // Analyseer impact van elk event
  eventsData.forEach(event => {
    const eventDate = new Date(event[timestampField]);
    const impact = calculateEventImpact(topicTimeseries, eventDate, options);
    
    if (impact && impact.byTopic) {
      // Vind topics met significante impact
      const significantTopics = Object.entries(impact.byTopic)
        .filter(([_, data]) => Math.abs(data.percentChange) >= minImpact)
        .map(([topic, data]) => ({
          topic,
          percentChange: data.percentChange,
          direction: data.direction
        }))
        .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));
      
      if (significantTopics.length > 0) {
        keyEvents.push({
          title: event[titleField] || 'Onbekend event',
          description: event[descriptionField] || '',
          category: event[categoryField] || 'general',
          date: eventDate,
          impactedTopics: significantTopics,
          topImpactedTopic: significantTopics[0],
          avgImpact: significantTopics.reduce((sum, t) => sum + Math.abs(t.percentChange), 0) / significantTopics.length,
          original: event
        });
      }
    }
  });
  
  // Sorteer op gemiddelde impact en neem top N
  return keyEvents
    .sort((a, b) => b.avgImpact - a.avgImpact)
    .slice(0, maxEvents);
};

/**
 * Groepeert events op basis van hun impact op topics
 * @param {Array} events - Array van event objecten met impact informatie
 * @param {Object} options - Configuratie opties
 * @returns {Object} Gegroepeerde events op basis van impact
 */
export const groupEventsByImpact = (events, options = {}) => {
  const {
    categoryField = 'category',
    impactThresholds = {
      high: 50,
      medium: 20,
      low: 5
    }
  } = options;
  
  // Controleer of er data is
  if (!events || !events.length) {
    return {
      byImpact: {},
      byCategory: {}
    };
  }
  
  // Groepeer op impact niveau
  const byImpact = {
    high: [],
    medium: [],
    low: [],
    negligible: []
  };
  
  events.forEach(event => {
    const impact = Math.abs(event.avgImpact || 0);
    
    if (impact >= impactThresholds.high) {
      byImpact.high.push(event);
    } else if (impact >= impactThresholds.medium) {
      byImpact.medium.push(event);
    } else if (impact >= impactThresholds.low) {
      byImpact.low.push(event);
    } else {
      byImpact.negligible.push(event);
    }
  });
  
  // Groepeer op categorie
  const byCategory = {};
  
  events.forEach(event => {
    const category = event[categoryField] || 'general';
    
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    
    byCategory[category].push(event);
  });
  
  // Sorteer binnen elke groep op impact
  Object.values(byImpact).forEach(group => {
    group.sort((a, b) => Math.abs(b.avgImpact || 0) - Math.abs(a.avgImpact || 0));
  });
  
  Object.values(byCategory).forEach(group => {
    group.sort((a, b) => Math.abs(b.avgImpact || 0) - Math.abs(a.avgImpact || 0));
  });
  
  return {
    byImpact,
    byCategory,
    topEvents: byImpact.high.concat(byImpact.medium).slice(0, 5)
  };
};
