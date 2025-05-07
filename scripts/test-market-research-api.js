/**
 * Test script voor de Market Research API
 * 
 * Dit script test de verschillende endpoints van de Market Research API
 * door testverzoeken te sturen en de resultaten te loggen.
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// API basis URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Test data
const testMarketData = {
  marketData: {
    industry: 'SaaS',
    region: 'Europa',
    totalMarketSize: 15000000000,
    growthRate: 0.12,
    maturityLevel: 'growing'
  },
  demographicData: {
    ageGroups: ['18-24', '25-34', '35-44', '45-54'],
    incomeLevel: ['Midden', 'Hoog'],
    location: ['Stedelijk', 'Voorstedelijk']
  },
  competitorData: [
    {
      name: 'Competitor A',
      marketShare: 0.25,
      strengths: 'Sterke merkbekendheid, uitgebreid productaanbod',
      weaknesses: 'Hoge prijzen, matige klantenservice',
      pricing: 'Premium'
    },
    {
      name: 'Competitor B',
      marketShare: 0.18,
      strengths: 'Innovatieve producten, goede UX',
      weaknesses: 'Beperkt bereik, minder functies',
      pricing: 'Mid-range'
    },
    {
      name: 'Competitor C',
      marketShare: 0.15,
      strengths: 'Lage prijzen, goede waarde',
      weaknesses: 'Basis functionaliteit, minder betrouwbaar',
      pricing: 'Budget'
    },
    {
      name: 'Own',
      isOwn: true,
      marketShare: 0.05,
      strengths: 'Innovatieve technologie, gebruiksvriendelijk',
      weaknesses: 'Nieuw in de markt, beperkte bekendheid',
      pricing: 'Mid-range'
    }
  ],
  priceData: {
    minPrice: 9.99,
    maxPrice: 99.99,
    averagePrice: 49.99,
    pricePoints: [9.99, 19.99, 49.99, 99.99]
  },
  trendData: {
    trends: [
      {
        name: 'Toenemende vraag naar AI-integratie',
        direction: 'up',
        impact: 'high',
        description: 'Steeds meer bedrijven zoeken naar SaaS-oplossingen met AI-mogelijkheden'
      },
      {
        name: 'Verschuiving naar mobiel-eerst',
        direction: 'up',
        impact: 'medium',
        description: 'Gebruikers verwachten volledige functionaliteit op mobiele apparaten'
      },
      {
        name: 'Prijsgevoeligheid in het middensegment',
        direction: 'down',
        impact: 'medium',
        description: 'Toenemende prijsconcurrentie in het middensegment van de markt'
      }
    ]
  }
};

// Mock JWT token voor authenticatie
// In een echte omgeving zou je deze verkrijgen via het inlogproces
const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

// Axios instantie met auth header
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${mockJwtToken}`
  }
});

/**
 * Test de marktanalyse endpoint
 */
async function testMarketAnalysis() {
  try {
    console.log('🧪 Testing Market Analysis API...');
    
    // Stel NODE_ENV in op development om mock data te forceren
    process.env.NODE_ENV = 'development';
    process.env.USE_MOCK_DATA = 'true';
    
    // Testdata met de juiste structuur voor de API
    const testData = {
      marketData: {
        industry: 'SaaS',
        region: 'Europa',
        totalMarketSize: 15000000000,
        growthRate: 0.12,
        maturityLevel: 'growing'
      },
      segmentation: {
        segments: [
          { name: 'Enterprise', size: 0.45 },
          { name: 'Mid-market', size: 0.35 },
          { name: 'SMB', size: 0.20 }
        ]
      },
      competitorData: [
        {
          name: 'Competitor A',
          marketShare: 0.25,
          strengths: 'Sterke merkbekendheid, uitgebreid productaanbod',
          weaknesses: 'Hoge prijzen, matige klantenservice',
          pricing: 'Premium'
        },
        {
          name: 'Competitor B',
          marketShare: 0.18,
          strengths: 'Innovatieve producten, goede UX',
          weaknesses: 'Beperkt bereik, minder functies',
          pricing: 'Mid-range'
        }
      ],
      priceData: {
        minPrice: 9.99,
        maxPrice: 99.99,
        averagePrice: 49.99,
        pricePoints: [9.99, 19.99, 49.99, 99.99]
      },
      trendData: {
        trends: [
          {
            name: 'Toenemende vraag naar AI-integratie',
            direction: 'up',
            impact: 'high',
            description: 'Steeds meer bedrijven zoeken naar SaaS-oplossingen met AI-mogelijkheden'
          }
        ]
      }
    };
    
    console.log('Sending test data to analyze endpoint...');
    const response = await api.post('/market-research/analyze', testData);
    console.log('✅ Market Analysis API Test Success:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Results available:', Object.keys(response.data.results).join(', '));
  } catch (error) {
    console.error('❌ Market Analysis API Test Failed:', error.response?.data || error.message);
  }
}

/**
 * Test de marktinzichten endpoint
 */
