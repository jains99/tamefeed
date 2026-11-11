# CLAUDE.md – TameFeed

Chrome MV3 extension for X. See README.md for features.

## Architecture
- `lib/*.js`: UMD modules (browser global + `require`) holding all testable logic: `settings.js` (defaults, validation, `toAttributes`, `toCssVars`), `filters.js` (mute rules, exceptions, tweet classification), `seen.js`, `keys.js` (shortcut matching), `mediabox.js` (finds the wrapper box around media so hiding media leaves no empty bordered box). `toAttributes(settings, {peek})` drops image/video blocking while peeking; `peek` is in-memory state in `content.js`, never persisted.
- `content/content.js`: loads settings, sets `data-xe-*` attributes on `<html>`, processes tweets via one debounced MutationObserver. Selectors live in `SEL`.
- `content/styles.css`: every visual feature is a rule keyed on `html[data-xe-*]`.
- Storage: settings in `chrome.storage.local` (`settings`), seen ids in `chrome.storage.local` (`seen`). Do not use sync (8 KB/item quota).
- Safe defaults: `content.js` calls `applySettings()` with defaults at boot so media is blurred before stored settings load.
- `popup/`: shared by the toolbar popup and the options page; generic `[data-key]` binding in `popup.js`.
- `background.js`: Alt+M toggle.

## Rules
- Adding a setting: update `DEFAULTS`/`toAttributes` in `lib/settings.js`, add a test, add a `data-key` control in `popup.html`, add CSS.
- Keyboard: do NOT add plain-letter shortcuts without checking X's own list (press `?` on x.com); `x` opens X's Block dialog. `tests/check.js` fails if any plain key other than `v` is registered.
- Themes: define `--xe-bg/fg/muted/border` (and `--xe-accent` if the default blue is unreadable) per theme in `styles.css`; `tests/theme.test.js` enforces contrast. Test selectors live (inject the CSS into x.com) since X's DOM changes.
- Tests first; run `npm test`. No browser testing unless asked.
- Bump the version in `manifest.json`, `package.json` and file headers on release.
