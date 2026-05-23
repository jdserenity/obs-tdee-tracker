function isMealDef(item) {
  return item && typeof item === "object" && typeof item.id === "string" && typeof item.name === "string" && typeof item.calories === "number";
}

function isEntryKind(kind) {
  return kind === "staple" || kind === "regular" || kind === "custom";
}

const { normalizeIngredients } = require("./ingredients");

function normalizeMealDef(item) {
  const meal = { id: item.id, name: item.name, calories: Math.max(0, Math.round(item.calories)) };
  const ingredients = normalizeIngredients(item.ingredients);
  if (ingredients.length) meal.ingredients = ingredients;
  return meal;
}

function isLogEntry(item) {
  return item && typeof item === "object" && typeof item.id === "string" && typeof item.calories === "number";
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

function normalizeStoredEntry(item) {
  if (!item || typeof item !== "object" || typeof item.id !== "string") return null;
  if (item.deleted) {
    return {
      id: item.id,
      deleted: true,
      updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date(0).toISOString()
    };
  }
  if (!isLogEntry(item)) return null;
  return normalizeEntry(item);
}

function normalizeFile(raw) {
  const data = raw && typeof raw === "object" ? raw : {};
  return {
    tdee: typeof data.tdee === "number" && data.tdee >= 0 ? data.tdee : 0,
    staples: Array.isArray(data.staples) ? data.staples.filter(isMealDef).map(normalizeMealDef) : [],
    regulars: Array.isArray(data.regulars) ? data.regulars.filter(isMealDef).map(normalizeMealDef) : [],
    day: typeof data.day === "string" ? data.day : "",
    entries: Array.isArray(data.entries) ? data.entries.map(normalizeStoredEntry).filter(Boolean) : []
  };
}

module.exports = { normalizeFile, normalizeMealDef, normalizeEntry, isMealDef, isLogEntry };
