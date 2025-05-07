/**
 * MarketPulse AI Mock Project Server
 * 
 * Een mock server die de projectcreatie API simuleert voor testdoeleinden.
 */

import express from 'express';
import cors from 'cors';
import { generateAutoConfig } from './services/autoConfigService.js';

// Initialiseer Express app
const app = express();
const PORT = 5003; // Gebruik poort 5003 om overeen te komen met de frontend configuratie

// Middleware
app.use(cors());
app.use(express.json());

// Mock projecten database
const projects = [];

// API routes
app.use('/api/v1/projects', async (req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// GET /api/v1/projects - Haal alle projecten op
app.get('/api/v1/projects', (req, res) => {
  res.status(200).json({
    success: true,
    data: projects
  });
});

// GET /api/v1/projects/:id - Haal een specifiek project op
app.get('/api/v1/projects/:id', (req, res) => {
  const { id } = req.params;
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project niet gevonden'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      project,
      config: project.config
    }
  });
});

// POST /api/v1/projects - Maak een nieuw project aan
app.post('/api/v1/projects', async (req, res) => {
  try {
    const projectData = req.body;
    console.log('Ontvangen projectdata:', projectData);
    
    // Valideer verplichte velden
    if (!projectData.name || !projectData.category) {
      return res.status(400).json({
        success: false,
        message: 'Naam en categorie zijn verplicht'
      });
    }
    
    // Genereer automatische configuratie
    const config = await generateAutoConfig(projectData);
    console.log('Gegenereerde configuratie:', config);
    
    // Maak een nieuw project aan
    const newProject = {
      id: `mock-project-${Date.now()}`,
      ...projectData,
      user_id: 'mock-user-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
      config
    };
    
    // Voeg het project toe aan de mock database
    projects.push(newProject);
    
    // Stuur het aangemaakte project terug
    res.status(201).json({
      success: true,
      message: 'Project succesvol aangemaakt',
      data: {
        project: newProject,
        config
      }
    });
  } catch (error) {
    console.error('Fout bij het aanmaken van project:', error);
    res.status(500).json({
      success: false,
      message: 'Er is een fout opgetreden bij het aanmaken van het project',
      error: error.message
    });
  }
});

// PUT /api/v1/projects/:id - Update een project
app.put('/api/v1/projects/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const projectIndex = projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Project niet gevonden'
    });
  }
  
  // Update het project
  projects[projectIndex] = {
    ...projects[projectIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  res.status(200).json({
    success: true,
    message: 'Project succesvol bijgewerkt',
    data: projects[projectIndex]
  });
});

// DELETE /api/v1/projects/:id - Verwijder een project
app.delete('/api/v1/projects/:id', (req, res) => {
  const { id } = req.params;
  
  const projectIndex = projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Project niet gevonden'
    });
  }
  
  // Verwijder het project
  const deletedProject = projects.splice(projectIndex, 1)[0];
  
  res.status(200).json({
    success: true,
    message: 'Project succesvol verwijderd',
    data: deletedProject
  });
});

// GET /api/v1/projects/:id/config - Haal de configuratie van een project op
app.get('/api/v1/projects/:id/config', (req, res) => {
  const { id } = req.params;
  const project = projects.find(p => p.id === id);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project niet gevonden'
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'Configuratie succesvol opgehaald',
    config: project.config
  });
});

// PUT /api/v1/projects/:id/config - Update de configuratie van een project
app.put('/api/v1/projects/:id/config', (req, res) => {
  const { id } = req.params;
  const { config } = req.body;
  
  const projectIndex = projects.findIndex(p => p.id === id);
  
  if (projectIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Project niet gevonden'
    });
  }
  
  // Update de configuratie
  projects[projectIndex].config = config;
  projects[projectIndex].updated_at = new Date().toISOString();
  
  res.status(200).json({
    success: true,
    message: 'Configuratie succesvol bijgewerkt',
    config: projects[projectIndex].config
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'MarketPulse AI Mock Project Server',
    version: '1.0.0',
    endpoints: {
      projects: {
        get: '/api/v1/projects',
        getById: '/api/v1/projects/:id',
        post: '/api/v1/projects',
        put: '/api/v1/projects/:id',
        delete: '/api/v1/projects/:id',
        getConfig: '/api/v1/projects/:id/config',
        updateConfig: '/api/v1/projects/:id/config'
      }
    }
  });
});

// Start de server
app.listen(PORT, () => {
  console.log(`MarketPulse AI Mock Project Server draait op poort ${PORT}`);
});
