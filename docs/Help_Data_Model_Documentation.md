# MarketPulse AI Help System - Data Model Documentation

## Overzicht

Dit document beschrijft de datamodellen die worden gebruikt voor het help-systeem en het feedback analyse-dashboard van MarketPulse AI. Het dient als referentie voor ontwikkelaars die met het help-systeem werken of nieuwe functionaliteiten willen implementeren.

## Database Technologie

Het help-systeem gebruikt Supabase als database en backend service. Supabase is gebaseerd op PostgreSQL en biedt een realtime API voor het werken met de database.

## Schema Overzicht

Het help-systeem gebruikt de volgende tabellen:

1. `help_content` - Opslag van help-content items
2. `help_feedback` - Verzameling van feedback op specifieke help-items
3. `user_experience_feedback` - Verzameling van algemene gebruikerservaring feedback
4. `help_interactions` - Tracking van gebruikersinteracties met help-items
5. `help_content_versions` - Versiegeschiedenis van help-content

## Gedetailleerde Schema's

### help_content

Deze tabel bevat alle help-content items die in de applicatie worden gebruikt.

#### Kolommen

| Naam | Type | Beschrijving | Constraints |
|------|------|-------------|------------|
| id | uuid | Unieke identifier | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| help_item_id | text | Unieke string identifier voor het help-item | NOT NULL, UNIQUE |
| type | text | Type help-item (tooltip, overlay, wizard, etc.) | NOT NULL |
| content | text | Help-content tekst of HTML | NOT NULL |
| content_type | text | Type content (text, html, video, etc.) | NOT NULL, DEFAULT 'text' |
| target_user_roles | text[] | Array van gebruikersrollen waarvoor deze content relevant is | DEFAULT '{}' |
| target_experience_levels | text[] | Array van ervaringsniveaus waarvoor deze content relevant is | DEFAULT '{}' |
| related_help_items | text[] | Array van gerelateerde help-item IDs | DEFAULT '{}' |
| created_at | timestamptz | Tijdstip van aanmaken | NOT NULL, DEFAULT now() |
| updated_at | timestamptz | Tijdstip van laatste update | NOT NULL, DEFAULT now() |
| created_by | uuid | Gebruiker die het item heeft aangemaakt | REFERENCES users(id) |
| updated_by | uuid | Gebruiker die het item laatst heeft bijgewerkt | REFERENCES users(id) |
| is_active | boolean | Of het help-item actief is | NOT NULL, DEFAULT true |

#### Indexen

- `help_content_pkey` - PRIMARY KEY op `id`
- `help_content_help_item_id_idx` - UNIQUE INDEX op `help_item_id`
- `help_content_type_idx` - INDEX op `type`
- `help_content_target_user_roles_idx` - GIN INDEX op `target_user_roles`
- `help_content_target_experience_levels_idx` - GIN INDEX op `target_experience_levels`

#### Voorbeeld

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "help_item_id": "dashboard-overview",
  "type": "tooltip",
  "content": "Dit dashboard toont een overzicht van je projecten en recente activiteiten.",
  "content_type": "text",
  "target_user_roles": ["marketing_manager", "market_analyst", "content_creator", "executive"],
  "target_experience_levels": ["beginner", "intermediate", "advanced", "expert"],
  "related_help_items": ["create-project", "recent-activities"],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-04-20T14:45:00Z",
  "created_by": "123e4567-e89b-12d3-a456-426614174001",
  "updated_by": "123e4567-e89b-12d3-a456-426614174002",
  "is_active": true
}
```

### help_feedback

Deze tabel bevat feedback op specifieke help-items.

#### Kolommen

| Naam | Type | Beschrijving | Constraints |
|------|------|-------------|------------|
| id | uuid | Unieke identifier | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| help_item_id | text | ID van het help-item waarop feedback wordt gegeven | NOT NULL |
| help_item_type | text | Type help-item (tooltip, overlay, wizard, etc.) | NOT NULL |
| feedback_value | boolean | Positieve (true) of negatieve (false) feedback | NOT NULL |
| comments | text | Tekstuele feedback opmerkingen | |
| user_id | uuid | ID van de gebruiker die feedback geeft | REFERENCES users(id) |
| user_role | text | Rol van de gebruiker | |
| experience_level | text | Ervaringsniveau van de gebruiker | |
| created_at | timestamptz | Tijdstip van feedback | NOT NULL, DEFAULT now() |
| session_id | text | ID van de gebruikerssessie | |
| page_context | text | Context/pagina waar feedback werd gegeven | |

#### Indexen

- `help_feedback_pkey` - PRIMARY KEY op `id`
- `help_feedback_help_item_id_idx` - INDEX op `help_item_id`
- `help_feedback_user_id_idx` - INDEX op `user_id`
- `help_feedback_created_at_idx` - INDEX op `created_at`

#### Voorbeeld

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174003",
  "help_item_id": "dashboard-overview",
  "help_item_type": "tooltip",
  "feedback_value": true,
  "comments": "Zeer nuttig, hielp me om het dashboard te begrijpen.",
  "user_id": "123e4567-e89b-12d3-a456-426614174004",
  "user_role": "marketing_manager",
  "experience_level": "beginner",
  "created_at": "2025-05-06T16:00:00Z",
  "session_id": "sess_123456789",
  "page_context": "dashboard"
}
```

