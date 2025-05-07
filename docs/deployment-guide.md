# MarketPulse AI - Deployment Guide

Deze gids helpt je bij het deployen van MarketPulse AI naar Supabase (voor Edge Functions) en Render (voor frontend en backend).

## Inhoudsopgave
1. [Supabase Edge Functions Deployment](#supabase-edge-functions-deployment)
2. [Render Deployment](#render-deployment)
3. [Omgevingsvariabelen Configuratie](#omgevingsvariabelen-configuratie)
4. [Post-Deployment Verificatie](#post-deployment-verificatie)
5. [Probleemoplossing](#probleemoplossing)

## Supabase Edge Functions Deployment

De Edge Functions zijn al voorbereid en opgeslagen als ZIP-bestanden in de `dist/edge-functions` directory. Volg deze stappen om ze te deployen naar Supabase:

### 1. Log in op de Supabase Dashboard
- Ga naar [https://app.supabase.io](https://app.supabase.io)
- Log in met je account gegevens

### 2. Selecteer je Project
- Kies het MarketPulse AI project uit de lijst van projecten

### 3. Navigeer naar Edge Functions
- Klik op "Edge Functions" in het linker menu

### 4. Deploy Elke Edge Function
Voor elke van de volgende Edge Functions:
- decodo-scraper
- generate-insights
- generate-recommendations
- scheduled-scraper

Volg deze stappen:
1. Klik op "Create a new function" of "New Function"
2. Vul de volgende gegevens in:
   - **Name**: Gebruik dezelfde naam als de directory (bijv. `generate-recommendations`)
   - **Upload method**: Kies "Upload a file"
   - **File**: Upload het overeenkomstige ZIP-bestand uit de `dist/edge-functions` directory
3. Klik op "Advanced settings" en stel de volgende omgevingsvariabelen in:
   - `SUPABASE_URL`: De URL van je Supabase project (te vinden in de Project Settings)
   - `SUPABASE_SERVICE_ROLE_KEY`: De service role key van je project (te vinden in de Project Settings > API)
4. Klik op "Deploy" of "Create Function"

### 5. Verifieer de Deployment
- Controleer of alle functies de status "Ready" hebben
- Test elke functie door op "Invoke" te klikken met een testpayload

## Render Deployment

Nu de Edge Functions zijn gedeployed, kunnen we de applicatie deployen naar Render met behulp van de `render.yaml` configuratie.

### 1. Maak een Render Account
- Ga naar [https://render.com](https://render.com)
- Maak een account aan of log in als je al een account hebt

### 2. Verbind je GitHub Repository
- Klik op "New" in het Render dashboard
- Kies "Blueprint"
- Verbind je GitHub account als dat nog niet is gedaan
- Selecteer de MarketPulse AI repository

### 3. Deploy via Blueprint
- Klik op "Connect" naast de repository
- Render zal automatisch de `render.yaml` in je repository detecteren
- Controleer de services die worden aangemaakt:
  - marketpulse-ai-frontend (Web Service)
  - marketpulse-ai-api (Web Service)
  - marketpulse-ai-scheduled-scraper (Cron Job)
- Klik op "Apply" of "Create Blueprint"

### 4. Configureer Omgevingsvariabelen
Voor elke service, stel de volgende omgevingsvariabelen in:

**Frontend (marketpulse-ai-frontend)**:
- `VITE_SUPABASE_URL`: Je Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Je Supabase anonieme key

**Backend (marketpulse-ai-api)**:
- `SUPABASE_URL`: Je Supabase project URL
- `SUPABASE_SERVICE_KEY`: Je Supabase service role key
- `DECODO_API_KEY`: Je Decodo API key

**Scheduled Scraper (marketpulse-ai-scheduled-scraper)**:
- `SUPABASE_URL`: Je Supabase project URL
- `SUPABASE_SERVICE_KEY`: Je Supabase service role key
- `DECODO_API_KEY`: Je Decodo API key

### 5. Start de Deployment
- Klik op "Deploy" voor elke service
- Wacht tot alle services zijn gedeployed en de status "Live" hebben

## Omgevingsvariabelen Configuratie

### Supabase Gegevens Vinden
1. Ga naar je Supabase project dashboard
2. Klik op "Settings" in het linker menu
3. Klik op "API" in het submenu
4. Hier vind je:
   - **Project URL**: Dit is je `SUPABASE_URL`
   - **anon public**: Dit is je `VITE_SUPABASE_ANON_KEY`
   - **service_role key**: Dit is je `SUPABASE_SERVICE_KEY`

### Decodo API Key
Gebruik je Decodo API key die je hebt ontvangen bij het aanmaken van je Decodo account.

## Post-Deployment Verificatie

### Controleer de Frontend
- Bezoek de URL van je gedeployde frontend (te vinden in het Render dashboard)
- Controleer of je kunt inloggen
- Verifieer of alle functionaliteiten werken zoals verwacht

### Controleer de Backend API
- Test de API endpoints met tools zoals Postman of cURL
- Controleer de health check endpoint: `https://[jouw-api-url]/api/health`

### Controleer de Edge Functions
- Ga naar je Supabase dashboard > Edge Functions
- Klik op "Logs" voor elke functie om te controleren of er geen fouten zijn

## Probleemoplossing

### Edge Function Fouten
- Controleer de logs in het Supabase dashboard
- Verifieer of de omgevingsvariabelen correct zijn ingesteld
- Zorg ervoor dat de functie de juiste naam heeft

### Render Deployment Fouten
- Controleer de build logs in het Render dashboard
- Verifieer of alle omgevingsvariabelen correct zijn ingesteld
- Controleer of de repository structuur overeenkomt met de paden in `render.yaml`

### Database Connectie Problemen
- Controleer of de Supabase URL en keys correct zijn
- Verifieer of de RLS policies correct zijn ingesteld
- Controleer of de database tabellen correct zijn aangemaakt

### CORS Problemen
- Voeg de Render URLs toe aan de lijst van toegestane origins in je Supabase dashboard
- Ga naar Settings > API > CORS > Allowed Origins

## Volgende Stappen

### Stripe Integratie
Wanneer je klaar bent om betalingsverwerking toe te voegen:
1. Maak een Stripe account aan
2. Installeer de Stripe SDK in je project
3. Implementeer de betalingspagina's en abonnementslogica
4. Configureer webhooks voor betalingsgebeurtenissen

### Migratie naar Railway (Optioneel)
Als je later wilt migreren naar Railway:
1. Maak een Railway account aan
2. Verbind je GitHub repository
3. Configureer de services en omgevingsvariabelen
4. Update de DNS-instellingen om naar de nieuwe deployment te wijzen
