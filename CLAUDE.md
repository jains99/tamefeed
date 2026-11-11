# CLAUDE.md – x_enhancer

Chrome MV3 extension for X. See README.md for features.

## Architecture
- `lib/*.js`: UMD modules (browser global + `require`) holding all testable logic: `settings.js` (defaults, validation, `toAttributes`, `toCssVars`), `filters.js` (mute rules, exceptions, tweet classification), `seen.js`, `keys.js` (shortcut matching). `toAttributes(settings, {peek})` drops image/video blocking while peeking; `peek` is in-memory state in `content.js`, never persisted.
- `content/content.js`: loads settings, sets `data-xe-*` attributes on `<html>`, processes tweets via one debounced MutationObserver. Selectors live in `SEL`.
- `content/styles.css`: every visual feature is a rule keyed on `html[data-xe-*]`.
- `popup/`: shared by the toolbar popup and the options page; generic `[data-key]` binding in `popup.js`.
- `background.js`: Alt+M toggle.

## Rules
- Adding a setting: update `DEFAULTS`/`toAttributes` in `lib/settings.js`, add a test, add a `data-key` control in `popup.html`, add CSS.
- Tests first; run `npm test`. No browser testing unless asked.
- Bump the version in `manifest.json`, `package.json` and file headers on release.
