<h1><img src="icons/icon48.png" alt="" width="32" height="32"> TameFeed</h1>

A Chrome extension that blocks media, hides clutter and gives X (x.com / twitter.com) a minimal, distraction-free reading layout.

Unofficial; not affiliated with X Corp.

## Install
**Chrome Web Store:** [Install TameFeed](https://chromewebstore.google.com/detail/tamefeed/mlaambbjfpbjdmfbaamclapnfcdffjnj)

**From source:**
1. Download or clone this repository.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the repository folder.
4. Pin the toolbar icon. **Alt+M** toggles everything (rebind at `chrome://extensions/shortcuts`).

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

## Privacy
TameFeed makes no network requests. Your settings and the ids of posts you have seen stay in your browser's local extension storage, and nothing is collected or shared. See [PRIVACY.md](PRIVACY.md).

## Develop
- `npm test` runs unit tests (`node --test`) and static checks (manifest, syntax).
- Pure logic is in `lib/` (settings, filters, seen) and unit-tested. DOM selectors are in `content/content.js` (`SEL`) and `content/styles.css`; fix there when X changes.
- Settings: `chrome.storage.local` (`settings`; local rather than sync because sync's 8 KB per-item quota breaks long mute lists, so settings do not follow you across devices). Seen ids: `chrome.storage.local` (`seen`).
- Permissions: `storage`, plus content scripts on x.com/twitter.com only (no `host_permissions`; the content script `matches` already grant access). No data leaves the browser; see [PRIVACY.md](PRIVACY.md).
