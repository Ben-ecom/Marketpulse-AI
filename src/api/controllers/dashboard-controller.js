/**
 * Dashboard Controller
 *
 * Deze controller bevat alle functies voor het afhandelen van dashboard API-verzoeken.
 * Het biedt endpoints voor het ophalen van overzichtsgegevens en statistieken
 * voor het MarketPulse AI dashboard.
 */

const { createSupabaseClient } = require('../../utils/supabase');
const getMarketResearchService = require('../../services/market-research/market-research-service');

// Haal de market research service op
const marketResearchService = getMarketResearchService();

/**
 * Haal overzichtsgegevens op voor het dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Log de aanvraag
    console.log(`📊 Dashboard overzicht aangevraagd door gebruiker: ${userId || 'anoniem'}`);

    // Valideer de gebruiker
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authenticatie vereist',
      });
    }

    // Haal de gegevens op uit de database
    const supabase = createSupabaseClient();

    // Haal projecten op
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (projectsError) {
      throw new Error(projectsError.message);
    }

    // Haal recente scrape jobs op
    const { data: scrapeJobs, error: scrapeJobsError } = await supabase
      .from('scrape_jobs')
      .select('id, project_id, platform, status, created_at')
      .in('project_id', projects?.map(p => p.id) || [])
      .order('created_at', { ascending: false })
      .limit(10);

    if (scrapeJobsError) {
      throw new Error(scrapeJobsError.message);
    }

    // Haal recente inzichten op
    const { data: insights, error: insightsError } = await supabase
      .from('insights')
      .select('id, project_id, type, data, created_at')
      .in('project_id', projects?.map(p => p.id) || [])
      .order('created_at', { ascending: false })
      .limit(10);

    if (insightsError) {
      throw new Error(insightsError.message);
    }

    // Bereken statistieken
    const stats = {
      totalProjects: projects?.length || 0,
      totalScrapeJobs: scrapeJobs?.length || 0,
      totalInsights: insights?.length || 0,
      recentActivity: [...(projects || []), ...(scrapeJobs || []), ...(insights || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          type: item.name ? 'project' : item.platform ? 'scrape_job' : 'insight',
          name: item.name || `${item.platform || item.type} ${item.id.substring(0, 8)}`,
          date: item.created_at,
        })),
    };

    // Stuur de gegevens terug
    return res.status(200).json({
      success: true,
      data: {
        projects: projects || [],
        scrapeJobs: scrapeJobs || [],
        insights: insights || [],
        stats,
      },
    });
  } catch (error) {
    console.error('❌ Fout in getDashboardOverview controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Serverfout bij het ophalen van dashboard overzicht',
    });
  }
};

/**
 * Haal statistieken op voor een specifiek project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProjectStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    // Log de aanvraag
    console.log(`📊 Project statistieken aangevraagd door gebruiker: ${userId || 'anoniem'}`);

    // Valideer de input
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Geen project-ID verstrekt',
      });
    }

    // Haal de gegevens op uit de database
    const supabase = createSupabaseClient();

    // Controleer of het project bestaat en van de gebruiker is
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError) {
      return res.status(404).json({
        success: false,
        error: 'Project niet gevonden',
      });
    }

    // Haal scrape jobs op voor het project
    const { data: scrapeJobs, error: scrapeJobsError } = await supabase
      .from('scrape_jobs')
      .select('id, platform, status, created_at, completed_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (scrapeJobsError) {
      throw new Error(scrapeJobsError.message);
    }

    // Haal scrape resultaten op voor het project
    const { data: scrapeResults, error: scrapeResultsError } = await supabase
      .from('scrape_results')
      .select('id, job_id, platform, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (scrapeResultsError) {
      throw new Error(scrapeResultsError.message);
    }

    // Haal inzichten op voor het project
    const { data: insights, error: insightsError } = await supabase
      .from('insights')
      .select('id, type, category, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (insightsError) {
      throw new Error(insightsError.message);
    }

    // Bereken statistieken
    const stats = {
      totalScrapeJobs: scrapeJobs?.length || 0,
      totalScrapeResults: scrapeResults?.length || 0,
      totalInsights: insights?.length || 0,
      scrapeJobsByStatus: scrapeJobs?.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {}),
      scrapeJobsByPlatform: scrapeJobs?.reduce((acc, job) => {
        acc[job.platform] = (acc[job.platform] || 0) + 1;
        return acc;
      }, {}),
      insightsByType: insights?.reduce((acc, insight) => {
        acc[insight.type] = (acc[insight.type] || 0) + 1;
        return acc;
      }, {}),
      recentActivity: [
        ...(scrapeJobs?.map(job => ({ ...job, type: 'scrape_job' })) || []),
        ...(insights?.map(insight => ({ ...insight, type: 'insight' })) || []),
      ]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10),
    };

    // Stuur de gegevens terug
    return res.status(200).json({
      success: true,
      data: {
        project,
        stats,
        scrapeJobs: scrapeJobs || [],
        scrapeResults: scrapeResults || [],
        insights: insights || [],
      },
    });
  } catch (error) {
    console.error('❌ Fout in getProjectStats controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Serverfout bij het ophalen van project statistieken',
    });
  }
};

/**
 * Haal recente inzichten op
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRecentInsights = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit) || 10;

    // Log de aanvraag
    console.log(`📊 Recente inzichten aangevraagd door gebruiker: ${userId || 'anoniem'}`);

    // Valideer de gebruiker
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authenticatie vereist',
      });
    }

    // Haal de gegevens op uit de database
    const supabase = createSupabaseClient();

    // Haal projecten op van de gebruiker
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId);

    if (projectsError) {
      throw new Error(projectsError.message);
    }

    // Haal recente inzichten op
    const { data: insights, error: insightsError } = await supabase
      .from('insights')
      .select('id, project_id, type, category, data, created_at')
      .in('project_id', projects?.map(p => p.id) || [])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (insightsError) {
      throw new Error(insightsError.message);
    }

    // Haal projectnamen op
    const { data: projectDetails, error: projectDetailsError } = await supabase
      .from('projects')
      .select('id, name')
      .in('id', insights?.map(i => i.project_id) || []);

    if (projectDetailsError) {
      throw new Error(projectDetailsError.message);
    }

    // Voeg projectnamen toe aan inzichten
    const insightsWithProjectNames = insights?.map(insight => ({
      ...insight,
      projectName: projectDetails?.find(p => p.id === insight.project_id)?.name || 'Onbekend project',
    }));

    // Stuur de gegevens terug
    return res.status(200).json({
      success: true,
      data: insightsWithProjectNames || [],
    });
  } catch (error) {
    console.error('❌ Fout in getRecentInsights controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Serverfout bij het ophalen van recente inzichten',
    });
  }
};

/**
 * Haal populaire trends op
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPopularTrends = async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit) || 10;

    // Log de aanvraag
    console.log(`📊 Populaire trends aangevraagd door gebruiker: ${userId || 'anoniem'}`);

    // Valideer de gebruiker
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authenticatie vereist',
      });
    }

    // Haal de gegevens op uit de database
    const supabase = createSupabaseClient();

    // Haal projecten op van de gebruiker
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId);

    if (projectsError) {
      throw new Error(projectsError.message);
    }

    // Haal markttrends inzichten op
    const { data: insights, error: insightsError } = await supabase
      .from('insights')
      .select('id, project_id, data, created_at')
      .in('project_id', projects?.map(p => p.id) || [])
      .eq('type', 'market_trend')
      .order('created_at', { ascending: false });

    if (insightsError) {
      throw new Error(insightsError.message);
    }

    // Extraheer trends uit inzichten en sorteer op relevantie
    let allTrends = [];
    insights?.forEach(insight => {
      if (insight.data && insight.data.trends) {
        insight.data.trends.forEach(trend => {
          allTrends.push({
            ...trend,
            projectId: insight.project_id,
            insightId: insight.id,
            createdAt: insight.created_at,
          });
        });
      }
    });

    // Sorteer trends op impact en recente datum
    allTrends.sort((a, b) => {
      // Prioriteit op basis van impact
      const impactScore = { high: 3, medium: 2, low: 1 };
      const impactDiff = (impactScore[b.impact] || 0) - (impactScore[a.impact] || 0);
      
      if (impactDiff !== 0) return impactDiff;
      
      // Als impact gelijk is, sorteer op datum
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Beperk tot het gevraagde aantal
    allTrends = allTrends.slice(0, limit);

    // Haal projectnamen op
    const { data: projectDetails, error: projectDetailsError } = await supabase
      .from('projects')
      .select('id, name')
      .in('id', [...new Set(allTrends.map(t => t.projectId))]);

    if (projectDetailsError) {
      throw new Error(projectDetailsError.message);
    }

    // Voeg projectnamen toe aan trends
    const trendsWithProjectNames = allTrends.map(trend => ({
      ...trend,
      projectName: projectDetails?.find(p => p.id === trend.projectId)?.name || 'Onbekend project',
    }));

    // Stuur de gegevens terug
    return res.status(200).json({
      success: true,
      data: trendsWithProjectNames,
    });
  } catch (error) {
    console.error('❌ Fout in getPopularTrends controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Serverfout bij het ophalen van populaire trends',
    });
  }
};

module.exports = {
  getDashboardOverview,
  getProjectStats,
  getRecentInsights,
  getPopularTrends,
};
