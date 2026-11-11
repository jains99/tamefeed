// TameFeed tests v0.1.0 - shortcut key matching
const test = require('node:test');
const assert = require('node:assert');
const K = require('../lib/keys.js');

test('plain key matches', () => assert.ok(K.isPlainKey({ key: 'v', tagName: 'DIV' }, 'v')));
test('wrong key does not match', () => assert.ok(!K.isPlainKey({ key: 'b', tagName: 'DIV' }, 'v')));
test('modifiers are rejected', () => {
  for (const m of ['ctrlKey', 'metaKey', 'altKey', 'shiftKey'])
    assert.ok(!K.isPlainKey({ key: 'v', tagName: 'DIV', [m]: true }, 'v'), m);
});
test('typing targets are rejected', () => {
  for (const t of ['INPUT', 'TEXTAREA', 'SELECT'])
    assert.ok(!K.isPlainKey({ key: 'v', tagName: t }, 'v'), t);
  assert.ok(!K.isPlainKey({ key: 'v', tagName: 'DIV', isContentEditable: true }, 'v'));
});

test('Caps Lock (uppercase key) still matches', () => assert.ok(K.isPlainKey({ key: 'V', code: 'KeyV', tagName: 'DIV' }, 'v')));
test('non-Latin layouts match by physical key code', () => assert.ok(K.isPlainKey({ key: 'м', code: 'KeyV', tagName: 'DIV' }, 'v')));
test('Shift+V is still rejected', () => assert.ok(!K.isPlainKey({ key: 'V', code: 'KeyV', shiftKey: true, tagName: 'DIV' }, 'v')));
