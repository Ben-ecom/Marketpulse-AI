/**
 * Supabase configuratie voor MarketPulse AI
 * 
 * Dit bestand bevat de configuratie voor de Supabase integratie,
 * inclusief tabelstructuren, RLS policies, en storage buckets.
 */

const config = {
  // Project instellingen
  project: {
    name: 'marketpulse-ai',
    region: 'eu-central-1', // Kies een regio dicht bij je gebruikers
  },
  
  // Database tabellen
  tables: {
    // Gebruikers tabel (uitbreiding van auth.users)
    users: {
      name: 'users',
      schema: 'public',
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true, references: 'auth.users(id)' },
        { name: 'email', type: 'text', notNull: true, unique: true },
        { name: 'full_name', type: 'text' },
        { name: 'avatar_url', type: 'text' },
        { name: 'role', type: 'text', default: "'user'" },
        { name: 'company', type: 'text' },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()', notNull: true },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()', notNull: true }
      ],
      indexes: [
        { name: 'users_email_idx', columns: ['email'] }
      ]
    },
    
    // Projecten tabel
    projects: {
      name: 'projects',
      schema: 'public',
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'name', type: 'text', notNull: true },
        { name: 'description', type: 'text' },
        { name: 'user_id', type: 'uuid', notNull: true, references: 'users(id)' },
        { name: 'settings', type: 'jsonb', default: '{}' },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()', notNull: true },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()', notNull: true }
      ],
      indexes: [
        { name: 'projects_user_id_idx', columns: ['user_id'] }
      ]
    },
    
    // Scrape jobs tabel
    scrape_jobs: {
      name: 'scrape_jobs',
      schema: 'public',
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'project_id', type: 'uuid', notNull: true, references: 'projects(id)' },
        { name: 'platform', type: 'text', notNull: true },
        { name: 'options', type: 'jsonb', notNull: true },
        { name: 'schedule', type: 'text' },
        { name: 'status', type: 'text', default: "'pending'", notNull: true },
        { name: 'started_at', type: 'timestamp with time zone' },
        { name: 'completed_at', type: 'timestamp with time zone' },
        { name: 'result_count', type: 'integer', default: 0 },
        { name: 'error', type: 'text' },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()', notNull: true },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()', notNull: true }
      ],
      indexes: [
        { name: 'scrape_jobs_project_id_idx', columns: ['project_id'] },
        { name: 'scrape_jobs_status_idx', columns: ['status'] },
        { name: 'scrape_jobs_platform_idx', columns: ['platform'] }
      ]
    },
    
    // Scrape resultaten tabel
    scrape_results: {
      name: 'scrape_results',
      schema: 'public',
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'job_id', type: 'uuid', references: 'scrape_jobs(id)' },
        { name: 'project_id', type: 'uuid', notNull: true, references: 'projects(id)' },
        { name: 'platform', type: 'text', notNull: true },
        { name: 'options', type: 'jsonb', notNull: true },
        { name: 'result', type: 'jsonb' },
        { name: 'processed', type: 'boolean', default: false },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()', notNull: true },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()', notNull: true }
      ],
      indexes: [
        { name: 'scrape_results_job_id_idx', columns: ['job_id'] },
        { name: 'scrape_results_project_id_idx', columns: ['project_id'] },
        { name: 'scrape_results_platform_idx', columns: ['platform'] },
        { name: 'scrape_results_processed_idx', columns: ['processed'] }
      ]
    },
    
    // Verwerkte inzichten tabel
    insights: {
      name: 'insights',
      schema: 'public',
      columns: [
        { name: 'id', type: 'uuid', primaryKey: true, default: 'gen_random_uuid()' },
        { name: 'project_id', type: 'uuid', notNull: true, references: 'projects(id)' },
        { name: 'result_id', type: 'uuid', references: 'scrape_results(id)' },
        { name: 'type', type: 'text', notNull: true },
        { name: 'category', type: 'text' },
        { name: 'data', type: 'jsonb', notNull: true },
        { name: 'created_at', type: 'timestamp with time zone', default: 'now()', notNull: true },
        { name: 'updated_at', type: 'timestamp with time zone', default: 'now()', notNull: true }
      ],
      indexes: [
        { name: 'insights_project_id_idx', columns: ['project_id'] },
        { name: 'insights_result_id_idx', columns: ['result_id'] },
        { name: 'insights_type_idx', columns: ['type'] },
        { name: 'insights_category_idx', columns: ['category'] }
      ]
    }
  },
  
  // RLS (Row Level Security) policies
  policies: {
    users: [
      {
        name: 'users_select_own',
        operation: 'SELECT',
        definition: 'auth.uid() = id',
        check: null
      },
      {
        name: 'users_update_own',
        operation: 'UPDATE',
        definition: 'auth.uid() = id',
        check: 'auth.uid() = id'
      }
    ],
    projects: [
      {
        name: 'projects_select_own',
        operation: 'SELECT',
        definition: 'auth.uid() = user_id',
        check: null
      },
      {
        name: 'projects_insert_own',
        operation: 'INSERT',
        definition: null,
        check: 'auth.uid() = user_id'
      },
      {
        name: 'projects_update_own',
        operation: 'UPDATE',
        definition: 'auth.uid() = user_id',
        check: 'auth.uid() = user_id'
      },
      {
        name: 'projects_delete_own',
        operation: 'DELETE',
        definition: 'auth.uid() = user_id',
        check: null
      }
    ],
    scrape_jobs: [
      {
        name: 'scrape_jobs_select_own_project',
        operation: 'SELECT',
        definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)',
        check: null
      },
      {
        name: 'scrape_jobs_insert_own_project',
        operation: 'INSERT',
        definition: null,
        check: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)'
      },
      {
        name: 'scrape_jobs_update_own_project',
        operation: 'UPDATE',
        definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)',
        check: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)'
      },
      {
        name: 'scrape_jobs_delete_own_project',
        operation: 'DELETE',
        definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)',
        check: null
      }
    ],
    scrape_results: [
      {
        name: 'scrape_results_select_own_project',
        operation: 'SELECT',
        definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)',
        check: null
      },
      {
        name: 'scrape_results_insert_own_project',
        operation: 'INSERT',
        definition: null,
        check: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)'
      },
      {
        name: 'scrape_results_update_own_project',
        operation: 'UPDATE',
        definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)',
        check: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)'
      },
      {
        name: 'scrape_results_delete_own_project',
        operation: 'DELETE',
        definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)',
        check: null
      }
    ],
    insights: [
      {
        name: 'insights_select_own_project',
        operation: 'SELECT',
        definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)',
        check: null
      },
      {
        name: 'insights_insert_own_project',
        operation: 'INSERT',
        definition: null,
        check: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)'
      },
      {
        name: 'insights_update_own_project',
        operation: 'UPDATE',
        definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)',
        check: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)'
      },
      {
        name: 'insights_delete_own_project',
        operation: 'DELETE',
        definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id = project_id)',
        check: null
      }
    ]
  },
  
  // Storage buckets
  storage: {
    datasets: {
      name: 'datasets',
      public: false,
      allowedMimeTypes: [
        'application/json',
        'text/csv',
        'text/plain'
      ],
      policies: [
        {
          name: 'datasets_select_own_project',
          operation: 'SELECT',
          definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, \'/\', 1))',
          check: null
        },
        {
          name: 'datasets_insert_own_project',
          operation: 'INSERT',
          definition: null,
          check: 'auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, \'/\', 1))'
        },
        {
          name: 'datasets_update_own_project',
          operation: 'UPDATE',
          definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, \'/\', 1))',
          check: 'auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, \'/\', 1))'
        },
        {
          name: 'datasets_delete_own_project',
          operation: 'DELETE',
          definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, \'/\', 1))',
          check: null
        }
      ]
    },
    exports: {
      name: 'exports',
      public: false,
      allowedMimeTypes: [
        'application/json',
        'text/csv',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ],
      policies: [
        {
          name: 'exports_select_own_project',
          operation: 'SELECT',
          definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, \'/\', 1))',
          check: null
        },
        {
          name: 'exports_insert_own_project',
          operation: 'INSERT',
          definition: null,
          check: 'auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, \'/\', 1))'
        },
        {
          name: 'exports_update_own_project',
          operation: 'UPDATE',
          definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, \'/\', 1))',
          check: 'auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, \'/\', 1))'
        },
        {
          name: 'exports_delete_own_project',
          operation: 'DELETE',
          definition: 'auth.uid() IN (SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, \'/\', 1))',
          check: null
        }
      ]
    }
  },
  
  // Authenticatie instellingen
  auth: {
    signInProviders: ['email', 'google'],
    redirectUrls: [
      'http://localhost:3000/auth/callback',
      'https://marketpulse-ai.render.com/auth/callback'
    ],
    userFields: {
      defaultRole: 'authenticated',
      roles: ['authenticated', 'admin']
    },
    emailTemplates: {
      inviteUser: {
        subject: 'Je bent uitgenodigd voor MarketPulse AI',
        body: 'Je bent uitgenodigd om deel te nemen aan MarketPulse AI. Gebruik deze link om je account aan te maken: {{ .ConfirmationURL }}'
      },
      confirmSignUp: {
        subject: 'Bevestig je MarketPulse AI account',
        body: 'Bedankt voor het aanmaken van een MarketPulse AI account. Bevestig je account door op deze link te klikken: {{ .ConfirmationURL }}'
      },
      resetPassword: {
        subject: 'Reset je MarketPulse AI wachtwoord',
        body: 'Klik op deze link om je wachtwoord te resetten: {{ .ConfirmationURL }}'
      }
    }
  }
};

module.exports = config;
