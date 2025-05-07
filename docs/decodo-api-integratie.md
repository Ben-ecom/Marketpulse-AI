# Decodo API Integratie voor MarketPulse AI

Deze documentatie beschrijft de integratie van de Decodo Scraping API in het MarketPulse AI platform. De integratie maakt het mogelijk om data te verzamelen van verschillende platforms zoals Reddit, Amazon, Instagram, TikTok en Trustpilot.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Architectuur](#architectuur)
3. [Componenten](#componenten)
4. [API Endpoints](#api-endpoints)
5. [Edge Functions](#edge-functions)
6. [Gebruik](#gebruik)
7. [Testen](#testen)
8. [Bekende Problemen](#bekende-problemen)
9. [Toekomstige Verbeteringen](#toekomstige-verbeteringen)

## Overzicht

De Decodo API integratie vervangt de eerdere Puppeteer-gebaseerde scraping oplossing. De Decodo API biedt een betrouwbare en schaalbare manier om data te verzamelen van verschillende platforms, met ingebouwde proxy rotatie en anti-detectie maatregelen.

Belangrijkste voordelen:
- Geen eigen infrastructuur nodig voor scraping
- Ingebouwde proxy rotatie en anti-detectie
- Ondersteuning voor meerdere platforms
- Synchrone en asynchrone verzoeken
- Batch verwerking voor efficiëntie

## Architectuur

De integratie bestaat uit de volgende componenten:

1. **Frontend Services**:
   - `DecodoService.js`: Directe communicatie met de Decodo API
   - `EdgeFunctionsService.js`: Communicatie met Supabase Edge Functions

2. **Edge Functions**:
   - `decodo-scraper`: Verwerkt scraping verzoeken en slaat resultaten op
   - `generate-recommendations`: Genereert aanbevelingen op basis van verzamelde data

3. **Database Tabellen**:
   - `scrape_jobs`: Houdt scraping taken bij
   - `scrape_results`: Slaat scraping resultaten op
   - `recommendations`: Slaat aanbevelingen op
   - `marketing_strategies`: Bevat niche-specifieke marketingstrategieën

4. **UI Componenten**:
   - `DecodoTester.jsx`: Interface voor het testen van de Decodo API

## Componenten

### DecodoService

De `DecodoService` biedt directe toegang tot de Decodo API. Het ondersteunt:

- Synchrone scraping verzoeken (`scrapeSync`)
- Asynchrone scraping verzoeken (`scrapeAsync`)
- Batch scraping verzoeken (`scrapeBatch`)
- Ophalen van resultaten van asynchrone taken (`getTaskResult`)
- Ophalen van resultaten van batch taken (`getBatchResult`)

### EdgeFunctionsService

De `EdgeFunctionsService` communiceert met de Supabase Edge Functions. Het biedt dezelfde functionaliteit als de `DecodoService`, maar voegt de mogelijkheid toe om resultaten direct op te slaan in de database.

### DecodoTester

De `DecodoTester` component biedt een gebruikersinterface voor het testen van de Decodo API. Het ondersteunt:

- Selectie van platform (Reddit, Amazon, Instagram, TikTok, Trustpilot)
- Keuze tussen synchrone, asynchrone en batch verzoeken
- Configuratie van geavanceerde opties (headless mode, geo-targeting, device type)
- Keuze tussen directe API of Edge Function
- Optie om resultaten op te slaan in de database

## API Endpoints

De Decodo API biedt de volgende endpoints:

- **Synchronous**: `POST https://scraper-api.decodo.com/v2/scrape`
- **Asynchronous**: `POST https://scraper-api.decodo.com/v2/task`
- **Batch Requests**: `POST https://scraper-api.decodo.com/v2/task/batch`
- **Task Result**: `GET https://scraper-api.decodo.com/v2/task/{taskId}`
- **Batch Result**: `GET https://scraper-api.decodo.com/v2/task/batch/{batchId}`

## Edge Functions

### decodo-scraper

De `decodo-scraper` Edge Function verwerkt scraping verzoeken en slaat resultaten op in de database. Het ondersteunt de volgende acties:

- `scrape_sync`: Voert een synchrone scraping verzoek uit
- `scrape_async`: Voert een asynchrone scraping verzoek uit
- `scrape_batch`: Voert een batch scraping verzoek uit
- `get_task_result`: Haalt resultaten op van een asynchrone taak
- `get_batch_result`: Haalt resultaten op van een batch taak
- `save_results`: Slaat resultaten direct op in de database

### generate-recommendations

De `generate-recommendations` Edge Function genereert aanbevelingen op basis van verzamelde data. Het ondersteunt de volgende acties:

- `generate_recommendations`: Genereert platform-specifieke aanbevelingen
- `generate_awareness_recommendations`: Genereert aanbevelingen voor de 5 awareness fasen van Eugene Schwartz

## Gebruik

### Directe API Gebruik

```javascript
import { decodoService } from '../services/DecodoService';

// Synchrone scraping
const result = await decodoService.scrapeSync(
  'https://www.reddit.com/r/DutchFIRE/',
  'reddit',
  { headless: 'html', geo: 'nl' }
);

// Asynchrone scraping
const task = await decodoService.scrapeAsync(
  'https://www.amazon.nl/dp/B08H93ZRK9',
  'amazon'
);
const taskId = task.task_id;

// Ophalen van resultaten
const taskResult = await decodoService.getTaskResult(taskId);
```

### Edge Function Gebruik

```javascript
import { edgeFunctionsService } from '../services/EdgeFunctionsService';

// Synchrone scraping met opslaan in database
const result = await edgeFunctionsService.scrapeSynchronous(
  'https://www.reddit.com/r/DutchFIRE/',
  'reddit',
  'project-123',
  'post'
);

// Genereren van aanbevelingen
const recommendations = await edgeFunctionsService.generateRecommendations('project-123');
```

## Testen

De integratie kan worden getest met de `DecodoTester` component, beschikbaar via de admin interface op `/admin/decodo-tester`. Deze component biedt een gebruiksvriendelijke interface voor het testen van alle functionaliteit.

### Stappen voor Testen

1. Navigeer naar `/admin/decodo-tester`
2. Selecteer het gewenste platform (Reddit, Amazon, etc.)
3. Kies het type verzoek (Synchroon, Asynchroon, Batch)
4. Voer een URL in om te scrapen
5. Optioneel: Configureer geavanceerde opties
6. Kies tussen directe API of Edge Function
7. Klik op "Test uitvoeren"
8. Bekijk de resultaten

## Bekende Problemen

- De Edge Functions zijn nog niet gedeployed naar Supabase, waardoor de Edge Function optie in de DecodoTester nog niet werkt.
- TypeScript linting waarschuwingen in de Edge Function code moeten worden opgelost.
- Er is momenteel geen rate limiting of quota management geïmplementeerd.

## Toekomstige Verbeteringen

- Implementeren van rate limiting en quota management
- Toevoegen van caching voor veelgebruikte verzoeken
- Uitbreiden van de analyse mogelijkheden voor verzamelde data
- Integreren met de awareness fasen functionaliteit
- Toevoegen van automatische scheduling voor periodieke scraping
- Implementeren van data transformatie pipelines voor specifieke platforms
