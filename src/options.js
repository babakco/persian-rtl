/*! Persian-RTL — options page */

const SITE_PREFIX = 'vz-site-';
const DEFAULTS = {
  enabled: true,
  disabledSites: [],
  customSites: [],
  autoDetect: false,
  allSites: false,
};

const $ = (id) => document.getElementById(id);
const SITES = Array.isArray(globalThis.VZ_SITES) ? globalThis.VZ_SITES : [];
const H = globalThis.VZ_HELPERS || {};

let config = { ...DEFAULTS };
let query = '';

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function toFa(value) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

function setStatus(text, kind = '') {
  $('status').textContent = text || '';
  $('status').className = 'status' + (kind ? ' ' + kind : '');
}

function patternsFor(host) {
  if (typeof H.patternsFor === 'function') return H.patternsFor(host);
  const bare = host.replace(/^\*\./, '');
  return [`*://*.${bare}/*`];
}

function normalizeHost(raw) {
  let value = (raw || '').trim().toLowerCase();
  if (!value) return '';
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, ''); // drop scheme
  value = value.replace(/^www\./, '');
  value = value.split('/')[0].split('?')[0].split('#')[0];
  value = value.replace(/:\d+$/, ''); // drop port

  if (value === 'localhost') return value;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return value;
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(value)) return '';
  if (!/[a-z]{2,}$/.test(value)) return '';
  return value;
}

function siteLabel(host) {
  const match = SITES.find((s) => H.hostMatches ? H.hostMatches(host, s.host) : s.host === host);
  return match ? match.label : host;
}

/* ------------------------------------------------------------------ *
 * state
 * ------------------------------------------------------------------ */

async function loadConfig() {
  const stored = await chrome.storage.sync.get(DEFAULTS);
  config = {
    enabled: stored.enabled !== false,
    disabledSites: Array.isArray(stored.disabledSites) ? stored.disabledSites.slice() : [],
    customSites: Array.isArray(stored.customSites) ? stored.customSites.slice() : [],
    autoDetect: stored.autoDetect === true,
    allSites: stored.allSites === true,
  };
}

/** Sites that are currently on, defaults first. */
function activeEntries() {
  const list = [];
  for (const site of SITES) {
    if (config.disabledSites.includes(site.id)) continue;
    list.push({ kind: 'default', id: site.id, host: site.host, label: site.label });
  }
  for (const host of config.customSites) {
    if (list.some((entry) => entry.host === host)) continue;
    list.push({ kind: 'custom', id: host, host, label: siteLabel(host) });
  }
  return list;
}

/* ------------------------------------------------------------------ *
 * rendering
 * ------------------------------------------------------------------ */

function render() {
  $('enabled').checked = config.enabled;
  $('enabledText').textContent = config.enabled ? 'روشن' : 'خاموش';
  $('autoDetect').checked = config.autoDetect;
  $('allSites').checked = config.allSites;

  const all = activeEntries();
  $('count').textContent = `${toFa(all.length)} سایت`;

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? all.filter((entry) =>
        entry.host.toLowerCase().includes(needle) || entry.label.toLowerCase().includes(needle)
      )
    : all;

  const list = $('siteList');
  list.textContent = '';

  if (!shown.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = needle ? 'سایتی با این نام پیدا نشد.' : 'هیچ سایتی فعال نیست.';
    list.appendChild(li);
  } else {
    for (const entry of shown) {
      const li = document.createElement('li');

      const info = document.createElement('div');
      info.className = 'row-info';

      const name = document.createElement('span');
      name.className = 'row-name';
      name.textContent = entry.label;
      if (entry.kind === 'custom') {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = 'دلخواه';
        name.appendChild(tag);
      }

      const host = document.createElement('span');
      host.className = 'row-host';
      host.textContent = entry.host.replace(/^\*\./, '');

      info.append(name, host);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'link danger';
      remove.textContent = 'حذف';
      remove.addEventListener('click', () => removeEntry(entry));

      li.append(info, remove);
      list.appendChild(li);
    }
  }

  const removed = SITES.filter((site) => config.disabledSites.includes(site.id));
  $('removedCard').hidden = removed.length === 0;

  const removedList = $('removedList');
  removedList.textContent = '';
  for (const site of removed) {
    const li = document.createElement('li');

    const label = document.createElement('span');
    label.textContent = site.label;

    const host = document.createElement('span');
    host.className = 'host';
    host.textContent = site.host.replace(/^\*\./, '');

    const back = document.createElement('button');
    back.type = 'button';
    back.textContent = 'بازگردانی';
    back.addEventListener('click', () => restoreSite(site.id));

    li.append(label, host, back);
    removedList.appendChild(li);
  }
}

/* ------------------------------------------------------------------ *
 * actions
 * ------------------------------------------------------------------ */

async function removeEntry(entry) {
  if (entry.kind === 'default') {
    config.disabledSites = [...config.disabledSites, entry.id];
    await chrome.storage.sync.set({ disabledSites: config.disabledSites });
    setStatus(`«${entry.label}» از فهرست حذف شد.`, 'ok');
    render();
    return;
  }

  const id = SITE_PREFIX + entry.host;
  try {
    const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [id] });
    if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: [id] });
  } catch (_) { /* ignore */ }
  try {
    await chrome.permissions.remove({ origins: patternsFor(entry.host) });
  } catch (_) { /* ignore */ }

  config.customSites = config.customSites.filter((host) => host !== entry.host);
  await chrome.storage.sync.set({ customSites: config.customSites });
  setStatus(`«${entry.host}» حذف شد.`, 'ok');
  render();
}

