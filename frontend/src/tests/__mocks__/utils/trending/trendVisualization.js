/**
 * Mock voor trendVisualization.js
 * Bevat mock implementaties van de functies in trendVisualization.js
 */

// Mock functie voor het voorbereiden van data voor visualisatie
export const prepareTopicTrendsData = jest.fn().mockImplementation((topicsData, options = {}) => {
  // Retourneer gesimuleerde voorbereidde data voor visualisatie
  return {
    topics: ['bitcoin', 'ethereum', 'blockchain'],
    timeframe: {
      start: '2023-01-01',
      end: '2023-01-05',
      interval: 'day'
    },
    data: [
      {
        date: '2023-01-01',
        bitcoin: 10,
        ethereum: 8,
        blockchain: 6
      },
      {
        date: '2023-01-02',
        bitcoin: 12,
        ethereum: 7,
        blockchain: 8
      },
      {
        date: '2023-01-03',
        bitcoin: 15,
        ethereum: 9,
        blockchain: 7
      },
      {
        date: '2023-01-04',
        bitcoin: 20,
        ethereum: 11,
        blockchain: 9
      },
      {
        date: '2023-01-05',
        bitcoin: 18,
        ethereum: 10,
        blockchain: 8
      }
    ],
    annotations: [
      {
        topic: 'bitcoin',
        date: '2023-01-03',
        event: 'Belangrijke marktaankondiging',
        impact: 0.8
      },
      {
        topic: 'bitcoin',
        date: '2023-01-05',
        event: 'Regelgevingsupdate',
        impact: 0.6
      }
    ]
  };
});

// Mock functie voor het genereren van tekstuele trendrapportages
export const generateTrendReport = jest.fn().mockImplementation((topicsData, options = {}) => {
  // Retourneer gesimuleerde tekstuele trendrapportage
  return {
    summary: 'Bitcoin toont een sterke stijgende trend met een significante spike op 4 januari. Ethereum volgt een vergelijkbaar patroon maar met minder volatiliteit.',
    topPerformers: [
      {
        topic: 'bitcoin',
        growth: '80%',
        keyEvents: ['Belangrijke marktaankondiging', 'Regelgevingsupdate']
      },
      {
        topic: 'ethereum',
        growth: '25%',
        keyEvents: []
      }
    ],
    emergingTopics: [
      {
        topic: 'nft',
        growthRate: '35%',
        confidence: 0.7
      }
    ],
    decliningTopics: [
      {
        topic: 'ico',
        declineRate: '25%',
        confidence: 0.7
      }
    ]
  };
});

// Mock functie voor export functionaliteit
export const exportTrendData = jest.fn().mockImplementation((topicsData, format = 'json') => {
  // Retourneer gesimuleerde export data
  return {
    success: true,
    format,
    data: JSON.stringify(topicsData)
  };
});

// Mock functie voor topic vergelijking
export const compareTopics = jest.fn().mockImplementation((topic1, topic2, timeframe = {}) => {
  // Retourneer gesimuleerde vergelijkingsresultaten
  return {
    correlation: 0.75,
    topic1Performance: {
      growth: '80%',
      volatility: 0.42,
      spikes: 2
    },
    topic2Performance: {
      growth: '25%',
      volatility: 0.35,
      spikes: 1
    },
    comparison: 'Bitcoin presteert beter dan Ethereum in termen van groei en heeft meer significante spikes, maar is ook volatieler.'
  };
});
