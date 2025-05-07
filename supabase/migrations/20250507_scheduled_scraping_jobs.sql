-- MarketPulse AI Periodieke Scraping Taken
-- SQL migratie script voor het aanmaken van de scheduled_scrape_jobs tabel

-- Scheduled Scrape Jobs tabel
CREATE TABLE IF NOT EXISTS scheduled_scrape_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  url TEXT NOT NULL,
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  day_of_week INTEGER, -- 0-6, waarbij 0 = zondag (voor wekelijkse taken)
  day_of_month INTEGER, -- 1-31 (voor maandelijkse taken)
  time_of_day TIME NOT NULL, -- Tijd van de dag in 24-uurs formaat
  params JSONB, -- Aangepaste parameters voor de scraping taak
  active BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voeg een index toe voor betere query performance
CREATE INDEX IF NOT EXISTS idx_scheduled_scrape_jobs_project_id ON scheduled_scrape_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_scrape_jobs_next_run ON scheduled_scrape_jobs(next_run);
CREATE INDEX IF NOT EXISTS idx_scheduled_scrape_jobs_active ON scheduled_scrape_jobs(active);

-- Voeg een trigger toe om de updated_at te updaten wanneer een rij wordt bijgewerkt
CREATE OR REPLACE FUNCTION update_scheduled_scrape_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scheduled_scrape_jobs_updated_at
BEFORE UPDATE ON scheduled_scrape_jobs
FOR EACH ROW
EXECUTE FUNCTION update_scheduled_scrape_jobs_updated_at();
