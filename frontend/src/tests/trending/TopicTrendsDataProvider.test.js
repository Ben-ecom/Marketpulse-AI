import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import TopicTrendsDataProvider from '../../components/trending/TopicTrendsDataProvider';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock de utility functies
jest.mock('../../utils/trending/trendVisualization', () => ({
  prepareTopicTrendsData: jest.fn().mockImplementation((data) => data)
}));

jest.mock('../../utils/trending/topicExtraction', () => ({
  getTopicTimeseries: jest.fn().mockImplementation((data) => ({
    timePoints: ['2025-04-01', '2025-04-02', '2025-04-03'],
    series: {
      'Topic A': [10, 15, 20],
      'Topic B': [5, 10, 15]
    }
  }))
}));

jest.mock('../../utils/trending/topicNormalization', () => ({
  normalizeTimeseries: jest.fn().mockImplementation((data) => ({
    ...data,
    normalizedSeries: {
      'Topic A': [0.5, 0.75, 1.0],
      'Topic B': [0.33, 0.67, 1.0]
    }
  }))
}));

jest.mock('../../utils/trending/eventAnnotation', () => ({
  addEventAnnotations: jest.fn().mockImplementation((data, events) => ({
    ...data,
    events
  }))
}));

// Mock data voor tests
const mockRawData = [
  { topic: 'Topic A', timestamp: '2025-04-01T00:00:00.000Z', count: 10 },
  { topic: 'Topic A', timestamp: '2025-04-02T00:00:00.000Z', count: 15 },
  { topic: 'Topic A', timestamp: '2025-04-03T00:00:00.000Z', count: 20 },
  { topic: 'Topic B', timestamp: '2025-04-01T00:00:00.000Z', count: 5 },
  { topic: 'Topic B', timestamp: '2025-04-02T00:00:00.000Z', count: 10 },
  { topic: 'Topic B', timestamp: '2025-04-03T00:00:00.000Z', count: 15 }
];

const mockEventsData = [
  {
    id: 'event-1',
    title: 'Test Event',
    description: 'Test event description',
    date: '2025-04-02T00:00:00.000Z'
  }
];

// Test component die de data ontvangt
const TestComponent = ({ topicsData, eventsData, loading, error }) => {
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!topicsData) return <div>No data</div>;
  
  return (
    <div>
      <div data-testid="topics-count">{Object.keys(topicsData.series || {}).length}</div>
      <div data-testid="events-count">{(eventsData || []).length}</div>
    </div>
  );
};

// Wrapper component met theme provider
const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('TopicTrendsDataProvider Component', () => {
  test('renders loading state initially', () => {
    renderWithTheme(
      <TopicTrendsDataProvider
        rawData={mockRawData}
        eventsData={mockEventsData}
      >
        <TestComponent />
      </TopicTrendsDataProvider>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  test('processes data and passes it to children', async () => {
    renderWithTheme(
      <TopicTrendsDataProvider
        rawData={mockRawData}
        eventsData={mockEventsData}
      >
        <TestComponent />
      </TopicTrendsDataProvider>
    );
    
    // Wacht tot de data is verwerkt
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Controleer of de data correct is doorgegeven aan het child component
    expect(screen.getByTestId('topics-count').textContent).toBe('2'); // 2 topics
    expect(screen.getByTestId('events-count').textContent).toBe('1'); // 1 event
  });
  
  test('handles empty data correctly', async () => {
    renderWithTheme(
      <TopicTrendsDataProvider
        rawData={[]}
        eventsData={[]}
      >
        <TestComponent />
      </TopicTrendsDataProvider>
    );
    
    // Wacht tot de data is verwerkt
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Controleer of de lege data correct wordt afgehandeld
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
  
  test('applies data processing options correctly', async () => {
    const handleDataProcessed = jest.fn();
    
    renderWithTheme(
      <TopicTrendsDataProvider
        rawData={mockRawData}
        eventsData={mockEventsData}
        timeframe="week"
        options={{
          normalize: true,
          smoothing: true,
          includeEvents: true,
          topN: 5,
          selectedTopics: ['Topic A']
        }}
        onDataProcessed={handleDataProcessed}
      >
        <TestComponent />
      </TopicTrendsDataProvider>
    );
    
    // Wacht tot de data is verwerkt
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Controleer of de callback is aangeroepen
    expect(handleDataProcessed).toHaveBeenCalled();
    
    // De gemockte functies zouden moeten zijn aangeroepen met de juiste opties
    const { getTopicTimeseries } = require('../../utils/trending/topicExtraction');
    const { normalizeTimeseries } = require('../../utils/trending/topicNormalization');
    const { addEventAnnotations } = require('../../utils/trending/eventAnnotation');
    
    expect(getTopicTimeseries).toHaveBeenCalled();
    expect(normalizeTimeseries).toHaveBeenCalled();
    expect(addEventAnnotations).toHaveBeenCalled();
  });
});
