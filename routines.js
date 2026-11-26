/* LockYourGains | © 2026 Alexander Hundt | Alle Rechte vorbehalten – siehe LICENSE */
'use strict';
/* ---------- Routinen (v398, User 2026-11-26): feste und eigene Routinen für Yoga und Mobility ----------
   Feste Routinen: Yoga = YOGA_FLOWS (yoga.js), Mobility = MOB_ROUTINES (hier). Eigene: data.routines = { yoga: [...], mob: [...] }.
   Routine: { id, name, how?, rounds (Yoga: Durchgänge der ganzen Routine), items }
     Yoga-Items { p, v } (v = Sekunden je Seite bzw. Runden), Mobility-Items { id, sets }.
   IDs fester Routinen: 'fx:<id>'. Start: Yoga als geführte Einheit (data.yogaDraft, views.yogasess),
   Mobility als Mobility-Einheit (data.mobDraft mit focus 'rt', mobility.js). Alles läuft im Yoga- bzw. Mobility-Bereich, nicht im Plan-Reiter.
   Wochenplaner (cardio.js): data.sched[k].rt (alle Tage) und .rtDays { Wochentag 0–6: id } bei festen Tagen. */

const MOB_ROUTINES = [
  { id: 'quick', de: 'Ganzkörper in 5 Minuten', how: 'Die schnelle Runde, wenn wenig Zeit ist: fünf Übungen, die fast alle großen Gelenke bewegen. Eignet sich auch zum Aufwärmen vor jedem Training.',
    items: [['worldsgreatest', 1], ['inchworm', 1], ['squattostand', 1], ['lungetwist', 1], ['armcircles', 1]] },
  { id: 'morning', de: 'Morgen-Mobility', how: 'Sanft wach werden: Wirbelsäule, Hüfte und Schultern einmal durchbewegen. Ruhig und ohne Schwung, die Bewegungen dürfen von Wiederholung zu Wiederholung größer werden. Passt direkt nach dem Aufstehen.',
    items: [['catcow', 1], ['worldsgreatest', 2], ['hipcars', 1], ['openbook', 1], ['armcircles', 1], ['squattostand', 2], ['standrot', 1], ['ankleRock', 1]] },
  { id: 'legday', de: 'Vor dem Beintraining', how: 'Bereitet Hüfte, Knie und Sprunggelenke auf Kniebeugen, Kreuzheben und Ausfallschritte vor. Erst lockern, dann das Gesäß aktivieren und zum Schluss eine Kniebeuge mit Pause zum Einschleifen.',
    items: [['legswingfront', 1], ['legswingside', 1], ['kneetowall', 2], ['ninetyninety', 1], ['glutebridge', 2], ['cossack', 2], ['bwgoodmorning', 1], ['pausesquat', 1]] },
  { id: 'upperday', de: 'Vor dem Oberkörpertraining', how: 'Macht Schultern, Schulterblätter und Handgelenke bereit für Drücken und Ziehen. Die Schulterblätter bewusst mitbewegen, nicht nur die Arme.',
    items: [['armcircles', 1], ['shouldercars', 1], ['scappushup', 2], ['threadneedle', 1], ['wallslide', 2], ['ytw', 1], ['wristcircles', 1]] },
  { id: 'desk', de: 'Ausgleich zum Sitzen', how: 'Gegen langes Sitzen am Schreibtisch oder im Auto: Nacken entlasten, Brust öffnen, Hüftbeuger dehnen. Für die Brustdehnung brauchst du einen Türrahmen.',
    items: [['chintuck', 2], ['neckrot', 1], ['shoulderrolls', 1], ['openbook', 1], ['doorchest', 1], ['hipflexorreach', 1], ['catcow', 1]] },
  { id: 'evening', de: 'Abend-Dehnen', how: 'Ruhige Haltepositionen zum Runterkommen. Jede Position entspannt halten und lang ausatmen, nicht in den Schmerz dehnen. Gut nach dem Training oder vor dem Schlafen.',
    items: [['childpose', 1], ['pigeon', 1], ['couchstretch', 1], ['figurefour', 1], ['lyingtwist', 1], ['butterfly', 1]] },
  { id: 'hips', de: 'Hüfte öffnen', how: 'Für eine freie Hüfte in alle Richtungen: Innen- und Außendrehung, Adduktoren und Hüftbeuger. Hilft bei tiefen Kniebeugen und wenn sich die Hüfte steif anfühlt.',
    items: [['ninetyninety', 2], ['frogrock', 1], ['deepsquathold', 1], ['adductorrock', 1], ['shinbox', 1], ['pigeon', 1], ['hipflexorreach', 1]] },
  { id: 'back', de: 'Rücken entlasten', how: 'Sanfte Bewegung und Stabilität für den unteren Rücken. Alles langsam und schmerzfrei, der Bauch bleibt leicht angespannt. Bei akuten Rückenschmerzen vorher ärztlich abklären.',
    items: [['catcow', 2], ['pelvictilt', 1], ['birddog', 2], ['childpose', 1], ['lyingtwist', 1], ['sphinx', 1], ['glutebridge', 1]] },
  { id: 'posture', de: 'Haltung und oberer Rücken', how: 'Richtet den oberen Rücken auf und öffnet die Brust. Gegen runde Schultern und für mehr Beweglichkeit beim Drücken über Kopf. Für zwei Übungen brauchst du eine Wand bzw. einen Türrahmen.',
    items: [['openbook', 1], ['threadneedle', 1], ['quadrot', 1], ['sphinx', 1], ['wallangel', 2], ['doorchest', 1], ['ytw', 1]] },
  { id: 'ankles', de: 'Füße und Sprunggelenke', how: 'Für bewegliche Sprunggelenke und kräftige Füße. Gut für Läuferinnen und Läufer und vor Kniebeugen, wenn die Fersen abheben.',
    items: [['anklecircles', 1], ['toeyoga', 1], ['kneetowall', 2], ['wallcalf', 1], ['slowcalfraise', 2], ['heeltoewalk', 1]] },
  { id: 'wrists', de: 'Handgelenke und Unterarme', how: 'Bereitet die Handgelenke auf Liegestütze, Bankdrücken, Handstand oder Yoga vor und entlastet nach viel Arbeit am Rechner.',
    items: [['wristcircles', 1], ['wristrocks', 1], ['wristflexor', 1], ['wristextensor', 1], ['prayer', 1], ['fistspread', 1]] },
  { id: 'afterrun', de: 'Nach dem Laufen', how: 'Löst Waden, Oberschenkel und Hüfte nach dem Laufen oder Radfahren. Ruhig halten und tief atmen.',
    items: [['wallcalf', 1], ['couchstretch', 1], ['hamsweep', 1], ['pigeon', 1], ['figurefour', 1], ['childpose', 1]] },
];
// Yoga: Durchgänge und Stil der festen Routinen
const YOGA_RT_ROUNDS = { sunA: 3, sunB: 3, moon: 2 };
const YOGA_RT_STYLE = { sunA: 'vinyasa', sunB: 'vinyasa', warriorflow: 'vinyasa', coreflow: 'power', balanceflow: 'hatha', yinflow: 'yin', evening: 'restorative', breathbreak: 'nidra' };
const RT_K = { yoga: { icon: '🧘', label: 'Yoga', home: 'yoga' }, mob: { icon: '🤸', label: 'Mobility', home: 'mobsess' } };