### user_experience_feedback

Deze tabel bevat algemene feedback over de gebruikerservaring.

#### Kolommen

| Naam | Type | Beschrijving | Constraints |
|------|------|-------------|------------|
| id | uuid | Unieke identifier | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| page_context | text | Context/pagina waar feedback werd gegeven | NOT NULL |
| rating | integer | Tevredenheidsbeoordeling (1-5) | NOT NULL, CHECK (rating BETWEEN 1 AND 5) |
| feedback | text | Tekstuele feedback | |
| aspects | text[] | Array van aspecten waarop feedback betrekking heeft | DEFAULT '{}' |
| user_id | uuid | ID van de gebruiker die feedback geeft | REFERENCES users(id) |
| user_role | text | Rol van de gebruiker | |
| experience_level | text | Ervaringsniveau van de gebruiker | |
| created_at | timestamptz | Tijdstip van feedback | NOT NULL, DEFAULT now() |
| session_id | text | ID van de gebruikerssessie | |

#### Indexen

- `user_experience_feedback_pkey` - PRIMARY KEY op `id`
- `user_experience_feedback_page_context_idx` - INDEX op `page_context`
- `user_experience_feedback_user_id_idx` - INDEX op `user_id`
- `user_experience_feedback_created_at_idx` - INDEX op `created_at`
- `user_experience_feedback_aspects_idx` - GIN INDEX op `aspects`

#### Voorbeeld

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174005",
  "page_context": "dashboard",
  "rating": 4,
  "feedback": "De interface is intuïtief, maar sommige grafieken zijn moeilijk te interpreteren.",
  "aspects": ["ui_design", "data_visualization", "help_content"],
  "user_id": "123e4567-e89b-12d3-a456-426614174004",
  "user_role": "marketing_manager",
  "experience_level": "beginner",
  "created_at": "2025-05-06T16:05:00Z",
  "session_id": "sess_123456789"
}
```

### help_interactions

Deze tabel bevat gegevens over gebruikersinteracties met help-items.

#### Kolommen

| Naam | Type | Beschrijving | Constraints |
|------|------|-------------|------------|
| id | uuid | Unieke identifier | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| help_item_id | text | ID van het help-item | NOT NULL |
| help_item_type | text | Type help-item (tooltip, overlay, wizard, etc.) | NOT NULL |
| action | text | Type interactie (view, click, dismiss, etc.) | NOT NULL |
| user_id | uuid | ID van de gebruiker | REFERENCES users(id) |
| user_role | text | Rol van de gebruiker | |
| experience_level | text | Ervaringsniveau van de gebruiker | |
| page_context | text | Context/pagina waar interactie plaatsvond | NOT NULL |
| created_at | timestamptz | Tijdstip van interactie | NOT NULL, DEFAULT now() |
| session_id | text | ID van de gebruikerssessie | |
| duration_ms | integer | Duur van de interactie in milliseconden | |
| metadata | jsonb | Aanvullende metadata over de interactie | DEFAULT '{}' |

#### Indexen

- `help_interactions_pkey` - PRIMARY KEY op `id`
- `help_interactions_help_item_id_idx` - INDEX op `help_item_id`
- `help_interactions_user_id_idx` - INDEX op `user_id`
- `help_interactions_created_at_idx` - INDEX op `created_at`
- `help_interactions_page_context_idx` - INDEX op `page_context`
- `help_interactions_action_idx` - INDEX op `action`

#### Voorbeeld

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174006",
  "help_item_id": "dashboard-overview",
  "help_item_type": "tooltip",
  "action": "view",
  "user_id": "123e4567-e89b-12d3-a456-426614174004",
  "user_role": "marketing_manager",
  "experience_level": "beginner",
  "page_context": "dashboard",
  "created_at": "2025-05-06T15:55:00Z",
  "session_id": "sess_123456789",
  "duration_ms": 5000,
  "metadata": {
    "viewport_width": 1920,
    "viewport_height": 1080,
    "device_type": "desktop",
    "browser": "chrome"
  }
}
```

