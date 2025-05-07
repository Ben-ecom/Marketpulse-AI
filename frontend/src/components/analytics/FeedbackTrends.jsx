import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, ToggleButton, ToggleButtonGroup, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import ContextualTooltip from '../help/ContextualTooltip';
import { HelpOutline } from '@mui/icons-material';

// Registreer Chart.js componenten
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * FeedbackTrends Component
 * 
 * Visualiseert trends in feedback over tijd met lijngrafieken.
 */
const FeedbackTrends = ({ data }) => {
  const theme = useTheme();
  const [trendsView, setTrendsView] = useState('sentiment'); // 'sentiment' of 'rating'
  
  // Als er geen data is, toon een bericht
  if (!data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">Geen feedback trends data beschikbaar.</Typography>
      </Box>
    );
  }
  
  // Verwerk help feedback trend data
  const helpFeedbackTrend = data.helpFeedback || [];
  
  // Bereid data voor voor de lijndiagram (help feedback sentiment trend)
  const sentimentTrendData = {
    labels: helpFeedbackTrend.map(item => {
      // Format date as DD/MM
      const date = new Date(item.date);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'Positief %',
        data: helpFeedbackTrend.map(item => item.positivePercentage),
        borderColor: theme.palette.success.main,
        backgroundColor: `${theme.palette.success.main}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y',
      },
      {
        label: 'Totaal Feedback',
        data: helpFeedbackTrend.map(item => item.total),
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}00`,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        yAxisID: 'y1',
      }
    ],
  };
  
  // Lijndiagram opties voor sentiment trend
  const sentimentTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += `${context.parsed.y.toFixed(1)}%`;
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Positief %',
        },
        min: 0,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Totaal Feedback',
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };
  
  // Verwerk user experience trend data
  const userExperienceTrend = data.userExperience || [];
  
  // Bereid data voor voor de lijndiagram (user experience rating trend)
  const ratingTrendData = {
    labels: userExperienceTrend.map(item => {
      // Format date as DD/MM
      const date = new Date(item.date);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'Gemiddelde Rating',
        data: userExperienceTrend.map(item => item.averageRating),
        borderColor: theme.palette.info.main,
        backgroundColor: `${theme.palette.info.main}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        yAxisID: 'y',
      },
      {
        label: 'Totaal Beoordelingen',
        data: userExperienceTrend.map(item => item.total),
        borderColor: theme.palette.secondary.main,
        backgroundColor: `${theme.palette.secondary.main}00`,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        yAxisID: 'y1',
      }
    ],
  };
  
  // Lijndiagram opties voor rating trend
  const ratingTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 0) {
                label += context.parsed.y.toFixed(1);
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Gemiddelde Rating',
        },
        min: 0,
        max: 5,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Totaal Beoordelingen',
        },
        min: 0,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };
  
  // Verander de weergave tussen sentiment en rating
  const handleTrendsViewChange = (event, newView) => {
    if (newView !== null) {
      setTrendsView(newView);
    }
  };
  
  // Bereken de gemiddelde positieve feedback percentage over de periode
  const averagePositivePercentage = helpFeedbackTrend.length > 0
    ? helpFeedbackTrend.reduce((sum, item) => sum + item.positivePercentage, 0) / helpFeedbackTrend.length
    : 0;
  
  // Bereken de gemiddelde rating over de periode
  const averageRating = userExperienceTrend.length > 0
    ? userExperienceTrend.reduce((sum, item) => sum + item.averageRating, 0) / userExperienceTrend.length
    : 0;
  
  // Bereken de trend (stijgend, dalend of stabiel)
  const calculateTrend = (data, valueKey) => {
    if (data.length < 2) return 'stabiel';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item[valueKey], 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item[valueKey], 0) / secondHalf.length;
    
    const difference = secondHalfAvg - firstHalfAvg;
    
    if (difference > 1) return 'sterk stijgend';
    if (difference > 0.2) return 'stijgend';
    if (difference < -1) return 'sterk dalend';
    if (difference < -0.2) return 'dalend';
    return 'stabiel';
  };
  
  const sentimentTrend = calculateTrend(helpFeedbackTrend, 'positivePercentage');
  const ratingTrend = calculateTrend(userExperienceTrend, 'averageRating');
  
  // Bepaal kleur op basis van trend
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'sterk stijgend':
      case 'stijgend':
        return theme.palette.success.main;
      case 'sterk dalend':
      case 'dalend':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };
  
  return (
    <Box>
      {/* Toggle voor weergave */}
      <Box display="flex" justifyContent="center" mb={3}>
        <ToggleButtonGroup
          value={trendsView}
          exclusive
          onChange={handleTrendsViewChange}
          aria-label="trends view"
          size="small"
        >
          <ToggleButton value="sentiment" aria-label="sentiment trend">
            Help Feedback Sentiment
          </ToggleButton>
          <ToggleButton value="rating" aria-label="rating trend">
            Gebruikerservaring Rating
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* Trend statistieken */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {trendsView === 'sentiment' ? (
          <>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Gemiddeld Positief
                  </Typography>
                  <ContextualTooltip
                    content="Het gemiddelde percentage positieve feedback over de geselecteerde periode."
                    placement="top"
                  >
                    <HelpOutline fontSize="small" color="action" />
                  </ContextualTooltip>
                </Box>
                <Typography variant="h4" component="div" color="success.main">
                  {averagePositivePercentage.toFixed(1)}%
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Trend
                  </Typography>
                  <ContextualTooltip
                    content="De trend in positieve feedback over de geselecteerde periode."
                    placement="top"
                  >
                    <HelpOutline fontSize="small" color="action" />
                  </ContextualTooltip>
                </Box>
                <Typography variant="h4" component="div" sx={{ textTransform: 'capitalize' }} color={getTrendColor(sentimentTrend)}>
                  {sentimentTrend}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Totaal Feedback
                  </Typography>
                  <ContextualTooltip
                    content="Het totale aantal feedback items over de geselecteerde periode."
                    placement="top"
                  >
                    <HelpOutline fontSize="small" color="action" />
                  </ContextualTooltip>
                </Box>
                <Typography variant="h4" component="div">
                  {helpFeedbackTrend.reduce((sum, item) => sum + item.total, 0)}
                </Typography>
              </Paper>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Gemiddelde Rating
                  </Typography>
                  <ContextualTooltip
                    content="De gemiddelde gebruikerservaring rating over de geselecteerde periode."
                    placement="top"
                  >
                    <HelpOutline fontSize="small" color="action" />
                  </ContextualTooltip>
                </Box>
                <Typography variant="h4" component="div" color="info.main">
                  {averageRating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Op een schaal van 1-5
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Trend
                  </Typography>
                  <ContextualTooltip
                    content="De trend in gebruikerservaring ratings over de geselecteerde periode."
                    placement="top"
                  >
                    <HelpOutline fontSize="small" color="action" />
                  </ContextualTooltip>
                </Box>
                <Typography variant="h4" component="div" sx={{ textTransform: 'capitalize' }} color={getTrendColor(ratingTrend)}>
                  {ratingTrend}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Totaal Beoordelingen
                  </Typography>
                  <ContextualTooltip
                    content="Het totale aantal gebruikerservaring beoordelingen over de geselecteerde periode."
                    placement="top"
                  >
                    <HelpOutline fontSize="small" color="action" />
                  </ContextualTooltip>
                </Box>
                <Typography variant="h4" component="div">
                  {userExperienceTrend.reduce((sum, item) => sum + item.total, 0)}
                </Typography>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
      
      {/* Trend grafiek */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6">
            {trendsView === 'sentiment' ? 'Help Feedback Sentiment Trend' : 'Gebruikerservaring Rating Trend'}
          </Typography>
          <ContextualTooltip
            content={
              trendsView === 'sentiment'
                ? "Deze grafiek toont de trend in positieve feedback percentage en het totale aantal feedback items over tijd."
                : "Deze grafiek toont de trend in gemiddelde gebruikerservaring ratings en het totale aantal beoordelingen over tijd."
            }
            placement="top"
          >
            <HelpOutline fontSize="small" color="action" />
          </ContextualTooltip>
        </Box>
        
        <Box sx={{ height: 400 }}>
          {trendsView === 'sentiment' ? (
            helpFeedbackTrend.length > 0 ? (
              <Line data={sentimentTrendData} options={sentimentTrendOptions} />
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body1" color="textSecondary">
                  Geen sentiment trend data beschikbaar
                </Typography>
              </Box>
            )
          ) : (
            userExperienceTrend.length > 0 ? (
              <Line data={ratingTrendData} options={ratingTrendOptions} />
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body1" color="textSecondary">
                  Geen rating trend data beschikbaar
                </Typography>
              </Box>
            )
          )}
        </Box>
        
        {/* Inzichten */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Inzichten
          </Typography>
          
          {trendsView === 'sentiment' ? (
            helpFeedbackTrend.length > 0 ? (
              <Box>
                <Typography variant="body1" paragraph>
                  {sentimentTrend === 'sterk stijgend' || sentimentTrend === 'stijgend' ? (
                    `De positieve feedback is ${sentimentTrend} over de geselecteerde periode, wat aangeeft dat de recente verbeteringen in de help-functionaliteit effectief zijn.`
                  ) : sentimentTrend === 'sterk dalend' || sentimentTrend === 'dalend' ? (
                    `De positieve feedback is ${sentimentTrend} over de geselecteerde periode, wat aangeeft dat er mogelijk problemen zijn met recente wijzigingen in de help-functionaliteit.`
                  ) : (
                    `De positieve feedback is ${sentimentTrend} over de geselecteerde periode, wat aangeeft dat de gebruikerservaring consistent is.`
                  )}
                </Typography>
                
                {/* Piek en dal analyse */}
                {helpFeedbackTrend.length > 2 && (
                  <>
                    {(() => {
                      const maxItem = helpFeedbackTrend.reduce((max, item) => 
                        item.positivePercentage > max.positivePercentage ? item : max, 
                        helpFeedbackTrend[0]
                      );
                      const minItem = helpFeedbackTrend.reduce((min, item) => 
                        item.positivePercentage < min.positivePercentage ? item : min, 
                        helpFeedbackTrend[0]
                      );
                      const maxDate = new Date(maxItem.date);
                      const minDate = new Date(minItem.date);
                      
                      return (
                        <Typography variant="body1" paragraph>
                          De hoogste positieve feedback ({maxItem.positivePercentage.toFixed(1)}%) werd geregistreerd op {maxDate.getDate().toString().padStart(2, '0')}/{(maxDate.getMonth() + 1).toString().padStart(2, '0')}.
                          De laagste positieve feedback ({minItem.positivePercentage.toFixed(1)}%) werd geregistreerd op {minDate.getDate().toString().padStart(2, '0')}/{(minDate.getMonth() + 1).toString().padStart(2, '0')}.
                        </Typography>
                      );
                    })()}
                  </>
                )}
              </Box>
            ) : (
              <Typography variant="body1" color="textSecondary">
                Geen sentiment trend data beschikbaar voor analyse.
              </Typography>
            )
          ) : (
            userExperienceTrend.length > 0 ? (
              <Box>
                <Typography variant="body1" paragraph>
                  {ratingTrend === 'sterk stijgend' || ratingTrend === 'stijgend' ? (
                    `De gebruikerservaring rating is ${ratingTrend} over de geselecteerde periode, wat aangeeft dat de recente verbeteringen positief worden ontvangen.`
                  ) : ratingTrend === 'sterk dalend' || ratingTrend === 'dalend' ? (
                    `De gebruikerservaring rating is ${ratingTrend} over de geselecteerde periode, wat aangeeft dat er mogelijk problemen zijn met recente wijzigingen.`
                  ) : (
                    `De gebruikerservaring rating is ${ratingTrend} over de geselecteerde periode, wat aangeeft dat de gebruikerservaring consistent is.`
                  )}
                </Typography>
                
                {/* Piek en dal analyse */}
                {userExperienceTrend.length > 2 && (
                  <>
                    {(() => {
                      const maxItem = userExperienceTrend.reduce((max, item) => 
                        item.averageRating > max.averageRating ? item : max, 
                        userExperienceTrend[0]
                      );
                      const minItem = userExperienceTrend.reduce((min, item) => 
                        item.averageRating < min.averageRating ? item : min, 
                        userExperienceTrend[0]
                      );
                      const maxDate = new Date(maxItem.date);
                      const minDate = new Date(minItem.date);
                      
                      return (
                        <Typography variant="body1" paragraph>
                          De hoogste gemiddelde rating ({maxItem.averageRating.toFixed(1)}) werd geregistreerd op {maxDate.getDate().toString().padStart(2, '0')}/{(maxDate.getMonth() + 1).toString().padStart(2, '0')}.
                          De laagste gemiddelde rating ({minItem.averageRating.toFixed(1)}) werd geregistreerd op {minDate.getDate().toString().padStart(2, '0')}/{(minDate.getMonth() + 1).toString().padStart(2, '0')}.
                        </Typography>
                      );
                    })()}
                  </>
                )}
              </Box>
            ) : (
              <Typography variant="body1" color="textSecondary">
                Geen rating trend data beschikbaar voor analyse.
              </Typography>
            )
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default FeedbackTrends;