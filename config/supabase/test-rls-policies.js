/**
 * Supabase RLS Policies Test Script
 * 
 * Dit script test de Row Level Security (RLS) policies in Supabase
 * door gebruikers met verschillende rollen aan te maken en te verifiëren
 * dat ze alleen toegang hebben tot hun eigen data.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase client initialiseren met service key (admin rechten)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL en SUPABASE_SERVICE_KEY moeten worden ingesteld in .env');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Maak een test gebruiker aan
 * @param {String} email - Email adres
 * @param {String} role - Gebruikersrol (user of admin)
 * @returns {Promise<Object>} - Gebruiker object
 */
async function createTestUser(email, role = 'user') {
  try {
    // Maak een gebruiker aan in auth.users
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: 'Test123!',
      email_confirm: true
    });
    
    if (authError) {
      throw authError;
    }
    
    // Maak een gebruikersprofiel aan in public.users
    const { data: userProfile, error: profileError } = await adminClient
      .from('users')
      .insert({
        id: authUser.user.id,
        email,
        full_name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role,
        company: 'MarketPulse AI Test'
      })
      .select()
      .single();
    
    if (profileError) {
      throw profileError;
    }
    
    console.log(`✅ Test ${role} aangemaakt:`, email);
    return {
      id: authUser.user.id,
      email,
      role
    };
  } catch (error) {
    console.error(`❌ Fout bij aanmaken van test ${role}:`, error);
    throw error;
  }
}

/**
 * Maak een client voor een specifieke gebruiker
 * @param {String} email - Email adres
 * @param {String} password - Wachtwoord
 * @returns {Promise<Object>} - Supabase client
 */
