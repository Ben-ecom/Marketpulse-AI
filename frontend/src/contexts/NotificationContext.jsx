/**
 * NotificationContext.jsx
 * 
 * Context voor het beheren van notificaties in de applicatie.
 * Biedt functionaliteit voor het ophalen, markeren als gelezen en verwijderen van notificaties.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import NotificationService from '../services/help/NotificationService';

// Creëer de context
const NotificationContext = createContext();

/**
 * Hook om de NotificationContext te gebruiken
 * @returns {Object} NotificationContext
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications moet worden gebruikt binnen een NotificationProvider');
  }
  return context;
};

/**
 * NotificationProvider component
 * @component
 */
export const NotificationProvider = ({ children, checkInterval = 60000 }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSettings, setNotificationSettings] = useState({
    thresholds: [],
    notification_methods: {
      in_app: true,
      email: false
    },
    enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Laadt de notificaties voor de huidige gebruiker
   */
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await NotificationService.getNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
      setError(null);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Er is een fout opgetreden bij het laden van notificaties.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Laadt de notificatie instellingen voor de huidige gebruiker
   */
  const loadNotificationSettings = useCallback(async () => {
    if (!user) return;

    try {
      const settings = await NotificationService.getUserNotificationSettings(user.id);
      setNotificationSettings(settings);
    } catch (err) {
      console.error('Error loading notification settings:', err);
    }
  }, [user]);

  /**
   * Controleert op nieuwe notificaties door drempelwaarden te controleren
   */
  const checkForNotifications = useCallback(async () => {
    if (!user || !notificationSettings.enabled) return;

    try {
      await NotificationService.checkThresholds(user.id);
      // Laad de notificaties opnieuw om nieuwe notificaties weer te geven
      loadNotifications();
    } catch (err) {
      console.error('Error checking for notifications:', err);
    }
  }, [user, notificationSettings.enabled, loadNotifications]);

  /**
   * Markeert een notificatie als gelezen
   * @param {string} notificationId - ID van de notificatie
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await NotificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Er is een fout opgetreden bij het markeren van de notificatie als gelezen.');
    }
  }, []);

  /**
   * Markeert alle notificaties als gelezen
   */
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      await NotificationService.markAllNotificationsAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Er is een fout opgetreden bij het markeren van alle notificaties als gelezen.');
    }
  }, [user]);

  /**
   * Verwijdert een notificatie
   * @param {string} notificationId - ID van de notificatie
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Er is een fout opgetreden bij het verwijderen van de notificatie.');
    }
  }, [notifications]);

  /**
   * Verwijdert alle notificaties
   */
  const deleteAllNotifications = useCallback(async () => {
    if (!user) return;

    try {
      await NotificationService.deleteAllNotifications(user.id);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      setError('Er is een fout opgetreden bij het verwijderen van alle notificaties.');
    }
  }, [user]);

  /**
   * Voegt een drempelwaarde toe
   * @param {Object} threshold - De drempelwaarde om toe te voegen
   */
  const addThreshold = useCallback(async (threshold) => {
    if (!user) return;

    try {
      const updatedSettings = await NotificationService.addThreshold(user.id, threshold);
      setNotificationSettings(updatedSettings);
    } catch (err) {
      console.error('Error adding threshold:', err);
      setError('Er is een fout opgetreden bij het toevoegen van de drempelwaarde.');
    }
  }, [user]);

  /**
   * Werkt een drempelwaarde bij
   * @param {string} thresholdId - ID van de drempelwaarde
   * @param {Object} updatedThreshold - De bijgewerkte drempelwaarde
   */
  const updateThreshold = useCallback(async (thresholdId, updatedThreshold) => {
    if (!user) return;

    try {
      const updatedSettings = await NotificationService.updateThreshold(user.id, thresholdId, updatedThreshold);
      setNotificationSettings(updatedSettings);
    } catch (err) {
      console.error('Error updating threshold:', err);
      setError('Er is een fout opgetreden bij het bijwerken van de drempelwaarde.');
    }
  }, [user]);

  /**
   * Verwijdert een drempelwaarde
   * @param {string} thresholdId - ID van de drempelwaarde
   */
  const removeThreshold = useCallback(async (thresholdId) => {
    if (!user) return;

    try {
      const updatedSettings = await NotificationService.removeThreshold(user.id, thresholdId);
      setNotificationSettings(updatedSettings);
    } catch (err) {
      console.error('Error removing threshold:', err);
      setError('Er is een fout opgetreden bij het verwijderen van de drempelwaarde.');
    }
  }, [user]);

  /**
   * Werkt de notificatie methoden bij
   * @param {Object} methods - De bijgewerkte notificatie methoden
   */
  const updateNotificationMethods = useCallback(async (methods) => {
    if (!user) return;

    try {
      const updatedSettings = await NotificationService.updateNotificationMethods(user.id, methods);
      setNotificationSettings(updatedSettings);
    } catch (err) {
      console.error('Error updating notification methods:', err);
      setError('Er is een fout opgetreden bij het bijwerken van de notificatie methoden.');
    }
  }, [user]);

  /**
   * Schakelt notificaties in of uit
   * @param {boolean} enabled - Of notificaties ingeschakeld moeten zijn
   */
  const toggleNotificationsEnabled = useCallback(async (enabled) => {
    if (!user) return;

    try {
      const updatedSettings = await NotificationService.setNotificationsEnabled(user.id, enabled);
      setNotificationSettings(updatedSettings);
    } catch (err) {
      console.error('Error toggling notifications:', err);
      setError('Er is een fout opgetreden bij het in-/uitschakelen van notificaties.');
    }
  }, [user]);

  // Laad notificaties en instellingen wanneer de gebruiker verandert
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadNotificationSettings();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationSettings({
        thresholds: [],
        notification_methods: {
          in_app: true,
          email: false
        },
        enabled: true
      });
    }
  }, [user, loadNotifications, loadNotificationSettings]);

  // Controleer periodiek op nieuwe notificaties
  useEffect(() => {
    if (!user || !notificationSettings.enabled) return;

    // Controleer direct bij het laden
    checkForNotifications();

    // Stel een interval in voor periodieke controles
    const intervalId = setInterval(checkForNotifications, checkInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [user, checkForNotifications, notificationSettings.enabled, checkInterval]);

  // Context waarde
  const value = {
    notifications,
    unreadCount,
    notificationSettings,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    addThreshold,
    updateThreshold,
    removeThreshold,
    updateNotificationMethods,
    toggleNotificationsEnabled,
    refreshNotifications: loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  /**
   * Children componenten
   */
  children: PropTypes.node.isRequired,
  
  /**
   * Interval in milliseconden voor het controleren op nieuwe notificaties
   */
  checkInterval: PropTypes.number
};

export default NotificationContext;
