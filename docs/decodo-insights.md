# Decodo Inzichten Functionaliteit

Deze documentatie beschrijft de inzichtenfunctionaliteit in MarketPulse AI, waarmee gebruikers automatisch inzichten kunnen genereren uit de verzamelde data van verschillende platforms.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Componenten](#componenten)
3. [Database Schema](#database-schema)
4. [Edge Functions](#edge-functions)
5. [Frontend Integratie](#frontend-integratie)
6. [Gebruik](#gebruik)
7. [Troubleshooting](#troubleshooting)

## Overzicht

De inzichtenfunctionaliteit stelt gebruikers in staat om:
- Trends te identificeren in de verzamelde data
- Sentiment analyse te bekijken per platform
- Inzichten te filteren op basis van platform, type en periode
- Geautomatiseerde aanbevelingen te genereren op basis van de inzichten

## Componenten

De functionaliteit bestaat uit de volgende componenten:

1. **Database Tabel**: `insights` - Slaat alle gegenereerde inzichten op
2. **Edge Function**: `generate-insights` - Analyseert de data en genereert inzichten
3. **Frontend Componenten**:
   - `DecodoInsightsDashboard` - Hoofdcomponent voor het visualiseren van inzichten
   - `TrendInsights` - Visualiseert trend inzichten
   - `SentimentInsights` - Visualiseert sentiment inzichten

## Database Schema

De `insights` tabel heeft de volgende structuur:

```sql
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'trend', 'sentiment', 'keyword', 'comparison', 'recommendation'
  platform TEXT, -- NULL voor platform-overstijgende inzichten
  content_type TEXT, -- NULL voor content-type-overstijgende inzichten
  data JSONB NOT NULL, -- Geaggregeerde data
  description TEXT, -- Beschrijving van het inzicht
  period_start TIMESTAMP WITH TIME ZONE, -- Begin van de periode
  period_end TIMESTAMP WITH TIME ZONE, -- Einde van de periode
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Edge Functions

### generate-insights

Deze Edge Function is verantwoordelijk voor het analyseren van de scraping resultaten en het genereren van inzichten. Het:

1. Haalt scraping resultaten op voor een specifiek project en periode
2. Analyseert de data om trends te identificeren
3. Voert sentiment analyse uit op de resultaten
4. Genereert beschrijvingen van de inzichten
5. Slaat de inzichten op in de `insights` tabel

De Edge Function kan op twee manieren worden aangeroepen:
- Via de UI door op de "Genereer Inzichten" knop te klikken
- Via een API call met de volgende parameters:
  - `project_id`: ID van het project
  - `period_start`: Begin van de periode (optioneel)
  - `period_end`: Einde van de periode (optioneel)
  - `platforms`: Array van platforms om te analyseren (optioneel)
  - `insight_types`: Array van inzicht types om te genereren (optioneel)

## Frontend Integratie

De inzichtenfunctionaliteit is geïntegreerd in het DecodoResultsDashboard via een nieuwe tab "Inzichten". Deze tab bevat het DecodoInsightsDashboard component, dat:

1. Inzichten ophaalt uit de database
2. Filters biedt voor platform, inzicht type en periode
3. Visualisaties toont voor verschillende types inzichten
4. Functionaliteit biedt om nieuwe inzichten te genereren

## Gebruik

### Inzichten Genereren

1. Ga naar het DecodoResultsDashboard
2. Klik op de "Inzichten" tab
3. Klik op "Genereer Inzichten"
4. Wacht tot de inzichten zijn gegenereerd
5. Bekijk de gegenereerde inzichten

### Inzichten Filteren

1. Klik op "Filters Tonen"
2. Selecteer het gewenste platform, inzicht type en/of periode
3. Klik op "Filters Toepassen"
4. De inzichten worden gefilterd op basis van de geselecteerde criteria

### Trend Inzichten Bekijken

1. Klik op de "Trends" tab in het inzichtendashboard
2. Bekijk de trend grafieken en beschrijvingen
3. Vergelijk trends tussen verschillende platforms

### Sentiment Inzichten Bekijken

1. Klik op de "Sentiment" tab in het inzichtendashboard
2. Bekijk de sentiment distributies en beschrijvingen
3. Vergelijk sentiment tussen verschillende platforms

## Troubleshooting

### Geen Inzichten Beschikbaar

Als er geen inzichten beschikbaar zijn, kan dit de volgende oorzaken hebben:
1. Er zijn geen scraping resultaten beschikbaar voor de geselecteerde periode
2. De geselecteerde filters zijn te restrictief
3. Er is een fout opgetreden bij het genereren van de inzichten

Oplossingen:
1. Zorg ervoor dat er scraping resultaten beschikbaar zijn
2. Probeer de filters te verruimen
3. Controleer de browser console voor eventuele foutmeldingen

### Foutmeldingen

Als er een foutmelding verschijnt bij het genereren van inzichten, kan dit de volgende oorzaken hebben:
1. De Edge Function is niet beschikbaar
2. Er is een probleem met de database verbinding
3. Er is een fout in de analyse logica

Oplossingen:
1. Controleer of de Edge Function correct is gedeployed
2. Controleer de database verbinding
3. Controleer de logs van de Edge Function voor meer details over de fout
