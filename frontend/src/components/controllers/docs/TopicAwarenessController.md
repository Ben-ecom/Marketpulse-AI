# TopicAwarenessController Technische Documentatie

## 1. Overzicht

De `TopicAwarenessController` is een React component dat dient als centraal beheerpunt voor de Topic Awareness functionaliteit in MarketPulse AI. Het integreert verschillende componenten zoals het dashboard, rapport en analysetools, en zorgt voor een consistente gebruikerservaring door gedeelde state en navigatie.

## 2. Architectuur

### 2.1 Component Hiërarchie

```
TopicAwarenessController
├── Filters (DataSourceSelector, DateRangePicker)
├── TopicAwarenessDashboard
├── TopicAwarenessReport
├── DashboardExport
└── ShareInsights
```

### 2.2 Data Flow

```
┌─────────────────────┐      ┌─────────────────────┐
│                     │      │                     │
│  topicAwarenessService  ───▶  TopicAwarenessController │
│                     │      │                     │
└─────────────────────┘      └──────────┬──────────┘
                                        │
                                        ▼
                      ┌─────────────────┬─────────────────┐
                      │                 │                 │
                      ▼                 ▼                 ▼
         ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
         │                 │  │                 │  │                 │
         │  Dashboard      │  │  Report         │  │  Analyses       │
         │                 │  │                 │  │                 │
         └─────────────────┘  └─────────────────┘  └─────────────────┘
```

## 3. Implementatiedetails

### 3.1 State Management

De component gebruikt React's useState en useEffect hooks voor state management:

```jsx
// Data state
const [topicsByPhase, setTopicsByPhase] = useState({});
const [awarenessDistribution, setAwarenessDistribution] = useState([]);
const [contentRecommendations, setContentRecommendations] = useState({});
const [trendingTopics, setTrendingTopics] = useState([]);

// UI state
const [activeView, setActiveView] = useState('dashboard');
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'info'
});

// Filter state
const [dataSource, setDataSource] = useState('all');
const [dateRange, setDateRange] = useState('last30days');
const [startDate, setStartDate] = useState(() => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
});
const [endDate, setEndDate] = useState(() => {
  return new Date().toISOString().split('T')[0];
});
```

### 3.2 API Integratie

De component haalt data op van de topicAwarenessService:

```jsx
const fetchData = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const [
      topicsData,
      distributionData,
      recommendationsData,
      trendingData
    ] = await Promise.all([
      fetchTopicsByPhase({ dataSource, startDate, endDate }),
      fetchAwarenessDistribution({ dataSource, startDate, endDate }),
      fetchContentRecommendations({ dataSource, startDate, endDate }),
      fetchTrendingTopics({ dataSource, startDate, endDate })
    ]);
    
    setTopicsByPhase(topicsData);
    setAwarenessDistribution(distributionData);
    setContentRecommendations(recommendationsData);
    setTrendingTopics(trendingData);
  } catch (err) {
    setError(err);
    setSnackbar({
      open: true,
      message: `Er is een fout opgetreden bij het ophalen van de data: ${err.message}`,
      severity: 'error'
    });
  } finally {
    setIsLoading(false);
  }
}, [dataSource, startDate, endDate]);
```

### 3.3 View Switching

De component implementeert view switching tussen dashboard en rapport views:

```jsx
const handleViewChange = (view) => {
  setActiveView(view);
};

// In de render functie
{activeView === 'dashboard' && (
  <TopicAwarenessDashboard 
    topicsByPhase={topicsByPhase}
    awarenessDistribution={awarenessDistribution}
    contentRecommendations={contentRecommendations}
    trendingTopics={trendingTopics}
    isLoading={isLoading}
  />
)}

{activeView === 'report' && (
  <TopicAwarenessReport 
    topicsByPhase={topicsByPhase}
    awarenessDistribution={awarenessDistribution}
    contentRecommendations={contentRecommendations}
    trendingTopics={trendingTopics}
    projectName={projectName}
    isLoading={isLoading}
  />
)}
```

### 3.4 Filter Handlers

De component implementeert handlers voor het filteren van data:

```jsx
const handleDataSourceChange = (source) => {
  setDataSource(source);
};

const handleDateRangeChange = (range, start, end) => {
  setDateRange(range);
  if (start && end) {
    setStartDate(start);
    setEndDate(end);
  }
};
```

### 3.5 Export en Share Handlers

De component implementeert handlers voor het exporteren en delen van data:

