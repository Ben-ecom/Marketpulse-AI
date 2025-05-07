import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  List,
  ListItem,
  ListIcon,
  Badge
} from '@chakra-ui/react';
import { MdTrendingUp, MdTrendingDown, MdInfo } from 'react-icons/md';

/**
 * MarketOverviewPanel component
 * 
 * Toont een overzicht van de marktomvang, groeipercentage, segmenten en trends.
 */
const MarketOverviewPanel = ({ data }) => {
  if (!data) {
    return (
      <Box p={4} bg="gray.50" borderRadius="md">
        <Text>Geen marktoverzicht beschikbaar</Text>
      </Box>
    );
  }

  // Formateer de marktomvang (bijv. €10M)
  const formatMarketSize = (size) => {
    if (size >= 1000000000) {
      return `€${(size / 1000000000).toFixed(1)}B`;
    } else if (size >= 1000000) {
      return `€${(size / 1000000).toFixed(1)}M`;
    } else if (size >= 1000) {
      return `€${(size / 1000).toFixed(1)}K`;
    }
    return `€${size.toFixed(0)}`;
  };

  // Bepaal of de groei positief of negatief is
  const isGrowthPositive = data.growthRate > 0;
  const growthPercentage = Math.abs(data.growthRate * 100).toFixed(1);

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <Stat
          p={4}
          shadow="md"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
        >
          <StatLabel fontSize="md">Marktomvang</StatLabel>
          <StatNumber fontSize="2xl">{formatMarketSize(data.size)}</StatNumber>
          <StatHelpText>
            Geschatte totale marktwaarde
          </StatHelpText>
        </Stat>

        <Stat
          p={4}
          shadow="md"
          border="1px"
          borderColor="gray.200"
          borderRadius="md"
        >
          <StatLabel fontSize="md">Groeipercentage</StatLabel>
          <StatNumber fontSize="2xl">
            {growthPercentage}%
            <StatArrow type={isGrowthPositive ? "increase" : "decrease"} ml={1} />
          </StatNumber>
          <StatHelpText>
            Jaarlijkse groei
          </StatHelpText>
        </Stat>
      </SimpleGrid>

      <Box mb={6}>
        <Heading size="md" mb={3}>Marktsegmenten</Heading>
        <Divider mb={3} />
        
        {data.segments && data.segments.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {data.segments.map((segment, index) => (
              <Box 
                key={index} 
                p={3} 
                border="1px" 
                borderColor="gray.200" 
                borderRadius="md"
              >
                <Text fontWeight="bold">{segment.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {segment.size ? formatMarketSize(segment.size) : 
                   (segment.percentage ? `${(segment.percentage * 100).toFixed(1)}%` : 'Onbekend')}
                </Text>
                {segment.description && (
                  <Text fontSize="xs" mt={1}>{segment.description}</Text>
                )}
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text color="gray.500">Geen segmentgegevens beschikbaar</Text>
        )}
      </Box>

      <Box>
        <Heading size="md" mb={3}>Top Trends</Heading>
        <Divider mb={3} />
        
        {data.topTrends && data.topTrends.length > 0 ? (
          <List spacing={2}>
            {data.topTrends.map((trend, index) => (
              <ListItem key={index} display="flex" alignItems="flex-start">
                <ListIcon 
                  as={trend.direction === 'down' ? MdTrendingDown : MdTrendingUp} 
                  color={trend.direction === 'down' ? "red.500" : "green.500"} 
                  mt={1}
                />
                <Box>
                  <Text fontWeight="medium">
                    {trend.name}
                    {trend.impact && (
                      <Badge 
                        ml={2} 
                        colorScheme={
                          trend.impact === 'high' ? 'red' : 
                          trend.impact === 'medium' ? 'yellow' : 
                          'blue'
                        }
                      >
                        {trend.impact}
                      </Badge>
                    )}
                  </Text>
                  {trend.description && (
                    <Text fontSize="sm" color="gray.600">{trend.description}</Text>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Text color="gray.500">Geen trendgegevens beschikbaar</Text>
        )}
      </Box>

      {data.competitorCount > 0 && (
        <Box mt={6} p={3} bg="blue.50" borderRadius="md">
          <Text display="flex" alignItems="center">
            <Box as={MdInfo} mr={2} />
            <span>
              Er zijn <strong>{data.competitorCount}</strong> concurrenten geanalyseerd in deze markt.
              Bekijk het tabblad Concurrenten voor meer details.
            </span>
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default MarketOverviewPanel;
