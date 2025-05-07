# MarketPulse AI

MarketPulse AI is een SaaS-applicatie voor marktonderzoek en consumenteninzichten. De applicatie analyseert data van Reddit en Amazon om klantpijnpunten, verlangens en markttrends te identificeren.

## Functionaliteiten

- **Gebruikersinterface & Workflow**: Inlogscherm, onboarding, dashboard, project aanmaken
- **Dataverzameling**: Reddit en Amazon data verzameling, marktgrootte analyse
- **Analyse Engine**: Tekstvoorverwerking, sentiment analyse, thematische analyse
- **Rapportage Dashboard**: Hoofddashboard, pijnpunten & verlangens dashboard, marktinzicht dashboard
- **Trending Topics Dashboard**: Visualisatie van trending topics met awareness fase analyse
- **Marketingactivatie**: Inzicht naar actie omzetter, implementatie planner

## Technische Stack

- **Backend**: Node.js, Express, GraphQL, Supabase
- **Frontend**: React, Redux, Material-UI
- **Database**: PostgreSQL (via Supabase)
- **Hosting**: Render
- **Containerisatie**: Docker, Docker Compose

## Installatie

### Vereisten

- Node.js (v18 of hoger)
- npm (v8 of hoger)
- Docker en Docker Compose (optioneel, voor containerisatie)
- Supabase account

### Lokale ontwikkeling

1. **Clone de repository**

```bash
git clone <repository-url>
cd MarketPulse\ AI
```

2. **Backend setup**

```bash
cd backend
npm install
cp .env.example .env
# Vul de juiste waarden in in het .env bestand
npm run dev
```

3. **Frontend setup**

```bash
cd frontend
npm install
cp .env.example .env
# Vul de juiste waarden in in het .env bestand
npm run dev
```

4. **Supabase setup**

- Maak een nieuw project aan in Supabase
- Voer de SQL-scripts uit in de `database/migrations` map om de benodigde tabellen aan te maken
- Kopieer de URL en anonieme sleutel naar je .env bestanden

### Met Docker

```bash
# Maak een .env bestand aan in de hoofdmap met de volgende variabelen:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_KEY=your-service-key
# JWT_SECRET=your-jwt-secret

# Start de containers
docker-compose up -d
```

## Deployment op Render

1. Maak een nieuw Web Service aan in Render
2. Verbind met je GitHub repository
3. Kies voor Docker als deployment methode
4. Voeg de benodigde omgevingsvariabelen toe
5. Deploy de applicatie

## Projectstructuur

```
MarketPulse AI/
├── backend/                # Node.js Express backend
│   ├── src/
│   │   ├── config/         # Configuratie bestanden
│   │   ├── graphql/        # GraphQL schema en resolvers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functies
│   │   └── index.js        # Applicatie startpunt
│   ├── .env.example        # Voorbeeld omgevingsvariabelen
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/            # API integratie
│   │   ├── assets/         # Statische bestanden
│   │   ├── components/     # React componenten
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Pagina componenten
│   │   ├── store/          # State management
│   │   └── utils/          # Utility functies
│   ├── .env.example        # Voorbeeld omgevingsvariabelen
│   └── package.json        # Frontend dependencies
├── docker/                 # Docker configuratie
├── k8s/                    # Kubernetes configuratie
├── data-analysis/          # Python data analyse scripts
├── docker-compose.yml      # Docker Compose configuratie
└── README.md               # Project documentatie
```

## Installatie en Configuratie

Volg deze stappen om MarketPulse AI lokaal te installeren en configureren voor ontwikkeling of productie.

### Vereisten

- Node.js (v16.x of hoger)
- npm (v8.x of hoger) of yarn (v1.22.x of hoger)
- MongoDB (v5.0 of hoger)
- Docker en Docker Compose (voor containerized deployment)

### Lokale Ontwikkelomgeving

1. **Clone de repository**

```bash
git clone https://github.com/yourusername/marketpulse-ai.git
cd marketpulse-ai
```

2. **Installeer dependencies**

```bash
# Backend dependencies installeren
cd backend
npm install

# Frontend dependencies installeren
cd ../frontend
npm install
```

3. **Configureer environment variables**

Maak een `.env` bestand in zowel de backend als frontend directory:

**Backend (.env)**
```
MONGODB_URI=mongodb://localhost:27017/marketpulse
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

4. **Start de development servers**

```bash
# Start backend server (vanuit backend directory)
npm run dev

# Start frontend server (vanuit frontend directory)
npm start
```

De frontend applicatie is nu beschikbaar op `http://localhost:3000` en de backend API op `http://localhost:5000`.