async function testMarketInsights() {
  try {
    console.log('\n🧪 Testing Market Insights API...');
    
    // Stel NODE_ENV in op development om mock data te forceren
    process.env.NODE_ENV = 'development';
    process.env.USE_MOCK_DATA = 'true';
    
    // Testdata met de juiste structuur voor de API
    const testData = {
      marketData: {
        industry: 'SaaS',
        region: 'Europa',
        totalMarketSize: 15000000000,
        growthRate: 0.12,
        maturityLevel: 'growing'
      },
      segmentation: {
        segments: [
          { name: 'Enterprise', size: 0.45 },
          { name: 'Mid-market', size: 0.35 },
          { name: 'SMB', size: 0.20 }
        ]
      },
      competitorData: [
        {
          name: 'Competitor A',
          marketShare: 0.25,
          strengths: 'Sterke merkbekendheid, uitgebreid productaanbod',
          weaknesses: 'Hoge prijzen, matige klantenservice',
          pricing: 'Premium'
        },
        {
          name: 'Competitor B',
          marketShare: 0.18,
          strengths: 'Innovatieve producten, goede UX',
          weaknesses: 'Beperkt bereik, minder functies',
          pricing: 'Mid-range'
        }
      ],
      priceData: {
        minPrice: 9.99,
        maxPrice: 99.99,
        averagePrice: 49.99,
        pricePoints: [9.99, 19.99, 49.99, 99.99]
      },
      trendData: {
        trends: [
          {
            name: 'Toenemende vraag naar AI-integratie',
            direction: 'up',
            impact: 'high',
            description: 'Steeds meer bedrijven zoeken naar SaaS-oplossingen met AI-mogelijkheden'
          }
        ]
      },
      options: {
        includeRecommendations: true,
        detailLevel: 'high',
        focusAreas: ['opportunities', 'competitors']
      }
    };
    
    console.log('Sending test data to insights endpoint...');
    const response = await api.post('/market-research/insights', testData);
    console.log('✅ Market Insights API Test Success:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Insights available:', Object.keys(response.data.insights).join(', '));
  } catch (error) {
    console.error('❌ Market Insights API Test Failed:', error.response?.data || error.message);
  }
}

/**
 * Test de prijsanalyse endpoint
 */
async function testPriceAnalysis() {
  try {
    console.log('\n🧪 Testing Price Analysis API...');
    const response = await api.post('/market-research/price-analysis', { 
      priceData: testMarketData.priceData,
      competitorData: testMarketData.competitorData
    });
    console.log('✅ Price Analysis API Test Success:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Price Analysis available:', Object.keys(response.data.priceAnalysis).join(', '));
  } catch (error) {
    console.error('❌ Price Analysis API Test Failed:', error.response?.data || error.message);
  }
}

/**
 * Test de concurrentieanalyse endpoint
 */
async function testCompetitorAnalysis() {
  try {
    console.log('\n🧪 Testing Competitor Analysis API...');
    const response = await api.post('/market-research/competitor-analysis', { 
      competitorData: testMarketData.competitorData
    });
    console.log('✅ Competitor Analysis API Test Success:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Competitor Analysis available:', Object.keys(response.data.competitorAnalysis).join(', '));
  } catch (error) {
    console.error('❌ Competitor Analysis API Test Failed:', error.response?.data || error.message);
  }
}

/**
 * Test de gap-opportunities endpoint
 */
async function testGapOpportunities() {
  try {
    console.log('\n🧪 Testing Gap Opportunities API...');
    
    // Simuleer resultaten van eerdere analyses
    const marketSize = {
      totalMarketSize: 15000000000,
      segmentSizes: {
        'Segment A': 6000000000,
        'Segment B': 4500000000,
        'Segment C': 3000000000,
        'Segment D': 1500000000
      },
      growthRate: 0.12
    };
    
    const segmentation = {
      segments: [
        { name: 'Segment A', percentage: 0.4, description: 'Enterprise klanten' },
        { name: 'Segment B', percentage: 0.3, description: 'Mid-market klanten' },
        { name: 'Segment C', percentage: 0.2, description: 'Small business klanten' },
        { name: 'Segment D', percentage: 0.1, description: 'Startups' }
      ],
      demographic: {
        ageGroups: ['18-24', '25-34', '35-44', '45-54'],
        incomeLevel: ['Midden', 'Hoog'],
        location: ['Stedelijk', 'Voorstedelijk']
      }
    };
    
    const competitorAnalysis = {
      competitors: testMarketData.competitorData,
      positioning: {
        matrix: {
          price: {
            'Competitor A': 0.8,
            'Competitor B': 0.5,
            'Competitor C': 0.2,
            'Own': 0.5
          },
          quality: {
            'Competitor A': 0.7,
            'Competitor B': 0.6,
            'Competitor C': 0.4,
            'Own': 0.8
          },
          innovation: {
            'Competitor A': 0.5,
            'Competitor B': 0.7,
            'Competitor C': 0.3,
            'Own': 0.9
          }
        }
      },
      marketShare: {
        marketShares: {
          'Competitor A': 0.25,
          'Competitor B': 0.18,
          'Competitor C': 0.15,
          'Own': 0.05,
          'Others': 0.37
        },
        concentration: 'medium'
      }
    };
    
    const response = await api.post('/market-research/gap-opportunities', { 
      marketSize,
      segmentation,
      competitorAnalysis
    });
    
    console.log('✅ Gap Opportunities API Test Success:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Gap Opportunities available:', Object.keys(response.data.gapOpportunities).join(', '));
  } catch (error) {
    console.error('❌ Gap Opportunities API Test Failed:', error.response?.data || error.message);
  }
}