const rtOwn = k => ((data.routines && data.routines[k]) || []);
function rtFixed(k) {
  if (k === 'yoga') return YOGA_FLOWS.map(f => ({ id: 'fx:' + f.id, fixed: true, name: f.de, how: f.how, rounds: YOGA_RT_ROUNDS[f.id] || 1, style: YOGA_RT_STYLE[f.id] || 'hatha',
    items: f.items.filter(([p]) => YOGA_BY_ID.has(p)).map(([p, v]) => ({ p, v })) }));
  return MOB_ROUTINES.map(r => ({ id: 'fx:' + r.id, fixed: true, name: r.de, how: r.how, items: r.items.filter(([id]) => MOB_BY_ID.has(id)).map(([id, sets]) => ({ id, sets })) }));
}
const rtGet = (k, id) => id ? (String(id).startsWith('fx:') ? rtFixed(k).find(r => r.id === id) : rtOwn(k).find(r => r.id === id)) || null : null;
const rtNameOf = (k, id) => { const r = rtGet(k, id); return r ? r.name : ''; };
// Dauer in Sekunden je Yoga-Item (ein Durchgang; Runden etwa 10 s, je Seite doppelt)
const ytSec = it => { const p = YOGA_BY_ID.get(it.p); if (!p) return 0; return (p.unit === 'r' ? (it.v || p.hold) * 10 : (it.v || p.hold)) * (p.side ? 2 : 1); };
function rtMin(k, r) {
  if (!r) return 0;
  if (k === 'yoga') return Math.max(1, Math.round((r.items.reduce((a, it) => a + ytSec(it) + 6, 0) * (r.rounds || 1)) / 60));
  return Math.max(1, r.items.reduce((a, it) => a + (it.sets || 1), 0) * MOB_MIN);
}
const rtInfo = (k, r) => `<span>ca. ${rtMin(k, r)} min</span> | <span>${r.items.length} ${r.items.length === 1 ? 'Übung' : 'Übungen'}</span>${k === 'yoga' && (r.rounds || 1) > 1 ? ` | <span>${r.rounds} Durchgänge</span>` : ''}`;
const rtFirst = s => { const m = String(s || '').match(/^.*?[.!?](\s|$)/); return m ? m[0].trim() : String(s || ''); };