### Productie Deployment

1. **Build de applicatie**

```bash
# Backend build (vanuit backend directory)
npm run build

# Frontend build (vanuit frontend directory)
npm run build
```

2. **Docker Deployment**

Gebruik Docker Compose om de volledige stack te deployen:

```bash
# Vanuit root directory
docker-compose up -d
```

### API Keys Configuratie

Voor bepaalde functionaliteiten zijn externe API keys nodig. Configureer deze in het `.env` bestand van de backend:

```
# Proxy service voor web scraping
PROXY_API_KEY=your_proxy_api_key

# NLP services
OPENAI_API_KEY=your_openai_api_key
```

### Database Configuratie

MarketPulse AI gebruikt MongoDB als primaire database. Zorg ervoor dat je MongoDB hebt geïnstalleerd en draaiend is. De applicatie zal automatisch de benodigde collections aanmaken bij de eerste start.

Voor productie-omgevingen raden we aan om MongoDB Atlas te gebruiken voor betere schaalbaarheid en beveiliging.

## Trending Topics Dashboard met Awareness Fase Analyse

De Trending Topics Dashboard is een krachtige functionaliteit binnen MarketPulse AI die trending onderwerpen visualiseert en analyseert op basis van awareness fasen. Deze integratie helpt marketeers om effectievere content strategieën te ontwikkelen die aansluiten bij de awareness fase van hun doelgroep.

### Belangrijkste Componenten

- **TrendingTopicsWordCloud**: Visualiseert trending topics in een interactieve word cloud.
- **TrendingTopicsBarChart**: Toont trending topics in een bar chart formaat voor kwantitatieve vergelijking.
- **TrendingTopicsTimeline**: Visualiseert de evolutie van trending topics over tijd.
- **TrendingTopicsComparison**: Vergelijkt trending topics tussen verschillende platforms.
- **TopicAwarenessAnalyzer**: Analyseert trending topics in relatie tot awareness fasen.
- **TopicAwarenessMatrix**: Visualiseert trending topics per awareness fase.
- **TopicAwarenessRecommendations**: Genereert content aanbevelingen per awareness fase.
- **TopicAwarenessReport**: Genereert gedetailleerde rapporten met executive summary.

### Awareness Fasen

De analyse is gebaseerd op de 5 awareness fasen van Eugene Schwartz:

1. **Unaware**: Doelgroep is zich niet bewust van het probleem of de behoefte.
2. **Problem Aware**: Doelgroep is zich bewust van het probleem, maar niet van mogelijke oplossingen.
3. **Solution Aware**: Doelgroep kent mogelijke oplossingen, maar niet jouw specifieke product.
4. **Product Aware**: Doelgroep kent jouw product, maar is nog niet overtuigd.
5. **Most Aware**: Doelgroep kent jouw product en is klaar om te kopen.

### Gebruik

1. Navigeer naar de Trending Topics Dashboard in de navigatiebalk.
2. Bekijk de verschillende visualisaties van trending topics.
3. Ga naar de "Awareness Analyse" tab om de awareness fase analyse te bekijken.
4. Gebruik de personalisatie opties om aanbevelingen aan te passen aan jouw product en industrie.
5. Genereer en exporteer rapporten voor presentaties en strategische planning.

### Technische Implementatie

De functionaliteit is geïmplementeerd met React componenten en maakt gebruik van verschillende visualisatie bibliotheken zoals D3.js. De data processing en analyse wordt uitgevoerd door utility functies in de `utils/insights` directory.

## Export Functionaliteit

MarketPulse AI biedt geavanceerde exportmogelijkheden voor alle analyses en rapporten. Deze functionaliteit stelt gebruikers in staat om inzichten te delen met stakeholders en te integreren in presentaties en strategiedocumenten.

### Ondersteunde Export Formaten

- **PDF Export**: Genereert professioneel opgemaakte PDF documenten met headers, secties, tabellen en grafieken.
- **Excel Export**: Exporteert data naar Excel werkbladen voor verdere analyse en bewerking.

### Export Utilities

De export functionaliteit is geïmplementeerd via de volgende componenten:

- **ExportButton Component**: Een interactieve knop die configuratie-opties biedt voor het exporteren van data.
- **PDF Export Utilities**: Functies voor het creëren van PDF documenten met jsPDF.
  - `createPdfDocument`: Maakt een nieuw PDF document
  - `addPdfHeader`: Voegt een header toe met titel en project info
  - `addPdfSection`: Voegt een tekstsectie toe
  - `addPdfTable`: Voegt een tabel toe
  - `addPdfChart`: Voegt een chart afbeelding toe
