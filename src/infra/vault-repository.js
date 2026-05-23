const { hashStr } = require("./hash");

class VaultRepository {
  constructor(app, store) {
    this.app = app;
    this.store = store;
    this._lastWriteHash = null;
  }

  filePath() {
    return this.store.settings.filePath || "Archive/tdee-tracker.md";
  }

  async fileExists() {
    return this.app.vault.adapter.exists(this.filePath());
  }

  async readFile() {
    const content = await this.app.vault.adapter.read(this.filePath());
    return { content, parsed: JSON.parse(content) };
  }

  async loadFile() {
    const exists = await this.fileExists();
    if (!exists) return false;
    try {
      const { parsed } = await this.readFile();
      this.store.applyPayload(parsed);
      return true;
    } catch (e) {
      console.error("tdee-tracker: failed to load vault file:", e);
      this.store.setLoadError(e.message);
      return false;
    }
  }

  async saveFile() {
    if (!this.store.fileLoaded) return;
    const path = this.filePath();
    try {
      if (await this.app.vault.adapter.exists(path)) {
        const raw = await this.app.vault.adapter.read(path);
        this.store.mergeForSave(JSON.parse(raw));
      }
    } catch (e) {
      console.warn("tdee-tracker: merge-on-save failed, writing current data:", e);
    }
    const jsonStr = JSON.stringify(this.store.snapshot(), null, 2);
    this._lastWriteHash = hashStr(jsonStr);
    await this.app.vault.adapter.write(path, jsonStr);
  }

  lastWriteHash() { return this._lastWriteHash; }
  hashContent(content) { return hashStr(content); }

  async incomingSync(content) {
    this.store.mergeIncoming(JSON.parse(content));
  }
}

module.exports = { VaultRepository };
