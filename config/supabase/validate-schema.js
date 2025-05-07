/**
 * Supabase Schema Validatie Script
 * 
 * Dit script valideert of de database tabellen correct zijn aangemaakt in Supabase
 * en voegt testdata toe om de relaties en constraints te testen.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase client initialiseren
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL en SUPABASE_SERVICE_KEY moeten worden ingesteld in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Valideer of een tabel bestaat en de verwachte kolommen heeft
 * @param {String} tableName - Naam van de tabel
 * @param {Array} expectedColumns - Verwachte kolommen
 * @returns {Promise<Boolean>} - True als de tabel correct is, anders False
 */
async function validateTable(tableName, expectedColumns) {
  try {
    // Controleer of de tabel bestaat
    const { data: tableExists, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single();
    
    if (tableError || !tableExists) {
      console.error(`❌ Tabel '${tableName}' bestaat niet`);
      return false;
    }
    
    // Haal kolommen op
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (columnsError) {
      console.error(`❌ Fout bij ophalen van kolommen voor tabel '${tableName}':`, columnsError);
      return false;
    }
    
    // Controleer of alle verwachte kolommen bestaan
    const columnNames = columns.map(col => col.column_name);
    const missingColumns = expectedColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.error(`❌ Tabel '${tableName}' mist de volgende kolommen:`, missingColumns);
      return false;
    }
    
    console.log(`✅ Tabel '${tableName}' bestaat en heeft alle verwachte kolommen`);
    return true;
  } catch (error) {
    console.error(`❌ Fout bij valideren van tabel '${tableName}':`, error);
    return false;
  }
}

/**
 * Voeg testdata toe aan de tabellen
 * @returns {Promise<void>}
 */
async function insertTestData() {
  try {
    // Maak een testgebruiker aan
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: 'test@marketpulse.ai',
      password: 'Test123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    });
    
    if (userError) {
      console.error('❌ Fout bij aanmaken van testgebruiker:', userError);
      return;
    }
    
    console.log('✅ Testgebruiker aangemaakt:', user.user.id);
    
    // Voeg gebruikersprofiel toe
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: user.user.id,
        email: 'test@marketpulse.ai',
        full_name: 'Test User',
        role: 'user',
        company: 'MarketPulse AI'
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Fout bij aanmaken van gebruikersprofiel:', profileError);
      return;
    }
    
    console.log('✅ Gebruikersprofiel aangemaakt:', userProfile.id);
    
    // Maak een testproject aan
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: 'Test Project',
        description: 'Een testproject voor het valideren van de database schema',
        user_id: user.user.id,
        settings: {
          defaultPlatform: 'amazon',
          maxResults: 100
        }
      })
      .select()
      .single();
    
    if (projectError) {
      console.error('❌ Fout bij aanmaken van testproject:', projectError);
      return;
    }
    
    console.log('✅ Testproject aangemaakt:', project.id);
    
    // Maak een test scrape job aan
    const { data: job, error: jobError } = await supabase
      .from('scrape_jobs')
      .insert({
        project_id: project.id,
        platform: 'amazon',
        options: {
          productId: 'B08F2HKLRK',
          domain: 'com',
          starFilters: [5]
        },
        status: 'pending'
      })
      .select()
      .single();
    
    if (jobError) {
      console.error('❌ Fout bij aanmaken van test scrape job:', jobError);
      return;
    }
    
    console.log('✅ Test scrape job aangemaakt:', job.id);
    
    // Maak een test scrape resultaat aan
    const { data: result, error: resultError } = await supabase
      .from('scrape_results')
      .insert({
        job_id: job.id,
        project_id: project.id,
        platform: 'amazon',
        options: {
          productId: 'B08F2HKLRK',
          domain: 'com',
          starFilters: [5]
        },
        result: {
          reviews: [
            {
              id: '123456',
              title: 'Great product',
              content: 'This is a fantastic product, I love it!',
              rating: 5,
              date: '2025-01-15',
              verified: true
            }
          ],
          metadata: {
            totalReviews: 1,
            averageRating: 5.0,
            productName: 'Test Product'
          }
        },
        processed: false
      })
      .select()
      .single();
    
    if (resultError) {
      console.error('❌ Fout bij aanmaken van test scrape resultaat:', resultError);
      return;
    }
    
    console.log('✅ Test scrape resultaat aangemaakt:', result.id);
    
    // Maak een test inzicht aan
    const { data: insight, error: insightError } = await supabase
      .from('insights')
      .insert({
        project_id: project.id,
        result_id: result.id,
        type: 'sentiment',
        category: 'product_quality',
        data: {
          sentiment: 'positive',
          score: 0.92,
          keywords: ['fantastic', 'love'],
          summary: 'Overwegend positieve reacties op productkwaliteit'
        }
      })
      .select()
      .single();
    
    if (insightError) {
      console.error('❌ Fout bij aanmaken van test inzicht:', insightError);
      return;
    }
    
    console.log('✅ Test inzicht aangemaakt:', insight.id);
    
    console.log('✅ Alle testdata succesvol aangemaakt');
  } catch (error) {
    console.error('❌ Fout bij toevoegen van testdata:', error);
  }
}

/**
 * Valideer de RLS policies
 * @returns {Promise<void>}
 */
