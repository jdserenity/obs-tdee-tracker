# TDEE Tracker — Deploy

From repo root:

```bash
obs-deploy              # npm run build, copy to configured vaults
obs-deploy --dry-run    # show targets only
obs-deploy --no-build   # copy existing dist/
```

Requires `obs-deploy` on PATH (`npm link` in the obs-deploy repo). Vault paths: `~/.config/obsidian/deploy.json`.

Copies:

- `dist/main.js` → `<vault>/.obsidian/plugins/tdee-tracker/main.js`
- `manifest.json`, `styles.css`

Plugin folder name comes from `manifest.json` `id` (`tdee-tracker`).
