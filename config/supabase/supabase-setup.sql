-- MarketPulse AI Supabase Setup
-- Gegenereerd op 2025-05-02T14:25:38.976Z

-- Tabellen aanmaken
-- Aanmaken van tabel users
CREATE TABLE IF NOT EXISTS public.users (
  "id" uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" text NOT NULL UNIQUE,
  "full_name" text,
  "avatar_url" text,
  "role" text DEFAULT 'user',
  "company" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Commentaar toevoegen aan tabel
COMMENT ON TABLE public.users IS 'MarketPulse AI users tabel';

-- Aanmaken van index users_email_idx
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users ("email");

-- Aanmaken van tabel projects
CREATE TABLE IF NOT EXISTS public.projects (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "user_id" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "settings" jsonb DEFAULT {},
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Commentaar toevoegen aan tabel
COMMENT ON TABLE public.projects IS 'MarketPulse AI projects tabel';

-- Aanmaken van index projects_user_id_idx
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects ("user_id");

-- Aanmaken van tabel scrape_jobs
CREATE TABLE IF NOT EXISTS public.scrape_jobs (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "platform" text NOT NULL,
  "options" jsonb NOT NULL,
  "schedule" text,
  "status" text NOT NULL DEFAULT 'pending',
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "result_count" integer,
  "error" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Commentaar toevoegen aan tabel
COMMENT ON TABLE public.scrape_jobs IS 'MarketPulse AI scrape_jobs tabel';

-- Aanmaken van index scrape_jobs_project_id_idx
CREATE INDEX IF NOT EXISTS scrape_jobs_project_id_idx ON public.scrape_jobs ("project_id");

-- Aanmaken van index scrape_jobs_status_idx
CREATE INDEX IF NOT EXISTS scrape_jobs_status_idx ON public.scrape_jobs ("status");

-- Aanmaken van index scrape_jobs_platform_idx
CREATE INDEX IF NOT EXISTS scrape_jobs_platform_idx ON public.scrape_jobs ("platform");

-- Aanmaken van tabel scrape_results
CREATE TABLE IF NOT EXISTS public.scrape_results (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "job_id" uuid REFERENCES scrape_jobs(id) ON DELETE CASCADE,
  "project_id" uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "platform" text NOT NULL,
  "options" jsonb NOT NULL,
  "result" jsonb,
  "processed" boolean,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Commentaar toevoegen aan tabel
COMMENT ON TABLE public.scrape_results IS 'MarketPulse AI scrape_results tabel';

-- Aanmaken van index scrape_results_job_id_idx
CREATE INDEX IF NOT EXISTS scrape_results_job_id_idx ON public.scrape_results ("job_id");

-- Aanmaken van index scrape_results_project_id_idx
CREATE INDEX IF NOT EXISTS scrape_results_project_id_idx ON public.scrape_results ("project_id");

-- Aanmaken van index scrape_results_platform_idx
CREATE INDEX IF NOT EXISTS scrape_results_platform_idx ON public.scrape_results ("platform");

-- Aanmaken van index scrape_results_processed_idx
CREATE INDEX IF NOT EXISTS scrape_results_processed_idx ON public.scrape_results ("processed");

-- Aanmaken van tabel insights
CREATE TABLE IF NOT EXISTS public.insights (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "result_id" uuid REFERENCES scrape_results(id) ON DELETE CASCADE,
  "type" text NOT NULL,
  "category" text,
  "data" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Commentaar toevoegen aan tabel
COMMENT ON TABLE public.insights IS 'MarketPulse AI insights tabel';

-- Aanmaken van index insights_project_id_idx
CREATE INDEX IF NOT EXISTS insights_project_id_idx ON public.insights ("project_id");

-- Aanmaken van index insights_result_id_idx
CREATE INDEX IF NOT EXISTS insights_result_id_idx ON public.insights ("result_id");

-- Aanmaken van index insights_type_idx
CREATE INDEX IF NOT EXISTS insights_type_idx ON public.insights ("type");

-- Aanmaken van index insights_category_idx
CREATE INDEX IF NOT EXISTS insights_category_idx ON public.insights ("category");

-- Row Level Security Policies
-- Inschakelen van Row Level Security voor users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Aanmaken van policy users_select_own
CREATE POLICY users_select_own
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Aanmaken van policy users_update_own
CREATE POLICY users_update_own
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Inschakelen van Row Level Security voor projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Aanmaken van policy projects_select_own
CREATE POLICY projects_select_own
ON public.projects
FOR SELECT
USING (auth.uid() = user_id);

-- Aanmaken van policy projects_insert_own
CREATE POLICY projects_insert_own
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Aanmaken van policy projects_update_own
CREATE POLICY projects_update_own
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Aanmaken van policy projects_delete_own
CREATE POLICY projects_delete_own
ON public.projects
FOR DELETE
USING (auth.uid() = user_id);

-- Inschakelen van Row Level Security voor scrape_jobs
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

-- Aanmaken van policy scrape_jobs_select_own_project
CREATE POLICY scrape_jobs_select_own_project
ON public.scrape_jobs
FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Aanmaken van policy scrape_jobs_insert_own_project
CREATE POLICY scrape_jobs_insert_own_project
ON public.scrape_jobs
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Aanmaken van policy scrape_jobs_update_own_project
CREATE POLICY scrape_jobs_update_own_project
ON public.scrape_jobs
FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id))
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Aanmaken van policy scrape_jobs_delete_own_project
CREATE POLICY scrape_jobs_delete_own_project
ON public.scrape_jobs
FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Inschakelen van Row Level Security voor scrape_results
ALTER TABLE public.scrape_results ENABLE ROW LEVEL SECURITY;

-- Aanmaken van policy scrape_results_select_own_project
CREATE POLICY scrape_results_select_own_project
ON public.scrape_results
FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Aanmaken van policy scrape_results_insert_own_project
CREATE POLICY scrape_results_insert_own_project
ON public.scrape_results
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Aanmaken van policy scrape_results_update_own_project
CREATE POLICY scrape_results_update_own_project
ON public.scrape_results
FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id))
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Aanmaken van policy scrape_results_delete_own_project
CREATE POLICY scrape_results_delete_own_project
ON public.scrape_results
FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Inschakelen van Row Level Security voor insights
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Aanmaken van policy insights_select_own_project
CREATE POLICY insights_select_own_project
ON public.insights
FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Aanmaken van policy insights_insert_own_project
CREATE POLICY insights_insert_own_project
ON public.insights
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Aanmaken van policy insights_update_own_project
CREATE POLICY insights_update_own_project
ON public.insights
FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id))
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Aanmaken van policy insights_delete_own_project
CREATE POLICY insights_delete_own_project
ON public.insights
FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- Storage Buckets
-- Aanmaken van storage bucket datasets
INSERT INTO storage.buckets (id, name, public)
VALUES ('datasets', 'datasets', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Aanmaken van storage policy datasets_select_own_project
CREATE POLICY datasets_select_own_project
ON storage.objects
FOR SELECT
USING (bucket_id = 'datasets' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- Aanmaken van storage policy datasets_insert_own_project
CREATE POLICY datasets_insert_own_project
ON storage.objects
FOR INSERT
USING (bucket_id = 'datasets')WITH CHECK (bucket_id = 'datasets' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- Aanmaken van storage policy datasets_update_own_project
CREATE POLICY datasets_update_own_project
ON storage.objects
FOR UPDATE
USING (bucket_id = 'datasets' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)))
WITH CHECK (bucket_id = 'datasets' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- Aanmaken van storage policy datasets_delete_own_project
CREATE POLICY datasets_delete_own_project
ON storage.objects
FOR DELETE
USING (bucket_id = 'datasets' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- Aanmaken van storage bucket exports
INSERT INTO storage.buckets (id, name, public)
VALUES ('exports', 'exports', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Aanmaken van storage policy exports_select_own_project
CREATE POLICY exports_select_own_project
ON storage.objects
FOR SELECT
USING (bucket_id = 'exports' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- Aanmaken van storage policy exports_insert_own_project
CREATE POLICY exports_insert_own_project
ON storage.objects
FOR INSERT
USING (bucket_id = 'exports')WITH CHECK (bucket_id = 'exports' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- Aanmaken van storage policy exports_update_own_project
CREATE POLICY exports_update_own_project
ON storage.objects
FOR UPDATE
USING (bucket_id = 'exports' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)))
WITH CHECK (bucket_id = 'exports' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- Aanmaken van storage policy exports_delete_own_project
CREATE POLICY exports_delete_own_project
ON storage.objects
FOR DELETE
USING (bucket_id = 'exports' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- Triggers en functies
-- Functie voor het bijwerken van updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger voor het bijwerken van updated_at in users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Trigger voor het bijwerken van updated_at in projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Trigger voor het bijwerken van updated_at in scrape_jobs
CREATE TRIGGER update_scrape_jobs_updated_at
BEFORE UPDATE ON public.scrape_jobs
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Trigger voor het bijwerken van updated_at in scrape_results
CREATE TRIGGER update_scrape_results_updated_at
BEFORE UPDATE ON public.scrape_results
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Trigger voor het bijwerken van updated_at in insights
CREATE TRIGGER update_insights_updated_at
BEFORE UPDATE ON public.insights
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

