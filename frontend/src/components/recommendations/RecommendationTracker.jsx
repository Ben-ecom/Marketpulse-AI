import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Paper,
  Grid,
  Divider,
  Button,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

/**
 * Component voor het bijhouden van de voortgang van aanbevelingen
 */
const RecommendationTracker = ({
  recommendations = [],
  onViewDetails,
  onViewAll
}) => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    scheduled: 0,
    assigned: 0,
    highPriority: 0
  });
  
  // Bereken statistieken wanneer aanbevelingen veranderen
  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      const newStats = {
        total: recommendations.length,
        completed: recommendations.filter(rec => rec.completed).length,
        inProgress: recommendations.filter(rec => rec.inProgress).length,
        scheduled: recommendations.filter(rec => rec.dueDate).length,
        assigned: recommendations.filter(rec => rec.assignee).length,
        highPriority: recommendations.filter(rec => rec.priority === 'high').length
      };
      
      setStats(newStats);
    }
  }, [recommendations]);
  
  // Bereken voortgangspercentage
  const calculateProgress = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };
  
  // Bereken recente aanbevelingen (laatste 5)
  const getRecentRecommendations = () => {
    if (!recommendations || recommendations.length === 0) return [];
    
    return [...recommendations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };
  
  // Bereken hoogst geprioriteerde aanbevelingen
  const getHighPriorityRecommendations = () => {
    if (!recommendations || recommendations.length === 0) return [];
    
    return [...recommendations]
      .filter(rec => rec.priority === 'high' && !rec.completed)
      .sort((a, b) => {
        // Sorteer op dueDate als beschikbaar
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        // Anders op createdAt
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 3);
  };
  
  // Render een aanbevelingsrij
  const renderRecommendationRow = (recommendation) => {
    return (
      <Box 
        key={recommendation.id}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              bgcolor: recommendation.priority === 'high' 
                ? theme.palette.error.main 
                : recommendation.priority === 'medium'
                  ? theme.palette.warning.main
                  : theme.palette.success.main,
              mr: 1.5
            }} 
          />
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {recommendation.title}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {recommendation.completed && (
            <Tooltip title="Voltooid">
              <CheckCircleIcon color="success" fontSize="small" />
            </Tooltip>
          )}
          
          {recommendation.dueDate && (
            <Tooltip title={`Gepland: ${new Date(recommendation.dueDate).toLocaleDateString()}`}>
              <ScheduleIcon fontSize="small" color="primary" />
            </Tooltip>
          )}
          
          {recommendation.assignee && (
            <Tooltip title={`Toegewezen aan: ${recommendation.assignee}`}>
              <PersonIcon fontSize="small" color="info" />
            </Tooltip>
          )}
          
          <Button 
            size="small" 
            variant="text" 
            onClick={() => onViewDetails && onViewDetails(recommendation.id)}
          >
            Details
          </Button>
        </Box>
      </Box>
    );
  };
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Voortgang Aanbevelingen
      </Typography>
      
      {/* Voortgangsbalk */}
      <Box sx={{ mt: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">
            Totale voortgang
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {calculateProgress()}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={calculateProgress()} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
      
      {/* Statistieken */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Totaal
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {stats.completed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Voltooid
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {stats.inProgress}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In uitvoering
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main">
              {stats.scheduled}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gepland
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="secondary.main">
              {stats.assigned}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Toegewezen
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {stats.highPriority}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hoge prioriteit
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Hoge prioriteit aanbevelingen */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FlagIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              Hoge Prioriteit
            </Typography>
          </Box>
          
          {stats.highPriority > 3 && (
            <Button 
              size="small" 
              onClick={() => onViewAll && onViewAll('highPriority')}
            >
              Toon alle {stats.highPriority}
            </Button>
          )}
        </Box>
        
        {getHighPriorityRecommendations().length > 0 ? (
          <Box>
            {getHighPriorityRecommendations().map(renderRecommendationRow)}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            Geen hoge prioriteit aanbevelingen.
          </Typography>
        )}
      </Box>
      
      {/* Recente aanbevelingen */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimelineIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              Recente Aanbevelingen
            </Typography>
          </Box>
          
          {stats.total > 5 && (
            <Button 
              size="small" 
              onClick={() => onViewAll && onViewAll('recent')}
            >
              Toon alle {stats.total}
            </Button>
          )}
        </Box>
        
        {getRecentRecommendations().length > 0 ? (
          <Box>
            {getRecentRecommendations().map(renderRecommendationRow)}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            Geen recente aanbevelingen.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

RecommendationTracker.propTypes = {
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      priority: PropTypes.string,
      completed: PropTypes.bool,
      inProgress: PropTypes.bool,
      dueDate: PropTypes.string,
      assignee: PropTypes.string,
      createdAt: PropTypes.string
    })
  ),
  onViewDetails: PropTypes.func,
  onViewAll: PropTypes.func
};

export default RecommendationTracker;
