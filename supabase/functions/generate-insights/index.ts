import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// TypeScript type definities voor Deno
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

/**
 * Generate Insights Edge Function
 * 
 * Deze functie analyseert scraping resultaten en genereert inzichten.
 * Het kan handmatig worden aangeroepen of via een cron job.
 */

// Interface definities
interface ScrapingResult {
  id: string;
  platform: string;
  content_type: string;
  raw_data: Record<string, any>;
  processed_data: Record<string, any> | null;
  sentiment: Record<string, any> | null;
  created_at: string;
  scrape_job_id: string;
}

interface Insight {
  project_id: string;
  insight_type: string;
  platform?: string;
  content_type?: string;
  data: Record<string, any>;
  description: string;
  period_start: string;
  period_end: string;
}

interface InsightRequest {
  project_id: string;
  period_start?: string;
  period_end?: string;
  platforms?: string[];
  content_types?: string[];
  insight_types?: string[];
}

/**
 * Haalt scraping resultaten op voor een project binnen een bepaalde periode
 */
async function getScrapingResults(
  supabase: any, 
  projectId: string, 
  periodStart?: string, 
  periodEnd?: string, 
  platforms?: string[], 
  contentTypes?: string[]
): Promise<ScrapingResult[]> {
  try {
    let query = supabase
      .from('scrape_results')
      .select(`
        id,
        platform,
        content_type,
        raw_data,
        processed_data,
        sentiment,
        created_at,
        scrape_job_id,
        scrape_jobs!inner(project_id)
      `)
      .eq('scrape_jobs.project_id', projectId);
    
    // Voeg periode filter toe indien opgegeven
    if (periodStart) {
      query = query.gte('created_at', periodStart);
    }
    
    if (periodEnd) {
      query = query.lte('created_at', periodEnd);
    }
    
    // Voeg platform filter toe indien opgegeven
    if (platforms && platforms.length > 0) {
      query = query.in('platform', platforms);
    }
    
    // Voeg content type filter toe indien opgegeven
    if (contentTypes && contentTypes.length > 0) {
      query = query.in('content_type', contentTypes);
    }
    
    // Voer de query uit
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Fout bij het ophalen van scraping resultaten:', error);
    throw error;
  }
}

/**
 * Genereert trend inzichten
 */
async function generateTrendInsights(
  supabase: any, 
  projectId: string, 
  results: ScrapingResult[],
  periodStart: string,
  periodEnd: string
): Promise<Insight[]> {
  try {
    const insights: Insight[] = [];
    
    // Groepeer resultaten per platform
    const platformGroups = results.reduce((groups, result) => {
      const platform = result.platform || 'unknown';
      if (!groups[platform]) {
        groups[platform] = [];
      }
      groups[platform].push(result);
      return groups;
    }, {} as Record<string, ScrapingResult[]>);
    
    // Genereer inzichten per platform
    for (const [platform, platformResults] of Object.entries(platformGroups)) {
      // Bereken trends over tijd
      const timeSeriesData = generateTimeSeriesData(platformResults);
      
      // Voeg platform trend inzicht toe
      insights.push({
        project_id: projectId,
        insight_type: 'trend',
        platform,
        data: {
          time_series: timeSeriesData,
          total_results: platformResults.length,
          trend_direction: calculateTrendDirection(timeSeriesData)
        },
        description: generateTrendDescription(platform, timeSeriesData),
        period_start: periodStart,
        period_end: periodEnd
      });
    }
    
    // Genereer een algemeen trend inzicht over alle platforms
    const allTimeSeriesData = generateTimeSeriesData(results);
    insights.push({
      project_id: projectId,
      insight_type: 'trend',
      data: {
        time_series: allTimeSeriesData,
        total_results: results.length,
        trend_direction: calculateTrendDirection(allTimeSeriesData),
        platform_distribution: Object.entries(platformGroups).map(([platform, results]) => ({
          platform,
          count: results.length,
          percentage: (results.length / results.length) * 100
        }))
      },
      description: generateOverallTrendDescription(allTimeSeriesData, platformGroups),
      period_start: periodStart,
      period_end: periodEnd
    });
    
    return insights;
  } catch (error) {
    console.error('Fout bij het genereren van trend inzichten:', error);
    throw error;
  }
}

/**
 * Genereert tijdreeks data voor een set resultaten
 */
function generateTimeSeriesData(results: ScrapingResult[]): Record<string, number> {
  // Groepeer resultaten per dag
  const timeSeriesData: Record<string, number> = {};
  
  results.forEach(result => {
    const date = new Date(result.created_at);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!timeSeriesData[dateString]) {
      timeSeriesData[dateString] = 0;
    }
    
    timeSeriesData[dateString]++;
  });
  
  return timeSeriesData;
}

