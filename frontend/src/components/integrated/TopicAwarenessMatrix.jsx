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
  Chip,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import { AWARENESS_PHASES } from '../../utils/insights/awarenessClassification';

/**
 * TopicAwarenessMatrix Component
 * 
 * Deze component visualiseert trending topics gegroepeerd per awareness fase in een matrix-layout.
 * Elke fase wordt weergegeven als een kaart met daarin de relevante topics als chips. Gebruikers
 * kunnen op topics klikken om meer details te zien en deze te selecteren voor verdere analyse.
 * 
 * De component toont de vijf awareness fasen volgens Eugene Schwartz's model:
 * - Unaware: Geen bewustzijn van het probleem
 * - Problem Aware: Bewust van het probleem, niet van oplossingen
 * - Solution Aware: Bewust van oplossingstypen, niet van specifieke producten
 * - Product Aware: Bewust van specifieke producten, nog niet overtuigd
 * - Most Aware: Volledig bewust, klaar voor aankoop
 * 
 * @component
 * @example
 * ```jsx
 * <TopicAwarenessMatrix
 *   topicsByPhase={topicsByPhase}
 *   onTopicSelect={handleTopicSelect}
 *   isLoading={false}
 * />
 * ```
 */
const TopicAwarenessMatrix = ({ 
  topicsByPhase = {}, 
  onTopicSelect = null,
  isLoading = false
}) => {
  const theme = useTheme();
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  // Handle topic click
  const handleTopicClick = (topic) => {
    setSelectedTopic(topic === selectedTopic ? null : topic);
    
    if (onTopicSelect) {
      onTopicSelect(topic === selectedTopic ? null : topic);
    }
  };
  
  return (
    <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Awareness Fase Matrix
        </Typography>
      </Box>
      
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
          <span className="visually-hidden">Awareness matrix wordt geladen, even geduld a.u.b.</span>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {Object.entries(AWARENESS_PHASES).map(([key, phase]) => {
            const topics = topicsByPhase[phase.id] || [];
            
            return (
              <Grid item xs={12} md={6} lg={2.4} key={phase.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    borderColor: phase.color,
                    '& .MuiCardHeader-root': {
                      bgcolor: `${phase.color}10`,
                      borderBottom: `1px solid ${phase.color}`
                    }
                  }}
                  aria-labelledby={`phase-title-${phase.id}`}
                  role="region"
                >
                  <CardHeader
                    title={
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1" id={`phase-title-${phase.id}`}>
                          {phase.name}
                        </Typography>
                        <Chip 
                          label={topics.length} 
                          size="small" 
                          sx={{ ml: 1 }}
                          color={topics.length > 0 ? "primary" : "default"}
                          aria-label={`${topics.length} topics in ${phase.name} fase`}
                        />
                      </Box>
                    }
                    subheader={
                      <Tooltip title={phase.description}>
                        <Typography 
                          variant="caption" 
                          noWrap
                          id={`phase-description-${phase.id}`}
                        >
                          {phase.description}
                        </Typography>
                      </Tooltip>
                    }
                  />
                  <CardContent 
                    sx={{ p: 1, height: 300, overflow: 'auto' }}
                    aria-labelledby={`phase-title-${phase.id}`}
                  >
                    {topics.length > 0 ? (
                      <Box role="list" aria-label={`Topics in ${phase.name} fase`}>
                        {topics.map((topic, index) => (
                          <Chip
                            key={index}
                            label={topic.topic}
                            size="medium"
                            onClick={() => handleTopicClick(topic)}
                            sx={{ 
                              m: 0.5, 
                              bgcolor: selectedTopic?.topic === topic.topic ? 
                                phase.color : 
                                `${phase.color}20`,
                              color: selectedTopic?.topic === topic.topic ? 
                                '#fff' : 
                                'text.primary',
                              '&:hover': {
                                bgcolor: `${phase.color}40`
                              }
                            }}
                            role="listitem"
                            aria-pressed={selectedTopic?.topic === topic.topic}
                            aria-label={`Topic: ${topic.topic}${topic.trendingScore ? `, trending score: ${topic.trendingScore}` : ''}${topic.frequency ? `, frequentie: ${topic.frequency}` : ''}${topic.growth ? `, groei: ${topic.growth}%` : ''}`}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Box 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center" 
                        height="100%"
                        role="status"
                        aria-live="polite"
                      >
                        <Typography variant="body2" color="text.secondary">
                          Geen trending topics in deze fase
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Paper>
  );
};

TopicAwarenessMatrix.propTypes = {
  /**
   * Object met trending topics gegroepeerd per awareness fase.
   * De sleutels zijn de awareness fase IDs (unaware, problem_aware, etc.)
   * en de waarden zijn arrays van topic objecten.
   * 
   * @type {Object.<string, Array.<{topic: string, trendingScore: number, frequency: number, growth: number, awarenessPhase: string, confidence: number}>>}
   * @example {
   *   "unaware": [
   *     { topic: "duurzame producten", trendingScore: 8.5, frequency: 120, growth: 25, awarenessPhase: "unaware", confidence: 0.8 }
   *   ],
   *   "problem_aware": [
   *     { topic: "online marketing", trendingScore: 7.8, frequency: 95, growth: 15, awarenessPhase: "problem_aware", confidence: 0.7 }
   *   ]
   * }
   */
  topicsByPhase: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        /** Naam van het topic */
        topic: PropTypes.string.isRequired,
        /** Trending score van het topic (0-10) */
        trendingScore: PropTypes.number,
        /** Aantal keer dat het topic voorkomt in de dataset */
        frequency: PropTypes.number,
        /** Groeipercentage van het topic over tijd (-100 tot 100) */
        growth: PropTypes.number,
        /** Awareness fase waarin dit topic is ingedeeld */
        awarenessPhase: PropTypes.string,
        /** Confidence score van de classificatie (0-1) */
        confidence: PropTypes.number
      })
    )
  ),
  
  /**
   * Callback functie die wordt aangeroepen wanneer een topic wordt geselecteerd.
   * Ontvangt het geselecteerde topic object als parameter, of null wanneer een
   * reeds geselecteerd topic wordt gedeselecteerd.
   * 
   * @type {Function}
   * @param {Object|null} topic - Het geselecteerde topic object of null bij deselectie
   */
  onTopicSelect: PropTypes.func,
  
  /**
   * Boolean die aangeeft of de data nog wordt geladen.
   * Wanneer true wordt een laad-indicator getoond in plaats van de matrix.
   * 
   * @type {boolean}
   * @default false
   */
  isLoading: PropTypes.bool
};

export default TopicAwarenessMatrix;
