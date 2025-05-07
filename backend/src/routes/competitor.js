import express from 'express';
import { competitorService } from '../services/competitorService.js';
import { competitorController } from '../controllers/competitorController.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/v1/competitor/:projectId
 * @desc    Haal concurrentieanalyse op voor een project
 * @access  Private
 */
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Haal analyse op uit database
    const { data, error } = await req.supabase
      .from('competitor_analyses')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      logger.error(`Fout bij ophalen concurrentieanalyse: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Fout bij ophalen concurrentieanalyse', 
        error: error.message 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: data && data.length > 0 ? data[0] : null 
    });
  } catch (error) {
    logger.error(`Onverwachte fout bij ophalen concurrentieanalyse: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Onverwachte fout bij ophalen concurrentieanalyse', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/v1/competitor/:projectId/analyze
 * @desc    Start een nieuwe concurrentieanalyse voor een project
 * @access  Private
 */
router.post('/:projectId/analyze', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { competitors } = req.body;
    
    // Valideer input
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Geen geldige concurrenten opgegeven'
      });
    }
    
    // Controleer of er al doelgroep- en marktdata beschikbaar is
    const doelgroepData = await competitorService.getDoelgroepData(projectId);
    const marktData = await competitorService.getMarktData(projectId);
    
    if (!doelgroepData || !marktData) {
      return res.status(400).json({
        success: false,
        message: 'Onvoldoende data beschikbaar voor concurrentieanalyse. Voer eerst doelgroep- en marktanalyse uit.'
      });
    }
    
    // Start analyse
    const analysisResults = await competitorService.analyzeCompetitors(projectId, competitors);
    
    return res.status(200).json({
      success: true,
      message: 'Concurrentieanalyse succesvol uitgevoerd',
      data: analysisResults
    });
  } catch (error) {
    logger.error(`Fout bij uitvoeren concurrentieanalyse: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Fout bij uitvoeren concurrentieanalyse',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/competitor/:projectId/recommendations
 * @desc    Haal aanbevelingen op basis van concurrentieanalyse op
 * @access  Private
 */
router.get('/:projectId/recommendations', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Haal analyse op uit database
    const { data, error } = await req.supabase
      .from('competitor_analyses')
      .select('recommendations')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      logger.error(`Fout bij ophalen aanbevelingen: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Fout bij ophalen aanbevelingen', 
        error: error.message 
      });
    }
    
    if (!data || data.length === 0 || !data[0].recommendations) {
      return res.status(404).json({
        success: false,
        message: 'Geen aanbevelingen beschikbaar. Voer eerst een concurrentieanalyse uit.'
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: data[0].recommendations 
    });
  } catch (error) {
    logger.error(`Onverwachte fout bij ophalen aanbevelingen: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Onverwachte fout bij ophalen aanbevelingen', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/v1/competitor/:projectId/status
 * @desc    Controleer of er voldoende data is voor concurrentieanalyse
 * @access  Private
 */
router.get('/:projectId/status', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Controleer of er al doelgroep- en marktdata beschikbaar is
    const doelgroepData = await competitorService.getDoelgroepData(projectId);
    const marktData = await competitorService.getMarktData(projectId);
    
    // Controleer of er al een concurrentieanalyse is uitgevoerd
    const { data: analyses, error } = await req.supabase
      .from('competitor_analyses')
      .select('created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      logger.error(`Fout bij controleren concurrentieanalyse status: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Fout bij controleren concurrentieanalyse status', 
        error: error.message 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      data: {
        doelgroepDataAvailable: !!doelgroepData,
        marktDataAvailable: !!marktData,
        competitorAnalysisAvailable: analyses && analyses.length > 0,
        readyForAnalysis: !!doelgroepData && !!marktData,
        lastAnalysisDate: analyses && analyses.length > 0 ? analyses[0].created_at : null
      }
    });
  } catch (error) {
    logger.error(`Onverwachte fout bij controleren concurrentieanalyse status: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Onverwachte fout bij controleren concurrentieanalyse status', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/v1/competitor/:projectId/detect
 * @desc    Detecteer potentiële concurrenten op basis van marktonderzoek
 * @access  Private
 */
router.get('/:projectId/detect', competitorController.detectCompetitors);

export default router;
