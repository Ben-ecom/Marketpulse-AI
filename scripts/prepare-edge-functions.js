/**
 * Prepare Edge Functions for Deployment
 * 
 * Dit script bereidt de Edge Functions voor op handmatige deployment naar Supabase.
 * Het maakt een ZIP-bestand van elke Edge Function die kan worden geüpload naar
 * de Supabase dashboard.
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

// Controleer of archiver is geïnstalleerd, zo niet, installeer het
try {
  require.resolve('archiver');
} catch (e) {
  console.log('Archiver package niet gevonden, wordt geïnstalleerd...');
  execSync('npm install archiver', { stdio: 'inherit' });
}

// Pad naar de Edge Functions
const functionsDir = path.join(__dirname, '..', 'supabase', 'functions');
// Pad naar de output directory
const outputDir = path.join(__dirname, '..', 'dist', 'edge-functions');

// Maak output directory als deze niet bestaat
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Functie om een ZIP-bestand te maken van een Edge Function
function zipFunction(functionName) {
  const functionDir = path.join(functionsDir, functionName);
  const outputFile = path.join(outputDir, `${functionName}.zip`);
  
  // Controleer of de functie directory bestaat
  if (!fs.existsSync(functionDir)) {
    console.error(`Edge Function '${functionName}' niet gevonden in ${functionsDir}`);
    return false;
  }
  
  // Maak een ZIP-bestand
  const output = fs.createWriteStream(outputFile);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximale compressie
  });
  
  // Luister naar eventuele fouten
  output.on('close', () => {
    console.log(`Edge Function '${functionName}' succesvol voorbereid: ${outputFile}`);
    console.log(`Bestandsgrootte: ${archive.pointer()} bytes`);
  });
  
  archive.on('error', (err) => {
    console.error(`Fout bij het maken van ZIP-bestand voor '${functionName}':`, err);
    return false;
  });
  
  // Koppel het archief aan de output stream
  archive.pipe(output);
  
  // Voeg alle bestanden in de functie directory toe aan het archief
  archive.directory(functionDir, false);
  
  // Finaliseer het archief
  archive.finalize();
  
  return true;
}

// Lees alle Edge Functions
const functions = fs.readdirSync(functionsDir)
  .filter(item => fs.statSync(path.join(functionsDir, item)).isDirectory());

if (functions.length === 0) {
  console.error(`Geen Edge Functions gevonden in ${functionsDir}`);
  process.exit(1);
}

console.log(`Gevonden Edge Functions: ${functions.join(', ')}`);

// Bereid elke Edge Function voor
let successCount = 0;
for (const functionName of functions) {
  if (zipFunction(functionName)) {
    successCount++;
  }
}

console.log(`\n${successCount} van ${functions.length} Edge Functions succesvol voorbereid.`);

// Genereer instructies voor handmatige deployment
console.log('\n=== INSTRUCTIES VOOR HANDMATIGE DEPLOYMENT ===');
console.log('1. Log in op de Supabase dashboard: https://app.supabase.io');
console.log('2. Selecteer je project');
console.log('3. Ga naar "Edge Functions" in het linker menu');
console.log('4. Klik op "New Function" of "Create Function"');
console.log('5. Voor elke functie:');
console.log('   a. Geef de functie dezelfde naam als de directory');
console.log('   b. Upload het ZIP-bestand uit de dist/edge-functions directory');
console.log('   c. Stel de omgevingsvariabelen in (indien nodig)');
console.log('6. Klik op "Deploy" of "Create"');
console.log('\nDe volgende omgevingsvariabelen moeten worden ingesteld:');
console.log('- SUPABASE_URL: De URL van je Supabase project');
console.log('- SUPABASE_SERVICE_ROLE_KEY: De service role key van je Supabase project');
console.log('\nZIP-bestanden zijn opgeslagen in:', outputDir);
