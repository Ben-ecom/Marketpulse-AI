import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TrendingTopicsPage from '../../pages/TrendingTopicsPage';

// Mock de API service
jest.mock('../../services/api', () => ({
  fetchTopicData: jest.fn().mockImplementation(() => Promise.resolve({
    topics: [
      { topic: 'Artificial Intelligence', count: 1500, source: 'twitter', timestamp: '2025-04-25T10:00:00.000Z' },
      { topic: 'Artificial Intelligence', count: 1600, source: 'twitter', timestamp: '2025-04-26T10:00:00.000Z' },
      { topic: 'Artificial Intelligence', count: 1800, source: 'twitter', timestamp: '2025-04-27T10:00:00.000Z' },
      { topic: 'Machine Learning', count: 1200, source: 'twitter', timestamp: '2025-04-25T11:00:00.000Z' },
      { topic: 'Machine Learning', count: 1300, source: 'twitter', timestamp: '2025-04-26T11:00:00.000Z' },
      { topic: 'Machine Learning', count: 1400, source: 'twitter', timestamp: '2025-04-27T11:00:00.000Z' },
      { topic: 'Blockchain', count: 800, source: 'reddit', timestamp: '2025-04-25T12:00:00.000Z' },
      { topic: 'Blockchain', count: 850, source: 'reddit', timestamp: '2025-04-26T12:00:00.000Z' },
      { topic: 'Blockchain', count: 900, source: 'reddit', timestamp: '2025-04-27T12:00:00.000Z' },
      { topic: 'Cryptocurrency', count: 750, source: 'reddit', timestamp: '2025-04-25T13:00:00.000Z' },
      { topic: 'Cryptocurrency', count: 780, source: 'reddit', timestamp: '2025-04-26T13:00:00.000Z' },
      { topic: 'Cryptocurrency', count: 820, source: 'reddit', timestamp: '2025-04-27T13:00:00.000Z' },
      { topic: 'Remote Work', count: 600, source: 'google', timestamp: '2025-04-25T14:00:00.000Z' },
      { topic: 'Remote Work', count: 620, source: 'google', timestamp: '2025-04-26T14:00:00.000Z' },
      { topic: 'Remote Work', count: 650, source: 'google', timestamp: '2025-04-27T14:00:00.000Z' }
    ],
    events: [
      {
        id: 'event-1',
        title: 'AI Conference',
        description: 'Major AI conference with new product announcements',
        date: '2025-04-26T12:00:00.000Z',
        category: 'Conference'
      },
      {
        id: 'event-2',
        title: 'Crypto Market Crash',
        description: 'Significant drop in cryptocurrency markets',
        date: '2025-04-27T10:00:00.000Z',
        category: 'Market'
      }
    ]
  }))
}));

// Mock de export functies
jest.mock('../../utils/export', () => ({
  exportToCsv: jest.fn(),
  exportToImage: jest.fn(),
  exportToJson: jest.fn(),
  exportToExcel: jest.fn(),
  exportToPdf: jest.fn()
}));

