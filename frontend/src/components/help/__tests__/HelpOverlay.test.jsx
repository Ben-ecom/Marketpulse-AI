import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpOverlay from '../HelpOverlay';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock theme for MUI components
const theme = createTheme();

// Wrapper component with ThemeProvider
const HelpWithTheme = (props) => (
  <ThemeProvider theme={theme}>
    <HelpOverlay {...props} />
  </ThemeProvider>
);

describe('HelpOverlay Component', () => {
  it('renders the help button', () => {
    render(<HelpWithTheme activeView="dashboard" />);
    
    expect(screen.getByLabelText('Help')).toBeInTheDocument();
  });
  
  it('opens the help overlay when the help button is clicked', () => {
    render(<HelpWithTheme activeView="dashboard" />);
    
    // Click the help button
    fireEvent.click(screen.getByLabelText('Help'));
    
    // Check if the help overlay is displayed
    expect(screen.getByText('Dashboard Help')).toBeInTheDocument();
  });
  
  it('closes the help overlay when the close button is clicked', () => {
    render(<HelpWithTheme activeView="dashboard" />);
    
    // Open the help overlay
    fireEvent.click(screen.getByLabelText('Help'));
    
    // Close the help overlay
    fireEvent.click(screen.getByLabelText('Sluiten'));
    
    // Check if the help overlay is closed
    expect(screen.queryByText('Dashboard Help')).not.toBeInTheDocument();
  });
  
  it('displays different help content based on activeView prop', () => {
    const { rerender } = render(<HelpWithTheme activeView="dashboard" />);
    
    // Open the help overlay
    fireEvent.click(screen.getByLabelText('Help'));
    
    // Check if dashboard help content is displayed
    expect(screen.getByText('Dashboard Help')).toBeInTheDocument();
    
    // Close the help overlay
    fireEvent.click(screen.getByLabelText('Sluiten'));
    
    // Change the activeView
    rerender(<HelpWithTheme activeView="report" />);
    
    // Open the help overlay again
    fireEvent.click(screen.getByLabelText('Help'));
    
    // Check if report help content is displayed
    expect(screen.getByText('Rapport Help')).toBeInTheDocument();
  });
  
  it('displays sentiment analysis help when activeView is sentiment', () => {
    render(<HelpWithTheme activeView="sentiment" />);
    
    // Open the help overlay
    fireEvent.click(screen.getByLabelText('Help'));
    
    // Check if sentiment help content is displayed
    expect(screen.getByText('Sentiment Analyse Help')).toBeInTheDocument();
  });
  
  it('displays trend analysis help when activeView is trends', () => {
    render(<HelpWithTheme activeView="trends" />);
    
    // Open the help overlay
    fireEvent.click(screen.getByLabelText('Help'));
    
    // Check if trend help content is displayed
    expect(screen.getByText('Trend Analyse Help')).toBeInTheDocument();
  });
  
  it('displays dashboard help as default when activeView is not recognized', () => {
    render(<HelpWithTheme activeView="unknown" />);
    
    // Open the help overlay
    fireEvent.click(screen.getByLabelText('Help'));
    
    // Check if dashboard help content is displayed as fallback
    expect(screen.getByText('Dashboard Help')).toBeInTheDocument();
  });
});
