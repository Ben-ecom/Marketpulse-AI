/**
 * HelpMetricsService.js
 * 
 * Service voor het ophalen en analyseren van help-systeem metrieken.
 * Deze service bevat functies voor het ophalen van gegevens uit de help_interactions,
 * help_feedback en user_experience_feedback tabellen.
 * 
 * Implementeert caching om de prestaties te verbeteren en de belasting van de database te verminderen.
 */

import { supabase } from '../../utils/supabaseClient';
import { 
  withCache, 
  setCache, 
  getCache, 
  clearCache, 
  clearCacheByPrefix, 
  configureCache,
  generateCacheKey 
} from '../../utils/cacheUtils';

// Configureer de cache voor help metrics
configureCache({
  DEFAULT_TTL: 300, // 5 minuten in seconden
  MAX_CACHE_SIZE: 500, // Maximum aantal items in de cache
  GARBAGE_COLLECTION_INTERVAL: 60000 // 1 minuut in milliseconden
});

// Cache key prefix voor alle metrics
const CACHE_PREFIX = 'help_metrics';

/**
 * Haalt een samenvatting op van de help-systeem metrieken
 * @param {Object} filters - Filters voor de query (dateRange, userRoles, experienceLevels)
 * @returns {Promise<Object>} - Samenvatting van de metrieken
 */
// Originele functie zonder caching
const _getHelpMetricsSummary = async (filters = {}) => {
  try {
    const { dateRange, userRoles, experienceLevels } = filters;
    
    // Bouw query filters
    let interactionsQuery = supabase
      .from('help_interactions')
      .select('*', { count: 'exact' });
    
    let feedbackQuery = supabase
      .from('help_feedback')
      .select('*', { count: 'exact' });
    
    let userFeedbackQuery = supabase
      .from('user_experience_feedback')
      .select('*', { count: 'exact' });
    
    // Voeg datum filter toe indien aanwezig
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).toISOString();
      const endDate = new Date(dateRange.end).toISOString();
      
      interactionsQuery = interactionsQuery.gte('created_at', startDate).lte('created_at', endDate);
      feedbackQuery = feedbackQuery.gte('created_at', startDate).lte('created_at', endDate);
      userFeedbackQuery = userFeedbackQuery.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    // Voeg gebruikersrol filter toe indien aanwezig
    if (userRoles && userRoles.length > 0) {
      interactionsQuery = interactionsQuery.in('user_role', userRoles);
      feedbackQuery = feedbackQuery.in('user_role', userRoles);
      userFeedbackQuery = userFeedbackQuery.in('user_role', userRoles);
    }
    
    // Voeg ervaringsniveau filter toe indien aanwezig
    if (experienceLevels && experienceLevels.length > 0) {
      interactionsQuery = interactionsQuery.in('experience_level', experienceLevels);
      feedbackQuery = feedbackQuery.in('experience_level', experienceLevels);
      userFeedbackQuery = userFeedbackQuery.in('experience_level', experienceLevels);
    }
    
    // Voer de queries uit
    const [interactionsResponse, feedbackResponse, userFeedbackResponse, positiveFeedbackResponse] = await Promise.all([
      interactionsQuery,
      feedbackQuery,
      userFeedbackQuery,
      supabase
        .from('help_feedback')
        .select('*', { count: 'exact' })
        .eq('feedback_value', true)
        .conditionalFilter('created_at', dateRange)
        .conditionalFilter('user_role', userRoles)
        .conditionalFilter('experience_level', experienceLevels)
    ]);
    
    // Bereken metrieken
    const totalInteractions = interactionsResponse.count || 0;
    const totalFeedback = feedbackResponse.count || 0;
    const totalUserFeedback = userFeedbackResponse.count || 0;
    const positiveFeedbackCount = positiveFeedbackResponse.count || 0;
    
    const feedbackSubmissionRate = totalInteractions > 0 ? (totalFeedback / totalInteractions) * 100 : 0;
    const positiveFeedbackRate = totalFeedback > 0 ? (positiveFeedbackCount / totalFeedback) * 100 : 0;
    
    // Bereken gemiddelde gebruikerstevredenheid
    let averageUserSatisfaction = 0;
    if (userFeedbackResponse.data && userFeedbackResponse.data.length > 0) {
      const totalRating = userFeedbackResponse.data.reduce((sum, item) => sum + item.rating, 0);
      averageUserSatisfaction = totalRating / userFeedbackResponse.data.length;
    }
    
    return {
      totalInteractions,
      totalFeedback,
      totalUserFeedback,
      feedbackSubmissionRate,
      positiveFeedbackRate,
      averageUserSatisfaction
    };
  } catch (error) {
    console.error('Error fetching help metrics summary:', error);
    throw error;
  }
};

