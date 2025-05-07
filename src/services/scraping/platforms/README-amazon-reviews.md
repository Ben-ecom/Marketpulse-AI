# Amazon Reviews Scraper Module

Deze module bevat de scraper voor Amazon reviews in MarketPulse AI. De scraper maakt gebruik van de Decodo API om Amazon review pagina's te scrapen en reviews, ratings en andere gegevens te extraheren.

## Functionaliteit

De Amazon Reviews scraper biedt de volgende functionaliteit:

1. **Reviews Scraping**: Verzamelen van product reviews, ratings, verified purchase status en andere metadata
2. **Gefilterde Reviews**: Scrapen van reviews gefilterd op aantal sterren (1-5)
3. **Multi-product Reviews**: Verzamelen van reviews voor meerdere producten in één job
4. **Paginering**: Automatisch genereren van URLs voor paginering om meer reviews te laden
5. **Marketplace Ondersteuning**: Ondersteuning voor verschillende Amazon marketplaces (nl, de, com, etc.)
6. **HTML Extractie**: Extraheren van gegevens uit HTML met CSS selectors

## Gebruik

### Initialisatie

```javascript
import { getAmazonScraper } from './platforms/amazon';

const amazonScraper = getAmazonScraper();
```

### Reviews Scraping

```javascript
// Maak een review scrape job aan
const reviewUrls = [
  'https://www.amazon.nl/product-reviews/B08H93ZRY1/',
  'https://www.amazon.nl/product-reviews/B09G9FPHY6/'
];

const job = await amazonScraper.createReviewScrapeJob('project-123', reviewUrls, {
  priority: 'high',
  // Extra opties...
});

console.log(`Review scrape job aangemaakt: ${job.id}`);
```

### Gefilterde Reviews Scraping

```javascript
// Maak een gefilterde review scrape job aan
const productId = 'B08H93ZRY1';
const starFilter = 5; // 5-sterren reviews

const job = await amazonScraper.createFilteredReviewScrapeJob('project-123', productId, starFilter, {
  priority: 'medium',
  marketplace: 'nl', // Optioneel, standaard is 'nl'
  // Extra opties...
});

console.log(`Gefilterde review scrape job aangemaakt: ${job.id}`);
```

### URL Generatie

```javascript
// Genereer review URLs voor een product met paginering
const reviewUrls = amazonScraper.generateReviewUrls(
  'B08H93ZRY1',  // Product ID (ASIN)
  3,              // Aantal pagina's
  'nl',           // Marketplace
  null            // Optionele sterrenfilter (1-5)
);

// Genereer review URLs voor meerdere producten
const multiProductReviewUrls = amazonScraper.generateMultiProductReviewUrls(
  ['B08H93ZRY1', 'B09G9FPHY6', 'B08L5TNJHG'],  // Product IDs
  2,                                           // Aantal pagina's per product
  'nl'                                         // Marketplace
);
```

## Scrape Opties

De Amazon Reviews scraper ondersteunt de volgende opties voor het aanpassen van het scrape gedrag:

### Algemene Opties

- `wait_for`: CSS selector om op te wachten voordat de pagina als geladen wordt beschouwd
- `device_type`: Type apparaat (desktop, mobile, tablet)
- `geo`: Geografische locatie (nl, de, us, etc.)
- `locale`: Taal en regio (nl-NL, de-DE, en-US, etc.)
- `javascript`: Of JavaScript moet worden uitgevoerd (true/false)
- `timeout`: Timeout in milliseconden
- `screenshot`: Of een screenshot moet worden gemaakt (true/false)
- `html`: Of de HTML response moet worden teruggegeven (true/false)

### Review Opties

```javascript
const reviewOptions = {
  wait_for: '#cm_cr-review_list',
  device_type: 'desktop',
  geo: 'nl',
  locale: 'nl-NL',
  javascript: true,
  timeout: 30000,
  screenshot: false,
  html: true,
  selectors: {
    reviews: '[data-hook="review"]',
    reviewTitle: '[data-hook="review-title"]',
    reviewRating: '[data-hook="review-star-rating"]',
    reviewDate: '[data-hook="review-date"]',
    reviewText: '[data-hook="review-body"]',
    reviewerName: '.a-profile-name',
    verifiedPurchase: '[data-hook="avp-badge"]',
    helpfulVotes: '[data-hook="helpful-vote-statement"]',
    pagination: '.a-pagination',
    productTitle: '#productTitle',
    productRating: '#averageCustomerReviews .a-icon-alt',
    totalReviews: '#acrCustomerReviewText',
    ratingBreakdown: '#histogramTable tr',
    filterByStar: '#reviews-filter-wrapper .a-link-normal'
  }
};
```

## Resultaat Structuur

### Review Resultaat

