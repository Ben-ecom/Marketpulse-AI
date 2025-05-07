import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, useTheme, Fab } from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';

// Import help components
import HelpOverlayManager from './HelpOverlayManager';
import HelpMenu from './HelpMenu';
import ABTestHelpMethod from './ABTestHelpMethod';
import AdaptiveHelp from './AdaptiveHelp';
import OnboardingWizard from './OnboardingWizard';
import HelpFeedback from './HelpFeedback';
import UserExperienceFeedback from './UserExperienceFeedback';

// Import services and data
import { trackUserBehavior } from '../../services/HelpRecommendationService';
import { getHelpPointsForView } from '../../data/helpPointsData';
import { faqItems, videoTutorials } from '../../data/helpData';
import ABTestingService, { getTestVariant } from '../../services/ABTestingService';
import HelpInteractionService from '../../services/help/HelpInteractionService';

/**
 * IntegratedHelpSystem Component
 * 
 * Een component dat de verschillende help-componenten integreert en de meest geschikte
 * help-methode selecteert op basis van gebruikersgedrag en A/B-testen.
 * 
 * @component
 * @example
 * ```jsx
 * <IntegratedHelpSystem
 *   activeView="report"
 *   userRole="marketeer"
 *   experienceLevel="intermediate"
 * >
 *   <YourComponent />
 * </IntegratedHelpSystem>
 * ```
 */
