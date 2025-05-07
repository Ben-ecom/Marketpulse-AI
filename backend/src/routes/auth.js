import express from 'express';
import { supabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Registreer een nieuwe gebruiker
 * @access Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email en wachtwoord zijn verplicht',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Registreer gebruiker met Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (authError) {
      logger.error(`Registratie fout: ${authError.message}`);
      return res.status(400).json({
        success: false,
        error: {
          message: authError.message,
          code: 'AUTH_ERROR'
        }
      });
    }

    // Voeg extra gebruikersgegevens toe aan profieltabel
    if (authData.user) {
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name: name || '',
            email: email,
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        logger.error(`Profiel aanmaken fout: ${profileError.message}`);
        // We gaan door, omdat de auth wel is aangemaakt
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        user: authData.user,
        message: 'Gebruiker succesvol geregistreerd'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/auth/login
 * @desc Log een gebruiker in
 * @access Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email en wachtwoord zijn verplicht',
          code: 'MISSING_FIELDS'
        }
      });
    }

    // Log gebruiker in met Supabase Auth
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      logger.error(`Login fout: ${error.message}`);
      return res.status(401).json({
        success: false,
        error: {
          message: 'Ongeldige inloggegevens',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/v1/auth/logout
 * @desc Log een gebruiker uit
 * @access Private
 */
router.post('/logout', async (req, res, next) => {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      logger.error(`Uitloggen fout: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: error.message,
          code: 'LOGOUT_ERROR'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Succesvol uitgelogd'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/v1/auth/me
 * @desc Haal huidige gebruiker op
 * @access Private
 */
router.get('/me', async (req, res, next) => {
  try {
    // Haal de huidige sessie op
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Niet geauthenticeerd',
          code: 'NOT_AUTHENTICATED'
        }
      });
    }

    // Haal gebruikersgegevens op
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Gebruiker niet gevonden',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // Haal aanvullende profielgegevens op
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (profileError) {
      logger.error(`Profiel ophalen fout: ${profileError.message}`);
      // We gaan door zonder profielgegevens
    }

    return res.status(200).json({
      success: true,
      data: {
        user: userData.user,
        profile: profileData || null
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
