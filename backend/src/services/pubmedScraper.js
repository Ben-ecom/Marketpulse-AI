const puppeteer = require('puppeteer');
const { logger } = require('../utils/logger');

/**
 * PubMed Scraper Service
 * Gebruikt Puppeteer om wetenschappelijke artikelen te scrapen van PubMed
 */
class PubMedScraper {
  constructor() {
    this.browser = null;
    this.baseUrl = 'https://pubmed.ncbi.nlm.nih.gov/';
    this.searchUrl = 'https://pubmed.ncbi.nlm.nih.gov/?term=';
  }

  /**
   * Initialiseert de browser
   */
  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      logger.info('PubMed scraper geïnitialiseerd');
    } catch (error) {
      logger.error('Fout bij initialiseren PubMed scraper:', error);
      throw error;
    }
  }

  /**
   * Sluit de browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('PubMed scraper gesloten');
    }
  }

  /**
   * Zoekt artikelen op PubMed
   * @param {string} query - Zoekterm
   * @param {Object} options - Zoekopties
   * @param {number} options.limit - Maximum aantal resultaten (default: 10)
   * @param {string} options.sort - Sortering (default: 'relevance')
   * @param {string} options.filter - Filter (default: '')
   * @returns {Promise<Array>} - Lijst met artikelen
   */
  async searchArticles(query, options = {}) {
    const { limit = 10, sort = 'relevance', filter = '' } = options;
    
    try {
      if (!this.browser) {
        await this.initialize();
      }

      const page = await this.browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigeer naar de zoekpagina
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.searchUrl}${encodedQuery}${filter ? '&filter=' + filter : ''}`;
      
      logger.info(`Navigeren naar ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Sorteer resultaten indien nodig
      if (sort !== 'relevance') {
        await page.select('select[name="sort"]', sort);
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      }
      
      // Scrape de resultaten
      const articles = await page.evaluate((maxResults) => {
        const results = [];
        const articleElements = document.querySelectorAll('.docsum-content');
        
        for (let i = 0; i < Math.min(articleElements.length, maxResults); i++) {
          const element = articleElements[i];
          
          const titleElement = element.querySelector('.docsum-title');
          const authorsElement = element.querySelector('.docsum-authors');
          const journalElement = element.querySelector('.docsum-journal-citation');
          
          const id = element.closest('.docsum-wrap').getAttribute('data-article-id');
          const title = titleElement ? titleElement.textContent.trim() : '';
          const authors = authorsElement ? authorsElement.textContent.trim() : '';
          const journal = journalElement ? journalElement.textContent.trim() : '';
          
          results.push({
            id,
            title,
            authors: authors.split(',').map(a => a.trim()),
            journal,
            url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
          });
        }
        
        return results;
      }, limit);
      
      await page.close();
      
      return articles;
    } catch (error) {
      logger.error('Fout bij zoeken op PubMed:', error);
      throw error;
    }
  }

  /**
   * Haalt de details van een artikel op
   * @param {string} articleId - PubMed artikel ID
   * @returns {Promise<Object>} - Artikel details
   */
  async getArticleDetails(articleId) {
    try {
      if (!this.browser) {
        await this.initialize();
      }

      const page = await this.browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      
      // Navigeer naar de artikelpagina
      const url = `${this.baseUrl}${articleId}/`;
      
      logger.info(`Navigeren naar ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Scrape de artikel details
      const articleDetails = await page.evaluate(() => {
        // Basis artikel informatie
        const title = document.querySelector('.heading-title')?.textContent.trim() || '';
        const abstract = document.querySelector('.abstract-content')?.textContent.trim() || '';
        
        // Auteurs
        const authorElements = document.querySelectorAll('.authors-list .author-item');
        const authors = Array.from(authorElements).map(el => el.textContent.trim());
        
        // Publicatie details
        const journalElement = document.querySelector('.journal-actions .journal-title');
        const journal = journalElement ? journalElement.textContent.trim() : '';
        
        const dateElement = document.querySelector('.cit');
        const dateMatch = dateElement ? dateElement.textContent.match(/(\d{4})\s+[A-Za-z]+\s+\d+/) : null;
        const year = dateMatch ? dateMatch[1] : '';
        
        // DOI
        const doiElement = document.querySelector('.identifier.doi');
        const doi = doiElement ? doiElement.textContent.replace('doi:', '').trim() : '';
        
        // Keywords
        const keywordElements = document.querySelectorAll('.keywords-list .keyword');
        const keywords = Array.from(keywordElements).map(el => el.textContent.trim());
        
        return {
          title,
          abstract,
          authors,
          journal,
          year,
          doi,
          keywords
        };
      });
      
      await page.close();
      
      return {
        id: articleId,
        ...articleDetails,
        url: url
      };
    } catch (error) {
      logger.error(`Fout bij ophalen artikel details voor ID ${articleId}:`, error);
      throw error;
    }
  }

  /**
   * Zoekt naar wetenschappelijk bewijs voor claims
   * @param {Array<string>} ingredients - Lijst met ingrediënten
   * @param {Array<string>} claims - Lijst met claims
   * @param {Object} options - Zoekopties
   * @returns {Promise<Object>} - Resultaten met claim-evidence mapping
   */
  async findEvidenceForClaims(ingredients, claims, options = {}) {
    try {
      const results = {
        claimEvidence: [],
        summary: {
          totalStudies: 0,
          highQualityStudies: 0,
          recentStudiesCount: 0
        }
      };
      
      // Combineer ingrediënten voor de zoekopdracht
      const ingredientsQuery = ingredients.join(' OR ');
      
      // Zoek artikelen voor de ingrediënten
      const articles = await this.searchArticles(ingredientsQuery, { 
        limit: options.limit || 20,
        sort: 'relevance'
      });
      
      results.summary.totalStudies = articles.length;
      
      // Tel recente studies (laatste 2 jaar)
      const currentYear = new Date().getFullYear();
      results.summary.recentStudiesCount = articles.filter(article => {
        const match = article.journal.match(/\b(20\d{2})\b/);
        if (match && match[1]) {
          const year = parseInt(match[1]);
          return (currentYear - year) <= 2;
        }
        return false;
      }).length;
      
      // Haal details op voor elk artikel en koppel aan claims
      for (const article of articles) {
        const details = await this.getArticleDetails(article.id);
        
        // Controleer of het artikel relevant is voor de claims
        for (const claim of claims) {
          const lowerClaim = claim.toLowerCase();
          const lowerAbstract = details.abstract.toLowerCase();
          const lowerTitle = details.title.toLowerCase();
          
          // Eenvoudige relevantie check - in een echte implementatie zou dit geavanceerder zijn
          if (lowerAbstract.includes(lowerClaim) || 
              ingredients.some(i => lowerAbstract.includes(i.toLowerCase())) ||
              lowerTitle.includes(lowerClaim)) {
            
            // Bepaal bewijskracht (in een echte implementatie zou dit geavanceerder zijn)
            let evidenceStrength = 'Moderate';
            if (details.journal.includes('Randomized') || 
                details.abstract.includes('meta-analysis') || 
                details.abstract.includes('systematic review')) {
              evidenceStrength = 'Strong';
              results.summary.highQualityStudies++;
            }
            
            results.claimEvidence.push({
              claim,
              evidence: details.abstract.substring(0, 200) + '...',
              source: details.url,
              sourceTitle: details.title,
              evidenceStrength,
              date: details.year
            });
            
            break; // Ga naar de volgende artikel
          }
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Fout bij zoeken naar bewijs voor claims:', error);
      throw error;
    }
  }
}

module.exports = new PubMedScraper();
