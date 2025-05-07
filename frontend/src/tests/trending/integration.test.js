import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TrendingTopicsTimeline from '../../components/trending/TrendingTopicsTimeline';
import TopicTrendsDataProvider from '../../components/trending/TopicTrendsDataProvider';
import TopicSelectionControls from '../../components/trending/TopicSelectionControls';
import TimeRangeSelector from '../../components/trending/TimeRangeSelector';

// Mock data voor tests
const mockRawData = [
  { topic: 'Artificial Intelligence', count: 150, source: 'twitter', timestamp: '2025-04-01T00:00:00.000Z' },
  { topic: 'Artificial Intelligence', count: 180, source: 'twitter', timestamp: '2025-04-02T00:00:00.000Z' },
  { topic: 'Artificial Intelligence', count: 220, source: 'twitter', timestamp: '2025-04-03T00:00:00.000Z' },
  { topic: 'Machine Learning', count: 120, source: 'reddit', timestamp: '2025-04-01T00:00:00.000Z' },
  { topic: 'Machine Learning', count: 140, source: 'reddit', timestamp: '2025-04-02T00:00:00.000Z' },
  { topic: 'Machine Learning', count: 160, source: 'reddit', timestamp: '2025-04-03T00:00:00.000Z' },
  { topic: 'Blockchain', count: 80, source: 'news', timestamp: '2025-04-01T00:00:00.000Z' },
  { topic: 'Blockchain', count: 90, source: 'news', timestamp: '2025-04-02T00:00:00.000Z' },
  { topic: 'Blockchain', count: 100, source: 'news', timestamp: '2025-04-03T00:00:00.000Z' }
];

const mockEventsData = [
  {
    id: 'event-1',
    title: 'AI Conference',
    description: 'Major AI conference with new product announcements',
    date: '2025-04-02T00:00:00.000Z',
    category: 'Conference'
  }
];

// Mock de utility functies
jest.mock('../../utils/trending/trendVisualization', () => ({
  prepareTopicTrendsData: jest.fn().mockImplementation((data) => data)
}));

jest.mock('../../utils/trending/topicExtraction', () => ({
  getTopicTimeseries: jest.fn().mockImplementation(() => ({
    timePoints: ['2025-04-01', '2025-04-02', '2025-04-03'],
    series: {
      'Artificial Intelligence': [150, 180, 220],
      'Machine Learning': [120, 140, 160],
      'Blockchain': [80, 90, 100]
    }
  }))
}));

jest.mock('../../utils/trending/topicNormalization', () => ({
  normalizeTimeseries: jest.fn().mockImplementation((data) => ({
    ...data,
    normalizedSeries: {
      'Artificial Intelligence': [0.68, 0.82, 1.0],
      'Machine Learning': [0.75, 0.88, 1.0],
      'Blockchain': [0.8, 0.9, 1.0]
    }
  }))
}));

jest.mock('../../utils/trending/eventAnnotation', () => ({
  addEventAnnotations: jest.fn().mockImplementation((data, events) => ({
    ...data,
    events: events.map((event, index) => ({
      ...event,
      timePointIndex: 1 // Koppel aan het tweede tijdpunt (index 1)
    }))
  }))
}));

// Wrapper component met theme provider
const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

// Test component die alle componenten integreert
const IntegratedTrendingTopics = () => {
  const [selectedTopics, setSelectedTopics] = React.useState([]);
  const [timeframe, setTimeframe] = React.useState('week');
  const [zoomRange, setZoomRange] = React.useState(null);
  
  // Beschikbare topics voor de TopicSelectionControls
  const availableTopics = [
    { topic: 'Artificial Intelligence', frequency: 550, trend: 20 },
    { topic: 'Machine Learning', frequency: 420, trend: 15 },
    { topic: 'Blockchain', frequency: 270, trend: 10 }
  ];
  
  return (
    <div>
      <TopicSelectionControls
        availableTopics={availableTopics}
        selectedTopics={selectedTopics}
        onSelectionChange={setSelectedTopics}
        data-testid="topic-selection"
      />
      
      <TimeRangeSelector
        timePoints={['2025-04-01', '2025-04-02', '2025-04-03']}
        rawTimePoints={['2025-04-01T00:00:00.000Z', '2025-04-02T00:00:00.000Z', '2025-04-03T00:00:00.000Z']}
        onRangeChange={setZoomRange}
        onTimeframeChange={setTimeframe}
        data-testid="time-range-selector"
      />
      
      <TopicTrendsDataProvider
        rawData={mockRawData}
        eventsData={mockEventsData}
        timeframe={timeframe}
        options={{
          normalize: true,
          smoothing: true,
          includeEvents: true,
          selectedTopics
        }}
        data-testid="data-provider"
      >
        <TrendingTopicsTimeline
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          onTopicSelect={setSelectedTopics}
          data-testid="timeline"
        />
      </TopicTrendsDataProvider>
    </div>
  );
};

