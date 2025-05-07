import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Flex, 
  Tabs, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel, 
  Badge, 
  Card, 
  CardHeader, 
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  Button
} from '@chakra-ui/react';
import { DownloadIcon, RepeatIcon } from '@chakra-ui/icons';

import MarketOverviewPanel from './panels/MarketOverviewPanel';
import CompetitorsPanel from './panels/CompetitorsPanel';
import OpportunitiesPanel from './panels/OpportunitiesPanel';
import RecommendationsPanel from './panels/RecommendationsPanel';
import VisualizationsPanel from './panels/VisualizationsPanel';

/**
 * MarketResearchResults component
 * 
 * Toont de resultaten van een marktonderzoeksanalyse met verschillende panelen
 * voor marktoverzicht, concurrenten, kansen, aanbevelingen en visualisaties.
 */
const MarketResearchResults = ({ 
  results, 
  isLoading, 
  error, 
  onSaveReport, 
  onRefreshAnalysis 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Als er wordt geladen, toon een spinner
  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text mt={4} fontSize="lg">Marktanalyse wordt uitgevoerd...</Text>
        <Text fontSize="sm" color="gray.500">Dit kan enkele momenten duren</Text>
      </Box>
    );
  }
  
  // Als er een fout is, toon een foutmelding
  if (error) {
    return (
      <Alert status="error" borderRadius="md" mb={4}>
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Er is een fout opgetreden</Text>
          <Text fontSize="sm">{error}</Text>
        </Box>
      </Alert>
    );
  }
  
  // Als er geen resultaten zijn, toon een melding
  if (!results) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Geen resultaten beschikbaar</Text>
          <Text fontSize="sm">Voer een marktanalyse uit om resultaten te bekijken</Text>
        </Box>
      </Alert>
    );
  }
  
  // Bereken de betrouwbaarheidsscore
  const confidenceScore = results.metadata?.confidence || 0;
  const confidenceColor = 
    confidenceScore >= 0.7 ? 'green' : 
    confidenceScore >= 0.4 ? 'yellow' : 
    'red';
  
  return (
    <Box>
      <Card mb={4} variant="outline">
        <CardHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="md">Marktonderzoek Resultaten</Heading>
              <Text color="gray.500" fontSize="sm">
                Gegenereerd op {new Date(results.metadata?.timestamp).toLocaleString()}
              </Text>
            </Box>
            <Flex>
              <Badge colorScheme={confidenceColor} mr={2} p={1}>
                Betrouwbaarheid: {Math.round(confidenceScore * 100)}%
              </Badge>
              <Button 
                size="sm" 
                leftIcon={<DownloadIcon />} 
                colorScheme="blue" 
                variant="outline"
                onClick={onSaveReport}
                mr={2}
              >
                Opslaan
              </Button>
              <Button 
                size="sm" 
                leftIcon={<RepeatIcon />} 
                colorScheme="blue" 
                onClick={onRefreshAnalysis}
              >
                Vernieuwen
              </Button>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody>
          <Text mb={4}>
            Deze analyse is gebaseerd op {results.metadata?.dataPoints || 0} datapunten 
            en biedt inzicht in marktomvang, segmentatie, concurrentie, en kansen.
          </Text>
          
          <Tabs 
            variant="enclosed" 
            colorScheme="blue" 
            onChange={(index) => setActiveTab(index)}
            defaultIndex={activeTab}
          >
            <TabList>
              <Tab>Marktoverzicht</Tab>
              <Tab>Concurrenten</Tab>
              <Tab>Kansen</Tab>
              <Tab>Aanbevelingen</Tab>
              <Tab>Visualisaties</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <MarketOverviewPanel data={results.marketOverview} />
              </TabPanel>
              
              <TabPanel>
                <CompetitorsPanel data={results.competitorAnalysis} />
              </TabPanel>
              
              <TabPanel>
                <OpportunitiesPanel data={results.gapOpportunities} />
              </TabPanel>
              
              <TabPanel>
                <RecommendationsPanel data={results.recommendations} />
              </TabPanel>
              
              <TabPanel>
                <VisualizationsPanel data={results.visualizationData} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Box>
  );
};

export default MarketResearchResults;