/* ----- Bereich oben in Yoga bzw. Mobility ----- */
function rtSectionHtml(k) {
  const K = RT_K[k], own = rtOwn(k), fixed = rtFixed(k);
  const run = k === 'yoga' ? data.yogaDraft : (data.mobDraft && data.mobDraft.focus === 'rt' ? data.mobDraft : null);
  const runDone = run ? run.items.reduce((a, i) => a + Math.min(i.done || 0, k === 'yoga' ? i.n : i.sets), 0) : 0;
  const runAll = run ? run.items.reduce((a, i) => a + (k === 'yoga' ? i.n : i.sets), 0) : 0;
  return `<div class="card rt-card"><h2>${K.icon} <span>Routinen</span></h2>
      <p class="hint nut-small">Fertige Abfolgen mit Anleitung, die du starten und regelmäßig machen kannst. Oder stell dir deine eigene zusammen.</p>
      ${run && k === 'yoga' ? `<button class="btn primary nav" data-action="ys-open">▶ <span>Weiter mit</span> „${esc(run.name)}“<small>${runDone} von ${runAll} erledigt</small></button>` : ''}
      ${own.length ? `<p class="lbl">Meine Routinen</p><div class="rt-own">${own.map(r => `<div class="rt-row">
          <button class="rt-row-name" data-action="rt-open" data-k="${k}" data-id="${r.id}"><b>${esc(r.name)}</b><small>${rtInfo(k, r)}</small></button>
          <button class="btn small primary" data-action="rt-start" data-k="${k}" data-id="${r.id}" aria-label="Starten">▶</button></div>`).join('')}</div>` : ''}
      <button class="btn small rt-new" data-action="rt-new" data-k="${k}">＋ Eigene Routine zusammenstellen</button>
      <p class="lbl">Fertige Routinen</p>
      <div class="rt-grid">${fixed.map(r => `<button class="rt-tile" data-action="rt-open" data-k="${k}" data-id="${r.id}">
          <b>${esc(r.name)}</b><small>${rtInfo(k, r)}</small><span class="rt-tile-how">${esc(r.how || '')}</span></button>`).join('')}</div>
    </div>`;
}

