/**
 * Authenticatie Middleware
 *
 * Deze middleware verifieert de authenticatie van gebruikers
 * voor beveiligde API routes.
 *
 * OPMERKING: Voor testdoeleinden gebruiken we een mock authenticatie.
 * In productie zou dit echte authenticatie met Supabase moeten gebruiken.
 */

const dotenv = require('dotenv');

dotenv.config();

// Mock Supabase client voor testdoeleinden
// In productie zou dit een echte Supabase client zijn
const useMockAuth = true; // Zet op false om echte Supabase authenticatie te gebruiken

/**
 * Authenticatie middleware
 * Verifieert de JWT token in de Authorization header
 * en voegt de gebruikersgegevens toe aan het request object
 *
 * Voor testdoeleinden accepteert deze functie elke token en gebruikt een mock gebruiker.
 */
const authenticate = async (req, res, next) => {
  try {
    if (useMockAuth) {
      // Voor testdoeleinden: accepteer elke token en gebruik een mock gebruiker
      console.log('🔑 Mock authenticatie gebruikt voor testdoeleinden');

      // Voeg mock gebruikersgegevens toe aan het request object
      req.user = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        user_metadata: {
          name: 'Test User',
          role: 'user',
        },
      };

      // Ga verder naar de volgende middleware of route handler
      return next();
    }

    // Echte authenticatie voor productie
    // Haal de token op uit de Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Geen authenticatie token verstrekt',
      });
    }

    // Token extractie (momenteel niet gebruikt)
    // const token = authHeader.split(' ')[1];

    // In productie: verifieer de token met Supabase
    // const { data: { user }, error } = await supabase.auth.getUser(token);
    //
    // if (error || !user) {
    //   return res.status(401).json({
    //     success: false,
    //     error: 'Ongeldige of verlopen token'
    //   });
    // }
    //
    // // Voeg gebruikersgegevens toe aan het request object
    // req.user = user;

    // Voor nu: gebruik mock gebruiker
    req.user = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      user_metadata: {
        name: 'Test User',
        role: 'user',
      },
    };

    // Ga verder naar de volgende middleware of route handler
    return next();
  } catch (error) {
    console.error('❌ Error in authentication middleware:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error bij authenticatie',
    });
  }
};

module.exports = {
  authenticate,
};
