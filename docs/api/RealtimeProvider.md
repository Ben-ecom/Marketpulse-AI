# RealtimeProvider en RealtimeToggle API Documentatie

## Overzicht

De `RealtimeProvider` en `RealtimeToggle` componenten bieden een geïntegreerde oplossing voor het implementeren van real-time updates in het Help Metrics Dashboard. Deze componenten maken gebruik van Supabase Realtime om wijzigingen in de database te detecteren en de gebruikersinterface automatisch bij te werken.

## RealtimeProvider

### Beschrijving

`RealtimeProvider` is een React Context Provider die real-time functionaliteit biedt aan alle onderliggende componenten. Het beheert de subscriptions op databasetabellen en zorgt voor het bijwerken van de data wanneer er wijzigingen plaatsvinden.

### Props

| Naam | Type | Beschrijving |
|------|------|-------------|
| children | React.Node | De child componenten die toegang krijgen tot de real-time functionaliteit. |
| onUpdate | Function | Callback functie die wordt aangeroepen wanneer er een update plaatsvindt. Ontvangt een object met informatie over de wijziging. |

### Context Waarden

De RealtimeContext biedt de volgende waarden:

| Naam | Type | Beschrijving |
|------|------|-------------|
| lastUpdate | Date | Timestamp van de laatste update. |
| isRealtime | boolean | Geeft aan of real-time updates zijn ingeschakeld. |
| enableRealtime | Function | Functie om real-time updates in te schakelen. |
| disableRealtime | Function | Functie om real-time updates uit te schakelen. |
| refreshData | Function | Functie om de data handmatig te verversen. |

### Voorbeeld

```jsx
import { RealtimeProvider } from '../components/help/dashboard/RealtimeProvider';

const App = () => {
  const handleUpdate = (change) => {
    console.log('Data is bijgewerkt:', change);
    // Voer acties uit na een update
  };

  return (
    <RealtimeProvider onUpdate={handleUpdate}>
      <Dashboard />
    </RealtimeProvider>
  );
};
```

## useRealtime Hook

### Beschrijving

`useRealtime` is een custom React hook die toegang biedt tot de RealtimeContext. Het kan alleen worden gebruikt binnen componenten die zich binnen een RealtimeProvider bevinden.

### Retourneert

Retourneert een object met de volgende eigenschappen:

| Naam | Type | Beschrijving |
|------|------|-------------|
| lastUpdate | Date | Timestamp van de laatste update. |
| isRealtime | boolean | Geeft aan of real-time updates zijn ingeschakeld. |
| enableRealtime | Function | Functie om real-time updates in te schakelen. |
| disableRealtime | Function | Functie om real-time updates uit te schakelen. |
| refreshData | Function | Functie om de data handmatig te verversen. |

### Voorbeeld

```jsx
import { useRealtime } from '../components/help/dashboard/RealtimeProvider';

const DataComponent = () => {
  const { isRealtime, enableRealtime, disableRealtime, refreshData, lastUpdate } = useRealtime();
  
  return (
    <div>
      <p>Laatste update: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Nooit'}</p>
      <button onClick={isRealtime ? disableRealtime : enableRealtime}>
        {isRealtime ? 'Real-time uitschakelen' : 'Real-time inschakelen'}
      </button>
      <button onClick={refreshData}>Handmatig verversen</button>
    </div>
  );
};
```

## RealtimeToggle

### Beschrijving

`RealtimeToggle` is een UI component die gebruikers in staat stelt om real-time updates in of uit te schakelen. Het toont ook de laatste update tijd en biedt een knop om de data handmatig te verversen.

### Props

Deze component heeft geen props nodig omdat het de useRealtime hook gebruikt om toegang te krijgen tot de RealtimeContext.

### Voorbeeld

```jsx
import { RealtimeProvider } from '../components/help/dashboard/RealtimeProvider';
import RealtimeToggle from '../components/help/dashboard/RealtimeToggle';

const Dashboard = () => {
  return (
    <RealtimeProvider>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <RealtimeToggle />
      </div>
      {/* Rest van het dashboard */}
    </RealtimeProvider>
  );
};
```

## Implementatie Details

### Tabellen

De RealtimeProvider abonneert zich standaard op de volgende tabellen:

- `help_interactions`
- `help_feedback`
- `user_experience_feedback`

### Caching

Wanneer er een wijziging wordt gedetecteerd, wordt de cache voor de betreffende data automatisch gewist via `HelpMetricsService.clearMetricsCache()`. Dit zorgt ervoor dat de volgende data-fetch de meest recente gegevens ophaalt.

### Prestatie Overwegingen

- Real-time updates kunnen de belasting op de server verhogen, vooral bij veel gelijktijdige gebruikers.
- Het is aan te raden om real-time updates alleen in te schakelen wanneer nodig, bijvoorbeeld tijdens actieve monitoring sessies.
- De RealtimeToggle component biedt gebruikers de mogelijkheid om real-time updates uit te schakelen wanneer ze niet nodig zijn.

### Foutafhandeling

De RealtimeProvider bevat ingebouwde foutafhandeling voor subscription fouten. Als er een fout optreedt, wordt deze gelogd in de console en wordt de subscription automatisch opnieuw geprobeerd.

## Integratie met Bestaande Componenten

De RealtimeProvider kan eenvoudig worden geïntegreerd met bestaande componenten door het als wrapper toe te voegen:

```jsx
// Bestaande component
const ExistingComponent = () => {
  // ...
};

// Met real-time functionaliteit
const RealtimeEnabledComponent = () => {
  return (
    <RealtimeProvider>
      <ExistingComponent />
    </RealtimeProvider>
  );
};
```
