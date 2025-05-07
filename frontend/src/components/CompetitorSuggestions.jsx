import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Info as InfoIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useAuthStore } from '../store/authStore';

/**
 * Component voor het suggereren van concurrenten op basis van marktonderzoek
 * @param {object} props - Component properties
 * @param {string} props.projectId - ID van het project
 * @param {function} props.onAddCompetitor - Functie om een concurrent toe te voegen
 * @returns {JSX.Element} CompetitorSuggestions component
 */
const CompetitorSuggestions = ({ projectId, onAddCompetitor }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [marketData, setMarketData] = useState(null);

  // Haal marktdata op bij laden
  useEffect(() => {
    fetchMarketData();
  }, [projectId]);

  // Haal marktdata op
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/market-research/${projectId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (response.data.success && response.data.data) {
        setMarketData(response.data.data);
        generateSuggestions(response.data.data);
      } else {
        setError('Geen marktonderzoeksdata beschikbaar');
      }
    } catch (error) {
      console.error('Fout bij ophalen marktdata:', error);
      setError('Fout bij ophalen marktonderzoeksdata');
    } finally {
      setLoading(false);
    }
  };

  // Genereer suggesties op basis van marktdata
  const generateSuggestions = (data) => {
    if (!data || !data.research_data) {
      setSuggestions([]);
      return;
    }

    const { competitorData, marketTrends } = data.research_data;
    
    // Combineer concurrenten uit verschillende bronnen
    let allCompetitors = [];
    
    // Voeg concurrenten uit competitorData toe
    if (competitorData && Array.isArray(competitorData)) {
      allCompetitors = [
        ...allCompetitors,
        ...competitorData.map(competitor => ({
          name: competitor.name,
          url: competitor.website || `https://${competitor.name.toLowerCase().replace(/\s+/g, '')}.com`,
          relevance: competitor.marketShare || Math.random() * 0.5 + 0.5,
          source: 'Marktonderzoek',
          description: competitor.description || `${competitor.name} is een concurrent in deze markt.`
        }))
      ];
    }
    
    // Extraheer concurrenten uit markttrends
    if (marketTrends && Array.isArray(marketTrends)) {
      const trendCompetitors = [];
      
      marketTrends.forEach(source => {
        if (source.trends && Array.isArray(source.trends)) {
          source.trends.forEach(trend => {
            // Zoek bedrijfsnamen in trend beschrijvingen
            const description = trend.description || '';
            const companies = extractCompanyNames(description);
            
            companies.forEach(company => {
              if (!allCompetitors.some(c => c.name.toLowerCase() === company.toLowerCase()) &&
                  !trendCompetitors.some(c => c.name.toLowerCase() === company.toLowerCase())) {
                trendCompetitors.push({
                  name: company,
                  url: `https://${company.toLowerCase().replace(/\s+/g, '')}.com`,
                  relevance: Math.random() * 0.3 + 0.3,
                  source: 'Markttrends',
                  description: `${company} werd genoemd in de context van: ${trend.name}`
                });
              }
            });
          });
        }
      });
      
      allCompetitors = [...allCompetitors, ...trendCompetitors];
    }
    
    // Sorteer op relevantie
    allCompetitors.sort((a, b) => b.relevance - a.relevance);
    
    // Beperk tot top 5
    setSuggestions(allCompetitors.slice(0, 5));
  };

  // Extraheer bedrijfsnamen uit tekst
  const extractCompanyNames = (text) => {
    // Dit is een vereenvoudigde implementatie
    // In een echte applicatie zou je NLP of een API gebruiken
    
    // Lijst met bekende bedrijfsnamen voor demo doeleinden
    const knownCompanies = [
      'Google', 'Apple', 'Microsoft', 'Amazon', 'Facebook',
      'Netflix', 'Spotify', 'Twitter', 'LinkedIn', 'Uber',
      'Airbnb', 'Tesla', 'Samsung', 'Sony', 'IBM',
      'Oracle', 'Intel', 'AMD', 'Nvidia', 'Cisco'
    ];
    
    // Filter bedrijven die in de tekst voorkomen
    return knownCompanies.filter(company => 
      text.toLowerCase().includes(company.toLowerCase())
    );
  };

  // Voeg een gesuggereerde concurrent toe
  const handleAddSuggestion = (suggestion) => {
    onAddCompetitor({
      name: suggestion.name,
      url: suggestion.url
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Suggesties laden...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Geen concurrentsuggesties beschikbaar. Voer eerst een marktonderzoek uit.
      </Alert>
    );
  }

  return (
    <Paper sx={{ mt: 3, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Aanbevolen Concurrenten
        </Typography>
        <Tooltip title="Deze suggesties zijn gebaseerd op uw marktonderzoeksgegevens">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Op basis van uw marktonderzoek hebben we de volgende concurrenten geïdentificeerd:
      </Typography>
      
      <List>
        {suggestions.map((suggestion, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Divider component="li" />}
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1">{suggestion.name}</Typography>
                    <Chip 
                      label={`Relevantie: ${(suggestion.relevance * 100).toFixed(0)}%`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" component="span" color="text.primary">
                      {suggestion.url}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {suggestion.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bron: {suggestion.source}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddSuggestion(suggestion)}
                >
                  Toevoegen
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default CompetitorSuggestions;
