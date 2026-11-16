/* LockYourGains | © 2026 Alex Hundt | Alle Rechte vorbehalten – siehe LICENSE */
'use strict';

/* ---------- Hyrox (v226, User 2026-11-13, erst in der Beta) ----------
   Einstieg: Umschalter „Kraft | Hyrox“ oben im Reiter Training.
   Schritt 2: echte Zeiten – Durchgänge (komplett, Hälfte, Stationen, Kompromiss-Lauf) mit laufender Uhr oder hinterher eingetragen,
   Bestzeiten je Abschnitt, Prognose, Verlauf, Erfolge. Daten: data.hyrox = { div, sessions: [] }, laufender Durchgang data.hyroxDraft.
   Schritt 3 (Wettkampf mit Datum, Phasen, Wochenplan) folgt. */

const sportDraft = () => typeof IS_BETA !== 'undefined' && IS_BETA;

// Umschalter oben im Reiter Training
function sportSwitch(on) {
  if (!sportDraft()) return '';
  const b = (k, label) => `<button class="${on === k ? 'on' : ''}" data-action="sport-mode" data-k="${k}">${label}</button>`;
  return `<div class="seg sport-seg">${b('kraft', '🏋️ Kraft')}${b('hyrox', '🏁 Hyrox')}</div>`;
}

/* ---------- Grunddaten ---------- */
// Klassen: Gewichte je Station (Stand Saison 2025/26, wie in der Übungsbibliothek)
const HX_DIVS = {
  wo: { label: 'Open Frauen', push: '102 kg', pull: '78 kg', farm: '2 × 16 kg', bag: '10 kg', ball: '4 kg | 2,70 m' },
  wp: { label: 'Pro Frauen', push: '152 kg', pull: '103 kg', farm: '2 × 24 kg', bag: '20 kg', ball: '6 kg | 2,70 m' },
  mo: { label: 'Open Männer', push: '152 kg', pull: '103 kg', farm: '2 × 24 kg', bag: '20 kg', ball: '6 kg | 3 m' },
  mp: { label: 'Pro Männer', push: '202 kg', pull: '153 kg', farm: '2 × 32 kg', bag: '30 kg', ball: '9 kg | 3 m' },
};
// Stationen in Wettkampf-Reihenfolge: [Schlüssel, Name, Strecke, Übung in der Bibliothek, Gewicht-Schlüssel]
const HX_STATIONS = [
  ['ski', 'SkiErg', '1.000 m', 'SkiErg', null],
  ['push', 'Sled Push', '50 m', 'Schlitten schieben', 'push'],
  ['pull', 'Sled Pull', '50 m', 'Schlitten ziehen (Sled Pull)', 'pull'],
  ['bbj', 'Burpee-Weitsprünge', '80 m', 'Burpee-Weitsprünge (Burpee Broad Jumps)', null],
  ['row', 'Rudern', '1.000 m', 'Rudergerät', null],
  ['farm', 'Farmers Carry', '200 m', "Farmer's Walk", 'farm'],
  ['lunge', 'Sandsack-Ausfallschritte', '100 m', 'Sandsack-Ausfallschritte (Sandbag Lunges)', 'bag'],
  ['wb', 'Wall Balls', '100 Wdh.', 'Wall Balls', 'ball'],
];
const HX_TYPES = {
  full: { label: 'Komplett-Durchgang', text: '8 × (1 km Laufen + Station), wie im Wettkampf.' },
  half1: { label: 'Erste Hälfte', text: 'Läufe 1–4 mit SkiErg, Sled Push, Sled Pull und Burpee-Weitsprüngen.' },
  half2: { label: 'Zweite Hälfte', text: 'Läufe 5–8 mit Rudern, Farmers Carry, Sandsack-Ausfallschritten und Wall Balls.' },
  cmp: { label: 'Kompromiss-Lauf', text: 'Je 1 km Laufen und danach eine Station. Du wählst die Stationen.' },
  st: { label: 'Nur Stationen', text: 'Einzelne Stationen auf Zeit, ohne Laufen. Du wählst die Stationen.' },
};
const HX_ROX_DEFAULT = 360;  // Roxzone gesamt, wenn noch nichts gemessen (6 min)

const hxData = () => { if (!data.hyrox) data.hyrox = { div: (data.profile && data.profile.sex === 'f') ? 'wo' : 'mo', sessions: [] }; return data.hyrox; };
const hxDiv = () => hxData().div || 'mo';

