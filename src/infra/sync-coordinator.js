class SyncCoordinator {
  constructor(plugin) {
    this.plugin = plugin;
    this._reloadTimeout = null;
  }

  onFileModified(file) {
    const path = this.plugin.vault.filePath();
    if (file.path !== path) return;
    if (this._reloadTimeout) clearTimeout(this._reloadTimeout);
    this._reloadTimeout = setTimeout(async () => {
      try {
        const content = await this.plugin.app.vault.adapter.read(path);
        const readHash = this.plugin.vault.hashContent(content);
        if (readHash === this.plugin.vault.lastWriteHash()) return;
        await this.plugin.vault.incomingSync(content);
        await this.plugin.view.refreshAll();
      } catch (e) {
        console.error("tdee-tracker: onFileModified failed:", e);
      }
    }, 500);
  }
}

module.exports = { SyncCoordinator };
