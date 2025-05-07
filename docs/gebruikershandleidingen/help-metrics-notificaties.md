# Help Metrics Dashboard Notificatiesysteem

Deze handleiding beschrijft het gebruik van het notificatiesysteem in het Help Metrics Dashboard. Met dit systeem kun je notificaties instellen voor belangrijke metrics, zodat je op de hoogte blijft van veranderingen in het help systeem.

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Notificaties bekijken](#notificaties-bekijken)
3. [Notificatie-instellingen beheren](#notificatie-instellingen-beheren)
4. [Drempelwaarden instellen](#drempelwaarden-instellen)
5. [Notificatiemethoden configureren](#notificatiemethoden-configureren)
6. [Veelgestelde vragen](#veelgestelde-vragen)

## Overzicht

Het notificatiesysteem stelt je in staat om:

- Drempelwaarden in te stellen voor verschillende metrics
- Notificaties te ontvangen wanneer metrics drempelwaarden overschrijden
- Notificaties te bekijken, markeren als gelezen en verwijderen
- Notificaties in-/uitschakelen en notificatiemethoden configureren

## Notificaties bekijken

Notificaties zijn toegankelijk via de notificatiebel in de rechterbovenhoek van het Help Metrics Dashboard.

1. Klik op de notificatiebel om het notificatiepaneel te openen
2. Het aantal ongelezen notificaties wordt weergegeven als een badge op de bel
3. In het notificatiepaneel zie je een lijst van alle notificaties
4. Ongelezen notificaties hebben een lichtgrijze achtergrond
5. Klik op een notificatie om deze als gelezen te markeren
6. Klik op het prullenbakpictogram om een notificatie te verwijderen
7. Gebruik de knoppen bovenaan het paneel om alle notificaties als gelezen te markeren of alle notificaties te verwijderen

![Notificatiebel](../assets/images/notification-bell.png)

## Notificatie-instellingen beheren

Je kunt je notificatie-instellingen beheren via het personalisatiemenu van het dashboard.

1. Klik op het personalisatiepictogram in de rechterbovenhoek van het dashboard
2. Ga naar de tab "Notificaties"
3. Hier kun je notificaties in- of uitschakelen, notificatiemethoden configureren en drempelwaarden beheren

![Notificatie-instellingen](../assets/images/notification-settings.png)

## Drempelwaarden instellen

Drempelwaarden bepalen wanneer je een notificatie ontvangt voor een specifieke metric.

1. Ga naar de tab "Notificaties" in het personalisatiemenu
2. Klik op "Nieuwe Drempelwaarde"
3. Selecteer de metric die je wilt monitoren
4. Kies een operator (groter dan, kleiner dan, gelijk aan, etc.)
5. Voer een waarde in
6. Optioneel: voer een aangepast bericht in voor de notificatie
7. Klik op "Opslaan"

Je kunt bestaande drempelwaarden bewerken of verwijderen door op de respectievelijke pictogrammen te klikken.

### Beschikbare metrics

| Metric | Beschrijving |
|--------|-------------|
| Totaal aantal interacties | Het totale aantal interacties met het help systeem |
| Totaal aantal feedback | Het totale aantal feedback items ontvangen |
| Feedback indieningspercentage | Het percentage van interacties dat resulteert in feedback |
| Positieve feedback percentage | Het percentage van feedback dat positief is |
| Gemiddelde gebruikerstevredenheid | De gemiddelde tevredenheidsscore van gebruikers (1-5) |

### Operators

| Operator | Symbool | Beschrijving |
|----------|---------|-------------|
| Groter dan | > | Triggert wanneer de waarde groter is dan de drempelwaarde |
| Kleiner dan | < | Triggert wanneer de waarde kleiner is dan de drempelwaarde |
| Gelijk aan | = | Triggert wanneer de waarde gelijk is aan de drempelwaarde |
| Groter dan of gelijk aan | >= | Triggert wanneer de waarde groter dan of gelijk is aan de drempelwaarde |
| Kleiner dan of gelijk aan | <= | Triggert wanneer de waarde kleiner dan of gelijk is aan de drempelwaarde |

## Notificatiemethoden configureren

Je kunt kiezen hoe je notificaties wilt ontvangen.

1. Ga naar de tab "Notificaties" in het personalisatiemenu
2. In de sectie "Notificatie Methoden" kun je verschillende methoden in- of uitschakelen:
   - In-app notificaties: notificaties in de applicatie via de notificatiebel
   - E-mail notificaties: notificaties via e-mail (indien geconfigureerd)

## Veelgestelde vragen

### Hoe vaak worden drempelwaarden gecontroleerd?

Drempelwaarden worden elke minuut gecontroleerd wanneer je het Help Metrics Dashboard bekijkt. Als je het dashboard niet actief bekijkt, worden drempelwaarden gecontroleerd wanneer je terugkeert naar het dashboard.

### Kan ik tijdelijk alle notificaties uitschakelen?

Ja, je kunt alle notificaties uitschakelen door de schakelaar bovenaan de notificatie-instellingen uit te zetten. Je kunt ze later weer inschakelen zonder je drempelwaarden te verliezen.

### Worden notificaties opgeslagen als ik uitlog?

Ja, alle notificaties en notificatie-instellingen worden opgeslagen in de database en blijven behouden wanneer je uitlogt en later weer inlogt.

### Kan ik notificaties ontvangen voor specifieke pagina's of gebruikersrollen?

In de huidige versie kun je alleen notificaties instellen voor algemene metrics. Toekomstige versies zullen mogelijk meer gedetailleerde notificaties ondersteunen.

### Hoe lang blijven notificaties bewaard?

Notificaties blijven bewaard totdat je ze verwijdert. Er is geen automatische verwijdering van oude notificaties.

### Kan ik notificaties delen met andere gebruikers?

In de huidige versie zijn notificaties persoonlijk en kunnen ze niet worden gedeeld met andere gebruikers. Elke gebruiker moet zijn eigen notificatie-instellingen configureren.
