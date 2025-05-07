import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, Typography, Grid, Button, Paper,
  CircularProgress, Alert, Tabs, Tab
} from '@mui/material';
import AwarenessDistribution from './AwarenessDistribution';
import MarketingRecommendations from './MarketingRecommendations';
import { 
  getAwarenessPhases, 
  getMarketingRecommendations, 
  initializeAwarenessPhases 
} from '../../services/awarenessService';

/**
 * Component voor het visualiseren van awareness inzichten
 * @param {Object} props - Component properties
 * @param {string} props.projectId - Project ID
 * @param {Array} props.contentItems - Content items voor classificatie
 */
const AwarenessInsights = ({ projectId, contentItems }) => {
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState(null);
  const [awarenessData, setAwarenessData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Haal awareness data op bij component mount
  useEffect(() => {
    if (projectId) {
      fetchAwarenessData();
    }
  }, [projectId]);

  // Haal awareness data op
  const fetchAwarenessData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Haal awareness fasen op
      const phasesResponse = await getAwarenessPhases(projectId);
      
      if (phasesResponse.success && phasesResponse.phases && phasesResponse.phases.length > 0) {
        // Converteer array naar object met fase naam als key
        const phasesObject = {};
        phasesResponse.phases.forEach(phase => {
          phasesObject[phase.name] = phase;
        });
        
        setAwarenessData(phasesObject);
        
        // Haal marketing aanbevelingen op
        const recommendationsResponse = await getMarketingRecommendations(projectId);
        if (recommendationsResponse.success) {
          setRecommendations(recommendationsResponse.recommendations);
        }
      } else {
        setError('Geen awareness fasen gevonden. Initialiseer fasen om te beginnen.');
      }
    } catch (error) {
      console.error('Error fetching awareness data:', error);
      setError(error.message || 'Er is een fout opgetreden bij het ophalen van awareness data');
    } finally {
      setLoading(false);
    }
  };

  // Initialiseer awareness fasen
  const handleInitialize = async () => {
    try {
      setInitializing(true);
      setError(null);

      const response = await initializeAwarenessPhases(projectId);
      
      if (response.success) {
        // Converteer array naar object met fase naam als key
        const phasesObject = {};
        response.phases.forEach(phase => {
          phasesObject[phase.name] = phase;
        });
        
        setAwarenessData(phasesObject);
        
        // Haal marketing aanbevelingen op
        const recommendationsResponse = await getMarketingRecommendations(projectId);
        if (recommendationsResponse.success) {
          setRecommendations(recommendationsResponse.recommendations);
        }
      } else {
        setError('Fout bij initialiseren van awareness fasen');
      }
    } catch (error) {
      console.error('Error initializing awareness phases:', error);
      setError(error.message || 'Er is een fout opgetreden bij het initialiseren van awareness fasen');
    } finally {
      setInitializing(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Toon een placeholder als er geen project ID is
  if (!projectId) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Selecteer een project om awareness inzichten te bekijken
        </Typography>
      </Paper>
    );
  }

  // Toon een error als er een fout is opgetreden
  if (error && !loading && !initializing) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
        {error.includes('Initialiseer') && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleInitialize}
            disabled={initializing}
            startIcon={initializing ? <CircularProgress size={20} /> : null}
          >
            {initializing ? 'Bezig met initialiseren...' : 'Initialiseer Awareness Fasen'}
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" component="div" gutterBottom>
        Awareness Inzichten
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="awareness insights tabs">
          <Tab label="Fase Distributie" />
          <Tab label="Marketing Aanbevelingen" />
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {activeTab === 0 && (
            <AwarenessDistribution 
              awarenessData={awarenessData} 
              loading={loading} 
            />
          )}
          
          {activeTab === 1 && (
            <MarketingRecommendations 
              recommendations={recommendations} 
              loading={loading} 
            />
          )}
        </Box>
      )}
    </Box>
  );
};

AwarenessInsights.propTypes = {
  projectId: PropTypes.string,
  contentItems: PropTypes.array
};

export default AwarenessInsights;
