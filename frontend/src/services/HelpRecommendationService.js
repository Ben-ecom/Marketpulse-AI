/**
 * HelpRecommendationService
 * 
 * Een service die machine learning gebruikt om help-content aan te passen op basis van gebruikersgedrag.
 * Deze service analyseert gebruikersinteracties en leert welke help-content het meest relevant is voor een specifieke gebruiker.
 */

// Importeer de ABTestingService voor gebruikers-ID en tracking
import ABTestingService, { trackConversion } from './ABTestingService';

/**
 * Gebruikersacties die worden bijgehouden
 * @type {Object}
 */
const USER_ACTIONS = {
  VIEW_PAGE: 'view_page',
  CLICK_ELEMENT: 'click_element',
  SEARCH: 'search',
  ERROR: 'error',
  HELP_VIEW: 'help_view',
  HELP_CLICK: 'help_click',
  HELP_COMPLETE: 'help_complete',
  FEEDBACK_POSITIVE: 'feedback_positive',
  FEEDBACK_NEGATIVE: 'feedback_negative'
};

/**
 * Gebruikersprofielen op basis van gedrag
 * @type {Object}
 */
const USER_PROFILES = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPLORER: 'explorer',
  TASK_FOCUSED: 'task_focused',
  HELP_SEEKER: 'help_seeker'
};

/**
 * Help-content categorieën
 * @type {Object}
 */
const HELP_CATEGORIES = {
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  TECHNICAL: 'technical',
  CONCEPTUAL: 'conceptual',
  PROCEDURAL: 'procedural'
};

/**
 * Gebruikersgedrag opslaan in localStorage
 * @param {string} action - De actie die de gebruiker heeft uitgevoerd
 * @param {Object} data - Data over de actie
 */
export const trackUserBehavior = (action, data = {}) => {
  const userId = ABTestingService.getUserId();
  const timestamp = new Date().toISOString();
  
  // Haal bestaande gedragsdata op
  const behaviorKey = `mp_user_behavior_${userId}`;
  const behavior = JSON.parse(localStorage.getItem(behaviorKey) || '[]');
  
  // Voeg nieuwe actie toe
  behavior.push({
    action,
    data,
    timestamp
  });
  
  // Beperk de grootte van de gedragsdata (max 100 acties)
  const trimmedBehavior = behavior.slice(-100);
  
  // Sla gedragsdata op
  localStorage.setItem(behaviorKey, JSON.stringify(trimmedBehavior));
  
  // Update gebruikersprofiel
  updateUserProfile(userId, action, data);
  
  // Track conversie voor A/B testen
  if (action.startsWith('help_')) {
    trackConversion('help_personalization', action, data);
  }
  
  return true;
};

/**
 * Gebruikersprofiel bijwerken op basis van gedrag
 * @param {string} userId - De gebruikers-ID
 * @param {string} action - De actie die de gebruiker heeft uitgevoerd
 * @param {Object} data - Data over de actie
 */
