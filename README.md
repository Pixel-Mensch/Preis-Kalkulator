# Entrümpler Angebotsrechner V1

Digitales Anfrage- und Kostenschätzungstool für Entrümpelungsbetriebe in Deutschland. Interessenten erhalten eine unverbindliche Ersteinschätzung als Preisrahmen, der Betrieb erhält strukturierte Anfragen mit allen wichtigen Eckdaten in einem geschützten Admin-Bereich.

## Was das Produkt bringt

- weniger unklare Erstanfragen über Website, Telefon oder WhatsApp
- schnellerer Überblick über Aufwand, Zugang, Extras und Sonderfälle
- professionellerer Erstkontakt durch eine saubere, mobile Anfrageführung
- strukturierte Lead-Erfassung statt losem Kontaktformular
- anpassbare Preislogik ohne Verlust der historischen Anfrage-Snapshots

## Funktionsumfang

### Öffentlich

- Landingpage mit klarem Nutzenversprechen
- mobiler Anfrage-Rechner mit unverbindlicher Kostenschätzung
- strukturierte Anfrage mit Kontaktangaben und Freitext
- Bestätigungsseite mit nächsten Schritten

### Intern / Admin

- Admin-Login
- Dashboard mit Überblick über neue und kritische Fälle
- Anfragenliste und Detailansicht
- Statuspflege pro Anfrage
- PDF-Zusammenfassung pro Vorgang
- editierbare Preiseinstellungen
- editierbare Firmendaten

### Fachlich

- zentrale Preislogik
- manuelle Prüfung für Sonderfälle und risikoreiche Kombinationen
- gespeicherter Kalkulations-Snapshot pro Anfrage
- Validierung auf Client- und Serverseite

## Demo- und Präsentationsunterlagen im Repository

### Schnell nutzbar für Kundentermine

- [demo/DEMO_SCRIPT.md](c:/Users/marck/Desktop/Selfmade/Preis-Rechner/demo/DEMO_SCRIPT.md)
- [demo/LIVE_DEMO_FLOW.md](c:/Users/marck/Desktop/Selfmade/Preis-Rechner/demo/LIVE_DEMO_FLOW.md)
- [demo/SCREENSHOT_CHECKLIST.md](c:/Users/marck/Desktop/Selfmade/Preis-Rechner/demo/SCREENSHOT_CHECKLIST.md)
- [demo/VALUE_PROPOSITION.md](c:/Users/marck/Desktop/Selfmade/Preis-Rechner/demo/VALUE_PROPOSITION.md)

### Ausführlichere Vertriebsunterlagen

- [sales/README.md](c:/Users/marck/Desktop/Selfmade/Preis-Rechner/sales/README.md)
- [sales/03_customer-one-pager.md](c:/Users/marck/Desktop/Selfmade/Preis-Rechner/sales/03_customer-one-pager.md)
- [sales/05_service-scope-and-pricing.md](c:/Users/marck/Desktop/Selfmade/Preis-Rechner/sales/05_service-scope-and-pricing.md)
- [sales/06_sales-offer-structure.md](c:/Users/marck/Desktop/Selfmade/Preis-Rechner/sales/06_sales-offer-structure.md)

## Demo-Flow in Kurzform

1. Startseite zeigen und den Nutzen in einem Satz erklären.
2. Im Rechner einen normalen Wohnungsfall eingeben.
3. Preisrahmen und Formulierung „unverbindliche Kostenschätzung“ betonen.
4. Anfrage absenden und die Bestätigungsseite zeigen.
5. Im Admin die neue Anfrage öffnen.
6. PDF-Download und Preisänderung als Anpassbarkeit zeigen.

Die empfohlene Reihenfolge und konkrete Formulierungen stehen in [demo/LIVE_DEMO_FLOW.md](c:/Users/marck/Desktop/Selfmade/Preis-Rechner/demo/LIVE_DEMO_FLOW.md).

## Die wichtigsten Screens für Demo und Verkauf

1. Startseite mit Hero und klarer Nutzenbotschaft
2. Rechner mit sichtbarem Preisrahmen
3. Bestätigungsseite nach dem Absenden
4. Admin-Dashboard mit Kennzahlen und manueller Prüfung
5. Anfrage-Detail mit Snapshot, Kostenaufschlüsselung und PDF

Die ausführliche Shot-Liste steht in [demo/SCREENSHOT_CHECKLIST.md](c:/Users/marck/Desktop/Selfmade/Preis-Rechner/demo/SCREENSHOT_CHECKLIST.md).

## Lokales Setup

1. `.env.example` nach `.env` kopieren
2. Abhängigkeiten installieren
3. lokale SQLite-Datenbank aufsetzen
4. Demo-Daten einspielen
5. App starten

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Für einen frischen Demo-Stand:

```bash
npm run db:reset-demo
```

Öffnen:

- Startseite: `http://localhost:3000`
- Rechner: `http://localhost:3000/rechner`
- Admin-Login: `http://localhost:3000/admin/login`

## Demo-Zugang

Der Seed legt einen Demo-Admin auf Basis der `.env`-Werte an.

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace-with-a-long-random-string"
ADMIN_EMAIL="demo@klarraum-ruhr.de"
ADMIN_PASSWORD="ChangeMe123!"
```

## Deployment im Überblick

### Aktuell sinnvoll

- lokale Demos
- Pilotbetrieb auf einer einzelnen Instanz
- kleiner Linux-Server oder Docker-Host

### Technische Einordnung

- SQLite ist bewusst für Demo, lokale Nutzung und einfache Single-Installationen gewählt
- PDF-Erzeugung läuft serverseitig ohne Headless-Browser
- für breitere Produktion sollte mittelfristig auf PostgreSQL gewechselt werden

### Docker-Kurzbeispiel

```bash
docker build -t entruempler-rechner .
docker run \
  -p 3000:3000 \
  -e SESSION_SECRET="replace-with-a-long-random-string" \
  -e ADMIN_EMAIL="demo@klarraum-ruhr.de" \
  -e ADMIN_PASSWORD="ChangeMe123!" \
  -e DATABASE_URL="file:/app/data/dev.db" \
  -v entruempler-data:/app/data \
  entruempler-rechner
```

## Qualität und Prüfung

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Für die letzte Härtungsrunde und die geprüften Failure Paths siehe [QA_REPORT.md](c:/Users/marck/Desktop/Selfmade/Preis-Rechner/QA_REPORT.md).

## Wichtige Grenzen

- kein rechtlich bindender Angebotsgenerator
- keine Uploads in V1
- keine E-Mail-Benachrichtigungen in V1
- keine erweiterten Admin-Filter in V1
- Rate Limiting und Duplicate-Submit-Schutz sind aktuell in-memory

## Nächste sinnvolle Schritte

- Preislogik mit echten Betriebswerten kalibrieren
- Admin-Filter für Status, PLZ und manuelle Prüfung ergänzen
- PostgreSQL für breitere Pilot- oder Produktivnutzung vorbereiten
- das Demo- und Sales-Paket als echte PDF- und Website-Assets exportieren
