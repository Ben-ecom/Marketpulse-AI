# MarketPulse AI Help Systeem - Gebruikerstestplan

## Overzicht

Dit document beschrijft het testplan voor het evalueren van de effectiviteit en gebruiksvriendelijkheid van het help-systeem in MarketPulse AI. Het doel is om te verzekeren dat het help-systeem intuïtief, nuttig en contextgevoelig is, en dat het feedback-mechanisme correct werkt.

## Doelstellingen

1. Evalueren van de gebruiksvriendelijkheid van verschillende help-componenten (tooltips, overlays, wizards, etc.)
2. Testen van de contextgevoeligheid van het help-systeem
3. Valideren van de effectiviteit van het feedback-mechanisme
4. Identificeren van verbeterpunten in de help-content en -functionaliteit
5. Verzamelen van kwantitatieve en kwalitatieve gegevens voor het verbeteren van het help-systeem

## Testdeelnemers

Voor een representatieve evaluatie zullen we deelnemers werven uit verschillende gebruikersgroepen:

| Gebruikersgroep | Aantal deelnemers | Ervaringsniveau |
|-----------------|-------------------|-----------------|
| Marketing managers | 3-5 | Gemengd (beginner tot expert) |
| Marktanalisten | 3-5 | Gemengd (beginner tot expert) |
| Content creators | 2-3 | Gemengd (beginner tot expert) |
| Executives | 2-3 | Voornamelijk beginners |

## Testomgeving

- **Platform**: Staging-omgeving van MarketPulse AI
- **Apparaten**: Desktop (primair), tablet en mobiel (secundair)
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Monitoring**: Schermopname, audio-opname, observatienotities
- **Locatie**: Remote tests via videoconferentie

## Testscenario's

### 1. Onboarding Ervaring

#### Scenario 1.1: Eerste Aanmelding en Onboarding Wizard

**Doel**: Evalueren van de effectiviteit van de onboarding wizard voor nieuwe gebruikers.

**Stappen**:
1. Deelnemer meldt zich aan met een nieuw testaccount
2. Deelnemer doorloopt de onboarding wizard
3. Deelnemer voert basisacties uit na de onboarding

**Metrieken**:
- Voltooiingspercentage van de wizard
- Tijd besteed aan elke stap
- Aantal keren dat hulp wordt gezocht tijdens de wizard
- Subjectieve beoordelingen van duidelijkheid en nut

**Acceptatiecriteria**:
- 90% van de deelnemers voltooit de wizard zonder externe hulp
- Gemiddelde tevredenheidsscore van 4/5 of hoger
- Deelnemers kunnen na de wizard basisacties uitvoeren zonder verdere hulp

### 2. Contextuele Help

#### Scenario 2.1: Dashboard Navigatie met Tooltips

**Doel**: Testen van de effectiviteit van contextuele tooltips op het dashboard.

**Stappen**:
1. Deelnemer navigeert naar het dashboard
2. Deelnemer moet specifieke informatie vinden met behulp van beschikbare tooltips
3. Deelnemer geeft feedback op de tooltips

**Metrieken**:
- Succespercentage bij het vinden van informatie
- Tijd besteed aan het zoeken
- Aantal tooltips bekeken
- Feedback op de tooltips (nuttig/niet nuttig)

**Acceptatiecriteria**:
- 85% van de deelnemers vindt de gevraagde informatie binnen 2 minuten
- Gemiddelde nuttigheidscore van tooltips is 4/5 of hoger

#### Scenario 2.2: Help Overlays voor Complexe Taken

**Doel**: Evalueren van de effectiviteit van help overlays bij complexe taken.

**Stappen**:
1. Deelnemer krijgt een complexe taak (bijv. een nieuw project opzetten met specifieke parameters)
2. Deelnemer gebruikt help overlays om de taak te voltooien
3. Deelnemer geeft feedback op de help overlays

**Metrieken**:
- Taakvoltooing (ja/nee)
- Tijd besteed aan de taak
- Aantal keren dat help overlays worden gebruikt
- Subjectieve beoordeling van de help overlays

**Acceptatiecriteria**:
- 80% van de deelnemers voltooit de taak succesvol
- Gemiddelde tevredenheidsscore van 4/5 of hoger voor de help overlays

### 3. Feedback Mechanisme

#### Scenario 3.1: Feedback Geven op Help Items

**Doel**: Testen van het feedback-mechanisme voor help items.

**Stappen**:
1. Deelnemer gebruikt verschillende help items
2. Deelnemer geeft feedback op deze items via het feedback-mechanisme
3. Deelnemer beoordeelt het gemak van het geven van feedback

**Metrieken**:
- Percentage deelnemers dat feedback geeft
- Tijd besteed aan het geven van feedback
- Kwaliteit en detail van de feedback
- Subjectieve beoordeling van het feedback-proces

**Acceptatiecriteria**:
- 75% van de deelnemers geeft feedback op ten minste 3 help items
- Gemiddelde tevredenheidsscore van 4/5 of hoger voor het feedback-proces

