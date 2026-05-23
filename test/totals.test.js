const test = require("node:test");
const assert = require("node:assert/strict");
const { totalCalories, entryCalories, progressRatio } = require("../src/domain/totals");

test("totalCalories sums entries with count", () => {
  const total = totalCalories([
    { calories: 600, count: 1 },
    { calories: 800, count: 2 }
  ]);
  assert.equal(total, 2200);
});

test("entryCalories defaults count to 1", () => {
  assert.equal(entryCalories({ calories: 450 }), 450);
});

test("progressRatio caps at 1", () => {
  assert.equal(progressRatio(3000, 2500), 1);
  assert.equal(progressRatio(1250, 2500), 0.5);
});
