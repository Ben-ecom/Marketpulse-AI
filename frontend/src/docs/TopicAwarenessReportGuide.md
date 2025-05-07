# Ontwikkelaarshandleiding: TopicAwarenessReport Component

## Inhoudsopgave
1. [Introductie](#introductie)
2. [Architectuur](#architectuur)
3. [Installatie en Setup](#installatie-en-setup)
4. [Gebruik](#gebruik)
5. [API Referentie](#api-referentie)
6. [Voorbeelden](#voorbeelden)
7. [Testen](#testen)
8. [Toegankelijkheid](#toegankelijkheid)
9. [Performance Optimalisaties](#performance-optimalisaties)
10. [Veelvoorkomende Problemen](#veelvoorkomende-problemen)
11. [Bijdragen](#bijdragen)

## Introductie

Het TopicAwarenessReport component is een kernonderdeel van het MarketPulse AI platform, ontworpen om gebruikers te helpen bij het genereren, aanpassen en exporteren van gedetailleerde rapporten over topic awareness analyses. Dit component integreert data van verschillende bronnen, zoals trending topics, awareness fasen, en content aanbevelingen, om een uitgebreid rapport te creëren dat inzicht geeft in de awareness van doelgroepen over specifieke onderwerpen.

### Belangrijkste Functies
- Genereren van rapporten met verschillende secties
- Aanpassen van rapport opties
- Preview van rapport in markdown formaat
- Export naar verschillende formaten (PDF, Excel)
- Privacy opties voor het anonimiseren van gegevens
- Toegankelijkheid volgens WCAG 2.1 richtlijnen
- Persistentie van gebruikersvoorkeuren

## Architectuur

Het TopicAwarenessReport component volgt een modulaire architectuur met duidelijke scheiding van verantwoordelijkheden:

```
MarketPulse AI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── integrated/
│   │   │   │   ├── TopicAwarenessReport.jsx       # Hoofdcomponent
│   │   │   │   ├── TopicAwarenessReport.md        # Documentatie
│   │   │   │   ├── README.md                      # Overzicht van geïntegreerde componenten
│   │   │   │   └── __tests__/
│   │   │   │       └── TopicAwarenessReport.test.jsx  # Unit tests
│   │   │   ├── common/
│   │   │   │   ├── DataSourceSelector.jsx         # Ondersteunende component
│   │   │   │   └── DateRangePicker.jsx            # Ondersteunende component
│   │   ├── routes/
│   │   │   └── TopicAwarenessReportPage.jsx       # Route component
│   │   ├── services/
│   │   │   └── topicAwarenessService.js           # API service
│   │   ├── examples/
│   │   │   └── TopicAwarenessReportExample.jsx    # Voorbeeld implementatie
│   │   └── docs/
│   │       └── TopicAwarenessReportGuide.md       # Deze handleiding
```

### Dataflow
1. De gebruiker configureert rapport opties via het formulier
2. Bij het genereren van het rapport worden de opties gecombineerd met de data
3. Het rapport wordt gegenereerd en getoond in de preview
4. De gebruiker kan het rapport exporteren naar verschillende formaten

## Installatie en Setup

Het TopicAwarenessReport component is onderdeel van het MarketPulse AI platform en vereist de volgende dependencies:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "react-markdown": "^8.0.7",
    "prop-types": "^15.8.1"
  }
}
```

### Integratie in een bestaand project

1. Zorg ervoor dat alle dependencies zijn geïnstalleerd
2. Kopieer de benodigde componenten naar je project:
   - `TopicAwarenessReport.jsx`
   - `DataSourceSelector.jsx` (indien nodig)
   - `DateRangePicker.jsx` (indien nodig)
3. Importeer en gebruik het component in je applicatie

## Gebruik

### Basis Implementatie

```jsx
import React, { useState, useEffect } from 'react';
import TopicAwarenessReport from '../components/integrated/TopicAwarenessReport';
import { 
  fetchTopicsByPhase, 
  fetchAwarenessDistribution,
  fetchContentRecommendations,
  fetchTrendingTopics
} from '../services/topicAwarenessService';

const TopicAwarenessPage = () => {
  const [topicsByPhase, setTopicsByPhase] = useState(null);
  const [awarenessDistribution, setAwarenessDistribution] = useState(null);
  const [contentRecommendations, setContentRecommendations] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [topics, distribution, recommendations, trending] = await Promise.all([
          fetchTopicsByPhase(),
          fetchAwarenessDistribution(),
          fetchContentRecommendations(),
          fetchTrendingTopics()
        ]);
        
        setTopicsByPhase(topics);
        setAwarenessDistribution(distribution);
        setContentRecommendations(recommendations);
        setTrendingTopics(trending);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  return (
    <TopicAwarenessReport
      topicsByPhase={topicsByPhase}
      awarenessDistribution={awarenessDistribution}
      contentRecommendations={contentRecommendations}
      trendingTopics={trendingTopics}
      projectName="Mijn Project"
      isLoading={isLoading}
    />
  );
};

export default TopicAwarenessPage;
```

### Geavanceerde Implementatie

Voor een geavanceerde implementatie met filters, zie het voorbeeld in:
`/frontend/src/examples/TopicAwarenessReportExample.jsx`

## API Referentie

### Props

| Naam | Type | Verplicht | Standaardwaarde | Beschrijving |
|------|------|-----------|----------------|--------------|
| topicsByPhase | Object | Ja | `{}` | Object met topics gegroepeerd per awareness fase |
| awarenessDistribution | Array | Ja | `[]` | Array met awareness distributie data |
| contentRecommendations | Object | Nee | `{}` | Object met content aanbevelingen per awareness fase |
| trendingTopics | Array | Nee | `[]` | Array met trending topics data |
| projectName | String | Nee | `''` | Naam van het project waarvoor het rapport wordt gegenereerd |
| isLoading | Boolean | Nee | `false` | Geeft aan of de data nog wordt geladen |
| onReportGenerated | Function | Nee | - | Callback functie die wordt aangeroepen wanneer het rapport is gegenereerd |
| dataCollectionDate | String/Date | Nee | - | Datum waarop de data is verzameld |

### Data Formaten

#### topicsByPhase

```javascript
{
  "awareness": ["Topic 1", "Topic 2", "Topic 3"],
  "consideration": ["Topic 4", "Topic 5"],
  "decision": ["Topic 6", "Topic 7"]
}
```

#### awarenessDistribution

```javascript
[
  { phase: "Awareness", percentage: 40 },
  { phase: "Consideration", percentage: 35 },
  { phase: "Decision", percentage: 25 }
]
```

#### contentRecommendations

```javascript
{
  "awareness": ["Blog posts", "Social media content", "Infographics"],
  "consideration": ["Case studies", "Webinars", "Product comparisons"],
  "decision": ["Product demos", "Customer testimonials", "Pricing guides"]
}
```

#### trendingTopics

```javascript
[
  { topic: "AI", volume: 100, sentiment: 0.8 },
  { topic: "Machine Learning", volume: 80, sentiment: 0.7 },
  { topic: "Data Science", volume: 60, sentiment: 0.6 }
]
```

## Voorbeelden

### Basis Rapport

```jsx
<TopicAwarenessReport
  topicsByPhase={{
    awareness: ["AI", "Machine Learning", "Data Science"],
    consideration: ["AI Tools", "ML Frameworks"],
    decision: ["AI Implementation"]
  }}
  awarenessDistribution={[
    { phase: "Awareness", percentage: 50 },
    { phase: "Consideration", percentage: 30 },
    { phase: "Decision", percentage: 20 }
  ]}
  projectName="AI Trends"
/>
```

### Volledig Rapport met Alle Opties

```jsx
<TopicAwarenessReport
  topicsByPhase={{
    awareness: ["AI", "Machine Learning", "Data Science"],
    consideration: ["AI Tools", "ML Frameworks"],
    decision: ["AI Implementation"]
  }}
  awarenessDistribution={[
    { phase: "Awareness", percentage: 50 },
    { phase: "Consideration", percentage: 30 },
    { phase: "Decision", percentage: 20 }
  ]}
  contentRecommendations={{
    awareness: ["Blog posts about AI basics", "Social media content explaining ML"],
    consideration: ["Case studies on AI implementation", "Webinars on ML frameworks"],
    decision: ["Product demos of AI tools", "Customer testimonials"]
  }}
  trendingTopics={[
    { topic: "AI", volume: 100, sentiment: 0.8 },
    { topic: "Machine Learning", volume: 80, sentiment: 0.7 },
    { topic: "Data Science", volume: 60, sentiment: 0.6 }
  ]}
  projectName="AI Trends 2025"
  dataCollectionDate={new Date()}
  onReportGenerated={(reportData) => {
    console.log('Rapport gegenereerd:', reportData);
    // Voer hier je eigen logica uit
  }}
/>
```

## Testen

Het component heeft uitgebreide tests die verschillende aspecten controleren. De tests zijn te vinden in:
`/frontend/src/components/integrated/__tests__/TopicAwarenessReport.test.jsx`

Om de tests uit te voeren:

```bash
# In de root van het project
npm test -- --testPathPattern=TopicAwarenessReport
```

### Test Coverage

De tests dekken de volgende aspecten:
- Rendering van verschillende staten (loading, error, success)
- Interactie met form elementen
- Toegankelijkheid
- Integratie met andere componenten
- Persistentie van gebruikersvoorkeuren

## Toegankelijkheid

Het component is volledig toegankelijk volgens WCAG 2.1 richtlijnen:

### Implementatie Details
- Alle interactieve elementen hebben aria-labels of aria-describedby attributen
- Decoratieve iconen hebben aria-hidden="true"
- Correcte heading hiërarchie (h1, h2, h3)
- Toetsenbordnavigatie met correcte tabIndex waarden
- Statusmeldingen met aria-live regio's
- Kleurcontrast voldoet aan WCAG AA standaard

### Toegankelijkheid Testen
Gebruik tools zoals axe-core of Lighthouse om de toegankelijkheid te testen:

```bash
# Installeer axe-core
npm install --save-dev @axe-core/react

# Voeg toe aan je tests
import { axe } from '@axe-core/react';
```

## Performance Optimalisaties

Het component bevat verschillende optimalisaties voor betere performance:

### Lazy Loading
ReactMarkdown wordt alleen geladen wanneer nodig:

```jsx
const ReactMarkdown = React.lazy(() => import('react-markdown'));
```

### Memoization
Zware berekeningen worden gememoized met useMemo:

```jsx
const generatedReport = useMemo(() => {
  // Complexe berekeningen
  return result;
}, [dependencies]);
```

### Conditionale Rendering
Componenten worden alleen gerenderd wanneer nodig:

```jsx
{isLoading ? <Skeleton /> : <ActualContent />}
```

## Veelvoorkomende Problemen

### Probleem: Rapport wordt niet gegenereerd
**Oplossing**: Controleer of alle verplichte data (topicsByPhase, awarenessDistribution) correct is doorgegeven en niet null of undefined is.

### Probleem: Export werkt niet
**Oplossing**: Controleer of de browser het exporteren van bestanden ondersteunt. Sommige browsers hebben beperkingen voor het downloaden van bestanden.

### Probleem: Styling issues
**Oplossing**: Zorg ervoor dat alle Material UI dependencies correct zijn geïnstalleerd en dat het thema correct is geconfigureerd.

## Bijdragen

Verbeteringen aan dit component zijn welkom. Volg deze stappen om bij te dragen:

1. Fork de repository
2. Maak een nieuwe branch voor je wijzigingen
3. Voeg je wijzigingen toe
4. Zorg ervoor dat alle tests slagen
5. Dien een pull request in

### Richtlijnen
- Behoud de bestaande code stijl
- Voeg tests toe voor nieuwe functionaliteit
- Zorg ervoor dat de toegankelijkheid behouden blijft
- Documenteer nieuwe props of functionaliteit
- Voeg JSDoc commentaar toe aan nieuwe functies en componenten
