# Tray Extended – Projektgedächtnis

Stand: 24.10.2026

Tray Extended 0.3.6 ist implementiert, im GitHub-Fork gespeichert und separat im produktiven Vault installiert. Der Benutzer hat die Klicktrennung zunächst im Test-Vault bestätigt und nach der Installation als Tray Extended im normalen Vault erneut die Funktion bestätigt. Neun automatisierte Tests und die JavaScript-Syntaxprüfung waren bei der Umbenennung erfolgreich. Die ursprüngliche Tray-Installation bleibt erhalten. Aktuell kein weiterer Tray-Umbau beauftragt; ein mögliches Sticky-Notes-Teilprojekt wird separat besprochen.

## Ziel und Projektgrenzen

- Einfacher Linksklick auf das Tray-Symbol zeigt Obsidian; sichtbare Fenster werden dabei nicht versteckt.
- Doppellinksklick erzeugt über den Sticky-Notes-Befehl eine neue Sticky Note. Die Einzelklick-Aktion darf dabei nicht zusätzlich ausgeführt werden.
- Rechtsklick behält das bisherige Menü und ergänzt `New Sticky Note`.
- Minimalinvasive, wartbare Erweiterung des Originalplugins. Weitere Funktionen können später folgen.
- Installierte Plugins und produktiven Vault nur nach ausdrücklicher Freigabe verändern. Die separate Installation von Tray Extended und die Übernahme der Einstellungen wurden freigegeben und durchgeführt; weitere Änderungen benötigen einen passenden Auftrag.
- `POS Obsidian` ist der Sammelordner für mögliche weitere Obsidian-Teilprojekte; diese Brain gehört ausdrücklich zum Teilprojekt `obsidian-tray`.

## Quellen und Arbeitskopie

