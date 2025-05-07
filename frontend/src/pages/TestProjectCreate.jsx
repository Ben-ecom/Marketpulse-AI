import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  FormLabel,
  Chip,
  Divider,
  Alert,
  IconButton,
  Slider,
  Container
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TestProjectCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  // Project data state
  const [projectData, setProjectData] = useState({
    name: '',
    category: '',
    subcategory: '',
    product_details: {
      name: '',
      description: '',
      benefits: [],
      target_audience: {
        gender: 'both', // 'male', 'female', 'both'
        age_range: [18, 65]
      }
    },
    research_scope: {
      platforms: ['google'],
      scientific_research: false,
      purpose: 'education' // 'education', 'marketing', 'product_development'
    },
    competitors: []
  });

  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Mannen' },
    { value: 'female', label: 'Vrouwen' },
    { value: 'both', label: 'Beide' }
  ];

  // Platform options
  const platformOptions = [
    { value: 'google', label: 'Google' },
    { value: 'pubmed', label: 'PubMed (Wetenschappelijk)' },
    { value: 'social_media', label: 'Social Media' }
  ];

  // Purpose options
  const purposeOptions = [
    { value: 'education', label: 'Educatieve content' },
    { value: 'marketing', label: 'Marketing materiaal' },
    { value: 'product_development', label: 'Productontwikkeling' }
  ];

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData({ ...projectData, [name]: value });
  };

  // Handle product details changes
  const handleProductDetailsChange = (e) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      product_details: {
        ...projectData.product_details,
        [name]: value
      }
    });
  };

  // Handle target audience changes
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

  // Handle platform selection
  const handlePlatformChange = (platform) => {
    let updatedPlatforms;
    
    if (projectData.research_scope.platforms.includes(platform)) {
      updatedPlatforms = projectData.research_scope.platforms.filter(p => p !== platform);
    } else {
      updatedPlatforms = [...projectData.research_scope.platforms, platform];
    }
    
    setProjectData({
      ...projectData,
      research_scope: {
        ...projectData.research_scope,
        platforms: updatedPlatforms,
        // Als PubMed wordt geselecteerd, zet scientific_research op true
        scientific_research: updatedPlatforms.includes('pubmed') ? true : projectData.research_scope.scientific_research
      }
    });
  };

  // Handle purpose change
  const handlePurposeChange = (e) => {
    setProjectData({
      ...projectData,
      research_scope: {
        ...projectData.research_scope,
        purpose: e.target.value
      }
    });
  };

  // Handle competitor links
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
  
  const handleRemoveCompetitor = (linkToRemove) => {
    setProjectData({
      ...projectData,
      competitors: projectData.competitors.filter(link => link !== linkToRemove)
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Hier zou normaal de code staan om het project op te slaan
    alert('Project data: ' + JSON.stringify(projectData, null, 2));
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton 
            onClick={() => navigate('/dashboard')} 
            sx={{ mr: 2 }}
            aria-label="Terug naar dashboard"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Nieuw Project (Test Versie)
          </Typography>
        </Box>
        
        <Box sx={{ p: 3, mb: 4, bgcolor: 'success.light', color: 'white', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            TEST VERSIE - Mei 2025
          </Typography>
          <Typography variant="body1">
            Dit is een vereenvoudigde test versie van de pagina voor het aanmaken van projecten, met alle nieuwe functionaliteit.
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basis project informatie */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basisinformatie
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                name="name"
                label="Projectnaam"
                value={projectData.name}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="category"
                name="category"
                label="Categorie"
                value={projectData.category}
                onChange={handleChange}
                select
              >
                <MenuItem value="voeding">Voeding</MenuItem>
                <MenuItem value="cosmetica">Cosmetica</MenuItem>
                <MenuItem value="supplementen">Supplementen</MenuItem>
                <MenuItem value="gezondheid">Gezondheid</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="subcategory"
                name="subcategory"
                label="Subcategorie"
                value={projectData.subcategory}
                onChange={handleChange}
              />
            </Grid>
            
            {/* Product details */}
            <Grid item xs={12}>
              <Divider sx={{ mt: 2, mb: 3 }}>
                <Chip label="Productdetails" />
              </Divider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="productName"
                name="name"
                label="Productnaam"
                value={projectData.product_details.name}
                onChange={handleProductDetailsChange}
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
            
            {/* Onderzoeksscope */}
            <Grid item xs={12}>
              <Divider sx={{ mt: 2, mb: 3 }}>
                <Chip label="Onderzoeksscope" />
              </Divider>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Platforms voor onderzoek
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {platformOptions.map((platform) => (
                  <Chip
                    key={platform.value}
                    label={platform.label}
                    onClick={() => handlePlatformChange(platform.value)}
                    color={projectData.research_scope.platforms.includes(platform.value) ? "primary" : "default"}
                    variant={projectData.research_scope.platforms.includes(platform.value) ? "filled" : "outlined"}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Grid>
            
            {/* Wetenschappelijk Onderzoek Sectie - Alleen tonen als PubMed is geselecteerd */}
            {projectData.research_scope.platforms.includes('pubmed') && (
              <Grid item xs={12}>
                <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Wetenschappelijk Onderzoek Configuratie
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <FormLabel id="purpose-label">Doel van het onderzoek</FormLabel>
                    <TextField
                      select
                      id="purpose"
                      value={projectData.research_scope.purpose}
                      onChange={handlePurposeChange}
                      sx={{ mt: 1 }}
                    >
                      {purposeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Box>
              </Grid>
            )}
            
            {/* Concurrenten */}
            <Grid item xs={12}>
              <Divider sx={{ mt: 2, mb: 3 }}>
                <Chip label="Concurrenten" />
              </Divider>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Links naar concurrerende producten (max. 5)
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
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
              
              {projectData.competitors.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Toegevoegde concurrenten:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {projectData.competitors.map((link, index) => (
                      <Chip
                        key={index}
                        label={link}
                        onDelete={() => handleRemoveCompetitor(link)}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
            
            {/* Submit button */}
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Project Aanmaken
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default TestProjectCreate;