#### Scenario 3.2: Algemene Gebruikerservaring Feedback

**Doel**: Testen van het mechanisme voor algemene gebruikerservaring feedback.

**Stappen**:
1. Deelnemer voltooit een reeks taken in de applicatie
2. Deelnemer wordt gevraagd algemene feedback te geven over de gebruikerservaring
3. Deelnemer beoordeelt het gemak van het geven van algemene feedback

**Metrieken**:
- Kwaliteit en detail van de feedback
- Tijd besteed aan het geven van feedback
- Subjectieve beoordeling van het feedback-proces

**Acceptatiecriteria**:
- 80% van de deelnemers geeft gedetailleerde feedback
- Gemiddelde tevredenheidsscore van 4/5 of hoger voor het feedback-proces

### 4. Help Zoeken en Navigatie

#### Scenario 4.1: Help Centrum Navigatie

**Doel**: Evalueren van de navigatie en zoekfunctionaliteit in het help centrum.

**Stappen**:
1. Deelnemer navigeert naar het help centrum
2. Deelnemer zoekt naar specifieke informatie met behulp van de zoekfunctie
3. Deelnemer navigeert door categorieën om informatie te vinden

**Metrieken**:
- Succespercentage bij het vinden van informatie
- Tijd besteed aan het zoeken
- Aantal zoekopdrachten en navigatiestappen
- Subjectieve beoordeling van de zoek- en navigatie-ervaring

**Acceptatiecriteria**:
- 85% van de deelnemers vindt de gevraagde informatie binnen 3 minuten
- Gemiddelde tevredenheidsscore van 4/5 of hoger voor de zoek- en navigatie-ervaring

### 5. Rolspecifieke Help

#### Scenario 5.1: Rolspecifieke Help Content

**Doel**: Testen of de help content relevant is voor specifieke gebruikersrollen.

**Stappen**:
1. Deelnemers uit verschillende rollen (marketing manager, analist, etc.) gebruiken dezelfde functie
2. Deelnemers bekijken de help content voor die functie
3. Deelnemers beoordelen de relevantie van de help content voor hun rol

**Metrieken**:
- Subjectieve beoordeling van relevantie per rol
- Tijd besteed aan het begrijpen van de functie
- Succespercentage bij het correct gebruiken van de functie

**Acceptatiecriteria**:
- Gemiddelde relevantiescore van 4/5 of hoger per rol
- 85% van de deelnemers gebruikt de functie correct na het raadplegen van de help content

### 6. Ervaringsniveau-specifieke Help

#### Scenario 6.1: Aanpassing aan Ervaringsniveau

**Doel**: Testen of het help-systeem zich aanpast aan het ervaringsniveau van de gebruiker.

**Stappen**:
1. Deelnemers met verschillende ervaringsniveaus (beginner, gevorderd, expert) gebruiken dezelfde functie
2. Deelnemers bekijken de help content voor die functie
3. Deelnemers beoordelen de geschiktheid van de help content voor hun ervaringsniveau

**Metrieken**:
- Subjectieve beoordeling van geschiktheid per ervaringsniveau
- Tijd besteed aan het begrijpen van de functie
- Succespercentage bij het correct gebruiken van de functie

**Acceptatiecriteria**:
- Gemiddelde geschiktheidsscore van 4/5 of hoger per ervaringsniveau
- 85% van de deelnemers gebruikt de functie correct na het raadplegen van de help content

## Testprocedure

### Voorbereiding

1. Rekruteren van testdeelnemers uit de verschillende gebruikersgroepen
2. Voorbereiden van testscenario's en taken
3. Instellen van de testomgeving en monitoring tools
4. Trainen van testbegeleiders

### Uitvoering

1. Verwelkomen van de deelnemer en uitleggen van het doel van de test
2. Verzamelen van demografische gegevens en ervaringsniveau
3. Uitvoeren van de testscenario's volgens het plan
4. Verzamelen van kwantitatieve metrieken en kwalitatieve feedback
5. Debriefing met de deelnemer voor aanvullende inzichten

### Analyse

1. Compileren van alle testgegevens
2. Analyseren van kwantitatieve metrieken per scenario
3. Thematische analyse van kwalitatieve feedback
4. Identificeren van patronen en verbeterpunten
5. Prioriteren van aanbevelingen op basis van impact en implementatie-inspanning

## Dataverzameling

### Kwantitatieve Gegevens

- Taakvoltooing (ja/nee)
- Tijd besteed aan taken
- Aantal klikken/interacties
- Aantal fouten
- Aantal keren dat hulp wordt gezocht
- Beoordelingsscores (1-5 schaal)

### Kwalitatieve Gegevens

- Think-aloud commentaar tijdens de taken
- Antwoorden op open vragen
- Observatienotities van testbegeleiders
- Debriefing interviews

## Rapportage

Na afronding van de tests zal een gedetailleerd rapport worden opgesteld met:

