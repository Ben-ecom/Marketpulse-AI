import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Divider,
  Select,
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import { MdDownload, MdRefresh } from 'react-icons/md';

// Placeholder voor chart componenten
// In een echte implementatie zou je hier Chart.js, Recharts, of een andere visualisatie bibliotheek gebruiken
const ChartPlaceholder = ({ type, title, height = 300 }) => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.500', 'gray.300');
  
  return (
    <Box 
      height={`${height}px`} 
      bg={bgColor} 
      borderRadius="md" 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center"
      p={4}
    >
      <Text fontWeight="bold" mb={2}>{title}</Text>
      <Text color={textColor} fontSize="sm">
        {type} visualisatie zou hier worden weergegeven
      </Text>
      <Text color={textColor} fontSize="xs" mt={1}>
        (Implementeer met Chart.js of Recharts)
      </Text>
    </Box>
  );
};

/**
 * VisualizationsPanel component
 * 
 * Toont visualisaties van de marktanalyse, zoals marktsegmentatie,
 * concurrentiepositionering, en marktaandeel distributie.
 */
const VisualizationsPanel = ({ data }) => {
  const [chartType, setChartType] = React.useState('all');
  
  if (!data) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Geen visualisatiegegevens beschikbaar</Text>
          <Text fontSize="sm">Voer een marktanalyse uit om visualisaties te genereren</Text>
        </Box>
      </Alert>
    );
  }

  const { 
    marketSegmentation, 
    competitorPositioning, 
    marketShareDistribution,
    priceAnalysis,
    trends
  } = data;

  // Controleer of er visualisatiegegevens beschikbaar zijn
  const hasSegmentationData = marketSegmentation && 
    marketSegmentation.labels && 
    marketSegmentation.labels.length > 0;
    
  const hasPositioningData = competitorPositioning && 
    competitorPositioning.competitors && 
    competitorPositioning.competitors.length > 0;
    
  const hasMarketShareData = marketShareDistribution && 
    marketShareDistribution.labels && 
    marketShareDistribution.labels.length > 0;
    
  const hasPriceData = priceAnalysis && 
    priceAnalysis.data && 
    priceAnalysis.data.length > 0;
    
  const hasTrendsData = trends && 
    trends.data && 
    trends.data.length > 0;
  
  // Als er geen gegevens zijn voor visualisaties
  if (!hasSegmentationData && 
      !hasPositioningData && 
      !hasMarketShareData && 
      !hasPriceData && 
      !hasTrendsData) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Onvoldoende gegevens voor visualisaties</Text>
          <Text fontSize="sm">
            De huidige marktanalyse bevat niet genoeg gegevens om betekenisvolle visualisaties te genereren.
            Probeer de analyse uit te voeren met meer gedetailleerde marktgegevens.
          </Text>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={3}>
        <Heading size="md">Marktanalyse Visualisaties</Heading>
        <Flex>
          <Select 
            size="sm" 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
            mr={2}
            w="200px"
          >
            <option value="all">Alle visualisaties</option>
            <option value="segmentation">Marktsegmentatie</option>
            <option value="positioning">Concurrentiepositionering</option>
            <option value="marketShare">Marktaandeel</option>
            <option value="pricing">Prijsanalyse</option>
            <option value="trends">Trends</option>
          </Select>
          <Button 
            size="sm" 
            leftIcon={<MdDownload />} 
            colorScheme="blue" 
            variant="outline"
          >
            Exporteren
          </Button>
        </Flex>
      </Flex>
      <Divider mb={4} />
      
      <Text mb={4}>
        Deze visualisaties bieden een grafische weergave van de marktanalyse resultaten,
        waardoor inzichten gemakkelijker te interpreteren zijn.
      </Text>
      
      {chartType === 'all' ? (
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList mb={4} overflowX="auto" flexWrap="nowrap" css={{ scrollbarWidth: 'none' }}>
            {hasSegmentationData && <Tab>Marktsegmentatie</Tab>}
            {hasPositioningData && <Tab>Concurrentiepositionering</Tab>}
            {hasMarketShareData && <Tab>Marktaandeel</Tab>}
            {hasPriceData && <Tab>Prijsanalyse</Tab>}
            {hasTrendsData && <Tab>Trends</Tab>}
          </TabList>
          
          <TabPanels>
            {hasSegmentationData && (
              <TabPanel p={0}>
                <ChartPlaceholder 
                  type="Pie/Donut" 
                  title={marketSegmentation.title || "Marktsegmentatie"} 
                />
                <Text fontSize="sm" mt={2} color="gray.600">
                  Deze grafiek toont de verdeling van de markt over verschillende segmenten,
                  gebaseerd op {marketSegmentation.labels?.length || 0} geïdentificeerde segmenten.
                </Text>
              </TabPanel>
            )}
            
            {hasPositioningData && (
              <TabPanel p={0}>
                <ChartPlaceholder 
                  type="Scatter" 
                  title={competitorPositioning.title || "Concurrentiepositionering"} 
                />
                <Text fontSize="sm" mt={2} color="gray.600">
                  Deze grafiek toont de positionering van concurrenten op basis van 
                  {competitorPositioning.xAxis || 'prijs'} en {competitorPositioning.yAxis || 'kwaliteit'}.
                </Text>
              </TabPanel>
            )}
            
            {hasMarketShareData && (
              <TabPanel p={0}>
                <ChartPlaceholder 
                  type="Bar/Column" 
                  title={marketShareDistribution.title || "Marktaandeel Distributie"} 
                />
                <Text fontSize="sm" mt={2} color="gray.600">
                  Deze grafiek toont het marktaandeel van de verschillende spelers in de markt,
                  gebaseerd op {marketShareDistribution.labels?.length || 0} concurrenten.
                </Text>
              </TabPanel>
            )}
            
            {hasPriceData && (
              <TabPanel p={0}>
                <ChartPlaceholder 
                  type="Line/Range" 
                  title={priceAnalysis.title || "Prijsanalyse"} 
                />
                <Text fontSize="sm" mt={2} color="gray.600">
                  Deze grafiek toont de prijsverdelingen en -trends in de markt,
                  inclusief prijselasticiteit en optimale prijspunten.
                </Text>
              </TabPanel>
            )}
            
            {hasTrendsData && (
              <TabPanel p={0}>
                <ChartPlaceholder 
                  type="Line" 
                  title={trends.title || "Markttrends"} 
                />
                <Text fontSize="sm" mt={2} color="gray.600">
                  Deze grafiek toont de belangrijkste trends in de markt over tijd,
                  inclusief seizoensgebonden patronen en groeiprojecties.
                </Text>
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      ) : (
        <Box>
          {chartType === 'segmentation' && hasSegmentationData && (
            <Box>
              <ChartPlaceholder 
                type="Pie/Donut" 
                title={marketSegmentation.title || "Marktsegmentatie"} 
                height={400}
              />
              <Text fontSize="sm" mt={2} color="gray.600">
                Deze grafiek toont de verdeling van de markt over verschillende segmenten,
                gebaseerd op {marketSegmentation.labels?.length || 0} geïdentificeerde segmenten.
              </Text>
            </Box>
          )}
          
          {chartType === 'positioning' && hasPositioningData && (
            <Box>
              <ChartPlaceholder 
                type="Scatter" 
                title={competitorPositioning.title || "Concurrentiepositionering"} 
                height={400}
              />
              <Text fontSize="sm" mt={2} color="gray.600">
                Deze grafiek toont de positionering van concurrenten op basis van 
                {competitorPositioning.xAxis || 'prijs'} en {competitorPositioning.yAxis || 'kwaliteit'}.
              </Text>
            </Box>
          )}
          
          {chartType === 'marketShare' && hasMarketShareData && (
            <Box>
              <ChartPlaceholder 
                type="Bar/Column" 
                title={marketShareDistribution.title || "Marktaandeel Distributie"} 
                height={400}
              />
              <Text fontSize="sm" mt={2} color="gray.600">
                Deze grafiek toont het marktaandeel van de verschillende spelers in de markt,
                gebaseerd op {marketShareDistribution.labels?.length || 0} concurrenten.
              </Text>
            </Box>
          )}
          
          {chartType === 'pricing' && hasPriceData && (
            <Box>
              <ChartPlaceholder 
                type="Line/Range" 
                title={priceAnalysis.title || "Prijsanalyse"} 
                height={400}
              />
              <Text fontSize="sm" mt={2} color="gray.600">
                Deze grafiek toont de prijsverdelingen en -trends in de markt,
                inclusief prijselasticiteit en optimale prijspunten.
              </Text>
            </Box>
          )}
          
          {chartType === 'trends' && hasTrendsData && (
            <Box>
              <ChartPlaceholder 
                type="Line" 
                title={trends.title || "Markttrends"} 
                height={400}
              />
              <Text fontSize="sm" mt={2} color="gray.600">
                Deze grafiek toont de belangrijkste trends in de markt over tijd,
                inclusief seizoensgebonden patronen en groeiprojecties.
              </Text>
            </Box>
          )}
          
          {((chartType === 'segmentation' && !hasSegmentationData) ||
            (chartType === 'positioning' && !hasPositioningData) ||
            (chartType === 'marketShare' && !hasMarketShareData) ||
            (chartType === 'pricing' && !hasPriceData) ||
            (chartType === 'trends' && !hasTrendsData)) && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Geen gegevens beschikbaar</Text>
                <Text fontSize="sm">
                  Er zijn onvoldoende gegevens beschikbaar voor de geselecteerde visualisatie.
                </Text>
              </Box>
            </Alert>
          )}
        </Box>
      )}
      
      <Flex justify="flex-end" mt={4}>
        <Button 
          size="sm" 
          leftIcon={<MdRefresh />} 
          colorScheme="blue" 
          variant="ghost"
        >
          Vernieuwen
        </Button>
      </Flex>
    </Box>
  );
};

export default VisualizationsPanel;
