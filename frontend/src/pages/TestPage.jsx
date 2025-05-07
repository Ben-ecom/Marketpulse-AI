import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Paper, Alert } from '@mui/material';
import { useAuthStore } from '../store/authStore';

/**
 * Test Page Component
 * Een eenvoudige pagina om te testen of de basis routing en rendering werkt
 */
const TestPage = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    console.log('TestPage mounted');
    console.log('User:', user);
    
    return () => {
      console.log('TestPage unmounted');
    };
  }, []);

  const handleClick = () => {
    try {
      setMessage(`Test succesvol! Gebruiker: ${user ? user.email : 'Niet ingelogd'}`);
    } catch (error) {
      console.error('Error in handleClick:', error);
      setError(error.message || 'Er is een fout opgetreden');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Test Pagina
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          Dit is een eenvoudige test pagina om te controleren of de basis routing en rendering werkt.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleClick}
          sx={{ mb: 2 }}
        >
          Test Knop
        </Button>
        
        {message && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              {message}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default TestPage;
