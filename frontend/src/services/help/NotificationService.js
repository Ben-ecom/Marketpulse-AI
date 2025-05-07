/**
 * NotificationService.js
 * 
 * Service voor het beheren van notificaties voor het Help Metrics Dashboard.
 * Biedt functionaliteit voor het instellen van drempelwaarden voor metrics en het versturen van notificaties.
 */

import { supabase } from '../../utils/supabaseClient';
import { withCache, getCache, setCache } from '../../utils/cacheUtils';
import HelpMetricsService from './HelpMetricsService';

// Cache key prefix voor notificatie instellingen
const CACHE_PREFIX = 'notification_settings';
const LOCAL_STORAGE_KEY = 'help_dashboard_notifications';

/**
 * Haalt de notificatie instellingen op voor een gebruiker
 * @param {string} userId - De ID van de gebruiker
 * @returns {Promise<Object>} - De notificatie instellingen
 */
const _getUserNotificationSettings = async (userId) => {
  try {
    // Controleer eerst de cache
    const cacheKey = `${CACHE_PREFIX}:${userId}`;
    const cachedSettings = getCache(cacheKey);
    
    if (cachedSettings) {
      return cachedSettings;
    }
    
    // Haal instellingen op uit de database
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }
    
    // Als er geen instellingen zijn, maak een standaard object
    const settings = data || {
      user_id: userId,
      thresholds: [],
      notification_methods: {
        in_app: true,
        email: false
      },
      enabled: true,
      last_updated: new Date().toISOString()
    };
    
    // Sla op in cache
    setCache(cacheKey, settings, { ttlSeconds: 300 });
    
    // Sla ook op in localStorage voor offline toegang
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    
    return settings;
  } catch (error) {
    console.error('Error fetching user notification settings:', error);
    
    // Probeer uit localStorage te halen als database niet beschikbaar is
    const localSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localSettings) {
      return JSON.parse(localSettings);
    }
    
    // Als alles faalt, retourneer standaard instellingen
    return {
      user_id: userId,
      thresholds: [],
      notification_methods: {
        in_app: true,
        email: false
      },
      enabled: true,
      last_updated: new Date().toISOString()
    };
  }
};

/**
 * Slaat notificatie instellingen op voor een gebruiker
 * @param {string} userId - De ID van de gebruiker
 * @param {Object} settings - De notificatie instellingen om op te slaan
 * @returns {Promise<Object>} - De opgeslagen notificatie instellingen
 */
const saveUserNotificationSettings = async (userId, settings) => {
  try {
    // Voeg user_id en timestamp toe
    const settingsToSave = {
      ...settings,
      user_id: userId,
      last_updated: new Date().toISOString()
    };
    
    // Sla op in de database via upsert
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert(settingsToSave)
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
    console.error('Error saving user notification settings:', error);
    
    // Sla toch op in localStorage als database niet beschikbaar is
    const fallbackSettings = {
      ...settings,
      user_id: userId,
      last_updated: new Date().toISOString()
    };
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallbackSettings));
    
    return fallbackSettings;
  }
};

/**
 * Voegt een drempelwaarde toe aan de notificatie instellingen
 * @param {string} userId - De ID van de gebruiker
 * @param {Object} threshold - De drempelwaarde om toe te voegen
 * @returns {Promise<Object>} - De bijgewerkte notificatie instellingen
 */
const addThreshold = async (userId, threshold) => {
  try {
    // Haal huidige instellingen op
    const settings = await getUserNotificationSettings(userId);
    
    // Genereer een unieke ID voor de drempelwaarde
    threshold.id = crypto.randomUUID();
    threshold.created_at = new Date().toISOString();
    
    // Voeg drempelwaarde toe
    settings.thresholds.push(threshold);
    
    // Sla bijgewerkte instellingen op
    return await saveUserNotificationSettings(userId, settings);
  } catch (error) {
    console.error('Error adding threshold:', error);
    throw error;
  }
};

/**
 * Verwijdert een drempelwaarde uit de notificatie instellingen
 * @param {string} userId - De ID van de gebruiker
 * @param {string} thresholdId - De ID van de drempelwaarde om te verwijderen
 * @returns {Promise<Object>} - De bijgewerkte notificatie instellingen
 */
