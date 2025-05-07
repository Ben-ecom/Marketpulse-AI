import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, useTheme } from '@mui/material';
import HelpMenu from './HelpMenu';
import TopicAwarenessReportWithHelp from './TopicAwarenessReportWithHelp';
import { trackHelpInteraction } from '../../services/HelpRecommendationService';

/**
 * HelpIntegrationManager Component
 * 
 * Een component dat verantwoordelijk is voor het beheren van alle help-componenten
 * en het integreren ervan in de applicatie. Het houdt de help-status bij en zorgt
 * voor een consistente help-ervaring in de hele applicatie.
 * 
 * @component
 * @example
 * ```jsx
 * <HelpIntegrationManager
 *   activeView="report"
 *   faqItems={faqData}
 *   videos={videoData}
 *   userRole="marketeer"
 *   experienceLevel="intermediate"
 * />
 * ```
 */
const HelpIntegrationManager = ({
  activeView = 'dashboard',
  faqItems = [],
  videos = [],
  userRole = 'general',
  experienceLevel = 'intermediate',
  children
}) => {
  const theme = useTheme();
  const [helpSettings, setHelpSettings] = useState({
    showTooltips: true,
    showHelpMenu: true,
    enablePersonalizedHelp: true,
    enableTourGuide: true
  });
  
  // Laad help instellingen uit localStorage bij initialisatie
  useEffect(() => {
    const savedSettings = localStorage.getItem('helpSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setHelpSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings
        }));
      } catch (error) {
        console.error('Error parsing help settings:', error);
      }
    }
  }, []);
  
  // Sla help instellingen op in localStorage wanneer ze veranderen
  useEffect(() => {
    localStorage.setItem('helpSettings', JSON.stringify(helpSettings));
  }, [helpSettings]);
  
  // Handler voor het wijzigen van help instellingen
  const handleUpdateHelpSettings = (newSettings) => {
    setHelpSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
    
    // Track de wijziging voor personalisatie
    trackHelpInteraction({
      action: 'update_settings',
      settings: newSettings,
      activeView,
      userRole,
      experienceLevel
    });
  };
  
  // Handler voor het resetten van de tour
  const handleResetTour = () => {
    localStorage.removeItem('tourStatus');
    
    // Track de reset voor personalisatie
    trackHelpInteraction({
      action: 'reset_tour',
      activeView,
      userRole,
      experienceLevel
    });
  };
  
  // Handler voor het wijzigen van de gebruikersrol
  const handleRoleChange = (newRole) => {
    // Track de wijziging voor personalisatie
    trackHelpInteraction({
      action: 'change_role',
      oldRole: userRole,
      newRole,
      activeView,
      experienceLevel
    });
  };
  
  // Handler voor het wijzigen van het ervaringsniveau
  const handleExperienceLevelChange = (newLevel) => {
    // Track de wijziging voor personalisatie
    trackHelpInteraction({
      action: 'change_experience_level',
      oldLevel: experienceLevel,
      newLevel,
      activeView,
      userRole
    });
  };
  
  /**
   * Functie om de juiste help component te renderen voor een specifiek component
   * @param {React.ReactNode} component - Het component dat help nodig heeft
   * @param {string} componentType - Het type component (bijv. 'topicAwarenessReport')
   * @param {object} props - De props voor het component
   * @returns {React.ReactNode} - Het component met help functionaliteit
   */
  const renderComponentWithHelp = (component, componentType, props = {}) => {
    if (!helpSettings.showTooltips) {
      return component;
    }
    
    switch (componentType) {
      case 'topicAwarenessReport':
        return <TopicAwarenessReportWithHelp {...props} />;
      default:
        return component;
    }
  };
  
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Render de children met help functionaliteit indien nodig */}
      {children}
      
      {/* Render de HelpMenu component indien ingeschakeld */}
      {helpSettings.showHelpMenu && (
        <HelpMenu
          activeView={activeView}
          faqItems={faqItems}
          videos={videos}
          userRole={userRole}
          experienceLevel={experienceLevel}
          onResetTour={handleResetTour}
          onRoleChange={handleRoleChange}
          onExperienceLevelChange={handleExperienceLevelChange}
        />
      )}
    </Box>
  );
};

HelpIntegrationManager.propTypes = {
  /**
   * De actieve view (dashboard, report, sentiment, trends)
   */
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends']),
  
  /**
   * De lijst met FAQ items
   */
  faqItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      question: PropTypes.string.isRequired,
      answer: PropTypes.node.isRequired,
      category: PropTypes.string
    })
  ),
  
  /**
   * De lijst met videotutorials
   */
  videos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      thumbnail: PropTypes.string.isRequired,
      videoUrl: PropTypes.string.isRequired,
      category: PropTypes.string,
      duration: PropTypes.number
    })
  ),
  
  /**
   * De rol van de gebruiker
   */
  userRole: PropTypes.oneOf(['general', 'marketeer', 'product_manager', 'analyst']),
  
  /**
   * Het ervaringsniveau van de gebruiker
   */
  experienceLevel: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']),
  
  /**
   * De children componenten die worden gerenderd met help functionaliteit
   */
  children: PropTypes.node
};

export default HelpIntegrationManager;