### help_content_versions

Deze tabel bevat de versiegeschiedenis van help-content items.

#### Kolommen

| Naam | Type | Beschrijving | Constraints |
|------|------|-------------|------------|
| id | uuid | Unieke identifier | PRIMARY KEY, DEFAULT uuid_generate_v4() |
| help_content_id | uuid | ID van het help-content item | NOT NULL, REFERENCES help_content(id) |
| version | integer | Versienummer | NOT NULL |
| content | text | Help-content tekst of HTML | NOT NULL |
| content_type | text | Type content (text, html, video, etc.) | NOT NULL |
| target_user_roles | text[] | Array van gebruikersrollen | |
| target_experience_levels | text[] | Array van ervaringsniveaus | |
| created_at | timestamptz | Tijdstip van aanmaken | NOT NULL, DEFAULT now() |
| created_by | uuid | Gebruiker die de versie heeft aangemaakt | REFERENCES users(id) |
| change_reason | text | Reden voor de wijziging | |

#### Indexen

- `help_content_versions_pkey` - PRIMARY KEY op `id`
- `help_content_versions_help_content_id_idx` - INDEX op `help_content_id`
- `help_content_versions_version_idx` - INDEX op `version`

#### Voorbeeld

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174007",
  "help_content_id": "123e4567-e89b-12d3-a456-426614174000",
  "version": 2,
  "content": "Dit dashboard toont een bijgewerkt overzicht van je projecten en recente activiteiten.",
  "content_type": "text",
  "target_user_roles": ["marketing_manager", "market_analyst", "content_creator", "executive"],
  "target_experience_levels": ["beginner", "intermediate", "advanced", "expert"],
  "created_at": "2025-04-20T14:45:00Z",
  "created_by": "123e4567-e89b-12d3-a456-426614174002",
  "change_reason": "Verduidelijking van de beschrijving"
}
```

## Relaties

### Entity Relationship Diagram (ERD)

```
+---------------+       +---------------+       +---------------+
| help_content  |       | help_feedback |       | help_interactions
+---------------+       +---------------+       +---------------+
| id            |<---+  | id            |       | id            |
| help_item_id  |    |  | help_item_id  |       | help_item_id  |
| type          |    |  | help_item_type|       | help_item_type|
| content       |    |  | feedback_value|       | action        |
| content_type  |    |  | comments      |       | user_id       |
| target_user_roles|  |  | user_id      |       | user_role     |
| target_experience_levels| | user_role     |       | experience_level|
| related_help_items|  |  | experience_level|    | page_context  |
| created_at    |    |  | created_at    |       | created_at    |
| updated_at    |    |  | session_id    |       | session_id    |
| created_by    |    |  | page_context  |       | duration_ms   |
| updated_by    |    |  +---------------+       | metadata      |
| is_active     |    |                          +---------------+
+---------------+    |                                  ^
       ^             |                                  |
       |             |                                  |
       |             |                                  |
