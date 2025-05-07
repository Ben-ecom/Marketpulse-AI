/**
 * Topic Awareness Report Utilities
 * 
 * Functies voor het genereren van gedetailleerde rapporten over trending topics
 * en hun relatie tot awareness fasen.
 */
import { AWARENESS_PHASES } from '../insights/awarenessClassification';

/**
 * Genereert een executive summary van de topic awareness analyse
 * @param {Object} topicsByPhase - Object met topics per awareness fase
 * @param {Array} awarenessDistribution - Distributie van topics over awareness fasen
 * @param {Object} options - Opties voor de summary
 * @returns {String} - Executive summary tekst
 */
export const generateExecutiveSummary = (topicsByPhase, awarenessDistribution, options = {}) => {
  const { 
    productName = 'uw product', 
    industrie = 'uw industrie',
    projectName = 'dit project'
  } = options;
  
  if (!topicsByPhase || Object.keys(topicsByPhase).length === 0 || 
      !awarenessDistribution || awarenessDistribution.length === 0) {
    return `Er zijn onvoldoende gegevens beschikbaar om een executive summary te genereren voor ${projectName}.`;
  }
  
  // Bepaal dominante fase
  let dominantPhase = awarenessDistribution[0];
  awarenessDistribution.forEach(phase => {
    if (phase.count > dominantPhase.count) {
      dominantPhase = phase;
    }
  });
  
  // Bepaal top topics per fase (max 3 per fase)
  const topTopicsByPhase = {};
  Object.entries(topicsByPhase).forEach(([phaseId, topics]) => {
    topTopicsByPhase[phaseId] = [...topics]
      .sort((a, b) => parseFloat(b.trendingScore) - parseFloat(a.trendingScore))
      .slice(0, 3);
  });
  
  // Genereer summary
  let summary = `# Executive Summary: Topic Awareness Analyse voor ${projectName}\n\n`;
  
  // Algemeen overzicht
  summary += `## Algemeen Overzicht\n\n`;
  summary += `Deze analyse combineert trending topics met awareness fasen om inzicht te geven in de huidige staat van awareness binnen ${industrie}. `;
  summary += `In totaal zijn er ${Object.values(topicsByPhase).reduce((total, topics) => total + topics.length, 0)} trending topics geïdentificeerd en geclassificeerd.\n\n`;
  
  // Dominante fase
  summary += `## Dominante Awareness Fase\n\n`;
  summary += `De dominante awareness fase is **${dominantPhase.name}** (${dominantPhase.percentage.toFixed(1)}% van alle topics). `;
  
  if (dominantPhase.id === 'unaware') {
    summary += `Dit betekent dat uw doelgroep zich nog niet bewust is van de problemen die ${productName} oplost. `;
    summary += `Focus op educatieve content die het probleem introduceert.\n\n`;
  } else if (dominantPhase.id === 'problem_aware') {
    summary += `Dit betekent dat uw doelgroep zich bewust is van de problemen, maar nog niet van de oplossingen. `;
    summary += `Focus op content die de impact van het probleem benadrukt en hint naar mogelijke oplossingen.\n\n`;
  } else if (dominantPhase.id === 'solution_aware') {
    summary += `Dit betekent dat uw doelgroep zich bewust is van mogelijke oplossingen, maar nog niet specifiek van ${productName}. `;
    summary += `Focus op content die de voordelen van uw specifieke oplossing benadrukt ten opzichte van alternatieven.\n\n`;
  } else if (dominantPhase.id === 'product_aware') {
    summary += `Dit betekent dat uw doelgroep zich bewust is van ${productName}, maar nog niet overtuigd is om tot actie over te gaan. `;
    summary += `Focus op content die twijfels wegneemt en vertrouwen opbouwt.\n\n`;
  } else if (dominantPhase.id === 'most_aware') {
    summary += `Dit betekent dat uw doelgroep volledig bewust is van ${productName} en klaar is om tot actie over te gaan. `;
    summary += `Focus op content die de laatste drempels wegneemt en directe actie stimuleert.\n\n`;
  }
  
  // Top topics per fase
  summary += `## Top Trending Topics per Awareness Fase\n\n`;
  
  Object.entries(AWARENESS_PHASES).forEach(([key, phase]) => {
    const phaseTopics = topTopicsByPhase[phase.id] || [];
    
    if (phaseTopics.length > 0) {
      summary += `### ${phase.name}\n\n`;
      
      phaseTopics.forEach((topic, index) => {
        summary += `${index + 1}. **${topic.topic}** (Score: ${topic.trendingScore.toFixed(2)})\n`;
      });
      
      summary += `\n`;
    }
  });
  
  // Strategische aanbevelingen
  summary += `## Strategische Aanbevelingen\n\n`;
  
  if (dominantPhase.id === 'unaware') {
    summary += `1. Creëer educatieve content rondom de topics: ${topTopicsByPhase.unaware?.map(t => t.topic).join(', ') || 'N/A'}\n`;
    summary += `2. Gebruik sociale media en PR om bewustzijn te creëren\n`;
    summary += `3. Focus op het definiëren van het probleem, niet op uw oplossing\n\n`;
  } else if (dominantPhase.id === 'problem_aware') {
    summary += `1. Benadruk de impact van de problemen gerelateerd aan: ${topTopicsByPhase.problem_aware?.map(t => t.topic).join(', ') || 'N/A'}\n`;
    summary += `2. Deel case studies die de gevolgen van het probleem illustreren\n`;
    summary += `3. Begin met het introduceren van oplossingsrichtingen\n\n`;
  } else if (dominantPhase.id === 'solution_aware') {
    summary += `1. Vergelijk verschillende oplossingen voor: ${topTopicsByPhase.solution_aware?.map(t => t.topic).join(', ') || 'N/A'}\n`;
    summary += `2. Benadruk de unieke voordelen van ${productName}\n`;
    summary += `3. Deel expert content en whitepapers\n\n`;
  } else if (dominantPhase.id === 'product_aware') {
    summary += `1. Deel gedetailleerde productdemo's gericht op: ${topTopicsByPhase.product_aware?.map(t => t.topic).join(', ') || 'N/A'}\n`;
    summary += `2. Versterk uw boodschap met klantgetuigenissen\n`;
    summary += `3. Bied proefversies of garanties aan\n\n`;
  } else if (dominantPhase.id === 'most_aware') {
    summary += `1. Creëer urgentie rondom: ${topTopicsByPhase.most_aware?.map(t => t.topic).join(', ') || 'N/A'}\n`;
    summary += `2. Bied speciale aanbiedingen of bonussen\n`;
    summary += `3. Maak het aankoopproces zo eenvoudig mogelijk\n\n`;
  }
  
  // Conclusie
  summary += `## Conclusie\n\n`;
  summary += `Deze analyse toont aan dat uw doelgroep zich voornamelijk in de **${dominantPhase.name}** fase bevindt. `;
  summary += `Door uw marketingstrategie hierop af te stemmen, kunt u effectiever communiceren en uw doelgroep begeleiden naar de volgende fase in hun customer journey. `;
  summary += `Regelmatige monitoring van deze metrics zal u helpen om veranderingen in awareness te identificeren en uw strategie daarop aan te passen.\n\n`;
  
  return summary;
};

