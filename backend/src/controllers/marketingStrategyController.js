import { logger } from '../utils/logger.js';
import { MarketingStrategy } from '../models/MarketingStrategy.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Voeg voorbeeld strategieën toe bij opstarten
async function initializeDefaultStrategies() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../data/defaultStrategies.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const defaultStrategies = JSON.parse(fileContent);

    for (const strategy of defaultStrategies) {
      const existingStrategy = await MarketingStrategy.getByName(strategy.name);
      if (!existingStrategy) {
        await MarketingStrategy.create(strategy);
        logger.info(`Voorbeeldstrategie toegevoegd: ${strategy.name}`);
      }
    }
  } catch (error) {
    logger.error(`Fout bij toevoegen voorbeeldstrategieën: ${error.message}`);
  }
}

initializeDefaultStrategies();

/**
 * Controller voor het beheren van marketingstrategieën
 */
export const marketingStrategyController = {
  /**
   * Haal alle marketingstrategieën op
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllStrategies(req, res) {
    try {
      const { limit, offset, niche, product } = req.query;
      
      // Controleer of gebruiker admin is
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({
          success: false,
          message: 'Alleen admins hebben toegang tot deze functionaliteit'
        });
      }
      
      const options = {
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0
      };
      
      if (niche) options.niche = niche;
      if (product) options.product = product;
      
      const strategies = await MarketingStrategy.getAll(options);
      
      return res.status(200).json({
        success: true,
        data: strategies
      });
    } catch (error) {
      logger.error(`Fout bij ophalen marketingstrategieën: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij ophalen marketingstrategieën: ${error.message}`
      });
    }
  },
  
  /**
   * Haal een specifieke marketingstrategie op
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStrategyById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Strategie ID is vereist'
        });
      }
      
      const strategy = await MarketingStrategy.getById(id);
      
      if (!strategy) {
        return res.status(404).json({
          success: false,
          message: 'Strategie niet gevonden'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: strategy
      });
    } catch (error) {
      logger.error(`Fout bij ophalen marketingstrategie: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij ophalen marketingstrategie: ${error.message}`
      });
    }
  },
  
  /**
   * Haal marketingstrategieën op voor een specifieke niche
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStrategiesByNiche(req, res) {
    try {
      const { niche } = req.params;
      
      if (!niche) {
        return res.status(400).json({
          success: false,
          message: 'Niche is vereist'
        });
      }
      
      const strategies = await MarketingStrategy.getByNiche(niche);
      
      return res.status(200).json({
        success: true,
        data: strategies
      });
    } catch (error) {
      logger.error(`Fout bij ophalen marketingstrategieën voor niche: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij ophalen marketingstrategieën voor niche: ${error.message}`
      });
    }
  },
  
  /**
   * Haal marketingstrategieën op voor een specifiek product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStrategiesByProduct(req, res) {
    try {
      const { product } = req.params;
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Product is vereist'
        });
      }
      
      const strategies = await MarketingStrategy.getByProduct(product);
      
      return res.status(200).json({
        success: true,
        data: strategies
      });
    } catch (error) {
      logger.error(`Fout bij ophalen marketingstrategieën voor product: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij ophalen marketingstrategieën voor product: ${error.message}`
      });
    }
  },
  
  /**
   * Maak een nieuwe marketingstrategie aan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createStrategy(req, res) {
    try {
      // Controleer of gebruiker admin is
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({
          success: false,
          message: 'Alleen admins kunnen marketingstrategieën aanmaken'
        });
      }
      
      const { 
        name, 
        description, 
        full_strategy, 
        niche, 
        product, 
        focus_areas, 
        weights 
      } = req.body;
      
      // Valideer input
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: 'Naam en beschrijving zijn vereist'
        });
      }
      
      // Valideer lengte van full_strategy
      if (full_strategy && full_strategy.length < 3000) {
        return res.status(400).json({
          success: false,
          message: 'Volledige strategie moet minimaal 3000 tekens bevatten'
        });
      }
      
      // Maak strategie aan
      const strategy = await MarketingStrategy.create({
        name,
        description,
        full_strategy,
        niche,
        product,
        focus_areas: focus_areas || ['positioning', 'messaging', 'features', 'pricing'],
        weights: weights || {
          positioning: 0.25,
          messaging: 0.25,
          features: 0.25,
          pricing: 0.25
        },
        created_by: req.user.id,
        created_at: new Date().toISOString()
      });
      
      return res.status(201).json({
        success: true,
        message: 'Marketingstrategie succesvol aangemaakt',
        data: strategy
      });
    } catch (error) {
      logger.error(`Fout bij aanmaken marketingstrategie: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij aanmaken marketingstrategie: ${error.message}`
      });
    }
  },
  
  /**
   * Update een bestaande marketingstrategie
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateStrategy(req, res) {
    try {
      const { id } = req.params;
      
      // Controleer of gebruiker admin is
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({
          success: false,
          message: 'Alleen admins kunnen marketingstrategieën bijwerken'
        });
      }
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Strategie ID is vereist'
        });
      }
      
      // Controleer of strategie bestaat
      const existingStrategy = await MarketingStrategy.getById(id);
      
      if (!existingStrategy) {
        return res.status(404).json({
          success: false,
          message: 'Strategie niet gevonden'
        });
      }
      
      // Bescherm standaard strategieën tegen wijzigingen aan ID en naam
      const isDefaultStrategy = ['balanced', 'aggressive', 'defensive', 'niche', 'innovative'].includes(id);
      
      const { 
        name, 
        description, 
        full_strategy, 
        niche, 
        product, 
        focus_areas, 
        weights 
      } = req.body;
      
      // Valideer lengte van full_strategy indien opgegeven
      if (full_strategy && full_strategy.length < 3000) {
        return res.status(400).json({
          success: false,
          message: 'Volledige strategie moet minimaal 3000 tekens bevatten'
        });
      }
      
      // Bouw updates object
      const updates = {};
      
      if (!isDefaultStrategy && name) updates.name = name;
      if (description) updates.description = description;
      if (full_strategy) updates.full_strategy = full_strategy;
      if (niche) updates.niche = niche;
      if (product) updates.product = product;
      if (focus_areas) updates.focus_areas = focus_areas;
      if (weights) updates.weights = weights;
      
      updates.updated_by = req.user.id;
      updates.updated_at = new Date().toISOString();
      
      // Update strategie
      const updatedStrategy = await MarketingStrategy.update(id, updates);
      
      return res.status(200).json({
        success: true,
        message: 'Marketingstrategie succesvol bijgewerkt',
        data: updatedStrategy
      });
    } catch (error) {
      logger.error(`Fout bij bijwerken marketingstrategie: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij bijwerken marketingstrategie: ${error.message}`
      });
    }
  },
  
  /**
   * Verwijder een marketingstrategie
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteStrategy(req, res) {
    try {
      const { id } = req.params;
      
      // Controleer of gebruiker admin is
      if (!req.user || !req.user.is_admin) {
        return res.status(403).json({
          success: false,
          message: 'Alleen admins kunnen marketingstrategieën verwijderen'
        });
      }
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Strategie ID is vereist'
        });
      }
      
      // Bescherm standaard strategieën tegen verwijdering
      if (['balanced', 'aggressive', 'defensive', 'niche', 'innovative'].includes(id)) {
        return res.status(400).json({
          success: false,
          message: 'Standaard strategieën kunnen niet worden verwijderd'
        });
      }
      
      // Verwijder strategie
      await MarketingStrategy.delete(id);
      
      return res.status(200).json({
        success: true,
        message: 'Marketingstrategie succesvol verwijderd'
      });
    } catch (error) {
      logger.error(`Fout bij verwijderen marketingstrategie: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij verwijderen marketingstrategie: ${error.message}`
      });
    }
  },
  
  /**
   * Haal alle beschikbare niches op
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllNiches(req, res) {
    try {
      const niches = await MarketingStrategy.getAllNiches();
      
      return res.status(200).json({
        success: true,
        data: niches
      });
    } catch (error) {
      logger.error(`Fout bij ophalen niches: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij ophalen niches: ${error.message}`
      });
    }
  },
  
  /**
   * Haal alle beschikbare producten op
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllProducts(req, res) {
    try {
      const products = await MarketingStrategy.getAllProducts();
      
      return res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      logger.error(`Fout bij ophalen producten: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij ophalen producten: ${error.message}`
      });
    }
  }
};

export default marketingStrategyController;
