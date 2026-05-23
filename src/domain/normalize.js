function isMealDef(item) {
  return item && typeof item === "object" && typeof item.id === "string" && typeof item.name === "string" && typeof item.calories === "number";
}

function isEntryKind(kind) {
  return kind === "staple" || kind === "regular" || kind === "custom";
}

function normalizeMealDef(item) {
  return { id: item.id, name: item.name, calories: Math.max(0, Math.round(item.calories)) };
}

function normalizeEntry(item) {
  const count = typeof item.count === "number" && item.count > 0 ? Math.round(item.count) : 1;
  const kind = isEntryKind(item.kind) ? item.kind : "custom";
  return {
    id: item.id,
    kind,
    refId: typeof item.refId === "string" ? item.refId : null,
    label: typeof item.label === "string" ? item.label : "Custom",
    calories: Math.max(0, Math.round(item.calories)),
    count,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date(0).toISOString()
  };
}

function normalizeFile(raw) {
  const data = raw && typeof raw === "object" ? raw : {};
  return {
    tdee: typeof data.tdee === "number" && data.tdee >= 0 ? data.tdee : 0,
    staples: Array.isArray(data.staples) ? data.staples.filter(isMealDef).map(normalizeMealDef) : [],
    regulars: Array.isArray(data.regulars) ? data.regulars.filter(isMealDef).map(normalizeMealDef) : [],
    day: typeof data.day === "string" ? data.day : "",
    entries: Array.isArray(data.entries) ? data.entries.filter(isEntry).map(normalizeEntry) : []
  };
}

function isEntry(item) {
  return item && typeof item === "object" && typeof item.id === "string" && typeof item.calories === "number";
}

module.exports = { normalizeFile, normalizeMealDef, normalizeEntry, isMealDef, isEntry };
