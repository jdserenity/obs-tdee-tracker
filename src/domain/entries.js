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

function ensureCurrentDay(state, currentDay) {
  if (state.day !== currentDay) {
    state.day = currentDay;
    state.entries = [];
  }
}

module.exports = { newEntryId, makeEntry, ensureCurrentDay };
