# MarketPulse AI Kubernetes Configuratie

Deze directory bevat de Kubernetes configuratiebestanden voor het MarketPulse AI platform. De configuratie is opgezet met Kustomize om eenvoudig verschillende omgevingen te beheren.

## Structuur

De configuratie is als volgt gestructureerd:

```
k8s/
├── base/                   # Basis configuratie voor alle omgevingen
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── configmap.yaml
│   ├── database-service.yaml
│   ├── database-statefulset.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── ingress.yaml
│   ├── kustomization.yaml
│   └── secrets-template.yaml
├── overlays/               # Omgevingsspecifieke configuraties
│   ├── development/        # Ontwikkelomgeving
│   │   ├── kustomization.yaml
│   │   └── patches/
│   ├── staging/           # Staging omgeving
│   │   ├── kustomization.yaml
│   │   └── patches/
│   └── production/        # Productieomgeving
│       ├── kustomization.yaml
│       └── patches/
└── README.md              # Deze documentatie
```

## Gebruik

### Secrets

Voordat je de configuratie kunt toepassen, moet je eerst de secrets aanmaken. Gebruik het `secrets-template.yaml` bestand als basis:

```bash
# Kopieer het template
cp base/secrets-template.yaml overlays/development/secrets.yaml

# Bewerk de secrets met echte waarden
vi overlays/development/secrets.yaml

# Maak het secret aan in Kubernetes
kubectl apply -f overlays/development/secrets.yaml
```

Herhaal dit proces voor elke omgeving (development, staging, production).

### Toepassen van configuraties

Gebruik Kustomize om de configuratie toe te passen op een specifieke omgeving:

```bash
# Voor development omgeving
kubectl apply -k overlays/development

# Voor staging omgeving
kubectl apply -k overlays/staging

# Voor productie omgeving
kubectl apply -k overlays/production
```

## Omgevingen

### Development

De development omgeving is geoptimaliseerd voor ontwikkeling en testing:
- Minder replicas (1 per deployment)
- Lagere resource limieten
- Ontwikkelingsspecifieke configuratie

### Staging

De staging omgeving is een afspiegeling van de productieomgeving, maar met minder resources:
- 2 replicas per deployment
- Middelmatige resource limieten
- Aparte hostname (staging.marketpulse.ai)

### Production

De productieomgeving is geoptimaliseerd voor betrouwbaarheid en schaalbaarheid:
- 3 replicas per deployment (minimum)
- Horizontal Pod Autoscaling (HPA) voor automatisch schalen
- Hogere resource limieten
- Uitgebreide beveiligingsconfiguratie
- Ondersteuning voor meerdere hostnames (marketpulse.ai, www.marketpulse.ai)

## Onderhoud

### Bijwerken van images

Om een nieuwe versie van een image te deployen:

```bash
# Bijwerken van de image tag
kubectl set image deployment/marketpulse-backend backend=marketpulseai/backend:v1.2.3 -n marketpulse-production
kubectl set image deployment/marketpulse-frontend frontend=marketpulseai/frontend:v1.2.3 -n marketpulse-production
```

### Rollback

Om terug te gaan naar een vorige versie:

```bash
# Rollback naar de vorige versie
kubectl rollout undo deployment/marketpulse-backend -n marketpulse-production
kubectl rollout undo deployment/marketpulse-frontend -n marketpulse-production
```

### Status controleren

Om de status van de deployments te controleren:

```bash
# Status van de deployments bekijken
kubectl get deployments -n marketpulse-production

# Gedetailleerde status van een specifieke deployment
kubectl describe deployment marketpulse-backend -n marketpulse-production

# Logs bekijken
kubectl logs deployment/marketpulse-backend -n marketpulse-production
```
