/**
 * Utilities voor het visualiseren van trending topics en het genereren van inzichtsrapporten
 */

/**
 * Bereidt data voor voor het plotten van topic trends
 * @param {Object} topicsData - Object met tijdreeksdata voor topics
 * @param {Object} options - Configuratie opties
 * @param {String} options.timeframe - Tijdsperiode ('day', 'week', 'month', 'quarter', 'year')
 * @param {Number} options.topN - Aantal top topics om te visualiseren
 * @param {Array} options.selectedTopics - Specifieke topics om te visualiseren
 * @param {Boolean} options.normalize - Of de data genormaliseerd moet worden
 * @returns {Object} Data voorbereid voor visualisatie
 */
export const prepareTopicTrendsData = (topicsData, options = {}) => {
  const {
    timeframe = 'all',
    topN = 10,
    selectedTopics = [],
    normalize = false
  } = options;
  
  // Controleer of er data is
  if (!topicsData || !topicsData.timePoints || !topicsData.timePoints.length || !topicsData.series) {
    return { 
      chartData: [], 
      topicList: [], 
      timePoints: [], 
      isEmpty: true 
    };
  }
  
  const { timePoints, series, rawTimePoints } = topicsData;
  
  // Filter data op basis van timeframe
  let filteredTimePoints = timePoints;
  let filteredRawTimePoints = rawTimePoints;
  let filteredSeries = { ...series };
  
  if (timeframe !== 'all') {
    const now = new Date();
    let startDate = new Date();
    
    // Bepaal startdatum op basis van timeframe
    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // Filter tijdpunten
    const startIndex = rawTimePoints.findIndex(date => date >= startDate);
    if (startIndex >= 0) {
      filteredTimePoints = timePoints.slice(startIndex);
      filteredRawTimePoints = rawTimePoints.slice(startIndex);
      
      // Filter series
      Object.keys(filteredSeries).forEach(topic => {
        filteredSeries[topic] = series[topic].slice(startIndex);
      });
    }
  }
  
  // Bepaal welke topics te visualiseren
  let topicsToShow = [];
  
  if (selectedTopics.length > 0) {
    // Gebruik geselecteerde topics
    topicsToShow = selectedTopics.filter(topic => filteredSeries[topic]);
  } else {
    // Bereken totale frequentie per topic
    const topicTotals = Object.entries(filteredSeries).map(([topic, values]) => {
      const total = values.reduce((sum, val) => sum + val, 0);
      return { topic, total };
    });
    
    // Sorteer op totale frequentie en neem top N
    topicsToShow = topicTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, topN)
      .map(item => item.topic);
  }
  
  // Normaliseer data indien nodig
  if (normalize) {
    topicsToShow.forEach(topic => {
      const values = filteredSeries[topic];
      const max = Math.max(...values);
      
      if (max > 0) {
        filteredSeries[topic] = values.map(val => (val / max) * 100);
      }
    });
  }
  
  // Bereid data voor voor chart
  const chartData = filteredTimePoints.map((timePoint, index) => {
    const dataPoint = { name: timePoint };
    
    topicsToShow.forEach(topic => {
      dataPoint[topic] = filteredSeries[topic][index];
    });
    
    return dataPoint;
  });
  
  return {
    chartData,
    topicList: topicsToShow,
    timePoints: filteredTimePoints,
    rawTimePoints: filteredRawTimePoints,
    isEmpty: chartData.length === 0 || topicsToShow.length === 0
  };
};

/**
 * Genereert een tekstueel rapport van trending topics
 * @param {Object} topicsData - Object met tijdreeksdata voor topics
 * @param {Object} timeframe - Object met start- en einddatum
 * @param {Object} options - Configuratie opties
 * @returns {Object} Tekstueel rapport van trending topics
 */
