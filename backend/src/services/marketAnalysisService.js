import axios from 'axios';
import { supabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { amazonService } from './amazonService.js';
import { redditService } from './redditService.js';

/**
 * Service voor het uitvoeren van uitgebreide marktanalyses
 */
export const marketAnalysisService = {
  /**
   * Voer een volledige marktanalyse uit voor een project
   * @param {string} projectId - ID van het project
   * @param {object} options - Opties voor de marktanalyse
   * @returns {Promise<Object>} - Resultaten van de marktanalyse
   */
  async performMarketAnalysis(projectId, options = {}) {
    try {
      logger.info(`Marktanalyse gestart voor project ${projectId}`);
      
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
      
      // Verzamel data van verschillende bronnen
      const [amazonData, redditData] = await Promise.all([
        this.collectAmazonData(projectId, options),
        this.collectRedditData(projectId, options)
      ]);
      
      // Voer analyses uit op de verzamelde data
      const marketTrends = await this.analyzeMarketTrends(projectId, { amazonData, redditData });
      const competitorAnalysis = await this.analyzeCompetitors(projectId, options);
      const consumerSentiment = await this.analyzeConsumerSentiment(projectId, { amazonData, redditData });
      const pricingAnalysis = await this.analyzePricing(projectId, options);
      
      // Combineer alle analyses in één resultaat
      const analysisResults = {
        marketTrends,
        competitorAnalysis,
        consumerSentiment,
        pricingAnalysis,
        timestamp: new Date().toISOString()
      };
      
      // Sla de resultaten op in de database
      await this.saveAnalysisResults(projectId, analysisResults);
      
      logger.info(`Marktanalyse voltooid voor project ${projectId}`);
      return analysisResults;
    } catch (error) {
      logger.error(`Fout bij uitvoeren marktanalyse: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verzamel Amazon data voor marktanalyse
   * @param {string} projectId - ID van het project
   * @param {object} options - Opties voor dataverzameling
   * @returns {Promise<Array>} - Verzamelde Amazon data
   */
  async collectAmazonData(projectId, options) {
    try {
      // Controleer eerst of er al data is in de database
      const { data: existingData, error: queryError } = await supabaseClient
        .from('amazon_reviews')
        .select('*')
        .eq('project_id', projectId);
      
      if (queryError) {
        logger.error(`Fout bij ophalen bestaande Amazon data: ${queryError.message}`);
        throw new Error('Fout bij ophalen bestaande Amazon data');
      }
      
      // Als er al data is en we niet forceren om nieuwe data te verzamelen, gebruik bestaande data
      if (existingData && existingData.length > 0 && !options.forceRefresh) {
        logger.info(`Bestaande Amazon data gevonden voor project ${projectId}, ${existingData.length} items`);
        return existingData;
      }
      
      // Anders verzamel nieuwe data
      logger.info(`Verzamelen nieuwe Amazon data voor project ${projectId}`);
      return await amazonService.collectData(projectId, options);
    } catch (error) {
      logger.error(`Fout bij verzamelen Amazon data: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verzamel Reddit data voor marktanalyse
   * @param {string} projectId - ID van het project
   * @param {object} options - Opties voor dataverzameling
   * @returns {Promise<Array>} - Verzamelde Reddit data
   */
  async collectRedditData(projectId, options) {
    try {
      // Controleer eerst of er al data is in de database
      const { data: existingData, error: queryError } = await supabaseClient
        .from('reddit_data')
        .select('*')
        .eq('project_id', projectId);
      
      if (queryError) {
        logger.error(`Fout bij ophalen bestaande Reddit data: ${queryError.message}`);
        throw new Error('Fout bij ophalen bestaande Reddit data');
      }
      
      // Als er al data is en we niet forceren om nieuwe data te verzamelen, gebruik bestaande data
      if (existingData && existingData.length > 0 && !options.forceRefresh) {
        logger.info(`Bestaande Reddit data gevonden voor project ${projectId}, ${existingData.length} items`);
        return existingData;
      }
      
      // Anders verzamel nieuwe data
      logger.info(`Verzamelen nieuwe Reddit data voor project ${projectId}`);
      return await redditService.collectData(projectId, options);
    } catch (error) {
      logger.error(`Fout bij verzamelen Reddit data: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Analyseer markttrends op basis van verzamelde data
   * @param {string} projectId - ID van het project
   * @param {object} data - Verzamelde data
   * @returns {Promise<Object>} - Geanalyseerde markttrends
   */
  async analyzeMarketTrends(projectId, data) {
    try {
      const { amazonData, redditData } = data;
      
      // Extraheer keywords en sentiments uit Amazon reviews
      const amazonKeywords = this.extractKeywordsFromAmazonData(amazonData);
      const amazonSentiments = this.extractSentimentsFromAmazonData(amazonData);
      
      // Extraheer keywords en sentiments uit Reddit posts
      const redditKeywords = this.extractKeywordsFromRedditData(redditData);
      const redditSentiments = this.extractSentimentsFromRedditData(redditData);
      
      // Combineer keywords en bereken frequenties
      const combinedKeywords = [...amazonKeywords, ...redditKeywords];
      const keywordFrequencies = this.calculateKeywordFrequencies(combinedKeywords);
      
      // Identificeer trending topics
      const trendingTopics = this.identifyTrendingTopics(keywordFrequencies);
      
      // Bereken gemiddeld sentiment per keyword
      const keywordSentiments = this.calculateKeywordSentiments([...amazonSentiments, ...redditSentiments]);
      
      // Identificeer opkomende trends
      const emergingTrends = this.identifyEmergingTrends(keywordFrequencies, keywordSentiments);
      
      return {
        trendingTopics,
        keywordFrequencies,
        keywordSentiments,
        emergingTrends
      };
    } catch (error) {
      logger.error(`Fout bij analyseren markttrends: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Analyseer concurrenten op basis van verzamelde data
   * @param {string} projectId - ID van het project
   * @param {object} options - Opties voor analyse
   * @returns {Promise<Object>} - Geanalyseerde concurrentiedata
   */
  async analyzeCompetitors(projectId, options) {
    try {
      // Haal concurrenten op uit de database
      const { data: competitors, error: queryError } = await supabaseClient
        .from('competitors')
        .select('*')
        .eq('project_id', projectId);
      
      if (queryError) {
        logger.error(`Fout bij ophalen concurrenten: ${queryError.message}`);
        throw new Error('Fout bij ophalen concurrenten');
      }
      
      if (!competitors || competitors.length === 0) {
        logger.warn(`Geen concurrenten gevonden voor project ${projectId}`);
        return {
          competitors: [],
          strengthsWeaknesses: {},
          marketPositioning: {},
          competitiveAdvantage: null
        };
      }
      
      // Analyseer sterke en zwakke punten van concurrenten
      const strengthsWeaknesses = await this.analyzeStrengthsWeaknesses(competitors);
      
      // Analyseer marktpositionering van concurrenten
      const marketPositioning = await this.analyzeMarketPositioning(competitors);
      
      // Bepaal concurrentievoordeel
      const competitiveAdvantage = await this.determineCompetitiveAdvantage(competitors, strengthsWeaknesses);
      
      return {
        competitors,
        strengthsWeaknesses,
        marketPositioning,
        competitiveAdvantage
      };
    } catch (error) {
      logger.error(`Fout bij analyseren concurrenten: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Analyseer consumentsentiment op basis van verzamelde data
   * @param {string} projectId - ID van het project
   * @param {object} data - Verzamelde data
   * @returns {Promise<Object>} - Geanalyseerd consumentsentiment
   */
  async analyzeConsumerSentiment(projectId, data) {
    try {
      const { amazonData, redditData } = data;
      
      // Bereken overall sentiment scores
      const amazonSentiment = this.calculateAverageSentiment(amazonData);
      const redditSentiment = this.calculateAverageSentiment(redditData);
      
      // Bereken gewogen gemiddelde (Amazon reviews hebben meer gewicht)
      const overallSentiment = (amazonSentiment * 0.7) + (redditSentiment * 0.3);
      
      // Identificeer positieve en negatieve aspecten
      const positiveAspects = this.identifyPositiveAspects([...amazonData, ...redditData]);
      const negativeAspects = this.identifyNegativeAspects([...amazonData, ...redditData]);
      
      // Identificeer verbeterpunten
      const improvementAreas = this.identifyImprovementAreas(negativeAspects);
      
      return {
        overallSentiment,
        amazonSentiment,
        redditSentiment,
        positiveAspects,
        negativeAspects,
        improvementAreas
      };
    } catch (error) {
      logger.error(`Fout bij analyseren consumentsentiment: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Analyseer prijsstrategieën op basis van verzamelde data
   * @param {string} projectId - ID van het project
   * @param {object} options - Opties voor analyse
   * @returns {Promise<Object>} - Geanalyseerde prijsdata
   */
  async analyzePricing(projectId, options) {
    try {
      // Haal prijsgegevens op uit de database
      const { data: pricingData, error: queryError } = await supabaseClient
        .from('competitor_pricing')
        .select('*')
        .eq('project_id', projectId);
      
      if (queryError) {
        logger.error(`Fout bij ophalen prijsgegevens: ${queryError.message}`);
        throw new Error('Fout bij ophalen prijsgegevens');
      }
      
      if (!pricingData || pricingData.length === 0) {
        logger.warn(`Geen prijsgegevens gevonden voor project ${projectId}`);
        return {
          priceRanges: {},
          competitivePricing: {},
          pricingRecommendations: []
        };
      }
      
      // Bereken prijsranges per productcategorie
      const priceRanges = this.calculatePriceRanges(pricingData);
      
      // Analyseer concurrerende prijsstrategieën
      const competitivePricing = this.analyzeCompetitivePricing(pricingData);
      
      // Genereer prijsaanbevelingen
      const pricingRecommendations = this.generatePricingRecommendations(pricingData, priceRanges);
      
      return {
        priceRanges,
        competitivePricing,
        pricingRecommendations
      };
    } catch (error) {
      logger.error(`Fout bij analyseren prijsgegevens: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Sla analyseresultaten op in de database
   * @param {string} projectId - ID van het project
   * @param {object} results - Analyseresultaten
   * @returns {Promise<void>}
   */
  async saveAnalysisResults(projectId, results) {
    try {
      // Sla de resultaten op in de market_analysis tabel
      const { error } = await supabaseClient
        .from('market_analyses')
        .insert({
          project_id: projectId,
          analysis_results: results,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        logger.error(`Fout bij opslaan analyseresultaten: ${error.message}`);
        throw new Error('Fout bij opslaan analyseresultaten');
      }
      
      logger.info(`Analyseresultaten succesvol opgeslagen voor project ${projectId}`);
    } catch (error) {
      logger.error(`Fout bij opslaan analyseresultaten: ${error.message}`);
      throw error;
    }
  },
  
  // Helper methoden voor data-extractie en -analyse
  extractKeywordsFromAmazonData(amazonData) {
    return amazonData.flatMap(item => item.keywords || []);
  },
  
  extractSentimentsFromAmazonData(amazonData) {
    return amazonData.map(item => ({
      keyword: item.keywords?.[0] || null,
      sentiment: parseFloat(item.sentiment) || 0,
      source: 'amazon'
    }));
  },
  
  extractKeywordsFromRedditData(redditData) {
    return redditData.flatMap(item => item.keywords || []);
  },
  
  extractSentimentsFromRedditData(redditData) {
    return redditData.map(item => ({
      keyword: item.keywords?.[0] || null,
      sentiment: parseFloat(item.sentiment) || 0,
      source: 'reddit'
    }));
  },
  
  calculateKeywordFrequencies(keywords) {
    const frequencies = {};
    
    for (const keyword of keywords) {
      if (keyword) {
        frequencies[keyword] = (frequencies[keyword] || 0) + 1;
      }
    }
    
    // Sorteer op frequentie (aflopend)
    return Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  },
  
  identifyTrendingTopics(keywordFrequencies) {
    // Converteer naar array en neem de top 10
    return Object.entries(keywordFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, frequency]) => ({
        keyword,
        frequency,
        score: Math.min(frequency / 5, 1) // Normaliseer score tussen 0 en 1
      }));
  },
  
  calculateKeywordSentiments(sentiments) {
    const keywordSentiments = {};
    const keywordCounts = {};
    
    for (const item of sentiments) {
      if (item.keyword) {
        if (!keywordSentiments[item.keyword]) {
          keywordSentiments[item.keyword] = 0;
          keywordCounts[item.keyword] = 0;
        }
        
        keywordSentiments[item.keyword] += item.sentiment;
        keywordCounts[item.keyword]++;
      }
    }
    
    // Bereken gemiddelde sentiment per keyword
    const result = {};
    for (const keyword in keywordSentiments) {
      result[keyword] = keywordSentiments[keyword] / keywordCounts[keyword];
    }
    
    return result;
  },
  
  identifyEmergingTrends(keywordFrequencies, keywordSentiments) {
    // Zoek keywords met relatief lage frequentie maar hoog sentiment
    return Object.entries(keywordSentiments)
      .filter(([keyword, sentiment]) => {
        const frequency = keywordFrequencies[keyword] || 0;
        return frequency > 0 && frequency < 5 && sentiment > 0.5;
      })
      .map(([keyword, sentiment]) => ({
        keyword,
        sentiment,
        frequency: keywordFrequencies[keyword] || 0,
        potential: sentiment * 0.7 + 0.3 // Gewogen score voor potentieel
      }))
      .sort((a, b) => b.potential - a.potential)
      .slice(0, 5);
  },
  
  calculateAverageSentiment(data) {
    if (!data || data.length === 0) {
      return 0;
    }
    
    const sum = data.reduce((total, item) => {
      return total + (parseFloat(item.sentiment) || 0);
    }, 0);
    
    return sum / data.length;
  },
  
  identifyPositiveAspects(data) {
    // Filter items met positief sentiment
    const positiveItems = data.filter(item => parseFloat(item.sentiment) > 0.3);
    
    // Extraheer keywords uit positieve items
    const keywords = positiveItems.flatMap(item => item.keywords || []);
    
    // Tel frequenties
    const frequencies = this.calculateKeywordFrequencies(keywords);
    
    // Converteer naar array en neem de top 5
    return Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, frequency]) => ({
        keyword,
        frequency,
        examples: positiveItems
          .filter(item => (item.keywords || []).includes(keyword))
          .slice(0, 2)
          .map(item => item.title || item.content)
      }));
  },
  
  identifyNegativeAspects(data) {
    // Filter items met negatief sentiment
    const negativeItems = data.filter(item => parseFloat(item.sentiment) < -0.3);
    
    // Extraheer keywords uit negatieve items
    const keywords = negativeItems.flatMap(item => item.keywords || []);
    
    // Tel frequenties
    const frequencies = this.calculateKeywordFrequencies(keywords);
    
    // Converteer naar array en neem de top 5
    return Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, frequency]) => ({
        keyword,
        frequency,
        examples: negativeItems
          .filter(item => (item.keywords || []).includes(keyword))
          .slice(0, 2)
          .map(item => item.title || item.content)
      }));
  },
  
  identifyImprovementAreas(negativeAspects) {
    // Converteer negatieve aspecten naar verbeterpunten
    return negativeAspects.map(aspect => ({
      area: aspect.keyword,
      importance: aspect.frequency,
      recommendation: `Verbeter ${aspect.keyword} op basis van klantfeedback: "${aspect.examples[0] || ''}"`
    }));
  }
};

export default marketAnalysisService;
