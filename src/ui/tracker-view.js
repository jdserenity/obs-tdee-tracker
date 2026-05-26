const { totalCalories, entryCalories, formatCalories, progressRatio, remainingDisplay } = require("../domain/totals");
const { activeEntries, isStapleLogged } = require("../domain/entries");
const { formatIngredientsList } = require("../domain/ingredients");
const { appendChainConnector } = require("./chain-connector");

class TrackerView {
  constructor(plugin) {
    this.plugin = plugin;
  }

  async render(el) {
    try {
      await this._renderImpl(el);
    } catch (e) {
      console.error("tdee-tracker: render failed:", e);
      el.replaceChildren();
      el.createEl("p", { text: `TDEE tracker failed to render: ${e.message}`, cls: "tdee-tracker-empty" });
    }
  }

  async _renderImpl(el) {
    this.plugin._trackerElements.add(el);
    this.plugin.store.rollDayIfNeeded();
    if (this.plugin.store.loadError) {
      const container = document.createElement("div");
      container.className = "tdee-tracker-container";
      container.createEl("p", {
        cls: "tdee-tracker-error",
        text: `Could not parse ${this.plugin.store.settings.filePath}: ${this.plugin.store.loadError}`
      });
      container.createEl("p", {
        cls: "tdee-tracker-empty",
        text: "Fix the JSON in that file (commas, quotes, brackets). Logs do not conflict with staples — invalid JSON breaks the whole file."
      });
      el.replaceChildren(container);
      return;
    }
    const file = this.plugin.store.file;
    const addMode = this.plugin.isAddMode(el);
    const logged = activeEntries(file.entries);
    const container = document.createElement("div");
    container.className = "tdee-tracker-container";
    const total = totalCalories(file.entries);
    const tdee = file.tdee || 0;
    const ratio = progressRatio(total, tdee);

    this.renderSummary(container, total, tdee, ratio);
    this.renderChain(container, el, file, logged, addMode);
    if (addMode) this.renderAddMode(container, el, file);

    el.replaceChildren(container);
  }

  renderSummary(container, total, tdee, ratio) {
    const summary = container.createDiv({ cls: "tdee-summary" });
    const counts = summary.createDiv({ cls: "tdee-counts" });
    counts.createSpan({ cls: "tdee-today", text: `${formatCalories(total)} kcal` });
    if (tdee > 0) {
      counts.createSpan({ cls: "tdee-sep", text: " / " });
      counts.createSpan({ cls: "tdee-target", text: `${formatCalories(tdee)} TDEE ⚡` });
      const { text, extraClass } = remainingDisplay(total, tdee);
      summary.createDiv({ cls: `tdee-remaining${extraClass}`, text });
    } else {
      summary.createDiv({ cls: "tdee-remaining", text: "Set tdee in your vault file" });
    }
    if (tdee > 0) {
      const bar = summary.createDiv({ cls: "tdee-progress" });
      bar.createDiv({ cls: "tdee-progress-fill", attr: { style: `width:${Math.round(ratio * 100)}%` } });
    }
  }

  renderChain(container, el, file, logged, addMode) {
    const chain = container.createDiv({ cls: "tdee-chain" });
    let hasChip = false;
    const beforeChip = () => {
      if (hasChip) appendChainConnector(chain);
      hasChip = true;
    };

    logged.forEach((entry) => {
      beforeChip();
      this.renderLoggedChip(chain, entry);
    });

    if (!addMode) {
      const pendingStaples = file.staples.filter(s => !isStapleLogged(file.entries, s.id));
      if (pendingStaples.length === 0 && logged.length === 0) {
        chain.createEl("p", {
          cls: "tdee-tracker-empty tdee-chain-empty",
          text: "No staples in vault file. Add staples to Archive/tdee-tracker-config.md."
        });
      } else {
        for (const staple of pendingStaples) {
          beforeChip();
          const btn = chain.createEl("button", {
            cls: "tdee-chain-btn",
            attr: { title: `+${staple.calories} kcal` }
          });
          btn.createSpan({ cls: "tdee-chain-label", text: staple.name });
          btn.createSpan({ cls: "tdee-chain-kcal", text: `${staple.calories}` });
          btn.addEventListener("click", async () => {
            await this.plugin.addStaple(staple);
          });
        }
      }
    }

    if (hasChip) appendChainConnector(chain);
    this.renderPlusButton(chain, el, addMode);
  }

