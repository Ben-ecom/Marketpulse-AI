import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import TopicAwarenessReport from '../integrated/TopicAwarenessReport';
import ReportTooltips from './ReportTooltips';
import ContextualTooltip from './ContextualTooltip';

/**
 * TopicAwarenessReportWithHelp Component
 * 
 * Een wrapper component dat help-functionaliteit toevoegt aan het TopicAwarenessReport component.
 * Het biedt contextuele tooltips voor verschillende secties van het rapport en een help-knop
 * voor toegang tot meer gedetailleerde hulp.
 * 
 * @component
 * @example
 * ```jsx
 * <TopicAwarenessReportWithHelp
 *   topicsByPhase={topicsByPhase}
 *   awarenessDistribution={awarenessDistribution}
 *   contentRecommendations={contentRecommendations}
 *   trendingTopics={trendingTopics}
 *   projectName="MarketPulse AI"
 *   isLoading={false}
 * />
 * ```
 */
const TopicAwarenessReportWithHelp = (props) => {
  const theme = useTheme();
  const [showHelp, setShowHelp] = useState(false);
  const [activeHelpSection, setActiveHelpSection] = useState(null);
  
  // Help secties met hun beschrijvingen
  const helpSections = {
    executiveSummary: {
      title: "Executive Summary",
      description: "De Executive Summary geeft een beknopt overzicht van de belangrijkste inzichten uit de topic awareness analyse. Het is ontworpen voor besluitvormers die snel de kernpunten willen begrijpen zonder in details te duiken."
    },
    topicDetails: {
      title: "Topic Details",
      description: "Deze sectie toont de belangrijkste topics per awareness fase. Hiermee kun je zien welke onderwerpen relevant zijn in elke fase van de customer journey, van Unaware tot Most Aware."
    },
    awarenessDistribution: {
      title: "Awareness Distributie",
      description: "Deze visualisatie toont de verdeling van topics over de verschillende awareness fasen. Dit geeft inzicht in waar je doelgroep zich bevindt in hun customer journey en waar je content strategie op moet focussen."
    },
    contentRecommendations: {
      title: "Content Aanbevelingen",
      description: "Deze sectie bevat specifieke content aanbevelingen voor elke awareness fase. Gebruik deze suggesties om content te creëren die aansluit bij de behoeften van je doelgroep in elke fase van hun journey."
    },
    trendingTopics: {
      title: "Trending Topics",
      description: "Deze sectie toont de topics die het snelst in populariteit stijgen. Gebruik deze inzichten om in te spelen op opkomende trends en je content strategie aan te passen aan veranderende interesses."
    },
    reportOptions: {
      title: "Rapport Opties",
      description: "Pas hier de inhoud en opmaak van je rapport aan. Je kunt secties toevoegen of verwijderen, productinformatie aanpassen en privacy-instellingen beheren om het rapport af te stemmen op je specifieke behoeften."
    },
    exportOptions: {
      title: "Export Opties",
      description: "Exporteer je rapport in verschillende formaten zoals PDF of Excel. Je kunt het rapport delen met stakeholders of gebruiken voor presentaties en strategische planning."
    }
  };
  
  // Handler voor het tonen van help voor een specifieke sectie
  const handleShowHelp = (section) => {
    setActiveHelpSection(section);
    setShowHelp(true);
  };
  
  // Handler voor het verbergen van help
  const handleHideHelp = () => {
    setShowHelp(false);
    setActiveHelpSection(null);
  };
  
  // Effect om help automatisch te verbergen na een bepaalde tijd
  useEffect(() => {
    if (showHelp) {
      const timer = setTimeout(() => {
        handleHideHelp();
      }, 5000); // Verberg help na 5 seconden
      
      return () => clearTimeout(timer);
    }
  }, [showHelp, activeHelpSection]);
  
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Help knop */}
      <Tooltip title="Toon help">
        <IconButton
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1000,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            }
          }}
          onClick={() => handleShowHelp('report')}
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>
      
      {/* Help overlay voor specifieke secties */}
      {showHelp && activeHelpSection && helpSections[activeHelpSection] && (
        <Box
          sx={{
            position: 'absolute',
            top: 70,
            right: 16,
            zIndex: 1000,
            maxWidth: 300,
            p: 2,
            bgcolor: theme.palette.background.paper,
            borderRadius: 1,
            boxShadow: 3,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <ContextualTooltip
            title={helpSections[activeHelpSection].title}
            content={helpSections[activeHelpSection].description}
            videoUrl={`https://example.com/videos/${activeHelpSection}-tutorial.mp4`}
            learnMoreUrl={`https://docs.example.com/topic-awareness/${activeHelpSection}`}
          >
            <Box>
              <Box sx={{ fontWeight: 'bold', mb: 1 }}>
                {helpSections[activeHelpSection].title}
              </Box>
              <Box>
                {helpSections[activeHelpSection].description}
              </Box>
            </Box>
          </ContextualTooltip>
        </Box>
      )}
      
      {/* Originele TopicAwarenessReport component */}
      <TopicAwarenessReport {...props} />
      
      {/* Help markers voor verschillende secties */}
      <Box
        sx={{
          position: 'absolute',
          top: 120,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {Object.keys(helpSections).map((section) => (
          <Tooltip key={section} title={helpSections[section].title}>
            <IconButton
              size="small"
              sx={{
                bgcolor: theme.palette.grey[200],
                '&:hover': {
                  bgcolor: theme.palette.primary.light,
                }
              }}
              onClick={() => handleShowHelp(section)}
            >
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

TopicAwarenessReportWithHelp.propTypes = {
  /**
   * Object met topics per awareness fase. De sleutels zijn de awareness fase IDs
   * en de waarden zijn arrays van topic objecten.
   */
  topicsByPhase: PropTypes.object,
  
  /**
   * Array met awareness distributie data. Bevat informatie over de verdeling van
   * topics over de verschillende awareness fasen.
   */
  awarenessDistribution: PropTypes.array,
  
  /**
   * Object met content aanbevelingen per awareness fase. De sleutels zijn de awareness fase IDs
   * en de waarden zijn arrays van aanbevelingsobjecten specifiek voor die fase.
   */
  contentRecommendations: PropTypes.object,
  
  /**
   * Array met trending topics data. Bevat informatie over de meest trending topics
   * in de dataset, inclusief scores en groeipercentages.
   */
  trendingTopics: PropTypes.array,
  
  /** 
   * Naam van het project waarvoor het rapport wordt gegenereerd 
   */
  projectName: PropTypes.string,
  
  /** 
   * Geeft aan of de data nog wordt geladen 
   */
  isLoading: PropTypes.bool
};

export default TopicAwarenessReportWithHelp;
