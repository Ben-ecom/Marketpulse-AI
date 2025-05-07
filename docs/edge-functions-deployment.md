# Deployen van Edge Functions naar Supabase

Dit document beschrijft het proces voor het deployen van de MarketPulse AI Edge Functions naar Supabase.

## Inhoudsopgave

1. [Vereisten](#vereisten)
2. [Installatie van de Supabase CLI](#installatie-van-de-supabase-cli)
3. [Configuratie](#configuratie)
4. [Database Migratie](#database-migratie)
5. [Deployen van Edge Functions](#deployen-van-edge-functions)
6. [Testen van Edge Functions](#testen-van-edge-functions)
7. [Problemen Oplossen](#problemen-oplossen)

## Vereisten

Voordat je begint, zorg ervoor dat je het volgende hebt:

- Een Supabase account en project
- Node.js (v14 of hoger)
- NPM of Yarn
- Een Decodo API key

## Installatie van de Supabase CLI

De Supabase CLI is nodig om Edge Functions te deployen. Installeer het met:

```bash
# Met NPM
npm install -g supabase

# Met Yarn
yarn global add supabase
```

Controleer of de installatie succesvol was:

```bash
supabase --version
```

## Configuratie

1. Log in op je Supabase account:

```bash
supabase login
```

2. Initialiseer Supabase in je project (als dit nog niet is gedaan):

```bash
cd /pad/naar/je/project
supabase init
```

3. Link je lokale project aan je Supabase project:

```bash
supabase link --project-ref <project-id>
```

Je kunt je project ID vinden in de URL van je Supabase dashboard: `https://app.supabase.com/project/<project-id>`

4. Configureer de benodigde secrets:

```bash
supabase secrets set DECODO_API_KEY=<your-decodo-api-key>
```

## Database Migratie

Voer de database migratie uit om de benodigde tabellen aan te maken:

```bash
cd /pad/naar/je/project
supabase db push
```

Dit zal het migratiescript in `supabase/migrations/20250507_decodo_api_integration.sql` uitvoeren.

Als je liever handmatig de migratie uitvoert, kun je het SQL script kopiëren en plakken in de SQL Editor in het Supabase dashboard.

## Deployen van Edge Functions

1. Deploy de decodo-scraper Edge Function:

```bash
supabase functions deploy decodo-scraper --no-verify-jwt
```

2. Deploy de generate-recommendations Edge Function:

```bash
supabase functions deploy generate-recommendations --no-verify-jwt
```

De `--no-verify-jwt` optie zorgt ervoor dat de functies kunnen worden aangeroepen zonder JWT authenticatie. In een productieomgeving wil je mogelijk wel JWT verificatie inschakelen voor betere beveiliging.

## Testen van Edge Functions

Je kunt de Edge Functions testen met het test script in de `scripts` map:

```bash
cd /pad/naar/je/project/scripts
npm install
npm run test-edge-functions
```

Je kunt de functies ook direct testen met curl:

```bash
# Test de decodo-scraper functie
curl -X POST 'https://<project-id>.supabase.co/functions/v1/decodo-scraper' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <anon-key>' \
  -d '{"action":"scrape_sync","url":"https://www.reddit.com/r/DutchFIRE/","platform":"reddit"}'

# Test de generate-recommendations functie
curl -X POST 'https://<project-id>.supabase.co/functions/v1/generate-recommendations' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <anon-key>' \
  -d '{"action":"generate_recommendations","projectId":"<project-id>"}'
```

## Problemen Oplossen

### Veelvoorkomende problemen

1. **Fout bij het deployen van Edge Functions**

   Controleer of je de juiste Supabase CLI versie gebruikt:

   ```bash
   supabase --version
   ```

   Als je een oudere versie gebruikt, update dan naar de nieuwste versie:

   ```bash
   npm install -g supabase@latest
   ```

2. **Fout bij het aanroepen van Edge Functions**

   Controleer of de Edge Function correct is gedeployed:

   ```bash
   supabase functions list
   ```

   Controleer de logs van de Edge Function:

   ```bash
   supabase functions logs decodo-scraper
   ```

3. **Database fouten**

   Controleer of de benodigde tabellen bestaan in je database. Je kunt dit doen via het Supabase dashboard in de Table Editor.

   Als de tabellen niet bestaan, voer dan de database migratie opnieuw uit.

4. **Secrets niet beschikbaar in Edge Functions**

   Controleer of de secrets correct zijn ingesteld:

   ```bash
   supabase secrets list
   ```

   Als de DECODO_API_KEY niet in de lijst staat, stel deze dan opnieuw in:

   ```bash
   supabase secrets set DECODO_API_KEY=<your-decodo-api-key>
   ```

### Logs bekijken

Je kunt de logs van de Edge Functions bekijken om problemen te diagnosticeren:

```bash
# Bekijk logs van de decodo-scraper functie
supabase functions logs decodo-scraper

# Bekijk logs van de generate-recommendations functie
supabase functions logs generate-recommendations
```

### Support

Als je problemen ondervindt die je niet kunt oplossen, kun je:

1. De [Supabase documentatie](https://supabase.com/docs) raadplegen
2. De [Supabase GitHub repository](https://github.com/supabase/supabase) bezoeken
3. De [Supabase Discord community](https://discord.supabase.com) om hulp vragen
4. Een issue aanmaken in de MarketPulse AI repository