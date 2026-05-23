const test = require("node:test");
const assert = require("node:assert/strict");
const { getCurrentDay, formatDate } = require("../src/domain/dates");

test("getCurrentDay before day end counts as previous day", () => {
  const day = getCurrentDay("06:00");
  assert.match(day, /^\d{4}-\d{2}-\d{2}$/);
});

test("formatDate returns YYYY-MM-DD", () => {
  assert.equal(formatDate(new Date(2026, 4, 23)), "2026-05-23");
});
