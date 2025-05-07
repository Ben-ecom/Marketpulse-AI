import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Compare as CompareIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ResponsiveVenn } from '@nivo/venn';

/**
 * Component voor het vergelijken van trending topics tussen platforms
 */
const TrendingTopicsComparison = ({ 
  platformTopics = {}, 
  isLoading = false,
  error = null,
  onPlatformSelect = null,
  onTopicSelect = null
}) => {
  const theme = useTheme();
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [sortBy, setSortBy] = useState('trendingScore');
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  // Effect voor het initialiseren van geselecteerde platforms
  useEffect(() => {
    if (Object.keys(platformTopics).length > 0 && selectedPlatforms.length === 0) {
      // Selecteer standaard de eerste twee platforms
      const platforms = Object.keys(platformTopics).slice(0, 2);
      setSelectedPlatforms(platforms);
    }
  }, [platformTopics, selectedPlatforms]);
  
  // Bereid data voor voor Venn diagram
  const vennData = useMemo(() => {
    if (!platformTopics || Object.keys(platformTopics).length === 0 || selectedPlatforms.length === 0) {
      return [];
    }
    
    // Verzamel topics per platform
    const platformSets = {};
    
    selectedPlatforms.forEach(platform => {
      if (platformTopics[platform]) {
        platformSets[platform] = new Set(
          platformTopics[platform].map(topic => topic.topic)
        );
      }
    });
    
    // Genereer Venn sets
    const vennSets = [];
    
    // Voeg individuele sets toe
    selectedPlatforms.forEach(platform => {
      if (platformSets[platform]) {
        vennSets.push({
          id: platform,
          label: platform.charAt(0).toUpperCase() + platform.slice(1),
          value: platformSets[platform].size,
          color: getPlatformColor(platform)
        });
      }
    });
    
    // Voeg intersecties toe voor 2 platforms
    if (selectedPlatforms.length === 2) {
      const [platform1, platform2] = selectedPlatforms;
      
      if (platformSets[platform1] && platformSets[platform2]) {
        const intersection = new Set(
          [...platformSets[platform1]].filter(topic => 
            platformSets[platform2].has(topic)
          )
        );
        
        if (intersection.size > 0) {
          vennSets.push({
            id: `${platform1}_${platform2}`,
            label: `${platform1} & ${platform2}`,
            value: intersection.size,
            sets: [platform1, platform2]
          });
        }
      }
    }
    
    // Voeg intersecties toe voor 3 platforms
    if (selectedPlatforms.length === 3) {
      const [platform1, platform2, platform3] = selectedPlatforms;
      
      // Intersectie van platform1 en platform2
      if (platformSets[platform1] && platformSets[platform2]) {
        const intersection12 = new Set(
          [...platformSets[platform1]].filter(topic => 
            platformSets[platform2].has(topic)
          )
        );
        
        if (intersection12.size > 0) {
          vennSets.push({
            id: `${platform1}_${platform2}`,
            label: `${platform1} & ${platform2}`,
            value: intersection12.size,
            sets: [platform1, platform2]
          });
        }
      }
      
      // Intersectie van platform1 en platform3
      if (platformSets[platform1] && platformSets[platform3]) {
        const intersection13 = new Set(
          [...platformSets[platform1]].filter(topic => 
            platformSets[platform3].has(topic)
          )
        );
        
        if (intersection13.size > 0) {
          vennSets.push({
            id: `${platform1}_${platform3}`,
            label: `${platform1} & ${platform3}`,
            value: intersection13.size,
            sets: [platform1, platform3]
          });
        }
      }
      
      // Intersectie van platform2 en platform3
      if (platformSets[platform2] && platformSets[platform3]) {
        const intersection23 = new Set(
          [...platformSets[platform2]].filter(topic => 
            platformSets[platform3].has(topic)
          )
        );
        
        if (intersection23.size > 0) {
          vennSets.push({
            id: `${platform2}_${platform3}`,
            label: `${platform2} & ${platform3}`,
            value: intersection23.size,
            sets: [platform2, platform3]
          });
        }
      }
      
      // Intersectie van alle drie platforms
      if (platformSets[platform1] && platformSets[platform2] && platformSets[platform3]) {
        const intersection123 = new Set(
          [...platformSets[platform1]].filter(topic => 
            platformSets[platform2].has(topic) && platformSets[platform3].has(topic)
          )
        );
        
        if (intersection123.size > 0) {
          vennSets.push({
            id: `${platform1}_${platform2}_${platform3}`,
            label: `${platform1}, ${platform2} & ${platform3}`,
            value: intersection123.size,
            sets: [platform1, platform2, platform3]
          });
        }
      }
    }
    
    return vennSets;
  }, [platformTopics, selectedPlatforms]);
  
  // Bereid vergelijkingsdata voor
  const comparisonData = useMemo(() => {
    if (!platformTopics || Object.keys(platformTopics).length === 0 || selectedPlatforms.length === 0) {
      return {
        uniqueTopics: {},
        sharedTopics: []
      };
    }
    
    // Verzamel topics per platform
    const platformSets = {};
    const platformTopicsMap = {};
    
    selectedPlatforms.forEach(platform => {
      if (platformTopics[platform]) {
        platformSets[platform] = new Set(
          platformTopics[platform].map(topic => topic.topic)
        );
        
        // Maak map van topic naar topic object
        platformTopicsMap[platform] = {};
        platformTopics[platform].forEach(topicObj => {
          platformTopicsMap[platform][topicObj.topic] = topicObj;
        });
      }
    });
    
    // Vind unieke topics per platform
    const uniqueTopics = {};
    
    selectedPlatforms.forEach(platform => {
      if (platformSets[platform]) {
        uniqueTopics[platform] = [];
        
        platformSets[platform].forEach(topic => {
          let isUnique = true;
          
          // Check of topic uniek is voor dit platform
          selectedPlatforms.forEach(otherPlatform => {
            if (otherPlatform !== platform && platformSets[otherPlatform] && platformSets[otherPlatform].has(topic)) {
              isUnique = false;
            }
          });
          
          if (isUnique) {
            uniqueTopics[platform].push(platformTopicsMap[platform][topic]);
          }
        });
        
        // Sorteer unieke topics
        uniqueTopics[platform].sort((a, b) => {
          if (sortBy === 'frequency') {
            return b.frequency - a.frequency;
          } else if (sortBy === 'growth') {
            return parseFloat(b.growth) - parseFloat(a.growth);
          } else {
            return parseFloat(b.trendingScore) - parseFloat(a.trendingScore);
          }
        });
      }
    });
    
    // Vind gedeelde topics
    const sharedTopics = [];
    const processedTopics = new Set();
    
    selectedPlatforms.forEach(platform => {
      if (platformSets[platform]) {
        platformSets[platform].forEach(topic => {
          if (!processedTopics.has(topic)) {
            processedTopics.add(topic);
            
            // Check of topic voorkomt in andere platforms
            const platforms = selectedPlatforms.filter(p => 
              platformSets[p] && platformSets[p].has(topic)
            );
            
            if (platforms.length > 1) {
              // Verzamel topic data van alle platforms
              const topicData = platforms.map(p => ({
                platform: p,
                ...platformTopicsMap[p][topic]
              }));
              
              sharedTopics.push({
                topic,
                platforms,
                data: topicData
              });
            }
          }
        });
      }
    });
    
    // Sorteer gedeelde topics
    sharedTopics.sort((a, b) => {
      // Sorteer eerst op aantal platforms (aflopend)
      if (b.platforms.length !== a.platforms.length) {
        return b.platforms.length - a.platforms.length;
      }
      
      // Dan op gemiddelde trending score (aflopend)
      const avgScoreA = a.data.reduce((sum, item) => sum + parseFloat(item.trendingScore), 0) / a.data.length;
      const avgScoreB = b.data.reduce((sum, item) => sum + parseFloat(item.trendingScore), 0) / b.data.length;
      
      return avgScoreB - avgScoreA;
    });
    
    return {
      uniqueTopics,
      sharedTopics
    };
  }, [platformTopics, selectedPlatforms, sortBy]);
  
  // Functie voor platform kleur
  const getPlatformColor = (platform) => {
    const platformColors = {
      'reddit': theme.palette.error.main,
      'twitter': theme.palette.info.main,
      'instagram': theme.palette.secondary.main,
      'facebook': theme.palette.primary.main,
      'tiktok': theme.palette.warning.dark,
      'amazon': theme.palette.warning.main,
      'trustpilot': theme.palette.success.main
    };
    
    return platformColors[platform] || theme.palette.grey[500];
  };
  
  // Handle platform selectie
  const handlePlatformChange = (event) => {
    const value = event.target.value;
    setSelectedPlatforms(value);
    
    if (onPlatformSelect) {
      onPlatformSelect(value);
    }
  };
  
  // Handle sort change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  
  // Handle topic selectie
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic === selectedTopic ? null : topic);
    
    if (onTopicSelect) {
      onTopicSelect(topic === selectedTopic ? null : topic);
    }
  };
  
  return (
    <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Platform Vergelijking
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="sort-select-label">Sorteren op</InputLabel>
            <Select
              labelId="sort-select-label"
              id="sort-select"
              value={sortBy}
              label="Sorteren op"
              onChange={handleSortChange}
            >
              <MenuItem value="trendingScore">Trending Score</MenuItem>
              <MenuItem value="frequency">Frequentie</MenuItem>
              <MenuItem value="growth">Groei</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="platform-select-label">Platforms</InputLabel>
            <Select
              labelId="platform-select-label"
              id="platform-select"
              multiple
              value={selectedPlatforms}
              onChange={handlePlatformChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={value} 
                      size="small" 
                      sx={{ 
                        bgcolor: getPlatformColor(value),
                        color: '#fff'
                      }}
                    />
                  ))}
                </Box>
              )}
            >
              {Object.keys(platformTopics).map((platform) => (
                <MenuItem key={platform} value={platform}>
                  {platform}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box p={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : Object.keys(platformTopics).length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <Typography variant="body2" color="text.secondary">
            Geen platform data beschikbaar
          </Typography>
        </Box>
      ) : selectedPlatforms.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <Typography variant="body2" color="text.secondary">
            Selecteer platforms om te vergelijken
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Venn Diagram */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardHeader 
                title="Overlap tussen platforms" 
                titleTypographyProps={{ variant: 'subtitle1' }}
              />
              <Divider />
              <CardContent sx={{ height: 350 }}>
                {vennData.length > 0 ? (
                  <Box height="100%">
                    <ResponsiveVenn
                      data={vennData}
                      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                      colors={{ scheme: 'set2' }}
                      borderWidth={2}
                      borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
                      arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                      arcLabelsSizePadding={1.5}
                      arcLabelsTextSize={12}
                      arcLabelsSkipAngle={10}
                      animate={true}
                      motionConfig="gentle"
                      tooltip={({ id, value, label }) => (
                        <Box 
                          sx={{ 
                            bgcolor: 'background.paper',
                            p: 1,
                            boxShadow: 1,
                            borderRadius: 1
                          }}
                        >
                          <Typography variant="subtitle2">{label}</Typography>
                          <Typography variant="body2">
                            {value} {value === 1 ? 'topic' : 'topics'}
                          </Typography>
                        </Box>
                      )}
                    />
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body2" color="text.secondary">
                      Geen overlap gevonden tussen geselecteerde platforms
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Gedeelde Topics */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardHeader 
                title="Gedeelde Topics" 
                titleTypographyProps={{ variant: 'subtitle1' }}
                subheader={`Topics die voorkomen op meerdere platforms (${comparisonData.sharedTopics.length})`}
              />
              <Divider />
              <CardContent sx={{ maxHeight: 350, overflow: 'auto' }}>
                {comparisonData.sharedTopics.length > 0 ? (
                  <List dense>
                    {comparisonData.sharedTopics.map((item, index) => (
                      <ListItem 
                        key={index}
                        button
                        selected={selectedTopic === item.topic}
                        onClick={() => handleTopicSelect(item.topic)}
                        sx={{ 
                          borderRadius: 1,
                          mb: 0.5,
                          bgcolor: selectedTopic === item.topic ? 
                            `${theme.palette.primary.main}10` : 
                            'transparent'
                        }}
                      >
                        <ListItemIcon>
                          {selectedTopic === item.topic ? 
                            <StarIcon color="primary" /> : 
                            <StarBorderIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <Typography variant="body2" fontWeight="medium">
                                {item.topic}
                              </Typography>
                              {item.data.some(d => d.isNew) && (
                                <Chip 
                                  label="Nieuw" 
                                  size="small" 
                                  color="secondary"
                                  sx={{ ml: 1, height: 20 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                              {item.platforms.map(platform => (
                                <Chip 
                                  key={platform}
                                  label={platform}
                                  size="small"
                                  sx={{ 
                                    height: 20,
                                    bgcolor: getPlatformColor(platform),
                                    color: '#fff'
                                  }}
                                />
                              ))}
                            </Box>
                          }
                        />
                        <Box>
                          <Tooltip title="Gemiddelde trending score">
                            <Chip
                              icon={<TrendingUpIcon />}
                              label={
                                (item.data.reduce((sum, d) => sum + parseFloat(d.trendingScore), 0) / item.data.length).toFixed(1)
                              }
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          </Tooltip>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                    <Typography variant="body2" color="text.secondary">
                      Geen gedeelde topics gevonden tussen geselecteerde platforms
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Platform Specifieke Topics */}
          {selectedPlatforms.map(platform => (
            <Grid item xs={12} md={6} lg={4} key={platform}>
              <Card variant="outlined">
                <CardHeader 
                  title={
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1">
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </Typography>
                      <Chip 
                        label={`${comparisonData.uniqueTopics[platform]?.length || 0} uniek`} 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  sx={{ 
                    bgcolor: `${getPlatformColor(platform)}10`,
                    borderBottom: `1px solid ${getPlatformColor(platform)}`
                  }}
                />
                <CardContent sx={{ maxHeight: 250, overflow: 'auto' }}>
                  {comparisonData.uniqueTopics[platform]?.length > 0 ? (
                    <List dense>
                      {comparisonData.uniqueTopics[platform].slice(0, 10).map((topic, index) => (
                        <ListItem 
                          key={index}
                          button
                          selected={selectedTopic === topic.topic}
                          onClick={() => handleTopicSelect(topic.topic)}
                          sx={{ 
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor: selectedTopic === topic.topic ? 
                              `${theme.palette.primary.main}10` : 
                              'transparent'
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center">
                                <Typography variant="body2" fontWeight="medium">
                                  {topic.topic}
                                </Typography>
                                {topic.isNew && (
                                  <Chip 
                                    label="Nieuw" 
                                    size="small" 
                                    color="secondary"
                                    sx={{ ml: 1, height: 20 }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box display="flex" alignItems="center" mt={0.5}>
                                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                  Score: {topic.trendingScore}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {topic.growth > 0 ? (
                                    <Box component="span" display="flex" alignItems="center" color="success.main">
                                      <ArrowUpwardIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                      {topic.growth}%
                                    </Box>
                                  ) : (
                                    <Box component="span" display="flex" alignItems="center" color="error.main">
                                      <ArrowDownwardIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                      {Math.abs(topic.growth)}%
                                    </Box>
                                  )}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                      
                      {comparisonData.uniqueTopics[platform].length > 10 && (
                        <ListItem sx={{ justifyContent: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            +{comparisonData.uniqueTopics[platform].length - 10} meer
                          </Typography>
                        </ListItem>
                      )}
                    </List>
                  ) : (
                    <Box display="flex" justifyContent="center" alignItems="center" height={100}>
                      <Typography variant="body2" color="text.secondary">
                        Geen unieke topics gevonden voor {platform}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

TrendingTopicsComparison.propTypes = {
  platformTopics: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  onPlatformSelect: PropTypes.func,
  onTopicSelect: PropTypes.func
};

export default TrendingTopicsComparison;
