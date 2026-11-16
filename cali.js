/* LockYourGains | © 2026 Alex Hundt | Alle Rechte vorbehalten – siehe LICENSE */
'use strict';

/* ---------- Calisthenics (v225, User 2026-11-13, erst in der Beta) ----------
   Vom User bestätigte Regeln:
   - Schwerpunkt nach Priorität (Skills / Kraft & Muskeln / Beides) oder komplett selbst zusammengestellt.
   - Wdh.: +1 je Satz pro Woche bis zum oberen Ende bzw. Stufenziel; nicht geschafft → gleich bleiben.
   - Haltezeiten: +5 s je Satz pro Woche bis zum Stufenziel; nicht geschafft → gleich bleiben.
   - v232: zweimal hintereinander deutlich verfehlt (mind. 20 % darunter) → nächstes Ziel = das Beste dieser beiden Trainings
     (Haltezeiten auf 5 s abgerundet). Sonst klebt z. B. nach einem Stufenwechsel ein zu hoher Startwert fest.
   - Stufenwechsel nur nach Rückfrage, sobald das Stufenziel in 2 Trainings geschafft ist; „Später“ = frühestens nach 2 Wochen wieder.
   - Erfolge je erreichter Stufe und je kompletter Leiter (charts.js).
   Technik: Der Plan ist ein eigener Plan (own, ohne Zyklen) mit plan.cali; Übungen tragen ex.cali = { lad, step }.
   caliApply() setzt beim Trainingsstart die Ziele je Satz. */

const caliOn = () => typeof IS_BETA !== 'undefined' && IS_BETA;

