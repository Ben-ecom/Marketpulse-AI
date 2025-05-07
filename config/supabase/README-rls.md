# MarketPulse AI - Row Level Security (RLS) Policies

Dit document beschrijft de Row Level Security (RLS) policies die zijn geïmplementeerd in de Supabase database voor MarketPulse AI. Deze policies zorgen ervoor dat gebruikers alleen toegang hebben tot hun eigen data en dat data van andere gebruikers is afgeschermd.

## Wat is Row Level Security?

Row Level Security (RLS) is een beveiligingsmechanisme in PostgreSQL (en dus Supabase) dat toegang tot rijen in een tabel beperkt op basis van de identiteit van de gebruiker die de query uitvoert. RLS zorgt ervoor dat gebruikers alleen de rijen kunnen zien en bewerken waartoe ze geautoriseerd zijn.

## RLS Policies in MarketPulse AI

### Users Tabel

| Policy | Operatie | Beschrijving |
|--------|----------|-------------|
| `users_select_own` | SELECT | Gebruikers kunnen alleen hun eigen profiel zien |
| `users_update_own` | UPDATE | Gebruikers kunnen alleen hun eigen profiel bijwerken |

```sql
-- Inschakelen van RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY users_select_own
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- UPDATE policy
CREATE POLICY users_update_own
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Projects Tabel

| Policy | Operatie | Beschrijving |
|--------|----------|-------------|
| `projects_select_own` | SELECT | Gebruikers kunnen alleen hun eigen projecten zien |
| `projects_insert_own` | INSERT | Gebruikers kunnen alleen projecten aanmaken met hun eigen user_id |
| `projects_update_own` | UPDATE | Gebruikers kunnen alleen hun eigen projecten bijwerken |
| `projects_delete_own` | DELETE | Gebruikers kunnen alleen hun eigen projecten verwijderen |

```sql
-- Inschakelen van RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY projects_select_own
ON public.projects
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY projects_insert_own
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY projects_update_own
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY projects_delete_own
ON public.projects
FOR DELETE
USING (auth.uid() = user_id);
```

### Scrape Jobs Tabel

| Policy | Operatie | Beschrijving |
|--------|----------|-------------|
| `scrape_jobs_select_own_project` | SELECT | Gebruikers kunnen alleen jobs zien van hun eigen projecten |
| `scrape_jobs_insert_own_project` | INSERT | Gebruikers kunnen alleen jobs aanmaken voor hun eigen projecten |
| `scrape_jobs_update_own_project` | UPDATE | Gebruikers kunnen alleen jobs bijwerken van hun eigen projecten |
| `scrape_jobs_delete_own_project` | DELETE | Gebruikers kunnen alleen jobs verwijderen van hun eigen projecten |

```sql
-- Inschakelen van RLS
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY scrape_jobs_select_own_project
ON public.scrape_jobs
FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- INSERT policy
CREATE POLICY scrape_jobs_insert_own_project
ON public.scrape_jobs
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- UPDATE policy
CREATE POLICY scrape_jobs_update_own_project
ON public.scrape_jobs
FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id))
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- DELETE policy
CREATE POLICY scrape_jobs_delete_own_project
ON public.scrape_jobs
FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));
```

### Scrape Results Tabel

| Policy | Operatie | Beschrijving |
|--------|----------|-------------|
| `scrape_results_select_own_project` | SELECT | Gebruikers kunnen alleen resultaten zien van hun eigen projecten |
| `scrape_results_insert_own_project` | INSERT | Gebruikers kunnen alleen resultaten aanmaken voor hun eigen projecten |
| `scrape_results_update_own_project` | UPDATE | Gebruikers kunnen alleen resultaten bijwerken van hun eigen projecten |
| `scrape_results_delete_own_project` | DELETE | Gebruikers kunnen alleen resultaten verwijderen van hun eigen projecten |

```sql
-- Inschakelen van RLS
ALTER TABLE public.scrape_results ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY scrape_results_select_own_project
ON public.scrape_results
FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- INSERT policy
CREATE POLICY scrape_results_insert_own_project
ON public.scrape_results
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- UPDATE policy
CREATE POLICY scrape_results_update_own_project
ON public.scrape_results
FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id))
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- DELETE policy
CREATE POLICY scrape_results_delete_own_project
ON public.scrape_results
FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));
```

### Insights Tabel

| Policy | Operatie | Beschrijving |
|--------|----------|-------------|
| `insights_select_own_project` | SELECT | Gebruikers kunnen alleen inzichten zien van hun eigen projecten |
| `insights_insert_own_project` | INSERT | Gebruikers kunnen alleen inzichten aanmaken voor hun eigen projecten |
| `insights_update_own_project` | UPDATE | Gebruikers kunnen alleen inzichten bijwerken van hun eigen projecten |
| `insights_delete_own_project` | DELETE | Gebruikers kunnen alleen inzichten verwijderen van hun eigen projecten |

```sql
-- Inschakelen van RLS
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY insights_select_own_project
ON public.insights
FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- INSERT policy
CREATE POLICY insights_insert_own_project
ON public.insights
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- UPDATE policy
CREATE POLICY insights_update_own_project
ON public.insights
FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id))
WITH CHECK (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));

