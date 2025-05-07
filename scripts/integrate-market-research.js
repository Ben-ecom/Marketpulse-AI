/**
 * Integratie script voor de Market Research Module
 * 
 * Dit script integreert de Market Research Module in de hoofdapplicatie
 * door de benodigde routes en componenten toe te voegen.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Verkrijg het huidige bestandspad
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Kleuren voor console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Log een bericht naar de console met kleur
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Controleer of een bestand bestaat
 */
function checkFileExists(filePath, displayPath = null) {
  const exists = fs.existsSync(filePath);
  const displayName = displayPath || filePath;
  
  if (exists) {
    log(`✅ ${displayName} gevonden`, 'green');
  } else {
    log(`❌ ${displayName} niet gevonden`, 'red');
  }
  
  return exists;
}

/**
 * Controleer of een string in een bestand voorkomt
 */
function checkStringInFile(filePath, searchString, displayName = null) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const contains = content.includes(searchString);
    const name = displayName || searchString;
    
    if (contains) {
      log(`✅ ${name} gevonden in ${path.basename(filePath)}`, 'green');
    } else {
      log(`❌ ${name} niet gevonden in ${path.basename(filePath)}`, 'red');
    }
    
    return contains;
  } catch (error) {
    log(`❌ Fout bij het controleren van ${path.basename(filePath)}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Voeg een route toe aan de routes.jsx als deze nog niet bestaat
 */
function addRouteIfNotExists() {
  log('\n📝 Controleren en toevoegen van route...', 'cyan');
  
  const routesPath = path.join(rootDir, 'src', 'client', 'routes.jsx');
  
  if (!checkFileExists(routesPath, 'routes.jsx')) {
    return false;
  }
  
  try {
    let routesContent = fs.readFileSync(routesPath, 'utf8');
    
    // Controleer of de MarketResearchPage import al bestaat
    const importExists = checkStringInFile(
      routesPath, 
      "import MarketResearchPage", 
      "MarketResearchPage import"
    );
    
    // Controleer of de MarketResearchPage route al bestaat
    const routeExists = checkStringInFile(
      routesPath, 
      "path: '/market-research'", 
      "Market Research route"
    );
    
    if (importExists && routeExists) {
      log('✅ Market Research route is al geïntegreerd', 'green');
      return true;
    }
    
    // Voeg de import toe als deze nog niet bestaat
    if (!importExists) {
      // Zoek de laatste import
      const importRegex = /^import .+ from ['"].+['"];?\s*$/gm;
      const imports = [...routesContent.matchAll(importRegex)];
      
      if (imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const importEndIndex = lastImport.index + lastImport[0].length;
        
        // Voeg de nieuwe import toe na de laatste import
        routesContent = 
          routesContent.slice(0, importEndIndex) + 
          "\nimport MarketResearchPage from './components/market-research/MarketResearchPage';" + 
          routesContent.slice(importEndIndex);
        
        log('✅ MarketResearchPage import toegevoegd', 'green');
      } else {
        log('❌ Geen imports gevonden in routes.jsx', 'red');
        return false;
      }
    }
    
    // Voeg de route toe als deze nog niet bestaat
    if (!routeExists) {
      // Zoek de routes array
      const routesArrayRegex = /const\s+routes\s*=\s*\[([\s\S]*?)\];/;
      const routesArrayMatch = routesContent.match(routesArrayRegex);
      
      if (routesArrayMatch) {
        const routesArray = routesArrayMatch[1];
        const routesEndIndex = routesArrayMatch.index + routesArrayMatch[0].indexOf('];');
        
        // Nieuwe route
        const newRoute = `
  {
    path: '/market-research',
    element: <MarketResearchPage />,
    name: 'Market Research',
    icon: 'BarChartIcon'
  },`;
        
        // Voeg de nieuwe route toe aan de routes array
        routesContent = 
          routesContent.slice(0, routesEndIndex) + 
          newRoute + 
          routesContent.slice(routesEndIndex);
        
        log('✅ Market Research route toegevoegd', 'green');
      } else {
        log('❌ Routes array niet gevonden in routes.jsx', 'red');
        return false;
      }
    }
    
    // Schrijf de bijgewerkte inhoud terug naar het bestand
    fs.writeFileSync(routesPath, routesContent);
    log('✅ routes.jsx succesvol bijgewerkt', 'green');
    
    return true;
  } catch (error) {
    log(`❌ Fout bij het bijwerken van routes.jsx: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Controleer en maak de API client voor de Market Research Module
 */
function checkAndCreateApiClient() {
  log('\n📝 Controleren en aanmaken van API client...', 'cyan');
  
  const apiClientDir = path.join(rootDir, 'src', 'client', 'services');
  const apiClientPath = path.join(apiClientDir, 'market-research-api.js');
  
  // Maak de directory als deze nog niet bestaat
  if (!fs.existsSync(apiClientDir)) {
    try {
      fs.mkdirSync(apiClientDir, { recursive: true });
      log(`✅ ${apiClientDir} directory aangemaakt`, 'green');
    } catch (error) {
      log(`❌ Fout bij het aanmaken van ${apiClientDir}: ${error.message}`, 'red');
      return false;
    }
  }
  
  // Controleer of de API client al bestaat
  if (checkFileExists(apiClientPath, 'market-research-api.js')) {
    // Controleer of de API client alle benodigde endpoints bevat
    const hasAnalyzeEndpoint = checkStringInFile(
      apiClientPath, 
      "/market-research/analyze", 
      "analyze endpoint"
    );
    
    const hasInsightsEndpoint = checkStringInFile(
      apiClientPath, 
      "/market-research/insights", 
      "insights endpoint"
    );
    
    const hasReportsEndpoint = checkStringInFile(
      apiClientPath, 
      "/market-research/reports", 
      "reports endpoint"
    );
    
    if (hasAnalyzeEndpoint && hasInsightsEndpoint && hasReportsEndpoint) {
      log('✅ API client bevat alle benodigde endpoints', 'green');
      return true;
    }
    
    log('⚠️ API client mist enkele endpoints, wordt bijgewerkt...', 'yellow');
  }
  
  // Maak de API client aan of werk deze bij
  try {
    const apiClientContent = `/**
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
    const response = await axios.post(\`\${API_BASE_URL}/market-research/analyze\`, data);
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
    const response = await axios.post(\`\${API_BASE_URL}/market-research/insights\`, data);
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
    const response = await axios.post(\`\${API_BASE_URL}/market-research/price-analysis\`, data);
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
    const response = await axios.post(\`\${API_BASE_URL}/market-research/competitor-analysis\`, data);
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
    const response = await axios.post(\`\${API_BASE_URL}/market-research/gap-opportunities\`, data);
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
    const response = await axios.post(\`\${API_BASE_URL}/market-research/visualizations\`, data);
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
    const response = await axios.post(\`\${API_BASE_URL}/market-research/reports\`, data);
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
    const response = await axios.get(\`\${API_BASE_URL}/market-research/reports/\${reportId}\`);
    return response.data;
  } catch (error) {
    console.error(\`Error getting report \${reportId}:\`, error);
    throw error;
  }
}

/**
 * Haal alle marktonderzoeksrapporten op voor een gebruiker
 * @returns {Promise<Object>} - De opgevraagde rapporten
 */
export async function getAllReports() {
  try {
    const response = await axios.get(\`\${API_BASE_URL}/market-research/reports\`);
    return response.data;
  } catch (error) {
    console.error('Error getting all reports:', error);
    throw error;
  }
}
`;
    
    fs.writeFileSync(apiClientPath, apiClientContent);
    log('✅ API client succesvol aangemaakt/bijgewerkt', 'green');
    
    return true;
  } catch (error) {
    log(`❌ Fout bij het aanmaken/bijwerken van API client: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Controleer of de Market Research Module is geïntegreerd in de navigatie
 */
function checkNavigation() {
  log('\n📝 Controleren van navigatie integratie...', 'cyan');
  
  const navPath = path.join(rootDir, 'src', 'client', 'components', 'navigation', 'Sidebar.jsx');
  
  if (!checkFileExists(navPath, 'Sidebar.jsx')) {
    return false;
  }
  
  // Controleer of de Market Research route al in de navigatie staat
  return checkStringInFile(
    navPath, 
    "Market Research", 
    "Market Research in navigatie"
  );
}

/**
 * Controleer of de Market Research Module is geïntegreerd in de package.json
 */
function checkPackageJson() {
  log('\n📝 Controleren van package.json integratie...', 'cyan');
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (!checkFileExists(packageJsonPath, 'package.json')) {
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Controleer of de test:market-research script bestaat
    const hasTestScript = packageJson.scripts && packageJson.scripts['test:market-research'];
    
    if (hasTestScript) {
      log('✅ test:market-research script gevonden in package.json', 'green');
    } else {
      log('❌ test:market-research script niet gevonden in package.json', 'red');
      
      // Voeg het script toe
      if (packageJson.scripts) {
        packageJson.scripts['test:market-research'] = 'jest --testPathPattern=tests/unit/services/market-research';
        
        // Schrijf de bijgewerkte package.json terug
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        log('✅ test:market-research script toegevoegd aan package.json', 'green');
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ Fout bij het controleren/bijwerken van package.json: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Hoofdfunctie
 */
function main() {
  log('🚀 Market Research Module Integratie', 'magenta');
  log('================================\n', 'magenta');
  
  // Controleer benodigde bestanden
  log('🔍 Controleren van benodigde bestanden...', 'cyan');
  
  const serviceExists = checkFileExists(
    path.join(rootDir, 'src', 'services', 'market-research', 'market-research-service.js'),
    'market-research-service.js'
  );
  
  const controllerExists = checkFileExists(
    path.join(rootDir, 'src', 'api', 'controllers', 'market-research-controller.js'),
    'market-research-controller.js'
  );
  
  const routesExists = checkFileExists(
    path.join(rootDir, 'src', 'api', 'routes', 'market-research.js'),
    'market-research.js (routes)'
  );
  
  const pageExists = checkFileExists(
    path.join(rootDir, 'src', 'client', 'components', 'market-research', 'MarketResearchPage.jsx'),
    'MarketResearchPage.jsx'
  );
  
  if (!serviceExists || !controllerExists || !routesExists || !pageExists) {
    log('\n❌ Sommige benodigde bestanden ontbreken. Integratie kan niet worden voltooid.', 'red');
    return;
  }
  
  // Voeg de route toe aan routes.jsx
  const routeAdded = addRouteIfNotExists();
  
  // Controleer en maak de API client
  const apiClientCreated = checkAndCreateApiClient();
  
  // Controleer navigatie
  const navigationOk = checkNavigation();
  
  // Controleer package.json
  const packageJsonOk = checkPackageJson();
  
  // Toon samenvatting
  log('\n📋 Integratie Samenvatting', 'magenta');
  log('====================', 'magenta');
  log(`Route toegevoegd: ${routeAdded ? '✅' : '❌'}`, routeAdded ? 'green' : 'red');
  log(`API client aangemaakt/bijgewerkt: ${apiClientCreated ? '✅' : '❌'}`, apiClientCreated ? 'green' : 'red');
  log(`Navigatie integratie: ${navigationOk ? '✅' : '❌'}`, navigationOk ? 'green' : 'red');
  log(`Package.json integratie: ${packageJsonOk ? '✅' : '❌'}`, packageJsonOk ? 'green' : 'red');
  
  // Bereken totale resultaat
  const allOk = routeAdded && apiClientCreated && navigationOk && packageJsonOk;
  
  // Toon conclusie
  if (allOk) {
    log('\n✅ Integratie voltooid! De Market Research Module is volledig geïntegreerd.', 'green');
  } else {
    log('\n⚠️ Integratie onvolledig. Zie de samenvatting hierboven.', 'yellow');
  }
  
  // Toon volgende stappen
  log('\n📝 Volgende Stappen', 'cyan');
  
  if (!navigationOk) {
    log('1. Voeg de Market Research route toe aan de navigatie in Sidebar.jsx', 'yellow');
  }
  
  log(`${!navigationOk ? '2' : '1'}. Start de server met: node scripts/start-market-research-server.js`, 'yellow');
  log(`${!navigationOk ? '3' : '2'}. Test de API met: node scripts/test-market-research-api.js`, 'yellow');
  log(`${!navigationOk ? '4' : '3'}. Test de frontend met: node scripts/test-market-research-frontend.js`, 'yellow');
}

// Voer het script uit
main();
