# TopicAwarenessReport Component

## Overzicht
Het TopicAwarenessReport component is een geavanceerde rapportgenerator voor topic awareness analyses binnen het MarketPulse AI platform. Het stelt gebruikers in staat om gedetailleerde rapporten te genereren, aan te passen en te exporteren op basis van topic awareness data.

## Belangrijkste functies
- Genereren van rapporten met verschillende secties (Executive Summary, Topic Details, etc.)
- Aanpassen van rapport opties (product naam, industrie, etc.)
- Preview van Executive Summary in markdown formaat
- Export naar PDF en Excel formaten
- Privacy opties voor het anonimiseren van gegevens
- Toegankelijkheid volgens WCAG 2.1 richtlijnen
- Persistentie van gebruikersvoorkeuren via localStorage

## Technische details

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

### State
- **reportOptions**: Configuratie opties voor het rapport (productName, industrie, secties, privacy)
- **showPreview**: Boolean die aangeeft of de preview modal moet worden weergegeven
- **previewContent**: Markdown content voor de preview
- **showSnackbar**: Boolean die aangeeft of de snackbar moet worden weergegeven
- **snackbarMessage**: Bericht dat in de snackbar wordt weergegeven
- **snackbarSeverity**: Type snackbar (success, error, warning, info)

### Hooks
- **useMemo**: Voor het memoizen van zware berekeningen (rapport generatie, export configuratie)
- **useCallback**: Voor het optimaliseren van event handlers
- **useEffect**: Voor het laden van opgeslagen voorkeuren bij initialisatie
- **useTheme**: Voor toegang tot het Material UI thema

### Performance optimalisaties
- Lazy loading van ReactMarkdown component
- Memoization van zware berekeningen
- Skeleton loaders voor asynchrone content
- Conditionale rendering van componenten

## Toegankelijkheid
Het component is volledig toegankelijk volgens WCAG 2.1 richtlijnen:
- Alle interactieve elementen hebben aria-labels of aria-describedby attributen
- Decoratieve iconen hebben aria-hidden="true"
- Correcte heading hiërarchie (h1, h2, h3)
- Toetsenbordnavigatie met correcte tabIndex waarden
- Statusmeldingen met aria-live regio's
- Kleurcontrast voldoet aan WCAG AA standaard

## Privacy en compliance
- Optie voor het anonimiseren van gegevens
- Waarschuwingen bij het opnemen van persoonlijke gegevens
- Duidelijke informatie over gegevensgebruik
- Voldoet aan GDPR richtlijnen voor gegevensbescherming

## Gebruik

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

## Integratie met andere componenten
Het TopicAwarenessReport component integreert met de volgende componenten:
- **ExportButton**: Voor het exporteren van rapporten naar PDF en Excel
- **ReactMarkdown**: Voor het renderen van markdown content in de preview

## Testen
Het component heeft uitgebreide tests die de volgende aspecten controleren:
- Rendering van verschillende staten (loading, error, success)
- Interactie met form elementen
- Toegankelijkheid
- Integratie met andere componenten
- Persistentie van gebruikersvoorkeuren

## Toekomstige verbeteringen
- Ondersteuning voor meer export formaten (HTML, Word)
- Geavanceerde rapport templates
- Realtime samenwerking aan rapporten
- AI-gegenereerde aanbevelingen op basis van rapport data

## Bijdragen
Verbeteringen aan dit component zijn welkom. Zorg ervoor dat alle tests slagen en dat de toegankelijkheid behouden blijft bij het indienen van pull requests.

## Licentie
Dit component is onderdeel van het MarketPulse AI platform en valt onder de bedrijfslicentie.
