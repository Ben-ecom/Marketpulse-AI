import { supabase } from '../../utils/supabaseClient';

/**
 * Haalt samenvattende statistieken op over feedback
 * @param {Object} filters - Filters voor de data (dateRange, pages, userRoles, experienceLevels, feedbackTypes)
 * @returns {Promise<Object>} - Samenvattende statistieken
 */
export const fetchFeedbackSummary = async (filters = {}) => {
  try {
    // Haal help feedback op
    let helpFeedbackQuery = supabase
      .from('help_feedback')
      .select('*');
    
    // Haal user experience feedback op
    let userExperienceQuery = supabase
      .from('user_experience_feedback')
      .select('*');
    
    // Pas filters toe
    if (filters.dateRange) {
      const { startDate, endDate } = getDateRangeFromFilter(filters.dateRange);
      helpFeedbackQuery = helpFeedbackQuery.gte('created_at', startDate).lte('created_at', endDate);
      userExperienceQuery = userExperienceQuery.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    if (filters.userRoles && filters.userRoles.length > 0) {
      helpFeedbackQuery = helpFeedbackQuery.in('user_role', filters.userRoles);
      userExperienceQuery = userExperienceQuery.in('user_role', filters.userRoles);
    }
    
    if (filters.experienceLevels && filters.experienceLevels.length > 0) {
      helpFeedbackQuery = helpFeedbackQuery.in('experience_level', filters.experienceLevels);
      userExperienceQuery = userExperienceQuery.in('experience_level', filters.experienceLevels);
    }
    
    if (filters.pages && filters.pages.length > 0) {
      // Voor help_feedback gebruiken we help_item_id om te filteren op pagina
      // Dit is een vereenvoudiging; in een echte implementatie zou je een mapping hebben
      helpFeedbackQuery = helpFeedbackQuery.in('help_item_id', filters.pages);
      userExperienceQuery = userExperienceQuery.in('page_context', filters.pages);
    }
    
    // Voer queries uit
    const [helpFeedbackResult, userExperienceResult] = await Promise.all([
      helpFeedbackQuery,
      userExperienceQuery
    ]);
    
    // Controleer op fouten
    if (helpFeedbackResult.error) throw helpFeedbackResult.error;
    if (userExperienceResult.error) throw userExperienceResult.error;
    
    // Verwerk data
    const helpFeedback = helpFeedbackResult.data || [];
    const userExperience = userExperienceResult.data || [];
    
    // Bereken statistieken
    const totalHelpFeedback = helpFeedback.length;
    const positiveHelpFeedback = helpFeedback.filter(item => item.feedback_value).length;
    const negativeHelpFeedback = totalHelpFeedback - positiveHelpFeedback;
    
    const totalUserExperience = userExperience.length;
    const averageRating = totalUserExperience > 0
      ? userExperience.reduce((sum, item) => sum + item.rating, 0) / totalUserExperience
      : 0;
    
    // Bereken feedback per help item type
    const feedbackByType = helpFeedback.reduce((acc, item) => {
      const type = item.help_item_type;
      if (!acc[type]) {
        acc[type] = { total: 0, positive: 0, negative: 0 };
      }
      acc[type].total += 1;
      if (item.feedback_value) {
        acc[type].positive += 1;
      } else {
        acc[type].negative += 1;
      }
      return acc;
    }, {});
    
    // Bereken feedback per pagina
    const userExperienceByPage = userExperience.reduce((acc, item) => {
      const page = item.page_context;
      if (!acc[page]) {
        acc[page] = { total: 0, ratings: [], average: 0 };
      }
      acc[page].total += 1;
      acc[page].ratings.push(item.rating);
      acc[page].average = acc[page].ratings.reduce((sum, rating) => sum + rating, 0) / acc[page].ratings.length;
      return acc;
    }, {});
    
    // Bereken feedback per gebruikersrol
    const feedbackByUserRole = helpFeedback.reduce((acc, item) => {
      const role = item.user_role;
      if (!acc[role]) {
        acc[role] = { total: 0, positive: 0, negative: 0 };
      }
      acc[role].total += 1;
      if (item.feedback_value) {
        acc[role].positive += 1;
      } else {
        acc[role].negative += 1;
      }
      return acc;
    }, {});
    
    // Bereken feedback per ervaringsniveau
    const feedbackByExperienceLevel = helpFeedback.reduce((acc, item) => {
      const level = item.experience_level;
      if (!acc[level]) {
        acc[level] = { total: 0, positive: 0, negative: 0 };
      }
      acc[level].total += 1;
      if (item.feedback_value) {
        acc[level].positive += 1;
      } else {
        acc[level].negative += 1;
      }
      return acc;
    }, {});
    
    // Bereken aspecten die het meest genoemd worden in user experience feedback
    const aspectFrequency = userExperience.reduce((acc, item) => {
      if (item.aspects && Array.isArray(item.aspects)) {
        item.aspects.forEach(aspect => {
          if (!acc[aspect]) {
            acc[aspect] = 0;
          }
          acc[aspect] += 1;
        });
      }
      return acc;
    }, {});
    
    // Return samenvattende statistieken
    return {
      helpFeedback: {
        total: totalHelpFeedback,
        positive: positiveHelpFeedback,
        negative: negativeHelpFeedback,
        positivePercentage: totalHelpFeedback > 0 ? (positiveHelpFeedback / totalHelpFeedback) * 100 : 0,
        negativePercentage: totalHelpFeedback > 0 ? (negativeHelpFeedback / totalHelpFeedback) * 100 : 0
      },
      userExperience: {
        total: totalUserExperience,
        averageRating
      },
      byType: feedbackByType,
      byPage: userExperienceByPage,
      byUserRole: feedbackByUserRole,
      byExperienceLevel: feedbackByExperienceLevel,
      aspectFrequency
    };
  } catch (error) {
    console.error('Error fetching feedback summary:', error);
    throw error;
  }
};

/**
 * Haalt trendgegevens op over tijd
 * @param {Object} filters - Filters voor de data
 * @returns {Promise<Object>} - Trendgegevens
 */
export const fetchFeedbackTrends = async (filters = {}) => {
  try {
    // Haal help feedback op
    let helpFeedbackQuery = supabase
      .from('help_feedback')
      .select('*');
    
    // Haal user experience feedback op
    let userExperienceQuery = supabase
      .from('user_experience_feedback')
      .select('*');
    
    // Pas filters toe
    if (filters.dateRange) {
      const { startDate, endDate } = getDateRangeFromFilter(filters.dateRange);
      helpFeedbackQuery = helpFeedbackQuery.gte('created_at', startDate).lte('created_at', endDate);
      userExperienceQuery = userExperienceQuery.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    // Voer queries uit
    const [helpFeedbackResult, userExperienceResult] = await Promise.all([
      helpFeedbackQuery,
      userExperienceQuery
    ]);
    
    // Controleer op fouten
    if (helpFeedbackResult.error) throw helpFeedbackResult.error;
    if (userExperienceResult.error) throw userExperienceResult.error;
    
    // Verwerk data
    const helpFeedback = helpFeedbackResult.data || [];
    const userExperience = userExperienceResult.data || [];
    
    // Groepeer feedback per dag
    const helpFeedbackByDay = groupByDay(helpFeedback);
    const userExperienceByDay = groupByDay(userExperience);
    
    // Bereken trends
    const helpFeedbackTrend = calculateHelpFeedbackTrend(helpFeedbackByDay);
    const userExperienceTrend = calculateUserExperienceTrend(userExperienceByDay);
    
    return {
      helpFeedback: helpFeedbackTrend,
      userExperience: userExperienceTrend
    };
  } catch (error) {
    console.error('Error fetching feedback trends:', error);
    throw error;
  }
};

/**
 * Haalt feedback op gegroepeerd per pagina
 * @param {Object} filters - Filters voor de data
 * @returns {Promise<Object>} - Feedback per pagina
 */
export const fetchFeedbackByPage = async (filters = {}) => {
  try {
    // Haal help feedback op
    let helpFeedbackQuery = supabase
      .from('help_feedback')
      .select('*');
    
    // Haal user experience feedback op
    let userExperienceQuery = supabase
      .from('user_experience_feedback')
      .select('*');
    
    // Pas filters toe
    if (filters.dateRange) {
      const { startDate, endDate } = getDateRangeFromFilter(filters.dateRange);
      helpFeedbackQuery = helpFeedbackQuery.gte('created_at', startDate).lte('created_at', endDate);
      userExperienceQuery = userExperienceQuery.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    // Voer queries uit
    const [helpFeedbackResult, userExperienceResult] = await Promise.all([
      helpFeedbackQuery,
      userExperienceQuery
    ]);
    
    // Controleer op fouten
    if (helpFeedbackResult.error) throw helpFeedbackResult.error;
    if (userExperienceResult.error) throw userExperienceResult.error;
    
    // Verwerk data
    const helpFeedback = helpFeedbackResult.data || [];
    const userExperience = userExperienceResult.data || [];
    
    // Map help_item_id naar pagina's (in een echte implementatie zou je een mapping hebben)
    // Dit is een vereenvoudiging
    const helpItemToPage = {
      'dashboard-overview': 'dashboard',
      'report-options': 'report',
      'sentiment-analysis': 'sentiment',
      'trends-chart': 'trends',
      'awareness-phases': 'awareness',
      'market-insights-overview': 'market-insights'
    };
    
    // Groepeer help feedback per pagina
    const helpFeedbackByPage = helpFeedback.reduce((acc, item) => {
      const page = helpItemToPage[item.help_item_id] || 'unknown';
      if (!acc[page]) {
        acc[page] = { total: 0, positive: 0, negative: 0 };
      }
      acc[page].total += 1;
      if (item.feedback_value) {
        acc[page].positive += 1;
      } else {
        acc[page].negative += 1;
      }
      return acc;
    }, {});
    
    // Groepeer user experience feedback per pagina
    const userExperienceByPage = userExperience.reduce((acc, item) => {
      const page = item.page_context;
      if (!acc[page]) {
        acc[page] = { total: 0, ratings: [], average: 0, aspects: {} };
      }
      acc[page].total += 1;
      acc[page].ratings.push(item.rating);
      
      // Tel aspecten
      if (item.aspects && Array.isArray(item.aspects)) {
        item.aspects.forEach(aspect => {
          if (!acc[page].aspects[aspect]) {
            acc[page].aspects[aspect] = 0;
          }
          acc[page].aspects[aspect] += 1;
        });
      }
      
      // Bereken gemiddelde rating
      acc[page].average = acc[page].ratings.reduce((sum, rating) => sum + rating, 0) / acc[page].ratings.length;
      
      return acc;
    }, {});
    
    return {
      helpFeedback: helpFeedbackByPage,
      userExperience: userExperienceByPage
    };
  } catch (error) {
    console.error('Error fetching feedback by page:', error);
    throw error;
  }
};

/**
 * Haalt feedback op gegroepeerd per gebruikerstype
 * @param {Object} filters - Filters voor de data
 * @returns {Promise<Object>} - Feedback per gebruikerstype
 */
export const fetchFeedbackByUser = async (filters = {}) => {
  try {
    // Haal help feedback op
    let helpFeedbackQuery = supabase
      .from('help_feedback')
      .select('*');
    
    // Haal user experience feedback op
    let userExperienceQuery = supabase
      .from('user_experience_feedback')
      .select('*');
    
    // Pas filters toe
    if (filters.dateRange) {
      const { startDate, endDate } = getDateRangeFromFilter(filters.dateRange);
      helpFeedbackQuery = helpFeedbackQuery.gte('created_at', startDate).lte('created_at', endDate);
      userExperienceQuery = userExperienceQuery.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    // Voer queries uit
    const [helpFeedbackResult, userExperienceResult] = await Promise.all([
      helpFeedbackQuery,
      userExperienceQuery
    ]);
    
    // Controleer op fouten
    if (helpFeedbackResult.error) throw helpFeedbackResult.error;
    if (userExperienceResult.error) throw userExperienceResult.error;
    
    // Verwerk data
    const helpFeedback = helpFeedbackResult.data || [];
    const userExperience = userExperienceResult.data || [];
    
    // Groepeer help feedback per gebruikersrol
    const helpFeedbackByRole = helpFeedback.reduce((acc, item) => {
      const role = item.user_role;
      if (!acc[role]) {
        acc[role] = { total: 0, positive: 0, negative: 0 };
      }
      acc[role].total += 1;
      if (item.feedback_value) {
        acc[role].positive += 1;
      } else {
        acc[role].negative += 1;
      }
      return acc;
    }, {});
    
    // Groepeer help feedback per ervaringsniveau
    const helpFeedbackByLevel = helpFeedback.reduce((acc, item) => {
      const level = item.experience_level;
      if (!acc[level]) {
        acc[level] = { total: 0, positive: 0, negative: 0 };
      }
      acc[level].total += 1;
      if (item.feedback_value) {
        acc[level].positive += 1;
      } else {
        acc[level].negative += 1;
      }
      return acc;
    }, {});
    
    // Groepeer user experience feedback per gebruikersrol
    const userExperienceByRole = userExperience.reduce((acc, item) => {
      const role = item.user_role;
      if (!acc[role]) {
        acc[role] = { total: 0, ratings: [], average: 0, aspects: {} };
      }
      acc[role].total += 1;
      acc[role].ratings.push(item.rating);
      
      // Tel aspecten
      if (item.aspects && Array.isArray(item.aspects)) {
        item.aspects.forEach(aspect => {
          if (!acc[role].aspects[aspect]) {
            acc[role].aspects[aspect] = 0;
          }
          acc[role].aspects[aspect] += 1;
        });
      }
      
      // Bereken gemiddelde rating
      acc[role].average = acc[role].ratings.reduce((sum, rating) => sum + rating, 0) / acc[role].ratings.length;
      
      return acc;
    }, {});
    
    // Groepeer user experience feedback per ervaringsniveau
    const userExperienceByLevel = userExperience.reduce((acc, item) => {
      const level = item.experience_level;
      if (!acc[level]) {
        acc[level] = { total: 0, ratings: [], average: 0, aspects: {} };
      }
      acc[level].total += 1;
      acc[level].ratings.push(item.rating);
      
      // Tel aspecten
      if (item.aspects && Array.isArray(item.aspects)) {
        item.aspects.forEach(aspect => {
          if (!acc[level].aspects[aspect]) {
            acc[level].aspects[aspect] = 0;
          }
          acc[level].aspects[aspect] += 1;
        });
      }
      
      // Bereken gemiddelde rating
      acc[level].average = acc[level].ratings.reduce((sum, rating) => sum + rating, 0) / acc[level].ratings.length;
      
      return acc;
    }, {});
    
    return {
      byRole: {
        helpFeedback: helpFeedbackByRole,
        userExperience: userExperienceByRole
      },
      byLevel: {
        helpFeedback: helpFeedbackByLevel,
        userExperience: userExperienceByLevel
      }
    };
  } catch (error) {
    console.error('Error fetching feedback by user:', error);
    throw error;
  }
};

/**
 * Haalt gedetailleerde feedback items op
 * @param {Object} filters - Filters voor de data
 * @param {Object} pagination - Paginatie opties (page, pageSize)
 * @returns {Promise<Object>} - Gedetailleerde feedback items
 */
export const fetchFeedbackDetails = async (filters = {}, pagination = { page: 1, pageSize: 10 }) => {
  try {
    // Bereken offset voor paginatie
    const { page, pageSize } = pagination;
    const offset = (page - 1) * pageSize;
    
    // Haal help feedback op
    let helpFeedbackQuery = supabase
      .from('help_feedback')
      .select('*');
    
    // Haal user experience feedback op
    let userExperienceQuery = supabase
      .from('user_experience_feedback')
      .select('*');
    
    // Pas filters toe
    if (filters.dateRange) {
      const { startDate, endDate } = getDateRangeFromFilter(filters.dateRange);
      helpFeedbackQuery = helpFeedbackQuery.gte('created_at', startDate).lte('created_at', endDate);
      userExperienceQuery = userExperienceQuery.gte('created_at', startDate).lte('created_at', endDate);
    }
    
    if (filters.userRoles && filters.userRoles.length > 0) {
      helpFeedbackQuery = helpFeedbackQuery.in('user_role', filters.userRoles);
      userExperienceQuery = userExperienceQuery.in('user_role', filters.userRoles);
    }
    
    if (filters.experienceLevels && filters.experienceLevels.length > 0) {
      helpFeedbackQuery = helpFeedbackQuery.in('experience_level', filters.experienceLevels);
      userExperienceQuery = userExperienceQuery.in('experience_level', filters.experienceLevels);
    }
    
    if (filters.pages && filters.pages.length > 0) {
      // Voor help_feedback gebruiken we help_item_id om te filteren op pagina
      // Dit is een vereenvoudiging; in een echte implementatie zou je een mapping hebben
      helpFeedbackQuery = helpFeedbackQuery.in('help_item_id', filters.pages);
      userExperienceQuery = userExperienceQuery.in('page_context', filters.pages);
    }
    
    if (filters.feedbackTypes && filters.feedbackTypes.length > 0) {
      if (filters.feedbackTypes.includes('positive') && !filters.feedbackTypes.includes('negative')) {
        helpFeedbackQuery = helpFeedbackQuery.eq('feedback_value', true);
      } else if (!filters.feedbackTypes.includes('positive') && filters.feedbackTypes.includes('negative')) {
        helpFeedbackQuery = helpFeedbackQuery.eq('feedback_value', false);
      }
    }
    
    // Pas paginatie toe
    helpFeedbackQuery = helpFeedbackQuery.range(offset, offset + pageSize - 1);
    userExperienceQuery = userExperienceQuery.range(offset, offset + pageSize - 1);
    
    // Sorteer op datum (nieuwste eerst)
    helpFeedbackQuery = helpFeedbackQuery.order('created_at', { ascending: false });
    userExperienceQuery = userExperienceQuery.order('created_at', { ascending: false });
    
    // Voer queries uit
    const [helpFeedbackResult, userExperienceResult, helpFeedbackCountResult, userExperienceCountResult] = await Promise.all([
      helpFeedbackQuery,
      userExperienceQuery,
      supabase.from('help_feedback').select('id', { count: 'exact' }),
      supabase.from('user_experience_feedback').select('id', { count: 'exact' })
    ]);
    
    // Controleer op fouten
    if (helpFeedbackResult.error) throw helpFeedbackResult.error;
    if (userExperienceResult.error) throw userExperienceResult.error;
    if (helpFeedbackCountResult.error) throw helpFeedbackCountResult.error;
    if (userExperienceCountResult.error) throw userExperienceCountResult.error;
    
    // Verwerk data
    const helpFeedback = helpFeedbackResult.data || [];
    const userExperience = userExperienceResult.data || [];
    
    return {
      helpFeedback: {
        items: helpFeedback,
        total: helpFeedbackCountResult.count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((helpFeedbackCountResult.count || 0) / pageSize)
      },
      userExperience: {
        items: userExperience,
        total: userExperienceCountResult.count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((userExperienceCountResult.count || 0) / pageSize)
      }
    };
  } catch (error) {
    console.error('Error fetching feedback details:', error);
    throw error;
  }
};

// Helper functies

/**
 * Zet een dateRange filter om in startDate en endDate
 * @param {string} dateRange - De date range filter ('today', 'last7days', 'last30days', 'last90days', 'lastYear')
 * @returns {Object} - Object met startDate en endDate
 */
const getDateRangeFromFilter = (dateRange) => {
  const now = new Date();
  const endDate = new Date(now).toISOString();
  let startDate;
  
  switch (dateRange) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      break;
    case 'last7days':
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
      break;
    case 'last30days':
      startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
      break;
    case 'last90days':
      startDate = new Date(now.setDate(now.getDate() - 90)).toISOString();
      break;
    case 'lastYear':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      break;
    default:
      // Standaard: laatste 30 dagen
      startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
  }
  
  return { startDate, endDate };
};

/**
 * Groepeert feedback per dag
 * @param {Array} feedback - Array met feedback items
 * @returns {Object} - Object met feedback gegroepeerd per dag
 */
const groupByDay = (feedback) => {
  return feedback.reduce((acc, item) => {
    const date = new Date(item.created_at);
    const day = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!acc[day]) {
      acc[day] = [];
    }
    
    acc[day].push(item);
    return acc;
  }, {});
};

/**
 * Berekent trend voor help feedback
 * @param {Object} feedbackByDay - Help feedback gegroepeerd per dag
 * @returns {Array} - Array met trend data
 */
const calculateHelpFeedbackTrend = (feedbackByDay) => {
  return Object.keys(feedbackByDay).sort().map(day => {
    const items = feedbackByDay[day];
    const total = items.length;
    const positive = items.filter(item => item.feedback_value).length;
    const negative = total - positive;
    
    return {
      date: day,
      total,
      positive,
      negative,
      positivePercentage: total > 0 ? (positive / total) * 100 : 0,
      negativePercentage: total > 0 ? (negative / total) * 100 : 0
    };
  });
};

/**
 * Berekent trend voor user experience feedback
 * @param {Object} feedbackByDay - User experience feedback gegroepeerd per dag
 * @returns {Array} - Array met trend data
 */
const calculateUserExperienceTrend = (feedbackByDay) => {
  return Object.keys(feedbackByDay).sort().map(day => {
    const items = feedbackByDay[day];
    const total = items.length;
    const ratings = items.map(item => item.rating);
    const averageRating = total > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / total
      : 0;
    
    return {
      date: day,
      total,
      averageRating
    };
  });
};