const updateUserProfile = (userId, action, data) => {
  const profileKey = `mp_user_profile_${userId}`;
  const profile = JSON.parse(localStorage.getItem(profileKey) || '{}');
  
  // Initialiseer profiel als het nog niet bestaat
  if (!profile.experienceLevel) {
    profile.experienceLevel = USER_PROFILES.BEGINNER;
    profile.interactionStyle = USER_PROFILES.EXPLORER;
    profile.helpPreference = 'contextual';
    profile.contentPreference = HELP_CATEGORIES.BASIC;
    profile.metrics = {
      pageViews: 0,
      helpViews: 0,
      helpClicks: 0,
      helpCompletes: 0,
      positiveFeedback: 0,
      negativeFeedback: 0,
      errors: 0,
      searches: 0
    };
  }
  
  // Update metrics op basis van actie
  switch (action) {
    case USER_ACTIONS.VIEW_PAGE:
      profile.metrics.pageViews++;
      break;
    case USER_ACTIONS.HELP_VIEW:
      profile.metrics.helpViews++;
      break;
    case USER_ACTIONS.HELP_CLICK:
      profile.metrics.helpClicks++;
      break;
    case USER_ACTIONS.HELP_COMPLETE:
      profile.metrics.helpCompletes++;
      break;
    case USER_ACTIONS.FEEDBACK_POSITIVE:
      profile.metrics.positiveFeedback++;
      break;
    case USER_ACTIONS.FEEDBACK_NEGATIVE:
      profile.metrics.negativeFeedback++;
      break;
    case USER_ACTIONS.ERROR:
      profile.metrics.errors++;
      break;
    case USER_ACTIONS.SEARCH:
      profile.metrics.searches++;
      break;
    default:
      break;
  }
  
  // Update experience level op basis van metrics
  const { metrics } = profile;
  const totalInteractions = metrics.pageViews + metrics.helpViews + metrics.helpClicks;
  
  if (totalInteractions > 100 || metrics.helpCompletes > 20) {
    profile.experienceLevel = USER_PROFILES.ADVANCED;
  } else if (totalInteractions > 30 || metrics.helpCompletes > 5) {
    profile.experienceLevel = USER_PROFILES.INTERMEDIATE;
  } else {
    profile.experienceLevel = USER_PROFILES.BEGINNER;
  }
  
  // Update interaction style op basis van metrics
  const helpRatio = totalInteractions > 0 ? (metrics.helpViews + metrics.helpClicks) / totalInteractions : 0;
  
  if (helpRatio > 0.3 || metrics.errors > 10) {
    profile.interactionStyle = USER_PROFILES.HELP_SEEKER;
  } else if (metrics.pageViews > 50 && metrics.helpViews < 10) {
    profile.interactionStyle = USER_PROFILES.TASK_FOCUSED;
  } else {
    profile.interactionStyle = USER_PROFILES.EXPLORER;
  }
  
  // Update help preference op basis van feedback
  if (metrics.positiveFeedback > metrics.negativeFeedback) {
    // Behoud huidige voorkeur als het positieve feedback krijgt
  } else if (metrics.negativeFeedback > metrics.positiveFeedback) {
    // Wissel van help-methode als het negatieve feedback krijgt
    if (profile.helpPreference === 'contextual') {
      profile.helpPreference = 'tour';
    } else if (profile.helpPreference === 'tour') {
      profile.helpPreference = 'personalized';
    } else {
      profile.helpPreference = 'contextual';
    }
  }
  
  // Update content preference op basis van experience level en interaction style
  if (profile.experienceLevel === USER_PROFILES.ADVANCED) {
    profile.contentPreference = profile.interactionStyle === USER_PROFILES.TASK_FOCUSED 
      ? HELP_CATEGORIES.TECHNICAL 
      : HELP_CATEGORIES.ADVANCED;
  } else if (profile.experienceLevel === USER_PROFILES.INTERMEDIATE) {
    profile.contentPreference = profile.interactionStyle === USER_PROFILES.HELP_SEEKER 
      ? HELP_CATEGORIES.PROCEDURAL 
      : HELP_CATEGORIES.INTERMEDIATE;
  } else {
    profile.contentPreference = profile.interactionStyle === USER_PROFILES.EXPLORER 
      ? HELP_CATEGORIES.CONCEPTUAL 
      : HELP_CATEGORIES.BASIC;
  }
  
  // Sla bijgewerkt profiel op
  localStorage.setItem(profileKey, JSON.stringify(profile));
  
  return profile;
};

/**
 * Gebruikersprofiel ophalen
 * @returns {Object} Het gebruikersprofiel
 */
export const getUserProfile = () => {
  const userId = ABTestingService.getUserId();
  const profileKey = `mp_user_profile_${userId}`;
  return JSON.parse(localStorage.getItem(profileKey) || '{}');
};

/**
 * Aanbevolen help-content ophalen op basis van gebruikersprofiel
 * @param {string} activeView - De actieve view
 * @returns {Object} De aanbevolen help-content
 */
