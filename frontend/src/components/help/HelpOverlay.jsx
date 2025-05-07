import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab
} from '@mui/material';
import {
  Close as CloseIcon,
  Help as HelpIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Sentiment as SentimentIcon,
  Timeline as TimelineIcon,
  KeyboardArrowRight as NextIcon,
  KeyboardArrowLeft as PrevIcon,
  CheckCircleOutline as CheckIcon
} from '@mui/icons-material';

/**
 * HelpOverlay Component
 * 
 * Een component dat gebruikers helpt bij het begrijpen en gebruiken van de verschillende
 * componenten in het MarketPulse AI platform.
 * 
 * @component
 * @example
 * ```jsx
 * <HelpOverlay activeView="dashboard" />
 * ```
 */
const HelpOverlay = ({ activeView = 'dashboard', onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  
  // Effect om de juiste tab te selecteren op basis van de activeView prop
  useEffect(() => {
    switch (activeView) {
      case 'dashboard':
        setActiveTab(0);
        break;
      case 'report':
        setActiveTab(1);
        break;
      case 'sentiment':
        setActiveTab(2);
        break;
      case 'trends':
        setActiveTab(3);
        break;
      default:
        setActiveTab(0);
    }
  }, [activeView]);
  
  // Handler voor het openen van de help overlay
  const handleOpen = () => {
    setOpen(true);
  };
  
  // Handler voor het sluiten van de help overlay
  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };
  
  // Handler voor het wijzigen van de actieve tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setActiveStep(0); // Reset de actieve stap bij het wijzigen van de tab
  };
  
  // Handler voor het wijzigen van de actieve stap
  const handleStepChange = (step) => {
    setActiveStep(step);
  };
  
  // Handler voor het navigeren naar de volgende stap
  const handleNext = () => {
    const maxSteps = helpContent[activeTab].steps.length - 1;
    setActiveStep((prevStep) => Math.min(prevStep + 1, maxSteps));
  };
  
  // Handler voor het navigeren naar de vorige stap
  const handlePrev = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };
  
  // Help content voor de verschillende componenten
  const helpContent = [
    // Dashboard help content
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      description: 'Het dashboard biedt een overzicht van alle topic awareness data en visualisaties.',
      steps: [
        {
          label: 'Awareness Distributie',
          content: 'De awareness distributie visualisatie toont de verdeling van topics over de verschillende awareness fasen. Elke fase vertegenwoordigt een niveau van bewustzijn bij de doelgroep, van "Unaware" (onbewust) tot "Most Aware" (zeer bewust).'
        },
        {
          label: 'Trending Topics',
          content: 'De trending topics sectie toont de meest besproken onderwerpen binnen je doelgroep, gerangschikt op volume en sentiment. Gebruik deze inzichten om te begrijpen waar je doelgroep over praat.'
        },
        {
          label: 'Content Aanbevelingen',
          content: 'De content aanbevelingen sectie biedt suggesties voor content die je kunt maken voor elke awareness fase. Deze aanbevelingen zijn gebaseerd op de topics en sentiment in elke fase.'
        },
        {
          label: 'Filtering',
          content: 'Gebruik de databron en datumbereik filters bovenaan het dashboard om de data te filteren op specifieke bronnen (Reddit, Amazon, etc.) en tijdsperiodes.'
        },
        {
          label: 'Exporteren',
          content: 'Je kunt het dashboard exporteren naar verschillende formaten (PDF, Excel, afbeelding) met de export knop in de rechterbovenhoek.'
        }
      ]
    },
    // Report help content
    {
      title: 'Rapport',
      icon: <DescriptionIcon />,
      description: 'Het rapport biedt een gedetailleerde analyse van de topic awareness data en kan worden aangepast en geëxporteerd.',
      steps: [
        {
          label: 'Rapport Configuratie',
          content: 'Gebruik de configuratie opties aan de linkerkant om het rapport aan te passen. Je kunt kiezen welke secties je wilt opnemen en hoe je het rapport wilt formatteren.'
        },
        {
          label: 'Executive Summary',
          content: 'De executive summary biedt een beknopt overzicht van de belangrijkste inzichten uit de topic awareness analyse. Dit is ideaal voor het delen met stakeholders die snel de belangrijkste punten willen begrijpen.'
        },
        {
          label: 'Topic Details',
          content: 'De topic details sectie biedt gedetailleerde informatie over de topics in elke awareness fase, inclusief relevantie, frequentie, groei en sentiment.'
        },
        {
          label: 'Aanbevelingen',
          content: 'De aanbevelingen sectie biedt concrete suggesties voor content en marketingstrategieën op basis van de topic awareness analyse.'
        },
        {
          label: 'Exporteren',
          content: 'Je kunt het rapport exporteren naar verschillende formaten (PDF, Word, etc.) met de export knop onderaan het rapport. Je kunt ook kiezen om het rapport te delen via e-mail of een link.'
        }
      ]
    },
    // Sentiment Analysis help content
    {
      title: 'Sentiment Analyse',
      icon: <SentimentIcon />,
      description: 'De sentiment analyse biedt inzicht in de positieve, neutrale en negatieve sentimenten binnen verschillende segmenten.',
      steps: [
        {
          label: 'Overall Sentiment',
          content: 'De overall sentiment sectie toont de algemene verdeling van positief, neutraal en negatief sentiment over alle topics. Dit geeft een snel overzicht van hoe je doelgroep zich voelt over de onderwerpen.'
        },
        {
          label: 'Sentiment per Fase',
          content: 'De sentiment per fase visualisatie toont de verdeling van sentiment over de verschillende awareness fasen. Dit helpt je te begrijpen hoe het sentiment verschilt tussen mensen met verschillende niveaus van bewustzijn.'
        },
        {
          label: 'Sentiment per Topic',
          content: 'De sentiment per topic sectie toont de verdeling van sentiment voor elk individueel topic. Dit helpt je te identificeren welke topics positieve of negatieve reacties oproepen.'
        },
        {
          label: 'Filtering',
          content: 'Gebruik de filters bovenaan om de data te filteren op specifieke awareness fasen of topics. Dit helpt je om dieper in te zoomen op specifieke segmenten.'
        },
        {
          label: 'Interpretatie',
          content: 'Gebruik de sentiment indicatoren (smileys) en percentage bars om snel te zien hoe positief of negatief een topic of fase is. Rood betekent negatief, geel neutraal en groen positief.'
        }
      ]
    },
    // Trend Analysis help content
    {
      title: 'Trend Analyse',
      icon: <TimelineIcon />,
      description: 'De trend analyse biedt inzicht in de ontwikkeling van topics en sentiment over verschillende tijdsperiodes.',
      steps: [
        {
          label: 'Trend Chart',
          content: 'De trend chart visualiseert de ontwikkeling van topics of sentiment over tijd. Je kunt zien hoe het volume of sentiment van topics verandert over de geselecteerde tijdsperiode.'
        },
        {
          label: 'Trend Indicatoren',
          content: 'De trend indicatoren tonen of een topic een stijgende, dalende of stabiele trend heeft. Dit helpt je snel te identificeren welke topics aan populariteit winnen of verliezen.'
        },
        {
          label: 'Topic Filter',
          content: 'Gebruik de topic filter om te focussen op specifieke topics of om de top 5 topics te bekijken. Dit helpt je om de meest relevante trends te identificeren.'
        },
        {
          label: 'Tijdsgranulariteit',
          content: 'Gebruik de tijdsgranulariteit knoppen (dag, week, maand) om de data op verschillende niveaus van detail te bekijken. Dit helpt je om zowel korte-termijn fluctuaties als lange-termijn trends te identificeren.'
        },
        {
          label: 'Data Type',
          content: 'Schakel tussen volume en sentiment visualisatie om verschillende aspecten van de trends te bekijken. Volume toont hoe vaak een topic wordt genoemd, terwijl sentiment toont hoe positief of negatief er over wordt gesproken.'
        }
      ]
    }
  ];
  
  return (
    <>
      {/* Help knop */}
      <Tooltip title="Help">
        <IconButton
          color="primary"
          onClick={handleOpen}
          aria-label="Help"
          sx={{ position: 'fixed', bottom: 16, right: 16, bgcolor: 'background.paper', boxShadow: 2 }}
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>
      
      {/* Help dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby="help-dialog-title"
      >
        <DialogTitle id="help-dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            MarketPulse AI Help
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <Divider />
        
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="help tabs"
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons={isMobile ? 'auto' : false}
            >
              {helpContent.map((content, index) => (
                <Tab
                  key={index}
                  icon={content.icon}
                  label={!isMobile ? content.title : undefined}
                  id={`help-tab-${index}`}
                  aria-controls={`help-tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>
          
          {helpContent.map((content, index) => (
            <Box
              key={index}
              role="tabpanel"
              hidden={activeTab !== index}
              id={`help-tabpanel-${index}`}
              aria-labelledby={`help-tab-${index}`}
            >
              {activeTab === index && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {content.title}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    {content.description}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {content.steps.map((step, stepIndex) => (
                      <Step key={stepIndex}>
                        <StepLabel
                          onClick={() => handleStepChange(stepIndex)}
                          sx={{ cursor: 'pointer' }}
                        >
                          {step.label}
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" paragraph>
                            {step.content}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Button
                              disabled={activeStep === 0}
                              onClick={handlePrev}
                              startIcon={<PrevIcon />}
                            >
                              Vorige
                            </Button>
                            <Button
                              disabled={activeStep === content.steps.length - 1}
                              onClick={handleNext}
                              endIcon={<NextIcon />}
                              variant="contained"
                              color="primary"
                            >
                              Volgende
                            </Button>
                          </Box>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              )}
            </Box>
          ))}
        </DialogContent>
        
        <Divider />
        
        <DialogActions>
          <Button
            onClick={handleClose}
            color="primary"
            variant="outlined"
            startIcon={<CheckIcon />}
          >
            Begrepen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

HelpOverlay.propTypes = {
  /**
   * De actieve view (dashboard, report, sentiment, trends)
   */
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends']),
  
  /**
   * Callback functie die wordt aangeroepen wanneer de help overlay wordt gesloten
   */
  onClose: PropTypes.func
};

export default HelpOverlay;
