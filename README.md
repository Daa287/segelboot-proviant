# ⚓ Segelboot Proviant App v5.3

Eine maritime Proviant- und Inventar-App für Segelboote.  
Läuft komplett im Browser — kein Server, keine Installation nötig.

## 🚀 Features

| Feature | Beschreibung |
|---|---|
| 📦 Inventar | Artikel mit Foto, Barcode-Scanner, Quick-Add |
| 🛒 Einkaufsliste | Automatisch bei Mindestbestand, QR-Code für Crew |
| 🍽️ Mahlzeiten | Rezepte planen, Zutaten prüfen, „Jetzt kochen" |
| 🗂️ Stauraum | Kühlbox, Bilge, Cockpit, Salon, Backbord, Steuerbord |
| 📊 Statistik | Gewicht, Kosten, Verbrauch, Fischfang-Log |
| 🗓️ Planung | Reisetage/Personen, Bedarfsberechnung |
| 🆘 Notfall-Reserve | Havarie +3 Tage automatisch berechnen |
| 🎣 Fischfang | Fisch loggen → automatisch ins Inventar |
| 💰 Kosten | Preis pro Artikel, Hafen-Kaufort, Gesamtbudget |
| 🖨️ PDF | Druckbare Packliste mit Stauraum & Preisen |
| 🌙 Design | Dark / Light Mode |
| 🌍 Sprachen | Deutsch / English / Español |
| 💾 Backup | Export/Import (JSON, CSV, TXT) |

## 📱 Installation auf dem Handy

### Android (Chrome)
1. `index.html` auf GitHub Pages öffnen
2. Menü (⋮) → **„Zum Startbildschirm hinzufügen"**
3. Fertig — App-Icon auf dem Homescreen!

### iPhone (Safari)
1. `index.html` in Safari öffnen
2. Teilen-Button → **„Zum Home-Bildschirm"**
3. Fertig!

## 🌐 GitHub Pages aktivieren

1. Repository → **Settings** → **Pages**
2. Branch: `main` → Ordner: `/ (root)` → **Save**
3. Nach ~2 Minuten erreichbar unter:  
   `https://DEINNAME.github.io/segelboot-proviant`

## 💾 Datenspeicherung

Alle Daten werden lokal im Browser gespeichert (localStorage).  
Kein Internet nach dem ersten Laden erforderlich.  
**Tipp:** Regelmässig JSON-Backup exportieren!

## 📁 Dateien

| Datei | Beschreibung |
|---|---|
| `index.html` | Die komplette App (alles in einer Datei) |
| `manifest.json` | PWA-Konfiguration für App-Installation |
| `README.md` | Diese Dokumentation |
| `segelboot-proviant.jsx` | Quellcode (React JSX) |

## 🔧 Changelog

| Version | Änderungen |
|---|---|
| v5.3 | Bugfixes: Backup/Restore, Foto-Komprimierung, Barcode-Felder |
| v5.2 | Neue Navigation mit „Mehr"-Drawer |
| v5.1 | Stauraum-Tab |
| v5.0 | Notfall-Reserve, Fischfang, Kosten, Stauraum, PDF, Duplizieren |
| v4.x | Mahlzeiten, Verbrauch, Dark/Light, i18n, Statistik, QR-Code |
| v3.x | Reiseplanung, Gewicht, Ablaufdaten, Mindestbestand |
| v2.x | Barcode-Scanner, Quick-Add |
| v1.x | Grundgerüst, Export |

---
*Allzeit guten Wind! ⛵*
