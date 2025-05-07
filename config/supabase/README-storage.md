# MarketPulse AI - Storage Buckets en Toegangscontroles

Dit document beschrijft de storage buckets en toegangscontroles die zijn geïmplementeerd in Supabase voor MarketPulse AI. Deze buckets worden gebruikt voor het opslaan van datasets en exports.

## Storage Buckets Overzicht

MarketPulse AI gebruikt twee storage buckets in Supabase:

1. **datasets** - Voor het opslaan van ruwe scraping data
2. **exports** - Voor het opslaan van exports en rapporten

## Bucket Configuraties

### Datasets Bucket

| Eigenschap | Waarde |
|------------|--------|
| ID | datasets |
| Naam | datasets |
| Publiek | Nee |
| Bestandsgrootte Limiet | 50MB |
| Toegestane MIME Types | application/json, text/csv, text/plain, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |

### Exports Bucket

| Eigenschap | Waarde |
|------------|--------|
| ID | exports |
| Naam | exports |
| Publiek | Nee |
| Bestandsgrootte Limiet | 100MB |
| Toegestane MIME Types | application/json, text/csv, text/plain, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/zip |

## CORS Configuratie

Beide buckets hebben de volgende CORS instellingen:

```json
{
  "allowedOrigins": ["*"],
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedHeaders": ["*"],
  "maxAgeSeconds": 3600
}
```

Opmerking: CORS instellingen moeten handmatig worden geconfigureerd in de Supabase dashboard of via de REST API, omdat de Supabase JavaScript client dit momenteel niet ondersteunt.

## Bestandsstructuur

Om een goede organisatie te behouden en de RLS policies correct te laten werken, moeten bestanden worden opgeslagen volgens de volgende structuur:

### Datasets Bucket

```
datasets/
├── {project_id}/
│   ├── {platform}/
│   │   ├── {job_id}/
│   │   │   ├── raw_data.json
│   │   │   ├── metadata.json
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── ...
```

### Exports Bucket

```
exports/
├── {project_id}/
│   ├── reports/
│   │   ├── {report_id}.pdf
│   │   ├── {report_id}.xlsx
│   │   └── ...
│   ├── visualizations/
│   │   ├── {visualization_id}.png
│   │   ├── {visualization_id}.svg
│   │   └── ...
│   └── ...
└── ...
```

## Row Level Security (RLS) Policies

De volgende RLS policies zijn geïmplementeerd voor de storage buckets:

### Datasets Bucket

| Policy | Operatie | Beschrijving |
|--------|----------|-------------|
| `datasets_select_own_project` | SELECT | Gebruikers kunnen alleen bestanden zien van hun eigen projecten |
| `datasets_insert_own_project` | INSERT | Gebruikers kunnen alleen bestanden uploaden voor hun eigen projecten |
| `datasets_update_own_project` | UPDATE | Gebruikers kunnen alleen bestanden bijwerken van hun eigen projecten |
| `datasets_delete_own_project` | DELETE | Gebruikers kunnen alleen bestanden verwijderen van hun eigen projecten |

Deze policies gebruiken de volgende SQL expressie om te controleren of een gebruiker toegang heeft tot een bestand:

```sql
bucket_id = 'datasets' AND auth.uid() IN (
  SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)
)
```

### Exports Bucket

| Policy | Operatie | Beschrijving |
|--------|----------|-------------|
| `exports_select_own_project` | SELECT | Gebruikers kunnen alleen exports zien van hun eigen projecten |
| `exports_insert_own_project` | INSERT | Gebruikers kunnen alleen exports uploaden voor hun eigen projecten |
| `exports_update_own_project` | UPDATE | Gebruikers kunnen alleen exports bijwerken van hun eigen projecten |
| `exports_delete_own_project` | DELETE | Gebruikers kunnen alleen exports verwijderen van hun eigen projecten |

Deze policies gebruiken de volgende SQL expressie om te controleren of een gebruiker toegang heeft tot een bestand:

```sql
bucket_id = 'exports' AND auth.uid() IN (
  SELECT user_id FROM projects WHERE id::text = SPLIT_PART(name, '/', 1)
)
```

