function entryCalories(entry) {
  const count = typeof entry.count === "number" && entry.count > 0 ? entry.count : 1;
  return Math.max(0, Math.round(entry.calories)) * count;
}

function totalCalories(entries) {
  if (!Array.isArray(entries)) return 0;
  return entries.reduce((sum, entry) => sum + entryCalories(entry), 0);
}

function formatCalories(n) {
  return Math.max(0, Math.round(n)).toLocaleString();
}

function progressRatio(total, tdee) {
  if (!tdee || tdee <= 0) return 0;
  return Math.min(1, total / tdee);
}

module.exports = { entryCalories, totalCalories, formatCalories, progressRatio };
