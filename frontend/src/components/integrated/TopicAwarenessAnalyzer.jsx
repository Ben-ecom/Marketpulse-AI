import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import { 
  TrendingUp as TrendingIcon,
  Psychology as AwarenessIcon,
  Lightbulb as RecommendationIcon,
  BarChart as ChartIcon,
  Description as ReportIcon
} from '@mui/icons-material';

// Import components
import TopicAwarenessMatrix from './TopicAwarenessMatrix';
import TopicAwarenessRecommendations from './TopicAwarenessRecommendations';
import TopicAwarenessReport from './TopicAwarenessReport';
import TrendingTopicsBarChart from '../trending/TrendingTopicsBarChart';
import TrendingTopicsWordCloud from '../trending/TrendingTopicsWordCloud';

// Import utilities
import { 
  classifyTopicsByAwarenessPhase,
  calculateTopicAwarenessDistribution,
  generateContentRecommendations
} from '../../utils/insights/topicAwarenessUtils';

/**
 * TopicAwarenessAnalyzer Component
 * 
 * Deze component integreert trending topics analyse met awareness fasen classificatie om inzicht te geven
 * in welke fase van awareness de doelgroep zich bevindt voor verschillende onderwerpen. Het biedt verschillende
 * visualisaties en tools om deze inzichten te analyseren en te gebruiken voor content strategie optimalisatie.
 * 
 * De component bestaat uit verschillende tabbladen:
 * 1. Awareness Matrix - Visualiseert de verdeling van topics over awareness fasen
 * 2. Content Aanbevelingen - Toont content aanbevelingen per awareness fase
 * 3. Visualisaties - Biedt verschillende visualisaties van de awareness distributie
 * 4. Topic Details - Toont gedetailleerde informatie over een geselecteerd topic
 * 5. Rapport - Genereert een uitgebreid rapport dat kan worden geëxporteerd
 * 
 * @component
 * @example
 * ```jsx
 * <TopicAwarenessAnalyzer
 *   trendingTopics={trendingTopics}
 *   data={posts}
 *   isLoading={false}
 *   textField="text"
 *   platformField="platform"
 * />
 * ```
 */