async function restoreSite(id) {
  config.disabledSites = config.disabledSites.filter((entry) => entry !== id);
  await chrome.storage.sync.set({ disabledSites: config.disabledSites });
  setStatus('سایت به فهرست برگشت.', 'ok');
  render();
}

async function addSite(raw) {
  const host = normalizeHost(raw);
  if (!host) {
    setStatus('دامنهٔ معتبر وارد کنید؛ مثلاً chat.example.com', 'err');
    return;
  }

  const builtin = SITES.find((site) =>
    H.hostMatches ? H.hostMatches(host, site.host) : site.host === host
  );

  if (builtin) {
    if (config.disabledSites.includes(builtin.id)) {
      await restoreSite(builtin.id);
      setStatus(`«${builtin.label}» دوباره فعال شد.`, 'ok');
    } else {
      setStatus(`«${builtin.label}» از قبل در فهرست است.`, 'err');
    }
    return;
  }

  const overlaps = (a, b) => (typeof H.customMatches === 'function' ? H.customMatches(a, b) : a === b);
  if (config.customSites.some((entry) => overlaps(host, entry))) {
    setStatus('این دامنه از قبل اضافه شده است.', 'err');
    return;
  }

  let granted = false;
  try {
    granted = await chrome.permissions.request({ origins: patternsFor(host) });
  } catch (err) {
    setStatus('درخواست دسترسی ناموفق بود: ' + err.message, 'err');
    return;
  }
  if (!granted) {
    setStatus('اجازهٔ دسترسی به این دامنه داده نشد.', 'err');
    return;
  }

  try {
    await chrome.scripting.registerContentScripts([
      {
        id: SITE_PREFIX + host,
        matches: patternsFor(host),
        css: ['src/content.css'],
        js: ['src/sites.js', 'src/content.js'],
        runAt: 'document_start',
        allFrames: false,
        persistAcrossSessions: true,
      },
    ]);
  } catch (err) {
    setStatus('افزودن سایت ناموفق بود: ' + err.message, 'err');
    return;
  }

  config.customSites = [...config.customSites, host];
  await chrome.storage.sync.set({ customSites: config.customSites });
  setStatus(`«${host}» اضافه شد. صفحه‌های بازِ این سایت را یک‌بار بازخوانی کنید.`, 'ok');
  $('hostInput').value = '';
  render();
}

/* ------------------------------------------------------------------ *
 * wiring
 * ------------------------------------------------------------------ */

$('enabled').addEventListener('change', async () => {
  const enabled = $('enabled').checked;
  config.enabled = enabled;
  render();
  await chrome.storage.sync.set({ enabled });
  setStatus(enabled ? 'افزونه روشن شد.' : 'افزونه خاموش شد.', 'ok');
});

/**
 * Both broad modes (auto-detect and "every site") need the same optional
 * permission; it is requested once and released only when neither is on.
 */
async function setBroadMode(key, on) {
  const input = $(key);
  const other = key === 'autoDetect' ? 'allSites' : 'autoDetect';

  if (on && !config[other]) {
    let granted = false;
    try {
      granted = await chrome.permissions.request({ origins: ['*://*/*'] });
    } catch (_) { /* ignore */ }
    if (!granted) {
      if (input) input.checked = false;
      setStatus('برای این حالت، اجازهٔ دسترسی به همهٔ سایت‌ها لازم است.', 'err');
      return;
    }
  }

  config[key] = on;
  await chrome.storage.sync.set({ [key]: on });

  if (!on && !config[other]) {
    try {
      await chrome.permissions.remove({ origins: ['*://*/*'] });
    } catch (_) { /* ignore */ }
  }

  setStatus(on ? 'روشن شد.' : 'خاموش شد.', 'ok');
}

$('autoDetect').addEventListener('change', (event) => {
  setBroadMode('autoDetect', event.target.checked);
});

$('allSites').addEventListener('change', (event) => {
  setBroadMode('allSites', event.target.checked);
});

$('addForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = $('addForm').querySelector('button');
  button.disabled = true;
  try {
    await addSite($('hostInput').value);
  } finally {
    button.disabled = false;
  }
});

$('search').addEventListener('input', () => {
  query = $('search').value;
  render();
});

$('restoreAll').addEventListener('click', async () => {
  config.disabledSites = [];
  await chrome.storage.sync.set({ disabledSites: [] });
  setStatus('همهٔ سایت‌های پیش‌فرض بازگردانده شدند.', 'ok');
  render();
});

$('shortcutsBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'sync' || !changes) return;
  if (
    !changes.enabled &&
    !changes.disabledSites &&
    !changes.customSites &&
    !changes.autoDetect &&
    !changes.allSites
  ) {
    return;
  }
  await loadConfig();
  render();
});

/* ------------------------------------------------------------------ *
 * init
 * ------------------------------------------------------------------ */

(async function init() {
  $('version').textContent = chrome.runtime.getManifest().version;
  await loadConfig();

  // the broad permission may have been revoked from chrome://extensions
  if (config.autoDetect || config.allSites) {
    try {
      const granted = await chrome.permissions.contains({ origins: ['*://*/*'] });
      if (!granted) {
        config.autoDetect = false;
        config.allSites = false;
        await chrome.storage.sync.set({ autoDetect: false, allSites: false });
      }
    } catch (_) { /* ignore */ }
  }

  render();
})();
