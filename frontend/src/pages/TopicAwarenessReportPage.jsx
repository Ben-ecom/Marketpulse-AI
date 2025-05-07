import React, { useState, useEffect } from 'react';
import { Box, Container, CircularProgress, Typography, useTheme } from '@mui/material';
import TopicAwarenessReport from '../components/integrated/TopicAwarenessReport';
import HelpOverlayManager from '../components/help/HelpOverlayManager';
import HelpMenu from '../components/help/HelpMenu';
import { getHelpPointsForView } from '../data/helpPointsData';
import { faqItems, videoTutorials } from '../data/helpData';
import { trackHelpInteraction } from '../services/HelpRecommendationService';

/**
 * TopicAwarenessReportPage
 * 
 * Een pagina die het TopicAwarenessReport component weergeeft met geïntegreerde help-functionaliteit.
 * Deze pagina gebruikt de HelpOverlayManager om contextuele help te bieden zonder het 
 * TopicAwarenessReport component zelf te wijzigen.
 */
const TopicAwarenessReportPage = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [userSettings, setUserSettings] = useState({
    userRole: localStorage.getItem('userRole') || 'marketeer',
    experienceLevel: localStorage.getItem('experienceLevel') || 'intermediate'
  });
  
  // Laad rapport data
  useEffect(() => {
    // Simuleer het laden van data van een API
    const loadData = async () => {
      try {
        // In een echte applicatie zou dit een API call zijn
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Voorbeeld data
        setReportData({
          topicsByPhase: {
            unaware: [
              { id: 1, name: 'Gezond eten', score: 85 },
              { id: 2, name: 'Duurzaamheid', score: 78 },
              { id: 3, name: 'Biologisch', score: 72 }
            ],
            problemAware: [
              { id: 4, name: 'Voedselverspilling', score: 90 },
              { id: 5, name: 'Plastic verpakkingen', score: 85 },
              { id: 6, name: 'Lokale producten', score: 80 }
            ],
            solutionAware: [
              { id: 7, name: 'Verpakkingsvrij', score: 88 },
              { id: 8, name: 'Seizoensgroenten', score: 82 },
              { id: 9, name: 'Korte keten', score: 75 }
            ],
            productAware: [
              { id: 10, name: 'Biologische supermarkt', score: 92 },
              { id: 11, name: 'Boerenmarkt', score: 86 },
              { id: 12, name: 'Verpakkingsvrije winkel', score: 80 }
            ],
            mostAware: [
              { id: 13, name: 'Zero waste levensstijl', score: 95 },
              { id: 14, name: 'Duurzame voedselkeuzes', score: 90 },
              { id: 15, name: 'Circulaire economie', score: 85 }
            ]
          },
          awarenessDistribution: [
            { name: 'Unaware', value: 25 },
            { name: 'Problem Aware', value: 30 },
            { name: 'Solution Aware', value: 20 },
            { name: 'Product Aware', value: 15 },
            { name: 'Most Aware', value: 10 }
          ],
          contentRecommendations: {
            unaware: [
              "Creëer content over de voordelen van gezond eten zonder specifieke producten te noemen",
              "Maak informatieve content over duurzaamheid in het algemeen",
              "Deel feiten en statistieken over de impact van voedselkeuzes op gezondheid en milieu"
            ],
            problemAware: [
              "Belicht de problemen van voedselverspilling en hoe dit impact heeft op het milieu",
              "Creëer content over de nadelen van plastic verpakkingen",
              "Bespreek de voordelen van lokale producten voor de gemeenschap en economie"
            ],
            solutionAware: [
              "Vergelijk verschillende oplossingen voor verpakkingsvrij winkelen",
              "Deel informatie over seizoensgroenten en hun voordelen",
              "Leg uit hoe korte ketens werken en waarom ze belangrijk zijn"
            ],
            productAware: [
              "Vergelijk verschillende biologische supermarkten en hun aanbod",
              "Deel ervaringen van klanten met boerenmarkten",
              "Bied een gids voor verpakkingsvrije winkels in de regio"
            ],
            mostAware: [
              "Deel geavanceerde tips voor een zero waste levensstijl",
              "Creëer diepgaande content over duurzame voedselkeuzes",
              "Bespreek de rol van consumenten in de circulaire economie"
            ]
          },
          trendingTopics: [
            { id: 1, name: 'Verpakkingsvrij winkelen', growth: '+45%', score: 92 },
            { id: 2, name: 'Lokale seizoensproducten', growth: '+38%', score: 88 },
            { id: 3, name: 'Biologische supermarkten', growth: '+32%', score: 85 },
            { id: 4, name: 'Zero waste levensstijl', growth: '+30%', score: 82 },
            { id: 5, name: 'Duurzame voedselbezorging', growth: '+25%', score: 78 }
          ]
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading report data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handler voor help interacties
  const handleHelpInteraction = (action, section) => {
    // Track de help interactie voor personalisatie
    trackHelpInteraction({
      action,
      section,
      activeView: 'report',
      userRole: userSettings.userRole,
      experienceLevel: userSettings.experienceLevel
    });
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
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : reportData ? (
        <Box sx={{ position: 'relative' }}>
          {/* Help overlay met het TopicAwarenessReport component */}
          <HelpOverlayManager
            activeView="report"
            helpPoints={getHelpPointsForView('report')}
            onHelpInteraction={handleHelpInteraction}
          >
            <TopicAwarenessReport
              topicsByPhase={reportData.topicsByPhase}
              awarenessDistribution={reportData.awarenessDistribution}
              contentRecommendations={reportData.contentRecommendations}
              trendingTopics={reportData.trendingTopics}
              projectName="Duurzame Voeding"
              isLoading={isLoading}
            />
          </HelpOverlayManager>
          
          {/* Help menu */}
          <HelpMenu
            activeView="report"
            faqItems={faqItems}
            videos={videoTutorials}
            userRole={userSettings.userRole}
            experienceLevel={userSettings.experienceLevel}
            onRoleChange={handleRoleChange}
            onExperienceLevelChange={handleExperienceLevelChange}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Typography variant="h6" color="error">
            Er is een fout opgetreden bij het laden van de rapportgegevens.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default TopicAwarenessReportPage;
