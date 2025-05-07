/**
 * Constanten voor de MarketPulse AI applicatie
 */

// API URL
export const API_URL = 'http://localhost:5003/api/v1';

// Beschikbare platforms voor dataverzameling
export const DATA_PLATFORMS = [
  { 
    id: 'reddit', 
    name: 'Reddit',
    description: 'Verzamel data van Reddit subreddits en posts',
    icon: 'reddit'
  },
  { 
    id: 'amazon', 
    name: 'Amazon Reviews',
    description: 'Verzamel product reviews van Amazon',
    icon: 'shopping_cart'
  }
];

// Inzicht types
export const INSIGHT_TYPES = [
  {
    id: 'pain_points',
    name: 'Pijnpunten',
    description: 'Identificeer veelvoorkomende problemen en frustraties',
    icon: 'warning'
  },
  {
    id: 'desires',
    name: 'Verlangens',
    description: 'Ontdek wat klanten willen en waarderen',
    icon: 'favorite'
  },
  {
    id: 'market_trends',
    name: 'Markttrends',
    description: 'Analyseer opkomende trends en ontwikkelingen',
    icon: 'trending_up'
  }
];

// Project statussen
export const PROJECT_STATUSES = [
  { id: 'active', name: 'Actief', color: 'success' },
  { id: 'archived', name: 'Gearchiveerd', color: 'secondary' },
  { id: 'completed', name: 'Voltooid', color: 'info' }
];

// Job statussen
export const JOB_STATUSES = [
  { id: 'pending', name: 'In behandeling', color: 'warning' },
  { id: 'processing', name: 'Verwerken', color: 'info' },
  { id: 'completed', name: 'Voltooid', color: 'success' },
  { id: 'failed', name: 'Mislukt', color: 'error' }
];

// Timeframes voor dataverzameling
export const TIMEFRAMES = [
  { id: 'laatste_week', name: 'Laatste week' },
  { id: 'laatste_maand', name: 'Laatste maand' },
  { id: 'laatste_jaar', name: 'Laatste jaar' },
  { id: 'alles', name: 'Alle tijd' }
];

// Maximaal aantal keywords voor een project
export const MAX_KEYWORDS = 10;

// Maximaal aantal subreddits voor dataverzameling
export const MAX_SUBREDDITS = 5;

// Demo subreddits voor suggesties
export const DEMO_SUBREDDITS = [
  'technology', 'gadgets', 'apple', 'android', 'programming',
  'webdev', 'marketing', 'business', 'entrepreneur', 'startups',
  'productivity', 'software', 'hardware', 'design', 'ux'
];

// Beschikbare landen voor geo-locatie
export const GEO_LOCATIONS = [
  { code: 'nl', name: 'Nederland', locale: 'nl-NL' },
  { code: 'be', name: 'België', locale: 'nl-BE' },
  { code: 'us', name: 'Verenigde Staten', locale: 'en-US' },
  { code: 'gb', name: 'Verenigd Koninkrijk', locale: 'en-GB' },
  { code: 'de', name: 'Duitsland', locale: 'de-DE' },
  { code: 'fr', name: 'Frankrijk', locale: 'fr-FR' },
  { code: 'es', name: 'Spanje', locale: 'es-ES' },
  { code: 'it', name: 'Italië', locale: 'it-IT' },
  { code: 'ca', name: 'Canada', locale: 'en-CA' },
  { code: 'au', name: 'Australië', locale: 'en-AU' },
  { code: 'jp', name: 'Japan', locale: 'ja-JP' },
  { code: 'br', name: 'Brazilië', locale: 'pt-BR' },
  { code: 'in', name: 'India', locale: 'en-IN' },
  { code: 'cn', name: 'China', locale: 'zh-CN' },
  { code: 'ru', name: 'Rusland', locale: 'ru-RU' }
];

// Beschikbare device types voor scraping
export const DEVICE_TYPES = [
  { id: 'desktop', name: 'Desktop', icon: 'computer' },
  { id: 'mobile', name: 'Mobiel', icon: 'smartphone' },
  { id: 'tablet', name: 'Tablet', icon: 'tablet' }
];

// Beschikbare browsers voor scraping
export const BROWSER_TYPES = [
  { id: 'chrome', name: 'Chrome', icon: 'chrome' },
  { id: 'firefox', name: 'Firefox', icon: 'firefox' },
  { id: 'safari', name: 'Safari', icon: 'safari' },
  { id: 'edge', name: 'Edge', icon: 'edge' }
];
