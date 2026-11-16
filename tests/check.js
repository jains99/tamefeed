// TameFeed tests v0.1.0 - static checks: manifest validity, referenced files exist, JS syntax, shortcut/CSS/store-packaging guards
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const root = path.join(__dirname, '..');
const m = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const files = [m.background.service_worker, m.action.default_popup, m.options_ui.page,
  ...m.content_scripts.flatMap(c => [...c.js, ...c.css])];
let bad = 0;
for (const f of files) if (!fs.existsSync(path.join(root, f))) { console.error('missing', f); bad++; }
for (const f of files.filter(f => f.endsWith('.js')).concat(['popup/popup.js'])) {
  const r = cp.spawnSync(process.execPath, ['--check', path.join(root, f)]);
  if (r.status) { console.error('syntax error', f, String(r.stderr)); bad++; }
}
if (bad) process.exit(1);
console.log('static checks ok');

// Guard: X binds many plain letters (e.g. x = block account, b/u/l/r/t/s/n/m...). `v` is the only
// plain-letter shortcut this extension may register; anything else must be added deliberately here.
const content = fs.readFileSync(path.join(root, 'content/content.js'), 'utf8');
const keysUsed = [...content.matchAll(/isPlainKey\([^,]+,\s*'(.)'\)/g)].map(m => m[1]);
if (keysUsed.length !== 1 || keysUsed[0] !== 'v') {
  console.error('unexpected plain-key shortcuts in content.js:', keysUsed.join(','));
  process.exit(1);
}
console.log('shortcut guard ok');

// Guard: a negative margin on the action row ([role="group"]) pulled it over the post text in compact density.
const stylesCss = fs.readFileSync(path.join(root, 'content/styles.css'), 'utf8');
if (/\[role="group"\]\s*\{[^}]*margin-top:\s*-/.test(stylesCss)) {
  console.error('styles.css: negative margin-top on [role="group"] makes the action row overlap post text');
  process.exit(1);
}
console.log('overlap guard ok');

// Guard: Chrome Web Store packaging. Icons must be declared and be real PNGs of the stated size,
// host_permissions stays out (content_scripts.matches already grants access), the description must not
// name third-party products, and a privacy policy must exist.
let storeBad = 0;
for (const size of ['16', '32', '48', '128']) {
  const f = m.icons && m.icons[size];
  if (!f || !fs.existsSync(path.join(root, f))) { console.error('missing icon', size); storeBad++; continue; }
  const b = fs.readFileSync(path.join(root, f));
  const isPng = b.subarray(1, 4).toString() === 'PNG';
  if (!isPng || b.readUInt32BE(16) !== +size || b.readUInt32BE(20) !== +size) { console.error('icon is not a', size, 'px PNG:', f); storeBad++; }
}
if (m.host_permissions) { console.error('manifest: host_permissions is redundant, remove it'); storeBad++; }
if (/apollo|media blocker/i.test(m.description)) { console.error('manifest: description names a third-party product'); storeBad++; }
if (m.description.length > 132) { console.error('manifest: description over 132 characters'); storeBad++; }
if (!fs.existsSync(path.join(root, 'PRIVACY.md'))) { console.error('missing PRIVACY.md'); storeBad++; }
if (storeBad) process.exit(1);
console.log('store packaging guard ok');
