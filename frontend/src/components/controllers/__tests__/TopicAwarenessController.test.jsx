import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import TopicAwarenessController from '../TopicAwarenessController';
import * as topicAwarenessService from '../../../services/topicAwarenessService';

// Mock de services
jest.mock('../../../services/topicAwarenessService');

// Mock de componenten die worden gebruikt in de controller
jest.mock('../../integrated/TopicAwarenessReport', () => {
  return function MockTopicAwarenessReport(props) {
    return (
      <div data-testid="topic-awareness-report">
        <button onClick={props.onGenerateReport}>Generate Report</button>
      </div>
    );
  };
});

jest.mock('../../dashboards/TopicAwarenessDashboard', () => {
  return function MockTopicAwarenessDashboard(props) {
    return (
      <div data-testid="topic-awareness-dashboard">
        Dashboard Mock
      </div>
    );
  };
});

jest.mock('../../export/DashboardExport', () => {
  return function MockDashboardExport(props) {
    return (
      <button 
        data-testid="dashboard-export"
        onClick={() => props.onExportComplete({ format: 'pdf' })}
      >
        Export
      </button>
    );
  };
});

jest.mock('../../export/ShareInsights', () => {
  return function MockShareInsights(props) {
    return (
      <button 
        data-testid="share-insights"
        onClick={() => props.onShareComplete({ method: 'email' })}
      >
        Share
      </button>
    );
  };
});

// Mock data
const mockTopicsByPhase = {
  'Unaware': ['Topic 1', 'Topic 2'],
  'Problem Aware': ['Topic 3', 'Topic 4'],
  'Solution Aware': ['Topic 5', 'Topic 6'],
  'Product Aware': ['Topic 7', 'Topic 8'],
  'Most Aware': ['Topic 9', 'Topic 10']
};

const mockAwarenessDistribution = [
  { phase: 'Unaware', percentage: 20 },
  { phase: 'Problem Aware', percentage: 25 },
  { phase: 'Solution Aware', percentage: 30 },
  { phase: 'Product Aware', percentage: 15 },
  { phase: 'Most Aware', percentage: 10 }
];

const mockContentRecommendations = {
  'Unaware': ['Recommendation 1', 'Recommendation 2'],
  'Problem Aware': ['Recommendation 3', 'Recommendation 4'],
  'Solution Aware': ['Recommendation 5', 'Recommendation 6'],
  'Product Aware': ['Recommendation 7', 'Recommendation 8'],
  'Most Aware': ['Recommendation 9', 'Recommendation 10']
};

const mockTrendingTopics = [
  { topic: 'Topic 1', volume: 100, sentiment: 0.8 },
  { topic: 'Topic 2', volume: 90, sentiment: 0.7 },
  { topic: 'Topic 3', volume: 80, sentiment: 0.6 },
  { topic: 'Topic 4', volume: 70, sentiment: 0.5 },
  { topic: 'Topic 5', volume: 60, sentiment: 0.4 }
];

describe('TopicAwarenessController', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    topicAwarenessService.fetchTopicsByPhase.mockResolvedValue(mockTopicsByPhase);
    topicAwarenessService.fetchAwarenessDistribution.mockResolvedValue(mockAwarenessDistribution);
    topicAwarenessService.fetchContentRecommendations.mockResolvedValue(mockContentRecommendations);
    topicAwarenessService.fetchTrendingTopics.mockResolvedValue(mockTrendingTopics);
  });
  
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <TopicAwarenessController projectId="test-project" projectName="Test Project" />
      </BrowserRouter>
    );
  };
  
  // Test 1: Component rendert correct
  test('rendert de component zonder errors', async () => {
    renderComponent();
    
    // Controleer of de laad-indicator wordt weergegeven
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Controleer of de dashboard view standaard wordt weergegeven
    expect(screen.getByTestId('topic-awareness-dashboard')).toBeInTheDocument();
  });
  
  // Test 2: Data wordt correct opgehaald
  test('haalt alle benodigde data op bij initialisatie', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(topicAwarenessService.fetchTopicsByPhase).toHaveBeenCalledTimes(1);
      expect(topicAwarenessService.fetchAwarenessDistribution).toHaveBeenCalledTimes(1);
      expect(topicAwarenessService.fetchContentRecommendations).toHaveBeenCalledTimes(1);
      expect(topicAwarenessService.fetchTrendingTopics).toHaveBeenCalledTimes(1);
    });
  });
  
  // Test 3: View switching werkt correct
  test('schakelt tussen dashboard en rapport views', async () => {
    renderComponent();
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Controleer of de dashboard view standaard wordt weergegeven
    expect(screen.getByTestId('topic-awareness-dashboard')).toBeInTheDocument();
    
    // Schakel naar rapport view
    fireEvent.click(screen.getByText('Rapport'));
    
    // Controleer of de rapport view wordt weergegeven
    expect(screen.getByTestId('topic-awareness-report')).toBeInTheDocument();
    
    // Schakel terug naar dashboard view
    fireEvent.click(screen.getByText('Dashboard'));
    
    // Controleer of de dashboard view weer wordt weergegeven
    expect(screen.getByTestId('topic-awareness-dashboard')).toBeInTheDocument();
  });
  
  // Test 4: Export functionaliteit werkt correct
  test('exporteert dashboard data correct', async () => {
    renderComponent();
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Klik op de export knop
    fireEvent.click(screen.getByTestId('dashboard-export'));
    
    // Controleer of de snackbar wordt weergegeven met het juiste bericht
    expect(screen.getByText('Dashboard succesvol geëxporteerd als pdf')).toBeInTheDocument();
  });
  
  // Test 5: Share functionaliteit werkt correct
  test('deelt inzichten correct', async () => {
    renderComponent();
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Klik op de share knop
    fireEvent.click(screen.getByTestId('share-insights'));
    
    // Controleer of de snackbar wordt weergegeven met het juiste bericht
    expect(screen.getByText('Inzichten succesvol gedeeld via email')).toBeInTheDocument();
  });
  
  // Test 6: Foutafhandeling werkt correct
  test('handelt fouten correct af bij het ophalen van data', async () => {
    // Setup mock implementatie om een fout te gooien
    topicAwarenessService.fetchTopicsByPhase.mockRejectedValue(new Error('API Error'));
    
    renderComponent();
    
    // Wacht tot de foutmelding wordt weergegeven
    await waitFor(() => {
      expect(screen.getByText('Er is een fout opgetreden bij het ophalen van de data: API Error')).toBeInTheDocument();
    });
  });
  
  // Test 7: DataSource en DateRange filters werken correct
  test('filtert data correct op basis van geselecteerde databron en datumbereik', async () => {
    renderComponent();
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Simuleer het selecteren van een databron
    fireEvent.click(screen.getByLabelText('Databron'));
    fireEvent.click(screen.getByText('Reddit'));
    
    // Controleer of de data opnieuw wordt opgehaald met de juiste parameters
    expect(topicAwarenessService.fetchTopicsByPhase).toHaveBeenCalledWith(
      expect.objectContaining({ dataSource: 'reddit' })
    );
    
    // Simuleer het selecteren van een datumbereik
    fireEvent.click(screen.getByLabelText('Datumbereik'));
    fireEvent.click(screen.getByText('Afgelopen maand'));
    
    // Controleer of de data opnieuw wordt opgehaald met de juiste parameters
    expect(topicAwarenessService.fetchTopicsByPhase).toHaveBeenCalledWith(
      expect.objectContaining({ 
        startDate: expect.any(String),
        endDate: expect.any(String)
      })
    );
  });
});
