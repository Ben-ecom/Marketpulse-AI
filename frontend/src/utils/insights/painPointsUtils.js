/**
 * Utilities voor het transformeren van pijnpunten data voor visualisatie
 */

/**
 * Transformeert ruwe pijnpunten data naar treemap formaat
 * @param {Array} data Array van pijnpunten data
 * @param {string} platform Platform filter (all, reddit, amazon, instagram, tiktok)
 * @returns {Array} Getransformeerde data voor treemap visualisatie
 */
export const transformToTreemapData = (data, platform = 'all') => {
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

  // Transformeer naar treemap formaat
  const result = [];
  
  platformData.forEach(platform => {
    if (!platform.painPoints || !platform.painPoints.byCategory) return;
    
    // Voeg categorieën toe
    Object.entries(platform.painPoints.byCategory).forEach(([category, items]) => {
      // Maak category node
      const categoryNode = {
        name: category,
        children: [],
        platform: platform.platform
      };
      
      // Voeg items toe aan category
      items.forEach(item => {
        categoryNode.children.push({
          name: item.text,
          value: 1, // Default waarde
          id: item.id,
          platform: platform.platform
        });
      });
      
      result.push(categoryNode);
    });
  });
  
  return result;
};

/**
 * Transformeert ruwe pijnpunten data naar bar chart formaat
 * @param {Array} data Array van pijnpunten data
 * @param {string} platform Platform filter (all, reddit, amazon, instagram, tiktok)
 * @returns {Array} Getransformeerde data voor bar chart visualisatie
 */
export const transformToBarChartData = (data, platform = 'all') => {
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

  // Transformeer naar bar chart formaat
  const categoryCounts = {};
  
  platformData.forEach(platform => {
    if (!platform.painPoints || !platform.painPoints.byCategory) return;
    
    // Tel items per categorie
    Object.entries(platform.painPoints.byCategory).forEach(([category, items]) => {
      if (!categoryCounts[category]) {
        categoryCounts[category] = {
          category,
          count: 0,
          platforms: new Set()
        };
      }
      
      categoryCounts[category].count += items.length;
      categoryCounts[category].platforms.add(platform.platform);
    });
  });
  
  // Converteer naar array en sorteer
  return Object.values(categoryCounts)
    .map(item => ({
      ...item,
      platforms: Array.from(item.platforms)
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Haalt details op van een specifiek pijnpunt
 * @param {Array} data Array van pijnpunten data
 * @param {string} itemId ID van het pijnpunt
 * @returns {Object} Details van het pijnpunt
 */
export const getPainPointDetails = (data, itemId) => {
  if (!data || !data.platforms) return null;
  
  // Zoek door alle platforms
  for (const platform of data.platforms) {
    if (!platform.painPoints || !platform.painPoints.byCategory) continue;
    
    // Zoek door alle categorieën
    for (const [category, items] of Object.entries(platform.painPoints.byCategory)) {
      // Zoek item met matching ID
      const item = items.find(i => i.id === itemId);
      if (item) {
        return {
          ...item,
          category,
          platform: platform.platform
        };
      }
    }
  }
  
  return null;
};
