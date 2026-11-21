// The live work order: everything here runs in the browser, on the visitor's own words. No outside service.
//   analyse(way, have) -> { project, no, disciplines: [{ key, name, hit }], sheets }
//   message(...)       -> the work order as plain text
//   mailtoURL / whatsappURL -> hand it to the visitor's own email app or WhatsApp
import { settings } from '../settings.js';

// the studio's disciplines (STUDIO_BRIEF Part 2c), each with the words that point at it.
// Terms are matched at the start of a word, so a stem like "invoic" also catches "invoices" and "invoicing".
export const DISCIPLINES = [
  { key: 'web', name: 'Websites', terms: ['website', 'web site', 'site', 'web page', 'webpage', 'landing', 'homepage', 'home page', 'seo', 'blog', 'domain', 'wordpress', 'online shop', 'shop', 'store', 'e-commerce', 'ecommerce', 'checkout', 'catalog', 'catalogue', 'google'] },
  { key: 'app', name: 'Apps and phones', terms: ['app', 'apps', 'mobile', 'phone', 'phones', 'iphone', 'android', 'ios', 'tablet', 'play store', 'app store', 'notification', 'offline', 'scan', 'qr'] },
  { key: 'platform', name: 'Platforms and web apps', terms: ['platform', 'portal', 'dashboard', 'marketplace', 'booking', 'bookings', 'book ', 'appointment', 'reservation', 'crm', 'erp', 'inventory', 'stock', 'orders', 'invoic', 'internal tool', 'admin', 'back office', 'backoffice', 'saas', 'web app', 'system', 'spreadsheet', 'excel', 'excel sheet', 'members', 'membership', 'subscription', 'schedul', 'payroll', 'point of sale', 'pos'] },
  { key: 'eng', name: 'Engineering and infrastructure', terms: ['server', 'hosting', 'host', 'cloud', 'database', 'api', 'integrat', 'connect', 'migrat', 'slow', 'speed', 'performance', 'scale', 'scaling', 'downtime', 'outage', 'deploy', 'infrastructure', 'sync', 'automat', 'import', 'export', 'pipeline', 'payment', 'payments'] },
  { key: 'sec', name: 'Cybersecurity', terms: ['security', 'secure', 'hack', 'breach', 'password', 'encrypt', 'phishing', 'malware', 'virus', 'leak', 'gdpr', 'privacy', 'private', 'protect', 'licen', 'piracy', 'pirat', 'signing', 'lock', '2fa', 'two-factor', 'fraud', 'attack', 'stolen'] },
  { key: 'ai', name: 'AI', terms: ['ai', 'a.i.', 'artificial intelligence', 'gpt', 'chatgpt', 'chatbot', 'chat bot', 'bot', 'llm', 'machine learning', 'model', 'agent', 'assistant', 'predict', 'forecast', 'ocr', 'recogni', 'classif', 'summar', 'answer customers', 'auto-reply'] },
  { key: 'consult', name: 'Consulting', terms: ['advice', 'advise', 'consult', 'strategy', 'roadmap', 'audit', 'review', 'not sure', "don't know", 'dont know', 'no idea', 'idea', 'startup', 'start-up', 'mvp', 'feasib', 'which tech', 'choose', 'where to start', 'plan'] },
  { key: 'care', name: 'Monthly care', terms: ['maintain', 'maintenance', 'update', 'fix', 'fixed', 'fixing', 'bug', 'broken', 'break', 'crash', 'backup', 'back up', 'support', 'monthly', 'keep running', 'uptime', 'outdated', 'old ', 'nobody looks after', 'looks after', 'down again'] },
];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// short terms (and terms written with a trailing space) must be whole words, plural allowed: "ai" is not "aim",
// "bot" is not "bottom", "app" is not "appointment"
const termRe = (t) => {
  const whole = t.endsWith(' ') || t.trim().length <= 3;
  return new RegExp(`(?:^|[^a-z0-9])(${esc(t.trim())})${whole ? "s?(?![a-z0-9])" : ''}`, 'i');
};
const MATCHERS = DISCIPLINES.map((d) => ({ ...d, re: d.terms.map(termRe) }));

const STOP = new Set(`a an the and or but if then than so to of in on at by for with from into onto over under up down out off about as is are was were be been being am do does did done doing have has had having
i me my mine we us our ours you your yours he him his she her it its they them their this that these those there here what which who whom whose when where why how all any both each few more most other some such no nor not only own same
too very can cant can't could couldn't will won't would wouldn't should shall may might must just also really still yet even ever again already now today right lot lots bit thing things stuff something anything everything nothing
want wants wanted need needs needed like get gets got make makes made making use used using work works working try trying help please would'd let lets know think go going goes way able much many every one two three new good bad better
don't dont doesn't isn't aren't wasn't i'm im we're it's its there's that's what's our hi hello thanks thank time times day days week weeks month months year years people person someone everyone them
got get last next first nobody looks look looking keep keeps kept since because`.split(/\s+/));