/**
 * Genereert een gedetailleerd rapport van de topic awareness analyse
 * @param {Object} topicsByPhase - Object met topics per awareness fase
 * @param {Array} awarenessDistribution - Distributie van topics over awareness fasen
 * @param {Object} contentRecommendations - Content aanbevelingen per fase
 * @param {Array} trendingTopics - Volledige lijst van trending topics
 * @param {Object} options - Opties voor het rapport
 * @returns {Object} - Rapport object met verschillende secties
 */
export const generateDetailedReport = (
  topicsByPhase, 
  awarenessDistribution, 
  contentRecommendations, 
  trendingTopics, 
  options = {}
) => {
  const { 
    productName = 'uw product', 
    industrie = 'uw industrie',
    projectName = 'dit project',
    includeExecutiveSummary = true,
    includeTopicDetails = true,
    includeContentRecommendations = true,
    includeStrategicRecommendations = true
  } = options;
  
  const report = {
    title: `Topic Awareness Analyse Rapport - ${projectName}`,
    generatedAt: new Date().toISOString(),
    sections: []
  };
  
  // Executive Summary
  if (includeExecutiveSummary) {
    report.sections.push({
      title: 'Executive Summary',
      content: generateExecutiveSummary(topicsByPhase, awarenessDistribution, options),
      type: 'text'
    });
  }
  
  // Awareness Distributie
  report.sections.push({
    title: 'Awareness Fase Distributie',
    content: awarenessDistribution.map(phase => ({
      name: phase.name,
      value: phase.count,
      percentage: phase.percentage,
      description: phase.description
    })),
    type: 'chart',
    chartType: 'bar'
  });
  
  // Topics per Fase
  if (includeTopicDetails) {
    const topicsPerPhase = [];
    
    Object.entries(AWARENESS_PHASES).forEach(([key, phase]) => {
      const phaseTopics = topicsByPhase[phase.id] || [];
      
      if (phaseTopics.length > 0) {
        topicsPerPhase.push({
          phase: phase.name,
          phaseId: phase.id,
          description: phase.description,
          topics: phaseTopics.map(topic => ({
            topic: topic.topic,
            trendingScore: topic.trendingScore,
            frequency: topic.frequency,
            growth: topic.growth,
            confidence: topic.confidence
          }))
        });
      }
    });
    
    report.sections.push({
      title: 'Trending Topics per Awareness Fase',
      content: topicsPerPhase,
      type: 'table'
    });
  }
  
  // Content Aanbevelingen
  if (includeContentRecommendations) {
    const recommendations = [];
    
    Object.entries(contentRecommendations).forEach(([phaseId, recommendation]) => {
      recommendations.push({
        phase: recommendation.phase,
        phaseId,
        contentIdeas: recommendation.contentIdeas,
        channels: recommendation.channels,
        callToAction: recommendation.callToAction
      });
    });
    
    report.sections.push({
      title: 'Content Aanbevelingen',
      content: recommendations,
      type: 'recommendations'
    });
  }
  
  // Strategische Aanbevelingen
  if (includeStrategicRecommendations) {
    // Bepaal dominante fase
    let dominantPhase = awarenessDistribution[0];
    awarenessDistribution.forEach(phase => {
      if (phase.count > dominantPhase.count) {
        dominantPhase = phase;
      }
    });
    
    const strategicRecommendations = {
      dominantPhase: dominantPhase.name,
      phaseId: dominantPhase.id,
      recommendations: []
    };
    
    if (dominantPhase.id === 'unaware') {
      strategicRecommendations.recommendations = [
        'Focus op educatieve content die het probleem introduceert',
        'Gebruik sociale media en PR om bewustzijn te creëren',
        'Investeer in thought leadership en industrie-specifieke content',
        'Gebruik visuele content om complexe problemen te verduidelijken',
        'Vermijd directe productpromotie in deze fase'
      ];
    } else if (dominantPhase.id === 'problem_aware') {
      strategicRecommendations.recommendations = [
        'Benadruk de impact van het probleem op de doelgroep',
        'Deel case studies die de gevolgen van het probleem illustreren',
        'Gebruik emotionele triggers in uw communicatie',
        'Begin met het introduceren van oplossingsrichtingen',
        'Bouw een email nurturing campagne om leads te ontwikkelen'
      ];
    } else if (dominantPhase.id === 'solution_aware') {
      strategicRecommendations.recommendations = [
        'Vergelijk verschillende oplossingen en hun voor- en nadelen',
        'Benadruk de unieke voordelen van uw specifieke oplossing',
        'Deel expert content en whitepapers',
        'Organiseer webinars en demonstraties',
        'Gebruik testimonials van early adopters'
      ];
    } else if (dominantPhase.id === 'product_aware') {
      strategicRecommendations.recommendations = [
        'Deel gedetailleerde productdemo\'s en use cases',
        'Versterk uw boodschap met klantgetuigenissen',
        'Bied proefversies of garanties aan',
        'Adresseer veelvoorkomende bezwaren en twijfels',
        'Gebruik retargeting advertenties voor warme leads'
      ];
    } else if (dominantPhase.id === 'most_aware') {
      strategicRecommendations.recommendations = [
        'Creëer urgentie met tijdgebonden aanbiedingen',
        'Bied speciale aanbiedingen of bonussen',
        'Maak het aankoopproces zo eenvoudig mogelijk',
        'Implementeer een referral programma',
        'Focus op upsell en cross-sell mogelijkheden'
      ];
    }
    
    report.sections.push({
      title: 'Strategische Aanbevelingen',
      content: strategicRecommendations,
      type: 'strategic'
    });
  }
  
  return report;
};

