-- 20250506_add_dashboard_preferences.sql
-- Migratie script voor het toevoegen van de dashboard_preferences tabel

-- Maak de dashboard_preferences tabel aan
CREATE TABLE IF NOT EXISTS dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visible_widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
  widget_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  saved_filters JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_filter TEXT,
  layout TEXT NOT NULL DEFAULT 'default',
  theme TEXT NOT NULL DEFAULT 'system',
  realtime_enabled BOOLEAN NOT NULL DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Voeg een unieke constraint toe om ervoor te zorgen dat elke gebruiker maar één rij heeft
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Voeg commentaar toe aan de tabel
COMMENT ON TABLE dashboard_preferences IS 'Opgeslagen voorkeuren voor het Help Metrics Dashboard per gebruiker';

-- Voeg commentaar toe aan de kolommen
COMMENT ON COLUMN dashboard_preferences.id IS 'Unieke identifier voor de voorkeur';
COMMENT ON COLUMN dashboard_preferences.user_id IS 'De gebruiker waartoe deze voorkeuren behoren';
COMMENT ON COLUMN dashboard_preferences.visible_widgets IS 'Array van widget IDs die zichtbaar zijn in het dashboard';
COMMENT ON COLUMN dashboard_preferences.widget_order IS 'Array van widget IDs in de gewenste volgorde';
COMMENT ON COLUMN dashboard_preferences.saved_filters IS 'Array van opgeslagen filter configuraties';
COMMENT ON COLUMN dashboard_preferences.default_filter IS 'Naam van de standaard filter';
COMMENT ON COLUMN dashboard_preferences.layout IS 'Layout van het dashboard (default, compact, expanded)';
COMMENT ON COLUMN dashboard_preferences.theme IS 'Thema van het dashboard (light, dark, system)';
COMMENT ON COLUMN dashboard_preferences.realtime_enabled IS 'Of real-time updates zijn ingeschakeld';
COMMENT ON COLUMN dashboard_preferences.last_updated IS 'Timestamp van de laatste update';
COMMENT ON COLUMN dashboard_preferences.created_at IS 'Timestamp van creatie';

-- Voeg Row Level Security toe
ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Maak een beleid aan dat gebruikers alleen hun eigen voorkeuren kunnen zien en bewerken
CREATE POLICY dashboard_preferences_user_policy
  ON dashboard_preferences
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Maak een index aan op user_id voor snellere lookups
CREATE INDEX IF NOT EXISTS idx_dashboard_preferences_user_id ON dashboard_preferences(user_id);