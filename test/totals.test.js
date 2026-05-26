const test = require("node:test");
const assert = require("node:assert/strict");
const { totalCalories, entryCalories, progressRatio, remainingDisplay } = require("../src/domain/totals");

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

test("remainingDisplay shows remaining kcal under TDEE", () => {
  const d = remainingDisplay(2000, 2500);
  assert.equal(d.text, "500 kcal remaining");
  assert.equal(d.extraClass, "");
});

test("remainingDisplay celebrates surplus over TDEE for gaining", () => {
  const d = remainingDisplay(2800, 2500);
  assert.equal(d.text, "💪 300 kcal over TDEE");
  assert.match(d.extraClass, /tdee-remaining-surplus/);
});
