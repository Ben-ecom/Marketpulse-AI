/**
 * test-notification-system.js
 * 
 * Script voor het testen van het notificatiesysteem.
 * Dit script maakt testgebruikers aan, stelt drempelwaarden in en genereert testnotificaties.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase client initialiseren
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL en Service Key moeten worden ingesteld in de .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test gebruiker ID (vervang door een echte gebruiker ID)
const TEST_USER_ID = process.env.TEST_USER_ID;

if (!TEST_USER_ID) {
  console.error('TEST_USER_ID moet worden ingesteld in de .env file');
  process.exit(1);
}

// Functie voor het aanmaken van testnotificatie-instellingen
async function createTestNotificationSettings() {
  try {
    console.log('Aanmaken van testnotificatie-instellingen...');
    
    // Voorbeeld drempelwaarden
    const thresholds = [
      {
        id: crypto.randomUUID(),
        metric: 'totalInteractions',
        operator: 'gt',
        value: 100,
        message: 'Het totaal aantal interacties heeft 100 overschreden!',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        metric: 'feedbackSubmissionRate',
        operator: 'lt',
        value: 20,
        message: 'Het feedback indieningspercentage is onder de 20% gedaald!',
        created_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        metric: 'positiveFeedbackRate',
        operator: 'lt',
        value: 70,
        message: 'Het positieve feedback percentage is onder de 70% gedaald!',
        created_at: new Date().toISOString()
      }
    ];
    
    // Notificatiemethoden
    const notification_methods = {
      in_app: true,
      email: false
    };
    
    // Aanmaken of bijwerken van notificatie-instellingen
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: TEST_USER_ID,
        thresholds,
        notification_methods,
        enabled: true,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Fout bij aanmaken notificatie-instellingen:', error);
      return;
    }
    
    console.log('Testnotificatie-instellingen aangemaakt:', data);
    return data;
  } catch (error) {
    console.error('Fout bij aanmaken testnotificatie-instellingen:', error);
  }
}

// Functie voor het aanmaken van testnotificaties
async function createTestNotifications() {
  try {
    console.log('Aanmaken van testnotificaties...');
    
    // Haal eerst de notificatie-instellingen op
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .single();
    
    if (settingsError) {
      console.error('Fout bij ophalen notificatie-instellingen:', settingsError);
      return;
    }
    
    // Maak testnotificaties aan voor elke drempelwaarde
    const notifications = [];
    
    for (const threshold of settings.thresholds) {
      const notification = {
        id: crypto.randomUUID(),
        user_id: TEST_USER_ID,
        threshold_id: threshold.id,
        metric: threshold.metric,
        operator: threshold.operator,
        value: threshold.value,
        current_value: threshold.metric === 'totalInteractions' ? 150 : 10,
        message: threshold.message || `${threshold.metric} heeft de drempelwaarde overschreden`,
        read: false,
        created_at: new Date().toISOString()
      };
      
      notifications.push(notification);
    }
    
    // Voeg de notificaties toe aan de database
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();
    
    if (error) {
      console.error('Fout bij aanmaken testnotificaties:', error);
      return;
    }
    
    console.log(`${data.length} testnotificaties aangemaakt:`, data);
    return data;
  } catch (error) {
    console.error('Fout bij aanmaken testnotificaties:', error);
  }
}

// Functie voor het ophalen van notificaties
async function getNotifications() {
  try {
    console.log('Ophalen van notificaties...');
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fout bij ophalen notificaties:', error);
      return;
    }
    
    console.log(`${data.length} notificaties gevonden:`, data);
    return data;
  } catch (error) {
    console.error('Fout bij ophalen notificaties:', error);
  }
}

// Functie voor het markeren van notificaties als gelezen
async function markNotificationsAsRead() {
  try {
    console.log('Markeren van notificaties als gelezen...');
    
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', TEST_USER_ID)
      .eq('read', false)
      .select();
    
    if (error) {
      console.error('Fout bij markeren notificaties als gelezen:', error);
      return;
    }
    
    console.log(`${data.length} notificaties gemarkeerd als gelezen:`, data);
    return data;
  } catch (error) {
    console.error('Fout bij markeren notificaties als gelezen:', error);
  }
}

// Functie voor het verwijderen van alle testnotificaties
async function clearTestNotifications() {
  try {
    console.log('Verwijderen van testnotificaties...');
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', TEST_USER_ID);
    
    if (error) {
      console.error('Fout bij verwijderen testnotificaties:', error);
      return;
    }
    
    console.log('Testnotificaties verwijderd');
  } catch (error) {
    console.error('Fout bij verwijderen testnotificaties:', error);
  }
}

// Hoofdfunctie voor het uitvoeren van de tests
async function runTests() {
  try {
    // Stap 1: Maak testnotificatie-instellingen aan
    await createTestNotificationSettings();
    
    // Stap 2: Maak testnotificaties aan
    await createTestNotifications();
    
    // Stap 3: Haal notificaties op
    const notifications = await getNotifications();
    
    // Stap 4: Markeer notificaties als gelezen
    await markNotificationsAsRead();
    
    // Stap 5: Haal notificaties opnieuw op om te controleren of ze als gelezen zijn gemarkeerd
    await getNotifications();
    
    // Stap 6: Verwijder testnotificaties (uitcommentariëren om notificaties te behouden)
    // await clearTestNotifications();
    
    console.log('Tests succesvol uitgevoerd!');
  } catch (error) {
    console.error('Fout bij uitvoeren tests:', error);
  }
}

// Voer de tests uit
runTests();
