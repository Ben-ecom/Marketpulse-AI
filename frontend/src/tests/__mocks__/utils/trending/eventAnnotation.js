/**
 * Mock voor eventAnnotation.js
 * Bevat mock implementaties van de functies in eventAnnotation.js
 */

// Mock functie voor het toevoegen van event annotaties aan tijdreeksdata
export const addEventAnnotations = jest.fn().mockImplementation((topicTimeseries, eventsData, options = {}) => {
  // Voeg gesimuleerde event annotaties toe aan de tijdreeksdata
  return topicTimeseries.map((dataPoint, index) => {
    // Voeg event annotaties toe aan specifieke datapunten
    if (index === 2) {
      return {
        ...dataPoint,
        event: {
          id: 'event1',
          title: 'Belangrijke marktaankondiging',
          description: 'Een belangrijke aankondiging die de markt beïnvloedt',
          impact: 0.8
        }
      };
    }
    if (index === 4) {
      return {
        ...dataPoint,
        event: {
          id: 'event2',
          title: 'Regelgevingsupdate',
          description: 'Een update in de regelgeving die de markt beïnvloedt',
          impact: 0.6
        }
      };
    }
    return dataPoint;
  });
});

// Mock functie voor het berekenen van de impact van events op topic populariteit
export const calculateEventImpact = jest.fn().mockImplementation((topicTimeseries, eventDate, options = {}) => {
  // Retourneer gesimuleerde impact score
  return {
    before: 10,
    after: 15,
    change: 5,
    percentageChange: 50,
    impact: 0.7
  };
});

// Mock functie voor het identificeren van key events
export const identifyKeyEvents = jest.fn().mockImplementation((topicTimeseries, eventsData, options = {}) => {
  // Retourneer gesimuleerde key events
  return [
    {
      id: 'event1',
      title: 'Belangrijke marktaankondiging',
      description: 'Een belangrijke aankondiging die de markt beïnvloedt',
      date: '2023-01-03',
      impact: 0.8
    },
    {
      id: 'event2',
      title: 'Regelgevingsupdate',
      description: 'Een update in de regelgeving die de markt beïnvloedt',
      date: '2023-01-05',
      impact: 0.6
    }
  ];
});
