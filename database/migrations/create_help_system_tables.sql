-- create_help_system_tables.sql
--
-- SQL script voor het aanmaken van de tabellen voor het help-systeem in Supabase.
-- Dit script maakt de volgende tabellen aan:
-- - help_interactions: Voor het bijhouden van interacties met het help-systeem
-- - help_feedback: Voor het bijhouden van feedback op help-items
-- - user_experience_feedback: Voor het bijhouden van algemene gebruikersfeedback

-- Tabel voor help interacties
CREATE TABLE IF NOT EXISTS help_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  action TEXT NOT NULL,
  page_context TEXT NOT NULL,
  help_item_id TEXT,
  help_item_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key naar users tabel
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexen voor help_interactions
CREATE INDEX IF NOT EXISTS idx_help_interactions_user_id ON help_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_help_interactions_user_role ON help_interactions(user_role);
CREATE INDEX IF NOT EXISTS idx_help_interactions_experience_level ON help_interactions(experience_level);
CREATE INDEX IF NOT EXISTS idx_help_interactions_action ON help_interactions(action);
CREATE INDEX IF NOT EXISTS idx_help_interactions_page_context ON help_interactions(page_context);
CREATE INDEX IF NOT EXISTS idx_help_interactions_created_at ON help_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_help_interactions_help_item_id ON help_interactions(help_item_id);

-- Tabel voor help feedback
CREATE TABLE IF NOT EXISTS help_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  help_item_id TEXT NOT NULL,
  help_item_type TEXT NOT NULL,
  feedback_value BOOLEAN NOT NULL,
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key naar users tabel
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexen voor help_feedback
CREATE INDEX IF NOT EXISTS idx_help_feedback_user_id ON help_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_help_feedback_user_role ON help_feedback(user_role);
CREATE INDEX IF NOT EXISTS idx_help_feedback_experience_level ON help_feedback(experience_level);
CREATE INDEX IF NOT EXISTS idx_help_feedback_help_item_id ON help_feedback(help_item_id);
CREATE INDEX IF NOT EXISTS idx_help_feedback_feedback_value ON help_feedback(feedback_value);
CREATE INDEX IF NOT EXISTS idx_help_feedback_created_at ON help_feedback(created_at);

-- Tabel voor gebruikerservaring feedback
CREATE TABLE IF NOT EXISTS user_experience_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  page_context TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key naar users tabel
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexen voor user_experience_feedback
CREATE INDEX IF NOT EXISTS idx_user_experience_feedback_user_id ON user_experience_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_experience_feedback_user_role ON user_experience_feedback(user_role);
CREATE INDEX IF NOT EXISTS idx_user_experience_feedback_experience_level ON user_experience_feedback(experience_level);
CREATE INDEX IF NOT EXISTS idx_user_experience_feedback_page_context ON user_experience_feedback(page_context);
CREATE INDEX IF NOT EXISTS idx_user_experience_feedback_rating ON user_experience_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_user_experience_feedback_created_at ON user_experience_feedback(created_at);

-- Row Level Security (RLS) policies
-- Zorg ervoor dat gebruikers alleen hun eigen feedback kunnen zien
ALTER TABLE help_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experience_feedback ENABLE ROW LEVEL SECURITY;

-- Admin kan alles zien en bewerken
CREATE POLICY admin_help_interactions ON help_interactions 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

CREATE POLICY admin_help_feedback ON help_feedback 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

CREATE POLICY admin_user_experience_feedback ON user_experience_feedback 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- Gebruikers kunnen alleen hun eigen data zien
CREATE POLICY user_help_interactions ON help_interactions 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY user_help_feedback ON help_feedback 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY user_user_experience_feedback ON user_experience_feedback 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Gebruikers kunnen hun eigen data toevoegen
CREATE POLICY insert_help_interactions ON help_interactions 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY insert_help_feedback ON help_feedback 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY insert_user_experience_feedback ON user_experience_feedback 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);
