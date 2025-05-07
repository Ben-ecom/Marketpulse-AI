// Script om Edge Functions te deployen naar Supabase
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Laad environment variables
dotenv.config();

// Controleer of de vereiste omgevingsvariabelen zijn ingesteld
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Ontbrekende omgevingsvariabelen: ${missingEnvVars.join(', ')}`);
  console.error('Maak een .env bestand aan met de vereiste variabelen of stel ze in via de command line.');
  process.exit(1);
}

// Functie om een Edge Function te deployen
function deployEdgeFunction(functionName) {
  try {
    // Controleer of de functie directory bestaat
    const functionDir = path.resolve(`./supabase/functions/${functionName}`);
    if (!fs.existsSync(functionDir)) {
      console.error(`Edge Function directory niet gevonden: ${functionDir}`);
      process.exit(1);
    }

    console.log(`Deploying Edge Function: ${functionName}...`);
    
    // Voer het Supabase CLI commando uit om de functie te deployen
    // Opmerking: Dit vereist dat de Supabase CLI is geïnstalleerd en geconfigureerd
    const command = `npx supabase functions deploy ${functionName} --project-ref=iyeyypnvcickhdlqvhqq`;
    
    // Voer het commando uit en toon de output
    const output = execSync(command, { stdio: 'inherit' });
    
    console.log(`Edge Function ${functionName} succesvol gedeployed!`);
    return true;
  } catch (error) {
    console.error(`Fout bij deployen van Edge Function ${functionName}:`);
    console.error(error.message);
    return false;
  }
}

// Functie om alle Edge Functions te deployen
function deployAllEdgeFunctions() {
  const functionsDir = path.resolve('./supabase/functions');
  
  // Controleer of de functions directory bestaat
  if (!fs.existsSync(functionsDir)) {
    console.error(`Edge Functions directory niet gevonden: ${functionsDir}`);
    process.exit(1);
  }
  
  // Lees alle subdirectories in de functions directory
  const functionNames = fs.readdirSync(functionsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (functionNames.length === 0) {
    console.error('Geen Edge Functions gevonden om te deployen.');
    process.exit(1);
  }
  
  console.log(`Gevonden Edge Functions: ${functionNames.join(', ')}`);
  
  // Deploy elke functie
  let successCount = 0;
  for (const functionName of functionNames) {
    const success = deployEdgeFunction(functionName);
    if (success) {
      successCount++;
    }
  }
  
  console.log(`${successCount} van ${functionNames.length} Edge Functions succesvol gedeployed.`);
}

// Verwerk command line argumenten
const args = process.argv.slice(2);
if (args.length === 0) {
  // Als geen argumenten zijn opgegeven, deploy alle functies
  deployAllEdgeFunctions();
} else {
  // Anders deploy alleen de opgegeven functie
  const functionName = args[0];
  deployEdgeFunction(functionName);
}
