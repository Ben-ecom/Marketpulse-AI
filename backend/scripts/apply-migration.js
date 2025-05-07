/**
 * Script voor het direct toepassen van een migratie op de Supabase database
 * Dit script gebruikt de Supabase CLI om een SQL-bestand uit te voeren op de database
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// ES modules equivalent van __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Maak een readline interface voor gebruikersinvoer
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Controleer of een migratiebestand is opgegeven
if (process.argv.length < 3) {
  console.error('Gebruik: node apply-migration.js <pad-naar-migratie-bestand>');
  process.exit(1);
}

const migrationFilePath = process.argv[2];

// Controleer of het migratiebestand bestaat
if (!fs.existsSync(migrationFilePath)) {
  console.error(`Fout: Migratiebestand '${migrationFilePath}' bestaat niet`);
  process.exit(1);
}

// Lees het migratiebestand
const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');

// Vraag de gebruiker om de Supabase project ID
rl.question('Voer je Supabase project ID in: ', (projectId) => {
  if (!projectId) {
    console.error('Fout: Supabase project ID is vereist');
    rl.close();
    process.exit(1);
  }

  // Maak een tijdelijk SQL-bestand
  const tempFilePath = path.join(__dirname, 'temp-migration.sql');
  fs.writeFileSync(tempFilePath, migrationSQL);

  console.log(`Migratie uitvoeren: ${path.basename(migrationFilePath)}`);
  
  // Voer de migratie uit met de Supabase CLI
  const command = `npx supabase db push --db-url postgresql://postgres:postgres@localhost:54322/postgres --project-id ${projectId} --file ${tempFilePath}`;
  
  exec(command, (error, stdout, stderr) => {
    // Verwijder het tijdelijke bestand
    fs.unlinkSync(tempFilePath);
    
    if (error) {
      console.error(`Fout bij uitvoeren van migratie: ${error.message}`);
      console.error('Zorg ervoor dat je bent ingelogd bij Supabase CLI met "npx supabase login"');
      rl.close();
      process.exit(1);
    }
    
    if (stderr) {
      console.error(`Waarschuwing: ${stderr}`);
    }
    
    console.log(stdout);
    console.log('Migratie succesvol uitgevoerd!');
    rl.close();
  });
});
