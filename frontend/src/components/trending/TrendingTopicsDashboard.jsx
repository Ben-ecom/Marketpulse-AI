import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Tabs,
  Tab,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Compare as CompareIcon,
  Language as LanguageIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Psychology as AwarenessIcon
} from '@mui/icons-material';
import TrendingTopicsWordCloud from './TrendingTopicsWordCloud';
import TrendingTopicsBarChart from './TrendingTopicsBarChart';
import TrendingTopicsTimeline from './TrendingTopicsTimeline';
import TrendingTopicsComparison from './TrendingTopicsComparison';
import TopicAwarenessAnalyzer from '../integrated/TopicAwarenessAnalyzer';
import ExportButton from '../export/ExportButton';
import { 
  calculateTrendingTopics, 
  groupTrendingTopicsByPlatform,
  calculateTopicCorrelations,
  findRelatedTopics,
  generateTopicTimeSeries
} from '../../utils/insights/trendingTopicsUtils';

/**
 * Dashboard component voor trending topics analyse
 */
const TrendingTopicsDashboard = ({ 
  data = [], 
  previousData = [],
  projectName = '',
  isLoading = false,
  error = null,
  onRefresh = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State voor tabs
  const [activeTab, setActiveTab] = useState(0);
  
  // State voor filters
  const [filters, setFilters] = useState({
    platform: 'all',
    dateRange: 'all',
    keyword: '',
    minFrequency: 2
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // State voor geselecteerd topic
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [relatedTopics, setRelatedTopics] = useState([]);
  
  // Bereid gefilterde data voor
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    
    let result = [...data];
    
    // Filter op platform
    if (filters.platform !== 'all') {
      result = result.filter(item => item.platform === filters.platform);
    }
    
    // Filter op keyword
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(item => 
        (item.text && item.text.toLowerCase().includes(keyword)) || 
        (item.title && item.title.toLowerCase().includes(keyword))
      );
    }
    
    // Filter op datum (placeholder - implementeer op basis van je data structuur)
    if (filters.dateRange !== 'all') {
      // Implementeer datum filtering op basis van je data structuur
    }
    
    return result;
  }, [data, filters]);
  
  // Bereid gefilterde vorige data voor
  const filteredPreviousData = useMemo(() => {
    if (!previousData || previousData.length === 0) {
      return [];
    }
    
    let result = [...previousData];
    
    // Filter op platform
    if (filters.platform !== 'all') {
      result = result.filter(item => item.platform === filters.platform);
    }
    
    return result;
  }, [previousData, filters]);
  
  // Bereken trending topics
  const trendingTopics = useMemo(() => {
    return calculateTrendingTopics(
      filteredData, 
      filteredPreviousData, 
      'text', 
      {
        minFrequency: filters.minFrequency,
        maxTopics: 100,
        includeNgrams: true,
        ngramSize: 2
      }
    );
  }, [filteredData, filteredPreviousData, filters.minFrequency]);
  
  // Groepeer trending topics per platform
  const platformTopics = useMemo(() => {
    return groupTrendingTopicsByPlatform(
      filteredData, 
      trendingTopics, 
      'text', 
      'platform'
    );
  }, [filteredData, trendingTopics]);
  
  // Bereken correlaties tussen topics
  const topicCorrelations = useMemo(() => {
    return calculateTopicCorrelations(
      filteredData, 
      trendingTopics.slice(0, 20), 
      'text'
    );
  }, [filteredData, trendingTopics]);
  
  // Genereer tijdreeksen voor top topics
  const topicTimeSeries = useMemo(() => {
    const topTopics = trendingTopics.slice(0, 10).map(topic => topic.topic);
    
    return generateTopicTimeSeries(
      filteredData, 
      topTopics, 
      'text', 
      'date', 
      'day'
    );
  }, [filteredData, trendingTopics]);
  
  // Bereid data voor voor timeline component
  const timelineData = useMemo(() => {
    if (!topicTimeSeries || Object.keys(topicTimeSeries).length === 0) {
      return { timePoints: [], series: {} };
    }
    
    // Verzamel alle tijdpunten
    const allTimePoints = new Set();
    Object.values(topicTimeSeries).forEach(series => {
      series.forEach(point => {
        allTimePoints.add(point.period);
      });
    });
    
    // Sorteer tijdpunten
    const timePoints = [...allTimePoints].sort();
    
    // Maak series voor elk topic
    const series = {};
    
    Object.entries(topicTimeSeries).forEach(([topic, points]) => {
      series[topic] = Array(timePoints.length).fill(0);
      
      points.forEach(point => {
        const index = timePoints.indexOf(point.period);
        if (index !== -1) {
          series[topic][index] = point.count;
        }
      });
    });
    
    return { timePoints, series };
  }, [topicTimeSeries]);
  
  // Effect voor het laden van gerelateerde topics
  useEffect(() => {
    if (selectedTopic && filteredData.length > 0) {
      const related = findRelatedTopics(filteredData, selectedTopic, 'text', {
        maxTopics: 10,
        minCoOccurrence: 2
      });
      
      setRelatedTopics(related);
    } else {
      setRelatedTopics([]);
    }
  }, [selectedTopic, filteredData]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle topic select
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };
  
  // Bereid platforms voor voor filter
  const platforms = useMemo(() => {
    if (!data || data.length === 0) {
      return ['all'];
    }
    
    const uniquePlatforms = [...new Set(data.map(item => item.platform))];
    return ['all', ...uniquePlatforms];
  }, [data]);
  
  // Bereid export data voor
  const exportData = trendingTopics.map(topic => ({
    Topic: topic.topic,
    Frequentie: topic.frequency,
    Groei: `${topic.growth}%`,
    'Trending Score': topic.trendingScore,
    Nieuw: topic.isNew ? 'Ja' : 'Nee'
  }));
  
  // Bereid export secties voor
  const exportSections = [
    {
      id: 'overview',
      title: 'Trending Topics Overzicht',
      type: 'text',
      content: `Dit rapport toont trending topics voor ${projectName}.
      
Totaal aantal geanalyseerde items: ${filteredData.length}
Aantal trending topics: ${trendingTopics.length}
Platform: ${filters.platform === 'all' ? 'Alle platforms' : filters.platform}
      
Top 5 trending topics:
${trendingTopics.slice(0, 5).map((topic, index) => 
  `${index + 1}. ${topic.topic} (score: ${topic.trendingScore}, groei: ${topic.growth}%${topic.isNew ? ', NIEUW' : ''})`
).join('\n')}
      `
    },
    {
      id: 'trending_topics',
      title: 'Trending Topics',
      type: 'table',
      headers: ['Topic', 'Frequentie', 'Groei', 'Trending Score', 'Nieuw'],
      data: exportData
    },
    {
      id: 'platform_comparison',
      title: 'Platform Vergelijking',
      type: 'text',
      content: `Vergelijking van trending topics tussen platforms:
      
${Object.entries(platformTopics).map(([platform, topics]) => 
  `${platform}: ${topics.length} trending topics
  Top 3: ${topics.slice(0, 3).map(t => t.topic).join(', ')}
  `
).join('\n')}
      `
    }
  ];
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Trending Topics Dashboard
        </Typography>
        
        <Box>
          <Tooltip title="Toon filters">
            <IconButton 
              onClick={() => setShowFilters(!showFilters)} 
              color={showFilters ? "primary" : "default"}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Ververs data">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <ExportButton
            data={exportData}
            projectName={projectName}
            contentType="trending_topics"
            title="Exporteer"
            pdfTitle="Trending Topics Analyse"
            customSections={exportSections}
          />
        </Box>
      </Box>
      
      {/* Filters */}
      {showFilters && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filters
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="platform-select-label">Platform</InputLabel>
                <Select
                  labelId="platform-select-label"
                  id="platform-select"
                  value={filters.platform}
                  label="Platform"
                  onChange={(e) => handleFilterChange('platform', e.target.value)}
                >
                  {platforms.map(platform => (
                    <MenuItem key={platform} value={platform}>
                      {platform === 'all' ? 'Alle platforms' : platform}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="date-range-select-label">Periode</InputLabel>
                <Select
                  labelId="date-range-select-label"
                  id="date-range-select"
                  value={filters.dateRange}
                  label="Periode"
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <MenuItem value="all">Alle tijd</MenuItem>
                  <MenuItem value="today">Vandaag</MenuItem>
                  <MenuItem value="week">Deze week</MenuItem>
                  <MenuItem value="month">Deze maand</MenuItem>
                  <MenuItem value="year">Dit jaar</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="min-frequency-select-label">Min. Frequentie</InputLabel>
                <Select
                  labelId="min-frequency-select-label"
                  id="min-frequency-select"
                  value={filters.minFrequency}
                  label="Min. Frequentie"
                  onChange={(e) => handleFilterChange('minFrequency', e.target.value)}
                >
                  <MenuItem value={1}>1+</MenuItem>
                  <MenuItem value={2}>2+</MenuItem>
                  <MenuItem value={3}>3+</MenuItem>
                  <MenuItem value={5}>5+</MenuItem>
                  <MenuItem value={10}>10+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Zoekwoord"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: filters.keyword && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleFilterChange('keyword', '')}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
          
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setFilters({
                platform: 'all',
                dateRange: 'all',
                keyword: '',
                minFrequency: 2
              })}
              sx={{ mr: 1 }}
            >
              Reset
            </Button>
            
            <Button 
              variant="contained" 
              size="small" 
              startIcon={<SearchIcon />}
            >
              Toepassen
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Stats overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Geanalyseerde Items
              </Typography>
              <Typography variant="h4">
                {filteredData.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filters.platform !== 'all' ? `Platform: ${filters.platform}` : 'Alle platforms'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Trending Topics
              </Typography>
              <Typography variant="h4">
                {trendingTopics.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Min. frequentie: {filters.minFrequency}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Nieuwe Topics
              </Typography>
              <Typography variant="h4">
                {trendingTopics.filter(topic => topic.isNew).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {((trendingTopics.filter(topic => topic.isNew).length / trendingTopics.length) * 100).toFixed(1)}% van alle topics
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Gemiddelde Groei
              </Typography>
              <Typography variant="h4">
                {trendingTopics.length > 0 ? 
                  `${(trendingTopics.reduce((sum, topic) => sum + parseFloat(topic.growth), 0) / trendingTopics.length).toFixed(1)}%` : 
                  'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Vergeleken met vorige periode
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Geselecteerd topic details */}
      {selectedTopic && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <Typography variant="h6">
                {selectedTopic}
              </Typography>
              
              {trendingTopics.find(t => t.topic === selectedTopic)?.isNew && (
                <Chip 
                  label="Nieuw" 
                  color="secondary" 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            
            <IconButton size="small" onClick={() => setSelectedTopic(null)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Topic Statistieken
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Frequentie
                    </Typography>
                    <Typography variant="h6">
                      {trendingTopics.find(t => t.topic === selectedTopic)?.frequency || 0}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Groei
                    </Typography>
                    <Typography variant="h6" color={
                      parseFloat(trendingTopics.find(t => t.topic === selectedTopic)?.growth || 0) > 0 ? 
                        'success.main' : 'error.main'
                    }>
                      {trendingTopics.find(t => t.topic === selectedTopic)?.growth || 0}%
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Trending Score
                    </Typography>
                    <Typography variant="h6">
                      {trendingTopics.find(t => t.topic === selectedTopic)?.trendingScore || 0}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Platforms
                    </Typography>
                    <Typography variant="h6">
                      {Object.entries(platformTopics).filter(([platform, topics]) => 
                        topics.some(t => t.topic === selectedTopic)
                      ).length}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" gutterBottom>
                Gerelateerde Topics
              </Typography>
              
              {relatedTopics.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {relatedTopics.map((topic, index) => (
                    <Chip
                      key={index}
                      label={`${topic.topic} (${topic.relevanceScore})`}
                      onClick={() => setSelectedTopic(topic.topic)}
                      color={index < 3 ? "primary" : "default"}
                      variant={index < 3 ? "filled" : "outlined"}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Geen gerelateerde topics gevonden
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab icon={<TrendingUpIcon />} label="Trending Topics" />
        <Tab icon={<TimelineIcon />} label="Tijdlijn" />
        <Tab icon={<CompareIcon />} label="Platform Vergelijking" />
        <Tab icon={<AwarenessIcon />} label="Awareness Analyse" />
      </Tabs>
      
      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Trending Topics Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TrendingTopicsWordCloud
                  topics={trendingTopics}
                  width={isMobile ? 300 : 500}
                  height={400}
                  maxTopics={50}
                  onTopicClick={handleTopicSelect}
                  isLoading={isLoading}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TrendingTopicsBarChart
                  topics={trendingTopics}
                  width={isMobile ? 300 : 500}
                  height={400}
                  maxTopics={15}
                  onTopicClick={handleTopicSelect}
                  isLoading={isLoading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Trending Topics Tabel
                  </Typography>
                  
                  <Box sx={{ overflowX: 'auto' }}>
                    <Box sx={{ minWidth: 600 }}>
                      <Box 
                        sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 100px 100px 120px 80px',
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          py: 1
                        }}
                      >
                        <Typography variant="subtitle2">Topic</Typography>
                        <Typography variant="subtitle2">Frequentie</Typography>
                        <Typography variant="subtitle2">Groei</Typography>
                        <Typography variant="subtitle2">Trending Score</Typography>
                        <Typography variant="subtitle2">Platforms</Typography>
                      </Box>
                      
                      {trendingTopics.slice(0, 20).map((topic, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 100px 100px 120px 80px',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            py: 1,
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.04)',
                              cursor: 'pointer'
                            },
                            bgcolor: selectedTopic === topic.topic ? 'rgba(0, 0, 0, 0.04)' : 'transparent'
                          }}
                          onClick={() => handleTopicSelect(topic.topic)}
                        >
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2">
                              {topic.topic}
                            </Typography>
                            {topic.isNew && (
                              <Chip 
                                label="Nieuw" 
                                size="small" 
                                color="secondary"
                                sx={{ ml: 1, height: 20 }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2">{topic.frequency}</Typography>
                          <Typography 
                            variant="body2"
                            color={parseFloat(topic.growth) > 0 ? 'success.main' : 'error.main'}
                          >
                            {topic.growth}%
                          </Typography>
                          <Typography variant="body2">{topic.trendingScore}</Typography>
                          <Typography variant="body2">
                            {Object.entries(platformTopics).filter(([platform, topics]) => 
                              topics.some(t => t.topic === topic.topic)
                            ).length}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Tijdlijn Tab */}
          {activeTab === 1 && (
            <TrendingTopicsTimeline
              topicsData={timelineData}
              eventsData={[]} // Voeg hier events toe indien beschikbaar
              loading={isLoading}
              error={error}
              timeframe="all"
              onTimeframeChange={(timeframe) => console.log('Timeframe changed:', timeframe)}
              onTopicSelect={handleTopicSelect}
            />
          )}
          
          {/* Platform Vergelijking Tab */}
          {activeTab === 2 && (
            <TrendingTopicsComparison
              platformTopics={platformTopics}
              isLoading={isLoading}
              error={error}
              onPlatformSelect={(platforms) => console.log('Platforms selected:', platforms)}
              onTopicSelect={handleTopicSelect}
            />
          )}
          
          {/* Awareness Analyse Tab */}
          {activeTab === 3 && (
            <TopicAwarenessAnalyzer
              trendingTopics={trendingTopics}
              data={filteredData}
              isLoading={isLoading}
              textField="text"
              platformField="platform"
              projectName={projectName}
            />
          )}
        </>
      )}
    </Box>
  );
};

TrendingTopicsDashboard.propTypes = {
  data: PropTypes.array,
  previousData: PropTypes.array,
  projectName: PropTypes.string,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onRefresh: PropTypes.func
};

export default TrendingTopicsDashboard;
