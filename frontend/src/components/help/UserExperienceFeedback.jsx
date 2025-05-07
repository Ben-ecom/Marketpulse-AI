import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Rating,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material';
import HelpInteractionService from '../../services/help/HelpInteractionService';

/**
 * UserExperienceFeedback Component
 * 
 * Een component voor het verzamelen van gebruikersfeedback over de algehele gebruikerservaring,
 * inclusief de help-functionaliteit en onboarding.
 * 
 * @component
 * @example
 * ```jsx
 * <UserExperienceFeedback
 *   open={showFeedback}
 *   onClose={() => setShowFeedback(false)}
 *   pageContext="awareness"
 *   userRole="marketer"
 *   experienceLevel="intermediate"
 * />
 * ```
 */
const UserExperienceFeedback = ({
  open,
  onClose,
  pageContext,
  userRole = 'user',
  experienceLevel = 'beginner',
  onSubmit
}) => {
  const theme = useTheme();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedAspects, setSelectedAspects] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Aspecten van de gebruikerservaring waarover feedback kan worden gegeven
  const experienceAspects = [
    { id: 'help', label: 'Help-systeem' },
    { id: 'onboarding', label: 'Onboarding' },
    { id: 'ui', label: 'Gebruikersinterface' },
    { id: 'navigation', label: 'Navigatie' },
    { id: 'content', label: 'Content' },
    { id: 'performance', label: 'Prestaties' }
  ];

  // Handler voor het selecteren/deselecteren van aspecten
  const handleAspectToggle = (aspectId) => {
    if (selectedAspects.includes(aspectId)) {
      setSelectedAspects(selectedAspects.filter(id => id !== aspectId));
    } else {
      setSelectedAspects([...selectedAspects, aspectId]);
    }
  };

  // Handler voor het indienen van feedback
  const handleSubmit = async () => {
    if (rating === 0 && feedback.trim() === '' && selectedAspects.length === 0) {
      return; // Geen feedback om in te dienen
    }

    setSubmitting(true);

    try {
      // Registreer de gebruikerservaring feedback in de database via de HelpInteractionService
      const { error } = await HelpInteractionService.submitUserExperienceFeedback({
        pageContext,
        rating,
        userRole,
        experienceLevel,
        comments: feedback.trim() || undefined
      });

      if (!error) {
        // Toon succes bericht
        setShowSuccess(true);
        
        // Reset formulier
        setRating(0);
        setFeedback('');
        setSelectedAspects([]);
        
        // Roep de onSubmit callback aan als die is meegegeven
        if (onSubmit) {
          onSubmit(rating, feedback.trim() || undefined);
        }
        
        // Sluit dialog na korte vertraging
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 1500);
      } else {
        console.error('Fout bij het opslaan van feedback:', error);
        setShowError(true);
      }
    } catch (error) {
      console.error('Fout bij het opslaan van feedback:', error);
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Handler voor het sluiten van het succes bericht
  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  // Handler voor het sluiten van het fout bericht
  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="user-experience-feedback-title"
      >
        <DialogTitle id="user-experience-feedback-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FeedbackIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Uw feedback</Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Hoe beoordeelt u uw ervaring met MarketPulse AI?
            </Typography>
            <Rating
              name="experience-rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              size="large"
              sx={{ mt: 1 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Welke aspecten wilt u beoordelen?
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {experienceAspects.map((aspect) => (
                <Chip
                  key={aspect.id}
                  label={aspect.label}
                  clickable
                  color={selectedAspects.includes(aspect.id) ? "primary" : "default"}
                  onClick={() => handleAspectToggle(aspect.id)}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Deel uw gedachten met ons
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Wat vindt u van de gebruikerservaring? Wat kan er beter?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            startIcon={<ThumbDownIcon />}
            color="error"
            variant="outlined"
            onClick={onClose}
          >
            Annuleren
          </Button>
          <Button
            startIcon={<ThumbUpIcon />}
            color="primary"
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            Feedback versturen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Succes bericht */}
      <Snackbar open={showSuccess} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Bedankt voor uw feedback! We gebruiken deze om MarketPulse AI te verbeteren.
        </Alert>
      </Snackbar>

      {/* Fout bericht */}
      <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          Er is een fout opgetreden bij het versturen van uw feedback. Probeer het later opnieuw.
        </Alert>
      </Snackbar>
    </>
  );
};

UserExperienceFeedback.propTypes = {
  /**
   * Of de feedback dialog open is
   */
  open: PropTypes.bool.isRequired,
  
  /**
   * Callback functie die wordt aangeroepen wanneer de dialog wordt gesloten
   */
  onClose: PropTypes.func,
  
  /**
   * De context/pagina waarop de feedback betrekking heeft
   */
  pageContext: PropTypes.string.isRequired,
  
  /**
   * De rol van de gebruiker (bijv. 'marketer', 'analyst')
   */
  userRole: PropTypes.string,
  
  /**
   * Het ervaringsniveau van de gebruiker (bijv. 'beginner', 'intermediate', 'expert')
   */
  experienceLevel: PropTypes.string,
  
  /**
   * Callback functie die wordt aangeroepen wanneer feedback is ingediend
   */
  onSubmit: PropTypes.func
};

export default UserExperienceFeedback;
