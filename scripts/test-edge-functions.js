/**
 * Test script voor Edge Functions
 * 
 * Dit script test de functionaliteit van de Edge Functions voor de Decodo API integratie.
 * Het voert verschillende test cases uit om te verifiëren dat de Edge Functions correct werken.
 * 
 * Gebruik: node test-edge-functions.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const readline = require('readline');

// Laad environment variables
dotenv.config();

// Supabase configuratie
const supabaseUrl = process.env.SUPABASE_URL || 'https://iyeyypnvcickhdlqvhqq.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXl5cG52Y2lja2hkbHF2aHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODM1NjQwMDUsImV4cCI6MTk5OTE0MDAwNX0.OxhD-NNn3Z_Jom1xTXvIeQXk9fYrLpzLOBH9rvOZO9I';

// Initialiseer Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test URLs
const testUrls = {
  reddit: 'https://www.reddit.com/r/DutchFIRE/',
  amazon: 'https://www.amazon.nl/dp/B08H93ZRK9',
  instagram: 'https://www.instagram.com/marketpulse.ai/',
  tiktok: 'https://www.tiktok.com/@marketpulse.ai',
  trustpilot: 'https://nl.trustpilot.com/review/coolblue.nl'
};

// Test project ID (maak een nieuw project aan als deze niet bestaat)
let testProjectId = null;

// Readline interface voor gebruikersinput
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Vraag de gebruiker om een keuze te maken
 * @param {string} question - De vraag om te stellen
 * @param {Array} options - De beschikbare opties
 * @returns {Promise<number>} - De index van de gekozen optie
 */
function askQuestion(question, options) {
  return new Promise((resolve) => {
    console.log(question);
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
    
    rl.question('Keuze: ', (answer) => {
      const choice = parseInt(answer, 10);
      if (isNaN(choice) || choice < 1 || choice > options.length) {
        console.log('Ongeldige keuze. Probeer opnieuw.');
        resolve(askQuestion(question, options));
      } else {
        resolve(choice - 1);
      }
    });
  });
}

/**
 * Maak een nieuw test project aan
 * @returns {Promise<string>} - Het ID van het nieuwe project
 */
async function createTestProject() {
  console.log('Aanmaken van een nieuw test project...');
  
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: 'Edge Functions Test Project',
      description: 'Project voor het testen van Edge Functions',
      niche: 'e-commerce',
      status: 'active'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Fout bij het aanmaken van test project:', error);
    throw error;
  }
  
  console.log(`Test project aangemaakt met ID: ${data.id}`);
  return data.id;
}

/**
 * Haal bestaande projecten op
 * @returns {Promise<Array>} - Lijst met projecten
 */
async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Fout bij het ophalen van projecten:', error);
    throw error;
  }
  
  return data;
}

/**
 * Test de decodo-scraper Edge Function met synchrone scraping
 * @param {string} platform - Het platform om te testen
 * @returns {Promise<Object>} - Het resultaat van de test
 */
async function testSynchronousScraping(platform) {
  console.log(`\nTesten van synchrone scraping voor ${platform}...`);
  
  try {
    const { data, error } = await supabase.functions.invoke('decodo-scraper', {
      body: {
        action: 'scrape_sync',
        url: testUrls[platform],
        platform,
        projectId: testProjectId,
        contentType: 'page'
      }
    });
    
    if (error) {
      console.error(`Fout bij het testen van synchrone scraping voor ${platform}:`, error);
      return { success: false, error };
    }
    
    console.log(`Synchrone scraping voor ${platform} succesvol!`);
    console.log('Resultaat:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    
    return { success: true, data };
  } catch (error) {
    console.error(`Fout bij het testen van synchrone scraping voor ${platform}:`, error);
    return { success: false, error };
  }
}

/**
 * Test de decodo-scraper Edge Function met asynchrone scraping
 * @param {string} platform - Het platform om te testen
 * @returns {Promise<Object>} - Het resultaat van de test
 */
async function testAsynchronousScraping(platform) {
  console.log(`\nTesten van asynchrone scraping voor ${platform}...`);
  
  try {
    // Start de asynchrone taak
    const { data: taskData, error: taskError } = await supabase.functions.invoke('decodo-scraper', {
      body: {
        action: 'scrape_async',
        url: testUrls[platform],
        platform,
        projectId: testProjectId,
        contentType: 'page'
      }
    });
    
    if (taskError) {
      console.error(`Fout bij het starten van asynchrone scraping voor ${platform}:`, taskError);
      return { success: false, error: taskError };
    }
    
    console.log(`Asynchrone scraping taak gestart voor ${platform} met ID: ${taskData.task_id}`);
    
    // Wacht 5 seconden
    console.log('Wachten op resultaten (5 seconden)...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Haal de resultaten op
    const { data: resultData, error: resultError } = await supabase.functions.invoke('decodo-scraper', {
      body: {
        action: 'get_task_result',
        taskId: taskData.task_id,
        platform,
        projectId: testProjectId,
        contentType: 'page'
      }
    });
    
    if (resultError) {
      console.error(`Fout bij het ophalen van asynchrone scraping resultaten voor ${platform}:`, resultError);
      return { success: false, error: resultError };
    }
    
    console.log(`Asynchrone scraping voor ${platform} status: ${resultData.status}`);
    
    if (resultData.status === 'completed') {
      console.log('Resultaat:', JSON.stringify(resultData.data, null, 2).substring(0, 200) + '...');
    } else {
      console.log('Taak nog niet voltooid. Controleer later opnieuw.');
    }
    
    return { success: true, data: resultData };
  } catch (error) {
    console.error(`Fout bij het testen van asynchrone scraping voor ${platform}:`, error);
    return { success: false, error };
  }
}

/**
 * Test de generate-recommendations Edge Function
 * @returns {Promise<Object>} - Het resultaat van de test
 */
async function testGenerateRecommendations() {
  console.log('\nTesten van aanbevelingen genereren...');
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-recommendations', {
      body: {
        action: 'generate_recommendations',
        projectId: testProjectId
      }
    });
    
    if (error) {
      console.error('Fout bij het genereren van aanbevelingen:', error);
      return { success: false, error };
    }
    
    console.log('Aanbevelingen succesvol gegenereerd!');
    console.log('Resultaat:', JSON.stringify(data, null, 2));
    
    return { success: true, data };
  } catch (error) {
    console.error('Fout bij het genereren van aanbevelingen:', error);
    return { success: false, error };
  }
}

