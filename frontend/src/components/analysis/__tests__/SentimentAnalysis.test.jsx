import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SentimentAnalysis from '../SentimentAnalysis';

// Creëer een thema voor de tests
const theme = createTheme();

// Mock data
const mockTopicsByPhase = {
  'Unaware': ['Topic 1', 'Topic 2'],
  'Problem Aware': ['Topic 3', 'Topic 4'],
  'Solution Aware': ['Topic 5', 'Topic 6'],
  'Product Aware': ['Topic 7', 'Topic 8'],
  'Most Aware': ['Topic 9', 'Topic 10']
};

const mockTrendingTopics = [
  { topic: 'Topic 1', volume: 100, sentiment: 0.8 },
  { topic: 'Topic 2', volume: 90, sentiment: 0.7 },
  { topic: 'Topic 3', volume: 80, sentiment: 0.6 },
  { topic: 'Topic 4', volume: 70, sentiment: 0.5 },
  { topic: 'Topic 5', volume: 60, sentiment: 0.4 },
  { topic: 'Topic 6', volume: 50, sentiment: 0.3 },
  { topic: 'Topic 7', volume: 40, sentiment: 0.2 },
  { topic: 'Topic 8', volume: 30, sentiment: 0.1 },
  { topic: 'Topic 9', volume: 20, sentiment: 0.9 },
  { topic: 'Topic 10', volume: 10, sentiment: 0.95 }
];

describe('SentimentAnalysis', () => {
  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <SentimentAnalysis
          topicsByPhase={mockTopicsByPhase}
          trendingTopics={mockTrendingTopics}
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
    expect(screen.getByText('Sentiment Analyse')).toBeInTheDocument();
    
    // Controleer of de filters worden weergegeven
    expect(screen.getByLabelText('Awareness Fase')).toBeInTheDocument();
    expect(screen.getByLabelText('Topic')).toBeInTheDocument();
    
    // Controleer of de overall sentiment sectie wordt weergegeven
    expect(screen.getByText('Overall Sentiment')).toBeInTheDocument();
    
    // Controleer of de sentiment per fase sectie wordt weergegeven
    expect(screen.getByText('Sentiment per Awareness Fase')).toBeInTheDocument();
    
    // Controleer of de sentiment per topic sectie wordt weergegeven
    expect(screen.getByText('Sentiment per Topic')).toBeInTheDocument();
  });
  
  // Test 2: Loading state werkt correct
  test('toont loading skeletons wanneer isLoading=true', () => {
    renderComponent({ isLoading: true });
    
    // Controleer of er skeletons worden weergegeven
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
    
    // Controleer of de inhoud niet wordt weergegeven
    expect(screen.queryByText('Overall Sentiment')).not.toBeInTheDocument();
  });
  
  // Test 3: Lege state werkt correct
  test('toont een melding wanneer er geen data is', () => {
    renderComponent({ topicsByPhase: {}, trendingTopics: [] });
    
    // Controleer of de lege state melding wordt weergegeven
    expect(screen.getByText('Geen sentiment data beschikbaar')).toBeInTheDocument();
  });
  
  // Test 4: Fase filter werkt correct
  test('filtert data correct op basis van geselecteerde fase', async () => {
    renderComponent();
    
    // Selecteer een specifieke fase
    fireEvent.mouseDown(screen.getByLabelText('Awareness Fase'));
    fireEvent.click(screen.getByText('Problem Aware'));
    
    // Controleer of de data gefilterd is
    await waitFor(() => {
      // In de gefilterde weergave zouden alleen topics uit de 'Problem Aware' fase moeten worden getoond
      expect(screen.getByText('Topic 3')).toBeInTheDocument();
      expect(screen.getByText('Topic 4')).toBeInTheDocument();
      expect(screen.queryByText('Topic 1')).not.toBeInTheDocument();
    });
  });
  
  // Test 5: Topic filter werkt correct
  test('filtert data correct op basis van geselecteerd topic', async () => {
    renderComponent();
    
    // Selecteer een specifiek topic
    fireEvent.mouseDown(screen.getByLabelText('Topic'));
    fireEvent.click(screen.getByText('Topic 1'));
    
    // Controleer of de data gefilterd is
    await waitFor(() => {
      // In de gefilterde weergave zou alleen 'Topic 1' moeten worden getoond
      const topicCards = screen.getAllByRole('heading', { level: 6 });
      expect(topicCards.length).toBe(1);
      expect(topicCards[0]).toHaveTextContent('Topic 1');
    });
  });
  
  // Test 6: Sentiment indicators worden correct weergegeven
  test('toont correcte sentiment indicators op basis van sentiment scores', () => {
    renderComponent();
    
    // Controleer of positieve sentiment indicators worden weergegeven voor topics met hoge sentiment scores
    const positiveIcons = screen.getAllByTestId('SentimentVerySatisfiedIcon');
    expect(positiveIcons.length).toBeGreaterThan(0);
    
    // Controleer of neutrale sentiment indicators worden weergegeven voor topics met gemiddelde sentiment scores
    const neutralIcons = screen.getAllByTestId('SentimentNeutralIcon');
    expect(neutralIcons.length).toBeGreaterThan(0);
    
    // Controleer of negatieve sentiment indicators worden weergegeven voor topics met lage sentiment scores
    const negativeIcons = screen.getAllByTestId('SentimentVeryDissatisfiedIcon');
    expect(negativeIcons.length).toBeGreaterThan(0);
  });
  
  // Test 7: Percentage bars worden correct weergegeven
  test('toont correcte percentage bars op basis van sentiment distributie', () => {
    renderComponent();
    
    // Controleer of de percentage bars worden weergegeven
    const percentageBars = screen.getAllByTestId('percentage-bar');
    expect(percentageBars.length).toBeGreaterThan(0);
    
    // Controleer of de percentages correct worden berekend
    const positivePercentages = screen.getAllByTestId('positive-percentage');
    const neutralPercentages = screen.getAllByTestId('neutral-percentage');
    const negativePercentages = screen.getAllByTestId('negative-percentage');
    
    // De som van de percentages moet 100% zijn
    positivePercentages.forEach((positive, index) => {
      const positiveValue = parseInt(positive.textContent);
      const neutralValue = parseInt(neutralPercentages[index].textContent);
      const negativeValue = parseInt(negativePercentages[index].textContent);
      
      expect(positiveValue + neutralValue + negativeValue).toBe(100);
    });
  });
});
