/* X Enhancer v0.1.0 - bounded seen-post id list, oldest evicted first (UMD) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.XESeen = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function add(list, id, cap) {
    const out = list.filter(x => x !== id);
    out.push(id);
    return out.length > cap ? out.slice(out.length - cap) : out;
  }
  return { add };
});
