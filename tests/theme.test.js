// x_enhancer tests v0.1.0 - every theme palette in styles.css must be readable (WCAG AA 4.5:1)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '../content/styles.css'), 'utf8');
const lum = (h) => {
  const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(x => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const vars = (block) => Object.fromEntries([...block.matchAll(/--xe-([a-z]+)\s*:\s*(#[0-9a-fA-F]{6})/g)].map(m => [m[1], m[2]]));

const baseAccent = vars(css.match(/html\[data-xe-theme\]\s*\{([^}]*)\}/)[1]).accent;
const themes = {};
for (const m of css.matchAll(/html\[data-xe-theme="(\w+)"\]\s*\{([^}]*)\}/g)) themes[m[1]] = vars(m[2]);

test('all four themes are defined', () => {
  assert.deepStrictEqual(Object.keys(themes).sort(), ['amoled', 'nord', 'sepia', 'solarized']);
});

for (const name of ['amoled', 'sepia', 'nord', 'solarized']) {
  test(`${name}: text, muted text and accent meet 4.5:1 on the background`, () => {
    const t = themes[name];
    for (const k of ['bg', 'fg', 'muted']) assert.ok(t[k], `${name} defines --xe-${k}`);
    const accent = t.accent || baseAccent;
    assert.ok(contrast(t.bg, t.fg) >= 4.5, `${name} fg ${contrast(t.bg, t.fg).toFixed(2)}`);
    assert.ok(contrast(t.bg, t.muted) >= 4.5, `${name} muted ${contrast(t.bg, t.muted).toFixed(2)}`);
    assert.ok(contrast(t.bg, accent) >= 4.5, `${name} accent ${contrast(t.bg, accent).toFixed(2)}`);
  });
}
