# Trustpilot Scraping Module

Deze module bevat de scraper voor Trustpilot content in MarketPulse AI. De scraper maakt gebruik van de Decodo API om Trustpilot pagina's te scrapen en bedrijfsreviews, ratings en andere gegevens te extraheren.

## Functionaliteit

De Trustpilot scraper biedt de volgende functionaliteit:

1. **Business Scraping**: Verzamelen van bedrijfsgegevens, ratings en reviews distributie
2. **Reviews Scraping**: Verzamelen van klantreviews, ratings en bedrijfsreacties
3. **Gefilterde Reviews**: Scrapen van reviews gefilterd op sterren, taal en tijdsperiode
4. **Paginering**: Automatisch genereren van URLs voor paginering om meer reviews te laden
5. **Multi-business Ondersteuning**: Verzamelen van reviews voor meerdere bedrijven in één job
6. **HTML Extractie**: Extraheren van gegevens uit HTML met CSS selectors

## Gebruik

### Initialisatie

```javascript
import { getTrustpilotScraper } from './platforms/trustpilot';

const trustpilotScraper = getTrustpilotScraper();
```

### Business Scraping

```javascript
// Maak een business scrape job aan
const businessUrls = [
  'https://www.trustpilot.com/review/example.com',
  'https://www.trustpilot.com/review/another-example.com'
];

const job = await trustpilotScraper.createBusinessScrapeJob('project-123', businessUrls, {
  priority: 'high',
  // Extra opties...
});

console.log(`Business scrape job aangemaakt: ${job.id}`);
```

### Reviews Scraping

```javascript
// Maak een reviews scrape job aan
const reviewsUrls = [
  'https://www.trustpilot.com/review/example.com/reviews',
  'https://www.trustpilot.com/review/another-example.com/reviews'
];

const job = await trustpilotScraper.createReviewsScrapeJob('project-123', reviewsUrls, {
  priority: 'medium',
  // Extra opties...
});

console.log(`Reviews scrape job aangemaakt: ${job.id}`);
```

### Gefilterde Reviews Scraping

```javascript
// Maak een gefilterde reviews scrape job aan
const businessDomain = 'example.com';
const filters = {
  stars: 5, // 1-5 sterren
  languages: ['nl', 'en'], // Taalfilters
  timeperiod: 'last6months' // Tijdsperiode filter
};

const job = await trustpilotScraper.createFilteredReviewsScrapeJob('project-123', businessDomain, filters, {
  priority: 'high',
  // Extra opties...
});

console.log(`Gefilterde reviews scrape job aangemaakt: ${job.id}`);
```

### URL Generatie

```javascript
// Genereer review URLs met paginering
const reviewUrls = trustpilotScraper.generateReviewUrls(
  'example.com',  // Bedrijfsdomein
  3,              // Aantal pagina's
  {               // Optionele filters
    stars: 4,
    languages: ['nl'],
    timeperiod: 'last3months'
  }
);

// Genereer URLs voor meerdere bedrijven
const multiBusinessReviewUrls = trustpilotScraper.generateMultiBusinessReviewUrls(
  ['example.com', 'another-example.com', 'third-example.com'],  // Bedrijfsdomeinen
  2,                                                           // Aantal pagina's per bedrijf
  { stars: 5 }                                                 // Optionele filters
);
```

## Scrape Opties

De Trustpilot scraper ondersteunt de volgende opties voor het aanpassen van het scrape gedrag:

### Algemene Opties

- `wait_for`: CSS selector om op te wachten voordat de pagina als geladen wordt beschouwd
- `device_type`: Type apparaat (desktop, mobile, tablet)
- `javascript`: Of JavaScript moet worden uitgevoerd (true/false)
- `timeout`: Timeout in milliseconden
- `screenshot`: Of een screenshot moet worden gemaakt (true/false)
- `html`: Of de HTML response moet worden teruggegeven (true/false)

### Business Opties

```javascript
const businessOptions = {
  wait_for: '.business-unit-profile',
  device_type: 'desktop',
  javascript: true,
  timeout: 30000,
  screenshot: false,
  html: true,
  selectors: {
    businessName: '.multi-size-header__headline',
    businessRating: '.star-rating--medium',
    businessTotalReviews: '.typography_body-l__KUYFJ',
    businessCategories: '.categories-list a',
    businessAddress: '.address-info__details',
    businessWebsite: '.business-website-link',
    businessPhone: '.business-phone-number',
    businessDescription: '.business-description',
    reviewsDistribution: '.review-distribution',
    reviewsDistributionItem: '.review-distribution__item'
  }
};
```

### Reviews Opties

```javascript
const reviewsOptions = {
  wait_for: '.review-list',
  device_type: 'desktop',
  javascript: true,
  timeout: 30000,
  screenshot: false,
  html: true,
  selectors: {
    businessName: '.multi-size-header__headline',
    businessRating: '.star-rating--medium',
    reviewList: '.review-list',
    reviewItem: '.review',
    reviewTitle: '.link__header',
    reviewContent: '.review-content__text',
    reviewRating: '.star-rating--medium',
    reviewDate: '.review-content-header__dates',
    reviewAuthor: '.consumer-information__name',
    reviewLocation: '.consumer-information__location',
    reviewVerified: '.review-content-header__verification',
    businessReply: '.business-response',
    businessReplyContent: '.business-response__content',
    businessReplyDate: '.business-response__date',
    pagination: '.pagination-container'
  }
};
```

