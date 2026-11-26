/* LockYourGains | © 2026 Alexander Hundt | Alle Rechte vorbehalten – siehe LICENSE */
'use strict';

/* ---------- Phasenplan (v315, User-Wunsch 2026-11-17) ----------
   Zielgewicht + Enddatum eintragen → die App plant Ernährungsphasen nach ihren vorhandenen Regeln, auch kombiniert
   (z. B. erst Minicut, dann Diät), wechselt am Ende einer Phase automatisch in die nächste (vorher angekündigt, danach
   gemeldet) und zeigt im Ernährungskalender das geplante Tagesziel je Tag.
   data.nutrition.plan = { goalKg|null, end (Zieldatum), phases: [{ phase, pace, to, weeks (nur Minicut), brk (Diätpause) }], made }
   phases[0] = laufende Phase (ab n.since), jede weitere beginnt am Tag nach dem „to“ der vorigen; nach der letzten: Erhaltung.
   Minicut: „to“ = Defizit-Wochen + 1 Erhaltungswoche (wie nutMinicutStage). Diät: höchstens 16 Wochen am Stück, dann 2 Wochen
   Diätpause (Body Recomposition, Tempo Erhaltung). Deload-Wochen in der Diät = Erhaltung (nur ungefähr vorhersagbar,
   der Zyklus läuft über Trainings, nicht über Kalenderwochen).
   Einfach: nur eine Phase, Tempo wählt die App, kein Minicut. */

const PP_DIET_MAX_W = 16, PP_BREAK_W = 2, PP_MIN_DAYS = 7, PP_MIN_LEAD = 14, PP_MAX_DAYS = 3 * 365;
const PP_BULK_RATE = { good: 0.65, amb: 1.25, max: 1.5 };  // Aufbau: % des Körpergewichts pro Monat (Mitte Standard, Mitte Ambitioniert, Obergrenze; v380)
const PP_ICON = { bulk: '💪', recomp: '⚖️', diet: '🔥', minicut: '⚡', brk: '🧘' };
const ppD = iso => new Date(iso + 'T12:00:00').toLocaleDateString(LOCALE(), { day: '2-digit', month: '2-digit', year: '2-digit' });
const ppDays = (a, b) => Math.round((Date.parse(b + 'T12:00:00') - Date.parse(a + 'T12:00:00')) / DAY);
const ppPaceOf = (phase, pace) => NUT_PACES[phase].find(p => p.k === pace)
  || NUT_PACES[phase].find(p => p.k === 'normal' || p.k === 'light') || NUT_PACES[phase][0];
const ppKey = s => s.brk ? 'brk' : s.phase;
const ppLabel = s => s.brk ? 'Diätpause' : NUT_PHASES[s.phase].label;
const ppPaceLabel = s => s.brk ? 'Erhaltung' : ppPaceOf(s.phase, s.pace).label;
const ppMcTo = (from, weeks) => addDaysISO(from, weeks * 7 + 7 - 1);  // Minicut-Wochen + Erhaltungswoche
const ppPlan = (n = data.nutrition) => n && n.plan && Array.isArray(n.plan.phases) && n.plan.phases.length ? n.plan : null;
const ppMulti = () => feat('nut-pace');        // Standard und Experte: mehrere Phasen, Tempo wählbar
const ppMinicutOk = () => feat('nut-minicut');
const ppRound = kg => Math.round(kg * 2) / 2;

// Phasen → Abschnitte mit Beginn und Ende
function ppSegments(phases, from) {
  let f = from;
  return phases.map(p => {
    const s = { ...p, from: f, to: p.phase === 'minicut' ? ppMcTo(f, p.weeks || NUT_MINICUT_MAX) : p.to };
    f = addDaysISO(s.to, 1);
    return s;
  });
}

// Deload-Wochen in der Zukunft, nur ungefähr: nächster Deload laut laufendem Zyklus, danach alle (Standardlänge + 1) Wochen.
// Ein Minicut verschiebt den Deload auf seine Erhaltungswoche (wie nutSync/nutForceDeload), danach beginnt ein neuer Zyklus.
function ppDeloadStart() {
  if (!nutPlanCoupled()) return null;
  const ci = cycleInfo();
  return ci.deload ? todayISO() : addDaysISO(todayISO(), 7 * Math.max(0, data.cycle.buildWeeks + 1 - ci.week));
}
const ppCycleLen = () => (data.cycle.defWeeks || data.cycle.buildWeeks) + 1;

const ppTdee = (n, kg) => nutCalc({ ...n, phase: 'recomp', pace: 'maint', kcalOwn: null, adjust: 0, macroPct: null }, kg).tdee;

