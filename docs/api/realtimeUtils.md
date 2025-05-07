# realtimeUtils API Documentatie

## Overzicht

De `realtimeUtils` module biedt functionaliteit voor het werken met Supabase Realtime voor real-time updates in de MarketPulse AI applicatie. Deze module maakt het mogelijk om te abonneren op wijzigingen in de database en daarop te reageren in de gebruikersinterface.

## Functies

### subscribeToTable

```javascript
subscribeToTable(table, callback, event = '*', filters = {})
```

Abonneert op wijzigingen in een specifieke tabel.

#### Parameters

- `table` (string): De naam van de tabel om op te abonneren.
- `callback` (Function): De functie die wordt aangeroepen bij wijzigingen.
- `event` (string, optioneel): Het type event ('INSERT', 'UPDATE', 'DELETE', of '*' voor alle events). Standaard: '*'.
- `filters` (Object, optioneel): Filters voor de subscription.

#### Retourneert

- (Object): Het subscription object dat kan worden gebruikt om later af te melden.

#### Voorbeeld

```javascript
import { subscribeToTable } from '../utils/realtimeUtils';

// Abonneren op alle wijzigingen in de help_interactions tabel
const subscription = subscribeToTable('help_interactions', (payload) => {
  console.log('Nieuwe interactie:', payload);
  // Update UI of data
});
```

### subscribeToMultipleTables

```javascript
subscribeToMultipleTables(subscriptions, callback)
```

Abonneert op wijzigingen in meerdere tabellen.

#### Parameters

- `subscriptions` (Array<Object>): Array van subscription configuraties met de volgende eigenschappen:
  - `table` (string): De naam van de tabel.
  - `event` (string, optioneel): Het type event. Standaard: '*'.
  - `filters` (Object, optioneel): Filters voor de subscription.
- `callback` (Function): De functie die wordt aangeroepen bij wijzigingen.

#### Retourneert

- (Array<Object>): Array van subscription objecten.

#### Voorbeeld

```javascript
import { subscribeToMultipleTables } from '../utils/realtimeUtils';

// Abonneren op meerdere tabellen
const subscriptions = subscribeToMultipleTables([
  { table: 'help_interactions' },
  { table: 'help_feedback', event: 'INSERT' },
  { table: 'user_experience_feedback' }
], (change) => {
  console.log(`Wijziging in ${change.table}:`, change.payload);
  // Update UI of data
});
```

### unsubscribe

```javascript
unsubscribe(subscription)
```

Meldt een subscription af.

#### Parameters

- `subscription` (Object): Het subscription object dat is geretourneerd door `subscribeToTable`.

#### Voorbeeld

```javascript
import { subscribeToTable, unsubscribe } from '../utils/realtimeUtils';

const subscription = subscribeToTable('help_interactions', handleChange);

// Later afmelden
unsubscribe(subscription);
```

### unsubscribeAll

```javascript
unsubscribeAll(subscriptions)
```

Meldt meerdere subscriptions af.

#### Parameters

- `subscriptions` (Array<Object>): Array van subscription objecten.

#### Voorbeeld

```javascript
import { subscribeToMultipleTables, unsubscribeAll } from '../utils/realtimeUtils';

const subscriptions = subscribeToMultipleTables([
  { table: 'help_interactions' },
  { table: 'help_feedback' }
], handleChange);

// Later alle subscriptions afmelden
unsubscribeAll(subscriptions);
```

## Gebruik in Componenten

De realtimeUtils worden typisch gebruikt in combinatie met React componenten. Hier is een voorbeeld van hoe je deze utils kunt gebruiken in een component:

```jsx
import React, { useEffect, useState } from 'react';
import { subscribeToTable, unsubscribe } from '../utils/realtimeUtils';

const RealTimeComponent = () => {
  const [data, setData] = useState([]);
  const [subscription, setSubscription] = useState(null);
  
  useEffect(() => {
    // Abonneren op wijzigingen
    const sub = subscribeToTable('help_interactions', (payload) => {
      // Update de state wanneer er nieuwe data binnenkomt
      if (payload.eventType === 'INSERT') {
        setData(prevData => [...prevData, payload.new]);
      }
    });
    
    setSubscription(sub);
    
    // Cleanup bij unmount
    return () => {
      if (subscription) {
        unsubscribe(subscription);
      }
    };
  }, []);
  
  return (
    <div>
      {/* Render data */}
    </div>
  );
};
```

## Integratie met RealtimeProvider

Voor een meer gestructureerde aanpak wordt aanbevolen om de `RealtimeProvider` component te gebruiken, die een React Context biedt voor het beheren van real-time updates in de hele applicatie.

```jsx
import { RealtimeProvider, useRealtime } from '../components/help/dashboard/RealtimeProvider';

// In je app of pagina component
const App = () => {
  return (
    <RealtimeProvider onUpdate={handleUpdate}>
      <Dashboard />
    </RealtimeProvider>
  );
};

// In een child component
const Dashboard = () => {
  const { isRealtime, enableRealtime, disableRealtime, refreshData } = useRealtime();
  
  return (
    <div>
      <button onClick={isRealtime ? disableRealtime : enableRealtime}>
        {isRealtime ? 'Schakel real-time uit' : 'Schakel real-time in'}
      </button>
      {/* Rest van de component */}
    </div>
  );
};
```
