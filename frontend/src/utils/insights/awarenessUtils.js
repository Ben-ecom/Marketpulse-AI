/**
 * Utilities voor het transformeren van awareness data voor visualisatie
 */

/**
 * Transformeert ruwe awareness data naar chart formaat
 * @param {Array} data Array van awareness data
 * @param {string} platform Platform filter (all, reddit, amazon, instagram, tiktok)
 * @returns {Array} Getransformeerde data voor chart visualisatie
 */
export const transformAwarenessData = (data, platform = 'all') => {
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

  // Transformeer naar chart formaat
  const phaseCounts = {
    'awareness': { phase: 'Awareness', count: 0, platforms: new Set() },
    'consideration': { phase: 'Consideration', count: 0, platforms: new Set() },
    'decision': { phase: 'Decision', count: 0, platforms: new Set() },
    'retention': { phase: 'Retention', count: 0, platforms: new Set() },
    'advocacy': { phase: 'Advocacy', count: 0, platforms: new Set() }
  };
  
  platformData.forEach(platform => {
    if (!platform.awareness || !platform.awareness.byPhase) return;
    
    // Tel items per fase
    Object.entries(platform.awareness.byPhase).forEach(([phase, items]) => {
      if (phaseCounts[phase]) {
        phaseCounts[phase].count += items.length;
        phaseCounts[phase].platforms.add(platform.platform);
      }
    });
  });
  
  // Converteer naar array en sorteer
  return Object.values(phaseCounts)
    .map(item => ({
      ...item,
      platforms: Array.from(item.platforms)
    }));
};

/**
 * Transformeert ruwe awareness data naar timeline formaat
 * @param {Array} data Array van awareness data
 * @param {string} platform Platform filter (all, reddit, amazon, instagram, tiktok)
 * @returns {Array} Getransformeerde data voor timeline visualisatie
 */
export const transformForTimeline = (data, platform = 'all') => {
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

  // Transformeer naar timeline formaat
  const result = [];
  
  platformData.forEach(platform => {
    if (!platform.awareness || !platform.awareness.journey) return;
    
    // Voeg journey items toe
    platform.awareness.journey.forEach(item => {
      result.push({
        ...item,
        platform: platform.platform
      });
    });
  });
  
  // Sorteer op datum
  return result.sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Haalt details op van een specifieke awareness fase
 * @param {Array} data Array van awareness data
 * @param {string} phase Fase (awareness, consideration, decision, retention, advocacy)
 * @param {string} platform Platform filter (all, reddit, amazon, instagram, tiktok)
 * @returns {Object} Details van de awareness fase
 */
export const getAwarenessPhaseDetails = (data, phase, platform = 'all') => {
  if (!data || !data.platforms) return null;
  
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
  
  // Verzamel items voor de fase
  const items = [];
  
  platformData.forEach(platform => {
    if (!platform.awareness || !platform.awareness.byPhase || !platform.awareness.byPhase[phase]) return;
    
    platform.awareness.byPhase[phase].forEach(item => {
      items.push({
        ...item,
        platform: platform.platform
      });
    });
  });
  
  return {
    phase,
    items,
    count: items.length,
    platforms: [...new Set(items.map(item => item.platform))]
  };
};

/**
 * Berekent een awareness score op basis van de data
 * @param {Object} data Awareness data
 * @param {string} platform Platform filter (all, reddit, amazon, instagram, tiktok)
 * @returns {number} Score tussen 0-100
 */
export const calculateAwarenessScore = (data, platform = 'all') => {
  if (!data || !data.platforms) return 0;
  
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
  
  // Bereken score op basis van fase verdeling
  let totalItems = 0;
  let weightedSum = 0;
  
  const phaseWeights = {
    'awareness': 1,
    'consideration': 2,
    'decision': 3,
    'retention': 4,
    'advocacy': 5
  };
  
  platformData.forEach(platform => {
    if (!platform.awareness || !platform.awareness.byPhase) return;
    
    Object.entries(platform.awareness.byPhase).forEach(([phase, items]) => {
      const weight = phaseWeights[phase] || 1;
      const count = items.length;
      
      totalItems += count;
      weightedSum += count * weight;
    });
  });
  
  if (totalItems === 0) return 0;
  
  // Bereken score (0-100)
  const maxPossibleScore = totalItems * 5; // Maximale gewicht is 5
  const normalizedScore = (weightedSum / maxPossibleScore) * 100;
  
  return Math.round(normalizedScore);
};
