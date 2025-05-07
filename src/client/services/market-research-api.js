/**
 * Market Research API Client
 *
 * Deze client biedt methoden voor het communiceren met de Market Research API.
 */

import axios from 'axios';

// API basis URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Voer een marktanalyse uit
 * @param {Object} data - De marktgegevens voor analyse
 * @returns {Promise<Object>} - De analyseresultaten
 */
export async function analyzeMarket(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/market-research/analyze`, data);
    return response.data;
  } catch (error) {
    console.error('Error analyzing market:', error);
    throw error;
  }
}

/**
 * Genereer marktinzichten
 * @param {Object} data - De marktgegevens voor inzichten
 * @returns {Promise<Object>} - De gegenereerde inzichten
 */
export async function generateMarketInsights(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/market-research/insights`, data);
    return response.data;
  } catch (error) {
    console.error('Error generating market insights:', error);
    throw error;
  }
}

/**
 * Voer een prijsanalyse uit
 * @param {Object} data - De prijsgegevens voor analyse
 * @returns {Promise<Object>} - De prijsanalyseresultaten
 */
export async function analyzePrices(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/market-research/price-analysis`, data);
    return response.data;
  } catch (error) {
    console.error('Error analyzing prices:', error);
    throw error;
  }
}

/**
 * Voer een concurrentieanalyse uit
 * @param {Object} data - De concurrentiegegevens voor analyse
 * @returns {Promise<Object>} - De concurrentieanalyseresultaten
 */
export async function analyzeCompetitors(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/market-research/competitor-analysis`, data);
    return response.data;
  } catch (error) {
    console.error('Error analyzing competitors:', error);
    throw error;
  }
}

/**
 * Identificeer gaps en opportunities in de markt
 * @param {Object} data - De marktgegevens voor gap-opportunity identificatie
 * @returns {Promise<Object>} - De geïdentificeerde gaps en opportunities
 */
export async function identifyGapOpportunities(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/market-research/gap-opportunities`, data);
    return response.data;
  } catch (error) {
    console.error('Error identifying gap opportunities:', error);
    throw error;
  }
}

/**
 * Genereer visualisatiegegevens voor marktanalyse
 * @param {Object} data - De resultaten van de marktanalyse
 * @returns {Promise<Object>} - De gegenereerde visualisatiegegevens
 */
export async function generateVisualizations(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/market-research/visualizations`, data);
    return response.data;
  } catch (error) {
    console.error('Error generating visualizations:', error);
    throw error;
  }
}

/**
 * Sla een marktonderzoeksrapport op
 * @param {Object} data - Het rapport om op te slaan
 * @returns {Promise<Object>} - Het opgeslagen rapport
 */
export async function saveReport(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/market-research/reports`, data);
    return response.data;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
}

/**
 * Haal een specifiek marktonderzoeksrapport op
 * @param {string} reportId - Het ID van het rapport
 * @returns {Promise<Object>} - Het opgevraagde rapport
 */
export async function getReport(reportId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/market-research/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting report ${reportId}:`, error);
    throw error;
  }
}

/**
 * Haal alle marktonderzoeksrapporten op voor een gebruiker
 * @returns {Promise<Object>} - De opgevraagde rapporten
 */
export async function getAllReports() {
  try {
    const response = await axios.get(`${API_BASE_URL}/market-research/reports`);
    return response.data;
  } catch (error) {
    console.error('Error getting all reports:', error);
    throw error;
  }
}
