# Decodo Export Functionaliteit

Deze documentatie beschrijft de exportfunctionaliteit in MarketPulse AI, waarmee gebruikers de verzamelde data en inzichten kunnen exporteren naar verschillende formaten.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Componenten](#componenten)
3. [Ondersteunde Formaten](#ondersteunde-formaten)
4. [Gebruik](#gebruik)
5. [Aanpassen van Exports](#aanpassen-van-exports)
6. [Troubleshooting](#troubleshooting)

## Overzicht

De exportfunctionaliteit stelt gebruikers in staat om:
- Scraping resultaten te exporteren naar PDF, Excel of HTML
- Inzichten te exporteren naar PDF, Excel of HTML
- Aangepaste secties toe te voegen aan exports
- Grafieken en visualisaties te includeren in exports

## Componenten

De functionaliteit bestaat uit de volgende componenten:

1. **ExportButton Component**: UI component voor het exporteren van data
2. **exportUtils.js**: Utility functies voor het formatteren en exporteren van data
3. **Integratie in Dashboards**: Integratie in DecodoResultsDashboard en DecodoInsightsDashboard

## Ondersteunde Formaten

### PDF
- Volledig opgemaakte rapporten met grafieken, tabellen en tekst
- Aanpasbare oriëntatie (staand of liggend)
- Automatische paginering en inhoudsopgave
- Ondersteuning voor afbeeldingen en grafieken

### Excel
- Gestructureerde data in werkbladen
- Meerdere werkbladen voor verschillende secties
- Automatische opmaak en filtering
- Ondersteuning voor formules en grafieken

### HTML
- Interactieve rapporten die in een browser kunnen worden bekeken
- Ondersteuning voor licht en donker thema
- Responsive design voor verschillende schermformaten
- Mogelijkheid om te delen via e-mail of web

## Gebruik

### Exporteren van Scraping Resultaten

1. Ga naar het DecodoResultsDashboard
2. Klik op de "Exporteer" knop
3. Selecteer het gewenste formaat (PDF, Excel of HTML)
4. Pas de export opties aan indien gewenst
5. Klik op "Exporteren"

### Exporteren van Inzichten

1. Ga naar het DecodoInsightsDashboard
2. Klik op de "Exporteer" knop
3. Selecteer het gewenste formaat (PDF, Excel of HTML)
4. Pas de export opties aan indien gewenst
5. Klik op "Exporteren"

### Export Opties

- **Includeren van Grafieken**: Includeert grafieken en visualisaties in de export
- **Includeren van Ruwe Data**: Includeert de ruwe data in de export
- **Includeren van Samenvatting**: Includeert een samenvatting van de data in de export
- **Oriëntatie** (alleen PDF): Staand of liggend
- **Thema** (alleen HTML): Licht of donker

## Aanpassen van Exports

De exportfunctionaliteit kan worden aangepast door de volgende bestanden te wijzigen:

### Aanpassen van ExportButton Component

Het ExportButton component kan worden aangepast om extra opties of functionaliteit toe te voegen:

```jsx
<ExportButton
  data={data}
  projectName={projectName}
  contentType="insights"
  title="Exporteer"
  pdfTitle="MarketPulse AI Inzichten Rapport"
  disabled={false}
  variant="outlined"
  size="medium"
  color="primary"
  customSections={[
    {
      id: 'custom-section',
      title: 'Aangepaste Sectie',
      type: 'text',
      content: 'Dit is een aangepaste sectie.'
    }
  ]}
/>
```

### Aanpassen van exportUtils.js

De exportUtils.js kan worden aangepast om extra functionaliteit toe te voegen voor het formatteren of exporteren van data:

```javascript
// Voorbeeld van een aangepaste formatteer functie
export const formatCustomData = (data) => {
  // Formatteer de data
  return formattedData;
};

// Voorbeeld van een aangepaste sectie generator
export const generateCustomSections = (data) => {
  // Genereer aangepaste secties
  return sections;
};
```

## Troubleshooting

### PDF Export Problemen

- **Probleem**: Grafieken worden niet weergegeven in de PDF
  - **Oplossing**: Zorg ervoor dat de chart referentie correct is doorgegeven aan de ExportButton component

- **Probleem**: PDF is te groot of te klein
  - **Oplossing**: Pas de oriëntatie aan of beperk de hoeveelheid data die wordt geëxporteerd

### Excel Export Problemen

- **Probleem**: Data wordt niet correct weergegeven in Excel
  - **Oplossing**: Controleer of de data correct is geformatteerd voor Excel export

- **Probleem**: Excel bestand kan niet worden geopend
  - **Oplossing**: Controleer of het bestand correct is gedownload en of Excel is geïnstalleerd

### HTML Export Problemen

- **Probleem**: HTML bestand wordt niet correct weergegeven in de browser
  - **Oplossing**: Controleer of de browser HTML5 ondersteunt en of alle CSS en JavaScript correct is geladen

- **Probleem**: Grafieken worden niet weergegeven in de HTML export
  - **Oplossing**: Controleer of de chart referentie correct is doorgegeven aan de ExportButton component
