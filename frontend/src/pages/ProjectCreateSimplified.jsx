import { useState, useEffect } from 'react';
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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { projectsApi } from '../api/apiClient';
import ConfigurationViewer from '../components/project/ConfigurationViewer';
import ApiStatusIndicator from '../components/ApiStatusIndicator';

// Stappen in het project aanmaken proces volgens vereenvoudigde PRD
const steps = ['Basisinformatie', 'Scraping Configuratie', 'Overzicht & Bevestiging'];

// Categorieën voor e-commerce
const categories = [
  'Gezondheid',
  'Schoonheid',
  'Elektronica',
  'Kleding & Fashion',
  'Huishoudelijke apparaten',
  'Meubels & Interieur',
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

// Subcategorieën per hoofdcategorie
const subcategories = {
  'Gezondheid': [
    'Supplementen',
    'Fitness apparatuur',
    'Persoonlijke verzorging',
    'Medische hulpmiddelen',
    'Wellness producten'
  ],
  'Schoonheid': [
    'Huidverzorging',
    'Make-up',
    'Haarverzorging',
    'Parfum',
    'Nagelverzorging'
  ],
  'Elektronica': [
    'Smartphones',
    'Laptops & Computers',
    'Audio apparatuur',
    'Smart home',
    'Accessoires',
    'Gaming',
    'TV & Video'
  ],
  'Kleding & Fashion': [
    'Dameskleding',
    'Herenkleding',
    'Kinderkleding',
    'Schoenen',
    'Tassen',
    'Accessoires',
    'Sportkleding',
    'Jassen & Blazers',
    'Ondergoed'
  ],
  // Andere subcategorieën hier toevoegen
};

// Geografische regio's
const regions = [
  { value: 'GLOBAL', label: 'Wereldwijd' },
  { value: 'US', label: 'Verenigde Staten' },
  { value: 'EU', label: 'Europese Unie' },
  { value: 'APAC', label: 'Azië-Pacific' },
  { value: 'NL', label: 'Nederland' },
  { value: 'BE', label: 'België' },
  { value: 'DE', label: 'Duitsland' },
  { value: 'UK', label: 'Verenigd Koninkrijk' },
  { value: 'FR', label: 'Frankrijk' }
];

const ProjectCreateSimplified = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Gegenereerde configuratie na het aanmaken van een project
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [createdProject, setCreatedProject] = useState(null);
  
  // API status tracking
  const [apiStatus, setApiStatus] = useState({
    loading: false,
    keywordsGenerated: false,
    keywordSource: null,
    keywordConfidence: null,
    configGenerated: false,
    error: null
  });
  
  // Validatie errors
  const [validationErrors, setValidationErrors] = useState({});
  
  // Tijdelijke state voor formuliervelden
  const [competitorLink, setCompetitorLink] = useState('');
  const [keyword, setKeyword] = useState('');
  
  // Project state volgens vereenvoudigde PRD
  const [projectData, setProjectData] = useState({
    // Stap 1: Basisinformatie
    name: '',
    category: '',
    subcategory: '',
    description: '',
    product_url: '',
    target_gender: 'both', // 'male', 'female', 'both'
    
    // Stap 2: Scraping Configuratie
    platforms: {
      reddit: false,
      amazon: false,
      instagram: false,
      tiktok: false,
      market_analysis: false
    },
    keywords: [],
    competitors: [],
    geographic_focus: 'GLOBAL' // Default: Wereldwijd
  });
  
  // Update subcategorie opties wanneer categorie verandert
  useEffect(() => {
    if (projectData.category && projectData.subcategory) {
      const availableSubcategories = subcategories[projectData.category] || [];
      if (!availableSubcategories.includes(projectData.subcategory)) {
        setProjectData(prev => ({
          ...prev,
          subcategory: ''
        }));
      }
    }
  }, [projectData.category]);
  
  // Valideer huidige stap
  const validateStep = () => {
    const errors = {};
    
    if (activeStep === 0) {
      // Validatie voor Stap 1: Basisinformatie
      if (!projectData.name.trim()) {
        errors.name = 'Projectnaam is verplicht';
      }
      
      if (!projectData.category) {
        errors.category = 'Selecteer een categorie';
      }
      
      if (projectData.category && subcategories[projectData.category] && !projectData.subcategory) {
        errors.subcategory = 'Selecteer een subcategorie';
      }
      
      if (!projectData.description.trim()) {
        errors.description = 'Productomschrijving is verplicht';
      } else if (projectData.description.split(' ').length < 5) {
        errors.description = 'Geef een uitgebreidere omschrijving (minimaal 5 woorden)';
      }
    } else if (activeStep === 1) {
      // Validatie voor Stap 2: Scraping Configuratie
      const platformsSelected = Object.values(projectData.platforms).some(value => value);
      if (!platformsSelected) {
        errors.platforms = 'Selecteer ten minste één platform';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Ga naar volgende stap
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  // Ga naar vorige stap
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Update project data (Stap 1: Basisinformatie)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Update platform selectie
  const handlePlatformChange = (e) => {
    const { name, checked } = e.target;
    setProjectData(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [name]: checked
      }
    }));
  };
  
  // Voeg keyword toe
  const handleAddKeyword = () => {
    if (keyword.trim() && !projectData.keywords.includes(keyword.trim())) {
      setProjectData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }));
      setKeyword('');
    }
  };
  
  // Verwijder keyword
  const handleRemoveKeyword = (keywordToRemove) => {
    setProjectData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keywordToRemove)
    }));
  };
  
  // Voeg concurrent toe
  const handleAddCompetitor = () => {
    // Eenvoudige URL validatie
    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
    
    if (competitorLink.trim() && urlPattern.test(competitorLink) && !projectData.competitors.includes(competitorLink.trim())) {
      if (projectData.competitors.length < 3) {
        setProjectData(prev => ({
          ...prev,
          competitors: [...prev.competitors, competitorLink.trim()]
        }));
        setCompetitorLink('');
      }
    } else if (!urlPattern.test(competitorLink)) {
      setError('Voer een geldige URL in');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  // Verwijder concurrent
  const handleRemoveCompetitor = (link) => {
    setProjectData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(l => l !== link)
    }));
  };
  
  // Project aanmaken
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Valideer alle velden
    const errors = validateStep();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Update API status
    setApiStatus(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    
    // API call naar backend
    projectsApi.create(projectData)
      .then(response => {
        console.log('Project aangemaakt:', response.data);
        
        // Extract API status info from response if available
        const keywordSource = response.data.data.config?.keyword_source || 'claude_api';
        const keywordConfidence = response.data.data.config?.keyword_confidence || 0.9;
        
        // Update API status
        setApiStatus({
          loading: false,
          keywordsGenerated: true,
          keywordSource: keywordSource,
          keywordConfidence: keywordConfidence,
          configGenerated: true,
          error: null
        });
        
        setSuccess(true);
        setCreatedProject(response.data.data.project);
        setGeneratedConfig(response.data.data.config);
        setActiveStep(prevStep => prevStep + 1);
      })
      .catch(err => {
        console.error('Fout bij aanmaken project:', err);
        const errorMsg = err.response?.data?.message || 'Er is een fout opgetreden bij het aanmaken van het project';
        
        // Update API status with error
        setApiStatus(prev => ({
          ...prev,
          loading: false,
          error: errorMsg
        }));
        
        setError(errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Configuratie opslaan
  const handleSaveConfig = (updatedConfig) => {
    setLoading(true);
    
    // Update API status
    setApiStatus(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    
    // API call om configuratie bij te werken
    projectsApi.updateConfig(createdProject.id, updatedConfig)
      .then(response => {
        console.log('Configuratie bijgewerkt:', response.data);
        setGeneratedConfig(response.data.config);
        
        // Update API status
        setApiStatus(prev => ({
          ...prev,
          loading: false,
          configGenerated: true
        }));
        
        // Toon succes melding
        setSuccess(true);
        // Navigeer naar dashboard na korte vertraging
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      })
      .catch(err => {
        console.error('Fout bij bijwerken configuratie:', err);
        const errorMsg = err.response?.data?.message || 'Er is een fout opgetreden bij het bijwerken van de configuratie';
        
        // Update API status with error
        setApiStatus(prev => ({
          ...prev,
          loading: false,
          error: errorMsg
        }));
        
        setError(errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Render stap inhoud
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basisinformatie
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Vul de essentiële informatie in over je product.
            </Typography>
            
            <TextField
              label="Projectnaam"
              variant="outlined"
              fullWidth
              name="name"
              value={projectData.name}
              onChange={handleChange}
              error={!!validationErrors.name}
              helperText={validationErrors.name || ''}
              sx={{ mb: 3 }}
            />
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Product categorie"
                  variant="outlined"
                  fullWidth
                  name="category"
                  value={projectData.category}
                  onChange={handleChange}
                  error={!!validationErrors.category}
                  helperText={validationErrors.category || ''}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Product subcategorie"
                  variant="outlined"
                  fullWidth
                  name="subcategory"
                  value={projectData.subcategory}
                  onChange={handleChange}
                  disabled={!projectData.category || !subcategories[projectData.category]}
                  error={!!validationErrors.subcategory}
                  helperText={validationErrors.subcategory || ''}
                >
                  {(subcategories[projectData.category] || []).map((subcategory) => (
                    <MenuItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            
            <TextField
              label="Product omschrijving en voordelen"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              name="description"
              value={projectData.description}
              onChange={handleChange}
              error={!!validationErrors.description}
              helperText={validationErrors.description || 'Beschrijf je product en de belangrijkste voordelen (1-10 zinnen)'}
              sx={{ mb: 3 }}
            />
            
            <TextField
              label="Product URL (optioneel)"
              variant="outlined"
              fullWidth
              name="product_url"
              value={projectData.product_url}
              onChange={handleChange}
              helperText="URL naar je productpagina voor extra informatie"
              sx={{ mb: 3 }}
            />
            
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Voor wie is dit product?</FormLabel>
              <RadioGroup
                row
                name="target_gender"
                value={projectData.target_gender}
                onChange={handleChange}
              >
                <FormControlLabel value="male" control={<Radio />} label="Man" />
                <FormControlLabel value="female" control={<Radio />} label="Vrouw" />
                <FormControlLabel value="both" control={<Radio />} label="Beide" />
              </RadioGroup>
            </FormControl>
          </Box>
        );
        
      case 1: // Scraping Configuratie
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Scraping Configuratie
            </Typography>
            
            {/* Info box about Claude API integration */}
            <Box sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                MarketPulse AI gebruikt Claude AI om relevante keywords te genereren op basis van je projectgegevens. 
                Deze worden gebruikt om platformspecifieke configuraties te maken voor Reddit, Amazon en sociale media.
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Selecteer de platforms waar we data moeten verzamelen en voeg extra informatie toe.
            </Typography>
            
            <FormControl 
              component="fieldset" 
              error={!!validationErrors.platforms}
              sx={{ mb: 3, width: '100%' }}
            >
              <FormLabel component="legend">Selecteer platforms</FormLabel>
              <FormHelperText>{validationErrors.platforms}</FormHelperText>
              <FormGroup>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={projectData.platforms.reddit} 
                          onChange={handlePlatformChange} 
                          name="reddit" 
                        />
                      }
                      label="Reddit"
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={projectData.platforms.amazon} 
                          onChange={handlePlatformChange} 
                          name="amazon" 
                        />
                      }
                      label="Amazon"
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={projectData.platforms.instagram} 
                          onChange={handlePlatformChange} 
                          name="instagram" 
                        />
                      }
                      label="Instagram"
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={projectData.platforms.tiktok} 
                          onChange={handlePlatformChange} 
                          name="tiktok" 
                        />
                      }
                      label="TikTok"
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={projectData.platforms.market_analysis} 
                          onChange={handlePlatformChange} 
                          name="market_analysis" 
                        />
                      }
                      label="Marktanalyse"
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </FormControl>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <FormLabel component="legend">Extra trefwoorden (optioneel)</FormLabel>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                Voeg aanvullende zoektermen toe om de resultaten te verfijnen
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  label="Trefwoord"
                  variant="outlined"
                  fullWidth
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddKeyword}
                  disabled={!keyword.trim()}
                >
                  Toevoegen
                </Button>
              </Box>
              
              {projectData.keywords.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {projectData.keywords.map((kw, index) => (
                    <Chip
                      key={index}
                      label={kw}
                      onDelete={() => handleRemoveKeyword(kw)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nog geen trefwoorden toegevoegd
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <FormLabel component="legend">Concurrerende producten (optioneel)</FormLabel>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                Voeg links toe naar concurrerende producten of websites (max. 3)
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  label="URL naar concurrent"
                  variant="outlined"
                  fullWidth
                  value={competitorLink}
                  onChange={(e) => setCompetitorLink(e.target.value)}
                  disabled={projectData.competitors.length >= 3}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddCompetitor}
                  disabled={!competitorLink.trim() || projectData.competitors.length >= 3}
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
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <FormLabel component="legend">Geografische focus</FormLabel>
              <TextField
                select
                fullWidth
                name="geographic_focus"
                value={projectData.geographic_focus}
                onChange={handleChange}
                sx={{ mt: 1.5 }}
              >
                {regions.map((region) => (
                  <MenuItem key={region.value} value={region.value}>
                    {region.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Overzicht & Bevestiging
            </Typography>
            
            {/* API Status Indicator */}
            <ApiStatusIndicator status={apiStatus} />
            
            {success && (
              <Alert 
                severity="success" 
                sx={{ mb: 3 }}
                icon={<CheckIcon fontSize="inherit" />}
              >
                Project succesvol aangemaakt! Je kunt nu de gegenereerde configuratie bekijken en aanpassen.
              </Alert>
            )}
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Project Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Naam
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {createdProject?.name || projectData.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Categorie
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {createdProject?.category || projectData.category}
                    {(createdProject?.subcategory || projectData.subcategory) && 
                      ` › ${createdProject?.subcategory || projectData.subcategory}`}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Beschrijving
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {createdProject?.description || projectData.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Geselecteerde Platforms
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {Object.entries(createdProject?.platforms || projectData.platforms)
                      .filter(([_, enabled]) => enabled)
                      .map(([platform]) => (
                        <Chip 
                          key={platform} 
                          label={platform.charAt(0).toUpperCase() + platform.slice(1).replace('_', ' ')} 
                          color="primary" 
                          variant="outlined"
                        />
                      ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            {generatedConfig && (
              <ConfigurationViewer 
                config={generatedConfig} 
                onSave={handleSaveConfig} 
                readOnly={false}
              />
            )}
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
      
      <Box sx={{ p: 3, mb: 4, bgcolor: 'primary.light', color: 'white', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Vereenvoudigde Projectaanmaak
        </Typography>
        <Typography variant="body1">
          Vul minimale informatie in en laat onze AI de rest doen. In slechts twee stappen heb je een volledig geconfigureerd project!
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
      
      <form onSubmit={activeStep === steps.length - 2 ? handleSubmit : undefined}>
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || activeStep === steps.length - 1}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Terug
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/dashboard')}
            >
              Naar Dashboard
            </Button>
          ) : activeStep === steps.length - 2 ? (
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              endIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Project Aanmaken...' : 'Project Aanmaken'}
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

export default ProjectCreateSimplified;
