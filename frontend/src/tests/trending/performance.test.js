import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import TrendingTopicsTimeline from '../../components/trending/TrendingTopicsTimeline';
import TopicTrendsDataProvider from '../../components/trending/TopicTrendsDataProvider';
import { generateMockTopicData } from '../../utils/mockData';

// Genereer een grote dataset voor performance tests
const generateLargeDataset = (size = 1000) => {
  return generateMockTopicData('month', { count: size });
};

// Genereer een grote set van tijdpunten
const generateLargeTimePoints = (count = 100) => {
  const timePoints = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - (count - i));
    timePoints.push(date.toISOString());
  }
  
  return timePoints;
};

// Genereer een grote set van series data
const generateLargeSeries = (topics = 20, timePoints = 100) => {
  const series = {};
  
  for (let i = 0; i < topics; i++) {
    const topicName = `Topic ${i + 1}`;
    const values = [];
    
    for (let j = 0; j < timePoints; j++) {
      values.push(Math.floor(Math.random() * 1000));
    }
    
    series[topicName] = values;
  }
  
  return series;
};

// Mock de utility functies voor grote datasets
jest.mock('../../utils/trending/topicExtraction', () => ({
  getTopicTimeseries: jest.fn().mockImplementation(() => {
    const timePoints = generateLargeTimePoints(100);
    const series = generateLargeSeries(20, 100);
    
    return {
      timePoints,
      series
    };
  })
}));

jest.mock('../../utils/trending/topicNormalization', () => ({
  normalizeTimeseries: jest.fn().mockImplementation((data) => {
    // Simuleer normalisatie door een kopie te maken van de series
    const normalizedSeries = {};
    
    Object.keys(data.series).forEach(topic => {
      const values = data.series[topic];
      const max = Math.max(...values);
      normalizedSeries[topic] = values.map(value => value / max);
    });
    
    return {
      ...data,
      normalizedSeries
    };
  })
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

describe('Trending Topics Performance', () => {
  // Originele console.time en console.timeEnd functies opslaan
  const originalTime = console.time;
  const originalTimeEnd = console.timeEnd;
  
  // Mock timers voor performance metingen
  let timers = {};
  
  beforeAll(() => {
    console.time = jest.fn((label) => {
      timers[label] = performance.now();
    });
    
    console.timeEnd = jest.fn((label) => {
      const endTime = performance.now();
      const startTime = timers[label];
      const duration = endTime - startTime;
      console.log(`${label}: ${duration.toFixed(2)}ms`);
      delete timers[label];
      return duration;
    });
  });
  
  afterAll(() => {
    console.time = originalTime;
    console.timeEnd = originalTimeEnd;
  });
  
  test('renders large dataset within acceptable time', async () => {
    // Genereer een grote dataset
    const largeDataset = generateLargeDataset(1000);
    
    // Start timer voor rendering
    console.time('render-large-dataset');
    
    renderWithTheme(
      <TopicTrendsDataProvider
        rawData={largeDataset}
        timeframe="month"
        options={{
          normalize: true,
          smoothing: true
        }}
      >
        <TrendingTopicsTimeline />
      </TopicTrendsDataProvider>
    );
    
    // Wacht tot de data is verwerkt
    await waitFor(() => {
      expect(screen.queryByText(/laden/i)).not.toBeInTheDocument();
    });
    
    // Stop timer en meet rendering tijd
    const renderTime = console.timeEnd('render-large-dataset');
    
    // Rendering zou binnen 500ms moeten zijn voor een goede gebruikerservaring
    expect(renderTime).toBeLessThan(500);
  });
  
  test('handles data processing efficiently', async () => {
    // Genereer een grote dataset
    const largeDataset = generateLargeDataset(1000);
    
    // Mock handlers om data processing te meten
    const handleDataProcessed = jest.fn();
    
    // Start timer voor data processing
    console.time('data-processing');
    
    renderWithTheme(
      <TopicTrendsDataProvider
        rawData={largeDataset}
        timeframe="month"
        options={{
          normalize: true,
          smoothing: true
        }}
        onDataProcessed={handleDataProcessed}
      >
        <div data-testid="data-consumer">Data Consumer</div>
      </TopicTrendsDataProvider>
    );
    
    // Wacht tot de data is verwerkt
    await waitFor(() => {
      expect(handleDataProcessed).toHaveBeenCalled();
    });
    
    // Stop timer en meet data processing tijd
    const processingTime = console.timeEnd('data-processing');
    
    // Data processing zou binnen 200ms moeten zijn voor een goede gebruikerservaring
    expect(processingTime).toBeLessThan(200);
  });
  
  test('handles multiple re-renders efficiently', async () => {
    // Genereer een grote dataset
    const largeDataset = generateLargeDataset(1000);
    
    // Component die meerdere keren re-rendert
    const ReRenderingComponent = () => {
      const [count, setCount] = React.useState(0);
      
      // Trigger 5 re-renders
      React.useEffect(() => {
        if (count < 5) {
          setTimeout(() => {
            setCount(count + 1);
          }, 100);
        }
      }, [count]);
      
      return (
        <TopicTrendsDataProvider
          rawData={largeDataset}
          timeframe="month"
          options={{
            normalize: true,
            smoothing: true
          }}
        >
          <div data-testid="render-count">Render Count: {count}</div>
          <TrendingTopicsTimeline />
        </TopicTrendsDataProvider>
      );
    };
    
    // Start timer voor re-rendering
    console.time('multiple-rerenders');
    
    renderWithTheme(<ReRenderingComponent />);
    
    // Wacht tot alle re-renders zijn voltooid
    await waitFor(() => {
      expect(screen.getByTestId('render-count').textContent).toBe('Render Count: 5');
    }, { timeout: 1000 });
    
    // Stop timer en meet re-rendering tijd
    const rerenderTime = console.timeEnd('multiple-rerenders');
    
    // 5 re-renders zouden binnen 800ms moeten zijn voor een goede gebruikerservaring
    expect(rerenderTime).toBeLessThan(800);
  });
  
  test('memory usage stays within acceptable limits', async () => {
    // Deze test is meer illustratief dan praktisch in Jest
    // In een echte omgeving zou je heap snapshots gebruiken
    
    // Start met een baseline memory meting
    const baselineMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    
    // Genereer een zeer grote dataset
    const veryLargeDataset = generateLargeDataset(5000);
    
    renderWithTheme(
      <TopicTrendsDataProvider
        rawData={veryLargeDataset}
        timeframe="month"
        options={{
          normalize: true,
          smoothing: true
        }}
      >
        <TrendingTopicsTimeline />
      </TopicTrendsDataProvider>
    );
    
    // Wacht tot de data is verwerkt
    await waitFor(() => {
      expect(screen.queryByText(/laden/i)).not.toBeInTheDocument();
    });
    
    // Meet memory gebruik na rendering
    const afterRenderMemory = process.memoryUsage().heapUsed / 1024 / 1024;
    
    // Bereken memory toename
    const memoryIncrease = afterRenderMemory - baselineMemory;
    
    console.log(`Memory increase: ${memoryIncrease.toFixed(2)} MB`);
    
    // Memory toename zou binnen 50MB moeten blijven
    // Dit is een arbitraire waarde en zou moeten worden aangepast op basis van echte metingen
    expect(memoryIncrease).toBeLessThan(50);
  });
});
