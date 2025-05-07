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
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUp as ThumbUpIcon,
  BarChart as BarChartIcon,
  PlayArrow as PlayArrowIcon,
  Insights as InsightsIcon,
  Psychology as PsychologyIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../api/supabase';
import { insightsApi } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';

// Import visualisatiecomponenten
import PainPointsChart from '../components/charts/PainPointsChart';
import DesiresChart from '../components/charts/DesiresChart';
import MarketTrendsChart from '../components/charts/MarketTrendsChart';

// Import premium UI componenten
import AnimatedCard from '../components/ui/AnimatedCard';
import TextGradient from '../components/ui/TextGradient';
import PulseButton from '../components/ui/PulseButton';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`insights-tabpanel-${index}`}
      aria-labelledby={`insights-tab-${index}`}
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

const Insights = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  // Ophalen van pijnpunten
  const {
    data: painPoints,
    isLoading: isLoadingPainPoints,
    refetch: refetchPainPoints
  } = useQuery(
    ['painPoints', id],
    async () => {
      const response = await insightsApi.getPainPoints(id);
      return response.data.data;
    },
    {
      enabled: !!user && !!id,
      staleTime: 1000 * 60 * 5, // 5 minuten
      onError: (error) => {
        console.error('Fout bij ophalen pijnpunten:', error);
      }
    }
  );

  // Ophalen van verlangens
  const {
    data: desires,
    isLoading: isLoadingDesires,
    refetch: refetchDesires
  } = useQuery(
    ['desires', id],
    async () => {
      const response = await insightsApi.getDesires(id);
      return response.data.data;
    },
    {
      enabled: !!user && !!id,
      staleTime: 1000 * 60 * 5, // 5 minuten
      onError: (error) => {
        console.error('Fout bij ophalen verlangens:', error);
      }
    }
  );

  // Ophalen van markttrends
  const {
    data: marketTrends,
    isLoading: isLoadingMarketTrends,
    refetch: refetchMarketTrends
  } = useQuery(
    ['marketTrends', id],
    async () => {
      const response = await insightsApi.getMarketTrends(id);
      return response.data.data;
    },
    {
      enabled: !!user && !!id,
      staleTime: 1000 * 60 * 5, // 5 minuten
      onError: (error) => {
        console.error('Fout bij ophalen markttrends:', error);
      }
    }
  );

  // Ophalen van insight jobs
  const {
    data: insightJobs,
    isLoading: isLoadingInsightJobs,
    refetch: refetchInsightJobs
  } = useQuery(
    ['insightJobs', id],
    async () => {
      const response = await insightsApi.getInsightJobs(id);
      return response.data.data;
    },
    {
      enabled: !!user && !!id,
      staleTime: 1000 * 60 * 1, // 1 minuut
      onError: (error) => {
        console.error('Fout bij ophalen insight jobs:', error);
      }
    }
  );

  // Starten van een insight generation job
  const startInsightGenerationMutation = useMutation(
    async (type) => {
      const response = await insightsApi.generateInsights({
        project_id: id,
        type
      });
      return response.data.data;
    },
    {
      onSuccess: () => {
        // Invalidate queries en toon succes bericht
        queryClient.invalidateQueries(['insightJobs', id]);
        setSuccess('Inzichtgeneratie is gestart. Dit kan enkele minuten duren.');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      },
      onError: (error) => {
        console.error('Fout bij starten inzichtgeneratie:', error.response?.data?.error?.message || error.message);
        setError('Er is een fout opgetreden bij het starten van de inzichtgeneratie.');
      }
    }
  );

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Start insight generation
  const handleStartInsightGeneration = (type) => {
    startInsightGenerationMutation.mutate(type);
  };

  // Refresh data
  const handleRefreshData = () => {
    refetchPainPoints();
    refetchDesires();
    refetchMarketTrends();
    refetchInsightJobs();
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
            Inzichten: {project.name}
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
          <Tab icon={<ThumbDownIcon />} label="Pijnpunten" />
          <Tab icon={<ThumbUpIcon />} label="Verlangens" />
          <Tab icon={<TrendingUpIcon />} label="Markttrends" />
        </Tabs>

        <Box sx={{ px: 3 }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Pijnpunten
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleStartInsightGeneration('pain_points')}
                disabled={startInsightGenerationMutation.isLoading}
              >
                {startInsightGenerationMutation.isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Genereer Pijnpunten'
                )}
              </Button>
            </Box>
            
            {isLoadingPainPoints ? (
              <Skeleton variant="rectangular" height={400} />
            ) : painPoints && painPoints.length > 0 ? (
              <Box>
                {/* Grafiek weergave */}
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Top Pijnpunten Frequentie
                  </Typography>
                  <PainPointsChart data={painPoints} height={350} />
                </Paper>
                
                {/* Lijst weergave */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                  Gedetailleerde Lijst
                </Typography>
                <List>
                  {painPoints.map((painPoint) => (
                    <ListItem 
                      key={painPoint.id} 
                      sx={{ 
                        mb: 2, 
                        bgcolor: 'background.default', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ThumbDownIcon color="error" fontSize="small" />
                            <Typography variant="subtitle1">
                              {painPoint.description}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Frequentie:
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={painPoint.frequency} 
                                  sx={{ flexGrow: 1, mr: 1, height: 10, borderRadius: 5 }} 
                                  color="error"
                                />
                                <Typography variant="body2">
                                  {painPoint.frequency}
                                </Typography>
                              </Box>
                            </Box>
                            {painPoint.sources && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Bronnen: {painPoint.sources}
                                </Typography>
                              </Box>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Nog geen pijnpunten gegenereerd
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Verzamel eerst data via de dataverzameling pagina en genereer vervolgens inzichten
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/projects/${id}/data-collection`)}
                  sx={{ mr: 2 }}
                >
                  Naar dataverzameling
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Verlangens
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleStartInsightGeneration('desires')}
                disabled={startInsightGenerationMutation.isLoading}
              >
                {startInsightGenerationMutation.isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Genereer Verlangens'
                )}
              </Button>
            </Box>

            {isLoadingDesires ? (
              <Skeleton variant="rectangular" height={400} />
            ) : desires && desires.length > 0 ? (
              <Box>
                {/* Grafiek weergave */}
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Top Verlangens Frequentie
                  </Typography>
                  <DesiresChart data={desires} height={350} />
                </Paper>
                
                {/* Lijst weergave */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                  Gedetailleerde Lijst
                </Typography>
                <List>
                  {desires.map((desire) => (
                    <ListItem 
                      key={desire.id} 
                      sx={{ 
                        mb: 2, 
                        bgcolor: 'background.default', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ThumbUpIcon color="success" fontSize="small" />
                            <Typography variant="subtitle1">
                              {desire.description}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Frequentie:
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={desire.frequency} 
                                  sx={{ flexGrow: 1, mr: 1, height: 10, borderRadius: 5 }} 
                                  color="success"
                                />
                                <Typography variant="body2">
                                  {desire.frequency}
                                </Typography>
                              </Box>
                            </Box>
                            {desire.sources && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Bronnen: {desire.sources}
                                </Typography>
                              </Box>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Nog geen verlangens gegenereerd
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Verzamel eerst data via de dataverzameling pagina en genereer vervolgens inzichten
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/projects/${id}/data-collection`)}
                  sx={{ mr: 2 }}
                >
                  Naar dataverzameling
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Markttrends
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleStartInsightGeneration('market_trends')}
                disabled={startInsightGenerationMutation.isLoading}
              >
                {startInsightGenerationMutation.isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Genereer Markttrends'
                )}
              </Button>
            </Box>

            {isLoadingMarketTrends ? (
              <Skeleton variant="rectangular" height={400} />
            ) : marketTrends && marketTrends.length > 0 ? (
              <Box>
                {/* Grafiek weergave */}
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Markttrends Analyse
                  </Typography>
                  <MarketTrendsChart data={marketTrends} height={400} />
                </Paper>
                
                {/* Lijst weergave */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                  Gedetailleerde Lijst
                </Typography>
                <List>
                  {marketTrends.map((trend) => (
                    <ListItem 
                      key={trend.id} 
                      sx={{ 
                        mb: 2, 
                        bgcolor: 'background.default', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TrendingUpIcon color="primary" fontSize="small" />
                              <Typography variant="subtitle1">
                                {trend.name}
                              </Typography>
                            </Box>
                            <Chip 
                              label={`Relevantie: ${trend.relevance_score}/100`} 
                              color={trend.relevance_score > 70 ? 'primary' : 'info'} 
                              size="small" 
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {trend.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Implicaties:
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {trend.implications}
                              </Typography>
                            </Box>
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Groeisnelheid:
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={trend.growth_rate} 
                                  sx={{ flexGrow: 1, mr: 1, height: 10, borderRadius: 5 }} 
                                  color={trend.growth_rate > 70 ? 'success' : 'primary'}
                                />
                                <Typography variant="body2">
                                  {trend.growth_rate}%
                                </Typography>
                              </Box>
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Nog geen markttrends gegenereerd
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Verzamel eerst data via de dataverzameling pagina en genereer vervolgens inzichten
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/projects/${id}/data-collection`)}
                  sx={{ mr: 2 }}
                >
                  Naar dataverzameling
                </Button>
              </Box>
            )}
          </TabPanel>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recente Inzichtgeneratie Jobs
        </Typography>
        
        {isLoadingInsightJobs ? (
          <Skeleton variant="rectangular" height={100} />
        ) : insightJobs && insightJobs.length > 0 ? (
          <List>
            {insightJobs.slice(0, 5).map((job) => (
              <ListItem 
                key={job.id} 
                sx={{ 
                  mb: 1, 
                  bgcolor: 'background.default', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">
                        Inzichtgeneratie: {
                          job.type === 'pain_points' ? 'Pijnpunten' : 
                          job.type === 'desires' ? 'Verlangens' : 
                          job.type === 'market_trends' ? 'Markttrends' : 
                          job.type
                        }
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
      </Paper>
    </Box>
  );
};

export default Insights;
