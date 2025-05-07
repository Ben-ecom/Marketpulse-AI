import { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Divider, 
  Chip, 
  Button, 
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  Insights as InsightsIcon,
  Psychology as PsychologyIcon,
  Favorite as FavoriteIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Import custom components
import AnimatedCard from '../components/ui/AnimatedCard';
import TextGradient from '../components/ui/TextGradient';
import GradientBackground from '../components/ui/GradientBackground';

// Import help components
import IntegratedHelpSystem from '../components/help/IntegratedHelpSystem';

// Import API client
import { dashboardApi } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';

const DashboardOverview = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [error, setError] = useState('');

  // Fetch dashboard overview data
  const { 
    data: dashboardData,
    isLoading: isLoadingDashboard,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard
  } = useQuery(
    ['dashboardOverview'],
    dashboardApi.getOverview,
    {
      enabled: !!user,
      staleTime: 1000 * 60 * 5, // 5 minutes
      onError: (error) => {
        console.error('Error fetching dashboard data:', error);
        setError('Er is een fout opgetreden bij het ophalen van dashboard gegevens.');
      }
    }
  );

  // Fetch recent insights
  const {
    data: recentInsights,
    isLoading: isLoadingInsights
  } = useQuery(
    ['recentInsights'],
    () => dashboardApi.getRecentInsights(5),
    {
      enabled: !!user,
      staleTime: 1000 * 60 * 5, // 5 minutes
      onError: (error) => {
        console.error('Error fetching recent insights:', error);
      }
    }
  );

  // Fetch popular trends
  const {
    data: popularTrends,
    isLoading: isLoadingTrends
  } = useQuery(
    ['popularTrends'],
    () => dashboardApi.getPopularTrends(5),
    {
      enabled: !!user,
      staleTime: 1000 * 60 * 5, // 5 minutes
      onError: (error) => {
        console.error('Error fetching popular trends:', error);
      }
    }
  );

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  };

  // Get color for impact
  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return theme.palette.success.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Get icon for trend direction
  const getTrendDirectionIcon = (direction) => {
    switch (direction?.toLowerCase()) {
      case 'up':
        return <TrendingUpIcon color="success" />;
      case 'down':
        return <TrendingUpIcon color="error" sx={{ transform: 'rotate(180deg)' }} />;
      default:
        return <TrendingUpIcon color="info" sx={{ transform: 'rotate(90deg)' }} />;
    }
  };

  // Get icon for insight type
  const getInsightTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pain_point':
        return <ThumbDownIcon color="error" />;
      case 'desire':
        return <FavoriteIcon color="secondary" />;
      case 'market_trend':
        return <TrendingUpIcon color="primary" />;
      case 'language':
        return <PsychologyIcon color="info" />;
      default:
        return <InsightsIcon color="primary" />;
    }
  };

  // Get label for insight type
  const getInsightTypeLabel = (type) => {
    switch (type?.toLowerCase()) {
      case 'pain_point':
        return 'Pijnpunt';
      case 'desire':
        return 'Verlangen';
      case 'market_trend':
        return 'Markttrend';
      case 'language':
        return 'Taalgebruik';
      default:
        return type || 'Inzicht';
    }
  };

  return (
    <IntegratedHelpSystem
      activeView="dashboard"
      userRole={user?.role || 'user'}
      experienceLevel={user?.experienceLevel || 'beginner'}
    >
      <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <TextGradient variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            MarketPulse AI Dashboard
          </TextGradient>
          <Typography variant="subtitle1" color="text.secondary">
            Uw marktonderzoek en doelgroepinzichten in één overzicht
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Ververs dashboard">
            <IconButton onClick={() => refetchDashboard()} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
          >
            Nieuw Project
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {isDashboardError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Er is een fout opgetreden bij het ophalen van dashboard gegevens: {dashboardError.message}
        </Alert>
      )}

      {/* Statistieken */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <AnimatedCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Projecten
              </Typography>
              {isLoadingDashboard ? (
                <Skeleton variant="rectangular" height={60} />
              ) : (
                <>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                    {dashboardData?.data?.stats?.totalProjects || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actieve onderzoeksprojecten
                  </Typography>
                </>
              )}
            </CardContent>
          </AnimatedCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AnimatedCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dataverzamelingen
              </Typography>
              {isLoadingDashboard ? (
                <Skeleton variant="rectangular" height={60} />
              ) : (
                <>
                  <Typography variant="h3" color="secondary" sx={{ fontWeight: 700 }}>
                    {dashboardData?.data?.stats?.totalScrapeJobs || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uitgevoerde dataverzamelingen
                  </Typography>
                </>
              )}
            </CardContent>
          </AnimatedCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AnimatedCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Inzichten
              </Typography>
              {isLoadingDashboard ? (
                <Skeleton variant="rectangular" height={60} />
              ) : (
                <>
                  <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                    {dashboardData?.data?.stats?.totalInsights || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gegenereerde inzichten
                  </Typography>
                </>
              )}
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>

      {/* Recent Activity & Projects */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recente Activiteit
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {isLoadingDashboard ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={40} sx={{ mb: 1 }} />
                ))
              ) : dashboardData?.data?.stats?.recentActivity?.length > 0 ? (
                <List disablePadding>
                  {dashboardData.data.stats.recentActivity.map((activity, index) => (
                    <ListItem 
                      key={index} 
                      disablePadding 
                      sx={{ mb: 1, py: 1 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {activity.type === 'project' ? (
                          <InsightsIcon color="primary" />
                        ) : activity.type === 'scrape_job' ? (
                          <TrendingUpIcon color="secondary" />
                        ) : (
                          <PsychologyIcon color="success" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={activity.name}
                        secondary={formatDate(activity.date)}
                      />
                      <Chip 
                        label={activity.type === 'project' ? 'Project' : 
                               activity.type === 'scrape_job' ? 'Dataverzameling' : 
                               'Inzicht'} 
                        size="small" 
                        color={activity.type === 'project' ? 'primary' : 
                               activity.type === 'scrape_job' ? 'secondary' : 
                               'success'} 
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Geen recente activiteit gevonden
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Uw Projecten
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {isLoadingDashboard ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={40} sx={{ mb: 1 }} />
                ))
              ) : dashboardData?.data?.projects?.length > 0 ? (
                <List disablePadding>
                  {dashboardData.data.projects.map((project, index) => (
                    <ListItem 
                      key={index} 
                      disablePadding 
                      sx={{ 
                        mb: 1, 
                        py: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderRadius: 1
                        }
                      }}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <InsightsIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={project.name}
                        secondary={formatDate(project.created_at)}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ py: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    U heeft nog geen projecten
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/projects/new')}
                    size="small"
                  >
                    Nieuw Project
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Popular Trends & Recent Insights */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Populaire Trends
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {isLoadingTrends ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
                ))
              ) : popularTrends?.data?.length > 0 ? (
                <List disablePadding>
                  {popularTrends.data.map((trend, index) => (
                    <ListItem 
                      key={index} 
                      disablePadding 
                      sx={{ 
                        mb: 1.5, 
                        py: 1,
                        px: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ mr: 1 }}>
                            {getTrendDirectionIcon(trend.direction)}
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {trend.name}
                          </Typography>
                          <Box sx={{ ml: 'auto' }}>
                            <Chip 
                              label={trend.impact} 
                              size="small" 
                              sx={{ 
                                bgcolor: alpha(getImpactColor(trend.impact), 0.1),
                                color: getImpactColor(trend.impact),
                                fontWeight: 500
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {trend.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Project: {trend.projectName}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Geen populaire trends gevonden
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recente Inzichten
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {isLoadingInsights ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
                ))
              ) : recentInsights?.data?.length > 0 ? (
                <List disablePadding>
                  {recentInsights.data.map((insight, index) => (
                    <ListItem 
                      key={index} 
                      disablePadding 
                      sx={{ 
                        mb: 1.5, 
                        py: 1,
                        px: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ mr: 1 }}>
                            {getInsightTypeIcon(insight.type)}
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {insight.data?.title || getInsightTypeLabel(insight.type)}
                          </Typography>
                          <Box sx={{ ml: 'auto' }}>
                            <Chip 
                              label={getInsightTypeLabel(insight.type)} 
                              size="small" 
                              color={
                                insight.type === 'pain_point' ? 'error' :
                                insight.type === 'desire' ? 'secondary' :
                                insight.type === 'market_trend' ? 'primary' :
                                'default'
                              }
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {insight.data?.description || insight.data?.content || 'Geen beschrijving beschikbaar'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Project: {insight.projectName} | {formatDate(insight.created_at)}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Geen recente inzichten gevonden
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    </IntegratedHelpSystem>
  );
};

export default DashboardOverview;
