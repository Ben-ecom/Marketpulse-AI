import React from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, Divider, useTheme } from '@mui/material';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import ContextualTooltip from '../help/ContextualTooltip';
import { HelpOutline } from '@mui/icons-material';

// Registreer Chart.js componenten
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

/**
 * FeedbackOverview Component
 * 
 * Toont een overzicht van feedback statistieken met verschillende visualisaties.
 */
const FeedbackOverview = ({ data }) => {
  const theme = useTheme();
  
  // Als er geen data is, toon een bericht
  if (!data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">Geen feedback data beschikbaar.</Typography>
      </Box>
    );
  }
  
  // Bereid data voor voor de donutdiagram (help feedback sentiment)
  const helpFeedbackData = {
    labels: ['Positief', 'Negatief'],
    datasets: [
      {
        data: [data.helpFeedback.positive, data.helpFeedback.negative],
        backgroundColor: [
          theme.palette.success.main,
          theme.palette.error.main
        ],
        borderColor: [
          theme.palette.success.dark,
          theme.palette.error.dark
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Donutdiagram opties
  const helpFeedbackOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = data.helpFeedback.total;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };
  
  // Bereid data voor voor de staafdiagram (feedback per gebruikersrol)
  const userRoleLabels = Object.keys(data.byUserRole || {});
  const userRoleData = {
    labels: userRoleLabels.map(role => {
      // Converteer snake_case naar Title Case
      return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }),
    datasets: [
      {
        label: 'Positief',
        data: userRoleLabels.map(role => data.byUserRole[role].positive),
        backgroundColor: theme.palette.success.main,
      },
      {
        label: 'Negatief',
        data: userRoleLabels.map(role => data.byUserRole[role].negative),
        backgroundColor: theme.palette.error.main,
      }
    ],
  };
  
  // Staafdiagram opties
  const userRoleOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: 'Feedback per gebruikersrol',
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
        beginAtZero: true,
      },
    },
  };
  
  // Bereid data voor voor de radardiagram (aspecten van feedback)
  const aspectLabels = Object.keys(data.aspectFrequency || {}).slice(0, 8); // Beperk tot 8 aspecten
  const aspectData = {
    labels: aspectLabels.map(aspect => {
      // Converteer snake_case naar Title Case
      return aspect.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }),
    datasets: [
      {
        label: 'Frequentie',
        data: aspectLabels.map(aspect => data.aspectFrequency[aspect]),
        backgroundColor: `${theme.palette.primary.main}50`,
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: theme.palette.primary.main,
      }
    ],
  };
  
  // Radardiagram opties
  const aspectOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: 'Aspecten van feedback',
      },
    },
  };
  
  // Bereid data voor voor de staafdiagram (feedback per ervaringsniveau)
  const experienceLevelLabels = Object.keys(data.byExperienceLevel || {});
  const experienceLevelData = {
    labels: experienceLevelLabels.map(level => {
      // Converteer naar Title Case
      return level.charAt(0).toUpperCase() + level.slice(1);
    }),
    datasets: [
      {
        label: 'Positief',
        data: experienceLevelLabels.map(level => data.byExperienceLevel[level].positive),
        backgroundColor: theme.palette.success.main,
      },
      {
        label: 'Negatief',
        data: experienceLevelLabels.map(level => data.byExperienceLevel[level].negative),
        backgroundColor: theme.palette.error.main,
      }
    ],
  };
  
  // Staafdiagram opties
  const experienceLevelOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: 'Feedback per ervaringsniveau',
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
        beginAtZero: true,
      },
    },
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
                  Totale Feedback
                </Typography>
                <ContextualTooltip
                  content="Het totale aantal feedback items verzameld via de help-functionaliteit."
                  placement="top"
                >
                  <HelpOutline fontSize="small" color="action" />
                </ContextualTooltip>
              </Box>
              <Typography variant="h4" component="div">
                {data.helpFeedback.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {data.helpFeedback.positive} positief, {data.helpFeedback.negative} negatief
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Positieve Feedback
                </Typography>
                <ContextualTooltip
                  content="Het percentage van de feedback dat positief is."
                  placement="top"
                >
                  <HelpOutline fontSize="small" color="action" />
                </ContextualTooltip>
              </Box>
              <Typography variant="h4" component="div" color="success.main">
                {Math.round(data.helpFeedback.positivePercentage)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {data.helpFeedback.positive} van {data.helpFeedback.total} items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Gebruikerservaring
                </Typography>
                <ContextualTooltip
                  content="De gemiddelde waardering van de gebruikerservaring op een schaal van 1-5."
                  placement="top"
                >
                  <HelpOutline fontSize="small" color="action" />
                </ContextualTooltip>
              </Box>
              <Typography variant="h4" component="div" color="primary.main">
                {data.userExperience.averageRating.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Uit {data.userExperience.total} beoordelingen
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  Meest Besproken Aspect
                </Typography>
                <ContextualTooltip
                  content="Het aspect van de help-functionaliteit dat het meest genoemd wordt in feedback."
                  placement="top"
                >
                  <HelpOutline fontSize="small" color="action" />
                </ContextualTooltip>
              </Box>
              {Object.keys(data.aspectFrequency || {}).length > 0 ? (
                <>
                  <Typography variant="h4" component="div">
                    {Object.keys(data.aspectFrequency).reduce((a, b) => 
                      data.aspectFrequency[a] > data.aspectFrequency[b] ? a : b
                    ).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Genoemd in {Object.keys(data.aspectFrequency).reduce((a, b) => 
                      data.aspectFrequency[a] > data.aspectFrequency[b] ? a : b, 
                      Object.keys(data.aspectFrequency)[0]
                    ) ? data.aspectFrequency[Object.keys(data.aspectFrequency).reduce((a, b) => 
                      data.aspectFrequency[a] > data.aspectFrequency[b] ? a : b
                    )] : 0} feedback items
                  </Typography>
                </>
              ) : (
                <Typography variant="body1">Geen aspecten gevonden</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Grafieken */}
      <Grid container spacing={3}>
        {/* Help Feedback Sentiment */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6">
                Help Feedback Sentiment
              </Typography>
              <ContextualTooltip
                content="Verdeling van positieve en negatieve feedback over de help-functionaliteit."
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            <Box sx={{ height: 300, position: 'relative' }}>
              <Doughnut data={helpFeedbackData} options={helpFeedbackOptions} />
              {/* Centreer tekst in donut */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h4" component="div">
                  {Math.round(data.helpFeedback.positivePercentage)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Positief
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Feedback per gebruikersrol */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6">
                Feedback per Gebruikersrol
              </Typography>
              <ContextualTooltip
                content="Verdeling van positieve en negatieve feedback per gebruikersrol."
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            <Box sx={{ height: 300 }}>
              <Bar data={userRoleData} options={userRoleOptions} />
            </Box>
          </Paper>
        </Grid>
        
        {/* Aspecten van feedback */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6">
                Aspecten van Feedback
              </Typography>
              <ContextualTooltip
                content="Frequentie van verschillende aspecten genoemd in gebruikersfeedback."
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            <Box sx={{ height: 300 }}>
              {Object.keys(data.aspectFrequency || {}).length > 0 ? (
                <Radar data={aspectData} options={aspectOptions} />
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="body1" color="textSecondary">
                    Geen aspectdata beschikbaar
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Feedback per ervaringsniveau */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6">
                Feedback per Ervaringsniveau
              </Typography>
              <ContextualTooltip
                content="Verdeling van positieve en negatieve feedback per ervaringsniveau van gebruikers."
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            <Box sx={{ height: 300 }}>
              <Bar data={experienceLevelData} options={experienceLevelOptions} />
            </Box>
          </Paper>
        </Grid>
        
        {/* Help Item Type Statistieken */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6">
                Feedback per Help Item Type
              </Typography>
              <ContextualTooltip
                content="Verdeling van feedback per type help item (tooltips, overlays, wizards, etc.)."
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            <Box sx={{ overflowY: 'auto', maxHeight: 300 }}>
              {Object.keys(data.byType || {}).length > 0 ? (
                <Box>
                  {Object.keys(data.byType).map((type, index) => {
                    const typeData = data.byType[type];
                    const positivePercentage = typeData.total > 0 
                      ? Math.round((typeData.positive / typeData.total) * 100) 
                      : 0;
                    
                    return (
                      <Box key={type} sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="body1">
                            {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </Typography>
                          <Typography variant="body2" color={positivePercentage >= 50 ? 'success.main' : 'error.main'}>
                            {positivePercentage}% Positief
                          </Typography>
                        </Box>
                        <Box display="flex" sx={{ height: 8, borderRadius: 4, overflow: 'hidden' }}>
                          <Box 
                            sx={{ 
                              width: `${positivePercentage}%`, 
                              bgcolor: 'success.main',
                              transition: 'width 0.5s ease'
                            }} 
                          />
                          <Box 
                            sx={{ 
                              width: `${100 - positivePercentage}%`, 
                              bgcolor: 'error.main',
                              transition: 'width 0.5s ease'
                            }} 
                          />
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          Totaal: {typeData.total} ({typeData.positive} positief, {typeData.negative} negatief)
                        </Typography>
                        {index < Object.keys(data.byType).length - 1 && <Divider sx={{ my: 1.5 }} />}
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="body1" color="textSecondary">
                    Geen type data beschikbaar
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeedbackOverview;