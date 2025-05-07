import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Badge,
  Divider,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Icon,
  HStack,
  Tag,
  TagLabel
} from '@chakra-ui/react';
import { 
  MdLightbulbOutline, 
  MdWarning, 
  MdTrendingUp,
  MdPriorityHigh
} from 'react-icons/md';

/**
 * OpportunitiesPanel component
 * 
 * Toont geïdentificeerde marktkansen en gaps met scores en potentiële marktomvang.
 */
const OpportunitiesPanel = ({ data }) => {
  if (!data) {
    return (
      <Box p={4} bg="gray.50" borderRadius="md">
        <Text>Geen kansen en gaps beschikbaar</Text>
      </Box>
    );
  }

  // Formateer de marktomvang (bijv. €10M)
  const formatMarketSize = (size) => {
    if (!size && size !== 0) return 'Onbekend';
    
    if (size >= 1000000000) {
      return `€${(size / 1000000000).toFixed(1)}B`;
    } else if (size >= 1000000) {
      return `€${(size / 1000000).toFixed(1)}M`;
    } else if (size >= 1000) {
      return `€${(size / 1000).toFixed(1)}K`;
    }
    return `€${size.toFixed(0)}`;
  };

  // Bepaal de kleur voor de risico badge
  const getRiskColor = (risk) => {
    switch(risk?.toLowerCase()) {
      case 'high':
      case 'hoog':
        return 'red';
      case 'medium':
      case 'gemiddeld':
        return 'yellow';
      case 'low':
      case 'laag':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Haal de kansen en gaps op
  const opportunities = data.opportunities || [];
  const gaps = data.gaps || [];
  const potentialMarketSize = data.potentialMarketSize || 0;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={3}>
        <Heading size="md">Marktkansen</Heading>
        <Stat textAlign="right" width="auto">
          <StatLabel fontSize="sm">Potentiële Marktomvang</StatLabel>
          <StatNumber>{formatMarketSize(potentialMarketSize)}</StatNumber>
          <StatHelpText>Geïdentificeerde kansen</StatHelpText>
        </Stat>
      </Flex>
      <Divider mb={4} />
      
      <Text mb={4}>
        Deze analyse identificeert onbenutte kansen en gaps in de markt op basis van 
        marktomvang, segmentatie en concurrentieanalyse.
      </Text>
      
      {opportunities.length > 0 ? (
        <Box mb={6}>
          <Heading size="sm" mb={3} display="flex" alignItems="center">
            <Icon as={MdLightbulbOutline} mr={2} />
            Top Kansen
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {opportunities.map((opportunity, index) => (
              <Card key={index} variant="outline">
                <CardHeader bg="blue.50" py={2}>
                  <Flex justify="space-between" align="center">
                    <Heading size="xs">{opportunity.name}</Heading>
                    <HStack spacing={2}>
                      <Badge colorScheme={getRiskColor(opportunity.riskLevel)} p={1}>
                        {opportunity.riskLevel || 'Onbekend risico'}
                      </Badge>
                      <Badge colorScheme="blue" p={1}>
                        Score: {opportunity.score ? (opportunity.score * 10).toFixed(1) : 'N/A'}/10
                      </Badge>
                    </HStack>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Text fontSize="sm" mb={2}>{opportunity.description}</Text>
                  
                  <Flex justify="space-between" align="center" mt={3}>
                    <Text fontSize="xs" color="gray.600">
                      Potentiële omvang: {formatMarketSize(opportunity.potentialMarketSize)}
                    </Text>
                    
                    {opportunity.tags && opportunity.tags.length > 0 && (
                      <HStack spacing={1}>
                        {opportunity.tags.map((tag, i) => (
                          <Tag size="sm" key={i} colorScheme="blue" variant="subtle">
                            <TagLabel>{tag}</TagLabel>
                          </Tag>
                        ))}
                      </HStack>
                    )}
                  </Flex>
                  
                  {opportunity.score && (
                    <Progress 
                      value={opportunity.score * 100} 
                      size="xs" 
                      colorScheme="blue" 
                      mt={2}
                    />
                  )}
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      ) : (
        <Box p={4} bg="gray.50" borderRadius="md" mb={6}>
          <Text>Geen specifieke kansen geïdentificeerd</Text>
        </Box>
      )}
      
      {gaps.length > 0 && (
        <Box>
          <Heading size="sm" mb={3} display="flex" alignItems="center">
            <Icon as={MdWarning} mr={2} />
            Geïdentificeerde Marktgaps
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {gaps.map((gap, index) => (
              <Card key={index} variant="outline">
                <CardHeader bg="orange.50" py={2}>
                  <Flex justify="space-between" align="center">
                    <Heading size="xs">{gap.name}</Heading>
                    <Badge colorScheme="orange" p={1}>
                      Score: {gap.score ? (gap.score * 10).toFixed(1) : 'N/A'}/10
                    </Badge>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Text fontSize="sm" mb={2}>{gap.description}</Text>
                  
                  {gap.segment && (
                    <Text fontSize="xs" color="gray.600" mt={2}>
                      Segment: {gap.segment}
                    </Text>
                  )}
                  
                  {gap.marketSize && (
                    <Text fontSize="xs" color="gray.600" mt={1}>
                      Geschatte omvang: {formatMarketSize(gap.marketSize)}
                    </Text>
                  )}
                  
                  {gap.score && (
                    <Progress 
                      value={gap.score * 100} 
                      size="xs" 
                      colorScheme="orange" 
                      mt={2}
                    />
                  )}
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}
      
      {opportunities.length === 0 && gaps.length === 0 && (
        <Box 
          p={4} 
          bg="yellow.50" 
          borderRadius="md" 
          display="flex" 
          alignItems="center"
        >
          <Icon as={MdPriorityHigh} mr={2} color="yellow.500" />
          <Text>
            Er zijn geen specifieke kansen of gaps geïdentificeerd in de huidige marktanalyse.
            Dit kan komen door beperkte gegevens of een verzadigde markt.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default OpportunitiesPanel;
