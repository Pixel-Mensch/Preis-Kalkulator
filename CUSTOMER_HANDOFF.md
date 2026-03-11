# Kundenübergabe für die erste Installation

## Was übergeben wird

Sie erhalten eine einzelne Web-Anwendung für Ihren Entrümpelungsbetrieb mit:

- öffentlicher Anfrage- und Kostenschätzungsseite
- Admin-Bereich für eingehende Anfragen
- editierbaren Preiswerten
- editierbaren Firmendaten
- PDF-Zusammenfassung je Anfrage

Die Anwendung ist für eine einzelne Installation Ihres Betriebs gedacht. Es handelt sich nicht um ein allgemeines Mehrmandanten-System.

## Was Sie für den Betrieb liefern oder bestätigen müssen

- Firmenname
- Telefonnummer und E-Mail-Adresse
- Rechnungs- oder Firmenanschrift
- Einsatzgebiet
- Hinweistext zur unverbindlichen Kostenschätzung
- gewünschte Admin-E-Mail
- sicheres Startpasswort
- Domain oder Subdomain
- optional Logo und Website-URL

## Erstzugang Admin

Der erste Admin-Zugang wird technisch über die Server-Konfiguration angelegt. Für den Betrieb wichtig:

- Admin-Zugang ist nach dem Bootstrap unter `/admin/login` erreichbar
- Passwortänderungen laufen in V1 über die Server-Konfiguration
- ein technischer Passwort-Reset ist jederzeit möglich, ohne die Datenbank zurückzusetzen

## Was im laufenden Betrieb selbst gepflegt werden kann

Im Admin-Bereich können Sie selbst anpassen:

- Preiswerte
- Firmendaten
- Bearbeitungsstatus von Anfragen

Neue Anfragen verwenden immer die aktuellen Preiswerte. Bereits gespeicherte Anfragen behalten ihren ursprünglichen Kalkulations-Snapshot.

## Backup und Wiederherstellung

Die Installation nutzt aktuell eine einzelne SQLite-Datei. Für Sie bedeutet das:

- Datensicherung ist einfach
- vor Updates sollte immer ein Backup erstellt werden
- im Fehlerfall kann eine gesicherte Datenbankdatei zurückgespielt werden

Die technische Durchführung steht in [OPERATIONS.md](OPERATIONS.md).

## Was V1 aktuell bewusst nicht enthält

- kein rechtlich bindender Angebotsgenerator
- keine E-Mail-Benachrichtigungen
- keine Datei-Uploads
- kein Multi-Standort- oder Multi-Mandanten-Betrieb
- keine direkte Passwortänderung im Admin

## Wann ein technisches Update sinnvoll ist

Ein Ausbau ist später sinnvoll, wenn:

- mehrere Mitarbeiter gleichzeitig intensiver arbeiten
- weitere Betriebsstandorte dazukommen
- E-Mail-Benachrichtigungen oder Uploads benötigt werden
- eine zentrale Mehrkunden-Plattform entstehen soll

Dann sollte die Installation mittelfristig auf PostgreSQL und eine stärkere Betriebsarchitektur umgestellt werden.
