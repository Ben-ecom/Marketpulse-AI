# MarketPulse AI - API Keys en Service Roles

Dit document beschrijft de API keys en service roles die worden gebruikt in MarketPulse AI voor de communicatie met Supabase. Het bevat informatie over de verschillende typen keys, hun gebruiksdoeleinden, en best practices voor het beheren van deze keys.

## Typen API Keys in Supabase

Supabase biedt verschillende typen API keys, elk met een specifiek doel en bijbehorende permissies:

### 1. Anon/Public Key

- **Doel**: Gebruikt voor client-side operaties (browser, mobiele apps)
- **Permissies**: Beperkt tot operaties die zijn toegestaan door RLS policies
- **Gebruik in MarketPulse AI**: Frontend applicatie, authenticatie van gebruikers

### 2. Service Role Key

- **Doel**: Gebruikt voor server-side operaties die RLS policies moeten omzeilen
- **Permissies**: Volledige toegang tot de database, omzeilt RLS policies
- **Gebruik in MarketPulse AI**: Backend services, data processing, admin operaties

### 3. JWT Secret

- **Doel**: Gebruikt voor het verifiëren van JWT tokens
- **Permissies**: N/A (wordt alleen gebruikt voor verificatie)
- **Gebruik in MarketPulse AI**: Aangepaste authenticatie flows, verificatie van tokens

## Configuratie van API Keys

### Anon/Public Key

De anon key wordt gebruikt in de frontend applicatie en heeft beperkte rechten. Deze key is veilig om te gebruiken in client-side code omdat de toegang wordt beperkt door RLS policies.

```javascript
// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Service Role Key

De service role key wordt gebruikt in backend services en heeft volledige toegang tot de database. Deze key moet veilig worden opgeslagen en mag nooit worden blootgesteld aan client-side code.

```javascript
// server/utils/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

## Service Roles en Permissies

### Admin Role

- **Doel**: Volledige toegang tot alle tabellen en functies
- **Permissies**: SELECT, INSERT, UPDATE, DELETE op alle tabellen
- **Gebruik**: Backend services, admin operaties, data migraties

### API Role

- **Doel**: Beperkte toegang voor API endpoints
- **Permissies**: SELECT op alle tabellen, INSERT/UPDATE/DELETE op specifieke tabellen
- **Gebruik**: API endpoints, data processing

### Readonly Role

- **Doel**: Alleen-lezen toegang tot specifieke tabellen
- **Permissies**: SELECT op specifieke tabellen
- **Gebruik**: Rapportage, analytics

## JWT Configuratie

JWT (JSON Web Tokens) worden gebruikt voor authenticatie in Supabase. De volgende instellingen zijn geconfigureerd:

- **JWT Secret**: Een geheime sleutel voor het ondertekenen van JWT tokens
- **JWT Expiry**: 3600 seconden (1 uur)
- **JWT Algorithm**: HS256
- **JWT Claims**: `role`, `email`, `app_metadata`

## API Rate Limiting

Om de API te beschermen tegen overbelasting en misbruik, zijn de volgende rate limiting instellingen geconfigureerd:

- **Anon Key**: 100 requests per minuut
- **Service Role Key**: 1000 requests per minuut
- **Auth Endpoints**: 10 requests per minuut

## Key Rotatie Strategie

Voor optimale beveiliging worden API keys regelmatig geroteerd volgens de volgende strategie:

1. **Anon Key**: Elke 90 dagen
2. **Service Role Key**: Elke 30 dagen
3. **JWT Secret**: Elke 180 dagen

Het rotatieproces verloopt als volgt:

1. Genereer een nieuwe key in de Supabase dashboard
2. Update de environment variables in alle omgevingen
3. Verifieer dat alles nog werkt met de nieuwe key
4. Verwijder de oude key na een overgangsperiode

## Best Practices voor API Key Management

