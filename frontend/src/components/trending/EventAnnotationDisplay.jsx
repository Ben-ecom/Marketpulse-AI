import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Paper, Typography, List, ListItem, ListItemText, ListItemIcon,
  Chip, Divider, IconButton, Collapse, Tooltip, useTheme, alpha
} from '@mui/material';
import {
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
  Label as LabelIcon
} from '@mui/icons-material';
import { calculateEventImpact } from '../../utils/trending/eventAnnotation';

/**
 * Component voor het weergeven en beheren van event annotaties op de tijdlijn
 */
const EventAnnotationDisplay = ({
  events = [],
  topicsData = {},
  selectedEvent = null,
  onEventSelect,
  onVisibilityChange
}) => {
  const theme = useTheme();
  
  // State voor zichtbaarheid van events
  const [visibleEvents, setVisibleEvents] = useState(events.map(event => event.id));
  const [expandedEvent, setExpandedEvent] = useState(selectedEvent?.id || null);
  
  // Bereken impact van events op topics
  const eventsWithImpact = events.map(event => {
    const impact = calculateEventImpact(topicsData, event.date, {
      beforeWindow: 3,
      afterWindow: 5
    });
    
    return {
      ...event,
      impact: impact.impact || 0,
      hasImpact: impact.hasImpact || false,
      impactDirection: impact.direction || 'neutral',
      impactDetails: impact.byTopic || {}
    };
  });
  
  // Sorteer events op datum
  const sortedEvents = [...eventsWithImpact].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  // Handler voor event selectie
  const handleEventSelect = (event) => {
    if (onEventSelect) {
      onEventSelect(event === selectedEvent ? null : event);
    }
    
    setExpandedEvent(event.id === expandedEvent ? null : event.id);
  };
  
  // Handler voor event zichtbaarheid
  const handleVisibilityToggle = (eventId) => {
    const newVisibleEvents = visibleEvents.includes(eventId)
      ? visibleEvents.filter(id => id !== eventId)
      : [...visibleEvents, eventId];
    
    setVisibleEvents(newVisibleEvents);
    
    if (onVisibilityChange) {
      onVisibilityChange(newVisibleEvents);
    }
  };
  
  // Render impact indicator
  const renderImpactIndicator = (impact, direction) => {
    const absImpact = Math.abs(impact);
    
    if (absImpact < 10) {
      return (
        <Chip 
          size="small" 
          label="Minimale impact" 
          sx={{ 
            bgcolor: alpha(theme.palette.grey[500], 0.1),
            color: theme.palette.text.secondary
          }}
        />
      );
    }
    
    if (direction === 'positive') {
      return (
        <Chip 
          size="small" 
          label={`+${absImpact.toFixed(1)}%`} 
          sx={{ 
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.main
          }}
        />
      );
    }
    
    return (
      <Chip 
        size="small" 
        label={`-${absImpact.toFixed(1)}%`} 
        sx={{ 
          bgcolor: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main
        }}
      />
    );
  };
  
  // Als er geen events zijn
  if (!events || events.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Event Annotaties
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Geen events beschikbaar voor de geselecteerde periode.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Event Annotaties
      </Typography>
      
      <List sx={{ width: '100%' }}>
        {sortedEvents.map((event) => (
          <React.Fragment key={event.id}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                <Tooltip title={visibleEvents.includes(event.id) ? "Verberg op tijdlijn" : "Toon op tijdlijn"}>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleVisibilityToggle(event.id)}
                    color={visibleEvents.includes(event.id) ? "primary" : "default"}
                  >
                    {visibleEvents.includes(event.id) ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </Tooltip>
              }
              sx={{ 
                cursor: 'pointer',
                bgcolor: selectedEvent?.id === event.id ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
              }}
              onClick={() => handleEventSelect(event)}
            >
              <ListItemIcon>
                <EventIcon color={selectedEvent?.id === event.id ? "primary" : "action"} />
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {event.title}
                    </Typography>
                    
                    {event.category && (
                      <Chip 
                        size="small" 
                        label={event.category} 
                        icon={<LabelIcon fontSize="small" />}
                        sx={{ height: 20 }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                    >
                      {new Date(event.date).toLocaleDateString()} - {event.description?.substring(0, 60)}
                      {event.description?.length > 60 ? '...' : ''}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                      {renderImpactIndicator(event.impact, event.impactDirection)}
                      
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedEvent(event.id === expandedEvent ? null : event.id);
                        }}
                      >
                        {expandedEvent === event.id ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </IconButton>
                    </Box>
                  </React.Fragment>
                }
              />
            </ListItem>
            
            <Collapse in={expandedEvent === event.id} timeout="auto" unmountOnExit>
              <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
                <Typography variant="body2" paragraph>
                  {event.description}
                </Typography>
                
                {Object.keys(event.impactDetails).length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Impact op topics:
                    </Typography>
                    
                    <List dense>
                      {Object.entries(event.impactDetails)
                        .sort((a, b) => Math.abs(b[1].percentChange) - Math.abs(a[1].percentChange))
                        .slice(0, 5)
                        .map(([topic, details]) => (
                          <ListItem key={topic} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <InfoIcon fontSize="small" color={details.direction === 'positive' ? 'success' : details.direction === 'negative' ? 'error' : 'action'} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Typography variant="body2">
                                  {topic}: {details.percentChange > 0 ? '+' : ''}{details.percentChange.toFixed(1)}%
                                </Typography>
                              } 
                            />
                          </ListItem>
                        ))
                      }
                    </List>
                  </Box>
                )}
              </Box>
            </Collapse>
            
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

EventAnnotationDisplay.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
      category: PropTypes.string
    })
  ),
  topicsData: PropTypes.object,
  selectedEvent: PropTypes.object,
  onEventSelect: PropTypes.func,
  onVisibilityChange: PropTypes.func
};

export default EventAnnotationDisplay;
