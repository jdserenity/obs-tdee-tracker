const test = require("node:test");
const assert = require("node:assert/strict");
const { totalCalories, totalProtein, entryCalories, entryProtein, progressRatio, remainingDisplay, proteinRemainingDisplay, formatChipMacros } = require("../src/domain/totals");

test("totalCalories sums entries with count", () => {
  const total = totalCalories([
    { calories: 600, protein: 0, count: 1 },
    { calories: 800, protein: 30, count: 2 }
  ]);
  assert.equal(total, 2200);
});

test("totalProtein sums entries with count", () => {
  const total = totalProtein([
    { calories: 600, protein: 40, count: 1 },
    { calories: 800, protein: 30, count: 2 }
  ]);
  assert.equal(total, 100);
});

test("entryCalories defaults count to 1", () => {
  assert.equal(entryCalories({ calories: 450, protein: 0 }), 450);
});

test("entryProtein defaults count to 1 and missing protein to 0", () => {
  assert.equal(entryProtein({ calories: 450 }), 0);
  assert.equal(entryProtein({ calories: 450, protein: 25, count: 2 }), 50);
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

test("proteinRemainingDisplay shows remaining g under target", () => {
  const d = proteinRemainingDisplay(120, 180);
  assert.equal(d.text, "60 g remaining");
  assert.equal(d.extraClass, "");
});

test("proteinRemainingDisplay celebrates surplus over protein target", () => {
  const d = proteinRemainingDisplay(200, 180);
  assert.equal(d.text, "💪 20 g over target");
  assert.match(d.extraClass, /tdee-remaining-surplus/);
});

test("formatChipMacros shows calories and protein", () => {
  assert.equal(formatChipMacros(600, 0), "600 / 0g");
  assert.equal(formatChipMacros(800, 45), "800 / 45g");
});
