import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  Card,
  CardHeader,
  CardBody,
  Icon,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import { 
  MdLightbulb, 
  MdPriorityHigh, 
  MdCheckCircle,
  MdArrowForward,
  MdDownload
} from 'react-icons/md';

/**
 * RecommendationsPanel component
 * 
 * Toont aanbevelingen op basis van de marktanalyse, gecategoriseerd en geprioriteerd.
 */
const RecommendationsPanel = ({ data }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRecommendation, setSelectedRecommendation] = React.useState(null);
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box p={4} bg="gray.50" borderRadius="md">
        <Text>Geen aanbevelingen beschikbaar</Text>
      </Box>
    );
  }

  // Groepeer aanbevelingen per categorie
  const categorizedRecommendations = data.reduce((acc, rec) => {
    const category = rec.category || 'Algemeen';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(rec);
    return acc;
  }, {});

  // Bepaal de kleur voor de prioriteit badge
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
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
  
  // Open de details modal voor een aanbeveling
  const openRecommendationDetails = (recommendation) => {
    setSelectedRecommendation(recommendation);
    onOpen();
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={3}>
        <Heading size="md">Strategische Aanbevelingen</Heading>
        <Badge colorScheme="blue" p={1}>
          {data.length} aanbevelingen
        </Badge>
      </Flex>
      <Divider mb={4} />
      
      <Text mb={4}>
        Op basis van de marktanalyse zijn de volgende strategische aanbevelingen gegenereerd,
        gegroepeerd per categorie en geprioriteerd op impact.
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {Object.entries(categorizedRecommendations).map(([category, recommendations], index) => (
          <Box key={index}>
            <Heading size="sm" mb={3} display="flex" alignItems="center">
              <Icon as={MdLightbulb} mr={2} color="yellow.500" />
              {category}
            </Heading>
            
            <List spacing={3}>
              {recommendations.map((recommendation, recIndex) => (
                <ListItem key={recIndex}>
                  <Card variant="outline" size="sm">
                    <CardHeader py={2} px={3} bg="blue.50">
                      <Flex justify="space-between" align="center">
                        <Flex align="center">
                          <ListIcon 
                            as={MdCheckCircle} 
                            color="blue.500" 
                            mr={2}
                          />
                          <Badge 
                            colorScheme={getPriorityColor(recommendation.priority)} 
                            mr={2}
                          >
                            {recommendation.priority || 'Normaal'}
                          </Badge>
                        </Flex>
                        <Button 
                          size="xs" 
                          rightIcon={<MdArrowForward />} 
                          colorScheme="blue" 
                          variant="ghost"
                          onClick={() => openRecommendationDetails(recommendation)}
                        >
                          Details
                        </Button>
                      </Flex>
                    </CardHeader>
                    <CardBody py={2} px={3}>
                      <Text fontSize="sm">{recommendation.recommendation}</Text>
                    </CardBody>
                  </Card>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </SimpleGrid>
      
      {/* Aanbeveling Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Aanbeveling Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRecommendation && (
              <Box>
                <Flex align="center" mb={3}>
                  <Badge 
                    colorScheme={getPriorityColor(selectedRecommendation.priority)} 
                    mr={2}
                    p={1}
                  >
                    {selectedRecommendation.priority || 'Normaal'} Prioriteit
                  </Badge>
                  <Badge colorScheme="blue" p={1}>
                    {selectedRecommendation.category || 'Algemeen'}
                  </Badge>
                </Flex>
                
                <Heading size="md" mb={3}>{selectedRecommendation.recommendation}</Heading>
                
                {selectedRecommendation.rationale && (
                  <Box mb={4}>
                    <Heading size="xs" mb={2}>Onderbouwing</Heading>
                    <Text fontSize="sm">{selectedRecommendation.rationale}</Text>
                  </Box>
                )}
                
                {selectedRecommendation.impact && (
                  <Box mb={4}>
                    <Heading size="xs" mb={2}>Verwachte Impact</Heading>
                    <Text fontSize="sm">{selectedRecommendation.impact}</Text>
                  </Box>
                )}
                
                {selectedRecommendation.implementation && (
                  <Box mb={4}>
                    <Heading size="xs" mb={2}>Implementatie Suggesties</Heading>
                    <Text fontSize="sm">{selectedRecommendation.implementation}</Text>
                  </Box>
                )}
                
                {!selectedRecommendation.rationale && 
                 !selectedRecommendation.impact && 
                 !selectedRecommendation.implementation && (
                  <Box 
                    p={4} 
                    bg="blue.50" 
                    borderRadius="md" 
                    display="flex" 
                    alignItems="center"
                  >
                    <Icon as={MdPriorityHigh} mr={2} color="blue.500" />
                    <Text>
                      Gedetailleerde informatie voor deze aanbeveling is niet beschikbaar.
                      Neem contact op met een marktanalist voor meer context.
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              leftIcon={<MdDownload />} 
              colorScheme="blue" 
              mr={3} 
              variant="outline"
            >
              Exporteren
            </Button>
            <Button onClick={onClose}>Sluiten</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RecommendationsPanel;