/**
 * Haalt de help interacties op per type
 * @param {Object} filters - Filters voor de query (dateRange, userRoles, experienceLevels)
 * @returns {Promise<Object>} - Interacties per type
 */
// Originele functie zonder caching
const _getHelpInteractionsByType = async (filters = {}) => {
  try {
    const { dateRange, userRoles, experienceLevels } = filters;
    
    let query = supabase
      .from('help_interactions')
      .select('action, count')
      .group('action');
    
    // Voeg filters toe
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).toISOString();
      const endDate = new Date(dateRange.end).toISOString();
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    if (userRoles && userRoles.length > 0) {
      query = query.in('user_role', userRoles);
    }
    
    if (experienceLevels && experienceLevels.length > 0) {
      query = query.in('experience_level', experienceLevels);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transformeer data naar een bruikbaar formaat
    const interactionsByType = {};
    data.forEach(item => {
      interactionsByType[item.action] = item.count;
    });
    
    return interactionsByType;
  } catch (error) {
    console.error('Error fetching help interactions by type:', error);
    throw error;
  }
};

/**
 * Haalt de help interacties op per pagina
 * @param {Object} filters - Filters voor de query (dateRange, userRoles, experienceLevels)
 * @returns {Promise<Object>} - Interacties per pagina
 */
// Originele functie zonder caching
const _getHelpInteractionsByPage = async (filters = {}) => {
  try {
    const { dateRange, userRoles, experienceLevels } = filters;
    
    let query = supabase
      .from('help_interactions')
      .select('page_context, count')
      .group('page_context');
    
    // Voeg filters toe
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).toISOString();
      const endDate = new Date(dateRange.end).toISOString();
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    if (userRoles && userRoles.length > 0) {
      query = query.in('user_role', userRoles);
    }
    
    if (experienceLevels && experienceLevels.length > 0) {
      query = query.in('experience_level', experienceLevels);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transformeer data naar een bruikbaar formaat
    const interactionsByPage = {};
    data.forEach(item => {
      interactionsByPage[item.page_context] = item.count;
    });
    
    return interactionsByPage;
  } catch (error) {
    console.error('Error fetching help interactions by page:', error);
    throw error;
  }
};

/**
 * Haalt de feedback op per help item
 * @param {Object} filters - Filters voor de query (dateRange, userRoles, experienceLevels)
 * @returns {Promise<Array>} - Feedback per help item
 */
// Originele functie zonder caching
const _getFeedbackByHelpItem = async (filters = {}) => {
  try {
    const { dateRange, userRoles, experienceLevels } = filters;
    
    let query = supabase
      .from('help_feedback')
      .select('help_item_id, help_item_type, feedback_value, count')
      .group('help_item_id, help_item_type, feedback_value');
    
    // Voeg filters toe
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).toISOString();
      const endDate = new Date(dateRange.end).toISOString();
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    if (userRoles && userRoles.length > 0) {
      query = query.in('user_role', userRoles);
    }
    
    if (experienceLevels && experienceLevels.length > 0) {
      query = query.in('experience_level', experienceLevels);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transformeer data naar een bruikbaar formaat
    const feedbackByHelpItem = {};
    
    data.forEach(item => {
      if (!feedbackByHelpItem[item.help_item_id]) {
        feedbackByHelpItem[item.help_item_id] = {
          id: item.help_item_id,
          type: item.help_item_type,
          positive: 0,
          negative: 0,
          total: 0
        };
      }
      
      if (item.feedback_value) {
        feedbackByHelpItem[item.help_item_id].positive += item.count;
      } else {
        feedbackByHelpItem[item.help_item_id].negative += item.count;
      }
      
      feedbackByHelpItem[item.help_item_id].total += item.count;
    });
    
    // Bereken de positieve feedback ratio
    Object.values(feedbackByHelpItem).forEach(item => {
      item.positiveRatio = item.total > 0 ? (item.positive / item.total) * 100 : 0;
    });
    
    return Object.values(feedbackByHelpItem);
  } catch (error) {
    console.error('Error fetching feedback by help item:', error);
    throw error;
  }
};

