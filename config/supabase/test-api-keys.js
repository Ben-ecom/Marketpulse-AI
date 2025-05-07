/**
 * Supabase API Keys en Service Roles Test Script
 * 
 * Dit script test de verschillende API keys en service roles in Supabase
 * om te verifiëren dat de permissies correct zijn ingesteld.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase URL en API keys
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL, SUPABASE_ANON_KEY en SUPABASE_SERVICE_KEY moeten worden ingesteld in .env');
  process.exit(1);
}

// Initialiseer clients met verschillende keys
const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Test de anon key met een niet-geauthenticeerde gebruiker
 * @returns {Promise<Object>} - Testresultaten
 */
async function testAnonKeyUnauthenticated() {
  console.log('\n🔑 Testen van anon key zonder authenticatie...');
  
  const results = {
    selectPublicData: false,
    insertData: false,
    bypassRLS: false
  };
  
  try {
    // Test SELECT op publieke data (zonder RLS)
    try {
      const { data, error } = await anonClient
        .from('public_info') // Deze tabel moet publiek toegankelijk zijn
        .select('*')
        .limit(1);
      
      results.selectPublicData = !error;
      console.log(`  - SELECT op publieke data: ${results.selectPublicData ? '✅' : '❌'}`);
      
      if (error) {
        console.error(`    Error: ${error.message}`);
      }
    } catch (error) {
      console.error(`  - SELECT op publieke data: ❌ (${error.message})`);
    }
    
    // Test INSERT in een beveiligde tabel (moet mislukken zonder authenticatie)
    try {
      const { error } = await anonClient
        .from('projects')
        .insert({
          name: 'Test Project',
          description: 'Test project aangemaakt door API key test',
          user_id: '00000000-0000-0000-0000-000000000000' // Niet-bestaande user_id
        });
      
      results.insertData = !!error; // Moet een error geven
      console.log(`  - INSERT in beveiligde tabel (moet mislukken): ${results.insertData ? '✅' : '❌'}`);
      
      if (!error) {
        console.error('    Error: INSERT is gelukt zonder authenticatie, dit zou niet moeten kunnen');
      }
    } catch (error) {
      results.insertData = true; // Exception is ook goed
      console.log(`  - INSERT in beveiligde tabel (moet mislukken): ✅ (${error.message})`);
    }
    
    // Test bypass van RLS (moet mislukken met anon key)
    try {
      const { data, error } = await anonClient.rpc('get_all_users_bypass_rls');
      
      results.bypassRLS = !!error; // Moet een error geven
      console.log(`  - Bypass van RLS (moet mislukken): ${results.bypassRLS ? '✅' : '❌'}`);
      
      if (!error) {
        console.error('    Error: RLS bypass is gelukt met anon key, dit zou niet moeten kunnen');
      }
    } catch (error) {
      results.bypassRLS = true; // Exception is ook goed
      console.log(`  - Bypass van RLS (moet mislukken): ✅ (${error.message})`);
    }
    
    // Eindresultaat
    const allPassed = results.selectPublicData && results.insertData && results.bypassRLS;
    console.log(`\n${allPassed ? '✅ Alle tests voor anon key zonder authenticatie zijn geslaagd' : '❌ Niet alle tests voor anon key zonder authenticatie zijn geslaagd'}`);
    
    return results;
  } catch (error) {
    console.error('❌ Fout bij testen van anon key zonder authenticatie:', error);
    return results;
  }
}

/**
 * Test de anon key met een geauthenticeerde gebruiker
 * @returns {Promise<Object>} - Testresultaten
 */