/**
 * Genereert een PDF rapport van de topic awareness analyse
 * @param {Object} report - Rapport object gegenereerd door generateDetailedReport
 * @param {Object} pdfUtils - PDF utilities object
 * @returns {Object} - PDF document object
 */
export const generatePdfReport = (report, pdfUtils) => {
  const { 
    createPdfDocument, 
    addPdfHeader, 
    addPdfSection, 
    addPdfTable, 
    addPdfChart 
  } = pdfUtils;
  
  // Creëer PDF document
  const doc = createPdfDocument({
    title: report.title,
    orientation: 'portrait'
  });
  
  // Voeg header toe
  addPdfHeader(doc, {
    title: report.title,
    subtitle: `Gegenereerd op ${new Date(report.generatedAt).toLocaleDateString()}`,
    logo: null // Voeg hier een logo toe indien beschikbaar
  });
  
  // Voeg secties toe
  report.sections.forEach(section => {
    if (section.type === 'text') {
      addPdfSection(doc, {
        title: section.title,
        content: section.content
      });
    } else if (section.type === 'chart') {
      addPdfChart(doc, {
        title: section.title,
        data: section.content,
        chartType: section.chartType
      });
    } else if (section.type === 'table') {
      section.content.forEach(phaseData => {
        addPdfSection(doc, {
          title: `${phaseData.phase} Fase`,
          content: phaseData.description
        });
        
        const tableData = {
          headers: ['Topic', 'Trending Score', 'Frequentie', 'Groei', 'Confidence'],
          rows: phaseData.topics.map(topic => [
            topic.topic,
            topic.trendingScore.toFixed(2),
            topic.frequency,
            `${topic.growth}%`,
            `${(topic.confidence * 100).toFixed(1)}%`
          ])
        };
        
        addPdfTable(doc, {
          title: `Trending Topics in ${phaseData.phase} Fase`,
          data: tableData
        });
      });
    } else if (section.type === 'recommendations') {
      section.content.forEach(recommendation => {
        addPdfSection(doc, {
          title: `Content Aanbevelingen voor ${recommendation.phase} Fase`,
          content: `
            ## Content Ideeën
            ${recommendation.contentIdeas.map((idea, index) => `${index + 1}. ${idea}`).join('\n')}
            
            ## Aanbevolen Kanalen
            ${recommendation.channels.join(', ')}
            
            ## Call-to-Action
            "${recommendation.callToAction}"
          `
        });
      });
    } else if (section.type === 'strategic') {
      addPdfSection(doc, {
        title: section.title,
        content: `
          ## Dominante Fase: ${section.content.dominantPhase}
          
          ### Aanbevelingen
          ${section.content.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}
        `
      });
    }
  });
  
  return doc;
};

