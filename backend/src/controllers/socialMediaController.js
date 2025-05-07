import { integratedScrapingService } from '../services/integratedScrapingService.js';
import { logger } from '../utils/logger.js';

/**
 * Controller voor sociale media data
 */
export const socialMediaController = {
  /**
   * Haal TikTok video's op voor een keyword
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getTikTokVideos(req, res) {
    try {
      const { keyword } = req.query;
      
      if (!keyword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Keyword is verplicht' 
        });
      }
      
      logger.info(`TikTok video's ophalen voor keyword: ${keyword}`);
      
      const videos = await integratedScrapingService.scrapeTikTokVideos(keyword);
      
      return res.status(200).json({
        success: true,
        data: videos
      });
    } catch (error) {
      logger.error(`Fout bij ophalen TikTok video's: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Er is een fout opgetreden bij het ophalen van TikTok video\'s',
        error: error.message
      });
    }
  },
  
  /**
   * Haal Instagram posts op voor een hashtag
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getInstagramPosts(req, res) {
    try {
      const { hashtag } = req.query;
      
      if (!hashtag) {
        return res.status(400).json({ 
          success: false, 
          message: 'Hashtag is verplicht' 
        });
      }
      
      logger.info(`Instagram posts ophalen voor hashtag: ${hashtag}`);
      
      const posts = await integratedScrapingService.scrapeInstagramPosts(hashtag);
      
      return res.status(200).json({
        success: true,
        data: posts
      });
    } catch (error) {
      logger.error(`Fout bij ophalen Instagram posts: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Er is een fout opgetreden bij het ophalen van Instagram posts',
        error: error.message
      });
    }
  },
  
  /**
   * Haal Trustpilot reviews op voor een bedrijf
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getTrustpilotReviews(req, res) {
    try {
      const { companyName } = req.query;
      
      if (!companyName) {
        return res.status(400).json({ 
          success: false, 
          message: 'Bedrijfsnaam is verplicht' 
        });
      }
      
      logger.info(`Trustpilot reviews ophalen voor bedrijf: ${companyName}`);
      
      const reviews = await integratedScrapingService.scrapeTrustpilotReviews(companyName);
      
      return res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error) {
      logger.error(`Fout bij ophalen Trustpilot reviews: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Er is een fout opgetreden bij het ophalen van Trustpilot reviews',
        error: error.message
      });
    }
  }
};

export default socialMediaController;
