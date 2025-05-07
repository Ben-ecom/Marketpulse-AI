/**
 * HelpInteractionService.js
 * 
 * Service voor het registreren van help-systeem interacties en feedback in de database.
 * Deze service bevat functies voor het opslaan van gegevens in de help_interactions,
 * help_feedback en user_experience_feedback tabellen.
 */

import { supabase } from '../../utils/supabaseClient';

/**
 * Registreert een help interactie in de database
 * @param {Object} interaction - De interactie gegevens
 * @param {string} interaction.action - De actie (view, open_help, close_help, etc.)
 * @param {string} interaction.section - De sectie waar de interactie plaatsvond
 * @param {string} interaction.pageContext - De pagina context (dashboard, report, etc.)
 * @param {string} interaction.userRole - De rol van de gebruiker
 * @param {string} interaction.experienceLevel - Het ervaringsniveau van de gebruiker
 * @param {string} interaction.helpMethod - De gebruikte help-methode
 * @param {string} [interaction.helpItemId] - ID van het help-item (indien van toepassing)
 * @param {string} [interaction.helpItemType] - Type van het help-item (indien van toepassing)
 * @returns {Promise<Object>} - Resultaat van de database operatie
 */
export const trackHelpInteraction = async (interaction) => {
  try {
    const userId = supabase.auth.user()?.id;
    
    if (!userId) {
      console.warn('Kan help interactie niet registreren: gebruiker niet ingelogd');
      return { error: 'Gebruiker niet ingelogd' };
    }
    
    const { action, section, pageContext, userRole, experienceLevel, helpMethod, helpItemId, helpItemType } = interaction;
    
    const { data, error } = await supabase
      .from('help_interactions')
      .insert([
        {
          user_id: userId,
          action,
          page_context: pageContext,
          user_role: userRole,
          experience_level: experienceLevel,
          help_item_id: helpItemId || null,
          help_item_type: helpItemType || null
        }
      ]);
    
    if (error) {
      console.error('Fout bij registreren van help interactie:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Fout bij registreren van help interactie:', error);
    return { error };
  }
};

/**
 * Registreert feedback op een help-item in de database
 * @param {Object} feedback - De feedback gegevens
 * @param {string} feedback.helpItemId - ID van het help-item
 * @param {string} feedback.helpItemType - Type van het help-item
 * @param {boolean} feedback.value - De feedback waarde (true = positief, false = negatief)
 * @param {string} feedback.userRole - De rol van de gebruiker
 * @param {string} feedback.experienceLevel - Het ervaringsniveau van de gebruiker
 * @param {string} [feedback.comments] - Eventuele opmerkingen bij de feedback
 * @returns {Promise<Object>} - Resultaat van de database operatie
 */
export const submitHelpFeedback = async (feedback) => {
  try {
    const userId = supabase.auth.user()?.id;
    
    if (!userId) {
      console.warn('Kan help feedback niet registreren: gebruiker niet ingelogd');
      return { error: 'Gebruiker niet ingelogd' };
    }
    
    const { helpItemId, helpItemType, value, userRole, experienceLevel, comments } = feedback;
    
    const { data, error } = await supabase
      .from('help_feedback')
      .insert([
        {
          user_id: userId,
          help_item_id: helpItemId,
          help_item_type: helpItemType,
          feedback_value: value,
          user_role: userRole,
          experience_level: experienceLevel,
          comments: comments || null
        }
      ]);
    
    if (error) {
      console.error('Fout bij registreren van help feedback:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Fout bij registreren van help feedback:', error);
    return { error };
  }
};

/**
 * Registreert gebruikerservaring feedback in de database
 * @param {Object} feedback - De feedback gegevens
 * @param {string} feedback.pageContext - De pagina context (dashboard, report, etc.)
 * @param {number} feedback.rating - De rating (1-5)
 * @param {string} feedback.userRole - De rol van de gebruiker
 * @param {string} feedback.experienceLevel - Het ervaringsniveau van de gebruiker
 * @param {string} [feedback.comments] - Eventuele opmerkingen bij de feedback
 * @returns {Promise<Object>} - Resultaat van de database operatie
 */
export const submitUserExperienceFeedback = async (feedback) => {
  try {
    const userId = supabase.auth.user()?.id;
    
    if (!userId) {
      console.warn('Kan gebruikerservaring feedback niet registreren: gebruiker niet ingelogd');
      return { error: 'Gebruiker niet ingelogd' };
    }
    
    const { pageContext, rating, userRole, experienceLevel, comments } = feedback;
    
    const { data, error } = await supabase
      .from('user_experience_feedback')
      .insert([
        {
          user_id: userId,
          page_context: pageContext,
          rating,
          user_role: userRole,
          experience_level: experienceLevel,
          comments: comments || null
        }
      ]);
    
    if (error) {
      console.error('Fout bij registreren van gebruikerservaring feedback:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Fout bij registreren van gebruikerservaring feedback:', error);
    return { error };
  }
};

export default {
  trackHelpInteraction,
  submitHelpFeedback,
  submitUserExperienceFeedback
};
