import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  MenuItem,
  FormControl,
  FormLabel,
  FormHelperText,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Slider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

// Stappen in het project aanmaken proces volgens PRD
const steps = ['Project Basis', 'Doelgroep Definitie', 'Databronnen Configuratie', 'Onderzoeksparameters', 'Awareness Analyse Instellingen'];

// Categorieën voor e-commerce
const categories = [
  'Mode & Kleding',
  'Elektronica',
  'Huishoudelijke apparaten',
  'Meubels & Interieur',
  'Gezondheid & Persoonlijke verzorging',
  'Sport & Outdoor',
  'Speelgoed & Games',
  'Boeken & Media',
  'Voedsel & Dranken',
  'Sieraden & Accessoires',
  'Huisdierbenodigdheden',
  'Auto & Motor',
  'Kunst & Ambachten',
  'Overig'
];

// Platforms voor onderzoek
const platforms = [
  'Google',
  'Social Media',
  'Amazon',
  'Bol.com',
  'Marktplaats',
  'PubMed',
  'Wereldwijd'
];

const ProjectCreateFixed = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  
  // Project state volgens PRD
  const [projectData, setProjectData] = useState({
    // Stap 1: Project Basis
    name: '',
    description: '',
    category: '',
    geographic_market: [], // Doelmarkt (geografisch)
    competitors: [], // Concurrenten identificatie
    
    // Stap 2: Doelgroep Definitie
    target_audience: {
      demographics: {
        gender: 'both', // male, female, both
        age_range: [18, 65],
        income_level: '',
        education_level: ''
      },
      interests: [], // Interesse categorieën
      assumed_pain_points: [], // Veronderstelde pijnpunten
      assumed_desires: [] // Veronderstelde verlangens
    },
    
    // Stap 3: Databronnen Configuratie
    data_sources: {
      reddit: {
        enabled: false,
        subreddits: [],
        include_comments: true
      },
      amazon: {
        enabled: false,
        products: [],
        categories: [],
        include_reviews: true
      },
      social_media: {
        enabled: false,
        platforms: [], // instagram, tiktok, etc.
        hashtags: [],
        accounts: [],
        include_comments: true
      },
      trustpilot: {
        enabled: false,
        brands: [],
        include_reviews: true
      },
      market_research: {
        enabled: false,
        sectors: [],
        trends: []
      }
    },
    
    // Stap 4: Onderzoeksparameters
    research_parameters: {
      date_range: {
        start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 dagen terug
        end_date: new Date().toISOString().split('T')[0] // vandaag
      },
      language_preferences: ['nl', 'en'], // Nederlands en Engels
      region_preferences: ['NL', 'BE'], // Nederland en België
      sample_size: 1000, // Standaard steekproefgrootte
      update_frequency: 'weekly', // daily, weekly, monthly
      advanced_filters: {
        sentiment: true,
        keywords: [],
        exclude_keywords: []
      }
    },
    
    // Stap 5: Awareness Analyse Instellingen
    awareness_settings: {
      key_phrases: {
        unaware: [], // Fase 1: Unaware
        problem_aware: [], // Fase 2: Problem Aware
        solution_aware: [], // Fase 3: Solution Aware
        product_aware: [], // Fase 4: Product Aware
        most_aware: [] // Fase 5: Most Aware
      },
      classification_criteria: {
        unaware_weight: 1,
        problem_aware_weight: 1,
        solution_aware_weight: 1,
        product_aware_weight: 1,
        most_aware_weight: 1
      },
      custom_phases: false, // Gebruik custom awareness fasen
      min_data_points: 50 // Minimum aantal datapunten per fase
    }
  });
  
  // Gender opties
  const genderOptions = [
    { value: 'male', label: 'Mannen' },
    { value: 'female', label: 'Vrouwen' },
    { value: 'both', label: 'Beide' }
  ];
  
  // Update frequentie opties
  const updateFrequencyOptions = [
    { value: 'daily', label: 'Dagelijks' },
    { value: 'weekly', label: 'Wekelijks' },
    { value: 'monthly', label: 'Maandelijks' }
  ];
  
  // Taal opties
  const languageOptions = [
    { value: 'nl', label: 'Nederlands' },
    { value: 'en', label: 'Engels' },
    { value: 'de', label: 'Duits' },
    { value: 'fr', label: 'Frans' }
  ];
  
  // Regio opties
  const regionOptions = [
    { value: 'NL', label: 'Nederland' },
    { value: 'BE', label: 'België' },
    { value: 'DE', label: 'Duitsland' },
    { value: 'FR', label: 'Frankrijk' },
    { value: 'UK', label: 'Verenigd Koninkrijk' },
    { value: 'US', label: 'Verenigde Staten' }
  ];
  
  // Social media platform opties
  const socialMediaPlatformOptions = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'youtube', label: 'YouTube' }
  ];
  
  // State variabelen voor formulier inputs
  const [subreddit, setSubreddit] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [brand, setBrand] = useState('');
  const [sector, setSector] = useState('');
  const [keyword, setKeyword] = useState('');
  const [excludeKeyword, setExcludeKeyword] = useState('');
  const [keyPhrase, setKeyPhrase] = useState('');
  const [currentAwarenessPhase, setCurrentAwarenessPhase] = useState('unaware');
  const [geographicMarket, setGeographicMarket] = useState('');
  const [interest, setInterest] = useState('');
  const [assumedPainPoint, setAssumedPainPoint] = useState('');
  const [assumedDesire, setAssumedDesire] = useState('');
  
  // Validatie state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Valideer huidige stap
  const validateStep = () => {
    const errors = {};
    
    if (activeStep === 0) { // Project Basis
      if (!projectData.name.trim()) {
        errors.name = 'Projectnaam is verplicht';
      }
      if (!projectData.category) {
        errors.category = 'Categorie is verplicht';
      }
      if (!projectData.description.trim()) {
        errors.description = 'Projectbeschrijving is verplicht';
      }
      if (projectData.geographic_market.length === 0) {
        errors.geographic_market = 'Selecteer ten minste één doelmarkt';
      }
    } else if (activeStep === 1) { // Doelgroep Definitie
      if (!projectData.target_audience.demographics.gender) {
        errors.gender = 'Selecteer een geslacht';
      }
    } else if (activeStep === 2) { // Databronnen Configuratie
      let anySourceEnabled = false;
      Object.keys(projectData.data_sources).forEach(source => {
        if (projectData.data_sources[source].enabled) {
          anySourceEnabled = true;
        }
      });
      
      if (!anySourceEnabled) {
        errors.data_sources = 'Selecteer ten minste één databron';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Ga naar volgende stap
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  // Ga naar vorige stap
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Update project data (Stap 1: Project Basis)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Voeg geografische markt toe
  const handleAddGeographicMarket = () => {
    if (geographicMarket && !projectData.geographic_market.includes(geographicMarket)) {
      setProjectData((prev) => ({
        ...prev,
        geographic_market: [...prev.geographic_market, geographicMarket]
      }));
      setGeographicMarket('');
    }
  };
  
  // Verwijder geografische markt
  const handleRemoveGeographicMarket = (market) => {
    setProjectData((prev) => ({
      ...prev,
      geographic_market: prev.geographic_market.filter(m => m !== market)
    }));
  };
  
  // Update doelgroep demographics (Stap 2: Doelgroep Definitie)
  const handleDemographicsChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      target_audience: {
        ...prev.target_audience,
        demographics: {
          ...prev.target_audience.demographics,
          [name]: value
        }
      }
    }));
  };
  
  // Voeg interesse toe
  const handleAddInterest = () => {
    if (interest.trim() && !projectData.target_audience.interests.includes(interest.trim())) {
      const updatedPlatforms = [...currentPlatforms, platform];
      
      // Als PubMed wordt toegevoegd, zet scientific_research op true
      const updatedScientificResearch = platform === 'PubMed' ? true : projectData.research_scope.scientific_research;
      
      setProjectData({
        ...projectData,
        research_scope: {
          ...projectData.research_scope,
          platforms: updatedPlatforms,
          scientific_research: updatedScientificResearch
        }
      });
    }
  };
  
  // Update scientific purpose
  const handleScientificPurposeChange = (e) => {
    setProjectData({
      ...projectData,
      research_scope: {
        ...projectData.research_scope,
        scientific_purpose: e.target.value
      }
    });
  };
  
  // Ingredient toevoegen
  const [newIngredient, setNewIngredient] = useState('');
  
  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setProjectData({
        ...projectData,
        research_scope: {
          ...projectData.research_scope,
          ingredients: [...projectData.research_scope.ingredients, newIngredient.trim()]
        }
      });
      setNewIngredient('');
    }
  };
  
  const handleRemoveIngredient = (ingredient) => {
    setProjectData({
      ...projectData,
      research_scope: {
        ...projectData.research_scope,
        ingredients: projectData.research_scope.ingredients.filter(i => i !== ingredient)
      }
    });
  };
  
  // Claim toevoegen
  const [newClaim, setNewClaim] = useState('');
  
  const handleAddClaim = () => {
    if (newClaim.trim()) {
      setProjectData({
        ...projectData,
        research_scope: {
          ...projectData.research_scope,
          claims: [...projectData.research_scope.claims, newClaim.trim()]
        }
      });
      setNewClaim('');
    }
  };
  
  const handleRemoveClaim = (claim) => {
    setProjectData({
      ...projectData,
      research_scope: {
        ...projectData.research_scope,
        claims: projectData.research_scope.claims.filter(c => c !== claim)
      }
    });
  };
  
  // Concurrent toevoegen
  const [competitorLink, setCompetitorLink] = useState('');
  
  const handleAddCompetitor = () => {
    if (competitorLink.trim() && projectData.competitors.length < 5) {
      setProjectData({
        ...projectData,
        competitors: [...projectData.competitors, competitorLink.trim()]
      });
      setCompetitorLink('');
    }
  };
  
  const handleRemoveCompetitor = (link) => {
    setProjectData({
      ...projectData,
      competitors: projectData.competitors.filter(l => l !== link)
    });
  };
  
  // Project aanmaken
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateStep()) {
      // Toon alert met projectgegevens
      alert('Project zou worden aangemaakt met de volgende gegevens:\n\n' + JSON.stringify(projectData, null, 2));
      
      // Navigeer terug naar dashboard
      navigate('/dashboard');
    }
  };
  
  // Handlers voor marktanalyse
  const handleMarketAnalysisChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      market_analysis: {
        ...prev.market_analysis,
        [name]: value
      }
    }));
  };

  const [segment, setSegment] = useState('');
  const [trend, setTrend] = useState('');

  const handleAddSegment = () => {
    if (segment.trim() && !projectData.market_analysis.segments.includes(segment.trim())) {
      setProjectData((prev) => ({
        ...prev,
        market_analysis: {
          ...prev.market_analysis,
          segments: [...prev.market_analysis.segments, segment.trim()]
        }
      }));
      setSegment('');
    }
  };

  const handleRemoveSegment = (segmentToRemove) => {
    setProjectData((prev) => ({
      ...prev,
      market_analysis: {
        ...prev.market_analysis,
        segments: prev.market_analysis.segments.filter(s => s !== segmentToRemove)
      }
    }));
  };

  const handleAddTrend = () => {
    if (trend.trim() && !projectData.market_analysis.trends.includes(trend.trim())) {
      setProjectData((prev) => ({
        ...prev,
        market_analysis: {
          ...prev.market_analysis,
          trends: [...prev.market_analysis.trends, trend.trim()]
        }
      }));
      setTrend('');
    }
  };

  const handleRemoveTrend = (trendToRemove) => {
    setProjectData((prev) => ({
      ...prev,
      market_analysis: {
        ...prev.market_analysis,
        trends: prev.market_analysis.trends.filter(t => t !== trendToRemove)
      }
    }));
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                select
                label="Doelmarkt"
                variant="outlined"
                fullWidth
                value={geographicMarket}
                onChange={(e) => setGeographicMarket(e.target.value)}
                error={!!validationErrors.geographic_market}
                sx={{ mr: 1 }}
              >
                {regionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
            <Typography variant="h6" gutterBottom>
              Productdetails
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="productName"
                  name="name"
                  label="Productnaam"
                  value={projectData.product_details.name}
                  onChange={handleProductDetailsChange}
                  error={!!validationErrors.productName}
                  helperText={validationErrors.productName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="productDescription"
                  name="description"
                  label="Productbeschrijving"
                  multiline
                  rows={4}
                  value={projectData.product_details.description}
                  onChange={handleProductDetailsChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider textAlign="left">
                  <Typography variant="subtitle2" color="text.secondary">
                    Doelgroep
                  </Typography>
                </Divider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel id="gender-label">Doelgroep geslacht</FormLabel>
                  <TextField
                    select
                    id="gender"
                    name="gender"
                    value={projectData.product_details.target_audience.gender}
                    onChange={handleTargetAudienceChange}
                  >
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <FormLabel id="age-range-label">Leeftijdscategorie</FormLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {projectData.product_details.target_audience.age_range[0]}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Slider
                        value={projectData.product_details.target_audience.age_range}
                        onChange={(e, newValue) => {
                          setProjectData({
                            ...projectData,
                            product_details: {
                              ...projectData.product_details,
                              target_audience: {
                                ...projectData.product_details.target_audience,
                                age_range: newValue
                              }
                            }
                          });
                        }}
                        valueLabelDisplay="auto"
                        min={0}
                        max={100}
                        step={1}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {projectData.product_details.target_audience.age_range[1]}
                    </Typography>
                  </Box>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Onderzoeksscope
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Platforms voor onderzoek
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {platforms.map((platform) => (
                  <Chip
                    key={platform}
                    label={platform}
                    onClick={() => handlePlatformToggle(platform)}
                    color={projectData.research_scope.platforms.includes(platform) ? "primary" : "default"}
                    variant={projectData.research_scope.platforms.includes(platform) ? "filled" : "outlined"}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>
            
            {/* Wetenschappelijk Onderzoek Sectie - Alleen tonen als PubMed is geselecteerd */}
            {projectData.research_scope.platforms.includes('PubMed') && (
              <Box sx={{ mt: 4, mb: 2 }}>
                <Divider sx={{ mb: 3 }}>
                  <Chip label="Wetenschappelijk Onderzoek" color="success" />
                </Divider>
                
                <Typography variant="subtitle1" gutterBottom>
                  Wetenschappelijk Onderzoek Configuratie
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Specificeer ingrediënten en claims om te onderzoeken in wetenschappelijke literatuur via PubMed.
                </Typography>
                
                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Ingrediënten
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Voeg ingrediënten toe die je wilt onderzoeken in wetenschappelijke literatuur.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Voeg ingrediënt toe"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddIngredient}
                      disabled={!newIngredient.trim()}
                    >
                      Toevoegen
                    </Button>
                  </Box>
                  
                  {projectData.research_scope.ingredients.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {projectData.research_scope.ingredients.map((ingredient, index) => (
                        <Chip
                          key={index}
                          label={ingredient}
                          onDelete={() => handleRemoveIngredient(ingredient)}
                          sx={{ m: 0.5 }}
                          color="success"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Nog geen ingrediënten toegevoegd
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Claims om te onderzoeken
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Voeg claims toe die je wetenschappelijk wilt onderbouwen.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Voeg claim toe"
                      value={newClaim}
                      onChange={(e) => setNewClaim(e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddClaim}
                      disabled={!newClaim.trim()}
                    >
                      Toevoegen
                    </Button>
                  </Box>
                  
                  {projectData.research_scope.claims.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {projectData.research_scope.claims.map((claim, index) => (
                        <Chip
                          key={index}
                          label={claim}
                          onDelete={() => handleRemoveClaim(claim)}
                          sx={{ m: 0.5 }}
                          color="success"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Nog geen claims toegevoegd
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <FormControl fullWidth>
                    <FormLabel id="scientific-purpose-label">Doel van het wetenschappelijk onderzoek</FormLabel>
                    <TextField
                      select
                      id="scientific-purpose"
                      value={projectData.research_scope.scientific_purpose}
                      onChange={handleScientificPurposeChange}
                      sx={{ mt: 1 }}
                    >
                      {scientificPurposeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Box>
              </Box>
            )}
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Concurrentieanalyse
            </Typography>
            <Typography variant="body1" paragraph>
              Voeg links toe naar concurrerende producten (maximaal 5).
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  label="URL naar concurrent"
                  value={competitorLink}
                  onChange={(e) => setCompetitorLink(e.target.value)}
                  disabled={projectData.competitors.length >= 5}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddCompetitor}
                  disabled={!competitorLink.trim() || projectData.competitors.length >= 5}
                >
                  Toevoegen
                </Button>
              </Box>
              
              {projectData.competitors.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Toegevoegde concurrenten:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {projectData.competitors.map((link, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                          {link}
                        </Typography>
                        <IconButton size="small" onClick={() => handleRemoveCompetitor(link)} color="error">
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nog geen concurrenten toegevoegd
                </Typography>
              )}
            </Box>
          </Box>
        );
      default:
        return 'Onbekende stap';
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={() => navigate('/dashboard')} 
          sx={{ mr: 2 }}
          aria-label="Terug naar dashboard"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Nieuw Project
        </Typography>
      </Box>
      
      <Box sx={{ p: 3, mb: 4, bgcolor: 'success.light', color: 'white', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          BIJGEWERKTE VERSIE - Mei 2025
        </Typography>
        <Typography variant="body1">
          Deze pagina bevat nieuwe functionaliteit voor het aanmaken van projecten, inclusief doelgroepselectie, concurrent links, en wetenschappelijk onderzoek opties.
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : undefined}>
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Terug
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              type="submit"
            >
              Project Aanmaken
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Volgende
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default ProjectCreateFixed;
