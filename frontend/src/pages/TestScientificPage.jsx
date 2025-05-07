import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Een eenvoudige test pagina om te controleren of de routing werkt
 */
const TestScientificPage = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test Wetenschappelijk Onderzoek Pagina
      </Typography>
      <Typography variant="body1" paragraph>
        Dit is een eenvoudige test pagina om te controleren of de routing werkt.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={RouterLink}
        to="/dashboard"
      >
        Terug naar Dashboard
      </Button>
    </Box>
  );
};

export default TestScientificPage;
