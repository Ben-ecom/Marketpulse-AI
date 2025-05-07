# HelpMetricsService API Documentatie

De `HelpMetricsService` biedt functionaliteit voor het ophalen en analyseren van help-gerelateerde metrics uit de database. Deze service maakt gebruik van caching om de prestaties te verbeteren en de belasting van de database te verminderen.

## Importeren

```javascript
import HelpMetricsService from '../services/help/HelpMetricsService';
```

## Methoden

### getMetrics(filters)

Haalt alle help metrics op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object): Een object met de volgende eigenschappen:
  - `dateRange` (Object, optioneel): Een object met `start` en `end` Date objecten.
  - `userRoles` (Array, optioneel): Een array van gebruikersrollen om op te filteren.
  - `experienceLevels` (Array, optioneel): Een array van ervaringsniveaus om op te filteren.

#### Retourneert

- `Promise<Object>`: Een Promise die resolveert naar een object met de volgende eigenschappen:
  - `summary` (Object): Samenvattende statistieken.
  - `interactionsByType` (Object): Aantal interacties per type.
  - `interactionsByPage` (Object): Aantal interacties per pagina.
  - `feedbackByHelpItem` (Array): Feedback per help item.
  - `feedbackByUserRole` (Array): Feedback per gebruikersrol.
  - `feedbackByExperienceLevel` (Array): Feedback per ervaringsniveau.
  - `interactionsTrend` (Array): Trend van interacties over tijd.
  - `userExperienceFeedback` (Array): Gebruikerservaring feedback.

#### Voorbeeld

```javascript
const filters = {
  dateRange: {
    start: new Date('2023-01-01'),
    end: new Date('2023-12-31')
  },
  userRoles: ['admin', 'user'],
  experienceLevels: ['beginner', 'intermediate', 'advanced']
};

try {
  const metrics = await HelpMetricsService.getMetrics(filters);
  console.log(metrics.summary);
} catch (error) {
  console.error('Fout bij het ophalen van metrics:', error);
}
```

### getSummaryMetrics(filters)

Haalt alleen de samenvattende metrics op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object): Zie `getMetrics()`.

#### Retourneert

- `Promise<Object>`: Een Promise die resolveert naar een object met de volgende eigenschappen:
  - `totalInteractions` (Number): Totaal aantal interacties.
  - `totalFeedback` (Number): Totaal aantal feedback submissies.
  - `feedbackSubmissionRate` (Number): Percentage van interacties die tot feedback hebben geleid.
  - `positiveFeedbackRate` (Number): Percentage positieve feedback.
  - `averageUserSatisfaction` (Number): Gemiddelde gebruikerstevredenheid score.

#### Voorbeeld

```javascript
try {
  const summary = await HelpMetricsService.getSummaryMetrics(filters);
  console.log(`Totaal interacties: ${summary.totalInteractions}`);
  console.log(`Feedback ratio: ${summary.feedbackSubmissionRate}%`);
} catch (error) {
  console.error('Fout bij het ophalen van samenvatting:', error);
}
```

### getInteractionsByType(filters)

Haalt het aantal interacties per type op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object): Zie `getMetrics()`.

#### Retourneert

- `Promise<Object>`: Een Promise die resolveert naar een object waarin elke sleutel een interactietype is en elke waarde het aantal interacties van dat type.

#### Voorbeeld

```javascript
try {
  const interactionsByType = await HelpMetricsService.getInteractionsByType(filters);
  console.log('Interacties per type:', interactionsByType);
} catch (error) {
  console.error('Fout bij het ophalen van interacties per type:', error);
}
```

### getInteractionsByPage(filters)

Haalt het aantal interacties per pagina op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object): Zie `getMetrics()`.

#### Retourneert

- `Promise<Object>`: Een Promise die resolveert naar een object waarin elke sleutel een pagina is en elke waarde het aantal interacties op die pagina.

#### Voorbeeld

```javascript
try {
  const interactionsByPage = await HelpMetricsService.getInteractionsByPage(filters);
  console.log('Interacties per pagina:', interactionsByPage);
} catch (error) {
  console.error('Fout bij het ophalen van interacties per pagina:', error);
}
```

### getFeedbackByHelpItem(filters)

Haalt feedback per help item op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object): Zie `getMetrics()`.

#### Retourneert

- `Promise<Array>`: Een Promise die resolveert naar een array van objecten met de volgende eigenschappen:
  - `id` (String): ID van het help item.
  - `type` (String): Type van het help item.
  - `positive` (Number): Aantal positieve feedback submissies.
  - `negative` (Number): Aantal negatieve feedback submissies.
  - `total` (Number): Totaal aantal feedback submissies.
  - `positiveRatio` (Number): Percentage positieve feedback.

