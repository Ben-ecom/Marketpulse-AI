import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  Divider,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  ButtonGroup
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

// Componenten
import AwarenessVisualization from '../components/charts/AwarenessVisualization';
import ExportButton from '../components/export/ExportButton';

// Utilities
import { calculateAwarenessScore, getAwarenessPhaseDetails } from '../utils/insights/awarenessUtils';

// API
import { projectsApi } from '../api/apiClient';

/**
 * Awareness Fase Dashboard
 * 
 * Dit dashboard toont inzichten over de customer journey fasen (AIDA model):
 * - Awareness (Bewustzijn)
 * - Interest (Interesse)
 * - Desire (Verlangen)
 * - Action (Actie)
 */
const AwarenessPhaseDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [project, setProject] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedPhase, setSelectedPhase] = useState(null);
  
  // Tabs
  const tabs = [
    { label: 'Overzicht', value: 0 },
    { label: 'Bewustzijn', value: 1 },
    { label: 'Interesse', value: 2 },
    { label: 'Verlangen', value: 3 },
    { label: 'Actie', value: 4 }
  ];
  
  // Platforms
  const platforms = [
    { label: 'Alle Platforms', value: 'all' },
    { label: 'Reddit', value: 'reddit' },
    { label: 'Amazon', value: 'amazon' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'TikTok', value: 'tiktok' }
  ];
  
  // Mock data voor ontwikkeling
  const mockInsights = {
    awareness: {
      overall: {
        awareness: 65,
        interest: 48,
        desire: 32,
        action: 18
      },
      trends: {
        awareness: 5,
        interest: 8,
        desire: -3,
        action: 2
      },
      timeline: [
        { date: '2025-01', awareness: 60, interest: 40, desire: 35, action: 16 },
        { date: '2025-02', awareness: 62, interest: 42, desire: 34, action: 17 },
        { date: '2025-03', awareness: 63, interest: 45, desire: 33, action: 17 },
        { date: '2025-04', awareness: 65, interest: 48, desire: 32, action: 18 }
      ],
      platforms: {
        reddit: {
          awareness: 70,
          interest: 52,
          desire: 35,
          action: 15
        },
        amazon: {
          awareness: 60,
          interest: 45,
          desire: 30,
          action: 25
        },
        instagram: {
          awareness: 75,
          interest: 55,
          desire: 40,
          action: 20
        },
        tiktok: {
          awareness: 80,
          interest: 60,
          desire: 35,
          action: 15
        }
      },
      details: {
        awareness: {
          description: "De mate waarin je doelgroep bekend is met je product of dienst.",
          factors: [
            { factor: "Merkbekendheid", score: 68, trend: 4 },
            { factor: "Productbekendheid", score: 62, trend: 6 },
            { factor: "Categorie-associatie", score: 65, trend: 5 }
          ],
          recommendations: [
            "Verhoog je zichtbaarheid op sociale media",
            "Overweeg samenwerkingen met influencers",
            "Verbeter je SEO-strategie"
          ]
        },
        interest: {
          description: "De mate waarin je doelgroep interesse toont in je product of dienst.",
          factors: [
            { factor: "Informatiezoeking", score: 52, trend: 7 },
            { factor: "Engagement", score: 45, trend: 9 },
            { factor: "Merkoverweging", score: 47, trend: 8 }
          ],
          recommendations: [
            "Verbeter je contentmarketing",
            "Creëer meer interactieve content",
            "Optimaliseer je productpagina's"
          ]
        },
        desire: {
          description: "De mate waarin je doelgroep je product of dienst wil hebben.",
          factors: [
            { factor: "Productvoorkeur", score: 35, trend: -2 },
            { factor: "Koopintentie", score: 30, trend: -4 },
            { factor: "Merkvoorkeur", score: 31, trend: -3 }
          ],
          recommendations: [
            "Verbeter je productpresentatie",
            "Voeg meer sociale bewijzen toe",
            "Benadruk je unieke waardepropositie"
          ]
        },
        action: {
          description: "De mate waarin je doelgroep daadwerkelijk actie onderneemt.",
          factors: [
            { factor: "Conversie", score: 20, trend: 1 },
            { factor: "Herhaalaankopen", score: 15, trend: 3 },
            { factor: "Aanbevelingen", score: 19, trend: 2 }
          ],
          recommendations: [
            "Vereenvoudig je checkout proces",
            "Implementeer een loyaliteitsprogramma",
            "Verbeter je klantenservice"
          ]
        }
      }
    }
  };
  
  // Laad project en inzichten
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Haal project op
        const projectResponse = await projectsApi.getById(projectId);
        setProject(projectResponse.data.data.project);
        
        // Haal inzichten op
        const insightsResponse = await projectsApi.getInsights(projectId);
        setInsights(insightsResponse.data.data);
      } catch (err) {
        console.error('Fout bij ophalen data:', err);
        setError(err.response?.data?.message || 'Er is een fout opgetreden bij het ophalen van de data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset selected phase when changing tabs
    setSelectedPhase(null);
  };
  
  // Handle platform change
  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    // Reset selected phase when changing platform
    setSelectedPhase(null);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Haal inzichten op
        const insightsResponse = await projectsApi.getInsights(projectId);
        setInsights(insightsResponse.data.data);
      } catch (err) {
        console.error('Fout bij ophalen data:', err);
        setError(err.response?.data?.message || 'Er is een fout opgetreden bij het ophalen van de data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  };
  
  // Handle phase click
  const handlePhaseClick = (phase) => {
    setSelectedPhase(phase);
    // Optioneel: verander tab naar de specifieke fase
    const phaseTabMap = {
      awareness: 1,
      interest: 2,
      desire: 3,
      action: 4
    };
    
    if (phaseTabMap[phase.name]) {
      setActiveTab(phaseTabMap[phase.name]);
    }
  };
  
  // Render phase details
  const renderPhaseDetails = (phaseName) => {
    const data = insights || mockInsights;
    if (!data || !data.awareness || !data.awareness.details || !data.awareness.details[phaseName]) {
      return (
        <Alert severity="info">
          Geen gedetailleerde informatie beschikbaar voor deze fase.
        </Alert>
      );
    }
    
    const phaseDetails = data.awareness.details[phaseName];
    
    return (
      <Card>
        <CardHeader title={`${phaseName.charAt(0).toUpperCase() + phaseName.slice(1)} Details`} />
        <CardContent>
          <Typography variant="body2" paragraph>
            {phaseDetails.description}
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>
            Factoren
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {phaseDetails.factors.map((factor, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {factor.factor}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 1 }}>
                        {factor.score}%
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${factor.trend > 0 ? '+' : ''}${factor.trend}%`}
                        color={factor.trend > 0 ? 'success' : factor.trend < 0 ? 'error' : 'default'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Typography variant="subtitle2" gutterBottom>
            Aanbevelingen
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {phaseDetails.recommendations.map((recommendation, index) => (
              <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                {recommendation}
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(`/projects/${projectId}`)} 
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            Customer Journey Fasen
            {project && `: ${project.name}`}
          </Typography>
        </Box>
        <Box>
          <ButtonGroup variant="outlined" size="small">
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={handleRefresh}
              disabled={loading}
            >
              Vernieuwen
            </Button>
            <ExportButton 
              data={insights || mockInsights} 
              projectName={project?.name || 'Project'} 
              disabled={loading}
            />
          </ButtonGroup>
        </Box>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      
      {/* Platform selection */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {platforms.map((platform) => (
          <Chip
            key={platform.value}
            label={platform.label}
            onClick={() => handlePlatformChange(platform.value)}
            color={selectedPlatform === platform.value ? 'primary' : 'default'}
            variant={selectedPlatform === platform.value ? 'filled' : 'outlined'}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>
      
      {/* Content based on active tab */}
      <Box>
        {/* Overzicht tab */}
        {activeTab === 0 && (
          <AwarenessVisualization 
            data={insights || mockInsights} 
            platform={selectedPlatform} 
            height={500}
            onPhaseClick={handlePhaseClick}
          />
        )}
        
        {/* Bewustzijn tab */}
        {activeTab === 1 && renderPhaseDetails('awareness')}
        
        {/* Interesse tab */}
        {activeTab === 2 && renderPhaseDetails('interest')}
        
        {/* Verlangen tab */}
        {activeTab === 3 && renderPhaseDetails('desire')}
        
        {/* Actie tab */}
        {activeTab === 4 && renderPhaseDetails('action')}
      </Box>
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default AwarenessPhaseDashboard;
