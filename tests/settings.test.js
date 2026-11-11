// x_enhancer tests v0.1.0 - settings logic
const test = require('node:test');
const assert = require('node:assert');
const S = require('../lib/settings.js');

test('merge fills defaults and drops unknown keys / invalid values', () => {
  const m = S.merge({ images: 'hide', bogus: 1, videos: 'nonsense', fontSize: 'x' });
  assert.strictEqual(m.images, 'hide');
  assert.strictEqual(m.videos, S.DEFAULTS.videos);
  assert.strictEqual(m.fontSize, S.DEFAULTS.fontSize);
  assert.strictEqual(m.bogus, undefined);
});

test('merge clamps numeric ranges', () => {
  assert.strictEqual(S.merge({ fontSize: 99 }).fontSize, 24);
  assert.strictEqual(S.merge({ columnWidth: 10 }).columnWidth, 400);
});

test('toAttributes returns nothing when master switch is off', () => {
  assert.deepStrictEqual(S.toAttributes(S.merge({ enabled: false, images: 'hide' })), {});
});

test('toAttributes maps options to data-xe attributes', () => {
  const a = S.toAttributes(S.merge({ images: 'hide', videos: 'blur', minimal: true, hideMetrics: true, density: 'compact' }));
  assert.strictEqual(a['data-xe-images'], 'hide');
  assert.strictEqual(a['data-xe-videos'], 'blur');
  assert.strictEqual(a['data-xe-minimal'], '1');
  assert.strictEqual(a['data-xe-metrics'], 'hide');
  assert.strictEqual(a['data-xe-density'], 'compact');
});

test('toAttributes omits attributes for off options', () => {
  const a = S.toAttributes(S.merge({ images: 'off', hideReposts: false }));
  assert.strictEqual(a['data-xe-images'], undefined);
  assert.strictEqual(a['data-xe-hide-reposts'], undefined);
});

test('toCssVars exposes font and width', () => {
  const v = S.toCssVars(S.merge({ fontSize: 17, lineHeight: 1.6, columnWidth: 640 }));
  assert.strictEqual(v['--xe-font-size'], '17px');
  assert.strictEqual(v['--xe-line-height'], '1.6');
  assert.strictEqual(v['--xe-column-width'], '640px');
});

test('toAttributes with peek omits image/video blocking but keeps other options', () => {
  const a = S.toAttributes(S.merge({ images: 'hide', videos: 'blur', minimal: true }), { peek: true });
  assert.strictEqual(a['data-xe-images'], undefined);
  assert.strictEqual(a['data-xe-videos'], undefined);
  assert.strictEqual(a['data-xe-minimal'], '1');
});

test('mediaShortcut defaults on and is boolean-validated', () => {
  assert.strictEqual(S.DEFAULTS.mediaShortcut, true);
  assert.strictEqual(S.merge({ mediaShortcut: 'yes' }).mediaShortcut, true);
  assert.strictEqual(S.merge({ mediaShortcut: false }).mediaShortcut, false);
});

test('collapse attribute follows collapseThreads and master switch', () => {
  assert.strictEqual(S.toAttributes(S.merge({ collapseThreads: true }))['data-xe-collapse'], '1');
  assert.strictEqual(S.toAttributes(S.merge({ collapseThreads: false }))['data-xe-collapse'], undefined);
  assert.strictEqual(S.toAttributes(S.merge({ enabled: false, collapseThreads: true }))['data-xe-collapse'], undefined);
});

test('peek also overrides text-only density so media can show', () => {
  assert.strictEqual(S.toAttributes(S.merge({ density: 'text' }))['data-xe-density'], 'text');
  assert.notStrictEqual(S.toAttributes(S.merge({ density: 'text' }), { peek: true })['data-xe-density'], 'text');
  assert.strictEqual(S.toAttributes(S.merge({ density: 'compact' }), { peek: true })['data-xe-density'], 'compact');
});
