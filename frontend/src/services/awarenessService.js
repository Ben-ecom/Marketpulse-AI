/**
 * Awareness Service
 * Service voor het ophalen van awareness fasen data van de backend API
 */

import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// API basis URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api/v1';

/**
 * Initialiseer awareness fasen voor een project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Geïnitialiseerde awareness fasen
 */
export const initializeAwarenessPhases = async (projectId) => {
  try {
    // Haal user op uit de authStore
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw new Error('Gebruiker niet ingelogd');
    }
    
    const response = await axios.post(`${API_BASE_URL}/awareness/${projectId}/initialize`, {}, {
      headers: {
        Authorization: `Bearer ${user.token || 'demo-token'}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error initializing awareness phases:', error);
    throw error;
  }
};

/**
 * Haal awareness fasen op voor een project
 * @param {string} projectId - Project ID
 * @param {boolean} includeContent - Of content moet worden meegeleverd
 * @returns {Promise<Object>} Awareness fasen data
 */
export const getAwarenessPhases = async (projectId, includeContent = false) => {
  console.log('getAwarenessPhases called with projectId:', projectId);
  try {
    // Haal user op uit de authStore
    const { user } = useAuthStore.getState();
    console.log('User from authStore:', user);
    
    if (!user) {
      console.error('No user found in authStore');
      throw new Error('Gebruiker niet ingelogd');
    }
    
    const url = `${API_BASE_URL}/awareness/${projectId}/phases`;
    console.log('API request URL:', url);
    console.log('Request headers:', { Authorization: `Bearer ${user.token ? 'token-exists' : 'demo-token'}` });
    
    const response = await axios.get(url, {
      params: {
        includeContent
      },
      headers: {
        Authorization: `Bearer ${user.token || 'demo-token'}`
      }
    });
    
    console.log('API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching awareness phases:', error);
    throw error;
  }
};

/**
 * Classificeer content in awareness fasen
 * @param {string} projectId - Project ID
 * @param {Array} contentItems - Array van content items om te classificeren
 * @param {Object} productContext - Context over het product/onderwerp
 * @returns {Promise<Object>} Classificatieresultaten
 */
export const classifyContent = async (projectId, contentItems, productContext = {}) => {
  try {
    // Haal user op uit de authStore
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw new Error('Gebruiker niet ingelogd');
    }
    
    const response = await axios.post(`${API_BASE_URL}/awareness/${projectId}/classify`, {
      contentItems,
      productContext
    }, {
      headers: {
        Authorization: `Bearer ${user.token || 'demo-token'}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error classifying content:', error);
    throw error;
  }
};

/**
 * Haal marketing aanbevelingen op voor een project
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Marketing aanbevelingen
 */
export const getMarketingRecommendations = async (projectId) => {
  try {
    // Haal user op uit de authStore
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw new Error('Gebruiker niet ingelogd');
    }
    
    const response = await axios.get(`${API_BASE_URL}/awareness/${projectId}/recommendations`, {
      headers: {
        Authorization: `Bearer ${user.token || 'demo-token'}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching marketing recommendations:', error);
    throw error;
  }
};

/**
 * Update een awareness fase
 * @param {string} projectId - Project ID
 * @param {string} phaseName - Naam van de fase
 * @param {Object} updateData - Data om bij te werken
 * @returns {Promise<Object>} Bijgewerkte fase
 */
export const updateAwarenessPhase = async (projectId, phaseName, updateData) => {
  try {
    // Haal user op uit de authStore
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw new Error('Gebruiker niet ingelogd');
    }
    
    const response = await axios.put(`${API_BASE_URL}/awareness/${projectId}/phases/${phaseName}`, updateData, {
      headers: {
        Authorization: `Bearer ${user.token || 'demo-token'}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating awareness phase:', error);
    throw error;
  }
};

/**
 * Voeg een indicator toe aan een awareness fase
 * @param {string} projectId - Project ID
 * @param {string} phaseName - Naam van de fase
 * @param {Object} indicator - Indicator data
 * @returns {Promise<Object>} Bijgewerkte fase
 */
export const addIndicator = async (projectId, phaseName, indicator) => {
  try {
    // Haal user op uit de authStore
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw new Error('Gebruiker niet ingelogd');
    }
    
    const response = await axios.post(`${API_BASE_URL}/awareness/${projectId}/phases/${phaseName}/indicators`, indicator, {
      headers: {
        Authorization: `Bearer ${user.token || 'demo-token'}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding indicator:', error);
    throw error;
  }
};

/**
 * Voeg een marketing aanbeveling toe aan een awareness fase
 * @param {string} projectId - Project ID
 * @param {string} phaseName - Naam van de fase
 * @param {Object} marketingAngle - Marketing aanbeveling data
 * @returns {Promise<Object>} Bijgewerkte fase
 */
export const addMarketingAngle = async (projectId, phaseName, marketingAngle) => {
  try {
    // Haal user op uit de authStore
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw new Error('Gebruiker niet ingelogd');
    }
    
    const response = await axios.post(`${API_BASE_URL}/awareness/${projectId}/phases/${phaseName}/angles`, marketingAngle, {
      headers: {
        Authorization: `Bearer ${user.token || 'demo-token'}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding marketing angle:', error);
    throw error;
  }
};
