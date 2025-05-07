/**
 * Authentication Middleware
 * Verifieert JWT tokens voor beveiligde routes
 */

import jwt from 'jsonwebtoken';

/**
 * Middleware om JWT tokens te verifiëren
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = (req, res, next) => {
  try {
    // Haal token op uit Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }
    
    // Controleer of het een Bearer token is
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Authorization format should be: Bearer [token]' });
    }
    
    const token = parts[1];
    
    // Verifieer token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_change_in_production');
    
    // Voeg user data toe aan request
    req.user = decoded;
    
    // Ga verder naar de volgende middleware
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export default authMiddleware;
