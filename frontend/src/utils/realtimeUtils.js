/**
 * realtimeUtils.js
 * 
 * Utilities voor het werken met Supabase Realtime voor real-time updates.
 * Deze module biedt functies voor het abonneren op databasewijzigingen.
 */

import { supabase } from '../utils/supabaseClient';

/**
 * Abonneren op wijzigingen in een tabel
 * @param {string} table - De naam van de tabel
 * @param {Function} callback - De functie die wordt aangeroepen bij wijzigingen
 * @param {string} event - Het type event (INSERT, UPDATE, DELETE, *) (standaard: *)
 * @param {Object} filters - Filters voor de subscription
 * @returns {Object} - Het subscription object
 */
export const subscribeToTable = (table, callback, event = '*', filters = {}) => {
  // Controleer of realtime is ingeschakeld
  const channel = supabase
    .channel(`table-changes:${table}`)
    .on('postgres_changes', 
      { 
        event, 
        schema: 'public', 
        table 
      }, 
      (payload) => {
        // Voer de callback uit met de payload
        callback(payload);
      }
    )
    .subscribe();
  
  return channel;
};

/**
 * Abonneren op wijzigingen in meerdere tabellen
 * @param {Array<Object>} subscriptions - Array van subscription configuraties
 * @param {Function} callback - De functie die wordt aangeroepen bij wijzigingen
 * @returns {Array<Object>} - Array van subscription objecten
 */
export const subscribeToMultipleTables = (subscriptions, callback) => {
  return subscriptions.map(sub => {
    const { table, event = '*', filters = {} } = sub;
    return subscribeToTable(table, (payload) => {
      callback({
        table,
        payload
      });
    }, event, filters);
  });
};

/**
 * Afmelden van een subscription
 * @param {Object} subscription - Het subscription object
 */
export const unsubscribe = (subscription) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};

/**
 * Afmelden van meerdere subscriptions
 * @param {Array<Object>} subscriptions - Array van subscription objecten
 */
export const unsubscribeAll = (subscriptions) => {
  if (Array.isArray(subscriptions)) {
    subscriptions.forEach(unsubscribe);
  }
};

export default {
  subscribeToTable,
  subscribeToMultipleTables,
  unsubscribe,
  unsubscribeAll
};
