import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  Chip,
  IconButton,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Tooltip,
  Paper,
  TextField
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SentimentSatisfiedAlt as SentimentPositiveIcon,
  SentimentNeutral as SentimentNeutralIcon,
  SentimentDissatisfied as SentimentNegativeIcon,
  Category as CategoryIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Share as ShareIcon,
  Link as LinkIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import TextGradient from '../../ui/TextGradient';
import GradientBackground from '../../ui/GradientBackground';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

// Styles
import '../../../styles/insightDetail.css';

/**
 * InsightDetail Component
 * Toont gedetailleerde informatie over een geselecteerd inzicht
 */
const InsightDetail = ({ 
  insight, 
  relatedInsights = [], 
  onClose,
  onSaveAction,
  onMarkFavorite
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(insight?.is_favorite || false);
  const [showRelated, setShowRelated] = useState(false);
  const [actionText, setActionText] = useState('');
  
  // Effect om de favorite status te updaten als het inzicht verandert
  useEffect(() => {
    if (insight) {
      setIsFavorite(insight.is_favorite || false);
    }
  }, [insight]);
  
  // Als er geen inzicht is, toon een placeholder
  if (!insight) {
    return (
      <Card className="insight-detail-card">
        <CardContent>
          <Typography variant="body1">
            Selecteer een inzicht om details te bekijken
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Render het juiste sentiment icoon
  const renderSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <SentimentPositiveIcon color="success" />;
      case 'negative':
        return <SentimentNegativeIcon color="error" />;
      case 'neutral':
      default:
        return <SentimentNeutralIcon color="info" />;
    }
  };
  
  // Render de categorie chip
  const renderCategoryChip = (category) => {
    let label = category;
    let color = 'default';
    
    switch (category) {
      case 'pain_point':
        label = 'Pijnpunt';
        color = 'error';
        break;
      case 'desire':
        label = 'Verlangen';
        color = 'success';
        break;
      case 'terminology':
        label = 'Terminologie';
        color = 'info';
        break;
      default:
        break;
    }
    
    return (
      <Chip 
        icon={<CategoryIcon />} 
        label={label} 
        color={color} 
        size="small" 
        variant="outlined"
        className="insight-category-chip"
      />
    );
  };
  
  // Toggle de expanded state
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  // Toggle de favorite state
  const handleFavoriteClick = () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    if (onMarkFavorite) {
      onMarkFavorite(insight.id, newState);
    }
  };
  
  // Toggle de gerelateerde inzichten
  const handleToggleRelated = () => {
    setShowRelated(!showRelated);
  };
  
  // Sla een actie op voor dit inzicht
  const handleSaveAction = () => {
    if (actionText.trim() && onSaveAction) {
      onSaveAction(insight.id, actionText);
      setActionText('');
    }
  };
  
  return (
    <Card className="insight-detail-card">
      <GradientBackground>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <TextGradient variant="h6" gradient="blue-to-teal">
                Inzicht Details
              </TextGradient>
              <Box>
                <Tooltip title={isFavorite ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}>
                  <IconButton onClick={handleFavoriteClick} size="small">
                    {isFavorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Sluiten">
                  <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          }
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                icon={<LinkIcon />} 
                label={insight.platform} 
                size="small" 
                className="insight-platform-chip"
              />
              <Chip 
                icon={renderSentimentIcon(insight.sentiment)} 
                label={insight.sentiment === 'positive' ? 'Positief' : insight.sentiment === 'negative' ? 'Negatief' : 'Neutraal'} 
                size="small"
                color={insight.sentiment === 'positive' ? 'success' : insight.sentiment === 'negative' ? 'error' : 'info'}
                variant="outlined"
                className="insight-sentiment-chip"
              />
              {renderCategoryChip(insight.category)}
              <Chip 
                icon={<TrendingUpIcon />} 
                label={`Score: ${insight.score || 'N/A'}`} 
                size="small" 
                className="insight-score-chip"
              />
            </Box>
          }
        />
      </GradientBackground>
      <Divider />
      <CardContent>
        <Typography variant="body1" paragraph className="insight-content">
          {insight.content}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(insight.created_at), 'd MMMM yyyy', { locale: nl })}
          </Typography>
          <Button
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={handleExpandClick}
            size="small"
          >
            {expanded ? 'Minder details' : 'Meer details'}
          </Button>
        </Box>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Context
            </Typography>
            <Typography variant="body2" paragraph>
              {insight.context || 'Geen context beschikbaar'}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Bron
            </Typography>
            <Typography variant="body2" paragraph>
              <a href={insight.source_url} target="_blank" rel="noopener noreferrer">
                {insight.source_url || 'Geen bron beschikbaar'}
              </a>
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Metadata
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Type:</strong> {insight.insight_type || 'Onbekend'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Engagement:</strong> {insight.engagement || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Relevantie:</strong> {insight.relevance || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Sentiment Score:</strong> {insight.sentiment_score || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
      
      <Divider />
      
      {/* Actie sectie */}
      <CardContent>
        <Typography variant="subtitle2" gutterBottom>
          Actie
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Noteer een actie op basis van dit inzicht..."
            value={actionText}
            onChange={(e) => setActionText(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveAction}
            disabled={!actionText.trim()}
          >
            Opslaan
          </Button>
        </Box>
        
        {insight.actions && insight.actions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Opgeslagen acties
            </Typography>
            <List dense>
              {insight.actions.map((action, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <LightbulbIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={action.text} 
                    secondary={format(new Date(action.created_at), 'd MMMM yyyy', { locale: nl })}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
      
      {/* Gerelateerde inzichten sectie */}
      {relatedInsights.length > 0 && (
        <>
          <Divider />
          <CardContent>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={handleToggleRelated}
            >
              <Typography variant="subtitle2">
                Gerelateerde inzichten ({relatedInsights.length})
              </Typography>
              {showRelated ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </Box>
            
            <Collapse in={showRelated} timeout="auto" unmountOnExit>
              <List dense sx={{ mt: 1 }}>
                {relatedInsights.map((related) => (
                  <ListItem 
                    key={related.id} 
                    button 
                    divider
                    className="related-insight-item"
                  >
                    <ListItemIcon>
                      {renderSentimentIcon(related.sentiment)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={related.content.substring(0, 100) + (related.content.length > 100 ? '...' : '')} 
                      secondary={`${related.platform} • ${format(new Date(related.created_at), 'd MMM yyyy', { locale: nl })}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </CardContent>
        </>
      )}
    </Card>
  );
};

InsightDetail.propTypes = {
  insight: PropTypes.object,
  relatedInsights: PropTypes.array,
  onClose: PropTypes.func,
  onSaveAction: PropTypes.func,
  onMarkFavorite: PropTypes.func
};

export default InsightDetail;