/**
 * Test de generate-recommendations Edge Function voor awareness fasen
 * @returns {Promise<Object>} - Het resultaat van de test
 */
async function testGenerateAwarenessRecommendations() {
  console.log('\nTesten van awareness fase aanbevelingen genereren...');
  
  try {
    const { data, error } = await supabase.functions.invoke('generate-recommendations', {
      body: {
        action: 'generate_awareness_recommendations',
        projectId: testProjectId
      }
    });
    
    if (error) {
      console.error('Fout bij het genereren van awareness fase aanbevelingen:', error);
      return { success: false, error };
    }
    
    console.log('Awareness fase aanbevelingen succesvol gegenereerd!');
    console.log('Resultaat:', JSON.stringify(data, null, 2));
    
    return { success: true, data };
  } catch (error) {
    console.error('Fout bij het genereren van awareness fase aanbevelingen:', error);
    return { success: false, error };
  }
}

/**
 * Hoofdfunctie die alle tests uitvoert
 */
async function runTests() {
  try {
    console.log('=== Edge Functions Test Script ===');
    
    // Kies een project
    const projects = await getProjects();
    
    if (projects.length > 0) {
      console.log('\nBestaande projecten:');
      projects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name} (${project.id})`);
      });
      
      const createNewOption = 'Nieuw test project aanmaken';
      const choice = await askQuestion('\nKies een project of maak een nieuw project aan:', [
        ...projects.map(p => p.name),
        createNewOption
      ]);
      
      if (choice === projects.length) {
        testProjectId = await createTestProject();
      } else {
        testProjectId = projects[choice].id;
        console.log(`Project "${projects[choice].name}" geselecteerd met ID: ${testProjectId}`);
      }
    } else {
      console.log('Geen bestaande projecten gevonden. Een nieuw test project wordt aangemaakt.');
      testProjectId = await createTestProject();
    }
    
    // Kies een platform om te testen
    const platformChoice = await askQuestion('\nKies een platform om te testen:', [
      'Reddit',
      'Amazon',
      'Instagram',
      'TikTok',
      'Trustpilot',
      'Alle platforms'
    ]);
    
    const platforms = ['reddit', 'amazon', 'instagram', 'tiktok', 'trustpilot'];
    const selectedPlatforms = platformChoice === 5 ? platforms : [platforms[platformChoice]];
    
    // Kies een test type
    const testTypeChoice = await askQuestion('\nKies een test type:', [
      'Synchrone scraping',
      'Asynchrone scraping',
      'Aanbevelingen genereren',
      'Awareness fase aanbevelingen genereren',
      'Alle tests'
    ]);
    
    // Voer de geselecteerde tests uit
    const results = {};
    
    if (testTypeChoice === 0 || testTypeChoice === 4) {
      for (const platform of selectedPlatforms) {
        results[`sync_${platform}`] = await testSynchronousScraping(platform);
      }
    }
    
    if (testTypeChoice === 1 || testTypeChoice === 4) {
      for (const platform of selectedPlatforms) {
        results[`async_${platform}`] = await testAsynchronousScraping(platform);
      }
    }
    
    if (testTypeChoice === 2 || testTypeChoice === 4) {
      results.recommendations = await testGenerateRecommendations();
    }
    
    if (testTypeChoice === 3 || testTypeChoice === 4) {
      results.awareness = await testGenerateAwarenessRecommendations();
    }
    
    // Toon een samenvatting van de resultaten
    console.log('\n=== Test Resultaten ===');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const [testName, result] of Object.entries(results)) {
      if (result.success) {
        console.log(`✅ ${testName}: Succesvol`);
        successCount++;
      } else {
        console.log(`❌ ${testName}: Mislukt - ${result.error.message || 'Onbekende fout'}`);
        failCount++;
      }
    }
    
    console.log(`\nTotaal: ${successCount} succesvol, ${failCount} mislukt`);
    
  } catch (error) {
    console.error('Onverwachte fout tijdens het uitvoeren van tests:', error);
  } finally {
    rl.close();
  }
}

// Start de tests
runTests();