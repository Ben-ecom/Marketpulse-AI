import express from 'express';
import { socialMediaController } from '../controllers/socialMediaController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/social-media/tiktok
 * @desc    Haal TikTok video's op voor een keyword
 * @access  Private
 */
router.get('/tiktok', authMiddleware, socialMediaController.getTikTokVideos);

/**
 * @route   GET /api/social-media/instagram
 * @desc    Haal Instagram posts op voor een hashtag
 * @access  Private
 */
router.get('/instagram', authMiddleware, socialMediaController.getInstagramPosts);

/**
 * @route   GET /api/social-media/trustpilot
 * @desc    Haal Trustpilot reviews op voor een bedrijf
 * @access  Private
 */
router.get('/trustpilot', authMiddleware, socialMediaController.getTrustpilotReviews);

export default router;
