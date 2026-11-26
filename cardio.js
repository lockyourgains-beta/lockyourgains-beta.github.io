/* LockYourGains | © 2026 Alex Hundt | Alle Rechte vorbehalten – siehe LICENSE */
/* ---------- Cardio: Ausdauereinheiten eintragen, Kalorienverbrauch schätzen ----------
   data.cardio = [{ id, date: 'JJJJ-MM-TT', type, level: 'easy'|'mid'|'hard', min, kcal, own, km? }]  (km: Strecke, freiwillig)
   kcal = Mehrverbrauch gegenüber Ruhe: (MET − 1) × kg × Stunden (MET-Werte nach dem Compendium of Physical Activities).
   own = true: Kalorien selbst eingetragen (z. B. von der Uhr). Optional fließt der Verbrauch ins Tagesziel ein
   (data.nutrition.cardioAdd, siehe nutForDay in nutrition.js). */

const CARDIO_TYPES = {
  walk: { label: 'Gehen / Walking', icon: '🚶', met: [3.0, 3.8, 5.0] },
  run: { label: 'Joggen / Laufen', icon: '🏃', met: [7.0, 9.0, 11.0] },
  bike: { label: 'Radfahren', icon: '🚴', met: [4.0, 6.8, 10.0] },
  ergo: { label: 'Ergometer / Indoor-Bike', icon: '🚲', met: [4.0, 6.8, 8.8] },
  stepper: { label: 'Stepper / Treppensteiger', icon: '🪜', met: [5.0, 7.0, 9.0] },
  row: { label: 'Rudergerät', icon: '🚣', met: [4.8, 7.0, 8.5] },
  cross: { label: 'Crosstrainer', icon: '⛷️', met: [4.5, 5.5, 7.5] },
  swim: { label: 'Schwimmen', icon: '🏊', met: [6.0, 8.0, 10.0] },
  hike: { label: 'Wandern', icon: '🥾', met: [4.5, 6.0, 7.5] },
  rope: { label: 'Seilspringen', icon: '🪢', met: [8.8, 11.0, 12.3] },
  hiit: { label: 'HIIT / Zirkeltraining', icon: '⚡', met: [6.0, 8.0, 10.0] },
  other: { label: 'Sonstiges', icon: '❤️', met: [4.0, 6.0, 8.0] },
};
const CARDIO_LEVELS = {
  easy: { label: 'Locker', text: 'du kannst dich dabei gut unterhalten' },
  mid: { label: 'Mittel', text: 'Sprechen geht noch in kurzen Sätzen' },
  hard: { label: 'Intensiv', text: 'kaum Luft zum Reden' },
};
const CARDIO_LEVEL_KEYS = Object.keys(CARDIO_LEVELS);

// Körpergewicht für die Schätzung (sonst 75 kg)
const cardioKg = () => (typeof nutWeight === 'function' && nutWeight()) || currentBodyweight() || 75;
function cardioEstimate(type, level, min) {
  const t = CARDIO_TYPES[type] || CARDIO_TYPES.other;
  const met = t.met[Math.max(0, CARDIO_LEVEL_KEYS.indexOf(level))];
  return Math.round((met - 1) * cardioKg() * (min / 60) / 5) * 5;
}
const cardioOn = date => data.cardio.filter(c => c.date === date);
// v344: inklusive Yoga (yoga.js), damit beides gemeinsam ins Tagesziel einfließt
const cardioKcalOn = date => cardioOn(date).reduce((a, c) => a + (c.kcal || 0), 0) + (typeof yogaKcalOn === 'function' ? yogaKcalOn(date) : 0);

// Diese Woche (ab Montag): Anzahl, Minuten, kcal
function cardioWeek() {
  const d = new Date(todayISO() + 'T12:00:00');
  const monday = addDaysISO(todayISO(), -((d.getDay() + 6) % 7));
  const list = data.cardio.filter(c => c.date >= monday && c.date <= todayISO());
  return { n: list.length, min: list.reduce((a, c) => a + c.min, 0), kcal: list.reduce((a, c) => a + (c.kcal || 0), 0) };
}

// Knopf + Wochenübersicht (Trainings-Startseite und Verlauf)
function cardioStartHtml() {
  const w = cardioWeek();
  return `<button class="btn nav cardio-btn" data-action="cardio-open">🏃 Cardio eintragen
      <small>${w.n ? `Diese Woche: ${w.n}× | ${w.min} min | ca. ${deNum(w.kcal)} kcal` : 'Joggen, Rad, Stepper, Rudergerät …'}</small></button>`;
}

