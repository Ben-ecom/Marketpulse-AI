/**
 * ABTestingService
 * 
 * Een service voor het uitvoeren van A/B testen in de applicatie.
 * Deze service maakt het mogelijk om verschillende versies van componenten te tonen aan verschillende gebruikers
 * en de interactie te meten om te bepalen welke versie effectiever is.
 */

/**
 * Genereert een unieke gebruikers-ID of haalt deze op uit localStorage
 * @returns {string} De gebruikers-ID
 */
const getUserId = () => {
  let userId = localStorage.getItem('mp_user_id');
  
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('mp_user_id', userId);
  }
  
  return userId;
};

/**
 * Bepaalt tot welke testgroep een gebruiker behoort
 * @param {string} testId - De ID van de test
 * @param {number} numVariants - Het aantal varianten in de test
 * @returns {number} De variant-index (0-based)
 */
export const getTestVariant = (testId, numVariants = 2) => {
  const userId = getUserId();
  const testKey = `mp_test_${testId}`;
  
  // Controleer of de gebruiker al is toegewezen aan een variant
  let variant = localStorage.getItem(testKey);
  
  if (variant === null) {
    // Wijs de gebruiker toe aan een willekeurige variant
    variant = Math.floor(Math.random() * numVariants);
    localStorage.setItem(testKey, variant.toString());
  } else {
    // Converteer van string naar number
    variant = parseInt(variant, 10);
  }
  
  return variant;
};

/**
 * Registreert een conversie voor een specifieke test
 * @param {string} testId - De ID van de test
 * @param {string} eventName - De naam van de conversie-event
 * @param {Object} eventData - Aanvullende data voor het event
 */
export const trackConversion = (testId, eventName, eventData = {}) => {
  const userId = getUserId();
  const variant = getTestVariant(testId);
  
  // Hier zou je normaal gesproken een analytics service aanroepen
  // Voor nu loggen we het event naar de console
  console.log('A/B Test Conversion:', {
    testId,
    userId,
    variant,
    eventName,
    eventData,
    timestamp: new Date().toISOString()
  });
  
  // Sla conversie lokaal op voor demo-doeleinden
  const conversionsKey = `mp_conversions_${testId}`;
  const conversions = JSON.parse(localStorage.getItem(conversionsKey) || '[]');
  
  conversions.push({
    userId,
    variant,
    eventName,
    eventData,
    timestamp: new Date().toISOString()
  });
  
  localStorage.setItem(conversionsKey, JSON.stringify(conversions));
  
  return true;
};

/**
 * Haalt conversie-statistieken op voor een specifieke test
 * @param {string} testId - De ID van de test
 * @returns {Object} De conversie-statistieken
 */
export const getTestStats = (testId) => {
  const conversionsKey = `mp_conversions_${testId}`;
  const conversions = JSON.parse(localStorage.getItem(conversionsKey) || '[]');
  
  // Groepeer conversies per variant en event
  const stats = {};
  
  conversions.forEach(conversion => {
    const { variant, eventName } = conversion;
    
    if (!stats[variant]) {
      stats[variant] = {};
    }
    
    if (!stats[variant][eventName]) {
      stats[variant][eventName] = 0;
    }
    
    stats[variant][eventName]++;
  });
  
  return stats;
};

/**
 * Test definities
 * 
 * Bevat de configuratie voor alle A/B testen in de applicatie.
 */
export const tests = {
  helpMethodTest: {
    id: 'help_method_test',
    name: 'Help Methode Test',
    description: 'Test om te bepalen welke help-methode het meest effectief is',
    variants: [
      { id: 0, name: 'Contextual Tooltips' },
      { id: 1, name: 'Tour Guide' },
      { id: 2, name: 'Personalized Help' }
    ],
    events: [
      { id: 'view', name: 'View' },
      { id: 'click', name: 'Click' },
      { id: 'complete', name: 'Complete' },
      { id: 'feedback_positive', name: 'Positive Feedback' },
      { id: 'feedback_negative', name: 'Negative Feedback' }
    ]
  },
  onboardingTest: {
    id: 'onboarding_test',
    name: 'Onboarding Test',
    description: 'Test om te bepalen welke onboarding-methode het meest effectief is',
    variants: [
      { id: 0, name: 'Wizard' },
      { id: 1, name: 'Video' },
      { id: 2, name: 'Interactive Demo' }
    ],
    events: [
      { id: 'start', name: 'Start' },
      { id: 'step_complete', name: 'Step Complete' },
      { id: 'complete', name: 'Complete' },
      { id: 'skip', name: 'Skip' }
    ]
  }
};

/**
 * ABTestingService object dat alle functies exporteert
 */
const ABTestingService = {
  getUserId,
  getTestVariant,
  trackConversion,
  getTestStats,
  tests
};

export default ABTestingService;
