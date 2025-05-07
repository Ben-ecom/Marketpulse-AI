/**
 * DashboardPreferencesService.js
 * 
 * Service voor het beheren van gebruikersvoorkeuren voor het Help Metrics Dashboard.
 * Slaat voorkeuren op in Supabase en lokaal in localStorage voor offline toegang.
 */

import { supabase } from '../../utils/supabaseClient';
import { withCache, getCache, setCache } from '../../utils/cacheUtils';

// Cache key prefix voor dashboard voorkeuren
const CACHE_PREFIX = 'dashboard_preferences';
const LOCAL_STORAGE_KEY = 'help_dashboard_preferences';

/**
 * Haalt de dashboard voorkeuren op voor een gebruiker
 * @param {string} userId - De ID van de gebruiker
 * @returns {Promise<Object>} - De dashboard voorkeuren
 */
const _getUserPreferences = async (userId) => {
  try {
    // Controleer eerst de cache
    const cacheKey = `${CACHE_PREFIX}:${userId}`;
    const cachedPrefs = getCache(cacheKey);
    
    if (cachedPrefs) {
      return cachedPrefs;
    }
    
    // Haal voorkeuren op uit de database
    const { data, error } = await supabase
      .from('dashboard_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }
    
    // Als er geen voorkeuren zijn, maak een standaard object
    const preferences = data || {
      user_id: userId,
      visible_widgets: [
        'summary',
        'interactionsByType',
        'interactionsByPage',
        'feedbackByHelpItem',
        'feedbackByUserRole',
        'feedbackByExperienceLevel',
        'interactionsTrend',
        'userExperienceFeedback',
        'advancedAnalytics'
      ],
      widget_order: [
        'summary',
        'interactionsByType',
        'interactionsByPage',
        'feedbackByHelpItem',
        'feedbackByUserRole',
        'feedbackByExperienceLevel',
        'interactionsTrend',
        'userExperienceFeedback',
        'advancedAnalytics'
      ],
      saved_filters: [],
      default_filter: null,
      layout: 'default', // 'default', 'compact', 'expanded'
      theme: 'system', // 'light', 'dark', 'system'
      realtime_enabled: false,
      last_updated: new Date().toISOString()
    };
    
    // Sla op in cache
    setCache(cacheKey, preferences, { ttlSeconds: 300 });
    
    // Sla ook op in localStorage voor offline toegang
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
    
    return preferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    
    // Probeer uit localStorage te halen als database niet beschikbaar is
    const localPrefs = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localPrefs) {
      return JSON.parse(localPrefs);
    }
    
    // Als alles faalt, retourneer standaard voorkeuren
    return {
      user_id: userId,
      visible_widgets: [
        'summary',
        'interactionsByType',
        'interactionsByPage',
        'feedbackByHelpItem',
        'feedbackByUserRole',
        'feedbackByExperienceLevel',
        'interactionsTrend',
        'userExperienceFeedback',
        'advancedAnalytics'
      ],
      widget_order: [
        'summary',
        'interactionsByType',
        'interactionsByPage',
        'feedbackByHelpItem',
        'feedbackByUserRole',
        'feedbackByExperienceLevel',
        'interactionsTrend',
        'userExperienceFeedback',
        'advancedAnalytics'
      ],
      saved_filters: [],
      default_filter: null,
      layout: 'default',
      theme: 'system',
      realtime_enabled: false,
      last_updated: new Date().toISOString()
    };
  }
};

/**
 * Slaat dashboard voorkeuren op voor een gebruiker
 * @param {string} userId - De ID van de gebruiker
 * @param {Object} preferences - De dashboard voorkeuren om op te slaan
 * @returns {Promise<Object>} - De opgeslagen dashboard voorkeuren
 */
