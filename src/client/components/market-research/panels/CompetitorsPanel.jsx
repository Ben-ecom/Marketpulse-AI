import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Badge,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  List,
  ListItem,
  ListIcon,
  Tag,
  TagLabel,
  TagLeftIcon,
  HStack,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { 
  MdCheckCircle, 
  MdCancel, 
  MdTrendingUp, 
  MdTrendingDown,
  MdStar,
  MdStarBorder
} from 'react-icons/md';

/**
 * CompetitorsPanel component
 * 
 * Toont een overzicht van concurrenten, hun marktaandeel, positionering en SWOT-analyse.
 */
const CompetitorsPanel = ({ data }) => {
  if (!data) {
    return (
      <Box p={4} bg="gray.50" borderRadius="md">
        <Text>Geen concurrentiegegevens beschikbaar</Text>
      </Box>
    );
  }

  // Formateer het marktaandeel als percentage
  const formatMarketShare = (share) => {
    if (typeof share === 'number') {
      return `${(share * 100).toFixed(1)}%`;
    }
    return 'Onbekend';
  };

  // Bepaal de kleur voor de marktconcentratie badge
  const getConcentrationColor = (concentration) => {
    switch(concentration?.toLowerCase()) {
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

  // Haal de top concurrenten op
  const topCompetitors = data.competitors?.slice(0, 5) || [];
  const marketShareData = data.marketShare?.marketShares || {};
  const concentration = data.marketShare?.concentration || 'unknown';

  return (
    <Box>
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={3}>
          <Heading size="md">Concurrentieoverzicht</Heading>
          <Badge colorScheme={getConcentrationColor(concentration)} p={1}>
            Concentratie: {concentration}
          </Badge>
        </Flex>
        <Divider mb={3} />
        
        <Text mb={4}>
          Deze analyse toont de belangrijkste concurrenten in de markt, hun marktaandeel,
          positionering en concurrentievoordelen.
        </Text>
        
        {topCompetitors.length > 0 ? (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Concurrent</Th>
                <Th isNumeric>Marktaandeel</Th>
                <Th>Positionering</Th>
                <Th>Voordelen</Th>
              </Tr>
            </Thead>
            <Tbody>
              {topCompetitors.map((competitor, index) => (
                <Tr key={index}>
                  <Td fontWeight={competitor.isOwn ? "bold" : "normal"}>
                    {competitor.name}
                    {competitor.isOwn && <Badge ml={2} colorScheme="blue">Eigen</Badge>}
                  </Td>
                  <Td isNumeric>
                    {formatMarketShare(competitor.marketShare)}
                    <Progress 
                      value={competitor.marketShare * 100} 
                      size="xs" 
                      colorScheme={competitor.isOwn ? "blue" : "gray"} 
                      mt={1}
                    />
                  </Td>
                  <Td>
                    {competitor.positioning ? (
                      <HStack spacing={2} flexWrap="wrap">
                        {Object.entries(competitor.positioning).map(([key, value], i) => (
                          <Tag size="sm" key={i} colorScheme="blue" variant="subtle">
                            <TagLabel>{key}: {value}</TagLabel>
                          </Tag>
                        ))}
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">Niet beschikbaar</Text>
                    )}
                  </Td>
                  <Td>
                    {competitor.strengths && competitor.strengths.length > 0 ? (
                      <HStack spacing={1} flexWrap="wrap">
                        {competitor.strengths.slice(0, 2).map((strength, i) => (
                          <Tag size="sm" key={i} colorScheme="green" variant="subtle">
                            <TagLeftIcon as={MdStar} />
                            <TagLabel>{strength}</TagLabel>
                          </Tag>
                        ))}
                        {competitor.strengths.length > 2 && (
                          <Tag size="sm" colorScheme="green" variant="subtle">
                            <TagLabel>+{competitor.strengths.length - 2}</TagLabel>
                          </Tag>
                        )}
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">Niet beschikbaar</Text>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text color="gray.500">Geen concurrentiegegevens beschikbaar</Text>
        )}
      </Box>

      {data.swotAnalysis && (
        <Box mb={6}>
          <Heading size="md" mb={3}>SWOT-Analyses</Heading>
          <Divider mb={3} />
          
          <Accordion allowMultiple>
            {data.swotAnalysis.competitors?.map((swot, index) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      {swot.name}
                      {swot.isOwn && <Badge ml={2} colorScheme="blue">Eigen</Badge>}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Heading size="xs" mb={2} color="green.600">Sterktes</Heading>
                      <List spacing={1}>
                        {swot.strengths?.map((strength, i) => (
                          <ListItem key={i} display="flex">
                            <ListIcon as={MdCheckCircle} color="green.500" mt={1} />
                            <Text fontSize="sm">{strength}</Text>
                          </ListItem>
                        ))}
                        {(!swot.strengths || swot.strengths.length === 0) && (
                          <Text fontSize="sm" color="gray.500">Geen sterktes geïdentificeerd</Text>
                        )}
                      </List>
                    </Box>
                    
                    <Box>
                      <Heading size="xs" mb={2} color="red.600">Zwaktes</Heading>
                      <List spacing={1}>
                        {swot.weaknesses?.map((weakness, i) => (
                          <ListItem key={i} display="flex">
                            <ListIcon as={MdCancel} color="red.500" mt={1} />
                            <Text fontSize="sm">{weakness}</Text>
                          </ListItem>
                        ))}
                        {(!swot.weaknesses || swot.weaknesses.length === 0) && (
                          <Text fontSize="sm" color="gray.500">Geen zwaktes geïdentificeerd</Text>
                        )}
                      </List>
                    </Box>
                    
                    <Box>
                      <Heading size="xs" mb={2} color="blue.600">Kansen</Heading>
                      <List spacing={1}>
                        {swot.opportunities?.map((opportunity, i) => (
                          <ListItem key={i} display="flex">
                            <ListIcon as={MdTrendingUp} color="blue.500" mt={1} />
                            <Text fontSize="sm">{opportunity}</Text>
                          </ListItem>
                        ))}
                        {(!swot.opportunities || swot.opportunities.length === 0) && (
                          <Text fontSize="sm" color="gray.500">Geen kansen geïdentificeerd</Text>
                        )}
                      </List>
                    </Box>
                    
                    <Box>
                      <Heading size="xs" mb={2} color="orange.600">Bedreigingen</Heading>
                      <List spacing={1}>
                        {swot.threats?.map((threat, i) => (
                          <ListItem key={i} display="flex">
                            <ListIcon as={MdTrendingDown} color="orange.500" mt={1} />
                            <Text fontSize="sm">{threat}</Text>
                          </ListItem>
                        ))}
                        {(!swot.threats || swot.threats.length === 0) && (
                          <Text fontSize="sm" color="gray.500">Geen bedreigingen geïdentificeerd</Text>
                        )}
                      </List>
                    </Box>
                  </SimpleGrid>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      )}

      {data.competitiveAdvantages && (
        <Box>
          <Heading size="md" mb={3}>Concurrentievoordelen</Heading>
          <Divider mb={3} />
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {Object.entries(data.competitiveAdvantages).map(([competitor, advantages], index) => (
              <Box 
                key={index} 
                p={3} 
                border="1px" 
                borderColor="gray.200" 
                borderRadius="md"
              >
                <Text fontWeight="bold">{competitor}</Text>
                <List spacing={1} mt={2}>
                  {advantages.map((advantage, i) => (
                    <ListItem key={i} display="flex">
                      <ListIcon as={MdStar} color="yellow.500" mt={1} />
                      <Text fontSize="sm">{advantage}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
};

export default CompetitorsPanel;
