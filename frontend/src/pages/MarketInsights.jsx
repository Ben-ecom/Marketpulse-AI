import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Divider, 
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Button,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HelpIcon from '@mui/icons-material/Help';
import InfoIcon from '@mui/icons-material/Info';

// Import van de componenten
import ReviewsList from '../components/reviews/ReviewsList';
import CompetitorAnalysis from '../components/competitors/CompetitorAnalysis';
import AwarenessVisualization from '../components/awareness/AwarenessVisualization';
import IntegratedHelpSystem from '../components/help/IntegratedHelpSystem';
import ContextualTooltip from '../components/help/ContextualTooltip';

/**
 * MarketInsights pagina die alle nieuwe componenten samenbrengt
 * Deze pagina toont marktinzichten, concurrentie-analyse en klantreviews
 */
const MarketInsights = () => {
  // Mock data voor de awareness visualisatie
  const awarenessData = {
    phases: {
      awareness: 35,
      consideration: 25,
      decision: 30,
      loyalty: 10
    }
  };
  
  // User settings voor de help system
  const [userSettings] = useState({
    userRole: 'marketer',
    experienceLevel: 'intermediate'
  });
  
  return (
    <IntegratedHelpSystem activeView="market-insights" userRole={userSettings.userRole} experienceLevel={userSettings.experienceLevel}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Breadcrumbs navigatie */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          to="/"
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          <AnalyticsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Marktinzichten
        </Typography>
      </Breadcrumbs>
      
      {/* Pagina header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <ContextualTooltip
            title="Marktinzichten Dashboard"
            content="Dit dashboard biedt een compleet overzicht van uw marktpositie, concurrentie-analyse en klantfeedback. Gebruik deze inzichten om uw marketingstrategie te optimaliseren."
            videoUrl="https://example.com/videos/market-insights-overview.mp4"
            learnMoreUrl="https://docs.example.com/market-insights/overview"
            placement="bottom-start"
          >
            <Typography variant="h4" gutterBottom>
              Marktinzichten Dashboard
            </Typography>
          </ContextualTooltip>
          
          <IconButton color="primary" aria-label="help" size="small">
            <HelpIcon />
          </IconButton>
        </Box>
        
        <ContextualTooltip
          title="Dashboard Beschrijving"
          content="Hier vindt u een uitgebreid overzicht van uw marktpositie, inclusief awareness fasen, concurrentie-analyse en klantreviews. Deze inzichten helpen u om uw marketingstrategie te verbeteren."
          placement="bottom"
        >
          <Typography variant="body1" paragraph>
            Dit dashboard biedt een uitgebreid overzicht van je marktpositie, concurrentie-analyse en klantfeedback.
            Gebruik deze inzichten om je marketingstrategie te optimaliseren en je concurrentiepositie te versterken.
          </Typography>
        </ContextualTooltip>
        
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Laatste update: {new Date().toLocaleDateString('nl-NL', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Typography>
      </Paper>
      
      {/* Marktinzichten componenten */}
      {/* Awareness Visualisatie Component */}
      <ContextualTooltip
        title="Awareness Fasen Visualisatie"
        content="Deze visualisatie toont de verdeling van uw doelgroep over de verschillende awareness fasen volgens het model van Eugene Schwartz. Gebruik deze inzichten om uw marketingboodschap aan te passen aan het bewustzijnsniveau van uw doelgroep."
        videoUrl="https://example.com/videos/awareness-visualization.mp4"
        learnMoreUrl="https://docs.example.com/awareness/visualization"
        placement="top"
      >
        <Box sx={{ mb: 4 }}>
          <AwarenessVisualization data={awarenessData} />
        </Box>
      </ContextualTooltip>
      
      {/* Concurrentie-analyse Component */}
      <ContextualTooltip
        title="Concurrentie-analyse"
        content="Deze analyse vergelijkt uw merk met concurrenten op verschillende metrics zoals marktaandeel, online zichtbaarheid en klanttevredenheid. Gebruik deze inzichten om uw concurrentiepositie te versterken."
        videoUrl="https://example.com/videos/competitor-analysis.mp4"
        learnMoreUrl="https://docs.example.com/market-insights/competitors"
        placement="top"
      >
        <Box sx={{ mb: 4 }}>
          <CompetitorAnalysis />
        </Box>
      </ContextualTooltip>
      
      {/* Reviews Component */}
      <ContextualTooltip
        title="Klantreviews Analyse"
        content="Deze sectie toont een analyse van klantreviews van verschillende platforms. Gebruik deze inzichten om uw product of dienst te verbeteren en beter aan te sluiten bij de behoeften van uw klanten."
        videoUrl="https://example.com/videos/reviews-analysis.mp4"
        learnMoreUrl="https://docs.example.com/market-insights/reviews"
        placement="top"
      >
        <Box sx={{ mb: 4 }}>
          <ReviewsList productId="demo-product" />
        </Box>
      </ContextualTooltip>
      
      <Box sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} MarketPulse AI - Alle marktinzichten op één plek
        </Typography>
      </Box>
      </Container>
    </IntegratedHelpSystem>
  );
};

export default MarketInsights;