export const generateTrendReport = (topicsData, timeframe, options = {}) => {
  const {
    format = 'markdown',
    topN = 10,
    includeStats = true,
    includeEmergingTopics = true,
    includeDecliningTopics = true
  } = options;
  
  // Controleer of er data is
  if (!topicsData || !topicsData.timePoints || !topicsData.series) {
    return { content: 'Geen data beschikbaar voor trendrapport.', isEmpty: true };
  }
  
  const { timePoints, series } = topicsData;
  const startDate = new Date(timeframe.startDate);
  const endDate = new Date(timeframe.endDate);
  
  // Bereken totale frequentie per topic
  const topicTotals = Object.entries(series).map(([topic, values]) => {
    const total = values.reduce((sum, val) => sum + val, 0);
    return { topic, total };
  });
  
  // Sorteer op totale frequentie en neem top N
  const topTopics = topicTotals
    .sort((a, b) => b.total - a.total)
    .slice(0, topN);
  
  // Bereken trend voor elk topic
  const topicTrends = Object.entries(series).map(([topic, values]) => {
    if (values.length < 2) return { topic, trend: 0 };
    
    // Bereken trend als verschil tussen eerste en laatste helft
    const midpoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midpoint);
    const secondHalf = values.slice(midpoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    let trend = 0;
    if (firstHalfAvg > 0) {
      trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    } else if (secondHalfAvg > 0) {
      trend = 100; // Oneindig groeipercentage, afgerond naar 100%
    }
    
    return {
      topic,
      trend,
      firstHalfAvg,
      secondHalfAvg,
      direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
    };
  });
  
  // Identificeer opkomende en afnemende topics
  const emergingTopics = topicTrends
    .filter(item => item.trend > 20 && item.secondHalfAvg > 1) // Minimaal 20% groei en gemiddelde > 1
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 5);
  
  const decliningTopics = topicTrends
    .filter(item => item.trend < -20 && item.firstHalfAvg > 1) // Minimaal 20% daling en gemiddelde > 1
    .sort((a, b) => a.trend - b.trend)
    .slice(0, 5);
  
  // Genereer rapport inhoud op basis van formaat
  let content = '';
  
  if (format === 'markdown') {
    // Markdown formaat
    content += `# Trending Topics Rapport\n\n`;
    content += `Periode: ${startDate.toLocaleDateString()} tot ${endDate.toLocaleDateString()}\n\n`;
    
    content += `## Top ${topTopics.length} Topics\n\n`;
    topTopics.forEach((item, index) => {
      const trendInfo = topicTrends.find(t => t.topic === item.topic);
      const trendSymbol = trendInfo && trendInfo.direction === 'up' ? '↑' : 
                          trendInfo && trendInfo.direction === 'down' ? '↓' : '→';
      const trendValue = trendInfo ? Math.abs(trendInfo.trend).toFixed(1) : '0.0';
      
      content += `${index + 1}. **${item.topic}** (${item.total} vermeldingen) ${trendSymbol} ${trendValue}%\n`;
    });
    
    if (includeEmergingTopics && emergingTopics.length > 0) {
      content += `\n## Opkomende Topics\n\n`;
      emergingTopics.forEach((item, index) => {
        content += `${index + 1}. **${item.topic}** (+${item.trend.toFixed(1)}%)\n`;
      });
    }
    
    if (includeDecliningTopics && decliningTopics.length > 0) {
      content += `\n## Afnemende Topics\n\n`;
      decliningTopics.forEach((item, index) => {
        content += `${index + 1}. **${item.topic}** (${item.trend.toFixed(1)}%)\n`;
      });
    }
    
    if (includeStats) {
      content += `\n## Statistieken\n\n`;
      content += `- Totaal aantal unieke topics: ${Object.keys(series).length}\n`;
      content += `- Gemiddeld aantal vermeldingen per topic: ${(topicTotals.reduce((sum, item) => sum + item.total, 0) / topicTotals.length).toFixed(1)}\n`;
      content += `- Aantal tijdpunten in analyse: ${timePoints.length}\n`;
    }
  } else if (format === 'html') {
    // HTML formaat
    content += `<h1>Trending Topics Rapport</h1>`;
    content += `<p>Periode: ${startDate.toLocaleDateString()} tot ${endDate.toLocaleDateString()}</p>`;
    
    content += `<h2>Top ${topTopics.length} Topics</h2>`;
    content += `<ol>`;
    topTopics.forEach(item => {
      const trendInfo = topicTrends.find(t => t.topic === item.topic);
      const trendSymbol = trendInfo && trendInfo.direction === 'up' ? '↑' : 
                          trendInfo && trendInfo.direction === 'down' ? '↓' : '→';
      const trendValue = trendInfo ? Math.abs(trendInfo.trend).toFixed(1) : '0.0';
      
      content += `<li><strong>${item.topic}</strong> (${item.total} vermeldingen) ${trendSymbol} ${trendValue}%</li>`;
    });
    content += `</ol>`;
    
    if (includeEmergingTopics && emergingTopics.length > 0) {
      content += `<h2>Opkomende Topics</h2>`;
      content += `<ol>`;
      emergingTopics.forEach(item => {
        content += `<li><strong>${item.topic}</strong> (+${item.trend.toFixed(1)}%)</li>`;
      });
      content += `</ol>`;
    }
    
    if (includeDecliningTopics && decliningTopics.length > 0) {
      content += `<h2>Afnemende Topics</h2>`;
      content += `<ol>`;
      decliningTopics.forEach(item => {
        content += `<li><strong>${item.topic}</strong> (${item.trend.toFixed(1)}%)</li>`;
      });
      content += `</ol>`;
    }
    
    if (includeStats) {
      content += `<h2>Statistieken</h2>`;
      content += `<ul>`;
      content += `<li>Totaal aantal unieke topics: ${Object.keys(series).length}</li>`;
      content += `<li>Gemiddeld aantal vermeldingen per topic: ${(topicTotals.reduce((sum, item) => sum + item.total, 0) / topicTotals.length).toFixed(1)}</li>`;
      content += `<li>Aantal tijdpunten in analyse: ${timePoints.length}</li>`;
      content += `</ul>`;
    }
  } else {
    // Platte tekst formaat
    content += `TRENDING TOPICS RAPPORT\n\n`;
    content += `Periode: ${startDate.toLocaleDateString()} tot ${endDate.toLocaleDateString()}\n\n`;
    
    content += `TOP ${topTopics.length} TOPICS\n\n`;
    topTopics.forEach((item, index) => {
      const trendInfo = topicTrends.find(t => t.topic === item.topic);
      const trendSymbol = trendInfo && trendInfo.direction === 'up' ? '↑' : 
                          trendInfo && trendInfo.direction === 'down' ? '↓' : '→';
      const trendValue = trendInfo ? Math.abs(trendInfo.trend).toFixed(1) : '0.0';
      
      content += `${index + 1}. ${item.topic} (${item.total} vermeldingen) ${trendSymbol} ${trendValue}%\n`;
    });
    
    if (includeEmergingTopics && emergingTopics.length > 0) {
      content += `\nOPKOMENDE TOPICS\n\n`;
      emergingTopics.forEach((item, index) => {
        content += `${index + 1}. ${item.topic} (+${item.trend.toFixed(1)}%)\n`;
      });
    }
    
    if (includeDecliningTopics && decliningTopics.length > 0) {
      content += `\nAFNEMENDE TOPICS\n\n`;
      decliningTopics.forEach((item, index) => {
        content += `${index + 1}. ${item.topic} (${item.trend.toFixed(1)}%)\n`;
      });
    }
    
    if (includeStats) {
      content += `\nSTATISTIEKEN\n\n`;
      content += `- Totaal aantal unieke topics: ${Object.keys(series).length}\n`;
      content += `- Gemiddeld aantal vermeldingen per topic: ${(topicTotals.reduce((sum, item) => sum + item.total, 0) / topicTotals.length).toFixed(1)}\n`;
      content += `- Aantal tijdpunten in analyse: ${timePoints.length}\n`;
    }
  }
  
  return {
    content,
    topTopics,
    emergingTopics,
    decliningTopics,
    format,
    timeframe: {
      startDate,
      endDate
    },
    isEmpty: false
  };
};

