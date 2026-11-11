# X Enhancer

Chrome (MV3) extension for x.com / twitter.com. Does what Twitter Media Blocker does, plus a minimal reading mode and Apollo-for-Reddit-style features.

## Install (unpacked)
1. Open `chrome://extensions`, enable **Developer mode**.
2. **Load unpacked** and select this folder.
3. Pin the toolbar icon. **Alt+M** toggles everything (rebind at `chrome://extensions/shortcuts`).

## Features
| Tab | Options |
|---|---|
| Media | Images/videos: show, blur (click to reveal) or hide. Hide Trending and Who to follow. Per-account media exceptions. Press `v` to show all blocked media in the timeline, press again to re-block (resets on page reload). |
| Feed | Minimal mode, density (large/compact/text-only), dim or hide seen posts, collapse button and `x` key, open Following tab, hide counts. |
| Filters | Hide ads and Premium/Grok upsells, hide reposts, quotes or replies, mute list (words, `@accounts`, `/regex/i`). |
| Look | Themes (AMOLED, Sepia, Nord, Solarized), accent, font, size, line height, minimal column width. |

Notes:
- X already supports `j`/`k` (next/previous) and `l` (like), so the extension only adds `x` (collapse) and `v` (peek at all media). Shortcuts are ignored in text fields and with Ctrl/Cmd/Alt/Shift held.
- Seen tracking records post ids you scrolled past (max 5000, stored locally). Dim/hide applies on the next page load.
- Themes and density are best-effort overrides; X's markup changes often.

## Develop
- `npm test` runs unit tests (`node --test`) and static checks (manifest, syntax).
- Pure logic is in `lib/` (settings, filters, seen) and unit-tested. DOM selectors are in `content/content.js` (`SEL`) and `content/styles.css`; fix there when X changes.
- Settings: `chrome.storage.sync` (`settings`). Seen ids: `chrome.storage.local` (`seen`).
- Permissions: `storage` and x.com/twitter.com hosts only. No data leaves the browser.
