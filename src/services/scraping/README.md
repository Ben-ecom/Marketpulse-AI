# MarketPulse AI - Scraping Service

Deze module bevat de scraping service voor MarketPulse AI, die verantwoordelijk is voor het verzamelen van gegevens van verschillende platforms zoals Amazon, Instagram, TikTok en Trustpilot. De service maakt gebruik van de Decodo Scraping API voor het uitvoeren van scraping taken.

## Architectuur

De scraping service bestaat uit de volgende componenten:

1. **Decodo API Wrapper**: Een wrapper rond de Decodo Scraping API die API requests, error handling, en rate limiting afhandelt.
2. **Job Queue Service**: Een service voor het beheren van scraping taken, inclusief het plannen, uitvoeren en bijhouden van jobs.
3. **Platform-specifieke Scrapers**: Implementaties voor verschillende platforms (Amazon, Instagram, etc.) met specifieke logica voor het extraheren van gegevens.

## Installatie

Zorg ervoor dat je de benodigde environment variables hebt ingesteld in je `.env` bestand:

```
DECODO_API_KEY=your_api_key
DECODO_API_BASE_URL=https://api.decodo.io/v1
```

## Gebruik

### Initialisatie

```javascript
import { ScrapingService } from './services/scraping';

// Start de job queue processor
ScrapingService.startJobProcessor();
```

### Een scraping job aanmaken

```javascript
// Amazon product scraping
const productUrls = [
  'https://www.amazon.nl/dp/B08H93ZRK9',
  'https://www.amazon.nl/dp/B08H95QWHH'
];

const job = await ScrapingService.createJob('amazon', 'project-123', 'product', productUrls, {
  priority: 'high',
  // Extra opties...
});

console.log(`Job aangemaakt: ${job.id}`);
```

### Jobs ophalen en beheren

```javascript
// Een specifieke job ophalen
const job = await ScrapingService.getJob('job-123');

// Jobs voor een project ophalen
const jobs = await ScrapingService.getJobsByProject('project-123', {
  status: 'pending',
  platform: 'amazon'
});

// Een job annuleren
await ScrapingService.cancelJob('job-123');

// Resultaten van een job ophalen
const results = await ScrapingService.getJobResults('job-123');

// Statistieken voor een project ophalen
const stats = await ScrapingService.getProjectStats('project-123');
```

### Direct gebruik van de Decodo API

```javascript
import { getDecodoApiClient } from './services/scraping';

const decodoClient = getDecodoApiClient();

// Een URL scrapen
const result = await decodoClient.scrape('https://example.com', {
  wait_for: '#content',
  device_type: 'desktop',
  geo: 'nl'
});

// Meerdere URLs in batch scrapen
const batchResults = await decodoClient.batchScrape([
  { url: 'https://example.com', options: { wait_for: '#content' } },
  { url: 'https://example.org', options: { wait_for: '#main' } }
]);
```

## Platform-specifieke Scrapers

### Amazon

De Amazon scraper ondersteunt de volgende job types:

1. **Product**: Scrapen van productpagina's
2. **Search**: Scrapen van zoekresultaten
3. **Review**: Scrapen van productreviews

Voorbeeld:

```javascript
import { scrapers } from './services/scraping';

const amazonScraper = scrapers.amazon;

// Product scraping job aanmaken
const productJob = await amazonScraper.createProductScrapeJob(
  'project-123',
  ['https://www.amazon.nl/dp/B08H93ZRK9'],
  { priority: 'high' }
);

// Zoekresultaten scraping job aanmaken
const searchJob = await amazonScraper.createSearchScrapeJob(
  'project-123',
  ['https://www.amazon.nl/s?k=smartphone'],
  { priority: 'medium' }
);

// Reviews scraping job aanmaken
const reviewJob = await amazonScraper.createReviewScrapeJob(
  'project-123',
  ['https://www.amazon.nl/product-reviews/B08H93ZRK9'],
  { priority: 'low' }
);
```

## Job Queue

De job queue service beheert de scraping taken en zorgt ervoor dat ze op een gecontroleerde manier worden uitgevoerd. De service ondersteunt:

- Prioriteiten (hoog, medium, laag)
- Concurrency limiting (maximaal aantal gelijktijdige jobs)
- Automatische retries bij fouten
- Status tracking (pending, running, completed, failed, cancelled)

## Testen

Je kunt de Decodo API wrapper testen met het test script:

```bash
node src/services/scraping/test-decodo-api.js
```

## Foutafhandeling

De scraping service bevat uitgebreide foutafhandeling:

- Automatische retries voor tijdelijke fouten (netwerkproblemen, server errors)
- Rate limiting compliance om API limieten te respecteren
- Gedetailleerde logging van alle API interacties
- Job status tracking voor monitoring en debugging

## Uitbreiden

### Nieuwe platforms toevoegen

Om een nieuw platform toe te voegen:

1. Maak een nieuw bestand in de `platforms` directory (bijv. `instagram.js`)
2. Implementeer de platform-specifieke scraper klasse
3. Voeg de scraper toe aan het `platforms/index.js` bestand

Voorbeeld:

```javascript
// platforms/instagram.js
export class InstagramScraper {
  // Implementatie...
}

// platforms/index.js
import { InstagramScraper } from './instagram';

export const scrapers = {
  amazon: new AmazonScraper(),
  instagram: new InstagramScraper()
};
```
