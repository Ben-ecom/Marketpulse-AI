/**
 * Run script voor de Market Research Module
 * 
 * Dit script voert de volgende stappen uit:
 * 1. Controleert of alle benodigde bestanden aanwezig zijn
 * 2. Integreert de Market Research Module in de hoofdapplicatie
 * 3. Start de server
 * 4. Voert tests uit op de API en frontend
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
 * Voer een commando uit en wacht op voltooiing
 */
function executeCommand(command, args, cwd = rootDir) {
  return new Promise((resolve, reject) => {
    log(`🔄 Uitvoeren van: ${command} ${args.join(' ')}`, 'blue');
    
    const process = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Commando faalde met code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
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
 * Controleer of alle benodigde bestanden aanwezig zijn
 */
function checkRequiredFiles() {
  log('🔍 Controleren van benodigde bestanden...', 'cyan');
  
  const requiredFiles = [
    { path: path.join(rootDir, 'src', 'services', 'market-research', 'market-research-service.js'), name: 'market-research-service.js' },
    { path: path.join(rootDir, 'src', 'api', 'controllers', 'market-research-controller.js'), name: 'market-research-controller.js' },
    { path: path.join(rootDir, 'src', 'api', 'routes', 'market-research.js'), name: 'market-research.js' },
    { path: path.join(rootDir, 'src', 'client', 'components', 'market-research', 'MarketResearchPage.jsx'), name: 'MarketResearchPage.jsx' },
    { path: path.join(rootDir, 'scripts', 'setup-market-research.js'), name: 'setup-market-research.js' },
    { path: path.join(rootDir, 'scripts', 'integrate-market-research.js'), name: 'integrate-market-research.js' },
    { path: path.join(rootDir, 'scripts', 'test-market-research-api.js'), name: 'test-market-research-api.js' },
    { path: path.join(rootDir, 'scripts', 'test-market-research-frontend.js'), name: 'test-market-research-frontend.js' }
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (!checkFileExists(file.path, file.name)) {
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

/**
 * Voer de setup uit
 */
async function runSetup() {
  log('\n🔧 Uitvoeren van setup...', 'magenta');
  
  try {
    await executeCommand('node', ['scripts/setup-market-research.js']);
    log('✅ Setup voltooid', 'green');
    return true;
  } catch (error) {
    log(`❌ Fout bij setup: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Voer de integratie uit
 */
async function runIntegration() {
  log('\n🔄 Uitvoeren van integratie...', 'magenta');
  
  try {
    await executeCommand('node', ['scripts/integrate-market-research.js']);
    log('✅ Integratie voltooid', 'green');
    return true;
  } catch (error) {
    log(`❌ Fout bij integratie: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Start de server
 */
function startServer() {
  log('\n🚀 Starten van de server...', 'magenta');
  
  return spawn('node', ['scripts/start-market-research-server.js'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
}

/**
 * Voer de API tests uit
 */
async function runApiTests() {
  log('\n🧪 Uitvoeren van API tests...', 'magenta');
  
  try {
    await executeCommand('node', ['scripts/test-market-research-api.js']);
    log('✅ API tests voltooid', 'green');
    return true;
  } catch (error) {
    log(`❌ Fout bij API tests: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Voer de frontend tests uit
 */
async function runFrontendTests() {
  log('\n🧪 Uitvoeren van frontend tests...', 'magenta');
  
  try {
    await executeCommand('node', ['scripts/test-market-research-frontend.js']);
    log('✅ Frontend tests voltooid', 'green');
    return true;
  } catch (error) {
    log(`❌ Fout bij frontend tests: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Hoofdfunctie
 */
async function main() {
  log('🚀 Market Research Module Runner', 'magenta');
  log('============================\n', 'magenta');
  
  // Controleer benodigde bestanden
  const filesExist = checkRequiredFiles();
  if (!filesExist) {
    log('\n❌ Sommige benodigde bestanden ontbreken. Proces kan niet worden voltooid.', 'red');
    return;
  }
  
  // Voer de setup uit
  const setupOk = await runSetup();
  if (!setupOk) {
    log('\n⚠️ Setup niet volledig. Wil je toch doorgaan? (y/n)', 'yellow');
    // In een echt script zou hier gebruikersinvoer worden verwerkt
  }
  
  // Voer de integratie uit
  const integrationOk = await runIntegration();
  if (!integrationOk) {
    log('\n⚠️ Integratie niet volledig. Wil je toch doorgaan? (y/n)', 'yellow');
    // In een echt script zou hier gebruikersinvoer worden verwerkt
  }
  
  // Start de server
  const serverProcess = startServer();
  
  // Wacht even om de server te laten opstarten
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Voer de API tests uit
  const apiTestsOk = await runApiTests();
  
  // Voer de frontend tests uit
  const frontendTestsOk = await runFrontendTests();
  
  // Toon samenvatting
  log('\n📋 Samenvatting', 'magenta');
  log('===========', 'magenta');
  log(`Setup: ${setupOk ? '✅' : '❌'}`, setupOk ? 'green' : 'red');
  log(`Integratie: ${integrationOk ? '✅' : '❌'}`, integrationOk ? 'green' : 'red');
  log(`API Tests: ${apiTestsOk ? '✅' : '❌'}`, apiTestsOk ? 'green' : 'red');
  log(`Frontend Tests: ${frontendTestsOk ? '✅' : '❌'}`, frontendTestsOk ? 'green' : 'red');
  
  // Bereken totale resultaat
  const allOk = setupOk && integrationOk && apiTestsOk && frontendTestsOk;
  
  // Toon conclusie
  if (allOk) {
    log('\n✅ Alle tests geslaagd! De Market Research Module is volledig geïmplementeerd en geïntegreerd.', 'green');
  } else {
    log('\n⚠️ Sommige tests zijn mislukt. Zie de samenvatting hierboven.', 'yellow');
  }
  
  log('\n📝 Volgende Stappen', 'cyan');
  log('1. De server draait op http://localhost:3000', 'yellow');
  log('2. Navigeer naar de Market Research pagina om de module te gebruiken', 'yellow');
  log('3. Druk op Ctrl+C om de server te stoppen', 'yellow');
  
  // Event listener voor het afsluiten van het script
  process.on('SIGINT', () => {
    log('\n👋 Server wordt afgesloten...', 'magenta');
    serverProcess.kill();
    process.exit(0);
  });
}

// Voer het script uit
main().catch(error => {
  log(`\n❌ Onverwachte fout: ${error.message}`, 'red');
});
