import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TopicAwarenessReport from './TopicAwarenessReport';

// Mock de dependencies
jest.mock('react-markdown', () => {
  return ({ children }) => <div data-testid="markdown-content">{children}</div>;
});

jest.mock('../export/ExportButton', () => {
  return ({ config, disabled, 'aria-label': ariaLabel }) => (
    <button 
      data-testid="export-button" 
      disabled={disabled} 
      aria-label={ariaLabel}
    >
      Export
    </button>
  );
});

jest.mock('../../utils/reports/topicAwarenessReportUtils', () => ({
  generateExecutiveSummary: jest.fn(),
  generateDetailedReport: jest.fn().mockImplementation(() => ({
    title: 'Test Report',
    sections: [
      { title: 'Executive Summary', content: 'Test summary content', type: 'text' },
      { title: 'Topic Details per Fase', content: 'Test details content', type: 'text' },
    ]
  }))
}));

// Test data
const mockTopicsByPhase = {
  unaware: [
    { name: 'topic1', relevance: 0.8, frequency: 120, growth: 0.05, sentiment: 0.2 },
    { name: 'topic2', relevance: 0.7, frequency: 90, growth: -0.02, sentiment: -0.1 }
  ],
  problem_aware: [
    { name: 'topic3', relevance: 0.9, frequency: 150, growth: 0.1, sentiment: 0.5 }
  ]
};

const mockAwarenessDistribution = [
  { phaseId: 'unaware', phase: 'Unaware', awareness: 0.2, count: 96, color: '#9CA3AF' },
  { phaseId: 'problem_aware', phase: 'Problem Aware', awareness: 0.35, count: 168, color: '#60A5FA' }
];

const mockContentRecommendations = {
  unaware: [
    { 
      phase: 'Unaware', 
      contentIdeas: ['Blogpost over industrie trends', 'Infographic over marktstatistieken'], 
      channels: ['Social media', 'Blog'], 
      callToAction: 'Lees meer',
      contentTypes: ['Blog', 'Infographic'],
      tone: 'Informatief'
    }
  ]
};

const mockTrendingTopics = [
  { 
    topic: 'topic1', 
    trendingScore: 0.9, 
    frequency: 250, 
    growth: 0.15,
    relevantPhases: ['problem_aware', 'solution_aware']
  }
];

// Setup theme voor Material UI componenten
const theme = createTheme();

describe('TopicAwarenessReport Component', () => {
  beforeEach(() => {
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <ThemeProvider theme={theme}>
        <TopicAwarenessReport
          topicsByPhase={mockTopicsByPhase}
          awarenessDistribution={mockAwarenessDistribution}
          contentRecommendations={mockContentRecommendations}
          trendingTopics={mockTrendingTopics}
          projectName="Test Project"
          isLoading={false}
          {...props}
        />
      </ThemeProvider>
    );
  };

  test('renders loading state correctly', () => {
    renderComponent({ isLoading: true });
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/rapport wordt gegenereerd/i)).toBeInTheDocument();
  });

  test('renders error state when topicsByPhase is missing', () => {
    renderComponent({ topicsByPhase: null });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/fout opgetreden bij het laden van de topic data/i)).toBeInTheDocument();
  });

  test('renders warning when topicsByPhase is empty', () => {
    renderComponent({ topicsByPhase: {} });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/geen topics gevonden/i)).toBeInTheDocument();
  });

  test('renders report options correctly', () => {
    renderComponent();
    expect(screen.getByText(/rapport opties/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/product of service naam/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industrie of niche/i)).toBeInTheDocument();
  });

  test('renders privacy options correctly', () => {
    renderComponent();
    expect(screen.getByText(/privacy opties/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gegevens anonimiseren/i)).toBeInTheDocument();
  });

  test('handles option changes correctly', async () => {
    renderComponent();
    const productNameInput = screen.getByLabelText(/product of service naam/i);
    await userEvent.type(productNameInput, 'Test Product');
    expect(productNameInput).toHaveValue('Test Product');
    
    const checkbox = screen.getByLabelText(/executive summary/i);
    await userEvent.click(checkbox);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('preview button is disabled when report is not available', () => {
    renderComponent({ topicsByPhase: {} });
    const previewButton = screen.queryByText(/preview/i);
    expect(previewButton).not.toBeInTheDocument();
  });

  test('export button is disabled when no sections are selected', async () => {
    renderComponent();
    
    // Uncheck all section checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    for (const checkbox of checkboxes.slice(0, 4)) { // First 4 are section checkboxes
      if (checkbox.checked) {
        await userEvent.click(checkbox);
      }
    }
    
    const exportButton = screen.getByTestId('export-button');
    expect(exportButton).toBeDisabled();
  });

  test('loads saved options from localStorage on mount', () => {
    const savedOptions = {
      productName: 'Saved Product',
      industrie: 'Saved Industry',
      includeExecutiveSummary: false
    };
    
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(savedOptions));
    
    renderComponent();
    
    expect(window.localStorage.getItem).toHaveBeenCalledWith('topicAwarenessReportOptions');
  });

  // Accessibility tests
  test('meets accessibility requirements', () => {
    const { container } = renderComponent();
    
    // Check for aria-labels on interactive elements
    const interactiveElements = container.querySelectorAll('button, input, [role="button"]');
    interactiveElements.forEach(element => {
      if (!element.hasAttribute('aria-hidden') || element.getAttribute('aria-hidden') !== 'true') {
        expect(
          element.hasAttribute('aria-label') || 
          element.hasAttribute('aria-labelledby') ||
          element.hasAttribute('aria-describedby') ||
          element.textContent.trim().length > 0
        ).toBeTruthy();
      }
    });
    
    // Check for proper heading hierarchy
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const headingLevels = headings.map(h => parseInt(h.tagName.substring(1)));
    
    // First heading should be h1
    expect(headingLevels[0]).toBe(1);
    
    // Check for sequential heading levels (no skipping)
    for (let i = 1; i < headingLevels.length; i++) {
      expect(headingLevels[i] - headingLevels[i-1]).toBeLessThanOrEqual(1);
    }
  });
});
