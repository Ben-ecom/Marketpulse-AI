import { createClient } from '@supabase/supabase-js';

// Supabase configuratie
// In een productieomgeving zouden deze waarden in .env variabelen moeten staan
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iyeyypnvcickhdlqvhqq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXl5cG52Y2lja2hkbHF2aHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NzY1NjUsImV4cCI6MjA2MTQ1MjU2NX0.crXV83KCmjffX3R2TZquT6ZmrZ6O8uCkvN5EoNCmm8U';

// Creëer een Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Mock data voor trending topics
 * Deze functie wordt gebruikt als fallback wanneer er geen verbinding is met Supabase
 * of wanneer de echte data nog niet beschikbaar is
 */
export const getMockTrendingTopicsData = () => {
  return {
    data: [
      {
        id: 1,
        topic: 'Duurzame verpakkingen',
        score: 0.89,
        growth: 0.32,
        mentions: 1245,
        sentiment: 0.65,
        platform: 'all',
        timeRange: 'month',
        dataPoints: [
          { date: '2025-04-01', value: 45 },
          { date: '2025-04-08', value: 52 },
          { date: '2025-04-15', value: 58 },
          { date: '2025-04-22', value: 75 },
          { date: '2025-04-29', value: 85 },
          { date: '2025-05-06', value: 95 }
        ]
      },
      {
        id: 2,
        topic: 'Personalisatie',
        score: 0.82,
        growth: 0.18,
        mentions: 986,
        sentiment: 0.72,
        platform: 'all',
        timeRange: 'month',
        dataPoints: [
          { date: '2025-04-01', value: 32 },
          { date: '2025-04-08', value: 38 },
          { date: '2025-04-15', value: 45 },
          { date: '2025-04-22', value: 52 },
          { date: '2025-04-29', value: 58 },
          { date: '2025-05-06', value: 65 }
        ]
      },
      {
        id: 3,
        topic: 'Transparante supply chain',
        score: 0.78,
        growth: 0.25,
        mentions: 845,
        sentiment: 0.58,
        platform: 'all',
        timeRange: 'month',
        dataPoints: [
          { date: '2025-04-01', value: 28 },
          { date: '2025-04-08', value: 35 },
          { date: '2025-04-15', value: 42 },
          { date: '2025-04-22', value: 48 },
          { date: '2025-04-29', value: 55 },
          { date: '2025-05-06', value: 62 }
        ]
      },
      {
        id: 4,
        topic: 'Community marketing',
        score: 0.75,
        growth: 0.15,
        mentions: 732,
        sentiment: 0.68,
        platform: 'all',
        timeRange: 'month',
        dataPoints: [
          { date: '2025-04-01', value: 25 },
          { date: '2025-04-08', value: 28 },
          { date: '2025-04-15', value: 32 },
          { date: '2025-04-22', value: 38 },
          { date: '2025-04-29', value: 42 },
          { date: '2025-05-06', value: 48 }
        ]
      },
      {
        id: 5,
        topic: 'Micro-influencers',
        score: 0.72,
        growth: 0.28,
        mentions: 685,
        sentiment: 0.75,
        platform: 'all',
        timeRange: 'month',
        dataPoints: [
          { date: '2025-04-01', value: 18 },
          { date: '2025-04-08', value: 25 },
          { date: '2025-04-15', value: 32 },
          { date: '2025-04-22', value: 42 },
          { date: '2025-04-29', value: 52 },
          { date: '2025-05-06', value: 58 }
        ]
      }
    ]
  };
};

/**
 * Haalt trending topics op uit Supabase of gebruikt mock data als fallback
 * @param {string} platform - Het platform om data voor op te halen (all, reddit, etc.)
 * @param {string} timeRange - Het tijdsbereik (week, month, quarter, year)
 * @returns {Promise<Object>} - De trending topics data
 */
export const fetchTrendingTopics = async (platform = 'all', timeRange = 'month') => {
  try {
    // Probeer eerst data op te halen uit Supabase
    let { data, error } = await supabase
      .from('trending_topics')
      .select('*')
      .eq('platform', platform)
      .eq('timeRange', timeRange);
    
    // Als er een fout is of geen data, gebruik mock data
    if (error || !data || data.length === 0) {
      console.log('Supabase error of geen data, fallback naar mock data:', error);
      return getMockTrendingTopicsData();
    }
    
    return { data };
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return getMockTrendingTopicsData();
  }
};

/**
 * Haalt details op voor een specifiek trending topic
 * @param {number} topicId - Het ID van het topic
 * @returns {Promise<Object>} - De topic details
 */
export const fetchTopicDetails = async (topicId) => {
  try {
    // Probeer eerst data op te halen uit Supabase
    let { data, error } = await supabase
      .from('trending_topics')
      .select('*')
      .eq('id', topicId)
      .single();
    
    // Als er een fout is of geen data, gebruik mock data
    if (error || !data) {
      console.log('Supabase error of geen data, fallback naar mock data:', error);
      const mockData = getMockTrendingTopicsData();
      return { data: mockData.data.find(topic => topic.id === parseInt(topicId)) };
    }
    
    return { data };
  } catch (error) {
    console.error('Error fetching topic details:', error);
    const mockData = getMockTrendingTopicsData();
    return { data: mockData.data.find(topic => topic.id === parseInt(topicId)) };
  }
};

/**
 * Slaat gebruikersfeedback op over help-content
 * @param {Object} feedbackData - De feedback data
 * @param {string} feedbackData.helpItemId - ID van het help-item
 * @param {string} feedbackData.helpItemType - Type van het help-item (bijv. 'faq', 'tooltip')
 * @param {string} feedbackData.feedbackValue - Waarde van de feedback ('positive', 'negative')
 * @param {string} feedbackData.comment - Optionele commentaar van de gebruiker
 * @param {string} feedbackData.userId - Optionele gebruikers-ID (indien beschikbaar)
 * @param {string} feedbackData.userRole - Rol van de gebruiker (bijv. 'marketer', 'analyst')
 * @param {string} feedbackData.experienceLevel - Ervaringsniveau van de gebruiker
 * @param {string} feedbackData.pageUrl - URL van de pagina waar de feedback is gegeven
 * @returns {Promise<Object>} - Resultaat van de operatie
 */
export const saveHelpFeedback = async (feedbackData) => {
  try {
    // Voeg timestamp toe
    const dataToInsert = {
      ...feedbackData,
      created_at: new Date().toISOString()
    };
    
    // Sla de feedback op in Supabase
    const { data, error } = await supabase
      .from('help_feedback')
      .insert([dataToInsert]);
    
    if (error) {
      console.error('Error saving help feedback:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error saving help feedback:', error);
    return { success: false, error: error.message };
  }
};

// Functie om gebruikerservaring feedback op te slaan
export const saveUserExperienceFeedback = async (feedbackData) => {
  try {
    const { data, error } = await supabase
      .from('user_experience_feedback')
      .insert([
        {
          page_context: feedbackData.pageContext,
          rating: feedbackData.rating,
          feedback: feedbackData.feedback,
          aspects: feedbackData.aspects,
          user_role: feedbackData.userRole,
          experience_level: feedbackData.experienceLevel,
          created_at: new Date()
        }
      ]);

    if (error) {
      console.error('Error saving user experience feedback:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception saving user experience feedback:', error);
    return { success: false, error };
  }
};
