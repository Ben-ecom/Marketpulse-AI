const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const decodoApiService = require('./services/decodoApi');
const logger = require('./utils/logger');

// Laad environment variables
dotenv.config();

// Initialiseer Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialiseer Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.post('/api/scrape', async (req, res) => {
  try {
    const { platform, options } = req.body;
    
    if (!platform) {
      return res.status(400).json({ error: 'Platform is vereist' });
    }
    
    if (!options) {
      return res.status(400).json({ error: 'Opties zijn vereist' });
    }
    
    let result;
    
    // Voer de juiste scraping functie uit op basis van het platform
    switch (platform) {
      case 'amazon':
        result = await decodoApiService.scrapeAmazonReviews(options);
        break;
      case 'instagram':
        result = await decodoApiService.scrapeInstagram(options);
        break;
      case 'tiktok':
        result = await decodoApiService.scrapeTikTok(options);
        break;
      case 'trustpilot':
        result = await decodoApiService.scrapeTrustpilot(options);
        break;
      default:
        return res.status(400).json({ error: `Ongeldig platform: ${platform}` });
    }
    
    // Sla het resultaat op in Supabase
    const { data, error } = await supabase
      .from('scrape_results')
      .insert({
        platform,
        options,
        result,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      logger.error('Fout bij opslaan in Supabase:', error);
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Scraping error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint voor het ophalen van scrape resultaten
app.get('/api/results', async (req, res) => {
  try {
    const { platform, limit = 10, offset = 0 } = req.query;
    
    let query = supabase
      .from('scrape_results')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (platform) {
      query = query.eq('platform', platform);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    res.json({ success: true, data, count });
  } catch (error) {
    logger.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint voor het ophalen van een specifiek scrape resultaat
app.get('/api/results/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('scrape_results')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Resultaat niet gevonden' });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint voor het starten van een nieuwe scraping job
app.post('/api/jobs', async (req, res) => {
  try {
    const { platform, options, schedule } = req.body;
    
    if (!platform) {
      return res.status(400).json({ error: 'Platform is vereist' });
    }
    
    if (!options) {
      return res.status(400).json({ error: 'Opties zijn vereist' });
    }
    
    // Sla de job op in Supabase
    const { data, error } = await supabase
      .from('scrape_jobs')
      .insert({
        platform,
        options,
        schedule,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    
    if (error) {
      throw error;
    }
    
    // Als er geen schedule is, voer de job direct uit
    if (!schedule) {
      // Start een asynchrone taak om de job uit te voeren
      executeJob(data[0].id, platform, options).catch(err => {
        logger.error(`Fout bij uitvoeren van job ${data[0].id}:`, err);
      });
    }
    
    res.json({ success: true, jobId: data[0].id });
  } catch (error) {
    logger.error('Job creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Functie voor het uitvoeren van een scraping job
async function executeJob(jobId, platform, options) {
  try {
    // Update job status naar 'running'
    await supabase
      .from('scrape_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', jobId);
    
    // Voer de scraping uit
    let result;
    
    switch (platform) {
      case 'amazon':
        result = await decodoApiService.scrapeAmazonReviews(options);
        break;
      case 'instagram':
        result = await decodoApiService.scrapeInstagram(options);
        break;
      case 'tiktok':
        result = await decodoApiService.scrapeTikTok(options);
        break;
      case 'trustpilot':
        result = await decodoApiService.scrapeTrustpilot(options);
        break;
      default:
        throw new Error(`Ongeldig platform: ${platform}`);
    }
    
    // Sla het resultaat op
    await supabase
      .from('scrape_results')
      .insert({
        job_id: jobId,
        platform,
        options,
        result,
        created_at: new Date().toISOString()
      });
    
    // Update job status naar 'completed'
    await supabase
      .from('scrape_jobs')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString(),
        result_count: 1
      })
      .eq('id', jobId);
  } catch (error) {
    logger.error(`Job execution error (${jobId}):`, error);
    
    // Update job status naar 'failed'
    await supabase
      .from('scrape_jobs')
      .update({ 
        status: 'failed', 
        completed_at: new Date().toISOString(),
        error: error.message
      })
      .eq('id', jobId);
  }
}

// Endpoint voor het ophalen van jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;
    
    let query = supabase
      .from('scrape_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    res.json({ success: true, data, count });
  } catch (error) {
    logger.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint voor het ophalen van een specifieke job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('scrape_jobs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Job niet gevonden' });
    }
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start de server
app.listen(port, () => {
  logger.info(`MarketPulse AI API server draait op poort ${port}`);
});

module.exports = app;