// Tag für Tag ab heute bis „until“: Tagesziel und erwartetes Gewicht. curFirst: Abschnitt 0 ist die laufende Phase
// (Anpassung aus dem Gewichtsverlauf bzw. eigenes Tagesziel zählen mit).
function ppSimulate(n, segs, until, opt = {}) {
  const T = todayISO(), floor = nutFloor(n), L = ppCycleLen();
  let kg = opt.kg != null ? opt.kg : nutWeight(), dlStart = ppDeloadStart();
  const inDl = d => dlStart != null && d >= dlStart && d < addDaysISO(dlStart, 7);
  const days = [];
  let floorHit = false, lastSi = -2;
  for (let i = 0, d = T; d <= until && i <= PP_MAX_DAYS; i++, d = addDaysISO(d, 1)) {
    const si = segs.findIndex(s => d >= s.from && d <= s.to);
    const s = si >= 0 ? segs[si] : null;
    const phase = s ? s.phase : 'recomp', pk = s ? ppPaceOf(phase, s.pace).kcal : 0;
    if (dlStart != null) {
      if (s && phase === 'minicut') {
        const ms = addDaysISO(s.from, (s.weeks || NUT_MINICUT_MAX) * 7);  // Beginn der Erhaltungswoche = Deload
        if ((si !== lastSi || d === ms) && !inDl(d)) dlStart = ms;
      }
      if (d >= addDaysISO(dlStart, 7)) dlStart = addDaysISO(dlStart, 7 * L);
    }
    lastSi = si;
    let delta = s && !s.brk ? pk : 0, maint = !s || !!s.brk;
    if (s && phase === 'minicut' && ppDays(s.from, d) >= (s.weeks || NUT_MINICUT_MAX) * 7) { delta = 0; maint = true; }
    if (s && phase === 'diet' && inDl(d)) { delta = 0; maint = true; }
    const tdee = ppTdee(n, kg);
    const cur = si === 0 && opt.curFirst;
    let kcal = cur && n.kcalOwn != null ? n.kcalOwn + (delta - pk) : tdee + delta + (cur ? n.adjust || 0 : 0);
    if (kcal < floor) { if (delta < 0) floorHit = true; kcal = floor; }
    kcal = Math.round(kcal / 10) * 10;
    days.push({ d, si, key: s ? ppKey(s) : 'after', kcal, kg, maint });
    // Aufbau: Zunahme nach der Regel der App (Standard ca. 0,65 %, Ambitioniert ca. 1,25 %, höchstens 1,5 % des Körpergewichts pro Monat);
    // die Kalorien dafür passt die App unterwegs über den Wochenschnitt an
    if (phase === 'bulk' && s) kg += kg * (s.pace === 'ambitious' ? PP_BULK_RATE.amb : PP_BULK_RATE.good) / 100 / 30.44;
    else kg += (kcal - tdee) / NUT_KCAL_KG;
  }
  return { days, endKg: kg, floorHit };
}
const ppKgAt = (sim, date) => { const x = sim.days.find(y => y.d === date); return x ? x.kg : sim.endKg; };

/* ----- Planer: Zielgewicht + Enddatum → Varianten ----- */

// Laufender Minicut bleibt, wie er ist (höchstens 4 Wochen + Erhaltungswoche, kein zweiter direkt dahinter geplant)
function ppPrefix(n) {
  if (n.phase !== 'minicut' || nutMinicutStage(n) === 'done') return [];
  const w = Math.min(n.weeks || NUT_MINICUT_MAX, NUT_MINICUT_MAX);
  return [{ phase: 'minicut', pace: n.pace, weeks: w, to: ppMcTo(n.since, w) }];
}
// Diät von „from“ bis „to“, nach höchstens 16 Wochen am Stück 2 Wochen Diätpause (done = schon gelaufene Diätwochen)
function ppDietChain(pace, from, to, done = 0) {
  const out = [];
  let f = from, room = Math.max(PP_MIN_DAYS, (PP_DIET_MAX_W - done) * 7);
  while (ppDays(f, to) + 1 > room) {
    const t = addDaysISO(f, room - 1), b = addDaysISO(t, PP_BREAK_W * 7);
    out.push({ phase: 'diet', pace, to: t }, { phase: 'recomp', pace: 'maint', to: b, brk: true });
    f = addDaysISO(b, 1);
    room = PP_DIET_MAX_W * 7;
    if (f > to) return out;
  }
  if (ppDays(f, to) + 1 >= PP_MIN_DAYS) out.push({ phase: 'diet', pace, to });
  return out;
}

// Ziel erreicht → die Phase endet dort, alles danach entfällt (danach Erhaltung)
function ppTrim(phases, segs, hit) {
  if (hit.si < 0) return phases.map(p => ({ ...p }));
  const out = phases.slice(0, hit.si + 1).map(p => ({ ...p }));
  const last = out[out.length - 1], s = segs[hit.si];
  if (last.brk) out.pop();
  else if (last.phase === 'minicut') {
    if (!last.keep) { last.weeks = Math.min(NUT_MINICUT_MAX, Math.max(2, Math.ceil((ppDays(s.from, hit.d) + 1) / 7))); last.to = ppMcTo(s.from, last.weeks); }
  } else last.to = [hit.d, addDaysISO(s.from, PP_MIN_DAYS - 1)].sort().pop();
  return out;
}

