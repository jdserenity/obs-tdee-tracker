const { activeEntries } = require("./entries");

function entryCount(entry) {
  return typeof entry.count === "number" && entry.count > 0 ? entry.count : 1;
}

function entryCalories(entry) {
  return Math.max(0, Math.round(entry.calories)) * entryCount(entry);
}

function entryProtein(entry) {
  return Math.max(0, Math.round(entry.protein || 0)) * entryCount(entry);
}

function totalCalories(entries) {
  return activeEntries(entries).reduce((sum, entry) => sum + entryCalories(entry), 0);
}

function totalProtein(entries) {
  return activeEntries(entries).reduce((sum, entry) => sum + entryProtein(entry), 0);
}

function formatCalories(n) {
  return Math.max(0, Math.round(n)).toLocaleString();
}

function formatProtein(n) {
  return Math.max(0, Math.round(n)).toLocaleString();
}

function progressRatio(total, target) {
  if (!target || target <= 0) return 0;
  return Math.min(1, total / target);
}

function remainingDisplay(total, tdee) {
  const remaining = tdee - total;
  if (remaining >= 0) {
    return { text: `${formatCalories(remaining)} kcal remaining`, extraClass: "" };
  }
  return { text: `💪 ${formatCalories(Math.abs(remaining))} kcal over TDEE`, extraClass: " tdee-remaining-surplus" };
}

function proteinRemainingDisplay(total, target) {
  const remaining = target - total;
  if (remaining >= 0) {
    return { text: `${formatProtein(remaining)} g remaining`, extraClass: "" };
  }
  return { text: `💪 ${formatProtein(Math.abs(remaining))} g over target`, extraClass: " tdee-remaining-surplus" };
}

function formatChipMacros(calories, protein) {
  return `${Math.max(0, Math.round(calories))} / ${Math.max(0, Math.round(protein))}g`;
}

module.exports = {
  entryCalories, entryProtein, totalCalories, totalProtein,
  formatCalories, formatProtein, formatChipMacros, progressRatio, remainingDisplay, proteinRemainingDisplay
};
