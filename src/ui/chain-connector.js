const CHAIN_CONNECTOR_SVG = `<svg class="tdee-chain-connector-svg" viewBox="0 0 34 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="1" y="3" width="15" height="10" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
  <rect x="18" y="3" width="15" height="10" rx="5" fill="none" stroke="currentColor" stroke-width="2"/>
</svg>`;

function appendChainConnector(parent) {
  const el = parent.createDiv({ cls: "tdee-chain-connector" });
  el.innerHTML = CHAIN_CONNECTOR_SVG;
  return el;
}

module.exports = { appendChainConnector, CHAIN_CONNECTOR_SVG };
