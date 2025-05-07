import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// TypeScript type definities voor Deno
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

/**
 * Scheduled Scraper Edge Function
 * 
 * Deze functie voert geplande scraping taken uit en slaat de resultaten op in de database.
 * Het kan handmatig worden aangeroepen of via een cron job.
 */

// Decodo API configuratie
const DECODO_API_URL = 'https://scraper-api.decodo.com/v2';
const DECODO_API_KEY = Deno.env.get('DECODO_API_KEY') || '';

// Interface definities
interface ScheduledScrapeJob {
  id: string;
  project_id: string;
  platform: string;
  content_type: string;
  url: string;
  frequency: string;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  params: Record<string, any>;
  active: boolean;
  last_run: string | null;
  next_run: string | null;
  created_at: string;
  updated_at: string;
}

interface ScrapeResult {
  [key: string]: any;
}

/**
 * Haalt alle taken op die moeten worden uitgevoerd
 */
async function getTasksDueForExecution(supabase: any): Promise<ScheduledScrapeJob[]> {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('scheduled_scrape_jobs')
      .select('*')
      .eq('active', true)
      .lte('next_run', now)
      .order('next_run', { ascending: true });
    
    if (error) {
      console.error('Fout bij het ophalen van taken:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Fout bij het ophalen van taken:', error);
    throw error;
  }
}

/**
 * Voert een scraping taak uit
 */
async function executeScrapingTask(task: ScheduledScrapeJob): Promise<ScrapeResult> {
  try {
    // Bereid de parameters voor
    const params = {
      url: task.url,
      platform: task.platform,
      headless: task.params?.headless || 'html',
      geo: task.params?.geo || 'nl',
      locale: task.params?.locale || 'nl-NL',
      device_type: task.params?.device_type || 'desktop',
      session_id: task.params?.session_id || `scheduled_${task.id}_${new Date().getTime()}`
    };
    
    // Voer de scraping taak uit
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
    
    return await response.json();
  } catch (error) {
    console.error(`Fout bij het uitvoeren van scraping taak ${task.id}:`, error);
    throw error;
  }
}

/**
 * Slaat het resultaat op in de database
 */
async function saveScrapingResult(supabase: any, task: ScheduledScrapeJob, result: ScrapeResult): Promise<void> {
  try {
    // Maak eerst een scrape job aan
    const { data: scrapeJob, error: scrapeJobError } = await supabase
      .from('scrape_jobs')
      .insert({
        project_id: task.project_id,
        platform: task.platform,
        content_type: task.content_type,
        status: 'completed',
        params: { 
          url: task.url,
          scheduled: true,
          scheduled_job_id: task.id
        }
      })
      .select()
      .single();
    
    if (scrapeJobError) {
      console.error('Fout bij het aanmaken van scrape job:', scrapeJobError);
      throw scrapeJobError;
    }
    
    // Sla het resultaat op
    const { error: scrapeResultError } = await supabase
      .from('scrape_results')
      .insert({
        scrape_job_id: scrapeJob.id,
        platform: task.platform,
        content_type: task.content_type,
        raw_data: result,
        processed_data: null, // Kan later worden verwerkt
        sentiment: null // Kan later worden berekend
      });
    
    if (scrapeResultError) {
      console.error('Fout bij het opslaan van scrape resultaat:', scrapeResultError);
      throw scrapeResultError;
    }
  } catch (error) {
    console.error(`Fout bij het opslaan van resultaat voor taak ${task.id}:`, error);
    throw error;
  }
}

/**
 * Berekent de volgende uitvoeringstijd voor een taak
 */
