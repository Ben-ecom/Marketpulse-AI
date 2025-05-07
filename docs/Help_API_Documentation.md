# MarketPulse AI Help System - API Documentation

## Overzicht

Dit document beschrijft de API endpoints die worden gebruikt voor het help-systeem en het feedback analyse-dashboard van MarketPulse AI. Het dient als referentie voor ontwikkelaars die met het help-systeem werken of nieuwe functionaliteiten willen implementeren.

## Basis URL

Alle API endpoints zijn relatief ten opzichte van de basis URL:

```
https://api.marketpulse.ai/v1
```

Voor lokale ontwikkeling:

```
http://localhost:3001/api/v1
```

## Authenticatie

Alle API calls vereisen authenticatie via een JWT token. Het token moet worden meegestuurd in de Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Help Content API

Deze endpoints worden gebruikt voor het beheren van help-content.

### Ophalen van Help Content

#### `GET /help/content/:id`

Haalt specifieke help-content op basis van ID.

**Parameters:**
- `id` (path, required): Unieke ID van het help-item

**Response:**
```json
{
  "id": "dashboard-overview",
  "type": "tooltip",
  "content": "Dit dashboard toont een overzicht van je projecten en recente activiteiten.",
  "contentType": "text",
  "targetUserRoles": ["marketing_manager", "market_analyst", "content_creator", "executive"],
  "targetExperienceLevels": ["beginner", "intermediate", "advanced", "expert"],
  "relatedHelpItems": ["create-project", "recent-activities"],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-04-20T14:45:00Z"
}
```

**Status Codes:**
- `200 OK`: Content succesvol opgehaald
- `404 Not Found`: Content niet gevonden
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen toegang tot deze content

#### `GET /help/content/context/:context`

Haalt contextgevoelige help-content op basis van context.

**Parameters:**
- `context` (path, required): Context identifier (bijv. 'dashboard', 'awareness-report')
- `userRole` (query, optional): Gebruikersrol voor personalisatie
- `experienceLevel` (query, optional): Ervaringsniveau voor personalisatie

