/* LockYourGains | © 2026 Alexander Hundt | Alle Rechte vorbehalten – siehe LICENSE */
/* ---------- Mobility (v355, User-Wunsch 2026-11-23) ----------
   Bibliothek mit Mobility-Übungen (MOB_EX, nach Körperregion) zum Aufwärmen vor dem Krafttraining.
   Plan: plan.mob = Stufe 0–3 (v358, User-Wunsch: Regler statt ja/nein; Frage im Plan-Assistenten, im Plan je Trainingstag änderbar):
   0 = nur selbst hinzugefügt, 1/2/3 = die App schlägt je Trainingstag 2/4/6 passende Übungen vor. Ältere Pläne: 'auto' = 2, 'self'/fehlt = 0. Trainingstag: day.mob = [{ id, sets }]. Fehlt day.mob bei 'auto', gilt der Vorschlag (mobSuggest,
   passt sich an geänderte Übungen an); erst beim Ändern wird die Liste fest im Tag gespeichert.
   Zeit (User): MOB_MIN Minute je Satz, zählt zur geschätzten Dauer; bei „Wenig Zeit?“ fällt Mobility zuerst weg (mobFit).
   Training: draft.mob = [{ id, sets, done }], abhakbarer Block oben; gespeichert als session.mob = [{ id, done }].
   Daten: scratchpad mob_*.json → build_mob.py (Block zwischen // <<MOBILITY und // MOBILITY>>, EN nach add355_mob.json). */
const MOB_MIN = 1;
const MOB_REGIONS = [['full', 'Ganzkörper'], ['ankle', 'Sprunggelenk und Fuß'], ['knee', 'Knie'], ['hip', 'Hüfte'], ['spine', 'Wirbelsäule und Rumpf'],
  ['tspine', 'Brustwirbelsäule'], ['shoulder', 'Schulter'], ['arm', 'Ellbogen und Handgelenk'], ['neck', 'Nacken']];
const MOB_TYPES = { dyn: 'Dynamisch', hold: 'Halten', act: 'Aktivierung' };
const MOB_EQ = { band: 'Band', stick: 'Stab', roll: 'Faszienrolle', wall: 'Wand', bench: 'Bank', bar: 'Klimmzugstange', weight: 'leichtes Gewicht' };
/* v375 (User-Wunsch 2026-11-24): Welche Hilfsmittel hast du? data.mobEq = [Schlüssel] (null = noch nie gefragt: nur ohne Gerät oder Wand).
   Gilt für den Vorschlag vor dem Training und für die Mobility-Einheit. Wand und Türrahmen gehen immer. */
const MOB_EQ_ASK = [['band', 'Widerstandsband oder Miniband'], ['stick', 'Stab oder Besenstiel'], ['roll', 'Faszienrolle'], ['bench', 'Bank'],
  ['bar', 'Klimmzugstange'], ['weight', 'Leichtes Gewicht']];
const mobEqSet = () => Array.isArray(data.mobEq) ? data.mobEq : null;
const mobEqOk = (m, eq) => !m.eq || m.eq === 'wall' || (eq || []).includes(m.eq);
// Vorauswahl: im Studio ist meist alles da, zu Hause das, was im Plan unter „Ausrüstung“ steht
function mobEqDefault(equip = (activePlan() || {}).equip) {
  if (equip !== 'home') return MOB_EQ_ASK.map(([k]) => k);
  const h = data.home || {}, out = [];
  if ((h.bands || []).length) out.push('band');
  if (h.bar) out.push('bar');
  if (h.bench) out.push('bench');
  if ((h.db || []).length || (h.kb || []).length) out.push('weight');
  return out;
}
const mobEqText = eq => eq && eq.length ? MOB_EQ_ASK.filter(([k]) => eq.includes(k)).map(([, l]) => l).join(', ') : 'keine';
const mobEqChips = (eq, act) => `<div class="variants mob-eq">${MOB_EQ_ASK.map(([k, l]) =>
    `<button class="vchip ${eq.includes(k) ? 'on' : ''}" data-action="${act}" data-k="${k}" aria-pressed="${eq.includes(k)}">${l}</button>`).join('')}</div>
  <p class="hint nut-small">Wand und Türrahmen gehen immer.</p>`;
/* v376 (User-Wunsch 2026-11-24): Gefällt mir / Nicht vorschlagen. data.mobPref = { id: 1 | -1 }.
   -1: wird nie vorgeschlagen (vor dem Training, Einheit, Tauschen), selbst auswählen geht weiter. 1: bevorzugt (MOB_LIKE_W). */
