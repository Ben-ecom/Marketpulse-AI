/**
 * Voorbeelddata voor de help-componenten
 * 
 * Deze data wordt gebruikt voor de FAQ, videotutorials en andere help-componenten.
 * In een productieomgeving zou deze data uit een API of CMS komen.
 */

/**
 * FAQ items voor de FAQ component
 * @type {Array}
 */
export const faqItems = [
  {
    id: 1,
    question: 'Wat is MarketPulse AI?',
    answer: 'MarketPulse AI is een SaaS platform voor e-commerce doelgroeponderzoek dat data verzamelt van meerdere platforms (Reddit, Amazon, Instagram/TikTok, Trustpilot) om inzicht te geven in pijnpunten, verlangens en taalgebruik van je doelgroep. Het platform helpt je bij het genereren van actionable insights voor marketing en productverbetering.',
    category: 'Algemeen'
  },
  {
    id: 2,
    question: 'Wat zijn de 5 awareness fasen van Eugene Schwartz?',
    answer: 'De 5 awareness fasen zijn: 1) Unaware Fase - Geen bewustzijn van het probleem, 2) Problem Aware Fase - Bewust van het probleem, niet van oplossingen, 3) Solution Aware Fase - Bewust van oplossingstypen, niet van specifieke producten, 4) Product Aware Fase - Bewust van specifieke producten, nog niet overtuigd, 5) Most Aware Fase - Volledig bewust, klaar voor aankoop. MarketPulse AI helpt je te bepalen in welke fase je doelgroep zich bevindt.',
    category: 'Algemeen'
  },
  {
    id: 3,
    question: 'Hoe verzamelt MarketPulse AI data?',
    answer: 'MarketPulse AI gebruikt geavanceerde scraping technologie met Puppeteer, Puppeteer-extra en Puppeteer-stealth met roterende proxy\'s. We hebben specifieke scrapers voor verschillende platforms zoals Reddit, Amazon Reviews, Instagram/TikTok en Trustpilot. Deze scrapers verzamelen relevante data zoals posts, comments, reviews, ratings en engagement metrics.',
    category: 'Technisch'
  },
  {
    id: 4,
    question: 'Hoe werkt de sentiment analyse in MarketPulse AI?',
    answer: 'De sentiment analyse in MarketPulse AI gebruikt natural language processing om tekst te categoriseren als positief, negatief of neutraal. We bieden visualisaties zoals pie charts voor sentiment verdeling, trend charts voor sentiment over tijd, en statistieken zoals gemiddelde en mediaan. Je kunt filteren op platform en tijdsperiode om specifieke inzichten te krijgen.',
    category: 'Analyse'
  },
  {
    id: 5,
    question: 'Kan ik niche-specifieke marketingstrategieën opslaan?',
    answer: 'Ja, MarketPulse AI stelt admins in staat om uitgebreide marketingstrategieën (3000-5000 woorden) op te slaan voor specifieke niches of producten. Wanneer een gebruiker een niche invoert, gebruikt het systeem automatisch de strategie die specifiek voor die niche is opgeslagen, wat resulteert in meer gerichte en relevante aanbevelingen.',
    category: 'Gebruik'
  },
  {
    id: 6,
    question: 'Hoe kan ik de Amazon Reviews scraper gebruiken?',
    answer: 'De Amazon Reviews scraper kan worden geconfigureerd via het Data Collection dashboard. Je kunt filteren op sterrenratings, sorteren op relevantie of datum, en meerdere pagina\'s reviews verzamelen. De scraper extraheert reviews met metadata zoals rating, titel, datum en verified status. Let op: gebruik deze functie verantwoordelijk en in overeenstemming met Amazon\'s Terms of Service.',
    category: 'Gebruik'
  },
  {
    id: 7,
    question: 'Hoe kan ik het Topic Awareness Rapport interpreteren?',
    answer: 'Het Topic Awareness Rapport toont de verdeling van topics over de verschillende awareness fasen, trending topics, en content aanbevelingen per fase. Gebruik de awareness distributie om te begrijpen waar je doelgroep zich bevindt in hun customer journey, en de content aanbevelingen om je marketingstrategie hierop af te stemmen. De trending topics helpen je in te spelen op opkomende trends.',
    category: 'Analyse'
  },
  {
    id: 8,
    question: 'Kan ik de data exporteren naar andere tools?',
    answer: 'Ja, je kunt data exporteren in verschillende formaten zoals PDF, Excel of CSV. Ga naar het rapport scherm en gebruik de export opties rechtsonder. Je kunt kiezen welke secties je wilt opnemen in het rapport en privacy-instellingen configureren. De geëxporteerde data kan worden gebruikt in tools zoals Google Analytics, Excel of CRM-systemen.',
    category: 'Gebruik'
  },
  {
    id: 9,
    question: 'Hoe vaak wordt de data bijgewerkt?',
    answer: 'De data wordt standaard elke 24 uur bijgewerkt. Premium gebruikers kunnen kiezen voor real-time updates of aangepaste update frequenties instellen via de instellingen pagina. Je kunt ook handmatig een update triggeren via de refresh knop in het dashboard.',
    category: 'Gebruik'
  },
  {
    id: 10,
    question: 'Hoe kan ik de help-functionaliteit gebruiken?',
    answer: 'De help-functionaliteit is toegankelijk via het help-icoon rechtsonder in elke pagina. Je kunt kiezen uit verschillende help-methoden zoals contextuele tooltips, een help menu met FAQ\'s en videotutorials, of gepersonaliseerde hulp op basis van je rol en ervaringsniveau. Voor nieuwe gebruikers is er ook een onboarding wizard beschikbaar.',
    category: 'Gebruik'
  },
  {
    id: 11,
    question: 'Hoe kan ik mijn team toegang geven tot MarketPulse AI?',
    answer: 'Als admin kun je teamleden uitnodigen via het Admin Dashboard. Ga naar Instellingen > Team en klik op "Lid toevoegen". Vul het e-mailadres in en selecteer de juiste rol (Admin, Analist, Viewer). De uitgenodigde persoon ontvangt een e-mail met instructies om een account aan te maken.',
    category: 'Gebruik'
  },
  {
    id: 12,
    question: 'Welke platforms worden ondersteund voor dataverzameling?',
    answer: 'MarketPulse AI ondersteunt momenteel dataverzameling van Reddit, Amazon, Instagram/TikTok en Trustpilot. Voor elk platform verzamelen we specifieke data: Reddit (posts, comments, sentiment), Amazon (reviews, ratings, productkenmerken), Instagram/TikTok (posts, engagement metrics, hashtags) en Trustpilot (merkreviews, ratings, vergelijkingen).',
    category: 'Algemeen'
  },
  {
    id: 13,
    question: 'Hoe kan ik de MarketInsights pagina gebruiken?',
    answer: 'De MarketInsights pagina biedt een overzicht van markttrends, concurrentieanalyse en klantreviews. Je kunt filteren op tijdsperiode, product categorie en geografische locatie. De pagina bevat visualisaties zoals trend grafieken, competitor maps en word clouds van veelgebruikte termen in reviews.',
    category: 'Gebruik'
  },
  {
    id: 14,
    question: 'Is MarketPulse AI GDPR-compliant?',
    answer: 'Ja, MarketPulse AI is GDPR-compliant. We verzamelen alleen publiek beschikbare data en anonimiseren persoonlijke informatie. Je kunt privacy-instellingen configureren via het Admin Dashboard en bepalen welke data wordt opgeslagen en voor hoe lang. We bieden ook tools voor data-export en -verwijdering conform GDPR-vereisten.',
    category: 'Algemeen'
  },
  {
    id: 15,
    question: 'Hoe kan ik feedback geven over de help-functionaliteit?',
    answer: 'Je kunt feedback geven over de help-functionaliteit via de feedback knoppen onderaan elke help-sectie. Klik op "Ja" of "Nee" bij de vraag "Was dit nuttig?" en geef optioneel meer details. Je feedback helpt ons de help-content te verbeteren en aan te passen aan gebruikersbehoeften.',
    category: 'Gebruik'
  }
];

