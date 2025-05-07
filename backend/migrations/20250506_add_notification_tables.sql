-- 20250506_add_notification_tables.sql
-- Migratie script voor het toevoegen van de notification_settings en notifications tabellen

-- Maak de notification_settings tabel aan
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thresholds JSONB NOT NULL DEFAULT '[]'::jsonb,
  notification_methods JSONB NOT NULL DEFAULT '{"in_app": true, "email": false}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Voeg een unieke constraint toe om ervoor te zorgen dat elke gebruiker maar één rij heeft
  CONSTRAINT unique_user_notification_settings UNIQUE (user_id)
);

-- Voeg commentaar toe aan de tabel
COMMENT ON TABLE notification_settings IS 'Notificatie instellingen voor het Help Metrics Dashboard per gebruiker';

-- Voeg commentaar toe aan de kolommen
COMMENT ON COLUMN notification_settings.id IS 'Unieke identifier voor de instelling';
COMMENT ON COLUMN notification_settings.user_id IS 'De gebruiker waartoe deze instellingen behoren';
COMMENT ON COLUMN notification_settings.thresholds IS 'Array van drempelwaarden voor metrics';
COMMENT ON COLUMN notification_settings.notification_methods IS 'Configuratie voor notificatie methoden (in-app, email)';
COMMENT ON COLUMN notification_settings.enabled IS 'Of notificaties zijn ingeschakeld';
COMMENT ON COLUMN notification_settings.last_updated IS 'Timestamp van de laatste update';
COMMENT ON COLUMN notification_settings.created_at IS 'Timestamp van creatie';

-- Maak de notifications tabel aan
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  threshold_id UUID,
  metric TEXT NOT NULL,
  operator TEXT NOT NULL,
  value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Voeg commentaar toe aan de tabel
COMMENT ON TABLE notifications IS 'Notificaties voor het Help Metrics Dashboard';

-- Voeg commentaar toe aan de kolommen
COMMENT ON COLUMN notifications.id IS 'Unieke identifier voor de notificatie';
COMMENT ON COLUMN notifications.user_id IS 'De gebruiker waartoe deze notificatie behoort';
COMMENT ON COLUMN notifications.threshold_id IS 'De drempelwaarde die deze notificatie heeft getriggerd';
COMMENT ON COLUMN notifications.metric IS 'De metric waarop deze notificatie betrekking heeft';
COMMENT ON COLUMN notifications.operator IS 'De operator die is gebruikt voor de vergelijking (gt, lt, eq, gte, lte)';
COMMENT ON COLUMN notifications.value IS 'De drempelwaarde';
COMMENT ON COLUMN notifications.current_value IS 'De huidige waarde van de metric';
COMMENT ON COLUMN notifications.message IS 'Het bericht van de notificatie';
COMMENT ON COLUMN notifications.read IS 'Of de notificatie is gelezen';
COMMENT ON COLUMN notifications.created_at IS 'Timestamp van creatie';

-- Voeg Row Level Security toe aan beide tabellen
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Maak een beleid aan dat gebruikers alleen hun eigen notificatie instellingen kunnen zien en bewerken
CREATE POLICY notification_settings_user_policy
  ON notification_settings
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Maak een beleid aan dat gebruikers alleen hun eigen notificaties kunnen zien en bewerken
CREATE POLICY notifications_user_policy
  ON notifications
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Maak indexen aan voor snellere lookups
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
