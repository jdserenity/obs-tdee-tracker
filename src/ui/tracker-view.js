const { totalCalories, formatCalories, progressRatio } = require("../domain/totals");

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
    const file = this.plugin.store.file;
    const addMode = this.plugin.isAddMode(el);
    const container = document.createElement("div");
    container.className = "tdee-tracker-container";
    const total = totalCalories(file.entries);
    const tdee = file.tdee || 0;
    const ratio = progressRatio(total, tdee);

    this.renderSummary(container, total, tdee, ratio);

    if (addMode) this.renderAddMode(container, el, file);
    else this.renderStaplesMode(container, el, file);

    if (file.entries.length > 0) this.renderEntryLog(container, file.entries);

    el.replaceChildren(container);
  }

  renderSummary(container, total, tdee, ratio) {
    const summary = container.createDiv({ cls: "tdee-summary" });
    const counts = summary.createDiv({ cls: "tdee-counts" });
    counts.createSpan({ cls: "tdee-today", text: `${formatCalories(total)} kcal` });
    if (tdee > 0) {
      counts.createSpan({ cls: "tdee-sep", text: " / " });
      counts.createSpan({ cls: "tdee-target", text: `${formatCalories(tdee)} TDEE` });
      const remaining = tdee - total;
      summary.createDiv({
        cls: `tdee-remaining${remaining < 0 ? " tdee-remaining-over" : ""}`,
        text: remaining >= 0 ? `${formatCalories(remaining)} kcal to TDEE` : `${formatCalories(Math.abs(remaining))} kcal over TDEE`
      });
    } else {
      summary.createDiv({ cls: "tdee-remaining", text: "Set tdee in your vault file" });
    }
    if (tdee > 0) {
      const bar = summary.createDiv({ cls: "tdee-progress" });
      bar.createDiv({ cls: "tdee-progress-fill", attr: { style: `width:${Math.round(ratio * 100)}%` } });
    }
  }

  renderStaplesMode(container, el, file) {
    const chain = container.createDiv({ cls: "tdee-chain" });
    if (file.staples.length === 0) {
      chain.createEl("p", {
        cls: "tdee-tracker-empty",
        text: "No staples in vault file. Add staples to Archive/tdee-tracker.md."
      });
    } else {
      for (const staple of file.staples) {
        const btn = chain.createEl("button", {
          cls: "tdee-chain-btn",
          text: staple.name,
          attr: { title: `+${staple.calories} kcal` }
        });
        btn.createSpan({ cls: "tdee-chain-kcal", text: `${staple.calories}` });
        btn.addEventListener("click", async () => {
          await this.plugin.addStaple(staple);
        });
      }
    }
    const plus = chain.createEl("button", {
      cls: "tdee-chain-btn tdee-chain-plus",
      text: "+",
      attr: { title: "Add regular or custom calories" }
    });
    plus.addEventListener("click", async () => {
      this.plugin.setAddMode(el, true);
      await this.render(el);
    });
  }

  renderAddMode(container, el, file) {
    const panel = container.createDiv({ cls: "tdee-add-panel" });
    const header = panel.createDiv({ cls: "tdee-add-header" });
    header.createEl("span", { text: "Regulars & custom", cls: "tdee-add-title" });
    const back = header.createEl("button", { cls: "tdee-add-back", text: "← Staples" });
    back.addEventListener("click", async () => {
      this.plugin.setAddMode(el, false);
      await this.render(el);
    });

    const list = panel.createDiv({ cls: "tdee-regular-list" });
    if (file.regulars.length === 0) {
      list.createEl("p", { cls: "tdee-tracker-empty", text: "No regulars configured yet." });
    } else {
      for (const regular of file.regulars) {
        const row = list.createDiv({ cls: "tdee-regular-row" });
        row.createSpan({ cls: "tdee-regular-name", text: regular.name });
        row.createSpan({ cls: "tdee-regular-kcal", text: `${regular.calories} kcal` });
        const countWrap = row.createDiv({ cls: "tdee-count-wrap" });
        const input = countWrap.createEl("input", {
          cls: "tdee-count-input",
          attr: { type: "number", min: "1", step: "1", value: "1" }
        });
        const addBtn = countWrap.createEl("button", { cls: "tdee-add-btn", text: "Add" });
        addBtn.addEventListener("click", async () => {
          const count = Math.max(1, Math.round(Number(input.value) || 1));
          await this.plugin.addRegular(regular, count);
          this.plugin.setAddMode(el, false);
        });
      }
    }

    const custom = panel.createDiv({ cls: "tdee-custom-row" });
    custom.createSpan({ text: "Irregular:", cls: "tdee-custom-label" });
    const customInput = custom.createEl("input", {
      cls: "tdee-custom-input",
      attr: { type: "number", min: "1", step: "1", placeholder: "kcal" }
    });
    const customBtn = custom.createEl("button", { cls: "tdee-add-btn", text: "Add" });
    customBtn.addEventListener("click", async () => {
      const calories = Math.round(Number(customInput.value));
      if (!calories || calories <= 0) return;
      await this.plugin.addCustom(calories);
      this.plugin.setAddMode(el, false);
    });
  }

  renderEntryLog(container, entries) {
    const log = container.createDiv({ cls: "tdee-log" });
    log.createEl("div", { text: "Today", cls: "tdee-log-label" });
    const list = log.createDiv({ cls: "tdee-log-list" });
    for (const entry of [...entries].reverse()) {
      const count = entry.count > 1 ? ` ×${entry.count}` : "";
      const amount = entry.calories * (entry.count || 1);
      list.createDiv({
        cls: "tdee-log-item",
        text: `${entry.label}${count} — ${formatCalories(amount)} kcal`
      });
    }
  }

  async refreshAll() {
    for (const el of this.plugin._trackerElements) {
      if (el?.isConnected) await this.render(el);
    }
  }
}

module.exports = { TrackerView };