/**
 * Berekent de richting van een trend (stijgend, dalend, stabiel)
 */
function calculateTrendDirection(timeSeriesData: Record<string, number>): string {
  const dates = Object.keys(timeSeriesData).sort();
  
  if (dates.length < 2) {
    return 'stable';
  }
  
  const firstValue = timeSeriesData[dates[0]];
  const lastValue = timeSeriesData[dates[dates.length - 1]];
  
  if (lastValue > firstValue * 1.1) { // 10% stijging
    return 'increasing';
  } else if (lastValue < firstValue * 0.9) { // 10% daling
    return 'decreasing';
  } else {
    return 'stable';
  }
}

/**
 * Genereert een beschrijving voor een trend inzicht
 */
function generateTrendDescription(platform: string, timeSeriesData: Record<string, number>): string {
  const trendDirection = calculateTrendDirection(timeSeriesData);
  const totalResults = Object.values(timeSeriesData).reduce((sum, count) => sum + count, 0);
  
  if (trendDirection === 'increasing') {
    return `Stijgende trend in ${platform} resultaten. Totaal ${totalResults} resultaten verzameld.`;
  } else if (trendDirection === 'decreasing') {
    return `Dalende trend in ${platform} resultaten. Totaal ${totalResults} resultaten verzameld.`;
  } else {
    return `Stabiele trend in ${platform} resultaten. Totaal ${totalResults} resultaten verzameld.`;
  }
}

/**
 * Genereert een algemene beschrijving voor trends over alle platforms
 */
function generateOverallTrendDescription(
  timeSeriesData: Record<string, number>,
  platformGroups: Record<string, ScrapingResult[]>
): string {
  const trendDirection = calculateTrendDirection(timeSeriesData);
  const totalResults = Object.values(timeSeriesData).reduce((sum, count) => sum + count, 0);
  const platforms = Object.keys(platformGroups);
  
  let trendText = '';
  if (trendDirection === 'increasing') {
    trendText = 'stijgende';
  } else if (trendDirection === 'decreasing') {
    trendText = 'dalende';
  } else {
    trendText = 'stabiele';
  }
  
  return `${trendText} trend in resultaten over alle platforms (${platforms.join(', ')}). Totaal ${totalResults} resultaten verzameld.`;
}

/**
 * Genereert sentiment inzichten
 */
async function generateSentimentInsights(
  supabase: any, 
  projectId: string, 
  results: ScrapingResult[],
  periodStart: string,
  periodEnd: string
): Promise<Insight[]> {
  try {
    const insights: Insight[] = [];
    
    // Filter resultaten met sentiment data
    const resultsWithSentiment = results.filter(result => result.sentiment !== null);
    
    if (resultsWithSentiment.length === 0) {
      return [];
    }
    
    // Groepeer resultaten per platform
    const platformGroups = resultsWithSentiment.reduce((groups, result) => {
      const platform = result.platform || 'unknown';
      if (!groups[platform]) {
        groups[platform] = [];
      }
      groups[platform].push(result);
      return groups;
    }, {} as Record<string, ScrapingResult[]>);
    
    // Genereer inzichten per platform
    for (const [platform, platformResults] of Object.entries(platformGroups)) {
      // Bereken gemiddeld sentiment
      const sentimentData = calculateSentimentDistribution(platformResults);
      
      // Voeg platform sentiment inzicht toe
      insights.push({
        project_id: projectId,
        insight_type: 'sentiment',
        platform,
        data: sentimentData,
        description: generateSentimentDescription(platform, sentimentData),
        period_start: periodStart,
        period_end: periodEnd
      });
    }
    
    // Genereer een algemeen sentiment inzicht over alle platforms
    const overallSentimentData = calculateSentimentDistribution(resultsWithSentiment);
    insights.push({
      project_id: projectId,
      insight_type: 'sentiment',
      data: {
        ...overallSentimentData,
        platform_comparison: Object.entries(platformGroups).map(([platform, results]) => ({
          platform,
          sentiment: calculateSentimentDistribution(results)
        }))
      },
      description: generateOverallSentimentDescription(overallSentimentData, platformGroups),
      period_start: periodStart,
      period_end: periodEnd
    });
    
    return insights;
  } catch (error) {
    console.error('Fout bij het genereren van sentiment inzichten:', error);
    throw error;
  }
}

/**
 * Berekent de sentiment distributie voor een set resultaten
 */
