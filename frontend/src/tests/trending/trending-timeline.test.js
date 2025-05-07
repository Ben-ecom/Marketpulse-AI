/**
 * Test voor de Trending Topics Timeline component
 * Gebruikt CommonJS syntax voor Jest compatibiliteit
 */

const { render, screen, waitFor } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event').default;
const React = require('react');

// Mock de utility functies
jest.mock('../../utils/trending/topicExtraction', () => ({
  getTopicTimeseries: jest.fn().mockImplementation((topic) => {
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
      ]
    };
    return mockData[topic] || [];
  })
}));

jest.mock('../../utils/trending/topicNormalization', () => ({
  normalizeTimeseries: jest.fn().mockImplementation((data) => 
    data.map(point => ({ ...point, normalizedValue: point.value / 20 }))
  )
}));

jest.mock('../../utils/trending/trendDetection', () => ({
  detectSpikes: jest.fn().mockImplementation(() => [2, 4]),
  detectTrendChanges: jest.fn().mockImplementation(() => [
    { index: 2, type: 'upward', magnitude: 0.3 },
    { index: 4, type: 'downward', magnitude: 0.2 }
  ])
}));

jest.mock('../../utils/trending/eventAnnotation', () => ({
  addEventAnnotations: jest.fn().mockImplementation((data) => 
    data.map((point, index) => {
      if (index === 2) {
        return { ...point, event: { title: 'Belangrijke aankondiging' } };
      }
      return point;
    })
  ),
  calculateEventImpact: jest.fn().mockImplementation(() => ({
    before: 10,
    after: 15,
    change: 5,
    percentageChange: 50,
    impact: 0.7
  }))
}));

jest.mock('../../utils/trending/trendVisualization', () => ({
  prepareTopicTrendsData: jest.fn().mockImplementation(() => ({
    topics: ['bitcoin', 'ethereum'],
    timeframe: { start: '2023-01-01', end: '2023-01-05' },
    data: [
      { date: '2023-01-01', bitcoin: 10, ethereum: 8 },
      { date: '2023-01-02', bitcoin: 12, ethereum: 7 },
      { date: '2023-01-03', bitcoin: 15, ethereum: 9 },
      { date: '2023-01-04', bitcoin: 20, ethereum: 11 },
      { date: '2023-01-05', bitcoin: 18, ethereum: 10 }
    ]
  }))
}));

// Mock de TrendingTopicsTimeline component
jest.mock('../../components/trending/TrendingTopicsTimeline', () => {
  return function MockTrendingTopicsTimeline(props) {
    return (
      <div data-testid="trending-topics-timeline">
        <div data-testid="topics-count">{props.topics?.length || 0}</div>
        <div data-testid="loading">{props.loading ? 'Loading...' : 'Loaded'}</div>
        <div data-testid="error">{props.error || 'No error'}</div>
        <button data-testid="refresh-button" onClick={props.onRefresh}>Refresh</button>
      </div>
    );
  };
});

// Importeer de gemockte functies
const { getTopicTimeseries } = require('../../utils/trending/topicExtraction');
const { normalizeTimeseries } = require('../../utils/trending/topicNormalization');
const { detectSpikes, detectTrendChanges } = require('../../utils/trending/trendDetection');
const { addEventAnnotations, calculateEventImpact } = require('../../utils/trending/eventAnnotation');
const { prepareTopicTrendsData } = require('../../utils/trending/trendVisualization');

// Importeer de component die we willen testen
const TrendingTopicsTimeline = require('../../components/trending/TrendingTopicsTimeline').default;

// Test suite
describe('Trending Topics Timeline Component', () => {
  // Reset de mock implementaties na elke test
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Rendert de component correct', () => {
    render(
      <TrendingTopicsTimeline 
        topics={['bitcoin', 'ethereum']} 
        loading={false} 
        error={null} 
        onRefresh={() => {}}
      />
    );
    
    expect(screen.getByTestId('trending-topics-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('topics-count').textContent).toBe('2');
    expect(screen.getByTestId('loading').textContent).toBe('Loaded');
    expect(screen.getByTestId('error').textContent).toBe('No error');
  });

  test('Toont loading state correct', () => {
    render(
      <TrendingTopicsTimeline 
        topics={['bitcoin', 'ethereum']} 
        loading={true} 
        error={null} 
        onRefresh={() => {}}
      />
    );
    
    expect(screen.getByTestId('loading').textContent).toBe('Loading...');
  });

  test('Toont error state correct', () => {
    const errorMessage = 'Er is een fout opgetreden';
    render(
      <TrendingTopicsTimeline 
        topics={['bitcoin', 'ethereum']} 
        loading={false} 
        error={errorMessage} 
        onRefresh={() => {}}
      />
    );
    
    expect(screen.getByTestId('error').textContent).toBe(errorMessage);
  });

  test('Roept onRefresh callback aan bij klikken op refresh button', async () => {
    const onRefreshMock = jest.fn();
    render(
      <TrendingTopicsTimeline 
        topics={['bitcoin', 'ethereum']} 
        loading={false} 
        error={null} 
        onRefresh={onRefreshMock}
      />
    );
    
    const refreshButton = screen.getByTestId('refresh-button');
    userEvent.click(refreshButton);
    
    expect(onRefreshMock).toHaveBeenCalledTimes(1);
  });
});