- **Excel Export Utilities**: Functies voor het exporteren naar Excel met xlsx.
  - `createExcelWorkbook`: Maakt een nieuw Excel werkboek
  - `addExcelWorksheet`: Voegt een werkblad toe
  - `exportExcelWorkbook`: Exporteert het werkboek naar een bestand

### Configuratie Opties

Gebruikers kunnen de volgende aspecten van de exports configureren:

- Selectie van secties om te exporteren
- Inclusie van grafieken, ruwe data en samenvattingen
- PDF oriëntatie (staand/liggend)
- Bestandsnaam en formattering

### Gebruik

1. Navigeer naar een rapport of analyse pagina zoals de Trending Topics Dashboard.
2. Klik op de "Exporteren" knop in de rapportsectie.
3. Configureer de gewenste export opties.
4. Klik op "Exporteren" om het bestand te genereren en downloaden.

## Gebruikershandleiding

Deze sectie biedt een stap-voor-stap handleiding voor het gebruik van MarketPulse AI.

### Aan de slag

1. **Inloggen**
   - Ga naar de MarketPulse AI webapplicatie
   - Log in met je gebruikersnaam en wachtwoord
   - Als je nog geen account hebt, klik op "Registreren" om een nieuw account aan te maken

2. **Dashboard Navigatie**
   - Na het inloggen kom je op het hoofddashboard
   - Gebruik de navigatiebalk aan de linkerkant om tussen verschillende secties te navigeren
   - De belangrijkste secties zijn:
     - Projecten: Beheer je onderzoeksprojecten
     - Data Verzameling: Verzamel data van verschillende platforms
     - Analyses: Bekijk en genereer analyses
     - Rapporten: Genereer en exporteer rapporten
     - Instellingen: Beheer je account en voorkeuren

### Projecten Beheren

1. **Nieuw Project Aanmaken**
   - Klik op "Nieuw Project" in de Projecten sectie
   - Vul de projectnaam, beschrijving en niche/industrie in
   - Selecteer de platforms waarvan je data wilt verzamelen
   - Klik op "Aanmaken" om het project te starten

2. **Project Instellingen Configureren**
   - Open een bestaand project
   - Klik op "Instellingen" in het projectmenu
   - Configureer de volgende opties:
     - Zoekwoorden voor dataverzameling
     - Tijdsperiode voor analyse
     - Concurrenten voor vergelijking
     - Notificatie-instellingen

### Data Verzamelen

1. **Handmatige Dataverzameling**
   - Ga naar de "Data Verzameling" sectie in je project
   - Selecteer het platform (Reddit, Amazon, Instagram/TikTok, Trustpilot)
   - Configureer de zoekcriteria en filters
   - Klik op "Start Verzameling" om de data te verzamelen

2. **Geplande Dataverzameling**
   - Ga naar "Geplande Taken" in de projectinstellingen
   - Klik op "Nieuwe Taak" om een geplande dataverzameling in te stellen
   - Configureer de frequentie (dagelijks, wekelijks, maandelijks)
   - Stel de parameters in en klik op "Opslaan"

### Analyses Uitvoeren

1. **Trending Topics Analyse**
   - Ga naar de "Analyses" sectie in je project
   - Klik op "Trending Topics Analyse"
   - Selecteer de tijdsperiode en platforms
   - Klik op "Analyse Uitvoeren"
   - Bekijk de resultaten in de Trending Topics Dashboard

2. **Awareness Fase Analyse**
   - Ga naar de "Analyses" sectie in je project
   - Klik op "Awareness Fase Analyse"
   - Configureer de parameters en klik op "Analyse Uitvoeren"
   - Bekijk de resultaten in de Awareness Fase Dashboard
   - Gebruik de aanbevelingen voor je marketingstrategie

3. **Sentiment Analyse**
   - Ga naar de "Analyses" sectie in je project
   - Klik op "Sentiment Analyse"
   - Selecteer de data en parameters
   - Klik op "Analyse Uitvoeren"
   - Bekijk de sentiment verdeling en trends

### Rapporten Genereren

1. **Rapport Configureren**
   - Ga naar de "Rapporten" sectie in je project
   - Klik op "Nieuw Rapport"
   - Selecteer het rapporttype (Executive Summary, Volledig Rapport, Custom)
   - Configureer de secties en inhoud

2. **Rapport Exporteren**
   - Bekijk het gegenereerde rapport
   - Klik op "Exporteren" in de rapportweergave
   - Selecteer het formaat (PDF, Excel)
   - Configureer de export opties
   - Klik op "Exporteren" om het bestand te downloaden

