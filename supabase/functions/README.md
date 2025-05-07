# MarketPulse AI Edge Functions

Deze map bevat de Edge Functions voor het MarketPulse AI platform. Deze functies worden uitgevoerd op Supabase en bieden serverless functionaliteit voor het platform.

## Overzicht

De volgende Edge Functions zijn beschikbaar:

1. **decodo-scraper**: Handelt scraping requests af via de Decodo API en slaat de resultaten op in de database.
2. **generate-recommendations**: Analyseert scraping resultaten en genereert marketingaanbevelingen op basis van de verzamelde data.

## Vereisten

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Deno](https://deno.land/) (wordt automatisch geïnstalleerd met de Supabase CLI)

## Configuratie

Voordat je de Edge Functions kunt deployen, moet je de volgende configuratie uitvoeren:

1. Zorg ervoor dat je de Supabase CLI hebt geïnstalleerd:
   ```bash
   npm install -g supabase
   ```

2. Log in op je Supabase account:
   ```bash
   supabase login
   ```

3. Link je project met de Supabase CLI:
   ```bash
   supabase link --project-ref <project-id>
   ```

4. Configureer de benodigde secrets:
   ```bash
   supabase secrets set DECODO_API_KEY=<your-decodo-api-key>
   ```

## Deployen

Om de Edge Functions te deployen, voer je de volgende commando's uit:

```bash
# Deploy de decodo-scraper functie
supabase functions deploy decodo-scraper --no-verify-jwt

# Deploy de generate-recommendations functie
supabase functions deploy generate-recommendations --no-verify-jwt
```

De `--no-verify-jwt` optie zorgt ervoor dat de functies kunnen worden aangeroepen zonder JWT authenticatie. In een productieomgeving wil je mogelijk wel JWT verificatie inschakelen voor betere beveiliging.

## Testen

Je kunt de Edge Functions testen met de DecodoTester component in de frontend applicatie. Deze component is beschikbaar op `/admin/decodo-tester`.

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

## Lokaal Ontwikkelen

Je kunt de Edge Functions lokaal draaien voor ontwikkeling:

```bash
# Start de lokale Supabase server
supabase start

# Start de decodo-scraper functie lokaal
supabase functions serve decodo-scraper --no-verify-jwt

# Start de generate-recommendations functie lokaal
supabase functions serve generate-recommendations --no-verify-jwt
```

## Databaseschema

De Edge Functions maken gebruik van de volgende tabellen:

1. **scrape_jobs**: Houdt scraping taken bij
   - `id`: UUID (primary key)
   - `project_id`: UUID (foreign key naar projects)
   - `platform`: String (reddit, amazon, instagram, tiktok, trustpilot)
   - `content_type`: String (page, post, comment, review, etc.)
   - `status`: String (pending, completed, failed)
   - `params`: JSON (url, task_id, batch_id, etc.)
   - `created_at`: Timestamp

2. **scrape_results**: Slaat scraping resultaten op
   - `id`: UUID (primary key)
   - `scrape_job_id`: UUID (foreign key naar scrape_jobs)
   - `platform`: String (reddit, amazon, instagram, tiktok, trustpilot)
   - `content_type`: String (page, post, comment, review, etc.)
   - `raw_data`: JSON (de ruwe data van de scraping)
   - `processed_data`: JSON (de verwerkte data)
   - `sentiment`: JSON (sentiment analyse resultaten)
   - `created_at`: Timestamp

3. **recommendations**: Slaat aanbevelingen op
   - `id`: UUID (primary key)
   - `project_id`: UUID (foreign key naar projects)
   - `platform`: String (reddit, amazon, instagram, tiktok, trustpilot, awareness)
   - `phase`: String (unaware, problem_aware, solution_aware, product_aware, most_aware)
   - `title`: String
   - `description`: String
   - `strategy_text`: String
   - `priority`: String (high, medium, low)
   - `implementation_steps`: Array
   - `status`: String (pending, implemented, rejected)
   - `created_at`: Timestamp

4. **marketing_strategies**: Bevat niche-specifieke marketingstrategieën
   - `id`: UUID (primary key)
   - `platform`: String (reddit, amazon, instagram, tiktok, trustpilot, all)
   - `niche`: String (e-commerce, saas, health, finance, etc.)
   - `title`: String
   - `description`: String
   - `strategy_text`: String
   - `priority`: String (high, medium, low)
   - `implementation_steps`: Array
   - `created_at`: Timestamp

## Problemen Oplossen

Als je problemen ondervindt bij het deployen of uitvoeren van de Edge Functions, controleer dan het volgende:

1. Zorg ervoor dat de Supabase CLI correct is geïnstalleerd en geconfigureerd.
2. Controleer of de benodigde secrets zijn ingesteld.
3. Controleer de logs van de Edge Functions:
   ```bash
   supabase functions logs decodo-scraper
   supabase functions logs generate-recommendations
   ```
4. Zorg ervoor dat de benodigde tabellen in de database bestaan.
5. Controleer of de Decodo API key geldig is.

## Bijdragen

Als je wilt bijdragen aan de Edge Functions, volg dan deze stappen:

1. Fork de repository
2. Maak een nieuwe branch voor je wijzigingen
3. Voer je wijzigingen door
4. Maak een pull request

## Licentie

Dit project is gelicentieerd onder de MIT licentie.