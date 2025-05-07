# Controller Componenten voor MarketPulse AI

Deze directory bevat controller componenten voor het MarketPulse AI platform. Deze componenten beheren de state en navigatie tussen verschillende views en zorgen voor een consistente gebruikerservaring.

## TopicAwarenessController Component

### Overzicht
Het TopicAwarenessController component beheert de state en navigatie tussen de TopicAwarenessDashboard en TopicAwarenessReport componenten. Het zorgt voor een geïntegreerde ervaring waarbij gebruikers naadloos kunnen schakelen tussen dashboard en rapport views.

### Belangrijkste functies
- Gedeelde state tussen dashboard en rapport componenten
- Navigatie tussen verschillende views (dashboard, rapport)
- Geïntegreerde filters voor databronnen en datumbereiken
- Export functionaliteit voor dashboards
- Deel functionaliteit voor inzichten
- Foutafhandeling en laadstatussen
- Snackbar notificaties voor gebruikersfeedback
- Responsieve layout voor verschillende schermformaten
- Toegankelijkheid volgens WCAG 2.1 richtlijnen

### Gebruik

```jsx
import TopicAwarenessController from '../components/controllers/TopicAwarenessController';

// In je component
<TopicAwarenessController
  projectId="project-123"
  projectName="MarketPulse AI"
/>
```

### Props

| Naam | Type | Verplicht | Standaardwaarde | Beschrijving |
|------|------|-----------|----------------|--------------|
| projectId | String | Ja | - | ID van het project waarvoor de analyses worden uitgevoerd |
| projectName | String | Nee | 'MarketPulse AI' | Naam van het project waarvoor de analyses worden uitgevoerd |

### State Management
Het TopicAwarenessController component beheert de volgende state:

- **Data state**: topicsByPhase, awarenessDistribution, contentRecommendations, trendingTopics
- **UI state**: activeView, isLoading, error, snackbar
- **Filter state**: dataSource, dateRange, startDate, endDate

### Integratie met Analysecomponenten
Het TopicAwarenessController kan worden uitgebreid met de nieuwe analysecomponenten (SentimentAnalysis en TrendAnalysis) om een complete analyse-ervaring te bieden. Zie de documentatie in `/components/analysis/README.md` voor meer informatie over deze componenten.

### Voorbeeld van integratie met analysecomponenten:

```jsx
// In de TopicAwarenessController component
const [activeTab, setActiveTab] = useState('dashboard');

// Render functie
return (
  <Box>
    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
      <Tab value="dashboard" label="Dashboard" />
      <Tab value="report" label="Rapport" />
      <Tab value="sentiment" label="Sentiment Analyse" />
      <Tab value="trends" label="Trend Analyse" />
    </Tabs>
    
    {activeTab === 'dashboard' && (
      <TopicAwarenessDashboard 
        topicsByPhase={topicsByPhase}
        awarenessDistribution={awarenessDistribution}
        contentRecommendations={contentRecommendations}
        trendingTopics={trendingTopics}
        isLoading={isLoading}
      />
    )}
    
    {activeTab === 'report' && (
      <TopicAwarenessReport 
        topicsByPhase={topicsByPhase}
        awarenessDistribution={awarenessDistribution}
        contentRecommendations={contentRecommendations}
        trendingTopics={trendingTopics}
        projectName={projectName}
        isLoading={isLoading}
      />
    )}
    
    {activeTab === 'sentiment' && (
      <SentimentAnalysis 
        topicsByPhase={topicsByPhase}
        trendingTopics={trendingTopics}
        isLoading={isLoading}
      />
    )}
    
    {activeTab === 'trends' && (
      <TrendAnalysis 
        trendingTopics={trendingTopics}
        timeSeriesData={timeSeriesData}
        isLoading={isLoading}
      />
    )}
  </Box>
);
```

### Data Flow
Het TopicAwarenessController component haalt data op van de topicAwarenessService en geeft deze door aan de child componenten. De data flow is als volgt:

1. TopicAwarenessController haalt data op van de API
2. Data wordt opgeslagen in de state van de controller
3. Controller geeft de data door aan de child componenten (dashboard, rapport, analyses)
4. Child componenten renderen de data volgens hun eigen logica
5. Gebruikersinteracties in de child componenten worden doorgegeven aan de controller via callbacks
6. Controller verwerkt de interacties en update de state indien nodig

### Performance optimalisaties
- Memoization van zware berekeningen met useMemo
- Lazy loading van componenten
- Skeleton loaders voor asynchrone content
- Conditionale rendering van componenten
- Debouncing van filter wijzigingen

### Toegankelijkheid
Het component is volledig toegankelijk volgens WCAG 2.1 richtlijnen:
- Alle interactieve elementen hebben aria-labels of aria-describedby attributen
- Decoratieve iconen hebben aria-hidden="true"
- Correcte heading hiërarchie (h1, h2, h3)
- Toetsenbordnavigatie met correcte tabIndex waarden
- Statusmeldingen met aria-live regio's
- Kleurcontrast voldoet aan WCAG AA standaard

### Testen
Het component heeft uitgebreide tests die de volgende aspecten controleren:
- Rendering van verschillende staten (loading, error, success)
- Navigatie tussen verschillende views
- Interactie met filters
- Export en deel functionaliteit
- Foutafhandeling

### Toekomstige Uitbreidingen
De TopicAwarenessController is ontworpen om gemakkelijk te worden uitgebreid met nieuwe functionaliteit. Toekomstige uitbreidingen kunnen omvatten:

1. **Integratie met AI-gegenereerde inzichten** - Voor het automatisch genereren van aanbevelingen op basis van de data
2. **Realtime samenwerking** - Voor het samenwerken aan rapporten en dashboards
3. **Aangepaste dashboards** - Voor het aanpassen van de layout en inhoud van dashboards
4. **Geavanceerde filters** - Voor het filteren op meer dimensies zoals demografie, platform, etc.

### Bijdragen
Verbeteringen aan dit component zijn welkom. Zorg ervoor dat alle tests slagen en dat de toegankelijkheid behouden blijft bij het indienen van pull requests.
