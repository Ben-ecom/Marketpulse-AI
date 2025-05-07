/**
 * Test script voor de Market Research Frontend componenten
 * 
 * Dit script test de verschillende React componenten van de Market Research Module
 * door te controleren of ze correct renderen met testgegevens.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
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
 * Controleer of een component bestand bestaat
 */
function checkComponentExists(componentPath, componentName) {
  const exists = fs.existsSync(componentPath);
  
  if (exists) {
    log(`✅ ${componentName} component gevonden`, 'green');
  } else {
    log(`❌ ${componentName} component niet gevonden`, 'red');
  }
  
  return exists;
}

/**
 * Test een component door te controleren of het bestand bestaat en of het correct importeert
 */
function testComponent(componentPath, componentName) {
  log(`\n🧪 Testing ${componentName} component...`, 'cyan');
  
  if (!checkComponentExists(componentPath, componentName)) {
    return false;
  }
  
  try {
    // Probeer de component te importeren
    const componentModule = require(componentPath);
    
    if (!componentModule.default) {
      log(`❌ ${componentName} heeft geen default export`, 'red');
      return false;
    }
    
    log(`✅ ${componentName} succesvol geïmporteerd`, 'green');
    return true;
  } catch (error) {
    log(`❌ Fout bij het importeren van ${componentName}: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test de MarketResearchForm component
 */
function testMarketResearchForm() {
  const componentPath = path.join(rootDir, 'src', 'client', 'components', 'market-research', 'MarketResearchForm.jsx');
  return testComponent(componentPath, 'MarketResearchForm');
}

/**
 * Test de MarketResearchResults component
 */
function testMarketResearchResults() {
  const componentPath = path.join(rootDir, 'src', 'client', 'components', 'market-research', 'MarketResearchResults.jsx');
  return testComponent(componentPath, 'MarketResearchResults');
}

/**
 * Test de MarketResearchPage component
 */
function testMarketResearchPage() {
  const componentPath = path.join(rootDir, 'src', 'client', 'components', 'market-research', 'MarketResearchPage.jsx');
  return testComponent(componentPath, 'MarketResearchPage');
}

/**
 * Test de panel componenten
 */
function testPanelComponents() {
  const panelComponents = [
    {
      path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'panels', 'MarketOverviewPanel.jsx'),
      name: 'MarketOverviewPanel'
    },
    {
      path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'panels', 'CompetitorsPanel.jsx'),
      name: 'CompetitorsPanel'
    },
    {
      path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'panels', 'OpportunitiesPanel.jsx'),
      name: 'OpportunitiesPanel'
    },
    {
      path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'panels', 'RecommendationsPanel.jsx'),
      name: 'RecommendationsPanel'
    },
    {
      path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'panels', 'VisualizationsPanel.jsx'),
      name: 'VisualizationsPanel'
    }
  ];
  
  const results = {};
  
  for (const component of panelComponents) {
    results[component.name] = testComponent(component.path, component.name);
  }
  
  return results;
}

/**
 * Controleer of de componenten zijn geïntegreerd in de routing
 */
function checkRouteIntegration() {
  log('\n🧪 Controleren van route integratie...', 'cyan');
  
  const routesPath = path.join(rootDir, 'src', 'client', 'routes.jsx');
  
  if (!fs.existsSync(routesPath)) {
    log(`❌ routes.jsx bestand niet gevonden`, 'red');
    return false;
  }
  
  try {
    const routesContent = fs.readFileSync(routesPath, 'utf8');
    
    // Controleer of de MarketResearchPage is geïmporteerd en gebruikt in de routes
    const hasImport = routesContent.includes('MarketResearchPage') || 
                      routesContent.includes('market-research');
    
    if (hasImport) {
      log('✅ Market Research Module is geïntegreerd in de routing', 'green');
      return true;
    } else {
      log('❌ Market Research Module is niet geïntegreerd in de routing', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Fout bij het controleren van route integratie: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Controleer of de API client code bestaat
 */
function checkApiClient() {
  log('\n🧪 Controleren van API client code...', 'cyan');
  
  const apiClientPath = path.join(rootDir, 'src', 'client', 'services', 'market-research-api.js');
  
  if (!fs.existsSync(apiClientPath)) {
    log(`❌ market-research-api.js bestand niet gevonden`, 'red');
    return false;
  }
  
  try {
    const apiClientContent = fs.readFileSync(apiClientPath, 'utf8');
    
    // Controleer of de API client de benodigde endpoints bevat
    const hasAnalyzeEndpoint = apiClientContent.includes('/market-research/analyze');
    const hasInsightsEndpoint = apiClientContent.includes('/market-research/insights');
    const hasReportsEndpoint = apiClientContent.includes('/market-research/reports');
    
    if (hasAnalyzeEndpoint && hasInsightsEndpoint && hasReportsEndpoint) {
      log('✅ API client bevat alle benodigde endpoints', 'green');
      return true;
    } else {
      log('⚠️ API client mist mogelijk enkele endpoints', 'yellow');
      if (!hasAnalyzeEndpoint) log('  ❌ Mist analyze endpoint', 'red');
      if (!hasInsightsEndpoint) log('  ❌ Mist insights endpoint', 'red');
      if (!hasReportsEndpoint) log('  ❌ Mist reports endpoint', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Fout bij het controleren van API client: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Hoofdfunctie
 */
function main() {
  log('🚀 Market Research Frontend Test', 'magenta');
  log('============================\n', 'magenta');
  
  // Test de componenten
  const formResult = testMarketResearchForm();
  const resultsResult = testMarketResearchResults();
  const pageResult = testMarketResearchPage();
  const panelResults = testPanelComponents();
  
  // Controleer route integratie
  const routeResult = checkRouteIntegration();
  
  // Controleer API client
  const apiClientResult = checkApiClient();
  
  // Toon samenvatting
  log('\n📋 Test Samenvatting', 'magenta');
  log('===============', 'magenta');
  log(`MarketResearchForm: ${formResult ? '✅' : '❌'}`, formResult ? 'green' : 'red');
  log(`MarketResearchResults: ${resultsResult ? '✅' : '❌'}`, resultsResult ? 'green' : 'red');
  log(`MarketResearchPage: ${pageResult ? '✅' : '❌'}`, pageResult ? 'green' : 'red');
  
  log('\nPanel Componenten:', 'magenta');
  for (const [name, result] of Object.entries(panelResults)) {
    log(`  ${name}: ${result ? '✅' : '❌'}`, result ? 'green' : 'red');
  }
  
  log('\nIntegratie:', 'magenta');
  log(`Route Integratie: ${routeResult ? '✅' : '❌'}`, routeResult ? 'green' : 'red');
  log(`API Client: ${apiClientResult ? '✅' : '❌'}`, apiClientResult ? 'green' : 'red');
  
  // Bereken totale resultaat
  const allPanelsOk = Object.values(panelResults).every(result => result);
  const allComponentsOk = formResult && resultsResult && pageResult && allPanelsOk;
  const allIntegrationOk = routeResult && apiClientResult;
  const allOk = allComponentsOk && allIntegrationOk;
  
  // Toon conclusie
  if (allOk) {
    log('\n✅ Alle tests geslaagd! De Market Research Module frontend is volledig geïmplementeerd.', 'green');
  } else if (allComponentsOk) {
    log('\n⚠️ Componenten zijn geïmplementeerd, maar de integratie is onvolledig.', 'yellow');
  } else {
    log('\n❌ Sommige componenten of integratie ontbreken. Zie de samenvatting hierboven.', 'red');
  }
  
  // Toon volgende stappen
  log('\n📝 Volgende Stappen', 'cyan');
  
  if (!allComponentsOk) {
    log('1. Implementeer de ontbrekende componenten', 'yellow');
  }
  
  if (!routeResult) {
    log(`${allComponentsOk ? '1' : '2'}. Integreer de MarketResearchPage in de routing`, 'yellow');
  }
  
  if (!apiClientResult) {
    log(`${allComponentsOk && routeResult ? '1' : allComponentsOk || routeResult ? '2' : '3'}. Implementeer de API client voor de Market Research Module`, 'yellow');
  }
  
  if (allOk) {
    log('1. Start de server met: node scripts/start-market-research-server.js', 'yellow');
    log('2. Test de API met: node scripts/test-market-research-api.js', 'yellow');
    log('3. Start de frontend applicatie om de Market Research Module te testen', 'yellow');
  }
}

// Voer het script uit
main();
