/**
 * Test voor de Topic Awareness Analyzer component
 * Deze test verifieert de integratie tussen trending topics en awareness fasen
 */

// Import testing libraries
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import Jest globals
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock ReactMarkdown component
jest.mock('react-markdown', () => (props) => {
  return props.children;
});

// Mock d3-afhankelijke componenten
jest.mock('../../components/trending/TrendingTopicsBarChart.jsx', () => {
  return function MockBarChart(props) {
    return <div data-testid="mock-bar-chart">{props.title || 'Mock Bar Chart'}</div>;
  };
});

jest.mock('../../components/trending/TrendingTopicsWordCloud.jsx', () => {
  return function MockWordCloud(props) {
    return <div data-testid="mock-word-cloud">{props.title || 'Mock Word Cloud'}</div>;
  };
});

// Import componenten
import TopicAwarenessAnalyzer from '../../components/integrated/TopicAwarenessAnalyzer.jsx';
import TopicAwarenessMatrix from '../../components/integrated/TopicAwarenessMatrix.jsx';
import TopicAwarenessRecommendations from '../../components/integrated/TopicAwarenessRecommendations.jsx';
import TopicAwarenessReport from '../../components/integrated/TopicAwarenessReport.jsx';

// Import utility functies
import { classifyTopicsByAwarenessPhase, calculateTopicAwarenessDistribution, generateContentRecommendations } from '../../utils/insights/topicAwarenessUtils.js';
import { AWARENESS_PHASES } from '../../utils/insights/awarenessClassification.js';

// Mock de utility functies
jest.mock('../../utils/insights/topicAwarenessUtils.js', () => ({
  classifyTopicsByAwarenessPhase: jest.fn(),
  calculateTopicAwarenessDistribution: jest.fn(),
  generateContentRecommendations: jest.fn()
}));

// Mock data
const mockTrendingTopics = [
  { topic: 'duurzame producten', trendingScore: 8.5, frequency: 120, growth: 25 },
  { topic: 'online marketing', trendingScore: 7.8, frequency: 95, growth: 15 },
  { topic: 'sociale media', trendingScore: 7.2, frequency: 85, growth: 10 },
  { topic: 'e-commerce', trendingScore: 6.9, frequency: 75, growth: 5 },
  { topic: 'kunstmatige intelligentie', trendingScore: 6.5, frequency: 65, growth: 20 }
];

const mockData = [
  { id: 1, text: 'Ik wist niet dat duurzame producten zo belangrijk zijn.', platform: 'twitter' },
  { id: 2, text: 'Ik heb een probleem met online marketing, weet iemand een oplossing?', platform: 'reddit' },
  { id: 3, text: 'Er zijn verschillende sociale media platforms die je kunt gebruiken.', platform: 'facebook' },
  { id: 4, text: 'E-commerce is de toekomst van winkelen.', platform: 'linkedin' },
  { id: 5, text: 'Kunstmatige intelligentie verandert de manier waarop we werken.', platform: 'twitter' }
];

const mockTopicsByPhase = {
  unaware: [
    { ...mockTrendingTopics[0], awarenessPhase: 'unaware', confidence: 0.8 }
  ],
  problem_aware: [
    { ...mockTrendingTopics[1], awarenessPhase: 'problem_aware', confidence: 0.7 }
  ],
  solution_aware: [
    { ...mockTrendingTopics[2], awarenessPhase: 'solution_aware', confidence: 0.6 }
  ],
  product_aware: [
    { ...mockTrendingTopics[3], awarenessPhase: 'product_aware', confidence: 0.5 }
  ],
  most_aware: [
    { ...mockTrendingTopics[4], awarenessPhase: 'most_aware', confidence: 0.9 }
  ]
};

const mockAwarenessDistribution = Object.entries(AWARENESS_PHASES).map(([key, phase]) => {
  const count = mockTopicsByPhase[phase.id]?.length || 0;
  return {
    id: phase.id,
    name: phase.name,
    description: phase.description,
    color: phase.color,
    count,
    percentage: count * 20, // 5 topics, so each is 20%
    topics: mockTopicsByPhase[phase.id] || []
  };
});

