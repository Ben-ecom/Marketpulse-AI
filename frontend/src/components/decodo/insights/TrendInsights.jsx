import React, { forwardRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import TextGradient from '../../ui/TextGradient';
import GradientBackground from '../../ui/GradientBackground';
import { TagCloud } from 'react-tagcloud';
import { scaleLinear } from 'd3-scale';

// Styles
import '../../../styles/visualizations.css';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Chip,
  Tooltip as MuiTooltip,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Zoom
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetZoomIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  ReferenceArea,
  Brush
} from 'recharts';

/**
 * TrendInsights Component
 * Visualiseert trend inzichten uit de Decodo API scraping resultaten
 * Verbeterd met interactieve elementen, animaties en een wordcloud visualisatie
 */
const TrendInsights = forwardRef(function TrendInsights({ insights, platforms }, ref) {
  // State voor zoom functionaliteit
  const [zoomState, setZoomState] = useState({
    refAreaLeft: '',
    refAreaRight: '',
    left: 'dataMin',
    right: 'dataMax',
    top: 'dataMax+10',
    bottom: 'dataMin-10',
    animation: true
  });
  
  // State voor vergelijkingsmodus
  const [compareMode, setCompareMode] = useState('none'); // 'none', 'platforms', 'periods'
  
  // State voor geselecteerde platforms voor vergelijking
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  
  // State voor geselecteerde periode voor vergelijking
  const [selectedPeriod, setSelectedPeriod] = useState('current'); // 'current', 'previous', 'year_ago'
  
  // State voor animaties
  const [animationKey, setAnimationKey] = useState(0);
  
  // State voor historische data (voor periodieke vergelijking)
  const [historicalData, setHistoricalData] = useState({
    previous: [],
    year_ago: []
  });
  // Als er geen inzichten zijn, toon een placeholder
  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardContent>
          <TextGradient variant="subtitle1" align="center" gutterBottom>
            Trend Ontwikkeling
          </TextGradient>
        </CardContent>
      </Card>
    );
  }

  // Vind het algemene trend inzicht (zonder platform)
  const overallInsight = insights.find(insight => !insight.platform);
  
  // Vind platform-specifieke inzichten
  const platformInsights = insights.filter(insight => insight.platform);

  // Bereid data voor voor de tijdreeks grafiek
  const prepareTimeSeriesData = (timeSeriesData) => {
    if (!timeSeriesData) return [];
    
    return Object.entries(timeSeriesData).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Bereid data voor voor de platform vergelijking grafiek
  const preparePlatformComparisonData = () => {
    if (!overallInsight || !overallInsight.data.platform_distribution) return [];
    
    return overallInsight.data.platform_distribution.map(item => ({
      platform: item.platform,
      count: item.count,
      percentage: item.percentage
    }));
  };

  // Formatteert een datum voor weergave
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { 
      day: 'numeric', 
      month: 'short'
    });
  };
  
  // Zoom functionaliteit
  const handleZoomIn = () => {
    if (zoomState.left === 'dataMin' && zoomState.right === 'dataMax') {
      // Als we nog niet gezoomd hebben, zoom in op het midden
      const data = overallInsight?.data?.trend_data || [];
      if (data.length > 0) {
        const middleIndex = Math.floor(data.length / 2);
        const quarterIndex = Math.floor(data.length / 4);
        setZoomState({
          ...zoomState,
          left: quarterIndex,
          right: middleIndex + quarterIndex
        });
      }
    } else {
      // Anders, zoom verder in
      const left = typeof zoomState.left === 'number' ? zoomState.left : 0;
      const right = typeof zoomState.right === 'number' ? zoomState.right : 100;
      const range = right - left;
      const newLeft = left + range / 4;
      const newRight = right - range / 4;
      setZoomState({
        ...zoomState,
        left: newLeft,
        right: newRight
      });
    }
  };
  
  const handleZoomOut = () => {
    setZoomState({
      ...zoomState,
      left: 'dataMin',
      right: 'dataMax',
      top: 'dataMax+10',
      bottom: 'dataMin-10'
    });
  };
  
  // Zoom door te slepen op de grafiek
  const handleMouseDown = useCallback((e) => {
    if (!e) return;
    setZoomState({
      ...zoomState,
      refAreaLeft: e.activeLabel
    });
  }, [zoomState]);
  
  const handleMouseMove = useCallback((e) => {
    if (!e) return;
    if (zoomState.refAreaLeft) {
      setZoomState({
        ...zoomState,
        refAreaRight: e.activeLabel
      });
    }
  }, [zoomState]);
  
  const handleMouseUp = useCallback(() => {
    if (zoomState.refAreaLeft === zoomState.refAreaRight || !zoomState.refAreaRight) {
      setZoomState({
        ...zoomState,
        refAreaLeft: '',
        refAreaRight: ''
      });
      return;
    }
    
    // xAxis domain
    let left = zoomState.refAreaLeft;
    let right = zoomState.refAreaRight;
    
    if (left > right) {
      [left, right] = [right, left];
    }
    
    setZoomState({
      ...zoomState,
      refAreaLeft: '',
      refAreaRight: '',
      left,
      right
    });
  }, [zoomState]);
  
  // Vergelijkingsmodus wijzigen
  const handleCompareModeChange = (event, newMode) => {
    if (newMode !== null) {
      setCompareMode(newMode);
    }
  };
  
  // Geselecteerde platforms wijzigen
  const handlePlatformSelection = (platform) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platform)) {
        return prev.filter(p => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };
  
  // Geselecteerde periode wijzigen
  const handlePeriodSelection = (period) => {
    setSelectedPeriod(period);
    
    // Trigger animatie bij wijziging van periode
    setAnimationKey(prevKey => prevKey + 1);
    
    // Simuleer het ophalen van historische data
    // In een echte implementatie zou dit data uit de API halen
    if (period !== 'current' && historicalData[period].length === 0) {
      simulateHistoricalData(period);
    }
  };
  
  // Simuleer historische data voor vergelijking
  const simulateHistoricalData = (period) => {
    if (!overallInsight || !overallInsight.data || !overallInsight.data.trend_data) {
      return;
    }
    
    const currentData = overallInsight.data.trend_data;
    let simulatedData = [];
    
    // Maak een kopie van de huidige data en pas deze aan voor de geselecteerde periode
    if (period === 'previous') {
      // Vorige periode (verschuif data 30 dagen terug)
      simulatedData = currentData.map(item => ({
        ...item,
        date: new Date(new Date(item.date).setDate(new Date(item.date).getDate() - 30)).toISOString(),
        value: item.value * (0.8 + Math.random() * 0.4) // 80-120% van huidige waarde
      }));
    } else if (period === 'year_ago') {
      // Jaar geleden (verschuif data 365 dagen terug)
      simulatedData = currentData.map(item => ({
        ...item,
        date: new Date(new Date(item.date).setDate(new Date(item.date).getDate() - 365)).toISOString(),
        value: item.value * (0.6 + Math.random() * 0.6) // 60-120% van huidige waarde
      }));
    }
    
    setHistoricalData(prevData => ({
      ...prevData,
      [period]: simulatedData
    }));
  };
  
  // Genereer data voor de wordcloud
  const generateWordcloudData = () => {
    if (!overallInsight || !overallInsight.data || !overallInsight.data.keywords) {
      return [];
    }
    
    return overallInsight.data.keywords.map(keyword => ({
      value: keyword.term,
      count: keyword.frequency
    }));
  };
  
  // Custom renderer voor wordcloud tags
  const customRenderer = (tag, size, color) => {
    return (
      <span
        key={tag.value}
        style={{
          fontSize: `${size}px`,
          color,
          margin: '3px',
          padding: '3px',
          display: 'inline-block',
          cursor: 'pointer'
        }}
        className="wordcloud-tag"
        title={`${tag.value}: ${tag.count} vermeldingen`}
      >
        {tag.value}
      </span>
    );
  };

  // Rendert een trend icoon op basis van de trend richting
  const renderTrendIcon = (trendDirection) => {
    switch (trendDirection) {
      case 'increasing':
        return <TrendingUpIcon color="success" />;
      case 'decreasing':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="action" />;
    }
  };

  // Rendert een kleur op basis van de trend richting
  const getTrendColor = (trendDirection) => {
    switch (trendDirection) {
      case 'increasing':
        return '#4caf50';
      case 'decreasing':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  // Rendert een label op basis van de trend richting
  const getTrendLabel = (trendDirection) => {
    switch (trendDirection) {
      case 'increasing':
        return 'Stijgend';
      case 'decreasing':
        return 'Dalend';
      default:
        return 'Stabiel';
    }
  };

  return (
    <Box>
      {/* Algemeen overzicht */}
      {overallInsight && (
        <Card sx={{ mb: 3, overflow: 'hidden' }}>
          <GradientBackground>
            <CardHeader 
              title={<TextGradient variant="h6">Algemene Trend</TextGradient>} 
              subheader={`${formatDate(overallInsight.period_start)} - ${formatDate(overallInsight.period_end)}`}
              sx={{ p: 3 }}
            />
            <Divider />
          </GradientBackground>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              {renderTrendIcon(overallInsight.data.trend_direction)}
              <Typography variant="h6" ml={1}>
                {getTrendLabel(overallInsight.data.trend_direction)}
              </Typography>
              <Chip 
                label={`${overallInsight.data.total_results} resultaten`}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Typography variant="body1" paragraph>
              {overallInsight.description}
            </Typography>
            
            {/* Tijdreeks grafiek */}
            <Box height={300} mt={3} ref={ref}>
              <Box className="zoom-controls">
                <MuiTooltip title="Zoom in">
                  <IconButton size="small" onClick={handleZoomIn} className="zoom-button">
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </MuiTooltip>
                <MuiTooltip title="Zoom out">
                  <IconButton size="small" onClick={handleZoomOut} className="zoom-button">
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </MuiTooltip>
                <MuiTooltip title="Vergelijken">
                  <ToggleButtonGroup
                    size="small"
                    value={compareMode}
                    exclusive
                    onChange={handleCompareModeChange}
                    aria-label="vergelijkingsmodus"
                    sx={{ ml: 2 }}
                  >
                    <ToggleButton value="platforms" aria-label="platforms vergelijken">
                      Platforms
                    </ToggleButton>
                    <ToggleButton value="periods" aria-label="periodes vergelijken">
                      Periodes
                    </ToggleButton>
                  </ToggleButtonGroup>
                </MuiTooltip>
              </Box>
              
              {compareMode === 'platforms' && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  {platforms.map(platform => (
                    <Chip
                      key={platform}
                      label={platform}
                      onClick={() => handlePlatformSelection(platform)}
                      color={selectedPlatforms.includes(platform) ? "primary" : "default"}
                      variant={selectedPlatforms.includes(platform) ? "filled" : "outlined"}
                      className="platform-chip"
                    />
                  ))}
                </Box>
              )}
              
              {compareMode === 'periods' && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Chip
                    label="Huidige periode"
                    onClick={() => handlePeriodSelection('current')}
                    color={selectedPeriod === 'current' ? "primary" : "default"}
                    variant={selectedPeriod === 'current' ? "filled" : "outlined"}
                    className="period-chip"
                  />
                  <Chip
                    label="Vorige periode"
                    onClick={() => handlePeriodSelection('previous')}
                    color={selectedPeriod === 'previous' ? "primary" : "default"}
                    variant={selectedPeriod === 'previous' ? "filled" : "outlined"}
                    className="period-chip"
                  />
                  <Chip
                    label="Jaar geleden"
                    onClick={() => handlePeriodSelection('year_ago')}
                    color={selectedPeriod === 'year_ago' ? "primary" : "default"}
                    variant={selectedPeriod === 'year_ago' ? "filled" : "outlined"}
                    className="period-chip"
                  />
                </Box>
              )}
              
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={overallInsight.data.trend_data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => formatDate(date)} 
                    domain={[zoomState.left, zoomState.right]}
                    allowDataOverflow
                  />
                  <YAxis 
                    domain={[zoomState.bottom, zoomState.top]}
                    allowDataOverflow
                  />
                  <Tooltip 
                    labelFormatter={(date) => formatDate(date)}
                    formatter={(value, name) => [
                      `${value.toFixed(2)}`, 
                      name === 'Trend Waarde' ? 'Trend Waarde' : name
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #e0e0e0'
                    }}
                    wrapperClassName="custom-tooltip"
                  />
                  <Legend />
                  
                  {/* Referentiegebied voor zoom */}
                  {zoomState.refAreaLeft && zoomState.refAreaRight ? (
                    <ReferenceArea
                      x1={zoomState.refAreaLeft}
                      x2={zoomState.refAreaRight}
                      strokeOpacity={0.3}
                      fill="#00ADAD"
                      fillOpacity={0.3}
                    />
                  ) : null}
                  
                  {/* Hoofdlijn voor trend waarde */}
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name="Trend Waarde" 
                    stroke="#00ADAD" 
                    strokeWidth={2}
                    activeDot={{ r: 8, fill: '#00ADAD', stroke: '#fff', strokeWidth: 2 }}
                    dot={{ r: 3, fill: '#00ADAD', stroke: '#fff', strokeWidth: 1 }}
                    isAnimationActive={zoomState.animation}
                    animationDuration={500}
                    animationEasing="ease-in-out"
                  />
                  
                  {/* Vergelijkingslijnen voor platforms */}
                  {compareMode === 'platforms' && selectedPlatforms.map((platform, index) => {
                    const platformData = platformInsights.find(insight => insight.platform === platform);
                    if (platformData && platformData.data && platformData.data.trend_data) {
                      return (
                        <Line 
                          key={`${platform}-${animationKey}`}
                          type="monotone" 
                          data={platformData.data.trend_data}
                          dataKey="value" 
                          name={platform} 
                          stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`} 
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                          dot={{ r: 2 }}
                          isAnimationActive={zoomState.animation}
                          animationDuration={500}
                          animationEasing="ease-in-out"
                        />
                      );
                    }
                    return null;
                  })}
                  
                  {/* Vergelijkingslijnen voor periodes */}
                  {compareMode === 'periods' && selectedPeriod !== 'current' && historicalData[selectedPeriod].length > 0 && (
                    <Line 
                      key={`${selectedPeriod}-${animationKey}`}
                      type="monotone" 
                      data={historicalData[selectedPeriod]}
                      dataKey="value" 
                      name={selectedPeriod === 'previous' ? 'Vorige periode' : 'Jaar geleden'} 
                      stroke={selectedPeriod === 'previous' ? '#FF9800' : '#9C27B0'} 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      activeDot={{ r: 6 }}
                      dot={{ r: 2 }}
                      isAnimationActive={zoomState.animation}
                      animationDuration={500}
                      animationEasing="ease-in-out"
                    />
                  )}
                  
                  {/* Brush voor navigatie */}
                  <Brush 
                    dataKey="date" 
                    height={30} 
                    stroke="#00ADAD"
                    tickFormatter={(date) => formatDate(date)}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Wordcloud visualisatie */}
      {overallInsight && overallInsight.data && overallInsight.data.keywords && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title={<TextGradient variant="h6">Trending Termen</TextGradient>} />
          <Divider />
          <CardContent>
            <Box height={300} className="wordcloud-container">
              <Zoom in={true} style={{ transitionDelay: '300ms' }} key={`wordcloud-${animationKey}`}>
                <Box>
                  <TagCloud
                    minSize={12}
                    maxSize={35}
                    tags={generateWordcloudData()}
                    renderer={customRenderer}
                    colorOptions={{
                      luminosity: 'dark',
                      hue: 'blue',
                    }}
                    canvasProps={{
                      willReadFrequently: true
                    }}
                  />
                </Box>
              </Zoom>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Platform-specifieke trends */}
      {platformInsights.length > 0 && (
        <Card>
          <CardHeader title={<TextGradient variant="h6">Platform Trends</TextGradient>} />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              {platformInsights.map((insight, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card variant="outlined">
                    <CardHeader 
                      title={<TextGradient variant="h6">{insight.platform} Trend</TextGradient>}
                      avatar={renderTrendIcon(insight.data.trend_direction)}
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="body2" paragraph>
                        {insight.description}
                      </Typography>
                      
                      {/* Platform tijdreeks grafiek */}
                      <Box height={200} mt={2}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={insight.data.trend_data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={(date) => formatDate(date)} />
                            <YAxis />
                            <Tooltip 
                              labelFormatter={(date) => formatDate(date)}
                              formatter={(value, name) => [`${value.toFixed(2)}`, name]}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                border: '1px solid #e0e0e0'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              name="Trend Waarde" 
                              stroke="#00ADAD" 
                              dot={{ r: 2 }}
                              isAnimationActive={true}
                              animationDuration={500}
                              animationEasing="ease-in-out"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
});

TrendInsights.propTypes = {
  insights: PropTypes.array.isRequired,
  platforms: PropTypes.array
};

TrendInsights.defaultProps = {
  platforms: []
};

export default TrendInsights;
