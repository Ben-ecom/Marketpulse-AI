# DashboardPreferencesService API Documentatie

## Overzicht

De `DashboardPreferencesService` biedt functionaliteit voor het beheren van gebruikersvoorkeuren voor het Help Metrics Dashboard. Deze service maakt het mogelijk om dashboard instellingen zoals zichtbare widgets, widget volgorde, opgeslagen filters, layout en thema op te slaan en te beheren.

## Functies

### getUserPreferences

```javascript
getUserPreferences(userId)
```

Haalt de dashboard voorkeuren op voor een specifieke gebruiker.

#### Parameters

- `userId` (string): De ID van de gebruiker waarvan de voorkeuren moeten worden opgehaald.

#### Retourneert

- (Promise\<Object\>): Een promise die resolveert naar een object met de dashboard voorkeuren.

#### Voorbeeld

```javascript
import DashboardPreferencesService from '../services/help/DashboardPreferencesService';

// Haal voorkeuren op voor de huidige gebruiker
const preferences = await DashboardPreferencesService.getUserPreferences(currentUser.id);
console.log('Zichtbare widgets:', preferences.visible_widgets);
```

### saveUserPreferences

```javascript
saveUserPreferences(userId, preferences)
```

Slaat de dashboard voorkeuren op voor een specifieke gebruiker.

#### Parameters

- `userId` (string): De ID van de gebruiker.
- `preferences` (Object): De dashboard voorkeuren om op te slaan.

#### Retourneert

- (Promise\<Object\>): Een promise die resolveert naar een object met de opgeslagen dashboard voorkeuren.

#### Voorbeeld

```javascript
import DashboardPreferencesService from '../services/help/DashboardPreferencesService';

// Sla voorkeuren op voor de huidige gebruiker
const updatedPreferences = await DashboardPreferencesService.saveUserPreferences(currentUser.id, {
  visible_widgets: ['summary', 'interactionsByType'],
  widget_order: ['summary', 'interactionsByType'],
  layout: 'default',
  theme: 'dark'
});
```

### saveFilterConfiguration

```javascript
saveFilterConfiguration(userId, filter)
```

Slaat een filter configuratie op voor een specifieke gebruiker.

#### Parameters

- `userId` (string): De ID van de gebruiker.
- `filter` (Object): De filter configuratie om op te slaan.

#### Retourneert

- (Promise\<Object\>): Een promise die resolveert naar een object met de bijgewerkte dashboard voorkeuren.

#### Voorbeeld

```javascript
import DashboardPreferencesService from '../services/help/DashboardPreferencesService';

// Sla een filter configuratie op
const filter = {
  name: 'Laatste 7 dagen - Marketeer',
  config: {
    dateRange: {
      preset: 'last7days'
    },
    userRoles: ['marketeer'],
    experienceLevels: []
  }
};

const updatedPreferences = await DashboardPreferencesService.saveFilterConfiguration(currentUser.id, filter);
```

### deleteFilterConfiguration

```javascript
deleteFilterConfiguration(userId, filterName)
```

Verwijdert een opgeslagen filter configuratie.

#### Parameters

- `userId` (string): De ID van de gebruiker.
- `filterName` (string): De naam van de filter om te verwijderen.

#### Retourneert

- (Promise\<Object\>): Een promise die resolveert naar een object met de bijgewerkte dashboard voorkeuren.

#### Voorbeeld

```javascript
import DashboardPreferencesService from '../services/help/DashboardPreferencesService';

// Verwijder een filter configuratie
const updatedPreferences = await DashboardPreferencesService.deleteFilterConfiguration(
  currentUser.id,
  'Laatste 7 dagen - Marketeer'
);
```

### setDefaultFilter

```javascript
setDefaultFilter(userId, filterName)
```

Stelt een filter in als standaard filter.

#### Parameters

- `userId` (string): De ID van de gebruiker.
- `filterName` (string): De naam van de filter om als standaard in te stellen.

#### Retourneert

- (Promise\<Object\>): Een promise die resolveert naar een object met de bijgewerkte dashboard voorkeuren.

#### Voorbeeld

```javascript
import DashboardPreferencesService from '../services/help/DashboardPreferencesService';

// Stel een filter in als standaard
const updatedPreferences = await DashboardPreferencesService.setDefaultFilter(
  currentUser.id,
  'Laatste 7 dagen - Marketeer'
);
```

### updateWidgetConfiguration

```javascript
updateWidgetConfiguration(userId, visibleWidgets, widgetOrder)
```

Update de zichtbare widgets en hun volgorde.

#### Parameters

- `userId` (string): De ID van de gebruiker.
- `visibleWidgets` (Array\<string\>): Array van widget IDs die zichtbaar moeten zijn.
- `widgetOrder` (Array\<string\>): Array van widget IDs in de gewenste volgorde.

