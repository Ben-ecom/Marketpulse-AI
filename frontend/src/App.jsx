import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';

// Error Boundary voor foutafhandeling
import ErrorBoundary from './components/ErrorBoundary';

// Pagina's
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardOverview from './pages/DashboardOverview';
import ProjectCreateSimplified from './pages/ProjectCreateSimplified';
import ProjectDetail from './pages/ProjectDetail';
import ProjectEdit from './pages/ProjectEdit';
import TestProjectCreate from './pages/TestProjectCreate';
import DataCollection from './pages/DataCollection';
import Insights from './pages/Insights';
import MarketResearch from './pages/MarketResearch';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import AudienceInsights from './pages/AudienceInsights';
import AudienceInsightsDashboard from './pages/AudienceInsightsDashboard';
import TrendingTopicsPage from './pages/TrendingTopicsPage';
import AwarenessPage from './pages/AwarenessPage';
import AwarenessPhaseDashboard from './pages/AwarenessPhaseDashboard';
import AwarenessDashboard from './pages/AwarenessDashboard';
import SentimentAnalysisDashboard from './pages/SentimentAnalysisDashboard';
import TrendingTopicsDashboard from './pages/TrendingTopicsDashboard';
import ScientificResearchPage from './pages/ScientificResearchPage';
import TestScientificPage from './pages/TestScientificPage';
import TestPage from './pages/TestPage';
import TopicAwarenessReportPage from './routes/TopicAwarenessReportPage';
import TopicAwarenessDashboardPage from './routes/TopicAwarenessDashboardPage';
import TopicAwarenessControllerPage from './routes/TopicAwarenessControllerPage';
import NotFound from './pages/NotFound';
import UIComponents from './pages/UIComponents';
import MarketInsights from './pages/MarketInsights';

// Admin pagina's
import AdminDashboard from './pages/admin/AdminDashboard';
import MarketingStrategies from './pages/admin/MarketingStrategies';
import HelpMetricsDashboardPage from './pages/admin/HelpMetricsDashboardPage';
import NotificationDashboardPage from './pages/admin/NotificationDashboardPage';
import FeedbackAnalyticsDashboard from './components/analytics/FeedbackAnalyticsDashboard';

// Decodo API Tester
import DecodoTester from './components/DecodoTester';
import DecodoResultsDashboard from './components/decodo/DecodoResultsDashboard';
import ProjectDecodoResultsDashboard from './components/decodo/ProjectDecodoResultsDashboard';

// Dashboard componenten
import InsightsDashboardPage from './pages/InsightsDashboardPage';

// Componenten
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Hooks en utils
import { useAuthStore } from './store/authStore';
import { supabase } from './api/supabase';

// Context providers
import { NotificationProvider } from './contexts/NotificationContext';

// Thema configuratie
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Blauw
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#10b981', // Groen
      light: '#34d399',
      dark: '#059669',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
    success: {
      main: '#10b981',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Voor demonstratiedoeleinden: stel een dummy gebruiker in
    // We gebruiken alleen een dummy gebruiker zonder Supabase authenticatie
    // om database-afhankelijkheid te vermijden
    const dummyUser = {
      id: 'demo-user',
      email: 'demo@example.com',
      token: 'demo-token',
      user_metadata: {
        full_name: 'Demo Gebruiker'
      },
      is_admin: true // Voor demonstratiedoeleinden toegang tot admin functionaliteit
    };
    
    // Gebruik de dummy gebruiker
    setUser(dummyUser);
    setLoading(false);

    // Geen cleanup nodig omdat we geen subscription hebben
    return () => {};
  }, [setUser]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Gebruik de gebruiker uit de authStore
  const currentUser = user;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <ErrorBoundary showDetails={true}>
        <Routes>
        {/* Tijdelijk aangepast voor demonstratie */}
        <Route path="/login" element={<Navigate to="/dashboard" />} />
        <Route path="/register" element={<Navigate to="/dashboard" />} />
        
        {/* UI Components pagina - toegankelijk zonder authenticatie */}
        <Route path="/ui-components" element={<UIComponents />} />
        
        <Route element={<ProtectedRoute user={currentUser} />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/projects/new" element={<ProjectCreateSimplified />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/projects/:projectId/edit" element={<ProjectEdit />} />
            <Route path="/projects/:projectId/data-collection" element={<DataCollection />} />
            <Route path="/projects/:projectId/insights" element={<Insights />} />
            <Route path="/projects/:projectId/audience-insights" element={<AudienceInsights />} />
            <Route path="/projects/:projectId/audience-insights-dashboard" element={<AudienceInsightsDashboard />} />
            <Route path="/projects/:projectId/market-research" element={<MarketResearch />} />
            <Route path="/projects/:projectId/competitor-analysis" element={<CompetitorAnalysis />} />
            <Route path="/projects/:projectId/trending-topics" element={<TrendingTopicsPage />} />
            <Route path="/projects/:projectId/awareness" element={<AwarenessPage />} />
            <Route path="/projects/:projectId/awareness-phases" element={<AwarenessPhaseDashboard />} />
            <Route path="/projects/:projectId/awareness-dashboard" element={<AwarenessDashboard />} />
            <Route path="/projects/:projectId/sentiment-analysis" element={<SentimentAnalysisDashboard />} />
            <Route path="/projects/:projectId/trending-topics-dashboard" element={<TrendingTopicsDashboard />} />
            <Route path="/projects/:projectId/topic-awareness-report" element={<TopicAwarenessReportPage />} />
            <Route path="/projects/:projectId/topic-awareness-dashboard" element={<TopicAwarenessDashboardPage />} />
            <Route path="/projects/:projectId/topic-awareness/:tab" element={<TopicAwarenessControllerPage />} />
            <Route path="/projects/:projectId/topic-awareness" element={<TopicAwarenessControllerPage />} />
            <Route path="/projects/:projectId/scientific-research" element={<ScientificResearchPage />} />
            <Route path="/test-scientific" element={<TestScientificPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/test-project-create" element={<TestProjectCreate />} />
            <Route path="/market-insights" element={<MarketInsights />} />
            <Route path="/analytics/topic-awareness" element={<TopicAwarenessControllerPage />} />
            <Route path="/analytics/topic-awareness/:tab" element={<TopicAwarenessControllerPage />} />
            <Route path="/analytics/topic-awareness-report" element={<TopicAwarenessReportPage />} />
            <Route path="/analytics/topic-awareness-dashboard" element={<TopicAwarenessDashboardPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/marketing-strategies" element={<MarketingStrategies />} />
            <Route path="/admin/feedback-analytics" element={<FeedbackAnalyticsDashboard />} />
            <Route path="/admin/help-metrics" element={<HelpMetricsDashboardPage />} />
            <Route path="/admin/notifications" element={<NotificationDashboardPage />} />
            <Route path="/admin/decodo-tester" element={<DecodoTester />} />
            <Route path="/admin/decodo-dashboard" element={<DecodoResultsDashboard projectId="default" projectName="Decodo Dashboard" />} />
            <Route path="/projects/:projectId/decodo-dashboard" element={<ProjectDecodoResultsDashboard />} />
            <Route path="/projects/:projectId/insights-dashboard" element={<InsightsDashboardPage />} />
          </Route>
        </Route>
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
        </ErrorBoundary>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
