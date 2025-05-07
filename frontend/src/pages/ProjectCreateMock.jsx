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

// Stappen in het project aanmaken proces
const steps = ['Projectinformatie', 'Productdetails', 'Onderzoeksscope', 'Concurrentieanalyse'];

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

const ProjectCreateMock = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  
  // Project state
  const [projectData, setProjectData] = useState({
    name: '',
    category: '',
    product_details: {
      name: '',
      description: '',
      imageUrl: '',
      category: '',
      subcategory: '',
      attributes: [],
      target_audience: {
        gender: 'both', // male, female, both
        age_range: [18, 65]
      },
      benefits: []
    },
    research_scope: {
      platforms: ['Google'],
      scientific_research: false,
      scientific_purpose: 'education', // education, marketing, product_development
      ingredients: [],
      claims: []
    },
    competitors: []
  });
  
  // Gender opties
  const genderOptions = [
    { value: 'male', label: 'Mannen' },
    { value: 'female', label: 'Vrouwen' },
    { value: 'both', label: 'Beide' }
  ];
  
  // Wetenschappelijk onderzoek doelen
  const scientificPurposeOptions = [
    { value: 'education', label: 'Educatieve content' },
    { value: 'marketing', label: 'Marketing claims' },
    { value: 'product_development', label: 'Productontwikkeling' }
  ];
  
  // Validatie state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Valideer huidige stap
  const validateStep = () => {
    const errors = {};
    
    if (activeStep === 0) {
      if (!projectData.name.trim()) {
        errors.name = 'Projectnaam is verplicht';
      }
      if (!projectData.category) {
        errors.category = 'Categorie is verplicht';
      }
    } else if (activeStep === 1) {
      if (!projectData.product_details.name.trim()) {
        errors.productName = 'Productnaam is verplicht';
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
  
  // Update project data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Update product details
  const handleProductDetailsChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      product_details: {
        ...prev.product_details,
        [name]: value
      }
    }));
  };
  
  // Update target audience
  const handleTargetAudienceChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      product_details: {
        ...prev.product_details,
        target_audience: {
          ...prev.product_details.target_audience,
          [name]: value
        }
      }
    }));
  };
  
  // Toggle platform selectie
  const handlePlatformToggle = (platform) => {
    const currentPlatforms = [...projectData.research_scope.platforms];
    
    if (currentPlatforms.includes(platform)) {
      // Verwijder platform als het al geselecteerd is
      const updatedPlatforms = currentPlatforms.filter(p => p !== platform);
      
      // Als PubMed wordt verwijderd, zet scientific_research op false
      const updatedScientificResearch = platform === 'PubMed' ? false : projectData.research_scope.scientific_research;
      
      setProjectData({
        ...projectData,
        research_scope: {
          ...projectData.research_scope,
          platforms: updatedPlatforms,
          scientific_research: updatedScientificResearch
        }
      });
    } else {
      // Voeg platform toe
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
  
  // Render stap inhoud
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Basisinformatie
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  name="name"
                  label="Projectnaam"
                  value={projectData.name}
                  onChange={handleChange}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="category"
                  name="category"
                  label="Categorie"
                  select
                  value={projectData.category}
                  onChange={handleChange}
                  error={!!validationErrors.category}
                  helperText={validationErrors.category}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
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

export default ProjectCreateMock;
