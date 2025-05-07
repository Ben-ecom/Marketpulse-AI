import express from 'express';
import { supabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route GET /api/v1/projects
 * @desc Haal alle projecten op voor de ingelogde gebruiker
 * @access Private
 */
router.get('/', async (req, res, next) => {
  try {
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

    // Haal projecten op voor deze gebruiker
    const { data: projects, error: projectsError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (projectsError) {
      logger.error(`Projecten ophalen fout: ${projectsError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij ophalen projecten',
          code: 'FETCH_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/projects/:id
 * @desc Haal een specifiek project op
 * @access Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

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

    // Haal project op en controleer of het van de huidige gebruiker is
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project niet gevonden',
            code: 'NOT_FOUND'
          }
        });
      }

      logger.error(`Project ophalen fout: ${projectError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij ophalen project',
          code: 'FETCH_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/projects
 * @desc Maak een nieuw project aan
 * @access Private
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, category, product_details, research_scope, competitors } = req.body;

    // Valideer verplichte velden
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Naam en categorie zijn verplicht',
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

    // Maak nieuw project aan
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .insert([
        {
          name,
          category,
          product_details,
          research_scope,
          competitors,
          user_id: userData.user.id
        }
      ])
      .select()
      .single();

    if (projectError) {
      logger.error(`Project aanmaken fout: ${projectError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij aanmaken project',
          code: 'CREATE_ERROR'
        }
      });
    }

    return res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/v1/projects/:id
 * @desc Update een bestaand project
 * @access Private
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, product_details, research_scope, competitors } = req.body;

    // Valideer verplichte velden
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Naam en categorie zijn verplicht',
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
    const { data: existingProject, error: checkError } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project niet gevonden of geen toegang',
            code: 'NOT_FOUND'
          }
        });
      }

      logger.error(`Project controleren fout: ${checkError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij controleren project',
          code: 'CHECK_ERROR'
        }
      });
    }

    // Update project
    const { data: updatedProject, error: updateError } = await supabaseClient
      .from('projects')
      .update({
        name,
        category,
        product_details,
        research_scope,
        competitors,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error(`Project bijwerken fout: ${updateError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij bijwerken project',
          code: 'UPDATE_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/v1/projects/:id
 * @desc Verwijder een project
 * @access Private
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

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
    const { data: existingProject, error: checkError } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Project niet gevonden of geen toegang',
            code: 'NOT_FOUND'
          }
        });
      }

      logger.error(`Project controleren fout: ${checkError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij controleren project',
          code: 'CHECK_ERROR'
        }
      });
    }

    // Verwijder alle gerelateerde data
    // TODO: Implementeer cascade delete in Supabase of verwijder gerelateerde data hier

    // Verwijder project
    const { error: deleteError } = await supabaseClient
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error(`Project verwijderen fout: ${deleteError.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Fout bij verwijderen project',
          code: 'DELETE_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Project succesvol verwijderd'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
