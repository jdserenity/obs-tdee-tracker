const test = require("node:test");
const assert = require("node:assert/strict");
const { ensureCurrentDay } = require("../src/domain/entries");
const { normalizeFile } = require("../src/domain/normalize");

test("ensureCurrentDay clears entries when day changes", () => {
  const state = normalizeFile({
    tdee: 2500,
    staples: [],
    regulars: [],
    day: "2026-05-22",
    entries: [{ id: "e1", kind: "custom", label: "Custom", calories: 400, count: 1, updatedAt: "2026-05-22T12:00:00.000Z" }]
  });
  ensureCurrentDay(state, "2026-05-23");
  assert.equal(state.day, "2026-05-23");
  assert.equal(state.entries.length, 0);
});
