-- Custom roles voor MarketPulse AI
-- Run dit script in de SQL editor van Supabase

-- Readonly role voor rapportage en analytics
CREATE ROLE readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly;

-- API role voor API endpoints
CREATE ROLE api_role;
GRANT USAGE ON SCHEMA public TO api_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO api_role;
GRANT INSERT, UPDATE, DELETE ON TABLE public.scrape_jobs, public.scrape_results, public.insights TO api_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO api_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES public.scrape_jobs, public.scrape_results, public.insights TO api_role;

-- Admin role voor volledige toegang
CREATE ROLE admin_role;
GRANT USAGE ON SCHEMA public TO admin_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO admin_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO admin_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO admin_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO admin_role;

-- Storage role voor toegang tot storage buckets
CREATE ROLE storage_role;
GRANT USAGE ON SCHEMA storage TO storage_role;
GRANT SELECT ON ALL TABLES IN SCHEMA storage TO storage_role;
GRANT INSERT, UPDATE, DELETE ON TABLE storage.objects TO storage_role;
GRANT USAGE ON SCHEMA auth TO storage_role;
GRANT SELECT ON TABLE auth.users TO storage_role;

-- RLS policies voor de custom roles
-- Readonly role kan alleen data zien van projecten waar ze toegang toe hebben
CREATE POLICY "Readonly users can view their projects" ON public.projects
  FOR SELECT
  TO readonly
  USING (user_id IN (SELECT user_id FROM public.project_members WHERE role = 'viewer'));

CREATE POLICY "Readonly users can view data from their projects" ON public.scrape_jobs
  FOR SELECT
  TO readonly
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id IN (SELECT user_id FROM public.project_members WHERE role = 'viewer')));

CREATE POLICY "Readonly users can view results from their projects" ON public.scrape_results
  FOR SELECT
  TO readonly
  USING (job_id IN (SELECT id FROM public.scrape_jobs WHERE project_id IN (SELECT id FROM public.projects WHERE user_id IN (SELECT user_id FROM public.project_members WHERE role = 'viewer'))));

CREATE POLICY "Readonly users can view insights from their projects" ON public.insights
  FOR SELECT
  TO readonly
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id IN (SELECT user_id FROM public.project_members WHERE role = 'viewer')));

-- API role kan data toevoegen, bijwerken en verwijderen voor projecten waar ze toegang toe hebben
CREATE POLICY "API role can view all data" ON public.projects
  FOR SELECT
  TO api_role
  USING (true);

CREATE POLICY "API role can insert jobs" ON public.scrape_jobs
  FOR INSERT
  TO api_role
  WITH CHECK (project_id IN (SELECT id FROM public.projects));

CREATE POLICY "API role can update jobs" ON public.scrape_jobs
  FOR UPDATE
  TO api_role
  USING (true);

CREATE POLICY "API role can delete jobs" ON public.scrape_jobs
  FOR DELETE
  TO api_role
  USING (true);

CREATE POLICY "API role can insert results" ON public.scrape_results
  FOR INSERT
  TO api_role
  WITH CHECK (job_id IN (SELECT id FROM public.scrape_jobs));

CREATE POLICY "API role can update results" ON public.scrape_results
  FOR UPDATE
  TO api_role
  USING (true);

CREATE POLICY "API role can delete results" ON public.scrape_results
  FOR DELETE
  TO api_role
  USING (true);

CREATE POLICY "API role can insert insights" ON public.insights
  FOR INSERT
  TO api_role
  WITH CHECK (project_id IN (SELECT id FROM public.projects));

CREATE POLICY "API role can update insights" ON public.insights
  FOR UPDATE
  TO api_role
  USING (true);

CREATE POLICY "API role can delete insights" ON public.insights
  FOR DELETE
  TO api_role
  USING (true);

-- Storage role kan bestanden beheren in de storage buckets
CREATE POLICY "Storage role can view files" ON storage.objects
  FOR SELECT
  TO storage_role
  USING (true);

CREATE POLICY "Storage role can upload files" ON storage.objects
  FOR INSERT
  TO storage_role
  WITH CHECK (bucket_id IN ('datasets', 'exports'));

CREATE POLICY "Storage role can update files" ON storage.objects
  FOR UPDATE
  TO storage_role
  USING (bucket_id IN ('datasets', 'exports'));

CREATE POLICY "Storage role can delete files" ON storage.objects
  FOR DELETE
  TO storage_role
  USING (bucket_id IN ('datasets', 'exports'));

-- Geef de service role alle rechten
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

-- Maak gebruikers voor de verschillende roles
-- LET OP: Vervang 'secure_password' door een veilig wachtwoord in productie
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT readonly TO readonly_user;

CREATE USER api_user WITH PASSWORD 'secure_password';
GRANT api_role TO api_user;

CREATE USER admin_user WITH PASSWORD 'secure_password';
GRANT admin_role TO admin_user;

CREATE USER storage_user WITH PASSWORD 'secure_password';
GRANT storage_role TO storage_user;

-- Voeg commentaar toe aan de roles voor documentatie
COMMENT ON ROLE readonly IS 'Role voor alleen-lezen toegang tot data voor rapportage en analytics';
COMMENT ON ROLE api_role IS 'Role voor API endpoints met beperkte schrijfrechten';
COMMENT ON ROLE admin_role IS 'Role voor volledige administratieve toegang';
COMMENT ON ROLE storage_role IS 'Role voor het beheren van bestanden in storage buckets';

-- Voeg commentaar toe aan de gebruikers voor documentatie
COMMENT ON ROLE readonly_user IS 'Gebruiker voor alleen-lezen toegang tot data';
COMMENT ON ROLE api_user IS 'Gebruiker voor API endpoints';
COMMENT ON ROLE admin_user IS 'Gebruiker voor administratieve taken';
COMMENT ON ROLE storage_user IS 'Gebruiker voor storage operaties';
