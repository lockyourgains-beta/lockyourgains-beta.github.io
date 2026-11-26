/* LockYourGains | © 2026 Alexander Hundt | Alle Rechte vorbehalten – siehe LICENSE */
'use strict';
/* Muskelkarte (v314, User-Wunsch 2026-11-17): Körper von vorne und hinten, Zielmuskel rot (leuchtet), mitbeteiligte Muskeln orange.
   Zielmuskel = Muskelgruppe der Übung (groupOf), „mit dabei“ aus dem Bibliothekstext (FIG_TEXT/SHORT_EX, Feld also).
   Gezeichnet wird je Ansicht nur die rechte Körperhälfte (x ≥ 50), die linke ist gespiegelt. Eigene Zeichnung, keine fremden Vorlagen. */

// Muskelflächen je Ansicht: [Schlüssel, Pfad]. Schlüssel = Muskelgruppe aus MUSCLES, dazu 'hueftbeuger' (nur für „mit dabei“).
const MM_FRONT = [
  ['trapez', 'M55,29 Q62,34 70,38 L59,39 Q55,35 55,29 Z'],
  ['schulter_vorne', 'M60,40 Q69,36 75,41 Q74,48 70,54 Q64,48 60,42 Z'],
  ['schulter_seite', 'M76,42 Q81,46 80,56 Q76,57 72,55 Q75,49 76,42 Z'],
  ['brust', 'M51,41 L59,41 Q66,46 69,56 Q65,64 56,66 Q51,66 51,60 Z'],
  ['bizeps', 'M70,58 Q76,57 79,61 Q81,72 78,84 Q74,86 71,82 Q68,70 70,58 Z'],
  ['unterarme', 'M72,88 Q78,86 81,90 Q85,104 84,121 Q81,123 79,121 Q74,106 72,88 Z'],
  ['lat', 'M66,60 Q70,59 70,66 L68,72 Q65,67 66,60 Z'],
  ['bauch', 'M51,68 L57,67 Q59,86 58,104 Q55,110 51,111 Z'],
  ['bauch', 'M59,69 Q66,67 69,74 Q68,89 65,100 Q61,104 59,104 Q61,86 59,69 Z'],
  ['hueftbeuger', 'M58,107 Q63,105 66,109 Q63,116 59,120 Q57,114 58,107 Z'],
  ['abduktoren', 'M67,104 Q71,106 72,114 Q70,122 68,124 Q66,115 67,104 Z'],
  ['adduktoren', 'M51,112 Q55,112 57,121 Q56,128 54,135 Q51,131 51,121 Z'],
  ['quadrizeps', 'M60,122 Q66,113 71,119 Q74,135 72,152 Q68,158 64,156 Q60,140 60,122 Z'],
  ['quadrizeps', 'M55,129 Q58,125 60,131 Q62,146 63,156 Q58,158 56,152 Q53,140 55,129 Z'],
  ['waden', 'M58,167 Q62,165 66,167 Q69,181 66,196 Q63,200 61,197 Q57,182 58,167 Z'],
];
const MM_BACK = [
  ['trapez', 'M50,26 L55,27 Q60,33 70,38 Q62,42 58,48 L53,70 L50,72 Z'],
  ['schulter_hinten', 'M64,40 Q72,37 76,42 Q75,50 72,54 Q67,48 64,42 Z'],
  ['schulter_seite', 'M77,42 Q81,46 80,56 Q76,57 73,54 Q76,49 77,42 Z'],
  ['schulter_hinten', 'M59,47 Q64,45 68,50 Q66,57 61,59 Q58,54 59,47 Z'],
  ['lat', 'M55,61 Q62,59 69,57 Q72,65 68,79 Q62,94 56,98 Q54,84 55,61 Z'],
  ['ruecken_unten', 'M51,75 L54,73 Q56,90 57,104 Q54,108 51,108 Z'],
  ['trizeps', 'M71,57 Q77,56 80,60 Q82,72 79,84 Q75,86 72,82 Q69,70 71,57 Z'],
  ['unterarme', 'M72,88 Q78,86 81,90 Q85,104 84,121 Q81,123 79,121 Q74,106 72,88 Z'],
  ['abduktoren', 'M59,101 Q66,99 70,105 L69,110 Q63,105 58,107 Z'],
  ['gesaess', 'M51,109 Q60,105 69,110 Q72,119 68,128 Q60,132 51,129 Z'],
  ['beinbeuger', 'M53,133 Q57,131 61,132 Q62,146 61,158 Q57,159 55,155 Q52,145 53,133 Z'],
  ['beinbeuger', 'M62,132 Q67,131 69,134 Q71,147 67,158 Q64,160 62,158 Q63,146 62,132 Z'],
  ['adduktoren', 'M51,131 L52,133 Q52,142 54,150 L51,147 Z'],
  ['waden', 'M56,166 Q61,163 66,166 Q69,177 66,189 Q62,193 58,189 Q55,177 56,166 Z'],
];
// Körperumriss (rechte Hälfte): liegt unter den Muskeln, die Fugen dazwischen wirken wie Haut
const MM_SKIN = 'M50,4 C56,4 59.5,9 59.5,16 C59.5,22 57.5,26 55.5,28 L56,31 Q62,35 72,37.5 Q80.5,40 82,47 Q83.5,56 81.5,62'
  + ' Q83.5,72 81.5,86 Q86.5,100 86.5,118 Q88.5,124 87.5,132 Q86,142 80.5,142.5 Q77,137 77.8,124 Q73.5,108 70.5,92'
  + ' Q70,98 69.5,100 Q73,107 73.5,116 Q75.5,134 72.5,156 Q69.5,161 68.5,166 Q70.5,180 67.5,197 Q71.5,205 70.5,213.5'
  + ' L56.5,213.5 Q55.5,205 58.5,197 Q55.5,182 56.5,166 Q56.5,161 55.5,158 Q52.5,142 52,126 L50,124 Z';

