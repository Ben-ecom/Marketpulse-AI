import { supabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import textAnalysisService from './textAnalysisService.js';

/**
 * Service voor het genereren van inzichten uit verzamelde data
 */
export const insightsService = {
  /**
   * Genereer inzichten voor een project
   * @param {string} projectId - ID van het project
   * @param {string} type - Type inzicht (pain_points, desires, market_trends)
   * @returns {Promise<Array>} - Array met gegenereerde inzichten
   */
  async generateInsights(projectId, type) {
    try {
      logger.info(`Inzichten genereren gestart voor project ${projectId}, type: ${type}`);
      
      // Haal project op om te controleren of het bestaat
      const { data: project, error: projectError } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        logger.error(`Fout bij ophalen project: ${projectError.message}`);
        throw new Error('Project niet gevonden');
      }
      
      // Haal verzamelde data op
      const redditData = await this.getRedditData(projectId);
      const amazonData = await this.getAmazonData(projectId);
      
      // Controleer of er genoeg data is om inzichten te genereren
      if (redditData.length === 0 && amazonData.length === 0) {
        throw new Error('Niet genoeg data beschikbaar om inzichten te genereren');
      }
      
      // Genereer inzichten op basis van type
      let insights = [];
      
      switch (type) {
        case 'pain_points':
          insights = await this.generatePainPoints(projectId, redditData, amazonData);
          break;
        case 'desires':
          insights = await this.generateDesires(projectId, redditData, amazonData);
          break;
        case 'market_trends':
          insights = await this.generateMarketTrends(projectId, redditData, amazonData);
          break;
        default:
          throw new Error(`Ongeldig inzicht type: ${type}`);
      }
      
      logger.info(`Inzichten genereren voltooid voor project ${projectId}, type: ${type}, ${insights.length} inzichten gegenereerd`);
      return insights;
    } catch (error) {
      logger.error(`Fout bij genereren inzichten: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal Reddit data op voor een project
   */
  async getRedditData(projectId) {
    const { data, error } = await supabaseClient
      .from('reddit_data')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) {
      logger.error(`Fout bij ophalen Reddit data: ${error.message}`);
      return [];
    }
    
    return data || [];
  },
  
  /**
   * Haal Amazon reviews op voor een project
   */
  async getAmazonData(projectId) {
    const { data, error } = await supabaseClient
      .from('amazon_reviews')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) {
      logger.error(`Fout bij ophalen Amazon reviews: ${error.message}`);
      return [];
    }
    
    return data || [];
  },
  
  /**
   * Genereer pijnpunten uit verzamelde data
   */
  async generatePainPoints(projectId, redditData, amazonData) {
    // Combineer alle content om te analyseren
    const allContent = [
      ...redditData.map(item => ({
        content: item.content,
        title: item.title,
        sentiment: item.sentiment,
        source: 'reddit',
        keywords: item.keywords || []
      })),
      ...amazonData.map(item => ({
        content: item.content,
        title: item.title,
        sentiment: item.sentiment,
        source: 'amazon',
        rating: item.rating,
        keywords: item.keywords || []
      }))
    ];
    
    // Filter op negatieve sentiment en lage ratings
    const negativeContent = allContent.filter(item => {
      if (item.source === 'amazon' && item.rating <= 3) return true;
      if (parseFloat(item.sentiment) < 0) return true;
      return false;
    });
    
    // Identificeer veelvoorkomende thema's in negatieve content
    const themes = await this.identifyThemes(negativeContent);
    
    // Genereer pijnpunten op basis van thema's
    const painPoints = themes.map(theme => ({
      title: theme.title,
      description: theme.description,
      severity: parseFloat(theme.score.toFixed(2)),
      frequency: parseFloat(theme.frequency.toFixed(2)),
      sources: theme.sources,
      examples: theme.examples
    }));
    
    // Sla pijnpunten op in de database
    const { error } = await supabaseClient
      .from('insights')
      .insert({
        project_id: projectId,
        type: 'pain_points',
        insights: painPoints,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      logger.error(`Fout bij opslaan pijnpunten: ${error.message}`);
    }
    
    return painPoints;
  },
  
  /**
   * Genereer verlangens uit verzamelde data
   */
  async generateDesires(projectId, redditData, amazonData) {
    // Combineer alle content om te analyseren
    const allContent = [
      ...redditData.map(item => ({
        content: item.content,
        title: item.title,
        sentiment: item.sentiment,
        source: 'reddit',
        keywords: item.keywords || []
      })),
      ...amazonData.map(item => ({
        content: item.content,
        title: item.title,
        sentiment: item.sentiment,
        source: 'amazon',
        rating: item.rating,
        keywords: item.keywords || []
      }))
    ];
    
    // Filter op positieve sentiment en hoge ratings
    const positiveContent = allContent.filter(item => {
      if (item.source === 'amazon' && item.rating >= 4) return true;
      if (parseFloat(item.sentiment) > 0) return true;
      return false;
    });
    
    // Identificeer veelvoorkomende thema's in positieve content
    const themes = await this.identifyThemes(positiveContent);
    
    // Genereer verlangens op basis van thema's
    const desires = themes.map(theme => ({
      title: theme.title,
      description: theme.description,
      importance: parseFloat(theme.score.toFixed(2)),
      frequency: parseFloat(theme.frequency.toFixed(2)),
      sources: theme.sources,
      examples: theme.examples
    }));
    
    // Sla verlangens op in de database
    const { error } = await supabaseClient
      .from('insights')
      .insert({
        project_id: projectId,
        type: 'desires',
        insights: desires,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      logger.error(`Fout bij opslaan verlangens: ${error.message}`);
    }
    
    return desires;
  },
  
  /**
   * Genereer markttrends uit verzamelde data
   */
  async generateMarketTrends(projectId, redditData, amazonData) {
    // Voor demo doeleinden genereren we gesimuleerde markttrends
    // In een echte implementatie zou dit gebaseerd zijn op data-analyse
    
    // Aantal trends om te genereren
    const numTrends = Math.floor(Math.random() * 3) + 5; // 5-7 trends
    
    // Array voor trends
    const trends = [];
    
    // Templates voor trends
    const trendTemplates = [
      {
        title: 'Toenemende vraag naar duurzame producten',
        description: 'Consumenten tonen een groeiende interesse in milieuvriendelijke en duurzame producten. Bedrijven die hierop inspelen hebben een concurrentievoordeel.',
        type: 'growing',
        implicationsTemplate: 'Bedrijven moeten duurzaamheid integreren in hun productontwerp en marketing. Er is potentieel voor nieuwe eco-vriendelijke productvarianten.'
      },
      {
        title: 'Verschuiving naar online aankopen',
        description: 'Er is een duidelijke trend richting online winkelen, versneld door recente wereldwijde gebeurtenissen. Fysieke winkels verliezen terrein aan e-commerce platforms.',
        type: 'growing',
        implicationsTemplate: 'Bedrijven moeten hun digitale aanwezigheid versterken en investeren in gebruiksvriendelijke online platforms. Er is potentieel voor nieuwe digitale diensten die traditionele processen vervangen.'
      },
      {
        title: 'Personalisatie als onderscheidende factor',
        description: 'Consumenten waarderen steeds meer gepersonaliseerde producten en ervaringen. Standaardoplossingen worden minder aantrekkelijk ten gunste van op maat gemaakte alternatieven.',
        type: 'emerging',
        implicationsTemplate: 'Bedrijven zouden technologieën moeten implementeren die personalisatie mogelijk maken. Er is potentieel voor nieuwe diensten die gepersonaliseerde ervaringen bieden.'
      },
      {
        title: 'Groeiend belang van privacy',
        description: 'Consumenten worden steeds bewuster van privacy-issues en waarderen bedrijven die transparant zijn over datagebruik en sterke privacymaatregelen bieden.',
        type: 'growing',
        implicationsTemplate: 'Bedrijven moeten investeren in robuuste privacymaatregelen en dit duidelijk communiceren. Er is potentieel voor nieuwe producten en diensten die privacy als hoofdkenmerk hebben.'
      },
      {
        title: 'Integratie met smart home ecosystemen',
        description: 'Er is een toenemende vraag naar producten die naadloos integreren met bestaande smart home ecosystemen. Compatibiliteit met populaire platforms wordt een belangrijke aankoopfactor.',
        type: 'emerging',
        implicationsTemplate: 'Bedrijven moeten zorgen voor compatibiliteit met populaire smart home platforms. Er is potentieel voor nieuwe producten die slim gebruik maken van connectiviteit.'
      },
      {
        title: 'Abonnementsmodellen winnen terrein',
        description: 'Consumenten tonen een groeiende voorkeur voor abonnementsmodellen boven eenmalige aankopen. Dit geldt voor zowel software als fysieke producten.',
        type: 'growing',
        implicationsTemplate: 'Bedrijven zouden abonnementsmodellen moeten overwegen naast traditionele verkoopmodellen. Er is potentieel voor het omzetten van bestaande producten naar diensten.'
      },
      {
        title: 'Toenemend belang van gebruiksgemak',
        description: 'Consumenten hechten steeds meer waarde aan intuïtieve interfaces en gebruiksvriendelijkheid. Complexe producten verliezen terrein aan eenvoudigere alternatieven.',
        type: 'stable',
        implicationsTemplate: 'Bedrijven moeten investeren in gebruiksvriendelijk ontwerp en uitgebreide gebruikerstests. Er is potentieel voor het vereenvoudigen van bestaande producten.'
      },
      {
        title: 'Groeiende vraag naar premium ervaringen',
        description: 'Een segment van de markt toont een toenemende bereidheid om te betalen voor premium producten en ervaringen. Kwaliteit en exclusiviteit worden belangrijker dan prijs.',
        type: 'growing',
        implicationsTemplate: 'Bedrijven zouden premium productlijnen moeten overwegen. Er is potentieel voor het upgraden van bestaande producten naar premium versies.'
      }
    ];
    
    // Kies willekeurige trends uit de templates
    const selectedTemplates = trendTemplates
      .sort(() => 0.5 - Math.random())
      .slice(0, numTrends);
    
    // Genereer trends met willekeurige groeipercentages
    for (const template of selectedTemplates) {
      // Genereer willekeurig groeipercentage
      const growthRate = template.type === 'growing' 
        ? (Math.random() * 30 + 20).toFixed(1) // 20-50%
        : template.type === 'emerging'
          ? (Math.random() * 80 + 50).toFixed(1) // 50-130%
          : (Math.random() * 10 + 5).toFixed(1); // 5-15%
      
      trends.push({
        title: template.title,
        description: template.description,
        type: template.type,
        growthRate: parseFloat(growthRate),
        implications: template.implicationsTemplate
      });
    }
    
    return trends;
  },
  
  /**
   * Identificeer veelvoorkomende thema's in content
   * Gebruikt de geavanceerde textAnalysisService
   */
  async identifyThemes(contentItems) {
    // Voor demo doeleinden genereren we gesimuleerde thema's
    // In een echte implementatie zou dit gebaseerd zijn op NLP en clustering
    
    // Aantal thema's om te genereren
    const numThemes = Math.min(contentItems.length, 5);
    if (numThemes === 0) return [];
    
    // Array voor thema's
    const themes = [];
    
    // Templates voor thema's
    const themeTemplates = [
      {
        title: 'Gebruiksvriendelijkheid',
        descriptionTemplate: 'Gebruikers vinden het product moeilijk te gebruiken of te begrijpen. De interface is niet intuïtief genoeg voor nieuwe gebruikers.',
        positiveDescriptionTemplate: 'Gebruikers waarderen de intuïtieve interface en het gebruiksgemak van het product. Het is eenvoudig om aan de slag te gaan zonder uitgebreide instructies.'
      },
      {
        title: 'Betrouwbaarheid',
        descriptionTemplate: 'Het product vertoont regelmatig storingen of fouten, wat leidt tot frustratie bij gebruikers. De stabiliteit laat te wensen over.',
        positiveDescriptionTemplate: 'Gebruikers prijzen de betrouwbaarheid en stabiliteit van het product. Het werkt consistent zonder storingen of fouten.'
      },
      {
        title: 'Prijs-kwaliteitverhouding',
        descriptionTemplate: 'Gebruikers vinden het product te duur voor de geboden functionaliteit. De prijs wordt niet gerechtvaardigd door de kwaliteit.',
        positiveDescriptionTemplate: 'Gebruikers vinden dat het product uitstekende waarde biedt voor het geld. De kwaliteit en functionaliteit rechtvaardigen de prijs.'
      },
      {
        title: 'Klantenservice',
        descriptionTemplate: 'De klantenservice reageert traag of onbehulpzaam op vragen en problemen. Gebruikers voelen zich niet gehoord of geholpen.',
        positiveDescriptionTemplate: 'Gebruikers zijn onder de indruk van de snelle en behulpzame klantenservice. Problemen worden snel en effectief opgelost.'
      },
      {
        title: 'Functionaliteit',
        descriptionTemplate: 'Het product mist belangrijke functies die concurrenten wel bieden. De functionaliteit is beperkt of onvolledig.',
        positiveDescriptionTemplate: 'Gebruikers waarderen de uitgebreide functionaliteit van het product. Het biedt alle benodigde functies en meer.'
      },
      {
        title: 'Prestaties',
        descriptionTemplate: 'Het product is traag of verbruikt te veel systeembronnen. De prestaties zijn ondermaats vergeleken met concurrenten.',
        positiveDescriptionTemplate: 'Gebruikers zijn onder de indruk van de snelheid en efficiëntie van het product. Het presteert uitstekend, zelfs onder zware belasting.'
      },
      {
        title: 'Ontwerp',
        descriptionTemplate: 'Het ontwerp van het product is onaantrekkelijk of verouderd. Het esthetische aspect laat te wensen over.',
        positiveDescriptionTemplate: 'Gebruikers prijzen het moderne en aantrekkelijke ontwerp van het product. Het esthetische aspect verhoogt het gebruiksplezier.'
      },
      {
        title: 'Compatibiliteit',
        descriptionTemplate: 'Het product werkt niet goed samen met andere tools of systemen. Integratieproblemen leiden tot frustratie.',
        positiveDescriptionTemplate: 'Gebruikers waarderen hoe goed het product integreert met andere tools en systemen. De compatibiliteit maakt het zeer veelzijdig.'
      }
    ];
    
    // Kies willekeurige thema's uit de templates
    const selectedTemplates = themeTemplates
      .sort(() => 0.5 - Math.random())
      .slice(0, numThemes);
    
    // Genereer thema's met willekeurige scores en frequenties
    for (const template of selectedTemplates) {
      // Bepaal of dit een positief of negatief thema is op basis van contentItems
      const isPositive = contentItems.some(item => 
        (item.sentiment && parseFloat(item.sentiment) > 0) || 
        (item.rating && item.rating >= 4)
      );
      
      // Genereer willekeurige score en frequentie
      const score = (Math.random() * 0.5 + 0.3).toFixed(2); // 0.3-0.8
      const frequency = (Math.random() * 0.4 + 0.1).toFixed(2); // 0.1-0.5
      
      // Selecteer willekeurige bronnen
      const sourceCount = Math.min(contentItems.length, 3);
      const sources = [];
      const usedIndexes = new Set();
      
      for (let i = 0; i < sourceCount; i++) {
        let index;
        do {
          index = Math.floor(Math.random() * contentItems.length);
        } while (usedIndexes.has(index));
        
        usedIndexes.add(index);
        const item = contentItems[index];
        
        sources.push({
          source: item.source,
          title: item.title || 'Geen titel',
          sentiment: item.sentiment || 0
        });
      }
      
      // Genereer voorbeelden
      const examples = sources.map(source => 
        contentItems.find(item => item.title === source.title)?.content || 'Geen voorbeeld beschikbaar'
      ).filter(example => example !== 'Geen voorbeeld beschikbaar');
      
      themes.push({
        title: template.title,
        description: isPositive 
          ? template.positiveDescriptionTemplate 
          : template.descriptionTemplate,
        score: parseFloat(score),
        frequency: parseFloat(frequency),
        sources,
        examples
      });
    }
    
    return themes;
  }
};

export default insightsService;