/* ----- v345: Vergleich mit dem letzten Mal und Bestwerte je Aktivität ----- */
// Tempo-Angabe je Aktivität: min/km (Laufen, Gehen, Wandern), km/h (Rad), min/100 m (Schwimmen), min/500 m (Rudern)
const CARDIO_SPEED = { run: 'pace', walk: 'pace', hike: 'pace', bike: 'kmh', ergo: 'kmh', swim: 'p100', row: 'p500' };
const CARDIO_PER = { pace: [1, '/km', 's/km'], p100: [0.1, '/100 m', 's/100 m'], p500: [0.5, '/500 m', 's/500 m'] };
const cardioKmh = c => c && c.km > 0 && c.min > 0 ? c.km / (c.min / 60) : null;
const cardioMmss = m => { const s = Math.round(m * 60); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function cardioSpeedTxt(type, kmh) {
  const k = CARDIO_SPEED[type] || 'kmh';
  if (k === 'kmh') return `${fmtNum(round1(kmh))} km/h`;
  return `${cardioMmss(60 / kmh * CARDIO_PER[k][0])} min${CARDIO_PER[k][1]}`;
}
// Tempo-Unterschied: { s: 1 schneller, -1 langsamer, 0 gleich; t: Text }
function cardioSpeedDelta(type, kmhNew, kmhOld) {
  const k = CARDIO_SPEED[type] || 'kmh';
  if (k === 'kmh') { const d = round1(kmhNew - kmhOld); return { s: Math.sign(d), t: d ? `${d > 0 ? '+' : '−'}${fmtNum(Math.abs(d))} km/h` : 'gleich schnell' }; }
  const d = Math.round((60 / kmhOld - 60 / kmhNew) * CARDIO_PER[k][0] * 60);
  return { s: Math.sign(d), t: d ? `${Math.abs(d)} ${CARDIO_PER[k][2]} ${d > 0 ? 'schneller' : 'langsamer'}` : 'gleiches Tempo' };
}
// vorherige Einheit derselben Aktivität (vor c; für das Formular: die letzte bis zum gewählten Datum, ohne die bearbeitete)
function cardioPrev(type, date, exceptId, before) {
  let best = null, bi = -1;
  data.cardio.forEach((x, i) => {
    if (x.type !== type || x.id === exceptId || x.date > date) return;
    if (before != null && x.date === date && i >= before) return;
    if (!best || x.date > best.date || (x.date === best.date && i > bi)) { best = x; bi = i; }
  });
  return best;
}
const cardioPrevOf = c => cardioPrev(c.type, c.date, c.id, data.cardio.indexOf(c));
// Vergleich c gegen p: Teile [{ s, t }] und Hauptrichtung (Tempo, sonst Dauer)
function cardioCmp(c, p) {
  const parts = [], kn = cardioKmh(c), ko = cardioKmh(p);
  if (kn && ko) parts.push(cardioSpeedDelta(c.type, kn, ko));
  if (c.km != null && p.km != null && round1(c.km - p.km)) { const d = round1(c.km - p.km); parts.push({ s: Math.sign(d), t: `${d > 0 ? '+' : '−'}${fmtNum(Math.abs(d))} km` }); }
  if (c.min !== p.min) parts.push({ s: Math.sign(c.min - p.min), t: `${c.min > p.min ? '+' : '−'}${Math.abs(c.min - p.min)} min` });
  return { parts, s: parts.length ? parts[0].s : 0 };
}
// Bestwerte einer Aktivität (ohne exceptId): längste Strecke, längste Dauer, schnellstes Tempo (ab 1 km)
function cardioBest(type, exceptId) {
  const l = data.cardio.filter(x => x.type === type && x.id !== exceptId);
  const sp = l.filter(x => x.km >= 1).map(cardioKmh).filter(Boolean);
  return { n: l.length, km: Math.max(0, ...l.map(x => x.km || 0)), min: Math.max(0, ...l.map(x => x.min)), kmh: sp.length ? Math.max(...sp) : 0 };
}
function cardioRecords(c) {
  const b = cardioBest(c.type, c.id), r = [];
  if (!b.n) return r;
  if (c.km && b.km && c.km > b.km) r.push('längste Strecke');
  if (c.min > b.min) r.push('längste Dauer');
  const k = cardioKmh(c);
  if (k && c.km >= 1 && b.kmh && k > b.kmh + 1e-9) r.push('schnellstes Tempo');
  return r;
}
const cardioArrow = s => s > 0 ? '<span class="cmp up" aria-hidden="true">▲</span>' : s < 0 ? '<span class="cmp down" aria-hidden="true">▼</span>' : '<span class="cmp" aria-hidden="true">＝</span>';
const cardioPartsHtml = parts => parts.map(x => `<span>${x.t}</span>`).join(' | ');
// „Letztes Mal“ für das Formular
function cardioLastHtml(f) {
  const p = cardioPrev(f.type, f.date || todayISO(), f.id);
  if (!p) return `<p class="hint nut-small cardio-last">Noch keine Einheit ${esc((CARDIO_TYPES[f.type] || CARDIO_TYPES.other).label)}. Ab dem nächsten Mal siehst du hier den Vergleich.</p>`;
  const k = cardioKmh(p);
  return `<p class="hint nut-small cardio-last"><b>Letztes Mal</b> <span>${fmtDate(p.date + 'T12:00:00')}</span>: <span>${p.min} min</span>${p.km != null ? ` | <span>${fmtNum(p.km)} km</span>` : ''}${k ? ` | <span>${cardioSpeedTxt(p.type, k)}</span>` : ''} | <span>${CARDIO_LEVELS[p.level] ? CARDIO_LEVELS[p.level].label : ''}</span></p>`;
}
let cardioCmpId = null;  // gerade gespeicherte Einheit: Vergleich oben anzeigen
function cardioCmpCard() {
  const c = cardioCmpId && data.cardio.find(x => x.id === cardioCmpId);
  if (!c) return '';
  const t = CARDIO_TYPES[c.type] || CARDIO_TYPES.other, p = cardioPrevOf(c), rec = cardioRecords(c);
  if (!p) return `<div class="card cardio-cmp"><p><b>${t.icon} Erste Einheit ${esc(t.label)}</b></p><p class="hint nut-small">Ab dem nächsten Mal vergleicht die App mit dieser Einheit.</p></div>`;
  const cmp = cardioCmp(c, p);
  return `<div class="card cardio-cmp"><p><b>${t.icon} Vergleich mit dem letzten Mal</b> <small class="hint">${fmtDate(p.date + 'T12:00:00')}</small></p>
      <p class="cardio-cmp-row">${cmp.parts.length ? cardioArrow(cmp.s) + ' ' + cardioPartsHtml(cmp.parts) : '<span>Genauso wie beim letzten Mal.</span>'}</p>
      ${rec.map(r => `<p class="cardio-rec">🏆 <span>Neue Bestleistung: ${r}</span></p>`).join('')}</div>`;
}

let cardioForm = null;  // { id?, date, type, level, min (Text), km (Text), kcal (Text), own }

function cardioFormFresh(c) {
  return c ? { id: c.id, date: c.date, type: c.type, level: c.level, min: String(c.min), km: c.km != null ? fmtNum(c.km) : '',
      kcal: c.own ? String(c.kcal) : '', own: !!c.own }
    : { id: null, date: todayISO(), type: (data.cardio[data.cardio.length - 1] || {}).type || 'run', level: 'mid', min: '30', km: '', kcal: '', own: false };
}

function cardioEstimateText() {
  const f = cardioForm, min = parseNum(f.min);
  if (!min || min <= 0) return 'Dauer eintragen, dann schätzt die App den Verbrauch.';
  const est = cardioEstimate(f.type, f.level, min);
  return `Geschätzt: <b>ca. ${deNum(est)} kcal</b> zusätzlich zum Grundumsatz (bei ${fmtNum(round1(cardioKg()))} kg Körpergewicht).`;
}

function renderCardio() {
  if (!cardioForm) cardioForm = cardioFormFresh();
  const f = cardioForm;
  const n = data.nutrition;
  const typeBtn = ([k, t]) => `<button class="cardio-type ${f.type === k ? 'on' : ''}" data-action="cardio-type" data-k="${k}"><span>${t.icon}</span>${t.label}</button>`;
  let h = `${cardioCmpCard()}<div class="card cardio-form">
      <p class="lbl">Aktivität</p>
      <div class="cardio-types">${Object.entries(CARDIO_TYPES).map(typeBtn).join('')}</div>
      ${cardioLastHtml(f)}
      <p class="lbl">Wie anstrengend?</p>
      <div class="seg three">${Object.entries(CARDIO_LEVELS).map(([k, l]) =>
        `<button class="${f.level === k ? 'on' : ''}" data-action="cardio-level" data-k="${k}">${l.label}</button>`).join('')}</div>
      <p class="hint nut-small">${CARDIO_LEVELS[f.level].label}: ${CARDIO_LEVELS[f.level].text}.</p>
      <label class="row"><span>Dauer (Minuten)</span>
        <input class="inp kg" type="text" inputmode="numeric" autocomplete="off" data-field="cardio-in" data-k="min" value="${esc(f.min)}"></label>
      <label class="row"><span>Strecke (km)<br><small class="hint">freiwillig</small></span>
        <input class="inp kg" type="text" inputmode="decimal" autocomplete="off" data-field="cardio-in" data-k="km" value="${esc(f.km)}" placeholder="–"></label>
      <label class="row"><span>Datum</span><input class="inp date" type="date" data-field="cardio-in" data-k="date" value="${f.date}" max="${todayISO()}"></label>
      <p class="hint nut-small" id="cardio-est">${cardioEstimateText()}</p>
      <label class="row"><span>Eigener Wert (kcal)<br><small class="hint">freiwillig, z. B. von der Uhr</small></span>
        <input class="inp kg" type="text" inputmode="numeric" autocomplete="off" data-field="cardio-in" data-k="kcal" value="${esc(f.kcal)}" placeholder="–"></label>
      <div class="row">${f.id ? '<button class="btn" data-action="cardio-cancel">Abbrechen</button>' : ''}
        <button class="btn primary" data-action="cardio-save">${f.id ? '✔ Speichern' : '＋ Eintragen'}</button></div>
    </div>`;
  // Tagesziel: Cardio einrechnen (nur mit eingerichteter Ernährung)
  if (n && nutReady(n)) {
    const on = !!n.cardioAdd;
    h += `<div class="card">
        <h2>Ins Tagesziel einrechnen?</h2>
        <div class="seg two"><button class="${on ? 'on' : ''}" data-action="cardio-add" data-v="1">Ja</button>
          <button class="${on ? '' : 'on'}" data-action="cardio-add" data-v="0">Nein</button></div>
        <p class="hint nut-small"><b>Ja:</b> An Tagen mit Cardio oder Yoga erhöht sich dein Tagesziel um den Verbrauch, vor allem als Kohlenhydrate,
          die du zum Auftanken brauchst. <b>Nein</b> ist sinnvoll, wenn du dein Cardio schon bei der Aktivität in deinen Angaben
          berücksichtigt hast (sonst zählt es doppelt) oder wenn du in der Diät bewusst etwas mehr Defizit möchtest.
          Fitness-Uhren schätzen oft eher zu hoch. Lieber vorsichtig eintragen.</p>
      </div>`;
  }
  h += schedCardHtml('cardio');  // v377: Wochenplaner
  // Einträge
  const list = [...data.cardio].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 40);
  if (list.length) {
    h += `<h2>Deine Einheiten</h2><ul class="list">${list.map(c => cardioRowHtml(c, true)).join('')}</ul>`;
  } else {
    h += '<p class="hint">Noch keine Cardio-Einheiten eingetragen.</p>';
  }
  return h + `<p class="hint nut-small explain">Die Kalorien sind Schätzwerte aus Aktivität, Anstrengung, Dauer und Körpergewicht (MET-Werte). Gezählt wird nur,
    was du zusätzlich zum Ruhezustand verbrauchst. Cardio hat keinen Einfluss auf deinen Trainingsplan.</p>`;
}