// Leitern: Stufen [Übung, Ziel { s: Sätze, v: Wdh. bzw. Sekunden, h: Halteübung, side: je Seite }]
const CALI_LADDERS = [
  { id: 'pull', title: 'Klimmzug', kind: 'strength', steps: [['Toter Hang (Dead Hang)', { s: 3, v: 30, h: 1 }], ['Schulterblatt-Klimmzüge (Scapula Pulls)', { s: 3, v: 10 }],
    ['Negative Klimmzüge', { s: 3, v: 5 }], ['Klimmzüge', { s: 3, v: 8 }], ['Archer-Klimmzüge', { s: 3, v: 5, side: 1 }], ['Einarmige Klimmzüge', { s: 1, v: 1, side: 1 }]] },
  { id: 'push', title: 'Liegestütz', kind: 'strength', steps: [['Liegestütze erhöht', { s: 3, v: 15 }], ['Liegestütze', { s: 3, v: 20 }], ['Archer-Liegestütze', { s: 3, v: 8, side: 1 }],
    ['Pseudo-Planche-Liegestütze', { s: 3, v: 10 }], ['Einarmige Liegestütze', { s: 3, v: 5, side: 1 }]] },
  { id: 'dip', title: 'Dips', kind: 'strength', steps: [['Bankdips', { s: 3, v: 15 }], ['Dips (Brust)', { s: 3, v: 10 }],
    ['Dips an der geraden Stange (Straight Bar Dips)', { s: 3, v: 10 }], ['Ring-Dips', { s: 3, v: 8 }]] },
  { id: 'legs', title: 'Beine', kind: 'strength', steps: [['Kniebeugen Eigengewicht', { s: 3, v: 25 }], ['Bulgarian Split Squats ohne Gewicht', { s: 3, v: 15, side: 1 }],
    ['Shrimp Squats', { s: 3, v: 8, side: 1 }], ['Einbeinige Kniebeugen (Pistol Squats)', { s: 3, v: 8, side: 1 }]] },
  { id: 'core', title: 'Rumpf', kind: 'strength', steps: [['Hollow Body Hold', { s: 3, v: 30, h: 1 }], ['Knieheben hängend', { s: 3, v: 12 }],
    ['Beinheben hängend', { s: 3, v: 10 }], ['Toes to Bar', { s: 3, v: 10 }], ['Dragon Flag', { s: 3, v: 5 }]] },
  { id: 'mu', title: 'Muscle-up', kind: 'skill', steps: [['Dips an der geraden Stange (Straight Bar Dips)', { s: 3, v: 12 }], ['Muscle-ups', { s: 1, v: 1 }],
    ['Muscle-ups', { s: 3, v: 3 }], ['Muscle-ups', { s: 3, v: 5 }]] },
  { id: 'hs', title: 'Handstand', kind: 'skill', steps: [['Pike-Liegestütze', { s: 3, v: 10 }], ['Handstand an der Wand', { s: 3, v: 45, h: 1 }],
    ['Handstand-Liegestütze an der Wand', { s: 3, v: 5 }], ['Freier Handstand', { s: 3, v: 30, h: 1 }]] },
  { id: 'fl', title: 'Front Lever', kind: 'skill', steps: [['Front Lever (Tuck)', { s: 3, v: 15, h: 1 }], ['Front Lever Advanced Tuck', { s: 3, v: 15, h: 1 }],
    ['Front Lever ein Bein', { s: 3, v: 10, h: 1 }], ['Front Lever gegrätscht', { s: 3, v: 10, h: 1 }], ['Front Lever', { s: 3, v: 5, h: 1 }]] },
  { id: 'pl', title: 'Planche', kind: 'skill', steps: [['Planche Lean', { s: 3, v: 30, h: 1 }], ['Planche (Tuck)', { s: 3, v: 15, h: 1 }],
    ['Planche Advanced Tuck', { s: 3, v: 10, h: 1 }], ['Planche gegrätscht', { s: 3, v: 5, h: 1 }]] },
  { id: 'ls', title: 'L-Sit', kind: 'skill', steps: [['Stütz halten', { s: 3, v: 30, h: 1 }], ['Tuck L-Sit', { s: 3, v: 20, h: 1 }],
    ['L-Sit', { s: 3, v: 20, h: 1 }], ['V-Sit', { s: 3, v: 5, h: 1 }]] },
];
const caliLad = id => CALI_LADDERS.find(l => l.id === id) || null;
const CALI_PRIOS = {
  skill: { label: 'Skills', text: 'Je Tag zwei Skill-Blöcke am Anfang, danach die Kraftübungen mit 4–8 Wdh.', range: [4, 8], skills: 2,
    pick: ['pull', 'push', 'legs', 'hs', 'fl', 'mu', 'ls'] },
  strength: { label: 'Kraft und Muskeln', text: 'Höchstens ein kurzer Skill-Block, dann 4–5 Kraftübungen mit 6–12 Wdh.', range: [6, 12], skills: 1,
    pick: ['pull', 'push', 'dip', 'legs', 'core', 'hs'] },
  both: { label: 'Beides', text: 'Ein Skill-Block, dann 4 Kraftübungen mit 5–10 Wdh.', range: [5, 10], skills: 1, pick: ['pull', 'push', 'legs', 'core', 'hs', 'fl'] },
  free: { label: 'Selbst zusammenstellen', text: 'Du wählst die Leitern, die Wiederholungen und wie viele Skills pro Tag.', range: [6, 12], skills: 2,
    pick: ['pull', 'push', 'legs'] },
};
const CALI_RANGES = [[4, 8], [5, 10], [6, 12], [8, 15]];

// Halteübungen: Sekunden statt Wiederholungen (alle Leiter-Stufen mit h, dazu bekannte Halteübungen)
const CALI_HOLD = new Set([...CALI_LADDERS.flatMap(l => l.steps.filter(([, g]) => g.h).map(([n]) => nameKey(n))),
  ...['Plank (Unterarmstütz)', 'Seitstütz', 'Wandsitzen (Wall Sit)', 'Back Lever (Tuck)', 'L-Sit', 'Hollow Body Hold'].map(nameKey)]);