function ppVariants(n, kg, goal, end) {
  const T = todayISO(), diff = goal - kg, lose = diff < 0;
  const pre = lose ? ppPrefix(n) : [];
  const from0 = pre.length ? addDaysISO(pre[0].to, 1) : T;
  const dietDone = n.phase === 'diet' ? Math.max(0, nutWeekNo(n) - 1) : 0;
  // Abschnitt 0 ist die laufende Phase, wenn die Art gleich bleibt
  const keep = phases => phases.length && phases[0].phase === n.phase && !phases[0].brk;
  const run = (phases, until = end) => {
    const segs = ppSegments(phases, keep(phases) ? n.since : T);
    return { segs, sim: ppSimulate(n, segs, until, { curFirst: keep(phases) }) };
  };
  const reached = x => lose ? x.kg <= goal + 0.05 : x.kg >= goal - 0.05;
  const mk = (kind, phases) => {
    if (!phases.length) return null;
    const { segs, sim } = run(phases);
    const hit = sim.days.find(reached);
    if (!hit) return null;
    const trimmed = ppTrim(phases, segs, hit), r = run(trimmed);
    return { kind, phases: trimmed, segs: r.segs, sim: r.sim, reach: hit.d, from0: keep(trimmed) ? n.since : T };
  };
  if (Math.abs(diff) < 0.5) {
    const phases = [{ phase: 'recomp', pace: 'maint', to: end }], r = run(phases);
    return { variants: [{ kind: 'hold', phases, segs: r.segs, sim: r.sim, reach: null, from0: keep(phases) ? n.since : T }], lose };
  }
  const variants = [];
  if (lose) {
    const paces = ['slow', 'normal', 'fast'];
    const even = paces.reduce((v, p) => v || mk('even', [...pre, ...ppDietChain(p, from0, end, pre.length ? 0 : dietDone)]), null);
    if (even) variants.push(even);
    const evenPace = even && (even.phases.find(p => p.phase === 'diet') || {}).pace;
    // Kombination (User-Wunsch): erst ein Minicut, danach eine sanftere Diät – nur wenn sie wirklich sanfter ist oder es sonst nicht reicht
    if (ppMulti() && ppMinicutOk() && !pre.length && n.phase !== 'minicut' && -diff >= 2 && ppDays(T, end) >= 6 * 7) {
      let mini = null;
      for (const mp of ['normal', 'more']) for (const p of paces) {
        if (mini) break;
        if (even && (evenPace !== 'fast' || paces.indexOf(p) >= paces.indexOf(evenPace))) continue;
        const mc = { phase: 'minicut', pace: mp, weeks: NUT_MINICUT_MAX, to: ppMcTo(T, NUT_MINICUT_MAX) };
        const rest = addDaysISO(mc.to, 1);
        mini = mk('mini', [mc, ...(ppDays(rest, end) >= PP_MIN_DAYS - 1 ? ppDietChain(p, rest, end) : [])]);
      }
      if (mini) variants.push(mini);
    }
  } else {
    // Aufbau: höchstens 1,5 % des Körpergewichts pro Monat (Regel der App, v380)
    const months = ppDays(T, end) / 30.44;
    if (diff / kg * 100 / months <= PP_BULK_RATE.max) {
      const v = ['normal', 'ambitious'].reduce((x, p) => x || mk('gain', [{ phase: 'bulk', pace: p, to: end }]), null);
      if (v) variants.push(v);
    }
  }
  if (variants.length) return { variants, lose };
  // unrealistisch: was bis zum Enddatum drin ist (strengste erlaubte Variante) und wann das Ziel in gutem Tempo erreichbar wäre
  const unreal = { kg: null, date: null };
  if (lose) {
    const mcOk = ppMulti() && ppMinicutOk() && !pre.length && n.phase !== 'minicut' && ppDays(T, end) >= 5 * 7;
    const mc = { phase: 'minicut', pace: 'more', weeks: NUT_MINICUT_MAX, to: ppMcTo(T, NUT_MINICUT_MAX) };
    const hard = mcOk ? [mc, ...ppDietChain('fast', addDaysISO(mc.to, 1), end)] : [...pre, ...ppDietChain('fast', from0, end, pre.length ? 0 : dietDone)];
    if (hard.length) { const k = ppRound(ppKgAt(run(hard).sim, end) + 0.24); if (k < kg - 0.4) unreal.kg = k; }
    const far = addDaysISO(T, PP_MAX_DAYS), r = run([...pre, ...ppDietChain('normal', from0, far, pre.length ? 0 : dietDone)], far);
    const hit = r.sim.days.find(reached);
    if (hit) unreal.date = hit.d;
  } else {
    const months = ppDays(T, end) / 30.44;
    const capKg = kg * (1 + PP_BULK_RATE.max / 100 * months);
    const simKg = ppKgAt(run([{ phase: 'bulk', pace: 'ambitious', to: end }]).sim, end);
    const k = Math.floor(Math.min(capKg, simKg) * 2) / 2;
    if (k > kg + 0.4) unreal.kg = k;
    const need = diff / (kg * PP_BULK_RATE.good / 100);  // Monate im Standard-Tempo
    if (need * 30.44 <= PP_MAX_DAYS) unreal.date = addDaysISO(T, Math.ceil(need * 30.44));
  }
  return { variants: [], unreal, lose };
}

