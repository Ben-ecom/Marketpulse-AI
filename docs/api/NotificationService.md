# NotificationService API Documentatie

De `NotificationService` biedt functionaliteit voor het beheren van notificaties en notificatie-instellingen voor het Help Metrics Dashboard. Deze service maakt het mogelijk om drempelwaarden in te stellen voor metrics en notificaties te genereren wanneer deze drempelwaarden worden overschreden.

## Importeren

```javascript
import NotificationService from '../services/help/NotificationService';
```

## Methoden

### getUserNotificationSettings

Haalt de notificatie-instellingen op voor een gebruiker.

```javascript
const settings = await NotificationService.getUserNotificationSettings(userId);
```

**Parameters:**
- `userId` (string): De ID van de gebruiker

**Returns:**
- `Promise<Object>`: De notificatie-instellingen van de gebruiker
  - `thresholds` (Array): Lijst van drempelwaarden
  - `notification_methods` (Object): Configuratie voor notificatiemethoden
  - `enabled` (boolean): Of notificaties zijn ingeschakeld

### saveUserNotificationSettings

Slaat notificatie-instellingen op voor een gebruiker.

```javascript
const updatedSettings = await NotificationService.saveUserNotificationSettings(userId, settings);
```

**Parameters:**
- `userId` (string): De ID van de gebruiker
- `settings` (Object): De notificatie-instellingen om op te slaan

**Returns:**
- `Promise<Object>`: De opgeslagen notificatie-instellingen

### addThreshold

Voegt een drempelwaarde toe aan de notificatie-instellingen.

```javascript
const updatedSettings = await NotificationService.addThreshold(userId, threshold);
```

**Parameters:**
- `userId` (string): De ID van de gebruiker
- `threshold` (Object): De drempelwaarde om toe te voegen
  - `metric` (string): De metric om te monitoren
  - `operator` (string): De operator voor de vergelijking (gt, lt, eq, gte, lte)
  - `value` (number): De drempelwaarde
  - `message` (string, optional): Een aangepast bericht voor de notificatie

**Returns:**
- `Promise<Object>`: De bijgewerkte notificatie-instellingen

### removeThreshold

Verwijdert een drempelwaarde uit de notificatie-instellingen.

```javascript
const updatedSettings = await NotificationService.removeThreshold(userId, thresholdId);
```

**Parameters:**
- `userId` (string): De ID van de gebruiker
- `thresholdId` (string): De ID van de drempelwaarde om te verwijderen

**Returns:**
- `Promise<Object>`: De bijgewerkte notificatie-instellingen

### updateThreshold

Update een drempelwaarde in de notificatie-instellingen.

```javascript
const updatedSettings = await NotificationService.updateThreshold(userId, thresholdId, updatedThreshold);
```

**Parameters:**
- `userId` (string): De ID van de gebruiker
- `thresholdId` (string): De ID van de drempelwaarde om te updaten
- `updatedThreshold` (Object): De bijgewerkte drempelwaarde

**Returns:**
- `Promise<Object>`: De bijgewerkte notificatie-instellingen

### updateNotificationMethods

Update de notificatiemethoden.

```javascript
const updatedSettings = await NotificationService.updateNotificationMethods(userId, methods);
```

**Parameters:**
- `userId` (string): De ID van de gebruiker
- `methods` (Object): De notificatiemethoden
  - `in_app` (boolean): Of in-app notificaties zijn ingeschakeld
  - `email` (boolean): Of e-mail notificaties zijn ingeschakeld

**Returns:**
- `Promise<Object>`: De bijgewerkte notificatie-instellingen

### setNotificationsEnabled

Schakelt notificaties in of uit.

```javascript
const updatedSettings = await NotificationService.setNotificationsEnabled(userId, enabled);
```

**Parameters:**
- `userId` (string): De ID van de gebruiker
- `enabled` (boolean): Of notificaties ingeschakeld moeten zijn

**Returns:**
- `Promise<Object>`: De bijgewerkte notificatie-instellingen

### checkThresholds

Controleert of er drempelwaarden zijn overschreden en stuurt notificaties.

