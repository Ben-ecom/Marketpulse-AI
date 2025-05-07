import express from 'express';
import { marketResearchService } from '../services/marketResearchService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/market-research/:projectId
 * @desc    Haal marktonderzoeksdata op voor een project
 * @access  Private
 */
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Haal marktonderzoeksdata op uit de database
    const { data, error } = await req.supabase
      .from('market_research')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      logger.error(`Fout bij ophalen marktonderzoeksdata: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Fout bij ophalen marktonderzoeksdata', 
        error: error.message 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      data 
    });
  } catch (error) {
    logger.error(`Onverwachte fout bij ophalen marktonderzoeksdata: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Onverwachte fout bij ophalen marktonderzoeksdata', 
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/market-research/:projectId/collect
 * @desc    Verzamel nieuwe marktonderzoeksdata voor een project
 * @access  Private
 */
router.post('/:projectId/collect', async (req, res) => {
  try {
    const { projectId } = req.params;
    const settings = req.body;
    
    // Verzamel marktonderzoeksdata
    const researchData = await marketResearchService.collectData(projectId, settings);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Marktonderzoeksdata succesvol verzameld', 
      data: researchData 
    });
  } catch (error) {
    logger.error(`Fout bij verzamelen marktonderzoeksdata: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Fout bij verzamelen marktonderzoeksdata', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/market-research/:projectId/report
 * @desc    Genereer een PDF rapport met marktonderzoeksdata
 * @access  Private
 */
router.get('/:projectId/report', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Genereer PDF rapport
    const reportUrl = await marketResearchService.generatePdfReport(projectId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'PDF rapport succesvol gegenereerd', 
      reportUrl 
    });
  } catch (error) {
    logger.error(`Fout bij genereren PDF rapport: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Fout bij genereren PDF rapport', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/market-research/sources
 * @desc    Haal beschikbare bronnen op voor marktonderzoek
 * @access  Private
 */
router.get('/sources', async (req, res) => {
  try {
    // Lijst van beschikbare bronnen
    const sources = [
      {
        name: 'Statista',
        url: 'https://www.statista.com/markets/',
        description: 'Uitgebreide marktdata en statistieken voor verschillende industrieën',
        dataTypes: ['Marktgrootte', 'Groeipercentages', 'Voorspellingen']
      },
      {
        name: 'Grand View Research',
        url: 'https://www.grandviewresearch.com/',
        description: 'Marktonderzoeksrapporten en analyses voor verschillende sectoren',
        dataTypes: ['Marktgrootte', 'Groeipercentages', 'Voorspellingen', 'Trends']
      },
      {
        name: 'Markets and Markets',
        url: 'https://www.marketsandmarkets.com/',
        description: 'Marktonderzoeksrapporten en consulting diensten',
        dataTypes: ['Marktgrootte', 'Groeipercentages', 'Voorspellingen', 'Concurrentieanalyse']
      },
      {
        name: 'Gartner',
        url: 'https://www.gartner.com/en/research/methodologies/gartner-hype-cycle',
        description: 'Technologietrends en marktanalyses',
        dataTypes: ['Trends', 'Voorspellingen', 'Technologieadoptie']
      },
      {
        name: 'Forrester',
        url: 'https://www.forrester.com/research/',
        description: 'Marktonderzoek en analyses voor technologie en business',
        dataTypes: ['Trends', 'Voorspellingen', 'Concurrentieanalyse']
      },
      {
        name: 'McKinsey Insights',
        url: 'https://www.mckinsey.com/insights',
        description: 'Strategische inzichten en analyses voor verschillende industrieën',
        dataTypes: ['Trends', 'Voorspellingen', 'Strategische analyses']
      },
      {
        name: 'Crunchbase',
        url: 'https://www.crunchbase.com/',
        description: 'Data over bedrijven, investeringen en concurrenten',
        dataTypes: ['Concurrentieanalyse', 'Investeringsdata', 'Bedrijfsinformatie']
      },
      {
        name: 'Bloomberg',
        url: 'https://www.bloomberg.com/markets',
        description: 'Financiële data en marktanalyses',
        dataTypes: ['Marktdata', 'Financiële analyses', 'Concurrentieanalyse']
      },
      {
        name: 'Yahoo Finance',
        url: 'https://finance.yahoo.com/',
        description: 'Financiële data en marktinformatie',
        dataTypes: ['Marktdata', 'Bedrijfsinformatie', 'Concurrentieanalyse']
      }
    ];
    
    return res.status(200).json({ 
      success: true, 
      sources 
    });
  } catch (error) {
    logger.error(`Fout bij ophalen beschikbare bronnen: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Fout bij ophalen beschikbare bronnen', 
      error: error.message 
    });
  }
});

export default router;
