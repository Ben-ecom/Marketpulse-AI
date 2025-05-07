import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// Controleer of de benodigde omgevingsvariabelen zijn ingesteld
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  logger.error('Supabase URL en/of Anon Key niet geconfigureerd in .env bestand');
  throw new Error('Supabase configuratie ontbreekt');
}

// Creëer een Supabase client met de anonieme sleutel (voor client-side gebruik)
export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Creëer een Supabase admin client met de service sleutel (voor server-side gebruik)
export const supabaseAdmin = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

if (!supabaseAdmin) {
  logger.warn('Supabase Service Key niet geconfigureerd. Sommige admin-functies zullen niet beschikbaar zijn.');
}

export default supabaseClient;