/* ----- Prüfen: Plan außerhalb der Regeln? ----- */
function ppChecks(n, d, segs, sim) {
  const T = todayISO(), err = [], warn = [];
  segs.forEach((s, i) => {
    if (s.to < s.from || ppDays(s.from, s.to) + 1 < PP_MIN_DAYS) err.push(`Die ${i + 1}. Phase ist kürzer als eine Woche. Verlänger sie oder entferne sie.`);
  });
  if (segs.length && segs[0].to < T) err.push('Die erste Phase endet schon vor heute.');
  let run = 0, maxRun = 0, mc = 0, mcWarn = false;
  for (const s of segs) {
    if (s.phase === 'diet' && !s.brk) { run += ppDays(s.from, s.to) + 1; maxRun = Math.max(maxRun, run); } else if (s.phase !== 'minicut') run = 0;
    if (s.phase === 'minicut') { if (++mc > 2) mcWarn = true; } else mc = 0;
  }
  if (maxRun > PP_DIET_MAX_W * 7 + 6) warn.push(`Mehr als ${PP_DIET_MAX_W} Wochen Diät am Stück sind hart. Plane besser eine Diätpause ein: 2 Wochen auf Erhaltung (Body Recomposition, Tempo Erhaltung).`);
  if (mcWarn) warn.push('Mehr als zwei Minicuts direkt hintereinander empfiehlt die App nicht. Danach lieber Aufbau oder ein paar Wochen auf Erhaltung.');
  if (sim.floorHit) warn.push(`An manchen Tagen läge das Tagesziel unter ${deNum(nutFloor(n))} kcal. Weniger empfiehlt die App nicht, deshalb bleibt es dort bei ${deNum(nutFloor(n))} kcal und es dauert etwas länger.`);
  if (d.goalNum != null && d.end) {
    const at = ppKgAt(sim, d.end), lose = d.goalNum < d.kg0;
    if (Math.abs(d.goalNum - d.kg0) >= 0.5 && (lose ? at > d.goalNum + 0.3 : at < d.goalNum - 0.3)) {
      // v329 (User): eigene Begründung für Aufbau (Körperfett) und Diät (Defizit)
      warn.push(`Mit diesen Phasen kommst du bis ${ppD(d.end)} auf ca. ${fmtNum(round1(at))} kg statt auf ${fmtNum(d.goalNum)} kg.`
        + (lose ? ' Das ist leider etwas unrealistisch. Ein noch größeres Defizit kostet Muskeln und Kraft. Geh es lieber etwas langsamer an und verschieb das Enddatum.'
          : ' Das ist leider etwas unrealistisch. Schneller zuzunehmen hieße vor allem mehr Körperfett, und das schadet Gesundheit und Training. Verschieb lieber das Enddatum oder plane ein etwas niedrigeres Zielgewicht.'));
    }
  }
  if (n.bodyFat != null && segs.some(s => s.phase === 'bulk')) {
    const bs = segs.filter(s => s.phase === 'bulk').pop();
    const a = ppKgAt(sim, [bs.from, T].sort().pop()), b = ppKgAt(sim, bs.to);
    const bf = b > a ? (a * n.bodyFat / 100 + (b - a) / 2) / b * 100 : n.bodyFat;
    if (bf >= nutBfMax(n)) warn.push(`Am Ende des Aufbaus lägest du geschätzt bei ca. ${fmtNum(Math.round(bf))} % Körperfett. Im Aufbau sollten es höchstens ca. ${nutBfMax(n)} % sein. Plane den Aufbau kürzer oder zwischendurch einen Minicut.`);
  }
  return { err, warn };
}

/* ----- Automatischer Wechsel (2A): bei jedem Zeichnen über nutSync ----- */
function ppSync() {
  const n = data.nutrition, p = ppPlan(n);
  if (!p || !nutReady(n) || nutPaused(n)) return;
  const T = todayISO(), segs = ppSegments(p.phases, n.since);
  if (T <= segs[0].to) return;
  let k = 0;
  while (k < segs.length && T > segs[k].to) k++;  // App länger nicht geöffnet: verpasste Phasen überspringen
  const rest = p.phases.slice(k);
  const next = rest[0] || { phase: 'recomp', pace: 'maint' };
  const kg = nutWeight() != null ? nutWeight() : n.startKg;
  const nn = nutBeginPhase({ ...n, pace: next.pace, round: 1, weeks: next.weeks || n.weeks,
    goalKg: next.phase === 'recomp' ? null : p.goalKg, trainAdapt: n.trainAdapt == null ? true : n.trainAdapt }, next.phase, kg);
  nn.plan = rest.length ? { ...p, phases: rest } : null;
  nn.planNote = { from: { phase: n.phase, pace: n.pace, brk: !!p.phases[0].brk }, to: { phase: next.phase, pace: next.pace, brk: !!next.brk }, end: !rest.length, date: T };
  data.nutrition = nn;
  saveData();
}

/* ----- Anzeige ----- */
function ppTimelineHtml(segs, sim, opt = {}) {
  const avg = i => { const L = sim ? sim.days.filter(x => x.si === i) : []; return L.length ? L.reduce((a, x) => a + x.kcal, 0) / L.length : null; };
  return `<div class="pp-tl">${segs.map((s, i) => { const a = avg(i);
    return `<div class="pp-seg pp-${ppKey(s)}${opt.cur && i === 0 ? ' cur' : ''}">
      <div class="pp-seg-ic" aria-hidden="true">${PP_ICON[ppKey(s)]}</div>
      <div class="pp-seg-main"><div class="pp-seg-name">${ppLabel(s)}</div><div class="pp-seg-pace">${ppPaceLabel(s)}</div></div>
      <div class="pp-seg-side"><div class="pp-seg-date">${ppD(s.from)} bis ${ppD(s.to)}</div>${a != null ? `<div class="pp-seg-kcal">Ø ${nutKcal(a)} kcal</div>` : ''}</div>
    </div>`; }).join('')}
    <div class="pp-seg pp-after"><div class="pp-seg-ic" aria-hidden="true">${PP_ICON.recomp}</div>
      <div class="pp-seg-main"><div class="pp-seg-name">Danach</div><div class="pp-seg-pace">Erhaltung</div></div></div></div>`;
}

