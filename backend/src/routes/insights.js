import express from 'express';
import { supabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { insightsService } from '../services/insightsService.js';

const router = express.Router();

/**
 * @route POST /api/v1/insights/generate
 * @desc Start inzichtgeneratie voor een project
 * @access Private
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Project ID is verplicht',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Haal de huidige gebruiker op
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Niet geauthenticeerd',
          code: 'NOT_AUTHENTICATED'
        }
      });
    }

    // Controleer of project bestaat en van de huidige gebruiker is
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', project_id)
      .eq('user_id', userData.user.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project niet gevonden of geen toegang',
            code: 'NOT_FOUND'
          }
        });
      }

      logger.error(`Project controleren fout: ${projectError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij controleren project',
          code: 'CHECK_ERROR'
        }
      });
    }

    // Controleer of er genoeg data is om inzichten te genereren
    const { count: redditCount, error: redditError } = await supabaseClient
      .from('reddit_data')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project_id);

    const { count: amazonCount, error: amazonError } = await supabaseClient
      .from('amazon_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project_id);

    if (redditError || amazonError) {
      logger.error(`Data tellen fout: ${redditError?.message || amazonError?.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij controleren beschikbare data',
          code: 'DATA_CHECK_ERROR'
        }
      });
    }

    if ((redditCount || 0) + (amazonCount || 0) < 10) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Niet genoeg data beschikbaar om inzichten te genereren. Verzamel eerst meer data.',
          code: 'INSUFFICIENT_DATA'
        }
      });
    }

    // Maak een nieuwe insight generation job aan
    const { data: job, error: jobError } = await supabaseClient
      .from('insight_jobs')
      .insert([
        {
          project_id,
          type: 'all',
          status: 'pending',
          user_id: userData.user.id
        }
      ])
      .select()
      .single();

    if (jobError) {
      logger.error(`Insight job aanmaken fout: ${jobError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij aanmaken insight job',
          code: 'CREATE_ERROR'
        }
      });
    }

    // Start inzichtgeneratie voor het project
    try {
      // Genereer verschillende typen inzichten
      const types = ['pain_points', 'desires', 'market_trends'];
      const generationPromises = types.map(type => insightsService.generateInsights(project_id, type));
      
      // Voer alle inzichtgeneratie parallel uit
      await Promise.all(generationPromises);
      
      // Update job status naar completed
      await supabaseClient
        .from('insight_jobs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', job.id);
    } catch (generationError) {
      logger.error(`Inzichtgeneratie fout: ${generationError.message}`);
      
      // Update job status naar failed
      await supabaseClient
        .from('insight_jobs')
        .update({ status: 'failed' })
        .eq('id', job.id);
    }

    return res.status(201).json({
      success: true,
      data: {
        job_id: job.id,
        message: 'Inzichtgeneratie gestart'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/insights/pain-points/:project_id
 * @desc Haal pijnpunten op voor een project
 * @access Private
 */
router.get('/pain-points/:project_id', async (req, res, next) => {
  try {
    const { project_id } = req.params;

    // Haal de huidige gebruiker op
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Niet geauthenticeerd',
          code: 'NOT_AUTHENTICATED'
        }
      });
    }

    // Controleer of project bestaat en van de huidige gebruiker is
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', userData.user.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project niet gevonden of geen toegang',
            code: 'NOT_FOUND'
          }
        });
      }

      logger.error(`Project controleren fout: ${projectError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij controleren project',
          code: 'CHECK_ERROR'
        }
      });
    }

    // Haal pijnpunten op
    const { data: painPoints, error: dataError } = await supabaseClient
      .from('pain_points')
      .select('*')
      .eq('project_id', project_id)
      .order('frequency', { ascending: false });

    if (dataError) {
      logger.error(`Pijnpunten ophalen fout: ${dataError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij ophalen pijnpunten',
          code: 'FETCH_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: painPoints
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/insights/desires/:project_id
 * @desc Haal verlangens op voor een project
 * @access Private
 */
router.get('/desires/:project_id', async (req, res, next) => {
  try {
    const { project_id } = req.params;

    // Haal de huidige gebruiker op
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Niet geauthenticeerd',
          code: 'NOT_AUTHENTICATED'
        }
      });
    }

    // Controleer of project bestaat en van de huidige gebruiker is
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', userData.user.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project niet gevonden of geen toegang',
            code: 'NOT_FOUND'
          }
        });
      }

      logger.error(`Project controleren fout: ${projectError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij controleren project',
          code: 'CHECK_ERROR'
        }
      });
    }

    // Haal verlangens op
    const { data: desires, error: dataError } = await supabaseClient
      .from('desires')
      .select('*')
      .eq('project_id', project_id)
      .order('frequency', { ascending: false });

    if (dataError) {
      logger.error(`Verlangens ophalen fout: ${dataError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij ophalen verlangens',
          code: 'FETCH_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: desires
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/insights/market-size/:project_id
 * @desc Haal marktgrootte op voor een project
 * @access Private
 */
router.get('/market-size/:project_id', async (req, res, next) => {
  try {
    const { project_id } = req.params;

    // Haal de huidige gebruiker op
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Niet geauthenticeerd',
          code: 'NOT_AUTHENTICATED'
        }
      });
    }

    // Controleer of project bestaat en van de huidige gebruiker is
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', userData.user.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project niet gevonden of geen toegang',
            code: 'NOT_FOUND'
          }
        });
      }

      logger.error(`Project controleren fout: ${projectError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij controleren project',
          code: 'CHECK_ERROR'
        }
      });
    }

    // Haal marktgrootte op
    const { data: marketSize, error: dataError } = await supabaseClient
      .from('market_size')
      .select('*')
      .eq('project_id', project_id)
      .order('year', { ascending: true });

    if (dataError) {
      logger.error(`Marktgrootte ophalen fout: ${dataError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij ophalen marktgrootte',
          code: 'FETCH_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: marketSize
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/insights/marketing/:project_id
 * @desc Haal marketingaanbevelingen op voor een project
 * @access Private
 */
router.get('/marketing/:project_id', async (req, res, next) => {
  try {
    const { project_id } = req.params;

    // Haal de huidige gebruiker op
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Niet geauthenticeerd',
          code: 'NOT_AUTHENTICATED'
        }
      });
    }

    // Controleer of project bestaat en van de huidige gebruiker is
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', userData.user.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project niet gevonden of geen toegang',
            code: 'NOT_FOUND'
          }
        });
      }

      logger.error(`Project controleren fout: ${projectError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij controleren project',
          code: 'CHECK_ERROR'
        }
      });
    }

    // Haal marketingaanbevelingen op
    const { data: marketingInsights, error: dataError } = await supabaseClient
      .from('marketing_insights')
      .select('*')
      .eq('project_id', project_id)
      .order('relevance_score', { ascending: false });

    if (dataError) {
      logger.error(`Marketing inzichten ophalen fout: ${dataError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij ophalen marketing inzichten',
          code: 'FETCH_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: marketingInsights
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/insights/jobs/:project_id
 * @desc Haal insight generation jobs op voor een project
 * @access Private
 */
router.get('/jobs/:project_id', async (req, res, next) => {
  try {
    const { project_id } = req.params;

    // Haal de huidige gebruiker op
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Niet geauthenticeerd',
          code: 'NOT_AUTHENTICATED'
        }
      });
    }

    // Controleer of project bestaat en van de huidige gebruiker is
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', userData.user.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project niet gevonden of geen toegang',
            code: 'NOT_FOUND'
          }
        });
      }

      logger.error(`Project controleren fout: ${projectError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij controleren project',
          code: 'CHECK_ERROR'
        }
      });
    }

    // Haal jobs op
    const { data: jobs, error: jobsError } = await supabaseClient
      .from('insight_jobs')
      .select('*')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false });

    if (jobsError) {
      logger.error(`Jobs ophalen fout: ${jobsError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij ophalen jobs',
          code: 'FETCH_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
});

export default router;