describe('Trending Topics Integration', () => {
  test('components integrate correctly', async () => {
    renderWithTheme(<IntegratedTrendingTopics />);
    
    // Controleer of alle componenten aanwezig zijn
    expect(screen.getByText('Topic Selectie')).toBeInTheDocument();
    expect(screen.getByText('Periode')).toBeInTheDocument();
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByText(/laden/i)).not.toBeInTheDocument();
    });
    
    // Test topic selectie
    const topicSelect = screen.getAllByLabelText(/topics/i)[0];
    fireEvent.mouseDown(topicSelect);
    
    // Test timeframe selectie
    const timeframeSelect = screen.getAllByLabelText(/periode/i)[0];
    fireEvent.mouseDown(timeframeSelect);
    fireEvent.click(screen.getByText('Maand'));
    
    // Test zoom controls
    const zoomInButton = screen.getByTitle(/zoom in/i);
    fireEvent.click(zoomInButton);
    
    // Test reset zoom
    const resetZoomButton = screen.getByTitle(/reset zoom/i);
    fireEvent.click(resetZoomButton);
    
    // Test events toggle
    const eventsToggle = screen.getByTitle(/toon events/i) || screen.getByTitle(/verberg events/i);
    fireEvent.click(eventsToggle);
  });
  
  test('data flows correctly between components', async () => {
    // Mock handlers om data flow te testen
    const handleTopicSelect = jest.fn();
    const handleTimeframeChange = jest.fn();
    const handleRangeChange = jest.fn();
    const handleDataProcessed = jest.fn();
    
    renderWithTheme(
      <div>
        <TopicSelectionControls
          availableTopics={[
            { topic: 'Artificial Intelligence', frequency: 550, trend: 20 },
            { topic: 'Machine Learning', frequency: 420, trend: 15 }
          ]}
          selectedTopics={['Artificial Intelligence']}
          onSelectionChange={handleTopicSelect}
        />
        
        <TopicTrendsDataProvider
          rawData={mockRawData}
          eventsData={mockEventsData}
          timeframe="week"
          options={{
            normalize: true,
            selectedTopics: ['Artificial Intelligence']
          }}
          onDataProcessed={handleDataProcessed}
        >
          <TrendingTopicsTimeline
            timeframe="week"
            onTimeframeChange={handleTimeframeChange}
            onTopicSelect={handleTopicSelect}
          />
        </TopicTrendsDataProvider>
      </div>
    );
    
    // Wacht tot de data is verwerkt
    await waitFor(() => {
      expect(handleDataProcessed).toHaveBeenCalled();
    });
    
    // Test of de timeframe selector werkt
    const timeframeSelect = screen.getByLabelText('Periode');
    fireEvent.mouseDown(timeframeSelect);
    fireEvent.click(screen.getByText('Maand'));
    
    // Controleer of de handler is aangeroepen
    expect(handleTimeframeChange).toHaveBeenCalledWith('month');
  });
  
  test('handles empty data correctly', async () => {
    renderWithTheme(
      <TopicTrendsDataProvider
        rawData={[]}
        eventsData={[]}
        timeframe="week"
      >
        <TrendingTopicsTimeline />
      </TopicTrendsDataProvider>
    );
    
    // Wacht tot de data is verwerkt
    await waitFor(() => {
      expect(screen.queryByText(/laden/i)).not.toBeInTheDocument();
    });
    
    // Controleer of de lege state correct wordt weergegeven
    expect(screen.getByText(/geen trending topics data beschikbaar/i)).toBeInTheDocument();
  });
  
  test('handles error state correctly', async () => {
    // Mock de getTopicTimeseries functie om een error te gooien
    require('../../utils/trending/topicExtraction').getTopicTimeseries.mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    
    renderWithTheme(
      <TopicTrendsDataProvider
        rawData={mockRawData}
        eventsData={mockEventsData}
        timeframe="week"
      >
        <TrendingTopicsTimeline />
      </TopicTrendsDataProvider>
    );
    
    // Wacht tot de error state is weergegeven
    await waitFor(() => {
      expect(screen.queryByText(/laden/i)).not.toBeInTheDocument();
    });
    
    // Controleer of de error state correct wordt weergegeven
    expect(screen.getByText(/er is een fout opgetreden/i)).toBeInTheDocument();
  });
});
