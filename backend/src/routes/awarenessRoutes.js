/**
 * Awareness Routes
 * Definieert API routes voor awareness fasen classificatie en analyse
 */

import express from 'express';
import { body, query, param } from 'express-validator';
import {
  initializeAwarenessPhases,
  getAwarenessPhases,
  classifyContent,
  getMarketingRecommendations,
  updateAwarenessPhase,
  addIndicator,
  removeIndicator,
  addMarketingAngle,
  removeMarketingAngle
} from '../controllers/awarenessController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Alle routes vereisen authenticatie
router.use(authMiddleware);

/**
 * @route   POST /api/v1/awareness/:projectId/initialize
 * @desc    Initialiseer awareness fasen voor een project
 * @access  Private
 */
router.post(
  '/:projectId/initialize',
  [
    param('projectId').notEmpty().withMessage('Project ID is vereist')
  ],
  initializeAwarenessPhases
);

/**
 * @route   GET /api/v1/awareness/:projectId/phases
 * @desc    Haal awareness fasen op voor een project
 * @access  Private
 */
router.get(
  '/:projectId/phases',
  [
    param('projectId').notEmpty().withMessage('Project ID is vereist'),
    query('includeContent').optional().isBoolean().withMessage('includeContent moet een boolean zijn')
  ],
  getAwarenessPhases
);

/**
 * @route   POST /api/v1/awareness/:projectId/classify
 * @desc    Classificeer content in awareness fasen
 * @access  Private
 */
router.post(
  '/:projectId/classify',
  [
    param('projectId').notEmpty().withMessage('Project ID is vereist'),
    body('contentItems').isArray().withMessage('contentItems moet een array zijn'),
    body('productContext').optional().isObject().withMessage('productContext moet een object zijn')
  ],
  classifyContent
);

/**
 * @route   GET /api/v1/awareness/:projectId/recommendations
 * @desc    Genereer marketing aanbevelingen op basis van awareness fasen
 * @access  Private
 */
router.get(
  '/:projectId/recommendations',
  [
    param('projectId').notEmpty().withMessage('Project ID is vereist')
  ],
  getMarketingRecommendations
);

/**
 * @route   PUT /api/v1/awareness/:projectId/phases/:phaseName
 * @desc    Update een awareness fase
 * @access  Private
 */
router.put(
  '/:projectId/phases/:phaseName',
  [
    param('projectId').notEmpty().withMessage('Project ID is vereist'),
    param('phaseName').isIn(['unaware', 'problemAware', 'solutionAware', 'productAware', 'mostAware']).withMessage('Ongeldige fase naam'),
    body('displayName').optional().isString().withMessage('displayName moet een string zijn'),
    body('description').optional().isString().withMessage('description moet een string zijn'),
    body('color').optional().isString().withMessage('color moet een string zijn')
  ],
  updateAwarenessPhase
);

/**
 * @route   POST /api/v1/awareness/:projectId/phases/:phaseName/indicators
 * @desc    Voeg een indicator toe aan een awareness fase
 * @access  Private
 */
router.post(
  '/:projectId/phases/:phaseName/indicators',
  [
    param('projectId').notEmpty().withMessage('Project ID is vereist'),
    param('phaseName').isIn(['unaware', 'problemAware', 'solutionAware', 'productAware', 'mostAware']).withMessage('Ongeldige fase naam'),
    body('pattern').isString().withMessage('pattern is vereist en moet een string zijn'),
    body('weight').optional().isInt({ min: 1, max: 10 }).withMessage('weight moet een getal zijn tussen 1 en 10'),
    body('description').optional().isString().withMessage('description moet een string zijn')
  ],
  addIndicator
);

/**
 * @route   DELETE /api/v1/awareness/:projectId/phases/:phaseName/indicators/:indicatorId
 * @desc    Verwijder een indicator uit een awareness fase
 * @access  Private
 */
router.delete(
  '/:projectId/phases/:phaseName/indicators/:indicatorId',
  [
    param('projectId').notEmpty().withMessage('Project ID is vereist'),
    param('phaseName').isIn(['unaware', 'problemAware', 'solutionAware', 'productAware', 'mostAware']).withMessage('Ongeldige fase naam'),
    param('indicatorId').notEmpty().withMessage('Indicator ID is vereist')
  ],
  removeIndicator
);

/**
 * @route   POST /api/v1/awareness/:projectId/phases/:phaseName/angles
 * @desc    Voeg een marketing aanbeveling toe aan een awareness fase
 * @access  Private
 */
router.post(
  '/:projectId/phases/:phaseName/angles',
  [
    param('projectId').notEmpty().withMessage('Project ID is vereist'),
    param('phaseName').isIn(['unaware', 'problemAware', 'solutionAware', 'productAware', 'mostAware']).withMessage('Ongeldige fase naam'),
    body('title').isString().withMessage('title is vereist en moet een string zijn'),
    body('description').isString().withMessage('description is vereist en moet een string zijn'),
    body('examples').optional().isArray().withMessage('examples moet een array zijn')
  ],
  addMarketingAngle
);

/**
 * @route   DELETE /api/v1/awareness/:projectId/phases/:phaseName/angles/:angleId
 * @desc    Verwijder een marketing aanbeveling uit een awareness fase
 * @access  Private
 */
router.delete(
  '/:projectId/phases/:phaseName/angles/:angleId',
  [
    param('projectId').notEmpty().withMessage('Project ID is vereist'),
    param('phaseName').isIn(['unaware', 'problemAware', 'solutionAware', 'productAware', 'mostAware']).withMessage('Ongeldige fase naam'),
    param('angleId').notEmpty().withMessage('Angle ID is vereist')
  ],
  removeMarketingAngle
);

export default router;
