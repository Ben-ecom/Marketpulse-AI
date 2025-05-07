/**
 * RealtimeProvider.jsx
 * 
 * Provider component voor real-time updates van help metrics.
 * Abonneert op wijzigingen in relevante tabellen en zorgt voor automatische updates.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { subscribeToMultipleTables, unsubscribeAll } from '../../../utils/realtimeUtils';
import HelpMetricsService from '../../../services/help/HelpMetricsService';

// Context voor real-time updates
const RealtimeContext = createContext({
  lastUpdate: null,
  isRealtime: false,
  enableRealtime: () => {},
  disableRealtime: () => {},
  refreshData: () => {}
});

/**
 * Provider component voor real-time updates
 * @component
 */
export const RealtimeProvider = ({ children, onUpdate }) => {
  const [subscriptions, setSubscriptions] = useState(null);
  const [isRealtime, setIsRealtime] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Handler voor database wijzigingen
  const handleDatabaseChange = (change) => {
    console.log('Database change detected:', change);
    
    // Update de lastUpdate timestamp
    setLastUpdate(new Date());
    
    // Wis de cache voor de betreffende tabel
    HelpMetricsService.clearMetricsCache();
    
    // Roep de onUpdate callback aan
    if (onUpdate) {
      onUpdate(change);
    }
  };
  
  // Functie om real-time updates in te schakelen
  const enableRealtime = () => {
    if (subscriptions) return; // Voorkom dubbele subscriptions
    
    // Abonneer op relevante tabellen
    const subs = subscribeToMultipleTables([
      { table: 'help_interactions' },
      { table: 'help_feedback' },
      { table: 'user_experience_feedback' }
    ], handleDatabaseChange);
    
    setSubscriptions(subs);
    setIsRealtime(true);
    setLastUpdate(new Date());
    
    console.log('Realtime updates enabled');
  };
  
  // Functie om real-time updates uit te schakelen
  const disableRealtime = () => {
    if (subscriptions) {
      unsubscribeAll(subscriptions);
      setSubscriptions(null);
    }
    
    setIsRealtime(false);
    console.log('Realtime updates disabled');
  };
  
  // Functie om data handmatig te verversen
  const refreshData = () => {
    HelpMetricsService.clearMetricsCache();
    setLastUpdate(new Date());
    
    if (onUpdate) {
      onUpdate({ manual: true });
    }
  };
  
  // Cleanup bij unmount
  useEffect(() => {
    return () => {
      disableRealtime();
    };
  }, []);
  
  // Context waarde
  const contextValue = {
    lastUpdate,
    isRealtime,
    enableRealtime,
    disableRealtime,
    refreshData
  };
  
  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
};

RealtimeProvider.propTypes = {
  /**
   * Children componenten
   */
  children: PropTypes.node.isRequired,
  
  /**
   * Callback die wordt aangeroepen bij updates
   */
  onUpdate: PropTypes.func
};

/**
 * Hook om de RealtimeContext te gebruiken
 * @returns {Object} - De RealtimeContext waarde
 */
export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  
  return context;
};

export default RealtimeProvider;
