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
  assert.match(chain, /gap:\s*0/);
  assert.doesNotMatch(css, /\.tdee-chain-logged/);
});

test("chain connectors clip to a narrow >< window between chips", () => {
  const connector = ruleBlock(".tdee-chain-connector");
  const svg = ruleBlock(".tdee-chain-connector-svg");
  const btn = ruleBlock(".tdee-chain-btn");
  assert.match(connector, /overflow:\s*hidden/);
  assert.match(connector, /width:\s*14px/);
  assert.match(svg, /width:\s*34px/);
  assert.match(svg, /margin-left:\s*var\(--tdee-chain-svg-offset/);
  assert.match(btn, /z-index:\s*1/);
});

test("chain chips do not shrink below readable size", () => {
  const btn = ruleBlock(".tdee-chain-btn");
  assert.match(btn, /flex-shrink:\s*0/);
});

test("surplus over TDEE uses green styling", () => {
  const surplus = ruleBlock(".tdee-remaining-surplus");
  assert.match(surplus, /rgb\(34,\s*197,\s*94\)/);
  assert.doesNotMatch(css, /\.tdee-remaining-over/);
});
