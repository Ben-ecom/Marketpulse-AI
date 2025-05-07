# MarketPulse AI - Help Functionaliteit Technische Documentatie

## 1. Architectuur Overzicht

### 1.1 Componentstructuur
De help-functionaliteit in MarketPulse AI is opgebouwd uit verschillende React componenten die samen een uitgebreid help-systeem vormen. De architectuur volgt een modulaire aanpak, waarbij elke component een specifieke verantwoordelijkheid heeft.

```
/components/help/
├── IntegratedHelpSystem.jsx     # Centrale component voor help-integratie
├── HelpOverlayManager.jsx       # Beheert help-overlay en markers
├── ContextualTooltip.jsx        # Contextgevoelige tooltips
├── OnboardingWizard.jsx         # Onboarding ervaring voor nieuwe gebruikers
├── HelpFeedback.jsx             # Feedback over specifieke help-items
└── UserExperienceFeedback.jsx   # Algemene gebruikerservaring feedback
```

### 1.2 Dataflow
De dataflow in het help-systeem is als volgt:

1. **IntegratedHelpSystem** bepaalt de help-methode op basis van A/B-test of gebruikersgedrag
2. **HelpOverlayManager** of andere help-componenten worden gerenderd op basis van de geselecteerde methode
3. Gebruikersinteracties worden getrackt via de `handleHelpInteraction` functie
4. Feedback wordt verzameld en opgeslagen in Supabase
5. Analytics worden gebruikt om help-effectiviteit te meten en te verbeteren

### 1.3 Integratie met Externe Systemen
De help-functionaliteit integreert met de volgende externe systemen:

- **Supabase**: Voor opslag van feedback en gebruikersvoorkeuren
- **ABTestingService**: Voor A/B-testen van verschillende help-methoden
- **HelpRecommendationService**: Voor personalisatie van help op basis van gebruikersgedrag

## 2. Component Specificaties

### 2.1 IntegratedHelpSystem

#### 2.1.1 Doel
De centrale component die verschillende help-methoden integreert en selecteert op basis van gebruikersgedrag en A/B-testen.

#### 2.1.2 Props
```javascript
{
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends', 'awareness', 'market-insights']),
  userRole: PropTypes.oneOf(['general', 'marketeer', 'product_manager', 'analyst']),
  experienceLevel: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']),
  children: PropTypes.node
}
```

#### 2.1.3 State
```javascript
{
  helpMethod: 'standard' | 'abtest' | 'adaptive',
  showOnboarding: boolean,
  showFeedback: boolean,
  showUserFeedback: boolean,
  currentHelpItem: { id: string, type: string } | null,
  userSettings: {
    userRole: string,
    experienceLevel: string
  }
}
```

#### 2.1.4 Methoden
- `handleHelpInteraction(action, section, helpItemId, helpItemType)`: Verwerkt help-interacties
- `handleRoleChange(newRole)`: Verwerkt wijzigingen in gebruikersrol
- `handleExperienceLevelChange(newLevel)`: Verwerkt wijzigingen in ervaringsniveau
- `handleOnboardingComplete()`: Verwerkt voltooiing van onboarding
- `handleOnboardingSkip()`: Verwerkt overslaan van onboarding
- `handleFeedbackClose()`: Verwerkt sluiten van feedback
- `handleShowUserFeedback()`: Toont gebruikersfeedback dialog
- `renderHelpMethod()`: Rendert de juiste help-methode

#### 2.1.5 Voorbeeld Gebruik
```jsx
<IntegratedHelpSystem
  activeView="report"
  userRole="marketeer"
  experienceLevel="intermediate"
>
  <YourComponent />
</IntegratedHelpSystem>
```

### 2.2 HelpOverlayManager

#### 2.2.1 Doel
Biedt een overlay met help-markers op belangrijke secties van de pagina.

#### 2.2.2 Props
```javascript
{
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends', 'awareness', 'market-insights']),
  helpPoints: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      position: PropTypes.shape({
        top: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        left: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
      }).isRequired,
      contentPosition: PropTypes.shape({
        top: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        left: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        transform: PropTypes.string
      }),
      videoUrl: PropTypes.string,
      learnMoreUrl: PropTypes.string
    })
  ),
  onHelpInteraction: PropTypes.func,
  children: PropTypes.node
}
```

