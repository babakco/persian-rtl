import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const ROOT = new URL('../', import.meta.url);
const SITES = readFileSync(new URL('src/sites.js', ROOT), 'utf8');
const CONTENT = readFileSync(new URL('src/content.js', ROOT), 'utf8');
const MANIFEST = JSON.parse(readFileSync(new URL('manifest.json', ROOT), 'utf8'));

let passed = 0;
const failures = [];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function eq(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function ok(cond, label) {
  if (!cond) throw new Error(label);
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log('  \u2713', name);
  } catch (err) {
    failures.push([name, err.message]);
    console.log('  \u2717', name);
    console.log('      ' + err.message);
  }
}

/** Boot sites.js + content.js inside a fresh jsdom window. */
async function setup(html, options = {}) {
  const {
    url = 'https://chatgpt.com/',
    config = {},
    force = false,
  } = options;

  const dom = new JSDOM(
    `<!doctype html><html lang="en"><head><title>t</title></head><body>${html}</body></html>`,
    { url, runScripts: 'outside-only', pretendToBeVisual: true }
  );
  const { window } = dom;

  const store = {
    enabled: true,
    disabledSites: [],
    customSites: [],
    autoDetect: false,
    allSites: false,
    ...config,
  };

  if (force) window.__vzForce = true;

  window.chrome = {
    storage: {
      sync: { get: async (defaults) => ({ ...defaults, ...store }) },
      local: { get: async (defaults) => ({ ...defaults, ...store }) },
      onChanged: { addListener: () => {} },
    },
    runtime: { onMessage: { addListener: () => {} } },
  };

  window.eval(SITES);
  window.eval(CONTENT);

  await wait(0);
  await wait(0);

  return { dom, window, doc: window.document, store };
}

const dir = (el) => el.style.getPropertyValue('direction');
const prio = (el) => el.style.getPropertyPriority('direction');
const isRtl = (el) => dir(el) === 'rtl' && prio(el) === 'important';
const active = (doc) => doc.documentElement.classList.contains('vz-on');

/* ------------------------------------------------------------------ */
/* 1. the RTL rule itself                                              */
/* ------------------------------------------------------------------ */
console.log('\nRTL rule');

await test('Persian paragraph becomes fully RTL', async () => {
  const { doc } = await setup('<p id="a">سلام دنیا</p>');
  const p = doc.getElementById('a');
  ok(isRtl(p), 'paragraph should be direction:rtl !important');
  eq(p.style.getPropertyValue('text-align'), 'right', 'text-align');
});

await test('paragraph starting with English but containing Persian becomes RTL', async () => {
  const { doc } = await setup('<p id="a">Hello world این یک متن فارسی است</p>');
  ok(isRtl(doc.getElementById('a')), 'English-first Persian paragraph must be RTL');
});

await test('paragraph with Persian in the middle becomes RTL', async () => {
  const { doc } = await setup('<p id="a">See the note دربارهٔ فونت and continue</p>');
  ok(isRtl(doc.getElementById('a')), 'mixed paragraph must be RTL');
});

await test('pure English paragraph is left untouched', async () => {
  const { doc } = await setup('<p id="a">Hello world, this is English only.</p>');
  eq(dir(doc.getElementById('a')), '', 'English paragraph direction');
});

await test('latin digits alone do not trigger RTL', async () => {
  const { doc } = await setup('<p id="a">Order 1234 of 2026</p>');
  eq(dir(doc.getElementById('a')), '', 'digits-only direction');
});

await test('Persian digits alone do trigger RTL', async () => {
  const { doc } = await setup('<p id="a">۱۲۳۴۵</p>');
  ok(isRtl(doc.getElementById('a')), 'Persian digits should be treated as Persian text');
});

await test('headings, list items and table cells are covered', async () => {
  const { doc } = await setup(
    '<h2 id="h">عنوان فارسی</h2><ul><li id="l">آیتم</li></ul><table><tr><td id="c">سلول</td></tr></table>'
  );
  ok(isRtl(doc.getElementById('h')), 'h2');
  ok(isRtl(doc.getElementById('l')), 'li');
  ok(isRtl(doc.getElementById('c')), 'td');
});

await test('nested list item stays RTL', async () => {
  const { doc } = await setup('<ul><li id="l">سلام<ul><li id="n">دنیا</li></ul></li></ul>');
  ok(isRtl(doc.getElementById('l')), 'outer li');
  ok(isRtl(doc.getElementById('n')), 'inner li');
});

/* ------------------------------------------------------------------ */
/* 2. loose text in divs / spans (Gemini style markup)                 */
/* ------------------------------------------------------------------ */
console.log('\nLoose text containers');

