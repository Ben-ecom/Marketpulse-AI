import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Fade,
  Popper,
  ClickAwayListener,
  useTheme
} from '@mui/material';
import {
  Help as HelpIcon,
  Close as CloseIcon,
  Lightbulb as LightbulbIcon,
  PlayCircleOutline as VideoIcon,
  Link as LinkIcon
} from '@mui/icons-material';

// Importeer services
import HelpRecommendationService, { 
  getRecommendedHelpContent, 
  trackUserBehavior, 
  getUserProfile 
} from '../../services/HelpRecommendationService';

// Importeer help componenten
import ContextualTooltip from './ContextualTooltip';
import TourGuide from './TourGuide';
import PersonalizedHelp from './PersonalizedHelp';

/**
 * AdaptiveHelp Component
 * 
 * Een component dat automatisch relevante help toont op basis van gebruikersacties.
 * De component analyseert gebruikersgedrag en past de help-content en -methode aan op basis van het gebruikersprofiel.
 * 
 * @component
 * @example
 * ```jsx
 * <AdaptiveHelp
 *   activeView="dashboard"
 *   userRole="marketeer"
 *   experienceLevel="intermediate"
 *   onRoleChange={handleRoleChange}
 *   onExperienceLevelChange={handleExperienceLevelChange}
 * />
 * ```
 */
