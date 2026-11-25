/* LockYourGains | © 2026 Alex Hundt | Alle Rechte vorbehalten – siehe LICENSE */
// v393: Übungsfiguren (v396: auch Mobility und Yoga) – detaillierte Figur je Übung in der passenden Haltung mit Gerät (Ziel rot, mit dabei orange).
// Erzeugt aus den Entwurfsdateien in trainings-app-entwurf/figuren (fig3, mmseg, fig4, kit, scA–scC). Alles gekapselt, nach außen nur exFigHas / exFigSvg / exFigMob / exFigYoga.
(() => {
// ===== fig3.js =====
/* Prototyp 2: anatomische Figur von der Seite (Stil wie die Muskelkarte), in Pose gestellt, ohne Animation.
   Jedes Körperteil hat eigene Koordinaten: Ursprung = körpernahes Gelenk, Achse +y zum nächsten Gelenk, +x = vorne (Blick nach rechts).
   Rumpf: Ursprung Hüfte, Schulter bei (0,-L), +x = vorne. Fuß: Achse +x. */
const L2 = { torso: 52, upper: 30, fore: 27, thigh: 43, shin: 41 };
const SEG = {
  torso: { skin: 'M6,5 Q11,-6 12,-20 Q12.5,-31 14.5,-40 Q15,-49 10,-54 L5,-58 L5,-62 L-5,-62 L-5,-58 Q-10,-56 -12.5,-49 Q-14,-40 -11.5,-30 Q-9,-20 -10,-13 Q-16,-7 -15,1 Q-14,7 -8,8 Q0,9 6,5 Z',
    head: [1.5, -71, 9.6],
    mus: [['brust', 'M4,-51 Q11.5,-53 14.5,-45 Q15,-38 12,-34 Q7,-35 4,-39 Z'], ['bauch', 'M4,-32 Q10.5,-32 11.5,-21 Q11.5,-9 8.5,-3 Q5,-3 4,-8 Z'],
      ['lat', 'M-3,-45 Q-11,-46 -12.5,-38 Q-11.5,-28 -8,-23 Q-4,-29 -3,-36 Z'], ['trapez', 'M-2,-58 Q-9,-56 -12,-51 Q-8,-47 -3,-48 Z'],
      ['ruecken_unten', 'M-3,-21 Q-8,-21 -9.5,-15 Q-9.5,-9 -6.5,-7 Q-3,-11 -3,-17 Z'], ['gesaess', 'M-4,-6 Q-13.5,-8 -14.5,-1 Q-14.5,5 -8.5,7 Q-4,5 -4,-1 Z'],
      ['hueftbeuger', 'M3,-2 Q7,-4 9,0 Q7,4 4,4 Z']] },
  upper: { skin: 'M-6.5,-1 Q-7,-8 0,-8.5 Q7,-8 7,-1 Q6.5,13 5.5,25 Q4.5,32 0,33 Q-5,32 -5.5,25 Q-7,13 -6.5,-1 Z',
    mus: [['schulter_seite', 'M-6,-1 Q-6,-7.5 0,-8 Q6.5,-7.5 6.5,-1 Q5,6 0.5,11 Q-4.5,6 -6,-1 Z'],
      ['schulter_vorne', 'M0.5,-8 Q6.5,-7.5 6.5,-1 Q5,6 0.5,11 Q1,2 0.5,-8 Z'], ['schulter_hinten', 'M-0.5,-8 Q-6,-7.5 -6,-1 Q-4.5,6 -0.5,11 Q-1,2 -0.5,-8 Z'],
      ['bizeps', 'M1,12 Q6,13 6,21 Q5.5,28 2,29 Q1,21 1,12 Z'], ['trizeps', 'M-1,9 Q-6,13 -6,21 Q-5.5,28 -2,29 Q-1,19 -1,9 Z']] },
  fore: { skin: 'M-5,-2 Q0,-5.5 5,-2 Q6,8 4,22 Q3,28 0,28.5 Q-3,28 -4,22 Q-6,8 -5,-2 Z', hand: [0, 32.5, 3.8, 5.2],
    mus: [['unterarme', 'M-4,0 Q0,-3.5 4,0 Q5,8 3,16 Q0,18 -3,16 Q-5,8 -4,0 Z']] },
  thigh: { skin: 'M-9.5,-3 Q0,-9 9.5,-4 Q11.5,10 9.5,28 Q7.5,40 4.5,44 Q0,46.5 -4,44 Q-7.5,38 -7.5,28 Q-9.5,10 -9.5,-3 Z',
    mus: [['quadrizeps', 'M1,-1 Q9.5,0 10.5,12 Q9.5,28 5,38 Q2,36 1,28 Q0,12 1,-1 Z'], ['beinbeuger', 'M-1,6 Q-8,8 -8.5,20 Q-7.5,32 -3,40 Q-1,32 -1,20 Z'],
      ['abduktoren', 'M-1,-4 Q4,-7.5 8,-3.5 Q5,3 0,5 Z']] },
  shin: { skin: 'M-4.5,-2 Q0,-5 4.5,-2 Q5,10 3.5,30 Q2.5,40 0,41.5 Q-3,40.5 -4,30 Q-9,13 -4.5,-2 Z',
    mus: [['waden', 'M-2,2 Q-8.5,8 -7.5,18 Q-5.5,26 -2,28 Q-1,16 -2,2 Z']] },
  foot: { skin: 'M-3.5,-3 Q2,-4 4.5,0 L15,3 Q16.5,6.5 13,7.5 L-3,7.5 Q-5.5,3 -3.5,-3 Z', mus: [] },
};
const r2 = a => a * Math.PI / 180, d2 = a => [Math.cos(r2(a)), Math.sin(r2(a))], ad = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];
const deg = v => Math.atan2(v[1], v[0]) * 180 / Math.PI, sub = (a, b) => [a[0] - b[0], a[1] - b[1]], f1 = v => v.toFixed(1);
const GRIP = 4.5;  // Handmitte hinter dem Handgelenk
// Zwei-Glied-Kinematik: Winkel so, dass das Ende genau auf T liegt. bend = +1/-1 wählt die Seite des Mittelgelenks
function ik(S, T, l1, l2, bend) {
  const v = sub(T, S), d = Math.min(Math.hypot(...v), l1 + l2 - 0.01), base = deg(v);
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))) * 180 / Math.PI;
  const a1 = base + bend * a, M = ad(S, d2(a1), l1);
  return [a1, deg(sub(T, M))];
}
// Pose: ankle-Anker (stehend, Beinwinkel) oder hip-Anker; Arme und Beine als Winkel oder { to, bend } (Hand bzw. Knöchel genau dorthin)
function pose3(P) {
  let hip, leg = P.leg, leg2 = P.leg2 || P.leg;
  if (P.ankle) { const knee = ad(P.ankle, d2(leg[1]), -L2.shin); hip = ad(knee, d2(leg[0]), -L2.thigh); }
  else hip = P.hip;
  if (leg.to) leg = ik(hip, leg.to, L2.thigh, L2.shin, leg.bend);
  if (leg2.to) leg2 = ik(hip, leg2.to, L2.thigh, L2.shin, leg2.bend);
  const mid = ad(hip, d2(P.torso), L2.torso / 2), sh = P.curl ? ad(mid, d2(P.torso + P.curl), L2.torso / 2) : ad(hip, d2(P.torso), L2.torso);
  let arm = P.arm, arm2 = P.arm2 || P.arm;
  if (arm.to) arm = ik(sh, arm.to, L2.upper, L2.fore + GRIP, arm.bend);
  if (arm2.to) arm2 = ik(sh, arm2.to, L2.upper, L2.fore + GRIP, arm2.bend);
  const knee = ad(hip, d2(leg[0]), L2.thigh), ankle = ad(knee, d2(leg[1]), L2.shin);
  const knee2 = ad(hip, d2(leg2[0]), L2.thigh), ankle2 = ad(knee2, d2(leg2[1]), L2.shin);
  const el = ad(sh, d2(arm[0]), L2.upper), el2 = ad(sh, d2(arm2[0]), L2.upper);
  return { hip, mid, sh, knee, ankle, knee2, ankle2, el, el2, leg, leg2, arm, arm2,
    hand: ad(el, d2(arm[1]), L2.fore + GRIP), hand2: ad(el2, d2(arm2[1]), L2.fore + GRIP) };
}
const ROT = (name, ang) => name === 'torso' ? ang + 90 : name === 'foot' ? ang : ang - 90;
const tf = (at, name, ang) => `translate(${f1(at[0])},${f1(at[1])}) rotate(${f1(ROT(name, ang))})`;
function skinOf(name, at, ang) {
  const S = SEG[name];
  const extra = S.head ? `<rect x="-4.5" y="-63" width="9" height="7" class="sk"/><circle cx="${S.head[0]}" cy="${S.head[1]}" r="${S.head[2]}" class="sk"/>`
    : S.hand ? `<ellipse cx="${S.hand[0]}" cy="${S.hand[1]}" rx="${S.hand[2]}" ry="${S.hand[3]}" class="sk"/>` : '';
  return `<g transform="${tf(at, name, ang)}">${extra}<path class="sk" d="${S.skin}"/></g>`;
}
function musOf(name, at, ang, m) {
  const S = SEG[name], cls = k => m.p.includes(k) ? 'p' : m.s.includes(k) ? 's' : '';
  const shoulderSplit = ['schulter_vorne', 'schulter_hinten'].some(k => m.p.includes(k) || m.s.includes(k)) && !m.p.includes('schulter_seite');
  const ms = S.mus.filter(([k]) => !(k === 'schulter_seite' && shoulderSplit)).filter(([k]) => !(['schulter_vorne', 'schulter_hinten'].includes(k) && !shoulderSplit));
  return ms.length ? `<g transform="${tf(at, name, ang)}">${ms.map(([k, d]) => `<path class="m ${cls(k)}" d="${d}"/>`).join('')}</g>` : '';
}
const jc = (p, r) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" class="sk"/>`;
function limbs(J, side, m, foot) {  // side '' = nah, '2' = fern
  const leg = side ? J.leg2 : J.leg, arm = side ? J.arm2 : J.arm, knee = J['knee' + side], ankle = J['ankle' + side], el = J['el' + side];
  return {
    legSkin: skinOf('thigh', J.hip, leg[0]) + skinOf('shin', knee, leg[1]) + skinOf('foot', ankle, foot) + jc(knee, 5.2),
    legMus: musOf('thigh', J.hip, leg[0], m) + musOf('shin', knee, leg[1], m),
    armSkin: skinOf('upper', J.sh, arm[0]) + skinOf('fore', el, arm[1]) + jc(el, 4.6),
    armMus: musOf('upper', J.sh, arm[0], m) + musOf('fore', el, arm[1], m),
  };
}
const CLIP = '<clipPath id="tlo"><rect x="-40" y="-27" width="80" height="70"/></clipPath><clipPath id="tup"><rect x="-40" y="-120" width="80" height="95"/></clipPath>';
function torsoG(J, P, inner) {  // Rumpf (Haut oder Muskeln), bei P.curl in der Mitte geknickt
  if (!P.curl) return `<g transform="${tf(J.hip, 'torso', P.torso)}">${inner}</g>`;
  return `<g transform="${tf(J.hip, 'torso', P.torso)}"><g clip-path="url(#tlo)">${inner}</g><g transform="rotate(${P.curl} 0 ${-L2.torso / 2})"><g clip-path="url(#tup)">${inner}</g></g></g>`;
}
function torsoSkin(J, P) { const S = SEG.torso; return torsoG(J, P, `<g transform="rotate(${P.head || 0} 0 -58)"><rect x="-4.5" y="-63" width="9" height="7" class="sk"/><circle cx="${S.head[0]}" cy="${S.head[1]}" r="${S.head[2]}" class="sk"/>${P.head != null ? `<ellipse cx="${S.head[0] + 9}" cy="${S.head[1] + 1}" rx="1.6" ry="2.6" class="sk"/>` : ''}</g><path class="sk" d="${S.skin}"/>`) + (P.curl ? jc(J.mid, 11) : ''); }
function torsoMus(J, P, m, only) {
  const cls = k => m.p.includes(k) ? 'p' : m.s.includes(k) ? 's' : '';
  const ms = SEG.torso.mus.filter(([k]) => !only || m.p.includes(k));
  return ms.length ? torsoG(J, P, ms.map(([k, d]) => `<path class="m ${only ? 'p' : cls(k)}" d="${d}"/>`).join('')) : '';
}
function fig3Svg(ex) {
  const P = ex.pose, J = pose3(P), m = { p: ex.p || [], s: ex.s || [] }, foot = P.foot != null ? P.foot : 0;
  const E = ex.eq ? ex.eq(J, P) : {}, near = limbs(J, '', m, foot), far = limbs(J, '2', m, P.foot2 != null ? P.foot2 : foot);
  const off = P.farOff || [-3, -2];
  let h = `<line x1="6" y1="190" x2="234" y2="190" class="gr"/>${E.back || ''}`;
  h += `<g class="far" transform="translate(${off[0]},${off[1]})">${P.noFarLeg ? '' : far.legSkin + far.legMus}${P.noFarArm ? '' : far.armSkin + far.armMus}</g>${E.farFront || ''}`;
  h += torsoSkin(J, P) + jc(J.hip, 7) + near.legSkin;
  h += torsoMus(J, P, m) + near.legMus + (E.mid || '');
  h += near.armSkin + jc(J.sh, 6.5) + near.armMus;
  // Zielmuskeln am Rumpf über dem Arm noch einmal leicht durchscheinend, damit sie nicht verdeckt sind
  const xr = torsoMus(J, P, m, true);
  if (xr) h += `<g class="xray">${xr}</g>`;
  h += E.front || '';
  if (P.zoom) { const z = P.zoomAt || [120, 190]; h = `<g transform="translate(${z[0]},${z[1]}) scale(${P.zoom}) translate(${-z[0]},${-z[1]})">${h}</g>`; }
  return `<svg viewBox="0 0 240 196" xmlns="http://www.w3.org/2000/svg"><defs>${CLIP}</defs>${h}</svg>`;
}
// Geräte (Seitenansicht): Langhantel = Scheibe von der Seite, Kurzhantel und Griffe von der Stirnseite
const PLATE = 22;
const pl = (p, r = PLATE) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" class="eq"/><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${(r * .78).toFixed(1)}" class="eq2"/><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${(r * .2).toFixed(1)}" class="eq"/><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="2.2" class="eq3"/>`;
const dbEnd = (p, r = 7.5) => { const pts = Array.from({ length: 6 }, (_, i) => { const a = r2(30 + i * 60); return `${f1(p[0] + Math.cos(a) * r)},${f1(p[1] + Math.sin(a) * r)}`; }).join(' ');
  return `<polygon points="${pts}" class="eq"/><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="2" class="eq3"/>`; };
const grip = (p, r = 3.2) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" class="eq"/>`;
const cable = (a, b) => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" class="cab"/>`;
const pulley = p => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="5" class="eq"/><circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="1.8" class="eq3"/>`;
const rect = (x, y, w, h, c = 'eq', rx = 0) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${rx}" class="${c}"/>`;
const benchFlat = (x0, x1, top) => rect(x0, top, x1 - x0, 8, 'pad', 3) + rect(x0 + 6, top + 8, x1 - x0 - 12, 4, 'eq') + rect(x0 + 12, top + 12, 5, 190 - top - 12, 'eq2') + rect(x1 - 17, top + 12, 5, 190 - top - 12, 'eq2') + rect(x0 + 6, 186, 17, 4, 'eq') + rect(x1 - 23, 186, 17, 4, 'eq');
const EX3 = [
  { name: 'Kniebeugen (Langhantel)', p: ['quadrizeps'], s: ['gesaess', 'beinbeuger', 'ruecken_unten'],
    pose: { ankle: [122, 182], leg: [8, 112], torso: -55, arm: { to: null, bend: -1 }, foot: 0 },
    prep(P) { const J = pose3({ ...P, arm: [90, 90] }), d = d2(P.torso), n = [d[1], -d[0]]; P.bar = [J.sh[0] - d[0] * 3 + n[0] * 10, J.sh[1] - d[1] * 3 + n[1] * 10]; P.arm = { to: [P.bar[0] + d[0] * 1, P.bar[1] + d[1] * 1], bend: -1 }; },
    eq: (J, P) => ({ mid: pl(P.bar) }) },
  { name: 'Bankdrücken Flachbank (Langhantel)', p: ['brust'], s: ['schulter_vorne', 'trizeps'],
    pose: { hip: [150, 134], torso: 180, leg: { to: [184, 184], bend: -1 }, arm: { to: [104, 80], bend: 1 }, foot: 0, farOff: [-2, -3] },
    eq: (J) => ({ back: benchFlat(48, 166, 146), front: pl(J.hand) }) },
  { name: 'Latziehen breit', p: ['lat'], s: ['bizeps', 'schulter_hinten', 'trapez'],
    pose: { hip: [112, 140], torso: -102, leg: [0, 90], arm: { to: [116, 78], bend: 1 }, foot: 0 },
    eq: (J) => ({ back: rect(62, 8, 8, 182, 'eq2') + rect(62, 8, 58, 7, 'eq2') + pulley([116, 16]) + cable([116, 16], J.hand)
        + rect(96, 148, 44, 8, 'pad', 3) + rect(114, 156, 7, 34, 'eq2') + rect(62, 180, 80, 6, 'eq') + rect(J.knee[0] - 14, J.knee[1] - 19, 22, 8, 'pad', 4) + rect(J.knee[0] - 24, J.knee[1] - 16.5, 12, 3.5, 'eq2'),
      front: grip(J.hand, 3.6) }) },
  { name: 'Bizepscurls (Kurzhantel)', p: ['bizeps'], s: ['unterarme'],
    pose: { ankle: [114, 182], leg: [90, 90], torso: -90, arm: [84, -12], arm2: [92, 90], foot: 0 },
    eq: (J) => ({ farFront: dbEnd([J.hand2[0] - 3, J.hand2[1] - 2]), front: dbEnd(J.hand) }) },
  { name: 'Kreuzheben rumänisch (Langhantel)', p: ['beinbeuger'], s: ['gesaess', 'ruecken_unten'],
    pose: { ankle: [126, 182], leg: [66, 96], torso: -16, arm: [91, 90], foot: 0 },
    eq: (J) => ({ front: pl(J.hand) }) },
  { name: 'Trizepsdrücken am Kabel (Seil)', p: ['trizeps'], s: [],
    pose: { ankle: [100, 182], leg: [92, 90], torso: -82, arm: [96, 48], foot: 0 },
    eq: (J) => ({ back: rect(206, 8, 9, 182, 'eq2') + rect(186, 8, 29, 7, 'eq2') + pulley([190, 18]) + cable([190, 18], J.hand) + rect(196, 180, 30, 6, 'eq'),
      front: `<path d="M${f1(J.hand[0] - 2)},${f1(J.hand[1] - 3)} l-1.5,8 M${f1(J.hand[0] + 2)},${f1(J.hand[1] - 3)} l1.5,8" class="rope"/>` + grip(J.hand, 3) }) },
];
EX3.forEach(e => e.prep && e.prep(e.pose));
// ===== mmseg.js =====
const MMSEG = {"front": {"torso": [["trapez", "M55,29 Q62,34 70,38 L59,39 Q55,35 55,29 Z"], ["schulter_vorne", "M60,40 Q69,36 75,41 Q74,48 70,54 Q64,48 60,42 Z"], ["brust", "M51,41 L59,41 Q66,46 69,56 Q65,64 56,66 Q51,66 51,60 Z"], ["lat", "M66,60 Q70,59 70,66 L68,72 Q65,67 66,60 Z"], ["bauch", "M51,68 L57,67 Q59,86 58,104 Q55,110 51,111 Z"], ["bauch", "M59,69 Q66,67 69,74 Q68,89 65,100 Q61,104 59,104 Q61,86 59,69 Z"], ["hueftbeuger", "M58,107 Q63,105 66,109 Q63,116 59,120 Q57,114 58,107 Z"]], "upper": [["schulter_seite", "M76,42 Q81,46 80,56 Q76,57 72,55 Q75,49 76,42 Z"], ["bizeps", "M70,58 Q76,57 79,61 Q81,72 78,84 Q74,86 71,82 Q68,70 70,58 Z"]], "fore": [["unterarme", "M72,88 Q78,86 81,90 Q85,104 84,121 Q81,123 79,121 Q74,106 72,88 Z"]], "thigh": [["abduktoren", "M67,104 Q71,106 72,114 Q70,122 68,124 Q66,115 67,104 Z"], ["adduktoren", "M51,111 Q57,110 59,120 Q59,130 56,140 Q51,135 51,121 Z"], ["quadrizeps", "M60,122 Q66,113 71,119 Q74,135 72,152 Q68,158 64,156 Q60,140 60,122 Z"], ["quadrizeps", "M55,129 Q58,125 60,131 Q62,146 63,156 Q58,158 56,152 Q53,140 55,129 Z"]], "shin": [["waden", "M58,167 Q62,165 66,167 Q69,181 66,196 Q63,200 61,197 Q57,182 58,167 Z"]]}, "back": {"torso": [["trapez", "M50,26 L55,27 Q60,33 70,38 Q62,42 58,48 L53,70 L50,72 Z"], ["schulter_hinten", "M64,40 Q72,37 76,42 Q75,50 72,54 Q67,48 64,42 Z"], ["schulter_hinten", "M59,47 Q64,45 68,50 Q66,57 61,59 Q58,54 59,47 Z"], ["lat", "M55,61 Q62,59 69,57 Q72,65 68,79 Q62,94 56,98 Q54,84 55,61 Z"], ["ruecken_unten", "M51,75 L54,73 Q56,90 57,104 Q54,108 51,108 Z"], ["abduktoren", "M57,100 Q66,97 71,103 Q73,111 70,118 Q64,110 57,108 Z"], ["gesaess", "M51,109 Q60,105 69,110 Q72,119 68,128 Q60,132 51,129 Z"]], "upper": [["schulter_seite", "M77,42 Q81,46 80,56 Q76,57 73,54 Q76,49 77,42 Z"], ["trizeps", "M71,57 Q77,56 80,60 Q82,72 79,84 Q75,86 72,82 Q69,70 71,57 Z"]], "fore": [["unterarme", "M72,88 Q78,86 81,90 Q85,104 84,121 Q81,123 79,121 Q74,106 72,88 Z"]], "thigh": [["beinbeuger", "M53,133 Q57,131 61,132 Q62,146 61,158 Q57,159 55,155 Q52,145 53,133 Z"], ["beinbeuger", "M62,132 Q67,131 69,134 Q71,147 67,158 Q64,160 62,158 Q63,146 62,132 Z"], ["adduktoren", "M51,130 Q54,131 55,138 Q55,146 54,152 L51,148 Z"]], "shin": [["waden", "M56,166 Q61,163 66,166 Q69,177 66,189 Q62,193 58,189 Q55,177 56,166 Z"]]}};
// ===== fig4.js =====
/* Front- und Rückenansicht: Figur der Muskelkarte (rechte Hälfte, x ≥ 50, gespiegelt), Arme und Beine drehbar.
   Drehpunkte: Schulter, Ellbogen, Hüfte, Knie. Winkel in Grad: 0 = hängend/gerade nach unten, positiv = nach außen (Abspreizen).
   Unterarm/Unterschenkel relativ zum Oberarm/Oberschenkel, positiv = weiter nach außen/oben gedreht. */
