import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Box, Button, Alert, CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Simplified Awareness Page Component
 * Vereenvoudigde versie om het probleem te isoleren
 */
const AwarenessPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('AwarenessPage mounted');
    console.log('ProjectId:', projectId);
    console.log('User:', user);
    
    // Controleer op potentiële problemen
    if (!projectId) {
      setError('Geen project ID gevonden');
    }
    
    if (!user) {
      setError('Geen gebruiker gevonden');
    }
    
    return () => {
      console.log('AwarenessPage unmounted');
    };
  }, [projectId, user]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Audience Awareness - Vereenvoudigde Test
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {error ? (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <Typography variant="body1" paragraph>
            Dit is een vereenvoudigde versie van de Awareness pagina om het probleem te isoleren.
          </Typography>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Debug Informatie:
          </Typography>
          <Typography variant="body2">
            Project ID: {projectId || 'Niet gevonden'}
          </Typography>
          <Typography variant="body2">
            Gebruiker: {user ? user.email || user.id || 'Onbekend' : 'Niet ingelogd'}
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Terug naar Projecten
        </Button>
      </Paper>
    </Container>
  );
};

export default AwarenessPage;
