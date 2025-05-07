const express = require('express');
const { param, query, body } = require('express-validator');
const pubmedController = require('../controllers/pubmedController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/v1/pubmed/:projectId/initialize
 * @desc    Initialiseert wetenschappelijk onderzoek analyse voor een project
 * @access  Private
 */
router.post(
  '/:projectId/initialize',
  [
    authMiddleware,
    param('projectId').isString().notEmpty().withMessage('Project ID is vereist')
  ],
  pubmedController.initializePubMedAnalysis
);

/**
 * @route   GET /api/v1/pubmed/:projectId/insights
 * @desc    Haalt wetenschappelijke onderzoeksinzichten op voor een project
 * @access  Private
 */
router.get(
  '/:projectId/insights',
  [
    authMiddleware,
    param('projectId').isString().notEmpty().withMessage('Project ID is vereist')
  ],
  pubmedController.getPubMedInsights
);

/**
 * @route   GET /api/v1/pubmed/insights
 * @desc    Zoekt in PubMed naar wetenschappelijk onderzoek
 * @access  Private
 */
router.get(
  '/insights',
  [
    authMiddleware,
    query('query').optional(),
    query('ingredients').optional(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit moet tussen 1 en 100 zijn')
  ],
  pubmedController.searchPubMed
);

/**
 * @route   GET /api/v1/pubmed/:projectId/claims
 * @desc    Haalt claim-evidence mapping op voor een project
 * @access  Private
 */
router.get(
  '/:projectId/claims',
  [
    authMiddleware,
    param('projectId').isString().notEmpty().withMessage('Project ID is vereist')
  ],
  pubmedController.getClaimEvidenceMapping
);

/**
 * @route   POST /api/v1/pubmed/:projectId/generate-claims
 * @desc    Genereert wetenschappelijk onderbouwde marketingclaims
 * @access  Private
 */
router.post(
  '/:projectId/generate-claims',
  [
    authMiddleware,
    param('projectId').isString().notEmpty().withMessage('Project ID is vereist'),
    body('strength').optional().isIn(['strong', 'moderate', 'any']).withMessage('Strength moet strong, moderate of any zijn'),
    body('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit moet tussen 1 en 20 zijn')
  ],
  pubmedController.generateMarketingClaims
);

/**
 * @route   GET /api/v1/pubmed/:projectId/sources
 * @desc    Haalt alle wetenschappelijke bronnen op voor een project
 * @access  Private
 */
router.get(
  '/:projectId/sources',
  [
    authMiddleware,
    param('projectId').isString().notEmpty().withMessage('Project ID is vereist')
  ],
  pubmedController.getScientificSources
);

module.exports = router;