// Karte im Ernährungs-Reiter: Plan, nächster Wechsel (ab 3 Tagen vorher hervorgehoben), Prognose
function ppCardHtml(n) {
  const p = ppPlan(n);
  if (!p) return '';
  const T = todayISO(), segs = ppSegments(p.phases, n.since);
  const map = ppDayMap();
  const sim = map && map.sim;
  const sw = addDaysISO(segs[0].to, 1), left = ppDays(T, sw);
  const nx = segs[1] || null;
  const endKg = sim && p.end ? ppKgAt(sim, p.end) : null;
  return `<div class="card pp-card"><h2>📅 Dein Phasenplan</h2>
      ${p.goalKg != null ? `<p class="hint nut-small pp-goal">Ziel: ${fmtNum(p.goalKg)} kg bis ${ppD(p.end)}</p>` : ''}
      ${ppTimelineHtml(segs, sim, { cur: true })}
      <div class="pp-next${left <= 3 ? ' soon' : ''}">
        <div class="pp-next-t">${left <= 0 ? '⏭ Heute wechselt dein Ernährungsziel automatisch' : left === 1 ? '⏭ Morgen wechselt dein Ernährungsziel automatisch' : left <= 3 ? `⏭ In ${left} Tagen wechselt dein Ernährungsziel automatisch` : `⏭ Nächster Wechsel automatisch am ${ppD(sw)}`}</div>
        <div class="pp-next-to">${nx ? `${PP_ICON[ppKey(nx)]} ${ppLabel(nx)}` : `${PP_ICON.recomp} Erhaltung`}</div>
        <div class="pp-next-hint">${nx ? 'Das Tagesziel stellt sich dann von selbst um. Du bekommst hier eine Meldung.' : 'Dein Plan endet dann. Danach isst du auf Erhaltung, bis du ein neues Ziel planst.'}</div>
      </div>
      ${endKg != null && p.goalKg != null ? `<p class="hint nut-small pp-proj">Voraussichtlich am ${ppD(p.end)}: ca. ${fmtNum(round1(endKg))} kg</p>` : ''}
      <div class="row pp-btns"><button class="btn" data-action="pp-cal">📅 Im Kalender</button>
        <button class="btn" data-action="pp-edit">✎ Bearbeiten</button></div>
    </div>`;
}

// Meldung nach dem automatischen Wechsel, bleibt bis „Okay“
function ppNoteHtml(n) {
  const x = n && n.planNote;
  if (!x) return '';
  const lab = s => `${PP_ICON[ppKey(s)]} ${ppLabel(s)}`;
  return `<div class="card nut-check ok pp-note"><p><b>🔄 Neue Phase laut deinem Plan</b></p>
      <div class="pp-note-sw"><div>${lab(x.from)}</div><div class="pp-note-arrow" aria-hidden="true">→</div><div>${lab(x.to)}</div></div>
      <p class="hint nut-small">${x.end ? 'Dein Phasenplan ist zu Ende. Ab jetzt isst du auf Erhaltung. Plane gern dein nächstes Ziel.'
        : 'Dein Ernährungsziel hat heute automatisch gewechselt. Dein Tagesziel ist schon umgestellt.'}</p>
      <button class="btn" data-action="pp-note-ok">Okay</button></div>`;
}

// Tagesziele des gespeicherten Plans für den Kalender (gemerkt, solange sich nichts ändert)
let ppMemo = null;
function ppDayMap() {
  const n = data.nutrition, p = ppPlan(n);
  if (!p || !nutReady(n) || nutWeight() == null || nutPaused(n)) return null;
  const key = JSON.stringify([todayISO(), p, n.phase, n.pace, n.since, n.adjust, n.kcalOwn, nutWeight(), n.activity, n.bodyFat, n.weeks, data.cycle.week, data.cycle.start]);
  if (ppMemo && ppMemo.key === key) return ppMemo.map;
  const segs = ppSegments(p.phases, n.since);
  const until = [segs[segs.length - 1].to, p.end || ''].sort().pop();
  const sim = ppSimulate(n, segs, until, { curFirst: true });
  const map = new Map(sim.days.map(x => [x.d, x]));
  map.last = until; map.segs = segs; map.sim = sim;
  ppMemo = { key, map };
  return map;
}

/* ----- Seite „Ziel mit Enddatum“ ----- */
let ppDraft = null;  // { goal, end (Text), res, pick, phases, from0, lockFirst, edit, kg0, goalNum }
function ppInit() {
  const n = data.nutrition, p = ppPlan(n);
  ppDraft = p
    ? { goal: p.goalKg != null ? fmtNum(p.goalKg) : '', end: p.end || '', res: null, pick: null, phases: p.phases.map(x => ({ ...x })), from0: n.since, lockFirst: true, edit: true }
    : { goal: n.goalKg != null ? fmtNum(n.goalKg) : '', end: '', res: null, pick: null, phases: null, from0: todayISO(), lockFirst: false, edit: false };
  ppDraft.kg0 = nutWeight();
  ppDraft.goalNum = parseNum(ppDraft.goal);
}

