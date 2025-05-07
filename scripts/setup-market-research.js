/**
 * Setup script voor de Market Research Module
 * 
 * Dit script controleert of alle benodigde bestanden en afhankelijkheden aanwezig zijn
 * en installeert de benodigde dependencies voor de Market Research Module.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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
 * Controleer of een directory bestaat
 */
function checkDirectoryExists(dirPath, displayPath = null) {
  const exists = fs.existsSync(dirPath);
  const displayName = displayPath || dirPath;
  
  if (exists) {
    log(`✅ ${displayName} directory gevonden`, 'green');
  } else {
    log(`❌ ${displayName} directory niet gevonden`, 'red');
  }
  
  return exists;
}

/**
 * Installeer dependencies
 */
function installDependencies() {
  log('\n📦 Installeren van dependencies...', 'cyan');
  
  try {
    execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
    log('✅ Dependencies succesvol geïnstalleerd', 'green');
    return true;
  } catch (error) {
    log(`❌ Fout bij het installeren van dependencies: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Controleer de Supabase configuratie
 */
function checkSupabaseConfig() {
  log('\n🔍 Controleren van Supabase configuratie...', 'cyan');
  
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');
  
  if (!checkFileExists(envPath, '.env')) {
    if (checkFileExists(envExamplePath, '.env.example')) {
      log('ℹ️ .env bestand niet gevonden, maar .env.example is aanwezig', 'yellow');
      log('ℹ️ Maak een kopie van .env.example naar .env en vul de benodigde waarden in', 'yellow');
    } else {
      log('❌ Zowel .env als .env.example zijn niet gevonden', 'red');
    }
    return false;
  }
  
  // Lees .env bestand
  const envContent = fs.readFileSync(envPath, 'utf8');
  const supabaseUrl = envContent.match(/SUPABASE_URL=(.+)/);
  const supabaseKey = envContent.match(/SUPABASE_SERVICE_KEY=(.+)/);
  
  if (!supabaseUrl || !supabaseKey) {
    log('❌ SUPABASE_URL en/of SUPABASE_SERVICE_KEY niet gevonden in .env bestand', 'red');
    return false;
  }
  
  log('✅ Supabase configuratie gevonden in .env bestand', 'green');
  return true;
}

/**
 * Controleer de benodigde bestanden voor de Market Research Module
 */
function checkMarketResearchFiles() {
  log('\n🔍 Controleren van Market Research bestanden...', 'cyan');
  
  const files = [
    { path: path.join(rootDir, 'src', 'services', 'market-research', 'market-research-service.js'), display: 'src/services/market-research/market-research-service.js' },
    { path: path.join(rootDir, 'src', 'services', 'market-research', 'components', 'price-analyzer.js'), display: 'src/services/market-research/components/price-analyzer.js' },
    { path: path.join(rootDir, 'src', 'services', 'market-research', 'components', 'competitor-analyzer.js'), display: 'src/services/market-research/components/competitor-analyzer.js' },
    { path: path.join(rootDir, 'src', 'services', 'market-research', 'components', 'gap-opportunity-identifier.js'), display: 'src/services/market-research/components/gap-opportunity-identifier.js' },
    { path: path.join(rootDir, 'src', 'api', 'routes', 'market-research.js'), display: 'src/api/routes/market-research.js' },
    { path: path.join(rootDir, 'src', 'api', 'controllers', 'market-research-controller.js'), display: 'src/api/controllers/market-research-controller.js' },
    { path: path.join(rootDir, 'src', 'api', 'middleware', 'auth.js'), display: 'src/api/middleware/auth.js' },
    { path: path.join(rootDir, 'src', 'api', 'middleware', 'validators.js'), display: 'src/api/middleware/validators.js' },
    { path: path.join(rootDir, 'src', 'utils', 'supabase.js'), display: 'src/utils/supabase.js' },
    { path: path.join(rootDir, 'src', 'server.js'), display: 'src/server.js' },
    { path: path.join(rootDir, 'src', 'app.js'), display: 'src/app.js' }
  ];
  
  const directories = [
    { path: path.join(rootDir, 'src', 'client', 'components', 'market-research'), display: 'src/client/components/market-research' },
    { path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'panels'), display: 'src/client/components/market-research/panels' }
  ];
  
  let allFilesExist = true;
  let allDirectoriesExist = true;
  
  // Controleer bestanden
  for (const file of files) {
    if (!checkFileExists(file.path, file.display)) {
      allFilesExist = false;
    }
  }
  
  // Controleer directories
  for (const dir of directories) {
    if (!checkDirectoryExists(dir.path, dir.display)) {
      allDirectoriesExist = false;
    }
  }
  
  return allFilesExist && allDirectoriesExist;
}

/**
 * Controleer de frontend componenten
 */
function checkFrontendComponents() {
  log('\n🔍 Controleren van frontend componenten...', 'cyan');
  
  const components = [
    { path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'MarketResearchPage.jsx'), display: 'MarketResearchPage.jsx' },
    { path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'MarketResearchForm.jsx'), display: 'MarketResearchForm.jsx' },
    { path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'MarketResearchResults.jsx'), display: 'MarketResearchResults.jsx' },
    { path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'panels', 'MarketOverviewPanel.jsx'), display: 'panels/MarketOverviewPanel.jsx' },
    { path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'panels', 'CompetitorsPanel.jsx'), display: 'panels/CompetitorsPanel.jsx' },
    { path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'panels', 'OpportunitiesPanel.jsx'), display: 'panels/OpportunitiesPanel.jsx' },
    { path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'panels', 'RecommendationsPanel.jsx'), display: 'panels/RecommendationsPanel.jsx' },
    { path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'panels', 'VisualizationsPanel.jsx'), display: 'panels/VisualizationsPanel.jsx' }
  ];
  
  let allComponentsExist = true;
  
  for (const component of components) {
    if (!checkFileExists(component.path, component.display)) {
      allComponentsExist = false;
    }
  }
  
  return allComponentsExist;
}

/**
 * Controleer de test bestanden
 */
function checkTestFiles() {
  log('\n🔍 Controleren van test bestanden...', 'cyan');
  
  const testFiles = [
    { path: path.join(rootDir, 'tests', 'unit', 'services', 'market-research', 'price-analyzer.test.js'), display: 'tests/unit/services/market-research/price-analyzer.test.js' },
    { path: path.join(rootDir, 'tests', 'unit', 'services', 'market-research', 'competitor-analyzer.test.js'), display: 'tests/unit/services/market-research/competitor-analyzer.test.js' },
    { path: path.join(rootDir, 'tests', 'unit', 'services', 'market-research', 'gap-opportunity-identifier.test.js'), display: 'tests/unit/services/market-research/gap-opportunity-identifier.test.js' },
    { path: path.join(rootDir, 'scripts', 'test-market-research-api.js'), display: 'scripts/test-market-research-api.js' }
  ];
  
  let allTestFilesExist = true;
  
  for (const file of testFiles) {
    if (!checkFileExists(file.path, file.display)) {
      allTestFilesExist = false;
    }
  }
  
  return allTestFilesExist;
}

/**
 * Hoofdfunctie
 */
function main() {
  log('🚀 Market Research Module Setup', 'magenta');
  log('===============================\n', 'magenta');
  
  // Controleer package.json
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!checkFileExists(packageJsonPath, 'package.json')) {
    log('❌ Setup kan niet doorgaan zonder package.json', 'red');
    return;
  }
  
  // Controleer bestanden
  const filesExist = checkMarketResearchFiles();
  const frontendComponentsExist = checkFrontendComponents();
  const testFilesExist = checkTestFiles();
  const supabaseConfigured = checkSupabaseConfig();
  
  // Installeer dependencies
  const dependenciesInstalled = installDependencies();
  
  // Toon samenvatting
  log('\n📋 Setup Samenvatting', 'magenta');
  log('=================', 'magenta');
  log(`Backend bestanden: ${filesExist ? '✅' : '❌'}`, filesExist ? 'green' : 'red');
  log(`Frontend componenten: ${frontendComponentsExist ? '✅' : '❌'}`, frontendComponentsExist ? 'green' : 'red');
  log(`Test bestanden: ${testFilesExist ? '✅' : '❌'}`, testFilesExist ? 'green' : 'red');
  log(`Supabase configuratie: ${supabaseConfigured ? '✅' : '❌'}`, supabaseConfigured ? 'green' : 'red');
  log(`Dependencies geïnstalleerd: ${dependenciesInstalled ? '✅' : '❌'}`, dependenciesInstalled ? 'green' : 'red');
  
  // Toon volgende stappen
  log('\n📝 Volgende Stappen', 'cyan');
  
  if (!supabaseConfigured) {
    log('1. Maak een .env bestand aan met de juiste Supabase configuratie', 'yellow');
  }
  
  log(`${supabaseConfigured ? '1' : '2'}. Start de server met: npm run dev`, 'yellow');
  log(`${supabaseConfigured ? '2' : '3'}. Test de API met: node scripts/test-market-research-api.js`, 'yellow');
  
  if (filesExist && frontendComponentsExist && dependenciesInstalled && supabaseConfigured) {
    log('\n✅ Setup voltooid! De Market Research Module is klaar voor gebruik.', 'green');
  } else {
    log('\n⚠️ Setup onvolledig. Los de bovenstaande problemen op voordat je verder gaat.', 'yellow');
  }
}

// Voer het script uit
main();
