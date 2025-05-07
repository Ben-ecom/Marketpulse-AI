/**
 * WidgetConfigTab.jsx
 * 
 * Component voor het configureren van zichtbare widgets en hun volgorde in het dashboard.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Typography, 
  FormGroup, 
  FormControlLabel, 
  Checkbox,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Beschikbare widgets met hun labels en beschrijvingen
const AVAILABLE_WIDGETS = [
  { 
    id: 'summary', 
    label: 'Samenvatting', 
    description: 'Toont een overzicht van belangrijke metrics zoals totale interacties en feedback.'
  },
  { 
    id: 'interactionsByType', 
    label: 'Interacties per Type', 
    description: 'Toont een grafiek van help interacties per type (tooltips, help artikelen, etc.).'
  },
  { 
    id: 'interactionsByPage', 
    label: 'Interacties per Pagina', 
    description: 'Toont een grafiek van help interacties per pagina.'
  },
  { 
    id: 'feedbackByHelpItem', 
    label: 'Feedback per Help Item', 
    description: 'Toont een tabel met feedback per help item.'
  },
  { 
    id: 'feedbackByUserRole', 
    label: 'Feedback per Gebruikersrol', 
    description: 'Toont een tabel met feedback per gebruikersrol.'
  },
  { 
    id: 'feedbackByExperienceLevel', 
    label: 'Feedback per Ervaringsniveau', 
    description: 'Toont een tabel met feedback per ervaringsniveau.'
  },
  { 
    id: 'interactionsTrend', 
    label: 'Interacties Trend', 
    description: 'Toont een grafiek van help interacties over tijd.'
  },
  { 
    id: 'userExperienceFeedback', 
    label: 'Gebruikerservaring Feedback', 
    description: 'Toont een tabel met gebruikerservaring feedback.'
  },
  { 
    id: 'advancedAnalytics', 
    label: 'Geavanceerde Analyses', 
    description: 'Toont interactieve drill-down grafieken voor diepgaande analyses.'
  }
];

/**
 * WidgetConfigTab component
 * @component
 */
const WidgetConfigTab = ({ widgetConfig, setWidgetConfig }) => {
  // Handler voor wijzigen van zichtbare widgets
  const handleWidgetVisibilityChange = (widgetId) => {
    const { visibleWidgets, widgetOrder } = widgetConfig;
    
    if (visibleWidgets.includes(widgetId)) {
      // Verwijder widget uit zichtbare widgets
      setWidgetConfig({
        visibleWidgets: visibleWidgets.filter(id => id !== widgetId),
        widgetOrder: widgetOrder.filter(id => id !== widgetId)
      });
    } else {
      // Voeg widget toe aan zichtbare widgets en widget order
      setWidgetConfig({
        visibleWidgets: [...visibleWidgets, widgetId],
        widgetOrder: [...widgetOrder, widgetId]
      });
    }
  };
  
  // Handler voor drag-and-drop van widgets
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { widgetOrder } = widgetConfig;
    const newOrder = Array.from(widgetOrder);
    const [movedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, movedItem);
    
    setWidgetConfig({
      ...widgetConfig,
      widgetOrder: newOrder
    });
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Zichtbare Widgets
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Selecteer welke widgets zichtbaar moeten zijn in het dashboard en sleep ze om de volgorde aan te passen.
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {/* Widget selectie */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Beschikbare Widgets
            </Typography>
            <FormGroup>
              {AVAILABLE_WIDGETS.map((widget) => (
                <FormControlLabel
                  key={widget.id}
                  control={
                    <Checkbox
                      checked={widgetConfig.visibleWidgets.includes(widget.id)}
                      onChange={() => handleWidgetVisibilityChange(widget.id)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">{widget.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {widget.description}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </Paper>
        </Box>
        
        {/* Widget volgorde */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Widget Volgorde
            </Typography>
            
            {widgetConfig.widgetOrder.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Selecteer widgets om de volgorde aan te passen.
              </Alert>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="widget-list">
                  {(provided) => (
                    <List
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      dense
                    >
                      {widgetConfig.widgetOrder.map((widgetId, index) => {
                        const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
                        if (!widget) return null;
                        
                        return (
                          <Draggable key={widgetId} draggableId={widgetId} index={index}>
                            {(provided) => (
                              <React.Fragment>
                                <ListItem
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{
                                    bgcolor: 'background.paper',
                                    mb: 1,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                  }}
                                >
                                  <ListItemIcon>
                                    <DragIndicatorIcon />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={widget.label}
                                    secondary={widget.description}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>
                                {index < widgetConfig.widgetOrder.length - 1 && <Divider />}
                              </React.Fragment>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

WidgetConfigTab.propTypes = {
  /**
   * De huidige widget configuratie
   */
  widgetConfig: PropTypes.shape({
    visibleWidgets: PropTypes.arrayOf(PropTypes.string).isRequired,
    widgetOrder: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired,
  
  /**
   * Functie voor het bijwerken van de widget configuratie
   */
  setWidgetConfig: PropTypes.func.isRequired
};

export default WidgetConfigTab;