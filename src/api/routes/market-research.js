/**
 * Market Research API Routes
 *
 * Deze module bevat de API routes voor de Market Research Module.
 * Het biedt endpoints voor het uitvoeren van marktanalyses en het genereren
 * van marktinzichten, prijsanalyses, concurrentieanalyses en het identificeren
 * van gaten en kansen in de markt.
 */

const express = require('express');
const { validateMarketData } = require('../middleware/validators');
const { authenticate } = require('../middleware/auth');
const {
  analyzeMarket,
  generateInsights,
  analyzePricing,
  analyzeCompetitors,
  identifyGapOpportunities,
  saveReport,
  getReport,
  getUserReports,
  generateVisualizations,
} = require('../controllers/market-research-controller');

const router = express.Router();

/**
 * @route   POST /api/market-research/analyze
 * @desc    Voer een marktanalyse uit op basis van de verstrekte gegevens
 * @access  Private
 */
/**
 * @route   POST /api/market-research/analyze
 * @desc    Voer een marktanalyse uit op basis van de verstrekte gegevens
 * @access  Private
 */
router.post('/analyze', authenticate, validateMarketData, analyzeMarket);

/**
 * @route   POST /api/market-research/insights
 * @desc    Genereer marktinzichten op basis van de verstrekte gegevens
 * @access  Private
 */
router.post('/insights', authenticate, validateMarketData, generateInsights);

/**
 * @route   POST /api/market-research/competitor-analysis
 * @desc    Voer een concurrentieanalyse uit op basis van de verstrekte gegevens
 * @access  Private
 */
router.post('/competitor-analysis', authenticate, analyzeCompetitors);

/**
 * @route   POST /api/market-research/price-analysis
 * @desc    Voer een prijsanalyse uit op basis van de verstrekte gegevens
 * @access  Private
 */
router.post('/price-analysis', authenticate, analyzePricing);

/**
 * @route   POST /api/market-research/gap-opportunities
 * @desc    Identificeer gaten en kansen in de markt
 * @access  Private
 */
router.post('/gap-opportunities', authenticate, identifyGapOpportunities);

/**
 * @route   GET /api/market-research/reports/:reportId
 * @desc    Haal een opgeslagen marktonderzoeksrapport op
 * @access  Private
 */
router.get('/reports/:reportId', authenticate, getReport);

/**
 * @route   POST /api/market-research/reports
 * @desc    Sla een marktonderzoeksrapport op
 * @access  Private
 */
router.post('/reports', authenticate, saveReport);

/**
 * @route   GET /api/market-research/reports
 * @desc    Haal alle marktonderzoeksrapporten op voor een gebruiker
 * @access  Private
 */
router.get('/reports', authenticate, getUserReports);

/**
 * @route   POST /api/market-research/visualizations
 * @desc    Genereer visualisatiegegevens voor marktanalyse
 * @access  Private
 */
router.post('/visualizations', authenticate, generateVisualizations);

module.exports = router;