export const getRecommendedHelpContent = (activeView) => {
  const profile = getUserProfile();
  
  // Standaard help-content
  const defaultContent = {
    method: 'contextual',
    title: `${activeView.charAt(0).toUpperCase() + activeView.slice(1)} Help`,
    content: `Deze pagina biedt inzicht in de ${activeView} functionaliteit van MarketPulse AI.`,
    category: HELP_CATEGORIES.BASIC
  };
  
  // Als er geen profiel is, gebruik standaard content
  if (!profile.experienceLevel) {
    return defaultContent;
  }
  
  // Bepaal help-methode op basis van profiel
  const method = profile.helpPreference || 'contextual';
  
  // Bepaal content categorie op basis van profiel
  const category = profile.contentPreference || HELP_CATEGORIES.BASIC;
  
  // Bepaal content op basis van categorie en actieve view
  let content = '';
  let title = '';
  
  switch (activeView) {
    case 'dashboard':
      title = 'Dashboard Help';
      if (category === HELP_CATEGORIES.TECHNICAL || category === HELP_CATEGORIES.ADVANCED) {
        content = 'Het dashboard biedt geavanceerde visualisaties van topic awareness data. Je kunt diepgaande analyses uitvoeren door filters te combineren en data te exporteren voor externe verwerking.';
      } else if (category === HELP_CATEGORIES.INTERMEDIATE || category === HELP_CATEGORIES.PROCEDURAL) {
        content = 'Het dashboard toont een overzicht van topic awareness data. Gebruik de filters bovenaan om specifieke databronnen of tijdsperiodes te selecteren en klik op een topic voor meer details.';
      } else {
        content = 'Welkom bij het dashboard! Hier zie je een overzicht van de belangrijkste topics en trends. Klik op de verschillende visualisaties om meer te ontdekken.';
      }
      break;
    
    case 'report':
      title = 'Rapport Help';
      if (category === HELP_CATEGORIES.TECHNICAL || category === HELP_CATEGORIES.ADVANCED) {
        content = 'Het rapport biedt geavanceerde analyse-opties en export-functionaliteit. Je kunt aangepaste rapporten genereren met specifieke secties en data-aggregaties voor diepgaande inzichten.';
      } else if (category === HELP_CATEGORIES.INTERMEDIATE || category === HELP_CATEGORIES.PROCEDURAL) {
        content = 'Het rapport toont een gedetailleerde analyse van de topic awareness data. Pas het rapport aan door secties toe te voegen of te verwijderen en exporteer het in verschillende formaten.';
      } else {
        content = 'Welkom bij het rapport! Hier kun je een overzicht krijgen van de belangrijkste inzichten en deze delen met anderen. Gebruik de opties rechts om het rapport aan te passen.';
      }
      break;
    
    case 'sentiment':
      title = 'Sentiment Analyse Help';
      if (category === HELP_CATEGORIES.TECHNICAL || category === HELP_CATEGORIES.ADVANCED) {
        content = 'De sentiment analyse gebruikt geavanceerde NLP-algoritmes om nuances in tekst te detecteren. Je kunt diepgaande analyses uitvoeren door te filteren op specifieke entiteiten, attributen en sentiment-scores.';
      } else if (category === HELP_CATEGORIES.INTERMEDIATE || category === HELP_CATEGORIES.PROCEDURAL) {
        content = 'De sentiment analyse toont de verdeling van positief, neutraal en negatief sentiment. Filter op specifieke awareness fasen of topics voor diepere inzichten en bekijk trends over tijd.';
      } else {
        content = 'Welkom bij de sentiment analyse! Hier zie je hoe positief of negatief je doelgroep praat over verschillende onderwerpen. Dit helpt je om je communicatie aan te passen.';
      }
      break;
    
    case 'trends':
      title = 'Trend Analyse Help';
      if (category === HELP_CATEGORIES.TECHNICAL || category === HELP_CATEGORIES.ADVANCED) {
        content = 'De trend analyse biedt geavanceerde tijdreeks-analyse met seizoensgebonden correctie en anomalie-detectie. Je kunt voorspellende modellen toepassen en correlaties identificeren tussen verschillende metrics.';
      } else if (category === HELP_CATEGORIES.INTERMEDIATE || category === HELP_CATEGORIES.PROCEDURAL) {
        content = 'De trend analyse toont de ontwikkeling van topics en sentiment over tijd. Pas de tijdsgranulariteit aan, vergelijk meerdere topics en gebruik trendlijnen om patronen te identificeren.';
      } else {
        content = 'Welkom bij de trend analyse! Hier zie je hoe topics en sentiment veranderen over tijd. Dit helpt je om opkomende trends te identificeren en je strategie aan te passen.';
      }
      break;
    
    default:
      title = defaultContent.title;
      content = defaultContent.content;
      break;
  }
  
  // Track dat de aanbevolen help-content is gegenereerd
  trackUserBehavior('help_recommendation_generated', {
    activeView,
    method,
    category,
    title
  });
  
  return {
    method,
    title,
    content,
    category
  };
};

/**
 * HelpRecommendationService object dat alle functies exporteert
 */
const HelpRecommendationService = {
  trackUserBehavior,
  getUserProfile,
  getRecommendedHelpContent,
  USER_ACTIONS,
  USER_PROFILES,
  HELP_CATEGORIES
};

export default HelpRecommendationService;
