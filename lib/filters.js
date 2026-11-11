/* TameFeed v0.1.0 - mute rules, exceptions, tweet classification (UMD) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.XEFilters = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  // Mute rules are one per line (commas are legal in phrases and regexes);
  // handle lists also accept commas.
  function lines(text, splitComma) {
    return String(text || '').split(splitComma ? /[\n,]/ : /\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#'));
  }

  function parseHandles(text) {
    return lines(text, true).map(s => s.replace(/^@/, '').toLowerCase());
  }

  // Rule kinds: {t:'word',v}, {t:'acct',v}, {t:'re',re}
  function parseMutes(text) {
    const rules = [];
    for (const l of lines(text)) {
      const m = l.match(/^\/(.+)\/([a-z]*)$/);
      if (m) {
        try { rules.push({ t: 're', re: new RegExp(m[1], m[2].replace(/[gy]/g, '')) }); } /* g/y make test() stateful */ catch (e) { /* skip invalid regex */ }
      } else if (l.startsWith('@')) rules.push({ t: 'acct', v: l.slice(1).toLowerCase() });
      else rules.push({ t: 'word', v: l.toLowerCase() });
    }
    return rules;
  }

  function shouldMute(rules, post) {
    const text = String(post.text || '');
    const lower = text.toLowerCase();
    const handle = String(post.handle || '').toLowerCase();
    return rules.some(r =>
      r.t === 'word' ? lower.includes(r.v) :
      r.t === 'acct' ? handle === r.v :
      r.re.test(text));
  }

  function isExempt(list, handle) {
    return list.includes(String(handle || '').replace(/^@/, '').toLowerCase());
  }

  function classifyTweet(p) {
    return {
      repost: /reposted/i.test(p.socialContext || ''),
      quote: !!p.hasQuote,
      reply: !!p.isReply,
      ad: !!p.isAd
    };
  }

  return { parseHandles, parseMutes, shouldMute, isExempt, classifyTweet };
});
