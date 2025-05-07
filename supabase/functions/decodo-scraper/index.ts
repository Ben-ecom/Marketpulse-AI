import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// TypeScript type definities voor Deno
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

/**
 * Decodo Scraper Edge Function
 * 
 * Deze functie handelt scraping requests af via de Decodo API en slaat de resultaten op in de database.
 * Het ondersteunt verschillende platforms (Reddit, Amazon, Instagram, TikTok, Trustpilot) en
 * verschillende request types (sync, async, batch).
 */

// Platform-specifieke configuraties
const PLATFORM_CONFIGS: Record<string, Record<string, string>> = {
  reddit: {
    headless: 'html',
    geo: 'us',
    locale: 'en-US',
    device_type: 'desktop',
  },
  amazon: {
    headless: 'html',
    geo: 'nl',
    locale: 'nl-NL',
    device_type: 'desktop',
  },
  instagram: {
    headless: 'html',
    geo: 'nl',
    locale: 'nl-NL',
    device_type: 'mobile',
  },
  tiktok: {
    headless: 'html',
    geo: 'nl',
    locale: 'nl-NL',
    device_type: 'mobile',
  },
  trustpilot: {
    headless: 'html',
    geo: 'nl',
    locale: 'nl-NL',
    device_type: 'desktop',
  }
};

// Decodo API configuratie
const DECODO_API_URL = 'https://scraper-api.decodo.com/v2';
const DECODO_API_KEY = 'YOUR_DECODO_API_KEY'; // Replace with your actual API key or use env variable

// Interface definities
interface ScrapeOptions {
  headless?: string;
  geo?: string;
  locale?: string;
  device_type?: string;
  session_id?: string | null;
}

interface ScrapeResult {
  [key: string]: any;
}

// Functie om een Supabase client te maken
const createSupabaseClient = (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://iyeyypnvcickhdlqvhqq.supabase.co';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: { Authorization: req.headers.get('Authorization')! },
    },
    auth: {
      persistSession: false,
    },
  });
};

/**
 * Voert een synchrone scraping request uit
 */
