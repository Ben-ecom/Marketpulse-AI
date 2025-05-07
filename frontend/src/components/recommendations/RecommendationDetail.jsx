import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarTodayIcon,
  Category as CategoryIcon,
  EmojiObjects as EmojiObjectsIcon,
  Speed as SpeedIcon,
  AccessTime as AccessTimeIcon,
  BarChart as BarChartIcon,
  Edit as EditIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import RecommendationActions from './RecommendationActions';

/**
 * Component voor het weergeven van gedetailleerde aanbevelingsinformatie
 * met uitklapbare secties voor implementatiestappen
 */
const RecommendationDetail = ({
  recommendation,
  onStepComplete,
  onActionPerformed,
  onBack
}) => {
  const theme = useTheme();
  
  // State voor uitklapbare secties
  const [expandedSection, setExpandedSection] = useState('implementation');
  const [completedSteps, setCompletedSteps] = useState(recommendation.completedSteps || []);
  
  // Handler voor uitklapbare secties
  const handleSectionChange = (section) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? section : false);
  };
  
  // Handler voor stap voltooien
  const handleStepComplete = (stepIndex) => (event) => {
    const isChecked = event.target.checked;
    let newCompletedSteps = [...completedSteps];
    
    if (isChecked && !newCompletedSteps.includes(stepIndex)) {
      newCompletedSteps.push(stepIndex);
    } else if (!isChecked && newCompletedSteps.includes(stepIndex)) {
      newCompletedSteps = newCompletedSteps.filter(step => step !== stepIndex);
    }
    
    setCompletedSteps(newCompletedSteps);
    
    if (onStepComplete) {
      onStepComplete(recommendation.id, stepIndex, isChecked, newCompletedSteps);
    }
  };
  
  // Bereken voortgangspercentage
  const calculateProgress = () => {
    if (!recommendation.steps || recommendation.steps.length === 0) return 100;
    return Math.round((completedSteps.length / recommendation.steps.length) * 100);
  };
  
  // Formateer tijdsindicatie
  const formatTimeFrame = (timeFrame) => {
    const timeFrameMap = {
      immediate: 'Direct',
      days: 'Dagen',
      weeks: 'Weken',
      months: 'Maanden',
      quarters: 'Kwartalen'
    };
    
    return timeFrameMap[timeFrame] || timeFrame;
  };
  
  // Render prioriteitsindicator
  const renderPriorityIndicator = () => {
    const priorityColors = {
      high: theme.palette.error.main,
      medium: theme.palette.warning.main,
      low: theme.palette.success.main
    };
    
    const priorityLabels = {
      high: 'Hoge prioriteit',
      medium: 'Gemiddelde prioriteit',
      low: 'Lage prioriteit'
    };
    
    return (
      <Chip
        label={priorityLabels[recommendation.priority] || 'Gemiddelde prioriteit'}
        size="small"
        sx={{
          backgroundColor: alpha(priorityColors[recommendation.priority] || theme.palette.warning.main, 0.1),
          color: priorityColors[recommendation.priority] || theme.palette.warning.main,
          fontWeight: 500
        }}
      />
    );
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      {/* Header met titel en prioriteit */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {recommendation.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {renderPriorityIndicator()}
            
            {recommendation.category && (
              <Chip
                icon={<CategoryIcon />}
                label={recommendation.category.replace('_', ' ')}
                size="small"
                variant="outlined"
              />
            )}
            
            {recommendation.implementationTime && (
              <Chip
                icon={<AccessTimeIcon />}
                label={formatTimeFrame(recommendation.implementationTime)}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        
        <Box>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={onBack}
            sx={{ mr: 1 }}
          >
            Terug
          </Button>
          
          <Tooltip title="Bewerk aanbeveling">
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Deel aanbeveling">
            <IconButton size="small">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Beschrijving */}
      <Typography variant="body1" paragraph>
        {recommendation.description}
      </Typography>
      
      {/* Metadata */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 3, 
          p: 2, 
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 1
        }}
      >
        {recommendation.impactCategory && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EmojiObjectsIcon color="success" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Impact
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {recommendation.impactCategory.charAt(0).toUpperCase() + recommendation.impactCategory.slice(1)}
              </Typography>
            </Box>
          </Box>
        )}
        
        {recommendation.effortCategory && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SpeedIcon color="info" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Inspanning
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {recommendation.effortCategory.charAt(0).toUpperCase() + recommendation.effortCategory.slice(1)}
              </Typography>
            </Box>
          </Box>
        )}
        
        {recommendation.implementationTime && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon color="primary" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Tijdsbestek
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatTimeFrame(recommendation.implementationTime)}
              </Typography>
            </Box>
          </Box>
        )}
        
        {recommendation.roi && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BarChartIcon color="secondary" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Verwachte ROI
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {recommendation.roi}
              </Typography>
            </Box>
          </Box>
        )}
        
        {recommendation.assignee && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon color="secondary" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Toegewezen aan
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {recommendation.assignee}
              </Typography>
            </Box>
          </Box>
        )}
        
        {recommendation.dueDate && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarTodayIcon color="error" sx={{ mr: 1 }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Deadline
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {new Date(recommendation.dueDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Uitklapbare secties */}
      <Box sx={{ mb: 3 }}>
        {/* Implementatiestappen */}
        <Accordion 
          expanded={expandedSection === 'implementation'} 
          onChange={handleSectionChange('implementation')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Implementatiestappen</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {recommendation.steps && recommendation.steps.length > 0 ? (
              <Stepper orientation="vertical" nonLinear>
                {recommendation.steps.map((step, index) => (
                  <Step key={index} active={true} completed={completedSteps.includes(index)}>
                    <StepLabel>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={completedSteps.includes(index)}
                            onChange={handleStepComplete(index)}
                            color="primary"
                          />
                        }
                        label={<Typography variant="body1">{step}</Typography>}
                        sx={{ ml: -1 }}
                      />
                    </StepLabel>
                    <StepContent>
                      {recommendation.stepDetails && recommendation.stepDetails[index] && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {recommendation.stepDetails[index]}
                        </Typography>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Geen implementatiestappen beschikbaar.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
        
        {/* Verwachte resultaten */}
        <Accordion 
          expanded={expandedSection === 'results'} 
          onChange={handleSectionChange('results')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Verwachte Resultaten</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {recommendation.expectedResults ? (
              <Box>
                <Typography variant="body2" paragraph>
                  {recommendation.expectedResults.description}
                </Typography>
                
                {recommendation.expectedResults.metrics && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Meetbare Metrics:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {recommendation.expectedResults.metrics.map((metric, index) => (
                        <Box component="li" key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            {metric}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Geen informatie over verwachte resultaten beschikbaar.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
        
        {/* Ondersteunende data */}
        <Accordion 
          expanded={expandedSection === 'data'} 
          onChange={handleSectionChange('data')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Ondersteunende Data</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {recommendation.supportingData ? (
              <Box>
                <Typography variant="body2" paragraph>
                  {recommendation.supportingData.description}
                </Typography>
                
                {recommendation.supportingData.insights && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Belangrijke Inzichten:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {recommendation.supportingData.insights.map((insight, index) => (
                        <Box component="li" key={index} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            {insight}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Geen ondersteunende data beschikbaar.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
        
        {/* Gerelateerde aanbevelingen */}
        <Accordion 
          expanded={expandedSection === 'related'} 
          onChange={handleSectionChange('related')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Gerelateerde Aanbevelingen</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {recommendation.relatedRecommendations && recommendation.relatedRecommendations.length > 0 ? (
              <Box component="ul" sx={{ pl: 2 }}>
                {recommendation.relatedRecommendations.map((related, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {related.title}
                      {related.description && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {related.description}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Geen gerelateerde aanbevelingen beschikbaar.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Acties */}
      <RecommendationActions
        recommendationId={recommendation.id}
        onAssign={(id, data) => onActionPerformed && onActionPerformed('assign', id, data)}
        onSchedule={(id, data) => onActionPerformed && onActionPerformed('schedule', id, data)}
        onShare={(id, data) => onActionPerformed && onActionPerformed('share', id, data)}
        onDelete={(id) => onActionPerformed && onActionPerformed('delete', id)}
        onEdit={(id) => onActionPerformed && onActionPerformed('edit', id)}
        onArchive={(id) => onActionPerformed && onActionPerformed('archive', id)}
        onRefresh={(id) => onActionPerformed && onActionPerformed('refresh', id)}
      />
    </Paper>
  );
};

RecommendationDetail.propTypes = {
  recommendation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string,
    priority: PropTypes.oneOf(['high', 'medium', 'low']),
    impactCategory: PropTypes.oneOf(['high', 'medium', 'low']),
    effortCategory: PropTypes.oneOf(['high', 'medium', 'low', 'quick_win']),
    implementationTime: PropTypes.oneOf(['immediate', 'days', 'weeks', 'months', 'quarters']),
    steps: PropTypes.arrayOf(PropTypes.string),
    stepDetails: PropTypes.arrayOf(PropTypes.string),
    completedSteps: PropTypes.arrayOf(PropTypes.number),
    completed: PropTypes.bool,
    assignee: PropTypes.string,
    dueDate: PropTypes.string,
    roi: PropTypes.string,
    expectedResults: PropTypes.shape({
      description: PropTypes.string,
      metrics: PropTypes.arrayOf(PropTypes.string)
    }),
    supportingData: PropTypes.shape({
      description: PropTypes.string,
      insights: PropTypes.arrayOf(PropTypes.string)
    }),
    relatedRecommendations: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string
      })
    )
  }).isRequired,
  onStepComplete: PropTypes.func,
  onActionPerformed: PropTypes.func,
  onBack: PropTypes.func
};

export default RecommendationDetail;
