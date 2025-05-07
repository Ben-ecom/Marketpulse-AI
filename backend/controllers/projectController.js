/**
 * Project Controller
 * 
 * Deze controller bevat de logica voor het beheren van projecten,
 * inclusief het aanmaken van projecten met automatische configuratie.
 */

import { supabase } from '../utils/supabaseClient.js';
import { generateAutoConfig, saveConfiguration } from '../services/autoConfigService.js';

/**
 * Maak een nieuw project aan met automatische configuratie
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createProject = async (req, res) => {
  try {
    const projectData = req.body;
    const userId = req.user.id; // Veronderstelt dat de gebruiker is geauthenticeerd
    
    // Valideer verplichte velden
    if (!projectData.name || !projectData.category) {
      return res.status(400).json({
        success: false,
        message: 'Naam en categorie zijn verplicht'
      });
    }
    
    // Voeg metadata toe aan het project
    const project = {
      ...projectData,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'pending'
    };
    
    // Sla het project op in de database
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) {
      console.error('Fout bij het aanmaken van project:', error);
      return res.status(500).json({
        success: false,
        message: 'Er is een fout opgetreden bij het aanmaken van het project',
        error: error.message
      });
    }
    
    // Genereer automatische configuratie voor scraping
    const config = await generateAutoConfig(projectData);
    
    // Sla de configuratie op in de database
    const savedConfig = await saveConfiguration(config, newProject.id);
    
    // Start een achtergrondtaak om data te verzamelen (in een echte implementatie)
    // await startDataCollectionJob(newProject.id);
    
    // Stuur het aangemaakte project en de configuratie terug
    return res.status(201).json({
      success: true,
      message: 'Project succesvol aangemaakt',
      data: {
        project: newProject,
        config: savedConfig
      }
    });
  } catch (error) {
    console.error('Onverwachte fout bij het aanmaken van project:', error);
    return res.status(500).json({
      success: false,
      message: 'Er is een onverwachte fout opgetreden',
      error: error.message
    });
  }
};

/**
 * Haal alle projecten op voor een gebruiker
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProjects = async (req, res) => {
  try {
    const userId = req.user.id; // Veronderstelt dat de gebruiker is geauthenticeerd
    
    // Haal projecten op uit de database
    // In development mode gebruiken we de mock client die geen parameters voor order accepteert
    let projectsQuery = supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);
      
    // Voer de query uit
    const { data: projects, error } = await projectsQuery.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fout bij het ophalen van projecten:', error);
      return res.status(500).json({
        success: false,
        message: 'Er is een fout opgetreden bij het ophalen van projecten',
        error: error.message
      });
    }
    
    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Onverwachte fout bij het ophalen van projecten:', error);
    return res.status(500).json({
      success: false,
      message: 'Er is een onverwachte fout opgetreden',
      error: error.message
    });
  }
};

/**
 * Haal een specifiek project op
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Veronderstelt dat de gebruiker is geauthenticeerd
    
    // Haal het project op uit de database
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Fout bij het ophalen van project:', error);
      return res.status(500).json({
        success: false,
        message: 'Er is een fout opgetreden bij het ophalen van het project',
        error: error.message
      });
    }
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project niet gevonden'
      });
    }
    
    // Haal ook de configuratie op
    const { data: config, configError } = await supabase
      .from('scraping_configs')
      .select('*')
      .eq('project_id', id)
      .single();
    
    if (configError) {
      console.error('Fout bij het ophalen van project configuratie:', configError);
    }
    
    return res.status(200).json({
      success: true,
      data: {
        project,
        config: config || null
      }
    });
  } catch (error) {
    console.error('Onverwachte fout bij het ophalen van project:', error);
    return res.status(500).json({
      success: false,
      message: 'Er is een onverwachte fout opgetreden',
      error: error.message
    });
  }
};

/**
 * Update een bestaand project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id; // Veronderstelt dat de gebruiker is geauthenticeerd
    
    // Controleer of het project bestaat en van de gebruiker is
    const { data: existingProject, error: checkError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (checkError || !existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project niet gevonden of geen toegang'
      });
    }
    
    // Voeg metadata toe aan de updates
    const updatedProject = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Update het project in de database
    const { data: project, error } = await supabase
      .from('projects')
      .update(updatedProject)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Fout bij het updaten van project:', error);
      return res.status(500).json({
        success: false,
        message: 'Er is een fout opgetreden bij het updaten van het project',
        error: error.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Project succesvol bijgewerkt',
      data: project
    });
  } catch (error) {
    console.error('Onverwachte fout bij het updaten van project:', error);
    return res.status(500).json({
      success: false,
      message: 'Er is een onverwachte fout opgetreden',
      error: error.message
    });
  }
};

/**
 * Verwijder een project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Veronderstelt dat de gebruiker is geauthenticeerd
    
    // Controleer of het project bestaat en van de gebruiker is
    const { data: existingProject, error: checkError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (checkError || !existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project niet gevonden of geen toegang'
      });
    }
    
    // Verwijder eerst de configuratie
    const { error: configError } = await supabase
      .from('scraping_configs')
      .delete()
      .eq('project_id', id);
    
    if (configError) {
      console.error('Fout bij het verwijderen van project configuratie:', configError);
    }
    
    // Verwijder het project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Fout bij het verwijderen van project:', error);
      return res.status(500).json({
        success: false,
        message: 'Er is een fout opgetreden bij het verwijderen van het project',
        error: error.message
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Project succesvol verwijderd'
    });
  } catch (error) {
    console.error('Onverwachte fout bij het verwijderen van project:', error);
    return res.status(500).json({
      success: false,
      message: 'Er is een onverwachte fout opgetreden',
      error: error.message
    });
  }
};

export {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};
