import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, Typography, TextField, Button, 
  Paper, CircularProgress, Alert, 
  Chip, Divider, Grid
} from '@mui/material';
import { classifyContent } from '../../services/awarenessService';

/**
 * Component voor het classificeren van content in awareness fasen
 * @param {Object} props - Component properties
 * @param {string} props.projectId - Project ID
 * @param {Function} props.onClassificationComplete - Callback wanneer classificatie voltooid is
 */
const AwarenessClassificationForm = ({ projectId, onClassificationComplete }) => {
  const [content, setContent] = useState('');
  const [productContext, setProductContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Definieer kleuren voor elke fase
  const colors = {
    unaware: '#E0E0E0',
    problemAware: '#FF6B6B',
    solutionAware: '#48BEFF',
    productAware: '#4CAF50',
    mostAware: '#9C27B0'
  };

  // Classificeer content
  const handleClassify = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Voer content in om te classificeren');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const contentItems = [{
        type: 'text',
        content: content.trim()
      }];
      
      const contextObj = productContext.trim() ? { description: productContext.trim() } : {};
      
      const response = await classifyContent(projectId, contentItems, contextObj);
      
      if (response.success) {
        setResult(response.results[0]);
        
        // Roep callback aan als die is meegegeven
        if (onClassificationComplete) {
          onClassificationComplete(response.results[0]);
        }
      } else {
        setError(response.message || 'Classificatie mislukt');
      }
    } catch (error) {
      console.error('Error classifying content:', error);
      setError(error.message || 'Er is een fout opgetreden bij het classificeren van content');
    } finally {
      setLoading(false);
    }
  };

  // Reset het formulier
  const handleReset = () => {
    setContent('');
    setProductContext('');
    setResult(null);
    setError(null);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" component="div" gutterBottom>
        Content Classificeren
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleClassify}>
        <TextField
          label="Content om te classificeren"
          multiline
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          required
          margin="normal"
          placeholder="Plak hier de tekst die je wilt classificeren..."
          disabled={loading}
        />
        
        <TextField
          label="Product/Onderwerp Context (optioneel)"
          multiline
          rows={3}
          value={productContext}
          onChange={(e) => setProductContext(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="Voeg context toe over het product of onderwerp om de classificatie te verbeteren..."
          disabled={loading}
          helperText="Optionele context die helpt bij het nauwkeuriger classificeren van de content"
        />
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !content.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Bezig met classificeren...' : 'Classificeren'}
          </Button>
          
          <Button
            type="button"
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
        </Box>
      </form>
      
      {result && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Classificatie Resultaat
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Dominante Fase:
            </Typography>
            <Chip 
              label={result.dominantPhase.displayName} 
              sx={{ 
                bgcolor: colors[result.dominantPhase.name] || 'primary.main',
                color: result.dominantPhase.name === 'unaware' ? 'text.primary' : 'white',
                fontWeight: 'bold'
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {result.dominantPhase.description}
            </Typography>
          </Box>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {result.scores && Object.keys(result.scores).map(phaseName => (
              <Grid item xs={12} sm={6} md={4} key={phaseName}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: 1, 
                    borderColor: 'divider',
                    borderRadius: 1,
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2">
                      {result.phases[phaseName]?.displayName || phaseName}
                    </Typography>
                    <Chip 
                      label={`${Math.round(result.scores[phaseName] * 100)}%`}
                      size="small"
                      sx={{ 
                        bgcolor: colors[phaseName] || 'primary.main',
                        color: phaseName === 'unaware' ? 'text.primary' : 'white'
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      position: 'relative',
                      overflow: 'hidden',
                      mb: 1
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${result.scores[phaseName] * 100}%`,
                        bgcolor: colors[phaseName] || 'primary.main',
                        borderRadius: 4
                      }}
                    />
                  </Box>
                  {result.matchedIndicators && result.matchedIndicators[phaseName] && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Gedetecteerde indicatoren:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {result.matchedIndicators[phaseName].map((indicator, idx) => (
                          <Chip 
                            key={idx}
                            label={indicator}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
          
          {result.marketingRecommendations && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Marketing Aanbevelingen:
              </Typography>
              <Typography variant="body2" paragraph>
                {result.marketingRecommendations.primary}
              </Typography>
              {result.marketingRecommendations.secondary && (
                <Typography variant="body2" color="text.secondary">
                  {result.marketingRecommendations.secondary}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

AwarenessClassificationForm.propTypes = {
  projectId: PropTypes.string.isRequired,
  onClassificationComplete: PropTypes.func
};

export default AwarenessClassificationForm;