async function testAnonKeyAuthenticated() {
  console.log('\n🔑 Testen van anon key met authenticatie...');
  
  const results = {
    signUp: false,
    signIn: false,
    selectOwnData: false,
    insertOwnData: false,
    updateOwnData: false,
    deleteOwnData: false,
    accessOtherUserData: false
  };
  
  try {
    // Maak een test gebruiker aan
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test123!';
    
    // Test sign up
    try {
      const { data, error } = await anonClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      });
      
      results.signUp = !error && !!data.user;
      console.log(`  - Sign up: ${results.signUp ? '✅' : '❌'}`);
      
      if (error) {
        console.error(`    Error: ${error.message}`);
      }
    } catch (error) {
      console.error(`  - Sign up: ❌ (${error.message})`);
    }
    
    // Test sign in
    try {
      const { data, error } = await anonClient.auth.signInWithPassword({
        email,
        password
      });
      
      results.signIn = !error && !!data.user;
      console.log(`  - Sign in: ${results.signIn ? '✅' : '❌'}`);
      
      if (error) {
        console.error(`    Error: ${error.message}`);
        return results; // Stop als inloggen niet lukt
      }
      
      const userId = data.user.id;
      
      // Test SELECT van eigen data
      try {
        const { data: userData, error: userError } = await anonClient
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        results.selectOwnData = !userError && !!userData;
        console.log(`  - SELECT van eigen data: ${results.selectOwnData ? '✅' : '❌'}`);
        
        if (userError) {
          console.error(`    Error: ${userError.message}`);
        }
      } catch (error) {
        console.error(`  - SELECT van eigen data: ❌ (${error.message})`);
      }
      
      // Test INSERT van eigen data
      let projectId;
      try {
        const { data: projectData, error: projectError } = await anonClient
          .from('projects')
          .insert({
            name: 'Test Project',
            description: 'Test project aangemaakt door API key test',
            user_id: userId
          })
          .select()
          .single();
        
        results.insertOwnData = !projectError && !!projectData;
        console.log(`  - INSERT van eigen data: ${results.insertOwnData ? '✅' : '❌'}`);
        
        if (projectError) {
          console.error(`    Error: ${projectError.message}`);
        } else {
          projectId = projectData.id;
        }
      } catch (error) {
        console.error(`  - INSERT van eigen data: ❌ (${error.message})`);
      }
      
      // Test UPDATE van eigen data
      if (projectId) {
        try {
          const { data: updateData, error: updateError } = await anonClient
            .from('projects')
            .update({ description: 'Bijgewerkte beschrijving' })
            .eq('id', projectId)
            .select()
            .single();
          
          results.updateOwnData = !updateError && !!updateData;
          console.log(`  - UPDATE van eigen data: ${results.updateOwnData ? '✅' : '❌'}`);
          
          if (updateError) {
            console.error(`    Error: ${updateError.message}`);
          }
        } catch (error) {
          console.error(`  - UPDATE van eigen data: ❌ (${error.message})`);
        }
        
        // Test DELETE van eigen data
        try {
          const { error: deleteError } = await anonClient
            .from('projects')
            .delete()
            .eq('id', projectId);
          
          results.deleteOwnData = !deleteError;
          console.log(`  - DELETE van eigen data: ${results.deleteOwnData ? '✅' : '❌'}`);
          
          if (deleteError) {
            console.error(`    Error: ${deleteError.message}`);
          }
        } catch (error) {
          console.error(`  - DELETE van eigen data: ❌ (${error.message})`);
        }
      }
      
      // Test toegang tot data van andere gebruiker (moet mislukken)
      try {
        const { data: otherData, error: otherError } = await anonClient
          .from('users')
          .select('*')
          .neq('id', userId)
          .limit(1);
        
        results.accessOtherUserData = (otherData && otherData.length === 0) || !!otherError;
        console.log(`  - Toegang tot data van andere gebruiker (moet mislukken): ${results.accessOtherUserData ? '✅' : '❌'}`);
        
        if (!otherError && otherData && otherData.length > 0) {
          console.error('    Error: Toegang tot data van andere gebruiker is gelukt, dit zou niet moeten kunnen');
        }
      } catch (error) {
        results.accessOtherUserData = true; // Exception is ook goed
        console.log(`  - Toegang tot data van andere gebruiker (moet mislukken): ✅ (${error.message})`);
      }
      
      // Uitloggen
      await anonClient.auth.signOut();
    } catch (error) {
      console.error(`  - Sign in: ❌ (${error.message})`);
    }
    
    // Eindresultaat
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n${allPassed ? '✅ Alle tests voor anon key met authenticatie zijn geslaagd' : '❌ Niet alle tests voor anon key met authenticatie zijn geslaagd'}`);
    
    return results;
  } catch (error) {
    console.error('❌ Fout bij testen van anon key met authenticatie:', error);
    return results;
  }
}

/**
 * Test de service role key
 * @returns {Promise<Object>} - Testresultaten
 */
async function testServiceKey() {
  console.log('\n🔑 Testen van service role key...');
  
  const results = {
    bypassRLS: false,
    adminOperations: false,
    createUser: false,
    deleteUser: false
  };
  
  try {
    // Test bypass van RLS
    try {
      // Deze query zou normaal gesproken gefilterd worden door RLS
      const { data, error } = await serviceClient
        .from('users')
        .select('*')
        .limit(5);
      
      results.bypassRLS = !error && !!data;
      console.log(`  - Bypass van RLS: ${results.bypassRLS ? '✅' : '❌'}`);
      
      if (error) {
        console.error(`    Error: ${error.message}`);
      }
    } catch (error) {
      console.error(`  - Bypass van RLS: ❌ (${error.message})`);
    }
    
    // Test admin operaties
    try {
      // Haal alle gebruikers op (admin operatie)
      const { data, error } = await serviceClient.auth.admin.listUsers();
      
      results.adminOperations = !error && !!data;
      console.log(`  - Admin operaties: ${results.adminOperations ? '✅' : '❌'}`);
      
      if (error) {
        console.error(`    Error: ${error.message}`);
      }
    } catch (error) {
      console.error(`  - Admin operaties: ❌ (${error.message})`);
    }
    
    // Test aanmaken van gebruiker
    let userId;
    try {
      const email = `service-test-${Date.now()}@example.com`;
      const { data, error } = await serviceClient.auth.admin.createUser({
        email,
        password: 'Test123!',
        email_confirm: true
      });
      
      results.createUser = !error && !!data.user;
      console.log(`  - Aanmaken van gebruiker: ${results.createUser ? '✅' : '❌'}`);
      
      if (error) {
        console.error(`    Error: ${error.message}`);
      } else {
        userId = data.user.id;
      }
    } catch (error) {
      console.error(`  - Aanmaken van gebruiker: ❌ (${error.message})`);
    }
    
    // Test verwijderen van gebruiker
    if (userId) {
      try {
        const { error } = await serviceClient.auth.admin.deleteUser(userId);
        
        results.deleteUser = !error;
        console.log(`  - Verwijderen van gebruiker: ${results.deleteUser ? '✅' : '❌'}`);
        
        if (error) {
          console.error(`    Error: ${error.message}`);
        }
      } catch (error) {
        console.error(`  - Verwijderen van gebruiker: ❌ (${error.message})`);
      }
    }
    
    // Eindresultaat
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n${allPassed ? '✅ Alle tests voor service role key zijn geslaagd' : '❌ Niet alle tests voor service role key zijn geslaagd'}`);
    
    return results;
  } catch (error) {
    console.error('❌ Fout bij testen van service role key:', error);
    return results;
  }
}