// Eine Einheit als Zeile: im Cardio-Bildschirm mit Bearbeiten/Löschen, sonst als Knopf zum Bearbeiten (z. B. Kalendertag)
function cardioRowHtml(c, edit = false) {
  const t = CARDIO_TYPES[c.type] || CARDIO_TYPES.other;
  const info = `${fmtDate(c.date + 'T12:00:00')} | ${c.min} min${c.km != null ? ` | ${fmtNum(c.km)} km` : ''} | `
    + `${CARDIO_LEVELS[c.level] ? CARDIO_LEVELS[c.level].label + ' | ' : ''}ca. ${deNum(c.kcal)} kcal${c.own ? ' (eigener Wert)' : ''}`;
  if (!edit) return `<button class="btn nav" data-action="cardio-open-edit" data-id="${c.id}">${t.icon} <span>${t.label}</span><small>${info}</small></button>`;
  const p = cardioPrevOf(c), cmp = p && cardioCmp(c, p), k = cardioKmh(c);
  const extra = (k ? `<span>${cardioSpeedTxt(c.type, k)}</span>` : '') + (cmp && cmp.parts.length ? `${k ? ' | ' : ''}${cardioArrow(cmp.s)} ${cardioPartsHtml(cmp.parts.slice(0, 2))}` : '');
  return `<li class="bw-row cardio-row"><span>${t.icon} <span>${t.label}</span><small class="hint">${info}</small>${extra ? `<small class="hint cardio-row-cmp">${extra}</small>` : ''}</span>
      <button class="icon-btn" data-action="cardio-edit" data-id="${c.id}" aria-label="Bearbeiten">✎</button>
      <button class="icon-btn danger" data-action="cardio-del" data-id="${c.id}" aria-label="Löschen">✕</button></li>`;
}

/* ---------- Cardio-Statistik (Reiter Diagramme → Cardio) ---------- */

const cardioStat = { range: 91, metric: 'min' };
const CARDIO_RANGES = [['4 Wochen', 28], ['3 Monate', 91], ['Jahr', 365], ['Alles', 0]];
const CARDIO_METRICS = { min: 'Zeit', km: 'Strecke', kcal: 'kcal' };
const cardioSum = (list, k) => list.reduce((a, c) => a + (c[k] || 0), 0);
const cardioIcon = c => (CARDIO_TYPES[c.type] || CARDIO_TYPES.other).icon;