## Gebruik in de Applicatie

### Uploaden van Bestanden

```javascript
import { storage } from '../utils/supabase';

// Uploaden van een bestand naar de datasets bucket
const uploadDataset = async (projectId, platform, jobId, file) => {
  const path = `${projectId}/${platform}/${jobId}/raw_data.json`;
  return await storage.uploadFile('datasets', path, file);
};

// Uploaden van een bestand naar de exports bucket
const uploadExport = async (projectId, reportId, file) => {
  const path = `${projectId}/reports/${reportId}.pdf`;
  return await storage.uploadFile('exports', path, file);
};
```

### Downloaden van Bestanden

```javascript
import { storage } from '../utils/supabase';

// Downloaden van een bestand uit de datasets bucket
const downloadDataset = async (projectId, platform, jobId) => {
  const path = `${projectId}/${platform}/${jobId}/raw_data.json`;
  return await storage.downloadFile('datasets', path);
};

// Downloaden van een bestand uit de exports bucket
const downloadExport = async (projectId, reportId) => {
  const path = `${projectId}/reports/${reportId}.pdf`;
  return await storage.downloadFile('exports', path);
};
```

### Ophalen van een Publieke URL

```javascript
import { storage } from '../utils/supabase';

// Ophalen van een tijdelijke URL voor een bestand
const getExportUrl = async (projectId, reportId) => {
  const path = `${projectId}/reports/${reportId}.pdf`;
  return await storage.getSignedUrl('exports', path, 3600); // URL is 1 uur geldig
};
```

### Verwijderen van Bestanden

```javascript
import { storage } from '../utils/supabase';

// Verwijderen van een bestand uit de datasets bucket
const deleteDataset = async (projectId, platform, jobId) => {
  const path = `${projectId}/${platform}/${jobId}/raw_data.json`;
  return await storage.deleteFile('datasets', path);
};

// Verwijderen van een bestand uit de exports bucket
const deleteExport = async (projectId, reportId) => {
  const path = `${projectId}/reports/${reportId}.pdf`;
  return await storage.deleteFile('exports', path);
};
```

## Best Practices

1. **Gebruik de juiste bestandsstructuur**: Volg de aanbevolen bestandsstructuur om de RLS policies correct te laten werken.
2. **Valideer bestandstypen**: Controleer altijd of het bestandstype is toegestaan voordat je het uploadt.
3. **Controleer bestandsgrootte**: Zorg ervoor dat bestanden niet groter zijn dan de limiet (50MB voor datasets, 100MB voor exports).
4. **Gebruik tijdelijke URLs**: Gebruik getSignedUrl voor het delen van bestanden in plaats van publieke URLs.
5. **Verwijder oude bestanden**: Implementeer een opschoningsproces om oude bestanden te verwijderen die niet meer nodig zijn.
6. **Gebruik metadata**: Sla metadata op over bestanden in de database om ze gemakkelijker te kunnen vinden en beheren.

## Setup en Configuratie

Om de storage buckets op te zetten, kun je het volgende script gebruiken:

```bash
node config/supabase/storage-setup.js
```

Dit script maakt de buckets aan, configureert de toegangscontroles en test de functionaliteit door een testbestand te uploaden en te downloaden.

## Troubleshooting

### Fout bij uploaden: "Bucket niet gevonden"
- Controleer of de bucket bestaat in de Supabase dashboard
- Controleer of je de juiste bucket naam gebruikt

### Fout bij uploaden: "Bestandstype niet toegestaan"
- Controleer of het bestandstype is toegestaan voor de bucket
- Controleer of je het juiste MIME type meegeeft bij het uploaden

### Fout bij downloaden: "Bestand niet gevonden"
- Controleer of het bestand bestaat in de bucket
- Controleer of je het juiste pad gebruikt
- Controleer of je toegang hebt tot het bestand (RLS policy)

### Fout bij downloaden: "Toegang geweigerd"
- Controleer of je bent ingelogd
- Controleer of je toegang hebt tot het project waartoe het bestand behoort
- Controleer of de RLS policies correct zijn geconfigureerd
