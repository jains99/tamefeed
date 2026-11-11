// x_enhancer tests v0.1.0 - filters, exceptions, seen-set
const test = require('node:test');
const assert = require('node:assert');
const F = require('../lib/filters.js');
const Seen = require('../lib/seen.js');

test('parseList ignores blanks/comments, normalises handles', () => {
  assert.deepStrictEqual(F.parseHandles('@Foo\n\n# c\nbar, @BAZ'), ['foo', 'bar', 'baz']);
});

test('parseMutes handles words, @accounts and /regex/', () => {
  const r = F.parseMutes('crypto\n@spammer\n/gi+veaway/i\n# note');
  assert.strictEqual(r.length, 3);
});

test('shouldMute matches keyword case-insensitively', () => {
  const r = F.parseMutes('Crypto');
  assert.ok(F.shouldMute(r, { text: 'big CRYPTO news', handle: 'a' }));
  assert.ok(!F.shouldMute(r, { text: 'hello', handle: 'a' }));
});

test('shouldMute matches account and regex', () => {
  const r = F.parseMutes('@spammer\n/gi+veaway/i');
  assert.ok(F.shouldMute(r, { text: 'x', handle: 'Spammer' }));
  assert.ok(F.shouldMute(r, { text: 'GIIIVEAWAY now', handle: 'a' }));
});

test('invalid regex is skipped, not thrown', () => {
  assert.doesNotThrow(() => F.parseMutes('/(unclosed/'));
  assert.strictEqual(F.parseMutes('/(unclosed/').length, 0);
});

test('isExempt checks handle list', () => {
  const ex = F.parseHandles('@alice');
  assert.ok(F.isExempt(ex, 'Alice'));
  assert.ok(!F.isExempt(ex, 'bob'));
});

test('classifyTweet detects repost/quote/reply/ad', () => {
  assert.deepStrictEqual(F.classifyTweet({ socialContext: 'Bob reposted', hasQuote: false, isReply: false, isAd: false }),
    { repost: true, quote: false, reply: false, ad: false });
  assert.ok(F.classifyTweet({ hasQuote: true }).quote);
  assert.ok(F.classifyTweet({ isReply: true }).reply);
  assert.ok(F.classifyTweet({ isAd: true }).ad);
});

test('seen add dedupes and caps, evicting oldest', () => {
  let l = [];
  l = Seen.add(l, '1', 3); l = Seen.add(l, '2', 3); l = Seen.add(l, '1', 3);
  assert.deepStrictEqual(l, ['2', '1']);
  l = Seen.add(l, '3', 3); l = Seen.add(l, '4', 3);
  assert.deepStrictEqual(l, ['1', '3', '4']);
});

test('regex g/y flags are stripped so matching is stateless', () => {
  const r = F.parseMutes('/giveaway/gi');
  const post = { text: 'GIVEAWAY today', handle: 'a' };
  assert.ok(F.shouldMute(r, post));
  assert.ok(F.shouldMute(r, post));
  assert.ok(F.shouldMute(r, post));
});

test('mute rules split on newlines only, so commas survive', () => {
  assert.strictEqual(F.parseMutes('hello, world').length, 1);
  const r = F.parseMutes('/a{1,3}b/i');
  assert.strictEqual(r.length, 1);
  assert.ok(F.shouldMute(r, { text: 'xAAb', handle: 'q' }));
});

test('handle lists still accept commas', () => {
  assert.deepStrictEqual(F.parseHandles('a, @b\nc'), ['a', 'b', 'c']);
});
