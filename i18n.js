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
const I18N_FULL = new Map();     // ganze Texte ohne Platzhalter (Lebensmittelnamen aus food-en.js)
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
  s = String(s).replace(/&nbsp;/g, ' ');  // v288: feste Leerzeichen der Trennstriche (innerHTML) wie normale behandeln
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
  const full = I18N_FULL.get(String(s).replace(/\s+/g, ' ').trim());  // v279: Lebensmittelnamen (food-en.js), ganzer Text
  if (full) return full;
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
// v288 (User-Wunsch): Trennstrich „ | “ überall mit je einem zusätzlichen Leerzeichen davor und danach. Nur in der Anzeige
// (feste Leerzeichen, HTML fasst normale zusammen); der Strich bleibt am Wort davor, damit keine Zeile mit „|“ beginnt.
// Wörterbuch-Schlüssel bleiben unverändert, i18nKey macht aus allen Leerzeichen (auch festen) wieder eines.
const PIPE_RE = /[ \t\n\u00a0]+\|[ \t\n\u00a0]+/g, PIPE_TO = '\u00a0\u00a0|\u00a0 ';
function pipeText(t) {
  const lb = unitLb() && /kg|cm/i.test(t.data);
  if (t.data.indexOf('|') < 0 && !lb) return;
  const p = t.parentElement;
  if (p && p.closest('[data-i18n="no"], textarea, script, style, code, pre')) return;
  let d = t.data;
  if (lb && !(p && p.closest('[data-nounit]'))) d = unitConv(d);  // v303: Einheiten-Auswahl selbst nicht umrechnen
  if (d.indexOf('|') >= 0) d = d.replace(PIPE_RE, PIPE_TO);
  if (d !== t.data) t.data = d;
}
function pipeAll(root) {
  if (!root) return;
  if (root.nodeType === 3) { pipeText(root); return; }
  if (root.nodeType !== 1) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) pipeText(n);
  if (unitLb()) unitInputs(root);
}

/* ---------- v303 (User-Wunsch): Einheit kg | lb ----------
   Intern bleibt alles in kg (Daten, Sicherungen, Rechnungen). Bei lb rechnet diese Schicht nur Anzeige und Eingabe um:
   Texte „82,5 kg“ → „181,9 lb“ (auch „KG“ in Spaltenköpfen), Werte in Gewichtsfeldern, Getipptes zurück in kg (app.js, input).
   Raster, Steigerung, Scheiben und Aufwärmen rechnen bei lb mit lb-Stufen (app.js: stepFor, platesPerSide, warmupSets). */
const LB_KG = 0.45359237;
// Ohne Wahl: lb nur bei Region USA (Handy-Einstellung „en-US“); bisherige Nutzer haben seit v303 fest „kg“ (upgradeData)
const unitDefault = () => /-US/i.test((typeof navigator !== 'undefined' && navigator.language) || '') ? 'lb' : 'kg';
const unitLb = () => typeof data !== 'undefined' && !!data && ((data.profile && data.profile.unit) || unitDefault()) === 'lb';
const uW = kg => unitLb() ? kg / LB_KG : kg;   // kg → Anzeigeeinheit
const uK = v => unitLb() ? v * LB_KG : v;      // Anzeigeeinheit → kg
const uName = () => unitLb() ? 'lb' : 'kg';
// „g pro kg“ (Eiweiß, Fett): bei lb als „g pro lb“ umgerechnet (der Text „kg“ wird in der Anzeige zu „lb“)
const perKgDisp = v => fmtNum(unitLb() ? Math.round(v * LB_KG * 100) / 100 : v);
// Zahl in deutscher oder englischer Schreibweise lesen (82,5 | 82.5 | 1.234,5 | 1,234.5)
function unitParse(s) {
  const t = LANG === 'de' ? s.replace(/\.(?=\d{3}\b)/g, '').replace(',', '.') : s.replace(/,(?=\d{3}\b)/g, '');
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}
const unitFmt = kg => fmtNum(Math.round(kg / LB_KG * 10) / 10);
function unitConv(s) {
  return s
    .replace(/(\d+(?:[.,]\d+)*)(\s?(?:–|-|bis|to)\s?)(\d+(?:[.,]\d+)*)(\s?|-)kg\b/g, (m, a, mid, b, sp) => {
      const x = unitParse(a), y = unitParse(b);
      return x == null || y == null ? m : `${unitFmt(x)}${mid}${unitFmt(y)}${sp}lb`;
    })
    .replace(/(\d+(?:[.,]\d+)*)(\s?|-)kg\b/g, (m, a, sp) => { const x = unitParse(a); return x == null ? m : `${unitFmt(x)}${sp}lb`; })
    .replace(/(\d+(?:[.,]\d+)?)(\s?)cm\b/g, (m, a, sp) => { const x = unitParse(a); return x == null ? m : `${fmtNum(Math.round(x / IN_CM * 10) / 10)}${sp}in`; })
    .replace(/\bkg\b/g, 'lb').replace(/\bKG\b/g, 'LB').replace(/\bcm\b/g, 'in');
}
// Gewichtsfelder: Wert (kg) beim Anzeigen in lb, Platzhalter „kg“ → „lb“
const WEIGHT_FIELDS = new Set(['tr-weight', 'tr-sub-w', 'tr-max', 'rep-max', 'ex-max', 'ex-start', 'first-max', 'wu-weight', 'add-max', 'bw-kg', 'home-w']);
const isWeightInput = el => !!el && !!el.dataset && (WEIGHT_FIELDS.has(el.dataset.field) || (el.dataset.field === 'se-set' && el.dataset.prop === 'weight')
  || (el.dataset.field === 'nut-in' && (el.dataset.k === 'kg' || el.dataset.k === 'goalKg')) || el.dataset.unit === 'kg');
