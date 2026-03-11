# QA Report

## Geprüfte Flows

- Landingpage lädt mit Firmendaten und führt zum Rechner
- Rechner validiert Pflichtfelder clientseitig und zeigt Fehlermeldungen kontrolliert an
- Servervalidierung für Inquiry-Submit prüft Eingaben, Honeypot, Rate Limit und Konfiguration
- Anfrage-Submit speichert einen Snapshot und blockiert doppelte Submits innerhalb eines kurzen Fensters
- Success Page reagiert kontrolliert, auch wenn Firmendaten fehlen
- Admin-Login prüft Credentials und begrenzt wiederholte Fehlversuche
- Admin-Dashboard, Lead-Liste und Lead-Detail wurden auf fehlende oder beschädigte Datenpfade geprüft
- PDF-Export reagiert kontrolliert auf fehlende Firmendaten oder beschädigte Snapshots
- Preisänderungen bleiben auf neue Anfragen beschränkt, bestehende Snapshots bleiben unverändert
- Firmendatenänderungen revalidieren die relevanten öffentlichen und Admin-Routen
- Seed- und Demo-Reset-Pfad wurden mit `npm run db:reset-demo` erfolgreich geprüft

## Gefundene Probleme

- Inquiry-API reagierte auf ungültiges JSON nicht kontrolliert
- `desiredDate` prüfte nur das Format, nicht echte Kalenderdaten
- Problemflags waren serverseitig nicht auf Duplikate abgesichert
- Doppelte Anfrage-Submits konnten serverseitig noch einmal gespeichert werden
- Fehlende Preis- oder Firmendaten führten in mehreren Pfaden zu harten Laufzeitfehlern
- Beschädigte JSON-Snapshots konnten Lead-Detail und PDF-Export unkontrolliert abbrechen lassen
- Admin-Status- und Settings-Actions gingen bei fehlenden Datensätzen nicht kontrolliert in einen erklärten Fehlerzustand
- Admin-Login hatte noch kein eigenes Rate Limit

## Behobene Probleme

- Inquiry-API fängt invalides JSON jetzt sauber mit `400` ab
- Datumsvalidierung prüft jetzt echte `YYYY-MM-DD`-Kalenderdaten und speichert date-only Werte stabil
- E-Mail-Felder werden serverseitig getrimmt und normalisiert
- Problemflags werden serverseitig auf Duplikate geprüft
- Serverseitige Submit-Guard verhindert doppelte Anfragen im kurzen Wiederholungsfenster
- Client leitet bei erkannter Doppelspeicherung sauber auf die bestehende Success Page weiter
- Öffentliche Seiten und Admin-Formseiten reagieren kontrolliert auf fehlende Konfiguration statt hart zu crashen
- Lead-Detail und PDF-Route behandeln beschädigte Snapshots jetzt defensiv
- Admin-Login hat ein einfaches Rate Limit für wiederholte Fehlversuche
- Admin-Actions prüfen fehlende Datensätze robuster und revalidieren betroffene Routen gezielter
- Zusätzliche Tests decken Validation, Manual Review und Inquiry-API-Edge-Cases ab

## Verbleibende bekannte Risiken

- Rate Limit und Submit-Guard sind in-memory und damit nur für Single-Instance-Demos oder kleine Pilotinstallationen belastbar
- SQLite bleibt für Demo, lokale Nutzung und Single-Installationen geeignet, aber nicht für horizontale Skalierung
- Es gibt weiterhin keine Browser- oder E2E-Automation für den vollständigen UI-Klickpfad
- Uploads, E-Mail-Benachrichtigungen und weitergehende Admin-Filter sind weiterhin nicht Teil von V1
- Beschädigte Snapshots werden jetzt sauber abgefangen, aber nicht automatisch repariert

## Einschätzung

Demo ready: ja.

Für erste Pilotkunden ist der Stand funktional belastbar, solange die Installation als Single-Instance mit SQLite betrieben wird und die Demo-/Firmendaten sauber eingerichtet sind.