const mockContentRecommendations = Object.entries(AWARENESS_PHASES).reduce((acc, [key, phase]) => {
  acc[phase.id] = {
    phase: phase.name,
    description: phase.description,
    topics: mockTopicsByPhase[phase.id] || [],
    contentIdeas: [
      `Content idee 1 voor ${phase.name}`,
      `Content idee 2 voor ${phase.name}`,
      `Content idee 3 voor ${phase.name}`
    ],
    channels: ['Email', 'Social Media', 'Blog'],
    callToAction: `Call to action voor ${phase.name}`
  };
  return acc;
}, {});

// Test suite voor de Topic Awareness Analyzer
describe('Topic Awareness Analyzer', () => {
  // Setup de mocks voor elke test
  beforeEach(() => {
    classifyTopicsByAwarenessPhase.mockReturnValue(mockTopicsByPhase);
    calculateTopicAwarenessDistribution.mockReturnValue(mockAwarenessDistribution);
    generateContentRecommendations.mockReturnValue(mockContentRecommendations);
  });

  // Reset de mocks na elke test
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('TopicAwarenessAnalyzer rendert correct met data', async () => {
    render(
      <TopicAwarenessAnalyzer
        trendingTopics={mockTrendingTopics}
        data={mockData}
        isLoading={false}
        textField="text"
        platformField="platform"
        projectName="Test Project"
      />
    );

    // Verifieer dat de component correct rendert
    expect(screen.getByText('Topic Awareness Analyzer')).toBeInTheDocument();
    
    // Verifieer dat de utility functies worden aangeroepen met de juiste parameters
    expect(classifyTopicsByAwarenessPhase).toHaveBeenCalledWith(
      mockTrendingTopics,
      mockData,
      'text'
    );
    
    expect(calculateTopicAwarenessDistribution).toHaveBeenCalledWith(
      mockTopicsByPhase
    );
    
    // Verifieer dat de tabs correct worden weergegeven
    expect(screen.getByText('Awareness Matrix')).toBeInTheDocument();
    expect(screen.getByText('Distributie')).toBeInTheDocument();
    expect(screen.getByText('Content Aanbevelingen')).toBeInTheDocument();
    expect(screen.getByText('Topic Details')).toBeInTheDocument();
    expect(screen.getByText('Rapport')).toBeInTheDocument();
  });

  test('TopicAwarenessMatrix rendert correct met data', () => {
    render(
      <TopicAwarenessMatrix
        topicsByPhase={mockTopicsByPhase}
        isLoading={false}
      />
    );

    // Verifieer dat de component correct rendert
    expect(screen.getByText('Awareness Fase Matrix')).toBeInTheDocument();
    
    // Verifieer dat alle fasen worden weergegeven
    Object.values(AWARENESS_PHASES).forEach(phase => {
      expect(screen.getByText(phase.name)).toBeInTheDocument();
    });
    
    // Verifieer dat de topics correct worden weergegeven
    expect(screen.getByText('duurzame producten')).toBeInTheDocument();
    expect(screen.getByText('online marketing')).toBeInTheDocument();
    expect(screen.getByText('sociale media')).toBeInTheDocument();
    expect(screen.getByText('e-commerce')).toBeInTheDocument();
    expect(screen.getByText('kunstmatige intelligentie')).toBeInTheDocument();
  });

  test('TopicAwarenessMatrix heeft correcte toegankelijkheidsattributen', async () => {
    // Setup user-event
    const user = userEvent.setup();
    
    render(
      <TopicAwarenessMatrix
        topicsByPhase={mockTopicsByPhase}
        isLoading={false}
        onTopicSelect={jest.fn()}
      />
    );
    
    // 1. Controleer de fase kaarten
    const phaseRegions = screen.getAllByRole('region');
    expect(phaseRegions.length).toBe(5); // 5 awareness fasen
    
    // Controleer de eerste fase kaart (Unaware)
    const unawareTitle = screen.getByText('Unaware');
    const unawareCard = unawareTitle.closest('[role="region"]');
    expect(unawareCard).toHaveAttribute('aria-labelledby', 'phase-title-unaware');
    
    // 2. Controleer de topic lijsten
    const topicLists = screen.getAllByRole('list');
    expect(topicLists.length).toBe(5); // 1 lijst per fase
    
    // 3. Controleer de topic items
    const topicItems = screen.getAllByRole('listitem');
    expect(topicItems.length).toBe(5); // 1 topic per fase in onze mock data
    
    // 4. Controleer de interactie met topics
    const duurzameProductenChip = screen.getByText('duurzame producten');
    expect(duurzameProductenChip).toHaveAttribute('aria-pressed', 'false');
    
    // Klik op een topic en controleer of aria-pressed verandert
    await user.click(duurzameProductenChip);
    expect(duurzameProductenChip).toHaveAttribute('aria-pressed', 'true');
    
    // 5. Controleer of de loading indicator toegankelijk is
    cleanup();
    
    render(
      <TopicAwarenessMatrix
        topicsByPhase={mockTopicsByPhase}
        isLoading={true}
      />
    );
    
    const loadingIndicator = screen.getByRole('status');
    expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Awareness matrix wordt geladen, even geduld a.u.b.')).toBeInTheDocument();
  });

  test('TopicAwarenessRecommendations rendert correct met data en reageert op gebruikersinteracties', async () => {
    // Setup user-event
    const user = userEvent.setup();
    
    // Mock de onCustomize functie
    const mockOnCustomize = jest.fn();
    
    render(
      <TopicAwarenessRecommendations
        recommendations={mockContentRecommendations}
        isLoading={false}
        onCustomize={mockOnCustomize}
      />
    );

    // Verifieer dat de component correct rendert
    expect(screen.getByText('Content Aanbevelingen')).toBeInTheDocument();
    
    // Verifieer dat de personalisatie opties worden weergegeven
    expect(screen.getByText('Personaliseer aanbevelingen')).toBeInTheDocument();
    const productInput = screen.getByLabelText('Product/Service naam');
    const industrieInput = screen.getByLabelText('Industrie/Niche');
    const toepassenButton = screen.getByText('Toepassen');
    
    expect(productInput).toBeInTheDocument();
    expect(industrieInput).toBeInTheDocument();
    expect(toepassenButton).toBeInTheDocument();
    
    // Test gebruikersinteractie: vul de personalisatie velden in en klik op Toepassen
    await user.type(productInput, 'MarketPulse AI');
    await user.type(industrieInput, 'E-commerce');
    await user.click(toepassenButton);
    
    // Verifieer dat de onCustomize functie is aangeroepen met de juiste parameters
    expect(mockOnCustomize).toHaveBeenCalledWith({
      productName: 'MarketPulse AI',
      industrie: 'E-commerce'
    });
    
    // Verifieer dat de content ideeën worden weergegeven
    const contentIdeeen = screen.getAllByText('Content Ideeën');
    expect(contentIdeeen.length).toBeGreaterThan(0); // Controleer of er minstens één element is
    expect(screen.getAllByText('Aanbevolen Kanalen')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Aanbevolen Call-to-Action')[0]).toBeInTheDocument();
  });

  test('TopicAwarenessReport component rendert correct en verwerkt gebruikersinteracties', async () => {
    // Setup user-event
    const user = userEvent.setup();
    
    render(
      <TopicAwarenessReport
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
        isLoading={false}
      />
    );

    // Verifieer dat de component correct rendert
    expect(screen.getByText('Topic Awareness Rapport')).toBeInTheDocument();
    
    // Verifieer dat de rapport opties worden weergegeven
    expect(screen.getByText('Rapport Opties')).toBeInTheDocument();
    const executiveSummaryCheckbox = screen.getByLabelText('Executive Summary');
    const topicDetailsCheckbox = screen.getByLabelText('Topic Details per Fase');
    const contentAanbevelingenCheckbox = screen.getByLabelText('Content Aanbevelingen');
    const strategischeAanbevelingenCheckbox = screen.getByLabelText('Strategische Aanbevelingen');
    
    expect(executiveSummaryCheckbox).toBeInTheDocument();
    expect(topicDetailsCheckbox).toBeInTheDocument();
    expect(contentAanbevelingenCheckbox).toBeInTheDocument();
    expect(strategischeAanbevelingenCheckbox).toBeInTheDocument();
    
    // Test gebruikersinteractie: toggle rapport opties
    await user.click(topicDetailsCheckbox);
    expect(topicDetailsCheckbox).not.toBeChecked();
    await user.click(topicDetailsCheckbox);
    expect(topicDetailsCheckbox).toBeChecked();
    
    // Test gebruikersinteractie: product/service naam invullen
    const productNameInput = screen.getByLabelText('Product/Service Naam');
    await user.type(productNameInput, 'Test Product');
    expect(productNameInput).toHaveValue('Test Product');
    
    // Test gebruikersinteractie: industrie selecteren
    const industrieInput = screen.getByLabelText('Industrie/Niche');
    await user.type(industrieInput, 'E-commerce');
    expect(industrieInput).toHaveValue('E-commerce');
    
    // Test preview functionaliteit
    const previewButton = screen.getByRole('button', { name: /preview/i });
    expect(previewButton).toBeInTheDocument();
    await user.click(previewButton);
    
    // Controleer of de preview modal wordt weergegeven
    const previewModal = await screen.findByRole('dialog');
    expect(previewModal).toBeInTheDocument();
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    
    // Sluit de preview modal
    const closeButton = screen.getByRole('button', { name: /sluiten/i });
    await user.click(closeButton);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    
    // Verifieer dat de checkboxes correct worden bijgewerkt
    expect(executiveSummaryCheckbox).toBeChecked();
    expect(topicDetailsCheckbox).not.toBeChecked();
    expect(strategischeAanbevelingenCheckbox).toBeChecked();
    
    // Verifieer dat de export opties worden weergegeven
    expect(screen.getByText('Rapport Exporteren')).toBeInTheDocument();
  });
  
  test('TopicAwarenessReport toont toegankelijke foutmeldingen met correcte ARIA-attributen', async () => {
    // Render de component met ontbrekende topicsByPhase data om een foutmelding te triggeren
    render(
      <TopicAwarenessReport
        topicsByPhase={null}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
      />
    );

    // Zoek de foutmelding alert
    const errorAlert = screen.getByText(
      'Er is een fout opgetreden bij het laden van de topic data. Probeer de pagina te vernieuwen of neem contact op met support.'
    ).closest('.MuiAlert-root');

    // Controleer of de alert de juiste toegankelijkheidsattributen heeft
    expect(errorAlert).toHaveAttribute('role', 'alert');
    expect(errorAlert).toHaveAttribute('aria-live', 'assertive');

    // Render nu met lege topicsByPhase om een waarschuwing te triggeren
    cleanup();
    render(
      <TopicAwarenessReport
        topicsByPhase={{}}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
      />
    );

    // Zoek de waarschuwing alert
    const warningAlert = screen.getByText(
      'Geen topics gevonden. Voer eerst een topic analyse uit of pas de zoekparameters aan.'
    ).closest('.MuiAlert-root');

    // Controleer of de alert de juiste toegankelijkheidsattributen heeft
    expect(warningAlert).toHaveAttribute('role', 'alert');
    expect(warningAlert).toHaveAttribute('aria-live', 'polite');
  });

  test('TopicAwarenessReport exportfunctionaliteit genereert correcte export configuratie', () => {
    // Mock de useMemo hook om de exportConfig te kunnen testen
    jest.spyOn(React, 'useMemo').mockImplementation(fn => fn());
    
    // Render de component
    render(
      <TopicAwarenessReport
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
        isLoading={false}
      />
    );
    
    // Zoek de ExportButton component
    const exportButton = screen.getByText('Rapport Exporteren');
    expect(exportButton).toBeInTheDocument();
    
    // Verifieer dat de export opties correct worden weergegeven
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Excel')).toBeInTheDocument();
    
    // Test of de bestandsnaam correct wordt gegenereerd
    const filenameRegex = /Topic_Awareness_Rapport_Test_Project/;
    const exportButtonElement = screen.getByRole('button', { name: /rapport exporteren/i });
    expect(exportButtonElement).toHaveAttribute('data-filename', expect.stringMatching(filenameRegex));
    
    // Herstel de useMemo mock
    jest.restoreAllMocks();
  });
  
  test('TopicAwarenessReport toont correcte error messages bij ontbrekende data', () => {
    // Test scenario 1: Laden van data
    render(
      <TopicAwarenessReport
        topicsByPhase={{}}
        awarenessDistribution={[]}
        contentRecommendations={{}}
        trendingTopics={[]}
        projectName="Test Project"
        isLoading={true}
      />
    );
    
    // Controleer of de loading indicator wordt weergegeven
    const loadingIndicator = screen.getByRole('status');
    expect(loadingIndicator).toBeInTheDocument();
    expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Rapport wordt gegenereerd...')).toBeInTheDocument();
    
    // Cleanup voor volgende test
    cleanup();
    
    // Test scenario 2: Geen topics data
    render(
      <TopicAwarenessReport
        topicsByPhase={null}
        awarenessDistribution={[]}
        contentRecommendations={{}}
        trendingTopics={[]}
        projectName="Test Project"
        isLoading={false}
      />
    );
    
    // Controleer of de juiste error message wordt weergegeven
    const errorAlert = screen.getByText(/Er is een fout opgetreden bij het laden van de topic data/i).closest('.MuiAlert-root');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveAttribute('role', 'alert');
    expect(errorAlert).toHaveAttribute('aria-live', 'assertive');
    
    // Cleanup voor volgende test
    cleanup();
    
    // Test scenario 3: Lege topics data
    render(
      <TopicAwarenessReport
        topicsByPhase={{}}
        awarenessDistribution={[]}
        contentRecommendations={{}}
        trendingTopics={[]}
        projectName="Test Project"
        isLoading={false}
      />
    );
    
    // Controleer of de juiste warning message wordt weergegeven
    const warningAlert = screen.getByText(/Geen topics gevonden/i).closest('.MuiAlert-root');
    expect(warningAlert).toBeInTheDocument();
    expect(warningAlert).toHaveAttribute('role', 'alert');
    expect(warningAlert).toHaveAttribute('aria-live', 'polite');
    
    // Cleanup voor volgende test
    cleanup();
    
    // Test scenario 4: Geen awareness distributie data
    render(
      <TopicAwarenessReport
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={null}
        contentRecommendations={{}}
        trendingTopics={[]}
        projectName="Test Project"
        isLoading={false}
      />
    );
    
    // Controleer of de juiste error message wordt weergegeven
    const secondErrorAlert = screen.getByText(/Er is een fout opgetreden bij het laden van de awareness distributie data/i).closest('.MuiAlert-root');
    expect(secondErrorAlert).toBeInTheDocument();
    expect(secondErrorAlert).toHaveAttribute('role', 'alert');
    expect(secondErrorAlert).toHaveAttribute('aria-live', 'assertive');
  });
  
  test('TopicAwarenessAnalyzer heeft correcte toegankelijkheidsattributen', async () => {
    render(
      <TopicAwarenessAnalyzer
        trendingTopics={mockTrendingTopics}
        data={mockData}
        isLoading={false}
        textField="text"
        platformField="platform"
      />
    );
    
    // Controleer of de tabs de juiste toegankelijkheidsattributen hebben
    const tabsElement = screen.getByRole('tablist');
    expect(tabsElement).toHaveAttribute('aria-label', 'Topic awareness analyse tabbladen');
    
    // Controleer of elke tab de juiste toegankelijkheidsattributen heeft
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('id', 'tab-0');
    expect(tabs[0]).toHaveAttribute('aria-controls', 'tabpanel-0');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true'); // Eerste tab is standaard geselecteerd
    
    expect(tabs[1]).toHaveAttribute('id', 'tab-1');
    expect(tabs[1]).toHaveAttribute('aria-controls', 'tabpanel-1');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    
    // Controleer of het actieve tabpanel de juiste toegankelijkheidsattributen heeft
    const activeTabPanel = screen.getByRole('tabpanel', { hidden: false });
    expect(activeTabPanel).toHaveAttribute('id', 'tabpanel-0');
    expect(activeTabPanel).toHaveAttribute('aria-labelledby', 'tab-0');
    expect(activeTabPanel).toHaveAttribute('tabIndex', '0');
    
    // Controleer of de loading indicator de juiste toegankelijkheidsattributen heeft
    const user = userEvent.setup();
    
    // Klik op een andere tab om de toegankelijkheidsattributen te testen
    await user.click(tabs[1]);
    
    // Controleer of de tab-selectie correct is bijgewerkt
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    
    // Controleer of het nieuwe actieve tabpanel de juiste toegankelijkheidsattributen heeft
    const newActiveTabPanel = screen.getByRole('tabpanel', { hidden: false });
    expect(newActiveTabPanel).toHaveAttribute('id', 'tabpanel-1');
    expect(newActiveTabPanel).toHaveAttribute('aria-labelledby', 'tab-1');
    expect(newActiveTabPanel).toHaveAttribute('tabIndex', '0');
  });
  
  test('TopicAwarenessAnalyzer toont alerts met correcte toegankelijkheidsattributen', () => {
    // Test scenario: Geen trending topics
    render(
      <TopicAwarenessAnalyzer
        trendingTopics={[]}
        data={mockData}
        isLoading={false}
        textField="text"
        platformField="platform"
      />
    );
    
    // Zoek de alert component
    const alertElement = screen.getByText('Geen trending topics beschikbaar. Voer eerst een trending topics analyse uit.').closest('.MuiAlert-root');
    
    // Controleer of de alert de juiste toegankelijkheidsattributen heeft
    expect(alertElement).toHaveAttribute('role', 'alert');
    expect(alertElement).toHaveAttribute('aria-live', 'polite');
    
    // Cleanup voor volgende test
    cleanup();
    
    // Test scenario: Data wordt geladen
    render(
      <TopicAwarenessAnalyzer
        trendingTopics={mockTrendingTopics}
        data={mockData}
        isLoading={true}
        textField="text"
        platformField="platform"
      />
    );
    
    // Zoek de loading indicator
    const loadingIndicator = screen.getByRole('status');
    
    // Controleer of de loading indicator de juiste toegankelijkheidsattributen heeft
    expect(loadingIndicator).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Data wordt geladen, even geduld a.u.b.')).toBeInTheDocument();
  });
  
  test('TopicAwarenessReport heeft correcte toegankelijkheidsattributen voor formulierelementen', async () => {
    // Setup user-event
    const user = userEvent.setup();
    
    render(
      <TopicAwarenessReport
        topicsByPhase={mockTopicsByPhase}
        awarenessDistribution={mockAwarenessDistribution}
        contentRecommendations={mockContentRecommendations}
        trendingTopics={mockTrendingTopics}
        projectName="Test Project"
        isLoading={false}
      />
    );
    
    // Controleer of de formulierelementen de juiste toegankelijkheidsattributen hebben
    
    // 1. Controleer de tekstvelden
    const productNameInput = screen.getByLabelText('Product/Service Naam');
    expect(productNameInput).toHaveAttribute('aria-describedby', 'product-name-helper-text');
    expect(productNameInput).toHaveAttribute('id', 'product-name-input');
    
    const industrieInput = screen.getByLabelText('Industrie/Niche');
    expect(industrieInput).toHaveAttribute('aria-describedby', 'industrie-helper-text');
    expect(industrieInput).toHaveAttribute('id', 'industrie-input');
    
    // 2. Controleer de checkboxes
    const executiveSummaryCheckbox = screen.getByLabelText('Executive Summary');
    expect(executiveSummaryCheckbox).toHaveAttribute('id', 'checkbox-executive-summary');
    expect(executiveSummaryCheckbox).toHaveAttribute('aria-describedby', 'executive-summary-description');
    
    const topicDetailsCheckbox = screen.getByLabelText('Topic Details per Fase');
    expect(topicDetailsCheckbox).toHaveAttribute('id', 'checkbox-topic-details');
    expect(topicDetailsCheckbox).toHaveAttribute('aria-describedby', 'topic-details-description');
    
    // 3. Controleer de knoppen
    const previewButton = screen.getByRole('button', { name: /preview van executive summary/i });
    expect(previewButton).toHaveAttribute('aria-describedby', 'preview-button-description');
    
    // 4. Controleer de FormGroup
    const formGroup = executiveSummaryCheckbox.closest('[role="group"]');
    expect(formGroup).toHaveAttribute('aria-labelledby', 'rapport-secties-label');
    
    // 5. Test interactie met de checkboxes
    await user.click(executiveSummaryCheckbox);
    expect(executiveSummaryCheckbox).not.toBeChecked();
    
    await user.click(executiveSummaryCheckbox);
    expect(executiveSummaryCheckbox).toBeChecked();
  });
});
