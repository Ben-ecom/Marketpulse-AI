/**
 * Reddit Routes
 * Definieert API routes voor Reddit data verzameling en analyse
 */

import express from 'express';
import { body, query, param } from 'express-validator';
import { searchRedditPosts, getSubredditPosts, analyzeRedditPosts, getRedditInsights } from '../controllers/redditController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/v1/reddit/search
 * @desc    Zoek Reddit posts op basis van een query
 * @access  Private
 */
router.get(
  '/search',
  authMiddleware,
  [
    query('query').notEmpty().withMessage('Query parameter is required'),
    query('sort').optional().isIn(['relevance', 'hot', 'top', 'new', 'comments']).withMessage('Invalid sort parameter'),
    query('timeframe').optional().isIn(['hour', 'day', 'week', 'month', 'year', 'all']).withMessage('Invalid timeframe parameter'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('includeComments').optional().isBoolean().withMessage('includeComments must be a boolean'),
    query('maxComments').optional().isInt({ min: 1, max: 50 }).withMessage('maxComments must be between 1 and 50')
  ],
  searchRedditPosts
);

/**
 * @route   GET /api/v1/reddit/subreddit/:subreddit
 * @desc    Haal posts op van een specifieke subreddit
 * @access  Private
 */
router.get(
  '/subreddit/:subreddit',
  authMiddleware,
  [
    param('subreddit').notEmpty().withMessage('Subreddit parameter is required'),
    query('sort').optional().isIn(['hot', 'new', 'top', 'rising']).withMessage('Invalid sort parameter'),
    query('timeframe').optional().isIn(['hour', 'day', 'week', 'month', 'year', 'all']).withMessage('Invalid timeframe parameter'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('includeComments').optional().isBoolean().withMessage('includeComments must be a boolean'),
    query('maxComments').optional().isInt({ min: 1, max: 50 }).withMessage('maxComments must be between 1 and 50')
  ],
  getSubredditPosts
);

/**
 * @route   POST /api/v1/reddit/analyze
 * @desc    Analyseer Reddit posts voor sentiment en trending topics
 * @access  Private
 */
router.post(
  '/analyze',
  authMiddleware,
  [
    body('query').optional().isString().withMessage('Query must be a string'),
    body('subreddit').optional().isString().withMessage('Subreddit must be a string'),
    body('sort').optional().isString().withMessage('Sort must be a string'),
    body('timeframe').optional().isString().withMessage('Timeframe must be a string'),
    body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  analyzeRedditPosts
);

/**
 * @route   GET /api/v1/reddit/insights
 * @desc    Haal gecombineerde Reddit insights op (posts, sentiment, trending topics)
 * @access  Private
 */
router.get(
  '/insights',
  authMiddleware,
  [
    query('query').optional().isString().withMessage('Query must be a string'),
    query('subreddit').optional().isString().withMessage('Subreddit must be a string'),
    query('sort').optional().isString().withMessage('Sort must be a string'),
    query('timeframe').optional().isString().withMessage('Timeframe must be a string'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  getRedditInsights
);

export default router;
