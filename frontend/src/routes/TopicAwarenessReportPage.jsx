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
  Skeleton,
  Divider,
  useTheme
} from '@mui/material';
import { 
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';

// Componenten importeren
import TopicAwarenessReport from '../components/integrated/TopicAwarenessReport';
import DataSourceSelector from '../components/common/DataSourceSelector';
import DateRangePicker from '../components/common/DateRangePicker';
import IntegratedHelpSystem from '../components/help/IntegratedHelpSystem';

// API services importeren
import { 
  fetchTopicsByPhase, 
  fetchAwarenessDistribution,
  fetchContentRecommendations,
  fetchTrendingTopics
} from '../services/topicAwarenessService';

/**
 * TopicAwarenessReportPage
 * 
 * Route component voor de Topic Awareness Report pagina.
 * Integreert het TopicAwarenessReport component in de applicatie
 * met navigatie, filters en data-ophaling.
 * 
 * @component
 */
const TopicAwarenessReportPage = () => {
  const theme = useTheme();
  
  // State voor data
  const [topicsByPhase, setTopicsByPhase] = useState(null);
  const [awarenessDistribution, setAwarenessDistribution] = useState(null);
  const [contentRecommendations, setContentRecommendations] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState(null);
  
  // State voor UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectName, setProjectName] = useState('MarketPulse AI');
  
  // State voor help-functionaliteit
  const [userSettings, setUserSettings] = useState({
    userRole: localStorage.getItem('userRole') || 'marketeer',
    experienceLevel: localStorage.getItem('experienceLevel') || 'intermediate'
  });
  
  // State voor filters
  const [dataSource, setDataSource] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dagen geleden
    endDate: new Date()
  });
  
  /**
   * Laad alle benodigde data voor het rapport
   */
  const loadReportData = useCallback(async () => {
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
      console.error('Fout bij het ophalen van rapport data:', err);
      setError('Er is een fout opgetreden bij het ophalen van de data. Probeer het later opnieuw.');
    } finally {
      setIsLoading(false);
    }
  }, [dataSource, dateRange]);
  
  // Laad data bij initialisatie en wanneer filters veranderen
  useEffect(() => {
    loadReportData();
  }, [loadReportData]);
  
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
    loadReportData();
  };
  

  
  // Render loading skeleton
  const renderSkeleton = () => (
    <Box sx={{ mt: 4 }}>
      <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" width="100%" height={400} />
    </Box>
  );
  
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
          Topic Awareness Rapport
        </Typography>
      </Breadcrumbs>
      
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} aria-hidden="true" />
          Topic Awareness Rapport
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Genereer gedetailleerde rapporten over topic awareness analyse en exporteer ze in verschillende formaten.
          Deze rapporten helpen u inzicht te krijgen in de awareness fasen van uw doelgroep en bieden strategische aanbevelingen.
        </Typography>
      </Box>
      
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
      
      {/* Skeleton loader tijdens laden */}
      {isLoading && !topicsByPhase && renderSkeleton()}
      
      {/* TopicAwarenessReport component met geïntegreerde help-functionaliteit */}
      <IntegratedHelpSystem
        activeView="report"
        userRole={userSettings.userRole}
        experienceLevel={userSettings.experienceLevel}
      >
        <TopicAwarenessReport
          topicsByPhase={topicsByPhase}
          awarenessDistribution={awarenessDistribution}
          contentRecommendations={contentRecommendations}
          trendingTopics={trendingTopics}
          projectName={projectName}
          isLoading={isLoading}
          dataCollectionDate={dateRange.endDate}
        />
      </IntegratedHelpSystem>
      
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

export default TopicAwarenessReportPage;
