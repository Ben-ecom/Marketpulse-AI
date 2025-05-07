import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Button, TextField, Grid, 
  Paper, CircularProgress, Alert, Divider, IconButton,
  Card, CardContent, CardHeader, Chip, List, ListItem,
  ListItemText, Tab, Tabs, Accordion, AccordionSummary,
  AccordionDetails, Rating
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CompareArrows as CompareArrowsIcon,
  Lightbulb as LightbulbIcon,
  Dashboard as DashboardIcon,
  TableChart as TableChartIcon,
  AttachMoney as AttachMoneyIcon,
  Mood as MoodIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config/constants';
import { useAuthStore } from '../store/authStore';
import { useSnackbar } from 'notistack';
import PageHeader from '../components/PageHeader';
import CompetitorDashboard from '../components/CompetitorDashboard';
import CompetitorComparisonTable from '../components/CompetitorComparisonTable';
import CompetitorSuggestions from '../components/CompetitorSuggestions';
import PriceComparisonChart from '../components/PriceComparisonChart';
import StrategicRecommendations from '../components/StrategicRecommendations';
import CompetitorScraper from '../components/competitor/CompetitorScraper';
import SentimentAnalysisChart from '../components/sentiment/SentimentAnalysisChart';

function CompetitorAnalysis() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useSnackbar();
  
  // State voor concurrenten
  const [competitors, setCompetitors] = useState([
    { name: '', url: '' }
  ]);
  
  // State voor analyse status
  const [analysisStatus, setAnalysisStatus] = useState({
    doelgroepDataAvailable: false,
    marktDataAvailable: false,
    competitorAnalysisAvailable: false,
    readyForAnalysis: false,
    lastAnalysisDate: null
  });
  
  // State voor analyse resultaten
  const [analysisResults, setAnalysisResults] = useState(null);
  
  // Beschikbare platforms voor sentiment analyse
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  
  // State voor laden en fouten
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // State voor het tonen van suggesties
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Haal status op bij laden
  useEffect(() => {
    checkAnalysisStatus();
  }, [projectId]);
  
  // Haal bestaande analyse op als die beschikbaar is
  useEffect(() => {
    if (analysisStatus.competitorAnalysisAvailable) {
      fetchExistingAnalysis();
    }
  }, [analysisStatus.competitorAnalysisAvailable]);
  
  // Controleer of er voldoende data is voor concurrentieanalyse
  const checkAnalysisStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/competitor/${projectId}/status`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setAnalysisStatus(response.data.data);
      
      if (!response.data.data.readyForAnalysis) {
        setError('Voer eerst doelgroep- en marktanalyse uit voordat je een concurrentieanalyse start.');
      }
    } catch (error) {
      console.error('Fout bij controleren analyse status:', error);
      setError('Fout bij controleren analyse status. Probeer het later opnieuw.');
    } finally {
      setLoading(false);
    }
  };
  
  // Haal bestaande analyse op
  const fetchExistingAnalysis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/competitor/${projectId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      if (response.data.data) {
        setAnalysisResults(response.data.data);
      }
    } catch (error) {
      console.error('Fout bij ophalen bestaande analyse:', error);
      enqueueSnackbar('Fout bij ophalen bestaande analyse', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Voeg een nieuwe concurrent toe
  const addCompetitor = (competitor = { name: '', url: '' }) => {
    // Controleer of de concurrent al bestaat
    const exists = competitors.some(
      c => c.name === competitor.name || c.url === competitor.url
    );
    
    if (exists && competitor.name !== '') {
      enqueueSnackbar(`Concurrent '${competitor.name}' is al toegevoegd`, { variant: 'info' });
      return;
    }
    
    setCompetitors([...competitors, competitor]);
    
    // Sluit suggesties als een specifieke concurrent is toegevoegd
    if (competitor.name !== '') {
      setShowSuggestions(false);
    }
  };
  
  // Verwijder een concurrent
  const removeCompetitor = (index) => {
    const updatedCompetitors = [...competitors];
    updatedCompetitors.splice(index, 1);
    setCompetitors(updatedCompetitors);
  };
  
  // Update een concurrent
  const updateCompetitor = (index, field, value) => {
    const updatedCompetitors = [...competitors];
    updatedCompetitors[index][field] = value;
    setCompetitors(updatedCompetitors);
  };
  
  // Valideer input
  const validateInput = () => {
    // Controleer of er minstens één concurrent is
    if (competitors.length === 0) {
      enqueueSnackbar('Voeg minstens één concurrent toe', { variant: 'error' });
      return false;
    }
    
    // Controleer of alle velden zijn ingevuld
    for (let i = 0; i < competitors.length; i++) {
      if (!competitors[i].name || !competitors[i].url) {
        enqueueSnackbar('Vul alle concurrentvelden in', { variant: 'error' });
        return false;
      }
      
      // Controleer of URL geldig is
      try {
        new URL(competitors[i].url);
      } catch (error) {
        enqueueSnackbar(`Ongeldige URL voor concurrent: ${competitors[i].name}`, { variant: 'error' });
        return false;
      }
    }
    
    return true;
  };
  
  // Start analyse
  const startAnalysis = async () => {
    if (!validateInput()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(
        `${API_URL}/competitor/${projectId}/analyze`,
        { competitors },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      setAnalysisResults(response.data.data);
      setAnalysisStatus(prev => ({
        ...prev,
        competitorAnalysisAvailable: true,
        lastAnalysisDate: new Date().toISOString()
      }));
      
      enqueueSnackbar('Concurrentieanalyse succesvol uitgevoerd', { variant: 'success' });
    } catch (error) {
      console.error('Fout bij uitvoeren analyse:', error);
      setError(error.response?.data?.message || 'Fout bij uitvoeren analyse. Probeer het later opnieuw.');
      enqueueSnackbar('Fout bij uitvoeren analyse', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Verander actieve tab
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Navigeer terug naar projectdetails
  const goBack = () => {
    navigate(`/projects/${projectId}`);
  };
  
  // Render inputformulier
  const renderInputForm = () => {
    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Geavanceerde Concurrent Analyse
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Analyseer concurrenten op basis van hun product pagina's en sociale media accounts. Voeg links toe naar TikTok, Instagram, Facebook en meer.
        </Typography>
        
        <CompetitorScraper 
          projectId={projectId} 
          onAnalysisComplete={(results) => {
            setAnalysisResults(results);
            enqueueSnackbar('Concurrentieanalyse succesvol gestart!', { variant: 'success' });
          }} 
        />
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={goBack}
          >
            Terug naar project
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            {!analysisStatus.readyForAnalysis && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Voer eerst doelgroep- en marktanalyse uit voor de beste resultaten.
              </Alert>
            )}
          </Typography>
        </Box>
      </Paper>
    );
  };
  
  // Render messaging analyse
  const renderMessagingAnalysis = () => {
    if (!analysisResults || !analysisResults.competitors) return null;
    
    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Messaging Analyse
        </Typography>
        
        <Grid container spacing={3}>
          {analysisResults.competitors.map((competitor, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardHeader
                  title={competitor.name}
                  subheader={<a href={competitor.url} target="_blank" rel="noopener noreferrer">{competitor.url}</a>}
                />
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Belangrijkste boodschappen:
                  </Typography>
                  <List dense>
                    {competitor.messaging?.keyMessages?.map((message, idx) => (
                      <ListItem key={idx}>
                        <ListItemText primary={message} />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Toon:
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {competitor.messaging?.toneOfVoice || 'Niet beschikbaar'}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Effectiviteit:
                  </Typography>
                  <Rating
                    value={competitor.messaging?.overallEffectiveness * 5 || 0}
                    precision={0.5}
                    readOnly
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  // Render SWOT analyse
  const renderSWOTAnalysis = () => {
    if (!analysisResults || !analysisResults.competitors) return null;
    
    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          SWOT Analyse
        </Typography>
        
        <Grid container spacing={3}>
          {analysisResults.competitors.map((competitor, index) => (
            <Grid item xs={12} key={index}>
              <Accordion defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{competitor.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Sterktes
                        </Typography>
                        <List dense>
                          {competitor.swot?.strengths?.map((strength, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={strength} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Zwaktes
                        </Typography>
                        <List dense>
                          {competitor.swot?.weaknesses?.map((weakness, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={weakness} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Kansen
                        </Typography>
                        <List dense>
                          {competitor.swot?.opportunities?.map((opportunity, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={opportunity} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: '#fff8e1' }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Bedreigingen
                        </Typography>
                        <List dense>
                          {competitor.swot?.threats?.map((threat, idx) => (
                            <ListItem key={idx}>
                              <ListItemText primary={threat} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  // Render gap analyse
  const renderGapAnalysis = () => {
    if (!analysisResults || !analysisResults.competitors) return null;
    
    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Gap Analyse
        </Typography>
        
        <Grid container spacing={3}>
          {analysisResults.competitors.map((competitor, index) => (
            <Grid item xs={12} key={index}>
              <Accordion defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    {competitor.name} - Gap Score: {(competitor.gaps?.overallGapScore * 100).toFixed(0)}%
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle1" gutterBottom>
                    Niet-aangepakte pijnpunten:
                  </Typography>
                  {competitor.gaps?.unaddressedPainPoints?.length > 0 ? (
                    <List dense>
                      {competitor.gaps.unaddressedPainPoints.map((painPoint, idx) => (
                        <ListItem key={idx}>
                          <ListItemText 
                            primary={painPoint.title} 
                            secondary={`Belang: ${(painPoint.importance * 100).toFixed(0)}%`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2">Geen niet-aangepakte pijnpunten gevonden.</Typography>
                  )}
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Niet-aangepakte verlangens:
                  </Typography>
                  {competitor.gaps?.unaddressedDesires?.length > 0 ? (
                    <List dense>
                      {competitor.gaps.unaddressedDesires.map((desire, idx) => (
                        <ListItem key={idx}>
                          <ListItemText 
                            primary={desire.title} 
                            secondary={`Belang: ${(desire.importance * 100).toFixed(0)}%`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2">Geen niet-aangepakte verlangens gevonden.</Typography>
                  )}
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Gemiste markttrends:
                  </Typography>
                  {competitor.gaps?.missedMarketTrends?.length > 0 ? (
                    <List dense>
                      {competitor.gaps.missedMarketTrends.map((trend, idx) => (
                        <ListItem key={idx}>
                          <ListItemText 
                            primary={trend.name} 
                            secondary={`Impact: ${trend.impact}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2">Geen gemiste markttrends gevonden.</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  // Render vergelijkende analyse
  const renderComparativeAnalysis = () => {
    if (!analysisResults || !analysisResults.comparativeAnalysis) return null;
    
    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Vergelijkende Analyse
        </Typography>
        
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Algemene scores:
          </Typography>
          <Grid container spacing={2}>
            {analysisResults.comparativeAnalysis.overallScores?.map((score, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6">{score.name}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Rating
                      value={score.overallScore * 5}
                      precision={0.5}
                      readOnly
                    />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Messaging: {(score.messagingScore * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2">
                    Gap dekking: {(score.gapScore * 100).toFixed(0)}%
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Gemeenschappelijke sterke punten:
          </Typography>
          {analysisResults.comparativeAnalysis.commonStrengths?.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={1}>
              {analysisResults.comparativeAnalysis.commonStrengths.map((strength, idx) => (
                <Chip key={idx} label={strength} color="primary" variant="outlined" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2">Geen gemeenschappelijke sterke punten gevonden.</Typography>
          )}
        </Box>
        
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Gemeenschappelijke zwakke punten:
          </Typography>
          {analysisResults.comparativeAnalysis.commonWeaknesses?.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={1}>
              {analysisResults.comparativeAnalysis.commonWeaknesses.map((weakness, idx) => (
                <Chip key={idx} label={weakness} color="error" variant="outlined" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2">Geen gemeenschappelijke zwakke punten gevonden.</Typography>
          )}
        </Box>
      </Box>
    );
  };
  
  // Render aanbevelingen
  const renderRecommendations = () => {
    if (!analysisResults || !analysisResults.recommendations) return null;
    
    const { recommendations } = analysisResults;
    
    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Aanbevelingen
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Productpositionering" 
                avatar={<CompareArrowsIcon color="primary" />}
              />
              <CardContent>
                <List dense>
                  {recommendations.productPositioning?.map((rec, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Marketingboodschap" 
                avatar={<LightbulbIcon color="primary" />}
              />
              <CardContent>
                <List dense>
                  {recommendations.marketingMessage?.map((rec, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Prijsstrategie" 
                avatar={<LightbulbIcon color="primary" />}
              />
              <CardContent>
                <List dense>
                  {recommendations.pricingStrategy?.map((rec, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="Content aanbevelingen" 
                avatar={<LightbulbIcon color="primary" />}
              />
              <CardContent>
                <List dense>
                  {recommendations.contentRecommendations?.map((rec, idx) => (
                    <ListItem key={idx}>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Prioriteitsgebieden:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {recommendations.priorityAreas?.map((area, idx) => (
              <Chip 
                key={idx} 
                label={`${area.title} (${area.priority})`} 
                color={area.priority === 'Hoog' ? 'error' : 'primary'} 
                variant="outlined" 
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  };
  
  // Render sentiment analyse
  const renderSentimentAnalysis = () => {
    if (!analysisResults || !analysisResults.sentimentData) return null;
    
    return (
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Sentiment Analyse
        </Typography>
        
        <SentimentAnalysisChart
          data={analysisResults.sentimentData}
          title="Competitor Sentiment Analyse"
          platforms={availablePlatforms}
        />
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <PageHeader 
        title="Concurrentieanalyse" 
        description="Analyseer concurrenten op basis van doelgroep- en marktinzichten"
        onBack={goBack}
      />
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {!analysisResults ? (
        renderInputForm()
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="competitor analysis tabs"
            >
              <Tab icon={<DashboardIcon />} label="Dashboard" />
              <Tab label="Messaging" />
              <Tab label="SWOT Analyse" />
              <Tab label="Gap Analyse" />
              <Tab icon={<AttachMoneyIcon />} label="Prijzen" />
              <Tab icon={<TableChartIcon />} label="Vergelijking" />
              <Tab label="Aanbevelingen" />
              <Tab icon={<MoodIcon />} label="Sentiment" />
            </Tabs>
          </Box>
          
          <Box mt={3}>
            {activeTab === 0 && (
              <CompetitorDashboard 
                competitors={analysisResults.competitors} 
                comparativeAnalysis={analysisResults.comparativeAnalysis} 
              />
            )}
            {activeTab === 1 && renderMessagingAnalysis()}
            {activeTab === 2 && renderSWOTAnalysis()}
            {activeTab === 3 && renderGapAnalysis()}
            {activeTab === 4 && (
              <PriceComparisonChart 
                competitors={analysisResults.competitors} 
                projectName={projectName}
              />
            )}
            {activeTab === 5 && (
              <CompetitorComparisonTable 
                competitors={analysisResults.competitors} 
                comparativeAnalysis={analysisResults.comparativeAnalysis} 
              />
            )}
            {activeTab === 6 && (
              <StrategicRecommendations
                projectId={projectId}
                competitors={analysisResults.competitors}
                comparativeAnalysis={analysisResults.comparativeAnalysis}
              />
            )}
            {activeTab === 7 && (
              <SentimentAnalysisChart
                data={analysisResults.sentimentData || []}
                title="Competitor Sentiment Analyse"
                platforms={availablePlatforms}
              />
            )}
          </Box>
          
          <Box mt={4} display="flex" justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={() => {
                setAnalysisResults(null);
                setCompetitors([{ name: '', url: '' }]);
              }}
            >
              Nieuwe analyse
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={goBack}
            >
              Terug naar project
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}

export default CompetitorAnalysis;
