const { DEFAULT_SETTINGS, DEFAULT_FILE } = require("../domain/defaults");
const { normalizeFile } = require("../domain/normalize");
const { mergeForSave, mergeIncoming } = require("../domain/merge");
const { ensureCurrentDay } = require("../domain/entries");

class TdeeStore {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.file = normalizeFile(DEFAULT_FILE);
    this.fileLoaded = false;
  }

  getCurrentDay() {
    const { getCurrentDay } = require("../domain/dates");
    return getCurrentDay(this.settings.dayEndTime);
  }

  rollDayIfNeeded() {
    ensureCurrentDay(this.file, this.getCurrentDay());
  }

  applyPayload(parsed) {
    this.file = normalizeFile(parsed);
    this.rollDayIfNeeded();
    this.fileLoaded = true;
  }

  mergeForSave(disk) {
    this.rollDayIfNeeded();
    this.file = mergeForSave(this.file, disk, this.getCurrentDay());
  }

  mergeIncoming(disk) {
    this.rollDayIfNeeded();
    mergeIncoming(this.file, disk, this.getCurrentDay());
  }

  snapshot() {
    this.rollDayIfNeeded();
    return normalizeFile(this.file);
  }

  addEntry(entry) {
    this.rollDayIfNeeded();
    this.file.entries.push(entry);
  }

  removeEntry(id) {
    this.rollDayIfNeeded();
    const { makeTombstone } = require("../domain/entries");
    const idx = this.file.entries.findIndex(e => e.id === id);
    if (idx < 0) return;
    this.file.entries[idx] = makeTombstone(id);
  }
}

module.exports = { TdeeStore };
