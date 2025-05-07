import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Divider,
  CircularProgress,
  useTheme,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  LightbulbOutlined as IdeaIcon,
  ShareOutlined as ChannelIcon,
  CallToActionOutlined as CTAIcon,
  EditOutlined as EditIcon
} from '@mui/icons-material';
import { AWARENESS_PHASES } from '../../utils/insights/awarenessClassification';

/**
 * Component voor het tonen van content aanbevelingen per awareness fase.
 * 
 * Deze component visualiseert content aanbevelingen gebaseerd op de awareness fasen van Eugene Schwartz.
 * Het biedt gebruikers de mogelijkheid om aanbevelingen te personaliseren op basis van product/service naam
 * en industrie. Voor elke awareness fase worden specifieke content ideeën, kanalen en call-to-actions getoond.
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {Object} props.recommendations - Object met content aanbevelingen per awareness fase
 * @param {boolean} props.isLoading - Indicator of de aanbevelingen nog geladen worden
 * @param {Function} props.onCustomize - Callback functie voor het personaliseren van aanbevelingen
 * @returns {React.ReactElement} TopicAwarenessRecommendations component
 */
const TopicAwarenessRecommendations = ({ 
  recommendations = {},
  isLoading = false,
  onCustomize = null
}) => {
  const theme = useTheme();
  const [selectedPhase, setSelectedPhase] = useState('');
  const [productName, setProductName] = useState('');
  const [industrie, setIndustrie] = useState('');
  
  /**
   * Verwerkt de personalisatie van content aanbevelingen.
   * 
   * Deze functie wordt aangeroepen wanneer de gebruiker op de "Personaliseren" knop klikt.
   * Het stuurt de huidige product/service naam en industrie naar de parent component via de onCustomize callback.
   * Deze informatie wordt gebruikt om de content aanbevelingen te personaliseren op basis van de specifieke
   * behoeften van de gebruiker.
   * 
   * @function
   * @returns {void}
   */
  const handleCustomize = () => {
    if (onCustomize) {
      onCustomize({
        productName,
        industrie
      });
    }
  };
  
  return (
    <Paper elevation={0} sx={{ p: 2, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          Content Aanbevelingen
        </Typography>
        
        <Box display="flex" alignItems="center">
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200, mr: 1 }}>
            <InputLabel>Selecteer fase</InputLabel>
            <Select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              label="Selecteer fase"
            >
              <MenuItem value="">
                <em>Alle fasen</em>
              </MenuItem>
              {Object.entries(AWARENESS_PHASES).map(([key, phase]) => (
                <MenuItem key={phase.id} value={phase.id}>
                  {phase.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Box mb={3} p={2} bgcolor="#f5f5f5" borderRadius={1}>
        <Typography variant="subtitle2" gutterBottom>
          Personaliseer aanbevelingen
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Product/Service naam"
              variant="outlined"
              size="small"
              fullWidth
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Bijv. MarketPulse AI"
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Industrie/Niche"
              variant="outlined"
              size="small"
              fullWidth
              value={industrie}
              onChange={(e) => setIndustrie(e.target.value)}
              placeholder="Bijv. e-commerce"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={handleCustomize}
              startIcon={<EditIcon />}
              sx={{ height: '100%' }}
            >
              Toepassen
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {Object.entries(AWARENESS_PHASES)
            .filter(([key, phase]) => !selectedPhase || phase.id === selectedPhase)
            .map(([key, phase]) => {
              const recommendation = recommendations[phase.id];
              
              if (!recommendation) {
                return null;
              }
              
              return (
                <Grid item xs={12} md={selectedPhase ? 12 : 6} lg={selectedPhase ? 12 : 4} key={phase.id}>
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
                  >
                    <CardHeader
                      title={
                        <Box display="flex" alignItems="center">
                          <Typography variant="subtitle1">
                            {phase.name}
                          </Typography>
                        </Box>
                      }
                      subheader={
                        <Typography variant="caption">
                          {phase.description}
                        </Typography>
                      }
                    />
                    <CardContent>
                      {recommendation.topics && recommendation.topics.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" gutterBottom>
                            Trending Topics in deze fase:
                          </Typography>
                          <Box>
                            {recommendation.topics.map((topic, index) => (
                              <Chip
                                key={index}
                                label={topic.topic}
                                size="small"
                                sx={{ 
                                  m: 0.5, 
                                  bgcolor: `${phase.color}20`,
                                  '&:hover': {
                                    bgcolor: `${phase.color}40`
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <List dense>
                        <ListItem alignItems="flex-start">
                          <ListItemIcon>
                            <IdeaIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Content Ideeën"
                            secondary={
                              <List dense>
                                {recommendation.contentIdeas.map((idea, index) => (
                                  <ListItem key={index} sx={{ pl: 0 }}>
                                    <ListItemText
                                      primary={`${index + 1}. ${idea}`}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            }
                          />
                        </ListItem>
                        
                        <ListItem alignItems="flex-start">
                          <ListItemIcon>
                            <ChannelIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Aanbevolen Kanalen"
                            secondary={
                              <Box mt={1}>
                                {recommendation.channels.map((channel, index) => (
                                  <Chip
                                    key={index}
                                    label={channel}
                                    size="small"
                                    sx={{ m: 0.5 }}
                                  />
                                ))}
                              </Box>
                            }
                          />
                        </ListItem>
                        
                        <ListItem alignItems="flex-start">
                          <ListItemIcon>
                            <CTAIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Aanbevolen Call-to-Action"
                            secondary={recommendation.callToAction}
                          />
                        </ListItem>
                      </List>
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

TopicAwarenessRecommendations.propTypes = {
  /**
   * Object met content aanbevelingen per awareness fase. De sleutels zijn de awareness fase IDs
   * (unaware, problem_aware, solution_aware, product_aware, most_aware) en de waarden zijn arrays
   * van aanbevelingsobjecten specifiek voor die fase.
   * 
   * @type {Object.<string, Array.<{phase: string, contentIdeas: Array.<string>, channels: Array.<string>, callToAction: string, contentTypes: Array.<string>, tone: string}>>}
   * @example { 
   *   "unaware": [
   *     { 
   *       phase: "Unaware", 
   *       contentIdeas: ["Blogpost over industrie trends", "Infographic over marktstatistieken"], 
   *       channels: ["Social media", "Blog"], 
   *       callToAction: "Lees meer",
   *       contentTypes: ["Blog", "Infographic"],
   *       tone: "Informatief"
   *     }
   *   ], 
   *   "problem_aware": [...], 
   *   ... 
   * }
   */
  recommendations: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        /** Naam van de awareness fase */
        phase: PropTypes.string.isRequired,
        /** Lijst met content ideeën voor deze fase */
        contentIdeas: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** Lijst met aanbevolen kanalen voor deze fase */
        channels: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** Aanbevolen call-to-action voor deze fase */
        callToAction: PropTypes.string.isRequired,
        /** Lijst met aanbevolen content types voor deze fase */
        contentTypes: PropTypes.arrayOf(PropTypes.string),
        /** Aanbevolen tone-of-voice voor deze fase */
        tone: PropTypes.string
      })
    )
  ),
  
  /**
   * Indicator of de aanbevelingen nog geladen worden. Wanneer true wordt een laad-indicator
   * weergegeven in plaats van de aanbevelingen.
   * 
   * @type {boolean}
   * @default false
   */
  isLoading: PropTypes.bool,
  
  /**
   * Callback functie voor het personaliseren van aanbevelingen. Deze functie wordt aangeroepen
   * wanneer de gebruiker op de "Personaliseren" knop klikt na het invullen van de product/service
   * naam en industrie/niche velden.
   * 
   * @type {Function}
   * @param {Object} customizationOptions - Opties voor personalisatie
   * @param {string} customizationOptions.productName - Naam van het product/service
   * @param {string} customizationOptions.industrie - Industrie/niche
   * @returns {void}
   * @example
   * const handleCustomize = (options) => {
   *   console.log(`Personaliseren voor ${options.productName} in de ${options.industrie} industrie`);
   *   // Genereer gepersonaliseerde aanbevelingen
   * }
   */
  onCustomize: PropTypes.func,
  
  /**
   * Optie om alleen aanbevelingen voor specifieke fasen te tonen. Wanneer gespecificeerd,
   * worden alleen aanbevelingen voor de opgegeven fasen getoond.
   * 
   * @type {Array.<string>}
   * @example ["unaware", "problem_aware"]
   */
  filterPhases: PropTypes.arrayOf(PropTypes.string),
  
  /**
   * Callback functie die wordt aangeroepen wanneer een aanbeveling wordt geselecteerd.
   * 
   * @type {Function}
   * @param {Object} recommendation - De geselecteerde aanbeveling
   * @param {string} phaseId - ID van de awareness fase van de geselecteerde aanbeveling
   * @returns {void}
   */
  onSelectRecommendation: PropTypes.func
};

export default TopicAwarenessRecommendations;