/**
 * Haalt de feedback op per gebruikersrol
 * @param {Object} filters - Filters voor de query (dateRange)
 * @returns {Promise<Array>} - Feedback per gebruikersrol
 */
// Originele functie zonder caching
const _getFeedbackByUserRole = async (filters = {}) => {
  try {
    const { dateRange } = filters;
    
    let query = supabase
      .from('help_feedback')
      .select('user_role, feedback_value, count')
      .group('user_role, feedback_value');
    
    // Voeg datum filter toe indien aanwezig
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).toISOString();
      const endDate = new Date(dateRange.end).toISOString();
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transformeer data naar een bruikbaar formaat
    const feedbackByUserRole = {};
    
    data.forEach(item => {
      if (!feedbackByUserRole[item.user_role]) {
        feedbackByUserRole[item.user_role] = {
          role: item.user_role,
          positive: 0,
          negative: 0,
          total: 0
        };
      }
      
      if (item.feedback_value) {
        feedbackByUserRole[item.user_role].positive += item.count;
      } else {
        feedbackByUserRole[item.user_role].negative += item.count;
      }
      
      feedbackByUserRole[item.user_role].total += item.count;
    });
    
    // Bereken de positieve feedback ratio
    Object.values(feedbackByUserRole).forEach(item => {
      item.positiveRatio = item.total > 0 ? (item.positive / item.total) * 100 : 0;
    });
    
    return Object.values(feedbackByUserRole);
  } catch (error) {
    console.error('Error fetching feedback by user role:', error);
    throw error;
  }
};

/**
 * Haalt de feedback op per ervaringsniveau
 * @param {Object} filters - Filters voor de query (dateRange, userRoles)
 * @returns {Promise<Array>} - Feedback per ervaringsniveau
 */
// Originele functie zonder caching
const _getFeedbackByExperienceLevel = async (filters = {}) => {
  try {
    const { dateRange, userRoles } = filters;
    
    let query = supabase
      .from('help_feedback')
      .select('experience_level, feedback_value, count')
      .group('experience_level, feedback_value');
    
    // Voeg filters toe
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).toISOString();
      const endDate = new Date(dateRange.end).toISOString();
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    if (userRoles && userRoles.length > 0) {
      query = query.in('user_role', userRoles);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transformeer data naar een bruikbaar formaat
    const feedbackByExperienceLevel = {};
    
    data.forEach(item => {
      if (!feedbackByExperienceLevel[item.experience_level]) {
        feedbackByExperienceLevel[item.experience_level] = {
          level: item.experience_level,
          positive: 0,
          negative: 0,
          total: 0
        };
      }
      
      if (item.feedback_value) {
        feedbackByExperienceLevel[item.experience_level].positive += item.count;
      } else {
        feedbackByExperienceLevel[item.experience_level].negative += item.count;
      }
      
      feedbackByExperienceLevel[item.experience_level].total += item.count;
    });
    
    // Bereken de positieve feedback ratio
    Object.values(feedbackByExperienceLevel).forEach(item => {
      item.positiveRatio = item.total > 0 ? (item.positive / item.total) * 100 : 0;
    });
    
    return Object.values(feedbackByExperienceLevel);
  } catch (error) {
    console.error('Error fetching feedback by experience level:', error);
    throw error;
  }
};

/**
 * Haalt de trends in help interacties op over tijd
 * @param {Object} filters - Filters voor de query (dateRange, userRoles, experienceLevels)
 * @param {string} interval - Interval voor de trends (day, week, month)
 * @returns {Promise<Array>} - Trends in help interacties
 */
