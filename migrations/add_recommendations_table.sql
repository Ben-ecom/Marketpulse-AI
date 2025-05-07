-- Maak de recommendations tabel aan
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  insight_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voeg indexen toe voor betere query performance
CREATE INDEX IF NOT EXISTS idx_recommendations_project_id ON recommendations(project_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(type);

-- Voeg RLS policies toe voor veiligheid
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Policy voor het bekijken van aanbevelingen (alleen eigen projecten)
CREATE POLICY recommendations_select_policy ON recommendations
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy voor het invoegen van aanbevelingen (alleen eigen projecten)
CREATE POLICY recommendations_insert_policy ON recommendations
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy voor het bijwerken van aanbevelingen (alleen eigen projecten)
CREATE POLICY recommendations_update_policy ON recommendations
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy voor het verwijderen van aanbevelingen (alleen eigen projecten)
CREATE POLICY recommendations_delete_policy ON recommendations
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
