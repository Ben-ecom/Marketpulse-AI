# MarketPulse AI - Supabase Configuratie

Deze directory bevat de configuratie en scripts voor het opzetten van de Supabase infrastructuur voor MarketPulse AI.

## Inhoud

- `config.js` - Configuratiebestand met de definitie van tabellen, RLS policies en storage buckets
- `generate-sql.js` - Script om SQL queries te genereren op basis van de configuratie
- `supabase-setup.sql` - Gegenereerde SQL queries voor het opzetten van de Supabase database
- `.env.example` - Voorbeeld van omgevingsvariabelen voor Supabase

## Stappen voor het opzetten van Supabase

### 1. Maak een Supabase project aan

1. Ga naar [Supabase Dashboard](https://app.supabase.io)
2. Klik op "New Project"
3. Vul de projectgegevens in:
   - **Name**: MarketPulse AI
   - **Database Password**: Kies een sterk wachtwoord
   - **Region**: Kies een regio dicht bij je gebruikers (bijv. eu-central-1)
4. Klik op "Create new project"

### 2. Configureer omgevingsvariabelen

1. Kopieer `.env.example` naar `.env` in de root van het project
2. Vul de Supabase URL en API keys in vanuit je Supabase dashboard
   - De URL en keys zijn te vinden onder Settings > API in je Supabase dashboard

### 3. Genereer en voer SQL queries uit

1. Genereer de SQL queries:
   ```bash
   node config/supabase/generate-sql.js
   ```

2. Open de Supabase SQL Editor in je Supabase dashboard
3. Kopieer en plak de inhoud van `supabase-setup.sql` in de SQL Editor
4. Voer de queries uit

### 4. Configureer authenticatie

1. Ga naar Authentication > Settings in je Supabase dashboard
2. Configureer de volgende instellingen:
   - **Site URL**: URL van je applicatie (bijv. http://localhost:3000 voor development)
   - **Redirect URLs**: Voeg de volgende URLs toe:
     - http://localhost:3000/auth/callback
     - https://marketpulse-ai.render.com/auth/callback (voor productie)
   - **Enable email confirmations**: Aan
   - **Enable email signups**: Aan
   - **Enable Google OAuth**: Aan (optioneel, configureer Google OAuth credentials)

### 5. Configureer storage buckets

De storage buckets worden automatisch aangemaakt door de SQL queries, maar controleer of ze correct zijn geconfigureerd:

1. Ga naar Storage in je Supabase dashboard
2. Controleer of de volgende buckets bestaan:
   - `datasets`
   - `exports`
3. Controleer de toegangsrechten voor elke bucket

## Gebruik van de Supabase client

De Supabase client is geconfigureerd in `/src/utils/supabase.js` en biedt de volgende functionaliteit:

- **auth**: Authenticatie functies (inloggen, registreren, uitloggen, etc.)
- **projects**: CRUD operaties voor projecten
- **scrapeJobs**: Beheer van scraping jobs
- **scrapeResults**: Opslag en ophalen van scraping resultaten
- **insights**: Beheer van gegenereerde inzichten
- **storage**: Bestandsopslag en -beheer

Voorbeeld van gebruik:

```javascript
import { auth, projects } from '../utils/supabase';

// Inloggen
const { data, error } = await auth.signInWithEmail('user@example.com', 'password');

// Projecten ophalen
const userProjects = await projects.getAll();
```

## Tabellen

De volgende tabellen worden aangemaakt:

- **users**: Gebruikersprofielen (gekoppeld aan auth.users)
- **projects**: Projecten aangemaakt door gebruikers
- **scrape_jobs**: Scraping jobs voor verschillende platforms
- **scrape_results**: Resultaten van scraping jobs
- **insights**: Gegenereerde inzichten op basis van scraping resultaten

## Row Level Security (RLS)

Alle tabellen zijn beveiligd met Row Level Security (RLS) policies om ervoor te zorgen dat gebruikers alleen toegang hebben tot hun eigen data:

- Gebruikers kunnen alleen hun eigen profiel zien en bewerken
- Gebruikers kunnen alleen hun eigen projecten beheren
- Gebruikers kunnen alleen scraping jobs en resultaten zien die bij hun projecten horen

## Storage Buckets

De volgende storage buckets worden aangemaakt:

- **datasets**: Voor het opslaan van ruwe scraping data
- **exports**: Voor het opslaan van exports en rapporten

Beide buckets zijn beveiligd met RLS policies om ervoor te zorgen dat gebruikers alleen toegang hebben tot hun eigen bestanden.
