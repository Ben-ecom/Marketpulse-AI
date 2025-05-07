import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TrendAnalysis from '../TrendAnalysis';

// Creëer een thema voor de tests
const theme = createTheme();

// Mock data
const mockTrendingTopics = [
  { topic: 'Topic 1', volume: 100, sentiment: 0.8 },
  { topic: 'Topic 2', volume: 90, sentiment: 0.7 },
  { topic: 'Topic 3', volume: 80, sentiment: 0.6 },
  { topic: 'Topic 4', volume: 70, sentiment: 0.5 },
  { topic: 'Topic 5', volume: 60, sentiment: 0.4 }
];

// Genereer mock tijdreeks data voor de afgelopen 30 dagen
const generateMockTimeSeriesData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    mockTrendingTopics.forEach(topicData => {
      // Voeg wat random variatie toe aan de volumes en sentiment scores
      const randomVolume = Math.floor(topicData.volume * (0.8 + Math.random() * 0.4));
      const randomSentiment = Math.max(0, Math.min(1, topicData.sentiment * (0.9 + Math.random() * 0.2)));
      
      data.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD
        topic: topicData.topic,
        volume: randomVolume,
        sentiment: randomSentiment
      });
    });
  }
  
  return data;
};

const mockTimeSeriesData = generateMockTimeSeriesData();

describe('TrendAnalysis', () => {
  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <TrendAnalysis
          trendingTopics={mockTrendingTopics}
          timeSeriesData={mockTimeSeriesData}
          isLoading={false}
          {...props}
        />
      </ThemeProvider>
    );
  };
  
  // Test 1: Component rendert correct
  test('rendert de component zonder errors', () => {
    renderComponent();
    
    // Controleer of de titel wordt weergegeven
    expect(screen.getByText('Trend Analyse')).toBeInTheDocument();
    
    // Controleer of de filters worden weergegeven
    expect(screen.getByLabelText('Topic')).toBeInTheDocument();
    
    // Controleer of de trend chart wordt weergegeven
    expect(screen.getByText('Volume Trend')).toBeInTheDocument();
    
    // Controleer of de trend indicators sectie wordt weergegeven
    expect(screen.getByText('Trend Indicatoren')).toBeInTheDocument();
  });
  
  // Test 2: Loading state werkt correct
  test('toont loading skeletons wanneer isLoading=true', () => {
    renderComponent({ isLoading: true });
    
    // Controleer of er skeletons worden weergegeven
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
    
    // Controleer of de inhoud niet wordt weergegeven
    expect(screen.queryByText('Volume Trend')).not.toBeInTheDocument();
  });
  
  // Test 3: Lege state werkt correct
  test('toont een melding wanneer er geen data is', () => {
    renderComponent({ trendingTopics: [], timeSeriesData: [] });
    
    // Controleer of de lege state melding wordt weergegeven
    expect(screen.getByText('Geen trend data beschikbaar')).toBeInTheDocument();
  });
  
  // Test 4: Topic filter werkt correct
  test('filtert data correct op basis van geselecteerd topic', async () => {
    renderComponent();
    
    // Selecteer een specifiek topic
    fireEvent.mouseDown(screen.getByLabelText('Topic'));
    fireEvent.click(screen.getByText('Topic 1'));
    
    // Controleer of de data gefilterd is
    await waitFor(() => {
      // In de gefilterde weergave zou alleen 'Topic 1' moeten worden getoond in de trend indicators
      const topicIndicators = screen.getAllByRole('heading', { level: 6 });
      expect(topicIndicators.length).toBe(1);
      expect(topicIndicators[0]).toHaveTextContent('Topic 1');
    });
  });
  
  // Test 5: Granulariteit filter werkt correct
  test('wijzigt de granulariteit correct bij selectie van een andere optie', async () => {
    renderComponent();
    
    // Controleer of de standaard granulariteit 'week' is
    expect(screen.getByLabelText('week')).toHaveAttribute('aria-pressed', 'true');
    
    // Wijzig de granulariteit naar 'dag'
    fireEvent.click(screen.getByLabelText('dag'));
    
    // Controleer of de granulariteit is gewijzigd
    await waitFor(() => {
      expect(screen.getByLabelText('dag')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByLabelText('week')).toHaveAttribute('aria-pressed', 'false');
    });
    
    // Wijzig de granulariteit naar 'maand'
    fireEvent.click(screen.getByLabelText('maand'));
    
    // Controleer of de granulariteit is gewijzigd
    await waitFor(() => {
      expect(screen.getByLabelText('maand')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByLabelText('dag')).toHaveAttribute('aria-pressed', 'false');
    });
  });
  
  // Test 6: Data type filter werkt correct
  test('wijzigt het data type correct bij selectie van een andere optie', async () => {
    renderComponent();
    
    // Controleer of het standaard data type 'volume' is
    expect(screen.getByLabelText('volume')).toHaveAttribute('aria-pressed', 'true');
    
    // Wijzig het data type naar 'sentiment'
    fireEvent.click(screen.getByLabelText('sentiment'));
    
    // Controleer of het data type is gewijzigd
    await waitFor(() => {
      expect(screen.getByLabelText('sentiment')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByLabelText('volume')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByText('Sentiment Trend')).toBeInTheDocument();
    });
  });
  
  // Test 7: Trend indicators worden correct weergegeven
  test('toont correcte trend indicators op basis van de data', () => {
    renderComponent();
    
    // Controleer of de trend indicators worden weergegeven
    const trendIndicators = screen.getAllByTestId('trend-indicator');
    expect(trendIndicators.length).toBeGreaterThan(0);
    
    // Controleer of er verschillende trend types worden weergegeven (stijgend, dalend, stabiel)
    const upTrends = screen.getAllByTestId('TrendingUpIcon');
    const downTrends = screen.getAllByTestId('TrendingDownIcon');
    const stableTrends = screen.getAllByTestId('TrendingFlatIcon');
    
    // Er moet minstens één van elk type zijn (of geen als de data dat niet ondersteunt)
    const totalTrends = upTrends.length + downTrends.length + stableTrends.length;
    expect(totalTrends).toBeGreaterThan(0);
  });
});
