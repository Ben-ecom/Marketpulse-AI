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
  Tooltip,
  IconButton,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import {
  InfoOutlined as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Search as SearchIcon,
  Event as EventIcon,
  Close as CloseIcon
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
  Scatter,
  ScatterChart,
  ZAxis,
  ReferenceArea,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';

/**
 * TrendingTopicsTimeline Component
 * 
 * Visualiseert trending topics over tijd, met mogelijkheden om:
 * - Trends te volgen over verschillende tijdsperiodes
 * - Correlaties te zien met belangrijke events
 * - Opkomende en afnemende topics te identificeren
 * - Cross-platform vergelijkingen te maken
 */
const TrendingTopicsTimeline = ({ 
  data, 
  platform = 'all', 
  height = 400, 
  onTopicClick = () => {} 
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEvents, setShowEvents] = useState(true);
  
  // Beschikbare tijdsperiodes
  const timeRanges = [
    { value: 'week', label: 'Afgelopen week' },
    { value: 'month', label: 'Afgelopen maand' },
    { value: 'quarter', label: 'Afgelopen kwartaal' },
    { value: 'year', label: 'Afgelopen jaar' }
  ];
  
  // Mock data voor trending topics
  const generateMockTimelineData = () => {
    const topics = [
      { name: 'duurzaamheid', color: theme.palette.primary.main },
      { name: 'innovatie', color: theme.palette.secondary.main },
      { name: 'prijsverhoging', color: theme.palette.error.main },
      { name: 'kwaliteit', color: theme.palette.success.main },
      { name: 'gebruiksvriendelijkheid', color: theme.palette.warning.main }
    ];
    
    const now = new Date();
    const data = [];
    let points;
    let interval;
    
    switch(timeRange) {
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
        points = 30;
        interval = 24 * 60 * 60 * 1000; // 1 dag
    }
    
    // Genereer data voor elk tijdspunt
    for (let i = points - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * interval));
      const formattedDate = formatDate(date, timeRange);
      
      const point = { date: formattedDate };
      
      // Voeg waarde toe voor elk topic
      topics.forEach(topic => {
        // Genereer een basis trend met wat randomness
        let baseValue;
        
        if (topic.name === 'duurzaamheid') {
          // Stijgende trend
          baseValue = 30 + ((points - i) / points) * 40;
        } else if (topic.name === 'prijsverhoging') {
          // Spike in het midden
          const midPoint = Math.floor(points / 2);
          const distanceFromMid = Math.abs(i - midPoint);
          baseValue = 40 - (distanceFromMid * 1.5);
        } else if (topic.name === 'innovatie') {
          // Golvend patroon
          baseValue = 50 + Math.sin((i / points) * Math.PI * 2) * 20;
        } else {
          // Random trend
          baseValue = 20 + Math.random() * 40;
        }
        
        // Voeg wat randomness toe
        const value = Math.max(0, Math.min(100, baseValue + (Math.random() * 10 - 5)));
        point[topic.name] = Math.round(value);
      });
      
      data.push(point);
    }
    
    return { data, topics };
  };
  
  // Mock events data
  const generateMockEvents = () => {
    const events = [
      { 
        date: formatDate(new Date(new Date().getTime() - (15 * 24 * 60 * 60 * 1000)), timeRange), 
        name: 'Productlancering', 
        description: 'Lancering van nieuwe productlijn',
        impact: 'hoog',
        relatedTopics: ['innovatie', 'kwaliteit']
      },
      { 
        date: formatDate(new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)), timeRange), 
        name: 'Prijswijziging', 
        description: 'Aankondiging van nieuwe prijsstrategie',
        impact: 'medium',
        relatedTopics: ['prijsverhoging']
      },
      { 
        date: formatDate(new Date(new Date().getTime() - (21 * 24 * 60 * 60 * 1000)), timeRange), 
        name: 'Duurzaamheidscampagne', 
        description: 'Start van nieuwe duurzaamheidscampagne',
        impact: 'hoog',
        relatedTopics: ['duurzaamheid']
      }
    ];
    
    return events.filter(event => {
      // Filter events op basis van timeRange
      if (timeRange === 'week') {
        return new Date(event.date) >= new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000));
      }
      return true;
    });
  };
  
  // Mock emerging topics
  const generateMockEmergingTopics = () => {
    return [
      { 
        name: 'duurzaamheid', 
        growth: 35, 
        status: 'rising',
        platforms: ['reddit', 'instagram'],
        relatedTerms: ['eco-friendly', 'groen', 'milieubewust', 'klimaat']
      },
      { 
        name: 'gebruiksvriendelijkheid', 
        growth: 22, 
        status: 'rising',
        platforms: ['amazon', 'reddit'],
        relatedTerms: ['intuïtief', 'eenvoudig', 'toegankelijk', 'gebruikerservaring']
      },
      { 
        name: 'prijsverhoging', 
        growth: -15, 
        status: 'declining',
        platforms: ['twitter', 'reddit'],
        relatedTerms: ['duur', 'prijzig', 'kosten', 'betaalbaarheid']
      },
      { 
        name: 'innovatie', 
        growth: 18, 
        status: 'rising',
        platforms: ['instagram', 'tiktok'],
        relatedTerms: ['vernieuwend', 'baanbrekend', 'revolutionair', 'vooruitstrevend']
      },
      { 
        name: 'kwaliteit', 
        growth: 5, 
        status: 'stable',
        platforms: ['amazon', 'trustpilot'],
        relatedTerms: ['degelijk', 'betrouwbaar', 'premium', 'duurzaam']
      }
    ].filter(topic => {
      if (searchTerm) {
        return topic.name.includes(searchTerm.toLowerCase()) || 
               topic.relatedTerms.some(term => term.includes(searchTerm.toLowerCase()));
      }
      return true;
    });
  };
  
  // Mock cross-platform data
  const generateMockCrossPlatformData = () => {
    const platforms = ['reddit', 'amazon', 'instagram', 'tiktok', 'twitter'];
    const topics = ['duurzaamheid', 'innovatie', 'prijsverhoging', 'kwaliteit', 'gebruiksvriendelijkheid'];
    
    return topics.map(topic => {
      const result = { topic };
      
      platforms.forEach(platform => {
        // Genereer random waarde tussen 0-100
        result[platform] = Math.floor(Math.random() * 100);
      });
      
      return result;
    }).filter(item => {
      if (searchTerm) {
        return item.topic.includes(searchTerm.toLowerCase());
      }
      return true;
    });
  };
  
  // Verwerk data
  const { data: timelineData, topics } = generateMockTimelineData();
  const events = generateMockEvents();
  const emergingTopics = generateMockEmergingTopics();
  const crossPlatformData = generateMockCrossPlatformData();
  
  // Helper functie voor formatteren van datum
  function formatDate(date, range) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    switch(range) {
      case 'week':
        return `${day}-${month}`;
      case 'month':
        return `${day}-${month}`;
      case 'quarter':
        return `Week ${Math.ceil(date.getDate() / 7)} ${getMonthName(date.getMonth())}`;
      case 'year':
        return getMonthName(date.getMonth());
      default:
        return `${day}-${month}`;
    }
  }
  
  // Helper functie voor maandnamen
  function getMonthName(monthIndex) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    return months[monthIndex];
  }
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedTopic(null);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle topic click
  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    onTopicClick(topic);
  };
  
  // Toggle events visibility
  const handleToggleEvents = () => {
    setShowEvents(!showEvents);
  };
  
  // Render timeline chart
  const renderTimelineChart = () => {
    return (
      <Card>
        <CardHeader 
          title="Trending Topics Timeline" 
          subheader="Verloop van topic populariteit over tijd"
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
                >
                  {timeRanges.map((range) => (
                    <MenuItem key={range.value} value={range.value}>{range.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Events tonen/verbergen">
                <IconButton onClick={handleToggleEvents} color={showEvents ? 'primary' : 'default'}>
                  <EventIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Deze grafiek toont de populariteit van verschillende topics over tijd.">
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: height - 100, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend onClick={(e) => handleTopicClick(e.dataKey)} />
                
                {/* Toon lijnen voor elk topic */}
                {topics.map((topic, index) => (
                  <Line 
                    key={topic.name}
                    type="monotone" 
                    dataKey={topic.name} 
                    name={topic.name.charAt(0).toUpperCase() + topic.name.slice(1)} 
                    stroke={topic.color}
                    strokeWidth={selectedTopic === topic.name ? 3 : 1}
                    dot={{ r: selectedTopic === topic.name ? 5 : 3 }}
                    activeDot={{ r: 8 }}
                  />
                ))}
                
                {/* Toon events als verticale lijnen */}
                {showEvents && events.map((event, index) => (
                  <ReferenceLine 
                    key={index}
                    x={event.date} 
                    stroke="#888"
                    strokeDasharray="3 3"
                    label={{ 
                      value: event.name, 
                      position: 'top',
                      fill: '#888',
                      fontSize: 10
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
          
          {/* Toon event details als er events zijn */}
          {showEvents && events.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Belangrijke Events:
              </Typography>
              <Grid container spacing={2}>
                {events.map((event, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          {event.name} ({event.date})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {event.relatedTopics.map((topic, i) => (
                            <Chip 
                              key={i} 
                              label={topic} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              onClick={() => handleTopicClick(topic)}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Render emerging topics
  const renderEmergingTopics = () => {
    return (
      <Card>
        <CardHeader 
          title="Opkomende & Afnemende Topics" 
          subheader="Topics met de grootste verandering in populariteit"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Zoeken..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 1 }}
              />
              <Tooltip title="Deze tabel toont topics die significant in populariteit stijgen of dalen.">
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            {emergingTopics.map((topic, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderColor: topic.status === 'rising' ? 'success.main' : 
                                topic.status === 'declining' ? 'error.main' : 'grey.300',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleTopicClick(topic.name)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {topic.name.charAt(0).toUpperCase() + topic.name.slice(1)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="subtitle2" 
                          color={topic.growth > 0 ? 'success.main' : topic.growth < 0 ? 'error.main' : 'text.secondary'}
                          sx={{ mr: 0.5 }}
                        >
                          {topic.growth > 0 ? '+' : ''}{topic.growth}%
                        </Typography>
                        {topic.growth > 10 ? (
                          <TrendingUpIcon color="success" fontSize="small" />
                        ) : topic.growth < -10 ? (
                          <TrendingDownIcon color="error" fontSize="small" />
                        ) : (
                          <TrendingFlatIcon color="action" fontSize="small" />
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Platforms: {topic.platforms.join(', ')}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      Gerelateerde termen:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {topic.relatedTerms.map((term, i) => (
                        <Chip key={i} label={term} size="small" />
                      ))}
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
  
  // Render cross-platform comparison
  const renderCrossPlatformComparison = () => {
    return (
      <Card>
        <CardHeader 
          title="Cross-Platform Vergelijking" 
          subheader="Vergelijking van topic populariteit tussen platforms"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Zoeken..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 1 }}
              />
              <Tooltip title="Deze grafiek vergelijkt de populariteit van topics tussen verschillende platforms.">
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ height: height - 100, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={crossPlatformData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="topic" type="category" />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="reddit" name="Reddit" fill="#FF4500" />
                <Bar dataKey="amazon" name="Amazon" fill="#FF9900" />
                <Bar dataKey="instagram" name="Instagram" fill="#C13584" />
                <Bar dataKey="tiktok" name="TikTok" fill="#000000" />
                <Bar dataKey="twitter" name="Twitter" fill="#1DA1F2" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Render topic details
  const renderTopicDetails = () => {
    if (!selectedTopic) return null;
    
    // Vind topic data
    const topic = emergingTopics.find(t => t.name === selectedTopic) || { 
      name: selectedTopic,
      growth: 0,
      status: 'stable',
      platforms: [],
      relatedTerms: []
    };
    
    // Vind gerelateerde events
    const relatedEvents = events.filter(event => 
      event.relatedTopics.includes(selectedTopic)
    );
    
    return (
      <Card sx={{ mt: 3 }}>
        <CardHeader 
          title={`Topic Details: ${selectedTopic.charAt(0).toUpperCase() + selectedTopic.slice(1)}`}
          action={
            <IconButton onClick={() => setSelectedTopic(null)}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Groei:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="h5" 
                  color={topic.growth > 0 ? 'success.main' : topic.growth < 0 ? 'error.main' : 'text.secondary'}
                  sx={{ mr: 1 }}
                >
                  {topic.growth > 0 ? '+' : ''}{topic.growth}%
                </Typography>
                {topic.growth > 10 ? (
                  <TrendingUpIcon color="success" />
                ) : topic.growth < -10 ? (
                  <TrendingDownIcon color="error" />
                ) : (
                  <TrendingFlatIcon color="action" />
                )}
              </Box>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Status:
              </Typography>
              <Chip 
                label={topic.status === 'rising' ? 'Stijgend' : topic.status === 'declining' ? 'Dalend' : 'Stabiel'} 
                color={topic.status === 'rising' ? 'success' : topic.status === 'declining' ? 'error' : 'default'}
              />
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Platforms:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {topic.platforms.map((platform, i) => (
                  <Chip key={i} label={platform} />
                ))}
              </Box>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Gerelateerde termen:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {topic.relatedTerms.map((term, i) => (
                  <Chip key={i} label={term} variant="outlined" />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Gerelateerde events:
              </Typography>
              {relatedEvents.length > 0 ? (
                relatedEvents.map((event, index) => (
                  <Card variant="outlined" sx={{ mb: 2 }} key={index}>
                    <CardContent>
                      <Typography variant="subtitle2">
                        {event.name} ({event.date})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Geen gerelateerde events gevonden.
                </Typography>
              )}
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Aanbevelingen:
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2">
                    {topic.status === 'rising' ? (
                      `Benut de groeiende interesse in "${selectedTopic}" door dit onderwerp centraal te stellen in uw marketingcommunicatie en productinnovatie.`
                    ) : topic.status === 'declining' ? (
                      `Evalueer uw strategie met betrekking tot "${selectedTopic}" en overweeg aanpassingen om relevantie te behouden.`
                    ) : (
                      `Blijf de ontwikkeling van "${selectedTopic}" monitoren en zoek naar mogelijkheden om dit onderwerp te koppelen aan uw merkwaarden.`
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
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
      >
        <Tab label="Timeline" />
        <Tab label="Opkomende Topics" />
        <Tab label="Cross-Platform" />
      </Tabs>
      
      {/* Visualisatie op basis van geselecteerde tab */}
      {activeTab === 0 && renderTimelineChart()}
      {activeTab === 1 && renderEmergingTopics()}
      {activeTab === 2 && renderCrossPlatformComparison()}
      
      {/* Topic details */}
      {selectedTopic && renderTopicDetails()}
      
      {/* Fallback voor ontbrekende data */}
      {!data && !timelineData && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Geen data beschikbaar voor visualisatie.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

TrendingTopicsTimeline.propTypes = {
  data: PropTypes.object,
  platform: PropTypes.string,
  height: PropTypes.number,
  onTopicClick: PropTypes.func
};

export default TrendingTopicsTimeline;