const isHoldName = name => CALI_HOLD.has(nameKey(name || ''));
const holdHead = name => isHoldName(name) ? 'Sek.' : 'Wdh.';
const holdUnit = name => isHoldName(name) ? 's' : 'Wdh.';
const caliGoalText = g => `${g.s > 1 ? `${g.s} × ` : ''}${g.v}${g.h ? ' s' : g.v === 1 && g.s === 1 ? ' sauber' : ''}${g.side ? ' je Seite' : ''}`;
// Stufen, zu denen eine Übung gehört: [[Leiter, Index, Ziel], …]
const caliStagesOf = name => CALI_LADDERS.flatMap(l => l.steps.map(([n, g], i) => nameKey(n) === nameKey(name) ? [l, i, g] : null).filter(Boolean));
// Ziel einer Stufe in diesen Sätzen geschafft?
const caliGoalMet = (sets, g) => (sets || []).filter(x => x && !x.outlier && x.reps != null && Number(x.reps) >= g.v).length >= g.s;

/* ---------- Steigerung beim Trainingsstart ---------- */
const round5 = x => Math.round(x / 5) * 5;
function caliStart(ex, g, range) {
  if (isHoldName(ex.name)) return Math.max(5, Math.min(30, round5(g.v / 2)));
  return Math.max(1, Math.min(g.v, Math.max(range[0], Math.round(g.v / 2))));  // z. B. Ziel 25 → 12, Ziel 8 → unteres Ende
}
// Einträge dieser Übung im Verlauf, neueste zuerst: [{ date, sets, planned }]
function caliHistory(name) {
  const k = nameKey(name), out = [];
  for (const s of sessionsNewestFirst()) {
    const e = s.entries.find(x => nameKey(x.name) === k);
    if (e && (e.sets || []).some(x => x.reps != null)) out.push({ date: s.date, sets: e.sets, planned: e.planned || [] });
  }
  return out;
}
// Satz i eines früheren Trainings: { planned, done } (done = null, wenn der Satz nicht eingetragen wurde)
function caliSetOf(h, i) {
  const j = Math.min(i, h.sets.length - 1), s = h.sets[j] || {};
  const done = s.reps != null && s.reps !== '' && !s.outlier ? Number(s.reps) : null;
  const planned = Number((h.planned[Math.min(i, h.planned.length - 1)] || {}).reps) || Number(s.reps) || 0;
  return { planned, done: done != null && isFinite(done) ? done : null };
}
// Deutlich verfehlt (v232, User 2026-11-13 nach Simulation sim9): mindestens 20 % unter dem Ziel
const CALI_MISS = 0.8;
const caliClearMiss = x => !!x && x.done != null && x.planned > 0 && x.done < x.planned * CALI_MISS - 1e-9;
function caliApply(en, ex) {
  const plan = activePlan();
  if (!ex || !ex.cali || !plan || !plan.cali) return;
  const lad = caliLad(ex.cali.lad), step = lad && lad.steps[ex.cali.step];
  if (!step) return;
  const g = step[1], hold = isHoldName(ex.name), inc = hold ? 5 : 1;
  const range = plan.cali.range || [6, 12];
  const cap = hold ? Math.max(g.v, round5(g.v * 1.5)) : Math.max(g.v, range[1]);
  const hist = caliHistory(ex.name);
  const monday = thisMonday();
  const thisWeek = hist.find(h => h.date.slice(0, 10) >= monday);  // schon diese Woche trainiert: gleiches Ziel, keine Steigerung
  const n = en.sets.length;
  for (let i = 0; i < n; i++) {
    let v;
    if (thisWeek) v = Number((thisWeek.planned[Math.min(i, thisWeek.planned.length - 1)] || {}).reps) || null;
    else if (hist.length) {
      const a = caliSetOf(hist[0], i), b = hist[1] ? caliSetOf(hist[1], i) : null;
      v = a.done >= a.planned ? Math.min(cap, a.planned + inc) : a.planned;
      // v232: zweimal hintereinander deutlich verfehlt → das Beste der beiden Trainings wird das neue Ziel (nie höher als bisher)
      if (caliClearMiss(a) && caliClearMiss(b)) {
        const best = Math.max(a.done, b.done);
        v = Math.min(a.planned, hold ? Math.max(5, Math.floor(best / 5) * 5) : Math.max(1, best));
      }
    }
    if (!v) v = caliStart(ex, g, range);
    en.sets[i] = { ...en.sets[i], weight: '', reps: String(v) };
    en.planned[i] = { weight: null, reps: v, variant: (en.planned[i] || {}).variant || '' };
  }
  en.caliInfo = { lad: lad.id, step: ex.cali.step, goal: g, hold };
  en.target = { ...en.target, reps: Math.max(...en.planned.map(x => x.reps)) };
}
// Zeile „Heute“ im Training
function caliTargetHtml(en) {
  const c = en.caliInfo, lad = caliLad(c.lad), pr = en.planned.map(x => x.reps);
  const today = Math.min(...pr) === Math.max(...pr) ? pr[0] : `${Math.max(...pr)}–${Math.min(...pr)}`;
  // v265: ohne „Heute: …“ (steht in den Feldern), nur das Stufenziel
  void today;
  return `<p class="target-note">Stufenziel: ${caliGoalText(c.goal)}</p>
    <p class="hint cali-tr">${esc(lad.title)}-Leiter | Stufe ${c.step + 1} von ${lad.steps.length}</p>`;
}