/* ----- Seite einer Routine: Erklärung, Ablauf, Übungen ----- */
let rtOpenIt = null;  // aufgeklappte Übung (Index)
function rtMini(k, it) {
  const f = k === 'yoga' ? (typeof exFigYoga === 'function' ? exFigYoga(it.p) : null) : (typeof exFigMob === 'function' ? exFigMob(it.id) : null);
  return f ? `<span class="rt-mini" aria-hidden="true">${f.svg}</span>` : '';
}
function rtItemTxt(k, it) {
  if (k === 'yoga') { const p = YOGA_BY_ID.get(it.p); return p ? `<span>${p.unit === 'r' ? `${it.v || p.hold} Runden` : `${it.v || p.hold} s`}</span>${p.side ? ' <span>je Seite</span>' : ''}` : ''; }
  const m = MOB_BY_ID.get(it.id); if (!m) return '';
  return `<span>${it.sets} ${it.sets === 1 ? 'Satz' : 'Sätze'}</span> | <span>${m.u === 's' ? `${m.n} s` : `${m.n} Wdh.`}</span>${m.side ? ' <span>je Seite</span>' : ''}`;
}
function renderRtView({ k, id }) {
  const r = rtGet(k, id);
  if (!r) return '<p class="hint">Diese Routine gibt es nicht mehr.</p>';
  const unit = k === 'yoga' ? 'Haltung' : 'Übung';
  return `<div class="card rt-head"><h2>${RT_K[k].icon} ${esc(r.name)}</h2><p class="hint nut-small">${rtInfo(k, r)}</p>
      ${r.how ? `<p>${esc(r.how)}</p>` : ''}
      <button class="btn primary" data-action="rt-start" data-k="${k}" data-id="${r.id}">▶ Routine starten</button>
      <div class="row">${r.fixed ? `<button class="btn" data-action="rt-copy" data-k="${k}" data-id="${r.id}">✎ Als eigene Routine anpassen</button>`
        : `<button class="btn" data-action="rt-edit" data-k="${k}" data-id="${r.id}">✎ Bearbeiten</button>`}
        <button class="btn" data-action="rt-plan" data-k="${k}" data-id="${r.id}">📅 Regelmäßig einplanen</button></div>
    </div>
    <div class="card rt-how"><h2>So läuft die Routine ab</h2><ol class="yg-steps">
      <li>Tippe auf „Routine starten“. Die Übungen stehen in der richtigen Reihenfolge untereinander.</li>
      <li>Bei Übungen mit Zeit startest du mit ▶ den Timer. Bei Übungen je Seite wechselt er nach einer kurzen Pause von selbst zur zweiten Seite.</li>
      <li>Übungen mit ${k === 'yoga' ? 'Runden' : 'Wiederholungen'} machst du in deinem Tempo und hakst ${k === 'yoga' ? 'jeden Durchgang' : 'jeden Satz'} ab.</li>
      <li>Tippe auf eine ${unit}, um Anleitung und Figur zu sehen.</li>
      ${k === 'yoga' && (r.rounds || 1) > 1 ? `<li>Die ganze Abfolge machst du ${r.rounds}-mal hintereinander, jede ${unit} hat dafür ${r.rounds} Häkchen.</li>` : ''}
      <li>Am Ende tippst du auf „Speichern“. Dann zählt die Einheit im Verlauf und im Wochenplaner.</li></ol>
      <p class="hint nut-small">Bewege dich nur im schmerzfreien Bereich. Ein Ziehen in der Muskulatur ist normal, stechender Schmerz oder Schmerz im Gelenk nicht.</p></div>
    <div class="card"><h2>Die ${k === 'yoga' ? 'Haltungen' : 'Übungen'}</h2><ol class="rt-list">${r.items.map((it, i) => {
      const x = k === 'yoga' ? YOGA_BY_ID.get(it.p) : MOB_BY_ID.get(it.id);
      if (!x) return '';
      const open = rtOpenIt === i;
      return `<li class="rt-li ${open ? 'open' : ''}"><button class="rt-li-btn" data-action="rt-it" data-i="${i}" aria-expanded="${open}">${rtMini(k, it)}
          <span><b>${esc(x.de)}</b><small>${rtItemTxt(k, it)}</small></span><span class="chev">${open ? '▴' : '▾'}</span></button>
          ${open ? (k === 'yoga' ? yogaPoseDetail(x) : mobDetail(x)) : ''}</li>`;
    }).join('')}</ol></div>`;
}

