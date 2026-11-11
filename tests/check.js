// x_enhancer tests v0.1.0 - static checks: manifest validity, referenced files exist, JS syntax
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
