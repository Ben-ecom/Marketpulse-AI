import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Select,
  Heading,
  Text,
  SimpleGrid,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  Stack,
  useToast
} from '@chakra-ui/react';

/**
 * MarketResearchForm component
 * 
 * Formulier voor het invoeren van marktonderzoeksgegevens voor analyse
 */
const MarketResearchForm = ({ onSubmit, isLoading }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    marketData: {
      industry: '',
      region: '',
      totalMarketSize: '',
      growthRate: '',
      maturityLevel: 'growing'
    },
    demographicData: {
      ageGroups: [],
      incomeLevel: [],
      education: [],
      location: []
    },
    psychographicData: {
      interests: [],
      values: [],
      lifestyles: []
    },
    competitorData: [
      { name: '', marketShare: '', strengths: '', weaknesses: '', pricing: '' }
    ],
    priceData: {
      minPrice: '',
      maxPrice: '',
      averagePrice: '',
      pricePoints: []
    },
    trendData: {
      trends: []
    }
  });

  // Formuliervelden bijwerken
  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Concurrent toevoegen
  const addCompetitor = () => {
    setFormData(prev => ({
      ...prev,
      competitorData: [
        ...prev.competitorData,
        { name: '', marketShare: '', strengths: '', weaknesses: '', pricing: '' }
      ]
    }));
  };

  // Concurrent bijwerken
  const updateCompetitor = (index, field, value) => {
    const updatedCompetitors = [...formData.competitorData];
    updatedCompetitors[index] = {
      ...updatedCompetitors[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      competitorData: updatedCompetitors
    }));
  };

  // Trend toevoegen
  const addTrend = () => {
    setFormData(prev => ({
      ...prev,
      trendData: {
        ...prev.trendData,
        trends: [
          ...prev.trendData.trends,
          { name: '', direction: 'up', impact: 'medium', description: '' }
        ]
      }
    }));
  };

  // Trend bijwerken
  const updateTrend = (index, field, value) => {
    const updatedTrends = [...formData.trendData.trends];
    updatedTrends[index] = {
      ...updatedTrends[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      trendData: {
        ...prev.trendData,
        trends: updatedTrends
      }
    }));
  };

  // Formulier valideren
  const validateForm = () => {
    // Basisvalidatie
    if (!formData.marketData.industry || !formData.marketData.region) {
      toast({
        title: 'Verplichte velden ontbreken',
        description: 'Vul ten minste de industrie en regio in',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return false;
    }
    
    return true;
  };

  // Formulier verzenden
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Heading size="md" mb={4}>Marktonderzoek Gegevens</Heading>
      <Text mb={4}>
        Vul de onderstaande gegevens in om een gedetailleerde marktanalyse te genereren.
        Hoe meer gegevens u verstrekt, hoe nauwkeuriger de analyse zal zijn.
      </Text>
      
      <Accordion allowMultiple defaultIndex={[0]} mb={6}>
        {/* Markt Basisgegevens */}
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="medium">
                Markt Basisgegevens
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Industrie/Sector</FormLabel>
                <Input 
                  value={formData.marketData.industry}
                  onChange={(e) => handleChange('marketData', 'industry', e.target.value)}
                  placeholder="Bijv. SaaS, Retail, Gezondheidszorg"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Regio/Markt</FormLabel>
                <Input 
                  value={formData.marketData.region}
                  onChange={(e) => handleChange('marketData', 'region', e.target.value)}
                  placeholder="Bijv. Nederland, Europa, Wereldwijd"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Totale Marktomvang (€)</FormLabel>
                <NumberInput 
                  value={formData.marketData.totalMarketSize}
                  onChange={(value) => handleChange('marketData', 'totalMarketSize', value)}
                >
                  <NumberInputField placeholder="Bijv. 1000000" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>Geschatte totale waarde van de markt</FormHelperText>
              </FormControl>
              
              <FormControl>
                <FormLabel>Jaarlijkse Groeipercentage (%)</FormLabel>
                <NumberInput 
                  value={formData.marketData.growthRate}
                  onChange={(value) => handleChange('marketData', 'growthRate', value)}
                  min={-100}
                  max={100}
                >
                  <NumberInputField placeholder="Bijv. 5.2" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Marktmaturiteit</FormLabel>
                <Select 
                  value={formData.marketData.maturityLevel}
                  onChange={(e) => handleChange('marketData', 'maturityLevel', e.target.value)}
                >
                  <option value="emerging">Opkomend</option>
                  <option value="growing">Groeiend</option>
                  <option value="mature">Volwassen</option>
                  <option value="declining">Afnemend</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>
        
        {/* Demografische Gegevens */}
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="medium">
                Demografische Gegevens
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <FormControl mb={4}>
              <FormLabel>Leeftijdsgroepen</FormLabel>
              <Textarea 
                value={formData.demographicData.ageGroups.join(', ')}
                onChange={(e) => handleChange('demographicData', 'ageGroups', e.target.value.split(',').map(item => item.trim()))}
                placeholder="Bijv. 18-24, 25-34, 35-44"
              />
              <FormHelperText>Voer leeftijdsgroepen in, gescheiden door komma's</FormHelperText>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Inkomensniveaus</FormLabel>
              <Textarea 
                value={formData.demographicData.incomeLevel.join(', ')}
                onChange={(e) => handleChange('demographicData', 'incomeLevel', e.target.value.split(',').map(item => item.trim()))}
                placeholder="Bijv. Laag, Midden, Hoog"
              />
              <FormHelperText>Voer inkomensniveaus in, gescheiden door komma's</FormHelperText>
            </FormControl>
            
            <FormControl>
              <FormLabel>Locaties</FormLabel>
              <Textarea 
                value={formData.demographicData.location.join(', ')}
                onChange={(e) => handleChange('demographicData', 'location', e.target.value.split(',').map(item => item.trim()))}
                placeholder="Bijv. Stedelijk, Voorstedelijk, Landelijk"
              />
              <FormHelperText>Voer locatietypes in, gescheiden door komma's</FormHelperText>
            </FormControl>
          </AccordionPanel>
        </AccordionItem>
        
        {/* Concurrentiegegevens */}
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="medium">
                Concurrentiegegevens
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {formData.competitorData.map((competitor, index) => (
              <Box key={index} mb={6} p={3} borderWidth="1px" borderRadius="md">
                <Heading size="xs" mb={3}>Concurrent {index + 1}</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={3}>
                  <FormControl>
                    <FormLabel>Naam</FormLabel>
                    <Input 
                      value={competitor.name}
                      onChange={(e) => updateCompetitor(index, 'name', e.target.value)}
                      placeholder="Naam van de concurrent"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Marktaandeel (%)</FormLabel>
                    <NumberInput 
                      value={competitor.marketShare}
                      onChange={(value) => updateCompetitor(index, 'marketShare', value)}
                      min={0}
                      max={100}
                    >
                      <NumberInputField placeholder="Bijv. 15" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Sterktes</FormLabel>
                    <Textarea 
                      value={competitor.strengths}
                      onChange={(e) => updateCompetitor(index, 'strengths', e.target.value)}
                      placeholder="Sterktes van de concurrent"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Zwaktes</FormLabel>
                    <Textarea 
                      value={competitor.weaknesses}
                      onChange={(e) => updateCompetitor(index, 'weaknesses', e.target.value)}
                      placeholder="Zwaktes van de concurrent"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
            ))}
            
            <Button 
              onClick={addCompetitor} 
              size="sm" 
              colorScheme="blue" 
              variant="outline"
            >
              Concurrent Toevoegen
            </Button>
          </AccordionPanel>
        </AccordionItem>
        
        {/* Prijsgegevens */}
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="medium">
                Prijsgegevens
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <FormControl>
                <FormLabel>Minimumprijs (€)</FormLabel>
                <NumberInput 
                  value={formData.priceData.minPrice}
                  onChange={(value) => handleChange('priceData', 'minPrice', value)}
                >
                  <NumberInputField placeholder="Bijv. 10" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Maximumprijs (€)</FormLabel>
                <NumberInput 
                  value={formData.priceData.maxPrice}
                  onChange={(value) => handleChange('priceData', 'maxPrice', value)}
                >
                  <NumberInputField placeholder="Bijv. 100" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              
              <FormControl>
                <FormLabel>Gemiddelde Prijs (€)</FormLabel>
                <NumberInput 
                  value={formData.priceData.averagePrice}
                  onChange={(value) => handleChange('priceData', 'averagePrice', value)}
                >
                  <NumberInputField placeholder="Bijv. 50" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
            
            <FormControl mt={4}>
              <FormLabel>Prijspunten (€)</FormLabel>
              <Textarea 
                value={formData.priceData.pricePoints.join(', ')}
                onChange={(e) => handleChange('priceData', 'pricePoints', e.target.value.split(',').map(item => parseFloat(item.trim())))}
                placeholder="Bijv. 9.99, 19.99, 29.99, 49.99"
              />
              <FormHelperText>Voer prijspunten in, gescheiden door komma's</FormHelperText>
            </FormControl>
          </AccordionPanel>
        </AccordionItem>
        
        {/* Trends */}
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="medium">
                Markttrends
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {formData.trendData.trends.map((trend, index) => (
              <Box key={index} mb={4} p={3} borderWidth="1px" borderRadius="md">
                <Heading size="xs" mb={3}>Trend {index + 1}</Heading>
                
                <FormControl mb={3}>
                  <FormLabel>Naam/Beschrijving</FormLabel>
                  <Input 
                    value={trend.name}
                    onChange={(e) => updateTrend(index, 'name', e.target.value)}
                    placeholder="Bijv. Toenemende vraag naar duurzame producten"
                  />
                </FormControl>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={3}>
                  <FormControl>
                    <FormLabel>Richting</FormLabel>
                    <Select 
                      value={trend.direction}
                      onChange={(e) => updateTrend(index, 'direction', e.target.value)}
                    >
                      <option value="up">Opwaarts</option>
                      <option value="down">Neerwaarts</option>
                      <option value="stable">Stabiel</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Impact</FormLabel>
                    <Select 
                      value={trend.impact}
                      onChange={(e) => updateTrend(index, 'impact', e.target.value)}
                    >
                      <option value="high">Hoog</option>
                      <option value="medium">Medium</option>
                      <option value="low">Laag</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Beschrijving</FormLabel>
                  <Textarea 
                    value={trend.description}
                    onChange={(e) => updateTrend(index, 'description', e.target.value)}
                    placeholder="Gedetailleerde beschrijving van de trend"
                  />
                </FormControl>
              </Box>
            ))}
            
            <Button 
              onClick={addTrend} 
              size="sm" 
              colorScheme="blue" 
              variant="outline"
            >
              Trend Toevoegen
            </Button>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      
      <Divider my={6} />
      
      <Flex justify="flex-end">
        <Button 
          type="submit" 
          colorScheme="blue" 
          size="lg" 
          isLoading={isLoading}
          loadingText="Analyseren..."
        >
          Marktanalyse Uitvoeren
        </Button>
      </Flex>
    </Box>
  );
};

export default MarketResearchForm;
