/* X Enhancer v0.1.0 - popup/options UI (single page, sectioned): binds [data-key] controls to chrome.storage.sync */
(function () {
  const S = window.XESettings;
  let settings = S.merge();

  const controls = document.querySelectorAll('[data-key]');

  function render() {
    controls.forEach((el) => {
      const v = settings[el.dataset.key];
      if (el.type === 'checkbox') el.checked = !!v;
      else if (el.type === 'color') el.value = v || '#1d9bf0';
      else el.value = v;
    });
  }

  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => chrome.storage.sync.set({ settings }), 200);
  }

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

  chrome.storage.sync.get('settings', (r) => { settings = S.merge(r.settings); render(); });
  chrome.storage.onChanged.addListener((ch, area) => {
    if (area === 'sync' && ch.settings) { settings = S.merge(ch.settings.newValue); render(); }
  });
})();