function renderPhasePlan() {
  const n = data.nutrition, kg = nutWeight();
  if (!n || !nutReady(n) || kg == null) return '<p class="hint">Richte zuerst dein Ernährungsziel ein und trag dein Gewicht ein.</p>';
  if (!ppDraft) ppInit();
  const d = ppDraft;
  let h = `<div class="card wiz-q pp-in">
      <div class="wiz-q-head"><span class="wiz-q-icon" aria-hidden="true">📅</span><h2>Ziel mit Enddatum</h2></div>
      <p class="hint wiz-q-explain">${ppMulti()
        ? 'Trag ein, welches Gewicht du bis wann erreichen willst. Die App plant die passenden Phasen nach ihren Regeln, auch kombiniert, z. B. erst einen Minicut und danach eine Diät. Jede Phase kannst du danach noch anpassen.'
        : 'Trag ein, welches Gewicht du bis wann erreichen willst. Die App wählt das passende Tempo nach ihren Regeln.'}</p>
      <div class="row"><span>Jetzt</span><b class="pp-now">${fmtNum(kg)} kg</b></div>
      <label class="row"><span>Zielgewicht</span><input class="inp kg" type="text" inputmode="decimal" autocomplete="off" data-field="pp-goal" data-unit="kg" value="${esc(d.goal)}" placeholder="kg"></label>
      <label class="row"><span>Enddatum</span><input class="inp date" type="date" data-field="pp-end" value="${d.end}" min="${addDaysISO(todayISO(), PP_MIN_LEAD)}"></label>
      <button class="btn primary" data-action="pp-calc">${d.phases ? 'Neu berechnen' : 'Plan berechnen'}</button>
    </div>`;
  if (d.res) h += ppResultHtml(n, d);
  if (d.phases && ppMulti()) h += ppEditorHtml(n, d);
  else if (d.phases) {
    // Einfach: kein Bearbeiten einzelner Phasen, nur Übersicht (bei einem bestehenden Plan ohne neue Berechnung)
    const c = ppCheckDraft(n, d);
    if (!d.res) h += `<div class="card">${ppTimelineHtml(c.segs, c.sim, { cur: d.lockFirst })}</div>`;
    h += ppSaveHtml(n, d, c);
  }
  if (d.edit) h += '<button class="btn danger" data-action="pp-del">Phasenplan löschen</button>';
  return h;
}

function ppResultHtml(n, d) {
  const r = d.res;
  if (r.unreal) {
    return `<div class="card nut-check off pp-unreal"><p><b>⚠️ Das ist leider etwas unrealistisch</b></p>
      ${r.lose ? `<p class="hint nut-small">So schnell abzunehmen geht mit den Regeln der App nicht, ohne dass Muskeln, Kraft oder Gesundheit leiden.
        Ein zu großes Defizit kostet Muskeln und Leistung im Training und ist auf Dauer kaum durchzuhalten. Geh es lieber etwas langsamer an:</p>`
      : `<p class="hint nut-small">Muskeln wachsen nur langsam. Deshalb plant die App im Aufbau höchstens etwa 1 % deines Körpergewichts pro Monat.
        Was du darüber hinaus zunimmst, ist vor allem Körperfett.</p>
        <p class="hint nut-small">Steigt dein Körperfettanteil zu schnell, ist das ungünstig für die Gesundheit, z. B. für Blutdruck, Blutzucker und
        Blutfette. Auch im Training merkst du es: Du fühlst dich träger, Übungen mit dem eigenen Körpergewicht wie Klimmzüge oder Dips werden
        schwerer, und die Diät danach dauert länger. Geh es lieber etwas langsamer an:</p>`}
      ${r.unreal.date ? `<button class="btn" data-action="pp-use-date" data-v="${r.unreal.date}">Enddatum auf ${ppD(r.unreal.date)} verschieben</button>` : ''}
      ${r.unreal.kg != null ? `<button class="btn" data-action="pp-use-goal" data-v="${r.unreal.kg}">Zielgewicht auf ${fmtNum(r.unreal.kg)} kg ändern</button>` : ''}
      ${!r.unreal.date && r.unreal.kg == null ? '<p class="hint nut-small">Wähle ein späteres Enddatum oder ein Ziel näher an deinem jetzigen Gewicht.</p>' : ''}
    </div>`;
  }
  const title = { even: 'Gleichmäßig', mini: 'Mit Minicut zum Start', gain: 'Aufbau', hold: 'Gewicht halten' };
  return `<div class="pp-vars"><h2 class="pp-h">${r.variants.length > 1 ? 'Wähle eine Variante' : 'So plant die App'}</h2>
    ${r.variants.map((v, i) => `<div class="card pp-var${d.pick === i ? ' on' : ''}">
      <div class="pp-var-head"><div class="pp-var-t">${title[v.kind]}</div>
        ${r.variants.length > 1 ? `<button class="vchip ${d.pick === i ? 'on' : ''}" data-action="pp-pick" data-i="${i}">${d.pick === i ? 'Gewählt' : 'Wählen'}</button>` : ''}</div>
      ${ppTimelineHtml(v.segs, v.sim)}
      ${v.reach ? `<p class="hint nut-small pp-reach">Ziel voraussichtlich am ${ppD(v.reach)} erreicht${v.reach < d.end ? ', danach Erhaltung' : ''}</p>` : ''}
    </div>`).join('')}</div>`;
}