async function scrapeSynchronous(url: string, platform: string, options: ScrapeOptions = {}, projectId: string | null = null, contentType: string | null = null): Promise<ScrapeResult> {
  try {
    const params = {
      url,
      platform,
      headless: options.headless || 'html',
      geo: options.geo || 'us',
      locale: options.locale || 'en-US',
      device_type: options.device_type || 'desktop',
      session_id: options.session_id || null
    };

    const response = await fetch(`${DECODO_API_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${DECODO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Decodo API request failed: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Fout bij het uitvoeren van synchrone scraping:', error);
    throw error;
  }
}

/**
 * Voert een asynchrone scraping request uit
 */
async function scrapeAsynchronous(url: string, platform: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
  try {
    const params = {
      url,
      platform,
      headless: options.headless || 'html',
      geo: options.geo || 'us',
      locale: options.locale || 'en-US',
      device_type: options.device_type || 'desktop',
      session_id: options.session_id || null
    };

    const response = await fetch(`${DECODO_API_URL}/task`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${DECODO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Decodo API async request failed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fout bij het uitvoeren van asynchrone scraping:', error);
    throw error;
  }
}

/**
 * Voert een batch scraping request uit
 */
async function scrapeBatch(urls: string[], platform: string, options: ScrapeOptions = {}, projectId: string | null = null, contentType: string | null = null): Promise<ScrapeResult> {
  try {
    const tasks = urls.map(url => ({
      url,
      platform,
      ...options
    }));

    const response = await fetch(`${DECODO_API_URL}/task/batch`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${DECODO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tasks)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Decodo API batch request failed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fout bij het uitvoeren van batch scraping:', error);
    throw error;
  }
}

/**
 * Haalt de resultaten op van een asynchrone taak
 */
async function getTaskResult(taskId: string): Promise<ScrapeResult> {
  try {
    const response = await fetch(`${DECODO_API_URL}/task/${taskId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${DECODO_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Decodo API task result request failed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fout bij het ophalen van taakresultaat:', error);
    throw error;
  }
}

/**
 * Haalt de resultaten op van een batch taak
 */
async function getBatchResult(batchId: string): Promise<ScrapeResult> {
  try {
    const response = await fetch(`${DECODO_API_URL}/task/batch/${batchId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${DECODO_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Decodo API batch result request failed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fout bij het ophalen van batchresultaat:', error);
    throw error;
  }
}

/**
 * Slaat scraping resultaten op in de database
 */
async function saveScrapingResults(supabase: any, projectId: string, platform: string, contentType: string, data: any): Promise<ScrapeResult> {
  try {
    // Maak eerst een scrape job aan
    const { data: scrapeJob, error: scrapeJobError } = await supabase
      .from('scrape_jobs')
      .insert({
        project_id: projectId,
        platform: platform,
        content_type: contentType,
        status: 'completed',
        params: { url: data.url || 'batch' }
      })
      .select()
      .single();

    if (scrapeJobError) {
      console.error('Fout bij het aanmaken van scrape job:', scrapeJobError);
      throw scrapeJobError;
    }

    // Sla de resultaten op
    const { data: scrapeResult, error: scrapeResultError } = await supabase
      .from('scrape_results')
      .insert({
        scrape_job_id: scrapeJob.id,
        platform: platform,
        content_type: contentType,
        raw_data: data,
        processed_data: null, // Kan later worden verwerkt
        sentiment: null // Kan later worden berekend
      })
      .select()
      .single();

    if (scrapeResultError) {
      console.error('Fout bij het opslaan van scrape resultaten:', scrapeResultError);
      throw scrapeResultError;
    }

    return { success: true, scrapeJob, scrapeResult };
  } catch (error) {
    console.error('Fout bij het opslaan van scraping resultaten:', error);
    throw error;
  }
}

// Edge Function handler
serve(async (req) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    // Alleen POST requests toestaan
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers }
      );
    }

    // Parse request body
    const body = await req.json();
    const { action, projectId, url, platform, requestType, customParams, tasks, taskId, batchId, contentType } = body;

    // Initialiseer Supabase client
    const supabase = createSupabaseClient(req);

    let result;

    // Voer de juiste actie uit op basis van het action veld
    switch (action) {
      case 'scrape_sync':
        result = await scrapeSynchronous(url, platform, customParams || {}, projectId, contentType);
        break;
        
      case 'scrape_async':
        result = await scrapeAsynchronous(url, platform, customParams || {});
        
        // Sla de taak ID op als projectId is opgegeven
        if (projectId && result.task_id) {
          await supabase
            .from('scrape_jobs')
            .insert({
              project_id: projectId,
              platform: platform,
              content_type: contentType || 'page',
              status: 'pending',
              params: { 
                url: url,
                task_id: result.task_id
              }
            });
        }
        break;
        
      case 'scrape_batch':
        result = await scrapeBatch(tasks.map((t: any) => t.url), platform, customParams || {}, projectId, contentType);
        
        // Sla de batch ID op als projectId is opgegeven
        if (projectId && result.batch_id) {
          await supabase
            .from('scrape_jobs')
            .insert({
              project_id: projectId,
              platform: platform,
              content_type: contentType || 'batch',
              status: 'pending',
              params: { 
                urls: tasks.map((t: any) => t.url),
                batch_id: result.batch_id
              }
            });
        }
        break;
        
      case 'get_task_result':
        result = await getTaskResult(taskId);
        
        // Sla resultaten op in de database als projectId is opgegeven en de taak is voltooid
        if (projectId && result.status === 'completed') {
          await saveScrapingResults(supabase, projectId, platform, contentType || 'page', result.data);
          
          // Update de status van de scrape job
          await supabase
            .from('scrape_jobs')
            .update({ status: 'completed' })
            .eq('project_id', projectId)
            .eq('params->task_id', taskId);
        }
        break;
        
      case 'get_batch_result':
        result = await getBatchResult(batchId);
        
        // Sla resultaten op in de database als projectId is opgegeven en alle taken zijn voltooid
        if (projectId && result.status === 'completed') {
          // Voor elke taak in de batch
          for (const task of result.tasks) {
            if (task.status === 'completed') {
              await saveScrapingResults(supabase, projectId, platform, contentType || 'page', task.data);
            }
          }
          
          // Update de status van de scrape job
          await supabase
            .from('scrape_jobs')
            .update({ status: 'completed' })
            .eq('project_id', projectId)
            .eq('params->batch_id', batchId);
        }
        break;
        
      case 'save_results':
        // Direct opslaan van resultaten in de database
        result = await saveScrapingResults(supabase, projectId, platform, contentType || 'page', body.data);
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers }
        );
    }

    // Stuur het resultaat terug
    return new Response(
      JSON.stringify(result),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error in decodo-scraper function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
});