```javascript
const notifications = await NotificationService.checkThresholds(userId);
```

**Parameters:**
- `userId` (string): De ID van de gebruiker

**Returns:**
- `Promise<Array>`: Array van gegenereerde notificaties

### getNotifications

Haalt notificaties op voor een gebruiker.

```javascript
const notifications = await NotificationService.getNotifications(userId, onlyUnread);
```

**Parameters:**
- `userId` (string): De ID van de gebruiker
- `onlyUnread` (boolean, optional): Alleen ongelezen notificaties ophalen

**Returns:**
- `Promise<Array>`: Array van notificaties

### markNotificationAsRead

Markeert een notificatie als gelezen.

```javascript
const updatedNotification = await NotificationService.markNotificationAsRead(notificationId);
```

**Parameters:**
- `notificationId` (string): De ID van de notificatie

**Returns:**
- `Promise<Object>`: De bijgewerkte notificatie

### markAllNotificationsAsRead

Markeert alle notificaties als gelezen voor een gebruiker.

```javascript
const updatedNotifications = await NotificationService.markAllNotificationsAsRead(userId);
```

**Parameters:**
- `userId` (string): De ID van de gebruiker

**Returns:**
- `Promise<Array>`: De bijgewerkte notificaties

### deleteNotification

Verwijdert een notificatie.

```javascript
await NotificationService.deleteNotification(notificationId);
```

**Parameters:**
- `notificationId` (string): De ID van de notificatie

**Returns:**
- `Promise<void>`

### deleteAllNotifications

Verwijdert alle notificaties voor een gebruiker.

```javascript
await NotificationService.deleteAllNotifications(userId);
```

**Parameters:**
- `userId` (string): De ID van de gebruiker

**Returns:**
- `Promise<void>`

## Voorbeelden

### Drempelwaarde toevoegen

```javascript
// Voeg een drempelwaarde toe voor het totaal aantal interacties
const threshold = {
  metric: 'totalInteractions',
  operator: 'gt',
  value: 1000,
  message: 'Het totaal aantal interacties heeft 1000 overschreden!'
};

const updatedSettings = await NotificationService.addThreshold(userId, threshold);
```

### Notificaties ophalen

```javascript
// Haal alle notificaties op
const allNotifications = await NotificationService.getNotifications(userId);

// Haal alleen ongelezen notificaties op
const unreadNotifications = await NotificationService.getNotifications(userId, true);
```

### Notificaties markeren als gelezen

```javascript
// Markeer een specifieke notificatie als gelezen
await NotificationService.markNotificationAsRead(notificationId);

// Markeer alle notificaties als gelezen
await NotificationService.markAllNotificationsAsRead(userId);
```

## Database Schema

### notification_settings tabel

| Kolom | Type | Beschrijving |
|-------|------|-------------|
| id | UUID | Primaire sleutel |
| user_id | UUID | Referentie naar auth.users(id) |
| thresholds | JSONB | Array van drempelwaarden |
| notification_methods | JSONB | Configuratie voor notificatiemethoden |
| enabled | BOOLEAN | Of notificaties zijn ingeschakeld |
| last_updated | TIMESTAMP WITH TIME ZONE | Timestamp van de laatste update |
| created_at | TIMESTAMP WITH TIME ZONE | Timestamp van creatie |

### notifications tabel

| Kolom | Type | Beschrijving |
|-------|------|-------------|
| id | UUID | Primaire sleutel |
| user_id | UUID | Referentie naar auth.users(id) |
| threshold_id | UUID | De drempelwaarde die deze notificatie heeft getriggerd |
| metric | TEXT | De metric waarop deze notificatie betrekking heeft |
| operator | TEXT | De operator die is gebruikt voor de vergelijking |
| value | NUMERIC | De drempelwaarde |
| current_value | NUMERIC | De huidige waarde van de metric |
| message | TEXT | Het bericht van de notificatie |
| read | BOOLEAN | Of de notificatie is gelezen |
| created_at | TIMESTAMP WITH TIME ZONE | Timestamp van creatie |