1. Samenvatting van de testresultaten
2. Gedetailleerde analyse per testscenario
3. Identificatie van sterke punten en verbeterpunten
4. Concrete aanbevelingen voor verbeteringen
5. Prioritering van aanbevelingen
6. Voorgestelde vervolgstappen

## Tijdlijn

| Fase | Duur | Deliverables |
|------|------|--------------|
| Voorbereiding | 2 weken | Testplan, rekrutering, testscenario's |
| Uitvoering | 3 weken | Ruwe testgegevens, observatienotities |
| Analyse | 2 weken | Geanalyseerde gegevens, patronen, verbeterpunten |
| Rapportage | 1 week | Eindrapport, presentatie, aanbevelingen |

## Ethische Overwegingen

- Alle deelnemers zullen een toestemmingsformulier ondertekenen
- Persoonlijke gegevens worden geanonimiseerd in de rapportage
- Deelnemers hebben het recht om op elk moment te stoppen
- Testgegevens worden veilig opgeslagen en alleen gebruikt voor het verbeteren van het help-systeem

## Bijlagen

### Bijlage A: Toestemmingsformulier

```
TOESTEMMINGSFORMULIER GEBRUIKERSTEST

Ik, [Naam Deelnemer], geef hierbij toestemming om deel te nemen aan de gebruikerstest van het MarketPulse AI help-systeem.

Ik begrijp dat:
- Mijn scherm, audio en interacties worden opgenomen
- Deze gegevens alleen worden gebruikt voor het verbeteren van het product
- Mijn persoonlijke gegevens worden geanonimiseerd in alle rapportages
- Ik op elk moment kan stoppen met de test zonder gevolgen

Handtekening: ___________________
Datum: _________________________
```

### Bijlage B: Demografische Vragenlijst

```
DEMOGRAFISCHE VRAGENLIJST

1. Wat is uw huidige rol?
   [ ] Marketing Manager
   [ ] Marktanalist
   [ ] Content Creator
   [ ] Executive
   [ ] Anders: _________________

2. Hoeveel ervaring heeft u met marktonderzoekstools?
   [ ] Geen (beginner)
   [ ] Beperkt (1-2 tools gebruikt)
   [ ] Gemiddeld (regelmatig gebruik van meerdere tools)
   [ ] Uitgebreid (expert, dagelijks gebruik)

3. Heeft u eerder MarketPulse AI gebruikt?
   [ ] Nee, dit is mijn eerste keer
   [ ] Ja, een paar keer
   [ ] Ja, regelmatig
   [ ] Ja, ik ben een frequente gebruiker

4. Hoe zou u uw technische vaardigheid beoordelen?
   [ ] Basis (1)
   [ ] Gemiddeld (2)
   [ ] Goed (3)
   [ ] Zeer goed (4)
   [ ] Expert (5)
```

### Bijlage C: Post-Scenario Vragenlijst

```
POST-SCENARIO VRAGENLIJST

Scenario: [Scenario Naam]

1. Hoe moeilijk vond u deze taak?
   Zeer eenvoudig (1) - (5) Zeer moeilijk
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

2. Hoe nuttig was de help-content bij het voltooien van deze taak?
   Niet nuttig (1) - (5) Zeer nuttig
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

3. Hoe relevant was de help-content voor uw rol?
   Niet relevant (1) - (5) Zeer relevant
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

4. Hoe geschikt was de help-content voor uw ervaringsniveau?
   Niet geschikt (1) - (5) Zeer geschikt
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

5. Wat vond u het meest nuttig aan de help-content?
   [Open vraag]

6. Wat vond u het minst nuttig aan de help-content?
   [Open vraag]

7. Welke verbeteringen zou u voorstellen?
   [Open vraag]
```

### Bijlage D: Post-Test Vragenlijst

```
POST-TEST VRAGENLIJST

1. Hoe zou u uw algemene ervaring met het help-systeem beoordelen?
   Zeer slecht (1) - (5) Uitstekend
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

2. Hoe waarschijnlijk is het dat u het help-systeem zou gebruiken bij toekomstige taken?
   Zeer onwaarschijnlijk (1) - (5) Zeer waarschijnlijk
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

3. Welke aspecten van het help-systeem vond u het meest nuttig?
   [Open vraag]

4. Welke aspecten van het help-systeem vond u het minst nuttig?
   [Open vraag]

5. Welke verbeteringen zou u voorstellen voor het help-systeem?
   [Open vraag]

6. Hoe gemakkelijk was het om feedback te geven op help-items?
   Zeer moeilijk (1) - (5) Zeer gemakkelijk
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

7. Aanvullende opmerkingen of suggesties:
   [Open vraag]
```

## Conclusie

Dit testplan biedt een gestructureerde aanpak voor het evalueren van de effectiviteit en gebruiksvriendelijkheid van het MarketPulse AI help-systeem. Door het volgen van dit plan kunnen we waardevolle inzichten verzamelen om het help-systeem te verbeteren en te zorgen dat het voldoet aan de behoeften van verschillende gebruikersgroepen en ervaringsniveaus.