#### 2.2.3 State
```javascript
{
  showHelp: boolean,
  activeHelpPoint: object | null,
  helpEnabled: boolean
}
```

#### 2.2.4 Methoden
- `toggleHelp()`: Schakelt help-overlay in/uit
- `handleShowHelpPoint(pointId)`: Toont help voor een specifiek punt
- `handleHideHelpPoint()`: Verbergt help voor een specifiek punt
- `handleViewVideo(videoUrl)`: Opent video tutorial
- `handleLearnMore(learnMoreUrl)`: Opent externe documentatie

#### 2.2.5 Voorbeeld Gebruik
```jsx
<HelpOverlayManager
  activeView="report"
  helpPoints={reportHelpPoints}
  onHelpInteraction={(action, section, helpItemId, helpItemType) => 
    trackHelpInteraction(action, section, helpItemId, helpItemType)}
>
  <YourComponent />
</HelpOverlayManager>
```

### 2.3 ContextualTooltip

#### 2.3.1 Doel
Toont contextgevoelige tooltips bij hover over UI-elementen.

#### 2.3.2 Props
```javascript
{
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  placement: PropTypes.string,
  videoUrl: PropTypes.string,
  learnMoreUrl: PropTypes.string,
  children: PropTypes.node.isRequired
}
```

#### 2.3.3 Voorbeeld Gebruik
```jsx
<ContextualTooltip
  title="Rapport Opties"
  content="Pas de rapport opties aan om het rapport te personaliseren."
  videoUrl="https://example.com/videos/report-options.mp4"
  learnMoreUrl="https://docs.example.com/topic-awareness/report-options"
>
  <Typography variant="h6" component="h2" gutterBottom>
    Rapport Opties
  </Typography>
</ContextualTooltip>
```

### 2.4 OnboardingWizard

#### 2.4.1 Doel
Begeleidt nieuwe gebruikers door de eerste stappen van het platform.

#### 2.4.2 Props
```javascript
{
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onComplete: PropTypes.func,
  activeView: PropTypes.oneOf(['dashboard', 'report', 'sentiment', 'trends', 'awareness', 'market-insights'])
}
```

#### 2.4.3 State
```javascript
{
  activeStep: number,
  skipped: Set,
  formData: {
    name: string,
    company: string,
    role: string,
    industry: string,
    dataSource: string,
    interests: string[],
    privacySettings: {
      shareData: boolean,
      anonymizeData: boolean,
      receiveUpdates: boolean
    }
  }
}
```

#### 2.4.4 Methoden
- `isStepSkippable(step)`: Controleert of een stap kan worden overgeslagen
- `isStepSkipped(step)`: Controleert of een stap is overgeslagen
- `handleNext()`: Navigeert naar de volgende stap
- `handleBack()`: Navigeert naar de vorige stap
- `handleSkip()`: Slaat een stap over
- `handleComplete()`: Voltooit de wizard
- `handleChange(event)`: Verwerkt wijzigingen in formuliervelden

#### 2.4.5 Voorbeeld Gebruik
```jsx
<OnboardingWizard
  open={showOnboarding}
  onClose={() => setShowOnboarding(false)}
  onComplete={handleOnboardingComplete}
  activeView="dashboard"
/>
```

### 2.5 HelpFeedback

#### 2.5.1 Doel
Verzamelt gebruikersfeedback over specifieke help-items.

#### 2.5.2 Props
```javascript
{
  helpItemId: PropTypes.string.isRequired,
  helpItemType: PropTypes.string.isRequired,
  userRole: PropTypes.string,
  experienceLevel: PropTypes.string,
  onClose: PropTypes.func
}
```

#### 2.5.3 State
```javascript
{
  feedbackValue: null | boolean,
  comments: string,
  submitting: boolean,
  submitted: boolean
}
```

