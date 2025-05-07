import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Refresh as RefreshIcon,
  Campaign as CampaignIcon,
  SentimentSatisfiedAlt as SentimentPositiveIcon,
  SentimentNeutral as SentimentNeutralIcon,
  SentimentDissatisfied as SentimentNegativeIcon,
  Lightbulb as LightbulbIcon,
  FormatQuote as QuoteIcon,
  Language as LanguageIcon,
  Mail as MailIcon,
  ShoppingCart as ShoppingCartIcon,
  Videocam as VideocamIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

// Componenten
import TextGradient from '../ui/TextGradient';
import GradientBackground from '../ui/GradientBackground';

// Services
import { supabase } from '../../utils/supabaseClient';

// Styles
import '../../styles/dashboard.css';

/**
 * InsightsDashboard Component
 * Toont een overzicht van alle verzamelde inzichten en aanbevelingen
 */
const InsightsDashboard = ({ projectId }) => {
  // State voor de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [marketAnalysis, setMarketAnalysis] = useState([]);
  const [metrics, setMetrics] = useState({
    totalInsights: 0,
    insightsByPlatform: [],
    insightsBySentiment: [],
    insightsByCategory: [],
    insightsTrend: [],
    recommendationsByType: [],
    marketSize: 0,
    marketGrowth: 0,
    competitorCount: 0,
    marketTrends: []
  });
  
  // Laad data bij het laden van de component
  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);
  
  // Haal alle benodigde data op
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Haal inzichten op
      const { data: insightsData, error: insightsError } = await supabase
        .from('insights')
        .select('*')
        .eq('project_id', projectId);
      
      if (insightsError) throw insightsError;
      
      // Haal aanbevelingen op
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('recommendations')
        .select('*')
        .eq('project_id', projectId);
      
      if (recommendationsError) throw recommendationsError;
      
      // Haal marktanalyse data op
      const { data: marketAnalysisData, error: marketAnalysisError } = await supabase
        .from('market_analysis')
        .select('*')
        .eq('project_id', projectId);
      
      if (marketAnalysisError) throw marketAnalysisError;
      
      // Sla data op in state
      setInsights(insightsData || []);
      setRecommendations(recommendationsData || []);
      setMarketAnalysis(marketAnalysisData || []);
      
      // Bereken metrics
      calculateMetrics(insightsData || [], recommendationsData || [], marketAnalysisData || []);
    } catch (error) {
      console.error('Fout bij ophalen van data:', error);
      setError('Fout bij ophalen van data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Bereken metrics op basis van de opgehaalde data
  const calculateMetrics = (insightsData, recommendationsData, marketAnalysisData) => {
    // Totaal aantal inzichten
    const totalInsights = insightsData.length;
    
    // Inzichten per platform
    const insightsByPlatform = countByProperty(insightsData, 'platform');
    
    // Inzichten per sentiment
    const insightsBySentiment = countByProperty(insightsData, 'sentiment');
    
    // Inzichten per categorie
    const insightsByCategory = countByProperty(insightsData, 'category');
    
    // Inzichten trend over tijd
    const insightsTrend = calculateInsightsTrend(insightsData);
    
    // Aanbevelingen per type
    const recommendationsByType = countByProperty(recommendationsData, 'type');
    
    // Marktanalyse metrics
    const marketSize = marketAnalysisData.length > 0 ? 
      marketAnalysisData.reduce((sum, item) => sum + (item.market_size || 0), 0) : 0;
    
    const marketGrowth = marketAnalysisData.length > 0 ? 
      marketAnalysisData.reduce((sum, item) => sum + (item.growth_rate || 0), 0) / marketAnalysisData.length : 0;
    
    const competitorCount = marketAnalysisData.length > 0 ? 
      marketAnalysisData.reduce((max, item) => Math.max(max, item.competitor_count || 0), 0) : 0;
    
    // Markttrends
    const marketTrends = marketAnalysisData.length > 0 ? 
      marketAnalysisData
        .filter(item => item.trends && item.trends.length > 0)
        .flatMap(item => item.trends)
        .slice(0, 5) : [];
    
    // Update metrics state
    setMetrics({
      totalInsights,
      insightsByPlatform,
      insightsBySentiment,
      insightsByCategory,
      insightsTrend,
      recommendationsByType,
      marketSize,
      marketGrowth,
      competitorCount,
      marketTrends
    });
  };
  
  // Helper functie om te tellen op basis van een eigenschap
  const countByProperty = (data, property) => {
    const counts = {};
    
    data.forEach(item => {
      const value = item[property] || 'unknown';
      counts[value] = (counts[value] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };
  
  // Bereken inzichten trend over tijd
  const calculateInsightsTrend = (insightsData) => {
    // Groepeer inzichten per dag
    const insightsByDate = {};
    
    insightsData.forEach(insight => {
      const date = insight.created_at ? new Date(insight.created_at).toISOString().split('T')[0] : 'unknown';
      insightsByDate[date] = (insightsByDate[date] || 0) + 1;
    });
    
    // Converteer naar array en sorteer op datum
    return Object.entries(insightsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // Handler voor tab wijzigingen
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Ververs de data
  const handleRefresh = () => {
    fetchData();
  };
  
  // Formatteert een datum voor weergave
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy', { locale: nl });
  };
  
  // Render een trend icoon op basis van de trend richting
  const renderTrendIcon = (currentValue, previousValue) => {
    if (!previousValue) return <TrendingFlatIcon />;
    
    const trendPercentage = ((currentValue - previousValue) / previousValue) * 100;
    
    if (trendPercentage > 5) {
      return <TrendingUpIcon color="success" />;
    } else if (trendPercentage < -5) {
      return <TrendingDownIcon color="error" />;
    } else {
      return <TrendingFlatIcon color="warning" />;
    }
  };
  
  // Render een sentiment icoon op basis van het sentiment
  const renderSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <SentimentPositiveIcon color="success" />;
      case 'negative':
        return <SentimentNegativeIcon color="error" />;
      case 'neutral':
        return <SentimentNeutralIcon color="warning" />;
      default:
        return <SentimentNeutralIcon />;
    }
  };
  
  // Render een platform icoon op basis van het platform
  const renderPlatformIcon = (platform) => {
    switch (platform) {
      case 'reddit':
        return <img src="/icons/reddit.svg" alt="Reddit" width={24} height={24} />;
      case 'amazon':
        return <img src="/icons/amazon.svg" alt="Amazon" width={24} height={24} />;
      case 'instagram':
        return <img src="/icons/instagram.svg" alt="Instagram" width={24} height={24} />;
      case 'tiktok':
        return <img src="/icons/tiktok.svg" alt="TikTok" width={24} height={24} />;
      default:
        return <LanguageIcon />;
    }
  };
  
  // Render een categorie icoon op basis van de categorie
  const renderCategoryIcon = (category) => {
    switch (category) {
      case 'pain_point':
        return <SentimentNegativeIcon color="error" />;
      case 'desire':
        return <LightbulbIcon color="primary" />;
      case 'terminology':
        return <QuoteIcon color="secondary" />;
      default:
        return <LightbulbIcon />;
    }
  };
  
  // Render een aanbeveling type icoon op basis van het type
  const renderRecommendationTypeIcon = (type) => {
    switch (type) {
      case 'ad_copy':
        return <CampaignIcon color="primary" />;
      case 'email':
        return <MailIcon color="info" />;
      case 'product_page':
        return <ShoppingCartIcon color="success" />;
      case 'ugc_script':
        return <VideocamIcon color="secondary" />;
      case 'seo':
        return <SearchIcon color="warning" />;
      default:
        return <CampaignIcon />;
    }
  };
  
  // Kleuren voor de grafieken
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Render de component
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextGradient variant="h4" gradient="blue-to-purple">
          Inzichten Dashboard
        </TextGradient>
        <Tooltip title="Ververs data">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Overzicht" />
              <Tab label="Inzichten" />
              <Tab label="Aanbevelingen" />
              <Tab label="Trends" />
              <Tab label="Marktanalyse" />
            </Tabs>
            
            {/* Tab content */}
            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  {/* Marktanalyse metrics */}
                  <Grid item xs={12} md={6} lg={3}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Marktgrootte" />
                      </GradientBackground>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
                            €{(metrics.marketSize / 1000000).toFixed(1)}M
                          </Typography>
                          {renderTrendIcon(metrics.marketSize, metrics.marketSize * 0.9)}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Geschatte marktgrootte
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6} lg={3}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Marktgroei" />
                      </GradientBackground>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
                            {(metrics.marketGrowth * 100).toFixed(1)}%
                          </Typography>
                          {renderTrendIcon(metrics.marketGrowth, 0.05)}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Jaarlijkse groeipercentage
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6} lg={3}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Concurrenten" />
                      </GradientBackground>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
                            {metrics.competitorCount}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Aantal belangrijke concurrenten
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6} lg={3}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Totaal Inzichten" />
                      </GradientBackground>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
                            {metrics.totalInsights}
                          </Typography>
                          {renderTrendIcon(metrics.totalInsights, metrics.totalInsights * 0.8)}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Verzamelde doelgroepinzichten
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Markttrends */}
                  <Grid item xs={12}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Belangrijkste Markttrends" />
                      </GradientBackground>
                      <CardContent>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {metrics.marketTrends.length > 0 ? (
                            metrics.marketTrends.map((trend, index) => (
                              <Chip 
                                key={index}
                                label={trend}
                                color="primary"
                                variant="outlined"
                                icon={<TrendingUpIcon />}
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Geen markttrends beschikbaar
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* Totaal aantal inzichten */}
                  <Grid item xs={12} md={6} lg={3}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Totaal Inzichten" />
                      </GradientBackground>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
                            {metrics.totalInsights}
                          </Typography>
                          {renderTrendIcon(metrics.totalInsights, metrics.totalInsights * 0.8)}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Inzichten per platform */}
                  <Grid item xs={12} md={6} lg={3}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Inzichten per Platform" />
                      </GradientBackground>
                      <CardContent>
                        <Box height={200}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={metrics.insightsByPlatform}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {metrics.insightsByPlatform.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip formatter={(value, name) => [`${value} inzichten`, name]} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Inzichten per sentiment */}
                  <Grid item xs={12} md={6} lg={3}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Inzichten per Sentiment" />
                      </GradientBackground>
                      <CardContent>
                        <Box height={200}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={metrics.insightsBySentiment}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                <Cell key="cell-positive" fill="#4caf50" />
                                <Cell key="cell-neutral" fill="#ff9800" />
                                <Cell key="cell-negative" fill="#f44336" />
                              </Pie>
                              <RechartsTooltip formatter={(value, name) => [`${value} inzichten`, name]} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Inzichten per categorie */}
                  <Grid item xs={12} md={6} lg={3}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Inzichten per Categorie" />
                      </GradientBackground>
                      <CardContent>
                        <Box height={200}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={metrics.insightsByCategory}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                <Cell key="cell-pain_point" fill="#f44336" />
                                <Cell key="cell-desire" fill="#2196f3" />
                                <Cell key="cell-terminology" fill="#9c27b0" />
                              </Pie>
                              <RechartsTooltip formatter={(value, name) => [`${value} inzichten`, name]} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Inzichten trend */}
                  <Grid item xs={12}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Inzichten Trend" />
                      </GradientBackground>
                      <CardContent>
                        <Box height={300}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={metrics.insightsTrend}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={(date) => format(new Date(date), 'd MMM', { locale: nl })}
                              />
                              <YAxis />
                              <RechartsTooltip 
                                labelFormatter={(date) => format(new Date(date), 'd MMMM yyyy', { locale: nl })}
                                formatter={(value) => [`${value} inzichten`, 'Aantal']}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#8884d8" 
                                activeDot={{ r: 8 }}
                                name="Aantal inzichten"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Aanbevelingen per type */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Aanbevelingen per Type" />
                      </GradientBackground>
                      <CardContent>
                        <Box height={300}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={metrics.recommendationsByType}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis 
                                dataKey="name" 
                                type="category"
                                tickFormatter={(type) => {
                                  switch (type) {
                                    case 'ad_copy': return 'Advertentietekst';
                                    case 'email': return 'Email Marketing';
                                    case 'product_page': return 'Productpagina';
                                    case 'ugc_script': return 'UGC Video Script';
                                    case 'seo': return 'SEO Optimalisatie';
                                    default: return type;
                                  }
                                }}
                              />
                              <RechartsTooltip 
                                formatter={(value, name, props) => {
                                  const type = props.payload.name;
                                  let typeName = type;
                                  switch (type) {
                                    case 'ad_copy': typeName = 'Advertentietekst'; break;
                                    case 'email': typeName = 'Email Marketing'; break;
                                    case 'product_page': typeName = 'Productpagina'; break;
                                    case 'ugc_script': typeName = 'UGC Video Script'; break;
                                    case 'seo': typeName = 'SEO Optimalisatie'; break;
                                  }
                                  return [`${value} aanbevelingen`, typeName];
                                }}
                              />
                              <Bar dataKey="value" fill="#8884d8" name="Aantal aanbevelingen">
                                {metrics.recommendationsByType.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Recente inzichten */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <GradientBackground>
                        <CardHeader title="Recente Inzichten" />
                      </GradientBackground>
                      <CardContent>
                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                          {insights.slice(0, 5).map((insight, index) => (
                            <Box 
                              key={index} 
                              sx={{ 
                                p: 2, 
                                mb: 1, 
                                borderRadius: 1, 
                                bgcolor: 'background.paper',
                                boxShadow: 1
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ mr: 1 }}>
                                  {renderPlatformIcon(insight.platform)}
                                </Box>
                                <Typography variant="subtitle2">
                                  {insight.platform || 'Onbekend platform'}
                                </Typography>
                                <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                                  <Chip 
                                    size="small" 
                                    icon={renderSentimentIcon(insight.sentiment)}
                                    label={insight.sentiment || 'Neutraal'} 
                                  />
                                  <Chip 
                                    size="small" 
                                    icon={renderCategoryIcon(insight.category)}
                                    label={insight.category || 'Algemeen'} 
                                  />
                                </Box>
                              </Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {insight.content}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(insight.created_at)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
              
              {activeTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Inzichten Analyse
                  </Typography>
                  {/* Hier komt de inzichten analyse content */}
                </Box>
              )}
              
              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Aanbevelingen Analyse
                  </Typography>
                  {/* Hier komt de aanbevelingen analyse content */}
                </Box>
              )}
              
              {activeTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Trends Analyse
                  </Typography>
                  {/* Hier komt de trends analyse content */}
                </Box>
              )}
              
              {activeTab === 4 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Marktanalyse
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card>
                        <GradientBackground>
                          <CardHeader title="Marktgrootte en Groei" />
                        </GradientBackground>
                        <CardContent>
                          <Box height={300}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[{
                                  name: 'Huidige Markt',
                                  value: metrics.marketSize
                                }, {
                                  name: 'Verwachte Groei (1 jaar)',
                                  value: metrics.marketSize * (1 + metrics.marketGrowth)
                                }]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`} />
                                <RechartsTooltip formatter={(value) => [`€${(value / 1000000).toFixed(1)}M`, 'Marktgrootte']} />
                                <Bar dataKey="value" fill="#8884d8">
                                  <Cell key="cell-0" fill="#2196f3" />
                                  <Cell key="cell-1" fill="#4caf50" />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card>
                        <GradientBackground>
                          <CardHeader title="Concurrentieanalyse" />
                        </GradientBackground>
                        <CardContent>
                          <Box sx={{ p: 2 }}>
                            <Typography variant="body1" paragraph>
                              <strong>Aantal concurrenten:</strong> {metrics.competitorCount}
                            </Typography>
                            <Typography variant="body1" paragraph>
                              <strong>Marktconcentratie:</strong> {metrics.competitorCount > 10 ? 'Gefragmenteerd' : metrics.competitorCount > 5 ? 'Gematigd geconcentreerd' : 'Sterk geconcentreerd'}
                            </Typography>
                            <Typography variant="body1" paragraph>
                              <strong>Concurrentievoordelen:</strong> Differentiatie op basis van doelgroepinzichten
                            </Typography>
                            <Typography variant="body1" paragraph>
                              <strong>Toetredingsbarrières:</strong> Gemiddeld
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card>
                        <GradientBackground>
                          <CardHeader title="Markttrends" />
                        </GradientBackground>
                        <CardContent>
                          <Box sx={{ p: 2 }}>
                            {metrics.marketTrends.length > 0 ? (
                              <Grid container spacing={2}>
                                {metrics.marketTrends.map((trend, index) => (
                                  <Grid item xs={12} key={index}>
                                    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                                      <TrendingUpIcon color="primary" sx={{ mr: 2 }} />
                                      <Box>
                                        <Typography variant="subtitle1">{trend}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Trend geïdentificeerd in marktanalyse
                                        </Typography>
                                      </Box>
                                    </Paper>
                                  </Grid>
                                ))}
                              </Grid>
                            ) : (
                              <Typography variant="body1" align="center">
                                Geen markttrends beschikbaar
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

InsightsDashboard.propTypes = {
  projectId: PropTypes.string.isRequired
};

export default InsightsDashboard;