/**
 * Bereidt data voor voor het maken van een topic heatmap
 * @param {Object} topicsData - Object met tijdreeksdata voor topics
 * @param {Object} timeframe - Object met start- en einddatum
 * @param {Object} options - Configuratie opties
 * @returns {Object} Data voorbereid voor heatmap visualisatie
 */
export const prepareTopicHeatmapData = (topicsData, timeframe, options = {}) => {
  const {
    topN = 20,
    selectedTopics = [],
    normalize = true
  } = options;
  
  // Controleer of er data is
  if (!topicsData || !topicsData.timePoints || !topicsData.series) {
    return { 
      heatmapData: [], 
      topicList: [], 
      timePoints: [], 
      isEmpty: true 
    };
  }
  
  const { timePoints, series } = topicsData;
  
  // Bepaal welke topics te visualiseren
  let topicsToShow = [];
  
  if (selectedTopics.length > 0) {
    // Gebruik geselecteerde topics
    topicsToShow = selectedTopics.filter(topic => series[topic]);
  } else {
    // Bereken totale frequentie per topic
    const topicTotals = Object.entries(series).map(([topic, values]) => {
      const total = values.reduce((sum, val) => sum + val, 0);
      return { topic, total };
    });
    
    // Sorteer op totale frequentie en neem top N
    topicsToShow = topicTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, topN)
      .map(item => item.topic);
  }
  
  // Bereid data voor voor heatmap
  const heatmapData = [];
  
  topicsToShow.forEach(topic => {
    const values = series[topic];
    
    // Normaliseer waarden indien nodig
    let normalizedValues = values;
    if (normalize) {
      const max = Math.max(...values);
      if (max > 0) {
        normalizedValues = values.map(val => (val / max) * 100);
      }
    }
    
    // Voeg data toe voor elk tijdpunt
    timePoints.forEach((timePoint, index) => {
      heatmapData.push({
        topic,
        timePoint,
        value: values[index],
        normalizedValue: normalizedValues[index]
      });
    });
  });
  
  return {
    heatmapData,
    topicList: topicsToShow,
    timePoints,
    isEmpty: heatmapData.length === 0
  };
};