#### 2.5.4 Methoden
- `handleFeedbackSubmit()`: Verwerkt indienen van feedback
- `handleCommentChange(event)`: Verwerkt wijzigingen in commentaarveld
- `handlePositiveFeedback()`: Verwerkt positieve feedback
- `handleNegativeFeedback()`: Verwerkt negatieve feedback

#### 2.5.5 Voorbeeld Gebruik
```jsx
<HelpFeedback
  helpItemId="report-options"
  helpItemType="tooltip"
  userRole="marketeer"
  experienceLevel="intermediate"
  onClose={() => setShowFeedback(false)}
/>
```

### 2.6 UserExperienceFeedback

#### 2.6.1 Doel
Verzamelt algemene feedback over de gebruikerservaring.

#### 2.6.2 Props
```javascript
{
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  pageContext: PropTypes.string.isRequired,
  userRole: PropTypes.string,
  experienceLevel: PropTypes.string
}
```

#### 2.6.3 State
```javascript
{
  rating: number,
  feedback: string,
  selectedAspects: string[],
  submitting: boolean,
  showSuccess: boolean,
  showError: boolean
}
```

#### 2.6.4 Methoden
- `handleAspectToggle(aspectId)`: Schakelt aspect selectie
- `handleSubmit()`: Verwerkt indienen van feedback
- `handleCloseSuccess()`: Verwerkt sluiten van succes bericht
- `handleCloseError()`: Verwerkt sluiten van fout bericht

#### 2.6.5 Voorbeeld Gebruik
```jsx
<UserExperienceFeedback
  open={showFeedback}
  onClose={() => setShowFeedback(false)}
  pageContext="awareness"
  userRole="marketeer"
  experienceLevel="intermediate"
/>
```

## 3. Data Modellen

### 3.1 Help Item
```typescript
interface HelpItem {
  id: string;
  type: 'tooltip' | 'overlay' | 'onboarding' | 'video';
  title: string;
  content: string;
  videoUrl?: string;
  learnMoreUrl?: string;
  position?: {
    top: string | number;
    left: string | number;
  };
  contentPosition?: {
    top: string | number;
    left: string | number;
    transform?: string;
  };
}
```

### 3.2 Help Feedback
```typescript
interface HelpFeedback {
  id?: string;
  help_item_id: string;
  help_item_type: string;
  feedback_value: boolean;
  comments?: string;
  user_role: string;
  experience_level: string;
  created_at: Date;
}
```

### 3.3 User Experience Feedback
```typescript
interface UserExperienceFeedback {
  id?: string;
  page_context: string;
  rating: number;
  feedback?: string;
  aspects: string[];
  user_role: string;
  experience_level: string;
  created_at: Date;
}
```

## 4. Supabase Integratie

### 4.1 Database Schema

#### 4.1.1 help_feedback Tabel
```sql
CREATE TABLE help_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  help_item_id TEXT NOT NULL,
  help_item_type TEXT NOT NULL,
  feedback_value BOOLEAN NOT NULL,
  comments TEXT,
  user_role TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4.1.2 user_experience_feedback Tabel
```sql
CREATE TABLE user_experience_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_context TEXT NOT NULL,
  rating INTEGER NOT NULL,
  feedback TEXT,
  aspects TEXT[] NOT NULL,
  user_role TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 API Functies

#### 4.2.1 saveHelpFeedback
```javascript
export const saveHelpFeedback = async (feedbackData) => {
  try {
    const { data, error } = await supabase
      .from('help_feedback')
      .insert([
        {
          help_item_id: feedbackData.helpItemId,
          help_item_type: feedbackData.helpItemType,
          feedback_value: feedbackData.feedbackValue,
          comments: feedbackData.comments,
          user_role: feedbackData.userRole,
          experience_level: feedbackData.experienceLevel,
          created_at: new Date()
        }
      ]);

    if (error) {
      console.error('Error saving help feedback:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception saving help feedback:', error);
    return { success: false, error };
  }
};
```

