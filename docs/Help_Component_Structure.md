# MarketPulse AI Help System - Component Structure Documentation

## Overzicht

Dit document beschrijft de architectuur en structuur van de help-componenten binnen MarketPulse AI. Het dient als referentie voor ontwikkelaars die met het help-systeem werken of nieuwe componenten willen integreren.

## Component Hiërarchie

```
IntegratedHelpSystem
├── ContextualTooltip
├── HelpOverlayManager
│   └── HelpMarker
├── OnboardingWizard
│   ├── OnboardingStep
│   └── OnboardingProgress
├── HelpFeedback
└── UserExperienceFeedback
```

## Componentbeschrijvingen

### IntegratedHelpSystem

**Bestandslocatie:** `/frontend/src/components/help/IntegratedHelpSystem.jsx`

**Verantwoordelijkheden:**
- Dient als centrale coördinator voor alle help-functionaliteiten
- Bepaalt de meest geschikte help-methode op basis van gebruikerscontext
- Beheert de globale help-status (actief/inactief)
- Verzamelt gebruikersinteracties voor personalisatie
- Integreert met gebruikersprofiel voor rolgebaseerde help

**Props:**
- `activeView` (string): Huidige actieve view/pagina
- `userSettings` (object): Gebruikersinstellingen met rol en ervaringsniveau
- `children` (node): React children voor wrapping van content

**State:**
- `helpMethod` (string): Huidige actieve help-methode ('tooltip', 'overlay', 'wizard')
- `showHelp` (boolean): Globale help-zichtbaarheidsstatus
- `helpHistory` (array): Geschiedenis van help-interacties

**Belangrijke Methoden:**
- `handleHelpInteraction(action, section, helpItemId, helpItemType)`: Verwerkt help-interacties en trackt gebruikersgedrag
- `determineHelpMethod()`: Bepaalt de meest geschikte help-methode op basis van context
- `toggleHelp()`: Schakelt de globale help-status

**Voorbeeld Gebruik:**
```jsx
<IntegratedHelpSystem 
  activeView="dashboard" 
  userSettings={{
    userRole: 'marketing_manager',
    experienceLevel: 'beginner'
  }}
>
  <DashboardContent />
</IntegratedHelpSystem>
```

### ContextualTooltip

**Bestandslocatie:** `/frontend/src/components/help/ContextualTooltip.jsx`

**Verantwoordelijkheden:**
- Toont contextgevoelige tooltips bij hover over UI-elementen
- Past content aan op basis van gebruikersrol en ervaringsniveau
- Verzamelt feedback over de bruikbaarheid van tooltips
- Ondersteunt verschillende weergavestijlen en posities

**Props:**
- `content` (string|node): Tooltip inhoud
- `children` (node): Element waaraan de tooltip gekoppeld is
- `placement` (string): Positie van de tooltip ('top', 'bottom', 'left', 'right')
- `userRole` (string, optional): Gebruikersrol voor aangepaste content
- `experienceLevel` (string, optional): Ervaringsniveau voor aangepaste content
- `helpItemId` (string, optional): Unieke ID voor het help-item
- `helpItemType` (string, optional): Type help-item ('tooltip', 'overlay', etc.)
- `showFeedback` (boolean, optional): Of feedback-opties getoond moeten worden

**State:**
- `isOpen` (boolean): Of de tooltip zichtbaar is
- `feedbackSubmitted` (boolean): Of feedback is ingediend voor deze tooltip

**Belangrijke Methoden:**
- `handleMouseEnter()`: Opent de tooltip
- `handleMouseLeave()`: Sluit de tooltip
- `handleFeedback(value)`: Verwerkt gebruikersfeedback

**Voorbeeld Gebruik:**
```jsx
<ContextualTooltip 
  content="Dit dashboard toont de verdeling van awareness fasen."
  placement="top"
  helpItemId="awareness-dashboard-overview"
  helpItemType="tooltip"
  showFeedback={true}
>
  <InfoIcon />
</ContextualTooltip>
```

### HelpOverlayManager

**Bestandslocatie:** `/frontend/src/components/help/HelpOverlayManager.jsx`

**Verantwoordelijkheden:**
- Beheert help-overlays die belangrijke UI-elementen markeren
- Ondersteunt stapsgewijze begeleiding door complexe workflows
- Coördineert de weergave van meerdere help-markers
- Past de weergave aan op basis van schermgrootte en apparaat

**Props:**
- `items` (array): Array van help-items met posities en content
- `active` (boolean): Of de overlay actief is
- `onClose` (function): Callback bij sluiten van de overlay
- `onHelpInteraction` (function): Callback bij help-interactie
- `currentStep` (number, optional): Huidige stap in een multi-step overlay

**State:**
- `showHelp` (boolean): Of de help-overlay zichtbaar is
- `activeMarker` (number): Index van de actieve help-marker
- `completedSteps` (array): Array van voltooide stappen

