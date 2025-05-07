import express from 'express';
import { supabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route GET /api/v1/health
 * @desc Controleer de gezondheid van de API en database verbinding
 * @access Public
 */
router.get('/', async (req, res, next) => {
  try {
    // Controleer database verbinding
    const { data, error } = await supabaseClient
      .from('health_check')
      .select('*')
      .limit(1);
    
    if (error) {
      logger.error(`Database health check fout: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Database verbinding mislukt',
          details: error.message,
          code: 'DB_CONNECTION_ERROR'
        }
      });
    }
    
    // Alles is in orde
    return res.status(200).json({
      success: true,
      data: {
        message: 'API en database verbinding zijn gezond',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          health_check: data && data.length > 0
        }
      }
    });
  } catch (error) {
    logger.error(`Health check fout: ${error.message}`);
    next(error);
  }
});

export default router;
