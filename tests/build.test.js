// TameFeed tests v0.1.0 - Web Store zip contents (scripts/build.js)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs'), path = require('node:path');
const { packageFiles } = require('../scripts/build.js');
const root = path.join(__dirname, '..');
const m = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

test('package contains every file the manifest references', () => {
  const files = packageFiles(root);
  const needed = ['manifest.json', m.background.service_worker, m.action.default_popup, 'popup/popup.js', 'popup/popup.css',
    ...Object.values(m.icons || {}), ...m.content_scripts.flatMap(c => [...c.js, ...c.css])];
  for (const f of needed) assert.ok(files.includes(f), 'missing from package: ' + f);
});

test('package contains only runtime files', () => {
  for (const f of packageFiles(root)) {
    assert.match(f, /^(manifest\.json|background\.js|(content|lib|popup|icons)\/[^/]+)$/, 'unexpected file: ' + f);
  }
});
