# Help Metrics Dashboard Test Plan

## Overzicht

Dit testplan beschrijft de teststrategie voor het Help Metrics Dashboard van MarketPulse AI. Het dashboard visualiseert metrieken van het help-systeem en biedt inzicht in gebruikersinteracties, feedback en gebruikerservaring.

## Doelstellingen

1. Valideren dat het Help Metrics Dashboard correct werkt en alle verwachte functionaliteiten bevat
2. Controleren dat de juiste data wordt opgehaald en weergegeven
3. Testen van de filterfunctionaliteit
4. Valideren van de toegangscontrole (alleen admins hebben toegang)
5. Testen van de responsiviteit op verschillende apparaten

## Testomgeving

- **Frontend**: React met Material UI
- **Backend**: Node.js met Express
- **Database**: Supabase (PostgreSQL)
- **Testtools**: Selenium WebDriver, Mocha, Chai

## Testdata

Voor het testen van het dashboard is testdata nodig in de volgende tabellen:
- `help_interactions`: Interacties met het help-systeem
- `help_feedback`: Feedback op help-items
- `user_experience_feedback`: Algemene gebruikersfeedback

De testdata moet verschillende gebruikersrollen, ervaringsniveaus en datums bevatten om de filterfunctionaliteit te kunnen testen.

## Testscenario's

### 1. Toegangscontrole

#### 1.1 Admin toegang
- **Beschrijving**: Een admin gebruiker moet toegang hebben tot het Help Metrics Dashboard
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Admin Dashboard
  3. Klik op de "Help Metrics Dashboard" kaart
- **Verwacht resultaat**: Het Help Metrics Dashboard wordt geladen en weergegeven

#### 1.2 Niet-admin toegang
- **Beschrijving**: Een niet-admin gebruiker mag geen toegang hebben tot het Help Metrics Dashboard
- **Stappen**:
  1. Log in als niet-admin gebruiker
  2. Probeer direct naar de URL `/admin/help-metrics` te navigeren
- **Verwacht resultaat**: Een foutmelding wordt weergegeven dat de gebruiker geen toegang heeft

### 2. Dashboard componenten

#### 2.1 KPI Samenvatting
- **Beschrijving**: De KPI Samenvatting moet correct worden weergegeven met de juiste metrieken
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
- **Verwacht resultaat**: De KPI Samenvatting toont:
  - Totaal aantal interacties
  - Feedback ratio
  - Positieve feedback percentage
  - Gemiddelde gebruikerstevredenheid

#### 2.2 Interacties per type
- **Beschrijving**: De grafiek voor interacties per type moet correct worden weergegeven
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
- **Verwacht resultaat**: Een donut chart wordt weergegeven met de verdeling van interacties per type

#### 2.3 Interacties per pagina
- **Beschrijving**: De grafiek voor interacties per pagina moet correct worden weergegeven
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
- **Verwacht resultaat**: Een bar chart wordt weergegeven met de verdeling van interacties per pagina

#### 2.4 Feedback tabellen
- **Beschrijving**: De feedback tabellen moeten correct worden weergegeven
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
- **Verwacht resultaat**: Tabellen worden weergegeven voor:
  - Feedback per help item
  - Feedback per gebruikersrol
  - Feedback per ervaringsniveau

#### 2.5 Interacties trend
- **Beschrijving**: De grafiek voor interacties trend moet correct worden weergegeven
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
- **Verwacht resultaat**: Een line chart wordt weergegeven met de trend van interacties over tijd

#### 2.6 Gebruikerservaring feedback
- **Beschrijving**: De tabel voor gebruikerservaring feedback moet correct worden weergegeven
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
- **Verwacht resultaat**: Een tabel wordt weergegeven met gedetailleerde gebruikersfeedback

### 3. Filterfunctionaliteit

#### 3.1 Datumbereik filter
- **Beschrijving**: Het datumbereik filter moet de weergegeven data correct filteren
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
  3. Selecteer een ander datumbereik (bijv. "Laatste 7 dagen")
  4. Klik op "Vernieuwen"
- **Verwacht resultaat**: De data wordt bijgewerkt om alleen interacties binnen het geselecteerde datumbereik te tonen