/* ----- Eigene Routine bearbeiten ----- */
let rtEdit = null;  // { k, id, name, rounds, items }
function renderRtEdit() {
  const e = rtEdit;
  if (!e) return '<p class="hint">Keine Routine in Bearbeitung.</p>';
  const rows = e.items.map((it, i) => {
    const x = e.k === 'yoga' ? YOGA_BY_ID.get(it.p) : MOB_BY_ID.get(it.id);
    if (!x) return '';
    const lab = e.k === 'yoga' ? (x.unit === 'r' ? 'Runden' : x.side ? 'Sek. je Seite' : 'Sekunden') : 'Sätze';
    const val = e.k === 'yoga' ? (it.v != null ? it.v : x.hold) : it.sets;
    return `<li class="rt-ed-row">${rtMini(e.k, it)}<span class="rt-ed-name"><b>${esc(x.de)}</b>
        <label class="rt-ed-in"><span>${lab}</span><input class="inp" type="text" inputmode="numeric" autocomplete="off" data-field="rt-item" data-i="${i}" value="${esc(String(val))}"></label></span>
        <span class="rt-ed-tools"><button class="icon-btn" data-action="rt-mv" data-i="${i}" data-d="-1" aria-label="Nach oben" ${i ? '' : 'disabled'}>↑</button>
          <button class="icon-btn" data-action="rt-mv" data-i="${i}" data-d="1" aria-label="Nach unten" ${i < e.items.length - 1 ? '' : 'disabled'}>↓</button>
          <button class="icon-btn danger" data-action="rt-it-del" data-i="${i}" aria-label="Entfernen">✕</button></span></li>`;
  }).join('');
  return `<div class="card"><label class="lbl" for="rt-name">Name der Routine</label>
      <input class="inp" id="rt-name" type="text" autocomplete="off" data-field="rt-name" value="${esc(e.name)}" placeholder="z. B. ${e.k === 'yoga' ? 'Morgen-Yoga' : 'Hüfte vor dem Beintag'}">
      ${e.k === 'yoga' ? `<label class="row"><span>Durchgänge der ganzen Routine</span><input class="inp kg" type="text" inputmode="numeric" autocomplete="off" data-field="rt-rounds" value="${esc(String(e.rounds || 1))}"></label>` : ''}</div>
    <div class="card"><h2>${e.k === 'yoga' ? 'Haltungen' : 'Übungen'} <small class="hint">ca. ${rtMin(e.k, e)} min</small></h2>
      ${e.items.length ? `<ol class="rt-ed">${rows}</ol>` : '<p class="hint nut-small">Noch leer. Füge unten Übungen hinzu.</p>'}
      <button class="btn" data-action="rt-pick">＋ ${e.k === 'yoga' ? 'Haltungen' : 'Übungen'} auswählen</button></div>
    <div class="row"><button class="btn" data-action="rt-cancel">Abbrechen</button><button class="btn primary" data-action="rt-save">✔ Speichern</button></div>
    ${e.id ? '<button class="btn center danger" data-action="rt-del">Routine löschen</button>' : ''}`;
}
fields['rt-name'] = el => { if (rtEdit) rtEdit.name = el.value; };
fields['rt-rounds'] = el => { if (rtEdit) { const n = parseNum(el.value); rtEdit.rounds = n >= 1 && n <= 20 ? Math.round(n) : 1; } };
fields['rt-item'] = el => {
  const it = rtEdit && rtEdit.items[+el.dataset.i], n = parseNum(el.value);
  if (!it || !(n > 0)) return;
  if (rtEdit.k === 'yoga') it.v = Math.min(1800, Math.round(n)); else it.sets = Math.min(10, Math.round(n));
};
const rtHome = k => go(RT_K[k].home, {});

