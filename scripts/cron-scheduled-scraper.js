#!/usr/bin/env node

/**
 * Cron Job Script voor het uitvoeren van de scheduled-scraper Edge Function
 * 
 * Dit script kan worden uitgevoerd als een Cron Job op Render.com of een andere hosting provider
 * om periodiek de scheduled-scraper Edge Function aan te roepen.
 * 
 * Configuratie:
 * - SUPABASE_URL: De URL van je Supabase project
 * - SUPABASE_ANON_KEY: De anonieme API key van je Supabase project
 * 
 * Gebruik:
 * - Installeer de dependencies: npm install
 * - Configureer de omgevingsvariabelen in .env
 * - Voer het script uit: node cron-scheduled-scraper.js
 */

require('dotenv').config();
const fetch = require('node-fetch');

// Configuratie
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Log functie met timestamp
const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

/**
 * Roept de scheduled-scraper Edge Function aan
 */
async function runScheduledScraper() {
  try {
    log('Starten van geplande scraping taken...');

    // Bouw de URL op
    const url = `${SUPABASE_URL}/functions/v1/scheduled-scraper`;

    // Roep de Edge Function aan
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({})
    });

    // Controleer de response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge Function request failed: ${response.status} ${errorText}`);
    }

    // Verwerk de response
    const result = await response.json();
    
    log(`Taken verwerkt: ${result.message}`);
    
    if (result.results && result.results.length > 0) {
      result.results.forEach(taskResult => {
        log(`Taak ${taskResult.id}: ${taskResult.status}${taskResult.message ? ` - ${taskResult.message}` : ''}`);
      });
    } else {
      log('Geen taken om uit te voeren');
    }
  } catch (error) {
    log(`Fout bij het uitvoeren van geplande taken: ${error.message}`);
    process.exit(1);
  }
}

// Voer de functie uit
runScheduledScraper()
  .then(() => {
    log('Script succesvol uitgevoerd');
    process.exit(0);
  })
  .catch(error => {
    log(`Onverwachte fout: ${error.message}`);
    process.exit(1);
  });
