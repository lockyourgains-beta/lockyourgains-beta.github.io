/* LockYourGains | © 2026 Alexander Hundt | Alle Rechte vorbehalten – siehe LICENSE */
'use strict';

/* ---------- Ernährung: Phase, Kalorienbedarf, Makros, Körpergewicht ----------
   data.nutrition = { sex: 'm'|'f', age, ageYear, height, bodyFat|null, activity (1–5),
     phase: 'bulk'|'recomp'|'diet'|'minicut', pace, goalKg|null, weeks (nur Minicut),
     since (JJJJ-MM-TT, Beginn der Phase), startKg, adjust (kcal aus dem Gewichtsverlauf), adjustAt,
     history: [{ phase, from, to }] }
   Gerechnet wird immer mit dem aktuellen Körpergewicht (Ø der letzten 7 Tage mit Einträgen). */

const NUT_PHASES = {
  bulk: {
    label: 'Aufbau', icon: '💪', short: 'Muskeln aufbauen mit einem kleinen Kalorienüberschuss.',
    long: [
      ['Worum geht es?', 'Du isst etwas mehr, als du verbrauchst. Der Überschuss liefert Energie und Baumaterial, damit aus deinem Training möglichst viel Muskulatur wird. Ein wenig Fett kommt dabei immer mit. Ein kleiner Überschuss („Lean Bulk“) hält das gering.'],
      ['Für wen?', 'Wenn du eher schlank bist (Männer bis ca. 15–18 % Körperfett, Frauen bis ca. 25–28 %) und vor allem Muskeln und Kraft zulegen willst. Während des Aufbaus sollten es bei Männern nicht mehr als ca. 25 % Körperfett werden, bei Frauen nicht mehr als ca. 33 %.'],
      ['Kalorien', 'Standard: +150 bis +200 kcal über deinem Erhaltungsbedarf. Ambitioniert, für Einsteiger mit viel Aufbaupotenzial oder wenn du schon sehr schlank bist: +300 bis +400 kcal. Mehr bringt keine zusätzlichen Muskeln, das Mehr landet vor allem auf den Hüften.'],
      ['Tempo', 'Standard: Peile 0,5 bis 0,8 % deines Körpergewichts pro Monat an (bei 80 kg also ca. 0,4 bis 0,6 kg). Ambitioniert: 1 bis 1,5 % pro Monat (bei 80 kg ca. 0,8 bis 1,2 kg). Gemeint ist immer der Wochenschnitt deines Gewichts, nicht der einzelne Tag. So kannst du den Aufbau lange durchziehen und musst hinterher nicht wieder so viel abnehmen. Am Anfang geht es meist etwas schneller. Nach einigen Wochen flacht die Zunahme ab, weil sich der Körper an den Überschuss gewöhnt und mehr verbraucht. Bleibt dein Wochenschnitt dann vier Wochen lang stehen, schlägt die App 100 kcal mehr vor. Weil die Zunahme so klein ist, schaut die App im Aufbau immer auf vier Wochen.'],
      ['Dauer', 'Meist mehrere Monate (4–12). Fühlst du dich zu „weich“, folgt ein Minicut oder eine Diät.'],
      ['Training', 'Die beste Zeit für Kraftsteigerungen. Die Steigerungslogik der App läuft voll.'],
      ['Fortschritt erkennst du an', 'langsam steigendem Gewicht, steigenden Trainingsgewichten und einem Bauchumfang, der kaum zunimmt.'],
    ],
  },
  recomp: {
    label: 'Body Recomposition', icon: '⚖️', short: 'Fett verlieren und gleichzeitig Muskeln aufbauen, rund um den Erhaltungsbedarf.',
    long: [
      ['Worum geht es?', 'Du isst ungefähr so viel, wie du verbrauchst. Die Energie für neue Muskeln holt sich der Körper zum Teil aus den Fettreserven. Das Gewicht bleibt fast gleich, aber die Zusammensetzung ändert sich: weniger Fett, mehr Muskeln.'],
      ['Für wen?', 'Klappt am besten bei Trainingsneulingen, Wiedereinsteigern nach einer Pause und bei etwas mehr Körperfett. Bei sehr erfahrenen und schlanken Sportlern geht es kaum noch voran. Dann lieber Aufbau und Diät abwechseln.'],
      ['Kalorien', 'Erhaltungsbedarf oder leicht darunter (bis −300 kcal). Viel Eiweiß ist hier besonders wichtig.'],
      ['Tempo', 'Langsam: Die Waage bewegt sich kaum. Fortschritt siehst du am Spiegel, am Maßband (Bauch) und an steigenden Gewichten im Training.'],
      ['Dauer', 'Offen, oft mehrere Monate.'],
      ['Training', 'Ganz normal mit Steigerung. Das Training ist hier der wichtigste Antrieb.'],
      ['Fortschritt erkennst du an', 'gleichbleibendem Gewicht bei schmalerer Taille und steigender Kraft.'],
    ],
  },
  diet: {
    label: 'Diät', icon: '🔥', short: 'Körperfett abbauen mit einem moderaten Defizit und dabei die Muskeln behalten.',
    long: [
      ['Worum geht es?', 'Du isst bewusst weniger, als du verbrauchst, damit der Körper Fettreserven abbaut. Schweres Training und viel Eiweiß signalisieren ihm, die Muskeln zu behalten.'],
      ['Für wen?', 'Wenn du Körperfett loswerden willst, z. B. Männer über ca. 20 %, Frauen über ca. 30 %, oder nach einer längeren Aufbauphase.'],
      ['Kalorien', 'Je nach Tempo ca. 300, 500 oder 700 kcal unter deinem Erhaltungsbedarf.'],
      ['Tempo', 'Wer mehr Fett hat, kann zügiger abnehmen; je schlanker du bist, desto langsamer sollte es gehen. Langsamer = mehr Muskelerhalt und weniger Hunger.'],
      ['Dauer', 'Meist 8–16 Wochen. Danach ein paar Wochen auf Erhaltung essen (Diätpause), bevor es weitergeht oder in den Aufbau geht.'],
      ['Training', 'Gewichte so gut es geht halten. Gegen Ende kann die Kraft etwas sinken. Das ist normal. Mehr Sätze bringen jetzt nichts. Versuche dich trotzdem so lange wie möglich noch zu steigern oder deine Leistung zu halten.'],
      ['Fortschritt erkennst du an', 'gleichmäßig sinkendem Gewicht, schmalerer Taille und weitgehend gleicher Kraft.'],
    ],
  },
  minicut: {
    label: 'Minicut', icon: '⚡', short: 'Kurze, harte Diät über 2–4 Wochen, meist mitten in einer Aufbauphase.',
    long: [
      ['Worum geht es?', 'Eine kurze, bewusst harte Diät mit großem Defizit. Ziel ist, in kurzer Zeit etwas Fett loszuwerden, ohne lange aus dem Aufbau herauszugehen.'],
      ['Für wen?', 'Meist mitten im Aufbau, wenn sich zu viel Fett angesammelt hat, oder vor einem Anlass (Urlaub, Fotos). Nicht als Dauerlösung und nicht für Trainingsneulinge.'],
      ['Kalorien', 'Ca. 800 kcal unter deinem Erhaltungsbedarf, bei mehr Körperfett ca. 1.000 kcal.'],
      ['Tempo', 'In den ersten Tagen fällt das Gewicht schnell (vor allem Wasser), danach geht es zügig, aber gleichmäßig weiter.'],
      ['Dauer', 'Höchstens 4 Wochen am Stück. Danach 1 Woche auf Erhaltungskalorien essen, am besten kombiniert mit einer Deload-Woche im Training. Bist du dann noch nicht zufrieden, höchstens noch einen weiteren Durchgang mit diesem Defizit, danach in den Aufbau oder auf Erhaltung.'],
      ['Training', 'Gewichte halten, eher ein paar Sätze weniger. Mit wenig Energie erholst du dich nicht mehr ganz so gut. Kein guter Zeitpunkt für Rekordversuche. Versuche dich trotzdem so lange wie möglich noch zu steigern oder deine Leistung zu halten.'],
      ['Fortschritt erkennst du an', 'deutlich sinkendem Gewicht und Bauchumfang bei gehaltener Kraft.'],
    ],
  },
};

// Tempo je Phase: kcal = Überschuss/Defizit pro Tag; range = empfohlene Spanne (gerechnet wird mit kcal)
const NUT_PACES = {
  bulk: [
    // v258 (User 2026-11-14): keine Spannen mehr, Richtwert Zunahme in % des Körpergewichts pro Monat (Wochenschnitt)
    // v380 (User 2026-11-24): wieder Spannen, gerechnet wird mit der Mitte (kcal)
    { k: 'normal', label: 'Standard', kcal: 175, range: [150, 200], rate: [0.5, 0.8],
      text: 'Für die meisten. Peile 0,5 bis 0,8 % deines Körpergewichts pro Monat an, gemessen am Wochenschnitt. So kannst du den Aufbau lange durchziehen und musst hinterher nicht wieder so viel abnehmen.' },
    { k: 'ambitious', label: 'Ambitioniert', kcal: 350, range: [300, 400], rate: [1, 1.5],
      text: 'Für ambitionierte Einsteiger mit viel Aufbaupotenzial oder wenn du schon sehr schlank bist (niedriger Körperfettanteil). Peile 1 bis 1,5 % deines Körpergewichts pro Monat an, gemessen am Wochenschnitt. Es kommt etwas mehr Fett mit.' },
  ],
  recomp: [
    { k: 'maint', label: 'Erhaltung', kcal: 0, text: 'Wenn du schon recht schlank bist.' },
    { k: 'light', label: 'Leicht darunter', kcal: -150, text: 'Der übliche Weg: Ein Hauch Defizit hilft beim Fettabbau.' },
    { k: 'more', label: 'Etwas mehr darunter', kcal: -300, text: 'Bei etwas mehr Körperfett.' },
  ],
  diet: [
    { k: 'slow', label: 'Sanft', kcal: -300, text: 'Bestmöglicher Muskelerhalt, wenig Hunger. Ideal, wenn du schon recht schlank bist.' },
    { k: 'normal', label: 'Normal', kcal: -500, text: 'Der gute Mittelweg für die meisten.' },
    { k: 'fast', label: 'Zügig', kcal: -700, text: 'Bei deutlich mehr Körperfett. Mehr Hunger, eher Kraftverlust.' },
  ],
  minicut: [
    { k: 'normal', label: 'Standard', kcal: -800, text: 'Für die meisten.' },
    { k: 'more', label: 'Mehr Körperfett', kcal: -1000, text: 'Wenn du etwas mehr Körperfett loswerden willst.' },
  ],
};
const NUT_MINICUT_MAX = 4;  // Minicut: höchstens 4 Wochen am Stück, danach 1 Erhaltungswoche (+ Deload), höchstens 2 Durchgänge
// v309 (User-Wunsch): direkt bei der Auswahl sagen, dass der Minicut begrenzt ist und der Deload sich danach richtet
const NUT_MINICUT_SHORT = `Ein Minicut läuft nie länger als ${NUT_MINICUT_MAX} Wochen am Stück. Danach folgt automatisch eine Woche auf Erhaltungskalorien und im Training gleichzeitig die Deload-Woche. Dein Trainingszyklus wird dafür entsprechend verkürzt.`;

// Aktivität = Alltag + Training zusammen (Faktor auf den Grundumsatz)
const NUT_ACT = {
  1: { label: 'Kaum aktiv', f: 1.2, text: 'Sitzender Alltag, kaum Bewegung, kein Sport.' },
  2: { label: 'Leicht aktiv', f: 1.375, text: 'Bürojob, 1–3 Trainings pro Woche oder ca. 5.000–7.500 Schritte am Tag.' },
  3: { label: 'Mäßig aktiv', f: 1.55, text: '3–5 Trainings pro Woche und ca. 7.500–10.000 Schritte oder ein Job mit viel Stehen und Gehen.' },
  4: { label: 'Sehr aktiv', f: 1.725, text: 'Fast täglich Training und über 10.000 Schritte oder körperlich anstrengende Arbeit.' },
  5: { label: 'Extrem aktiv', f: 1.9, text: 'Harte körperliche Arbeit plus Training oder Leistungssport.' },
};

// Eiweiß in g pro kg (Bezugsgewicht, siehe nutProteinKg)
// lo–hi = empfohlene Spanne, def = damit rechnet die App
const NUT_PROTEIN = {
  bulk: { lo: 1.6, hi: 2.0, def: 1.8 },
  recomp: { lo: 1.8, hi: 2.2, def: 2.0 },
  diet: { lo: 1.8, hi: 2.4, def: 2.0 },
  minicut: { lo: 2.0, hi: 2.5, def: 2.2 },
};
// v374 (User 2026-11-24): Eiweiß je kg fettfreie Masse, für alle gleich (vorher Bezugsgewicht mit Sprüngen bei 25 / 32 % KFA).
// Untergrenze je kg Körpergewicht (Diät und Minicut 2 g, sonst 1,6 g), außer bei starkem Übergewicht (nutBodyType 'over').
// Die Spanne (NUT_PROTEIN lo–hi) wird über den Mittelwert def auf diese Menge umgerechnet.
const NUT_PROTEIN_FFM = { bulk: 2.1, recomp: 2.3, diet: 2.4, minicut: 2.6 };
const NUT_PROTEIN_MIN = { bulk: 1.6, recomp: 1.6, diet: 2.0, minicut: 2.0 };
const NUT_FAT_FFM = 0.8, NUT_FAT_WARN_FFM = 0.6;  // Fett mindestens 0,8 g je kg fettfreie Masse, Warnung unter 0,6 g
// Selbsteinschätzung (optional, n.selfEst) und angenommener KFA ohne Messung; gemessener KFA gilt immer zuerst
const NUT_SELF = [['under', 'Untergewichtig'], ['normal', 'Normal'], ['over', 'Übergewichtig']];
const NUT_BF_ASSUME = { under: { m: 10, f: 15 }, normal: { m: 14, f: 22 } };
const NUT_UNDER_WARN = 'Nach deinen Angaben bist du untergewichtig. Ein Kaloriendefizit kostet dann eher Muskeln, Kraft und Gesundheit, als dass es dir nützt. Sinnvoll ist eine Diät hier höchstens, wenn du sehr ambitioniert Sport treibst oder Wettkämpfe bestreitest, z. B. um eine Gewichtsklasse zu erreichen. Dann am besten mit Trainer oder Ernährungsberatung. Hast du Sorgen rund ums Essen oder dein Gewicht, sprich bitte mit einer Ärztin oder einem Arzt.';
const NUT_BF_SRC ={ measured: 'von dir eingetragen', assumed: 'angenommen, weil kein Körperfettanteil eingetragen ist', estimated: 'geschätzt aus BMI, Alter und Geschlecht' };
const NUT_BF_UNDER = { m: 8, f: 15 }, NUT_BF_OVER = { m: 25, f: 32 };  // gemessener KFA: darunter Untergewicht, ab da starkes Übergewicht
const NUT_KCAL_KG = 7700;  // grob: 1 kg Körpergewicht ≈ 7.700 kcal

let nutDraft = null;  // Eingaben während der Einrichtung (Phase → Angaben → Ziel & Tempo)

const nutKcal = v => deNum(Math.round(v / 10) * 10);
const nutSigned = (v, unit) => `${v > 0 ? '+' : v < 0 ? '−' : '±'}${unit === 'kg' ? fmtNum(round1(Math.abs(v))) : nutKcal(Math.abs(v))} ${unit}`;
const addDaysISO = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
const daysSince = iso => Math.floor((Date.parse(todayISO() + 'T12:00:00') - Date.parse(iso + 'T12:00:00')) / DAY);

// Aktuelles Gewicht: Ø der Einträge aus den 7 Tagen bis zum letzten Eintrag (glättet Wasserschwankungen)
function nutWeight() {
  const list = [...data.bodyweight].sort((a, b) => a.date.localeCompare(b.date));
  if (!list.length) return null;
  const from = addDaysISO(list[list.length - 1].date.slice(0, 10), -6);
  const week = list.filter(b => b.date.slice(0, 10) >= from);
  return round1(week.reduce((a, b) => a + b.kg, 0) / week.length);
}

// Vollständig eingerichtet? Beim ersten Öffnen wird nur die Phase gewählt – Kalorien gibt es erst mit den Angaben.
const nutReady = n => !!(n && n.sex && n.age != null && n.height != null && n.activity);

// v374: Tempo je Körpertyp. Untergewicht: Aufbau schneller (1–1,5 % bzw. höchstens 2 % pro Monat), starkes Übergewicht: Diät
// Normal −700 und Zügig −1.000 kcal. Sonst NUT_PACES.
function nutPaces(phase, type) {
  if (phase === 'bulk' && type === 'under') return [
    { k: 'normal', label: 'Standard', kcal: 300, rate: [1, 1.5],
      text: 'Bei Untergewicht darfst und solltest du etwas schneller zunehmen. Peile 1 bis 1,5 % deines Körpergewichts pro Monat an, gemessen am Wochenschnitt.' },
    { k: 'ambitious', label: 'Ambitioniert', kcal: 500, rate: [null, 2],
      text: 'Höchstens 2 % deines Körpergewichts pro Monat, gemessen am Wochenschnitt. Gut, wenn du zügig aus dem Untergewicht herauskommen möchtest.' },
  ];
  if (phase === 'diet' && type === 'over') return NUT_PACES.diet.map(p => p.k === 'normal' ? { ...p, kcal: -700, text: 'Der gute Mittelweg bei deutlich mehr Körperfett.' }
    : p.k === 'fast' ? { ...p, kcal: -1000, text: 'Bei viel Körperfett gut machbar. Mehr Hunger, eher Kraftverlust.' } : p);
  return NUT_PACES[phase];
}
// n darf auch der Entwurf mit Texteingaben sein; kg: Gewicht für den Körpertyp (sonst aus n bzw. dem Wochenschnitt)
function nutPace(n, kg) {
  const m = typeof n.kg === 'string' || typeof n.bodyFat === 'string' ? nutNumbers(n) : n;
  const list = nutPaces(m.phase, nutBodyType(m, kg || m.kg || nutWeight() || m.startKg));
  return list.find(p => p.k === m.pace) || list.find(p => p.k === 'normal' || p.k === 'light');
}
// Minicut-Abschnitt: 'cut' (Defizit), 'maint' (Erhaltungswoche danach), 'done'
// Training an Diät/Minicut angepasst (n.trainAdapt, beim Einrichten gefragt): Regel v229 siehe dietRirRange/dietVolWeek (app.js)
// – nur während des Defizits (nicht in der Erhaltungswoche)
function nutTrainAdapt() {
  const n = data.nutrition;
  if (!n || !n.trainAdapt || nutPaused(n)) return false;
  return n.phase === 'diet' || (n.phase === 'minicut' && nutMinicutStage(n) === 'cut');
}

const NUT_ADAPT_TEXT = 'Das Volumen startet in der Intro-Woche auf dem Stand, den dein Plan sonst in Woche 2 hat, steigt in Woche 2 auf den Stand von Woche 3 und bleibt dann dort, kein weiterer Anstieg. Im Tank bleiben in der Intro-Woche 2 Wiederholungen, danach jede Woche 0,5 weniger bis 0,5 (Grundübungen 0,5 mehr, Assistenzübungen 0,5 weniger; mit „Mehr Volumen“ bzw. „Weniger Volumen“ im Plan jeweils 0,5 mehr bzw. weniger, bei „Weniger Volumen“ aber nie unter 0,5). Und die App erzwingt keine Gewichtssteigerung: Das Gewicht steigt nur, wenn du den Plan klar erfüllt hast, sonst höchstens 1 Wiederholung mehr als beim letzten Mal. So hältst du deine Kraft, ohne dich im Defizit zu überfordern.';

// Frage beim Einrichten von Diät und Minicut
function nutTrainQuestion(d, action = 'nut-train-pick') {
  if (d.phase !== 'diet' && d.phase !== 'minicut') return '';
  if (!feat('nut-train-q')) return '';  // Einfach: Training wird automatisch angepasst
  const opt = (v, title, text) => `<button class="split-opt ${d.trainAdapt === v ? 'on' : ''}" data-action="${action}" data-v="${v ? 1 : 0}">
      <b>${title}</b><small>${text}</small></button>`;
  const own = data.plans.length && hasActivePlan() && ownPlan();
  return `<div class="card wiz-q">
      <div class="wiz-q-head"><span class="wiz-q-icon" aria-hidden="true">🏋️</span><h2>Trainingsplan an ${d.phase === 'minicut' ? 'den Minicut' : 'die Diät'} anpassen?</h2></div>
      <p class="hint wiz-q-explain">Im Kaloriendefizit erholst du dich nicht mehr ganz so gut. Angepasst heißt: ${NUT_ADAPT_TEXT}
        ${own ? '<br><b>Hinweis:</b> Dein aktiver Plan ist ein eigener Plan ohne Steigerung, dort ändert sich nichts.' : ''}</p>
      ${opt(true, 'Ja, Training anpassen', 'Gilt, solange dieses Ernährungsziel läuft, danach wieder wie gewohnt.')}
      ${opt(false, 'Nein, Plan läuft unverändert', 'Volumen und Tank bleiben wie im Plan.')}
    </div>`;
}

// Zeile auf der Trainings-Startseite: Phase, Tagesziel, ggf. angepasstes Training
function nutStartLine() {
  const n = data.nutrition;
  const kg = nutWeight();
  if (n && nutPaused(n)) return `<button class="nut-strip" data-action="tab" data-tab="nutrition"><span class="nut-strip-icon" aria-hidden="true">⏸</span>
      <span><b>${NUT_PHASES[n.phase].label}</b> | unterbrochen${n.pause.to ? ` bis ${fmtDate(n.pause.to + 'T12:00:00')}` : ''}</span></button>`;
  if (typeof nutPlanActive === 'function' && nutPlanActive()) {
    const c = nutForDay(null), t = intakeOn(todayISO());
    return `<button class="nut-strip" data-action="tab" data-tab="nutrition"><span class="nut-strip-icon" aria-hidden="true">📋</span>
      <span><b>${esc(data.nutPlan.name)}</b> | ${esc(c.label)} | Tagesziel ${nutKcal(c.kcal)} kcal${t && t.kcal != null ? ` | heute ${nutKcal(t.kcal)}` : ''}</span></button>`;
  }
  if (!n) return '';
  const ph = NUT_PHASES[n.phase];
  const maint = (n.phase === 'minicut' && nutMinicutStage(n) !== 'cut') || nutBreakNow(n);
  if (!nutReady(n)) return `<button class="nut-strip" data-action="tab" data-tab="nutrition"><span class="nut-strip-icon" aria-hidden="true">${ph.icon}</span>
      <span><b>${ph.label}</b>${maint ? ' | Erhaltungswoche' : ''} | Tagesziel: Angaben noch ergänzen
        ${nutTrainAdapt() ? `<small>${feat('tr-rir-input') ? 'Training angepasst: Volumen ohne weiteren Anstieg, Tank von 2 auf 0,5' : 'Training an dein Ernährungsziel angepasst'}</small>` : ''}</span></button>`;
  if (kg == null) return '';
  return `<button class="nut-strip" data-action="tab" data-tab="nutrition"><span class="nut-strip-icon" aria-hidden="true">${ph.icon}</span>
      <span><b>${ph.label}</b>${maint ? ' | Erhaltungswoche' : ''} | Tagesziel ${nutKcal(nutForDay(nutCalc(n, kg)).kcal)} kcal${(t => t && t.kcal != null ? ` | heute ${nutKcal(t.kcal)}` : "")(intakeOn(todayISO()))}
        ${nutTrainAdapt() ? `<small>${feat('tr-rir-input') ? 'Training angepasst: Volumen ohne weiteren Anstieg, Tank von 2 auf 0,5' : 'Training an dein Ernährungsziel angepasst'}</small>` : ''}
        ${(cc => nutLowIntake(n, nutForDay(cc)) ? '<small>⚠️ Du isst zurzeit sehr wenig, siehe Ernährung</small>'
          : n.goalKg != null && n.phase !== 'recomp' && n.goalKg !== n.startKg && (kg - n.startKg) / (n.goalKg - n.startKg) >= 1 ? '<small>🎯 Ziel erreicht</small>' : '')(nutCalc(n, kg))}</span></button>`;
}

