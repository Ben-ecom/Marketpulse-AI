# TopicAwarenessDashboard Component

## Overzicht
Het TopicAwarenessDashboard component is een visualisatie tool voor topic awareness analyses binnen het MarketPulse AI platform. Het biedt een interactief dashboard met grafieken en visualisaties van awareness fasen, trending topics en content aanbevelingen.

## Belangrijkste functies
- Visualisatie van awareness distributie met voortgangsbalken
- Weergave van topics gegroepeerd per awareness fase
- Lijst van trending topics met sentiment indicatie
- Content aanbevelingen per awareness fase
- Filtering op awareness fase
- Responsive design voor verschillende schermgroottes
- Skeleton loaders tijdens het laden van data

## Technische details

### Props

| Naam | Type | Verplicht | Standaardwaarde | Beschrijving |
|------|------|-----------|----------------|--------------|
| topicsByPhase | Object | Nee | `{}` | Object met topics gegroepeerd per awareness fase |
| awarenessDistribution | Array | Nee | `[]` | Array met awareness distributie data |
| contentRecommendations | Object | Nee | `{}` | Object met content aanbevelingen per awareness fase |
| trendingTopics | Array | Nee | `[]` | Array met trending topics data |
| isLoading | Boolean | Nee | `false` | Geeft aan of de data nog wordt geladen |

### State
- **selectedPhase**: Geselecteerde awareness fase voor filtering (standaard: 'all')

### Hooks
- **useMemo**: Voor het memoizen van berekeningen (totaal aantal topics, top trending topics, gefilterde topics)
- **useState**: Voor het bijhouden van de geselecteerde fase
- **useTheme**: Voor toegang tot het Material UI thema

### Performance optimalisaties
- Memoization van berekeningen met useMemo
- Conditionale rendering van componenten
- Skeleton loaders voor asynchrone content

## Toegankelijkheid
Het component is volledig toegankelijk volgens WCAG 2.1 richtlijnen:
- Alle interactieve elementen hebben aria-labels
- Decoratieve iconen hebben aria-hidden="true"
- Correcte heading hiërarchie
- Kleurcontrast voldoet aan WCAG AA standaard
- Toetsenbordnavigatie met correcte tabIndex waarden

## Gebruik

```jsx
import TopicAwarenessDashboard from '../components/dashboards/TopicAwarenessDashboard';

// In je component
<TopicAwarenessDashboard
  topicsByPhase={topicsByPhase}
  awarenessDistribution={awarenessDistribution}
  contentRecommendations={contentRecommendations}
  trendingTopics={trendingTopics}
  isLoading={false}
/>
```

## Data formaten

### topicsByPhase
```javascript
{
  "awareness": ["Topic 1", "Topic 2", "Topic 3"],
  "consideration": ["Topic 4", "Topic 5"],
  "decision": ["Topic 6", "Topic 7"]
}
```

### awarenessDistribution
```javascript
[
  { phase: "Awareness", percentage: 40 },
  { phase: "Consideration", percentage: 35 },
  { phase: "Decision", percentage: 25 }
]
```

### contentRecommendations
```javascript
{
  "awareness": ["Blog posts", "Social media content", "Infographics"],
  "consideration": ["Case studies", "Webinars", "Product comparisons"],
  "decision": ["Product demos", "Customer testimonials", "Pricing guides"]
}
```

### trendingTopics
```javascript
[
  { topic: "AI", volume: 100, sentiment: 0.8 },
  { topic: "Machine Learning", volume: 80, sentiment: 0.7 },
  { topic: "Data Science", volume: 60, sentiment: 0.6 }
]
```

## Integratie met andere componenten
Het TopicAwarenessDashboard component kan worden geïntegreerd met de volgende componenten:
- **DataSourceSelector**: Voor het selecteren van databronnen
- **DateRangePicker**: Voor het selecteren van datumbereiken
- **TopicAwarenessReport**: Voor het genereren van gedetailleerde rapporten

## Testen
Het component heeft uitgebreide tests die de volgende aspecten controleren:
- Rendering van verschillende staten (loading, error, success)
- Filtering van topics op basis van geselecteerde fase
- Correcte weergave van trending topics
- Correcte weergave van awareness distributie
- Correcte weergave van content aanbevelingen

## Toekomstige verbeteringen
- Interactieve grafieken met Chart.js of D3.js
- Exporteren van dashboard als afbeelding of PDF
- Vergelijking van data over verschillende periodes
- Drill-down functionaliteit voor meer details
- Aangepaste kleurenschema's voor visualisaties

## Bijdragen
Verbeteringen aan dit component zijn welkom. Zorg ervoor dat alle tests slagen en dat de toegankelijkheid behouden blijft bij het indienen van pull requests.