  renderPlusButton(chain, el, addMode) {
    const plus = chain.createEl("button", {
      cls: `tdee-chain-btn tdee-chain-plus${addMode ? " tdee-chain-plus-disabled" : ""}`,
      text: "+",
      attr: {
        title: addMode ? "Close add menu first" : "Add regular or custom calories",
        ...(addMode ? { disabled: "true" } : {})
      }
    });
    if (!addMode) {
      plus.addEventListener("click", async () => {
        this.plugin.setAddMode(el, true);
        await this.render(el);
      });
    }
  }

  renderLoggedChip(chain, entry) {
    const amount = entryCalories(entry);
    const label = entry.label;
    const displayLabel = entry.count > 1 ? `${label} ×${entry.count}` : label;
    const chip = chain.createEl("button", {
      cls: "tdee-chain-btn tdee-chain-done",
      attr: { title: `${formatCalories(amount)} kcal — click to remove` }
    });
    chip.createSpan({ cls: "tdee-chain-label", text: displayLabel });
    chip.createSpan({ cls: "tdee-chain-kcal", text: `${formatCalories(amount)}` });
    chip.addEventListener("click", async () => {
      await this.plugin.removeEntry(entry.id);
    });
  }

  renderAddMode(container, el, file) {
    const panel = container.createDiv({ cls: "tdee-add-panel" });
    const header = panel.createDiv({ cls: "tdee-add-header" });
    header.createEl("span", { text: "Regulars & custom", cls: "tdee-add-title" });
    const close = header.createEl("button", { cls: "tdee-add-close", text: "×", attr: { title: "Close", "aria-label": "Close" } });
    close.addEventListener("click", async () => {
      this.plugin.setAddMode(el, false);
      await this.render(el);
    });

    const list = panel.createDiv({ cls: "tdee-regular-list" });
    if (file.regulars.length === 0) {
      list.createEl("p", { cls: "tdee-tracker-empty", text: "No regulars configured yet." });
    } else {
      for (const regular of file.regulars) {
        const row = list.createDiv({ cls: "tdee-regular-row" });
        const info = row.createDiv({ cls: "tdee-regular-info" });
        info.createSpan({ cls: "tdee-regular-name", text: regular.name });
        if (regular.ingredients?.length) {
          info.createDiv({ cls: "tdee-regular-ingredients", text: formatIngredientsList(regular.ingredients) });
        }
        this.renderPortionControls(row, {
          defaultCalories: regular.calories,
          onAdd: async (calories, count) => {
            await this.plugin.addRegular(regular, calories, count, el);
          }
        });
      }
    }

    const custom = panel.createDiv({ cls: "tdee-custom-row" });
    const info = custom.createDiv({ cls: "tdee-regular-info" });
    const titleInput = info.createEl("input", {
      cls: "tdee-meal-title-input",
      attr: { type: "text", placeholder: "Custom" }
    });
    this.renderPortionControls(custom, {
      placeholderCalories: "cals",
      onAdd: async (calories, count) => {
        await this.plugin.addCustom(titleInput.value, calories, count, el);
      }
    });
  }

  renderPortionControls(row, { defaultCalories, placeholderCalories, onAdd }) {
    const wrap = row.createDiv({ cls: "tdee-portion-wrap" });
    const calAttrs = { type: "number", min: "1", step: "1" };
    if (defaultCalories != null) calAttrs.value = String(defaultCalories);
    else if (placeholderCalories) calAttrs.placeholder = placeholderCalories;
    const calInput = wrap.createEl("input", { cls: "tdee-portion-input", attr: calAttrs });
    wrap.createSpan({ cls: "tdee-portion-x", text: "×" });
    const qtyInput = wrap.createEl("input", {
      cls: "tdee-portion-input tdee-portion-qty",
      attr: { type: "number", min: "1", step: "1", value: "1" }
    });
    const addBtn = wrap.createEl("button", { cls: "tdee-add-btn", text: "Add" });
    addBtn.addEventListener("click", async () => {
      const calories = Math.round(Number(calInput.value));
      const count = Math.max(1, Math.round(Number(qtyInput.value) || 1));
      if (!calories || calories <= 0) return;
      await onAdd(calories, count);
    });
  }

  async refreshAll() {
    for (const el of this.plugin._trackerElements) {
      if (el?.isConnected) await this.render(el);
    }
  }
}

module.exports = { TrackerView };
