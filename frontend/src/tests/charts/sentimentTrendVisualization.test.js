/**
 * Test voor de SentimentTrendVisualization component
 * Deze test verifieert de functionaliteit en toegankelijkheid van de sentiment trend visualisaties
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
  Legend: () => <div data-testid="mock-legend" />,
  AreaChart: ({ children }) => <div data-testid="mock-area-chart">{children}</div>,
  Area: (props) => <div data-testid="mock-area">{props.dataKey}</div>,
  BarChart: ({ children }) => <div data-testid="mock-bar-chart">{children}</div>,
  Bar: (props) => <div data-testid="mock-bar">{props.dataKey}</div>,
  RechartsTooltip: () => <div data-testid="mock-recharts-tooltip" />
}));

// Import component
import SentimentTrendVisualization from '../../components/charts/SentimentTrendVisualization';

// Test suite voor de SentimentTrendVisualization
describe('SentimentTrendVisualization', () => {
  // Setup mocks voor elke test
  beforeEach(() => {
    // Geen specifieke setup nodig
  });

  // Reset mocks na elke test
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  test('SentimentTrendVisualization rendert correct met data', () => {
    render(
      <SentimentTrendVisualization
        data={{
          timeline: [],
          platforms: [],
          distribution: [],
          categories: []
        }}
        platform="all"
        height={400}
      />
    );

    // Verifieer dat de tabs correct worden weergegeven
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByText('Sentiment Trend')).toBeInTheDocument();
    expect(screen.getByText('Platform Vergelijking')).toBeInTheDocument();
    expect(screen.getByText('Sentiment Verdeling')).toBeInTheDocument();
    expect(screen.getByText('Sentiment per Categorie')).toBeInTheDocument();
  });

  test('SentimentTrendVisualization heeft correcte toegankelijkheidsattributen voor tabs', () => {
    render(
      <SentimentTrendVisualization
        data={{
          timeline: [],
          platforms: [],
          distribution: [],
          categories: []
        }}
        platform="all"
        height={400}
      />
    );
    
    // Controleer de tablist
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-label', 'Sentiment visualisatie opties');
    
    // Controleer de tabs
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    
    // Controleer de eerste tab
    expect(tabs[0]).toHaveAttribute('id', 'sentiment-tab-0');
    expect(tabs[0]).toHaveAttribute('aria-controls', 'sentiment-tabpanel-0');
    
    // Controleer de tabpanels
    const tabpanels = screen.getAllByRole('tabpanel');
    expect(tabpanels).toHaveLength(4);
    
    // Controleer het eerste tabpanel
    expect(tabpanels[0]).toHaveAttribute('id', 'sentiment-tabpanel-0');
    expect(tabpanels[0]).toHaveAttribute('aria-labelledby', 'sentiment-tab-0');
  });

  test('SentimentTrendVisualization toont fallback met correcte toegankelijkheidsattributen wanneer geen data beschikbaar is', () => {
    render(
      <SentimentTrendVisualization
        data={null}
        platform="all"
        height={400}
      />
    );
    
    // Controleer de fallback message
    const fallbackMessage = screen.getByText('Geen data beschikbaar voor visualisatie.');
    expect(fallbackMessage).toBeInTheDocument();
    
    // Controleer de toegankelijkheidsattributen van de container
    const statusContainer = screen.getByRole('status');
    expect(statusContainer).toHaveAttribute('aria-live', 'polite');
  });

  test('SentimentTrendVisualization tab navigatie werkt correct met toegankelijkheidsattributen', async () => {
    // Setup user-event
    const user = userEvent.setup();
    
    render(
      <SentimentTrendVisualization
        data={{
          timeline: [],
          platforms: [],
          distribution: [],
          categories: []
        }}
        platform="all"
        height={400}
      />
    );
    
    // Controleer dat de eerste tab actief is
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    
    // Klik op de tweede tab
    await user.click(tabs[1]);
    
    // Controleer dat de tweede tab nu actief is
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    
    // Controleer dat het juiste tabpanel zichtbaar is
    const tabpanels = screen.getAllByRole('tabpanel');
    expect(tabpanels[0]).toHaveAttribute('hidden');
    expect(tabpanels[1]).not.toHaveAttribute('hidden');
  });

  test('SentimentTrendVisualization filter controls hebben correcte toegankelijkheidsattributen', async () => {
    // Setup user-event
    const user = userEvent.setup();
    
    render(
      <SentimentTrendVisualization
        data={{
          timeline: [],
          platforms: [],
          distribution: [],
          categories: []
        }}
        platform="all"
        height={400}
      />
    );
    
    // Ga naar de categorie tab
    const tabs = screen.getAllByRole('tab');
    await user.click(tabs[3]);
    
    // Controleer de categorie select
    const categorySelect = screen.getByLabelText('Categorie');
    expect(categorySelect).toBeInTheDocument();
    expect(categorySelect).toHaveAttribute('aria-describedby', 'category-select-description');
    
    // Controleer de info button
    const infoButton = screen.getByLabelText('Meer informatie over sentiment per categorie grafiek');
    expect(infoButton).toBeInTheDocument();
    expect(infoButton.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});
