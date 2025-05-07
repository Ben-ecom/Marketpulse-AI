/**
 * Project Routes
 * 
 * Deze module definieert de API routes voor projectbeheer.
 */

import express from 'express';
import { createProject, getProjects, getProjectById, updateProject, deleteProject } from '../controllers/projectController.js';
import { verifyToken, demoAuthMiddleware } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Bepaal welke middleware te gebruiken op basis van de omgeving
const authMiddleware = process.env.NODE_ENV === 'development' ? demoAuthMiddleware : verifyToken;

// Alle project routes vereisen authenticatie
router.use(authMiddleware);

// POST /api/v1/projects - Maak een nieuw project aan
router.post('/', createProject);

// GET /api/v1/projects - Haal alle projecten op voor de ingelogde gebruiker
router.get('/', getProjects);

// GET /api/v1/projects/:id - Haal een specifiek project op
router.get('/:id', getProjectById);

// PUT /api/v1/projects/:id - Update een project
router.put('/:id', updateProject);

// DELETE /api/v1/projects/:id - Verwijder een project
router.delete('/:id', deleteProject);

export default router;