/**
 * Genereert een Excel rapport van de topic awareness analyse
 * @param {Object} report - Rapport object gegenereerd door generateDetailedReport
 * @param {Object} excelUtils - Excel utilities object
 * @returns {Object} - Excel workbook object
 */
export const generateExcelReport = (report, excelUtils) => {
  const { 
    createExcelWorkbook, 
    addExcelWorksheet, 
    formatChartDataForExcel 
  } = excelUtils;
  
  // Creëer Excel workbook
  const workbook = createExcelWorkbook();
  
  // Voeg overzicht worksheet toe
  addExcelWorksheet(workbook, {
    name: 'Overzicht',
    data: [
      ['Topic Awareness Analyse Rapport'],
      ['Gegenereerd op', new Date(report.generatedAt).toLocaleDateString()],
      [],
      ['Dit rapport bevat de volgende secties:'],
      ...report.sections.map(section => [section.title])
    ]
  });
  
  // Voeg secties toe
  report.sections.forEach(section => {
    if (section.type === 'chart') {
      const chartData = formatChartDataForExcel(section.content);
      
      addExcelWorksheet(workbook, {
        name: section.title.substring(0, 31), // Excel worksheet naam max 31 karakters
        data: chartData
      });
    } else if (section.type === 'table') {
      section.content.forEach(phaseData => {
        const worksheetName = `${phaseData.phaseId.substring(0, 27)}_topics`;
        
        const data = [
          [`Trending Topics in ${phaseData.phase} Fase`],
          [phaseData.description],
          [],
          ['Topic', 'Trending Score', 'Frequentie', 'Groei', 'Confidence'],
          ...phaseData.topics.map(topic => [
            topic.topic,
            topic.trendingScore,
            topic.frequency,
            topic.growth,
            topic.confidence
          ])
        ];
        
        addExcelWorksheet(workbook, {
          name: worksheetName,
          data
        });
      });
    } else if (section.type === 'recommendations') {
      const data = [
        ['Content Aanbevelingen per Awareness Fase'],
        [],
        ['Fase', 'Content Idee', 'Kanalen', 'Call-to-Action']
      ];
      
      section.content.forEach(recommendation => {
        recommendation.contentIdeas.forEach((idea, index) => {
          data.push([
            index === 0 ? recommendation.phase : '',
            idea,
            index === 0 ? recommendation.channels.join(', ') : '',
            index === 0 ? recommendation.callToAction : ''
          ]);
        });
        
        data.push([]);
      });
      
      addExcelWorksheet(workbook, {
        name: 'Content Aanbevelingen',
        data
      });
    } else if (section.type === 'strategic') {
      const data = [
        ['Strategische Aanbevelingen'],
        [],
        [`Dominante Fase: ${section.content.dominantPhase}`],
        [],
        ['Aanbeveling']
      ];
      
      section.content.recommendations.forEach(recommendation => {
        data.push([recommendation]);
      });
      
      addExcelWorksheet(workbook, {
        name: 'Strategische Aanbevelingen',
        data
      });
    }
  });
  
  return workbook;
};

export default {
  generateExecutiveSummary,
  generateDetailedReport,
  generatePdfReport,
  generateExcelReport
};
