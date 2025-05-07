import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, useTheme } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import ReportTooltips from './ReportTooltips';
import HelpRecommendationService from '../../services/HelpRecommendationService';

/**
 * TopicAwarenessReportHelp Component
 * 
 * Deze component integreert contextuele help in het TopicAwarenessReport component.
 * Het biedt tooltips voor verschillende secties van het rapport en trackt gebruikersinteracties
 * om de help-ervaring te personaliseren.
 * 
 * @component
 * @example
 * ```jsx
 * <TopicAwarenessReportHelp
 *   activeView="report"
 *   userRole="marketeer"
 *   experienceLevel="intermediate"
 * />
 * ```
 */
const TopicAwarenessReportHelp = ({
  activeView = 'report',
  userRole = 'general',
  experienceLevel = 'intermediate'
}) => {
  const theme = useTheme();

  // Effect om gebruikersgedrag te tracken
  useEffect(() => {
    // Track page view
    HelpRecommendationService.trackUserBehavior(
      HelpRecommendationService.USER_ACTIONS.VIEW_PAGE, 
      { activeView, userRole, experienceLevel }
    );
  }, [activeView, userRole, experienceLevel]);

  // Handler voor het klikken op een help-knop
  const handleHelpClick = (section) => {
    // Track help click
    HelpRecommendationService.trackUserBehavior(
      HelpRecommendationService.USER_ACTIONS.HELP_CLICK, 
      { activeView, section, userRole, experienceLevel }
    );
  };

  return (
    <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
      <Box sx={{ 
        p: 2, 
        bgcolor: theme.palette.background.paper, 
        borderRadius: 2,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        maxWidth: 280
      }}>
        <Typography variant="h6" gutterBottom>
          Rapport Help
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Klik op een sectie hieronder voor contextuele hulp bij het rapport.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <ReportTooltips section="executiveSummary">
            <Button 
              variant="text" 
              color="primary" 
              startIcon={<HelpIcon />}
              onClick={() => handleHelpClick('executiveSummary')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Executive Summary
            </Button>
          </ReportTooltips>
          
          <ReportTooltips section="awarenessDistribution">
            <Button 
              variant="text" 
              color="primary" 
              startIcon={<HelpIcon />}
              onClick={() => handleHelpClick('awarenessDistribution')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Awareness Distributie
            </Button>
          </ReportTooltips>
          
          <ReportTooltips section="topicDetails">
            <Button 
              variant="text" 
              color="primary" 
              startIcon={<HelpIcon />}
              onClick={() => handleHelpClick('topicDetails')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Topic Details
            </Button>
          </ReportTooltips>
          
          <ReportTooltips section="contentRecommendations">
            <Button 
              variant="text" 
              color="primary" 
              startIcon={<HelpIcon />}
              onClick={() => handleHelpClick('contentRecommendations')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Content Aanbevelingen
            </Button>
          </ReportTooltips>
          
          <ReportTooltips section="trendingTopics">
            <Button 
              variant="text" 
              color="primary" 
              startIcon={<HelpIcon />}
              onClick={() => handleHelpClick('trendingTopics')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Trending Topics
            </Button>
          </ReportTooltips>
          
          <ReportTooltips section="reportOptions">
            <Button 
              variant="text" 
              color="primary" 
              startIcon={<HelpIcon />}
              onClick={() => handleHelpClick('reportOptions')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Rapport Opties
            </Button>
          </ReportTooltips>
          
          <ReportTooltips section="privacyOptions">
            <Button 
              variant="text" 
              color="primary" 
              startIcon={<HelpIcon />}
              onClick={() => handleHelpClick('privacyOptions')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Privacy Opties
            </Button>
          </ReportTooltips>
          
          <ReportTooltips section="exportOptions">
            <Button 
              variant="text" 
              color="primary" 
              startIcon={<HelpIcon />}
              onClick={() => handleHelpClick('exportOptions')}
              sx={{ justifyContent: 'flex-start' }}
            >
              Export Opties
            </Button>
          </ReportTooltips>
        </Box>
      </Box>
    </Box>
  );
};

TopicAwarenessReportHelp.propTypes = {
  /**
   * De actieve view (dashboard, report, sentiment, trends)
   */
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends']),
  
  /**
   * De rol van de gebruiker
   */
  userRole: PropTypes.oneOf(['general', 'marketeer', 'product_manager', 'analyst']),
  
  /**
   * Het ervaringsniveau van de gebruiker
   */
  experienceLevel: PropTypes.oneOf(['beginner', 'intermediate', 'advanced'])
};

export default TopicAwarenessReportHelp;
