/**
 * Topic Awareness Utilities
 * 
 * Functies voor het integreren van trending topics met awareness fasen
 */
import { 
  AWARENESS_PHASES, 
  classifyAwarenessPhase 
} from './awarenessClassification';

/**
 * Classificeert trending topics naar awareness fasen
 * @param {Array} trendingTopics - Array van trending topics
 * @param {Array} data - Array van objecten met tekst
 * @param {string} textField - Naam van het veld dat de tekst bevat
 * @returns {Object} - Object met topics per awareness fase
 */
export const classifyTopicsByAwarenessPhase = (trendingTopics, data, textField = 'text') => {
  if (!trendingTopics || !Array.isArray(trendingTopics) || trendingTopics.length === 0 || 
      !data || !Array.isArray(data) || data.length === 0) {
    return {};
  }
  
  // Initialiseer resultaat
  const result = Object.keys(AWARENESS_PHASES).reduce((acc, key) => {
    acc[AWARENESS_PHASES[key].id] = [];
    return acc;
  }, {});
  
  // Voor elk trending topic
  trendingTopics.forEach(topic => {
    // Vind items die het topic bevatten
    const topicItems = data.filter(item => {
      const text = item[textField] || '';
      return text.toLowerCase().includes(topic.topic.toLowerCase());
    });
    
    if (topicItems.length === 0) {
      // Als er geen items zijn, classificeer op basis van het topic zelf
      const phaseId = classifyAwarenessPhase(topic.topic);
      result[phaseId].push({
        ...topic,
        awarenessPhase: phaseId,
        confidence: 0.5 // Lage confidence omdat we alleen op het topic zelf classificeren
      });
      return;
    }
    
    // Teller voor elke fase
    const phaseCounts = Object.keys(AWARENESS_PHASES).reduce((acc, key) => {
      acc[AWARENESS_PHASES[key].id] = 0;
      return acc;
    }, {});
    
    // Classificeer elk item en tel de fasen
    topicItems.forEach(item => {
      const text = item[textField] || '';
      const phaseId = classifyAwarenessPhase(text);
      phaseCounts[phaseId]++;
    });
    
    // Bepaal dominante fase
    let dominantPhase = Object.keys(phaseCounts)[0];
    let maxCount = phaseCounts[dominantPhase];
    
    Object.entries(phaseCounts).forEach(([phaseId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantPhase = phaseId;
      }
    });
    
    // Bereken confidence (percentage van items in dominante fase)
    const confidence = topicItems.length > 0 ? maxCount / topicItems.length : 0.5;
    
    // Voeg topic toe aan dominante fase
    result[dominantPhase].push({
      ...topic,
      awarenessPhase: dominantPhase,
      confidence,
      itemCount: topicItems.length
    });
  });
  
  return result;
};

/**
 * Berekent de distributie van trending topics over awareness fasen
 * @param {Object} topicsByPhase - Object met topics per awareness fase
 * @returns {Array} - Array met distributie per fase
 */
export const calculateTopicAwarenessDistribution = (topicsByPhase) => {
  if (!topicsByPhase || Object.keys(topicsByPhase).length === 0) {
    return [];
  }
  
  // Bereken totaal aantal topics
  let totalTopics = 0;
  Object.values(topicsByPhase).forEach(topics => {
    totalTopics += topics.length;
  });
  
  // Bereken distributie
  return Object.entries(AWARENESS_PHASES).map(([key, phase]) => {
    const count = topicsByPhase[phase.id]?.length || 0;
    const percentage = totalTopics > 0 ? (count / totalTopics) * 100 : 0;
    
    return {
      id: phase.id,
      name: phase.name,
      description: phase.description,
      color: phase.color,
      count,
      percentage,
      topics: topicsByPhase[phase.id] || []
    };
  }).sort((a, b) => a.id.localeCompare(b.id));
};

/**
 * Genereert content aanbevelingen op basis van awareness fasen en trending topics
 * @param {Object} topicsByPhase - Object met topics per awareness fase
 * @param {Object} options - Opties voor de aanbevelingen
 * @returns {Object} - Object met aanbevelingen per fase
 */
