/**
 * MarketPulse AI API Server
 * 
 * Dit is de hoofdserver voor de MarketPulse AI backend API.
 * Het verbindt alle routes en middleware.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import projectRoutes from './routes/projectRoutes.js';

dotenv.config();

// Initialiseer Express app
const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(helmet()); // Beveiligingsheaders
app.use(cors()); // Cross-Origin Resource Sharing
app.use(express.json()); // JSON body parser
app.use(morgan('dev')); // Logging

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 100, // limiet van 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Te veel requests, probeer het later opnieuw'
});

// Pas rate limiting toe op alle API routes
app.use('/api/', apiLimiter);

// API routes
app.use('/api/v1/projects', projectRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welkom bij de MarketPulse AI API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// API documentatie route
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'API Documentatie',
    endpoints: {
      projects: {
        get: '/api/v1/projects',
        getById: '/api/v1/projects/:id',
        post: '/api/v1/projects',
        put: '/api/v1/projects/:id',
        delete: '/api/v1/projects/:id'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint niet gevonden'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Er is een fout opgetreden op de server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Interne serverfout'
  });
});

// Start de server
app.listen(PORT, () => {
  console.log(`MarketPulse AI API server draait op poort ${PORT}`);
});

export default app; // Voor testen