const FB_PIV = { sh: [73, 46], el: [76.5, 86.5], hip: [62, 111], knee: [63, 160] };
const FB_SKIN = {
  torso: 'M50,4 C56,4 59.5,9 59.5,16 C59.5,22 57.5,26 55.5,28 L56,31 Q62,35 72,37.5 Q79,40 79,47 Q76,54 70,58 Q69,80 69.5,100 Q73,107 73.5,114 Q70,121 62,124 L50,126 Z',
  upper: 'M68,46 Q69,37.5 76,38 Q81.5,40.5 82,47.5 Q83.5,56 81.5,62 Q83.5,72 81.5,87.5 L71.5,87.5 Q68.5,72 68.5,60 Z',
  fore: 'M71.5,86 Q76.5,82.5 81.5,86 Q86.5,100 86.5,118 Q88.5,124 87.5,132 Q86,142 80.5,142.5 Q77,137 77.8,124 Q73.5,108 71.5,88 Z',
  thigh: 'M50,111 Q60,103 69.5,100 Q73,107 73.5,116 Q75.5,134 72.5,156 Q70,163 63,163.5 Q56,163 55.5,158 Q52.5,142 52,126 L50,124 Z',
  shin: 'M56,158 Q63,155 70,159 Q69.5,161 68.5,166 Q70.5,180 67.5,197 Q71.5,205 70.5,213.5 L56.5,213.5 Q55.5,205 58.5,197 Q55.5,182 56.5,166 Q56.5,161 56,158 Z',
};
const FB_HAND = [82.5, 134];  // Handmitte (für Geräte)
function fbRot(p, piv, a) { const r = -a * Math.PI / 180, x = p[0] - piv[0], y = p[1] - piv[1]; return [piv[0] + x * Math.cos(r) - y * Math.sin(r), piv[1] + x * Math.sin(r) + y * Math.cos(r)]; }
// Gelenkpunkte einer Seite (rechte Hälfte, ungespiegelt): Hand, Ellbogen, Knie, Fuß
function fbSide(arm, leg) {
  const us = arm[2] || 1, fs = arm[3] || 1, E0 = [FB_PIV.el[0], FB_PIV.sh[1] + (FB_PIV.el[1] - FB_PIV.sh[1]) * us], H0 = [FB_HAND[0], E0[1] + (FB_HAND[1] - FB_PIV.el[1]) * fs];
  const el = fbRot(E0, FB_PIV.sh, arm[0]), hand = fbRot(fbRot(H0, E0, arm[1]), FB_PIV.sh, arm[0]);
  const ts = leg[2] || 1, ss = leg[3] || 1, K0 = [FB_PIV.knee[0], FB_PIV.hip[1] + (FB_PIV.knee[1] - FB_PIV.hip[1]) * ts], F0 = [63, K0[1] + (210 - FB_PIV.knee[1]) * ss];
  const knee = fbRot(K0, FB_PIV.hip, leg[0]), foot = fbRot(fbRot(F0, K0, leg[1]), FB_PIV.hip, leg[0]);
  return { el, hand, knee, foot };
}
function fbSvg(sc) {
  const P = sc.pose, J = fbPoints(P), m = { p: sc.p || [], s: sc.s || [] }, E = sc.eq ? sc.eq(J, P) : {};
  return `<svg viewBox="0 0 240 196" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="tnk"><rect x="-50" y="27" width="200" height="300"/></clipPath></defs><line x1="6" y1="190" x2="234" y2="190" class="gr"/>${E.back || ''}${fbFigure(P, m)}${E.front || ''}</svg>`;
}
const sceneSvg = sc => sc.view === 'side' ? fig3Svg(sc) : fbSvg(sc);
function fbHalf(view, arm, leg, m, opt = {}) {
  const S = MMSEG[view], cls = k => m.p.includes(k) ? 'p' : m.s.includes(k) ? 's' : '';
  const ord = k => cls(k) === 'p' ? 2 : cls(k) === 's' ? 1 : 0;
  const mus = seg => (S[seg] || []).slice().sort((x, y) => ord(x[0]) - ord(y[0])).map(([k, d]) => `<path class="m ${cls(k)}" d="${d}"/>`).join('');
  const rg = (piv, a, inner) => `<g transform="rotate(${(-a).toFixed(1)} ${piv[0]} ${piv[1]})">${inner}</g>`;
  const shrug = opt.shrug ? `translate(0,${-opt.shrug})` : '';
  // sitzend von vorn: Oberschenkel zeigt zum Betrachter (verkürzt), Unterschenkel hängt ab der Sitzkante
  const SQ = .3, up = (FB_PIV.knee[1] - FB_PIV.hip[1]) * (1 - SQ);
  const legG = opt.seated
    ? rg(FB_PIV.hip, leg[0], `<g transform="translate(0,${FB_PIV.hip[1]}) scale(1,${SQ}) translate(0,${-FB_PIV.hip[1]})"><path class="sk" d="${FB_SKIN.thigh}"/>${mus('thigh')}</g>`
      + `<g transform="translate(0,${-up})">` + rg(FB_PIV.knee, leg[1], `<path class="sk" d="${FB_SKIN.shin}"/>${mus('shin')}`) + '</g>')
    : (leg[2] || leg[3]) ? (() => { const ts = leg[2] || 1, ss = leg[3] || 1, ky = FB_PIV.hip[1] + (FB_PIV.knee[1] - FB_PIV.hip[1]) * ts;
        const scy = (y0, f, inner) => f === 1 ? inner : `<g transform="translate(0,${y0}) scale(1,${f}) translate(0,${-y0})">${inner}</g>`;
        return rg(FB_PIV.hip, leg[0], scy(FB_PIV.hip[1], ts, `<path class="sk" d="${FB_SKIN.thigh}"/>${mus('thigh')}`)
          + `<g transform="translate(0,${(ky - FB_PIV.knee[1]).toFixed(2)})">` + rg(FB_PIV.knee, leg[1], scy(FB_PIV.knee[1], ss, `<path class="sk" d="${FB_SKIN.shin}"/>${mus('shin')}`)) + '</g>'); })()
    : rg(FB_PIV.hip, leg[0], `<path class="sk" d="${FB_SKIN.thigh}"/>${mus('thigh')}` + rg(FB_PIV.knee, leg[1], opt.shinSq ? `<g transform="translate(0,${FB_PIV.knee[1]}) scale(1,${opt.shinSq}) translate(0,${-FB_PIV.knee[1]})"><path class="sk" d="${FB_SKIN.shin}"/>${mus('shin')}</g>` : `<path class="sk" d="${FB_SKIN.shin}"/>${mus('shin')}`));
  const us = arm[2] || 1, fs = arm[3] || 1, ey = FB_PIV.sh[1] + (FB_PIV.el[1] - FB_PIV.sh[1]) * us;
  const sc = (y0, f, inner) => f === 1 ? inner : `<g transform="translate(0,${y0}) scale(1,${f}) translate(0,${-y0})">${inner}</g>`;
  const foreG = `<g transform="translate(0,${(ey - FB_PIV.el[1]).toFixed(2)})">` + rg(FB_PIV.el, arm[1], sc(FB_PIV.el[1], fs, `<path class="sk" d="${FB_SKIN.fore}"/>${mus('fore')}`)) + '</g>';
  const armG = `<g transform="${shrug}">` + rg(FB_PIV.sh, arm[0], sc(FB_PIV.sh[1], us, `<path class="sk" d="${FB_SKIN.upper}"/>${mus('upper')}`) + foreG) + '</g>';
  const torso = `<path class="sk" d="${FB_SKIN.torso}"/>${mus('torso')}`;
  const legP = opt.seated ? '' : rg(FB_PIV.hip, leg[0], `<g transform="translate(0,${FB_PIV.hip[1]}) scale(1,${leg[2] || 1}) translate(0,${-FB_PIV.hip[1]})">` + (S.thigh || []).filter(([k]) => cls(k) === 'p').map(([, d]) => `<path class="m p" d="${d}"/>`).join('') + '</g>');
  return { legG, armG, torso, legP };
}
// ganze Figur: P = { view, at:[x,y] (Fußpunkt Mitte), s (Maßstab), rot (Grad, um die Hüfte), armR, armL, legR, legL, shrug, armsBehind }
function fbFigure(P, m) {
  const R = fbHalf(P.view, P.armR, P.legR, m, P), L = fbHalf(P.view, P.armL || P.armR, P.legL || P.legR, m, P);
  const mir = inner => `<g transform="translate(100,0) scale(-1,1)">${inner}</g>`;
  const hd = P.headTilt != null || P.headTurn != null;
  let tor = R.torso + mir(L.torso);
  if (hd) {
    const t = P.headTurn || 0, k = Math.cos(t * Math.PI / 180), nx = 50 + Math.sin(t * Math.PI / 180) * 7;
    const face = P.headTurn != null && P.view !== 'back' ? `<ellipse cx="${nx.toFixed(1)}" cy="18" rx="1.7" ry="3" class="m"/>` : '';
    tor = `<g clip-path="url(#tnk)">${tor}</g><g transform="rotate(${-(P.headTilt || 0)} 50 29)"><rect x="45.5" y="20" width="9" height="11" class="sk"/><ellipse cx="50" cy="16" rx="${(9.5 * (.82 + .18 * k)).toFixed(2)}" ry="12" class="sk"/>${face}</g>`;
  }
  const up = tor + R.armG + mir(L.armG);
  const body = R.legG + mir(L.legG) + (P.lean ? `<g transform="rotate(${P.lean} 50 111)">${tor}</g>` + R.legP + mir(L.legP) + `<g transform="rotate(${P.lean} 50 111)">${R.armG + mir(L.armG)}</g>` : tor + R.legP + mir(L.legP) + R.armG + mir(L.armG));
  const s = P.s || .82, rot = P.rot ? ` rotate(${P.rot} 50 111)` : '';
  return `<g transform="translate(${(P.at[0] - 50 * s).toFixed(1)},${(P.at[1] - 213.5 * s).toFixed(1)}) scale(${s})${rot}">${body}</g>`;
}
// Punkte (Hände, Füße) im Bild für Geräte
function fbPoints(P) {
  const s = P.s || .82, ox = P.at[0] - 50 * s, oy = P.at[1] - 213.5 * s;
  const R = fbSide(P.armR, P.legR), L = fbSide(P.armL || P.armR, P.legL || P.legR);
  if (P.seated) for (const [X, lg] of [[R, P.legR], [L, P.legL || P.legR]]) X.knee = fbRot([63, 111 + 49 * .3], FB_PIV.hip, lg[0]);
  const mapR = (p, up) => { let q = p; if (up && P.lean) q = fbRot(q, [50, 111], -P.lean); if (P.rot) q = fbRot(q, [50, 111], -P.rot); return [ox + q[0] * s, oy + q[1] * s]; };
  const mapL = (p, up) => mapR([100 - p[0], p[1]], up);
  const sh = P.shrug || 0;
  return { handR: mapR([R.hand[0], R.hand[1] - sh], 1), handL: mapL([L.hand[0], L.hand[1] - sh], 1), elR: mapR(R.el, 1), elL: mapL(L.el, 1),
    footR: mapR(R.foot), footL: mapL(L.foot), kneeR: mapR(R.knee), kneeL: mapL(L.knee), shR: mapR(FB_PIV.sh, 1), shL: mapL(FB_PIV.sh, 1), hip: mapR([50, 111]), head: mapR([50, 15], 1), s };
}
// ===== kit.js =====
/* Bausteine für die Szenen: Seitenansicht (fig3.js) und Front/Rücken (fig4.js) */
const GY = 190, AY = 182;                    // Boden, Knöchelhöhe beim Stehen
const ft = (x, bend = -1, y = AY) => ({ to: [x, y], bend });   // Fuß dorthin (Knie nach vorn: bend -1)
const hd = (x, y, bend = 1) => ({ to: [x, y], bend });          // Hand dorthin (Ellbogen nach unten: bend 1)
const ln2 = (a, b, c = 'cab') => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" class="${c}"/>`;
const rot = (inner, cx, cy, a) => `<g transform="rotate(${a} ${cx} ${cy})">${inner}</g>`;
const rails = x => `<line x1="${x - 4}" y1="8" x2="${x - 4}" y2="${GY}" class="rail"/><line x1="${x + 4}" y1="8" x2="${x + 4}" y2="${GY}" class="rail"/>`;
const tower = (x, w = 9) => rect(x, 8, w, GY - 8, 'eq2') + rect(x - 8, GY - 5, w + 16, 5, 'eq');
const box = (x, y, w) => rect(x, y, w, GY - y, 'eq2', 2) + rect(x, y, w, 5, 'pad', 2);
const wall = x => rect(x, 0, 6, GY, 'wall');
const barEnd = p => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="3.4" class="eq"/>`;
const pullBar = (x, y, x0 = x - 40) => rect(x0, 0, 6, y + 4, 'eq2') + rect(x0, y - 3, x - x0 + 4, 5, 'eq2') + barEnd([x, y]);
const dipBar = (p, h = GY - p[1]) => rect(p[0] - 2.5, p[1], 5, h, 'eq2') + barEnd(p) + rect(p[0] - 12, GY - 4, 24, 4, 'eq');
const kb = p => `<path d="M${f1(p[0] - 5)},${f1(p[1] + 1)} Q${f1(p[0] - 5)},${f1(p[1] - 7)} ${f1(p[0])},${f1(p[1] - 7)} Q${f1(p[0] + 5)},${f1(p[1] - 7)} ${f1(p[0] + 5)},${f1(p[1] + 1)}" class="kbh"/><circle cx="${f1(p[0])}" cy="${f1(p[1] + 8)}" r="8.5" class="eq"/>`;
const ball = (p, r = 11) => `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="${r}" class="ball"/><path d="M${f1(p[0] - r)},${f1(p[1])} Q${f1(p[0])},${f1(p[1] + r * .5)} ${f1(p[0] + r)},${f1(p[1])}" class="ballL"/>`;
const band = (a, b) => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" class="band"/>`;
const dbSide = (p, a = 90) => rot(rect(p[0] - 2, p[1] - 9, 4, 18, 'eq3') + rect(p[0] - 5, p[1] - 15, 10, 7, 'eq', 2) + rect(p[0] - 5, p[1] + 8, 10, 7, 'eq', 2), p[0], p[1], a - 90);  // Kurzhantel längs (Hammergriff)
const padR = (cx, cy, w, h, a, c = 'pad') => rot(rect(cx - w / 2, cy - h / 2, w, h, c, 3), cx, cy, a);
const seat = (x0, x1, top) => rect(x0, top, x1 - x0, 8, 'pad', 3) + rect((x0 + x1) / 2 - 3, top + 8, 6, GY - top - 8, 'eq2') + rect((x0 + x1) / 2 - 16, GY - 4, 32, 4, 'eq');
// Front/Rücken
const fbDb = (p, w = 10) => rect(p[0] - w, p[1] - 1.5, 2 * w, 3, 'eq3') + rect(p[0] - w - 4, p[1] - 7, 5, 14, 'eq', 1.5) + rect(p[0] + w - 1, p[1] - 7, 5, 14, 'eq', 1.5);
const fbBar = (a, b, over = 26) => { const x0 = Math.min(a[0], b[0]) - over, x1 = Math.max(a[0], b[0]) + over, y = (a[1] + b[1]) / 2;
  return rect(x0 - 6, y - 1.8, x1 - x0 + 12, 3.6, 'eq3') + rect(x0 - 4, y - 20, 6, 40, 'eq', 2) + rect(x1 - 2, y - 20, 6, 40, 'eq', 2) + rect(x0 - 11, y - 14, 6, 28, 'eq', 2) + rect(x1 + 5, y - 14, 6, 28, 'eq', 2); };
const fbHandle = (p, w = 7) => rect(p[0] - w, p[1] - 2, 2 * w, 4, 'eq', 2);

// Langhantel von oben (senkrecht im Bild), Kurzhantel von oben
const fbBarV = (a, b, over = 24) => { const y0 = Math.min(a[1], b[1]) - over, y1 = Math.max(a[1], b[1]) + over, x = (a[0] + b[0]) / 2;
  return rect(x - 1.8, y0 - 6, 3.6, y1 - y0 + 12, 'eq3') + rect(x - 18, y0 - 4, 36, 6, 'eq', 2) + rect(x - 18, y1 - 2, 36, 6, 'eq', 2) + rect(x - 13, y0 - 10, 26, 6, 'eq', 2) + rect(x - 13, y1 + 4, 26, 6, 'eq', 2); };
const fbDbV = (p, w = 8) => rect(p[0] - 1.5, p[1] - w, 3, 2 * w, 'eq3') + rect(p[0] - 7, p[1] - w - 4, 14, 5, 'eq', 1.5) + rect(p[0] - 7, p[1] + w - 1, 14, 5, 'eq', 1.5);
// Fußplatte an der Sohle (Seitenansicht): an Knöchel und Fußwinkel ausgerichtet
const solePlate = (J, a, w = 44) => { const r = r2(a), lx = 6, ly = 10.5; return padR(J.ankle[0] + lx * Math.cos(r) - ly * Math.sin(r), J.ankle[1] + lx * Math.sin(r) + ly * Math.cos(r), w, 6, a); };
// Langhantel hinter dem Körper (Nacken, Frontablage): kleinere Scheibe
const barAt = (J, P, back = true, r = 15) => { const d = d2(P.torso + (P.curl || 0)), n = back ? [d[1], -d[0]] : [-d[1], d[0]];
  const up = back ? -7 : 2, out = back ? 10 : 9;  // vorn: höher auf den vorderen Schultern
  return [J.sh[0] + d[0] * up + n[0] * out, J.sh[1] + d[1] * up + n[1] * out]; };
// Langhantel leicht schräg von der Seite: Stange waagerecht, nahe Scheibe hinter dem Körper (vorn gezeichnet), ferne Scheibe dahinter
const BB_OFF = [-17, 0];
const bb3 = (c, r = 11) => { const o = BB_OFF, n = [c[0] + o[0], c[1] + o[1]], f = [c[0] - o[0], c[1] - o[1]], k = 1.35;
  return { back: ln2([c[0] - o[0] * k, c[1] - o[1] * k], c, 'barS') + pl(f, r), front: ln2(c, [c[0] + o[0] * k, c[1] + o[1] * k], 'barS') + pl(n, r) }; };
const dbLong = (p, big = 1) => rot(rect(p[0] - 9 * big, p[1] - 1.6, 18 * big, 3.2, 'eq3') + rect(p[0] - 15 * big, p[1] - 6.5 * big, 7 * big, 13 * big, 'eq', 2) + rect(p[0] + 8 * big, p[1] - 6.5 * big, 7 * big, 13 * big, 'eq', 2), p[0], p[1], 0);