// Originele functie zonder caching
const _getHelpInteractionsTrends = async (filters = {}, interval = 'day') => {
  try {
    const { dateRange, userRoles, experienceLevels } = filters;
    
    // Haal alle interacties op binnen het datumbereik
    let query = supabase
      .from('help_interactions')
      .select('created_at, action');
    
    // Voeg filters toe
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).toISOString();
      const endDate = new Date(dateRange.end).toISOString();
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    if (userRoles && userRoles.length > 0) {
      query = query.in('user_role', userRoles);
    }
    
    if (experienceLevels && experienceLevels.length > 0) {
      query = query.in('experience_level', experienceLevels);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Groepeer de data per interval
    const trendData = {};
    
    data.forEach(item => {
      let date;
      const createdAt = new Date(item.created_at);
      
      switch (interval) {
        case 'week':
          // Eerste dag van de week (zondag)
          date = new Date(createdAt);
          date.setDate(date.getDate() - date.getDay());
          date.setHours(0, 0, 0, 0);
          break;
        case 'month':
          // Eerste dag van de maand
          date = new Date(createdAt.getFullYear(), createdAt.getMonth(), 1);
          break;
        case 'day':
        default:
          // Begin van de dag
          date = new Date(createdAt);
          date.setHours(0, 0, 0, 0);
          break;
      }
      
      const dateString = date.toISOString();
      
      if (!trendData[dateString]) {
        trendData[dateString] = {
          date: dateString,
          count: 0
        };
      }
      
      trendData[dateString].count++;
    });
    
    // Sorteer de data op datum
    return Object.values(trendData).sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error fetching help interactions trends:', error);
    throw error;
  }
};

/**
 * Haalt de gebruikerservaring feedback op
 * @param {Object} filters - Filters voor de query (dateRange, userRoles, experienceLevels)
 * @returns {Promise<Array>} - Gebruikerservaring feedback
 */
// Originele functie zonder caching
const _getUserExperienceFeedback = async (filters = {}) => {
  try {
    const { dateRange, userRoles, experienceLevels } = filters;
    
    let query = supabase
      .from('user_experience_feedback')
      .select('*');
    
    // Voeg filters toe
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).toISOString();
      const endDate = new Date(dateRange.end).toISOString();
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    if (userRoles && userRoles.length > 0) {
      query = query.in('user_role', userRoles);
    }
    
    if (experienceLevels && experienceLevels.length > 0) {
      query = query.in('experience_level', experienceLevels);
    }
    
    // Sorteer op datum (nieuwste eerst)
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching user experience feedback:', error);
    throw error;
  }
};

/**
 * Haalt de gebruikerservaring feedback op per pagina
 * @param {Object} filters - Filters voor de query (dateRange, userRoles, experienceLevels)
 * @returns {Promise<Array>} - Gebruikerservaring feedback per pagina
 */
// Originele functie zonder caching
const _getUserExperienceFeedbackByPage = async (filters = {}) => {
  try {
    const { dateRange, userRoles, experienceLevels } = filters;
    
    let query = supabase
      .from('user_experience_feedback')
      .select('page_context, rating')
      .order('created_at', { ascending: false });
    
    // Voeg filters toe
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).toISOString();
      const endDate = new Date(dateRange.end).toISOString();
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    if (userRoles && userRoles.length > 0) {
      query = query.in('user_role', userRoles);
    }
    
    if (experienceLevels && experienceLevels.length > 0) {
      query = query.in('experience_level', experienceLevels);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Groepeer de data per pagina
    const feedbackByPage = {};
    
    data.forEach(item => {
      if (!feedbackByPage[item.page_context]) {
        feedbackByPage[item.page_context] = {
          page: item.page_context,
          ratings: [],
          averageRating: 0,
          count: 0
        };
      }
      
      feedbackByPage[item.page_context].ratings.push(item.rating);
      feedbackByPage[item.page_context].count++;
    });
    
    // Bereken de gemiddelde rating per pagina
    Object.values(feedbackByPage).forEach(item => {
      const sum = item.ratings.reduce((acc, rating) => acc + rating, 0);
      item.averageRating = item.count > 0 ? sum / item.count : 0;
    });
    
    return Object.values(feedbackByPage);
  } catch (error) {
    console.error('Error fetching user experience feedback by page:', error);
    throw error;
  }
};

