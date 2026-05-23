const test = require("node:test");
const assert = require("node:assert/strict");
const { mergeEntries, mergeForSave, mergeIncoming } = require("../src/domain/merge");
const { normalizeFile } = require("../src/domain/normalize");

test("mergeEntries keeps newer updatedAt per id", () => {
  const merged = mergeEntries(
    [{ id: "a", calories: 100, updatedAt: "2026-05-23T12:00:00.000Z" }],
    [{ id: "a", calories: 200, updatedAt: "2026-05-23T11:00:00.000Z" }]
  );
  assert.equal(merged.length, 1);
  assert.equal(merged[0].calories, 100);
});

test("mergeForSave merges same-day entries and disk config", () => {
  const local = normalizeFile({
    tdee: 2000,
    staples: [{ id: "oil", name: "Olive Oil", calories: 600 }],
    regulars: [],
    day: "2026-05-23",
    entries: [{ id: "e1", kind: "staple", label: "Olive Oil", calories: 600, count: 1, updatedAt: "2026-05-23T08:00:00.000Z" }]
  });
  const disk = normalizeFile({
    tdee: 2500,
    staples: [{ id: "oil", name: "Olive Oil", calories: 600 }],
    regulars: [{ id: "rice", name: "Rice", calories: 500 }],
    day: "2026-05-23",
    entries: [{ id: "e2", kind: "regular", label: "Rice", calories: 500, count: 1, updatedAt: "2026-05-23T09:00:00.000Z" }]
  });
  const merged = mergeForSave(local, disk, "2026-05-23");
  assert.equal(merged.tdee, 2500);
  assert.equal(merged.regulars.length, 1);
  assert.equal(merged.entries.length, 2);
  assert.equal(merged.entries.filter(e => !e.deleted).length, 2);
});

test("mergeIncoming applies disk config and merges entries", () => {
  const memory = normalizeFile({
    tdee: 2000,
    staples: [],
    regulars: [],
    day: "2026-05-23",
    entries: [{ id: "e1", kind: "custom", label: "Custom", calories: 300, count: 1, updatedAt: "2026-05-23T10:00:00.000Z" }]
  });
  const disk = normalizeFile({
    tdee: 2600,
    staples: [{ id: "oil", name: "Olive Oil", calories: 600 }],
    regulars: [],
    day: "2026-05-23",
    entries: [{ id: "e2", kind: "staple", label: "Olive Oil", calories: 600, count: 1, updatedAt: "2026-05-23T08:00:00.000Z" }]
  });
  mergeIncoming(memory, disk, "2026-05-23");
  assert.equal(memory.tdee, 2600);
  assert.equal(memory.staples.length, 1);
  assert.equal(memory.entries.length, 2);
});
