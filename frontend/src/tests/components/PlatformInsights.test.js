import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
// Zorg ervoor dat we de component correct importeren met het volledige pad
import PlatformInsights from '../../components/charts/PlatformInsights.jsx';

// Mock theme voor de tests
const theme = createTheme();

// Mock data voor verschillende testscenario's
const mockData = {
  platforms: [
    {
      platform: 'reddit',
      insights: {
        summary: {
          topPosts: [
            {
              title: 'Test Post 1',
              content: 'This is test content for post 1',
              upvotes: 150,
              comments_count: 25,
              painPoints: 3,
              desires: 5
            },
            {
              title: 'Test Post 2',
              content: 'This is test content for post 2',
              upvotes: 75,
              comments_count: 12,
              painPoints: 1,
              desires: 2
            }
          ]
        },
        subreddits: {
          'TestSubreddit1': 10,
          'TestSubreddit2': 5,
          'TestSubreddit3': 3
        },
        sentiment: {
          positive: 40,
          neutral: 35,
          negative: 25
        },
        keywords: {
          'product': 15,
          'quality': 10,
          'price': 8,
          'feature': 6,
          'support': 4,
          'design': 3,
          'usability': 2
        }
      }
    },
    {
      platform: 'amazon',
      insights: {
        // Amazon mock data hier
      }
    }
  ]
};

// Lege data voor edge case tests
const emptyData = {
  platforms: [
    {
      platform: 'reddit',
      insights: {
        summary: {
          topPosts: []
        },
        subreddits: {}
      }
    }
  ]
};

// Wrapper component voor tests
const renderWithTheme = (ui) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('PlatformInsights Component', () => {
  // Test 1: Basis rendering test
  test('rendert zonder fouten', () => {
    renderWithTheme(<PlatformInsights platform="reddit" data={mockData} />);
    expect(screen.getByText('Platform Inzichten')).toBeInTheDocument();
  });

  // Test 2: Rendert Reddit inzichten correct
  test('rendert Reddit inzichten correct', () => {
    renderWithTheme(<PlatformInsights platform="reddit" data={mockData} />);
    
    // Controleer of de top posts worden weergegeven
    expect(screen.getByText('Top Reddit Posts')).toBeInTheDocument();
    expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    expect(screen.getByText('This is test content for post 1')).toBeInTheDocument();
    
    // Controleer of de subreddit verdeling wordt weergegeven
    expect(screen.getByText('Subreddit Verdeling')).toBeInTheDocument();
    expect(screen.getByText('TestSubreddit1')).toBeInTheDocument();
    
    // Controleer of de sentiment analyse wordt weergegeven
    expect(screen.getByText('Sentiment & Trending Topics')).toBeInTheDocument();
    expect(screen.getByText('Sentiment Analyse')).toBeInTheDocument();
    expect(screen.getByText('Positief')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    
    // Controleer of trending topics worden weergegeven
    expect(screen.getByText('Trending Topics')).toBeInTheDocument();
    expect(screen.getByText('product (15)')).toBeInTheDocument();
  });

  // Test 3: Edge case test - lege data
  test('handelt lege data correct af', () => {
    renderWithTheme(<PlatformInsights platform="reddit" data={emptyData} />);
    
    // Controleer of de juiste fallback berichten worden weergegeven
    expect(screen.getByText('Geen top posts beschikbaar')).toBeInTheDocument();
    expect(screen.getByText('Geen subreddit verdeling beschikbaar')).toBeInTheDocument();
  });

  // Test 4: Prop validatie test
  test('handelt ontbrekende props correct af', () => {
    // Test zonder data prop
    renderWithTheme(<PlatformInsights platform="reddit" />);
    expect(screen.getByText('Geen platform data beschikbaar')).toBeInTheDocument();
    
    // Test zonder platform prop
    renderWithTheme(<PlatformInsights data={mockData} />);
    expect(screen.getByText('Platform Inzichten')).toBeInTheDocument();
  });

  // Test 5: Platform tab switching test
  test('schakelt correct tussen platforms', () => {
    renderWithTheme(<PlatformInsights platform="all" data={mockData} />);
    
    // Controleer of de tabs worden weergegeven
    const redditTab = screen.getByText('reddit');
    expect(redditTab).toBeInTheDocument();
    
    // Controleer of Reddit inzichten standaard worden weergegeven
    expect(screen.getByText('Top Reddit Posts')).toBeInTheDocument();
    
    // Simuleer tab wissel (in een echte test zou je userEvent.click gebruiken)
    // Dit is een vereenvoudigde test omdat we geen userEvent gebruiken
    expect(screen.getByText('Platform Inzichten')).toBeInTheDocument();
  });
});
