// x_enhancer tests v0.1.0 - finding the wrapper box around a media element
const test = require('node:test');
const assert = require('node:assert');
const MB = require('../lib/mediabox.js');

const node = (name, parent, shared = false) => ({ name, parentElement: parent, shared });

test('returns the outermost wrapper that holds only the media', () => {
  const article = node('article', null);
  const a = node('a', article), b = node('b', a), media = node('media', b);
  assert.strictEqual(MB.mediaBox(media, article, () => false), a);
});

test('stops below an ancestor that also holds text/actions', () => {
  const article = node('article', null);
  const x = node('x', article, true), a = node('a', x), b = node('b', a), media = node('media', b);
  assert.strictEqual(MB.mediaBox(media, article, p => p.shared), a);
});

test('media that is a direct child of the article is returned as-is', () => {
  const article = node('article', null);
  const media = node('media', article);
  assert.strictEqual(MB.mediaBox(media, article, () => false), media);
});

test('detached media (no article ancestor) is returned as-is', () => {
  const media = node('media', node('p', null));
  assert.strictEqual(MB.mediaBox(media, node('article', null), () => false), media);
});

test('quoted-tweet media stops below the quote wrapper', () => {
  const article = node('article', null);
  const quote = node('quote', node('mid', article), true); // quote holds its own text
  const box = node('box', quote), media = node('media', box);
  assert.strictEqual(MB.mediaBox(media, article, p => p.shared), box);
});
