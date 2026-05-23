function newEntryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeEntry({ kind, refId, label, calories, count = 1 }) {
  return {
    id: newEntryId(),
    kind,
    refId: refId || null,
    label,
    calories: Math.max(0, Math.round(calories)),
    count: Math.max(1, Math.round(count)),
    updatedAt: new Date().toISOString()
  };
}

function makeTombstone(id) {
  return { id, deleted: true, updatedAt: new Date().toISOString() };
}

function isActiveEntry(entry) {
  return entry && !entry.deleted && typeof entry.calories === "number";
}

function activeEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.filter(isActiveEntry);
}

function isStapleLogged(entries, stapleId) {
  return activeEntries(entries).some(e => e.kind === "staple" && e.refId === stapleId);
}

function ensureCurrentDay(state, currentDay) {
  if (state.day !== currentDay) {
    state.day = currentDay;
    state.entries = [];
  }
}

module.exports = {
  newEntryId,
  makeEntry,
  makeTombstone,
  isActiveEntry,
  activeEntries,
  isStapleLogged,
  ensureCurrentDay
};
