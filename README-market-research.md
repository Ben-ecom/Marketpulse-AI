# MarketPulse AI - Market Research Module

Deze module biedt uitgebreide functionaliteit voor marktonderzoek en -analyse, inclusief prijsanalyse, concurrentieanalyse, en het identificeren van gaps en opportunities in de markt.

## Functionaliteiten

De Market Research Module biedt de volgende functionaliteiten:

- **Marktanalyse**: Voer een volledige marktanalyse uit op basis van marktgegevens, inclusief marktomvang, segmentatie, trends, prijsanalyse, en concurrentieanalyse.
- **Marktinzichten**: Genereer inzichten op basis van marktanalyse, inclusief marktoverzicht, belangrijkste kansen, concurrentielandschap, en aanbevelingen.
- **Prijsanalyse**: Analyseer prijsstrategieën, prijsranges, prijselasticiteit, en competitieve prijzen.
- **Concurrentieanalyse**: Analyseer concurrenten, hun positionering, marktaandeel, en genereer SWOT-analyses.
- **Gap-Opportunity Identificatie**: Identificeer gaps en opportunities in de markt op basis van marktomvang, segmentatie, en concurrentieanalyse.
- **Visualisaties**: Genereer visualisatiegegevens voor marktanalyse, inclusief marktsegmentatie, concurrentiepositionering, en marktaandeel distributie.

## Architectuur

De Market Research Module bestaat uit de volgende componenten:

### Backend

- **MarketResearchService**: De hoofdservice voor marktonderzoek en -analyse, inclusief methoden voor marktanalyse, marktinzichten, en visualisaties.
- **PriceAnalyzer**: Component voor het analyseren van prijsstrategieën en prijsranges.
- **CompetitorAnalyzer**: Component voor het analyseren van concurrenten en hun positionering.
- **GapOpportunityIdentifier**: Component voor het identificeren van gaps en opportunities in de markt.
- **API Routes**: RESTful API endpoints voor het uitvoeren van marktanalyses en het genereren van inzichten.

### Frontend

- **MarketResearchPage**: Hoofdpagina voor de marktonderzoeksmodule die het formulier en de resultaten combineert.
- **MarketResearchForm**: Formulier voor het invoeren van marktonderzoeksgegevens.
- **MarketResearchResults**: Component voor het weergeven van marktonderzoeksresultaten.
- **Panels**: Verschillende panelen voor het weergeven van specifieke onderdelen van de marktanalyse, zoals marktoverzicht, concurrenten, kansen, aanbevelingen, en visualisaties.

## API Endpoints

De Market Research Module biedt de volgende API endpoints:

- `POST /api/market-research/analyze`: Voer een marktanalyse uit op basis van de verstrekte gegevens.
- `POST /api/market-research/insights`: Genereer marktinzichten op basis van marktanalyse.
- `POST /api/market-research/price-analysis`: Voer een prijsanalyse uit op basis van de verstrekte gegevens.
- `POST /api/market-research/competitor-analysis`: Voer een concurrentieanalyse uit op basis van de verstrekte gegevens.
- `POST /api/market-research/gap-opportunities`: Identificeer gaps en opportunities in de markt.
- `POST /api/market-research/reports`: Sla een marktonderzoeksrapport op.
- `GET /api/market-research/reports`: Haal alle marktonderzoeksrapporten op voor een gebruiker.
- `GET /api/market-research/reports/:reportId`: Haal een specifiek marktonderzoeksrapport op.
- `POST /api/market-research/visualizations`: Genereer visualisatiegegevens voor marktanalyse.

## Installatie en Gebruik

### Vereisten

- Node.js 18.0.0 of hoger
- Supabase account en project

### Installatie

1. Kloon de repository
2. Installeer de dependencies:
   ```bash
   npm install
   ```
3. Maak een `.env` bestand aan op basis van `.env.example` en vul de benodigde omgevingsvariabelen in:
   ```
   SUPABASE_URL=https://your-supabase-project.supabase.co
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   PORT=3000
   ```

### Starten van de Server

1. Start de server in development mode:
   ```bash
   npm run dev
   ```
2. Start de server in production mode:
   ```bash
   npm start
   ```

### Gebruik

1. Navigeer naar `http://localhost:3000` in je browser
2. Ga naar de Market Research pagina
3. Vul het formulier in met marktgegevens
4. Klik op "Marktanalyse Uitvoeren" om de analyse te starten
5. Bekijk de resultaten in de verschillende tabbladen

## Database Schema

De Market Research Module maakt gebruik van de volgende tabellen in de Supabase database:

- `market_research_reports`: Opgeslagen marktonderzoeksrapporten
  - `id`: UUID (primary key)
  - `user_id`: UUID (foreign key naar auth.users)
  - `title`: String
  - `description`: String
  - `data`: JSON (rapportgegevens)
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

## Row Level Security (RLS) Policies

De volgende RLS policies zijn ingesteld voor de `market_research_reports` tabel:

- **Select Policy**: Gebruikers kunnen alleen hun eigen rapporten zien
  ```sql
  (auth.uid() = user_id)
  ```
- **Insert Policy**: Gebruikers kunnen alleen rapporten invoegen met hun eigen user_id
  ```sql
  (auth.uid() = user_id)
  ```
- **Update Policy**: Gebruikers kunnen alleen hun eigen rapporten bijwerken
  ```sql
  (auth.uid() = user_id)
  ```
- **Delete Policy**: Gebruikers kunnen alleen hun eigen rapporten verwijderen
  ```sql
  (auth.uid() = user_id)
  ```

## Testen

De Market Research Module bevat unit tests voor de verschillende componenten. Je kunt deze tests uitvoeren met:

```bash
npm run test:market-research
```