function calculateNextRun(task: ScheduledScrapeJob): Date {
  const now = new Date();
  const nextRun = new Date();
  
  // Zet de tijd op de ingestelde tijd
  const [hours, minutes] = task.time_of_day.split(':').map(Number);
  nextRun.setHours(hours, minutes, 0, 0);
  
  // Als de tijd vandaag al is geweest, zet de datum op morgen
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  // Pas de datum aan op basis van de frequentie
  switch (task.frequency) {
    case 'daily':
      // Geen aanpassing nodig, we hebben al de volgende dag ingesteld als nodig
      break;
      
    case 'weekly':
      // Zet de datum op de volgende dag van de week
      const dayOfWeek = task.day_of_week !== null ? task.day_of_week : 0; // Default naar zondag
      const currentDay = nextRun.getDay();
      let daysUntilTargetDay = dayOfWeek - currentDay;
      
      if (daysUntilTargetDay <= 0) {
        // Als de dag vandaag is of al is geweest deze week, ga naar volgende week
        daysUntilTargetDay += 7;
      }
      
      nextRun.setDate(nextRun.getDate() + daysUntilTargetDay);
      break;
      
    case 'monthly':
      // Zet de datum op de volgende dag van de maand
      const dayOfMonth = task.day_of_month !== null ? task.day_of_month : 1; // Default naar de 1e
      
      // Ga naar de volgende maand
      nextRun.setMonth(nextRun.getMonth() + 1);
      
      // Zet de dag van de maand
      // Zorg ervoor dat we niet over de grenzen van de maand gaan
      const lastDayOfMonth = new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate();
      const targetDay = Math.min(dayOfMonth, lastDayOfMonth);
      nextRun.setDate(targetDay);
      break;
  }
  
  return nextRun;
}

/**
 * Werkt de last_run en next_run velden bij
 */
async function updateTaskTimings(supabase: any, task: ScheduledScrapeJob): Promise<void> {
  try {
    const now = new Date();
    const nextRun = calculateNextRun(task);
    
    const { error } = await supabase
      .from('scheduled_scrape_jobs')
      .update({
        last_run: now.toISOString(),
        next_run: nextRun.toISOString()
      })
      .eq('id', task.id);
    
    if (error) {
      console.error(`Fout bij het bijwerken van taak ${task.id}:`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Fout bij het bijwerken van taak ${task.id}:`, error);
    throw error;
  }
}

/**
 * Verwerkt een enkele taak
 */
async function processTask(supabase: any, task: ScheduledScrapeJob): Promise<void> {
  try {
    console.log(`Verwerken van taak ${task.id} voor project ${task.project_id}`);
    
    // Voer de scraping taak uit
    const result = await executeScrapingTask(task);
    
    // Sla het resultaat op
    await saveScrapingResult(supabase, task, result);
    
    // Werk de last_run en next_run velden bij
    await updateTaskTimings(supabase, task);
    
    console.log(`Taak ${task.id} succesvol verwerkt`);
  } catch (error) {
    console.error(`Fout bij het verwerken van taak ${task.id}:`, error);
    
    // Log de fout in de database
    try {
      await supabase
        .from('scheduled_scrape_jobs')
        .update({
          last_run: new Date().toISOString(),
          next_run: calculateNextRun(task).toISOString(),
          params: {
            ...task.params,
            last_error: error.message,
            last_error_time: new Date().toISOString()
          }
        })
        .eq('id', task.id);
    } catch (dbError) {
      console.error(`Fout bij het loggen van fout voor taak ${task.id}:`, dbError);
    }
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
    // Initialiseer Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      }
    });

    // Haal taken op die moeten worden uitgevoerd
    const tasks = await getTasksDueForExecution(supabase);
    
    if (tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Geen taken om uit te voeren' }),
        { status: 200, headers }
      );
    }
    
    // Verwerk elke taak
    const results = [];
    
    for (const task of tasks) {
      try {
        await processTask(supabase, task);
        results.push({ id: task.id, status: 'success' });
      } catch (error) {
        results.push({ id: task.id, status: 'error', message: error.message });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: `${results.length} taken verwerkt`,
        results
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error in scheduled-scraper function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
});
