/* TameFeed v0.1.0 - settings schema, validation, attribute mapping (UMD) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.XESettings = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const DEFAULTS = {
    enabled: true,
    images: 'blur',        // off | hide | blur
    videos: 'blur',        // off | hide | blur
    hideTrending: true,
    hideWhoToFollow: true,
    minimal: false,
    density: 'large',      // large | compact | text
    seen: 'off',           // off | dim | hide
    mediaShortcut: true,   // 'v' peeks at all blocked media
    collapseThreads: true,
    hideReposts: false,
    hideQuotes: false,
    hideReplies: false,
    hideAds: true,
    followingTab: false,
    theme: 'default',      // default | amoled | sepia | nord | solarized
    accent: '',            // css colour or ''
    fontFamily: 'default', // default | serif | mono | system
    fontSize: 15,
    lineHeight: 1.4,
    columnWidth: 600,
    hideMetrics: false,
    mutes: '',
    exceptions: ''
  };

  const ENUMS = {
    images: ['off', 'hide', 'blur'],
    videos: ['off', 'hide', 'blur'],
    density: ['large', 'compact', 'text'],
    seen: ['off', 'dim', 'hide'],
    theme: ['default', 'amoled', 'sepia', 'nord', 'solarized'],
    fontFamily: ['default', 'serif', 'mono', 'system']
  };
  const RANGES = { fontSize: [12, 24], lineHeight: [1.1, 2], columnWidth: [400, 900] };

  function merge(stored) {
    const out = Object.assign({}, DEFAULTS);
    if (!stored || typeof stored !== 'object') return out;
    for (const k of Object.keys(DEFAULTS)) {
      if (!(k in stored)) continue;
      const v = stored[k], d = DEFAULTS[k];
      if (ENUMS[k]) { if (ENUMS[k].includes(v)) out[k] = v; }
      else if (RANGES[k]) {
        if (typeof v === 'number' && isFinite(v)) out[k] = Math.min(RANGES[k][1], Math.max(RANGES[k][0], v));
      } else if (typeof d === 'boolean') { if (typeof v === 'boolean') out[k] = v; }
      else if (typeof d === 'string') { if (typeof v === 'string') out[k] = v; }
    }
    return out;
  }

  // opts.peek: temporarily show all blocked media (not persisted)
  function toAttributes(s, opts) {
    const peek = !!(opts && opts.peek);
    const a = {};
    if (!s.enabled) return a;
    a['data-xe-on'] = '1';
    if (!peek && s.images !== 'off') a['data-xe-images'] = s.images;
    if (!peek && s.videos !== 'off') a['data-xe-videos'] = s.videos;
    if (s.hideTrending) a['data-xe-trending'] = 'hide';
    if (s.hideWhoToFollow) a['data-xe-wtf'] = 'hide';
    if (s.minimal) a['data-xe-minimal'] = '1';
    // text-only density hides media with its own rule, so peek must lift it too
    a['data-xe-density'] = peek && s.density === 'text' ? 'large' : s.density;
    if (s.seen !== 'off') a['data-xe-seen'] = s.seen;
    if (s.hideReposts) a['data-xe-hide-reposts'] = '1';
    if (s.hideQuotes) a['data-xe-hide-quotes'] = '1';
    if (s.hideReplies) a['data-xe-hide-replies'] = '1';
    if (s.hideAds) a['data-xe-hide-ads'] = '1';
    if (s.theme !== 'default') a['data-xe-theme'] = s.theme;
    if (s.fontFamily !== 'default') a['data-xe-font'] = s.fontFamily;
    if (s.hideMetrics) a['data-xe-metrics'] = 'hide';
    if (s.collapseThreads) a['data-xe-collapse'] = '1';
    return a;
  }

  function toCssVars(s) {
    const v = {
      '--xe-font-size': s.fontSize + 'px',
      '--xe-line-height': String(s.lineHeight),
      '--xe-column-width': s.columnWidth + 'px'
    };
    if (s.accent) v['--xe-accent'] = s.accent;
    return v;
  }

  return { DEFAULTS, merge, toAttributes, toCssVars };
});
