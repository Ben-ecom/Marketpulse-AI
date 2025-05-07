import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// Custom componenten
import DataCard from '../components/ui/DataCard';

const MarketResearch = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [collectingData, setCollectingData] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

  // Kleuren voor grafieken
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Haal marktonderzoeksdata op
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/v1/market-research/${projectId}`);
      
      if (response.data.success && response.data.data.length > 0) {
        setMarketData(response.data.data[0].research_data);
      } else {
        setMarketData(null);
      }
    } catch (error) {
      console.error('Fout bij ophalen marktonderzoeksdata:', error);
      setError('Er is een fout opgetreden bij het ophalen van marktonderzoeksdata.');
    } finally {
      setLoading(false);
    }
  };

  // Verzamel nieuwe marktonderzoeksdata
  const collectMarketData = async () => {
    try {
      setCollectingData(true);
      setError('');
      
      const response = await axios.post(`/api/v1/market-research/${projectId}/collect`);
      
      if (response.data.success) {
        setMarketData(response.data.data);
        // Toon succes melding
        alert('Marktonderzoeksdata succesvol verzameld!');
      }
    } catch (error) {
      console.error('Fout bij verzamelen marktonderzoeksdata:', error);
      setError('Er is een fout opgetreden bij het verzamelen van marktonderzoeksdata.');
    } finally {
      setCollectingData(false);
    }
  };

  // Genereer PDF rapport
  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      setError('');
      
      const response = await axios.get(`/api/v1/market-research/${projectId}/report`);
      
      if (response.data.success) {
        setReportUrl(response.data.reportUrl);
        // Open rapport in nieuw tabblad
        window.open(response.data.reportUrl, '_blank');
      }
    } catch (error) {
      console.error('Fout bij genereren rapport:', error);
      setError('Er is een fout opgetreden bij het genereren van het rapport.');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Haal data op bij laden component
  useEffect(() => {
    fetchMarketData();
  }, [projectId]);

  // Verander van tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Bereken gemiddelde marktgrootte
  const calculateAverageMarketSize = () => {
    if (!marketData || !marketData.marketSize) return 0;
    
    const total = marketData.marketSize.reduce((sum, item) => {
      return sum + item.data.marketSize.value;
    }, 0);
    
    return (total / marketData.marketSize.length).toFixed(2);
  };

  // Bereken gemiddelde groeipercentage
  const calculateAverageGrowthRate = () => {
    if (!marketData || !marketData.marketSize) return 0;
    
    const total = marketData.marketSize.reduce((sum, item) => {
      return sum + item.data.cagr.value;
    }, 0);
    
    return (total / marketData.marketSize.length).toFixed(1);
  };

  // Bereken gemiddelde voorspelling
  const calculateAverageForecast = () => {
    if (!marketData || !marketData.marketSize) return 0;
    
    const total = marketData.marketSize.reduce((sum, item) => {
      return sum + item.data.forecast.value;
    }, 0);
    
    return (total / marketData.marketSize.length).toFixed(2);
  };

  // Genereer data voor marktgrootte grafiek
  const generateMarketSizeChartData = () => {
    if (!marketData || !marketData.marketSize) return [];
    
    return marketData.marketSize.map(item => ({
      name: item.source,
      value: item.data.marketSize.value
    }));
  };

  // Genereer data voor groeipercentage grafiek
  const generateGrowthRateChartData = () => {
    if (!marketData || !marketData.marketSize) return [];
    
    return marketData.marketSize.map(item => ({
      name: item.source,
      value: item.data.cagr.value
    }));
  };

  // Genereer data voor voorspelling grafiek
  const generateForecastChartData = () => {
    if (!marketData || !marketData.marketSize) return [];
    
    return marketData.marketSize.map(item => ({
      name: item.source,
      current: item.data.marketSize.value,
      forecast: item.data.forecast.value
    }));
  };

  // Genereer data voor trends grafiek
  const generateTrendsChartData = () => {
    if (!marketData || !marketData.marketTrends) return [];
    
    // Verzamel alle unieke trends
    const allTrends = [];
    marketData.marketTrends.forEach(source => {
      source.trends.forEach(trend => {
        if (!allTrends.find(t => t.name === trend.name)) {
          allTrends.push({
            name: trend.name,
            value: parseFloat(trend.growthRate.replace('%', ''))
          });
        }
      });
    });
    
    // Sorteer op groeipercentage
    return allTrends.sort((a, b) => b.value - a.value);
  };

  // Render laad indicator
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Marktonderzoek
        </Typography>
        <Box>
          <Tooltip title="Ververs data">
            <IconButton onClick={fetchMarketData} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={generateReport}
            disabled={!marketData || generatingReport}
            sx={{ mr: 1 }}
          >
            {generatingReport ? 'Genereren...' : 'PDF Rapport'}
          </Button>
          <Button
            variant="contained"
            startIcon={collectingData ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            onClick={collectMarketData}
            disabled={collectingData}
          >
            {collectingData ? 'Verzamelen...' : 'Verzamel Marktdata'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!marketData ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" paragraph>
            Geen marktonderzoeksdata beschikbaar
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Klik op 'Verzamel Marktdata' om marktonderzoeksdata te verzamelen van externe bronnen.
          </Typography>
          <Button
            variant="contained"
            startIcon={collectingData ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            onClick={collectMarketData}
            disabled={collectingData}
            sx={{ mt: 2 }}
          >
            {collectingData ? 'Verzamelen...' : 'Verzamel Marktdata'}
          </Button>
        </Paper>
      ) : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <DataCard
                title="Gemiddelde Marktgrootte"
                value={`$${calculateAverageMarketSize()} miljard`}
                icon={<PieChartIcon fontSize="large" />}
                color="#2563eb"
                trend={`${calculateAverageGrowthRate()}% CAGR`}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DataCard
                title="Gemiddeld Groeipercentage"
                value={`${calculateAverageGrowthRate()}%`}
                icon={<TrendingUpIcon fontSize="large" />}
                color="#10b981"
                trend="Jaarlijkse groei"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DataCard
                title="Gemiddelde Voorspelling"
                value={`$${calculateAverageForecast()} miljard`}
                icon={<BusinessIcon fontSize="large" />}
                color="#f59e0b"
                trend={`Over ${marketData.marketSize[0]?.data.forecast.year - new Date().getFullYear()} jaar`}
              />
            </Grid>
          </Grid>

          {/* Tabs */}
          <Box sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="marktonderzoek tabs">
              <Tab label="Marktgrootte" />
              <Tab label="Trends" />
              <Tab label="Concurrenten" />
              <Tab label="Bronnen" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ mt: 2 }}>
            {/* Marktgrootte Tab */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Marktgrootte per Bron
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={generateMarketSizeChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip formatter={(value) => `$${value} miljard`} />
                            <Bar dataKey="value" fill="#2563eb" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Groeipercentage per Bron
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={generateGrowthRateChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip formatter={(value) => `${value}%`} />
                            <Bar dataKey="value" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Huidige Marktgrootte vs. Voorspelling
                      </Typography>
                      <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={generateForecastChartData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip formatter={(value) => `$${value} miljard`} />
                            <Legend />
                            <Bar dataKey="current" name="Huidige Marktgrootte" fill="#2563eb" />
                            <Bar dataKey="forecast" name="Voorspelling" fill="#f59e0b" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Trends Tab */}
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Top Markttrends
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={generateTrendsChartData().slice(0, 5)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <RechartsTooltip formatter={(value) => `${value}%`} />
                            <Bar dataKey="value" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Trends Verdeling
                      </Typography>
                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={generateTrendsChartData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {generateTrendsChartData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value, name) => [`${value}%`, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Gedetailleerde Trends
                      </Typography>
                      <List>
                        {marketData.marketTrends.flatMap(source => 
                          source.trends.map((trend, index) => (
                            <React.Fragment key={`${source.source}-${index}`}>
                              <ListItem>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="subtitle1">{trend.name}</Typography>
                                      <Chip 
                                        label={`${trend.growthRate}`} 
                                        color={
                                          parseFloat(trend.growthRate) > 50 ? 'success' : 
                                          parseFloat(trend.growthRate) > 20 ? 'info' : 'default'
                                        }
                                        size="small"
                                      />
                                    </Box>
                                  }
                                  secondary={
                                    <>
                                      <Typography variant="body2" color="text.secondary">
                                        {trend.description}
                                      </Typography>
                                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                        <Chip size="small" label={`Impact: ${trend.impact}`} />
                                        <Chip size="small" label={`Tijdsbestek: ${trend.timeframe}`} />
                                        <Chip size="small" label={`Bron: ${source.source}`} />
                                      </Box>
                                    </>
                                  }
                                />
                              </ListItem>
                              <Divider />
                            </React.Fragment>
                          ))
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Concurrenten Tab */}
            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Marktaandeel Concurrenten
                      </Typography>
                      <Box sx={{ height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={marketData.competitors[0].competitors.map(comp => ({
                                name: comp.name,
                                value: parseFloat(comp.marketShare)
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={150}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            >
                              {marketData.competitors[0].competitors.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value, name) => [`${value}%`, name]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Concurrentieanalyse
                      </Typography>
                      <Box sx={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Bedrijf</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Marktaandeel</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Omzet</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Werknemers</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Opgericht</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Hoofdkantoor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {marketData.competitors[0].competitors.map((competitor, index) => (
                              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'transparent' }}>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{competitor.name}</td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{competitor.marketShare}</td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{competitor.revenue}</td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{competitor.employees}</td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{competitor.founded}</td>
                                <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{competitor.headquarters}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Bronnen Tab */}
            {activeTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Gebruikte Bronnen
                      </Typography>
                      <List>
                        {[...new Set([
                          ...marketData.marketSize.map(item => item.source),
                          ...marketData.marketTrends.map(item => item.source),
                          ...marketData.competitors.map(item => item.source)
                        ])].map((source, index) => (
                          <React.Fragment key={index}>
                            <ListItem>
                              <ListItemText
                                primary={source}
                                secondary={
                                  <>
                                    <Typography variant="body2" component="span" color="text.secondary">
                                      {marketData.marketSize.find(item => item.source === source)?.url || 
                                       marketData.marketTrends.find(item => item.source === source)?.url ||
                                       marketData.competitors.find(item => item.source === source)?.url}
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                      <Chip 
                                        size="small" 
                                        label={marketData.marketSize.find(item => item.source === source) ? "Marktgrootte" : undefined}
                                        sx={{ mr: 1, display: marketData.marketSize.find(item => item.source === source) ? 'inline-flex' : 'none' }}
                                      />
                                      <Chip 
                                        size="small" 
                                        label={marketData.marketTrends.find(item => item.source === source) ? "Trends" : undefined}
                                        sx={{ mr: 1, display: marketData.marketTrends.find(item => item.source === source) ? 'inline-flex' : 'none' }}
                                      />
                                      <Chip 
                                        size="small" 
                                        label={marketData.competitors.find(item => item.source === source) ? "Concurrenten" : undefined}
                                        sx={{ display: marketData.competitors.find(item => item.source === source) ? 'inline-flex' : 'none' }}
                                      />
                                    </Box>
                                  </>
                                }
                              />
                              <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => window.open(
                                  marketData.marketSize.find(item => item.source === source)?.url || 
                                  marketData.marketTrends.find(item => item.source === source)?.url ||
                                  marketData.competitors.find(item => item.source === source)?.url,
                                  '_blank'
                                )}
                              >
                                Bezoek
                              </Button>
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default MarketResearch;
