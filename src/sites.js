/*! Persian-RTL — built-in site list (single source of truth)
 *
 *  Only the well-known AI chat services live here. Anything else is either
 *  added by the user from the options page or covered by the opt-in
 *  "auto-detect" mode.
 *
 *  `host` is a match-pattern host: "*.example.com" covers example.com and every
 *  subdomain, "chat.example.com" covers only that exact host.
 *  `id` is what gets stored in `disabledSites` when a user removes a site, so the
 *  strings here must stay stable.
 */
globalThis.VZ_SITES = [
  { id: '*.chatgpt.com', host: '*.chatgpt.com', label: 'ChatGPT', group: 'default' },
  { id: 'chat.openai.com', host: 'chat.openai.com', label: 'ChatGPT (openai.com)', group: 'default' },
  { id: 'chat.com', host: 'chat.com', label: 'ChatGPT (chat.com)', group: 'default' },
  { id: 'gemini.google.com', host: 'gemini.google.com', label: 'Gemini', group: 'default' },
  { id: '*.claude.ai', host: '*.claude.ai', label: 'Claude', group: 'default' },
  { id: '*.copilot.microsoft.com', host: '*.copilot.microsoft.com', label: 'Microsoft Copilot', group: 'default' },
  { id: '*.meta.ai', host: '*.meta.ai', label: 'Meta AI', group: 'default' },
  { id: 'muse.meta.com', host: 'muse.meta.com', label: 'Muse (Meta)', group: 'default' },
  { id: '*.muse.ai', host: '*.muse.ai', label: 'Muse', group: 'default' },
  { id: '*.deepseek.com', host: '*.deepseek.com', label: 'DeepSeek', group: 'default' },
  { id: '*.grok.com', host: '*.grok.com', label: 'Grok', group: 'default' },
  { id: '*.perplexity.ai', host: '*.perplexity.ai', label: 'Perplexity', group: 'default' },
  { id: 'chat.mistral.ai', host: 'chat.mistral.ai', label: 'Le Chat (Mistral)', group: 'default' },
  { id: 'chat.qwen.ai', host: 'chat.qwen.ai', label: 'Qwen Chat', group: 'default' },
  { id: '*.poe.com', host: '*.poe.com', label: 'Poe', group: 'default' },
  { id: '*.you.com', host: '*.you.com', label: 'You.com', group: 'default' },
  { id: '*.character.ai', host: '*.character.ai', label: 'Character.AI', group: 'default' },
  { id: '*.pi.ai', host: '*.pi.ai', label: 'Pi', group: 'default' },
];

globalThis.VZ_HELPERS = {
  /** Does a rule like "*.deepseek.com" or "chat.example.com" cover this host?
   *  Wildcards cover the bare domain and every subdomain; exact entries cover
   *  only themselves (same semantics as the Chrome match patterns). */
  hostMatches(host, rule) {
    if (!host || !rule) return false;
    if (rule.startsWith('*.')) {
      const base = rule.slice(2);
      return host === base || host.endsWith('.' + base);
    }
    return host === rule;
  },

  /** Custom sites are stored as a bare host but registered as "*.<host>". */
  customMatches(host, entry) {
    if (!host || !entry) return false;
    if (host === entry) return true;
    const bare = entry.replace(/^\*\./, '');
    if (bare === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(bare)) return false;
    return host.endsWith('.' + bare);
  },

  /** Heuristic used by the opt-in "catch every AI site" mode. */
  looksLikeAiHost(host) {
    if (!host) return false;
    return /(^|[.-])(ai|gpt|llm|claude|gemini|copilot|perplexity|grok|deepseek|mistral|qwen|poe|character|openai|anthropic|llama)[.]/i.test(
      host + '.'
    );
  },

  /** Match patterns needed to run on a user-supplied host. */
  patternsFor(host) {
    const bare = host.replace(/^\*\./, '');
    if (bare === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(bare)) {
      return [`*://${bare}/*`];
    }
    return [`*://*.${bare}/*`];
  },
};
