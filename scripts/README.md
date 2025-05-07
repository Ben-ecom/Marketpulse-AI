# MarketPulse AI Scripts

Deze map bevat verschillende scripts voor het MarketPulse AI platform.

## Test Edge Functions Script

Het `test-edge-functions.js` script is ontworpen om de Edge Functions voor de Decodo API integratie te testen. Het script voert verschillende test cases uit om te verifiëren dat de Edge Functions correct werken.

### Vereisten

- Node.js (v14 of hoger)
- NPM of Yarn

### Installatie

1. Installeer de benodigde dependencies:
   ```bash
   npm install
   # of
   yarn install
   ```

2. Maak een kopie van het `.env.example` bestand en hernoem het naar `.env`:
   ```bash
   cp .env.example .env
   ```

3. Vul de juiste waarden in voor de environment variables in het `.env` bestand:
   ```
   SUPABASE_URL=https://iyeyypnvcickhdlqvhqq.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   DECODO_API_KEY=your_decodo_api_key_here
   ```

### Gebruik

Start het test script met:

```bash
npm run test-edge-functions
# of
yarn test-edge-functions
# of direct
node test-edge-functions.js
```

Het script zal je door de volgende stappen leiden:

1. Selecteren van een bestaand project of aanmaken van een nieuw test project
2. Kiezen van een platform om te testen (Reddit, Amazon, Instagram, TikTok, Trustpilot, of alle platforms)
3. Selecteren van een test type:
   - Synchrone scraping
   - Asynchrone scraping
   - Aanbevelingen genereren
   - Awareness fase aanbevelingen genereren
   - Alle tests

Na het uitvoeren van de tests zal het script een samenvatting tonen van de resultaten.

### Troubleshooting

Als je problemen ondervindt bij het uitvoeren van het script, controleer dan het volgende:

1. Zorg ervoor dat de Edge Functions correct zijn gedeployed naar Supabase
2. Controleer of de Supabase URL en API key correct zijn ingesteld in het `.env` bestand
3. Zorg ervoor dat de Decodo API key geldig is
4. Controleer of de benodigde tabellen in de database bestaan:
   - `projects`
   - `scrape_jobs`
   - `scrape_results`
   - `recommendations`
   - `marketing_strategies`

### Databaseschema

Het test script maakt gebruik van de volgende tabellen:

1. **projects**: Bevat projectgegevens
   - `id`: UUID (primary key)
   - `name`: String
   - `description`: String
   - `niche`: String
   - `status`: String
   - `created_at`: Timestamp

2. **scrape_jobs**: Houdt scraping taken bij
   - `id`: UUID (primary key)
   - `project_id`: UUID (foreign key naar projects)
   - `platform`: String (reddit, amazon, instagram, tiktok, trustpilot)
   - `content_type`: String (page, post, comment, review, etc.)
   - `status`: String (pending, completed, failed)
   - `params`: JSON (url, task_id, batch_id, etc.)
   - `created_at`: Timestamp

3. **scrape_results**: Slaat scraping resultaten op
   - `id`: UUID (primary key)
   - `scrape_job_id`: UUID (foreign key naar scrape_jobs)
   - `platform`: String (reddit, amazon, instagram, tiktok, trustpilot)
   - `content_type`: String (page, post, comment, review, etc.)
   - `raw_data`: JSON (de ruwe data van de scraping)
   - `processed_data`: JSON (de verwerkte data)
   - `sentiment`: JSON (sentiment analyse resultaten)
   - `created_at`: Timestamp

4. **recommendations**: Slaat aanbevelingen op
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

5. **marketing_strategies**: Bevat niche-specifieke marketingstrategieën
   - `id`: UUID (primary key)
   - `platform`: String (reddit, amazon, instagram, tiktok, trustpilot, all)
   - `niche`: String (e-commerce, saas, health, finance, etc.)
   - `title`: String
   - `description`: String
   - `strategy_text`: String
   - `priority`: String (high, medium, low)
   - `implementation_steps`: Array
   - `created_at`: Timestamp