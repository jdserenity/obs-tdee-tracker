const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

// --- minimal obsidian stub (patched before plugin.js is first required) ---

global.window = { setInterval: (fn, ms) => { const id = setInterval(fn, ms); if (id?.unref) id.unref(); return id; } };

const noticeMessages = [];
class FakeNotice { constructor(msg) { noticeMessages.push(msg); } }
class FakePluginSettingTab { constructor(app, plugin) { this.app = app; this.plugin = plugin; this.containerEl = { empty() {}, createEl() {} }; } }
const FakeSetting = class {
  setName() { return this; }
  setDesc() { return this; }
  addText() { return this; }
  addButton(cb) { cb({ setButtonText() { return this; }, onClick() { return this; } }); return this; }
};

const obsidianMock = {
  Plugin: class Plugin {
    constructor(app, manifest) { this.app = app; this.manifest = manifest; }
    addCommand() {}
    addSettingTab() {}
    registerMarkdownCodeBlockProcessor() {}
    registerInterval(id) { return id; }
    registerEvent(e) { return e; }
    async loadData() { return null; }
    async saveData() {}
  },
  PluginSettingTab: FakePluginSettingTab,
  Setting: FakeSetting,
  Notice: FakeNotice
};

const origLoad = Module._load;
Module._load = (req, parent, isMain) => req === "obsidian" ? obsidianMock : origLoad(req, parent, isMain);
const TdeeTrackerPlugin = require("../src/plugin");
Module._load = origLoad;

// --- helpers ---

function makePlugin() {
  const fakeApp = {
    vault: {
      adapter: { exists: async () => false },
      on: () => ({})
    },
    workspace: { onLayoutReady: () => {} }
  };
  const plugin = new TdeeTrackerPlugin(fakeApp, { id: "tdee-tracker" });
  const capturedCommands = [];
  plugin.addCommand = (cmd) => { capturedCommands.push(cmd); };
  plugin.addSettingTab = () => {};
  plugin.registerMarkdownCodeBlockProcessor = () => {};
  plugin.registerInterval = () => {};
  plugin.registerEvent = () => {};
  plugin.loadData = async () => null;
  return { plugin, capturedCommands };
}

// --- tests ---

test("refresh-ui command is registered during onload", async () => {
  const { plugin, capturedCommands } = makePlugin();
  await plugin.onload();
  const cmd = capturedCommands.find(c => c.id === "refresh-ui");
  assert.ok(cmd, "refresh-ui command must be registered");
  assert.equal(cmd.name, "Refresh UI");
});

test("refresh-ui command calls vault.loadFile then refreshAll", async () => {
  const { plugin, capturedCommands } = makePlugin();
  await plugin.onload();
  const cmd = capturedCommands.find(c => c.id === "refresh-ui");

  let loadFileCalled = false;
  let refreshAllCalled = false;
  plugin.vault.loadFile = async () => { loadFileCalled = true; };
  plugin.refreshAll = async () => { refreshAllCalled = true; };

  await cmd.callback();

  assert.ok(loadFileCalled, "vault.loadFile must be called");
  assert.ok(refreshAllCalled, "refreshAll must be called");
});

test("refresh-ui command shows a Notice after refresh", async () => {
  const { plugin, capturedCommands } = makePlugin();
  await plugin.onload();
  const cmd = capturedCommands.find(c => c.id === "refresh-ui");

  plugin.vault.loadFile = async () => {};
  plugin.refreshAll = async () => {};
  noticeMessages.length = 0;

  await cmd.callback();

  assert.ok(noticeMessages.length > 0, "Notice must be shown");
});
