/**
 * Utilities voor het transformeren van verlangens data voor visualisatie
 */

/**
 * Transformeert ruwe verlangens data naar chart formaat
 * @param {Array} data Array van verlangens data
 * @param {string} platform Platform filter (all, reddit, amazon, instagram, tiktok)
 * @returns {Array} Getransformeerde data voor chart visualisatie
 */
export const transformToChartData = (data, platform = 'all') => {
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
  const categoryCounts = {};
  
  platformData.forEach(platform => {
    if (!platform.desires || !platform.desires.byCategory) return;
    
    // Tel items per categorie
    Object.entries(platform.desires.byCategory).forEach(([category, items]) => {
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
 * Transformeert ruwe verlangens data naar treemap formaat
 * @param {Array} data Array van verlangens data
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
    if (!platform.desires || !platform.desires.byCategory) return;
    
    // Voeg categorieën toe
    Object.entries(platform.desires.byCategory).forEach(([category, items]) => {
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
 * Haalt details op van een specifiek verlangen
 * @param {Array} data Array van verlangens data
 * @param {string} itemId ID van het verlangen
 * @returns {Object} Details van het verlangen
 */
export const getDesireDetails = (data, itemId) => {
  if (!data || !data.platforms) return null;
  
  // Zoek door alle platforms
  for (const platform of data.platforms) {
    if (!platform.desires || !platform.desires.byCategory) continue;
    
    // Zoek door alle categorieën
    for (const [category, items] of Object.entries(platform.desires.byCategory)) {
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
