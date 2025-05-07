import React, { useState, useEffect } from 'react';
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
  TextField,
  Button,
  IconButton,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Alert,
  Autocomplete,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Help as HelpIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { 
  AWARENESS_PHASES, 
  classifyAndGroupByAwarenessPhase,
  calculateAwarenessDistribution,
  generateAwarenessRecommendations
} from '../../utils/insights/awarenessClassification';
import AwarenessDistributionChart from './AwarenessDistributionChart';
import ExportButton from '../export/ExportButton';
import ContextualTooltip from '../help/ContextualTooltip';

/**
 * Awareness Dashboard Component
 * Integreert de 5 awareness fasen van Eugene Schwartz in een dashboard
 */
const AwarenessDashboard = ({ 
  data, 
  projectName, 
  isLoading = false,
  error = null,
  productName = '',
  industrie = '',
  onRefresh = null
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [filters, setFilters] = useState({
    platform: 'all',
    dateRange: 'all',
    keyword: '',
    phase: 'all'
  });
  const [filteredData, setFilteredData] = useState(data);
  const [groupedItems, setGroupedItems] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  
  // Effect voor het extraheren van platforms uit data
  useEffect(() => {
    if (data && data.length > 0) {
      const uniquePlatforms = [...new Set(data.map(item => item.platform || 'unknown'))];
      setPlatforms(['all', ...uniquePlatforms]);
    }
  }, [data]);
  
  // Effect voor het filteren van data
  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
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
    
    // Filter op awareness fase
    if (filters.phase !== 'all') {
      const grouped = classifyAndGroupByAwarenessPhase(result, 'text');
      result = grouped[filters.phase] || [];
    }
    
    setFilteredData(result);
  }, [data, filters]);
  
  // Effect voor het groeperen van items op awareness fase
  useEffect(() => {
    const grouped = classifyAndGroupByAwarenessPhase(filteredData, 'text');
    setGroupedItems(grouped);
  }, [filteredData]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle phase select
  const handlePhaseSelect = (phase) => {
    setSelectedPhase(phase);
    
    // Update filter op basis van geselecteerde fase
    if (phase) {
      setFilters(prev => ({ ...prev, phase: phase.id }));
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };
  
  // Bereken awareness distributie
  const distribution = calculateAwarenessDistribution(groupedItems);
  
  // Bereid export data voor
  const exportData = distribution.map(phase => ({
    Fase: phase.name,
    Beschrijving: phase.description,
    Aantal: phase.count,
    Percentage: `${phase.percentage.toFixed(1)}%`
  }));
  
  // Bereid export secties voor
  const exportSections = [
    {
      id: 'overview',
      title: 'Awareness Fasen Overzicht',
      type: 'text',
      content: `Dit rapport toont de verdeling van content over de 5 awareness fasen van Eugene Schwartz voor project: ${projectName}.
      
De awareness fasen zijn:
1. Unaware - Geen bewustzijn van het probleem
2. Problem Aware - Bewust van het probleem, niet van oplossingen
3. Solution Aware - Bewust van oplossingstypen, niet van specifieke producten
4. Product Aware - Bewust van specifieke producten, nog niet overtuigd
5. Most Aware - Volledig bewust, klaar voor aankoop

Totaal aantal geanalyseerde items: ${filteredData.length}
Dominante fase: ${distribution.sort((a, b) => b.percentage - a.percentage)[0].name} (${distribution.sort((a, b) => b.percentage - a.percentage)[0].percentage.toFixed(1)}%)
      `
    },
    {
      id: 'distribution',
      title: 'Awareness Fasen Distributie',
      type: 'table',
      headers: ['Fase', 'Beschrijving', 'Aantal', 'Percentage'],
      data: exportData
    },
    {
      id: 'recommendations',
      title: 'Marketing Aanbevelingen',
      type: 'text',
      content: selectedPhase ? 
        `Aanbevelingen voor ${selectedPhase.name} fase:
        
${generateAwarenessRecommendations(selectedPhase.id, {
  productName: productName || 'uw product',
  industrie: industrie || 'uw industrie'
}).headline}

Content Focus:
${generateAwarenessRecommendations(selectedPhase.id, {
  productName: productName || 'uw product',
  industrie: industrie || 'uw industrie'
}).contentFocus.map(item => `- ${item}`).join('\n')}

Marketing Channels:
${generateAwarenessRecommendations(selectedPhase.id, {
  productName: productName || 'uw product',
  industrie: industrie || 'uw industrie'
}).marketingChannels.map(item => `- ${item}`).join('\n')}

Call to Action:
${generateAwarenessRecommendations(selectedPhase.id, {
  productName: productName || 'uw product',
  industrie: industrie || 'uw industrie'
}).callToAction}

Content Examples:
${generateAwarenessRecommendations(selectedPhase.id, {
  productName: productName || 'uw product',
  industrie: industrie || 'uw industrie'
}).contentExamples.map(item => `- ${item}`).join('\n')}` : 
        'Selecteer een awareness fase om aanbevelingen te zien.'
    }
  ];
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Awareness Fasen Dashboard
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
            contentType="awareness"
            title="Exporteer"
            pdfTitle="Awareness Fasen Analyse"
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
              <Autocomplete
                options={platforms}
                value={filters.platform}
                onChange={(event, newValue) => handleFilterChange('platform', newValue || 'all')}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Platform" 
                    size="small" 
                    fullWidth
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={['all', ...Object.values(AWARENESS_PHASES).map(phase => phase.id)]}
                value={filters.phase}
                onChange={(event, newValue) => handleFilterChange('phase', newValue || 'all')}
                getOptionLabel={(option) => {
                  if (option === 'all') return 'Alle fasen';
                  const phase = Object.values(AWARENESS_PHASES).find(p => p.id === option);
                  return phase ? phase.name : option;
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Awareness Fase" 
                    size="small" 
                    fullWidth
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={['all', 'today', 'week', 'month', 'year']}
                value={filters.dateRange}
                onChange={(event, newValue) => handleFilterChange('dateRange', newValue || 'all')}
                getOptionLabel={(option) => {
                  const labels = {
                    all: 'Alle tijd',
                    today: 'Vandaag',
                    week: 'Deze week',
                    month: 'Deze maand',
                    year: 'Dit jaar'
                  };
                  return labels[option] || option;
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Periode" 
                    size="small" 
                    fullWidth
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                label="Zoekwoord"
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton 
                      size="small" 
                      onClick={() => handleFilterChange('keyword', '')}
                      sx={{ visibility: filters.keyword ? 'visible' : 'hidden' }}
                    >
                      {filters.keyword ? 'x' : <SearchIcon />}
                    </IconButton>
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
                phase: 'all'
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
                    Dominante Fase
                  </Typography>
                  <Typography variant="h4">
                    {distribution.length > 0 ? 
                      distribution.sort((a, b) => b.percentage - a.percentage)[0].name : 
                      'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {distribution.length > 0 ? 
                      `${distribution.sort((a, b) => b.percentage - a.percentage)[0].percentage.toFixed(1)}% van items` : 
                      'Geen data'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Awareness Score
                  </Typography>
                  <Typography variant="h4">
                    {distribution.length > 0 ? 
                      (distribution.reduce((acc, phase) => acc + (phase.index * phase.percentage), 0) / 100).toFixed(1) : 
                      'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Schaal 0-4 (hoger = meer bewust)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Conversie Potentieel
                  </Typography>
                  <Typography variant="h4">
                    {distribution.length > 0 ? 
                      `${(distribution.find(p => p.id === AWARENESS_PHASES.PRODUCT_AWARE.id)?.percentage || 0 + 
                      distribution.find(p => p.id === AWARENESS_PHASES.MOST_AWARE.id)?.percentage || 0).toFixed(1)}%` : 
                      'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Product Aware + Most Aware
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
            >
              <ContextualTooltip
                title="Awareness Overzicht"
                content="Bekijk de verdeling van uw doelgroep over de 5 awareness fasen van Eugene Schwartz. Deze weergave toont de algemene verdeling en belangrijkste statistieken."
                placement="bottom"
              >
                <Tab label="Overzicht" icon={<BarChartIcon />} iconPosition="start" />
              </ContextualTooltip>
              <ContextualTooltip
                title="Awareness Insights"
                content="Bekijk gedetailleerde inzichten per awareness fase. Hier vindt u voorbeelden van content uit elke fase en kunt u specifieke fasen analyseren."
                placement="bottom"
              >
                <Tab label="Insights" icon={<LightbulbIcon />} iconPosition="start" />
              </ContextualTooltip>
              <ContextualTooltip
                title="Marketing Aanbevelingen"
                content="Ontvang specifieke marketingaanbevelingen op basis van de awareness fasen van uw doelgroep. Deze aanbevelingen helpen u uw boodschap aan te passen aan het bewustzijnsniveau."
                placement="bottom"
              >
                <Tab label="Aanbevelingen" icon={<AssignmentIcon />} iconPosition="start" />
              </ContextualTooltip>
              <ContextualTooltip
                title="Awareness Trends"
                content="Bekijk hoe de awareness fasen van uw doelgroep veranderen over tijd. Deze weergave helpt u de effectiviteit van uw marketing te meten."
                placement="bottom"
              >
                <Tab label="Trends" icon={<TrendingUpIcon />} iconPosition="start" />
              </ContextualTooltip>
            </Tabs>
          </Box>
          {/* Awareness Analyse Tab */}
          {activeTab === 0 && (
            <AwarenessDistributionChart
              groupedItems={groupedItems}
              projectName={projectName}
              productName={productName}
              industrie={industrie}
              onPhaseSelect={handlePhaseSelect}
            />
          )}
          
          {/* Content per Fase Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {Object.entries(AWARENESS_PHASES).map(([key, phase]) => {
                const items = groupedItems[phase.id] || [];
                return (
                  <Grid item xs={12} key={phase.id}>
                    <Card variant="outlined">
                      <CardHeader
                        title={
                          <Box display="flex" alignItems="center">
                            <Typography variant="subtitle1">
                              {phase.name}
                            </Typography>
                            <Chip 
                              label={`${items.length} items`} 
                              size="small" 
                              sx={{ ml: 1 }}
                              color={items.length > 0 ? "primary" : "default"}
                              variant={items.length > 0 ? "filled" : "outlined"}
                            />
                          </Box>
                        }
                        subheader={phase.description}
                        sx={{ 
                          bgcolor: `${phase.color}10`,
                          borderBottom: `1px solid ${phase.color}`
                        }}
                      />
                      <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {items.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                            Geen items in deze fase
                          </Typography>
                        ) : (
                          <Grid container spacing={2}>
                            {items.slice(0, 6).map((item, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 2, 
                                    height: '100%',
                                    '&:hover': {
                                      borderColor: phase.color,
                                      boxShadow: 1
                                    }
                                  }}
                                >
                                  {item.platform && (
                                    <Chip 
                                      label={item.platform} 
                                      size="small" 
                                      sx={{ mb: 1 }}
                                    />
                                  )}
                                  
                                  {item.title && (
                                    <Typography variant="subtitle2" gutterBottom>
                                      {item.title.length > 60 ? `${item.title.substring(0, 60)}...` : item.title}
                                    </Typography>
                                  )}
                                  
                                  <Typography variant="body2" color="text.secondary">
                                    {item.text.length > 150 ? `${item.text.substring(0, 150)}...` : item.text}
                                  </Typography>
                                  
                                  {item.date && (
                                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                      {new Date(item.date).toLocaleDateString()}
                                    </Typography>
                                  )}
                                </Paper>
                              </Grid>
                            ))}
                            
                            {items.length > 6 && (
                              <Grid item xs={12}>
                                <Box textAlign="center" mt={1}>
                                  <Button 
                                    variant="text" 
                                    size="small"
                                    sx={{ color: phase.color }}
                                  >
                                    Toon alle {items.length} items
                                  </Button>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
          
          {/* Aanbevelingen Tab */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardHeader
                    title="Fase Selectie"
                    subheader="Selecteer een fase voor aanbevelingen"
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      {Object.entries(AWARENESS_PHASES).map(([key, phase]) => {
                        const items = groupedItems[phase.id] || [];
                        const percentage = distribution.find(d => d.id === phase.id)?.percentage || 0;
                        
                        return (
                          <Grid item xs={12} key={phase.id}>
                            <Button
                              variant={selectedPhase?.id === phase.id ? "contained" : "outlined"}
                              fullWidth
                              onClick={() => handlePhaseSelect(phase)}
                              sx={{ 
                                justifyContent: 'flex-start',
                                borderColor: phase.color,
                                color: selectedPhase?.id === phase.id ? '#fff' : phase.color,
                                bgcolor: selectedPhase?.id === phase.id ? phase.color : 'transparent',
                                '&:hover': {
                                  bgcolor: selectedPhase?.id === phase.id ? phase.color : `${phase.color}10`
                                }
                              }}
                            >
                              <Box width="100%" display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2">
                                  {phase.name}
                                </Typography>
                                <Chip 
                                  label={`${percentage.toFixed(1)}%`} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: selectedPhase?.id === phase.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    border: selectedPhase?.id === phase.id ? 'none' : `1px solid ${phase.color}`,
                                    color: selectedPhase?.id === phase.id ? '#fff' : phase.color
                                  }} 
                                />
                              </Box>
                            </Button>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                {selectedPhase ? (
                  <Card>
                    <CardHeader
                      title={`Aanbevelingen voor ${selectedPhase.name} Fase`}
                      subheader={selectedPhase.description}
                      sx={{ 
                        bgcolor: `${selectedPhase.color}10`,
                        borderBottom: `1px solid ${selectedPhase.color}`
                      }}
                    />
                    <CardContent>
                      {(() => {
                        const recommendations = generateAwarenessRecommendations(selectedPhase.id, {
                          productName: productName || 'uw product',
                          industrie: industrie || 'uw industrie'
                        });
                        
                        return (
                          <>
                            <Typography variant="h6" gutterBottom>
                              {recommendations.headline}
                            </Typography>
                            
                            <Grid container spacing={3} mt={1}>
                              <Grid item xs={12} md={6}>
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
                              </Grid>
                              
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Aanbevolen Marketing Kanalen
                                </Typography>
                                <Box component="ul" pl={2}>
                                  {recommendations.marketingChannels.map((item, index) => (
                                    <Typography component="li" variant="body2" key={index} gutterBottom>
                                      {item}
                                    </Typography>
                                  ))}
                                </Box>
                              </Grid>
                            </Grid>
                            
                            <Box mt={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                              <Typography variant="subtitle2" gutterBottom>
                                Call to Action
                              </Typography>
                              <Typography variant="body1" color="primary.main" fontWeight="medium">
                                "{recommendations.callToAction}"
                              </Typography>
                            </Box>
                            
                            <Typography variant="subtitle2" gutterBottom mt={3}>
                              Content Voorbeelden
                            </Typography>
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
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ) : (
                  <Card sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CardContent>
                      <Box textAlign="center" py={5}>
                        <LightbulbIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                        <ContextualTooltip
                          title="Aanbevolen Boodschap"
                          content="Dit is de aanbevolen boodschap voor deze awareness fase. Deze boodschap is specifiek ontworpen om effectief te communiceren met uw doelgroep in deze fase."
                          placement="top-start"
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            Aanbevolen Boodschap
                          </Typography>
                        </ContextualTooltip>
                        <Typography variant="body2" color="text.secondary">
                          Kies een fase aan de linkerkant om marketingaanbevelingen te zien
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>
          )}
          
          {/* Trends Tab */}
          {activeTab === 3 && (
            <Card>
              <CardContent>
                <Box textAlign="center" py={5}>
                  <TrendingUpIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Awareness Trends
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Deze functionaliteit is in ontwikkeling
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hier zullen trends in awareness fasen over tijd worden weergegeven
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

AwarenessDashboard.propTypes = {
  data: PropTypes.array.isRequired,
  projectName: PropTypes.string,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  productName: PropTypes.string,
  industrie: PropTypes.string,
  onRefresh: PropTypes.func
};

export default AwarenessDashboard;
