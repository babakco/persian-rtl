/*! Persian-RTL — content script (Manifest V3)
 *
 *  Rules implemented here:
 *   1. Any block that contains at least one Persian letter (even if the block
 *      starts with English text) is rendered as a whole in RTL.
 *   2. The whole chat surface uses the Vazirmatn typeface.
 *   3. The script only activates on sites that are allowed: the built-in list
 *      (src/sites.js) minus the ones the user removed, plus the sites the user
 *      added, plus — if enabled — any host that looks like an AI service.
 *   4. Everything is gated behind the global on/off switch.
 */
(() => {
  'use strict';

  if (globalThis.__vzLoaded) return;
  globalThis.__vzLoaded = true;

  /* ------------------------------------------------------------------ *
   * constants
   * ------------------------------------------------------------------ */

  // Persian/Arabic letters + Persian & Arabic-Indic digits.
  const RTL_LETTER_RE =
    /[\u0621-\u064A\u0660-\u0669\u066E-\u06D3\u06F0-\u06F9\u06FA-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFC]/;

  const FLUSH_DELAY = 60; // ms — debounce for streaming output
  const FULL_SCAN_GAP = 1200; // ms — safety net full rescan

  const DEFAULT_CONFIG = {
    enabled: true,
    disabledSites: [],
    customSites: [],
    autoDetect: false,
    allSites: false,
  };

  // Elements whose content must never be re-directed / re-fonted.
  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'MATH', 'CANVAS',
    'IMG', 'VIDEO', 'AUDIO', 'IFRAME', 'OBJECT', 'EMBED',
    'PRE', 'CODE', 'KBD', 'SAMP', 'VAR',
    'TEXTAREA', 'INPUT', 'SELECT', 'OPTION',
  ]);

  // Elements that never make a block "a wrapper".
  const INLINE_TAGS = new Set([
    'A', 'ABBR', 'ACRONYM', 'B', 'BDI', 'BDO', 'BIG', 'BR', 'CITE', 'DATA',
    'DEL', 'DFN', 'EM', 'FONT', 'I', 'IMG', 'INS', 'KBD', 'LABEL', 'MARK',
    'NOBR', 'Q', 'RP', 'RT', 'RUBY', 'S', 'SAMP', 'SMALL', 'SPAN', 'STRIKE',
    'STRONG', 'SUB', 'SUP', 'TIME', 'TT', 'U', 'VAR', 'WBR',
    'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'OUTPUT', 'METER', 'PROGRESS',
    'SVG', 'PICTURE', 'VIDEO', 'AUDIO', 'CANVAS', 'IFRAME', 'OBJECT', 'EMBED',
    'MAP', 'AREA',
  ]);

  // Tags that are, by definition, one paragraph / heading / cell / list line.
  const SEMANTIC_BLOCK_TAGS = new Set([
    'P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE',
    'TD', 'TH', 'DD', 'DT', 'FIGCAPTION', 'SUMMARY', 'CAPTION', 'LEGEND', 'ADDRESS',
  ]);

  // Anything inside these is left completely alone.
  const SKIP_ANCESTOR_SEL = [
    'pre', 'code', 'kbd', 'samp', 'svg', 'math',
    'script', 'style', 'noscript', 'template',
    'textarea', 'input', 'select',
    '[contenteditable=""]', '[contenteditable="true"]', '[contenteditable="plaintext-only"]',
    '.katex', '.katex-display',
  ].join(',');

  const TEXT_INPUT_TYPES = new Set(['text', 'search', 'url', 'email', 'tel', '']);

  const FONT_STACK =
    '"Vazirmatn RTL", Vazirmatn, Vazir, "Segoe UI", Tahoma, system-ui, ' +
    '-apple-system, "Noto Naskh Arabic", sans-serif';

  const SHADOW_CSS =
    '*:not(svg):not(svg *):not(math):not(math *):not(pre):not(pre *)' +
    ':not(code):not(code *):not(kbd):not(kbd *):not(samp)' +
    ':not([class*="icon" i]):not([class*="symbol" i]):not([class*="material" i])' +
    ':not([class*="lucide" i]):not([class*="codicon" i])' +
    ':not([class^="fa-"]):not([class*=" fa-"]):not([data-icon])' +
    `{font-family:${FONT_STACK} !important;letter-spacing:normal !important;}`;

  /* ------------------------------------------------------------------ *
   * state
   * ------------------------------------------------------------------ */

  const state = {
    config: { ...DEFAULT_CONFIG },
    enabled: false, // active *on this page*
    started: false,
    forced: false, // one-off "turn it on for this tab" from the toolbar
  };

  const touched = new Set(); // elements we restyled
  const prevState = new WeakMap(); // their original inline values
  const rootObservers = new Map(); // root -> MutationObserver
  const adoptedRoots = new Set(); // shadow roots we injected the font into

  let pending = new Set();
  let flushTimer = 0;
  let toastTimer = 0;
  let lastFullScan = 0;
  let shadowSheet = null;

  /* ------------------------------------------------------------------ *
   * configuration + "may I run here?"
   * ------------------------------------------------------------------ */

  function storageArea() {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage) return null;
      return chrome.storage.sync || chrome.storage.local || null;
    } catch (_) {
      return null;
    }
  }

  async function readConfig() {
    const area = storageArea();
    if (!area) return { ...DEFAULT_CONFIG };
    try {
      const stored = await area.get(DEFAULT_CONFIG);
      return {
        enabled: stored.enabled !== false,
        disabledSites: Array.isArray(stored.disabledSites) ? stored.disabledSites.slice() : [],
        customSites: Array.isArray(stored.customSites) ? stored.customSites.slice() : [],
        autoDetect: stored.autoDetect === true,
        allSites: stored.allSites === true,
      };
    } catch (_) {
      return { ...DEFAULT_CONFIG };
    }
  }

  function helpers() {
    return globalThis.VZ_HELPERS || {};
  }

  function shouldRunOn(host, config) {
    if (!config.enabled) return false;
    if (state.forced) return true;

    const h = helpers();
    if (typeof h.hostMatches !== 'function') return false;

    if (config.disabledSites.some((rule) => h.hostMatches(host, rule))) return false;
    if (config.customSites.some((entry) =>
      (typeof h.customMatches === 'function' ? h.customMatches : h.hostMatches)(host, entry)
    )) {
      return true;
    }

    const sites = globalThis.VZ_SITES;
    if (Array.isArray(sites) && sites.some((site) => h.hostMatches(host, site.host))) return true;

    // "apply on every website" switch: everything that is not explicitly removed
    if (config.allSites) return true;

    if (config.autoDetect && typeof h.looksLikeAiHost === 'function' && h.looksLikeAiHost(host)) {
      return true;
    }
    return false;
  }

  function applyConfig(config, announce) {
    state.config = config;
    setActive(shouldRunOn(location.hostname, config), announce);
  }

  /* ------------------------------------------------------------------ *
   * small helpers
   * ------------------------------------------------------------------ */

  function hasRtlLetters(text) {
    return typeof text === 'string' && text.length > 0 && RTL_LETTER_RE.test(text);
  }

  function isEditableRoot(el) {
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag === 'INPUT') {
      const type = (el.getAttribute('type') || '').toLowerCase();
      return TEXT_INPUT_TYPES.has(type);
    }
    const ce = el.getAttribute && el.getAttribute('contenteditable');
    return ce === '' || ce === 'true' || ce === 'plaintext-only';
  }

  function closestSkipped(el) {
    try {
      return !!el.closest(SKIP_ANCESTOR_SEL);
    } catch (_) {
      return false;
    }
  }

  function directTextHasRtl(el) {
    const nodes = el.childNodes;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.nodeType === 3 && hasRtlLetters(n.nodeValue)) return true;
    }
    return false;
  }

  // Nearest ancestor (or self) that behaves as a block container.
  function blockAncestorOf(el) {
    let node = el;
    let depth = 0;
    while (node && depth < 15) {
      if (node.nodeType === 1) {
        if (node === document.body || node === document.documentElement) return null;
        if (!INLINE_TAGS.has(node.tagName)) return node;
      }
      node = node.parentElement;
      depth++;
    }
    return null;
  }

  // Does this subtree hold another block (not just inline markup) with Persian text?
  function subtreeHasBlockText(el) {
    if (!INLINE_TAGS.has(el.tagName) && hasRtlLetters(el.textContent)) return true;
    const kids = el.children;
    for (let i = 0; i < kids.length; i++) {
      if (subtreeHasBlockText(kids[i])) return true;
    }
    return false;
  }

  function isWrapperBlock(el) {
    const kids = el.children;
    for (let i = 0; i < kids.length; i++) {
      if (subtreeHasBlockText(kids[i])) return true;
    }
    return false;
  }

  /* ------------------------------------------------------------------ *
   * applying / reverting direction
   * ------------------------------------------------------------------ */

  function readProp(el, prop) {
    return [el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)];
  }

  function writeProp(el, prop, pair) {
    if (pair[0]) el.style.setProperty(prop, pair[0], pair[1]);
    else el.style.removeProperty(prop);
  }

  function setRtl(el) {
    if (!prevState.has(el)) {
      prevState.set(el, {
        direction: readProp(el, 'direction'),
        textAlign: readProp(el, 'text-align'),
      });
    }
    el.style.setProperty('direction', 'rtl', 'important');
    el.style.setProperty('text-align', 'right', 'important');
    touched.add(el);
  }

  function restore(el) {
    const prev = prevState.get(el);
    if (prev) {
      writeProp(el, 'direction', prev.direction);
      writeProp(el, 'text-align', prev.textAlign);
      prevState.delete(el);
    } else {
      el.style.removeProperty('direction');
      el.style.removeProperty('text-align');
    }
    touched.delete(el);
  }

  /* ------------------------------------------------------------------ *
   * the actual rule: does this element become RTL?
   * ------------------------------------------------------------------ */

  function inspect(el) {
    if (!state.enabled || !el || el.nodeType !== 1) return;

    if (isEditableRoot(el)) {
      const value = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
        ? el.value || ''
        : el.textContent || '';
      if (hasRtlLetters(value)) setRtl(el);
      else if (touched.has(el)) restore(el);
      return;
    }

    const tag = el.tagName;
    if (SKIP_TAGS.has(tag)) return;
    if (closestSkipped(el)) return;

    let target = null;

    if (SEMANTIC_BLOCK_TAGS.has(tag)) {
      // A paragraph / heading / list item / table cell that holds any Persian
      // letter becomes fully RTL — even when it starts with Latin text.
      if (hasRtlLetters(el.textContent)) target = el;
    } else if (directTextHasRtl(el)) {
      // Loose text (Gemini-style divs and spans): give the direction to the
      // nearest block container, unless that container is a whole wrapper.
      const block = blockAncestorOf(el);
      if (block && !isWrapperBlock(block)) target = block;
    }

    if (!target) return;
    setRtl(target);
  }

  function validateTouched() {
    for (const el of Array.from(touched)) {
      if (!el.isConnected) {
        touched.delete(el);
        continue;
      }
      const value = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
        ? el.value || ''
        : el.textContent || '';
      // An empty block stays as-is: during streaming the element is often
      // emptied for a frame before the next chunk arrives.
      if (value.trim() && !hasRtlLetters(value)) restore(el);
    }
  }

  /* ------------------------------------------------------------------ *
   * shadow DOM: the font must reach inside web components
   * ------------------------------------------------------------------ */

  function adoptShadow(root) {
    if (!root || adoptedRoots.has(root)) return;
    try {
      if (!shadowSheet) {
        if (typeof CSSStyleSheet === 'undefined') return;
        shadowSheet = new CSSStyleSheet();
        shadowSheet.replaceSync(SHADOW_CSS);
      }
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, shadowSheet];
      adoptedRoots.add(root);
    } catch (_) {
      /* older engines / closed roots: silently ignore */
    }
  }

  function releaseShadow() {
    for (const root of adoptedRoots) {
      try {
        root.adoptedStyleSheets = root.adoptedStyleSheets.filter((s) => s !== shadowSheet);
      } catch (_) { /* ignore */ }
    }
    adoptedRoots.clear();
  }

  /* ------------------------------------------------------------------ *
   * scanning
   * ------------------------------------------------------------------ */

  function scanContainer(root) {
    if (!root || !root.querySelectorAll) return;
    const all = root.querySelectorAll('*');
    for (let i = 0; i < all.length; i++) {
      const el = all[i];
      if (el.shadowRoot) {
        adoptShadow(el.shadowRoot);
        observeRoot(el.shadowRoot);
        scanContainer(el.shadowRoot);
      }
      inspect(el);
    }
  }

  function scanAll() {
    if (!state.enabled) return;
    const root = document.documentElement;
    if (!root) return;
    validateTouched();
    scanContainer(root);
    lastFullScan = now();
  }

  function now() {
    return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  }

  function scheduleFlush() {
    if (flushTimer || !state.enabled) return;
    flushTimer = setTimeout(flush, FLUSH_DELAY);
  }

  function flush() {
    flushTimer = 0;
    if (!state.enabled) return;

    const batch = pending;
    pending = new Set();

    for (const node of batch) {
      if (!node || node.nodeType !== 1 || !node.isConnected) continue;

      if (node.shadowRoot) {
        adoptShadow(node.shadowRoot);
        observeRoot(node.shadowRoot);
        scanContainer(node.shadowRoot);
      }

      inspect(node);

      const kids = node.querySelectorAll('*');
      for (let i = 0; i < kids.length; i++) inspect(kids[i]);

      let parent = node.parentElement;
      let depth = 0;
      while (parent && depth < 3) {
        inspect(parent);
        parent = parent.parentElement;
        depth++;
      }
    }

    if (now() - lastFullScan > FULL_SCAN_GAP) scanAll();
    else validateTouched();
  }

  /* ------------------------------------------------------------------ *
   * observers
   * ------------------------------------------------------------------ */

  function handleMutations(records) {
    if (!state.enabled) return;
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      if (r.type === 'characterData') {
        if (r.target.parentElement) pending.add(r.target.parentElement);
        continue;
      }
      if (r.target && r.target.nodeType === 1) pending.add(r.target);
      const added = r.addedNodes;
      for (let j = 0; j < added.length; j++) {
        const n = added[j];
        if (n.nodeType === 1) pending.add(n);
        else if (n.nodeType === 3 && n.parentElement) pending.add(n.parentElement);
      }
    }
    scheduleFlush();
  }

  function observeRoot(root) {
    if (!root || rootObservers.has(root)) return;
    const obs = new MutationObserver(handleMutations);
    obs.observe(root, { childList: true, subtree: true, characterData: true });
    rootObservers.set(root, obs);
  }

  function disconnectAll() {
    for (const obs of rootObservers.values()) obs.disconnect();
    rootObservers.clear();
    pending.clear();
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = 0;
    }
  }

  /* ------------------------------------------------------------------ *
   * toast feedback
   * ------------------------------------------------------------------ */

  function showToast(enabled) {
    const host = document.body || document.documentElement;
    if (!host) return;
    let el = document.getElementById('vz-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'vz-toast';
      el.setAttribute('role', 'status');
      host.appendChild(el);
    }
    el.dataset.vzState = enabled ? 'on' : 'off';
    el.textContent = enabled ? 'Persian-RTL — روشن' : 'Persian-RTL — خاموش';
    el.classList.remove('vz-toast-hide');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.add('vz-toast-hide');
      toastTimer = setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    }, 1400);
  }

  /* ------------------------------------------------------------------ *
   * start / stop
   * ------------------------------------------------------------------ */

  function start() {
    if (state.started) return;
    state.started = true;
    observeRoot(document.documentElement);
    scanAll();
  }

  function stop() {
    state.started = false;
    disconnectAll();
    releaseShadow();
    for (const el of Array.from(touched)) restore(el);
    touched.clear();
  }

  function setActive(active, announce) {
    const changed = state.enabled !== active;
    state.enabled = active;

    const html = document.documentElement;
    if (html) html.classList.toggle('vz-on', active);

    if (active) start();
    else stop();

    if (announce && changed) showToast(active);
  }

  /* ------------------------------------------------------------------ *
   * bootstrap
   * ------------------------------------------------------------------ */

  async function boot() {
    if (!document.documentElement) return;

    state.forced = globalThis.__vzForce === true;
    applyConfig(await readConfig(), false);

    let area = null;
    try {
      area = chrome.storage.sync ? 'sync' : chrome.storage.local ? 'local' : null;
    } catch (_) { /* ignore */ }

    if (area) {
      try {
        chrome.storage.onChanged.addListener((changes, name) => {
          if (name !== area) return;
          readConfig().then((config) => applyConfig(config, true));
        });
      } catch (_) { /* ignore */ }
    }

    try {
      chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
        if (!msg || !msg.type) return undefined;
        if (msg.type === 'vz:ping') {
          if (sendResponse) sendResponse({ ok: true, enabled: state.enabled, host: location.hostname });
          return undefined;
        }
        if (msg.type === 'vz:state') {
          if (msg.force) state.forced = msg.enabled !== false;
          readConfig().then((config) => applyConfig(config, true));
          if (sendResponse) sendResponse({ ok: true, enabled: msg.enabled !== false });
          return undefined;
        }
        return undefined;
      });
    } catch (_) { /* ignore */ }
  }

  boot();

  /* test / debug hook */
  globalThis.__vz = {
    state,
    touched,
    hasRtlLetters,
    inspect,
    scanAll,
    applyConfig,
    readConfig,
    shouldRunOn,
    setActive,
    flushNow() {
      if (document.documentElement && flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = 0;
      }
      flush();
    },
  };
})();
