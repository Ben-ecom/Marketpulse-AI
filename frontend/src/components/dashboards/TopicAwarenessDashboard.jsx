import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  useTheme,
  Tooltip,
  IconButton,
  Skeleton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  BubbleChart as BubbleChartIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

/**
 * TopicAwarenessDashboard Component
 * 
 * Dashboard component voor het visualiseren van topic awareness data.
 * Toont grafieken en visualisaties van awareness fasen, trending topics en content aanbevelingen.
 * 
 * @component
 * @example
 * ```jsx
 * <TopicAwarenessDashboard
 *   topicsByPhase={topicsByPhase}
 *   awarenessDistribution={awarenessDistribution}
 *   contentRecommendations={contentRecommendations}
 *   trendingTopics={trendingTopics}
 *   isLoading={false}
 * />
 * ```
 */
const TopicAwarenessDashboard = ({
  topicsByPhase = {},
  awarenessDistribution = [],
  contentRecommendations = {},
  trendingTopics = [],
  isLoading = false
}) => {
  const theme = useTheme();
  const [selectedPhase, setSelectedPhase] = useState('all');
  
  // Kleuren voor de awareness fasen
  const phaseColors = {
    awareness: theme.palette.primary.main,
    consideration: theme.palette.secondary.main,
    decision: theme.palette.success.main,
    all: theme.palette.grey[500]
  };
  
  // Bereken totaal aantal topics
  const totalTopics = useMemo(() => {
    if (!topicsByPhase) return 0;
    return Object.values(topicsByPhase).reduce((sum, topics) => sum + topics.length, 0);
  }, [topicsByPhase]);
  
  // Bereken top trending topics (top 5)
  const topTrendingTopics = useMemo(() => {
    if (!trendingTopics || trendingTopics.length === 0) return [];
    return [...trendingTopics]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  }, [trendingTopics]);
  
  // Filter topics op basis van geselecteerde fase
  const filteredTopics = useMemo(() => {
    if (selectedPhase === 'all') {
      return topicsByPhase;
    }
    return { [selectedPhase]: topicsByPhase[selectedPhase] || [] };
  }, [topicsByPhase, selectedPhase]);
  
  // Handler voor fase selectie
  const handlePhaseSelect = (phase) => {
    setSelectedPhase(phase);
  };
  
  // Render loading skeletons
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Skeleton variant="text" width="50%" height={40} />
          <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Skeleton variant="text" width="70%" height={40} />
          <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Box sx={{ mt: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="text" height={30} sx={{ my: 1 }} />
            ))}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Box sx={{ mt: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={50} sx={{ my: 1 }} />
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
  
  // Render fase filter chips
  const renderPhaseFilters = () => {
    const phases = [
      { id: 'all', label: 'Alle fasen' },
      { id: 'awareness', label: 'Awareness' },
      { id: 'consideration', label: 'Consideration' },
      { id: 'decision', label: 'Decision' }
    ];
    
    return (
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <FilterListIcon sx={{ color: 'text.secondary', mr: 1 }} />
        {phases.map((phase) => (
          <Chip
            key={phase.id}
            label={phase.label}
            onClick={() => handlePhaseSelect(phase.id)}
            color={selectedPhase === phase.id ? 'primary' : 'default'}
            variant={selectedPhase === phase.id ? 'filled' : 'outlined'}
            sx={{ 
              borderColor: phaseColors[phase.id],
              '&.MuiChip-colorPrimary': {
                backgroundColor: phaseColors[phase.id]
              }
            }}
          />
        ))}
      </Box>
    );
  };
  
  // Render awareness distributie grafiek
  const renderAwarenessDistribution = () => {
    if (!awarenessDistribution || awarenessDistribution.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Geen awareness distributie data beschikbaar
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        {awarenessDistribution.map((item) => {
          const phase = item.phase.toLowerCase();
          return (
            <Box key={phase} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{item.phase}</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {item.percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={item.percentage}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: phaseColors[phase] || theme.palette.primary.main
                  }
                }}
              />
            </Box>
          );
        })}
      </Box>
    );
  };
  
  // Render trending topics lijst
  const renderTrendingTopics = () => {
    if (!topTrendingTopics || topTrendingTopics.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Geen trending topics data beschikbaar
          </Typography>
        </Box>
      );
    }
    
    return (
      <List>
        {topTrendingTopics.map((topic, index) => {
          const isTrending = topic.sentiment > 0.5;
          return (
            <ListItem
              key={topic.topic}
              divider={index < topTrendingTopics.length - 1}
              sx={{
                backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                borderRadius: 1
              }}
            >
              <ListItemIcon>
                {isTrending ? (
                  <TrendingUpIcon sx={{ color: theme.palette.success.main }} />
                ) : (
                  <TrendingDownIcon sx={{ color: theme.palette.error.main }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={topic.topic}
                secondary={`Volume: ${topic.volume} | Sentiment: ${(topic.sentiment * 100).toFixed(0)}%`}
              />
              <Chip 
                size="small" 
                label={`#${index + 1}`} 
                color={index < 3 ? "primary" : "default"}
                variant={index < 3 ? "filled" : "outlined"}
              />
            </ListItem>
          );
        })}
      </List>
    );
  };
  
  // Render topics per fase
  const renderTopicsByPhase = () => {
    if (!filteredTopics || Object.keys(filteredTopics).length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Geen topics data beschikbaar
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        {Object.entries(filteredTopics).map(([phase, topics]) => (
          <Card key={phase} sx={{ mb: 2, boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
            <CardHeader
              title={phase.charAt(0).toUpperCase() + phase.slice(1)}
              titleTypographyProps={{ variant: 'h6' }}
              avatar={
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    backgroundColor: phaseColors[phase] || theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  {topics.length}
                </Box>
              }
              action={
                <Tooltip title={`Topics in de ${phase} fase`}>
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {topics.map((topic) => (
                  <Chip
                    key={topic}
                    label={topic}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: phaseColors[phase] || theme.palette.primary.main }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };
  
  // Render content aanbevelingen
  const renderContentRecommendations = () => {
    if (!contentRecommendations || Object.keys(contentRecommendations).length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Geen content aanbevelingen beschikbaar
          </Typography>
        </Box>
      );
    }
    
    return (
      <List>
        {Object.entries(contentRecommendations)
          .filter(([phase]) => selectedPhase === 'all' || phase === selectedPhase)
          .map(([phase, recommendations]) => (
            <Box key={phase}>
              <Typography
                variant="subtitle2"
                sx={{
                  px: 2,
                  py: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  borderRadius: 1,
                  mb: 1,
                  color: phaseColors[phase] || theme.palette.text.primary
                }}
              >
                {phase.charAt(0).toUpperCase() + phase.slice(1)} Fase
              </Typography>
              {recommendations.map((recommendation, index) => (
                <ListItem
                  key={`${phase}-${index}`}
                  sx={{ py: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LightbulbIcon fontSize="small" sx={{ color: phaseColors[phase] }} />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
              {phase !== Object.keys(contentRecommendations).slice(-1)[0] && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
      </List>
    );
  };
  
  // Als data wordt geladen, toon skeletons
  if (isLoading) {
    return renderSkeletons();
  }
  
  // Als er geen data is, toon een melding
  if (!topicsByPhase || Object.keys(topicsByPhase).length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Geen topic awareness data beschikbaar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Er is nog geen data beschikbaar voor het topic awareness dashboard.
          Selecteer een databron en datumbereik om data te laden.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <BubbleChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Topic Awareness Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visualisatie van topic awareness data, trending topics en content aanbevelingen.
          Gebruik de filters om specifieke fasen te bekijken.
        </Typography>
      </Box>
      
      {/* Fase filters */}
      {renderPhaseFilters()}
      
      <Grid container spacing={3}>
        {/* Awareness distributie grafiek */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Awareness Distributie
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderAwarenessDistribution()}
          </Paper>
        </Grid>
        
        {/* Topics per fase */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <BubbleChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Topics per Fase
              <Chip 
                size="small" 
                label={`Totaal: ${totalTopics}`} 
                sx={{ ml: 1 }} 
                color="primary"
              />
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderTopicsByPhase()}
          </Paper>
        </Grid>
        
        {/* Trending topics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Trending Topics
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderTrendingTopics()}
          </Paper>
        </Grid>
        
        {/* Content aanbevelingen */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Content Aanbevelingen
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderContentRecommendations()}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

TopicAwarenessDashboard.propTypes = {
  /**
   * Object met topics gegroepeerd per awareness fase
   */
  topicsByPhase: PropTypes.object,
  
  /**
   * Array met awareness distributie data
   */
  awarenessDistribution: PropTypes.arrayOf(
    PropTypes.shape({
      phase: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired
    })
  ),
  
  /**
   * Object met content aanbevelingen per awareness fase
   */
  contentRecommendations: PropTypes.object,
  
  /**
   * Array met trending topics data
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

export default TopicAwarenessDashboard;