## Filter Opties

De Trustpilot scraper ondersteunt de volgende filter opties voor reviews:

### Sterrenfilter

- `stars`: Aantal sterren (1-5)

### Taalfilter

- `languages`: Array van taalcodes (bijv. ['nl', 'en', 'de'])

### Tijdsperiode Filter

- `timeperiod`: Tijdsperiode voor reviews (bijv. 'last6months', 'last3months', 'last1month', 'last1week')

## Resultaat Structuur

### Business Resultaat

```javascript
{
  business_domain: 'example.com',
  url: 'https://www.trustpilot.com/review/example.com',
  business: {
    name: 'Voorbeeld Bedrijf',
    domain: 'example.com',
    rating: 4.2,
    total_reviews: 1234,
    categories: ['E-commerce', 'Electronics'],
    address: '123 Voorbeeldstraat, 1234 AB Amsterdam, Nederland',
    website: 'https://www.example.com',
    phone: '+31 20 123 4567',
    description: 'Voorbeeld Bedrijf is een toonaangevende leverancier van elektronische producten.'
  },
  reviews_distribution: {
    five_star: { count: 950, percentage: 77 },
    four_star: { count: 150, percentage: 12 },
    three_star: { count: 75, percentage: 6 },
    two_star: { count: 35, percentage: 3 },
    one_star: { count: 24, percentage: 2 }
  },
  scraped_at: '2023-01-20T10:15:30Z'
}
```

### Reviews Resultaat

```javascript
{
  business_domain: 'example.com',
  business_name: 'Voorbeeld Bedrijf',
  business_rating: 4.2,
  url: 'https://www.trustpilot.com/review/example.com/reviews',
  reviews: [
    {
      id: 'review1',
      title: 'Uitstekende service',
      content: 'Ik ben zeer tevreden met de service van dit bedrijf. De levering was snel en het product is van hoge kwaliteit.',
      rating: 5,
      date: '2023-03-01T18:45:30Z',
      author: {
        name: 'Jan Jansen',
        location: 'Amsterdam, Nederland',
        reviews_count: 12
      },
      verified: true,
      business_reply: {
        content: 'Bedankt voor uw positieve feedback! We zijn blij dat u tevreden bent met onze service.',
        date: '2023-03-02T10:15:45Z'
      }
    },
    // Meer reviews...
  ],
  pagination: {
    current_page: 1,
    total_pages: 10,
    has_next: true,
    has_previous: false,
    next_url: 'https://www.trustpilot.com/review/example.com/reviews?page=2',
    previous_url: null
  },
  filters: {
    stars: 5,
    languages: ['nl', 'en'],
    timeperiod: 'last6months'
  },
  review_count: 3,
  scraped_at: '2023-01-20T10:15:30Z'
}
```

## Testen

Je kunt de Trustpilot scraper testen met het test script:

```bash
node src/services/scraping/test-trustpilot-scraper.js
```

Dit script test de volgende functionaliteit:

1. URL validatie
2. URL generatie
3. Business scraping
4. Reviews scraping
5. Gefilterde reviews scraping
6. Extractie functies

## Foutafhandeling

De Trustpilot scraper bevat uitgebreide foutafhandeling:

- Validatie van input parameters
- Controle van scrape resultaten
- Logging van fouten
- Integratie met de job queue voor retry mechanisme

## Implementatiedetails

De Trustpilot scraper is geïmplementeerd als een singleton class die de Decodo API client gebruikt voor het uitvoeren van scrape operaties. De scraper bevat mock implementaties voor de extractie functies, die in een productie-omgeving moeten worden vervangen door echte HTML parsing logica.

## Beperkingen

- Trustpilot heeft rate limiting en kan IP-adressen blokkeren bij te veel requests
- De HTML structuur kan regelmatig veranderen, waardoor selectors aangepast moeten worden
- Sommige reviews kunnen verborgen zijn of niet volledig geladen worden zonder JavaScript
- Trustpilot kan geo-restricties hebben voor bepaalde content

## Best Practices

1. **Rate Limiting**: Beperk het aantal requests per IP-adres om blokkering te voorkomen
2. **Proxy Rotatie**: Gebruik verschillende IP-adressen voor scraping om detectie te vermijden
3. **User-Agent Variatie**: Wissel verschillende user-agents af om natuurlijk gedrag te simuleren
4. **Incrementele Scraping**: Verzamel data incrementeel in plaats van alles in één keer
5. **Caching**: Sla resultaten op om dubbele requests te voorkomen
6. **Fout Tolerantie**: Implementeer robuuste foutafhandeling en retry mechanismen
7. **Respecteer Robots.txt**: Houd rekening met de robots.txt regels van de website