#### 4.2.2 saveUserExperienceFeedback
```javascript
export const saveUserExperienceFeedback = async (feedbackData) => {
  try {
    const { data, error } = await supabase
      .from('user_experience_feedback')
      .insert([
        {
          page_context: feedbackData.pageContext,
          rating: feedbackData.rating,
          feedback: feedbackData.feedback,
          aspects: feedbackData.aspects,
          user_role: feedbackData.userRole,
          experience_level: feedbackData.experienceLevel,
          created_at: new Date()
        }
      ]);

    if (error) {
      console.error('Error saving user experience feedback:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception saving user experience feedback:', error);
    return { success: false, error };
  }
};
```

## 5. Help Content Management

### 5.1 Help Points Data
Help points worden gedefinieerd in `helpPointsData.js` en gegroepeerd per pagina.

```javascript
// Voorbeeld van help points voor de AwarenessDashboard
export const awarenessHelpPoints = [
  {
    id: 'awareness-overview',
    title: 'Awareness Fasen Overzicht',
    content: 'De 5 awareness fasen van Eugene Schwartz beschrijven de verschillende niveaus van bewustzijn die uw doelgroep heeft over hun problemen en uw oplossingen.',
    position: {
      top: '100px',
      left: '20px'
    },
    contentPosition: {
      top: '150px',
      left: '50px',
      transform: 'none'
    },
    videoUrl: 'https://example.com/videos/awareness-phases.mp4',
    learnMoreUrl: 'https://docs.example.com/awareness-phases'
  },
  // Meer help points...
];
```

### 5.2 Help Points Ophalen
Help points worden opgehaald op basis van de actieve view.

```javascript
export const getHelpPointsForView = (view) => {
  switch (view) {
    case 'dashboard':
      return dashboardHelpPoints;
    case 'report':
      return reportHelpPoints;
    case 'sentiment':
      return sentimentHelpPoints;
    case 'trends':
      return trendsHelpPoints;
    case 'awareness':
      return awarenessHelpPoints;
    case 'market-insights':
      return marketInsightsHelpPoints;
    default:
      return [];
  }
};
```

## 6. A/B Testing Integratie

### 6.1 Test Varianten
De help-functionaliteit ondersteunt drie varianten:

1. **Standard**: Standaard help met tooltips en overlay
2. **ABTest**: Help met A/B test methode
3. **Adaptive**: Adaptieve help op basis van gebruikersgedrag

### 6.2 Variant Selectie
```javascript
// Effect om te bepalen welke help-methode moet worden gebruikt
useEffect(() => {
  // Controleer of de gebruiker nieuw is
  const isNewUser = localStorage.getItem('onboardingCompleted') !== 'true';
  
  // Controleer of de gebruiker al onboarding heeft gehad voor deze view
  const onboardedViews = JSON.parse(localStorage.getItem('onboardedViews') || '[]');
  const hasViewOnboarding = onboardedViews.includes(activeView);
  
  if (isNewUser || !hasViewOnboarding) {
    // Toon onboarding als de gebruiker nieuw is of deze view nog niet heeft gezien
    setShowOnboarding(true);
    return;
  }
  
  // Bepaal de help-methode op basis van A/B-test of gebruikersgedrag
  const testId = ABTestingService.tests.helpSystemTest.id;
  const variant = getTestVariant(testId, 3); // 3 varianten: 0, 1, 2
  
  switch (variant) {
    case 0:
      setHelpMethod('standard');
      break;
    case 1:
      setHelpMethod('abtest');
      break;
    case 2:
      setHelpMethod('adaptive');
      break;
    default:
      setHelpMethod('standard');
  }
}, [activeView]);
```

## 7. Gebruikersgedrag Tracking

### 7.1 Help Interacties Tracken
```javascript
const handleHelpInteraction = (action, section, helpItemId = null, helpItemType = null) => {
  // Track de help interactie voor personalisatie
  trackUserBehavior(action, {
    section,
    activeView,
    userRole: userSettings.userRole,
    experienceLevel: userSettings.experienceLevel,
    helpMethod
  });
  
  // Als de actie 'view' is en er is een helpItemId, toon dan de feedback optie
  if (action === 'view' && helpItemId) {
    setCurrentHelpItem({ id: helpItemId, type: helpItemType || 'general' });
    // Toon feedback na een korte vertraging om de gebruiker tijd te geven de content te lezen
    setTimeout(() => {
      setShowFeedback(true);
    }, 10000); // Toon feedback optie na 10 seconden
  }
};
```

