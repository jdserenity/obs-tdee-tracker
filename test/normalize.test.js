const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeFile, normalizeMealDef, normalizeEntry } = require("../src/domain/normalize");
const { makeEntry } = require("../src/domain/entries");

test("normalizeMealDef requires protein on staples and regulars", () => {
  const meal = normalizeMealDef({ id: "chicken", name: "Chicken", calories: 800, protein: 60 });
  assert.equal(meal.protein, 60);
});

test("normalizeFile keeps meal defs without protein and defaults to 0", () => {
  const file = normalizeFile({
    tdee: 2500,
    protein: 180,
    staples: [
      { id: "oil", name: "Olive Oil", calories: 600, protein: 0 },
      { id: "legacy", name: "Missing Protein", calories: 100 }
    ],
    regulars: [],
    day: "2026-05-23",
    entries: []
  });
  assert.equal(file.protein, 180);
  assert.equal(file.staples.length, 2);
  assert.equal(file.staples[1].protein, 0);
});

test("normalizeEntry defaults missing protein to 0", () => {
  const entry = normalizeEntry({ id: "e1", kind: "custom", label: "Snack", calories: 200, count: 1, updatedAt: "2026-05-23T08:00:00.000Z" });
  assert.equal(entry.protein, 0);
});

test("makeEntry stores protein", () => {
  const entry = makeEntry({ kind: "regular", refId: "rice", label: "Rice", calories: 500, protein: 12, count: 2 });
  assert.equal(entry.protein, 12);
  assert.equal(entry.calories, 500);
});
