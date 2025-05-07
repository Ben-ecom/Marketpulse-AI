# MarketPulse AI Database Schema

Dit document beschrijft de database structuur voor het MarketPulse AI platform. De database is ontworpen om gebruikersgegevens, platform-specifieke data en analyseresultaten op te slaan.

## Schema Overzicht

De database is onderverdeeld in drie schema's:
- `auth`: Bevat tabellen gerelateerd aan authenticatie en autorisatie
- `public`: Bevat de hoofdtabellen voor de applicatie
- `storage`: Bevat tabellen voor bestandsopslag (indien nodig)

## Entiteiten en Relaties

### Gebruikers en Authenticatie

**auth.users**
- Primaire tabel voor gebruikersgegevens
- Bevat authenticatie informatie en gebruikersrollen
- Wordt gebruikt voor toegangscontrole en personalisatie

### Platforms en Analyses

**public.platforms**
- Referentietabel voor ondersteunde platforms (Reddit, Amazon, Instagram, TikTok)
- Wordt gebruikt om platformspecifieke data te categoriseren

**public.analyses**
- Hoofdtabel voor analyseprocessen
- Verbindt een gebruiker met een specifieke analyse
- Houdt status en metadata bij over de analyse

### Platform-specifieke Data

**public.reddit_data**
- Slaat data op die verzameld is van Reddit
- Bevat posts, comments, upvotes en andere Reddit-specifieke informatie

**public.amazon_data**
- Slaat productreviews en gerelateerde data van Amazon op
- Bevat ratings, review tekst en productinformatie

**public.instagram_data**
- Slaat posts en engagement metrics van Instagram op
- Bevat afbeeldingen, captions en interactiestatistieken

**public.tiktok_data**
- Slaat video's en engagement metrics van TikTok op
- Bevat video metadata en interactiestatistieken

### Analyseresultaten

**public.sentiment_analysis**
- Slaat resultaten op van sentiment analyse op verzamelde data
- Bevat scores voor positief, neutraal en negatief sentiment

**public.keywords**
- Slaat geëxtraheerde keywords en hun relevantie op
- Wordt gebruikt voor trend analyse en inzichten

## Relatiediagram

```
auth.users
    ↓
    ↓ 1:N
    ↓
public.analyses
    ↓
    ↓ 1:N
    ↓
┌─────────────────────┬─────────────────────┬─────────────────────┬─────────────────────┐
│                     │                     │                     │                     │
│  public.reddit_data │ public.amazon_data  │ public.instagram_data │ public.tiktok_data  │
│                     │                     │                     │                     │
└─────────────────────┴─────────────────────┴─────────────────────┴─────────────────────┘
                      ↓                                           ↓
                      ↓ N:1                                       ↓ N:1
                      ↓                                           ↓
              public.sentiment_analysis                     public.keywords
```

## Indexeringsstrategie

De volgende indexen zijn gedefinieerd voor optimale query performance:

- `idx_reddit_data_analysis_id`: Versnelt queries die Reddit data filteren op analyse ID
- `idx_amazon_data_analysis_id`: Versnelt queries die Amazon data filteren op analyse ID
- `idx_instagram_data_analysis_id`: Versnelt queries die Instagram data filteren op analyse ID
- `idx_tiktok_data_analysis_id`: Versnelt queries die TikTok data filteren op analyse ID
- `idx_sentiment_analysis_analysis_id`: Versnelt queries die sentiment analyse resultaten filteren op analyse ID
- `idx_keywords_analysis_id`: Versnelt queries die keywords filteren op analyse ID
- `idx_analyses_user_id`: Versnelt queries die analyses filteren op gebruiker ID

## Data Types en Constraints

- UUIDs worden gebruikt als primaire sleutels voor betere schaalbaarheid en veiligheid
- Timestamps bevatten tijdzoneinformatie (WITH TIME ZONE)
- Referentiële integriteit wordt afgedwongen via foreign key constraints
- Cascade delete wordt gebruikt waar logisch (bijv. bij het verwijderen van een analyse worden alle gerelateerde data verwijderd)

## Migratiestrategie

Database migraties worden beheerd via SQL scripts in de `docker/shared/init-scripts` directory. Deze scripts worden automatisch uitgevoerd bij het opstarten van de database container.

Voor toekomstige schema wijzigingen zullen genummerde migratiescripts worden toegevoegd aan deze directory, zodat ze in de juiste volgorde worden uitgevoerd.