async function createUserClient(email, password = 'Test123!') {
  try {
    const userClient = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    });
    
    const { data, error } = await userClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Ingelogd als:`, email);
    return userClient;
  } catch (error) {
    console.error(`❌ Fout bij inloggen als ${email}:`, error);
    throw error;
  }
}

/**
 * Maak testdata aan voor een gebruiker
 * @param {String} userId - Gebruikers ID
 * @param {String} prefix - Prefix voor namen
 * @returns {Promise<Object>} - Object met testdata IDs
 */
async function createTestData(userId, prefix) {
  try {
    // Maak een project aan
    const { data: project, error: projectError } = await adminClient
      .from('projects')
      .insert({
        name: `${prefix} Project`,
        description: `Test project voor ${prefix}`,
        user_id: userId,
        settings: { testSetting: true }
      })
      .select()
      .single();
    
    if (projectError) {
      throw projectError;
    }
    
    // Maak een scrape job aan
    const { data: job, error: jobError } = await adminClient
      .from('scrape_jobs')
      .insert({
        project_id: project.id,
        platform: 'amazon',
        options: { productId: 'B08F2HKLRK', domain: 'com' },
        status: 'completed'
      })
      .select()
      .single();
    
    if (jobError) {
      throw jobError;
    }
    
    // Maak een scrape resultaat aan
    const { data: result, error: resultError } = await adminClient
      .from('scrape_results')
      .insert({
        job_id: job.id,
        project_id: project.id,
        platform: 'amazon',
        options: { productId: 'B08F2HKLRK', domain: 'com' },
        result: { reviews: [{ id: '123', title: 'Test', content: 'Test content' }] },
        processed: false
      })
      .select()
      .single();
    
    if (resultError) {
      throw resultError;
    }
    
    // Maak een inzicht aan
    const { data: insight, error: insightError } = await adminClient
      .from('insights')
      .insert({
        project_id: project.id,
        result_id: result.id,
        type: 'sentiment',
        category: 'product_quality',
        data: { sentiment: 'positive', score: 0.9 }
      })
      .select()
      .single();
    
    if (insightError) {
      throw insightError;
    }
    
    console.log(`✅ Testdata aangemaakt voor ${prefix}`);
    return {
      projectId: project.id,
      jobId: job.id,
      resultId: result.id,
      insightId: insight.id
    };
  } catch (error) {
    console.error(`❌ Fout bij aanmaken van testdata voor ${prefix}:`, error);
    throw error;
  }
}

/**
 * Test RLS policies voor een gebruiker
 * @param {Object} userClient - Supabase client voor de gebruiker
 * @param {Object} ownData - Eigen data IDs
 * @param {Object} otherData - Data IDs van andere gebruiker
 * @returns {Promise<Object>} - Testresultaten
 */
async function testRLSPolicies(userClient, ownData, otherData) {
  const results = {
    projects: { ownAccess: false, otherAccess: false },
    jobs: { ownAccess: false, otherAccess: false },
    results: { ownAccess: false, otherAccess: false },
    insights: { ownAccess: false, otherAccess: false }
  };
  
  try {
    // Test toegang tot eigen project
    const { data: ownProject, error: ownProjectError } = await userClient
      .from('projects')
      .select()
      .eq('id', ownData.projectId)
      .single();
    
    results.projects.ownAccess = !!ownProject && !ownProjectError;
    
    // Test toegang tot project van andere gebruiker
    const { data: otherProject, error: otherProjectError } = await userClient
      .from('projects')
      .select()
      .eq('id', otherData.projectId)
      .single();
    
    results.projects.otherAccess = !!otherProject && !otherProjectError;
    
    // Test toegang tot eigen job
    const { data: ownJob, error: ownJobError } = await userClient
      .from('scrape_jobs')
      .select()
      .eq('id', ownData.jobId)
      .single();
    
    results.jobs.ownAccess = !!ownJob && !ownJobError;
    
    // Test toegang tot job van andere gebruiker
    const { data: otherJob, error: otherJobError } = await userClient
      .from('scrape_jobs')
      .select()
      .eq('id', otherData.jobId)
      .single();
    
    results.jobs.otherAccess = !!otherJob && !otherJobError;
    
    // Test toegang tot eigen resultaat
    const { data: ownResult, error: ownResultError } = await userClient
      .from('scrape_results')
      .select()
      .eq('id', ownData.resultId)
      .single();
    
    results.results.ownAccess = !!ownResult && !ownResultError;
    
    // Test toegang tot resultaat van andere gebruiker
    const { data: otherResult, error: otherResultError } = await userClient
      .from('scrape_results')
      .select()
      .eq('id', otherData.resultId)
      .single();
    
    results.results.otherAccess = !!otherResult && !otherResultError;
    
    // Test toegang tot eigen inzicht
    const { data: ownInsight, error: ownInsightError } = await userClient
      .from('insights')
      .select()
      .eq('id', ownData.insightId)
      .single();
    
    results.insights.ownAccess = !!ownInsight && !ownInsightError;
    
    // Test toegang tot inzicht van andere gebruiker
    const { data: otherInsight, error: otherInsightError } = await userClient
      .from('insights')
      .select()
      .eq('id', otherData.insightId)
      .single();
    
    results.insights.otherAccess = !!otherInsight && !otherInsightError;
    
    return results;
  } catch (error) {
    console.error('❌ Fout bij testen van RLS policies:', error);
    throw error;
  }
}

/**
 * Evalueer de testresultaten
 * @param {Object} results - Testresultaten
 * @param {String} userRole - Gebruikersrol
 */
function evaluateResults(results, userRole) {
  const isAdmin = userRole === 'admin';
  let allCorrect = true;
  
  console.log(`\n📊 Resultaten voor ${userRole}:`);
  
  // Controleer toegang tot projecten
  console.log('Projects:');
  console.log(`  - Eigen project: ${results.projects.ownAccess ? '✅' : '❌'}`);
  console.log(`  - Ander project: ${results.projects.otherAccess === isAdmin ? '✅' : '❌'}`);
  
  if (!results.projects.ownAccess || results.projects.otherAccess !== isAdmin) {
    allCorrect = false;
  }
  
  // Controleer toegang tot jobs
  console.log('Scrape Jobs:');
  console.log(`  - Eigen job: ${results.jobs.ownAccess ? '✅' : '❌'}`);
  console.log(`  - Andere job: ${results.jobs.otherAccess === isAdmin ? '✅' : '❌'}`);
  
  if (!results.jobs.ownAccess || results.jobs.otherAccess !== isAdmin) {
    allCorrect = false;
  }
  
  // Controleer toegang tot resultaten
  console.log('Scrape Results:');
  console.log(`  - Eigen resultaat: ${results.results.ownAccess ? '✅' : '❌'}`);
  console.log(`  - Ander resultaat: ${results.results.otherAccess === isAdmin ? '✅' : '❌'}`);
  
  if (!results.results.ownAccess || results.results.otherAccess !== isAdmin) {
    allCorrect = false;
  }
  
  // Controleer toegang tot inzichten
  console.log('Insights:');
  console.log(`  - Eigen inzicht: ${results.insights.ownAccess ? '✅' : '❌'}`);
  console.log(`  - Ander inzicht: ${results.insights.otherAccess === isAdmin ? '✅' : '❌'}`);
  
  if (!results.insights.ownAccess || results.insights.otherAccess !== isAdmin) {
    allCorrect = false;
  }
  
  console.log(`\n${allCorrect ? '✅ Alle RLS policies werken correct voor ' + userRole : '❌ Niet alle RLS policies werken correct voor ' + userRole}`);
  return allCorrect;
}

/**
 * Hoofdfunctie voor het testen van RLS policies
 */
async function testRLS() {
  console.log('🔒 Testen van Row Level Security (RLS) policies...');
  
  try {
    // Maak testgebruikers aan
    const user1 = await createTestUser('user1@test.com', 'user');
    const user2 = await createTestUser('user2@test.com', 'user');
    const admin = await createTestUser('admin@test.com', 'admin');
    
    // Maak testdata aan voor elke gebruiker
    const user1Data = await createTestData(user1.id, 'User1');
    const user2Data = await createTestData(user2.id, 'User2');
    const adminData = await createTestData(admin.id, 'Admin');
    
    // Maak clients voor elke gebruiker
    const user1Client = await createUserClient('user1@test.com');
    const user2Client = await createUserClient('user2@test.com');
    const adminClient = await createUserClient('admin@test.com');
    
    // Test RLS policies voor user1
    console.log('\n🧪 Testen van RLS policies voor user1...');
    const user1Results = await testRLSPolicies(user1Client, user1Data, user2Data);
    const user1Correct = evaluateResults(user1Results, 'user');
    
    // Test RLS policies voor user2
    console.log('\n🧪 Testen van RLS policies voor user2...');
    const user2Results = await testRLSPolicies(user2Client, user2Data, user1Data);
    const user2Correct = evaluateResults(user2Results, 'user');
    
    // Test RLS policies voor admin
    console.log('\n🧪 Testen van RLS policies voor admin...');
    const adminResults = await testRLSPolicies(adminClient, adminData, user1Data);
    const adminCorrect = evaluateResults(adminResults, 'admin');
    
    // Eindresultaat
    console.log('\n🏁 RLS policy test voltooid');
    
    if (user1Correct && user2Correct && adminCorrect) {
      console.log('✅ Alle RLS policies werken correct');
    } else {
      console.error('❌ Niet alle RLS policies werken correct');
    }
  } catch (error) {
    console.error('❌ Fout bij testen van RLS policies:', error);
  }
}

// Voer de test uit
testRLS().catch(error => {
  console.error('❌ Onverwachte fout bij testen van RLS policies:', error);
});