const TopicAwarenessAnalyzer = ({ 
  trendingTopics = [],
  data = [],
  isLoading = false,
  textField = 'text',
  platformField = 'platform'
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [customOptions, setCustomOptions] = useState({
    productName: 'MarketPulse AI',
    industrie: 'marktonderzoek'
  });
  
  // Classificeer trending topics naar awareness fasen
  const topicsByPhase = useMemo(() => {
    if (!trendingTopics || trendingTopics.length === 0 || !data || data.length === 0) {
      return {};
    }
    
    return classifyTopicsByAwarenessPhase(trendingTopics, data, textField);
  }, [trendingTopics, data, textField]);
  
  // Bereken distributie
  const awarenessDistribution = useMemo(() => {
    return calculateTopicAwarenessDistribution(topicsByPhase);
  }, [topicsByPhase]);
  
  // Genereer aanbevelingen
  const contentRecommendations = useMemo(() => {
    return generateContentRecommendations(topicsByPhase, customOptions);
  }, [topicsByPhase, customOptions]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle topic selection
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };
  
  // Handle customize
  const handleCustomize = (options) => {
    setCustomOptions(prev => ({
      ...prev,
      ...options
    }));
  };
  
  // Bereken distributie data voor chart
  const distributionChartData = useMemo(() => {
    return awarenessDistribution.map(phase => ({
      name: phase.name,
      value: phase.count,
      color: phase.color
    }));
  }, [awarenessDistribution]);
  
  return (
    <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h1">
          Topic Awareness Analyzer
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Deze tool combineert trending topics analyse met awareness fasen classificatie om inzicht te geven in welke fase van awareness uw doelgroep zich bevindt voor verschillende onderwerpen. Gebruik deze inzichten om uw content strategie te optimaliseren.
      </Typography>
      
      {isLoading ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height={400}
          role="status"
          aria-live="polite"
        >
          <CircularProgress aria-label="Data wordt geladen" />
          <span className="visually-hidden">Data wordt geladen, even geduld a.u.b.</span>
        </Box>
      ) : trendingTopics.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ my: 2 }} 
          role="alert"
          aria-live="polite"
        >
          Geen trending topics beschikbaar. Voer eerst een trending topics analyse uit.
        </Alert>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="Topic awareness analyse tabbladen"
            >
              <Tab 
                icon={<AwarenessIcon />} 
                label="Awareness Matrix" 
                id="tab-0"
                aria-controls="tabpanel-0"
                aria-selected={activeTab === 0}
              />
              <Tab 
                icon={<RecommendationIcon />} 
                label="Content Aanbevelingen" 
                id="tab-1"
                aria-controls="tabpanel-1"
                aria-selected={activeTab === 1}
              />
              <Tab 
                icon={<ChartIcon />} 
                label="Visualisaties" 
                id="tab-2"
                aria-controls="tabpanel-2"
                aria-selected={activeTab === 2}
              />
              <Tab 
                icon={<TrendingIcon />} 
                label="Topic Details" 
                id="tab-3"
                aria-controls="tabpanel-3"
                aria-selected={activeTab === 3}
                disabled={!selectedTopic}
              />
              <Tab 
                icon={<ReportIcon />} 
                label="Rapport" 
                id="tab-4"
                aria-controls="tabpanel-4"
                aria-selected={activeTab === 4}
              />
            </Tabs>
          </Box>
          
          {/* Tab Panels */}
          <Box 
            role="tabpanel" 
            hidden={activeTab !== 0} 
            id="tabpanel-0" 
            aria-labelledby="tab-0"
            tabIndex={activeTab === 0 ? 0 : -1}
          >
            {activeTab === 0 && (
              <TopicAwarenessMatrix 
                topicsByPhase={topicsByPhase}
                onTopicSelect={handleTopicSelect}
                isLoading={isLoading}
              />
            )}
          </Box>
          
          <Box 
            role="tabpanel" 
            hidden={activeTab !== 1} 
            id="tabpanel-1" 
            aria-labelledby="tab-1"
            tabIndex={activeTab === 1 ? 0 : -1}
          >
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Distributie van Topics per Awareness Fase
                      </Typography>
                      <Box height={400}>
                        <TrendingTopicsBarChart 
                          data={distributionChartData}
                          valueField="value"
                          labelField="name"
                          colorField="color"
                          title=""
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Awareness Fase Statistieken
                      </Typography>
                      <Box mt={2}>
                        {awarenessDistribution.map(phase => (
                          <Box key={phase.id} mb={2}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" sx={{ color: phase.color }}>
                                {phase.name}
                              </Typography>
                              <Typography variant="subtitle1">
                                {phase.count} topics ({phase.percentage.toFixed(1)}%)
                              </Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2">
                              {phase.description}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
          
          <Box 
            role="tabpanel" 
            hidden={activeTab !== 2} 
            id="tabpanel-2" 
            aria-labelledby="tab-2"
            tabIndex={activeTab === 2 ? 0 : -1}
          >
            {activeTab === 2 && (
              <TopicAwarenessRecommendations 
                recommendations={contentRecommendations}
                isLoading={isLoading}
                onCustomize={handleCustomize}
              />
            )}
          </Box>
          
          <Box 
            role="tabpanel" 
            hidden={activeTab !== 3} 
            id="tabpanel-3" 
            aria-labelledby="tab-3"
            tabIndex={activeTab === 3 ? 0 : -1}
          >
            {activeTab === 3 && selectedTopic && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Topic Details: {selectedTopic.topic}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2">Trending Score</Typography>
                          <Typography variant="h4">{selectedTopic.trendingScore.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2">Awareness Fase</Typography>
                          <Typography variant="h4">{selectedTopic.awarenessPhase}</Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2">Confidence</Typography>
                          <Typography variant="h4">{(selectedTopic.confidence * 100).toFixed(1)}%</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Gerelateerde Topics
                      </Typography>
                      <Box height={300}>
                        <TrendingTopicsWordCloud 
                          data={trendingTopics.filter(t => 
                            t.topic !== selectedTopic.topic && 
                            t.awarenessPhase === selectedTopic.awarenessPhase
                          )}
                          valueField="trendingScore"
                          labelField="topic"
                          title=""
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Content Aanbevelingen
                      </Typography>
                      <Box mt={2}>
                        {contentRecommendations[selectedTopic.awarenessPhase]?.contentIdeas.map((idea, index) => (
                          <Box key={index} mb={2}>
                            <Typography variant="body1">
                              {index + 1}. {idea}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
          
          <Box 
            role="tabpanel" 
            hidden={activeTab !== 4} 
            id="tabpanel-4" 
            aria-labelledby="tab-4"
            tabIndex={activeTab === 4 ? 0 : -1}
          >
            {activeTab === 4 && (
              <TopicAwarenessReport
                topicsByPhase={topicsByPhase}
                awarenessDistribution={awarenessDistribution}
                contentRecommendations={contentRecommendations}
                trendingTopics={trendingTopics}
                projectName={projectName || 'Topic Awareness Analyse'}
                isLoading={isLoading}
              />
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

TopicAwarenessAnalyzer.propTypes = {
  /**
   * Array met trending topics data. Elk topic object moet minimaal een 'topic' property en een
   * 'trendingScore' property bevatten. Optioneel kunnen ook 'frequency' en 'growth' properties
   * worden meegegeven.
   * 
   * @type {Array.<{topic: string, trendingScore: number, frequency: number, growth: number}>}
   * @example [
   *   { topic: "product design", trendingScore: 0.85, frequency: 120, growth: 0.25 },
   *   { topic: "user research", trendingScore: 0.72, frequency: 95, growth: 0.15 }
   * ]
   */
  trendingTopics: PropTypes.arrayOf(
    PropTypes.shape({
      /** Naam van het topic */
      topic: PropTypes.string.isRequired,
      /** Trending score van het topic (0-1) */
      trendingScore: PropTypes.number.isRequired,
      /** Aantal keer dat het topic voorkomt in de dataset */
      frequency: PropTypes.number,
      /** Groeipercentage van het topic over tijd (-1 tot 1) */
      growth: PropTypes.number
    })
  ),
  
  /**
   * Array met ruwe data items (bijv. posts, comments, reviews) die gebruikt worden voor
   * de awareness classificatie. Elk item moet het gespecificeerde tekstveld bevatten.
   * 
   * @type {Array.<Object>}
   * @example [
   *   { id: 1, text: "Wat is een goede shampoo?", platform: "twitter" },
   *   { id: 2, text: "Ik heb last van roos, help!", platform: "reddit" }
   * ]
   */
  data: PropTypes.arrayOf(PropTypes.object),
  
  /**
   * Indicator of de data nog geladen wordt. Wanneer true wordt een laad-indicator
   * weergegeven in plaats van de analyse resultaten.
   * 
   * @type {boolean}
   * @default false
   */
  isLoading: PropTypes.bool,
  
  /**
   * Naam van het veld in de data items dat de te classificeren tekst bevat.
   * Dit veld wordt gebruikt voor de awareness fase classificatie.
   * 
   * @type {string}
   * @default "text"
   */
  textField: PropTypes.string,
  
  /**
   * Naam van het veld in de data items dat het platform aangeeft (bijv. "twitter", "reddit").
   * Dit wordt gebruikt voor platform-specifieke analyses en visualisaties.
   * 
   * @type {string}
   * @default "platform"
   */
  platformField: PropTypes.string,
  
  /**
   * Naam van het project voor personalisatie van rapporten en visualisaties.
   * 
   * @type {string}
   */
  projectName: PropTypes.string,
  
  /**
   * Callback functie die wordt aangeroepen wanneer een topic wordt geselecteerd.
   * 
   * @type {Function}
   * @param {Object} topic - Het geselecteerde topic object
   */
  onTopicSelect: PropTypes.func
};

export default TopicAwarenessAnalyzer;
