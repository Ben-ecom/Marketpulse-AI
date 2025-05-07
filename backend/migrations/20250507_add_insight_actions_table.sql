-- Migratie voor het toevoegen van de insight_actions tabel
-- Deze tabel slaat acties op die gebruikers kunnen maken op basis van inzichten

-- Controleer of de tabel al bestaat
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'insight_actions') THEN
        -- Maak de insight_actions tabel
        CREATE TABLE public.insight_actions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            insight_id UUID NOT NULL REFERENCES public.insights(id) ON DELETE CASCADE,
            text TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            status VARCHAR(50) DEFAULT 'pending',
            due_date TIMESTAMPTZ,
            priority VARCHAR(20) DEFAULT 'medium'
        );

        -- Voeg RLS-beleid toe voor de insight_actions tabel
        ALTER TABLE public.insight_actions ENABLE ROW LEVEL SECURITY;

        -- Maak beleid voor het lezen van insight_actions
        CREATE POLICY "Gebruikers kunnen insight_actions lezen" ON public.insight_actions
            FOR SELECT USING (
                auth.uid() IN (
                    SELECT user_id FROM public.project_members 
                    WHERE project_id = (
                        SELECT project_id FROM public.insights 
                        WHERE id = insight_id
                    )
                )
            );

        -- Maak beleid voor het invoegen van insight_actions
        CREATE POLICY "Gebruikers kunnen insight_actions toevoegen" ON public.insight_actions
            FOR INSERT WITH CHECK (
                auth.uid() IN (
                    SELECT user_id FROM public.project_members 
                    WHERE project_id = (
                        SELECT project_id FROM public.insights 
                        WHERE id = insight_id
                    )
                )
            );

        -- Maak beleid voor het bijwerken van insight_actions
        CREATE POLICY "Gebruikers kunnen hun eigen insight_actions bijwerken" ON public.insight_actions
            FOR UPDATE USING (
                auth.uid() = user_id OR
                auth.uid() IN (
                    SELECT user_id FROM public.project_members 
                    WHERE project_id = (
                        SELECT project_id FROM public.insights 
                        WHERE id = insight_id
                    ) AND role = 'admin'
                )
            );

        -- Maak beleid voor het verwijderen van insight_actions
        CREATE POLICY "Gebruikers kunnen hun eigen insight_actions verwijderen" ON public.insight_actions
            FOR DELETE USING (
                auth.uid() = user_id OR
                auth.uid() IN (
                    SELECT user_id FROM public.project_members 
                    WHERE project_id = (
                        SELECT project_id FROM public.insights 
                        WHERE id = insight_id
                    ) AND role = 'admin'
                )
            );

        -- Voeg een index toe voor snellere zoekopdrachten
        CREATE INDEX idx_insight_actions_insight_id ON public.insight_actions(insight_id);
        CREATE INDEX idx_insight_actions_user_id ON public.insight_actions(user_id);
        
        -- Voeg een trigger toe voor het bijwerken van updated_at
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.insight_actions
        FOR EACH ROW
        EXECUTE FUNCTION public.set_updated_at();
    END IF;
    
    -- Voeg is_favorite kolom toe aan insights tabel als deze nog niet bestaat
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'insights' 
        AND column_name = 'is_favorite'
    ) THEN
        ALTER TABLE public.insights ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;
