-- MarketPulse AI Database Schema
-- Dit bestand bevat de SQL definities voor de database tabellen in Supabase

-- Gebruikers tabel (wordt automatisch aangemaakt door Supabase Auth)
-- We breiden deze uit met extra velden
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP WITH TIME ZONE;

-- Projecten tabel
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_audience TEXT,
    industry TEXT,
    keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS (Row Level Security) voor projecten
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Alleen eigenaren kunnen hun eigen projecten zien en bewerken
CREATE POLICY "Gebruikers kunnen alleen hun eigen projecten zien" 
    ON public.projects FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Gebruikers kunnen alleen hun eigen projecten aanmaken" 
    ON public.projects FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gebruikers kunnen alleen hun eigen projecten bijwerken" 
    ON public.projects FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Gebruikers kunnen alleen hun eigen projecten verwijderen" 
    ON public.projects FOR DELETE 
    USING (auth.uid() = user_id);

-- Scrape jobs tabel
CREATE TABLE IF NOT EXISTS public.scrape_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('reddit', 'amazon', 'instagram', 'tiktok', 'trustpilot')),
    job_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    urls TEXT[],
    options JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- RLS voor scrape jobs
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

-- Alleen eigenaren van het project kunnen de bijbehorende scrape jobs zien en bewerken
CREATE POLICY "Gebruikers kunnen alleen scrape jobs van hun eigen projecten zien"
    ON public.scrape_jobs FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.projects WHERE id = project_id
        )
    );

CREATE POLICY "Gebruikers kunnen alleen scrape jobs voor hun eigen projecten aanmaken"
    ON public.scrape_jobs FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.projects WHERE id = project_id
        )
    );

CREATE POLICY "Gebruikers kunnen alleen scrape jobs van hun eigen projecten bijwerken"
    ON public.scrape_jobs FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.projects WHERE id = project_id
        )
    );

CREATE POLICY "Gebruikers kunnen alleen scrape jobs van hun eigen projecten verwijderen"
    ON public.scrape_jobs FOR DELETE
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.projects WHERE id = project_id
        )
    );

-- Scrape resultaten tabel
CREATE TABLE IF NOT EXISTS public.scrape_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.scrape_jobs(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS voor scrape resultaten
ALTER TABLE public.scrape_results ENABLE ROW LEVEL SECURITY;

-- Alleen eigenaren van het project kunnen de bijbehorende scrape resultaten zien
CREATE POLICY "Gebruikers kunnen alleen scrape resultaten van hun eigen projecten zien"
    ON public.scrape_results FOR SELECT
    USING (
        auth.uid() IN (
            SELECT p.user_id 
            FROM public.projects p
            JOIN public.scrape_jobs j ON p.id = j.project_id
            WHERE j.id = job_id
        )
    );

-- Insights tabel voor geanalyseerde data
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('pain_point', 'desire', 'language', 'trend', 'competitor', 'opportunity')),
    data JSONB NOT NULL,
    source_jobs UUID[] REFERENCES public.scrape_jobs(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS voor insights
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Alleen eigenaren van het project kunnen de bijbehorende insights zien en bewerken
CREATE POLICY "Gebruikers kunnen alleen insights van hun eigen projecten zien"
    ON public.insights FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.projects WHERE id = project_id
        )
    );

CREATE POLICY "Gebruikers kunnen alleen insights voor hun eigen projecten aanmaken"
    ON public.insights FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.projects WHERE id = project_id
        )
    );

CREATE POLICY "Gebruikers kunnen alleen insights van hun eigen projecten bijwerken"
    ON public.insights FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.projects WHERE id = project_id
        )
    );

CREATE POLICY "Gebruikers kunnen alleen insights van hun eigen projecten verwijderen"
    ON public.insights FOR DELETE
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.projects WHERE id = project_id
        )
    );

-- Functies en triggers voor automatische updates van updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_scrape_jobs_updated_at
BEFORE UPDATE ON public.scrape_jobs
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_insights_updated_at
BEFORE UPDATE ON public.insights
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Indexen voor betere prestaties
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS scrape_jobs_project_id_idx ON public.scrape_jobs(project_id);
CREATE INDEX IF NOT EXISTS scrape_jobs_status_idx ON public.scrape_jobs(status);
CREATE INDEX IF NOT EXISTS scrape_results_job_id_idx ON public.scrape_results(job_id);
CREATE INDEX IF NOT EXISTS insights_project_id_idx ON public.insights(project_id);
CREATE INDEX IF NOT EXISTS insights_type_idx ON public.insights(type);
