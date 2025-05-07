/**
 * Dashboard API Routes
 *
 * Deze module bevat de API routes voor het dashboard.
 * Het biedt endpoints voor het ophalen van overzichtsgegevens en statistieken
 * voor het MarketPulse AI dashboard.
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const { 
  getDashboardOverview,
  getProjectStats,
  getRecentInsights,
  getPopularTrends
} = require('../controllers/dashboard-controller');

const router = express.Router();

/**
 * @route   GET /api/dashboard/overview
 * @desc    Haal overzichtsgegevens op voor het dashboard
 * @access  Private
 */
router.get('/overview', authenticate, getDashboardOverview);

/**
 * @route   GET /api/dashboard/projects/:projectId/stats
 * @desc    Haal statistieken op voor een specifiek project
 * @access  Private
 */
router.get('/projects/:projectId/stats', authenticate, getProjectStats);

/**
 * @route   GET /api/dashboard/insights/recent
 * @desc    Haal recente inzichten op
 * @access  Private
 */
router.get('/insights/recent', authenticate, getRecentInsights);

/**
 * @route   GET /api/dashboard/trends/popular
 * @desc    Haal populaire trends op
 * @access  Private
 */
router.get('/trends/popular', authenticate, getPopularTrends);

module.exports = router;