const saveUserPreferences = async (userId, preferences) => {
  try {
    // Voeg user_id en timestamp toe
    const prefsToSave = {
      ...preferences,
      user_id: userId,
      last_updated: new Date().toISOString()
    };
    
    // Sla op in de database via upsert
    const { data, error } = await supabase
      .from('dashboard_preferences')
      .upsert(prefsToSave)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Update cache
    const cacheKey = `${CACHE_PREFIX}:${userId}`;
    setCache(cacheKey, data, { ttlSeconds: 300 });
    
    // Update localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    
    // Sla toch op in localStorage als database niet beschikbaar is
    const fallbackPrefs = {
      ...preferences,
      user_id: userId,
      last_updated: new Date().toISOString()
    };
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallbackPrefs));
    
    return fallbackPrefs;
  }
};

/**
 * Slaat een filter configuratie op voor een gebruiker
 * @param {string} userId - De ID van de gebruiker
 * @param {Object} filter - De filter configuratie om op te slaan
 * @returns {Promise<Object>} - De bijgewerkte dashboard voorkeuren
 */
const saveFilterConfiguration = async (userId, filter) => {
  try {
    // Haal huidige voorkeuren op
    const preferences = await getUserPreferences(userId);
    
    // Controleer of er al een filter is met dezelfde naam
    const existingFilterIndex = preferences.saved_filters.findIndex(f => f.name === filter.name);
    
    if (existingFilterIndex >= 0) {
      // Update bestaande filter
      preferences.saved_filters[existingFilterIndex] = filter;
    } else {
      // Voeg nieuwe filter toe
      preferences.saved_filters.push(filter);
    }
    
    // Sla bijgewerkte voorkeuren op
    return await saveUserPreferences(userId, preferences);
  } catch (error) {
    console.error('Error saving filter configuration:', error);
    throw error;
  }
};

/**
 * Verwijdert een opgeslagen filter configuratie
 * @param {string} userId - De ID van de gebruiker
 * @param {string} filterName - De naam van de filter om te verwijderen
 * @returns {Promise<Object>} - De bijgewerkte dashboard voorkeuren
 */
const deleteFilterConfiguration = async (userId, filterName) => {
  try {
    // Haal huidige voorkeuren op
    const preferences = await getUserPreferences(userId);
    
    // Verwijder de filter
    preferences.saved_filters = preferences.saved_filters.filter(f => f.name !== filterName);
    
    // Als de verwijderde filter de standaard filter was, reset de standaard filter
    if (preferences.default_filter === filterName) {
      preferences.default_filter = null;
    }
    
    // Sla bijgewerkte voorkeuren op
    return await saveUserPreferences(userId, preferences);
  } catch (error) {
    console.error('Error deleting filter configuration:', error);
    throw error;
  }
};

/**
 * Stelt een filter in als standaard filter
 * @param {string} userId - De ID van de gebruiker
 * @param {string} filterName - De naam van de filter om als standaard in te stellen
 * @returns {Promise<Object>} - De bijgewerkte dashboard voorkeuren
 */
const setDefaultFilter = async (userId, filterName) => {
  try {
    // Haal huidige voorkeuren op
    const preferences = await getUserPreferences(userId);
    
    // Controleer of de filter bestaat
    const filterExists = preferences.saved_filters.some(f => f.name === filterName);
    
    if (!filterExists && filterName !== null) {
      throw new Error(`Filter with name "${filterName}" does not exist`);
    }
    
    // Stel de standaard filter in
    preferences.default_filter = filterName;
    
    // Sla bijgewerkte voorkeuren op
    return await saveUserPreferences(userId, preferences);
  } catch (error) {
    console.error('Error setting default filter:', error);
    throw error;
  }
};

/**
 * Update de zichtbare widgets en hun volgorde
 * @param {string} userId - De ID van de gebruiker
 * @param {Array<string>} visibleWidgets - Array van widget IDs die zichtbaar moeten zijn
 * @param {Array<string>} widgetOrder - Array van widget IDs in de gewenste volgorde
 * @returns {Promise<Object>} - De bijgewerkte dashboard voorkeuren
 */
const updateWidgetConfiguration = async (userId, visibleWidgets, widgetOrder) => {
  try {
    // Haal huidige voorkeuren op
    const preferences = await getUserPreferences(userId);
    
    // Update widget configuratie
    preferences.visible_widgets = visibleWidgets;
    preferences.widget_order = widgetOrder;
    
    // Sla bijgewerkte voorkeuren op
    return await saveUserPreferences(userId, preferences);
  } catch (error) {
    console.error('Error updating widget configuration:', error);
    throw error;
  }
};