// Hinweis beim Einrichten (User-Wunsch 2026-11-09): Der Minicut begrenzt den Trainingszyklus – nach den Minicut-Wochen folgt
// Deload + Erhaltungswoche, danach höchstens ein zweiter Durchgang (bis 4 Wochen), dann Phase wechseln. Mit laufendem Plan
// zusätzlich, in welcher Woche der eigene Zyklus dann endet.
function nutMinicutNote(w) {
  let mine = '';
  if (nutPlanCoupled() && !selfDeload()) {
    const ci = cycleInfo();
    const left = data.cycle.buildWeeks - ci.week + 1;  // Trainingswochen bis zum regulären Deload (diese mitgezählt)
    if (!ci.deload && left > w) mine = `<br><b>Bei dir:</b> Du bist in Woche ${ci.week} von ${data.cycle.buildWeeks}. Mit ${w} Wochen
      Minicut endet dein Zyklus schon nach Woche ${ci.week + w - 1}, statt nach Woche ${data.cycle.buildWeeks}.`;
  }
  return `<div class="deload-note nut-small">⚡ <b>Minicut und Training</b>
      <ul class="nut-mc-list">
        <li>Der Minicut <b>begrenzt deinen Trainingszyklus</b> auf die gewählte Dauer. Danach folgt automatisch 1 Woche auf
          Erhaltungskalorien und im Training gleichzeitig die <b>Deload-Woche</b>, auch wenn dein Zyklus eigentlich länger wäre.</li>
        <li>Danach ist noch <b>ein</b> weiterer Durchgang möglich: höchstens ${NUT_MINICUT_MAX} Wochen Training im Defizit, dann wieder Deload.</li>
        <li>Spätestens dann solltest du dein <b>Ernährungsziel wechseln</b>: weiter mit Aufbau oder ein paar Wochen auf Erhaltung.</li>
      </ul>${mine}</div>`;
}

// Defizit-Wochen zählen ohne Erhaltungswochen dazwischen (Deload, siehe nutBreakNow); danach Erhaltungswoche (maintFrom,
// läuft mindestens 7 Tage und solange im Training der Deload läuft, höchstens 14 Tage)
function nutMinicutStage(n) {
  const w = Math.min(n.weeks || NUT_MINICUT_MAX, NUT_MINICUT_MAX);
  if (!n.maintFrom) {
    const breaks = (n.breakTotal || 0) + (n.breakOn ? daysSince(n.breakOn) : 0) + nutPauseDays(n);
    return (n.since ? daysSince(n.since) : 0) - breaks < w * 7 ? 'cut' : 'maint';
  }
  const d = daysSince(n.maintFrom);
  return d < 7 || (d < 14 && nutPlanCoupled() && cycleInfo().deload) ? 'maint' : 'done';
}

// Trainingsplan mit Zyklus (Deload) vorhanden?
const nutPlanCoupled = () => data.plans.length > 0 && hasActivePlan() && !ownPlan() && data.days.length > 0;

// Phase bewusst unterbrechen (User-Wunsch 2026-11-06, z. B. Urlaub): n.pause { from, to (letzter Tag) oder null = offen }, vorbei: n.pauses.
// Solange: kein Tagesziel, keine Hinweise, Training ohne Diät-Anpassung; die Pausentage zählen nicht als Phasenwochen. Danach beginnen
// Gewichtsvergleich und gemessener Bedarf neu (resumeAt, erste Woche danach zählt nicht: Wasser nach dem Urlaub).
const nutPaused = (n = data.nutrition, date = todayISO()) => !!(n && n.pause && date >= n.pause.from && (!n.pause.to || date <= n.pause.to));
const nutPausedOn = date => { const n = data.nutrition; return !!n && (nutPaused(n, date) || (n.pauses || []).some(p => date >= p.from && date <= p.to)); };
const nutPauseDays = n => (n.pauseTotal || 0) + (nutPaused(n) ? daysSince(n.pause.from) : 0);
const nutWeekNo = n => Math.floor(Math.max(0, daysSince(n.since) - nutPauseDays(n)) / 7) + 1;
function nutPauseFinish(n, end) {
  const p = n.pause;
  n.pause = null;
  if (end < p.from) return;  // hatte noch nicht begonnen
  n.pauses = [...(n.pauses || []), { from: p.from, to: end }];
  n.pauseTotal = (n.pauseTotal || 0) + daysSince(p.from) - daysSince(end) + 1;
  const back = addDaysISO(end, 1), later = a => [a || '', back].sort().pop();
  Object.assign(n, { resumeAt: back, changedAt: later(n.changedAt), adjustAt: later(n.adjustAt), breakEnd: later(n.breakEnd) });
}

// Deload-Woche im Training = Erhaltungswoche beim Essen (Diät und Minicut-Defizit) – außer für diesen Zyklus abgewählt
function nutBreakNow(n = data.nutrition) {
  if (!n || nutPaused(n) || !(n.phase === 'diet' || (n.phase === 'minicut' && !n.maintFrom))) return false;
  if (!nutPlanCoupled()) return false;
  const ci = cycleInfo();
  return ci.deload && n.noBreak !== ci.cycleStart;
}

// Deload jetzt beginnen (auch bei „Deload automatisch“): für die Erhaltungswoche nach dem Minicut
function nutForceDeload() {
  const ci = cycleInfo();
  if (ci.deload) return;
  if (dlByHand()) startDeloadNow();  // v365: auch bei „Pause statt Deload“
  else setRound(ci.cycleStart, data.cycle.buildWeeks + 1, ci.cycle);
}

// Bei jedem Zeichnen: Erhaltungswochen mitzählen, Minicut-Erhaltungswoche starten (mit Deload im Training)
function nutSync() {
  if (typeof ppSync === 'function') ppSync();  // v315: Phasenplan – Ende einer Phase → automatisch die nächste (phaseplan.js)
  const n = data.nutrition;
  if (!n || !nutReady(n)) return;
  const today = todayISO();
  let changed = false;
  if (n.pause && n.pause.to && todayISO() > n.pause.to) { nutPauseFinish(n, n.pause.to); changed = true; }  // Unterbrechung abgelaufen
  const brk = nutBreakNow(n);
  if (brk && !n.breakOn) { n.breakOn = today; changed = true; }
  if (!brk && n.breakOn) {
    // Erhaltungswoche vorbei: Gewichtsverlauf und gemessener Bedarf beginnen danach neu (Wasser schwankt) –
    // nicht, wenn sie noch am selben Tag abgewählt wurde
    const days = daysSince(n.breakOn), from = n.breakOn;
    n.breakTotal = (n.breakTotal || 0) + days;
    n.breakOn = null;
    if (days > 0) { n.adjustAt = today; n.breakEnd = today; }
    // Minicut: Lag der Deload direkt am Ende (höchstens 3 Defizit-Tage übrig), gilt er als die Erhaltungswoche –
    // sonst folgten zwei Deload-Wochen hintereinander
    if (days > 0 && n.phase === 'minicut' && !n.maintFrom) {
      const left = Math.min(n.weeks || NUT_MINICUT_MAX, NUT_MINICUT_MAX) * 7 - (daysSince(n.since) - n.breakTotal - nutPauseDays(n));
      if (left <= 3) n.maintFrom = from;
    }
    changed = true;
  }
  if (n.phase === 'minicut' && !n.maintFrom && nutMinicutStage(n) === 'maint') {
    if (n.breakOn) { n.breakTotal = (n.breakTotal || 0) + daysSince(n.breakOn); n.breakOn = null; }
    n.maintFrom = today;
    if (nutPlanCoupled()) nutForceDeload();
    changed = true;
  }
  if (changed) saveData();
}

// Cardio (cardio.js): Verbrauch eines Tages, der ins Tagesziel einfließt (nur wenn eingeschaltet)
const nutCardio = date => data.nutrition && data.nutrition.cardioAdd && typeof cardioKcalOn === 'function' ? cardioKcalOn(date) : 0;
/* v364 (User-Wunsch 2026-11-23): mehr Kalorien an Trainingstagen. data.nutrition.trainDay = true schaltet es ein,
   trainDayKcal = Plus (Standard 200, 50 bis 500 in 50er-Schritten). Trainingstag = an diesem Tag wurde ein Krafttraining begonnen
   (laufendes Training) oder gespeichert. Das Plus geht wie beim Cardio in die Kohlenhydrate. */
const NUT_TD_KCAL = 200, NUT_TD_MIN = 50, NUT_TD_MAX = 500, NUT_TD_STEP = 50;
const nutTdKcal = () => { const n = data.nutrition; return n && n.trainDay ? Math.min(NUT_TD_MAX, Math.max(NUT_TD_MIN, n.trainDayKcal || NUT_TD_KCAL)) : 0; };
function nutTrainedOn(date) {
  if (typeof draft !== 'undefined' && draft && draft.date && localDay(draft.date) === date) return true;
  return (data.sessions || []).some(s => s.date && localDay(s.date) === date);
}
const nutTrainBonus = date => nutTdKcal() && nutTrainedOn(date) ? nutTdKcal() : 0;
// Tagesziel für einen bestimmten Tag: Grundziel + Cardio + Trainingstag (zusätzliche Kalorien vor allem als Kohlenhydrate)
function nutForDay(c, date = todayISO()) {
  // importierter Ernährungsplan (nutplan.js) ist maßgeblich
  if (typeof nutPlanActive === 'function' && nutPlanActive()) c = nutPlanTarget(date);
  const x = c ? nutCardio(date) : 0, t = c ? nutTrainBonus(date) : 0;
  // v392: Zyklus-Spielraum (menstrual.js), nicht bei importiertem Ernährungsplan
  const m = c && typeof mcFlexKcal === 'function' && !(typeof nutPlanActive === 'function' && nutPlanActive()) ? mcFlexKcal(date) : 0;
  return x || t || m ? { ...c, kcal: c.kcal + x + t + m, carbs: c.carbs + Math.round((x + t + m) / 4 / 5) * 5, cardio: x, train: t, mcflex: m } : c;
}

// v369 (User-Wunsch 2026-11-24): Frage samt Erklärung beim Einrichten des Ernährungsziels (Schritt „Ziel & Tempo“),
// im Reiter Ernährung und im Tagebuch nur noch eine kleine Einstellung ohne Erklärung
const nutTdStepper = (k, action) => `<div class="stepper"><button data-action="${action}" data-d="-1" ${k <= NUT_TD_MIN ? 'disabled' : ''} aria-label="Weniger">−</button>
          <b>+${k} kcal</b>
          <button data-action="${action}" data-d="1" ${k >= NUT_TD_MAX ? 'disabled' : ''} aria-label="Mehr">+</button></div>`;
function nutTrainDayQuestion(d) {
  const on = d.trainDay, k = d.trainDayKcal || NUT_TD_KCAL;
  const opt = (v, title, text) => `<button class="split-opt ${on === v ? 'on' : ''}" data-action="nut-td-pick" data-v="${v ? 1 : 0}">
      <b>${title}</b><small>${text}</small></button>`;
  return `<div class="card wiz-q nut-td-q">
      <div class="wiz-q-head"><span class="wiz-q-icon" aria-hidden="true">🏋️</span><h2>Mehr Kalorien an Trainingstagen?</h2></div>
      <p class="hint wiz-q-explain">An Tagen, an denen du ein Training beginnst, erhöht die App dein Tagesziel automatisch um einen festen Betrag,
        vor allem als Kohlenhydrate. Die liefern Energie fürs Training und helfen bei der Erholung. An Tagen ohne Training gilt dein normales
        Tagesziel. 200 kcal sind ein guter Ausgangswert, das sind etwa 50 g Kohlenhydrate, z. B. zwei Bananen oder eine Portion Reis.
        In einer Diät wird das Defizit an Trainingstagen etwas kleiner, im Aufbau der Überschuss etwas größer.</p>
      ${opt(true, 'Ja, an Trainingstagen mehr', 'Den Betrag kannst du hier und später im Ernährungstagebuch unter „Kalorien und Makros anpassen“ ändern.')}
      ${on === true ? `<div class="row nut-td-row"><span>Plus an Trainingstagen</span>${nutTdStepper(k, 'nut-td-dstep')}</div>` : ''}
      ${opt(false, 'Nein, jeden Tag gleich', 'Ein Tagesziel für alle Tage.')}
    </div>`;
}
// Kleine Einstellung (Reiter Ernährung unten, Tagebuch → Kalorien und Makros anpassen)
function nutTrainDayHtml(n, inPanel = false) {
  const on = !!n.trainDay, k = nutTdKcal() || n.trainDayKcal || NUT_TD_KCAL;
  const body = `<div class="nut-td-line"><span>${inPanel ? 'Mehr Kalorien an Trainingstagen' : '🏋️ Mehr Kalorien an Trainingstagen'}</span>
        <div class="seg two"><button class="${on ? 'on' : ''}" data-action="nut-trainday" data-v="1">Ja</button>
        <button class="${on ? '' : 'on'}" data-action="nut-trainday" data-v="0">Nein</button></div></div>
      ${on ? `<div class="row nut-td-row">${nutTdStepper(k, 'nut-trainday-step')}</div>
        ${nutTrainedOn(todayISO()) ? `<p class="hint nut-small">Heute ist Trainingstag: +${k} kcal sind im Tagesziel.</p>` : ''}` : ''}`;
  return inPanel ? `<div class="nut-td small in-panel">${body}</div>` : `<div class="card nut-td small">${body}</div>`;
}
actions['nut-trainday'] = el => {
  const n = data.nutrition;
  if (!n) return;
  n.trainDay = el.dataset.v === '1';
  if (n.trainDay && !n.trainDayKcal) n.trainDayKcal = NUT_TD_KCAL;
  saveData(); render();
  toast(n.trainDay ? `An Trainingstagen +${nutTdKcal()} kcal` : 'Gleiches Tagesziel an allen Tagen');
};
actions['nut-trainday-step'] = el => {
  const n = data.nutrition;
  if (!n) return;
  n.trainDayKcal = Math.min(NUT_TD_MAX, Math.max(NUT_TD_MIN, (n.trainDayKcal || NUT_TD_KCAL) + Number(el.dataset.d) * NUT_TD_STEP));
  saveData(); render();
};

// Wassereinlagerung durch den Menstruationszyklus (menstrual.js) – solche Gewichtswerte zählen nicht für Trend und Bedarf
const nutWaterDay = d => typeof mcWater === 'function' && mcWater(d);

// Empfehlungen (Gewichtsverlauf, gemessener Bedarf) höchstens alle 2 Wochen: ab Phasenbeginn bzw. letzter Änderung
const NUT_SUGGEST_DAYS = 14;
// v270 (User 2026-11-14): im Aufbau alles über 4 Wochen (die Zunahme ist so klein, dass 2 Wochen Wasser nicht von Fett trennen)
const NUT_BULK_SPAN = 4;
const nutSpan = n => n && n.phase === 'bulk' ? NUT_BULK_SPAN : 2;
const nutNextSuggest = n => addDaysISO([n.since, n.adjustAt || '', n.breakEnd ? addDaysISO(n.breakEnd, 7) : ''].sort().pop(), nutSpan(n) * 7);
const nutMaySuggest = n => todayISO() >= nutNextSuggest(n) && !n.breakOn;
const nutFloor = n => n.sex === 'm' ? 1500 : 1200;

// Gewichtsvergleich (User-Regel 2026-11-06): Ø der letzten 10 Wiegungen gegen Ø der 10 davor – ab 0,5 kg in die falsche Richtung
// schlägt die App eine Anpassung vor. Nicht gezählt: erste Phasenwoche, Wiegungen vor der letzten Änderung des Tagesziels, Wassertage (Zykluskalender),
// in Diät/Minicut Deload und die Woche danach.
const NUT_CMP_N = 10, NUT_CMP_KG = 0.5, NUT_FLAT_KG = 0.1;
function nutWeighList(n) {
  const from = [addDaysISO(n.since, 7), n.resumeAt ? addDaysISO(n.resumeAt, 7) : ''].sort().pop();
  const cut = n.phase === 'diet' || n.phase === 'minicut';
  const dl = cut ? data.sessions.filter(s => s.deload && !s.light).map(s => s.date.slice(0, 10)).filter(d => d >= n.since) : [];
  return data.bodyweight.map(b => ({ d: b.date.slice(0, 10), kg: b.kg }))
    .filter(b => b.d >= from && (!n.changedAt || b.d > n.changedAt) && !nutWaterDay(b.d) && !dl.some(d => b.d >= addDaysISO(d, -1) && b.d <= addDaysISO(d, 7)))
    .sort((a, c) => a.d.localeCompare(c.d));
}
// v259 (User 2026-11-14): Aufbau und Diät vergleichen den Wochenschnitt (Ø der letzten 7 Tage) mit dem von vor 2 Wochen.
// Nötig: je mindestens 3 Wiegungen in dieser Woche und vor 2 Wochen, mindestens 1 in der Woche dazwischen.
const NUT_WEEK_MIN = 3;
const NUT_BULK_STEP = 100;  // Aufbau: Stillstand → +100 kcal, zu schnell → −100 kcal
function nutWeekAvgs(n, span = nutSpan(n)) {
  const list = nutWeighList(n), T = todayISO();
  const wk = k => {
    const L = list.filter(b => b.d > addDaysISO(T, -7 * (k + 1)) && b.d <= addDaysISO(T, -7 * k));
    return { n: L.length, avg: L.length ? L.reduce((s, x) => s + x.kg, 0) / L.length : null };
  };
  const w = Array.from({ length: span + 1 }, (_, k) => wk(k));
  if (w[0].n < NUT_WEEK_MIN || w[span].n < NUT_WEEK_MIN || w.slice(1, span).some(x => x.n < 1)) return { ready: false, w };
  return { ready: true, w, a: w[0].avg, b: w[span].avg, diff: w[0].avg - w[span].avg, weeks: span };
}
function nutWeighBlocks(n) {
  const list = nutWeighList(n);
  if (list.length < NUT_CMP_N * 2) return { count: list.length, waiting: !!n.changedAt };
  const A = list.slice(-NUT_CMP_N), B = list.slice(-NUT_CMP_N * 2, -NUT_CMP_N);
  const avg = L => L.reduce((s, x) => s + x.kg, 0) / L.length;
  const mid = L => L.reduce((s, x) => s + Date.parse(x.d + 'T12:00:00') / DAY, 0) / L.length;
  return { count: list.length, a: avg(A), b: avg(B), diff: avg(A) - avg(B), weeks: Math.max(1, (mid(A) - mid(B)) / 7) };
}
// Bewegt sich der Durchschnitt in die falsche Richtung oder bleibt er stehen, obwohl er sich bewegen soll (User-Regel 2026-11-06)?
// dir +1 = steigt, −1 = sinkt, 0 = Stillstand; corr = Vorschlag in kcal (halbe Differenz, höchstens ±200)
function nutOffTrack(n, c, b) {
  if (n.phase === 'bulk' || n.phase === 'diet') return nutOffTrackWeekly(n, c);
  if (!b) b = nutWeighBlocks(n);
  if (b.diff == null) return null;
  const wrongUp = c.planned <= 0 && b.diff >= NUT_CMP_KG;
  const wrongDown = (c.planned > 0 || n.phase === 'recomp') && b.diff <= -NUT_CMP_KG && c.planned >= 0;
  const reached = n.goalKg != null && n.phase !== 'recomp' && n.goalKg !== n.startKg && (b.a - n.startKg) / (n.goalKg - n.startKg) >= 1;  // Ziel erreicht: Stillstand ist richtig
  const flat = !wrongUp && !wrongDown && !reached && ((c.planned <= -0.15 && b.diff > -NUT_FLAT_KG) || (c.planned >= 0.15 && b.diff < NUT_FLAT_KG));
  if (!wrongUp && !wrongDown && !flat) return null;
  const perWeek = (b.diff - c.planned * b.weeks) / b.weeks;
  const raw = Math.round(-perWeek * NUT_KCAL_KG / 7 / 2 / 50) * 50;
  const corr = Math.max(-200, Math.min(200, raw)) || (wrongUp || (flat && c.planned < 0) ? -100 : 100);
  return { dir: wrongUp ? 1 : wrongDown ? -1 : 0, diff: b.diff, corr };
}
// Aufbau: Stillstand 2 Wochen → +100 kcal; schneller als 0,8 % (Standard) bzw. 1,5 % (Ambitioniert, v380) pro Monat → −100 kcal.
// Diät: Wochenschnitt sinkt in 2 Wochen nicht → Senkung wie bisher berechnet (halbe Differenz, höchstens 200 kcal).
function nutOffTrackWeekly(n, c) {
  const W = nutWeekAvgs(n);
  if (!W.ready) return null;
  // v269 (User 2026-11-14): Wer wie geplant zu- oder abnimmt, soll nichts ändern müssen. Wasser lässt zwei Wochenschnitte noch
  // schwanken – deshalb muss die Trendlinie der letzten 3 Wochen (nutTrend) dasselbe zeigen, sonst kein Vorschlag.
  const tr = nutTrend(n, W.weeks * 7 + 7);  // v270: Trendlinie über denselben Zeitraum (Aufbau 5, Diät 3 Wochen)
  if (!tr) return null;
  const reached = n.goalKg != null && n.goalKg !== n.startKg && (W.a - n.startKg) / (n.goalKg - n.startKg) >= 1;  // Ziel erreicht: Stillstand ist richtig
  if (n.phase === 'bulk') {
    if (c.planned <= 0) return null;
    if (W.diff < NUT_FLAT_KG / 2 * W.weeks) return reached || tr.perWeek >= NUT_FLAT_KG / 2 ? null
      : { dir: W.diff <= -NUT_FLAT_KG ? -1 : 0, diff: W.diff, corr: NUT_BULK_STEP, weekly: W };
    const pace = nutPace(n), rich = pace.rate ? pace.rate[1] : 1;
    const pct = W.diff / W.weeks * 4.35 / W.a * 100;  // Zunahme in % des Körpergewichts pro Monat
    const trPct = tr.perWeek * 4.35 / W.a * 100;
    // v266: zu schnell erst über Richtwert UND über der Erwartung (anfangs ist eine schnellere Zunahme normal, sie flacht ab)
    const exp = round1(c.planned * 4.35 / W.a * 100), byExp = exp > rich, max = byExp ? exp : rich;
    // v265: gerundet vergleichen wie angezeigt (sonst „0,8 % … höchstens 0,8 %“)
    return round1(pct) > max && round1(trPct) > max ? { dir: 1, fast: true, pct, max, byExp, diff: W.diff, corr: -NUT_BULK_STEP, weekly: W } : null;
  }
  if (c.planned > -0.15 || reached || W.diff <= -NUT_FLAT_KG || tr.perWeek <= -NUT_FLAT_KG / 2) return null;
  const perWeek = (W.diff - c.planned * W.weeks) / W.weeks;
  const raw = Math.round(-perWeek * NUT_KCAL_KG / 7 / 2 / 50) * 50;
  const corr = Math.max(-200, Math.min(200, raw)) || -100;
  return { dir: W.diff >= NUT_FLAT_KG ? 1 : 0, diff: W.diff, corr: Math.min(corr, -50), weekly: W };
}

