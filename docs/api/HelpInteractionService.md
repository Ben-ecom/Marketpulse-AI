# HelpInteractionService API Documentatie

De `HelpInteractionService` biedt functionaliteit voor het registreren van help-gerelateerde interacties en feedback in de database. Deze service wordt gebruikt door verschillende help componenten in de applicatie.

## Importeren

```javascript
import HelpInteractionService from '../services/help/HelpInteractionService';
```

## Methoden

### registerHelpInteraction(interactionData)

Registreert een help interactie in de database.

#### Parameters

- `interactionData` (Object): Een object met de volgende eigenschappen:
  - `action` (String, verplicht): Het type interactie (bijv. 'click', 'hover', 'view').
  - `section` (String, verplicht): De sectie of pagina waar de interactie plaatsvond.
  - `helpItemId` (String, optioneel): ID van het help item waarmee werd geïnteracteerd.
  - `helpItemType` (String, optioneel): Type van het help item waarmee werd geïnteracteerd.
  - `userRole` (String, optioneel): De rol van de gebruiker.
  - `experienceLevel` (String, optioneel): Het ervaringsniveau van de gebruiker.

#### Retourneert

- `Promise<Object>`: Een Promise die resolveert naar een object met de volgende eigenschappen:
  - `data` (Object): De geregistreerde interactie data.
  - `error` (Object, optioneel): Een foutobject als er iets mis ging.

#### Voorbeeld

```javascript
const interactionData = {
  action: 'click',
  section: '/dashboard',
  helpItemId: 'tooltip-123',
  helpItemType: 'tooltip',
  userRole: 'admin',
  experienceLevel: 'intermediate'
};

try {
  const { data, error } = await HelpInteractionService.registerHelpInteraction(interactionData);
  if (error) throw error;
  console.log('Interactie succesvol geregistreerd:', data);
} catch (error) {
  console.error('Fout bij het registreren van interactie:', error);
}
```

### submitHelpFeedback(feedbackData)

Registreert feedback voor een help item in de database.

#### Parameters

- `feedbackData` (Object): Een object met de volgende eigenschappen:
  - `helpItemId` (String, verplicht): ID van het help item waarop feedback wordt gegeven.
  - `helpItemType` (String, verplicht): Type van het help item waarop feedback wordt gegeven.
  - `value` (Boolean, verplicht): `true` voor positieve feedback, `false` voor negatieve feedback.
  - `userRole` (String, optioneel): De rol van de gebruiker.
  - `experienceLevel` (String, optioneel): Het ervaringsniveau van de gebruiker.
  - `comments` (String, optioneel): Eventuele opmerkingen van de gebruiker.

#### Retourneert

- `Promise<Object>`: Een Promise die resolveert naar een object met de volgende eigenschappen:
  - `data` (Object): De geregistreerde feedback data.
  - `error` (Object, optioneel): Een foutobject als er iets mis ging.

#### Voorbeeld

```javascript
const feedbackData = {
  helpItemId: 'tooltip-123',
  helpItemType: 'tooltip',
  value: true, // positieve feedback
  userRole: 'admin',
  experienceLevel: 'intermediate',
  comments: 'Zeer nuttige informatie!'
};

try {
  const { data, error } = await HelpInteractionService.submitHelpFeedback(feedbackData);
  if (error) throw error;
  console.log('Feedback succesvol geregistreerd:', data);
} catch (error) {
  console.error('Fout bij het registreren van feedback:', error);
}
```

### submitUserExperienceFeedback(feedbackData)

Registreert feedback over de algehele gebruikerservaring in de database.

#### Parameters

- `feedbackData` (Object): Een object met de volgende eigenschappen:
  - `pageContext` (String, verplicht): De pagina waar de feedback werd gegeven.
  - `rating` (Number, verplicht): Een score van 1 tot 5.
  - `userRole` (String, optioneel): De rol van de gebruiker.
  - `experienceLevel` (String, optioneel): Het ervaringsniveau van de gebruiker.
  - `comments` (String, optioneel): Eventuele opmerkingen van de gebruiker.
  - `selectedAspects` (Array, optioneel): Een array van aspecten waarop de feedback betrekking heeft.

