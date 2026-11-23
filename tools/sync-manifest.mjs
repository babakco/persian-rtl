/*! Persian-RTL — manifest generator
 *
 *  src/sites.js is the single source of truth for the built-in site list.
 *  This script copies it into manifest.json (content script matches + host
 *  permissions) so the two can never drift apart.
 *
 *  Usage: npm run sync
 */
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);

new Function(readFileSync(new URL('src/sites.js', root), 'utf8'))();
const sites = globalThis.VZ_SITES;

if (!Array.isArray(sites) || sites.length === 0) {
  throw new Error('src/sites.js did not define VZ_SITES');
}

const patterns = sites.map((site) => `*://${site.host}/*`);
const manifestPath = new URL('manifest.json', root);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

manifest.host_permissions = patterns;
manifest.content_scripts = [
  {
    matches: patterns,
    css: ['src/content.css'],
    js: ['src/sites.js', 'src/content.js'],
    run_at: 'document_start',
    all_frames: false,
  },
];

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`manifest.json synced — ${sites.length} sites, ${patterns.length} match patterns`);
