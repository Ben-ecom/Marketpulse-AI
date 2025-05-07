import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Container, 
  Paper, 
  Tabs, 
  Tab, 
  Typography, 
  Divider, 
  Button, 
  Alert, 
  Breadcrumbs,
  Link,
  Snackbar,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
  GetApp as GetAppIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Analytics as AnalyticsIcon,
  Close as CloseIcon,
  Help as HelpIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

// Componenten importeren
import TopicAwarenessDashboard from '../dashboards/TopicAwarenessDashboard';
import TopicAwarenessReport from '../integrated/TopicAwarenessReport';
import DataSourceSelector from '../common/DataSourceSelector';
import DateRangePicker from '../common/DateRangePicker';
import DashboardExport from '../export/DashboardExport';
import ShareInsights from '../export/ShareInsights';
import SentimentAnalysis from '../analysis/SentimentAnalysis';
import TrendAnalysis from '../analysis/TrendAnalysis';
import HelpOverlay from '../help/HelpOverlay';
import TourGuide from '../help/TourGuide';
import OnboardingWizard from '../help/OnboardingWizard';
import HelpMenu from '../help/HelpMenu';
import ABTestHelpMethod from '../help/ABTestHelpMethod';
import AdaptiveHelp from '../help/AdaptiveHelp';

// Importeer voorbeelddata voor help-componenten
import { faqItems, videoTutorials, helpCategories } from '../../data/helpData';

// Importeer services
import ABTestingService, { trackConversion } from '../../services/ABTestingService';
import HelpRecommendationService, { trackUserBehavior } from '../../services/HelpRecommendationService';

// API services importeren
import { 
  fetchTopicsByPhase, 
  fetchAwarenessDistribution,
  fetchContentRecommendations,
  fetchTrendingTopics
} from '../../services/topicAwarenessService';

/**
 * TopicAwarenessController Component
 * 
 * Controller component voor het beheren van topic awareness analyses.
 * Integreert zowel het dashboard als het rapport in één component
 * met gedeelde state, navigatie en consistente gebruikerservaring.
 * 
 * @component
 * @example
 * ```jsx
 * <TopicAwarenessController projectId="123" />
 * ```
 */
