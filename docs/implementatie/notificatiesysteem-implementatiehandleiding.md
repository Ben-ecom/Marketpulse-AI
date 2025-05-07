# Implementatiehandleiding Notificatiesysteem

Deze handleiding beschrijft de stappen voor het implementeren en testen van het notificatiesysteem voor het Help Metrics Dashboard. De handleiding volgt de gestructureerde aanpak zoals beschreven in het Context7 Framework en de TaskMaster methodologie.

## Inhoudsopgave

1. [Technische Haalbaarheid](#technische-haalbaarheid)
2. [Implementatiestappen](#implementatiestappen)
3. [Database Migratie](#database-migratie)
4. [Testen](#testen)
5. [Troubleshooting](#troubleshooting)

## Technische Haalbaarheid

Het notificatiesysteem is geïmplementeerd met de volgende technologieën:

- **Frontend**: React, Material-UI, Context API
- **Backend**: Supabase (PostgreSQL, Row Level Security)
- **Dataopslag**: PostgreSQL tabellen voor notificatie-instellingen en notificaties
- **Caching**: Lokale caching voor betere prestaties

De implementatie is technisch haalbaar en maakt gebruik van bestaande infrastructuur en technologieën die al in het project worden gebruikt.

## Implementatiestappen

### T1: Voorbereiding (Prioriteit: Hoog)

1. Zorg ervoor dat alle benodigde bestanden zijn aangemaakt:
   - `/frontend/src/services/help/NotificationService.js`
   - `/frontend/src/contexts/NotificationContext.jsx`
   - `/frontend/src/components/help/dashboard/NotificationBell.jsx`
   - `/frontend/src/components/help/dashboard/personalization/NotificationsTab.jsx`
   - `/backend/migrations/20250506_add_notification_tables.sql`

2. Controleer of de benodigde dependencies zijn geïnstalleerd:
   - `date-fns` voor datumformattering
   - `@mui/material` voor UI componenten

### T2: Database Migratie (Prioriteit: Hoog)

1. Voer het SQL script uit om de benodigde tabellen aan te maken:
   - `notification_settings` tabel voor het opslaan van gebruikersvoorkeuren
   - `notifications` tabel voor het opslaan van gegenereerde notificaties

2. Controleer of de Row Level Security correct is geconfigureerd

### T3: Frontend Integratie (Prioriteit: Hoog)

1. Zorg ervoor dat de NotificationProvider is toegevoegd aan de App component
2. Controleer of de NotificationBell is toegevoegd aan de HelpMetricsDashboard component
3. Controleer of de NotificationsTab is toegevoegd aan het DashboardPersonalizationModal

### T4: Testen (Prioriteit: Hoog)

1. Test de notificatie-instellingen (toevoegen, bewerken, verwijderen van drempelwaarden)
2. Test het genereren van notificaties
3. Test het weergeven en beheren van notificaties

### T5: Documentatie (Prioriteit: Medium)

1. Zorg ervoor dat de API documentatie is bijgewerkt
2. Zorg ervoor dat de gebruikershandleiding is bijgewerkt

## Database Migratie

De database migratie kan worden uitgevoerd met het script `scripts/run-notification-migration.js`. Dit script leest het SQL bestand en voert het uit op de Supabase database.

### Voorbereiding

1. Zorg ervoor dat de volgende omgevingsvariabelen zijn ingesteld in het `.env` bestand:
   - `SUPABASE_URL`: De URL van je Supabase project
   - `SUPABASE_SERVICE_KEY`: De service key van je Supabase project

### Uitvoeren

```bash
# Navigeer naar de projectmap
cd /Users/benomarlaamiri/Documents/MarketPulse\ AI

# Installeer benodigde dependencies (indien nog niet gedaan)
npm install @supabase/supabase-js dotenv

# Voer het migratiescript uit
node scripts/run-notification-migration.js
```

### Verificatie

Na het uitvoeren van de migratie, controleer of de tabellen correct zijn aangemaakt:

1. Log in op het Supabase dashboard
2. Ga naar de Table Editor
3. Controleer of de tabellen `notification_settings` en `notifications` aanwezig zijn
4. Controleer of de Row Level Security policies correct zijn geconfigureerd

## Testen

Het testen van het notificatiesysteem kan worden gedaan met het script `scripts/test-notification-system.js`. Dit script maakt testgebruikers aan, stelt drempelwaarden in en genereert testnotificaties.

### Voorbereiding

1. Zorg ervoor dat de volgende omgevingsvariabelen zijn ingesteld in het `.env` bestand:
   - `SUPABASE_URL`: De URL van je Supabase project
   - `SUPABASE_SERVICE_KEY`: De service key van je Supabase project
   - `TEST_USER_ID`: De ID van een testgebruiker

### Uitvoeren

```bash
# Navigeer naar de projectmap
cd /Users/benomarlaamiri/Documents/MarketPulse\ AI

# Voer het testscript uit
node scripts/test-notification-system.js
```

### Handmatig Testen

Voor handmatig testen, volg het testplan in `docs/testing/notificatie-systeem-testplan.md`. Dit plan bevat gedetailleerde testscenario's voor het valideren van de functionaliteit.

## Troubleshooting

### Probleem: Database tabellen worden niet aangemaakt

**Oplossing:**
1. Controleer of de Supabase URL en Service Key correct zijn ingesteld
2. Controleer of het SQL script geen syntaxfouten bevat
3. Probeer het SQL script handmatig uit te voeren in de SQL Editor van Supabase

### Probleem: Notificaties worden niet gegenereerd

**Oplossing:**
1. Controleer of de NotificationService correct is geïmplementeerd
2. Controleer of de drempelwaarden correct zijn ingesteld
3. Controleer of de `checkThresholds` functie wordt aangeroepen

### Probleem: Notificaties worden niet weergegeven

**Oplossing:**
1. Controleer of de NotificationBell component correct is geïmplementeerd
2. Controleer of de NotificationContext correct is geconfigureerd
3. Controleer of de gebruiker is ingelogd en de juiste rechten heeft

### Probleem: Notificatie-instellingen worden niet opgeslagen

**Oplossing:**
1. Controleer of de NotificationsTab component correct is geïmplementeerd
2. Controleer of de saveUserNotificationSettings functie correct werkt
3. Controleer of de gebruiker is ingelogd en de juiste rechten heeft

## Conclusie

Met deze handleiding kun je het notificatiesysteem voor het Help Metrics Dashboard implementeren en testen. Het systeem biedt gebruikers de mogelijkheid om op de hoogte te blijven van belangrijke veranderingen in het help systeem, wat de gebruikerservaring verbetert en ervoor zorgt dat gebruikers proactief kunnen reageren op veranderingen in de metrics.

Bij vragen of problemen, raadpleeg de API documentatie in `docs/api/NotificationService.md` of de gebruikershandleiding in `docs/gebruikershandleidingen/help-metrics-notificaties.md`.
