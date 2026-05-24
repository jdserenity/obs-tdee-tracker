const { readFileSync } = require("fs");
const { join } = require("path");
const { test } = require("node:test");
const assert = require("node:assert/strict");

const css = readFileSync(join(__dirname, "../styles.css"), "utf8");

function ruleBlock(selector) {
  const escaped = selector.replace(/\./g, "\\.");
  const re = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "s");
  const m = css.match(re);
  assert.ok(m, `missing ${selector} rule`);
  return m[1];
}

test("chain row wraps on narrow viewports", () => {
  const chain = ruleBlock(".tdee-chain");
  assert.match(chain, /flex-wrap:\s*wrap/);
  assert.doesNotMatch(css, /\.tdee-chain-logged/);
});

test("chain chips do not shrink below readable size", () => {
  const btn = ruleBlock(".tdee-chain-btn");
  assert.match(btn, /flex-shrink:\s*0/);
});
