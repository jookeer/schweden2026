# Schweden 2026

Installierbarer Offline-Reisebegleiter für den Familienurlaub in Småland vom 14. bis 28. August 2026.

## Funktionen

- persönliche Profile für Annika, Julian, Anna Lena und Familie
- wetter- und stimmungsabhängige Tagesvorschläge
- Reiseplan mit Karten- und Navigationslinks
- dauerhaft sichtbare Navigation zu beiden Ferienhäusern
- lokal gespeicherte Packlisten und erledigte Reisetage
- Offline-Nutzung als Progressive Web App

## Lokal starten

Die App muss über einen lokalen Webserver geöffnet werden, damit Manifest und Service Worker funktionieren. Zum Beispiel:

```powershell
python -m http.server 8000
```

Danach `http://localhost:8000` im Browser öffnen.

## Installation auf dem iPhone

Die veröffentlichte GitHub-Pages-URL in Safari öffnen und **Teilen → Zum Home-Bildschirm** wählen. Profil, erledigte Tage und Packlisten werden nur auf dem jeweiligen Gerät gespeichert.
