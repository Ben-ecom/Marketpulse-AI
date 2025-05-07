/**
 * Test script voor de Automatische Configuratie Service
 * 
 * Dit script test de automatische configuratie van scraping parameters
 * op basis van minimale projectinformatie.
 */

import dotenv from 'dotenv';
import { generateAutoConfig } from '../services/autoConfigService.js';

// Test project data
const testProject = {
  name: 'Test Project',
  category: 'Kleding & Fashion',
  subcategory: 'Jassen & Blazers',
  description: 'Een oversized blazer voor vrouwen, gemaakt van hoogwaardige materialen. Perfect voor zowel casual als formele gelegenheden. Verkrijgbaar in verschillende kleuren.',
  product_url: 'https://example.com/products/oversized-blazer',
  target_gender: 'female',
  platforms: {
    reddit: true,
    amazon: true,
    instagram: true,
    tiktok: false,
    market_analysis: true
  },
  keywords: ['oversized blazer', 'damesmode', 'casual chic'],
  competitors: [
    'https://www.amazon.com/dp/B07JW9H4J1',
    'https://www.example.com/competitor1'
  ],
  geographic_focus: 'EU'
};

// Test de automatische configuratie
async function testAutoConfig() {
  try {
    console.log('Start test automatische configuratie...');
    console.log('Test project data:', JSON.stringify(testProject, null, 2));
    
    // Genereer automatische configuratie
    const config = await generateAutoConfig(testProject);
    
    console.log('\nGegenereerde configuratie:');
    console.log(JSON.stringify(config, null, 2));
    
    // Valideer de configuratie
    console.log('\nValidatie resultaten:');
    
    // Controleer of alle geselecteerde platforms zijn geconfigureerd
    Object.keys(testProject.platforms).forEach(platform => {
      if (testProject.platforms[platform]) {
        if (platform === 'instagram' || platform === 'tiktok') {
          console.log(`- Platform ${platform}: ${config.platforms.social_media ? 'OK' : 'ONTBREEKT'}`);
        } else {
          console.log(`- Platform ${platform}: ${config.platforms[platform] ? 'OK' : 'ONTBREEKT'}`);
        }
      }
    });
    
    // Controleer of keywords zijn gegenereerd
    console.log(`- Keywords: ${config.keywords.length > 0 ? 'OK' : 'ONTBREEKT'}`);
    
    // Controleer of de configuratie alle benodigde velden bevat
    console.log(`- Project ID: ${config.project_id !== undefined ? 'OK' : 'ONTBREEKT'}`);
    console.log(`- Generated At: ${config.generated_at ? 'OK' : 'ONTBREEKT'}`);
    console.log(`- Status: ${config.status ? 'OK' : 'ONTBREEKT'}`);
    
    console.log('\nTest voltooid!');
  } catch (error) {
    console.error('Fout bij het testen van de automatische configuratie:', error);
  }
}

// Voer de test uit
testAutoConfig();
