import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton,
  Paper,
  Divider,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AnalyticsIcon from '@mui/icons-material/Analytics';

/**
 * Component voor het analyseren van concurrenten op basis van URL
 * Stelt gebruikers in staat om URLs van concurrenten toe te voegen voor analyse
 */
const CompetitorAnalysis = () => {
  const [competitorUrls, setCompetitorUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  
  // Valideer URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Voeg URL toe aan de lijst
  const handleAddUrl = () => {
    if (!newUrl) {
      setError('Voer een URL in');
      setShowError(true);
      return;
    }
    
    if (!isValidUrl(newUrl)) {
      setError('Voer een geldige URL in (bijv. https://www.voorbeeld.nl)');
      setShowError(true);
      return;
    }
    
    if (competitorUrls.includes(newUrl)) {
      setError('Deze URL is al toegevoegd');
      setShowError(true);
      return;
    }
    
    if (competitorUrls.length >= 5) {
      setError('Je kunt maximaal 5 concurrenten toevoegen');
      setShowError(true);
      return;
    }
    
    setCompetitorUrls([...competitorUrls, newUrl]);
    setNewUrl('');
  };
  
  // Verwijder URL uit de lijst
  const handleRemoveUrl = (index) => {
    const newUrls = [...competitorUrls];
    newUrls.splice(index, 1);
    setCompetitorUrls(newUrls);
  };
  
  // Analyseer concurrenten
  const handleAnalyze = async () => {
    if (competitorUrls.length === 0) {
      setError('Voeg ten minste één concurrent toe om te analyseren');
      setShowError(true);
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // In een echte implementatie zou dit een API call zijn
      // const response = await api.post('/competitors/analyze', { urls: competitorUrls });
      
      // Simuleer API call met timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock resultaten voor demonstratie
      const mockResults = {
        summary: 'Analyse van 3 concurrenten toont aan dat je product zich onderscheidt op prijs en gebruiksgemak.',
        competitors: competitorUrls.map((url, index) => ({
          url,
          name: `Concurrent ${index + 1}`,
          strengths: ['Sterke online aanwezigheid', 'Hoge klanttevredenheid'],
          weaknesses: ['Hogere prijzen', 'Beperkte productlijn'],
          marketShare: Math.floor(Math.random() * 30) + 5,
          priceComparison: Math.random() > 0.5 ? 'higher' : 'lower'
        }))
      };
      
      setAnalysisResults(mockResults);
    } catch (err) {
      console.error('Error analyzing competitors:', err);
      setError('Er is een fout opgetreden bij het analyseren van de concurrenten.');
      setShowError(true);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <Box sx={{ mt: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Concurrentie-analyse
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Voeg URLs van je concurrenten toe om een gedetailleerde analyse te krijgen van hun sterke en zwakke punten, 
          marktpositie en hoe jouw product zich verhoudt tot de concurrentie.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            label="URL naar concurrent"
            placeholder="https://www.concurrent.nl"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleAddUrl}
            startIcon={<AddIcon />}
            disabled={!newUrl || competitorUrls.length >= 5}
          >
            Toevoegen
          </Button>
        </Box>
        
        <Typography variant="caption" color="text.secondary">
          Je kunt maximaal 5 concurrenten toevoegen voor analyse.
        </Typography>
        
        {competitorUrls.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Toegevoegde concurrenten:
            </Typography>
            <List dense>
              {competitorUrls.map((url, index) => (
                <ListItem 
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemoveUrl(index)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText 
                    primary={url} 
                    primaryTypographyProps={{ 
                      style: { 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      } 
                    }} 
                  />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                startIcon={isAnalyzing ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
                sx={{ minWidth: 200 }}
              >
                {isAnalyzing ? 'Analyseren...' : 'Concurrenten Analyseren'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Nog geen concurrenten toegevoegd
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Resultaten van de analyse */}
      {analysisResults && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Analyse Resultaten
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            {analysisResults.summary}
          </Alert>
          
          <Typography variant="subtitle2" gutterBottom>
            Geanalyseerde concurrenten:
          </Typography>
          
          {analysisResults.competitors.map((competitor, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle1">
                {competitor.name} ({competitor.url})
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    Sterke punten:
                  </Typography>
                  <List dense>
                    {competitor.strengths.map((strength, i) => (
                      <ListItem key={i} sx={{ py: 0 }}>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    Zwakke punten:
                  </Typography>
                  <List dense>
                    {competitor.weaknesses.map((weakness, i) => (
                      <ListItem key={i} sx={{ py: 0 }}>
                        <ListItemText primary={weakness} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    Marktaandeel:
                  </Typography>
                  <Typography variant="body1">
                    {competitor.marketShare}%
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Prijsvergelijking:
                  </Typography>
                  <Typography variant="body1" color={competitor.priceComparison === 'higher' ? 'error.main' : 'success.main'}>
                    {competitor.priceComparison === 'higher' ? 'Duurder dan jouw product' : 'Goedkoper dan jouw product'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Paper>
      )}
      
      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompetitorAnalysis;
