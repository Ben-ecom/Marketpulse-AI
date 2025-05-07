/**
 * MarketPulse AI Test Server
 * 
 * Een eenvoudige testserver om te controleren of de ES module conversie correct werkt.
 */

import express from 'express';
import { generateAutoConfig } from './services/autoConfigService.js';

// Initialiseer Express app
const app = express();
const PORT = 5005; // Gebruik een specifieke poort om conflicten te vermijden

// Middleware
app.use(express.json());

// Test route voor de autoConfigService
app.post('/test/auto-config', async (req, res) => {
  try {
    const projectData = req.body;
    const config = await generateAutoConfig(projectData);
    
    res.status(200).json({
      success: true,
      message: 'Automatische configuratie succesvol gegenereerd',
      data: config
    });
  } catch (error) {
    console.error('Fout bij het genereren van configuratie:', error);
    res.status(500).json({
      success: false,
      message: 'Er is een fout opgetreden bij het genereren van de configuratie',
      error: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'MarketPulse AI Test Server',
    endpoints: {
      autoConfig: {
        post: '/test/auto-config'
      }
    }
  });
});

// Start de server
app.listen(PORT, () => {
  console.log(`MarketPulse AI Test Server draait op poort ${PORT}`);
});