// Balken der letzten 12 Wochen (Montag bis Sonntag) für die gewählte Größe
function cardioBars() {
  const k = cardioStat.metric, today = todayISO();
  const monday = addDaysISO(today, -((new Date(today + 'T12:00:00').getDay() + 6) % 7));
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const from = addDaysISO(monday, -7 * (11 - i)), to = addDaysISO(from, 6);
    return { from, v: cardioSum(data.cardio.filter(c => c.date >= from && c.date <= to), k) };
  });
  if (k === 'km' && !data.cardio.some(c => c.km != null)) {
    return '<p class="hint">Noch keine Strecken eingetragen. Beim Eintragen gibt es dafür das Feld „Strecke (km)“.</p>';
  }
  const max = Math.max(...weeks.map(w => w.v));
  if (!max) return '<p class="hint">In den letzten 12 Wochen keine Einheiten.</p>';
  const ticks = niceTicks(0, max).filter(t => t >= 0);
  const top = ticks[ticks.length - 1];
  const W = 340, H = 180, L = 36, R = 6, T = 14, B = 24, pw = W - L - R, ph = H - T - B;
  const Y = v => T + (1 - v / top) * ph, bw = pw / 12;
  const fmtV = v => k === 'km' ? fmtNum(round1(v)) : deNum(Math.round(v));
  let svg = `<svg class="chart-svg cardio-bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cardio pro Woche: ${CARDIO_METRICS[k]}">`;
  for (const t of ticks) {
    svg += `<line class="c-grid" x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}"/>
      <text class="c-text" x="${L - 6}" y="${Y(t) + 4}" text-anchor="end">${fmtV(t)}</text>`;
  }
  weeks.forEach((w, i) => {
    const x = L + i * bw + bw * .18, h = Y(0) - Y(w.v);
    if (w.v) {
      svg += `<rect class="c-bar ${i === 11 ? 'now' : ''}" x="${x}" y="${Y(w.v)}" width="${bw * .64}" height="${Math.max(1.5, h)}" rx="3"/>
        <text class="c-val" x="${x + bw * .32}" y="${Y(w.v) - 3}" text-anchor="middle">${fmtV(w.v)}</text>`;
    }
    if (i % 3 === 2 || i === 11) {
      svg += `<text class="c-text" x="${x + bw * .32}" y="${H - 7}" text-anchor="middle">${i === 11 ? 'diese' : w.from.slice(8, 10) + '.' + w.from.slice(5, 7) + '.'}</text>`;
    }
  });
  return svg + `</svg><p class="hint cardio-unit">${{ min: 'Minuten', km: 'Kilometer', kcal: 'kcal (geschätzter Mehrverbrauch)' }[k]} pro Woche, Beschriftung = Montag der Woche</p>`;
}

function renderCardioStats() {
  const all = data.cardio, today = todayISO();
  const add = '<button class="btn primary cardio-add-btn" data-action="cardio-open">🏃 Cardio eintragen</button>';
  if (!all.length) {
    return `<p class="hint">Noch keine Cardio-Einheiten eingetragen. Sobald du welche einträgst, siehst du hier Zeit, Strecke,
      verbrannte Kalorien, einen Kalender und die Aufteilung nach Aktivität.</p>${add}`;
  }
  const from = cardioStat.range ? addDaysISO(today, -(cardioStat.range - 1)) : '';
  const list = all.filter(c => c.date >= from && c.date <= today);
  const km = cardioSum(list, 'km'), withKm = list.some(c => c.km != null);
  let h = `<div class="seg cardio-range">${CARDIO_RANGES.map(([l, d]) =>
    `<button class="${cardioStat.range === d ? 'on' : ''}" data-action="cardio-range" data-d="${d}">${l}</button>`).join('')}</div>
    <div class="stats cardio-stats">
      <div class="stat"><span>Einheiten</span><b>${list.length}</b></div>
      <div class="stat"><span>Zeit</span><b>${fmtDur(cardioSum(list, 'min'))}</b></div>
      <div class="stat"><span>Strecke</span><b>${withKm ? fmtNum(round1(km)) + ' km' : '–'}</b></div>
      <div class="stat"><span>Verbrannt</span><b>${deNum(cardioSum(list, 'kcal'))} kcal</b></div>
    </div>`;
  // pro Woche
  h += `<h2>Pro Woche</h2><div class="seg three">${Object.entries(CARDIO_METRICS).map(([k, l]) =>
    `<button class="${cardioStat.metric === k ? 'on' : ''}" data-action="cardio-metric" data-k="${k}">${l}</button>`).join('')}</div>
    <div class="card cardio-chart">${cardioBars()}</div>`;
  // Kalender
  const st = calGet('cardio');
  h += '<h2>Kalender</h2>' + calendarHtml('cardio', iso => {
    const cs = all.filter(c => c.date === iso);
    return cs.length ? { cls: 'cd', sub: cardioIcon(cs[0]) + (cs.length > 1 ? '+' : '') } : null;
  }, iso => schedCalMark(iso, ['cardio']));
  if (st.sel) {
    const cs = all.filter(c => c.date === st.sel);
    h += `<div class="card cal-day"><p class="cal-day-head"><b>${fmtDate(st.sel + 'T12:00:00', true)}</b></p>
      ${cs.length ? cs.map(c => cardioRowHtml(c)).join('') : '<p class="hint">An diesem Tag kein Cardio.</p>'}</div>`;
  }
  // nach Aktivität (gewählter Zeitraum)
  const byType = {};
  for (const c of list) (byType[c.type] = byType[c.type] || []).push(c);
  const types = Object.entries(byType).sort((a, b) => cardioSum(b[1], 'min') - cardioSum(a[1], 'min'));
  if (types.length) {
    h += `<h2>Nach Aktivität</h2><ul class="list">${types.map(([k, cs]) => {
      const t = CARDIO_TYPES[k] || CARDIO_TYPES.other, tkm = cardioSum(cs, 'km');
      const b = cardioBest(k);
      return `<li class="bw-row cardio-row"><span>${t.icon} <span>${t.label}</span><small class="hint">${cs.length}× | ${fmtDur(cardioSum(cs, 'min'))}${
        cs.some(c => c.km != null) ? ` | ${fmtNum(round1(tkm))} km` : ''} | ca. ${deNum(cardioSum(cs, 'kcal'))} kcal</small>
        <small class="hint cardio-best">🏆 <span>Bestwerte:</span> ${[b.km ? `<span>${fmtNum(b.km)} km</span>` : '', `<span>${fmtDur(b.min)}</span>`, b.kmh ? `<span>${cardioSpeedTxt(k, b.kmh)}</span>` : ''].filter(Boolean).join(' | ')}</small></span></li>`;
    }).join('')}</ul>`;
  }
  h += cardioSpeedChart();
  return h + add;
}

