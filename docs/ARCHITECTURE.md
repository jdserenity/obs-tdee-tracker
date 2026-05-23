# TDEE Tracker — Architecture

## Overview

Obsidian community plugin **TDEE Tracker** (`tdee-tracker`). Tracks today's intake against a configured TDEE. Staples (daily one-tap items), regulars (saved meals with count), and irregular custom kcal entries. Not weight-loss focused — intake vs maintenance target.

Built with esbuild from `src/` → `dist/main.js`. Deploy via `obs-deploy` (copies `dist/main.js` → vault `main.js`, plus `styles.css` and `manifest.json`).

## Data

Single vault file (default `Archive/tdee-tracker.md`), JSON body:

- `tdee` — daily target (kcal)
- `staples` — `{ id, name, calories }[]` shown as one-tap buttons
- `regulars` — `{ id, name, calories }[]` shown in add mode (+ button)
- `day` — `YYYY-MM-DD` for current log day
- `entries` — today's log: `{ id, kind, refId?, label, calories, count, updatedAt }`

Only today's entries are kept; day rollover clears `entries` when `day` ≠ current day (respects day-end setting).

Plugin `data.json` — settings only (`dayEndTime`, `filePath`).

## Sync

Vault markdown file syncs via Obsidian Sync / iCloud / etc. Merge on save and on incoming `vault.on("modify")`: config fields from disk; same-day entries merged LWW by `updatedAt` per entry id. Hash dedup skips self-triggered reloads (500ms debounce).

## UI

Code block:

````markdown
```tdee-tracker
```
````

Shows total / TDEE / remaining. Logged foods appear as green chain segments; staple buttons and `+` extend the chain.

## Layout

| Layer | Location |
|-------|----------|
| Entry | `src/main.js` |
| Plugin | `src/plugin.js` |
| UI | `src/ui/tracker-view.js` |
| Settings | `src/settings.js` |
| Store | `src/store/tdee-store.js` |
| Domain | `src/domain/` |
| Infra | `src/infra/vault-repository.js`, `sync-coordinator.js` |

Tests: `npm test`.

## Example vault file

```json
{
  "tdee": 2500,
  "staples": [
    { "id": "olive-oil", "name": "Olive Oil", "calories": 600 }
  ],
  "regulars": [
    { "id": "chicken-rice", "name": "Chicken & Rice", "calories": 800 }
  ],
  "day": "2026-05-23",
  "entries": []
}
```
