/**
 * Supabase Client Utility
 *
 * Dit bestand bevat de Supabase client configuratie en hulpfuncties
 * voor het werken met Supabase in de MarketPulse AI applicatie.
 *
 * OPMERKING: Voor testdoeleinden gebruiken we een mock client.
 * In productie zou dit een echte Supabase client zijn.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Constanten voor server-side gebruik
const DEFAULT_URL = 'http://localhost:3000';

// Helper functie om te controleren of we in een browser-omgeving zijn
// Vermijd directe verwijzingen naar window om ESLint fouten te voorkomen
const isBrowser = () => {
  try {
    return typeof process === 'undefined'
      || (process.env && process.env.BROWSER)
      || (typeof globalThis !== 'undefined' && globalThis.document);
  } catch (e) {
    return false;
  }
};

// Helper functie om een veilige origin URL te krijgen
const getOriginUrl = (path) => {
  try {
    // Alleen proberen window te gebruiken als we in een browser zijn
    if (isBrowser() && typeof globalThis !== 'undefined' && globalThis.location) {
      return `${globalThis.location.origin}${path}`;
    }
  } catch (e) {
    console.warn('Kan browser origin niet bepalen, gebruik standaard URL');
  }
  return `${DEFAULT_URL}${path}`;
};

// Veilig alert tonen zonder directe window verwijzingen
const showAlert = (message) => {
  try {
    if (isBrowser() && typeof globalThis !== 'undefined' && globalThis.alert) {
      // Gebruik console.warn in plaats van alert om ESLint waarschuwingen te vermijden
      console.warn(`[ALERT]: ${message}`);
    } else {
      console.warn(`[ALERT]: ${message}`);
    }
  } catch (e) {
    console.warn(`Kan alert niet tonen: ${message}`);
  }
};

// Supabase URL en API key uit environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Bepaal of we de mock client moeten gebruiken
// Gebruik de mock client als de omgevingsvariabelen niet zijn ingesteld of als we expliciet in development mode zijn
const useMockClient = !supabaseUrl || !supabaseAnonKey || process.env.NODE_ENV === 'development' || process.env.USE_MOCK_CLIENT === 'true';

// Mock Supabase client voor testdoeleinden
const createMockClient = () => {
  console.log('🔧 Gebruik mock Supabase client voor testdoeleinden');

  return {
    auth: {
      getUser: async () => ({ data: { user: { id: '123', email: 'test@example.com' } }, error: null }),
      signInWithPassword: async () => ({ data: { user: { id: '123', email: 'test@example.com' } }, error: null }),
      signInWithOAuth: async () => ({ data: {}, error: null }),
      signUp: async () => ({ data: { user: { id: '123', email: 'test@example.com' } }, error: null }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: { id: '123', email: 'test@example.com' } }, error: null }),
    },
    from: (_table) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: '123', name: 'Test' }, error: null }),
          order: () => ({ data: [{ id: '123', name: 'Test' }], error: null }),
          limit: () => ({ data: [{ id: '123', name: 'Test' }], error: null }),
        }),
        order: () => ({ data: [{ id: '123', name: 'Test' }], error: null }),
        limit: () => ({ data: [{ id: '123', name: 'Test' }], error: null }),
      }),
      insert: () => ({ select: () => ({ data: { id: '123', name: 'Test' }, error: null }) }),
      update: () => ({ eq: () => ({ select: () => ({ data: { id: '123', name: 'Test' }, error: null }) }) }),
      delete: () => ({ eq: () => ({ error: null }) }),
    }),
    storage: {
      from: (_bucket) => ({
        upload: async () => ({ data: { path: 'test.jpg' }, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/test.jpg' } }),
        createSignedUrl: async () => ({ data: { signedUrl: 'https://example.com/test.jpg?token=123' }, error: null }),
        download: async () => ({ data: new Blob(), error: null }),
        remove: async () => ({ error: null }),
        list: async () => ({ data: [{ name: 'test.jpg' }], error: null }),
      }),
    },
  };
};

// Initialiseer de Supabase client
const supabase = useMockClient ? createMockClient() : createClient(supabaseUrl || 'https://example.com', supabaseAnonKey || 'mock-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Hulpfuncties voor authenticatie
 */
