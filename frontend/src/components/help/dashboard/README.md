# Help Metrics Dashboard

Het Help Metrics Dashboard biedt een uitgebreid overzicht van alle help-gerelateerde interacties en feedback binnen de MarketPulse AI applicatie. Dit dashboard stelt beheerders in staat om het gebruik van het helpsysteem te analyseren en te optimaliseren.

## Functionaliteiten

### 1. Metrics Overzicht
- **KPI Samenvatting**: Toont belangrijke prestatie-indicatoren zoals totaal aantal interacties, feedback ratio, percentage positieve feedback en gemiddelde gebruikerstevredenheid.
- **Interacties per Type**: Visualiseert de verdeling van interacties per type (klikken, hover, bekijken) in een donutgrafiek.
- **Interacties per Pagina**: Toont de verdeling van interacties per pagina in een staafdiagram.

### 2. Feedback Analyse
- **Feedback per Help Item**: Gedetailleerde tabel met feedback per help item, inclusief positieve/negatieve ratio.
- **Feedback per Gebruikersrol**: Analyse van feedback gegroepeerd per gebruikersrol.
- **Feedback per Ervaringsniveau**: Analyse van feedback gegroepeerd per ervaringsniveau van gebruikers.

### 3. Trends en Gebruikerservaring
- **Interacties Trend**: Lijndiagram dat de trend van interacties over tijd weergeeft.
- **Gebruikerservaring Feedback**: Gedetailleerde tabel met feedback over de algehele gebruikerservaring.

### 4. Exportfunctionaliteit
- **PDF Export**: Exporteer dashboard gegevens naar een PDF document.
- **Excel Export**: Exporteer dashboard gegevens naar een Excel spreadsheet.

## Gebruik

### Toegang tot het Dashboard
Het Help Metrics Dashboard is alleen toegankelijk voor gebruikers met beheerdersrechten. Navigeer naar de Admin sectie en selecteer "Help Metrics Dashboard" in het menu.

### Filteren van Gegevens
- **Datumbereik**: Selecteer een specifiek datumbereik om de gegevens te filteren.
- **Gebruikersrollen**: Filter op specifieke gebruikersrollen.
- **Ervaringsniveaus**: Filter op specifieke ervaringsniveaus.

### Exporteren van Gegevens
1. Klik op de "Exporteren" knop in de rechterbovenhoek van het dashboard.
2. Kies tussen PDF of Excel export.
3. Configureer de export opties:
   - Selecteer welke secties moeten worden opgenomen
   - Kies of grafieken, ruwe data en samenvattingen moeten worden opgenomen
   - Voor PDF: kies tussen staande of liggende oriëntatie
4. Klik op "Exporteren" om het bestand te genereren en te downloaden.

## Technische Implementatie

### Componenten
- **HelpMetricsDashboard.jsx**: Hoofdcomponent die alle subcomponenten integreert.
- **MetricsSummary.jsx**: Toont de KPI samenvatting.
- **InteractionsByTypeChart.jsx**: Visualiseert interacties per type.
- **InteractionsByPageChart.jsx**: Visualiseert interacties per pagina.
- **FeedbackTable.jsx**: Toont feedback tabellen.
- **InteractionsTrendChart.jsx**: Visualiseert de trend van interacties.
- **UserExperienceFeedbackTable.jsx**: Toont gebruikerservaring feedback.
- **ExportButton.jsx**: Biedt exportfunctionaliteit.

### Services
- **HelpMetricsService.js**: Service voor het ophalen en analyseren van help metrics.
- **HelpInteractionService.js**: Service voor het registreren van help interacties en feedback.

### Utilities
- **cacheUtils.js**: Utilities voor het cachen van data.
- **exportUtils.js**: Utilities voor het exporteren van data naar PDF en Excel.

## Prestatie-optimalisaties

### Caching
Het dashboard maakt gebruik van caching om de prestaties te verbeteren en de belasting van de database te verminderen. Metrics worden gecached met een time-to-live (TTL) van 5 minuten.

### Lazy Loading
Alle dashboard componenten worden lazy loaded om de initiële laadtijd te verbeteren. Dit betekent dat componenten alleen worden geladen wanneer ze nodig zijn.

## Toekomstige Verbeteringen
- Implementatie van real-time updates via WebSockets.
- Uitbreiding van exportopties met meer aanpassingsmogelijkheden.
- Toevoegen van meer geavanceerde visualisaties en analyses.
