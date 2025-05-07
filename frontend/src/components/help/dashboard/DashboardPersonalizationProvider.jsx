/**
 * DashboardPersonalizationProvider.jsx
 * 
 * Provider component voor dashboard personalisatie.
 * Biedt context voor het beheren van gebruikersvoorkeuren voor het dashboard.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import DashboardPreferencesService from '../../../services/help/DashboardPreferencesService';
import { useAuth } from '../../../contexts/AuthContext'; // Aanname: er is een AuthContext

// Context voor dashboard personalisatie
const DashboardPersonalizationContext = createContext({
  preferences: null,
  isLoading: true,
  error: null,
  saveFilterConfiguration: async () => {},
  deleteFilterConfiguration: async () => {},
  setDefaultFilter: async () => {},
  updateWidgetConfiguration: async () => {},
  updateLayout: async () => {},
  updateTheme: async () => {},
  updateRealtimeSetting: async () => {},
  resetToDefaults: async () => {}
});

/**
 * Provider component voor dashboard personalisatie
 * @component
 */
export const DashboardPersonalizationProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Haal de huidige gebruiker op uit de AuthContext
  const { user } = useAuth();
  
  // Laad voorkeuren bij initiële render en wanneer de gebruiker verandert
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const userPreferences = await DashboardPreferencesService.getUserPreferences(user.id);
        setPreferences(userPreferences);
      } catch (err) {
        console.error('Error loading dashboard preferences:', err);
        setError('Er is een fout opgetreden bij het laden van je dashboard voorkeuren.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, [user]);
  
  /**
   * Slaat een filter configuratie op
   * @param {Object} filter - De filter configuratie
   */
  const saveFilterConfiguration = async (filter) => {
    if (!user) return;
    
    try {
      const updatedPreferences = await DashboardPreferencesService.saveFilterConfiguration(user.id, filter);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      console.error('Error saving filter configuration:', err);
      setError('Er is een fout opgetreden bij het opslaan van je filter configuratie.');
      throw err;
    }
  };
  
  /**
   * Verwijdert een opgeslagen filter configuratie
   * @param {string} filterName - De naam van de filter
   */
  const deleteFilterConfiguration = async (filterName) => {
    if (!user) return;
    
    try {
      const updatedPreferences = await DashboardPreferencesService.deleteFilterConfiguration(user.id, filterName);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      console.error('Error deleting filter configuration:', err);
      setError('Er is een fout opgetreden bij het verwijderen van je filter configuratie.');
      throw err;
    }
  };
  
  /**
   * Stelt een filter in als standaard filter
   * @param {string} filterName - De naam van de filter
   */
  const setDefaultFilter = async (filterName) => {
    if (!user) return;
    
    try {
      const updatedPreferences = await DashboardPreferencesService.setDefaultFilter(user.id, filterName);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      console.error('Error setting default filter:', err);
      setError('Er is een fout opgetreden bij het instellen van je standaard filter.');
      throw err;
    }
  };
  
  /**
   * Update de zichtbare widgets en hun volgorde
   * @param {Array<string>} visibleWidgets - Array van widget IDs die zichtbaar moeten zijn
   * @param {Array<string>} widgetOrder - Array van widget IDs in de gewenste volgorde
   */
  const updateWidgetConfiguration = async (visibleWidgets, widgetOrder) => {
    if (!user) return;
    
    try {
      const updatedPreferences = await DashboardPreferencesService.updateWidgetConfiguration(
        user.id, 
        visibleWidgets, 
        widgetOrder
      );
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      console.error('Error updating widget configuration:', err);
      setError('Er is een fout opgetreden bij het bijwerken van je widget configuratie.');
      throw err;
    }
  };
  
  /**
   * Update de layout van het dashboard
   * @param {string} layout - De layout ('default', 'compact', 'expanded')
   */
  const updateLayout = async (layout) => {
    if (!user) return;
    
    try {
      const updatedPreferences = await DashboardPreferencesService.updateLayout(user.id, layout);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      console.error('Error updating layout:', err);
      setError('Er is een fout opgetreden bij het bijwerken van je dashboard layout.');
      throw err;
    }
  };
  
  /**
   * Update de theme van het dashboard
   * @param {string} theme - De theme ('light', 'dark', 'system')
   */
  const updateTheme = async (theme) => {
    if (!user) return;
    
    try {
      const updatedPreferences = await DashboardPreferencesService.updateTheme(user.id, theme);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      console.error('Error updating theme:', err);
      setError('Er is een fout opgetreden bij het bijwerken van je dashboard thema.');
      throw err;
    }
  };
  
  /**
   * Update de realtime instelling van het dashboard
   * @param {boolean} enabled - Of realtime updates ingeschakeld moeten zijn
   */
  const updateRealtimeSetting = async (enabled) => {
    if (!user) return;
    
    try {
      const updatedPreferences = await DashboardPreferencesService.updateRealtimeSetting(user.id, enabled);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      console.error('Error updating realtime setting:', err);
      setError('Er is een fout opgetreden bij het bijwerken van je realtime instellingen.');
      throw err;
    }
  };
  
  /**
   * Reset alle dashboard voorkeuren naar de standaardwaarden
   */
  const resetToDefaults = async () => {
    if (!user) return;
    
    try {
      const updatedPreferences = await DashboardPreferencesService.resetToDefaults(user.id);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      console.error('Error resetting preferences to defaults:', err);
      setError('Er is een fout opgetreden bij het resetten van je dashboard voorkeuren.');
      throw err;
    }
  };
  
  // Context waarde
  const contextValue = {
    preferences,
    isLoading,
    error,
    saveFilterConfiguration,
    deleteFilterConfiguration,
    setDefaultFilter,
    updateWidgetConfiguration,
    updateLayout,
    updateTheme,
    updateRealtimeSetting,
    resetToDefaults
  };
  
  return (
    <DashboardPersonalizationContext.Provider value={contextValue}>
      {children}
    </DashboardPersonalizationContext.Provider>
  );
};

DashboardPersonalizationProvider.propTypes = {
  /**
   * Children componenten
   */
  children: PropTypes.node.isRequired
};

/**
 * Hook om de DashboardPersonalizationContext te gebruiken
 * @returns {Object} - De DashboardPersonalizationContext waarde
 */
export const useDashboardPersonalization = () => {
  const context = useContext(DashboardPersonalizationContext);
  
  if (!context) {
    throw new Error('useDashboardPersonalization must be used within a DashboardPersonalizationProvider');
  }
  
  return context;
};

export default DashboardPersonalizationProvider;