/* ----- Geführte Yoga-Einheit ----- */
let ygTimer = null, ygTimerIv = null;
const YG_SWITCH_S = 5;
function yogaSessStart(r) {
  data.yogaDraft = { rid: r.id, name: r.name, date: todayISO(), style: r.style || 'hatha', level: 'mid',
    items: r.items.map(it => ({ p: it.p, v: it.v, n: r.rounds || 1, done: 0 })) };
  saveData();
  ygTimerStop(); rtOpenIt = null;
  go('yogasess', {});
}
function ygTimerStart(i) {
  const f = data.yogaDraft, it = f && f.items[i], p = it && YOGA_BY_ID.get(it.p);
  if (!p || p.unit === 'r') return;
  const s = it.v || p.hold, segs = p.side ? [[s, 'Erste Seite'], [YG_SWITCH_S, 'Seite wechseln'], [s, 'Zweite Seite']] : [[s, 'Halten']];
  ygTimer = { i, segs, k: 0, end: Date.now() + segs[0][0] * 1000 };
  try { if (restCfg().sound) restAudio(true); } catch (e) { /* ohne Ton */ }
  clearInterval(ygTimerIv);
  ygTimerIv = setInterval(ygTimerTick, 250);
  render();
}
function ygTimerStop() { ygTimer = null; clearInterval(ygTimerIv); ygTimerIv = null; }
function ygTimerTick() {
  const t = ygTimer;
  if (!t || current.view !== 'yogasess' || !data.yogaDraft) { ygTimerStop(); return; }
  const left = t.end - Date.now();
  if (left <= 0) {
    try { restSignal(); } catch (e) { /* ohne Signal */ }
    if (t.k + 1 < t.segs.length) { t.k++; t.end = Date.now() + t.segs[t.k][0] * 1000; render(); return; }
    const it = data.yogaDraft.items[t.i];
    if (it && (it.done || 0) < it.n) it.done = (it.done || 0) + 1;
    ygTimerStop(); saveData(); render();
    return;
  }
  const el = document.getElementById('ys-timer-left');
  if (el) el.textContent = Math.ceil(left / 1000) + ' s';
}
const ysDone = f => f.items.reduce((a, i) => a + Math.min(i.done || 0, i.n), 0);
const ysAll = f => f.items.reduce((a, i) => a + i.n, 0);
function renderYogaSess() {
  const f = data.yogaDraft;
  if (!f) return `<p class="hint">Gerade läuft keine Yoga-Routine.</p><button class="btn primary" data-action="yoga-open">🧘 Zu Yoga</button>`;
  const rows = f.items.map((it, i) => {
    const p = YOGA_BY_ID.get(it.p);
    if (!p) return '';
    const open = rtOpenIt === i, run = ygTimer && ygTimer.i === i;
    const checks = `<div class="mob-checks">${Array.from({ length: it.n }, (_, k) => `<button class="mob-chk ${k < (it.done || 0) ? 'on' : ''}" data-action="ys-tick" data-i="${i}" data-k="${k}"
        aria-pressed="${k < (it.done || 0)}" aria-label="Durchgang ${k + 1}">${k < (it.done || 0) ? '✓' : k + 1}</button>`).join('')}</div>`;
    const left = run ? Math.max(0, Math.ceil((ygTimer.end - Date.now()) / 1000)) : 0;
    const timer = p.unit !== 'r' && (it.done || 0) < it.n ? `<div class="ms-timer ${run ? 'run' : ''}">${run
      ? `<span>${ygTimer.segs[ygTimer.k][1]}</span><b id="ys-timer-left">${left} s</b><button class="btn small" data-action="ys-timer-stop">Stopp</button>`
      : `<button class="btn small" data-action="ys-timer" data-i="${i}">▶ Timer ${it.v || p.hold} s${p.side ? ' je Seite' : ''}</button>`}</div>` : '';
    return `<li class="mob-row ${open ? 'open' : ''}"><div class="mob-row-top">
        <button class="mob-name" data-action="rt-it" data-i="${i}" aria-expanded="${open}"><span class="mob-name-t"><b>${esc(p.de)}</b></span><small>${rtItemTxt('yoga', it)}</small></button>
        ${checks}</div>${timer}${open ? yogaPoseDetail(p) : ''}</li>`;
  }).join('');
  const done = ysDone(f);
  return `<div class="card ms-list"><div class="mob-plan-head"><h2>🧘 ${esc(f.name)}</h2><span class="hint">ca. ${rtMin('yoga', { items: f.items, rounds: f.items[0] ? f.items[0].n : 1 })} min</span></div>
      ${done ? `<p class="hint nut-small">${done} von ${ysAll(f)} erledigt</p>` : ''}<p class="hint nut-small">▶ startet den Timer, ein Häkchen markiert einen Durchgang. Tippe auf eine Haltung für Anleitung und Figur.</p>
      <ul class="mob-list">${rows}</ul>
      <p class="lbl">Stil</p>
      <div class="variants yoga-styles">${Object.entries(YOGA_STYLES).map(([s, st]) => `<button class="vchip ${f.style === s ? 'on' : ''}" data-action="ys-style" data-k="${s}">${st.label}</button>`).join('')}</div>
      <label class="row"><span>Datum</span><input class="inp date" type="date" data-field="ys-date" value="${f.date}" max="${todayISO()}"></label>
      <div class="row"><button class="btn" data-action="ys-reset">Verwerfen</button><button class="btn primary" data-action="ys-save">✔ Speichern</button></div></div>`;
}
fields['ys-date'] = el => { if (data.yogaDraft) { data.yogaDraft.date = el.value || todayISO(); saveData(); } };