#### Retourneert

- `Promise<Object>`: Een Promise die resolveert naar een object met de volgende eigenschappen:
  - `data` (Object): De geregistreerde feedback data.
  - `error` (Object, optioneel): Een foutobject als er iets mis ging.

#### Voorbeeld

```javascript
const feedbackData = {
  pageContext: '/dashboard',
  rating: 4,
  userRole: 'admin',
  experienceLevel: 'intermediate',
  comments: 'Goede ervaring, maar kan nog verbeterd worden.',
  selectedAspects: ['UI', 'Help System']
};

try {
  const { data, error } = await HelpInteractionService.submitUserExperienceFeedback(feedbackData);
  if (error) throw error;
  console.log('Gebruikerservaring feedback succesvol geregistreerd:', data);
} catch (error) {
  console.error('Fout bij het registreren van gebruikerservaring feedback:', error);
}
```

### getHelpInteractions(filters)

Haalt help interacties op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object, optioneel): Een object met de volgende eigenschappen:
  - `dateRange` (Object, optioneel): Een object met `start` en `end` Date objecten.
  - `userRoles` (Array, optioneel): Een array van gebruikersrollen om op te filteren.
  - `experienceLevels` (Array, optioneel): Een array van ervaringsniveaus om op te filteren.
  - `actions` (Array, optioneel): Een array van actietypes om op te filteren.
  - `sections` (Array, optioneel): Een array van secties om op te filteren.
  - `helpItemIds` (Array, optioneel): Een array van help item IDs om op te filteren.
  - `helpItemTypes` (Array, optioneel): Een array van help item types om op te filteren.

#### Retourneert

- `Promise<Object>`: Een Promise die resolveert naar een object met de volgende eigenschappen:
  - `data` (Array): Een array van interactie objecten.
  - `error` (Object, optioneel): Een foutobject als er iets mis ging.

#### Voorbeeld

```javascript
const filters = {
  dateRange: {
    start: new Date('2023-01-01'),
    end: new Date('2023-12-31')
  },
  userRoles: ['admin', 'user'],
  actions: ['click', 'hover']
};

try {
  const { data, error } = await HelpInteractionService.getHelpInteractions(filters);
  if (error) throw error;
  console.log('Help interacties:', data);
} catch (error) {
  console.error('Fout bij het ophalen van help interacties:', error);
}
```

### getHelpFeedback(filters)

Haalt help feedback op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object, optioneel): Een object met de volgende eigenschappen:
  - `dateRange` (Object, optioneel): Een object met `start` en `end` Date objecten.
  - `userRoles` (Array, optioneel): Een array van gebruikersrollen om op te filteren.
  - `experienceLevels` (Array, optioneel): Een array van ervaringsniveaus om op te filteren.
  - `helpItemIds` (Array, optioneel): Een array van help item IDs om op te filteren.
  - `helpItemTypes` (Array, optioneel): Een array van help item types om op te filteren.
  - `value` (Boolean, optioneel): Filter op positieve (`true`) of negatieve (`false`) feedback.

#### Retourneert

- `Promise<Object>`: Een Promise die resolveert naar een object met de volgende eigenschappen:
  - `data` (Array): Een array van feedback objecten.
  - `error` (Object, optioneel): Een foutobject als er iets mis ging.

#### Voorbeeld

```javascript
const filters = {
  dateRange: {
    start: new Date('2023-01-01'),
    end: new Date('2023-12-31')
  },
  userRoles: ['admin'],
  value: true // alleen positieve feedback
};

try {
  const { data, error } = await HelpInteractionService.getHelpFeedback(filters);
  if (error) throw error;
  console.log('Help feedback:', data);
} catch (error) {
  console.error('Fout bij het ophalen van help feedback:', error);
}
```

### getUserExperienceFeedback(filters)

Haalt gebruikerservaring feedback op uit de database op basis van de opgegeven filters.

#### Parameters