/**
 * Update de layout van het dashboard
 * @param {string} userId - De ID van de gebruiker
 * @param {string} layout - De layout ('default', 'compact', 'expanded')
 * @returns {Promise<Object>} - De bijgewerkte dashboard voorkeuren
 */
const updateLayout = async (userId, layout) => {
  try {
    // Haal huidige voorkeuren op
    const preferences = await getUserPreferences(userId);
    
    // Update layout
    preferences.layout = layout;
    
    // Sla bijgewerkte voorkeuren op
    return await saveUserPreferences(userId, preferences);
  } catch (error) {
    console.error('Error updating layout:', error);
    throw error;
  }
};

/**
 * Update de theme van het dashboard
 * @param {string} userId - De ID van de gebruiker
 * @param {string} theme - De theme ('light', 'dark', 'system')
 * @returns {Promise<Object>} - De bijgewerkte dashboard voorkeuren
 */
const updateTheme = async (userId, theme) => {
  try {
    // Haal huidige voorkeuren op
    const preferences = await getUserPreferences(userId);
    
    // Update theme
    preferences.theme = theme;
    
    // Sla bijgewerkte voorkeuren op
    return await saveUserPreferences(userId, preferences);
  } catch (error) {
    console.error('Error updating theme:', error);
    throw error;
  }
};

/**
 * Update de realtime instelling van het dashboard
 * @param {string} userId - De ID van de gebruiker
 * @param {boolean} enabled - Of realtime updates ingeschakeld moeten zijn
 * @returns {Promise<Object>} - De bijgewerkte dashboard voorkeuren
 */
const updateRealtimeSetting = async (userId, enabled) => {
  try {
    // Haal huidige voorkeuren op
    const preferences = await getUserPreferences(userId);
    
    // Update realtime instelling
    preferences.realtime_enabled = enabled;
    
    // Sla bijgewerkte voorkeuren op
    return await saveUserPreferences(userId, preferences);
  } catch (error) {
    console.error('Error updating realtime setting:', error);
    throw error;
  }
};

/**
 * Reset alle dashboard voorkeuren naar de standaardwaarden
 * @param {string} userId - De ID van de gebruiker
 * @returns {Promise<Object>} - De standaard dashboard voorkeuren
 */
const resetToDefaults = async (userId) => {
  try {
    const defaultPreferences = {
      user_id: userId,
      visible_widgets: [
        'summary',
        'interactionsByType',
        'interactionsByPage',
        'feedbackByHelpItem',
        'feedbackByUserRole',
        'feedbackByExperienceLevel',
        'interactionsTrend',
        'userExperienceFeedback',
        'advancedAnalytics'
      ],
      widget_order: [
        'summary',
        'interactionsByType',
        'interactionsByPage',
        'feedbackByHelpItem',
        'feedbackByUserRole',
        'feedbackByExperienceLevel',
        'interactionsTrend',
        'userExperienceFeedback',
        'advancedAnalytics'
      ],
      saved_filters: [],
      default_filter: null,
      layout: 'default',
      theme: 'system',
      realtime_enabled: false,
      last_updated: new Date().toISOString()
    };
    
    // Sla standaard voorkeuren op
    return await saveUserPreferences(userId, defaultPreferences);
  } catch (error) {
    console.error('Error resetting preferences to defaults:', error);
    throw error;
  }
};

// Gecachte versie van getUserPreferences
const getUserPreferences = withCache(_getUserPreferences, 'getUserPreferences', {
  ttlSeconds: 300,
  priority: 3,
  compress: false // Geen compressie nodig voor kleine objecten
});

// Exporteer alle functies
export default {
  getUserPreferences,
  saveUserPreferences,
  saveFilterConfiguration,
  deleteFilterConfiguration,
  setDefaultFilter,
  updateWidgetConfiguration,
  updateLayout,
  updateTheme,
  updateRealtimeSetting,
  resetToDefaults
};