const MOB_LIKE_W = 1.5;
const mobPref = id => (data.mobPref && data.mobPref[id]) || 0;
const mobSugOk = m => mobPref(m.id) >= 0;
const mobPrefMark = id => mobPref(id) > 0 ? ' <span class="mob-pref-mark" aria-label="Gefällt mir">👍</span>' : mobPref(id) < 0 ? ' <span class="mob-pref-mark" aria-label="Nicht nochmal vorschlagen">👎</span>' : '';
const mobEqToggle = (list, k) => { const i = list.indexOf(k); if (i >= 0) list.splice(i, 1); else list.push(k); return list; };
let mobEqOpen = false;  // Auswahl der Hilfsmittel aufgeklappt (Plan, Einheit)
// Kurzfassung mit „Ändern“ (Mobility-Karte im Plan und Mobility-Einheit)
function mobEqLineHtml() {
  const eq = mobEqSet(), open = mobEqOpen || !eq;
  return `<div class="mob-eq-box"><div class="mob-eq-line"><span><span class="lbl">Hilfsmittel</span>
      <small class="hint">${eq ? esc(mobEqText(eq)) : 'Noch nicht ausgewählt. Bis dahin schlägt die App nur Übungen ohne Gerät vor.'}</small></span>
      ${eq ? `<button class="btn small" data-action="mob-eq-open" aria-expanded="${open}">${open ? 'Fertig' : 'Ändern'}</button>` : ''}</div>
    ${open ? `<p class="hint nut-small">Was hast du für Mobility zur Verfügung? Die App nutzt dann auch Übungen mit diesen Hilfsmitteln.</p>${mobEqChips(eq || [], 'mob-eq')}` : ''}</div>`;
}
// <<MOBILITY
const MOB_EX = [
  {"id": "worldsgreatest", "reg": "full", "de": "World's Greatest Stretch", "type": "dyn", "eq": "", "u": "r", "n": 5, "side": true, "pre": ["quadrizeps", "gesaess", "beinbeuger", "adduktoren", "ruecken_unten", "brust", "lat"], "good": "Öffnet Hüftbeuger, Leiste, Beinrückseite und Brustwirbelsäule in einem einzigen Ablauf und bringt den ganzen Körper auf Temperatur. Ideal, wenn wenig Zeit ist.", "use": "Kniebeugen, Kreuzheben, Ausfallschritte, Ganzkörpertraining", "s": ["Aus dem Stand einen großen Ausfallschritt nach vorn machen, das hintere Bein bleibt lang.", "Die Hand auf der Seite des vorderen Beins innen neben den Fuß setzen und den anderen Ellbogen Richtung Knöchel absenken.", "Den Arm auf der Seite des vorderen Beins zur Decke aufdrehen, der Blick folgt der Hand.", "Beide Hände neben den vorderen Fuß setzen, die Hüfte nach hinten schieben und das vordere Bein strecken.", "Zurück in den Stand kommen und die Seite wechseln."], "f": ["Das hintere Knie sackt ab, dadurch bleibt der Hüftbeuger ungedehnt.", "Nur der Arm dreht auf, der Brustkorb bleibt nach unten gerichtet.", "Zu schnell durch die Positionen hetzen."], "l": "Das hintere Knie ablegen und den Ellbogen nur bis zur Höhe des Knies senken.", "h": "Jede Position 2 Sekunden halten und am Ende eine tiefe Hocke anhängen.", "v": "Bei Leistenschmerzen den Schritt kürzer machen."},
  {"id": "inchworm", "reg": "full", "de": "Inchworm (Raupe)", "type": "dyn", "eq": "", "u": "r", "n": 6, "side": false, "pre": ["beinbeuger", "schulter_vorne", "bauch", "brust", "trizeps"], "good": "Dehnt die Beinrückseite und aktiviert gleichzeitig Schultern, Arme und Rumpf. Bringt den Puls etwas hoch.", "use": "Kreuzheben, Bankdrücken, Schulterdrücken, Liegestütze", "s": ["Aufrecht stehen, mit möglichst gestreckten Beinen nach vorn beugen und die Hände vor den Füßen aufsetzen.", "Mit den Händen Schritt für Schritt nach vorn laufen, bis du in der Liegestützposition bist.", "Kurz halten, Rumpf fest, Hüfte nicht durchhängen lassen.", "Mit den Füßen in kleinen Schritten zu den Händen laufen und wieder aufrichten."], "f": ["Hohlkreuz in der Liegestützposition.", "Die Knie stark beugen, dann fehlt die Dehnung hinten am Bein.", "Mit großen Sprüngen statt kleiner Schritte gehen."], "l": "Die Knie so weit beugen, wie nötig, damit die Hände den Boden erreichen.", "h": "In der Liegestützposition einen Liegestütz einbauen.", "v": "Bei Rückenschmerzen beim Vorbeugen die Knie beugen und den Rücken lang halten."},
  {"id": "squattostand", "reg": "full", "de": "Tiefe Hocke zum Stand", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": false, "pre": ["quadrizeps", "beinbeuger", "gesaess", "adduktoren", "waden"], "good": "Mobilisiert Hüfte, Sprunggelenke und Beinrückseite gleichzeitig und übt die tiefe Hocke, die du für saubere Kniebeugen brauchst.", "use": "Kniebeugen, Beinpresse, Kreuzheben", "s": ["Hüftbreit stehen, nach vorn beugen und die Zehenspitzen greifen. Die Knie dürfen dafür leicht gebeugt sein.", "Die Hüfte absenken, bis du in einer tiefen Hocke sitzt, die Hände halten weiter die Zehen.", "Brust heben, Ellbogen drücken die Knie leicht nach außen.", "Die Hüfte wieder anheben und die Beine strecken, die Hände bleiben an den Zehen."], "f": ["Die Fersen heben sich in der Hocke vom Boden.", "Der Rücken bleibt in der Hocke rund statt sich aufzurichten.", "Zu schnell, ohne kurz unten zu bleiben."], "l": "Die Fersen auf eine flache Unterlage stellen oder die Hände an den Schienbeinen statt an den Zehen halten.", "h": "Unten abwechselnd einen Arm zur Decke heben und den Oberkörper aufdrehen.", "v": ""},
  {"id": "bearcrawl", "reg": "full", "de": "Bärengang", "type": "act", "eq": "", "u": "s", "n": 30, "side": false, "pre": ["schulter_vorne", "bauch", "quadrizeps", "trizeps", "brust"], "good": "Aktiviert Schultern, Rumpf und Beine zusammen, stabilisiert die Schulterblätter und macht warm.", "use": "Bankdrücken, Schulterdrücken, Kniebeugen, Ganzkörpertraining", "s": ["Im Vierfüßlerstand beginnen, Hände unter den Schultern, Knie unter der Hüfte.", "Die Knie eine Handbreit vom Boden abheben, der Rücken bleibt flach wie ein Tisch.", "Mit diagonal gegenüberliegender Hand und Fuß gleichzeitig kleine Schritte nach vorn machen.", "Einige Schritte vor und wieder zurück gehen, ruhig weiteratmen."], "f": ["Die Hüfte schießt nach oben.", "Zu große Schritte, dabei wackelt das Becken stark.", "Luft anhalten."], "l": "Auf der Stelle bleiben und nur abwechselnd Hand und Fuß kurz abheben.", "h": "Seitwärts und rückwärts gehen oder das Tempo verlangsamen.", "v": "Bei Handgelenkbeschwerden auf den Fäusten abstützen."},
  {"id": "ohsquatstick", "reg": "full", "de": "Kniebeuge mit Stab über Kopf", "type": "dyn", "eq": "stick", "u": "r", "n": 8, "side": false, "pre": ["quadrizeps", "gesaess", "schulter_vorne", "trapez", "adduktoren", "waden"], "good": "Zeigt und verbessert in einer Bewegung, wie beweglich Sprunggelenke, Hüfte, Brustwirbelsäule und Schultern zusammenarbeiten.", "use": "Kniebeugen, Schulterdrücken, Reißen und Stoßen", "s": ["Einen Stab oder Besenstiel weit gegriffen über den Kopf halten, Arme gestreckt.", "Schulterbreit oder etwas weiter stehen, Fußspitzen leicht nach außen.", "Langsam in die Kniebeuge gehen, der Stab bleibt über der Mitte der Füße.", "So tief gehen, wie es mit aufrechtem Oberkörper geht, und wieder hochdrücken."], "f": ["Die Arme fallen nach vorn.", "Die Knie fallen nach innen.", "Die Fersen heben sich."], "l": "Die Arme weiter greifen oder nur bis zur halben Tiefe gehen.", "h": "Unten 3 Sekunden halten und die Brust aktiv heben.", "v": "Bei Schulterschmerzen die Arme nicht über den Kopf, sondern nach vorn halten."},
  {"id": "lungetwist", "reg": "full", "de": "Ausfallschritt mit Rotation", "type": "dyn", "eq": "", "u": "r", "n": 5, "side": true, "pre": ["quadrizeps", "gesaess", "bauch", "adduktoren"], "good": "Wärmt Beine und Hüfte auf und dreht dabei die Brustwirbelsäule. Schult das Gleichgewicht.", "use": "Kniebeugen, Ausfallschritte, Beinpresse", "s": ["Aufrecht stehen, Arme vor der Brust verschränken oder gestreckt nach vorn halten.", "Einen großen Schritt nach vorn machen und in den Ausfallschritt absenken.", "Unten den Oberkörper zur Seite des vorderen Beins drehen, die Hüfte bleibt gerade.", "Zurückdrehen, aufstehen und die Seite wechseln."], "f": ["Das vordere Knie kippt nach innen.", "Die Hüfte dreht mit statt nur der Oberkörper."], "l": "Kleinere Schritte und nur halb so tief absenken.", "h": "Im Gehen nach vorn ausführen oder eine leichte Hantelscheibe vor der Brust halten.", "v": "Bei Knieschmerzen nur so tief gehen, wie es schmerzfrei ist."},
  {"id": "planktodog", "reg": "full", "de": "Liegestützposition zum herabschauenden Hund", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": false, "pre": ["schulter_vorne", "beinbeuger", "waden", "brust", "lat", "bauch"], "good": "Wechselt zwischen Stütz und Dehnung: aktiviert Schultern und Rumpf, dehnt Waden, Beinrückseite und Lat.", "use": "Bankdrücken, Schulterdrücken, Klimmzüge, Kreuzheben", "s": ["In der hohen Liegestützposition beginnen, Hände unter den Schultern.", "Die Hüfte nach oben und hinten schieben, bis der Körper ein umgedrehtes V bildet.", "Die Fersen Richtung Boden drücken und die Brust Richtung Oberschenkel schieben.", "Fließend zurück in die Liegestützposition kommen."], "f": ["Im Hund einen runden Rücken machen.", "In der Liegestützposition durchhängen."], "l": "Im Hund die Knie leicht beugen.", "h": "Im Hund abwechselnd ein Bein zur Decke heben.", "v": "Bei Handgelenkbeschwerden auf den Unterarmen ausführen."},
  {"id": "crabreach", "reg": "full", "de": "Krabbe mit Armgriff", "type": "dyn", "eq": "", "u": "r", "n": 5, "side": true, "pre": ["brust", "schulter_vorne", "gesaess", "quadrizeps"], "good": "Öffnet Brust und vordere Schulter, streckt die Hüfte und mobilisiert die Brustwirbelsäule. Guter Ausgleich zu viel Sitzen.", "use": "Bankdrücken, Schulterdrücken, Hip Thrust", "s": ["Sitzen, Füße aufgestellt, die Hände hinter dem Po aufsetzen, Finger zeigen nach hinten.", "Die Hüfte anheben und gleichzeitig einen Arm über den Kopf nach hinten zur Seite greifen.", "Kurz oben bleiben, Gesäß anspannen und die Brust zur Decke drehen.", "Langsam absetzen und die Seite wechseln."], "f": ["Die Hüfte bleibt unten, dadurch öffnet sich die Vorderseite nicht.", "Mit Schwung statt kontrolliert hochkommen."], "l": "Nur die Hüfte heben, ohne den Arm über den Kopf zu führen.", "h": "Das gegenüberliegende Bein gleichzeitig nach vorn strecken.", "v": "Bei Schulterbeschwerden den Arm nur so weit führen, wie es schmerzfrei geht."},
  {"id": "kneetowall", "reg": "ankle", "de": "Knie zur Wand", "type": "dyn", "eq": "wall", "u": "r", "n": 10, "side": true, "pre": ["quadrizeps", "waden", "gesaess", "adduktoren"], "good": "Verbessert die Beugung im Sprunggelenk. So können die Knie bei der Kniebeuge weiter nach vorn, die Fersen bleiben am Boden und der Oberkörper aufrecht.", "use": "Kniebeugen, Ausfallschritte, Beinpresse, Hackenschmidt", "s": ["Mit dem Gesicht zur Wand stehen, ein Fuß etwa eine Handbreit vor der Wand.", "Das Knie über die Fußmitte Richtung Wand schieben, die Ferse bleibt fest am Boden.", "Kurz an der Wand antippen oder so weit wie möglich nach vorn gehen und wieder zurück.", "Wird es leicht, den Fuß ein Stück weiter weg von der Wand stellen."], "f": ["Die Ferse hebt sich ab.", "Das Knie fällt nach innen statt über die Fußmitte zu gehen.", "Der Fuß knickt nach innen ein."], "l": "Den Fuß näher an die Wand stellen.", "h": "Unten 2 Sekunden halten oder ein leichtes Gewicht auf das Knie legen.", "v": ""},
  {"id": "anklecircles", "reg": "ankle", "de": "Fußkreisen", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": true, "pre": ["waden", "quadrizeps"], "good": "Bewegt das Sprunggelenk in alle Richtungen und bereitet Bänder und Sehnen auf Belastung vor. Gut nach langem Sitzen.", "use": "Kniebeugen, Wadenheben, Laufen, Sprünge", "s": ["Auf einem Bein stehen und dich bei Bedarf festhalten, oder sitzen.", "Den freien Fuß anheben und mit den Zehen langsam große Kreise malen.", "Die Bewegung kommt aus dem Sprunggelenk, das Bein bleibt ruhig.", "Nach der Hälfte der Wiederholungen die Richtung wechseln."], "f": ["Kleine, hektische Kreise.", "Das ganze Bein kreist mit."], "l": "Im Sitzen ausführen.", "h": "Ohne Festhalten auf einem Bein stehen.", "v": ""},
  {"id": "slowcalfraise", "reg": "ankle", "de": "Langsames Wadenheben mit Pause", "type": "act", "eq": "", "u": "r", "n": 12, "side": false, "pre": ["waden", "quadrizeps"], "good": "Aktiviert Waden und Fußgewölbe und bewegt das Sprunggelenk durch den ganzen Bereich. Gibt einen stabilen Stand für Übungen im Stehen.", "use": "Wadenheben, Kniebeugen, Ausfallschritte", "s": ["Hüftbreit stehen, bei Bedarf leicht an der Wand festhalten.", "Langsam auf die Zehenballen hochdrücken, das Gewicht liegt über dem großen Zeh.", "Oben 2 Sekunden halten.", "Langsam wieder absenken, bis die Fersen den Boden berühren."], "f": ["Mit Schwung hochfedern.", "Das Gewicht rollt auf die Außenkante der Füße."], "l": "Nur halb so hoch gehen.", "h": "Auf einer Stufe stehen, damit die Fersen unter die Stufe sinken können, oder einbeinig ausführen.", "v": ""},
  {"id": "bandankle", "reg": "ankle", "de": "Sprunggelenk mit Band mobilisieren", "type": "dyn", "eq": "band", "u": "r", "n": 10, "side": true, "pre": ["quadrizeps", "waden"], "good": "Das Band zieht den Fuß im Gelenk etwas nach hinten. So lässt sich das Sprunggelenk oft deutlich freier beugen als ohne, besonders wenn es vorn im Gelenk eng wird.", "use": "Kniebeugen, Ausfallschritte, Beinpresse", "s": ["Ein Widerstandsband tief an einem festen Gegenstand befestigen.", "In den Halbkniestand gehen und das Band vorn über das Sprunggelenk des vorderen Fußes legen, es zieht nach hinten.", "Das vordere Knie langsam über die Fußmitte nach vorn schieben, die Ferse bleibt unten.", "Kurz halten und zurück."], "f": ["Das Band liegt zu hoch auf dem Schienbein.", "Die Ferse hebt ab."], "l": "Ein leichteres Band nehmen.", "h": "Unten 2 Sekunden halten und das Knie leicht nach links und rechts lenken.", "v": "Bei Schmerzen vorn im Gelenk die Übung abbrechen."},
  {"id": "heeltoewalk", "reg": "ankle", "de": "Fersen- und Zehengang", "type": "act", "eq": "", "u": "s", "n": 30, "side": false, "pre": ["waden", "quadrizeps"], "good": "Weckt Schienbein- und Wadenmuskulatur und die kleinen Fußmuskeln auf. Verbessert das Gefühl für den Fuß und den Stand.", "use": "Kniebeugen, Kreuzheben, Ausfallschritte, Laufen", "s": ["Die Hälfte der Zeit auf den Zehenballen gehen, Fersen hoch.", "Die andere Hälfte auf den Fersen gehen, Zehen hoch.", "Aufrecht bleiben und kleine, ruhige Schritte machen."], "f": ["Im Fersengang mit dem Oberkörper nach hinten kippen.", "Die Fersen sinken im Zehengang ab."], "l": "Kürzere Strecken und zwischendurch normal gehen.", "h": "Auf der Stelle mit geschlossenen Augen ausführen.", "v": ""},
  {"id": "toeyoga", "reg": "ankle", "de": "Zehen spreizen und heben", "type": "act", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["waden", "quadrizeps", "gesaess"], "good": "Aktiviert das Fußgewölbe. Ein stabiler Fuß sorgt bei Kniebeugen und Kreuzheben für festen Stand und hilft, dass die Knie nicht nach innen fallen.", "use": "Kniebeugen, Kreuzheben, Ausfallschritte", "s": ["Barfuß stehen oder sitzen, Füße flach am Boden.", "Nur die großen Zehen anheben, die anderen bleiben unten.", "Dann die großen Zehen ablegen und die anderen vier anheben.", "Zum Schluss alle Zehen anheben, weit spreizen und einzeln wieder ablegen."], "f": ["Der ganze Fuß rollt nach außen.", "Mit Kraft verkrampfen statt locker anzusteuern."], "l": "Im Sitzen und mit den Fingern etwas nachhelfen.", "h": "Im Einbeinstand ausführen.", "v": ""},
  {"id": "shinstretch", "reg": "ankle", "de": "Fersensitz mit Fußrücken-Dehnung", "type": "hold", "eq": "", "u": "s", "n": 30, "side": false, "pre": ["quadrizeps", "waden"], "good": "Dehnt Fußrücken und Schienbeinmuskulatur, die bei Kniebeugen und beim Laufen oft fest sind. Auch angenehm nach dem Training.", "use": "Kniebeugen, Ausfallschritte, Laufen", "s": ["Im Kniestand beginnen, die Fußrücken liegen flach am Boden.", "Langsam mit dem Po auf die Fersen setzen.", "Wer mehr will, lehnt sich mit den Händen hinter dem Körper leicht zurück und hebt die Knie etwas an.", "Ruhig atmen und die Spannung im Fußrücken halten."], "f": ["Mit Gewalt nach hinten lehnen.", "Die Füße kippen nach außen."], "l": "Ein gefaltetes Handtuch unter die Fußgelenke legen.", "h": "Die Knie mit den Händen hinter dem Körper ein Stück vom Boden abheben.", "v": "Bei Kniebeschwerden ein Kissen zwischen Po und Fersen legen."},
  {"id": "ankleRock", "reg": "ankle", "de": "Tiefe Hocke mit Gewicht nach vorn", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": true, "pre": ["quadrizeps", "waden", "adduktoren", "gesaess"], "good": "Mobilisiert das Sprunggelenk genau in der Position, die du in der tiefen Kniebeuge brauchst, und lockert dabei Hüfte und Leiste.", "use": "Kniebeugen, Frontkniebeugen, Beinpresse", "s": ["In eine tiefe Hocke gehen, Füße etwas breiter als hüftbreit, Hände vor dem Körper.", "Das Gewicht über ein Knie nach vorn verlagern, die Ferse bleibt am Boden.", "Kurz halten und das Gewicht zum anderen Knie verlagern.", "Die Brust bleibt dabei aufrecht."], "f": ["Die Ferse hebt sich.", "Der Rücken rundet stark."], "l": "Mit den Händen an einem Pfosten oder Türrahmen festhalten oder die Fersen unterlegen.", "h": "Einen Ellbogen innen gegen das Knie drücken und das Knie aktiv nach vorn schieben.", "v": "Bei Knieschmerzen in tiefer Beugung eine höhere Position wählen."},
  {"id": "dogpedal", "reg": "ankle", "de": "Herabschauender Hund mit Fersentreten", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": true, "pre": ["waden", "beinbeuger", "schulter_vorne"], "good": "Dehnt Waden und Achillessehne abwechselnd und lockert die Beinrückseite. Die Schultern werden gleich mit aktiviert.", "use": "Kniebeugen, Kreuzheben, Wadenheben, Laufen", "s": ["In den herabschauenden Hund gehen, Hände schulterbreit, Hüfte hoch.", "Ein Knie beugen und gleichzeitig die andere Ferse Richtung Boden drücken.", "Im Wechsel weitertreten, ruhig und mit kurzem Halten.", "Die Arme bleiben lang, der Rücken gerade."], "f": ["Hastiges Treten ohne Dehnung.", "Der Rücken wird rund."], "l": "Die Hände auf eine Bank oder einen Stuhl stützen.", "h": "Ein Bein ganz anheben und die Wade des Standbeins einzeln dehnen.", "v": "Bei Handgelenkbeschwerden auf den Unterarmen abstützen."},
  {"id": "wallcalf", "reg": "ankle", "de": "Wadendehnung an der Wand", "type": "hold", "eq": "wall", "u": "s", "n": 30, "side": true, "pre": ["waden"], "good": "Klassische Dehnung für die Wade. Vor dem Training kurz, nach dem Training gern länger, wenn die Waden fest sind.", "use": "Wadenheben, Laufen, Sprünge", "s": ["Mit beiden Händen an der Wand abstützen und einen Fuß weit nach hinten stellen.", "Die hintere Ferse fest in den Boden drücken, das Bein bleibt gestreckt.", "Die Hüfte langsam nach vorn schieben, bis die Wade zieht.", "Für den unteren Teil der Wade das hintere Knie leicht beugen."], "f": ["Die Ferse hebt ab.", "Der hintere Fuß dreht nach außen."], "l": "Den hinteren Fuß näher an die Wand stellen.", "h": "Mit dem Fußballen auf eine Stufe oder Scheibe stellen.", "v": ""},
  {"id": "tibraise", "reg": "ankle", "de": "Schienbeinheben an der Wand", "type": "act", "eq": "wall", "u": "r", "n": 15, "side": false, "pre": ["quadrizeps", "waden"], "good": "Kräftigt den vorderen Schienbeinmuskel. Er stabilisiert das Sprunggelenk und hilft gegen Schienbeinschmerzen beim Laufen und Springen.", "use": "Kniebeugen, Ausfallschritte, Laufen, Sprünge", "s": ["Mit dem Rücken an die Wand lehnen, die Füße etwa eine Fußlänge vor der Wand.", "Die Beine gestreckt lassen und die Fußspitzen so weit wie möglich anheben.", "Oben kurz halten und langsam wieder absenken, ohne ganz abzulegen."], "f": ["Mit Schwung arbeiten.", "Die Knie beugen sich."], "l": "Die Füße näher an die Wand stellen.", "h": "Die Füße weiter weg stellen oder einbeinig ausführen.", "v": ""},
  {"id": "calfroll", "reg": "ankle", "de": "Waden mit der Faszienrolle", "type": "dyn", "eq": "roll", "u": "s", "n": 45, "side": true, "pre": ["waden"], "good": "Lockert feste Waden und kann die Beweglichkeit im Sprunggelenk kurzfristig verbessern. Gut vor Kniebeugen, wenn die Waden spannen.", "use": "Kniebeugen, Wadenheben, Laufen", "s": ["Sitzen, die Rolle unter eine Wade legen und mit den Händen hinter dem Körper abstützen.", "Den Po anheben und die Wade langsam von der Ferse bis unter das Knie rollen.", "An festen Stellen kurz bleiben und den Fuß kreisen lassen.", "Die Rolle nicht direkt in die Kniekehle führen."], "f": ["Zu schnell hin und her rollen.", "In die Kniekehle oder auf die Achillessehne rollen."], "l": "Den Po am Boden lassen.", "h": "Das andere Bein auf die gerollte Wade legen.", "v": "Bei Krampfadern oder Venenproblemen nicht über die Wade rollen."},
  {"id": "spanishsquat", "reg": "knee", "de": "Spanische Kniebeuge mit Band", "type": "act", "eq": "band", "u": "r", "n": 10, "side": false, "pre": ["quadrizeps"], "good": "Aktiviert den vorderen Oberschenkel stark, ohne das Knie nach vorn zu schieben. Wird gern bei empfindlichen Knien und Patellasehnen-Beschwerden genutzt.", "use": "Kniebeugen, Beinpresse, Beinstrecker, Ausfallschritte", "s": ["Ein kräftiges Band um einen festen Pfosten legen und beide Beine von vorn in die Schlaufe stellen, das Band liegt in den Kniekehlen.", "Zurücklehnen, bis das Band gespannt ist, die Schienbeine bleiben senkrecht.", "Langsam absenken, als würdest du dich auf einen Stuhl setzen, der Oberkörper bleibt aufrecht.", "Bis knapp über die Waagerechte gehen und wieder hochdrücken."], "f": ["Die Knie wandern nach vorn statt in das Band zu drücken.", "Der Oberkörper kippt nach vorn."], "l": "Weniger tief gehen.", "h": "Unten 3 bis 5 Sekunden halten.", "v": "Bei akuten Knieschmerzen vorher ärztlich oder physiotherapeutisch abklären."},
  {"id": "tke", "reg": "knee", "de": "Knie strecken gegen das Band", "type": "act", "eq": "band", "u": "r", "n": 15, "side": true, "pre": ["quadrizeps"], "good": "Aktiviert den inneren Teil des vorderen Oberschenkels, der das Knie in der letzten Streckung stabilisiert. Sanft für das Kniegelenk.", "use": "Kniebeugen, Beinpresse, Beinstrecker", "s": ["Ein Band auf Kniehöhe an einem festen Gegenstand befestigen und mit dem Gesicht dazu stehen.", "Die Schlaufe in die Kniekehle eines Beins legen, das Band zieht das Knie nach vorn.", "Das Knie leicht beugen und dann gegen das Band ganz durchstrecken, den Oberschenkel fest anspannen.", "Kurz halten und kontrolliert nachgeben."], "f": ["Nur halb strecken.", "Mit der Hüfte nach hinten ausweichen."], "l": "Ein leichteres Band nehmen.", "h": "Oben 2 Sekunden halten.", "v": ""},
  {"id": "quadrock", "reg": "knee", "de": "Vierfüßler-Wippen zum Fersensitz", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["quadrizeps", "gesaess", "adduktoren", "ruecken_unten"], "good": "Bewegt Knie und Hüfte sanft in die tiefe Beugung. Gute erste Übung, um Knie und Hüfte für Kniebeugen vorzubereiten.", "use": "Kniebeugen, Beinpresse, Ausfallschritte", "s": ["Im Vierfüßlerstand beginnen, Knie etwas breiter als hüftbreit.", "Den Po langsam Richtung Fersen schieben, der Rücken bleibt gerade.", "So weit gehen, wie es ohne Runden des Rückens geht.", "Zurück nach vorn in den Vierfüßlerstand."], "f": ["Der untere Rücken rundet am Ende.", "Zu schnell hin und her wippen."], "l": "Nur einen kleinen Weg nach hinten gehen.", "h": "Die Knie weiter auseinander stellen, das dehnt zusätzlich die Leiste.", "v": "Bei Knieschmerzen ein Kissen unter die Knie legen."},
  {"id": "pausesquat", "reg": "knee", "de": "Kniebeuge ohne Gewicht mit Pause", "type": "act", "eq": "", "u": "r", "n": 8, "side": false, "pre": ["quadrizeps", "gesaess", "adduktoren"], "good": "Übt die Kniebeuge ohne Last und bringt Knie, Hüfte und Sprunggelenk in den ganzen Bewegungsumfang. Das Pausieren schult die Position unten.", "use": "Kniebeugen, Frontkniebeugen, Beinpresse, Hackenschmidt", "s": ["Schulterbreit stehen, Fußspitzen leicht nach außen, Arme nach vorn.", "Langsam in die Kniebeuge gehen, die Knie folgen den Fußspitzen.", "Unten 2 bis 3 Sekunden halten, Brust aufrecht, Fersen am Boden.", "Kraftvoll wieder hochdrücken."], "f": ["Die Knie fallen nach innen.", "Unten zusammensacken statt die Spannung zu halten."], "l": "Auf eine Bank absetzen und wieder aufstehen.", "h": "Unten 5 Sekunden halten oder einbeinig an einer Bank üben.", "v": ""},
  {"id": "reverselunge", "reg": "knee", "de": "Ausfallschritt rückwärts im Wechsel", "type": "dyn", "eq": "", "u": "r", "n": 6, "side": true, "pre": ["quadrizeps", "gesaess", "adduktoren"], "good": "Wärmt Oberschenkel und Gesäß auf und dehnt dabei den Hüftbeuger des hinteren Beins. Knieschonender als der Schritt nach vorn.", "use": "Kniebeugen, Ausfallschritte, Beinpresse, Bulgarische Split Squats", "s": ["Aufrecht stehen, Hände an der Hüfte.", "Einen großen Schritt nach hinten machen und das hintere Knie Richtung Boden senken.", "Das vordere Knie bleibt über dem Fuß, der Oberkörper aufrecht.", "Über das vordere Bein zurück in den Stand drücken und die Seite wechseln."], "f": ["Das vordere Knie kippt nach innen.", "Der Oberkörper fällt nach vorn."], "l": "Kleinere Schritte und nur halb so tief.", "h": "Unten die Arme über den Kopf strecken.", "v": ""},
  {"id": "wallsit", "reg": "knee", "de": "Wandsitzen", "type": "act", "eq": "wall", "u": "s", "n": 30, "side": false, "pre": ["quadrizeps", "gesaess"], "good": "Aktiviert die Oberschenkel ohne Bewegung im Gelenk. Kann bei empfindlichen Knien angenehm sein und dämpft oft Schmerzen vor der Belastung.", "use": "Kniebeugen, Beinpresse, Beinstrecker", "s": ["Mit dem Rücken an die Wand lehnen und die Füße etwa zwei Fußlängen vor die Wand stellen.", "An der Wand nach unten rutschen, bis die Knie etwa rechtwinklig gebeugt sind.", "Die Knie bleiben über den Füßen, der Rücken liegt an der Wand.", "Halten und ruhig weiteratmen."], "f": ["Die Knie schieben weit über die Fußspitzen.", "Mit den Händen auf den Oberschenkeln abstützen."], "l": "Weniger tief rutschen.", "h": "Tiefer gehen oder ein Bein leicht anheben.", "v": ""},
  {"id": "petersonstep", "reg": "knee", "de": "Peterson Step-up", "type": "act", "eq": "bench", "u": "r", "n": 10, "side": true, "pre": ["quadrizeps"], "good": "Gezielte Aktivierung für den inneren vorderen Oberschenkel mit Knie weit vorn. Stärkt die Knie für tiefe Kniebeugen und Ausfallschritte.", "use": "Kniebeugen, Ausfallschritte, Beinpresse", "s": ["Mit einem Fuß auf eine niedrige Stufe stellen, die Ferse dieses Fußes ist leicht angehoben.", "Das andere Bein hängt neben der Stufe.", "Das Standknie nach vorn über die Zehen schieben, bis die freie Ferse den Boden antippt.", "Über den Vorfuß des Standbeins wieder hochdrücken."], "f": ["Mit dem freien Bein abstoßen.", "Das Standknie fällt nach innen."], "l": "Eine niedrigere Stufe nehmen und an der Wand festhalten.", "h": "Eine höhere Stufe oder ein leichtes Gewicht nehmen.", "v": "Bei Schmerzen unter der Kniescheibe nur schmerzfrei üben."},
  {"id": "ninetyninety", "reg": "hip", "de": "90/90-Hüftrotation", "type": "dyn", "eq": "", "u": "r", "n": 6, "side": true, "pre": ["gesaess", "adduktoren", "abduktoren", "quadrizeps"], "good": "Trainiert Innen- und Außenrotation der Hüfte. Eine frei drehende Hüfte macht die Kniebeuge tiefer und stabiler und entlastet Knie und unteren Rücken.", "use": "Kniebeugen, Kreuzheben, Ausfallschritte, Hip Thrust", "s": ["Am Boden sitzen, beide Beine im rechten Winkel gebeugt: ein Bein vorn, ein Bein seitlich hinter dir.", "Aufrecht sitzen, die Hände bei Bedarf hinter dem Körper abstützen.", "Beide Knie gleichzeitig zur anderen Seite kippen, sodass die Beine die Rolle tauschen.", "Kurz aufrichten und zurück zur Ausgangsseite wechseln."], "f": ["Der Oberkörper fällt nach hinten und der Rücken rundet.", "Die Füße rutschen weit weg statt die Hüfte drehen zu lassen."], "l": "Mit den Händen hinter dem Körper abstützen und die Füße weiter auseinander stellen.", "h": "Ohne Hände und in jeder Position den Oberkörper über das vordere Schienbein neigen.", "v": "Bei Leisten- oder Knieschmerzen nur im schmerzfreien Bereich bewegen."},
  {"id": "hipcars", "reg": "hip", "de": "Hüftkreisen im Vierfüßlerstand", "type": "dyn", "eq": "", "u": "r", "n": 5, "side": true, "pre": ["gesaess", "abduktoren", "adduktoren"], "good": "Führt das Hüftgelenk kontrolliert durch seinen ganzen Bewegungsumfang. Schmiert das Gelenk und weckt die kleinen Hüftmuskeln.", "use": "Kniebeugen, Kreuzheben, Ausfallschritte, Beinpresse", "s": ["Im Vierfüßlerstand beginnen, Rücken gerade, Bauch leicht fest.", "Ein Knie Richtung Brust ziehen.", "Das Knie seitlich nach außen öffnen und nach hinten führen, wie ein großer Kreis.", "Das Bein nach hinten strecken und wieder unter den Körper holen. Nach der Hälfte die Richtung wechseln."], "f": ["Das Becken kippt mit zur Seite.", "Der Rücken macht ein Hohlkreuz."], "l": "Kleinere Kreise.", "h": "Langsamer und mit Spannung, als würdest du gegen einen Widerstand kreisen.", "v": ""},
  {"id": "legswingfront", "reg": "hip", "de": "Beinschwingen vor und zurück", "type": "dyn", "eq": "wall", "u": "r", "n": 10, "side": true, "pre": ["beinbeuger", "quadrizeps", "gesaess"], "good": "Lockert Beinrückseite und Hüftbeuger mit Schwung und macht die Hüfte frei für große Bewegungen.", "use": "Kreuzheben, Kniebeugen, Ausfallschritte, Laufen", "s": ["Seitlich an eine Wand stellen und mit einer Hand abstützen.", "Das äußere Bein locker vor und zurück schwingen.", "Mit kleinen Schwüngen beginnen und sie langsam größer werden lassen.", "Oberkörper bleibt aufrecht, das Standbein leicht gebeugt."], "f": ["Der Oberkörper schwingt mit.", "Sofort mit voller Kraft schwingen."], "l": "Kleinere Schwünge.", "h": "Das Bein vorn kurz oben halten.", "v": ""},
  {"id": "legswingside", "reg": "hip", "de": "Beinschwingen seitlich", "type": "dyn", "eq": "wall", "u": "r", "n": 10, "side": true, "pre": ["adduktoren", "abduktoren", "gesaess"], "good": "Lockert Leiste und Hüftaußenseite. Bereitet auf breite Stände wie Sumo-Kreuzheben und breite Kniebeugen vor.", "use": "Kniebeugen, Sumo-Kreuzheben, Adduktoren- und Abduktorenmaschine", "s": ["Mit dem Gesicht zur Wand stehen und mit beiden Händen abstützen.", "Ein Bein vor dem Standbein seitlich hin und her schwingen.", "Klein beginnen und die Schwünge langsam vergrößern.", "Die Hüfte bleibt nach vorn ausgerichtet."], "f": ["Das Becken dreht stark mit.", "Der Oberkörper kippt zur Seite."], "l": "Kleinere Schwünge.", "h": "Etwas langsamer und am äußeren Punkt kurz halten.", "v": ""},
  {"id": "cossack", "reg": "hip", "de": "Seitliche Kniebeuge (Cossack Squat)", "type": "dyn", "eq": "", "u": "r", "n": 5, "side": true, "pre": ["adduktoren", "quadrizeps", "gesaess", "waden"], "good": "Dehnt die Leiste des gestreckten Beins und kräftigt gleichzeitig das gebeugte Bein. Verbessert die seitliche Beweglichkeit der Hüfte.", "use": "Kniebeugen, Sumo-Kreuzheben, Ausfallschritte", "s": ["Sehr breit stehen, Fußspitzen leicht nach außen.", "Das Gewicht auf ein Bein verlagern und dieses Bein tief beugen.", "Das andere Bein bleibt gestreckt, die Zehen zeigen nach oben.", "Brust aufrecht, kurz halten und zur anderen Seite wechseln."], "f": ["Die Ferse des gebeugten Beins hebt ab.", "Der Rücken rundet stark."], "l": "Nur halb so tief gehen und mit den Händen an einem Pfosten festhalten.", "h": "Ein leichtes Gewicht vor der Brust halten.", "v": "Bei Knieschmerzen weniger tief gehen."},
  {"id": "frogrock", "reg": "hip", "de": "Froschhaltung mit Wippen", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["adduktoren", "gesaess"], "good": "Öffnet die Leiste dynamisch. Hilft bei breiten Kniebeugen und Sumo-Kreuzheben, wenn die Innenseite der Oberschenkel zieht.", "use": "Kniebeugen, Sumo-Kreuzheben, Adduktorenmaschine", "s": ["In den Vierfüßlerstand gehen und die Knie so weit wie angenehm auseinander schieben.", "Die Unterschenkel liegen parallel, die Füße zeigen nach außen.", "Die Hüfte langsam nach hinten Richtung Fersen schieben.", "Wieder nach vorn wippen und wiederholen."], "f": ["Hohlkreuz beim Zurückschieben.", "Zu breit beginnen und dabei die Leiste überdehnen."], "l": "Auf den Unterarmen statt auf den Händen abstützen und die Knie enger stellen.", "h": "Hinten 3 Sekunden halten.", "v": "Bei Leistenschmerzen die Knie enger stellen."},
  {"id": "hipflexorreach", "reg": "hip", "de": "Hüftbeuger-Dehnung im Kniestand mit Armheben", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": true, "pre": ["quadrizeps", "gesaess", "bauch", "ruecken_unten"], "good": "Dehnt den Hüftbeuger, der durch viel Sitzen verkürzt. Ein freier Hüftbeuger hilft, die Hüfte beim Kreuzheben und Hip Thrust ganz zu strecken, und entlastet den unteren Rücken.", "use": "Kreuzheben, Hip Thrust, Kniebeugen, Ausfallschritte", "s": ["In den Halbkniestand gehen, das hintere Knie liegt auf einer Unterlage.", "Das Gesäß des hinteren Beins fest anspannen und das Becken leicht aufrichten.", "Die Hüfte ein Stück nach vorn schieben, bis vorn an der Hüfte ein Ziehen kommt.", "Den Arm auf der Seite des hinteren Beins über den Kopf strecken und leicht zur anderen Seite neigen, dann zurück."], "f": ["Ins Hohlkreuz fallen statt das Gesäß anzuspannen.", "Zu weit nach vorn schieben."], "l": "Den Arm unten lassen und nur die Hüfte nach vorn schieben.", "h": "Den hinteren Fuß auf eine Bank legen.", "v": "Bei Knieschmerzen ein dickes Kissen unter das Knie legen."},
  {"id": "couchstretch", "reg": "hip", "de": "Couch Stretch", "type": "hold", "eq": "wall", "u": "s", "n": 45, "side": true, "pre": ["quadrizeps"], "good": "Intensive Dehnung für vorderen Oberschenkel und Hüftbeuger zugleich. Besser nach dem Training oder an freien Tagen, vorher nur kurz.", "use": "Kniebeugen, Ausfallschritte, Kreuzheben", "s": ["Rückwärts vor eine Wand oder ein Sofa knien, ein Kissen unter dem Knie.", "Ein Schienbein senkrecht an die Wand legen, das Knie steht in der Ecke.", "Das andere Bein vorn aufstellen.", "Den Oberkörper langsam aufrichten und das Gesäß anspannen, bis der Oberschenkel vorn zieht."], "f": ["Hohlkreuz statt Gesäß anspannen.", "Mit Gewalt aufrichten."], "l": "Das Knie weiter weg von der Wand stellen und den Oberkörper nach vorn lehnen.", "h": "Ganz aufrichten und mit dem Rücken nah an die Wand kommen.", "v": "Bei Knieschmerzen gut polstern und die Position entschärfen."},
  {"id": "pigeon", "reg": "hip", "de": "Taube", "type": "hold", "eq": "", "u": "s", "n": 45, "side": true, "pre": ["gesaess", "abduktoren"], "good": "Dehnt das Gesäß und die Außenrotatoren der Hüfte. Hilft, wenn die Hüfte bei Kniebeugen eng wirkt oder der untere Rücken nach langem Sitzen spannt.", "use": "Kniebeugen, Kreuzheben, Hip Thrust", "s": ["Aus dem Vierfüßlerstand ein Knie nach vorn hinter das Handgelenk bringen, der Unterschenkel liegt schräg vor dir.", "Das hintere Bein lang nach hinten strecken.", "Die Hüfte gerade ausrichten und mit dem Oberkörper nach vorn sinken.", "Ruhig atmen und mit jedem Ausatmen etwas lockerer werden."], "f": ["Die Hüfte kippt zur Seite des vorderen Beins.", "Das Knie wird verdreht statt die Hüfte zu dehnen."], "l": "Ein Kissen unter das Gesäß des vorderen Beins legen oder im Liegen die Figur-4-Dehnung machen.", "h": "Den vorderen Unterschenkel paralleler zur Matte legen.", "v": "Bei Knieschmerzen die Liegende Gesäßdehnung wählen."},
  {"id": "glutebridge", "reg": "hip", "de": "Beckenheben", "type": "act", "eq": "", "u": "r", "n": 12, "side": false, "pre": ["gesaess", "beinbeuger", "ruecken_unten"], "good": "Weckt das Gesäß auf, damit es bei Kniebeugen, Kreuzheben und Hip Thrust richtig mitarbeitet und nicht der untere Rücken übernimmt.", "use": "Kreuzheben, Hip Thrust, Kniebeugen, Beinbeuger", "s": ["Auf dem Rücken liegen, Füße hüftbreit aufgestellt, Arme neben dem Körper.", "Das Becken leicht aufrichten, sodass der untere Rücken flach am Boden liegt.", "Das Gesäß anspannen und die Hüfte anheben, bis Knie, Hüfte und Schultern eine Linie bilden.", "Oben 2 Sekunden halten und langsam absenken."], "f": ["Oben ins Hohlkreuz drücken.", "Die Knie fallen nach außen oder innen."], "l": "Kleinere Bewegung.", "h": "Ein Miniband über die Knie legen oder einbeinig ausführen.", "v": ""},
  {"id": "monsterwalk", "reg": "hip", "de": "Seitliche Schritte mit Miniband", "type": "act", "eq": "band", "u": "r", "n": 10, "side": true, "pre": ["abduktoren", "gesaess", "quadrizeps"], "good": "Aktiviert das seitliche Gesäß, das die Knie bei Kniebeugen und Ausfallschritten stabil über den Füßen hält.", "use": "Kniebeugen, Ausfallschritte, Beinpresse, Kreuzheben", "s": ["Ein Miniband knapp über die Knie oder um die Sprunggelenke legen.", "Leicht in die Knie gehen, Oberkörper etwas nach vorn, Rücken gerade.", "Kleine Schritte zur Seite machen, das Band bleibt immer gespannt.", "Nach den Wiederholungen in die andere Richtung gehen."], "f": ["Die Knie fallen nach innen.", "Der Oberkörper wippt von Seite zu Seite."], "l": "Das Band über den Knien tragen oder ein leichteres nehmen.", "h": "Das Band an den Füßen tragen und tiefer in die Knie gehen.", "v": ""},
  {"id": "clamshell", "reg": "hip", "de": "Muschel mit Band", "type": "act", "eq": "band", "u": "r", "n": 15, "side": true, "pre": ["abduktoren", "gesaess"], "good": "Isolierte Aktivierung des seitlichen Gesäßes. Gut, wenn die Knie bei Kniebeugen oder Ausfallschritten nach innen fallen.", "use": "Kniebeugen, Ausfallschritte, Beinpresse", "s": ["Auf der Seite liegen, Knie gebeugt, Füße übereinander, ein Miniband über den Knien.", "Den Kopf auf dem unteren Arm ablegen, das Becken bleibt senkrecht.", "Das obere Knie gegen das Band öffnen, die Füße bleiben zusammen.", "Kurz halten und langsam schließen."], "f": ["Das Becken kippt nach hinten mit.", "Zu schnell öffnen und schließen."], "l": "Ohne Band.", "h": "Oben 3 Sekunden halten oder die Füße zusätzlich anheben.", "v": ""},
  {"id": "hamsweep", "reg": "hip", "de": "Beinrückseite: Ferse vor und abwärts greifen", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": true, "pre": ["beinbeuger", "gesaess", "ruecken_unten"], "good": "Dehnt die Beinrückseite im Gehen oder auf der Stelle und übt dabei das Beugen aus der Hüfte, das du für Kreuzheben brauchst.", "use": "Kreuzheben, Rumänisches Kreuzheben, Beinbeuger, Good Mornings", "s": ["Einen kleinen Schritt nach vorn machen und die Ferse aufsetzen, Zehen nach oben.", "Das vordere Bein bleibt fast gestreckt, das hintere ist leicht gebeugt.", "Mit geradem Rücken aus der Hüfte nach vorn beugen und mit den Händen am vorderen Bein entlang nach unten streichen.", "Aufrichten und mit dem anderen Bein weitermachen."], "f": ["Den Rücken rund machen, um tiefer zu kommen.", "Das vordere Knie ganz durchdrücken."], "l": "Nur bis zum Knie greifen.", "h": "Die Arme beim Aufrichten über den Kopf strecken.", "v": ""},
  {"id": "bwgoodmorning", "reg": "hip", "de": "Good Morning ohne Gewicht", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["beinbeuger", "gesaess", "ruecken_unten"], "good": "Übt das Beugen aus der Hüfte mit geradem Rücken und wärmt Beinrückseite und unteren Rücken auf. Die beste Vorbereitung für Kreuzheben.", "use": "Kreuzheben, Rumänisches Kreuzheben, Rudern vorgebeugt, Kniebeugen", "s": ["Hüftbreit stehen, Hände an den Hinterkopf oder vor der Brust verschränken.", "Die Knie leicht beugen.", "Den Po nach hinten schieben und den Oberkörper mit geradem Rücken nach vorn neigen, bis die Beinrückseite zieht.", "Über das Gesäß wieder aufrichten."], "f": ["Der Rücken rundet.", "In die Knie gehen statt die Hüfte nach hinten zu schieben."], "l": "Mit dem Po an eine Wand tippen und dabei die Hände an den Oberschenkeln führen.", "h": "Einen Stab entlang des Rückens halten, er berührt Hinterkopf, Brustwirbelsäule und Kreuzbein.", "v": ""},
  {"id": "firehydrant", "reg": "hip", "de": "Hydrant", "type": "act", "eq": "", "u": "r", "n": 10, "side": true, "pre": ["abduktoren", "gesaess"], "good": "Aktiviert das seitliche Gesäß und bewegt die Hüfte in Abspreizung und Drehung. Stabilisiert Knie und Becken.", "use": "Kniebeugen, Ausfallschritte, Abduktorenmaschine", "s": ["Im Vierfüßlerstand beginnen, Rücken gerade.", "Ein Bein mit gebeugtem Knie seitlich anheben, bis der Oberschenkel etwa waagerecht ist.", "Kurz halten, das Becken bleibt gerade.", "Langsam absenken."], "f": ["Das ganze Becken kippt zur Seite.", "Die Arme knicken ein."], "l": "Weniger hoch anheben.", "h": "Ein Miniband über die Knie legen.", "v": ""},
  {"id": "deepsquathold", "reg": "hip", "de": "Tiefe Hocke halten", "type": "hold", "eq": "", "u": "s", "n": 45, "side": false, "pre": ["quadrizeps", "adduktoren", "gesaess", "waden", "ruecken_unten"], "good": "Gewöhnt Hüfte, Knie und Sprunggelenke an die tiefste Position der Kniebeuge. Je selbstverständlicher sie sich anfühlt, desto sicherer wird die Kniebeuge mit Gewicht.", "use": "Kniebeugen, Frontkniebeugen, Beinpresse", "s": ["Etwas breiter als hüftbreit stehen, Fußspitzen leicht nach außen.", "In die tiefste Hocke sinken, die Fersen bleiben am Boden.", "Die Hände vor der Brust zusammenlegen und die Ellbogen innen gegen die Knie drücken.", "Brust aufrecht halten und ruhig atmen."], "f": ["Die Fersen heben ab.", "Unten ganz zusammensacken und den Rücken stark runden."], "l": "An einem Türrahmen oder Pfosten festhalten oder die Fersen unterlegen.", "h": "In der Hocke langsam das Gewicht von links nach rechts verlagern.", "v": "Bei Knieschmerzen in tiefer Beugung eine höhere Position wählen."},
  {"id": "butterfly", "reg": "hip", "de": "Schmetterling", "type": "hold", "eq": "", "u": "s", "n": 45, "side": false, "pre": ["adduktoren"], "good": "Sanfte Dehnung der Leiste und Innenseite der Oberschenkel. Gut nach dem Training oder an freien Tagen.", "use": "Kniebeugen, Sumo-Kreuzheben, Adduktorenmaschine", "s": ["Aufrecht sitzen und die Fußsohlen vor dem Körper zusammenlegen.", "Die Füße mit den Händen halten und die Knie locker nach außen sinken lassen.", "Mit geradem Rücken leicht nach vorn neigen.", "Ruhig atmen, nicht mit den Ellbogen auf die Knie drücken."], "f": ["Mit rundem Rücken weit nach vorn ziehen.", "Die Knie mit Kraft nach unten drücken."], "l": "Die Füße weiter weg vom Körper legen oder auf einem Kissen sitzen.", "h": "Die Füße näher an den Körper ziehen.", "v": ""},
  {"id": "shinbox", "reg": "hip", "de": "Shin Box mit Aufrichten", "type": "dyn", "eq": "", "u": "r", "n": 6, "side": true, "pre": ["gesaess", "adduktoren", "abduktoren", "quadrizeps"], "good": "Verbindet die 90/90-Drehung mit dem Strecken der Hüfte bis in den Kniestand. Mobilisiert und kräftigt die Hüfte zugleich.", "use": "Kniebeugen, Kreuzheben, Hip Thrust, Ausfallschritte", "s": ["In der 90/90-Position sitzen, ein Bein vorn, ein Bein seitlich hinten.", "Das Gesäß anspannen und die Hüfte nach vorn oben schieben, bis du auf dem vorderen Knie und dem hinteren Schienbein kniest.", "Kurz halten und kontrolliert zurücksetzen.", "Die Beine zur anderen Seite wechseln und wiederholen."], "f": ["Mit Schwung hochkommen.", "Beim Aufrichten ins Hohlkreuz fallen."], "l": "Mit einer Hand am Boden abstützen.", "h": "Ganz ohne Hände und langsam.", "v": "Bei Knieschmerzen eine weiche Unterlage nehmen."},
  {"id": "adductorrock", "reg": "hip", "de": "Adduktoren-Wippen mit gestrecktem Bein", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": true, "pre": ["adduktoren", "beinbeuger"], "good": "Dehnt die Innenseite eines Oberschenkels dynamisch. Bereitet die Leiste auf tiefe und breite Kniebeugen vor.", "use": "Kniebeugen, Sumo-Kreuzheben, Ausfallschritte", "s": ["Im Vierfüßlerstand beginnen und ein Bein gestreckt zur Seite ausstrecken, der Fuß steht flach am Boden.", "Den Rücken gerade halten.", "Die Hüfte langsam nach hinten Richtung Ferse des gebeugten Beins schieben, bis die Leiste zieht.", "Wieder nach vorn wippen."], "f": ["Der Rücken rundet beim Zurückschieben.", "Der Fuß des gestreckten Beins dreht nach oben."], "l": "Kleinere Bewegung nach hinten.", "h": "Hinten 3 Sekunden halten.", "v": ""},
  {"id": "slrdl", "reg": "hip", "de": "Einbeiniges Hüftbeugen ohne Gewicht", "type": "act", "eq": "", "u": "r", "n": 6, "side": true, "pre": ["beinbeuger", "gesaess", "abduktoren"], "good": "Aktiviert Gesäß und Beinrückseite auf einem Bein und schult Gleichgewicht und Hüftstabilität. Gute Vorbereitung für Kreuzheben und Ausfallschritte.", "use": "Kreuzheben, Rumänisches Kreuzheben, Ausfallschritte, Bulgarische Split Squats", "s": ["Auf einem Bein stehen, das Standknie leicht gebeugt.", "Den Oberkörper mit geradem Rücken nach vorn neigen, das freie Bein geht gestreckt nach hinten.", "So weit gehen, bis Oberkörper und Bein fast waagerecht sind oder die Beinrückseite zieht.", "Über das Gesäß wieder aufrichten."], "f": ["Die Hüfte des freien Beins dreht nach oben auf.", "Der Rücken rundet."], "l": "Mit einer Hand an einer Wand festhalten.", "h": "Langsamer und ohne Festhalten, oben das Knie zur Brust ziehen.", "v": ""},
  {"id": "hipairplane", "reg": "hip", "de": "Hüft-Flugzeug", "type": "act", "eq": "", "u": "r", "n": 4, "side": true, "pre": ["gesaess", "abduktoren", "adduktoren"], "good": "Dreht das Becken über dem Standbein und kräftigt die Hüfte in der Rotation. Verbessert Gleichgewicht und Stabilität für alle Übungen auf einem Bein.", "use": "Ausfallschritte, Bulgarische Split Squats, Kreuzheben", "s": ["Wie beim einbeinigen Hüftbeugen nach vorn neigen, bis Oberkörper und freies Bein etwa waagerecht sind.", "Die Hände an die Hüfte legen.", "Das Becken langsam zur Seite des freien Beins aufdrehen, dann zurück und zur Seite des Standbeins eindrehen.", "Langsam aufrichten."], "f": ["Das Standknie fällt nach innen.", "Zu schnell drehen und das Gleichgewicht verlieren."], "l": "Mit einer Hand an einer Wand festhalten und weniger weit vorbeugen.", "h": "Ohne Festhalten und am Ende jeder Drehung kurz halten.", "v": ""},
  {"id": "figurefour", "reg": "hip", "de": "Liegende Gesäßdehnung (Figur 4)", "type": "hold", "eq": "", "u": "s", "n": 45, "side": true, "pre": ["gesaess"], "good": "Sanfte Dehnung für Gesäß und Hüfte, knieschonender als die Taube. Lockert auch einen verspannten unteren Rücken.", "use": "Kniebeugen, Kreuzheben, Hip Thrust", "s": ["Auf dem Rücken liegen, beide Füße aufgestellt.", "Einen Fuß über das andere Knie legen.", "Das untere Bein anheben und mit den Händen hinter dem Oberschenkel zu dir ziehen.", "Das obere Knie leicht von dir weg schieben und ruhig atmen."], "f": ["Den Kopf und die Schultern vom Boden heben.", "Am Knie statt am Oberschenkel ziehen."], "l": "Das untere Bein aufgestellt lassen.", "h": "Das untere Bein näher an die Brust ziehen.", "v": ""},
  {"id": "strapham", "reg": "hip", "de": "Liegende Beinrückseiten-Dehnung mit Band", "type": "hold", "eq": "band", "u": "s", "n": 45, "side": true, "pre": ["beinbeuger", "waden"], "good": "Dehnt die Beinrückseite ohne Belastung für den unteren Rücken. Sinnvoll nach dem Training oder an freien Tagen.", "use": "Kreuzheben, Beinbeuger, Rumänisches Kreuzheben", "s": ["Auf dem Rücken liegen und ein Band oder Handtuch um einen Fuß legen.", "Das Bein mit dem Band gestreckt nach oben führen, das andere bleibt lang am Boden.", "Das Bein mit dem Band sanft zu dir ziehen, bis die Rückseite zieht.", "Die Zehen leicht zu dir ziehen und ruhig atmen."], "f": ["Das Becken hebt sich vom Boden.", "Das gedehnte Knie stark beugen."], "l": "Das untere Bein aufstellen.", "h": "Das Bein im Wechsel leicht nach innen und außen führen.", "v": "Bei Kribbeln oder ausstrahlendem Schmerz ins Bein die Dehnung lösen."},
  {"id": "catcow", "reg": "spine", "de": "Katze-Kuh", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": false, "pre": ["ruecken_unten", "bauch", "lat"], "good": "Bewegt die ganze Wirbelsäule sanft in Beugung und Streckung. Lockert den Rücken nach dem Aufstehen oder langem Sitzen. Die gleiche Bewegung gibt es auch im Yoga.", "use": "Kreuzheben, Kniebeugen, Rudern", "s": ["Im Vierfüßlerstand beginnen, Hände unter den Schultern, Knie unter der Hüfte.", "Einatmend den Bauch sinken lassen, Brust und Blick nach vorn oben heben.", "Ausatmend den Rücken rund machen, das Kinn zur Brust und den Bauchnabel nach innen ziehen.", "Fließend und im Rhythmus des Atems wechseln."], "f": ["Nur den Kopf bewegen, der Rücken bleibt starr.", "Zu schnell und ohne Atem."], "l": "Kleinere Bewegung.", "h": "Wirbel für Wirbel bewegen, beim Rundmachen vom Becken aus beginnen.", "v": ""},
  {"id": "birddog", "reg": "spine", "de": "Vierfüßler-Diagonale (Bird Dog)", "type": "act", "eq": "", "u": "r", "n": 6, "side": true, "pre": ["ruecken_unten", "bauch", "gesaess", "schulter_vorne"], "good": "Lehrt, den Rumpf stabil zu halten, während sich Arme und Beine bewegen. Aktiviert Gesäß und Rückenstrecker schonend vor schweren Grundübungen.", "use": "Kreuzheben, Kniebeugen, Rudern vorgebeugt", "s": ["Im Vierfüßlerstand beginnen, Rücken gerade, Bauch leicht fest.", "Gleichzeitig einen Arm nach vorn und das gegenüberliegende Bein nach hinten strecken.", "Kurz halten, das Becken bleibt waagerecht.", "Kontrolliert zurückholen und die Seite wechseln."], "f": ["Das Bein wird zu hoch gehoben und der Rücken fällt ins Hohlkreuz.", "Das Becken kippt zur Seite."], "l": "Nur das Bein oder nur den Arm strecken.", "h": "Am Ende Ellbogen und Knie unter dem Körper zusammenführen oder 5 Sekunden halten.", "v": ""},
  {"id": "deadbug", "reg": "spine", "de": "Dead Bug", "type": "act", "eq": "", "u": "r", "n": 6, "side": true, "pre": ["bauch", "ruecken_unten"], "good": "Aktiviert die tiefe Bauchmuskulatur und übt, den unteren Rücken stabil zu halten. Gute Vorbereitung für Kniebeugen, Kreuzheben und Überkopfübungen.", "use": "Kniebeugen, Kreuzheben, Schulterdrücken", "s": ["Auf dem Rücken liegen, Arme senkrecht nach oben, Hüfte und Knie im rechten Winkel angehoben.", "Den unteren Rücken sanft in den Boden drücken.", "Gleichzeitig einen Arm hinter den Kopf und das gegenüberliegende Bein lang Richtung Boden senken.", "Zurückholen und die Seite wechseln, ruhig ausatmen."], "f": ["Der untere Rücken hebt sich vom Boden ab.", "Zu schnell und mit Schwung."], "l": "Nur die Beine bewegen oder die Ferse am Boden antippen.", "h": "Langsamer bewegen und die Endposition 3 Sekunden halten.", "v": ""},
  {"id": "pelvictilt", "reg": "spine", "de": "Beckenkippen in Rückenlage", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["ruecken_unten", "bauch"], "good": "Sanfte Mobilisation für den unteren Rücken. Verbessert das Gefühl für die Stellung des Beckens, die bei Kniebeugen und Kreuzheben wichtig ist.", "use": "Kreuzheben, Kniebeugen, Hip Thrust", "s": ["Auf dem Rücken liegen, Füße aufgestellt, Arme neben dem Körper.", "Den unteren Rücken in den Boden drücken, das Becken kippt nach hinten.", "Dann ein leichtes Hohlkreuz machen, das Becken kippt nach vorn.", "Langsam zwischen beiden Positionen wechseln."], "f": ["Mit dem Po vom Boden abheben.", "Zu große, ruckartige Bewegungen."], "l": "Kleinere Bewegung.", "h": "Im Stehen mit gebeugten Knien und den Händen an der Hüfte ausführen.", "v": ""},
  {"id": "scorpion", "reg": "spine", "de": "Skorpion in Bauchlage", "type": "dyn", "eq": "", "u": "r", "n": 6, "side": true, "pre": ["ruecken_unten", "brust", "quadrizeps", "bauch"], "good": "Dreht die Lendenwirbelsäule und dehnt Hüftbeuger und Brust gleichzeitig. Gut gegen steifen Rücken nach langem Sitzen.", "use": "Kreuzheben, Kniebeugen, Bankdrücken", "s": ["Auf dem Bauch liegen, Arme seitlich ausgestreckt wie ein T.", "Ein Bein mit gebeugtem Knie anheben und über den Körper zur anderen Hand führen.", "Die Schultern bleiben möglichst am Boden.", "Langsam zurück und die Seite wechseln."], "f": ["Mit Schwung das Bein werfen.", "Die gegenüberliegende Schulter hebt stark ab."], "l": "Das Bein nur so weit führen, wie es angenehm ist.", "h": "Am Ende kurz halten und das Knie leicht Richtung Boden sinken lassen.", "v": "Bei akuten Rückenschmerzen oder Bandscheibenproblemen lieber weglassen."},
  {"id": "standrot", "reg": "spine", "de": "Rumpfdrehung im Stehen", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": true, "pre": ["bauch", "ruecken_unten", "lat"], "good": "Lockert Rumpf und Wirbelsäule in der Drehung und wärmt die schrägen Bauchmuskeln auf. Einfach und überall möglich.", "use": "Kreuzheben, Rudern, Kabelzug-Übungen", "s": ["Schulterbreit stehen, Knie leicht gebeugt, Arme locker vor der Brust oder seitlich angewinkelt.", "Den Oberkörper locker nach rechts und links drehen.", "Die Hüfte bleibt nach vorn ausgerichtet, der Blick folgt der Bewegung.", "Mit kleinen Drehungen beginnen und langsam größer werden."], "f": ["Die Hüfte und die Knie drehen stark mit.", "Ruckartig und mit voller Wucht drehen."], "l": "Kleinere Drehungen.", "h": "Einen Stab auf den Schultern halten.", "v": ""},
  {"id": "childpose", "reg": "spine", "de": "Kindhaltung", "type": "hold", "eq": "", "u": "s", "n": 45, "side": false, "pre": ["ruecken_unten", "lat"], "good": "Entspannt den unteren Rücken und dehnt Lat und Schultern sanft. Gut zum Runterkommen nach dem Training. Auch im Yoga als Ruhehaltung bekannt.", "use": "Kreuzheben, Klimmzüge, Latziehen", "s": ["Im Kniestand die Knie etwas öffnen, die großen Zehen berühren sich.", "Den Po auf die Fersen sinken lassen.", "Den Oberkörper nach vorn ablegen und die Arme lang nach vorn strecken.", "Die Stirn ablegen und tief in den Rücken atmen."], "f": ["Die Arme schlaff ablegen und dadurch die Dehnung verlieren.", "Den Atem flach halten."], "l": "Ein Kissen zwischen Po und Fersen oder unter die Stirn legen.", "h": "Mit den Händen zu einer Seite wandern, um die Flanke stärker zu dehnen.", "v": ""},
  {"id": "cobrapress", "reg": "spine", "de": "Kobra-Wippen", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": false, "pre": ["bauch", "ruecken_unten", "brust"], "good": "Streckt die Wirbelsäule und dehnt Bauch und Hüftbeuger. Guter Ausgleich nach Sitzen und nach Übungen mit rundem Rücken.", "use": "Kreuzheben, Kniebeugen, Crunches", "s": ["Auf dem Bauch liegen, Hände unter den Schultern.", "Mit den Armen den Oberkörper langsam nach oben drücken, das Becken bleibt am Boden.", "Nur so weit hochgehen, wie es im unteren Rücken angenehm ist.", "Langsam wieder ablegen und wiederholen."], "f": ["Die Schultern ziehen hoch zu den Ohren.", "Mit Gewalt in die Streckung drücken."], "l": "Nur bis auf die Unterarme hochkommen (Sphinx).", "h": "Oben 3 Sekunden halten und dabei ausatmen.", "v": "Bei Rückenschmerzen, die beim Strecken stärker werden, weglassen."},
  {"id": "sideplankthread", "reg": "spine", "de": "Seitstütz mit Durchfädeln", "type": "act", "eq": "", "u": "r", "n": 6, "side": true, "pre": ["bauch", "schulter_vorne", "abduktoren"], "good": "Aktiviert die seitliche Rumpfmuskulatur und Schulterstabilität und dreht dabei die Brustwirbelsäule.", "use": "Kreuzheben, Schulterdrücken, einarmige Übungen", "s": ["Seitstütz auf dem Unterarm, Ellbogen unter der Schulter, Beine gestreckt.", "Den oberen Arm zur Decke strecken.", "Den Arm unter dem Körper durchfädeln und den Oberkörper dabei Richtung Boden drehen.", "Zurück aufdrehen, die Hüfte bleibt oben."], "f": ["Die Hüfte sackt ab.", "Die Schulter des Stützarms rutscht zum Ohr."], "l": "Die Knie am Boden lassen.", "h": "Im Stütz auf der Hand statt auf dem Unterarm.", "v": "Bei Schulterbeschwerden auf dem Stützarm vorsichtig oder weglassen."},
  {"id": "lyingtwist", "reg": "spine", "de": "Liegende Drehung mit fallenden Knien", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": true, "pre": ["ruecken_unten", "bauch", "gesaess"], "good": "Sanfte Drehung für die Lendenwirbelsäule und das Becken. Lockert einen festen unteren Rücken ohne Belastung.", "use": "Kreuzheben, Kniebeugen, Hip Thrust", "s": ["Auf dem Rücken liegen, Füße aufgestellt, Arme seitlich ausgestreckt.", "Beide Knie langsam zu einer Seite sinken lassen.", "Die Schultern bleiben am Boden, der Kopf darf zur anderen Seite drehen.", "Mit dem Bauch die Knie zurück zur Mitte holen und zur anderen Seite wechseln."], "f": ["Die Knie fallen unkontrolliert.", "Die Schultern heben ab."], "l": "Kleinere Bewegung.", "h": "Die Beine angehoben im rechten Winkel halten und so absenken.", "v": ""},
  {"id": "pallof", "reg": "spine", "de": "Pallof Press mit Band", "type": "act", "eq": "band", "u": "r", "n": 10, "side": true, "pre": ["bauch", "ruecken_unten"], "good": "Trainiert den Rumpf darin, einer Drehung zu widerstehen. Ein stabiler Rumpf schützt den Rücken bei allen schweren Grundübungen.", "use": "Kreuzheben, Kniebeugen, Rudern einarmig", "s": ["Ein Band auf Brusthöhe befestigen und seitlich dazu stehen, das Band mit beiden Händen an der Brust halten.", "Schulterbreit stehen, Knie leicht gebeugt, Bauch fest.", "Die Arme gerade nach vorn strecken, ohne dass der Oberkörper zum Band dreht.", "Kurz halten und die Hände zurück zur Brust holen."], "f": ["Der Oberkörper dreht zum Band.", "Luft anhalten."], "l": "Näher an den Befestigungspunkt stellen.", "h": "Weiter weg stehen oder im Halbkniestand ausführen.", "v": ""},
  {"id": "sidebend", "reg": "spine", "de": "Seitneigung im Stand", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": true, "pre": ["bauch", "lat"], "good": "Dehnt die Flanke und den Lat und mobilisiert die Wirbelsäule zur Seite.", "use": "Klimmzüge, Latziehen, Schulterdrücken", "s": ["Hüftbreit stehen, einen Arm über den Kopf strecken.", "Den Oberkörper zur anderen Seite neigen, als würdest du über eine Rolle greifen.", "Die Hüfte bleibt mittig, nicht nach vorn oder hinten kippen.", "Zurück zur Mitte und die Seite wechseln."], "f": ["Nach vorn statt zur Seite kippen.", "Die Hüfte schiebt weit zur Seite weg."], "l": "Die Hand an der Hüfte lassen.", "h": "Beide Arme strecken und die Hände greifen.", "v": ""},
  {"id": "openbook", "reg": "tspine", "de": "Offenes Buch", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": true, "pre": ["brust", "lat", "schulter_vorne"], "good": "Dreht die Brustwirbelsäule und öffnet die Brust. Eine bewegliche Brustwirbelsäule hilft bei Bankdrücken, Überkopfübungen und gegen Rundrücken.", "use": "Bankdrücken, Schulterdrücken, Rudern, Klimmzüge", "s": ["Auf der Seite liegen, Knie und Hüfte im rechten Winkel gebeugt, Arme gestreckt übereinander vor dir.", "Ein Kissen unter den Kopf legen.", "Den oberen Arm in einem großen Bogen zur anderen Seite öffnen, der Blick folgt der Hand.", "Kurz halten, ausatmen und den Arm zurückführen."], "f": ["Die Knie rutschen auseinander und das Becken dreht mit.", "Nur der Arm bewegt sich, der Brustkorb dreht nicht."], "l": "Den Arm nur so weit öffnen, wie die Knie zusammenbleiben.", "h": "Ein Kissen zwischen die Knie klemmen und am Ende 3 Sekunden halten.", "v": ""},
  {"id": "threadneedle", "reg": "tspine", "de": "Faden einfädeln", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": true, "pre": ["lat", "schulter_hinten", "trapez", "brust"], "good": "Dreht die Brustwirbelsäule in beide Richtungen und dehnt hintere Schulter und oberen Rücken.", "use": "Rudern, Klimmzüge, Bankdrücken, Schulterdrücken", "s": ["Im Vierfüßlerstand beginnen.", "Einen Arm zur Decke aufdrehen, der Blick folgt.", "Den Arm dann unter dem anderen Arm hindurch zur Gegenseite schieben, bis Schulter und Kopf Richtung Boden sinken.", "Fließend zwischen Öffnen und Einfädeln wechseln."], "f": ["Die Hüfte schiebt zur Seite.", "Mit Schwung arbeiten."], "l": "Kleinere Bewegung.", "h": "Unten kurz halten und die Schulter sanft in den Boden sinken lassen.", "v": ""},
  {"id": "quadrot", "reg": "tspine", "de": "Vierfüßler-Rotation mit Hand am Hinterkopf", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": true, "pre": ["brust", "lat", "trapez"], "good": "Isoliert die Drehung der Brustwirbelsäule, weil die Hüfte im Vierfüßlerstand fixiert ist. Gegen steifen oberen Rücken.", "use": "Bankdrücken, Rudern, Schulterdrücken", "s": ["Im Vierfüßlerstand den Po etwas Richtung Fersen schieben.", "Eine Hand an den Hinterkopf legen.", "Den Ellbogen zum Stützarm hin nach unten drehen.", "Dann den Ellbogen weit nach oben zur Decke aufdrehen, der Blick folgt."], "f": ["Die Hüfte dreht mit.", "Der Ellbogen fällt nach vorn statt aufzudrehen."], "l": "Kleinere Drehung.", "h": "Oben 2 Sekunden halten.", "v": ""},
  {"id": "rollerext", "reg": "tspine", "de": "Brustwirbelsäule auf der Faszienrolle strecken", "type": "dyn", "eq": "roll", "u": "r", "n": 10, "side": false, "pre": ["brust", "schulter_vorne", "lat"], "good": "Streckt die Brustwirbelsäule, die durch Sitzen oft rund ist. Hilft bei Überkopfübungen und einer stabilen Brücke beim Bankdrücken.", "use": "Schulterdrücken, Bankdrücken, Kniebeugen", "s": ["Die Rolle quer unter den oberen Rücken legen, Füße aufgestellt.", "Die Hände am Hinterkopf verschränken, Ellbogen nach vorn.", "Den Oberkörper langsam über die Rolle nach hinten strecken, das Becken bleibt am Boden.", "Zurückkommen und die Rolle ein kleines Stück nach oben oder unten versetzen."], "f": ["Die Rolle unter den unteren Rücken legen.", "Den Kopf nach hinten hängen lassen."], "l": "Die Arme vor der Brust verschränken.", "h": "Die Arme gestreckt über den Kopf führen.", "v": "Nicht auf dem unteren Rücken oder dem Nacken rollen."},
  {"id": "benchtspine", "reg": "tspine", "de": "Bank-Dehnung für Brustwirbelsäule und Lat", "type": "hold", "eq": "bench", "u": "s", "n": 30, "side": false, "pre": ["lat", "trizeps", "schulter_vorne", "brust"], "good": "Dehnt Lat und Trizeps und streckt gleichzeitig die Brustwirbelsäule. Gut, wenn die Arme über Kopf nicht gerade nach oben kommen.", "use": "Schulterdrücken, Klimmzüge, Kniebeugen, Überkopf-Trizeps", "s": ["Vor einer Bank knien und die Ellbogen schulterbreit auf die Bank legen.", "Die Hände über dem Kopf zusammenlegen oder einen Stab halten.", "Den Po nach hinten schieben und die Brust Richtung Boden sinken lassen.", "Die Unterarme zum Nacken beugen und ruhig atmen."], "f": ["Ins Hohlkreuz fallen statt die Brust zu senken.", "Die Ellbogen rutschen weit auseinander."], "l": "Die Ellbogen weiter auseinander legen und weniger tief sinken.", "h": "Die Ellbogen enger stellen und am Ende leicht nach oben drücken.", "v": "Bei Schulterschmerzen vorn im Gelenk weniger tief gehen."},
  {"id": "wallangel", "reg": "tspine", "de": "Wandengel", "type": "act", "eq": "wall", "u": "r", "n": 10, "side": false, "pre": ["trapez", "schulter_hinten", "brust", "schulter_seite"], "good": "Streckt den oberen Rücken und aktiviert die Muskeln zwischen den Schulterblättern. Gegen hängende Schultern und für saubere Überkopfbewegungen.", "use": "Schulterdrücken, Seitheben, Rudern, Bankdrücken", "s": ["Mit dem Rücken an die Wand stellen, Füße eine Handbreit davor, Hinterkopf, oberer Rücken und Po an der Wand.", "Die Arme wie ein W anwinkeln, Ellbogen und Handrücken berühren die Wand.", "Die Arme an der Wand langsam nach oben schieben, ohne dass der Rücken abhebt.", "Wieder in die W-Position ziehen."], "f": ["Der untere Rücken wird hohl.", "Die Hände lösen sich von der Wand."], "l": "Etwas weiter von der Wand weg stehen und nur so hoch schieben, wie der Kontakt hält.", "h": "Am Boden liegend ausführen, Arme nah am Boden.", "v": ""},
  {"id": "sphinx", "reg": "tspine", "de": "Sphinx", "type": "hold", "eq": "", "u": "s", "n": 30, "side": false, "pre": ["bauch", "brust"], "good": "Sanfte Streckung für die Wirbelsäule und Dehnung des Bauchs. Ausgleich zu viel Sitzen und zu runden Bewegungen. Auch im Yoga verbreitet.", "use": "Kreuzheben, Rudern, Crunches", "s": ["Auf dem Bauch liegen, Ellbogen unter den Schultern.", "Den Oberkörper auf die Unterarme hochstützen, das Becken bleibt am Boden.", "Die Schultern weg von den Ohren ziehen und die Brust nach vorn schieben.", "Ruhig atmen und halten."], "f": ["Die Schultern sinken zwischen die Ohren.", "Der Kopf hängt in den Nacken."], "l": "Die Ellbogen etwas weiter nach vorn setzen.", "h": "Zur Kobra mit gestreckten Armen hochkommen.", "v": "Bei Schmerzen im unteren Rücken weglassen."},
  {"id": "seatedtwist", "reg": "tspine", "de": "Drehsitz", "type": "hold", "eq": "", "u": "s", "n": 30, "side": true, "pre": ["bauch", "gesaess", "ruecken_unten"], "good": "Dreht die Wirbelsäule und dehnt dabei Gesäß und Hüftaußenseite. Wohltuend nach dem Training.", "use": "Kreuzheben, Kniebeugen, Rudern", "s": ["Aufrecht sitzen, ein Bein lang, das andere aufgestellt und über das lange Bein gesetzt.", "Eine Hand hinter dem Körper abstützen.", "Den anderen Ellbogen außen gegen das aufgestellte Knie legen und den Oberkörper aufdrehen.", "Mit jedem Einatmen aufrichten, mit jedem Ausatmen etwas weiter drehen."], "f": ["Den Rücken rund machen.", "Mit dem Arm gewaltsam weiterdrehen."], "l": "Das aufgestellte Knie mit den Armen umarmen statt den Ellbogen anzulegen.", "h": "Das lange Bein ebenfalls beugen und unter dem Körper ablegen.", "v": ""},
  {"id": "reachroll", "reg": "tspine", "de": "Greifen, Rollen und Heben in der Kindhaltung", "type": "act", "eq": "", "u": "r", "n": 6, "side": true, "pre": ["trapez", "schulter_hinten", "lat", "schulter_seite"], "good": "Aktiviert die unteren Schulterblattmuskeln und streckt die Brustwirbelsäule. Verbessert die Kontrolle über die Schultern über Kopf.", "use": "Schulterdrücken, Klimmzüge, Seitheben", "s": ["In der Kindhaltung beginnen, Arme lang nach vorn.", "Eine Hand mit dem Daumen nach oben leicht vom Boden abheben.", "Den Arm zur Seite rollen, sodass er neben dem Körper Richtung Po zeigt, und wieder anheben.", "Zurück nach vorn führen und den Arm ablegen."], "f": ["Die Schulter zieht zum Ohr.", "Der Po hebt sich von den Fersen."], "l": "Den Arm nur nach vorn anheben, ohne ihn zu rollen.", "h": "Ein ganz leichtes Gewicht in die Hand nehmen.", "v": ""},
  {"id": "windmill", "reg": "tspine", "de": "Armkreis in Seitlage", "type": "dyn", "eq": "", "u": "r", "n": 6, "side": true, "pre": ["brust", "schulter_vorne", "lat"], "good": "Führt die Schulter in einem großen Kreis und dreht dabei die Brustwirbelsäule. Öffnet die Brust stärker als das offene Buch.", "use": "Bankdrücken, Schulterdrücken, Klimmzüge", "s": ["Wie beim offenen Buch auf der Seite liegen, Knie gebeugt, Arme vorn.", "Die obere Hand gleitet am Boden über den Kopf nach oben.", "Der Arm zieht weiter einen großen Kreis hinter dir, der Brustkorb dreht auf.", "Der Arm kommt seitlich am Körper vorbei zurück nach vorn."], "f": ["Die Knie heben ab.", "Den Kreis zu klein machen."], "l": "Den Arm vom Boden abheben, wo es eng wird.", "h": "Ganz langsam und mit Kontakt der Hand zum Boden.", "v": "Bei Schulterschmerzen nur im schmerzfreien Teil des Kreises bewegen."},
  {"id": "armcircles", "reg": "shoulder", "de": "Armkreisen", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["schulter_vorne", "schulter_seite", "schulter_hinten", "brust"], "good": "Der einfachste Einstieg für die Schultern: wärmt das Gelenk und die Muskeln rundherum auf.", "use": "Bankdrücken, Schulterdrücken, Seitheben, Klimmzüge", "s": ["Aufrecht stehen, Arme seitlich ausgestreckt.", "Mit kleinen Kreisen nach vorn beginnen und sie langsam größer werden lassen.", "Nach der Hälfte die Richtung wechseln.", "Zum Schluss ein paar große Kreise mit ganz gestreckten Armen."], "f": ["Die Schultern ziehen zu den Ohren.", "Hektisch und mit Schwung aus dem Oberkörper."], "l": "Nur kleine Kreise.", "h": "Die Arme im Wechsel kreisen, einer nach vorn, einer nach hinten.", "v": ""},
  {"id": "pullapart", "reg": "shoulder", "de": "Band auseinanderziehen (Pull-Apart)", "type": "act", "eq": "band", "u": "r", "n": 15, "side": false, "pre": ["schulter_hinten", "trapez", "brust", "schulter_vorne"], "good": "Aktiviert hintere Schulter und die Muskeln zwischen den Schulterblättern. Stabilisiert die Schulter vor dem Bankdrücken und gleicht viel Drücken aus.", "use": "Bankdrücken, Schulterdrücken, Rudern, Face Pulls", "s": ["Ein leichtes Band schulterbreit mit gestreckten Armen vor der Brust halten.", "Das Band auseinanderziehen, bis es die Brust berührt, die Schulterblätter gehen zusammen.", "Kurz halten.", "Langsam zurück nach vorn."], "f": ["Die Schultern ziehen hoch.", "Ins Hohlkreuz gehen, um das Band auseinanderzubekommen."], "l": "Ein leichteres Band oder weiter greifen.", "h": "Enger greifen oder die Arme diagonal ziehen.", "v": ""},
  {"id": "dislocates", "reg": "shoulder", "de": "Schulterkreisen mit Stab oder Band", "type": "dyn", "eq": "stick", "u": "r", "n": 10, "side": false, "pre": ["brust", "schulter_vorne", "lat", "trapez"], "good": "Führt beide Schultern über den Kopf und hinter den Körper. Öffnet die Brust und verbessert die Beweglichkeit für Überkopfübungen und Kniebeugen mit Langhantel.", "use": "Schulterdrücken, Kniebeugen, Bankdrücken, Klimmzüge", "s": ["Einen Stab oder ein Band sehr weit gegriffen vor dem Körper halten, Arme gestreckt.", "Die Arme gestreckt über den Kopf heben.", "Weiter nach hinten führen, bis der Stab hinter dem Körper ist, sofern es ohne Schmerz geht.", "Langsam den gleichen Weg zurück."], "f": ["Zu eng greifen und dann die Ellbogen beugen.", "Ins Hohlkreuz ausweichen."], "l": "Noch weiter greifen oder nur bis über den Kopf gehen.", "h": "Den Griff Schritt für Schritt enger machen.", "v": "Bei Schulterinstabilität oder Schmerzen nicht hinter den Körper führen."},
  {"id": "scappushup", "reg": "shoulder", "de": "Schulterblatt-Liegestütz", "type": "act", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["brust", "schulter_vorne", "trizeps"], "good": "Aktiviert den vorderen Sägemuskel, der das Schulterblatt am Brustkorb hält. Stabilisiert die Schulter für alle Druckübungen.", "use": "Bankdrücken, Schulterdrücken, Liegestütze, Dips", "s": ["In die hohe Liegestützposition gehen, Arme gestreckt.", "Ohne die Ellbogen zu beugen, die Brust zwischen den Schultern absinken lassen, die Schulterblätter gehen zusammen.", "Dann den oberen Rücken weg vom Boden drücken, die Schulterblätter gehen auseinander.", "Ruhig im Wechsel wiederholen."], "f": ["Die Ellbogen beugen sich.", "Die Hüfte hängt durch."], "l": "Auf den Knien oder an der Wand ausführen.", "h": "Die Füße erhöht ablegen.", "v": ""},
  {"id": "scappull", "reg": "shoulder", "de": "Schulterblatt-Klimmzug", "type": "act", "eq": "bar", "u": "r", "n": 8, "side": false, "pre": ["lat", "trapez", "bizeps"], "good": "Aktiviert die Muskeln, die die Schulterblätter nach unten ziehen. So startet jeder Klimmzug und jedes Latziehen aus einer stabilen Schulter.", "use": "Klimmzüge, Latziehen, Rudern", "s": ["Mit gestreckten Armen an der Stange hängen.", "Ohne die Arme zu beugen, die Schultern nach unten weg von den Ohren ziehen, der Körper hebt sich etwas.", "Kurz halten.", "Langsam wieder in den Hang nachgeben."], "f": ["Die Arme beugen mit.", "Mit Schwung aus den Beinen arbeiten."], "l": "Die Füße am Boden lassen oder am Latzug ausführen.", "h": "Oben 3 Sekunden halten.", "v": ""},
  {"id": "deadhang", "reg": "shoulder", "de": "Passives Hängen", "type": "hold", "eq": "bar", "u": "s", "n": 30, "side": false, "pre": ["lat", "unterarme", "schulter_vorne"], "good": "Dehnt Lat und Schultern über Kopf und entlastet die Wirbelsäule. Kräftigt nebenbei den Griff.", "use": "Klimmzüge, Latziehen, Schulterdrücken", "s": ["Eine Klimmzugstange schulterbreit greifen.", "Die Füße vom Boden lösen oder nur leicht aufstellen.", "Die Schultern locker nach oben ziehen lassen und den Körper hängen lassen.", "Ruhig atmen und kontrolliert wieder absteigen."], "f": ["Abspringen statt kontrolliert absteigen.", "Stark schaukeln."], "l": "Die Füße auf einer Kiste lassen und nur einen Teil des Gewichts abgeben.", "h": "Länger hängen oder im Wechsel einarmig.", "v": "Bei Schulterinstabilität oder Schmerzen weglassen."},
  {"id": "ytw", "reg": "shoulder", "de": "Y-T-W in Bauchlage", "type": "act", "eq": "", "u": "r", "n": 6, "side": false, "pre": ["trapez", "schulter_hinten", "schulter_seite"], "good": "Aktiviert die Schulterblattmuskeln in drei Richtungen. Verbessert Haltung und Stabilität für Drücken, Ziehen und Überkopfübungen.", "use": "Schulterdrücken, Rudern, Seitheben, Bankdrücken", "s": ["Auf dem Bauch liegen, Stirn auf einem Handtuch, Daumen zeigen nach oben.", "Die gestreckten Arme schräg nach vorn wie ein Y anheben und absenken.", "Dann seitlich wie ein T anheben und absenken.", "Zum Schluss die Ellbogen anwinkeln wie ein W und die Schulterblätter zusammenziehen."], "f": ["Den Kopf und die Brust weit anheben.", "Mit Schwung arbeiten."], "l": "Vorgebeugt auf einer Schrägbank liegen.", "h": "Ein ganz leichtes Gewicht in die Hände nehmen.", "v": ""},
  {"id": "bandextrot", "reg": "shoulder", "de": "Außenrotation mit Band", "type": "act", "eq": "band", "u": "r", "n": 12, "side": true, "pre": ["schulter_hinten", "schulter_vorne", "brust"], "good": "Aktiviert die Rotatorenmanschette, die den Oberarmkopf in der Pfanne zentriert. Bereitet die Schulter auf schwere Druck- und Zugübungen vor.", "use": "Bankdrücken, Schulterdrücken, Klimmzüge, Dips", "s": ["Ein leichtes Band auf Ellbogenhöhe befestigen und seitlich dazu stehen.", "Den Ellbogen der äußeren Hand rechtwinklig am Körper anlegen, ein gerolltes Handtuch dazwischen hilft.", "Die Hand nach außen drehen, der Ellbogen bleibt am Körper.", "Langsam zurück."], "f": ["Der Ellbogen löst sich vom Körper.", "Mit dem Oberkörper mitdrehen."], "l": "Ein leichteres Band oder ohne Band.", "h": "Den Arm seitlich auf Schulterhöhe heben und dort nach oben drehen.", "v": ""},
  {"id": "sleeper", "reg": "shoulder", "de": "Schläfer-Dehnung", "type": "hold", "eq": "", "u": "s", "n": 30, "side": true, "pre": ["schulter_hinten"], "good": "Dehnt die hintere Schulterkapsel und verbessert die Innenrotation. Hilfreich, wenn sich die Schulter hinten fest anfühlt.", "use": "Bankdrücken, Schulterdrücken, Wurfsportarten", "s": ["Auf der Seite liegen, der untere Arm liegt rechtwinklig vor dir, der Ellbogen auf Schulterhöhe.", "Den Unterarm senkrecht nach oben halten.", "Mit der oberen Hand den Unterarm sanft Richtung Boden drücken.", "Nur bis zu einem leichten Ziehen hinten in der Schulter gehen und halten."], "f": ["Zu kräftig drücken.", "Den Oberkörper nach hinten rollen."], "l": "Den Oberkörper etwas nach hinten drehen.", "h": "Etwas mehr auf die Schulter rollen.", "v": "Bei Schmerzen vorn in der Schulter sofort lösen."},
  {"id": "doorchest", "reg": "shoulder", "de": "Brustdehnung im Türrahmen", "type": "hold", "eq": "wall", "u": "s", "n": 30, "side": true, "pre": ["brust", "schulter_vorne", "bizeps"], "good": "Dehnt Brust und vordere Schulter, die durch viel Drücken und Sitzen oft verkürzt sind. Am besten nach dem Training.", "use": "Bankdrücken, Butterfly, Dips", "s": ["Seitlich in einen Türrahmen stellen und den Unterarm mit rechtwinkligem Ellbogen auf Schulterhöhe an den Rahmen legen.", "Einen kleinen Schritt nach vorn machen.", "Den Oberkörper leicht von der Wand weg drehen, bis die Brust zieht.", "Ruhig atmen und halten."], "f": ["Zu weit nach vorn lehnen und die Schulter nach vorn schieben.", "Ins Hohlkreuz fallen."], "l": "Den Arm etwas tiefer ansetzen.", "h": "Den Arm höher ansetzen.", "v": "Bei Kribbeln im Arm die Position lösen."},
  {"id": "crossbody", "reg": "shoulder", "de": "Arm vor dem Körper", "type": "hold", "eq": "", "u": "s", "n": 30, "side": true, "pre": ["schulter_hinten", "trapez"], "good": "Einfache Dehnung für die hintere Schulter und den oberen Rücken.", "use": "Rudern, Face Pulls, Reverse Butterfly", "s": ["Aufrecht stehen und einen gestreckten Arm vor dem Körper zur anderen Seite führen.", "Mit der anderen Hand den Arm oberhalb des Ellbogens sanft zur Brust ziehen.", "Die Schulter bleibt unten.", "Ruhig halten."], "f": ["Die Schulter zieht zum Ohr.", "Am Ellbogengelenk drücken."], "l": "Weniger stark ziehen.", "h": "Den Oberkörper dabei leicht zur Gegenseite drehen.", "v": ""},
  {"id": "shouldercars", "reg": "shoulder", "de": "Kontrolliertes Schulterkreisen", "type": "dyn", "eq": "", "u": "r", "n": 3, "side": true, "pre": ["schulter_vorne", "schulter_seite", "schulter_hinten", "lat"], "good": "Führt die Schulter langsam und mit Spannung durch ihren ganzen Bewegungsumfang. Zeigt Engstellen und hält das Gelenk gesund.", "use": "Schulterdrücken, Bankdrücken, Klimmzüge, Seitheben", "s": ["Aufrecht stehen, eine Faust machen und den ganzen Körper leicht anspannen.", "Den gestreckten Arm vorn langsam nach oben führen, so weit es geht.", "Oben den Arm nach außen drehen und hinter dem Körper langsam nach unten führen.", "Unten zurück zum Start und danach die Richtung umkehren."], "f": ["Der Oberkörper kippt oder dreht mit.", "Zu schnell, dann fehlt die Kontrolle."], "l": "Nur einen Teil des Kreises.", "h": "Noch langsamer, ein Kreis dauert etwa 20 Sekunden.", "v": ""},
  {"id": "wallslide", "reg": "shoulder", "de": "Unterarme an der Wand hochschieben", "type": "act", "eq": "wall", "u": "r", "n": 10, "side": false, "pre": ["schulter_seite", "trapez", "schulter_vorne", "schulter_hinten"], "good": "Aktiviert die Muskeln, die das Schulterblatt beim Armheben nach oben drehen. Gute Vorbereitung für Schulterdrücken und Seitheben.", "use": "Schulterdrücken, Seitheben, Bankdrücken", "s": ["Mit dem Gesicht zur Wand stehen, die Unterarme senkrecht und schulterbreit an der Wand.", "Die Unterarme langsam an der Wand nach oben schieben.", "Oben die Arme leicht von der Wand lösen und die Schulterblätter nach oben drehen.", "Kontrolliert zurück nach unten."], "f": ["Die Schultern ziehen zu den Ohren.", "Ins Hohlkreuz ausweichen."], "l": "Ohne Abheben oben.", "h": "Ein Miniband um die Handgelenke legen und leicht nach außen drücken.", "v": ""},
  {"id": "latwall", "reg": "shoulder", "de": "Lat-Dehnung an der Wand", "type": "hold", "eq": "wall", "u": "s", "n": 30, "side": true, "pre": ["lat", "trizeps"], "good": "Dehnt den breiten Rückenmuskel. Ist er fest, kommen die Arme über Kopf nicht gerade nach oben und der Rücken weicht ins Hohlkreuz aus.", "use": "Schulterdrücken, Klimmzüge, Latziehen, Kniebeugen", "s": ["Etwa einen Meter vor einer Wand oder einem Pfosten stehen und mit einer Hand auf Hüfthöhe festhalten.", "Den Po nach hinten schieben, bis der Arm gestreckt ist und der Oberkörper waagerecht.", "Die Hüfte leicht zur Gegenseite schieben, bis es seitlich am Rücken zieht.", "Ruhig in die Flanke atmen."], "f": ["Den Rücken rund machen.", "Den Arm beugen."], "l": "Höher festhalten.", "h": "Mit beiden Händen festhalten und die Brust tiefer sinken lassen.", "v": ""},
  {"id": "proneswimmer", "reg": "shoulder", "de": "Schwimmer in Bauchlage", "type": "act", "eq": "", "u": "r", "n": 8, "side": false, "pre": ["trapez", "schulter_hinten", "lat", "ruecken_unten"], "good": "Führt die Arme aus der Bauchlage von vorn nach hinten und aktiviert dabei Schulterblätter und oberen Rücken. Gut gegen Rundrücken.", "use": "Rudern, Klimmzüge, Schulterdrücken", "s": ["Auf dem Bauch liegen, Arme gestreckt nach vorn, Stirn leicht über dem Boden.", "Die Arme anheben und seitlich in einem Bogen nach hinten zum Po führen.", "Hinten die Ellbogen beugen und die Hände Richtung Schulterblätter führen.", "Den Weg zurück nach vorn, die Arme bleiben in der Luft."], "f": ["Den Kopf weit in den Nacken nehmen.", "Die Arme berühren zwischendurch den Boden."], "l": "Die Arme zwischendurch ablegen.", "h": "Ganz leichte Gewichte in den Händen.", "v": ""},
  {"id": "overheadpullapart", "reg": "shoulder", "de": "Band über Kopf auseinanderziehen", "type": "act", "eq": "band", "u": "r", "n": 10, "side": false, "pre": ["trapez", "schulter_seite", "schulter_hinten", "lat"], "good": "Aktiviert Schulterblätter und oberen Rücken über Kopf. Gute Vorbereitung für Schulterdrücken und Klimmzüge.", "use": "Schulterdrücken, Klimmzüge, Latziehen", "s": ["Ein leichtes Band etwas breiter als schulterbreit mit gestreckten Armen über den Kopf halten.", "Das Band auseinanderziehen und die Arme seitlich bis hinter den Kopf absenken.", "Die Schulterblätter ziehen nach unten und zusammen.", "Langsam wieder nach oben führen."], "f": ["Den Kopf nach vorn schieben.", "Ins Hohlkreuz gehen."], "l": "Weiter greifen.", "h": "Enger greifen und unten kurz halten.", "v": ""},
  {"id": "halo", "reg": "shoulder", "de": "Halo mit leichtem Gewicht", "type": "dyn", "eq": "weight", "u": "r", "n": 6, "side": true, "pre": ["schulter_vorne", "schulter_seite", "trapez", "trizeps", "bauch"], "good": "Führt die Schultern mit leichter Last um den Kopf und trainiert dabei den Rumpf, der still bleiben muss. Wärmt Schultern und Ellbogen gut auf.", "use": "Schulterdrücken, Bankdrücken, Überkopf-Trizeps", "s": ["Eine leichte Hantelscheibe oder Kurzhantel mit beiden Händen vor der Brust halten.", "Das Gewicht nah am Kopf vorbei auf eine Seite führen.", "Hinter dem Kopf weiter zur anderen Seite und vorn zurück zur Brust.", "Nach den Wiederholungen die Richtung wechseln."], "f": ["Der Oberkörper weicht ins Hohlkreuz aus.", "Das Gewicht zu weit weg vom Kopf führen."], "l": "Ganz ohne Gewicht oder mit einer Wasserflasche.", "h": "Im Halbkniestand ausführen.", "v": "Bei Schulterschmerzen hinter dem Kopf weglassen."},
  {"id": "shoulderrolls", "reg": "shoulder", "de": "Schultern rollen", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["trapez", "schulter_hinten", "schulter_vorne"], "good": "Lockert Nacken und Schultergürtel und löst Verspannungen vom Sitzen. Gut als erste Bewegung vor jedem Oberkörpertraining.", "use": "Schulterdrücken, Rudern, Shrugs, Bankdrücken", "s": ["Aufrecht stehen, Arme hängen locker.", "Die Schultern nach oben zu den Ohren ziehen.", "Nach hinten und unten rollen, als würdest du die Schulterblätter in die Gesäßtaschen schieben.", "Nach der Hälfte nach vorn rollen."], "f": ["Hektisch und klein.", "Den Kopf mitbewegen."], "l": "Kleinere Kreise.", "h": "Leichte Kurzhanteln in den Händen.", "v": ""},
  {"id": "wristcircles", "reg": "arm", "de": "Handgelenkkreisen", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["unterarme", "trizeps", "brust", "bizeps"], "good": "Wärmt die Handgelenke auf, die bei Bankdrücken, Frontkniebeugen und Stützübungen viel Last tragen.", "use": "Bankdrücken, Schulterdrücken, Frontkniebeugen, Liegestütze", "s": ["Die Finger vor der Brust ineinander verschränken.", "Die Handgelenke locker in großen Kreisen bewegen.", "Nach der Hälfte die Richtung wechseln.", "Zum Schluss die Hände ausschütteln."], "f": ["Nur die Finger bewegen, die Handgelenke bleiben steif.", "Zu schnell."], "l": "Kleinere Kreise.", "h": "Jede Hand einzeln mit einer Faust kreisen, langsam und mit Spannung.", "v": ""},
  {"id": "wristflexor", "reg": "arm", "de": "Unterarmbeuger dehnen im Vierfüßlerstand", "type": "hold", "eq": "", "u": "s", "n": 30, "side": false, "pre": ["unterarme", "bizeps"], "good": "Dehnt die Unterarmbeuger, die beim Greifen und bei allen Zugübungen arbeiten. Gut bei festen Unterarmen und vor Stützübungen.", "use": "Klimmzüge, Rudern, Bizepscurls, Kreuzheben", "s": ["Im Vierfüßlerstand die Hände flach aufsetzen, die Finger zeigen zu den Knien.", "Die Arme bleiben gestreckt.", "Das Gewicht langsam nach hinten verlagern, bis die Unterarme innen ziehen.", "Halten und ruhig atmen."], "f": ["Die Handballen heben ab.", "Zu viel Gewicht und zu schnell."], "l": "Die Finger zur Seite statt zu den Knien zeigen lassen.", "h": "Das Gewicht weiter nach hinten verlagern.", "v": "Bei Handgelenkbeschwerden nur sanft und im Stehen an der Wand."},
  {"id": "wristextensor", "reg": "arm", "de": "Unterarmstrecker dehnen", "type": "hold", "eq": "", "u": "s", "n": 30, "side": false, "pre": ["unterarme"], "good": "Dehnt die Streckmuskeln am Handrücken. Hilft bei Reizungen außen am Ellbogen und nach viel Greifen.", "use": "Klimmzüge, Rudern, Kreuzheben, Unterarmtraining", "s": ["Im Vierfüßlerstand die Handrücken aufsetzen, die Finger zeigen zu den Knien.", "Die Arme bleiben gestreckt.", "Das Gewicht vorsichtig nach hinten verlagern, bis die Oberseite der Unterarme zieht.", "Halten und ruhig atmen."], "f": ["Zu viel Gewicht auf die Handrücken legen.", "Die Ellbogen beugen."], "l": "Im Stehen: einen Arm gestreckt nach vorn, Handrücken oben, mit der anderen Hand die Finger sanft nach unten ziehen.", "h": "Das Gewicht weiter nach hinten verlagern.", "v": ""},
  {"id": "wristrocks", "reg": "arm", "de": "Handgelenk-Wippen im Vierfüßlerstand", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["unterarme", "brust", "trizeps", "schulter_vorne"], "good": "Gewöhnt die Handgelenke an die gestreckte Stützposition, wie bei Liegestützen, Dips und Frontkniebeugen.", "use": "Bankdrücken, Liegestütze, Dips, Frontkniebeugen", "s": ["Im Vierfüßlerstand die Hände flach unter den Schultern aufsetzen.", "Die Schultern langsam über die Hände nach vorn schieben, die Handgelenke beugen sich stärker.", "Zurück nach hinten wippen.", "Ruhig und ohne Schmerz wiederholen."], "f": ["Die Handballen heben ab.", "Ruckartig wippen."], "l": "Kleinere Bewegung.", "h": "Die Finger zur Seite oder nach hinten drehen.", "v": ""},
  {"id": "pronsup", "reg": "arm", "de": "Unterarm drehen", "type": "dyn", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["unterarme", "bizeps"], "good": "Dreht die Unterarme nach innen und außen und wärmt Ellbogen und Handgelenk auf. Gut vor Curls, Klimmzügen und Bankdrücken.", "use": "Bizepscurls, Klimmzüge, Bankdrücken, Trizepsdrücken", "s": ["Aufrecht stehen, die Ellbogen rechtwinklig am Körper, Hände nach vorn.", "Die Handflächen nach oben drehen.", "Dann nach unten drehen, die Ellbogen bleiben am Körper.", "Im Wechsel ruhig weiterdrehen."], "f": ["Die Ellbogen wandern vom Körper weg.", "Mit der Schulter nachhelfen."], "l": "Kleinere Drehung.", "h": "Einen Hammer oder eine leichte Kurzhantel am Ende greifen.", "v": ""},
  {"id": "fingerext", "reg": "arm", "de": "Finger öffnen gegen ein Gummiband", "type": "act", "eq": "band", "u": "r", "n": 15, "side": false, "pre": ["unterarme"], "good": "Kräftigt die Fingerstrecker als Ausgleich zum vielen Greifen. Kann Reizungen am Ellbogen vorbeugen.", "use": "Kreuzheben, Klimmzüge, Rudern, Unterarmtraining", "s": ["Ein Gummiband um die Fingerspitzen einer Hand legen.", "Die Finger gegen das Band weit öffnen.", "Kurz halten.", "Langsam wieder schließen, dann die andere Hand."], "f": ["Zu schnell öffnen und schließen.", "Das Handgelenk knickt ab."], "l": "Ohne Band.", "h": "Ein dickeres Band oder mehrere Bänder nehmen.", "v": ""},
  {"id": "tricepsoh", "reg": "arm", "de": "Trizeps-Dehnung über Kopf", "type": "hold", "eq": "", "u": "s", "n": 30, "side": true, "pre": ["trizeps", "lat"], "good": "Dehnt Trizeps und Lat. Hilft, wenn die Ellbogen bei Überkopfübungen oder Frontkniebeugen eng werden.", "use": "Überkopf-Trizeps, Schulterdrücken, Frontkniebeugen", "s": ["Einen Arm über den Kopf heben und den Ellbogen beugen, die Hand liegt zwischen den Schulterblättern.", "Mit der anderen Hand den Ellbogen sanft hinter den Kopf ziehen.", "Aufrecht bleiben, nicht ins Hohlkreuz gehen.", "Ruhig halten."], "f": ["Den Kopf nach vorn drücken.", "Ins Hohlkreuz fallen."], "l": "Ein Handtuch zu Hilfe nehmen.", "h": "Den Oberkörper leicht zur Seite neigen.", "v": ""},
  {"id": "bicepswall", "reg": "arm", "de": "Bizeps-Dehnung an der Wand", "type": "hold", "eq": "wall", "u": "s", "n": 30, "side": true, "pre": ["bizeps", "brust", "schulter_vorne"], "good": "Dehnt Bizeps und vordere Schulter. Guter Ausgleich nach Curls und Zugübungen.", "use": "Bizepscurls, Klimmzüge, Rudern", "s": ["Seitlich zu einer Wand stehen und die Handfläche mit gestrecktem Arm etwas unter Schulterhöhe an die Wand legen, die Finger zeigen nach hinten.", "Den Daumen nach oben drehen.", "Den Oberkörper langsam von der Wand weg drehen, bis Bizeps und Brust ziehen.", "Ruhig halten."], "f": ["Den Ellbogen beugen.", "Die Schulter nach vorn schieben."], "l": "Weniger weit wegdrehen.", "h": "Die Hand etwas höher ansetzen.", "v": "Bei Kribbeln im Arm die Position lösen."},
  {"id": "fistspread", "reg": "arm", "de": "Faust schließen und Finger spreizen", "type": "act", "eq": "", "u": "r", "n": 15, "side": false, "pre": ["unterarme"], "good": "Pumpt Blut in Hände und Unterarme und macht die Finger warm für einen festen Griff.", "use": "Kreuzheben, Klimmzüge, Rudern", "s": ["Die Arme locker nach vorn strecken.", "Beide Hände kräftig zur Faust schließen.", "Dann die Finger so weit wie möglich spreizen.", "Zügig im Wechsel wiederholen."], "f": ["Halbherzig schließen und öffnen.", "Die Schultern ziehen hoch."], "l": "Langsamer.", "h": "Mit Knete oder einem Ball als Widerstand.", "v": ""},
  {"id": "prayer", "reg": "arm", "de": "Gebetshaltung und umgekehrte Gebetshaltung", "type": "hold", "eq": "", "u": "s", "n": 30, "side": false, "pre": ["unterarme"], "good": "Dehnt die Unterarme in beide Richtungen, ohne sich abstützen zu müssen. Überall im Stehen möglich.", "use": "Bankdrücken, Kreuzheben, Klimmzüge, Frontkniebeugen", "s": ["Die Handflächen vor der Brust aneinanderlegen, Finger nach oben.", "Die Hände langsam nach unten schieben, bis die Unterarme innen ziehen, die Handflächen bleiben zusammen.", "Nach der Hälfte der Zeit die Handrücken aneinanderlegen, Finger nach unten.", "Die Hände sanft nach oben ziehen."], "f": ["Die Handflächen lösen sich voneinander.", "Die Schultern ziehen hoch."], "l": "Weniger tief schieben.", "h": "Länger halten.", "v": ""},
  {"id": "neckrot", "reg": "neck", "de": "Kopf drehen", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": true, "pre": ["trapez"], "good": "Lockert die Halswirbelsäule in der Drehung. Gut nach langer Bildschirmarbeit und vor Übungen mit Stange im Nacken.", "use": "Kniebeugen, Shrugs, Schulterdrücken", "s": ["Aufrecht sitzen oder stehen, die Schultern locker.", "Den Kopf langsam nach rechts drehen, als würdest du über die Schulter schauen.", "Zurück zur Mitte und nach links drehen.", "Das Kinn bleibt waagerecht."], "f": ["Den Kopf dabei nach vorn schieben.", "Schnell und ruckartig drehen."], "l": "Kleinere Drehung.", "h": "Am Ende jeder Drehung kurz halten.", "v": "Bei Schwindel, Kribbeln oder ausstrahlenden Schmerzen abbrechen."},
  {"id": "necktilt", "reg": "neck", "de": "Kopf zur Seite neigen", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": true, "pre": ["trapez"], "good": "Dehnt die Seiten des Halses und den oberen Trapez. Löst Spannung nach Shrugs und schwerem Kreuzheben.", "use": "Shrugs, Kreuzheben, Schulterdrücken", "s": ["Aufrecht stehen oder sitzen.", "Das Ohr langsam Richtung Schulter neigen, die Schultern bleiben unten.", "Zurück zur Mitte und zur anderen Seite neigen.", "Ruhig im Wechsel bewegen."], "f": ["Die Schulter zum Ohr ziehen.", "Den Kopf dabei drehen."], "l": "Kleinere Bewegung.", "h": "Am Ende 3 Sekunden halten und die gegenüberliegende Schulter Richtung Boden schieben.", "v": ""},
  {"id": "chintuck", "reg": "neck", "de": "Kinn zurückschieben", "type": "act", "eq": "", "u": "r", "n": 10, "side": false, "pre": ["trapez"], "good": "Aktiviert die tiefen Halsbeuger und richtet den Kopf über der Wirbelsäule aus. Gegen den nach vorn geschobenen Kopf vom Bildschirm.", "use": "Kreuzheben, Kniebeugen, Rudern, Schulterdrücken", "s": ["Aufrecht sitzen oder stehen, Blick geradeaus.", "Das Kinn gerade nach hinten schieben, als würdest du ein Doppelkinn machen.", "Der Hinterkopf wird lang, der Blick bleibt waagerecht.", "Kurz halten und lösen."], "f": ["Den Kopf nach unten nicken statt nach hinten schieben.", "Die Schultern hochziehen."], "l": "Kleinere Bewegung.", "h": "Im Liegen ausführen und den Kopf dabei minimal vom Boden heben.", "v": ""},
  {"id": "nod", "reg": "neck", "de": "Nicken", "type": "dyn", "eq": "", "u": "r", "n": 8, "side": false, "pre": ["trapez"], "good": "Bewegt die Halswirbelsäule vor und zurück und lockert den Nacken.", "use": "Kreuzheben, Kniebeugen, Shrugs", "s": ["Aufrecht stehen oder sitzen.", "Das Kinn langsam zur Brust sinken lassen.", "Den Blick langsam zur Decke heben, ohne den Kopf ganz nach hinten fallen zu lassen.", "Ruhig im Wechsel."], "f": ["Den Kopf nach hinten fallen lassen.", "Schnell und ruckartig."], "l": "Kleinere Bewegung.", "h": "Unten und oben je 2 Sekunden halten.", "v": "Bei Schwindel abbrechen."},
  {"id": "uppertrap", "reg": "neck", "de": "Nacken seitlich dehnen", "type": "hold", "eq": "", "u": "s", "n": 30, "side": true, "pre": ["trapez"], "good": "Dehnt den oberen Trapez, der bei Stress und schweren Zugübungen oft verspannt. Am besten nach dem Training.", "use": "Shrugs, Kreuzheben, Rudern", "s": ["Aufrecht sitzen, eine Hand unter das Gesäß oder an die Sitzkante legen.", "Den Kopf zur anderen Seite neigen.", "Mit der freien Hand den Kopf ganz sanft weiter zur Seite ziehen.", "Ruhig atmen und halten."], "f": ["Kräftig am Kopf ziehen.", "Die gedehnte Schulter hochziehen."], "l": "Ohne Zug mit der Hand.", "h": "Das Kinn leicht zur Brust drehen.", "v": "Bei Kribbeln oder ausstrahlendem Schmerz in den Arm lösen."},
  {"id": "levator", "reg": "neck", "de": "Blick in die Achsel", "type": "hold", "eq": "", "u": "s", "n": 30, "side": true, "pre": ["trapez"], "good": "Dehnt den Schulterblattheber zwischen Nacken und Schulterblatt, eine typische Stelle für Verspannungen.", "use": "Shrugs, Rudern, Schulterdrücken", "s": ["Aufrecht sitzen, eine Hand an die Sitzkante.", "Den Kopf etwa 45 Grad zur anderen Seite drehen und das Kinn Richtung Achsel senken.", "Mit der freien Hand den Hinterkopf ganz sanft weiter nach unten führen.", "Ruhig halten."], "f": ["Kräftig drücken.", "Den Rücken rund machen."], "l": "Ohne Hand am Kopf.", "h": "Den Ellbogen der gedehnten Seite über den Kopf heben.", "v": ""},
  {"id": "chintuckwall", "reg": "neck", "de": "Kinn zurück an der Wand", "type": "act", "eq": "wall", "u": "r", "n": 10, "side": false, "pre": ["trapez", "schulter_hinten"], "good": "Wie das Kinn-Zurückschieben, aber mit der Wand als Rückmeldung. Trainiert zusätzlich den oberen Rücken.", "use": "Rudern, Kreuzheben, Schulterdrücken", "s": ["Mit dem Rücken an die Wand stellen, Fersen eine Handbreit davor.", "Den Hinterkopf an die Wand drücken, indem du das Kinn zurückschiebst.", "Die Schulterblätter leicht an die Wand ziehen.", "Kurz halten und lösen."], "f": ["Den Kopf nach oben kippen.", "Ins Hohlkreuz gehen."], "l": "Ohne die Schulterblätter mitzunehmen.", "h": "5 Sekunden halten.", "v": ""},
];
// MOBILITY>>
const MOB_BY_ID = new Map(MOB_EX.map(m => [m.id, m]));
const mobDose = m => `${m.n} ${m.u === 'r' ? 'Wdh.' : 's'}${m.side ? ' je Seite' : ''}`;
const mobMeta = m => [MOB_TYPES[m.type], mobDose(m), m.eq ? MOB_EQ[m.eq] : ''].filter(Boolean).join(' | ');
const mobMinutes = list => (list || []).reduce((a, m) => a + (m.sets || 1), 0) * MOB_MIN;
// Stufen des Mobility-Vorschlags (v358): [Name, Übungen je Trainingstag]
const MOB_LEVELS = [['Keine', 0], ['Wenig', 2], ['Mittel', 4], ['Viel', 6]];
const mobLevel = (plan = activePlan()) => { const v = plan && plan.mob; return typeof v === 'number' ? Math.min(3, Math.max(0, Math.round(v))) : v === 'auto' ? 2 : 0; };
const mobLevelText = l => l ? `Die App wählt je Trainingstag ${MOB_LEVELS[l][1]} Übungen, passend zu den Muskeln und Übungen des Tages, das sind etwa ${MOB_LEVELS[l][1] * MOB_MIN} Minuten.`
  : 'Die App schlägt keine Übungen vor. Bei Bedarf wählst du für jeden Trainingstag selbst Mobility-Übungen aus.';
const mobSearchStr = m => [m.de, m.good, m.use, MOB_TYPES[m.type]].join(' ').toLowerCase();

/* ----- Vorschlag je Trainingstag ----- */
/* v359 (User-Wunsch 2026-11-23): bevorzugt, was die ersten 1–2 Übungen des Tages brauchen, vor allem Grundübungen (Kniebeugen →
   Hüfte und Sprunggelenk). Jede Übung des Tages zählt nach Platz (MOB_POS_W) und Art (MOB_KIND_W). Welche Körperregionen sie
   braucht, steht in MOB_PAT (nach Name) bzw. MOB_GRP_REG (nach Muskelgruppe). Eine Mobility-Übung bekommt Punkte, wenn ihre
   Region gebraucht wird: doppelt, wenn die Übung unter „Passt vor“ (m.use) steht (an erster Stelle etwas mehr), einfach, wenn
   sie dieselbe Muskelgruppe vorbereitet (m.pre), sonst wenig. Nur dynamische Übungen und Aktivierung ohne besondere Hilfsmittel
   (Wand geht; v375: plus die angegebenen Hilfsmittel, data.mobEq), je Körperregion zuerst höchstens eine. Bewährte Standardübungen (MOB_TOP) bekommen etwas Vorrang. */
const MOB_TOP = new Set(['worldsgreatest', 'squattostand', 'kneetowall', 'ankleRock', 'ninetyninety', 'hipcars', 'cossack', 'hamsweep', 'bwgoodmorning',
  'glutebridge', 'catcow', 'birddog', 'openbook', 'threadneedle', 'wallangel', 'scappushup', 'shouldercars', 'armcircles']), MOB_TOP_W = 1.3;
const MOB_EQ_W = 1.2;    // v375: angegebene Hilfsmittel sollen auch vorkommen (nur Übungen, deren Gerät du hast, stehen überhaupt zur Wahl)
const MOB_ACT_W = 0.85;  // Mobilisation vor Aktivierung (User: z. B. Hüfte öffnen, Sprunggelenk mobilisieren)
const MOB_KIND_W = { compound: 1.5, normal: 1, assist: 0.7 };
const MOB_POS_W = [5, 3], MOB_POS_REST = 0.5;
const MOB_PAT = [
  [/kniebeug|squat|hackenschmidt|hack-?squat/, { ankle: 1, hip: 1, full: 0.5, tspine: 0.3, knee: 0.3 }],
  [/ausfallschritt|split|lunge|step-?up|kreuzheben sumo|sumo/, { hip: 1, ankle: 0.8, knee: 0.6, full: 0.5 }],
  [/kreuzheb|deadlift|good ?morning|rdl/, { hip: 1, spine: 0.6, full: 0.5, ankle: 0.2 }],
  [/beinpresse/, { hip: 1, ankle: 0.6, knee: 0.6, full: 0.3 }],
  [/hip ?thrust|beckenheb|glute/, { hip: 1, spine: 0.4, full: 0.3 }],
  [/wadenheb/, { ankle: 1 }],
  [/schulterdr|uberkopf|military|arnold|nackendr/, { shoulder: 1, tspine: 0.9, arm: 0.3, full: 0.3 }],
  [/bankdr|brustdr|liegest|dips|butterfly|fliegende/, { shoulder: 1, tspine: 0.8, arm: 0.3, full: 0.3 }],
  [/klimmz|latzieh|pull-?down|pull-?up|chin/, { shoulder: 1, tspine: 0.8, arm: 0.3, full: 0.3 }],
  [/rudern|row|face ?pull|reverse butterfly/, { tspine: 1, shoulder: 0.8, spine: 0.3 }],
];
const MOB_GRP_REG = { quadrizeps: { knee: 0.6, hip: 0.6, ankle: 0.5 }, beinbeuger: { hip: 1, knee: 0.3 }, gesaess: { hip: 1 }, adduktoren: { hip: 1 },
  abduktoren: { hip: 1 }, waden: { ankle: 1 }, brust: { shoulder: 1, tspine: 0.6 }, lat: { shoulder: 0.8, tspine: 0.8 }, trapez: { neck: 0.6, tspine: 0.6 },
  schulter_vorne: { shoulder: 1, tspine: 0.5 }, schulter_seite: { shoulder: 1 }, schulter_hinten: { shoulder: 1, tspine: 0.6 }, bizeps: { arm: 1, shoulder: 0.3 },
  trizeps: { arm: 1, shoulder: 0.3 }, unterarme: { arm: 1 }, bauch: { spine: 1, hip: 0.3 }, ruecken_unten: { spine: 1, hip: 0.5 } };
const mobNorm = x => String(x || '').toLowerCase().replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '');
const mobRegNeed = (n, g) => { const p = MOB_PAT.find(([rx]) => rx.test(n)); return p ? p[1] : MOB_GRP_REG[g] || {}; };
// „Passt vor“-Eintrag t passt zur Übung mit Namen n: steht ganz im Namen oder jedes Wort (Anfang) kommt vor
function mobUseHit(t, n) {
  t = mobNorm(t).trim();
  if (!t) return false;
  if (n.includes(t)) return true;
  const ws = n.split(/[\s\-(),\/]+/);
  return t.split(/[\s\-]+/).every(x => x.length >= 3 && ws.some(w => w.startsWith(x.slice(0, Math.min(6, x.length)))));
}
// Übungen eines Trainingstags mit Gewicht (Platz, Art) und gebrauchten Körperregionen
const mobDayExs = day => (day.exercises || []).filter(ex => (ex.name || '').trim()).map((ex, j) => {
  const nn = mobNorm(ex.name), g = groupOf(ex);
  return { n: nn, g, need: mobRegNeed(nn, g), w: (MOB_POS_W[j] || MOB_POS_REST) * (MOB_KIND_W[kindOf(ex)] || 1) };
});
// Punkte einer Mobility-Übung für diese Übungen (ohne Zufall)
function mobScoreFor(exs, m) {
  const use = String(m.use || '').split(',');
  let s = 0;
  for (const ex of exs) {
    const r = ex.need[m.reg] || 0;
    if (!r) continue;
    const k = use.findIndex(t => mobUseHit(t, ex.n));
    s += ex.w * r * (k === 0 ? 2.3 : k > 0 ? 2 : ex.g && m.pre.includes(ex.g) ? 1 : 0.3);
  }
  return s * (MOB_TOP.has(m.id) ? MOB_TOP_W : 1) * (m.type === 'act' ? MOB_ACT_W : 1) * (m.eq && m.eq !== 'wall' ? MOB_EQ_W : 1) * (mobPref(m.id) > 0 ? MOB_LIKE_W : 1);
}
function mobSuggest(day, n = 4) {
  const exs = mobDayExs(day);
  if (!exs.length) return [];
  const seed = [...String(day.id || day.name || '')].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const tie = id => [...id].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, seed) % 1000;
  const score = m => mobScoreFor(exs, m);
  const eq = mobEqSet() || [];  // v375: Hilfsmittel, die du angegeben hast (vorher nur ohne Gerät oder Wand)
  const cand = MOB_EX.filter(m => m.type !== 'hold' && mobEqOk(m, eq) && mobSugOk(m))
    .map(m => ({ m, s: score(m) + tie(m.id) / 100000 }))
    .filter(x => x.s >= 0.5).sort((a, b) => b.s - a.s);
  const out = [], regs = new Set();
  for (const pass of [0, 1]) for (const { m } of cand) {
    if (out.length >= n) break;
    if (out.includes(m) || (pass === 0 && regs.has(m.reg))) continue;
    out.push(m); regs.add(m.reg);
  }
  const ord = r => MOB_REGIONS.findIndex(([k]) => k === r);
  return out.sort((a, b) => ord(a.reg) - ord(b.reg)).map(m => ({ id: m.id, sets: 1 }));
}
// Mobility eines Trainingstags: gespeicherte Liste, sonst bei plan.mob = 'auto' der Vorschlag
function mobDay(day, plan = activePlan()) {
  if (!day) return [];
  if (Array.isArray(day.mob)) return day.mob.filter(m => MOB_BY_ID.has(m.id));
  if (!plan || !mobLevel(plan) || !(day.exercises || []).some(e => (e.name || '').trim())) return [];
  return mobSuggest(day, MOB_LEVELS[mobLevel(plan)][1]);
}
// Liste fest im Tag speichern (vor jeder Änderung)
const mobEdit = day => { if (!Array.isArray(day.mob)) day.mob = mobDay(day).map(m => ({ ...m })); return day.mob; };
// „Wenig Zeit?“: Mobility der Reihe nach behalten, solange sie in free Minuten passt
function mobFit(list, free) {
  const out = [];
  let t = 0;
  for (const m of list) { if (t + (m.sets || 1) * MOB_MIN > free + 1e-9) break; out.push(m); t += (m.sets || 1) * MOB_MIN; }
  return out;
}

/* ----- v396: Figur mit Legende (Mobility und Yoga, ohne Muskelkarte) ----- */
const FIG_LEG = { hold: ['Hier dehnt es', 'Wird leicht mitgedehnt'], dyn: ['Wird beweglich gemacht', 'Bewegt sich mit'], act: ['Wird aktiviert', 'Hält die Position'],
  yoga: ['Hier spürst du die Haltung', 'Hält und stabilisiert'] };
function figLegendHtml(fig, kind) {
  if (!fig) return '';
  const L = FIG_LEG[kind] || FIG_LEG.dyn, lbl = k => k === 'hueftbeuger' ? 'Hüftbeuger' : (typeof MUSCLES !== 'undefined' && MUSCLES[k]) || k;
  const names = ks => ks.map(k => `<span>${lbl(k)}</span>`).join(', ');  // je Name ein Textknoten, damit die Übersetzung greift
  return `<div class="xfig-box">${fig.svg}
    <p class="mm-legend">${fig.p.length ? `<span class="mm-item"><span class="mm-dot p"></span><span>${L[0]}</span>: ${names(fig.p)}</span>` : ''}
      ${fig.s.length ? `<span class="mm-item"><span class="mm-dot s"></span><span>${L[1]}</span>: ${names(fig.s)}</span>` : ''}
      ${fig.arrows ? `<span class="mm-item"><span class="mm-dot mv"></span><span>Blaue Pfeile: Richtung der Bewegung</span></span>` : ''}</p></div>`;
}

// Figur auf den Inhalt zuschneiden (sonst viel Leerraum über liegenden Haltungen); versteckte Figuren später
function xfigCrop() {
  document.querySelectorAll('.xfig-box svg.xfig:not([data-crop])').forEach(svg => {
    try {
      const b = svg.getBBox();
      if (!b.width || !b.height) return;
      const y0 = Math.max(0, b.y - 8), y1 = Math.min(196, b.y + b.height + 6);
      svg.setAttribute('viewBox', `0 ${y0.toFixed(1)} 240 ${Math.max(y1 - y0, 100).toFixed(1)}`);
      svg.dataset.crop = '1';
    } catch (e) { /* ältere Browser: Figur bleibt ungeschnitten */ }
  });
}
if (typeof MutationObserver === 'function') new MutationObserver(() => { if (document.querySelector('.xfig-box svg.xfig:not([data-crop])')) xfigCrop(); })
  .observe(document.documentElement, { childList: true, subtree: true });

/* ----- Darstellung: Beschreibung ----- */
let mobOpenEx = null;   // aufgeklappte Übung: 'ort|id' (ort = lib, pick, plan, tr)
let mobOpenReg = null;  // aufgeklappte Region in der Bibliothek
let mobQ = '';          // Suche
function mobDetail(m) {
  const p = mobPref(m.id);
  const fig = typeof exFigMob === 'function' ? exFigMob(m.id, m.de) : null;  // v396
  return `<div class="yg-detail mob-detail">
      ${figLegendHtml(fig, m.type)}
      <div class="mob-pref"><button class="vchip ${p > 0 ? 'on' : ''}" data-action="mob-pref" data-id="${m.id}" data-v="1" aria-pressed="${p > 0}">👍 Gefällt mir</button>
        <button class="vchip ${p < 0 ? 'on' : ''}" data-action="mob-pref" data-id="${m.id}" data-v="-1" aria-pressed="${p < 0}">👎 Nicht nochmal vorschlagen</button></div>
      ${p ? `<p class="hint nut-small">${p > 0 ? 'Die App schlägt diese Übung bevorzugt vor.' : 'Die App schlägt diese Übung nicht mehr vor. Selbst auswählen kannst du sie weiterhin.'}</p>` : ''}
      <p class="hint nut-small">${esc(mobMeta(m))}</p>
      <p class="yg-sec">Wofür gut</p><p class="mob-good">${esc(m.good)}</p>
      ${m.use ? `<p class="yg-var"><span class="yg-var-l">Passt vor:</span> <span>${esc(m.use)}</span></p>` : ''}
      <p class="yg-sec">Ausführung</p><ol class="yg-steps">${m.s.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
      <p class="yg-sec">Häufige Fehler</p><ul class="yg-faults">${m.f.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="yg-var"><span class="yg-var-l">Leichter:</span> <span>${esc(m.l)}</span></p>
      <p class="yg-var"><span class="yg-var-l">Schwerer:</span> <span>${esc(m.h)}</span></p>
      ${m.v ? `<p class="yg-warn"><span aria-hidden="true">⚠️</span> <span>${esc(m.v)}</span></p>` : ''}
    </div>`;
}
// Liste nach Regionen (Bibliothek; pick = Auswahl für einen Trainingstag)
function mobListHtml(pick) {
  const q = mobQ.trim().toLowerCase(), chosen = pick ? new Set(mobEdit(pick).map(m => m.id)) : null, ort = pick ? 'pick' : 'lib';
  let any = false;
  const h = MOB_REGIONS.map(([r, label]) => {
    const ms = MOB_EX.filter(m => m.reg === r);
    if (!ms.length) return '';
    const hit = ms.filter(m => !q || mobSearchStr(m).includes(q));
    if (hit.length) any = true;
    const open = mobOpenReg === r;
    return `<div class="yg-cat" data-c="${r}" ${q && !hit.length ? 'hidden' : ''}>
      <button class="mg-sub-head" data-action="mob-reg" data-r="${r}" aria-expanded="${open}"><span class="lbl">${label}</span>
        <span class="hint">${ms.length}</span><span class="chev">${open ? '▴' : '▾'}</span></button>
      <div class="yg-poses" ${open || q ? '' : 'hidden'}>${ms.map(m => {
        const on = chosen && chosen.has(m.id), det = mobOpenEx === `${ort}|${m.id}`;
        return `<div class="yg-pose ${det ? 'open' : ''}" data-s="${esc(mobSearchStr(m))}" ${q && !mobSearchStr(m).includes(q) ? 'hidden' : ''}>
          <div class="mob-pose-row"><button class="yg-pose-btn" data-action="mob-info" data-k="${ort}|${m.id}" aria-expanded="${det}">
            <span><b>${esc(m.de)}</b>${mobPrefMark(m.id)}<small>${esc(mobMeta(m))}</small></span><span class="yg-pose-r" aria-hidden="true">${det ? '▴' : '▾'}</span></button>
            ${pick ? `<button class="icon-btn mob-pick-btn ${on ? 'on' : ''}" data-action="mob-toggle" data-id="${m.id}" aria-pressed="${!!on}"
              aria-label="${on ? 'Abwählen' : 'Hinzufügen'}">${on ? '✓' : '＋'}</button>` : ''}</div>
          ${det ? mobDetail(m) : ''}</div>`;
      }).join('')}</div></div>`;
  }).join('');
  return h + `<p class="hint nut-small yg-none" ${q && !any ? '' : 'hidden'}>Nichts gefunden.</p>`;
}
const mobSearchInput = () => `<input class="inp" type="search" data-field="mob-q" value="${esc(mobQ)}" placeholder="Suchen, z. B. Hüfte oder Kniebeugen" autocomplete="off">`;
const MOB_INTRO = 'Mobility vor dem Training macht Gelenke und Muskeln für die Bewegungen des Tages bereit. Vor dem Krafttraining eignen sich vor allem dynamische Übungen und Aktivierung. Langes Halten (Dehnen) passt besser nach dem Training oder an freien Tagen.';
const MOB_CARE = 'Bewege dich nur im schmerzfreien Bereich. Ein Ziehen in der Muskulatur ist normal, stechender Schmerz oder Schmerz im Gelenk nicht. Bei Beschwerden, nach Verletzungen oder Operationen kläre die Übungen bitte vorher ärztlich oder physiotherapeutisch ab.';
function renderMobLib() {
  return `<p class="hint explain">${MOB_INTRO}</p><div class="card yg-lib">${mobSearchInput()}${mobListHtml(null)}</div>
    <p class="hint nut-small explain">${MOB_CARE}</p>`;
}
function renderMobPick({ day: id, sess, rt }) {
  // v375: auch für die Mobility-Einheit (sess) – die Liste steht dann in data.mobDraft.items; v398: eigene Routine (rt) in rtEdit.items
  const day = rt ? (rtEdit ? { mob: rtEdit.items } : null) : sess ? (data.mobDraft ? { mob: data.mobDraft.items } : null) : findDay(id);
  if (!day) return '<p class="hint">Trainingstag nicht gefunden.</p>';
  const n = mobEdit(day).length;
  if (rt) return `<p class="hint explain">Antippen ＋ fügt die Übung zur Routine hinzu. Der Pfeil zeigt, wie sie geht und wofür sie gut ist.</p>
    <div class="card yg-pick">${mobSearchInput()}${mobListHtml(day)}</div>
    <button class="btn primary" data-action="mob-pick-done" data-rt="1">✔ Fertig (${n} ${n === 1 ? 'Übung' : 'Übungen'})</button>`;
  return `<p class="hint explain">${sess ? 'Antippen ＋ fügt die Übung zu deiner Mobility-Einheit hinzu.' : `Antippen ＋ fügt die Übung zu „${esc(day.name)}“ hinzu.`} Der Pfeil zeigt, wie sie geht und wofür sie gut ist.</p>
    <div class="card yg-pick">${mobSearchInput()}${mobListHtml(day)}</div>
    <button class="btn primary" data-action="mob-pick-done" ${sess ? 'data-sess="1"' : `data-day="${day.id}"`}>✔ Fertig (${n} ${n === 1 ? 'Übung' : 'Übungen'})</button>`;
}

/* ----- Plan: Bereich je Trainingstag ----- */
function mobRowHtml(m, i, k, tools, extra = '') {
  const x = MOB_BY_ID.get(m.id), det = mobOpenEx === `${k}|${m.id}`;
  return `<li class="mob-row ${det ? 'open' : ''}"><div class="mob-row-top">
      <button class="mob-name" data-action="mob-info" data-k="${k}|${m.id}" aria-expanded="${det}"><span class="mob-name-t"><b>${esc(x.de)}</b>${mobPrefMark(x.id)}</span><small>${esc(mobMeta(x))}</small></button>
      ${tools}</div>${extra}${det ? mobDetail(x) : ''}</li>`;
}
// v358: Stufe des Vorschlags für den ganzen Plan (0–3)
function mobLevelHtml(plan) {
  const l = mobLevel(plan);
  return `<div class="variants plan mob-lvl"><span>Vorschlag der App</span>${MOB_LEVELS.map(([label], k) =>
      `<button class="vchip ${l === k ? 'on' : ''}" data-action="mob-level" data-l="${k}"><b>${k}</b><small>${label}</small></button>`).join('')}</div>
    <p class="hint nut-small">${mobLevelText(l)} Gilt für alle Trainingstage des Plans. Tage, an denen du die Mobility selbst geändert hast, behalten ihre Auswahl.</p>
    ${mobEqLineHtml()}`;
}
function mobPlanHtml(day) {
  const plan = activePlan(), list = mobDay(day, plan), fixed = Array.isArray(day.mob);
  if (!list.length && !fixed && !mobLevel(plan)) {
    return `<div class="card mob-plan mob-plan-off"><div class="mob-plan-head"><h2>🤸 Mobility vor dem Training</h2></div>
      <button class="btn outline mob-add-first" data-action="mob-pick" data-day="${day.id}">＋ Übungen selbst auswählen</button>
      ${mobLevelHtml(plan)}</div>`;
  }
  const rows = list.map((m, i) => mobRowHtml(m, i, 'plan', `<div class="mob-sets">
      <button class="icon-btn" data-action="mob-sets" data-day="${day.id}" data-i="${i}" data-d="-1" ${m.sets <= 1 ? 'disabled' : ''} aria-label="Ein Satz weniger">−</button>
      <span><b>${m.sets}</b><small>${m.sets === 1 ? 'Satz' : 'Sätze'}</small></span>
      <button class="icon-btn" data-action="mob-sets" data-day="${day.id}" data-i="${i}" data-d="1" ${m.sets >= 5 ? 'disabled' : ''} aria-label="Ein Satz mehr">＋</button></div>
      <button class="icon-btn mob-del" data-action="mob-del" data-day="${day.id}" data-i="${i}" aria-label="Entfernen">✕</button>`)).join('');
  return `<div class="card mob-plan"><div class="mob-plan-head"><h2>🤸 Mobility vor dem Training</h2>${list.length ? `<span class="hint">ca. ${mobMinutes(list)} min</span>` : ''}</div>
      ${!fixed && list.length ? '<p class="hint nut-small">Vorschlag der App, passend zu den Übungen dieses Tages. Tippe auf eine Übung für die Beschreibung.</p>' : ''}
      ${list.length ? `<ul class="mob-list">${rows}</ul>` : '<p class="hint nut-small">Keine Mobility-Übungen an diesem Tag.</p>'}
      <div class="mob-btns"><button class="btn small" data-action="mob-pick" data-day="${day.id}">＋ Auswählen</button>
        <button class="btn small" data-action="mob-suggest" data-day="${day.id}">✨ Neu vorschlagen</button></div>
      <p class="hint nut-small">Je Satz rechnet die App etwa ${MOB_MIN} Minute.</p>
      ${mobLevelHtml(plan)}</div>`;
}

/* ----- Training: abhakbarer Block oben ----- */
function mobTrainingHtml() {
  const list = (draft && draft.mob) || [];
  if (!list.length) return '';
  const done = list.filter(m => (m.done || 0) >= m.sets).length, all = done === list.length;
  const open = draft.mobOpen != null ? draft.mobOpen : !all;
  const rows = list.map((m, i) => mobRowHtml(m, i, 'tr', `<div class="mob-checks">${Array.from({ length: m.sets }, (_, k) =>
    `<button class="mob-chk ${k < (m.done || 0) ? 'on' : ''}" data-action="mob-tick" data-i="${i}" data-k="${k}" aria-pressed="${k < (m.done || 0)}"
      aria-label="Satz ${k + 1}">${k < (m.done || 0) ? '✓' : k + 1}</button>`).join('')}</div>`)).join('');
  return `<section class="card mob-tr ${all ? 'done' : ''}">
      <button class="mob-tr-head" data-action="mob-tr-toggle" aria-expanded="${open}"><span>🤸 Mobility</span>
        <small>${all ? 'erledigt ✓' : `${done} von ${list.length} erledigt`} | ca. ${mobMinutes(list)} min</small><span class="chev" aria-hidden="true">${open ? '▴' : '▾'}</span></button>
      ${open ? `<ul class="mob-list">${rows}</ul><p class="hint nut-small">Ruhig und kontrolliert, nur im schmerzfreien Bereich. Abhaken ist freiwillig.</p>` : ''}
    </section>`;
}
// Mobility eines gespeicherten Trainings (Verlauf)
const mobSessionText = s => (s.mob || []).map(m => MOB_BY_ID.get(m.id)).filter(Boolean).map(m => m.de).join(', ');

/* ----- v375: Mobility-Einheit (User-Wunsch 2026-11-24) -----
   Eigene Einheit außerhalb vom Krafttraining, jederzeit startbar wie Cardio (Startseite und Verlauf).
   data.mobDraft = { date, dur: Minuten, focus: 'next'|'full'|'regs', regs: [Region], dayId?, seed, items: [{ id, sets, done }] } – läuft gerade
   data.mobility = [{ id, date, min, focus, regs, dayName?, items: [{ id, sets, done }] }] – gespeicherte Einheiten
   Zusammenstellung (mobSessBuild): Regionen nach Gewicht (nächstes Training wie beim Vorschlag vor dem Training, Ganzkörper fest,
   oder selbst gewählt), je Region abwechselnd Dynamisch, Aktivierung, Halten. Etwa 1 Minute je Satz (MOB_MIN).
   Beschwerden (User-Vorgabe 11.11.: die App dokumentiert nur und stellt nichts um): Stellen mit Beschwerden werden nur markiert,
   mit Hinweis „nur schmerzfrei“ und Verweis auf Ärztin, Arzt oder Physiotherapie. Kalorien werden nicht gezählt (nur 20 bis 30 kcal). */
const MOB_DURS = [10, 15, 20, 30];
const MOB_TYPE_ORDER = ['dyn', 'act', 'hold'];
const MOB_TYPE_SHARE = { dyn: 0.45, act: 0.25, hold: 0.3 };
const MOB_FULL_W = { full: 1, hip: 1.2, tspine: 1, shoulder: 1, ankle: 0.8, spine: 0.8, knee: 0.4, arm: 0.4, neck: 0.4 };
// Beschwerde-Stellen (BODY_AREAS in app.js) → Mobility-Regionen
const MOB_COMPL_REG = { schulter: ['shoulder'], ellenbogen: ['arm'], handgelenk: ['arm'], ruecken: ['spine', 'tspine'], huefte: ['hip'], knie: ['knee'], sprunggelenk: ['ankle'] };
const mobRegLabel = r => (MOB_REGIONS.find(([k]) => k === r) || [, r])[1];
// Region → eingetragene Beschwerde-Stellen (dieser Zyklus und „Zwickt“ der letzten 14 Tage)
function mobComplRegs() {
  const areas = new Set(typeof currentComplaints === 'function' ? currentComplaints() || [] : []);
  const from = addDaysISO(todayISO(), -14);
  for (const z of data.painLog || []) if (z.area && localDay(z.date) >= from) areas.add(z.area);
  const out = new Map();
  for (const a of areas) for (const r of MOB_COMPL_REG[a] || []) out.set(r, [...(out.get(r) || []), BODY_AREAS[a].label]);
  return out;
}
// nächstes Training: läuft eins, dann dieses, sonst der nächste offene Tag des Durchlaufs (wie auf der Startseite)
function mobNextDay() {
  try {
    if (!activePlan() || !data.days.length) return null;
    const has = d => d && (d.exercises || []).some(e => (e.name || '').trim());
    if (draft && has(findDay(draft.dayId))) return findDay(draft.dayId);
    const ci = cycleInfo(), open = new Set(roundOpen(ci.cycleStart, ci.week).map(x => x.day.id));
    const last = sessionsNewestFirst().find(s => findDay(s.dayId)), from = last ? data.days.indexOf(findDay(last.dayId)) + 1 : 0;
    return data.days.map((_, i) => data.days[(from + i) % data.days.length]).find(d => open.has(d.id) && has(d)) || null;
  } catch (e) { return null; }
}
const mobHash = (str, seed) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, seed >>> 0 || 7) % 1000 / 1000;
// Gewicht je Region
function mobSessWeights(f, exs) {
  if (f.focus === 'regs' && f.regs.length) return Object.fromEntries(f.regs.map(r => [r, 1]));
  if (f.focus === 'next' && exs && exs.length) {
    const w = {};
    for (const ex of exs) for (const [r, v] of Object.entries(ex.need)) w[r] = (w[r] || 0) + ex.w * v;
    const max = Math.max(...Object.values(w), 0);
    if (max > 0) { for (const r in w) w[r] /= max; return w; }
  }
  return { ...MOB_FULL_W };
}
// Einheit zusammenstellen: [{ id, sets, done: 0 }]
function mobSessBuild(f) {
  const day = f.focus === 'next' ? findDay(f.dayId) : null, exs = day ? mobDayExs(day) : null;
  const W = mobSessWeights(f, exs), eq = mobEqSet() || [];
  const pool = MOB_EX.filter(m => W[m.reg] > 0.05 && mobEqOk(m, eq) && mobSugOk(m));
  const nEx = Math.max(3, Math.round(f.dur * 0.6));
  const val = m => (exs ? mobScoreFor(exs, m) + 0.6 : 0.6 * (mobPref(m.id) > 0 ? MOB_LIKE_W : 1)) * (MOB_TOP.has(m.id) ? MOB_TOP_W : 1) * (0.7 + 0.6 * mobHash(m.id, f.seed));
  const used = new Set(), cnt = {}, tCnt = { dyn: 0, act: 0, hold: 0 }, out = [];
  while (out.length < nEx) {
    // Region nach Höchstzahl-Verfahren (Gewicht / (Anzahl + 1)), nur solange dort noch Übungen frei sind
    const regs = Object.keys(W).filter(r => pool.some(m => m.reg === r && !used.has(m.id)));
    if (!regs.length) break;
    const r = regs.reduce((a, b) => W[b] / ((cnt[b] || 0) + 1) > W[a] / ((cnt[a] || 0) + 1) ? b : a);
    const free = pool.filter(m => m.reg === r && !used.has(m.id));
    // Art: die am weitesten hinter ihrem Anteil liegt und in dieser Region noch frei ist
    const types = MOB_TYPE_ORDER.filter(t => free.some(m => m.type === t))
      .sort((a, b) => (tCnt[a] - MOB_TYPE_SHARE[a] * nEx) - (tCnt[b] - MOB_TYPE_SHARE[b] * nEx));
    const pick = free.filter(m => m.type === types[0]).sort((a, b) => val(b) - val(a))[0];
    used.add(pick.id); cnt[r] = (cnt[r] || 0) + 1; tCnt[pick.type]++;
    out.push(pick);
  }
  // Reihenfolge: Ganzkörper zuerst, dann Dynamisch → Aktivierung → Halten, innerhalb nach Region
  const ord = m => (m.reg === 'full' && m.type !== 'hold' ? -1 : MOB_TYPE_ORDER.indexOf(m.type)) * 100 + MOB_REGIONS.findIndex(([k]) => k === m.reg);
  const items = out.sort((a, b) => ord(a) - ord(b)).map(m => ({ id: m.id, sets: 1, done: 0 }));
  // übrige Minuten als zusätzliche Sätze, zuerst in den wichtigsten Regionen (höchstens 3 je Übung)
  let rest = f.dur - items.length;
  const byW = [...items].sort((a, b) => (W[MOB_BY_ID.get(b.id).reg] || 0) - (W[MOB_BY_ID.get(a.id).reg] || 0));
  for (let k = 0; rest > 0 && byW.length && k < 3 * byW.length; k++) {
    const it = byW[k % byW.length];
    if (it.sets < 3) { it.sets++; rest--; }
  }
  return items;
}
function mobSessFresh() {
  const next = mobNextDay();
  const sm = typeof schedOf === 'function' && schedOf('mob'), dur = sm && sm.min ? MOB_DURS.reduce((a, b) => Math.abs(b - sm.min) < Math.abs(a - sm.min) ? b : a) : 15;  // v377: Dauer aus dem Rhythmus
  const f = { date: todayISO(), dur, focus: next ? 'next' : 'full', regs: [], dayId: next ? next.id : null, seed: Date.now() % 100000, items: [] };
  f.items = mobSessBuild(f);
  return f;
}
// nach geänderten Einstellungen neu zusammenstellen; Abgehaktes bleibt bei Übungen, die wieder dabei sind
function mobSessRebuild(keep = true) {
  const f = data.mobDraft;
  if (!f) return;
  const old = new Map(f.items.map(m => [m.id, m.done || 0]));
  f.items = mobSessBuild(f).map(m => ({ ...m, done: keep ? Math.min(m.sets, old.get(m.id) || 0) : 0 }));
}
const mobSessDone = f => f.items.reduce((a, m) => a + Math.min(m.done || 0, m.sets), 0);
const mobSessSets = f => f.items.reduce((a, m) => a + m.sets, 0);
function mobWeek() {
  const d = new Date(todayISO() + 'T12:00:00'), monday = addDaysISO(todayISO(), -((d.getDay() + 6) % 7));
  const list = (data.mobility || []).filter(x => x.date >= monday && x.date <= todayISO());
  return { n: list.length, min: list.reduce((a, x) => a + (x.min || 0), 0) };
}
function mobStartHtml() {
  const f = data.mobDraft, w = mobWeek();
  return `<button class="btn nav mob-btn" data-action="mobs-open">🤸 Mobility-Einheit
      <small>${f && mobSessDone(f) ? `Läuft: ${mobSessDone(f)} von ${mobSessSets(f)} Sätzen erledigt` : w.n ? `Diese Woche: ${w.n}× | ${w.min} min`
        : 'Beweglichkeit für Hüfte, Schultern, Rücken …, passend zu deinem nächsten Training'}</small></button>`;
}

/* Timer für Halte-Übungen (nur im Speicher): Abschnitte [Sekunden, Text]; bei Übungen je Seite mit Wechsel dazwischen */
let mobTimer = null, mobTimerIv = null;
const MOB_SWITCH_S = 5;
function mobTimerStart(i) {
  const f = data.mobDraft, it = f && f.items[i], m = it && MOB_BY_ID.get(it.id);
  if (!m || m.u !== 's') return;
  const segs = m.side ? [[m.n, 'Erste Seite'], [MOB_SWITCH_S, 'Seite wechseln'], [m.n, 'Zweite Seite']] : [[m.n, m.type === 'hold' ? 'Halten' : 'Los']];
  mobTimer = { i, segs, k: 0, end: Date.now() + segs[0][0] * 1000 };
  try { if (restCfg().sound) restAudio(true); } catch (e) { /* ohne Ton */ }
  clearInterval(mobTimerIv);
  mobTimerIv = setInterval(mobTimerTick, 250);
  render();
}
function mobTimerStop() { mobTimer = null; clearInterval(mobTimerIv); mobTimerIv = null; }
function mobTimerTick() {
  const t = mobTimer;
  if (!t || current.view !== 'mobsess' || !data.mobDraft) { mobTimerStop(); return; }
  const left = t.end - Date.now();
  if (left <= 0) {
    try { restSignal(); } catch (e) { /* ohne Signal */ }
    if (t.k + 1 < t.segs.length) { t.k++; t.end = Date.now() + t.segs[t.k][0] * 1000; render(); return; }
    const it = data.mobDraft.items[t.i];
    if (it && (it.done || 0) < it.sets) it.done = (it.done || 0) + 1;
    mobTimerStop(); saveData(); render();
    return;
  }
  const el = document.getElementById('ms-timer-left');
  if (el) el.textContent = Math.ceil(left / 1000) + ' s';
}

function renderMobSess() {
  if (!data.mobDraft) { data.mobDraft = mobSessFresh(); saveData(); }
  const f = data.mobDraft, next = mobNextDay(), day = f.dayId && findDay(f.dayId);
  if (f.focus === 'next' && !day) f.focus = 'full';
  const compl = mobComplRegs();
  const seg = (act, val, cur, label) => `<button class="${cur === val ? 'on' : ''}" data-action="${act}" data-v="${val}">${label}</button>`;
  const focusOpts = [next || day ? ['next', 'Nächstes Training'] : null, ['full', 'Ganzkörper'], ['regs', 'Regionen wählen']].filter(Boolean);
  let h = (typeof rtSectionHtml === 'function' ? rtSectionHtml('mob') : '') + `<h2 class="yg-log-h">🤸 ${f.focus === 'rt' ? 'Deine Routine' : 'Einheit zusammenstellen'}</h2>`;
  if (f.focus === 'rt') h += `<div class="card ms-setup"><p><b>${esc(f.rname || 'Routine')}</b></p>
      <p class="hint nut-small">Du machst gerade diese Routine. Lieber eine Einheit, die die App für dich zusammenstellt?</p>
      <button class="btn small" data-action="ms-focus" data-v="full">✨ Einheit von der App zusammenstellen</button></div>`;
  else h += `<div class="card ms-setup">
      <p class="lbl">Dauer</p>
      <div class="seg four">${MOB_DURS.map(d => seg('ms-dur', d, f.dur, `${d} min`)).join('')}</div>
      <p class="lbl">Schwerpunkt</p>
      <div class="seg ${focusOpts.length === 3 ? 'three' : 'two'}">${focusOpts.map(([k, l]) => seg('ms-focus', k, f.focus, l)).join('')}</div>
      ${f.focus === 'next' && day ? `<p class="hint nut-small"><span>Passend zu deinem nächsten Training:</span> <b>${esc(day.name)}</b></p>
        <p class="hint nut-small">Vor allem für die Regionen, die die ersten Übungen dort brauchen.</p>` : ''}
      ${f.focus === 'full' ? '<p class="hint nut-small">Ein bisschen von allem, mit Schwerpunkt auf Hüfte, Brustwirbelsäule und Schultern.</p>' : ''}
      ${f.focus === 'regs' ? `<div class="variants ms-regs">${MOB_REGIONS.map(([r, l]) => `<button class="vchip ${f.regs.includes(r) ? 'on' : ''}" data-action="ms-reg" data-r="${r}"
          aria-pressed="${f.regs.includes(r)}"><span>${l}</span>${compl.has(r) ? ' <span aria-hidden="true">🩹</span>' : ''}</button>`).join('')}</div>
        ${f.regs.length ? '' : '<p class="hint nut-small">Tippe eine oder mehrere Regionen an.</p>'}` : ''}
      ${mobEqLineHtml()}
    </div>`;
  if (compl.size) {
    h += `<div class="card hints ms-compl"><p><span>🩹 Beschwerden eingetragen:</span> ${[...new Set([...compl.values()].flat())].map(l => `<span>${esc(l)}</span>`).join(', ')}</p>
      <p>Die App stellt deshalb nichts von sich aus um. Übungen für diese Stellen sind markiert. Mach sie nur im schmerzfreien Bereich und kläre am besten
      mit deiner Ärztin, deinem Arzt oder in der Physiotherapie, welche dir guttun.</p></div>`;
  }
  const done = mobSessDone(f), sets = mobSessSets(f);
  const rows = f.items.map((it, i) => {
    const m = MOB_BY_ID.get(it.id);
    if (!m) return '';
    const run = mobTimer && mobTimer.i === i;
    const checks = `<div class="mob-checks">${Array.from({ length: it.sets }, (_, k) =>
      `<button class="mob-chk ${k < (it.done || 0) ? 'on' : ''}" data-action="ms-tick" data-i="${i}" data-k="${k}" aria-pressed="${k < (it.done || 0)}"
        aria-label="Satz ${k + 1}">${k < (it.done || 0) ? '✓' : k + 1}</button>`).join('')}</div>`;
    const tools = `${checks}<button class="icon-btn" data-action="ms-swap" data-i="${i}" aria-label="Andere Übung">⇄</button>
      <button class="icon-btn mob-del" data-action="ms-del" data-i="${i}" aria-label="Entfernen">✕</button>`;
    const left = run ? Math.max(0, Math.ceil((mobTimer.end - Date.now()) / 1000)) : 0;
    const timer = m.u === 's' && (it.done || 0) < it.sets ? `<div class="ms-timer ${run ? 'run' : ''}">${run
      ? `<span>${mobTimer.segs[mobTimer.k][1]}</span><b id="ms-timer-left">${left} s</b><button class="btn small" data-action="ms-timer-stop">Stopp</button>`
      : `<button class="btn small" data-action="ms-timer" data-i="${i}">▶ Timer ${m.n} s${m.side ? ' je Seite' : ''}</button>`}</div>` : '';
    const warn = compl.has(m.reg) ? `<p class="ms-compl-row"><span>🩹 Beschwerde eingetragen, nur schmerzfrei:</span> ${compl.get(m.reg).map(l => `<span>${esc(l)}</span>`).join(', ')}</p>` : '';
    return mobRowHtml(it, i, 'ms', tools, timer + warn);
  }).join('');
  h += `<div class="card ms-list"><div class="mob-plan-head"><h2>🤸 Deine Einheit</h2><span class="hint">ca. ${mobMinutes(f.items)} min</span></div>
      ${f.items.length ? `${done ? `<p class="hint nut-small">${done} von ${sets} Sätzen erledigt</p>` : ''}<p class="hint nut-small">Reihenfolge: erst lockern, dann aktivieren, am Ende halten.
        Tippe auf eine Übung für die Beschreibung, ⇄ tauscht sie gegen eine andere aus derselben Region.</p>
        <ul class="mob-list">${rows}</ul>` : '<p class="hint nut-small">Noch keine Übungen. Wähle oben einen Schwerpunkt oder füge selbst welche hinzu.</p>'}
      <div class="mob-btns"><button class="btn small" data-action="ms-pick">＋ Übung</button>
        ${f.focus === 'rt' ? '' : '<button class="btn small" data-action="ms-new">✨ Neu vorschlagen</button>'}
        ${f.items.length ? '<button class="btn small" data-action="ms-as-rt">💾 Als Routine speichern</button>' : ''}</div>
      <label class="row"><span>Datum</span><input class="inp date" type="date" data-field="ms-date" value="${f.date}" max="${todayISO()}"></label>
      <div class="row"><button class="btn" data-action="ms-reset">Verwerfen</button>
        <button class="btn primary" data-action="ms-save">✔ Speichern</button></div>
    </div>`;
  h += schedCardHtml('mob');  // v377: Wochenplaner
  const list = [...(data.mobility || [])].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 30);
  h += list.length ? `<h2>Deine Einheiten</h2><ul class="list">${list.map(x => mobEntryRowHtml(x, true)).join('')}</ul>` : '';
  return h + `<p class="hint nut-small explain">${MOB_CARE}</p>`;
}
const mobEntryText = x => (x.items || []).filter(i => i.done).map(i => MOB_BY_ID.get(i.id)).filter(Boolean).map(m => tr(m.de)).join(', ');
const mobEntryInfo = x => `<span>${fmtDate(x.date + 'T12:00:00')}</span> | <span>${x.min} min</span> | ${(x.regs || []).map(r => `<span>${mobRegLabel(r)}</span>`).join(', ')}`;
// gespeicherte Einheit: im Mobility-Bildschirm mit Löschen, sonst als Knopf (Kalendertag)
function mobEntryRowHtml(x, edit = false) {
  if (!edit) return `<button class="btn nav" data-action="mobs-open">🤸 <span>Mobility</span><small>${mobEntryInfo(x)}</small></button>`;
  return `<li class="bw-row cardio-row"><span>🤸 ${x.rname ? esc(x.rname) : '<span>Mobility</span>'}<small class="hint">${mobEntryInfo(x)}</small>
      ${mobEntryText(x) ? `<small class="hint yoga-row-items">${esc(mobEntryText(x))}</small>` : ''}</span>
      <button class="icon-btn danger" data-action="ms-entry-del" data-id="${x.id}" aria-label="Löschen">✕</button></li>`;
}

/* ----- Ansichten und Aktionen ----- */
views.moblib = { title: 'Mobility-Übungen', tab: 'plan', back: p => p && p.day ? ['day', { id: p.day }] : ['library', {}], render: renderMobLib };
views.mobsess = { title: 'Mobility', tab: 'start', back: 'start', render: renderMobSess };
views.mobpick = { title: 'Mobility auswählen', tab: p => p.sess || p.rt ? 'start' : 'plan', back: p => p.rt ? ['rtedit', {}] : p.sess ? ['mobsess', {}] : ['day', { id: p.day }], render: renderMobPick };

Object.assign(actions, {
  'mob-lib': () => { mobQ = ''; go('moblib', {}); },
  'mob-reg': el => { mobOpenReg = mobOpenReg === el.dataset.r ? null : el.dataset.r; render(); },
  'mob-info': el => { mobOpenEx = mobOpenEx === el.dataset.k ? null : el.dataset.k; render(); },
  'mob-pick': el => { mobQ = ''; go('mobpick', { day: el.dataset.day }); },
  'mob-pick-done': el => el.dataset.rt ? go('rtedit', {}) : el.dataset.sess ? go('mobsess', {}) : go('day', { id: el.dataset.day }),
  'mob-toggle': el => {
    if (current.params.rt && rtEdit) {  // v398: eigene Routine
      const l = rtEdit.items, i = l.findIndex(m => m.id === el.dataset.id);
      if (i >= 0) l.splice(i, 1); else l.push({ id: el.dataset.id, sets: 1 });
      render(); return;
    }
    if (current.params.sess) {  // v375: Mobility-Einheit
      const list = data.mobDraft && data.mobDraft.items;
      if (!list) return;
      const i = list.findIndex(m => m.id === el.dataset.id);
      if (i >= 0) list.splice(i, 1); else list.push({ id: el.dataset.id, sets: 1, done: 0 });
      saveData(); render();
      return;
    }
    const day = findDay(current.params.day);
    if (!day) return;
    const list = mobEdit(day), i = list.findIndex(m => m.id === el.dataset.id);
    if (i >= 0) list.splice(i, 1); else list.push({ id: el.dataset.id, sets: 1 });
    saveData(); render();
  },
  'mob-pref': el => {
    const id = el.dataset.id, v = +el.dataset.v, m = MOB_BY_ID.get(id);
    if (!m) return;
    if (!data.mobPref || typeof data.mobPref !== 'object') data.mobPref = {};
    if (mobPref(id) === v) delete data.mobPref[id]; else data.mobPref[id] = v;
    let msg = !mobPref(id) ? 'Bewertung entfernt' : v > 0 ? '👍 Wird bevorzugt vorgeschlagen' : '👎 Wird nicht mehr vorgeschlagen';
    // in der laufenden Mobility-Einheit: noch nicht abgehakt → gleich austauschen
    const f = data.mobDraft, i = v < 0 && f ? f.items.findIndex(x => x.id === id && !(x.done > 0)) : -1;
    if (i >= 0 && mobSessSwap(i)) { msg = '👎 Nicht mehr vorschlagen, in deiner Einheit ausgetauscht'; if (mobOpenEx && mobOpenEx.endsWith('|' + id)) mobOpenEx = null; }
    saveData(); render(); toast(msg);
  },
  'mob-eq-open': () => { mobEqOpen = !mobEqOpen; render(); },
  'mob-eq': el => {
    if (!Array.isArray(data.mobEq)) data.mobEq = [];
    mobEqToggle(data.mobEq, el.dataset.k);
    mobEqOpen = true;
    if (current.view === 'mobsess') mobSessRebuild(true);
    saveData(); render();
  },
  'mob-sets': el => {
    const day = findDay(el.dataset.day);
    if (!day) return;
    const m = mobEdit(day)[+el.dataset.i];
    if (!m) return;
    m.sets = Math.min(5, Math.max(1, (m.sets || 1) + Number(el.dataset.d)));
    saveData(); render();
  },
  'mob-del': el => {
    const day = findDay(el.dataset.day);
    if (!day) return;
    const list = mobEdit(day), m = list[+el.dataset.i], x = m && MOB_BY_ID.get(m.id);
    if (!m || !askOk(`„${x ? x.de : ''}“ aus der Mobility dieses Tages entfernen?`)) return;
    list.splice(+el.dataset.i, 1);
    saveData(); render();
  },
  'mob-suggest': el => {
    const day = findDay(el.dataset.day);
    if (!day) return;
    const sug = mobSuggest(day, MOB_LEVELS[mobLevel() || 2][1]);  // Stufe des Plans, bei 0 wie „Mittel“
    if (!sug.length) { toast('Für einen Vorschlag braucht der Tag erst Übungen.'); return; }
    if (Array.isArray(day.mob) && day.mob.length && !askOk('Die Mobility dieses Tages durch den Vorschlag der App ersetzen?')) return;
    day.mob = sug;
    saveData(); render();
    toast('🤸 Vorschlag übernommen');
  },
  'mob-level': el => {
    const plan = activePlan(), l = Math.min(3, Math.max(0, +el.dataset.l || 0));
    if (!plan || mobLevel(plan) === l) return;
    plan.mob = l;
    saveData(); render();
  },
  'mob-tr-toggle': () => {
    const list = draft.mob || [], all = list.every(m => (m.done || 0) >= m.sets);
    draft.mobOpen = !(draft.mobOpen != null ? draft.mobOpen : !all);
    saveDraft(); render();
  },
  'mob-tick': el => {
    const m = draft.mob[+el.dataset.i], k = +el.dataset.k;
    if (!m) return;
    m.done = k < (m.done || 0) ? k : k + 1;
    if (draft.mob.every(x => (x.done || 0) >= x.sets)) draft.mobOpen = null;  // alles erledigt: klappt zu
    saveDraft(); render();
  },
});
fields['mob-q'] = el => {  // wie die Yoga-Suche: nur ein- und ausblenden, das Feld behält den Fokus
  mobQ = el.value;
  const q = mobQ.trim().toLowerCase();
  let any = false;
  $view.querySelectorAll('.yg-cat').forEach(c => {
    let hit = false;
    c.querySelectorAll('.yg-pose').forEach(p => { const on = !q || p.dataset.s.includes(q); p.hidden = !on; if (on) hit = true; });
    c.querySelector('.yg-poses').hidden = q ? !hit : mobOpenReg !== c.dataset.c;
    c.hidden = !!q && !hit;
    if (hit) any = true;
  });
  const none = $view.querySelector('.yg-none');
  if (none) none.hidden = !q || any;
};

/* v375: Mobility-Einheit */
// Übung i gegen eine andere aus derselben Region tauschen (gleiche Art zuerst, 👍 vorn, 👎 nie); false = keine da
function mobSessSwap(i) {
  const f = data.mobDraft, it = f && f.items[i], m = it && MOB_BY_ID.get(it.id);
  if (!m) return false;
  const inList = new Set(f.items.map(x => x.id)), eq = mobEqSet() || [];
  const same = MOB_EX.filter(x => x.reg === m.reg && !inList.has(x.id) && mobEqOk(x, eq) && mobSugOk(x));
  const alt = [...same.filter(x => x.type === m.type), ...same.filter(x => x.type !== m.type)]
    .map((x, k) => [x, k]).sort((a, b) => mobPref(b[0].id) - mobPref(a[0].id) || a[1] - b[1]).map(([x]) => x);
  if (!alt.length) return false;
  f.swap = (f.swap || 0) + 1;
  f.items[i] = { id: alt[f.swap % Math.min(alt.length, 3)].id, sets: it.sets, done: 0 };
  if (mobTimer && mobTimer.i === i) mobTimerStop();
  return true;
}
const mobSessDirty = () => data.mobDraft && mobSessDone(data.mobDraft) > 0;
Object.assign(actions, {
  'mobs-open': () => { mobEqOpen = false; go('mobsess', {}); },
  'ms-dur': el => { data.mobDraft.dur = +el.dataset.v; mobSessRebuild(); saveData(); render(); },
  'ms-focus': el => {
    const f = data.mobDraft;
    f.focus = el.dataset.v;
    if (f.focus === 'next') { const d = mobNextDay(); f.dayId = d ? d.id : f.dayId; }
    if (f.focus === 'regs' && !f.regs.length) { f.items = f.items.filter(m => (m.done || 0) > 0); saveData(); render(); return; }
    mobSessRebuild(); saveData(); render();
  },
  'ms-reg': el => { const f = data.mobDraft; mobEqToggle(f.regs, el.dataset.r); mobSessRebuild(); saveData(); render(); },
  'ms-new': () => {
    const f = data.mobDraft;
    if (mobSessDirty() && !askOk('Neu zusammenstellen? Abgehakte Übungen, die wieder dabei sind, bleiben abgehakt.')) return;
    f.seed = (f.seed * 7 + 13) % 100000;
    mobTimerStop(); mobSessRebuild(); saveData(); render();
  },
  'ms-tick': el => {
    const it = data.mobDraft.items[+el.dataset.i], k = +el.dataset.k;
    if (!it) return;
    it.done = k < (it.done || 0) ? k : k + 1;
    saveData(); render();
  },
  'ms-swap': el => {
    if (!mobSessSwap(+el.dataset.i)) { toast('Für diese Region gibt es keine weitere passende Übung.'); return; }
    saveData(); render();
  },
  'ms-del': el => {
    const f = data.mobDraft, i = +el.dataset.i;
    if (!f.items[i]) return;
    if (mobTimer) { if (mobTimer.i === i) mobTimerStop(); else if (mobTimer.i > i) mobTimer.i--; }
    f.items.splice(i, 1);
    saveData(); render();
  },
  'ms-pick': () => { mobQ = ''; go('mobpick', { sess: 1 }); },
  'ms-as-rt': () => {  // v398: aktuelle Einheit als eigene Routine
    const f = data.mobDraft;
    if (!f || !f.items.length) return;
    rtEdit = { k: 'mob', id: null, name: f.focus === 'rt' && f.rname ? `${f.rname} (eigene)` : '', items: f.items.map(m => ({ id: m.id, sets: m.sets || 1 })) };
    go('rtedit', {});
  },
  'ms-timer': el => mobTimerStart(+el.dataset.i),
  'ms-timer-stop': () => { mobTimerStop(); render(); },
  'ms-reset': () => {
    if (mobSessDirty() && !askOk('Diese Einheit verwerfen? Abgehaktes geht verloren.')) return;
    mobTimerStop(); data.mobDraft = null; saveData(); render();
  },
  'ms-save': () => {
    const f = data.mobDraft;
    if (!f || !f.items.length) { alert('Die Einheit hat noch keine Übungen.'); return; }
    if (!mobSessDone(f)) {
      if (!askOk('Du hast noch nichts abgehakt. Die ganze Einheit als erledigt eintragen?')) return;
      f.items.forEach(m => { m.done = m.sets; });
    }
    const items = f.items.map(m => ({ id: m.id, sets: m.sets, done: Math.min(m.done || 0, m.sets) }));
    const regs = [...new Set(items.filter(m => m.done).map(m => MOB_BY_ID.get(m.id).reg))].sort((a, b) =>
      MOB_REGIONS.findIndex(([k]) => k === a) - MOB_REGIONS.findIndex(([k]) => k === b));
    const min = Math.max(1, Math.round(items.reduce((a, m) => a + m.done, 0) * MOB_MIN));
    const day = f.focus === 'next' && f.dayId && findDay(f.dayId);
    const entry = { id: uid(), date: f.date || todayISO(), min, focus: f.focus, regs, items };
    if (f.focus === 'rt' && f.rname) entry.rname = f.rname;  // v398
    if (day) entry.dayName = day.name;
    if (!Array.isArray(data.mobility)) data.mobility = [];
    data.mobility.push(entry);
    mobTimerStop(); data.mobDraft = null;
    saveData();
    toast(`🤸 Mobility eingetragen: ${min} min`);
    render(); window.scrollTo(0, 0);
  },
  'ms-entry-del': el => {
    const x = (data.mobility || []).find(e => e.id === el.dataset.id);
    if (!x || !askOk(`Mobility-Einheit vom ${fmtDate(x.date + 'T12:00:00')} löschen?`)) return;
    data.mobility = data.mobility.filter(e => e !== x);
    saveData(); render();
  },
});
fields['ms-date'] = el => { if (data.mobDraft && /^\d{4}-\d{2}-\d{2}$/.test(el.value)) { data.mobDraft.date = el.value; saveData(); } };
