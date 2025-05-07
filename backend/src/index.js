import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { supabaseClient } from './config/supabase.js';

// Laad omgevingsvariabelen
dotenv.config();

// Initialiseer Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
setupRoutes(app);

// Error handling middleware
app.use(errorHandler);

// Test Supabase verbinding
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabaseClient.from('health_check').select('*').limit(1);
    if (error) throw error;
    logger.info('Supabase verbinding succesvol');
  } catch (error) {
    logger.warn(`Supabase verbindingstest: ${error.message}`);
    logger.info('Doorgaan met server opstarten, ondanks Supabase verbindingswaarschuwing');
    // We stoppen de server niet bij een verbindingsfout, omdat Supabase mogelijk nog niet is geconfigureerd
  }
};

// Start de server
const startServer = async () => {
  await testSupabaseConnection();
  
  app.listen(PORT, () => {
    logger.info(`Server draait op poort ${PORT}`);
    logger.info(`API beschikbaar op http://localhost:${PORT}/api/v1`);
  });
};

startServer().catch(err => {
  logger.error(`Server startfout: ${err.message}`);
  process.exit(1);
});

export default app;
