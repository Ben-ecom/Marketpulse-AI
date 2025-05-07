import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Tabs,
  Tab,
  Grid,
  Tooltip,
  IconButton,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

// Stijl voor visueel verborgen elementen (voor schermlezers)
const visuallyHiddenStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0'
};

/**
 * SentimentTrendVisualization Component
 * 
 * Deze component visualiseert sentimenttrends over tijd, per platform en per categorie.
 * Het biedt gebruikers verschillende interactieve visualisaties om inzicht te krijgen in
 * sentiment patronen en trends binnen de verzamelde data.
 * 
 * De component heeft vier hoofdvisualisaties, toegankelijk via tabs:
 * 1. Sentiment Trend - Toont de ontwikkeling van sentiment over tijd met filtering op tijdsperiode
 * 2. Platform Vergelijking - Vergelijkt sentiment scores tussen verschillende platforms
 * 3. Sentiment Verdeling - Visualiseert de verdeling van positief/neutraal/negatief sentiment
 * 4. Sentiment per Categorie - Toont sentiment scores per categorie met filtering mogelijkheden
 * 
 * Elke visualisatie biedt interactieve elementen zoals tooltips, filters en klikbare datapunten
 * voor gedetailleerde analyse. De component is ontworpen om zowel overzicht als diepgaande
 * inzichten te bieden in sentiment patronen.
 * 
 * @component
 * @example
 * ```jsx
 * <SentimentTrendVisualization
 *   data={sentimentData}
 *   platform="all"
 *   height={400}
 *   onDataPointClick={handleDataPointClick}
 * />
 * ```
 */