#### Retourneert

- (Promise\<Object\>): Een promise die resolveert naar een object met de bijgewerkte dashboard voorkeuren.

#### Voorbeeld

```javascript
import DashboardPreferencesService from '../services/help/DashboardPreferencesService';

// Update widget configuratie
const updatedPreferences = await DashboardPreferencesService.updateWidgetConfiguration(
  currentUser.id,
  ['summary', 'interactionsByType'],
  ['summary', 'interactionsByType']
);
```

### updateLayout

```javascript
updateLayout(userId, layout)
```

Update de layout van het dashboard.

#### Parameters

- `userId` (string): De ID van de gebruiker.
- `layout` (string): De layout ('default', 'compact', 'expanded').

#### Retourneert

- (Promise\<Object\>): Een promise die resolveert naar een object met de bijgewerkte dashboard voorkeuren.

#### Voorbeeld

```javascript
import DashboardPreferencesService from '../services/help/DashboardPreferencesService';

// Update layout
const updatedPreferences = await DashboardPreferencesService.updateLayout(
  currentUser.id,
  'compact'
);
```

### updateTheme

```javascript
updateTheme(userId, theme)
```

Update het thema van het dashboard.

#### Parameters

- `userId` (string): De ID van de gebruiker.
- `theme` (string): Het thema ('light', 'dark', 'system').

#### Retourneert

- (Promise\<Object\>): Een promise die resolveert naar een object met de bijgewerkte dashboard voorkeuren.

#### Voorbeeld

```javascript
import DashboardPreferencesService from '../services/help/DashboardPreferencesService';

// Update thema
const updatedPreferences = await DashboardPreferencesService.updateTheme(
  currentUser.id,
  'dark'
);
```

### updateRealtimeSetting

```javascript
updateRealtimeSetting(userId, enabled)
```

Update de realtime instelling van het dashboard.

#### Parameters

- `userId` (string): De ID van de gebruiker.
- `enabled` (boolean): Of realtime updates ingeschakeld moeten zijn.

#### Retourneert

- (Promise\<Object\>): Een promise die resolveert naar een object met de bijgewerkte dashboard voorkeuren.

#### Voorbeeld

```javascript
import DashboardPreferencesService from '../services/help/DashboardPreferencesService';

// Update realtime instelling
const updatedPreferences = await DashboardPreferencesService.updateRealtimeSetting(
  currentUser.id,
  true
);
```

### resetToDefaults

```javascript
resetToDefaults(userId)
```

Reset alle dashboard voorkeuren naar de standaardwaarden.

#### Parameters

- `userId` (string): De ID van de gebruiker.

#### Retourneert

- (Promise\<Object\>): Een promise die resolveert naar een object met de standaard dashboard voorkeuren.

#### Voorbeeld

```javascript
import DashboardPreferencesService from '../services/help/DashboardPreferencesService';

// Reset voorkeuren naar standaardwaarden
const defaultPreferences = await DashboardPreferencesService.resetToDefaults(currentUser.id);
```

## Databasestructuur

De service maakt gebruik van de `dashboard_preferences` tabel in de Supabase database. Deze tabel heeft de volgende structuur:

| Kolom | Type | Beschrijving |
|-------|------|-------------|
| id | UUID | Unieke identifier voor de voorkeur |
| user_id | UUID | De gebruiker waartoe deze voorkeuren behoren |
| visible_widgets | JSONB | Array van widget IDs die zichtbaar zijn in het dashboard |
| widget_order | JSONB | Array van widget IDs in de gewenste volgorde |
| saved_filters | JSONB | Array van opgeslagen filter configuraties |
| default_filter | TEXT | Naam van de standaard filter |
| layout | TEXT | Layout van het dashboard (default, compact, expanded) |
| theme | TEXT | Thema van het dashboard (light, dark, system) |
| realtime_enabled | BOOLEAN | Of real-time updates zijn ingeschakeld |
| last_updated | TIMESTAMP | Timestamp van de laatste update |
| created_at | TIMESTAMP | Timestamp van creatie |

## Offline Ondersteuning

De service biedt beperkte offline ondersteuning door voorkeuren op te slaan in `localStorage`. Wanneer de database niet beschikbaar is, worden voorkeuren uit `localStorage` opgehaald. Wanneer de verbinding is hersteld, worden de voorkeuren gesynchroniseerd met de database.

## Foutafhandeling

De service bevat ingebouwde foutafhandeling voor databasefouten. Als er een fout optreedt bij het ophalen of opslaan van voorkeuren, wordt deze gelogd in de console en wordt er een fallback gebruikt (standaardwaarden of `localStorage`).

## Caching

De service maakt gebruik van de `withCache` functie uit `cacheUtils` om voorkeuren in de cache op te slaan voor betere prestaties. De cache heeft een TTL (time-to-live) van 5 minuten.
