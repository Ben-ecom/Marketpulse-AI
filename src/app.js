/**
 * MarketPulse AI - Express Application
 *
 * Dit is de hoofdapplicatie voor MarketPulse AI.
 * Het configureert de Express server en registreert alle API routes.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Laad omgevingsvariabelen
dotenv.config();

// Importeer routes
const marketResearchRoutes = require('./api/routes/market-research');
const dashboardRoutes = require('./api/routes/dashboard');

// Initialiseer Express app
const app = express();

// Configureer middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "*"],
    },
  },
})); // Beveiligingsheaders met aangepaste CSP
// Configureer CORS om alle oorsprong toe te staan
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Cross-Origin Resource Sharing
app.use(express.json({ limit: '10mb' })); // Parse JSON requests met limiet
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded requests
app.use(morgan('dev')); // Logging

// Serveer statische bestanden uit de public directory
app.use(express.static('public'));

// Registreer routes
app.use('/api/market-research', marketResearchRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welkom bij de MarketPulse AI API',
    version: '1.0.0',
    status: 'online',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint niet gevonden',
  });
});

// Error handler
app.use((err, req, res) => {
  console.error('❌ Server error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Server error'
      : err.message,
  });
});

// Exporteer de app
module.exports = app;
