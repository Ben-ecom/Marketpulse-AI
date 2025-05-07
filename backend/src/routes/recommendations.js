import express from 'express';
import { recommendationController } from '../controllers/recommendationController.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/v1/recommendations/:projectId
 * @desc    Haal aanbevelingen op voor een project
 * @access  Private
 */
router.get('/:projectId', recommendationController.getRecommendations);

/**
 * @route   GET /api/v1/recommendations/:projectId/niche
 * @desc    Haal niche-specifieke aanbevelingen op voor een project
 * @access  Private
 */
router.get('/:projectId/niche', recommendationController.getRecommendationsByNiche);

/**
 * @route   GET /api/v1/recommendations/:projectId/product
 * @desc    Haal product-specifieke aanbevelingen op voor een project
 * @access  Private
 */
router.get('/:projectId/product', recommendationController.getRecommendationsByProduct);

/**
 * @route   POST /api/v1/recommendations/:projectId/generate
 * @desc    Genereer nieuwe aanbevelingen voor een project
 * @access  Private
 */
router.post('/:projectId/generate', recommendationController.generateRecommendations);

/**
 * @route   GET /api/v1/recommendations/strategies
 * @desc    Haal beschikbare marketingstrategieën op
 * @access  Private
 */
router.get('/strategies', recommendationController.getMarketingStrategies);

/**
 * @route   POST /api/v1/recommendations/strategies
 * @desc    Maak een nieuwe marketingstrategie aan (alleen voor admins)
 * @access  Private/Admin
 */
router.post('/strategies', recommendationController.createMarketingStrategy);

/**
 * @route   PUT /api/v1/recommendations/strategies/:strategyId
 * @desc    Update een bestaande marketingstrategie (alleen voor admins)
 * @access  Private/Admin
 */
router.put('/strategies/:strategyId', recommendationController.updateMarketingStrategy);

/**
 * @route   DELETE /api/v1/recommendations/strategies/:strategyId
 * @desc    Verwijder een marketingstrategie (alleen voor admins)
 * @access  Private/Admin
 */
router.delete('/strategies/:strategyId', recommendationController.deleteMarketingStrategy);

export default router;
