import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  useTheme
} from '@mui/material';
import { 
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

// Componenten importeren
import TopicAwarenessReport from '../components/integrated/TopicAwarenessReport';
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
 * TopicAwarenessReportExample Component
 * 
 * Dit voorbeeld toont hoe het TopicAwarenessReport component kan worden geïntegreerd
 * in een grotere applicatie met data-ophaling, filtering en configuratie-opties.
 * 
 * @component
 */
const TopicAwarenessReportExample = () => {
  const theme = useTheme();
  
  // State voor data
  const [topicsByPhase, setTopicsByPhase] = useState(null);
  const [awarenessDistribution, setAwarenessDistribution] = useState(null);
  const [contentRecommendations, setContentRecommendations] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState(null);
  
  // State voor UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [projectName, setProjectName] = useState('MarketPulse AI');
  
  // State voor filters
  const [dataSource, setDataSource] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dagen geleden
    endDate: new Date()
  });
  
  /**
   * Laad alle benodigde data voor het rapport
   */
  const loadReportData = async () => {
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
  };
  
  // Laad data bij initialisatie en wanneer filters veranderen
  useEffect(() => {
    loadReportData();
  }, [dataSource, dateRange]);
  
  // Handler voor tab verandering
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
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
  
  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} aria-hidden="true" />
          Topic Awareness Analyse
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Genereer gedetailleerde rapporten over topic awareness analyse en exporteer ze in verschillende formaten.
        </Typography>
      </Box>
      
      {/* Tabs voor navigatie */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Topic awareness analyse tabs"
          variant="fullWidth"
        >
          <Tab label="Rapport" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="Data Bronnen" id="tab-1" aria-controls="tabpanel-1" />
          <Tab label="Instellingen" id="tab-2" aria-controls="tabpanel-2" />
        </Tabs>
      </Paper>
      
      {/* Tab content */}
      <div
        role="tabpanel"
        hidden={activeTab !== 0}
        id="tabpanel-0"
        aria-labelledby="tab-0"
      >
        {activeTab === 0 && (
          <Box>
            {/* Filters en acties */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
                  <DataSourceSelector 
                    value={dataSource} 
                    onChange={handleDataSourceChange}
                    aria-label="Selecteer databron"
                  />
                  <DateRangePicker 
                    value={dateRange} 
                    onChange={handleDateRangeChange}
                    aria-label="Selecteer datumbereik"
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
            
            {/* TopicAwarenessReport component */}
            <TopicAwarenessReport
              topicsByPhase={topicsByPhase}
              awarenessDistribution={awarenessDistribution}
              contentRecommendations={contentRecommendations}
              trendingTopics={trendingTopics}
              projectName={projectName}
              isLoading={isLoading}
              dataCollectionDate={dateRange.endDate}
            />
          </Box>
        )}
      </div>
      
      <div
        role="tabpanel"
        hidden={activeTab !== 1}
        id="tabpanel-1"
        aria-labelledby="tab-1"
      >
        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Data Bronnen Configuratie
            </Typography>
            <Typography variant="body2" paragraph>
              Configureer de databronnen die worden gebruikt voor de topic awareness analyse.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1">
              Deze functionaliteit is momenteel in ontwikkeling.
            </Typography>
          </Paper>
        )}
      </div>
      
      <div
        role="tabpanel"
        hidden={activeTab !== 2}
        id="tabpanel-2"
        aria-labelledby="tab-2"
      >
        {activeTab === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} aria-hidden="true" />
              Instellingen
            </Typography>
            <Typography variant="body2" paragraph>
              Configureer de instellingen voor de topic awareness analyse en rapportage.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1">
              Deze functionaliteit is momenteel in ontwikkeling.
            </Typography>
          </Paper>
        )}
      </div>
    </Container>
  );
};

export default TopicAwarenessReportExample;