// Bewegungspfeile (Mobility, Yoga): Bogen um (cx,cy) von a0 nach a1 Grad (Bildwinkel, im Uhrzeigersinn positiv) bzw. gerade
const arrowHead = (p, dir, sz = 5) => { const a = Math.atan2(dir[1], dir[0]), l = sz, w = sz * .62;
  const b = [p[0] - Math.cos(a) * l, p[1] - Math.sin(a) * l], n = [-Math.sin(a) * w, Math.cos(a) * w];
  return `<path d="M${f1(p[0])},${f1(p[1])} L${f1(b[0] + n[0])},${f1(b[1] + n[1])} L${f1(b[0] - n[0])},${f1(b[1] - n[1])} Z" class="mvh"/>`; };
const arcA = (cx, cy, r, a0, a1, both = false) => { const P = a => [cx + r * Math.cos(r2(a)), cy + r * Math.sin(r2(a))], s = P(a0), e = P(a1), sw = a1 > a0 ? 1 : 0, big = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const tan = (a, sg) => [-Math.sin(r2(a)) * sg, Math.cos(r2(a)) * sg], sg = a1 > a0 ? 1 : -1;
  return `<path d="M${f1(s[0])},${f1(s[1])} A${r},${r} 0 ${big} ${sw} ${f1(e[0])},${f1(e[1])}" class="mv"/>` + arrowHead(e, tan(a1, sg)) + (both ? arrowHead(s, tan(a0, -sg)) : ''); };
const lineA = (a, b, both = false) => { const d = [b[0] - a[0], b[1] - a[1]];
  return `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" class="mv"/>` + arrowHead(b, d) + (both ? arrowHead(a, [-d[0], -d[1]]) : ''); };
