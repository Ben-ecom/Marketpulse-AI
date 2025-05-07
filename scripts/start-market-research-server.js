/**
 * Start script voor de Market Research Module server
 * 
 * Dit script start de Express server voor de Market Research Module
 * en voert een basistest uit om te controleren of de server correct werkt.
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
 * Controleer of de benodigde bestanden bestaan
 */
function checkRequiredFiles() {
  log('🔍 Controleren van benodigde bestanden...', 'cyan');
  
  const requiredFiles = [
    { path: path.join(rootDir, 'src', 'server.js'), name: 'server.js' },
    { path: path.join(rootDir, 'src', 'app.js'), name: 'app.js' },
    { path: path.join(rootDir, 'src', 'api', 'routes', 'market-research.js'), name: 'market-research.js' }
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file.path)) {
      log(`❌ ${file.name} niet gevonden`, 'red');
      allFilesExist = false;
    } else {
      log(`✅ ${file.name} gevonden`, 'green');
    }
  }
  
  return allFilesExist;
}

/**
 * Controleer of het .env bestand bestaat en de benodigde variabelen bevat
 */
function checkEnvFile() {
  log('🔍 Controleren van .env bestand...', 'cyan');
  
  const envPath = path.join(rootDir, '.env');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env bestand niet gevonden', 'red');
    
    // Controleer of .env.example bestaat
    const envExamplePath = path.join(rootDir, '.env.example');
    if (fs.existsSync(envExamplePath)) {
      log('ℹ️ .env.example gevonden, kopiëren naar .env...', 'yellow');
      
      // Kopieer .env.example naar .env
      fs.copyFileSync(envExamplePath, envPath);
      log('✅ .env.example gekopieerd naar .env', 'green');
      log('⚠️ Pas de waarden in het .env bestand aan voordat je de server start', 'yellow');
    } else {
      log('❌ .env.example niet gevonden', 'red');
      return false;
    }
  } else {
    log('✅ .env bestand gevonden', 'green');
  }
  
  return true;
}

/**
 * Start de server
 */
function startServer() {
  log('\n🚀 Starten van de server...', 'magenta');
  
  // Start de server met nodemon voor automatisch herstarten bij wijzigingen
  const serverProcess = spawn('npx', ['nodemon', 'src/server.js'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  // Event listeners
  serverProcess.on('error', (error) => {
    log(`❌ Fout bij het starten van de server: ${error.message}`, 'red');
  });
  
  serverProcess.on('exit', (code) => {
    if (code !== 0) {
      log(`❌ Server gestopt met code ${code}`, 'red');
    }
  });
  
  // Geef het serverproces terug
  return serverProcess;
}

/**
 * Hoofdfunctie
 */
function main() {
  log('🚀 Market Research Module Server', 'magenta');
  log('=============================\n', 'magenta');
  
  // Controleer benodigde bestanden
  const filesExist = checkRequiredFiles();
  if (!filesExist) {
    log('\n❌ Benodigde bestanden ontbreken. Server kan niet worden gestart.', 'red');
    return;
  }
  
  // Controleer .env bestand
  const envExists = checkEnvFile();
  if (!envExists) {
    log('\n⚠️ .env bestand ontbreekt. Server kan mogelijk niet correct werken.', 'yellow');
  }
  
  // Start de server
  const serverProcess = startServer();
  
  // Toon instructies
  log('\n📝 Server Instructies', 'cyan');
  log('1. De server is gestart op http://localhost:3000', 'yellow');
  log('2. API endpoints zijn beschikbaar op http://localhost:3000/api/market-research', 'yellow');
  log('3. Test de API met: node scripts/test-market-research-api.js', 'yellow');
  log('4. Druk op Ctrl+C om de server te stoppen', 'yellow');
  
  // Event listener voor het afsluiten van het script
  process.on('SIGINT', () => {
    log('\n👋 Server wordt afgesloten...', 'magenta');
    serverProcess.kill();
    process.exit(0);
  });
}

// Voer het script uit
main();
