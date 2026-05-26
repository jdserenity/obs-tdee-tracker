const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_SETTINGS } = require("../src/domain/defaults");

test("default vault config path is tdee-tracker-config.md", () => {
  assert.equal(DEFAULT_SETTINGS.filePath, "Archive/tdee-tracker-config.md");
});
