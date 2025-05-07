import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TourGuide from '../TourGuide';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock DOM elements that the tour targets
const setupTourTargets = () => {
  // Dashboard targets
  const dashboardHeader = document.createElement('div');
  dashboardHeader.className = 'dashboard-header';
  document.body.appendChild(dashboardHeader);
  
  const dataSourceSelector = document.createElement('div');
  dataSourceSelector.className = 'data-source-selector';
  document.body.appendChild(dataSourceSelector);
  
  // Report targets
  const reportHeader = document.createElement('div');
  reportHeader.className = 'report-header';
  document.body.appendChild(reportHeader);
  
  // Sentiment targets
  const sentimentHeader = document.createElement('div');
  sentimentHeader.className = 'sentiment-header';
  document.body.appendChild(sentimentHeader);
  
  // Trend targets
  const trendHeader = document.createElement('div');
  trendHeader.className = 'trend-header';
  document.body.appendChild(trendHeader);
};

// Clean up DOM elements
const cleanupTourTargets = () => {
  document.body.innerHTML = '';
};

describe('TourGuide Component', () => {
  beforeEach(() => {
    setupTourTargets();
    jest.clearAllMocks();
    Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });
    Element.prototype.scrollIntoView = jest.fn();
  });
  
  afterEach(() => {
    cleanupTourTargets();
  });
  
  it('renders the start tour button', () => {
    render(<TourGuide activeView="dashboard" />);
    
    expect(screen.getByText('Tour starten')).toBeInTheDocument();
  });
  
  it('shows "Tour opnieuw" button when tour is completed', () => {
    // Set up localStorage to indicate tour is completed
    const tourStatus = { dashboard: true };
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(tourStatus));
    
    render(<TourGuide activeView="dashboard" />);
    
    expect(screen.getByText('Tour opnieuw')).toBeInTheDocument();
  });
  
  it('starts the tour when the start button is clicked', () => {
    render(<TourGuide activeView="dashboard" />);
    
    fireEvent.click(screen.getByText('Tour starten'));
    
    // Check if the first step of the tour is displayed
    expect(screen.getByText('Welkom bij het Dashboard')).toBeInTheDocument();
  });
  
  it('navigates to the next step when the next button is clicked', () => {
    render(<TourGuide activeView="dashboard" />);
    
    // Start the tour
    fireEvent.click(screen.getByText('Tour starten'));
    
    // Navigate to the next step
    fireEvent.click(screen.getByText('Volgende'));
    
    // Check if the second step is displayed
    expect(screen.getByText('Databron Selector')).toBeInTheDocument();
  });
  
  it('navigates to the previous step when the previous button is clicked', () => {
    render(<TourGuide activeView="dashboard" />);
    
    // Start the tour
    fireEvent.click(screen.getByText('Tour starten'));
    
    // Navigate to the next step
    fireEvent.click(screen.getByText('Volgende'));
    
    // Navigate back to the first step
    fireEvent.click(screen.getByText('Vorige'));
    
    // Check if the first step is displayed again
    expect(screen.getByText('Welkom bij het Dashboard')).toBeInTheDocument();
  });
  
  it('completes the tour and calls onComplete when reaching the last step', () => {
    const onCompleteMock = jest.fn();
    render(<TourGuide activeView="dashboard" onComplete={onCompleteMock} />);
    
    // Start the tour
    fireEvent.click(screen.getByText('Tour starten'));
    
    // Navigate through all steps
    // Dashboard tour has 8 steps
    for (let i = 0; i < 7; i++) {
      fireEvent.click(screen.getByText('Volgende'));
    }
    
    // Complete the tour
    fireEvent.click(screen.getByText('Voltooien'));
    
    // Check if onComplete was called
    expect(onCompleteMock).toHaveBeenCalled();
    
    // Check if tour status was saved in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'tourStatus',
      expect.any(String)
    );
  });
  
  it('closes the tour when the close button is clicked', () => {
    render(<TourGuide activeView="dashboard" />);
    
    // Start the tour
    fireEvent.click(screen.getByText('Tour starten'));
    
    // Close the tour
    fireEvent.click(screen.getByLabelText('Sluiten'));
    
    // Check if the tour is closed and the start button is shown again
    expect(screen.getByText('Tour starten')).toBeInTheDocument();
  });
  
  it('loads different tour steps based on activeView prop', () => {
    // Render with report view
    const { unmount } = render(<TourGuide activeView="report" />);
    
    // Start the tour
    fireEvent.click(screen.getByText('Tour starten'));
    
    // Check if report tour is displayed
    expect(screen.getByText('Welkom bij het Rapport')).toBeInTheDocument();
    
    unmount();
    
    // Render with sentiment view
    render(<TourGuide activeView="sentiment" />);
    
    // Start the tour
    fireEvent.click(screen.getByText('Tour starten'));
    
    // Check if sentiment tour is displayed
    expect(screen.getByText('Welkom bij de Sentiment Analyse')).toBeInTheDocument();
  });
  
  it('resets the tour when activeView changes', () => {
    const { rerender } = render(<TourGuide activeView="dashboard" />);
    
    // Start the tour
    fireEvent.click(screen.getByText('Tour starten'));
    
    // Navigate to the next step
    fireEvent.click(screen.getByText('Volgende'));
    
    // Change the activeView
    rerender(<TourGuide activeView="report" />);
    
    // Check if the tour is reset and the start button is shown again
    expect(screen.getByText('Tour starten')).toBeInTheDocument();
  });
});
