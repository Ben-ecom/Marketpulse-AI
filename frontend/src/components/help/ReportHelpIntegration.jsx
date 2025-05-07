import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import ReportTooltips from './ReportTooltips';
import HelpIcon from '@mui/icons-material/Help';

/**
 * ReportHelpIntegration Component
 * 
 * Deze component toont hoe de ReportTooltips component kan worden gebruikt in de TopicAwarenessReport component.
 * Het biedt voorbeelden voor verschillende secties van het rapport.
 * 
 * @component
 * @example
 * ```jsx
 * <ReportHelpIntegration />
 * ```
 */
const ReportHelpIntegration = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Integratie van Help Functionaliteit in TopicAwarenessReport
      </Typography>
      
      <Typography variant="body1" paragraph>
        Hieronder volgen voorbeelden van hoe de ReportTooltips component kan worden gebruikt in de TopicAwarenessReport component.
        Deze voorbeelden tonen hoe contextuele hulp kan worden geboden bij verschillende secties van het rapport.
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Voorbeeld 1: Executive Summary
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HelpIcon color="primary" sx={{ mr: 1 }} />
          <ReportTooltips section="executiveSummary">
            <Typography variant="h6" component="h2">
              Executive Summary
            </Typography>
          </ReportTooltips>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          Hover over de titel hierboven om contextuele hulp te zien voor de Executive Summary sectie.
        </Typography>
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Voorbeeld 2: Awareness Distributie
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HelpIcon color="primary" sx={{ mr: 1 }} />
          <ReportTooltips section="awarenessDistribution">
            <Typography variant="h6" component="h2">
              Awareness Distributie
            </Typography>
          </ReportTooltips>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          Hover over de titel hierboven om contextuele hulp te zien voor de Awareness Distributie sectie.
        </Typography>
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Voorbeeld 3: Rapport Opties
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HelpIcon color="primary" sx={{ mr: 1 }} />
          <ReportTooltips section="reportOptions">
            <Typography variant="h6" component="h2">
              Rapport Opties
            </Typography>
          </ReportTooltips>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          Hover over de titel hierboven om contextuele hulp te zien voor de Rapport Opties sectie.
        </Typography>
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Integratie in TopicAwarenessReport
        </Typography>
        
        <Typography variant="body1" paragraph>
          Om deze tooltips te integreren in de TopicAwarenessReport component, moet je de ReportTooltips component importeren en gebruiken rond de titels van de verschillende secties. Hier is een voorbeeld van hoe dat eruit zou zien:
        </Typography>
        
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 3 }}>
          <pre style={{ margin: 0, overflow: 'auto' }}>
{`// In TopicAwarenessReport.jsx
import ReportTooltips from '../help/ReportTooltips';

// ...

// Render sectie voor Executive Summary
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
};`}
          </pre>
        </Box>
        
        <Typography variant="body1" paragraph>
          Deze aanpak maakt het mogelijk om contextuele hulp toe te voegen zonder de structuur van het bestaande bestand te wijzigen. Het is modulair, onderhoudbaar en kan gemakkelijk worden uitgebreid met nieuwe secties.
        </Typography>
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Volgende Stappen
        </Typography>
        
        <Typography variant="body1" paragraph>
          1. Importeer de ReportTooltips component in de TopicAwarenessReport component.
        </Typography>
        
        <Typography variant="body1" paragraph>
          2. Pas de renderExecutiveSummary, renderTopicDetails, renderAwarenessDistribution, etc. functies aan om de ReportTooltips component te gebruiken.
        </Typography>
        
        <Typography variant="body1" paragraph>
          3. Test de tooltips om er zeker van te zijn dat ze correct werken en de juiste informatie tonen.
        </Typography>
        
        <Typography variant="body1" paragraph>
          4. Verzamel gebruikersfeedback om de tooltips te verbeteren en aan te passen aan de behoeften van de gebruikers.
        </Typography>
      </Box>
    </Box>
  );
};

export default ReportHelpIntegration;
