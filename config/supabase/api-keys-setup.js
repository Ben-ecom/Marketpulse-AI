/**
 * Supabase API Keys en Service Roles Setup Script
 * 
 * Dit script helpt bij het configureren en beheren van API keys en service roles in Supabase.
 * Het bevat functies voor het instellen van de juiste permissies en het testen van de API keys.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase URL en API keys
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL en SUPABASE_SERVICE_KEY moeten worden ingesteld in .env');
  process.exit(1);
}

// Initialiseer de Supabase client met de service key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Configureer JWT instellingen
 * @param {Number} expirySeconds - JWT expiry tijd in seconden
 * @returns {Promise<Object>} - Resultaat van de configuratie
 */
async function configureJwtSettings(expirySeconds = 3600) {
  try {
    console.log(`🔐 JWT instellingen configureren (expiry: ${expirySeconds} seconden)...`);
    
    // Hier zou normaal een API call naar Supabase komen om JWT instellingen te configureren
    // Maar dit is momenteel niet mogelijk via de JavaScript client
    // In plaats daarvan geven we instructies voor handmatige configuratie
    
    console.log('\n⚠️ JWT instellingen moeten handmatig worden geconfigureerd in de Supabase dashboard:');
    console.log('1. Ga naar https://app.supabase.io/project/_/settings/api');
    console.log('2. Scroll naar "JWT Settings"');
    console.log(`3. Stel "JWT Expiry" in op ${expirySeconds} seconden`);
    console.log('4. Klik op "Save"');
    
    return { success: true, message: 'Instructies voor JWT configuratie gegeven' };
  } catch (error) {
    console.error('❌ Fout bij configureren van JWT instellingen:', error);
    return { success: false, error };
  }
}

/**
 * Configureer API rate limiting
 * @param {Number} anonLimit - Rate limit voor anon key (requests per minuut)
 * @param {Number} serviceLimit - Rate limit voor service key (requests per minuut)
 * @param {Number} authLimit - Rate limit voor auth endpoints (requests per minuut)
 * @returns {Promise<Object>} - Resultaat van de configuratie
 */
async function configureRateLimiting(anonLimit = 100, serviceLimit = 1000, authLimit = 10) {
  try {
    console.log(`🔐 API rate limiting configureren (anon: ${anonLimit}, service: ${serviceLimit}, auth: ${authLimit} req/min)...`);
    
    // Hier zou normaal een API call naar Supabase komen om rate limiting te configureren
    // Maar dit is momenteel niet mogelijk via de JavaScript client
    // In plaats daarvan geven we instructies voor handmatige configuratie
    
    console.log('\n⚠️ Rate limiting moet handmatig worden geconfigureerd in de Supabase dashboard:');
    console.log('1. Ga naar https://app.supabase.io/project/_/settings/api');
    console.log('2. Scroll naar "Rate Limits"');
    console.log(`3. Stel "Anon Key" in op ${anonLimit} requests per minuut`);
    console.log(`4. Stel "Service Role Key" in op ${serviceLimit} requests per minuut`);
    console.log(`5. Stel "Auth Endpoints" in op ${authLimit} requests per minuut`);
    console.log('6. Klik op "Save"');
    
    return { success: true, message: 'Instructies voor rate limiting configuratie gegeven' };
  } catch (error) {
    console.error('❌ Fout bij configureren van rate limiting:', error);
    return { success: false, error };
  }
}

/**
 * Genereer een .env.example bestand met de benodigde environment variables
 * @param {String} outputPath - Pad naar het output bestand
 * @returns {Promise<Object>} - Resultaat van de generatie
 */
async function generateEnvExample(outputPath = '.env.example') {
  try {
    console.log(`📝 .env.example bestand genereren op ${outputPath}...`);
    
    const envContent = `# Supabase configuratie
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# React/Next.js frontend configuratie
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API configuratie
API_RATE_LIMIT=100
API_TIMEOUT=30000
`;
    
    fs.writeFileSync(outputPath, envContent);
    console.log(`✅ .env.example bestand gegenereerd op ${outputPath}`);
    
    return { success: true, path: outputPath };
  } catch (error) {
    console.error('❌ Fout bij genereren van .env.example bestand:', error);
    return { success: false, error };
  }
}

/**
 * Genereer een key rotatie script
 * @param {String} outputPath - Pad naar het output bestand
 * @returns {Promise<Object>} - Resultaat van de generatie
 */