// v259: Körperfett im Aufbau höchstens 25 % (Männer) bzw. 33 % (Frauen, +8 Prozentpunkte)
const NUT_BF_MAX = { m: 25, f: 33 };
const nutBfMax = n => NUT_BF_MAX[n && n.sex === 'f' ? 'f' : 'm'];
// Schätzung im Aufbau: Annahme, dass etwa die Hälfte der Zunahme Fett ist. Bezug ist der zuletzt eingetragene Wert
// (bfRef, gespeichert mit Gewicht und Datum), bzw. bei älteren Werten der Beginn des Aufbaus.
function nutBfEstimate(n) {
  if (!n || n.bodyFat == null) return null;
  const ref = n.bfRef || { bf: n.bodyFat, kg: n.startKg, date: n.since };
  const kg = nutWeight();
  const baseKg = ref.date && ref.date >= n.since ? ref.kg : n.startKg;
  if (!kg || !baseKg) return { bf: ref.bf, measured: ref.bf, date: ref.date, est: false };
  const gain = n.phase === 'bulk' ? kg - baseKg : 0;
  const bf = gain > 0 ? (baseKg * ref.bf / 100 + gain / 2) / kg * 100 : ref.bf;
  return { bf, measured: ref.bf, date: ref.date, est: gain >= 0.3 };
}
function nutBfCard(n) {
  if (!nutHintsOn() || n.phase !== 'bulk') return '';
  const e = nutBfEstimate(n);
  const max = nutBfMax(n);
  if (!e || e.bf < max - 2) return '';
  const val = `${e.est ? 'Geschätzt hast du jetzt ca.' : 'Dein eingetragener Körperfettanteil liegt bei'} <b>${fmtNum(Math.round(e.bf))} %</b>`
    + (e.est ? ` (gemessen ${fmtNum(e.measured)} %${e.date ? ` am ${fmtDate(e.date + 'T12:00:00')}` : ''}, die App nimmt an, dass etwa die Hälfte der Zunahme Fett ist)` : '') + '.';
  const lim = `Im Aufbau sollten es ${n.sex === 'f' ? 'bei Frauen' : 'bei Männern'} höchstens ca. ${max} % sein.`;
  const over = Math.round(e.bf) >= max;  // so passt es zur angezeigten (gerundeten) Zahl
  return `<div class="card nut-check off"><p><b>${over ? '⚠️ Körperfett: Grenze für den Aufbau erreicht' : '📏 Körperfett bald an der Grenze'}</b></p>
    <p class="hint nut-small">${val} ${lim} ${over ? 'Jetzt ist ein Minicut oder eine Diät sinnvoll, danach kann der Aufbau weitergehen.' : ''}
      ${e.est ? 'Miss den Wert am besten neu und trag ihn unter „Deine Angaben“ ein, dann rechnet die App damit weiter.' : ''}</p>
    <div class="row">${over ? '<button class="btn primary" data-action="nut-setup">Ernährungsziel wechseln</button>' : ''}
      <button class="btn" data-action="nut-edit">Neuen Wert eintragen</button></div></div>`;
}

const nutConflictText = st => st.step < 0
  ? '🔎 Dein Gewicht sinkt schneller, als deine Einträge erklären. Vielleicht fehlt etwas, z. B. Öl, Getränke oder Snacks. Die App ändert deshalb nichts.'
  : '🔎 Dein Gewicht steigt schneller, als deine Einträge erklären. Vielleicht fehlt etwas, z. B. Öl, Getränke oder Snacks. Die App ändert deshalb nichts.';

// Warnung bei extrem wenig Essen (User-Regel 2026-11-06: immer, auch mit ausgeschalteten Hinweisen). Nur vollständige Tage zählen.
function nutLowIntake(n, c) {
  const full = x => x && x.kcal > 0 && x.src !== 'auto' && (x.src !== 'food' || data.foodClosed[x.date]);
  const lastDays = k => Array.from({ length: k }, (_, i) => intakeOn(addDaysISO(todayISO(), -1 - i))).filter(full);
  const avgOf = L => L.reduce((a, x) => a + x.kcal, 0) / L.length;
  const w = lastDays(7);
  if (w.length >= 4 && avgOf(w) <= nutFloor(n) - 100) return { avg: avgOf(w) };
  const two = lastDays(14).filter(x => !nutPausedOn(x.date));
  if (c && two.length >= 8 && avgOf(two) <= c.kcal - 500 && avgOf(two) <= c.kcal - c.delta - 1000 && !(n.phase === 'minicut')) return { avg: avgOf(two) };
  return null;
}
function nutLowCard(n, c) {
  const low = nutLowIntake(n, c);
  if (!low) return '';
  return `<div class="card nut-check off nut-low"><p><b>⚠️ Du isst im Schnitt nur ${nutKcal(low.avg)} kcal</b></p>
    <p class="hint nut-small">Das ist auf Dauer zu wenig und kann deine Kraft, deine Erholung und deine Gesundheit belasten. Falls etwas fehlt,
      trag es nach. Sonst iss etwas mehr, und sprich bei anhaltender Sorge mit einer Ärztin oder einem Arzt.</p></div>`;
}
// Hinweise und Bewertungen zur Ernährung (abschaltbar in Optionen / im Ernährungs-Reiter)
const nutHintsOn = () => !(data.profile && data.profile.nutHints === false) && !nutPaused();
const nutAge = n => n.age + (new Date().getFullYear() - (n.ageYear || new Date().getFullYear()));

// v374: Körpertyp 'under' | 'normal' | 'over' (= starkes Übergewicht). Gemessener KFA vor Selbsteinschätzung vor BMI.
const nutSexKey = n => n.sex === 'f' ? 'f' : 'm';
const nutBmi = (n, kg) => n.height && kg ? kg / ((n.height / 100) ** 2) : null;
function nutBodyType(n, kg) {
  const s = nutSexKey(n);
  if (n.bodyFat != null) return n.bodyFat < NUT_BF_UNDER[s] ? 'under' : n.bodyFat >= NUT_BF_OVER[s] ? 'over' : 'normal';
  if (NUT_SELF.some(([k]) => k === n.selfEst)) return n.selfEst;
  const bmi = nutBmi(n, kg);
  return bmi == null ? 'normal' : bmi < 18.5 ? 'under' : bmi >= 30 ? 'over' : 'normal';
}
// KFA für Eiweiß und Fett: gemessen, angenommen (Untergewicht/Normal) oder geschätzt (Übergewicht: Deurenberg aus BMI, Alter,
// Geschlecht, mindestens die Grenze zum starken Übergewicht)
function nutBf(n, kg) {
  if (n.bodyFat != null) return { bf: n.bodyFat, src: 'measured' };
  const t = nutBodyType(n, kg), s = nutSexKey(n);
  if (t !== 'over') return { bf: NUT_BF_ASSUME[t][s], src: 'assumed' };
  const est = 1.2 * (nutBmi(n, kg) || 30) + 0.23 * (nutAge(n) || 35) - (s === 'm' ? 10.8 : 0) - 5.4;
  return { bf: Math.round(Math.min(55, Math.max(NUT_BF_OVER[s], est))), src: 'estimated' };
}

// v266 (User 2026-11-14): Im Aufbau macht der Körper mit der Zeit weniger aus dem Überschuss (er verbraucht mehr).
// Bis Woche 4 voller Effekt, danach alle 4 Wochen 15 % weniger, mindestens 40 %. Gezählt ab Beginn des Aufbaus (adaptFrom),
// eine Erhöhung der Kalorien setzt die Uhr zur Hälfte zurück (nutAdaptBump). Nur Erwartung – entscheidend bleibt der Wochenschnitt.
const NUT_ADAPT = { full: 4, per4: 0.15, min: 0.4 };
const nutAdaptWeeks = n => n && (n.adaptFrom || n.since) ? Math.max(0, daysSince(n.adaptFrom || n.since) / 7) : 0;
function nutBulkEff(n) {
  const w = nutAdaptWeeks(n);
  return w <= NUT_ADAPT.full ? 1 : Math.max(NUT_ADAPT.min, 1 - NUT_ADAPT.per4 * (w - NUT_ADAPT.full) / 4);
}
function nutAdaptBump(n, dKcal) {
  if (!n || n.phase !== 'bulk' || !(dKcal > 0)) return;
  const days = Math.round(nutAdaptWeeks(n) * 7);
  n.adaptFrom = addDaysISO(todayISO(), -Math.round(days / 2));
}

// Grundumsatz, Erhaltungsbedarf, Tagesziel und Makros
function nutCalc(n, kg) {
  const age = nutAge(n);
  const lbm = n.bodyFat != null ? kg * (1 - n.bodyFat / 100) : null;
  // mit Körperfett: Katch-McArdle (aus der fettfreien Masse), sonst Mifflin-St Jeor
  const bmr = lbm != null ? 370 + 21.6 * lbm : 10 * kg + 6.25 * n.height - 5 * age + (n.sex === 'm' ? 5 : -161);
  const tdee = bmr * NUT_ACT[n.activity].f;
  // Minicut: nach den Defizit-Wochen eine Woche auf Erhaltung
  const pace = nutPace(n, kg);
  const delta = (n.phase === 'minicut' && nutMinicutStage(n) !== 'cut') || nutBreakNow(n) ? 0 : pace.kcal;
  let note = null;
  const planned = delta * 7 / NUT_KCAL_KG * (n.phase === 'bulk' ? nutBulkEff(n) : 1);  // geplante Veränderung in kg pro Woche (Aufbau: mit Abflachen, v266)
  let kcal = n.kcalOwn != null ? n.kcalOwn + (delta - pace.kcal) : tdee + delta + (n.adjust || 0);
  const floor = n.sex === 'm' ? 1500 : 1200;
  if (kcal < floor) { kcal = floor; note = 'floor'; }
  kcal = Math.round(kcal / 10) * 10;

  // v374: Eiweiß und Fett aus der fettfreien Masse (KFA gemessen, angenommen oder geschätzt, siehe nutBf)
  const bfInfo = nutBf(n, kg), ffm = kg * (1 - bfInfo.bf / 100), type = nutBodyType(n, kg);
  const pMinKg = type === 'over' ? 0 : NUT_PROTEIN_MIN[n.phase];
  const pRaw = Math.max(NUT_PROTEIN_FFM[n.phase] * ffm, pMinKg * kg);
  const pFloor = pMinKg * kg >= NUT_PROTEIN_FFM[n.phase] * ffm;  // Untergrenze je kg Körpergewicht bestimmt das Eiweiß
  const pr = NUT_PROTEIN[n.phase];
  const pLo = Math.round(pRaw * pr.lo / pr.def / 5) * 5, pHi = Math.round(pRaw * pr.hi / pr.def / 5) * 5;
  let protein, fat, carbs;
  if (n.macroPct) {
    // eigene Aufteilung in % der Kalorien
    protein = Math.round(kcal * n.macroPct.p / 100 / 4);
    fat = Math.round(kcal * n.macroPct.f / 100 / 9);
    carbs = Math.round(kcal * n.macroPct.c / 100 / 4);
  } else {
    protein = Math.round(pRaw / 5) * 5;
    const fatShare = n.phase === 'minicut' ? 0.2 : 0.25;
    fat = Math.round(Math.max(NUT_FAT_FFM * ffm, kcal * fatShare / 9) / 5) * 5;
    carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4 / 5) * 5);
  }
  return { age, lbm, bmr, tdee, delta, planned, kcal, note, protein, fat, carbs, pLo, pHi, ffm, bf: bfInfo, type, pFloor, pMinKg };
}

// Trend der letzten 3 Wochen in kg pro Woche (lineare Regression) – frühestens ab Tag 8 der Phase
// (die ersten Tage verschiebt vor allem Wasser) bzw. ab der letzten Anpassung
function nutTrend(n, days = 21) {
  // nach einer Erhaltungswoche (Deload) geht erst eine Woche lang Wasser runter – danach zählen
  const from = [addDaysISO(n.since, 7), n.adjustAt || '', n.breakEnd ? addDaysISO(n.breakEnd, 7) : '', addDaysISO(todayISO(), -days)].sort().pop();
  const pts = data.bodyweight.filter(b => b.date.slice(0, 10) >= from && !nutWaterDay(b.date.slice(0, 10)))
    .map(b => ({ x: Date.parse(b.date) / DAY, y: b.kg }));
  if (pts.length < 4) return null;
  const xs = pts.map(p => p.x);
  const span = Math.max(...xs) - Math.min(...xs);
  if (span < 10) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / pts.length;
  const my = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  const sxx = pts.reduce((a, p) => a + (p.x - mx) ** 2, 0);
  const sxy = pts.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0);
  return { perWeek: sxy / sxx * 7, days: Math.round(span) };
}

// Schalter für alle Bewertungen und Vorschläge zur Ernährung (auch in den Optionen)
function nutHintsCard() {
  const on = nutHintsOn();
  return `<div class="card nut-hints-card">
      <h2>Hinweise zur Ernährung</h2>
      <div class="seg two"><button class="${on ? 'on' : ''}" data-action="nut-hints" data-v="1">An</button>
        <button class="${on ? '' : 'on'}" data-action="nut-hints" data-v="0">Aus</button></div>
      <p class="hint explain nut-small">Die App bewertet, was du isst, und schlägt Änderungen vor: Gewichtsverlauf, gemessener Bedarf
        und die Haken bei „Gegessen“ im Ernährungstagebuch. Manche Menschen setzt so etwas unter Druck, etwa,
        wenn man ohnehin sehr auf Zahlen achtet oder schon einmal Schwierigkeiten mit dem Essen hatte. <b>Aus</b> heißt: Die App zeigt
        nur noch dein Tagesziel und was du eingetragen hast, ohne Bewertung, ohne Warnungen und ohne Vorschläge. Dein Ernährungsziel,
        Erhaltungswochen und dein Training laufen ganz normal weiter. Du kannst es jederzeit wieder einschalten.</p>
    </div>`;
}

// Vorschlag für die Aktivitätsstufe aus Schritten (letzte 14 Tage) und Trainings (letzte 4 Wochen)
function nutActivityGuess() {
  const from = addDaysISO(todayISO(), -14);
  const steps = data.steps.filter(s => s.date >= from);
  const avg = steps.length >= 3 ? steps.reduce((a, s) => a + s.steps, 0) / steps.length : null;
  const since = addDaysISO(todayISO(), -28);
  const perWeek = data.sessions.filter(s => s.date.slice(0, 10) >= since).length / 4;
  if (avg == null && !data.sessions.length) return null;
  let lvl = 1;
  if (perWeek >= 1 || avg >= 5000) lvl = 2;
  if ((perWeek >= 3 && (avg == null || avg >= 7500)) || avg >= 10000) lvl = 3;
  if (perWeek >= 5 && avg >= 10000) lvl = 4;
  return { lvl, avg, perWeek };
}

/* ---------- Einrichtung ---------- */

function nutInit(view) {
  const n = data.nutrition;
  const level = data.plans.length && activePlan().level;
  nutDraft = n ? { ...n, sex: n.sex || profileSex(), kg: nutWeight() } : {
    sex: profileSex(), age: null, ageYear: new Date().getFullYear(), height: null, bodyFat: null, activity: null,
    phase: null, pace: null, goalKg: null, weeks: 4, kg: nutWeight(),
  };
  nutDraft.level = level;
  for (const k of ['age', 'height', 'bodyFat', 'kg', 'goalKg']) nutDraft[k] = nutDraft[k] == null ? '' : fmtNum(nutDraft[k]);
  nutDraft.flow = view;  // 'nutphase' = mit Phasenwahl, 'nutbody' = nur Angaben ändern
  // v266 (User 2026-11-14): bei den Angaben aktiv nach den Hinweisen fragen (null = noch nicht entschieden)
  nutDraft.hints = data.profile && typeof data.profile.nutHints === 'boolean' ? data.profile.nutHints : null;
}

const NUT_CANCEL = {
  ask: 'Einrichtung abbrechen?\n\nDeine Eingaben werden nicht gespeichert.',
  run: () => { nutDraft = null; go('nutrition'); },
};

// Eingaben des Entwurfs als Zahlen (leer -> null)
function nutNumbers(d) {
  const num = k => (String(d[k]).trim() === '' ? null : parseNum(d[k]));
  return { ...d, age: num('age'), height: num('height'), bodyFat: num('bodyFat'), kg: num('kg'), goalKg: num('goalKg') };
}

function nutBodyErrors(d) {
  if (!d.sex) return 'Bitte Mann oder Frau auswählen.';
  if (d.age == null || d.age < 14 || d.age > 99) return 'Bitte dein Alter eintragen (14–99 Jahre).';
  if (d.height == null || d.height < 120 || d.height > 230) return 'Bitte deine Größe in cm eintragen (z. B. 178).';
  if (d.kg == null || d.kg < 30 || d.kg > 300) return 'Bitte dein aktuelles Gewicht in kg eintragen.';
  if (d.bodyFat != null && (d.bodyFat < 3 || d.bodyFat > 60)) return 'Der Körperfettanteil muss zwischen 3 und 60 % liegen, oder lass das Feld leer.';
  if (!d.activity) return 'Bitte deine Aktivität im Alltag auswählen.';
  return null;
}

const NUT_HELP = `<summary>Unsicher? So findest du dein Ernährungsziel</summary>
      <ul>
        <li><b>Neu im Training oder nach langer Pause</b> → Body Recomposition</li>
        <li><b>Eher schlank und du willst mehr Muskeln</b> → Aufbau</li>
        <li><b>Deutlich zu viel Körperfett</b> → Diät</li>
        <li><b>Im Aufbau zu viel Fett angesetzt</b> → Minicut, danach weiter Aufbau</li>
      </ul>
      <p class="hint">Faustregel: Bist du mit deinem Körperfett zufrieden, baue auf. Wenn nicht, nimm erst ab.</p>`;

// Grundlagen einer ausgewogenen Ernährung (User-Wunsch 2026-11-03): beim ersten Mal aufgeklappt, nach „Verstanden“ bzw.
// dem ersten Zuklappen dauerhaft zu (data.profile.nutBasicsSeen) – lässt sich jederzeit wieder aufklappen.
// kcal: Tagesziel (falls bekannt) für die persönliche Ballaststoff-Menge, kg: Körpergewicht für die Trinkmenge.
// Bewusst ohne Obergrenzen („nicht zu viel“ statt Höchstmengen, User-Wunsch 2026-11-03).
function nutBasicsCard(kcal, kg) {
  const seen = !!(data.profile && data.profile.nutBasicsSeen) || !nutHintsOn();
  const fiber = kcal ? Math.round(kcal / 100) : null;  // 10 g je 1.000 kcal
  const water = kg ? fmtNum(round1(kg / 20)) : null;   // 1 Liter je 20 kg Körpergewicht
  const waterOz = kg ? deNum(Math.round(kg / 20 * 33.814 / 5) * 5) : null;  // v303: bei lb in fl oz (gleiche Menge)
  // v207: immer eingeklappt (steht jetzt als Zeile ganz unten)
  return `<details class="card nut-help nut-basics">
      <summary data-action="nut-basics-sum">🥗 Grundlagen: gut und ausgewogen essen</summary>
      <p>Kalorien und Eiweiß bestimmen, ob du ab- oder zunimmst und Muskeln aufbaust. <b>Wie gesund</b> du isst, hängt aber
        vor allem davon ab, <b>was</b> auf dem Teller liegt. Diese Faustregeln helfen:</p>
      <ul>
        <li><b>🥦 Gemüse und Obst:</b> jeden Tag mindestens <b>250 g Gemüse</b> und <b>250 g Obst</b>, etwa 3 Handvoll Gemüse
          und 2 Handvoll Obst. Möglichst bunt gemischt; Tiefkühlware zählt genauso.</li>
        <li><b>🌾 Ballaststoffe:</b> mindestens <b>10 g je 1.000 kcal</b>${fiber ? `, bei deinem Tagesziel also ca. <b>${fiber} g</b>` : ''}.
          Mehr ist ausdrücklich gut. Gute Quellen: Haferflocken, Vollkornbrot und -nudeln, Hülsenfrüchte (Linsen, Bohnen,
          Kichererbsen), Gemüse, Obst, Nüsse und Leinsamen. Langsam steigern und genug dazu trinken.</li>
        <li><b>🥚 Eiweiß zu jeder Mahlzeit:</b> z. B. Magerquark, Skyr, Joghurt, Eier, Fisch, Geflügel, Hülsenfrüchte oder Tofu.</li>
        <li><b>🥓 Verarbeitete Fleischprodukte meiden:</b> Wurst, Salami, Schinken, Speck und Würstchen nur selten. Sie erhöhen
          nachweislich das Risiko für Darmkrebs und Herz-Kreislauf-Erkrankungen. Auch rotes Fleisch (Rind, Schwein, Lamm) lieber
          nicht zu oft. Fisch 1–2× pro Woche, davon gern einmal fetter Seefisch (Lachs, Hering, Makrele).</li>
        <li><b>🫒 Gute Fette:</b> Raps- und Olivenöl, Nüsse, Samen und Fisch. Frittiertes, Fast Food und viel Butter oder
          Sahne eher selten.</li>
        <li><b>🍬 Nicht zu viel Zucker und Salz:</b> Softdrinks, Säfte, Süßigkeiten und Gebäck sparsam, beim Salzen lieber
          zurückhaltend. Fertiggerichte enthalten oft viel von beidem. Faustregel: je kürzer die Zutatenliste, desto besser.</li>
        <li><b>💧 Trinken:</b> ${unitLb() ? `etwa <b>¾ fl oz je lb Körpergewicht</b>${waterOz ? `, bei dir also ca. <b>${waterOz} fl oz</b>` : ''}`
          : `etwa <b>1 Liter je 20 kg Körpergewicht</b>${water ? `, bei dir also ca. <b>${water} Liter</b>` : ''}`}
          am Tag, am besten Wasser oder ungesüßter Tee. An Trainingstagen und bei Hitze etwas mehr. Alkohol nicht zu viel.</li>
        <li><b>⚖️ Kein Alles-oder-nichts:</b> Es zählt, was du an den meisten Tagen isst. Wenn rund 80 % passen, ist auch mal
          Kuchen, Pizza oder ein Grillabend völlig in Ordnung.</li>
      </ul>
      ${seen ? '' : '<button class="btn center" data-action="nut-basics-ok">✔ Verstanden, zuklappen</button>'}
      <p class="hint nut-small">Allgemeine Empfehlungen für gesunde Erwachsene (angelehnt an DGE und WHO). Bei Erkrankungen
        oder Unverträglichkeiten bitte ärztlich beraten lassen.</p>
    </details>`;
}