**Response:**
```json
{
  "items": [
    {
      "id": "dashboard-overview",
      "type": "tooltip",
      "content": "Dit dashboard toont een overzicht van je projecten en recente activiteiten.",
      "contentType": "text",
      "targetUserRoles": ["marketing_manager", "market_analyst", "content_creator", "executive"],
      "targetExperienceLevels": ["beginner", "intermediate", "advanced", "expert"],
      "relatedHelpItems": ["create-project", "recent-activities"],
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-04-20T14:45:00Z"
    },
    {
      "id": "dashboard-metrics",
      "type": "overlay",
      "content": "Deze metriekwaarden tonen de prestaties van je projecten.",
      "contentType": "text",
      "targetUserRoles": ["marketing_manager", "market_analyst"],
      "targetExperienceLevels": ["beginner", "intermediate"],
      "relatedHelpItems": ["metrics-explanation"],
      "created_at": "2025-01-20T11:15:00Z",
      "updated_at": "2025-04-22T09:30:00Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Content succesvol opgehaald
- `404 Not Found`: Geen content gevonden voor deze context
- `401 Unauthorized`: Niet geauthenticeerd

### Beheren van Help Content

#### `POST /help/content`

Maakt nieuwe help-content.

**Request Body:**
```json
{
  "type": "tooltip",
  "content": "Dit dashboard toont een overzicht van je projecten en recente activiteiten.",
  "contentType": "text",
  "targetUserRoles": ["marketing_manager", "market_analyst", "content_creator", "executive"],
  "targetExperienceLevels": ["beginner", "intermediate", "advanced", "expert"],
  "relatedHelpItems": ["create-project", "recent-activities"]
}
```

**Response:**
```json
{
  "id": "dashboard-overview",
  "type": "tooltip",
  "content": "Dit dashboard toont een overzicht van je projecten en recente activiteiten.",
  "contentType": "text",
  "targetUserRoles": ["marketing_manager", "market_analyst", "content_creator", "executive"],
  "targetExperienceLevels": ["beginner", "intermediate", "advanced", "expert"],
  "relatedHelpItems": ["create-project", "recent-activities"],
  "created_at": "2025-05-06T15:30:00Z",
  "updated_at": "2025-05-06T15:30:00Z"
}
```

**Status Codes:**
- `201 Created`: Content succesvol aangemaakt
- `400 Bad Request`: Ongeldige request body
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen rechten om content aan te maken

#### `PUT /help/content/:id`

Update bestaande help-content.

**Parameters:**
- `id` (path, required): Unieke ID van het help-item

**Request Body:**
```json
{
  "type": "tooltip",
  "content": "Dit dashboard toont een bijgewerkt overzicht van je projecten en recente activiteiten.",
  "contentType": "text",
  "targetUserRoles": ["marketing_manager", "market_analyst", "content_creator", "executive"],
  "targetExperienceLevels": ["beginner", "intermediate", "advanced", "expert"],
  "relatedHelpItems": ["create-project", "recent-activities", "dashboard-metrics"]
}
```

**Response:**
```json
{
  "id": "dashboard-overview",
  "type": "tooltip",
  "content": "Dit dashboard toont een bijgewerkt overzicht van je projecten en recente activiteiten.",
  "contentType": "text",
  "targetUserRoles": ["marketing_manager", "market_analyst", "content_creator", "executive"],
  "targetExperienceLevels": ["beginner", "intermediate", "advanced", "expert"],
  "relatedHelpItems": ["create-project", "recent-activities", "dashboard-metrics"],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-05-06T15:45:00Z"
}
```

**Status Codes:**
- `200 OK`: Content succesvol bijgewerkt
- `400 Bad Request`: Ongeldige request body
- `404 Not Found`: Content niet gevonden
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen rechten om content bij te werken

#### `DELETE /help/content/:id`

Verwijdert help-content.

**Parameters:**
- `id` (path, required): Unieke ID van het help-item

**Response:**
```json
{
  "message": "Help content successfully deleted",
  "id": "dashboard-overview"
}
```

**Status Codes:**
- `200 OK`: Content succesvol verwijderd
- `404 Not Found`: Content niet gevonden
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen rechten om content te verwijderen

## Feedback API

Deze endpoints worden gebruikt voor het verzamelen en ophalen van gebruikersfeedback.

### Verzamelen van Feedback

#### `POST /feedback/help`

Verzend feedback over een specifiek help-item.

**Request Body:**
```json
{
  "helpItemId": "dashboard-overview",
  "helpItemType": "tooltip",
  "feedbackValue": true,
  "comments": "Zeer nuttig, hielp me om het dashboard te begrijpen.",
  "userRole": "marketing_manager",
  "experienceLevel": "beginner"
}
```

**Response:**
```json
{
  "id": "f12345",
  "helpItemId": "dashboard-overview",
  "helpItemType": "tooltip",
  "feedbackValue": true,
  "comments": "Zeer nuttig, hielp me om het dashboard te begrijpen.",
  "userRole": "marketing_manager",
  "experienceLevel": "beginner",
  "created_at": "2025-05-06T16:00:00Z"
}
```

**Status Codes:**
- `201 Created`: Feedback succesvol verzonden
- `400 Bad Request`: Ongeldige request body
- `401 Unauthorized`: Niet geauthenticeerd

#### `POST /feedback/experience`

Verzend algemene gebruikerservaring feedback.

**Request Body:**
```json
{
  "pageContext": "dashboard",
  "rating": 4,
  "feedback": "De interface is intuïtief, maar sommige grafieken zijn moeilijk te interpreteren.",
  "aspects": ["ui_design", "data_visualization", "help_content"],
  "userRole": "marketing_manager",
  "experienceLevel": "beginner"
}
```

**Response:**
```json
{
  "id": "e12345",
  "pageContext": "dashboard",
  "rating": 4,
  "feedback": "De interface is intuïtief, maar sommige grafieken zijn moeilijk te interpreteren.",
  "aspects": ["ui_design", "data_visualization", "help_content"],
  "userRole": "marketing_manager",
  "experienceLevel": "beginner",
  "created_at": "2025-05-06T16:05:00Z"
}
```

**Status Codes:**
- `201 Created`: Feedback succesvol verzonden
- `400 Bad Request`: Ongeldige request body
- `401 Unauthorized`: Niet geauthenticeerd

### Ophalen van Feedback

#### `GET /feedback/summary`

Haalt samenvattende statistieken op over verzamelde feedback.

**Parameters:**
- `startDate` (query, optional): Begin datum voor filtering (ISO 8601 formaat)
- `endDate` (query, optional): Eind datum voor filtering (ISO 8601 formaat)
- `helpItemType` (query, optional): Filter op help-item type
- `userRole` (query, optional): Filter op gebruikersrol
- `experienceLevel` (query, optional): Filter op ervaringsniveau

**Response:**
```json
{
  "helpFeedback": {
    "total": 250,
    "positive": 200,
    "negative": 50,
    "positivePercentage": 80,
    "negativePercentage": 20
  },
  "userExperience": {
    "total": 150,
    "averageRating": 4.2
  },
  "byType": {
    "tooltip": {
      "total": 150,
      "positive": 120,
      "negative": 30
    },
    "overlay": {
      "total": 75,
      "positive": 60,
      "negative": 15
    },
    "wizard": {
      "total": 25,
      "positive": 20,
      "negative": 5
    }
  },
  "byUserRole": {
    "marketing_manager": {
      "total": 100,
      "positive": 85,
      "negative": 15
    },
    "market_analyst": {
      "total": 80,
      "positive": 60,
      "negative": 20
    },
    "content_creator": {
      "total": 40,
      "positive": 35,
      "negative": 5
    },
    "executive": {
      "total": 30,
      "positive": 20,
      "negative": 10
    }
  },
  "byExperienceLevel": {
    "beginner": {
      "total": 120,
      "positive": 100,
      "negative": 20
    },
    "intermediate": {
      "total": 80,
      "positive": 60,
      "negative": 20
    },
    "advanced": {
      "total": 40,
      "positive": 30,
      "negative": 10
    },
    "expert": {
      "total": 10,
      "positive": 10,
      "negative": 0
    }
  },
  "aspectFrequency": {
    "ui_design": 80,
    "data_visualization": 65,
    "help_content": 45,
    "performance": 30,
    "usability": 25
  }
}
```

**Status Codes:**
- `200 OK`: Statistieken succesvol opgehaald
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen rechten om statistieken te bekijken

#### `GET /feedback/details`

Haalt gedetailleerde feedback items op.

**Parameters:**
- `startDate` (query, optional): Begin datum voor filtering (ISO 8601 formaat)
- `endDate` (query, optional): Eind datum voor filtering (ISO 8601 formaat)
- `helpItemType` (query, optional): Filter op help-item type
- `helpItemId` (query, optional): Filter op help-item ID
- `userRole` (query, optional): Filter op gebruikersrol
- `experienceLevel` (query, optional): Filter op ervaringsniveau
- `feedbackValue` (query, optional): Filter op feedback waarde (true/false)
- `page` (query, optional): Paginanummer (default: 1)
- `pageSize` (query, optional): Aantal items per pagina (default: 10)

**Response:**
```json
{
  "helpFeedback": {
    "items": [
      {
        "id": "f12345",
        "helpItemId": "dashboard-overview",
        "helpItemType": "tooltip",
        "feedbackValue": true,
        "comments": "Zeer nuttig, hielp me om het dashboard te begrijpen.",
        "userRole": "marketing_manager",
        "experienceLevel": "beginner",
        "created_at": "2025-05-06T16:00:00Z"
      },
      {
        "id": "f12346",
        "helpItemId": "awareness-phases",
        "helpItemType": "overlay",
        "feedbackValue": false,
        "comments": "De uitleg was niet duidelijk genoeg voor mij.",
        "userRole": "content_creator",
        "experienceLevel": "intermediate",
        "created_at": "2025-05-06T15:45:00Z"
      }
    ],
    "total": 250,
    "page": 1,
    "pageSize": 10,
    "totalPages": 25
  },
  "userExperience": {
    "items": [
      {
        "id": "e12345",
        "pageContext": "dashboard",
        "rating": 4,
        "feedback": "De interface is intuïtief, maar sommige grafieken zijn moeilijk te interpreteren.",
        "aspects": ["ui_design", "data_visualization", "help_content"],
        "userRole": "marketing_manager",
        "experienceLevel": "beginner",
        "created_at": "2025-05-06T16:05:00Z"
      },
      {
        "id": "e12346",
        "pageContext": "awareness-report",
        "rating": 5,
        "feedback": "Uitstekende rapportage functionaliteit, zeer intuïtief.",
        "aspects": ["ui_design", "data_visualization", "usability"],
        "userRole": "market_analyst",
        "experienceLevel": "advanced",
        "created_at": "2025-05-06T14:30:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 10,
    "totalPages": 15
  }
}
```

**Status Codes:**
- `200 OK`: Feedback items succesvol opgehaald
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen rechten om feedback items te bekijken

## Analytics API

Deze endpoints worden gebruikt voor het feedback analyse-dashboard.

### `GET /analytics/feedback/summary`

Haalt samenvattende statistieken op voor het dashboard.

**Parameters:**
- `dateRange` (query, optional): Datumbereik ('today', 'last7days', 'last30days', 'last90days', 'lastYear')
- `pages` (query, optional): Array van pagina's om te filteren
- `userRoles` (query, optional): Array van gebruikersrollen om te filteren
- `experienceLevels` (query, optional): Array van ervaringsniveaus om te filteren
- `feedbackTypes` (query, optional): Array van feedback types om te filteren ('positive', 'negative')

**Response:**
Zie response van `GET /feedback/summary`

**Status Codes:**
- `200 OK`: Statistieken succesvol opgehaald
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen rechten om statistieken te bekijken

### `GET /analytics/feedback/trends`

Haalt trendgegevens op over tijd.

**Parameters:**
- `dateRange` (query, optional): Datumbereik ('today', 'last7days', 'last30days', 'last90days', 'lastYear')
- `interval` (query, optional): Interval voor aggregatie ('day', 'week', 'month')

**Response:**
```json
{
  "helpFeedback": [
    {
      "date": "2025-04-30",
      "total": 15,
      "positive": 12,
      "negative": 3,
      "positivePercentage": 80,
      "negativePercentage": 20
    },
    {
      "date": "2025-05-01",
      "total": 18,
      "positive": 15,
      "negative": 3,
      "positivePercentage": 83.33,
      "negativePercentage": 16.67
    },
    {
      "date": "2025-05-02",
      "total": 20,
      "positive": 16,
      "negative": 4,
      "positivePercentage": 80,
      "negativePercentage": 20
    }
  ],
  "userExperience": [
    {
      "date": "2025-04-30",
      "total": 10,
      "averageRating": 4.2
    },
    {
      "date": "2025-05-01",
      "total": 12,
      "averageRating": 4.3
    },
    {
      "date": "2025-05-02",
      "total": 15,
      "averageRating": 4.4
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Trendgegevens succesvol opgehaald
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen rechten om trendgegevens te bekijken

### `GET /analytics/feedback/by-page`

Haalt feedback op gegroepeerd per pagina.

**Parameters:**
- `dateRange` (query, optional): Datumbereik ('today', 'last7days', 'last30days', 'last90days', 'lastYear')

**Response:**
```json
{
  "helpFeedback": {
    "dashboard": {
      "total": 50,
      "positive": 45,
      "negative": 5
    },
    "awareness-report": {
      "total": 40,
      "positive": 30,
      "negative": 10
    },
    "sentiment-analysis": {
      "total": 30,
      "positive": 25,
      "negative": 5
    }
  },
  "userExperience": {
    "dashboard": {
      "total": 30,
      "ratings": [4, 5, 4, 3, 5],
      "average": 4.2,
      "aspects": {
        "ui_design": 20,
        "data_visualization": 15,
        "help_content": 10
      }
    },
    "awareness-report": {
      "total": 25,
      "ratings": [5, 4, 4, 5, 3],
      "average": 4.2,
      "aspects": {
        "ui_design": 15,
        "data_visualization": 20,
        "usability": 10
      }
    }
  }
}
```

**Status Codes:**
- `200 OK`: Feedback per pagina succesvol opgehaald
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen rechten om feedback per pagina te bekijken

### `GET /analytics/feedback/by-user`

Haalt feedback op gegroepeerd per gebruikerstype.

**Parameters:**
- `dateRange` (query, optional): Datumbereik ('today', 'last7days', 'last30days', 'last90days', 'lastYear')

**Response:**
```json
{
  "byRole": {
    "helpFeedback": {
      "marketing_manager": {
        "total": 100,
        "positive": 85,
        "negative": 15
      },
      "market_analyst": {
        "total": 80,
        "positive": 60,
        "negative": 20
      },
      "content_creator": {
        "total": 40,
        "positive": 35,
        "negative": 5
      },
      "executive": {
        "total": 30,
        "positive": 20,
        "negative": 10
      }
    },
    "userExperience": {
      "marketing_manager": {
        "total": 60,
        "ratings": [4, 5, 4, 3, 5],
        "average": 4.2,
        "aspects": {
          "ui_design": 40,
          "data_visualization": 30,
          "help_content": 25
        }
      },
      "market_analyst": {
        "total": 50,
        "ratings": [5, 4, 4, 5, 3],
        "average": 4.2,
        "aspects": {
          "ui_design": 30,
          "data_visualization": 45,
          "performance": 20
        }
      }
    }
  },
  "byLevel": {
    "helpFeedback": {
      "beginner": {
        "total": 120,
        "positive": 100,
        "negative": 20
      },
      "intermediate": {
        "total": 80,
        "positive": 60,
        "negative": 20
      },
      "advanced": {
        "total": 40,
        "positive": 30,
        "negative": 10
      },
      "expert": {
        "total": 10,
        "positive": 10,
        "negative": 0
      }
    },
    "userExperience": {
      "beginner": {
        "total": 70,
        "ratings": [4, 3, 4, 5, 4],
        "average": 4.0,
        "aspects": {
          "ui_design": 50,
          "help_content": 45,
          "usability": 30
        }
      },
      "intermediate": {
        "total": 50,
        "ratings": [4, 5, 4, 4, 5],
        "average": 4.4,
        "aspects": {
          "data_visualization": 40,
          "performance": 25,
          "ui_design": 20
        }
      }
    }
  }
}
```

**Status Codes:**
- `200 OK`: Feedback per gebruikerstype succesvol opgehaald
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen rechten om feedback per gebruikerstype te bekijken

### `GET /analytics/feedback/details`

Haalt gedetailleerde feedback items op voor het dashboard.

**Parameters:**
- `dateRange` (query, optional): Datumbereik ('today', 'last7days', 'last30days', 'last90days', 'lastYear')
- `pages` (query, optional): Array van pagina's om te filteren
- `userRoles` (query, optional): Array van gebruikersrollen om te filteren
- `experienceLevels` (query, optional): Array van ervaringsniveaus om te filteren
- `feedbackTypes` (query, optional): Array van feedback types om te filteren ('positive', 'negative')
- `page` (query, optional): Paginanummer (default: 1)
- `pageSize` (query, optional): Aantal items per pagina (default: 10)

**Response:**
Zie response van `GET /feedback/details`

**Status Codes:**
- `200 OK`: Feedback items succesvol opgehaald
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen rechten om feedback items te bekijken

### `GET /analytics/feedback/export`

Exporteert feedback data voor verdere analyse.

**Parameters:**
- `dateRange` (query, optional): Datumbereik ('today', 'last7days', 'last30days', 'last90days', 'lastYear')
- `format` (query, required): Exportformaat ('csv', 'json', 'excel')
- `includeHelpFeedback` (query, optional): Of help feedback moet worden opgenomen (default: true)
- `includeUserExperience` (query, optional): Of gebruikerservaring feedback moet worden opgenomen (default: true)
- `includeComments` (query, optional): Of opmerkingen moeten worden opgenomen (default: true)

**Response:**
Een bestand in het opgegeven formaat met de geëxporteerde data.

**Status Codes:**
- `200 OK`: Data succesvol geëxporteerd
- `400 Bad Request`: Ongeldig exportformaat
- `401 Unauthorized`: Niet geauthenticeerd
- `403 Forbidden`: Geen rechten om data te exporteren

## Foutafhandeling

Alle API endpoints retourneren een consistente foutstructuur:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request was invalid",
    "details": "The helpItemId field is required"
  }
}
```

### Foutcodes

- `INVALID_REQUEST`: De request was ongeldig (400)
- `UNAUTHORIZED`: Niet geauthenticeerd (401)
- `FORBIDDEN`: Geen toegang tot deze resource (403)
- `NOT_FOUND`: Resource niet gevonden (404)
- `INTERNAL_ERROR`: Interne serverfout (500)

## Rate Limiting

API requests zijn onderworpen aan rate limiting om overbelasting te voorkomen:

- 100 requests per minuut voor normale gebruikers
- 300 requests per minuut voor admin gebruikers

Bij overschrijding van de limiet wordt een 429 Too Many Requests status geretourneerd met een Retry-After header die aangeeft wanneer nieuwe requests kunnen worden gedaan.

## Versioning

De API gebruikt versioning in de URL (v1). Bij belangrijke wijzigingen wordt een nieuwe versie uitgebracht. Oude versies blijven ondersteund voor een redelijke periode.

## Conclusie

Deze documentatie biedt een overzicht van de API endpoints die worden gebruikt voor het help-systeem en het feedback analyse-dashboard van MarketPulse AI. Door deze richtlijnen te volgen, kunnen ontwikkelaars effectief werken met de API en nieuwe functionaliteiten implementeren.

Voor meer gedetailleerde informatie over specifieke endpoints of implementatiedetails, raadpleeg de codebase en de bijbehorende tests.