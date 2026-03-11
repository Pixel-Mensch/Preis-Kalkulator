# Deployment auf Hetzner

## Zielbild

Für den ersten Livegang ist dieses Projekt für eine einfache Einzelinstanz vorbereitet:

- ein Hetzner-Server
- Docker Compose
- eine SQLite-Datei
- ein Admin-Zugang

Das ist bewusst schlicht gehalten, damit die App schnell online geht und für Demo, Screenshots und erste Gespräche nutzbar ist.

## Was du vorab brauchst

Vor dem Deployment solltest du diese Dinge bereit haben:

- SSH-Zugang zu deinem Hetzner-Server
- deine Admin-E-Mail
- ein sicheres Startpasswort
- einen langen `SESSION_SECRET`
- optional bereits die finalen Firmendaten

Optional, aber für Außenwirkung sinnvoll:

- Domain oder Subdomain
- HTTPS über einen Reverse Proxy

## Welche ENV-Werte du selbst setzen musst

Für das Standard-Compose-Setup auf Hetzner musst du in `.env` normalerweise nur diese Werte selbst pflegen:

- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

Optional beim ersten Bootstrap:

- `COMPANY_NAME`
- `COMPANY_EMAIL`
- `COMPANY_PHONE`
- `COMPANY_WEBSITE`
- `COMPANY_STREET`
- `COMPANY_POSTAL_CODE`
- `COMPANY_CITY`
- `COMPANY_SERVICE_AREA_NOTE`
- `COMPANY_ESTIMATE_FOOTNOTE`
- `COMPANY_SUPPORT_HOURS`

Wichtig:

- `SESSION_SECRET` muss mindestens 32 Zeichen lang sein
- `ADMIN_PASSWORD` darf nicht auf `ChangeMe123!` bleiben
- entweder alle Pflichtwerte aus `COMPANY_*` setzen oder keinen davon

Nicht nötig für den Standard-Compose-Weg:

- `DATABASE_URL`
- `HOSTNAME`
- `PORT`
- `RUN_DB_MIGRATE_ON_START`

Diese Werte werden im Compose-Setup bereits passend gesetzt.

## Empfohlener Hetzner-Weg für Anfänger

### 1. Server anlegen

Empfehlung für den ersten Start:

- Ubuntu 24.04 LTS
- kleiner Cloud-Server reicht für Demo und erste Vorführung
- SSH-Key direkt beim Anlegen hinterlegen

### 2. Auf den Server verbinden

```bash
ssh root@DEINE_SERVER_IP
```

### 3. Docker installieren

Installiere Docker und Docker Compose nach der offiziellen Docker-Anleitung für Ubuntu.

### 4. Repository holen

```bash
apt update
apt install -y git
git clone https://github.com/Pixel-Mensch/Preis-Kalkulator.git
cd Preis-Kalkulator
```

### 5. Laufzeitordner und ENV vorbereiten

```bash
mkdir -p data
cp .env.example .env
```

### 6. `.env` bearbeiten

Passe mindestens diese Werte an:

```env
SESSION_SECRET="hier-ein-langes-zufaelliges-geheimnis-mit-mindestens-32-zeichen"
ADMIN_EMAIL="admin@deine-domain.de"
ADMIN_PASSWORD="hier-ein-sicheres-startpasswort"
ADMIN_NAME="Administrator"
```

Wenn du Firmendaten direkt anlegen willst, setze zusätzlich alle `COMPANY_*` Werte. Sonst pflegst du sie danach im Admin.

### 7. Container bauen und starten

```bash
docker compose build
docker compose up -d
```

### 8. Einmaligen Bootstrap ausführen

```bash
docker compose exec app npm run bootstrap:single-instance
```

Dabei werden:

- Migrationen angewendet
- der Admin-Zugang angelegt oder aktualisiert
- Preisprofil und optional Firmendaten vorbereitet

### 9. Health prüfen

```bash
curl http://localhost:3000/api/health
```

Das gewünschte Ergebnis ist:

- `status: "ok"` für betriebsbereit
- `status: "degraded"` wenn noch Firmendaten, Preisprofil oder Admin fehlen
- `status: "error"` bei technischem Problem

### 10. App im Browser öffnen

Für den ersten Test:

- `http://DEINE_SERVER_IP:3000`
- `http://DEINE_SERVER_IP:3000/rechner`
- `http://DEINE_SERVER_IP:3000/admin/login`

Für Screenshots und erste Vorführung reicht das.

Für eine ernsthafte öffentliche URL solltest du danach Domain und HTTPS sauber davorsetzen.

## Frischer Demo-Stand auf dem Server

Wenn deine Instanz nur für Screenshots oder Vorführungen gedacht ist, kannst du den Demo-Zustand komplett neu aufbauen:

```bash
docker compose exec app npm run db:reset-demo
```

Danach sind Demo-Firmendaten, Preisprofil, Admin und Beispielanfragen wieder frisch vorhanden.

Wichtig:

- nur auf Demo- oder Screenshot-Instanzen verwenden
- nicht auf einer Instanz mit echten Kundenanfragen verwenden

## Bare-Metal-Fallback ohne Docker

Nur nutzen, wenn Docker wirklich keine Option ist.

1. Node.js 20 installieren
2. Repository auf den Server kopieren
3. `.env` anlegen
4. `DATABASE_URL` auf einen echten Linux-Pfad setzen, z. B. `file:/var/lib/entruempler-angebotsrechner/app.db`
5. `npm install`
6. `npm run build`
7. `npm run bootstrap:single-instance`
8. `npm run start`

Für dauerhaften Betrieb zusätzlich einen Process Manager wie `systemd` verwenden.

## Update-Ablauf

```bash
git pull
docker compose build
docker compose up -d
docker compose exec app npm run bootstrap:single-instance
curl http://localhost:3000/api/health
```

## Aktuelle Grenzen

- Single-Tenant-Setup
- SQLite für den ersten Livegang
- In-Memory Rate Limiting
- keine E-Mail-Zustellung
- keine Datei-Uploads
- keine Multi-Instance-Koordination
