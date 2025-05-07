import express from 'express';
import { supabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { redditService } from '../services/redditService.js';
import { amazonService } from '../services/amazonService.js';

const router = express.Router();

/**
 * @route POST /api/v1/data/collect
 * @desc Start dataverzameling voor een project
 * @access Private
 */
router.post('/collect', async (req, res, next) => {
  try {
    const { project_id, platforms } = req.body;

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

    // Maak een nieuwe data collection job aan
    const { data: job, error: jobError } = await supabaseClient
      .from('data_collection_jobs')
      .insert([
        {
          project_id,
          platforms: platforms || project.research_scope.platforms,
          status: 'pending',
          user_id: userData.user.id
        }
      ])
      .select()
      .single();

    if (jobError) {
      logger.error(`Data collection job aanmaken fout: ${jobError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij aanmaken data collection job',
          code: 'CREATE_ERROR'
        }
      });
    }

    // Start dataverzameling voor elke geselecteerde platform
    const selectedPlatforms = platforms || project.research_scope?.platforms || [];
    
    try {
      // Voer dataverzameling uit voor elke platform
      const collectionPromises = [];
      
      if (selectedPlatforms.includes('reddit')) {
        collectionPromises.push(redditService.collectData(project_id, project.research_scope));
      }
      
      if (selectedPlatforms.includes('amazon')) {
        collectionPromises.push(amazonService.collectData(project_id, project.research_scope));
      }
      
      // Voer alle dataverzameling parallel uit
      await Promise.all(collectionPromises);
      
      // Update job status naar completed
      await supabaseClient
        .from('data_collection_jobs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', job.id);
        
    } catch (collectionError) {
      logger.error(`Dataverzameling fout: ${collectionError.message}`);
      
      // Update job status naar failed
      await supabaseClient
        .from('data_collection_jobs')
        .update({ status: 'failed' })
        .eq('id', job.id);
    }

    return res.status(201).json({
      success: true,
      data: {
        job_id: job.id,
        message: 'Dataverzameling gestart'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/data/reddit/:project_id
 * @desc Haal Reddit data op voor een project
 * @access Private
 */
router.get('/reddit/:project_id', async (req, res, next) => {
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

    // Haal Reddit data op
    const { data: redditData, error: dataError } = await supabaseClient
      .from('reddit_data')
      .select('*')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false });

    if (dataError) {
      logger.error(`Reddit data ophalen fout: ${dataError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij ophalen Reddit data',
          code: 'FETCH_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: redditData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/data/amazon/:project_id
 * @desc Haal Amazon reviews op voor een project
 * @access Private
 */
router.get('/amazon/:project_id', async (req, res, next) => {
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

    // Haal Amazon reviews op
    const { data: amazonData, error: dataError } = await supabaseClient
      .from('amazon_reviews')
      .select('*')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false });

    if (dataError) {
      logger.error(`Amazon data ophalen fout: ${dataError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij ophalen Amazon data',
          code: 'FETCH_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: amazonData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/data/jobs/:project_id
 * @desc Haal data collection jobs op voor een project
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
      .from('data_collection_jobs')
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
