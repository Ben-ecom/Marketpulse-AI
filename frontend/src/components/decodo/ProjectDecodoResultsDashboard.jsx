import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { supabase } from '../../utils/supabaseClient';
import DecodoResultsDashboard from './DecodoResultsDashboard';

/**
 * ProjectDecodoResultsDashboard Component
 * Wrapper component voor het DecodoResultsDashboard dat de projectId uit de URL parameters haalt
 */
const ProjectDecodoResultsDashboard = () => {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Haal projectgegevens op wanneer het component wordt geladen
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('name')
          .eq('id', projectId)
          .single();

        if (error) {
          throw error;
        }

        setProjectName(data?.name || 'Project');
      } catch (error) {
        console.error('Fout bij het ophalen van projectgegevens:', error);
        setError('Fout bij het ophalen van projectgegevens. Controleer of het project bestaat.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Project laden...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <DecodoResultsDashboard 
      projectId={projectId} 
      projectName={projectName}
    />
  );
};

export default ProjectDecodoResultsDashboard;