/**
 * Exporteert trend data naar verschillende formaten
 * @param {Object} topicsData - Object met tijdreeksdata voor topics
 * @param {Object} options - Configuratie opties
 * @returns {Object} Geëxporteerde data in het opgegeven formaat
 */
export const exportTrendData = (topicsData, options = {}) => {
  const {
    format = 'csv',
    includeRaw = false,
    selectedTopics = [],
    filename = 'trending_topics_export'
  } = options;
  
  // Controleer of er data is
  if (!topicsData || !topicsData.timePoints || !topicsData.series) {
    return { success: false, error: 'Geen data beschikbaar voor export.' };
  }
  
  const { timePoints, series, rawTimePoints } = topicsData;
  
  // Bepaal welke topics te exporteren
  const topicsToExport = selectedTopics.length > 0
    ? selectedTopics.filter(topic => series[topic])
    : Object.keys(series);
  
  let exportData = '';
  let jsonData = [];
  let blobType = '';
  
  if (format === 'csv') {
    // CSV formaat
    // Header rij
    exportData += `Timestamp,${topicsToExport.join(',')}\n`;
    
    // Data rijen
    timePoints.forEach((timePoint, index) => {
      const timestamp = includeRaw && rawTimePoints ? rawTimePoints[index].toISOString() : timePoint;
      const values = topicsToExport.map(topic => series[topic][index]);
      
      exportData += `${timestamp},${values.join(',')}\n`;
    });
    
    blobType = 'text/csv';
  } else if (format === 'json') {
    // JSON formaat
    if (includeRaw && rawTimePoints) {
      // Tijdpunten als ISO strings
      rawTimePoints.forEach((timePoint, index) => {
        const dataPoint = {
          timestamp: timePoint.toISOString(),
          formattedTimestamp: timePoints[index]
        };
        
        topicsToExport.forEach(topic => {
          dataPoint[topic] = series[topic][index];
        });
        
        jsonData.push(dataPoint);
      });
    } else {
      // Tijdpunten als geformatteerde strings
      timePoints.forEach((timePoint, index) => {
        const dataPoint = {
          timestamp: timePoint
        };
        
        topicsToExport.forEach(topic => {
          dataPoint[topic] = series[topic][index];
        });
        
        jsonData.push(dataPoint);
      });
    }
    
    exportData = JSON.stringify(jsonData, null, 2);
    blobType = 'application/json';
  } else if (format === 'excel') {
    // Excel formaat (CSV met BOM voor Excel)
    // Header rij
    exportData += `\uFEFFTimestamp,${topicsToExport.join(',')}\n`;
    
    // Data rijen
    timePoints.forEach((timePoint, index) => {
      const timestamp = includeRaw && rawTimePoints ? rawTimePoints[index].toISOString() : timePoint;
      const values = topicsToExport.map(topic => series[topic][index]);
      
      exportData += `${timestamp},${values.join(',')}\n`;
    });
    
    blobType = 'text/csv';
  }
  
  // Maak download link
  const blob = new Blob([exportData], { type: blobType });
  const url = URL.createObjectURL(blob);
  
  return {
    success: true,
    url,
    filename: `${filename}.${format === 'excel' ? 'csv' : format}`,
    data: format === 'json' ? jsonData : exportData
  };
};

