/* LockYourGains | © 2026 Alex Hundt | Alle Rechte vorbehalten – siehe LICENSE */
'use strict';

/* ---------- Sprache (v273, User 2026-11-14) ----------
   Deutsch ist die Grundlage: Die App erzeugt ihre Texte auf Deutsch. Diese Schicht übersetzt die angezeigten Texte über ein
   Wörterbuch (I18N.en, lang-en.js). Schlüssel = Text mit zusammengefassten Leerzeichen, Zahlen als Platzhalter {0}, {1} …
   Übersetzt werden ganze Absätze samt Inline-Formatierung (<b>, <small> …), sonst die einzelnen Textstücke.
   Was im Wörterbuch fehlt, bleibt deutsch. Nie übersetzt: Eingabefelder, Textfelder und alles in [data-i18n="no"].
   Zahlen und Datum formatiert die App selbst passend (LOCALE, fmtNum). Gespeicherte Daten bleiben immer deutsch. */
let LANG = 'de';
const I18N = { en: {} };
const LANGS = { de: 'Deutsch', en: 'English' };
const LOCALE = () => LANG === 'en' ? 'en-GB' : 'de-DE';
// Platzhalter: Zahlen (auch 14/11/26, 1:20, 82.5) und die schon englischen Wochentage und Monate aus dem Datumsformat
const I18N_NUM = /\d+(?:[.,:/]\d+)*|\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/g;
const I18N_INLINE = new Set(['B', 'STRONG', 'I', 'EM', 'SMALL', 'BR', 'SUP', 'SUB', 'U', 'SPAN', 'A', 'CODE', 'MARK', 'WBR']);
const I18N_ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
const I18N_MISS = new Set();      // fehlende Übersetzungen (zum Nachpflegen, siehe i18nMissing)
let I18N_HARVEST = null;          // Test: Map Schlüssel → { n, views } aller angezeigten deutschen Texte
const i18nOn = () => LANG !== 'de' || !!I18N_HARVEST;

function i18nKey(s) {
  const vals = [];
  const k = String(s).replace(/\s+/g, ' ').trim().replace(I18N_NUM, m => `{${vals.push(m) - 1}}`);
  return { k, vals };
}
// enthält der Text überhaupt Wörter (nicht nur Zahlen, Zeichen, Tags)?
const i18nWord = s => /\p{L}{2}/u.test(i18nKey(s).k.replace(/<[^>]*>|\{\d+\}|&\w+;/g, ''));
// Übersetzung eines Textes (oder null, wenn es keine gibt / Deutsch eingestellt ist)
function i18nLookup(s) {
  const { k, vals } = i18nKey(s);
  if (!i18nWord(k)) return null;
  // Test: auf Deutsch alles sammeln, auf Englisch nur, was noch fehlt
  const harvest = () => {
    if (!I18N_HARVEST) return;
    const v = typeof current !== 'undefined' && current ? current.view : '';
    const e = I18N_HARVEST.get(k) || { n: 0, views: new Set() };
    e.n++; e.views.add(v); I18N_HARVEST.set(k, e);
  };
  if (LANG === 'de') { harvest(); return null; }
  const tr = (I18N[LANG] || {})[k];
  if (tr != null) return tr.replace(/\{(\d+)\}/g, (_, i) => vals[i] != null ? vals[i] : '');
  const alt = i18nPattern(String(s).replace(/\s+/g, ' ').trim());
  if (alt != null) return alt;
  I18N_MISS.add(k); harvest();
  return null;
}
// Satzmuster mit Namen (I18N_RX[LANG]: [RegExp, m => Text]) und Infozeilen mit „ | “ (jeder Teil für sich)
const I18N_RX = { en: [] };
let i18nDepth = 0;
function i18nPattern(s) {
  if (i18nDepth > 3) return null;
  i18nDepth++;
  try {
    for (const [re, fn] of I18N_RX[LANG] || []) {
      const m = s.match(re);
      if (m) { const out = fn(m); if (out != null) return out; }
    }
    // Zeilen mit Umbruch und Infozeilen mit „ | “: jeder Teil für sich (nur wenn kein Teil eine Formatierung zerschneidet)
    for (const [re, sep] of [[/<br\s*\/?>/i, '<br>'], [' | ', ' | ']]) {
      const parts = s.split(re);
      if (parts.length < 2 || !parts.every(i18nWhole)) continue;
      const out = parts.map(p => p.trim() ? i18nLookup(p) : p);
      // mit Formatierung nur, wenn jeder Teil übersetzt ist (sonst übersetzt i18nEl die Textstücke einzeln)
      if (s.includes('<') ? out.every((p, i) => p != null || !i18nWord(parts[i])) : out.some(p => p != null))
        return out.map((p, i) => p ?? parts[i]).join(sep);
    }
    return null;
  } finally { i18nDepth--; }
}
// Teilstück mit vollständigen Tags (jedes geöffnete Element wird darin auch geschlossen)?
function i18nWhole(p) {
  const st = [];
  for (const [, close, name] of p.matchAll(/<(\/?)([a-zA-Z]+)[^>]*>/g)) {
    const n = name.toLowerCase();
    if (n === 'br' || n === 'wbr') continue;
    if (!close) st.push(n); else if (st.pop() !== n) return false;
  }
  return !st.length;
}
// für Texte im Code (Toasts, Titel …): übersetzt oder unverändert
const tr = s => s == null ? s : (i18nLookup(s) ?? s);

