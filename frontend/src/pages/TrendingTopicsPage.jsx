import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, Divider, 
  CircularProgress, Alert, Tabs, Tab, Button, useTheme
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';

// Import trending components
import TrendingTopicsTimeline from '../components/trending/TrendingTopicsTimeline';
import TopicTrendsDataProvider from '../components/trending/TopicTrendsDataProvider';
import TopicSelectionControls from '../components/trending/TopicSelectionControls';
import EventAnnotationDisplay from '../components/trending/EventAnnotationDisplay';
import TimeRangeSelector from '../components/trending/TimeRangeSelector';

// Import utility functions
import { fetchTopicData } from '../services/api';
import { exportToCsv, exportToImage } from '../utils/export';
import { prepareTopicTrendsData } from '../utils/trending/trendVisualization';

/**
 * Pagina voor het visualiseren en analyseren van trending topics
 */
const TrendingTopicsPage = () => {
  const theme = useTheme();
  
  // State voor data
  const [rawData, setRawData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State voor UI
  const [timeframe, setTimeframe] = useState('month');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [zoomRange, setZoomRange] = useState(null);
  
  // State voor data verwerking opties
  const [dataOptions, setDataOptions] = useState({
    normalize: true,
    smoothing: true,
    includeEvents: true,
    topN: 10
  });
  
  // Effect voor data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch topics data
        const data = await fetchTopicData(timeframe);
        setRawData(data.topics || []);
        setEventsData(data.events || []);
      } catch (err) {
        console.error('Error fetching trending topics data:', err);
        setError('Er is een fout opgetreden bij het ophalen van de trending topics data.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeframe]);
  
  // Bereid beschikbare topics voor
  const availableTopics = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];
    
    // Tel frequentie per topic
    const topicCounts = {};
    
    rawData.forEach(item => {
      const topic = item.topic || '';
      if (topic) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    });
    
    // Bereken trend (simpele implementatie)
    const topicTrends = {};
    
    // Sorteer data op timestamp
    const sortedData = [...rawData].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Verdeel in twee periodes voor trendberekening
    const midpoint = Math.floor(sortedData.length / 2);
    const firstHalf = sortedData.slice(0, midpoint);
    const secondHalf = sortedData.slice(midpoint);
    
    // Tel frequenties in beide periodes
    const firstHalfCounts = {};
    const secondHalfCounts = {};
    
    firstHalf.forEach(item => {
      const topic = item.topic || '';
      if (topic) {
        firstHalfCounts[topic] = (firstHalfCounts[topic] || 0) + 1;
      }
    });
    
    secondHalf.forEach(item => {
      const topic = item.topic || '';
      if (topic) {
        secondHalfCounts[topic] = (secondHalfCounts[topic] || 0) + 1;
      }
    });
    
    // Bereken trend als percentage verandering
    Object.keys(topicCounts).forEach(topic => {
      const firstCount = firstHalfCounts[topic] || 0;
      const secondCount = secondHalfCounts[topic] || 0;
      
      if (firstCount > 0) {
        topicTrends[topic] = ((secondCount - firstCount) / firstCount) * 100;
      } else {
        topicTrends[topic] = secondCount > 0 ? 100 : 0;
      }
    });
    
    // Maak array van topics met frequentie en trend
    return Object.keys(topicCounts).map(topic => ({
      topic,
      frequency: topicCounts[topic],
      trend: topicTrends[topic]
    }));
  }, [rawData]);
  
  // Handler voor timeframe wijziging
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };
  
  // Handler voor topic selectie
  const handleTopicSelectionChange = (topics) => {
    setSelectedTopics(topics);
    
    // Update data opties
    setDataOptions(prev => ({
      ...prev,
      selectedTopics: topics
    }));
  };
  
  // Handler voor event selectie
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
  };
  
  // Handler voor range wijziging
  const handleRangeChange = (range) => {
    setZoomRange(range);
  };
  
  // Handler voor data opties wijziging
  const handleDataOptionsChange = (options) => {
    setDataOptions(prev => ({
      ...prev,
      ...options
    }));
  };
  
  // Handler voor tab wijziging
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handler voor data export
  const handleExportData = (format) => {
    if (!rawData || rawData.length === 0) return;
    
    if (format === 'csv') {
      exportToCsv(rawData, 'trending-topics-data.csv');
    } else if (format === 'image') {
      // Gebruik DOM element ID voor de chart
      exportToImage('trending-topics-chart', 'trending-topics-chart.png');
    }
  };
  
  // Render loading state
  if (loading && !rawData.length) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Trending topics data laden...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Render error state
  if (error && !rawData.length) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
            <Typography variant="h5" component="h1">
              Trending Topics Analyse
            </Typography>
          </Box>
          
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />} 
              onClick={() => handleExportData('csv')}
              sx={{ mr: 1 }}
            >
              Export CSV
            </Button>
            
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />} 
              onClick={() => handleExportData('image')}
            >
              Export Afbeelding
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Analyseer en visualiseer trending topics over tijd, identificeer patronen en correleer met belangrijke events.
        </Typography>
      </Paper>
      
      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Tijdlijn Visualisatie" />
          <Tab label="Topic Vergelijking" />
          <Tab label="Event Analyse" />
        </Tabs>
      </Box>
      
      {/* Main content */}
      <Grid container spacing={3}>
        {/* Sidebar */}
        <Grid item xs={12} md={4} lg={3}>
          {/* Topic Selection */}
          <TopicSelectionControls
            availableTopics={availableTopics}
            selectedTopics={selectedTopics}
            onSelectionChange={handleTopicSelectionChange}
            onRefresh={() => setLoading(true)}
          />
          
          {/* Time Range Selection */}
          <TimeRangeSelector
            timePoints={rawData.map(item => new Date(item.timestamp).toLocaleDateString())}
            rawTimePoints={rawData.map(item => item.timestamp)}
            onRangeChange={handleRangeChange}
            onTimeframeChange={handleTimeframeChange}
          />
          
          {/* Data Options */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Visualisatie Opties
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Normaliseren</Typography>
                <Button
                  size="small"
                  variant={dataOptions.normalize ? "contained" : "outlined"}
                  onClick={() => handleDataOptionsChange({ normalize: !dataOptions.normalize })}
                >
                  {dataOptions.normalize ? "Aan" : "Uit"}
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Smoothing</Typography>
                <Button
                  size="small"
                  variant={dataOptions.smoothing ? "contained" : "outlined"}
                  onClick={() => handleDataOptionsChange({ smoothing: !dataOptions.smoothing })}
                >
                  {dataOptions.smoothing ? "Aan" : "Uit"}
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Toon Events</Typography>
                <Button
                  size="small"
                  variant={dataOptions.includeEvents ? "contained" : "outlined"}
                  onClick={() => handleDataOptionsChange({ includeEvents: !dataOptions.includeEvents })}
                >
                  {dataOptions.includeEvents ? "Aan" : "Uit"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Main content area */}
        <Grid item xs={12} md={8} lg={9}>
          {/* Timeline Visualization */}
          {activeTab === 0 && (
            <TopicTrendsDataProvider
              rawData={rawData}
              eventsData={eventsData}
              timeframe={timeframe}
              options={{
                ...dataOptions,
                selectedTopics
              }}
            >
              <div id="trending-topics-chart">
                <TrendingTopicsTimeline
                  timeframe={timeframe}
                  onTimeframeChange={handleTimeframeChange}
                  onTopicSelect={handleTopicSelectionChange}
                />
              </div>
            </TopicTrendsDataProvider>
          )}
          
          {/* Topic Comparison */}
          {activeTab === 1 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Topic Vergelijking
              </Typography>
              
              <Alert severity="info">
                Selecteer topics in het linkerpaneel om ze te vergelijken.
              </Alert>
              
              {selectedTopics.length > 0 && (
                <TopicTrendsDataProvider
                  rawData={rawData}
                  timeframe={timeframe}
                  options={{
                    ...dataOptions,
                    selectedTopics
                  }}
                >
                  <TrendingTopicsTimeline
                    timeframe={timeframe}
                    onTimeframeChange={handleTimeframeChange}
                    onTopicSelect={handleTopicSelectionChange}
                  />
                </TopicTrendsDataProvider>
              )}
            </Paper>
          )}
          
          {/* Event Analysis */}
          {activeTab === 2 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Event Analyse
              </Typography>
              
              {eventsData.length > 0 ? (
                <TopicTrendsDataProvider
                  rawData={rawData}
                  eventsData={eventsData}
                  timeframe={timeframe}
                  options={{
                    ...dataOptions,
                    includeEvents: true
                  }}
                >
                  <EventAnnotationDisplay
                    selectedEvent={selectedEvent}
                    onEventSelect={handleEventSelect}
                  />
                </TopicTrendsDataProvider>
              ) : (
                <Alert severity="info">
                  Geen events beschikbaar voor de geselecteerde periode.
                </Alert>
              )}
            </Paper>
          )}
          
          {/* Selected Event Details (shown on all tabs) */}
          {selectedEvent && (
            <Paper sx={{ p: 2, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.title}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {new Date(selectedEvent.date).toLocaleDateString()}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" paragraph>
                {selectedEvent.description}
              </Typography>
              
              {selectedEvent.source && (
                <Button 
                  variant="text" 
                  startIcon={<ShareIcon />}
                  href={selectedEvent.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Bron bekijken
                </Button>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default TrendingTopicsPage;
