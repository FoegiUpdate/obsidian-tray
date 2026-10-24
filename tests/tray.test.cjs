const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { EventEmitter } = require("node:events");
const path = require("node:path");

async function loadPlugin({ platform = "win32", speed = 500, saved = {}, execute = () => true, commandsMissing = false } = {}) {
  let now = 0, nextTimer = 0;
  const timers = new Map(), icons = [], notices = [], calls = [];
  const win = new EventEmitter();
  Object.assign(win, {
    webContents: new EventEmitter(),
    show: () => calls.push("show"), hide: () => calls.push("hide"),
    minimize: () => calls.push("minimize"), blur() {}, focus() {},
    isFocused: () => true, isVisible: () => true, isMaximized: () => false,
    setSkipTaskbar() {},
  });
  class Tray extends EventEmitter {
    constructor() { super(); icons.push(this); }
    setContextMenu(menu) { this.menu = menu; }
    setToolTip() {}
    popUpContextMenu() { calls.push("menu"); }
    destroy() { this.destroyed = true; this.removeAllListeners(); }
  }
  class Plugin {
    constructor() {
      this.app = {
        commands: commandsMissing ? undefined : {
          executeCommandById(id) { calls.push(id); return execute(id); },
        },
        vault: { getName: () => "test" },
      };
    }
    async loadData() { return saved; }
    addSettingTab(tab) { this.tab = tab; }
    addCommand() {}
  }
  const remote = {
    Tray,
    Menu: { buildFromTemplate(items) {
      const menu = new EventEmitter(); menu.items = items; return menu;
    } },
    nativeImage: { createFromDataURL() {} }, BrowserWindow: {},
    getCurrentWindow: () => win,
    globalShortcut: { register() {}, unregister() {} },
    app: { setLoginItemSettings() {}, dock: { show() {}, hide() {} } },
  };
  const sandbox = {
    module: { exports: {} }, process: { platform },
    console: { log() {}, warn() {}, error() {} },
    window: { removeEventListener() {} },
    setTimeout(callback, delay) { timers.set(++nextTimer, { callback, due: now + delay }); return nextTimer; },
    clearTimeout(id) { timers.delete(id); },
    require(name) {
      if (name === "obsidian") return {
        Plugin, PluginSettingTab: class {}, Notice: class { constructor(message) { notices.push(message); } },
      };
      if (name === "electron") return { remote };
      if (name === "child_process") return {
        execFileSync(file, args, options) {
          assert.equal(file, "reg.exe");
          assert.equal(options.windowsHide, true);
          if (speed instanceof Error) throw speed;
          return `DoubleClickSpeed    REG_SZ    ${speed}`;
        },
      };
      throw Error(`Unexpected import: ${name}`);
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../main.js"), "utf8"), sandbox);
  const plugin = new sandbox.module.exports();
  await plugin.onload();
  function advance(ms) {
    now += ms;
    for (const [id, timer] of timers) {
      if (timer.due <= now) { timers.delete(id); timer.callback(); }
    }
  }
  const icon = icons[0];
  return { plugin, icon, calls, notices, advance, timers };
}

test("single click waits for double-click interval and shows a visible vault without hiding it", async () => {
  const h = await loadPlugin();
  h.icon.emit("click"); h.advance(549);
  assert.deepEqual(h.calls, []);
  h.advance(1);
  assert.deepEqual(h.calls, ["show"]);
});

test("Windows click then native double-click invokes only Sticky Notes, including slow double clicks", async () => {
  for (const speed of [500, 900, 5000]) {
    const h = await loadPlugin({ speed });
    h.icon.emit("click"); h.advance(speed - 1);
    h.icon.emit("double-click"); h.advance(10000);
    assert.deepEqual(h.calls, ["sticky-notes:create-sticky-note"]);
  }
});

test("successive independent single clicks each show the vault", async () => {
  const h = await loadPlugin();
  h.icon.emit("click"); h.advance(600);
  h.icon.emit("click"); h.advance(600);
  assert.deepEqual(h.calls, ["show", "show"]);
});

test("right-click menu preserves upstream items and dispatches New Sticky Note", async () => {
  const h = await loadPlugin();
  assert.deepEqual(Array.from(h.icon.menu.items, item => item.label ?? item.type), [
    "New Sticky Note", "Quick Note", "Show Vault", "Hide Vault", "separator", "Relaunch Obsidian", "Close Vault",
  ]);
  h.icon.emit("click");
  h.icon.menu.emit("menu-will-show"); h.advance(1000);
  assert.deepEqual(h.calls, []);
  await h.icon.menu.items[0].click();
  assert.deepEqual(h.calls, ["sticky-notes:create-sticky-note"]);
  h.icon.menu.items[2].click(); h.icon.menu.items[3].click();
  assert.deepEqual(h.calls.slice(1), ["show", "minimize"]);
});

test("unloading and icon recreation cancel queued clicks", async () => {
  const h = await loadPlugin();
  h.icon.emit("click"); h.plugin.onunload(); h.advance(1000);
  assert.equal(h.icon.destroyed, true);
  assert.deepEqual(h.calls, []);
  const r = await loadPlugin();
  r.icon.emit("click");
  // The same callback is used by icon/image/tooltip settings updates.
  await r.plugin.onload(); r.advance(1000);
  assert.equal(r.icon.destroyed, true);
  assert.deepEqual(r.calls, []);
});

test("configured command ID is trimmed, blank uses default", async () => {
  for (const [value, expected] of [[" custom:new ", "custom:new"], [" ", "sticky-notes:create-sticky-note"]]) {
    const h = await loadPlugin({ saved: { stickyNoteCommand: value } });
    await h.icon.menu.items[0].click();
    assert.deepEqual(h.calls, [expected]);
  }
});

test("missing, disabled or failed commands report a notice without showing the vault", async () => {
  for (const options of [
    { execute: () => false }, { commandsMissing: true },
    { execute: () => { throw Error("failed"); } },
    { execute: () => Promise.reject(Error("failed asynchronously")) },
  ]) {
    const h = await loadPlugin(options);
    await h.icon.menu.items[0].click();
    assert.equal(h.notices.length, 1);
    assert.equal(h.calls.includes("show"), false);
  }
});

test("unreadable or invalid Windows setting uses conservative interval", async () => {
  for (const speed of [new Error("registry unavailable"), "invalid", 0, 5001]) {
    const h = await loadPlugin({ speed });
    h.icon.emit("click"); h.advance(5049);
    assert.deepEqual(h.calls, []);
    h.advance(1); assert.deepEqual(h.calls, ["show"]);
  }
});

test("macOS retains menu activation and Linux single activation shows vault", async () => {
  for (const [platform, expected] of [["darwin", "menu"], ["linux", "show"]]) {
    const h = await loadPlugin({ platform });
    h.icon.emit("click");
    assert.deepEqual(h.calls, [expected]);
    assert.equal(h.icon.listenerCount("double-click"), 0);
  }
});
