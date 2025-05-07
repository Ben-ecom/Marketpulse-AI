import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Breadcrumbs,
  Link,
  Alert,
  Divider,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

// Componenten importeren
import TopicAwarenessDashboard from '../components/dashboards/TopicAwarenessDashboard';
import DataSourceSelector from '../components/common/DataSourceSelector';
import DateRangePicker from '../components/common/DateRangePicker';

// API services importeren
import { 
  fetchTopicsByPhase, 
  fetchAwarenessDistribution,
  fetchContentRecommendations,
  fetchTrendingTopics
} from '../services/topicAwarenessService';

/**
 * TopicAwarenessDashboardPage
 * 
 * Route component voor de Topic Awareness Dashboard pagina.
 * Integreert het TopicAwarenessDashboard component in de applicatie
 * met navigatie, filters en data-ophaling.
 * 
 * @component
 */
const TopicAwarenessDashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  // State voor data
  const [topicsByPhase, setTopicsByPhase] = useState(null);
  const [awarenessDistribution, setAwarenessDistribution] = useState(null);
  const [contentRecommendations, setContentRecommendations] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState(null);
  
  // State voor UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectName, setProjectName] = useState('MarketPulse AI');
  
  // State voor filters
  const [dataSource, setDataSource] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dagen geleden
    endDate: new Date()
  });
  
  /**
   * Laad alle benodigde data voor het dashboard
   */
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Parallel data ophalen voor betere performance
      const [
        topicsData,
        awarenessData,
        recommendationsData,
        trendingData
      ] = await Promise.all([
        fetchTopicsByPhase(dataSource, dateRange),
        fetchAwarenessDistribution(dataSource, dateRange),
        fetchContentRecommendations(dataSource, dateRange),
        fetchTrendingTopics(dataSource, dateRange)
      ]);
      
      // State updaten met opgehaalde data
      setTopicsByPhase(topicsData);
      setAwarenessDistribution(awarenessData);
      setContentRecommendations(recommendationsData);
      setTrendingTopics(trendingData);
    } catch (err) {
      console.error('Fout bij het ophalen van dashboard data:', err);
      setError('Er is een fout opgetreden bij het ophalen van de data. Probeer het later opnieuw.');
    } finally {
      setIsLoading(false);
    }
  }, [dataSource, dateRange]);
  
  // Laad data bij initialisatie en wanneer filters veranderen
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  
  // Handler voor data source verandering
  const handleDataSourceChange = (newSource) => {
    setDataSource(newSource);
  };
  
  // Handler voor date range verandering
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };
  
  // Handler voor data refresh
  const handleRefresh = () => {
    loadDashboardData();
  };
  
  // Handler voor navigatie naar rapport pagina
  const handleNavigateToReport = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/topic-awareness-report`);
    } else {
      navigate('/analytics/topic-awareness');
    }
  };
  
  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs navigatie */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mt: 2, mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="/dashboard" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Link 
          color="inherit" 
          href="/analytics" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <AnalyticsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Analytics
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <BarChartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Topic Awareness Dashboard
        </Typography>
      </Breadcrumbs>
      
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} aria-hidden="true" />
          Topic Awareness Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Visualisatie van topic awareness data, trending topics en content aanbevelingen.
          Gebruik de filters om specifieke databronnen en periodes te selecteren.
        </Typography>
      </Box>
      
      {/* Actiekaarten */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6">Analyse & Visualisatie</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Het dashboard toont visuele representaties van topic awareness data,
                waarmee je snel inzicht krijgt in de awareness fasen van je doelgroep.
                Gebruik de filters hieronder om de data aan te passen.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DescriptionIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                <Typography variant="h6">Gedetailleerd Rapport</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Naast dit dashboard kun je ook een gedetailleerd rapport genereren
                met uitgebreide analyses en aanbevelingen. Het rapport kan worden
                geëxporteerd in verschillende formaten.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={handleNavigateToReport}
                startIcon={<DescriptionIcon />}
              >
                Naar Rapport Generator
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters en acties */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
            <DataSourceSelector 
              value={dataSource} 
              onChange={handleDataSourceChange}
              aria-label="Selecteer databron"
              disabled={isLoading}
            />
            <DateRangePicker 
              value={dateRange} 
              onChange={handleDateRangeChange}
              aria-label="Selecteer datumbereik"
              disabled={isLoading}
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Data verversen"
          >
            Verversen
          </Button>
        </Box>
      </Paper>
      
      {/* Error weergave */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} role="alert">
          {error}
        </Alert>
      )}
      
      {/* TopicAwarenessDashboard component */}
      <TopicAwarenessDashboard
        topicsByPhase={topicsByPhase}
        awarenessDistribution={awarenessDistribution}
        contentRecommendations={contentRecommendations}
        trendingTopics={trendingTopics}
        isLoading={isLoading}
      />
      
      {/* Footer met informatie */}
      <Box mt={6} mb={4}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          MarketPulse AI Platform | Topic Awareness Module | Laatste update: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Container>
  );
};

export default TopicAwarenessDashboardPage;
