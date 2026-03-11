# Screenshot-Checkliste

## Die 5 Pflicht-Screenshots

- [x] Startseite mit Hero, Nutzen und klarer CTA
- [x] Rechner mit sichtbarem Preisrahmen
- [x] Bestaetigungsseite nach dem Absenden
- [ ] Admin-Dashboard mit Kennzahlen und manueller Pruefung
- [ ] Anfrage-Detail mit Snapshot, Kostenaufschluesselung und PDF

## Aktueller Stand

Die vorhandenen Public-Screenshots reichen jetzt bereits fuer:

- Landingpage
- Rechner Schritt 1
- Preisrahmen als Detailausschnitt
- Rechner Schritt 2 vor dem Absenden
- Success-Flow nach dem Absenden

Noch offen fuer ein vollstaendiges B2B-Demo-Set:

- Admin-Dashboard
- Anfrage-Detail im Admin

## Kuratierte Ablage

Lokal abgelegt unter `demo/assets/screenshots/final/desktop/`:

- `01-landing-hero-desktop.png`
- `02-landing-benefits-desktop.png`
- `03-calculator-step-1-overview-desktop.png`
- `04-calculator-step-1-details-desktop.png`
- `05-price-range-panel-detail.png`
- `06-calculator-step-2-review-desktop.png`
- `07-calculator-step-2-contact-submit-desktop.png`
- `08-success-page-desktop.png`

## Empfohlene Auswahl mit den vorhandenen Screens

### 5 Bilder fuer One-Pager

1. `01-landing-hero-desktop.png`
2. `03-calculator-step-1-overview-desktop.png`
3. `05-price-range-panel-detail.png`
4. `07-calculator-step-2-contact-submit-desktop.png`
5. `08-success-page-desktop.png`

### 7 Bilder fuer Kundentermin

1. `01-landing-hero-desktop.png`
2. `02-landing-benefits-desktop.png`
3. `03-calculator-step-1-overview-desktop.png`
4. `04-calculator-step-1-details-desktop.png`
5. `05-price-range-panel-detail.png`
6. `07-calculator-step-2-contact-submit-desktop.png`
7. `08-success-page-desktop.png`

### 8 Bilder fuer Portfolio oder ausfuehrlichere Demo

1. `01-landing-hero-desktop.png`
2. `02-landing-benefits-desktop.png`
3. `03-calculator-step-1-overview-desktop.png`
4. `04-calculator-step-1-details-desktop.png`
5. `05-price-range-panel-detail.png`
6. `06-calculator-step-2-review-desktop.png`
7. `07-calculator-step-2-contact-submit-desktop.png`
8. `08-success-page-desktop.png`

## Praktische Empfehlung fuer den naechsten Schritt

- Fuer Endkundenwirkung und saubere Produktdarstellung reicht dein aktueller Satz bereits gut.
- Fuer einen Verkaufstermin mit Entruempelungsfirmen solltest du als Naechstes noch genau 2 Admin-Screens ergaenzen.
- `05-price-range-panel-detail.png` ist stark als Zusatzbild oder Crop, aber nicht als alleiniger Hauptscreen.

## Empfohlene Reihenfolge fuer Verkauf und Praesentation

1. Nutzen zeigen
2. Bedienung zeigen
3. Preislogik konkret machen
4. Abschluss und Vertrauen zeigen
5. Internen Mehrwert mit Admin ergaenzen

## A. Screenshots fuer Kundentermine oder Angebots-PDF

### 1. Startseite

- Route: `/`
- Datei: `01-landing-hero-desktop.png`
- Sichtbar sein sollte:
  - Headline
  - Trust-Badges
  - primaere CTA
  - kurzer Nutzenblock
- Caption:
  - "Unverbindliche Kostenschaetzung fuer strukturierte Entruempelungsanfragen"

### 2. Rechner mit Live-Preisrahmen

