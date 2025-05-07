import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  styled,
  alpha
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  AccessTime as AccessTimeIcon,
  Category as CategoryIcon,
  EmojiObjects as EmojiObjectsIcon
} from '@mui/icons-material';

// Gestileerde componenten
const PriorityBadge = styled(Box)(({ theme, priority }) => {
  const colors = {
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.success.main
  };
  
  return {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: colors[priority] || colors.medium,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
  };
});

const StyledCard = styled(Card)(({ theme, priority, completed }) => {
  const colors = {
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.success.main
  };
  
  return {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    borderLeft: `4px solid ${colors[priority] || colors.medium}`,
    transition: theme.transitions.create(['box-shadow', 'transform'], {
      duration: theme.transitions.duration.standard,
    }),
    '&:hover': {
      boxShadow: theme.shadows[6],
      transform: 'translateY(-2px)'
    },
    ...(completed && {
      backgroundColor: alpha(theme.palette.success.light, 0.1),
      borderColor: theme.palette.success.main
    })
  };
});

const CategoryChip = styled(Chip)(({ theme, category }) => {
  const categoryColors = {
    content: theme.palette.info.main,
    marketing: theme.palette.primary.main,
    product: theme.palette.secondary.main,
    pricing: theme.palette.warning.main,
    social_media: theme.palette.success.main,
    strategic: theme.palette.error.main
  };
  
  return {
    backgroundColor: alpha(categoryColors[category] || theme.palette.primary.main, 0.1),
    color: categoryColors[category] || theme.palette.primary.main,
    fontWeight: 500,
    fontSize: '0.75rem'
  };
});

const EffortChip = styled(Chip)(({ theme, effort }) => {
  const effortColors = {
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.success.main,
    quick_win: theme.palette.success.dark
  };
  
  return {
    backgroundColor: alpha(effortColors[effort] || theme.palette.primary.main, 0.1),
    color: effortColors[effort] || theme.palette.primary.main,
    fontWeight: 500,
    fontSize: '0.75rem'
  };
});

const ImpactChip = styled(Chip)(({ theme, impact }) => {
  const impactColors = {
    high: theme.palette.success.main,
    medium: theme.palette.info.main,
    low: theme.palette.text.secondary
  };
  
  return {
    backgroundColor: alpha(impactColors[impact] || theme.palette.success.main, 0.1),
    color: impactColors[impact] || theme.palette.success.main,
    fontWeight: 500,
    fontSize: '0.75rem'
  };
});

/**
 * Component voor het weergeven van een individuele aanbeveling
 */
const RecommendationCard = ({
  recommendation,
  onComplete,
  onBookmark,
  onPriorityChange,
  showDetails = false
}) => {
  const [isCompleted, setIsCompleted] = useState(recommendation.completed || false);
  const [isBookmarked, setIsBookmarked] = useState(recommendation.bookmarked || false);
  const [currentPriority, setCurrentPriority] = useState(recommendation.priority || 'medium');
  
  // Bereken implementatie voortgang
  const calculateProgress = () => {
    if (!recommendation.steps || recommendation.steps.length === 0) return 100;
    
    const completedSteps = recommendation.completedSteps || [];
    return Math.round((completedSteps.length / recommendation.steps.length) * 100);
  };
  
  // Handlers
  const handleComplete = () => {
    const newCompletedState = !isCompleted;
    setIsCompleted(newCompletedState);
    if (onComplete) {
      onComplete(recommendation.id, newCompletedState);
    }
  };
  
  const handleBookmark = () => {
    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);
    if (onBookmark) {
      onBookmark(recommendation.id, newBookmarkedState);
    }
  };
  
  const handlePriorityUp = () => {
    let newPriority = currentPriority;
    if (currentPriority === 'low') newPriority = 'medium';
    else if (currentPriority === 'medium') newPriority = 'high';
    
    if (newPriority !== currentPriority) {
      setCurrentPriority(newPriority);
      if (onPriorityChange) {
        onPriorityChange(recommendation.id, newPriority);
      }
    }
  };
  
  const handlePriorityDown = () => {
    let newPriority = currentPriority;
    if (currentPriority === 'high') newPriority = 'medium';
    else if (currentPriority === 'medium') newPriority = 'low';
    
    if (newPriority !== currentPriority) {
      setCurrentPriority(newPriority);
      if (onPriorityChange) {
        onPriorityChange(recommendation.id, newPriority);
      }
    }
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
  
  return (
    <StyledCard priority={currentPriority} completed={isCompleted}>
      <PriorityBadge priority={currentPriority} />
      
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Titel en categorie */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {recommendation.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            {recommendation.category && (
              <CategoryChip
                icon={<CategoryIcon />}
                label={recommendation.category.replace('_', ' ')}
                size="small"
                category={recommendation.category}
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
        
        {/* Beschrijving */}
        <Typography variant="body2" color="text.secondary" paragraph>
          {recommendation.description}
        </Typography>
        
        {/* Impact en effort */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {recommendation.impactCategory && (
            <ImpactChip
              icon={<EmojiObjectsIcon />}
              label={`Impact: ${recommendation.impactCategory}`}
              size="small"
              impact={recommendation.impactCategory}
            />
          )}
          
          {recommendation.effortCategory && (
            <EffortChip
              label={`Effort: ${recommendation.effortCategory}`}
              size="small"
              effort={recommendation.effortCategory}
            />
          )}
        </Box>
        
        {/* Implementatiestappen - alleen tonen als showDetails true is */}
        {showDetails && recommendation.steps && recommendation.steps.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Implementatiestappen:
            </Typography>
            
            <Box component="ol" sx={{ pl: 2, mt: 1 }}>
              {recommendation.steps.map((step, index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {step}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            {/* Voortgangsindicator */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Voortgang
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {calculateProgress()}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={calculateProgress()} 
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          </Box>
        )}
      </CardContent>
      
      <Divider />
      
      {/* Actieknoppen */}
      <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
        <Box>
          <Tooltip title={isCompleted ? "Markeer als niet voltooid" : "Markeer als voltooid"}>
            <IconButton 
              size="small" 
              color={isCompleted ? "success" : "default"}
              onClick={handleComplete}
            >
              <CheckCircleIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={isBookmarked ? "Verwijder bladwijzer" : "Voeg bladwijzer toe"}>
            <IconButton 
              size="small" 
              color={isBookmarked ? "primary" : "default"}
              onClick={handleBookmark}
            >
              {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box>
          <Tooltip title="Verhoog prioriteit">
            <span>
              <IconButton 
                size="small" 
                disabled={currentPriority === 'high'}
                onClick={handlePriorityUp}
              >
                <ArrowUpwardIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Verlaag prioriteit">
            <span>
              <IconButton 
                size="small" 
                disabled={currentPriority === 'low'}
                onClick={handlePriorityDown}
              >
                <ArrowDownwardIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </CardActions>
    </StyledCard>
  );
};

RecommendationCard.propTypes = {
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
    completedSteps: PropTypes.arrayOf(PropTypes.number),
    completed: PropTypes.bool,
    bookmarked: PropTypes.bool
  }).isRequired,
  onComplete: PropTypes.func,
  onBookmark: PropTypes.func,
  onPriorityChange: PropTypes.func,
  showDetails: PropTypes.bool
};

export default RecommendationCard;
