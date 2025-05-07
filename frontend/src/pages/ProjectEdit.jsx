import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  Skeleton,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../api/supabase';
import { useAuthStore } from '../store/authStore';

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    product_details: {
      name: '',
      description: '',
      category: '',
      target_audience: [],
      price_range: '',
      features: []
    },
    research_scope: {
      platforms: [],
      timeframe: 'laatste_maand',
      competitors: [],
      keywords: []
    }
  });

  // Tijdelijke state voor nieuwe items
  const [newKeyword, setNewKeyword] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newTargetAudience, setNewTargetAudience] = useState('');

  // Ophalen van projectgegevens
  const {
    data: project,
    isLoading,
    isError,
    error: projectError
  } = useQuery(
    ['project', id],
    async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    {
      enabled: !!user && !!id,
      staleTime: 1000 * 60 * 5, // 5 minuten
      retry: 1,
      onSuccess: (data) => {
        // Vul formulier met projectgegevens
        setFormData({
          name: data.name || '',
          description: data.description || '',
          status: data.status || 'active',
          product_details: {
            name: data.product_details?.name || '',
            description: data.product_details?.description || '',
            category: data.product_details?.category || '',
            target_audience: data.product_details?.target_audience || [],
            price_range: data.product_details?.price_range || '',
            features: data.product_details?.features || []
          },
          research_scope: {
            platforms: data.research_scope?.platforms || [],
            timeframe: data.research_scope?.timeframe || 'laatste_maand',
            competitors: data.research_scope?.competitors || [],
            keywords: data.research_scope?.keywords || []
          }
        });
      }
    }
  );

  // Project updaten
  const updateProjectMutation = useMutation(
    async (updatedProject) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updatedProject)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        // Invalidate projects query en toon succes bericht
        queryClient.invalidateQueries(['project', id]);
        queryClient.invalidateQueries(['projects']);
        setSuccess('Project succesvol bijgewerkt');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      },
      onError: (error) => {
        console.error('Fout bij updaten project:', error.message);
        setError('Er is een fout opgetreden bij het updaten van het project.');
      }
    }
  );

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      product_details: {
        ...prev.product_details,
        [name]: value
      }
    }));
  };

  const handleResearchScopeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      research_scope: {
        ...prev.research_scope,
        [name]: value
      }
    }));
  };

  const handleCheckboxChange = (e, section, field) => {
    const { checked, value } = e.target;
    
    setFormData((prev) => {
      const currentValues = prev[section][field] || [];
      
      if (checked) {
        // Voeg toe als het nog niet bestaat
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: [...currentValues, value]
          }
        };
      } else {
        // Verwijder als het bestaat
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: currentValues.filter(item => item !== value)
          }
        };
      }
    });
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      setFormData((prev) => ({
        ...prev,
        research_scope: {
          ...prev.research_scope,
          keywords: [...(prev.research_scope.keywords || []), newKeyword.trim()]
        }
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData((prev) => ({
      ...prev,
      research_scope: {
        ...prev.research_scope,
        keywords: prev.research_scope.keywords.filter(k => k !== keyword)
      }
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        product_details: {
          ...prev.product_details,
          features: [...(prev.product_details.features || []), newFeature.trim()]
        }
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature) => {
    setFormData((prev) => ({
      ...prev,
      product_details: {
        ...prev.product_details,
        features: prev.product_details.features.filter(f => f !== feature)
      }
    }));
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.trim()) {
      setFormData((prev) => ({
        ...prev,
        research_scope: {
          ...prev.research_scope,
          competitors: [...(prev.research_scope.competitors || []), newCompetitor.trim()]
        }
      }));
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (competitor) => {
    setFormData((prev) => ({
      ...prev,
      research_scope: {
        ...prev.research_scope,
        competitors: prev.research_scope.competitors.filter(c => c !== competitor)
      }
    }));
  };

  const handleAddTargetAudience = () => {
    if (newTargetAudience.trim()) {
      setFormData((prev) => ({
        ...prev,
        product_details: {
          ...prev.product_details,
          target_audience: [...(prev.product_details.target_audience || []), newTargetAudience.trim()]
        }
      }));
      setNewTargetAudience('');
    }
  };

  const handleRemoveTargetAudience = (audience) => {
    setFormData((prev) => ({
      ...prev,
      product_details: {
        ...prev.product_details,
        target_audience: prev.product_details.target_audience.filter(a => a !== audience)
      }
    }));
  };

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    updateProjectMutation.mutate(formData);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton sx={{ mr: 2 }} disabled>
            <ArrowBackIcon />
          </IconButton>
          <Skeleton variant="text" width={300} height={40} />
        </Box>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        </Paper>
      </Box>
    );
  }

  // Error state
  if (isError) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Project niet gevonden
          </Typography>
        </Box>
        <Alert severity="error">
          Er is een fout opgetreden bij het ophalen van het project: {projectError.message}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 3 }}
        >
          Terug naar dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(`/projects/${id}`)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Project bewerken: {project.name}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={updateProjectMutation.isLoading}
        >
          {updateProjectMutation.isLoading ? (
            <CircularProgress size={24} />
          ) : (
            'Opslaan'
          )}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Algemene informatie
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Projectnaam"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="active">Actief</MenuItem>
                <MenuItem value="completed">Voltooid</MenuItem>
                <MenuItem value="on_hold">On hold</MenuItem>
                <MenuItem value="cancelled">Geannuleerd</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Beschrijving"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              margin="normal"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Productdetails
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Productnaam"
              name="name"
              value={formData.product_details.name}
              onChange={handleProductDetailsChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Categorie"
              name="category"
              value={formData.product_details.category}
              onChange={handleProductDetailsChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Productbeschrijving"
              name="description"
              value={formData.product_details.description}
              onChange={handleProductDetailsChange}
              multiline
              rows={3}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Prijsrange"
              name="price_range"
              value={formData.product_details.price_range}
              onChange={handleProductDetailsChange}
              margin="normal"
              placeholder="Bijv. €10-€50"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mt: 2 }}>
              <FormLabel component="legend">Doelgroep</FormLabel>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {formData.product_details.target_audience.map((audience) => (
                  <Chip
                    key={audience}
                    label={audience}
                    onDelete={() => handleRemoveTargetAudience(audience)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', mt: 1 }}>
                <TextField
                  fullWidth
                  label="Nieuwe doelgroep"
                  value={newTargetAudience}
                  onChange={(e) => setNewTargetAudience(e.target.value)}
                  size="small"
                />
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddTargetAudience}
                  disabled={!newTargetAudience.trim()}
                  sx={{ ml: 1 }}
                >
                  Toevoegen
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <FormLabel component="legend">Productkenmerken</FormLabel>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {formData.product_details.features.map((feature) => (
                  <Chip
                    key={feature}
                    label={feature}
                    onDelete={() => handleRemoveFeature(feature)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', mt: 1 }}>
                <TextField
                  fullWidth
                  label="Nieuw kenmerk"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  size="small"
                />
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddFeature}
                  disabled={!newFeature.trim()}
                  sx={{ ml: 1 }}
                >
                  Toevoegen
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Onderzoeksscope
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Platforms</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.research_scope.platforms.includes('reddit')}
                      onChange={(e) => handleCheckboxChange(e, 'research_scope', 'platforms')}
                      value="reddit"
                    />
                  }
                  label="Reddit"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.research_scope.platforms.includes('amazon')}
                      onChange={(e) => handleCheckboxChange(e, 'research_scope', 'platforms')}
                      value="amazon"
                    />
                  }
                  label="Amazon"
                />
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tijdsperiode</InputLabel>
              <Select
                name="timeframe"
                value={formData.research_scope.timeframe}
                onChange={handleResearchScopeChange}
                label="Tijdsperiode"
              >
                <MenuItem value="laatste_week">Laatste week</MenuItem>
                <MenuItem value="laatste_maand">Laatste maand</MenuItem>
                <MenuItem value="laatste_jaar">Laatste jaar</MenuItem>
                <MenuItem value="alles">Alle beschikbare data</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mt: 2 }}>
              <FormLabel component="legend">Zoekwoorden</FormLabel>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {formData.research_scope.keywords.map((keyword) => (
                  <Chip
                    key={keyword}
                    label={keyword}
                    onDelete={() => handleRemoveKeyword(keyword)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', mt: 1 }}>
                <TextField
                  fullWidth
                  label="Nieuw zoekwoord"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  size="small"
                />
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddKeyword}
                  disabled={!newKeyword.trim()}
                  sx={{ ml: 1 }}
                >
                  Toevoegen
                </Button>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mt: 2 }}>
              <FormLabel component="legend">Concurrenten</FormLabel>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {formData.research_scope.competitors.map((competitor) => (
                  <Chip
                    key={competitor}
                    label={competitor}
                    onDelete={() => handleRemoveCompetitor(competitor)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', mt: 1 }}>
                <TextField
                  fullWidth
                  label="Nieuwe concurrent"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  size="small"
                />
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddCompetitor}
                  disabled={!newCompetitor.trim()}
                  sx={{ ml: 1 }}
                >
                  Toevoegen
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/projects/${id}`)}
          sx={{ mr: 2 }}
        >
          Annuleren
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={updateProjectMutation.isLoading}
        >
          {updateProjectMutation.isLoading ? (
            <CircularProgress size={24} />
          ) : (
            'Opslaan'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectEdit;