// Helper functie voor conditionele filters
supabase.from('help_feedback').select().conditionalFilter = function(field, value) {
  if (!value) return this;
  
  if (Array.isArray(value) && value.length > 0) {
    return this.in(field, value);
  } else if (typeof value === 'object' && value.start && value.end) {
    const startDate = new Date(value.start).toISOString();
    const endDate = new Date(value.end).toISOString();
    return this.gte(field, startDate).lte(field, endDate);
  }
  
  return this;
};

// Helper functie voor het genereren van cache keys
const generateMetricsCacheKey = (functionName, filters = {}) => {
  return `${CACHE_PREFIX}:${generateCacheKey(functionName, filters)}`;
};

// Gecachte versies van de functies met verbeterde caching opties
export const getHelpMetricsSummary = withCache(_getHelpMetricsSummary, 'getHelpMetricsSummary', {
  ttlSeconds: 300, // 5 minuten
  priority: 3, // Hoge prioriteit
  compress: true // Comprimeer data
});

export const getHelpInteractionsByType = withCache(_getHelpInteractionsByType, 'getHelpInteractionsByType', {
  ttlSeconds: 300, // 5 minuten
  priority: 2, // Medium prioriteit
  compress: true
});

export const getHelpInteractionsByPage = withCache(_getHelpInteractionsByPage, 'getHelpInteractionsByPage', {
  ttlSeconds: 300, // 5 minuten
  priority: 2, // Medium prioriteit
  compress: true
});

export const getFeedbackByHelpItem = withCache(_getFeedbackByHelpItem, 'getFeedbackByHelpItem', {
  ttlSeconds: 300, // 5 minuten
  priority: 2, // Medium prioriteit
  compress: true
});

export const getFeedbackByUserRole = withCache(_getFeedbackByUserRole, 'getFeedbackByUserRole', {
  ttlSeconds: 300, // 5 minuten
  priority: 2, // Medium prioriteit
  compress: true
});

export const getFeedbackByExperienceLevel = withCache(_getFeedbackByExperienceLevel, 'getFeedbackByExperienceLevel', {
  ttlSeconds: 300, // 5 minuten
  priority: 2, // Medium prioriteit
  compress: true
});

export const getHelpInteractionsTrends = withCache(_getHelpInteractionsTrends, 'getHelpInteractionsTrends', {
  ttlSeconds: 120, // 2 minuten (korter voor real-time data)
  priority: 3, // Hoge prioriteit
  compress: true
});

export const getUserExperienceFeedback = withCache(_getUserExperienceFeedback, 'getUserExperienceFeedback', {
  ttlSeconds: 300, // 5 minuten
  priority: 2, // Medium prioriteit
  compress: true
});

export const getUserExperienceFeedbackByPage = withCache(_getUserExperienceFeedbackByPage, 'getUserExperienceFeedbackByPage', {
  ttlSeconds: 300, // 5 minuten
  priority: 2, // Medium prioriteit
  compress: true
});

/**
 * Verwijdert alle gecachte metrieken
 * Nuttig na het toevoegen van nieuwe data of bij het wijzigen van filters
 */
export const clearMetricsCache = () => {
  // Gebruik clearCacheByPrefix om alleen de help metrics cache te wissen
  clearCacheByPrefix(CACHE_PREFIX);
};

/**
 * Haalt cache statistieken op
 * @returns {Object} - Cache statistieken
 */
export const getCacheStats = () => {
  const { getCacheStats: getStats } = require('../../utils/cacheUtils');
  return getStats();
};

/**
 * Genereert hiërarchische data voor de DrillDownChart component
 * @param {string} dataType - Het type data om te genereren ('interactions', 'feedback', 'userExperience')
 * @param {Object} filters - Filters voor de query (dateRange, userRoles, experienceLevels)
 * @returns {Promise<Array>} - Hiërarchische data voor de DrillDownChart
 */
