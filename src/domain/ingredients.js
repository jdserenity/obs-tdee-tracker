function normalizeIngredients(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter(i => i && typeof i.name === "string" && typeof i.calories === "number")
      .map(i => ({ name: i.name, calories: Math.max(0, Math.round(i.calories)) }));
  }
  if (typeof raw === "object") {
    return Object.entries(raw)
      .filter(([, v]) => typeof v === "number")
      .map(([name, calories]) => ({ name, calories: Math.max(0, Math.round(calories)) }));
  }
  return [];
}

function formatIngredientsList(ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) return "";
  return ingredients.map(i => `${i.name}: ${i.calories}`).join(", ");
}

module.exports = { normalizeIngredients, formatIngredientsList };
