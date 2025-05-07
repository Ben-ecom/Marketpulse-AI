/**
 * Mock voor topicExtraction.js
 * Bevat mock implementaties van de functies in topicExtraction.js
 */

// Mock functie voor het extraheren van topics uit tekstdata
export const extractTopics = jest.fn().mockImplementation((textData, options = {}) => {
  return [
    { topic: 'bitcoin', frequency: 10 },
    { topic: 'ethereum', frequency: 8 },
    { topic: 'blockchain', frequency: 6 }
  ];
});

// Mock functie voor het berekenen van topic frequenties
export const calculateTopicFrequency = jest.fn().mockImplementation((topics, timeframe = {}) => {
  return {
    'bitcoin': [10, 12, 15, 20, 18],
    'ethereum': [8, 7, 9, 11, 10],
    'blockchain': [6, 8, 7, 9, 8]
  };
});

// Mock functie voor het genereren van tijdreeksdata voor topic populariteit
export const getTopicTimeseries = jest.fn().mockImplementation((topic, timeframe = {}) => {
  const mockData = {
    'bitcoin': [
      { date: '2023-01-01', value: 10 },
      { date: '2023-01-02', value: 12 },
      { date: '2023-01-03', value: 15 },
      { date: '2023-01-04', value: 20 },
      { date: '2023-01-05', value: 18 }
    ],
    'ethereum': [
      { date: '2023-01-01', value: 8 },
      { date: '2023-01-02', value: 7 },
      { date: '2023-01-03', value: 9 },
      { date: '2023-01-04', value: 11 },
      { date: '2023-01-05', value: 10 }
    ],
    'blockchain': [
      { date: '2023-01-01', value: 6 },
      { date: '2023-01-02', value: 8 },
      { date: '2023-01-03', value: 7 },
      { date: '2023-01-04', value: 9 },
      { date: '2023-01-05', value: 8 }
    ]
  };
  
  return mockData[topic] || [];
});
