/**
 * Utilities voor het transformeren van taalgebruik data voor visualisatie
 */

/**
 * Transformeert ruwe terminologie data naar tag cloud formaat
 * @param {Array} data Array van terminologie data
 * @param {string} platform Platform filter (all, reddit, amazon, instagram, tiktok)
 * @returns {Array} Getransformeerde data voor tag cloud visualisatie
 */
export const transformToTagCloudData = (data, platform = 'all') => {
  if (!data || !data.platforms) return [];

  // Filter data op platform
  let platformData = [];
  if (platform === 'all') {
    // Combineer data van alle platforms
    platformData = data.platforms;
  } else {
    // Filter op specifiek platform
    const filtered = data.platforms.find(p => p.platform === platform);
    if (filtered) {
      platformData = [filtered];
    }
  }

  // Transformeer naar tag cloud formaat
  const termCounts = {};
  
  platformData.forEach(platform => {
    if (!platform.terminology || !platform.terminology.all) return;
    
    // Combineer termen van alle platforms
    platform.terminology.all.forEach(term => {
      if (termCounts[term.term]) {
        termCounts[term.term].value += term.frequency;
        termCounts[term.term].platforms.add(platform.platform);
      } else {
        termCounts[term.term] = {
          text: term.term,
          value: term.frequency,
          platforms: new Set([platform.platform]),
          context: term.context
        };
      }
    });
  });
  
  // Converteer naar array en sorteer
  return Object.values(termCounts)
    .map(term => ({
      ...term,
      platforms: Array.from(term.platforms)
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Filtert terminologie data op basis van zoekterm
 * @param {Array} data Array van terminologie data
 * @param {string} searchTerm Zoekterm
 * @returns {Array} Gefilterde data
 */
export const filterBySearchTerm = (data, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') return data;
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  return data.filter(item => 
    item.text.toLowerCase().includes(lowerCaseSearchTerm)
  );
};

/**
 * Groepeert terminologie data per platform
 * @param {Array} data Array van terminologie data
 * @returns {Object} Gegroepeerde data per platform
 */
export const groupByPlatform = (data) => {
  const result = {
    reddit: [],
    amazon: [],
    instagram: [],
    tiktok: []
  };
  
  data.forEach(item => {
    item.platforms.forEach(platform => {
      if (result[platform]) {
        result[platform].push(item);
      }
    });
  });
  
  // Sorteer elke groep
  Object.keys(result).forEach(platform => {
    result[platform] = result[platform].sort((a, b) => b.value - a.value);
  });
  
  return result;
};

/**
 * Haalt details op van een specifieke term
 * @param {Array} data Array van terminologie data
 * @param {string} term De term om details voor op te halen
 * @returns {Object} Details van de term
 */
export const getTermDetails = (data, term) => {
  if (!data || !data.platforms) return null;
  
  const result = {
    term,
    occurrences: [],
    totalFrequency: 0,
    platforms: new Set()
  };
  
  // Zoek door alle platforms
  for (const platform of data.platforms) {
    if (!platform.terminology || !platform.terminology.all) continue;
    
    // Zoek term in platform
    const termData = platform.terminology.all.find(t => t.term === term);
    if (termData) {
      result.occurrences.push({
        platform: platform.platform,
        frequency: termData.frequency,
        context: termData.context
      });
      
      result.totalFrequency += termData.frequency;
      result.platforms.add(platform.platform);
    }
  }
  
  result.platforms = Array.from(result.platforms);
  
  return result.occurrences.length > 0 ? result : null;
};
