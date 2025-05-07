# MarketPulse AI Help Systeem Tests

Deze directory bevat geautomatiseerde tests voor het MarketPulse AI help-systeem. De tests valideren de functionaliteit en gebruiksvriendelijkheid van het help-systeem op basis van de scenario's uit het gebruikerstestplan.

## Vereisten

- Node.js (v14 of hoger)
- npm (v6 of hoger)
- Chrome browser
- ChromeDriver (moet overeenkomen met de versie van je Chrome browser)

## Installatie

1. Installeer de benodigde dependencies:

```bash
cd tests/help-system
npm install
```

2. Zorg ervoor dat ChromeDriver is geïnstalleerd en beschikbaar is in je PATH. Je kunt het installeren met:

```bash
npm install -g chromedriver
```

Of op macOS met Homebrew:

```bash
brew install --cask chromedriver
```

## Configuratie

Pas de configuratie aan in `HelpSystemTest.js` indien nodig:

- `baseUrl`: URL van de MarketPulse AI applicatie (standaard: http://localhost:3000)
- `testUsers`: Testgebruikers met verschillende rollen en ervaringsniveaus
- `testViews`: Te testen views in de applicatie

## Tests uitvoeren

Start de MarketPulse AI applicatie in een apart terminal venster:

```bash
cd /Users/benomarlaamiri/Documents/MarketPulse\ AI
npm start
```

Voer vervolgens de tests uit:

```bash
cd tests/help-system
npm test
```

## Testscenario's

De volgende testscenario's worden uitgevoerd:

1. **Scenario 1.1: Eerste Aanmelding en Onboarding Wizard**
   - Test of de onboarding wizard wordt getoond bij eerste aanmelding
   - Test of de onboarding wizard correct kan worden doorlopen
   - Test of basisacties kunnen worden uitgevoerd na onboarding

2. **Scenario 2.1: Dashboard Navigatie met Tooltips**
   - Test of de help-overlay kan worden geopend
   - Test of help-markers worden getoond en informatie weergeven bij klikken
   - Test of feedback kan worden gegeven op help-items
   - Test of de help-overlay kan worden gesloten

3. **Scenario 3.1: Feedback Geven op Help Items**
   - Test of feedback kan worden gegeven op meerdere help-items

4. **Scenario 3.2: Algemene Gebruikerservaring Feedback**
   - Test of algemene gebruikersfeedback kan worden gegeven

5. **Scenario 5.1: Rolspecifieke Help Content**
   - Test of verschillende help content wordt getoond voor verschillende gebruikersrollen

6. **Scenario 6.1: Aanpassing aan Ervaringsniveau**
   - Test of verschillende help content wordt getoond voor verschillende ervaringsniveaus

## Helpers en Locators

De test suite bevat herbruikbare helpers en locators die kunnen worden gebruikt in andere tests:

- `helpers`: Functies voor veelvoorkomende acties zoals inloggen, navigeren, en interactie met help-elementen
- `locators`: Selenium locators voor UI elementen
- `config`: Testconfiguratie

Deze kunnen worden geïmporteerd in andere tests:

```javascript
import { helpers, locators, config } from './HelpSystemTest.js';
```

## Problemen oplossen

- **ChromeDriver versie komt niet overeen**: Zorg ervoor dat de versie van ChromeDriver overeenkomt met de versie van je Chrome browser.
- **Element niet gevonden**: Controleer of de locators correct zijn en of de elementen aanwezig zijn in de DOM.
- **Timeout**: Verhoog de timeout waarden in de configuratie als de tests te snel timeout geven.
- **Sessie niet gevonden**: Zorg ervoor dat de MarketPulse AI applicatie draait voordat je de tests uitvoert.

## Continuous Integration

Deze tests kunnen worden geïntegreerd in een CI/CD pipeline. Voeg de volgende stappen toe aan je CI configuratie:

1. Installeer dependencies: `npm install`
2. Start de applicatie: `npm start`
3. Voer de tests uit: `npm test`

Voor headless testing in CI-omgevingen, pas de WebDriver configuratie aan in `HelpSystemTest.js`:

```javascript
driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(new chrome.Options().headless())
  .build();
```