const TopicAwarenessController = ({ projectId, projectName = 'MarketPulse AI' }) => {
  // Referentie naar het dashboard element voor export
  const dashboardRef = useRef(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const { tab = 'dashboard' } = useParams();
  
  // State voor actieve view (dashboard, rapport, sentiment analyse, trend analyse)
  const [activeView, setActiveView] = useState(tab === 'report' ? 'report' : 'dashboard');
  
  // State voor tijdreeks data voor trend analyse
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  
  // State voor data
  const [topicsByPhase, setTopicsByPhase] = useState(null);
  const [awarenessDistribution, setAwarenessDistribution] = useState(null);
  const [contentRecommendations, setContentRecommendations] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState(null);
  
  // State voor UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  
  // State voor filters
  const [dataSource, setDataSource] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dagen geleden
    endDate: new Date()
  });
  
  // State voor snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // State voor onboarding wizard
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // State voor gebruikersvoorkeuren
  const [userRole, setUserRole] = useState('marketeer');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [useAdaptiveHelp, setUseAdaptiveHelp] = useState(false); // State om te schakelen tussen A/B test en adaptieve help
  
  /**
   * Laad alle benodigde data voor het dashboard en rapport
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [topicsData, distributionData, recommendationsData, trendingData, timeSeriesData] = await Promise.all([
        fetchTopicsByPhase({ dataSource, startDate: dateRange.startDate, endDate: dateRange.endDate }),
        fetchAwarenessDistribution({ dataSource, startDate: dateRange.startDate, endDate: dateRange.endDate }),
        fetchContentRecommendations({ dataSource, startDate: dateRange.startDate, endDate: dateRange.endDate }),
        fetchTrendingTopics({ dataSource, startDate: dateRange.startDate, endDate: dateRange.endDate }),
        fetchTimeSeriesData({ dataSource, startDate: dateRange.startDate, endDate: dateRange.endDate }) // Nieuwe API call voor tijdreeks data
      ]);
      
      setTopicsByPhase(topicsData);
      setAwarenessDistribution(distributionData);
      setContentRecommendations(recommendationsData);
      setTrendingTopics(trendingData);
      setTimeSeriesData(timeSeriesData);
    } catch (err) {
      setError(err);
      setSnackbar({
        open: true,
        message: `Er is een fout opgetreden bij het ophalen van de data: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [dataSource, dateRange]);
  
  // Laad data bij initialisatie  // Effect om data te laden bij initialisatie
  useEffect(() => {
    fetchData();
    
    // Controleer of de onboarding al is voltooid
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted) {
      // Toon de onboarding wizard na een korte vertraging
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Haal gebruikersvoorkeuren op
    const helpPreferences = localStorage.getItem('helpPreferences');
    if (helpPreferences) {
      try {
        const { role, experienceLevel: level } = JSON.parse(helpPreferences);
        if (role) setUserRole(role);
        if (level) setExperienceLevel(level);
      } catch (error) {
        console.error('Fout bij het laden van help voorkeuren:', error);
      }
    }
  }, [fetchData]);
  
  // Handler voor tab verandering
  const handleTabChange = (event, newValue) => {
    setActiveView(newValue);
    
    // Update URL zonder pagina te herladen
    const newTab = newValue === 'dashboard' ? 'dashboard' : newValue === 'report' ? 'report' : newValue === 'sentiment' ? 'sentiment' : 'trends';
    if (projectId) {
      navigate(`/projects/${projectId}/topic-awareness/${newTab}`, { replace: true });
    } else {
      navigate(`/analytics/topic-awareness/${newTab}`, { replace: true });
    }
  };
  
  // Handler voor data source verandering
  const handleDataSourceChange = (newSource) => {
    setDataSource(newSource);
  };
  
  // Handler voor date range verandering
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };
  
  // Handler voor data refresh
  const handleRefresh = () => {
    fetchData();
  };
  
  // Handler voor het sluiten van de snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Handler voor het voltooien van de onboarding
  const handleOnboardingComplete = (formData) => {
    setSnackbar({
      open: true,
      message: `Welkom, ${formData.name}! Je account is ingesteld.`,
      severity: 'success'
    });
    
    // Update filters op basis van onboarding voorkeuren
    if (formData.dataSource !== 'all') {
      setDataSource(formData.dataSource);
    }
  };
  
  // Handler voor het wijzigen van de gebruikersrol
  const handleRoleChange = (event) => {
    setUserRole(event.target.value);
    
    // Track user behavior voor help personalisatie
    trackUserBehavior(HelpRecommendationService.USER_ACTIONS.HELP_CLICK, {
      activeView,
      action: 'role_change',
      value: event.target.value
    });
  };

  // Handler voor het wijzigen van het ervaringsniveau
  const handleExperienceLevelChange = (event) => {
    setExperienceLevel(event.target.value);
    
    // Track user behavior voor help personalisatie
    trackUserBehavior(HelpRecommendationService.USER_ACTIONS.HELP_CLICK, {
      activeView,
      action: 'experience_level_change',
      value: event.target.value
    });
  };
  
  // Handler voor het schakelen tussen A/B test en adaptieve help
  const handleToggleAdaptiveHelp = () => {
    setUseAdaptiveHelp(prev => !prev);
    
    // Track user behavior voor help personalisatie
    trackUserBehavior(HelpRecommendationService.USER_ACTIONS.HELP_CLICK, {
      activeView,
      action: 'toggle_adaptive_help',
      value: !useAdaptiveHelp
    });
  };
  
  // Handler voor het resetten van de tour
  const handleResetTour = () => {
    localStorage.removeItem('tourStatus');
    setSnackbar({
      open: true,
      message: 'Tour is gereset. Je kunt de tour nu opnieuw starten.',
      severity: 'info'
    });
  };
  
  // Handler voor het tonen/verbergen van help
  const handleToggleHelp = () => {
    setShowHelp(!showHelp);
  };
  
  // Handler voor het exporteren van het dashboard
  const handleExportDashboard = () => {
    // Deze functie wordt niet meer direct aangeroepen, maar is behouden voor backwards compatibility
    // De DashboardExport component handelt nu de export
  };
  
  // Handlers voor export events
  const handleExportStart = () => {
    setSnackbar({
      open: true,
      message: 'Dashboard exporteren gestart...',
      severity: 'info'
    });
  };
  
  const handleExportComplete = (result) => {
    setSnackbar({
      open: true,
      message: result.message || 'Dashboard succesvol geëxporteerd',
      severity: 'success'
    });
  };
  
  const handleExportError = (error) => {
    setSnackbar({
      open: true,
      message: `Fout bij exporteren: ${error.message || 'Onbekende fout'}`,
      severity: 'error'
    });
  };
  
  // Handler voor het delen van inzichten
  const handleShareInsights = () => {
    // Deze functie wordt niet meer direct aangeroepen, maar is behouden voor backwards compatibility
    // De ShareInsights component handelt nu het delen
  };
  
  // Handlers voor share events
  const handleShareStart = () => {
    setSnackbar({
      open: true,
      message: 'Inzichten delen gestart...',
      severity: 'info'
    });
  };
  
  const handleShareComplete = (result) => {
    setSnackbar({
      open: true,
      message: `Inzichten succesvol gedeeld via ${result.method}`,
      severity: 'success'
    });
  };
  
  const handleShareError = (error) => {
    setSnackbar({
      open: true,
      message: `Fout bij delen: ${error.message || 'Onbekende fout'}`,
      severity: 'error'
    });
  };
  
  // Handler voor rapport generatie
  const handleReportGenerated = (reportData) => {
    setSnackbar({
      open: true,
      message: 'Rapport succesvol gegenereerd',
      severity: 'success'
    });
  };
  
  return (
    <Container maxWidth="xl">
      {/* Breadcrumbs navigatie */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mt: 2, mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="/dashboard" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Link 
          color="inherit" 
          href="/analytics" 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <AnalyticsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Analytics
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          Topic Awareness
        </Typography>
      </Breadcrumbs>
      
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Topic Awareness Analyse
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Analyseer topic awareness data met visualisaties en gedetailleerde rapporten.
          Gebruik de tabs hieronder om te schakelen tussen het dashboard en het rapport.
        </Typography>
      </Box>
      
      {/* Tabs voor navigatie tussen dashboard en rapport */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeView} 
          onChange={(e, newValue) => handleTabChange(e, newValue)}
          aria-label="Topic awareness views"
        >
          <Tab 
            value="dashboard" 
            label="Dashboard" 
            id="tab-dashboard"
            aria-controls="tabpanel-dashboard"
          />
          <Tab 
            value="report" 
            label="Rapport" 
            id="tab-report"
            aria-controls="tabpanel-report"
          />
          <Tab 
            value="sentiment" 
            label="Sentiment Analyse" 
            id="tab-sentiment"
            aria-controls="tabpanel-sentiment"
          />
          <Tab 
            value="trends" 
            label="Trend Analyse" 
            id="tab-trends"
            aria-controls="tabpanel-trends"
          />
        </Tabs>
      </Paper>
      
      {/* Filters en acties */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
            <DataSourceSelector 
              value={dataSource} 
              onChange={handleDataSourceChange}
              aria-label="Selecteer databron"
              disabled={isLoading}
            />
            <DateRangePicker 
              value={dateRange} 
              onChange={handleDateRangeChange}
              aria-label="Selecteer datumbereik"
              disabled={isLoading}
            />
          </Box>
          <Box display="flex" gap={1}>
            {activeView === 'dashboard' && (
              <>
                <DashboardExport
                  dashboardRef={dashboardRef}
                  data={{
                    topicsByPhase,
                    awarenessDistribution,
                    contentRecommendations,
                    trendingTopics
                  }}
                  title="Topic Awareness Dashboard"
                  projectName={projectName}
                  disabled={isLoading || !topicsByPhase}
                  onExportStart={handleExportStart}
                  onExportComplete={handleExportComplete}
                  onExportError={handleExportError}
                />
                <ShareInsights
                  data={{
                    topicsByPhase,
                    awarenessDistribution,
                    contentRecommendations,
                    trendingTopics
                  }}
                  title="Topic Awareness Inzichten"
                  projectName={projectName}
                  disabled={isLoading || !topicsByPhase}
                  onShareStart={handleShareStart}
                  onShareComplete={handleShareComplete}
                  onShareError={handleShareError}
                />
              </>
            )}
            <Tooltip title="Ververs data">
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setHelpMenuOpen(true)}
                startIcon={<HelpIcon />}
              >
                Help
              </Button>
              <Button
                variant="outlined"
                color={useAdaptiveHelp ? "secondary" : "primary"}
                onClick={handleToggleAdaptiveHelp}
                sx={{ ml: 1 }}
              >
                {useAdaptiveHelp ? "A/B Testing" : "Adaptieve Help"}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isLoading}
                size="small"
              >
                Verversen
              </Button>
            </Tooltip>
            <Tooltip title="Help">
              <IconButton
                onClick={handleToggleHelp}
                size="small"
                aria-label="Help"
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
      
      {/* Help sectie */}
      {showHelp && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Help & Instructies</Typography>
            <IconButton onClick={handleToggleHelp} size="small" aria-label="Sluit help">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1" gutterBottom>
            Hoe gebruik je deze tool:
          </Typography>
          <Typography variant="body2" paragraph>
            1. Selecteer een databron en datumbereik met de filters bovenaan.
          </Typography>
          <Typography variant="body2" paragraph>
            2. Schakel tussen het dashboard en rapport met de tabs.
          </Typography>
          <Typography variant="body2" paragraph>
            3. In het dashboard kun je filteren op awareness fase en de visualisaties bekijken.
          </Typography>
          <Typography variant="body2" paragraph>
            4. In het rapport kun je een gedetailleerd rapport genereren en exporteren.
          </Typography>
          <Typography variant="body2">
            5. Gebruik de export en deel knoppen om inzichten te delen met anderen.
          </Typography>
        </Paper>
      )}
      
      {/* Error weergave */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} role="alert">
          {error}
        </Alert>
      )}
      
      {/* Tab panels */}
      <Box role="tabpanel" hidden={activeView !== 'dashboard'} id="tabpanel-dashboard" aria-labelledby="tab-dashboard" sx={{ mt: 2 }}>
        {activeView === 'dashboard' && (
          <TopicAwarenessDashboard
            topicsByPhase={topicsByPhase}
            awarenessDistribution={awarenessDistribution}
            contentRecommendations={contentRecommendations}
            trendingTopics={trendingTopics}
            isLoading={isLoading}
          />
        )}
      </Box>
      
      <Box role="tabpanel" hidden={activeView !== 'report'} id="tabpanel-report" aria-labelledby="tab-report" sx={{ mt: 2 }}>
        {activeView === 'report' && (
          <TopicAwarenessReport
            topicsByPhase={topicsByPhase}
            awarenessDistribution={awarenessDistribution}
            contentRecommendations={contentRecommendations}
            trendingTopics={trendingTopics}
            projectName={projectName}
            isLoading={isLoading}
            dataCollectionDate={dateRange.endDate}
            onReportGenerated={handleReportGenerated}
          />
        )}
      </Box>
      
      <Box role="tabpanel" hidden={activeView !== 'sentiment'} id="tabpanel-sentiment" aria-labelledby="tab-sentiment" sx={{ mt: 2 }}>
        {activeView === 'sentiment' && (
          <SentimentAnalysis
            topicsByPhase={topicsByPhase}
            trendingTopics={trendingTopics}
            isLoading={isLoading}
          />
        )}
      </Box>
      
      <Box role="tabpanel" hidden={activeView !== 'trends'} id="tabpanel-trends" aria-labelledby="tab-trends" sx={{ mt: 2 }}>
        {activeView === 'trends' && (
          <TrendAnalysis
            trendingTopics={trendingTopics}
            timeSeriesData={timeSeriesData}
            isLoading={isLoading}
          />
        )}
      </Box>
      
      {/* Snackbar voor notificaties */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Schakel tussen A/B test en adaptieve help */}
      {useAdaptiveHelp ? (
        <AdaptiveHelp
          activeView={activeView}
          userRole={userRole}
          experienceLevel={experienceLevel}
          onRoleChange={handleRoleChange}
          onExperienceLevelChange={handleExperienceLevelChange}
        />
      ) : (
        <ABTestHelpMethod
          activeView={activeView}
          title={`${activeView.charAt(0).toUpperCase() + activeView.slice(1)} Help`}
          content={`Deze pagina biedt inzicht in de ${activeView} functionaliteit van MarketPulse AI.`}
          userRole={userRole}
          experienceLevel={experienceLevel}
          onRoleChange={handleRoleChange}
          onExperienceLevelChange={handleExperienceLevelChange}
        >
          {/* Help overlay - wordt alleen getoond in variant 0 */}
          <HelpOverlay activeView={activeView} />
        </ABTestHelpMethod>
      )}
      
      {/* Onboarding wizard */}
      <OnboardingWizard
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
      
      {/* Help menu */}
      <HelpMenu
        activeView={activeView}
        faqItems={faqItems}
        videos={videoTutorials}
        userRole={userRole}
        experienceLevel={experienceLevel}
        onResetTour={handleResetTour}
        onRoleChange={handleRoleChange}
        onExperienceLevelChange={handleExperienceLevelChange}
      />
      
      {/* Footer met informatie */}
      <Box mt={6} mb={4}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          MarketPulse AI Platform | Topic Awareness Module | Laatste update: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Container>
  );
};

TopicAwarenessController.propTypes = {
  /**
   * ID van het project waarvoor de analyse wordt uitgevoerd
   */
  projectId: PropTypes.string,
  
  /**
   * Naam van het project waarvoor de analyse wordt uitgevoerd
   */
  projectName: PropTypes.string
};

export default TopicAwarenessController;
