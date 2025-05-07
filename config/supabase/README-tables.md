# MarketPulse AI Database Schema

Dit document beschrijft de database schema voor MarketPulse AI, geïmplementeerd in Supabase.

## Tabellen Overzicht

### Users Tabel
Slaat gebruikersprofielen op, gekoppeld aan de Supabase auth.users tabel.

| Kolom | Type | Beschrijving |
|-------|------|-------------|
| id | uuid | Primaire sleutel, verwijst naar auth.users(id) |
| email | text | Email adres van de gebruiker (uniek) |
| full_name | text | Volledige naam van de gebruiker |
| avatar_url | text | URL naar de profielfoto |
| role | text | Gebruikersrol (default: 'user') |
| company | text | Bedrijfsnaam |
| created_at | timestamp | Aanmaakdatum |
| updated_at | timestamp | Laatste update datum |

### Projects Tabel
Slaat projecten op die door gebruikers zijn aangemaakt.

| Kolom | Type | Beschrijving |
|-------|------|-------------|
| id | uuid | Primaire sleutel |
| name | text | Projectnaam |
| description | text | Projectbeschrijving |
| user_id | uuid | Verwijzing naar users(id) |
| settings | jsonb | Projectinstellingen als JSON |
| created_at | timestamp | Aanmaakdatum |
| updated_at | timestamp | Laatste update datum |

### Scrape Jobs Tabel
Slaat scraping jobs op die binnen projecten worden uitgevoerd.

| Kolom | Type | Beschrijving |
|-------|------|-------------|
| id | uuid | Primaire sleutel |
| project_id | uuid | Verwijzing naar projects(id) |
| platform | text | Platform (amazon, instagram, etc.) |
| options | jsonb | Scraping opties als JSON |
| schedule | text | Optionele planning (cron expressie) |
| status | text | Status (pending, running, completed, failed) |
| started_at | timestamp | Startdatum |
| completed_at | timestamp | Voltooiingsdatum |
| result_count | integer | Aantal resultaten |
| error | text | Foutmelding (indien mislukt) |
| created_at | timestamp | Aanmaakdatum |
| updated_at | timestamp | Laatste update datum |

### Scrape Results Tabel
Slaat resultaten van scraping jobs op.

| Kolom | Type | Beschrijving |
|-------|------|-------------|
| id | uuid | Primaire sleutel |
| job_id | uuid | Verwijzing naar scrape_jobs(id) |
| project_id | uuid | Verwijzing naar projects(id) |
| platform | text | Platform (amazon, instagram, etc.) |
| options | jsonb | Gebruikte scraping opties als JSON |
| result | jsonb | Scraping resultaten als JSON |
| processed | boolean | Of het resultaat is verwerkt |
| created_at | timestamp | Aanmaakdatum |
| updated_at | timestamp | Laatste update datum |

### Insights Tabel
Slaat inzichten op die zijn gegenereerd uit scraping resultaten.

| Kolom | Type | Beschrijving |
|-------|------|-------------|
| id | uuid | Primaire sleutel |
| project_id | uuid | Verwijzing naar projects(id) |
| result_id | uuid | Verwijzing naar scrape_results(id) |
| type | text | Type inzicht (sentiment, trend, etc.) |
| category | text | Categorie (product_quality, pricing, etc.) |
| data | jsonb | Inzichtgegevens als JSON |
| created_at | timestamp | Aanmaakdatum |
| updated_at | timestamp | Laatste update datum |

## Relaties

```
users 1 --- * projects
projects 1 --- * scrape_jobs
projects 1 --- * scrape_results
projects 1 --- * insights
scrape_jobs 1 --- * scrape_results
scrape_results 1 --- * insights
```

## Row Level Security (RLS)

Alle tabellen zijn beveiligd met Row Level Security (RLS) policies:

### Users Tabel
- `users_select_own`: Gebruikers kunnen alleen hun eigen profiel zien
- `users_update_own`: Gebruikers kunnen alleen hun eigen profiel bijwerken

### Projects Tabel
- `projects_select_own`: Gebruikers kunnen alleen hun eigen projecten zien
- `projects_insert_own`: Gebruikers kunnen alleen projecten aanmaken met hun eigen user_id
- `projects_update_own`: Gebruikers kunnen alleen hun eigen projecten bijwerken
- `projects_delete_own`: Gebruikers kunnen alleen hun eigen projecten verwijderen

### Scrape Jobs Tabel
- `scrape_jobs_select_own_project`: Gebruikers kunnen alleen jobs zien van hun eigen projecten
- `scrape_jobs_insert_own_project`: Gebruikers kunnen alleen jobs aanmaken voor hun eigen projecten
- `scrape_jobs_update_own_project`: Gebruikers kunnen alleen jobs bijwerken van hun eigen projecten
- `scrape_jobs_delete_own_project`: Gebruikers kunnen alleen jobs verwijderen van hun eigen projecten

### Scrape Results Tabel
- `scrape_results_select_own_project`: Gebruikers kunnen alleen resultaten zien van hun eigen projecten
- `scrape_results_insert_own_project`: Gebruikers kunnen alleen resultaten aanmaken voor hun eigen projecten
- `scrape_results_update_own_project`: Gebruikers kunnen alleen resultaten bijwerken van hun eigen projecten
- `scrape_results_delete_own_project`: Gebruikers kunnen alleen resultaten verwijderen van hun eigen projecten

### Insights Tabel
- `insights_select_own_project`: Gebruikers kunnen alleen inzichten zien van hun eigen projecten
- `insights_insert_own_project`: Gebruikers kunnen alleen inzichten aanmaken voor hun eigen projecten
- `insights_update_own_project`: Gebruikers kunnen alleen inzichten bijwerken van hun eigen projecten
- `insights_delete_own_project`: Gebruikers kunnen alleen inzichten verwijderen van hun eigen projecten

## Indexen

De volgende indexen zijn aangemaakt voor optimale query performance:

### Users Tabel
- `users_email_idx`: Index op email kolom

### Projects Tabel
- `projects_user_id_idx`: Index op user_id kolom

### Scrape Jobs Tabel
- `scrape_jobs_project_id_idx`: Index op project_id kolom
- `scrape_jobs_status_idx`: Index op status kolom
- `scrape_jobs_platform_idx`: Index op platform kolom

### Scrape Results Tabel
- `scrape_results_job_id_idx`: Index op job_id kolom
- `scrape_results_project_id_idx`: Index op project_id kolom
- `scrape_results_platform_idx`: Index op platform kolom
- `scrape_results_processed_idx`: Index op processed kolom

### Insights Tabel
- `insights_project_id_idx`: Index op project_id kolom
- `insights_result_id_idx`: Index op result_id kolom
- `insights_type_idx`: Index op type kolom
- `insights_category_idx`: Index op category kolom

## Triggers

Voor elke tabel met een `updated_at` kolom is een trigger aangemaakt die de kolom automatisch bijwerkt bij elke update:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Vergelijkbare triggers voor andere tabellen
```
