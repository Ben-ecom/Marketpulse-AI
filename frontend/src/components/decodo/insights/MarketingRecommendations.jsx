import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  TextField,
  IconButton
} from '@mui/material';
import { 
  Campaign as CampaignIcon,
  Mail as MailIcon,
  ShoppingCart as ShoppingCartIcon,
  Videocam as VideocamIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import TextGradient from '../../ui/TextGradient';
import GradientBackground from '../../ui/GradientBackground';
import { supabase } from '../../../utils/supabaseClient';
import { recommendationsService } from '../../../services/RecommendationsService';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

// Styles
import '../../../styles/marketingRecommendations.css';

/**
 * MarketingRecommendations Component
 * Genereert marketingaanbevelingen op basis van inzichten
 */
const MarketingRecommendations = ({ 
  insights,
  projectId,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  
  // Effect voor het ophalen van bestaande aanbevelingen
  useEffect(() => {
    if (projectId) {
      fetchRecommendations();
    }
  }, [projectId]);
  
  // Haal bestaande aanbevelingen op uit de database
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      setRecommendations(data || []);
    } catch (error) {
      console.error('Fout bij ophalen van aanbevelingen:', error);
      setError('Fout bij ophalen van aanbevelingen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Genereer nieuwe aanbevelingen op basis van inzichten
  const generateRecommendations = async () => {
    try {
      if (!insights || insights.length === 0) {
        setError('Geen inzichten beschikbaar om aanbevelingen te genereren');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Bereid de data voor
      const insightData = insights.map(insight => ({
        id: insight.id,
        content: insight.content,
        platform: insight.platform,
        sentiment: insight.sentiment,
        category: insight.category,
        created_at: insight.created_at
      }));
      
      // Gebruik de lokale RecommendationsService om aanbevelingen te genereren
      const data = await recommendationsService.generateRecommendations(insightData, projectId);
      
      if (!data) {
        throw new Error('Geen aanbevelingen gegenereerd');
      }
      
      // Voeg de nieuwe aanbevelingen toe aan de bestaande
      setRecommendations(prevRecs => [...prevRecs, ...data]);
      
      // Toon een succesmelding
      setError(null);
    } catch (error) {
      console.error('Fout bij genereren van aanbevelingen:', error);
      setError('Fout bij genereren van aanbevelingen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Kopieer een aanbeveling naar het klembord
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(err => {
        console.error('Fout bij kopiëren naar klembord:', err);
      });
  };
  
  // Start het bewerken van een aanbeveling
  const startEditing = (recommendation) => {
    setEditingId(recommendation.id);
    setEditText(recommendation.content);
  };
  
  // Sla de bewerkte aanbeveling op
  const saveEdit = async () => {
    try {
      if (!editText.trim()) {
        return;
      }
      
      const { data, error } = await supabase
        .from('recommendations')
        .update({ content: editText })
        .eq('id', editingId)
        .select();
      
      if (error) throw error;
      
      // Update de aanbevelingen in de state
      setRecommendations(prevRecs => 
        prevRecs.map(rec => rec.id === editingId ? { ...rec, content: editText } : rec)
      );
      
      // Reset de editing state
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Fout bij opslaan van aanbeveling:', error);
      setError('Fout bij opslaan van aanbeveling: ' + error.message);
    }
  };
  
  // Verwijder een aanbeveling
  const deleteRecommendation = async (id) => {
    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Verwijder de aanbeveling uit de state
      setRecommendations(prevRecs => prevRecs.filter(rec => rec.id !== id));
    } catch (error) {
      console.error('Fout bij verwijderen van aanbeveling:', error);
      setError('Fout bij verwijderen van aanbeveling: ' + error.message);
    }
  };
  
  // Filter aanbevelingen op type
  const filteredRecommendations = selectedType === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.type === selectedType);
  
  // Render een icoon op basis van het type aanbeveling
  const renderTypeIcon = (type) => {
    switch (type) {
      case 'ad_copy':
        return <CampaignIcon />;
      case 'email':
        return <MailIcon />;
      case 'product_page':
        return <ShoppingCartIcon />;
      case 'ugc_script':
        return <VideocamIcon />;
      case 'seo':
        return <SearchIcon />;
      default:
        return <CampaignIcon />;
    }
  };
  
  // Render de titel van het type aanbeveling
  const getTypeTitle = (type) => {
    switch (type) {
      case 'ad_copy':
        return 'Advertentietekst';
      case 'email':
        return 'Email Marketing';
      case 'product_page':
        return 'Productpagina';
      case 'ugc_script':
        return 'UGC Video Script';
      case 'seo':
        return 'SEO Optimalisatie';
      default:
        return type;
    }
  };
  
  return (
    <Card className="marketing-recommendations-card">
      <GradientBackground>
        <CardHeader
          title={
            <TextGradient variant="h6" gradient="blue-to-teal">
              Marketing Aanbevelingen
            </TextGradient>
          }
          action={
            <Button
              variant="contained"
              color="primary"
              onClick={generateRecommendations}
              disabled={loading || !insights || insights.length === 0}
              startIcon={<AddIcon />}
            >
              Genereer Aanbevelingen
            </Button>
          }
        />
      </GradientBackground>
      <Divider />
      
      {/* Filter chips */}
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip 
          label="Alle types" 
          onClick={() => setSelectedType('all')}
          color={selectedType === 'all' ? 'primary' : 'default'}
          variant={selectedType === 'all' ? 'filled' : 'outlined'}
          className="filter-chip"
        />
        <Chip 
          icon={<CampaignIcon />}
          label="Advertentietekst" 
          onClick={() => setSelectedType('ad_copy')}
          color={selectedType === 'ad_copy' ? 'primary' : 'default'}
          variant={selectedType === 'ad_copy' ? 'filled' : 'outlined'}
          className="filter-chip"
        />
        <Chip 
          icon={<MailIcon />}
          label="Email Marketing" 
          onClick={() => setSelectedType('email')}
          color={selectedType === 'email' ? 'primary' : 'default'}
          variant={selectedType === 'email' ? 'filled' : 'outlined'}
          className="filter-chip"
        />
        <Chip 
          icon={<ShoppingCartIcon />}
          label="Productpagina" 
          onClick={() => setSelectedType('product_page')}
          color={selectedType === 'product_page' ? 'primary' : 'default'}
          variant={selectedType === 'product_page' ? 'filled' : 'outlined'}
          className="filter-chip"
        />
        <Chip 
          icon={<VideocamIcon />}
          label="UGC Video Script" 
          onClick={() => setSelectedType('ugc_script')}
          color={selectedType === 'ugc_script' ? 'primary' : 'default'}
          variant={selectedType === 'ugc_script' ? 'filled' : 'outlined'}
          className="filter-chip"
        />
        <Chip 
          icon={<SearchIcon />}
          label="SEO Optimalisatie" 
          onClick={() => setSelectedType('seo')}
          color={selectedType === 'seo' ? 'primary' : 'default'}
          variant={selectedType === 'seo' ? 'filled' : 'outlined'}
          className="filter-chip"
        />
      </Box>
      
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : filteredRecommendations.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Geen aanbevelingen gevonden. Genereer nieuwe aanbevelingen op basis van de inzichten.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRecommendations.map((recommendation) => (
              <Grid item xs={12} key={recommendation.id}>
                <Card variant="outlined" className="recommendation-item">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ListItemIcon>
                          {renderTypeIcon(recommendation.type)}
                        </ListItemIcon>
                        <Typography variant="subtitle1" component="div">
                          {getTypeTitle(recommendation.type)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                        {editingId === recommendation.id ? (
                          <>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={saveEdit}
                              title="Opslaan"
                            >
                              <SaveIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setEditingId(null);
                                setEditText('');
                              }}
                              title="Annuleren"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton 
                              size="small"
                              onClick={() => copyToClipboard(recommendation.content, recommendation.id)}
                              title="Kopiëren naar klembord"
                            >
                              {copiedId === recommendation.id ? (
                                <CheckIcon fontSize="small" color="success" />
                              ) : (
                                <CopyIcon fontSize="small" />
                              )}
                            </IconButton>
                            <IconButton 
                              size="small"
                              onClick={() => startEditing(recommendation)}
                              title="Bewerken"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => deleteRecommendation(recommendation.id)}
                              title="Verwijderen"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Box>
                    
                    {editingId === recommendation.id ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1" component="div" className="recommendation-content">
                        {recommendation.content}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Gebaseerd op {recommendation.insight_count || 0} inzichten
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(recommendation.created_at), 'd MMMM yyyy', { locale: nl })}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

MarketingRecommendations.propTypes = {
  insights: PropTypes.array.isRequired,
  projectId: PropTypes.string.isRequired,
  onSave: PropTypes.func
};

export default MarketingRecommendations;
