/* X Enhancer v0.1.0 - content script: applies settings as html attributes and
 * processes tweets (mutes, reposts/quotes/replies, ads, exceptions, seen, collapse).
 * All DOM selectors live in SEL so X markup changes are a one-line fix. */
(function () {
  'use strict';
  const Settings = self.XESettings, Filters = self.XEFilters, Seen = self.XESeen;
  const SEEN_CAP = 5000;

  const SEL = {
    tweet: 'article[data-testid="tweet"]',
    cell: '[data-testid="cellInnerDiv"]',
    userName: '[data-testid="User-Name"]',
    text: '[data-testid="tweetText"]',
    social: '[data-testid="socialContext"]',
    media: '[data-testid="tweetPhoto"], [data-testid="videoPlayer"], [data-testid="card.wrapper"]'
  };

  let settings = Settings.merge();
  let muteRules = [], exemptions = [];
  let seenList = [], seenAtLoad = new Set(), seenDirty = false;
  let io = null, timer = null, followingDone = false;
  const root = document.documentElement;

  /* ---------- settings -> DOM ---------- */
  function applySettings() {
    for (const n of root.getAttributeNames()) if (n.startsWith('data-xe-')) root.removeAttribute(n);
    const attrs = Settings.toAttributes(settings);
    for (const k in attrs) root.setAttribute(k, attrs[k]);
    const vars = Settings.toCssVars(settings);
    for (const k in vars) root.style.setProperty(k, vars[k]);
    if (!settings.accent) root.style.removeProperty('--xe-accent');
    muteRules = Filters.parseMutes(settings.mutes);
    exemptions = Filters.parseHandles(settings.exceptions);
    followingDone = false;
    document.querySelectorAll(SEL.tweet).forEach(a => { a.removeAttribute('data-xe-done'); process(a); });
    schedule();
  }

  /* ---------- per-tweet processing ---------- */
  function handleOf(a) {
    const links = a.querySelectorAll(SEL.userName + ' a[href^="/"]');
    const href = links.length ? links[links.length - 1].getAttribute('href') : '';
    return href.split('/')[1] || '';
  }
  function idOf(a) {
    const t = a.querySelector('a[href*="/status/"] time');
    const m = t && t.parentElement.getAttribute('href').match(/status\/(\d+)/);
    return m ? m[1] : null;
  }
  function isAd(a) {
    for (const s of a.querySelectorAll('span')) {
      if (s.children.length === 0 && (s.textContent === 'Ad' || s.textContent === 'Promoted')) return true;
    }
    return false;
  }

  function process(a) {
    if (!settings.enabled) { const c = a.closest(SEL.cell); if (c) c.removeAttribute('data-xe-hide'); return; }
    if (a.getAttribute('data-xe-done') === '1') return;
    a.setAttribute('data-xe-done', '1');
    const cell = a.closest(SEL.cell) || a;
    const handle = handleOf(a);
    const onStatusPage = /\/status\//.test(location.pathname);
    const cls = Filters.classifyTweet({
      socialContext: (a.querySelector(SEL.social) || {}).textContent,
      hasQuote: !!a.querySelector('div[role="link"] ' + SEL.userName),
      isReply: !onStatusPage && /Replying to/.test(a.textContent),
      isAd: settings.hideAds && isAd(a)
    });
    const txt = (a.querySelector(SEL.text) || {}).innerText || '';
    const hide =
      cls.ad ||
      (settings.hideReposts && cls.repost) ||
      (settings.hideQuotes && cls.quote) ||
      (settings.hideReplies && cls.reply) ||
      Filters.shouldMute(muteRules, { text: txt, handle });
    hide ? cell.setAttribute('data-xe-hide', '1') : cell.removeAttribute('data-xe-hide');

    if (Filters.isExempt(exemptions, handle)) a.setAttribute('data-xe-exempt', '1');
    else a.removeAttribute('data-xe-exempt');

    const id = idOf(a);
    if (id) {
      a.setAttribute('data-xe-id', id);
      if (settings.seen !== 'off' && seenAtLoad.has(id)) cell.setAttribute('data-xe-seen', '1');
      if (io && settings.seen !== 'off') io.observe(a);
    }
    if (settings.collapseThreads && !a.querySelector('.xe-collapse')) addCollapseButton(a);
  }

  function addCollapseButton(a) {
    const g = a.querySelector(SEL.userName);
    if (!g) return;
    const b = document.createElement('button');
    b.className = 'xe-collapse';
    b.type = 'button';
    b.title = 'Collapse post (x)';
    b.textContent = '–';
    b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleCollapse(a); });
    g.appendChild(b);
  }
  function toggleCollapse(a) {
    a.hasAttribute('data-xe-collapsed') ? a.removeAttribute('data-xe-collapsed') : a.setAttribute('data-xe-collapsed', '1');
  }

  /* ---------- seen tracking ---------- */
  function setupSeen() {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting && e.boundingClientRect.bottom < 0) {
          const id = e.target.getAttribute('data-xe-id');
          if (id) { seenList = Seen.add(seenList, id, SEEN_CAP); seenDirty = true; }
        }
      }
    }, { threshold: 0 });
    setInterval(() => {
      if (seenDirty) { seenDirty = false; chrome.storage.local.set({ seen: seenList }); }
    }, 3000);
  }

  /* ---------- misc ---------- */
  function openFollowingTab() {
    if (!settings.enabled || !settings.followingTab || followingDone || location.pathname !== '/home') return;
    for (const t of document.querySelectorAll('[role="tab"]')) {
      if (t.textContent.trim() === 'Following') {
        followingDone = true;
        if (t.getAttribute('aria-selected') !== 'true') t.click();
        return;
      }
    }
  }

  function tick() {
    timer = null;
    document.querySelectorAll(SEL.tweet + ':not([data-xe-done])').forEach(process);
    openFollowingTab();
  }
  function schedule() { if (!timer) timer = setTimeout(tick, 150); }

  // Click-to-reveal for blurred media
  document.addEventListener('click', (e) => {
    const m = e.target.closest && e.target.closest('[data-testid="tweetPhoto"], [data-testid="videoPlayer"]');
    if (!m) return;
    const mode = m.matches('[data-testid="tweetPhoto"]') ? 'data-xe-images' : 'data-xe-videos';
    if (root.getAttribute(mode) === 'blur' && !m.hasAttribute('data-xe-reveal') && !m.closest('[data-xe-exempt]')) {
      e.preventDefault(); e.stopPropagation();
      m.setAttribute('data-xe-reveal', '1');
    }
  }, true);

  // 'x' collapses the focused (or first visible) post. X natively handles j/k/l.
  document.addEventListener('keydown', (e) => {
    if (!settings.enabled || !settings.keyboard || e.key !== 'x') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    let a = document.activeElement && document.activeElement.closest && document.activeElement.closest(SEL.tweet);
    if (!a) a = [...document.querySelectorAll(SEL.tweet)].find(x => x.getBoundingClientRect().bottom > 80);
    if (a) toggleCollapse(a);
  });

  /* ---------- boot ---------- */
  function boot() {
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
    setupSeen();
    chrome.storage.local.get('seen', (r) => {
      seenList = Array.isArray(r.seen) ? r.seen : [];
      seenAtLoad = new Set(seenList);
      schedule();
    });
    chrome.storage.sync.get('settings', (r) => { settings = Settings.merge(r.settings); applySettings(); });
    chrome.storage.onChanged.addListener((ch, area) => {
      if (area === 'sync' && ch.settings) { settings = Settings.merge(ch.settings.newValue); applySettings(); }
    });
  }
  boot();
})();