views.rtview = { title: p => rtNameOf(p.k, p.id) || 'Routine', tab: 'start', back: p => [RT_K[p.k] ? RT_K[p.k].home : 'start', {}], render: renderRtView };
views.rtedit = { title: () => rtEdit && rtEdit.id ? 'Routine bearbeiten' : 'Neue Routine', tab: 'start',
  back: () => rtEdit && rtEdit.id ? ['rtview', { k: rtEdit.k, id: rtEdit.id }] : [rtEdit ? RT_K[rtEdit.k].home : 'start', {}], render: renderRtEdit };
views.yogasess = { title: 'Yoga-Routine', tab: 'start', back: () => ['yoga', {}], render: renderYogaSess };

// Routine starten (aus der Routinen-Seite, dem Bereich oder dem Wochenplaner)
function rtStart(k, id) {
  const r = rtGet(k, id);
  if (!r || !r.items.length) { toast('Diese Routine hat noch keine Übungen.'); return; }
  if (k === 'yoga') {
    if (data.yogaDraft && ysDone(data.yogaDraft) && data.yogaDraft.rid !== r.id && !askOk(`„${data.yogaDraft.name}“ läuft noch. Verwerfen und „${r.name}“ starten?`)) return;
    yogaSessStart(r);
    return;
  }
  const f = data.mobDraft;
  if (f && typeof mobSessDone === 'function' && mobSessDone(f) && f.rid !== r.id && !askOk('Die laufende Mobility-Einheit verwerfen und die Routine starten?')) return;
  if (typeof mobTimerStop === 'function') mobTimerStop();
  data.mobDraft = { date: todayISO(), dur: MOB_DURS.reduce((a, b) => Math.abs(b - rtMin('mob', r)) < Math.abs(a - rtMin('mob', r)) ? b : a), focus: 'rt', rid: r.id, rname: r.name,
    regs: [], dayId: null, seed: Date.now() % 100000, items: r.items.map(it => ({ id: it.id, sets: it.sets, done: 0 })) };
  saveData();
  go('mobsess', {});
}

