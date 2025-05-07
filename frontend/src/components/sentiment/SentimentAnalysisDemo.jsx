import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  LinearProgress,
  Slider,
  Stack,
  Tab,
  Tabs,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  RestartAlt as ResetIcon,
  SentimentSatisfiedAlt as PositiveIcon,
  SentimentNeutral as NeutralIcon,
  SentimentVeryDissatisfied as NegativeIcon,
  DateRange as DateRangeIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import SentimentAnalysisChart from './SentimentAnalysisChart';
import { 
  categorizeSentiment, 
  filterByKeyword, 
  calculateSentimentStats,
  identifySentimentDrivers
} from '../../utils/insights/sentimentUtils';

// Voorbeeld data voor de demo
const DEMO_DATA = [
  // Reddit data
  ...Array(50).fill().map((_, i) => ({
    id: `reddit-${i}`,
    platform: 'reddit',
    text: `Voorbeeld Reddit post ${i}`,
    sentiment_score: Math.random() * 2 - 1, // Random score tussen -1 en 1
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random datum binnen 30 dagen
  })),
  
  // Amazon data
  ...Array(30).fill().map((_, i) => ({
    id: `amazon-${i}`,
    platform: 'amazon',
    text: `Voorbeeld Amazon review ${i}`,
    sentiment_score: Math.random() * 1.2 - 0.2, // Meer positief (tussen -0.2 en 1)
    created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() // Random datum binnen 60 dagen
  })),
  
  // Instagram data
  ...Array(20).fill().map((_, i) => ({
    id: `instagram-${i}`,
    platform: 'instagram',
    text: `Voorbeeld Instagram comment ${i}`,
    sentiment_score: Math.random() * 1.5 - 0.5, // Gemengd sentiment (tussen -0.5 en 1)
    created_at: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() // Random datum binnen 15 dagen
  })),
  
  // TikTok data
  ...Array(25).fill().map((_, i) => ({
    id: `tiktok-${i}`,
    platform: 'tiktok',
    text: `Voorbeeld TikTok comment ${i}`,
    sentiment_score: Math.random() * 1.8 - 0.8, // Breder sentiment bereik (tussen -0.8 en 1)
    created_at: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString() // Random datum binnen 10 dagen
  }))
];

const PLATFORMS = ['reddit', 'amazon', 'instagram', 'tiktok'];

/**
 * SentimentAnalysisDemo Component
 * 
 * Een interactieve demonstratiecomponent die sentiment analyse visualiseert met filtering
 * en vergelijkingsmogelijkheden. Deze component toont hoe sentimentdata kan worden
 * geanalyseerd en gevisualiseerd over verschillende platforms en tijdsperiodes.
 * 
 * De component biedt de volgende functionaliteiten:
 * - Filteren op platform (Reddit, Amazon, Instagram, TikTok)
 * - Zoeken op trefwoorden in de tekstdata
 * - Filteren op tijdsperiode
 * - Filteren op sentiment score bereik
 * - Visualisatie van sentiment per platform
 * - Vergelijking van sentiment tussen platforms
 * - Analyse van sentiment drivers (positief en negatief)
 * 
 * @component
 * @example
 * ```jsx
 * <SentimentAnalysisDemo projectName="Mijn Project" />
 * ```
 */