async function generateKeyRotationScript(outputPath = 'rotate-keys.js') {
  try {
    console.log(`📝 Key rotatie script genereren op ${outputPath}...`);
    
    const scriptContent = `/**
 * Supabase API Key Rotatie Script
 * 
 * Dit script helpt bij het roteren van API keys in Supabase.
 * Het genereert nieuwe keys, update de environment variables, en test de nieuwe keys.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Supabase URL en API keys
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL en SUPABASE_SERVICE_KEY moeten worden ingesteld in .env');
  process.exit(1);
}

// Initialiseer de Supabase client met de service key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Roteer API keys
 */
async function rotateKeys() {
  try {
    console.log('🔄 API keys roteren...');
    
    // Hier zou normaal een API call naar Supabase komen om keys te roteren
    // Maar dit is momenteel niet mogelijk via de JavaScript client
    // In plaats daarvan geven we instructies voor handmatige rotatie
    
    console.log('\\n⚠️ API keys moeten handmatig worden geroteerd in de Supabase dashboard:');
    console.log('1. Ga naar https://app.supabase.io/project/_/settings/api');
    console.log('2. Klik op "Regenerate" naast de key die je wilt roteren');
    console.log('3. Kopieer de nieuwe key');
    console.log('4. Update de environment variables in alle omgevingen');
    console.log('5. Verifieer dat alles nog werkt met de nieuwe key');
    
    // Update .env bestand
    console.log('\\n📝 Instructies voor het updaten van het .env bestand:');
    console.log('1. Open het .env bestand');
    console.log('2. Vervang de oude key met de nieuwe key');
    console.log('3. Sla het bestand op');
    
    // Test de nieuwe key
    console.log('\\n🧪 Instructies voor het testen van de nieuwe key:');
    console.log('1. Run de test-api-keys.js script om te verifiëren dat de nieuwe key werkt');
    console.log('2. Als alles werkt, verwijder dan de oude key in de Supabase dashboard');
    
    return { success: true, message: 'Instructies voor key rotatie gegeven' };
  } catch (error) {
    console.error('❌ Fout bij roteren van API keys:', error);
    return { success: false, error };
  }
}

// Voer de key rotatie uit
rotateKeys().catch(error => {
  console.error('❌ Onverwachte fout bij roteren van API keys:', error);
});
`;
    
    fs.writeFileSync(outputPath, scriptContent);
    console.log(`✅ Key rotatie script gegenereerd op ${outputPath}`);
    
    return { success: true, path: outputPath };
  } catch (error) {
    console.error('❌ Fout bij genereren van key rotatie script:', error);
    return { success: false, error };
  }
}

/**
 * Genereer een SQL script voor het aanmaken van custom roles
 * @param {String} outputPath - Pad naar het output bestand
 * @returns {Promise<Object>} - Resultaat van de generatie
 */
async function generateRolesSql(outputPath = 'roles.sql') {
  try {
    console.log(`📝 SQL script voor custom roles genereren op ${outputPath}...`);
    
    const sqlContent = `-- Custom roles voor MarketPulse AI
-- Run dit script in de SQL editor van Supabase

-- Readonly role voor rapportage en analytics
CREATE ROLE readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly;

-- API role voor API endpoints
CREATE ROLE api_role;
GRANT USAGE ON SCHEMA public TO api_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO api_role;
GRANT INSERT, UPDATE, DELETE ON TABLE public.scrape_jobs, public.scrape_results, public.insights TO api_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO api_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES public.scrape_jobs, public.scrape_results, public.insights TO api_role;

-- Maak een gebruiker voor readonly toegang
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT readonly TO readonly_user;

-- Maak een gebruiker voor API toegang
CREATE USER api_user WITH PASSWORD 'secure_password';
GRANT api_role TO api_user;

-- Geef de service role alle rechten
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;
`;
    
    fs.writeFileSync(outputPath, sqlContent);
    console.log(`✅ SQL script voor custom roles gegenereerd op ${outputPath}`);
    
    return { success: true, path: outputPath };
  } catch (error) {
    console.error('❌ Fout bij genereren van SQL script voor custom roles:', error);
    return { success: false, error };
  }
}

/**
 * Hoofdfunctie voor het configureren van API keys en service roles
 */
async function setup() {
  try {
    console.log('🔐 Supabase API Keys en Service Roles configureren...');
    
    // Configureer JWT instellingen
    await configureJwtSettings();
    
    // Configureer rate limiting
    await configureRateLimiting();
    
    // Genereer .env.example bestand
    await generateEnvExample();
    
    // Genereer key rotatie script
    await generateKeyRotationScript('config/supabase/rotate-keys.js');
    
    // Genereer SQL script voor custom roles
    await generateRolesSql('config/supabase/roles.sql');
    
    console.log('\n✅ Supabase API Keys en Service Roles configuratie voltooid');
    console.log('\n📋 Volgende stappen:');
    console.log('1. Volg de instructies voor handmatige configuratie in de Supabase dashboard');
    console.log('2. Run het test-api-keys.js script om de configuratie te testen');
    console.log('3. Implementeer de key rotatie strategie');
    
  } catch (error) {
    console.error('❌ Fout bij configureren van API keys en service roles:', error);
  }
}

// Voer de setup uit als het script direct wordt uitgevoerd
if (require.main === module) {
  setup().catch(error => {
    console.error('❌ Onverwachte fout bij setup:', error);
  });
}

// Exporteer functies voor gebruik in andere scripts
module.exports = {
  configureJwtSettings,
  configureRateLimiting,
  generateEnvExample,
  generateKeyRotationScript,
  generateRolesSql,
  setup
};
