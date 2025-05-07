/**
 * Setup script voor de Market Research Module database
 * 
 * Dit script maakt de benodigde tabellen en RLS policies aan in Supabase
 * voor de Market Research Module.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Laad omgevingsvariabelen
dotenv.config();

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
 * Maak een Supabase client
 */
function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL en/of SUPABASE_SERVICE_KEY niet geconfigureerd in .env bestand');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Controleer of de tabel al bestaat
 */
async function tableExists(supabase, tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') { // Tabel bestaat niet
      return false;
    }
    
    return true;
  } catch (error) {
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      return false;
    }
    throw error;
  }
}

/**
 * Maak de market_research_reports tabel aan
 */
async function createMarketResearchReportsTable(supabase) {
  log('🔍 Controleren of market_research_reports tabel bestaat...', 'cyan');
  
  const exists = await tableExists(supabase, 'market_research_reports');
  
  if (exists) {
    log('✅ market_research_reports tabel bestaat al', 'green');
    return true;
  }
  
  log('📝 Aanmaken van market_research_reports tabel...', 'cyan');
  
  // SQL voor het aanmaken van de tabel
  const createTableSQL = `
    CREATE TABLE market_research_reports (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Indexen
    CREATE INDEX market_research_reports_user_id_idx ON market_research_reports(user_id);
    CREATE INDEX market_research_reports_created_at_idx ON market_research_reports(created_at);
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { query: createTableSQL });
    
    if (error) {
      log(`❌ Fout bij het aanmaken van market_research_reports tabel: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ market_research_reports tabel succesvol aangemaakt', 'green');
    return true;
  } catch (error) {
    log(`❌ Fout bij het aanmaken van market_research_reports tabel: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Maak RLS policies aan voor de market_research_reports tabel
 */
async function createRLSPolicies(supabase) {
  log('📝 Aanmaken van RLS policies voor market_research_reports tabel...', 'cyan');
  
  // SQL voor het aanmaken van RLS policies
  const createPoliciesSQL = `
    -- Schakel RLS in voor de tabel
    ALTER TABLE market_research_reports ENABLE ROW LEVEL SECURITY;
    
    -- Maak policies aan
    CREATE POLICY "Gebruikers kunnen alleen hun eigen rapporten zien"
      ON market_research_reports
      FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Gebruikers kunnen alleen rapporten invoegen met hun eigen user_id"
      ON market_research_reports
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Gebruikers kunnen alleen hun eigen rapporten bijwerken"
      ON market_research_reports
      FOR UPDATE
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Gebruikers kunnen alleen hun eigen rapporten verwijderen"
      ON market_research_reports
      FOR DELETE
      USING (auth.uid() = user_id);
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { query: createPoliciesSQL });
    
    if (error) {
      log(`❌ Fout bij het aanmaken van RLS policies: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ RLS policies succesvol aangemaakt', 'green');
    return true;
  } catch (error) {
    log(`❌ Fout bij het aanmaken van RLS policies: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Maak de market_research_cache tabel aan
 */
async function createMarketResearchCacheTable(supabase) {
  log('🔍 Controleren of market_research_cache tabel bestaat...', 'cyan');
  
  const exists = await tableExists(supabase, 'market_research_cache');
  
  if (exists) {
    log('✅ market_research_cache tabel bestaat al', 'green');
    return true;
  }
  
  log('📝 Aanmaken van market_research_cache tabel...', 'cyan');
  
  // SQL voor het aanmaken van de tabel
  const createTableSQL = `
    CREATE TABLE market_research_cache (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      cache_key TEXT NOT NULL UNIQUE,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL
    );
    
    -- Indexen
    CREATE INDEX market_research_cache_cache_key_idx ON market_research_cache(cache_key);
    CREATE INDEX market_research_cache_expires_at_idx ON market_research_cache(expires_at);
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { query: createTableSQL });
    
    if (error) {
      log(`❌ Fout bij het aanmaken van market_research_cache tabel: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ market_research_cache tabel succesvol aangemaakt', 'green');
    return true;
  } catch (error) {
    log(`❌ Fout bij het aanmaken van market_research_cache tabel: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Maak een SQL functie aan om verlopen cache items op te ruimen
 */
async function createCleanupFunction(supabase) {
  log('📝 Aanmaken van cleanup functie voor market_research_cache...', 'cyan');
  
  // SQL voor het aanmaken van de functie
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION cleanup_expired_market_research_cache()
    RETURNS void AS $$
    BEGIN
      DELETE FROM market_research_cache
      WHERE expires_at < NOW();
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { query: createFunctionSQL });
    
    if (error) {
      log(`❌ Fout bij het aanmaken van cleanup functie: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ Cleanup functie succesvol aangemaakt', 'green');
    return true;
  } catch (error) {
    log(`❌ Fout bij het aanmaken van cleanup functie: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Maak een SQL trigger aan om de updated_at te updaten
 */
async function createUpdateTrigger(supabase) {
  log('📝 Aanmaken van update trigger voor market_research_reports...', 'cyan');
  
  // SQL voor het aanmaken van de trigger functie
  const createTriggerFunctionSQL = `
    CREATE OR REPLACE FUNCTION update_market_research_reports_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  // SQL voor het aanmaken van de trigger
  const createTriggerSQL = `
    DROP TRIGGER IF EXISTS update_market_research_reports_updated_at ON market_research_reports;
    CREATE TRIGGER update_market_research_reports_updated_at
    BEFORE UPDATE ON market_research_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_market_research_reports_updated_at();
  `;
  
  try {
    // Maak de trigger functie aan
    const { error: functionError } = await supabase.rpc('exec_sql', { query: createTriggerFunctionSQL });
    
    if (functionError) {
      log(`❌ Fout bij het aanmaken van trigger functie: ${functionError.message}`, 'red');
      return false;
    }
    
    // Maak de trigger aan
    const { error: triggerError } = await supabase.rpc('exec_sql', { query: createTriggerSQL });
    
    if (triggerError) {
      log(`❌ Fout bij het aanmaken van trigger: ${triggerError.message}`, 'red');
      return false;
    }
    
    log('✅ Update trigger succesvol aangemaakt', 'green');
    return true;
  } catch (error) {
    log(`❌ Fout bij het aanmaken van update trigger: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Hoofdfunctie
 */
async function main() {
  log('🚀 Market Research Module Database Setup', 'magenta');
  log('===================================\n', 'magenta');
  
  try {
    // Controleer of .env bestand bestaat
    const envPath = path.join(rootDir, '.env');
    if (!fs.existsSync(envPath)) {
      log('❌ .env bestand niet gevonden', 'red');
      log('ℹ️ Maak een kopie van .env.example naar .env en vul de benodigde waarden in', 'yellow');
      return;
    }
    
    // Maak Supabase client
    const supabase = createSupabaseClient();
    log('✅ Supabase client succesvol aangemaakt', 'green');
    
    // Maak tabellen en policies aan
    const reportsTableCreated = await createMarketResearchReportsTable(supabase);
    const cacheTableCreated = await createMarketResearchCacheTable(supabase);
    
    if (reportsTableCreated) {
      await createRLSPolicies(supabase);
      await createUpdateTrigger(supabase);
    }
    
    if (cacheTableCreated) {
      await createCleanupFunction(supabase);
    }
    
    log('\n📋 Setup Samenvatting', 'magenta');
    log('=================', 'magenta');
    log(`market_research_reports tabel: ${reportsTableCreated ? '✅' : '❌'}`, reportsTableCreated ? 'green' : 'red');
    log(`market_research_cache tabel: ${cacheTableCreated ? '✅' : '❌'}`, cacheTableCreated ? 'green' : 'red');
    log(`RLS policies: ${reportsTableCreated ? '✅' : '❌'}`, reportsTableCreated ? 'green' : 'red');
    
    if (reportsTableCreated && cacheTableCreated) {
      log('\n✅ Database setup voltooid! De Market Research Module is klaar voor gebruik.', 'green');
    } else {
      log('\n⚠️ Database setup onvolledig. Los de bovenstaande problemen op voordat je verder gaat.', 'yellow');
    }
  } catch (error) {
    log(`\n❌ Fout bij database setup: ${error.message}`, 'red');
  }
}

// Voer het script uit
main().catch(error => {
  log(`\n❌ Onverwachte fout: ${error.message}`, 'red');
});
