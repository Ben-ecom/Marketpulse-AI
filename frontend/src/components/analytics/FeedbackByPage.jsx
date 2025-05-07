import React from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, LinearProgress, useTheme } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ContextualTooltip from '../help/ContextualTooltip';
import { HelpOutline } from '@mui/icons-material';

// Registreer Chart.js componenten
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * FeedbackByPage Component
 * 
 * Visualiseert feedback per pagina met verschillende grafieken en statistieken.
 */
const FeedbackByPage = ({ data }) => {
  const theme = useTheme();
  
  // Als er geen data is, toon een bericht
  if (!data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">Geen feedback per pagina data beschikbaar.</Typography>
      </Box>
    );
  }
  
  // Verwerk help feedback per pagina
  const helpFeedbackByPage = data.helpFeedback || {};
  
  // Verwerk user experience feedback per pagina
  const userExperienceByPage = data.userExperience || {};
  
  // Bereid data voor voor de staafdiagram (help feedback per pagina)
  const pageLabels = Object.keys(helpFeedbackByPage);
  const helpFeedbackData = {
    labels: pageLabels.map(page => {
      // Converteer naar Title Case
      return page.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }),
    datasets: [
      {
        label: 'Positief',
        data: pageLabels.map(page => helpFeedbackByPage[page].positive),
        backgroundColor: theme.palette.success.main,
      },
      {
        label: 'Negatief',
        data: pageLabels.map(page => helpFeedbackByPage[page].negative),
        backgroundColor: theme.palette.error.main,
      }
    ],
  };
  
  // Staafdiagram opties
  const helpFeedbackOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: 'Help Feedback per Pagina',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };
  
  // Bereid data voor voor de taartdiagram (user experience ratings per pagina)
  const userExperiencePageLabels = Object.keys(userExperienceByPage);
  const userExperienceData = {
    labels: userExperiencePageLabels.map(page => {
      // Converteer naar Title Case
      return page.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }),
    datasets: [
      {
        data: userExperiencePageLabels.map(page => userExperienceByPage[page].total),
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.info.main,
          theme.palette.warning.main,
          theme.palette.success.main,
          theme.palette.error.main,
        ],
        borderColor: [
          theme.palette.primary.dark,
          theme.palette.secondary.dark,
          theme.palette.info.dark,
          theme.palette.warning.dark,
          theme.palette.success.dark,
          theme.palette.error.dark,
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Taartdiagram opties
  const userExperienceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };
  
  // Bereken de pagina met de hoogste positieve feedback percentage
  const bestPage = Object.keys(helpFeedbackByPage).reduce((best, page) => {
    const current = helpFeedbackByPage[page];
    const currentPercentage = current.total > 0 ? (current.positive / current.total) * 100 : 0;
    
    if (!best || currentPercentage > best.percentage) {
      return { page, percentage: currentPercentage };
    }
    return best;
  }, null);
  
  // Bereken de pagina met de laagste positieve feedback percentage
  const worstPage = Object.keys(helpFeedbackByPage).reduce((worst, page) => {
    const current = helpFeedbackByPage[page];
    const currentPercentage = current.total > 0 ? (current.positive / current.total) * 100 : 0;
    
    if (!worst || currentPercentage < worst.percentage) {
      return { page, percentage: currentPercentage };
    }
    return worst;
  }, null);
  
  // Bereken de pagina met de hoogste gemiddelde rating
  const bestRatedPage = Object.keys(userExperienceByPage).reduce((best, page) => {
    const current = userExperienceByPage[page];
    
    if (!best || current.average > best.rating) {
      return { page, rating: current.average };
    }
    return best;
  }, null);
  
  // Bereken de pagina met de laagste gemiddelde rating
  const worstRatedPage = Object.keys(userExperienceByPage).reduce((worst, page) => {
    const current = userExperienceByPage[page];
    
    if (!worst || current.average < worst.rating) {
      return { page, rating: current.average };
    }
    return worst;
  }, null);
  
  // Bereken de meest genoemde aspecten per pagina
  const getTopAspects = (page, limit = 3) => {
    const pageData = userExperienceByPage[page];
    if (!pageData || !pageData.aspects) return [];
    
    return Object.entries(pageData.aspects)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([aspect, count]) => ({
        aspect: aspect.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        count
      }));
  };
  
  return (
    <Box>
      {/* Samenvatting statistieken */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Beste Pagina
                </Typography>
                <ContextualTooltip
                  content="De pagina met het hoogste percentage positieve feedback."
                  placement="top"
                >
                  <HelpOutline fontSize="small" color="action" />
                </ContextualTooltip>
              </Box>
              {bestPage ? (
                <>
                  <Typography variant="h5" component="div" sx={{ textTransform: 'capitalize' }}>
                    {bestPage.page.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {bestPage.percentage.toFixed(1)}% positief
                  </Typography>
                </>
              ) : (
                <Typography variant="body1">Geen data beschikbaar</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Aandachtspunt
                </Typography>
                <ContextualTooltip
                  content="De pagina met het laagste percentage positieve feedback."
                  placement="top"
                >
                  <HelpOutline fontSize="small" color="action" />
                </ContextualTooltip>
              </Box>
              {worstPage ? (
                <>
                  <Typography variant="h5" component="div" sx={{ textTransform: 'capitalize' }}>
                    {worstPage.page.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    {worstPage.percentage.toFixed(1)}% positief
                  </Typography>
                </>
              ) : (
                <Typography variant="body1">Geen data beschikbaar</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Hoogste Rating
                </Typography>
                <ContextualTooltip
                  content="De pagina met de hoogste gemiddelde gebruikerservaring rating."
                  placement="top"
                >
                  <HelpOutline fontSize="small" color="action" />
                </ContextualTooltip>
              </Box>
              {bestRatedPage ? (
                <>
                  <Typography variant="h5" component="div" sx={{ textTransform: 'capitalize' }}>
                    {bestRatedPage.page.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Typography>
                  <Typography variant="body2" color="info.main">
                    {bestRatedPage.rating.toFixed(1)} / 5
                  </Typography>
                </>
              ) : (
                <Typography variant="body1">Geen data beschikbaar</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Laagste Rating
                </Typography>
                <ContextualTooltip
                  content="De pagina met de laagste gemiddelde gebruikerservaring rating."
                  placement="top"
                >
                  <HelpOutline fontSize="small" color="action" />
                </ContextualTooltip>
              </Box>
              {worstRatedPage ? (
                <>
                  <Typography variant="h5" component="div" sx={{ textTransform: 'capitalize' }}>
                    {worstRatedPage.page.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    {worstRatedPage.rating.toFixed(1)} / 5
                  </Typography>
                </>
              ) : (
                <Typography variant="body1">Geen data beschikbaar</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Grafieken */}
      <Grid container spacing={3}>
        {/* Help Feedback per Pagina */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6">
                Help Feedback per Pagina
              </Typography>
              <ContextualTooltip
                content="Verdeling van positieve en negatieve help feedback per pagina."
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            <Box sx={{ height: 400 }}>
              {Object.keys(helpFeedbackByPage).length > 0 ? (
                <Bar data={helpFeedbackData} options={helpFeedbackOptions} />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="body1" color="textSecondary">
                    Geen help feedback per pagina data beschikbaar
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* User Experience Feedback Verdeling */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6">
                Gebruikerservaring Feedback Verdeling
              </Typography>
              <ContextualTooltip
                content="Verdeling van gebruikerservaring feedback over verschillende pagina's."
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            <Box sx={{ height: 400 }}>
              {Object.keys(userExperienceByPage).length > 0 ? (
                <Pie data={userExperienceData} options={userExperienceOptions} />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="body1" color="textSecondary">
                    Geen gebruikerservaring feedback data beschikbaar
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Gedetailleerde Pagina Statistieken */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6">
                Gedetailleerde Pagina Statistieken
              </Typography>
              <ContextualTooltip
                content="Gedetailleerde statistieken per pagina, inclusief feedback sentiment, ratings en meest genoemde aspecten."
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            
            <Box sx={{ overflowX: 'auto' }}>
              <Grid container spacing={3}>
                {Object.keys(helpFeedbackByPage).map(page => {
                  const helpData = helpFeedbackByPage[page];
                  const userExpData = userExperienceByPage[page] || { total: 0, average: 0 };
                  const positivePercentage = helpData.total > 0 ? (helpData.positive / helpData.total) * 100 : 0;
                  const topAspects = getTopAspects(page);
                  
                  return (
                    <Grid item xs={12} md={6} lg={4} key={page}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 2 }}>
                            {page.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="body2">Help Feedback Sentiment:</Typography>
                              <Typography 
                                variant="body2" 
                                color={positivePercentage >= 70 ? 'success.main' : positivePercentage >= 50 ? 'info.main' : 'error.main'}
                              >
                                {positivePercentage.toFixed(1)}% Positief
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={positivePercentage} 
                              color={positivePercentage >= 70 ? 'success' : positivePercentage >= 50 ? 'info' : 'error'}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              Totaal: {helpData.total} ({helpData.positive} positief, {helpData.negative} negatief)
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="body2">Gebruikerservaring Rating:</Typography>
                              <Typography 
                                variant="body2" 
                                color={userExpData.average >= 4 ? 'success.main' : userExpData.average >= 3 ? 'info.main' : 'error.main'}
                              >
                                {userExpData.average.toFixed(1)} / 5
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={(userExpData.average / 5) * 100} 
                              color={userExpData.average >= 4 ? 'success' : userExpData.average >= 3 ? 'info' : 'error'}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              Gebaseerd op {userExpData.total} beoordelingen
                            </Typography>
                          </Box>
                          
                          {topAspects.length > 0 && (
                            <Box>
                              <Typography variant="body2" gutterBottom>
                                Meest genoemde aspecten:
                              </Typography>
                              {topAspects.map((item, index) => (
                                <Box key={index} display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                  <Typography variant="caption">{item.aspect}:</Typography>
                                  <Typography variant="caption">{item.count} keer genoemd</Typography>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeedbackByPage;