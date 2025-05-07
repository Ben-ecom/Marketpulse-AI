# Periodieke Scraping Functionaliteit

Deze documentatie beschrijft de periodieke scraping functionaliteit in MarketPulse AI, waarmee gebruikers automatisch data kunnen verzamelen van verschillende platforms volgens een ingesteld schema.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Componenten](#componenten)
3. [Database Schema](#database-schema)
4. [Edge Functions](#edge-functions)
5. [Frontend Integratie](#frontend-integratie)
6. [Cron Job Configuratie](#cron-job-configuratie)
7. [Gebruik](#gebruik)
8. [Troubleshooting](#troubleshooting)

## Overzicht

De periodieke scraping functionaliteit stelt gebruikers in staat om:
- Scraping taken in te plannen op dagelijkse, wekelijkse of maandelijkse basis
- De status van geplande taken te bekijken
- Taken handmatig uit te voeren, te pauzeren of te hervatten
- De resultaten automatisch te laten opslaan in de database

## Componenten

De functionaliteit bestaat uit de volgende componenten:

1. **Database Tabel**: `scheduled_scrape_jobs` - Slaat alle geplande scraping taken op
2. **Edge Function**: `scheduled-scraper` - Voert de geplande taken uit
3. **Frontend Component**: `DecodoScheduler` - UI voor het beheren van geplande taken
4. **Cron Job Script**: `cron-scheduled-scraper.js` - Script voor het periodiek aanroepen van de Edge Function

## Database Schema

De `scheduled_scrape_jobs` tabel heeft de volgende structuur:

```sql
CREATE TABLE scheduled_scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  url TEXT NOT NULL,
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  day_of_week INTEGER, -- 0-6, waarbij 0 = zondag (voor wekelijkse taken)
  day_of_month INTEGER, -- 1-31 (voor maandelijkse taken)
  time_of_day TIME NOT NULL, -- Tijd van de dag in 24-uurs formaat
  params JSONB, -- Aangepaste parameters voor de scraping taak
  active BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Edge Functions

### scheduled-scraper

Deze Edge Function is verantwoordelijk voor het uitvoeren van geplande scraping taken. Het:

1. Haalt alle taken op die moeten worden uitgevoerd (waar `next_run <= nu` en `active = true`)
2. Voert elke taak uit door de Decodo API aan te roepen
3. Slaat de resultaten op in de `scrape_jobs` en `scrape_results` tabellen
4. Werkt de `last_run` en `next_run` velden bij

De Edge Function kan op twee manieren worden aangeroepen:
- Via een Cron Job voor automatische uitvoering
- Handmatig vanuit de UI voor het direct uitvoeren van een specifieke taak

## Frontend Integratie

De periodieke scraping functionaliteit is geïntegreerd in het DecodoResultsDashboard via een nieuwe tab "Periodieke Scraping". Deze tab bevat het DecodoScheduler component, dat:

1. Een lijst toont van bestaande geplande taken
2. Functionaliteit biedt om nieuwe taken aan te maken
3. Bestaande taken kan bewerken of verwijderen
4. De status van taken kan bekijken
5. Taken handmatig kan uitvoeren

## Cron Job Configuratie

Om de geplande taken automatisch uit te voeren, moet een Cron Job worden ingesteld die de `scheduled-scraper` Edge Function periodiek aanroept. Dit kan worden gedaan met het `cron-scheduled-scraper.js` script.

### Render.com Configuratie

1. Ga naar het Render Dashboard
2. Klik op "New" en selecteer "Cron Job"
3. Geef de Cron Job een naam (bijv. "MarketPulse Scheduled Scraper")
4. Stel het commando in op: `node scripts/cron-scheduled-scraper.js`
5. Stel het schema in op: `*/15 * * * *` (elke 15 minuten)
6. Voeg de volgende omgevingsvariabelen toe:
   - `SUPABASE_URL`: De URL van je Supabase project
   - `SUPABASE_ANON_KEY`: De anonieme API key van je Supabase project
7. Klik op "Create Cron Job"

## Gebruik

### Taak Aanmaken

1. Ga naar het DecodoResultsDashboard
2. Klik op de "Periodieke Scraping" tab
3. Klik op "Nieuwe Taak"
4. Vul de volgende velden in:
   - Platform: Het platform om te scrapen (Reddit, Amazon, etc.)
   - Content Type: Het type content (page, post, etc.)
   - URL: De URL om te scrapen
   - Frequentie: Dagelijks, wekelijks of maandelijks
   - Dag van de Week/Maand: Alleen voor wekelijkse/maandelijkse taken
   - Tijd: De tijd van de dag om de taak uit te voeren
5. Klik op "Opslaan"

### Taak Bewerken

1. Klik op het potlood icoon naast de taak
2. Wijzig de gewenste velden
3. Klik op "Opslaan"

### Taak Handmatig Uitvoeren

1. Klik op het afspeelknop icoon naast de taak
2. De taak wordt direct uitgevoerd en de resultaten worden opgeslagen

### Taak Pauzeren/Hervatten

1. Klik op het pauze/afspeel icoon naast de taak
2. De taak wordt gepauzeerd of hervat

### Taak Verwijderen

1. Klik op het prullenbak icoon naast de taak
2. De taak wordt permanent verwijderd

## Troubleshooting

### Taak wordt niet uitgevoerd

1. Controleer of de taak actief is
2. Controleer of de `next_run` tijd correct is ingesteld
3. Controleer of de Cron Job correct is geconfigureerd en draait
4. Controleer de logs van de Edge Function voor eventuele fouten

### Foutmeldingen

Als er een fout optreedt tijdens het uitvoeren van een taak, wordt deze gelogd in de `params` kolom van de taak in de `scheduled_scrape_jobs` tabel. De volgende velden worden toegevoegd:

- `last_error`: De foutmelding
- `last_error_time`: De tijd waarop de fout is opgetreden

### Edge Function Logs

Om de logs van de Edge Function te bekijken:

1. Ga naar het Supabase Dashboard
2. Ga naar "Edge Functions"
3. Selecteer de "scheduled-scraper" functie
4. Bekijk de logs