Object.assign(actions, {
  'rt-open': el => { rtOpenIt = null; go('rtview', { k: el.dataset.k, id: el.dataset.id }); },
  'rt-it': el => { const i = +el.dataset.i; rtOpenIt = rtOpenIt === i ? null : i; render(); },
  'rt-start': el => rtStart(el.dataset.k, el.dataset.id),
  'rt-new': el => { rtEdit = { k: el.dataset.k, id: null, name: '', rounds: 1, items: [] }; go('rtedit', {}); },
  'rt-copy': el => {
    const k = el.dataset.k, r = rtGet(k, el.dataset.id);
    if (!r) return;
    rtEdit = { k, id: null, name: `${r.name} (eigene)`, rounds: r.rounds || 1, style: r.style, how: r.how, items: r.items.map(it => ({ ...it })) };
    go('rtedit', {});
  },
  'rt-edit': el => {
    const k = el.dataset.k, r = rtGet(k, el.dataset.id);
    if (!r) return;
    rtEdit = { k, id: r.id, name: r.name, rounds: r.rounds || 1, style: r.style, how: r.how, items: r.items.map(it => ({ ...it })) };
    go('rtedit', {});
  },
  'rt-mv': el => { const i = +el.dataset.i, j = i + Number(el.dataset.d), l = rtEdit.items; if (j < 0 || j >= l.length) return; [l[i], l[j]] = [l[j], l[i]]; render(); },
  'rt-it-del': el => { rtEdit.items.splice(+el.dataset.i, 1); render(); },
  'rt-pick': () => { if (rtEdit.k === 'yoga') { ygQ = ''; ygOpenCat = null; go('yogapick', { rt: 1 }); } else { mobQ = ''; go('mobpick', { rt: 1 }); } },
  'rt-cancel': () => { const e = rtEdit; rtEdit = null; if (e && e.id) go('rtview', { k: e.k, id: e.id }); else rtHome(e ? e.k : 'yoga'); },
  'rt-save': () => {
    const e = rtEdit;
    if (!e) return;
    if (!e.name.trim()) { alert('Bitte gib der Routine einen Namen.'); return; }
    if (!e.items.length) { alert('Bitte füge mindestens eine Übung hinzu.'); return; }
    if (!data.routines || typeof data.routines !== 'object') data.routines = { yoga: [], mob: [] };
    if (!Array.isArray(data.routines[e.k])) data.routines[e.k] = [];
    const r = { id: e.id || uid(), name: e.name.trim().slice(0, 60), items: e.items.map(it => e.k === 'yoga' ? { p: it.p, v: it.v } : { id: it.id, sets: it.sets || 1 }) };
    if (e.k === 'yoga') { r.rounds = e.rounds || 1; if (e.style) r.style = e.style; }
    if (e.how) r.how = e.how;
    const list = data.routines[e.k], i = list.findIndex(x => x.id === r.id);
    if (i >= 0) list[i] = r; else list.push(r);
    saveData();
    rtEdit = null;
    toast(`✔ Routine „${r.name}“ gespeichert`);
    go('rtview', { k: e.k, id: r.id });
  },
  'rt-del': () => {
    const e = rtEdit;
    if (!e || !e.id || !askOk(`Routine „${e.name}“ löschen?`)) return;
    data.routines[e.k] = rtOwn(e.k).filter(r => r.id !== e.id);
    const s = schedOf(e.k);  // auch aus dem Wochenplaner nehmen
    if (s) { if (s.rt === e.id) s.rt = ''; if (s.rtDays) for (const d of Object.keys(s.rtDays)) if (s.rtDays[d] === e.id) delete s.rtDays[d]; }
    saveData();
    rtEdit = null;
    rtHome(e.k);
  },
  'rt-plan': el => {
    const k = el.dataset.k, id = el.dataset.id, s = schedOf(k);
    schedEdit = { k, mode: s ? s.mode : 'days', days: s && s.days ? [...s.days] : [], times: s && s.times || 2, every: s && s.every || 2, min: s && s.min ? String(s.min) : '',
      rt: id, rtDays: s && s.rtDays ? { ...s.rtDays } : {} };
    if (schedEdit.mode === 'days') schedEdit.days.forEach(d => { schedEdit.rtDays[d] = id; });
    go(RT_K[k].home, {});
    setTimeout(() => { const c = document.querySelector('.sched-card'); if (c) c.scrollIntoView({ block: 'start' }); }, 60);
  },
  // geführte Yoga-Einheit
  'ys-open': () => go('yogasess', {}),
  'ys-tick': el => { const it = data.yogaDraft && data.yogaDraft.items[+el.dataset.i], k = +el.dataset.k; if (!it) return; it.done = k < (it.done || 0) ? k : k + 1; saveData(); render(); },
  'ys-timer': el => ygTimerStart(+el.dataset.i),
  'ys-timer-stop': () => { ygTimerStop(); render(); },
  'ys-style': el => { data.yogaDraft.style = el.dataset.k; saveData(); render(); },
  'ys-reset': () => {
    if (data.yogaDraft && ysDone(data.yogaDraft) && !askOk('Diese Routine verwerfen? Abgehaktes geht verloren.')) return;
    ygTimerStop(); data.yogaDraft = null; saveData(); go('yoga', {});
  },
  'ys-save': () => {
    const f = data.yogaDraft;
    if (!f) return;
    if (!ysDone(f)) {
      if (!askOk('Du hast noch nichts abgehakt. Die ganze Routine als erledigt eintragen?')) return;
      f.items.forEach(i => { i.done = i.n; });
    }
    const sec = f.items.reduce((a, it) => a + (ytSec(it) + 6) * Math.min(it.done || 0, it.n), 0);
    const min = Math.max(1, Math.round(sec / 60));
    const items = f.items.filter(it => it.done).map(it => { const p = YOGA_BY_ID.get(it.p), o = { p: it.p, n: Math.min(it.done, it.n) }; if (p && p.unit !== 'r' && it.v) o.s = it.v; return o; });
    const entry = { id: uid(), date: f.date || todayISO(), style: f.style, level: f.level || 'mid', min, kcal: yogaKcalEst(f.style, f.level || 'mid', min), own: false, rname: f.name, items };
    data.yoga.push(entry);
    ygTimerStop(); data.yogaDraft = null;
    saveData();
    toast(`🧘 Eingetragen: ${entry.min} min | ca. ${deNum(entry.kcal)} kcal`);
    go('yoga', {}); window.scrollTo(0, 0);
  },
});
