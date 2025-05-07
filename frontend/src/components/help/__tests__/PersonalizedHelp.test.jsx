import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PersonalizedHelp from '../PersonalizedHelp';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock theme for MUI components
const theme = createTheme();

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

// Wrapper component with ThemeProvider
const HelpWithTheme = (props) => (
  <ThemeProvider theme={theme}>
    <PersonalizedHelp {...props} />
  </ThemeProvider>
);

describe('PersonalizedHelp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the component with default props', () => {
    render(<HelpWithTheme />);
    
    expect(screen.getByText('Dashboard Help')).toBeInTheDocument();
    expect(screen.getByText('Voor gevorderden')).toBeInTheDocument();
  });
  
  it('displays content based on activeView prop', () => {
    const { rerender } = render(<HelpWithTheme activeView="dashboard" />);
    expect(screen.getByText('Dashboard Help')).toBeInTheDocument();
    
    rerender(<HelpWithTheme activeView="report" />);
    expect(screen.getByText('Rapport Help')).toBeInTheDocument();
    
    rerender(<HelpWithTheme activeView="sentiment" />);
    expect(screen.getByText('Sentiment Analyse Help')).toBeInTheDocument();
    
    rerender(<HelpWithTheme activeView="trends" />);
    expect(screen.getByText('Trend Analyse Help')).toBeInTheDocument();
  });
  
  it('displays content based on userRole prop', () => {
    const { rerender } = render(<HelpWithTheme userRole="general" />);
    expect(screen.getByText('Dashboard Help')).toBeInTheDocument();
    
    rerender(<HelpWithTheme userRole="marketeer" />);
    expect(screen.getByText('Dashboard voor Marketeers')).toBeInTheDocument();
    
    rerender(<HelpWithTheme userRole="product_manager" />);
    expect(screen.getByText('Dashboard voor Product Managers')).toBeInTheDocument();
    
    rerender(<HelpWithTheme userRole="analyst" />);
    expect(screen.getByText('Dashboard voor Analisten')).toBeInTheDocument();
  });
  
  it('displays content based on experienceLevel prop', () => {
    const { rerender } = render(<HelpWithTheme experienceLevel="beginner" />);
    expect(screen.getByText('Voor beginners')).toBeInTheDocument();
    
    rerender(<HelpWithTheme experienceLevel="intermediate" />);
    expect(screen.getByText('Voor gevorderden')).toBeInTheDocument();
    
    rerender(<HelpWithTheme experienceLevel="advanced" />);
    expect(screen.getByText('Voor experts')).toBeInTheDocument();
  });
  
  it('shows advanced tips based on experienceLevel', () => {
    const { rerender } = render(<HelpWithTheme experienceLevel="beginner" />);
    expect(screen.queryByText('Geavanceerde tips:')).not.toBeInTheDocument();
    
    rerender(<HelpWithTheme experienceLevel="intermediate" />);
    expect(screen.getByText('Geavanceerde tips:')).toBeInTheDocument();
    
    rerender(<HelpWithTheme experienceLevel="advanced" />);
    expect(screen.getByText('Geavanceerde tips:')).toBeInTheDocument();
  });
  
  it('switches between tabs', () => {
    render(<HelpWithTheme />);
    
    // Initially on Tips tab
    expect(screen.getByText('Tips voor gevorderden:')).toBeInTheDocument();
    
    // Switch to Settings tab
    fireEvent.click(screen.getByText('Instellingen'));
    
    // Now on Settings tab
    expect(screen.getByText('Personaliseer je help ervaring')).toBeInTheDocument();
    expect(screen.getByLabelText('Rol')).toBeInTheDocument();
    expect(screen.getByLabelText('Ervaringsniveau')).toBeInTheDocument();
    
    // Switch back to Tips tab
    fireEvent.click(screen.getByText('Tips'));
    
    // Now on Tips tab again
    expect(screen.getByText('Tips voor gevorderden:')).toBeInTheDocument();
  });
  
  it('calls onRoleChange when role is changed', () => {
    const onRoleChangeMock = jest.fn();
    render(<HelpWithTheme onRoleChange={onRoleChangeMock} />);
    
    // Switch to Settings tab
    fireEvent.click(screen.getByText('Instellingen'));
    
    // Change role
    fireEvent.mouseDown(screen.getByLabelText('Rol'));
    fireEvent.click(screen.getByText('Marketeer'));
    
    expect(onRoleChangeMock).toHaveBeenCalledWith('marketeer');
  });
  
  it('calls onExperienceLevelChange when experience level is changed', () => {
    const onExperienceLevelChangeMock = jest.fn();
    render(<HelpWithTheme onExperienceLevelChange={onExperienceLevelChangeMock} />);
    
    // Switch to Settings tab
    fireEvent.click(screen.getByText('Instellingen'));
    
    // Change experience level
    fireEvent.mouseDown(screen.getByLabelText('Ervaringsniveau'));
    fireEvent.click(screen.getByText('Expert'));
    
    expect(onExperienceLevelChangeMock).toHaveBeenCalledWith('advanced');
  });
  
  it('saves preferences to localStorage when save button is clicked', () => {
    render(<HelpWithTheme />);
    
    // Switch to Settings tab
    fireEvent.click(screen.getByText('Instellingen'));
    
    // Change role and experience level
    fireEvent.mouseDown(screen.getByLabelText('Rol'));
    fireEvent.click(screen.getByText('Marketeer'));
    
    fireEvent.mouseDown(screen.getByLabelText('Ervaringsniveau'));
    fireEvent.click(screen.getByText('Expert'));
    
    // Save preferences
    fireEvent.click(screen.getByText('Voorkeuren opslaan'));
    
    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'helpPreferences',
      expect.any(String)
    );
    
    // Check if it switches back to Tips tab
    expect(screen.getByText('Tips voor experts:')).toBeInTheDocument();
  });
  
  it('hides settings tab when showSettings is false', () => {
    render(<HelpWithTheme showSettings={false} />);
    
    expect(screen.queryByText('Instellingen')).not.toBeInTheDocument();
  });
});
