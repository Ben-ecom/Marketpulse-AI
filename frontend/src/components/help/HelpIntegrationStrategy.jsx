import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Switch,
  FormControlLabel,
  useTheme
} from '@mui/material';

/**
 * HelpIntegrationStrategy Component
 * 
 * Deze component documenteert de strategie voor het integreren van help-functionaliteit in de MarketPulse AI applicatie.
 * Het biedt een overzicht van de verschillende componenten, services en integratiepunten.
 * 
 * @component
 * @example
 * ```jsx
 * <HelpIntegrationStrategy />
 * ```
 */
const HelpIntegrationStrategy = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('marketeer');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [useAdaptiveHelp, setUseAdaptiveHelp] = useState(true);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Help Integratie Strategie
      </Typography>
      
      <Typography variant="body1" paragraph>
        Deze documentatie beschrijft de strategie voor het integreren van help-functionaliteit in de MarketPulse AI applicatie.
        Het volgt de Sequential Thinking methodologie en het Context7 Framework voor een gestructureerde aanpak.
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant={activeTab === 'overview' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('overview')}
        >
          Overzicht
        </Button>
        <Button 
          variant={activeTab === 'components' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('components')}
        >
          Componenten
        </Button>
        <Button 
          variant={activeTab === 'services' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('services')}
        >
          Services
        </Button>
        <Button 
          variant={activeTab === 'integration' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('integration')}
        >
          Integratie
        </Button>
        <Button 
          variant={activeTab === 'testing' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('testing')}
        >
          Testen
        </Button>
      </Box>
      
      {activeTab === 'overview' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Overzicht
          </Typography>
          
          <Typography variant="body1" paragraph>
            De help-functionaliteit in MarketPulse AI is ontworpen om gebruikers te ondersteunen bij het gebruik van de applicatie.
            Het biedt contextuele hulp, FAQ's, video tutorials en gepersonaliseerde hulp op basis van gebruikersrol en ervaringsniveau.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Belangrijkste Componenten
          </Typography>
          
          <Box component="ul" sx={{ pl: 3 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>ContextualTooltip</strong> - Biedt contextuele hulp voor specifieke UI-elementen
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>FAQ</strong> - Toont veelgestelde vragen en antwoorden
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>VideoTutorials</strong> - Toont instructievideo's voor verschillende functies
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>PersonalizedHelp</strong> - Biedt gepersonaliseerde hulp op basis van gebruikersrol en ervaringsniveau
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>HelpMenu</strong> - Integreert alle help-componenten in een menu
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
            <Box component="li">
              <Typography variant="body1">
                <strong>ReportTooltips</strong> - Biedt contextuele tooltips voor verschillende secties van het rapport
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>TopicAwarenessReportHelp</strong> - Integreert contextuele help in het TopicAwarenessReport
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Services
          </Typography>
          
          <Box component="ul" sx={{ pl: 3 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>ABTestingService</strong> - Service voor het uitvoeren van A/B testen
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>HelpRecommendationService</strong> - Service voor het aanbevelen van help-content op basis van gebruikersgedrag
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Integratiepunten
          </Typography>
          
          <Box component="ul" sx={{ pl: 3 }}>
            <Box component="li">
              <Typography variant="body1">
                <strong>TopicAwarenessController</strong> - Integreert HelpMenu, ABTestHelpMethod en AdaptiveHelp
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body1">
                <strong>TopicAwarenessReport</strong> - Integreert TopicAwarenessReportHelp
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
      
      {activeTab === 'components' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Componenten
          </Typography>
          
          <Typography variant="body1" paragraph>
            De help-functionaliteit bestaat uit verschillende componenten die samen een uitgebreide help-ervaring bieden.
            Hieronder volgt een beschrijving van elke component.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ContextualTooltip
            </Typography>
            
            <Typography variant="body1" paragraph>
              De ContextualTooltip component biedt contextuele hulp voor specifieke UI-elementen. Het toont een tooltip met informatie over het element, links naar video tutorials en meer informatie.
            </Typography>
            
            <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`<ContextualTooltip
  title="Executive Summary"
  content="De Executive Summary geeft een beknopt overzicht van de belangrijkste inzichten."
  videoUrl="https://example.com/videos/executive-summary-tutorial.mp4"
  learnMoreUrl="https://docs.example.com/topic-awareness/executive-summary"
>
  <Typography variant="h5" component="h2">
    Executive Summary
  </Typography>
</ContextualTooltip>`}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ReportTooltips
            </Typography>
            
            <Typography variant="body1" paragraph>
              De ReportTooltips component is een wrapper rond de ContextualTooltip component die specifiek is ontworpen voor het TopicAwarenessReport. Het biedt tooltips voor verschillende secties van het rapport.
            </Typography>
            
            <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`<ReportTooltips section="executiveSummary">
  <Typography variant="h5" component="h2">
    Executive Summary
  </Typography>
</ReportTooltips>`}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              TopicAwarenessReportHelp
            </Typography>
            
            <Typography variant="body1" paragraph>
              De TopicAwarenessReportHelp component integreert contextuele help in het TopicAwarenessReport. Het biedt een zwevend help-menu met tooltips voor verschillende secties van het rapport.
            </Typography>
            
            <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`<TopicAwarenessReportHelp
  activeView="report"
  userRole="marketeer"
  experienceLevel="intermediate"
/>`}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ABTestHelpMethod
            </Typography>
            
            <Typography variant="body1" paragraph>
              De ABTestHelpMethod component test verschillende help-methoden via A/B testing. Het toont één van drie help-methoden op basis van de testgroep van de gebruiker en meet de interactie.
            </Typography>
            
            <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`<ABTestHelpMethod
  activeView="dashboard"
  title="Dashboard Help"
  content="Dit dashboard biedt een overzicht van alle topic awareness data."
  userRole="marketeer"
  experienceLevel="intermediate"
  onRoleChange={handleRoleChange}
  onExperienceLevelChange={handleExperienceLevelChange}
/>`}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              AdaptiveHelp
            </Typography>
            
            <Typography variant="body1" paragraph>
              De AdaptiveHelp component past help-content aan op basis van gebruikersgedrag. Het analyseert gebruikersinteracties en leert welke help-content het meest relevant is voor een specifieke gebruiker.
            </Typography>
            
            <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`<AdaptiveHelp
  activeView="dashboard"
  userRole="marketeer"
  experienceLevel="intermediate"
  onRoleChange={handleRoleChange}
  onExperienceLevelChange={handleExperienceLevelChange}
/>`}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
      
      {activeTab === 'services' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Services
          </Typography>
          
          <Typography variant="body1" paragraph>
            De help-functionaliteit maakt gebruik van verschillende services voor het uitvoeren van A/B testen en het aanbevelen van help-content op basis van gebruikersgedrag.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ABTestingService
            </Typography>
            
            <Typography variant="body1" paragraph>
              De ABTestingService is een service voor het uitvoeren van A/B testen in de applicatie. Het maakt het mogelijk om verschillende versies van componenten te tonen aan verschillende gebruikers en de interactie te meten.
            </Typography>
            
            <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`// Bepaal de testgroep van de gebruiker
const testId = ABTestingService.tests.helpMethodTest.id;
const variant = getTestVariant(testId, 3); // 3 varianten: 0, 1, 2

// Track dat de help-methode is bekeken
trackConversion(testId, 'view', { activeView, variant });`}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              HelpRecommendationService
            </Typography>
            
            <Typography variant="body1" paragraph>
              De HelpRecommendationService is een service die machine learning gebruikt om help-content aan te passen op basis van gebruikersgedrag. Het analyseert gebruikersinteracties en leert welke help-content het meest relevant is voor een specifieke gebruiker.
            </Typography>
            
            <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`// Track gebruikersgedrag
HelpRecommendationService.trackUserBehavior(
  HelpRecommendationService.USER_ACTIONS.VIEW_PAGE, 
  { activeView, userRole, experienceLevel }
);

// Haal aanbevolen help-content op
const recommendedContent = HelpRecommendationService.getRecommendedHelpContent(activeView);`}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
      
      {activeTab === 'integration' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Integratie
          </Typography>
          
          <Typography variant="body1" paragraph>
            De help-functionaliteit wordt geïntegreerd in verschillende delen van de applicatie. Hieronder volgt een beschrijving van de integratiepunten.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              TopicAwarenessController
            </Typography>
            
            <Typography variant="body1" paragraph>
              De TopicAwarenessController component integreert de HelpMenu, ABTestHelpMethod en AdaptiveHelp componenten. Het biedt een centrale plek voor het beheren van de help-functionaliteit in de applicatie.
            </Typography>
            
            <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`// In TopicAwarenessController.jsx
{useAdaptiveHelp ? (
  <AdaptiveHelp
    activeView={activeView}
    userRole={userRole}
    experienceLevel={experienceLevel}
    onRoleChange={handleRoleChange}
    onExperienceLevelChange={handleExperienceLevelChange}
  />
) : (
  <ABTestHelpMethod
    activeView={activeView}
    title={\`\${activeView.charAt(0).toUpperCase() + activeView.slice(1)} Help\`}
    content={\`Deze pagina biedt inzicht in de \${activeView} functionaliteit.\`}
    userRole={userRole}
    experienceLevel={experienceLevel}
    onRoleChange={handleRoleChange}
    onExperienceLevelChange={handleExperienceLevelChange}
  >
    <HelpOverlay activeView={activeView} />
  </ABTestHelpMethod>
)}`}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              TopicAwarenessReport
            </Typography>
            
            <Typography variant="body1" paragraph>
              De TopicAwarenessReport component integreert de TopicAwarenessReportHelp component. Het biedt contextuele hulp voor verschillende secties van het rapport.
            </Typography>
            
            <Box sx={{ bgcolor: theme.palette.grey[100], p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
{`// In TopicAwarenessReport.jsx
<Box>
  {/* Rapport content */}
  
  {/* Help component */}
  <TopicAwarenessReportHelp
    activeView="report"
    userRole={userRole}
    experienceLevel={experienceLevel}
  />
</Box>`}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Integratie Voorbeeld
            </Typography>
            
            <Typography variant="body1" paragraph>
              Hieronder volgt een voorbeeld van hoe de help-functionaliteit kan worden geïntegreerd in de applicatie. Het toont een gebruikersinterface met verschillende help-componenten.
            </Typography>
            
            <Box sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Topic Awareness Dashboard
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small">
                    Help
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    color={useAdaptiveHelp ? "secondary" : "primary"}
                    onClick={() => setUseAdaptiveHelp(!useAdaptiveHelp)}
                  >
                    {useAdaptiveHelp ? "A/B Testing" : "Adaptieve Help"}
                  </Button>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="user-role-label">Gebruikersrol</InputLabel>
                  <Select
                    labelId="user-role-label"
                    value={userRole}
                    label="Gebruikersrol"
                    onChange={(e) => setUserRole(e.target.value)}
                  >
                    <MenuItem value="general">Algemeen</MenuItem>
                    <MenuItem value="marketeer">Marketeer</MenuItem>
                    <MenuItem value="product_manager">Product Manager</MenuItem>
                    <MenuItem value="analyst">Analist</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="experience-level-label">Ervaringsniveau</InputLabel>
                  <Select
                    labelId="experience-level-label"
                    value={experienceLevel}
                    label="Ervaringsniveau"
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  >
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Gemiddeld</MenuItem>
                    <MenuItem value="advanced">Gevorderd</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={useAdaptiveHelp}
                      onChange={() => setUseAdaptiveHelp(!useAdaptiveHelp)}
                    />
                  }
                  label="Adaptieve Help"
                />
              </Box>
              
              <Box sx={{ height: 200, bgcolor: theme.palette.grey[100], borderRadius: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Dashboard Content
                </Typography>
              </Box>
              
              {/* Gesimuleerde help component */}
              <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: theme.palette.background.paper, 
                  borderRadius: 2,
                  boxShadow: 3,
                  maxWidth: 280
                }}>
                  <Typography variant="h6" gutterBottom>
                    Dashboard Help
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    Dit dashboard biedt een overzicht van alle topic awareness data en visualisaties.
                  </Typography>
                  
                  <Button variant="contained" size="small" fullWidth>
                    Meer informatie
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
      
      {activeTab === 'testing' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Testen
          </Typography>
          
          <Typography variant="body1" paragraph>
            De help-functionaliteit wordt getest via A/B testen en gebruikerstesten. Hieronder volgt een beschrijving van de teststrategie.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              A/B Testen
            </Typography>
            
            <Typography variant="body1" paragraph>
              De A/B testen worden uitgevoerd met de ABTestingService. Er worden drie verschillende help-methoden getest:
            </Typography>
            
            <Box component="ol" sx={{ pl: 3 }}>
              <Box component="li">
                <Typography variant="body1">
                  <strong>Contextual Tooltips</strong> - Tooltips die contextuele hulp bieden voor specifieke UI-elementen
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  <strong>Tour Guide</strong> - Een rondleiding door de applicatie
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  <strong>Personalized Help</strong> - Gepersonaliseerde hulp op basis van gebruikersrol en ervaringsniveau
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              De resultaten van de A/B testen worden geanalyseerd om te bepalen welke help-methode het meest effectief is voor verschillende gebruikersgroepen.
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gebruikerstesten
            </Typography>
            
            <Typography variant="body1" paragraph>
              Naast A/B testen worden er ook gebruikerstesten uitgevoerd om de effectiviteit van de help-functionaliteit te evalueren. Gebruikers worden gevraagd om verschillende taken uit te voeren met behulp van de help-functionaliteit en hun ervaringen te delen.
            </Typography>
            
            <Typography variant="body1" paragraph>
              De gebruikerstesten worden uitgevoerd met gebruikers met verschillende rollen en ervaringsniveaus om een representatief beeld te krijgen van de effectiviteit van de help-functionaliteit.
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Metrics
            </Typography>
            
            <Typography variant="body1" paragraph>
              De volgende metrics worden gebruikt om de effectiviteit van de help-functionaliteit te meten:
            </Typography>
            
            <Box component="ul" sx={{ pl: 3 }}>
              <Box component="li">
                <Typography variant="body1">
                  <strong>Help Views</strong> - Aantal keer dat de help-functionaliteit is bekeken
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  <strong>Help Clicks</strong> - Aantal keer dat er op een help-element is geklikt
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  <strong>Help Completes</strong> - Aantal keer dat de help-functionaliteit volledig is gebruikt
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  <strong>Positive Feedback</strong> - Aantal keer dat er positieve feedback is gegeven
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  <strong>Negative Feedback</strong> - Aantal keer dat er negatieve feedback is gegeven
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  <strong>Task Completion Rate</strong> - Percentage van taken dat succesvol is voltooid met behulp van de help-functionaliteit
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  <strong>Time to Complete</strong> - Tijd die nodig is om een taak te voltooien met behulp van de help-functionaliteit
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default HelpIntegrationStrategy;
