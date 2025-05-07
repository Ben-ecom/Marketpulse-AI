import { logger } from '../utils/logger.js';
import { competitorService } from '../services/competitorService.js';
import { competitorDetectionService } from '../services/competitorDetectionService.js';

/**
 * Controller voor concurrent-gerelateerde functionaliteit
 */
export const competitorController = {
  /**
   * Analyseer concurrenten voor een project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async analyzeCompetitors(req, res) {
    try {
      const { projectId } = req.params;
      const { competitors } = req.body;
      
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is vereist'
        });
      }
      
      if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tenminste één concurrent is vereist voor analyse'
        });
      }
      
      // Valideer concurrenten
      const validCompetitors = competitors.filter(
        competitor => competitor.name && competitor.url
      );
      
      if (validCompetitors.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Geen geldige concurrenten opgegeven'
        });
      }
      
      // Voer analyse uit
      const analysisResults = await competitorService.analyzeCompetitors(projectId, validCompetitors);
      
      return res.status(200).json({
        success: true,
        message: 'Concurrentanalyse succesvol uitgevoerd',
        data: analysisResults
      });
    } catch (error) {
      logger.error(`Fout bij concurrentanalyse: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij concurrentanalyse: ${error.message}`
      });
    }
  },
  
  /**
   * Controleer de status van concurrentanalyse voor een project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkAnalysisStatus(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is vereist'
        });
      }
      
      // Controleer status
      const status = await competitorService.checkAnalysisStatus(projectId);
      
      return res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error(`Fout bij controleren analysestatus: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij controleren analysestatus: ${error.message}`
      });
    }
  },
  
  /**
   * Haal concurrentanalyseresultaten op voor een project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAnalysisResults(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is vereist'
        });
      }
      
      // Haal resultaten op
      const results = await competitorService.getAnalysisResults(projectId);
      
      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error(`Fout bij ophalen analyseresultaten: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij ophalen analyseresultaten: ${error.message}`
      });
    }
  },
  
  /**
   * Detecteer potentiële concurrenten voor een project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async detectCompetitors(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is vereist'
        });
      }
      
      // Detecteer concurrenten
      const competitors = await competitorDetectionService.detectCompetitors(projectId);
      
      return res.status(200).json({
        success: true,
        message: 'Concurrentdetectie succesvol uitgevoerd',
        data: competitors
      });
    } catch (error) {
      logger.error(`Fout bij concurrentdetectie: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij concurrentdetectie: ${error.message}`
      });
    }
  }
};

export default competitorController;
