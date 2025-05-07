/**
 * HelpMetricsDashboardPage.jsx
 * 
 * Pagina component voor het Help Metrics Dashboard.
 * Deze pagina is alleen toegankelijk voor beheerders.
 */

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Breadcrumbs, Link, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BarChartIcon from '@mui/icons-material/BarChart';

// Import het dashboard component
import HelpMetricsDashboard from '../../components/help/dashboard/HelpMetricsDashboard';

// Import user store voor rechtencontrole
import { useAuthStore } from '../../store/authStore';

/**
 * HelpMetricsDashboardPage Component
 * 
 * Pagina voor het weergeven van het Help Metrics Dashboard.
 * Bevat broodkruimelnavigatie en toegangscontrole.
 * 
 * @component
 */
const HelpMetricsDashboardPage = () => {
  const { user } = useAuthStore();
  const [hasAccess, setHasAccess] = useState(false);
  
  // Controleer of de gebruiker toegang heeft tot deze pagina
  useEffect(() => {
    // In een echte applicatie zou je hier de gebruikersrol controleren
    // Voor nu gaan we ervan uit dat alle ingelogde gebruikers toegang hebben
    if (user) {
      // Controleer of de gebruiker een admin is
      const isAdmin = user.role === 'admin' || user.is_admin === true;
      setHasAccess(isAdmin);
    } else {
      setHasAccess(false);
    }
  }, [user]);
  
  // Als de gebruiker geen toegang heeft, toon een melding
  if (!hasAccess) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Je hebt geen toegang tot deze pagina. Alleen beheerders kunnen het Help Metrics Dashboard bekijken.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Broodkruimelnavigatie */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component={RouterLink}
            to="/dashboard"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Link
            component={RouterLink}
            to="/admin"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <AdminPanelSettingsIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Admin
          </Link>
          <Typography
            sx={{ display: 'flex', alignItems: 'center' }}
            color="text.primary"
          >
            <BarChartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Help Metrics Dashboard
          </Typography>
        </Breadcrumbs>
      </Paper>
      
      {/* Help Metrics Dashboard */}
      <HelpMetricsDashboard />
    </Box>
  );
};

export default HelpMetricsDashboardPage;