/**
 * Bereidt data voor voor het maken van een topic vergelijkingsgrafiek
 * @param {Array} topics - Array van topics om te vergelijken
 * @param {Object} topicsData - Object met tijdreeksdata voor topics
 * @param {Object} options - Configuratie opties
 * @returns {Object} Data voorbereid voor vergelijkingsgrafiek
 */
export const prepareTopicComparisonData = (topics, topicsData, options = {}) => {
  const {
    normalize = true,
    smoothing = false,
    smoothingWindow = 3,
    cumulative = false
  } = options;
  
  // Controleer of er data is
  if (!topics || !topics.length || !topicsData || !topicsData.timePoints || !topicsData.series) {
    return { 
      comparisonData: [], 
      topics: [], 
      timePoints: [], 
      isEmpty: true 
    };
  }
  
  const { timePoints, series } = topicsData;
  
  // Filter op beschikbare topics
  const availableTopics = topics.filter(topic => series[topic]);
  
  if (availableTopics.length === 0) {
    return { 
      comparisonData: [], 
      topics: [], 
      timePoints: [], 
      isEmpty: true 
    };
  }
  
  // Bereid data voor voor vergelijking
  let processedSeries = {};
  
  // Kopieer originele series
  availableTopics.forEach(topic => {
    processedSeries[topic] = [...series[topic]];
  });
  
  // Pas smoothing toe indien nodig
  if (smoothing) {
    availableTopics.forEach(topic => {
      processedSeries[topic] = applyMovingAverage(processedSeries[topic], smoothingWindow);
    });
  }
  
  // Pas cumulatieve waarden toe indien nodig
  if (cumulative) {
    availableTopics.forEach(topic => {
      let runningTotal = 0;
      processedSeries[topic] = processedSeries[topic].map(val => {
        runningTotal += val;
        return runningTotal;
      });
    });
  }
  
  // Normaliseer waarden indien nodig
  if (normalize) {
    availableTopics.forEach(topic => {
      const max = Math.max(...processedSeries[topic]);
      if (max > 0) {
        processedSeries[topic] = processedSeries[topic].map(val => (val / max) * 100);
      }
    });
  }
  
  // Bereid data voor voor chart
  const comparisonData = timePoints.map((timePoint, index) => {
    const dataPoint = { name: timePoint };
    
    availableTopics.forEach(topic => {
      dataPoint[topic] = processedSeries[topic][index];
    });
    
    return dataPoint;
  });
  
  return {
    comparisonData,
    topics: availableTopics,
    timePoints,
    isEmpty: comparisonData.length === 0
  };
};

/**
 * Past een voortschrijdend gemiddelde toe op een tijdreeks
 * @param {Array} values - Array van waarden
 * @param {Number} windowSize - Grootte van het voortschrijdend gemiddelde venster
 * @returns {Array} Array van gladgestreken waarden
 */
const applyMovingAverage = (values, windowSize) => {
  if (!values || values.length < windowSize) {
    return values;
  }
  
  const result = [];
  
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    let count = 0;
    
    // Bereken gemiddelde over venster
    for (let j = Math.max(0, i - Math.floor(windowSize / 2)); j <= Math.min(values.length - 1, i + Math.floor(windowSize / 2)); j++) {
      sum += values[j];
      count++;
    }
    
    result.push(count > 0 ? sum / count : values[i]);
  }
  
  return result;
};
