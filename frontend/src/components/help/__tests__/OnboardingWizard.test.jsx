import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OnboardingWizard from '../OnboardingWizard';
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
const WizardWithTheme = (props) => (
  <ThemeProvider theme={theme}>
    <OnboardingWizard {...props} />
  </ThemeProvider>
);

describe('OnboardingWizard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the wizard when open is true', () => {
    render(
      <WizardWithTheme 
        open={true} 
        onClose={() => {}} 
        onComplete={() => {}} 
      />
    );
    
    expect(screen.getByText('MarketPulse AI Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Welkom bij MarketPulse AI')).toBeInTheDocument();
  });
  
  it('does not render the wizard when open is false', () => {
    render(
      <WizardWithTheme 
        open={false} 
        onClose={() => {}} 
        onComplete={() => {}} 
      />
    );
    
    expect(screen.queryByText('MarketPulse AI Onboarding')).not.toBeInTheDocument();
  });
  
  it('calls onClose when the close button is clicked', () => {
    const onCloseMock = jest.fn();
    render(
      <WizardWithTheme 
        open={true} 
        onClose={onCloseMock} 
        onComplete={() => {}} 
      />
    );
    
    fireEvent.click(screen.getByLabelText('close'));
    
    expect(onCloseMock).toHaveBeenCalled();
  });
  
  it('navigates to the next step when the next button is clicked', () => {
    render(
      <WizardWithTheme 
        open={true} 
        onClose={() => {}} 
        onComplete={() => {}} 
      />
    );
    
    // First step should be visible
    expect(screen.getByText('Welkom bij MarketPulse AI')).toBeInTheDocument();
    
    // Click next button
    fireEvent.click(screen.getByText('Volgende'));
    
    // Second step should be visible
    expect(screen.getByText('Persoonlijke informatie')).toBeInTheDocument();
  });
  
  it('navigates to the previous step when the back button is clicked', () => {
    render(
      <WizardWithTheme 
        open={true} 
        onClose={() => {}} 
        onComplete={() => {}} 
      />
    );
    
    // Go to second step
    fireEvent.click(screen.getByText('Volgende'));
    expect(screen.getByText('Persoonlijke informatie')).toBeInTheDocument();
    
    // Go back to first step
    fireEvent.click(screen.getByText('Terug'));
    expect(screen.getByText('Welkom bij MarketPulse AI')).toBeInTheDocument();
  });
  
  it('allows skipping optional steps', () => {
    render(
      <WizardWithTheme 
        open={true} 
        onClose={() => {}} 
        onComplete={() => {}} 
      />
    );
    
    // Go to second step
    fireEvent.click(screen.getByText('Volgende'));
    
    // Skip to third step
    fireEvent.click(screen.getByText('Overslaan'));
    
    // Third step should be visible
    expect(screen.getByText('Bedrijfsinformatie')).toBeInTheDocument();
  });
  
  it('updates form data when fields are changed', () => {
    render(
      <WizardWithTheme 
        open={true} 
        onClose={() => {}} 
        onComplete={() => {}} 
      />
    );
    
    // Go to second step (personal information)
    fireEvent.click(screen.getByText('Volgende'));
    
    // Fill in name field
    fireEvent.change(screen.getByLabelText('Naam'), {
      target: { value: 'Test Gebruiker' },
    });
    
    // Fill in company field
    fireEvent.change(screen.getByLabelText('Bedrijf'), {
      target: { value: 'Test Bedrijf' },
    });
    
    // Select role
    fireEvent.mouseDown(screen.getByLabelText('Rol'));
    fireEvent.click(screen.getByText('Marketeer'));
    
    // Go to next step and back to verify data persistence
    fireEvent.click(screen.getByText('Volgende'));
    fireEvent.click(screen.getByText('Terug'));
    
    // Check if values are still there
    expect(screen.getByLabelText('Naam')).toHaveValue('Test Gebruiker');
    expect(screen.getByLabelText('Bedrijf')).toHaveValue('Test Bedrijf');
  });
  
  it('calls onComplete with form data when completing the wizard', async () => {
    const onCompleteMock = jest.fn();
    render(
      <WizardWithTheme 
        open={true} 
        onClose={() => {}} 
        onComplete={onCompleteMock} 
      />
    );
    
    // Fill in required fields and navigate through all steps
    
    // Step 1: Welcome
    fireEvent.click(screen.getByText('Volgende'));
    
    // Step 2: Personal Information
    fireEvent.change(screen.getByLabelText('Naam'), {
      target: { value: 'Test Gebruiker' },
    });
    fireEvent.click(screen.getByText('Volgende'));
    
    // Step 3: Company Information
    fireEvent.click(screen.getByText('Volgende'));
    
    // Step 4: Data Sources
    fireEvent.click(screen.getByText('Volgende'));
    
    // Step 5: Privacy Settings
    fireEvent.click(screen.getByText('Volgende'));
    
    // Step 6: Completed
    expect(screen.getByText('Gefeliciteerd!')).toBeInTheDocument();
    
    // Complete the wizard
    fireEvent.click(screen.getByText('Voltooien'));
    
    // Check if onComplete was called with form data
    expect(onCompleteMock).toHaveBeenCalled();
    
    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'onboardingCompleted',
      'true'
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'userPreferences',
      expect.any(String)
    );
  });
  
  it('resets the wizard when it is reopened', () => {
    const { rerender } = render(
      <WizardWithTheme 
        open={true} 
        onClose={() => {}} 
        onComplete={() => {}} 
      />
    );
    
    // Navigate to second step
    fireEvent.click(screen.getByText('Volgende'));
    expect(screen.getByText('Persoonlijke informatie')).toBeInTheDocument();
    
    // Close and reopen the wizard
    rerender(
      <WizardWithTheme 
        open={false} 
        onClose={() => {}} 
        onComplete={() => {}} 
      />
    );
    
    rerender(
      <WizardWithTheme 
        open={true} 
        onClose={() => {}} 
        onComplete={() => {}} 
      />
    );
    
    // First step should be visible again
    expect(screen.getByText('Welkom bij MarketPulse AI')).toBeInTheDocument();
  });
});
