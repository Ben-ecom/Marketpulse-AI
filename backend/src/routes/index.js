import express from 'express';
import { logger } from '../utils/logger.js';

// Importeer route modules
import authRoutes from './auth.js';
import projectRoutes from './projects.js';
import dataRoutes from './data.js';
import insightRoutes from './insights.js';
import healthRoutes from './health.js';
import marketResearchRoutes from './marketResearch.js';
import competitorRoutes from './competitor.js';
import recommendationRoutes from './recommendations.js';
import marketAnalysisRoutes from './marketAnalysis.js';
import socialMediaRoutes from './socialMediaRoutes.js';
import redditRoutes from './redditRoutes.js';
import awarenessRoutes from './awarenessRoutes.js';
import pubmedRoutes from './pubmedRoutes.js';

/**
 * Configureer alle API routes voor de applicatie
 * @param {express.Application} app - De Express applicatie instantie
 */
export const setupRoutes = (app) => {
  // API versie prefix
  const apiPrefix = '/api/v1';
  
  // Registreer health check route
  app.use(`${apiPrefix}/health`, healthRoutes);
  
  // Legacy health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Registreer route modules
  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/projects`, projectRoutes);
  app.use(`${apiPrefix}/data`, dataRoutes);
  app.use(`${apiPrefix}/insights`, insightRoutes);
  app.use(`${apiPrefix}/market-research`, marketResearchRoutes);
  app.use(`${apiPrefix}/competitor`, competitorRoutes);
  app.use(`${apiPrefix}/recommendations`, recommendationRoutes);
  app.use(`${apiPrefix}/market-analysis`, marketAnalysisRoutes);
  app.use(`${apiPrefix}/social-media`, socialMediaRoutes);
  app.use(`${apiPrefix}/reddit`, redditRoutes);
  app.use(`${apiPrefix}/awareness`, awarenessRoutes);
  app.use(`${apiPrefix}/pubmed`, pubmedRoutes);

  // 404 handler voor onbekende routes
  app.use((req, res, next) => {
    logger.warn(`Route niet gevonden: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      success: false, 
      error: {
        message: 'Route niet gevonden',
        code: 'NOT_FOUND'
      }
    });
  });

  logger.info('API routes succesvol geconfigureerd');
};

// Exporteer een lege router voor gebruik in andere modules
export default express.Router();