// Tempo-Verlauf einer Aktivität (letzte 20 Einheiten mit Strecke), oben = schneller
const cardioStatType = { k: null };
function cardioSpeedChart() {
  const types = Object.keys(CARDIO_TYPES).filter(k => data.cardio.filter(c => c.type === k && cardioKmh(c)).length >= 2);
  if (!types.length) return '';
  if (!types.includes(cardioStatType.k)) cardioStatType.k = types[0];
  const k = cardioStatType.k, list = data.cardio.filter(c => c.type === k && cardioKmh(c)).sort((a, b) => a.date.localeCompare(b.date)).slice(-20);
  const v = list.map(cardioKmh), lo = Math.min(...v), hi = Math.max(...v), pad = Math.max((hi - lo) * 0.15, hi * 0.03);
  const y0 = lo - pad, y1 = hi + pad, W = 340, H = 170, L = 58, R = 10, T = 12, B = 24, pw = W - L - R, ph = H - T - B;
  const X = i => L + (list.length === 1 ? pw / 2 : i * pw / (list.length - 1)), Y = s => T + (1 - (s - y0) / (y1 - y0)) * ph;
  let svg = `<svg class="chart-svg cardio-speed" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tempo-Verlauf">`;
  for (const t of [y0 + (y1 - y0) * 0.15, (y0 + y1) / 2, y1 - (y1 - y0) * 0.15]) {
    svg += `<line class="c-grid" x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="c-text" x="${L - 6}" y="${Y(t) + 4}" text-anchor="end">${cardioSpeedTxt(k, t).replace(/ min\/.*| km\/h/, '')}</text>`;
  }
  svg += `<polyline class="c-line" fill="none" points="${list.map((c, i) => `${X(i)},${Y(v[i])}`).join(' ')}"/>`;
  list.forEach((c, i) => { svg += `<circle class="c-dot" cx="${X(i)}" cy="${Y(v[i])}" r="3.5"/>`; });
  svg += `<text class="c-text" x="${L}" y="${H - 7}">${fmtDate(list[0].date + 'T12:00:00')}</text><text class="c-text" x="${W - R}" y="${H - 7}" text-anchor="end">${fmtDate(list[list.length - 1].date + 'T12:00:00')}</text></svg>`;
  const unit = CARDIO_SPEED[k] === 'kmh' || !CARDIO_SPEED[k] ? 'km/h' : 'min' + CARDIO_PER[CARDIO_SPEED[k]][1];
  return `<h2>Tempo-Verlauf</h2>${types.length > 1 ? `<div class="variants">${types.map(t => `<button class="vchip ${t === k ? 'on' : ''}" data-action="cardio-speed-type" data-k="${t}">${CARDIO_TYPES[t].icon} ${CARDIO_TYPES[t].label}</button>`).join('')}</div>` : ''}
    <div class="card cardio-chart">${svg}<p class="hint cardio-unit">Tempo in ${unit}, oben = schneller, letzte ${list.length} Einheiten mit Strecke</p></div>`;
}

views.cardio = { title: 'Cardio', tab: 'start', back: 'start', render: renderCardio };

Object.assign(actions, {
  'cardio-open': () => { cardioForm = null; cardioCmpId = null; go('cardio'); },
  'cardio-type': el => { cardioForm.type = el.dataset.k; cardioCmpId = null; render(); },
  'cardio-level': el => { cardioForm.level = el.dataset.k; render(); },
  'cardio-cancel': () => { cardioForm = null; render(); },
  'cardio-save': () => {
    const f = cardioForm;
    const min = parseNum(f.min);
    if (!min || min <= 0 || min > 600) { alert('Bitte eine Dauer zwischen 1 und 600 Minuten eintragen.'); return; }
    const ownK = String(f.kcal).trim() === '' ? null : parseNum(f.kcal);
    if (ownK != null && (ownK < 0 || ownK > 5000)) { alert('Bitte einen Kalorienwert zwischen 0 und 5.000 eintragen oder das Feld leer lassen.'); return; }
    const km = String(f.km || '').trim() === '' ? null : parseNum(f.km);
    if (km != null && (!(km > 0) || km > 500)) { alert('Bitte eine Strecke zwischen 0,1 und 500 km eintragen oder das Feld leer lassen.'); return; }
    const entry = { id: f.id || uid(), date: f.date || todayISO(), type: f.type, level: f.level, min: Math.round(min),
      kcal: ownK != null ? Math.round(ownK) : cardioEstimate(f.type, f.level, min), own: ownK != null };
    if (km != null) entry.km = round1(km);
    const i = data.cardio.findIndex(c => c.id === entry.id);
    if (i >= 0) data.cardio[i] = entry; else data.cardio.push(entry);
    saveData();
    const added = data.nutrition && data.nutrition.cardioAdd && entry.date === todayISO();
    toast(`${CARDIO_TYPES[entry.type].icon} Eingetragen: ${entry.min} min${entry.km ? ` | ${fmtNum(entry.km)} km` : ''} | ca. ${deNum(entry.kcal)} kcal${added ? ', Tagesziel erhöht' : ''}`);
    cardioForm = cardioFormFresh();
    cardioForm.type = entry.type;
    cardioCmpId = entry.id;
    render();
    window.scrollTo(0, 0);
  },
  'cardio-open-edit': el => { cardioForm = cardioFormFresh(data.cardio.find(c => c.id === el.dataset.id)); go('cardio'); },
  'cardio-range': el => { cardioStat.range = Number(el.dataset.d); render(); },
  'cardio-metric': el => { cardioStat.metric = el.dataset.k; render(); },
  'cardio-speed-type': el => { cardioStatType.k = el.dataset.k; render(); },
  'cardio-edit': el => { cardioForm = cardioFormFresh(data.cardio.find(c => c.id === el.dataset.id)); render(); window.scrollTo(0, 0); },
  'cardio-del': el => {
    const c = data.cardio.find(x => x.id === el.dataset.id);
    if (!c || !askOk(`${(CARDIO_TYPES[c.type] || CARDIO_TYPES.other).label} vom ${fmtDate(c.date + 'T12:00:00')} löschen?`)) return;
    data.cardio = data.cardio.filter(x => x !== c);
    saveData(); render();
  },
  'cardio-add': el => {
    data.nutrition.cardioAdd = el.dataset.v === '1';
    saveData();
    toast(data.nutrition.cardioAdd ? 'Cardio zählt jetzt zum Tagesziel' : 'Cardio zählt nicht zum Tagesziel');
    render();
  },
});

