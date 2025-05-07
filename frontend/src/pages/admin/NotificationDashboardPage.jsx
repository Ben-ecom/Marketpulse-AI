/**
 * NotificationDashboardPage.jsx
 * 
 * Pagina voor het weergeven van het NotificationDashboard.
 * Deze pagina is toegankelijk voor beheerders via de admin routes.
 */

import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NotificationDashboard from '../../components/help/dashboard/NotificationDashboard';

/**
 * NotificationDashboardPage component
 * @component
 */
const NotificationDashboardPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin" color="inherit">
          Admin
        </Link>
        <Typography color="text.primary">Notificatie Dashboard</Typography>
      </Breadcrumbs>
      
      <NotificationDashboard />
    </Box>
  );
};

export default NotificationDashboardPage;