const ppPhaseOrder = () => ['diet', ...(ppMinicutOk() ? ['minicut'] : []), 'recomp', 'bulk'];
function ppCheckDraft(n, d) {
  const segs = ppSegments(d.phases, d.from0);
  const until = [segs[segs.length - 1].to, d.end || ''].sort().pop();
  const sim = ppSimulate(n, segs, until, { curFirst: d.phases[0].phase === n.phase && d.from0 === n.since });
  return { segs, sim, ...ppChecks(n, d, segs, sim) };
}

function ppEditorHtml(n, d) {
  const c = ppCheckDraft(n, d);
  let h = `<div class="card pp-edit"><h2>${d.edit && !d.res ? 'Phasen bearbeiten' : 'Phasen anpassen'}</h2>`;
  c.segs.forEach((s, i) => {
    const cur = i === 0 && d.lockFirst;
    h += `<div class="pp-ph pp-${ppKey(s)}">
      <div class="pp-ph-head"><span class="pp-ph-ic" aria-hidden="true">${PP_ICON[ppKey(s)]}</span><div class="pp-ph-name">${ppLabel(s)}</div>
        ${cur ? '<div class="pp-ph-cur">läuft</div>' : ''}
        ${d.phases.length > 1 && !cur ? `<button class="plan-del-x" data-action="pp-ph-del" data-i="${i}" aria-label="Phase entfernen" title="Phase entfernen">✕</button>` : ''}</div>
      ${s.brk ? '' : `<div class="variants plan pp-chips">${NUT_PACES[s.phase].map(p => `<button class="vchip ${s.pace === p.k ? 'on' : ''}" data-action="pp-ph-pace" data-i="${i}" data-k="${p.k}">${p.label}</button>`).join('')}</div>`}
      ${s.phase === 'minicut'
        ? `${cur ? '' : `<div class="variants plan pp-chips">${[2, 3, 4].map(w => `<button class="vchip ${(s.weeks || NUT_MINICUT_MAX) === w ? 'on' : ''}" data-action="pp-ph-weeks" data-i="${i}" data-w="${w}">${w} Wochen</button>`).join('')}</div>`}
           <p class="hint nut-small">Mit Erhaltungswoche danach: ${ppD(s.from)} bis ${ppD(s.to)}</p>`
        : `<label class="row pp-to"><span>${ppD(s.from)} bis</span><input class="inp date" type="date" data-field="pp-ph-to" data-i="${i}" value="${s.to}" min="${addDaysISO(s.from, PP_MIN_DAYS - 1)}"></label>`}
    </div>`;
  });
  h += `<div class="pp-add"><p class="lbl">Phase anhängen</p><div class="variants plan">${ppPhaseOrder().map(p =>
    `<button class="vchip" data-action="pp-ph-add" data-p="${p}">${PP_ICON[p]} ${NUT_PHASES[p].label}</button>`).join('')}</div></div></div>`;
  return h + ppSaveHtml(n, d, c);
}

function ppSaveHtml(n, d, c) {
  const endKg = d.end ? ppKgAt(c.sim, d.end) : null;
  return `${endKg != null && d.goalNum != null ? `<p class="pp-proj-big">Voraussichtlich am ${ppD(d.end)}: ca. ${fmtNum(round1(endKg))} kg</p>` : ''}
    ${c.err.map(x => `<p class="nut-warn">⛔ ${x}</p>`).join('')}${c.warn.map(x => `<p class="nut-warn">⚠️ ${x}</p>`).join('')}
    <p class="hint nut-small pp-auto-note">${d.phases.length > 1 ? 'Am Ende jeder Phase wechselt die App automatisch in die nächste.' : 'Am Ende der Phase wechselt die App automatisch auf Erhaltung.'} Drei Tage vorher kündigt sie den Wechsel auf der Ernährungsseite an, danach bekommst du eine Meldung. Im Ernährungskalender siehst du für jeden Tag das geplante Tagesziel.</p>
    <div class="row"><button class="btn" data-action="back">Abbrechen</button>
      <button class="btn primary" data-action="pp-save">Plan übernehmen</button></div>`;
}

views.phaseplan = { title: 'Ziel mit Enddatum', tab: 'nutrition', back: 'nutrition', render: renderPhasePlan };

// Phase anhängen: beginnt nach der letzten, 8 Wochen (Minicut 4 Wochen + Erhaltungswoche)
function ppAdd(d, phase) {
  const segs = ppSegments(d.phases, d.from0), last = segs[segs.length - 1];
  const from = addDaysISO(last.to, 1);
  const pace = phase === 'recomp' ? 'light' : 'normal';
  d.phases.push(phase === 'minicut' ? { phase, pace, weeks: NUT_MINICUT_MAX, to: ppMcTo(from, NUT_MINICUT_MAX) } : { phase, pace, to: addDaysISO(from, 8 * 7 - 1) });
}

