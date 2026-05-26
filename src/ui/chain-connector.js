// Wide link pair; CSS clips to the center so gaps read as >< not <><>.
const CHAIN_CONNECTOR_SVG = `<svg class="tdee-chain-connector-svg" viewBox="0 0 34 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="1" y="3" width="15" height="10" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
  <rect x="18" y="3" width="15" height="10" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
</svg>`;

const CHAIN_CLIP_WIDTH = 14;
const CHAIN_SVG_WIDTH = 34;
const CHAIN_SVG_OFFSET = -Math.round((CHAIN_SVG_WIDTH - CHAIN_CLIP_WIDTH) / 2);

function appendChainConnector(parent) {
  const el = parent.createDiv({ cls: "tdee-chain-connector" });
  el.innerHTML = CHAIN_CONNECTOR_SVG;
  el.style.setProperty("--tdee-chain-svg-offset", `${CHAIN_SVG_OFFSET}px`);
  return el;
}

module.exports = { appendChainConnector, CHAIN_CONNECTOR_SVG, CHAIN_CLIP_WIDTH, CHAIN_SVG_WIDTH, CHAIN_SVG_OFFSET };
