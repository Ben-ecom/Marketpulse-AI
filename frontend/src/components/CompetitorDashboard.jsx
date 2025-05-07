import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Divider,
  Card, 
  CardContent,
  Rating,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  RemoveRedEye as EyeIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

/**
 * Dashboard component voor concurrentieanalyse
 * @param {object} props - Component properties
 * @param {array} props.competitors - Array met concurrentanalyses
 * @param {object} props.comparativeAnalysis - Vergelijkende analyse
 * @returns {JSX.Element} Dashboard component
 */
const CompetitorDashboard = ({ competitors, comparativeAnalysis }) => {
  if (!competitors || competitors.length === 0 || !comparativeAnalysis) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Geen analysegegevens beschikbaar
        </Typography>
      </Box>
    );
  }

  // Sorteer concurrenten op overall score
  const sortedCompetitors = [...competitors].sort((a, b) => {
    const scoreA = comparativeAnalysis.overallScores.find(s => s.name === a.name)?.overallScore || 0;
    const scoreB = comparativeAnalysis.overallScores.find(s => s.name === b.name)?.overallScore || 0;
    return scoreB - scoreA;
  });

  // Bereken gemiddelde scores
  const avgMessagingScore = comparativeAnalysis.overallScores.reduce(
    (sum, score) => sum + score.messagingScore, 0
  ) / comparativeAnalysis.overallScores.length;
  
  const avgGapScore = comparativeAnalysis.overallScores.reduce(
    (sum, score) => sum + score.gapScore, 0
  ) / comparativeAnalysis.overallScores.length;

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        {/* Overzicht kaart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Concurrentieanalyse Overzicht
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Analyse van {competitors.length} concurrenten, gebaseerd op doelgroep- en marktinzichten
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gemiddelde Messaging Effectiviteit
                  </Typography>
                  <Typography variant="h4" sx={{ my: 1 }}>
                    {(avgMessagingScore * 100).toFixed(0)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={avgMessagingScore * 100} 
                    color="primary"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gemiddelde Gap Dekking
                  </Typography>
                  <Typography variant="h4" sx={{ my: 1 }}>
                    {(avgGapScore * 100).toFixed(0)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={avgGapScore * 100} 
                    color="secondary"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Gemeenschappelijke Sterke Punten
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 2 }}>
                    {comparativeAnalysis.commonStrengths && comparativeAnalysis.commonStrengths.length > 0 ? (
                      comparativeAnalysis.commonStrengths.map((strength, idx) => (
                        <Chip 
                          key={idx} 
                          label={strength} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Geen gemeenschappelijke sterke punten gevonden
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Concurrent kaarten */}
        {sortedCompetitors.map((competitor, index) => {
          const overallScore = comparativeAnalysis.overallScores.find(
            s => s.name === competitor.name
          )?.overallScore || 0;
          
          const messagingScore = comparativeAnalysis.overallScores.find(
            s => s.name === competitor.name
          )?.messagingScore || 0;
          
          const gapScore = comparativeAnalysis.overallScores.find(
            s => s.name === competitor.name
          )?.gapScore || 0;
          
          // Bepaal of deze concurrent boven of onder het gemiddelde scoort
          const isAboveAvgMessaging = messagingScore > avgMessagingScore;
          const isAboveAvgGap = gapScore > avgGapScore;
          
          return (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {competitor.name}
                    </Typography>
                    <Rating 
                      value={overallScore * 5} 
                      precision={0.5} 
                      readOnly 
                      size="small" 
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <a href={competitor.url} target="_blank" rel="noopener noreferrer">
                      {competitor.url}
                    </a>
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Messaging Effectiviteit:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {(messagingScore * 100).toFixed(0)}%
                      </Typography>
                      {isAboveAvgMessaging ? (
                        <TrendingUpIcon color="success" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="error" fontSize="small" />
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Gap Dekking:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {(gapScore * 100).toFixed(0)}%
                      </Typography>
                      {isAboveAvgGap ? (
                        <TrendingUpIcon color="success" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="error" fontSize="small" />
                      )}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Belangrijkste sterke punten:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {competitor.swot?.strengths?.slice(0, 2).map((strength, idx) => (
                      <Chip 
                        key={idx} 
                        label={strength} 
                        size="small" 
                        color="success" 
                        variant="outlined"
                        icon={<CheckIcon />}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Belangrijkste zwakke punten:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {competitor.swot?.weaknesses?.slice(0, 2).map((weakness, idx) => (
                      <Chip 
                        key={idx} 
                        label={weakness} 
                        size="small" 
                        color="error" 
                        variant="outlined"
                        icon={<CloseIcon />}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default CompetitorDashboard;