const nutStep = (no, of) => `<p class="sub">Schritt ${no} von ${of}</p>`;

function renderNutPhase() {
  if (!nutDraft) nutInit('nutphase');
  const d = nutDraft;
  // v374: Angaben schon bekannt (z. B. Phase wechseln) und Untergewicht: kein Minicut
  const nb = nutNumbers(d), under = !nutBodyErrors(nb) && nutBodyType(nb, nb.kg) === 'under';
  const more = (p, ph) => `<details class="nut-more"><summary>Ausführlich: ${ph.label}</summary>
      ${ph.long.map(([t, x]) => `<p><b>${t}:</b> ${x}</p>`).join('')}
      <button class="btn outline" data-action="nut-phase" data-p="${p}">${ph.label} wählen</button>
    </details>`;
  return `<div class="card wiz-q">
      ${nutStep(1, 3)}
      <div class="wiz-q-head"><span class="wiz-q-icon" aria-hidden="true">🧭</span><h2>Was ist dein Ernährungsziel?</h2></div>
      <p class="hint wiz-q-explain">Davon hängt ab, ob du mehr oder weniger essen solltest, als du verbrauchst. Unter jedem Ziel
        kannst du eine ausführliche Erklärung aufklappen.</p>
      ${Object.entries(NUT_PHASES).filter(([p]) => p !== 'minicut' || ((feat('nut-minicut') || d.phase === p) && !under)).map(([p, ph]) => `<button class="split-opt cat ${d.phase === p ? 'on' : ''}" data-action="nut-phase" data-p="${p}">
          <span class="cat-icon">${ph.icon}</span><b>${ph.label}</b><small>${ph.short}</small></button>${more(p, ph)}`).join('')}
    </div>
    <details class="card nut-help">${NUT_HELP}</details>`;
}

function renderNutBody() {
  if (!nutDraft) nutInit('nutbody');
  const d = nutDraft;
  const n = nutNumbers(d);
  const inp = (k, ph, mode = 'decimal') => `<input class="inp kg" type="text" inputmode="${mode}" autocomplete="off"
      data-field="nut-in" data-k="${k}" value="${esc(d[k])}" placeholder="${ph}">`;
  const guess = nutActivityGuess();
  const guessText = guess ? [guess.perWeek ? `ca. ${fmtNum(round1(guess.perWeek))} Trainings pro Woche` : null,
    guess.avg != null ? `Ø ${deNum(Math.round(guess.avg / 100) * 100)} Schritte am Tag` : null].filter(Boolean).join(' und ') : '';
  // Gerade Diät/Minicut gewählt: kurzer Hinweis, dass sich das Defizit aufs Training auswirkt (User-Wunsch 2026-11-03)
  const cut = d.flow === 'nutphase' && (d.phase === 'diet' || d.phase === 'minicut');
  const cutNote = !cut ? '' : `<p class="deload-note">🏋️ <b>Gut zu wissen:</b> Im Kaloriendefizit erholst du dich nicht mehr ganz so gut.
      Kraft und Wiederholungen können eine Zeit lang stagnieren oder leicht sinken, und ein Satz geht öfter mal knapp
      daneben. Das ist normal und kein Rückschritt. Versuche dich trotzdem so lange wie möglich noch zu steigern oder deine Leistung zu halten. ${feat('nut-train-q')
        ? 'Im letzten Schritt kannst du festlegen, ob die App dein Training daran anpasst.'
        : 'Die App passt dein Training deshalb automatisch an (weniger zusätzliche Sätze, Gewichte halten).'}
      ${d.phase === 'minicut' ? `<br>⚡ ${NUT_MINICUT_SHORT}` : ''}</p>`;
  return `${cutNote}<div class="card wiz-q">
      ${d.flow === 'nutphase' ? nutStep(2, 3) : ''}
      <div class="wiz-q-head"><span class="wiz-q-icon" aria-hidden="true">📏</span><h2>Deine Angaben</h2></div>
      <p class="hint wiz-q-explain">Daraus schätzt die App deinen Kalorienbedarf. Die Daten bleiben nur auf deinem Handy.</p>
      <div class="seg">${[['m', 'Mann'], ['f', 'Frau']].map(([k, l]) =>
        `<button class="${d.sex === k ? 'on' : ''}" data-action="nut-sex" data-k="${k}">${l}</button>`).join('')}</div>
      <label class="row"><span>Alter</span>${inp('age', 'Jahre', 'numeric')}</label>
      <label class="row"><span>Größe</span>${inp('height', 'cm', 'numeric')}</label>
      <label class="row"><span>Gewicht</span>${inp('kg', 'kg')}</label>
      <label class="row"><span>Körperfett <small class="hint">(optional)</small></span>${inp('bodyFat', '%')}</label>
      <p class="hint nut-small explain">Kennst du deinen Körperfettanteil (z. B. von einer Körperfettwaage), wird die Rechnung genauer.
        Sonst einfach leer lassen. Wenn du magst, kannst du ihn auch ungefähr anhand von Vergleichsbildern aus dem Internet
        abschätzen (z. B. nach „Körperfettanteil Vergleichsbilder ${n.sex === 'f' ? 'Frauen' : 'Männer'}“ suchen).</p>
      <p class="lbl chips-title">Wie schätzt du dich ein? <small class="hint">(optional)</small></p>
      <div class="seg nut-self">${NUT_SELF.map(([k, l]) => `<button class="${d.selfEst === k ? 'on' : ''}" data-action="nut-self" data-k="${k}">${l}</button>`).join('')}</div>
      <p class="hint nut-small explain">Hilft, wenn du deinen Körperfettanteil nicht kennst. Der BMI unterscheidet nicht zwischen Muskeln
        und Fett: Hast du viel Muskulatur, wähle „Normal“. Ein eingetragener Körperfettanteil gilt immer zuerst.</p>
    </div>
    <div class="card wiz-q nut-hints-q">
      <div class="wiz-q-head"><span class="wiz-q-icon" aria-hidden="true">🔔</span><h2>Hinweise zur Ernährung</h2></div>
      <p class="hint wiz-q-explain">Soll die App bewerten, was du isst, und dir Vorschläge machen? Dazu gehören Haken bei erreichten Zielen,
        Hinweise zu deinem Gewichtsverlauf und zum Körperfett. Manche Menschen setzt so etwas unter Druck, etwa wenn man ohnehin sehr auf Zahlen
        achtet oder schon einmal Schwierigkeiten mit dem Essen hatte. Ohne Hinweise siehst du nur dein Tagesziel und deine Einträge.
        Du kannst es jederzeit in den Optionen ändern.</p>
      ${[[true, 'Ja, mit Hinweisen', 'Bewertung, Vorschläge und Warnungen'], [false, 'Nein, ohne Hinweise', 'Nur Tagesziel und Einträge, ohne Bewertung']].map(([v, l, s]) =>
        `<button class="split-opt ${d.hints === v ? 'on' : ''}" data-action="nut-hints-pick" data-v="${v ? 1 : 0}"><b>${l}</b><small>${s}</small></button>`).join('')}
    </div>
    <div class="card wiz-q">
      <div class="wiz-q-head"><span class="wiz-q-icon" aria-hidden="true">🚶</span><h2>Wie aktiv bist du?</h2></div>
      <p class="hint wiz-q-explain explain">Gemeint ist alles zusammen: Alltag, Arbeit und Training. Wenn du schwankst, nimm lieber die
        niedrigere Stufe. Die meisten schätzen sich zu aktiv ein.${guess ? ` <span class="act-guess">Vorschlag aus deinen Daten${guessText ? ` (${guessText})` : ''}: <b>${NUT_ACT[guess.lvl].label}</b>.</span>` : ''}</p>
      ${Object.entries(NUT_ACT).map(([k, a]) => `<button class="split-opt ${String(d.activity) === k ? 'on' : ''}" data-action="nut-act" data-k="${k}">
          ${guess && guess.lvl === Number(k) ? '<span class="split-tag">Vorschlag</span>' : ''}<b>${a.label}</b><small>${a.text}</small></button>`).join('')}
    </div>
    <div class="row"><button class="btn" data-action="back">Zurück</button>
      <button class="btn primary" data-action="nut-body-next">${d.flow === 'nutphase' ? 'Weiter' : 'Weiter zu Ziel & Tempo'}</button></div>`;
}

function renderNutGoal() {
  if (!nutDraft || !nutDraft.phase || nutBodyErrors(nutNumbers(nutDraft))) {
    if (!nutDraft) nutInit('nutphase');
    current.view = nutDraft.phase ? 'nutbody' : 'nutphase';
    return views[current.view].render();
  }
  const d = nutDraft;
  // Anpassung aus dem Gewichtsverlauf gilt nur, solange die Phase bleibt
  // Anpassung aus dem Gewichtsverlauf und Phasenbeginn gelten nur, solange die Phase bleibt
  const same = data.nutrition && data.nutrition.phase === d.phase;
  const keepOwn = same && data.nutrition.pace === d.pace;  // eigenes Tagesziel gilt nur bei gleicher Phase und gleichem Tempo
  const n = { ...nutNumbers(d), adjust: same ? data.nutrition.adjust : 0, kcalOwn: keepOwn ? data.nutrition.kcalOwn : null,
    since: same ? data.nutrition.since : todayISO() };
  const ph = NUT_PHASES[d.phase];
  const c = nutCalc(n, n.kg);
  const paces = nutPaces(d.phase, nutBodyType(n, n.kg)).map(p => {  // v374: Tempo je Körpertyp
    const kgWeek = p.kcal * 7 / NUT_KCAL_KG;
    const kcal = p.range ? `${nutSigned(p.range[0], '').trim()} bis ${nutSigned(p.range[1], 'kcal')}` : p.rate ? `ca. ${nutSigned(p.kcal, 'kcal')}` : nutSigned(p.kcal, 'kcal');  // v380: Spanne
    // Aufbau: Richtwert in % des Körpergewichts pro Monat (v258), sonst pro Woche
    const kgMon = pct => n.kg ? fmtNum(round1(n.kg * pct / 100)) : null;
    const rateTxt = r => kgMon(r[1]) ? `Ziel ${r[0] ? `+${kgMon(r[0])} bis +${kgMon(r[1])}` : `höchstens +${kgMon(r[1])}`} kg im Monat`
      : `Ziel ${r[0] ? `${fmtNum(r[0])} bis ${fmtNum(r[1])}` : `höchstens ${fmtNum(r[1])}`} % im Monat`;
    const info = !p.kcal ? `${kcal} | Gewicht bleibt gleich`
      : p.rate ? `${kcal} | ${rateTxt(p.rate)}`
      : `${kcal} | ≈ ${nutSigned(kgWeek, 'kg')} pro Woche`;
    return `<button class="split-opt ${d.pace === p.k ? 'on' : ''}" data-action="nut-pace" data-k="${p.k}">
        <b>${p.label}</b><small><b class="nut-pace-info">${info}</b>${p.text}</small></button>`;
  }).join('');
  const goal = d.phase === 'recomp' ? ''
    : `<label class="row"><span>Zielgewicht <small class="hint">(optional)</small></span>
        <input class="inp kg" type="text" inputmode="decimal" autocomplete="off" data-field="nut-in" data-k="goalKg"
          value="${esc(d.goalKg)}" placeholder="kg"></label>`;
  const weeks = d.phase !== 'minicut' ? '' : `<p class="lbl chips-title">Dauer (höchstens ${NUT_MINICUT_MAX} Wochen am Stück)</p>
      <div class="variants count">${[2, 3, 4].map(w => `<button class="vchip ${Math.min(d.weeks, NUT_MINICUT_MAX) === w ? 'on' : ''}"
        data-action="nut-weeks" data-w="${w}">${w} Wochen</button>`).join('')}</div>
      ${nutMinicutNote(Math.min(d.weeks || NUT_MINICUT_MAX, NUT_MINICUT_MAX))}`;
  return `<div class="card wiz-q">
      ${d.flow === 'nutphase' ? nutStep(3, 3) : ''}
      <div class="wiz-q-head"><span class="wiz-q-icon" aria-hidden="true">${ph.icon}</span><h2>${ph.label}: Ziel & Tempo</h2></div>
      <p class="hint wiz-q-explain">Wie schnell soll es gehen? Ausgangspunkt ist dein geschätzter Erhaltungsbedarf von
        <b>${nutKcal(c.tdee)} kcal</b> pro Tag.</p>
      ${feat('nut-pace') ? paces : `<p class="hint nut-small">Tempo: <b>${nutPace(d).label}</b>, der gute Mittelweg für die meisten.</p>`}
      ${d.phase === 'bulk' && nutHintsOn() && n.bodyFat != null && n.bodyFat >= nutBfMax(n) ? `<p class="nut-warn">Mit ${fmtNum(n.bodyFat)} % Körperfett liegst du
        schon über der Grenze für einen Aufbau (Männer ca. 25 %, Frauen ca. 33 %). Besser erst eine Diät oder Body Recomposition, danach aufbauen.</p>` : ''}
      ${weeks}
      ${goal}
    </div>
    ${nutTrainQuestion(d)}
    ${nutTrainDayQuestion(d)}
    ${nutTargetCard(n, c)}
    <div class="row"><button class="btn" data-action="back">Zurück</button>
      <button class="btn primary" data-action="nut-save">Speichern</button></div>`;
}

/* ---------- Übersicht ---------- */

let nutMacroEdit = null;  // eigene Aufteilung wird gerade eingetippt: { p, f, c } als Text, kcal

const NUT_MACROS = [['p', 'Eiweiß', 4], ['f', 'Fett', 9], ['c', 'Kohlenhydrate', 4]];

// Aktuelle Aufteilung in ganzen Prozent (Summe 100)
function nutPctOf(c) {
  const p = Math.round(c.protein * 4 / c.kcal * 100), f = Math.round(c.fat * 9 / c.kcal * 100);
  return { p, f, c: 100 - p - f };
}

// Eiweiß-Spanne mit Erklärung; persönlicher Hinweis, wenn eher der obere Rand passt
function nutProteinNote(n, c) {
  const pr = NUT_PROTEIN[n.phase];
  const why = [nutAge(n) >= 50 ? 'du über 50 bist' : null,
    n.bodyFat != null && n.bodyFat < (n.sex === 'm' ? 15 : 23) ? 'du wenig Körperfett hast' : null].filter(Boolean);
  const low = c.protein < c.pLo - 2;
  const kg = n.kg || nutWeight();
  // v374: Spanne je kg Körpergewicht (gerechnet wird über die fettfreie Masse, siehe nutCalc)
  const perKg = v => perKgDisp(round1(v / kg));
  return `<p class="nut-protein ${low ? 'low' : 'explain'}"><b>Eiweiß-Empfehlung: ${c.pLo}–${c.pHi} g am Tag</b>
      ${kg ? `(${perKg(c.pLo)}–${perKg(c.pHi)} g pro kg Körpergewicht).` : ''}
      ${low ? 'Dein Eiweiß liegt gerade darunter. ' : ''}Orientiere dich eher am oberen Rand, wenn du relativ wenig Körperfett hast,
      älter bist (ab ca. 50) oder dich vegan ernährst. Pflanzliches Eiweiß verwertet der Körper etwas schlechter.
      ${why.length ? `<b>Bei dir passt eher der obere Rand, weil ${why.join(' und ')}.</b>` : ''}</p>`;
}

// Eingabe der eigenen Aufteilung (Gramm und Summe werden beim Tippen aktualisiert, siehe nutPctUpdate)
function nutPctEditor() {
  const e = nutMacroEdit;
  return `<div class="nut-pct">
      <p class="hint nut-small">Teile deine ${nutKcal(e.kcal)} kcal selbst auf, zusammen 100 %.</p>
      ${NUT_MACROS.map(([k, l]) => `<label class="row nut-pct-row ${k}"><span>${l}</span>
        <input class="inp kg" type="text" inputmode="decimal" autocomplete="off" data-field="nut-pct" data-k="${k}" value="${esc(e[k])}">
        <em>%</em><b id="nut-pct-${k}"></b></label>`).join('')}
      <p class="nut-pct-sum" id="nut-pct-sum"></p>
      <div class="row"><button class="btn" data-action="nut-pct-cancel">Abbrechen</button>
        <button class="btn primary" data-action="nut-pct-save">Übernehmen</button></div>
    </div>`;
}

function nutPctUpdate() {
  const e = nutMacroEdit;
  if (!e) return;
  let sum = 0;
  for (const [k, , f] of NUT_MACROS) {
    const v = parseNum(e[k]) || 0;
    sum += v;
    const el = document.getElementById('nut-pct-' + k);
    if (el) el.textContent = `= ${Math.round(e.kcal * v / 100 / f)} g`;
  }
  const s = document.getElementById('nut-pct-sum');
  if (!s) return;
  sum = round1(sum);
  s.textContent = sum === 100 ? 'Summe: 100 % ✔' : `Summe: ${fmtNum(sum)} %: ${sum < 100 ? `es fehlen noch ${fmtNum(round1(100 - sum))}` : `${fmtNum(round1(sum - 100))} zu viel`} %`;
  s.classList.toggle('off', sum !== 100);
}

// Tagesziel ohne jede Anpassung (nur aus den Angaben) – Basis für eine eigene Kalorienzahl
const nutKcalBase = (n, kg) => nutCalc({ ...n, adjust: 0, kcalOwn: null }, kg).kcal;

// Vorschau beim Ändern: Makros für die eingetippte Kalorienzahl
function nutKcalPreview(n, kg, v) {
  const floor = n.sex === 'm' ? 1500 : 1200;
  if (v == null || v < floor || v > 6000) {
    return v != null && v < floor ? `Weniger als ${deNum(floor)} kcal empfiehlt die App nicht, sonst fehlen schnell Nährstoffe.` : 'Bitte eine Kalorienzahl eintragen.';
  }
  const c = nutCalc({ ...n, kcalOwn: v }, kg);
  return `Dann: <b>Eiweiß ${c.protein} g | Fett ${c.fat} g | Kohlenhydrate ${c.carbs} g</b>`;
}

function nutKcalEditor(n, c, kg) {
  const v = parseNum(nutKcalEdit.v);
  const base = nutKcalBase(n, kg);
  return `<div class="nut-kcal-editor">
      <label class="row"><span>Kalorien pro Tag</span>
        <input class="inp kg" id="nut-kcal-in" type="text" inputmode="numeric" autocomplete="off" data-field="nut-kcal" value="${esc(nutKcalEdit.v)}"></label>
      <div class="variants">${[-100, -50, 50, 100].map(d => `<button class="vchip" data-action="nut-kcal-step" data-d="${d}">${d > 0 ? '+' : '−'}${Math.abs(d)}</button>`).join('')}</div>
      <p class="hint nut-small" id="nut-kcal-prev">${nutKcalPreview(n, kg, v)}</p>
      <p class="hint nut-small">${n.macroPct ? 'Alle Makros behalten deine eigene Aufteilung in %.'
        : 'Eiweiß bleibt gleich (es richtet sich nach deinem Körpergewicht), der Unterschied geht auf Kohlenhydrate und Fett.'}
        Berechnet wären ${nutKcal(base)} kcal. Dein Wert bleibt fest, bis du ihn wieder änderst.</p>
      <div class="row"><button class="btn" data-action="nut-kcal-cancel">Abbrechen</button>
        <button class="btn primary" data-action="nut-kcal-save">Übernehmen</button></div>
    </div>`;
}

// editable: in der Übersicht lassen sich die Makros in % selbst festlegen (nicht in der Vorschau beim Einrichten)
function nutTargetCard(n, c, editable = false) {
  const notes = {
    floor: `Weniger als ${deNum(n.sex === 'm' ? 1500 : 1200)} kcal empfiehlt die App nicht, sonst fehlen schnell Nährstoffe.`,
  };
  const adj = n.kcalOwn != null ? '' : n.adjust ? ` | inkl. ${nutSigned(n.adjust, 'kcal')} aus deinem Gewichtsverlauf` : '';
  const pct = nutPctOf(c);
  const kg = n.kg || nutWeight();
  const fatLow = c.ffm && c.fat < NUT_FAT_WARN_FFM * c.ffm;  // v374: wie die Rechnung über die fettfreie Masse
  let macros;
  if (editable && nutMacroEdit) macros = nutPctEditor();
  else if (!feat('nut-macros')) {
    // Einfach: nur Kalorien und Eiweiß
    macros = `<div class="nut-macros one"><div class="nut-macro p"><span>Eiweiß</span><b>${c.protein} g</b><small>am Tag</small></div></div>`;
  } else {
    macros = `<div class="nut-macros">
        ${NUT_MACROS.map(([k, l, f]) => {
          const g = { p: c.protein, f: c.fat, c: c.carbs }[k];
          return `<div class="nut-macro ${k}"><span>${l}</span><b>${g} g</b><small>${pct[k]} % | ${nutKcal(g * f)} kcal</small></div>`;
        }).join('')}
      </div>
      <div class="nut-bar" aria-hidden="true">${[['p', c.protein * 4], ['f', c.fat * 9], ['c', c.carbs * 4]].map(([k, v]) =>
        `<div class="${k}" style="flex:${v}"></div>`).join('')}</div>
      ${fatLow ? `<p class="nut-warn">Sehr wenig Fett: Auf Dauer sollten es mindestens ca. ${Math.round(NUT_FAT_WARN_FFM * c.ffm / 5) * 5} g am Tag sein (u. a. für die Hormone).</p>` : ''}
      ${editable && feat('nut-macro-pct') ? `<div class="nut-macro-btns">${n.macroPct
        ? `<span class="hint">Eigene Aufteilung ${n.macroPct.p} / ${n.macroPct.f} / ${n.macroPct.c} %</span>
           <button class="btn" data-action="nut-pct-edit">Ändern</button>
           <button class="btn" data-action="nut-pct-reset">App-Empfehlung</button>`
        : '<button class="btn" data-action="nut-pct-edit">Makros selbst festlegen (in %)</button>'}</div>` : ''}`;
  }
  return `<div class="card nut-target">
      <span class="lbl">Dein Tagesziel</span>
      <div class="nut-kcal-row"><b class="nut-kcal">${nutKcal(c.kcal)} kcal</b>
        ${editable && !nutKcalEdit && feat('nut-own-kcal') ? '<button class="btn nut-kcal-btn" data-action="nut-kcal-edit">✎ Ändern</button>' : ''}</div>
      <small>${n.kcalOwn != null ? `Von dir festgelegt | berechnet wären ca. ${nutKcal(nutKcalBase(n, n.kg || nutWeight()))} kcal`
        : `Erhaltungsbedarf ca. ${nutKcal(c.tdee)} kcal | ${nutSigned(c.delta, 'kcal')}${adj}`}</small>
      ${editable && nutKcalEdit ? nutKcalEditor(n, c, n.kg || nutWeight()) : ''}
      ${editable ? nutCardioLine(n, c) : ''}
      ${editable && !nutKcalEdit && n.kcalOwn != null ? '<button class="btn nut-kcal-reset" data-action="nut-adjust-reset">↺ Wieder den Wert der App nehmen</button>' : ''}
      ${c.note ? `<p class="nut-warn">${notes[c.note]}</p>` : ''}
      ${macros}
      ${feat('nut-protein-detail') ? nutProteinNote(n, c) : ''}
      <p class="nut-relax explain">😌 <b>Kein Stress:</b> Du musst diese Werte nicht aufs Gramm genau treffen. Entscheidend ist, dass Kalorien
        und Eiweiß über die Woche gesehen ungefähr passen, ±10 % sind völlig in Ordnung. Ein Tag mit mehr Kohlenhydraten oder
        weniger Fett macht nichts kaputt; wichtig ist, was du an den meisten Tagen isst.</p>
    </div>`;
}

