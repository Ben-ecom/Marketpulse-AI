/**
 * Test voor de SentimentAnalysisChart component
 * Deze test verifieert de functionaliteit en toegankelijkheid van de sentiment analyse visualisaties
 */

// Import testing libraries
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import Jest globals
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock ReactMarkdown component
jest.mock('react-markdown', () => (props) => {
  return props.children;
});

// Mock Recharts componenten
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="mock-responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="mock-pie-chart">{children}</div>,
  Pie: (props) => <div data-testid="mock-pie">{props.dataKey}</div>,
  Cell: () => <div data-testid="mock-cell" />,
  LineChart: ({ children }) => <div data-testid="mock-line-chart">{children}</div>,
  Line: (props) => <div data-testid="mock-line">{props.dataKey}</div>,
  XAxis: () => <div data-testid="mock-xaxis" />,
  YAxis: () => <div data-testid="mock-yaxis" />,
  CartesianGrid: () => <div data-testid="mock-cartesian-grid" />,
  Tooltip: () => <div data-testid="mock-tooltip" />,
  Legend: () => <div data-testid="mock-legend" />
}));

// Import component
import SentimentAnalysisChart from '../../components/sentiment/SentimentAnalysisChart';

// Mock data
const mockSentimentData = [
  { sentiment: 0.8, timestamp: '2023-05-01T12:00:00Z', platform: 'twitter', text: 'Zeer positieve feedback!' },
  { sentiment: 0.4, timestamp: '2023-05-02T14:30:00Z', platform: 'twitter', text: 'Redelijk positieve feedback' },
  { sentiment: 0.0, timestamp: '2023-05-03T10:15:00Z', platform: 'reddit', text: 'Neutrale feedback' },
  { sentiment: -0.3, timestamp: '2023-05-04T09:45:00Z', platform: 'reddit', text: 'Licht negatieve feedback' },
  { sentiment: -0.7, timestamp: '2023-05-05T16:20:00Z', platform: 'trustpilot', text: 'Zeer negatieve feedback!' }
];

const mockPlatforms = ['twitter', 'reddit', 'trustpilot'];

// Test suite voor de SentimentAnalysisChart
describe('SentimentAnalysisChart', () => {
  // Setup mocks voor elke test
  beforeEach(() => {
    // Geen specifieke setup nodig
  });

  // Reset mocks na elke test
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test('SentimentAnalysisChart rendert correct met data', () => {
    render(
      <SentimentAnalysisChart
        data={mockSentimentData}
        title="Test Sentiment Analyse"
        platforms={mockPlatforms}
        projectName="Test Project"
      />
    );

    // Verifieer dat de component correct rendert
    expect(screen.getByText('Test Sentiment Analyse')).toBeInTheDocument();
    
    // Verifieer dat de filter opties worden weergegeven
    expect(screen.getByLabelText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Alle platforms')).toBeInTheDocument();
    
    // Verifieer dat de chart type toggle buttons worden weergegeven
    expect(screen.getByLabelText('Cirkeldiagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Trendgrafiek')).toBeInTheDocument();
    
    // Verifieer dat de data summary wordt weergegeven
    expect(screen.getByText(/Totaal aantal items:/)).toBeInTheDocument();
    
    // Verifieer dat de statistieken worden weergegeven
    expect(screen.getByText('Sentiment Statistieken')).toBeInTheDocument();
  });

  test('SentimentAnalysisChart heeft correcte toegankelijkheidsattributen', async () => {
    // Setup user-event
    const user = userEvent.setup();
    
    render(
      <SentimentAnalysisChart
        data={mockSentimentData}
        title="Test Sentiment Analyse"
        platforms={mockPlatforms}
        projectName="Test Project"
      />
    );
    
    // 1. Controleer de toggle buttons voor chart type
    const pieChartButton = screen.getByLabelText('Cirkeldiagram');
    const trendChartButton = screen.getByLabelText('Trendgrafiek');
    
    expect(pieChartButton).toHaveAttribute('aria-pressed', 'true'); // Default is pie chart
    expect(trendChartButton).toHaveAttribute('aria-pressed', 'false');
    
    // Controleer de beschrijvende tekst voor schermlezers
    expect(screen.getByText('Toon sentiment verdeling als cirkeldiagram')).toBeInTheDocument();
    expect(screen.getByText('Toon sentiment ontwikkeling over tijd')).toBeInTheDocument();
    
    // 2. Controleer de filter opties
    const filterGroup = screen.getByRole('group', { name: 'Filter opties' });
    expect(filterGroup).toBeInTheDocument();
    
    const platformSelect = screen.getByLabelText('Platform');
    expect(platformSelect).toHaveAttribute('aria-describedby', 'platform-select-description');
    
    // 3. Controleer de chart container
    const chartContainer = screen.getByRole('figure');
    expect(chartContainer).toHaveAttribute('aria-label', 'Cirkeldiagram van sentiment verdeling');
    
    // 4. Controleer de statistieken sectie
    const statsRegion = screen.getByRole('region', { name: 'Sentiment statistieken' });
    expect(statsRegion).toBeInTheDocument();
    
    // 5. Test interactie: wissel naar trend chart
    await user.click(trendChartButton);
    
    // Controleer of de aria-pressed attributen correct zijn bijgewerkt
    expect(pieChartButton).toHaveAttribute('aria-pressed', 'false');
    expect(trendChartButton).toHaveAttribute('aria-pressed', 'true');
    
    // Controleer of de aria-label van de chart container is bijgewerkt
    const updatedChartContainer = screen.getByRole('figure');
    expect(updatedChartContainer).toHaveAttribute('aria-label', 'Trendgrafiek van sentiment over tijd');
    
    // Controleer of het tijdsinterval select veld nu zichtbaar is
    const timeIntervalSelect = screen.getByLabelText('Tijdsinterval');
    expect(timeIntervalSelect).toBeInTheDocument();
    expect(timeIntervalSelect).toHaveAttribute('aria-describedby', 'time-interval-description');
  });

  test('SentimentAnalysisChart toont correcte leeg-staat berichten met toegankelijkheidsattributen', () => {
    render(
      <SentimentAnalysisChart
        data={[]}
        title="Test Sentiment Analyse"
        platforms={mockPlatforms}
        projectName="Test Project"
      />
    );
    
    // Controleer of het leeg-staat bericht wordt weergegeven
    const emptyState = screen.getByText('Geen data beschikbaar voor visualisatie');
    expect(emptyState).toBeInTheDocument();
    
    // Controleer of de container de juiste toegankelijkheidsattributen heeft
    const statusContainer = emptyState.closest('[role="status"]');
    expect(statusContainer).toHaveAttribute('aria-live', 'polite');
  });
});