const removeThreshold = async (userId, thresholdId) => {
  try {
    // Haal huidige instellingen op
    const settings = await getUserNotificationSettings(userId);
    
    // Verwijder drempelwaarde
    settings.thresholds = settings.thresholds.filter(t => t.id !== thresholdId);
    
    // Sla bijgewerkte instellingen op
    return await saveUserNotificationSettings(userId, settings);
  } catch (error) {
    console.error('Error removing threshold:', error);
    throw error;
  }
};

/**
 * Update een drempelwaarde in de notificatie instellingen
 * @param {string} userId - De ID van de gebruiker
 * @param {string} thresholdId - De ID van de drempelwaarde om te updaten
 * @param {Object} updatedThreshold - De bijgewerkte drempelwaarde
 * @returns {Promise<Object>} - De bijgewerkte notificatie instellingen
 */
const updateThreshold = async (userId, thresholdId, updatedThreshold) => {
  try {
    // Haal huidige instellingen op
    const settings = await getUserNotificationSettings(userId);
    
    // Update drempelwaarde
    const index = settings.thresholds.findIndex(t => t.id === thresholdId);
    if (index >= 0) {
      settings.thresholds[index] = {
        ...settings.thresholds[index],
        ...updatedThreshold,
        id: thresholdId,
        updated_at: new Date().toISOString()
      };
    } else {
      throw new Error(`Threshold with ID ${thresholdId} not found`);
    }
    
    // Sla bijgewerkte instellingen op
    return await saveUserNotificationSettings(userId, settings);
  } catch (error) {
    console.error('Error updating threshold:', error);
    throw error;
  }
};

/**
 * Update de notificatie methoden
 * @param {string} userId - De ID van de gebruiker
 * @param {Object} methods - De notificatie methoden
 * @returns {Promise<Object>} - De bijgewerkte notificatie instellingen
 */
const updateNotificationMethods = async (userId, methods) => {
  try {
    // Haal huidige instellingen op
    const settings = await getUserNotificationSettings(userId);
    
    // Update notificatie methoden
    settings.notification_methods = {
      ...settings.notification_methods,
      ...methods
    };
    
    // Sla bijgewerkte instellingen op
    return await saveUserNotificationSettings(userId, settings);
  } catch (error) {
    console.error('Error updating notification methods:', error);
    throw error;
  }
};

/**
 * Schakelt notificaties in of uit
 * @param {string} userId - De ID van de gebruiker
 * @param {boolean} enabled - Of notificaties ingeschakeld moeten zijn
 * @returns {Promise<Object>} - De bijgewerkte notificatie instellingen
 */
const setNotificationsEnabled = async (userId, enabled) => {
  try {
    // Haal huidige instellingen op
    const settings = await getUserNotificationSettings(userId);
    
    // Update enabled status
    settings.enabled = enabled;
    
    // Sla bijgewerkte instellingen op
    return await saveUserNotificationSettings(userId, settings);
  } catch (error) {
    console.error('Error setting notifications enabled:', error);
    throw error;
  }
};

/**
 * Controleert of er drempelwaarden zijn overschreden en stuurt notificaties
 * @param {string} userId - De ID van de gebruiker
 * @returns {Promise<Array>} - Array van gegenereerde notificaties
 */