// v260: Tagesziel anpassen im Ernährungstagebuch (heute): aufklappbar unter „Gegessen“
let foodGoalOpen = false;
// Tagesziel im Tagebuch anpassbar? (ohne Plan, Pause, fehlende Angaben)
function nutGoalEditable() {
  const n = data.nutrition;
  return !!n && nutReady(n) && nutWeight() != null && !nutPaused(n) && !(typeof nutPlanActive === 'function' && nutPlanActive());
}
// v287 (User-Wunsch): keine eigene Zeile „🎯 Tagesziel“ mehr; geöffnet wird über die Zielzahl oben („860 / 3.020 kcal ✎“)
function nutGoalToolsHtml() {
  const n = data.nutrition, kg = nutWeight();
  if (!nutGoalEditable()) return '';
  const c = nutCalc(n, kg);
  const open = foodGoalOpen || !!nutKcalEdit || !!nutMacroEdit;
  // v322 (User-Wunsch): großer, beschrifteter Knopf statt nur des kleinen ✎ an der Zielzahl
  if (!open) return `<button class="btn fe-goal-open" data-action="fe-goal-toggle" aria-expanded="false">🎯 ${feat('nut-macros') ? 'Kalorien und Makros anpassen' : 'Tagesziel anpassen'}</button>`;
  const head = `<button class="fe-goal-btn" data-action="fe-goal-toggle" aria-expanded="true"><span>🎯 Tagesziel anpassen</span>
      <small>zuklappen ▴</small></button>`;
  const adj = n.kcalOwn != null ? '' : n.adjust ? ` | inkl. ${nutSigned(n.adjust, 'kcal')} aus deinem Gewichtsverlauf` : '';
  const pct = nutPctOf(c);
  const fatLow = c.ffm && c.fat < NUT_FAT_WARN_FFM * c.ffm;  // v374
  // v327 (User-Wunsch): oben groß das aktuelle Tagesziel (wie im Kalorien-Editor), darunter die Makros als große Kacheln
  const kcalBox = nutKcalEdit ? nutKcalEditor(n, c, kg) : `<div class="fe-goal-kcal">
      <span class="fe-goal-kcal-l">Kalorien pro Tag</span><b class="fe-goal-kcal-v">${nutKcal(c.kcal)} kcal</b>
      <p class="hint nut-small">${n.kcalOwn != null ? `Von dir festgelegt | berechnet wären ca. ${nutKcal(nutKcalBase(n, kg))} kcal`
        : `Erhaltungsbedarf ca. ${nutKcal(c.tdee)} kcal | ${nutSigned(c.delta, 'kcal')} für „${nutPace(n).label}“${adj}`}</p>
      <div class="row fe-goal-btns">${feat('nut-own-kcal') ? '<button class="btn nut-kcal-btn" data-action="nut-kcal-edit">✎ Kalorien ändern</button>' : ''}
        ${n.kcalOwn != null ? '<button class="btn nut-kcal-reset" data-action="nut-adjust-reset">↺ Wert der App</button>' : ''}</div>
    </div>`;
  let macros;
  if (nutMacroEdit) macros = `<h3 class="fe-goal-h">Makroverteilung</h3>${nutPctEditor()}`;
  else if (!feat('nut-macros')) macros = `<h3 class="fe-goal-h">Eiweiß</h3><div class="fe-macros one"><div class="fe-mac p"><span>Eiweiß</span><b>${c.protein} g</b><small>am Tag</small></div></div>`;
  else macros = `<h3 class="fe-goal-h">Makroverteilung</h3>
      <div class="fe-macros">${NUT_MACROS.map(([k, l]) => {
        const g = { p: c.protein, f: c.fat, c: c.carbs }[k];
        return `<div class="fe-mac ${k}"><span>${l}</span><b>${g} g</b><small>${pct[k]} %</small></div>`;
      }).join('')}</div>
      ${fatLow ? `<p class="nut-warn">Sehr wenig Fett: Auf Dauer sollten es mindestens ca. ${Math.round(NUT_FAT_WARN_FFM * c.ffm / 5) * 5} g am Tag sein (u. a. für die Hormone).</p>` : ''}
      ${feat('nut-macro-pct') ? `<div class="nut-macro-btns">${n.macroPct
        ? `<span class="hint">Eigene Aufteilung ${n.macroPct.p} / ${n.macroPct.f} / ${n.macroPct.c} %</span>
           <button class="btn" data-action="nut-pct-edit">Ändern</button>
           <button class="btn" data-action="nut-pct-reset">App-Empfehlung</button>`
        : '<button class="btn" data-action="nut-pct-edit">Makros selbst festlegen (in %)</button>'}</div>` : ''}`;
  return `<div class="fe-goal open">${head}
      ${kcalBox}
      ${nutCardioLine(n, c)}
      ${c.note === 'floor' ? `<p class="nut-warn">Weniger als ${deNum(nutFloor(n))} kcal empfiehlt die App nicht, sonst fehlen schnell Nährstoffe.</p>` : ''}
      ${macros}
      ${feat('nut-protein-detail') ? nutProteinNote(n, c) : ''}
      ${nutTrainDayHtml(n, true)}
      <p class="nut-relax explain">😌 <b>Kein Stress:</b> Du musst diese Werte nicht aufs Gramm genau treffen. Entscheidend ist, dass Kalorien
        und Eiweiß über die Woche gesehen ungefähr passen, ±10 % sind völlig in Ordnung.</p>
    </div>`;
}
actions['fe-goal-toggle'] = () => {
  const open = foodGoalOpen || !!nutKcalEdit || !!nutMacroEdit;
  foodGoalOpen = !open; nutKcalEdit = null; nutMacroEdit = null;
  render();
};

// Zeile unter dem Tagesziel: Cardio heute (eingerechnet oder nicht)
function nutCardioLine(n, c) {
  const x = typeof cardioKcalOn === 'function' ? cardioKcalOn(todayISO()) : 0;
  if (!x) return '';
  return n.cardioAdd
    ? `<p class="nut-cardio">🏃 Heute <b>+${deNum(x)} kcal</b> Cardio → Ziel heute <b>${nutKcal(c.kcal + x)} kcal</b></p>`
    : `<p class="nut-cardio off">🏃 Heute ca. ${deNum(x)} kcal Cardio, nicht ins Tagesziel eingerechnet
        <button class="link-btn" data-action="cardio-open">ändern</button></p>`;
}

// Fortschritt zum Zielgewicht
function nutGoalCard(n, c, kg) {
  if (n.goalKg == null || n.phase === 'recomp') return '';
  const total = n.goalKg - n.startKg;
  const done = kg - n.startKg;
  const reached = total ? (done / total >= 1) : true;
  const frac = total ? Math.max(0, Math.min(1, done / total)) : 1;
  const left = n.goalKg - kg;
  let eta = '';
  if (!reached && c.planned && Math.sign(left) === Math.sign(c.planned)) {
    const weeks = Math.ceil(Math.abs(left / c.planned));
    eta = ` | im geplanten Tempo ca. ${weeks} Woche${weeks === 1 ? '' : 'n'} (um den ${fmtDate(addDaysISO(todayISO(), weeks * 7) + 'T12:00:00')})`;
  }
  return `<div class="card nut-goal">
      <div class="nut-goal-row"><span>Start<b>${fmtNum(n.startKg)} kg</b></span><span>Jetzt<b>${fmtNum(kg)} kg</b></span>
        <span>Ziel<b>${fmtNum(n.goalKg)} kg</b></span></div>
      <div class="bar"><div style="width:${Math.round(frac * 100)}%"></div></div>
      <p class="hint nut-small">${!reached ? `Noch ${fmtNum(round1(Math.abs(left)))} kg${eta}.`
        : Math.abs(left) <= 1 ? '🎉 Ziel erreicht. Zeit für ein neues Ernährungsziel.'
        : total < 0 ? `⚠️ Du bist ${fmtNum(round1(Math.abs(left)))} kg unter deinem Ziel. Zeit, ${n.phase === 'minicut' ? 'den Minicut' : 'die Diät'} zu beenden.`
        : `⚠️ Du bist ${fmtNum(round1(Math.abs(left)))} kg über deinem Ziel. Setz dir ein neues Zielgewicht oder wechsle dein Ernährungsziel.`}</p>
      ${reached ? '<button class="btn outline" data-action="nut-setup">Ernährungsziel wechseln</button>' : ''}
    </div>`;
}

/* ---------- Gegessen: aus Health (Kurzbefehl) oder von Hand, data.intake ---------- */

let nutIntakeForm = null;
let nutKcalEdit = null;  // Tagesziel selbst ändern: { v (Text) }  // „Von Hand eintragen“ offen: { date, kcal, p, c, f } als Text

const intakeOn = date => data.intake.find(x => x.date === date);
const nutG = v => v == null ? '–' : `${deNum(v)} g`;

// Balken Ist ↔ Soll; tol = erlaubte Abweichung (Anteil), lo = Untergrenze (Eiweiß)
function nutIntakeBar(label, v, goal, unit, tol, lo = null) {
  if (v == null) return `<div class="nut-ib"><div class="nut-ib-top"><span>${label}</span><b class="hint">–</b></div></div>`;
  const pct = goal ? v / goal : 0;
  const ok = lo != null ? v >= lo : Math.abs(pct - 1) <= tol;
  const fmt = x => unit === 'kcal' ? nutKcal(x) : deNum(Math.round(x));
  return `<div class="nut-ib ${!nutHintsOn() ? 'neutral' : ok ? 'ok' : 'off'}"><div class="nut-ib-top"><span>${label}</span>
      <b>${fmt(v)} <small>/ ${lo != null ? `${deNum(lo)}+` : fmt(goal)} ${unit}</small></b></div>
      <div class="nut-ib-bar"><div style="width:${Math.min(100, Math.round(pct * 100))}%"></div></div></div>`;
}

function nutIntakeFormHtml() {
  const f = nutIntakeForm;
  const inp = (k, ph) => `<input class="inp kg" type="text" inputmode="numeric" autocomplete="off" data-field="nut-intake" data-k="${k}" value="${esc(f[k])}" placeholder="${ph}">`;
  return `<div class="nut-intake-form">
      <label class="row"><span>Datum</span><input class="inp date" type="date" data-field="nut-intake" data-k="date" value="${f.date}" max="${todayISO()}"></label>
      <label class="row"><span>Kalorien</span>${inp('kcal', 'kcal')}</label>
      <label class="row"><span>Eiweiß</span>${inp('p', 'g')}</label>
      <label class="row"><span>Kohlenhydrate</span>${inp('c', 'g')}</label>
      <label class="row"><span>Fett</span>${inp('f', 'g')}</label>
      <p class="hint nut-small">Tagessummen eintragen. Lässt du die Kalorien leer, rechnet die App sie aus den Makros aus
        (Eiweiß und Kohlenhydrate 4 kcal, Fett 9 kcal pro Gramm).</p>
      <div class="row"><button class="btn" data-action="nut-intake-cancel">Abbrechen</button>
        <button class="btn primary" data-action="nut-intake-save">Speichern</button></div>
    </div>`;
}

// Knopf zum Import eines eigenen Ernährungsplans (nutplan.js) – unter den Tagebuch-Knöpfen
const NP_OPEN_BTN = `<button class="btn nav np-open-btn" data-action="np-open">📋 Eigenen Ernährungsplan übernehmen<small>Aus Excel, Google Sheets oder als Tabelle einfügen, z. B. vom Ernährungsberater</small></button>`;


