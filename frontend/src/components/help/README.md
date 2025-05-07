# Help Components

Dit directory bevat componenten die gebruikers helpen bij het navigeren en begrijpen van het MarketPulse AI platform.

## Componenten

### HelpOverlay

Een overlay component die contextuele hulp biedt voor verschillende views in de applicatie.

```jsx
<HelpOverlay activeView="dashboard" />
```

#### Props

| Naam | Type | Standaard | Beschrijving |
|------|------|-----------|--------------|
| activeView | string | 'dashboard' | De huidige actieve view (dashboard, report, sentiment, trends) |

### TourGuide

Een interactieve tour die gebruikers door de belangrijkste functies van de applicatie leidt.

```jsx
<TourGuide 
  activeView="dashboard"
  onComplete={() => console.log('Tour voltooid')}
/>
```

#### Props

| Naam | Type | Standaard | Beschrijving |
|------|------|-----------|--------------|
| activeView | string | 'dashboard' | De huidige actieve view (dashboard, report, sentiment, trends) |
| onComplete | function | - | Callback functie die wordt aangeroepen wanneer de tour is voltooid |

### OnboardingWizard

Een stapsgewijze wizard die nieuwe gebruikers helpt bij het instellen van hun account en voorkeuren.

```jsx
<OnboardingWizard
  open={showOnboarding}
  onClose={() => setShowOnboarding(false)}
  onComplete={handleOnboardingComplete}
/>
```

#### Props

| Naam | Type | Standaard | Beschrijving |
|------|------|-----------|--------------|
| open | boolean | - | Of de wizard open is |
| onClose | function | - | Callback functie die wordt aangeroepen wanneer de wizard wordt gesloten |
| onComplete | function | - | Callback functie die wordt aangeroepen wanneer de wizard is voltooid |

### ContextualTooltip

Een geavanceerde tooltip component die contextuele hulp biedt voor complexe UI-elementen.

```jsx
<ContextualTooltip
  title="Awareness Distributie"
  content="Deze visualisatie toont de verdeling van topics over de verschillende awareness fasen."
  videoUrl="https://example.com/video.mp4"
  learnMoreUrl="https://docs.example.com/awareness-distribution"
>
  <Button>Awareness Distributie</Button>
</ContextualTooltip>
```

#### Props

| Naam | Type | Standaard | Beschrijving |
|------|------|-----------|--------------|
| children | node | - | De inhoud waarop de tooltip wordt toegepast |
| title | string | - | De titel van de tooltip |
| content | string | - | De inhoud van de tooltip |
| videoUrl | string | - | URL naar een video tutorial |
| learnMoreUrl | string | - | URL naar meer informatie |
| placement | string | 'top' | Plaatsing van de tooltip |
| interactive | boolean | true | Of de tooltip interactief is (klikbaar) |
| icon | node | <HelpIcon /> | Het icoon dat wordt gebruikt voor de tooltip trigger |
| iconPosition | string | 'end' | De positie van het icoon ten opzichte van de children |
| iconColor | string | 'primary' | De kleur van het icoon |
| maxWidth | number | 320 | De maximale breedte van de tooltip |

### FAQ

Een component dat veelgestelde vragen en antwoorden toont met zoek- en filterfunctionaliteit.

```jsx
<FAQ
  title="Veelgestelde vragen"
  faqItems={faqData}
  onFeedback={(questionId, helpful) => console.log(questionId, helpful)}
/>
```

#### Props

| Naam | Type | Standaard | Beschrijving |
|------|------|-----------|--------------|
| title | string | 'Veelgestelde vragen' | De titel van de FAQ sectie |
| faqItems | array | [] | De lijst met FAQ items |
| categories | array | [] | De lijst met categorieën |
| showSearch | boolean | true | Of de zoekfunctionaliteit moet worden getoond |
| showCategories | boolean | true | Of de categorieën moeten worden getoond |
| showFeedback | boolean | true | Of de feedback functionaliteit moet worden getoond |
| onFeedback | function | - | Callback functie die wordt aangeroepen wanneer feedback wordt gegeven |
| maxHeight | number | 600 | De maximale hoogte van de FAQ component |

### VideoTutorials

Een component dat videotutorials toont met zoek- en filterfunctionaliteit.

```jsx
<VideoTutorials
  title="Videotutorials"
  videos={videoData}
  onVideoView={(videoId) => console.log('Video bekeken:', videoId)}
/>
```

#### Props

| Naam | Type | Standaard | Beschrijving |
|------|------|-----------|--------------|
| title | string | 'Videotutorials' | De titel van de videotutorials sectie |
| videos | array | [] | De lijst met videotutorials |
| categories | array | [] | De lijst met categorieën |
| showSearch | boolean | true | Of de zoekfunctionaliteit moet worden getoond |
| showCategories | boolean | true | Of de categorieën moeten worden getoond |
| onVideoView | function | - | Callback functie die wordt aangeroepen wanneer een video wordt bekeken |
| onBookmark | function | - | Callback functie die wordt aangeroepen wanneer een video wordt gebookmarkt |

### PersonalizedHelp

Een component dat gepersonaliseerde hulp biedt op basis van gebruikersrol en ervaring.

```jsx
<PersonalizedHelp
  activeView="dashboard"
  userRole="marketeer"
  experienceLevel="intermediate"
/>
```

#### Props

| Naam | Type | Standaard | Beschrijving |
|------|------|-----------|--------------|
| activeView | string | 'dashboard' | De huidige actieve view (dashboard, report, sentiment, trends) |
| userRole | string | 'general' | De rol van de gebruiker |
| experienceLevel | string | 'intermediate' | Het ervaringsniveau van de gebruiker |
| onRoleChange | function | - | Callback functie die wordt aangeroepen wanneer de rol verandert |
| onExperienceLevelChange | function | - | Callback functie die wordt aangeroepen wanneer het ervaringsniveau verandert |
| showSettings | boolean | true | Of de instellingen tab moet worden getoond |