- Route: `/rechner`
- Datei: `03-calculator-step-1-overview-desktop.png`
- Sichtbar sein sollte:
  - Fortschritt
  - Eingaben zum Objekt
  - rechte Live-Einschaetzung
- Caption:
  - "Der Preisrahmen entsteht direkt aus den wichtigsten Eckdaten"

### 3. Detailansicht des Preisrahmens

- Route: `/rechner`
- Datei: `05-price-range-panel-detail.png`
- Sichtbar sein sollte:
  - Preisrahmen
  - Zwischensumme
  - positive Rueckmeldung zur Einordnung
- Caption:
  - "Die Einschaetzung bleibt im Formular jederzeit sichtbar"

### 4. Zusammenfassung vor dem Absenden

- Route: `/rechner`
- Datei: `07-calculator-step-2-contact-submit-desktop.png`
- Sichtbar sein sollte:
  - Kontaktblock
  - finaler CTA
  - Preisrahmen weiterhin sichtbar
- Caption:
  - "Aus wenigen Angaben wird eine verwertbare Anfrage"

### 5. Bestaetigungsseite

- Route: `/anfrage/gesendet/[publicId]`
- Datei: `08-success-page-desktop.png`
- Sichtbar sein sollte:
  - Status "Anfrage eingegangen"
  - Preisrahmen
  - naechste Schritte
- Caption:
  - "Professioneller Abschluss statt einfachem Formular-Thank-you"

### 6. Admin-Dashboard

- Route: `/admin`
- Geraet: Desktop
- Sichtbar sein sollte:
  - Kennzahlen
  - neueste Anfragen
  - Bereich fuer neue oder manuell zu pruefende Faelle
- Caption:
  - "Neue Anfragen, kritische Faelle und Bearbeitungsstand auf einen Blick"

### 7. Anfrage-Detail

- Route: `/admin/anfragen/[id]`
- Geraet: Desktop
- Sichtbar sein sollte:
  - Stammdaten
  - Kostenaufschluesselung
  - PDF-Button
- Caption:
  - "Jede Anfrage bleibt mit Kalkulations-Snapshot nachvollziehbar"

## B. Screenshots fuer Portfolio oder Case Study

### Hook-Bild

- Datei: `01-landing-hero-desktop.png`
- Ziel:
  - sofort den Kundennutzen zeigen
- Caption:
  - "Entruempelung anfragen und vorab einen realistischen Preisrahmen erhalten"

### Produktuebersicht

- Datei: `02-landing-benefits-desktop.png`
- Ziel:
  - Nutzen und Positionierung erklaeren
- Caption:
  - "Weniger Raetselraten fuer Kunden, bessere Vorbereitung fuer den Betrieb"

### Produktbedienung

- Datei: `03-calculator-step-1-overview-desktop.png`
- Ziel:
  - zeigen, dass die Anfrage gefuehrt und schlank bleibt
- Caption:
  - "Mobile-first Rechner mit laufender Einschaetzung"

### Abschluss

- Datei: `08-success-page-desktop.png`
- Ziel:
  - Vertrauen und professionelles Ende des Flows zeigen
- Caption:
  - "Nach dem Absenden bleibt der naechste Schritt klar"

## C. Visuelle Hinweise fuer gute Screenshots

- moeglichst echte Demo-Daten statt leerer States verwenden
- auf Deutsch bleiben
- Preisrahmen und manuelle Pruefung deutlich sichtbar machen
- lieber 5 starke Bilder als 12 aehnliche Screens
- fuer ein B2B-Deck auf jeden Fall noch 2 Admin-Screens ergaenzen

## D. Welche Demo-Faelle sich am besten eignen

- Standard-Wohnung fuer den ersten Einstieg
- Haus mit Extras fuer Anpassbarkeit
- Manual-Review-Fall fuer Glaubwuerdigkeit

Der erste Screenshot-Satz sollte fast immer mit dem Standard-Wohnungsfall beginnen.
