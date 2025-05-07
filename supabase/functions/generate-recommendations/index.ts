import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// TypeScript type definities voor Deno
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

/**
 * Generate Recommendations Edge Function
 * 
 * Deze functie analyseert scraping resultaten en genereert marketingaanbevelingen
 * op basis van de verzamelde data. Het gebruikt niche-specifieke marketingstrategieën
 * om gerichte aanbevelingen te genereren.
 */

// Interface definities
interface ScrapingResult {
  id: string;
  platform: string;
  content_type: string;
  raw_data: any;
  processed_data: any;
  sentiment: any;
  scrape_jobs: {
    project_id: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  niche: string;
  [key: string]: any;
}

interface MarketingStrategy {
  id: string;
  platform: string;
  niche: string;
  title: string;
  description: string;
  strategy_text: string;
  priority: string;
  implementation_steps: string[];
}

interface Recommendation {
  platform: string;
  title: string;
  description: string;
  strategy_text: string;
  priority: string;
  implementation_steps: string[];
}

interface AwarenessPhase {
  phase: string;
  title: string;
  description: string;
  strategy_text: string;
  priority: string;
  implementation_steps: string[];
}

// Supabase client
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
 * Haalt de meest recente scraping resultaten op voor een project
 */
async function getLatestScrapingResults(supabase: any, projectId: string, limit = 10): Promise<ScrapingResult[]> {
  try {
    const { data, error } = await supabase
      .from('scrape_results')
      .select(`
        id,
        platform,
        content_type,
        raw_data,
        processed_data,
        sentiment,
        scrape_jobs!inner(project_id)
      `)
      .eq('scrape_jobs.project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Fout bij het ophalen van scraping resultaten:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Fout bij het ophalen van scraping resultaten:', error);
    throw error;
  }
}

/**
 * Haalt projectgegevens op, inclusief de niche
 */
async function getProjectDetails(supabase: any, projectId: string): Promise<Project> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Fout bij het ophalen van projectgegevens:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Fout bij het ophalen van projectgegevens:', error);
    throw error;
  }
}

/**
 * Haalt niche-specifieke marketingstrategieën op
 */
async function getMarketingStrategies(supabase: any, niche: string): Promise<MarketingStrategy[]> {
  try {
    const { data, error } = await supabase
      .from('marketing_strategies')
      .select('*')
      .eq('niche', niche);

    if (error) {
      console.error('Fout bij het ophalen van marketingstrategieën:', error);
      throw error;
    }

    // Als er geen strategieën zijn voor deze specifieke niche, gebruik de algemene strategieën
    if (data.length === 0) {
      const { data: generalData, error: generalError } = await supabase
        .from('marketing_strategies')
        .select('*')
        .eq('niche', 'general');

      if (generalError) {
        console.error('Fout bij het ophalen van algemene marketingstrategieën:', generalError);
        throw generalError;
      }

      return generalData;
    }

    return data;
  } catch (error) {
    console.error('Fout bij het ophalen van marketingstrategieën:', error);
    throw error;
  }
}

/**
 * Genereert aanbevelingen op basis van scraping resultaten en marketingstrategieën
 */
async function generateRecommendations(supabase: any, projectId: string): Promise<Recommendation[]> {
  try {
    // Haal de benodigde gegevens op
    const scrapingResults = await getLatestScrapingResults(supabase, projectId);
    const projectDetails = await getProjectDetails(supabase, projectId);
    const marketingStrategies = await getMarketingStrategies(supabase, projectDetails.niche);

    // Groepeer resultaten per platform
    const platformResults: Record<string, ScrapingResult[]> = {};
    
    for (const result of scrapingResults) {
      if (!platformResults[result.platform]) {
        platformResults[result.platform] = [];
      }
      platformResults[result.platform].push(result);
    }

    // Genereer aanbevelingen per platform
    const recommendations: Recommendation[] = [];

    // Voor elk platform
    for (const platform in platformResults) {
      // Zoek relevante marketingstrategieën voor dit platform
      const platformStrategies = marketingStrategies.filter(strategy => 
        strategy.platform === platform || strategy.platform === 'all'
      );

      // Als er geen strategieën zijn voor dit platform, sla over
      if (platformStrategies.length === 0) continue;

      // Kies een willekeurige strategie (in een echte implementatie zou dit gebaseerd zijn op de data)
      const strategy = platformStrategies[Math.floor(Math.random() * platformStrategies.length)];

      // Maak een aanbeveling op basis van de strategie
      const recommendation: Recommendation = {
        platform: platform,
        title: strategy.title,
        description: strategy.description,
        strategy_text: strategy.strategy_text,
        priority: strategy.priority,
        implementation_steps: strategy.implementation_steps
      };

      // Voeg toe aan de lijst met aanbevelingen
      recommendations.push(recommendation);

      // Sla de aanbeveling op in de database
      const { error } = await supabase
        .from('recommendations')
        .insert({
          project_id: projectId,
          platform: recommendation.platform,
          title: recommendation.title,
          description: recommendation.description,
          strategy_text: recommendation.strategy_text,
          priority: recommendation.priority,
          implementation_steps: recommendation.implementation_steps,
          status: 'pending'
        });

      if (error) {
        console.error('Fout bij het opslaan van aanbeveling:', error);
      }
    }

    return recommendations;
  } catch (error) {
    console.error('Fout bij het genereren van aanbevelingen:', error);
    throw error;
  }
}

