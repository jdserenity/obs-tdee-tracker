const { Plugin } = require("obsidian");
const { DEFAULT_SETTINGS } = require("./domain/defaults");
const { getCurrentDay } = require("./domain/dates");
const { makeEntry } = require("./domain/entries");
const { TdeeStore } = require("./store/tdee-store");
const { VaultRepository } = require("./infra/vault-repository");
const { SyncCoordinator } = require("./infra/sync-coordinator");
const { TrackerView } = require("./ui/tracker-view");
const { TdeeTrackerSettingTab } = require("./settings");

class TdeeTrackerPlugin extends Plugin {
  async onload() {
    this.store = new TdeeStore();
    this.vault = new VaultRepository(this.app, this.store);
    this.view = new TrackerView(this);
    this.sync = new SyncCoordinator(this);
    this._trackerElements = new Set();
    this._addModeEls = new WeakSet();
    this.lastCheckedDay = this.getCurrentDay();

    await this.loadSettings();
    await this.vault.loadFile();

    this.registerMarkdownCodeBlockProcessor("tdee-tracker", (_source, el) => {
      this.view.render(el);
    });

    this.addSettingTab(new TdeeTrackerSettingTab(this.app, this));

    this.registerInterval(window.setInterval(() => this.checkDayChange(), 60000));

    this.registerEvent(
      this.app.vault.on("modify", (file) => this.sync.onFileModified(file))
    );

    this.app.workspace.onLayoutReady(async () => {
      try {
        if (!this.store.fileLoaded) await this.vault.loadFile();
        await this.refreshAll();
      } catch (e) {
        console.error("tdee-tracker: onLayoutReady failed:", e);
      }
    });
  }

  getCurrentDay() {
    return getCurrentDay(this.store.settings.dayEndTime);
  }

  async loadSettings() {
    const saved = await this.loadData();
    this.store.settings = { ...DEFAULT_SETTINGS, ...(saved?.settings || {}) };
  }

  async saveSettings() {
    await this.saveData({ settings: this.store.settings });
  }

  async checkDayChange() {
    const day = this.getCurrentDay();
    if (day !== this.lastCheckedDay) {
      this.lastCheckedDay = day;
      this.store.rollDayIfNeeded();
      await this.vault.saveFile();
      await this.refreshAll();
    }
  }

  async addStaple(staple) {
    this.store.addEntry(makeEntry({
      kind: "staple",
      refId: staple.id,
      label: staple.name,
      calories: staple.calories
    }));
    await this.vault.saveFile();
    await this.refreshAll();
  }

  async addRegular(regular, count) {
    this.store.addEntry(makeEntry({
      kind: "regular",
      refId: regular.id,
      label: regular.name,
      calories: regular.calories,
      count
    }));
    await this.vault.saveFile();
    await this.refreshAll();
  }

  async addCustom(calories) {
    this.store.addEntry(makeEntry({
      kind: "custom",
      label: "Custom",
      calories
    }));
    await this.vault.saveFile();
    await this.refreshAll();
  }

  setAddMode(el, on) {
    if (on) this._addModeEls.add(el);
    else this._addModeEls.delete(el);
  }

  isAddMode(el) {
    return this._addModeEls.has(el);
  }

  async refreshAll() {
    await this.view.refreshAll();
  }
}

module.exports = TdeeTrackerPlugin;