/* ---------- Stufenwechsel (nur nach Rückfrage) ---------- */
// Übungen des aktiven Calisthenics-Plans, deren Stufenziel in 2 Trainings geschafft ist und für die es eine nächste Stufe gibt
function caliReady() {
  const plan = activePlan();
  if (!caliOn() || !plan || !plan.cali) return [];
  const seen = new Set(), out = [];
  for (const d of plan.days) for (const ex of d.exercises) {
    if (!ex.cali) continue;
    const key = ex.cali.lad + ':' + ex.cali.step;
    if (seen.has(key)) continue;
    seen.add(key);
    const lad = caliLad(ex.cali.lad), step = lad && lad.steps[ex.cali.step], next = lad && lad.steps[ex.cali.step + 1];
    if (!next) continue;
    const snooze = (data.caliSnooze || {})[key];
    if (snooze && snooze > todayISO()) continue;
    const met = caliHistory(ex.name).filter(h => caliGoalMet(h.sets, step[1])).length;
    if (met >= 2) out.push({ lad, step: ex.cali.step, from: step[0], to: next[0], goal: step[1], nextGoal: next[1], key });
  }
  return out;
}
function caliUpCards() {
  return caliReady().map(r => `<div class="card cali-up">
      <p class="hx-kicker">${esc(r.lad.title)}-Leiter</p>
      <h2>Bereit für die nächste Stufe?</h2>
      <p>Du hast <b>${esc(r.from)}</b> zweimal mit ${caliGoalText(r.goal)} geschafft. Nächste Stufe: <b>${esc(r.to)}</b> (Ziel ${caliGoalText(r.nextGoal)}).</p>
      <div class="row"><button class="btn" data-action="cali-later" data-k="${r.key}">Später</button>
        <button class="btn primary" data-action="cali-up" data-k="${r.key}">Weiter zur nächsten Stufe</button></div>
    </div>`).join('');
}

