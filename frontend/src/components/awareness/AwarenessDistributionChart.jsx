import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  Button,
  Tooltip,
  IconButton,
  Chip
} from '@mui/material';
import {
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Lightbulb as LightbulbIcon,
  Help as HelpIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { AWARENESS_PHASES, calculateAwarenessDistribution, generateAwarenessRecommendations, generateCustomerJourneyMap } from '../../utils/insights/awarenessClassification';
import ExportButton from '../export/ExportButton';
import ContextualTooltip from '../help/ContextualTooltip';

// Registreer ChartJS componenten
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

/**
 * Component voor het visualiseren van de awareness fasen distributie
 */
const AwarenessDistributionChart = ({ 
  groupedItems, 
  projectName, 
  productName = '', 
  industrie = '',
  onPhaseSelect = null
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [journeyMap, setJourneyMap] = useState(null);
  const chartRef = useRef(null);
  
  // Bereken awareness distributie
  const distribution = calculateAwarenessDistribution(groupedItems);
  
  // Bereken de dominante fase (fase met hoogste percentage)
  const dominantPhase = distribution.reduce((prev, current) => 
    (prev.percentage > current.percentage) ? prev : current, 
    { percentage: 0 }
  );
  
  // Bereid data voor voor pie chart
  const pieChartData = {
    labels: distribution.map(phase => phase.name),
    datasets: [
      {
        data: distribution.map(phase => phase.percentage),
        backgroundColor: distribution.map(phase => phase.color),
        borderColor: distribution.map(phase => phase.color),
        borderWidth: 1,
      },
    ],
  };
  
  // Bereid data voor voor bar chart
  const barChartData = {
    labels: distribution.map(phase => phase.name),
    datasets: [
      {
        label: 'Aantal items',
        data: distribution.map(phase => phase.count),
        backgroundColor: distribution.map(phase => phase.color),
        borderColor: distribution.map(phase => phase.color),
        borderWidth: 1,
      },
    ],
  };
  
  // Opties voor pie chart
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    }
  };
  
  // Opties voor bar chart
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Aantal items per awareness fase'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  // Effect voor het genereren van aanbevelingen en journey map
  useEffect(() => {
    if (selectedPhase) {
      const phaseId = selectedPhase.id;
      
      // Genereer aanbevelingen
      const newRecommendations = generateAwarenessRecommendations(phaseId, {
        productName: productName || 'uw product',
        industrie: industrie || 'uw industrie',
        problemStatement: ''
      });
      
      setRecommendations(newRecommendations);
      
      // Genereer journey map
      const newJourneyMap = generateCustomerJourneyMap(distribution, {
        productName: productName || 'uw product',
        industrie: industrie || 'uw industrie'
      });
      
      setJourneyMap(newJourneyMap);
    }
  }, [selectedPhase, productName, industrie, distribution]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle phase click
  const handlePhaseClick = (phase) => {
    setSelectedPhase(phase);
    
    if (onPhaseSelect) {
      onPhaseSelect(phase);
    }
  };
  
  // Functie om specifieke tooltip content te genereren voor elke fase
  const getPhaseTooltipContent = (phaseId) => {
    switch(phaseId) {
      case AWARENESS_PHASES.UNAWARE.id:
        return 'heeft uw doelgroep nog geen bewustzijn van het probleem dat uw product oplost. Focus op het creëren van bewustzijn over het probleem en de gevolgen ervan.';
      case AWARENESS_PHASES.PROBLEM_AWARE.id:
        return 'is uw doelgroep zich bewust van het probleem, maar weet nog niet welke oplossingen er zijn. Focus op het educeren over mogelijke oplossingsrichtingen.';
      case AWARENESS_PHASES.SOLUTION_AWARE.id:
        return 'kent uw doelgroep de mogelijke oplossingstypen, maar niet de specifieke producten. Focus op waarom uw productcategorie de beste oplossing is.';
      case AWARENESS_PHASES.PRODUCT_AWARE.id:
        return 'kent uw doelgroep uw product, maar is nog niet overtuigd om het te kopen. Focus op waarom uw product beter is dan alternatieven.';
      case AWARENESS_PHASES.MOST_AWARE.id:
        return 'is uw doelgroep volledig bewust van uw product en klaar om te kopen. Focus op het wegnemen van laatste belemmeringen en het stimuleren van actie.';
      default:
        return '';
    }
  };
  
  // Bereid export secties voor
  const exportSections = [
    {
      id: 'distribution',
      title: 'Awareness Distributie',
      type: 'chart',
      chartRef: chartRef,
      data: distribution
    },
    {
      id: 'recommendations',
      title: 'Marketing Aanbevelingen',
      type: 'text',
      content: recommendations ? 
        `${recommendations.headline}\n\nContent Focus:\n${recommendations.contentFocus.map(item => `- ${item}`).join('\n')}\n\nMarketing Channels:\n${recommendations.marketingChannels.map(item => `- ${item}`).join('\n')}\n\nCall to Action:\n${recommendations.callToAction}\n\nContent Examples:\n${recommendations.contentExamples.map(item => `- ${item}`).join('\n')}` : 
        'Selecteer een awareness fase om aanbevelingen te zien.'
    },
    {
      id: 'journey',
      title: 'Customer Journey Map',
      type: 'table',
      headers: ['Fase', 'Percentage', 'Conversie Rate', 'Tijd in Fase', 'Dropoff Rate'],
      data: journeyMap ? 
        journeyMap.phases.map(phase => ({
          'Fase': phase.name,
          'Percentage': `${distribution.find(d => d.id === phase.id)?.percentage.toFixed(1) || 0}%`,
          'Conversie Rate': `${journeyMap.conversionMetrics[phase.id].conversionRate}%`,
          'Tijd in Fase': `${journeyMap.conversionMetrics[phase.id].timeInPhase} dagen`,
          'Dropoff Rate': `${journeyMap.conversionMetrics[phase.id].dropoffRate}%`
        })) : 
        []
    }
  ];
  
  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <ContextualTooltip
          title="Awareness Fasen Distributie"
          content="Deze grafiek toont de verdeling van uw doelgroep over de 5 awareness fasen van Eugene Schwartz. Gebruik deze inzichten om uw marketingstrategie aan te passen aan het bewustzijnsniveau van uw doelgroep."
          placement="bottom-start"
          videoUrl="https://example.com/videos/awareness-distribution.mp4"
          learnMoreUrl="https://docs.example.com/awareness/distribution"
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
            Awareness Fasen Distributie
          </Typography>
        </ContextualTooltip>
        <ContextualTooltip
          title="Exporteer Data"
          content="Exporteer de awareness fasen distributie naar Excel, CSV of PDF formaat voor gebruik in presentaties of rapporten."
          placement="bottom-end"
        >
          <div>
            <ExportButton 
              data={exportData} 
              filename={`${projectName}-awareness-distribution`} 
              label="Exporteer"
            />
          </div>
        </ContextualTooltip>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 0 }}
        >
          <ContextualTooltip
            title="Cirkeldiagram Weergave"
            content="Het cirkeldiagram toont de procentuele verdeling van uw doelgroep over de 5 awareness fasen. Dit helpt u te begrijpen welke fasen dominant zijn."
            placement="bottom"
          >
            <Tab label="Cirkeldiagram" icon={<PieChartIcon />} iconPosition="start" />
          </ContextualTooltip>
          <ContextualTooltip
            title="Staafdiagram Weergave"
            content="Het staafdiagram toont het absolute aantal items in elke awareness fase. Dit geeft u een duidelijk beeld van de hoeveelheid data per fase."
            placement="bottom"
          >
            <Tab label="Staafdiagram" icon={<BarChartIcon />} iconPosition="start" />
          </ContextualTooltip>
          <ContextualTooltip
            title="Customer Journey Weergave"
            content="De customer journey kaart toont de reis van uw klant door de verschillende awareness fasen. Dit helpt u te begrijpen hoe klanten zich bewegen tussen de fasen."
            placement="bottom"
          >
            <Tab label="Customer Journey" icon={<TimelineIcon />} iconPosition="start" />
          </ContextualTooltip>
        </Tabs>
      </Box>
      
      {/* Dominante Fase Indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed', borderColor: dominantPhase.color }}>
        <ContextualTooltip
          title="Dominante Awareness Fase"
          content={`De dominante fase is de fase waarin het grootste deel van uw doelgroep zich bevindt. In dit geval is dat de ${dominantPhase.name} fase met ${dominantPhase.percentage.toFixed(1)}% van de doelgroep. Uw marketingstrategie zou primair op deze fase gericht moeten zijn.`}
          placement="bottom-start"
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1, color: dominantPhase.color }} />
            <Typography variant="body2">
              <strong>Dominante Fase:</strong> {dominantPhase.name} ({dominantPhase.percentage.toFixed(1)}%)
            </Typography>
          </Box>
        </ContextualTooltip>
      </Box>
      
      {/* Distributie Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300, position: 'relative' }}>
            <ContextualTooltip
              title="Interactieve Cirkeldiagram"
              content="Klik op een segment van het diagram om gedetailleerde informatie en aanbevelingen voor die specifieke awareness fase te bekijken. Hover over een segment om het exacte percentage te zien."
              placement="top"
            >
              <Box sx={{ height: '100%', width: '100%' }}>
                <Pie data={pieChartData} options={pieChartOptions} ref={chartRef} />
              </Box>
            </ContextualTooltip>
          </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box height={300}>
              <Bar data={barChartData} options={barChartOptions} />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Awareness Fasen Verdeling
            </Typography>
            
            <Grid container spacing={2} mt={1}>
              {distribution.map((phase) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={phase.id}>
                  <ContextualTooltip
                    title={`${phase.name} Fase`}
                    content={`${phase.description} In deze fase ${getPhaseTooltipContent(phase.id)}`}
                    placement="top"
                    videoUrl={`https://example.com/videos/${phase.id.toLowerCase()}-phase.mp4`}
                    learnMoreUrl={`https://docs.example.com/awareness/${phase.id.toLowerCase()}`}
                  >
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        cursor: 'pointer',
                        borderColor: selectedPhase?.id === phase.id ? phase.color : 'divider',
                        borderWidth: selectedPhase?.id === phase.id ? 2 : 1,
                        bgcolor: selectedPhase?.id === phase.id ? `${phase.color}10` : 'transparent',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: phase.color,
                          bgcolor: `${phase.color}10`
                        }
                      }}
                      onClick={() => handlePhaseClick(phase)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle2" component="div" fontWeight="bold">
                            {phase.name}
                          </Typography>
                          <Chip 
                            label={`${phase.percentage.toFixed(1)}%`} 
                            size="small" 
                            sx={{ 
                              bgcolor: phase.color,
                              color: '#fff'
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {phase.description}
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Typography variant="caption" color="text.secondary">
                            {phase.count} items
                          </Typography>
                          
                          <Tooltip title="Bekijk details">
                            <IconButton size="small" color="primary">
                              <ArrowForwardIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </ContextualTooltip>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}
      
      {/* Aanbevelingen Tab */}
      {activeTab === 1 && (
        <Box>
          {!selectedPhase ? (
            <Box textAlign="center" py={5}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Selecteer een awareness fase om aanbevelingen te zien
              </Typography>
              
              <Grid container spacing={2} mt={2} justifyContent="center">
                {distribution.map((phase) => (
                  <Grid item key={phase.id}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handlePhaseClick(phase)}
                      sx={{ 
                        borderColor: phase.color,
                        color: phase.color,
                        '&:hover': {
                          borderColor: phase.color,
                          bgcolor: `${phase.color}10`
                        }
                      }}
                    >
                      {phase.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : recommendations ? (
            <Box>
              <Box mb={3} p={2} bgcolor={`${selectedPhase.color}10`} borderRadius={1}>
                <Typography variant="h6" gutterBottom sx={{ color: selectedPhase.color }}>
                  {selectedPhase.name} ({selectedPhase.percentage.toFixed(1)}%)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPhase.description}
                </Typography>
              </Box>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardHeader 
                  title="Marketing Strategie" 
                  titleTypographyProps={{ variant: 'subtitle1' }}
                />
                <Divider />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {recommendations.headline}
                  </Typography>
                  
                  <Box mt={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Content Focus
                    </Typography>
                    <Box component="ul" pl={2}>
                      {recommendations.contentFocus.map((item, index) => (
                        <Typography component="li" variant="body2" key={index} gutterBottom>
                          {item}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                  
                  <Box mt={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Aanbevolen Marketing Kanalen
                    </Typography>
                    <Grid container spacing={1} mt={0.5}>
                      {recommendations.marketingChannels.map((channel, index) => (
                        <Grid item key={index}>
                          <Chip label={channel} size="small" />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                  
                  <Box mt={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Call to Action
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                      "{recommendations.callToAction}"
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardHeader 
                  title="Content Voorbeelden" 
                  titleTypographyProps={{ variant: 'subtitle1' }}
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    {recommendations.contentExamples.map((example, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            height: '100%',
                            borderColor: 'divider',
                            '&:hover': {
                              borderColor: selectedPhase.color,
                              boxShadow: 1
                            }
                          }}
                        >
                          <Typography variant="body2">
                            {example}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Box textAlign="center" py={5}>
              <Typography variant="body2" color="text.secondary">
                Laden van aanbevelingen...
              </Typography>
            </Box>
          )}
        </Box>
      )}
      
      {/* Customer Journey Tab */}
      {activeTab === 2 && (
        <Box>
          {!journeyMap ? (
            <Box textAlign="center" py={5}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Selecteer een awareness fase om de customer journey te zien
              </Typography>
              
              <Grid container spacing={2} mt={2} justifyContent="center">
                {distribution.map((phase) => (
                  <Grid item key={phase.id}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handlePhaseClick(phase)}
                      sx={{ 
                        borderColor: phase.color,
                        color: phase.color,
                        '&:hover': {
                          borderColor: phase.color,
                          bgcolor: `${phase.color}10`
                        }
                      }}
                    >
                      {phase.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Box>
              <Box mb={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                <ContextualTooltip
                title="Customer Journey Map"
                content="De customer journey map visualiseert de reis van uw klant door de verschillende awareness fasen. Het toont hoe klanten zich bewegen tussen fasen, welke touchpoints het meest effectief zijn, en welke emoties klanten ervaren in elke fase."
                placement="top-start"
                videoUrl="https://example.com/videos/customer-journey.mp4"
                learnMoreUrl="https://docs.example.com/awareness/customer-journey"
              >
                <Typography variant="h6" gutterBottom>
                  Customer Journey Map
                  <InfoIcon fontSize="small" color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />
                </Typography>
              </ContextualTooltip>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Totale Journey Tijd
                    </Typography>
                    <Typography variant="h6">
                      {journeyMap.totalJourneyTime} dagen
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Overall Conversie
                    </Typography>
                    <Typography variant="h6">
                      {journeyMap.overallConversionRate.toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Dominante Fase
                    </Typography>
                    <Typography variant="h6">
                      {distribution.sort((a, b) => b.percentage - a.percentage)[0].name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">
                      Hoogste Dropoff
                    </Typography>
                    <Typography variant="h6">
                      {Object.entries(journeyMap.conversionMetrics)
                        .sort((a, b) => b[1].dropoffRate - a[1].dropoffRate)[0][0]
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader 
                      title="Journey Flow" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                    />
                    <Divider />
                    <CardContent sx={{ p: 0 }}>
                      <Box display="flex" overflow="auto" p={2}>
                        {journeyMap.phases.map((phase, index) => (
                          <React.Fragment key={phase.id}>
                            <Box 
                              sx={{ 
                                minWidth: 200,
                                p: 2,
                                borderRadius: 1,
                                bgcolor: `${phase.color}10`,
                                border: `1px solid ${phase.color}`
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ color: phase.color }}>
                                {phase.name}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                                {phase.description}
                              </Typography>
                              
                              <Divider sx={{ my: 1 }} />
                              
                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Conversie
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {journeyMap.conversionMetrics[phase.id].conversionRate}%
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Tijd
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {journeyMap.conversionMetrics[phase.id].timeInPhase} dagen
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Dropoff
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {journeyMap.conversionMetrics[phase.id].dropoffRate}%
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary">
                                    Distributie
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {distribution.find(d => d.id === phase.id)?.percentage.toFixed(1) || 0}%
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                            
                            {index < journeyMap.phases.length - 1 && (
                              <Box 
                                display="flex" 
                                alignItems="center" 
                                px={1}
                                sx={{ color: 'text.secondary' }}
                              >
                                <ArrowForwardIcon />
                                <Typography variant="caption" sx={{ ml: 0.5 }}>
                                  {journeyMap.conversionMetrics[phase.id].nextPhaseRate}%
                                </Typography>
                              </Box>
                            )}
                          </React.Fragment>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardHeader 
                      title={
                        <ContextualTooltip
                          title="Content Strategie"
                          content="De content strategie geeft aan welke soorten content het meest effectief zijn voor klanten in deze awareness fase. Gebruik deze aanbevelingen om uw content marketing te optimaliseren."
                          placement="top"
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1">Content Strategie</Typography>
                            <InfoIcon fontSize="small" color="primary" sx={{ ml: 1 }} />
                          </Box>
                        </ContextualTooltip>
                      }
                    />
                    <Divider />
                    <CardContent>
                      {selectedPhase && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Top Touchpoints voor {selectedPhase.name}
                          </Typography>
                          
                          {journeyMap.touchpoints[selectedPhase.id].map((touchpoint, index) => (
                            <Box 
                              key={index} 
                              sx={{ 
                                p: 1.5, 
                                mb: 1, 
                                borderRadius: 1,
                                bgcolor: index === 0 ? `${selectedPhase.color}15` : 'background.paper',
                                border: '1px solid',
                                borderColor: index === 0 ? selectedPhase.color : 'divider'
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight="medium">
                                  {touchpoint.channel}
                                </Typography>
                                <Chip 
                                  label={`${touchpoint.effectiveness}%`} 
                                  size="small" 
                                  color={index === 0 ? "primary" : "default"}
                                  variant={index === 0 ? "filled" : "outlined"}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {touchpoint.content}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardHeader 
                      title="Klant Emoties" 
                      titleTypographyProps={{ variant: 'subtitle1' }}
                    />
                    <Divider />
                    <CardContent>
                      {selectedPhase && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Emoties in {selectedPhase.name} Fase
                          </Typography>
                          
                          {journeyMap.emotions[selectedPhase.id].map((emotion, index) => (
                            <Box key={index} mb={1}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                <Typography variant="body2">
                                  {emotion.emotion}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {emotion.percentage}%
                                </Typography>
                              </Box>
                              <Box 
                                sx={{ 
                                  height: 8, 
                                  width: '100%', 
                                  bgcolor: '#f0f0f0',
                                  borderRadius: 5,
                                  overflow: 'hidden'
                                }}
                              >
                                <Box 
                                  sx={{ 
                                    height: '100%', 
                                    width: `${emotion.percentage}%`,
                                    bgcolor: index === 0 ? selectedPhase.color : `${selectedPhase.color}${90 - (index * 20)}`,
                                    borderRadius: 5
                                  }}
                                />
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

AwarenessDistributionChart.propTypes = {
  groupedItems: PropTypes.object.isRequired,
  projectName: PropTypes.string,
  productName: PropTypes.string,
  industrie: PropTypes.string,
  onPhaseSelect: PropTypes.func
};

export default AwarenessDistributionChart;
