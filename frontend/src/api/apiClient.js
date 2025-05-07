import axios from 'axios';
import { supabase } from './supabase';

// Basis API client configuratie
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5003/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor om auth token toe te voegen
apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor voor error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Algemene error handling
    if (error.response) {
      // Server antwoordde met een status code buiten 2xx bereik
      console.error('API Error:', error.response.data);
      
      // Authenticatie errors
      if (error.response.status === 401) {
        // Redirect naar login pagina of refresh token
        console.warn('Authenticatie verlopen of ongeldig');
      }
    } else if (error.request) {
      // Request gemaakt maar geen antwoord ontvangen
      console.error('Geen antwoord van server:', error.request);
    } else {
      // Iets anders ging mis bij het maken van de request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API functies voor projecten
export const projectsApi = {
  getAll: () => apiClient.get('/projects'),
  getById: (id) => apiClient.get(`/projects/${id}`),
  create: (data) => apiClient.post('/projects', data),
  update: (id, data) => apiClient.put(`/projects/${id}`, data),
  delete: (id) => apiClient.delete(`/projects/${id}`),
  updateConfig: (id, config) => apiClient.put(`/projects/${id}/config`, { config }),
  getConfig: (id) => apiClient.get(`/projects/${id}/config`),
};

// API functies voor data verzameling
export const dataApi = {
  // Start data verzameling
  collectData: (data) => apiClient.post('/data/collect', data),
  
  // Haal data op
  getRedditData: (projectId) => apiClient.get(`/data/reddit/${projectId}`),
  getAmazonData: (projectId) => apiClient.get(`/data/amazon/${projectId}`),
  
  // Haal data collection jobs op
  getDataJobs: (projectId) => apiClient.get(`/data/jobs/${projectId}`),
};

// API functies voor inzichten
export const insightsApi = {
  // Start inzicht generatie
  generateInsights: (data) => apiClient.post('/insights/generate', data),
  
  // Haal inzichten op
  getPainPoints: (projectId) => apiClient.get(`/insights/pain-points/${projectId}`),
  getDesires: (projectId) => apiClient.get(`/insights/desires/${projectId}`),
  getMarketTrends: (projectId) => apiClient.get(`/insights/market-trends/${projectId}`),
  getMarketSize: (projectId) => apiClient.get(`/insights/market-size/${projectId}`),
  getCompetitors: (projectId) => apiClient.get(`/insights/competitors/${projectId}`),
  getMarketing: (projectId) => apiClient.get(`/insights/marketing/${projectId}`),
  
  // Haal insight generation jobs op
  getInsightJobs: (projectId) => apiClient.get(`/insights/jobs/${projectId}`),
};

// API functies voor dashboard
export const dashboardApi = {
  // Haal dashboard overzicht op
  getOverview: () => apiClient.get('/dashboard/overview'),
  
  // Haal project statistieken op
  getProjectStats: (projectId) => apiClient.get(`/dashboard/projects/${projectId}/stats`),
  
  // Haal recente inzichten op
  getRecentInsights: (limit = 10) => apiClient.get(`/dashboard/insights/recent?limit=${limit}`),
  
  // Haal populaire trends op
  getPopularTrends: (limit = 10) => apiClient.get(`/dashboard/trends/popular?limit=${limit}`),
};

export default apiClient;