fields['cardio-in'] = el => {
  cardioForm[el.dataset.k] = el.value;
  const est = document.getElementById('cardio-est');
  if (est) est.innerHTML = cardioEstimateText();
};

/* ---------- v377: Wochenplaner für Cardio, Yoga und Mobility (User-Wunsch 2026-11-24) ----------
   data.sched = { cardio|yoga|mob: { mode: 'days'|'times'|'every', days: [0–6, Mo = 0], times: 1–7, every: 1–7, min: Minuten|null,
     from: 'JJJJ-MM-TT' (ab wann), moved: { geplantes Datum: neues Datum | '' (ausgelassen) }, skip?: Datum (alle n Tage: frühestens),
     hide?: Datum (x-mal pro Woche: heute ausgeblendet) } }
   Fällig: feste Tage = Wochentag passt oder dorthin verschoben; x-mal pro Woche = Wochensoll (Mo–So) noch offen und heute noch nichts;
   alle n Tage = n Tage nach der letzten Einheit. Erledigt = an dem Tag eine Einheit eingetragen. Verpasst (nur feste Tage, letzte 7 Tage):
   kein Eintrag an dem Tag und auch danach keiner an einem ungeplanten Tag (dann gilt er als nachgeholt). */
const SCHED_KINDS = {
  cardio: { label: 'Cardio', icon: '🏃', open: 'cardio-open', list: () => data.cardio || [] },
  yoga: { label: 'Yoga', icon: '🧘', open: 'yoga-open', list: () => data.yoga || [] },
  mob: { label: 'Mobility', icon: '🤸', open: 'mobs-open', list: () => data.mobility || [] },
};
const SCHED_WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const SCHED_MISS_DAYS = 7;
const isoWd = iso => (new Date(iso + 'T12:00:00').getDay() + 6) % 7;
const weekMonday = iso => addDaysISO(iso, -isoWd(iso));
const schedOf = k => (data.sched && data.sched[k]) || null;
const schedAny = () => Object.keys(SCHED_KINDS).some(schedOf);
const schedDone = (k, iso) => SCHED_KINDS[k].list().some(x => x.date === iso);
function schedEveryDue(k) {
  const s = schedOf(k), done = SCHED_KINDS[k].list().map(x => x.date).filter(d => d <= todayISO()).sort();
  let due = done.length ? addDaysISO(done[done.length - 1], s.every) : s.from;
  if (s.skip && s.skip > due) due = s.skip;
  return due;
}
// Ist am Tag iso etwas geplant? (x-mal pro Woche hat keine festen Tage)
function schedPlannedOn(k, iso) {
  const s = schedOf(k);
  if (!s || iso < s.from) return false;
  if (s.mode === 'days') {
    const mv = s.moved || {};
    if (Object.values(mv).includes(iso)) return true;
    return s.days.includes(isoWd(iso)) && !(iso in mv);
  }
  if (s.mode === 'every') {
    const due = schedEveryDue(k), t = todayISO();
    if (iso < t) return false;
    const start = due > t ? due : t;
    return iso >= start && Math.round((new Date(iso + 'T12:00:00') - new Date(start + 'T12:00:00')) / 864e5) % s.every === 0;
  }
  return false;
}
// geplante Einheiten in der Woche von iso (Mo–So)
function schedWeekPlanned(k, iso = todayISO()) {
  const s = schedOf(k), mo = weekMonday(iso);
  if (s.mode === 'times') return s.times;
  if (s.mode === 'every') return Math.max(1, Math.round(7 / s.every));
  let n = 0;
  for (let i = 0; i < 7; i++) if (schedPlannedOn(k, addDaysISO(mo, i))) n++;
  return n;
}
const schedWeekDone = (k, iso = todayISO()) => { const mo = weekMonday(iso), su = addDaysISO(mo, 6); return new Set(SCHED_KINDS[k].list().filter(x => x.date >= mo && x.date <= su).map(x => x.date)).size; };
// heute fällig? null oder { left?, since? }
function schedToday(k) {
  const s = schedOf(k), t = todayISO();
  if (!s || schedDone(k, t)) return null;
  if (s.mode === 'days') return schedPlannedOn(k, t) ? {} : null;
  if (s.mode === 'times') { if (s.hide === t) return null; const n = schedWeekDone(k); return n < s.times ? { left: s.times - n } : null; }
  const due = schedEveryDue(k);
  return due <= t ? { since: due < t ? due : null } : null;
}
// zuletzt verpasster fester Tag (letzte 7 Tage) oder null
function schedMissed(k) {
  const s = schedOf(k), t = todayISO();
  if (!s || s.mode !== 'days') return null;
  for (let i = 1; i <= SCHED_MISS_DAYS; i++) {
    const iso = addDaysISO(t, -i);
    if (iso < s.from || !schedPlannedOn(k, iso) || schedDone(k, iso)) continue;
    let caught = false;
    for (let j = i - 1; j >= 0 && !caught; j--) { const d = addDaysISO(t, -j); if (schedDone(k, d) && !schedPlannedOn(k, d)) caught = true; }
    return caught ? null : iso;
  }
  return null;
}
// geplanten Tag iso verschieben (to = '' → auslassen); war iso selbst schon ein verschobener Tag, wird der ursprüngliche Eintrag geändert
function schedMove(k, iso, to) {
  const s = schedOf(k);
  if (!s.moved) s.moved = {};
  const from = Object.keys(s.moved).find(f => s.moved[f] === iso) || iso;
  s.moved[from] = to;
  // alte Einträge aufräumen
  const old = addDaysISO(todayISO(), -40);
  for (const f of Object.keys(s.moved)) if (f < old && (!s.moved[f] || s.moved[f] < old)) delete s.moved[f];
}
// Text des Rhythmus; Wochentage und Teile einzeln in <span>, damit die Übersetzung greift (Toast: plain = true)
function schedText(s, plain = false) {
  const sp = x => plain ? x : `<span>${x}</span>`;
  const r = s.mode === 'days' ? s.days.map(d => sp(SCHED_WD[d])).join(', ') : sp(s.mode === 'times' ? `${s.times}× pro Woche` : s.every === 1 ? 'jeden Tag' : `alle ${s.every} Tage`);
  return r + (s.min ? ` | ${sp(`${s.min} min`)}` : '');
}
const schedDateTxt = iso => fmtDate(iso + 'T12:00:00');
// v398: Routine für den Tag (Yoga, Mobility): bei festen Tagen je Wochentag, sonst eine für alle
function schedRt(k, iso = todayISO()) {
  const s = schedOf(k);
  if (!s || typeof rtGet !== 'function') return null;
  const id = (s.mode === 'days' && s.rtDays && s.rtDays[isoWd(iso)]) || s.rt || '';
  return id ? rtGet(k, id) : null;
}
function schedRtSel(k, val, d) {
  if (typeof rtFixed !== 'function') return '';
  const opt = r => `<option value="${r.id}" ${val === r.id ? 'selected' : ''}>${esc(r.name)}</option>`, own = rtOwn(k);
  return `<select class="inp sched-rt" data-field="sched-rt" data-d="${d}"><option value="">Ohne feste Routine</option>
    ${own.length ? `<optgroup label="Meine Routinen">${own.map(opt).join('')}</optgroup>` : ''}<optgroup label="Fertige Routinen">${rtFixed(k).map(opt).join('')}</optgroup></select>`;
}