## Best Practices

### Gebruikerservaring

- **Progressieve onthulling**: Toon alleen relevante informatie op basis van de context.
- **Consistentie**: Gebruik dezelfde terminologie en visuele elementen in alle help-componenten.
- **Toegankelijkheid**: Zorg ervoor dat alle help-componenten toegankelijk zijn volgens WCAG 2.1 richtlijnen.
- **Personalisatie**: Pas de help-content aan op basis van gebruikersrol en ervaring.
- **Multimodale instructies**: Bied verschillende vormen van hulp aan (tekst, video, interactieve tours) om verschillende leerstijlen te ondersteunen.

### Prestatie-optimalisatie

- **Lazy Loading**: Help-componenten worden alleen geladen wanneer ze nodig zijn.
- **Memoization**: Gebruik React.memo en useMemo voor componenten die niet vaak veranderen.
- **Lokale opslag**: Sla gebruikersvoorkeuren en tour-status op in localStorage om onnodige herhalingen te voorkomen.
- **Code splitting**: Laad help-componenten via dynamische imports om de initiële laadtijd te verminderen.
- **Conditionele rendering**: Render alleen de componenten die nodig zijn op basis van de gebruikerscontext.

## Gebruiksvoorbeeld

```jsx
import React, { useState, useEffect } from 'react';
import HelpOverlay from './HelpOverlay';
import TourGuide from './TourGuide';
import OnboardingWizard from './OnboardingWizard';
import ContextualTooltip from './ContextualTooltip';
import FAQ from './FAQ';
import VideoTutorials from './VideoTutorials';
import PersonalizedHelp from './PersonalizedHelp';

const MyComponent = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [userRole, setUserRole] = useState('general');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  
  useEffect(() => {
    // Controleer of de onboarding al is voltooid
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
    
    // Haal gebruikersvoorkeuren op
    const helpPreferences = localStorage.getItem('helpPreferences');
    if (helpPreferences) {
      const { role, experienceLevel } = JSON.parse(helpPreferences);
      setUserRole(role || 'general');
      setExperienceLevel(experienceLevel || 'intermediate');
    }
  }, []);
  
  const handleOnboardingComplete = (formData) => {
    console.log('Onboarding voltooid:', formData);
    // Verwerk de onboarding data
  };
  
  // Voorbeeld FAQ data
  const faqData = [
    {
      id: 1,
      question: 'Wat is Topic Awareness?',
      answer: 'Topic Awareness is een methode om te meten hoe bekend je doelgroep is met bepaalde onderwerpen en in welke fase van het aankoopproces ze zich bevinden.',
      category: 'Algemeen'
    },
    // Meer FAQ items
  ];
  
  // Voorbeeld video data
  const videoData = [
    {
      id: 1,
      title: 'Introductie tot MarketPulse AI',
      description: 'Een korte introductie tot de belangrijkste functies van het MarketPulse AI platform.',
      thumbnail: '/images/videos/intro-thumbnail.jpg',
      videoUrl: 'https://example.com/videos/intro.mp4',
      category: 'Beginners',
      duration: 180 // 3 minuten
    },
    // Meer video items
  ];
  
  return (
    <div>
      {/* Andere componenten */}
      
      {/* Contextual tooltips voor complexe UI-elementen */}
      <ContextualTooltip
        title="Awareness Distributie"
        content="Deze visualisatie toont de verdeling van topics over de verschillende awareness fasen."
        videoUrl="https://example.com/videos/awareness-distribution.mp4"
        learnMoreUrl="https://docs.example.com/awareness-distribution"
      >
        <button>Awareness Distributie</button>
      </ContextualTooltip>
      
      {/* Help componenten */}
      <HelpOverlay activeView={activeView} />
      
      <TourGuide 
        activeView={activeView}
        onComplete={() => console.log('Tour voltooid')}
      />
      
      <OnboardingWizard
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
      
      {/* FAQ dialog */}
      <Dialog open={showFAQ} onClose={() => setShowFAQ(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <FAQ
            title="Veelgestelde vragen"
            faqItems={faqData}
            onFeedback={(questionId, helpful) => console.log(questionId, helpful)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Video tutorials dialog */}
      <Dialog open={showVideos} onClose={() => setShowVideos(false)} maxWidth="lg" fullWidth>
        <DialogContent>
          <VideoTutorials
            title="Videotutorials"
            videos={videoData}
            onVideoView={(videoId) => console.log('Video bekeken:', videoId)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Gepersonaliseerde hulp */}
      <PersonalizedHelp
        activeView={activeView}
        userRole={userRole}
        experienceLevel={experienceLevel}
        onRoleChange={setUserRole}
        onExperienceLevelChange={setExperienceLevel}
      />
      
      {/* Help menu */}
      <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <SpeedDial
          ariaLabel="Help menu"
          icon={<HelpIcon />}
        >
          <SpeedDialAction
            icon={<QuestionAnswerIcon />}
            tooltipTitle="FAQ"
            onClick={() => setShowFAQ(true)}
          />
          <SpeedDialAction
            icon={<PlayCircleOutlineIcon />}
            tooltipTitle="Video tutorials"
            onClick={() => setShowVideos(true)}
          />
          <SpeedDialAction
            icon={<TourIcon />}
            tooltipTitle="Start tour"
            onClick={() => {
              // Reset tour status
              localStorage.removeItem('tourStatus');
              // Force re-render TourGuide
              setActiveView(prev => prev);
            }}
          />
        </SpeedDial>
      </Box>
    </div>
  );
};

export default MyComponent;
```
