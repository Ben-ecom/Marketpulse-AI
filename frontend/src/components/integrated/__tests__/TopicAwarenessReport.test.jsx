import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopicAwarenessReport from '../TopicAwarenessReport';

// Mock de ReactMarkdown component omdat deze dynamisch wordt geladen
jest.mock('react-markdown', () => {
  return ({ children }) => <div data-testid="markdown">{children}</div>;
});

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock data voor tests
const mockTopicsByPhase = {
  awareness: ['Topic 1', 'Topic 2'],
  consideration: ['Topic 3', 'Topic 4'],
  decision: ['Topic 5'],
};

const mockAwarenessDistribution = [
  { phase: 'Awareness', percentage: 40 },
  { phase: 'Consideration', percentage: 35 },
  { phase: 'Decision', percentage: 25 },
];

const mockContentRecommendations = {
  awareness: ['Blog posts', 'Social media content'],
  consideration: ['Case studies', 'Webinars'],
  decision: ['Product demos', 'Customer testimonials'],
};

const mockTrendingTopics = [
  { topic: 'AI', volume: 100, sentiment: 0.8 },
  { topic: 'Machine Learning', volume: 80, sentiment: 0.7 },
];

describe('TopicAwarenessReport Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders loading state correctly', () => {
    render(
      <TopicAwarenessReport
        topicsByPhase={{}}
        awarenessDistribution={[]}
        isLoading={true}
      />
    );
    
    expect(screen.getByText(/laden/i)).toBeInTheDocument();
  });

  test('renders error state when no data is provided', () => {
    render(
      <TopicAwarenessReport
        topicsByPhase={{}}
        awarenessDistribution={[]}
        isLoading={false}
      />
    );
    
    expect(screen.getByText(/geen data beschikbaar/i)).toBeInTheDocument();
  });

  test('renders report configuration form correctly', () => {
    render(
      <TopicAwarenessReport
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
        isLoading={false}
      />
    );
    
    // Controleer of de configuratie formulier elementen aanwezig zijn
    expect(screen.getByLabelText(/productnaam/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industrie/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/doelgroep/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tijdsperiode/i)).toBeInTheDocument();
    
    // Controleer of de sectie checkboxes aanwezig zijn
    expect(screen.getByLabelText(/executive summary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/topic details/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/aanbevelingen/i)).toBeInTheDocument();
    
    // Controleer of de knoppen aanwezig zijn
    expect(screen.getByText(/genereer rapport/i)).toBeInTheDocument();
    expect(screen.getByText(/exporteer als pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/exporteer als excel/i)).toBeInTheDocument();
  });

  test('updates form values correctly', () => {
    render(
      <TopicAwarenessReport
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
        isLoading={false}
      />
    );
    
    // Wijzig formulier waarden
    const productNameInput = screen.getByLabelText(/productnaam/i);
    fireEvent.change(productNameInput, { target: { value: 'Nieuw Product' } });
    
    const industryInput = screen.getByLabelText(/industrie/i);
    fireEvent.change(industryInput, { target: { value: 'Tech' } });
    
    // Controleer of de waarden zijn bijgewerkt
    expect(productNameInput.value).toBe('Nieuw Product');
    expect(industryInput.value).toBe('Tech');
  });

  test('generates report preview when button is clicked', async () => {
    const onReportGenerated = jest.fn();
    
    render(
      <TopicAwarenessReport
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
        isLoading={false}
        onReportGenerated={onReportGenerated}
      />
    );
    
    // Klik op de genereer rapport knop
    fireEvent.click(screen.getByText(/genereer rapport/i));
    
    // Wacht tot de preview zichtbaar is
    await waitFor(() => {
      expect(screen.getByText(/rapport preview/i)).toBeInTheDocument();
    });
    
    // Controleer of de callback is aangeroepen
    expect(onReportGenerated).toHaveBeenCalled();
  });

  test('saves user preferences to localStorage', async () => {
    render(
      <TopicAwarenessReport
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
        isLoading={false}
      />
    );
    
    // Wijzig formulier waarden
    const productNameInput = screen.getByLabelText(/productnaam/i);
    fireEvent.change(productNameInput, { target: { value: 'Nieuw Product' } });
    
    // Klik op de genereer rapport knop
    fireEvent.click(screen.getByText(/genereer rapport/i));
    
    // Wacht tot de voorkeuren zijn opgeslagen
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
    
    // Controleer of de juiste voorkeuren zijn opgeslagen
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      expect.stringContaining('topicAwarenessReportPreferences'),
      expect.stringContaining('Nieuw Product')
    );
  });

  test('loads user preferences from localStorage', () => {
    // Sla voorkeuren op in localStorage
    const preferences = {
      productName: 'Opgeslagen Product',
      industry: 'Opgeslagen Industrie',
      targetAudience: 'Opgeslagen Doelgroep',
      timeframe: 'Opgeslagen Tijdsperiode',
      includeSections: {
        executiveSummary: true,
        topicDetails: true,
        recommendations: false,
        trendAnalysis: false,
      },
      anonymizeData: true,
    };
    
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'topicAwarenessReportPreferences') {
        return JSON.stringify(preferences);
      }
      return null;
    });
    
    render(
      <TopicAwarenessReport
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
        isLoading={false}
      />
    );
    
    // Controleer of de opgeslagen voorkeuren zijn geladen
    expect(screen.getByLabelText(/productnaam/i).value).toBe('Opgeslagen Product');
    expect(screen.getByLabelText(/industrie/i).value).toBe('Opgeslagen Industrie');
    expect(screen.getByLabelText(/doelgroep/i).value).toBe('Opgeslagen Doelgroep');
    expect(screen.getByLabelText(/tijdsperiode/i).value).toBe('Opgeslagen Tijdsperiode');
    
    // Controleer of de checkboxes correct zijn ingesteld
    expect(screen.getByLabelText(/executive summary/i)).toBeChecked();
    expect(screen.getByLabelText(/topic details/i)).toBeChecked();
    expect(screen.getByLabelText(/aanbevelingen/i)).not.toBeChecked();
    
    // Controleer of de anonymize data checkbox correct is ingesteld
    expect(screen.getByLabelText(/anonimiseer data/i)).toBeChecked();
  });

  test('shows help section when help button is clicked', () => {
    render(
      <TopicAwarenessReport
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
        isLoading={false}
      />
    );
    
    // Klik op de help knop
    fireEvent.click(screen.getByLabelText(/help/i));
    
    // Controleer of de help sectie zichtbaar is
    expect(screen.getByText(/hoe gebruik je dit rapport/i)).toBeInTheDocument();
  });

  test('shows snackbar notification when report is generated', async () => {
    render(
      <TopicAwarenessReport
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
        isLoading={false}
      />
    );
    
    // Klik op de genereer rapport knop
    fireEvent.click(screen.getByText(/genereer rapport/i));
    
    // Wacht tot de snackbar zichtbaar is
    await waitFor(() => {
      expect(screen.getByText(/rapport succesvol gegenereerd/i)).toBeInTheDocument();
    });
  });
});