// Startseite: „Heute geplant“ und Wochenstand
function schedStartHtml() {
  if (!schedAny()) return '';
  const t = todayISO(), rows = [], prog = [];
  for (const [k, K] of Object.entries(SCHED_KINDS)) {
    const s = schedOf(k);
    if (!s) continue;
    prog.push(`<span>${K.icon} <span>${K.label}</span> <span>${schedWeekDone(k)}/${schedWeekPlanned(k)}</span></span>`);
    const miss = schedMissed(k);
    if (miss) rows.push(`<div class="sched-row miss"><span><b>${K.icon} <span>${K.label}</span></b><small><span>Verpasst am</span> ${schedDateTxt(miss)}</small></span>
        <div class="sched-btns"><button class="btn small" data-action="sched-move" data-k="${k}" data-d="${miss}" data-to="${t}">Heute nachholen</button>
        <button class="btn small" data-action="sched-move" data-k="${k}" data-d="${miss}" data-to="">Auslassen</button></div></div>`);
    const due = schedToday(k);
    const rtd = due && k !== 'cardio' ? schedRt(k) : null;
    if (due) rows.push(`<div class="sched-row"><span><b>${K.icon} <span>${K.label}</span>${rtd ? `: ${esc(rtd.name)}` : s.min ? ` <span>${s.min} min</span>` : ''}</b><small>${due.left
        ? `noch ${due.left}× diese Woche` : due.since ? `<span>Fällig seit</span> ${schedDateTxt(due.since)}` : 'Heute geplant'}</small></span>
        <div class="sched-btns"><button class="btn small primary" data-action="sched-start" data-k="${k}">▶ Start</button>
        <button class="btn small" data-action="sched-later" data-k="${k}">Morgen</button></div></div>`);
  }
  return (rows.length ? `<div class="card sched-today"><h2>📅 Heute geplant</h2>${rows.join('')}</div>` : '')
    + `<p class="hint nut-small sched-prog"><span>Diese Woche:</span> ${prog.join(' | ')}</p>`;
}
// Kalender: geplante Tage (heute, solange nicht erledigt, und in der Zukunft)
function schedCalMark(iso, kinds = Object.keys(SCHED_KINDS)) {
  if (iso < todayISO()) return null;
  const ks = kinds.filter(k => schedOf(k) && schedPlannedOn(k, iso) && !schedDone(k, iso));
  return ks.length ? { cls: 'pl', sub: ks.map(k => SCHED_KINDS[k].icon).join('') } : null;
}

// Karte im Bereich (Cardio, Yoga, Mobility): Rhythmus anzeigen und bearbeiten
let schedEdit = null;  // { k, mode, days, times, every, min }
function schedCardHtml(k) {
  const s = schedOf(k), e = schedEdit && schedEdit.k === k ? schedEdit : null;
  if (!e) {
    if (!s) return `<button class="btn outline nav sched-open" data-action="sched-edit" data-k="${k}">📅 Regelmäßig planen
        <small>Feste Wochentage, x-mal pro Woche oder alle paar Tage</small></button>`;
    const rts = k === 'cardio' ? '' : s.mode === 'days' && s.rtDays && Object.keys(s.rtDays).length
      ? s.days.filter(d => s.rtDays[d]).map(d => `<span>${SCHED_WD[d]}</span>: ${esc(rtNameOf(k, s.rtDays[d]))}`).join(' | ') : s.rt ? `<span>Routine</span>: ${esc(rtNameOf(k, s.rt))}` : '';
    return `<div class="card sched-card"><div class="sched-head"><span><span class="lbl">📅 Dein Rhythmus</span><small class="hint">${schedText(s)}</small>${rts ? `<small class="hint">${rts}</small>` : ''}</span>
        <button class="btn small" data-action="sched-edit" data-k="${k}">Ändern</button></div>
      <p class="hint nut-small"><span>Diese Woche:</span> ${schedWeekDone(k)} von ${schedWeekPlanned(k)}</p></div>`;
  }
  const seg = (v, l) => `<button class="${e.mode === v ? 'on' : ''}" data-action="sched-mode" data-v="${v}">${l}</button>`;
  const step = (what, label) => `<div class="sched-step"><button class="icon-btn" data-action="sched-n" data-w="${what}" data-d="-1" aria-label="Weniger" ${e[what] <= 1 ? 'disabled' : ''}>−</button>
      <b>${label}</b><button class="icon-btn" data-action="sched-n" data-w="${what}" data-d="1" aria-label="Mehr" ${e[what] >= 7 ? 'disabled' : ''}>＋</button></div>`;
  return `<div class="card sched-card"><p class="lbl">📅 Wie oft?</p>
      <div class="seg three">${seg('days', 'Feste Tage')}${seg('times', 'Pro Woche')}${seg('every', 'Alle paar Tage')}</div>
      ${e.mode === 'days' ? `<div class="variants sched-days">${SCHED_WD.map((w, i) => `<button class="vchip ${e.days.includes(i) ? 'on' : ''}" data-action="sched-day" data-d="${i}" aria-pressed="${e.days.includes(i)}">${w}</button>`).join('')}</div>`
        : e.mode === 'times' ? step('times', `${e.times}× pro Woche`) : step('every', e.every === 1 ? 'jeden Tag' : `alle ${e.every} Tage`)}
      <p class="hint nut-small">${e.mode === 'days' ? 'An diesen Wochentagen erinnert dich die Startseite.' : e.mode === 'times'
        ? 'Ohne feste Tage: Die Startseite erinnert dich, bis du die Einheiten der Woche (Montag bis Sonntag) geschafft hast.'
        : 'Gezählt ab deiner letzten Einheit. Machst du sie früher oder später, verschiebt sich der nächste Termin mit.'}</p>
      ${k === 'cardio' || typeof rtFixed !== 'function' ? '' : `<p class="lbl">Routine</p>${e.mode === 'days' && e.days.length
        ? `<div class="sched-rts">${e.days.map(d => `<label class="row sched-rt-row"><span>${SCHED_WD[d]}</span>${schedRtSel(k, (e.rtDays || {})[d] || '', d)}</label>`).join('')}</div>`
        : schedRtSel(k, e.rt || '', 'all')}<p class="hint nut-small">Mit Routine startet „▶ Start“ auf der Startseite sie direkt.</p>`}
      <label class="row"><span>Dauer (Minuten)<br><small class="hint">freiwillig</small></span>
        <input class="inp kg" type="text" inputmode="numeric" autocomplete="off" data-field="sched-min" value="${esc(e.min)}" placeholder="–"></label>
      <div class="row">${s ? '<button class="btn" data-action="sched-del">Entfernen</button>' : '<button class="btn" data-action="sched-cancel">Abbrechen</button>'}
        <button class="btn primary" data-action="sched-save">✔ Speichern</button></div>
      ${s ? '<button class="btn center sched-cancel" data-action="sched-cancel">Abbrechen</button>' : ''}
      <p class="hint nut-small">An geplanten Tagen erscheint auf der Startseite „Heute geplant“, im Kalender im Verlauf sind die Tage markiert.</p>
    </div>`;
}