const roll = (cx, cy, r = 7) => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${r}" class="eq3"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${(r * .45).toFixed(1)}" class="eq2"/>`;
const stick = (a, b) => ln2(a, b, 'stk');
const mat = (x0 = 14, x1 = 226) => rect(x0, GY - 3, x1 - x0, 3, 'mat', 1.5);
// Drehpfeil um eine senkrechte Achse (flache Ellipse vor dem Körper), dir 1 = nach rechts
const turnA = (cx, cy, rx, ry = rx * .32, dir = 1) => { const a = [cx - rx * dir, cy], b = [cx + rx * dir, cy];
  return `<path d="M${f1(a[0])},${f1(a[1])} A${rx},${ry} 0 0 ${dir > 0 ? 0 : 1} ${f1(b[0])},${f1(b[1])}" class="mv"/>` + arrowHead(b, [0, -1]); };
// ===== scA.js =====
const SC = [];
const side = (n, ex, p, s, pose, eq) => SC.push({ n, ex, p, s, view: 'side', pose, eq });
const fb = (n, ex, p, s, pose, eq) => SC.push({ n, ex, p, s, view: pose.view, pose, eq });
const SUP = { torso: 180, farOff: [-2, -3] };  // Rückenlage, Kopf links
// ---------- Brust ----------
const TOPB = { view: 'front', at: [128, 162], s: .6, rot: -90, armR: [54, 0, 1, .32], legR: [2, 0], noGround: true };
const topBench = J => rect(52, 89, 82, 23, 'pad', 4);
fb('Bankdrücken Flachbank, Langhantel (von oben)', ['Bankdrücken Flachbank (Langhantel)', 'Bankdrücken enger Griff'], ['brust'], ['schulter_vorne', 'trizeps'], TOPB, J => ({ back: topBench(J), front: fbBarV(J.handR, J.handL) }));
fb('Bankdrücken Flachbank, Kurzhanteln (von oben)', ['Bankdrücken Flachbank (Kurzhantel)'], ['brust'], ['schulter_vorne', 'trizeps'], TOPB, J => ({ back: topBench(J), front: fbDbV(J.handR) + fbDbV(J.handL) }));
fb('Bankdrücken Flachbank, Multipresse (von oben)', ['Bankdrücken Flachbank (Multipresse)'], ['brust'], ['schulter_vorne', 'trizeps'], TOPB,
  J => ({ back: topBench(J), front: fbBarV(J.handR, J.handL) + rect((J.handR[0] + J.handL[0]) / 2 - 5, Math.min(J.handR[1], J.handL[1]) - 46, 10, 10, 'eq2', 2) + rect((J.handR[0] + J.handL[0]) / 2 - 5, Math.max(J.handR[1], J.handL[1]) + 36, 10, 10, 'eq2', 2) }));
const incl = (eqH, ex, n) => side(n, ex, ['brust'], ['schulter_vorne', 'trizeps'], { hip: [140, 138], torso: 215, farOff: [-2, -3], leg: ft(188), arm: [40, -95] },
  J => ({ back: padR(109.6, 136.2, 70, 8, 35) + rect(104, 150, 5, 40, 'eq2') + seat(120, 160, 151), front: eqH(J) }));
incl(J => pl(J.hand, 16), ['Bankdrücken Schrägbank (Langhantel)'], 'Bankdrücken Schrägbank, Langhantel');
incl(J => dbEnd(J.hand, 8), ['Bankdrücken Schrägbank (Kurzhantel)'], 'Bankdrücken Schrägbank, Kurzhanteln');
incl(J => rails(J.hand[0]) + pl(J.hand, 14), ['Bankdrücken Schrägbank (Multipresse)'], 'Bankdrücken Schrägbank, Multipresse');
const decl = (eqH, ex, n) => side(n, ex, ['brust'], ['schulter_vorne', 'trizeps'], { hip: [150, 124], torso: 160, farOff: [-2, -3], leg: { to: [172, 160], bend: -1 }, arm: [5, -90] },
  J => ({ back: padR(131, 148, 78, 8, -20) + rect(100, 158, 5, 32, 'eq2') + rect(150, 145, 5, 45, 'eq2') + `<circle cx="178" cy="152" r="6" class="pad"/>` + rect(176, 152, 4, 38, 'eq2'), front: eqH(J) }));
decl(J => pl(J.hand, 16), ['Bankdrücken Negativbank (Langhantel)'], 'Bankdrücken Negativbank, Langhantel');
decl(J => dbEnd(J.hand, 8), ['Bankdrücken Negativbank (Kurzhantel)'], 'Bankdrücken Negativbank, Kurzhanteln');
side('Floor Press', ['Bankdrücken Floor Press', 'Floor Press Kurzhantel'], ['brust'], ['trizeps', 'schulter_vorne'], { hip: [150, 177], ...SUP, leg: ft(182), arm: [12, -90] }, J => ({ front: pl(J.hand, 16) }));
side('Brustpresse Maschine', ['Brustpresse Maschine', 'Brustpresse Maschine eng', 'Brustpresse Maschine breit', 'Brustpresse Maschine einarmig', 'Brustpresse Maschine Negativ', 'Bankdrücken Schrägmaschine'],
  ['brust'], ['schulter_vorne', 'trizeps'], { hip: [114, 138], torso: -97, leg: ft(152), arm: hd(150, 94) },
  J => ({ back: tower(70) + padR(96, 112, 8, 62, -7) + seat(96, 136, 150) + ln2([84, 24], [100, 24], 'lever'), front: ln2([100, 24], J.hand, 'lever') + grip(J.hand, 4) }));
fb('Brustpresse Kabelzug stehend', ['Brustpresse Kabelzug stehend'], ['brust'], ['schulter_vorne', 'trizeps'], { view: 'front', at: [120, 190], s: .72, armR: [74, -58, .8, .5], legR: [5, 0] },
  J => ({ back: tower(8) + tower(223) + pulley([20, 66]) + pulley([220, 66]), front: ln2([20, 66], J.handL) + ln2([220, 66], J.handR) + grip(J.handR, 3.5) + grip(J.handL, 3.5) }));
fb('Brustpresse und Fliegende mit Band', ['Brustpresse Band', 'Fliegende Band (Türanker)'], ['brust'], ['schulter_vorne', 'trizeps'], { view: 'front', at: [120, 190], s: .72, armR: [74, -58, .8, .5], legR: [5, 0] },
  J => ({ back: rect(10, 10, 8, 180, 'wall') + rect(222, 10, 8, 180, 'wall'), front: band([18, 66], J.handL) + band([222, 66], J.handR) + grip(J.handR, 3) + grip(J.handL, 3) }));
side('Dips', ['Dips (Brust)', 'Dips (Trizeps)', 'Ring-Dips', 'Dips an der geraden Stange (Straight Bar Dips)', 'Dips assistiert (Maschine)', 'Dips Maschine', 'Stütz halten'],
  ['brust'], ['trizeps', 'schulter_vorne'], { hip: [118, 92], torso: -66, leg: [100, 165], arm: hd(130, 76), foot: 70 }, J => ({ back: dipBar([130, 76]), front: '' }));
side('Liegestütze', ['Liegestütze', 'Liegestütze eng', 'Diamant-Liegestütze', 'Archer-Liegestütze', 'Pseudo-Planche-Liegestütze', 'Einarmige Liegestütze', 'Klatsch-Liegestütze'],
  ['brust'], ['trizeps', 'schulter_vorne', 'bauch'], { hip: [108, 158], torso: -10, leg: [168, 170], arm: hd(160, 186), foot: 95 }, () => ({}));
side('Liegestütze erhöht', ['Liegestütze erhöht'], ['brust'], ['trizeps', 'schulter_vorne'], { hip: [100, 150], torso: -25, leg: [160, 162], arm: hd(150, 152), foot: 95 }, () => ({ back: box(138, 152, 40) }));
side('Liegestütze auf Knien', ['Liegestütze auf Knien'], ['brust'], ['trizeps', 'schulter_vorne'], { hip: [112, 162], torso: -10, leg: [152, 192], arm: hd(162, 186), foot: 180 }, () => ({}));
side('Liegestütze Füße erhöht', ['Liegestütze Füße erhöht'], ['brust'], ['schulter_vorne', 'trizeps'], { hip: [104.6, 120], torso: 5.5, leg: [185.5, 185.5], foot: 100, arm: hd(156, 186) }, () => ({ back: box(2, 121, 40) }));
// Front und von oben
fb('Fliegende (von oben)', ['Fliegende Flachbank (Kurzhantel)', 'Fliegende Schrägbank (Kurzhantel)', 'Fliegende Negativbank (Kurzhantel)', 'Fliegende am Boden (Kurzhantel)', 'Kabelzug Fliegende Schrägbank'],
  ['brust'], ['schulter_vorne'], { view: 'front', at: [128, 162], s: .6, rot: -90, armR: [84, 14], legR: [2, 0], noGround: true },
  J => ({ back: rect(64, 90, 96, 22, 'pad', 4), front: fbDb(J.handR, 7) + fbDb(J.handL, 7) }));
fb('Butterfly Maschine', ['Butterfly Maschine'], ['brust'], ['schulter_vorne'], { view: 'front', seated: true, at: [120, 211], s: .7, armR: [90, 88], legR: [6, -6] },
  J => ({ back: rect(48, 20, 8, 170, 'eq2') + rect(184, 20, 8, 170, 'eq2') + rect(48, 20, 144, 7, 'eq2') + rect(104, 40, 32, 100, 'pad', 4) + rect(96, 136, 48, 9, 'pad', 3) + rect(117, 145, 6, 45, 'eq2'),
    front: padR((J.handR[0] + J.elR[0]) / 2, (J.handR[1] + J.elR[1]) / 2, 9, 34, 0) + padR((J.handL[0] + J.elL[0]) / 2, (J.handL[1] + J.elL[1]) / 2, 9, 34, 0) }));
fb('Kabelzug Crossover', ['Kabelzug Crossover', 'Kabelzug Crossover von oben', 'Butterfly Kabelzug'], ['brust'], ['schulter_vorne'], { view: 'front', at: [120, 190], s: .72, armR: [22, -78], legR: [5, 0] },
  J => ({ back: tower(8) + tower(223) + pulley([20, 22]) + pulley([220, 22]), front: ln2([20, 22], J.handL) + ln2([220, 22], J.handR) + grip(J.handR) + grip(J.handL) }));
fb('Kabelzug Crossover von unten', ['Kabelzug Crossover von unten'], ['brust'], ['schulter_vorne'], { view: 'front', at: [120, 190], s: .72, armR: [42, 26, .9, .9], legR: [5, 0] },
  J => ({ back: tower(8) + tower(223) + pulley([20, 176]), front: pulley([220, 176]) + ln2([20, 176], J.handL) + ln2([220, 176], J.handR) + grip(J.handR) + grip(J.handL) }));
// ---------- Schultern (vorn/hinten) ----------
fb('Seitheben, Kurzhanteln', ['Seitheben Kurzhantel', 'Seitheben Kurzhantel sitzend', 'Seitheben liegend (Schrägbank)', 'Y-Raises', 'Seitheben Maschine'], ['schulter_seite'], ['trapez', 'schulter_vorne'],
  { view: 'front', at: [120, 190], s: .72, armR: [80, 10], legR: [3, 0] }, J => ({ front: fbDb(J.handR, 7) + fbDb(J.handL, 7) }));
fb('Seitheben, Kabelzug', ['Seitheben Kabelzug', 'Seitheben Kabelzug einarmig', 'Seitheben Band'], ['schulter_seite'], ['trapez'],
  { view: 'front', at: [128, 190], s: .72, armR: [78, 10], armL: [6, 0], legR: [3, 0] }, J => ({ back: tower(12) + pulley([24, 178]), front: ln2([24, 178], J.handR) + grip(J.handR) }));
fb('Schulterdrücken, Langhantel', ['Schulterdrücken Langhantel stehend (Military Press)', 'Schulterdrücken Langhantel sitzend', 'Schulterdrücken Multipresse'], ['schulter_vorne'], ['trizeps', 'schulter_seite', 'trapez'],
  { view: 'front', at: [120, 190], s: .68, armR: [96, 88], legR: [4, 0] }, J => ({ front: fbBar(J.handR, J.handL, 20) }));
fb('Schulterdrücken, Kurzhanteln', ['Schulterdrücken Kurzhantel sitzend', 'Schulterdrücken Kurzhantel stehend', 'Arnold Press', 'Schulterdrücken Kettlebell', 'Schulterdrücken Band'], ['schulter_vorne'], ['trizeps', 'schulter_seite'],
  { view: 'front', at: [120, 190], s: .68, armR: [96, 88], legR: [4, 0] }, J => ({ front: fbDb(J.handR, 7) + fbDb(J.handL, 7) }));
side('Schulterdrücken Maschine', ['Schulterdrücken Maschine'], ['schulter_vorne'], ['trizeps', 'schulter_seite'], { hip: [96, 140], torso: -92, leg: [2, 88], foot: 0, arm: hd(106, 56, 1) },
  J => ({ back: rect(56, 90, 8, 100, 'eq2') + rect(46, 186, 28, 4, 'eq') + padR(80, 106, 9, 66, -2) + seat(70, 118, 144) + ln2([62, 100], [J.hand[0] - 1, J.hand[1] + 3], 'lever') + `<circle cx="62" cy="100" r="4" class="eq"/>`, front: rect(J.hand[0] - 2, J.hand[1] - 7, 4, 14, 'eq', 2) }));
fb('Aufrechtes Rudern', ['Aufrechtes Rudern Langhantel', 'Aufrechtes Rudern Kabelzug'], ['schulter_seite'], ['trapez', 'bizeps'],
  { view: 'front', at: [120, 190], s: .72, armR: [100, -128], legR: [3, 0] }, J => ({ front: fbBar(J.handR, J.handL, 30) }));
fb('Shrugs, Kurzhanteln', ['Shrugs Kurzhantel', 'Shrugs Kabelzug', 'Shrugs Maschine'], ['trapez'], ['unterarme'], { view: 'front', at: [120, 190], s: .72, armR: [7, 0], legR: [3, 0], shrug: 5 }, J => ({ front: dbEnd(J.handR, 8) + dbEnd(J.handL, 8) }));
fb('Shrugs, Langhantel', ['Shrugs Langhantel'], ['trapez'], ['unterarme'], { view: 'front', at: [120, 190], s: .72, armR: [-4, 0], legR: [3, 0], shrug: 5 }, J => ({ front: fbBar(J.handR, J.handL, 36) }));
// ===== scB.js =====
// ---------- Rücken (Latissimus) ----------
const BK = ['lat'], BKs = ['bizeps', 'schulter_hinten', 'trapez'];
fb('Klimmzüge', ['Klimmzüge', 'Klimmzüge breit', 'Klimmzüge enger Griff', 'Klimmzüge Neutralgriff', 'Klimmzüge Untergriff (Chin-ups)', 'Klimmzüge mit Zusatzgewicht', 'Klimmzüge assistiert (Maschine)', 'Klimmzüge mit Band (unterstützt)', 'Archer-Klimmzüge', 'Einarmige Klimmzüge', 'Negative Klimmzüge', 'Schulterblatt-Klimmzüge (Scapula Pulls)', 'Muscle-ups'],
  BK, BKs, { view: 'back', at: [120, 176], s: .66, armR: [104, 76], legR: [2, 0] }, J => ({ back: rect(26, 0, 6, 190, 'eq2') + rect(208, 0, 6, 190, 'eq2') + rect(26, J.handR[1] - 3, 188, 5, 'eq2') }));
fb('Latziehen', ['Latziehen breit', 'Latziehen mittelbreit', 'Latziehen eng (V-Griff)', 'Latziehen Untergriff', 'Latziehen Neutralgriff', 'Latziehen einarmig', 'Latziehen kniend (Kabelzug)', 'Latziehen Maschine', 'Latziehen Maschine einarmig', 'Latziehen Band (Türanker)'],
  BK, BKs, { view: 'back', seated: true, at: [120, 211], s: .66, armR: [108, 72], legR: [6, -6] },
  J => ({ back: rect(116, 0, 8, 190, 'eq2') + rect(92, 140, 56, 9, 'pad', 3) + rect(98, 118, 44, 8, 'pad', 4), front: ln2([120, 0], [120, J.handR[1]]) + rect(J.handL[0] - 18, J.handR[1] - 2, J.handR[0] - J.handL[0] + 36, 4, 'eq', 2) }));
fb('Toter Hang', ['Toter Hang (Dead Hang)'], ['unterarme'], ['lat', 'schulter_hinten'], { view: 'back', at: [120, 182], s: .62, armR: [168, 0], legR: [1, 0] },
  J => ({ back: rect(28, 0, 6, 190, 'eq2') + rect(206, 0, 6, 190, 'eq2') + rect(28, J.handR[1] - 3, 184, 5, 'eq2') }));
side('Rudern Langhantel vorgebeugt', ['Rudern Langhantel vorgebeugt', 'Rudern Langhantel Untergriff', 'Rudern Langhantel Pendlay', 'Rudern Multipresse'], BK, BKs,
  { ankle: [122, 182], leg: [66, 96], torso: -25, arm: hd(138, 114, 1) }, J => ({ front: pl(J.hand) }));
side('Rudern Kurzhantel vorgebeugt', ['Rudern Kurzhantel beidarmig vorgebeugt'], BK, BKs,
  { ankle: [122, 182], leg: [66, 96], torso: -25, arm: hd(140, 108, 1) }, J => ({ farFront: dbLong([J.hand2[0] - 3, J.hand2[1] - 2]), front: dbLong(J.hand) }));
side('Rudern Kurzhantel einarmig', ['Rudern Kurzhantel einarmig', 'Rudern Kettlebell einarmig'], BK, BKs,
  { hip: [78, 110], torso: -8, leg: { to: [32, 133], bend: -1 }, foot: 180, leg2: ft(74), foot2: 0, arm: hd(124, 139, -1), arm2: hd(118, 162, 1) },
  J => ({ farFront: benchFlat(22, 136, 140) + dbLong(J.hand2) }));
side('Rudern brustgestützt', ['Rudern Kurzhantel brustgestützt (Schrägbank)', 'Rudern Seal Row (Bank)', 'Rudern Maschine brustgestützt', 'Rudern T-Bar brustgestützt'], BK, BKs,
  { hip: [110, 122], torso: -40, leg: ft(56, -1), arm: hd(140, 130, 1) },
  J => ({ back: padR(139, 116, 70, 8, -40) + rect(118, 128, 5, 62, 'eq2') + seat(92, 124, 134), front: dbLong(J.hand) }));
side('Rudern Kabelzug sitzend', ['Rudern Kabelzug sitzend', 'Rudern Kabelzug eng (V-Griff)', 'Rudern Kabelzug Untergriff', 'Rudern Kabelzug Seil', 'Rudern Kabelzug einarmig'], BK, BKs,
  { hip: [80, 150], torso: -92, leg: { to: [146, 164], bend: -1 }, foot: -80, arm: hd(100, 122, 1) },
  J => ({ back: rect(50, 158, 64, 8, 'pad', 3) + rect(78, 166, 6, 24, 'eq2') + rect(152, 140, 6, 40, 'eq') + tower(196) + pulley([194, 152]), front: ln2([194, 152], J.hand) + grip(J.hand, 3.5) }));
side('Rudern Kabelzug stehend', ['Rudern Kabelzug stehend'], BK, BKs, { ankle: [96, 182], leg: [74, 98], leg2: [86, 100], torso: -84, arm: hd(122, 100, 1) },
  J => ({ back: tower(206) + pulley([204, 100]), front: ln2([204, 100], J.hand) + rect(J.hand[0] - 2, J.hand[1] - 7, 4, 14, 'eq', 2) }));
side('Rudern Maschine', ['Rudern Maschine', 'Rudern Maschine eng', 'Rudern Maschine Neutralgriff', 'Rudern Maschine Untergriff', 'Rudern Maschine einarmig', 'Low Row Maschine', 'High Row Maschine'], BK, BKs,
  { hip: [80, 140], torso: -88, leg: ft(132), arm: hd(120, 96, 1) },
  J => ({ back: seat(56, 104, 144) + rect(176, 14, 8, 176, 'eq2') + rect(166, 186, 28, 4, 'eq') + rect(102, 120, 4, 70, 'eq2') + rect(90, 186, 28, 4, 'eq') + ln2([180, 24], [J.hand[0] + 2, J.hand[1]], 'lever'),
    mid: padR(103, 102, 8, 36, 0), front: rect(J.hand[0] - 2, J.hand[1] - 7, 4, 14, 'eq', 2) }));
side('Rudern T-Bar', ['Rudern T-Bar', 'Rudern T-Bar eng', 'Meadows Row'], BK, BKs, { ankle: [122, 182], leg: [66, 96], torso: -28, arm: hd(146, 112, 1) },
  J => ({ back: ln2([24, 186], [J.hand[0] + 14, J.hand[1] + 6], 'lever'), front: pl([J.hand[0] + 16, J.hand[1] + 7], 16) + grip(J.hand, 3.5) }));
side('Überzüge', ['Überzüge / Pullover (Kurzhantel)', 'Überzüge Maschine (Pullover)'], BK, ['brust', 'trizeps'], { hip: [150, 133], ...SUP, leg: ft(184), arm: [194, 194] },
  J => ({ back: benchFlat(48, 166, 146), front: dbSide(J.hand, 90) }));
side('Überzüge am Kabel (Straight-Arm Pulldown)', ['Überzüge Kabelzug (Straight-Arm Pulldown)', 'Überzüge Band (Türanker)'], BK, ['trizeps', 'schulter_hinten'],
  { ankle: [96, 182], leg: [74, 100], torso: -50, arm: [34, 34] }, J => ({ back: tower(206) + pulley([204, 22]), front: ln2([204, 22], J.hand) + grip(J.hand, 3.6) }));
side('Rudern umgekehrt', ['Rudern umgekehrt (Tisch oder Stange)', 'Ring-Rudern', 'Rudern umgekehrt Untergriff (Tisch oder Stange)'], BK, BKs,
  { hip: [146, 152], torso: 212, farOff: [-2, -3], leg: [16, 16], foot: -70, arm: hd(118, 80, 1) },
  () => ({ back: rect(98, 76, 6, 114, 'eq2') + rect(98, 76, 24, 5, 'eq2') + rect(88, 186, 26, 4, 'eq') + `<circle cx="118" cy="80" r="4.5" class="eq"/>` }));
side('Front Lever', ['Front Lever (Tuck)', 'Front Lever Advanced Tuck', 'Front Lever ein Bein', 'Front Lever gegrätscht', 'Front Lever', 'Back Lever (Tuck)'], BK, ['bauch', 'schulter_hinten'],
  { hip: [142, 72], torso: 180, farOff: [-2, -3], leg: [0, 0], foot: -80, arm: [-90, -90] }, () => ({ back: rect(50, 0, 6, 12, 'eq2') + rect(50, 6, 46, 5, 'eq2') + `<circle cx="90" cy="9" r="4" class="eq"/>` }));
side('Rudern mit Band sitzend', ['Rudern Band sitzend', 'Rudern Band breit'], BK, BKs, { hip: [80, 176], torso: -88, leg: [2, 2], foot: -80, arm: hd(104, 144, 1) },
  J => ({ front: band(J.hand, [J.ankle[0] + 6, J.ankle[1] - 6]) }));
// ---------- Trapez (Rudern breit) ----------
side('Rudern breit (oberer Rücken)', ['Rudern Kabelzug breit', 'Rudern Maschine breit', 'Rudern T-Bar breit'], ['trapez'], ['schulter_hinten', 'lat'],
  { hip: [80, 150], torso: -92, leg: { to: [146, 164], bend: -1 }, foot: -80, arm: [178, 4] },
  J => ({ back: rect(50, 158, 64, 8, 'pad', 3) + rect(78, 166, 6, 24, 'eq2') + rect(152, 140, 6, 40, 'eq') + tower(196) + pulley([194, 100]), front: ln2([194, 100], J.hand) + rect(J.hand[0] - 2, J.hand[1] - 7, 4, 14, 'eq', 2) }));
// ---------- Hintere Schulter ----------
side('Face Pulls', ['Face Pulls', 'Face Pulls Band (Türanker)'], ['schulter_hinten'], ['trapez', 'bizeps'], { ankle: [100, 182], leg: [86, 94], torso: -88, arm: [165, -70] },
  J => ({ back: tower(204) + pulley([202, 52]), front: ln2([202, 52], J.hand) + `<path d="M${f1(J.hand[0])},${f1(J.hand[1])} l-2,8 M${f1(J.hand[0])},${f1(J.hand[1])} l3,7" class="rope"/>` + grip(J.hand, 3) }));
fb('Reverse Flys', ['Band Pull-Aparts', 'Reverse Flys Kabelzug', 'Reverse Butterfly Kabelzug', 'Vorgebeugtes Seitheben (Kurzhantel)', 'Y-T-W-Raises (Bauchlage)'], ['schulter_hinten'], ['trapez'],
  { view: 'back', at: [120, 190], s: .72, armR: [86, 6], legR: [3, 0] }, J => ({ front: band(J.handR, J.handL) + grip(J.handR, 3) + grip(J.handL, 3) }));
fb('Reverse Butterfly Maschine', ['Reverse Butterfly Maschine'], ['schulter_hinten'], ['trapez'], { view: 'back', seated: true, at: [120, 211], s: .7, armR: [86, 4], legR: [6, -6] },
  J => ({ back: rect(116, 14, 8, 176, 'eq2') + rect(100, 186, 40, 4, 'eq') + `<circle cx="120" cy="${f1(J.shR[1] - 6)}" r="6" class="eq"/>` + ln2([120, J.shR[1] - 6], J.handR, 'lever') + ln2([120, J.shL[1] - 6], J.handL, 'lever') + rect(92, 140, 56, 9, 'pad', 3),
    front: rect(J.handR[0] - 3, J.handR[1] - 10, 6, 20, 'eq', 3) + rect(J.handL[0] - 3, J.handL[1] - 10, 6, 20, 'eq', 3) }));
// ---------- Vordere Schulter (Seite) ----------
side('Landmine Press', ['Landmine Press'], ['schulter_vorne'], ['brust', 'trizeps'], { ankle: [92, 182], leg: [72, 106], leg2: [60, 114], torso: -78, arm: hd(142, 70, 1) },
  J => { const a = [224, 188], d = [a[0] - J.hand[0], a[1] - J.hand[1]], L = Math.hypot(...d), u = [d[0] / L, d[1] / L];
    return { back: ln2(J.hand, a, 'lever') + rect(218, 184, 14, 6, 'eq'), front: pl([J.hand[0] + u[0] * 16, J.hand[1] + u[1] * 16], 13) + grip(J.hand, 3.5) }; });
side('Frontheben', ['Frontheben Kurzhantel', 'Frontheben Langhantel', 'Frontheben Kabelzug', 'Frontheben Hantelscheibe'], ['schulter_vorne'], ['schulter_seite', 'brust'],
  { ankle: [104, 182], leg: [90, 90], torso: -90, arm: [-4, -4], arm2: [92, 90] }, J => ({ farFront: dbEnd([J.hand2[0] - 3, J.hand2[1] - 2], 7), front: dbEnd(J.hand, 7) }));
side('Pike-Liegestütze', ['Pike-Liegestütze'], ['schulter_vorne'], ['trizeps', 'trapez'], { hip: [110, 96], torso: 62, leg: { to: [62, 182], bend: 1 }, foot: 20, arm: hd(162, 186, -1) }, () => ({}));
side('Handstand an der Wand', ['Handstand-Liegestütze an der Wand', 'Handstand an der Wand', 'Freier Handstand'], ['schulter_vorne'], ['trizeps', 'trapez', 'bauch'],
  { hip: [120, 66], torso: 90, leg: [-90, -90], foot: -90, arm: [94, 94], zoom: .8 }, () => ({ back: wall(134) }));
side('Planche', ['Planche (Tuck)', 'Planche Lean', 'Planche Advanced Tuck', 'Planche gegrätscht'], ['schulter_vorne'], ['brust', 'bauch', 'trizeps'],
  { hip: [104, 132], torso: -4, leg: [150, 40], foot: 60, arm: hd(146, 182, 1) }, () => ({ back: rect(140, 176, 24, 6, 'eq', 2) + rect(144, 182, 4, 8, 'eq2') + rect(156, 182, 4, 8, 'eq2') }));
// ===== scC.js =====
const backBar = (J, P, r = 19) => { const d = d2(P.torso), n = [d[1], -d[0]]; return pl([J.sh[0] - d[0] * 9 + n[0] * 12, J.sh[1] - d[1] * 9 + n[1] * 12], r); };
const frontBar = (J, P) => { const d = d2(P.torso), n = [-d[1], d[0]]; return [J.sh[0] - d[0] * 4 + n[0] * 11, J.sh[1] - d[1] * 4 + n[1] * 11]; };
// ---------- Bizeps ----------
const BI = ['bizeps'], BIs = ['unterarme'];
side('Bizepscurls Langhantel', ['Bizepscurls Langhantel', 'Bizepscurls SZ-Stange', 'Drag Curls', 'Reverse Curls'], BI, BIs, { ankle: [110, 182], leg: [90, 90], torso: -90, arm: [84, -12] }, J => ({ front: pl(J.hand, 15) }));
side('Bizepscurls Kurzhanteln', ['Bizepscurls Kurzhantel', 'Bizepscurls Kurzhantel Schrägbank', 'Konzentrationscurls', 'Bizepscurls Kettlebell', 'Bizepscurls Band'], BI, BIs,
  { ankle: [110, 182], leg: [90, 90], torso: -90, arm: [84, -12], arm2: [92, 90] }, J => ({ farFront: dbEnd([J.hand2[0] - 3, J.hand2[1] - 2], 7), front: dbEnd(J.hand, 7) }));
side('Bizepscurls Kabelzug', ['Bizepscurls Kabelzug', 'Bizepscurls Kabelzug einarmig'], BI, BIs, { ankle: [100, 182], leg: [90, 90], torso: -88, arm: [84, -12] },
  J => ({ back: tower(204) + pulley([202, 178]), front: ln2([202, 178], J.hand) + grip(J.hand, 3.5) }));
side('Bayesian Curls (Kabel von hinten)', ['Bizepscurls Kabelzug hinter dem Körper (Bayesian)'], BI, BIs, { ankle: [122, 182], leg: [96, 84], leg2: [80, 96], torso: -84, arm: [118, 52] },
  J => ({ back: tower(24) + pulley([36, 150]), front: ln2([36, 150], J.hand) + grip(J.hand, 3.5) }));
side('Hammercurls', ['Hammercurls Kurzhantel', 'Hammercurls Kabelzug (Seil)'], BI, ['unterarme'], { ankle: [110, 182], leg: [90, 90], torso: -90, arm: [84, -12], arm2: [92, 90] },
  J => ({ farFront: dbSide([J.hand2[0] - 3, J.hand2[1] - 2], 0), front: dbSide(J.hand, 90) }));
side('Scottcurls', ['Scottcurls SZ-Stange (Preacher Curls)', 'Scottcurls Kurzhantel', 'Scottcurls Kabelzug', 'Scottcurls Maschine', 'Bizepscurls Maschine', 'Hammercurls Scottbank', 'Spider Curls'], BI, BIs,
  { hip: [100, 140], torso: -82, leg: ft(132), arm: [46, -58] },
  (J, P) => { const d = d2(46), n = [d[1], -d[0]], c = [J.sh[0] + d[0] * 17 - n[0] * 9, J.sh[1] + d[1] * 17 - n[1] * 9];
    return { back: seat(82, 120, 152) + `<path d="M${f1(c[0] - d[0] * 22 - n[0] * 2)},${f1(c[1] - d[1] * 22 - n[1] * 2)} L${f1(c[0] + d[0] * 22 - n[0] * 2)},${f1(c[1] + d[1] * 22 - n[1] * 2)} L${f1(c[0] + d[0] * 22 - n[0] * 14)},${f1(c[1] + d[1] * 22 - n[1] * 14)} L${f1(c[0] - d[0] * 12 - n[0] * 22)},${f1(c[1] - d[1] * 12 - n[1] * 22)} Z" class="pad"/>`
      + rect(c[0] - n[0] * 14 - 3, c[1] - n[1] * 14, 6, 190 - c[1] + n[1] * 14, 'eq2') + rect(c[0] - n[0] * 14 - 16, 186, 32, 4, 'eq'), front: pl(J.hand, 13) }; });
side('Handgelenkcurls', ['Handgelenkcurls (Unterarme)', 'Reverse Handgelenkcurls (Unterarme)'], ['unterarme'], [], { hip: [96, 136], torso: -55, leg: ft(140), arm: hd(150, 124, 1) },
  J => ({ back: benchFlat(50, 120, 148), front: pl(J.hand, 12) }));
// ---------- Trizeps ----------
const TR = ['trizeps'];
side('Trizepsdrücken am Kabel', ['Trizepsdrücken Kabelzug (Stange)', 'Trizepsdrücken Kabelzug (Seil)', 'Trizepsdrücken Kabelzug (V-Griff)', 'Trizepsdrücken Kabelzug Untergriff', 'Trizepsdrücken Kabelzug einarmig', 'Trizepsmaschine', 'Trizepsdrücken Band (Türanker)'], TR, [],
  { ankle: [100, 182], leg: [92, 90], torso: -82, arm: [96, 48] }, J => ({ back: tower(206) + pulley([204, 18]), front: ln2([204, 18], J.hand) + grip(J.hand, 3.5) }));
side('Trizepsdrücken über Kopf', ['Trizepsdrücken über Kopf Kurzhantel', 'Trizepsdrücken über Kopf Kabelzug', 'Trizepsdrücken über Kopf Maschine', 'Trizepsdrücken über Kopf Band'], TR, [],
  { ankle: [112, 182], leg: [90, 90], torso: -90, arm: [-76, 122] }, J => ({ front: dbSide(J.hand, 90) }));
side('Stirndrücken', ['Stirndrücken SZ-Stange (French Press)', 'Stirndrücken Langhantel', 'Stirndrücken Kurzhantel', 'Stirndrücken Kabelzug'], TR, [],
  { hip: [150, 133], ...SUP, leg: ft(184), arm: [-102, 150] }, J => ({ back: benchFlat(48, 166, 146), front: pl(J.hand, 14) }));
side('Bankdips', ['Bankdips'], TR, ['brust', 'schulter_vorne'], { hip: [112, 150], torso: -88, leg: { to: [190, 182], bend: -1 }, foot: -70, arm: hd(96, 142, 1) }, () => ({ back: box(58, 142, 42) }));
side('Trizeps-Kickbacks', ['Trizeps-Kickbacks Kurzhantel', 'Trizeps-Kickbacks Kabelzug'], TR, [], { ankle: [130, 182], leg: [70, 96], torso: -18, arm: [174, 176], arm2: [100, 70] }, J => ({ front: dbEnd(J.hand, 7) }));
// ---------- Quadrizeps ----------
const QU = ['quadrizeps'], QUs = ['gesaess', 'beinbeuger'];
const SQ = { ankle: [122, 182], leg: [8, 112], torso: -55 };
const sqPrep = (P, back = true) => { const c = barAt(pose3({ ...P, arm: [90, 90] }), P, back); return back ? { to: [c[0] + BB_OFF[0] * .45, c[1] + BB_OFF[1] * .45], bend: -1 } : { to: [c[0] + 2, c[1] + 1], bend: 1 }; };
const barB = (J, P, back = true) => bb3(barAt(J, P, back));
side('Kniebeugen, Langhantel', ['Kniebeugen (Langhantel)', 'Kniebeugen Safety Bar', 'Belt Squat'], QU, [...QUs, 'ruecken_unten'], { ...SQ, arm: sqPrep(SQ) }, (J, P) => barB(J, P));
side('Kniebeugen, Multipresse', ['Kniebeugen Multipresse'], QU, QUs, { ...SQ, torso: -68, arm: sqPrep({ ...SQ, torso: -68 }) }, (J, P) => { const b = barB(J, P); return { back: rails(barAt(J, P)[0]) + b.back, front: b.front }; });
side('Kniebeugen auf die Box', ['Kniebeugen Box'], QU, QUs, { ...SQ, arm: sqPrep(SQ) }, (J, P) => { const b = barB(J, P); return { back: box(62, 142, 34) + b.back, front: b.front }; });
const FS = { ankle: [122, 182], leg: [10, 112], torso: -70 };
side('Frontkniebeugen', ['Frontkniebeugen'], QU, ['gesaess', 'bauch'], { ...FS, arm: sqPrep(FS, false) }, (J, P) => barB(J, P, false));
side('Goblet Squats', ['Goblet Squats', 'Sandsack-Ausfallschritte (Sandbag Lunges)'], QU, QUs, { ...FS, arm: { to: frontBar(pose3({ ...FS, arm: [90, 90] }), FS), bend: 1 } }, (J, P) => ({ front: dbSide(frontBar(J, P), 90) }));
side('Kniebeugen ohne Gewicht', ['Kniebeugen Eigengewicht', 'Sprung-Kniebeugen (Jump Squats)'], QU, QUs, { ankle: [122, 182], leg: [8, 112], torso: -60, arm: [24, 178] }, () => ({}));
side('Hackenschmidt-Kniebeugen', ['Hackenschmidt-Kniebeugen (Hack Squat)', 'Hackenschmidt rückwärts (Reverse Hack)', 'Pendulum Squat'], QU, QUs,
  { hip: [100, 130], torso: -112, leg: { to: [142, 166], bend: -1 }, foot: -22, arm: hd(96, 74, -1) },
  (J, P) => { const d = d2(P.torso), b = d2(P.torso - 90), c = [J.hip[0] + d[0] * 26 + b[0] * 15, J.hip[1] + d[1] * 26 + b[1] * 15];
    return { back: padR(c[0], c[1], 8, 76, P.torso + 90) + ln2([c[0] - d[0] * 70 + b[0] * 8, c[1] - d[1] * 70 + b[1] * 8], [c[0] + d[0] * 60 + b[0] * 8, c[1] + d[1] * 60 + b[1] * 8], 'rail') + solePlate(J, -22) + rect(132, 176, 6, 14, 'eq2'),
      front: padR(J.sh[0] - 2, J.sh[1] - 8, 14, 7, P.torso + 90) }; });
side('Beinpresse', ['Beinpresse', 'Beinpresse 45°', 'Beinpresse horizontal', 'Beinpresse vertikal', 'Beinpresse einbeinig', 'Wadenheben an der Beinpresse'], QU, QUs,
  { hip: [104, 152], torso: 210, farOff: [-2, -3], leg: { to: [168, 104], bend: -1 }, foot: -128, arm: hd(112, 166, 1) },
  (J, P) => ({ back: padR(78, 148, 66, 9, 30) + rect(96, 160, 30, 8, 'pad', 3) + rect(104, 168, 6, 22, 'eq2') + ln2([128, 190], [234, 84], 'rail'), front: solePlate(J, -128, 48) }));
side('Beinstrecker', ['Beinstrecker', 'Beinstrecker einbeinig'], QU, [], { hip: [96, 132], torso: -100, leg: [0, 10], foot: -70, arm: hd(104, 140, 1) },
  J => ({ back: seat(76, 130, 140) + padR(80, 106, 8, 56, -10) + rect(122, 148, 6, 42, 'eq2'), front: `<circle cx="${f1(J.ankle[0] - 2)}" cy="${f1(J.ankle[1] - 9)}" r="6" class="pad"/>` }));
const LU = { hip: [108, 122], torso: -90, leg: ft(148), leg2: { to: [64, 176], bend: -1 }, foot2: 160 };
side('Ausfallschritte, Kurzhanteln', ['Ausfallschritte Kurzhantel', 'Ausfallschritte gehend', 'Ausfallschritte rückwärts', 'Ausfallschritte Eigengewicht'], QU, QUs, { ...LU, arm: [92, 90] }, J => ({ farFront: dbLong([J.hand2[0] - 3, J.hand2[1] - 2]), front: dbLong(J.hand) }));
side('Ausfallschritte, Langhantel', ['Ausfallschritte Langhantel', 'Ausfallschritte Multipresse'], QU, QUs, { ...LU, arm: sqPrep(LU) }, (J, P) => barB(J, P));
side('Bulgarian Split Squats', ['Bulgarian Split Squats', 'Bulgarian Split Squats ohne Gewicht'], QU, QUs, { hip: [106, 126], torso: -84, leg: ft(146), leg2: { to: [46, 140], bend: -1 }, foot2: 185, arm: [92, 90] },
  J => ({ back: box(10, 146, 44), farFront: dbLong([J.hand2[0] - 3, J.hand2[1] - 2]), front: dbLong(J.hand) }));
side('Step-ups', ['Step-ups'], QU, QUs, { hip: [112, 100], torso: -86, leg: { to: [138, 146], bend: -1 }, leg2: [101, 101], foot2: 10, arm: [92, 90] }, J => ({ back: box(118, 154, 56), front: dbLong(J.hand) }));
side('Sissy Squats', ['Sissy Squats'], QU, [], { ankle: [118, 172], leg: [36, 126], torso: -122, foot: 30, arm: hd(170, 92, 1) }, J => ({ back: rect(J.hand[0] - 1, 40, 6, 150, 'eq2') + box(96, 176, 40) }));
side('Einbeinige Kniebeugen', ['Einbeinige Kniebeugen (Pistol Squats)', 'Einbeinige Kniebeugen zum Stuhl', 'Shrimp Squats'], QU, QUs, { ankle: [118, 182], leg: [6, 114], leg2: [-6, -6], torso: -56, arm: hd(178, 104, 1) },
  () => ({ back: rect(178, 30, 6, 160, 'eq2') + rect(170, 186, 22, 4, 'eq') }));
side('Wandsitzen', ['Wandsitzen (Wall Sit)'], QU, QUs, { hip: [66, 140], torso: -90, leg: [0, 90], arm: hd(100, 132, 1) }, () => ({ back: wall(46) }));
// ---------- Beinbeuger ----------
const HA = ['beinbeuger'], HAs = ['gesaess', 'waden'];
side('Beinbeuger liegend', ['Beinbeuger liegend', 'Beinbeuger stehend einbeinig', 'Beinbeuger Band (Bauchlage)'], HA, HAs, { hip: [90, 106], torso: -4, leg: [180, -74], foot: -150, arm: hd(162, 122, -1) },
  J => ({ back: padR(110, 124, 120, 9, -2) + rect(70, 128, 6, 62, 'eq2') + rect(150, 126, 6, 64, 'eq2'), front: `<circle cx="${f1(J.ankle[0] + 8)}" cy="${f1(J.ankle[1] + 4)}" r="6" class="pad"/>` }));
side('Beinbeuger sitzend', ['Beinbeuger sitzend'], HA, HAs, { hip: [92, 132], torso: -98, leg: [0, 98], foot: -10, arm: hd(112, 142, 1) },
  J => ({ back: seat(72, 126, 140) + padR(76, 106, 8, 56, -8), front: `<circle cx="${f1(J.ankle[0] - 8)}" cy="${f1(J.ankle[1] - 4)}" r="6" class="pad"/>` + rect(J.knee[0] - 18, J.knee[1] - 18, 24, 7, 'pad', 3) }));
side('Kreuzheben rumänisch, Langhantel', ['Kreuzheben rumänisch (Langhantel)', 'Kreuzheben gestreckte Beine'], HA, ['gesaess', 'ruecken_unten'], { ankle: [126, 182], leg: [56, 96], torso: -28, arm: [104, 104] }, J => ({ front: pl(J.hand) }));
side('Kreuzheben rumänisch, Kurzhanteln', ['Kreuzheben rumänisch (Kurzhantel)', 'Kreuzheben rumänisch (Kettlebell)'], HA, ['gesaess', 'ruecken_unten'], { ankle: [126, 182], leg: [56, 96], torso: -28, arm: [104, 104] },
  J => ({ farFront: dbEnd([J.hand2[0] - 3, J.hand2[1] - 2], 7), front: dbEnd(J.hand, 7) }));
side('Kreuzheben einbeinig', ['Kreuzheben rumänisch einbeinig (Kurzhantel)'], HA, ['gesaess'], { hip: [110, 100], torso: -6, leg: ft(114), leg2: [176, 178], foot2: 100, arm: [92, 90] }, J => ({ front: dbEnd(J.hand, 7) }));
side('Nordic Hamstring Curls', ['Nordic Hamstring Curls', 'Beincurls am Boden (Handtuch)'], HA, ['gesaess'], { hip: [111, 145], torso: -58, leg: [120, 180], foot: 180, arm: [60, -40] },
  J => ({ back: rect(70, 182, 56, 8, 'pad', 3), front: `<circle cx="${f1(J.ankle[0] - 2)}" cy="${f1(J.ankle[1] - 8)}" r="5" class="pad"/>` }));
// ---------- Gesäß ----------
const GL = ['gesaess'], GLs = ['beinbeuger', 'quadrizeps'];
side('Hip Thrust', ['Hip Thrust Langhantel', 'Hip Thrust Maschine', 'Hip Thrust Multipresse', 'Hip Thrust Kurzhantel', 'Hip Thrust am Sofa'], GL, GLs,
  { hip: [140, 126], ...SUP, leg: ft(172), arm: hd(136, 108, 1) }, J => ({ back: benchFlat(36, 92, 140), front: pl([J.hip[0], J.hip[1] - 17]) }));
side('Glute Bridge', ['Glute Bridge', 'Glute Bridge einbeinig'], GL, GLs, { hip: [136, 152], torso: 152, farOff: [-2, -3], leg: ft(168), arm: hd(126, 186, -1) }, () => ({}));
side('Gesäß-Kickbacks', ['Gesäß-Kickbacks Kabelzug', 'Gesäß-Kickbacks Kabelzug diagonal', 'Gesäß-Kickbacks Kabelzug seitlich', 'Gesäßmaschine (Glute Kickback)', 'Kickbacks Band (Gesäß)'], GL, ['beinbeuger'],
  { hip: [114, 104], torso: -64, leg: [138, 112], foot: 150, leg2: ft(116), arm: hd(176, 90, 1) }, J => ({ back: tower(190) + pulley([188, 178]), front: ln2([188, 178], J.ankle) }));
// ---------- Waden ----------
side('Wadenheben stehend', ['Wadenheben stehend', 'Wadenheben einbeinig', 'Wadenheben Hackenschmidt', 'Wadenheben Multipresse', 'Wadenheben an der Treppe'], ['waden'], [],
  { ankle: [110, 168], leg: [90, 90], torso: -90, foot: 38, arm: [92, 90] }, J => ({ back: box(114, 178, 40), farFront: dbLong([J.hand2[0] - 3, J.hand2[1] - 2]), front: dbLong(J.hand) }));
side('Wadenheben sitzend', ['Wadenheben sitzend'], ['waden'], [], { hip: [96, 132], torso: -88, leg: { to: [138, 168], bend: -1 }, foot: 36, arm: hd(130, 128, 1) },
  J => ({ back: seat(74, 118, 140) + box(134, 178, 36), front: rect(J.knee[0] - 16, J.knee[1] - 16, 30, 8, 'pad', 3) }));
// ---------- Unterer Rücken ----------
const LB = ['ruecken_unten'], LBs = ['gesaess', 'beinbeuger', 'trapez'];
side('Kreuzheben', ['Kreuzheben', 'Kreuzheben Sumo', 'Kreuzheben Trap Bar', 'Kreuzheben Defizit', 'Rack Pulls'], LB, LBs, { ankle: [122, 182], leg: [20, 105], torso: -35, arm: [91, 90] }, J => ({ front: pl(J.hand) }));
side('Hyperextensions', ['Hyperextensions (Rückenstrecker)', 'Hyperextensions mit Gewicht', 'Rückenstrecker Maschine'], LB, ['gesaess', 'beinbeuger'],
  { hip: [112, 112], torso: -40, leg: [138, 138], foot: 50, arm: hd(140, 92, 1) }, J => ({ back: padR(122, 122, 32, 9, -45) + ln2([60, 190], [130, 120], 'lever') + padR(J.ankle[0] - 2, J.ankle[1] + 9, 16, 7, -45) }));
side('Reverse Hyperextensions', ['Reverse Hyperextensions'], LB, ['gesaess', 'beinbeuger'], { hip: [102, 113], torso: 0, leg: [184, 180], foot: 100, arm: hd(164, 128, 1) },
  () => ({ back: rect(98, 126, 70, 10, 'pad', 3) + rect(150, 136, 6, 54, 'eq2') + rect(104, 136, 6, 54, 'eq2') + rect(158, 120, 10, 16, 'pad', 3) }));
side('Good Mornings', ['Good Mornings', 'Good Mornings Band'], LB, ['beinbeuger', 'gesaess'], { ankle: [122, 182], leg: [74, 94], torso: -14, arm: sqPrep({ ankle: [122, 182], leg: [74, 94], torso: -14 }) }, (J, P) => barB(J, P));
side('Superman', ['Superman (Bauchlage)'], LB, ['gesaess', 'schulter_hinten'], { hip: [96, 174], torso: -8, leg: [186, 186], foot: 180, arm: [-14, -14] }, () => ({}));
// ---------- Bauch ----------
const AB = ['bauch'];
side('Crunches', ['Crunches', 'Crunches Maschine', 'Crunches Schrägbank'], AB, [], { hip: [134, 176], torso: 184, curl: 30, farOff: [-2, -3], leg: ft(166), arm: [200, -40] }, () => ({}));
side('Crunches am Kabel kniend', ['Crunches Kabelzug (kniend)'], AB, [], { hip: [94, 140], torso: -4, curl: 52, leg: [90, 180], foot: 180, arm: hd(146, 160, -1) },
  J => ({ back: tower(204) + pulley([202, 20]), front: ln2([202, 20], J.hand) + grip(J.hand, 3) }));
side('Sit-ups', ['Sit-ups', 'Sit-ups Schrägbank'], AB, ['hueftbeuger'], { hip: [128, 176], torso: 214, curl: 20, farOff: [-2, -3], leg: ft(160), arm: [-30, 150] }, () => ({}));
side('Beinheben hängend', ['Beinheben hängend', 'Knieheben hängend', 'Toes to Bar', 'Scheibenwischer (Windshield Wipers)'], AB, ['hueftbeuger'],
  { hip: [116, 110], torso: -96, leg: [-46, 44], foot: 10, arm: hd(118, 4, -1) }, () => ({ back: rect(40, 0, 6, 6, 'eq2') + rect(40, 2, 84, 5, 'eq2') + barEnd([118, 4]) }));
side('Knieheben an der Dipstation', ['Knieheben Dipstation'], AB, ['hueftbeuger'], { hip: [110, 120], torso: -90, leg: [-24, 88], arm: [90, 0] },
  J => ({ back: padR(94, 90, 8, 60, 0) + rect(108, J.el[1] + 4, 40, 7, 'pad', 3) + rect(86, 60, 6, 130, 'eq2') }));
side('Beinheben liegend', ['Beinheben liegend'], AB, ['hueftbeuger'], { hip: [128, 177], torso: 180, farOff: [-2, -3], leg: [-68, -68], foot: -160, arm: hd(118, 186, 1) }, () => ({}));
side('Plank', ['Plank (Unterarmstütz)'], AB, ['schulter_vorne'], { hip: [108, 162], torso: -8, leg: [170, 172], foot: 95, arm: [90, 0] }, () => ({}));
side('Russian Twists', ['Russian Twists'], AB, [], { hip: [104, 176], torso: -132, curl: 14, leg: [-26, 50], foot: 0, arm: [-4, -4] }, J => ({ front: pl(J.hand, 11) }));
side('Bauchroller', ['Bauchroller (Ab Wheel)'], AB, ['lat', 'schulter_vorne'], { hip: [118, 160], torso: -6, leg: [150, 180], foot: 180, arm: hd(200, 176, -1) },
  J => ({ front: `<circle cx="${f1(J.hand[0] + 2)}" cy="181" r="8.5" class="eq"/><circle cx="${f1(J.hand[0] + 2)}" cy="181" r="2.5" class="eq3"/>` }));
side('Dead Bug', ['Dead Bug'], AB, [], { hip: [130, 177], torso: 180, farOff: [-2, -3], leg: [-90, 0], leg2: [-30, -30], arm: [-90, -90], arm2: [-160, -160] }, () => ({}));
side('Hollow Body', ['Hollow Body Hold', 'V-Sit'], AB, ['hueftbeuger'], { hip: [128, 172], torso: 194, farOff: [-2, -3], leg: [-12, -12], foot: -20, arm: [194, 194] }, () => ({}));
side('L-Sit', ['L-Sit', 'Tuck L-Sit'], AB, ['hueftbeuger', 'trizeps'], { hip: [112, 148], torso: -90, leg: [0, 0], foot: -70, arm: [92, 92] },
  J => ({ back: rect(J.hand[0] - 16, J.hand[1] + 2, 32, 5, 'eq', 2) + rect(J.hand[0] - 12, J.hand[1] + 7, 4, 190 - J.hand[1] - 7, 'eq2') + rect(J.hand[0] + 8, J.hand[1] + 7, 4, 190 - J.hand[1] - 7, 'eq2') }));
side('Dragon Flag', ['Dragon Flag'], AB, ['lat'], { hip: [120, 130], torso: 150, curl: 25, farOff: [-2, -3], leg: [-30, -30], foot: -30, arm: hd(40, 152, 1) }, () => ({ back: benchFlat(36, 120, 154) }));
fb('Holzhacker', ['Holzhacker Kabelzug', 'Rotationsmaschine'], AB, ['schulter_vorne'], { view: 'front', at: [116, 190], s: .72, armR: [-46, -14], armL: [30, 6], legR: [6, 0] },
  J => { const h = [(J.handR[0] + J.handL[0]) / 2, (J.handR[1] + J.handL[1]) / 2]; return { back: tower(223) + pulley([220, 24]), front: ln2([220, 24], h) + grip(h, 4) }; });
fb('Seitstütz', ['Seitstütz', 'Copenhagen Plank'], AB, ['abduktoren'], { view: 'front', at: [126, 214], s: .64, rot: -58, armR: [0, 0], armL: [62, 70], legR: [2, 0] }, () => ({}));
// ---------- Abduktoren, Adduktoren ----------
const kPad = (J, out) => [J.kneeR, J.kneeL].map(k => { const sg = (k[1] > 100.5 ? 1 : -1) * (out ? 1 : -1); return padR(k[0] - 4, k[1] + sg * 7, 24, 7, (k[1] > 100.5 ? 1 : -1) * 20); }).join('');
const topSeat = () => rect(64, 89, 84, 23, 'pad', 4) + rect(52, 84, 10, 33, 'eq2', 2) + rect(144, 84, 10, 33, 'eq2', 2);
fb('Abduktoren Maschine (von oben)', ['Abduktoren Maschine'], ['abduktoren'], ['gesaess'], { view: 'front', at: [128, 162], s: .6, rot: -90, armR: [34, 8], noGround: true, shinSq: .3, legR: [22, 0] }, J => ({ back: topSeat(), front: kPad(J, true) }));
fb('Adduktoren Maschine (von oben)', ['Adduktoren Maschine'], ['adduktoren'], [], { view: 'front', at: [128, 162], s: .6, rot: -90, armR: [34, 8], noGround: true, shinSq: .3, legR: [26, 0] }, J => ({ back: topSeat(), front: kPad(J, false) }));
fb('Abduktoren am Kabel', ['Abduktoren Kabelzug'], ['abduktoren'], ['gesaess'], { view: 'back', at: [112, 190], s: .72, armR: [6, 0], armL: [44, 4], legR: [24, 0], legL: [0, 0] },
  J => ({ back: tower(14) + pulley([26, 182]), front: ln2([26, 182], J.footR) }));
fb('Adduktoren am Kabel', ['Adduktoren Kabelzug'], ['adduktoren'], [], { view: 'front', at: [112, 190], s: .72, armR: [6, 0], armL: [30, 10], legR: [-8, 0], legL: [0, 0] },
  J => ({ back: tower(218) + pulley([220, 182]), front: ln2([220, 182], J.footR) }));
fb('Seitliches Beinheben liegend', ['Seitliches Beinheben liegend', 'Clamshells'], ['abduktoren'], ['gesaess'], { view: 'back', at: [128, 244], s: .7, rot: -90, armR: [6, 0], armL: [170, 30], legR: [30, 0], legL: [0, 0] }, () => ({}));
fb('Monster Walk', ['Monster Walk (Band)'], ['abduktoren'], ['gesaess'], { view: 'back', at: [120, 190], s: .72, armR: [8, 0], legR: [12, -12] }, J => ({ front: band(J.kneeR, J.kneeL) }));
// ---------- Ganzkörper ----------
side('Kettlebell Swings', ['Kettlebell Swings'], ['gesaess'], ['beinbeuger', 'ruecken_unten', 'schulter_vorne'], { ankle: [112, 182], leg: [86, 94], torso: -86, arm: [-4, -4] }, J => ({ front: kb([J.hand[0] + 6, J.hand[1]]) }));
side('Burpees', ['Burpees', 'Burpee-Weitsprünge (Burpee Broad Jumps)'], ['quadrizeps'], ['brust', 'trizeps', 'schulter_vorne'], { ankle: [104, 182], leg: [-4, 118], torso: -30, foot: 20, arm: hd(150, 186, 1) }, () => ({}));
side('Umsetzen (Power Clean)', ['Umsetzen (Power Clean)'], ['gesaess'], ['quadrizeps', 'trapez', 'schulter_vorne'],
  { ankle: [120, 182], leg: [50, 104], torso: -76, arm: sqPrep({ ankle: [120, 182], leg: [50, 104], torso: -76 }, false) }, (J, P) => barB(J, P, false));
side('Reißen (Snatch)', ['Reißen (Snatch)'], ['gesaess'], ['quadrizeps', 'schulter_vorne', 'trapez'], { ankle: [122, 182], leg: [10, 112], torso: -70, arm: [-96, -96] }, J => ({ front: pl(J.hand, 18) }));
side('Thruster', ['Thruster'], ['quadrizeps'], ['schulter_vorne', 'gesaess', 'trizeps'], { ankle: [112, 182], leg: [45, 100], torso: -82, arm: [-20, -100] }, J => ({ front: pl(J.hand, 15) }));
side('Schlitten', ['Schlitten schieben', 'Schlitten ziehen (Sled Pull)'], ['quadrizeps'], ['gesaess', 'waden'], { hip: [96, 116], torso: -40, leg: ft(124), leg2: { to: [52, 180], bend: -1 }, foot2: 160, arm: hd(168, 98, 1) },
  () => ({ back: `<path d="M170,188 L176,150 L222,150 L230,188 Z" class="eq"/>` + rect(166, 92, 6, 60, 'eq2') + pl([198, 140], 14) }));
side('Wall Balls', ['Wall Balls'], ['quadrizeps'], ['schulter_vorne', 'gesaess'], { ankle: [110, 176], leg: [90, 90], torso: -88, foot: 36, arm: [-62, -56] },
  () => ({ back: wall(214) + rect(206, 20, 8, 3, 'eq'), front: ball([188, 34]) }));
side("Farmer's Walk", ["Farmer's Walk"], ['unterarme'], ['trapez', 'bauch'], { hip: [112, 98], torso: -90, leg: ft(132), leg2: { to: [90, 178], bend: -1 }, foot2: 150, arm: [92, 90] },
  J => ({ farFront: dbLong([J.hand2[0] - 3, J.hand2[1] - 2], 1.35), front: dbLong(J.hand, 1.35) }));
// ===== scM.js =====
/* Mobility-Szenen (eine je Übung, Schlüssel = id aus MOB_EX). Rot = gedehnt/mobilisiert, orange = mit dabei. Blaue Pfeile = Bewegung. */
const SCM = {};
const ms = (id, p, s, pose, eq) => { SCM[id] = { n: id, ex: [id], p, s, view: 'side', pose, eq }; };
const mf = (id, p, s, pose, eq) => { SCM[id] = { n: id, ex: [id], p, s, view: pose.view, pose, eq }; };
const STAND = { ankle: [120, 182], leg: [90, 90], torso: -90, arm: [90, 90] };
const QUAD = { hip: [82, 141], torso: -18, leg: [90, 180], foot: 180, arm: hd(132, 186, 1), farOff: [-3, -2] };
const SUPN = { torso: 180, farOff: [-2, -3] };                       // Rückenlage, Kopf links
const PRONE = { hip: [92, 176], torso: -4, leg: [184, 184], foot: 180 };  // Bauchlage, Kopf rechts
const HK = { hip: [112, 144], torso: -90, leg: { to: [158, 182], bend: -1 }, leg2: [110, 180], foot2: 180 };  // Kniestand, vorderes Bein vorn
const DOG = { hip: [112, 104], torso: 48, leg: { to: [76, 182], bend: 1 }, foot: 0, arm: [48, 48] };
const DSQ = { ankle: [122, 182], leg: [-6, 114], torso: -62 };      // tiefe Hocke
const LUNGE = { hip: [108, 122], torso: -90, leg: ft(148), leg2: { to: [64, 176], bend: -1 }, foot2: 160 };
const FRONT = { view: 'front', at: [120, 190], s: .72, armR: [8, 0], legR: [3, 0] };
const BACK = { view: 'back', at: [120, 190], s: .72, armR: [8, 0], legR: [3, 0] };
const floorT = () => rect(12, 22, 216, 160, 'matT', 12);
const TOPQ = { view: 'back', at: [130, 168], s: .7, rot: -90, noGround: true, armR: [6, 0, .35, .35], legR: [0, 0, .3, 1] };  // Vierfüßler von oben, Kopf links
const SIDEL = { hip: [100, 110], torso: 0, leg: [90, 180], foot: 180, noGround: true, farOff: [-2, 3] };  // Seitlage von oben, Kopf rechts
const STICK = J => stick([J.hand[0] - 16, J.hand[1]], [J.hand[0] + 16, J.hand[1]]);

// ---------- Ganzkörper ----------
ms('worldsgreatest', ['hueftbeuger', 'gesaess'], ['brust', 'beinbeuger'], { hip: [106, 150], torso: -25, leg: ft(156), leg2: { to: [30, 180], bend: -1 }, foot2: 170, arm: hd(146, 186, 1), arm2: [-100, -100] },
  J => ({ front: arcA(J.sh[0], J.sh[1], 44, -20, -100) }));
ms('inchworm', ['beinbeuger'], ['bauch', 'schulter_vorne', 'waden'], { hip: [112, 100], torso: 62, leg: { to: [70, 182], bend: 1 }, foot: 0, arm: hd(176, 186, 1) },
  J => ({ front: lineA([J.hand[0] + 10, 172], [J.hand[0] + 34, 172]) }));
ms('squattostand', ['gesaess', 'adduktoren'], ['beinbeuger', 'waden'], { ankle: [122, 182], leg: [-8, 112], torso: -40, arm: hd(142, 178, 1) },
  J => ({ front: lineA([J.hip[0] - 24, J.hip[1] + 4], [J.hip[0] - 24, J.hip[1] - 40]) }));
ms('bearcrawl', ['bauch', 'schulter_vorne'], ['quadrizeps', 'trizeps'], { hip: [86, 126], torso: 0, leg: [90, 165], foot: 120, arm: hd(140, 186, 1) },
  () => ({ front: lineA([96, 96], [140, 96]) }));
ms('ohsquatstick', ['schulter_vorne', 'gesaess'], ['quadrizeps', 'lat', 'adduktoren'], { ankle: [122, 182], leg: [10, 112], torso: -66, arm: [-104, -104] },
  J => ({ front: STICK(J) }));
ms('lungetwist', ['bauch', 'hueftbeuger'], ['quadrizeps', 'gesaess'], { ...LUNGE, arm: [0, 0], arm2: [180, 180] },
  J => ({ front: turnA(J.mid[0], J.mid[1] - 6, 30) }));
ms('planktodog', ['beinbeuger', 'waden', 'lat'], ['schulter_vorne'], DOG,
  J => ({ front: lineA([J.hip[0], J.hip[1] + 40], [J.hip[0], J.hip[1] + 10]) }));
ms('crabreach', ['brust', 'schulter_vorne', 'hueftbeuger'], ['gesaess', 'trizeps'], { hip: [118, 150], torso: 204, farOff: [-2, -3], leg: ft(166), arm2: hd(66, 186, 1), arm: [-140, -140] },
  J => ({ front: arcA(J.sh[0], J.sh[1], 48, -90, -150) }));

// ---------- Sprunggelenk und Fuß ----------
ms('kneetowall', ['waden'], ['quadrizeps'], { ...HK, hip: [118, 144], leg: { to: [168, 182], bend: -1 }, arm: hd(180, 98, 1) },
  J => ({ back: wall(186), front: lineA([J.knee[0] + 4, J.knee[1] - 14], [J.knee[0] + 24, J.knee[1] - 14]) }));
ms('anklecircles', ['waden'], [], { hip: [96, 136], torso: -90, leg: [-8, 6], foot: -10, leg2: [2, 90], arm: hd(110, 140, 1) },
  J => ({ back: seat(66, 120, 140), front: arcA(J.ankle[0] + 12, J.ankle[1], 13, -160, 160) }));
ms('slowcalfraise', ['waden'], [], { ankle: [120, 168], leg: [90, 90], torso: -90, foot: 58, arm: [90, 90] },
  J => ({ front: lineA([J.ankle[0] - 26, 182], [J.ankle[0] - 26, 158]) }));
ms('bandankle', ['waden'], [], { ...HK, arm: hd(150, 140, 1) },
  J => ({ back: rect(14, 146, 6, 44, 'eq2'), front: band(J.ankle, [18, 176]) + lineA([J.knee[0] + 4, J.knee[1] - 14], [J.knee[0] + 24, J.knee[1] - 14]) }));
ms('heeltoewalk', ['waden'], [], { hip: [116, 96], torso: -90, leg: { to: [140, 176], bend: -1 }, foot: -35, leg2: { to: [92, 176], bend: -1 }, foot2: -35, arm: [70, 70], arm2: [110, 110] },
  () => ({ front: lineA([150, 60], [190, 60]) }));
ms('toeyoga', [], ['waden'], { hip: [96, 136], torso: -90, leg: [2, 90], foot: 0, arm: hd(112, 140, 1) },
  J => ({ back: seat(66, 120, 140), front: arcA(J.ankle[0] + 16, J.ankle[1] + 6, 9, 80, -40) }));
ms('shinstretch', [], ['quadrizeps'], { hip: [92, 170], torso: -118, leg: [16, 180], foot: 180, arm: hd(58, 186, 1) });
ms('ankleRock', ['waden'], ['adduktoren', 'gesaess'], { ...DSQ, arm: [10, 10] },
  J => ({ front: lineA([J.knee[0] + 6, J.knee[1] - 16], [J.knee[0] + 28, J.knee[1] - 16]) }));
ms('dogpedal', ['waden', 'beinbeuger'], ['lat'], { ...DOG, leg2: { to: [88, 176], bend: 1 }, foot2: 40 },
  J => ({ front: lineA([J.ankle[0] - 14, 180], [J.ankle[0] - 14, 156], true) }));
ms('wallcalf', ['waden'], [], { hip: [118, 100], torso: -74, leg: ft(150), leg2: { to: [70, 182], bend: -1 }, foot2: 0, arm: hd(184, 80, 1) },
  () => ({ back: wall(190) }));
ms('tibraise', [], ['waden'], { hip: [66, 100], torso: -96, leg: { to: [118, 178], bend: -1 }, foot: -40, arm: [90, 90] },
  J => ({ back: wall(46), front: arcA(J.ankle[0], J.ankle[1], 18, -8, -50) }));
ms('calfroll', ['waden'], [], { hip: [98, 170], torso: -124, leg: [2, 2], foot: -70, arm: hd(64, 186, 1) },
  () => ({ back: roll(160, 182, 8), front: lineA([138, 156], [178, 156], true) }));

// ---------- Knie ----------
ms('spanishsquat', ['quadrizeps'], ['gesaess'], { ankle: [124, 182], leg: [2, 90], torso: -66, arm: [0, 0] },
  J => ({ back: tower(214), front: band([J.knee[0] - 2, J.knee[1] + 4], [214, J.knee[1] + 4]) }));
ms('tke', ['quadrizeps'], [], { ankle: [110, 182], leg: [80, 100], torso: -90, arm: [90, 90] },
  J => ({ back: tower(214), front: band([J.knee[0] - 3, J.knee[1]], [214, J.knee[1]]) + lineA([J.knee[0] + 8, J.knee[1] - 16], [J.knee[0] - 8, J.knee[1] - 16]) }));
ms('quadrock', ['quadrizeps'], ['gesaess', 'ruecken_unten'], QUAD,
  J => ({ front: lineA([J.hip[0] + 14, J.hip[1] - 30], [J.hip[0] - 16, J.hip[1] - 30], true) }));
ms('pausesquat', ['quadrizeps'], ['gesaess'], { ankle: [122, 182], leg: [8, 112], torso: -60, arm: [0, 0] });
ms('reverselunge', ['quadrizeps', 'hueftbeuger'], ['gesaess'], { ...LUNGE, arm: hd(116, 122, 1) },
  J => ({ front: lineA([J.ankle2[0] + 12, 160], [J.ankle2[0] - 14, 160], true) }));
ms('wallsit', ['quadrizeps'], ['gesaess'], { hip: [66, 140], torso: -90, leg: [0, 90], arm: hd(100, 132, 1) }, () => ({ back: wall(46) }));
ms('petersonstep', ['quadrizeps'], ['waden'], { ankle: [118, 152], leg: [74, 106], torso: -86, foot: 26, leg2: [96, 92], arm: [70, 70] },
  J => ({ back: box(78, 160, 56), front: lineA([166, 110], [166, 140]) }));

// ---------- Hüfte ----------
mf('ninetyninety', ['gesaess', 'adduktoren'], ['abduktoren'], { view: 'front', at: [120, 258], s: .9, armR: [16, 0], legR: [24, -114, .4, 1], legL: [92, 70, 1, .4] },
  J => ({ front: turnA(J.hip[0], J.hip[1] - 40, 34) }));
mf('hipcars', ['gesaess', 'adduktoren', 'abduktoren'], ['hueftbeuger'], { ...TOPQ, legR: [70, -70, 1, 1], legL: [0, 0, .3, 1] },
  J => ({ back: floorT(), front: arcA(J.kneeR[0], J.kneeR[1], 18, -200, 60) }));
ms('legswingfront', ['beinbeuger', 'hueftbeuger'], ['gesaess'], { hip: [110, 98], torso: -90, leg: [40, 40], leg2: [92, 90], arm: [90, 90], arm2: hd(72, 112, 1) },
  J => ({ back: rect(66, 60, 6, 130, 'eq2'), front: arcA(J.hip[0], J.hip[1], 74, 130, 30) }));
mf('legswingside', ['adduktoren', 'abduktoren'], ['gesaess'], { ...BACK, armR: [150, 10], legR: [36, 0], legL: [2, 0] },
  J => ({ back: rect(16, 8, 208, 182, 'wall'), front: arcA(J.hip[0], J.hip[1], 80, 120, 60, true) }));
mf('cossack', ['adduktoren'], ['quadrizeps', 'gesaess'], { view: 'front', at: [120, 204], s: .72, armR: [-30, -60], legR: [55, -51], legL: [38, 0] });
mf('frogrock', ['adduktoren'], ['gesaess'], { ...TOPQ, legR: [80, -80, 1, 1] },
  J => ({ back: floorT(), front: lineA([J.hip[0] - 6, J.hip[1] - 50], [J.hip[0] + 24, J.hip[1] - 50], true) }));
ms('hipflexorreach', ['hueftbeuger'], ['quadrizeps', 'bauch'], { ...HK, torso: -94, arm: hd(140, 150, 1), arm2: [-96, -96] },
  J => ({ front: lineA([J.sh[0] - 22, J.sh[1] - 10], [J.sh[0] - 22, J.sh[1] - 50]) }));
ms('couchstretch', ['hueftbeuger', 'quadrizeps'], [], { hip: [88, 154], torso: -90, leg: [137, -90], foot: -100, leg2: ft(150), arm: hd(140, 150, 1) },
  () => ({ back: wall(44) }));
ms('pigeon', ['gesaess'], ['hueftbeuger', 'abduktoren'], { hip: [100, 168], torso: -76, leg: [178, 180], foot: 180, leg2: [12, 160], foot2: 90, arm: hd(150, 186, 1) });
ms('glutebridge', ['gesaess'], ['beinbeuger', 'ruecken_unten'], { hip: [136, 152], torso: 152, farOff: [-2, -3], leg: ft(168), arm: hd(126, 186, -1) },
  J => ({ front: lineA([J.hip[0], J.hip[1] + 32], [J.hip[0], J.hip[1] + 10]) }));
mf('monsterwalk', ['abduktoren'], ['gesaess'], { ...FRONT, legR: [12, -12] },
  J => ({ front: band(J.kneeR, J.kneeL) + lineA([J.hip[0] + 50, J.hip[1] + 20], [J.hip[0] + 86, J.hip[1] + 20]) }));
mf('clamshell', ['abduktoren'], ['gesaess'], { view: 'back', at: [128, 244], s: .7, rot: -90, armR: [6, 0], armL: [170, 30], legR: [35, 0, 1, .45], legL: [0, 0, 1, .45] },
  J => ({ front: band(J.kneeR, J.kneeL) }));
ms('hamsweep', ['beinbeuger'], ['waden', 'ruecken_unten'], { hip: [104, 111.7], torso: -40, leg: [56.8, 56.8], foot: -40, leg2: { to: [96, 182], bend: -1 }, arm: [70, 70] },
  J => ({ front: arcA(J.sh[0], J.sh[1], 54, 40, 110) }));
ms('bwgoodmorning', ['beinbeuger'], ['gesaess', 'ruecken_unten'], { ankle: [122, 182], leg: [74, 94], torso: -14, arm: hd(176, 76, -1) },
  J => ({ front: arcA(J.hip[0], J.hip[1], 50, -70, -20) }));
mf('firehydrant', ['abduktoren', 'gesaess'], [], { ...TOPQ, legR: [70, -70, 1, 1] },
  J => ({ back: floorT(), front: arcA(J.hip[0], J.hip[1], 40, 200, 250) }));
ms('deepsquathold', ['adduktoren', 'gesaess'], ['waden', 'quadrizeps'], { ...DSQ, torso: -74, arm: hd(146, 118, 1) });
mf('butterfly', ['adduktoren'], [], { view: 'front', at: [120, 246], s: .7, armR: [14, -20], legR: [105, -150, .9, .8] });
mf('shinbox', ['gesaess', 'adduktoren'], ['hueftbeuger', 'quadrizeps'], { view: 'front', at: [120, 236], s: .7, armR: [30, 0], legR: [24, -114, .4, 1], legL: [92, 70, 1, .4] },
  J => ({ front: lineA([J.hip[0] + 52, J.hip[1] + 10], [J.hip[0] + 52, J.hip[1] - 30]) }));
mf('adductorrock', ['adduktoren'], ['beinbeuger'], { ...TOPQ, legR: [90, 0, 1, 1] },
  J => ({ back: floorT(), front: lineA([J.hip[0] - 10, J.hip[1] - 46], [J.hip[0] + 22, J.hip[1] - 46], true) }));
ms('slrdl', ['beinbeuger', 'gesaess'], ['ruecken_unten'], { ankle: [122, 182], leg: [86, 94], leg2: [178, 178], foot2: 100, torso: -4, arm: [90, 90] });
ms('hipairplane', ['gesaess', 'abduktoren'], ['beinbeuger'], { ankle: [122, 182], leg: [86, 94], leg2: [178, 178], foot2: 100, torso: -4, arm: [-70, -70], arm2: [100, 100] },
  J => ({ front: turnA(J.mid[0], J.mid[1] + 18, 28) }));
ms('figurefour', ['gesaess'], ['abduktoren'], { hip: [136, 176], ...SUPN, leg: [-70, 8], foot: -80, leg2: ft(176), arm: hd(150, 150, -1) });
ms('strapham', ['beinbeuger'], ['waden'], { hip: [134, 177], ...SUPN, leg: [-95, -95], foot: -10, leg2: [0, 0], foot2: -80, arm: hd(112, 140, -1) },
  J => ({ front: band(J.hand, J.ankle) }));

// ---------- Wirbelsäule und Rumpf ----------
ms('catcow', ['ruecken_unten'], ['bauch', 'trapez'], { ...QUAD, torso: -36, curl: 34 },
  J => ({ front: lineA([J.mid[0], J.mid[1] - 40], [J.mid[0], J.mid[1] - 16], true) }));
ms('birddog', ['ruecken_unten', 'gesaess'], ['schulter_vorne', 'bauch'], { ...QUAD, arm: [-6, -6], arm2: hd(132, 186, 1), leg2: [180, 180], foot2: 180 });
ms('deadbug', ['bauch'], ['hueftbeuger'], { hip: [130, 177], ...SUPN, leg: [-90, 0], leg2: [-30, -30], arm: [-90, -90], arm2: [-160, -160] });
ms('pelvictilt', ['bauch', 'ruecken_unten'], ['gesaess'], { hip: [132, 177], ...SUPN, leg: ft(170), arm: hd(126, 186, -1) },
  J => ({ front: arcA(J.hip[0], J.hip[1] - 8, 16, 200, 330) }));
ms('scorpion', ['hueftbeuger', 'bauch'], ['brust', 'quadrizeps'], { ...PRONE, leg: [200, -80], foot: -60, arm: [10, 10] },
  J => ({ front: arcA(J.hip[0], J.hip[1], 50, 200, 270) }));
mf('standrot', ['bauch'], ['ruecken_unten', 'lat'], { ...FRONT, armR: [90, 0], headTurn: 25 },
  J => ({ front: turnA(J.hip[0], J.hip[1] - 26, 40) }));
ms('childpose', ['lat', 'ruecken_unten'], ['gesaess'], { hip: [80, 168], torso: 2, curl: 26, leg: [18, 180], foot: 180, arm: [172, 172], zoom: 1.4, zoomAt: [120, 188] });
ms('cobrapress', ['bauch'], ['ruecken_unten', 'brust'], { ...PRONE, hip: [90, 176], torso: -24, arm: hd(150, 186, 1) },
  J => ({ front: lineA([J.sh[0] + 22, J.sh[1] + 20], [J.sh[0] + 22, J.sh[1] - 10], true) }));
const SPL = { view: 'front', at: [116, 211], s: .64, rot: -50, armL: [40, 0], armR: [130, 0], legR: [2, 0] };  // Seitstütz auf der Hand
mf('sideplankthread', ['bauch'], ['schulter_vorne', 'abduktoren'], SPL,
  J => ({ front: arcA(J.handR[0], J.handR[1] + 40, 34, -110, 30) }));
mf('lyingtwist', ['ruecken_unten', 'bauch'], ['gesaess', 'brust'], { view: 'front', at: [128, 162], s: .6, rot: -90, noGround: true, armR: [90, 0], legR: [80, -80], legL: [-62, 62] },
  J => ({ back: floorT(), front: arcA(J.hip[0] + 34, J.hip[1], 34, 40, -50) }));
mf('pallof', ['bauch'], ['schulter_vorne'], { ...FRONT, armR: [12, -40, .6, .5] },
  J => ({ back: tower(16), front: band([(J.handR[0] + J.handL[0]) / 2, J.handR[1]], [24, J.handR[1]]) }));
mf('sidebend', ['lat', 'bauch'], [], { ...FRONT, lean: 16, armR: [10, 0], armL: [170, 10] },
  J => ({ front: arcA(J.hip[0], J.hip[1], 96, -120, -76) }));

// ---------- Brustwirbelsäule ----------
ms('openbook', ['brust', 'bauch'], ['schulter_vorne', 'lat'], { ...SIDEL, arm: [-90, -90], arm2: [90, 90] },
  J => ({ back: floorT(), front: arcA(J.sh[0], J.sh[1], 54, 80, -80) }));
ms('threadneedle', ['trapez', 'schulter_hinten'], ['lat', 'ruecken_unten'], { ...QUAD, torso: 0, curl: 10, arm: [120, 175], arm2: hd(150, 186, 1) },
  J => ({ front: arcA(J.sh[0], J.sh[1], 40, 140, 200) }));
ms('quadrot', ['trapez', 'lat'], ['brust'], { ...QUAD, arm: [-80, 140], arm2: hd(132, 186, 1) },
  J => ({ front: arcA(J.sh[0], J.sh[1], 36, -40, -130) }));
ms('rollerext', ['trapez'], ['bauch', 'brust'], { hip: [150, 177], ...SUPN, torso: 192, curl: -26, leg: ft(196), arm: [-150, 30] },
  () => ({ back: roll(116, 180, 9) }));
ms('benchtspine', ['lat', 'trapez'], ['trizeps'], { hip: [76, 140], torso: 8, curl: -14, leg: [90, 180], foot: 180, arm: { to: [136, 110], bend: -1 } },
  () => ({ back: benchFlat(142, 228, 136) }));
mf('wallangel', ['schulter_hinten', 'trapez'], ['brust'], { ...FRONT, armR: [90, 90] },
  J => ({ back: rect(16, 8, 208, 182, 'wall'), front: lineA([J.handR[0] + 14, J.handR[1] + 20], [J.handR[0] + 14, J.handR[1] - 16], true) }));
ms('sphinx', ['bauch'], ['ruecken_unten'], { ...PRONE, hip: [90, 176], torso: -22, arm: [90, 0] });
mf('seatedtwist', ['bauch', 'ruecken_unten'], ['gesaess'], { view: 'front', at: [120, 246], s: .7, headTurn: 35, armR: [20, -60], armL: [10, 0], legR: [105, -150, .9, .8] },
  J => ({ front: turnA(J.hip[0], J.hip[1] - 40, 34) }));
ms('reachroll', ['trapez', 'schulter_hinten'], ['lat'], { hip: [80, 170], torso: 0, curl: 18, leg: [16, 180], foot: 180, arm: [-14, -14], arm2: hd(190, 182, 1) },
  J => ({ front: lineA([J.hand[0] - 10, J.hand[1] + 16], [J.hand[0] - 10, J.hand[1] - 12]) }));
ms('windmill', ['brust', 'schulter_vorne'], ['lat'], { ...SIDEL, arm: [-30, -30], arm2: [90, 90] },
  J => ({ back: floorT(), front: arcA(J.sh[0], J.sh[1], 58, 100, -220) }));

// ---------- Schulter ----------
mf('armcircles', ['schulter_seite'], ['trapez', 'schulter_vorne'], { ...FRONT, armR: [90, 0] },
  J => ({ front: arcA(J.handR[0], J.handR[1], 9, -160, 160) + arcA(J.handL[0], J.handL[1], 9, -20, 300) }));
mf('pullapart', ['schulter_hinten'], ['trapez'], { ...BACK, armR: [86, 6] }, J => ({ front: band(J.handR, J.handL) }));
mf('dislocates', ['schulter_vorne', 'brust'], ['lat'], { ...FRONT, armR: [160, 6] },
  J => ({ front: stick([J.handL[0] - 10, J.handL[1]], [J.handR[0] + 10, J.handR[1]]) + arcA(J.hip[0], J.handR[1] + 30, 34, -150, -30) }));
ms('scappushup', ['trapez'], ['brust', 'schulter_vorne'], { hip: [108.6, 145.9], torso: -24.3, leg: [155.7, 155.7], foot: 100, arm: [90, 90] },
  J => ({ front: lineA([J.sh[0] - 6, J.sh[1] - 34], [J.sh[0] - 6, J.sh[1] - 14], true) }));
mf('scappull', ['trapez', 'lat'], ['unterarme'], { view: 'back', at: [120, 182], s: .62, armR: [168, 0], legR: [1, 0], shrug: -4 },
  J => ({ back: rect(28, 0, 6, 190, 'eq2') + rect(206, 0, 6, 190, 'eq2') + rect(28, J.handR[1] - 3, 184, 5, 'eq2'), front: lineA([J.hip[0] + 40, J.hip[1] - 30], [J.hip[0] + 40, J.hip[1] - 54]) }));
mf('deadhang', ['lat'], ['unterarme', 'schulter_vorne'], { view: 'back', at: [120, 182], s: .62, armR: [168, 0], legR: [1, 0] },
  J => ({ back: rect(28, 0, 6, 190, 'eq2') + rect(206, 0, 6, 190, 'eq2') + rect(28, J.handR[1] - 3, 184, 5, 'eq2') }));
mf('ytw', ['schulter_hinten', 'trapez'], ['ruecken_unten'], { view: 'back', at: [128, 162], s: .6, rot: -90, noGround: true, armR: [150, 0], legR: [2, 0] }, () => ({ back: floorT() }));
mf('bandextrot', ['schulter_hinten'], [], { ...FRONT, armR: [6, -50, 1, .55] }, J => ({ front: band(J.handR, J.handL) }));
ms('sleeper', ['schulter_hinten'], [], { ...SIDEL, arm: [90, 160], arm2: [-60, -60] },
  J => ({ back: floorT(), front: arcA(J.el[0], J.el[1], 26, 200, 150) }));
ms('doorchest', ['brust'], ['schulter_vorne'], { ankle: [120, 182], leg: [86, 94], torso: -82, arm: [180, -90] },
  J => ({ back: rect(J.el[0] - 9, 10, 6, 180, 'eq2') }));
mf('crossbody', ['schulter_hinten'], ['trapez'], { ...FRONT, armR: [-84, 0], armL: [-20, -120] });
mf('shouldercars', ['schulter_seite', 'schulter_vorne', 'schulter_hinten'], [], { ...FRONT, armR: [150, 0], armL: [6, 0] },
  J => ({ front: arcA(J.shR[0], J.shR[1], 52, -150, 120) }));
ms('wallslide', ['schulter_vorne', 'trapez'], ['lat'], { ankle: [110, 182], leg: [90, 90], torso: -90, arm: { to: [150, 46], bend: 1 } },
  J => ({ back: wall(154), front: lineA([J.hand[0] - 10, J.hand[1] + 30], [J.hand[0] - 10, J.hand[1] - 2]) }));
ms('latwall', ['lat'], ['beinbeuger', 'trizeps'], { ankle: [92, 182], leg: [90, 90], torso: 0, arm: [-6, -6] },
  J => ({ back: wall(J.hand[0] + 4) }));
mf('proneswimmer', ['schulter_hinten', 'trapez'], ['ruecken_unten'], { view: 'back', at: [128, 162], s: .6, rot: -90, noGround: true, armR: [170, 0], armL: [40, 60], legR: [2, 0] },
  J => ({ back: floorT(), front: arcA(J.shR[0], J.shR[1], 40, 0, 120) }));
mf('overheadpullapart', ['schulter_hinten', 'trapez'], ['lat'], { ...FRONT, armR: [165, 0] }, J => ({ front: band(J.handR, J.handL) }));
mf('halo', ['schulter_vorne', 'trapez'], ['trizeps'], { ...FRONT, armR: [150, -130], armL: [40, 140] },
  J => ({ front: kb([(J.handR[0] + J.handL[0]) / 2, Math.min(J.handR[1], J.handL[1]) - 10]) + arcA(J.head[0], J.head[1], 30, -200, 20) }));
mf('shoulderrolls', ['trapez'], ['schulter_hinten'], FRONT,
  J => ({ front: arcA(J.shR[0], J.shR[1] - 4, 9, -160, 160) + arcA(J.shL[0], J.shL[1] - 4, 9, -20, 300) }));

// ---------- Arme ----------
ms('wristcircles', ['unterarme'], [], { ...STAND, arm: [80, 0] }, J => ({ front: arcA(J.hand[0] + 6, J.hand[1], 9, -160, 160) }));
ms('wristflexor', ['unterarme'], [], QUAD, J => ({ front: lineA([J.hand[0] + 14, 180], [J.hand[0] - 6, 180]) }));
ms('wristextensor', ['unterarme'], [], { ...STAND, arm: [0, 0], arm2: [60, -10] }, J => ({ front: arcA(J.hand[0], J.hand[1], 12, -60, 60) }));
ms('wristrocks', ['unterarme'], [], QUAD, J => ({ front: lineA([J.sh[0] - 14, J.sh[1] - 22], [J.sh[0] + 14, J.sh[1] - 22], true) }));
ms('pronsup', ['unterarme'], ['bizeps'], { ...STAND, arm: [80, 0] }, J => ({ front: turnA(J.hand[0] - 6, J.hand[1] + 10, 12) }));
ms('fingerext', ['unterarme'], [], { ...STAND, arm: [80, 0] }, J => ({ front: `<circle cx="${f1(J.hand[0] + 5)}" cy="${f1(J.hand[1])}" r="5" class="band" fill="none"/>` }));
mf('tricepsoh', ['trizeps'], ['lat'], { ...FRONT, armR: [170, 168], armL: [140, 120] });
ms('bicepswall', ['bizeps'], ['brust', 'schulter_vorne'], { ankle: [120, 182], leg: [90, 90], torso: -90, arm: [172, 172] }, J => ({ back: wall(J.hand[0] - 10) }));
ms('fistspread', ['unterarme'], [], { ...STAND, arm: [80, 0] }, J => ({ front: arcA(J.hand[0] + 4, J.hand[1], 10, -70, 70, true) }));
mf('prayer', ['unterarme'], [], { ...FRONT, armR: [14, -152] });

// ---------- Nacken ----------
mf('neckrot', ['trapez'], [], { view: 'front', at: [120, 330], s: 1.5, noGround: true, armR: [8, 0], legR: [3, 0], headTurn: 40 }, J => ({ front: turnA(J.head[0], J.head[1] - 22, 22) }));
mf('necktilt', ['trapez'], [], { view: 'front', at: [120, 330], s: 1.5, noGround: true, armR: [8, 0], legR: [3, 0], headTilt: 24 }, J => ({ front: arcA(J.head[0], J.head[1] + 20, 34, -120, -70, true) }));
ms('chintuck', ['trapez'], [], { ...STAND, head: -6, zoom: 1.8, zoomAt: [122, 26] }, J => ({ front: lineA([J.sh[0] + 30, J.sh[1] - 18], [J.sh[0] + 16, J.sh[1] - 18]) }));
ms('nod', ['trapez'], [], { ...STAND, head: 20, zoom: 1.8, zoomAt: [122, 26] }, J => ({ front: arcA(J.sh[0] + 2, J.sh[1] - 22, 20, -50, 30, true) }));
mf('uppertrap', ['trapez'], [], { view: 'front', at: [120, 330], s: 1.5, noGround: true, armR: [8, 0], legR: [3, 0], headTilt: -28, armL: [145, 118] });
mf('levator', ['trapez'], [], { view: 'front', at: [120, 330], s: 1.5, noGround: true, armR: [8, 0], legR: [3, 0], headTilt: -18, headTurn: -40, armL: [145, 118] });
ms('chintuckwall', ['trapez'], [], { ankle: [96, 182], leg: [90, 90], torso: -90, arm: [90, 90], head: -6, zoom: 1.8, zoomAt: [98, 26] },
  J => ({ back: wall(78), front: lineA([J.sh[0] + 30, J.sh[1] - 18], [J.sh[0] + 16, J.sh[1] - 18]) }));
// ===== scY.js =====
/* Yoga-Szenen (eine je Haltung, Schlüssel = id aus YOGA_POSES). Rot = hier spürst du die Haltung, orange = hält und stabilisiert. */
const SCY = {};
const ys = (id, p, s, pose, eq) => { SCY[id] = { n: id, ex: [id], p, s, view: 'side', pose, eq }; };
const yf = (id, p, s, pose, eq) => { SCY[id] = { n: id, ex: [id], p, s, view: pose.view, pose, eq }; };
// aus einer Mobility-Szene übernehmen (Haltung ggf. angepasst)
const yr = (id, mob, p, s, patch = {}, eq) => { const m = SCM[mob]; SCY[id] = { ...m, n: id, ex: [id], p: p || m.p, s: s || m.s, pose: { ...m.pose, ...patch }, eq: eq === undefined ? m.eq : eq }; };
const SEATX = { view: 'front', at: [120, 246], s: .7, armR: [24, -40], legR: [100, -158, .9, .8] };   // Schneidersitz von vorn
const SEIZA = { hip: [92, 168], torso: -90, leg: [16, 180], foot: 180, arm: hd(128, 166, 1) };        // Fersensitz
const STAFF = { hip: [90, 178], torso: -90, leg: [0, 0], foot: -80, arm: hd(92, 186, 1) };             // Langsitz
const SAVA = { hip: [134, 177], ...SUPN, leg: [0, 0], foot: -70, arm: [4, 4] };                         // Rückenlage gestreckt
const W2 = { view: 'front', at: [120, 203], s: .72, armR: [90, 0], legR: [50, -50], legL: [40, 0] };  // Krieger II
const CROW = { hip: [108, 118], torso: 26, leg: [38, 200], foot: 200, arm: hd(150, 186, 1) };
const PLANK = { hip: [108.6, 145.9], torso: -24.3, leg: [155.7, 155.7], foot: 100, arm: [90, 90] };
const SHST = { hip: [100, 141], torso: 90, curl: 60, leg: [-90, -90], foot: -90, arm: hd(96, 146, 1) };  // Schulterstand
const breath = J => ({ front: lineA([J.hip[0] + 46, J.hip[1] - 50], [J.hip[0] + 46, J.hip[1] - 76], true) });

// ---------- Aufwärmen ----------
yr('catcow', 'catcow');
ys('tabletop', ['bauch'], ['schulter_vorne', 'ruecken_unten'], QUAD);
yr('threadneedle', 'threadneedle');
yr('birddog', 'birddog');
yr('hipcircles', 'hipcars');
yf('neckstretch', ['trapez'], [], { ...SEATX, headTilt: -24, armL: [145, 118] });
yr('shouldercircles', 'armcircles');
yr('wristmob', 'wristrocks');
yf('palmtree', ['lat', 'bauch'], [], { ...FRONT, lean: 14, armR: [172, 0], armL: [176, 0] }, J => ({ front: arcA(J.hip[0], J.hip[1], 96, -116, -78) }));

// ---------- Stehhaltungen ----------
yf('mountain', ['bauch'], ['quadrizeps', 'gesaess'], { ...FRONT, armR: [10, 0] });
ys('warrior1', ['hueftbeuger', 'quadrizeps'], ['schulter_vorne', 'gesaess'], { hip: [104, 128], torso: -90, leg: ft(156), leg2: { to: [40, 182], bend: -1 }, foot2: -20, arm: [-92, -92] });
yf('warrior2', ['quadrizeps', 'adduktoren'], ['schulter_seite', 'gesaess'], { ...W2, headTurn: 50 });
yf('reversewarrior', ['lat', 'bauch'], ['quadrizeps'], { ...W2, lean: -18, armR: [168, 0], armL: [20, 0], headTurn: 30 });
ys('humblewarrior', ['schulter_vorne', 'brust', 'beinbeuger'], ['quadrizeps'], { hip: [104, 128], torso: 72, leg: ft(156), leg2: { to: [40, 182], bend: -1 }, foot2: -20, arm: [-150, -150] });
yf('sideangle', ['lat', 'adduktoren'], ['quadrizeps'], { ...W2, lean: 50, armR: [50, 0], armL: [178, 0] });
yf('revsideangle', ['bauch', 'ruecken_unten'], ['quadrizeps', 'adduktoren'], { ...W2, lean: 45, armR: [135, 0], armL: [45, 0], headTurn: -30 }, J => ({ front: turnA(J.hip[0] + 30, J.hip[1] - 40, 22) }));
yf('triangle', ['beinbeuger', 'adduktoren', 'lat'], ['bauch'], { view: 'front', at: [120, 198], s: .72, lean: 60, armR: [60, 0], armL: [120, 0], legR: [30, 0], legL: [30, 0] });
yf('revtriangle', ['bauch', 'beinbeuger'], ['ruecken_unten'], { view: 'front', at: [120, 198], s: .72, lean: 60, armR: [120, 0], armL: [60, 0], legR: [30, 0], legL: [30, 0], headTurn: -30 },
  J => ({ front: turnA(J.hip[0] + 40, J.hip[1] - 30, 22) }));
ys('chair', ['quadrizeps'], ['gesaess', 'schulter_vorne'], { ankle: [124, 182], leg: [20, 108], torso: -60, arm: [-60, -60] });
ys('revchair', ['bauch'], ['quadrizeps'], { ankle: [124, 182], leg: [20, 108], torso: -60, arm: [60, -70] }, J => ({ front: turnA(J.mid[0], J.mid[1] - 10, 26) }));
ys('pyramid', ['beinbeuger'], ['waden'], { hip: [102, 113], torso: 64, curl: 14, leg: { to: [150, 182], bend: -1 }, leg2: { to: [54, 182], bend: -1 }, foot2: -20, arm: hd(146, 186, 1) });
ys('widefold', ['beinbeuger', 'adduktoren'], ['waden'], { ankle: [116, 182], leg: [90, 90], torso: 50, curl: 30, arm: hd(146, 186, 1) });
yf('goddess', ['adduktoren', 'quadrizeps'], ['gesaess', 'schulter_seite'], { view: 'front', at: [120, 206], s: .72, armR: [90, 90], legR: [60, -60] });
ys('highlunge', ['hueftbeuger', 'quadrizeps'], ['gesaess'], { hip: [108, 122], torso: -90, leg: ft(152), leg2: { to: [48, 178], bend: -1 }, foot2: 150, arm: [-92, -92] });
ys('lowlunge', ['hueftbeuger'], ['quadrizeps'], { hip: [104, 150], torso: -86, leg: ft(152), leg2: [125, 180], foot2: 180, arm: [-96, -96] });
yr('skandasana', 'cossack', ['adduktoren'], ['quadrizeps'], { armR: [18, -150] });

// ---------- Gleichgewicht ----------
yf('tree', ['gesaess', 'adduktoren'], ['waden', 'bauch'], { ...FRONT, armR: [165, -20], legR: [70, -150], legL: [2, 0] });
ys('warrior3', ['gesaess', 'beinbeuger'], ['ruecken_unten', 'schulter_vorne'], { ankle: [110, 182], leg: [86, 94], torso: -2, leg2: [178, 178], foot2: 100, arm: [-2, -2] });
yf('halfmoon', ['gesaess', 'abduktoren'], ['adduktoren', 'bauch'], { view: 'front', at: [128, 189], s: .72, lean: 85, armR: [85, 0], armL: [95, 0], legR: [8, 0], legL: [88, 0] });
yf('revhalfmoon', ['bauch', 'beinbeuger'], ['gesaess'], { view: 'front', at: [128, 189], s: .72, lean: 85, armR: [95, 0], armL: [85, 0], legR: [8, 0], legL: [88, 0], headTurn: -30 },
  J => ({ front: turnA(J.hip[0] - 30, J.hip[1] - 30, 20) }));
yf('eagle', ['schulter_hinten', 'abduktoren'], ['quadrizeps'], { ...FRONT, armR: [-50, -110, .9, .9], armL: [-30, -120], legR: [-14, -20], legL: [6, 4] });
ys('dancer', ['hueftbeuger', 'quadrizeps', 'brust'], ['gesaess', 'waden'], { ankle: [120, 182], leg: [88, 92], torso: -50, leg2: [150, -90], foot2: -100, arm: [-40, -40], arm2: [140, 150] });
ys('handtotoe', ['beinbeuger'], ['gesaess', 'bauch'], { hip: [110, 98], torso: -84, leg: [8, 8], foot: -70, leg2: [92, 90], arm: { to: [160, 96], bend: 1 } }, J => ({ front: band(J.hand, [J.ankle[0] + 10, J.ankle[1] - 4]) }));
ys('standsplit', ['beinbeuger'], ['hueftbeuger'], { ankle: [130, 182], leg: [90, 90], torso: 80, curl: 14, leg2: [-124, -124], foot2: -120, arm: hd(144, 186, 1) });
yf('sugarcane', ['quadrizeps', 'hueftbeuger'], ['gesaess'], { view: 'front', at: [128, 189], s: .72, lean: 85, armR: [85, 0], armL: [20, 0], legR: [8, 0], legL: [88, 0, 1, .35] });
ys('figurefour', ['gesaess'], ['quadrizeps'], { hip: [96, 128], torso: -58, leg: [0, 170], foot: 180, leg2: ft(128), arm: [-10, -10] });

// ---------- Rückbeugen ----------
ys('cobra', ['bauch'], ['ruecken_unten', 'brust'], { ...PRONE, torso: -30, arm: hd(144, 186, 1) });
yr('sphinx', 'sphinx');
ys('updog', ['bauch', 'brust', 'hueftbeuger'], ['ruecken_unten', 'trizeps'], { hip: [96, 166], torso: -45, leg: [176, 176], foot: 180, arm: [90, 90] });
ys('locust', ['ruecken_unten', 'gesaess'], ['beinbeuger', 'schulter_hinten'], { hip: [96, 174], torso: -10, leg: [188, 188], foot: 180, arm: [176, 176] });
ys('bow', ['brust', 'hueftbeuger', 'quadrizeps'], ['ruecken_unten', 'gesaess'], { hip: [100, 176], torso: -34, leg: [194, -45], foot: -60, arm: { to: [88, 136], bend: -1 } });
ys('bridge', ['hueftbeuger', 'brust'], ['gesaess'], { hip: [136, 148], torso: 150, farOff: [-2, -3], leg: ft(168), arm: [10, 10] });
ys('wheel', ['brust', 'hueftbeuger', 'bauch'], ['trizeps', 'gesaess'], { hip: [118, 110], torso: 150, curl: 20, farOff: [-2, -3], leg: ft(160), arm: hd(60, 186, -1) });
ys('camel', ['hueftbeuger', 'brust', 'bauch', 'quadrizeps'], ['ruecken_unten'], { hip: [110, 141], torso: -130, curl: -40, leg: [90, 180], foot: 180, arm: { to: [72, 178], bend: 1 } });
ys('fish', ['brust', 'bauch'], ['trapez'], { hip: [140, 178], ...SUPN, torso: 192, curl: -30, leg: [0, 0], foot: -80, arm: [4, 4] });
ys('reversetable', ['brust', 'schulter_vorne', 'hueftbeuger'], ['gesaess', 'trizeps'], { hip: [128, 140], ...SUPN, torso: 178, leg: [0, 90], foot: 0, arm: hd(72, 186, 1) });
ys('upwardplank', ['brust', 'schulter_vorne', 'hueftbeuger'], ['gesaess', 'trizeps'], { hip: [119.8, 146.8], ...SUPN, torso: 204.8, leg: [24.8, 24.8], foot: 60, arm: [90, 90] });
yf('wildthing', ['brust', 'hueftbeuger'], ['schulter_vorne'], { ...SPL, armR: [170, 0], legL: [-24, -70] });
ys('kingpigeon', ['hueftbeuger', 'quadrizeps', 'brust'], ['gesaess'], { hip: [100, 168], torso: -96, curl: -22, leg: [178, -96], foot: -90, leg2: [12, 160], foot2: 90, arm: [-120, -160] });
ys('puppy', ['lat', 'brust', 'schulter_vorne'], ['trizeps'], { hip: [84, 141], torso: 36.6, leg: [90, 180], foot: 180, arm: hd(186, 184, 1) });

// ---------- Vorbeugen ----------
ys('standfold', ['beinbeuger'], ['waden', 'ruecken_unten'], { ankle: [110, 182], leg: [90, 90], torso: 50, curl: 30, arm: hd(140, 186, 1) });
ys('halffold', ['beinbeuger'], ['ruecken_unten'], { ankle: [110, 182], leg: [90, 90], torso: 6, arm: hd(118, 146, 1) });
ys('seatedfold', ['beinbeuger'], ['waden', 'ruecken_unten'], { ...STAFF, torso: -58, curl: 42, zoom: 1.3, zoomAt: [120, 186], arm: hd(152, 172, 1) });
ys('headtoknee', ['beinbeuger'], ['ruecken_unten'], { ...STAFF, torso: -58, curl: 42, zoom: 1.3, zoomAt: [120, 186], leg2: [10, 176], foot2: 180, arm: hd(152, 172, 1) });
yf('revheadtoknee', ['lat', 'beinbeuger'], ['adduktoren'], { view: 'front', at: [120, 246], s: .7, lean: 40, armR: [40, 0], armL: [130, 0], legR: [88, 0], legL: [100, -158, .9, .8] });
yf('wideseatedfold', ['adduktoren', 'beinbeuger'], [], { view: 'front', at: [120, 246], s: .7, headTilt: 0, armR: [26, 0, .7, .7], legR: [78, 0] });
ys('tortoise', ['ruecken_unten', 'beinbeuger'], ['schulter_hinten'], { ...STAFF, torso: -8, curl: 30, leg: [-14, 14], arm: [150, 150] });
ys('rabbit', ['ruecken_unten', 'trapez'], ['schulter_hinten'], { hip: [84, 141], torso: 10, curl: 60, leg: [90, 180], foot: 180, arm: [170, 170] });
ys('halfboundlotusfold', ['beinbeuger', 'gesaess'], [], { hip: [110, 98], torso: 50, curl: 30, leg: [40, 170], foot: 170, leg2: [90, 90], arm: hd(142, 186, 1), arm2: [-160, -160] });
ys('foldclasp', ['beinbeuger', 'brust', 'schulter_vorne'], [], { ankle: [110, 182], leg: [90, 90], torso: 50, curl: 30, arm: [-112, -112] });

// ---------- Drehungen ----------
yr('halflordfishes', 'seatedtwist');
ys('marichi1', ['beinbeuger', 'ruecken_unten'], ['schulter_vorne'], { ...STAFF, torso: -26, curl: 24, leg: ft(136), leg2: [0, 0], foot2: -80, arm: [120, 60] });
ys('marichi3', ['bauch', 'ruecken_unten'], ['gesaess'], { ...STAFF, leg: ft(136), leg2: [0, 0], foot2: -80, arm: hd(140, 150, 1), arm2: hd(66, 186, 1) }, J => ({ front: turnA(J.mid[0], J.mid[1] - 10, 26) }));
yf('easytwist', ['bauch'], ['ruecken_unten'], { ...SEATX, headTurn: 35, armR: [30, -50], armL: [12, 0] }, J => ({ front: turnA(J.hip[0], J.hip[1] - 40, 34) }));
yr('supinetwist', 'lyingtwist');
yf('reclinedtwist', ['ruecken_unten', 'gesaess'], ['brust', 'beinbeuger'], { view: 'front', at: [128, 162], s: .6, rot: -90, noGround: true, armR: [90, 0], legR: [62, 0], legL: [-40, 0] },
  J => ({ back: floorT(), front: arcA(J.hip[0] + 34, J.hip[1], 34, 40, -50) }));
ys('revlowlunge', ['bauch', 'hueftbeuger'], ['quadrizeps'], { hip: [104, 150], torso: -60, leg: ft(152), leg2: [125, 180], foot2: 180, arm: [-90, -90], arm2: hd(150, 186, 1) }, J => ({ front: turnA(J.mid[0], J.mid[1] - 10, 26) }));
yf('bharadvaja', ['bauch'], ['ruecken_unten'], { view: 'front', at: [120, 246], s: .7, headTurn: 35, armR: [30, -50], legR: [-30, -110, .5, .9], legL: [96, 100, .9, .5] }, J => ({ front: turnA(J.hip[0], J.hip[1] - 40, 34) }));
ys('heelstwist', ['bauch'], ['ruecken_unten', 'quadrizeps'], { ...SEIZA, arm: hd(128, 160, 1), arm2: hd(66, 186, 1) }, J => ({ front: turnA(J.mid[0], J.mid[1] - 10, 26) }));

// ---------- Hüftöffner ----------
yr('halfpigeon', 'pigeon');
ys('lizard', ['hueftbeuger', 'adduktoren'], ['gesaess'], { hip: [104, 146], torso: 0, leg: ft(172), leg2: [125, 180], foot2: 180, arm: [90, 0] });
yr('boundangle', 'butterfly');
yf('firelog', ['gesaess', 'abduktoren'], ['adduktoren'], { ...SEATX, armR: [20, -20], legR: [80, -170, .5, 1] });
yf('cowface', ['trizeps', 'gesaess', 'schulter_vorne'], ['abduktoren'], { ...SEATX, armR: [172, 170], armL: [24, -150], legR: [-10, -150, .5, .9], legL: [60, -120, .6, .9] });
ys('happybaby', ['adduktoren', 'gesaess'], ['ruecken_unten'], { hip: [136, 177], ...SUPN, leg: [-124, -90], foot: -180, arm: { to: [124, 110], bend: -1 } });
yr('frog', 'frogrock', null, null, {}, J => ({ back: floorT() }));
ys('garland', ['adduktoren', 'waden'], ['gesaess'], { ...DSQ, torso: -80, arm: [70, -110] });
yr('reclinedfigurefour', 'figurefour');
ys('halfsplit', ['beinbeuger'], ['waden'], { hip: [104, 141], torso: -10, curl: 16, leg: [29, 29], foot: -70, leg2: [90, 180], foot2: 180, arm: hd(150, 186, 1) });
ys('splits', ['beinbeuger', 'hueftbeuger'], ['quadrizeps'], { hip: [110, 176], torso: -90, leg: [0, 0], foot: -80, leg2: [180, 180], foot2: 180, arm: [-90, -90] });
yf('gate', ['lat', 'adduktoren'], ['bauch'], { view: 'front', at: [120, 224], s: .72, lean: 30, armR: [40, 0], armL: [130, 0], legR: [60, 0], legL: [0, 0, 1, .3] });
yf('recboundangle', ['adduktoren'], ['brust'], { view: 'front', at: [128, 162], s: .6, rot: -90, noGround: true, armR: [40, 0], legR: [70, -140, .9, .9] }, () => ({ back: floorT() }));

// ---------- Sitzhaltungen ----------
yf('easyseat', [], ['ruecken_unten', 'bauch'], SEATX);
yf('lotus', ['gesaess', 'adduktoren'], ['waden'], { ...SEATX, legR: [95, -172, .9, .8] });
yf('halflotus', ['gesaess', 'adduktoren'], [], { ...SEATX, legR: [95, -172, .9, .8], legL: [100, -158, .9, .8] });
ys('thunderbolt', ['quadrizeps'], ['waden'], SEIZA);
ys('hero', ['quadrizeps'], [], { ...SEIZA, hip: [92, 172] });
ys('staff', ['beinbeuger'], ['ruecken_unten', 'bauch'], STAFF);
yf('accomplished', ['gesaess', 'adduktoren'], [], { ...SEATX, armR: [30, -30] });
ys('lion', [], ['trapez'], SEIZA, J => ({ front: lineA([J.sh[0] + 30, J.sh[1] - 22], [J.sh[0] + 52, J.sh[1] - 22]) }));

// ---------- Armbalancen ----------
ys('crow', ['bauch', 'schulter_vorne'], ['trizeps', 'unterarme'], CROW);
ys('sidecrow', ['bauch', 'schulter_vorne'], ['trizeps'], CROW, J => ({ front: turnA(J.hip[0], J.hip[1] - 26, 22) }));
yf('firefly', ['beinbeuger', 'adduktoren', 'bauch'], ['trizeps'], { view: 'front', at: [120, 243], s: .72, armR: [10, 0], legR: [100, 0] });
yf('eightangle', ['bauch'], ['trizeps', 'adduktoren'], { view: 'front', at: [120, 243], s: .72, lean: 30, armR: [10, 0], legR: [100, 0], legL: [-50, 0] });
yf('sideplank', ['bauch', 'schulter_seite'], ['abduktoren'], SPL);
yf('elephanttrunk', ['bauch', 'beinbeuger'], ['trizeps'], { view: 'front', at: [120, 243], s: .72, armR: [10, 0], legR: [100, 0], legL: [20, -10] });
ys('flyingpigeon', ['gesaess', 'bauch'], ['trizeps'], { hip: [98, 146], torso: 2, leg: [30, 180], foot: 180, leg2: [192, 192], foot2: 180, arm: { to: [150, 186], bend: -1 } });
ys('koundinya', ['bauch'], ['trizeps'], { ...CROW, leg: [10, 10], foot: 0, leg2: [190, 190], foot2: 180 });
ys('peacock', ['unterarme', 'bauch'], ['trizeps', 'ruecken_unten'], { hip: [96, 140], torso: 0, leg: [182, 182], foot: 180, arm: hd(146, 186, -1) });

// ---------- Umkehrhaltungen ----------
ys('downdog', ['beinbeuger', 'waden', 'lat'], ['schulter_vorne'], DOG);
ys('threeleggeddog', ['beinbeuger', 'hueftbeuger'], ['lat'], { ...DOG, leg2: [-150, -150], foot2: -150 });
ys('dolphin', ['schulter_vorne', 'beinbeuger'], ['lat'], { hip: [110, 110], torso: 58, leg: { to: [70, 182], bend: 1 }, foot: 0, arm: [90, 0] });
ys('headstand', ['schulter_vorne', 'bauch'], ['trapez', 'ruecken_unten'], { hip: [120, 104], torso: 90, leg: [-90, -90], foot: -90, arm: [60, 180] });
ys('tripodheadstand', ['schulter_vorne', 'bauch'], ['trizeps'], { hip: [120, 104], torso: 90, leg: [-90, -90], foot: -90, arm: [40, 90] });
ys('shoulderstand', ['trapez'], ['bauch', 'schulter_vorne'], SHST);
ys('plough', ['beinbeuger', 'ruecken_unten', 'trapez'], [], { ...SHST, leg: [155, 155], foot: 180 });
ys('forearmstand', ['schulter_vorne', 'bauch'], ['trizeps', 'ruecken_unten'], { hip: [120, 104], torso: 90, leg: [-90, -90], foot: -90, arm: [90, 0] });
ys('handstand', ['schulter_vorne'], ['trizeps', 'bauch'], { hip: [120, 66], torso: 90, leg: [-90, -90], foot: -90, arm: [94, 94], zoom: .8 });
ys('scorpion', ['brust', 'bauch', 'hueftbeuger'], ['schulter_vorne'], { hip: [130, 100], torso: 100, curl: -40, leg: [-70, 200], foot: 180, arm: [90, 0] });

// ---------- Rumpf ----------
ys('plank', ['bauch'], ['schulter_vorne', 'quadrizeps'], PLANK);
ys('forearmplank', ['bauch'], ['schulter_vorne'], { hip: [108, 162], torso: -8, leg: [170, 172], foot: 95, arm: [90, 0] });
ys('chaturanga', ['trizeps', 'brust'], ['bauch', 'schulter_vorne'], { hip: [106, 164], torso: -6, leg: [172, 172], foot: 100, arm: hd(152, 186, -1) });
ys('boat', ['bauch', 'hueftbeuger'], [], { hip: [110, 176], torso: -124, leg: [-46, -46], foot: -40, arm: [0, 0] });
ys('halfboat', ['bauch', 'hueftbeuger'], [], { hip: [110, 176], torso: -124, leg: [-46, 2], foot: 0, arm: [0, 0] });
ys('dolphinplank', ['bauch', 'schulter_vorne'], [], { hip: [108, 162], torso: -8, leg: [170, 172], foot: 95, arm: [90, 0] });
yf('forearmsideplank', ['bauch', 'abduktoren'], ['schulter_seite'], { ...SPL, at: [116, 222], rot: -72, armL: [18, 0, 1, .25], armR: [108, 0] });
ys('kneetonose', ['bauch'], ['schulter_vorne', 'hueftbeuger'], { ...PLANK, leg: [40, 150], foot: 100, leg2: [155.7, 155.7] });

// ---------- Boden und Entspannung ----------
yr('child', 'childpose');
ys('savasana', [], [], SAVA);
ys('recliningthero', ['quadrizeps', 'hueftbeuger'], ['bauch'], { hip: [118, 174], ...SUPN, torso: 204, leg: [4, 180], foot: 180, arm: [90, 180], zoom: 1.25, zoomAt: [118, 186] });
yr('supinebigtoe', 'strapham');
ys('kneestochest', ['ruecken_unten', 'gesaess'], [], { hip: [134, 177], ...SUPN, leg: [-112, -10], foot: -10, arm: { to: [148, 136], bend: -1 } });
ys('windrelieving', ['gesaess', 'ruecken_unten'], ['hueftbeuger'], { hip: [134, 177], ...SUPN, leg: [-112, -10], foot: -10, leg2: [0, 0], foot2: -70, arm: { to: [148, 136], bend: -1 } });
ys('crocodile', [], ['ruecken_unten'], { ...PRONE, arm: { to: [166, 176], bend: -1 } });
ys('onelegbridge', ['gesaess'], ['beinbeuger'], { hip: [136, 152], torso: 152, farOff: [-2, -3], leg: ft(168), leg2: [-60, -60], foot2: -60, arm: hd(126, 186, -1) });

// ---------- Yin ----------
ys('caterpillar', ['ruecken_unten', 'beinbeuger'], [], { ...STAFF, torso: -58, curl: 42, leg: [-6, 6], arm: hd(150, 172, 1), zoom: 1.3, zoomAt: [120, 186] });
yf('yinbutterfly', ['adduktoren', 'ruecken_unten'], [], { view: 'front', at: [120, 246], s: .7, headTilt: 0, armR: [14, -20], legR: [105, -150, .9, .8] });
ys('halfbutterfly', ['beinbeuger'], ['ruecken_unten'], { ...STAFF, torso: -58, curl: 42, leg: [-4, 4], leg2: [10, 176], foot2: 180, arm: hd(152, 172, 1), zoom: 1.3, zoomAt: [120, 186] });
ys('dragon', ['hueftbeuger'], ['adduktoren'], { hip: [104, 150], torso: -50, leg: ft(160), leg2: [125, 180], foot2: 180, arm: hd(150, 186, 1) });
ys('swan', ['gesaess', 'hueftbeuger'], [], { hip: [100, 168], torso: -94, leg: [178, 180], foot: 180, leg2: [12, 160], foot2: 90, arm: hd(126, 186, 1) });
SCY.saddle = { ...SCY.recliningthero, n: 'saddle', ex: ['saddle'] };
yf('shoelace', ['gesaess', 'abduktoren'], [], { ...SEATX, armR: [20, -30], legR: [-10, -150, .5, .9], legL: [60, -120, .6, .9] });
ys('seal', ['bauch', 'ruecken_unten'], [], { ...PRONE, torso: -40, arm: hd(150, 186, 1) });
SCY.dragonfly = { ...SCY.wideseatedfold, n: 'dragonfly', ex: ['dragonfly'] };
yf('banana', ['lat', 'abduktoren'], ['bauch'], { view: 'front', at: [128, 162], s: .6, rot: -90, noGround: true, lean: -18, armR: [170, 0], legR: [-14, 0], legL: [14, 0] }, () => ({ back: floorT() }));
ys('legsupwall', ['beinbeuger'], [], { hip: [150, 177], ...SUPN, leg: [-90, -90], foot: -180, arm: [4, 4] }, () => ({ back: wall(160) }));
ys('supportedbridge', ['hueftbeuger', 'ruecken_unten'], [], { hip: [136, 160], torso: 162, farOff: [-2, -3], leg: ft(170), arm: [10, 10] }, J => ({ back: rect(J.hip[0] - 12, J.hip[1] + 6, 24, 190 - J.hip[1] - 6, 'pad', 2) }));
ys('toesquat', ['waden'], [], { ...SEIZA, hip: [92, 160], foot: 120 });
ys('supportedchild', ['ruecken_unten', 'lat'], [], { hip: [80, 166], torso: -6, curl: 10, leg: [22, 180], foot: 180, arm: hd(180, 184, 1), zoom: 1.35, zoomAt: [120, 188] }, () => ({ back: rect(96, 168, 70, 18, 'eq3', 9) }));

// ---------- Atmung ----------
yf('nadishodhana', [], ['brust'], { ...SEATX, armR: [26, -170] });
yf('ujjayi', [], ['brust', 'bauch'], SEATX, breath);
yf('kapalabhati', ['bauch'], [], SEATX, J => ({ front: lineA([J.hip[0] + 44, J.hip[1] - 24], [J.hip[0] + 24, J.hip[1] - 24]) }));
yf('bhastrika', ['bauch'], ['brust'], { ...SEATX, armR: [170, 0] }, breath);
yf('bhramari', [], ['brust'], { ...SEATX, armR: [100, -150] });
yf('dirgha', ['bauch', 'brust'], [], { ...SEATX, armR: [20, -130], armL: [14, -100] }, breath);
yf('boxbreath', [], ['brust', 'bauch'], SEATX, J => { const x = J.hip[0] + 50, y = J.hip[1] - 80, d = 24;
  return { front: lineA([x, y + d], [x, y]) + lineA([x, y], [x + d, y]) + lineA([x + d, y], [x + d, y + d]) + lineA([x + d, y + d], [x, y + d]) }; });
yf('sitali', [], ['brust'], SEATX, breath);
yf('meditation', [], [], SEATX);
ys('bodyscan', [], [], SAVA, J => ({ front: lineA([J.sh[0] - 30, 150], [J.ankle[0] + 10, 150]) + `<circle cx="${f1(J.sh[0] - 22)}" cy="150" r="3" class="mvh"/>` }));

// ===== Schnittstelle für die App =====
const BYNAME = new Map();
SC.forEach(sc => sc.ex.forEach(n => BYNAME.set(String(n).trim().toLowerCase(), sc)));
let N = 0;
window.exFigHas = name => BYNAME.has(String(name || '').trim().toLowerCase());
// mus = { primary:Set, secondary:Set } aus der Muskelkarte (gleiche Farben wie dort) oder null = Muskeln der Szene
window.exFigSvg = (name, mus, label = '') => {
  const sc = BYNAME.get(String(name || '').trim().toLowerCase());
  if (!sc) return '';
  const s2 = mus ? { ...sc, p: [...mus.primary], s: [...mus.secondary] } : sc;
  let svg;
  try { svg = sceneSvg(s2); } catch (e) { return ''; }
  if (sc.pose && sc.pose.noGround) svg = svg.replace(/<line x1="6" y1="190"[^>]*\/>/, '');
  const id = 'xf' + (++N);
  return svg.replace(/(#|id=")t(lo|up|nk)\b/g, `$1${id}$2`)
    .replace('<svg ', `<svg class="xfig" role="img" aria-label="${String(label).replace(/"/g, '&quot;')}" `);
};
// v396: Mobility (SCM, Schlüssel = MOB_EX.id) und Yoga (SCY, Schlüssel = YOGA_POSES.id): Bild + Bereiche für die Legende
const sceneOut = (sc, label) => {
  let svg;
  try { svg = sceneSvg(sc); } catch (e) { return null; }
  if (sc.pose && sc.pose.noGround) svg = svg.replace(/<line x1="6" y1="190"[^>]*\/>/, '');
  const id = 'xf' + (++N);
  svg = svg.replace(/(#|id=")t(lo|up|nk)\b/g, `$1${id}$2`).replace('<svg ', `<svg class="xfig" role="img" aria-label="${String(label).replace(/"/g, '&quot;')}" `);
  return { svg, p: sc.p || [], s: sc.s || [], arrows: svg.includes('class="mv"') };
};
window.exFigMob = (id, label = '') => SCM[id] ? sceneOut(SCM[id], label) : null;
window.exFigYoga = (id, label = '') => SCY[id] ? sceneOut(SCY[id], label) : null;
})();