await test('text inside a span gets its block parent fixed', async () => {
  const { doc } = await setup('<div id="w"><span id="s">متن فارسی داخل اسپن</span></div>');
  ok(isRtl(doc.getElementById('w')), 'wrapper div should carry the direction');
  eq(dir(doc.getElementById('s')), '', 'inline span should not be restyled itself');
});

await test('div with mixed inline markup becomes RTL', async () => {
  const { doc } = await setup('<div id="g">متن <strong>مهم</strong> فارسی</div>');
  ok(isRtl(doc.getElementById('g')), 'div with inline children');
});

await test('outer wrapper around real paragraphs is not flipped', async () => {
  const { doc } = await setup('<div id="w"><p id="p">یک پاراگراف فارسی</p><p id="q">Another one</p></div>');
  eq(dir(doc.getElementById('w')), '', 'wrapper must stay neutral');
  ok(isRtl(doc.getElementById('p')), 'inner p');
  eq(dir(doc.getElementById('q')), '', 'English p');
});

await test('a whole message with an English sentence keeps each block separate', async () => {
  const { doc } = await setup(
    '<div id="m"><p id="p1">این جمله فارسی است.</p><p id="p2">This sentence is English.</p></div>'
  );
  ok(isRtl(doc.getElementById('p1')), 'Persian sentence block');
  eq(dir(doc.getElementById('p2')), '', 'English sentence block');
});

/* ------------------------------------------------------------------ */
/* 3. what must never be touched                                       */
/* ------------------------------------------------------------------ */
console.log('\nExclusions');

await test('code blocks are left alone', async () => {
  const { doc } = await setup('<pre><code id="c">const x = "سلام";</code></pre>');
  eq(dir(doc.getElementById('c')), '', 'code');
  eq(dir(doc.querySelector('pre')), '', 'pre');
});

await test('inline code inside a Persian paragraph does not break the paragraph', async () => {
  const { doc } = await setup('<p id="a">از <code>npm install</code> استفاده کنید</p>');
  ok(isRtl(doc.getElementById('a')), 'paragraph');
});

await test('svg content is skipped', async () => {
  const { doc } = await setup('<svg id="s"><text id="t">سلام</text></svg>');
  eq(dir(doc.getElementById('t')), '', 'svg text');
});

/* ------------------------------------------------------------------ */
/* 4. input areas                                                      */
/* ------------------------------------------------------------------ */
console.log('\nTyping areas');

await test('textarea with Persian becomes RTL', async () => {
  const { doc, window } = await setup('<textarea id="t">سلام دنیا</textarea>');
  const t = doc.getElementById('t');
  ok(isRtl(t), 'textarea direction');
  t.value = 'hello';
  window.__vz.inspect(t);
  eq(dir(t), '', 'textarea after switching to English');
});

await test('contenteditable composer with Persian becomes RTL', async () => {
  const { doc } = await setup('<div id="e" contenteditable="true">سلام، این متن است</div>');
  ok(isRtl(doc.getElementById('e')), 'contenteditable direction');
});

/* ------------------------------------------------------------------ */
/* 5. streaming updates                                                */
/* ------------------------------------------------------------------ */
console.log('\nStreaming');

await test('text that turns Persian while streaming gets RTL', async () => {
  const { doc } = await setup('<p id="a">Hello</p>');
  const p = doc.getElementById('a');
  eq(dir(p), '', 'before');
  p.textContent = 'Hello سلام';
  await wait(180);
  ok(isRtl(p), 'after streaming mutation');
});

await test('newly appended message is handled', async () => {
  const { doc } = await setup('<div id="list"></div>');
  const p = doc.createElement('p');
  p.textContent = 'پیام تازه';
  doc.getElementById('list').appendChild(p);
  await wait(180);
  ok(isRtl(p), 'appended node');
});

await test('a message re-rendered into English drops the RTL override', async () => {
  const { doc } = await setup('<p id="a">سلام</p>');
  const p = doc.getElementById('a');
  ok(isRtl(p), 'initially RTL');
  p.textContent = 'Plain english answer';
  await wait(1800);
  ok(!isRtl(p), 'should be neutral again');
});

/* ------------------------------------------------------------------ */
/* 6. on / off switch                                                  */
/* ------------------------------------------------------------------ */
console.log('\nOn/off switch');

await test('switching off removes every override', async () => {
  const { doc, window } = await setup('<p id="a">سلام</p><p id="b">فارسی دوم</p>');
  ok(isRtl(doc.getElementById('a')), 'before: on');
  ok(active(doc), 'html.vz-on present');

  window.__vz.setActive(false, false);

  eq(dir(doc.getElementById('a')), '', 'a after off');
  eq(dir(doc.getElementById('b')), '', 'b after off');
  ok(!active(doc), 'html.vz-on must be removed');
});