- `filters` (Object, optioneel): Een object met de volgende eigenschappen:
  - `dateRange` (Object, optioneel): Een object met `start` en `end` Date objecten.
  - `userRoles` (Array, optioneel): Een array van gebruikersrollen om op te filteren.
  - `experienceLevels` (Array, optioneel): Een array van ervaringsniveaus om op te filteren.
  - `pageContexts` (Array, optioneel): Een array van pagina's om op te filteren.
  - `minRating` (Number, optioneel): Minimale rating om op te filteren.
  - `maxRating` (Number, optioneel): Maximale rating om op te filteren.

#### Retourneert

- `Promise<Object>`: Een Promise die resolveert naar een object met de volgende eigenschappen:
  - `data` (Array): Een array van gebruikerservaring feedback objecten.
  - `error` (Object, optioneel): Een foutobject als er iets mis ging.

#### Voorbeeld

```javascript
const filters = {
  dateRange: {
    start: new Date('2023-01-01'),
    end: new Date('2023-12-31')
  },
  userRoles: ['admin'],
  minRating: 4 // alleen feedback met rating 4 of hoger
};

try {
  const { data, error } = await HelpInteractionService.getUserExperienceFeedback(filters);
  if (error) throw error;
  console.log('Gebruikerservaring feedback:', data);
} catch (error) {
  console.error('Fout bij het ophalen van gebruikerservaring feedback:', error);
}
```

## Integratie met HelpMetricsService

Wanneer nieuwe interacties of feedback worden geregistreerd via de `HelpInteractionService`, wordt de cache van de `HelpMetricsService` automatisch gewist. Dit zorgt ervoor dat de metrics altijd up-to-date zijn.

## Foutafhandeling

Alle methoden retourneren een object met een `data` en eventueel een `error` eigenschap. Het is belangrijk om te controleren of er een fout is opgetreden voordat je de data gebruikt.

## Database Schema

De `HelpInteractionService` werkt met de volgende tabellen in de database:

### help_interactions

- `id` (UUID): Unieke identifier voor de interactie.
- `created_at` (Timestamp): Tijdstip waarop de interactie werd geregistreerd.
- `action` (String): Type interactie (bijv. 'click', 'hover', 'view').
- `section` (String): De sectie of pagina waar de interactie plaatsvond.
- `help_item_id` (String, optioneel): ID van het help item waarmee werd geïnteracteerd.
- `help_item_type` (String, optioneel): Type van het help item waarmee werd geïnteracteerd.
- `user_role` (String, optioneel): De rol van de gebruiker.
- `experience_level` (String, optioneel): Het ervaringsniveau van de gebruiker.
- `user_id` (UUID, optioneel): ID van de gebruiker (indien ingelogd).

### help_feedback

- `id` (UUID): Unieke identifier voor de feedback.
- `created_at` (Timestamp): Tijdstip waarop de feedback werd geregistreerd.
- `help_item_id` (String): ID van het help item waarop feedback wordt gegeven.
- `help_item_type` (String): Type van het help item waarop feedback wordt gegeven.
- `value` (Boolean): `true` voor positieve feedback, `false` voor negatieve feedback.
- `user_role` (String, optioneel): De rol van de gebruiker.
- `experience_level` (String, optioneel): Het ervaringsniveau van de gebruiker.
- `comments` (String, optioneel): Eventuele opmerkingen van de gebruiker.
- `user_id` (UUID, optioneel): ID van de gebruiker (indien ingelogd).

### user_experience_feedback

- `id` (UUID): Unieke identifier voor de feedback.
- `created_at` (Timestamp): Tijdstip waarop de feedback werd geregistreerd.
- `page_context` (String): De pagina waar de feedback werd gegeven.
- `rating` (Number): Een score van 1 tot 5.
- `user_role` (String, optioneel): De rol van de gebruiker.
- `experience_level` (String, optioneel): Het ervaringsniveau van de gebruiker.
- `comments` (String, optioneel): Eventuele opmerkingen van de gebruiker.
- `selected_aspects` (Array, optioneel): Een array van aspecten waarop de feedback betrekking heeft.
- `user_id` (UUID, optioneel): ID van de gebruiker (indien ingelogd).
