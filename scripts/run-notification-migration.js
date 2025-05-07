/**
 * run-notification-migration.js
 * 
 * Script voor het uitvoeren van de notificatie database migratie.
 * Dit script leest het SQL bestand en voert het uit op de Supabase database.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase client initialiseren
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL en Service Key moeten worden ingesteld in de .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Pad naar het SQL bestand
const sqlFilePath = path.join(__dirname, '../backend/migrations/20250506_add_notification_tables.sql');

// Functie voor het uitvoeren van de migratie
async function runMigration() {
  try {
    // Lees het SQL bestand
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('SQL bestand gelezen...');
    
    // Splits het SQL bestand op in afzonderlijke statements
    const statements = sql
      .replace(/--.*$/gm, '') // Verwijder commentaren
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    console.log(`${statements.length} SQL statements gevonden...`);
    
    // Voer elke statement uit
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Uitvoeren statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`Fout bij uitvoeren statement ${i + 1}:`, error);
        return;
      }
    }
    
    console.log('Migratie succesvol uitgevoerd!');
    
    // Controleer of de tabellen zijn aangemaakt
    const { data: notificationSettings, error: error1 } = await supabase
      .from('notification_settings')
      .select('count(*)', { count: 'exact' });
    
    const { data: notifications, error: error2 } = await supabase
      .from('notifications')
      .select('count(*)', { count: 'exact' });
    
    if (error1 || error2) {
      console.error('Fout bij controleren van tabellen:', error1 || error2);
      return;
    }
    
    console.log('Tabellen succesvol aangemaakt:');
    console.log('- notification_settings tabel is aanwezig');
    console.log('- notifications tabel is aanwezig');
    
  } catch (error) {
    console.error('Fout bij uitvoeren migratie:', error);
  }
}

// Voer de migratie uit
runMigration();
