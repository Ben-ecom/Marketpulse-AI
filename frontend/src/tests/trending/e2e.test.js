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
      { topic: 'Machine Learning', count: 1200, source: 'twitter', timestamp: '2025-04-25T11:00:00.000Z' },
      { topic: 'Blockchain', count: 800, source: 'reddit', timestamp: '2025-04-25T12:00:00.000Z' },
      { topic: 'Cryptocurrency', count: 750, source: 'reddit', timestamp: '2025-04-25T13:00:00.000Z' },
      { topic: 'Remote Work', count: 600, source: 'google', timestamp: '2025-04-25T14:00:00.000Z' }
    ],
    events: [
      {
        id: 'event-1',
        title: 'AI Conference',
        description: 'Major AI conference with new product announcements',
        date: '2025-04-25T12:00:00.000Z',
        category: 'Conference'
      }
    ]
  }))
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

describe('Trending Topics Page E2E', () => {
  test('loads and displays trending topics data', async () => {
    renderWithThemeAndRouter(<TrendingTopicsPage />);
    
    // Initieel zou de pagina in laadstatus moeten zijn
    expect(screen.getByText(/trending topics data laden/i)).toBeInTheDocument();
    
    // Wacht tot de data is geladen
    await waitFor(() => {
      expect(screen.queryByText(/trending topics data laden/i)).not.toBeInTheDocument();
    });
    
    // Controleer of de pagina titel correct wordt weergegeven
    expect(screen.getByText('Trending Topics Analyse')).toBeInTheDocument();
    
    // Controleer of de export knoppen aanwezig zijn
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export Afbeelding')).toBeInTheDocument();
    
    // Controleer of de tabs aanwezig zijn
    expect(screen.getByText('Tijdlijn Visualisatie')).toBeInTheDocument();
    expect(screen.getByText('Topic Vergelijking')).toBeInTheDocument();
    expect(screen.getByText('Event Analyse')).toBeInTheDocument();
    
    // Controleer of de topic selectie aanwezig is
    expect(screen.getByText('Topic Selectie')).toBeInTheDocument();
    
    // Controleer of de tijdsbereik selector aanwezig is
    expect(screen.getByText('Tijdsbereik')).toBeInTheDocument();
    
    // Controleer of de visualisatie opties aanwezig zijn
    expect(screen.getByText('Visualisatie Opties')).toBeInTheDocument();
    
    // Test tab navigatie
    fireEvent.click(screen.getByText('Topic Vergelijking'));
    expect(screen.getByText('Selecteer topics in het linkerpaneel om ze te vergelijken.')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Event Analyse'));
    
    // Ga terug naar de eerste tab
    fireEvent.click(screen.getByText('Tijdlijn Visualisatie'));
    
    // Test timeframe selectie
    const timeframeSelect = screen.getAllByLabelText('Periode')[0];
    fireEvent.mouseDown(timeframeSelect);
    fireEvent.click(screen.getByText('Week'));
    
    // Controleer of de visualisatie opties werken
    const normalizeButton = screen.getByText('Aan');
    fireEvent.click(normalizeButton);
    
    // Test export functionaliteit (mock de functie aanroep)
    const exportCsvButton = screen.getByText('Export CSV');
    
    // Mock de window.URL.createObjectURL functie
    const originalCreateObjectURL = window.URL.createObjectURL;
    window.URL.createObjectURL = jest.fn();
    
    // Mock createElement en appendChild
    const originalCreateElement = document.createElement;
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          setAttribute: jest.fn(),
          style: {},
          click: jest.fn()
        };
      }
      return originalCreateElement.call(document, tag);
    });
    
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    
    // Klik op de export knop
    fireEvent.click(exportCsvButton);
    
    // Herstel de originele functies
    window.URL.createObjectURL = originalCreateObjectURL;
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
  });
});
