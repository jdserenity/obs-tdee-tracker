const test = require("node:test");
const assert = require("node:assert/strict");
const { CHAIN_CONNECTOR_SVG, CHAIN_CLIP_WIDTH, CHAIN_SVG_WIDTH, CHAIN_SVG_OFFSET } = require("../src/ui/chain-connector");

test("connector SVG has two links for clipping to a single >< gap", () => {
  assert.match(CHAIN_CONNECTOR_SVG, /viewBox="0 0 34 16"/);
  assert.equal((CHAIN_CONNECTOR_SVG.match(/<rect/g) || []).length, 2);
});

test("clip window centers on the join between links", () => {
  assert.equal(CHAIN_CLIP_WIDTH, 14);
  assert.equal(CHAIN_SVG_WIDTH, 34);
  assert.equal(CHAIN_SVG_OFFSET, -10);
});
