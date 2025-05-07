import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { generateMarketingRecommendations } from '../../utils/recommendations/recommendationEngine';

/**
 * Component voor het weergeven van automatische marketingaanbevelingen
 * @param {Object} props - Component props
 */
const MarketingRecommendations = ({
  sentimentData = [],
  competitorData = [],
  audienceData = {},
  projectName = '',
  loading = false,
  error = null,
  onRecommendationAction = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State voor aanbevelingen
  const [recommendations, setRecommendations] = useState([]);
  const [groupedRecommendations, setGroupedRecommendations] = useState({});
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);
  
  // Genereer aanbevelingen wanneer data verandert
  useEffect(() => {
    if (
      (sentimentData && sentimentData.length > 0) ||
      (competitorData && competitorData.length > 0) ||
      (audienceData && Object.keys(audienceData).length > 0)
    ) {
      generateRecommendations();
    }
  }, [sentimentData, competitorData, audienceData, projectName]);
  
  // Functie om aanbevelingen te genereren
  const generateRecommendations = () => {
    setGeneratingRecommendations(true);
    setRecommendationsError(null);
    
    try {
      // Verzamel data voor aanbevelingen
      const data = {
        sentimentData,
        competitorData,
        audienceData
      };
      
      // Verzamel context voor aanbevelingen
      const context = {
        projectName,
        currentDate: new Date().toISOString(),
        // Voeg hier meer context toe indien beschikbaar
      };
      
      // Genereer aanbevelingen
      const result = generateMarketingRecommendations(data, context);
      
      // Update state
      setRecommendations(result.recommendations || []);
      setGroupedRecommendations(result.groupedRecommendations || {});
      setGeneratingRecommendations(false);
    } catch (error) {
      console.error('Fout bij genereren aanbevelingen:', error);
      setRecommendationsError('Er is een fout opgetreden bij het genereren van aanbevelingen.');
      setGeneratingRecommendations(false);
    }
  };
  
  // Render loading state
  if (loading || generatingRecommendations) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          {loading ? 'Data laden...' : 'Aanbevelingen genereren...'}
        </Typography>
      </Box>
    );
  }
  
  // Render error state
  if (error || recommendationsError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || recommendationsError}
      </Alert>
    );
  }
  
  // Render empty state
  if (recommendations.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="info">
          Er zijn nog geen aanbevelingen beschikbaar. Verzamel eerst data via de andere modules.
        </Alert>
      </Box>
    );
  }
  
  // Render aanbevelingen
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Typography variant="h5" gutterBottom>
        Automatische Marketingaanbevelingen
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Op basis van de verzamelde data zijn de volgende aanbevelingen gegenereerd.
        Prioriteit is aangegeven met kleurcodes: hoog (rood), medium (oranje), laag (groen).
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Hier komen de aanbevelingen */}
      <Grid container spacing={3}>
        {recommendations.map((recommendation) => (
          <Grid item xs={12} md={6} key={recommendation.id}>
            <Card 
              variant="outlined"
              sx={{ 
                height: '100%',
                borderLeft: '4px solid',
                borderLeftColor: 
                  recommendation.priority === 'high' 
                    ? 'error.main' 
                    : recommendation.priority === 'medium'
                      ? 'warning.main'
                      : 'success.main'
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {recommendation.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {recommendation.description}
                </Typography>
                
                {recommendation.steps && recommendation.steps.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Implementatiestappen:
                    </Typography>
                    
                    <Box component="ol" sx={{ pl: 2, mt: 1 }}>
                      {recommendation.steps.map((step, index) => (
                        <li key={index}>
                          <Typography variant="body2">
                            {step}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

MarketingRecommendations.propTypes = {
  sentimentData: PropTypes.array,
  competitorData: PropTypes.array,
  audienceData: PropTypes.object,
  projectName: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRecommendationAction: PropTypes.func
};

export default MarketingRecommendations;
