## Tray – Erweiterungen dieses Forks

Basis: [dragonwocky/obsidian-tray](https://github.com/dragonwocky/obsidian-tray),
Commit `ac353bb5a6e59fea9339befcf1c89fe0d4d97920` (Tray 0.3.5).
Fork: [FoegiUpdate/obsidian-tray](https://github.com/FoegiUpdate/obsidian-tray). Repository und Plugin heißen weiterhin `obsidian-tray` bzw. `Tray`.
Plugin-ID und Manifest-Version bleiben für die Kompatibilität zu vorhandenen Tray-Einstellungen unverändert.
Der Fork ist am Kommentar im Kopf von `main.js` und an dieser README erkennbar.

### Bedienung unter Windows

- Einfacher Linksklick zeigt die Vault-Fenster. Ein bereits sichtbares Fenster wird dabei nicht versteckt.
- Doppellinksklick führt den Obsidian-Befehl `sticky-notes:create-sticky-note` aus.
  Dabei wird die ausstehende Einzelklick-Aktion verworfen; die Hauptfenster werden nicht zusätzlich eingeblendet.
- Rechtsklick öffnet das bisherige Menü, ergänzt um **New Sticky Note**.
- Der vorhandene Quick-Note-Befehl, globale Hotkeys und die übrigen Menüaktionen bleiben erhalten.
- Unter Tray-Einstellungen kann **Sticky note command** auf eine andere vollständige Command-ID gesetzt werden.
  Ein leerer Wert verwendet wieder den Standardbefehl. Es wird kein Plugin automatisch installiert.

Der Einzelklick wartet auf die Windows-Doppelklickzeit plus 50 ms (bei 500 ms Einstellung also 550 ms).
Die Registry-Einstellung `HKCU\Control Panel\Mouse\DoubleClickSpeed` wird beim Erstellen des Symbols
mit einer verborgenen, zeitlich begrenzten `reg.exe`-Abfrage nur gelesen.
Nach Änderungen der Maus-Doppelklickzeit Tray deaktivieren und wieder aktivieren.
Kann die Einstellung nicht gelesen werden, wartet der Einzelklick vorsichtshalber 5,05 Sekunden
und es erscheint eine Warnung in der Entwicklerkonsole. Es werden keine Maus-/Registry-Einstellungen verändert.
Die Registry ist die gespeicherte Einstellung; temporäre Änderungen durch andere Programme über
`SetDoubleClickTime` werden darüber nicht erfasst.

### Voraussetzungen und Grenzen

- Windows Desktop mit Obsidian und aktiviertem Sticky Notes von Abdo-reda/NoPoint.
  Der Befehl wurde im lokal vorhandenen Sticky Notes 1.0.0 geprüft.
- Zuerst in Obsidian per Befehlspalette **Sticky Notes: Create sticky note** testen.
  Zielordner und Notizverhalten werden vollständig vom Sticky-Notes-Plugin bestimmt.
- `app.commands.executeCommandById` ist eine interne Obsidian-Schnittstelle und fehlt in der öffentlichen
  TypeScript-API. Der Zugriff ist im Fork an einer Stelle gekapselt und prüft Verfügbarkeit/Rückgabewert.
  Ein fehlender oder deaktivierter Befehl erzeugt einen Hinweis, keinen Ersatz durch eine normale Quick Note.
  Wenn das Zielplugin eigene Fehler intern verschluckt, kann Tray den tatsächlichen Notizerfolg nicht prüfen.
- Die vorhandene Electron-Remote-Anbindung des Originals bleibt bestehen. Kompatibilität zu künftigen
  Obsidian-/Electron-Versionen ist damit nicht garantiert.
- macOS behält beim Linksklick die ursprüngliche Menüaktion; Linux zeigt beim Aktivierungsereignis die Fenster.
  Die neue Doppelklickaktion ist auf Windows begrenzt.

### Installation zuerst in einem separaten Test-Vault

1. Einen separaten Test-Vault verwenden und dort Sticky Notes installieren/aktivieren.
2. Falls Tray dort bereits installiert ist: Tray deaktivieren und dessen kompletten Pluginordner sichern,
   insbesondere `data.json`. Nicht Original und Fork parallel aktivieren: beide haben die ID `tray`.
3. Das Installations-ZIP entpacken. Den enthaltenen Ordner `tray` nach
   `<Test-Vault>/.obsidian/plugins/tray` kopieren. Enthalten sind `main.js`, `manifest.json`, Bilder,
   Lizenz und diese README. Vorhandene `data.json` nicht löschen oder überschreiben.
4. Obsidian neu laden und Tray aktivieren. **Create tray icon** muss eingeschaltet sein.
5. Einzelklick bei verstecktem und sichtbarem Vault prüfen; Doppelklick muss genau eine Sticky Note erzeugen,
   ohne die Einzelklick-Aktion auszulösen. Auch nahe der eingestellten Doppelklickzeit testen.
6. Rechtsklick: **New Sticky Note** und die bisherigen Menüaktionen prüfen.
   Sticky Notes vorübergehend deaktivieren: Die neue Aktion muss dann einen Hinweis zeigen.
7. Rückweg: Tray deaktivieren, gesicherten Originalordner wiederherstellen, Obsidian neu laden.

Eine spätere Übernahme in den produktiven Vault ist ein eigener Installationsschritt.
Die Installation erfolgt ausschließlich manuell; die Entwicklungskopie verändert keine bestehenden Vaults.

### Entwicklung und Prüfung

Kein Build und keine Paketinstallation erforderlich: `main.js` ist direkt ladbares CommonJS-JavaScript.
Automatisierte Prüfungen (Node.js 24.19.0 verwendet):

```sh
node --check main.js
node --test tests/tray.test.cjs
git diff --check
```

Neun Tests prüfen die Klick-/Doppelklickfolgen mit simulierten Timern, Menüerhalt und Command-Aufruf,
Fehlerfälle, langsame Doppelklicks, Cleanup und die Plattformabgrenzung.
Electron, Obsidian und die Command-Ausführung werden dabei simuliert. Ein echter GUI-/Integrationstest
mit diesem Fork in Obsidian wurde noch nicht durchgeführt; eine erfolgreich erzeugte Sticky Note ist
deshalb noch nicht nachgewiesen. Tests sind Entwicklungsdateien und werden nicht zur Installation benötigt.

Quellen zur Anbindung:

- [Öffentliche Obsidian-API und addCommand-Präfix](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)
- [Sticky-Notes-Originalprojekt](https://github.com/Abdo-reda/obsidian-sticky-notes-plugin)
- [Electron Tray-Ereignisse](https://www.electronjs.org/docs/latest/api/tray)
- [Electron Windows: einzelne und doppelte Maustastendrücke](https://github.com/electron/electron/blob/v37.0.0/shell/browser/ui/win/notify_icon_host.cc)
- [Windows-Doppelklickzeit und Obergrenze](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setdoubleclicktime)

---

<img alt="" src="tray.png" align="right"  height="128px">

**Tray** is an [Obsidian](https://obsidian.md/) plugin that can be used to launch the app
on system startup and run it in the background, adding global hotkeys and a tray menu to
toggle window visibility and create quick notes from anywhere in your operating system.

## Configuration

### Window management

| Option                     | Description                                                                                                                                                                                                                       | Default                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ------------------------------ |
| Launch on startup          | Open Obsidian automatically whenever you log into your computer.                                                                                                                                                                  | Disabled                       |
| Hide on launch             | Minimises Obsidian automatically whenever the app is launched. If the "Run in background" option is enabled, windows will be hidden to the system tray/menubar instead of minimised to the taskbar/dock.                          | Disabled                       |
| Run in background          | Hide the app and continue to run it in the background instead of quitting it when pressing the window close button or toggle focus hotkey.                                                                                        | Disabled                       |
| Hide taskbar icon          | Hides the window's icon from from the dock/taskbar. This may not work on Linux-based OSes.                                                                                                                                        | Disabled                       |
| Create tray icon           | Add an icon to your system tray/menubar to bring hidden Obsidian windows back into focus on click or force a full quit/relaunch of the app through the right-click menu.                                                          | Enabled                        |
| Tray icon image            | Set the image used by the tray/menubar icon. Recommended size: 16x16                                                                                                                                                              | ![](obsidian.png)              |
| Tray icon tooltip          | Set a title to identify the tray/menubar icon by. The `{{vault}}` placeholder will be replaced by the vault name.                                                                                                                 | `{{vault}} \| Obsidian`        |
| Toggle window focus hotkey | This hotkey is registered globally and will be detected even if Obsidian does not have keyboard focus. Format: [Electron accelerator](https://www.electronjs.org/docs/latest/tutorial/keyboard-shortcuts#accelerators)            | <kbd>CmdOrCtrl+Shift+Tab</kbd> |

The `Relaunch Obsidian` and `Close Vault` actions can be triggered from the tray/menubar context menu,
or with the in-app command palette (search for "Tray: Relaunch Obsidian" or "Tray: Close Vault").
Hotkeys can be assigned to the commands via Obsidian's built-in hotkey manager.

### Quick notes

| Option                 | Description                                                                                                                                                                                                            | Default                      |
| ---------------------- | -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ---------------------------- |
| Quick note location    | New quick notes will be placed in this folder.                                                                                                                                                                         |                              |
| Quick note date format | New quick notes will use a filename of this pattern. Format: [Moment.js format string](https://momentjs.com/docs/#/displaying/format/)                                                                                 | `YYYY-MM-DD`                 |
| Quick note hotkey      | This hotkey is registered globally and will be detected even if Obsidian does not have keyboard focus. Format: [Electron accelerator](https://www.electronjs.org/docs/latest/tutorial/keyboard-shortcuts#accelerators) | <kbd>CmdOrCtrl+Shift+Q</kbd> |

## Installation

### Obsidian Marketplace

1. In Obsidian, navigate to **Settings** → **Community plugins**.
2. Press the **Browse** button beside the **Community plugins** option.
3. Search for `Tray` in the **Filter** text input.
4. Select `Tray` and press **Install**.
5. Once the plugin has finished installing, press **Enable**.
6. Press the **Options** button.
7. Configure the plugin as you wish.
8. You're done! 🎉

### Manual

1. Download this repository.
2. Copy it into your vault's `.obsidian/plugins` directory.
3. In Obsidian, navigate to **Settings** → **Community plugins**.
4. Press **Turn on community plugins** if you haven't already.
5. Find `Tray` in the list of **Installed plugins** and toggle it on.
6. Press the **⚙️** button beside the toggle you just used.
7. Configure the plugin as you wish.
8. You're done! 🎉

## Disclaimer

This plugin is provided as-is and is designed for personal use. It has not
been tested on every platform and may not work as expected with all future updates.
If you notice something is not working as intended, please open a bug report or
pull request so it can be fixed.

The Obsidian logo is distributed with this plugin as the default image for the system
tray/menubar icon, intended to be used within Obsidian. This logo remains the property
of the Obsidian project and is not under the same license as the plugin's source code.