-- DELETE policy
CREATE POLICY insights_delete_own_project
ON public.insights
FOR DELETE
USING (auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id));
```

## Storage Buckets RLS Policies

### Datasets Bucket

| Policy | Operatie | Beschrijving |
|--------|----------|-------------|
| `datasets_select_own_project` | SELECT | Gebruikers kunnen alleen bestanden zien van hun eigen projecten |
| `datasets_insert_own_project` | INSERT | Gebruikers kunnen alleen bestanden uploaden voor hun eigen projecten |
| `datasets_update_own_project` | UPDATE | Gebruikers kunnen alleen bestanden bijwerken van hun eigen projecten |
| `datasets_delete_own_project` | DELETE | Gebruikers kunnen alleen bestanden verwijderen van hun eigen projecten |

```sql
-- SELECT policy
CREATE POLICY datasets_select_own_project
ON storage.objects
FOR SELECT
USING (bucket_id = 'datasets' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- INSERT policy
CREATE POLICY datasets_insert_own_project
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'datasets' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- UPDATE policy
CREATE POLICY datasets_update_own_project
ON storage.objects
FOR UPDATE
USING (bucket_id = 'datasets' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)))
WITH CHECK (bucket_id = 'datasets' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- DELETE policy
CREATE POLICY datasets_delete_own_project
ON storage.objects
FOR DELETE
USING (bucket_id = 'datasets' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));
```

### Exports Bucket

| Policy | Operatie | Beschrijving |
|--------|----------|-------------|
| `exports_select_own_project` | SELECT | Gebruikers kunnen alleen exports zien van hun eigen projecten |
| `exports_insert_own_project` | INSERT | Gebruikers kunnen alleen exports uploaden voor hun eigen projecten |
| `exports_update_own_project` | UPDATE | Gebruikers kunnen alleen exports bijwerken van hun eigen projecten |
| `exports_delete_own_project` | DELETE | Gebruikers kunnen alleen exports verwijderen van hun eigen projecten |

```sql
-- SELECT policy
CREATE POLICY exports_select_own_project
ON storage.objects
FOR SELECT
USING (bucket_id = 'exports' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- INSERT policy
CREATE POLICY exports_insert_own_project
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'exports' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- UPDATE policy
CREATE POLICY exports_update_own_project
ON storage.objects
FOR UPDATE
USING (bucket_id = 'exports' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)))
WITH CHECK (bucket_id = 'exports' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));

-- DELETE policy
CREATE POLICY exports_delete_own_project
ON storage.objects
FOR DELETE
USING (bucket_id = 'exports' AND auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)));
```

## Admin Toegang

Voor admin gebruikers moeten aparte policies worden aangemaakt die volledige toegang geven tot alle data. Dit kan worden gedaan door de volgende policies toe te voegen:

```sql
-- Admin policy voor users tabel
CREATE POLICY admin_access_users
ON public.users
FOR ALL
USING ((SELECT role FROM auth.users WHERE auth.uid() = id) = 'admin');

-- Admin policy voor projects tabel
CREATE POLICY admin_access_projects
ON public.projects
FOR ALL
USING ((SELECT role FROM auth.users WHERE auth.uid() = users.id) = 'admin');

-- Admin policy voor scrape_jobs tabel
CREATE POLICY admin_access_scrape_jobs
ON public.scrape_jobs
FOR ALL
USING ((SELECT role FROM auth.users WHERE auth.uid() = users.id) = 'admin');

-- Admin policy voor scrape_results tabel
CREATE POLICY admin_access_scrape_results
ON public.scrape_results
FOR ALL
USING ((SELECT role FROM auth.users WHERE auth.uid() = users.id) = 'admin');

-- Admin policy voor insights tabel
CREATE POLICY admin_access_insights
ON public.insights
FOR ALL
USING ((SELECT role FROM auth.users WHERE auth.uid() = users.id) = 'admin');
```

## Testen van RLS Policies

Om te controleren of de RLS policies correct werken, is een test script gemaakt (`test-rls-policies.js`) dat:

1. Testgebruikers aanmaakt met verschillende rollen (user, admin)
2. Testdata aanmaakt voor elke gebruiker
3. Probeert om data te lezen van andere gebruikers
4. Controleert of de toegang correct is beperkt op basis van de rol

Dit script kan worden uitgevoerd met:

```bash
node config/supabase/test-rls-policies.js
```

## Best Practices voor RLS

1. **Gebruik altijd RLS**: Schakel RLS in voor alle tabellen, zelfs als je denkt dat het niet nodig is.
2. **Test policies grondig**: Controleer of gebruikers alleen toegang hebben tot hun eigen data.
3. **Houd policies eenvoudig**: Complexe policies kunnen moeilijk te onderhouden zijn en leiden tot fouten.
4. **Documenteer policies**: Houd bij welke policies zijn geïmplementeerd en waarom.
5. **Gebruik service roles met zorg**: Service roles omzeilen RLS, dus gebruik ze alleen waar nodig.
6. **Controleer regelmatig**: Controleer regelmatig of de policies nog steeds correct werken, vooral na schema wijzigingen.
