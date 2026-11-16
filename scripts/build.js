// TameFeed v0.1.0 - builds the Chrome Web Store upload: dist/tamefeed-<version>.zip (runtime files only).
// Run: npm run build (needs the `zip` CLI).
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');

const TOP_FILES = ['manifest.json', 'background.js'];
const DIRS = ['content', 'lib', 'popup', 'icons'];

// Everything that ships: tests, docs, session logs and scripts stay out.
function packageFiles(root) {
  const files = TOP_FILES.slice();
  for (const dir of DIRS) {
    for (const name of fs.readdirSync(path.join(root, dir)).sort()) files.push(dir + '/' + name);
  }
  return files;
}

if (require.main === module) {
  const root = path.join(__dirname, '..');
  const { version } = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const out = path.join(root, 'dist', 'tamefeed-' + version + '.zip');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.rmSync(out, { force: true });
  const r = cp.spawnSync('zip', ['-X', '-q', out, ...packageFiles(root)], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
  console.log('built', path.relative(root, out));
}

module.exports = { packageFiles };
