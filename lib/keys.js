/* X Enhancer v0.1.0 - shortcut key matching (UMD) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.XEKeys = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  // True for an unmodified press of `key` that is not aimed at a text field.
  // `ev` is a KeyboardEvent-like: {key, ctrlKey, metaKey, altKey, shiftKey, tagName, isContentEditable}.
  function isPlainKey(ev, key) {
    // match the typed character (any case, so Caps Lock works) or the physical key (non-Latin layouts)
    if (String(ev.key).toLowerCase() !== key && ev.code !== 'Key' + key.toUpperCase()) return false;
    if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) return false;
    if (ev.isContentEditable) return false;
    return !/^(INPUT|TEXTAREA|SELECT)$/.test(ev.tagName || '');
  }
  return { isPlainKey };
});
