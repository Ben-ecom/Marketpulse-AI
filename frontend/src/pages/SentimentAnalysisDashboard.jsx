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
  ButtonGroup,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Help as HelpIcon
} from '@mui/icons-material';

// Componenten
import SentimentTrendVisualization from '../components/charts/SentimentTrendVisualization';
import ExportButton from '../components/export/ExportButton';
import IntegratedHelpSystem from '../components/help/IntegratedHelpSystem';
import ContextualTooltip from '../components/help/ContextualTooltip';

// Utilities
import { 
  categorizeSentiment, 
  transformForPieChart, 
  groupByPlatform, 
  transformForTrendChart, 
  filterByKeyword, 
  calculateSentimentStats 
} from '../utils/insights/sentimentUtils';

// API
import { projectsApi } from '../api/apiClient';

/**
 * Sentiment Analyse Dashboard
 * 
 * Dit dashboard toont inzichten over het sentiment van de doelgroep:
 * - Sentiment trends over tijd
 * - Vergelijking tussen platforms
 * - Verdeling van sentiment (positief/negatief/neutraal)
 * - Sentiment per categorie
 */
const SentimentAnalysisDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [project, setProject] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  
  // Tabs
  const tabs = [
    { label: 'Overzicht', value: 0 },
    { label: 'Trends', value: 1 },
    { label: 'Platform Vergelijking', value: 2 },
    { label: 'Categorieën', value: 3 }
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
    sentiment: {
      overall: {
        positive: 55,
        neutral: 25,
        negative: 20,
        score: 0.35
      },
      trends: {
        daily: [
          { date: '01-05', positive: 52, neutral: 28, negative: 20, score: 0.32 },
          { date: '02-05', positive: 54, neutral: 26, negative: 20, score: 0.34 },
          { date: '03-05', positive: 55, neutral: 25, negative: 20, score: 0.35 },
          { date: '04-05', positive: 58, neutral: 22, negative: 20, score: 0.38 }
        ],
        weekly: [
          { date: 'Week 1 Mei', positive: 50, neutral: 30, negative: 20, score: 0.30 },
          { date: 'Week 2 Mei', positive: 52, neutral: 28, negative: 20, score: 0.32 },
          { date: 'Week 3 Mei', positive: 55, neutral: 25, negative: 20, score: 0.35 },
          { date: 'Week 4 Mei', positive: 58, neutral: 22, negative: 20, score: 0.38 }
        ],
        monthly: [
          { date: 'Jan', positive: 45, neutral: 30, negative: 25, score: 0.20 },
          { date: 'Feb', positive: 48, neutral: 29, negative: 23, score: 0.25 },
          { date: 'Mar', positive: 50, neutral: 28, negative: 22, score: 0.28 },
          { date: 'Apr', positive: 52, neutral: 27, negative: 21, score: 0.31 },
          { date: 'Mei', positive: 55, neutral: 25, negative: 20, score: 0.35 }
        ]
      },
      platforms: {
        reddit: {
          positive: 50,
          neutral: 25,
          negative: 25,
          score: 0.25
        },
        amazon: {
          positive: 60,
          neutral: 25,
          negative: 15,
          score: 0.45
        },
        instagram: {
          positive: 70,
          neutral: 20,
          negative: 10,
          score: 0.60
        },
        tiktok: {
          positive: 65,
          neutral: 25,
          negative: 10,
          score: 0.55
        }
      },
      categories: {
        product: {
          positive: 60,
          neutral: 25,
          negative: 15,
          score: 0.45,
          keywords: ['kwaliteit', 'duurzaam', 'design', 'functionaliteit']
        },
        service: {
          positive: 65,
          neutral: 20,
          negative: 15,
          score: 0.50,
          keywords: ['klantenservice', 'levering', 'garantie', 'retourneren']
        },
        price: {
          positive: 40,
          neutral: 30,
          negative: 30,
          score: 0.10,
          keywords: ['duur', 'betaalbaar', 'waarde', 'aanbieding']
        },
        quality: {
          positive: 70,
          neutral: 20,
          negative: 10,
          score: 0.60,
          keywords: ['degelijk', 'betrouwbaar', 'materiaal', 'afwerking']
        }
      },
      examples: {
        positive: [
          "Ik ben erg tevreden met dit product, de kwaliteit is uitstekend!",
          "De klantenservice reageerde snel en heeft mijn probleem direct opgelost.",
          "Beste aankoop die ik dit jaar heb gedaan, absoluut de prijs waard."
        ],
        neutral: [
          "Het product werkt zoals verwacht, niets bijzonders.",
          "Levering duurde gemiddeld lang, niet snel maar ook niet traag.",
          "De prijs is redelijk voor wat je krijgt."
        ],
        negative: [
          "Teleurstellende kwaliteit, na een week gebruik was het al kapot.",
          "Verschrikkelijke klantenservice, niemand reageert op mijn vragen.",
          "Veel te duur voor wat je krijgt, ik voel me opgelicht."
        ]
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
    // Reset selected data point when changing tabs
    setSelectedDataPoint(null);
  };
  
  // Handle platform change
  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    // Reset selected data point when changing platform
    setSelectedDataPoint(null);
  };
  
  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
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
  
  // Handle data point click
  const handleDataPointClick = (dataPoint) => {
    setSelectedDataPoint(dataPoint);
  };
  
  // Render sentiment examples
  const renderSentimentExamples = () => {
    const data = insights || mockInsights;
    if (!data || !data.sentiment || !data.sentiment.examples) {
      return (
        <Alert severity="info">
          Geen voorbeelden beschikbaar.
        </Alert>
      );
    }
    
    const examples = data.sentiment.examples;
    
    return (
      <Card>
        <CardHeader 
          title="Sentiment Voorbeelden" 
          subheader="Representatieve voorbeelden van feedback"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Zoeken..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 1 }}
              />
              <Tooltip title="Deze voorbeelden tonen representatieve feedback van klanten.">
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'success.main', fontWeight: 'medium' }}>
                Positief
              </Typography>
              {examples.positive
                .filter(example => searchTerm === '' || example.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((example, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 1, bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <CardContent>
                      <Typography variant="body2">"{example}"</Typography>
                    </CardContent>
                  </Card>
                ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                Neutraal
              </Typography>
              {examples.neutral
                .filter(example => searchTerm === '' || example.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((example, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 1, bgcolor: 'grey.100' }}>
                    <CardContent>
                      <Typography variant="body2">"{example}"</Typography>
                    </CardContent>
                  </Card>
                ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'error.main', fontWeight: 'medium' }}>
                Negatief
              </Typography>
              {examples.negative
                .filter(example => searchTerm === '' || example.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((example, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 1, bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <CardContent>
                      <Typography variant="body2">"{example}"</Typography>
                    </CardContent>
                  </Card>
                ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  // Render sentiment statistics
  const renderSentimentStats = () => {
    const data = insights || mockInsights;
    if (!data || !data.sentiment || !data.sentiment.overall) {
      return null;
    }
    
    const stats = data.sentiment.overall;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Sentiment Score
              </Typography>
              <Typography variant="h3" color={stats.score > 0 ? 'success.main' : 'error.main'}>
                {stats.score.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Schaal van -1 (negatief) tot 1 (positief)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="success.main">
                Positief
              </Typography>
              <Typography variant="h3">
                {stats.positive}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                van alle feedback
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="text.secondary">
                Neutraal
              </Typography>
              <Typography variant="h3">
                {stats.neutral}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                van alle feedback
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom color="error.main">
                Negatief
              </Typography>
              <Typography variant="h3">
                {stats.negative}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                van alle feedback
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  // Render selected data point details
  const renderSelectedDataPoint = () => {
    if (!selectedDataPoint) return null;
    
    return (
      <Card sx={{ mt: 3 }}>
        <CardHeader 
          title="Geselecteerde Data" 
          subheader={selectedDataPoint.date || selectedDataPoint.platform || selectedDataPoint.name || 'Details'}
          action={
            <IconButton onClick={() => setSelectedDataPoint(null)}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            {selectedDataPoint.positive !== undefined && (
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="success.main">
                  Positief: {selectedDataPoint.positive}%
                </Typography>
              </Grid>
            )}
            {selectedDataPoint.neutral !== undefined && (
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Neutraal: {selectedDataPoint.neutral}%
                </Typography>
              </Grid>
            )}
            {selectedDataPoint.negative !== undefined && (
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="error.main">
                  Negatief: {selectedDataPoint.negative}%
                </Typography>
              </Grid>
            )}
            {selectedDataPoint.score !== undefined && (
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Sentiment Score: 
                  <Chip 
                    label={selectedDataPoint.score.toFixed(2)}
                    color={selectedDataPoint.score > 0 ? 'success' : 'error'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
            )}
            {selectedDataPoint.keywords && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Gerelateerde keywords:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedDataPoint.keywords.map((keyword, index) => (
                    <Chip key={index} label={keyword} size="small" />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <IntegratedHelpSystem activeView="sentiment">
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
          <ContextualTooltip
            title="Sentiment Analyse"
            content="Dit dashboard toont inzichten over het sentiment van uw doelgroep, inclusief trends over tijd, vergelijking tussen platforms en verdeling van positief/negatief sentiment."
            videoUrl="https://example.com/videos/sentiment-analysis.mp4"
            learnMoreUrl="https://docs.example.com/sentiment-analysis"
          >
            <Typography variant="h5">
              Sentiment Analyse
              {project && `: ${project.name}`}
            </Typography>
          </ContextualTooltip>
        </Box>
        <Box>
          <ButtonGroup variant="outlined" size="small">
            <ContextualTooltip
              title="Data Vernieuwen"
              content="Klik hier om de meest recente sentiment data op te halen en de visualisaties bij te werken."
              placement="bottom"
            >
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={handleRefresh}
                disabled={loading}
              >
                Vernieuwen
              </Button>
            </ContextualTooltip>
            <ContextualTooltip
              title="Exporteer Sentiment Data"
              content="Exporteer de sentiment analyse resultaten naar verschillende formaten zoals PDF, Excel of CSV voor verder gebruik in presentaties of rapporten."
              videoUrl="https://example.com/videos/sentiment-export.mp4"
              learnMoreUrl="https://docs.example.com/sentiment-analysis/export"
              placement="bottom"
            >
              <ExportButton 
                data={insights || mockInsights} 
                projectName={project?.name || 'Project'} 
                disabled={loading}
              />
            </ContextualTooltip>
          </ButtonGroup>
        </Box>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <ContextualTooltip
          title="Analyse Weergaven"
          content="Gebruik deze tabs om tussen verschillende weergaven van de sentiment analyse te schakelen. Elke weergave biedt verschillende inzichten in het sentiment van uw doelgroep."
          videoUrl="https://example.com/videos/sentiment-tabs.mp4"
          learnMoreUrl="https://docs.example.com/sentiment-analysis/views"
          placement="bottom"
        >
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
        </ContextualTooltip>
      </Box>
      
      {/* Platform selection */}
      <ContextualTooltip
        title="Platform Filter"
        content="Filter de sentiment analyse resultaten per platform om te zien hoe het sentiment verschilt tussen verschillende platforms zoals Reddit, Amazon, Instagram en TikTok."
        videoUrl="https://example.com/videos/sentiment-platforms.mp4"
        learnMoreUrl="https://docs.example.com/sentiment-analysis/platforms"
        placement="bottom"
      >
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
      </ContextualTooltip>
      
      {/* Content based on active tab */}
      <Box>
        {/* Overzicht tab */}
        {activeTab === 0 && (
          <>
            {renderSentimentStats()}
            
            <Box sx={{ mt: 3 }}>
              <SentimentTrendVisualization 
                data={insights?.sentiment || mockInsights.sentiment} 
                platform={selectedPlatform} 
                height={400}
                onDataPointClick={handleDataPointClick}
              />
            </Box>
            
            <Box sx={{ mt: 3 }}>
              {renderSentimentExamples()}
            </Box>
            
            {selectedDataPoint && renderSelectedDataPoint()}
          </>
        )}
        
        {/* Andere tabs */}
        {activeTab > 0 && (
          <SentimentTrendVisualization 
            data={insights?.sentiment || mockInsights.sentiment} 
            platform={selectedPlatform} 
            height={600}
            onDataPointClick={handleDataPointClick}
          />
        )}
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
    </IntegratedHelpSystem>
  );
};

export default SentimentAnalysisDashboard;
