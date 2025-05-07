import { logger } from '../utils/logger.js';
import { supabaseClient } from '../config/supabase.js';
import puppeteer from 'puppeteer';

/**
 * Service voor het detecteren van concurrenten op basis van marktonderzoek
 */
export const competitorDetectionService = {
  /**
   * Detecteer potentiële concurrenten voor een project
   * @param {string} projectId - ID van het project
   * @returns {Promise<Array>} - Array met gedetecteerde concurrenten
   */
  async detectCompetitors(projectId) {
    try {
      logger.info(`Concurrent detectie gestart voor project ${projectId}`);
      
      // Haal project op om te controleren of het bestaat
      const { data: project, error: projectError } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        logger.error(`Fout bij ophalen project: ${projectError.message}`);
        throw new Error('Project niet gevonden');
      }
      
      // Haal marktonderzoeksdata op
      const { data: marketResearch, error: marketResearchError } = await supabaseClient
        .from('market_research')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (marketResearchError) {
        logger.error(`Fout bij ophalen marktonderzoek: ${marketResearchError.message}`);
        throw new Error('Marktonderzoek niet gevonden');
      }
      
      if (!marketResearch || marketResearch.length === 0) {
        logger.warn(`Geen marktonderzoek beschikbaar voor project ${projectId}`);
        return [];
      }
      
      // Extraheer relevante data uit marktonderzoek
      const marketData = marketResearch[0].research_data || {};
      
      // Combineer concurrenten uit verschillende bronnen
      let detectedCompetitors = [];
      
      // Voeg bestaande concurrenten toe uit competitorData
      if (marketData.competitorData && Array.isArray(marketData.competitorData)) {
        detectedCompetitors = [
          ...detectedCompetitors,
          ...marketData.competitorData.map(competitor => ({
            name: competitor.name,
            url: competitor.website || `https://${competitor.name.toLowerCase().replace(/\\s+/g, '')}.com`,
            relevance: competitor.marketShare || Math.random() * 0.5 + 0.5,
            source: 'Marktonderzoek',
            description: competitor.description || `${competitor.name} is een concurrent in deze markt.`
          }))
        ];
      }
      
      // Extraheer concurrenten uit markttrends
      if (marketData.marketTrends && Array.isArray(marketData.marketTrends)) {
        const trendCompetitors = [];
        
        marketData.marketTrends.forEach(source => {
          if (source.trends && Array.isArray(source.trends)) {
            source.trends.forEach(trend => {
              // Zoek bedrijfsnamen in trend beschrijvingen
              const description = trend.description || '';
              const companies = this.extractCompanyNames(description);
              
              companies.forEach(company => {
                if (!detectedCompetitors.some(c => c.name.toLowerCase() === company.toLowerCase()) &&
                    !trendCompetitors.some(c => c.name.toLowerCase() === company.toLowerCase())) {
                  trendCompetitors.push({
                    name: company,
                    url: `https://${company.toLowerCase().replace(/\\s+/g, '')}.com`,
                    relevance: Math.random() * 0.3 + 0.3,
                    source: 'Markttrends',
                    description: `${company} werd genoemd in de context van: ${trend.name}`
                  });
                }
              });
            });
          }
        });
        
        detectedCompetitors = [...detectedCompetitors, ...trendCompetitors];
      }
      
      // Zoek concurrenten via Google (gesimuleerd)
      const searchCompetitors = await this.searchCompetitorsOnline(project.name, project.industry);
      
      // Voeg zoekresultaten toe die nog niet in de lijst staan
      searchCompetitors.forEach(competitor => {
        if (!detectedCompetitors.some(c => c.name.toLowerCase() === competitor.name.toLowerCase())) {
          detectedCompetitors.push(competitor);
        }
      });
      
      // Sorteer op relevantie
      detectedCompetitors.sort((a, b) => b.relevance - a.relevance);
      
      logger.info(`Concurrent detectie voltooid voor project ${projectId}, ${detectedCompetitors.length} concurrenten gevonden`);
      
      return detectedCompetitors;
    } catch (error) {
      logger.error(`Fout bij detecteren concurrenten: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Extraheer bedrijfsnamen uit tekst
   * @param {string} text - Tekst om te analyseren
   * @returns {Array<string>} - Geëxtraheerde bedrijfsnamen
   */
  extractCompanyNames(text) {
    // Dit is een vereenvoudigde implementatie
    // In een echte applicatie zou je NLP of een API gebruiken
    
    // Lijst met bekende bedrijfsnamen voor demo doeleinden
    const knownCompanies = [
      'Google', 'Apple', 'Microsoft', 'Amazon', 'Facebook',
      'Netflix', 'Spotify', 'Twitter', 'LinkedIn', 'Uber',
      'Airbnb', 'Tesla', 'Samsung', 'Sony', 'IBM',
      'Oracle', 'Intel', 'AMD', 'Nvidia', 'Cisco',
      'Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour',
      'Coca-Cola', 'Pepsi', 'Starbucks', 'McDonald\'s', 'KFC',
      'Walmart', 'Target', 'Costco', 'Ikea', 'H&M'
    ];
    
    // Filter bedrijven die in de tekst voorkomen
    return knownCompanies.filter(company => 
      text.toLowerCase().includes(company.toLowerCase())
    );
  },
  
  /**
   * Zoek concurrenten online via Google (gesimuleerd)
   * @param {string} companyName - Naam van het bedrijf
   * @param {string} industry - Industrie van het bedrijf
   * @returns {Promise<Array>} - Gevonden concurrenten
   */
  async searchCompetitorsOnline(companyName, industry) {
    // In een echte implementatie zou je puppeteer gebruiken om Google te doorzoeken
    // Voor demo doeleinden simuleren we de resultaten
    
    logger.info(`Online concurrent zoekactie gestart voor ${companyName} in ${industry}`);
    
    // Simuleer een vertraging om een API call na te bootsen
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Genereer gesimuleerde concurrenten op basis van industrie
    const competitors = [];
    
    // Industrie-specifieke concurrenten
    const industryCompetitors = {
      'Technology': [
        { name: 'TechGiant', url: 'https://techgiant.com', relevance: 0.85 },
        { name: 'InnovateCorp', url: 'https://innovatecorp.com', relevance: 0.78 },
        { name: 'FutureTech', url: 'https://futuretech.io', relevance: 0.72 },
        { name: 'SmartSolutions', url: 'https://smartsolutions.tech', relevance: 0.65 },
        { name: 'DigitalWave', url: 'https://digitalwave.com', relevance: 0.61 }
      ],
      'E-commerce': [
        { name: 'ShopNow', url: 'https://shopnow.com', relevance: 0.88 },
        { name: 'BuyFast', url: 'https://buyfast.com', relevance: 0.82 },
        { name: 'MegaStore', url: 'https://megastore.com', relevance: 0.75 },
        { name: 'QuickShop', url: 'https://quickshop.com', relevance: 0.69 },
        { name: 'RetailGiant', url: 'https://retailgiant.com', relevance: 0.63 }
      ],
      'Finance': [
        { name: 'MoneyMakers', url: 'https://moneymakers.com', relevance: 0.87 },
        { name: 'WealthWise', url: 'https://wealthwise.com', relevance: 0.81 },
        { name: 'InvestPro', url: 'https://investpro.com', relevance: 0.76 },
        { name: 'FinancialFuture', url: 'https://financialfuture.com', relevance: 0.70 },
        { name: 'BankBetter', url: 'https://bankbetter.com', relevance: 0.64 }
      ],
      'Healthcare': [
        { name: 'HealthPlus', url: 'https://healthplus.com', relevance: 0.89 },
        { name: 'MediCare', url: 'https://medicare.com', relevance: 0.83 },
        { name: 'WellnessWorld', url: 'https://wellnessworld.com', relevance: 0.77 },
        { name: 'VitalCare', url: 'https://vitalcare.com', relevance: 0.71 },
        { name: 'HealFast', url: 'https://healfast.com', relevance: 0.65 }
      ]
    };
    
    // Standaard concurrenten voor onbekende industrieën
    const defaultCompetitors = [
      { name: 'GlobalCorp', url: 'https://globalcorp.com', relevance: 0.75 },
      { name: 'IndustryLeader', url: 'https://industryleader.com', relevance: 0.70 },
      { name: 'MarketMaster', url: 'https://marketmaster.com', relevance: 0.65 },
      { name: 'BusinessPro', url: 'https://businesspro.com', relevance: 0.60 },
      { name: 'TopCompany', url: 'https://topcompany.com', relevance: 0.55 }
    ];
    
    // Kies concurrenten op basis van industrie
    const selectedCompetitors = industryCompetitors[industry] || defaultCompetitors;
    
    // Voeg bron en beschrijving toe
    selectedCompetitors.forEach(competitor => {
      competitors.push({
        ...competitor,
        source: 'Online zoekresultaten',
        description: `${competitor.name} is een concurrent van ${companyName} in de ${industry} industrie.`
      });
    });
    
    logger.info(`Online concurrent zoekactie voltooid, ${competitors.length} concurrenten gevonden`);
    
    return competitors;
  }
};

export default competitorDetectionService;