/**
 * Genereert aanbevelingen voor de 5 awareness fasen van Eugene Schwartz
 */
async function generateAwarenessPhasesRecommendations(supabase: any, projectId: string): Promise<AwarenessPhase[]> {
  try {
    // Haal de benodigde gegevens op
    const projectDetails = await getProjectDetails(supabase, projectId);

    // De 5 awareness fasen
    const awarenessPhases: AwarenessPhase[] = [
      {
        phase: 'unaware',
        title: 'Unaware Fase Strategie',
        description: 'Strategie voor klanten die zich niet bewust zijn van hun probleem',
        strategy_text: 'Focus op het identificeren van pijnpunten en het creëren van bewustzijn rond het probleem dat je product oplost. Gebruik storytelling en emotionele triggers.',
        priority: 'medium',
        implementation_steps: [
          'Identificeer de belangrijkste pijnpunten in de doelgroep',
          'Ontwikkel content die deze pijnpunten benadrukt',
          'Gebruik storytelling om emotionele connectie te maken',
          'Verspreid bewustzijnscampagnes op sociale media',
          'Meet engagement en pas aan waar nodig'
        ]
      },
      {
        phase: 'problem_aware',
        title: 'Problem Aware Fase Strategie',
        description: 'Strategie voor klanten die zich bewust zijn van hun probleem, maar niet van oplossingen',
        strategy_text: 'Bied educatieve content die het probleem verder uitlegt en hint naar mogelijke oplossingsrichtingen, zonder direct je product te promoten.',
        priority: 'high',
        implementation_steps: [
          'Creëer diepgaande blog posts over het probleem',
          'Ontwikkel een e-book of whitepaper',
          'Start een email-reeks die het probleem verder uitdiept',
          'Organiseer webinars of workshops',
          'Verzamel getuigenissen van mensen met hetzelfde probleem'
        ]
      },
      {
        phase: 'solution_aware',
        title: 'Solution Aware Fase Strategie',
        description: 'Strategie voor klanten die zich bewust zijn van mogelijke oplossingen, maar niet van jouw product',
        strategy_text: 'Vergelijk verschillende oplossingstypen en positioneer jouw aanpak als de meest effectieve. Focus op de unieke voordelen van jouw benadering.',
        priority: 'high',
        implementation_steps: [
          'Maak vergelijkende content tussen verschillende oplossingstypen',
          'Benadruk de unieke voordelen van jouw type oplossing',
          'Deel case studies van succesvolle implementaties',
          'Creëer content die uitlegt waarom jouw aanpak werkt',
          'Gebruik data en statistieken om je claims te onderbouwen'
        ]
      },
      {
        phase: 'product_aware',
        title: 'Product Aware Fase Strategie',
        description: 'Strategie voor klanten die zich bewust zijn van jouw product, maar nog niet overtuigd zijn',
        strategy_text: 'Overtuig potentiële klanten dat jouw product de beste keuze is. Focus op onderscheidende kenmerken, sociale bewijzen en het wegnemen van bezwaren.',
        priority: 'high',
        implementation_steps: [
          'Verzamel en deel klantervaringen en testimonials',
          'Bied productdemo\'s en gratis proefversies aan',
          'Creëer gedetailleerde productpagina\'s met alle features',
          'Adresseer veelvoorkomende bezwaren in je content',
          'Gebruik vergelijkende content met concurrenten'
        ]
      },
      {
        phase: 'most_aware',
        title: 'Most Aware Fase Strategie',
        description: 'Strategie voor klanten die volledig bewust zijn en klaar zijn om te kopen',
        strategy_text: 'Maak het aankoopproces zo eenvoudig mogelijk en bied de juiste incentives om de beslissing te vergemakkelijken. Focus op urgentie en exclusiviteit.',
        priority: 'medium',
        implementation_steps: [
          'Optimaliseer het checkout proces',
          'Bied tijdelijke kortingen of bonussen aan',
          'Implementeer abandoned cart emails',
          'Creëer een loyaliteitsprogramma voor herhaalaankopen',
          'Vraag om referrals na aankoop'
        ]
      }
    ];

    // Sla elke fase op in de database
    for (const phase of awarenessPhases) {
      const { error } = await supabase
        .from('recommendations')
        .insert({
          project_id: projectId,
          platform: 'awareness',
          phase: phase.phase,
          title: phase.title,
          description: phase.description,
          strategy_text: phase.strategy_text,
          priority: phase.priority,
          implementation_steps: phase.implementation_steps,
          status: 'pending'
        });

      if (error) {
        console.error('Fout bij het opslaan van awareness fase aanbeveling:', error);
      }
    }

    return awarenessPhases;
  } catch (error) {
    console.error('Fout bij het genereren van awareness fase aanbevelingen:', error);
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
    const { action, projectId } = body;

    // Initialiseer Supabase client
    const supabase = createSupabaseClient(req);

    let result;

    // Voer de juiste actie uit op basis van het action veld
    switch (action) {
      case 'generate_recommendations':
        result = await generateRecommendations(supabase, projectId);
        break;
        
      case 'generate_awareness_recommendations':
        result = await generateAwarenessPhasesRecommendations(supabase, projectId);
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
    console.error('Error in generate-recommendations function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
});