/**
 * HelpMetricsDashboard.jsx
 * 
 * Dashboard component voor het visualiseren van help-systeem metrieken.
 * Toont KPI's, grafieken en tabellen met gegevens uit de help_interactions,
 * help_feedback en user_experience_feedback tabellen.
 * 
 * Ondersteunt real-time updates via Supabase Realtime.
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Divider, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Button,
  Stack,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { nl } from 'date-fns/locale';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';

// Lazy load subcomponenten
const MetricsSummary = lazy(() => import('./MetricsSummary'));
const InteractionsByTypeChart = lazy(() => import('./InteractionsByTypeChart'));
const InteractionsByPageChart = lazy(() => import('./InteractionsByPageChart'));
const FeedbackTable = lazy(() => import('./FeedbackTable'));
const InteractionsTrendChart = lazy(() => import('./InteractionsTrendChart'));
const UserExperienceFeedbackTable = lazy(() => import('./UserExperienceFeedbackTable'));
const ExportButton = lazy(() => import('./ExportButton'));
const RealtimeToggle = lazy(() => import('./RealtimeToggle'));
const AdvancedAnalytics = lazy(() => import('./AdvancedAnalytics'));
const NotificationBell = lazy(() => import('./NotificationBell'));

// Import services
import HelpMetricsService from '../../../services/help/HelpMetricsService';
import { clearCache } from '../../../utils/cacheUtils';
import { RealtimeProvider } from './RealtimeProvider';
import { DashboardPersonalizationProvider } from './DashboardPersonalizationProvider';
import DashboardPersonalizationButton from './DashboardPersonalizationButton';

/**
 * HelpMetricsDashboard Component
 * 
 * Dashboard voor het visualiseren en analyseren van help-systeem metrieken.
 * Biedt filters voor datum, gebruikersrol en ervaringsniveau.
 * 
 * @component
 */