**Belangrijke Methoden:**
- `toggleHelp()`: Schakelt de help-overlay
- `nextStep()`: Gaat naar de volgende stap in een multi-step overlay
- `prevStep()`: Gaat naar de vorige stap in een multi-step overlay
- `handleMarkerClick(index)`: Verwerkt klikken op een help-marker

**Voorbeeld Gebruik:**
```jsx
<HelpOverlayManager
  items={[
    {
      position: { top: '10%', left: '20%' },
      content: "Klik hier om een nieuw project aan te maken",
      helpItemId: "new-project-button",
      helpItemType: "overlay"
    },
    {
      position: { top: '50%', left: '60%' },
      content: "Hier vind je een overzicht van je recente projecten",
      helpItemId: "recent-projects",
      helpItemType: "overlay"
    }
  ]}
  active={showHelp}
  onClose={() => setShowHelp(false)}
  onHelpInteraction={handleHelpInteraction}
/>
```

### OnboardingWizard

**Bestandslocatie:** `/frontend/src/components/help/OnboardingWizard.jsx`

**Verantwoordelijkheden:**
- Begeleidt nieuwe gebruikers door het platform
- Personaliseert de onboarding-ervaring op basis van gebruikersrol
- Biedt interactieve oefeningen voor belangrijke functionaliteiten
- Slaat voortgang op voor latere sessies

**Props:**
- `steps` (array): Array van onboarding stappen
- `onComplete` (function): Callback bij voltooien van onboarding
- `onSkip` (function): Callback bij overslaan van onboarding
- `userRole` (string, optional): Gebruikersrol voor aangepaste content
- `experienceLevel` (string, optional): Ervaringsniveau voor aangepaste content
- `activeView` (string, optional): Huidige actieve view voor contextuele onboarding

**State:**
- `currentStep` (number): Huidige stap in de wizard
- `completedSteps` (array): Array van voltooide stappen
- `userInputs` (object): Verzamelde gebruikersinput tijdens onboarding

**Belangrijke Methoden:**
- `nextStep()`: Gaat naar de volgende stap
- `prevStep()`: Gaat naar de vorige stap
- `handleComplete()`: Verwerkt voltooien van onboarding
- `handleSkip()`: Verwerkt overslaan van onboarding
- `saveProgress()`: Slaat huidige voortgang op

**Voorbeeld Gebruik:**
```jsx
<OnboardingWizard
  steps={[
    {
      title: "Welkom bij MarketPulse AI",
      content: "Laten we je helpen om snel aan de slag te gaan.",
      type: "welcome"
    },
    {
      title: "Je eerste project",
      content: "Klik op de 'Nieuw Project' knop om te beginnen.",
      type: "instruction",
      targetElement: "#new-project-button"
    },
    {
      title: "Dashboard Overzicht",
      content: "Hier zie je een overzicht van je projecten en recente activiteiten.",
      type: "info"
    }
  ]}
  onComplete={handleOnboardingComplete}
  onSkip={handleOnboardingSkip}
  userRole="marketing_manager"
  experienceLevel="beginner"
  activeView="dashboard"
/>
```

### HelpFeedback

**Bestandslocatie:** `/frontend/src/components/help/HelpFeedback.jsx`

**Verantwoordelijkheden:**
- Verzamelt gebruikersfeedback over specifieke help-items
- Categoriseert feedback voor analyse
- Integreert met het feedback analyse-dashboard
- Ondersteunt zowel kwantitatieve als kwalitatieve feedback

**Props:**
- `helpItemId` (string): Unieke ID voor het help-item
- `helpItemType` (string): Type help-item ('tooltip', 'overlay', etc.)
- `onSubmit` (function): Callback bij indienen van feedback
- `userRole` (string, optional): Gebruikersrol van de feedback-gever
- `experienceLevel` (string, optional): Ervaringsniveau van de feedback-gever

**State:**
- `feedbackValue` (boolean): Positieve/negatieve feedback waarde
- `comments` (string): Tekstuele feedback opmerkingen
- `submitted` (boolean): Of feedback is ingediend

**Belangrijke Methoden:**
- `handleFeedbackChange(value)`: Verwerkt verandering in feedback waarde
- `handleCommentsChange(event)`: Verwerkt verandering in opmerkingen
- `handleSubmit()`: Verwerkt indienen van feedback

**Voorbeeld Gebruik:**
```jsx
<HelpFeedback
  helpItemId="awareness-dashboard-overview"
  helpItemType="tooltip"
  onSubmit={handleFeedbackSubmit}
  userRole="marketing_manager"
  experienceLevel="beginner"
/>
```

### UserExperienceFeedback

**Bestandslocatie:** `/frontend/src/components/help/UserExperienceFeedback.jsx`

**Verantwoordelijkheden:**
- Verzamelt algemene feedback over de gebruikerservaring
- Biedt een schaal voor tevredenheidsbeoordelingen
- Ondersteunt het specificeren van aspecten van de ervaring
- Integreert met het feedback analyse-dashboard

