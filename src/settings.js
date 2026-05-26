const { PluginSettingTab, Setting, Notice } = require("obsidian");

class TdeeTrackerSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "TDEE Tracker Settings" });

    new Setting(containerEl)
      .setName("Day End Time")
      .setDesc("Before this time (HH:MM, 24h), intake counts toward the previous calendar day.")
      .addText(text => text
        .setPlaceholder("04:00")
        .setValue(this.plugin.store.settings.dayEndTime)
        .onChange(async (value) => {
          if (/^\d{2}:\d{2}$/.test(value)) {
            this.plugin.store.settings.dayEndTime = value;
            await this.plugin.saveSettings();
            this.plugin.store.rollDayIfNeeded();
            await this.plugin.refreshAll();
          }
        }));

    new Setting(containerEl)
      .setName("Vault File Path")
      .setDesc("JSON config + today's log (relative to vault root). Syncs across devices.")
      .addText(text => text
        .setPlaceholder("Archive/tdee-tracker-config.md")
        .setValue(this.plugin.store.settings.filePath)
        .onChange(async (value) => {
          if (value) {
            this.plugin.store.settings.filePath = value;
            await this.plugin.saveSettings();
          }
        }));

    new Setting(containerEl)
      .setName("Refresh UI")
      .setDesc("Reload from the vault file without writing.")
      .addButton(button => button
        .setButtonText("Refresh")
        .onClick(async () => {
          await this.plugin.vault.loadFile();
          await this.plugin.refreshAll();
          new Notice("TDEE tracker refreshed from vault.");
        }));
  }
}

module.exports = { TdeeTrackerSettingTab };
