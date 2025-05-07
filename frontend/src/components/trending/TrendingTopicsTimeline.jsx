import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Brush, ReferenceLine, ReferenceArea, Label
} from 'recharts';
import {
  Box, Typography, Paper, CircularProgress, Alert, FormControl,
  InputLabel, Select, MenuItem, Chip, OutlinedInput, Checkbox, 
  ListItemText, IconButton, Tooltip as MuiTooltip, useTheme, useMediaQuery
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

/**
 * Component voor het visualiseren van trending topics over tijd
 */
const TrendingTopicsTimeline = ({
  topicsData = {},
  eventsData = [],
  loading = false,
  error = null,
  timeframe = 'all',
  onTimeframeChange = null,
  onTopicSelect = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State voor geselecteerde topics
  const [selectedTopics, setSelectedTopics] = useState([]);
  
  // State voor zoom en pan
  const [zoomDomain, setZoomDomain] = useState(null);
  const [brushDomain, setBrushDomain] = useState(null);
  
  // State voor events
  const [showEvents, setShowEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Verwerk topics data
  const { timePoints, series } = topicsData;
  
  // Bereid data voor voor chart
  const chartData = useMemo(() => {
    if (!timePoints || !timePoints.length || !series) {
      return [];
    }
    
    return timePoints.map((timePoint, index) => {
      const dataPoint = { name: timePoint };
      
      // Voeg alleen geselecteerde topics toe, of alle topics als er geen selectie is
      const topicsToShow = selectedTopics.length > 0 
        ? selectedTopics 
        : Object.keys(series).slice(0, 5); // Beperk tot 5 topics als er geen selectie is
      
      topicsToShow.forEach(topic => {
        if (series[topic]) {
          dataPoint[topic] = series[topic][index];
        }
      });
      
      return dataPoint;
    });
  }, [timePoints, series, selectedTopics]);
  
  // Bereid events voor
  const timelineEvents = useMemo(() => {
    if (!eventsData || !eventsData.length || !timePoints || !timePoints.length) {
      return [];
    }
    
    return eventsData.map(event => {
      const eventDate = new Date(event.date);
      
      // Vind dichtstbijzijnde tijdpunt
      let closestIndex = 0;
      let minDistance = Infinity;
      
      timePoints.forEach((timePoint, index) => {
        const timePointDate = new Date(timePoint);
        const distance = Math.abs(timePointDate - eventDate);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      
      return {
        ...event,
        index: closestIndex,
        x: timePoints[closestIndex]
      };
    });
  }, [eventsData, timePoints]);
  
  // Genereer unieke kleuren voor topics
  const topicColors = useMemo(() => {
    const colors = {
      // Voorgedefinieerde kleuren voor veelvoorkomende topics
      'prijs': theme.palette.primary.main,
      'kwaliteit': theme.palette.secondary.main,
      'service': theme.palette.success.main,
      'levering': theme.palette.warning.main,
      'design': theme.palette.info.main
    };
    
    // Genereer kleuren voor andere topics
    const baseColors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
      '#8884d8',
      '#82ca9d',
      '#ffc658',
      '#ff8042'
    ];
    
    if (!series) return colors;
    
    Object.keys(series).forEach((topic, index) => {
      if (!colors[topic]) {
        colors[topic] = baseColors[index % baseColors.length];
      }
    });
    
    return colors;
  }, [series, theme]);
  
  // Effect om standaard topics te selecteren
  useEffect(() => {
    if (series && Object.keys(series).length > 0 && selectedTopics.length === 0) {
      // Selecteer standaard de top 5 topics op basis van totale frequentie
      const topicTotals = Object.entries(series).map(([topic, values]) => {
        const total = values.reduce((sum, val) => sum + val, 0);
        return { topic, total };
      });
      
      const topTopics = topicTotals
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map(item => item.topic);
      
      setSelectedTopics(topTopics);
    }
  }, [series]);
  
  // Handler voor topic selectie
  const handleTopicChange = (event) => {
    const value = event.target.value;
    setSelectedTopics(value);
    
    if (onTopicSelect) {
      onTopicSelect(value);
    }
  };
  
  // Handler voor timeframe wijziging
  const handleTimeframeChange = (event) => {
    const value = event.target.value;
    
    if (onTimeframeChange) {
      onTimeframeChange(value);
    }
  };
  
  // Handler voor zoom reset
  const handleResetZoom = () => {
    setZoomDomain(null);
    setBrushDomain(null);
  };
  
  // Handler voor brush (tijdselectie)
  const handleBrushChange = (domain) => {
    if (domain && domain.startIndex !== domain.endIndex) {
      setBrushDomain(domain);
    }
  };
  
  // Handler voor zoom in
  const handleZoomIn = () => {
    if (!brushDomain) return;
    
    setZoomDomain({
      startIndex: brushDomain.startIndex,
      endIndex: brushDomain.endIndex
    });
  };
  
  // Handler voor event selectie
  const handleEventClick = (event) => {
    setSelectedEvent(event === selectedEvent ? null : event);
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    return (
      <Paper sx={{ p: 1.5, boxShadow: theme.shadows[3] }}>
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: entry.color,
                borderRadius: '50%',
                mr: 1
              }} 
            />
            <Typography variant="body2">
              {entry.name}: {entry.value}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Trending topics data laden...
        </Typography>
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  // Render empty state
  if (!chartData || chartData.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Geen trending topics data beschikbaar voor de geselecteerde periode.
      </Alert>
    );
  }
  
  // Bepaal data voor weergave (met zoom)
  const displayData = zoomDomain 
    ? chartData.slice(zoomDomain.startIndex, zoomDomain.endIndex + 1)
    : chartData;
  
  // Bepaal zichtbare events
  const visibleEvents = showEvents ? timelineEvents.filter(event => {
    if (zoomDomain) {
      return event.index >= zoomDomain.startIndex && event.index <= zoomDomain.endIndex;
    }
    return true;
  }) : [];
  
  return (
    <Paper sx={{ p: 2 }}>
      {/* Header met titel en controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6">
          Trending Topics Timeline
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Timeframe selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="timeframe-label">Periode</InputLabel>
            <Select
              labelId="timeframe-label"
              id="timeframe-select"
              value={timeframe}
              label="Periode"
              onChange={handleTimeframeChange}
            >
              <MenuItem value="day">Dag</MenuItem>
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Maand</MenuItem>
              <MenuItem value="quarter">Kwartaal</MenuItem>
              <MenuItem value="year">Jaar</MenuItem>
              <MenuItem value="all">Alles</MenuItem>
            </Select>
          </FormControl>
          
          {/* Topic selector */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="topics-label">Topics</InputLabel>
            <Select
              labelId="topics-label"
              id="topics-select"
              multiple
              value={selectedTopics}
              onChange={handleTopicChange}
              input={<OutlinedInput label="Topics" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={value} 
                      size="small" 
                      sx={{ 
                        backgroundColor: alpha(topicColors[value], 0.1),
                        color: topicColors[value],
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {Object.keys(series || {}).map((topic) => (
                <MenuItem key={topic} value={topic}>
                  <Checkbox checked={selectedTopics.indexOf(topic) > -1} />
                  <ListItemText primary={topic} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Zoom controls */}
          <Box>
            <MuiTooltip title="Zoom in op selectie">
              <IconButton 
                size="small" 
                onClick={handleZoomIn}
                disabled={!brushDomain}
              >
                <ZoomInIcon />
              </IconButton>
            </MuiTooltip>
            
            <MuiTooltip title="Reset zoom">
              <IconButton 
                size="small" 
                onClick={handleResetZoom}
                disabled={!zoomDomain}
              >
                <RefreshIcon />
              </IconButton>
            </MuiTooltip>
            
            <MuiTooltip title={showEvents ? "Verberg events" : "Toon events"}>
              <IconButton 
                size="small" 
                onClick={() => setShowEvents(!showEvents)}
                color={showEvents ? "primary" : "default"}
              >
                <EventIcon />
              </IconButton>
            </MuiTooltip>
          </Box>
        </Box>
      </Box>
      
      {/* Chart */}
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={displayData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              padding={{ left: 10, right: 10 }}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickMargin={10}
              label={{ 
                value: 'Frequentie', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Render lijnen voor geselecteerde topics */}
            {selectedTopics.map((topic) => (
              <Line
                key={topic}
                type="monotone"
                dataKey={topic}
                stroke={topicColors[topic]}
                activeDot={{ r: 8, onClick: () => console.log(`Clicked on ${topic}`) }}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
            
            {/* Render event markers */}
            {showEvents && visibleEvents.map((event, index) => (
              <ReferenceLine
                key={`event-${index}`}
                x={event.x}
                stroke={selectedEvent === event ? theme.palette.error.main : theme.palette.grey[500]}
                strokeWidth={selectedEvent === event ? 2 : 1}
                strokeDasharray="3 3"
                onClick={() => handleEventClick(event)}
                style={{ cursor: 'pointer' }}
              >
                <Label
                  value={<EventIcon />}
                  position="top"
                  fill={selectedEvent === event ? theme.palette.error.main : theme.palette.grey[700]}
                  fontSize={16}
                />
              </ReferenceLine>
            ))}
            
            {/* Brush voor tijdselectie */}
            <Brush
              dataKey="name"
              height={30}
              stroke={theme.palette.primary.main}
              onChange={handleBrushChange}
              startIndex={brushDomain?.startIndex || 0}
              endIndex={brushDomain?.endIndex || Math.min(20, chartData.length - 1)}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      
      {/* Event details */}
      {selectedEvent && (
        <Paper sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <Typography variant="subtitle1" gutterBottom>
            {selectedEvent.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {selectedEvent.description}
          </Typography>
          
          {selectedEvent.category && (
            <Chip 
              label={selectedEvent.category} 
              size="small" 
              sx={{ mt: 1 }}
            />
          )}
        </Paper>
      )}
    </Paper>
  );
};

TrendingTopicsTimeline.propTypes = {
  topicsData: PropTypes.shape({
    timePoints: PropTypes.array,
    series: PropTypes.object
  }),
  eventsData: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  timeframe: PropTypes.oneOf(['day', 'week', 'month', 'quarter', 'year', 'all']),
  onTimeframeChange: PropTypes.func,
  onTopicSelect: PropTypes.func
};

export default TrendingTopicsTimeline;
