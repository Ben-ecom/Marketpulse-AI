import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import ABTestingService, { getTestVariant, trackConversion } from '../../services/ABTestingService';

import ContextualTooltip from './ContextualTooltip';
import TourGuide from './TourGuide';
import PersonalizedHelp from './PersonalizedHelp';

/**
 * ABTestHelpMethod Component
 * 
 * Een component dat verschillende help-methoden test via A/B testing.
 * De component toont één van de drie help-methoden op basis van de testgroep van de gebruiker
 * en meet de interactie om te bepalen welke methode het meest effectief is.
 * 
 * @component
 * @example
 * ```jsx
 * <ABTestHelpMethod
 *   activeView="dashboard"
 *   targetElement=".dashboard-header"
 *   title="Dashboard Help"
 *   content="Dit dashboard biedt een overzicht van alle topic awareness data en visualisaties."
 * />
 * ```
 */
const ABTestHelpMethod = ({
  activeView = 'dashboard',
  targetElement,
  title,
  content,
  videoUrl,
  learnMoreUrl,
  userRole = 'general',
  experienceLevel = 'intermediate',
  onRoleChange,
  onExperienceLevelChange,
  children
}) => {
  // Bepaal de testgroep van de gebruiker
  const testId = ABTestingService.tests.helpMethodTest.id;
  const variant = getTestVariant(testId, 3); // 3 varianten: 0, 1, 2
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSeverity, setFeedbackSeverity] = useState('info');
  
  // Track dat de help-methode is bekeken
  useEffect(() => {
    trackConversion(testId, 'view', { activeView, variant });
  }, [testId, activeView, variant]);
  
  // Handler voor het registreren van een klik
  const handleClick = () => {
    trackConversion(testId, 'click', { activeView, variant });
  };
  
  // Handler voor het registreren van voltooiing
  const handleComplete = () => {
    trackConversion(testId, 'complete', { activeView, variant });
    
    setFeedbackMessage('Bedankt voor het gebruiken van de help-functie. Was deze nuttig?');
    setFeedbackSeverity('info');
    setShowFeedback(true);
  };
  
  // Handler voor het geven van positieve feedback
  const handlePositiveFeedback = () => {
    trackConversion(testId, 'feedback_positive', { activeView, variant });
    
    setFeedbackMessage('Bedankt voor je feedback! We zijn blij dat de help-functie nuttig was.');
    setFeedbackSeverity('success');
    setShowFeedback(true);
  };
  
  // Handler voor het geven van negatieve feedback
  const handleNegativeFeedback = () => {
    trackConversion(testId, 'feedback_negative', { activeView, variant });
    
    setFeedbackMessage('Bedankt voor je feedback. We zullen de help-functie verbeteren.');
    setFeedbackSeverity('info');
    setShowFeedback(true);
  };
  
  // Handler voor het sluiten van de feedback snackbar
  const handleCloseFeedback = () => {
    setShowFeedback(false);
  };
  
  // Render de juiste help-methode op basis van de testgroep
  const renderHelpMethod = () => {
    switch (variant) {
      case 0: // Contextual Tooltips
        return (
          <ContextualTooltip
            title={title}
            content={content}
            videoUrl={videoUrl}
            learnMoreUrl={learnMoreUrl}
            onClick={handleClick}
          >
            {children || <Button variant="text" color="primary">Help</Button>}
          </ContextualTooltip>
        );
      
      case 1: // Tour Guide
        return (
          <>
            <TourGuide
              activeView={activeView}
              onComplete={handleComplete}
            />
            {children}
          </>
        );
      
      case 2: // Personalized Help
        return (
          <Box>
            <PersonalizedHelp
              activeView={activeView}
              userRole={userRole}
              experienceLevel={experienceLevel}
              onRoleChange={onRoleChange}
              onExperienceLevelChange={onExperienceLevelChange}
            />
            {children}
          </Box>
        );
      
      default:
        return children;
    }
  };
  
  return (
    <>
      {renderHelpMethod()}
      
      {/* Feedback snackbar */}
      <Snackbar
        open={showFeedback}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseFeedback} 
          severity={feedbackSeverity}
          action={
            feedbackSeverity === 'info' ? (
              <Box>
                <Button color="inherit" size="small" onClick={handlePositiveFeedback}>
                  Ja
                </Button>
                <Button color="inherit" size="small" onClick={handleNegativeFeedback}>
                  Nee
                </Button>
              </Box>
            ) : null
          }
        >
          {feedbackMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

ABTestHelpMethod.propTypes = {
  /**
   * De actieve view (dashboard, report, sentiment, trends)
   */
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends']),
  
  /**
   * Het target element voor de tour guide
   */
  targetElement: PropTypes.string,
  
  /**
   * De titel van de help-content
   */
  title: PropTypes.string,
  
  /**
   * De inhoud van de help-content
   */
  content: PropTypes.string,
  
  /**
   * URL naar een video tutorial
   */
  videoUrl: PropTypes.string,
  
  /**
   * URL naar meer informatie
   */
  learnMoreUrl: PropTypes.string,
  
  /**
   * De rol van de gebruiker
   */
  userRole: PropTypes.oneOf(['general', 'marketeer', 'product_manager', 'analyst']),
  
  /**
   * Het ervaringsniveau van de gebruiker
   */
  experienceLevel: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']),
  
  /**
   * Callback functie die wordt aangeroepen wanneer de rol verandert
   */
  onRoleChange: PropTypes.func,
  
  /**
   * Callback functie die wordt aangeroepen wanneer het ervaringsniveau verandert
   */
  onExperienceLevelChange: PropTypes.func,
  
  /**
   * De inhoud waarop de help-methode wordt toegepast
   */
  children: PropTypes.node
};

export default ABTestHelpMethod;