Object.assign(actions, {
  'sched-edit': el => {
    const k = el.dataset.k, s = schedOf(k);
    schedEdit = { k, mode: s ? s.mode : 'days', days: s && s.days ? [...s.days] : [], times: s && s.times || 2, every: s && s.every || 2, min: s && s.min ? String(s.min) : '',
      rt: s && s.rt || '', rtDays: s && s.rtDays ? { ...s.rtDays } : {} };
    render();
  },
  'sched-cancel': () => { schedEdit = null; render(); },
  'sched-mode': el => { schedEdit.mode = el.dataset.v; render(); },
  'sched-day': el => { const d = +el.dataset.d, l = schedEdit.days, i = l.indexOf(d); if (i >= 0) l.splice(i, 1); else { l.push(d); if (schedEdit.rt && schedEdit.rtDays && !schedEdit.rtDays[d]) schedEdit.rtDays[d] = schedEdit.rt; } l.sort((a, b) => a - b); render(); },
  'sched-n': el => { const w = el.dataset.w; schedEdit[w] = Math.min(7, Math.max(1, schedEdit[w] + Number(el.dataset.d))); render(); },
  'sched-save': () => {
    const e = schedEdit;
    if (e.mode === 'days' && !e.days.length) { alert('Bitte mindestens einen Wochentag antippen.'); return; }
    const min = String(e.min).trim() === '' ? null : parseNum(e.min);
    if (min != null && !(min >= 1 && min <= 600)) { alert('Bitte eine Dauer zwischen 1 und 600 Minuten eintragen oder das Feld leer lassen.'); return; }
    if (!data.sched || typeof data.sched !== 'object') data.sched = {};
    const rtDays = {};
    if (e.mode === 'days') for (const d of e.days) if (e.rtDays && e.rtDays[d]) rtDays[d] = e.rtDays[d];
    data.sched[e.k] = { mode: e.mode, days: e.mode === 'days' ? [...e.days] : [], times: e.times, every: e.every, min: min != null ? Math.round(min) : null, from: todayISO(), moved: {},
      rt: e.mode === 'days' ? '' : e.rt || '', rtDays };
    schedEdit = null;
    saveData(); render();
    toast('📅 Rhythmus gespeichert');
  },
  'sched-del': () => {
    const k = schedEdit.k;
    if (!askOk(`Den Rhythmus für ${SCHED_KINDS[k].label} entfernen?`)) return;
    delete data.sched[k];
    schedEdit = null;
    saveData(); render();
  },
  'sched-start': el => {
    const k = el.dataset.k, s = schedOf(k), rtd = k !== 'cardio' ? schedRt(k) : null;
    if (rtd) { rtStart(k, rtd.id); return; }  // v398: geplante Routine direkt starten
    if (k === 'cardio' && s && s.min) { cardioForm = cardioFormFresh(); cardioForm.min = String(s.min); cardioCmpId = null; go('cardio'); return; }
    if (k === 'yoga' && s && s.min && typeof yogaFormFresh === 'function') { yogaForm = yogaFormFresh(); yogaForm.min = String(s.min); go('yoga'); return; }
    actions[SCHED_KINDS[k].open](el);
  },
  'sched-later': el => {
    const k = el.dataset.k, s = schedOf(k), t = todayISO(), tm = addDaysISO(t, 1);
    if (s.mode === 'days') schedMove(k, t, tm);
    else if (s.mode === 'every') s.skip = tm;
    else s.hide = t;
    saveData(); render();
    toast(s.mode === 'times' ? 'Für heute ausgeblendet' : 'Auf morgen verschoben');
  },
  'sched-move': el => {
    const k = el.dataset.k;
    schedMove(k, el.dataset.d, el.dataset.to);
    saveData(); render();
    toast(el.dataset.to ? 'Auf heute verschoben' : 'Ausgelassen');
  },
});
fields['sched-min'] = el => { if (schedEdit) schedEdit.min = el.value; };
fields['sched-rt'] = el => { if (!schedEdit) return; if (el.dataset.d === 'all') schedEdit.rt = el.value; else { if (!schedEdit.rtDays) schedEdit.rtDays = {}; schedEdit.rtDays[el.dataset.d] = el.value; } };