// Längen (Körpergröße, Körpermaße): bei lb in Zoll; die Größe auch als 5'11 eintippbar
const IN_CM = 2.54;
// Lebensmittel-Mengen: bei lb in Unzen (oz); Makros bleiben in Gramm
const OZ_G = 28.349523125;
const isGramInput = el => !!el && !!el.dataset && el.dataset.field === 'food-g' && !el.dataset.pcs;
const amtTxt = g => unitLb() ? `${fmtNum(Math.round(g / OZ_G * 10) / 10)} oz` : `${fmtNum(Math.round(g * 10) / 10)} g`;
const ozGStr = shown => { if (!unitLb()) return shown; const n = unitParse(String(shown)); return n == null ? shown : fmtNum(Math.round(n * OZ_G * 10) / 10); };
const isLengthInput = el => !!el && !!el.dataset && ((el.dataset.field === 'nut-in' && el.dataset.k === 'height') || el.dataset.field === 'meas-in' || el.dataset.unit === 'cm');
function lenCmStr(shown) {
  if (!unitLb()) return shown;
  const m = String(shown).match(/^\s*(\d+)\s*['′’]\s*(\d+(?:[.,]\d+)?)?/);
  const inch = m ? +m[1] * 12 + (m[2] ? unitParse(m[2]) : 0) : unitParse(String(shown));
  return inch == null ? shown : fmtNum(Math.round(inch * IN_CM * 10) / 10);
}
function unitInputs(root) {
  const list = root.matches && root.matches('input') ? [root] : root.querySelectorAll ? root.querySelectorAll('input') : [];
  for (const el of list) {
    if (el.placeholder && /\bkg\b/.test(el.placeholder)) el.placeholder = el.placeholder.replace(/\bkg\b/g, 'lb');
    if (el.placeholder && /\bcm\b/.test(el.placeholder)) el.placeholder = el.placeholder.replace(/\bcm\b/g, 'in');
    const len = isLengthInput(el), gr = isGramInput(el);
    if ((!isWeightInput(el) && !len && !gr) || el.dataset.ulDone) continue;  // jedes Feld nur einmal (danach tippt man selbst in lb)
    const n = el.value.trim() === '' ? null : unitParse(el.value);
    if (n != null) el.value = len ? fmtNum(Math.round(n / IN_CM * 10) / 10) : gr ? fmtNum(Math.round(n / OZ_G * 10) / 10) : unitFmt(n);
    if (len && el.inputMode === 'numeric') el.inputMode = 'decimal';
    el.dataset.ulDone = '1';
  }
}
// Für Code, der Werte direkt ins Feld schreibt (setInput) bzw. aus dem Feld liest
const unitShow = kgStr => { if (!unitLb() || kgStr === '' || kgStr == null) return kgStr; const n = unitParse(String(kgStr)); return n == null ? kgStr : unitFmt(n); };
const unitKgStr = shown => { if (!unitLb()) return shown; const n = unitParse(String(shown)); return n == null ? shown : fmtNum(Math.round(n * LB_KG * 1000) / 1000); };
function i18nText(t) {
  if (!t.data.trim() || I18N_DONE.get(t) === t.data) return;
  const p = t.parentElement;
  if (p && (p.closest('[data-i18n="no"], textarea, script, style'))) return;
  const out = i18nLookup(t.data);
  if (out != null) {
    const lead = t.data.match(/^\s*/)[0], trail = t.data.match(/\s*$/)[0];
    t.data = lead + out + trail;
  }
  pipeText(t);
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
  if (!root) return;
  if (!i18nOn()) {  // Deutsch: nur die Trennstriche (v288)
    if (i18nObs) i18nMuts(i18nObs.takeRecords());
    pipeAll(root);
    if (i18nObs) i18nObs.takeRecords();
    return;
  }
  if (i18nObs) i18nMuts(i18nObs.takeRecords());  // was sonst noch neu ist (z. B. Kopfzeile im Training), nicht verwerfen
  if (root.nodeType === 3) i18nText(root); else i18nEl(root);
  pipeAll(root);  // auch Texte, die i18nEl als Ganzes (innerHTML) übersetzt hat
  if (i18nObs) i18nObs.takeRecords();  // eigene Änderungen nicht noch einmal behandeln
}
function i18nMuts(muts) {
  const on = i18nOn();
  for (const m of muts) {
    if (m.type === 'characterData') { if (on) i18nText(m.target); else pipeText(m.target); }
    else for (const n of m.addedNodes) {
      if (!n.isConnected) continue;
      if (!on) pipeAll(n);
      else if (n.nodeType === 3) i18nText(n);
      else if (n.nodeType === 1) { i18nEl(n); pipeAll(n); }
    }
  }
}
// alles, was später in die Seite kommt (Dialoge, Hinweise, Diagramm-Infos, nachgeladene Teile); seit v288 auch auf Deutsch (Trennstriche)
const i18nObs = typeof MutationObserver === 'function' ? new MutationObserver(muts => {
  i18nMuts(muts);
  i18nObs.takeRecords();
}) : null;

// Sprache festlegen: gespeicherte Wahl, sonst bestehende Nutzer Deutsch, neue Nutzer nach Handysprache
function i18nInit() {
  const p = (typeof data !== 'undefined' && data && data.profile) || {};
  const has = typeof data !== 'undefined' && data && ((data.sessions || []).length || (data.plans || []).length);
  LANG = LANGS[p.lang] ? p.lang : has ? 'de' : /^de\b/i.test(navigator.language || 'de') ? 'de' : 'en';
  document.documentElement.lang = LANG;
  // v279: englische Lebensmittelnamen (groß) nur laden, wenn Englisch eingestellt ist
  if (LANG === 'en' && !document.querySelector('script[data-food-en]')) {
    const me = document.querySelector('script[src*="i18n.js"]');  // gleicher Ordner wie i18n.js
    const sc = document.createElement('script'); sc.src = me ? me.src.replace(/i18n\.js.*$/, 'food-en.js') : 'food-en.js'; sc.dataset.foodEn = '1'; document.head.appendChild(sc);
  }
  i18nApply(document.body);
  if (i18nObs) i18nObs.observe(document.body, { childList: true, subtree: true, characterData: true });
}
// Sprache wechseln: speichern und neu laden (alle Texte und Formate frisch)
function i18nSet(l) {
  if (!LANGS[l]) return;
  data.profile = { ...(data.profile || {}), lang: l };
  saveData();
  setTimeout(() => location.reload(), 60);
}
// Auswahl (Begrüßung und Optionen) – die Sprachnamen selbst nie übersetzen
// v303: Einheit wählen (Begrüßung und Optionen → Aussehen)
const unitPickHtml = () => `<div class="seg two unit-pick" data-nounit>${[['kg', 'kg'], ['lb', 'lb']].map(([k, l]) =>
  `<button class="${(unitLb() ? 'lb' : 'kg') === k ? 'on' : ''}" data-action="unit-set" data-u="${k}">${l}</button>`).join('')}</div>`;
const langPickHtml = () => `<div class="seg two lang-pick" data-i18n="no">${Object.entries(LANGS).map(([k, l]) =>
  `<button class="${LANG === k ? 'on' : ''}" data-action="lang-set" data-l="${k}">${l}</button>`).join('')}</div>`;
// Gespeicherte Zahlen als Text (z. B. „82,5“) in Eingabefeldern (v277): auf Englisch mit Punkt anzeigen; parseNum liest beides
const numDisp = v => LANG !== 'de' && typeof v === 'string' ? v.replace(/(\d),(\d)/g, '$1.$2') : v;
// Lebensmittelnamen (v279): food-en.js ruft das nach dem Laden auf. Gespeichert bleibt der deutsche Name.
const i18nFull = s => s == null ? null : I18N_FULL.get(String(s).replace(/\s+/g, ' ').trim()) || null;
function i18nFoodReg() {
  if (typeof FOOD_EN === 'undefined') return;
  if (typeof BLS_DATA === 'string') for (const line of BLS_DATA.split('\n')) {
    const bar = line.indexOf('|'); if (bar < 0) continue;
    const code = line.slice(0, bar), name = line.slice(bar + 1, line.indexOf('|', bar + 1));
    if (FOOD_EN.bls[code]) I18N_FULL.set(name.replace(/\s+/g, ' ').trim(), FOOD_EN.bls[code]);
  }
  for (const [de, en] of Object.entries(FOOD_EN.base || {})) I18N_FULL.set(de, en);
  if (typeof render === 'function' && typeof current !== 'undefined' && current) try { render(); } catch (e) { /* nichts */ }
}
// Übungsnamen in Eingabefeldern (v277): angezeigt übersetzt, gespeichert immer deutsch
const exDisp = n => LANG === 'de' || !n ? n : tr(n);
let I18N_EXREV = null;
function exFromDisp(s) {
  if (LANG === 'de' || !s || typeof EXERCISES === 'undefined') return s;
  if (!I18N_EXREV) I18N_EXREV = new Map(EXERCISES.map(n => [String(tr(n)).toLowerCase(), n]));
  return I18N_EXREV.get(String(s).trim().toLowerCase()) || s;
}
// Test/Pflege: fehlende Übersetzungen als Liste
const i18nMissing = () => [...I18N_MISS].sort();
