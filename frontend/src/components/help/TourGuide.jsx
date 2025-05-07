import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Fade,
  Zoom,
  Popper,
  ClickAwayListener,
  Backdrop
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  PlayArrow as StartIcon,
  Refresh as RestartIcon,
  CheckCircle as CompleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * TourGuide Component
 * 
 * Een component dat nieuwe gebruikers door de applicatie leidt met een stapsgewijze tour.
 * 
 * @component
 * @example
 * ```jsx
 * <TourGuide
 *   activeView="dashboard"
 *   onComplete={() => console.log('Tour completed')}
 * />
 * ```
 */
const TourGuide = ({ activeView = 'dashboard', onComplete }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showStartButton, setShowStartButton] = useState(true);
  const [tourCompleted, setTourCompleted] = useState(false);
  
  // Effect om de tour te resetten wanneer de activeView verandert
  useEffect(() => {
    setActiveStep(0);
    setOpen(false);
    setShowStartButton(true);
    
    // Haal de tour status op uit localStorage
    const tourStatus = localStorage.getItem('tourStatus');
    if (tourStatus) {
      const parsedStatus = JSON.parse(tourStatus);
      setTourCompleted(parsedStatus[activeView] || false);
    }
  }, [activeView]);
  
  // Tour stappen per view
  const tourSteps = {
    dashboard: [
      {
        title: 'Welkom bij het Dashboard',
        content: 'Dit dashboard biedt een overzicht van alle topic awareness data en visualisaties. Laten we je rondleiden!',
        target: '.dashboard-header',
        placement: 'bottom'
      },
      {
        title: 'Databron Selector',
        content: 'Hier kun je filteren op specifieke databronnen zoals Reddit, Amazon, Instagram of Trustpilot.',
        target: '.data-source-selector',
        placement: 'bottom'
      },
      {
        title: 'Datumbereik Selector',
        content: 'Hier kun je filteren op verschillende tijdsperiodes, van de afgelopen dag tot een aangepast bereik.',
        target: '.date-range-picker',
        placement: 'bottom'
      },
      {
        title: 'Awareness Distributie',
        content: 'Deze visualisatie toont de verdeling van topics over de verschillende awareness fasen.',
        target: '.awareness-distribution',
        placement: 'right'
      },
      {
        title: 'Trending Topics',
        content: 'Hier zie je de meest besproken onderwerpen binnen je doelgroep, gerangschikt op volume en sentiment.',
        target: '.trending-topics',
        placement: 'left'
      },
      {
        title: 'Content Aanbevelingen',
        content: 'Deze sectie biedt suggesties voor content die je kunt maken voor elke awareness fase.',
        target: '.content-recommendations',
        placement: 'top'
      },
      {
        title: 'Export Functionaliteit',
        content: 'Hier kun je het dashboard exporteren naar verschillende formaten zoals PDF, Excel of een afbeelding.',
        target: '.dashboard-export',
        placement: 'left'
      },
      {
        title: 'Deel Functionaliteit',
        content: 'Hier kun je inzichten delen via verschillende kanalen zoals e-mail, link of sociale media.',
        target: '.share-insights',
        placement: 'left'
      }
    ],
    report: [
      {
        title: 'Welkom bij het Rapport',
        content: 'Dit rapport biedt een gedetailleerde analyse van de topic awareness data. Laten we je rondleiden!',
        target: '.report-header',
        placement: 'bottom'
      },
      {
        title: 'Rapport Configuratie',
        content: 'Hier kun je het rapport aanpassen door secties toe te voegen of te verwijderen en het formaat te wijzigen.',
        target: '.report-config',
        placement: 'right'
      },
      {
        title: 'Executive Summary',
        content: 'Deze sectie biedt een beknopt overzicht van de belangrijkste inzichten uit de topic awareness analyse.',
        target: '.executive-summary',
        placement: 'bottom'
      },
      {
        title: 'Topic Details',
        content: 'Hier vind je gedetailleerde informatie over de topics in elke awareness fase.',
        target: '.topic-details',
        placement: 'bottom'
      },
      {
        title: 'Aanbevelingen',
        content: 'Deze sectie biedt concrete suggesties voor content en marketingstrategieën.',
        target: '.recommendations',
        placement: 'left'
      },
      {
        title: 'Export Opties',
        content: 'Hier kun je het rapport exporteren naar verschillende formaten en delen met anderen.',
        target: '.report-export',
        placement: 'bottom'
      }
    ],
    sentiment: [
      {
        title: 'Welkom bij de Sentiment Analyse',
        content: 'Deze analyse biedt inzicht in de positieve, neutrale en negatieve sentimenten binnen verschillende segmenten. Laten we je rondleiden!',
        target: '.sentiment-header',
        placement: 'bottom'
      },
      {
        title: 'Sentiment Filters',
        content: 'Hier kun je filteren op specifieke awareness fasen of topics om dieper in te zoomen op specifieke segmenten.',
        target: '.sentiment-filters',
        placement: 'bottom'
      },
      {
        title: 'Overall Sentiment',
        content: 'Deze sectie toont de algemene verdeling van positief, neutraal en negatief sentiment over alle topics.',
        target: '.overall-sentiment',
        placement: 'right'
      },
      {
        title: 'Sentiment per Fase',
        content: 'Hier zie je de verdeling van sentiment over de verschillende awareness fasen.',
        target: '.sentiment-by-phase',
        placement: 'left'
      },
      {
        title: 'Sentiment per Topic',
        content: 'Deze sectie toont de verdeling van sentiment voor elk individueel topic.',
        target: '.sentiment-by-topic',
        placement: 'top'
      }
    ],
    trends: [
      {
        title: 'Welkom bij de Trend Analyse',
        content: 'Deze analyse biedt inzicht in de ontwikkeling van topics en sentiment over verschillende tijdsperiodes. Laten we je rondleiden!',
        target: '.trend-header',
        placement: 'bottom'
      },
      {
        title: 'Trend Filters',
        content: 'Hier kun je filteren op specifieke topics, tijdsgranulariteit (dag, week, maand) en datatype (volume, sentiment).',
        target: '.trend-filters',
        placement: 'bottom'
      },
      {
        title: 'Trend Chart',
        content: 'Deze visualisatie toont de ontwikkeling van topics of sentiment over tijd.',
        target: '.trend-chart',
        placement: 'right'
      },
      {
        title: 'Trend Indicatoren',
        content: 'Hier zie je of een topic een stijgende, dalende of stabiele trend heeft.',
        target: '.trend-indicators',
        placement: 'left'
      }
    ]
  };
  
  // Huidige tour stappen op basis van de activeView
  const currentTourSteps = tourSteps[activeView] || [];
  
  // Huidige stap
  const currentStep = currentTourSteps[activeStep] || {};
  
  // Handler voor het starten van de tour
  const handleStartTour = () => {
    setShowStartButton(false);
    setOpen(true);
    setActiveStep(0);
    
    // Zoek het target element
    const targetElement = document.querySelector(currentStep.target);
    if (targetElement) {
      setAnchorEl(targetElement);
      
      // Scroll naar het element
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  // Handler voor het sluiten van de tour
  const handleCloseTour = () => {
    setOpen(false);
    setShowStartButton(true);
  };
  
  // Handler voor het voltooien van de tour
  const handleCompleteTour = () => {
    setOpen(false);
    setShowStartButton(true);
    setTourCompleted(true);
    
    // Sla de tour status op in localStorage
    const tourStatus = JSON.parse(localStorage.getItem('tourStatus') || '{}');
    tourStatus[activeView] = true;
    localStorage.setItem('tourStatus', JSON.stringify(tourStatus));
    
    // Roep de onComplete callback aan indien aanwezig
    if (onComplete) {
      onComplete();
    }
  };
  
  // Handler voor het navigeren naar de volgende stap
  const handleNext = () => {
    const nextStep = activeStep + 1;
    
    if (nextStep < currentTourSteps.length) {
      setActiveStep(nextStep);
      
      // Zoek het target element
      const targetElement = document.querySelector(currentTourSteps[nextStep].target);
      if (targetElement) {
        setAnchorEl(targetElement);
        
        // Scroll naar het element
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // Tour is voltooid
      handleCompleteTour();
    }
  };
  
  // Handler voor het navigeren naar de vorige stap
  const handlePrev = () => {
    const prevStep = activeStep - 1;
    
    if (prevStep >= 0) {
      setActiveStep(prevStep);
      
      // Zoek het target element
      const targetElement = document.querySelector(currentTourSteps[prevStep].target);
      if (targetElement) {
        setAnchorEl(targetElement);
        
        // Scroll naar het element
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  
  // Handler voor het herstarten van de tour
  const handleRestartTour = () => {
    setTourCompleted(false);
    setShowStartButton(false);
    setOpen(true);
    setActiveStep(0);
    
    // Zoek het target element
    const targetElement = document.querySelector(currentStep.target);
    if (targetElement) {
      setAnchorEl(targetElement);
      
      // Scroll naar het element
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Update de tour status in localStorage
    const tourStatus = JSON.parse(localStorage.getItem('tourStatus') || '{}');
    tourStatus[activeView] = false;
    localStorage.setItem('tourStatus', JSON.stringify(tourStatus));
  };
  
  return (
    <>
      {/* Start tour knop */}
      {showStartButton && !open && (
        <Zoom in={showStartButton}>
          <Box
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              zIndex: 1000
            }}
          >
            <Tooltip title={tourCompleted ? 'Tour opnieuw starten' : 'Tour starten'}>
              <Button
                variant="contained"
                color="primary"
                startIcon={tourCompleted ? <RestartIcon /> : <StartIcon />}
                onClick={tourCompleted ? handleRestartTour : handleStartTour}
                sx={{ borderRadius: 20 }}
              >
                {tourCompleted ? 'Tour opnieuw' : 'Tour starten'}
              </Button>
            </Tooltip>
          </Box>
        </Zoom>
      )}
      
      {/* Tour popper */}
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={currentStep.placement || 'bottom'}
        transition
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 15],
            },
          },
        ]}
        sx={{ zIndex: 1500 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              elevation={6}
              sx={{
                p: 2,
                maxWidth: 350,
                borderRadius: 2,
                border: `2px solid ${theme.palette.primary.main}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" color="primary">
                  {currentStep.title}
                </Typography>
                <IconButton size="small" onClick={handleCloseTour} aria-label="Sluiten">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Typography variant="body2" paragraph>
                {currentStep.content}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  size="small"
                  onClick={handlePrev}
                  disabled={activeStep === 0}
                  startIcon={<PrevIcon />}
                >
                  Vorige
                </Button>
                
                <Typography variant="body2" color="text.secondary">
                  {activeStep + 1} / {currentTourSteps.length}
                </Typography>
                
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  endIcon={activeStep === currentTourSteps.length - 1 ? <CompleteIcon /> : <NextIcon />}
                >
                  {activeStep === currentTourSteps.length - 1 ? 'Voltooien' : 'Volgende'}
                </Button>
              </Box>
            </Paper>
          </Fade>
        )}
      </Popper>
      
      {/* Backdrop voor focus */}
      <Backdrop
        sx={{ color: '#fff', zIndex: 1400 }}
        open={open}
        onClick={handleCloseTour}
      />
    </>
  );
};

TourGuide.propTypes = {
  /**
   * De actieve view (dashboard, report, sentiment, trends)
   */
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends']),
  
  /**
   * Callback functie die wordt aangeroepen wanneer de tour is voltooid
   */
  onComplete: PropTypes.func
};

export default TourGuide;
