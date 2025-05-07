-- MarketPulse AI Decodo Insights
-- SQL migratie script voor het aanmaken van de insights tabel

-- Insights tabel
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'trend', 'sentiment', 'keyword', 'comparison', 'recommendation'
  platform TEXT, -- NULL voor platform-overstijgende inzichten
  content_type TEXT, -- NULL voor content-type-overstijgende inzichten
  data JSONB NOT NULL, -- Geaggregeerde data
  description TEXT, -- Beschrijving van het inzicht
  period_start TIMESTAMP WITH TIME ZONE, -- Begin van de periode
  period_end TIMESTAMP WITH TIME ZONE, -- Einde van de periode
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voeg een index toe voor betere query performance
CREATE INDEX IF NOT EXISTS idx_insights_project_id ON insights(project_id);
CREATE INDEX IF NOT EXISTS idx_insights_insight_type ON insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_platform ON insights(platform);
CREATE INDEX IF NOT EXISTS idx_insights_period ON insights(period_start, period_end);

-- Voeg een trigger toe om de updated_at te updaten wanneer een rij wordt bijgewerkt
CREATE OR REPLACE FUNCTION update_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_insights_updated_at
BEFORE UPDATE ON insights
FOR EACH ROW
EXECUTE FUNCTION update_insights_updated_at();
