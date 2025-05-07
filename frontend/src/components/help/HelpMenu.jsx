import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Help as HelpIcon,
  QuestionAnswer as QuestionAnswerIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  Tour as TourIcon,
  Close as CloseIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

import FAQ from './FAQ';
import VideoTutorials from './VideoTutorials';
import PersonalizedHelp from './PersonalizedHelp';
import HelpFeedback from './HelpFeedback';

/**
 * HelpMenu Component
 * 
 * Een component dat een help menu biedt met toegang tot FAQ, videotutorials en andere help-functionaliteiten.
 * 
 * @component
 * @example
 * ```jsx
 * <HelpMenu
 *   activeView="dashboard"
 *   faqItems={faqData}
 *   videos={videoData}
 *   onResetTour={() => resetTour()}
 * />
 * ```
 */
const HelpMenu = ({
  activeView = 'dashboard',
  faqItems = [],
  videos = [],
  userRole = 'general',
  experienceLevel = 'intermediate',
  onResetTour,
  onRoleChange,
  onExperienceLevelChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [showPersonalizedHelp, setShowPersonalizedHelp] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackItem, setFeedbackItem] = useState(null);
  
  // Handler voor het openen/sluiten van het menu
  const handleToggle = () => {
    setOpen(prev => !prev);
  };
  
  // Handler voor het openen van de FAQ
  const handleOpenFAQ = () => {
    setShowFAQ(true);
    setOpen(false);
  };
  
  // Handler voor het openen van de videotutorials
  const handleOpenVideos = () => {
    setShowVideos(true);
    setOpen(false);
  };
  
  // Handler voor het openen van de gepersonaliseerde hulp
  const handleOpenPersonalizedHelp = () => {
    setShowPersonalizedHelp(true);
    setOpen(false);
  };
  
  // Handler voor het resetten van de tour
  const handleResetTour = () => {
    if (onResetTour) {
      onResetTour();
    } else {
      // Standaard implementatie als er geen callback is meegegeven
      localStorage.removeItem('tourStatus');
      // Toon feedback dat de tour is gereset
      alert('Tour is gereset. Vernieuw de pagina om de tour opnieuw te starten.');
    }
    setOpen(false);
  };
  
  // Handler voor het sluiten van dialogs
  const handleCloseDialog = () => {
    setShowFAQ(false);
    setShowVideos(false);
    setShowPersonalizedHelp(false);
    setShowFeedback(false);
  };
  
  // Handler voor feedback op FAQ items
  const handleFAQFeedback = (questionId) => {
    setFeedbackItem({
      id: questionId,
      type: 'faq'
    });
    setShowFeedback(true);
  };
  
  // Handler voor het sluiten van het feedback formulier
  const handleCloseFeedback = () => {
    setShowFeedback(false);
    setFeedbackItem(null);
  };
  
  // Handler voor het bekijken van een video
  const handleVideoView = (videoId) => {
    console.log(`Video bekeken: ${videoId}`);
    // Hier zou je videoweergaven kunnen bijhouden in een database of analytics systeem
  };
  
  // Handler voor het bookmarken van een video
  const handleVideoBookmark = (videoId, bookmarked) => {
    console.log(`Video ${bookmarked ? 'gebookmarkt' : 'unbookmarkt'}: ${videoId}`);
    // Hier zou je bookmarks kunnen opslaan in localStorage of een database
  };
  
  return (
    <>
      {/* Help menu */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
        <SpeedDial
          ariaLabel="Help menu"
          icon={<SpeedDialIcon icon={<HelpIcon />} />}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
          direction="up"
        >
          <SpeedDialAction
            icon={<QuestionAnswerIcon />}
            tooltipTitle="Veelgestelde vragen"
            tooltipOpen={isMobile}
            onClick={handleOpenFAQ}
          />
          <SpeedDialAction
            icon={<PlayCircleOutlineIcon />}
            tooltipTitle="Videotutorials"
            tooltipOpen={isMobile}
            onClick={handleOpenVideos}
          />
          <SpeedDialAction
            icon={<SettingsIcon />}
            tooltipTitle="Gepersonaliseerde hulp"
            tooltipOpen={isMobile}
            onClick={handleOpenPersonalizedHelp}
          />
          <SpeedDialAction
            icon={<TourIcon />}
            tooltipTitle="Tour opnieuw starten"
            tooltipOpen={isMobile}
            onClick={handleResetTour}
          />
        </SpeedDial>
      </Box>
      
      {/* FAQ dialog */}
      <Dialog
        open={showFAQ}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="faq-dialog-title"
      >
        <DialogTitle id="faq-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Veelgestelde vragen
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDialog}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <FAQ
            faqItems={faqItems}
            onFeedback={(questionId) => handleFAQFeedback(questionId)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Sluiten
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Video tutorials dialog */}
      <Dialog
        open={showVideos}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="videos-dialog-title"
      >
        <DialogTitle id="videos-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Videotutorials
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDialog}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <VideoTutorials
            videos={videos}
            onVideoView={handleVideoView}
            onBookmark={handleVideoBookmark}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Sluiten
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Personalized help dialog */}
      <Dialog
        open={showPersonalizedHelp}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="personalized-help-dialog-title"
      >
        <DialogTitle id="personalized-help-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Gepersonaliseerde hulp
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDialog}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <PersonalizedHelp
            activeView={activeView}
            userRole={userRole}
            experienceLevel={experienceLevel}
            onRoleChange={onRoleChange}
            onExperienceLevelChange={onExperienceLevelChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Sluiten
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Feedback dialog */}
      <Dialog
        open={showFeedback}
        onClose={handleCloseFeedback}
        maxWidth="sm"
        fullWidth
        aria-labelledby="feedback-dialog-title"
      >
        <DialogContent>
          {feedbackItem && (
            <HelpFeedback
              helpItemId={feedbackItem.id}
              helpItemType={feedbackItem.type}
              onClose={handleCloseFeedback}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

HelpMenu.propTypes = {
  /**
   * De actieve view (dashboard, report, sentiment, trends)
   */
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends']),
  
  /**
   * De lijst met FAQ items
   */
  faqItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      question: PropTypes.string.isRequired,
      answer: PropTypes.node.isRequired,
      category: PropTypes.string
    })
  ),
  
  /**
   * De lijst met videotutorials
   */
  videos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      thumbnail: PropTypes.string.isRequired,
      videoUrl: PropTypes.string.isRequired,
      category: PropTypes.string,
      duration: PropTypes.number
    })
  ),
  
  /**
   * De rol van de gebruiker
   */
  userRole: PropTypes.oneOf(['general', 'marketeer', 'product_manager', 'analyst']),
  
  /**
   * Het ervaringsniveau van de gebruiker
   */
  experienceLevel: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']),
  
  /**
   * Callback functie die wordt aangeroepen wanneer de tour wordt gereset
   */
  onResetTour: PropTypes.func,
  
  /**
   * Callback functie die wordt aangeroepen wanneer de rol verandert
   */
  onRoleChange: PropTypes.func,
  
  /**
   * Callback functie die wordt aangeroepen wanneer het ervaringsniveau verandert
   */
  onExperienceLevelChange: PropTypes.func
};

export default HelpMenu;
