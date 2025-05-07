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
import PainPointsChart from '../components/charts/PainPointsChart';
import DesiresChart from '../components/charts/DesiresChart';
import TerminologyCloud from '../components/charts/TerminologyCloud';
import ExportButton from '../components/export/ExportButton';
import DetailPanel from '../components/insights/DetailPanel';

// Utilities
import { transformToTreemapData as transformPainPointsToTreemap, transformToBarChartData as transformPainPointsToBarChart, getPainPointDetails } from '../utils/insights/painPointsUtils';
import { transformToTreemapData as transformDesiresToTreemap, transformToChartData as transformDesiresToChart, getDesireDetails } from '../utils/insights/desiresUtils';
import { transformToTagCloudData, filterBySearchTerm, getTermDetails } from '../utils/insights/languageUtils';

// API
import { projectsApi } from '../api/apiClient';

/**
 * Doelgroep Inzichten Dashboard
 * 
 * Dit dashboard toont inzichten over de doelgroep op basis van de verzamelde data,
 * inclusief pijnpunten, verlangens en taalgebruik.
 */
const AudienceInsightsDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [project, setProject] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailType, setDetailType] = useState(null);
  
  // Tabs
  const tabs = [
    { label: 'Overzicht', value: 0 },
    { label: 'Pijnpunten', value: 1 },
    { label: 'Verlangens', value: 2 },
    { label: 'Taalgebruik', value: 3 }
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
    painPoints: [
      { id: 1, category: 'Product', issue: 'Moeilijk te gebruiken', frequency: 45, sentiment: -0.8 },
      { id: 2, category: 'Service', issue: 'Lange wachttijden', frequency: 38, sentiment: -0.7 },
      { id: 3, category: 'Prijs', issue: 'Te duur', frequency: 32, sentiment: -0.6 },
      { id: 4, category: 'Kwaliteit', issue: 'Gaat snel kapot', frequency: 28, sentiment: -0.9 },
      { id: 5, category: 'Product', issue: 'Mist essentiële functies', frequency: 25, sentiment: -0.5 }
    ],
    desires: [
      { id: 1, category: 'Product', desire: 'Betere batterijduur', frequency: 42, sentiment: 0.7 },
      { id: 2, category: 'Service', desire: 'Snellere levering', frequency: 36, sentiment: 0.8 },
      { id: 3, category: 'Prijs', desire: 'Meer betaalbare opties', frequency: 30, sentiment: 0.6 },
      { id: 4, category: 'Kwaliteit', desire: 'Duurzamere materialen', frequency: 27, sentiment: 0.9 },
      { id: 5, category: 'Product', desire: 'Meer kleuropties', frequency: 22, sentiment: 0.5 }
    ],
    terminology: [
      { term: 'gebruiksvriendelijk', frequency: 48, sentiment: 0.6, contexts: ['Ik zoek iets dat gebruiksvriendelijk is'] },
      { term: 'duurzaam', frequency: 42, sentiment: 0.8, contexts: ['Het moet wel duurzaam zijn'] },
      { term: 'betrouwbaar', frequency: 39, sentiment: 0.7, contexts: ['Een betrouwbaar product is belangrijk'] },
      { term: 'innovatief', frequency: 35, sentiment: 0.9, contexts: ['Ik wil iets innovatiefs'] },
      { term: 'premium', frequency: 32, sentiment: 0.5, contexts: ['Ik zoek een premium ervaring'] }
    ]
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
    // Reset selected item when changing tabs
    setSelectedItem(null);
    setDetailType(null);
  };
  
  // Handle platform change
  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    // Reset selected item when changing platform
    setSelectedItem(null);
    setDetailType(null);
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
  
  // Handle item click
  const handleItemClick = (item, type) => {
    let detailedItem = null;
    
    // Get detailed information based on type
    switch (type) {
      case 'painPoint':
        detailedItem = getPainPointDetails(item, insights || mockInsights);
        break;
      case 'desire':
        detailedItem = getDesireDetails(item, insights || mockInsights);
        break;
      case 'term':
        detailedItem = getTermDetails(item, insights || mockInsights);
        break;
      default:
        detailedItem = item;
    }
    
    setSelectedItem(detailedItem);
    setDetailType(type);
  };
  
  // Handle close detail panel
  const handleCloseDetail = () => {
    setSelectedItem(null);
    setDetailType(null);
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
            Doelgroep Inzichten
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
      <Grid container spacing={3}>
        {/* Main content */}
        <Grid item xs={12} md={selectedItem ? 8 : 12}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Pijnpunten overview */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Pijnpunten" />
                  <CardContent>
                    <PainPointsChart 
                      platform={selectedPlatform} 
                      data={insights || mockInsights} 
                      height={300} 
                      chartType="bar"
                      onItemClick={(item) => handleItemClick(item, 'painPoint')}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Verlangens overview */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Verlangens" />
                  <CardContent>
                    <DesiresChart 
                      platform={selectedPlatform} 
                      data={insights || mockInsights} 
                      height={300} 
                      chartType="bar"
                      onItemClick={(item) => handleItemClick(item, 'desire')}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Terminologie overview */}
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Taalgebruik" />
                  <CardContent>
                    <TerminologyCloud 
                      platform={selectedPlatform} 
                      data={insights || mockInsights} 
                      height={300} 
                      onItemClick={(item) => handleItemClick(item, 'term')}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Content for other tabs */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>Pijnpunten Analyse</Typography>
              <Typography variant="body2" paragraph>
                Deze visualisatie toont de belangrijkste pijnpunten van je doelgroep, gecategoriseerd in verschillende typen. De grootte en kleur zijn gebaseerd op frequentie en intensiteit.
              </Typography>
              <PainPointsChart 
                platform={selectedPlatform} 
                data={insights || mockInsights} 
                height={500} 
                onItemClick={(item) => handleItemClick(item, 'painPoint')}
              />
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>Verlangens Analyse</Typography>
              <Typography variant="body2" paragraph>
                Deze visualisatie toont de belangrijkste verlangens van je doelgroep, gecategoriseerd in verschillende typen zoals gewenste uitkomsten, aspiraties, directe behoeften en langetermijndoelen.
              </Typography>
              <DesiresChart 
                platform={selectedPlatform} 
                data={insights || mockInsights} 
                height={500} 
                onItemClick={(item) => handleItemClick(item, 'desire')}
              />
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>Taalgebruik Analyse</Typography>
              <Typography variant="body2" paragraph>
                Deze visualisatie toont de authentieke termen gebruikt door je doelgroep, inclusief phrasen en zinsconstructies die relevant zijn voor marketing.
              </Typography>
              <TerminologyCloud 
                platform={selectedPlatform} 
                data={insights || mockInsights} 
                height={500} 
                onItemClick={(item) => handleItemClick(item, 'term')}
              />
            </Box>
          )}
        </Grid>
        
        {/* Detail panel */}
        {selectedItem && (
          <Grid item xs={12} md={4}>
            <DetailPanel 
              item={selectedItem} 
              type={detailType} 
              onClose={handleCloseDetail} 
            />
          </Grid>
        )}
      </Grid>
      
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

export default AudienceInsightsDashboard;
