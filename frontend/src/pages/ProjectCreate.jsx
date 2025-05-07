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
  { value: 'reddit', label: 'Reddit' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'trustpilot', label: 'Trustpilot' },
  { value: 'pubmed', label: 'Wetenschappelijk Onderzoek (PubMed)' }
];

// Steekproefgrootte opties
const sampleSizes = [
  { value: 'klein', label: 'Klein (100-300 berichten)' },
  { value: 'medium', label: 'Medium (300-700 berichten)' },
  { value: 'groot', label: 'Groot (700-1000+ berichten)' }
];

// Geografische opties
const geographicOptions = [
  'Nederland',
  'België',
  'Duitsland',
  'Frankrijk',
  'Verenigd Koninkrijk',
  'Verenigde Staten',
  'Canada',
  'Australië',
  'Wereldwijd'
];

const ProjectCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
        gender: 'both', // 'male', 'female', 'both'
        age_range: [18, 65]
      }
    },
    research_scope: {
      platforms: ['reddit', 'amazon'],
      sampleSize: 'medium',
      geographicFocus: ['Nederland'],
      timeframe: 'laatste_maand',
      market_research: {
        enabled: false,
        target_gender: 'both', // 'male', 'female', 'both'
        focus_areas: []
      },
      scientific_research: {
        enabled: false,
        ingredients: [],
        claims: [],
        purpose: [] // 'education', 'marketing', 'product_development'
      }
    },
    competitors: [],
    competitor_links: [] // Array van URLs naar concurrenten
  });
  
  // Wetenschappelijk onderzoek state
  const [newIngredient, setNewIngredient] = useState('');
  const [newClaim, setNewClaim] = useState('');
  
  // Tijdelijke state voor attributen en concurrenten
  const [newAttribute, setNewAttribute] = useState({ name: '', value: '' });
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newCompetitorLink, setNewCompetitorLink] = useState('');
  
  // Doelgroep en onderzoek opties
  const genderOptions = [
    { value: 'male', label: 'Mannen' },
    { value: 'female', label: 'Vrouwen' },
    { value: 'both', label: 'Mannen & Vrouwen' }
  ];
  
  const scientificPurposeOptions = [
    { value: 'education', label: 'Educatieve content' },
    { value: 'marketing', label: 'Marketing claims' },
    { value: 'product_development', label: 'Productontwikkeling' }
  ];
  
  // Validatie state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Tijdelijke mock voor het aanmaken van een project (database onafhankelijk)
  const createProjectMutation = {
    mutate: (project) => {
      console.log('Project data:', project);
      alert('Project zou worden aangemaakt met de volgende gegevens:\n' + JSON.stringify(project, null, 2));
      // Navigeer terug naar dashboard
      navigate('/dashboard');
    },
    isLoading: false,
    error: null,
    reset: () => {}
  };
  
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
      if (!projectData.product_details.category) {
        errors.productCategory = 'Productcategorie is verplicht';
      }
    } else if (activeStep === 2) {
      if (projectData.research_scope.platforms.length === 0) {
        errors.platforms = 'Selecteer ten minste één platform';
      }
      if (projectData.research_scope.geographicFocus.length === 0) {
        errors.geographicFocus = 'Selecteer ten minste één geografische focus';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Ga naar volgende stap
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  // Ga naar vorige stap
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Submit het formulier
  const handleSubmit = () => {
    if (validateStep()) {
      createProjectMutation.mutate(projectData);
    }
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
  
  // Update research scope
  const handleResearchScopeChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({
      ...prev,
      research_scope: {
        ...prev.research_scope,
        [name]: value
      }
    }));
  };
  
  // Toggle platform selectie
  const handlePlatformToggle = (platform) => {
    const currentPlatforms = [...projectData.research_scope.platforms];
    const platformIndex = currentPlatforms.indexOf(platform);
    
    if (platformIndex === -1) {
      // Voeg platform toe
      currentPlatforms.push(platform);
    } else {
      // Verwijder platform
      currentPlatforms.splice(platformIndex, 1);
    }
    
    // Update scientific_research.enabled wanneer pubmed wordt geselecteerd of gedeselecteerd
    const isPubmedSelected = platform === 'pubmed';
    const isNowSelected = platformIndex === -1; // Was het niet geselecteerd, wordt het nu wel geselecteerd
    
    setProjectData({
      ...projectData,
      research_scope: {
        ...projectData.research_scope,
        platforms: currentPlatforms,
        scientific_research: {
          ...projectData.research_scope.scientific_research,
          enabled: isPubmedSelected && isNowSelected ? true : 
                  isPubmedSelected && !isNowSelected ? false : 
                  projectData.research_scope.scientific_research.enabled
        }
      }
    });
  };
  
  // Toggle geografische focus
  const handleGeographicToggle = (location) => {
    setProjectData((prev) => {
      const geographicFocus = prev.research_scope.geographicFocus.includes(location)
        ? prev.research_scope.geographicFocus.filter(l => l !== location)
        : [...prev.research_scope.geographicFocus, location];
        
      return {
        ...prev,
        research_scope: {
          ...prev.research_scope,
          geographicFocus
        }
      };
    });
  };
  
  // Voeg attribuut toe
  const handleAddAttribute = () => {
    if (newAttribute.name.trim() && newAttribute.value.trim()) {
      setProjectData((prev) => ({
        ...prev,
        product_details: {
          ...prev.product_details,
          attributes: [...prev.product_details.attributes, { ...newAttribute }]
        }
      }));
      setNewAttribute({ name: '', value: '' });
    }
  };
  
  // Verwijder attribuut
  const handleRemoveAttribute = (index) => {
    setProjectData((prev) => ({
      ...prev,
      product_details: {
        ...prev.product_details,
        attributes: prev.product_details.attributes.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Voeg concurrent toe
  const handleAddCompetitor = () => {
    if (newCompetitor.trim() && !projectData.competitors.includes(newCompetitor)) {
      setProjectData((prev) => ({
        ...prev,
        competitors: [...prev.competitors, newCompetitor]
      }));
      setNewCompetitor('');
    }
  };
  
  // Verwijder concurrent
  const handleRemoveCompetitor = (competitor) => {
    setProjectData({
      ...projectData,
      competitors: projectData.competitors.filter(c => c !== competitor)
    });
  };
  
  // Voeg concurrent link toe
  const handleAddCompetitorLink = () => {
    if (!newCompetitorLink.trim() || projectData.competitor_links.length >= 5) return;
    
    // Valideer URL
    try {
      new URL(newCompetitorLink);
      
      setProjectData({
        ...projectData,
        competitor_links: [...projectData.competitor_links, newCompetitorLink]
      });
      setNewCompetitorLink('');
    } catch (e) {
      setValidationErrors({
        ...validationErrors,
        competitorLink: 'Voer een geldige URL in (bijv. https://example.com)'
      });
    }
  };
  
  // Verwijder concurrent link
  const handleRemoveCompetitorLink = (link) => {
    setProjectData({
      ...projectData,
      competitor_links: projectData.competitor_links.filter(l => l !== link)
    });
  };
  
  // Update doelgroep
  const handleTargetAudienceChange = (e) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      product_details: {
        ...projectData.product_details,
        target_audience: {
          ...projectData.product_details.target_audience,
          [name]: value
        }
      }
    });
  };
  
  // Toggle wetenschappelijk onderzoek doel
  const handleScientificPurposeToggle = (purpose) => {
    const currentPurposes = projectData.research_scope.scientific_research.purpose;
    let updatedPurposes;
    
    if (currentPurposes.includes(purpose)) {
      updatedPurposes = currentPurposes.filter(p => p !== purpose);
    } else {
      updatedPurposes = [...currentPurposes, purpose];
    }
    
    setProjectData({
      ...projectData,
      research_scope: {
        ...projectData.research_scope,
        scientific_research: {
          ...projectData.research_scope.scientific_research,
          purpose: updatedPurposes
        }
      }
    });
  };
  
  // Voeg ingrediënt toe voor wetenschappelijk onderzoek
  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;
    
    setProjectData((prev) => ({
      ...prev,
      research_scope: {
        ...prev.research_scope,
        scientific_research: {
          ...prev.research_scope.scientific_research,
          ingredients: [...prev.research_scope.scientific_research.ingredients, newIngredient.trim()]
        }
      }
    }));
    
    setNewIngredient('');
  };
  
  // Verwijder ingrediënt
  const handleRemoveIngredient = (ingredient) => {
    setProjectData((prev) => ({
      ...prev,
      research_scope: {
        ...prev.research_scope,
        scientific_research: {
          ...prev.research_scope.scientific_research,
          ingredients: prev.research_scope.scientific_research.ingredients.filter(i => i !== ingredient)
        }
      }
    }));
  };
  
  // Voeg claim toe voor wetenschappelijk onderzoek
  const handleAddClaim = () => {
    if (!newClaim.trim()) return;
    
    setProjectData((prev) => ({
      ...prev,
      research_scope: {
        ...prev.research_scope,
        scientific_research: {
          ...prev.research_scope.scientific_research,
          claims: [...prev.research_scope.scientific_research.claims, newClaim.trim()]
        }
      }
    }));
    
    setNewClaim('');
  };
  
  // Verwijder claim
  const handleRemoveClaim = (claim) => {
    setProjectData((prev) => ({
      ...prev,
      research_scope: {
        ...prev.research_scope,
        scientific_research: {
          ...prev.research_scope.scientific_research,
          claims: prev.research_scope.scientific_research.claims.filter(c => c !== claim)
        }
      }
    }));
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
                  select
                  label="Categorie"
                  value={projectData.category}
                  onChange={handleChange}
                  error={!!validationErrors.category}
                  helperText={validationErrors.category || "Selecteer de hoofdcategorie voor dit project"}
                >
                  {categories.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="productCategory"
                  name="category"
                  label="Productcategorie"
                  required
                  value={projectData.product_details.category}
                  onChange={handleProductDetailsChange}
                  error={!!validationErrors.productCategory}
                  helperText={validationErrors.productCategory}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="productSubcategory"
                  name="subcategory"
                  label="Productsubcategorie"
                  value={projectData.product_details.subcategory}
                  onChange={handleProductDetailsChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="productImageUrl"
                  name="imageUrl"
                  label="Product afbeelding URL"
                  value={projectData.product_details.imageUrl}
                  onChange={handleProductDetailsChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
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
            
            {/* Wetenschappelijk Onderzoek Sectie - Alleen tonen als PubMed is geselecteerd */}
            {projectData.research_scope.platforms.includes('pubmed') && (
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
                    Voeg ingrediënten toe om wetenschappelijk onderzoek hierover te vinden.
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={10}>
                      <TextField
                        fullWidth
                        id="ingredient"
                        label="Ingrediënt naam"
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        placeholder="bijv. Collageen, Vitamine C, Retinol"
                      />
                    </Grid>
                    <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        onClick={handleAddIngredient}
                        disabled={!newIngredient.trim()}
                        startIcon={<AddIcon />}
                        color="success"
                      >
                        Toevoegen
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {projectData.research_scope.scientific_research.ingredients.length > 0 ? (
                    <Box sx={{ mt: 2 }}>
                      {projectData.research_scope.scientific_research.ingredients.map((ingredient) => (
                        <Chip
                          key={ingredient}
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
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={10}>
                      <TextField
                        fullWidth
                        id="claim"
                        label="Claim"
                        value={newClaim}
                        onChange={(e) => setNewClaim(e.target.value)}
                        placeholder="bijv. Verbetert huidhydratatie, Vermindert rimpels"
                      />
                    </Grid>
                    <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        onClick={handleAddClaim}
                        disabled={!newClaim.trim()}
                        startIcon={<AddIcon />}
                        color="success"
                      >
                        Toevoegen
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {projectData.research_scope.scientific_research.claims.length > 0 ? (
                    <Box sx={{ mt: 2 }}>
                      {projectData.research_scope.scientific_research.claims.map((claim) => (
                        <Chip
                          key={claim}
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
            <Typography variant="body2" color="text.secondary" paragraph>
              Voeg concurrerende producten of merken toe om deze te vergelijken in je analyse.
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={10}>
                <TextField
                  fullWidth
                  id="competitor"
                  label="Concurrent naam"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                />
              </Grid>
              <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleAddCompetitor}
                  disabled={!newCompetitor.trim()}
                  startIcon={<AddIcon />}
                >
                  Toevoegen
                </Button>
              </Grid>
            </Grid>
            
            {projectData.competitors.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {projectData.competitors.map((competitor) => (
                  <Chip
                    key={competitor}
                    label={competitor}
                    onDelete={() => handleRemoveCompetitor(competitor)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Nog geen concurrenten toegevoegd
              </Typography>
            )}
            
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Links naar concurrenten (optioneel, max 5)
              </Typography>
            </Divider>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={10}>
                <TextField
                  fullWidth
                  id="competitorLink"
                  label="URL naar concurrent product"
                  placeholder="https://example.com/product"
                  value={newCompetitorLink}
                  onChange={(e) => setNewCompetitorLink(e.target.value)}
                  error={!!validationErrors.competitorLink}
                  helperText={validationErrors.competitorLink}
                  disabled={projectData.competitor_links.length >= 5}
                />
              </Grid>
              <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleAddCompetitorLink}
                  disabled={!newCompetitorLink.trim() || projectData.competitor_links.length >= 5}
                  startIcon={<AddIcon />}
                >
                  Toevoegen
                </Button>
              </Grid>
            </Grid>
            
            {projectData.competitor_links.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {projectData.competitor_links.map((link, index) => (
                  <Chip
                    key={index}
                    label={link.length > 30 ? link.substring(0, 30) + '...' : link}
                    onDelete={() => handleRemoveCompetitorLink(link)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Nog geen links naar concurrenten toegevoegd
              </Typography>
            )}
            
            <Box sx={{ mt: 4 }}>
              <Alert severity="info">
                Concurrenten toevoegen is optioneel. Je kunt ook later nog concurrenten toevoegen aan je project.
              </Alert>
            </Box>
          </Box>
        );
      default:
        return 'Onbekende stap';
    }
  };
  
  return (
    <Box>
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
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 2, mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
              onClick={handleSubmit}
              disabled={createProjectMutation.isLoading}
            >
              {createProjectMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Project aanmaken'
              )}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Volgende
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectCreate;
