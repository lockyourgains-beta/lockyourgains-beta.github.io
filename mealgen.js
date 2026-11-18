/* LockYourGains | © 2026 Alex Hundt | Alle Rechte vorbehalten – siehe LICENSE */
/* ---------- Ernährungsplan erstellen lassen (v337, erste Version) ----------
   Gerichte aus der Grundliste (FOOD_BASE, Schlüssel 'b:' + Name). Die App wählt je Wochentag und Mahlzeit ein Gericht und
   rechnet die Mengen an jedem Tag aus dem aktuellen Tagesziel (Kalorien, Eiweiß, Kohlenhydrate, Fett). Ändert sich das Ziel,
   passen sich die Mengen von selbst an.
   data.mealPlan = { created, picks: { 0–6 (Mo = 0): { Mahlzeit: Rezept-ID } } }
   Anders als beim importierten Plan (data.nutPlan) bleibt das Tagesziel das der App; der Plan schlägt nur vor, was man isst. */

// Zutat: [Name in der Grundliste, Menge in g, Rolle, Stückgewicht (0 = keins), Höchstmenge in g]
// Rolle: P = Eiweißquelle, C = Kohlenhydrate, F = Fett (diese Mengen passt die App an), X = Gemüse, Obst, Soße (bleibt fast gleich)
const MG_OIL = 'Speiseöl (Olivenöl, Rapsöl, Sonnenblumenöl)';
const MG_RECIPES = [
  // Frühstück
  { id: 'oats', cat: 'b', name: 'Overnight Oats mit Skyr und Beeren', how: 'Am Abend alles verrühren und über Nacht in den Kühlschrank stellen.',
    items: [['Haferflocken', 60, 'C', 0, 130], ['Skyr natur', 150, 'P'], ['Milch 1,5 %', 100, 'X'], ['Heidelbeeren', 80, 'X'], ['Chiasamen', 10, 'F']] },
  { id: 'pancakes', cat: 'b', name: 'Protein-Pancakes mit Beeren', how: 'Alles außer den Beeren pürieren, in wenig Öl kleine Pancakes ausbacken und mit den Beeren essen.',
    items: [['Haferflocken', 50, 'C'], ['Banane', 60, 'C'], ['Eiklar', 100, 'P'], ['Proteinpulver (Whey)', 15, 'P'], ['Ei', 60, 'F', 60], ['Heidelbeeren', 60, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'scramble', cat: 'b', name: 'Rührei mit Vollkornbrot', how: 'Eier und Eiklar verquirlen und in wenig Öl stocken lassen. Mit Brot und Tomate essen.',
    items: [['Ei', 120, 'P', 60], ['Eiklar', 60, 'P'], ['Vollkornbrot', 80, 'C', 0, 200], ['Tomate', 100, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'skyrbowl', cat: 'b', name: 'Skyr-Bowl mit Müsli und Banane', how: 'Skyr in eine Schüssel geben, Müsli, Banane und Walnüsse darauf und mit Honig süßen.',
    items: [['Skyr natur', 250, 'P'], ['Müsli, ohne Zuckerzusatz', 50, 'C'], ['Banane', 80, 'C'], ['Walnüsse', 15, 'F'], ['Honig', 10, 'X']] },
  { id: 'quarkbread', cat: 'b', name: 'Vollkornbrot mit Quark und Schinken', how: 'Brot mit Frischkäse und Quark bestreichen, mit Schinken und Gurke belegen.',
    items: [['Vollkornbrot', 100, 'C', 0, 200], ['Magerquark', 120, 'P'], ['Kochschinken', 40, 'P'], ['Frischkäse leicht', 20, 'F'], ['Gurke', 80, 'X']] },
  { id: 'porridge', cat: 'b', name: 'Protein-Porridge mit Erdnussbutter', how: 'Haferflocken in der Milch aufkochen, vom Herd nehmen und das Proteinpulver einrühren. Mit Banane und Erdnussbutter essen.',
    items: [['Haferflocken', 70, 'C', 0, 130], ['Banane', 60, 'C'], ['Milch 1,5 %', 250, 'X'], ['Proteinpulver (Whey)', 20, 'P'], ['Erdnussbutter', 15, 'F']] },
  // Haupt­mahlzeiten
  { id: 'chickenrice', cat: 'm', name: 'Hähnchen mit Reis und Brokkoli', how: 'Reis kochen. Hähnchen in Stücken in Öl braten, Brokkoli dämpfen oder mitbraten.',
    items: [['Hähnchenbrust, roh', 170, 'P'], ['Reis, roh', 80, 'C', 0, 170], ['Brokkoli', 200, 'X'], [MG_OIL, 8, 'F']] },
  { id: 'chili', cat: 'm', name: 'Chili con Carne mit Reis', how: 'Zwiebel und Hack in Öl anbraten, Paprika, Tomaten, Bohnen und Mais dazugeben und 15 Minuten köcheln lassen. Mit Reis essen.',
    items: [['Rinderhackfleisch mager (5 % Fett), roh', 150, 'P'], ['Kidneybohnen (Dose, abgetropft)', 100, 'C'], ['Reis, roh', 60, 'C'], ['Passierte Tomaten (Passata)', 200, 'X'],
      ['Paprika', 100, 'X'], ['Zwiebel', 50, 'X'], ['Mais (Dose, abgetropft)', 50, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'salmon', cat: 'm', name: 'Lachs mit Süßkartoffel und grünen Bohnen', how: 'Süßkartoffel in Spalten mit Öl im Ofen backen (200 °C, etwa 25 Minuten), den Lachs die letzten 12 Minuten dazulegen. Bohnen kochen.',
    items: [['Lachs, roh', 140, 'P'], ['Süßkartoffel', 300, 'C', 0, 500], ['Grüne Bohnen', 150, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'bolognese', cat: 'm', name: 'Spaghetti Bolognese mit magerem Hack', how: 'Zwiebel, Karotte und Hack in Öl anbraten, Tomaten dazugeben und köcheln lassen. Mit Nudeln und Parmesan essen.',
    items: [['Nudeln, roh', 90, 'C', 0, 170], ['Rinderhackfleisch mager (5 % Fett), roh', 150, 'P'], ['Passierte Tomaten (Passata)', 200, 'X'], ['Zwiebel', 50, 'X'],
      ['Karotte (Möhre)', 60, 'X'], ['Parmesan', 10, 'F'], [MG_OIL, 5, 'F']] },
  { id: 'wrap', cat: 'm', name: 'Puten-Wraps mit Joghurtsoße', how: 'Pute in Streifen braten und mit Gemüse und Joghurt in die Wraps rollen.',
    items: [['Wrap (Weizentortilla)', 120, 'C', 60], ['Putenbrust, roh', 150, 'P'], ['Paprika', 80, 'X'], ['Blattsalat (Kopfsalat, Eisberg, Feldsalat)', 40, 'X'],
      ['Tomate', 60, 'X'], ['Joghurt natur 1,5 %', 60, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'tunapasta', cat: 'm', name: 'Thunfisch-Nudelsalat', how: 'Nudeln kochen und abkühlen lassen, mit Thunfisch, Gemüse, Joghurt und Öl mischen.',
    items: [['Vollkornnudeln, roh', 80, 'C', 0, 170], ['Thunfisch im eigenen Saft (abgetropft)', 130, 'P'], ['Mais (Dose, abgetropft)', 60, 'X'], ['Tomate', 100, 'X'],
      ['Gurke', 100, 'X'], ['Joghurt natur 1,5 %', 60, 'X'], [MG_OIL, 8, 'F']] },
  { id: 'steak', cat: 'm', name: 'Steak mit Kartoffeln und Champignons', how: 'Steak von jeder Seite 2 bis 3 Minuten in Öl braten und kurz ruhen lassen. Champignons in der Pfanne braten, dazu Kartoffeln.',
    items: [['Rindersteak (Hüfte, Rumpsteak), roh', 180, 'P'], ['Kartoffeln, gekocht', 300, 'C', 0, 500], ['Champignons', 150, 'X'], [MG_OIL, 8, 'F']] },
  { id: 'tofucurry', cat: 'm', name: 'Tofu-Gemüse-Pfanne mit Reis', how: 'Tofu würfeln und in Öl knusprig braten, Gemüse dazugeben und mit Sojasoße abschmecken. Mit Reis essen.',
    items: [['Tofu natur', 200, 'P'], ['Reis, roh', 75, 'C', 0, 170], ['Gemüsemischung (TK)', 250, 'X'], ['Sojasoße', 15, 'X'], [MG_OIL, 8, 'F']] },
  { id: 'bowl', cat: 'm', name: 'Hähnchen-Quinoa-Bowl mit Feta', how: 'Quinoa kochen, Hähnchen braten und mit Kichererbsen, Gurke, Tomate und Feta in einer Schüssel anrichten.',
    items: [['Hähnchenbrust, roh', 150, 'P'], ['Quinoa, roh', 60, 'C'], ['Kichererbsen (Dose, abgetropft)', 80, 'C'], ['Gurke', 100, 'X'], ['Tomate', 100, 'X'], ['Feta (Schafskäse)', 30, 'F']] },
  { id: 'pollock', cat: 'm', name: 'Seelachs mit Kartoffeln und Rahmspinat', how: 'Seelachs in Öl braten. Spinat dünsten und mit saurer Sahne verrühren, dazu Kartoffeln.',
    items: [['Seelachs, roh', 200, 'P'], ['Kartoffeln, gekocht', 300, 'C', 0, 500], ['Spinat', 200, 'X'], ['Saure Sahne 10 %', 40, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'pesto', cat: 'm', name: 'Pesto-Nudeln mit Hähnchen und Zucchini', how: 'Nudeln kochen, Hähnchen und Zucchini braten, Tomaten dazugeben und alles mit Pesto mischen.',
    items: [['Nudeln, roh', 80, 'C', 0, 170], ['Hähnchenbrust, roh', 150, 'P'], ['Zucchini', 150, 'X'], ['Tomate', 80, 'X'], ['Pesto (Basilikum)', 20, 'F']] },
  // Snacks
  { id: 'quarkberry', cat: 's', name: 'Magerquark mit Himbeeren', how: 'Quark glatt rühren, Beeren und Mandeln darauf geben und mit Honig süßen.',
    items: [['Magerquark', 200, 'P'], ['Himbeeren', 100, 'X'], ['Honig', 10, 'C'], ['Mandeln', 10, 'F']] },
  { id: 'shake', cat: 's', name: 'Proteinshake mit Banane', how: 'Alles im Mixer oder Shaker mischen.',
    items: [['Proteinpulver (Whey)', 30, 'P'], ['Milch 1,5 %', 300, 'X'], ['Banane', 100, 'C']] },
  { id: 'ricecakes', cat: 's', name: 'Reiswaffeln mit Hüttenkäse', how: 'Reiswaffeln mit Hüttenkäse und Tomatenscheiben belegen.',
    items: [['Reiswaffel', 32, 'C', 8], ['Hüttenkäse (körniger Frischkäse)', 150, 'P'], ['Tomate', 80, 'X']] },
  { id: 'pudding', cat: 's', name: 'Proteinpudding mit Apfel und Mandeln', how: 'Apfel in Stücke schneiden und mit Pudding und Mandeln essen.',
    items: [['Proteinpudding', 200, 'P'], ['Apfel', 150, 'C'], ['Mandeln', 15, 'F']] },
  { id: 'cottagebread', cat: 's', name: 'Vollkornbrot mit Hüttenkäse', how: 'Brot mit Hüttenkäse belegen, Gurke dazu.',
    items: [['Vollkornbrot', 60, 'C'], ['Hüttenkäse (körniger Frischkäse)', 100, 'P'], ['Gurke', 60, 'X']] },
];
// Ergänzungen, falls die Gerichte das Tagesziel nicht erreichen (z. B. sehr hohe Kalorien): [Name, Grundmenge, Rolle, Stück, Höchstmenge]
const MG_FILL = [['Banane', 100, 'C', 0, 250], ['Reiswaffel', 16, 'C', 8, 64], ['Mandeln', 10, 'F', 0, 30]];
const MG_BY_ID = new Map(MG_RECIPES.map(r => [r.id, r]));
const MG_SHARE = { b: 0.25, m: 0.35, s: 0.12 };
const MG_BOUNDS = { P: [0.6, 3], C: [0.3, 3.5], F: [0, 4] };
const MG_CAT_NAME = { b: 'Frühstück', m: 'Hauptmahlzeit', s: 'Snack' };

const mgCat = k => k === 'b' ? 'b' : ['s', 's1', 'late'].includes(k) ? 's' : 'm';
const mgActive = () => !!(data.mealPlan && data.mealPlan.picks) && !(typeof nutPlanActive === 'function' && nutPlanActive());
const mgWd = date => (new Date(date + 'T12:00:00').getDay() + 6) % 7;  // Mo = 0
const mgFood = name => FOOD_BASE_MAP.get('b:' + name);
let mgDraft = null;     // Vorschlag, noch nicht übernommen: { picks }
let mgSel = null;       // ausgewählter Tag in der Ansicht (Datum)
const mgPicks = () => (mgDraft || data.mealPlan || {}).picks || null;

function mgShuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

// Gerichte für alle 7 Wochentage: aufeinanderfolgende Tage und Mahlzeiten am selben Tag möglichst verschieden
function mgMakePicks() {
  const keys = mealKeys(), lists = {}, pos = {};
  for (const c of ['b', 'm', 's']) { lists[c] = mgShuffle(MG_RECIPES.filter(r => r.cat === c).map(r => r.id)); pos[c] = 0; }
  const picks = {};
  for (let wd = 0; wd < 7; wd++) {
    picks[wd] = {};
    for (const k of keys) { const c = mgCat(k); picks[wd][k] = lists[c][pos[c]++ % lists[c].length]; }
  }
  return picks;
}

// Gericht an einem Wochentag; fehlt eins (z. B. nach Änderung der Mahlzeiten), nimmt die App eins der Reihe nach
function mgPick(picks, wd, k) {
  const id = picks[wd] && picks[wd][k];
  if (id && MG_BY_ID.has(id) && MG_BY_ID.get(id).cat === mgCat(k)) return MG_BY_ID.get(id);
  const list = MG_RECIPES.filter(r => r.cat === mgCat(k));
  return list[(wd * 3 + mealKeys().indexOf(k)) % list.length];
}

// Nährwerte einer Zutat bei g Gramm: [kcal, p, c, f]
const mgVal = (name, g) => { const f = mgFood(name); return f ? f.per.slice(0, 4).map(v => (v || 0) * g / 100) : [0, 0, 0, 0]; };
const mgKcalOf = r => r.items.reduce((s, [n, g]) => s + mgVal(n, g)[0], 0);

/* Mengen für einen Tag: Für jede Mahlzeit und Rolle (P, C, F) ein Faktor auf die Grundmenge. Gesucht sind Faktoren, mit denen
   der Tag Kalorien und Eiweiß möglichst genau trifft (Kohlenhydrate und Fett etwas weniger streng) und jede Mahlzeit grob
   ihren Anteil bekommt. Gelöst als kleines Ausgleichsproblem mit Grenzen (Koordinatenabstieg). */
function mgSolve(slots, T) {
  const rows = [];  // { t: Zielwert, w: Gewicht, a: Map(var → Beitrag), b: fester Beitrag }
  const tg = [T.kcal, T.protein, T.carbs, T.fat];
  const vars = [];
  const day = [0, 1, 2, 3].map(i => ({ t: Math.max(tg[i], 10), w: [10, 6, 1, 1][i], a: new Map(), b: 0 }));
  const shareSum = slots.reduce((s, x) => s + MG_SHARE[mgCat(x.k)], 0);
  slots.forEach((sl, si) => {
    const want = T.kcal * MG_SHARE[mgCat(sl.k)] / shareSum;
    sl.want = want;
    sl.xs = Math.min(1.6, Math.max(0.7, want / Math.max(1, mgKcalOf(sl.r))));  // Gemüse und Obst wachsen etwas mit
    const meal = { t: Math.max(want, 50), w: 0.6, a: new Map(), b: 0 };
    for (const role of ['P', 'C', 'F']) {
      const its = sl.r.items.filter(i => i[2] === role);
      if (!its.length) continue;
      const v = [0, 0, 0, 0];
      its.forEach(([n, g]) => mgVal(n, g).forEach((x, i) => { v[i] += x; }));
      const j = vars.length;
      const z = Math.min(MG_BOUNDS[role][1], Math.max(MG_BOUNDS[role][0], want / Math.max(1, mgKcalOf(sl.r))));  // Größe der ganzen Mahlzeit
      const hi = Math.min(MG_BOUNDS[role][1], ...its.map(i => i[4] ? i[4] / i[1] : Infinity));  // z. B. höchstens 500 g Kartoffeln
      vars.push({ si, role, s: Math.min(z, hi), z: Math.min(z, hi), lo: Math.min(MG_BOUNDS[role][0], hi), hi });
      v.forEach((x, i) => day[i].a.set(j, x));
      meal.a.set(j, v[0]);
    }
    const fix = [0, 0, 0, 0];
    sl.r.items.filter(i => i[2] === 'X').forEach(([n, g]) => mgVal(n, g * sl.xs).forEach((x, i) => { fix[i] += x; }));
    fix.forEach((x, i) => { day[i].b += x; });
    meal.b = fix[0];
    rows.push(meal);
  });
  // Ergänzungen beim Snack (sonst bei der letzten Mahlzeit), nur wenn die Gerichte allein das Ziel nicht erreichen
  const fillSi = Math.max(0, slots.map(x => mgCat(x.k)).lastIndexOf('s')) || slots.length - 1;
  MG_FILL.forEach(([n, g0, , , max], fi) => {
    const j = vars.length;
    vars.push({ si: fillSi, role: 'E' + fi, s: 0, z: 0, lo: 0, hi: max / g0, lam: 0.004 });
    mgVal(n, g0).forEach((x, i) => day[i].a.set(j, x));
  });
  rows.push(...day);
  // relativ zum Ziel rechnen, damit kcal und Gramm vergleichbar sind
  const R = rows.map(r => ({ w: r.w, a: new Map([...r.a].map(([j, x]) => [j, x / r.t])), b: r.b / r.t }));
  const res = R.map(r => r.b + [...r.a].reduce((s, [j, x]) => s + x * vars[j].s, 0) - 1);
  const lam = 0.05;  // hält das Verhältnis der Zutaten nahe am Rezept
  for (let it = 0; it < 300; it++) {
    for (let j = 0; j < vars.length; j++) {
      const l = vars[j].lam || lam;
      let num = l * vars[j].z, den = l;  // zieht zur gleichmäßigen Vergrößerung des ganzen Gerichts (Ergänzungen: zu null)
      R.forEach((r, i) => { const a = r.a.get(j); if (!a) return; num += r.w * a * (a * vars[j].s - res[i]); den += r.w * a * a; });
      const s = Math.min(vars[j].hi, Math.max(vars[j].lo, num / den)), d = s - vars[j].s;
      if (!d) continue;
      R.forEach((r, i) => { const a = r.a.get(j); if (a) res[i] += a * d; });
      vars[j].s = s;
    }
  }
  return slots.map((sl, si) => {
    const f = {};
    vars.filter(v => v.si === si).forEach(v => { f[v.role] = v.s; });
    return { ...sl, f };
  });
}

// Menge runden: unter 20 g aufs Gramm, bis 100 g auf 5 g, darüber auf 10 g; Stückware (Eier, Wraps) auf ganze Stück
function mgRound(g, unit) {
  if (unit) return Math.max(1, Math.round(g / unit)) * unit;
  return g < 20 ? Math.round(g) : g < 100 ? Math.round(g / 5) * 5 : Math.round(g / 10) * 10;
}

const mgCache = new Map();
// Plan eines Tages im Format von nutPlanDay (meals: { k: [{ key, name, g, kcal, p, c, f }] }) plus Gerichte und Summen
function mgDay(date = todayISO(), picks = mgPicks()) {
  if (!picks || typeof foodGoal !== 'function') return null;
  const goal = foodGoal(date);
  if (!goal || !goal.kcal) return null;
  const wd = mgWd(date), keys = mealKeys();
  const sig = JSON.stringify([wd, keys, keys.map(k => mgPick(picks, wd, k).id), goal.kcal, goal.protein, goal.carbs, goal.fat, unitLb()]);
  if (mgCache.has(sig)) return mgCache.get(sig);
  const solved = mgSolve(keys.map(k => ({ k, r: mgPick(picks, wd, k) })), goal);
  const meals = {}, recipes = {}, tot = [0, 0, 0, 0];
  for (const sl of solved) {
    recipes[sl.k] = sl.r;
    meals[sl.k] = sl.r.items.map(([name, g0, role, unit]) => {
      const g = mgRound(g0 * (role === 'X' ? sl.xs : sl.f[role] != null ? sl.f[role] : 1), unit);
      const v = mgVal(name, g);
      v.forEach((x, i) => { tot[i] += x; });
      return { key: 'b:' + name, name, g, unit: unit || null, kcal: Math.round(v[0]), p: round1(v[1]), c: round1(v[2]), f: round1(v[3]) };
    }).filter(i => i.g >= 2);
    MG_FILL.forEach(([name, g0, , unit], fi) => {
      const s = sl.f['E' + fi];
      if (!(s > 0) || g0 * s < (unit || 15)) return;  // Kleinstmengen weglassen
      const g = mgRound(g0 * s, unit), v = mgVal(name, g);
      v.forEach((x, i) => { tot[i] += x; });
      const has = meals[sl.k].find(i => i.name === name);  // steckt schon im Gericht: Menge dort erhöhen
      if (has) { const w = mgVal(name, has.g + g); Object.assign(has, { g: has.g + g, kcal: Math.round(w[0]), p: round1(w[1]), c: round1(w[2]), f: round1(w[3]) }); return; }
      meals[sl.k].push({ key: 'b:' + name, name, g, unit: unit || null, extra: true, kcal: Math.round(v[0]), p: round1(v[1]), c: round1(v[2]), f: round1(v[3]) });
    });
  }
  const out = { label: 'Ernährungsplan', meals, recipes, goal, kcal: Math.round(tot[0]), p: Math.round(tot[1]), c: Math.round(tot[2]), f: Math.round(tot[3]) };
  if (mgCache.size > 60) mgCache.clear();
  mgCache.set(sig, out);
  return out;
}

/* ----- Ansicht ----- */

function mgDays(start = todayISO()) { return Array.from({ length: 7 }, (_, i) => addDaysISO(start, i)); }
const mgDayShort = d => d === todayISO() ? 'Heute' : new Date(d + 'T12:00:00').toLocaleDateString(LOCALE(), { weekday: 'short' }).replace('.', '');

function renderMealPlan() {
  const goal = typeof foodGoal === 'function' ? foodGoal(todayISO()) : null;
  if (!goal) {
    return `<div class="card"><h2>🍽️ Ernährungsplan</h2>
      <p class="hint">Dafür braucht die App dein Tagesziel. Richte zuerst im Reiter „Ernährung“ dein Ernährungsziel ein.</p>
      <button class="btn primary" data-action="go-nutrition">Zur Ernährung</button></div>`;
  }
  if (!mgPicks()) mgDraft = { picks: mgMakePicks() };
  const days = mgDays(mgSel && mgSel < todayISO() ? mgSel : todayISO());  // aus dem Tagebuch auch für einen vergangenen Tag
  if (!days.includes(mgSel)) mgSel = days[0];
  const d = mgDay(mgSel);
  let h = `<div class="card mg-head">
      <h2>🍽️ ${mgDraft ? 'Vorschlag für deinen Ernährungsplan' : 'Dein Ernährungsplan'}</h2>
      <p class="hint nut-small">Die Mengen richten sich jeden Tag nach deinem Tagesziel. Ändert sich dein Ziel, passt die App sie von selbst an.
        Gefällt dir ein Gericht nicht, tausch es mit „⇄ Anderes Gericht“.</p>
      ${mgDraft ? `<button class="btn primary" data-action="mg-accept">✔ Plan übernehmen</button>
        <p class="hint nut-small">Danach steht im Ernährungstagebuch bei jeder Mahlzeit, was geplant ist, und du trägst sie mit „✔ Wie geplant“ ein.</p>` : ''}
    </div>
    <div class="mg-days" role="tablist">${days.map(x => `<button class="mg-day ${x === mgSel ? 'on' : ''}" data-action="mg-day" data-d="${x}" role="tab"
      aria-selected="${x === mgSel}"><span>${mgDayShort(x)}</span><small>${new Date(x + 'T12:00:00').getDate()}.</small></button>`).join('')}</div>`;
  if (!d) return h + '<div class="card"><p class="hint">Für diesen Tag gibt es kein Tagesziel, z. B. weil dein Ernährungsziel unterbrochen ist.</p></div>';
  const g = d.goal;
  const dev = (a, b) => Math.abs(a - b) <= Math.max(b * 0.06, 8) ? '' : ' off';
  h += `<div class="card mg-sum">
      <div class="nut-goal-row food-sum"><span>Kalorien<b class="${dev(d.kcal, g.kcal)}">${nutKcal(d.kcal)}</b></span><span>Eiweiß<b class="${dev(d.p, g.protein)}">${d.p} g</b></span>
        <span>Kohlenh.<b class="${dev(d.c, g.carbs)}">${d.c} g</b></span><span>Fett<b class="${dev(d.f, g.fat)}">${d.f} g</b></span></div>
      <p class="hint nut-small">Tagesziel: ${nutKcal(g.kcal)} kcal | Eiweiß ${g.protein} g | Kohlenhydrate ${g.carbs} g | Fett ${g.fat} g</p>
    </div>`;
  for (const k of mealKeys()) {
    const r = d.recipes[k], items = d.meals[k] || [];
    if (!r) continue;
    const [icon, label] = mealInfo(k);
    const kc = items.reduce((s, i) => s + i.kcal, 0);
    h += `<div class="card mg-meal">
        <div class="food-meal-head"><b>${icon} ${esc(label)}</b><span class="hint">${nutKcal(kc)} kcal</span></div>
        <h3 class="mg-title">${esc(r.name)}</h3>
        <ul class="mg-items">${items.map(i => `<li><span class="mg-g">${amtTxt(i.g)}</span><span>${esc(i.name)}</span>${i.unit ? `<small>(${Math.round(i.g / i.unit)} Stück)</small>` : ''}${i.extra ? '<small>zusätzlich</small>' : ''}</li>`).join('')}</ul>
        <p class="hint nut-small mg-how">${esc(r.how)}</p>
        <button class="btn mg-swap" data-action="mg-swap" data-k="${k}">⇄ Anderes Gericht</button>
      </div>`;
  }
  h += `<p class="hint nut-small explain">Die Nährwerte sind Durchschnittswerte aus der Grundliste. Kleine Abweichungen vom Tagesziel entstehen durch
    das Runden der Mengen. Bei Unverträglichkeiten oder Allergien prüf die Zutaten bitte selbst.</p>`;
  if (mgDraft) h += `<button class="btn" data-action="mg-reroll">🔀 Neu zusammenstellen</button>
    <button class="btn center" data-action="mg-cancel">Abbrechen</button>`;
  else h += `<button class="btn" data-action="mg-reroll">🔀 Neu zusammenstellen</button>
    <button class="btn danger" data-action="mg-end">Plan beenden</button>`;
  return h;
}

views.mealplan = { title: 'Ernährungsplan', tab: 'nutrition', render: renderMealPlan,
  back: p => p.from === 'food' ? ['food', { date: p.date }] : ['nutrition', {}] };

// Knopf im Ernährungs-Reiter („Mehr“)
function mgOpenBtn() {
  if (typeof nutPlanActive === 'function' && nutPlanActive()) return '';
  return mgActive()
    ? '<button class="btn nav mg-open-btn" data-action="mg-open">🍽️ Dein Ernährungsplan<small>Gerichte für jeden Tag, passend zu deinem Tagesziel</small></button>'
    : '<button class="btn nav mg-open-btn" data-action="mg-open">🍽️ Ernährungsplan erstellen lassen<small>Die App stellt Gerichte für jeden Tag zusammen, passend zu deinen Kalorien und Makros</small></button>';
}

Object.assign(actions, {
  'mg-open': () => { mgSel = todayISO(); if (!data.mealPlan) mgDraft = null; go('mealplan'); },
  'go-nutrition': () => go('nutrition'),
  // aus dem Tagebuch: Plan für diesen Tag ansehen (Gericht tauschen, Zubereitung)
  'mg-open-day': el => { mgDraft = null; mgSel = el.dataset.d; go('mealplan', { from: 'food', date: el.dataset.d }); },
  'mg-day': el => { mgSel = el.dataset.d; render(); },
  'mg-swap': el => {
    const k = el.dataset.k, picks = mgPicks(), wd = mgWd(mgSel);
    const cur = mgPick(picks, wd, k), same = mealKeys().filter(x => x !== k).map(x => mgPick(picks, wd, x).id);
    const list = MG_RECIPES.filter(r => r.cat === cur.cat);
    let i = list.indexOf(cur);
    for (let n = 0; n < list.length; n++) { i = (i + 1) % list.length; if (!same.includes(list[i].id)) break; }
    picks[wd] = { ...(picks[wd] || {}), [k]: list[i].id };
    if (!mgDraft) saveData();
    render();
  },
  'mg-reroll': () => {
    if (!mgDraft && !askOk('Alle Gerichte neu zusammenstellen?\n\nGetauschte Gerichte gehen dabei verloren.')) return;
    if (mgDraft) mgDraft = { picks: mgMakePicks() };
    else { data.mealPlan.picks = mgMakePicks(); saveData(); }
    render();
  },
  'mg-accept': () => {
    data.mealPlan = { created: todayISO(), picks: mgDraft.picks };
    mgDraft = null;
    saveData();
    toast('Ernährungsplan übernommen ✔');
    render();
    window.scrollTo(0, 0);
  },
  'mg-cancel': () => { mgDraft = null; go('nutrition'); },
  'mg-end': () => {
    if (!askOk('Ernährungsplan beenden?\n\nDein Tagesziel und dein Tagebuch bleiben, wie sie sind.')) return;
    data.mealPlan = null;
    saveData();
    toast('Ernährungsplan beendet');
    go('nutrition');
  },
});
