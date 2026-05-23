const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeIngredients, formatIngredientsList } = require("../src/domain/ingredients");
const { normalizeMealDef } = require("../src/domain/normalize");

test("normalizeIngredients accepts object map", () => {
  const items = normalizeIngredients({ Granola: 150, Yogurt: 250 });
  assert.deepEqual(items, [{ name: "Granola", calories: 150 }, { name: "Yogurt", calories: 250 }]);
});

test("formatIngredientsList renders name: calories pairs", () => {
  const text = formatIngredientsList([{ name: "Granola", calories: 150 }, { name: "Yogurt", calories: 250 }]);
  assert.equal(text, "Granola: 150, Yogurt: 250");
});

test("normalizeMealDef keeps optional ingredients", () => {
  const meal = normalizeMealDef({
    id: "yogurt",
    name: "Yogurt w/ Granola",
    calories: 400,
    ingredients: { Granola: 150, Yogurt: 250 }
  });
  assert.equal(meal.ingredients.length, 2);
});
