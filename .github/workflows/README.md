# MarketPulse AI CI/CD Workflows

Deze directory bevat de GitHub Actions workflows voor het MarketPulse AI platform. Deze workflows automatiseren het bouwen, testen en deployen van de applicatie naar verschillende omgevingen.

## Workflows

### 1. Development CI (`dev-ci.yml`)

Deze workflow wordt uitgevoerd bij pushes naar en pull requests op de `develop` branch.

**Stappen:**
1. **Lint**: Controleert de code op stijl- en syntaxfouten
2. **Test**: Voert unit tests uit voor zowel frontend als backend
3. **Build**: Bouwt de applicatie en slaat artifacts op
4. **Deploy**: Deployt de applicatie naar de development omgeving (alleen bij pushes naar `develop`)

### 2. Production CI/CD (`prod-ci.yml`)

Deze workflow wordt uitgevoerd bij pushes naar en pull requests op de `main`/`master` branch.

**Stappen:**
1. **Lint**: Controleert de code op stijl- en syntaxfouten
2. **Test**: Voert unit tests uit voor zowel frontend als backend
3. **Build**: Bouwt de applicatie en slaat artifacts op
4. **Deploy to Staging**: Deployt de applicatie naar de staging omgeving (alleen bij pushes naar `main`/`master`)
5. **Deploy to Production**: Deployt de applicatie naar de productieomgeving na handmatige goedkeuring

### 3. Security Scan (`security-scan.yml`)

Deze workflow wordt wekelijks uitgevoerd en kan ook handmatig worden gestart.

**Stappen:**
1. **Dependency Check**: Controleert op kwetsbaarheden in dependencies
2. **Code Scan**: Voert CodeQL analyse uit voor beveiligingsproblemen
3. **Docker Scan**: Scant Docker images op kwetsbaarheden
4. **Security Report**: Genereert een beveiligingsrapport en stuurt een notificatie

## Secrets en Configuratie

Voor het correct functioneren van deze workflows zijn de volgende GitHub Secrets nodig:

### Docker Hub Credentials
- `DOCKER_HUB_USERNAME`: Docker Hub gebruikersnaam
- `DOCKER_HUB_TOKEN`: Docker Hub toegangstoken

### Development Server
- `DEV_SERVER_HOST`: Hostname van de development server
- `DEV_SERVER_USERNAME`: SSH gebruikersnaam voor de development server
- `DEV_SERVER_SSH_KEY`: SSH private key voor de development server

### Staging Server
- `STAGING_SERVER_HOST`: Hostname van de staging server
- `STAGING_SERVER_USERNAME`: SSH gebruikersnaam voor de staging server
- `STAGING_SERVER_SSH_KEY`: SSH private key voor de staging server

### Production Server
- `PROD_SERVER_HOST`: Hostname van de productie server
- `PROD_SERVER_USERNAME`: SSH gebruikersnaam voor de productie server
- `PROD_SERVER_SSH_KEY`: SSH private key voor de productie server

### Notificaties
- `SLACK_WEBHOOK`: Webhook URL voor Slack notificaties

## Handmatige Triggers

Sommige workflows kunnen handmatig worden gestart via de GitHub Actions interface:

1. Ga naar de "Actions" tab in de GitHub repository
2. Selecteer de gewenste workflow
3. Klik op "Run workflow"
4. Selecteer de branch en klik op "Run workflow"

## Troubleshooting

### Veelvoorkomende problemen

1. **Deployment faalt**: Controleer de SSH-verbinding en of de server toegankelijk is
2. **Tests falen**: Controleer de test logs voor specifieke fouten
3. **Docker build faalt**: Controleer of de Dockerfiles correct zijn en of alle benodigde bestanden aanwezig zijn

### Logs bekijken

Gedetailleerde logs van elke workflow run zijn beschikbaar in de GitHub Actions interface:

1. Ga naar de "Actions" tab in de GitHub repository
2. Klik op de specifieke workflow run
3. Klik op de job om de gedetailleerde logs te bekijken

## Best Practices

1. **Pull Requests**: Gebruik altijd pull requests voor wijzigingen aan de `develop` en `main`/`master` branches
2. **Code Review**: Zorg ervoor dat alle pull requests worden gereviewd voordat ze worden gemerged
3. **Semantic Versioning**: Gebruik semantic versioning voor releases (vX.Y.Z)
4. **Commit Messages**: Schrijf duidelijke commit messages die de wijzigingen beschrijven
5. **Branch Naming**: Gebruik een consistent branch naming schema (bijv. `feature/naam`, `bugfix/naam`, `hotfix/naam`)