/* ---------- Plan erstellen ---------- */
let caliForm = null;
function caliFormInit(prio = 'both') {
  const p = CALI_PRIOS[prio];
  caliForm = { prio, days: 3, range: [...p.range], skills: p.skills, pick: new Set(p.pick), lv: (caliForm && caliForm.lv) || {} };
}
// Stand je Leiter aus dem Verlauf schätzen: höchste geschaffte Stufe + 1 (sonst 0)
function caliLevelFromHistory(lad) {
  let lv = 0;
  lad.steps.forEach(([n, g], i) => { if (caliHistory(n).some(h => caliGoalMet(h.sets, g))) lv = Math.max(lv, Math.min(i + 1, lad.steps.length - 1)); });
  return lv;
}
function caliBuildDays(f) {
  const chosen = CALI_LADDERS.filter(l => f.pick.has(l.id));
  const skills = chosen.filter(l => l.kind === 'skill'), strength = chosen.filter(l => l.kind === 'strength');
  const mk = (lad, sets) => {
    const step = f.lv[lad.id] != null ? f.lv[lad.id] : caliLevelFromHistory(lad);
    const [name, g] = lad.steps[step];
    const ex = withDefaults({ id: uid(), name, sets, setsEnd: sets, cali: { lad: lad.id, step } });
    ex.reps = caliStart(ex, g, f.range);
    return ex;
  };
  const days = [];
  for (let d = 0; d < f.days; d++) {
    const ex = [];
    // Skills reihum verteilen (je Tag f.skills Stück), frisch am Anfang
    for (let k = 0; k < Math.min(f.skills, skills.length); k++) ex.push(mk(skills[(d * f.skills + k) % skills.length], 3));
    for (const l of strength) ex.push(mk(l, 3));
    // gleiche Übung zweimal am Tag (z. B. Dips in Muscle-up- und Dips-Leiter) nur einmal
    const uniq = ex.filter((e, i) => ex.findIndex(x => nameKey(x.name) === nameKey(e.name)) === i);
    days.push({ id: uid(), name: `Ganzkörper ${'ABCD'[d]}`, intensity: '', exercises: uniq });
  }
  return days;
}
function renderCali() {
  const plan = activePlan();
  const has = plan && plan.cali;
  if (!caliForm) caliFormInit(has ? plan.cali.prio : 'both');
  const f = caliForm;
  const chip = (act, k, label, on) => `<button class="vchip ${on ? 'on' : ''}" data-action="${act}" data-k="${k}">${label}</button>`;
  const ladRow = l => {
    const on = f.pick.has(l.id), lv = f.lv[l.id] != null ? f.lv[l.id] : caliLevelFromHistory(l);
    return `<div class="cali-pick ${on ? 'on' : ''}">
      <button class="cali-pick-head" data-action="cali-lad" data-k="${l.id}"><span class="cali-check">${on ? '✓' : ''}</span><b>${esc(l.title)}</b></button>
      ${on ? `<label class="row cali-lv"><span>Wo stehst du?</span><select class="inp sel" data-field="cali-lv" data-k="${l.id}">
        ${l.steps.map(([n, g], i) => `<option value="${i}" ${i === lv ? 'selected' : ''}>${i + 1}. ${esc(n)} (Ziel ${caliGoalText(g)})</option>`).join('')}</select></label>` : ''}
    </div>`;
  };
  return `${has ? `<div class="card"><h2>Dein Calisthenics-Plan</h2><p>„${esc(plan.name)}“ ist aktiv | Schwerpunkt <b>${CALI_PRIOS[plan.cali.prio].label}</b> |
      ${plan.days.length} Tage pro Woche.</p>
      <div class="row"><button class="btn" data-action="tab" data-tab="plan">Zum Plan</button><button class="btn primary" data-action="cali-skills">Skill-Stufen</button></div></div>
      <h2>Neuen Calisthenics-Plan erstellen</h2>` : ''}
    <div class="card"><h2>Was ist dir wichtiger?</h2>
      <div class="variants">${Object.entries(CALI_PRIOS).map(([k, p]) => chip('cali-prio', k, p.label, f.prio === k)).join('')}</div>
      <p class="hint">${esc(CALI_PRIOS[f.prio].text)}</p>
      ${f.prio === 'free' ? `<p class="lbl">Wiederholungen</p><div class="variants">${CALI_RANGES.map(r => chip('cali-range', r.join('-'), `${r[0]}–${r[1]}`, f.range.join('-') === r.join('-'))).join('')}</div>
        <p class="lbl">Skills pro Tag</p><div class="variants">${[0, 1, 2, 3].map(n => chip('cali-skn', n, String(n), f.skills === n)).join('')}</div>` : ''}
      <p class="lbl">Tage pro Woche</p><div class="variants">${[2, 3, 4].map(n => chip('cali-days', n, String(n), f.days === n)).join('')}</div>
    </div>
    <div class="card"><h2>Kraft</h2><p class="hint">Diese Leitern kommen an jedem Tag dran (Ganzkörper).</p>${CALI_LADDERS.filter(l => l.kind === 'strength').map(ladRow).join('')}</div>
    <div class="card"><h2>Skills</h2><p class="hint">Werden reihum auf die Tage verteilt, immer am Anfang, wenn du frisch bist.</p>${CALI_LADDERS.filter(l => l.kind === 'skill').map(ladRow).join('')}</div>
    <div class="card cali-rules"><h2>So steigert die App</h2><ul>
      <li>Wiederholungen: +1 je Satz pro Woche, bis das Stufenziel bzw. das obere Ende erreicht ist.</li>
      <li>Haltezeiten: +5 Sekunden je Satz pro Woche.</li>
      <li>Nicht geschafft? Dann bleibt das Ziel gleich.</li>
      <li>Stufenziel zweimal geschafft: Die App fragt, ob du zur nächsten Stufe wechseln willst, nur mit deinem Okay.</li></ul></div>
    <button class="btn primary" data-action="cali-create">Plan erstellen</button>`;
}