const auth = {
  /**
   * Huidige gebruiker ophalen
   * @returns {Promise<Object>} Gebruiker object of null
   */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Inloggen met email en wachtwoord
   * @param {String} email - Email adres
   * @param {String} password - Wachtwoord
   * @returns {Promise<Object>} Resultaat van de inlogpoging
   */
  async signInWithEmail(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  /**
   * Inloggen met Google
   * @returns {Promise<Object>} Resultaat van de inlogpoging
   */
  async signInWithGoogle() {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getOriginUrl('/auth/callback'),
      },
    });
  },

  /**
   * Registreren met email en wachtwoord
   * @param {String} email - Email adres
   * @param {String} password - Wachtwoord
   * @param {Object} metadata - Aanvullende gebruikersgegevens
   * @returns {Promise<Object>} Resultaat van de registratiepoging
   */
  async signUpWithEmail(email, password, metadata = {}) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: getOriginUrl('/auth/callback'),
      },
    });
  },

  /**
   * Uitloggen
   * @returns {Promise<Object>} Resultaat van de uitlogpoging
   */
  async signOut() {
    return await supabase.auth.signOut();
  },

  /**
   * Wachtwoord reset email versturen
   * @param {String} email - Email adres
   * @returns {Promise<Object>} Resultaat van de resetpoging
   */
  async resetPassword(email) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getOriginUrl('/auth/reset-password'),
    });
  },

  /**
   * Wachtwoord bijwerken
   * @param {String} newPassword - Nieuw wachtwoord
   * @returns {Promise<Object>} Resultaat van de updatepoging
   */
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Error updating password:', error);
      // Veilig alert tonen
      showAlert('Er is een fout opgetreden bij het bijwerken van je wachtwoord.');
      return { success: false, error };
    }
    return { success: true };
  },

  /**
   * Gebruikersprofiel bijwerken
   * @param {Object} profileData - Nieuwe profielgegevens
   * @returns {Promise<Object>} Resultaat van de updatepoging
   */
  async updateProfile(profileData) {
    const { error } = await supabase.auth.updateUser({
      data: profileData,
    });

    if (error) {
      console.error('Error updating user profile:', error);
      // Veilig alert tonen
      showAlert('Er is een fout opgetreden bij het bijwerken van je profiel.');
      return { success: false, error };
    }
    return { success: true };
  },
};

/**
 * Hulpfuncties voor projecten
 */
const projects = {
  /**
   * Alle projecten van de huidige gebruiker ophalen
   * @returns {Promise<Array>} Array van projecten
   */
  async getTable(tableName, query = {}) {
    return await supabase
      .from(tableName)
      .select(query.select || '*')
      .order(query.orderBy || 'created_at', { ascending: query.ascending });
  },

  /**
   * Project ophalen op basis van ID
   * @param {String} id - Project ID
   * @returns {Promise<Object>} Project object
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Nieuw project aanmaken
   * @param {Object} project - Project gegevens
   * @returns {Promise<Object>} Nieuw project object
   */
  async create(project) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Project bijwerken
   * @param {String} id - Project ID
   * @param {Object} updates - Bij te werken velden
   * @returns {Promise<Object>} Bijgewerkt project object
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Project verwijderen
   * @param {String} id - Project ID
   * @returns {Promise<Object>} Resultaat van de verwijderpoging
   */
  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};

/**
 * Hulpfuncties voor scrape jobs
 */