const _getHierarchicalData = async (dataType, filters = {}) => {
  try {
    let baseData = [];
    
    // Haal de basis data op afhankelijk van het type
    switch (dataType) {
      case 'interactions':
        // Haal interacties op gegroepeerd per type, pagina en actie
        const interactionsByType = await _getHelpInteractionsByType(filters);
        const interactionsByPage = await _getHelpInteractionsByPage(filters);
        
        // Bouw hiërarchische structuur
        baseData = interactionsByType.map(typeItem => ({
          name: typeItem.type,
          value: typeItem.count,
          children: interactionsByPage
            .filter(pageItem => pageItem.interactions.some(i => i.type === typeItem.type))
            .map(pageItem => ({
              name: pageItem.page,
              value: pageItem.interactions.filter(i => i.type === typeItem.type).length,
              children: [
                { name: 'Klikken', value: pageItem.interactions.filter(i => i.type === typeItem.type && i.action === 'click').length },
                { name: 'Weergaven', value: pageItem.interactions.filter(i => i.type === typeItem.type && i.action === 'view').length },
                { name: 'Zoekopdrachten', value: pageItem.interactions.filter(i => i.type === typeItem.type && i.action === 'search').length }
              ]
            }))
        }));
        break;
      
      case 'feedback':
        // Haal feedback op gegroepeerd per help item, gebruikersrol en ervaringsniveau
        const feedbackByHelpItem = await _getFeedbackByHelpItem(filters);
        const feedbackByUserRole = await _getFeedbackByUserRole(filters);
        
        // Bouw hiërarchische structuur
        baseData = feedbackByHelpItem.map(item => ({
          name: item.helpItemTitle || 'Onbekend item',
          value: item.totalFeedback,
          children: feedbackByUserRole
            .filter(roleItem => roleItem.feedbackItems.some(fi => fi.helpItemId === item.helpItemId))
            .map(roleItem => ({
              name: roleItem.userRole,
              value: roleItem.feedbackItems.filter(fi => fi.helpItemId === item.helpItemId).length,
              children: [
                { 
                  name: 'Positief', 
                  value: roleItem.feedbackItems.filter(fi => fi.helpItemId === item.helpItemId && fi.feedbackValue).length 
                },
                { 
                  name: 'Negatief', 
                  value: roleItem.feedbackItems.filter(fi => fi.helpItemId === item.helpItemId && !fi.feedbackValue).length 
                }
              ]
            }))
        }));
        break;
      
      case 'userExperience':
        // Haal gebruikerservaring feedback op gegroepeerd per pagina, gebruikersrol en ervaringsniveau
        const userExperienceFeedbackByPage = await _getUserExperienceFeedbackByPage(filters);
        
        // Bouw hiërarchische structuur
        baseData = userExperienceFeedbackByPage.map(item => ({
          name: item.page || 'Onbekende pagina',
          value: item.count,
          children: [
            { name: 'Zeer tevreden (5)', value: item.ratings.filter(r => r === 5).length },
            { name: 'Tevreden (4)', value: item.ratings.filter(r => r === 4).length },
            { name: 'Neutraal (3)', value: item.ratings.filter(r => r === 3).length },
            { name: 'Ontevreden (2)', value: item.ratings.filter(r => r === 2).length },
            { name: 'Zeer ontevreden (1)', value: item.ratings.filter(r => r === 1).length }
          ]
        }));
        break;
      
      default:
        throw new Error(`Onbekend dataType: ${dataType}`);
    }
    
    return baseData;
  } catch (error) {
    console.error(`Error generating hierarchical data for ${dataType}:`, error);
    throw error;
  }
};

// Gecachte versie van de functie
export const getHierarchicalData = withCache(_getHierarchicalData, 'getHierarchicalData', {
  ttlSeconds: 300, // 5 minuten
  priority: 3, // Hoge prioriteit
  compress: true // Comprimeer data
});

export default {
  getHelpMetricsSummary,
  getHelpInteractionsByType,
  getHelpInteractionsByPage,
  getFeedbackByHelpItem,
  getFeedbackByUserRole,
  getFeedbackByExperienceLevel,
  getHelpInteractionsTrends,
  getUserExperienceFeedback,
  getUserExperienceFeedbackByPage,
  getHierarchicalData,
  clearMetricsCache,
  getCacheStats
};
