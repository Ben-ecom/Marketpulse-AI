/**
 * supabaseClient.js
 * 
 * Configuratie voor de Supabase client voor tests.
 * Maakt verbinding met de Supabase database voor het uitvoeren van tests.
 */

const { createClient } = require('@supabase/supabase-js');

// Haal de Supabase URL en API key op uit environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-key';

// Maak een Supabase client aan
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
  supabase
};