// Wrapper component met theme provider en router
const renderWithThemeAndRouter = (ui, { route = '/projects/123/trending-topics' } = {}) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/projects/:projectId/trending-topics" element={ui} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('Trending Topics Page Scenarios', () => {
  // Scenario 1: Gebruiker bekijkt trending topics en wijzigt timeframe
  test('Scenario 1: User views trending topics and changes timeframe', async () => {
    renderWithThemeAndRouter(<TrendingTopicsPage />);
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByText(/trending topics data laden/i)).not.toBeInTheDocument();
    });
    
    // Controleer of de pagina titel correct wordt weergegeven
    expect(screen.getByText('Trending Topics Analyse')).toBeInTheDocument();
    
    // Controleer of de topics worden weergegeven
    expect(screen.getByText('Topic Selectie')).toBeInTheDocument();
    
    // Wijzig de timeframe
    const timeframeSelect = screen.getAllByLabelText('Periode')[0];
    fireEvent.mouseDown(timeframeSelect);
    fireEvent.click(screen.getByText('Week'));
    
    // Controleer of de API opnieuw wordt aangeroepen met de nieuwe timeframe
    expect(require('../../services/api').fetchTopicData).toHaveBeenCalledWith('week', expect.anything());
  });
  
  // Scenario 2: Gebruiker selecteert specifieke topics voor vergelijking
  test('Scenario 2: User selects specific topics for comparison', async () => {
    renderWithThemeAndRouter(<TrendingTopicsPage />);
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByText(/trending topics data laden/i)).not.toBeInTheDocument();
    });
    
    // Ga naar de Topic Vergelijking tab
    fireEvent.click(screen.getByText('Topic Vergelijking'));
    
    // Controleer of de juiste tab content wordt weergegeven
    expect(screen.getByText('Selecteer topics in het linkerpaneel om ze te vergelijken.')).toBeInTheDocument();
    
    // Open de topics dropdown
    const topicSelect = screen.getAllByLabelText(/topics/i)[0] || screen.getAllByLabelText(/geselecteerde topics/i)[0];
    fireEvent.mouseDown(topicSelect);
    
    // Wacht tot de dropdown opties zijn geladen
    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });
    
    // Selecteer een topic (indien zichtbaar in de dropdown)
    const options = screen.getAllByRole('option');
    if (options.length > 0) {
      fireEvent.click(options[0]);
    }
    
    // Sluit de dropdown
    fireEvent.mouseDown(topicSelect);
  });
  
  // Scenario 3: Gebruiker bekijkt event details
  test('Scenario 3: User views event details', async () => {
    renderWithThemeAndRouter(<TrendingTopicsPage />);
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByText(/trending topics data laden/i)).not.toBeInTheDocument();
    });
    
    // Ga naar de Event Analyse tab
    fireEvent.click(screen.getByText('Event Analyse'));
    
    // Controleer of de events worden weergegeven
    expect(screen.getByText('AI Conference')).toBeInTheDocument();
    expect(screen.getByText('Crypto Market Crash')).toBeInTheDocument();
    
    // Klik op een event om details te bekijken
    fireEvent.click(screen.getByText('AI Conference'));
    
    // Controleer of de event details worden weergegeven
    expect(screen.getByText('Major AI conference with new product announcements')).toBeInTheDocument();
  });
  
  // Scenario 4: Gebruiker exporteert data
  test('Scenario 4: User exports data', async () => {
    renderWithThemeAndRouter(<TrendingTopicsPage />);
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByText(/trending topics data laden/i)).not.toBeInTheDocument();
    });
    
    // Klik op de CSV export knop
    fireEvent.click(screen.getByText('Export CSV'));
    
    // Controleer of de export functie is aangeroepen
    expect(require('../../utils/export').exportToCsv).toHaveBeenCalled();
    
    // Klik op de afbeelding export knop
    fireEvent.click(screen.getByText('Export Afbeelding'));
    
    // Controleer of de export functie is aangeroepen
    expect(require('../../utils/export').exportToImage).toHaveBeenCalled();
  });
  
  // Scenario 5: Gebruiker past visualisatie opties aan
  test('Scenario 5: User adjusts visualization options', async () => {
    renderWithThemeAndRouter(<TrendingTopicsPage />);
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByText(/trending topics data laden/i)).not.toBeInTheDocument();
    });
    
    // Zoek de visualisatie opties
    expect(screen.getByText('Visualisatie Opties')).toBeInTheDocument();
    
    // Wijzig de normalisatie optie
    const normalizeButton = screen.getAllByText('Aan')[0];
    fireEvent.click(normalizeButton);
    
    // Wijzig de smoothing optie
    const smoothingButton = screen.getAllByText('Aan')[1];
    fireEvent.click(smoothingButton);
    
    // Wijzig de events optie
    const eventsButton = screen.getAllByText('Aan')[2];
    fireEvent.click(eventsButton);
    
    // Controleer of de opties zijn gewijzigd
    expect(screen.getAllByText('Uit')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Uit')[1]).toBeInTheDocument();
    expect(screen.getAllByText('Uit')[2]).toBeInTheDocument();
  });
  
  // Scenario 6: Gebruiker gebruikt zoom en pan functionaliteit
  test('Scenario 6: User uses zoom and pan functionality', async () => {
    renderWithThemeAndRouter(<TrendingTopicsPage />);
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByText(/trending topics data laden/i)).not.toBeInTheDocument();
    });
    
    // Zoek de tijdsbereik selector
    expect(screen.getByText('Tijdsbereik')).toBeInTheDocument();
    
    // Gebruik de zoom in knop
    const zoomInButton = screen.getByTitle(/zoom in/i);
    fireEvent.click(zoomInButton);
    
    // Gebruik de pan links knop
    const panLeftButton = screen.getByTitle(/pan links/i);
    fireEvent.click(panLeftButton);
    
    // Gebruik de pan rechts knop
    const panRightButton = screen.getByTitle(/pan rechts/i);
    fireEvent.click(panRightButton);
    
    // Reset zoom
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
  });
});
