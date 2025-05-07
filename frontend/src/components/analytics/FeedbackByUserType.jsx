import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, ToggleButton, ToggleButtonGroup, Card, CardContent, LinearProgress, useTheme } from '@mui/material';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import ContextualTooltip from '../help/ContextualTooltip';
import { HelpOutline } from '@mui/icons-material';

// Registreer Chart.js componenten
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

/**
 * FeedbackByUserType Component
 * 
 * Visualiseert feedback per gebruikerstype (rol en ervaringsniveau).
 */
const FeedbackByUserType = ({ data }) => {
  const theme = useTheme();
  const [userTypeView, setUserTypeView] = useState('role'); // 'role' of 'level'
  
  // Als er geen data is, toon een bericht
  if (!data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">Geen feedback per gebruikerstype data beschikbaar.</Typography>
      </Box>
    );
  }
  
  // Verwerk feedback per gebruikersrol
  const feedbackByRole = data.byRole || {};
  const helpFeedbackByRole = feedbackByRole.helpFeedback || {};
  const userExperienceByRole = feedbackByRole.userExperience || {};
  
  // Verwerk feedback per ervaringsniveau
  const feedbackByLevel = data.byLevel || {};
  const helpFeedbackByLevel = feedbackByLevel.helpFeedback || {};
  const userExperienceByLevel = feedbackByLevel.userExperience || {};
  
  // Bereid data voor voor de staafdiagram (help feedback per rol)
  const roleLabels = Object.keys(helpFeedbackByRole);
  const helpFeedbackByRoleData = {
    labels: roleLabels.map(role => {
      // Converteer snake_case naar Title Case
      return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }),
    datasets: [
      {
        label: 'Positief',
        data: roleLabels.map(role => helpFeedbackByRole[role].positive),
        backgroundColor: theme.palette.success.main,
      },
      {
        label: 'Negatief',
        data: roleLabels.map(role => helpFeedbackByRole[role].negative),
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
        text: 'Help Feedback per Gebruikersrol',
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
  
  // Bereid data voor voor de staafdiagram (help feedback per ervaringsniveau)
  const levelLabels = Object.keys(helpFeedbackByLevel);
  const helpFeedbackByLevelData = {
    labels: levelLabels.map(level => {
      // Converteer naar Title Case
      return level.charAt(0).toUpperCase() + level.slice(1);
    }),
    datasets: [
      {
        label: 'Positief',
        data: levelLabels.map(level => helpFeedbackByLevel[level].positive),
        backgroundColor: theme.palette.success.main,
      },
      {
        label: 'Negatief',
        data: levelLabels.map(level => helpFeedbackByLevel[level].negative),
        backgroundColor: theme.palette.error.main,
      }
    ],
  };
  
  // Bereid data voor voor de radardiagram (aspecten per rol)
  const prepareAspectsData = (userExperienceData, labels) => {
    // Verzamel alle unieke aspecten
    const allAspects = new Set();
    labels.forEach(label => {
      const data = userExperienceData[label];
      if (data && data.aspects) {
        Object.keys(data.aspects).forEach(aspect => allAspects.add(aspect));
      }
    });
    
    // Converteer naar array en beperk tot top 8 aspecten
    const topAspects = Array.from(allAspects)
      .filter(aspect => {
        // Tel het totaal aantal vermeldingen van dit aspect over alle labels
        let total = 0;
        labels.forEach(label => {
          const data = userExperienceData[label];
          if (data && data.aspects && data.aspects[aspect]) {
            total += data.aspects[aspect];
          }
        });
        return total > 0;
      })
      .sort((a, b) => {
        // Sorteer op totaal aantal vermeldingen
        let totalA = 0;
        let totalB = 0;
        labels.forEach(label => {
          const data = userExperienceData[label];
          if (data && data.aspects) {
            if (data.aspects[a]) totalA += data.aspects[a];
            if (data.aspects[b]) totalB += data.aspects[b];
          }
        });
        return totalB - totalA;
      })
      .slice(0, 8);
    
    // Bereid datasets voor
    const datasets = labels.map((label, index) => {
      const data = userExperienceData[label];
      const displayLabel = label.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      return {
        label: displayLabel,
        data: topAspects.map(aspect => {
          if (data && data.aspects && data.aspects[aspect]) {
            return data.aspects[aspect];
          }
          return 0;
        }),
        backgroundColor: `${theme.palette.primary.main}${(index * 20 + 10).toString(16)}`,
        borderColor: index === 0 ? theme.palette.primary.main :
                    index === 1 ? theme.palette.secondary.main :
                    index === 2 ? theme.palette.info.main :
                    index === 3 ? theme.palette.warning.main :
                    index === 4 ? theme.palette.success.main :
                    theme.palette.error.main,
        borderWidth: 2,
      };
    });
    
    return {
      labels: topAspects.map(aspect => {
        // Converteer snake_case naar Title Case
        return aspect.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }),
      datasets
    };
  };
  
  const aspectsByRoleData = prepareAspectsData(userExperienceByRole, roleLabels);
  const aspectsByLevelData = prepareAspectsData(userExperienceByLevel, levelLabels);
  
  // Radardiagram opties
  const aspectsOptions = {
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
        text: 'Aspecten per Gebruikerstype',
      },
    },
  };
  
  // Verander de weergave tussen rol en ervaringsniveau
  const handleUserTypeViewChange = (event, newView) => {
    if (newView !== null) {
      setUserTypeView(newView);
    }
  };
  
  // Bereken de rol met de hoogste positieve feedback percentage
  const bestRole = Object.keys(helpFeedbackByRole).reduce((best, role) => {
    const current = helpFeedbackByRole[role];
    const currentPercentage = current.total > 0 ? (current.positive / current.total) * 100 : 0;
    
    if (!best || currentPercentage > best.percentage) {
      return { role, percentage: currentPercentage };
    }
    return best;
  }, null);
  
  // Bereken de rol met de laagste positieve feedback percentage
  const worstRole = Object.keys(helpFeedbackByRole).reduce((worst, role) => {
    const current = helpFeedbackByRole[role];
    const currentPercentage = current.total > 0 ? (current.positive / current.total) * 100 : 0;
    
    if (!worst || currentPercentage < worst.percentage) {
      return { role, percentage: currentPercentage };
    }
    return worst;
  }, null);
  
  // Bereken het ervaringsniveau met de hoogste positieve feedback percentage
  const bestLevel = Object.keys(helpFeedbackByLevel).reduce((best, level) => {
    const current = helpFeedbackByLevel[level];
    const currentPercentage = current.total > 0 ? (current.positive / current.total) * 100 : 0;
    
    if (!best || currentPercentage > best.percentage) {
      return { level, percentage: currentPercentage };
    }
    return best;
  }, null);
  
  // Bereken het ervaringsniveau met de laagste positieve feedback percentage
  const worstLevel = Object.keys(helpFeedbackByLevel).reduce((worst, level) => {
    const current = helpFeedbackByLevel[level];
    const currentPercentage = current.total > 0 ? (current.positive / current.total) * 100 : 0;
    
    if (!worst || currentPercentage < worst.percentage) {
      return { level, percentage: currentPercentage };
    }
    return worst;
  }, null);
  
  return (
    <Box>
      {/* Toggle voor weergave */}
      <Box display="flex" justifyContent="center" mb={3}>
        <ToggleButtonGroup
          value={userTypeView}
          exclusive
          onChange={handleUserTypeViewChange}
          aria-label="user type view"
          size="small"
        >
          <ToggleButton value="role" aria-label="by role">
            Per Gebruikersrol
          </ToggleButton>
          <ToggleButton value="level" aria-label="by level">
            Per Ervaringsniveau
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* Samenvatting statistieken */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {userTypeView === 'role' ? (
          <>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Meest Tevreden Rol
                    </Typography>
                    <ContextualTooltip
                      content="De gebruikersrol met het hoogste percentage positieve feedback."
                      placement="top"
                    >
                      <HelpOutline fontSize="small" color="action" />
                    </ContextualTooltip>
                  </Box>
                  {bestRole ? (
                    <>
                      <Typography variant="h5" component="div" sx={{ textTransform: 'capitalize' }}>
                        {bestRole.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        {bestRole.percentage.toFixed(1)}% positief
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body1">Geen data beschikbaar</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Minst Tevreden Rol
                    </Typography>
                    <ContextualTooltip
                      content="De gebruikersrol met het laagste percentage positieve feedback."
                      placement="top"
                    >
                      <HelpOutline fontSize="small" color="action" />
                    </ContextualTooltip>
                  </Box>
                  {worstRole ? (
                    <>
                      <Typography variant="h5" component="div" sx={{ textTransform: 'capitalize' }}>
                        {worstRole.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        {worstRole.percentage.toFixed(1)}% positief
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body1">Geen data beschikbaar</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Meest Tevreden Ervaringsniveau
                    </Typography>
                    <ContextualTooltip
                      content="Het ervaringsniveau met het hoogste percentage positieve feedback."
                      placement="top"
                    >
                      <HelpOutline fontSize="small" color="action" />
                    </ContextualTooltip>
                  </Box>
                  {bestLevel ? (
                    <>
                      <Typography variant="h5" component="div" sx={{ textTransform: 'capitalize' }}>
                        {bestLevel.level.charAt(0).toUpperCase() + bestLevel.level.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        {bestLevel.percentage.toFixed(1)}% positief
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body1">Geen data beschikbaar</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Minst Tevreden Ervaringsniveau
                    </Typography>
                    <ContextualTooltip
                      content="Het ervaringsniveau met het laagste percentage positieve feedback."
                      placement="top"
                    >
                      <HelpOutline fontSize="small" color="action" />
                    </ContextualTooltip>
                  </Box>
                  {worstLevel ? (
                    <>
                      <Typography variant="h5" component="div" sx={{ textTransform: 'capitalize' }}>
                        {worstLevel.level.charAt(0).toUpperCase() + worstLevel.level.slice(1)}
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        {worstLevel.percentage.toFixed(1)}% positief
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body1">Geen data beschikbaar</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>
      
      {/* Grafieken */}
      <Grid container spacing={3}>
        {/* Help Feedback per Gebruikerstype */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6">
                Help Feedback per {userTypeView === 'role' ? 'Gebruikersrol' : 'Ervaringsniveau'}
              </Typography>
              <ContextualTooltip
                content={`Verdeling van positieve en negatieve help feedback per ${userTypeView === 'role' ? 'gebruikersrol' : 'ervaringsniveau'}.`}
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            <Box sx={{ height: 400 }}>
              {userTypeView === 'role' ? (
                Object.keys(helpFeedbackByRole).length > 0 ? (
                  <Bar data={helpFeedbackByRoleData} options={helpFeedbackOptions} />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="textSecondary">
                      Geen help feedback per rol data beschikbaar
                    </Typography>
                  </Box>
                )
              ) : (
                Object.keys(helpFeedbackByLevel).length > 0 ? (
                  <Bar data={helpFeedbackByLevelData} options={helpFeedbackOptions} />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="textSecondary">
                      Geen help feedback per ervaringsniveau data beschikbaar
                    </Typography>
                  </Box>
                )
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Aspecten per Gebruikerstype */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6">
                Aspecten per {userTypeView === 'role' ? 'Gebruikersrol' : 'Ervaringsniveau'}
              </Typography>
              <ContextualTooltip
                content={`Frequentie van verschillende aspecten genoemd in gebruikersfeedback per ${userTypeView === 'role' ? 'gebruikersrol' : 'ervaringsniveau'}.`}
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            <Box sx={{ height: 400 }}>
              {userTypeView === 'role' ? (
                aspectsByRoleData.datasets.length > 0 ? (
                  <Radar data={aspectsByRoleData} options={aspectsOptions} />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="textSecondary">
                      Geen aspecten per rol data beschikbaar
                    </Typography>
                  </Box>
                )
              ) : (
                aspectsByLevelData.datasets.length > 0 ? (
                  <Radar data={aspectsByLevelData} options={aspectsOptions} />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="textSecondary">
                      Geen aspecten per ervaringsniveau data beschikbaar
                    </Typography>
                  </Box>
                )
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Gedetailleerde Statistieken */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Typography variant="h6">
                Gedetailleerde {userTypeView === 'role' ? 'Gebruikersrol' : 'Ervaringsniveau'} Statistieken
              </Typography>
              <ContextualTooltip
                content={`Gedetailleerde statistieken per ${userTypeView === 'role' ? 'gebruikersrol' : 'ervaringsniveau'}, inclusief feedback sentiment, ratings en meest genoemde aspecten.`}
                placement="top"
              >
                <HelpOutline fontSize="small" color="action" />
              </ContextualTooltip>
            </Box>
            
            <Box sx={{ overflowX: 'auto' }}>
              <Grid container spacing={3}>
                {userTypeView === 'role' ? (
                  Object.keys(helpFeedbackByRole).map(role => {
                    const helpData = helpFeedbackByRole[role];
                    const userExpData = userExperienceByRole[role] || { total: 0, average: 0 };
                    const positivePercentage = helpData.total > 0 ? (helpData.positive / helpData.total) * 100 : 0;
                    
                    // Haal top 3 aspecten op
                    const topAspects = userExpData.aspects ? 
                      Object.entries(userExpData.aspects)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([aspect, count]) => ({
                          aspect: aspect.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                          count
                        })) : [];
                    
                    return (
                      <Grid item xs={12} md={6} lg={4} key={role}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 2 }}>
                              {role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                  })
                ) : (
                  Object.keys(helpFeedbackByLevel).map(level => {
                    const helpData = helpFeedbackByLevel[level];
                    const userExpData = userExperienceByLevel[level] || { total: 0, average: 0 };
                    const positivePercentage = helpData.total > 0 ? (helpData.positive / helpData.total) * 100 : 0;
                    
                    // Haal top 3 aspecten op
                    const topAspects = userExpData.aspects ? 
                      Object.entries(userExpData.aspects)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([aspect, count]) => ({
                          aspect: aspect.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                          count
                        })) : [];
                    
                    return (
                      <Grid item xs={12} md={6} lg={3} key={level}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 2 }}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
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
                  })
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeedbackByUserType;