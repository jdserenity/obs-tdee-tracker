const { normalizeFile } = require("./normalize");

function mergeEntries(localEntries, diskEntries) {
  const map = new Map();
  for (const entry of [...(diskEntries || []), ...(localEntries || [])]) {
    const prev = map.get(entry.id);
    if (!prev || entry.updatedAt >= prev.updatedAt) map.set(entry.id, entry);
  }
  return [...map.values()].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
}

function applyConfigFromDisk(target, disk) {
  if (typeof disk.tdee === "number") target.tdee = disk.tdee;
  if (Array.isArray(disk.staples)) target.staples = disk.staples;
  if (Array.isArray(disk.regulars)) target.regulars = disk.regulars;
}

function mergeForSave(local, disk, currentDay) {
  const merged = normalizeFile(local);
  merged.day = currentDay;
  const fromDisk = normalizeFile(disk || {});
  applyConfigFromDisk(merged, fromDisk);
  if (fromDisk.day === currentDay) merged.entries = mergeEntries(merged.entries, fromDisk.entries);
  return merged;
}

function mergeIncoming(memory, disk, currentDay) {
  const incoming = normalizeFile(disk || {});
  applyConfigFromDisk(memory, incoming);
  if (incoming.day === currentDay && memory.day === currentDay) {
    memory.entries = mergeEntries(memory.entries, incoming.entries);
  } else if (incoming.day === currentDay) {
    memory.day = currentDay;
    memory.entries = incoming.entries;
  }
  memory.day = currentDay;
}

module.exports = { mergeEntries, mergeForSave, mergeIncoming, applyConfigFromDisk };
