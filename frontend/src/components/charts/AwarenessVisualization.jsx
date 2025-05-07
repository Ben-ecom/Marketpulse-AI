import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  Grid,
  Tooltip,
  IconButton,
  useTheme
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Remove as NeutralIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// Utilities
import { 
  transformAwarenessData, 
  getAwarenessPhaseDetails, 
  calculateAwarenessScore,
  transformForTimeline
} from '../../utils/insights/awarenessUtils';

/**
 * AwarenessVisualization Component
 * 
 * Visualiseert de verschillende fasen van de customer journey (AIDA model):
 * - Awareness (Bewustzijn)
 * - Interest (Interesse)
 * - Desire (Verlangen)
 * - Action (Actie)
 * 
 * Biedt verschillende visualisaties zoals:
 * - Fase-overzicht met voortgangsbalken
 * - Tijdlijn van veranderingen in bewustzijn
 * - Vergelijking tussen platforms
 */
const AwarenessVisualization = ({ 
  data, 
  platform = 'all', 
  height = 400, 
  onPhaseClick = () => {} 
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [processedData, setProcessedData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  
  // Verwerk data wanneer deze verandert of wanneer platform verandert
  useEffect(() => {
    if (data) {
      // Verwerk data voor verschillende visualisaties
      const transformedData = transformAwarenessData(data, platform);
      setProcessedData(transformedData);
      
      // Verwerk data voor tijdlijn
      const transformedTimelineData = transformForTimeline(data, platform);
      setTimelineData(transformedTimelineData);
    }
  }, [data, platform]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Bereken totale awareness score
  const awarenessScore = processedData ? calculateAwarenessScore(processedData) : 0;
  
  // Kleurenschema voor fasen
  const phaseColors = {
    awareness: theme.palette.primary.main,
    interest: theme.palette.secondary.main,
    desire: theme.palette.success.main,
    action: theme.palette.error.main
  };
  
  // Trend indicator component
  const TrendIndicator = ({ trend }) => {
    if (trend > 5) {
      return (
        <Tooltip title={`Stijgend (${trend}%)`}>
          <ArrowUpwardIcon color="success" fontSize="small" />
        </Tooltip>
      );
    } else if (trend < -5) {
      return (
        <Tooltip title={`Dalend (${Math.abs(trend)}%)`}>
          <ArrowDownwardIcon color="error" fontSize="small" />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="Stabiel">
          <NeutralIcon color="action" fontSize="small" />
        </Tooltip>
      );
    }
  };
  
  TrendIndicator.propTypes = {
    trend: PropTypes.number.isRequired
  };
  
  // Render fase-overzicht met voortgangsbalken
  const renderPhaseOverview = () => {
    if (!processedData) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Customer Journey Fasen" 
          subheader={`Totale awareness score: ${awarenessScore}%`}
          action={
            <Tooltip title="De customer journey fasen tonen de progressie van je doelgroep door de AIDA-fasen: Awareness (bewustzijn), Interest (interesse), Desire (verlangen) en Action (actie).">
              <IconButton>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <CardContent>
          <Grid container spacing={3}>
            {processedData.map((phase) => (
              <Grid item xs={12} key={phase.name}>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {phase.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {phase.value}%
                    </Typography>
                    <TrendIndicator trend={phase.trend} />
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={phase.value} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: theme.palette.grey[200],
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: phaseColors[phase.name]
                    }
                  }}
                  onClick={() => onPhaseClick(phase)}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {phase.description}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  // Render tijdlijn visualisatie
  const renderTimeline = () => {
    if (!timelineData || timelineData.length === 0) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Awareness Tijdlijn" 
          subheader="Verandering in bewustzijn over tijd"
          action={
            <Tooltip title="Deze grafiek toont hoe het bewustzijn van je doelgroep over je product/dienst verandert over tijd.">
              <IconButton>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <CardContent>
          <Box sx={{ height: height - 100, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="awareness" 
                  name="Bewustzijn" 
                  stroke={phaseColors.awareness} 
                  fill={phaseColors.awareness} 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="interest" 
                  name="Interesse" 
                  stroke={phaseColors.interest} 
                  fill={phaseColors.interest} 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="desire" 
                  name="Verlangen" 
                  stroke={phaseColors.desire} 
                  fill={phaseColors.desire} 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="action" 
                  name="Actie" 
                  stroke={phaseColors.action} 
                  fill={phaseColors.action} 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Render platform vergelijking
  const renderPlatformComparison = () => {
    if (!data || !data.awareness) return null;
    
    // Verwerk data voor platform vergelijking
    const platformData = Object.keys(data.awareness.platforms || {}).map(platform => {
      const platformInfo = data.awareness.platforms[platform];
      return {
        platform,
        awareness: platformInfo.awareness || 0,
        interest: platformInfo.interest || 0,
        desire: platformInfo.desire || 0,
        action: platformInfo.action || 0
      };
    });
    
    return (
      <Card>
        <CardHeader 
          title="Platform Vergelijking" 
          subheader="Customer journey fasen per platform"
          action={
            <Tooltip title="Deze grafiek vergelijkt de customer journey fasen tussen verschillende platforms.">
              <IconButton>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          }
        />
        <CardContent>
          <Box sx={{ height: height - 100, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={platformData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar 
                  dataKey="awareness" 
                  name="Bewustzijn" 
                  fill={phaseColors.awareness} 
                />
                <Bar 
                  dataKey="interest" 
                  name="Interesse" 
                  fill={phaseColors.interest} 
                />
                <Bar 
                  dataKey="desire" 
                  name="Verlangen" 
                  fill={phaseColors.desire} 
                />
                <Bar 
                  dataKey="action" 
                  name="Actie" 
                  fill={phaseColors.action} 
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Render component
  return (
    <Box>
      {/* Tabs voor verschillende visualisaties */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="scrollable" 
        scrollButtons="auto" 
        sx={{ mb: 2 }}
      >
        <Tab label="Fase Overzicht" />
        <Tab label="Tijdlijn" />
        <Tab label="Platform Vergelijking" />
      </Tabs>
      
      {/* Visualisatie op basis van geselecteerde tab */}
      {activeTab === 0 && renderPhaseOverview()}
      {activeTab === 1 && renderTimeline()}
      {activeTab === 2 && renderPlatformComparison()}
      
      {/* Fallback voor ontbrekende data */}
      {!data && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Geen data beschikbaar voor visualisatie.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

AwarenessVisualization.propTypes = {
  data: PropTypes.object,
  platform: PropTypes.string,
  height: PropTypes.number,
  onPhaseClick: PropTypes.func
};

export default AwarenessVisualization;
