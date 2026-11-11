# TameFeed

Chrome (MV3) extension for x.com / twitter.com. Does what Twitter Media Blocker does, plus a minimal reading mode and Apollo-for-Reddit-style features.

## Install (unpacked)
1. Open `chrome://extensions`, enable **Developer mode**.
2. **Load unpacked** and select this folder.
3. Pin the toolbar icon. **Alt+M** toggles everything (rebind at `chrome://extensions/shortcuts`).

## Features
The popup is one scrolling page with these sections:

| Section | Options |
|---|---|
| Media | Images/videos: show, blur (click to reveal) or hide. Hide Trending and Who to follow. Per-account media exceptions. Press `v` to show all blocked media in the timeline, press again to re-block (resets on page reload). A small toast confirms each press. |
| Feed | Minimal mode, density (large/compact/text-only), dim or hide seen posts, collapse button on posts, open Following tab, hide counts. |
| Filters | Hide ads and Premium/Grok upsells, hide reposts, quotes or replies, mute list (words, `@accounts`, `/regex/i`; one rule per line, `g`/`y` flags ignored). |
| Look | Themes (AMOLED, Sepia, Nord, Solarized), accent, font, size, line height, minimal column width. |

Notes:
- The only keyboard shortcut is `v` (peek at all media) plus Alt+M (master switch). X itself binds many plain letters (for example `x` opens the Block dialog, `u` mute, `b`, `l`, `r`, `t`, `s`, `n`), so the extension deliberately registers no others; posts collapse via the – button. `v` is ignored in text fields and with Ctrl/Cmd/Alt/Shift held. `tests/check.js` guards this.
- Seen tracking records post ids you scrolled past (max 5000, stored locally). Dim/hide applies on the next page load.
- Themes and density are best-effort overrides; X's markup changes often. `tests/theme.test.js` checks every theme palette for 4.5:1 contrast (text, muted text, links).

## Develop
- `npm test` runs unit tests (`node --test`) and static checks (manifest, syntax).
- Pure logic is in `lib/` (settings, filters, seen) and unit-tested. DOM selectors are in `content/content.js` (`SEL`) and `content/styles.css`; fix there when X changes.
- Settings: `chrome.storage.local` (`settings`; local rather than sync because sync's 8 KB per-item quota breaks long mute lists, so settings do not follow you across devices). Seen ids: `chrome.storage.local` (`seen`).
- Permissions: `storage` and x.com/twitter.com hosts only. No data leaves the browser.

The project folder is still named `x_enhancer` (renaming it would change the unpacked extension's ID in Chrome); the product name is TameFeed.
