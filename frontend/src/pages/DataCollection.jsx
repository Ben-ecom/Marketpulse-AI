import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Tabs,
  Tab,
  MenuItem,
  Select,
  InputLabel,
  Autocomplete
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Reddit as RedditIcon,
  ShoppingCart as AmazonIcon,
  DataObject as DataIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  HourglassTop as RunningIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Computer as ComputerIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../api/supabase';
import { dataApi } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';
import { 
  DATA_PLATFORMS, 
  TIMEFRAMES, 
  JOB_STATUSES,
  DEMO_SUBREDDITS,
  MAX_KEYWORDS,
  MAX_SUBREDDITS,
  GEO_LOCATIONS,
  DEVICE_TYPES,
  BROWSER_TYPES
} from '../config/constants';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`data-tabpanel-${index}`}
      aria-labelledby={`data-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DataCollection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [redditSettings, setRedditSettings] = useState({
    keywords: [],
    subreddits: [],
    timeframe: 'laatste_maand',
    includeComments: true
  });
  
  const [amazonSettings, setAmazonSettings] = useState({
    keywords: [],
    minRating: 1,
    verifiedOnly: false,
    sortBy: 'recent'
  });
  
  // Geo-locatie instellingen
  const [geoSettings, setGeoSettings] = useState({
    enabled: false,
    locations: ['nl'], // Standaard Nederland
    deviceType: 'desktop', // Standaard desktop
    browserType: 'chrome' // Standaard Chrome
  });
  
  // Platforms selectie
  const [selectedPlatforms, setSelectedPlatforms] = useState(['reddit', 'amazon']);

  // Ophalen van projectgegevens
  const {
    data: project,
    isLoading: isLoadingProject,
    isError: isProjectError,
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
      retry: 1
    }
  );

  // Ophalen van data collection jobs
  const {
    data: dataJobs,
    isLoading: isLoadingDataJobs,
    refetch: refetchDataJobs
  } = useQuery(
    ['dataJobs', id],
    async () => {
      const response = await dataApi.getDataJobs(id);
      return response.data.data;
    },
    {
      enabled: !!user && !!id,
      staleTime: 1000 * 60 * 1, // 1 minuut
      onError: (error) => {
        console.error('Fout bij ophalen data jobs:', error);
      }
    }
  );

  // Ophalen van Reddit data
  const {
    data: redditData,
    isLoading: isLoadingRedditData,
    refetch: refetchRedditData
  } = useQuery(
    ['redditData', id],
    async () => {
      const response = await dataApi.getRedditData(id);
      return response.data.data;
    },
    {
      enabled: !!user && !!id,
      staleTime: 1000 * 60 * 5, // 5 minuten
      onError: (error) => {
        console.error('Fout bij ophalen Reddit data:', error);
      }
    }
  );

  // Ophalen van Amazon data
  const {
    data: amazonData,
    isLoading: isLoadingAmazonData,
    refetch: refetchAmazonData
  } = useQuery(
    ['amazonData', id],
    async () => {
      const response = await dataApi.getAmazonData(id);
      return response.data.data;
    },
    {
      enabled: !!user && !!id,
      staleTime: 1000 * 60 * 5, // 5 minuten
      onError: (error) => {
        console.error('Fout bij ophalen Amazon data:', error);
      }
    }
  );

  // Starten van een data collection job
  const startDataCollectionMutation = useMutation(
    async (settings) => {
      const response = await dataApi.collectData({
        project_id: id,
        platforms: settings.platforms,
        settings: settings.settings
      });
      return response.data.data;
    },
    {
      onSuccess: () => {
        // Invalidate queries en toon succes bericht
        queryClient.invalidateQueries(['dataJobs', id]);
        setSuccess('Dataverzameling is gestart. Dit kan enkele minuten duren.');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      },
      onError: (error) => {
        console.error('Fout bij starten dataverzameling:', error.response?.data?.error?.message || error.message);
        setError('Er is een fout opgetreden bij het starten van de dataverzameling.');
      }
    }
  );

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Reddit settings change handler
  const handleRedditSettingsChange = (e) => {
    const { name, value, checked, type } = e.target;
    setRedditSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Subreddits change handler
  const handleSubredditsChange = (newSubreddits) => {
    setRedditSettings(prev => ({
      ...prev,
      subreddits: newSubreddits.slice(0, MAX_SUBREDDITS)
    }));
  };

  // Amazon settings change handler
  const handleAmazonSettingsChange = (e) => {
    const { name, value, checked } = e.target;
    setAmazonSettings(prev => ({
      ...prev,
      [name]: name === 'verifiedOnly' ? checked : value
    }));
  };
  
  // Geo-locatie settings change handler
  const handleGeoSettingsChange = (e) => {
    const { name, checked, value } = e.target;
    if (name === 'enabled') {
      setGeoSettings(prev => ({
        ...prev,
        enabled: checked
      }));
    } else if (name === 'deviceType' || name === 'browserType') {
      setGeoSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Geo-locaties selectie handler
  const handleGeoLocationsChange = (event, newLocations) => {
    setGeoSettings(prev => ({
      ...prev,
      locations: newLocations.map(loc => loc.code)
    }));
  };

  // Start data collection voor alle geselecteerde platforms
  const handleStartDataCollection = async () => {
    setError('');
    setSuccess('');
    
    try {
      // Valideer instellingen
      if (selectedPlatforms.length === 0) {
        setError('Selecteer ten minste één platform voor dataverzameling');
        return;
      }
      
      // Bereid data voor
      const payload = {
        project_id: id,
        platforms: {}
      };
      
      // Voeg geo-locatie instellingen toe als deze zijn ingeschakeld
      if (geoSettings.enabled && geoSettings.locations.length > 0) {
        payload.geo_settings = {
          enabled: true,
          locations: geoSettings.locations,
          deviceType: geoSettings.deviceType,
          browserType: geoSettings.browserType
        };
      }
      
      // Voeg platform-specifieke instellingen toe
      if (selectedPlatforms.includes('reddit')) {
        payload.platforms.reddit = {
          keywords: redditSettings.keywords,
          subreddits: redditSettings.subreddits,
          timeframe: redditSettings.timeframe,
          include_comments: redditSettings.includeComments
        };
      }
      
      if (selectedPlatforms.includes('amazon')) {
        payload.platforms.amazon = {
          keywords: amazonSettings.keywords,
          min_rating: amazonSettings.minRating,
          verified_only: amazonSettings.verifiedOnly,
          sort_by: amazonSettings.sortBy
        };
      }
      
      // Start dataverzameling
      startDataCollectionMutation.mutate({
        project_id: id,
        platforms: selectedPlatforms,
        settings: payload
      });
    } catch (error) {
      console.error('Fout bij starten dataverzameling:', error);
      setError('Er is een fout opgetreden bij het starten van de dataverzameling.');
    }
  };

  // Refresh data
  const handleRefreshData = () => {
    refetchDataJobs();
    refetchRedditData();
    refetchAmazonData();
  };

  // Formatteren van datum
  const formatDate = (dateString) => {
    if (!dateString) return 'Onbekend';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };
  
  // Status chip kleur
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
        return 'info';
      case 'pending':
      default:
        return 'warning';
    }
  };

  // Vul keywords in op basis van projectgegevens
  useEffect(() => {
    if (project?.product_details?.name) {
      setRedditSettings(prev => ({
        ...prev,
        keywords: project.product_details.name
      }));
      setAmazonSettings(prev => ({
        ...prev,
        keywords: project.product_details.name
      }));
    }
  }, [project]);

  // Loading state
  if (isLoadingProject) {
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
  if (isProjectError) {
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
            Dataverzameling: {project.name}
          </Typography>
        </Box>
        <Tooltip title="Ververs data">
          <IconButton onClick={handleRefreshData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
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

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<RedditIcon />} label="Reddit" />
          <Tab icon={<AmazonIcon />} label="Amazon" />
          <Tab icon={<LanguageIcon />} label="Geo-locatie" />
          <Tab icon={<DataIcon />} label="Verzamelde Data" />
        </Tabs>

        <Box sx={{ px: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Reddit Dataverzameling
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Verzamel posts en comments van Reddit om inzicht te krijgen in wat gebruikers zeggen over je product of markt.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Zoektermen (gescheiden door komma's)"
                  name="keywords"
                  value={redditSettings.keywords}
                  onChange={handleRedditSettingsChange}
                  helperText="Bijv. 'duurzame mode, eco-vriendelijke kleding, biologisch katoen'"
                  required
                  margin="normal"
                />

                <TextField
                  fullWidth
                  label="Subreddits (optioneel, gescheiden door komma's)"
                  name="subreddits"
                  value={redditSettings.subreddits}
                  onChange={handleRedditSettingsChange}
                  helperText="Bijv. 'SustainableFashion, ethicalfashion, ZeroWaste'"
                  margin="normal"
                />

                <FormControl component="fieldset" margin="normal">
                  <FormLabel component="legend">Tijdsperiode</FormLabel>
                  <RadioGroup
                    name="timeframe"
                    value={redditSettings.timeframe}
                    onChange={handleRedditSettingsChange}
                  >
                    <FormControlLabel value="laatste_week" control={<Radio />} label="Laatste week" />
                    <FormControlLabel value="laatste_maand" control={<Radio />} label="Laatste maand" />
                    <FormControlLabel value="laatste_jaar" control={<Radio />} label="Laatste jaar" />
                    <FormControlLabel value="alles" control={<Radio />} label="Alle beschikbare data" />
                  </RadioGroup>
                </FormControl>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={redditSettings.includeComments}
                        onChange={handleRedditSettingsChange}
                        name="includeComments"
                      />
                    }
                    label="Inclusief comments"
                  />
                </FormGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3, height: 'calc(100% - 64px)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Reddit Data Statistieken
                    </Typography>
                    {isLoadingRedditData ? (
                      <Skeleton variant="rectangular" height={100} />
                    ) : (
                      <>
                        <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                          {redditData?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Reddit posts/comments verzameld
                        </Typography>
                        {redditData && redditData.length > 0 && (
                          <Typography variant="body2" sx={{ mt: 2 }}>
                            Laatst bijgewerkt: {formatDate(redditData[0].created_at)}
                          </Typography>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStartRedditCollection}
                  disabled={startDataCollectionMutation.isLoading || !redditSettings.keywords.trim()}
                >
                  {startDataCollectionMutation.isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Start Reddit Dataverzameling'
                  )}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Amazon Dataverzameling
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Verzamel reviews van Amazon om inzicht te krijgen in wat klanten vinden van producten in jouw markt.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Zoektermen (gescheiden door komma's)"
                  name="keywords"
                  value={amazonSettings.keywords}
                  onChange={handleAmazonSettingsChange}
                  helperText="Bijv. 'duurzame jeans, eco-vriendelijke broek, biologisch katoen jeans'"
                  required
                  margin="normal"
                />

                <FormControl component="fieldset" margin="normal" fullWidth>
                  <FormLabel component="legend">Minimale rating</FormLabel>
                  <RadioGroup
                    name="minRating"
                    value={amazonSettings.minRating.toString()}
                    onChange={handleAmazonSettingsChange}
                    row
                  >
                    <FormControlLabel value="1" control={<Radio />} label="1+ ster" />
                    <FormControlLabel value="2" control={<Radio />} label="2+ sterren" />
                    <FormControlLabel value="3" control={<Radio />} label="3+ sterren" />
                    <FormControlLabel value="4" control={<Radio />} label="4+ sterren" />
                  </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" margin="normal" fullWidth>
                  <FormLabel component="legend">Sorteren op</FormLabel>
                  <RadioGroup
                    name="sortBy"
                    value={amazonSettings.sortBy}
                    onChange={handleAmazonSettingsChange}
                    row
                  >
                    <FormControlLabel value="recent" control={<Radio />} label="Meest recent" />
                    <FormControlLabel value="helpful" control={<Radio />} label="Meest behulpzaam" />
                    <FormControlLabel value="rating_asc" control={<Radio />} label="Rating (laag-hoog)" />
                    <FormControlLabel value="rating_desc" control={<Radio />} label="Rating (hoog-laag)" />
                  </RadioGroup>
                </FormControl>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={amazonSettings.verifiedOnly}
                        onChange={handleAmazonSettingsChange}
                        name="verifiedOnly"
                      />
                    }
                    label="Alleen verified purchases"
                  />
                </FormGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3, height: 'calc(100% - 64px)' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Amazon Data Statistieken
                    </Typography>
                    {isLoadingAmazonData ? (
                      <Skeleton variant="rectangular" height={100} />
                    ) : (
                      <>
                        <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                          {amazonData?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Amazon reviews verzameld
                        </Typography>
                        {amazonData && amazonData.length > 0 && (
                          <Typography variant="body2" sx={{ mt: 2 }}>
                            Laatst bijgewerkt: {formatDate(amazonData[0].created_at)}
                          </Typography>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStartAmazonCollection}
                  disabled={startDataCollectionMutation.isLoading || !amazonSettings.keywords.trim()}
                >
                  {startDataCollectionMutation.isLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Start Amazon Dataverzameling'
                  )}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Geo-locatie Instellingen
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Selecteer specifieke landen waarvan je data wilt verzamelen. De scraper zal IP-adressen uit deze landen gebruiken om regionale resultaten te verkrijgen.
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={geoSettings.enabled}
                  onChange={handleGeoSettingsChange}
                  name="enabled"
                />
              }
              label="Gebruik specifieke geo-locaties voor scraping"
            />
            
            {geoSettings.enabled && (
              <Box sx={{ mt: 2, mb: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Selecteer één of meerdere landen. Je kunt meerdere landen selecteren om een breder bereik aan resultaten te krijgen.
                </Typography>
                
                <Autocomplete
                  multiple
                  id="geo-locations"
                  options={GEO_LOCATIONS}
                  getOptionLabel={(option) => option.name}
                  value={GEO_LOCATIONS.filter(loc => geoSettings.locations.includes(loc.code))}
                  onChange={handleGeoLocationsChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Landen"
                      placeholder="Selecteer landen"
                      fullWidth
                      margin="normal"
                    />
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Chip
                        label={option.name}
                        {...getTagProps({ index })}
                        key={option.code}
                      />
                    ))
                  }
                />
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="device-type-label">Apparaat type</InputLabel>
                      <Select
                        labelId="device-type-label"
                        id="device-type"
                        name="deviceType"
                        value={geoSettings.deviceType}
                        onChange={handleGeoSettingsChange}
                        label="Apparaat type"
                      >
                        {DEVICE_TYPES.map(device => (
                          <MenuItem key={device.id} value={device.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {device.id === 'desktop' && <ComputerIcon sx={{ mr: 1 }} />}
                              {device.id === 'mobile' && <SmartphoneIcon sx={{ mr: 1 }} />}
                              {device.id === 'tablet' && <TabletIcon sx={{ mr: 1 }} />}
                              {device.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="browser-type-label">Browser type</InputLabel>
                      <Select
                        labelId="browser-type-label"
                        id="browser-type"
                        name="browserType"
                        value={geoSettings.browserType}
                        onChange={handleGeoSettingsChange}
                        label="Browser type"
                      >
                        {BROWSER_TYPES.map(browser => (
                          <MenuItem key={browser.id} value={browser.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {browser.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Tip:</strong> Het gebruik van meerdere landen kan de betrouwbaarheid van je resultaten verbeteren, maar kan ook leiden tot langere verwerkingstijden.
                  </Typography>
                </Alert>
              </Box>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Voorbeeldresultaten per land
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <img src="https://flagcdn.com/w20/nl.png" width="20" alt="NL" style={{ marginRight: 8 }} />
                      <Typography variant="subtitle1">Nederland</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Nederlandse resultaten met lokale trends, prijzen in Euro's en Nederlandse reviews.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <img src="https://flagcdn.com/w20/us.png" width="20" alt="US" style={{ marginRight: 8 }} />
                      <Typography variant="subtitle1">Verenigde Staten</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Amerikaanse resultaten met lokale trends, prijzen in dollars en Engelstalige reviews.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <img src="https://flagcdn.com/w20/de.png" width="20" alt="DE" style={{ marginRight: 8 }} />
                      <Typography variant="subtitle1">Duitsland</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Duitse resultaten met lokale trends, prijzen in Euro's en Duitstalige reviews.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Dataverzameling Jobs
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefreshData}
              >
                Ververs
              </Button>
            </Box>

            {isLoadingDataJobs ? (
              <Skeleton variant="rectangular" height={200} />
            ) : dataJobs && dataJobs.length > 0 ? (
              <List>
                {dataJobs.map((job) => (
                  <ListItem 
                    key={job.id} 
                    sx={{ 
                      mb: 2, 
                      bgcolor: 'background.default', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(job.status)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            Dataverzameling: {job.platforms.map(p => 
                              p === 'reddit' ? 'Reddit' : 
                              p === 'amazon' ? 'Amazon' : p
                            ).join(', ')}
                          </Typography>
                          <Chip 
                            label={translateStatus(job.status)} 
                            size="small" 
                            color={getStatusColor(job.status)} 
                          />
                        </Box>
                      }
                      secondary={`Gestart op ${formatDate(job.created_at)}`} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nog geen dataverzameling jobs uitgevoerd
              </Typography>
            )}

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Verzamelde Data
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <RedditIcon color="primary" />
                      <Typography variant="h6">
                        Reddit Data
                      </Typography>
                    </Box>
                    {isLoadingRedditData ? (
                      <Skeleton variant="rectangular" height={100} />
                    ) : redditData && redditData.length > 0 ? (
                      <>
                        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                          {redditData.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Posts/comments verzameld
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/projects/${id}/insights`)}
                        >
                          Bekijk inzichten
                        </Button>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nog geen Reddit data verzameld
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AmazonIcon color="primary" />
                      <Typography variant="h6">
                        Amazon Data
                      </Typography>
                    </Box>
                    {isLoadingAmazonData ? (
                      <Skeleton variant="rectangular" height={100} />
                    ) : amazonData && amazonData.length > 0 ? (
                      <>
                        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                          {amazonData.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Reviews verzameld
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/projects/${id}/insights`)}
                        >
                          Bekijk inzichten
                        </Button>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Nog geen Amazon data verzameld
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default DataCollection;
