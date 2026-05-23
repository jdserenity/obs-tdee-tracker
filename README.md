# TDEE Tracker

Obsidian plugin for tracking daily intake against TDEE — staples, regulars, and quick custom entries.

**Development:** `npm install` → `npm run build` → `npm test`. Deploy: `obs-deploy` from repo root. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Setup

1. Copy or deploy the plugin to `.obsidian/plugins/tdee-tracker/` (`main.js`, `manifest.json`, `styles.css`).
2. Enable **TDEE Tracker** in Community Plugins.
3. Create `Archive/tdee-tracker.md` in your vault (JSON — see ARCHITECTURE for shape).
4. Add a code block to any note:

````markdown
```tdee-tracker
```
````

Place it under your streak tracker block in the same daily note if you like — separate plugins, same ritual.

## Usage

- Tap a **staple** to add its kcal.
- Tap **+** for regulars (pick count) or enter an irregular kcal amount.
- Total, TDEE, and remaining kcal update immediately.
- Edit staples/regulars/TDEE in the vault file; syncs across devices.
