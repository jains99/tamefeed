// x_enhancer e2e v0.1.0 - loads the unpacked extension in Chromium and checks the 'v' peek on a live post.
// Needs network + playwright-core (not part of `npm test`):
//   NODE_PATH=<dir>/node_modules node tests/e2e/peek.e2e.js <post-url> [images-mode] [out-dir]
const { chromium } = require('playwright-core');
const os = require('os'), fs = require('fs'), path = require('path');

const url = process.argv[2];
const mode = process.argv[3] || 'hide';
const out = process.argv[4] || os.tmpdir();
const ext = path.resolve(__dirname, '../..');
const exe = process.env.CHROMIUM || path.join(os.homedir(), '.cache/ms-playwright/chromium-1248/chrome-linux64/chrome');

(async () => {
  const ctx = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'xe-')), {
    executablePath: exe, headless: false, viewport: { width: 1280, height: 1000 },
    args: ['--headless=new', '--no-sandbox', `--disable-extensions-except=${ext}`, `--load-extension=${ext}`]
  });
  let sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  await sw.evaluate((m) => chrome.storage.local.set({ settings: { images: m, videos: m } }), mode);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (/xe|enhancer/i.test(m.text())) console.log('console:', m.text()); });
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('article', { timeout: 30000 }).catch(() => console.log('no article found'));
  await page.waitForTimeout(4000);

  const snap = (label) => page.evaluate((label) => {
    const attrs = {}; for (const n of document.documentElement.getAttributeNames()) if (n.startsWith('data-xe')) attrs[n] = document.documentElement.getAttribute(n);
    const info = (sel) => [...document.querySelectorAll(sel)].map((e) => {
      const cs = getComputedStyle(e), r = e.getBoundingClientRect();
      return { display: cs.display, filter: cs.filter, w: Math.round(r.width), h: Math.round(r.height), box: e.getAttribute('data-xe-box') };
    });
    return { label, attrs, photos: info('[data-testid="tweetPhoto"]'), videos: info('[data-testid="videoPlayer"]'),
      boxes: [...document.querySelectorAll('[data-xe-box]')].map((e) => ({ kind: e.getAttribute('data-xe-box'), display: getComputedStyle(e).display, h: Math.round(e.getBoundingClientRect().height) })),
      articles: document.querySelectorAll('article').length, toast: !!document.querySelector('.xe-toast') };
  }, label);

  console.log(JSON.stringify(await snap('before v'), null, 1));
  await page.screenshot({ path: path.join(out, 'before.png') });
  await page.mouse.click(5, 500).catch(() => {});
  await page.keyboard.press('v');
  await page.waitForTimeout(800);
  console.log(JSON.stringify(await snap('after v'), null, 1));
  await page.screenshot({ path: path.join(out, 'after.png') });
  await ctx.close();
})().catch((e) => { console.error(e); process.exit(1); });