```jsx
// Export handlers
const handleExportStart = () => {
  setSnackbar({
    open: true,
    message: 'Export gestart...',
    severity: 'info'
  });
};

const handleExportComplete = (result) => {
  setSnackbar({
    open: true,
    message: `Dashboard succesvol geëxporteerd als ${result.format}`,
    severity: 'success'
  });
};

const handleExportError = (error) => {
  setSnackbar({
    open: true,
    message: `Fout bij exporteren: ${error.message || 'Onbekende fout'}`,
    severity: 'error'
  });
};

// Share handlers
const handleShareStart = () => {
  setSnackbar({
    open: true,
    message: 'Inzichten delen gestart...',
    severity: 'info'
  });
};

const handleShareComplete = (result) => {
  setSnackbar({
    open: true,
    message: `Inzichten succesvol gedeeld via ${result.method}`,
    severity: 'success'
  });
};

const handleShareError = (error) => {
  setSnackbar({
    open: true,
    message: `Fout bij delen: ${error.message || 'Onbekende fout'}`,
    severity: 'error'
  });
};
```

## 4. Performance Optimalisaties

### 4.1 Memoization

De component gebruikt useMemo en useCallback hooks voor het optimaliseren van zware berekeningen en functies:

```jsx
const fetchData = useCallback(async () => {
  // Implementatie
}, [dataSource, startDate, endDate]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 4.2 Debouncing

De component implementeert debouncing voor filter wijzigingen om te voorkomen dat er te veel API calls worden gedaan:

```jsx
useEffect(() => {
  const debounceTimer = setTimeout(() => {
    fetchData();
  }, 500);
  
  return () => clearTimeout(debounceTimer);
}, [dataSource, startDate, endDate, fetchData]);
```

## 5. Toegankelijkheid

### 5.1 ARIA Attributen

De component implementeert ARIA attributen voor toegankelijkheid:

```jsx
<Box role="tabpanel" aria-labelledby={`tab-${activeView}`}>
  {/* Content */}
</Box>

<CircularProgress aria-label="Loading data" />

<Snackbar
  open={snackbar.open}
  autoHideDuration={6000}
  onClose={handleSnackbarClose}
  aria-live="polite"
>
  {/* Content */}
</Snackbar>
```

### 5.2 Keyboard Navigation

De component ondersteunt toetsenbordnavigatie:

```jsx
<Tabs
  value={activeView}
  onChange={(e, newValue) => handleViewChange(newValue)}
  aria-label="Topic awareness views"
>
  <Tab
    value="dashboard"
    label="Dashboard"
    id="tab-dashboard"
    aria-controls="tabpanel-dashboard"
  />
  <Tab
    value="report"
    label="Rapport"
    id="tab-report"
    aria-controls="tabpanel-report"
  />
</Tabs>
```

## 6. Error Handling

De component implementeert error handling:

```jsx
try {
  // API calls
} catch (err) {
  setError(err);
  setSnackbar({
    open: true,
    message: `Er is een fout opgetreden bij het ophalen van de data: ${err.message}`,
    severity: 'error'
  });
} finally {
  setIsLoading(false);
}
```

## 7. Uitbreidbaarheid

De component is ontworpen om gemakkelijk te worden uitgebreid met nieuwe functionaliteit:

- Nieuwe views kunnen worden toegevoegd door de activeView state uit te breiden
- Nieuwe filters kunnen worden toegevoegd door nieuwe state variabelen toe te voegen
- Nieuwe data kan worden opgehaald door nieuwe API calls toe te voegen aan de fetchData functie

## 8. Testen

De component wordt getest met Jest en React Testing Library:

```jsx
describe('TopicAwarenessController', () => {
  test('rendert de component zonder errors', async () => {
    // Test implementatie
  });
  
  test('haalt alle benodigde data op bij initialisatie', async () => {
    // Test implementatie
  });
  
  test('schakelt tussen dashboard en rapport views', async () => {
    // Test implementatie
  });
  
  // Meer tests
});
```

## 9. Afhankelijkheden

De component heeft de volgende afhankelijkheden:

- React (useState, useEffect, useCallback, useMemo, useRef)
- Material UI (Box, Paper, Tabs, Tab, CircularProgress, Snackbar, Alert, etc.)
- topicAwarenessService (fetchTopicsByPhase, fetchAwarenessDistribution, etc.)
- TopicAwarenessDashboard
- TopicAwarenessReport
- DataSourceSelector
- DateRangePicker
- DashboardExport
- ShareInsights

## 10. Toekomstige Verbeteringen

De volgende verbeteringen kunnen worden overwogen voor toekomstige versies:

1. Integratie met de nieuwe analysecomponenten (SentimentAnalysis, TrendAnalysis)
2. Implementatie van een state management bibliotheek zoals Redux of Context API
3. Implementatie van een router voor deep linking naar specifieke views
4. Implementatie van een caching mechanisme voor API responses
5. Implementatie van een offline modus met lokale opslag van data
