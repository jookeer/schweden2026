# We are Family in Schweden

Installierbarer Offline-Reisebegleiter für den Familienurlaub in Småland vom 14. bis 28. August 2026.

## Funktionen

- persönliche Profile für Annika, Julian, Anna Lena und Familie
- wetter- und stimmungsabhängige Tagesvorschläge
- Reiseplan mit Karten- und Navigationslinks
- dauerhaft sichtbare Navigation zu beiden Ferienhäusern
- Unterkunftsdetails und Växjö-Secondhand-Tipps
- lokal änderbare Tagesaktionen für Übersicht und Detailansicht
- automatisch aktualisierter 16-Tage-Wettertrend von Open-Meteo
- verschiebbare Aktivitäten innerhalb der jeweiligen Unterkunftswoche
- Familien-Abstimmung mit „Unbedingt“, „Vielleicht“ und „Keine Lust“
- optionale gemeinsame Synchronisierung über Supabase
- Öffnungszeiten-Warnungen und öffentlicher Offline-Notfallbereich
- lokal gespeicherte Packlisten und erledigte Reisetage
- Offline-Nutzung als Progressive Web App

## Lokal starten

Die App muss über einen lokalen Webserver geöffnet werden, damit Manifest und Service Worker funktionieren. Zum Beispiel:

```powershell
python -m http.server 8000
```

Danach `http://localhost:8000` im Browser öffnen.

## Installation auf dem iPhone

Die veröffentlichte GitHub-Pages-URL in Safari öffnen und **Teilen → Zum Home-Bildschirm** wählen. Das gewählte Profil bleibt immer gerätespezifisch. Ohne eingerichtete Synchronisierung bleiben auch Abstimmungen, erledigte Tage und Packlisten auf dem jeweiligen Gerät gespeichert.

## Gemeinsame Synchronisierung

Die App funktioniert zunächst vollständig lokal. Für die gemeinsame Nutzung auf mehreren Handys:

1. Ein kostenloses Supabase-Projekt anlegen und `supabase-setup.sql` einmal im SQL-Editor ausführen.
2. In der App unter **Gemeinsam synchronisieren** die Projekt-URL und den öffentlichen Publishable-/Anon-Key eintragen.
3. Auf allen Handys denselben Familiencode verwenden.

Nur der öffentliche Browser-Key gehört in die App. Niemals einen Secret- oder Service-Role-Key eintragen. Der Familiencode ist ein gemeinsames Merkmal und kein Passwort; deshalb gehören ausschließlich unkritische Reisedaten in die Synchronisierung.
