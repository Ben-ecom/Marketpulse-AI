import { marketAnalysisService } from '../services/marketAnalysisService.js';
import { logger } from '../utils/logger.js';

/**
 * Controller voor marktanalyse functionaliteiten
 */
export const marketAnalysisController = {
  /**
   * Voer een volledige marktanalyse uit voor een project
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async performAnalysis(req, res) {
    try {
      const { projectId } = req.params;
      const options = req.body || {};
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is vereist' });
      }
      
      const results = await marketAnalysisService.performMarketAnalysis(projectId, options);
      
      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error(`Fout bij uitvoeren marktanalyse: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  },
  
  /**
   * Haal de meest recente marktanalyse op voor een project
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getLatestAnalysis(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is vereist' });
      }
      
      // Haal de meest recente analyse op uit de database
      const { data, error } = await supabaseClient
        .from('market_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        logger.error(`Fout bij ophalen marktanalyse: ${error.message}`);
        return res.status(500).json({ error: error.message });
      }
      
      if (!data) {
        return res.status(404).json({ error: 'Geen marktanalyse gevonden voor dit project' });
      }
      
      return res.status(200).json({
        success: true,
        data: data.analysis_results
      });
    } catch (error) {
      logger.error(`Fout bij ophalen marktanalyse: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  },
  
  /**
   * Haal markttrends op voor een project
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getMarketTrends(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is vereist' });
      }
      
      // Haal de meest recente analyse op uit de database
      const { data, error } = await supabaseClient
        .from('market_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        logger.error(`Fout bij ophalen marktanalyse: ${error.message}`);
        return res.status(500).json({ error: error.message });
      }
      
      if (!data || !data.analysis_results || !data.analysis_results.marketTrends) {
        return res.status(404).json({ error: 'Geen markttrends gevonden voor dit project' });
      }
      
      return res.status(200).json({
        success: true,
        data: data.analysis_results.marketTrends
      });
    } catch (error) {
      logger.error(`Fout bij ophalen markttrends: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  },
  
  /**
   * Haal consumentsentiment op voor een project
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getConsumerSentiment(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is vereist' });
      }
      
      // Haal de meest recente analyse op uit de database
      const { data, error } = await supabaseClient
        .from('market_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        logger.error(`Fout bij ophalen marktanalyse: ${error.message}`);
        return res.status(500).json({ error: error.message });
      }
      
      if (!data || !data.analysis_results || !data.analysis_results.consumerSentiment) {
        return res.status(404).json({ error: 'Geen consumentsentiment gevonden voor dit project' });
      }
      
      return res.status(200).json({
        success: true,
        data: data.analysis_results.consumerSentiment
      });
    } catch (error) {
      logger.error(`Fout bij ophalen consumentsentiment: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  },
  
  /**
   * Haal prijsanalyse op voor een project
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getPricingAnalysis(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is vereist' });
      }
      
      // Haal de meest recente analyse op uit de database
      const { data, error } = await supabaseClient
        .from('market_analyses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        logger.error(`Fout bij ophalen marktanalyse: ${error.message}`);
        return res.status(500).json({ error: error.message });
      }
      
      if (!data || !data.analysis_results || !data.analysis_results.pricingAnalysis) {
        return res.status(404).json({ error: 'Geen prijsanalyse gevonden voor dit project' });
      }
      
      return res.status(200).json({
        success: true,
        data: data.analysis_results.pricingAnalysis
      });
    } catch (error) {
      logger.error(`Fout bij ophalen prijsanalyse: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  }
};

export default marketAnalysisController;
