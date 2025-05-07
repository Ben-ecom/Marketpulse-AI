import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Tooltip, useTheme, Fade, Paper, Typography, Button } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

/**
 * HelpOverlayManager Component
 * 
 * Een component dat een help-overlay biedt voor bestaande componenten zonder deze te wijzigen.
 * Het toont help-markers op belangrijke secties van de pagina en biedt contextuele help.
 * 
 * @component
 * @example
 * ```jsx
 * <HelpOverlayManager
 *   activeView="report"
 *   helpPoints={reportHelpPoints}
 *   onHelpInteraction={(action, section) => trackHelpInteraction(action, section)}
 * >
 *   <TopicAwarenessReport {...props} />
 * </HelpOverlayManager>
 * ```
 */
const HelpOverlayManager = ({
  activeView = 'dashboard',
  helpPoints = [],
  onHelpInteraction = () => {},
  children
}) => {
  const theme = useTheme();
  const [showHelp, setShowHelp] = useState(false);
  const [activeHelpPoint, setActiveHelpPoint] = useState(null);
  const [helpEnabled, setHelpEnabled] = useState(
    localStorage.getItem('helpEnabled') !== 'false'
  );
  
  // Effect om help-status op te slaan in localStorage
  useEffect(() => {
    localStorage.setItem('helpEnabled', helpEnabled);
  }, [helpEnabled]);
  
  // Handler voor het in-/uitschakelen van help
  const toggleHelp = () => {
    const newState = !showHelp;
    setShowHelp(newState);
    
    if (newState) {
      onHelpInteraction('open_help', activeView);
    } else {
      setActiveHelpPoint(null);
      onHelpInteraction('close_help', activeView);
    }
  };
  
  // Handler voor het tonen van help voor een specifiek punt
  const handleShowHelpPoint = (pointId) => {
    const helpPoint = helpPoints.find(point => point.id === pointId);
    setActiveHelpPoint(helpPoint);
    onHelpInteraction('view_help_point', pointId, pointId, 'help_point');
  };
  
  // Handler voor het verbergen van help voor een specifiek punt
  const handleHideHelpPoint = () => {
    onHelpInteraction('close_help_point', activeHelpPoint?.id, activeHelpPoint?.id, 'help_point');
    setActiveHelpPoint(null);
  };
  
  // Handler voor het bekijken van een video
  const handleViewVideo = (videoUrl) => {
    window.open(videoUrl, '_blank');
    onHelpInteraction('view_video', activeHelpPoint?.id, activeHelpPoint?.id, 'video');
  };
  
  // Handler voor het bekijken van meer informatie
  const handleLearnMore = (learnMoreUrl) => {
    window.open(learnMoreUrl, '_blank');
    onHelpInteraction('learn_more', activeHelpPoint?.id, activeHelpPoint?.id, 'learn_more');
  };
  
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Originele content */}
      {children}
      
      {/* Help toggle knop */}
      <Tooltip title={showHelp ? "Verberg help" : "Toon help"}>
        <IconButton
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1100,
            bgcolor: showHelp ? theme.palette.secondary.main : theme.palette.primary.main,
            color: showHelp ? theme.palette.secondary.contrastText : theme.palette.primary.contrastText,
            '&:hover': {
              bgcolor: showHelp ? theme.palette.secondary.dark : theme.palette.primary.dark,
            },
            boxShadow: 3
          }}
          onClick={toggleHelp}
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>
      
      {/* Help markers */}
      {showHelp && helpEnabled && helpPoints.map((point) => (
        <Tooltip key={point.id} title={point.title}>
          <IconButton
            sx={{
              position: 'absolute',
              top: point.position.top,
              left: point.position.left,
              zIndex: 1050,
              bgcolor: theme.palette.info.main,
              color: theme.palette.info.contrastText,
              width: 30,
              height: 30,
              '&:hover': {
                bgcolor: theme.palette.info.dark,
              },
              boxShadow: 2
            }}
            onClick={() => handleShowHelpPoint(point.id)}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ))}
      
      {/* Help content overlay */}
      <Fade in={activeHelpPoint !== null}>
        <Paper
          elevation={3}
          sx={{
            display: activeHelpPoint ? 'block' : 'none',
            position: 'absolute',
            top: activeHelpPoint?.contentPosition?.top || '50%',
            left: activeHelpPoint?.contentPosition?.left || '50%',
            transform: activeHelpPoint?.contentPosition?.transform || 'translate(-50%, -50%)',
            zIndex: 1060,
            p: 3,
            maxWidth: 400,
            borderRadius: 2,
            boxShadow: 4
          }}
        >
          {activeHelpPoint && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h3">
                  {activeHelpPoint.title}
                </Typography>
                <IconButton size="small" onClick={handleHideHelpPoint}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Typography variant="body1" paragraph>
                {activeHelpPoint.content}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {activeHelpPoint.videoUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PlayCircleOutlineIcon />}
                    onClick={() => handleViewVideo(activeHelpPoint.videoUrl)}
                  >
                    Video
                  </Button>
                )}
                
                {activeHelpPoint.learnMoreUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => handleLearnMore(activeHelpPoint.learnMoreUrl)}
                  >
                    Meer info
                  </Button>
                )}
              </Box>
            </>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

HelpOverlayManager.propTypes = {
  /**
   * De actieve view (dashboard, report, sentiment, trends, awareness, market-insights)
   */
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends', 'awareness', 'market-insights']),
  
  /**
   * Array met help-punten die op de pagina worden getoond
   */
  helpPoints: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      position: PropTypes.shape({
        top: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        left: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
      }).isRequired,
      contentPosition: PropTypes.shape({
        top: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        left: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        transform: PropTypes.string
      }),
      videoUrl: PropTypes.string,
      learnMoreUrl: PropTypes.string
    })
  ),
  
  /**
   * Callback functie die wordt aangeroepen bij interactie met help
   */
  onHelpInteraction: PropTypes.func,
  
  /**
   * De children componenten waarop de help-overlay wordt toegepast
   */
  children: PropTypes.node
};

export default HelpOverlayManager;
