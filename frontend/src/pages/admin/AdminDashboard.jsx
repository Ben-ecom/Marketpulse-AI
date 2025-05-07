import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Paper
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Lightbulb as LightbulbIcon,
  SupervisedUserCircle as SupervisedUserCircleIcon,
  BarChart as BarChartIcon,
  Help as HelpIcon,
  Notifications as NotificationsIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSnackbar } from 'notistack';
import PageHeader from '../../components/PageHeader';

/**
 * Admin dashboard pagina
 * @returns {JSX.Element} AdminDashboard component
 */
function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();

  // Controleer of gebruiker admin is bij laden
  useEffect(() => {
    if (!user || !user.is_admin) {
      enqueueSnackbar('Alleen admins hebben toegang tot deze pagina', { variant: 'error' });
      navigate('/dashboard');
    }
  }, [user, navigate, enqueueSnackbar]);

  // Admin modules
  const adminModules = [
    {
      title: 'Decodo API Tester',
      description: 'Test de integratie met de Decodo Scraping API',
      icon: <CodeIcon fontSize="large" color="primary" />,
      path: '/admin/decodo-tester',
      color: '#e8f5e9'
    },
    {
      title: 'Help Metrics Dashboard',
      description: 'Bekijk en analyseer metrieken van het help-systeem',
      icon: <BarChartIcon fontSize="large" color="primary" />,
      path: '/admin/help-metrics',
      color: '#f5f5f5'
    },
    {
      title: 'Notificatie Dashboard',
      description: 'Beheer notificaties en monitor drempelwaarden',
      icon: <NotificationsIcon fontSize="large" color="primary" />,
      path: '/admin/notifications',
      color: '#f5f5f5'
    },
    {
      title: 'Feedback Analyse',
      description: 'Analyseer gebruikersfeedback over de help-functionaliteit',
      icon: <SupervisedUserCircleIcon fontSize="large" color="primary" />,
      path: '/admin/feedback-analytics',
      color: '#f5f5f5'
    },
    {
      title: 'Marketingstrategieën',
      description: 'Beheer strategieën voor AI-gestuurde aanbevelingen',
      icon: <LightbulbIcon fontSize="large" color="primary" />,
      path: '/admin/marketing-strategies',
      color: '#f5f5f5'
    },
    {
      title: 'Gebruikersbeheer',
      description: 'Beheer gebruikers en toegangsrechten',
      icon: <SupervisedUserCircleIcon fontSize="large" color="primary" />,
      path: '/admin/users',
      color: '#f5f5f5',
      disabled: true
    },
    {
      title: 'Marktcategorieën',
      description: 'Beheer industrieën en marktcategorieën',
      icon: <CategoryIcon fontSize="large" color="primary" />,
      path: '/admin/categories',
      color: '#f5f5f5',
      disabled: true
    },
    {
      title: 'Systeeminstellingen',
      description: 'Configureer algemene systeeminstellingen',
      icon: <SettingsIcon fontSize="large" color="primary" />,
      path: '/admin/settings',
      color: '#f5f5f5',
      disabled: true
    }
  ];

  // Navigeer naar module
  const navigateToModule = (path, disabled) => {
    if (disabled) {
      enqueueSnackbar('Deze functie is nog niet beschikbaar', { variant: 'info' });
      return;
    }
    navigate(path);
  };

  return (
    <Container maxWidth="lg">
      <PageHeader 
        title="Admin Dashboard" 
        subtitle="Beheer en configuratie van MarketPulse AI"
        showBackButton
        backTo="/dashboard"
      />
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" paragraph>
          Welkom bij het admin dashboard. Hier kunt u verschillende aspecten van het MarketPulse AI platform beheren en configureren.
        </Typography>
        
        <Typography variant="body1">
          Selecteer een module om te beginnen:
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        {adminModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                opacity: module.disabled ? 0.7 : 1,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: module.disabled ? 'none' : 'translateY(-5px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  bgcolor: module.color || 'background.paper'
                }}
              >
                {module.icon}
                <Typography variant="h6" sx={{ ml: 2 }}>
                  {module.title}
                </Typography>
              </Box>
              
              <Divider />
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {module.description}
                </Typography>
                
                {module.disabled && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      mt: 2,
                      fontStyle: 'italic'
                    }}
                  >
                    Binnenkort beschikbaar
                  </Typography>
                )}
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  onClick={() => navigateToModule(module.path, module.disabled)}
                  disabled={module.disabled}
                >
                  {module.disabled ? 'Binnenkort beschikbaar' : 'Openen'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default AdminDashboard;
