# MarketPulse AI - Geconsolideerd PRD

## 1. Project Aanmaak - Essentiële Informatie

### 1.1 Basisinformatie (één scherm)
- Projectnaam (tekstveld)
- Product categorie (dropdown: Gezondheid, Schoonheid, Elektronica, Kleding, etc.)
- Product subcategorie (dynamische dropdown gebaseerd op categorie)
- Product omschrijving (tekstveld, 1-10 zinnen en vraag naar de voordelen van het product)
- Product URL (optioneel tekstveld voor meer informatie te verzamelen)
- Voor wie is dit product/geslacht (man, vrouw of allebei)

### 1.2 Scraping Configuratie (één scherm)
- Platforms selectie (checkboxes)
  - Reddit
  - Amazon
  - Instagram
  - TikTok
  - Marktanalyse
- Extra trefwoorden (optioneel tekstveld voor aanvullende zoektermen)
- Concurrerende producten (optioneel, max 3 URL's)
- Geografische focus (optioneel dropdown: Global, US, EU, APAC)

**Dat is alles wat de gebruiker moet ingeven - de rest wordt geautomatiseerd!**

## 2. Backend Logica voor Automatische Configuratie

### 2.1 Automatische Reddit Configuratie
- Algoritme voor relevante subreddits gebaseerd op product categorie
- Automatische zoekquery's gebaseerd op:
  - Product omschrijving
  - Categorie en subcategorie
  - Extra trefwoorden
- Default filters:
  - Tijdsperiode: Last 3 months, 6 months, 12 months, 24 months, 36 months
  - Sorteeroptie: Top posts
  - Minimale data points: 200 posts

### 2.2 Automatische Amazon Configuratie
- Algoritme voor relevante producten gebaseerd op:
  - Product URL (indien opgegeven)
  - Product omschrijving
  - Categorie en subcategorie
  - Prijsrange
- Default filters:
  - Review types: All ratings (1-5 stars)
  - Tijdsperiode: Last year
  - Minimale data points: 500 reviews

### 2.3 Automatische Social Media Configuratie
- Automatische hashtag generatie gebaseerd op:
  - Product categorie en subcategorie
  - Trending hashtags binnen die categorie
  - Product-specifieke termen
- Default filters:
  - Content type: All
  - Tijdsperiode: Last 12 months
  - Minimale data points: 200 posts

## 3. Dashboard & Visualisaties

### 3.1 Doelgroep Inzichten Dashboard

#### Top Pijnpunten Sectie
- Pijnpunten Treemap
  - Automatisch gecategoriseerd in:
    - Innerlijke struggles
    - Uiterlijke struggles
    - Praktische problemen
    - Emotionele frustraties
  - Grootte en kleur gebaseerd op frequentie en intensiteit
  - Klikbaar voor gedetailleerde breakdown
- Pijnpunten Details Panel (verschijnt bij klikken)
  - Beschrijving van pijnpunt
  - Top 5 voorbeeldquotes uit scrape data
  - Platformdistributie (waar het meest genoemd)
  - Gerelateerde pijnpunten

#### Top Verlangens Sectie
- Verlangens Visualisatie
  - Vergelijkbare structuur als pijnpunten
  - Gecategoriseerd in:
    - Gewenste uitkomsten
    - Aspiraties
    - Directe behoeften
    - Langetermijndoelen
  - Klikbaar voor details

#### Taalgebruik Sectie
- Doelgroep Woordenwolk
  - Authentieke termen gebruikt door de doelgroep
  - Phrasen en zinsconstructies
  - Gefilterd op relevantie voor marketing

### 3.2 Awareness Fase Dashboard
- Awareness Distributie Overzicht
  - Verdeling van doelgroep over 5 awareness fasen:
    - Unaware
    - Problem Aware
    - Solution Aware
    - Product Aware
    - Most Aware
  - Gevisualiseerd als donut chart of horizontale balk
- Fase-Specifieke Inzichten Tabs
  - Per fase automatisch gegenereerd:
    - Top pijnpunten voor die fase
    - Top verlangens voor die fase
    - Aanbevolen messaging
    - Voorbeeldquotes

### 3.3 Marketing Strategie Dashboard
- Marketing Angles Kaarten
  - Automatisch gegenereerde marketinghoeken
  - Gebaseerd op pijnpunten en verlangens
  - Gesorteerd op potentiële impact
  - Kopieerbare tekst
- Copywriting Suggesties
  - Headlines
  - USP formuleringen
  - Call-to-actions
  - Objection handling
- UGC Script Templates
  - Format suggesties per platform
  - Hook voorbeelden
  - Storyline structuren
  - Call-to-action opties
- Quiz Funnel Suggesties (toekomstige functionaliteit)
  - Automatisch gegenereerde vragen
  - Antwoordopties
  - Segmentatie logica
  - Email follow-up suggesties

### 3.4 Concurrentieanalyse Dashboard (indien concurrent URLs opgegeven)
- Competitor Comparison
  - Feature vergelijking
  - Prijspositie
  - Messaging analyse
  - USP analyse
  - Gap opportunities

## 4. Data Processing Flow
- Data Collection
  - Scrape geautomatiseerd op basis van minimale projectinformatie
  - Verzamel gestructureerde en ongestructureerde data van alle geselecteerde platforms
  - Toepassen van default filters voor relevantie
- AI Processing
  - Sentiment analyse
  - Pijnpunten extractie en categorisatie
  - Verlangens identificatie
  - Awareness fase classificatie
  - Taalgebruik analyse
  - Marketing angle generatie
- Data Enrichment
  - Cluster gerelateerde pijnpunten
  - Creëer hiërarchie van verlangens
  - Correleer pijnpunten met verlangens
  - Identificeer top marketing kansen
- Visualisatie Generation
  - Creëer interactieve visualisaties
  - Genereer actionable insights cards
  - Produceer downloadbare rapporten

## 5. Belangrijke UX Principes
- Minimale Gebruikersinvoer
  - Gebruikers geven alleen het absolute minimum aan informatie
  - AI doet automatisch de rest
- Actionable Insights
  - Direct kopieerbare marketing suggesties
  - Duidelijke aanbevelingen per awareness fase
  - Praktische script templates en copywriting hulp
- Intuïtieve Navigatie
  - Logische flow tussen dashboards
  - Drill-down mogelijkheden voor meer details
  - Contextafhankelijke help en uitleg
- Efficiënte Data Presentatie
  - Focus op top 10 inzichten in elke categorie
  - Visuele hiërarchie gebaseerd op impact
  - Eenvoudig exporteerbare resultaten

## 6. Implementatie Roadmap

### Fase 1 (MVP)
- Eenvoudige projectaanmaak (2 schermen)
- Reddit dataverzameling en analyse
- Basis pijnpunten & verlangens identificatie
- Executive Summary Dashboard
- Kopieerbare marketing suggesties

### Fase 2
- Amazon reviews integratie
- Awareness Fase Analyse
- UGC script templates
- Uitgebreidere visualisaties
- Exportfunctionaliteit

### Fase 3
- Concurrentieanalyse
- Email marketing suggesties
- Social media integratie

## 7. Technische Stack
- **Frontend**: React.js
- **Backend**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Render
- **Scraping**: Decodo Scraping API
- **AI Processing**: Claude AI of vergelijkbare dienst
- **Visualisaties**: D3.js, Chart.js

## 8. Admin Functionaliteiten
- Mogelijkheid om AI-instructies aan te passen
- PDF uploads naar knowledge base
- Team/POD systeem voor experts
  - Mogelijkheid om teams samen te stellen met verschillende expertises
  - POD framework voor samenwerking
  - Meerdere teams kunnen worden aangemaakt voor verschillende doeleinden

## 9. Kernfunctionaliteit Samenvatting
- Data scraping van verschillende platforms (Reddit, Amazon, social media)
- AI-analyse van de verzamelde data
- Visualisatie van inzichten via intuïtieve dashboards
- Actionable marketing suggesties gebaseerd op de geanalyseerde data
- Vereenvoudigde projectaanmaak met minimale gebruikersinvoer
- Geautomatiseerd proces van data verzameling tot inzichten
- Export opties voor rapporten en marketing materiaal
