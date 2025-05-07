import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import ContextualTooltip from './ContextualTooltip';

/**
 * ReportTooltips Component
 * 
 * Deze component biedt contextuele tooltips voor verschillende secties van het TopicAwarenessReport.
 * Het is ontworpen om te worden gebruikt als een wrapper rond bestaande componenten om contextuele hulp te bieden.
 * 
 * @component
 * @example
 * ```jsx
 * <ReportTooltips
 *   section="executiveSummary"
 * >
 *   <Typography variant="h5" component="h2">
 *     Executive Summary
 *   </Typography>
 * </ReportTooltips>
 * ```
 */
const ReportTooltips = ({ section, children }) => {
  // Configuratie voor verschillende secties
  const tooltipConfig = {
    executiveSummary: {
      title: "Executive Summary",
      content: "De Executive Summary geeft een beknopt overzicht van de belangrijkste inzichten uit de topic awareness analyse. Het is ontworpen voor besluitvormers die snel de kernpunten willen begrijpen zonder in details te duiken.",
      videoUrl: "https://example.com/videos/executive-summary-tutorial.mp4",
      learnMoreUrl: "https://docs.example.com/topic-awareness/executive-summary"
    },
    topicDetails: {
      title: "Topic Details per Awareness Fase",
      content: "Deze sectie toont de belangrijkste topics per awareness fase. Hiermee kun je zien welke onderwerpen relevant zijn in elke fase van de customer journey, van Unaware tot Most Aware.",
      videoUrl: "https://example.com/videos/topic-details-tutorial.mp4",
      learnMoreUrl: "https://docs.example.com/topic-awareness/topic-details"
    },
    awarenessDistribution: {
      title: "Awareness Distributie",
      content: "Deze visualisatie toont de verdeling van topics over de verschillende awareness fasen. Dit geeft inzicht in waar je doelgroep zich bevindt in hun customer journey en waar je content strategie op moet focussen.",
      videoUrl: "https://example.com/videos/awareness-distribution-tutorial.mp4",
      learnMoreUrl: "https://docs.example.com/topic-awareness/awareness-distribution"
    },
    contentRecommendations: {
      title: "Content Aanbevelingen",
      content: "Deze sectie bevat specifieke content aanbevelingen voor elke awareness fase. Gebruik deze suggesties om content te creëren die aansluit bij de behoeften van je doelgroep in elke fase van hun journey.",
      videoUrl: "https://example.com/videos/content-recommendations-tutorial.mp4",
      learnMoreUrl: "https://docs.example.com/topic-awareness/content-recommendations"
    },
    trendingTopics: {
      title: "Trending Topics",
      content: "Deze sectie toont de topics die het snelst in populariteit stijgen. Gebruik deze inzichten om in te spelen op opkomende trends en je content strategie aan te passen aan veranderende interesses.",
      videoUrl: "https://example.com/videos/trending-topics-tutorial.mp4",
      learnMoreUrl: "https://docs.example.com/topic-awareness/trending-topics"
    },
    reportOptions: {
      title: "Rapport Opties",
      content: "Pas hier de inhoud en opmaak van je rapport aan. Je kunt secties toevoegen of verwijderen, productinformatie aanpassen en privacy-instellingen beheren om het rapport af te stemmen op je specifieke behoeften.",
      videoUrl: "https://example.com/videos/report-options-tutorial.mp4",
      learnMoreUrl: "https://docs.example.com/topic-awareness/report-options"
    },
    privacyOptions: {
      title: "Privacy Opties",
      content: "Beheer hier de privacy-instellingen voor je rapport. Je kunt kiezen om persoonlijke gegevens te includeren of te anonimiseren om te voldoen aan privacy-regelgeving zoals de AVG/GDPR.",
      videoUrl: "https://example.com/videos/privacy-options-tutorial.mp4",
      learnMoreUrl: "https://docs.example.com/topic-awareness/privacy-options"
    },
    exportOptions: {
      title: "Export Opties",
      content: "Exporteer je rapport in verschillende formaten zoals PDF of Excel. Je kunt het rapport delen met stakeholders of gebruiken voor presentaties en strategische planning.",
      videoUrl: "https://example.com/videos/export-options-tutorial.mp4",
      learnMoreUrl: "https://docs.example.com/topic-awareness/export-options"
    }
  };

  // Als de sectie niet bestaat, geef de children terug zonder tooltip
  if (!tooltipConfig[section]) {
    return children;
  }

  // Haal de configuratie op voor de specifieke sectie
  const { title, content, videoUrl, learnMoreUrl } = tooltipConfig[section];

  // Geef de ContextualTooltip terug met de juiste configuratie
  return (
    <ContextualTooltip
      title={title}
      content={content}
      videoUrl={videoUrl}
      learnMoreUrl={learnMoreUrl}
    >
      {children}
    </ContextualTooltip>
  );
};

ReportTooltips.propTypes = {
  /**
   * De sectie van het rapport waarvoor de tooltip wordt getoond
   */
  section: PropTypes.oneOf([
    'executiveSummary',
    'topicDetails',
    'awarenessDistribution',
    'contentRecommendations',
    'trendingTopics',
    'reportOptions',
    'privacyOptions',
    'exportOptions'
  ]).isRequired,
  
  /**
   * De inhoud waarop de tooltip wordt toegepast
   */
  children: PropTypes.node.isRequired
};

export default ReportTooltips;