const I18N_DONE = new WeakMap();  // Knoten → zuletzt geschriebener Text (nicht doppelt übersetzen)
function i18nText(t) {
  if (!t.data.trim() || I18N_DONE.get(t) === t.data) return;
  const p = t.parentElement;
  if (p && (p.closest('[data-i18n="no"], textarea, script, style'))) return;
  const out = i18nLookup(t.data);
  if (out == null) return;
  const lead = t.data.match(/^\s*/)[0], trail = t.data.match(/\s*$/)[0];
  t.data = lead + out + trail;
  I18N_DONE.set(t, t.data);
}
function i18nAttrs(el) {
  for (const a of I18N_ATTRS) {
    const v = el.getAttribute && el.getAttribute(a);
    if (!v || I18N_DONE.get(el) === a + v) continue;
    const out = i18nLookup(v);
    if (out != null) { el.setAttribute(a, out); I18N_DONE.set(el, a + out); }
  }
}
// Absatz aus Text und Inline-Formatierung (ohne Knöpfe, Eingaben, Bilder)?
function i18nUnit(el) {
  let text = false;
  for (const c of el.childNodes) {
    if (c.nodeType === 3) { if (c.data.trim()) text = true; }
    else if (c.nodeType === 1) {
      if (!I18N_INLINE.has(c.tagName) || c.hasAttribute('data-action') || c.hasAttribute('data-i18n')
        || c.querySelector('input, button, select, textarea, svg, img, [data-action], [data-i18n]')) return false;
    }
  }
  return text;
}
function i18nEl(el) {
  if (el.nodeType !== 1 || el.closest('[data-i18n="no"]')) return;
  const tag = el.tagName;
  if (tag === 'TEXTAREA' || tag === 'SCRIPT' || tag === 'STYLE') return;
  i18nAttrs(el);
  if (tag === 'INPUT') return;
  if (el.children.length && i18nUnit(el)) {
    const html = el.innerHTML;
    if (I18N_DONE.get(el) === html) return;
    const out = i18nLookup(html);
    if (out != null) {
      el.innerHTML = out;
      el.querySelectorAll('[title], [aria-label]').forEach(i18nAttrs);  // z. B. Erklärung an der PB-Marke
      I18N_DONE.set(el, el.innerHTML); return;
    }
  }
  for (const c of [...el.childNodes]) {
    if (c.nodeType === 3) i18nText(c);
    else if (c.nodeType === 1) i18nEl(c);
  }
}
// ganzen Bereich übersetzen (nach dem Zeichnen, bei Dialogen und Hinweisen)
function i18nApply(root) {
  if (!i18nOn() || !root) return;
  if (i18nObs) i18nMuts(i18nObs.takeRecords());  // was sonst noch neu ist (z. B. Kopfzeile im Training), nicht verwerfen
  if (root.nodeType === 3) i18nText(root); else i18nEl(root);
  if (i18nObs) i18nObs.takeRecords();  // eigene Änderungen nicht noch einmal behandeln
}
function i18nMuts(muts) {
  for (const m of muts) {
    if (m.type === 'characterData') i18nText(m.target);
    else for (const n of m.addedNodes) {
      if (!n.isConnected) continue;
      if (n.nodeType === 3) i18nText(n);
      else if (n.nodeType === 1) i18nEl(n);
    }
  }
}
// alles, was später in die Seite kommt (Dialoge, Hinweise, Diagramm-Infos, nachgeladene Teile)
const i18nObs = typeof MutationObserver === 'function' ? new MutationObserver(muts => {
  if (!i18nOn()) return;
  i18nMuts(muts);
  i18nObs.takeRecords();
}) : null;

// Sprache festlegen: gespeicherte Wahl, sonst bestehende Nutzer Deutsch, neue Nutzer nach Handysprache
function i18nInit() {
  const p = (typeof data !== 'undefined' && data && data.profile) || {};
  const has = typeof data !== 'undefined' && data && ((data.sessions || []).length || (data.plans || []).length);
  LANG = LANGS[p.lang] ? p.lang : has ? 'de' : /^de\b/i.test(navigator.language || 'de') ? 'de' : 'en';
  document.documentElement.lang = LANG;
  if (i18nOn()) {
    i18nApply(document.body);
    if (i18nObs) i18nObs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
}
// Sprache wechseln: speichern und neu laden (alle Texte und Formate frisch)
function i18nSet(l) {
  if (!LANGS[l]) return;
  data.profile = { ...(data.profile || {}), lang: l };
  saveData();
  setTimeout(() => location.reload(), 60);
}
// Auswahl (Begrüßung und Optionen) – die Sprachnamen selbst nie übersetzen
const langPickHtml = () => `<div class="seg two lang-pick" data-i18n="no">${Object.entries(LANGS).map(([k, l]) =>
  `<button class="${LANG === k ? 'on' : ''}" data-action="lang-set" data-l="${k}">${l}</button>`).join('')}</div>`;
// Test/Pflege: fehlende Übersetzungen als Liste
const i18nMissing = () => [...I18N_MISS].sort();
