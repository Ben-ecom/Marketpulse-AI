import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopicAwarenessDashboard from '../TopicAwarenessDashboard';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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
  { topic: 'Data Science', volume: 60, sentiment: 0.6 },
  { topic: 'Big Data', volume: 40, sentiment: 0.5 },
  { topic: 'Neural Networks', volume: 20, sentiment: 0.4 },
];

// Wrapper component met ThemeProvider
const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('TopicAwarenessDashboard Component', () => {
  test('renders loading skeletons when isLoading is true', () => {
    renderWithTheme(
      <TopicAwarenessDashboard
        isLoading={true}
      />
    );
    
    // Controleer of skeletons worden gerenderd
    const skeletons = screen.getAllByTestId(/MuiSkeleton-root/);
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('renders error message when no data is provided', () => {
    renderWithTheme(
      <TopicAwarenessDashboard
        topicsByPhase={{}}
        awarenessDistribution={[]}
        contentRecommendations={{}}
        trendingTopics={[]}
        isLoading={false}
      />
    );
    
    expect(screen.getByText(/geen topic awareness data beschikbaar/i)).toBeInTheDocument();
  });

  test('renders dashboard with all sections when data is provided', () => {
    renderWithTheme(
      <TopicAwarenessDashboard
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        isLoading={false}
      />
    );
    
    // Controleer of alle secties worden gerenderd
    expect(screen.getByText(/topic awareness dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/awareness distributie/i)).toBeInTheDocument();
    expect(screen.getByText(/topics per fase/i)).toBeInTheDocument();
    expect(screen.getByText(/trending topics/i)).toBeInTheDocument();
    expect(screen.getByText(/content aanbevelingen/i)).toBeInTheDocument();
    
    // Controleer of de data correct wordt weergegeven
    expect(screen.getByText(/topic 1/i)).toBeInTheDocument();
    expect(screen.getByText(/topic 3/i)).toBeInTheDocument();
    expect(screen.getByText(/topic 5/i)).toBeInTheDocument();
    expect(screen.getByText(/ai/i)).toBeInTheDocument();
    expect(screen.getByText(/blog posts/i)).toBeInTheDocument();
  });

  test('filters topics when a phase is selected', () => {
    renderWithTheme(
      <TopicAwarenessDashboard
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        isLoading={false}
      />
    );
    
    // Klik op de awareness fase filter
    fireEvent.click(screen.getByText(/awareness/i));
    
    // Controleer of alleen awareness topics worden weergegeven
    expect(screen.getByText(/topic 1/i)).toBeInTheDocument();
    expect(screen.getByText(/topic 2/i)).toBeInTheDocument();
    expect(screen.queryByText(/topic 3/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/topic 5/i)).not.toBeInTheDocument();
    
    // Klik op de consideration fase filter
    fireEvent.click(screen.getByText(/consideration/i));
    
    // Controleer of alleen consideration topics worden weergegeven
    expect(screen.queryByText(/topic 1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/topic 3/i)).toBeInTheDocument();
    expect(screen.getByText(/topic 4/i)).toBeInTheDocument();
    expect(screen.queryByText(/topic 5/i)).not.toBeInTheDocument();
    
    // Klik op de alle fasen filter
    fireEvent.click(screen.getByText(/alle fasen/i));
    
    // Controleer of alle topics worden weergegeven
    expect(screen.getByText(/topic 1/i)).toBeInTheDocument();
    expect(screen.getByText(/topic 3/i)).toBeInTheDocument();
    expect(screen.getByText(/topic 5/i)).toBeInTheDocument();
  });

  test('shows correct number of trending topics', () => {
    renderWithTheme(
      <TopicAwarenessDashboard
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        isLoading={false}
      />
    );
    
    // Controleer of de top 5 trending topics worden weergegeven
    expect(screen.getByText(/ai/i)).toBeInTheDocument();
    expect(screen.getByText(/machine learning/i)).toBeInTheDocument();
    expect(screen.getByText(/data science/i)).toBeInTheDocument();
    expect(screen.getByText(/big data/i)).toBeInTheDocument();
    expect(screen.getByText(/neural networks/i)).toBeInTheDocument();
    
    // Controleer of de trending topics in de juiste volgorde worden weergegeven
    const trendingTopics = screen.getAllByText(/volume:/i);
    expect(trendingTopics.length).toBe(5);
  });

  test('shows correct awareness distribution percentages', () => {
    renderWithTheme(
      <TopicAwarenessDashboard
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        isLoading={false}
      />
    );
    
    // Controleer of de awareness distributie percentages correct worden weergegeven
    expect(screen.getByText(/40%/i)).toBeInTheDocument();
    expect(screen.getByText(/35%/i)).toBeInTheDocument();
    expect(screen.getByText(/25%/i)).toBeInTheDocument();
  });

  test('shows correct content recommendations for each phase', () => {
    renderWithTheme(
      <TopicAwarenessDashboard
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        isLoading={false}
      />
    );
    
    // Controleer of de content aanbevelingen correct worden weergegeven
    expect(screen.getByText(/blog posts/i)).toBeInTheDocument();
    expect(screen.getByText(/social media content/i)).toBeInTheDocument();
    expect(screen.getByText(/case studies/i)).toBeInTheDocument();
    expect(screen.getByText(/webinars/i)).toBeInTheDocument();
    expect(screen.getByText(/product demos/i)).toBeInTheDocument();
    expect(screen.getByText(/customer testimonials/i)).toBeInTheDocument();
  });
});