### Problemen Oplossen

1. **Data Verzameling Problemen**
   - Controleer je internetverbinding
   - Verifieer dat je zoekwoorden correct zijn ingesteld
   - Probeer de dataverzameling opnieuw met aangepaste parameters
   - Controleer of er geen API-limieten zijn bereikt

2. **Analyse Fouten**
   - Zorg ervoor dat er voldoende data beschikbaar is voor analyse
   - Controleer of alle vereiste velden zijn ingevuld
   - Probeer een kleinere dataset of tijdsperiode als de analyse te lang duurt

3. **Export Problemen**
   - Controleer of je browser pop-ups toestaat voor downloads
   - Verifieer dat je voldoende schijfruimte hebt
   - Probeer een ander exportformaat als er problemen zijn

## Bijdragen aan het Project

We verwelkomen bijdragen aan MarketPulse AI! Volg deze richtlijnen om effectief bij te dragen aan het project.

### Development Workflow

MarketPulse AI volgt een taak-gedreven ontwikkelingsworkflow met Task Master voor taakbeheer:

1. **Taken bekijken en selecteren**:
   - Gebruik `task-master list` om beschikbare taken te zien
   - Selecteer taken op basis van afhankelijkheden, prioriteit en ID-volgorde
   - Bekijk taakdetails met `task-master show <id>`

2. **Complexiteit analyseren**:
   - Analyseer taakcomplexiteit met `task-master analyze-complexity --research`
   - Breek complexe taken op met `task-master expand --id=<id>`

3. **Implementatie**:
   - Volg de implementatiedetails in het taakbestand
   - Respecteer projectstandaarden en bestaande architectuur
   - Documenteer code met JSDoc-commentaar
   - Schrijf tests voor nieuwe functionaliteit

4. **Voltooien van taken**:
   - Verifieer volgens teststrategieën
   - Markeer voltooide taken met `task-master set-status --id=<id> --status=done`
   - Update afhankelijke taken indien nodig

### Code Standaarden

- Gebruik JSDoc voor alle componenten en functies
- Volg de bestaande codeerstijl en naamgevingsconventies
- Gebruik PropTypes voor type checking in React componenten
- Schrijf unit tests voor alle nieuwe functionaliteit
- Implementeer foutafhandeling voor robuuste code

### Pull Request Proces

1. Fork de repository en maak een feature branch
2. Implementeer je wijzigingen volgens de taakbeschrijving
3. Voeg tests toe en zorg dat alle bestaande tests slagen
4. Update de documentatie indien nodig
5. Dien een pull request in met een duidelijke beschrijving van de wijzigingen

### Documentatie Best Practices

- Houd de README.md up-to-date met nieuwe functionaliteit
- Documenteer componenten met JSDoc-commentaar
- Voeg voorbeelden toe aan complexe functies
- Gebruik gedetailleerde PropTypes definities

## Infrastructuur

### Docker Configuratie

- **Development**: Lichtgewicht containers geoptimaliseerd voor snelle ontwikkeling en hot-reloading
- **Production**: Geoptimaliseerde containers met multi-stage builds voor kleinere images en betere beveiliging

### CI/CD Pipelines

Het project gebruikt GitHub Actions voor Continuous Integration en Continuous Deployment:

- **Development CI**: Automatische tests en deployment naar de ontwikkelomgeving
- **Production CI/CD**: Automatische tests, deployment naar staging en (na goedkeuring) naar productie
- **Security Scan**: Wekelijkse beveiligingsscans voor dependencies, code en Docker images

### Kubernetes Configuratie

- **Base**: Gemeenschappelijke configuratie voor alle omgevingen
- **Development**: Configuratie voor de ontwikkelomgeving met minder resources
- **Staging**: Testomgeving die de productieomgeving nabootst
- **Production**: Volledig geschaalde productieomgeving met auto-scaling en hoge beschikbaarheid

### Database

Het project gebruikt PostgreSQL als database, met een schema dat is gedefinieerd in `docker/shared/init-scripts/01-init.sql`. De belangrijkste tabellen zijn:

- `users`: Gebruikersinformatie en authenticatie
- `platforms`: Configuratie voor verschillende dataplatforms (Reddit, Amazon, etc.)
- `analyses`: Resultaten van data-analyses
- `sentiment_analyses`: Sentiment analyse resultaten
- `trending_topics`: Geïdentificeerde trending onderwerpen
- `reddit_posts`: Verzamelde Reddit posts
- `twitter_tweets`: Verzamelde Twitter tweets

## Licentie

Dit project is gelicentieerd onder de MIT licentie.
