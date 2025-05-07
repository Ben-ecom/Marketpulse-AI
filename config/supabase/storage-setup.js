/**
 * Supabase Storage Buckets Setup Script
 * 
 * Dit script maakt de benodigde storage buckets aan in Supabase
 * en configureert de toegangscontroles en CORS instellingen.
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

// Configuratie voor storage buckets
const buckets = [
  {
    id: 'datasets',
    name: 'datasets',
    public: false,
    fileSizeLimit: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'application/json',
      'text/csv',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    cors: {
      allowedOrigins: ['*'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['*'],
      maxAgeSeconds: 3600
    }
  },
  {
    id: 'exports',
    name: 'exports',
    public: false,
    fileSizeLimit: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: [
      'application/json',
      'text/csv',
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip'
    ],
    cors: {
      allowedOrigins: ['*'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['*'],
      maxAgeSeconds: 3600
    }
  }
];

/**
 * Maak een storage bucket aan
 * @param {Object} bucket - Bucket configuratie
 * @returns {Promise<void>}
 */
async function createBucket(bucket) {
  try {
    // Controleer of de bucket al bestaat
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }
    
    const bucketExists = existingBuckets.some(b => b.name === bucket.id);
    
    if (bucketExists) {
      console.log(`Bucket '${bucket.id}' bestaat al, bijwerken...`);
      
      // Update de bucket
      const { error: updateError } = await supabase.storage.updateBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });
      
      if (updateError) {
        throw updateError;
      }
      
      console.log(`✅ Bucket '${bucket.id}' bijgewerkt`);
    } else {
      // Maak een nieuwe bucket aan
      const { error: createError } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });
      
      if (createError) {
        throw createError;
      }
      
      console.log(`✅ Bucket '${bucket.id}' aangemaakt`);
    }
    
    // Configureer CORS instellingen
    // Opmerking: Supabase JS client ondersteunt momenteel geen CORS configuratie
    // Dit moet handmatig worden gedaan in de Supabase dashboard of via de REST API
    console.log(`ℹ️ CORS instellingen voor bucket '${bucket.id}' moeten handmatig worden geconfigureerd in de Supabase dashboard`);
    
    return true;
  } catch (error) {
    console.error(`❌ Fout bij aanmaken/bijwerken van bucket '${bucket.id}':`, error);
    return false;
  }
}

/**
 * Test de storage functionaliteit door een bestand te uploaden en op te halen
 * @param {String} bucketId - Bucket ID
 * @returns {Promise<boolean>} - True als de test succesvol is, anders False
 */
async function testStorage(bucketId) {
  try {
    // Maak een testbestand
    const testData = JSON.stringify({
      test: 'data',
      timestamp: new Date().toISOString(),
      bucket: bucketId
    }, null, 2);
    
    const testFilePath = `test/test-file-${Date.now()}.json`;
    
    // Upload het testbestand
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketId)
      .upload(testFilePath, testData, {
        contentType: 'application/json',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      throw uploadError;
    }
    
    console.log(`✅ Testbestand geüpload naar '${bucketId}/${testFilePath}'`);
    
    // Haal het testbestand op
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(bucketId)
      .download(testFilePath);
    
    if (downloadError) {
      throw downloadError;
    }
    
    // Converteer de gedownloade data naar tekst
    const downloadedText = await downloadData.text();
    
    // Controleer of de gedownloade data overeenkomt met de geüploade data
    if (downloadedText === testData) {
      console.log(`✅ Testbestand succesvol gedownload van '${bucketId}/${testFilePath}'`);
    } else {
      console.error(`❌ Gedownloade data komt niet overeen met geüploade data voor '${bucketId}/${testFilePath}'`);
      return false;
    }
    
    // Verwijder het testbestand
    const { error: removeError } = await supabase.storage
      .from(bucketId)
      .remove([testFilePath]);
    
    if (removeError) {
      throw removeError;
    }
    
    console.log(`✅ Testbestand verwijderd van '${bucketId}/${testFilePath}'`);
    
    return true;
  } catch (error) {
    console.error(`❌ Fout bij testen van storage functionaliteit voor bucket '${bucketId}':`, error);
    return false;
  }
}

/**
 * Hoofdfunctie voor het opzetten van storage buckets
 */
async function setupStorage() {
  console.log('🗄️ Opzetten van Supabase storage buckets...');
  
  let success = true;
  
  // Maak alle buckets aan
  for (const bucket of buckets) {
    const bucketSuccess = await createBucket(bucket);
    if (!bucketSuccess) {
      success = false;
    }
  }
  
  if (success) {
    console.log('✅ Alle storage buckets zijn aangemaakt/bijgewerkt');
    
    // Test de storage functionaliteit
    console.log('🧪 Testen van storage functionaliteit...');
    
    for (const bucket of buckets) {
      const testSuccess = await testStorage(bucket.id);
      if (!testSuccess) {
        success = false;
      }
    }
    
    if (success) {
      console.log('✅ Storage functionaliteit werkt correct voor alle buckets');
    } else {
      console.error('❌ Storage functionaliteit werkt niet correct voor alle buckets');
    }
  } else {
    console.error('❌ Niet alle storage buckets konden worden aangemaakt/bijgewerkt');
  }
  
  console.log('🏁 Storage setup voltooid');
}

// Voer de setup uit
setupStorage().catch(error => {
  console.error('❌ Onverwachte fout bij opzetten van storage buckets:', error);
});