**Props:**
- `pageContext` (string): Context/pagina waar feedback wordt verzameld
- `onSubmit` (function): Callback bij indienen van feedback
- `userRole` (string, optional): Gebruikersrol van de feedback-gever
- `experienceLevel` (string, optional): Ervaringsniveau van de feedback-gever

**State:**
- `rating` (number): Tevredenheidsbeoordeling (1-5)
- `feedback` (string): Tekstuele feedback
- `aspects` (array): Geselecteerde aspecten van de ervaring
- `submitted` (boolean): Of feedback is ingediend

**Belangrijke Methoden:**
- `handleRatingChange(value)`: Verwerkt verandering in beoordeling
- `handleFeedbackChange(event)`: Verwerkt verandering in tekstuele feedback
- `handleAspectToggle(aspect)`: Schakelt een aspect aan/uit
- `handleSubmit()`: Verwerkt indienen van feedback

**Voorbeeld Gebruik:**
```jsx
<UserExperienceFeedback
  pageContext="dashboard"
  onSubmit={handleUXFeedbackSubmit}
  userRole="marketing_manager"
  experienceLevel="beginner"
/>
```

## Componentinteracties

### Help Systeem Initialisatie

1. `IntegratedHelpSystem` wordt geïnitialiseerd met gebruikersinstellingen
2. Systeem bepaalt de meest geschikte help-methode op basis van:
   - Gebruikersrol en ervaringsniveau
   - Huidige pagina/context
   - Gebruiksgeschiedenis
3. Voor nieuwe gebruikers wordt `OnboardingWizard` automatisch geactiveerd
4. Voor terugkerende gebruikers worden contextgevoelige help-elementen beschikbaar gemaakt

### Help Interactie Flow

1. Gebruiker interacteert met een UI-element dat help ondersteunt
2. `ContextualTooltip` of `HelpOverlayManager` toont relevante help-content
3. Gebruiker kan feedback geven via `HelpFeedback` component
4. Feedback wordt opgeslagen en beschikbaar gemaakt in het feedback analyse-dashboard
5. Systeem past toekomstige help-interacties aan op basis van verzamelde feedback

### Onboarding Flow

1. Nieuwe gebruiker logt in en `OnboardingWizard` wordt geactiveerd
2. Wizard toont gepersonaliseerde stappen op basis van gebruikersrol
3. Gebruiker doorloopt de stappen of kan de wizard overslaan
4. Voortgang wordt opgeslagen voor het geval de gebruiker later verder wil gaan
5. Na voltooiing wordt de onboarding-status bijgewerkt in het gebruikersprofiel

## Best Practices voor Componentgebruik

### Algemene Richtlijnen

1. **Consistentie**: Gebruik dezelfde help-componenten en -stijlen door de hele applicatie
2. **Contextgevoeligheid**: Zorg dat help-content relevant is voor de huidige context
3. **Beknoptheid**: Houd help-teksten kort en to-the-point
4. **Personalisatie**: Pas help-content aan op basis van gebruikersrol en ervaringsniveau
5. **Feedback**: Verzamel altijd feedback om help-content te blijven verbeteren

### ContextualTooltip Best Practices

1. Gebruik voor kleine UI-elementen die extra uitleg nodig hebben
2. Houd tooltips kort (max 2-3 zinnen)
3. Plaats tooltips strategisch om de gebruikerservaring niet te verstoren
4. Gebruik consistente plaatsing (bijv. altijd boven of rechts van elementen)

### HelpOverlayManager Best Practices

1. Gebruik voor het markeren van belangrijke UI-elementen in een workflow
2. Beperk tot maximaal 5-7 markers per pagina om overweldiging te voorkomen
3. Zorg voor duidelijke navigatie tussen stappen
4. Bied altijd een optie om de overlay te sluiten

### OnboardingWizard Best Practices

1. Houd onboarding kort en gefocust op essentiële functionaliteiten
2. Pas stappen aan op basis van gebruikersrol
3. Bied interactieve elementen om engagement te verhogen
4. Maak het mogelijk om stappen over te slaan of later te hervatten

## Uitbreidbaarheid

Het help-systeem is ontworpen om eenvoudig uitbreidbaar te zijn:

1. **Nieuwe Help-Methoden**: Nieuwe help-componenten kunnen worden toegevoegd door ze te integreren met `IntegratedHelpSystem`
2. **Content Personalisatie**: Help-content kan worden aangepast op basis van nieuwe gebruikersrollen of ervaringsniveaus
3. **Feedback Uitbreiding**: Nieuwe feedback-mechanismen kunnen worden toegevoegd en geïntegreerd met het analyse-dashboard
4. **Integratie met Externe Systemen**: Het help-systeem kan worden geïntegreerd met externe kennisbanken of community forums

## Conclusie

Deze documentatie biedt een overzicht van de componentstructuur van het MarketPulse AI help-systeem. Door deze richtlijnen te volgen, kunnen ontwikkelaars effectief werken met het bestaande systeem en nieuwe componenten toevoegen die consistent zijn met de bestaande architectuur.

Voor meer gedetailleerde informatie over specifieke componenten, raadpleeg de API-documentatie en de codebase.