1. **Gebruik environment variables**: Sla API keys op in environment variables, nooit hardcoded in de code
2. **Gebruik verschillende keys voor verschillende omgevingen**: Gebruik aparte keys voor development, staging en production
3. **Beperk toegang tot keys**: Alleen teamleden die de keys nodig hebben mogen er toegang toe hebben
4. **Monitor key gebruik**: Houd het gebruik van API keys in de gaten voor ongebruikelijke patronen
5. **Roteer keys regelmatig**: Volg de key rotatie strategie om het risico van compromittering te beperken
6. **Gebruik de minst geprivilegieerde key**: Gebruik altijd de key met de minste rechten die nodig zijn voor de taak

## Implementatie in MarketPulse AI

### Frontend (React)

```javascript
// .env.example
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Node.js)

```javascript
// .env.example
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### API Key Gebruik in Code

#### Frontend (Anon Key)

```javascript
import { supabase } from '../utils/supabase';

// Gebruiker authenticatie (veilig met anon key)
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  return { data, error };
};

// Data ophalen (veilig met anon key + RLS)
const getProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*');
    
  return { data, error };
};
```

#### Backend (Service Role Key)

```javascript
const { supabaseAdmin } = require('../utils/supabase');

// Admin operatie (vereist service role key)
const deleteUser = async (userId) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  return { success: !error, error };
};

// Data migratie (vereist service role key)
const migrateData = async (sourceTable, targetTable) => {
  const { data, error } = await supabaseAdmin
    .from(sourceTable)
    .select('*');
    
  if (error) return { success: false, error };
  
  const { error: insertError } = await supabaseAdmin
    .from(targetTable)
    .insert(data);
    
  return { success: !insertError, error: insertError };
};
```

## Security Considerations

### Bescherming van Service Role Keys

De service role key heeft volledige toegang tot de database en omzeilt RLS policies. Het is daarom cruciaal om deze key goed te beschermen:

1. **Nooit in client-side code**: De service role key mag nooit worden gebruikt in client-side code
2. **Veilige opslag**: Sla de key op in een veilige omgeving (environment variables, secrets manager)
3. **Beperkte toegang**: Beperk de toegang tot de key tot alleen de teamleden die het nodig hebben
4. **Monitoring**: Monitor het gebruik van de key voor ongebruikelijke patronen

### JWT Security

JWT tokens worden gebruikt voor authenticatie. De volgende maatregelen zijn genomen om de veiligheid te waarborgen:

1. **Korte levensduur**: Tokens verlopen na 1 uur
2. **Secure cookies**: Tokens worden opgeslagen in secure, httpOnly cookies
3. **CSRF bescherming**: Implementatie van CSRF tokens voor formulieren
4. **Refresh token rotatie**: Refresh tokens worden geroteerd bij gebruik

## Troubleshooting

### "Invalid API key"

- Controleer of de juiste key wordt gebruikt voor de omgeving
- Controleer of de key nog geldig is (niet verlopen of ingetrokken)
- Controleer of de key correct is geformatteerd (geen extra spaties)

### "Permission denied"

- Controleer of de juiste key wordt gebruikt (anon vs service role)
- Controleer of de RLS policies correct zijn geconfigureerd
- Controleer of de gebruiker is geauthenticeerd (voor anon key)

### "JWT expired"

- Implementeer automatische token refresh
- Zorg ervoor dat de client de gebruiker opnieuw laat inloggen wanneer het refresh token is verlopen

## Monitoring en Logging

Om het gebruik van API keys te monitoren en potentiële beveiligingsproblemen te detecteren, zijn de volgende maatregelen geïmplementeerd:

1. **Request logging**: Alle API requests worden gelogd (zonder gevoelige data)
2. **Rate limiting alerts**: Alerts worden gegenereerd wanneer rate limits worden bereikt
3. **Unusual pattern detection**: Ongebruikelijke patronen in API gebruik worden gedetecteerd en gemeld
4. **Key usage metrics**: Metrics over het gebruik van API keys worden verzameld en geanalyseerd
