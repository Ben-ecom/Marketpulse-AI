import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  CalendarViewWeek as WeekIcon,
  CalendarViewMonth as MonthIcon,
  Event as DayIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * TrendAnalysis Component
 * 
 * Component voor het analyseren en visualiseren van trends over tijd.
 * Biedt inzicht in de ontwikkeling van topics en sentiment over verschillende tijdsperiodes.
 * 
 * @component
 * @example
 * ```jsx
 * <TrendAnalysis
 *   trendingTopics={trendingTopics}
 *   timeSeriesData={timeSeriesData}
 *   isLoading={false}
 * />
 * ```
 */
const TrendAnalysis = ({
  trendingTopics = [],
  timeSeriesData = [],
  isLoading = false
}) => {
  const theme = useTheme();
  
  // State voor filters
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [timeGranularity, setTimeGranularity] = useState('week');
  const [dataType, setDataType] = useState('volume');
  
  // Bereken alle beschikbare topics uit trending topics
  const allTopics = useMemo(() => {
    return [...new Set(trendingTopics.map(item => item.topic))];
  }, [trendingTopics]);
  
  // Bereken trend data op basis van geselecteerde filters
  const trendData = useMemo(() => {
    if (!timeSeriesData || timeSeriesData.length === 0) {
      return [];
    }
    
    // Filter en aggregeer data op basis van geselecteerde granulariteit
    let filteredData = [...timeSeriesData];
    
    // Aggregeer data op basis van geselecteerde granulariteit
    const aggregatedData = {};
    
    filteredData.forEach(item => {
      let timeKey;
      const date = new Date(item.date);
      
      if (timeGranularity === 'day') {
        timeKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (timeGranularity === 'week') {
        // Bereken weeknummer en jaar
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        timeKey = `${date.getFullYear()}-W${weekNum}`;
      } else if (timeGranularity === 'month') {
        timeKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      }
      
      if (!aggregatedData[timeKey]) {
        aggregatedData[timeKey] = {
          timeKey,
          displayDate: formatTimeKey(timeKey, timeGranularity),
          total: 0
        };
        
        // Initialiseer data voor alle topics
        allTopics.forEach(topic => {
          aggregatedData[timeKey][topic] = {
            volume: 0,
            sentiment: 0,
            sentimentCount: 0
          };
        });
      }
      
      // Update totalen
      aggregatedData[timeKey].total += item.volume;
      
      // Update topic-specifieke data
      if (item.topic) {
        if (!aggregatedData[timeKey][item.topic]) {
          aggregatedData[timeKey][item.topic] = {
            volume: 0,
            sentiment: 0,
            sentimentCount: 0
          };
        }
        
        aggregatedData[timeKey][item.topic].volume += item.volume;
        aggregatedData[timeKey][item.topic].sentiment += item.sentiment * item.volume;
        aggregatedData[timeKey][item.topic].sentimentCount += item.volume;
      }
    });
    
    // Bereken gemiddelde sentiment scores
    Object.values(aggregatedData).forEach(timePoint => {
      allTopics.forEach(topic => {
        if (timePoint[topic] && timePoint[topic].sentimentCount > 0) {
          timePoint[topic].sentiment = timePoint[topic].sentiment / timePoint[topic].sentimentCount;
        }
      });
    });
    
    // Converteer naar array en sorteer op tijd
    return Object.values(aggregatedData).sort((a, b) => {
      return a.timeKey.localeCompare(b.timeKey);
    });
  }, [timeSeriesData, timeGranularity, allTopics]);
  
  // Bereken chart data op basis van geselecteerde filters
  const chartData = useMemo(() => {
    if (trendData.length === 0) {
      return [];
    }
    
    return trendData.map(timePoint => {
      const result = {
        name: timePoint.displayDate
      };
      
      if (selectedTopic === 'all') {
        // Voor 'all', toon de top 5 topics
        const topTopics = allTopics
          .sort((a, b) => {
            const aVolume = timePoint[a]?.volume || 0;
            const bVolume = timePoint[b]?.volume || 0;
            return bVolume - aVolume;
          })
          .slice(0, 5);
        
        topTopics.forEach(topic => {
          if (timePoint[topic]) {
            result[topic] = dataType === 'volume' 
              ? timePoint[topic].volume 
              : timePoint[topic].sentiment * 100; // Convert to percentage
          } else {
            result[topic] = 0;
          }
        });
      } else {
        // Voor een specifiek topic
        if (timePoint[selectedTopic]) {
          result[selectedTopic] = dataType === 'volume' 
            ? timePoint[selectedTopic].volume 
            : timePoint[selectedTopic].sentiment * 100; // Convert to percentage
        } else {
          result[selectedTopic] = 0;
        }
      }
      
      return result;
    });
  }, [trendData, selectedTopic, dataType, allTopics]);
  
  // Bereken trendlijnen voor de chart
  const chartLines = useMemo(() => {
    if (chartData.length === 0) {
      return [];
    }
    
    const firstDataPoint = chartData[0];
    const topics = Object.keys(firstDataPoint).filter(key => key !== 'name');
    
    return topics.map(topic => {
      // Genereer een consistente kleur op basis van de topic naam
      const hash = topic.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      
      const color = `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
      
      return {
        topic,
        color
      };
    });
  }, [chartData]);
  
  // Bereken trend indicatoren (stijgend, dalend, stabiel)
  const trendIndicators = useMemo(() => {
    if (chartData.length < 2) {
      return {};
    }
    
    const firstDataPoint = chartData[0];
    const lastDataPoint = chartData[chartData.length - 1];
    const topics = Object.keys(firstDataPoint).filter(key => key !== 'name');
    
    const result = {};
    
    topics.forEach(topic => {
      const firstValue = firstDataPoint[topic] || 0;
      const lastValue = lastDataPoint[topic] || 0;
      const percentChange = firstValue === 0 
        ? (lastValue > 0 ? 100 : 0) 
        : ((lastValue - firstValue) / firstValue) * 100;
      
      let trend;
      if (percentChange > 5) {
        trend = 'up';
      } else if (percentChange < -5) {
        trend = 'down';
      } else {
        trend = 'stable';
      }
      
      result[topic] = {
        trend,
        percentChange
      };
    });
    
    return result;
  }, [chartData]);
  
  // Helper functie voor het formatteren van timeKey naar leesbare datum
  const formatTimeKey = (timeKey, granularity) => {
    if (granularity === 'day') {
      // YYYY-MM-DD naar DD-MM
      const parts = timeKey.split('-');
      return `${parts[2]}-${parts[1]}`;
    } else if (granularity === 'week') {
      // YYYY-WW naar Week WW
      const parts = timeKey.split('-W');
      return `W${parts[1]}`;
    } else if (granularity === 'month') {
      // YYYY-MM naar MMM
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
      const parts = timeKey.split('-');
      return months[parseInt(parts[1]) - 1];
    }
    return timeKey;
  };
  
  // Handler voor topic selectie
  const handleTopicChange = (event) => {
    setSelectedTopic(event.target.value);
  };
  
  // Handler voor granulariteit selectie
  const handleGranularityChange = (event, newValue) => {
    if (newValue !== null) {
      setTimeGranularity(newValue);
    }
  };
  
  // Handler voor datatype selectie
  const handleDataTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setDataType(newValue);
    }
  };
  
  // Render trend indicator icon
  const renderTrendIndicator = (trend, percentChange) => {
    let Icon, color, label;
    
    if (trend === 'up') {
      Icon = TrendingUpIcon;
      color = theme.palette.success.main;
      label = `Stijgend (${Math.abs(Math.round(percentChange))}%)`;
    } else if (trend === 'down') {
      Icon = TrendingDownIcon;
      color = theme.palette.error.main;
      label = `Dalend (${Math.abs(Math.round(percentChange))}%)`;
    } else {
      Icon = TrendingFlatIcon;
      color = theme.palette.warning.main;
      label = 'Stabiel';
    }
    
    return (
      <Tooltip title={label}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon sx={{ color }} />
          <Typography variant="body2" sx={{ ml: 0.5, color }}>
            {Math.round(percentChange)}%
          </Typography>
        </Box>
      </Tooltip>
    );
  };
  
  // Render loading skeletons
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Skeleton variant="text" width="50%" height={40} />
          <Box sx={{ display: 'flex', mt: 2, mb: 3 }}>
            <Skeleton variant="rectangular" width={150} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="rectangular" width={200} height={40} />
          </Box>
          <Skeleton variant="rectangular" height={400} />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Box sx={{ mt: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rectangular" height={50} sx={{ my: 1 }} />
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
  
  // Als data wordt geladen, toon skeletons
  if (isLoading) {
    return renderSkeletons();
  }
  
  // Als er geen data is, toon een melding
  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Geen trend data beschikbaar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Er is nog geen tijdreeks data beschikbaar voor de trend analyse.
          Selecteer een databron en datumbereik om data te laden.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Trend Analyse
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Analyse van trends over tijd voor topics en sentiment. Gebruik de filters om specifieke topics en tijdsperiodes te bekijken.
        </Typography>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <FilterIcon color="action" />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="topic-trend-select-label">Topic</InputLabel>
            <Select
              labelId="topic-trend-select-label"
              id="topic-trend-select"
              value={selectedTopic}
              label="Topic"
              onChange={handleTopicChange}
            >
              <MenuItem value="all">Top 5 topics</MenuItem>
              {allTopics.map((topic) => (
                <MenuItem key={topic} value={topic}>{topic}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <ToggleButtonGroup
            value={timeGranularity}
            exclusive
            onChange={handleGranularityChange}
            aria-label="tijd granulariteit"
            size="small"
          >
            <ToggleButton value="day" aria-label="dag">
              <Tooltip title="Per dag">
                <DayIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="week" aria-label="week">
              <Tooltip title="Per week">
                <WeekIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="month" aria-label="maand">
              <Tooltip title="Per maand">
                <MonthIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          
          <ToggleButtonGroup
            value={dataType}
            exclusive
            onChange={handleDataTypeChange}
            aria-label="data type"
            size="small"
          >
            <ToggleButton value="volume" aria-label="volume">
              <Tooltip title="Volume">
                <Typography variant="body2">Volume</Typography>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="sentiment" aria-label="sentiment">
              <Tooltip title="Sentiment">
                <Typography variant="body2">Sentiment %</Typography>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Trend chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {dataType === 'volume' ? 'Volume Trend' : 'Sentiment Trend'}
              <Tooltip title="Deze grafiek toont de ontwikkeling van topics over tijd. Gebruik de filters om specifieke topics en tijdsperiodes te bekijken.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    label={{ 
                      value: dataType === 'volume' ? 'Volume' : 'Sentiment (%)', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }} 
                    domain={dataType === 'sentiment' ? [0, 100] : ['auto', 'auto']}
                  />
                  <RechartsTooltip />
                  <Legend />
                  {chartLines.map(line => (
                    <Line
                      key={line.topic}
                      type="monotone"
                      dataKey={line.topic}
                      stroke={line.color}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Trend indicators */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Trend Indicatoren
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {Object.entries(trendIndicators).map(([topic, data]) => (
                <Grid item xs={12} sm={6} md={3} key={topic}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" noWrap sx={{ maxWidth: '70%' }}>
                        {topic}
                      </Typography>
                      {renderTrendIndicator(data.trend, data.percentChange)}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {data.trend === 'up' && 'Stijgende trend over de geselecteerde periode.'}
                      {data.trend === 'down' && 'Dalende trend over de geselecteerde periode.'}
                      {data.trend === 'stable' && 'Stabiele trend over de geselecteerde periode.'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            {Object.keys(trendIndicators).length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Onvoldoende data om trends te berekenen. Er zijn minimaal twee datapunten nodig.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

TrendAnalysis.propTypes = {
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
   * Array met tijdreeks data voor trends
   */
  timeSeriesData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
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

export default TrendAnalysis;