/**
 * Videotutorial items voor de VideoTutorials component
 * @type {Array}
 */
export const videoTutorials = [
  {
    id: 1,
    title: 'Introductie tot MarketPulse AI',
    description: 'Een korte introductie tot de belangrijkste functies van het MarketPulse AI platform.',
    thumbnail: 'https://via.placeholder.com/320x180.png?text=Introductie+MarketPulse+AI',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Beginners',
    duration: 180 // 3 minuten
  },
  {
    id: 2,
    title: 'Topic Awareness Analyse Uitgelegd',
    description: 'Leer hoe je topic awareness analyses kunt uitvoeren en interpreteren.',
    thumbnail: 'https://via.placeholder.com/320x180.png?text=Topic+Awareness+Analyse',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Beginners',
    duration: 240 // 4 minuten
  },
  {
    id: 3,
    title: 'Geavanceerde Filtering en Segmentatie',
    description: 'Ontdek hoe je geavanceerde filters kunt gebruiken om specifieke doelgroepsegmenten te analyseren.',
    thumbnail: 'https://via.placeholder.com/320x180.png?text=Filtering+en+Segmentatie',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Gevorderden',
    duration: 300 // 5 minuten
  },
  {
    id: 4,
    title: 'Rapportages Maken en Delen',
    description: 'Leer hoe je professionele rapportages kunt maken en delen met stakeholders.',
    thumbnail: 'https://via.placeholder.com/320x180.png?text=Rapportages',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Gebruik',
    duration: 270 // 4.5 minuten
  },
  {
    id: 5,
    title: 'Sentiment Analyse Masterclass',
    description: 'Diepgaande uitleg over hoe je sentiment analyse kunt gebruiken voor betere marketingbeslissingen.',
    thumbnail: 'https://via.placeholder.com/320x180.png?text=Sentiment+Analyse',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Analyse',
    duration: 360 // 6 minuten
  },
  {
    id: 6,
    title: 'Trend Analyse en Voorspellingen',
    description: 'Leer hoe je trends kunt analyseren en voorspellingen kunt doen over toekomstige ontwikkelingen.',
    thumbnail: 'https://via.placeholder.com/320x180.png?text=Trend+Analyse',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Analyse',
    duration: 330 // 5.5 minuten
  },
  {
    id: 7,
    title: 'Content Strategie Ontwikkelen',
    description: 'Ontdek hoe je de inzichten uit MarketPulse AI kunt omzetten in een effectieve content strategie.',
    thumbnail: 'https://via.placeholder.com/320x180.png?text=Content+Strategie',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Strategie',
    duration: 390 // 6.5 minuten
  },
  {
    id: 8,
    title: 'API Integratie voor Ontwikkelaars',
    description: 'Technische handleiding voor het integreren van de MarketPulse AI API in je eigen applicaties.',
    thumbnail: 'https://via.placeholder.com/320x180.png?text=API+Integratie',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    category: 'Technisch',
    duration: 420 // 7 minuten
  }
];

/**
 * Categorieën voor de FAQ en VideoTutorials componenten
 * @type {Array}
 */
export const helpCategories = [
  'Algemeen',
  'Gebruik',
  'Analyse',
  'Strategie',
  'Technisch',
  'Beginners',
  'Gevorderden'
];