await test('nothing is restyled while the switch is off', async () => {
  const { doc, window } = await setup('<p id="a">Hello</p>');
  window.__vz.setActive(false, false);
  doc.getElementById('a').textContent = 'سلام';
  await wait(200);
  eq(dir(doc.getElementById('a')), '', 'must stay untouched while off');
});

await test('switching back on re-applies the rules', async () => {
  const { doc, window } = await setup('<p id="a">سلام</p>');
  window.__vz.setActive(false, false);
  eq(dir(doc.getElementById('a')), '', 'off');
  window.__vz.setActive(true, false);
  ok(isRtl(doc.getElementById('a')), 'on again');
  ok(active(doc), 'vz-on back');
});

await test('page-authored inline direction is restored on off', async () => {
  const { doc, window } = await setup('<p id="a" style="direction: ltr">سلام</p>');
  const p = doc.getElementById('a');
  eq(dir(p), 'rtl', 'forced to rtl while on');
  window.__vz.setActive(false, false);
  eq(dir(p), 'ltr', 'original ltr restored');
  eq(prio(p), '', 'priority cleared');
});

/* ------------------------------------------------------------------ */
/* 7. shadow DOM                                                       */
/* ------------------------------------------------------------------ */
console.log('\nShadow DOM');

await test('Persian paragraph inside an open shadow root becomes RTL', async () => {
  const { doc, window } = await setup('<div id="host"></div>');
  const root = doc.getElementById('host').attachShadow({ mode: 'open' });
  root.innerHTML = '<p id="sp">سلام از شدو دام</p>';
  window.__vz.scanAll();
  ok(isRtl(root.getElementById('sp')), 'shadow paragraph');
});

/* ------------------------------------------------------------------ */
/* 8. which sites run                                                  */
/* ------------------------------------------------------------------ */
console.log('\nSite gating');

await test('built-in site runs by default', async () => {
  const { doc } = await setup('<p id="a">سلام</p>');
  ok(active(doc), 'chatgpt.com should be covered');
  ok(isRtl(doc.getElementById('a')), 'and restyled');
});

await test('a site that is not on any list does nothing', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', { url: 'https://example.com/' });
  ok(!active(doc), 'example.com must not be activated');
  eq(dir(doc.getElementById('a')), '', 'no styling');
});

await test('a built-in site removed by the user stays off', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', {
    config: { disabledSites: ['*.chatgpt.com'] },
  });
  ok(!active(doc), 'disabled entry must win');
  eq(dir(doc.getElementById('a')), '', 'no styling');
});

await test('removing one entry leaves the others working', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', {
    url: 'https://claude.ai/chat',
    config: { disabledSites: ['*.chatgpt.com'] },
  });
  ok(active(doc), 'claude.ai still covered');
});

await test('a user-added site runs', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', {
    url: 'https://chat.example.com/',
    config: { customSites: ['chat.example.com'] },
  });
  ok(active(doc), 'custom host should be covered');
  ok(isRtl(doc.getElementById('a')), 'and restyled');
});

await test('subdomains of a user-added site are covered', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', {
    url: 'https://eu.chat.example.com/',
    config: { customSites: ['chat.example.com'] },
  });
  ok(active(doc), 'subdomain coverage');
});

await test('auto-detect covers an unknown AI-looking host', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', {
    url: 'https://some-new-llm.app/',
    config: { autoDetect: true },
  });
  ok(active(doc), 'llm host should be auto-detected');
});

await test('auto-detect ignores ordinary websites', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', {
    url: 'https://news.example.org/',
    config: { autoDetect: true },
  });
  ok(!active(doc), 'ordinary site must stay untouched');
});

await test('auto-detect off means an unknown AI host is not covered', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', { url: 'https://some-new-llm.app/' });
  ok(!active(doc), 'no auto mode, no coverage');
});

await test('the global switch off wins over every list', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', { config: { enabled: false } });
  ok(!active(doc), 'global off');
  eq(dir(doc.getElementById('a')), '', 'no styling');
});

await test('"apply on every site" mode covers an ordinary website', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', {
    url: 'https://example.com/',
    config: { allSites: true },
  });
  ok(active(doc), 'every host should run in all-sites mode');
  ok(isRtl(doc.getElementById('a')), 'and be restyled');
});

await test('"apply on every site" is off by default', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', { url: 'https://example.com/' });
  ok(!active(doc), 'must stay opt-in');
});

await test('sites removed by the user stay off even in all-sites mode', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', {
    config: { allSites: true, disabledSites: ['*.chatgpt.com'] },
  });
  ok(!active(doc), 'removed site must win over the global mode');
});

await test('the global switch still beats all-sites mode', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', {
    url: 'https://example.com/',
    config: { allSites: true, enabled: false },
  });
  ok(!active(doc), 'off means off');
});

