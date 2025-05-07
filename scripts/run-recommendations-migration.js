// Script om de recommendations tabel migratie uit te voeren
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

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

// Initialiseer Supabase client met service key voor admin rechten
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Pad naar het migratie SQL bestand
const migrationFilePath = path.resolve('./migrations/add_recommendations_table.sql');

// Functie om de migratie uit te voeren
async function runMigration() {
  try {
    // Lees het SQL bestand
    const sql = fs.readFileSync(migrationFilePath, 'utf8');
    
    console.log('Voer migratie uit...');
    
    // Voer de SQL query uit
    const { error } = await supabase.rpc('pgmigrate', { query: sql });
    
    if (error) {
      throw error;
    }
    
    console.log('Migratie succesvol uitgevoerd!');
    
    // Controleer of de tabel is aangemaakt
    const { data, error: tableError } = await supabase
      .from('recommendations')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.warn('Waarschuwing: Kon niet verifiëren of de tabel correct is aangemaakt.');
      console.warn(tableError.message);
    } else {
      console.log('Tabel "recommendations" is succesvol aangemaakt en toegankelijk.');
    }
    
  } catch (error) {
    console.error('Fout bij uitvoeren van migratie:');
    console.error(error.message);
    process.exit(1);
  }
}

// Voer de migratie uit
runMigration();