const words = (s) => (s.toLowerCase().match(/[a-zà-ÿ0-9][a-zà-ÿ0-9'’-]*/g) || []).map((w) => w.replace(/[’']s$/, '').replace(/[’'-]+$/, ''));
const title = (w) => w.charAt(0).toUpperCase() + w.slice(1);

/** a short project name from the visitor's own words: the strongest run of consecutive content words
 *  ("can't book appointments online" -> "Book Appointments Online"), at most three words */
export function projectName(way, have = '') {
  const a = words(way), b = words(have);
  const freq = new Map();
  [...a, ...b].forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  const content = (w) => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w);
  const ws = (w, i) => (1 + (w.length >= 6 ? 0.35 : 0) + 0.3 * ((freq.get(w) || 1) - 1)) / (1 + i * 0.02);
  const pick = (list) => {
    let best = null;
    for (let i = 0; i < list.length; i++) {
      if (!content(list[i])) continue;
      let sc = 0;
      for (let j = i; j < Math.min(list.length, i + 3) && content(list[j]); j++) {
        sc += ws(list[j], j);
        if (!best || sc > best.sc) best = { i, j, sc };
      }
    }
    return best;
  };
  let r = pick(a);
  if (!r) r = pick(b);
  if (!r) return '';
  const src = pick(a) ? a : b;
  const out = src.slice(r.i, r.j + 1);
  if (out.length === 1) {
    // one word on its own reads thin: add the next strongest word, keeping the visitor's order
    let k = -1, ks = 0;
    src.forEach((w, i) => { if (i !== r.i && content(w) && w !== out[0] && ws(w, i) > ks) { ks = ws(w, i); k = i; } });
    if (k >= 0) { if (k < r.i) out.unshift(src[k]); else out.push(src[k]); }
  }
  return out.map(title).join(' ');
}

/** a stable work-order number from the words (same words, same number) */
export function orderNo(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return `WO-${String((h >>> 0) % 9000 + 1000)}`;
}

export function analyse(way, have = '') {
  const text = ` ${way} ${have} `;
  const disciplines = [];
  for (const m of MATCHERS) {
    let hit = null;
    for (const re of m.re) { const r = re.exec(text); if (r) { hit = r[1].toLowerCase(); break; } }
    if (hit) disciplines.push({ key: m.key, name: m.name, hit });
  }
  const has = way.trim().length > 0;
  // words but no clear desk yet: the first sheet is a consulting one (we measure before anyone builds)
  if (has && way.trim().length >= 12 && disciplines.length === 0) disciplines.push({ key: 'consult', name: 'Consulting', hit: null });
  return {
    project: has ? projectName(way, have) : '',
    no: has ? orderNo(way.trim().toLowerCase()) : '',
    disciplines,
    sheets: disciplines.length ? disciplines.length + 2 : 0,
  };
}

export function reachKind(v) {
  const s = v.trim();
  if (!s) return { kind: 'none', ok: true, label: 'Where you send from' };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return { kind: 'email', ok: true, label: 'Email' };
  const digits = s.replace(/[^\d]/g, '');
  if (/^[+\d][\d\s().-]*$/.test(s) && digits.length >= 7 && digits.length <= 15) return { kind: 'phone', ok: true, label: 'Phone or WhatsApp' };
  return { kind: 'unknown', ok: false, label: '—' };
}

export function today(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
}

export function message({ way, have, reach }, a, date = today()) {
  const L = [];
  L.push(`Work order ${a.no} · ${date}`);
  if (a.project) L.push(`Project: ${a.project}`);
  if (a.disciplines.length) L.push(`Disciplines: ${a.disciplines.map((d) => d.name).join(', ')}`);
  if (a.sheets) L.push(`Sheets: ${a.sheets} (diagnose, one per discipline, hand over)`);
  L.push('', "01 What's in the way?", way.trim());
  L.push('', '02 What do you have today?', have.trim() || '(not given)');
  L.push('', '03 How do we reach you?', reach.trim() || '(reply to this message)');
  return L.join('\n');
}

export function subject(a) {
  return `Work order ${a.no}${a.project ? `: ${a.project}` : ''}`;
}

export const waDigits = (n = settings.whatsapp) => String(n).replace(/[^\d]/g, '');

export function mailtoURL(subj, body, to = settings.email) {
  // RFC 6068: line breaks as CRLF, everything percent-encoded
  return `mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}`;
}

export function whatsappURL(text, number = settings.whatsapp) {
  return `https://wa.me/${waDigits(number)}?text=${encodeURIComponent(text)}`;
}