const HelpMetricsDashboardContent = () => {
  // State voor filters
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [userRoles, setUserRoles] = useState([]);
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [dateRangePreset, setDateRangePreset] = useState('last30days');
  
  // State voor data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    summary: null,
    interactionsByType: null,
    interactionsByPage: null,
    feedbackByHelpItem: null,
    feedbackByUserRole: null,
    feedbackByExperienceLevel: null,
    interactionsTrend: null,
    userExperienceFeedback: null,
    userExperienceFeedbackByPage: null
  });
  
  // Beschikbare gebruikersrollen en ervaringsniveaus
  const availableUserRoles = [
    { value: 'marketeer', label: 'Marketeer' },
    { value: 'analyst', label: 'Analist' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'general', label: 'Algemeen' }
  ];
  
  const availableExperienceLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Gemiddeld' },
    { value: 'advanced', label: 'Gevorderd' }
  ];
  
  // Datum presets
  const dateRangePresets = [
    { value: 'last7days', label: 'Laatste 7 dagen', 
      range: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
    { value: 'last30days', label: 'Laatste 30 dagen', 
      range: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
    { value: 'thisMonth', label: 'Deze maand', 
      range: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
    { value: 'lastMonth', label: 'Vorige maand', 
      range: () => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return { start: startOfMonth(date), end: endOfMonth(date) };
      }
    }
  ];
  
  // Effect voor het laden van data bij wijziging van filters
  useEffect(() => {
    // Wis de cache wanneer filters worden gewijzigd
    HelpMetricsService.clearMetricsCache();
    fetchData();
  }, [dateRange, userRoles, experienceLevels]);
  
  // Handler voor real-time updates
  const handleRealtimeUpdate = (change) => {
    console.log('Realtime update ontvangen:', change);
    fetchData();
  };
  
  // Functie voor het ophalen van alle data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        dateRange,
        userRoles: userRoles.length > 0 ? userRoles : undefined,
        experienceLevels: experienceLevels.length > 0 ? experienceLevels : undefined
      };
      
      // Haal alle data parallel op
      const [
        summary,
        interactionsByType,
        interactionsByPage,
        feedbackByHelpItem,
        feedbackByUserRole,
        feedbackByExperienceLevel,
        interactionsTrend,
        userExperienceFeedback,
        userExperienceFeedbackByPage
      ] = await Promise.all([
        HelpMetricsService.getHelpMetricsSummary(filters),
        HelpMetricsService.getHelpInteractionsByType(filters),
        HelpMetricsService.getHelpInteractionsByPage(filters),
        HelpMetricsService.getFeedbackByHelpItem(filters),
        HelpMetricsService.getFeedbackByUserRole(filters),
        HelpMetricsService.getFeedbackByExperienceLevel(filters),
        HelpMetricsService.getHelpInteractionsTrends(filters, 'day'),
        HelpMetricsService.getUserExperienceFeedback(filters),
        HelpMetricsService.getUserExperienceFeedbackByPage(filters)
      ]);
      
      setMetrics({
        summary,
        interactionsByType,
        interactionsByPage,
        feedbackByHelpItem,
        feedbackByUserRole,
        feedbackByExperienceLevel,
        interactionsTrend,
        userExperienceFeedback,
        userExperienceFeedbackByPage
      });
    } catch (err) {
      console.error('Error fetching metrics data:', err);
      setError('Er is een fout opgetreden bij het ophalen van de metrieken. Probeer het later opnieuw.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handlers voor filters
  const handleDateRangePresetChange = (event) => {
    const preset = event.target.value;
    setDateRangePreset(preset);
    
    const selectedPreset = dateRangePresets.find(p => p.value === preset);
    if (selectedPreset) {
      setDateRange(selectedPreset.range());
    }
  };
  
  const handleStartDateChange = (date) => {
    setDateRange(prev => ({ ...prev, start: date }));
    setDateRangePreset('custom');
  };
  
  const handleEndDateChange = (date) => {
    setDateRange(prev => ({ ...prev, end: date }));
    setDateRangePreset('custom');
  };
  
  const handleUserRolesChange = (event) => {
    const { value } = event.target;
    setUserRoles(typeof value === 'string' ? value.split(',') : value);
  };
  
  const handleExperienceLevelsChange = (event) => {
    const { value } = event.target;
    setExperienceLevels(typeof value === 'string' ? value.split(',') : value);
  };
  
  const handleRefresh = () => {
    // Wis de cache bij handmatige vernieuwing
    HelpMetricsService.clearMetricsCache();
    fetchData();
  };
  
  // Render loading state
  if (loading && !metrics.summary) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error && !metrics.summary) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="h6">Fout</Typography>
          <Typography>{error}</Typography>
          <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
            Opnieuw proberen
          </Button>
        </Paper>
      </Box>
    );
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={nl}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Help Metrics Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Suspense fallback={<CircularProgress size={24} />}>
              <RealtimeToggle />
            </Suspense>
            <Suspense fallback={<CircularProgress size={24} />}>
              <ExportButton 
                data={metrics} 
                dateRange={dateRange}
                userRoles={userRoles}
                experienceLevels={experienceLevels}
              />
            </Suspense>
            <Suspense fallback={<CircularProgress size={24} />}>
              <NotificationBell />
            </Suspense>
            <Suspense fallback={<CircularProgress size={24} />}>
              <DashboardPersonalizationButton />
            </Suspense>
          </Box>
        </Box>
        <Divider />
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
        <Grid container spacing={3}>
            {/* Datum filter */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Datum bereik</InputLabel>
                <Select
                  value={dateRangePreset}
                  onChange={handleDateRangePresetChange}
                  label="Datum bereik"
                >
                  {dateRangePresets.map(preset => (
                    <MenuItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">Aangepast</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', mt: 2, gap: 2 }}>
                <DatePicker
                  label="Start datum"
                  value={dateRange.start}
                  onChange={handleStartDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <DatePicker
                  label="Eind datum"
                  value={dateRange.end}
                  onChange={handleEndDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
            </Grid>
            
            {/* Gebruikersrol filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Gebruikersrollen</InputLabel>
                <Select
                  multiple
                  value={userRoles}
                  onChange={handleUserRolesChange}
                  input={<OutlinedInput label="Gebruikersrollen" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={availableUserRoles.find(r => r.value === value)?.label || value} 
                        />
                      ))}
                    </Box>
                  )}
                >
                  {availableUserRoles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Ervaringsniveau filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Ervaringsniveaus</InputLabel>
                <Select
                  multiple
                  value={experienceLevels}
                  onChange={handleExperienceLevelsChange}
                  input={<OutlinedInput label="Ervaringsniveaus" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip 
                          key={value} 
                          label={availableExperienceLevels.find(r => r.value === value)?.label || value} 
                        />
                      ))}
                    </Box>
                  )}
                >
                  {availableExperienceLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Suspense fallback={<CircularProgress size={24} />}>
              <ExportButton 
                metrics={metrics} 
                dateRange={dateRange}
              />
            </Suspense>
            <Button 
              variant="contained" 
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? 'Laden...' : 'Vernieuwen'}
            </Button>
          </Box>
        </Paper>
        
        {/* KPI Samenvatting */}
        {metrics.summary && (
          <Suspense fallback={<Box sx={{ p: 3 }}><CircularProgress /></Box>}>
            <MetricsSummary 
              metrics={metrics.summary} 
              loading={loading}
            />
          </Suspense>
        )}
        
        {/* Grafieken en tabellen */}
        <Grid container spacing={4}>
          {/* Interacties per type */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Interacties per type
              </Typography>
              <Suspense fallback={<Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
                <InteractionsByTypeChart 
                  data={metrics.interactionsByType} 
                  loading={loading}
                />
              </Suspense>
            </Paper>
          </Grid>
          
          {/* Interacties per pagina */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Interacties per pagina
              </Typography>
              <Suspense fallback={<Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
                <InteractionsByPageChart 
                  data={metrics.interactionsByPage} 
                  loading={loading}
                />
              </Suspense>
            </Paper>
          </Grid>
          
          {/* Feedback per help item */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Feedback per help item
              </Typography>
              <Suspense fallback={<Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
                <FeedbackTable 
                  data={metrics.feedbackByHelpItem} 
                  loading={loading}
                  type="help-item"
                />
              </Suspense>
            </Paper>
          </Grid>
          
          {/* Feedback per gebruikersrol */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Feedback per gebruikersrol
              </Typography>
              <Suspense fallback={<Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
                <FeedbackTable 
                  data={metrics.feedbackByUserRole} 
                  loading={loading}
                  type="user-role"
                />
              </Suspense>
            </Paper>
          </Grid>
          
          {/* Feedback per ervaringsniveau */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Feedback per ervaringsniveau
              </Typography>
              <Suspense fallback={<Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
                <FeedbackTable 
                  data={metrics.feedbackByExperienceLevel} 
                  loading={loading}
                  type="experience-level"
                />
              </Suspense>
            </Paper>
          </Grid>
          
          {/* Interacties trend */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Interacties trend
              </Typography>
              <Suspense fallback={<Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
                <InteractionsTrendChart 
                  data={metrics.interactionsTrend} 
                  loading={loading}
                />
              </Suspense>
            </Paper>
          </Grid>
          
          {/* Gebruikerservaring feedback */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Gebruikerservaring feedback
              </Typography>
              <Suspense fallback={<Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
                <UserExperienceFeedbackTable 
                  data={metrics.userExperienceFeedback} 
                  loading={loading}
                />
              </Suspense>
            </Paper>
          </Grid>
          
          {/* Geavanceerde Analyses */}
          <Grid item xs={12}>
            <Suspense fallback={<Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><CircularProgress /></Box>}>
              <AdvancedAnalytics 
                filters={{
                  dateRange,
                  userRoles,
                  experienceLevels
                }}
              />
            </Suspense>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

/**
 * Wrapper component die de providers toevoegt
 */
const HelpMetricsDashboard = () => {
  return (
    <DashboardPersonalizationProvider>
      <RealtimeProvider onUpdate={(change) => console.log('Dashboard update:', change)}>
        <HelpMetricsDashboardContent />
      </RealtimeProvider>
    </DashboardPersonalizationProvider>
  );
};

export default HelpMetricsDashboard;