function calculateSentimentDistribution(results: ScrapingResult[]): Record<string, any> {
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let totalScore = 0;
  
  results.forEach(result => {
    if (result.sentiment) {
      const score = result.sentiment.score || 0;
      totalScore += score;
      
      if (score > 0.2) {
        positiveCount++;
      } else if (score < -0.2) {
        negativeCount++;
      } else {
        neutralCount++;
      }
    }
  });
  
  const totalResults = results.length;
  const averageScore = totalResults > 0 ? totalScore / totalResults : 0;
  
  return {
    average_score: averageScore,
    positive: {
      count: positiveCount,
      percentage: totalResults > 0 ? (positiveCount / totalResults) * 100 : 0
    },
    neutral: {
      count: neutralCount,
      percentage: totalResults > 0 ? (neutralCount / totalResults) * 100 : 0
    },
    negative: {
      count: negativeCount,
      percentage: totalResults > 0 ? (negativeCount / totalResults) * 100 : 0
    },
    total: totalResults
  };
}

/**
 * Genereert een beschrijving voor een sentiment inzicht
 */
function generateSentimentDescription(platform: string, sentimentData: Record<string, any>): string {
  const { average_score, positive, neutral, negative } = sentimentData;
  
  let sentimentText = '';
  if (average_score > 0.2) {
    sentimentText = 'overwegend positief';
  } else if (average_score < -0.2) {
    sentimentText = 'overwegend negatief';
  } else {
    sentimentText = 'overwegend neutraal';
  }
  
  return `Sentiment op ${platform} is ${sentimentText} met ${positive.percentage.toFixed(1)}% positieve, ${neutral.percentage.toFixed(1)}% neutrale, en ${negative.percentage.toFixed(1)}% negatieve resultaten.`;
}

/**
 * Genereert een algemene beschrijving voor sentiment over alle platforms
 */
function generateOverallSentimentDescription(
  sentimentData: Record<string, any>,
  platformGroups: Record<string, ScrapingResult[]>
): string {
  const { average_score, positive, neutral, negative } = sentimentData;
  const platforms = Object.keys(platformGroups);
  
  let sentimentText = '';
  if (average_score > 0.2) {
    sentimentText = 'overwegend positief';
  } else if (average_score < -0.2) {
    sentimentText = 'overwegend negatief';
  } else {
    sentimentText = 'overwegend neutraal';
  }
  
  return `Algemeen sentiment over alle platforms (${platforms.join(', ')}) is ${sentimentText} met ${positive.percentage.toFixed(1)}% positieve, ${neutral.percentage.toFixed(1)}% neutrale, en ${negative.percentage.toFixed(1)}% negatieve resultaten.`;
}

/**
 * Slaat inzichten op in de database
 */
async function saveInsights(supabase: any, insights: Insight[]): Promise<void> {
  try {
    if (insights.length === 0) {
      return;
    }
    
    const { error } = await supabase
      .from('insights')
      .insert(insights);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Fout bij het opslaan van inzichten:', error);
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
    // Parse request body
    const requestData: InsightRequest = await req.json();
    
    // Valideer request data
    if (!requestData.project_id) {
      throw new Error('project_id is verplicht');
    }
    
    // Stel periode in
    const now = new Date();
    const periodEnd = requestData.period_end ? new Date(requestData.period_end) : now;
    
    // Standaard periode is 30 dagen
    const defaultStart = new Date(now);
    defaultStart.setDate(defaultStart.getDate() - 30);
    
    const periodStart = requestData.period_start ? new Date(requestData.period_start) : defaultStart;
    
    // Initialiseer Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      }
    });
    
    // Haal scraping resultaten op
    const results = await getScrapingResults(
      supabase, 
      requestData.project_id,
      periodStart.toISOString(),
      periodEnd.toISOString(),
      requestData.platforms,
      requestData.content_types
    );
    
    if (results.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Geen resultaten gevonden voor de opgegeven criteria' }),
        { status: 200, headers }
      );
    }
    
    // Genereer inzichten
    const insights: Insight[] = [];
    
    // Bepaal welke inzichten te genereren
    const insightTypes = requestData.insight_types || ['trend', 'sentiment', 'keyword', 'comparison'];
    
    // Genereer trend inzichten
    if (insightTypes.includes('trend')) {
      const trendInsights = await generateTrendInsights(
        supabase,
        requestData.project_id,
        results,
        periodStart.toISOString(),
        periodEnd.toISOString()
      );
      
      insights.push(...trendInsights);
    }
    
    // Genereer sentiment inzichten
    if (insightTypes.includes('sentiment')) {
      const sentimentInsights = await generateSentimentInsights(
        supabase,
        requestData.project_id,
        results,
        periodStart.toISOString(),
        periodEnd.toISOString()
      );
      
      insights.push(...sentimentInsights);
    }
    
    // Sla inzichten op
    await saveInsights(supabase, insights);
    
    return new Response(
      JSON.stringify({ 
        message: `${insights.length} inzichten gegenereerd`,
        insights
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
});
