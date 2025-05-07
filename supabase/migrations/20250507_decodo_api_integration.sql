-- MarketPulse AI Decodo API Integratie
-- SQL migratie script voor het aanmaken van de benodigde tabellen

-- Controleer of de tabellen al bestaan en maak ze alleen aan als ze nog niet bestaan

-- Projects tabel (indien nog niet aanwezig)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  niche TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scrape Jobs tabel
CREATE TABLE IF NOT EXISTS scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  params JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scrape Results tabel
CREATE TABLE IF NOT EXISTS scrape_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scrape_job_id UUID NOT NULL REFERENCES scrape_jobs(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  raw_data JSONB,
  processed_data JSONB,
  sentiment JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Strategies tabel
CREATE TABLE IF NOT EXISTS marketing_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  niche TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  strategy_text TEXT,
  priority TEXT DEFAULT 'medium',
  implementation_steps TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations tabel
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  phase TEXT,
  title TEXT NOT NULL,
  description TEXT,
  strategy_text TEXT,
  priority TEXT DEFAULT 'medium',
  implementation_steps TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voeg enkele voorbeeldgegevens toe voor marketingstrategieën
INSERT INTO marketing_strategies (platform, niche, title, description, strategy_text, priority, implementation_steps)
VALUES
  -- Reddit strategieën
  ('reddit', 'general', 'Reddit Community Engagement', 
   'Verhoog betrokkenheid door actief deel te nemen aan relevante subreddits', 
   'Identificeer de belangrijkste subreddits in je niche en word een waardevolle bijdrager door vragen te beantwoorden, content te delen en discussies te starten. Focus op het bieden van waarde in plaats van directe promotie.',
   'high',
   ARRAY[
     'Identificeer 5-10 relevante subreddits in je niche',
     'Analyseer de top posts van de afgelopen maand om de toon te begrijpen',
     'Begin met het beantwoorden van vragen waar je expertise kunt tonen',
     'Deel waardevolle content zonder directe promotie',
     'Bouw relaties op met moderators en actieve leden'
   ]),
  
  ('reddit', 'e-commerce', 'Reddit Product Feedback Loop', 
   'Gebruik Reddit om productfeedback te verzamelen en je aanbod te verbeteren', 
   'Creëer een feedback loop door actief te vragen om input van Reddit gebruikers over je producten. Dit helpt niet alleen bij het verbeteren van je aanbod, maar bouwt ook goodwill op binnen de community.',
   'medium',
   ARRAY[
     'Identificeer subreddits waar je doelgroep actief is',
     'Deel eerlijk je product en vraag om feedback (met toestemming van moderators)',
     'Reageer op alle feedback, zowel positief als negatief',
     'Implementeer suggesties en deel updates',
     'Beloon actieve bijdragers met kortingen of early access'
   ]),
  
  -- Amazon strategieën
  ('amazon', 'general', 'Amazon Review Optimization', 
   'Verbeter je productpagina op basis van klantreviews', 
   'Analyseer zowel positieve als negatieve reviews om je productbeschrijvingen, bullet points en A+ content te optimaliseren. Adresseer veelvoorkomende vragen en bezwaren proactief.',
   'high',
   ARRAY[
     'Verzamel en categoriseer feedback uit reviews',
     'Identificeer veelvoorkomende vragen en bezwaren',
     'Update productbeschrijvingen om deze punten te adresseren',
     'Voeg FAQ sectie toe aan A+ content',
     'Monitor verbetering in review sentiment na wijzigingen'
   ]),
  
  ('amazon', 'e-commerce', 'Amazon Keyword Targeting', 
   'Optimaliseer je Amazon listings met niche-specifieke keywords', 
   'Gebruik data van klantreviews en zoekgedrag om je Amazon listings te optimaliseren met de juiste keywords. Focus op lange-staart keywords die specifiek zijn voor je niche.',
   'high',
   ARRAY[
     'Extraheer veelgebruikte termen uit positieve reviews',
     'Onderzoek gerelateerde zoektermen met Amazon Autocomplete',
     'Analyseer listings van concurrenten op keyword gebruik',
     'Integreer keywords in titel, bullet points en beschrijving',
     'Monitor ranking verbetering voor targetkeywords'
   ]),
  
  -- Instagram strategieën
  ('instagram', 'general', 'Instagram Visual Storytelling', 
   'Creëer een consistente visuele identiteit die resoneert met je doelgroep', 
   'Ontwikkel een herkenbare visuele stijl die je merkwaarden communiceert en aanspreekt bij je doelgroep. Consistentie in kleurgebruik, compositie en beeldtaal versterkt je merkidentiteit.',
   'medium',
   ARRAY[
     'Definieer je visuele merkidentiteit (kleuren, stijl, compositie)',
     'Creëer content templates voor verschillende post types',
     'Plan content in thematische series voor visuele cohesie',
     'Gebruik consistente filters en bewerkingsstijl',
     'Wissel productfoto\'s af met lifestyle en behind-the-scenes content'
   ]),
  
  ('instagram', 'e-commerce', 'Instagram Shopping Experience', 
   'Optimaliseer je Instagram profiel voor e-commerce conversies', 
   'Transformeer je Instagram profiel in een verkoopkanaal door gebruik te maken van shoppable posts, strategische bio links en product showcases in Stories en Reels.',
   'high',
   ARRAY[
     'Set up Instagram Shopping en tag producten in posts',
     'Creëer een geoptimaliseerde link-in-bio pagina',
     'Ontwikkel product showcase templates voor Stories',
     'Maak korte product demo\'s voor Reels',
     'Gebruik call-to-actions in captions die aanzetten tot kopen'
   ]),
  
  -- TikTok strategieën
  ('tiktok', 'general', 'TikTok Trend Participation', 
   'Verhoog bereik door deel te nemen aan relevante TikTok trends', 
   'Identificeer en participeer in trending challenges en formats, maar geef er een unieke draai aan die past bij je merk. Dit vergroot je bereik en toont de menselijke kant van je merk.',
   'medium',
   ARRAY[
     'Monitor dagelijks de Discover pagina voor nieuwe trends',
     'Selecteer trends die passen bij je merkwaarden',
     'Geef een unieke, merkgerelateerde draai aan de trend',
     'Reageer snel op nieuwe trends (binnen 24-48 uur)',
     'Gebruik trending audio maar met originele visuele content'
   ]),
  
  ('tiktok', 'e-commerce', 'TikTok Product Demonstrations', 
   'Toon productvoordelen via korte, impactvolle demonstraties', 
   'Creëer korte, boeiende productdemonstraties die de unieke voordelen van je product tonen. Focus op het oplossen van specifieke problemen en gebruik een before/after format waar mogelijk.',
   'high',
   ARRAY[
     'Identificeer de meest visueel impactvolle productvoordelen',
     'Creëer 15-seconden demonstraties voor elk voordeel',
     'Gebruik before/after format waar mogelijk',
     'Voeg tekst overlay toe voor belangrijke punten',
     'Eindig met een duidelijke call-to-action'
   ]),
  
  -- Trustpilot strategieën
  ('trustpilot', 'general', 'Trustpilot Review Management', 
   'Bouw vertrouwen door actief beheer van Trustpilot reviews', 
   'Reageer proactief op alle reviews, zowel positief als negatief. Toon waardering voor positieve feedback en los problemen publiekelijk op bij negatieve reviews om transparantie te tonen.',
   'high',
   ARRAY[
     'Stel een systeem in voor dagelijkse monitoring van nieuwe reviews',
     'Ontwikkel templates voor het beantwoorden van verschillende review types',
     'Reageer binnen 24 uur op alle reviews',
     'Los klachten publiekelijk op en bied compensatie waar nodig',
     'Vraag tevreden klanten om hun review te delen op sociale media'
   ]),
  
  ('trustpilot', 'e-commerce', 'Trustpilot Social Proof Integration', 
   'Integreer Trustpilot reviews in je marketingkanalen', 
   'Maximaliseer de impact van positieve Trustpilot reviews door ze strategisch te integreren in je website, e-mails, advertenties en sociale media om vertrouwen te versterken.',
   'medium',
   ARRAY[
     'Voeg Trustpilot widget toe aan je homepage en productpagina\'s',
     'Integreer specifieke productreviews op relevante productpagina\'s',
     'Neem top reviews op in e-mailcampagnes',
     'Creëer social media posts met quotes uit positieve reviews',
     'Gebruik Trustpilot rating in Google en Facebook advertenties'
   ]);

-- Voeg een index toe voor betere query performance
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_project_id ON scrape_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_scrape_results_scrape_job_id ON scrape_results(scrape_job_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_project_id ON recommendations(project_id);
CREATE INDEX IF NOT EXISTS idx_marketing_strategies_niche ON marketing_strategies(niche);
CREATE INDEX IF NOT EXISTS idx_marketing_strategies_platform ON marketing_strategies(platform);