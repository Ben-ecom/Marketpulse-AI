import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, Typography, Card, CardContent, CardHeader, 
  List, ListItem, ListItemIcon, ListItemText,
  Divider, useTheme, Tooltip, Chip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/**
 * Component voor het tonen van marketing aanbevelingen op basis van awareness fasen
 * @param {Object} props - Component properties
 * @param {Object} props.recommendations - Marketing aanbevelingen data
 * @param {boolean} props.loading - Geeft aan of data wordt geladen
 */
const MarketingRecommendations = ({ recommendations, loading }) => {
  const theme = useTheme();

  // Als er geen data is of de data wordt geladen, toon een placeholder
  if (!recommendations || loading) {
    return (
      <Card>
        <CardHeader 
          title="Marketing Aanbevelingen" 
          subheader="Gebaseerd op awareness fase distributie"
          action={
            <Tooltip title="Aanbevelingen voor marketing op basis van de awareness fase distributie">
              <InfoIcon color="action" />
            </Tooltip>
          }
        />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Typography variant="body2" color="text.secondary">
              {loading ? 'Aanbevelingen worden geladen...' : 'Geen aanbevelingen beschikbaar'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Definieer kleuren voor elke fase
  const colors = {
    unaware: '#E0E0E0',
    problemAware: '#FF6B6B',
    solutionAware: '#48BEFF',
    productAware: '#4CAF50',
    mostAware: '#9C27B0'
  };

  const { dominantPhase, secondaryPhase, transitionFocus } = recommendations;

  return (
    <Card>
      <CardHeader 
        title="Marketing Aanbevelingen" 
        subheader="Gebaseerd op awareness fase distributie"
        action={
          <Tooltip title="Aanbevelingen voor marketing op basis van de awareness fase distributie">
            <InfoIcon color="action" />
          </Tooltip>
        }
      />
      <CardContent>
        {/* Dominante fase sectie */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Dominante Fase: 
            </Typography>
            <Chip 
              label={dominantPhase.displayName} 
              sx={{ 
                ml: 1, 
                bgcolor: colors[dominantPhase.name] || theme.palette.primary.main,
                color: dominantPhase.name === 'unaware' ? 'text.primary' : 'white'
              }}
            />
            <Typography variant="body2" sx={{ ml: 1 }}>
              ({Math.round(dominantPhase.percentage)}%)
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            De meeste van uw doelgroep bevindt zich in de {dominantPhase.displayName.toLowerCase()}.
            Focus uw marketing inspanningen op deze fase voor maximale impact.
          </Typography>
          
          {dominantPhase.recommendedAngles && dominantPhase.recommendedAngles.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Aanbevolen Marketing Angles:
              </Typography>
              <List dense disablePadding>
                {dominantPhase.recommendedAngles.map((angle, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <StarIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={angle.title}
                      secondary={angle.description}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                      secondaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Transitie focus sectie */}
        {transitionFocus && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Aanbevolen Transitie Focus
              </Typography>
            </Box>
            
            {secondaryPhase && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip 
                  label={dominantPhase.displayName} 
                  size="small"
                  sx={{ 
                    bgcolor: colors[dominantPhase.name] || theme.palette.primary.main,
                    color: dominantPhase.name === 'unaware' ? 'text.primary' : 'white'
                  }}
                />
                <ArrowForwardIcon sx={{ mx: 1 }} />
                <Chip 
                  label={secondaryPhase.displayName} 
                  size="small"
                  sx={{ 
                    bgcolor: colors[secondaryPhase.name] || theme.palette.secondary.main,
                    color: secondaryPhase.name === 'unaware' ? 'text.primary' : 'white'
                  }}
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({Math.round(secondaryPhase.percentage)}%)
                </Typography>
              </Box>
            )}
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              {transitionFocus.description}
            </Typography>
            
            <List dense disablePadding>
              {transitionFocus.recommendations.map((recommendation, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <StarIcon fontSize="small" color="secondary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={recommendation}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {/* Voorbeeld sectie */}
        {dominantPhase.recommendedAngles && dominantPhase.recommendedAngles.length > 0 && 
         dominantPhase.recommendedAngles[0].examples && dominantPhase.recommendedAngles[0].examples.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Voorbeelden:
              </Typography>
              <List dense disablePadding>
                {dominantPhase.recommendedAngles[0].examples.map((example, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Box 
                        sx={{ 
                          width: 20, 
                          height: 20, 
                          borderRadius: '50%', 
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem'
                        }}
                      >
                        {index + 1}
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary={example}
                      primaryTypographyProps={{ variant: 'body2', fontStyle: 'italic' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

MarketingRecommendations.propTypes = {
  recommendations: PropTypes.shape({
    dominantPhase: PropTypes.shape({
      name: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired,
      recommendedAngles: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired,
          examples: PropTypes.arrayOf(PropTypes.string)
        })
      )
    }).isRequired,
    secondaryPhase: PropTypes.shape({
      name: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired
    }),
    transitionFocus: PropTypes.shape({
      type: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      recommendations: PropTypes.arrayOf(PropTypes.string).isRequired
    })
  }),
  loading: PropTypes.bool
};

MarketingRecommendations.defaultProps = {
  loading: false
};

export default MarketingRecommendations;
