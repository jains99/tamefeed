/* X Enhancer v0.1.0 - find the wrapper "box" around a media element (UMD).
 * Hiding only the image/video leaves its rounded, bordered, aspect-ratio wrapper behind
 * as an empty box, so we hide the outermost ancestor that holds nothing but the media. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.XEMediaBox = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  // climbs from `el` while the parent is not `article` and `sharedWithOther(parent)` is false
  // (i.e. the parent holds no tweet text, name or action bar). Returns `el` if `article` is never reached.
  function mediaBox(el, article, sharedWithOther) {
    let n = el;
    while (n.parentElement && n.parentElement !== article && !sharedWithOther(n.parentElement)) n = n.parentElement;
    return n.parentElement === article || (n.parentElement && sharedWithOther(n.parentElement)) ? n : el;
  }
  return { mediaBox };
});