- Eigener GitHub-Fork: [FoegiUpdate/obsidian-tray](https://github.com/FoegiUpdate/obsidian-tray).
- Original: [dragonwocky/obsidian-tray](https://github.com/dragonwocky/obsidian-tray).
- Lokale Arbeitskopie: dieser Ordner unter `010 Projekte/POS Obsidian/obsidian-tray`.
- Lokaler Branch: `sticky-notes-tray`; folgt `origin/main`.
- `origin` zeigt auf den eigenen Fork; `upstream` auf das Original.
- Maßgeblicher Code-Commit: [`674c9985508a9d2511743abd1009712213df6463`](https://github.com/FoegiUpdate/obsidian-tray/commit/674c9985508a9d2511743abd1009712213df6463), Umbenennung und eigenständige Plugin-ID. Spätere Dokumentations-Commits ändern diesen geprüften Code-Stand nicht.
- Frühere Implementierung unter ID `tray`: Commit `76fc9060df753938ceea8bd761b0c11880599b31`. Diese Fassung wurde zuerst im separaten Test-Vault erprobt.
- Basis: Tray 0.3.5, Upstream-Commit `ac353bb5a6e59fea9339befcf1c89fe0d4d97920`.
- Die Brain wird auf ausdrücklichen Benutzerauftrag zusammen mit dem Fork versioniert. Absolute Firmen-/Vault-Pfade sind für die öffentliche Fassung neutralisiert. Die dokumentierten Praxisergebnisse sind frühere Benutzerbestätigungen, keine erneute Prüfung der laufenden Obsidian-Konfiguration.
- Normaler Arbeitsweg: lokal ändern und testen, als Commit speichern, in den eigenen Fork pushen. Bereits hochgeladene Stände lassen sich erneut klonen; ungesicherte lokale Änderungen nicht.

## Entscheidungen

- Repository heißt weiterhin `obsidian-tray`. Sichtbarer Pluginname ist **Tray Extended**, interne Plugin-ID und Installationsordner sind **`tray-extended`**, Version **0.3.6**.
- Die Namen `POS Fork` und `Sticky Notes Fork` wurden zugunsten des allgemeinen Namens verworfen: spätere Erweiterungen sollen keinen neuen Namen erfordern.
- Die frühere Entscheidung für die gleiche Plugin-ID wurde ausdrücklich geändert: Der Benutzer möchte das Original installiert und deaktiviert behalten. Eine eigene ID erlaubt den einfachen Rückwechsel.
- Beide Plugins dürfen getrennt installiert bleiben; immer nur eines aktivieren, da sie dieselben globalen Hotkeys und Fensterfunktionen verwenden. Vorhandene Einstellungen wurden einmalig kopiert. Benutzerdefinierte Obsidian-Hotkeys auf `tray:...` werden nicht automatisch auf `tray-extended:...` umgestellt.
- Es wurde kein eigenes GitHub-Release veröffentlicht. Version 0.3.6 bezeichnet den gespeicherten und manuell installierten Fork-Stand.
- Der Benutzer hat nach der lokalen Erstellung und Aktualisierung ausdrücklich die Übernahme dieser Brain in den öffentlichen GitHub-Fork beauftragt. Lokale Sicherungen und Plugin-Einstellungsdateien werden dabei nicht hochgeladen.

## Technischer Stand und Prüfgrenzen

- Änderungen in [main.js](main.js); kein zusätzlicher Build und keine Paketinstallation nötig, da direkt ladbares CommonJS-JavaScript.
- Zielbefehl: `sticky-notes:create-sticky-note`, im lokal vorhandenen Sticky Notes 1.0.0 von Abdo-reda/NoPoint anhand des Codes geprüft. Tray erstellt Sticky-Dateien nicht selbst und übernimmt keine Sticky-Notes-Implementierung.
- Der Einzelklick wartet auf die gespeicherte Windows-Doppelklickzeit plus 50 ms. Der native Doppelklick verwirft den ausstehenden Einzelklick. Menüöffnung und Tray-Cleanup verwerfen ebenfalls ausstehende Klicks.
- Die Doppelklickzeit wird nur lesend über `reg.exe` aus `HKCU\Control Panel\Mouse\DoubleClickSpeed` abgefragt. Bei nicht lesbarem Wert konservativer Rückfall auf 5,05 Sekunden. Temporäre Änderungen per `SetDoubleClickTime` werden nicht erfasst. Details und Bedienhinweise stehen in der README.
- Command-ID ist in den Tray-Einstellungen anpassbar. `app.commands.executeCommandById` ist eine interne, nicht öffentlich typisierte Obsidian-Schnittstelle; Zugriff gekapselt und mit Fehlerhinweisen versehen.
- Die bestehende Electron-Remote-Abhängigkeit des Originals bleibt erhalten. Kompatibilität zu späteren Obsidian-/Electron-Versionen ist nicht garantiert.
- Neue Doppelklickaktion nur für Windows. macOS behält die bisherige Menüaktivierung; Linux zeigt bei Aktivierung die Fenster.
- [tests/tray.test.cjs](tests/tray.test.cjs): neun automatisierte Tests mit simulierten Obsidian-/Electron-Schnittstellen und Timern erfolgreich, zuletzt bei der Umbenennung auf Tray Extended mit Node.js 24.19.0. Geprüft sind Klicktrennung, langsame Doppelklicks, Menüerhalt, Command-ID, Fehlerfälle und Cleanup.
- Praktischer Nachweis durch Benutzerbestätigung am 24.10.2026 im separaten Test-Vault: Sticky-Notes-Erstellungsbefehl funktioniert; Einzelklick zeigt Obsidian; Doppelklick erstellt genau eine Sticky Note ohne zusätzliches Hauptfenster; Menüeintrag `New Sticky Note` vorhanden.
- Nach separater Installation als Tray Extended im normalen Vault bestätigte der Benutzer ebenfalls „perfekt, funzt“. Das ist ein vom Benutzer berichteter Erfolg, kein durch den Assistenten beobachteter GUI-Test. Rückwechsel, deaktiviertes Sticky Notes und alle übrigen Menüaktionen sind praktisch nicht gesondert bestätigt.

## Produktive Installation und Rückweg

- Vault: der produktive lokale Obsidian-Vault; im Folgenden `<Vault>`.
- Fork: `<Vault>/.obsidian/plugins/tray-extended`; Original: `<Vault>/.obsidian/plugins/tray`.
- Originaldateien blieben unverändert; `data.json` wurde in den neuen Pluginordner kopiert und auf Dateigleichheit geprüft. Auch die installierten Dateien `main.js` und `manifest.json` wurden mit dem Entwicklungsstand verglichen.
- Original lokal gesichert unter `../work/tray-original-20261024-134017` mit `main.js`, `manifest.json` und `data.json` (relativ zur Arbeitskopie; nicht im GitHub-Repository enthalten). Diese lokalen Sicherungen nicht in den öffentlichen Fork übernehmen.
- Beim Ablegen war `tray` laut gespeicherter Pluginliste bereits deaktiviert. Die Aktivierung des Forks erfolgte anschließend durch den Benutzer; die Pluginliste wurde vom Assistenten nicht verändert.
- Rückweg: zuerst Tray Extended deaktivieren, anschließend Original Tray aktivieren. Keine Dateien ersetzen und nicht beide zugleich aktivieren.
- Der alte Fork unter ID `tray` im Test-Vault ist eine Testfassung, kein unverändertes Original. Bei weiteren Tests auf die tatsächlich installierte ID achten.

## Offene Punkte und nächster Einstieg

- Aktuell kein weiterer Implementierungsauftrag für Tray. Bei einem späteren Sticky-Notes-Fork mit eigener ID gegebenenfalls `Sticky note command` auf dessen vollständige Command-ID ändern; derzeit weiterhin `sticky-notes:create-sticky-note`.
- Wünsche zu Dateinamen, großem Innentitel und kompakter Sticky-Darstellung gehören zum separaten Sticky-Notes-Teilvorhaben. Simple Sticky Notes von rephila ist eine interessante Gestaltungsvorlage; Grundlage und Umfang sind noch nicht entschieden. Keine solche Änderung wurde bisher in Tray oder Sticky Notes umgesetzt.
- Rückwechsel und Fehlerhinweis bei deaktiviertem Sticky Notes sind bei Bedarf noch praktisch zu prüfen; kein aktueller Ausführungsauftrag.
- Ein GitHub-Release kann bei Bedarf erstellt werden; bisher nicht beauftragt.

## Detailanleitung

[README.md](README.md) führt Installation, Rückweg, Voraussetzungen, API-Quellen und Entwicklungsprüfungen. Diese Angaben dort nachschlagen statt hier doppelt pflegen. Die README beschreibt den umbenannten Stand; ihr dort noch offener Praxistest wurde inzwischen vom Benutzer als erfolgreich bestätigt. Frühe ZIP-Pakete im ursprünglichen Codex-Chat enthalten noch die alte ID `tray`; für neue Installationen den aktuellen Quellstand mit ID `tray-extended` verwenden.
