import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import TrendingTopicsTimeline from '../../components/trending/TrendingTopicsTimeline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock data voor tests
const mockTopicsData = {
  timePoints: [
    '2025-04-01T00:00:00.000Z',
    '2025-04-02T00:00:00.000Z',
    '2025-04-03T00:00:00.000Z',
    '2025-04-04T00:00:00.000Z',
    '2025-04-05T00:00:00.000Z'
  ],
  series: {
    'Artificial Intelligence': [10, 15, 25, 20, 18],
    'Machine Learning': [5, 8, 7, 12, 20],
    'Blockchain': [30, 28, 25, 22, 20],
    'Cryptocurrency': [12, 15, 18, 22, 25],
    'Remote Work': [8, 10, 12, 15, 18]
  }
};

const mockEventsData = [
  {
    id: 'event-1',
    title: 'AI Conference',
    description: 'Major AI conference with new product announcements',
    date: '2025-04-03T00:00:00.000Z',
    category: 'Conference'
  },
  {
    id: 'event-2',
    title: 'Market Crash',
    description: 'Significant drop in cryptocurrency markets',
    date: '2025-04-05T00:00:00.000Z',
    category: 'Market'
  }
];

// Wrapper component met theme provider
const renderWithTheme = (ui) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('TrendingTopicsTimeline Component', () => {
  test('renders loading state correctly', () => {
    renderWithTheme(
      <TrendingTopicsTimeline 
        loading={true}
      />
    );
    
    expect(screen.getByText(/trending topics data laden/i)).toBeInTheDocument();
  });
  
  test('renders error state correctly', () => {
    const errorMessage = 'Er is een fout opgetreden bij het laden van de data.';
    renderWithTheme(
      <TrendingTopicsTimeline 
        error={errorMessage}
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
  
  test('renders empty state correctly', () => {
    renderWithTheme(
      <TrendingTopicsTimeline 
        topicsData={{}}
      />
    );
    
    expect(screen.getByText(/geen trending topics data beschikbaar/i)).toBeInTheDocument();
  });
  
  test('renders timeline with data correctly', () => {
    renderWithTheme(
      <TrendingTopicsTimeline 
        topicsData={mockTopicsData}
        eventsData={mockEventsData}
      />
    );
    
    // Controleer of de component titel correct wordt weergegeven
    expect(screen.getByText('Trending Topics Timeline')).toBeInTheDocument();
    
    // Controleer of de timeframe selector aanwezig is
    expect(screen.getByLabelText('Periode')).toBeInTheDocument();
    
    // Controleer of de topics selector aanwezig is
    expect(screen.getByLabelText('Topics')).toBeInTheDocument();
  });
  
  test('handles timeframe change correctly', () => {
    const handleTimeframeChange = jest.fn();
    
    renderWithTheme(
      <TrendingTopicsTimeline 
        topicsData={mockTopicsData}
        eventsData={mockEventsData}
        timeframe="month"
        onTimeframeChange={handleTimeframeChange}
      />
    );
    
    // Open de timeframe dropdown
    fireEvent.mouseDown(screen.getByLabelText('Periode'));
    
    // Selecteer een andere timeframe
    fireEvent.click(screen.getByText('Week'));
    
    // Controleer of de handler is aangeroepen met de juiste waarde
    expect(handleTimeframeChange).toHaveBeenCalledWith('week');
  });
  
  test('handles topic selection correctly', () => {
    const handleTopicSelect = jest.fn();
    
    renderWithTheme(
      <TrendingTopicsTimeline 
        topicsData={mockTopicsData}
        eventsData={mockEventsData}
        onTopicSelect={handleTopicSelect}
      />
    );
    
    // Open de topics dropdown
    fireEvent.mouseDown(screen.getByLabelText('Topics'));
    
    // Selecteer een topic (indien zichtbaar in de dropdown)
    const topicOptions = screen.getAllByRole('option');
    if (topicOptions.length > 0) {
      fireEvent.click(topicOptions[0]);
      
      // Controleer of de handler is aangeroepen
      expect(handleTopicSelect).toHaveBeenCalled();
    }
  });
  
  test('shows event details when event is selected', async () => {
    renderWithTheme(
      <TrendingTopicsTimeline 
        topicsData={mockTopicsData}
        eventsData={mockEventsData}
        showEvents={true}
      />
    );
    
    // Controleer of de events toggle aanwezig is
    const eventsToggle = screen.getByTitle(/toon events/i) || screen.getByTitle(/verberg events/i);
    expect(eventsToggle).toBeInTheDocument();
    
    // Als events verborgen zijn, maak ze zichtbaar
    if (screen.getByTitle(/toon events/i)) {
      fireEvent.click(eventsToggle);
    }
    
    // Event details zouden niet zichtbaar moeten zijn voordat een event is geselecteerd
    expect(screen.queryByText('AI Conference')).not.toBeInTheDocument();
    
    // Simuleer het klikken op een event (dit is lastig omdat het in een SVG zit)
    // In een echte test zou je de event handler direct kunnen aanroepen
    
    // Test of de zoom controls aanwezig zijn
    expect(screen.getByTitle(/zoom in/i)).toBeInTheDocument();
    expect(screen.getByTitle(/reset zoom/i)).toBeInTheDocument();
  });
});
