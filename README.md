# Entrümpler Angebotsrechner V1

Digitales Anfrage- und Kostenschätzungstool für Entrümpelungsbetriebe in Deutschland. Interessenten erhalten auf dem Smartphone oder Desktop eine unverbindliche Ersteinschätzung als Preisrahmen. Der Betrieb bekommt strukturierte Anfragen, einen geschützten Admin-Bereich, editierbare Preise und PDF-Zusammenfassungen.

## Was das Produkt bringt

- weniger unklare Erstkontakte über Website, Telefon oder WhatsApp
- schnellerer Überblick über Objekt, Aufwand, Zugang und Sonderfälle
- professionellerer Erstkontakt mit klarer, mobiler Anfrageführung
- strukturierte Lead-Erfassung statt losem Kontaktformular
- anpassbare Preislogik ohne Verlust historischer Anfrage-Snapshots

## Funktionsumfang

### Öffentlich

- Landingpage mit klarer Nutzenkommunikation
- mobiler Anfrage-Rechner mit Preisrahmen
- strukturiertes Anfrageformular mit Kontaktangaben
- Bestätigungsseite mit nächsten Schritten

### Intern / Admin

- Admin-Login
- Dashboard mit Kennzahlen und Hinweisen auf manuelle Prüfung
- Anfrage-Liste und Detailansicht
- Statuspflege pro Anfrage
- PDF-Zusammenfassung pro Vorgang
- editierbare Preiseinstellungen
- editierbare Firmendaten

### Fachlich

- zentrale Preislogik
- manuelle Prüfung bei Sonderfällen und riskanten Kombinationen
- gespeicherter Kalkulations-Snapshot pro Anfrage
- Client- und Server-Validierung mit Zod
- Single-Instance-Betrieb mit SQLite für Demo und erste Pilotkunden

## Wichtige Repository-Dokumente

### Demo und Vertrieb

- [demo/DEMO_SCRIPT.md](demo/DEMO_SCRIPT.md)
- [demo/LIVE_DEMO_FLOW.md](demo/LIVE_DEMO_FLOW.md)
- [demo/SCREENSHOT_CHECKLIST.md](demo/SCREENSHOT_CHECKLIST.md)
- [demo/VALUE_PROPOSITION.md](demo/VALUE_PROPOSITION.md)
- [sales/README.md](sales/README.md)

### Betrieb und Übergabe

- [DEPLOYMENT.md](DEPLOYMENT.md)
- [OPERATIONS.md](OPERATIONS.md)
- [CUSTOMER_HANDOFF.md](CUSTOMER_HANDOFF.md)
- [QA_REPORT.md](QA_REPORT.md)

## Demo-Flow in Kurzform

1. Startseite zeigen und den Nutzen in einem Satz erklären.
2. Im Rechner einen typischen Wohnungsfall eingeben.
3. Preisrahmen und Formulierung „unverbindliche Kostenschätzung“ betonen.
4. Anfrage absenden und die Bestätigungsseite zeigen.
5. Im Admin die neue Anfrage öffnen.
6. PDF-Download und editierbare Preise demonstrieren.

Die empfohlene Präsentationsreihenfolge steht in [demo/LIVE_DEMO_FLOW.md](demo/LIVE_DEMO_FLOW.md).

## Die wichtigsten Screens für Demo und Verkauf

1. Startseite mit Hero und klarer Nutzenbotschaft
2. Rechner mit sichtbarem Preisrahmen
3. Bestätigungsseite nach dem Absenden
4. Admin-Dashboard mit Kennzahlen und manueller Prüfung
5. Anfrage-Detail mit Snapshot, Kostenaufschlüsselung und PDF

Die vollständige Shot-Liste steht in [demo/SCREENSHOT_CHECKLIST.md](demo/SCREENSHOT_CHECKLIST.md).

## Lokales Setup

1. `.env.example` nach `.env` kopieren
2. Abhängigkeiten installieren
3. lokale Datenbank vorbereiten
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
- Health-Check: `http://localhost:3000/api/health`

## Lokale Demo-Zugangsdaten

Die Demo-Daten nutzen die Werte aus `.env`:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace-with-a-long-random-string"
ADMIN_EMAIL="demo@klarraum-ruhr.de"
ADMIN_PASSWORD="ChangeMe123!"
```

## Einzelinstanz-Deployment im Überblick

### Empfohlener Weg

Für den ersten zahlenden Kunden ist Docker Compose auf einem kleinen Linux-Server oder Docker-Host der robusteste Weg. Die App bleibt eine einzelne Instanz mit SQLite-Datei auf dem Host.

Schnellstart:

```bash
cp .env.example .env
mkdir -p data
docker compose build
docker compose up -d
docker compose exec app npm run bootstrap:single-instance
```

Danach prüfen:

```bash
curl http://localhost:3000/api/health
```

Die Health-Route liefert:

- `ok`: Instanz läuft und ist für Kundennutzung vorbereitet
- `degraded`: App läuft, aber Admin, Firmendaten oder Preisprofil fehlen noch
- `error`: Runtime- oder Datenbankproblem

### Wichtige Umgebungsvariablen

- `DATABASE_URL`: SQLite-Datei oder später externer Datenbankpfad
- `SESSION_SECRET`: mindestens 32 zufällige Zeichen in Produktion
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`: Erstzugang und Passwort-Sync
- `RUN_DB_MIGRATE_ON_START`: steuert den SQL-Bootstrap beim App-Start
- optionale `COMPANY_*`-Werte: legen Firmendaten beim Bootstrap direkt an

Die vollständigen Schritte stehen in [DEPLOYMENT.md](DEPLOYMENT.md).

## Setup-, Recovery- und Betriebsablauf

- Erstinstallation: `npm run bootstrap:single-instance` oder `docker compose exec app npm run bootstrap:single-instance`
- Passwortrotation: `.env` anpassen und `npm run admin:sync` ausführen
- Backup: App kurz stoppen und die SQLite-Datei aus `./data/dev.db` sichern
- Update: neues Release ziehen, Image neu bauen, Container neu starten, Health prüfen

Die detaillierten Abläufe stehen in [OPERATIONS.md](OPERATIONS.md) und [CUSTOMER_HANDOFF.md](CUSTOMER_HANDOFF.md).

## Qualität und Prüfung

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Wichtige Grenzen in V1

- kein rechtlich bindender Angebotsgenerator
- keine Uploads in V1
- keine E-Mail-Benachrichtigungen in V1
- Rate Limiting und Duplicate-Submit-Schutz sind aktuell in-memory und für eine Einzelinstanz gedacht
- keine Multi-Tenant-Architektur
- Docker- und Bare-Metal-Betrieb sind auf eine einzelne Installation mit SQLite ausgelegt

## Nächste sinnvolle Schritte

- Preislogik mit echten Betriebswerten kalibrieren
- Admin-Filter für Status, PLZ und manuelle Prüfung ergänzen
- PostgreSQL für breitere Pilot- oder Produktivnutzung vorbereiten
- Passwortänderung direkt im Admin ergänzen