#### Voorbeeld

```javascript
try {
  const feedbackByHelpItem = await HelpMetricsService.getFeedbackByHelpItem(filters);
  console.log('Feedback per help item:', feedbackByHelpItem);
} catch (error) {
  console.error('Fout bij het ophalen van feedback per help item:', error);
}
```

### getFeedbackByUserRole(filters)

Haalt feedback per gebruikersrol op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object): Zie `getMetrics()`.

#### Retourneert

- `Promise<Array>`: Een Promise die resolveert naar een array van objecten met de volgende eigenschappen:
  - `role` (String): Gebruikersrol.
  - `positive` (Number): Aantal positieve feedback submissies.
  - `negative` (Number): Aantal negatieve feedback submissies.
  - `total` (Number): Totaal aantal feedback submissies.
  - `positiveRatio` (Number): Percentage positieve feedback.

#### Voorbeeld

```javascript
try {
  const feedbackByUserRole = await HelpMetricsService.getFeedbackByUserRole(filters);
  console.log('Feedback per gebruikersrol:', feedbackByUserRole);
} catch (error) {
  console.error('Fout bij het ophalen van feedback per gebruikersrol:', error);
}
```

### getFeedbackByExperienceLevel(filters)

Haalt feedback per ervaringsniveau op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object): Zie `getMetrics()`.

#### Retourneert

- `Promise<Array>`: Een Promise die resolveert naar een array van objecten met de volgende eigenschappen:
  - `level` (String): Ervaringsniveau.
  - `positive` (Number): Aantal positieve feedback submissies.
  - `negative` (Number): Aantal negatieve feedback submissies.
  - `total` (Number): Totaal aantal feedback submissies.
  - `positiveRatio` (Number): Percentage positieve feedback.

#### Voorbeeld

```javascript
try {
  const feedbackByExperienceLevel = await HelpMetricsService.getFeedbackByExperienceLevel(filters);
  console.log('Feedback per ervaringsniveau:', feedbackByExperienceLevel);
} catch (error) {
  console.error('Fout bij het ophalen van feedback per ervaringsniveau:', error);
}
```

### getInteractionsTrend(filters)

Haalt de trend van interacties over tijd op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object): Zie `getMetrics()`.

#### Retourneert

- `Promise<Array>`: Een Promise die resolveert naar een array van objecten met de volgende eigenschappen:
  - `date` (String): Datum in het formaat 'YYYY-MM-DD'.
  - `count` (Number): Aantal interacties op die datum.

#### Voorbeeld

```javascript
try {
  const interactionsTrend = await HelpMetricsService.getInteractionsTrend(filters);
  console.log('Interacties trend:', interactionsTrend);
} catch (error) {
  console.error('Fout bij het ophalen van interacties trend:', error);
}
```

### getUserExperienceFeedback(filters)

Haalt gebruikerservaring feedback op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object): Zie `getMetrics()`.

#### Retourneert

- `Promise<Array>`: Een Promise die resolveert naar een array van gebruikerservaring feedback objecten.

#### Voorbeeld

```javascript
try {
  const userExperienceFeedback = await HelpMetricsService.getUserExperienceFeedback(filters);
  console.log('Gebruikerservaring feedback:', userExperienceFeedback);
} catch (error) {
  console.error('Fout bij het ophalen van gebruikerservaring feedback:', error);
}
```

### clearCache()

Wist de cache voor alle metrics.

#### Retourneert

- `void`

#### Voorbeeld

```javascript
HelpMetricsService.clearCache();
console.log('Cache gewist');
```

## Caching

De `HelpMetricsService` maakt gebruik van caching om de prestaties te verbeteren en de belasting van de database te verminderen. Elke methode die data ophaalt uit de database slaat het resultaat op in de cache met een time-to-live (TTL) van 5 minuten.

De cache wordt automatisch gewist in de volgende gevallen:
- Wanneer de `clearCache()` methode wordt aangeroepen
- Wanneer nieuwe interacties of feedback worden geregistreerd via de `HelpInteractionService`

### Cache Sleutels

De cache sleutels worden gegenereerd op basis van de methode en de filters. Dit zorgt ervoor dat verschillende filtercombinaties verschillende cache entries hebben.

## Foutafhandeling

Alle methoden gooien een fout als er een probleem optreedt bij het ophalen van data uit de database. Het is belangrijk om deze fouten af te handelen in de aanroepende code.