async function validateRLS() {
  try {
    // Haal alle RLS policies op
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public');
    
    if (policiesError) {
      console.error('❌ Fout bij ophalen van RLS policies:', policiesError);
      return;
    }
    
    // Controleer of alle verwachte policies bestaan
    const expectedPolicies = [
      'users_select_own',
      'users_update_own',
      'projects_select_own',
      'projects_insert_own',
      'projects_update_own',
      'projects_delete_own',
      'scrape_jobs_select_own_project',
      'scrape_jobs_insert_own_project',
      'scrape_jobs_update_own_project',
      'scrape_jobs_delete_own_project',
      'scrape_results_select_own_project',
      'scrape_results_insert_own_project',
      'scrape_results_update_own_project',
      'scrape_results_delete_own_project',
      'insights_select_own_project',
      'insights_insert_own_project',
      'insights_update_own_project',
      'insights_delete_own_project'
    ];
    
    const policyNames = policies.map(policy => policy.policyname);
    const missingPolicies = expectedPolicies.filter(policy => !policyNames.includes(policy));
    
    if (missingPolicies.length > 0) {
      console.error('❌ De volgende RLS policies ontbreken:', missingPolicies);
    } else {
      console.log('✅ Alle verwachte RLS policies zijn aanwezig');
    }
    
    // Controleer of alle tabellen RLS hebben ingeschakeld
    const tables = ['users', 'projects', 'scrape_jobs', 'scrape_results', 'insights'];
    
    for (const table of tables) {
      const { data: rlsEnabled, error: rlsError } = await supabase
        .from('pg_tables')
        .select('rowsecurity')
        .eq('schemaname', 'public')
        .eq('tablename', table)
        .single();
      
      if (rlsError) {
        console.error(`❌ Fout bij controleren van RLS voor tabel '${table}':`, rlsError);
        continue;
      }
      
      if (!rlsEnabled.rowsecurity) {
        console.error(`❌ RLS is niet ingeschakeld voor tabel '${table}'`);
      } else {
        console.log(`✅ RLS is ingeschakeld voor tabel '${table}'`);
      }
    }
  } catch (error) {
    console.error('❌ Fout bij valideren van RLS policies:', error);
  }
}

/**
 * Valideer de storage buckets
 * @returns {Promise<void>}
 */
async function validateStorage() {
  try {
    // Haal alle buckets op
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('❌ Fout bij ophalen van storage buckets:', bucketsError);
      return;
    }
    
    // Controleer of de verwachte buckets bestaan
    const expectedBuckets = ['datasets', 'exports'];
    const bucketNames = buckets.map(bucket => bucket.name);
    const missingBuckets = expectedBuckets.filter(bucket => !bucketNames.includes(bucket));
    
    if (missingBuckets.length > 0) {
      console.error('❌ De volgende storage buckets ontbreken:', missingBuckets);
    } else {
      console.log('✅ Alle verwachte storage buckets zijn aanwezig');
    }
    
    // Test het uploaden van een bestand naar elke bucket
    for (const bucketName of expectedBuckets) {
      if (!bucketNames.includes(bucketName)) continue;
      
      // Maak een testbestand
      const testData = JSON.stringify({ test: 'data', timestamp: new Date().toISOString() });
      const testFile = new Blob([testData], { type: 'application/json' });
      
      // Upload het testbestand
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .upload(`test/test-file-${Date.now()}.json`, testFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error(`❌ Fout bij uploaden van testbestand naar bucket '${bucketName}':`, error);
      } else {
        console.log(`✅ Testbestand succesvol geüpload naar bucket '${bucketName}'`);
      }
    }
  } catch (error) {
    console.error('❌ Fout bij valideren van storage buckets:', error);
  }
}

/**
 * Hoofdfunctie voor het valideren van het schema
 */
async function validateSchema() {
  console.log('🔍 Valideren van Supabase database schema...');
  
  // Valideer tabellen
  const usersValid = await validateTable('users', ['id', 'email', 'full_name', 'role', 'created_at', 'updated_at']);
  const projectsValid = await validateTable('projects', ['id', 'name', 'description', 'user_id', 'settings', 'created_at', 'updated_at']);
  const jobsValid = await validateTable('scrape_jobs', ['id', 'project_id', 'platform', 'options', 'status', 'created_at', 'updated_at']);
  const resultsValid = await validateTable('scrape_results', ['id', 'job_id', 'project_id', 'platform', 'options', 'result', 'processed', 'created_at', 'updated_at']);
  const insightsValid = await validateTable('insights', ['id', 'project_id', 'result_id', 'type', 'category', 'data', 'created_at', 'updated_at']);
  
  const allTablesValid = usersValid && projectsValid && jobsValid && resultsValid && insightsValid;
  
  if (allTablesValid) {
    console.log('✅ Alle tabellen zijn correct aangemaakt');
    
    // Valideer RLS policies
    await validateRLS();
    
    // Valideer storage buckets
    await validateStorage();
    
    // Voeg testdata toe
    console.log('📝 Toevoegen van testdata...');
    await insertTestData();
  } else {
    console.error('❌ Niet alle tabellen zijn correct aangemaakt');
  }
  
  console.log('🏁 Schema validatie voltooid');
}

// Voer de validatie uit
validateSchema().catch(error => {
  console.error('❌ Onverwachte fout bij valideren van schema:', error);
});