/**
 * Hoofdfunctie voor het testen van API keys
 */
async function testApiKeys() {
  console.log('🔐 Testen van Supabase API keys en service roles...');
  
  try {
    // Test anon key zonder authenticatie
    const anonUnauthResults = await testAnonKeyUnauthenticated();
    
    // Test anon key met authenticatie
    const anonAuthResults = await testAnonKeyAuthenticated();
    
    // Test service role key
    const serviceResults = await testServiceKey();
    
    // Eindresultaat
    const allAnonUnauthPassed = Object.values(anonUnauthResults).every(result => result);
    const allAnonAuthPassed = Object.values(anonAuthResults).every(result => result);
    const allServicePassed = Object.values(serviceResults).every(result => result);
    
    console.log('\n🏁 API key tests voltooid');
    console.log(`  - Anon key zonder authenticatie: ${allAnonUnauthPassed ? '✅' : '❌'}`);
    console.log(`  - Anon key met authenticatie: ${allAnonAuthPassed ? '✅' : '❌'}`);
    console.log(`  - Service role key: ${allServicePassed ? '✅' : '❌'}`);
    
    if (allAnonUnauthPassed && allAnonAuthPassed && allServicePassed) {
      console.log('\n✅ Alle API key tests zijn geslaagd');
    } else {
      console.error('\n❌ Niet alle API key tests zijn geslaagd');
    }
  } catch (error) {
    console.error('❌ Fout bij testen van API keys:', error);
  }
}

// Voer de tests uit
testApiKeys().catch(error => {
  console.error('❌ Onverwachte fout bij testen van API keys:', error);
});
