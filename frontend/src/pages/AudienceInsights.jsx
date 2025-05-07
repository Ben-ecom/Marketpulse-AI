import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Button, Grid, 
  Paper, CircularProgress, Alert, Divider, 
  Card, CardContent, CardHeader, Chip, Tabs, Tab,
  List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Language as LanguageIcon,
  TrendingUp as TrendingUpIcon,
  Reddit as RedditIcon,
  Instagram as InstagramIcon,
  ShoppingCart as ShoppingCartIcon,
  Videocam as VideocamIcon,
  Mood as MoodIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useAuthStore } from '../store/authStore';
import { useSnackbar } from 'notistack';
import PageHeader from '../components/PageHeader';
import SentimentAnalysisChart from '../components/sentiment/SentimentAnalysisChart';

// Placeholder voor componenten die we later zullen maken
const PainPointsChart = () => <Box p={3}><Typography>Pijnpunten Grafiek (Placeholder)</Typography></Box>;
const DesiresChart = () => <Box p={3}><Typography>Verlangens Grafiek (Placeholder)</Typography></Box>;
const TerminologyCloud = () => <Box p={3}><Typography>Terminologie Wolk (Placeholder)</Typography></Box>;
const PlatformInsights = () => <Box p={3}><Typography>Platform Inzichten (Placeholder)</Typography></Box>;

function AudienceInsights() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  
  // State voor inzichten
  const [insights, setInsights] = useState(null);
  
  // State voor actieve platform en categorie
  const [activePlatform, setActivePlatform] = useState('all');
  const [activeCategory, setActiveCategory] = useState('painPoints');
  
  // Beschikbare platforms voor sentiment analyse
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  
  // State voor laden en fouten
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Haal inzichten op bij laden
  useEffect(() => {
    fetchAudienceInsights();
  }, [projectId]);
  
  // Haal audience insights op
  const fetchAudienceInsights = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/audience-insights/${projectId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setInsights(response.data);
      
      // Extraheer beschikbare platforms uit de data
      if (response.data && response.data.data) {
        const platforms = [...new Set(response.data.data.map(item => item.platform))];
        setAvailablePlatforms(platforms.filter(Boolean));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Fout bij ophalen audience insights:', error);
      setError('Fout bij ophalen audience insights. Probeer het later opnieuw.');
      enqueueSnackbar('Fout bij ophalen audience insights', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Navigeer terug naar projectdetails
  const goBack = () => {
    navigate(`/projects/${projectId}`);
  };
  
  // Handle platform tab change
  const handlePlatformChange = (event, newValue) => {
    setActivePlatform(newValue);
  };
  
  // Handle category tab change
  const handleCategoryChange = (event, newValue) => {
    setActiveCategory(newValue);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg">
        <PageHeader 
          title="Doelgroep Inzichten" 
          description="Analyseer pijnpunten, verlangens en terminologie van je doelgroep"
          onBack={goBack}
        />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container maxWidth="lg">
        <PageHeader 
          title="Doelgroep Inzichten" 
          description="Analyseer pijnpunten, verlangens en terminologie van je doelgroep"
          onBack={goBack}
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Box mt={2} display="flex" justifyContent="center">
          <Button variant="contained" onClick={fetchAudienceInsights}>
            Probeer opnieuw
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Render no data state
  if (!insights) {
    return (
      <Container maxWidth="lg">
        <PageHeader 
          title="Doelgroep Inzichten" 
          description="Analyseer pijnpunten, verlangens en terminologie van je doelgroep"
          onBack={goBack}
        />
        <Alert severity="info" sx={{ mt: 2 }}>
          Er zijn nog geen doelgroep inzichten beschikbaar. Start een nieuwe analyse om inzichten te verzamelen.
        </Alert>
        <Box mt={2} display="flex" justifyContent="center">
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate(`/projects/${projectId}/audience-analysis`)}
          >
            Start Doelgroep Analyse
          </Button>
        </Box>
      </Container>
    );
  }
  
  const renderContent = () => {
    switch (activeCategory) {
      case 'painPoints':
        return <PainPointsChart data={insights?.painPoints} />;
      case 'desires':
        return <DesiresChart data={insights?.desires} />;
      case 'terminology':
        return <TerminologyCloud data={insights?.terminology} />;
      case 'platforms':
        return <PlatformInsights data={insights?.platformData} />;
      case 'sentiment':
        return <SentimentAnalysisChart 
                 data={insights?.data || []} 
                 title="Sentiment Analyse"
                 platforms={availablePlatforms}
               />;
      default:
        return <PainPointsChart data={insights?.painPoints} />;
    }
  };
  
  return (
    <Container maxWidth="lg">
      <PageHeader 
        title="Doelgroep Inzichten" 
        description="Analyseer pijnpunten, verlangens en terminologie van je doelgroep"
        onBack={goBack}
      />
      
      {/* Overzicht kaarten */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PsychologyIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {insights.summary?.totalPainPoints || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Pijnpunten
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <FavoriteIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {insights.summary?.totalDesires || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Verlangens
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CommentIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {insights.summary?.totalTerms || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Unieke Termen
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LanguageIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h5" component="div">
                    {insights.summary?.platformCount || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Platforms
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Platform tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
        <Tabs 
          value={activePlatform} 
          onChange={handlePlatformChange} 
          aria-label="platform tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<TrendingUpIcon />} label="Alle Platforms" value="all" />
          <Tab icon={<RedditIcon />} label="Reddit" value="reddit" />
          <Tab icon={<ShoppingCartIcon />} label="Amazon" value="amazon" />
          <Tab icon={<InstagramIcon />} label="Instagram" value="instagram" />
          <Tab icon={<VideocamIcon />} label="TikTok" value="tiktok" />
        </Tabs>
      </Box>
      
      {/* Categorie tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
        <Tabs 
          value={activeCategory} 
          onChange={handleCategoryChange} 
          aria-label="categorie tabs"
        >
          <Tab 
            label="Pijnpunten" 
            value="painPoints" 
            icon={<PsychologyIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Verlangens" 
            value="desires" 
            icon={<FavoriteIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Terminologie" 
            value="terminology" 
            icon={<CommentIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Platforms" 
            value="platforms" 
            icon={<LanguageIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Sentiment" 
            value="sentiment" 
            icon={<MoodIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      {/* Content op basis van geselecteerde tabs */}
      <Box mt={3}>
        {renderContent()}
      </Box>
      
      {/* Samenvatting sectie */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Belangrijkste Inzichten
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Top Pijnpunt Categorieën" 
                avatar={<PsychologyIcon color="error" />}
              />
              <CardContent>
                <List dense>
                  {insights.summary?.topPainPointCategories?.map((category, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        <Chip 
                          label={`${idx + 1}`} 
                          color="error" 
                          size="small" 
                          variant="outlined" 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={category.name} 
                        secondary={`${category.count} items`} 
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Top Verlangen Categorieën" 
                avatar={<FavoriteIcon color="primary" />}
              />
              <CardContent>
                <List dense>
                  {insights.summary?.topDesireCategories?.map((category, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        <Chip 
                          label={`${idx + 1}`} 
                          color="primary" 
                          size="small" 
                          variant="outlined" 
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={category.name} 
                        secondary={`${category.count} items`} 
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={fetchAudienceInsights}
        >
          Vernieuwen
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/projects/${projectId}/audience-analysis`)}
        >
          Nieuwe Analyse
        </Button>
      </Box>
    </Container>
  );
}

export default AudienceInsights;
