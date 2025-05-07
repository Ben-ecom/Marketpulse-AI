import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CodeIcon from '@mui/icons-material/Code';
import IntegrationInstructionIcon from '@mui/icons-material/IntegrationInstructions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

/**
 * HelpIntegrationGuide Component
 * 
 * Deze component biedt een gids voor het integreren van help-functionaliteit in de MarketPulse AI applicatie.
 * Het laat zien hoe de verschillende help-componenten kunnen worden geïntegreerd in de applicatie,
 * met specifieke aandacht voor het TopicAwarenessReport component.
 * 
 * @component
 * @example
 * ```jsx
 * <HelpIntegrationGuide />
 * ```
 */
const HelpIntegrationGuide = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  // Handler voor het navigeren naar de volgende stap
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handler voor het navigeren naar de vorige stap
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handler voor het resetten van de stappen
  const handleReset = () => {
    setActiveStep(0);
  };

  // Integratiestappen
  const steps = [
    {
      label: 'Importeer de benodigde componenten',
      description: 'Importeer de TopicAwarenessReportHelp component in het TopicAwarenessReport component.',
      code: `// In TopicAwarenessReport.jsx
import TopicAwarenessReportHelp from '../help/TopicAwarenessReportHelp';
import ReportTooltips from '../help/ReportTooltips';`
    },
    {
      label: 'Integreer de ReportTooltips in de secties',
      description: 'Gebruik de ReportTooltips component om contextuele hulp te bieden bij de verschillende secties van het rapport.',
      code: `// In TopicAwarenessReport.jsx - renderExecutiveSummary functie
const renderExecutiveSummary = () => {
  return (
    <Card elevation={1} sx={{ mb: 3, overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ReportIcon color="primary" sx={{ mr: 1 }} />
          <ReportTooltips section="executiveSummary">
            <Typography variant="h5" component="h2">
              Executive Summary
            </Typography>
          </ReportTooltips>
        </Box>
        
        {/* Rest van de sectie */}
      </CardContent>
    </Card>
  );
};`
    },
    {
      label: 'Voeg de TopicAwarenessReportHelp component toe',
      description: 'Voeg de TopicAwarenessReportHelp component toe aan het TopicAwarenessReport component om een zwevend help-menu te bieden.',
      code: `// In TopicAwarenessReport.jsx - render functie
return (
  <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
    {/* Bestaande rapport content */}
    
    {/* Help component */}
    <TopicAwarenessReportHelp
      activeView="report"
      userRole={userRole}
      experienceLevel={experienceLevel}
    />
  </Paper>
);`
    },
    {
      label: 'Integreer met HelpRecommendationService',
      description: 'Gebruik de HelpRecommendationService om gebruikersgedrag te tracken en gepersonaliseerde hulp te bieden.',
      code: `// In TopicAwarenessReport.jsx
import HelpRecommendationService from '../../services/HelpRecommendationService';

// In useEffect
useEffect(() => {
  // Track page view
  HelpRecommendationService.trackUserBehavior(
    HelpRecommendationService.USER_ACTIONS.VIEW_PAGE, 
    { activeView: 'report', userRole, experienceLevel }
  );
}, [userRole, experienceLevel]);`
    },
    {
      label: 'Implementeer A/B testen',
      description: 'Gebruik de ABTestingService om verschillende help-methoden te testen en de meest effectieve te bepalen.',
      code: `// In TopicAwarenessReport.jsx
import ABTestingService, { getTestVariant, trackConversion } from '../../services/ABTestingService';

// In component
const testId = ABTestingService.tests.helpMethodTest.id;
const variant = getTestVariant(testId, 3); // 3 varianten: 0, 1, 2

// Toon verschillende help-methoden op basis van de variant
const renderHelpMethod = () => {
  switch (variant) {
    case 0:
      return <TopicAwarenessReportHelp activeView="report" userRole={userRole} experienceLevel={experienceLevel} />;
    case 1:
      return <TourGuide activeView="report" onComplete={handleTourComplete} />;
    case 2:
      return <PersonalizedHelp activeView="report" userRole={userRole} experienceLevel={experienceLevel} />;
    default:
      return null;
  }
};`
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Help Integratie Gids
      </Typography>
      
      <Typography variant="body1" paragraph>
        Deze gids laat zien hoe je de verschillende help-componenten kunt integreren in de MarketPulse AI applicatie,
        met specifieke aandacht voor het TopicAwarenessReport component.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Overzicht van Help Componenten
        </Typography>
        
        <Typography variant="body1" paragraph>
          De volgende help-componenten zijn beschikbaar voor integratie in de applicatie:
        </Typography>
        
        <Box component="ul" sx={{ pl: 3 }}>
          <Box component="li">
            <Typography variant="body1">
              <strong>ContextualTooltip</strong> - Biedt contextuele hulp voor specifieke UI-elementen
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              <strong>ReportTooltips</strong> - Wrapper rond ContextualTooltip specifiek voor het TopicAwarenessReport
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              <strong>TopicAwarenessReportHelp</strong> - Biedt een zwevend help-menu voor het TopicAwarenessReport
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              <strong>TourGuide</strong> - Leidt gebruikers door de applicatie met een stapsgewijze tour
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              <strong>OnboardingWizard</strong> - Leidt nieuwe gebruikers door de eerste stappen van het platform
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              <strong>HelpOverlay</strong> - Biedt een overlay met hulp voor verschillende componenten
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              <strong>ABTestHelpMethod</strong> - Test verschillende help-methoden via A/B testing
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              <strong>AdaptiveHelp</strong> - Past help-content aan op basis van gebruikersgedrag
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Integratie in TopicAwarenessReport
        </Typography>
        
        <Typography variant="body1" paragraph>
          Volg deze stappen om de help-functionaliteit te integreren in het TopicAwarenessReport component:
        </Typography>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="subtitle1">{step.label}</Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" paragraph>
                  {step.description}
                </Typography>
                
                <Paper sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1, mb: 2 }}>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {step.code}
                  </Typography>
                </Paper>
                
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      endIcon={index === steps.length - 1 ? <CheckCircleOutlineIcon /> : null}
                    >
                      {index === steps.length - 1 ? 'Voltooien' : 'Volgende'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Terug
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Integratie voltooid!
            </Typography>
            <Typography variant="body1" paragraph>
              Je hebt nu alle stappen doorlopen voor het integreren van help-functionaliteit in het TopicAwarenessReport component.
              De gebruikers hebben nu toegang tot contextuele hulp, tooltips en een zwevend help-menu.
            </Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Opnieuw bekijken
            </Button>
          </Paper>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Veelgestelde Vragen
        </Typography>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              Hoe kan ik de help-functionaliteit testen?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Je kunt de help-functionaliteit testen door de ABTestingService te gebruiken. Deze service maakt het mogelijk om verschillende help-methoden te tonen aan verschillende gebruikers en de interactie te meten.
            </Typography>
            <Typography variant="body2" paragraph>
              Gebruik de volgende metrics om de effectiviteit te meten:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <Box component="li">
                <Typography variant="body2">
                  Help Views - Aantal keer dat de help-functionaliteit is bekeken
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Help Clicks - Aantal keer dat er op een help-element is geklikt
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Help Completes - Aantal keer dat de help-functionaliteit volledig is gebruikt
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Positive/Negative Feedback - Feedback van gebruikers
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              Hoe kan ik de help-content aanpassen?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              De help-content kan worden aangepast in de volgende bestanden:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <Box component="li">
                <Typography variant="body2">
                  <code>ReportTooltips.jsx</code> - Voor het aanpassen van de tooltips in het TopicAwarenessReport
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  <code>TopicAwarenessReportHelp.jsx</code> - Voor het aanpassen van het zwevende help-menu
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  <code>TourGuide.jsx</code> - Voor het aanpassen van de tour stappen
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  <code>HelpOverlay.jsx</code> - Voor het aanpassen van de help overlay
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              Hoe werkt de personalisatie van help-content?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              De personalisatie van help-content wordt geregeld door de HelpRecommendationService. Deze service analyseert gebruikersgedrag en leert welke help-content het meest relevant is voor een specifieke gebruiker.
            </Typography>
            <Typography variant="body2" paragraph>
              De service houdt rekening met de volgende factoren:
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <Box component="li">
                <Typography variant="body2">
                  Gebruikersrol (marketeer, analist, product manager, etc.)
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Ervaringsniveau (beginner, gemiddeld, gevorderd)
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Interactiestijl (help-zoeker, taakgericht, ontdekkend)
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body2">
                  Gebruikersgedrag (paginaweergaven, help-weergaven, help-kliks, etc.)
                </Typography>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
};

export default HelpIntegrationGuide;