const hxTime = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`; };
const hxDiff = (a, b) => { const d = Math.round(a - b); return d === 0 ? '±0' : `${d > 0 ? '+' : '−'}${hxTime(Math.abs(d))}`; };
// „4:35“, „4.35“, „1:02:10“ oder Sekunden → Sekunden (null, wenn leer/ungültig)
function hxParse(v) {
  const t = String(v || '').trim().replace(',', '.');
  if (!t) return null;
  const parts = t.split(/[:.]/).map(Number);
  if (parts.some(x => !isFinite(x) || x < 0)) return null;
  const sec = parts.length === 1 ? parts[0] : parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] * 3600 + parts[1] * 60 + parts[2];
  return sec > 0 && sec < 6 * 3600 ? Math.round(sec) : null;
}

// Abschnitte eines Durchgangs: [{ k, label, dist, run, st }]
function hxSegs(type, picks = []) {
  const run = i => ({ k: 'run' + (i + 1), label: `Lauf ${i + 1}`, dist: '1 km', run: true });
  const st = i => ({ k: HX_STATIONS[i][0], label: HX_STATIONS[i][1], dist: HX_STATIONS[i][2], st: i });
  const idx = type === 'full' || type === 'race' ? [0, 1, 2, 3, 4, 5, 6, 7] : type === 'half1' ? [0, 1, 2, 3] : type === 'half2' ? [4, 5, 6, 7]
    : HX_STATIONS.map((_, i) => i).filter(i => picks.includes(HX_STATIONS[i][0]));
  if (type === 'st') return idx.map(st);
  if (type === 'cmp') return idx.flatMap(i => [{ k: 'run', label: 'Lauf', dist: '1 km', run: true }, st(i)]);
  return idx.flatMap(i => [run(i), st(i)]);
}
const hxSegWeight = seg => seg.st != null && HX_STATIONS[seg.st][4] ? HX_DIVS[hxDiv()][HX_STATIONS[seg.st][4]] : '';

/* ---------- Auswertung ---------- */
// Bestzeit je Abschnitt (Stationen je Schlüssel, Läufe je Nummer und „bester Kilometer“ insgesamt)
function hxBests(before = null) {
  const best = {};
  for (const s of hxData().sessions) {
    if (before && s.date >= before) continue;
    for (const g of s.segs) {
      if (!g.sec) continue;
      if (best[g.k] == null || g.sec < best[g.k]) best[g.k] = g.sec;
      if (g.run && (best.km == null || g.sec < best.km)) best.km = g.sec;
    }
  }
  return best;
}
const hxLastFull = () => [...hxData().sessions].reverse().find(s => (s.type === 'full' || s.type === 'race') && s.segs.every(g => g.sec));
// Prognose: letzter Komplett-Durchgang, sonst aus Bestzeiten (alle 8 Stationen + mind. ein Lauf nötig)
function hxPrognosis() {
  const full = hxLastFull();
  if (full) return { total: full.total, src: `aus dem Komplett-Durchgang vom ${fmtDate(full.date)}`, run: full.segs.filter(g => g.run).reduce((a, g) => a + g.sec, 0),
    st: full.segs.filter(g => !g.run).reduce((a, g) => a + g.sec, 0), rox: full.rox || 0 };
  const b = hxBests();
  if (!HX_STATIONS.every(([k]) => b[k]) || !b.km) return null;
  const runs = [...Array(8)].reduce((a, _, i) => a + (b['run' + (i + 1)] || Math.round(b.km * 1.06)), 0);
  const st = HX_STATIONS.reduce((a, [k]) => a + b[k], 0);
  const roxList = hxData().sessions.filter(s => s.rox && s.type !== 'st').map(s => s.rox / Math.max(1, s.segs.length - 1) * 15);
  const rox = roxList.length ? Math.round(roxList[roxList.length - 1]) : HX_ROX_DEFAULT;
  return { total: runs + st + rox, src: 'aus deinen Bestzeiten je Abschnitt' + (roxList.length ? '' : ' (Roxzone geschätzt 6 min)'), run: runs, st, rox };
}

/* ---------- Ansichten ---------- */
function renderHyrox() {
  const H = hxData(), p = hxPrognosis(), last = [...H.sessions].reverse().slice(0, 4);
  const bar = (v, cls, label) => `<i class="${cls}" style="width:${(v / p.total * 100).toFixed(1)}%" title="${label}"></i>`;
  const running = data.hyroxDraft;
  return `${sportSwitch('hyrox')}
    ${running ? `<button class="btn primary" data-action="hx-open" data-v="hyroxlive">⏱ Laufender Durchgang: ${esc(HX_TYPES[running.type].label)}<small>weiter zur Uhr</small></button>` : ''}
    ${hxRaceCard()}${hxWeekCard()}
    <div class="card"><h2>Prognose</h2>
      ${p ? `<div class="hx-goal"><div><small>Prognose</small><b>${hxTime(p.total)}</b></div><div><small>Läufe</small><b>${hxTime(p.run)}</b></div><div><small>Stationen</small><b>${hxTime(p.st)}</b></div></div>
        <div class="hx-split">${bar(p.run, 'run', 'Laufen')}${bar(p.st, 'st', 'Stationen')}${bar(p.rox, 'rox', 'Roxzone')}</div>
        <p class="hx-legend"><span class="run"></span>Laufen <span class="st"></span>Stationen <span class="rox"></span>Roxzone ${hxTime(p.rox)}</p>
        <p class="hint">${esc(p.src)}.</p>`
        : `<p class="hint">Sobald du einen Komplett-Durchgang gemacht hast oder jede Station und mindestens einen Lauf auf Zeit, rechnet die App hier deine voraussichtliche Wettkampfzeit aus.</p>`}
    </div>
    ${running ? '' : '<button class="btn primary" data-action="hx-open" data-v="hyroxnew">⏱ Durchgang starten</button>'}
    ${last.length ? `<div class="card"><h2>Zuletzt</h2>${last.map(hxSessionRow).join('')}</div>` : ''}
    <button class="btn nav" data-action="hx-open" data-v="hyroxst">📋 Stationen und Gewichte<small>Strecken, Gewichte für ${esc(HX_DIVS[hxDiv()].label)}, Ausführung</small></button>
    <button class="btn nav" data-action="hx-open" data-v="hyroxhist">📈 Zeiten und Bestzeiten<small>alle Durchgänge, Bestzeit je Abschnitt</small></button>`;
}
function hxSessionRow(s) {
  return `<button class="hx-day done" data-action="hx-ses" data-id="${s.id}"><span class="hx-dow">${new Date(s.date).toLocaleDateString(LOCALE(), { day: '2-digit', month: '2-digit' })}</span>
    <span class="hx-dtxt"><b>${esc(HX_TYPES[s.type].label)}</b><small>${s.segs.length} Abschnitte | ${s.mode === 'live' ? 'mit Uhr' : 'eingetragen'}</small></span><span class="hx-dst">${hxTime(s.total)}</span></button>`;
}

// Neuen Durchgang einrichten
let hxNew = null;
function renderHyroxNew() {
  if (!hxNew) hxNew = { type: 'full', mode: 'live', picks: ['ski', 'push', 'wb'], rox: true };
  const n = hxNew, chip = (act, k, label, on) => `<button class="vchip ${on ? 'on' : ''}" data-action="${act}" data-k="${k}">${label}</button>`;
  const pick = n.type === 'cmp' || n.type === 'st';
  const segs = hxSegs(n.type, n.picks);
  return `<div class="card"><h2>Was machst du?</h2>
      ${Object.entries(HX_TYPES).map(([k, t]) => `<button class="split-opt cat hx-type ${n.type === k ? 'on' : ''}" data-action="hx-type" data-k="${k}"><b>${t.label}</b><small>${t.text}</small></button>`).join('')}
      ${pick ? `<p class="lbl">Stationen</p><div class="variants hx-picks">${HX_STATIONS.map(([k, name]) => chip('hx-pick', k, name, n.picks.includes(k))).join('')}</div>` : ''}
    </div>
    <div class="card"><h2>Wie erfassen?</h2>
      <div class="variants">${chip('hx-mode', 'live', '⏱ Mit Uhr', n.mode === 'live')}${chip('hx-mode', 'manual', '✎ Hinterher eintragen', n.mode === 'manual')}</div>
      <p class="hint">${n.mode === 'live' ? 'Die Uhr läuft mit, du tippst nach jedem Abschnitt auf „fertig“. Dazwischen zählt die Roxzone (Wechselzone) mit, bis du den nächsten Abschnitt startest.'
        : 'Du trägst die Zeiten nach dem Training ein, z. B. von deiner Sportuhr.'}</p>
      <p class="lbl">Klasse</p><div class="variants hx-divs-sm">${Object.entries(HX_DIVS).map(([k, d]) => chip('hx-div', k, d.label, hxDiv() === k)).join('')}</div>
    </div>
    <div class="card"><h2>Ablauf <small class="hint">${segs.length} Abschnitte</small></h2>
      <ol class="hx-plan">${segs.map(g => `<li>${esc(g.label)} <small>${g.dist}${hxSegWeight(g) ? ' | ' + hxSegWeight(g) : ''}</small></li>`).join('') || '<li>Bitte mindestens eine Station wählen.</li>'}</ol></div>
    <button class="btn primary" data-action="hx-go" ${segs.length ? '' : 'disabled'}>${n.mode === 'live' ? '⏱ Los geht’s' : '✎ Zeiten eintragen'}</button>`;
}

// Mit Uhr: data.hyroxDraft = { type, picks, segs, idx, phase 'seg'|'rox'|'done', t0, segT0, times[], rox[], pausedAt, paused }
const hxNow = () => Date.now();
function hxElapsed(d, from) { return Math.max(0, ((d.pausedAt || hxNow()) - from) / 1000); }  // pausiert: Uhr steht
function renderHyroxLive() {
  const d = data.hyroxDraft;
  if (!d) return '<p class="hint">Kein laufender Durchgang.</p><button class="btn" data-action="hx-open" data-v="hyrox">Zur Hyrox-Übersicht</button>';
  const seg = d.segs[d.idx], b = hxBests(), total = hxElapsed(d, d.t0);
  if (d.phase === 'done') return hxSummary(d, b);
  const cur = d.phase === 'rox' ? hxElapsed(d, d.roxT0) : hxElapsed(d, d.segT0);
  const next = d.segs[d.idx];
  return `<div class="card hx-live">
      <p class="hx-kicker">Gesamtzeit${d.pausedAt ? ' | pausiert' : ''}</p><p class="hx-clock" data-hxclock="total">${hxTime(total)}</p>
      ${d.phase === 'rox' ? `<div class="hx-now"><small>Roxzone (Wechsel)</small><b>Als Nächstes: ${esc(next.label)}</b><span>${next.dist}${hxSegWeight(next) ? ' | ' + hxSegWeight(next) : ''}</span></div>
        <p class="hx-seg-clock" data-hxclock="cur">${hxTime(cur)}</p>
        <div class="row"><button class="btn" data-action="hx-pause">${d.pausedAt ? '▶ Weiter' : '⏸ Pause'}</button><button class="btn primary" data-action="hx-next">▶ ${esc(next.label)} starten</button></div>`
        : `<div class="hx-now"><small>Abschnitt ${d.idx + 1} von ${d.segs.length}</small><b>${esc(seg.label)}</b><span>${seg.dist}${hxSegWeight(seg) ? ' | ' + hxSegWeight(seg) : ''}</span></div>
        <p class="hx-seg-clock" data-hxclock="cur">${hxTime(cur)}${b[seg.k] ? `<small>Bestzeit ${hxTime(b[seg.k])}</small>` : ''}</p>
        <div class="row"><button class="btn" data-action="hx-pause">${d.pausedAt ? '▶ Weiter' : '⏸ Pause'}</button><button class="btn primary" data-action="hx-done">${seg.label} fertig ✓</button></div>`}
      <p class="hint">${d.rox === false ? '' : 'Die Uhr läuft auch weiter, wenn du die App kurz verlässt.'}</p>
    </div>
    <div class="card"><h2>Abschnitte</h2><div class="hx-segs">${d.segs.map((g, i) => {
      const t = d.times[i], st = t != null ? 'done' : i === d.idx ? 'now' : '';
      return `<div class="hx-seg ${st} ${g.run ? 'run' : 'st'}"><span class="hx-sno">${g.run ? '🏃' : (g.st + 1)}</span><span class="hx-sname">${esc(g.label)}<small>${g.dist}</small></span>
        <span class="hx-stime">${t != null ? `${hxTime(t)}${b[g.k] ? `<small class="${t <= b[g.k] ? 'good' : ''}">${hxDiff(t, b[g.k])}</small>` : ''}` : i === d.idx ? 'läuft' : b[g.k] ? `<small>Best ${hxTime(b[g.k])}</small>` : ''}</span></div>`;
    }).join('')}</div></div>
    <button class="btn danger" data-action="hx-abort">Durchgang abbrechen</button>`;
}
function hxSummary(d, b) {
  const total = d.times.reduce((a, x) => a + x, 0) + d.rox.reduce((a, x) => a + x, 0);
  return `<div class="card hx-live"><p class="hx-kicker">Geschafft</p><p class="hx-clock">${hxTime(total)}</p>
      <p class="hint">${esc(HX_TYPES[d.type].label)} | Roxzone ${hxTime(d.rox.reduce((a, x) => a + x, 0))}</p></div>
    <div class="card"><h2>Abschnitte</h2><div class="hx-segs">${d.segs.map((g, i) => `<div class="hx-seg done ${g.run ? 'run' : 'st'}"><span class="hx-sno">${g.run ? '🏃' : (g.st + 1)}</span>
      <span class="hx-sname">${esc(g.label)}</span><span class="hx-stime">${hxTime(d.times[i])}${b[g.k] ? `<small class="${d.times[i] <= b[g.k] ? 'good' : ''}">${hxDiff(d.times[i], b[g.k])}</small>` : '<small class="good">erste Zeit</small>'}</span></div>`).join('')}</div></div>
    <button class="btn primary" data-action="hx-save-live">✔ Speichern</button>
    <button class="btn danger" data-action="hx-abort">Verwerfen</button>`;
}

// Hinterher eintragen
let hxManual = null;
function renderHyroxManual() {
  const m = hxManual;
  if (!m) return '<p class="hint">Bitte zuerst einen Durchgang einrichten.</p>';
  const b = hxBests();
  return `<p class="hint explain">Zeiten als Minuten:Sekunden, z. B. 4:35. Leere Felder zählen nicht.</p>
    <div class="card"><h2>${esc(HX_TYPES[m.type].label)}</h2>
      ${m.segs.map((g, i) => `<label class="row hx-in"><span>${esc(g.label)}<small>${g.dist}${b[g.k] ? ` | Best ${hxTime(b[g.k])}` : ''}</small></span>
        <input class="inp" type="text" inputmode="decimal" placeholder="m:ss" data-field="hx-t" data-i="${i}" value="${m.vals[i] || ''}"></label>`).join('')}
      ${m.type !== 'st' ? `<label class="row hx-in"><span>Roxzone gesamt<small>Wechselzeiten zusammen, freiwillig</small></span>
        <input class="inp" type="text" inputmode="decimal" placeholder="m:ss" data-field="hx-rox" value="${m.rox || ''}"></label>` : ''}
    </div>
    <button class="btn primary" data-action="hx-save-manual">✔ Speichern</button>`;
}

function renderHyroxSession({ id }) {
  const s = hxData().sessions.find(x => x.id === id);
  if (!s) return '<p class="hint">Nicht gefunden.</p>';
  const b = hxBests(s.date);
  return `<div class="card hx-live"><p class="hx-kicker">${fmtDate(s.date, true)}</p><p class="hx-clock">${hxTime(s.total)}</p>
      <p class="hint">${esc(HX_TYPES[s.type].label)} | ${s.mode === 'live' ? 'mit Uhr gemessen' : 'eingetragen'} | ${esc((HX_DIVS[s.div] || {}).label || '')}${s.rox ? ` | Roxzone ${hxTime(s.rox)}` : ''}</p></div>
    <div class="card"><h2>Abschnitte</h2><div class="hx-segs">${s.segs.map(g => `<div class="hx-seg done ${g.run ? 'run' : 'st'}"><span class="hx-sno">${g.run ? '🏃' : (g.st + 1)}</span>
      <span class="hx-sname">${esc(g.label)}</span><span class="hx-stime">${g.sec ? hxTime(g.sec) : '–'}${g.sec && b[g.k] ? `<small class="${g.sec <= b[g.k] ? 'good' : ''}">${hxDiff(g.sec, b[g.k])}</small>` : g.sec ? '<small class="good">erste Zeit</small>' : ''}</span></div>`).join('')}</div>
      <p class="hint">Vergleich mit den Bestzeiten vor diesem Tag.</p></div>
    <button class="btn danger" data-action="hx-del" data-id="${s.id}">Diesen Durchgang löschen</button>`;
}

function renderHyroxStations() {
  const d = HX_DIVS[hxDiv()], b = hxBests();
  return `<div class="seg hx-divs">${Object.entries(HX_DIVS).map(([k, v]) => `<button class="${k === hxDiv() ? 'on' : ''}" data-action="hx-div" data-k="${k}">${v.label}</button>`).join('')}</div>
    <p class="hint explain">Ablauf: 8 × (1 km Laufen + 1 Station). Gewichte für <b>${d.label}</b>, Stand Saison 2025/26. Maßgeblich ist das offizielle Regelwerk.</p>
    ${HX_STATIONS.map(([k, name, dist, lib, wk], i) => `<button class="btn nav hx-st" data-action="lib-open" data-name="${esc(lib)}">
      <span class="hx-stno">${i + 1}</span><span class="hx-sttxt">${name}<small>${dist}${wk ? ' | ' + d[wk] : ''}${b[k] ? ` | Bestzeit ${hxTime(b[k])}` : ''}</small></span></button>`).join('')}
    <p class="hint">Antippen öffnet die Übung in der Bibliothek, mit Figur, Ausführung und Tipps.</p>`;
}

function renderHyroxHist() {
  const H = hxData(), b = hxBests(), fulls = H.sessions.filter(s => s.type === 'full');
  const max = Math.max(1, ...fulls.map(s => s.total));
  const lastOf = k => { for (const s of [...H.sessions].reverse()) { const g = s.segs.find(x => x.k === k && x.sec); if (g) return g.sec; } return null; };
  const rows = [...[...Array(8)].map((_, i) => ['run' + (i + 1), `Lauf ${i + 1}`]), ...HX_STATIONS.map(([k, n]) => [k, n])].filter(([k]) => b[k]);
  return `${H.sessions.length ? '' : '<p class="hint explain">Noch keine Zeiten. Starte einen Durchgang in der Hyrox-Übersicht.</p>'}
    ${fulls.length ? `<div class="card"><h2>Komplett-Durchgänge</h2>${fulls.map((s, i) => `<div class="hx-hrow"><span>${fmtDate(s.date)}</span><span class="hx-hbar"><i style="width:${(s.total / max * 100).toFixed(1)}%"></i></span><b>${hxTime(s.total)}</b>${i ? `<small class="${s.total < fulls[i - 1].total ? 'good' : ''}">${hxDiff(s.total, fulls[i - 1].total)}</small>` : '<small></small>'}</div>`).join('')}</div>` : ''}
    ${rows.length ? `<div class="card"><h2>Je Abschnitt</h2><div class="hx-tab"><span></span><span>Zuletzt</span><span>Bestzeit</span><span>Diff.</span>
      ${rows.map(([k, n]) => { const l = lastOf(k); return `<span>${esc(n)}</span><span>${l ? hxTime(l) : '–'}</span><span>${hxTime(b[k])}</span><span>${l ? hxDiff(l, b[k]) : ''}</span>`; }).join('')}
      ${b.km ? `<span>Bester Kilometer</span><span></span><span>${hxTime(b.km)}</span><span></span>` : ''}</div></div>` : ''}
    ${H.sessions.length ? `<div class="card"><h2>Alle Durchgänge</h2>${[...H.sessions].reverse().map(hxSessionRow).join('')}</div>` : ''}`;
}

/* ---------- Erfolge (charts.js → achievementProgress) ---------- */
function hyroxProgress() {
  const H = data.hyrox;
  if (!H || !H.sessions || !H.sessions.length) return { done: [], next: [] };
  const c = { full: 0, pb: {}, race: 0, goal: 0 }, best = {}, done = [];
  const series = [{ def: { id: 'hx-full', cat: 'Hyrox', goals: [1, 5, 10, 25], step: 25, icons: ['🏁', '🔥', '🏅', '👑'],
    names: ['Erster Hyrox-Durchgang', 'Fünf Durchgänge', 'Zehn Durchgänge', 'Hyrox-Maschine'],
    name: g => `${g} Komplett-Durchgänge`, desc: g => g === 1 ? 'Ersten Komplett-Durchgang auf Zeit geschafft' : `${g} Komplett-Durchgänge auf Zeit`,
    value: x => x.full, fmt: v => `${v}` }, i: 0 },
  { def: { id: 'hx-race', cat: 'Hyrox', goals: [1, 3, 5, 10], step: 10, icons: ['🏁', '🎽', '🏅', '🏆'], names: ['Hyrox gefinisht', 'Drei Hyrox-Rennen', 'Fünf Hyrox-Rennen', 'Hyrox-Veteran'],
    name: g => `${g} Hyrox-Rennen`, desc: g => g === 1 ? 'Ersten Hyrox-Wettkampf geschafft' : `${g} Hyrox-Wettkämpfe geschafft`, value: x => x.race, fmt: v => `${v}` }, i: 0 },
  { def: { id: 'hx-goal', cat: 'Hyrox', goals: [1, 3], step: 5, icons: ['🎯'], names: ['Zielzeit geknackt', 'Dreimal Zielzeit geknackt'],
    name: g => `${g}× Zielzeit`, desc: g => g === 1 ? 'Im Wettkampf die eigene Zielzeit erreicht' : `${g}-mal im Wettkampf die Zielzeit erreicht`, value: x => x.goal, fmt: v => `${v}` }, i: 0 }];
  const known = new Set();
  for (const s of [...H.sessions].sort((a, b) => a.date.localeCompare(b.date))) {
    if (s.type === 'full' && s.segs.every(g => g.sec)) c.full++;
    if (s.type === 'race') { c.race++; if (s.goal && s.total <= s.goal) c.goal++; }
    for (const g of s.segs) {
      if (!g.sec || g.run) continue;
      if (best[g.k] == null || g.sec < best[g.k]) {
        best[g.k] = g.sec; c.pb[g.k] = (c.pb[g.k] || 0) + 1;
        if (!known.has(g.k)) {
          known.add(g.k);
          const name = (HX_STATIONS.find(x => x[0] === g.k) || [, g.label])[1];
          series.push({ def: { id: 'hx-pb-' + g.k, cat: 'Hyrox', goals: [1, 3, 5, 10], step: 10, icons: ['⏱'],
            names: [`${name}: erste Zeit`, `${name}: 3 Bestzeiten`, `${name}: 5 Bestzeiten`, `${name}: 10 Bestzeiten`],
            name: n => `${name}: ${n} Bestzeiten`, desc: n => n === 1 ? `Erste Zeit bei ${name}` : `${n}-mal neue Bestzeit bei ${name}`,
            value: x => x.pb[g.k] || 0, fmt: v => `${v}` }, i: 0 });
        }
      }
    }
    for (const st of series) {
      for (let g = goalAt(st.def, st.i); g != null && st.def.value(c) >= g; g = goalAt(st.def, st.i)) { done.push({ ...awardAt(st.def, st.i, g), date: s.date }); st.i++; }
    }
  }
  const next = series.map(st => { const g = goalAt(st.def, st.i); return g == null ? null : { ...awardAt(st.def, st.i, g), value: st.def.value(c), goal: g, fmt: st.def.fmt }; }).filter(Boolean);
  return { done, next };
}

/* ---------- Uhr ---------- */
let hxTimer = null;
function hxTick() {
  const d = data.hyroxDraft;
  if (!d || current.view !== 'hyroxlive' || d.phase === 'done') { clearInterval(hxTimer); hxTimer = null; return; }
  const set = (k, v) => { const el = document.querySelector(`[data-hxclock="${k}"]`); if (el && el.firstChild) el.firstChild.nodeValue = hxTime(v); };
  set('total', hxElapsed(d, d.t0));
  set('cur', d.phase === 'rox' ? hxElapsed(d, d.roxT0) : hxElapsed(d, d.segT0));
}
function hxSave(type, mode, segs, times, rox) {
  const list = segs.map((g, i) => ({ k: g.k, label: g.label, run: !!g.run, ...(g.st != null ? { st: g.st } : {}), sec: times[i] || null }));
  const total = list.reduce((a, g) => a + (g.sec || 0), 0) + (rox || 0);
  const before = typeof unlockedIds === 'function' ? unlockedIds() : new Set();
  const s = { id: uid(), date: new Date().toISOString(), type, mode, div: hxDiv(), segs: list, rox: rox || 0, total };
  if (type === 'race' && hxRace()) Object.assign(s, { goal: hxRace().goal || null, race: hxRace().name || '' });
  hxData().sessions.push(s);
  saveData();
  const won = typeof achievementProgress === 'function' ? achievementProgress().done.filter(a => !before.has(a.id)) : [];
  if (won.length && typeof celebrate === 'function') celebrate(won);
  toast(`Durchgang gespeichert ✔ | ${hxTime(total)}`);
  return s;
}

/* ---------- Schritt 3: Wettkampf planen (v227, User 2026-11-13) ----------
   data.hyrox.race = { name, date, div, goal (Sekunden oder null), per (Einheiten/Woche 2–5), combine (mit Kraftplan) }
   Phasen rückwärts vom Datum: Grundlage (> 12 Wochen), Aufbau (12–5), wettkampfnah (4–2), Erholung (letzte Woche).
   data.hyrox.done = { [Montag der Woche]: [Nummern der erledigten Einheiten] } */
HX_TYPES.race = { label: 'Wettkampf', text: 'Dein Ergebnis im echten Wettkampf.' };
const hxRace = () => hxData().race || null;
const hxDaysTo = r => Math.round((Date.parse(r.date + 'T12:00:00') - Date.parse(todayISO() + 'T12:00:00')) / 86400000);
const HX_PHASES = {
  base: { label: 'Grundlage', text: 'Ausdauer aufbauen und die Technik der Stationen lernen.' },
  build: { label: 'Aufbau', text: 'Intervalle und Stationen unter Belastung. Das Tempo wird wettkampfnäher.' },
  race: { label: 'Wettkampfnah', text: 'Kompromiss-Läufe und Durchgänge im Wettkampftempo.' },
  taper: { label: 'Erholung', text: 'Weniger Umfang, kurz und frisch. Du sollst ausgeruht an den Start.' },
  after: { label: 'Vorbei', text: '' },
};
function hxPhase(r) {
  const d = hxDaysTo(r);
  const k = d < 0 ? 'after' : d <= 7 ? 'taper' : d <= 28 ? 'race' : d <= 84 ? 'build' : 'base';
  return { k, ...HX_PHASES[k] };
}
// Einheiten je Phase, wichtigste zuerst: [Titel, Beschreibung, Art zum Starten (oder null)]
const HX_WEEK = {
  base: [['Lockerer Lauf', '30–45 min ruhig, du kannst dich dabei unterhalten', null], ['Stationen-Technik', 'Alle 8 Stationen locker, je 2 Runden, saubere Ausführung', 'st'],
    ['Intervalle', '5 × 1 km etwas langsamer als Zieltempo, 2 min Pause', null], ['Langer Lauf', '50–60 min locker', null],
    ['Kraft-Ausdauer-Zirkel', 'Wall Balls, Ausfallschritte, Burpees, 3 Runden', null]],
  build: [['Intervalle', '6 × 1 km im Zieltempo, 90 s Pause', null], ['Stationen unter Last', 'Sled Push, Sled Pull, Wall Balls, Sandsack-Ausfallschritte, je 3 Runden', 'st'],
    ['Kompromiss-Lauf', '4 × (1 km Laufen + 1 Station)', 'cmp'], ['Lockerer Lauf', '40 min ruhig', null], ['Tempo-Dauerlauf', '5 km knapp langsamer als Wettkampftempo', null]],
  race: [['Kompromiss-Lauf', '6–8 × (1 km Laufen + 1 Station) im Wettkampftempo', 'cmp'], ['Teil-Durchgang', 'Eine Hälfte auf Zeit, abwechselnd erste und zweite', 'half1'],
    ['Intervalle', '4 × 1 km etwas schneller als Zieltempo', null], ['Lockerer Lauf', '30 min ruhig', null], ['Komplett-Durchgang', 'Einmal 2–3 Wochen vor dem Wettkampf', 'full']],
  taper: [['Lockerer Lauf', '20–30 min mit 3 kurzen Steigerungen', null], ['Stationen kurz', 'Je Station eine kurze, lockere Runde', 'st'], ['Ruhetag', 'Beine hoch, du bist bereit', null]],
};
// Lauftempo je km: aus der Zielzeit (gut die Hälfte der Zeit ist Laufen), sonst aus dem besten Kilometer
function hxPace(r) {
  if (r && r.goal) return { run: Math.round(r.goal * 0.53 / 8), src: 'aus deiner Zielzeit' };
  const b = hxBests();
  return b.km ? { run: Math.round(b.km * 1.08), src: 'aus deinem besten Kilometer' } : null;
}
const WD_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
// Wochenplan Mo–So: Kraft-Tage (wenn kombiniert) und Hyrox-Einheiten auf die übrigen Tage
function hxWeek(r) {
  const ph = hxPhase(r);
  if (ph.k === 'after') return null;
  const per = Math.max(2, Math.min(5, r.per || 3)), d = hxDaysTo(r);
  let list = HX_WEEK[ph.k].map((x, i) => ({ t: x[0], d: x[1], type: x[2], i }));
  if (ph.k === 'race' && !(d > 13 && d <= 21)) list = list.filter(x => x.type !== 'full');  // Komplett-Durchgang nur 2–3 Wochen vorher
  if (ph.k === 'race' && Math.floor(d / 7) % 2) list = list.map(x => x.type === 'half1' ? { ...x, type: 'half2' } : x);
  list = list.slice(0, ph.k === 'taper' ? Math.min(per, 3) : per);
  const days = [...Array(7)].map(() => []);
  const sp = r.combine && typeof hasActivePlan === 'function' && hasActivePlan() && !activePlan().cali ? activePlan() : null;
  const nStr = sp ? Math.min(sp.days.length, ph.k === 'taper' ? 1 : 4) : 0;
  const strDays = [0, 2, 4, 5].slice(0, nStr);
  strDays.forEach((wd, i) => days[wd].push({ t: 'Kraft', d: ph.k === 'taper' ? 'nur kurz und leicht' : (sp.days[i % sp.days.length] || {}).name || 'aus deinem Kraftplan', kraft: true }));
  const free = [1, 3, 6, 5, 0, 2, 4].filter(x => !strDays.includes(x));
  // erst die freien Tage; mehr Einheiten als freie Tage → zusätzlich an einen Krafttag (nach dem Krafttraining)
  list.forEach((x, i) => {
    if (i < free.length || !strDays.length) days[free[i % free.length]].push(x);
    else days[strDays[(i - free.length) % strDays.length]].push({ ...x, d: `${x.d}, nach dem Krafttraining` });
  });
  // Wettkampf-Woche: Wettkampftag eintragen, die zwei Tage davor frei
  if (ph.k === 'taper') {
    const raceWd = (new Date(r.date + 'T12:00:00').getDay() + 6) % 7, monday = thisMonday();
    if (addDaysISO(monday, raceWd) === r.date) {
      for (const k of [raceWd - 1, raceWd - 2]) if (k >= 0) { const moved = days[k].filter(x => !x.kraft); days[k] = days[k].filter(x => x.kraft && false); moved.forEach(x => days[Math.max(0, k - 2)].push(x)); }
      days[raceWd] = [{ t: '🏁 Wettkampf', d: `${r.name || 'Hyrox'}. Viel Erfolg`, race: true }];
      for (let k = 0; k < 7; k++) days[k] = days[k].filter(x => x.t !== 'Ruhetag');  // der Wettkampf ist der Höhepunkt der Woche
    }
  }
  return { ph, days, n: list.length };
}
/* Wettkampf-Woche im Kraft-Reiter (v232, User 2026-11-13 nach Simulation sim9): Hinweis auf der Kraft-Startseite und auf Wunsch
   leichte Krafttrainings wie im Deload (halbe Sätze, weniger Gewicht, keine Steigerung). data.hyrox.light = Montag dieser Woche.
   Die Trainings zählen normal für die Woche; gespeichert mit session.deload + session.light (keine Bezugswerte, kein Deload-Wechsel). */
const hxMonday = () => thisMonday();
function hxTaperNow() {
  if (!sportDraft() || !data.hyrox) return null;
  const r = hxRace();
  return r && hxPhase(r).k === 'taper' ? r : null;
}
const hxLightNow = () => !!hxTaperNow() && hxData().light === hxMonday();
function hxTaperCard(ci) {
  const r = hxTaperNow();
  if (!r || ci.deload || ownPlan()) return '';
  const d = hxDaysTo(r), on = hxLightNow();
  return `<div class="card hints hx-taper"><h2>🏁 Wettkampf-Woche</h2>
    <p>${esc(r.name || 'Hyrox')} ist ${d === 0 ? 'heute' : d === 1 ? 'morgen' : `in ${d} Tagen`}. Kraft diese Woche am besten nur kurz und leicht.
      Ein lockeres Training reicht, die übrigen kannst du auslassen.</p>
    ${on ? '<p class="hint">✓ Krafttrainings dieser Woche laufen leicht wie im Deload: halbe Sätze, etwas weniger Gewicht, keine Steigerung. Die Woche zählt trotzdem normal.</p>' : ''}
    <button class="btn small ${on ? '' : 'primary'}" data-action="hx-light">${on ? 'Doch normal trainieren' : 'Diese Woche leicht trainieren'}</button></div>`;
}

// Richtzeiten je Station aus der Zielzeit (typische Anteile)
const HX_SHARE = { ski: .060, push: .042, pull: .056, bbj: .060, row: .058, farm: .026, lunge: .056, wb: .072 };

function hxRaceCard() {
  const r = hxRace();
  if (!r) return `<div class="card hx-race"><p class="hx-kicker">Nächster Wettkampf</p><h2>Noch keiner eingetragen</h2>
      <p class="hint">Trag deinen Wettkampf ein. Dann plant die App die Wochen bis zum Start: Grundlage, Aufbau, wettkampfnah und Erholung.</p>
      <button class="btn primary" data-action="hx-event">Wettkampf eintragen</button></div>`;
  const d = hxDaysTo(r), ph = hxPhase(r), p = hxPrognosis();
  if (d < 0) {
    const res = hxData().sessions.find(s => s.type === 'race' && s.date.slice(0, 10) >= r.date);
    return `<div class="card hx-race"><p class="hx-kicker">Wettkampf vorbei</p><h2>${esc(r.name || 'Hyrox')}</h2>
      ${res ? `<p class="hx-meta">Deine Zeit: <b>${hxTime(res.total)}</b>${r.goal ? ` | Ziel ${hxTime(r.goal)} ${res.total <= r.goal ? '✓ geschafft' : `(${hxDiff(res.total, r.goal)})`}` : ''}</p>`
        : '<p class="hint">Wie lief’s? Trag dein Ergebnis ein. Zeiten je Abschnitt findest du in der Ergebnisliste des Veranstalters.</p>'}
      <div class="row">${res ? '' : '<button class="btn primary" data-action="hx-result">Ergebnis eintragen</button>'}<button class="btn" data-action="hx-event" data-new="1">Nächsten planen</button></div></div>`;
  }
  const weeks = Math.ceil(d / 7);
  return `<div class="card hx-race"><p class="hx-kicker">Nächster Wettkampf | Phase ${esc(ph.label)}</p><h2>${esc(r.name || 'Hyrox')}</h2>
      <p class="hx-meta">${fmtDate(r.date + 'T12:00:00', true)} | ${esc(HX_DIVS[r.div || hxDiv()].label)} | <b>${d === 0 ? 'heute' : d === 1 ? 'morgen' : d < 14 ? `noch ${d} Tage` : `noch ${weeks} Wochen`}</b></p>
      ${r.goal || p ? `<div class="hx-goal">${r.goal ? `<div><small>Ziel</small><b>${hxTime(r.goal)}</b></div>` : ''}${p ? `<div><small>Prognose</small><b>${hxTime(p.total)}</b></div>` : ''}
        ${r.goal && p ? `<div><small>Abstand</small><b class="${p.total <= r.goal ? 'good' : ''}">${hxDiff(p.total, r.goal)}</b></div>` : ''}</div>` : ''}
      <p class="hint">${esc(ph.text)}</p>
      <button class="btn" data-action="hx-event">Wettkampf bearbeiten</button></div>`;
}
function hxWeekCard() {
  const r = hxRace();
  if (!r) return '';
  const w = hxWeek(r);
  if (!w) return '';
  const key = thisMonday(), done = (hxData().done || {})[key] || [], today = (new Date(todayISO() + 'T12:00:00').getDay() + 6) % 7;
  const pace = hxPace(r);
  const rows = w.days.map((list, wd) => list.map(x => {
    const ok = x.i != null && done.includes(x.i);
    return `<div class="hx-day ${ok ? 'done' : ''} ${wd === today ? 'today' : ''} ${x.kraft ? 'kraft' : ''}"><span class="hx-dow">${WD_SHORT[wd]}</span>
      <span class="hx-dtxt"><b>${esc(x.t)}</b><small>${esc(x.d)}</small></span>
      ${x.i != null ? `${x.type && !ok ? `<button class="hx-mini" data-action="hx-start" data-k="${x.type}" aria-label="Starten">▶</button>` : ''}
        <button class="hx-mini ${ok ? 'on' : ''}" data-action="hx-wdone" data-i="${x.i}" aria-label="Erledigt">✓</button>` : ''}</div>`;
  }).join('')).join('');
  return `<div class="card hx-week"><h2>Diese Woche <small class="hint">${done.length} von ${w.n} erledigt</small></h2>${rows}
    ${pace ? `<p class="hint">Zieltempo Laufen: <b>${hxTime(pace.run)} / km</b> (${pace.src}).${r.goal ? ' Richtzeiten je Station: ' + HX_STATIONS.map(([k, n]) => `${n} ${hxTime(r.goal * HX_SHARE[k])}`).join(' | ') + '.' : ''}</p>` : ''}
    ${r.combine ? '<p class="hint">Mit deinem Kraftplan kombiniert: Hyrox-Einheiten liegen auf den Tagen ohne Krafttraining. Die Tage sind ein Vorschlag. Tausch sie, wie es dir passt.</p>' : ''}
  </div>`;
}

// Wettkampf eintragen / bearbeiten
let hxEv = null;
function renderHyroxEvent() {
  const e = hxEv;
  if (!e) return '<p class="hint">–</p>';
  const chip = (act, k, label, on) => `<button class="vchip ${on ? 'on' : ''}" data-action="${act}" data-k="${k}">${label}</button>`;
  const canCombine = typeof hasActivePlan === 'function' && hasActivePlan() && !activePlan().cali;
  return `<div class="card">
      <label class="lbl">Wettkampf (Ort oder Name)<input class="inp" type="text" data-field="hx-ev" data-k="name" value="${esc(e.name || '')}" placeholder="z. B. Hyrox Hamburg"></label>
      <label class="lbl">Datum<input class="inp" type="date" data-field="hx-ev" data-k="date" value="${e.date || ''}" min="${todayISO()}"></label>
      <p class="lbl">Klasse</p><div class="variants hx-divs-sm">${Object.entries(HX_DIVS).map(([k, d]) => chip('hx-ev-div', k, d.label, e.div === k)).join('')}</div>
      <label class="lbl">Zielzeit (freiwillig)<input class="inp" type="text" inputmode="decimal" data-field="hx-ev" data-k="goal" value="${esc(e.goal || '')}" placeholder="z. B. 1:25:00"></label>
      <p class="lbl">Hyrox-Einheiten pro Woche</p><div class="variants">${[2, 3, 4, 5].map(n => chip('hx-ev-per', n, String(n), e.per === n)).join('')}</div>
      ${canCombine ? `<p class="lbl">Mit deinem Kraftplan kombinieren?</p><div class="variants">${chip('hx-ev-comb', '1', 'Ja', e.combine)}${chip('hx-ev-comb', '0', 'Nein', !e.combine)}</div>
        <p class="hint">Dann liegen die Hyrox-Einheiten auf den Tagen ohne Krafttraining. In der Wettkampf-Woche kannst du die Krafttrainings auf der Startseite auf leicht stellen.</p>` : ''}
    </div>
    <button class="btn primary" data-action="hx-ev-save">✔ Speichern</button>
    ${hxRace() && !e.isNew ? '<button class="btn danger" data-action="hx-ev-del">Wettkampf entfernen</button>' : ''}`;
}

views.hyrox = { title: 'Hyrox', tab: 'start', render: renderHyrox };
views.hyroxevent = { title: 'Wettkampf', tab: 'start', back: 'hyrox', render: renderHyroxEvent };
views.hyroxnew = { title: 'Durchgang starten', tab: 'start', back: 'hyrox', render: renderHyroxNew };
views.hyroxlive = { title: 'Hyrox-Uhr', tab: 'start', back: 'hyrox', render: renderHyroxLive,
  after: () => { if (!hxTimer && data.hyroxDraft && data.hyroxDraft.phase !== 'done') hxTimer = setInterval(hxTick, 1000); } };
views.hyroxmanual = { title: 'Zeiten eintragen', tab: 'start', back: 'hyroxnew', render: renderHyroxManual };
views.hyroxses = { title: 'Durchgang', tab: 'start', back: 'hyroxhist', render: renderHyroxSession };
views.hyroxst = { title: 'Stationen', tab: 'start', back: 'hyrox', render: renderHyroxStations };
views.hyroxhist = { title: 'Zeiten und Bestzeiten', tab: 'start', back: 'hyrox', render: renderHyroxHist };

Object.assign(actions, {
  'sport-mode': el => go(el.dataset.k === 'hyrox' ? 'hyrox' : 'start'),
  'hx-open': el => go(el.dataset.v),
  'hx-div': el => { hxData().div = el.dataset.k; saveData(); render(); },
  'hx-type': el => { hxNew.type = el.dataset.k; render(); },
  'hx-mode': el => { hxNew.mode = el.dataset.k; render(); },
  'hx-pick': el => { const k = el.dataset.k, p = hxNew.picks; hxNew.picks = p.includes(k) ? p.filter(x => x !== k) : HX_STATIONS.map(x => x[0]).filter(x => x === k || p.includes(x)); render(); },
  'hx-go': () => {
    const n = hxNew, segs = hxSegs(n.type, n.picks);
    if (!segs.length) return;
    if (n.mode === 'manual') { hxManual = { type: n.type, segs, vals: [], rox: '' }; go('hyroxmanual'); return; }
    const t = hxNow();
    data.hyroxDraft = { type: n.type, picks: n.picks, segs, idx: 0, phase: 'seg', t0: t, segT0: t, times: [], rox: [] };
    saveData();
    go('hyroxlive');
  },
  'hx-done': () => {
    const d = data.hyroxDraft;
    if (!d || d.pausedAt) return;
    const t = hxNow();
    d.times[d.idx] = Math.round((t - d.segT0) / 1000);
    d.idx++;
    if (d.idx >= d.segs.length) d.phase = 'done';
    else { d.phase = 'rox'; d.roxT0 = t; }
    saveData(); render();
  },
  'hx-next': () => {
    const d = data.hyroxDraft;
    if (!d || d.pausedAt) return;
    const t = hxNow();
    d.rox.push(Math.round((t - d.roxT0) / 1000));
    d.phase = 'seg'; d.segT0 = t;
    saveData(); render();
  },
  'hx-pause': () => {
    const d = data.hyroxDraft;
    if (!d) return;
    if (d.pausedAt) {  // weiter: alle Startzeiten um die Pause verschieben
      const p = hxNow() - d.pausedAt;
      for (const k of ['t0', 'segT0', 'roxT0']) if (d[k]) d[k] += p;
      d.pausedAt = null;
    } else d.pausedAt = hxNow();
    saveData(); render();
  },
  'hx-abort': () => {
    if (!askOk('Diesen Durchgang verwerfen? Die Zeiten gehen verloren.')) return;
    data.hyroxDraft = null; saveData(); go('hyrox');
  },
  'hx-save-live': () => {
    const d = data.hyroxDraft;
    if (!d) return;
    hxSave(d.type, 'live', d.segs, d.times, d.rox.reduce((a, x) => a + x, 0));
    data.hyroxDraft = null; saveData(); go('hyrox');
  },
  'hx-save-manual': () => {
    const m = hxManual;
    const times = m.segs.map((_, i) => hxParse(m.vals[i]));
    const bad = m.vals.map((v, i) => v && String(v).trim() && !times[i] ? m.segs[i].label : null).filter(Boolean);
    if (bad.length) { alert(`Diese Zeiten kann die App nicht lesen: ${bad.join(', ')}.\n\nBitte als Minuten:Sekunden eintragen, z. B. 4:35.`); return; }
    if (!times.some(Boolean)) { alert('Bitte mindestens eine Zeit eintragen, z. B. 4:35.'); return; }
    hxSave(m.type, 'manual', m.segs, times, hxParse(m.rox) || 0);
    hxManual = null; hxNew = null; go('hyrox');
  },
  'hx-ses': el => go('hyroxses', { id: el.dataset.id }),
  'hx-event': el => {
    const r = !el.dataset.new && hxRace();
    hxEv = r ? { name: r.name, date: r.date, div: r.div || hxDiv(), goal: r.goal ? hxTime(r.goal) : '', per: r.per || 3, combine: !!r.combine }
      : { name: '', date: addDaysISO(todayISO(), 84), div: hxDiv(), goal: '', per: 3, combine: false, isNew: true };
    go('hyroxevent');
  },
  'hx-ev-div': el => { hxEv.div = el.dataset.k; render(); },
  'hx-ev-per': el => { hxEv.per = Number(el.dataset.k); render(); },
  'hx-ev-comb': el => { hxEv.combine = el.dataset.k === '1'; render(); },
  'hx-ev-save': () => {
    const e = hxEv;
    if (!e.date) { alert('Bitte das Datum des Wettkampfs eintragen.'); return; }
    const goal = e.goal ? hxParse(e.goal) : null;
    if (e.goal && !goal) { alert('Die Zielzeit kann die App nicht lesen. Bitte als Stunden:Minuten:Sekunden, z. B. 1:25:00.'); return; }
    if (goal && goal < 2400) { alert('Die Zielzeit wirkt sehr kurz. Bitte als Stunden:Minuten:Sekunden eintragen, z. B. 1:25:00.'); return; }
    hxData().race = { name: (e.name || '').trim() || 'Hyrox', date: e.date, div: e.div, goal, per: e.per, combine: !!e.combine };
    hxData().div = e.div;
    saveData(); hxEv = null;
    toast('Wettkampf gespeichert ✔, der Wochenplan steht auf der Hyrox-Seite');
    go('hyrox');
  },
  'hx-ev-del': () => { if (!askOk('Wettkampf entfernen? Deine Zeiten bleiben erhalten.')) return; hxData().race = null; saveData(); hxEv = null; go('hyrox'); },
  'hx-wdone': el => {
    const key = thisMonday(), H = hxData(), i = Number(el.dataset.i);
    H.done = H.done || {};
    const list = H.done[key] || [];
    H.done[key] = list.includes(i) ? list.filter(x => x !== i) : [...list, i];
    saveData(); render();
  },
  'hx-light': () => {
    const H = hxData(), on = hxLightNow();
    H.light = on ? null : hxMonday();
    saveData(); render();
    toast(on ? 'Diese Woche wieder normale Krafttrainings' : 'Krafttrainings dieser Woche laufen leicht ✔');
  },
  'hx-start': el => { hxNew = { type: el.dataset.k, mode: 'live', picks: el.dataset.k === 'cmp' ? ['ski', 'push', 'wb', 'lunge'] : HX_STATIONS.map(x => x[0]), rox: true }; go('hyroxnew'); },
  'hx-result': () => { hxManual = { type: 'race', segs: hxSegs('race'), vals: [], rox: '' }; go('hyroxmanual'); },
  'hx-del': el => {
    if (!askOk('Diesen Durchgang löschen?')) return;
    hxData().sessions = hxData().sessions.filter(s => s.id !== el.dataset.id);
    saveData(); go('hyroxhist');
  },
});
Object.assign(fields, {
  'hx-ev': el => { hxEv[el.dataset.k] = el.value; },
  'hx-t': el => { hxManual.vals[Number(el.dataset.i)] = el.value; },
  'hx-rox': el => { hxManual.rox = el.value; },
});
