import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DataObject as DataIcon,
  Insights as InsightsIcon,
  Category as CategoryIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  BarChart as BarChartIcon,
  CompareArrows as CompareArrowsIcon,
  People as PeopleIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../api/supabase';
import { useAuthStore } from '../store/authStore';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
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

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');

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
      retry: 1
    }
  );

  // Ophalen van data collection jobs
  const {
    data: dataJobs,
    isLoading: isLoadingDataJobs
  } = useQuery(
    ['dataJobs', id],
    async () => {
      const { data, error } = await supabase
        .from('data_collection_jobs')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    {
      enabled: !!user && !!id,
      staleTime: 1000 * 60 * 5 // 5 minuten
    }
  );

  // Ophalen van insight generation jobs
  const {
    data: insightJobs,
    isLoading: isLoadingInsightJobs
  } = useQuery(
    ['insightJobs', id],
    async () => {
      const { data, error } = await supabase
        .from('insight_generation_jobs')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    {
      enabled: !!user && !!id,
      staleTime: 1000 * 60 * 5 // 5 minuten
    }
  );

  // Project verwijderen
  const deleteProjectMutation = useMutation(
    async () => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    },
    {
      onSuccess: () => {
        // Invalidate projects query en navigeer terug naar dashboard
        queryClient.invalidateQueries(['projects']);
        navigate('/dashboard');
      },
      onError: (error) => {
        console.error('Fout bij verwijderen project:', error.message);
        setError('Er is een fout opgetreden bij het verwijderen van het project.');
      }
    }
  );

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Project verwijderen
  const handleDeleteProject = () => {
    if (window.confirm('Weet je zeker dat je dit project wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      deleteProjectMutation.mutate();
    }
  };

  // Formatteren van datum
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  // Status chip kleur
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'running':
        return 'info';
      default:
        return 'default';
    }
  };

  // Status vertaling
  const translateStatus = (status) => {
    switch (status) {
      case 'completed':
        return 'Voltooid';
      case 'pending':
        return 'In wachtrij';
      case 'failed':
        return 'Mislukt';
      case 'running':
        return 'Bezig';
      default:
        return status;
    }
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
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          </Grid>
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
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Terug naar Dashboard
        </Button>
        <Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteProject}
            sx={{ ml: 1 }}
          >
            Verwijderen
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            component={RouterLink}
            to={`/projects/${id}/edit`}
            sx={{ ml: 1 }}
          >
            Bewerken
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              {project.name}
            </Typography>
            {project.research_scope?.platforms?.includes('pubmed') && (
              <Tooltip title="Wetenschappelijk onderzoek beschikbaar">
                <Chip 
                  icon={<ScienceIcon />} 
                  label="Wetenschap" 
                  color="success" 
                  size="small" 
                  variant="outlined" 
                  sx={{ ml: 2 }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<DataIcon />}
            component={RouterLink}
            to={`/projects/${id}/data-collection`}
            sx={{ mr: 2 }}
          >
            Dataverzameling
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<InsightsIcon />}
            onClick={() => navigate(`/projects/${id}/insights`)}
            sx={{ mr: 2 }}
          >
            Inzichten
          </Button>
          <Tooltip title="Project bewerken">
            <IconButton onClick={() => navigate(`/projects/${id}/edit`)} sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Project verwijderen">
            <IconButton onClick={handleDeleteProject} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="project tabs">
              <Tab label="Overzicht" />
              <Tab label="Onderzoeksscope" />
              <Tab label="Product Details" />
              <Tab label="Jobs" />
              <Tab label="Awareness" icon={<PsychologyIcon />} iconPosition="start" />
              <Tab label="Wetenschappelijk Onderzoek" icon={<ScienceIcon />} iconPosition="start" />
            </Tabs>
          </Box>
        </Tabs>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 3 }}>
          <Button
            variant="contained"
            startIcon={<DataIcon />}
            component={RouterLink}
            to={`/projects/${id}/data-collection`}
            sx={{ borderRadius: 2 }}
          >
            Data Verzamelen
          </Button>
          <Button
            variant="contained"
            startIcon={<InsightsIcon />}
            component={RouterLink}
            to={`/projects/${id}/insights`}
            sx={{ borderRadius: 2 }}
          >
            Inzichten Genereren
          </Button>
          <Button
            variant="contained"
            startIcon={<BarChartIcon />}
            component={RouterLink}
            to={`/projects/${id}/market-research`}
            sx={{ borderRadius: 2 }}
          >
            Marktonderzoek
          </Button>
          <Button
            variant="contained"
            startIcon={<CompareArrowsIcon />}
            component={RouterLink}
            to={`/projects/${id}/competitor-analysis`}
            sx={{ borderRadius: 2 }}
          >
            Concurrentieanalyse
          </Button>
          <Button
            variant="contained"
            startIcon={<PeopleIcon />}
            component={RouterLink}
            to={`/projects/${id}/audience-insights`}
            sx={{ borderRadius: 2, mr: 1 }}
          >
            Doelgroep Inzichten
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<BarChartIcon />}
            component={RouterLink}
            to={`/projects/${id}/audience-insights-dashboard`}
            sx={{ borderRadius: 2, mr: 1 }}
          >
            Inzichten Dashboard
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<PsychologyIcon />}
            component={RouterLink}
            to={`/projects/${id}/sentiment-analysis`}
            sx={{ borderRadius: 2, mr: 1 }}
          >
            Sentiment Analyse
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<PeopleIcon />}
            component={RouterLink}
            to={`/projects/${id}/awareness-dashboard`}
            sx={{ borderRadius: 2, mr: 1 }}
          >
            Awareness Fasen
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<TrendingUpIcon />}
            component={RouterLink}
            to={`/projects/${id}/trending-topics-dashboard`}
            sx={{ borderRadius: 2 }}
          >
            Trending Topics
          </Button>
          {project.research_scope?.platforms?.includes('pubmed') && (
            <Button
              variant="contained"
              color="success"
              startIcon={<ScienceIcon />}
              component={RouterLink}
              to={`/projects/${id}/scientific-research`}
              sx={{ borderRadius: 2 }}
            >
              Wetenschappelijk Onderzoek
            </Button>
          )}
        </Box>
        <Box sx={{ px: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Projectinformatie
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Aangemaakt op {formatDate(project.created_at)}
                </Typography>
                <Chip 
                  label={project.category} 
                  color="primary" 
                  variant="outlined" 
                  icon={<CategoryIcon />}
                  sx={{ mb: 2 }} 
                />
                <Typography variant="body1" paragraph>
                  {project.product_details?.description || 'Geen beschrijving beschikbaar'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Statistieken
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" component="div">
                          {dataJobs?.filter(job => job.status === 'completed').length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Dataverzamelingen voltooid
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h5" component="div">
                          {insightJobs?.filter(job => job.status === 'completed').length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Inzichtgeneraties voltooid
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Productinformatie
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Productnaam" 
                      secondary={project.product_details?.name || 'Niet gespecificeerd'} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText 
                      primary="Categorie" 
                      secondary={project.product_details?.category || 'Niet gespecificeerd'} 
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText 
                      primary="Subcategorie" 
                      secondary={project.product_details?.subcategory || 'Niet gespecificeerd'} 
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Productattributen
                </Typography>
                {project.product_details?.attributes && project.product_details.attributes.length > 0 ? (
                  <List>
                    {project.product_details.attributes.map((attr, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={attr.name} 
                          secondary={attr.value} 
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Geen attributen gespecificeerd
                  </Typography>
                )}
              </Grid>
              {project.product_details?.imageUrl && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Productafbeelding
                  </Typography>
                  <Box 
                    component="img" 
                    src={project.product_details.imageUrl} 
                    alt={project.product_details.name}
                    sx={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px', 
                      objectFit: 'contain',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Onderzoeksparameters
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LanguageIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Platforms" 
                      secondary={
                        project.research_scope?.platforms?.map(p => 
                          p === 'reddit' ? 'Reddit' : 
                          p === 'amazon' ? 'Amazon' : p
                        ).join(', ') || 'Niet gespecificeerd'
                      } 
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <CategoryIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Steekproefgrootte" 
                      secondary={
                        project.research_scope?.sampleSize === 'klein' ? 'Klein (100-300 berichten)' :
                        project.research_scope?.sampleSize === 'medium' ? 'Medium (300-700 berichten)' :
                        project.research_scope?.sampleSize === 'groot' ? 'Groot (700-1000+ berichten)' :
                        project.research_scope?.sampleSize || 'Niet gespecificeerd'
                      } 
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemIcon>
                      <ScheduleIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Tijdsperiode" 
                      secondary={
                        project.research_scope?.timeframe === 'laatste_week' ? 'Laatste week' :
                        project.research_scope?.timeframe === 'laatste_maand' ? 'Laatste maand' :
                        project.research_scope?.timeframe === 'laatste_jaar' ? 'Laatste jaar' :
                        project.research_scope?.timeframe === 'alles' ? 'Alle beschikbare data' :
                        project.research_scope?.timeframe || 'Niet gespecificeerd'
                      } 
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Geografische focus
                </Typography>
                {project.research_scope?.geographicFocus && project.research_scope.geographicFocus.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {project.research_scope.geographicFocus.map((location) => (
                      <Chip
                        key={location}
                        label={location}
                        icon={<LanguageIcon />}
                        variant="outlined"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Geen geografische focus gespecificeerd
                  </Typography>
                )}

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Concurrenten
                </Typography>
                {project.competitors && project.competitors.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {project.competitors.map((competitor) => (
                      <Chip
                        key={competitor}
                        label={competitor}
                        icon={<BusinessIcon />}
                        variant="outlined"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Geen concurrenten gespecificeerd
                  </Typography>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Dataverzameling Jobs
                </Typography>
                {isLoadingDataJobs ? (
                  <Skeleton variant="rectangular" height={200} />
                ) : dataJobs && dataJobs.length > 0 ? (
                  <List>
                    {dataJobs.map((job) => (
                      <ListItem key={job.id} sx={{ mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                                Data verzameling
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
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Inzichtgeneratie Jobs
                </Typography>
                {isLoadingInsightJobs ? (
                  <Skeleton variant="rectangular" height={200} />
                ) : insightJobs && insightJobs.length > 0 ? (
                  <List>
                    {insightJobs.map((job) => (
                      <ListItem key={job.id} sx={{ mb: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                                Inzichtgeneratie
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
                    Nog geen inzichtgeneratie jobs uitgevoerd
                  </Typography>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            {/* Awareness tab */}
            <Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Audience Awareness Analyse
              </Typography>
              
              <Typography variant="body1" paragraph>
                Analyseer en begrijp de awareness fasen van uw doelgroep op basis van Eugene Schwartz's 5 fasen model.
                Deze inzichten helpen u bij het optimaliseren van uw marketing strategie en content.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PsychologyIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" component="h4">
                          Awareness Fasen Analyse
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" paragraph>
                        Ontdek in welke awareness fase uw doelgroep zich bevindt en krijg gerichte marketingaanbevelingen 
                        om uw boodschap effectief af te stemmen op hun niveau van bewustzijn.
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip label="Unaware" variant="outlined" />
                        <Chip label="Problem Aware" color="error" variant="outlined" />
                        <Chip label="Solution Aware" color="info" variant="outlined" />
                        <Chip label="Product Aware" color="success" variant="outlined" />
                        <Chip label="Most Aware" color="secondary" variant="outlined" />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        component={RouterLink} 
                        to={`/projects/${id}/awareness`}
                      >
                        Awareness Analyse Starten
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        component={RouterLink} 
                        to={`/projects/${id}/awareness-phases`}
                      >
                        Customer Journey Fasen
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={5}>
            {/* Wetenschappelijk Onderzoek tab */}
            <Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Wetenschappelijk Onderzoek
              </Typography>
              
              <Typography variant="body1" paragraph>
                Analyseer wetenschappelijke literatuur om uw product claims te onderbouwen met bewijs uit peer-reviewed onderzoek.
                Ontdek wetenschappelijke inzichten over ingrediënten, effectiviteit en veiligheid.
              </Typography>
              
              {project.research_scope?.platforms?.includes('pubmed') ? (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <ScienceIcon color="success" sx={{ mr: 1 }} />
                          <Typography variant="h6" component="h4">
                            Wetenschappelijke Inzichten
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" paragraph>
                          Ontdek wetenschappelijk bewijs voor uw product claims, vind relevante studies en genereer 
                          wetenschappelijk onderbouwde marketingclaims voor uw producten.
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {project.research_scope?.scientific_research?.ingredients?.map((ingredient, index) => (
                            <Chip key={index} label={ingredient} color="success" variant="outlined" />
                          ))}
                          {!project.research_scope?.scientific_research?.ingredients?.length && (
                            <Chip label="Geen ingrediënten gespecificeerd" variant="outlined" />
                          )}
                        </Box>
                        
                        {project.research_scope?.scientific_research?.claims?.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Te onderzoeken claims:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              {project.research_scope?.scientific_research?.claims?.map((claim, index) => (
                                <Chip key={index} label={claim} color="info" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          variant="contained" 
                          color="success"
                          component={RouterLink} 
                          to={`/projects/${id}/scientific-research`}
                          startIcon={<ScienceIcon />}
                        >
                          Wetenschappelijk Onderzoek Starten
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Wetenschappelijk onderzoek is niet ingeschakeld voor dit project. Bewerk het project om PubMed als platform toe te voegen.
                </Alert>
              )}
            </Box>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectDetail;
