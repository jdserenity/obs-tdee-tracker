const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeIngredients, formatIngredientsList } = require("../src/domain/ingredients");
const { normalizeMealDef } = require("../src/domain/normalize");

test("normalizeIngredients accepts object map of calories", () => {
  const items = normalizeIngredients({ Granola: 150, Yogurt: 250 });
  assert.deepEqual(items, [
    { name: "Granola", calories: 150, protein: 0 },
    { name: "Yogurt", calories: 250, protein: 0 }
  ]);
});

test("normalizeIngredients accepts object map with calories and protein", () => {
  const items = normalizeIngredients({
    Granola: { calories: 150, protein: 4 },
    Yogurt: { calories: 250, protein: 20 }
  });
  assert.deepEqual(items, [
    { name: "Granola", calories: 150, protein: 4 },
    { name: "Yogurt", calories: 250, protein: 20 }
  ]);
});

test("normalizeIngredients defaults missing ingredient protein to 0", () => {
  const items = normalizeIngredients([{ name: "Egg", calories: 70 }]);
  assert.deepEqual(items, [{ name: "Egg", calories: 70, protein: 0 }]);
});

test("formatIngredientsList renders calories and protein", () => {
  const text = formatIngredientsList([
    { name: "Granola", calories: 150, protein: 4 },
    { name: "Yogurt", calories: 250, protein: 20 }
  ]);
  assert.equal(text, "Granola: 150 / 4g, Yogurt: 250 / 20g");
});

test("normalizeMealDef keeps optional ingredients with protein", () => {
  const meal = normalizeMealDef({
    id: "yogurt",
    name: "Yogurt w/ Granola",
    calories: 400,
    protein: 30,
    ingredients: { Granola: { calories: 150, protein: 4 }, Yogurt: { calories: 250, protein: 20 } }
  });
  assert.equal(meal.ingredients.length, 2);
  assert.equal(meal.ingredients[0].protein, 4);
});