const SentimentAnalysisDemo = ({ projectName = 'Demo Project' }) => {
  const [data, setData] = useState(DEMO_DATA);
  const [keyword, setKeyword] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [dateRange, setDateRange] = useState([0, 60]); // Dagen terug (0-60)
  const [sentimentRange, setSentimentRange] = useState([-1, 1]); // Sentiment score (-1 tot 1)
  const [tabValue, setTabValue] = useState(0);

  // Bereken gefilterde data op basis van alle filters
  const filteredData = useMemo(() => {
    let result = [...DEMO_DATA];
    
    // Filter op platform
    if (selectedPlatform !== 'all') {
      result = result.filter(item => item.platform === selectedPlatform);
    }
    
    // Filter op zoekwoord
    if (keyword.trim()) {
      result = result.filter(item => 
        item.text.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    
    // Filter op datum
    const now = new Date();
    const minDate = new Date(now.getTime() - dateRange[1] * 24 * 60 * 60 * 1000);
    const maxDate = new Date(now.getTime() - dateRange[0] * 24 * 60 * 60 * 1000);
    
    result = result.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= minDate && itemDate <= maxDate;
    });
    
    // Filter op sentiment score
    result = result.filter(item => 
      item.sentiment_score >= sentimentRange[0] && 
      item.sentiment_score <= sentimentRange[1]
    );
    
    return result;
  }, [keyword, selectedPlatform, dateRange, sentimentRange]);
  
  // Bereken sentiment statistieken
  const stats = useMemo(() => {
    return calculateSentimentStats(filteredData);
  }, [filteredData]);
  
  // Bereken sentiment drivers (belangrijkste factoren)
  const sentimentDrivers = useMemo(() => {
    // In een echte implementatie zou dit gebaseerd zijn op tekstanalyse
    // Voor de demo gebruiken we willekeurige categorieën
    const categories = ['prijs', 'kwaliteit', 'service', 'gebruiksgemak', 'design'];
    
    return {
      positive: categories.map(cat => ({
        category: cat,
        score: Math.random() * 0.5 + 0.5, // 0.5 tot 1
        count: Math.floor(Math.random() * filteredData.length * 0.3)
      })).sort((a, b) => b.score - a.score).slice(0, 3),
      negative: categories.map(cat => ({
        category: cat,
        score: Math.random() * -0.5 - 0.5, // -0.5 tot -1
        count: Math.floor(Math.random() * filteredData.length * 0.2)
      })).sort((a, b) => a.score - b.score).slice(0, 3)
    };
  }, [filteredData]);

  // Filter data op basis van zoekwoord
  const handleSearch = () => {
    // Niet nodig om setData aan te roepen, filteredData wordt berekend met useMemo
  };

  // Reset alle filters
  const handleReset = () => {
    setKeyword('');
    setSelectedPlatform('all');
    setDateRange([0, 60]);
    setSentimentRange([-1, 1]);
  };
  
  // Handle platform change
  const handlePlatformChange = (event) => {
    setSelectedPlatform(event.target.value);
  };
  
  // Handle date range change
  const handleDateRangeChange = (event, newValue) => {
    setDateRange(newValue);
  };
  
  // Handle sentiment range change
  const handleSentimentRangeChange = (event, newValue) => {
    setSentimentRange(newValue);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Sentiment Analyse Visualisatie Demo
      </Typography>
      
      {showInfo && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }} 
          onClose={() => setShowInfo(false)}
          role="status"
          aria-live="polite"
        >
          Dit is een demonstratie van de sentiment analyse functionaliteit. De getoonde data is willekeurig gegenereerd.
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterIcon sx={{ mr: 1 }} aria-hidden="true" /> Filters
        </Typography>
        
        <Grid container spacing={2}>
          {/* Zoekwoord filter */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Zoek in tekst..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              aria-label="Zoek in tekstdata"
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} aria-hidden="true" />,
                endAdornment: keyword && (
                  <IconButton 
                    size="small" 
                    onClick={() => setKeyword('')}
                    aria-label="Zoekopdracht wissen"
                  >
                    <ClearIcon fontSize="small" aria-hidden="true" />
                  </IconButton>
                )
              }}
            />
          </Grid>
          
          {/* Platform filter */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="platform-select-label">Platform</InputLabel>
              <Select
                labelId="platform-select-label"
                id="platform-select"
                value={selectedPlatform}
                label="Platform"
                onChange={handlePlatformChange}
                startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1, ml: -0.5 }} aria-hidden="true" />}
                aria-describedby="platform-select-description"
              >
                <MenuItem value="all">Alle platforms</MenuItem>
                {PLATFORMS.map(platform => (
                  <MenuItem key={platform} value={platform}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              <span id="platform-select-description" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: '0' }}>
                Filter sentiment data op specifiek platform
              </span>
            </FormControl>
          </Grid>
          
          {/* Actie knoppen */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained" 
                onClick={handleSearch}
                size="small"
                startIcon={<SearchIcon aria-hidden="true" />}
                aria-label="Zoek met huidige filters"
              >
                Zoeken
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ResetIcon aria-hidden="true" />}
                onClick={handleReset}
                size="small"
                aria-label="Reset alle filters"
              >
                Reset Filters
              </Button>
            </Box>
          </Grid>
          {/* Datum range filter */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }} id="date-range-slider-label">
                <DateRangeIcon fontSize="small" sx={{ mr: 1 }} aria-hidden="true" /> Tijdsperiode
              </Typography>
              <Slider
                value={dateRange}
                onChange={handleDateRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={60}
                valueLabelFormat={(value) => `${value} dagen`}
                marks={[
                  { value: 0, label: 'Nu' },
                  { value: 30, label: '30d' },
                  { value: 60, label: '60d' }
                ]}
                aria-labelledby="date-range-slider-label"
                aria-valuetext={`${dateRange[0]} tot ${dateRange[1]} dagen`}
              />
            </Box>
          </Grid>
          
          {/* Sentiment score filter */}
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }} id="sentiment-range-slider-label">
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 1 }}>
                  <NegativeIcon fontSize="small" color="error" aria-hidden="true" />
                  <NeutralIcon fontSize="small" color="action" aria-hidden="true" />
                  <PositiveIcon fontSize="small" color="success" aria-hidden="true" />
                </Stack>
                Sentiment score bereik
              </Typography>
              <Slider
                value={sentimentRange}
                onChange={handleSentimentRangeChange}
                valueLabelDisplay="auto"
                min={-1}
                max={1}
                step={0.1}
                valueLabelFormat={(value) => value.toFixed(1)}
                marks={[
                  { value: -1, label: 'Negatief' },
                  { value: 0, label: 'Neutraal' },
                  { value: 1, label: 'Positief' }
                ]}
                aria-labelledby="sentiment-range-slider-label"
                aria-valuetext={`${sentimentRange[0].toFixed(1)} tot ${sentimentRange[1].toFixed(1)}`}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Statistieken overzicht */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom id="sentiment-overview-heading">
            Sentiment Overzicht
          </Typography>
          <Grid container spacing={2} role="region" aria-labelledby="sentiment-overview-heading">
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: 'success.light' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Positief
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {Math.round(stats.positivePercentage)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.positive} items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: 'grey.100' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Neutraal
                  </Typography>
                  <Typography variant="h5" color="text.primary">
                    {Math.round(stats.neutralPercentage)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.neutral} items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: 'error.light' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Negatief
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {Math.round(stats.negativePercentage)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.negative} items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined" sx={{ bgcolor: 'info.light' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Gemiddelde Score
                  </Typography>
                  <Typography variant="h5" color="info.main">
                    {stats.average.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {filteredData.length} items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Tabs voor verschillende visualisaties */}
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Sentiment analyse weergave opties"
        >
          <Tab 
            label="Algemeen Overzicht" 
            id="sentiment-tab-0"
            aria-controls="sentiment-tabpanel-0"
          />
          <Tab 
            label="Per Platform" 
            id="sentiment-tab-1"
            aria-controls="sentiment-tabpanel-1"
          />
          <Tab 
            label="Sentiment Drivers" 
            id="sentiment-tab-2"
            aria-controls="sentiment-tabpanel-2"
          />
        </Tabs>
      </Box>
      
      {/* Tab content */}
      <div
        role="tabpanel"
        id="sentiment-tabpanel-0"
        aria-labelledby="sentiment-tab-0"
        hidden={tabValue !== 0}
      >
        {tabValue === 0 && (
          <SentimentAnalysisChart 
            data={filteredData} 
            title="Sentiment Analyse - Alle Platforms"
            platforms={PLATFORMS}
            projectName={projectName}
          />
        )}
      </div>
      
      <div
        role="tabpanel"
        id="sentiment-tabpanel-1"
        aria-labelledby="sentiment-tab-1"
        hidden={tabValue !== 1}
      >
        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <SentimentAnalysisChart 
                data={filteredData.filter(item => item.platform === 'reddit')} 
                title="Sentiment Analyse - Reddit"
                platforms={['reddit']}
                projectName={projectName}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SentimentAnalysisChart 
                data={filteredData.filter(item => item.platform === 'amazon')} 
                title="Sentiment Analyse - Amazon"
                platforms={['amazon']}
                projectName={projectName}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SentimentAnalysisChart 
                data={filteredData.filter(item => item.platform === 'instagram')} 
                title="Sentiment Analyse - Instagram"
                platforms={['instagram']}
                projectName={projectName}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SentimentAnalysisChart 
                data={filteredData.filter(item => item.platform === 'tiktok')} 
                title="Sentiment Analyse - TikTok"
                platforms={['tiktok']}
                projectName={projectName}
              />
            </Grid>
          </Grid>
        )}
      </div>
      
      <div
        role="tabpanel"
        id="sentiment-tabpanel-2"
        aria-labelledby="sentiment-tab-2"
        hidden={tabValue !== 2}
      >
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Positieve Sentiment Drivers" 
                  id="positive-drivers-heading"
                />
                <Divider />
                <CardContent
                  role="region"
                  aria-labelledby="positive-drivers-heading"
                >
                  {sentimentDrivers.positive.map((driver, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">
                        {driver.category.charAt(0).toUpperCase() + driver.category.slice(1)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(driver.score + 1) * 50} 
                            color="success" 
                            sx={{ height: 8, borderRadius: 4 }}
                            aria-valuemin="-1"
                            aria-valuemax="1"
                            aria-valuenow={driver.score}
                            aria-valuetext={`Score: ${driver.score.toFixed(2)}`}
                          />
                        </Box>
                        <Typography variant="body2" color="success.main">
                          {driver.score.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Genoemd in {driver.count} items
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Negatieve Sentiment Drivers" 
                  id="negative-drivers-heading"
                />
                <Divider />
                <CardContent
                  role="region"
                  aria-labelledby="negative-drivers-heading"
                >
                  {sentimentDrivers.negative.map((driver, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">
                        {driver.category.charAt(0).toUpperCase() + driver.category.slice(1)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(driver.score + 1) * 50} 
                            color="error" 
                            sx={{ height: 8, borderRadius: 4 }}
                            aria-valuemin="-1"
                            aria-valuemax="1"
                            aria-valuenow={driver.score}
                            aria-valuetext={`Score: ${driver.score.toFixed(2)}`}
                          />
                        </Box>
                        <Typography variant="body2" color="error.main">
                          {driver.score.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Genoemd in {driver.count} items
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </div>
    </Box>
  );
};

SentimentAnalysisDemo.propTypes = {
  /**
   * Naam van het project waarvoor de sentiment analyse wordt uitgevoerd
   */
  projectName: PropTypes.string
};

SentimentAnalysisDemo.propTypes = {
  /**
   * Naam van het project waarvoor de sentiment analyse wordt uitgevoerd
   */
  projectName: PropTypes.string
};

export default SentimentAnalysisDemo;