function ppApply(d) {
  let n = data.nutrition;
  const kg = nutWeight(), first = d.phases[0], goal = d.goalNum;
  const goalFor = ph => ph.phase === 'recomp' ? null : goal;
  if (first.phase !== n.phase || d.from0 !== n.since) {
    n = nutBeginPhase({ ...n, pace: first.pace, weeks: first.weeks || n.weeks, round: 1, goalKg: goalFor(first),
      trainAdapt: n.trainAdapt == null ? true : n.trainAdapt }, first.phase, kg);
  } else {
    const paceChanged = n.pace !== first.pace;
    n = { ...n, pace: first.pace, goalKg: goalFor(first), ...(first.phase === 'minicut' ? { weeks: first.weeks || n.weeks } : {}), ...(paceChanged ? { kcalOwn: null } : {}) };
  }
  n.plan = { goalKg: goal, end: d.end || null, made: todayISO(),
    phases: d.phases.map(({ phase, pace, to, weeks, brk }) => ({ phase, pace, to: phase === 'minicut' ? null : to, ...(phase === 'minicut' ? { weeks: weeks || NUT_MINICUT_MAX } : {}), ...(brk ? { brk } : {}) })) };
  n.planNote = null;
  data.nutrition = n;
}

Object.assign(fields, {
  'pp-goal': el => { ppDraft.goal = el.value; },
  'pp-end': el => { ppDraft.end = el.value; },
  'pp-ph-to': el => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(el.value)) return;
    ppDraft.phases[Number(el.dataset.i)].to = el.value;
    if (Number(el.dataset.i) === ppDraft.phases.length - 1 && !ppDraft.goalNum) ppDraft.end = el.value;
    render();
  },
});

Object.assign(actions, {
  'pp-open': () => { ppDraft = null; go('phaseplan'); },
  'pp-edit': () => { ppDraft = null; go('phaseplan'); },
  'pp-cal': () => go('foodcal', { month: todayISO().slice(0, 7), from: 'nutrition', date: todayISO() }),
  'pp-note-ok': () => { data.nutrition.planNote = null; saveData(); render(); },
  'pp-calc': () => {
    const d = ppDraft, n = data.nutrition, kg = nutWeight(), T = todayISO();
    const goal = parseNum(d.goal);
    if (goal == null || goal < 30 || goal > 300) { alert('Bitte ein Zielgewicht in kg eintragen.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.end) || d.end < addDaysISO(T, PP_MIN_LEAD)) { alert('Bitte ein Enddatum wählen, das mindestens zwei Wochen in der Zukunft liegt.'); return; }
    if (d.end > addDaysISO(T, PP_MAX_DAYS)) { alert('Bitte ein Enddatum innerhalb der nächsten drei Jahre wählen.'); return; }
    d.goalNum = goal; d.kg0 = kg;
    d.res = ppVariants(n, kg, goal, d.end);
    d.pick = d.res.variants.length ? 0 : null;
    if (d.pick != null) { const v = d.res.variants[0]; d.phases = v.phases.map(x => ({ ...x })); d.from0 = v.from0; d.lockFirst = v.from0 === n.since && n.phase === v.phases[0].phase; }
    else d.phases = null;
    render();
  },
  'pp-pick': el => {
    const d = ppDraft, v = d.res.variants[Number(el.dataset.i)], n = data.nutrition;
    d.pick = Number(el.dataset.i);
    d.phases = v.phases.map(x => ({ ...x })); d.from0 = v.from0; d.lockFirst = v.from0 === n.since && n.phase === v.phases[0].phase;
    render();
  },
  'pp-use-date': el => { ppDraft.end = el.dataset.v; actions['pp-calc'](); },
  'pp-use-goal': el => { ppDraft.goal = fmtNum(Number(el.dataset.v)); actions['pp-calc'](); },
  'pp-ph-pace': el => { ppDraft.phases[Number(el.dataset.i)].pace = el.dataset.k; render(); },
  'pp-ph-weeks': el => { const p = ppDraft.phases[Number(el.dataset.i)]; p.weeks = Number(el.dataset.w); render(); },
  'pp-ph-del': el => { if (!askOk('Diese Phase entfernen?')) return; ppDraft.phases.splice(Number(el.dataset.i), 1); render(); },
  'pp-ph-add': el => { ppAdd(ppDraft, el.dataset.p); render(); },
  'pp-save': () => {
    const d = ppDraft, n = data.nutrition;
    if (!d.phases || !d.phases.length) return;
    if (d.goalNum == null && d.goal) d.goalNum = parseNum(d.goal);
    const c = ppCheckDraft(n, d);
    if (c.err.length) { alert(c.err.join('\n')); return; }
    const nx = d.phases.length > 1;
    if (!askOk(`Plan übernehmen?\n\n${nx ? 'Am Ende jeder Phase wechselt die App automatisch in die nächste.' : 'Am Ende der Phase wechselt die App automatisch auf Erhaltung.'} Den Wechsel kündigt sie drei Tage vorher auf der Ernährungsseite an.`)) return;
    ppApply(d);
    ppDraft = null;
    saveData();
    toast('Phasenplan gespeichert ✔');
    go('nutrition');
  },
  'pp-del': () => {
    if (!askOk('Phasenplan löschen?\n\nDein aktuelles Ernährungsziel läuft weiter, es wechselt aber nicht mehr automatisch.')) return;
    data.nutrition.plan = null;
    ppDraft = null;
    saveData();
    toast('Phasenplan gelöscht');
    go('nutrition');
  },
});
