/**
 * Awareness Controller
 * Beheert API endpoints voor awareness fasen classificatie en analyse
 */

import { validationResult } from 'express-validator';
import awarenessClassification from '../services/awarenessClassification.js';
import { supabase } from '../api/supabase.js';

/**
 * Initialiseer awareness fasen voor een project
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const initializeAwarenessPhases = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;

    // Controleer of project bestaat
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return res.status(404).json({ error: 'Project niet gevonden' });
    }

    // Initialiseer awareness fasen
    await awarenessClassification.initialize(projectId);
    
    // Haal awareness fasen op
    const { data: phases, error: phasesError } = await supabase
      .from('awareness_phases')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true });
      
    if (phasesError) {
      return res.status(500).json({ error: 'Fout bij ophalen van awareness fasen', message: phasesError.message });
    }

    res.json({
      success: true,
      message: 'Awareness fasen succesvol geïnitialiseerd',
      phases
    });
  } catch (error) {
    console.error('Error in initializeAwarenessPhases:', error);
    res.status(500).json({ error: 'Fout bij initialiseren van awareness fasen', message: error.message });
  }
};

/**
 * Haal awareness fasen op voor een project
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getAwarenessPhases = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { includeContent } = req.query;

    // Controleer of project bestaat
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return res.status(404).json({ error: 'Project niet gevonden' });
    }

    // Haal awareness fasen op
    let query = supabase
      .from('awareness_phases')
      .select(includeContent === 'true' ? '*' : '*, content:null')
      .eq('project_id', projectId)
      .order('order', { ascending: true });
    
    const { data: phases, error: phasesError } = await query;
    
    if (phasesError) {
      return res.status(500).json({ error: 'Fout bij ophalen van awareness fasen', message: phasesError.message });
    }

    res.json({
      success: true,
      phases
    });
  } catch (error) {
    console.error('Error in getAwarenessPhases:', error);
    res.status(500).json({ error: 'Fout bij ophalen van awareness fasen', message: error.message });
  }
};

/**
 * Classificeer content in awareness fasen
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const classifyContent = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const { contentItems, productContext } = req.body;

    // Controleer of project bestaat
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return res.status(404).json({ error: 'Project niet gevonden' });
    }

    // Controleer of contentItems aanwezig is
    if (!contentItems || !Array.isArray(contentItems) || contentItems.length === 0) {
      return res.status(400).json({ error: 'Geen content items gevonden om te classificeren' });
    }

    // Initialiseer awareness classificatie engine
    await awarenessClassification.initialize(projectId);

    // Classificeer content
    const classificationResults = await awarenessClassification.classifyBulk(contentItems, productContext);

    // Update fase distributie
    await awarenessClassification.updatePhaseDistribution(projectId, classificationResults);

    // Voeg content toe aan fasen
    await awarenessClassification.addContentToPhases(projectId, classificationResults);

    res.json({
      success: true,
      results: classificationResults
    });
  } catch (error) {
    console.error('Error in classifyContent:', error);
    res.status(500).json({ error: 'Fout bij classificeren van content', message: error.message });
  }
};

/**
 * Haal marketing aanbevelingen op voor een project
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getMarketingRecommendations = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;

    // Controleer of project bestaat
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return res.status(404).json({ error: 'Project niet gevonden' });
    }

    // Haal awareness fasen op met aanbevelingen
    const { data: phases, error: phasesError } = await supabase
      .from('awareness_phases')
      .select('name, description, recommended_angles')
      .eq('project_id', projectId)
      .order('order', { ascending: true });
      
    if (phasesError) {
      return res.status(500).json({ error: 'Fout bij ophalen van awareness fasen', message: phasesError.message });
    }

    // Haal distributie op
    const { data: distribution, error: distributionError } = await supabase
      .from('awareness_distribution')
      .select('*')
      .eq('project_id', projectId)
      .single();
      
    if (distributionError && distributionError.code !== 'PGRST116') { // PGRST116 is "niet gevonden" error
      return res.status(500).json({ error: 'Fout bij ophalen van awareness distributie', message: distributionError.message });
    }

    // Genereer aanbevelingen op basis van distributie en fasen
    const recommendations = awarenessClassification.generateRecommendations(phases, distribution);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error in getMarketingRecommendations:', error);
    res.status(500).json({ error: 'Fout bij ophalen van marketing aanbevelingen', message: error.message });
  }
};

/**
 * Update een awareness fase
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const updateAwarenessPhase = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, phaseName } = req.params;
    const updateData = req.body;

    // Controleer of project bestaat
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return res.status(404).json({ error: 'Project niet gevonden' });
    }

    // Controleer of fase bestaat
    const { data: phase, error: phaseError } = await supabase
      .from('awareness_phases')
      .select('*')
      .eq('project_id', projectId)
      .eq('name', phaseName)
      .single();
      
    if (phaseError || !phase) {
      return res.status(404).json({ error: 'Awareness fase niet gevonden' });
    }

    // Update fase
    const { data: updatedPhase, error: updateError } = await supabase
      .from('awareness_phases')
      .update(updateData)
      .eq('project_id', projectId)
      .eq('name', phaseName)
      .select()
      .single();
      
    if (updateError) {
      return res.status(500).json({ error: 'Fout bij bijwerken van awareness fase', message: updateError.message });
    }

    // Herinitialiseer awareness classificatie engine
    await awarenessClassification.initialize(projectId);

    res.json({
      success: true,
      message: 'Awareness fase succesvol bijgewerkt',
      phase: updatedPhase
    });
  } catch (error) {
    console.error('Error in updateAwarenessPhase:', error);
    res.status(500).json({ error: 'Fout bij bijwerken van awareness fase', message: error.message });
  }
};

/**
 * Voeg een indicator toe aan een awareness fase
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const addIndicator = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, phaseName } = req.params;
    const indicator = req.body;

    // Controleer of project bestaat
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return res.status(404).json({ error: 'Project niet gevonden' });
    }

    // Controleer of fase bestaat
    const { data: phase, error: phaseError } = await supabase
      .from('awareness_phases')
      .select('*')
      .eq('project_id', projectId)
      .eq('name', phaseName)
      .single();
      
    if (phaseError || !phase) {
      return res.status(404).json({ error: 'Awareness fase niet gevonden' });
    }

    // Voeg indicator toe aan fase
    const indicators = phase.indicators || [];
    indicators.push(indicator);

    // Update fase met nieuwe indicators
    const { data: updatedPhase, error: updateError } = await supabase
      .from('awareness_phases')
      .update({ indicators })
      .eq('project_id', projectId)
      .eq('name', phaseName)
      .select()
      .single();
      
    if (updateError) {
      return res.status(500).json({ error: 'Fout bij toevoegen van indicator', message: updateError.message });
    }

    // Herinitialiseer awareness classificatie engine
    await awarenessClassification.initialize(projectId);

    res.json({
      success: true,
      message: 'Indicator succesvol toegevoegd',
      phase: updatedPhase
    });
  } catch (error) {
    console.error('Error in addIndicator:', error);
    res.status(500).json({ error: 'Fout bij toevoegen van indicator', message: error.message });
  }
};

/**
 * Verwijder een indicator uit een awareness fase
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const removeIndicator = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, phaseName, indicatorId } = req.params;

    // Controleer of project bestaat
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return res.status(404).json({ error: 'Project niet gevonden' });
    }

    // Controleer of fase bestaat
    const { data: phase, error: phaseError } = await supabase
      .from('awareness_phases')
      .select('*')
      .eq('project_id', projectId)
      .eq('name', phaseName)
      .single();
      
    if (phaseError || !phase) {
      return res.status(404).json({ error: 'Awareness fase niet gevonden' });
    }

    // Verwijder indicator
    const indicators = phase.indicators || [];
    const updatedIndicators = indicators.filter(indicator => indicator.id !== indicatorId);

    // Update fase met nieuwe indicators
    const { data: updatedPhase, error: updateError } = await supabase
      .from('awareness_phases')
      .update({ indicators: updatedIndicators })
      .eq('project_id', projectId)
      .eq('name', phaseName)
      .select()
      .single();
      
    if (updateError) {
      return res.status(500).json({ error: 'Fout bij verwijderen van indicator', message: updateError.message });
    }

    // Herinitialiseer awareness classificatie engine
    await awarenessClassification.initialize(projectId);

    res.json({
      success: true,
      message: 'Indicator succesvol verwijderd',
      phase: updatedPhase
    });
  } catch (error) {
    console.error('Error in removeIndicator:', error);
    res.status(500).json({ error: 'Fout bij verwijderen van indicator', message: error.message });
  }
};

/**
 * Voeg een marketing aanbeveling toe aan een awareness fase
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const addMarketingAngle = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, phaseName } = req.params;
    const { title, description, examples } = req.body;

    // Controleer of project bestaat
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return res.status(404).json({ error: 'Project niet gevonden' });
    }

    // Controleer of fase bestaat
    const { data: phase, error: phaseError } = await supabase
      .from('awareness_phases')
      .select('*')
      .eq('project_id', projectId)
      .eq('name', phaseName)
      .single();
      
    if (phaseError || !phase) {
      return res.status(404).json({ error: 'Awareness fase niet gevonden' });
    }

    // Voeg marketing angle toe
    const recommendedAngles = phase.recommended_angles || [];
    recommendedAngles.push({
      id: Date.now().toString(), // Genereer een unieke ID
      title,
      description,
      examples: examples || []
    });

    // Update fase met nieuwe marketing angles
    const { data: updatedPhase, error: updateError } = await supabase
      .from('awareness_phases')
      .update({ recommended_angles: recommendedAngles })
      .eq('project_id', projectId)
      .eq('name', phaseName)
      .select()
      .single();
      
    if (updateError) {
      return res.status(500).json({ error: 'Fout bij toevoegen van marketing aanbeveling', message: updateError.message });
    }

    res.json({
      success: true,
      message: 'Marketing aanbeveling succesvol toegevoegd',
      phase: updatedPhase
    });
  } catch (error) {
    console.error('Error in addMarketingAngle:', error);
    res.status(500).json({ error: 'Fout bij toevoegen van marketing aanbeveling', message: error.message });
  }
};

/**
 * Verwijder een marketing aanbeveling uit een awareness fase
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const removeMarketingAngle = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, phaseName, angleId } = req.params;

    // Controleer of project bestaat
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return res.status(404).json({ error: 'Project niet gevonden' });
    }

    // Controleer of fase bestaat
    const { data: phase, error: phaseError } = await supabase
      .from('awareness_phases')
      .select('*')
      .eq('project_id', projectId)
      .eq('name', phaseName)
      .single();
      
    if (phaseError || !phase) {
      return res.status(404).json({ error: 'Awareness fase niet gevonden' });
    }

    // Verwijder marketing angle
    const recommendedAngles = phase.recommended_angles || [];
    const updatedAngles = recommendedAngles.filter(angle => angle.id !== angleId);

    // Update fase met nieuwe marketing angles
    const { data: updatedPhase, error: updateError } = await supabase
      .from('awareness_phases')
      .update({ recommended_angles: updatedAngles })
      .eq('project_id', projectId)
      .eq('name', phaseName)
      .select()
      .single();
      
    if (updateError) {
      return res.status(500).json({ error: 'Fout bij verwijderen van marketing aanbeveling', message: updateError.message });
    }

    res.json({
      success: true,
      message: 'Marketing aanbeveling succesvol verwijderd',
      phase: updatedPhase
    });
  } catch (error) {
    console.error('Error in removeMarketingAngle:', error);
    res.status(500).json({ error: 'Fout bij verwijderen van marketing aanbeveling', message: error.message });
  }
};
