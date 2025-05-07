/**
 * Reddit Service
 * Service voor het ophalen van Reddit data van de backend API
 */

import axios from 'axios';

// API basis URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api/v1';

/**
 * Haal Reddit insights op op basis van een query of subreddit
 * @param {Object} params Query parameters
 * @param {string} params.query Zoekterm (optioneel)
 * @param {string} params.subreddit Subreddit naam (optioneel)
 * @param {string} params.sort Sortering (relevance, hot, top, new)
 * @param {string} params.timeframe Tijdsperiode (hour, day, week, month, year, all)
 * @param {number} params.limit Maximum aantal resultaten
 * @returns {Promise<Object>} Reddit insights data
 */
export const getRedditInsights = async (params = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authenticatie token niet gevonden');
    }
    
    // Controleer of query of subreddit is opgegeven
    if (!params.query && !params.subreddit) {
      throw new Error('Query of subreddit parameter is vereist');
    }
    
    const response = await axios.get(`${API_BASE_URL}/reddit/insights`, {
      params: {
        query: params.query || undefined,
        subreddit: params.subreddit || undefined,
        sort: params.sort || 'relevance',
        timeframe: params.timeframe || 'all',
        limit: params.limit || 50
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Reddit insights:', error);
    throw error;
  }
};

/**
 * Zoek Reddit posts op basis van een query
 * @param {Object} params Query parameters
 * @param {string} params.query Zoekterm
 * @param {string} params.sort Sortering (relevance, hot, top, new, comments)
 * @param {string} params.timeframe Tijdsperiode (hour, day, week, month, year, all)
 * @param {number} params.limit Maximum aantal resultaten
 * @param {boolean} params.includeComments Of comments moeten worden opgehaald
 * @returns {Promise<Object>} Reddit posts data
 */
export const searchRedditPosts = async (params = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authenticatie token niet gevonden');
    }
    
    // Controleer of query is opgegeven
    if (!params.query) {
      throw new Error('Query parameter is vereist');
    }
    
    const response = await axios.get(`${API_BASE_URL}/reddit/search`, {
      params: {
        query: params.query,
        sort: params.sort || 'relevance',
        timeframe: params.timeframe || 'all',
        limit: params.limit || 25,
        includeComments: params.includeComments || false,
        maxComments: params.maxComments || 10
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error searching Reddit posts:', error);
    throw error;
  }
};

/**
 * Haal posts op van een specifieke subreddit
 * @param {Object} params Query parameters
 * @param {string} params.subreddit Subreddit naam
 * @param {string} params.sort Sortering (hot, new, top, rising)
 * @param {string} params.timeframe Tijdsperiode (hour, day, week, month, year, all)
 * @param {number} params.limit Maximum aantal resultaten
 * @param {boolean} params.includeComments Of comments moeten worden opgehaald
 * @returns {Promise<Object>} Subreddit posts data
 */
export const getSubredditPosts = async (params = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authenticatie token niet gevonden');
    }
    
    // Controleer of subreddit is opgegeven
    if (!params.subreddit) {
      throw new Error('Subreddit parameter is vereist');
    }
    
    const response = await axios.get(`${API_BASE_URL}/reddit/subreddit/${params.subreddit}`, {
      params: {
        sort: params.sort || 'hot',
        timeframe: params.timeframe || 'all',
        limit: params.limit || 25,
        includeComments: params.includeComments || false,
        maxComments: params.maxComments || 10
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching subreddit posts:', error);
    throw error;
  }
};

/**
 * Analyseer Reddit posts voor sentiment en trending topics
 * @param {Object} params Query parameters
 * @param {string} params.query Zoekterm (optioneel)
 * @param {string} params.subreddit Subreddit naam (optioneel)
 * @param {string} params.sort Sortering
 * @param {string} params.timeframe Tijdsperiode
 * @param {number} params.limit Maximum aantal resultaten
 * @returns {Promise<Object>} Analyse resultaten
 */
export const analyzeRedditPosts = async (params = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authenticatie token niet gevonden');
    }
    
    // Controleer of query of subreddit is opgegeven
    if (!params.query && !params.subreddit) {
      throw new Error('Query of subreddit parameter is vereist');
    }
    
    const response = await axios.post(`${API_BASE_URL}/reddit/analyze`, {
      query: params.query || undefined,
      subreddit: params.subreddit || undefined,
      sort: params.sort || 'relevance',
      timeframe: params.timeframe || 'all',
      limit: params.limit || 50
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing Reddit posts:', error);
    throw error;
  }
};
