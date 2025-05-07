# Geïntegreerde Componenten voor MarketPulse AI

Dit directory bevat geïntegreerde componenten voor het MarketPulse AI platform. Deze componenten combineren meerdere functionaliteiten en zijn ontworpen om direct in pagina's en views te worden gebruikt.

## TopicAwarenessReport Component

### Overzicht
Het TopicAwarenessReport component is een geavanceerde rapportgenerator voor topic awareness analyses. Het stelt gebruikers in staat om gedetailleerde rapporten te genereren, aan te passen en te exporteren op basis van topic awareness data.

### Belangrijkste functies
- Genereren van rapporten met verschillende secties (Executive Summary, Topic Details, etc.)
- Aanpassen van rapport opties (product naam, industrie, etc.)
- Preview van Executive Summary in markdown formaat
- Export naar PDF en Excel formaten
- Privacy opties voor het anonimiseren van gegevens
- Toegankelijkheid volgens WCAG 2.1 richtlijnen
- Persistentie van gebruikersvoorkeuren via localStorage

### Bestanden
- `TopicAwarenessReport.jsx` - Hoofdcomponent implementatie
- `TopicAwarenessReport.test.jsx` - Unit tests voor het component
- `TopicAwarenessReport.md` - Gedetailleerde documentatie

### Gebruik

```jsx
import TopicAwarenessReport from '../components/integrated/TopicAwarenessReport';

// In je component
<TopicAwarenessReport
  topicsByPhase={topicsByPhase}
  awarenessDistribution={awarenessDistribution}
  contentRecommendations={contentRecommendations}
  trendingTopics={trendingTopics}
  projectName="MarketPulse AI"
  isLoading={false}
/>
```

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

### Voorbeeld
Een volledig voorbeeld van het gebruik van het TopicAwarenessReport component is te vinden in:
`/frontend/src/examples/TopicAwarenessReportExample.jsx`

Dit voorbeeld toont hoe het component kan worden geïntegreerd in een grotere applicatie met data-ophaling, filtering en configuratie-opties.

### Afhankelijkheden
- React
- Material UI
- ReactMarkdown (lazy-loaded)
- ExportButton component

### Performance optimalisaties
- Lazy loading van ReactMarkdown component
- Memoization van zware berekeningen
- Skeleton loaders voor asynchrone content
- Conditionale rendering van componenten

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
- Interactie met form elementen
- Toegankelijkheid
- Integratie met andere componenten
- Persistentie van gebruikersvoorkeuren

### Bijdragen
Verbeteringen aan dit component zijn welkom. Zorg ervoor dat alle tests slagen en dat de toegankelijkheid behouden blijft bij het indienen van pull requests.