export const generateContentRecommendations = (topicsByPhase, options = {}) => {
  const { 
    productName = 'uw product', 
    industrie = 'uw industrie',
    maxTopicsPerPhase = 3
  } = options;
  
  if (!topicsByPhase || Object.keys(topicsByPhase).length === 0) {
    return {};
  }
  
  const recommendations = {};
  
  // Voor elke awareness fase
  Object.entries(AWARENESS_PHASES).forEach(([key, phase]) => {
    const phaseTopics = topicsByPhase[phase.id] || [];
    
    // Sorteer topics op trending score
    const sortedTopics = [...phaseTopics].sort((a, b) => 
      parseFloat(b.trendingScore) - parseFloat(a.trendingScore)
    );
    
    // Selecteer top topics
    const topTopics = sortedTopics.slice(0, maxTopicsPerPhase);
    
    if (topTopics.length === 0) {
      recommendations[phase.id] = {
        phase: phase.name,
        description: phase.description,
        contentIdeas: [],
        channels: [],
        callToAction: ''
      };
      return;
    }
    
    // Genereer content ideeën op basis van fase en topics
    const contentIdeas = [];
    const channels = [];
    let callToAction = '';
    
    // Unaware fase
    if (phase.id === 'unaware') {
      contentIdeas.push(
        `Educatieve blog over de uitdagingen in ${industrie} rondom ${topTopics.map(t => t.topic).join(', ')}`,
        `Infographic die de impact van ${topTopics[0]?.topic || 'het probleem'} visualiseert`,
        `Podcast interview met een expert over ${topTopics[0]?.topic || 'industrie trends'}`
      );
      
      channels.push('Blog posts', 'Social media', 'Podcasts', 'Infographics');
      
      callToAction = `Ontdek meer over de uitdagingen in ${industrie}`;
    }
    
    // Problem Aware fase
    else if (phase.id === 'problem_aware') {
      contentIdeas.push(
        `Case study over hoe bedrijven worstelen met ${topTopics[0]?.topic || 'het probleem'}`,
        `Webinar over de gevolgen van ${topTopics.map(t => t.topic).join(' en ')}`,
        `Checklist: "Hoe te herkennen of ${topTopics[0]?.topic || 'dit probleem'} uw bedrijf beïnvloedt"`
      );
      
      channels.push('Webinars', 'Case studies', 'Checklists', 'Email nurturing');
      
      callToAction = `Ontdek de impact van ${topTopics[0]?.topic || 'dit probleem'} op uw bedrijf`;
    }
    
    // Solution Aware fase
    else if (phase.id === 'solution_aware') {
      contentIdeas.push(
        `Vergelijkingsgids: verschillende oplossingen voor ${topTopics[0]?.topic || 'dit probleem'}`,
        `Whitepaper over best practices voor ${topTopics.map(t => t.topic).join(' en ')}`,
        `Expert interview: "Zo pakt u ${topTopics[0]?.topic || 'dit probleem'} effectief aan"`
      );
      
      channels.push('Whitepapers', 'Vergelijkingsgidsen', 'Webinars', 'Email sequences');
      
      callToAction = `Ontdek de beste oplossingsstrategieën voor ${topTopics[0]?.topic || 'uw uitdagingen'}`;
    }
    
    // Product Aware fase
    else if (phase.id === 'product_aware') {
      contentIdeas.push(
        `Productdemo: hoe ${productName} ${topTopics[0]?.topic || 'uw uitdagingen'} oplost`,
        `Klantcase: "Zo verbeterde bedrijf X hun ${topTopics[0]?.topic || 'resultaten'} met ${productName}"`,
        `ROI calculator voor ${productName} gericht op ${topTopics.map(t => t.topic).join(' en ')}`
      );
      
      channels.push('Productdemo\'s', 'Klantcases', 'ROI calculators', 'Vergelijkingstabellen');
      
      callToAction = `Ontdek hoe ${productName} uw ${topTopics[0]?.topic || 'uitdagingen'} oplost`;
    }
    
    // Most Aware fase
    else if (phase.id === 'most_aware') {
      contentIdeas.push(
        `Speciale aanbieding: ${productName} voor ${topTopics[0]?.topic || 'uw behoeften'}`,
        `Implementatiegids: "In 3 stappen aan de slag met ${productName}"`,
        `Testimonial video: "Zo transformeerde ${productName} onze aanpak van ${topTopics[0]?.topic || 'het probleem'}"`
      );
      
      channels.push('Email campagnes', 'Retargeting ads', 'Testimonials', 'Implementatiegidsen');
      
      callToAction = `Schaf ${productName} vandaag nog aan`;
    }
    
    recommendations[phase.id] = {
      phase: phase.name,
      description: phase.description,
      topics: topTopics,
      contentIdeas,
      channels,
      callToAction
    };
  });
  
  return recommendations;
};

export default {
  classifyTopicsByAwarenessPhase,
  calculateTopicAwarenessDistribution,
  generateContentRecommendations
};
