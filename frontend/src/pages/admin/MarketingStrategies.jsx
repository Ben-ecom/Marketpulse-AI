import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuthStore } from '../../store/authStore';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';

/**
 * Admin pagina voor het beheren van marketingstrategieën
 * @returns {JSX.Element} MarketingStrategies component
 */
function MarketingStrategies() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' of 'edit'
  const [currentStrategy, setCurrentStrategy] = useState({
    id: '',
    name: '',
    description: '',
    niche: '',
    product: '',
    full_strategy: '',
    focus_areas: ['positioning', 'messaging', 'features', 'pricing'],
    weights: {
      positioning: 0.25,
      messaging: 0.25,
      features: 0.25,
      pricing: 0.25
    }
  });
  
  // Beschikbare niches en producten
  const [availableNiches, setAvailableNiches] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [customNiche, setCustomNiche] = useState('');
  const [customProduct, setCustomProduct] = useState('');
  
  // Focus gebieden voor marketingstrategieën
  const availableFocusAreas = [
    { id: 'positioning', name: 'Positionering' },
    { id: 'messaging', name: 'Messaging' },
    { id: 'features', name: 'Features' },
    { id: 'pricing', name: 'Prijsstrategie' },
    { id: 'customer_retention', name: 'Klantbehoud' },
    { id: 'acquisition', name: 'Acquisitie' },
    { id: 'branding', name: 'Branding' },
    { id: 'market_expansion', name: 'Marktuitbreiding' }
  ];

  // Controleer of gebruiker admin is bij laden
  useEffect(() => {
    if (!user || !user.is_admin) {
      enqueueSnackbar('Alleen admins hebben toegang tot deze pagina', { variant: 'error' });
      navigate('/dashboard');
      return;
    }
    
    fetchStrategies();
  }, [user, navigate]);

  // Haal strategieën op van API
  const fetchStrategies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${API_URL}/recommendations/strategies`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (response.data.success && response.data.data) {
        setStrategies(response.data.data);
        
        // Extraheer unieke niches en producten
        const niches = [...new Set(response.data.data
          .filter(s => s.niche)
          .map(s => s.niche))];
        
        const products = [...new Set(response.data.data
          .filter(s => s.product)
          .map(s => s.product))];
        
        setAvailableNiches(niches);
        setAvailableProducts(products);
      } else {
        setError('Fout bij ophalen marketingstrategieën');
      }
    } catch (error) {
      console.error('Fout bij ophalen marketingstrategieën:', error);
      setError('Fout bij ophalen marketingstrategieën');
    } finally {
      setLoading(false);
    }
  };

  // Open dialog voor nieuwe strategie
  const handleCreateStrategy = () => {
    setCurrentStrategy({
      id: '',
      name: '',
      description: '',
      niche: '',
      product: '',
      full_strategy: '',
      focus_areas: ['positioning', 'messaging', 'features', 'pricing'],
      weights: {
        positioning: 0.25,
        messaging: 0.25,
        features: 0.25,
        pricing: 0.25
      }
    });
    setCustomNiche('');
    setCustomProduct('');
    setDialogMode('create');
    setOpenDialog(true);
  };

  // Open dialog voor bewerken strategie
  const handleEditStrategy = (strategy) => {
    setCurrentStrategy({
      ...strategy,
      // Zorg ervoor dat weights een object is met alle focus areas
      weights: {
        positioning: strategy.weights?.positioning || 0,
        messaging: strategy.weights?.messaging || 0,
        features: strategy.weights?.features || 0,
        pricing: strategy.weights?.pricing || 0,
        customer_retention: strategy.weights?.customer_retention || 0,
        acquisition: strategy.weights?.acquisition || 0,
        branding: strategy.weights?.branding || 0,
        market_expansion: strategy.weights?.market_expansion || 0
      }
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // Verwijder strategie
  const handleDeleteStrategy = async (strategyId) => {
    // Bevestig verwijdering
    if (!window.confirm('Weet u zeker dat u deze strategie wilt verwijderen?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.delete(
        `${API_URL}/recommendations/strategies/${strategyId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (response.data.success) {
        enqueueSnackbar('Strategie succesvol verwijderd', { variant: 'success' });
        fetchStrategies();
      } else {
        enqueueSnackbar('Fout bij verwijderen strategie', { variant: 'error' });
      }
    } catch (error) {
      console.error('Fout bij verwijderen strategie:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Fout bij verwijderen strategie', 
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  // Sluit dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Update strategie veld
  const handleStrategyChange = (field, value) => {
    setCurrentStrategy(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle focus area
  const handleToggleFocusArea = (area) => {
    setCurrentStrategy(prev => {
      const newFocusAreas = prev.focus_areas.includes(area)
        ? prev.focus_areas.filter(a => a !== area)
        : [...prev.focus_areas, area];
      
      // Update weights om de som op 1 te houden
      const newWeights = { ...prev.weights };
      
      if (newFocusAreas.includes(area) && !prev.focus_areas.includes(area)) {
        // Area toegevoegd, verdeel gewicht gelijk
        const weightPerArea = 1 / newFocusAreas.length;
        newFocusAreas.forEach(a => {
          newWeights[a] = weightPerArea;
        });
      } else if (!newFocusAreas.includes(area) && prev.focus_areas.includes(area)) {
        // Area verwijderd, verdeel gewicht over resterende areas
        if (newFocusAreas.length > 0) {
          const weightPerArea = 1 / newFocusAreas.length;
          newFocusAreas.forEach(a => {
            newWeights[a] = weightPerArea;
          });
        }
      }
      
      return {
        ...prev,
        focus_areas: newFocusAreas,
        weights: newWeights
      };
    });
  };

  // Update gewicht voor een focus area
  const handleWeightChange = (area, value) => {
    setCurrentStrategy(prev => {
      const newWeights = { ...prev.weights, [area]: value / 100 };
      
      // Normaliseer gewichten om de som op 1 te houden
      const totalWeight = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
      
      if (totalWeight > 0) {
        Object.keys(newWeights).forEach(key => {
          newWeights[key] = newWeights[key] / totalWeight;
        });
      }
      
      return {
        ...prev,
        weights: newWeights
      };
    });
  };

  // Sla strategie op
  const handleSaveStrategy = async () => {
    // Valideer input
    if (!currentStrategy.name || !currentStrategy.description) {
      enqueueSnackbar('Naam en beschrijving zijn vereist', { variant: 'error' });
      return;
    }
    
    if (currentStrategy.focus_areas.length === 0) {
      enqueueSnackbar('Selecteer tenminste één focus gebied', { variant: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      
      if (dialogMode === 'create') {
        // Maak nieuwe strategie aan
        const response = await axios.post(
          `${API_URL}/recommendations/strategies`,
          currentStrategy,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        
        if (response.data.success) {
          enqueueSnackbar('Strategie succesvol aangemaakt', { variant: 'success' });
          fetchStrategies();
          setOpenDialog(false);
        } else {
          enqueueSnackbar('Fout bij aanmaken strategie', { variant: 'error' });
        }
      } else {
        // Update bestaande strategie
        const response = await axios.put(
          `${API_URL}/recommendations/strategies/${currentStrategy.id}`,
          currentStrategy,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        
        if (response.data.success) {
          enqueueSnackbar('Strategie succesvol bijgewerkt', { variant: 'success' });
          fetchStrategies();
          setOpenDialog(false);
        } else {
          enqueueSnackbar('Fout bij bijwerken strategie', { variant: 'error' });
        }
      }
    } catch (error) {
      console.error('Fout bij opslaan strategie:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Fout bij opslaan strategie', 
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  // Controleer of een strategie standaard is
  const isDefaultStrategy = (strategyId) => {
    return ['balanced', 'aggressive', 'defensive', 'niche', 'innovative'].includes(strategyId);
  };
  
  // Handler voor custom niche input
  const handleCustomNicheChange = (e) => {
    setCustomNiche(e.target.value);
  };
  
  // Handler voor custom product input
  const handleCustomProductChange = (e) => {
    setCustomProduct(e.target.value);
  };
  
  // Handler voor niche selectie
  const handleNicheChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      // Laat het custom veld zien, maar update de strategie nog niet
      setCurrentStrategy({
        ...currentStrategy,
        niche: ''
      });
    } else {
      setCurrentStrategy({
        ...currentStrategy,
        niche: value
      });
      setCustomNiche('');
    }
  };
  
  // Handler voor product selectie
  const handleProductChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      // Laat het custom veld zien, maar update de strategie nog niet
      setCurrentStrategy({
        ...currentStrategy,
        product: ''
      });
    } else {
      setCurrentStrategy({
        ...currentStrategy,
        product: value
      });
      setCustomProduct('');
    }
  };
  
  // Voeg custom niche toe aan strategie
  const addCustomNiche = () => {
    if (customNiche.trim()) {
      setCurrentStrategy({
        ...currentStrategy,
        niche: customNiche.trim()
      });
      // Voeg toe aan beschikbare niches als het nog niet bestaat
      if (!availableNiches.includes(customNiche.trim())) {
        setAvailableNiches([...availableNiches, customNiche.trim()]);
      }
    }
  };
  
  // Voeg custom product toe aan strategie
  const addCustomProduct = () => {
    if (customProduct.trim()) {
      setCurrentStrategy({
        ...currentStrategy,
        product: customProduct.trim()
      });
      // Voeg toe aan beschikbare producten als het nog niet bestaat
      if (!availableProducts.includes(customProduct.trim())) {
        setAvailableProducts([...availableProducts, customProduct.trim()]);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <PageHeader 
        title="Marketingstrategieën beheren" 
        subtitle="Configureer strategieën voor AI-gestuurde aanbevelingen"
        showBackButton
        backTo="/admin"
      />
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Beheer de marketingstrategieën die worden gebruikt voor het genereren van aanbevelingen.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateStrategy}
        >
          Nieuwe strategie
        </Button>
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
      
      <Grid container spacing={3}>
        {strategies.map((strategy) => (
          <Grid item xs={12} md={6} key={strategy.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" gutterBottom>
                    {strategy.name}
                    {isDefaultStrategy(strategy.id) && (
                      <Chip 
                        label="Standaard" 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Typography>
                  
                  <Box>
                    <Tooltip title="Bewerk strategie">
                      <IconButton 
                        onClick={() => handleEditStrategy(strategy)}
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={isDefaultStrategy(strategy.id) ? 
                      "Standaard strategieën kunnen niet worden verwijderd" : 
                      "Verwijder strategie"
                    }>
                      <span>
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteStrategy(strategy.id)}
                          disabled={loading || isDefaultStrategy(strategy.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {strategy.description}
                </Typography>
                
                {strategy.niche && (
                  <Chip 
                    label={`Niche: ${strategy.niche}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                )}
                
                {strategy.product && (
                  <Chip 
                    label={`Product: ${strategy.product}`}
                    color="secondary"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Focus gebieden:
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {strategy.focus_areas?.map((area) => (
                    <Chip 
                      key={area} 
                      label={availableFocusAreas.find(a => a.id === area)?.name || area} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Box>
                
                <Typography variant="subtitle2" gutterBottom>
                  Gewichten:
                </Typography>
                
                {strategy.focus_areas?.map((area) => (
                  <Box key={area} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        {availableFocusAreas.find(a => a.id === area)?.name || area}:
                      </Typography>
                      <Typography variant="body2">
                        {Math.round((strategy.weights?.[area] || 0) * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.round((strategy.weights?.[area] || 0) * 100)} 
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                ))}
                
                {strategy.full_strategy && (
                  <Box sx={{ mt: 2 }}>
                    <Tooltip title="Deze strategie bevat een volledige strategie tekst">
                      <Chip 
                        icon={<InfoIcon />}
                        label="Volledige strategie beschikbaar"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Tooltip>
                  </Box>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <IconButton 
                  onClick={() => handleEditStrategy(strategy)}
                  color="primary"
                  disabled={isDefaultStrategy(strategy.id)}
                >
                  <EditIcon />
                </IconButton>
                
                <IconButton 
                  onClick={() => handleDeleteStrategy(strategy.id)}
                  color="error"
                  disabled={isDefaultStrategy(strategy.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Dialog voor aanmaken/bewerken strategie */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Nieuwe strategie aanmaken' : 'Strategie bewerken'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Naam"
                fullWidth
                value={currentStrategy.name}
                onChange={(e) => handleStrategyChange('name', e.target.value)}
                disabled={dialogMode === 'edit' && isDefaultStrategy(currentStrategy.id)}
                helperText={
                  dialogMode === 'edit' && isDefaultStrategy(currentStrategy.id) ?
                  "Naam van standaard strategie kan niet worden gewijzigd" : ""
                }
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Beschrijving"
                fullWidth
                multiline
                rows={3}
                value={currentStrategy.description}
                onChange={(e) => handleStrategyChange('description', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Niche</InputLabel>
                <Select
                  value={availableNiches.includes(currentStrategy.niche) ? currentStrategy.niche : customNiche ? 'custom' : ''}
                  onChange={handleNicheChange}
                  label="Niche"
                >
                  <MenuItem value="">Geen specifieke niche</MenuItem>
                  {availableNiches.map((niche) => (
                    <MenuItem key={niche} value={niche}>{niche}</MenuItem>
                  ))}
                  <MenuItem value="custom">Anders (specificeer)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  value={availableProducts.includes(currentStrategy.product) ? currentStrategy.product : customProduct ? 'custom' : ''}
                  onChange={handleProductChange}
                  label="Product"
                >
                  <MenuItem value="">Geen specifiek product</MenuItem>
                  {availableProducts.map((product) => (
                    <MenuItem key={product} value={product}>{product}</MenuItem>
                  ))}
                  <MenuItem value="custom">Anders (specificeer)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {(availableNiches.includes(currentStrategy.niche) ? false : customNiche || currentStrategy.niche === 'custom') && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Aangepaste niche"
                    fullWidth
                    value={customNiche}
                    onChange={handleCustomNicheChange}
                    placeholder="Voer een specifieke niche in"
                  />
                  <Button 
                    variant="contained" 
                    onClick={addCustomNiche}
                    sx={{ minWidth: '120px' }}
                  >
                    Toevoegen
                  </Button>
                </Box>
              </Grid>
            )}
            
            {(availableProducts.includes(currentStrategy.product) ? false : customProduct || currentStrategy.product === 'custom') && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Aangepast product"
                    fullWidth
                    value={customProduct}
                    onChange={handleCustomProductChange}
                    placeholder="Voer een specifiek product in"
                  />
                  <Button 
                    variant="contained" 
                    onClick={addCustomProduct}
                    sx={{ minWidth: '120px' }}
                  >
                    Toevoegen
                  </Button>
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Volledige strategie tekst (3000-5000 woorden)"
                fullWidth
                multiline
                rows={10}
                value={currentStrategy.full_strategy || ''}
                onChange={(e) => handleStrategyChange('full_strategy', e.target.value)}
                placeholder="Voer hier de volledige strategie tekst in. Deze zal worden gebruikt om gedetailleerde aanbevelingen te genereren voor deze specifieke niche of dit product."
                helperText={`${currentStrategy.full_strategy ? currentStrategy.full_strategy.length : 0} tekens. Voor optimale resultaten, schrijf minimaal 3000 tekens.`}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Focus gebieden
                <Tooltip title="Selecteer de gebieden waarop deze strategie zich richt">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableFocusAreas.map((area) => (
                  <Chip
                    key={area.id}
                    label={area.name}
                    onClick={() => handleToggleFocusArea(area.id)}
                    color={currentStrategy.focus_areas.includes(area.id) ? "primary" : "default"}
                    variant={currentStrategy.focus_areas.includes(area.id) ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Gewichten
                <Tooltip title="Verdeel het belang over de geselecteerde focus gebieden">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              
              {currentStrategy.focus_areas.map((area) => (
                <Box key={area} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      {availableFocusAreas.find(a => a.id === area)?.name || area}
                    </Typography>
                    <Typography variant="body2">
                      {Math.round((currentStrategy.weights?.[area] || 0) * 100)}%
                    </Typography>
                  </Box>
                  <Slider
                    value={Math.round((currentStrategy.weights?.[area] || 0) * 100)}
                    onChange={(e, value) => handleWeightChange(area, value)}
                    aria-labelledby="weight-slider"
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={0}
                    max={100}
                  />
                </Box>
              ))}
              
              <Alert severity="info" sx={{ mt: 2 }}>
                De gewichten worden automatisch genormaliseerd zodat de som 100% is.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            startIcon={<CancelIcon />}
          >
            Annuleren
          </Button>
          <Button 
            onClick={handleSaveStrategy}
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Opslaan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MarketingStrategies;