/* ---------- Skill-Seite ---------- */
function caliCurrent(lad) {
  const plan = activePlan();
  if (plan && plan.cali) for (const d of plan.days) for (const ex of d.exercises) if (ex.cali && ex.cali.lad === lad.id) return ex.cali.step;
  return caliLevelFromHistory(lad);
}
function renderCaliSkills() {
  return `<p class="hint explain">Jede Leiter führt Stufe für Stufe zum Skill. Ist das Ziel einer Stufe zweimal geschafft, fragt die App, ob du weitergehen willst.
      Antippen öffnet die Übung in der Bibliothek.</p>
    ${CALI_LADDERS.map(l => {
      const cur = caliCurrent(l);
      return `<div class="card cali-lad"><h2>${esc(l.title)} <small class="hint">Stufe ${cur + 1} von ${l.steps.length}</small></h2>
        <div class="cali-steps">${l.steps.map(([n, g], i) => {
          const st = i < cur ? 'done' : i === cur ? 'now' : 'next';
          const last = i === cur ? caliHistory(n)[0] : null;
          const lastTxt = last ? last.sets.filter(x => x.reps != null).map(x => x.reps).join(' / ') + (g.h ? ' s' : '') : '';
          const inner = `<span class="cali-dot">${i < cur ? '✓' : i + 1}</span><span class="cali-stxt">${esc(n)}<small>Ziel: ${caliGoalText(g)}${lastTxt ? ` | zuletzt <b>${lastTxt}</b>` : ''}</small></span>`;
          return libEntry(n) ? `<button class="cali-step ${st}" data-action="lib-open" data-name="${esc(n)}">${inner}</button>` : `<div class="cali-step ${st}">${inner}</div>`;
        }).join('')}</div></div>`;
    }).join('')}`;
}

/* ---------- Erfolge (charts.js) ---------- */
// Ein Erfolg je tatsächlich geschaffter Stufe (keine übersprungenen Stufen); die letzte Stufe = Leiter komplett
function caliStageSeries(lad, i) {
  const [nm, g] = lad.steps[i], last = i === lad.steps.length - 1, key = lad.id + ':' + i;
  return {
    id: 'cl-' + lad.id + '-' + i, cat: 'Calisthenics', goals: [1],
    names: [last ? `${lad.title}-Leiter komplett` : `${shortName(nm)}: ${caliGoalText(g)}`], icons: [last ? '👑' : '🤸'],
    name: () => `${lad.title}: Stufe ${i + 1}`,
    desc: () => `${lad.title}-Leiter, Stufe ${i + 1} von ${lad.steps.length}: ${nm}, ${caliGoalText(g)} geschafft${last ? '. Die ganze Leiter.' : ''}`,
    value: c => (c.caliMet || {})[key] || 0, fmt: v => v ? 'geschafft' : 'offen',
  };
}