const AdaptiveHelp = ({
  activeView = 'dashboard',
  userRole = 'general',
  experienceLevel = 'intermediate',
  onRoleChange,
  onExperienceLevelChange,
  children
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showPersonalizedHelp, setShowPersonalizedHelp] = useState(false);
  const [helpContent, setHelpContent] = useState({
    method: 'contextual',
    title: '',
    content: '',
    category: ''
  });
  
  // Effect om gebruikersprofiel en aanbevolen help-content op te halen
  useEffect(() => {
    // Track page view
    trackUserBehavior(HelpRecommendationService.USER_ACTIONS.VIEW_PAGE, { activeView });
    
    // Haal aanbevolen help-content op
    const recommendedContent = getRecommendedHelpContent(activeView);
    setHelpContent(recommendedContent);
    
    // Controleer of de gebruiker een voorkeur heeft voor een specifieke help-methode
    const profile = getUserProfile();
    if (profile.helpPreference === 'tour') {
      // Toon tour na een korte vertraging
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (profile.helpPreference === 'personalized') {
      // Toon personalized help na een korte vertraging
      const timer = setTimeout(() => {
        setShowPersonalizedHelp(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [activeView]);
  
  // Handler voor het openen van de help
  const handleOpenHelp = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
    
    // Track help view
    trackUserBehavior(HelpRecommendationService.USER_ACTIONS.HELP_VIEW, {
      activeView,
      method: helpContent.method,
      category: helpContent.category
    });
  };
  
  // Handler voor het sluiten van de help
  const handleCloseHelp = () => {
    setOpen(false);
  };
  
  // Handler voor het klikken op een help link
  const handleHelpClick = (type) => {
    // Track help click
    trackUserBehavior(HelpRecommendationService.USER_ACTIONS.HELP_CLICK, {
      activeView,
      method: helpContent.method,
      category: helpContent.category,
      type
    });
  };
  
  // Handler voor het voltooien van de tour
  const handleTourComplete = () => {
    setShowTour(false);
    
    // Track help complete
    trackUserBehavior(HelpRecommendationService.USER_ACTIONS.HELP_COMPLETE, {
      activeView,
      method: 'tour',
      category: helpContent.category
    });
  };
  
  // Handler voor het geven van positieve feedback
  const handlePositiveFeedback = () => {
    // Track positive feedback
    trackUserBehavior(HelpRecommendationService.USER_ACTIONS.FEEDBACK_POSITIVE, {
      activeView,
      method: helpContent.method,
      category: helpContent.category
    });
    
    // Sluit de help
    handleCloseHelp();
  };
  
  // Handler voor het geven van negatieve feedback
  const handleNegativeFeedback = () => {
    // Track negative feedback
    trackUserBehavior(HelpRecommendationService.USER_ACTIONS.FEEDBACK_NEGATIVE, {
      activeView,
      method: helpContent.method,
      category: helpContent.category
    });
    
    // Sluit de help
    handleCloseHelp();
  };
  
  // Render de juiste help-methode op basis van het gebruikersprofiel
  const renderHelp = () => {
    switch (helpContent.method) {
      case 'tour':
        return (
          <TourGuide
            activeView={activeView}
            onComplete={handleTourComplete}
          />
        );
      
      case 'personalized':
        return (
          <PersonalizedHelp
            activeView={activeView}
            userRole={userRole}
            experienceLevel={experienceLevel}
            onRoleChange={onRoleChange}
            onExperienceLevelChange={onExperienceLevelChange}
          />
        );
      
      case 'contextual':
      default:
        return (
          <>
            <IconButton
              color="primary"
              onClick={handleOpenHelp}
              aria-label="Help"
              size="large"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
                zIndex: 1000
              }}
            >
              <HelpIcon />
            </IconButton>
            
            <Popper
              open={open}
              anchorEl={anchorEl}
              placement="top-end"
              transition
              modifiers={[
                {
                  name: 'offset',
                  options: {
                    offset: [0, -10],
                  },
                },
              ]}
              sx={{ zIndex: 1100 }}
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}>
                  <Paper
                    elevation={3}
                    sx={{
                      p: 2,
                      maxWidth: 320,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <ClickAwayListener onClickAway={handleCloseHelp}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LightbulbIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6" color="primary">
                              {helpContent.title}
                            </Typography>
                          </Box>
                          <IconButton size="small" onClick={handleCloseHelp} aria-label="Sluiten">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body1" paragraph>
                          {helpContent.content}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Box>
                            <Tooltip title="Bekijk video tutorial">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleHelpClick('video')}
                                aria-label="Bekijk video"
                              >
                                <VideoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Meer informatie">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleHelpClick('link')}
                                aria-label="Meer informatie"
                              >
                                <LinkIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Was dit nuttig?
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                onClick={handlePositiveFeedback}
                              >
                                Ja
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="inherit"
                                onClick={handleNegativeFeedback}
                              >
                                Nee
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </ClickAwayListener>
                  </Paper>
                </Fade>
              )}
            </Popper>
          </>
        );
    }
  };
  
  return (
    <>
      {renderHelp()}
      {children}
      
      {/* Tour Guide (wordt alleen getoond als showTour true is) */}
      {showTour && (
        <TourGuide
          activeView={activeView}
          onComplete={handleTourComplete}
        />
      )}
      
      {/* Personalized Help (wordt alleen getoond als showPersonalizedHelp true is) */}
      {showPersonalizedHelp && (
        <Box sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              maxWidth: 320,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" color="primary">
                Gepersonaliseerde hulp
              </Typography>
              <IconButton size="small" onClick={() => setShowPersonalizedHelp(false)} aria-label="Sluiten">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="body2" paragraph>
              Klik hier voor hulp die is aangepast aan jouw rol en ervaring.
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => {
                // Track help click
                trackUserBehavior(HelpRecommendationService.USER_ACTIONS.HELP_CLICK, {
                  activeView,
                  method: 'personalized',
                  category: helpContent.category
                });
                
                // Toon PersonalizedHelp in een modal
                setShowPersonalizedHelp(false);
              }}
            >
              Toon gepersonaliseerde hulp
            </Button>
          </Paper>
        </Box>
      )}
    </>
  );
};

AdaptiveHelp.propTypes = {
  /**
   * De actieve view (dashboard, report, sentiment, trends)
   */
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends']),
  
  /**
   * De rol van de gebruiker
   */
  userRole: PropTypes.oneOf(['general', 'marketeer', 'product_manager', 'analyst']),
  
  /**
   * Het ervaringsniveau van de gebruiker
   */
  experienceLevel: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']),
  
  /**
   * Callback functie die wordt aangeroepen wanneer de rol verandert
   */
  onRoleChange: PropTypes.func,
  
  /**
   * Callback functie die wordt aangeroepen wanneer het ervaringsniveau verandert
   */
  onExperienceLevelChange: PropTypes.func,
  
  /**
   * De inhoud waarop de help-methode wordt toegepast
   */
  children: PropTypes.node
};

export default AdaptiveHelp;
