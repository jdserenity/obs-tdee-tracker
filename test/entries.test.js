const test = require("node:test");
const assert = require("node:assert/strict");
const { activeEntries, isStapleLogged, makeTombstone } = require("../src/domain/entries");
const { totalCalories } = require("../src/domain/totals");
const { mergeEntries } = require("../src/domain/merge");

test("activeEntries skips tombstones", () => {
  const entries = [
    { id: "e1", kind: "staple", label: "Oil", calories: 600, protein: 0, count: 1, updatedAt: "2026-05-23T08:00:00.000Z" },
    makeTombstone("e2")
  ];
  assert.equal(activeEntries(entries).length, 1);
  assert.equal(totalCalories(entries), 600);
});

test("isStapleLogged is true once staple ref is logged", () => {
  const entries = [{ id: "e1", kind: "staple", refId: "olive-oil", label: "Olive Oil", calories: 600, protein: 0, count: 1, updatedAt: "2026-05-23T08:00:00.000Z" }];
  assert.equal(isStapleLogged(entries, "olive-oil"), true);
  assert.equal(isStapleLogged(entries, "other"), false);
});

test("mergeEntries keeps newer tombstone over active entry", () => {
  const merged = mergeEntries(
    [makeTombstone("e1")],
    [{ id: "e1", kind: "custom", label: "Custom", calories: 400, protein: 20, count: 1, updatedAt: "2026-05-23T08:00:00.000Z" }]
  );
  assert.equal(merged.length, 1);
  assert.equal(merged[0].deleted, true);
  assert.equal(activeEntries(merged).length, 0);
});
