# Analyse Componenten voor MarketPulse AI

Deze directory bevat geavanceerde analysecomponenten voor het MarketPulse AI platform. Deze componenten bieden diepgaande analyses en visualisaties van topic awareness data en zijn ontworpen om inzichten te genereren uit de verzamelde data.

## SentimentAnalysis Component

### Overzicht
Het SentimentAnalysis component analyseert en visualiseert sentiment per topic en awareness fase. Het biedt inzicht in de positieve, neutrale en negatieve sentimenten binnen verschillende segmenten.

### Belangrijkste functies
- Analyse van sentiment per topic en awareness fase
- Visualisatie van sentiment distributies
- Filtering op awareness fase en topic
- Interactieve visualisaties met percentage bars
- Responsieve layout voor verschillende schermformaten
- Toegankelijkheid volgens WCAG 2.1 richtlijnen

### Gebruik

```jsx
import SentimentAnalysis from '../components/analysis/SentimentAnalysis';

// In je component
<SentimentAnalysis
  topicsByPhase={topicsByPhase}
  trendingTopics={trendingTopics}
  isLoading={false}
/>
```

### Props

| Naam | Type | Verplicht | Standaardwaarde | Beschrijving |
|------|------|-----------|----------------|--------------|
| topicsByPhase | Object | Ja | `{}` | Object met topics gegroepeerd per awareness fase |
| trendingTopics | Array | Ja | `[]` | Array met trending topics data inclusief sentiment scores |
| isLoading | Boolean | Nee | `false` | Geeft aan of de data nog wordt geladen |

### Performance optimalisaties
- Memoization van zware berekeningen met useMemo
- Skeleton loaders voor asynchrone content
- Conditionale rendering van componenten

## TrendAnalysis Component

### Overzicht
Het TrendAnalysis component analyseert en visualiseert trends over tijd. Het biedt inzicht in de ontwikkeling van topics en sentiment over verschillende tijdsperiodes.

### Belangrijkste functies
- Analyse van trends over tijd voor topics en sentiment
- Visualisatie van trends met lijngrafieken
- Filtering op topic en tijdsgranulariteit (dag, week, maand)
- Schakelen tussen volume en sentiment visualisatie
- Trend indicatoren (stijgend, dalend, stabiel)
- Responsieve layout voor verschillende schermformaten
- Toegankelijkheid volgens WCAG 2.1 richtlijnen

### Gebruik

```jsx
import TrendAnalysis from '../components/analysis/TrendAnalysis';

// In je component
<TrendAnalysis
  trendingTopics={trendingTopics}
  timeSeriesData={timeSeriesData}
  isLoading={false}
/>
```

### Props

| Naam | Type | Verplicht | Standaardwaarde | Beschrijving |
|------|------|-----------|----------------|--------------|
| trendingTopics | Array | Ja | `[]` | Array met trending topics data inclusief sentiment scores |
| timeSeriesData | Array | Ja | `[]` | Array met tijdreeks data voor trends |
| isLoading | Boolean | Nee | `false` | Geeft aan of de data nog wordt geladen |

### Performance optimalisaties
- Memoization van zware berekeningen met useMemo
- Skeleton loaders voor asynchrone content
- Conditionale rendering van componenten
- Efficiënte data-aggregatie voor verschillende tijdsgranulariteiten

## Integratie met TopicAwarenessController

De analysecomponenten kunnen eenvoudig worden geïntegreerd in de TopicAwarenessController component om een complete analyse-ervaring te bieden. Hier is een voorbeeld van hoe de integratie kan worden uitgevoerd:

```jsx
import SentimentAnalysis from '../analysis/SentimentAnalysis';
import TrendAnalysis from '../analysis/TrendAnalysis';

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

## Toekomstige Uitbreidingen

De analyse directory is ontworpen om gemakkelijk te worden uitgebreid met nieuwe analysecomponenten. Toekomstige uitbreidingen kunnen omvatten:

1. **CorrelationAnalysis** - Voor het analyseren van correlaties tussen topics
2. **SegmentationAnalysis** - Voor het segmenteren van doelgroepen op basis van awareness
3. **PredictiveAnalysis** - Voor het voorspellen van toekomstige trends
4. **CompetitorAnalysis** - Voor het vergelijken van eigen topics met die van concurrenten

## Bijdragen

Verbeteringen aan deze componenten zijn welkom. Zorg ervoor dat alle tests slagen en dat de toegankelijkheid behouden blijft bij het indienen van pull requests.