const SentimentTrendVisualization = ({ 
  data, 
  platform = 'all', 
  height = 400, 
  onDataPointClick = () => {} 
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('all');
  const [category, setCategory] = useState('all');
  const [processedData, setProcessedData] = useState(null);
  
  // Beschikbare categorieën uit data
  const categories = data?.categories || ['product', 'service', 'price', 'quality'];
  
  // Beschikbare tijdsperiodes
  const timeRanges = [
    { value: 'week', label: 'Afgelopen week' },
    { value: 'month', label: 'Afgelopen maand' },
    { value: 'quarter', label: 'Afgelopen kwartaal' },
    { value: 'year', label: 'Afgelopen jaar' },
    { value: 'all', label: 'Alle data' }
  ];
  
  // Verwerk data wanneer deze verandert of wanneer filters veranderen
  useEffect(() => {
    if (data) {
      // Hier zou normaal gesproken data transformatie plaatsvinden
      // Voor nu gebruiken we mock data
      const mockTimelineData = generateMockTimelineData(timeRange);
      const mockPlatformData = generateMockPlatformData();
      const mockDistributionData = generateMockDistributionData();
      const mockCategoryData = generateMockCategoryData(category);
      
      setProcessedData({
        timeline: mockTimelineData,
        platforms: mockPlatformData,
        distribution: mockDistributionData,
        categories: mockCategoryData
      });
    }
  }, [data, platform, timeRange, category]);
  
  // Mock data generatie functies
  const generateMockTimelineData = (range) => {
    // Genereer tijdlijn data op basis van geselecteerde range
    const now = new Date();
    const data = [];
    let points;
    let interval;
    
    switch(range) {
      case 'week':
        points = 7;
        interval = 24 * 60 * 60 * 1000; // 1 dag
        break;
      case 'month':
        points = 30;
        interval = 24 * 60 * 60 * 1000; // 1 dag
        break;
      case 'quarter':
        points = 12;
        interval = 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
      case 'year':
        points = 12;
        interval = 30 * 24 * 60 * 60 * 1000; // 1 maand
        break;
      default:
        points = 12;
        interval = 30 * 24 * 60 * 60 * 1000; // 1 maand
    }
    
    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * interval));
      const formattedDate = formatDate(date, range);
      
      // Genereer random sentiment waarden
      const positive = 30 + Math.floor(Math.random() * 40); // 30-70%
      const negative = 10 + Math.floor(Math.random() * 30); // 10-40%
      const neutral = 100 - positive - negative;
      
      // Bereken gemiddelde sentiment score (-1 tot 1)
      const sentimentScore = ((positive * 1) + (neutral * 0) + (negative * -1)) / 100;
      
      data.push({
        date: formattedDate,
        positive,
        negative,
        neutral,
        sentimentScore: parseFloat(sentimentScore.toFixed(2))
      });
    }
    
    return data;
  };
  
  const generateMockPlatformData = () => {
    // Genereer platform vergelijking data
    return [
      {
        platform: 'Twitter',
        positive: 45,
        neutral: 30,
        negative: 25,
        sentimentScore: 0.2
      },
      {
        platform: 'Reddit',
        positive: 30,
        neutral: 40,
        negative: 30,
        sentimentScore: 0
      },
      {
        platform: 'Trustpilot',
        positive: 60,
        neutral: 20,
        negative: 20,
        sentimentScore: 0.4
      },
      {
        platform: 'Instagram',
        positive: 70,
        neutral: 20,
        negative: 10,
        sentimentScore: 0.6
      }
    ];
  };
  
  const generateMockDistributionData = () => {
    // Genereer sentiment distributie data
    return [
      { name: 'Positief', value: 55 },
      { name: 'Neutraal', value: 25 },
      { name: 'Negatief', value: 20 }
    ];
  };
  
  const generateMockCategoryData = (selectedCategory) => {
    // Genereer sentiment per categorie data
    const allCategories = [
      {
        category: 'product',
        label: 'Product',
        positive: 65,
        neutral: 20,
        negative: 15,
        sentimentScore: 0.5
      },
      {
        category: 'service',
        label: 'Service',
        positive: 40,
        neutral: 30,
        negative: 30,
        sentimentScore: 0.1
      },
      {
        category: 'price',
        label: 'Prijs',
        positive: 30,
        neutral: 25,
        negative: 45,
        sentimentScore: -0.15
      },
      {
        category: 'quality',
        label: 'Kwaliteit',
        positive: 70,
        neutral: 20,
        negative: 10,
        sentimentScore: 0.6
      }
    ];
    
    if (selectedCategory === 'all') {
      return allCategories;
    } else {
      return allCategories.filter(cat => cat.category === selectedCategory);
    }
  };
  
  // Helper functie voor formatteren van datum
  const formatDate = (date, range) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    switch(range) {
      case 'week':
      case 'month':
        return `${day} ${getMonthName(month)}`;
      case 'quarter':
        return `Week ${Math.ceil(day / 7)} ${getMonthName(month)}`;
      case 'year':
        return getMonthName(month);
      default:
        return `${day} ${getMonthName(month)} ${year}`;
    }
  };
  
  // Helper functie voor maandnamen
  const getMonthName = (monthIndex) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    return months[monthIndex];
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Handle category change
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };
  
  // Kleurenschema voor sentiment
  const sentimentColors = {
    positive: theme.palette.success.main,
    neutral: theme.palette.grey[400],
    negative: theme.palette.error.main,
    sentimentScore: theme.palette.primary.main
  };
  
  // Trend indicator component
  const TrendIndicator = ({ value, previousValue }) => {
    const difference = value - previousValue;
    const percentChange = previousValue !== 0 ? (difference / Math.abs(previousValue)) * 100 : 0;
    
    let icon;
    let color;
    let trendDescription;
    
    if (Math.abs(percentChange) < 5) {
      icon = <TrendingFlatIcon aria-hidden="true" />;
      color = 'text.secondary';
      trendDescription = 'Stabiel';
    } else if (percentChange > 0) {
      icon = <TrendingUpIcon aria-hidden="true" />;
      color = 'success.main';
      trendDescription = 'Stijgend';
    } else {
      icon = <TrendingDownIcon aria-hidden="true" />;
      color = 'error.main';
      trendDescription = 'Dalend';
    }
    
    return (
      <Box 
        sx={{ display: 'flex', alignItems: 'center' }}
        role="status"
        aria-label={`${trendDescription}: ${percentChange.toFixed(1)}% verandering`}
      >
        <Box sx={{ color, mr: 0.5, display: 'flex', alignItems: 'center' }}>
          {icon}
        </Box>
        <Typography variant="body2" color={color}>
          {percentChange.toFixed(1)}%
        </Typography>
      </Box>
    );
  };
  
  TrendIndicator.propTypes = {
    value: PropTypes.number.isRequired,
    previousValue: PropTypes.number.isRequired
  };
  
  // Render sentiment tijdlijn
  const renderSentimentTimeline = () => {
    if (!processedData || !processedData.timeline) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Sentiment Trend" 
          subheader="Verloop van sentiment over tijd"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
                <InputLabel id="time-range-select-label">Tijdsperiode</InputLabel>
                <Select
                  labelId="time-range-select-label"
                  id="time-range-select"
                  value={timeRange}
                  label="Tijdsperiode"
                  onChange={handleTimeRangeChange}
                  aria-describedby="time-range-select-description"
                >
                  {timeRanges.map((range) => (
                    <MenuItem key={range.value} value={range.value}>{range.label}</MenuItem>
                  ))}
                </Select>
                <span id="time-range-select-description" style={visuallyHiddenStyle}>
                  Filter sentiment trend op specifieke tijdsperiode
                </span>
              </FormControl>
              <Tooltip title="Deze grafiek toont het verloop van sentiment over tijd, uitgesplitst in positief, neutraal en negatief sentiment.">
                <IconButton aria-label="Meer informatie over sentiment trend grafiek">
                  <InfoIcon aria-hidden="true" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Box 
            sx={{ height: height - 100, width: '100%' }}
            role="img"
            aria-label="Sentiment trend over tijd grafiek"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={processedData.timeline}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                onClick={(data) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    onDataPointClick(data.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="positive" 
                  name="Positief" 
                  stackId="1"
                  stroke={sentimentColors.positive} 
                  fill={sentimentColors.positive} 
                />
                <Area 
                  type="monotone" 
                  dataKey="neutral" 
                  name="Neutraal" 
                  stackId="1"
                  stroke={sentimentColors.neutral} 
                  fill={sentimentColors.neutral} 
                />
                <Area 
                  type="monotone" 
                  dataKey="negative" 
                  name="Negatief" 
                  stackId="1"
                  stroke={sentimentColors.negative} 
                  fill={sentimentColors.negative} 
                />
                <Line 
                  type="monotone" 
                  dataKey="sentimentScore" 
                  name="Sentiment Score" 
                  stroke={sentimentColors.sentimentScore}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  yAxisId={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
          
          <Box 
            sx={{ mt: 2 }}
            aria-live="polite"
          >
            <Typography variant="subtitle2" gutterBottom id="current-sentiment-score">
              Huidige sentiment score: 
              <Chip 
                label={`${processedData.timeline[processedData.timeline.length - 1].sentimentScore.toFixed(2)}`}
                color={processedData.timeline[processedData.timeline.length - 1].sentimentScore > 0 ? 'success' : 'error'}
                size="small"
                sx={{ ml: 1 }}
                aria-labelledby="current-sentiment-score"
              />
              <TrendIndicator 
                value={processedData.timeline[processedData.timeline.length - 1].sentimentScore}
                previousValue={processedData.timeline[processedData.timeline.length - 2].sentimentScore}
              />
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Render platform vergelijking
  const renderPlatformComparison = () => {
    if (!processedData || !processedData.platforms) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Platform Vergelijking" 
          subheader="Sentiment per platform"
          action={
            <Tooltip title="Deze grafiek vergelijkt het sentiment tussen verschillende platforms.">
              <IconButton aria-label="Meer informatie over platform vergelijking grafiek">
                <InfoIcon aria-hidden="true" />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          <Box 
            sx={{ height: height - 100, width: '100%' }}
            role="img"
            aria-label="Platform vergelijking grafiek"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData.platforms}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                onClick={(data) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    onDataPointClick(data.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar 
                  dataKey="positive" 
                  name="Positief" 
                  stackId="a"
                  fill={sentimentColors.positive} 
                />
                <Bar 
                  dataKey="neutral" 
                  name="Neutraal" 
                  stackId="a"
                  fill={sentimentColors.neutral} 
                />
                <Bar 
                  dataKey="negative" 
                  name="Negatief" 
                  stackId="a"
                  fill={sentimentColors.negative} 
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Render sentiment distributie
  const renderSentimentDistribution = () => {
    if (!processedData || !processedData.distribution) return null;
    
    const COLORS = [sentimentColors.positive, sentimentColors.neutral, sentimentColors.negative];
    
    // Bereken percentages
    const totalValue = processedData.distribution.reduce((sum, item) => sum + item.value, 0);
    const positivePercentage = Math.round((processedData.distribution[0].value / totalValue) * 100);
    const neutralPercentage = Math.round((processedData.distribution[1].value / totalValue) * 100);
    const negativePercentage = Math.round((processedData.distribution[2].value / totalValue) * 100);
    
    return (
      <Card>
        <CardHeader 
          title="Sentiment Verdeling" 
          subheader="Verdeling van positief, neutraal en negatief sentiment"
          action={
            <Tooltip title="Deze grafiek toont de verdeling van sentiment in percentages.">
              <IconButton aria-label="Meer informatie over sentiment verdeling grafiek">
                <InfoIcon aria-hidden="true" />
              </IconButton>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          <Box 
            sx={{ height: height - 100, width: '100%', display: 'flex', justifyContent: 'center' }}
            role="img"
            aria-label="Sentiment verdeling cirkeldiagram"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedData.distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => onDataPointClick(data)}
                >
                  {processedData.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          
          <Grid 
            container 
            spacing={2} 
            sx={{ mt: 2 }}
            role="list"
            aria-label="Sentiment verdeling percentages"
          >
            <Grid item xs={12} sm={4} role="listitem">
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="success.main" gutterBottom id="positive-sentiment-label">
                    Positief
                  </Typography>
                  <Typography variant="h4" aria-labelledby="positive-sentiment-label">
                    {positivePercentage}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4} role="listitem">
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom id="neutral-sentiment-label">
                    Neutraal
                  </Typography>
                  <Typography variant="h4" aria-labelledby="neutral-sentiment-label">
                    {neutralPercentage}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4} role="listitem">
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="error.main" gutterBottom id="negative-sentiment-label">
                    Negatief
                  </Typography>
                  <Typography variant="h4" aria-labelledby="negative-sentiment-label">
                    {negativePercentage}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  // Render sentiment per categorie
  const renderSentimentByCategory = () => {
    if (!processedData || !processedData.categories) return null;
    
    return (
      <Card>
        <CardHeader 
          title="Sentiment per Categorie" 
          subheader="Vergelijking van sentiment tussen categorieën"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150, mr: 1 }}>
                <InputLabel id="category-select-label">Categorie</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={category}
                  label="Categorie"
                  onChange={handleCategoryChange}
                  aria-describedby="category-select-description"
                >
                  <MenuItem value="all">Alle categorieën</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</MenuItem>
                  ))}
                </Select>
                <span id="category-select-description" style={visuallyHiddenStyle}>
                  Filter sentiment data op specifieke categorie
                </span>
              </FormControl>
              <Tooltip title="Deze grafiek toont het sentiment per categorie.">
                <IconButton aria-label="Meer informatie over sentiment per categorie grafiek">
                  <InfoIcon aria-hidden="true" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Box 
            sx={{ height: height - 100, width: '100%' }}
            role="img"
            aria-label="Sentiment per categorie grafiek"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData.categories}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                onClick={(data) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    onDataPointClick(data.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar 
                  dataKey="positive" 
                  name="Positief" 
                  stackId="a"
                  fill={sentimentColors.positive} 
                />
                <Bar 
                  dataKey="neutral" 
                  name="Neutraal" 
                  stackId="a"
                  fill={sentimentColors.neutral} 
                />
                <Bar 
                  dataKey="negative" 
                  name="Negatief" 
                  stackId="a"
                  fill={sentimentColors.negative} 
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          
          <Grid 
            container 
            spacing={2} 
            sx={{ mt: 1 }}
            role="list"
            aria-label="Sentiment scores per categorie"
          >
            {processedData.categories.map((cat) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={3} 
                key={cat.category}
                role="listitem"
              >
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom id={`category-${cat.category}-label`}>
                      {cat.label}
                    </Typography>
                    <Box 
                      sx={{ display: 'flex', alignItems: 'center' }}
                      aria-labelledby={`category-${cat.category}-label`}
                    >
                      <Typography variant="h6" sx={{ mr: 1 }}>
                        {cat.sentimentScore.toFixed(2)}
                      </Typography>
                      <Chip 
                        size="small"
                        label={cat.sentimentScore > 0.3 ? 'Zeer positief' : cat.sentimentScore > 0 ? 'Positief' : cat.sentimentScore > -0.3 ? 'Negatief' : 'Zeer negatief'}
                        color={cat.sentimentScore > 0 ? 'success' : 'error'}
                        aria-label={`Sentiment: ${cat.sentimentScore > 0.3 ? 'Zeer positief' : cat.sentimentScore > 0 ? 'Positief' : cat.sentimentScore > -0.3 ? 'Negatief' : 'Zeer negatief'}`}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
        aria-label="Sentiment visualisatie opties"
      >
        <Tab 
          label="Sentiment Trend" 
          id="sentiment-tab-0"
          aria-controls="sentiment-tabpanel-0"
        />
        <Tab 
          label="Platform Vergelijking" 
          id="sentiment-tab-1"
          aria-controls="sentiment-tabpanel-1"
        />
        <Tab 
          label="Sentiment Verdeling" 
          id="sentiment-tab-2"
          aria-controls="sentiment-tabpanel-2"
        />
        <Tab 
          label="Sentiment per Categorie" 
          id="sentiment-tab-3"
          aria-controls="sentiment-tabpanel-3"
        />
      </Tabs>
      
      {/* Visualisatie op basis van geselecteerde tab */}
      <div
        role="tabpanel"
        id="sentiment-tabpanel-0"
        aria-labelledby="sentiment-tab-0"
        hidden={activeTab !== 0}
      >
        {activeTab === 0 && renderSentimentTimeline()}
      </div>
      <div
        role="tabpanel"
        id="sentiment-tabpanel-1"
        aria-labelledby="sentiment-tab-1"
        hidden={activeTab !== 1}
      >
        {activeTab === 1 && renderPlatformComparison()}
      </div>
      <div
        role="tabpanel"
        id="sentiment-tabpanel-2"
        aria-labelledby="sentiment-tab-2"
        hidden={activeTab !== 2}
      >
        {activeTab === 2 && renderSentimentDistribution()}
      </div>
      <div
        role="tabpanel"
        id="sentiment-tabpanel-3"
        aria-labelledby="sentiment-tab-3"
        hidden={activeTab !== 3}
      >
        {activeTab === 3 && renderSentimentByCategory()}
      </div>
      
      {/* Fallback voor ontbrekende data */}
      {!data && (
        <Box 
          sx={{ p: 3, textAlign: 'center' }}
          role="status"
          aria-live="polite"
        >
          <Typography variant="body1" color="text.secondary">
            Geen data beschikbaar voor visualisatie.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

SentimentTrendVisualization.propTypes = {
  /**
   * Object met sentiment data voor visualisatie.
   * Verwacht format: { timeline: [...], platforms: [...], distribution: [...], categories: [...] }
   */
  data: PropTypes.shape({
    timeline: PropTypes.array,
    platforms: PropTypes.array,
    distribution: PropTypes.array,
    categories: PropTypes.array,
  }),
  
  /**
   * Platform filter voor de visualisaties.
   * Gebruik 'all' voor alle platforms of een specifieke platform naam.
   */
  platform: PropTypes.string,
  
  /**
   * Hoogte van de visualisatie in pixels.
   */
  height: PropTypes.number,
  
  /**
   * Callback functie die wordt aangeroepen wanneer een gebruiker op een datapunt klikt.
   * Ontvangt het datapunt object als parameter.
   * @param {Object} dataPoint - Het aangeklikte datapunt met alle bijbehorende data
   */
  onDataPointClick: PropTypes.func
};

export default SentimentTrendVisualization;
