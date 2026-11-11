/* TameFeed v0.1.0 - popup/options UI (single page, sectioned): binds [data-key] controls to chrome.storage.local */
(function () {
  const S = window.XESettings;
  let settings = S.merge();

  const controls = document.querySelectorAll('[data-key]');

  // Skip the control being edited so an incoming storage event never overwrites typing.
  function render() {
    controls.forEach((el) => {
      if (el === document.activeElement && el.tagName !== 'SELECT') return;
      const v = settings[el.dataset.key];
      if (el.type === 'checkbox') el.checked = !!v;
      else if (el.type === 'color') el.value = v || '#1d9bf0';
      else el.value = v;
    });
  }

  // Debounced save (sliders/typing fire many events), flushed when the popup closes
  // so a quick toggle-then-click-away is not lost.
  let saveTimer = null, lastSaved = '';
  function flush() {
    if (saveTimer === null) return;
    clearTimeout(saveTimer);
    saveTimer = null;
    lastSaved = JSON.stringify(settings);
    chrome.storage.local.set({ settings });
  }
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 200);
  }
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });

  controls.forEach((el) => {
    el.addEventListener(el.tagName === 'TEXTAREA' || el.type === 'range' ? 'input' : 'change', () => {
      const k = el.dataset.key;
      if (el.type === 'checkbox') settings[k] = el.checked;
      else if (el.type === 'range') settings[k] = parseFloat(el.value);
      else settings[k] = el.value;
      settings = S.merge(settings);
      save();
    });
  });

  chrome.storage.local.get('settings', (r) => { settings = S.merge(r.settings); render(); });
  chrome.storage.onChanged.addListener((ch, area) => {
    if (area !== 'local' || !ch.settings) return;
    if (JSON.stringify(S.merge(ch.settings.newValue)) === lastSaved) return; // echo of our own save
    settings = S.merge(ch.settings.newValue);
    render();
  });
})();
