import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  Skeleton,
  Chip,
  useTheme
} from '@mui/material';
import {
  Analytics as SentimentIcon,
  SentimentVerySatisfied as PositiveIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as NegativeIcon,
  Info as InfoIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

/**
 * SentimentAnalysis Component
 * 
 * Component voor het analyseren en visualiseren van sentiment per topic en awareness fase.
 * Biedt inzicht in de positieve, neutrale en negatieve sentimenten binnen verschillende segmenten.
 * 
 * @component
 * @example
 * ```jsx
 * <SentimentAnalysis
 *   topicsByPhase={topicsByPhase}
 *   trendingTopics={trendingTopics}
 *   isLoading={false}
 * />
 * ```
 */
const SentimentAnalysis = ({
  topicsByPhase = {},
  trendingTopics = [],
  isLoading = false
}) => {
  const theme = useTheme();
  
  // State voor filters
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  
  // Bereken alle beschikbare topics uit topicsByPhase
  const allTopics = useMemo(() => {
    const topics = [];
    Object.values(topicsByPhase).forEach(phaseTopics => {
      topics.push(...phaseTopics);
    });
    return [...new Set(topics)]; // Verwijder duplicaten
  }, [topicsByPhase]);
  
  // Bereken sentiment data op basis van geselecteerde filters
  const sentimentData = useMemo(() => {
    // Als er geen trending topics data is, return lege data
    if (!trendingTopics || trendingTopics.length === 0) {
      return {
        overall: { positive: 0, neutral: 0, negative: 0 },
        byPhase: {},
        byTopic: {}
      };
    }
    
    // Filter trending topics op basis van geselecteerde fase en topic
    let filteredTopics = [...trendingTopics];
    
    if (selectedTopic !== 'all') {
      filteredTopics = filteredTopics.filter(item => item.topic === selectedTopic);
    }
    
    if (selectedPhase !== 'all') {
      // Filter op topics die in de geselecteerde fase voorkomen
      const topicsInPhase = topicsByPhase[selectedPhase] || [];
      filteredTopics = filteredTopics.filter(item => topicsInPhase.includes(item.topic));
    }
    
    // Bereken overall sentiment
    const overall = {
      positive: 0,
      neutral: 0,
      negative: 0
    };
    
    filteredTopics.forEach(item => {
      if (item.sentiment >= 0.6) {
        overall.positive += item.volume;
      } else if (item.sentiment >= 0.4) {
        overall.neutral += item.volume;
      } else {
        overall.negative += item.volume;
      }
    });
    
    // Bereken sentiment per fase
    const byPhase = {};
    
    Object.entries(topicsByPhase).forEach(([phase, phaseTopics]) => {
      byPhase[phase] = {
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0
      };
      
      // Filter trending topics die in deze fase voorkomen
      const topicsInPhase = filteredTopics.filter(item => phaseTopics.includes(item.topic));
      
      topicsInPhase.forEach(item => {
        byPhase[phase].total += item.volume;
        
        if (item.sentiment >= 0.6) {
          byPhase[phase].positive += item.volume;
        } else if (item.sentiment >= 0.4) {
          byPhase[phase].neutral += item.volume;
        } else {
          byPhase[phase].negative += item.volume;
        }
      });
    });
    
    // Bereken sentiment per topic
    const byTopic = {};
    
    filteredTopics.forEach(item => {
      if (!byTopic[item.topic]) {
        byTopic[item.topic] = {
          positive: 0,
          neutral: 0,
          negative: 0,
          total: item.volume,
          sentiment: item.sentiment
        };
      }
      
      if (item.sentiment >= 0.6) {
        byTopic[item.topic].positive += item.volume;
      } else if (item.sentiment >= 0.4) {
        byTopic[item.topic].neutral += item.volume;
      } else {
        byTopic[item.topic].negative += item.volume;
      }
    });
    
    return {
      overall,
      byPhase,
      byTopic
    };
  }, [topicsByPhase, trendingTopics, selectedPhase, selectedTopic]);
  
  // Bereken totaal volume
  const totalVolume = useMemo(() => {
    return Object.values(sentimentData.overall).reduce((sum, val) => sum + val, 0);
  }, [sentimentData.overall]);
  
  // Handler voor fase selectie
  const handlePhaseChange = (event) => {
    setSelectedPhase(event.target.value);
  };
  
  // Handler voor topic selectie
  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
  };
  
  // Render loading skeletons
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Skeleton variant="text" width="50%" height={40} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Skeleton variant="text" width="70%" height={40} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Box sx={{ mt: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" height={50} sx={{ my: 1 }} />
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
  
  // Render sentiment indicator
  const renderSentimentIndicator = (sentiment, size = 'medium') => {
    let Icon, color, label;
    
    if (sentiment >= 0.6) {
      Icon = PositiveIcon;
      color = theme.palette.success.main;
      label = 'Positief';
    } else if (sentiment >= 0.4) {
      Icon = NeutralIcon;
      color = theme.palette.warning.main;
      label = 'Neutraal';
    } else {
      Icon = NegativeIcon;
      color = theme.palette.error.main;
      label = 'Negatief';
    }
    
    return (
      <Tooltip title={label}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon sx={{ color, fontSize: size === 'small' ? 20 : 24 }} />
          {size !== 'small' && (
            <Typography variant="body2" sx={{ ml: 0.5, color }}>
              {label}
            </Typography>
          )}
        </Box>
      </Tooltip>
    );
  };
  
  // Render percentage bar
  const renderPercentageBar = (positive, neutral, negative, total) => {
    if (total === 0) return null;
    
    const positivePercent = (positive / total) * 100;
    const neutralPercent = (neutral / total) * 100;
    const negativePercent = (negative / total) * 100;
    
    return (
      <Box sx={{ display: 'flex', width: '100%', height: 20, borderRadius: 1, overflow: 'hidden', mt: 1 }}>
        <Box 
          sx={{ 
            width: `${positivePercent}%`, 
            bgcolor: theme.palette.success.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {positivePercent > 10 && (
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
              {Math.round(positivePercent)}%
            </Typography>
          )}
        </Box>
        <Box 
          sx={{ 
            width: `${neutralPercent}%`, 
            bgcolor: theme.palette.warning.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {neutralPercent > 10 && (
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
              {Math.round(neutralPercent)}%
            </Typography>
          )}
        </Box>
        <Box 
          sx={{ 
            width: `${negativePercent}%`, 
            bgcolor: theme.palette.error.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {negativePercent > 10 && (
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
              {Math.round(negativePercent)}%
            </Typography>
          )}
        </Box>
      </Box>
    );
  };
  
  // Als data wordt geladen, toon skeletons
  if (isLoading) {
    return renderSkeletons();
  }
  
  // Als er geen data is, toon een melding
  if (!topicsByPhase || Object.keys(topicsByPhase).length === 0 || !trendingTopics || trendingTopics.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Geen sentiment data beschikbaar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Er is nog geen data beschikbaar voor de sentiment analyse.
          Selecteer een databron en datumbereik om data te laden.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <SentimentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Sentiment Analyse
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analyse van sentiment per topic en awareness fase. Gebruik de filters om specifieke fasen of topics te bekijken.
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FilterIcon color="action" />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="phase-select-label">Awareness Fase</InputLabel>
            <Select
              labelId="phase-select-label"
              id="phase-select"
              value={selectedPhase}
              label="Awareness Fase"
              onChange={handlePhaseChange}
            >
              <MenuItem value="all">Alle fasen</MenuItem>
              {Object.keys(topicsByPhase).map((phase) => (
                <MenuItem key={phase} value={phase}>{phase}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="topic-select-label">Topic</InputLabel>
            <Select
              labelId="topic-select-label"
              id="topic-select"
              value={selectedTopic}
              label="Topic"
              onChange={handleTopicChange}
            >
              <MenuItem value="all">Alle topics</MenuItem>
              {allTopics.map((topic) => (
                <MenuItem key={topic} value={topic}>{topic}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Overall sentiment */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Overall Sentiment
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {totalVolume > 0 ? Math.round((sentimentData.overall.positive / totalVolume) * 100) : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Positief
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {totalVolume > 0 ? Math.round((sentimentData.overall.neutral / totalVolume) * 100) : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Neutraal
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {totalVolume > 0 ? Math.round((sentimentData.overall.negative / totalVolume) * 100) : 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Negatief
                </Typography>
              </Box>
            </Box>
            
            {renderPercentageBar(
              sentimentData.overall.positive,
              sentimentData.overall.neutral,
              sentimentData.overall.negative,
              totalVolume
            )}
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Gebaseerd op {totalVolume} vermeldingen
                {selectedPhase !== 'all' && ` in de ${selectedPhase} fase`}
                {selectedTopic !== 'all' && ` voor het topic "${selectedTopic}"`}.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Sentiment per fase */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Sentiment per Awareness Fase
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {Object.entries(sentimentData.byPhase).map(([phase, data]) => (
              <Box key={phase} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="subtitle1">
                    {phase}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="body2" color="success.main">
                      +{data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0}%
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      ={data.total > 0 ? Math.round((data.neutral / data.total) * 100) : 0}%
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      -{data.total > 0 ? Math.round((data.negative / data.total) * 100) : 0}%
                    </Typography>
                  </Box>
                </Box>
                
                {renderPercentageBar(
                  data.positive,
                  data.neutral,
                  data.negative,
                  data.total
                )}
              </Box>
            ))}
            
            {Object.keys(sentimentData.byPhase).length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Geen fase-specifieke data beschikbaar voor de geselecteerde filters.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Sentiment per topic */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sentiment per Topic
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {Object.entries(sentimentData.byTopic).map(([topic, data]) => (
                <Grid item xs={12} sm={6} md={4} key={topic}>
                  <Card variant="outlined">
                    <CardHeader
                      title={topic}
                      titleTypographyProps={{ variant: 'subtitle1' }}
                      action={renderSentimentIndicator(data.sentiment, 'small')}
                    />
                    <CardContent sx={{ pt: 0 }}>
                      {renderPercentageBar(
                        data.positive,
                        data.neutral,
                        data.negative,
                        data.total
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Volume: {data.total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sentiment: {Math.round(data.sentiment * 100)}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {Object.keys(sentimentData.byTopic).length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Geen topic-specifieke data beschikbaar voor de geselecteerde filters.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

SentimentAnalysis.propTypes = {
  /**
   * Object met topics gegroepeerd per awareness fase
   */
  topicsByPhase: PropTypes.object,
  
  /**
   * Array met trending topics data, inclusief sentiment scores
   */
  trendingTopics: PropTypes.arrayOf(
    PropTypes.shape({
      topic: PropTypes.string.isRequired,
      volume: PropTypes.number.isRequired,
      sentiment: PropTypes.number.isRequired
    })
  ),
  
  /**
   * Geeft aan of de data nog wordt geladen
   */
  isLoading: PropTypes.bool
};

export default SentimentAnalysis;
