/*! Persian-RTL — service worker
 *
 *  • one click on the toolbar icon (= Alt+Shift+R) flips the global switch
 *  • keeps the badge in sync
 *  • keeps the dynamic content-script registrations in sync with the stored
 *    site list (custom sites) and with the opt-in "auto-detect" mode
 */

importScripts('/src/sites.js');

const DEFAULTS = {
  enabled: true,
  disabledSites: [],
  customSites: [],
  autoDetect: false,
  allSites: false,
};

const BADGE_ON = '#15803d';
const BADGE_OFF = '#6b7280';
const AUTO_ID = 'vz-auto';
const AUTO_MATCHES = ['*://*/*'];
const SITE_PREFIX = 'vz-site-';

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */

function helpers() {
  return globalThis.VZ_HELPERS || {};
}

async function readConfig() {
  const stored = await chrome.storage.sync.get(DEFAULTS);
  return {
    enabled: stored.enabled !== false,
    disabledSites: Array.isArray(stored.disabledSites) ? stored.disabledSites : [],
    customSites: Array.isArray(stored.customSites) ? stored.customSites : [],
    autoDetect: stored.autoDetect === true,
    allSites: stored.allSites === true,
  };
}

async function paint(enabled) {
  try {
    await chrome.action.setBadgeText({ text: enabled ? 'ON' : 'OFF' });
    await chrome.action.setBadgeBackgroundColor({ color: enabled ? BADGE_ON : BADGE_OFF });
    if (chrome.action.setBadgeTextColor) {
      await chrome.action.setBadgeTextColor({ color: '#ffffff' });
    }
    await chrome.action.setTitle({
      title: enabled
        ? 'Persian-RTL: روشن — برای خاموش کردن کلیک کنید'
        : 'Persian-RTL: خاموش — برای روشن کردن کلیک کنید',
    });
  } catch (_) {
    /* badge is cosmetic — never let it break the toggle */
  }
}

async function ping(tabId) {
  try {
    const res = await chrome.tabs.sendMessage(tabId, { type: 'vz:ping' });
    return !!(res && res.ok);
  } catch (_) {
    return false;
  }
}

async function sendState(tabId, enabled) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'vz:state', enabled, force: enabled });
  } catch (_) {
    /* tab may be gone or may not host the content script */
  }
}

async function injectInto(tabId) {
  try {
    // grant this tab once, even when its host is not on any list
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        globalThis.__vzForce = true;
      },
    });
  } catch (_) { /* ignore */ }

  try {
    await chrome.scripting.insertCSS({ target: { tabId }, files: ['src/content.css'] });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/sites.js', 'src/content.js'],
    });
    return true;
  } catch (_) {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * dynamic registrations
 * ------------------------------------------------------------------ */

async function registeredIds() {
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts();
    return new Set(scripts.map((s) => s.id));
  } catch (_) {
    return new Set();
  }
}

/** Make sure the wildcard script exists exactly when one of the broad modes is on. */
async function syncAutoScript(config) {
  const has = (await registeredIds()).has(AUTO_ID);
  const needed = config.autoDetect || config.allSites;

  if (!needed) {
    if (has) {
      try {
        await chrome.scripting.unregisterContentScripts({ ids: [AUTO_ID] });
      } catch (_) { /* ignore */ }
    }
    return;
  }

  if (has) return;

  try {
    const granted = await chrome.permissions.contains({ origins: AUTO_MATCHES });
    if (!granted) return;
    await chrome.scripting.registerContentScripts([
      {
        id: AUTO_ID,
        matches: AUTO_MATCHES,
        css: ['src/content.css'],
        js: ['src/sites.js', 'src/content.js'],
        runAt: 'document_start',
        allFrames: false,
        persistAcrossSessions: true,
      },
    ]);
  } catch (_) { /* ignore */ }
}

/** Re-register custom sites that lost their dynamic script (new profile, sync, …). */
async function syncCustomScripts(config) {
  const h = helpers();
  if (typeof h.patternsFor !== 'function') return;

  const ids = await registeredIds();

  for (const host of config.customSites) {
    const id = SITE_PREFIX + host;
    if (ids.has(id)) continue;
    const patterns = h.patternsFor(host);
    try {
      const granted = await chrome.permissions.contains({ origins: patterns });
      if (!granted) continue;
      await chrome.scripting.registerContentScripts([
        {
          id,
          matches: patterns,
          css: ['src/content.css'],
          js: ['src/sites.js', 'src/content.js'],
          runAt: 'document_start',
          allFrames: false,
          persistAcrossSessions: true,
        },
      ]);
    } catch (_) { /* ignore */ }
  }
}

async function reconcile() {
  const config = await readConfig();
  await syncAutoScript(config);
  await syncCustomScripts(config);
  await paint(config.enabled);
}

/* ------------------------------------------------------------------ *
 * lifecycle
 * ------------------------------------------------------------------ */

chrome.runtime.onInstalled.addListener(async () => {
  const sync = await chrome.storage.sync.get(null);
  const patch = {};

  if (typeof sync.enabled !== 'boolean') {
    let legacy = true;
    try {
      legacy = (await chrome.storage.local.get({ enabled: true })).enabled;
    } catch (_) { /* ignore */ }
    patch.enabled = legacy !== false;
  }
  if (!Array.isArray(sync.disabledSites)) patch.disabledSites = [];
  if (!Array.isArray(sync.customSites)) patch.customSites = [];
  if (typeof sync.autoDetect !== 'boolean') patch.autoDetect = false;
  if (typeof sync.allSites !== 'boolean') patch.allSites = false;

  if (Object.keys(patch).length) await chrome.storage.sync.set(patch);
  await reconcile();
});

chrome.runtime.onStartup.addListener(() => {
  reconcile();
});

// keep the badge and the registrations in sync no matter who changed the values
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== 'sync' || !changes) return;
  if (changes.enabled) await paint(changes.enabled.newValue !== false);
  if (changes.autoDetect || changes.allSites || changes.customSites) {
    const config = await readConfig();
    await syncAutoScript(config);
    await syncCustomScripts(config);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  const config = await readConfig();
  const enabled = !config.enabled;

  await chrome.storage.sync.set({ enabled });
  await paint(enabled);

  if (!tab || tab.id == null) return;
  if (!/^https?:/i.test(tab.url || '')) return;

  const present = await ping(tab.id);

  if (present) {
    await sendState(tab.id, enabled);
    return;
  }

  if (!enabled) return;

  // Site not covered yet: apply the extension to this tab only.
  const ok = await injectInto(tab.id);
  if (ok) setTimeout(() => sendState(tab.id, true), 120);
});