const IntegratedHelpSystem = ({
  activeView = 'dashboard',
  userRole = 'marketeer',
  experienceLevel = 'intermediate',
  children
}) => {
  const theme = useTheme();
  const [helpMethod, setHelpMethod] = useState('standard'); // 'standard', 'abtest', 'adaptive'
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showUserFeedback, setShowUserFeedback] = useState(false);
  const [currentHelpItem, setCurrentHelpItem] = useState(null);
  const [userSettings, setUserSettings] = useState({
    userRole: localStorage.getItem('userRole') || userRole,
    experienceLevel: localStorage.getItem('experienceLevel') || experienceLevel
  });
  
  // Effect om te bepalen welke help-methode moet worden gebruikt
  useEffect(() => {
    // Controleer of de gebruiker nieuw is
    const isNewUser = localStorage.getItem('onboardingCompleted') !== 'true';
    
    // Controleer of de gebruiker al onboarding heeft gehad voor deze view
    const onboardedViews = JSON.parse(localStorage.getItem('onboardedViews') || '[]');
    const hasViewOnboarding = onboardedViews.includes(activeView);
    
    if (isNewUser || !hasViewOnboarding) {
      // Toon onboarding als de gebruiker nieuw is of deze view nog niet heeft gezien
      setShowOnboarding(true);
      return;
    }
    
    // Bepaal de help-methode op basis van A/B-test of gebruikersgedrag
    const testId = ABTestingService.tests.helpSystemTest.id;
    const variant = getTestVariant(testId, 3); // 3 varianten: 0, 1, 2
    
    switch (variant) {
      case 0:
        setHelpMethod('standard');
        break;
      case 1:
        setHelpMethod('abtest');
        break;
      case 2:
        setHelpMethod('adaptive');
        break;
      default:
        setHelpMethod('standard');
    }
  }, [activeView]);  // Voeg activeView toe aan de dependency array
  
  // Handler voor help interacties
  const handleHelpInteraction = (action, section, helpItemId = null, helpItemType = null) => {
    // Track de help interactie voor personalisatie
    trackUserBehavior(action, {
      section,
      activeView,
      userRole: userSettings.userRole,
      experienceLevel: userSettings.experienceLevel,
      helpMethod
    });
    
    // Registreer de interactie in de database
    HelpInteractionService.trackHelpInteraction({
      action,
      section,
      pageContext: activeView,
      userRole: userSettings.userRole,
      experienceLevel: userSettings.experienceLevel,
      helpMethod,
      helpItemId,
      helpItemType
    }).catch(error => {
      console.error('Fout bij registreren van help interactie:', error);
    });
    
    // Als de actie 'view' is en er is een helpItemId, toon dan de feedback optie
    if (action === 'view' && helpItemId) {
      setCurrentHelpItem({ id: helpItemId, type: helpItemType || 'general' });
      // Toon feedback na een korte vertraging om de gebruiker tijd te geven de content te lezen
      setTimeout(() => {
        setShowFeedback(true);
      }, 10000); // Toon feedback optie na 10 seconden
    }
  };
  
  // Handler voor het wijzigen van de gebruikersrol
  const handleRoleChange = (newRole) => {
    setUserSettings(prev => ({
      ...prev,
      userRole: newRole
    }));
    localStorage.setItem('userRole', newRole);
  };
  
  // Handler voor het wijzigen van het ervaringsniveau
  const handleExperienceLevelChange = (newLevel) => {
    setUserSettings(prev => ({
      ...prev,
      experienceLevel: newLevel
    }));
    localStorage.setItem('experienceLevel', newLevel);
  };
  
  // Handler voor het voltooien van de onboarding
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingCompleted', 'true');
    
    // Update de lijst met views waarvoor de gebruiker onboarding heeft gehad
    const onboardedViews = JSON.parse(localStorage.getItem('onboardedViews') || '[]');
    if (!onboardedViews.includes(activeView)) {
      onboardedViews.push(activeView);
      localStorage.setItem('onboardedViews', JSON.stringify(onboardedViews));
    }
    
    // Track onboarding completion
    trackUserBehavior('onboarding_complete', {
      activeView,
      userRole: userSettings.userRole,
      experienceLevel: userSettings.experienceLevel
    });
  };
  
  // Handler voor het overslaan van de onboarding
  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingCompleted', 'true');
    
    // Update de lijst met views waarvoor de gebruiker onboarding heeft gehad
    const onboardedViews = JSON.parse(localStorage.getItem('onboardedViews') || '[]');
    if (!onboardedViews.includes(activeView)) {
      onboardedViews.push(activeView);
      localStorage.setItem('onboardedViews', JSON.stringify(onboardedViews));
    }
    
    // Track onboarding skip
    trackUserBehavior('onboarding_skip', {
      activeView,
      userRole: userSettings.userRole,
      experienceLevel: userSettings.experienceLevel
    });
  };
  
  // Handler voor het sluiten van de feedback component
  const handleFeedbackClose = () => {
    setShowFeedback(false);
    setCurrentHelpItem(null);
  };
  
  // Handler voor het tonen van de gebruikersfeedback dialog
  const handleShowUserFeedback = () => {
    setShowUserFeedback(true);
    trackUserBehavior('open_user_feedback', {
      activeView,
      userRole: userSettings.userRole,
      experienceLevel: userSettings.experienceLevel,
      helpMethod
    });
  };

  // Render de juiste help-methode
  const renderHelpMethod = () => {
    // Als onboarding getoond moet worden, toon dan de OnboardingWizard
    if (showOnboarding) {
      return (
        <>
          <OnboardingWizard
            open={showOnboarding}
            activeView={activeView}
            onComplete={handleOnboardingComplete}
            onClose={handleOnboardingSkip}
          />
          {children}
        </>
      );
    }
    
    // Render de juiste help-methode op basis van de geselecteerde methode
    switch (helpMethod) {
      case 'abtest':
        return (
          <ABTestHelpMethod
            activeView={activeView}
            userRole={userSettings.userRole}
            experienceLevel={userSettings.experienceLevel}
            onRoleChange={handleRoleChange}
            onExperienceLevelChange={handleExperienceLevelChange}
          >
            {children}
          </ABTestHelpMethod>
        );
      
      case 'adaptive':
        return (
          <AdaptiveHelp
            activeView={activeView}
            userRole={userSettings.userRole}
            experienceLevel={userSettings.experienceLevel}
            onRoleChange={handleRoleChange}
            onExperienceLevelChange={handleExperienceLevelChange}
          >
            {children}
          </AdaptiveHelp>
        );
      
      case 'standard':
      default:
        return (
          <Box sx={{ position: 'relative' }}>
            <HelpOverlayManager
              activeView={activeView}
              helpPoints={getHelpPointsForView(activeView)}
              onHelpInteraction={handleHelpInteraction}
            >
              {children}
              
              {/* Feedback component */}
              {showFeedback && currentHelpItem && (
                <Box
                  sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                  }}
                >
                  <HelpFeedback
                    helpItemId={currentHelpItem.id}
                    helpItemType={currentHelpItem.type}
                    onClose={handleFeedbackClose}
                    userRole={userSettings.userRole}
                    experienceLevel={userSettings.experienceLevel}
                  />
                </Box>
              )}
            </HelpOverlayManager>
            
            {/* Help menu */}
            <HelpMenu
              activeView={activeView}
              faqItems={faqItems}
              videos={videoTutorials}
              userRole={userSettings.userRole}
              experienceLevel={userSettings.experienceLevel}
              onRoleChange={handleRoleChange}
              onExperienceLevelChange={handleExperienceLevelChange}
            />
          </Box>
        );
    }
  };
  
  return (
    <>
      {renderHelpMethod()}
      
      {/* User Experience Feedback Dialog */}
      <UserExperienceFeedback
        open={showUserFeedback}
        onClose={() => setShowUserFeedback(false)}
        pageContext={activeView}
        userRole={userSettings.userRole}
        experienceLevel={userSettings.experienceLevel}
        onSubmit={(rating, comments) => {
          // Registreer de gebruikerservaring feedback in de database
          HelpInteractionService.submitUserExperienceFeedback({
            pageContext: activeView,
            rating,
            userRole: userSettings.userRole,
            experienceLevel: userSettings.experienceLevel,
            comments
          }).catch(error => {
            console.error('Fout bij registreren van gebruikerservaring feedback:', error);
          });
        }}
      />

      {/* Feedback Fab Button */}
      <Fab
        color="secondary"
        size="medium"
        aria-label="feedback"
        onClick={handleShowUserFeedback}
        sx={{
          position: 'fixed',
          bottom: 80, // Positie boven de help knop
          right: 16,
          zIndex: 1100,
        }}
      >
        <FeedbackIcon />
      </Fab>
    </>  
  );
};

IntegratedHelpSystem.propTypes = {
  /**
   * De actieve view (dashboard, report, sentiment, trends, awareness, market-insights)
   */
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends', 'awareness', 'market-insights']),
  
  /**
   * De rol van de gebruiker
   */
  userRole: PropTypes.oneOf(['general', 'marketeer', 'product_manager', 'analyst']),
  
  /**
   * Het ervaringsniveau van de gebruiker
   */
  experienceLevel: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']),
  
  /**
   * De children componenten waarop de help-functionaliteit wordt toegepast
   */
  children: PropTypes.node
};

export default IntegratedHelpSystem;