/**
 * Test de visualisaties endpoint
 */
async function testVisualizations() {
  try {
    console.log('\n🧪 Testing Visualizations API...');
    
    // Simuleer resultaten van een marktanalyse
    const results = {
      marketSize: {
        totalMarketSize: 15000000000,
        segmentSizes: {
          'Segment A': 6000000000,
          'Segment B': 4500000000,
          'Segment C': 3000000000,
          'Segment D': 1500000000
        },
        growthRate: 0.12
      },
      segmentation: {
        segments: [
          { name: 'Segment A', percentage: 0.4, description: 'Enterprise klanten' },
          { name: 'Segment B', percentage: 0.3, description: 'Mid-market klanten' },
          { name: 'Segment C', percentage: 0.2, description: 'Small business klanten' },
          { name: 'Segment D', percentage: 0.1, description: 'Startups' }
        ]
      },
      competitorAnalysis: {
        competitors: testMarketData.competitorData,
        positioning: {
          matrix: {
            price: {
              'Competitor A': 0.8,
              'Competitor B': 0.5,
              'Competitor C': 0.2,
              'Own': 0.5
            },
            quality: {
              'Competitor A': 0.7,
              'Competitor B': 0.6,
              'Competitor C': 0.4,
              'Own': 0.8
            }
          }
        },
        marketShare: {
          marketShares: {
            'Competitor A': 0.25,
            'Competitor B': 0.18,
            'Competitor C': 0.15,
            'Own': 0.05,
            'Others': 0.37
          }
        }
      }
    };
    
    const response = await api.post('/market-research/visualizations', { results });
    
    console.log('✅ Visualizations API Test Success:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Visualizations available:', Object.keys(response.data.visualizationData).join(', '));
  } catch (error) {
    console.error('❌ Visualizations API Test Failed:', error.response?.data || error.message);
  }
}

/**
 * Test het opslaan van een rapport
 */
async function testSaveReport() {
  try {
    console.log('\n🧪 Testing Save Report API...');
    
    const reportData = {
      title: 'SaaS Marktanalyse Europa',
      description: 'Analyse van de Europese SaaS markt',
      data: {
        marketOverview: {
          industry: 'SaaS',
          region: 'Europa',
          size: 15000000000,
          growthRate: 0.12
        },
        competitorAnalysis: {
          competitors: testMarketData.competitorData,
          marketShare: {
            marketShares: {
              'Competitor A': 0.25,
              'Competitor B': 0.18,
              'Competitor C': 0.15,
              'Own': 0.05,
              'Others': 0.37
            }
          }
        }
      }
    };
    
    const response = await api.post('/market-research/reports', reportData);
    
    console.log('✅ Save Report API Test Success:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Report ID:', response.data.reportId);
    
    // Sla het rapport ID op voor de volgende test
    return response.data.reportId;
  } catch (error) {
    console.error('❌ Save Report API Test Failed:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test het ophalen van een rapport
 */
async function testGetReport(reportId) {
  if (!reportId) {
    console.log('\n⚠️ Skipping Get Report API Test: No report ID available');
    return;
  }
  
  try {
    console.log('\n🧪 Testing Get Report API...');
    
    const response = await api.get(`/market-research/reports/${reportId}`);
    
    console.log('✅ Get Report API Test Success:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Report Title:', response.data.report.title);
  } catch (error) {
    console.error('❌ Get Report API Test Failed:', error.response?.data || error.message);
  }
}

/**
 * Test het ophalen van alle rapporten
 */
async function testGetAllReports() {
  try {
    console.log('\n🧪 Testing Get All Reports API...');
    
    const response = await api.get('/market-research/reports');
    
    console.log('✅ Get All Reports API Test Success:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Number of Reports:', response.data.reports.length);
  } catch (error) {
    console.error('❌ Get All Reports API Test Failed:', error.response?.data || error.message);
  }
}

/**
 * Voer alle tests uit
 */
async function runTests() {
  console.log('🚀 Starting Market Research API Tests...\n');
  
  await testMarketAnalysis();
  await testMarketInsights();
  await testPriceAnalysis();
  await testCompetitorAnalysis();
  await testGapOpportunities();
  await testVisualizations();
  
  const reportId = await testSaveReport();
  await testGetReport(reportId);
  await testGetAllReports();
  
  console.log('\n🏁 All Market Research API Tests Completed!');
}

// Start de tests
runTests().catch(error => {
  console.error('❌ Test Runner Error:', error);
});
