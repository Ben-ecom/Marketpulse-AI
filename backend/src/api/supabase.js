/**
 * Supabase API Client
 * Exporteert de Supabase client voor gebruik in de applicatie
 */

import { supabaseClient, supabaseAdmin } from '../config/supabase.js';

// Exporteer de Supabase client en admin client
export const supabase = supabaseClient;
export const supabaseAdminClient = supabaseAdmin;

export default supabase;
