import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tooltip,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
  Flag as FlagIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useAuthStore } from '../store/authStore';
import { useSnackbar } from 'notistack';

/**
 * Component voor het tonen van strategische aanbevelingen op basis van concurrentieanalyse
 * @param {object} props - Component properties
 * @param {string} props.projectId - ID van het project
 * @param {array} props.competitors - Array met concurrentanalyses
 * @param {object} props.comparativeAnalysis - Vergelijkende analyse
 * @returns {JSX.Element} StrategicRecommendations component
 */
const StrategicRecommendations = ({ projectId, competitors, comparativeAnalysis }) => {
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const [expandedSection, setExpandedSection] = useState('positioning');
  const [projectDetails, setProjectDetails] = useState(null);
  const [selectedNiche, setSelectedNiche] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [useNicheStrategy, setUseNicheStrategy] = useState(true);
  
  // Beschikbare marketingstrategieën
  const marketingStrategies = [
    { id: 'balanced', name: 'Gebalanceerd', description: 'Een evenwichtige aanpak die zowel groei als behoud van klanten nastreeft' },
    { id: 'aggressive', name: 'Agressief', description: 'Focus op snelle groei en marktaandeel vergroten, zelfs ten koste van kortetermijnwinstgevendheid' },
    { id: 'defensive', name: 'Defensief', description: 'Focus op het behouden van huidige klanten en marktpositie' },
    { id: 'niche', name: 'Niche', description: 'Focus op een specifiek marktsegment met gespecialiseerde oplossingen' },
    { id: 'innovative', name: 'Innovatief', description: 'Focus op het ontwikkelen van nieuwe producten en diensten om de markt te leiden' }
  ];

  // Haal projectdetails op bij laden
  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  // Haal aanbevelingen op bij laden of wijziging strategie/niche/product
  useEffect(() => {
    if (projectId && competitors && competitors.length > 0 && comparativeAnalysis) {
      fetchRecommendations();
    }
  }, [projectId, competitors, comparativeAnalysis, selectedStrategy, selectedNiche, selectedProduct, useNicheStrategy]);
  
  // Haal projectdetails op van de API
  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/projects/${projectId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (response.data.success && response.data.data) {
        setProjectDetails(response.data.data);
        // Stel niche en product in op basis van projectdetails
        if (response.data.data.industry) {
          setSelectedNiche(response.data.data.industry);
        } else if (response.data.data.target_market) {
          setSelectedNiche(response.data.data.target_market);
        }
        
        if (response.data.data.product_type) {
          setSelectedProduct(response.data.data.product_type);
        }
      }
    } catch (error) {
      console.error('Fout bij ophalen projectdetails:', error);
    }
  };

  // Haal aanbevelingen op van de API
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_URL}/competitor/${projectId}/recommendations`;
      let params = { strategy: selectedStrategy };
      
      // Als useNicheStrategy is ingeschakeld, gebruik de niche- of product-specifieke endpoints
      if (useNicheStrategy) {
        if (selectedNiche) {
          url = `${API_URL}/competitor/${projectId}/recommendations/niche`;
          params = { niche: selectedNiche };
        } else if (selectedProduct) {
          url = `${API_URL}/competitor/${projectId}/recommendations/product`;
          params = { product: selectedProduct };
        }
      }
      
      const response = await axios.get(url, { 
        params,
        headers: { Authorization: `Bearer ${user.token}` } 
      });
      
      if (response.data.success && response.data.data) {
        setRecommendations(response.data.data);
      } else {
        setError('Geen aanbevelingen beschikbaar');
      }
    } catch (error) {
      console.error('Fout bij ophalen aanbevelingen:', error);
      setError('Fout bij ophalen aanbevelingen');
    } finally {
      setLoading(false);
    }
  };

  // Genereer aanbevelingen op basis van geselecteerde strategie, niche of product
  const generateRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_URL}/competitor/${projectId}/recommendations/generate`;
      let data = { strategy: selectedStrategy };
      
      // Als useNicheStrategy is ingeschakeld, voeg niche of product toe aan de data
      if (useNicheStrategy) {
        if (selectedNiche) {
          data.niche = selectedNiche;
        }
        if (selectedProduct) {
          data.product = selectedProduct;
        }
      }
      
      const response = await axios.post(
        url,
        data,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (response.data.success && response.data.data) {
        setRecommendations(response.data.data);
        enqueueSnackbar('Nieuwe aanbevelingen gegenereerd', { variant: 'success' });
      } else {
        setError('Fout bij genereren aanbevelingen');
        enqueueSnackbar('Fout bij genereren aanbevelingen', { variant: 'error' });
      }
    } catch (error) {
      console.error('Fout bij genereren aanbevelingen:', error);
      setError('Fout bij genereren aanbevelingen');
      enqueueSnackbar('Fout bij genereren aanbevelingen', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handler voor strategie wijziging
  const handleStrategyChange = (event) => {
    setSelectedStrategy(event.target.value);
  };
  
  // Handler voor niche wijziging
  const handleNicheChange = (event) => {
    setSelectedNiche(event.target.value);
  };
  
  // Handler voor product wijziging
  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value);
  };
  
  // Handler voor toggle van niche-specifieke strategie
  const handleUseNicheStrategyChange = (event) => {
    setUseNicheStrategy(event.target.checked);
  };

  // Handler voor accordion wijziging
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  // Render een aanbevelingssectie
  const renderRecommendationSection = (title, icon, recommendations, description) => {
    if (!recommendations || recommendations.length === 0) return null;
    
    return (
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            avatar={icon}
            title={title}
            subheader={description}
          />
          <Divider />
          <CardContent>
            <Box component="ul" sx={{ pl: 2 }}>
              {recommendations.map((recommendation, index) => (
                <Box component="li" key={index} sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    {recommendation.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recommendation.description}
                  </Typography>
                  {recommendation.impact && (
                    <Chip 
                      label={`Impact: ${recommendation.impact}`} 
                      size="small" 
                      color={
                        recommendation.impact === 'Hoog' ? 'success' : 
                        recommendation.impact === 'Gemiddeld' ? 'primary' : 'default'
                      }
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // Als er geen concurrenten zijn, toon een melding
  if (!competitors || competitors.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Voeg concurrenten toe en voer een analyse uit om aanbevelingen te krijgen.
      </Alert>
    );
  }

  // Als er geen vergelijkende analyse is, toon een melding
  if (!comparativeAnalysis) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Voer eerst een volledige concurrentieanalyse uit om aanbevelingen te krijgen.
      </Alert>
    );
  }

  // Genereer demo aanbevelingen als er geen zijn
  if (!recommendations && !loading && !error) {
    // Demo aanbevelingen voor ontwikkeldoeleinden
    const demoRecommendations = {
      positioning: [
        {
          title: 'Versterk uw unieke waardepropositie',
          description: 'Uit de analyse blijkt dat uw belangrijkste differentiator de gebruiksvriendelijkheid is. Benadruk dit in al uw marketingcommunicatie.',
          impact: 'Hoog'
        },
        {
          title: 'Ontwikkel een duidelijkere merkidentiteit',
          description: 'Uw merk wordt minder herkend dan dat van concurrenten. Investeer in consistente visuele elementen en boodschappen.',
          impact: 'Gemiddeld'
        }
      ],
      messaging: [
        {
          title: 'Verbeter uw boodschap rond ROI',
          description: 'Concurrenten communiceren duidelijker over de financiële voordelen. Voeg concrete cijfers en case studies toe aan uw marketing.',
          impact: 'Hoog'
        },
        {
          title: 'Vereenvoudig uw communicatie',
          description: 'Uw boodschappen zijn complexer dan die van concurrenten. Vereenvoudig uw taalgebruik en focus op kernvoordelen.',
          impact: 'Gemiddeld'
        }
      ],
      features: [
        {
          title: 'Ontwikkel integratiemogelijkheden',
          description: 'Gebruikers vragen om betere integratie met populaire tools. Dit is een gap die niet door concurrenten wordt ingevuld.',
          impact: 'Hoog'
        },
        {
          title: 'Verbeter mobiele functionaliteit',
          description: 'Concurrenten bieden betere mobiele ervaringen. Investeer in responsive design en mobiele features.',
          impact: 'Gemiddeld'
        }
      ],
      pricing: [
        {
          title: 'Heroverweeg uw prijsstrategie',
          description: 'Uw prijzen liggen 15% hoger dan het marktgemiddelde zonder duidelijke toegevoegde waarde. Overweeg een herziening.',
          impact: 'Hoog'
        },
        {
          title: 'Introduceer een freemium model',
          description: 'Concurrenten trekken nieuwe gebruikers aan met gratis tiers. Een beperkte gratis versie kan uw gebruikersbasis vergroten.',
          impact: 'Gemiddeld'
        }
      ],
      actionPlan: [
        {
          title: 'Korte termijn (1-3 maanden)',
          steps: [
            'Herformuleer uw waardepropositie',
            'Verbeter website messaging',
            'Start A/B tests voor verschillende prijsmodellen'
          ]
        },
        {
          title: 'Middellange termijn (3-6 maanden)',
          steps: [
            'Ontwikkel top 3 gevraagde integraties',
            'Lanceer verbeterde mobiele ervaring',
            'Implementeer nieuwe prijsstrategie'
          ]
        },
        {
          title: 'Lange termijn (6-12 maanden)',
          steps: [
            'Volledige merkvernieuwing',
            'Uitbreiding productaanbod',
            'Internationalisatie strategie'
          ]
        }
      ]
    };
    
    setRecommendations(demoRecommendations);
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Strategische Aanbevelingen
            <Tooltip title="Aanbevelingen op basis van concurrentieanalyse en geselecteerde marketingstrategie">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200, mr: 2 }}>
              <InputLabel>Marketingstrategie</InputLabel>
              <Select
                value={selectedStrategy}
                onChange={handleStrategyChange}
                label="Marketingstrategie"
              >
                {marketingStrategies.map((strategy) => (
                  <MenuItem key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              color="primary"
              onClick={generateRecommendations}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LightbulbIcon />}
            >
              Genereer aanbevelingen
            </Button>
          </Box>
        </Box>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {recommendations && !loading && (
          <>
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" icon={<FlagIcon />}>
                <Typography variant="subtitle2">
                  {useNicheStrategy && (selectedNiche || selectedProduct) ? (
                    <>
                      {selectedNiche ? `Niche-specifieke strategie: ${selectedNiche}` : ''}
                      {selectedNiche && selectedProduct ? ' + ' : ''}
                      {selectedProduct ? `Product-specifieke strategie: ${selectedProduct}` : ''}
                    </>
                  ) : (
                    `${marketingStrategies.find(s => s.id === selectedStrategy)?.name} Strategie`
                  )}
                </Typography>
                <Typography variant="body2">
                  {useNicheStrategy && (selectedNiche || selectedProduct) ? (
                    'Deze aanbevelingen zijn op maat gemaakt op basis van uw specifieke niche en/of producttype.'
                  ) : (
                    marketingStrategies.find(s => s.id === selectedStrategy)?.description
                  )}
                </Typography>
              </Alert>
            </Box>
            
            <Grid container spacing={3}>
              {renderRecommendationSection(
                'Positionering',
                <TrendingUpIcon color="primary" />,
                recommendations.positioning,
                'Hoe u zich kunt onderscheiden van concurrenten'
              )}
              
              {renderRecommendationSection(
                'Messaging',
                <InfoIcon color="primary" />,
                recommendations.messaging,
                'Verbeteringen voor uw communicatie en boodschappen'
              )}
              
              {renderRecommendationSection(
                'Features & Functionaliteit',
                <CheckCircleIcon color="primary" />,
                recommendations.features,
                'Productverbeteringen om concurrentievoordeel te behalen'
              )}
              
              {renderRecommendationSection(
                'Prijsstrategie',
                <ArrowForwardIcon color="primary" />,
                recommendations.pricing,
                'Aanbevelingen voor optimale prijszetting'
              )}
            </Grid>
            
            {recommendations.actionPlan && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Actieplan
                </Typography>
                
                <Accordion
                  expanded={expandedSection === 'actionPlan'}
                  onChange={handleAccordionChange('actionPlan')}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Gedetailleerd implementatieplan</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {recommendations.actionPlan.map((phase, index) => (
                        <Grid item xs={12} md={4} key={index}>
                          <Card variant="outlined">
                            <CardHeader
                              title={phase.title}
                              titleTypographyProps={{ variant: 'subtitle1' }}
                            />
                            <Divider />
                            <CardContent>
                              <Box component="ol" sx={{ pl: 2 }}>
                                {phase.steps.map((step, stepIndex) => (
                                  <Box component="li" key={stepIndex} sx={{ mb: 1 }}>
                                    <Typography variant="body2">
                                      {step}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default StrategicRecommendations;
