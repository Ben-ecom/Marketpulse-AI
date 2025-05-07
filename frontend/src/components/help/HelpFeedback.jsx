import React, { useState, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Snackbar, 
  Alert,
  IconButton,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import HelpInteractionService from '../../services/help/HelpInteractionService';

/**
 * Component voor het verzamelen van gebruikersfeedback over de help-functionaliteit
 * 
 * @param {Object} props - Component properties
 * @param {string} props.helpItemId - ID van het help-item waarop feedback wordt gegeven
 * @param {string} props.helpItemType - Type van het help-item (bijv. 'faq', 'tooltip', 'overlay')
 * @param {Function} props.onClose - Functie om het feedback component te sluiten
 */
const HelpFeedback = ({ helpItemId, helpItemType, onClose, userRole = 'user', experienceLevel = 'beginner' }) => {
  const [feedbackValue, setFeedbackValue] = useState(null); // null, 'positive', 'negative'
  const [comment, setComment] = useState('');
  const [showCommentField, setShowCommentField] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Haal de huidige pagina URL op
  const location = useLocation();
  const pageUrl = window.location.href;

  // Functie om feedback te verzenden
  const submitFeedback = async () => {
    if (!feedbackValue) return;
    
    setIsSubmitting(true);
    
    try {
      // Registreer de feedback in de database via de HelpInteractionService
      const { error } = await HelpInteractionService.submitHelpFeedback({
        helpItemId,
        helpItemType,
        value: feedbackValue === 'positive', // true voor positief, false voor negatief
        userRole,
        experienceLevel,
        comments: comment || undefined
      });
      
      if (!error) {
        // Toon bevestiging
        setSnackbarMessage('Bedankt voor je feedback!');
        setSnackbarSeverity('success');
        
        // Reset state na een korte vertraging
        setTimeout(() => {
          setFeedbackValue(null);
          setComment('');
          setShowCommentField(false);
          if (onClose) onClose();
        }, 2000);
      } else {
        // Toon foutmelding
        setSnackbarMessage('Er is een fout opgetreden bij het opslaan van je feedback. Probeer het later opnieuw.');
        setSnackbarSeverity('error');
        console.error('Error submitting feedback:', error);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSnackbarMessage('Er is een fout opgetreden bij het opslaan van je feedback. Probeer het later opnieuw.');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setIsSubmitting(false);
    }
  };

  // Handler voor feedback knoppen
  const handleFeedbackClick = (value) => {
    setFeedbackValue(value);
    setShowCommentField(true);
  };

  // Handler voor snackbar sluiten
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, maxWidth: 400, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Was deze help-informatie nuttig?
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label="close">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
        <Button
          variant={feedbackValue === 'positive' ? 'contained' : 'outlined'}
          color="success"
          startIcon={<ThumbUpIcon />}
          onClick={() => handleFeedbackClick('positive')}
        >
          Ja
        </Button>
        <Button
          variant={feedbackValue === 'negative' ? 'contained' : 'outlined'}
          color="error"
          startIcon={<ThumbDownIcon />}
          onClick={() => handleFeedbackClick('negative')}
        >
          Nee
        </Button>
      </Box>
      
      {showCommentField && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {feedbackValue === 'positive' 
              ? 'Wat vond je vooral nuttig?' 
              : 'Hoe kunnen we de help-informatie verbeteren?'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Jouw feedback (optioneel)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={submitFeedback}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
              {isSubmitting ? 'Versturen...' : 'Verstuur'}
            </Button>
          </Box>
        </Box>
      )}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default HelpFeedback;
