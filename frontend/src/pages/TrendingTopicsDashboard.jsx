import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import TrendingTopicsTimeline from '../components/charts/TrendingTopicsTimeline';
import { useQuery } from 'react-query';
import { supabase } from '../utils/supabaseClient';
import { useAuthStore } from '../store/authStore';
import ExportButton from '../components/export/ExportButton';

/**
 * TrendingTopicsDashboard Component
 * 
 * Deze component toont een dashboard met trending topics analyses,
 * inclusief tijdlijnen, opkomende topics en cross-platform vergelijkingen.
 */
const TrendingTopicsDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuthStore();
  const [platform, setPlatform] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  // Beschikbare platforms
  const platforms = [
    { value: 'all', label: 'Alle platforms' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'amazon', label: 'Amazon' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'twitter', label: 'Twitter' }
  ];
  
  // Beschikbare tijdsperiodes
  const timeRanges = [
    { value: 'week', label: 'Afgelopen week' },
    { value: 'month', label: 'Afgelopen maand' },
    { value: 'quarter', label: 'Afgelopen kwartaal' },
    { value: 'year', label: 'Afgelopen jaar' }
  ];
  
  // Ophalen van projectgegevens
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError
  } = useQuery(
    ['project', id],
    async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    {
      enabled: !!id,
      staleTime: 1000 * 60 * 5 // 5 minuten
    }
  );
  
  // Ophalen van trending topics data
  const {
    data: trendingData,
    isLoading: isTrendingLoading,
    isError: isTrendingError,
    error: trendingError,
    refetch: refetchTrending
  } = useQuery(
    ['trending-topics', id, platform, timeRange],
    async () => {
      // In een echte implementatie zou hier een API call staan
      // Voor nu gebruiken we mock data
      return {
        success: true,
        data: {
          // Mock data wordt gegenereerd in de TrendingTopicsTimeline component
        }
      };
    },
    {
      enabled: !!id,
      staleTime: 1000 * 60 * 15 // 15 minuten
    }
  );
  
  // Handle platform change
  const handlePlatformChange = (event) => {
    setPlatform(event.target.value);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Handle topic click
  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    // Hier zou je eventueel extra data kunnen ophalen over het geselecteerde topic
  };
  
  // Handle refresh
  const handleRefresh = () => {
    refetchTrending();
  };
  
  // Loading state
  if (isProjectLoading || isTrendingLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
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
          {projectError?.message || 'Er is een fout opgetreden bij het ophalen van het project.'}
        </Alert>
      </Box>
    );
  }
  
  if (isTrendingError) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => navigate(`/projects/${id}`)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {project?.name} - Trending Topics
          </Typography>
        </Box>
        <Alert severity="error">
          {trendingError?.message || 'Er is een fout opgetreden bij het ophalen van trending topics data.'}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          sx={{ mt: 2 }}
        >
          Opnieuw proberen
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate(`/projects/${id}`)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, flexGrow: 1 }}>
          {project?.name} - Trending Topics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="platform-select-label">Platform</InputLabel>
            <Select
              labelId="platform-select-label"
              id="platform-select"
              value={platform}
              label="Platform"
              onChange={handlePlatformChange}
            >
              {platforms.map((p) => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
          >
            Vernieuwen
          </Button>
          <ExportButton 
            data={trendingData?.data} 
            filename={`trending-topics-${project?.name}-${new Date().toISOString().split('T')[0]}`}
            title="Trending Topics Rapport"
          />
        </Box>
      </Box>
      
      {/* Statistieken */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Totaal aantal topics
              </Typography>
              <Typography variant="h4">
                125
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                +12% t.o.v. vorige periode
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Opkomende topics
              </Typography>
              <Typography variant="h4">
                18
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                +5% t.o.v. vorige periode
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Afnemende topics
              </Typography>
              <Typography variant="h4">
                7
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                -2% t.o.v. vorige periode
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Gerelateerde events
              </Typography>
              <Typography variant="h4">
                12
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                3 nieuwe events deze week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Trending Topics Timeline */}
      <Box sx={{ mb: 4 }}>
        <TrendingTopicsTimeline 
          data={trendingData?.data}
          platform={platform}
          height={500}
          onTopicClick={handleTopicClick}
        />
      </Box>
      
      {/* Aanbevelingen */}
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title="Aanbevelingen op basis van trending topics" 
          subheader="Inzichten en actiepunten gebaseerd op de geanalyseerde data"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ bgcolor: 'success.light', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Benut opkomende topics
                  </Typography>
                  <Typography variant="body2" paragraph>
                    De topics 'duurzaamheid' en 'innovatie' tonen sterke groei. Overweeg deze thema's centraal te stellen in uw marketingcommunicatie.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                    <Chip label="duurzaamheid" size="small" color="success" />
                    <Chip label="innovatie" size="small" color="success" />
                    <Chip label="gebruiksvriendelijkheid" size="small" color="success" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ bgcolor: 'warning.light', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monitor aandachtspunten
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Er is een toenemende discussie over 'prijsverhoging'. Evalueer uw prijsstrategie en communicatie hierover.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                    <Chip label="prijsverhoging" size="small" color="warning" />
                    <Chip label="kosten" size="small" color="warning" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ bgcolor: 'info.light', height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Platform-specifieke inzichten
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Instagram en TikTok tonen de hoogste engagement voor 'innovatie', terwijl Reddit meer discussie over 'prijsverhoging' laat zien.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                    <Chip label="Instagram" size="small" color="info" />
                    <Chip label="TikTok" size="small" color="info" />
                    <Chip label="Reddit" size="small" color="info" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Navigatie naar andere dashboards */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={RouterLink}
          to={`/projects/${id}`}
        >
          Terug naar project
        </Button>
        <Box>
          <Button
            variant="contained"
            component={RouterLink}
            to={`/projects/${id}/audience-insights-dashboard`}
            sx={{ mr: 1 }}
          >
            Doelgroep Inzichten
          </Button>
          <Button
            variant="contained"
            component={RouterLink}
            to={`/projects/${id}/sentiment-analysis`}
          >
            Sentiment Analyse
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TrendingTopicsDashboard;
