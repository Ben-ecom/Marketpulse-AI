/**
 * Script voor het uitvoeren van database migraties
 * Gebruik: node run-migration.js <pad-naar-migratie-bestand>
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Controleer of de vereiste omgevingsvariabelen zijn ingesteld
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Fout: SUPABASE_URL en SUPABASE_SERVICE_KEY moeten worden ingesteld in .env bestand');
  process.exit(1);
}

// Maak een Supabase client met de service key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
  // Controleer of een migratiebestand is opgegeven
  if (process.argv.length < 3) {
    console.error('Gebruik: node run-migration.js <pad-naar-migratie-bestand>');
    process.exit(1);
  }

  const migrationFilePath = process.argv[2];
  
  // Controleer of het migratiebestand bestaat
  if (!fs.existsSync(migrationFilePath)) {
    console.error(`Fout: Migratiebestand '${migrationFilePath}' bestaat niet`);
    process.exit(1);
  }

  try {
    // Lees het migratiebestand
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    
    console.log(`Migratie uitvoeren: ${path.basename(migrationFilePath)}`);
    
    // Voer de SQL-query uit
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Fout bij uitvoeren van migratie:', error);
      process.exit(1);
    }
    
    console.log('Migratie succesvol uitgevoerd!');
  } catch (error) {
    console.error('Onverwachte fout bij uitvoeren van migratie:', error);
    process.exit(1);
  }
}

runMigration().catch(console.error);
