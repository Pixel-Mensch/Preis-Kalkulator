# Screenshot-Checkliste

## Die 5 Pflicht-Screenshots

- [ ] Startseite mit Hero, Nutzen und klarer CTA
- [ ] Rechner mit sichtbarem Preisrahmen
- [ ] Bestätigungsseite nach dem Absenden
- [ ] Admin-Dashboard mit Kennzahlen und manueller Prüfung
- [ ] Anfrage-Detail mit Snapshot, Kostenaufschlüsselung und PDF

## Empfohlene Reihenfolge für Verkauf und Präsentation

1. Nutzen zeigen
2. Bedienung zeigen
3. internen Mehrwert zeigen
4. Anpassbarkeit und Nachvollziehbarkeit belegen

## A. Screenshots für Kundentermine oder Angebots-PDF

### 1. Startseite

- Route: `/`
- Gerät: mobile first, alternativ Desktop-Hero
- Sichtbar sein sollte:
  - Headline
  - zwei Trust-Badges
  - primäre CTA
  - kurzer Nutzenblock
- Caption:
  - „Unverbindliche Kostenschätzung für strukturierte Entrümpelungsanfragen“

### 2. Rechner mit Live-Preisrahmen

- Route: `/rechner`
- Gerät: mobile
- Sichtbar sein sollte:
  - Fortschritt
  - Eingaben zum Objekt
  - rechte Live-Einschätzung
- Caption:
  - „Der Preisrahmen entsteht direkt aus den wichtigsten Eckdaten“

### 3. Zusammenfassung vor dem Absenden

- Route: `/rechner`
- Gerät: mobile oder Tablet
- Sichtbar sein sollte:
  - Preisrahmen aktuell
  - Zusammenfassung
  - Kontaktblock
- Caption:
  - „Aus wenigen Angaben wird eine verwertbare Anfrage“

### 4. Bestätigungsseite

- Route: `/anfrage/gesendet/[publicId]`
- Gerät: Desktop oder Tablet
- Sichtbar sein sollte:
  - Status „Anfrage eingegangen“
  - Preisrahmen
  - nächste Schritte
- Caption:
  - „Professioneller Abschluss statt einfachem Formular-Thank-you“

### 5. Admin-Dashboard

- Route: `/admin`
- Gerät: Desktop
- Sichtbar sein sollte:
  - Kennzahlen
  - neueste Anfragen
  - Bereich „Sofort im Blick“
- Caption:
  - „Neue Anfragen, kritische Fälle und Bearbeitungsstand auf einen Blick“

### 6. Anfrage-Detail

- Route: `/admin/anfragen/[id]`
- Gerät: Desktop
- Sichtbar sein sollte:
  - Stammdaten
  - Kostenaufschlüsselung
  - PDF-Button
- Caption:
  - „Jede Anfrage bleibt mit Kalkulations-Snapshot nachvollziehbar“

### 7. Preiseinstellungen

- Route: `/admin/preise`
- Gerät: Desktop
- Sichtbar sein sollte:
  - Preislogik
  - Zuschläge
  - Travel-Zonen
- Caption:
  - „Preiswerte und Zuschläge lassen sich pro Betrieb anpassen“

## B. Screenshots für Portfolio / Case Study

### Hook-Bild

- Route: `/rechner`
- Ziel:
  - sofort mobile Relevanz zeigen
- Caption:
  - „Mobile-first Anfrage-Rechner für lokale Servicebetriebe“

### Produktübersicht

- Route: `/`
- Ziel:
  - Nutzen und Positionierung erklären
- Caption:
  - „Aus vagen Anfragen werden strukturierte Erstkontakte“

### Interne Arbeitsoberfläche

- Route: `/admin`
- Ziel:
  - B2B-Nutzen sichtbar machen
- Caption:
  - „Das Tool endet nicht beim Formular, sondern führt in einen nutzbaren Arbeitsprozess“

### Nachvollziehbarkeit

- Route: `/admin/anfragen/[id]`
- Ziel:
  - fachliche Tiefe und Snapshot-Logik zeigen
- Caption:
  - „Preislogik, Status und PDF bleiben pro Vorgang sauber nachvollziehbar“

## C. Visuelle Hinweise für gute Screenshots

- möglichst echte Demo-Daten statt leere States verwenden
- auf Deutsch bleiben
- Preisrahmen und manuelle Prüfung deutlich sichtbar machen
- lieber 5 starke Bilder als 12 ähnliche Screens
- für Portfolio mindestens ein Mobile- und ein Desktop-Screen mischen

## D. Welche Demo-Fälle sich am besten eignen

- Standard-Wohnung für den ersten Einstieg
- Haus mit Extras für Anpassbarkeit
- Manual-Review-Fall für Glaubwürdigkeit

Der erste Screenshot-Satz sollte fast immer mit dem Standard-Wohnungsfall beginnen.
