import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, Typography, Card, CardContent, CardHeader, 
  Divider, useTheme, Tooltip
} from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import InfoIcon from '@mui/icons-material/Info';

// Registreer benodigde Chart.js componenten
ChartJS.register(ArcElement, ChartTooltip, Legend);

/**
 * Component voor het visualiseren van de awareness fase distributie
 * @param {Object} props - Component properties
 * @param {Object} props.awarenessData - Data over awareness fasen
 * @param {boolean} props.loading - Geeft aan of data wordt geladen
 */
const AwarenessDistribution = ({ awarenessData, loading }) => {
  const theme = useTheme();

  // Als er geen data is of de data wordt geladen, toon een placeholder
  if (!awarenessData || loading) {
    return (
      <Card>
        <CardHeader 
          title="Awareness Fase Distributie" 
          subheader="Gebaseerd op Eugene Schwartz's 5 fasen"
          action={
            <Tooltip title="Toont de verdeling van uw doelgroep over de 5 awareness fasen">
              <InfoIcon color="action" />
            </Tooltip>
          }
        />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography variant="body2" color="text.secondary">
              {loading ? 'Awareness data wordt geladen...' : 'Geen awareness data beschikbaar'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Extraheer de fasen en percentages
  const phases = Object.keys(awarenessData);
  const percentages = phases.map(phase => awarenessData[phase].percentage || 0);
  
  // Definieer kleuren voor elke fase
  const colors = {
    unaware: '#E0E0E0',
    problemAware: '#FF6B6B',
    solutionAware: '#48BEFF',
    productAware: '#4CAF50',
    mostAware: '#9C27B0'
  };

  // Bereid data voor voor de donut chart
  const chartData = {
    labels: phases.map(phase => {
      // Converteer 'unaware' naar 'Unaware Fase'
      const displayName = awarenessData[phase].displayName || 
        (phase.charAt(0).toUpperCase() + phase.slice(1).replace(/([A-Z])/g, ' $1') + ' Fase');
      return `${displayName} (${Math.round(awarenessData[phase].percentage || 0)}%)`;
    }),
    datasets: [
      {
        data: percentages,
        backgroundColor: phases.map(phase => colors[phase] || theme.palette.primary.main),
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  // Chart opties
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    cutout: '70%'
  };

  // Vind de dominante fase (hoogste percentage)
  const dominantPhase = phases.reduce((a, b) => 
    (awarenessData[a].percentage || 0) > (awarenessData[b].percentage || 0) ? a : b, phases[0]);

  return (
    <Card>
      <CardHeader 
        title="Awareness Fase Distributie" 
        subheader="Gebaseerd op Eugene Schwartz's 5 fasen"
        action={
          <Tooltip title="Toont de verdeling van uw doelgroep over de 5 awareness fasen">
            <InfoIcon color="action" />
          </Tooltip>
        }
      />
      <CardContent>
        <Box sx={{ height: 300, position: 'relative' }}>
          <Doughnut data={chartData} options={chartOptions} />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Dominante Fase
            </Typography>
            <Typography variant="h6" color={colors[dominantPhase] || theme.palette.primary.main}>
              {awarenessData[dominantPhase].displayName || 
                (dominantPhase.charAt(0).toUpperCase() + dominantPhase.slice(1).replace(/([A-Z])/g, ' $1') + ' Fase')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(awarenessData[dominantPhase].percentage || 0)}%
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Fase Verdeling
          </Typography>
          {phases.map(phase => (
            <Box key={phase} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2">
                  {awarenessData[phase].displayName || 
                    (phase.charAt(0).toUpperCase() + phase.slice(1).replace(/([A-Z])/g, ' $1') + ' Fase')}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {Math.round(awarenessData[phase].percentage || 0)}%
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: theme.palette.grey[200],
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${awarenessData[phase].percentage || 0}%`,
                    bgcolor: colors[phase] || theme.palette.primary.main,
                    borderRadius: 4
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

AwarenessDistribution.propTypes = {
  awarenessData: PropTypes.object,
  loading: PropTypes.bool
};

AwarenessDistribution.defaultProps = {
  loading: false
};

export default AwarenessDistribution;
