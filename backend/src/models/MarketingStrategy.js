import { supabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Model voor marketingstrategieën
 */
export const MarketingStrategy = {
  /**
   * Haal alle marketingstrategieën op
   * @param {Object} options - Query opties
   * @param {number} options.limit - Maximum aantal resultaten
   * @param {number} options.offset - Offset voor paginering
   * @param {string} options.niche - Filter op niche
   * @param {string} options.product - Filter op product
   * @returns {Promise<Array>} - Array met marketingstrategieën
   */
  async getAll(options = {}) {
    try {
      const { limit = 50, offset = 0, niche, product } = options;
      
      let query = supabaseClient
        .from('marketing_strategies')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      // Filter op niche of product indien opgegeven
      if (niche) {
        query = query.eq('niche', niche);
      }
      
      if (product) {
        query = query.eq('product', product);
      }
      
      const { data, error } = await query;
      
      if (error) {
        logger.error(`Fout bij ophalen marketingstrategieën: ${error.message}`);
        throw new Error('Fout bij ophalen marketingstrategieën');
      }
      
      return data;
    } catch (error) {
      logger.error(`Fout bij ophalen marketingstrategieën: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal een specifieke marketingstrategie op
   * @param {string} id - ID van de strategie
   * @returns {Promise<Object>} - Marketingstrategie
   */
  async getById(id) {
    try {
      const { data, error } = await supabaseClient
        .from('marketing_strategies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        logger.error(`Fout bij ophalen marketingstrategie: ${error.message}`);
        throw new Error('Fout bij ophalen marketingstrategie');
      }
      
      return data;
    } catch (error) {
      logger.error(`Fout bij ophalen marketingstrategie: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal een marketingstrategie op basis van naam
   * @param {string} name - Naam van de strategie
   * @returns {Promise<Object>} - Marketingstrategie
   */
  async getByName(name) {
    try {
      const { data, error } = await supabaseClient
        .from('marketing_strategies')
        .select('*')
        .eq('name', name)
        .maybeSingle();
      
      if (error) {
        logger.error(`Fout bij ophalen marketingstrategie op naam: ${error.message}`);
        throw new Error('Fout bij ophalen marketingstrategie op naam');
      }
      
      return data;
    } catch (error) {
      logger.error(`Fout bij ophalen marketingstrategie op naam: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal marketingstrategieën op voor een specifieke niche
   * @param {string} niche - Niche naam
   * @returns {Promise<Array>} - Array met marketingstrategieën
   */
  async getByNiche(niche) {
    try {
      const { data, error } = await supabaseClient
        .from('marketing_strategies')
        .select('*')
        .eq('niche', niche)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error(`Fout bij ophalen marketingstrategieën voor niche: ${error.message}`);
        throw new Error('Fout bij ophalen marketingstrategieën voor niche');
      }
      
      return data;
    } catch (error) {
      logger.error(`Fout bij ophalen marketingstrategieën voor niche: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal marketingstrategieën op voor een specifiek product
   * @param {string} product - Product naam
   * @returns {Promise<Array>} - Array met marketingstrategieën
   */
  async getByProduct(product) {
    try {
      const { data, error } = await supabaseClient
        .from('marketing_strategies')
        .select('*')
        .eq('product', product)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error(`Fout bij ophalen marketingstrategieën voor product: ${error.message}`);
        throw new Error('Fout bij ophalen marketingstrategieën voor product');
      }
      
      return data;
    } catch (error) {
      logger.error(`Fout bij ophalen marketingstrategieën voor product: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Maak een nieuwe marketingstrategie aan
   * @param {Object} strategy - Marketingstrategie data
   * @returns {Promise<Object>} - Aangemaakte marketingstrategie
   */
  async create(strategy) {
    try {
      // Valideer strategie
      if (!strategy.name || !strategy.description) {
        throw new Error('Naam en beschrijving zijn vereist');
      }
      
      // Genereer ID op basis van naam als deze niet is opgegeven
      if (!strategy.id) {
        strategy.id = strategy.name.toLowerCase().replace(/\s+/g, '-');
      }
      
      const { data, error } = await supabaseClient
        .from('marketing_strategies')
        .insert(strategy)
        .select()
        .single();
      
      if (error) {
        logger.error(`Fout bij aanmaken marketingstrategie: ${error.message}`);
        throw new Error('Fout bij aanmaken marketingstrategie');
      }
      
      return data;
    } catch (error) {
      logger.error(`Fout bij aanmaken marketingstrategie: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Update een bestaande marketingstrategie
   * @param {string} id - ID van de strategie
   * @param {Object} updates - Updates voor de strategie
   * @returns {Promise<Object>} - Bijgewerkte marketingstrategie
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabaseClient
        .from('marketing_strategies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logger.error(`Fout bij bijwerken marketingstrategie: ${error.message}`);
        throw new Error('Fout bij bijwerken marketingstrategie');
      }
      
      return data;
    } catch (error) {
      logger.error(`Fout bij bijwerken marketingstrategie: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verwijder een marketingstrategie
   * @param {string} id - ID van de strategie
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      const { error } = await supabaseClient
        .from('marketing_strategies')
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error(`Fout bij verwijderen marketingstrategie: ${error.message}`);
        throw new Error('Fout bij verwijderen marketingstrategie');
      }
    } catch (error) {
      logger.error(`Fout bij verwijderen marketingstrategie: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal alle beschikbare niches op
   * @returns {Promise<Array>} - Array met unieke niches
   */
  async getAllNiches() {
    try {
      const { data, error } = await supabaseClient
        .from('marketing_strategies')
        .select('niche')
        .not('niche', 'is', null);
      
      if (error) {
        logger.error(`Fout bij ophalen niches: ${error.message}`);
        throw new Error('Fout bij ophalen niches');
      }
      
      // Extraheer unieke niches
      const niches = [...new Set(data.map(item => item.niche))];
      
      return niches;
    } catch (error) {
      logger.error(`Fout bij ophalen niches: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal alle beschikbare producten op
   * @returns {Promise<Array>} - Array met unieke producten
   */
  async getAllProducts() {
    try {
      const { data, error } = await supabaseClient
        .from('marketing_strategies')
        .select('product')
        .not('product', 'is', null);
      
      if (error) {
        logger.error(`Fout bij ophalen producten: ${error.message}`);
        throw new Error('Fout bij ophalen producten');
      }
      
      // Extraheer unieke producten
      const products = [...new Set(data.map(item => item.product))];
      
      return products;
    } catch (error) {
      logger.error(`Fout bij ophalen producten: ${error.message}`);
      throw error;
    }
  }
};

export default MarketingStrategy;
