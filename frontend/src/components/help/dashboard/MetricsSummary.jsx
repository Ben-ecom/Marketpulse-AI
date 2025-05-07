/**
 * MetricsSummary.jsx
 * 
 * Component voor het weergeven van een samenvatting van de belangrijkste help-systeem metrieken.
 * Toont KPI's zoals totaal aantal interacties, feedback ratio en gebruikerstevredenheid.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Skeleton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import PeopleIcon from '@mui/icons-material/People';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import FeedbackIcon from '@mui/icons-material/Feedback';
import StarIcon from '@mui/icons-material/Star';

/**
 * MetricsSummary Component
 * 
 * Toont een overzicht van de belangrijkste KPI's van het help-systeem.
 * 
 * @component
 */
const MetricsSummary = ({ metrics, loading }) => {
  // Helper functie voor het formatteren van percentages
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };
  
  // Helper functie voor het bepalen van de kleur op basis van de waarde
  const getColorForPercentage = (value, threshold = 80) => {
    if (value >= threshold) return 'success.main';
    if (value >= threshold - 20) return 'warning.main';
    return 'error.main';
  };
  
  // Helper functie voor het bepalen van de kleur voor de gemiddelde rating
  const getColorForRating = (value, max = 5) => {
    const percentage = (value / max) * 100;
    return getColorForPercentage(percentage);
  };
  
  // Helper functie voor het renderen van een metriek kaart
  const renderMetricCard = (title, value, icon, info, color = 'primary.main', loading = false) => {
    return (
      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
        elevation={2}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Tooltip title={info}>
            <InfoIcon fontSize="small" color="action" />
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ 
            mr: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: `${color}15`,
            color: color,
            borderRadius: '50%',
            p: 1
          }}>
            {icon}
          </Box>
          
          {loading ? (
            <Skeleton variant="text" width={100} height={60} />
          ) : (
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          )}
        </Box>
      </Paper>
    );
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        KPI Samenvatting
      </Typography>
      
      <Grid container spacing={3}>
        {/* Totaal aantal interacties */}
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            'Totaal interacties',
            loading ? '...' : metrics.totalInteractions.toLocaleString(),
            <TouchAppIcon />,
            'Totaal aantal interacties met het help-systeem',
            'primary.main',
            loading
          )}
        </Grid>
        
        {/* Feedback submission rate */}
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            'Feedback ratio',
            loading ? '...' : formatPercentage(metrics.feedbackSubmissionRate),
            <FeedbackIcon />,
            'Percentage interacties dat leidt tot feedback',
            getColorForPercentage(metrics.feedbackSubmissionRate, 30),
            loading
          )}
        </Grid>
        
        {/* Positive feedback rate */}
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            'Positieve feedback',
            loading ? '...' : formatPercentage(metrics.positiveFeedbackRate),
            <ThumbUpIcon />,
            'Percentage feedback dat positief is',
            getColorForPercentage(metrics.positiveFeedbackRate),
            loading
          )}
        </Grid>
        
        {/* Average user satisfaction */}
        <Grid item xs={12} sm={6} md={3}>
          {renderMetricCard(
            'Gebruikerstevredenheid',
            loading ? '...' : `${metrics.averageUserSatisfaction.toFixed(1)}/5`,
            <StarIcon />,
            'Gemiddelde tevredenheidsscore (1-5)',
            getColorForRating(metrics.averageUserSatisfaction),
            loading
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

MetricsSummary.propTypes = {
  /**
   * Metrics data object
   */
  metrics: PropTypes.shape({
    totalInteractions: PropTypes.number.isRequired,
    totalFeedback: PropTypes.number.isRequired,
    totalUserFeedback: PropTypes.number.isRequired,
    feedbackSubmissionRate: PropTypes.number.isRequired,
    positiveFeedbackRate: PropTypes.number.isRequired,
    averageUserSatisfaction: PropTypes.number.isRequired
  }),
  
  /**
   * Loading state
   */
  loading: PropTypes.bool
};

MetricsSummary.defaultProps = {
  loading: false
};

export default MetricsSummary;