#### 3.2 Gebruikersrol filter
- **Beschrijving**: Het gebruikersrol filter moet de weergegeven data correct filteren
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
  3. Selecteer een specifieke gebruikersrol (bijv. "Marketeer")
  4. Klik op "Vernieuwen"
- **Verwacht resultaat**: De data wordt bijgewerkt om alleen interacties van de geselecteerde gebruikersrol te tonen

#### 3.3 Ervaringsniveau filter
- **Beschrijving**: Het ervaringsniveau filter moet de weergegeven data correct filteren
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
  3. Selecteer een specifiek ervaringsniveau (bijv. "Beginner")
  4. Klik op "Vernieuwen"
- **Verwacht resultaat**: De data wordt bijgewerkt om alleen interacties van het geselecteerde ervaringsniveau te tonen

#### 3.4 Combinatie van filters
- **Beschrijving**: Combinaties van filters moeten correct werken
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
  3. Selecteer een datumbereik, gebruikersrol en ervaringsniveau
  4. Klik op "Vernieuwen"
- **Verwacht resultaat**: De data wordt bijgewerkt om alleen interacties te tonen die aan alle geselecteerde filters voldoen

### 4. Responsiviteit

#### 4.1 Desktop weergave
- **Beschrijving**: Het dashboard moet correct worden weergegeven op desktop formaat
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard op een desktop apparaat
- **Verwacht resultaat**: Alle componenten worden correct weergegeven en zijn goed leesbaar

#### 4.2 Tablet weergave
- **Beschrijving**: Het dashboard moet correct worden weergegeven op tablet formaat
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard op een tablet apparaat
- **Verwacht resultaat**: Alle componenten worden correct weergegeven en zijn aangepast aan het schermformaat

#### 4.3 Mobiele weergave
- **Beschrijving**: Het dashboard moet correct worden weergegeven op mobiel formaat
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard op een mobiel apparaat
- **Verwacht resultaat**: Alle componenten worden correct weergegeven en zijn aangepast aan het schermformaat

### 5. Prestaties

#### 5.1 Laadtijd
- **Beschrijving**: Het dashboard moet binnen een acceptabele tijd laden
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
- **Verwacht resultaat**: Het dashboard laadt binnen 3 seconden

#### 5.2 Filtertijd
- **Beschrijving**: Het toepassen van filters moet binnen een acceptabele tijd gebeuren
- **Stappen**:
  1. Log in als admin gebruiker
  2. Navigeer naar het Help Metrics Dashboard
  3. Pas verschillende filters toe
- **Verwacht resultaat**: De data wordt bijgewerkt binnen 2 seconden na het klikken op "Vernieuwen"

## Testautomatisering

De testscenario's zijn geautomatiseerd met Selenium WebDriver en kunnen worden uitgevoerd met het volgende commando:

```bash
cd /Users/benomarlaamiri/Documents/MarketPulse AI/tests/help-system
npm test dashboard/HelpMetricsDashboardTest.js
```

## Testrapportage

Na het uitvoeren van de tests wordt een testrapport gegenereerd met de volgende informatie:
- Aantal uitgevoerde tests
- Aantal geslaagde tests
- Aantal mislukte tests
- Details van mislukte tests
- Screenshots van mislukte tests

## Acceptatiecriteria

Het Help Metrics Dashboard wordt als geaccepteerd beschouwd als:
1. Alle testscenario's slagen
2. Het dashboard correct werkt op desktop, tablet en mobiel
3. De laadtijd en filtertijd binnen de gespecificeerde limieten vallen
4. De toegangscontrole correct werkt
5. Alle componenten correct worden weergegeven en de juiste data tonen

## Risico's en mitigatie

| Risico | Mitigatie |
|--------|-----------|
| Trage prestaties bij grote datasets | Implementeer paginering en lazy loading |
| Onjuiste data door verkeerde queries | Uitgebreide unit tests voor de service laag |
| Toegankelijkheidsproblemen | Test met screenreaders en zorg voor WCAG 2.1 compliance |
| Browser compatibiliteitsproblemen | Test op verschillende browsers (Chrome, Firefox, Safari) |

## Conclusie

Dit testplan biedt een uitgebreide aanpak voor het testen van het Help Metrics Dashboard. Door deze tests uit te voeren, kunnen we ervoor zorgen dat het dashboard correct werkt, de juiste data weergeeft en toegankelijk is voor de juiste gebruikers.
