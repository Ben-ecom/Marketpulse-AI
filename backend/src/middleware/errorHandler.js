import { logger } from '../utils/logger.js';

/**
 * Centrale error handler middleware voor de Express applicatie
 * Vangt alle errors op en stuurt een geformatteerde response naar de client
 */
export const errorHandler = (err, req, res, next) => {
  // Log de error voor debugging
  logger.error(`${err.name}: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Bepaal de HTTP status code
  const statusCode = err.statusCode || 500;
  
  // Stuur een geformatteerde error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Er is een serverfout opgetreden' 
        : err.message,
      code: err.code || 'INTERNAL_SERVER_ERROR',
      // Stuur alleen stack trace in development omgeving
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};
