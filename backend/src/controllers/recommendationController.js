import { logger } from '../utils/logger.js';
import { recommendationService } from '../services/recommendationService.js';

/**
 * Controller voor aanbevelingen-gerelateerde functionaliteit
 */
export const recommendationController = {
  /**
   * Haal aanbevelingen op voor een project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRecommendations(req, res) {
    try {
      const { projectId } = req.params;
      const { strategy = 'balanced', niche, product } = req.query;
      
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is vereist'
        });
      }
      
      // Haal aanbevelingen op
      let recommendations = await recommendationService.getRecommendations(projectId);
      
      // Als er geen aanbevelingen zijn, genereer nieuwe
      if (!recommendations) {
        recommendations = await recommendationService.generateRecommendations(projectId, strategy, niche, product);
      }
      
      return res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      logger.error(`Fout bij ophalen aanbevelingen: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij ophalen aanbevelingen: ${error.message}`
      });
    }
  },
  
  /**
   * Haal aanbevelingen op voor een project op basis van niche
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRecommendationsByNiche(req, res) {
    try {
      const { projectId } = req.params;
      const { niche } = req.query;
      
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is vereist'
        });
      }
      
      if (!niche) {
        return res.status(400).json({
          success: false,
          message: 'Niche parameter is vereist'
        });
      }
      
      // Genereer aanbevelingen specifiek voor deze niche
      const recommendations = await recommendationService.generateRecommendations(projectId, 'balanced', niche);
      
      return res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      logger.error(`Fout bij ophalen niche-specifieke aanbevelingen: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij ophalen niche-specifieke aanbevelingen: ${error.message}`
      });
    }
  },
  
  /**
   * Haal aanbevelingen op voor een project op basis van product
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRecommendationsByProduct(req, res) {
    try {
      const { projectId } = req.params;
      const { product } = req.query;
      
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is vereist'
        });
      }
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'Product parameter is vereist'
        });
      }
      
      // Genereer aanbevelingen specifiek voor dit product
      const recommendations = await recommendationService.generateRecommendations(projectId, 'balanced', null, product);
      
      return res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      logger.error(`Fout bij ophalen product-specifieke aanbevelingen: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij ophalen product-specifieke aanbevelingen: ${error.message}`
      });
    }
  },
  
  /**
   * Genereer nieuwe aanbevelingen voor een project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async generateRecommendations(req, res) {
    try {
      const { projectId } = req.params;
      const { strategy = 'balanced', niche, product } = req.body;
      
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is vereist'
        });
      }
      
      // Genereer nieuwe aanbevelingen
      const recommendations = await recommendationService.generateRecommendations(projectId, strategy, niche, product);
      
      return res.status(200).json({
        success: true,
        message: 'Aanbevelingen succesvol gegenereerd',
        data: recommendations
      });
    } catch (error) {
      logger.error(`Fout bij genereren aanbevelingen: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: `Fout bij genereren aanbevelingen: ${error.message}`
      });
    }
  },
  
  /**
   * Haal beschikbare marketingstrategieën op
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMarketingStrategies(req, res) {
    try {
      // Haal strategieën op uit database via Supabase
      const { data, error } = await req.supabase
        .from('marketing_strategies')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        logger.error(`Fout bij ophalen marketingstrategieën: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: 'Fout bij ophalen marketingstrategieën'
        });
      }
      
      // Als er geen strategieën zijn, gebruik standaard strategieën
      if (!data || data.length === 0) {
        const defaultStrategies = [
          {
            id: 'balanced',
            name: 'Gebalanceerd',
            description: 'Een evenwichtige aanpak die zowel groei als behoud van klanten nastreeft'
          },
          {
            id: 'aggressive',
            name: 'Agressief',
            description: 'Focus op snelle groei en marktaandeel vergroten, zelfs ten koste van kortetermijnwinstgevendheid'
          },
          {
            id: 'defensive',
            name: 'Defensief',
            description: 'Focus op het behouden van huidige klanten en marktpositie'
          },
          {
            id: 'niche',
            name: 'Niche',
            description: 'Focus op een specifiek marktsegment met gespecialiseerde oplossingen'
          },
          {
            id: 'innovative',
            name: 'Innovatief',
            description: 'Focus op het ontwikkelen van nieuwe producten en diensten om de markt te leiden'
          }
        ];
        
        return res.status(200).json({
          success: true,
          data: defaultStrategies
        });
      }
      
      return res.status(200).json({
        success: true,
        data: data
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
   * Maak een nieuwe marketingstrategie aan (alleen voor admins)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createMarketingStrategy(req, res) {
    try {
      const { name, description, focus_areas, weights } = req.body;
      
      // Valideer input
      if (!name || !description) {
        return res.status(400).json({
          success: false,
          message: 'Naam en beschrijving zijn vereist'
        });
      }
      
      // Controleer of gebruiker admin is
      const { user } = req;
      
      if (!user || !user.is_admin) {
        return res.status(403).json({
          success: false,
          message: 'Alleen admins kunnen marketingstrategieën aanmaken'
        });
      }
      
      // Genereer ID op basis van naam
      const id = name.toLowerCase().replace(/\s+/g, '-');
      
      // Maak strategie aan in database
      const { data, error } = await req.supabase
        .from('marketing_strategies')
        .insert({
          id,
          name,
          description,
          focus_areas: focus_areas || ['positioning', 'messaging', 'features', 'pricing'],
          weights: weights || {
            positioning: 0.25,
            messaging: 0.25,
            features: 0.25,
            pricing: 0.25
          }
        })
        .select();
      
      if (error) {
        logger.error(`Fout bij aanmaken marketingstrategie: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: `Fout bij aanmaken marketingstrategie: ${error.message}`
        });
      }
      
      return res.status(201).json({
        success: true,
        message: 'Marketingstrategie succesvol aangemaakt',
        data: data[0]
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
   * Update een bestaande marketingstrategie (alleen voor admins)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateMarketingStrategy(req, res) {
    try {
      const { strategyId } = req.params;
      const { name, description, focus_areas, weights } = req.body;
      
      // Valideer input
      if (!strategyId) {
        return res.status(400).json({
          success: false,
          message: 'Strategie ID is vereist'
        });
      }
      
      // Controleer of gebruiker admin is
      const { user } = req;
      
      if (!user || !user.is_admin) {
        return res.status(403).json({
          success: false,
          message: 'Alleen admins kunnen marketingstrategieën bijwerken'
        });
      }
      
      // Update strategie in database
      const updateData = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (focus_areas) updateData.focus_areas = focus_areas;
      if (weights) updateData.weights = weights;
      
      const { data, error } = await req.supabase
        .from('marketing_strategies')
        .update(updateData)
        .eq('id', strategyId)
        .select();
      
      if (error) {
        logger.error(`Fout bij bijwerken marketingstrategie: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: `Fout bij bijwerken marketingstrategie: ${error.message}`
        });
      }
      
      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Marketingstrategie niet gevonden'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Marketingstrategie succesvol bijgewerkt',
        data: data[0]
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
   * Verwijder een marketingstrategie (alleen voor admins)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteMarketingStrategy(req, res) {
    try {
      const { strategyId } = req.params;
      
      // Valideer input
      if (!strategyId) {
        return res.status(400).json({
          success: false,
          message: 'Strategie ID is vereist'
        });
      }
      
      // Controleer of gebruiker admin is
      const { user } = req;
      
      if (!user || !user.is_admin) {
        return res.status(403).json({
          success: false,
          message: 'Alleen admins kunnen marketingstrategieën verwijderen'
        });
      }
      
      // Bescherm standaard strategieën tegen verwijdering
      if (['balanced', 'aggressive', 'defensive', 'niche', 'innovative'].includes(strategyId)) {
        return res.status(400).json({
          success: false,
          message: 'Standaard strategieën kunnen niet worden verwijderd'
        });
      }
      
      // Verwijder strategie uit database
      const { error } = await req.supabase
        .from('marketing_strategies')
        .delete()
        .eq('id', strategyId);
      
      if (error) {
        logger.error(`Fout bij verwijderen marketingstrategie: ${error.message}`);
        return res.status(500).json({
          success: false,
          message: `Fout bij verwijderen marketingstrategie: ${error.message}`
        });
      }
      
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
  }
};

export default recommendationController;
