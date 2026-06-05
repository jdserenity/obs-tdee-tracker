function normalizeIngredient(name, raw) {
  if (typeof raw === "number") {
    return { name, calories: Math.max(0, Math.round(raw)), protein: 0 };
  }
  if (raw && typeof raw === "object" && typeof raw.calories === "number") {
    return {
      name,
      calories: Math.max(0, Math.round(raw.calories)),
      protein: Math.max(0, Math.round(typeof raw.protein === "number" ? raw.protein : 0))
    };
  }
  return null;
}

function normalizeIngredients(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter(i => i && typeof i.name === "string" && typeof i.calories === "number")
      .map(i => ({
        name: i.name,
        calories: Math.max(0, Math.round(i.calories)),
        protein: Math.max(0, Math.round(typeof i.protein === "number" ? i.protein : 0))
      }));
  }
  if (typeof raw === "object") {
    return Object.entries(raw)
      .map(([name, value]) => normalizeIngredient(name, value))
      .filter(Boolean);
  }
  return [];
}

function formatIngredientsList(ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) return "";
  return ingredients.map(i => `${i.name}: ${i.calories} / ${i.protein}g`).join(", ");
}

module.exports = { normalizeIngredients, formatIngredientsList };