### 7.2 Onboarding Tracking
```javascript
const handleOnboardingComplete = () => {
  setShowOnboarding(false);
  localStorage.setItem('onboardingCompleted', 'true');
  
  // Update de lijst met views waarvoor de gebruiker onboarding heeft gehad
  const onboardedViews = JSON.parse(localStorage.getItem('onboardedViews') || '[]');
  if (!onboardedViews.includes(activeView)) {
    onboardedViews.push(activeView);
    localStorage.setItem('onboardedViews', JSON.stringify(onboardedViews));
  }
  
  // Track onboarding completion
  trackUserBehavior('onboarding_complete', {
    activeView,
    userRole: userSettings.userRole,
    experienceLevel: userSettings.experienceLevel
  });
};
```

## 8. Best Practices

### 8.1 Help Content Schrijven
- Houd help-teksten beknopt en duidelijk
- Focus op één concept per help-item
- Gebruik eenvoudige taal en vermijd jargon
- Voeg relevante links toe voor meer informatie
- Gebruik video's voor complexe concepten

### 8.2 Help Componenten Integreren
- Omwikkel pagina's met IntegratedHelpSystem
- Gebruik ContextualTooltip voor belangrijke UI-elementen
- Definieer help points in helpPointsData.js
- Implementeer feedback mechanismen voor continue verbetering

### 8.3 Help Functionaliteit Uitbreiden
- Voeg nieuwe help points toe aan helpPointsData.js
- Implementeer nieuwe help-componenten in /components/help/
- Integreer nieuwe componenten met IntegratedHelpSystem
- Test nieuwe functionaliteit met gebruikers

## 9. Troubleshooting

### 9.1 Veelvoorkomende Problemen

#### 9.1.1 Help Overlay Verschijnt Niet
- Controleer of helpPoints correct zijn gedefinieerd
- Controleer of de help-knop correct wordt gerenderd
- Controleer of localStorage.getItem('helpEnabled') niet 'false' is

#### 9.1.2 Tooltips Verschijnen Niet
- Controleer of ContextualTooltip correct wordt gebruikt
- Controleer of de content en title props zijn ingevuld
- Controleer of de placement prop correct is

#### 9.1.3 Onboarding Start Niet Automatisch
- Controleer of localStorage.getItem('onboardingCompleted') niet 'true' is
- Controleer of de gebruiker al onboarding heeft gehad voor deze view
- Controleer of showOnboarding correct wordt ingesteld

#### 9.1.4 Feedback Wordt Niet Opgeslagen
- Controleer of Supabase correct is geconfigureerd
- Controleer of de tabellen correct zijn aangemaakt
- Controleer of de feedbackData correct is geformatteerd

### 9.2 Debugging Tips
- Gebruik console.log voor debugging van component state
- Controleer localStorage waarden voor persistentie issues
- Inspecteer Supabase tabellen voor feedback opslag issues
- Gebruik React DevTools voor component hierarchie en props

## 10. Toekomstige Uitbreidingen

### 10.1 Help Zoekfunctie
- Implementeren van een zoekfunctie voor help-content
- Ontwikkelen van een centrale help-hub
- Toevoegen van natuurlijke taal verwerking voor betere zoekresultaten

### 10.2 Video Tutorials
- Ontwikkelen van gedetailleerde video tutorials
- Integreren van video's in help-content
- Toevoegen van interactieve gidsen

### 10.3 Personalisatie
- Verder verbeteren van personalisatie op basis van gebruikersgedrag
- Implementeren van machine learning voor help-aanbevelingen
- Aanpassen van help-content op basis van gebruikershistorie

### 10.4 Analytics Dashboard
- Ontwikkelen van een dashboard voor help-analytics
- Visualiseren van feedback trends
- Identificeren van verbeterpunten op basis van data