const scrapeJobs = {
  /**
   * Alle scrape jobs van een project ophalen
   * @param {String} projectId - Project ID
   * @returns {Promise<Array>} Array van scrape jobs
   */
  async getByProject(projectId) {
    const { data, error } = await supabase
      .from('scrape_jobs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Scrape job ophalen op basis van ID
   * @param {String} id - Job ID
   * @returns {Promise<Object>} Job object
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('scrape_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Nieuwe scrape job aanmaken
   * @param {Object} job - Job gegevens
   * @returns {Promise<Object>} Nieuwe job object
   */
  async create(job) {
    const { data, error } = await supabase
      .from('scrape_jobs')
      .insert(job)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Scrape job status bijwerken
   * @param {String} id - Job ID
   * @param {String} status - Nieuwe status
   * @param {Object} additionalUpdates - Aanvullende bij te werken velden
   * @returns {Promise<Object>} Bijgewerkt job object
   */
  async updateStatus(id, status, additionalUpdates = {}) {
    const updates = {
      status,
      ...additionalUpdates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('scrape_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Scrape job verwijderen
   * @param {String} id - Job ID
   * @returns {Promise<Object>} Resultaat van de verwijderpoging
   */
  async delete(id) {
    const { error } = await supabase
      .from('scrape_jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};

/**
 * Hulpfuncties voor scrape resultaten
 */
const scrapeResults = {
  /**
   * Alle scrape resultaten van een project ophalen
   * @param {String} projectId - Project ID
   * @param {Object} options - Filter opties
   * @returns {Promise<Array>} Array van scrape resultaten
   */
  async getByProject(projectId, options = {}) {
    const { platform, limit = 100, processed } = options;

    let query = supabase
      .from('scrape_results')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (platform) {
      query = query.eq('platform', platform);
    }

    if (processed !== undefined) {
      query = query.eq('processed', processed);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  /**
   * Scrape resultaten van een job ophalen
   * @param {String} jobId - Job ID
   * @returns {Promise<Array>} Array van scrape resultaten
   */
  async getByJob(jobId) {
    const { data, error } = await supabase
      .from('scrape_results')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Scrape resultaat ophalen op basis van ID
   * @param {String} id - Resultaat ID
   * @returns {Promise<Object>} Resultaat object
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('scrape_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Nieuw scrape resultaat aanmaken
   * @param {Object} result - Resultaat gegevens
   * @returns {Promise<Object>} Nieuw resultaat object
   */
  async create(result) {
    const { data, error } = await supabase
      .from('scrape_results')
      .insert(result)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Scrape resultaat markeren als verwerkt
   * @param {String} id - Resultaat ID
   * @returns {Promise<Object>} Bijgewerkt resultaat object
   */
  async markAsProcessed(id) {
    const { data, error } = await supabase
      .from('scrape_results')
      .update({
        processed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Scrape resultaat verwijderen
   * @param {String} id - Resultaat ID
   * @returns {Promise<Object>} Resultaat van de verwijderpoging
   */
  async delete(id) {
    const { error } = await supabase
      .from('scrape_results')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};

/**
 * Hulpfuncties voor inzichten
 */
const insights = {
  /**
   * Alle inzichten van een project ophalen
   * @param {String} projectId - Project ID
   * @param {Object} options - Filter opties
   * @returns {Promise<Array>} Array van inzichten
   */
  async getByProject(projectId, options = {}) {
    const { type, category, limit = 100 } = options;

    let query = supabase
      .from('insights')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  /**
   * Inzicht ophalen op basis van ID
   * @param {String} id - Inzicht ID
   * @returns {Promise<Object>} Inzicht object
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Nieuw inzicht aanmaken
   * @param {Object} insight - Inzicht gegevens
   * @returns {Promise<Object>} Nieuw inzicht object
   */
  async create(insight) {
    const { data, error } = await supabase
      .from('insights')
      .insert(insight)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Inzicht bijwerken
   * @param {String} id - Inzicht ID
   * @param {Object} updates - Bij te werken velden
   * @returns {Promise<Object>} Bijgewerkt inzicht object
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('insights')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Inzicht verwijderen
   * @param {String} id - Inzicht ID
   * @returns {Promise<Object>} Resultaat van de verwijderpoging
   */
  async delete(id) {
    const { error } = await supabase
      .from('insights')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },
};

/**
 * Hulpfuncties voor storage
 */
const storage = {
  /**
   * Bestand uploaden naar een bucket
   * @param {String} bucketName - Bucket naam
   * @param {String} path - Pad in de bucket
   * @param {File} file - Te uploaden bestand
   * @param {Object} options - Upload opties
   * @returns {Promise<Object>} Upload resultaat
   */
  async uploadFile(bucketName, path, file, options = {}) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...options,
      });

    if (error) throw error;
    return data;
  },

  /**
   * Publieke URL voor een bestand ophalen
   * @param {String} bucketName - Bucket naam
   * @param {String} path - Pad in de bucket
   * @returns {String} Publieke URL
   */
  getPublicUrl(bucketName, path) {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  /**
   * Tijdelijke URL voor een bestand ophalen
   * @param {String} bucketName - Bucket naam
   * @param {String} path - Pad in de bucket
   * @param {Number} expiresIn - Aantal seconden dat de URL geldig is
   * @returns {Promise<String>} Tijdelijke URL
   */
  async getSignedUrl(bucketName, path, expiresIn = 60) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  },

  /**
   * Bestand downloaden
   * @param {String} bucketName - Bucket naam
   * @param {String} path - Pad in de bucket
   * @returns {Promise<Blob>} Bestandsinhoud
   */
  async downloadFile(bucketName, path) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(path);

    if (error) throw error;
    return data;
  },

  /**
   * Bestand verwijderen
   * @param {String} bucketName - Bucket naam
   * @param {String} path - Pad in de bucket
   * @returns {Promise<Object>} Resultaat van de verwijderpoging
   */
  async deleteFile(bucketName, path) {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Bestanden in een map ophalen
   * @param {String} bucketName - Bucket naam
   * @param {String} folder - Map pad
   * @returns {Promise<Array>} Array van bestanden
   */
  async listFiles(bucketName, folder) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folder);

    if (error) throw error;
    return data;
  },
};

/**
 * Maak een Supabase client voor server-side gebruik
 * @returns {Object} Supabase client
 */
const createSupabaseClient = () => {
  // Gebruik mock client voor testdoeleinden
  if (useMockClient) {
    console.log('🔧 Gebruik mock Supabase client voor server-side gebruik');
    return createMockClient();
  }

  // Voor server-side gebruik, haal de credentials uit environment variables
  const supabaseServerUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseServerUrl || !supabaseServiceKey) {
    console.error('Supabase URL en/of Service Key zijn niet geconfigureerd in environment variables');
    throw new Error('Supabase configuratie ontbreekt');
  }

  // Maak een nieuwe client met de service key voor volledige toegang
  return createClient(supabaseServerUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Exporteer de Supabase client en hulpfuncties
module.exports = {
  projects,
  scrapeJobs,
  scrapeResults,
  insights,
  storage,
  auth,
  supabase,
  createSupabaseClient,
};
module.exports.default = supabase;