const MM_ALL = ['brust', 'schulter_vorne', 'schulter_seite', 'schulter_hinten', 'trapez', 'bizeps', 'trizeps', 'unterarme', 'lat',
  'bauch', 'ruecken_unten', 'gesaess', 'abduktoren', 'adduktoren', 'quadrizeps', 'beinbeuger', 'waden', 'hueftbeuger'];
// „mit dabei“-Text → Muskelflächen (Reihenfolge wichtig: Genaueres zuerst)
const MM_RULES = [
  [/herz|ausdauer/, []],
  [/ganze?r? körper/, MM_ALL],
  [/vordere schulter/, ['schulter_vorne']], [/hintere schulter|rotatoren/, ['schulter_hinten']], [/seitliche schulter/, ['schulter_seite']],
  [/^schulter/, ['schulter_vorne', 'schulter_seite', 'schulter_hinten']],
  [/brust/, ['brust']], [/unterarm|griff|handgelenk/, ['unterarme']], [/trizeps/, ['trizeps']], [/bizeps/, ['bizeps']], [/^arme/, ['bizeps', 'trizeps']],
  [/\blat\b/, ['lat']], [/trapez/, ['trapez']], [/oberer rücken/, ['trapez', 'schulter_hinten']], [/unterer rücken/, ['ruecken_unten']],
  [/^rücken/, ['lat', 'trapez', 'ruecken_unten']], [/vorderer rumpf/, ['bauch']], [/rumpf/, ['bauch', 'ruecken_unten']], [/bauch/, ['bauch']],
  [/hüftbeuger/, ['hueftbeuger']], [/kleiner gesäß|seitliche hüfte|abduktor|^hüfte/, ['abduktoren']], [/gesäß/, ['gesaess']],
  [/adduktor/, ['adduktoren']], [/beinbeuger/, ['beinbeuger']], [/waden/, ['waden']],
  [/^beine/, ['quadrizeps', 'beinbeuger', 'gesaess', 'waden']], [/oberschenkel/, ['quadrizeps', 'beinbeuger']], [/quadrizeps/, ['quadrizeps']],
];
function mmFromText(also) {
  const out = new Set();
  for (const part of String(also || '').toLowerCase().split(',')) {
    const p = part.trim();
    const r = MM_RULES.find(([rx]) => rx.test(p));
    if (r) r[1].forEach(k => out.add(k));
  }
  return out;
}

// Zielmuskel und Mitbeteiligte einer Übung: { primary: Set, secondary: Set } oder null (Ausdauer, unbekannt)
function mmMuscles(name, also) {
  const g = groupOf(planExercise(name) || { name });
  if (!g || g === 'ausdauer') return null;
  const primary = new Set(g === 'ganzkoerper' ? [] : [g]);
  const secondary = g === 'ganzkoerper' ? new Set(MM_ALL) : mmFromText(also);
  primary.forEach(k => secondary.delete(k));
  return primary.size || secondary.size ? { primary, secondary } : null;
}

function mmBody(shapes, x, m) {
  const cls = k => m.primary.has(k) ? 'mm-m p' : m.secondary.has(k) ? 'mm-m s' : 'mm-m';
  const half = `<path class="mm-skin" d="${MM_SKIN}"/>` + shapes.map(([k, d]) => `<path class="${cls(k)}" d="${d}"/>`).join('');
  return `<g transform="translate(${x},0)">${half}<g transform="translate(100,0) scale(-1,1)">${half}</g></g>`;
}

// Karte für die Bibliotheksseite
function muscleMapHtml(name, also) {
  const m = mmMuscles(name, also);
  if (!m) return '';
  const lbl = k => k === 'hueftbeuger' ? 'Hüftbeuger' : MUSCLES[k] || k;
  const sec = [...m.secondary].filter(k => k !== 'hueftbeuger' || m.secondary.size < MM_ALL.length);
  const all = m.secondary.size === MM_ALL.length;
  const names = ks => ks.map(k => `<span>${lbl(k)}</span>`).join(', ');  // je Name ein Textknoten, damit die Übersetzung greift
  return `<div class="card mm-card">
      <svg class="mm-svg" viewBox="0 0 210 220" role="img" aria-label="Beanspruchte Muskeln">
        ${mmBody(MM_FRONT, 0, m)}${mmBody(MM_BACK, 110, m)}
        <text class="mm-cap" x="50" y="219">vorne</text><text class="mm-cap" x="160" y="219">hinten</text>
      </svg>
      <p class="mm-legend">${m.primary.size ? `<span class="mm-item"><span class="mm-dot p"></span><span>Zielmuskel</span>: ${names([...m.primary])}</span>` : ''}
        ${sec.length ? `<span class="mm-item"><span class="mm-dot s"></span><span>Mit dabei</span>: ${all ? '<span>Ganzer Körper</span>' : names(sec)}</span>` : ''}</p>
    </div>`;
}
