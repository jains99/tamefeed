/* X Enhancer v0.1.0 - service worker: Alt+M master toggle */
importScripts('lib/settings.js');

chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== 'toggle-enabled') return;
  const { settings } = await chrome.storage.sync.get('settings');
  const s = self.XESettings.merge(settings);
  await chrome.storage.sync.set({ settings: Object.assign({}, s, { enabled: !s.enabled }) });
});