+---------------+    |                          +---------------+
| help_content_versions|                        | user_experience_feedback
+---------------+    |                          +---------------+
| id            |    |                          | id            |
| help_content_id|---+                          | page_context  |
| version       |                               | rating        |
| content       |                               | feedback      |
| content_type  |                               | aspects       |
| target_user_roles|                            | user_id       |
| target_experience_levels|                     | user_role     |
| created_at    |                               | experience_level|
| created_by    |                               | created_at    |
| change_reason |                               | session_id    |
+---------------+                               +---------------+
```

### Relatie Beschrijvingen

1. **help_content naar help_content_versions**: One-to-Many
   - Elk help_content item kan meerdere versies hebben in help_content_versions
   - Relatie wordt gelegd via help_content_id in help_content_versions

2. **help_content naar help_feedback**: One-to-Many (impliciet)
   - Elk help_content item kan meerdere feedback items hebben in help_feedback
   - Relatie wordt impliciet gelegd via help_item_id in help_feedback

3. **help_content naar help_interactions**: One-to-Many (impliciet)
   - Elk help_content item kan meerdere interacties hebben in help_interactions
   - Relatie wordt impliciet gelegd via help_item_id in help_interactions

4. **users naar help_content**: One-to-Many
   - Elke gebruiker kan meerdere help_content items aanmaken of bijwerken
   - Relatie wordt gelegd via created_by en updated_by in help_content

5. **users naar help_feedback**: One-to-Many
   - Elke gebruiker kan meerdere feedback items geven
   - Relatie wordt gelegd via user_id in help_feedback

6. **users naar user_experience_feedback**: One-to-Many
   - Elke gebruiker kan meerdere gebruikerservaring feedback items geven
   - Relatie wordt gelegd via user_id in user_experience_feedback

7. **users naar help_interactions**: One-to-Many
   - Elke gebruiker kan meerdere interacties hebben met help-items
   - Relatie wordt gelegd via user_id in help_interactions

## Dataflow

### Help Content Weergave

1. Gebruiker navigeert naar een pagina in de applicatie
2. Frontend vraagt relevante help-content op via API
3. Backend query's de help_content tabel met filters voor pagina, gebruikersrol en ervaringsniveau
4. Help-content wordt getoond aan de gebruiker via de juiste component (tooltip, overlay, etc.)
5. Interactie wordt geregistreerd in de help_interactions tabel

### Feedback Verzameling

1. Gebruiker geeft feedback op een help-item via de UI
2. Frontend stuurt feedback naar de API
3. Backend slaat feedback op in de help_feedback of user_experience_feedback tabel
4. Feedback wordt beschikbaar voor analyse in het feedback analyse-dashboard

### Content Beheer

1. Admin gebruiker maakt of bewerkt help-content via het admin dashboard
2. Frontend stuurt content naar de API
3. Backend slaat nieuwe content op in de help_content tabel
4. Bij bewerking wordt de oude versie opgeslagen in de help_content_versions tabel
5. Nieuwe content is direct beschikbaar voor gebruikers

## Migraties

Hieronder volgen de SQL migratiescripts voor het aanmaken van de tabellen:

### help_content

```sql
CREATE TABLE help_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  help_item_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  target_user_roles TEXT[] DEFAULT '{}',
  target_experience_levels TEXT[] DEFAULT '{}',
  related_help_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX help_content_type_idx ON help_content(type);
CREATE INDEX help_content_target_user_roles_idx ON help_content USING GIN(target_user_roles);
CREATE INDEX help_content_target_experience_levels_idx ON help_content USING GIN(target_experience_levels);
```

### help_feedback

```sql
CREATE TABLE help_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  help_item_id TEXT NOT NULL,
  help_item_type TEXT NOT NULL,
  feedback_value BOOLEAN NOT NULL,
  comments TEXT,
  user_id UUID REFERENCES users(id),
  user_role TEXT,
  experience_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT,
  page_context TEXT
);

CREATE INDEX help_feedback_help_item_id_idx ON help_feedback(help_item_id);
CREATE INDEX help_feedback_user_id_idx ON help_feedback(user_id);
CREATE INDEX help_feedback_created_at_idx ON help_feedback(created_at);
```

### user_experience_feedback

```sql
CREATE TABLE user_experience_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_context TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  aspects TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES users(id),
  user_role TEXT,
  experience_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT
);

CREATE INDEX user_experience_feedback_page_context_idx ON user_experience_feedback(page_context);
CREATE INDEX user_experience_feedback_user_id_idx ON user_experience_feedback(user_id);
CREATE INDEX user_experience_feedback_created_at_idx ON user_experience_feedback(created_at);
CREATE INDEX user_experience_feedback_aspects_idx ON user_experience_feedback USING GIN(aspects);
```

### help_interactions

```sql
CREATE TABLE help_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  help_item_id TEXT NOT NULL,
  help_item_type TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  user_role TEXT,
  experience_level TEXT,
  page_context TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX help_interactions_help_item_id_idx ON help_interactions(help_item_id);
CREATE INDEX help_interactions_user_id_idx ON help_interactions(user_id);
CREATE INDEX help_interactions_created_at_idx ON help_interactions(created_at);
CREATE INDEX help_interactions_page_context_idx ON help_interactions(page_context);
CREATE INDEX help_interactions_action_idx ON help_interactions(action);
```

### help_content_versions

```sql
CREATE TABLE help_content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  help_content_id UUID NOT NULL REFERENCES help_content(id),
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  target_user_roles TEXT[],
  target_experience_levels TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id),
  change_reason TEXT
);

CREATE INDEX help_content_versions_help_content_id_idx ON help_content_versions(help_content_id);
CREATE INDEX help_content_versions_version_idx ON help_content_versions(version);
```

## Conclusie

Deze documentatie biedt een overzicht van de datamodellen die worden gebruikt voor het help-systeem en het feedback analyse-dashboard van MarketPulse AI. Door deze richtlijnen te volgen, kunnen ontwikkelaars effectief werken met de database en nieuwe functionaliteiten implementeren die consistent zijn met de bestaande architectuur.

Voor meer gedetailleerde informatie over specifieke implementatiedetails, raadpleeg de codebase en de bijbehorende tests.