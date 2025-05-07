/**
 * run_migrations.js
 * 
 * Script voor het uitvoeren van database migraties op Supabase.
 * Dit script leest SQL-bestanden uit de migrations directory en voert ze uit op de Supabase database.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Laad environment variables
dotenv.config();

// Supabase configuratie
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Gebruik de service key voor migraties

// Controleer of de benodigde environment variables zijn ingesteld
if (!supabaseUrl || !supabaseKey) {
  console.error('Fout: SUPABASE_URL en SUPABASE_SERVICE_KEY moeten worden ingesteld in de .env file');
  process.exit(1);
}

// Maak een Supabase client aan
const supabase = createClient(supabaseUrl, supabaseKey);

// Pad naar de migrations directory
const migrationsDir = path.join(__dirname);

/**
 * Voert een SQL-bestand uit op de Supabase database
 * @param {string} filePath - Pad naar het SQL-bestand
 * @returns {Promise<void>}
 */
async function runMigration(filePath) {
  try {
    // Lees het SQL-bestand
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Uitvoeren van migratie: ${path.basename(filePath)}`);
    
    // Voer de SQL-query uit
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error(`Fout bij uitvoeren van migratie ${path.basename(filePath)}:`, error);
      return false;
    }
    
    console.log(`Migratie ${path.basename(filePath)} succesvol uitgevoerd`);
    return true;
  } catch (error) {
    console.error(`Fout bij uitvoeren van migratie ${path.basename(filePath)}:`, error);
    return false;
  }
}

/**
 * Voert alle SQL-bestanden in de migrations directory uit
 */
async function runMigrations() {
  try {
    // Lees alle bestanden in de migrations directory
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .map(file => path.join(migrationsDir, file));
    
    if (files.length === 0) {
      console.log('Geen migraties gevonden');
      return;
    }
    
    console.log(`${files.length} migratie(s) gevonden`);
    
    // Voer elke migratie uit
    let successCount = 0;
    for (const file of files) {
      const success = await runMigration(file);
      if (success) {
        successCount++;
      }
    }
    
    console.log(`${successCount} van ${files.length} migratie(s) succesvol uitgevoerd`);
  } catch (error) {
    console.error('Fout bij uitvoeren van migraties:', error);
  }
}

// Voer de migraties uit
runMigrations()
  .then(() => {
    console.log('Migraties voltooid');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fout bij uitvoeren van migraties:', error);
    process.exit(1);
  });
