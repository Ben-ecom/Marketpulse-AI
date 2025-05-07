/**
 * Authentication Middleware
 * 
 * Deze module bevat middleware functies voor authenticatie en autorisatie.
 */

import { supabase } from '../utils/supabaseClient.js';

/**
 * Verifieer de JWT token in de Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = async (req, res, next) => {
  try {
    // Haal de Authorization header op
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Toegang geweigerd. Geen token opgegeven.'
      });
    }
    
    // Extraheer de token
    const token = authHeader.split(' ')[1];
    
    // Verifieer de token met Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        message: 'Ongeldige of verlopen token'
      });
    }
    
    // Sla de gebruiker op in het request object
    req.user = data.user;
    
    // Ga verder naar de volgende middleware/route handler
    next();
  } catch (error) {
    console.error('Authenticatie fout:', error);
    return res.status(500).json({
      success: false,
      message: 'Er is een fout opgetreden bij het verifiëren van de token'
    });
  }
};

/**
 * Controleer of de gebruiker een admin is
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isAdmin = async (req, res, next) => {
  try {
    // Veronderstelt dat verifyToken al is uitgevoerd en req.user is ingesteld
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Toegang geweigerd. Niet geauthenticeerd.'
      });
    }
    
    // Haal gebruikersrol op uit de database
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', req.user.id)
      .single();
    
    if (error || !data) {
      return res.status(403).json({
        success: false,
        message: 'Toegang geweigerd. Geen rolgegevens gevonden.'
      });
    }
    
    // Controleer of de gebruiker een admin is
    if (data.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Toegang geweigerd. Admin rechten vereist.'
      });
    }
    
    // Ga verder naar de volgende middleware/route handler
    next();
  } catch (error) {
    console.error('Autorisatie fout:', error);
    return res.status(500).json({
      success: false,
      message: 'Er is een fout opgetreden bij het controleren van admin rechten'
    });
  }
};

/**
 * Controleer of de gebruiker de eigenaar is van een resource
 * @param {string} resourceType - Type resource (bijv. 'projects', 'insights')
 * @returns {Function} Middleware functie
 */
const isResourceOwner = (resourceType) => {
  return async (req, res, next) => {
    try {
      // Veronderstelt dat verifyToken al is uitgevoerd en req.user is ingesteld
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Toegang geweigerd. Niet geauthenticeerd.'
        });
      }
      
      const resourceId = req.params.id;
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is vereist'
        });
      }
      
      // Haal de resource op uit de database
      const { data, error } = await supabase
        .from(resourceType)
        .select('user_id')
        .eq('id', resourceId)
        .single();
      
      if (error || !data) {
        return res.status(404).json({
          success: false,
          message: 'Resource niet gevonden'
        });
      }
      
      // Controleer of de gebruiker de eigenaar is
      if (data.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Toegang geweigerd. U bent niet de eigenaar van deze resource.'
        });
      }
      
      // Ga verder naar de volgende middleware/route handler
      next();
    } catch (error) {
      console.error('Autorisatie fout:', error);
      return res.status(500).json({
        success: false,
        message: 'Er is een fout opgetreden bij het controleren van eigenaarschap'
      });
    }
  };
};

// Voor demo doeleinden, een middleware die authenticatie overslaat
const demoAuthMiddleware = (req, res, next) => {
  // Stel een dummy gebruiker in voor demo doeleinden
  req.user = {
    id: 'demo-user',
    email: 'demo@example.com',
    user_metadata: {
      full_name: 'Demo Gebruiker'
    }
  };
  
  next();
};

export {
  verifyToken,
  isAdmin,
  isResourceOwner,
  demoAuthMiddleware
};
