import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
} from '@chakra-ui/react';
import { MdHistory, MdSave, MdShare } from 'react-icons/md';

import MarketResearchForm from './MarketResearchForm';
import MarketResearchResults from './MarketResearchResults';

/**
 * MarketResearchPage component
 * 
 * Hoofdpagina voor de marktonderzoeksmodule die het formulier en de resultaten combineert
 */
const MarketResearchPage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Haal opgeslagen rapporten op bij het laden van de component
  useEffect(() => {
    const fetchSavedReports = async () => {
      try {
        // In een echte implementatie zou je hier een API-aanroep doen
        // om opgeslagen rapporten op te halen
        const mockReports = [
          { 
            id: '1', 
            title: 'SaaS Marktanalyse', 
            createdAt: '2025-04-15T10:30:00Z',
            industry: 'SaaS',
            region: 'Europa'
          },
          { 
            id: '2', 
            title: 'Retail Marktonderzoek', 
            createdAt: '2025-04-10T14:45:00Z',
            industry: 'Retail',
            region: 'Nederland'
          }
        ];
        
        setSavedReports(mockReports);
      } catch (err) {
        console.error('Fout bij het ophalen van opgeslagen rapporten:', err);
        setError('Kon opgeslagen rapporten niet laden');
      }
    };
    
    fetchSavedReports();
  }, []);

  // Voer marktanalyse uit
  const handleAnalyzeMarket = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // API-aanroep naar de backend
      const response = await fetch('/api/market-research/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setActiveTab(1); // Schakel naar het tabblad met resultaten
        
        toast({
          title: 'Analyse voltooid',
          description: 'De marktanalyse is succesvol uitgevoerd',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
      } else {
        throw new Error(data.error || 'Onbekende fout bij het uitvoeren van de analyse');
      }
    } catch (err) {
      console.error('Fout bij het uitvoeren van de marktanalyse:', err);
      setError(err.message);
      
      toast({
        title: 'Fout bij analyse',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sla rapport op
  const handleSaveReport = async () => {
    if (!results) return;
    
    try {
      // In een echte implementatie zou je hier een API-aanroep doen
      // om het rapport op te slaan
      toast({
        title: 'Rapport opgeslagen',
        description: 'Het marktonderzoeksrapport is succesvol opgeslagen',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      // Simuleer het toevoegen van een nieuw rapport aan de lijst
      const newReport = {
        id: Date.now().toString(),
        title: `${results.marketOverview?.industry || 'Markt'} Analyse`,
        createdAt: new Date().toISOString(),
        industry: results.marketOverview?.industry || 'Onbekend',
        region: results.marketOverview?.region || 'Onbekend'
      };
      
      setSavedReports(prev => [newReport, ...prev]);
    } catch (err) {
      console.error('Fout bij het opslaan van het rapport:', err);
      
      toast({
        title: 'Fout bij opslaan',
        description: 'Kon het rapport niet opslaan',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Laad een opgeslagen rapport
  const handleLoadReport = async (reportId) => {
    try {
      setIsLoading(true);
      
      // In een echte implementatie zou je hier een API-aanroep doen
      // om het rapport op te halen
      const report = savedReports.find(r => r.id === reportId);
      
      if (!report) {
        throw new Error('Rapport niet gevonden');
      }
      
      // Simuleer het laden van een rapport
      setTimeout(() => {
        // Dit zou normaal gesproken de gegevens zijn die je van de API krijgt
        const mockResults = {
          marketOverview: {
            industry: report.industry,
            region: report.region,
            size: 1500000,
            growthRate: 0.12,
            segments: [
              { name: 'Segment A', size: 750000 },
              { name: 'Segment B', size: 500000 },
              { name: 'Segment C', size: 250000 }
            ],
            topTrends: [
              { name: 'Digitalisering', direction: 'up', impact: 'high' },
              { name: 'Duurzaamheid', direction: 'up', impact: 'medium' }
            ],
            competitorCount: 5
          },
          metadata: {
            timestamp: report.createdAt,
            dataPoints: 120,
            confidence: 0.85
          }
        };
        
        setResults(mockResults);
        setActiveTab(1); // Schakel naar het tabblad met resultaten
        setIsLoading(false);
        onClose(); // Sluit de modal
        
        toast({
          title: 'Rapport geladen',
          description: `${report.title} is succesvol geladen`,
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }, 1000);
    } catch (err) {
      console.error('Fout bij het laden van het rapport:', err);
      setIsLoading(false);
      
      toast({
        title: 'Fout bij laden',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Open de modal met opgeslagen rapporten
  const openSavedReportsModal = () => {
    setSelectedReport(null);
    onOpen();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>Marktonderzoek & Analyse</Heading>
        <Text color="gray.600">
          Voer marktgegevens in om gedetailleerde inzichten te krijgen in marktomvang, 
          segmentatie, concurrentie, en kansen.
        </Text>
      </Box>
      
      <Flex justify="space-between" align="center" mb={4}>
        <Tabs 
          variant="soft-rounded" 
          colorScheme="blue" 
          index={activeTab} 
          onChange={setActiveTab}
          flex="1"
        >
          <TabList>
            <Tab>Gegevens Invoeren</Tab>
            <Tab isDisabled={!results}>Resultaten</Tab>
          </TabList>
        </Tabs>
        
        <Button 
          leftIcon={<MdHistory />} 
          colorScheme="blue" 
          variant="outline" 
          onClick={openSavedReportsModal}
          ml={4}
        >
          Opgeslagen Rapporten
        </Button>
      </Flex>
      
      <Divider mb={6} />
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Fout!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      )}
      
      <TabPanels>
        <TabPanel p={0}>
          <MarketResearchForm 
            onSubmit={handleAnalyzeMarket} 
            isLoading={isLoading} 
          />
        </TabPanel>
        
        <TabPanel p={0}>
          <Flex justify="flex-end" mb={4}>
            <Button 
              leftIcon={<MdSave />} 
              colorScheme="blue" 
              onClick={handleSaveReport}
              mr={2}
            >
              Rapport Opslaan
            </Button>
            <Button 
              leftIcon={<MdShare />} 
              colorScheme="blue" 
              variant="outline"
            >
              Delen
            </Button>
          </Flex>
          
          <MarketResearchResults 
            results={results} 
            isLoading={isLoading} 
            error={error} 
            onSaveReport={handleSaveReport}
            onRefreshAnalysis={() => setActiveTab(0)}
          />
        </TabPanel>
      </TabPanels>
      
      {/* Modal voor opgeslagen rapporten */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Opgeslagen Rapporten</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {savedReports.length > 0 ? (
              <Box>
                {savedReports.map(report => (
                  <Box 
                    key={report.id} 
                    p={3} 
                    mb={3} 
                    borderWidth="1px" 
                    borderRadius="md"
                    _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                    onClick={() => handleLoadReport(report.id)}
                  >
                    <Heading size="sm">{report.title}</Heading>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(report.createdAt).toLocaleString()}
                    </Text>
                    <Flex mt={2}>
                      <Text fontSize="xs" color="gray.500" mr={2}>
                        Industrie: {report.industry}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Regio: {report.region}
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box textAlign="center" py={6}>
                <Text>Geen opgeslagen rapporten gevonden</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MarketResearchPage;