views.cali = { title: 'Calisthenics', tab: 'plan', back: p => [p.from === 'wizard' ? 'wizard' : 'plan', {}], render: renderCali };
views.caliskills = { title: 'Skill-Stufen', tab: 'plan', back: p => ['cali', { from: p.from }], render: renderCaliSkills };

Object.assign(actions, {
  'cali-open': el => { caliForm = null; go('cali', { from: el.dataset.from || 'plan' }); },
  'cali-skills': () => go('caliskills', { from: current.params.from }),
  'cali-skills-plan': () => go('caliskills', { from: 'plan' }),  // v240: aus dem Plan-Reiter, wenn ein Calisthenics-Plan aktiv ist
  'cali-prio': el => { const lv = caliForm.lv, days = caliForm.days; caliFormInit(el.dataset.k); Object.assign(caliForm, { lv, days }); render(); },
  'cali-range': el => { caliForm.range = el.dataset.k.split('-').map(Number); render(); },
  'cali-skn': el => { caliForm.skills = Number(el.dataset.k); render(); },
  'cali-days': el => { caliForm.days = Number(el.dataset.k); render(); },
  'cali-lad': el => {
    const k = el.dataset.k;
    if (caliForm.pick.has(k)) caliForm.pick.delete(k); else caliForm.pick.add(k);
    // Leitern selbst ändern = selbst zusammenstellen (Wdh. und Skills des bisherigen Schwerpunkts bleiben)
    const preset = CALI_PRIOS[caliForm.prio].pick;
    if (caliForm.prio !== 'free' && (preset.length !== caliForm.pick.size || !preset.every(x => caliForm.pick.has(x)))) caliForm.prio = 'free';
    render();
  },
  'cali-create': () => {
    const f = caliForm;
    const days = caliBuildDays(f);
    if (!days.some(d => d.exercises.length)) { alert('Bitte wähle mindestens eine Leiter aus (bei nur Skills: mindestens 1 Skill pro Tag).'); return; }
    if (draft && !askOk(`Es läuft noch ein Training (${draft.dayName}). Trotzdem den neuen Plan aktiv setzen?`)) return;
    const plan = newPlan(`Calisthenics (${CALI_PRIOS[f.prio].label})`, days);
    Object.assign(plan, { own: true, progression: { volume: false, load: false }, cali: { prio: f.prio, range: [...f.range], skills: f.skills }, equip: 'cali' });
    data.plans.push(plan);
    data.activePlanId = plan.id;
    setRound(newCycleId(), 1, 1);
    saveData();
    caliForm = null;
    toast(`„${plan.name}“ erstellt und aktiv ✔`);
    go('plan');
  },
  'cali-up': el => {
    const [ladId, st] = el.dataset.k.split(':'), lad = caliLad(ladId), step = Number(st), next = lad && lad.steps[step + 1];
    if (!next) return;
    const plan = activePlan();
    for (const d of plan.days) for (const ex of d.exercises) {
      if (!ex.cali || ex.cali.lad !== ladId || ex.cali.step !== step) continue;
      Object.assign(ex, { name: next[0], kind: null, group: null, cali: { lad: ladId, step: step + 1 } });
      ex.reps = caliStart(ex, next[1], plan.cali.range || [6, 12]);
    }
    saveData();
    toast(`Neue Stufe: ${next[0]} ✔`);
    render();
  },
  'cali-later': el => { data.caliSnooze = { ...(data.caliSnooze || {}), [el.dataset.k]: addDaysISO(todayISO(), 14) }; saveData(); render(); },
});
Object.assign(fields, {
  'cali-lv': el => { caliForm.lv[el.dataset.k] = Number(el.value); },
});