await test('toolbar force runs on an otherwise unsupported site', async () => {
  const { doc } = await setup('<p id="a">سلام</p>', {
    url: 'https://example.com/',
    force: true,
  });
  ok(active(doc), 'forced tab');
  ok(isRtl(doc.getElementById('a')), 'and restyled');
});

/* ------------------------------------------------------------------ */
/* 9. tiny helpers                                                     */
/* ------------------------------------------------------------------ */
console.log('\nHelpers');

await test('hasRtlLetters is precise', async () => {
  const { window } = await setup('<p>x</p>');
  const h = window.__vz.hasRtlLetters;
  ok(h('سلام') === true, 'persian');
  ok(h('۱۲۳') === true, 'persian digits');
  ok(h('٣') === true, 'arabic-indic digit');
  ok(h('hello') === false, 'latin');
  ok(h('\u05D0\u05D1') === false, 'hebrew is not persian');
  ok(h('') === false, 'empty');
  ok(h(null) === false, 'null');
});

await test('host matching understands wildcards', async () => {
  const { window } = await setup('<p>x</p>');
  const hm = window.VZ_HELPERS.hostMatches;
  ok(hm('chat.deepseek.com', '*.deepseek.com') === true, 'subdomain');
  ok(hm('deepseek.com', '*.deepseek.com') === true, 'bare domain');
  ok(hm('notdeepseek.com', '*.deepseek.com') === false, 'suffix trap');
  ok(hm('gemini.google.com', 'gemini.google.com') === true, 'exact');
  ok(hm('a.gemini.google.com', 'gemini.google.com') === false, 'exact does not cover subdomains');
});

/* ------------------------------------------------------------------ */
/* 10. packaging                                                       */
/* ------------------------------------------------------------------ */
console.log('\nPackaging');

await test('manifest is MV3 and one click toggles (no popup)', async () => {
  eq(MANIFEST.manifest_version, 3, 'manifest_version');
  ok(!MANIFEST.action.default_popup, 'action must not open a popup: one click = toggle');
  ok(MANIFEST.background.service_worker, 'service worker');
  ok(MANIFEST.permissions.includes('storage'), 'storage permission');
  ok(MANIFEST.permissions.includes('scripting'), 'scripting permission');
  ok(MANIFEST.commands && MANIFEST.commands._execute_action, 'keyboard command');
});

await test('manifest matches are generated from sites.js', async () => {
  const win = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }).window;
  win.eval(SITES);
  const sites = win.VZ_SITES;
  const expected = sites.map((s) => `*://${s.host}/*`);
  eq(JSON.stringify(MANIFEST.content_scripts[0].matches), JSON.stringify(expected), 'content script matches');
  eq(JSON.stringify(MANIFEST.host_permissions), JSON.stringify(expected), 'host permissions');
  ok(MANIFEST.content_scripts[0].js.includes('src/sites.js'), 'sites.js must load first');
  eq(MANIFEST.content_scripts[0].js.indexOf('src/sites.js'), 0, 'sites.js order');
});

await test('only well-known AI services are built in', async () => {
  const win = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }).window;
  win.eval(SITES);
  const sites = win.VZ_SITES.map((s) => s.host);
  for (const host of ['*.chatgpt.com', 'gemini.google.com', '*.claude.ai', '*.deepseek.com', '*.perplexity.ai']) {
    ok(sites.includes(host), `missing ${host}`);
  }
  ok(sites.length <= 20, 'the built-in list should stay a short list of major services');
});

await test('all files referenced by the manifest exist', async () => {
  const files = [];
  files.push(MANIFEST.background.service_worker);
  Object.values(MANIFEST.icons || {}).forEach((f) => files.push(f));
  Object.values(MANIFEST.action.default_icon || {}).forEach((f) => files.push(f));
  files.push(MANIFEST.options_ui.page);
  for (const cs of MANIFEST.content_scripts) files.push(...cs.css, ...cs.js);
  for (const f of files) ok(existsSync(new URL(f, ROOT)), `missing file: ${f}`);
});

await test('bundled Vazirmatn font is a real woff2', async () => {
  const path = new URL('assets/vazirmatn/Vazirmatn-Variable.woff2', ROOT);
  ok(existsSync(path), 'font file missing');
  const head = readFileSync(path).subarray(0, 4).toString('latin1');
  eq(head, 'wOF2', 'font signature');
  const exposed = readdirSync(new URL('assets/vazirmatn/', ROOT)).filter((f) => f.endsWith('.woff2'));
  ok(exposed.length > 0, 'font must be shipped');
});

/* ------------------------------------------------------------------ */
console.log(`\n${passed} passed, ${failures.length} failed\n`);
if (failures.length) {
  for (const [name, message] of failures) console.log(`FAILED — ${name}\n  ${message}\n`);
  process.exit(1);
}