```javascript
{
  product_id: 'B08H93ZRY1',
  product_title: 'Product Titel',
  product_url: 'https://www.amazon.nl/dp/B08H93ZRY1/',
  url: 'https://www.amazon.nl/product-reviews/B08H93ZRY1/',
  average_rating: 4.5,
  total_reviews: 789,
  rating_breakdown: {
    five_star: { percentage: 70, count: 553 },
    four_star: { percentage: 15, count: 118 },
    three_star: { percentage: 7, count: 55 },
    two_star: { percentage: 3, count: 24 },
    one_star: { percentage: 5, count: 39 }
  },
  star_filter: 5, // null als geen filter actief
  reviews: [
    {
      id: 'R1ABC123456789',
      title: 'Great product',
      rating: 5,
      date: '2023-01-15',
      text: 'This is a great product, I love it! The quality is excellent and it works exactly as described.',
      reviewerName: 'John Doe',
      reviewerId: 'A1XYZ98765432',
      verifiedPurchase: true,
      helpfulVotes: 10,
      images: [
        'https://images-na.ssl-images-amazon.com/images/S/review-image-1.jpg'
      ],
      profileUrl: 'https://www.amazon.nl/gp/profile/amzn1.account.ABCDEFGHIJKLMNO',
      variant: 'Size: Large, Color: Blue',
      badges: ['Top 500 Reviewer', 'Vine Voice']
    },
    // Meer reviews...
  ],
  pagination: {
    currentPage: 1,
    totalPages: 10,
    hasNext: true,
    hasPrevious: false,
    nextUrl: 'https://www.amazon.nl/product-reviews/B08H93ZRY1/?pageNumber=2',
    previousUrl: null
  },
  marketplace: 'nl',
  scraped_at: '2023-01-20T10:15:30Z'
}
```

## Testen

Je kunt de Amazon Reviews scraper testen met het test script:

```bash
node src/services/scraping/test-amazon-reviews-scraper.js
```

Dit script test de volgende functionaliteit:

1. URL validatie
2. URL generatie
3. Review scraping
4. Gefilterde review scraping
5. Multi-product review scraping
6. Extractie functies

## Foutafhandeling

De Amazon Reviews scraper bevat uitgebreide foutafhandeling:

- Validatie van input parameters
- Controle van scrape resultaten
- Logging van fouten
- Integratie met de job queue voor retry mechanisme

## Implementatiedetails

De Amazon Reviews scraper is geïmplementeerd als een onderdeel van de AmazonScraper class die de Decodo API client gebruikt voor het uitvoeren van scrape operaties. De scraper bevat mock implementaties voor de extractie functies, die in een productie-omgeving moeten worden vervangen door echte HTML parsing logica.

## Marketplace Ondersteuning

De scraper ondersteunt verschillende Amazon marketplaces:

- amazon.nl (Nederland)
- amazon.de (Duitsland)
- amazon.com (Verenigde Staten)
- amazon.co.uk (Verenigd Koninkrijk)
- amazon.fr (Frankrijk)
- amazon.it (Italië)
- amazon.es (Spanje)
- amazon.ca (Canada)
- amazon.com.au (Australië)
- amazon.co.jp (Japan)
- amazon.in (India)

Voor elke marketplace kan de geo en locale worden aangepast om de juiste taal en regio te simuleren.

## Geolocation Simulatie

Voor sommige marketplaces is het nodig om de juiste geografische locatie te simuleren om toegang te krijgen tot de reviews. Dit kan worden gedaan door de `geo` en `locale` opties aan te passen:

```javascript
const options = {
  geo: 'de',         // Simuleer een locatie in Duitsland
  locale: 'de-DE',   // Gebruik Duitse taal en regio
  // Andere opties...
};

const job = await amazonScraper.createReviewScrapeJob('project-123', reviewUrls, options);
```

## Paginering

De scraper ondersteunt paginering om meer reviews te laden. Dit kan worden gedaan door de `pages` parameter aan te passen bij het genereren van URLs:

```javascript
// Genereer URLs voor 5 pagina's met reviews
const reviewUrls = amazonScraper.generateReviewUrls('B08H93ZRY1', 5, 'nl');
```

## Filtering op Sterbeoordelingen

De scraper ondersteunt filtering op sterbeoordelingen (1-5 sterren). Dit kan worden gedaan door de `starFilter` parameter aan te passen bij het genereren van URLs of door de `createFilteredReviewScrapeJob` functie te gebruiken:

```javascript
// Genereer URLs voor 5-sterren reviews
const reviewUrls = amazonScraper.generateReviewUrls('B08H93ZRY1', 3, 'nl', 5);

// Of gebruik de specifieke functie voor gefilterde reviews
const job = await amazonScraper.createFilteredReviewScrapeJob('project-123', 'B08H93ZRY1', 5);
```