// v299 (User-Wunsch): Liste der Tageswerte der letzten 14 Tage – steht jetzt unter Ernährungstagebuch → „Woche & Monat“
function nutEntriesHtml() {
  const from = addDaysISO(todayISO(), -13);
  const rows = [...data.intake].filter(x => x.date >= from).sort((a, b) => b.date.localeCompare(a.date)).map(x => `<li class="bw-row">
      <span>${fmtDate(x.date + 'T12:00:00')}<small class="hint">${x.src === 'auto' ? ' | geschätzt' : ''}${x.p != null ? ` | E ${x.p}` : ''}${x.c != null ? ` | K ${x.c}` : ''}${x.f != null ? ` | F ${x.f}` : ''}</small></span>
      <b>${x.kcal != null ? nutKcal(x.kcal) + ' kcal' : '–'}</b>
      <button class="icon-btn" data-action="${x.src === 'food' ? 'food-open' : 'nut-intake-edit'}" data-date="${x.date}" aria-label="Bearbeiten">${x.src === 'food' ? '🍎' : '✎'}</button>
      <button class="icon-btn danger" data-action="nut-intake-del" data-date="${x.date}" aria-label="Löschen">✕</button></li>`).join('');
  return rows ? `<details class="card nut-more nut-entries"><summary>Einträge der letzten 14 Tage ansehen und bearbeiten</summary><ul class="list">${rows}</ul></details>` : '';
}
// v299: Tage ohne Eintrag als eine schmale Zeile (in „Dein Verlauf“), Erklärung aufklappbar
// v311 (User-Wunsch): „Tagesziel nachtragen“ klappt zwei Wege auf: manuell (Kalender, fehlende Tage markiert) oder automatisch
var nutGapPick = false;
function nutGapsLine(c) {
  const gaps = nutGapDays();
  if (!gaps.length || !nutHintsOn() || !c) return '';
  const span = gaps.length === 1 ? fmtDate(gaps[0] + 'T12:00:00') : `${fmtDate(gaps[0] + 'T12:00:00')} bis ${fmtDate(gaps[gaps.length - 1] + 'T12:00:00')}`;
  return `<div class="nut-sec nut-gapline">
      <p class="nut-gap-txt">📝 ${gaps.length} Tag${gaps.length === 1 ? '' : 'e'} ohne Eintrag (${span})</p>
      ${nutGapPick ? `<div class="nut-gap-pick">
          <button class="split-opt" data-action="nut-gaps-manual"><b>✍️ Manuell nachtragen</b><small>Im Ernährungskalender, die fehlenden Tage sind dort markiert</small></button>
          <button class="split-opt" data-action="nut-gaps-fill"><b>⚡ Automatisch nachtragen</b><small>Deine Tagesziele werden für die fehlenden Tage als erfüllt eingetragen</small></button>
          <button class="link-btn" data-action="nut-gaps-pick">Abbrechen</button></div>`
        : '<button class="btn nut-gap-btn" data-action="nut-gaps-pick">Tagesziel nachtragen</button>'}
      <details class="nut-more"><summary>ⓘ Warum?</summary><p class="hint nut-small">Der gemessene Bedarf vergleicht, was du im Schnitt isst,
        mit deinem Gewichtsverlauf. Je mehr Tage fehlen, desto ungenauer wird er. Hast du an diesen Tagen ungefähr nach Plan gegessen, trägt die App
        dort dein Tagesziel ein (${nutKcal(c.kcal)} kcal, ${c.protein} g Eiweiß). Tage, an denen du deutlich mehr oder weniger gegessen hast, trag
        lieber selbst ein (Manuell nachtragen).</p></details>
    </div>`;
}
// Die letzten 14 Tage als Balken (Linie = Tagesziel) + Ø der letzten 7 Tage
function nutHistoryCard(n, c) {
  const days = Array.from({ length: 14 }, (_, i) => addDaysISO(todayISO(), i - 13));
  const list = days.map(d => intakeOn(d));
  if (!list.some(Boolean)) return '';
  // v251: kein eigenes Balkendiagramm mehr (Ernährung → Tagebuch → Woche & Monat zeigt die Tage als Säulendiagramm)
  const week = days.slice(7).map(d => intakeOn(d)).filter(x => x && x.date < todayISO());
  const avg = k => { const v = week.map(x => x[k]).filter(x => x != null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; };
  const rows = [...data.intake].filter(x => x.date >= days[0]).sort((a, b) => b.date.localeCompare(a.date)).map(x => `<li class="bw-row">
      <span>${fmtDate(x.date + 'T12:00:00')}<small class="hint">${x.src === 'auto' ? ' | geschätzt' : ''}${x.p != null ? ` | E ${x.p}` : ''}${x.c != null ? ` | K ${x.c}` : ''}${x.f != null ? ` | F ${x.f}` : ''}</small></span>
      <b>${x.kcal != null ? nutKcal(x.kcal) + ' kcal' : '–'}</b>
      <button class="icon-btn" data-action="${x.src === 'food' ? 'food-open' : 'nut-intake-open'}" data-date="${x.date}" aria-label="Bearbeiten">${x.src === 'food' ? '🍎' : '✎'}</button>
      <button class="icon-btn danger" data-action="nut-intake-del" data-date="${x.date}" aria-label="Löschen">✕</button></li>`).join('');
  return `<div class="card nut-history">
      <div class="nut-hist-head"><p class="nut-intake-head"><b>📅 Letzte Tage</b></p>
        <button class="btn small" data-action="food-stats" data-from="nutrition">📊 Woche & Monat</button></div>
      ${week.length ? `<div class="nut-goal-row nut-avg"><span>Ø Kalorien<b>${avg('kcal') != null ? nutKcal(avg('kcal')) : '–'}</b></span>
        <span>Ø Eiweiß<b>${nutG(avg('p'))}</b></span><span>eingetragen<b>${week.length} von 7 Tagen</b></span></div>
        <p class="hint nut-small">Ø der letzten 7 vollständigen Tage (ohne heute).</p>` : ''}
      ${nutGapsHtml(c)}
      <details class="nut-more"><summary>Einträge ansehen und bearbeiten</summary><ul class="list">${rows}</ul></details>
    </div>`;
}

// Tage ohne Eintrag seit Phasenbeginn (höchstens die letzten 4 Wochen, ohne heute)
function nutGapDays() {
  const n = data.nutrition;
  if (!n) return [];
  const out = [];
  for (let d = [addDaysISO(todayISO(), -28), n.since].sort().pop(); d < todayISO(); d = addDaysISO(d, 1)) if (!intakeOn(d) && !nutPausedOn(d)) out.push(d);
  return out;
}

function nutGapsHtml(c) {
  const gaps = nutGapDays();
  if (!gaps.length) return '';
  const span = gaps.length === 1 ? `am ${fmtDate(gaps[0] + 'T12:00:00')}` : `zwischen ${fmtDate(gaps[0] + 'T12:00:00')} und ${fmtDate(gaps[gaps.length - 1] + 'T12:00:00')}`;
  return `<div class="nut-gaps">
      <p class="hint nut-small"><b>${gaps.length} Tag${gaps.length === 1 ? '' : 'e'} ohne Eintrag</b> ${span}. Der gemessene Bedarf vergleicht,
        was du im Schnitt isst, mit deinem Gewichtsverlauf. Je mehr Tage fehlen, desto ungenauer wird er. Hast du an diesen Tagen
        ungefähr nach Plan gegessen, trägt die App dort dein Tagesziel ein (${nutKcal(c.kcal)} kcal, ${c.protein} g Eiweiß).
        Tage, an denen du deutlich mehr oder weniger gegessen hast, trag lieber selbst ein. Nachgetragene Tage kannst du unten jederzeit ändern.</p>
      <button class="btn" data-action="nut-gaps-fill">📝 Bis gestern mit dem Tagesziel nachtragen</button>
    </div>`;
}

// Gemessener Erhaltungsbedarf: Ø gegessen minus Gewichtsveränderung (letzte 4 Wochen, ohne heute)
function nutMeasured() {
  // die erste Woche einer Phase und Erhaltungswochen verschieben vor allem Wasser – erst danach zählen
  const n = data.nutrition;
  const from = [addDaysISO(todayISO(), -28), n ? addDaysISO(n.since, 7) : '', n && n.breakEnd ? addDaysISO(n.breakEnd, 7) : ''].sort().pop();
  // Tagebuch-Tage zählen erst, wenn sie abgeschlossen sind (sonst fehlen evtl. Einträge); Health/von Hand/nachgetragen sind ganze Tage
  const days = data.intake.filter(x => x.date >= from && x.date < todayISO() && x.kcal > 0 && (x.src !== 'food' || data.foodClosed[x.date]));
  if (days.length < 14) return { days: days.length, from };
  const pts = data.bodyweight.filter(b => b.date.slice(0, 10) >= from && !nutWaterDay(b.date.slice(0, 10))).map(b => ({ x: Date.parse(b.date) / DAY, y: b.kg }));
  const span = pts.length ? Math.max(...pts.map(p => p.x)) - Math.min(...pts.map(p => p.x)) : 0;
  if (pts.length < 4 || span < 12) return { days: days.length, noWeight: true, from };
  const mx = pts.reduce((a, p) => a + p.x, 0) / pts.length, my = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  const slope = pts.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / pts.reduce((a, p) => a + (p.x - mx) ** 2, 0);  // kg pro Tag
  // Cardio, das ins Tagesziel eingerechnet wird, abziehen – der gemessene Bedarf gilt für Tage ohne Cardio
  const avg = days.reduce((a, x) => a + x.kcal - nutCardio(x.date), 0) / days.length;
  return { days: days.length, avg, perWeek: slope * 7, tdee: avg - slope * NUT_KCAL_KG, from };
}

// Rechnung zum gemessenen Bedarf: Vorschlag (halber Schritt) und warum ggf. nichts geändert wird
function nutMeasuredState(n, c, m = nutMeasured()) {
  if (m.tdee == null) return null;
  const real = Math.round(m.tdee / 10) * 10;
  const used = c.kcal - c.delta;  // Erhaltungsbedarf, mit dem das Tagesziel gerade rechnet
  // schrittweise: nur die Hälfte des Unterschieds übernehmen – die Messung schwankt, so schaukelt sich nichts auf
  const lim = n.phase === 'bulk' ? NUT_BULK_STEP : 200;  // v259: Aufbau höchstens ±100, Diät höchstens ±200 kcal je Schritt
  const step = Math.max(-lim, Math.min(lim, Math.round((real - used) / 2 / 50) * 50));
  const adj = Math.round((used + step - c.tdee) / 50) * 50;
  const close = Math.abs(real - used) < 200;
  const after = nutCalc({ ...n, adjust: adj, kcalOwn: null }, n.kg || nutWeight()).kcal;  // Tagesziel nach dem Übernehmen
  const atFloor = !close && after === c.kcal && after <= nutFloor(n);
  const minicut = !close && n.phase === 'minicut';
  // Läuft das Gewicht laut Gewichtsverlauf genau nach Plan, wird nichts geändert (sonst widersprechen sich die beiden Karten)
  // Geändert wird nur, wenn sich der Durchschnitt in die falsche Richtung bewegt und die Messung dazu passt
  const tr = nutTrend(n);
  const off = nutOffTrack(n, c);
  const conflict = !close && !minicut && !!tr && ((step < 0 && tr.perWeek < c.planned - 0.15) || (step > 0 && tr.perWeek > c.planned + 0.15));
  const onPlan = !close && !atFloor && !minicut && !(off && Math.sign(off.corr) === Math.sign(step));
  const wait = !close && !atFloor && !minicut && !onPlan && !nutMaySuggest(n);
  const plan = typeof nutPlanActive === 'function' && nutPlanActive();  // Ernährungsplan ist maßgeblich: nur Hinweis
  return { real, used, step, adj, close, atFloor, minicut, onPlan, conflict, wait, plan, apply: !close && !atFloor && !minicut && !onPlan && !wait && !plan };
}

// Einfach/Standard (ohne Karte „Gemessener Bedarf“): dessen Vorschlag als einfache Frage im Gewichtsverlauf
function nutMeasuredAsk(n, c) {
  if (feat('nut-measured') || n.phase === 'minicut' || nutBreakNow(n)) return '';
  const st = nutMeasuredState(n, c);
  if (!st || !st.apply) return '';
  const more = st.step > 0;
  return `<div class="card nut-check off"><p><b>${more ? '⬆️ Dein Körper braucht etwas mehr als gedacht' : '⬇️ Dein Körper braucht etwas weniger als gedacht'}</b></p>
    <p class="hint nut-small">${feat('nut-trend-detail')
      ? `Aus dem, was du in den letzten Wochen gegessen hast, und deinem Gewichtsverlauf ergibt sich ein Bedarf von ca. ${nutKcal(st.real)} kcal
        (die App rechnet mit ${nutKcal(st.used)}). Sie geht schrittweise vor und passt dein Tagesziel um ${nutSigned(st.step, 'kcal')} an.`
      : `Das zeigen deine Einträge und dein Gewicht der letzten Wochen.`} Tagesziel um <b>${nutSigned(st.step, 'kcal')}</b> anpassen?</p>
    ${nutMoveNote(n, c, st.step)}
    <button class="btn primary" data-action="nut-measured-apply" data-v="${st.adj}">Ja, anpassen</button>${NUT_LATER_BTN}</div>`;
}

function nutMeasuredCard(n, c) {
  if (!nutHintsOn() || !feat('nut-measured')) return '';
  if (n.phase === 'minicut' && nutMinicutStage(n) !== 'cut') return '';
  const m = nutMeasured();
  if (m.tdee == null) return '';  // v299: noch nicht genug Daten – Hinweis steht in „So rechnet die App“
  if (m.tdee == null) {
    return `<div class="card nut-check"><p><b>📏 Gemessener Bedarf</b></p>
      <p class="hint nut-small explain">${m.noWeight
        ? 'Genug Essens-Einträge sind da. Jetzt fehlen noch Gewichtswerte: Wiege dich 3–4× pro Woche über mindestens zwei Wochen.'
        : `Trägst du an mindestens 14 Tagen ein, was du isst (bisher ${m.days} seit dem ${fmtDate(m.from + 'T12:00:00')}), und wiegst dich regelmäßig,
          rechnet die App deinen <b>echten</b> Erhaltungsbedarf aus: Was du im Schnitt isst, minus das, was sich am Gewicht
          verändert. Das ist viel genauer als die Schätzformel.`}</p></div>`;
  }
  const mst = nutMeasuredState(n, c, m);
  const { real, used, step, close, atFloor, minicut, onPlan, wait, plan } = mst;
  return `<div class="card nut-check ${close ? 'ok' : onPlan ? '' : 'off'}"><p><b>📏 Gemessener Bedarf: ca. ${nutKcal(real)} kcal</b></p>
      <p class="hint nut-small explain">Seit dem ${fmtDate(m.from + 'T12:00:00')} hast du an ${m.days} Tagen im Schnitt <b>${nutKcal(m.avg)} kcal</b> gegessen,
        dein Gewicht hat sich dabei um <b>${nutSigned(m.perWeek, 'kg')} pro Woche</b> verändert. Daraus ergibt sich ein Erhaltungsbedarf
        von ca. ${nutKcal(real)} kcal. Die App rechnet gerade mit ${nutKcal(used)} kcal${n.kcalOwn != null ? ' (aus deinem eigenen Tagesziel)' : n.adjust ? ' (Formel + Anpassung)' : ' (Schätzformel)'}.
        ${close ? 'Das passt gut zusammen.' : plan ? `Dein Ernährungsplan ist maßgeblich, die App ändert nichts. Weicht dein Gewicht länger vom Ziel ab, sprich eine Anpassung mit deinem Berater ab (Richtung: ${nutSigned(step, 'kcal')}).`
          : onPlan ? (mst.conflict ? nutConflictText(mst) : 'Eine Änderung schlägt die App nur vor, wenn dein Durchschnittsgewicht in die falsche Richtung läuft oder stehen bleibt.')
          : atFloor || wait || minicut ? '' : 'Den Vorschlag dazu findest du weiter unten.'}</p>
      ${atFloor ? nutFloorHint(n) : minicut ? NUT_MINICUT_NOTE : ''}
      <p class="hint nut-small">Es zählen nur vollständige Tage: abgeschlossene Tage im Ernährungstagebuch sowie Tage aus Health, von Hand oder nachgetragen.</p></div>`;
}

// Passt das Tempo? Vergleich Trend ↔ Plan, ggf. Vorschlag zur Anpassung
// Minicut: zu kurz für sichere Empfehlungen (Wasser überdeckt den Fettabbau)
const NUT_MINICUT_NOTE = `<p class="hint nut-small">Im Minicut schlägt die App keine Änderung vor: 4 Wochen sind zu kurz, um auf der
  Waage Wasser und Fett sicher zu unterscheiden. Bleib einfach bei deinem Tagesziel.</p>`;

// Hinweis: weniger essen geht nicht mehr – das Tagesziel ist schon am Minimum
function nutFloorHint(n) {
  return `<p class="hint nut-small">Dein Tagesziel liegt schon bei ${deNum(nutFloor(n))} kcal. Weniger empfiehlt die App nicht. Weiter
    kommst du stattdessen mit mehr Bewegung im Alltag (z. B. 2.000–3.000 Schritte mehr am Tag, das sind etwa 100–150 kcal) oder mit
    einer Diätpause: 1–2 Wochen auf Erhaltung essen (Ernährungsziel „Body Recomposition“, Tempo „Erhaltung“), danach geht es meist leichter weiter.</p>`;
}

const NUT_LATER_BTN = '<button class="btn" data-action="nut-suggest-later">Nicht jetzt</button>';

// v330 (User): Bei jedem Vorschlag zu mehr oder weniger Kalorien auch die Alltagsaktivität ansprechen.
// Senkung (nur Diät und Minicut): statt oder zusätzlich mehr Bewegung im Alltag. Erhöhung im Aufbau ab 3.000 kcal:
// Alltagsaktivität etwas herunterfahren, aber dauerhaft nicht unter 6.000–8.000 Schritte am Tag.
function nutStepsAvg(days = 14) {
  const from = addDaysISO(todayISO(), -days);
  const l = data.steps.filter(s => s.date >= from && s.steps > 0);
  return l.length >= 5 ? Math.round(l.reduce((a, s) => a + s.steps, 0) / l.length / 100) * 100 : null;
}
function nutMoveNote(n, c, delta) {
  if (!n || !delta) return '';
  const avg = nutStepsAvg();
  const now = avg ? ` Zurzeit gehst du im Schnitt ca. ${deNum(avg)} Schritte am Tag.` : '';
  if (delta < 0 && (n.phase === 'diet' || n.phase === 'minicut')) {
    return `<p class="hint nut-small nut-move">🚶 Statt weniger zu essen, oder zusätzlich dazu, kannst du dich im Alltag mehr bewegen, wenn dein
      Tagesablauf das zulässt: z. B. ${deNum(2000)} bis ${deNum(3000)} Schritte mehr am Tag (etwa 100 bis 150 kcal), Treppe statt Aufzug, kurze Wege zu Fuß
      oder mit dem Rad.${now}</p>`;
  }
  if (delta > 0 && n.phase === 'bulk' && c && c.kcal > 3000) {
    if (avg != null && avg <= 8000) {
      return `<p class="hint nut-small nut-move">🚶 Du isst schon über ${deNum(3000)} kcal am Tag. Mit ca. ${deNum(avg)} Schritten am Tag bist du aber schon
        bei den ${deNum(6000)} bis ${deNum(8000)} Schritten, die du dauerhaft nicht unterschreiten solltest. Weniger bewegen ist hier keine gute Idee.</p>`;
    }
    return `<p class="hint nut-small nut-move">🚶 Du isst schon über ${deNum(3000)} kcal am Tag. Statt noch mehr zu essen, kannst du auch deine
      Alltagsaktivität etwas herunterfahren, z. B. weniger zusätzliche Wege zu Fuß. ${deNum(6000)} bis ${deNum(8000)} Schritte am Tag solltest du aber dauerhaft
      nicht unterschreiten, sie sind wichtig für Herz, Kreislauf und Erholung.${now}</p>`;
  }
  return '';
}

// Keine laufenden Kommentare (User-Regel 2026-11-06): Die Karte erscheint nur mit einem Kalorienvorschlag und kurzer Begründung
// v251 (User 2026-11-14): Zielgewicht, Hinweis mit Anpassungsvorschlag und gemessener Bedarf in einer Karte „Dein Verlauf“
// v310 (User 2026-11-17): keine eigene Karte mehr, steht unten in der Karte „Körpergewicht“ (bwBlock)
function nutProgressCard(n, c, kg) {
  const sec = h => h ? h.replace('class="card ', 'class="nut-sec ') : '';
  const parts = [sec(nutBfCard(n)), sec(nutGoalCard(n, c, kg)), sec(nutTrendCard(n, c)), sec(nutMeasuredCard(n, c)), nutGapsLine(nutForDay(c))].filter(Boolean);
  return parts.length ? `<div class="nut-prog">${parts.join('')}</div>` : '';
}
function nutTrendCard(n, c) {
  if (!nutHintsOn() || n.phase === 'minicut' || nutBreakNow(n)) return '';
  const ask = nutMeasuredAsk(n, c);
  if (ask) return ask;
  const off = nutOffTrack(n, c);
  if (!off || !nutMaySuggest(n)) return '';
  const b = off.weekly || nutWeighBlocks(n);
  const wish = n.phase === 'recomp' ? 'es etwa gleich bleiben soll' : c.planned < 0 ? 'du abnehmen möchtest' : 'du zunehmen möchtest';
  const what = off.fast ? `Dein Durchschnittsgewicht steigt schneller als geplant: ca. ${fmtNum(round1(off.pct))} % im Monat, ${off.byExp ? 'erwartet wären gerade ca.' : 'Richtwert höchstens'} ${fmtNum(off.max)} %.`
    : `Dein Durchschnittsgewicht ${off.weekly ? (() => { const sw = off.weekly.weeks === 4 ? 'vier' : 'zwei';
      return off.dir > 0 ? `steigt seit ${sw} Wochen` : off.dir < 0 ? `sinkt seit ${sw} Wochen` : `bleibt seit ${sw} Wochen gleich`; })() : off.dir > 0 ? 'steigt' : off.dir < 0 ? 'sinkt' : 'bleibt gleich'}, obwohl ${wish}.`;
  const detail = feat('nut-trend-detail');
  const cmp = !detail ? '' : off.weekly ? `Wochenschnitt jetzt: <b>${fmtNum(round1(b.a))} kg</b>, vor ${b.weeks === 4 ? 'vier' : 'zwei'} Wochen ${fmtNum(round1(b.b))} kg (${nutSigned(round1(b.diff), 'kg')}). `
    : `Ø der letzten ${NUT_CMP_N} Wiegungen: <b>${fmtNum(round1(b.a))} kg</b>, davor ${fmtNum(round1(b.b))} kg (${nutSigned(b.diff, 'kg')}). `;
  const card = (text, end, d = 0) => `<div class="card nut-check off"><p><b>⚠️ ${what}</b></p><p class="hint nut-small">${cmp}${text}</p>${nutMoveNote(n, c, d)}${end}</div>`;
  const perDay = v => `täglich etwa <b>${Math.abs(v)} kcal ${v < 0 ? 'weniger' : 'mehr'}</b>`;
  const corr = off.corr;
  if (typeof nutPlanActive === 'function' && nutPlanActive()) {
    return card(`Dein Ernährungsplan ist maßgeblich, die App ändert nichts. Bleibt das so, sprich eine Anpassung (etwa ${nutSigned(corr, 'kcal')} am Tag)
      mit deinem Ernährungsberater ab.`, NUT_LATER_BTN, corr);
  }
  // Gemessener Bedarf zeigt in dieselbe Richtung: danach anpassen, das ist genauer
  const st = nutMeasuredState(n, c);
  if (st && st.apply && feat('nut-measured')) {
    return card(`Vorschlag laut deinem gemessenen Bedarf: ${perDay(st.step)}.`,
      `<button class="btn primary" data-action="nut-measured-apply" data-v="${st.adj}">${nutSigned(st.step, 'kcal')} übernehmen</button>${NUT_LATER_BTN}`, st.step);
  }
  if (corr < 0 && c.kcal <= nutFloor(n)) return card('', nutFloorHint(n) + NUT_LATER_BTN);
  if (!detail) return card(`Tagesziel um <b>${nutSigned(corr, 'kcal')}</b> anpassen?`,
    `<button class="btn primary" data-action="nut-adjust" data-v="${corr}">Ja, anpassen</button>${NUT_LATER_BTN}`, corr);
  return card(`Vorschlag: ${perDay(corr)}.`,
    `<button class="btn primary" data-action="nut-adjust" data-v="${corr}">${nutSigned(corr, 'kcal')} übernehmen</button>${NUT_LATER_BTN}`, corr);
}

// Unterbrechung: Formular, laufende oder geplante
let nutPauseForm = false;
// v332 (User): Knopf „unterbrechen“ oben beim Ernährungsziel (vorher unter „Mehr“), mit Rückfrage
const nutPauseOffer = n => !n.pause && !nutPauseForm && (n.phase !== 'minicut' || nutMinicutStage(n) === 'cut');
function nutPauseCard(n) {
  const fmt = d => fmtDate(d + 'T12:00:00');
  if (nutPauseForm) {
    const p = n.pause || {};
    return `<div class="card nut-pause"><p><b>⏸ ${NUT_PHASES[n.phase].label} unterbrechen</b></p>
      <p class="hint nut-small">Zum Beispiel im Urlaub. In dieser Zeit gibt es kein Tagesziel und keine Hinweise, und was du einträgst oder wiegst,
        zählt nicht für die Kalorienvorschläge.${n.trainAdapt ? ' Dein Training läuft in der Zeit ohne die Diät-Anpassung.' : ''}
        Ohne Enddatum läuft die Unterbrechung, bis du sie beendest.</p>
      <label class="row"><span>Von</span><input class="inp date" id="nut-pause-from" type="date" value="${p.from || todayISO()}" min="${n.since}"></label>
      <label class="row"><span>Bis (optional)</span><input class="inp date" id="nut-pause-to" type="date" value="${p.to || ''}" min="${n.since}"></label>
      <button class="btn primary" data-action="nut-pause-save">Speichern</button>
      <button class="btn" data-action="nut-pause-cancel">Abbrechen</button></div>`;
  }
  if (!n.pause) return '';
  if (nutPaused(n)) {
    return `<div class="card nut-pause"><p><b>⏸ ${NUT_PHASES[n.phase].label} unterbrochen</b></p>
      <p class="hint nut-small">${n.pause.to ? `Bis einschließlich ${fmt(n.pause.to)}, dann geht es automatisch weiter.` : 'Bis du sie fortsetzt.'}
        Die App rechnet dann mit deinem aktuellen Gewicht und beginnt ihren Gewichtsvergleich neu.</p>
      <button class="btn primary" data-action="nut-pause-end">Jetzt fortsetzen</button>
      <button class="btn" data-action="nut-pause-open">Datum ändern</button></div>`;
  }
  return `<div class="card nut-pause"><p><b>⏸ Unterbrechung geplant</b></p>
      <p class="hint nut-small">Ab ${fmt(n.pause.from)}${n.pause.to ? ` bis ${fmt(n.pause.to)}` : ', ohne Enddatum'}.</p>
      <button class="btn" data-action="nut-pause-open">Datum ändern</button>
      <button class="btn" data-action="nut-pause-end">Absagen</button></div>`;
}

function nutPhaseHint(n) {
  const week = nutWeekNo(n);
  const stage = n.phase === 'minicut' ? nutMinicutStage(n) : null;
  if (stage === 'maint') {
    // Erhaltungswoche: im Training läuft dazu der Deload (beim Übergang automatisch eingelegt, siehe nutSync)
    const coupled = nutPlanCoupled() && cycleInfo().deload;
    return `<div class="card nut-check ok"><p><b>🏁 Minicut geschafft, jetzt Erhaltungswoche</b></p>
      <p class="hint nut-small">Diese Woche isst du auf Erhaltungskalorien (das Tagesziel ist schon umgestellt).
        ${coupled ? 'Im Training läuft passend dazu die <b>Deload-Woche</b>. Essen und Training erholen sich gemeinsam. Die Erhaltungswoche dauert mindestens 7 Tage und so lange, bis der Deload geschafft ist.'
          : 'Trainiere diese Woche bewusst leichter (weniger Sätze, etwas weniger Gewicht), damit sich der Körper erholt.'}</p></div>`;
  }
  if (nutBreakNow(n)) {
    const minicut = n.phase === 'minicut';
    return `<div class="card nut-check ok"><p><b>😮‍💨 Deload-Woche = Erhaltungswoche</b></p>
      <p class="hint nut-small">Im Training ist gerade Deload. Deshalb isst du diese Woche auf <b>Erhaltung</b> statt im Defizit
        (das Tagesziel ist schon umgestellt). Warum: Ein dauerhaftes Defizit setzt den Körper unter Stress. Er spart Energie, die
        Leistung sinkt, und je länger es dauert, desto eher greift er auch Muskeln an. Eine Woche ohne Defizit füllt die
        Kohlenhydratspeicher wieder auf, senkt die Stresshormone und gibt den Muskeln das Signal, dass genug Energie da ist.
        Zusammen mit dem leichten Training ist das die beste Erholung. Danach geht der Fettabbau meist sogar leichter weiter.
        Auf der Waage siehst du oft 0,5–1 kg mehr: Das ist Wasser in den aufgefüllten Speichern, kein Fett. Es verschwindet
        in der nächsten Defizit-Woche wieder.${minicut ? ' <b>Der Minicut verlängert sich um diese Woche.</b>' : ''}</p>
      <button class="btn" data-action="nut-nobreak">Diese Woche trotzdem im Defizit bleiben</button></div>`;
  }
  if (stage === 'done' && !(typeof ppPlan === 'function' && ppPlan(n))) {  // mit Phasenplan wechselt die App selbst (v315)
    const again = (n.round || 1) < 2;
    return `<div class="card nut-check ok"><p><b>✅ Minicut und Erhaltungswoche sind vorbei</b></p>
      <p class="hint nut-small">${again
        ? 'Zufrieden? Dann weiter mit dem Aufbau. Wenn nicht, kannst du noch einen (aber höchstens einen) weiteren Durchgang mit diesem Defizit machen.'
        : 'Das war dein zweiter Durchgang. Mehr empfiehlt die App am Stück nicht. Weiter geht es mit Aufbau oder ein paar Wochen auf Erhaltung (Body Recomposition).'}</p>
      <button class="btn primary" data-action="nut-to-bulk">Weiter mit Aufbau</button>
      ${again ? '<button class="btn" data-action="nut-minicut-again">Noch ein Minicut-Durchgang (der letzte)</button>' : ''}</div>`;
  }
  // Diät: einmal pro Woche (ab Woche 2) „Woche X deiner Diät“, bis „Okay“ (n.weekSeen); ab Woche 17 mit Tipp Diätpause
  // (User-Wunsch 2026-11-09, vorher ab Woche 17 täglich)
  if (n.phase === 'diet' && week >= 2 && n.weekSeen !== week) {
    const long = week > 16;
    return `<div class="card nut-check"><p><b>📅 Woche ${week} deiner Diät</b></p>
      <p class="hint nut-small">Deine Diät läuft seit ${week - 1} Woche${week === 2 ? '' : 'n'}${long
        ? '. Nach so langer Zeit tut eine Diätpause gut: 1–2 Wochen auf Erhaltung essen (Ernährungsziel „Body Recomposition“, Tempo „Erhaltung“), danach geht es leichter weiter.'
        : '.'}</p>
      <button class="btn" data-action="nut-week-ok">Okay</button></div>`;
  }
  return '';
}

// v299: Stand des gemessenen Bedarfs, solange noch nicht genug Daten da sind (stand vorher als eigene Karte im Reiter)
function nutMeasuredStatus() {
  const m = nutMeasured();
  if (m.tdee != null) return '';
  return `<p class="hint nut-small">${m.noWeight
    ? 'Stand bei dir: Genug Essens-Einträge sind da. Jetzt fehlen noch Gewichtswerte: Wiege dich 3–4× pro Woche über mindestens zwei Wochen.'
    : `Stand bei dir: bisher ${m.days} von mindestens 14 Tagen mit Einträgen seit dem ${fmtDate(m.from + 'T12:00:00')}.`}</p>`;
}
function nutExplain(n, c, kg) {
  const pace = nutPace(n);
  return `<details class="card nut-help"><summary>So rechnet die App</summary>
      <p><b>Grundumsatz ${nutKcal(c.bmr)} kcal:</b> ${c.lbm != null
        ? `aus deiner fettfreien Masse (${fmtNum(round1(c.lbm))} kg bei ${fmtNum(n.bodyFat)} % Körperfett, Formel nach Katch-McArdle).`
        : `aus Gewicht, Größe, Alter (${c.age}) und Geschlecht (Formel nach Mifflin-St Jeor).`}</p>
      <p><b>Erhaltungsbedarf ${nutKcal(c.tdee)} kcal:</b> Grundumsatz × ${fmtNum(NUT_ACT[n.activity].f)} für „${NUT_ACT[n.activity].label}“.</p>
      <p><b>Tagesziel:</b> ${c.delta ? `${nutSigned(c.delta, 'kcal')} für „${pace.label}“`
        : n.phase === 'minicut' ? 'Erhaltungswoche nach dem Minicut, also ±0 kcal' : `±0 kcal für „${pace.label}“`}${n.adjust && n.kcalOwn == null ? `, dazu ${nutSigned(n.adjust, 'kcal')} aus deinem Gewichtsverlauf` : ''}.
        ${n.kcalOwn != null ? `<b>Du hast dein Tagesziel selbst auf ${nutKcal(n.kcalOwn)} kcal festgelegt</b>. Damit rechnet die App statt mit der Formel.` : ''}</p>
      ${n.macroPct
        ? `<p><b>Makros:</b> deine eigene Aufteilung: ${n.macroPct.p} % Eiweiß, ${n.macroPct.f} % Fett und ${n.macroPct.c} % Kohlenhydrate
          von ${nutKcal(c.kcal)} kcal (1 g Eiweiß oder Kohlenhydrate = 4 kcal, 1 g Fett = 9 kcal).</p>`
        : `<p><b>Fettfreie Masse:</b> ca. ${fmtNum(Math.round(c.ffm))} kg bei ${fmtNum(c.bf.bf)} % Körperfett (${NUT_BF_SRC[c.bf.src]}).
          Danach richten sich Eiweiß und Fett, denn Körperfett braucht kein Eiweiß.</p>
        <p><b>Eiweiß:</b> ${perKgDisp(NUT_PROTEIN_FFM[n.phase])} g je kg fettfreie Masse${c.pMinKg
          ? `, mindestens aber ${perKgDisp(c.pMinKg)} g je kg Körpergewicht${c.pFloor ? ' (gilt bei dir)' : ''}` : ''}.
        <b>Fett:</b> ${n.phase === 'minicut' ? '20' : '25'} % der Kalorien, mindestens ${perKgDisp(NUT_FAT_FFM)} g je kg fettfreie Masse.
        <b>Kohlenhydrate:</b> der Rest.</p>`}
      ${n.phase === 'diet' || n.phase === 'minicut' ? `<p><b>Deload = Erhaltungswoche:</b> In jeder Deload-Woche deines Trainings isst du
        automatisch auf Erhaltung. Das schützt die Muskeln und macht die Diät auf Dauer leichter.${n.phase === 'minicut'
          ? ' Nach den Minicut-Wochen legt die App den Deload selbst ein, damit Erhaltungswoche und Deload zusammenfallen.' : ''}</p>` : ''}
      ${typeof mcOn === 'function' && mcOn() ? `<p><b>Zykluskalender:</b> Gewichtswerte der letzten 6 Tage vor der Periode und der ersten
        2 Periodentage zählen nicht für Gewichtsverlauf und gemessenen Bedarf. In diesen Tagen lagert der Körper oft Wasser ein, das sonst
        wie zugenommenes Fett aussähe. Mehr dazu im Kalender unter „Welchen Einfluss hat der Kalender auf die App?“.</p>` : ''}
      ${n.phase === 'bulk' || n.phase === 'diet' ? `<p><b>Vorschläge:</b> Die App vergleicht deinen Wochenschnitt (Ø der letzten 7 Tage) mit dem von vor ${n.phase === 'bulk' ? 'vier' : 'zwei'} Wochen.${n.phase === 'bulk' ? ' Im Aufbau ist die Zunahme so klein, dass sich erst nach vier Wochen sicher erkennen lässt, wie es läuft.' : ''}
        ${n.phase === 'bulk' ? `Ist er nicht gestiegen, schlägt sie ${NUT_BULK_STEP} kcal mehr vor. Steigt er schneller als ${fmtNum((pace.rate || [0, 1])[1])} % deines Körpergewichts
          pro Monat und schneller als erwartet, schlägt sie ${NUT_BULK_STEP} kcal weniger vor. Erwartet wird anfangs der volle Überschuss, ab der 5. Woche
          alle 4 Wochen 15 % weniger (mindestens 40 %), weil sich der Körper daran gewöhnt. Gerade rechnet sie mit ${Math.round(nutBulkEff(n) * 100)} %.` : 'Ist er nicht gesunken, schlägt sie vor, weniger zu essen (höchstens 200 kcal auf einmal).'}
        Dafür braucht sie in dieser Woche und vor ${n.phase === 'bulk' ? 'vier' : 'zwei'} Wochen je mindestens ${NUT_WEEK_MIN} Wiegungen, und die Trendlinie über
        denselben Zeitraum muss dasselbe zeigen. So lösen Wasserschwankungen keinen Vorschlag aus, und wer wie geplant zu- oder abnimmt, muss nichts ändern.
        Nach jeder Änderung, jedem „Nicht jetzt“ und jeder Unterbrechung zählt sie neu, ein neuer Vorschlag kommt also frühestens nach ${n.phase === 'bulk' ? 'fünf' : 'drei'} Wochen.</p>`
      : `<p><b>Vorschläge:</b> Die App vergleicht den Schnitt deiner letzten ${NUT_CMP_N} Wiegungen mit den ${NUT_CMP_N} davor. Bewegt er sich um mindestens
        ${fmtNum(NUT_CMP_KG)} kg in die falsche Richtung oder bleibt er stehen, obwohl du ab- oder zunehmen möchtest, schlägt sie eine Änderung vor.
        Nach jeder Änderung, jedem „Nicht jetzt“ und jeder Unterbrechung zählt sie neu, braucht also wieder ${NUT_CMP_N * 2} Wiegungen.</p>`}
      <p><b>Gemessener Bedarf:</b> Trägst du ein, was du isst (aus Health oder von Hand), vergleicht die App über die letzten
        4 Wochen (ohne die erste Woche eines neuen Ernährungsziels), wie viel du im Schnitt gegessen hast und wie sich dein Gewicht dabei verändert hat. Nimmst du z. B. bei
        ${unitLb() ? `2.300 kcal pro Tag 0,5 lb pro Woche ab, liegt dein Bedarf bei etwa 2.300 + 0,5 × 3.500 ÷ 7 ≈ 2.550 kcal.`
          : `2.300 kcal pro Tag 0,25 kg pro Woche ab, liegt dein Bedarf bei etwa 2.300 + 0,25 × ${deNum(NUT_KCAL_KG)} ÷ 7 ≈ 2.580 kcal.`}</p>
      ${nutMeasuredStatus()}
      <p>${unitLb() ? '1 lb Körpergewicht entspricht grob 3.500 kcal' : `1 kg Körpergewicht entspricht grob ${deNum(NUT_KCAL_KG)} kcal`}. Rechne immer nur mit Schätzwerten (±10 %): Entscheidend ist,
        wie sich dein Gewicht über mehrere Wochen entwickelt.</p>
      ${n.kcalOwn != null || n.adjust ? `<button class="btn" data-action="nut-adjust-reset">${n.kcalOwn != null ? 'Eigenes Tagesziel zurücksetzen' : 'Anpassung aus dem Gewichtsverlauf zurücksetzen'}</button>` : ''}
    </details>`;
}

// Karte „Training angepasst / unverändert“ (Diät und Minicut); v386 (User): Erklärung hinter „ⓘ Was ändert sich?“
function nutTrainCard(n) {
  if (n.phase !== 'diet' && n.phase !== 'minicut') return '';
  return `<div class="card nut-train">
        <p><b>🏋️ Training ${n.trainAdapt ? (n.phase === 'minicut' ? 'an den Minicut' : 'an die Diät') + ' angepasst' : 'läuft unverändert'}</b></p>
        <details class="nut-more nut-train-more"><summary>ⓘ ${n.trainAdapt ? 'Was ändert sich?' : 'Was würde sich ändern?'}</summary>
        <p class="hint nut-small">${n.trainAdapt ? (nutTrainAdapt() ? (feat('tr-rir-input') ? NUT_ADAPT_TEXT : 'Das Volumen steigt nur am Anfang des Zyklus, danach bleibt es gleich, und das Gewicht wird nicht erzwungen.') : 'In der Erhaltungswoche läuft das Training wieder normal (am besten als Deload).')
          : feat('tr-rir-input') ? 'Du kannst den Plan an dein Ernährungsziel anpassen lassen: Volumen ohne weiteren Anstieg ab Woche 2, Tank von 2 schrittweise auf 0,5, kein erzwungenes Gewicht.'
            : 'Du kannst den Plan an dein Ernährungsziel anpassen lassen: weniger Volumen-Anstieg und kein erzwungenes Gewicht.'}</p></details>
        <button class="btn" data-action="nut-train-toggle">${n.trainAdapt ? 'Anpassung ausschalten' : 'Training anpassen'}</button></div>`;
}

// Phase gewählt (z. B. beim ersten Öffnen), aber noch ohne Angaben
function nutPhaseOnly(n) {
  const ph = NUT_PHASES[n.phase];
  const stage = n.phase === 'minicut' ? nutMinicutStage(n) : null;
  const week = nutWeekNo(n);
  const weekText = !stage ? `Woche ${week}` : stage === 'cut' ? `Woche ${week} von ${Math.min(n.weeks, NUT_MINICUT_MAX)}`
    : stage === 'maint' ? 'Erhaltungswoche' : 'abgeschlossen';
  return `<div class="card nut-goal-card"><h2 class="nut-goal-title">Dein Ernährungsziel</h2>
      <div class="nut-phase-head"><span class="wiz-q-icon" aria-hidden="true">${ph.icon}</span>
      <div><b>${ph.label}</b><small>seit ${fmtDate(n.since + 'T12:00:00')} | ${weekText}</small></div></div>
      <button class="btn primary nut-goal-switch" data-action="nut-setup">🧭 Ernährungsziel wechseln</button></div>
    ${nutPhaseHint(n)}
    <div class="card wiz-q">
      <div class="wiz-q-head"><span class="wiz-q-icon" aria-hidden="true">🍽️</span><h2>Dein Tagesziel berechnen</h2></div>
      <p class="hint wiz-q-explain">Dein Ernährungsziel steht fest. Damit die App dir sagen kann, wie viele Kalorien, Eiweiß, Fett und
        Kohlenhydrate pro Tag zu deinem Ziel passen, braucht sie noch ein paar Angaben: Alter, Größe, Gewicht und wie aktiv du im
        Alltag bist. Danach wählst du noch dein Tempo${n.phase === 'minicut' ? ' und die Dauer' : ''}.</p>
      <button class="btn primary" data-action="nut-edit">Angaben ergänzen</button>
    </div>
    ${nutTrainCard(n)}`;
}

// v262 (User 2026-11-14): „Phase“ heißt jetzt „Ernährungsziel“. Karte oben im Reiter mit einem Satz, was gerade passiert
// (class „explain“: klappt nach zwei Besuchen zu), großer Knopf zum Wechseln, darunter „Angaben ändern“.
function nutGoalExplain(n, c) {
  const kg = n.kg || nutWeight(), d = Math.abs(c.delta), kcal = nutKcal(c.kcal);
  if (!c.delta && n.phase !== 'recomp') return `Gerade isst du auf Erhaltung (Tagesziel ${kcal} kcal), danach geht es mit deinem Ziel weiter.`;
  if (n.phase === 'bulk') {
    const r = nutPace(n).rate || [null, 1], m = p => fmtNum(round1(kg * p / 100));
    return `Du isst ca. ${deNum(d)} kcal mehr, als du verbrauchst (Tagesziel ${kcal} kcal). Ziel: ${r[0] ? `+${m(r[0])} bis +${m(r[1])}` : `höchstens +${m(r[1])}`} kg
      im Monat, gemessen am Wochenschnitt. Anfangs geht es meist etwas schneller, nach einigen Wochen flacht es ab. Etwa alle vier Wochen prüft die App
      dein Gewicht und schlägt bei Bedarf eine kleine Anpassung vor.`;
  }
  if (n.phase === 'recomp') return `Du isst ungefähr so viel, wie du verbrauchst (Tagesziel ${kcal} kcal). Dein Gewicht bleibt fast gleich,
    dabei baust du Fett ab und Muskeln auf. Den Fortschritt zeigen eher Maßband, Spiegel und Trainingsgewichte als die Waage.`;
  if (n.phase === 'diet') return `Du isst ca. ${deNum(d)} kcal weniger, als du verbrauchst (Tagesziel ${kcal} kcal). Damit nimmst du etwa
    ${fmtNum(round1(d * 7 / NUT_KCAL_KG))} kg pro Woche ab. Sinkt dein Wochenschnitt zwei Wochen lang nicht, schlägt die App vor, etwas weniger zu essen.`;
  return `Kurze, harte Diät: ca. ${deNum(d)} kcal weniger, als du verbrauchst (Tagesziel ${kcal} kcal), für ${Math.min(n.weeks || NUT_MINICUT_MAX, NUT_MINICUT_MAX)} Wochen.
    Danach folgt eine Woche auf Erhaltung, zusammen mit einer Deload-Woche im Training.`;
}
function nutGoalCard2(n, c, ph, weekText) {
  return `<div class="card nut-goal-card"><h2 class="nut-goal-title">Dein Ernährungsziel</h2>
      <div class="nut-phase-head"><span class="wiz-q-icon" aria-hidden="true">${ph.icon}</span>
        <div><b>${ph.label}</b><small>${nutPace(n).label} | seit ${fmtDate(n.since + 'T12:00:00')} | ${weekText}</small></div></div>
      <p class="hint nut-small explain nut-goal-explain">${nutGoalExplain(n, c)}</p>
      <div class="nut-actions nut-goal-btns">
        <button class="btn primary nut-goal-switch" data-action="nut-setup">🧭 Ernährungsziel wechseln</button>
        ${nutPauseOffer(n) ? '<button class="btn outline nut-pause-btn" data-action="nut-pause-ask">⏸ Ernährungsziel unterbrechen</button>' : ''}
        ${typeof ppPlan === 'function' && !ppPlan(n) ? '<button class="btn outline pp-open" data-action="pp-open">📅 Ziel mit Enddatum planen</button>' : ''}
        <button class="link-btn" data-action="nut-edit">Angaben ändern (Alter, Gewicht, Aktivität, Tempo)</button></div>
    </div>`;
}

function renderNutrition() {
  const n = data.nutrition;
  const kg = nutWeight();
  // v218 (User): Ernährungstagebuch ganz oben
  const planOn = typeof nutPlanActive === 'function' && nutPlanActive();
  // v340 (User): Ernährungspläne (erstellen lassen, eigenen übernehmen) direkt unter „Essen eintragen“
  const plans = (typeof mgOpenBtn === 'function' ? mgOpenBtn() : '') + (typeof ptOpenBtn === 'function' ? ptOpenBtn() : '') + (planOn ? '' : NP_OPEN_BTN);
  let h = (typeof foodTopCard === 'function' ? foodTopCard() : '')
    + '{{BW}}'  // v369 (User): Körpergewicht direkt unter „Essen eintragen“
    + (plans ? `<div class="card nut-plans"><h2>Ernährungspläne</h2>${plans}</div>` : '')
    + (nutIntakeForm ? `<div class="card nut-intake-edit">${nutIntakeFormHtml()}</div>` : '')  // v243: „Von Hand“ aus „Die letzten Tage“
    + (typeof foodOpenCard === 'function' ? foodOpenCard() : '') + (typeof mcCard === 'function' ? mcCard() : '');
  // Grundlagen-Karte ganz oben (mit dem Tagesziel für die persönliche Ballaststoff-Menge, falls bekannt)
  const dayKcal = n && nutPaused(n) ? null : planOn ? nutForDay(null).kcal : n && nutReady(n) && kg != null ? nutForDay(nutCalc(n, kg)).kcal : null;
  // v207: Grundlagen als eingeklappte Zeile ganz unten; Körpergewicht direkt unter „Heute gegessen“ (bwBlock), Einträge zuklappbar
  const paused = n && nutPaused(n);
  const intakeShown = !paused && (planOn || (n && nutReady(n) && kg != null));
  // v261 (User 2026-11-14): hier nur noch Gewicht eintragen; Verlauf, Veränderung und Einträge im Reiter Verlauf (Statistik → Gewicht),
  // „Aus Health“ samt Anleitung im Ernährungstagebuch
  // v310: eine Karte – Überschrift, Eingabe, Link und darunter der frühere „Dein Verlauf“ (extra)
  const bwBlock = (extra = '') => `<div class="card nut-progress nut-bw"><h2>Körpergewicht</h2>${intakeShown ? '<p class="hint nut-small">Wiege dich 3–4× pro Woche, am besten morgens nach dem Aufstehen. Die App braucht das für ihre Kalorienvorschläge.</p>' : ''}${bwCard(true)}
    ${data.bodyweight.length ? '<button class="link-btn bw-hist-link" data-action="bw-hist">Verlauf, Veränderung und alle Einträge ansehen ›</button>' : ''}${extra}</div>`;
  if (n && nutPaused(n)) {
    h += nutLowCard(n, null) + nutPauseCard(n);
  } else if (planOn && !(n && nutReady(n) && kg != null)) {
    // Ernährungsplan ohne eingerichtete Phase: Ziele kommen nur aus dem Plan
    const pc = nutForDay(null);
    h += nutPlanCard();  // v299: Karte „Letzte Tage“ entfällt (Einträge unter Tagebuch → Woche & Monat)
  } else if (n && !nutReady(n)) {
    h += nutPhaseOnly(n);
  } else if (!n) {
    h += `<div class="card wiz-q">
        <div class="wiz-q-head"><span class="wiz-q-icon" aria-hidden="true">🍽️</span><h2>Ernährung</h2></div>
        <p class="hint explain wiz-q-explain">Wähle dein Ernährungsziel: Aufbau, Body Recomposition, Diät oder Minicut. Die App schätzt dann
          deinen Kalorienbedarf und sagt dir, wie viele Kalorien, Eiweiß, Fett und Kohlenhydrate pro Tag zu deinem Ziel passen.</p>
        <button class="btn primary" data-action="nut-setup">Los geht's</button>
      </div>`;
  } else if (kg == null) {
    h += `<div class="card"><p>Trag unten dein aktuelles Körpergewicht ein, dann berechnet die App wieder dein Tagesziel.</p></div>`;
  } else {
    const ph = NUT_PHASES[n.phase];
    const c = nutCalc(n, kg);
    const week = nutWeekNo(n);
    const stage = n.phase === 'minicut' ? nutMinicutStage(n) : null;
    const weekText = !stage ? `Woche ${week}` : stage === 'cut'
      ? `Woche ${week} von ${Math.min(n.weeks, NUT_MINICUT_MAX)}${n.round === 2 ? ' | 2. Durchgang' : ''}` : stage === 'maint' ? 'Erhaltungswoche' : 'abgeschlossen';
    // v238 (User 2026-11-14): „Heute gegessen“ ganz oben (unter dem Tagebuch-Knopf), direkt darunter das Tagesziel, dann Phase und Hinweise
    // v243: „Heute gegessen“ steht im Tagebuch (im Stil der Tagesziel-Karte), hier nur noch das Tagesziel
    // v260 (User 2026-11-14): Tagesziel-Karte nicht mehr im Reiter, Anpassen (Kalorien, Makros) steht im Tagebuch (nutGoalToolsHtml)
    h += `${typeof nutPlanActive === 'function' && nutPlanActive() ? nutPlanCard() : ''}
      ${typeof ppNoteHtml === 'function' ? ppNoteHtml(n) : ''}
      ${nutGoalCard2(n, c, ph, weekText)}
      ${nutPauseCard(n)}
      ${typeof ppCardHtml === 'function' ? ppCardHtml(n) : ''}
      ${nutLowCard(n, nutForDay(c))}
      ${nutPhaseHint(n)}
      ${(prog => prog ? `<div class="card nut-progress"><h2>Dein Verlauf</h2>${prog}</div>` : '')(nutProgressCard(n, c, kg))}
      ${nutTrainCard(n)}
      ${(more => more.trim() ? `<div class="card nut-more-list"><h2>Mehr</h2>${more}</div>` : '')(
        (typeof mcAvailable === 'function' && mcAvailable() && !mcOn()
          ? '<button class="btn nav" data-action="mc-onoff" data-v="1">🌸 Zykluskalender einschalten<small>Freiwillig: Periode eintragen, Phasen sehen, Wassertage beim Gewicht herausrechnen</small></button>' : '')
        + (feat('nut-explain') ? nutExplain(n, c, kg).replace('class="card nut-help"', 'class="nut-help nut-more-row"') : ''))}
      <p class="hint nut-small nut-disclaimer">Alle Werte sind Richtwerte für gesunde Erwachsene. Bei Vorerkrankungen, in
        Schwangerschaft und Stillzeit oder bei Essstörungen bitte vorher ärztlich abklären.</p>`;
  }
  // Ernährungstagebuch (und darunter Plan-Import) auch ohne fertig eingerichtete Phase erreichbar
  // v340: der Knopf „Eigenen Ernährungsplan übernehmen“ steht immer oben in „Ernährungspläne“
  // Nur ein Health-Knopf: steht in „Heute gegessen“; ohne diese Karte (Ernährung nicht eingerichtet) hier beim Gewicht
  h = h.replace('{{BW}}', () => bwBlock());
  if (typeof photoBtnHtml === 'function') h += photoBtnHtml();  // Fortschrittsfotos (v213, media.js)
  if (typeof measBtnHtml === 'function') h += measBtnHtml();  // Körpermaße nur beiläufig (v207, User-Wunsch)
  h += nutBasicsCard(dayKcal, kg != null ? kg : currentBodyweight());
  return h;
}

// Linien im Gewichtsdiagramm: Zielgewicht (waagerecht) und Beginn der Phasen (senkrecht)
function nutMarks() {
  const n = data.nutrition;
  if (!n) return null;
  const starts = [...(n.history || []).map(x => ({ t: x.from, phase: x.phase })), { t: n.since, phase: n.phase }];
  return {
    goal: n.phase !== 'recomp' ? n.goalKg : null,
    phases: starts.map(s => ({ t: Date.parse(s.t + 'T00:00:00'), label: NUT_PHASES[s.phase].label })),
  };
}

// Neue Phase beginnen (alte Phase in die Historie)
function nutBeginPhase(n, phase, kg) {
  const prev = data.nutrition;
  const history = prev ? [...(prev.history || [])] : [];
  if (prev && prev.since !== todayISO()) history.push({ phase: prev.phase, from: prev.since, to: todayISO() });
  return { ...n, phase, since: todayISO(), startKg: kg, adjust: 0, adjustAt: null, changedAt: null, kcalOwn: null, history,
    breakOn: null, breakTotal: 0, breakEnd: null, maintFrom: null, noBreak: null, pause: null, pauses: [], pauseTotal: 0, resumeAt: null, weekSeen: null };
}

views.nutrition = { title: 'Ernährung', tab: 'nutrition', render: renderNutrition, after: () => { drawChart(); nutPctUpdate(); } };
views.nutphase = { title: 'Ernährungsziel', tab: 'nutrition', back: 'nutrition', cancel: () => NUT_CANCEL, render: renderNutPhase };
views.nutbody = { title: 'Deine Angaben', tab: 'nutrition', cancel: () => NUT_CANCEL, render: renderNutBody,
  back: () => [nutDraft && nutDraft.flow === 'nutphase' ? 'nutphase' : 'nutrition', {}] };
views.nutgoal = { title: 'Ziel & Tempo', tab: 'nutrition', back: 'nutbody', cancel: () => NUT_CANCEL, render: renderNutGoal };

Object.assign(actions, {
  // Tagesziel selbst ändern: die Differenz zur Berechnung wird als Anpassung gespeichert (Makros rechnen sich mit)
  'nut-kcal-edit': () => {
    nutMacroEdit = null;
    nutKcalEdit = { v: String(nutCalc(data.nutrition, nutWeight()).kcal) };
    render();
  },
  'nut-kcal-step': el => {
    nutKcalEdit.v = String(Math.max(0, (parseNum(nutKcalEdit.v) || 0) + Number(el.dataset.d)));
    const inp = document.getElementById('nut-kcal-in');
    if (inp) inp.value = nutKcalEdit.v;
    document.getElementById('nut-kcal-prev').innerHTML = nutKcalPreview(data.nutrition, nutWeight(), parseNum(nutKcalEdit.v));
  },
  'nut-kcal-cancel': () => { nutKcalEdit = null; render(); },
  'nut-kcal-save': () => {
    const n = data.nutrition, kg = nutWeight();
    const v = parseNum(nutKcalEdit.v);
    const floor = n.sex === 'm' ? 1500 : 1200;
    if (v == null || v > 6000) { alert('Bitte eine Kalorienzahl bis 6.000 kcal eintragen.'); return; }
    if (v < floor) { alert(`Weniger als ${deNum(floor)} kcal am Tag empfiehlt die App nicht, sonst fehlen schnell Nährstoffe.`); return; }
    const own = Math.round(v / 10) * 10;
    Object.assign(n, { kcalOwn: own === nutKcalBase(n, kg) ? null : own, adjust: 0, adjustAt: todayISO(), changedAt: todayISO() });
    nutKcalEdit = null;
    saveData();
    toast(`Tagesziel: ${nutKcal(nutCalc(n, kg).kcal)} kcal`);
    render();
  },
  // Tage ohne Eintrag mit dem Tagesziel füllen (src 'auto')
  'nut-gaps-pick': () => { nutGapPick = !nutGapPick; render(); },
  // manuell: Ernährungskalender im Monat des ersten fehlenden Tages, fehlende Tage markiert (renderFoodCal)
  'nut-gaps-manual': () => {
    const gaps = nutGapDays();
    nutGapPick = false;
    go('foodcal', { month: (gaps[0] || todayISO()).slice(0, 7), from: 'nutrition', date: gaps[0] || todayISO() });
  },
  'nut-gaps-fill': () => {
    const gaps = nutGapDays();
    const c = nutCalc(data.nutrition, nutWeight());
    if (!gaps.length || !askOk(`${gaps.length} Tag${gaps.length === 1 ? '' : 'e'} ohne Eintrag mit deinem Tagesziel nachtragen?\n\n`
      + `${nutKcal(c.kcal)} kcal | Eiweiß ${c.protein} g | Kohlenhydrate ${c.carbs} g | Fett ${c.fat} g pro Tag`)) return;
    for (const d of gaps) saveIntake(d, { kcal: c.kcal, p: c.protein, c: c.carbs, f: c.fat }, 'auto');
    nutGapPick = false;
    saveData();
    toast(`${gaps.length} Tag${gaps.length === 1 ? '' : 'e'} nachgetragen ✔`);
    render();
  },
  // Wochen-Karte der Diät gesehen: erst in der nächsten Woche wieder
  'nut-week-ok': () => { data.nutrition.weekSeen = nutWeekNo(data.nutrition); saveData(); render(); },
  // Erhaltungswoche im Deload für diesen Zyklus abwählen
  'nut-nobreak': () => {
    if (!askOk('Diese Deload-Woche trotzdem im Defizit essen?\n\nDas Tagesziel geht sofort wieder auf dein Defizit. Ab dem nächsten Deload gilt wieder die Erhaltungswoche.')) return;
    data.nutrition.noBreak = cycleInfo().cycleStart;
    nutSync();
    saveData();
    render();
  },
  'nut-hints': el => {
    data.profile = { ...(data.profile || {}), nutHints: el.dataset.v === '1' };
    saveData();
    toast(el.dataset.v === '1' ? 'Hinweise zur Ernährung an' : 'Hinweise zur Ernährung aus');
    render();
  },
  // Grundlagen-Karte: beim ersten Zuklappen bzw. „Verstanden“ als gelesen merken (danach immer zugeklappt)
  'nut-basics-sum': el => {
    if (!el.parentElement.open || (data.profile && data.profile.nutBasicsSeen)) return;
    data.profile = { ...(data.profile || {}), nutBasicsSeen: true };
    saveData();
    const ok = el.parentElement.querySelector('[data-action="nut-basics-ok"]');
    if (ok) ok.remove();
  },
  'nut-basics-ok': el => {
    data.profile = { ...(data.profile || {}), nutBasicsSeen: true };
    saveData();
    el.closest('details').open = false;
    el.remove();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  'nut-setup': () => { nutMacroEdit = null; nutInit('nutphase'); go('nutphase'); },
  'nut-edit': () => { nutMacroEdit = null; nutInit('nutbody'); go('nutbody'); },
  'nut-phase': el => {
    const p = el.dataset.p;
    if (nutDraft.phase !== p) {
      nutDraft.phase = p;
      nutDraft.pace = p === 'recomp' ? 'light' : 'normal';  // Standard-Tempo; Recomp leicht unter Erhaltung
      nutDraft.goalKg = '';  // Zielgewicht der alten Phase passt meist nicht (z. B. Diät -> Aufbau)
      nutDraft.trainAdapt = null;  // bei Diät/Minicut jedes Mal neu fragen
      nutDraft.underOk = false;    // v374: Warnung bei Untergewicht neu bestätigen
    }
    go('nutbody');
  },
  'nut-self': el => { nutDraft.selfEst = nutDraft.selfEst === el.dataset.k ? null : el.dataset.k; render(); },  // v374, nochmal tippen = keine Angabe
  'nut-sex': el => { nutDraft.sex = el.dataset.k; render(); },
  'nut-act': el => { nutDraft.activity = Number(el.dataset.k); render(); },
  'nut-hints-pick': el => { nutDraft.hints = el.dataset.v === '1'; render(); },
  'nut-body-next': () => {
    const err = nutBodyErrors(nutNumbers(nutDraft));
    if (err) { alert(err); return; }
    if (nutDraft.hints == null) { alert('Bitte wähle noch, ob die App dir Hinweise zur Ernährung geben soll.'); return; }
    // v374 (User 2026-11-24): Untergewicht: kein Minicut, Diät nur nach deutlicher Warnung
    const nb = nutNumbers(nutDraft);
    if (nutBodyType(nb, nb.kg) === 'under') {
      if (nutDraft.phase === 'minicut') {
        alert('Nach deinen Angaben bist du untergewichtig. Einen Minicut bietet die App dann nicht an, das starke Defizit würde dir eher schaden. Bitte wähle ein anderes Ernährungsziel.');
        go('nutphase');
        return;
      }
      if (nutDraft.phase === 'diet' && !nutDraft.underOk) {
        uiDialog({ title: '⚠️ Diät bei Untergewicht', msg: NUT_UNDER_WARN, choices: [
          { label: 'Lieber Aufbau oder Rekomposition', value: 'back', primary: true }, { label: 'Trotzdem Diät starten', value: 'go' }] })
          .then(v => { if (v === 'go') { nutDraft.underOk = true; go('nutgoal'); } else go('nutphase'); });
        return;
      }
    }
    go('nutgoal');
  },
  'nut-pace': el => { nutDraft.pace = el.dataset.k; render(); },
  'nut-weeks': el => { nutDraft.weeks = Number(el.dataset.w); render(); },
  'nut-train-pick': el => { nutDraft.trainAdapt = el.dataset.v === '1'; render(); },
  'nut-td-pick': el => { nutDraft.trainDay = el.dataset.v === '1'; if (nutDraft.trainDay && !nutDraft.trainDayKcal) nutDraft.trainDayKcal = NUT_TD_KCAL; render(); },
  'nut-td-dstep': el => {
    nutDraft.trainDayKcal = Math.min(NUT_TD_MAX, Math.max(NUT_TD_MIN, (nutDraft.trainDayKcal || NUT_TD_KCAL) + Number(el.dataset.d) * NUT_TD_STEP));
    render();
  },
  'nut-train-toggle': () => {
    const n = data.nutrition;
    n.trainAdapt = !n.trainAdapt;
    saveData();
    toast(n.trainAdapt ? 'Training wird angepasst, ab dem nächsten Training' : 'Training läuft wieder wie im Plan');
    render();
  },
  'nut-save': () => {
    const d = nutNumbers(nutDraft);
    if ((d.phase === 'diet' || d.phase === 'minicut') && d.trainAdapt == null && !feat('nut-train-q')) d.trainAdapt = true;
    if ((d.phase === 'diet' || d.phase === 'minicut') && d.trainAdapt == null) {
      alert('Bitte noch auswählen, ob dein Trainingsplan an dein Ernährungsziel angepasst werden soll.');
      return;
    }
    if (nutDraft.trainDay == null) { alert('Bitte noch auswählen, ob du an Trainingstagen mehr Kalorien bekommen möchtest.'); return; }
    if (d.goalKg != null && (d.goalKg < 30 || d.goalKg > 300)) { alert('Bitte ein gültiges Zielgewicht eintragen oder das Feld leer lassen.'); return; }
    if (d.goalKg != null && d.phase === 'bulk' && d.goalKg <= d.kg) { alert('Im Aufbau sollte das Zielgewicht über deinem aktuellen Gewicht liegen.'); return; }
    if (d.goalKg != null && (d.phase === 'diet' || d.phase === 'minicut') && d.goalKg >= d.kg) { alert('In der Diät sollte das Zielgewicht unter deinem aktuellen Gewicht liegen.'); return; }
    // eingetipptes Gewicht als heutigen Eintrag speichern, wenn es vom letzten abweicht
    const last = currentBodyweight();
    if (last != null && Math.abs(last - d.kg) >= TYPO_KG && !askOk(`${fmtNum(d.kg)} kg? Zuletzt waren es ${fmtNum(last)} kg.\n\nOK = so speichern, Abbrechen = zurück`)) return;
    if (last == null || Math.abs(last - d.kg) >= 0.05) saveBodyweight(todayISO(), d.kg);
    const n = {
      sex: d.sex, age: d.age, ageYear: new Date().getFullYear(), height: d.height, bodyFat: d.bodyFat, activity: d.activity,
      selfEst: nutDraft.selfEst || null,  // v374: Selbsteinschätzung (optional)
      phase: d.phase, pace: d.pace, goalKg: d.phase === 'recomp' ? null : d.goalKg, weeks: Math.min(d.weeks || NUT_MINICUT_MAX, NUT_MINICUT_MAX),
      macroPct: d.macroPct || null,  // eigene Makro-Aufteilung bleibt auch beim Phasenwechsel
      // v259: Bezug für die Körperfett-Schätzung im Aufbau, neu bei jedem geänderten Wert
      bfRef: d.bodyFat == null ? null : data.nutrition && data.nutrition.bfRef && data.nutrition.bodyFat === d.bodyFat ? data.nutrition.bfRef
        : { bf: d.bodyFat, kg: d.kg, date: todayISO() },
      trainAdapt: d.trainAdapt == null ? null : d.trainAdapt,
      trainDay: !!nutDraft.trainDay, trainDayKcal: nutDraft.trainDayKcal || NUT_TD_KCAL,  // v369
    };
    const prev = data.nutrition;
    // v315: anderes Ernährungsziel beendet einen Phasenplan (Rückfrage); gleiches Ziel: der Plan übernimmt das neue Tempo
    const plan = typeof ppPlan === 'function' && prev ? ppPlan(prev) : null;
    if (plan && prev.phase !== d.phase && !askOk('Du hast einen Phasenplan. Mit einem anderen Ernährungsziel endet er, und die App wechselt nicht mehr automatisch.\n\nTrotzdem wechseln?')) return;
    data.nutrition = prev && prev.phase === d.phase
      ? { ...prev, ...n, kcalOwn: prev.pace === n.pace ? prev.kcalOwn : null }  // anderes Tempo: wieder der Wert der App
      : nutBeginPhase(n, d.phase, nutWeight());
    if (plan && prev.phase === d.phase) data.nutrition.plan = { ...plan, phases: plan.phases.map((p, i) => i ? p : { ...p, pace: n.pace, ...(p.phase === 'minicut' ? { weeks: n.weeks } : {}) }) };
    if (typeof nutDraft.hints === 'boolean') data.profile = { ...(data.profile || {}), nutHints: nutDraft.hints };  // v266
    nutDraft = null;
    saveData();
    toast('Ernährung gespeichert ✔');
    go('nutrition');
  },
  'nut-adjust': el => {
    const n = data.nutrition;
    nutAdaptBump(n, Number(el.dataset.v));  // v266
    if (n.kcalOwn != null) n.kcalOwn += Number(el.dataset.v);
    else n.adjust = (n.adjust || 0) + Number(el.dataset.v);
    n.adjustAt = todayISO(); n.changedAt = todayISO();
    saveData();
    toast(`Tagesziel angepasst: ${nutSigned(Number(el.dataset.v), 'kcal')}`);
    render();
  },
  // Vorschlag ablehnen: Vergleich beginnt neu, das Tagesziel bleibt
  'nut-suggest-later': () => {
    data.nutrition.changedAt = todayISO();
    saveData();
    const ph = data.nutrition.phase;
    toast(ph === 'bulk' ? 'Die App vergleicht neu, sobald fünf Wochen neue Wiegungen da sind' : ph === 'diet' ? 'Die App vergleicht neu, sobald drei Wochen neue Wiegungen da sind' : `Die App vergleicht neu, sobald ${NUT_CMP_N * 2} neue Wiegungen da sind`);
    render();
  },
  'nut-pause-open': () => { nutPauseForm = true; render(); },
  'nut-pause-ask': () => {
    if (!askOk('Ernährungsziel unterbrechen?\n\nZum Beispiel im Urlaub. In der Zeit gibt es kein Tagesziel und keine Hinweise, und was du einträgst oder wiegst, zählt nicht für die Kalorienvorschläge. Als Nächstes wählst du, ab wann und bis wann.')) return;
    nutPauseForm = true;
    render();
    const f = $view.querySelector('.nut-pause');
    if (f) f.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
  'nut-pause-cancel': () => { nutPauseForm = false; render(); },
  'nut-pause-save': () => {
    const n = data.nutrition;
    const from = document.getElementById('nut-pause-from').value, to = document.getElementById('nut-pause-to').value || null;
    if (!from) { alert('Bitte einen Beginn eintragen.'); return; }
    if (to && to < from) { alert('Das Enddatum liegt vor dem Beginn.'); return; }
    if (from < n.since) { alert('Der Beginn liegt vor dem Start deines Ernährungsziels.'); return; }
    n.pause = { from, to };
    nutPauseForm = false;
    nutSync();
    saveData();
    render();
  },
  // Laufende Unterbrechung beenden (gestern war der letzte Tag) oder geplante absagen
  'nut-pause-end': () => {
    if (!askOk('Unterbrechung beenden?\n\nAb heute gilt wieder dein normales Tagesziel.')) return;  // v350
    nutPauseFinish(data.nutrition, addDaysISO(todayISO(), -1));
    saveData();
    render();
  },
  'nut-adjust-reset': () => {
    const own = data.nutrition.kcalOwn != null;
    if (!askOk(`${own ? 'Eigenes Tagesziel' : 'Anpassung aus dem Gewichtsverlauf'} zurücksetzen?\n\nDas Tagesziel wird wieder nur aus deinen Angaben berechnet.`)) return;
    Object.assign(data.nutrition, { adjust: 0, adjustAt: todayISO(), changedAt: todayISO(), kcalOwn: null });
    saveData(); render();
  },
  // Minicut: zweiter (und letzter) Durchgang mit demselben Defizit
  'nut-minicut-again': () => {
    const n = data.nutrition;
    data.nutrition = nutBeginPhase({ ...n, round: 2, plan: null }, 'minicut', nutWeight());
    saveData();
    toast('Zweiter Minicut-Durchgang ⚡');
    render();
  },
  'nut-to-bulk': () => {
    const n = data.nutrition;
    data.nutrition = nutBeginPhase({ ...n, pace: 'normal', goalKg: null, round: 1, plan: null }, 'bulk', nutWeight());
    saveData();
    toast('Weiter mit Aufbau 💪');
    render();
  },
  'nut-pct-edit': () => {
    nutKcalEdit = null;
    const c = nutCalc(data.nutrition, nutWeight());
    const pct = nutPctOf(c);
    nutMacroEdit = { p: String(pct.p), f: String(pct.f), c: String(pct.c), kcal: c.kcal };
    render();
    nutPctUpdate();
  },
  'nut-pct-cancel': () => { nutMacroEdit = null; render(); },
  'nut-pct-save': () => {
    const e = nutMacroEdit;
    const v = Object.fromEntries(NUT_MACROS.map(([k]) => [k, parseNum(e[k])]));
    if (Object.values(v).some(x => x == null || x < 0 || x > 100)) { alert('Bitte für alle drei Werte eine Zahl zwischen 0 und 100 eintragen.'); return; }
    const sum = round1(v.p + v.f + v.c);
    if (sum !== 100) { alert(`Zusammen müssen es 100 % sein, gerade sind es ${fmtNum(sum)} %.`); return; }
    data.nutrition.macroPct = v;
    nutMacroEdit = null;
    saveData();
    toast('Eigene Aufteilung gespeichert ✔');
    render();
  },
  'nut-pct-reset': () => {
    // v327 (User): erst nachfragen, statt sofort zurückzusetzen
    const m = data.nutrition.macroPct;
    if (m && !askOk(`Makros auf die Empfehlung der App zurücksetzen?\n\nDeine eigene Aufteilung (${m.p} / ${m.f} / ${m.c} %) wird dabei gelöscht.`)) return;
    data.nutrition.macroPct = null;
    saveData();
    toast('Wieder die Empfehlung der App');
    render();
  },
  // Gegessen von Hand eintragen / ändern (data-date: dieser Tag, vorhandene Werte vorausgefüllt)
  'nut-intake-open': el => {
    const x = intakeOn(el.dataset.date) || {};
    const s = v => v == null ? '' : String(v);
    nutIntakeForm = { date: el.dataset.date, kcal: s(x.kcal), p: s(x.p), c: s(x.c), f: s(x.f) };
    render();
    const form = $view.querySelector('.nut-intake-form');
    if (form) form.scrollIntoView({ block: 'nearest' });
  },
  'nut-intake-cancel': () => { nutIntakeForm = null; render(); },
  'nut-intake-save': () => {
    const f = nutIntakeForm;
    if (foodOn(f.date || todayISO()).length) {
      alert('Für diesen Tag hast du Lebensmittel im Ernährungstagebuch eingetragen. Die Tagessumme kommt automatisch von dort.');
      return;
    }
    const num = k => (String(f[k]).trim() === '' ? null : parseNum(f[k]));
    const v = { kcal: num('kcal'), p: num('p'), c: num('c'), f: num('f') };
    if (Object.values(v).some(x => x != null && (x < 0 || x > 15000))) { alert('Bitte nur Zahlen zwischen 0 und 15.000 eintragen.'); return; }
    if (v.kcal == null && [v.p, v.c, v.f].every(x => x == null)) { alert('Bitte mindestens die Kalorien oder die Makros eintragen.'); return; }
    if (v.kcal == null) v.kcal = Math.round((v.p || 0) * 4 + (v.c || 0) * 4 + (v.f || 0) * 9);
    for (const k of Object.keys(v)) if (v[k] != null) v[k] = Math.round(v[k]);
    saveIntake(f.date || todayISO(), v, 'hand');
    nutIntakeForm = null;
    saveData();
    toast('Gespeichert ✔');
    render();
  },
  'nut-intake-edit': el => {
    const d = el.dataset.date; actions['nut-intake-open'](el); go('food', { date: d });
    const form = $view.querySelector('.nut-intake-form');  // v336: das Formular steht jetzt unter den Mahlzeiten
    if (form) form.scrollIntoView({ block: 'center' });
  },
  'nut-intake-del': el => {
    const food = foodOn(el.dataset.date).length;
    if (!askOk(food ? `Alle ${food} Lebensmittel vom ${fmtDate(el.dataset.date + 'T12:00:00')} aus dem Ernährungstagebuch löschen?`
      : `Eintrag vom ${fmtDate(el.dataset.date + 'T12:00:00')} löschen?`)) return;
    data.foodLog = data.foodLog.filter(x => x.date !== el.dataset.date);
    data.intake = data.intake.filter(x => x.date !== el.dataset.date);
    saveData(); render();
  },
  // Gemessenen Bedarf übernehmen: Anpassung = gemessen − Schätzformel (ersetzt die bisherige Anpassung)
  'nut-measured-apply': el => {
    nutAdaptBump(data.nutrition, Number(el.dataset.v) - (data.nutrition.adjust || 0));  // v266
    Object.assign(data.nutrition, { adjust: Number(el.dataset.v), adjustAt: todayISO(), changedAt: todayISO(), kcalOwn: null });
    saveData();
    toast('Tagesziel rechnet jetzt mit deinem gemessenen Bedarf');
    render();
  },
});

fields['nut-in'] = el => { nutDraft[el.dataset.k] = el.value; };
fields['nut-pct'] = el => { nutMacroEdit[el.dataset.k] = el.value; nutPctUpdate(); };
fields['nut-intake'] = el => { nutIntakeForm[el.dataset.k] = el.value; };
fields['nut-kcal'] = el => {
  nutKcalEdit.v = el.value;
  document.getElementById('nut-kcal-prev').innerHTML = nutKcalPreview(data.nutrition, nutWeight(), parseNum(el.value));
};