const checkThresholds = async (userId) => {
  try {
    // Haal notificatie instellingen op
    const settings = await getUserNotificationSettings(userId);
    
    // Als notificaties zijn uitgeschakeld, doe niets
    if (!settings.enabled || settings.thresholds.length === 0) {
      return [];
    }
    
    // Haal huidige metrics op
    const metrics = await HelpMetricsService.getHelpMetricsSummary();
    
    // Controleer elke drempelwaarde
    const notifications = [];
    
    for (const threshold of settings.thresholds) {
      let currentValue;
      
      // Haal de huidige waarde op voor de metric
      switch (threshold.metric) {
        case 'totalInteractions':
          currentValue = metrics.totalInteractions;
          break;
        case 'totalFeedback':
          currentValue = metrics.totalFeedback;
          break;
        case 'feedbackSubmissionRate':
          currentValue = metrics.feedbackSubmissionRate;
          break;
        case 'positiveFeedbackRate':
          currentValue = metrics.positiveFeedbackRate;
          break;
        case 'averageUserSatisfaction':
          currentValue = metrics.averageUserSatisfaction;
          break;
        default:
          console.warn(`Unknown metric: ${threshold.metric}`);
          continue;
      }
      
      // Controleer of de drempelwaarde is overschreden
      let isTriggered = false;
      
      switch (threshold.operator) {
        case 'gt':
          isTriggered = currentValue > threshold.value;
          break;
        case 'lt':
          isTriggered = currentValue < threshold.value;
          break;
        case 'eq':
          isTriggered = currentValue === threshold.value;
          break;
        case 'gte':
          isTriggered = currentValue >= threshold.value;
          break;
        case 'lte':
          isTriggered = currentValue <= threshold.value;
          break;
        default:
          console.warn(`Unknown operator: ${threshold.operator}`);
          continue;
      }
      
      // Als de drempelwaarde is overschreden, maak een notificatie aan
      if (isTriggered) {
        const notification = {
          id: crypto.randomUUID(),
          userId,
          thresholdId: threshold.id,
          metric: threshold.metric,
          operator: threshold.operator,
          value: threshold.value,
          currentValue,
          message: threshold.message || `${threshold.metric} is ${getOperatorText(threshold.operator)} ${threshold.value}`,
          created_at: new Date().toISOString(),
          read: false
        };
        
        notifications.push(notification);
        
        // Sla de notificatie op in de database
        await saveNotification(notification);
      }
    }
    
    return notifications;
  } catch (error) {
    console.error('Error checking thresholds:', error);
    return [];
  }
};

/**
 * Slaat een notificatie op in de database
 * @param {Object} notification - De notificatie om op te slaan
 * @returns {Promise<Object>} - De opgeslagen notificatie
 */
const saveNotification = async (notification) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving notification:', error);
    throw error;
  }
};

/**
 * Haalt notificaties op voor een gebruiker
 * @param {string} userId - De ID van de gebruiker
 * @param {boolean} onlyUnread - Alleen ongelezen notificaties ophalen
 * @returns {Promise<Array>} - Array van notificaties
 */
const getNotifications = async (userId, onlyUnread = false) => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('userId', userId)
      .order('created_at', { ascending: false });
    
    if (onlyUnread) {
      query = query.eq('read', false);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

/**
 * Markeert een notificatie als gelezen
 * @param {string} notificationId - De ID van de notificatie
 * @returns {Promise<Object>} - De bijgewerkte notificatie
 */
const markNotificationAsRead = async (notificationId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Markeert alle notificaties als gelezen voor een gebruiker
 * @param {string} userId - De ID van de gebruiker
 * @returns {Promise<Array>} - De bijgewerkte notificaties
 */
const markAllNotificationsAsRead = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('userId', userId)
      .eq('read', false)
      .select();
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Verwijdert een notificatie
 * @param {string} notificationId - De ID van de notificatie
 * @returns {Promise<void>}
 */
const deleteNotification = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Verwijdert alle notificaties voor een gebruiker
 * @param {string} userId - De ID van de gebruiker
 * @returns {Promise<void>}
 */
const deleteAllNotifications = async (userId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('userId', userId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};

/**
 * Helper functie om operator tekst te genereren
 * @param {string} operator - De operator
 * @returns {string} - De operator tekst
 */
const getOperatorText = (operator) => {
  switch (operator) {
    case 'gt':
      return 'groter dan';
    case 'lt':
      return 'kleiner dan';
    case 'eq':
      return 'gelijk aan';
    case 'gte':
      return 'groter dan of gelijk aan';
    case 'lte':
      return 'kleiner dan of gelijk aan';
    default:
      return operator;
  }
};

// Gecachte versie van getUserNotificationSettings
const getUserNotificationSettings = withCache(_getUserNotificationSettings, 'getUserNotificationSettings', {
  ttlSeconds: 300,
  priority: 3,
  compress: false // Geen compressie nodig voor kleine objecten
});

// Exporteer alle functies
export default {
  getUserNotificationSettings,
  saveUserNotificationSettings,
  addThreshold,
  removeThreshold,
  updateThreshold,
  updateNotificationMethods,
  setNotificationsEnabled,
  checkThresholds,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
};
