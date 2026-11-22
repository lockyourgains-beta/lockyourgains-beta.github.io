/* LockYourGains | © 2026 Alex Hundt | Alle Rechte vorbehalten – siehe LICENSE */
/* ---------- Yoga (v344): Einheiten eintragen wie Cardio, Übungsbibliothek, Abläufe, Statistik ----------
   data.yoga = [{ id, date: 'JJJJ-MM-TT', style, level: 'easy'|'mid'|'hard', min, kcal, own, items?: [{ p: Haltung/Ablauf, n?: Durchgänge, s?: Sekunden je Durchgang }] }]
   kcal = Mehrverbrauch gegenüber Ruhe wie bei Cardio: (MET × Faktor − 1) × kg × Stunden (MET nach dem Compendium of Physical Activities:
   Hatha 2,5, Sonnengruß/Vinyasa 3,3, Power 4,0, Nadisodhana/Atmung 2,0). Zählt mit Cardio ins Tagesziel, wenn „einrechnen“ an ist.
   Übungen und Abläufe sind freiwillig; Durchgänge und Zeit je Übung auch. */

const YOGA_STYLES = {
  hatha: { label: 'Hatha', met: 2.5,
    desc: "Klassisch und ruhig: Haltungen einnehmen und einige Atemzüge halten, dazwischen Pausen, oft mit Atemübungen und Entspannung. Gut zum Einstieg und für allgemeine Beweglichkeit." },
  vinyasa: { label: 'Vinyasa / Flow', met: 3.3,
    desc: "Die Haltungen fließen ineinander, jede Bewegung im Takt eines Atemzugs, oft mit Sonnengrüßen. Verbindet Beweglichkeit mit Ausdauer." },
  power: { label: 'Power Yoga', met: 4.0,
    desc: "Sportliche Weiterentwicklung von Vinyasa und Ashtanga mit vielen Kraft-Haltungen wie Brett, Chaturanga, Stuhl und Krieger. Fordert Kraft und Kondition." },
  ashtanga: { label: 'Ashtanga', met: 4.0,
    desc: "Eine feste, immer gleiche Abfolge im selben Atemrhythmus, meist 5 Atemzüge je Haltung. Man lernt die Serie Stück für Stück und sieht den Fortschritt gut." },
  yin: { label: 'Yin Yoga', met: 2.0,
    desc: "Passiv und lang: Haltungen meist im Sitzen oder Liegen 3 bis 5 Minuten halten, die Muskeln bleiben locker. Dehnt Bindegewebe und Gelenke, ein guter Ausgleich zum Krafttraining." },
  restorative: { label: 'Restorative / Entspannung', met: 2.0,
    desc: "Ganz entspannt: Der Körper wird mit Kissen, Decken und Blöcken gestützt, kaum Dehnung, lange Haltezeiten. Für Stressabbau, Erholung und besseren Schlaf." },
  hot: { label: 'Hot Yoga / Bikram', met: 3.5,
    desc: "Im beheizten Raum bei 35 bis 40 °C. Bikram ist eine feste Folge aus 26 Haltungen und 2 Atemübungen in 90 Minuten. Viel trinken, nicht bei Kreislaufproblemen." },
  kundalini: { label: 'Kundalini', met: 2.5,
    desc: "Wiederholte, oft schnelle Bewegungen, viel Atemarbeit wie der Feueratem, dazu Mantras und Meditation. Weniger Haltungen halten, mehr Atmung und Energie." },
  iyengar: { label: 'Iyengar', met: 2.5,
    desc: "Sehr genaue Ausrichtung mit Hilfsmitteln wie Gurten, Blöcken und Stühlen, die Haltungen werden länger gehalten und korrigiert. Gut für Haltung, Technik und den Rücken." },
  nidra: { label: 'Yoga Nidra / Meditation', met: 1.3,
    desc: "Angeleitete Tiefenentspannung im Liegen oder Meditation im Sitzen, ohne Haltungen. Für Entspannung, Schlaf und Konzentration." },
  other: { label: 'Sonstiges', met: 2.5,
    desc: "Für alles, was in keinen der anderen Stile passt, z. B. Mischformen oder Yoga mit Partner." },
};
const YOGA_LEVELS = { easy: { label: 'Sanft', f: 0.85 }, mid: { label: 'Mittel', f: 1 }, hard: { label: 'Fordernd', f: 1.2 } };
const YOGA_CATS = [['warm', 'Aufwärmen und Mobilisation'], ['stand', 'Stehhaltungen'], ['balance', 'Gleichgewicht'], ['back', 'Rückbeugen'],
  ['fold', 'Vorbeugen'], ['twist', 'Drehungen'], ['hip', 'Hüftöffner'], ['seat', 'Sitzhaltungen'], ['arm', 'Armbalancen'], ['inv', 'Umkehrhaltungen'],
  ['core', 'Kraft und Körpermitte'], ['floor', 'Rücken- und Bauchlage'], ['yin', 'Yin und Entspannung'], ['breath', 'Atmung und Meditation']];
const YOGA_LVL = ['', 'Anfänger', 'Mittelstufe', 'Fortgeschrittene'];

// Haltungen: { id, cat, de, sa (Sanskrit), lvl 1–3, side (je Seite), unit 's' Sekunden | 'r' Runden, hold (Richtwert), how, eff }
// <<POSEN
const YOGA_POSES = [
  { id: "catcow", cat: "warm", de: "Katze-Kuh", sa: "Marjaryasana Bitilasana", lvl: 1, side: false, unit: "r", hold: 8,
    how: "Im Vierfüßlerstand beginnen, Hände unter den Schultern, Knie unter den Hüften. Einatmend den Bauch sinken lassen und Brustbein und Blick heben, ausatmend den Rücken rund machen und das Kinn zur Brust ziehen. Die Bewegung fließend mit dem Atem verbinden.",
    eff: "Mobilisiert die ganze Wirbelsäule sanft und wärmt den Rücken auf." },
  { id: "tabletop", cat: "warm", de: "Vierfüßlerstand (Tisch)", sa: "Bharmanasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "Hände schulterbreit unter die Schultern setzen, Knie hüftbreit unter die Hüften. Den Rücken lang und neutral halten, der Blick geht zum Boden zwischen den Händen. Den Bauch leicht anspannen und ruhig atmen.",
    eff: "Ausgangshaltung für viele Übungen, stärkt Rumpf und Schultern." },
  { id: "threadneedle", cat: "warm", de: "Fadenöhr im Vierfüßlerstand", sa: "Parsva Balasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Aus dem Vierfüßlerstand einen Arm unter dem anderen hindurch zur Seite schieben, bis Schulter und Schläfe auf dem Boden liegen. Die Hüften bleiben über den Knien. Ruhig in die Dehnung zwischen den Schulterblättern atmen.",
    eff: "Dehnt Schultern und oberen Rücken und dreht die Brustwirbelsäule sanft." },
  { id: "birddog", cat: "warm", de: "Vogel-Hund", sa: "Dandayamana Bharmanasana", lvl: 1, side: true, unit: "r", hold: 8,
    how: "Im Vierfüßlerstand einen Arm nach vorn und das gegenüberliegende Bein nach hinten strecken, bis beide etwa waagerecht sind. Becken und Schultern bleiben gerade, der Bauch ist fest. Kurz halten, ausatmend zurückkommen und die Seite wechseln.",
    eff: "Kräftigt Rumpf, Rücken und Gesäß und schult das Gleichgewicht." },
  { id: "hipcircles", cat: "warm", de: "Hüftkreisen im Vierfüßlerstand", sa: "", lvl: 1, side: false, unit: "r", hold: 8,
    how: "Im Vierfüßlerstand das Becken in großen, langsamen Kreisen bewegen, mal Richtung Fersen, mal Richtung Hände. Die Hände bleiben fest am Boden. Nach einigen Runden die Richtung wechseln.",
    eff: "Lockert Hüften und unteren Rücken und eignet sich gut zum Aufwärmen." },
  { id: "neckstretch", cat: "warm", de: "Nackendehnung im Sitzen", sa: "", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Aufrecht sitzen und den Kopf langsam zur Seite neigen, das Ohr Richtung Schulter. Die gegenüberliegende Schulter sinkt bewusst nach unten. Ohne Druck halten und ruhig atmen.",
    eff: "Löst Verspannungen in Nacken und Schultern, besonders nach langem Sitzen." },
  { id: "shouldercircles", cat: "warm", de: "Schulter- und Armkreisen", sa: "", lvl: 1, side: false, unit: "r", hold: 10,
    how: "Im Stehen oder Sitzen die Schultern in großen Kreisen nach hinten bewegen, danach die gestreckten Arme langsam kreisen lassen. Der Oberkörper bleibt ruhig und aufrecht. Nach einigen Runden die Richtung wechseln.",
    eff: "Macht Schultergelenke beweglich und bereitet auf Stütz- und Armhaltungen vor." },
  { id: "wristmob", cat: "warm", de: "Handgelenk-Mobilisation", sa: "", lvl: 1, side: false, unit: "r", hold: 10,
    how: "Im Vierfüßlerstand die Hände nacheinander mit den Fingern nach vorn, zur Seite und zu den Knien aufsetzen und das Gewicht sanft vor und zurück verlagern. Danach die Handgelenke im Sitzen kreisen lassen. Nur so weit gehen, wie es angenehm ist.",
    eff: "Bereitet die Handgelenke auf Hund, Brett und Armbalancen vor." },
  { id: "palmtree", cat: "warm", de: "Seitbeuge im Stehen (Palme)", sa: "Tiryaka Tadasana", lvl: 1, side: true, unit: "s", hold: 20,
    how: "Hüftbreit stehen, die Arme über den Kopf strecken und die Hände verschränken. Ausatmend den Oberkörper zur Seite neigen, ohne nach vorn oder hinten zu kippen. Einatmend zur Mitte zurückkommen und die Seite wechseln.",
    eff: "Dehnt die seitliche Rumpfmuskulatur und öffnet den Brustkorb für die Atmung." },
  { id: "mountain", cat: "stand", de: "Berghaltung", sa: "Tadasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "Füße hüftbreit oder geschlossen parallel aufstellen und das Gewicht gleichmäßig verteilen. Oberschenkel aktivieren, Steißbein lang Richtung Boden, Scheitel nach oben ziehen. Schultern entspannt, Arme locker neben dem Körper, ruhig atmen.",
    eff: "Schult eine aufrechte Haltung und ist Ausgangspunkt für alle Stehhaltungen." },
  { id: "warrior1", cat: "stand", de: "Krieger I", sa: "Virabhadrasana I", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Aus dem Stand einen großen Schritt nach hinten machen, den hinteren Fuß leicht ausgedreht aufsetzen. Das vordere Knie über dem Knöchel beugen, die Hüften zeigen nach vorn. Die Arme nach oben strecken und die Schultern sinken lassen.",
    eff: "Kräftigt Beine und Gesäß und dehnt Hüftbeuger und Waden." },
  { id: "warrior2", cat: "stand", de: "Krieger II", sa: "Virabhadrasana II", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Die Füße weit auseinander stellen, den vorderen Fuß nach außen drehen, den hinteren leicht nach innen. Das vordere Knie über dem Knöchel beugen und Richtung kleinen Zeh ausrichten. Die Arme auf Schulterhöhe strecken und über die vordere Hand schauen.",
    eff: "Stärkt Beine und Ausdauer und öffnet die Hüften." },
  { id: "reversewarrior", cat: "stand", de: "Umgekehrter Krieger", sa: "Viparita Virabhadrasana", lvl: 1, side: true, unit: "s", hold: 20,
    how: "Aus Krieger II die hintere Hand am hinteren Bein ablegen und den vorderen Arm nach oben und hinten strecken. Das vordere Knie bleibt gebeugt über dem Knöchel. In die gestreckte Seite atmen.",
    eff: "Dehnt die seitliche Rumpfmuskulatur und kräftigt die Beine." },
  { id: "humblewarrior", cat: "stand", de: "Demütiger Krieger", sa: "Baddha Virabhadrasana", lvl: 2, side: true, unit: "s", hold: 20,
    how: "Aus Krieger I die Hände hinter dem Rücken verschränken. Ausatmend den Oberkörper an der Innenseite des vorderen Knies nach vorn und unten sinken lassen, die Arme strecken Richtung Decke. Den Nacken lang lassen und gleichmäßig atmen.",
    eff: "Öffnet Schultern und Brust und dehnt die Hüften intensiv." },
  { id: "sideangle", cat: "stand", de: "Seitwinkelhaltung", sa: "Utthita Parsvakonasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Aus Krieger II den vorderen Unterarm auf dem Oberschenkel ablegen oder die Hand neben den Fuß setzen. Den oberen Arm schräg über das Ohr strecken, sodass eine Linie von der hinteren Ferse bis zu den Fingerspitzen entsteht. Brust Richtung Decke öffnen.",
    eff: "Dehnt die Körperseite und Leisten und kräftigt Beine und Rumpf." },
  { id: "revsideangle", cat: "stand", de: "Gedrehte Seitwinkelhaltung", sa: "Parivrtta Parsvakonasana", lvl: 2, side: true, unit: "s", hold: 30,
    how: "Aus dem hohen Ausfallschritt die Handflächen vor der Brust zusammenlegen und den gegenüberliegenden Ellbogen außen ans vordere Knie bringen. Die Wirbelsäule beim Einatmen verlängern, beim Ausatmen weiter drehen. Das hintere Bein bleibt aktiv gestreckt.",
    eff: "Dreht die Wirbelsäule kräftig und stärkt Beine und Gleichgewicht." },
  { id: "triangle", cat: "stand", de: "Dreieck", sa: "Utthita Trikonasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Füße weit auseinander, vorderer Fuß nach außen gedreht, beide Beine gestreckt ohne die Knie zu überstrecken. Den Oberkörper aus der Hüfte über das vordere Bein verlängern, die untere Hand an Schienbein oder Block, der obere Arm zeigt nach oben. Beide Rumpfseiten lang halten.",
    eff: "Dehnt Beinrückseiten, Leisten und Körperseite und kräftigt die Beine." },
  { id: "revtriangle", cat: "stand", de: "Gedrehtes Dreieck", sa: "Parivrtta Trikonasana", lvl: 2, side: true, unit: "s", hold: 30,
    how: "Die Füße etwas enger als beim Dreieck stellen, die Hüften zeigen nach vorn. Mit langem Rücken nach vorn beugen, die gegenüberliegende Hand neben den vorderen Fuß oder auf einen Block setzen und den Oberkörper aufdrehen. Den oberen Arm nach oben strecken.",
    eff: "Dreht die Wirbelsäule, dehnt die Beinrückseiten und fordert das Gleichgewicht." },
  { id: "chair", cat: "stand", de: "Stuhl", sa: "Utkatasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "Füße hüftbreit, die Knie beugen und das Gesäß nach hinten schieben, als würde man sich setzen. Die Knie bleiben hinter den Zehen, das Gewicht liegt auf den Fersen. Die Arme nach oben strecken und den Rücken lang halten.",
    eff: "Kräftigt Oberschenkel, Gesäß und Rücken." },
  { id: "revchair", cat: "stand", de: "Gedrehter Stuhl", sa: "Parivrtta Utkatasana", lvl: 2, side: true, unit: "s", hold: 20,
    how: "Aus dem Stuhl die Hände vor der Brust zusammenlegen und den Ellbogen außen an den gegenüberliegenden Oberschenkel bringen. Die Knie bleiben auf gleicher Höhe, das Gesäß tief. Beim Ausatmen die Drehung vertiefen.",
    eff: "Kräftigt die Beine und mobilisiert die Wirbelsäule in der Drehung." },
  { id: "pyramid", cat: "stand", de: "Pyramide", sa: "Parsvottanasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Aus dem Stand einen kurzen Schritt nach hinten machen, beide Füße fest am Boden, die Hüften zeigen nach vorn. Mit langem Rücken über das vordere Bein nach vorn beugen, die Hände an Schienbein, Boden oder Blöcken. Das vordere Knie nicht durchdrücken.",
    eff: "Dehnt Beinrückseiten und Waden intensiv und schult die Hüftausrichtung." },
  { id: "widefold", cat: "stand", de: "Breitbeinige Vorbeuge im Stehen", sa: "Prasarita Padottanasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "Die Füße weit und parallel aufstellen, die Hände in die Hüften. Mit langem Rücken aus der Hüfte nach vorn beugen und die Hände zwischen den Füßen aufsetzen. Den Kopf locker hängen lassen und ruhig atmen.",
    eff: "Dehnt Beininnenseiten und Rücken und beruhigt das Nervensystem." },
  { id: "goddess", cat: "stand", de: "Göttin", sa: "Utkata Konasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "Die Füße weit auseinander stellen und die Zehen nach außen drehen. Die Knie über die Zehen beugen und das Becken tief sinken lassen, der Oberkörper bleibt aufrecht. Die Arme im rechten Winkel anwinkeln, Handflächen nach vorn.",
    eff: "Kräftigt Beine und Gesäß und öffnet die Hüften." },
  { id: "highlunge", cat: "stand", de: "Hoher Ausfallschritt", sa: "Ashta Chandrasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Einen großen Schritt nach hinten machen und auf dem hinteren Fußballen bleiben, die hintere Ferse zeigt nach oben. Das vordere Knie über dem Knöchel beugen, das hintere Bein aktiv strecken. Die Arme nach oben strecken und den Rumpf aufrichten.",
    eff: "Kräftigt die Beine, dehnt den Hüftbeuger und schult das Gleichgewicht." },
  { id: "lowlunge", cat: "stand", de: "Tiefer Ausfallschritt", sa: "Anjaneyasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Aus dem Ausfallschritt das hintere Knie auf dem Boden ablegen, eventuell mit Decke darunter. Das Becken nach vorn und unten sinken lassen, das vordere Knie bleibt über dem Knöchel. Die Arme nach oben strecken und den Brustkorb heben.",
    eff: "Dehnt Hüftbeuger und Oberschenkelvorderseite, gut nach langem Sitzen." },
  { id: "skandasana", cat: "stand", de: "Seitlicher Ausfallschritt", sa: "Skandasana", lvl: 2, side: true, unit: "s", hold: 20,
    how: "Aus der breiten Grätsche ein Knie tief beugen, das andere Bein gestreckt lassen und die Zehen nach oben drehen. Das Gesäß Richtung Ferse sinken lassen, die Hände am Boden oder vor der Brust. Den Rücken möglichst lang halten.",
    eff: "Dehnt Beininnenseiten und Leisten und macht die Hüften beweglich." },
  { id: "tree", cat: "balance", de: "Baum", sa: "Vrksasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Auf einem Bein stehen und die Fußsohle des anderen an Wade oder Oberschenkelinnenseite legen, nicht ans Knie. Das gebeugte Knie öffnet sich zur Seite, das Becken bleibt gerade. Die Hände vor der Brust oder über dem Kopf, den Blick auf einen festen Punkt richten.",
    eff: "Schult Gleichgewicht und Konzentration und kräftigt Füße und Beine." },
  { id: "warrior3", cat: "balance", de: "Krieger III", sa: "Virabhadrasana III", lvl: 2, side: true, unit: "s", hold: 20,
    how: "Aus dem hohen Ausfallschritt das Gewicht nach vorn verlagern und das hintere Bein anheben, bis Oberkörper und Bein eine waagerechte Linie bilden. Das Becken bleibt parallel zum Boden, das Standbein leicht gebeugt oder gestreckt. Die Arme nach vorn oder neben den Körper strecken.",
    eff: "Kräftigt Standbein, Gesäß und Rücken und verbessert das Gleichgewicht." },
  { id: "halfmoon", cat: "balance", de: "Halbmond", sa: "Ardha Chandrasana", lvl: 2, side: true, unit: "s", hold: 20,
    how: "Aus dem Dreieck das vordere Knie beugen, die untere Hand etwa eine Handbreit vor den Fuß setzen, gern auf einen Block. Das Standbein strecken und das hintere Bein auf Hüfthöhe heben. Hüfte und Brust zur Seite öffnen, den oberen Arm nach oben strecken.",
    eff: "Fordert Gleichgewicht und Koordination und kräftigt Beine und Rumpf." },
  { id: "revhalfmoon", cat: "balance", de: "Gedrehter Halbmond", sa: "Parivrtta Ardha Chandrasana", lvl: 3, side: true, unit: "s", hold: 20,
    how: "Aus Krieger III die gegenüberliegende Hand unter die Schulter auf den Boden oder einen Block setzen. Das Becken bleibt parallel zum Boden, der Oberkörper dreht sich zum Standbein auf. Den oberen Arm nach oben strecken und gleichmäßig atmen.",
    eff: "Verbindet Drehung und Gleichgewicht und kräftigt Standbein und Rumpf." },
  { id: "eagle", cat: "balance", de: "Adler", sa: "Garudasana", lvl: 2, side: true, unit: "s", hold: 20,
    how: "Die Knie beugen, ein Bein über das andere schlagen und den Fuß wenn möglich hinter die Wade haken. Die Arme vor der Brust überkreuzen, die Ellbogen auf Schulterhöhe. Tief sitzen und den Rücken aufrecht halten.",
    eff: "Dehnt Schultern und oberen Rücken und schult Gleichgewicht und Konzentration." },
  { id: "dancer", cat: "balance", de: "Tänzer", sa: "Natarajasana", lvl: 2, side: true, unit: "s", hold: 20,
    how: "Auf einem Bein stehen, das andere Knie beugen und den Fuß mit der gleichen Hand von innen fassen. Den Fuß in die Hand drücken und den Oberkörper langsam nach vorn neigen, der freie Arm zeigt nach vorn. Beide Hüften bleiben nach vorn ausgerichtet.",
    eff: "Öffnet Brust und Hüftbeuger und fördert Gleichgewicht und Kraft." },
  { id: "handtotoe", cat: "balance", de: "Stehende Hand-zum-großen-Zeh-Haltung", sa: "Utthita Hasta Padangusthasana", lvl: 3, side: true, unit: "s", hold: 20,
    how: "Auf einem Bein stehen, das andere Knie zur Brust ziehen und den großen Zeh mit zwei Fingern fassen. Das Bein langsam nach vorn strecken, eventuell mit einem Gurt. Aufrecht bleiben und das Becken gerade halten.",
    eff: "Dehnt die Beinrückseite und fordert Gleichgewicht und Haltekraft." },
  { id: "standsplit", cat: "balance", de: "Stehender Spagat", sa: "Urdhva Prasarita Eka Padasana", lvl: 2, side: true, unit: "s", hold: 20,
    how: "Aus der stehenden Vorbeuge die Hände neben den Fuß oder auf Blöcke setzen und ein Bein nach hinten oben heben. Das Becken bleibt möglichst gerade, der Kopf hängt locker. Das Standbein nicht durchdrücken.",
    eff: "Dehnt die Beinrückseiten intensiv und kräftigt das Standbein." },
  { id: "sugarcane", cat: "balance", de: "Zuckerrohr", sa: "Ardha Chandra Chapasana", lvl: 3, side: true, unit: "s", hold: 15,
    how: "Aus dem Halbmond das obere Bein beugen und den Fuß mit der oberen Hand fassen. Den Fuß in die Hand drücken, sodass sich die Brust weiter öffnet. Die untere Hand bleibt stabil auf dem Boden oder einem Block.",
    eff: "Verbindet Gleichgewicht mit einer Dehnung von Oberschenkel und Hüftbeuger." },
  { id: "figurefour", cat: "balance", de: "Einbeiniger Stuhl", sa: "Eka Pada Utkatasana", lvl: 2, side: true, unit: "s", hold: 20,
    how: "Auf einem Bein stehen und den anderen Knöchel über das Standbein-Knie legen. Das Standbein beugen und das Gesäß nach hinten schieben wie beim Stuhl. Die Hände vor der Brust zusammenlegen und den Rücken lang halten.",
    eff: "Dehnt die äußere Hüfte und das Gesäß und kräftigt das Standbein." },
  { id: "cobra", cat: "back", de: "Kobra", sa: "Bhujangasana", lvl: 1, side: false, unit: "s", hold: 20,
    how: "In Bauchlage die Hände unter die Schultern setzen, die Ellbogen eng am Körper. Einatmend Kopf und Brust anheben, die Kraft kommt aus dem Rücken, die Hände stützen nur leicht. Schultern weg von den Ohren, Schambein bleibt am Boden.",
    eff: "Kräftigt die Rückenmuskulatur und öffnet die Brust." },
  { id: "sphinx", cat: "back", de: "Sphinx", sa: "Salamba Bhujangasana", lvl: 1, side: false, unit: "s", hold: 60,
    how: "In Bauchlage die Unterarme parallel aufsetzen, die Ellbogen unter den Schultern. Die Brust sanft nach vorn und oben ziehen, die Beine liegen entspannt. Den Nacken lang halten und ruhig atmen.",
    eff: "Sanfte Rückbeuge, die den unteren Rücken mobilisiert und die Brust öffnet." },
  { id: "updog", cat: "back", de: "Heraufschauender Hund", sa: "Urdhva Mukha Svanasana", lvl: 2, side: false, unit: "s", hold: 10,
    how: "Aus der Bauchlage die Hände neben der Taille aufsetzen und die Arme strecken, sodass Oberschenkel und Knie vom Boden abheben. Die Fußrücken drücken in den Boden, die Schultern ziehen nach hinten unten. Die Brust nach vorn öffnen.",
    eff: "Kräftigt Arme und Rücken und dehnt Brust, Bauch und Hüftbeuger." },
  { id: "locust", cat: "back", de: "Heuschrecke", sa: "Salabhasana", lvl: 1, side: false, unit: "s", hold: 20,
    how: "In Bauchlage die Arme neben dem Körper ablegen, die Handflächen zeigen nach unten. Einatmend Kopf, Brust, Arme und Beine gleichzeitig anheben, die Beine bleiben gestreckt. Der Nacken bleibt lang, der Blick geht zum Boden.",
    eff: "Kräftigt die gesamte Rückseite des Körpers von Nacken bis Beine." },
  { id: "bow", cat: "back", de: "Bogen", sa: "Dhanurasana", lvl: 2, side: false, unit: "s", hold: 20,
    how: "In Bauchlage die Knie beugen und die Fußgelenke von außen fassen. Einatmend die Füße in die Hände drücken, dadurch heben sich Brust und Oberschenkel vom Boden. Die Knie nicht weiter als hüftbreit öffnen und gleichmäßig atmen.",
    eff: "Öffnet Brust und Schultern intensiv und kräftigt den Rücken." },
  { id: "bridge", cat: "back", de: "Brücke", sa: "Setu Bandha Sarvangasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "In Rückenlage die Füße hüftbreit nah am Gesäß aufstellen, die Arme liegen neben dem Körper. Einatmend das Becken anheben, die Knie zeigen nach vorn. Die Schultern unter dem Körper zusammenziehen und den Nacken entspannt lassen.",
    eff: "Kräftigt Gesäß und Rückseite der Beine und öffnet die Brust." },
  { id: "wheel", cat: "back", de: "Rad", sa: "Urdhva Dhanurasana", lvl: 3, side: false, unit: "s", hold: 15,
    how: "In Rückenlage die Füße nah am Gesäß aufstellen und die Hände mit den Fingern zu den Schultern neben den Ohren aufsetzen. Einatmend Becken und Brust heben und die Arme strecken. Füße und Knie bleiben parallel, nur mit gut aufgewärmtem Rücken üben.",
    eff: "Intensive Rückbeuge, die Schultern, Arme und Beine kräftigt; bei Rücken- oder Handgelenkproblemen weglassen." },
  { id: "camel", cat: "back", de: "Kamel", sa: "Ustrasana", lvl: 2, side: false, unit: "s", hold: 20,
    how: "Hüftbreit knien, die Hüften über den Knien, die Hände im unteren Rücken. Einatmend die Brust heben und langsam nach hinten beugen, eventuell die Hände zu den Fersen führen. Das Becken bleibt vorn, der Nacken lang.",
    eff: "Öffnet Brust, Bauch und Hüftbeuger kräftig; bei Nackenproblemen den Kopf nicht nach hinten fallen lassen." },
  { id: "fish", cat: "back", de: "Fisch", sa: "Matsyasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "In Rückenlage die Hände mit den Handflächen nach unten unter das Gesäß schieben. Auf die Unterarme stützen, die Brust anheben und den Scheitel sanft auf dem Boden ablegen, ohne Gewicht auf den Kopf zu geben. Tief in den Brustkorb atmen.",
    eff: "Öffnet Brust und Hals und gleicht Schulterstand und Pflug aus." },
  { id: "reversetable", cat: "back", de: "Umgekehrter Tisch", sa: "Ardha Purvottanasana", lvl: 1, side: false, unit: "s", hold: 20,
    how: "Im Sitzen die Füße hüftbreit aufstellen und die Hände hinter dem Gesäß aufsetzen, die Finger zeigen nach vorn. Einatmend das Becken heben, bis Rumpf und Oberschenkel waagerecht sind. Die Knie stehen über den Knöcheln, der Nacken bleibt entspannt.",
    eff: "Kräftigt Arme, Gesäß und Rückseite und öffnet Schultern und Brust." },
  { id: "upwardplank", cat: "back", de: "Schiefe Ebene", sa: "Purvottanasana", lvl: 2, side: false, unit: "s", hold: 20,
    how: "Im Sitzen mit gestreckten Beinen die Hände hinter dem Gesäß aufsetzen, die Finger zeigen zu den Füßen. Einatmend das Becken heben, bis der Körper eine gerade Linie bildet, die Fußsohlen drücken Richtung Boden. Die Brust öffnen und den Kopf nur so weit sinken lassen, wie es für den Nacken angenehm ist.",
    eff: "Kräftigt Arme, Rücken und Beine und dehnt die Vorderseite des Körpers." },
  { id: "wildthing", cat: "back", de: "Wilde Sache", sa: "Camatkarasana", lvl: 2, side: true, unit: "s", hold: 15,
    how: "Aus dem Seitstütz das obere Bein nach hinten führen und den Fuß hinter dem Körper aufsetzen, das Knie leicht gebeugt. Das Becken heben und den oberen Arm über den Kopf strecken. Die Brust öffnet sich zur Decke.",
    eff: "Öffnet Brust und Hüftbeuger und kräftigt Schultern und Arme." },
  { id: "kingpigeon", cat: "back", de: "Königstaube", sa: "Eka Pada Rajakapotasana", lvl: 3, side: true, unit: "s", hold: 20,
    how: "Aus der Taubenhaltung das hintere Knie beugen und den Fuß mit einer oder beiden Händen über dem Kopf fassen, eventuell mit Gurt. Die Brust heben und den Rücken aus der Mitte der Wirbelsäule beugen. Nur mit offenen Hüften und aufgewärmtem Rücken üben.",
    eff: "Sehr intensive Rückbeuge mit Dehnung von Hüftbeuger, Oberschenkel und Schultern." },
  { id: "puppy", cat: "back", de: "Welpe", sa: "Uttana Shishosana", lvl: 1, side: false, unit: "s", hold: 45,
    how: "Aus dem Vierfüßlerstand die Hände nach vorn wandern lassen, die Hüften bleiben über den Knien. Stirn oder Brust Richtung Boden sinken lassen, die Arme bleiben aktiv gestreckt. In den oberen Rücken atmen.",
    eff: "Dehnt Schultern und Brustwirbelsäule und öffnet den Brustkorb." },
  { id: "standfold", cat: "fold", de: "Stehende Vorbeuge", sa: "Uttanasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "Aus dem Stand mit langem Rücken aus der Hüfte nach vorn beugen und Oberkörper und Kopf hängen lassen. Die Knie dürfen gebeugt sein, die Hände liegen auf dem Boden oder an den Schienbeinen. Ruhig weiteratmen und mit jeder Ausatmung etwas tiefer sinken.",
    eff: "Dehnt die Beinrückseiten und den Rücken und beruhigt das Nervensystem." },
  { id: "halffold", cat: "fold", de: "Halbe Vorbeuge", sa: "Ardha Uttanasana", lvl: 1, side: false, unit: "s", hold: 15,
    how: "Aus der stehenden Vorbeuge die Hände an die Schienbeine oder Oberschenkel legen und den Rücken lang machen, bis er etwa waagerecht ist. Das Brustbein nach vorn schieben, der Nacken bleibt in Verlängerung der Wirbelsäule. Mit der Einatmung strecken, mit der Ausatmung zurück in die Vorbeuge.",
    eff: "Kräftigt die Rückenstrecker und dehnt die Beinrückseiten." },
  { id: "seatedfold", cat: "fold", de: "Sitzende Vorbeuge", sa: "Paschimottanasana", lvl: 1, side: false, unit: "s", hold: 60,
    how: "Im Sitzen die Beine nach vorn ausstrecken, die Füße zeigen nach oben. Mit der Einatmung lang werden und mit der Ausatmung aus der Hüfte nach vorn beugen, die Hände greifen Schienbeine, Füße oder einen Gurt. Bei steifen Beinrückseiten die Knie leicht beugen.",
    eff: "Dehnt die gesamte Körperrückseite und wirkt beruhigend." },
  { id: "headtoknee", cat: "fold", de: "Kopf-zum-Knie-Haltung", sa: "Janu Sirsasana", lvl: 1, side: true, unit: "s", hold: 45,
    how: "Im Sitzen ein Bein ausstrecken und den anderen Fuß an die Innenseite des gestreckten Oberschenkels legen. Den Oberkörper zum gestreckten Bein ausrichten, lang werden und mit der Ausatmung über das Bein nach vorn beugen. Danach die Seite wechseln.",
    eff: "Dehnt Beinrückseite und unteren Rücken und öffnet sanft die Hüfte." },
  { id: "revheadtoknee", cat: "fold", de: "Gedrehte Kopf-zum-Knie-Haltung", sa: "Parivrtta Janu Sirsasana", lvl: 2, side: true, unit: "s", hold: 30,
    how: "Im Sitzen ein Bein zur Seite ausstrecken, den anderen Fuß an den Oberschenkel legen. Den Oberkörper zur Seite über das gestreckte Bein neigen, der untere Arm liegt innen am Bein, der obere Arm streckt sich über das Ohr zum Fuß. Den Brustkorb zur Decke drehen und in die obere Flanke atmen.",
    eff: "Dehnt die Körperseite, die Beininnenseite und öffnet den Brustkorb." },
  { id: "wideseatedfold", cat: "fold", de: "Breitbeinige Vorbeuge im Sitzen", sa: "Upavistha Konasana", lvl: 2, side: false, unit: "s", hold: 60,
    how: "Im Sitzen die Beine weit grätschen, die Kniescheiben zeigen nach oben. Mit langem Rücken die Hände vor dem Körper nach vorn wandern lassen und aus der Hüfte beugen. Nur so weit gehen, wie der Rücken lang bleibt.",
    eff: "Dehnt Beininnenseiten und Beinrückseiten und mobilisiert die Hüfte." },
  { id: "tortoise", cat: "fold", de: "Schildkröte", sa: "Kurmasana", lvl: 3, side: false, unit: "s", hold: 30,
    how: "Im Sitzen die Beine etwas mehr als hüftbreit aufstellen und den Oberkörper zwischen den Beinen nach vorn bringen. Die Arme unter den Knien zur Seite ausstrecken und die Beine langsam strecken, bis Brust und Schultern Richtung Boden sinken. Nur mit gut aufgewärmtem Körper üben.",
    eff: "Tiefe Dehnung für Rücken, Hüfte und Beinrückseiten, wirkt stark beruhigend." },
  { id: "rabbit", cat: "fold", de: "Hase", sa: "Sasangasana", lvl: 2, side: false, unit: "s", hold: 30,
    how: "Im Fersensitz die Fersen mit den Händen greifen und den Kopf vor den Knien auf den Boden legen. Das Gesäß anheben, bis der Scheitel aufliegt und der Rücken rund wird. Das Gewicht bleibt überwiegend in den Händen, nicht auf dem Kopf.",
    eff: "Dehnt Rücken und Nacken und regt die Durchblutung des Kopfes an." },
  { id: "halfboundlotusfold", cat: "fold", de: "Halbe gebundene Lotus-Vorbeuge", sa: "Ardha Baddha Padma Paschimottanasana", lvl: 3, side: true, unit: "s", hold: 30,
    how: "Im Sitzen einen Fuß in die Leiste des gestreckten Beins legen und mit der Hand derselben Seite hinter dem Rücken den Fuß greifen. Mit der anderen Hand den Fuß des gestreckten Beins fassen und mit langem Rücken nach vorn beugen. Nur üben, wenn der halbe Lotus schmerzfrei für das Knie ist.",
    eff: "Öffnet Hüfte und Schultern und dehnt die Beinrückseite." },
  { id: "foldclasp", cat: "fold", de: "Stehende Vorbeuge mit verschränkten Händen", sa: "Uttanasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "Im Stand die Hände hinter dem Rücken verschränken und die Schulterblätter zusammenziehen. Mit leicht gebeugten Knien nach vorn beugen und die Arme Richtung Decke und über den Kopf sinken lassen. Langsam wieder aufrollen.",
    eff: "Öffnet Schultern und Brust und dehnt die Beinrückseiten." },
  { id: "halflordfishes", cat: "twist", de: "Drehsitz", sa: "Ardha Matsyendrasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Im Sitzen ein Bein anwinkeln und den Fuß außen neben das andere Knie stellen, das untere Bein kann gestreckt oder angewinkelt sein. Mit der Einatmung lang werden, mit der Ausatmung zum aufgestellten Knie drehen und den Ellbogen außen ans Knie legen. Die Drehung beginnt im Bauch, der Kopf folgt zuletzt.",
    eff: "Mobilisiert die Brustwirbelsäule und massiert die Bauchorgane." },
  { id: "marichi1", cat: "twist", de: "Marichyasana I", sa: "Marichyasana I", lvl: 2, side: true, unit: "s", hold: 30,
    how: "Im Sitzen ein Bein strecken und das andere Knie anwinkeln, der Fuß steht nahe am Gesäß. Den Arm derselben Seite vorn um das Schienbein legen und hinter dem Rücken die andere Hand greifen. Mit langem Rücken über das gestreckte Bein nach vorn beugen.",
    eff: "Dehnt Rücken und Schultern und massiert den Bauchraum." },
  { id: "marichi3", cat: "twist", de: "Marichyasana III", sa: "Marichyasana III", lvl: 2, side: true, unit: "s", hold: 30,
    how: "Im Sitzen ein Bein strecken und das andere Knie aufstellen, der Fuß steht nahe am Gesäß. Zum aufgestellten Knie drehen und den gegenüberliegenden Arm außen am Knie anlegen oder um das Knie binden. Aufrecht bleiben und mit jeder Ausatmung etwas weiter drehen.",
    eff: "Kräftige Drehung, die die Wirbelsäule mobilisiert und die Verdauung anregt." },
  { id: "easytwist", cat: "twist", de: "Einfache Drehung im Schneidersitz", sa: "Parivrtta Sukhasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Im Schneidersitz aufrecht sitzen, eine Hand auf das gegenüberliegende Knie und die andere hinter das Gesäß legen. Mit der Einatmung lang werden, mit der Ausatmung sanft drehen. Danach zur anderen Seite.",
    eff: "Sanfte Mobilisation der Wirbelsäule, gut zum Aufwärmen und Abschließen." },
  { id: "supinetwist", cat: "twist", de: "Liegende Drehung", sa: "Supta Matsyendrasana", lvl: 1, side: true, unit: "s", hold: 60,
    how: "In Rückenlage ein Knie zur Brust ziehen und über den Körper zur anderen Seite sinken lassen. Die Arme liegen ausgebreitet, beide Schultern bleiben möglichst am Boden. Den Blick zur Gegenseite richten und entspannt atmen.",
    eff: "Entspannt den unteren Rücken und dehnt Gesäß und Brustkorb." },
  { id: "reclinedtwist", cat: "twist", de: "Bauchdrehung mit gestreckten Beinen", sa: "Jathara Parivartanasana", lvl: 2, side: true, unit: "r", hold: 6,
    how: "In Rückenlage die Arme seitlich ausbreiten und die gestreckten Beine senkrecht nach oben heben. Mit der Ausatmung die Beine langsam zu einer Seite sinken lassen, ohne dass die Schultern abheben, und mit der Einatmung zurück zur Mitte. Leichter wird es mit gebeugten Knien.",
    eff: "Kräftigt die schrägen Bauchmuskeln und mobilisiert die Wirbelsäule." },
  { id: "revlowlunge", cat: "twist", de: "Gedrehter tiefer Ausfallschritt", sa: "Parivrtta Anjaneyasana", lvl: 2, side: true, unit: "s", hold: 30,
    how: "Aus dem tiefen Ausfallschritt mit abgelegtem hinterem Knie die Hände vor der Brust zusammenlegen. Zum vorderen Bein drehen und den gegenüberliegenden Ellbogen außen ans vordere Knie legen. Das Becken bleibt tief, die Brust öffnet sich zur Seite.",
    eff: "Dehnt Hüftbeuger und mobilisiert die Brustwirbelsäule." },
  { id: "bharadvaja", cat: "twist", de: "Bharadvajasana", sa: "Bharadvajasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Im Sitzen beide Unterschenkel zu einer Seite legen, so dass die Füße neben dem Gesäß liegen. Zur Gegenseite drehen, eine Hand ans Knie und die andere hinter den Körper legen. Aufrecht bleiben und ruhig atmen.",
    eff: "Sanfte Drehung für Wirbelsäule und Schultern, gut bei steifem Rücken." },
  { id: "heelstwist", cat: "twist", de: "Drehung im Fersensitz", sa: "Parivrtta Vajrasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Im Fersensitz aufrecht sitzen, eine Hand auf das gegenüberliegende Knie und die andere hinter den Körper legen. Mit der Ausatmung drehen und über die Schulter blicken. Danach die Seite wechseln.",
    eff: "Mobilisiert die Wirbelsäule und ist für fast alle gut machbar." },
  { id: "halfpigeon", cat: "hip", de: "Halbe Taube", sa: "Eka Pada Rajakapotasana (Vorbereitung)", lvl: 2, side: true, unit: "s", hold: 60,
    how: "Aus dem Vierfüßlerstand ein Knie hinter das gleichseitige Handgelenk bringen, der Unterschenkel liegt schräg vor dem Körper. Das hintere Bein gerade nach hinten ausstrecken und das Becken gerade ausrichten. Aufrecht bleiben oder den Oberkörper über das vordere Bein sinken lassen.",
    eff: "Öffnet die Hüfte, dehnt Gesäß und Hüftbeuger des hinteren Beins." },
  { id: "lizard", cat: "hip", de: "Eidechse", sa: "Utthan Pristhasana", lvl: 2, side: true, unit: "s", hold: 45,
    how: "Aus dem tiefen Ausfallschritt den vorderen Fuß zum Mattenrand setzen und beide Hände innen neben den Fuß legen. Das hintere Knie kann abgelegt werden, für mehr Tiefe auf die Unterarme gehen. Das Becken sinkt Richtung Boden.",
    eff: "Tiefe Öffnung für Hüftbeuger und Leiste." },
  { id: "boundangle", cat: "hip", de: "Schusterhaltung", sa: "Baddha Konasana", lvl: 1, side: false, unit: "s", hold: 60,
    how: "Im Sitzen die Fußsohlen aneinanderlegen und die Knie zu den Seiten sinken lassen. Die Füße mit den Händen umfassen und aufrecht sitzen. Mit der Ausatmung kann der Oberkörper mit langem Rücken nach vorn sinken.",
    eff: "Öffnet Hüften und Leisten und dehnt die Beininnenseiten." },
  { id: "firelog", cat: "hip", de: "Feuerholz", sa: "Agnistambhasana", lvl: 2, side: true, unit: "s", hold: 60,
    how: "Im Sitzen ein Schienbein parallel zur Mattenkante legen und das andere Schienbein genau darüber stapeln, Knöchel über Knie. Die Füße aktiv anziehen, um die Knie zu schützen. Aufrecht bleiben oder mit langem Rücken nach vorn beugen.",
    eff: "Intensive Dehnung für die äußere Hüfte und das Gesäß." },
  { id: "cowface", cat: "hip", de: "Kuhgesicht", sa: "Gomukhasana", lvl: 2, side: true, unit: "s", hold: 45,
    how: "Im Sitzen die Knie übereinanderlegen, die Füße liegen neben den Hüften. Einen Arm von oben und den anderen von unten hinter den Rücken führen und die Finger verhaken, notfalls mit einem Gurt. Aufrecht sitzen und gleichmäßig atmen.",
    eff: "Öffnet Hüften und Schultern gleichzeitig." },
  { id: "happybaby", cat: "hip", de: "Glückliches Baby", sa: "Ananda Balasana", lvl: 1, side: false, unit: "s", hold: 60,
    how: "In Rückenlage die Knie Richtung Achseln ziehen und die Außenkanten der Füße greifen. Die Fußsohlen zeigen zur Decke, die Unterschenkel stehen senkrecht. Der untere Rücken bleibt am Boden, sanftes Hin- und Herwiegen ist erlaubt.",
    eff: "Öffnet Hüften und Leisten und entspannt den unteren Rücken." },
  { id: "frog", cat: "hip", de: "Frosch", sa: "Mandukasana", lvl: 2, side: false, unit: "s", hold: 90,
    how: "Aus dem Vierfüßlerstand die Knie weit auseinander schieben, die Unterschenkel sind parallel und die Füße zeigen nach außen. Auf die Unterarme gehen und das Becken langsam nach hinten und unten sinken lassen. Bei Druck in den Knien eine Decke unterlegen.",
    eff: "Sehr tiefe Dehnung der Beininnenseiten und Leisten." },
  { id: "garland", cat: "hip", de: "Girlande", sa: "Malasana", lvl: 1, side: false, unit: "s", hold: 45,
    how: "Die Füße etwas mehr als hüftbreit aufstellen, die Zehen leicht nach außen drehen und tief in die Hocke sinken. Die Hände vor der Brust zusammenlegen und die Ellbogen innen gegen die Knie drücken. Kommen die Fersen nicht zum Boden, eine gerollte Decke unterlegen.",
    eff: "Öffnet Hüften und Leisten und mobilisiert die Sprunggelenke." },
  { id: "reclinedfigurefour", cat: "hip", de: "Liegende Figur vier", sa: "Supta Kapotasana", lvl: 1, side: true, unit: "s", hold: 60,
    how: "In Rückenlage beide Füße aufstellen und einen Knöchel über das andere Knie legen. Das untere Bein anheben und den Oberschenkel mit beiden Händen zu dir ziehen. Kopf und Schultern bleiben entspannt am Boden.",
    eff: "Dehnt Gesäß und äußere Hüfte, schonend für die Knie." },
  { id: "halfsplit", cat: "hip", de: "Halber Spagat", sa: "Ardha Hanumanasana", lvl: 1, side: true, unit: "s", hold: 45,
    how: "Aus dem tiefen Ausfallschritt das Becken nach hinten über das hintere Knie schieben und das vordere Bein strecken. Die Zehen des vorderen Fußes zeigen nach oben, die Hände stehen neben dem Bein. Mit langem Rücken über das Bein beugen.",
    eff: "Dehnt die Beinrückseite des vorderen Beins, gute Vorbereitung für den Spagat." },
  { id: "splits", cat: "hip", de: "Spagat", sa: "Hanumanasana", lvl: 3, side: true, unit: "s", hold: 30,
    how: "Aus dem halben Spagat das vordere Bein langsam nach vorn und das hintere nach hinten gleiten lassen, die Hände stützen neben dem Becken, notfalls auf Blöcken. Das Becken bleibt möglichst gerade nach vorn ausgerichtet. Nur so weit gehen, wie es ohne Schmerz geht.",
    eff: "Maximale Dehnung von Beinrückseite und Hüftbeuger." },
  { id: "gate", cat: "hip", de: "Torhaltung", sa: "Parighasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "Im Kniestand ein Bein zur Seite ausstrecken, der Fuß steht flach am Boden. Mit der Einatmung den Arm der anderen Seite heben und mit der Ausatmung über das gestreckte Bein zur Seite neigen. Die Hüfte bleibt über dem Knie.",
    eff: "Dehnt die Körperseite und die Beininnenseite." },
  { id: "recboundangle", cat: "hip", de: "Liegender Schmetterling", sa: "Supta Baddha Konasana", lvl: 1, side: false, unit: "s", hold: 120,
    how: "In Rückenlage die Fußsohlen aneinanderlegen und die Knie zu den Seiten sinken lassen. Bei Ziehen in den Leisten Kissen unter die Knie legen. Die Arme liegen locker neben dem Körper, den Atem in den Bauch fließen lassen.",
    eff: "Öffnet die Hüften sanft und wirkt tief entspannend." },
  { id: "easyseat", cat: "seat", de: "Schneidersitz", sa: "Sukhasana", lvl: 1, side: false, unit: "s", hold: 120,
    how: "Mit gekreuzten Unterschenkeln aufrecht sitzen, die Knie sinken locker zur Seite. Bei Bedarf auf ein Kissen setzen, damit das Becken leicht nach vorn kippt. Die Hände ruhen auf den Knien, die Schultern sind entspannt.",
    eff: "Grundhaltung für Atemübungen und Meditation, öffnet sanft die Hüften." },
  { id: "lotus", cat: "seat", de: "Lotus", sa: "Padmasana", lvl: 3, side: false, unit: "s", hold: 60,
    how: "Im Sitzen einen Fuß auf den gegenüberliegenden Oberschenkel nahe der Leiste legen, dann den anderen Fuß auf den anderen Oberschenkel. Die Bewegung kommt aus der Hüfte, nie aus dem Knie erzwingen. Aufrecht sitzen und regelmäßig die Beinhaltung wechseln.",
    eff: "Klassischer Meditationssitz, erfordert sehr offene Hüften." },
  { id: "halflotus", cat: "seat", de: "Halber Lotus", sa: "Ardha Padmasana", lvl: 2, side: true, unit: "s", hold: 60,
    how: "Im Schneidersitz einen Fuß auf den gegenüberliegenden Oberschenkel legen, der andere Fuß bleibt unter dem Knie. Die Knie sinken Richtung Boden. Bei Schmerz im Knie sofort lösen und im Schneidersitz bleiben.",
    eff: "Öffnet die Hüften und ist eine stabile Sitzhaltung zur Meditation." },
  { id: "thunderbolt", cat: "seat", de: "Fersensitz", sa: "Vajrasana", lvl: 1, side: false, unit: "s", hold: 60,
    how: "Auf die Knie kommen und das Gesäß auf die Fersen setzen, die Fußrücken liegen auf dem Boden. Aufrecht sitzen und die Hände auf die Oberschenkel legen. Bei Druck in Knien oder Fußgelenken ein Kissen zwischen Gesäß und Fersen legen.",
    eff: "Ruhige Sitzhaltung, die nach dem Essen die Verdauung unterstützen soll." },
  { id: "hero", cat: "seat", de: "Heldensitz", sa: "Virasana", lvl: 2, side: false, unit: "s", hold: 60,
    how: "Im Kniestand die Füße etwas weiter als hüftbreit auseinander nehmen und das Gesäß zwischen die Fersen auf den Boden oder einen Block setzen. Die Knie bleiben zusammen, die Zehen zeigen nach hinten. Aufrecht sitzen und ruhig atmen.",
    eff: "Dehnt Oberschenkelvorderseiten und Fußgelenke." },
  { id: "staff", cat: "seat", de: "Stock", sa: "Dandasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "Mit ausgestreckten Beinen aufrecht sitzen, die Füße sind angezogen und die Hände stehen neben den Hüften. Die Oberschenkel aktiv in den Boden drücken und das Brustbein heben. Der Scheitel zieht nach oben.",
    eff: "Kräftigt die Haltungsmuskulatur und ist Ausgangspunkt vieler Sitzhaltungen." },
  { id: "accomplished", cat: "seat", de: "Vollendete Haltung", sa: "Siddhasana", lvl: 2, side: false, unit: "s", hold: 120,
    how: "Im Sitzen eine Ferse nahe an den Damm bringen und die andere Ferse direkt davor oder darüber legen. Die Knie sinken zum Boden, der Rücken ist aufrecht. Die Hände ruhen auf den Knien.",
    eff: "Stabile Meditationshaltung mit aufrechter Wirbelsäule." },
  { id: "lion", cat: "seat", de: "Löwe", sa: "Simhasana", lvl: 1, side: false, unit: "r", hold: 3,
    how: "Im Fersensitz die Hände mit gespreizten Fingern auf die Knie legen. Tief durch die Nase einatmen, dann den Mund weit öffnen, die Zunge herausstrecken und kräftig mit einem Hauchen ausatmen. Den Blick dabei nach oben richten.",
    eff: "Löst Spannung in Gesicht, Kiefer und Hals." },
  { id: "crow", cat: "arm", de: "Krähe", sa: "Bakasana", lvl: 2, side: false, unit: "s", hold: 15,
    how: "In der Hocke die Hände schulterbreit aufsetzen und die Knie hoch an die Oberarme legen. Das Gewicht langsam nach vorn verlagern, bis die Füße abheben. Den Blick nach vorn richten und den Bauch fest halten, ein Kissen vor dem Kopf gibt Sicherheit.",
    eff: "Kräftigt Arme, Handgelenke und Rumpf und schult Mut und Gleichgewicht." },
  { id: "sidecrow", cat: "arm", de: "Seitliche Krähe", sa: "Parsva Bakasana", lvl: 3, side: true, unit: "s", hold: 10,
    how: "In der Hocke den Oberkörper drehen und die Hände schulterbreit neben die Außenseite eines Oberschenkels setzen. Die Ellbogen beugen, das Bein auf den Oberarm legen und das Gewicht nach vorn verlagern, bis die Füße abheben. Die Knie bleiben zusammen.",
    eff: "Kräftigt Arme und schräge Bauchmuskeln und verbindet Drehung mit Armbalance." },
  { id: "firefly", cat: "arm", de: "Glühwürmchen", sa: "Tittibhasana", lvl: 3, side: false, unit: "s", hold: 10,
    how: "Aus einer tiefen Hocke die Schultern hinter die Knie bringen und die Hände hinter den Fersen aufsetzen. Das Gewicht auf die Hände verlagern und die Beine nach vorn strecken. Die Arme bleiben aktiv, der Brustkorb hebt sich.",
    eff: "Kräftigt Arme und Rumpf und erfordert offene Beinrückseiten." },
  { id: "eightangle", cat: "arm", de: "Achtwinkelhaltung", sa: "Astavakrasana", lvl: 3, side: true, unit: "s", hold: 10,
    how: "Im Sitzen ein Bein über den gleichseitigen Oberarm legen, die Hände neben die Hüften setzen. Das Gesäß anheben, die Füße überkreuzen und die Beine zur Seite strecken. Den Oberkörper nach vorn neigen und die Ellbogen beugen.",
    eff: "Kräftigt Arme, Schultern und Bauch und schult die Koordination." },
  { id: "sideplank", cat: "arm", de: "Seitstütz", sa: "Vasisthasana", lvl: 2, side: true, unit: "s", hold: 20,
    how: "Aus dem Brett auf die Außenkante eines Fußes rollen und die Füße übereinander legen oder versetzen. Die untere Hand liegt unter der Schulter, das Becken bleibt hoch, der obere Arm zeigt nach oben. Für eine leichtere Variante das untere Knie ablegen.",
    eff: "Kräftigt Schultern, Arme und seitliche Rumpfmuskulatur." },
  { id: "elephanttrunk", cat: "arm", de: "Elefantenrüssel", sa: "Eka Hasta Bhujasana", lvl: 3, side: true, unit: "s", hold: 10,
    how: "Im Sitzen ein Bein gestreckt nach vorn, das andere über den gleichseitigen Oberarm legen. Die Hände neben die Hüften setzen und Gesäß und gestrecktes Bein vom Boden heben. Die Arme drücken kräftig in den Boden.",
    eff: "Kräftigt Arme und Bauch und dehnt Hüfte und Beinrückseite." },
  { id: "flyingpigeon", cat: "arm", de: "Fliegende Taube", sa: "Eka Pada Galavasana", lvl: 3, side: true, unit: "s", hold: 10,
    how: "Aus dem einbeinigen Stuhl die Hände vor sich aufsetzen und den Fuß des aufgelegten Beins um den Oberarm haken. Das Gewicht nach vorn verlagern, das Standbein anheben und nach hinten strecken. Den Blick nach vorn richten.",
    eff: "Kräftigt Arme und Rumpf und öffnet die Hüfte." },
  { id: "koundinya", cat: "arm", de: "Koundinya-Haltung", sa: "Eka Pada Koundinyasana", lvl: 3, side: true, unit: "s", hold: 10,
    how: "Aus der seitlichen Krähe das obere Bein zur Seite und das untere nach hinten strecken. Die Ellbogen bleiben gebeugt und eng, der Oberkörper parallel zum Boden. Den Blick nach vorn richten und ruhig atmen.",
    eff: "Fortgeschrittene Armbalance, die Arme, Schultern und Rumpf stark fordert." },
  { id: "peacock", cat: "arm", de: "Pfau", sa: "Mayurasana", lvl: 3, side: false, unit: "s", hold: 10,
    how: "Knien und die Hände mit den Fingern zu den Füßen aufsetzen, die Ellbogen eng zusammen unter dem Bauch. Den Oberkörper auf die Ellbogen legen, die Beine nach hinten strecken und das Gewicht nach vorn verlagern, bis die Füße abheben. Körper waagerecht halten.",
    eff: "Kräftigt Unterarme, Handgelenke und Rumpf sehr stark; bei Handgelenkbeschwerden weglassen." },
  { id: "downdog", cat: "inv", de: "Herabschauender Hund", sa: "Adho Mukha Svanasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "Aus dem Vierfüßlerstand die Zehen aufstellen und das Becken nach hinten oben schieben. Die Hände drücken fest in den Boden, der Rücken wird lang, die Knie dürfen gebeugt bleiben. Fersen Richtung Boden sinken lassen und den Kopf entspannen.",
    eff: "Dehnt Beinrückseiten und Schultern und kräftigt Arme und Rücken." },
  { id: "threeleggeddog", cat: "inv", de: "Dreibeiniger Hund", sa: "Eka Pada Adho Mukha Svanasana", lvl: 1, side: true, unit: "s", hold: 15,
    how: "Aus dem herabschauenden Hund ein Bein gestreckt nach hinten oben heben. Das Becken bleibt zunächst gerade, beide Hände drücken gleichmäßig in den Boden. Das Bein zurücksetzen und die Seite wechseln.",
    eff: "Kräftigt Schultern und Gesäß und dehnt das Standbein." },
  { id: "dolphin", cat: "inv", de: "Delfin", sa: "Ardha Pincha Mayurasana", lvl: 2, side: false, unit: "s", hold: 30,
    how: "Aus dem Vierfüßlerstand die Unterarme schulterbreit aufsetzen, die Ellbogen unter den Schultern. Die Zehen aufstellen und das Becken nach hinten oben schieben wie beim Hund. Die Schultern weg vom Boden drücken und den Kopf frei hängen lassen.",
    eff: "Kräftigt Schultern und oberen Rücken und bereitet auf den Unterarmstand vor." },
  { id: "headstand", cat: "inv", de: "Kopfstand", sa: "Salamba Sirsasana", lvl: 3, side: false, unit: "s", hold: 30,
    how: "Die Unterarme aufsetzen, die Finger verschränken und den Hinterkopf in die Hände legen. Die Füße heranlaufen, bis das Becken über den Schultern ist, und die Beine kontrolliert anheben. Das Gewicht liegt vor allem auf den Unterarmen, nur mit Erfahrung oder Anleitung üben.",
    eff: "Kräftigt Schultern und Rumpf; nicht bei Bluthochdruck, Nacken- oder Augenproblemen." },
  { id: "tripodheadstand", cat: "inv", de: "Dreifuß-Kopfstand", sa: "Sirsasana II", lvl: 3, side: false, unit: "s", hold: 20,
    how: "Die Hände schulterbreit aufsetzen und den Scheitel davor ablegen, sodass Kopf und Hände ein Dreieck bilden. Die Knie auf die Oberarme legen und von dort die Beine langsam nach oben strecken. Die Ellbogen bleiben über den Handgelenken.",
    eff: "Kräftigt Schultern, Arme und Rumpf; nur mit Erfahrung, nicht bei Nackenproblemen." },
  { id: "shoulderstand", cat: "inv", de: "Schulterstand", sa: "Salamba Sarvangasana", lvl: 2, side: false, unit: "s", hold: 60,
    how: "In Rückenlage die Beine über den Kopf führen und den Rücken mit den Händen stützen. Die Beine nach oben strecken, das Gewicht liegt auf den Schultern, nicht auf dem Nacken. Eine gefaltete Decke unter den Schultern schützt die Halswirbelsäule.",
    eff: "Beruhigt und kräftigt Schultern und Rumpf; nicht bei Nackenproblemen, Bluthochdruck oder in der Periode." },
  { id: "plough", cat: "inv", de: "Pflug", sa: "Halasana", lvl: 2, side: false, unit: "s", hold: 30,
    how: "Aus dem Schulterstand die gestreckten Beine hinter den Kopf sinken lassen, bis die Zehen den Boden berühren oder auf einem Block liegen. Die Hände stützen den Rücken oder liegen verschränkt am Boden. Den Kopf nicht drehen und ruhig atmen.",
    eff: "Dehnt Rücken und Beinrückseiten; Vorsicht bei Nacken- und Bandscheibenproblemen." },
  { id: "forearmstand", cat: "inv", de: "Unterarmstand", sa: "Pincha Mayurasana", lvl: 3, side: false, unit: "s", hold: 15,
    how: "Aus dem Delfin ein Bein heben und mit dem anderen sanft abspringen, bis beide Beine über dem Becken sind. Die Unterarme bleiben parallel, die Schultern drücken weg vom Boden. Anfangs an der Wand üben.",
    eff: "Kräftigt Schultern, Rumpf und Gleichgewicht; nur mit gutem Aufwärmen und Erfahrung." },
  { id: "handstand", cat: "inv", de: "Handstand", sa: "Adho Mukha Vrksasana", lvl: 3, side: false, unit: "s", hold: 15,
    how: "Die Hände schulterbreit eine Handbreit vor der Wand aufsetzen, ein Bein heben und mit dem anderen kontrolliert abspringen. Arme gestreckt, Schultern zu den Ohren schieben, Bauch und Gesäß fest. Mit Übung den Abstand zur Wand vergrößern.",
    eff: "Kräftigt Arme, Schultern und Rumpf und schult Körperspannung." },
  { id: "scorpion", cat: "inv", de: "Skorpion", sa: "Vrschikasana", lvl: 3, side: false, unit: "s", hold: 10,
    how: "Aus dem stabilen Unterarmstand die Knie beugen und die Füße langsam Richtung Kopf sinken lassen. Die Brust schiebt sich nach vorn, der Rücken beugt sich. Nur mit sicherem Unterarmstand und sehr beweglichem Rücken üben.",
    eff: "Sehr fortgeschrittene Umkehr- und Rückbeugehaltung für Kraft und Beweglichkeit." },
  { id: "plank", cat: "core", de: "Brett", sa: "Phalakasana", lvl: 1, side: false, unit: "s", hold: 30,
    how: "Die Hände unter den Schultern aufsetzen und die Beine nach hinten strecken, sodass der Körper eine gerade Linie bildet. Bauch und Gesäß fest, die Hüften weder hängen lassen noch hochschieben. Für eine leichtere Variante die Knie ablegen.",
    eff: "Kräftigt Rumpf, Schultern und Arme." },
  { id: "forearmplank", cat: "core", de: "Unterarmstütz", sa: "", lvl: 1, side: false, unit: "s", hold: 30,
    how: "Die Unterarme parallel aufsetzen, die Ellbogen unter den Schultern, und die Beine nach hinten strecken. Den Körper in einer Linie halten und den Bauchnabel leicht einziehen. Gleichmäßig weiteratmen.",
    eff: "Kräftigt Bauch und Rumpf und schont die Handgelenke." },
  { id: "chaturanga", cat: "core", de: "Chaturanga", sa: "Chaturanga Dandasana", lvl: 2, side: false, unit: "s", hold: 10,
    how: "Aus dem Brett leicht nach vorn schieben und die Ellbogen eng am Körper beugen, bis die Oberarme etwa parallel zum Boden sind. Der Körper bleibt eine gerade Linie, die Schultern sinken nicht unter die Ellbogen. Anfangs mit abgelegten Knien üben.",
    eff: "Kräftigt Arme, Brust und Rumpf und ist Teil des Sonnengrußes." },
  { id: "boat", cat: "core", de: "Boot", sa: "Paripurna Navasana", lvl: 2, side: false, unit: "s", hold: 20,
    how: "Im Sitzen leicht nach hinten lehnen und die Beine anheben, gestreckt oder mit gebeugten Knien. Den Rücken lang halten und die Arme parallel zum Boden nach vorn strecken. Gleichmäßig atmen.",
    eff: "Kräftigt Bauch und Hüftbeuger und schult das Gleichgewicht." },
  { id: "halfboat", cat: "core", de: "Halbes Boot", sa: "Ardha Navasana", lvl: 2, side: false, unit: "s", hold: 15,
    how: "Aus dem Boot Oberkörper und Beine weiter Richtung Boden sinken lassen, ohne abzulegen. Der untere Rücken bleibt rund und nah am Boden, die Arme zeigen nach vorn. Die Spannung halten und ruhig atmen.",
    eff: "Fordert die Bauchmuskeln besonders stark." },
  { id: "dolphinplank", cat: "core", de: "Delfin-Brett", sa: "Makara Adho Mukha Svanasana", lvl: 2, side: false, unit: "r", hold: 8,
    how: "Aus dem Unterarmstütz das Becken nach hinten oben schieben in den Delfin und ausatmend zurück in den Unterarmstütz kommen. Die Unterarme bleiben fest am Boden, die Schultern stabil. Die Bewegung langsam mit dem Atem wiederholen.",
    eff: "Kräftigt Schultern und Bauch im Wechsel." },
  { id: "forearmsideplank", cat: "core", de: "Unterarm-Seitstütz", sa: "", lvl: 1, side: true, unit: "s", hold: 20,
    how: "Auf der Seite liegend den Unterarm unter der Schulter aufsetzen und das Becken anheben, bis der Körper eine Linie bildet. Die Füße liegen übereinander oder versetzt, für eine leichtere Variante das untere Knie ablegen. Den oberen Arm in die Hüfte oder nach oben strecken.",
    eff: "Kräftigt die seitliche Rumpfmuskulatur und schont die Handgelenke." },
  { id: "kneetonose", cat: "core", de: "Knie zur Nase im Hund", sa: "", lvl: 1, side: true, unit: "r", hold: 6,
    how: "Aus dem dreibeinigen Hund ausatmend das Knie zur Nase ziehen, den Rücken rund machen und die Schultern über die Handgelenke schieben. Einatmend das Bein wieder nach hinten oben strecken. Einige Male wiederholen und die Seite wechseln.",
    eff: "Kräftigt Bauch und Schultern und wärmt für Armbalancen auf." },
  { id: "child", cat: "floor", de: "Kindhaltung", sa: "Balasana", lvl: 1, side: false, unit: "s", hold: 60,
    how: "Im Fersensitz den Oberkörper nach vorn auf die Oberschenkel sinken lassen und die Stirn auf den Boden legen. Die Arme liegen nach vorn ausgestreckt oder neben dem Körper. Die Knie dürfen auseinander, ruhig in den Rücken atmen.",
    eff: "Entspannt Rücken, Schultern und Nacken, gute Ruheposition zwischendurch." },
  { id: "savasana", cat: "floor", de: "Endentspannung", sa: "Savasana", lvl: 1, side: false, unit: "s", hold: 300,
    how: "In Rückenlage die Beine locker ausstrecken und die Füße nach außen fallen lassen. Die Arme liegen etwas vom Körper entfernt, die Handflächen zeigen nach oben. Die Augen schließen und den Atem einfach geschehen lassen.",
    eff: "Tiefe Entspannung, mit der jede Yogaeinheit abgeschlossen werden sollte." },
  { id: "recliningthero", cat: "floor", de: "Liegender Held", sa: "Supta Virasana", lvl: 3, side: false, unit: "s", hold: 60,
    how: "Aus dem Heldensitz die Hände hinter dem Körper aufstützen und langsam auf die Unterarme und dann auf den Rücken sinken. Die Knie bleiben zusammen und am Boden. Bei Druck im Knie oder unteren Rücken ein Kissen unter den Rücken legen oder nur bis auf die Unterarme gehen.",
    eff: "Tiefe Dehnung für Oberschenkelvorderseiten und Hüftbeuger." },
  { id: "supinebigtoe", cat: "floor", de: "Hand-zum-großen-Zeh im Liegen", sa: "Supta Padangusthasana", lvl: 1, side: true, unit: "s", hold: 45,
    how: "In Rückenlage ein Bein gestreckt am Boden lassen und das andere Bein nach oben strecken. Den großen Zeh mit Zeige- und Mittelfinger oder einen Gurt um den Fuß greifen. Das Bein langsam zu dir ziehen, das Becken bleibt gerade am Boden.",
    eff: "Dehnt die Beinrückseite schonend für den Rücken." },
  { id: "kneestochest", cat: "floor", de: "Knie zur Brust", sa: "Apanasana", lvl: 1, side: false, unit: "s", hold: 45,
    how: "In Rückenlage beide Knie zur Brust ziehen und mit den Armen umfassen. Mit der Ausatmung die Knie etwas näher ziehen, mit der Einatmung locker lassen. Sanftes Wiegen massiert den unteren Rücken.",
    eff: "Entspannt den unteren Rücken und wirkt wohltuend auf den Bauchraum." },
  { id: "windrelieving", cat: "floor", de: "Windbefreiende Haltung", sa: "Pavanamuktasana", lvl: 1, side: true, unit: "s", hold: 30,
    how: "In Rückenlage ein Knie zur Brust ziehen und mit beiden Händen umfassen, das andere Bein bleibt gestreckt am Boden. Kopf anheben und die Stirn Richtung Knie bringen oder entspannt liegen bleiben. Danach die Seite wechseln.",
    eff: "Regt die Verdauung an und löst Blähungen." },
  { id: "crocodile", cat: "floor", de: "Krokodil", sa: "Makarasana", lvl: 1, side: false, unit: "s", hold: 120,
    how: "In Bauchlage die Beine etwas grätschen und die Fersen nach innen fallen lassen. Die Arme verschränken und die Stirn auf die Unterarme legen. In den Bauch atmen und spüren, wie er sich gegen den Boden drückt.",
    eff: "Entspannende Bauchlage, die die Bauchatmung schult und den Rücken entlastet." },
  { id: "onelegbridge", cat: "floor", de: "Einbeinige Brücke", sa: "Eka Pada Setu Bandha Sarvangasana", lvl: 2, side: true, unit: "s", hold: 20,
    how: "In Rückenlage die Füße hüftbreit aufstellen und das Becken zur Brücke heben. Ein Bein gestreckt nach oben heben, ohne dass das Becken absinkt oder kippt. Halten, absetzen und die Seite wechseln.",
    eff: "Kräftigt Gesäß, Beinrückseite und Rumpfstabilität." },
  { id: "caterpillar", cat: "yin", de: "Raupe", sa: "Paschimottanasana (Yin)", lvl: 1, side: false, unit: "s", hold: 240,
    how: "Im Sitzen die Beine nach vorn ausstrecken, die Knie dürfen gebeugt sein, und den Oberkörper mit rundem Rücken locker nach vorn sinken lassen. Kopf und Arme hängen schwer. Muskeln entspannen und still verweilen.",
    eff: "Sanfte Dehnung der ganzen Körperrückseite, sehr beruhigend." },
  { id: "yinbutterfly", cat: "yin", de: "Schmetterling (Yin)", sa: "Baddha Konasana (Yin)", lvl: 1, side: false, unit: "s", hold: 240,
    how: "Im Sitzen die Fußsohlen aneinanderlegen, die Füße etwas weiter vom Körper entfernt als in der Schusterhaltung. Mit rundem Rücken nach vorn sinken lassen und den Kopf hängen lassen. Ruhig atmen und nichts aktiv halten.",
    eff: "Öffnet Hüften und unteren Rücken in der Tiefe." },
  { id: "halfbutterfly", cat: "yin", de: "Halber Schmetterling", sa: "Janu Sirsasana (Yin)", lvl: 1, side: true, unit: "s", hold: 180,
    how: "Im Sitzen ein Bein ausstrecken und die Fußsohle des anderen Beins an den inneren Oberschenkel legen. Mit rundem Rücken über das gestreckte Bein sinken lassen. Danach die Seite wechseln.",
    eff: "Dehnt Beinrückseite und Rücken auf einer Seite." },
  { id: "dragon", cat: "yin", de: "Drache", sa: "", lvl: 2, side: true, unit: "s", hold: 180,
    how: "Aus dem Vierfüßlerstand einen Fuß zwischen die Hände setzen und das hintere Knie weit nach hinten ablegen. Die Hüfte sinken lassen, die Hände bleiben neben dem Fuß oder auf Blöcken. Ruhig verweilen und die Dehnung in Leiste und Hüftbeuger spüren.",
    eff: "Öffnet Hüftbeuger und Leisten in der Tiefe." },
  { id: "swan", cat: "yin", de: "Schwan", sa: "Eka Pada Rajakapotasana (Yin)", lvl: 2, side: true, unit: "s", hold: 180,
    how: "Aus dem Vierfüßlerstand ein Knie hinter das gleichseitige Handgelenk legen und das hintere Bein lang nach hinten strecken. Den Oberkörper auf Unterarme oder ein Kissen sinken lassen. Bei Druck im Knie den vorderen Fuß näher zur Leiste holen.",
    eff: "Tiefe Dehnung für Gesäß und äußere Hüfte." },
  { id: "saddle", cat: "yin", de: "Sattel", sa: "Supta Virasana (Yin)", lvl: 3, side: false, unit: "s", hold: 180,
    how: "Aus dem Fersensitz die Hände hinter den Körper setzen und langsam nach hinten auf Unterarme oder ein Kissen sinken. Der untere Rücken darf sich leicht wölben. Bei Knie- oder Rückenbeschwerden aufrecht im Fersensitz bleiben.",
    eff: "Dehnt Oberschenkelvorderseiten, Hüftbeuger und Bauch." },
  { id: "shoelace", cat: "yin", de: "Schnürsenkel", sa: "Gomukhasana (Yin)", lvl: 2, side: true, unit: "s", hold: 180,
    how: "Im Sitzen die Knie übereinanderlegen, die Füße liegen neben den Hüften wie beim Kuhgesicht. Mit rundem Rücken nach vorn sinken lassen. Wird es im Knie unangenehm, das untere Bein ausstrecken.",
    eff: "Öffnet die äußeren Hüften und das Gesäß." },
  { id: "seal", cat: "yin", de: "Seehund", sa: "Bhujangasana (Yin)", lvl: 2, side: false, unit: "s", hold: 120,
    how: "In Bauchlage die Hände etwas vor und seitlich der Schultern aufsetzen und die Arme strecken, so dass sich der Oberkörper hebt. Die Beine liegen locker, das Gesäß bleibt entspannt. Ist der Druck im unteren Rücken zu stark, auf die Unterarme gehen.",
    eff: "Intensive Rückbeuge für die Lendenwirbelsäule." },
  { id: "dragonfly", cat: "yin", de: "Libelle", sa: "Upavistha Konasana (Yin)", lvl: 1, side: false, unit: "s", hold: 240,
    how: "Im Sitzen die Beine weit grätschen und den Oberkörper mit rundem Rücken nach vorn sinken lassen. Die Hände ruhen auf dem Boden oder einem Kissen. Die Beine bleiben entspannt, die Knie dürfen leicht gebeugt sein.",
    eff: "Dehnt Beininnenseiten, Beinrückseiten und Rücken." },
  { id: "banana", cat: "yin", de: "Banane", sa: "Bananasana", lvl: 1, side: true, unit: "s", hold: 180,
    how: "In Rückenlage Beine und Arme zur gleichen Seite verschieben, so dass der Körper einen Bogen wie eine Banane bildet. Beide Gesäßhälften bleiben am Boden. In die gedehnte Flanke atmen und danach die Seite wechseln.",
    eff: "Dehnt die gesamte Körperseite von der Hüfte bis zur Achsel." },
  { id: "legsupwall", cat: "yin", de: "Beine an der Wand", sa: "Viparita Karani", lvl: 1, side: false, unit: "s", hold: 300,
    how: "Seitlich nah an eine Wand setzen, dann auf den Rücken legen und die Beine an der Wand nach oben strecken. Das Gesäß liegt nahe an der Wand, bei Bedarf ein Kissen unter das Becken legen. Die Arme ruhen locker, die Augen schließen.",
    eff: "Entlastet müde Beine und wirkt beruhigend auf das Nervensystem." },
  { id: "supportedbridge", cat: "yin", de: "Gestützte Brücke mit Block", sa: "Setu Bandha Sarvangasana (gestützt)", lvl: 1, side: false, unit: "s", hold: 180,
    how: "In Rückenlage die Füße aufstellen, das Becken heben und einen Block quer unter das Kreuzbein legen. Das Becken auf dem Block ablegen und ganz entspannen. Zum Lösen das Becken heben, den Block herausnehmen und langsam abrollen.",
    eff: "Sanfte, passive Rückbeuge, die den unteren Rücken entlastet." },
  { id: "toesquat", cat: "yin", de: "Zehensitz", sa: "", lvl: 1, side: false, unit: "s", hold: 60,
    how: "Im Kniestand die Zehen aufstellen und das Gesäß langsam auf die Fersen setzen. Aufrecht sitzen und die Dehnung in den Fußsohlen aushalten. Wird es zu intensiv, das Gewicht mit den Händen nach vorn verlagern.",
    eff: "Intensive Dehnung für Fußsohlen und Zehen." },
  { id: "supportedchild", cat: "yin", de: "Gestützte Kindhaltung mit Kissen", sa: "Salamba Balasana", lvl: 1, side: false, unit: "s", hold: 240,
    how: "Im Fersensitz die Knie weit öffnen und ein großes Kissen der Länge nach zwischen die Knie legen. Den Oberkörper auf das Kissen sinken lassen und den Kopf zur Seite drehen. Nach der Hälfte der Zeit die Kopfseite wechseln.",
    eff: "Tief entspannend und wohltuend für Rücken und Hüften." },
  { id: "nadishodhana", cat: "breath", de: "Wechselatmung", sa: "Nadi Shodhana", lvl: 1, side: false, unit: "r", hold: 10,
    how: "Aufrecht sitzen, mit dem rechten Daumen das rechte Nasenloch verschließen und links einatmen. Dann das linke Nasenloch mit dem Ringfinger schließen, rechts ausatmen, rechts einatmen und links ausatmen. Das ist eine Runde, ruhig und ohne Anstrengung atmen.",
    eff: "Beruhigt, gleicht aus und fördert die Konzentration." },
  { id: "ujjayi", cat: "breath", de: "Ujjayi-Atmung", sa: "Ujjayi Pranayama", lvl: 1, side: false, unit: "s", hold: 180,
    how: "Durch die Nase ein- und ausatmen und dabei die Stimmritze leicht verengen, so dass ein leises Rauschen wie Meeresrauschen entsteht. Ein- und Ausatmung gleich lang und gleichmäßig halten. Diese Atmung kann eine ganze Yogaeinheit begleiten.",
    eff: "Verlängert den Atem, wärmt und hilft, im Fluss zu bleiben." },
  { id: "kapalabhati", cat: "breath", de: "Kapalabhati", sa: "Kapalabhati", lvl: 2, side: false, unit: "r", hold: 3,
    how: "Aufrecht sitzen und kurz und kräftig durch die Nase ausatmen, indem der Bauch nach innen gezogen wird, die Einatmung geschieht passiv. Etwa 30 Stöße in gleichmäßigem Rhythmus sind eine Runde, danach einige ruhige Atemzüge. Bei Schwindel sofort aufhören.",
    eff: "Belebt und wärmt; nicht in der Schwangerschaft, bei Bluthochdruck oder Herzproblemen üben." },
  { id: "bhastrika", cat: "breath", de: "Blasebalg-Atmung", sa: "Bhastrika", lvl: 3, side: false, unit: "r", hold: 3,
    how: "Aufrecht sitzen und kräftig und gleich stark durch die Nase ein- und ausatmen, wie ein Blasebalg. Etwa 10 bis 20 Atemzüge sind eine Runde, danach ruhig atmen. Langsam beginnen und bei Schwindel aufhören.",
    eff: "Stark anregend; nicht in der Schwangerschaft, bei Bluthochdruck, Herzproblemen oder Epilepsie üben." },
  { id: "bhramari", cat: "breath", de: "Bienenatmung", sa: "Bhramari", lvl: 1, side: false, unit: "r", hold: 7,
    how: "Aufrecht sitzen, die Augen schließen und die Ohren sanft mit den Daumen verschließen. Durch die Nase einatmen und beim Ausatmen mit geschlossenem Mund ein gleichmäßiges Summen erzeugen. Die Vibration im Kopf spüren.",
    eff: "Wirkt stark beruhigend und hilft bei innerer Unruhe." },
  { id: "dirgha", cat: "breath", de: "Vollatmung", sa: "Dirgha Pranayama", lvl: 1, side: false, unit: "s", hold: 180,
    how: "Im Liegen oder Sitzen eine Hand auf den Bauch und eine auf die Brust legen. Beim Einatmen erst den Bauch, dann die Flanken und zuletzt die Brust füllen, beim Ausatmen in umgekehrter Reihenfolge leeren. Langsam und ohne Druck atmen.",
    eff: "Vertieft die Atmung und wirkt entspannend." },
  { id: "boxbreath", cat: "breath", de: "Box-Atmung", sa: "Sama Vritti", lvl: 1, side: false, unit: "r", hold: 10,
    how: "Aufrecht sitzen und 4 Sekunden einatmen, 4 Sekunden halten, 4 Sekunden ausatmen und 4 Sekunden halten. Das ist eine Runde. Wird das Halten unangenehm, die Zeiten verkürzen.",
    eff: "Beruhigt schnell, gut vor Stress oder zum Einschlafen." },
  { id: "sitali", cat: "breath", de: "Kühlende Atmung", sa: "Sitali", lvl: 1, side: false, unit: "r", hold: 10,
    how: "Aufrecht sitzen, die Zunge zu einem Röhrchen rollen und leicht herausstrecken. Durch die gerollte Zunge einatmen, den Mund schließen und durch die Nase ausatmen. Wer die Zunge nicht rollen kann, atmet durch die leicht geöffneten Zähne ein.",
    eff: "Kühlt den Körper und beruhigt, angenehm an heißen Tagen." },
  { id: "meditation", cat: "breath", de: "Meditation im Sitzen", sa: "", lvl: 1, side: false, unit: "s", hold: 600,
    how: "Bequem und aufrecht sitzen, die Hände ruhen auf den Oberschenkeln und die Augen sind geschlossen. Die Aufmerksamkeit auf den natürlichen Atem richten. Schweifen die Gedanken ab, freundlich zum Atem zurückkehren.",
    eff: "Fördert Ruhe, Konzentration und Stressabbau." },
  { id: "bodyscan", cat: "breath", de: "Body-Scan", sa: "Yoga Nidra", lvl: 1, side: false, unit: "s", hold: 600,
    how: "In Rückenlage wie in der Endentspannung liegen und die Augen schließen. Die Aufmerksamkeit langsam von den Zehen bis zum Scheitel durch den Körper wandern lassen und jeden Bereich bewusst entspannen. Wach bleiben und nur beobachten.",
    eff: "Tiefe körperliche und geistige Entspannung, hilft beim Einschlafen." },
];
// POSEN>>
// Abläufe: Folge von [Haltung, Richtwert] (Richtwert in Sekunden bzw. Runden wie bei der Haltung)
// <<ABLAEUFE
const YOGA_FLOWS = [
  { id: "sunA", de: "Sonnengruß A", how: "Der klassische Aufwärm-Ablauf: jede Haltung mit einem Atemzug verbinden, im herabschauenden Hund 5 Atemzüge bleiben. Meist 3 bis 5 Durchgänge.",
    items: [["mountain", 5], ["standfold", 5], ["halffold", 3], ["chaturanga", 3], ["updog", 3], ["downdog", 25], ["halffold", 3], ["standfold", 5], ["mountain", 5]] },
  { id: "sunB", de: "Sonnengruß B", how: "Wie Sonnengruß A, dazu Stuhl und Krieger I auf beiden Seiten. Kräftigt Beine und Schultern, meist 3 bis 5 Durchgänge.",
    items: [["mountain", 5], ["chair", 10], ["standfold", 5], ["halffold", 3], ["chaturanga", 3], ["updog", 3], ["downdog", 5], ["warrior1", 15], ["chaturanga", 3], ["updog", 3], ["downdog", 25], ["halffold", 3], ["standfold", 5], ["chair", 10], ["mountain", 5]] },
  { id: "moon", de: "Mondgruß", how: "Ruhiger Ablauf zur Seite: bis zur Girlande und spiegelverkehrt zurück, dann die andere Seite. Gut am Abend.",
    items: [["mountain", 5], ["palmtree", 10], ["goddess", 15], ["triangle", 20], ["pyramid", 20], ["lowlunge", 20], ["skandasana", 15], ["garland", 20]] },
  { id: "warriorflow", de: "Krieger-Flow", how: "Kräftigende Stehhaltungen ohne Pause hintereinander, erst rechts, dann links.",
    items: [["warrior1", 30], ["warrior2", 30], ["reversewarrior", 15], ["sideangle", 30], ["triangle", 30], ["humblewarrior", 20]] },
  { id: "morning", de: "Morgenroutine", how: "Etwa 10 Minuten zum Wachwerden: Wirbelsäule mobilisieren, Beine öffnen, Gleichgewicht finden.",
    items: [["catcow", 8], ["downdog", 30], ["lowlunge", 30], ["standfold", 30], ["mountain", 20], ["palmtree", 20], ["warrior2", 30], ["tree", 30], ["child", 60]] },
  { id: "evening", de: "Abendroutine zum Entspannen", how: "Ruhige Haltungen, lange gehalten, zum Runterkommen vor dem Schlafen.",
    items: [["child", 60], ["catcow", 6], ["seatedfold", 60], ["supinetwist", 60], ["happybaby", 60], ["legsupwall", 180], ["savasana", 300]] },
  { id: "backcare", de: "Rücken-Routine", how: "Sanfte Mobilisation und Kräftigung für den unteren Rücken, gut bei Verspannungen. Bei akuten Schmerzen vorher abklären.",
    items: [["catcow", 10], ["threadneedle", 30], ["child", 60], ["sphinx", 60], ["cobra", 20], ["bridge", 30], ["kneestochest", 45], ["supinetwist", 60]] },
  { id: "hips", de: "Hüftöffner-Routine", how: "Öffnet Hüftbeuger, Gesäß und Leisten, gut bei viel Sitzen.",
    items: [["lowlunge", 45], ["lizard", 45], ["halfpigeon", 60], ["garland", 45], ["boundangle", 60], ["firelog", 60], ["happybaby", 60]] },
  { id: "afterlift", de: "Dehnen nach dem Krafttraining", how: "Lockert Beine, Hüfte, Rücken und Schultern nach dem Training, jede Haltung ruhig atmend halten.",
    items: [["downdog", 30], ["lowlunge", 45], ["halfsplit", 45], ["halfpigeon", 60], ["reclinedfigurefour", 60], ["puppy", 45], ["threadneedle", 30], ["supinetwist", 60], ["child", 60]] },
  { id: "yinflow", de: "Yin für Hüfte und Rücken", how: "Lange, passive Haltungen mit entspannten Muskeln, dazwischen kurz nachspüren.",
    items: [["caterpillar", 240], ["yinbutterfly", 240], ["dragon", 180], ["swan", 180], ["banana", 180], ["legsupwall", 300], ["savasana", 300]] },
  { id: "coreflow", de: "Core-Flow", how: "Kräftigt Bauch, Rücken und Schultern, jede Haltung mit ruhiger Atmung halten.",
    items: [["plank", 30], ["sideplank", 20], ["forearmplank", 30], ["boat", 20], ["halfboat", 15], ["dolphinplank", 8], ["birddog", 8]] },
  { id: "neck", de: "Nacken und Schultern", how: "Löst Verspannungen nach langem Sitzen am Schreibtisch.",
    items: [["neckstretch", 30], ["shouldercircles", 10], ["cowface", 45], ["threadneedle", 30], ["puppy", 45], ["foldclasp", 30]] },
  { id: "balanceflow", de: "Gleichgewichts-Flow", how: "Standhaltungen auf einem Bein für Kraft und Konzentration, Blick auf einen festen Punkt.",
    items: [["mountain", 20], ["tree", 30], ["warrior3", 20], ["halfmoon", 20], ["eagle", 20], ["dancer", 20]] },
  { id: "breathbreak", de: "Atem-Pause", how: "Ruhige Atemübungen und kurze Meditation, gut zwischendurch oder vor dem Schlafen.",
    items: [["dirgha", 180], ["nadishodhana", 10], ["boxbreath", 10], ["meditation", 300]] },
];
// ABLAEUFE>>
// v349: ausführliche Beschreibung je Haltung: s Schritte, f häufige Fehler, l leichter, h schwerer, v Vorsicht
// <<BESCHREIBUNG
const YOGA_DESC = {
  catcow: { s: ["In den Vierfüßlerstand kommen, Hände unter den Schultern, Knie unter den Hüften.", "Einatmen: Becken kippen, Bauch sinkt Richtung Boden, Brustbein und Blick gehen leicht nach vorne oben.", "Ausatmen: Rücken Wirbel für Wirbel rund machen, Kinn zur Brust, Hände schieben den Boden weg.", "Im eigenen Atemrhythmus fließend zwischen beiden Positionen wechseln."],
    f: ["Nur im Nacken bewegen: Die Bewegung beginnt im Becken und rollt durch die ganze Wirbelsäule.", "In der Kuh ins Hohlkreuz fallen: Den Bauch leicht aktiv halten und die Bewegung sanft dosieren."],
    l: "Im Sitzen auf einem Stuhl ausführen, Hände auf den Knien.", h: "Ein Bein nach hinten strecken und mit der Bewegung mitnehmen, beim Rundmachen das Knie zur Nase ziehen.",
    v: "Bei Knieschmerzen eine Decke unter die Knie legen." },
  tabletop: { s: ["Hände schulterbreit unter die Schultern setzen, Knie hüftbreit unter die Hüften.", "Finger spreizen und den Boden mit der ganzen Hand wegdrücken.", "Rücken lang und gerade, Kopf in Verlängerung der Wirbelsäule, Blick zum Boden.", "Bauch leicht anspannen und ruhig atmen."],
    f: ["Durchhängen zwischen den Schulterblättern: Den Boden aktiv wegschieben.", "Hohlkreuz: Bauchnabel sanft Richtung Wirbelsäule ziehen."],
    l: "Unterarme statt Hände aufsetzen, um die Handgelenke zu schonen.", h: "Knie eine Handbreit vom Boden heben und halten (schwebender Tisch).",
    v: "Bei Handgelenkschmerzen auf Fäusten oder Unterarmen stützen." },
  threadneedle: { s: ["Im Vierfüßlerstand beginnen.", "Einatmen und den rechten Arm zur Seite nach oben öffnen, Blick folgt der Hand.", "Ausatmen und den Arm unter dem linken Arm hindurchschieben, rechte Schulter und Schläfe sinken auf den Boden.", "Hüften bleiben über den Knien, einige Atemzüge halten, dann Seite wechseln."],
    f: ["Hüften zur Seite schieben: Becken bleibt über den Knien.", "Gewicht auf den Nacken legen: Die linke Hand drückt leicht in den Boden und entlastet."],
    l: "Nur die Öffnung zur Decke machen und den Arm nicht durchfädeln.", h: "Den oberen Arm hinter den Rücken legen und die Hand zur Innenseite des Oberschenkels führen.",
    v: "Bei Nacken- oder Schulterbeschwerden nur so weit gehen, wie es angenehm ist." },
  birddog: { s: ["Im Vierfüßlerstand den Bauch leicht anspannen.", "Gleichzeitig den rechten Arm nach vorne und das linke Bein nach hinten strecken, beide auf Höhe des Rumpfes.", "Becken bleibt waagerecht, kurz halten und lang machen.", "Ausatmend Ellbogen und Knie unter dem Bauch zusammenführen oder ablegen, dann wiederholen und Seite wechseln."],
    f: ["Bein zu hoch heben: Das führt ins Hohlkreuz, Bein nur bis Hüfthöhe.", "Becken kippt zur Seite: Langsamer bewegen und den Bauch fester halten."],
    l: "Nur das Bein oder nur den Arm abheben.", h: "Die Position 5 Sekunden halten oder eine leichte Kurzhantel in die Hand nehmen." },
  hipcircles: { s: ["Im Vierfüßlerstand beginnen, Hände und Knie bleiben am Platz.", "Das Gesäß langsam in großen Kreisen bewegen: nach vorne, zur Seite, Richtung Fersen und zur anderen Seite.", "Ruhig weiteratmen und die Kreise größer werden lassen.", "Nach einigen Kreisen die Richtung wechseln."],
    f: ["Zu schnell kreisen: Langsam bleiben, damit Hüfte und unterer Rücken mitarbeiten.", "Arme beugen: Die Arme bleiben locker gestreckt."],
    l: "Kleinere Kreise machen oder im Stehen mit den Händen an den Hüften kreisen.", h: "Ein Bein angewinkelt zur Seite heben und mit dem Knie Kreise ziehen." },
  neckstretch: { s: ["Aufrecht sitzen, Schultern locker nach unten sinken lassen.", "Das rechte Ohr langsam Richtung rechte Schulter neigen.", "Die rechte Hand kann leicht auf den Kopf gelegt werden, die linke Schulter zieht sanft nach unten.", "Ruhig atmen, halten und dann langsam zur Mitte zurück und Seite wechseln."],
    f: ["Mit der Hand am Kopf ziehen: Die Hand liegt nur auf, der Kopf sinkt durch sein Gewicht.", "Schulter zum Ohr heben: Beide Schultern bleiben tief."],
    l: "Ohne Hand nur den Kopf neigen.", h: "Kinn zusätzlich leicht zur Achsel drehen, um den hinteren Nacken zu dehnen.",
    v: "Bei Schwindel, Kribbeln in den Armen oder bekannten Problemen der Halswirbelsäule nur sehr sanft oder gar nicht dehnen." },
  shouldercircles: { s: ["Aufrecht stehen oder sitzen, Arme locker hängen lassen.", "Die Schultern langsam nach vorne, oben, hinten und unten kreisen.", "Danach die gestreckten Arme in großen Kreisen nach hinten bewegen.", "Richtung wechseln und ruhig weiteratmen."],
    f: ["Ins Hohlkreuz gehen: Rippen bleiben über dem Becken.", "Zu schnell schwingen: Kontrolliert und gleichmäßig kreisen."],
    l: "Nur die Schultern kreisen, ohne die Arme zu strecken.", h: "Mit leichten Gewichten oder einem Band über Kopf nach hinten führen (Durchschwingen).",
    v: "Bei Schulterschmerzen nur im schmerzfreien Bereich bewegen." },
  wristmob: { s: ["Im Vierfüßlerstand oder am Tisch die Hände aufsetzen.", "Das Gewicht langsam vor und zurück, dann seitlich über die Hände verlagern.", "Danach die Hände mit den Fingern Richtung Knie drehen und sanft nach hinten lehnen.", "Zum Schluss die Handgelenke im Stand locker kreisen."],
    f: ["Zu viel Gewicht auf einmal: Langsam steigern.", "Finger heben: Die ganze Handfläche bleibt am Boden."],
    l: "Im Stehen an einer Tischkante ausführen, mit weniger Gewicht.", h: "Auch den Handrücken aufsetzen und vorsichtig belasten.",
    v: "Bei akuten Handgelenkschmerzen oder nach Verletzungen nur ohne Gewicht kreisen." },
  palmtree: { s: ["Hüftbreit stehen, beide Arme über den Kopf strecken.", "Die linke Hand greift das rechte Handgelenk.", "Ausatmend den Oberkörper nach links neigen, die Hüfte schiebt leicht nach rechts.", "Einatmend zur Mitte, dann Seite wechseln."],
    f: ["Nach vorne kippen: Der Oberkörper neigt sich nur zur Seite.", "Schultern hochziehen: Schultern bleiben weg von den Ohren."],
    l: "Eine Hand an der Hüfte lassen und nur einen Arm über den Kopf nehmen.", h: "Die Füße eng zusammenstellen und die Neigung länger halten." },
  mountain: { s: ["Füße hüftbreit oder geschlossen, Gewicht gleichmäßig auf Ballen und Fersen.", "Knie leicht aktiv, Becken neutral, Bauch sanft angespannt.", "Brustbein heben, Schultern nach hinten unten sinken lassen, Arme hängen locker.", "Scheitel wächst nach oben, ruhig und gleichmäßig atmen."],
    f: ["Knie durchdrücken: Sie bleiben leicht aktiv, nicht überstreckt.", "Gewicht auf den Fersen: Etwas nach vorne verlagern, bis es gleichmäßig verteilt ist."],
    l: "Mit dem Rücken an einer Wand stehen, um die Haltung zu spüren.", h: "Mit geschlossenen Augen stehen." },
  warrior1: { s: ["Aus dem Stand einen großen Schritt zurück, hinterer Fuß etwa im 45-Grad-Winkel nach außen.", "Vorderes Knie über den Knöchel beugen, das hintere Bein bleibt gestreckt.", "Hüfte nach vorne ausrichten, Arme über den Kopf strecken.", "Schultern sinken, Blick nach vorne oder zu den Händen, halten und Seite wechseln."],
    f: ["Knie fällt nach innen: Es zeigt Richtung zweiter oder dritter Zehe.", "Hohlkreuz: Steißbein leicht nach unten lang machen und den Bauch halten."],
    l: "Füße etwas breiter auseinander stellen oder die Hände an die Hüfte nehmen.", h: "Tiefer in das vordere Knie gehen, bis der Oberschenkel fast waagerecht ist." },
  warrior2: { s: ["Füße weit auseinander stellen, vorderen Fuß nach außen drehen, den hinteren leicht nach innen.", "Vordere Ferse zeigt zur Mitte des hinteren Fußes.", "Vorderes Knie über den Knöchel beugen, Arme auf Schulterhöhe ausstrecken.", "Oberkörper aufrecht über der Mitte, Blick über die vordere Hand, halten und Seite wechseln."],
    f: ["Oberkörper lehnt nach vorne: Schultern bleiben über dem Becken.", "Knie kippt nach innen: Es zeigt Richtung kleiner Zeh."],
    l: "Knie weniger tief beugen oder die Hände in die Hüfte stützen.", h: "So tief gehen, dass der vordere Oberschenkel waagerecht ist, und länger halten." },
  reversewarrior: { s: ["Aus Krieger II beginnen.", "Die vordere Hand nach oben und hinten strecken, die hintere Hand gleitet am hinteren Bein nach unten.", "Das vordere Knie bleibt gebeugt und über dem Knöchel.", "Die vordere Körperseite lang machen, ruhig atmen und Seite wechseln."],
    f: ["Gewicht auf die hintere Hand legen: Sie liegt nur leicht am Bein.", "Vorderes Knie streckt sich: Es bleibt gebeugt."],
    l: "Die obere Hand an die Hüfte statt über den Kopf nehmen.", h: "Den hinteren Arm hinter den Rücken legen und die Seitneigung vertiefen." },
  humblewarrior: { s: ["Aus Krieger I die Hände hinter dem Rücken verschränken.", "Brust öffnen, Schultern nach hinten.", "Ausatmend den Oberkörper innen am vorderen Knie vorbei nach unten beugen.", "Die Arme Richtung Decke sinken lassen, Kopf locker, halten und Seite wechseln."],
    f: ["Knie streckt sich: Das vordere Knie bleibt gebeugt.", "Gewicht kippt nach vorne: Der hintere Fuß bleibt fest am Boden."],
    l: "Ein Band oder Handtuch zwischen die Hände nehmen.", h: "Die verschränkten Arme weiter über den Kopf Richtung Boden sinken lassen.",
    v: "Bei Bluthochdruck oder Schwindel den Kopf nicht unter das Herz bringen." },
  sideangle: { s: ["Aus Krieger II den vorderen Unterarm auf den Oberschenkel legen oder die Hand innen neben den Fuß setzen.", "Den oberen Arm schräg über das Ohr strecken.", "Von der hinteren Ferse bis zu den Fingerspitzen eine lange Linie bilden.", "Brust zur Decke drehen, ruhig atmen und Seite wechseln."],
    f: ["Oberkörper sackt zusammen: Die obere Körperseite lang machen.", "Vorderes Knie fällt nach innen: Knie drückt sanft gegen den Arm."],
    l: "Den Unterarm auf den Oberschenkel legen statt die Hand auf den Boden.", h: "Die untere Hand außen neben den Fuß setzen oder die Arme unter dem Bein binden." },
  revsideangle: { s: ["Aus einem hohen Ausfallschritt die Hände vor der Brust zusammenlegen.", "Ausatmend den Oberkörper drehen und den Ellbogen außen an das vordere Knie haken.", "Mit jedem Einatmen lang werden, mit jedem Ausatmen etwas mehr drehen.", "Das hintere Bein bleibt aktiv gestreckt, halten und Seite wechseln."],
    f: ["Rücken wird rund: Erst lang machen, dann drehen.", "Vorderes Knie wandert zur Seite: Es bleibt über dem Knöchel."],
    l: "Das hintere Knie auf den Boden ablegen.", h: "Die untere Hand außen neben den Fuß setzen und den oberen Arm über das Ohr strecken.",
    v: "In der Schwangerschaft keine tiefen Drehungen über dem Bauch." },
  triangle: { s: ["Füße weit auseinander, vorderen Fuß nach außen drehen, Beine gestreckt.", "Arme auf Schulterhöhe ausstrecken und den Oberkörper weit über das vordere Bein schieben.", "Dann die vordere Hand an Schienbein, Block oder Boden sinken lassen, der obere Arm zeigt zur Decke.", "Beide Körperseiten lang halten, Blick nach oben oder zur Seite, Seite wechseln."],
    f: ["Oberkörper kippt nach vorne: Brust bleibt zur Seite geöffnet.", "Vorderes Knie überstreckt: Ganz leicht gebeugt lassen."],
    l: "Die Hand auf einen Block oder höher am Schienbein ablegen.", h: "Die vordere Hand hinter den Fuß auf den Boden setzen und den Blick zur oberen Hand nehmen.",
    v: "Bei Nackenproblemen den Blick nach vorne statt nach oben richten." },
  revtriangle: { s: ["Füße etwas enger als im Dreieck, Hüfte nach vorne ausrichten, beide Beine gestreckt.", "Rücken lang machen und mit geradem Rücken nach vorne beugen.", "Die hintere Hand an das vordere Schienbein, einen Block oder den Boden setzen, den anderen Arm nach oben strecken.", "Brust zur Seite drehen, ruhig atmen und Seite wechseln."],
    f: ["Rücken rund: Lieber weniger tief, dafür lang.", "Gewicht auf der Hand: Die Beine tragen, die Hand stützt nur."],
    l: "Einen Block unter die Hand stellen oder die Hand an das Schienbein legen.", h: "Die Hand außen neben den vorderen Fuß auf den Boden setzen.",
    v: "Bei Rückenproblemen oder in der Schwangerschaft vorsichtig und nur leicht drehen." },
  chair: { s: ["Füße hüftbreit oder geschlossen, Gewicht auf den Fersen.", "Knie beugen und das Gesäß nach hinten schieben, als würdest du dich setzen.", "Arme über den Kopf strecken, Oberkörper leicht vorgeneigt mit langem Rücken.", "Bauch halten, ruhig atmen und die Position halten."],
    f: ["Knie schieben weit über die Zehen: Gewicht mehr auf die Fersen.", "Hohlkreuz: Rippen nach unten und den Bauch halten."],
    l: "Weniger tief gehen oder die Hände vor der Brust zusammenlegen.", h: "Tiefer gehen, bis die Oberschenkel fast waagerecht sind, und auf die Zehenspitzen kommen.",
    v: "Bei Knieproblemen nur so tief gehen, wie es schmerzfrei ist." },
  revchair: { s: ["Aus dem Stuhl die Hände vor der Brust zusammenlegen.", "Ausatmend den Oberkörper drehen und den Ellbogen außen an das gegenüberliegende Knie haken.", "Knie bleiben auf gleicher Höhe, Gesäß tief.", "Mit dem Einatmen lang werden, mit dem Ausatmen drehen, dann Seite wechseln."],
    f: ["Ein Knie schiebt nach vorne: Beide Knie bleiben nebeneinander.", "Rücken wird rund: Brustbein Richtung Daumen schieben."],
    l: "Eine Hand auf dem Oberschenkel, die andere an der Hüfte, nur leicht drehen.", h: "Die untere Hand außen neben den Fuß auf den Boden setzen und den oberen Arm strecken.",
    v: "In der Schwangerschaft keine tiefen Drehungen." },
  pyramid: { s: ["Aus dem Stand einen kurzen Schritt zurück, hinterer Fuß leicht ausgedreht, beide Beine gestreckt.", "Hüfte nach vorne ausrichten, Hände an die Hüfte.", "Mit langem Rücken über das vordere Bein nach vorne beugen.", "Hände an Blöcke, Schienbein oder Boden, Nacken locker, halten und Seite wechseln."],
    f: ["Rücken stark gerundet: Erst lang machen, dann nach vorne sinken.", "Vorderes Knie durchgedrückt: Minimal gebeugt lassen."],
    l: "Die Hände auf Blöcke stellen oder das vordere Knie etwas beugen.", h: "Die Hände hinter dem Rücken zum umgekehrten Gebet zusammenlegen.",
    v: "Bei Problemen mit den hinteren Oberschenkeln die Dehnung sanft halten." },
  widefold: { s: ["Füße weit auseinander und parallel stellen, Hände an die Hüfte.", "Einatmend lang werden, ausatmend mit geradem Rücken nach vorne beugen.", "Hände schulterbreit auf den Boden setzen, Ellbogen beugen und den Kopf Richtung Boden sinken lassen.", "Gewicht leicht nach vorne auf die Ballen, halten und mit geradem Rücken wieder aufrichten."],
    f: ["Füße drehen nach außen: Sie bleiben parallel.", "Schnell aufrichten: Langsam und mit den Händen an der Hüfte hochkommen."],
    l: "Die Hände auf Blöcke stellen und den Rücken lang halten.", h: "Die Hände hinter dem Rücken verschränken und die Arme Richtung Boden sinken lassen.",
    v: "Bei Bluthochdruck oder Schwindel den Kopf nicht lange tiefer als das Herz halten." },
  goddess: { s: ["Füße weit auseinander, Zehen etwa 45 Grad nach außen drehen.", "Knie in Richtung der Zehen beugen und das Becken tief sinken lassen.", "Oberkörper aufrecht, Arme seitlich mit gebeugten Ellbogen nach oben (Kaktusarme).", "Bauch halten, ruhig atmen und die Position halten."],
    f: ["Knie fallen nach innen: Sie zeigen über die Zehen nach außen.", "Hohlkreuz: Steißbein nach unten lang machen."],
    l: "Weniger tief gehen und die Hände auf die Oberschenkel stützen.", h: "Die Fersen heben und auf den Ballen halten oder pulsierend auf und ab gehen." },
  highlunge: { s: ["Aus dem Stand einen großen Schritt zurück, hintere Ferse bleibt gehoben.", "Vorderes Knie über den Knöchel beugen, hinteres Bein aktiv gestreckt.", "Hüfte nach vorne ausrichten und die Arme über den Kopf strecken.", "Bauch halten, ruhig atmen, halten und Seite wechseln."],
    f: ["Hinteres Knie sackt durch: Das hintere Bein bleibt lang und aktiv.", "Gewicht nur vorne: Gleichmäßig auf beide Beine verteilen."],
    l: "Das hintere Knie auf den Boden ablegen (tiefer Ausfallschritt).", h: "Tiefer gehen oder die Arme hinter dem Rücken verschränken und die Brust öffnen." },
  lowlunge: { s: ["Aus dem Vierfüßlerstand einen Fuß zwischen die Hände setzen.", "Das hintere Knie mit gestrecktem Fußrücken ablegen.", "Oberkörper aufrichten, Hände auf den Oberschenkel oder über den Kopf.", "Becken sanft nach vorne unten sinken lassen, halten und Seite wechseln."],
    f: ["Ins Hohlkreuz sinken: Bauch halten und das Steißbein nach unten lang machen.", "Vorderes Knie weit über die Zehen: Den Fuß weiter nach vorne setzen."],
    l: "Eine Decke unter das hintere Knie legen und die Hände auf Blöcke stützen.", h: "Den hinteren Fuß greifen und die Ferse Richtung Gesäß ziehen.",
    v: "Bei empfindlichen Knien das hintere Knie gut polstern." },
  skandasana: { s: ["Aus dem breiten Stand das Gewicht auf ein Bein verlagern und dieses tief beugen.", "Das andere Bein bleibt gestreckt, Zehen zeigen nach oben.", "Hände vor der Brust oder am Boden, Oberkörper so aufrecht wie möglich.", "Langsam über die Mitte zur anderen Seite wechseln."],
    f: ["Ferse des gebeugten Beins hebt sich: Möglichst am Boden lassen, sonst weniger tief gehen.", "Rücken wird rund: Brust heben und lang bleiben."],
    l: "Die Hände auf Blöcke stützen und weniger tief gehen.", h: "Ohne Hände am Boden halten und die Arme nach vorne strecken.",
    v: "Bei Knieproblemen nur in der schmerzfreien Tiefe üben." },
  tree: { s: ["Gewicht auf das linke Bein verlagern, den Blick auf einen festen Punkt richten.", "Die rechte Fußsohle an die Innenseite von Wade oder Oberschenkel setzen, nicht direkt ans Knie.", "Fuß und Bein drücken gegeneinander, das Becken bleibt gerade.", "Hände vor der Brust oder über dem Kopf, ruhig atmen und Seite wechseln."],
    f: ["Fuß drückt gegen das Knie: Er liegt unter oder über dem Knie.", "Hüfte schiebt zur Seite: Becken mittig über dem Standbein halten."],
    l: "Die Zehen des angehobenen Fußes am Boden lassen und nur die Ferse an den Knöchel legen oder sich an einer Wand abstützen.", h: "Die Augen schließen oder die Arme über dem Kopf langsam hin und her wiegen." },
  warrior3: { s: ["Aus dem Stand das Gewicht auf ein Bein verlagern, Standbein minimal gebeugt.", "Oberkörper nach vorne kippen und gleichzeitig das andere Bein nach hinten anheben.", "Oberkörper und hinteres Bein bilden eine waagerechte Linie, Hüften parallel zum Boden.", "Arme nach vorne oder zur Seite strecken, halten und Seite wechseln."],
    f: ["Hüfte des gehobenen Beins dreht auf: Zehen zeigen zum Boden.", "Rücken rund: Vom Scheitel bis zur Ferse lang machen."],
    l: "Die Hände auf Blöcke oder eine Stuhllehne stützen.", h: "Die Arme nach vorne strecken und die Position länger halten." },
  halfmoon: { s: ["Aus dem Dreieck das vordere Knie beugen und die vordere Hand etwa eine Fußlänge vor den Fuß setzen.", "Gewicht auf das vordere Bein verlagern und das hintere Bein auf Hüfthöhe anheben.", "Standbein strecken, Hüfte und Brust zur Seite öffnen, oberer Arm zur Decke.", "Blick zum Boden oder nach oben, halten und Seite wechseln."],
    f: ["Gewicht auf der Hand: Das Standbein trägt.", "Oberes Bein sinkt ab: Aktiv halten, Ferse schiebt nach hinten."],
    l: "Einen Block unter die untere Hand stellen oder mit dem Rücken an einer Wand üben.", h: "Die untere Hand abheben oder den hinteren Fuß greifen (Zuckerrohr)." },
  revhalfmoon: { s: ["Aus Krieger III die gegenüberliegende Hand unter die Schulter auf Boden oder Block setzen.", "Das gehobene Bein bleibt auf Hüfthöhe, Hüften parallel zum Boden.", "Den Oberkörper Richtung Standbein drehen und den anderen Arm zur Decke strecken.", "Ruhig atmen, halten und Seite wechseln."],
    f: ["Hüfte des gehobenen Beins öffnet sich: Hüften bleiben waagerecht, nur der Oberkörper dreht.", "Standbein überstreckt: Leicht aktiv beugen."],
    l: "Einen Block unter die Hand stellen und die obere Hand an die Hüfte legen.", h: "Die untere Hand nur mit den Fingerspitzen aufsetzen.",
    v: "Bei Rücken- oder Gleichgewichtsproblemen an einer Wand üben." },
  eagle: { s: ["Knie beugen, das rechte Bein über das linke schlagen, Fuß wenn möglich hinter die linke Wade haken.", "Arme vor dem Körper kreuzen, linker Arm über dem rechten, Ellbogen beugen und Handflächen aneinander bringen.", "Ellbogen auf Schulterhöhe heben, Hüfte tief sinken lassen.", "Blick nach vorne, ruhig atmen und Seite wechseln."],
    f: ["Oberkörper kippt nach vorne: Aufrecht bleiben und die Hüfte nach hinten setzen.", "Schultern hochgezogen: Schultern bleiben tief."],
    l: "Die Zehen des oberen Beins am Boden lassen oder die Arme nur überkreuzen und die Schultern umarmen.", h: "Tiefer in die Knie gehen und den Oberkörper aus dieser Position nach vorne beugen.",
    v: "Bei Knieproblemen das Bein nicht hinter die Wade haken." },
  dancer: { s: ["Gewicht auf das linke Bein, mit der rechten Hand den rechten Fuß von innen greifen.", "Den linken Arm nach vorne oben strecken.", "Den Fuß in die Hand drücken und den Oberkörper langsam nach vorne neigen, während das Bein nach hinten oben steigt.", "Brust offen halten, ruhig atmen und Seite wechseln."],
    f: ["Knie des gehobenen Beins dreht nach außen: Es zeigt nach hinten.", "Nur mit dem Oberkörper nach vorne kippen: Der Fuß drückt aktiv in die Hand und hebt das Bein."],
    l: "Einen Gurt um den Fuß legen oder sich mit der vorderen Hand an einer Wand halten.", h: "Mit beiden Händen über dem Kopf den Fuß greifen." },
  handtotoe: { s: ["Auf einem Bein stehen, das andere Knie zur Brust ziehen.", "Mit Zeige- und Mittelfinger den großen Zeh greifen, andere Hand an die Hüfte.", "Das Bein nach vorne strecken, Oberkörper aufrecht.", "Ruhig atmen, halten und Seite wechseln."],
    f: ["Rücken wird rund, um das Bein zu strecken: Lieber das Knie beugen und aufrecht bleiben.", "Standbein knickt ein: Es bleibt lang."],
    l: "Das Knie gebeugt halten oder einen Gurt um den Fuß legen.", h: "Das gestreckte Bein zur Seite öffnen und den Blick zur anderen Seite nehmen." },
  standsplit: { s: ["Aus der stehenden Vorbeuge die Hände neben einen Fuß setzen.", "Das Gewicht auf diesen Fuß verlagern und das andere Bein gestreckt nach hinten oben heben.", "Oberkörper Richtung Standbein sinken lassen, Hüften möglichst gerade.", "Ruhig atmen, halten und Seite wechseln."],
    f: ["Hüfte des gehobenen Beins dreht weit auf: Etwas weniger hoch, dafür gerade.", "Standbein überstreckt: Minimal gebeugt lassen."],
    l: "Die Hände auf Blöcke stellen und das Bein nur so hoch wie angenehm heben.", h: "Mit einer oder beiden Händen den Knöchel des Standbeins greifen.",
    v: "Bei Bluthochdruck den Kopf nicht lange unter das Herz bringen." },
  sugarcane: { s: ["Aus dem Halbmond das obere Knie beugen.", "Mit der oberen Hand den Fußrücken oder Knöchel greifen.", "Den Fuß in die Hand drücken und die Brust zur Seite und nach oben öffnen.", "Ruhig atmen, halten und Seite wechseln."],
    f: ["Gewicht auf die untere Hand: Das Standbein trägt.", "Oberkörper sackt zum Boden: Die obere Körperseite lang machen."],
    l: "Einen Block unter die untere Hand stellen und den Fuß nur leicht greifen.", h: "Den Fuß weiter vom Gesäß wegdrücken, um die Rückbeuge zu vertiefen." },
  figurefour: { s: ["Auf einem Bein stehen, den anderen Knöchel über das Knie des Standbeins legen.", "Das Standbein beugen und das Gesäß wie beim Stuhl nach hinten schieben.", "Hände vor der Brust, Oberkörper mit langem Rücken leicht nach vorne.", "Ruhig atmen, halten und Seite wechseln."],
    f: ["Knie des oberen Beins zeigt nach oben: Es sinkt Richtung Boden, der Fuß bleibt gebeugt.", "Rücken rund: Brust nach vorne schieben."],
    l: "Mit einer Hand an einer Wand oder Stuhllehne festhalten.", h: "Tiefer gehen und die Hände vor dem Fuß auf den Boden bringen.",
    v: "Bei Knieproblemen den Fuß aktiv gebeugt halten, damit das Knie geschützt ist." },
  cobra: { s: ["Auf dem Bauch liegen, Hände neben der Brust, Ellbogen nah am Körper.", "Fußrücken und Schambein in den Boden drücken.", "Einatmend Kopf und Brust anheben, die Kraft kommt vor allem aus dem Rücken, die Hände helfen nur.", "Schultern weg von den Ohren, einige Atemzüge halten und ausatmend ablegen."],
    f: ["Arme ganz durchstrecken und ins Hohlkreuz drücken: Nur so hoch, wie der Rücken trägt.", "Nacken überstreckt: Blick nach vorne unten, Nacken lang."],
    l: "Nur die Brust leicht anheben (kleine Kobra) oder in die Sphinx gehen.", h: "Die Hände kurz vom Boden lösen und die Höhe nur mit dem Rücken halten.",
    v: "Bei Bandscheibenproblemen oder in der Schwangerschaft vorsichtig, eher die Sphinx wählen." },
  sphinx: { s: ["Auf dem Bauch liegen, Unterarme parallel aufsetzen, Ellbogen unter den Schultern.", "Brust nach vorne oben ziehen, Schultern weg von den Ohren.", "Beine locker, Schambein bleibt am Boden.", "Ruhig atmen und die sanfte Rückbeuge halten."],
    f: ["Zwischen den Schultern durchhängen: Unterarme leicht in den Boden drücken.", "Gesäß fest anspannen: Locker lassen, damit der untere Rücken entspannt."],
    l: "Ellbogen etwas weiter nach vorne setzen, damit die Beugung kleiner wird.", h: "Die Ellbogen weiter Richtung Körper holen oder in die Kobra übergehen.",
    v: "Bei Schmerzen im unteren Rücken die Position sofort verlassen." },
  updog: { s: ["Auf dem Bauch liegen, Hände neben den unteren Rippen, Fußrücken am Boden.", "Einatmend die Arme strecken und Brust und Oberschenkel vom Boden heben.", "Nur Hände und Fußrücken berühren den Boden, die Beine sind aktiv.", "Schultern nach hinten unten, Brust nach vorne, kurz halten."],
    f: ["Schultern zu den Ohren: Den Boden wegschieben und die Schultern sinken lassen.", "Ellbogen überstreckt: Arme gerade, aber nicht durchgedrückt."],
    l: "Die Oberschenkel am Boden lassen oder die Kobra machen.", h: "Länger halten oder aus dem Hund in einem Fluss in den heraufschauenden Hund rollen.",
    v: "Bei Handgelenk- oder Rückenproblemen vorsichtig, eher die Kobra wählen." },
  locust: { s: ["Auf dem Bauch liegen, Arme neben dem Körper, Handflächen nach unten.", "Stirn am Boden, Beine hüftbreit.", "Einatmend Kopf, Brust, Arme und Beine gleichzeitig anheben.", "Blick nach unten, Nacken lang, einige Atemzüge halten und ablegen."],
    f: ["Kopf in den Nacken: Der Nacken bleibt eine Verlängerung der Wirbelsäule.", "Beine nur durch Schwung hoch: Langsam und kontrolliert heben."],
    l: "Nur den Oberkörper oder nur die Beine anheben.", h: "Die Arme nach vorne strecken (Superman) oder die Hände hinter dem Rücken verschränken.",
    v: "In der Schwangerschaft nicht auf dem Bauch üben." },
  bow: { s: ["Auf dem Bauch liegen, Knie beugen und mit den Händen die Knöchel von außen greifen.", "Knie etwa hüftbreit lassen.", "Einatmend die Füße in die Hände drücken, dadurch heben sich Brust und Oberschenkel.", "Brust öffnen, ruhig atmen, halten und ausatmend ablegen."],
    f: ["Mit den Armen ziehen: Die Beine drücken nach hinten, die Arme bleiben gestreckt.", "Knie fallen weit auseinander: Etwa hüftbreit halten."],
    l: "Nur einen Fuß greifen (halber Bogen) oder einen Gurt um die Füße legen.", h: "Die Knie und Füße näher zusammenbringen und sanft vor und zurück schaukeln.",
    v: "Bei Rückenproblemen, nach Bauchoperationen oder in der Schwangerschaft nicht üben." },
  bridge: { s: ["Auf dem Rücken liegen, Knie gebeugt, Füße hüftbreit nah am Gesäß.", "Arme neben dem Körper, Handflächen nach unten.", "Einatmend die Füße in den Boden drücken und das Becken Wirbel für Wirbel anheben.", "Knie zeigen nach vorne, halten und ausatmend Wirbel für Wirbel abrollen."],
    f: ["Knie fallen auseinander: Sie bleiben hüftbreit, notfalls einen Block dazwischen.", "Kopf drehen: Der Kopf bleibt gerade, sonst wird der Nacken belastet."],
    l: "Einen Block unter das Kreuzbein legen und passiv liegen (gestützte Brücke).", h: "Ein Bein zur Decke strecken (einbeinige Brücke) oder die Hände unter dem Rücken verschränken.",
    v: "Bei Nackenproblemen nicht zu hoch gehen." },
  wheel: { s: ["Auf dem Rücken liegen, Füße hüftbreit nah am Gesäß, Hände neben den Ohren mit den Fingern zu den Schultern.", "Einatmend Becken heben und den Kopf auf dem Scheitel absetzen.", "Ellbogen parallel halten und dann Arme und Beine strecken, bis Kopf und Brust vom Boden kommen.", "Kurz halten, dann Kinn zur Brust und langsam abrollen."],
    f: ["Ellbogen und Knie fallen nach außen: Parallel halten.", "Zu schnell hineinspringen: Erst Schultern und Brust mit Brücke und Kamel vorbereiten."],
    l: "Bei der Vorstufe mit dem Kopf am Boden bleiben oder die Brücke üben.", h: "Die Füße näher an die Hände wandern lassen oder ein Bein heben.",
    v: "Bei Rücken-, Schulter- oder Handgelenkproblemen, Bluthochdruck und in der Schwangerschaft nicht üben." },
  camel: { s: ["Aufrecht knien, Knie hüftbreit, Hände an den unteren Rücken mit den Fingern nach unten.", "Hüfte über den Knien halten und das Brustbein nach oben heben.", "Langsam nach hinten neigen, wenn möglich die Hände an die Fersen legen.", "Nacken lang, ruhig atmen und mit den Händen am Rücken langsam aufrichten."],
    f: ["Hüfte sinkt nach hinten: Sie bleibt über den Knien.", "Kopf fällt in den Nacken: Den Kopf nur so weit sinken lassen, wie es angenehm ist."],
    l: "Die Hände am unteren Rücken lassen oder die Zehen aufstellen, damit die Fersen höher sind.", h: "Die Fußrücken flach ablegen und die Hände an die Fußsohlen legen.",
    v: "Bei Rücken- oder Nackenproblemen, Bluthochdruck oder Schwindel vorsichtig oder gar nicht üben." },
  fish: { s: ["Auf dem Rücken liegen, Hände mit den Handflächen nach unten unter das Gesäß schieben.", "Auf die Unterarme stützen und die Brust nach oben heben.", "Den Kopf sanft nach hinten sinken lassen, wenig Gewicht liegt auf dem Scheitel.", "Ruhig atmen, dann Kinn zur Brust und ablegen."],
    f: ["Viel Gewicht auf den Kopf: Die Unterarme tragen.", "Beine anspannen und heben: Die Beine bleiben locker am Boden."],
    l: "Einen Block oder eine gerollte Decke unter die Schulterblätter legen und den Kopf ablegen.", h: "Die Beine im Lotus kreuzen oder gestreckt leicht vom Boden heben.",
    v: "Bei Nackenproblemen den Kopf nicht nach hinten sinken lassen, sondern abstützen." },
  reversetable: { s: ["Sitzen, Knie gebeugt, Füße hüftbreit, Hände hinter dem Gesäß mit den Fingern zu den Füßen.", "Einatmend das Becken heben, bis Rumpf und Oberschenkel eine waagerechte Linie bilden.", "Knie über den Knöcheln, Schultern über den Händen.", "Kopf in Verlängerung oder sanft nach hinten, halten und ablegen."],
    f: ["Becken hängt durch: Gesäß aktiv anspannen.", "Schultern zu den Ohren: Brust öffnen und Schultern nach hinten."],
    l: "Das Becken nur ein Stück anheben und den Kopf gerade halten.", h: "Ein Bein gestreckt anheben oder in die schiefe Ebene mit gestreckten Beinen gehen.",
    v: "Bei Handgelenkproblemen auf die Fäuste stützen." },
  upwardplank: { s: ["Sitzen, Beine gestreckt, Hände hinter dem Gesäß mit den Fingern zu den Füßen.", "Einatmend die Fußsohlen Richtung Boden drücken und das Becken hoch heben.", "Der Körper bildet eine schräge Linie von den Füßen bis zu den Schultern.", "Kopf in Verlängerung oder sanft nach hinten, halten und ablegen."],
    f: ["Becken sackt ab: Gesäß und Beine aktiv anspannen.", "Ellbogen überstreckt: Arme gerade, aber nicht durchgedrückt."],
    l: "Die Knie gebeugt lassen (umgekehrter Tisch).", h: "Ein Bein gestreckt anheben.",
    v: "Bei Handgelenk- oder Schulterproblemen vorsichtig." },
  wildthing: { s: ["Aus dem Seitstütz oder dem dreibeinigen Hund das obere Bein nach hinten absetzen, Knie gebeugt.", "Das Becken nach oben schieben, die Brust öffnet sich zur Decke.", "Den freien Arm über den Kopf strecken.", "Ruhig atmen, halten, zurückkommen und Seite wechseln."],
    f: ["Gewicht hängt in der Schulter: Den Boden mit der Stützhand aktiv wegdrücken.", "Becken sackt ab: Hüfte aktiv nach oben heben."],
    l: "Mit dem unteren Knie am Boden bleiben und nur die Brust öffnen.", h: "Aus der Position in einem Fluss in das Rad übergehen.",
    v: "Bei Schulter- oder Handgelenkproblemen nicht üben." },
  kingpigeon: { s: ["Aus der halben Taube das hintere Knie beugen.", "Mit der Hand derselben Seite den hinteren Fuß greifen und die Ellbogen nach oben drehen.", "Mit beiden Händen über dem Kopf den Fuß fassen und Richtung Hinterkopf ziehen.", "Brust heben, ruhig atmen, langsam lösen und Seite wechseln."],
    f: ["Becken kippt zur Seite: Hüfte möglichst gerade, notfalls eine Decke unter das Gesäß.", "Mit Kraft ziehen: Nur so weit gehen, wie Rücken und Schultern es zulassen."],
    l: "Einen Gurt um den hinteren Fuß legen.", h: "Den Kopf mit dem Hinterkopf an die Fußsohle legen.",
    v: "Fortgeschrittene Haltung: bei Knie-, Rücken- oder Schulterproblemen nicht üben." },
  puppy: { s: ["Im Vierfüßlerstand die Hände ein Stück nach vorne wandern lassen.", "Hüften bleiben über den Knien.", "Brust Richtung Boden sinken lassen, Stirn oder Kinn ablegen, Arme gestreckt.", "Ruhig in den oberen Rücken atmen und halten."],
    f: ["Gesäß sinkt zu den Fersen: Das wäre die Kindhaltung, Hüfte bleibt hoch.", "Ellbogen hängen durch: Arme aktiv, Handflächen drücken leicht."],
    l: "Die Hände auf Blöcke legen.", h: "Die Hände enger zusammenbringen und die Brust tiefer sinken lassen.",
    v: "Bei Schulterproblemen nur sanft dehnen." },
  crow: { s: ["In die Hocke kommen, Hände schulterbreit vor die Füße, Finger gespreizt.", "Ellbogen leicht beugen und die Knie hoch an die Oberarme setzen.", "Gewicht langsam nach vorne verlagern, Blick nach vorne auf den Boden.", "Einen Fuß nach dem anderen abheben, dann beide, kurz halten und kontrolliert absetzen."],
    f: ["Blick zwischen die Füße: Wer nach unten schaut, kippt eher, Blick nach vorne.", "Zu wenig Gewicht nach vorne: Schultern deutlich über die Hände schieben."],
    l: "Die Füße auf einen Block stellen oder nur einen Fuß abheben.", h: "Die Arme strecken (Kranich) oder aus der Krähe in den Chaturanga springen.",
    v: "Ein Kissen vor den Kopf legen. Bei Handgelenkproblemen nicht üben." },
  sidecrow: { s: ["In die Hocke, Knie zusammen, Oberkörper zur Seite drehen.", "Hände schulterbreit neben die Außenseite des Oberschenkels setzen.", "Ellbogen beugen, sodass eine Ablage für die Beine entsteht.", "Gewicht nach vorne verlagern und beide Füße abheben, halten und Seite wechseln."],
    f: ["Zu wenig Drehung: Die Hände liegen wirklich seitlich neben den Beinen.", "Ellbogen fallen nach außen: Sie zeigen nach hinten."],
    l: "Die Hüfte auf einen Block stützen oder nur die Füße leicht anheben.", h: "Die Beine zur Seite strecken (Koundinya-Haltung).",
    v: "Bei Handgelenk- oder Schulterproblemen nicht üben." },
  firefly: { s: ["In eine breite Hocke kommen, Oberkörper zwischen die Beine schieben.", "Schultern hinter die Knie bringen, Hände hinter den Fersen aufsetzen.", "Gewicht nach hinten auf die Hände verlagern, Oberschenkel liegen hoch auf den Oberarmen.", "Die Füße abheben und die Beine möglichst gestreckt nach vorne halten."],
    f: ["Oberschenkel rutschen ab: Die Schultern tiefer unter die Knie bringen.", "Arme stark gebeugt: Die Arme strecken, so gut es geht."],
    l: "Die Füße am Boden lassen und nur die Position mit den Schultern unter den Knien üben.", h: "Die Beine ganz strecken und die Position länger halten.",
    v: "Fortgeschritten: Bei Handgelenk-, Ellbogen- oder Rückenproblemen nicht üben." },
  eightangle: { s: ["Im Sitzen ein Bein über den gleichseitigen Oberarm legen, Hände neben die Hüften.", "Das andere Bein über das erste schlagen und die Knöchel kreuzen.", "Gewicht nach vorne verlagern, Ellbogen beugen und die gestreckten Beine zur Seite strecken.", "Oberkörper sinkt Richtung Boden, halten und Seite wechseln."],
    f: ["Beine rutschen vom Arm: Das obere Bein drückt fest gegen den Arm.", "Ellbogen fallen nach außen: Sie zeigen nach hinten."],
    l: "Die Beine angewinkelt lassen und nur das Gesäß anheben.", h: "Mit nur einem Arm abstützen oder länger halten.",
    v: "Fortgeschritten: Bei Schulter- oder Handgelenkproblemen nicht üben." },
  sideplank: { s: ["Aus dem Brett das Gewicht auf die rechte Hand verlagern.", "Auf die Außenkante des rechten Fußes drehen, den linken Fuß darauf legen.", "Becken anheben, sodass der Körper eine gerade Linie bildet, linker Arm zur Decke.", "Stützhand drückt den Boden weg, ruhig atmen und Seite wechseln."],
    f: ["Becken sackt ab: Hüfte aktiv anheben.", "Schulter hängt durch: Den Boden wegdrücken, Schulter weg vom Ohr."],
    l: "Das untere Knie am Boden ablegen oder die Füße hintereinander aufsetzen.", h: "Das obere Bein anheben oder den großen Zeh greifen.",
    v: "Bei Handgelenk- oder Schulterproblemen auf dem Unterarm üben." },
  elephanttrunk: { s: ["Im Sitzen ein Bein gestreckt, das andere Bein über den gleichseitigen Oberarm legen, möglichst hoch.", "Hände neben die Hüften setzen.", "Den Boden wegdrücken und Gesäß und gestrecktes Bein vom Boden heben.", "Kurz halten, ablegen und Seite wechseln."],
    f: ["Nur das Gesäß hebt sich: Das gestreckte Bein aktiv mit anheben.", "Arme beugen stark: Arme gerade halten und kräftig drücken."],
    l: "Die Ferse des gestreckten Beins am Boden lassen.", h: "Länger halten oder aus der Position in die Achtwinkelhaltung gehen.",
    v: "Bei Handgelenkproblemen nicht üben." },
  flyingpigeon: { s: ["Aus dem einbeinigen Stuhl mit gekreuztem Bein nach vorne beugen und die Hände aufsetzen.", "Den Fuß des gekreuzten Beins um den Oberarm haken, das Schienbein liegt auf den Oberarmen.", "Gewicht nach vorne verlagern, Ellbogen beugen.", "Das Standbein abheben und nach hinten strecken, halten und Seite wechseln."],
    f: ["Fuß rutscht vom Arm: Fuß aktiv gebeugt halten und um den Arm haken.", "Blick nach unten: Blick nach vorne, das hilft beim Gleichgewicht."],
    l: "Das hintere Bein angewinkelt lassen oder die Zehen am Boden lassen.", h: "Das hintere Bein ganz strecken und höher heben.",
    v: "Fortgeschritten: Bei Knie-, Handgelenk- oder Schulterproblemen nicht üben." },
  koundinya: { s: ["Aus der seitlichen Krähe beginnen.", "Das obere Bein gerade zur Seite strecken, das untere nach hinten.", "Schultern bleiben auf Höhe der Ellbogen, Blick nach vorne.", "Kurz halten, zurück in die Hocke und Seite wechseln."],
    f: ["Schultern sinken zu tief: Den Boden wegdrücken und die Brust nach vorne schieben.", "Beine hängen: Aktiv strecken bis in die Zehen."],
    l: "Nur ein Bein strecken und das andere angewinkelt lassen.", h: "Die Beine ganz waagerecht halten und mehrere Atemzüge bleiben.",
    v: "Fortgeschritten: Bei Handgelenk- oder Schulterproblemen nicht üben." },
  peacock: { s: ["Knien, Knie weit auseinander, Hände mit den Fingern nach hinten zwischen die Knie setzen.", "Ellbogen zusammen und unter den Bauch bringen, Bauch auf den Ellbogen ablegen.", "Beine nach hinten strecken und das Gewicht nach vorne verlagern.", "Die Füße abheben, sodass der Körper waagerecht ist, kurz halten."],
    f: ["Ellbogen weichen auseinander: Eng zusammenhalten.", "Zu wenig nach vorne lehnen: Gewicht deutlich nach vorne, Kopf leicht anheben."],
    l: "Die Füße am Boden lassen und nur das Gewicht nach vorne verlagern.", h: "Die Beine im Lotus kreuzen oder länger halten.",
    v: "Fortgeschritten: nicht mit vollem Magen, bei Handgelenkproblemen oder in der Schwangerschaft." },
  downdog: { s: ["Aus dem Vierfüßlerstand die Zehen aufstellen und das Becken nach hinten oben schieben.", "Hände schulterbreit, Finger gespreizt, den Boden wegdrücken.", "Rücken lang machen, Knie dürfen gebeugt sein, Fersen sinken Richtung Boden.", "Kopf hängt locker zwischen den Armen, ruhig atmen und halten."],
    f: ["Runder Rücken mit gestreckten Beinen: Lieber die Knie beugen und den Rücken lang machen.", "Schultern zu den Ohren: Oberarme nach außen drehen und die Schultern weg von den Ohren."],
    l: "Die Knie deutlich beugen oder die Hände auf einen Stuhl stützen.", h: "Ein Bein zur Decke heben (dreibeiniger Hund) oder abwechselnd die Fersen senken.",
    v: "Bei Bluthochdruck, Augen- oder Handgelenkproblemen nicht lange halten." },
  threeleggeddog: { s: ["Aus dem herabschauenden Hund einatmend ein Bein nach hinten oben heben.", "Hüften zunächst parallel zum Boden halten.", "Durch die Ferse des gehobenen Beins lang machen, beide Hände drücken gleichmäßig.", "Ausatmend absetzen und Seite wechseln."],
    f: ["Gewicht auf eine Hand: Beide Hände drücken gleich stark.", "Standbein knickt: Es bleibt lang, darf leicht gebeugt sein."],
    l: "Das Bein nur ein Stück anheben.", h: "Das Knie beugen und die Hüfte öffnen oder das Knie zur Nase ziehen.",
    v: "Bei Handgelenk- oder Schulterproblemen kurz halten." },
  dolphin: { s: ["Im Vierfüßlerstand die Unterarme schulterbreit und parallel aufsetzen.", "Zehen aufstellen und das Becken nach hinten oben schieben.", "Unterarme in den Boden drücken, Schultern weg von den Ohren, Kopf hängt frei.", "Füße ein Stück Richtung Ellbogen wandern lassen, ruhig atmen und halten."],
    f: ["Ellbogen rutschen auseinander: Einen Gurt um die Oberarme legen oder bewusst parallel halten.", "Schultern sinken zusammen: Aktiv vom Boden wegdrücken."],
    l: "Die Knie gebeugt lassen.", h: "Ein Bein anheben oder mit den Füßen näher an die Ellbogen gehen.",
    v: "Bei Nacken- oder Schulterproblemen kurz halten." },
  headstand: { s: ["Knien, Unterarme ablegen, Hände verschränken, Ellbogen schulterbreit.", "Den Kopf mit dem Scheitel in die Hände legen, Hinterkopf an die Handflächen.", "Knie strecken und mit den Füßen Richtung Gesicht gehen, bis der Rücken senkrecht ist.", "Knie zur Brust ziehen, dann die Beine langsam nach oben strecken, halten und kontrolliert absenken."],
    f: ["Gewicht auf dem Kopf: Die Unterarme tragen das meiste Gewicht, der Kopf berührt nur.", "Mit Schwung hochspringen: Langsam und kontrolliert heben, notfalls an der Wand üben."],
    l: "An einer Wand üben oder nur die Vorbereitung mit den Füßen am Boden halten.", h: "Die Beine gestreckt langsam heben und senken oder länger halten.",
    v: "Nur mit Erfahrung oder Anleitung. Nicht bei Nacken- oder Rückenproblemen, Bluthochdruck, Augenproblemen oder in der Schwangerschaft." },
  tripodheadstand: { s: ["Aus der Hocke die Hände schulterbreit aufsetzen und den Scheitel davor ablegen, sodass ein Dreieck entsteht.", "Ellbogen über den Handgelenken beugen.", "Die Knie auf die Oberarme legen (Krähe auf dem Kopf).", "Die Beine langsam nach oben strecken, halten und kontrolliert zurückkommen."],
    f: ["Kopf und Hände auf einer Linie: Der Kopf liegt vor den Händen, sonst fehlt die Stabilität.", "Ellbogen fallen nach außen: Sie bleiben über den Handgelenken."],
    l: "Nur die Knie auf die Oberarme legen und dort halten.", h: "Die gestreckten Beine aus dem Stand anheben.",
    v: "Nur mit Erfahrung. Nicht bei Nacken- oder Rückenproblemen, Bluthochdruck oder in der Schwangerschaft." },
  shoulderstand: { s: ["Auf dem Rücken liegen, eine gefaltete Decke unter den Schultern, der Kopf liegt davor.", "Beine über den Kopf schwingen und die Hände in den Rücken stützen.", "Die Beine nach oben strecken, der Körper bildet eine möglichst gerade Linie.", "Kopf nicht drehen, ruhig atmen, dann Wirbel für Wirbel abrollen."],
    f: ["Kopf drehen: Der Kopf bleibt gerade, sonst wird der Nacken belastet.", "Ohne Decke unter den Schultern: Die Decke schützt die Halswirbelsäule."],
    l: "Die Beine an der Wand hochlegen oder nur das Becken mit einem Block anheben.", h: "Ein Bein Richtung Boden über den Kopf senken oder länger halten.",
    v: "Nicht bei Nacken- oder Schulterproblemen, Bluthochdruck, Augenproblemen, während der Periode oder in der Schwangerschaft." },
  plough: { s: ["Aus dem Schulterstand die Beine langsam über den Kopf senken.", "Die Zehen hinter dem Kopf aufsetzen, Beine möglichst gestreckt.", "Hände stützen den Rücken oder liegen verschränkt am Boden.", "Kopf nicht drehen, ruhig atmen, dann langsam abrollen."],
    f: ["Kopf drehen oder nicken: Der Kopf bleibt ruhig in der Mitte.", "Füße mit Gewalt zum Boden: Lieber die Knie beugen oder die Füße auf einen Stuhl legen."],
    l: "Die Füße auf einem Stuhl oder Kissen hinter dem Kopf ablegen.", h: "Die Knie neben die Ohren sinken lassen.",
    v: "Nicht bei Nacken- oder Rückenproblemen, Bluthochdruck oder in der Schwangerschaft." },
  forearmstand: { s: ["Aus dem Delfin die Unterarme parallel, Handflächen fest am Boden.", "Mit den Füßen nah an die Ellbogen gehen, bis die Hüfte über den Schultern ist.", "Ein Bein anheben und mit dem anderen sanft abspringen.", "Beide Beine über den Schultern strecken, Bauch fest, halten und kontrolliert absetzen."],
    f: ["Ellbogen gehen auseinander: Einen Gurt um die Oberarme legen.", "Hohlkreuz: Rippen nach innen ziehen und die Beine strecken."],
    l: "An der Wand üben oder nur den Delfin mit einem Bein oben halten.", h: "Frei ohne Wand halten oder die Beine in den Skorpion beugen.",
    v: "Fortgeschritten: Nicht bei Schulter-, Nacken- oder Rückenproblemen, Bluthochdruck oder in der Schwangerschaft." },
  handstand: { s: ["Hände schulterbreit etwa eine Handbreit vor eine Wand setzen, Finger gespreizt.", "Ein Bein anheben und mit dem anderen kontrolliert abspringen.", "Fersen an die Wand legen, Arme gestreckt, Schultern zu den Ohren schieben.", "Bauch und Gesäß fest, Körper gestreckt, halten und ein Bein nach dem anderen absetzen."],
    f: ["Ellbogen geben nach: Arme gestreckt und den Boden kräftig wegdrücken.", "Starkes Hohlkreuz: Rippen nach innen, Körper wie eine Linie."],
    l: "Mit den Füßen an der Wand hochlaufen (L-Handstand) oder nur den Hund mit einem Bein an der Wand üben.", h: "Ohne Wand frei halten.",
    v: "Nicht bei Handgelenk-, Schulter- oder Nackenproblemen, Bluthochdruck oder in der Schwangerschaft. Freier Platz um dich herum." },
  scorpion: { s: ["Aus dem stabilen Unterarmstand beginnen.", "Die Knie beugen und die Füße Richtung Kopf sinken lassen.", "Brust nach vorne schieben und den Blick nach vorne nehmen.", "Kurz halten, Beine strecken und kontrolliert absetzen."],
    f: ["Ohne sicheren Unterarmstand üben: Erst diesen sicher frei halten können.", "Schultern sinken zusammen: Unterarme kräftig in den Boden drücken."],
    l: "An der Wand im Unterarmstand die Knie beugen und die Füße an die Wand legen.", h: "Die Füße bis auf den Kopf absenken.",
    v: "Sehr fortgeschritten: Nicht bei Rücken-, Nacken- oder Schulterproblemen, Bluthochdruck oder in der Schwangerschaft." },
  plank: { s: ["Hände unter den Schultern, Beine nach hinten gestreckt, Zehen aufgestellt.", "Körper bildet eine gerade Linie vom Kopf bis zu den Fersen.", "Bauch und Gesäß leicht anspannen, Fersen schieben nach hinten.", "Den Boden wegdrücken, ruhig atmen und halten."],
    f: ["Becken hängt durch: Bauch und Gesäß fester anspannen.", "Becken zu hoch: Es bildet mit Schultern und Fersen eine Linie."],
    l: "Die Knie ablegen.", h: "Abwechselnd ein Bein oder einen Arm anheben.",
    v: "Bei Handgelenkproblemen den Unterarmstütz wählen." },
  forearmplank: { s: ["Unterarme parallel unter den Schultern aufsetzen.", "Beine nach hinten strecken, Zehen aufgestellt.", "Körper gerade von Kopf bis Ferse, Bauch und Gesäß angespannt.", "Unterarme drücken in den Boden, ruhig atmen und halten."],
    f: ["Hohlkreuz: Becken leicht einrollen und den Bauch fester halten.", "Kopf hängt: Blick zum Boden, Nacken lang."],
    l: "Die Knie ablegen.", h: "Die Füße auf eine Bank stellen oder die Ellbogen weiter nach vorne setzen." },
  chaturanga: { s: ["Aus dem Brett das Gewicht leicht nach vorne verlagern.", "Ausatmend die Ellbogen nah am Körper nach hinten beugen.", "Körper sinkt als gerade Linie, bis die Oberarme etwa parallel zum Boden sind.", "Kurz halten und dann in den heraufschauenden Hund oder auf den Boden."],
    f: ["Schultern sinken unter die Ellbogenhöhe: Nur so tief, dass die Schultern auf Ellbogenhöhe bleiben.", "Ellbogen nach außen: Sie zeigen nach hinten und bleiben am Körper."],
    l: "Die Knie ablegen und dann absenken.", h: "Unten länger halten oder ein Bein anheben.",
    v: "Bei Schulter- oder Handgelenkproblemen mit Knien am Boden üben." },
  boat: { s: ["Sitzen, Knie gebeugt, Füße am Boden, Hände hinter den Knien.", "Oberkörper mit langem Rücken leicht nach hinten neigen.", "Die Füße abheben, bis die Schienbeine waagerecht sind, dann die Beine strecken.", "Arme nach vorne strecken, Brust heben, ruhig atmen und halten."],
    f: ["Runder Rücken: Brustbein heben, lieber die Knie gebeugt lassen.", "Luft anhalten: Gleichmäßig weiteratmen."],
    l: "Die Knie gebeugt lassen oder die Hände hinter den Knien halten.", h: "Langsam in das halbe Boot absenken und wieder hochkommen.",
    v: "Bei Rückenproblemen mit gebeugten Knien und kurz halten." },
  halfboat: { s: ["Aus dem Boot den Oberkörper und die Beine langsam Richtung Boden senken.", "Der untere Rücken bleibt am Boden, Schulterblätter und Füße schweben.", "Arme nach vorne strecken, Bauch fest.", "Kurz halten und zurück ins Boot oder ablegen."],
    f: ["Unterer Rücken hebt ab: Beine höher halten.", "Kinn auf die Brust: Nacken lang, Blick zu den Füßen."],
    l: "Die Knie anwinkeln.", h: "Die Arme über den Kopf strecken.",
    v: "Bei Rückenproblemen oder nach Bauchoperationen vorsichtig." },
  dolphinplank: { s: ["Im Unterarmstütz beginnen.", "Ausatmend das Becken nach oben in den Delfin schieben.", "Einatmend zurück in den Unterarmstütz, Körper wieder gerade.", "Gleichmäßig im Atemrhythmus wiederholen."],
    f: ["Im Stütz durchhängen: Zwischen den Wiederholungen gerade bleiben.", "Zu schnell: Langsam und kontrolliert bewegen."],
    l: "Die Knie im Stütz ablegen.", h: "Mit dem Kinn über die Hände nach vorne schieben (Delfin-Liegestütz).",
    v: "Bei Schulterproblemen kleinere Bewegung." },
  forearmsideplank: { s: ["Seitlich liegen, Ellbogen unter der Schulter, Beine gestreckt übereinander.", "Becken anheben, bis der Körper eine gerade Linie bildet.", "Obere Hand an die Hüfte oder zur Decke.", "Ruhig atmen, halten und Seite wechseln."],
    f: ["Becken sinkt ab: Hüfte aktiv nach oben.", "Oberkörper kippt nach vorne: Brust zur Seite geöffnet halten."],
    l: "Das untere Knie ablegen.", h: "Das obere Bein anheben oder das Becken absenken und wieder heben.",
    v: "Bei Schulterproblemen mit Knie am Boden üben." },
  kneetonose: { s: ["Aus dem dreibeinigen Hund beginnen.", "Ausatmend die Schultern über die Hände schieben, Rücken rund machen und das Knie zur Nase ziehen.", "Einatmend das Bein wieder nach hinten oben strecken.", "Einige Male wiederholen und Seite wechseln."],
    f: ["Schultern bleiben hinten: Sie wandern über die Hände.", "Bauch locker: Den Bauch aktiv einziehen, wenn das Knie kommt."],
    l: "Aus dem Vierfüßlerstand das Knie zur Nase ziehen.", h: "Das Knie zum gegenüberliegenden Ellbogen oder außen an den Arm ziehen.",
    v: "Bei Handgelenkproblemen aus dem Vierfüßlerstand üben." },
  standfold: { s: ["Hüftbreit stehen, Hände an die Hüfte.", "Ausatmend aus der Hüfte nach vorne beugen, nicht aus dem Rücken.", "Knie so weit beugen, dass der Bauch auf den Oberschenkeln liegen kann, Kopf hängt locker.", "Zum Aufrichten Knie beugen und Wirbel für Wirbel hochrollen."],
    f: ["Mit gestreckten Beinen Richtung Boden ziehen: Knie beugen, der Rücken soll entspannen.", "Schnell aufrichten: Langsam hochrollen, damit kein Schwindel entsteht."],
    l: "Die Hände auf Blöcke oder die Oberschenkel stützen.", h: "Die Hände unter die Füße schieben oder die Beine strecken und die Ellbogen greifen.",
    v: "Bei Bluthochdruck, Schwindel oder Bandscheibenproblemen nur halb nach vorne beugen." },
  halffold: { s: ["Aus der stehenden Vorbeuge die Hände an die Schienbeine legen.", "Einatmend den Rücken lang und gerade machen, Brust nach vorne.", "Blick zum Boden, Nacken lang.", "Ausatmend zurück in die Vorbeuge sinken."],
    f: ["Runder Rücken: Knie leicht beugen und das Brustbein nach vorne schieben.", "Kopf in den Nacken: Der Nacken bleibt eine Verlängerung der Wirbelsäule."],
    l: "Die Hände auf die Oberschenkel legen.", h: "Die Fingerspitzen neben den Füßen auf den Boden setzen und den Rücken trotzdem gerade halten." },
  seatedfold: { s: ["Mit gestreckten Beinen sitzen, Füße gebeugt, auf den Sitzbeinhöckern.", "Einatmend die Arme heben und lang werden.", "Ausatmend aus der Hüfte nach vorne beugen, Hände an Beine oder Füße.", "Bei jedem Ausatmen etwas tiefer sinken, ohne zu ziehen."],
    f: ["Rundrücken aus dem oberen Rücken: Die Bewegung kommt aus der Hüfte, ruhig mit gebeugten Knien.", "An den Füßen ziehen: Locker lassen und mit dem Atem nachgeben."],
    l: "Auf eine gefaltete Decke setzen und die Knie beugen oder einen Gurt um die Füße legen.", h: "Mit gestreckten Beinen die Fußsohlen greifen und den Bauch auf die Oberschenkel legen.",
    v: "Bei Bandscheibenproblemen nur mit langem Rücken und wenig Beugung." },
  headtoknee: { s: ["Sitzen, ein Bein gestreckt, die Fußsohle des anderen an die Innenseite des Oberschenkels legen.", "Oberkörper zum gestreckten Bein drehen.", "Einatmend lang werden, ausatmend über das gestreckte Bein nach vorne beugen.", "Ruhig atmen, halten und Seite wechseln."],
    f: ["Über das gebeugte Knie nach vorne: Der Bauchnabel zeigt zur Mitte des gestreckten Beins.", "Knie des gestreckten Beins überstreckt: Minimal beugen oder eine Rolle darunter legen."],
    l: "Einen Gurt um den Fuß legen oder auf einer Decke sitzen.", h: "Mit beiden Händen den Fuß greifen und die Stirn zum Schienbein bringen.",
    v: "Bei Knieproblemen eine Unterlage unter das gebeugte Knie legen." },
  revheadtoknee: { s: ["Sitzen wie bei der Kopf-zum-Knie-Haltung, Oberkörper aber zum gebeugten Knie drehen.", "Seitlich über das gestreckte Bein neigen, untere Schulter innen am Knie.", "Den oberen Arm über das Ohr Richtung Fuß strecken.", "Brust zur Decke drehen, halten und Seite wechseln."],
    f: ["Nach vorne kippen: Die Bewegung ist eine Seitneigung mit Drehung.", "Mit Gewalt zum Fuß: Lieber weniger weit und offen bleiben."],
    l: "Den unteren Ellbogen auf den Boden oder einen Block legen.", h: "Mit der oberen Hand den Fuß greifen." },
  wideseatedfold: { s: ["Im Sitzen die Beine weit grätschen, Knie und Zehen zeigen nach oben.", "Hände vor dem Körper auf den Boden setzen.", "Mit langem Rücken die Hände nach vorne wandern lassen.", "Ruhig atmen, halten und mit den Händen langsam aufrichten."],
    f: ["Knie drehen nach innen: Kniescheiben zeigen zur Decke.", "Rücken stark rund: Auf eine Decke setzen und weniger weit gehen."],
    l: "Auf einer gefalteten Decke sitzen und die Hände auf Blöcke stützen.", h: "Die großen Zehen greifen und die Brust zum Boden bringen.",
    v: "Bei Problemen mit den Adduktoren oder Leisten vorsichtig." },
  tortoise: { s: ["Im Sitzen die Beine etwa mattenbreit grätschen und die Knie beugen.", "Oberkörper nach vorne beugen und die Arme unter den Knien nach außen schieben.", "Die Beine langsam strecken, sodass sie auf den Oberarmen liegen.", "Brust sinkt Richtung Boden, ruhig atmen und vorsichtig lösen."],
    f: ["Beine mit Kraft strecken: Nur so weit, wie der Rücken es zulässt.", "Luft anhalten: Ruhig weiteratmen."],
    l: "Die Knie gebeugt lassen und nur die Arme unter die Knie schieben.", h: "Die Hände hinter dem Rücken verschränken.",
    v: "Fortgeschritten: Bei Rücken- oder Schulterproblemen nicht üben." },
  rabbit: { s: ["Im Fersensitz die Fersen mit den Händen greifen.", "Kinn zur Brust und den Oberkörper nach vorne rollen, bis der Scheitel vor den Knien liegt.", "Becken anheben, bis die Oberschenkel senkrecht sind, Rücken rund.", "Wenig Gewicht auf dem Kopf, ruhig atmen und langsam zurück in den Fersensitz."],
    f: ["Viel Gewicht auf dem Kopf: Die Hände an den Fersen halten das Gewicht.", "Schnell aufrichten: Langsam zurückrollen und kurz in der Kindhaltung bleiben."],
    l: "Das Becken nur wenig anheben und die Stirn ablegen.", h: "Länger halten und den Rücken bewusst rund dehnen.",
    v: "Nicht bei Nackenproblemen, Bluthochdruck oder Augenproblemen." },
  halfboundlotusfold: { s: ["Sitzen, ein Bein gestreckt, den anderen Fuß im halben Lotus hoch auf die Leiste legen.", "Den Arm derselben Seite hinter dem Rücken führen und den Fuß greifen.", "Mit langem Rücken über das gestreckte Bein nach vorne beugen, freie Hand an den Fuß.", "Ruhig atmen, vorsichtig lösen und Seite wechseln."],
    f: ["Knie schmerzt: Sofort lösen, das Knie darf nicht verdreht werden.", "Rücken stark rund: Weniger tief beugen."],
    l: "Den Fuß nur an den Oberschenkel legen statt in den Lotus und ohne Bindung beugen.", h: "Die Stirn zum Schienbein bringen.",
    v: "Fortgeschritten: Bei Knieproblemen nicht im Lotus üben." },
  foldclasp: { s: ["Hüftbreit stehen, die Hände hinter dem Rücken verschränken.", "Schultern nach hinten ziehen, Brust öffnen.", "Ausatmend aus der Hüfte nach vorne beugen, Knie leicht gebeugt.", "Die Arme Richtung Decke und Kopf sinken lassen, halten und langsam aufrichten."],
    f: ["Arme mit Gewalt nach vorne ziehen: Nur so weit, wie die Schultern es angenehm zulassen.", "Knie durchgedrückt: Leicht gebeugt lassen."],
    l: "Einen Gurt oder ein Handtuch zwischen die Hände nehmen.", h: "Die Beine strecken und die Arme weiter über den Kopf sinken lassen.",
    v: "Bei Schulterproblemen, Bluthochdruck oder Schwindel vorsichtig." },
  halflordfishes: { s: ["Sitzen, das rechte Bein gebeugt über das linke stellen, das linke Bein beugen oder gestreckt lassen.", "Die rechte Hand hinter dem Gesäß aufsetzen.", "Einatmend lang werden, ausatmend nach rechts drehen und den linken Ellbogen außen ans rechte Knie legen.", "Mit jedem Einatmen lang, mit jedem Ausatmen etwas mehr drehen, dann Seite wechseln."],
    f: ["Rücken sinkt zusammen: Die hintere Hand schiebt den Boden weg und richtet auf.", "Drehung aus dem Nacken: Die Drehung beginnt im Bauch, der Kopf folgt zuletzt."],
    l: "Das Knie mit dem Arm umarmen statt den Ellbogen außen anzulegen.", h: "Den Arm um das Knie führen und hinter dem Rücken die andere Hand greifen.",
    v: "In der Schwangerschaft nur sanft und offen drehen. Bei Bandscheibenproblemen vorsichtig." },
  marichi1: { s: ["Sitzen, ein Bein gestreckt, das andere Knie aufstellen, Fuß nah am Gesäß.", "Den Arm derselben Seite innen am Knie nach vorne strecken.", "Den Arm um das Schienbein führen und hinter dem Rücken die andere Hand greifen.", "Mit langem Rücken über das gestreckte Bein nach vorne beugen, halten und Seite wechseln."],
    f: ["Hände kommen nicht zusammen: Einen Gurt zwischen die Hände nehmen.", "Stark runder Rücken: Erst lang werden, dann nach vorne."],
    l: "Ohne Bindung nur nach vorne beugen und das Knie umarmen.", h: "Die Stirn zum Schienbein bringen." },
  marichi3: { s: ["Sitzen, ein Bein gestreckt, das andere Knie aufstellen, Fuß nah am Gesäß.", "Zum aufgestellten Knie drehen und den gegenüberliegenden Ellbogen außen ans Knie legen.", "Hintere Hand hinter dem Gesäß, Brust aufrichten.", "Mit dem Ausatmen tiefer drehen, halten und Seite wechseln."],
    f: ["Gestrecktes Bein rollt nach außen: Zehen zeigen zur Decke.", "Gesäßseite hebt ab: Beide Sitzbeinhöcker bleiben am Boden."],
    l: "Das Knie mit dem Arm umarmen.", h: "Den Arm um das Knie führen und hinter dem Rücken binden.",
    v: "In der Schwangerschaft nicht tief drehen." },
  easytwist: { s: ["Im Schneidersitz aufrecht sitzen.", "Rechte Hand hinter das Gesäß, linke Hand an das rechte Knie.", "Einatmend lang werden, ausatmend nach rechts drehen.", "Ruhig atmen, zur Mitte zurück und Seite wechseln."],
    f: ["Mit der Hand am Knie reißen: Die Hand führt nur, die Drehung kommt aus dem Rumpf.", "Rücken sinkt zusammen: Auf eine Decke setzen und aufrichten."],
    l: "Auf einem Stuhl sitzen und an der Lehne drehen.", h: "Die Drehung länger halten und den Blick über die Schulter nehmen." },
  supinetwist: { s: ["Auf dem Rücken liegen, Arme seitlich ausbreiten.", "Beide Knie zur Brust ziehen und langsam zu einer Seite sinken lassen.", "Schultern bleiben am Boden, Blick zur Gegenseite.", "Einige Atemzüge entspannen und über die Mitte zur anderen Seite wechseln."],
    f: ["Schulter hebt stark ab: Knie auf ein Kissen legen.", "Mit Kraft halten: Loslassen und das Gewicht der Beine wirken lassen."],
    l: "Ein Kissen oder eine Decke unter die Knie legen.", h: "Das obere Bein strecken und den Fuß mit der Hand greifen.",
    v: "Bei akuten Rückenschmerzen nur sanft und mit Unterlage." },
  reclinedtwist: { s: ["Auf dem Rücken liegen, Arme seitlich, Beine gestreckt nach oben.", "Ausatmend die Beine langsam zu einer Seite senken, ohne den Boden zu berühren.", "Einatmend zurück zur Mitte.", "Zur anderen Seite wiederholen, die Schultern bleiben am Boden."],
    f: ["Beine fallen ab: Langsam und kontrolliert senken.", "Schultern heben ab: Nur so tief senken, wie die Schultern liegen bleiben."],
    l: "Die Knie im rechten Winkel beugen.", h: "Die Beine bis knapp über den Boden senken und kurz halten.",
    v: "Bei Rückenproblemen mit gebeugten Knien üben." },
  revlowlunge: { s: ["Aus dem tiefen Ausfallschritt mit abgelegtem hinterem Knie beginnen.", "Die gegenüberliegende Hand innen neben den vorderen Fuß setzen.", "Den anderen Arm zur Decke öffnen und die Brust zur Seite drehen.", "Ruhig atmen, halten und Seite wechseln."],
    f: ["Becken sinkt stark zur Seite: Becken bleibt über dem hinteren Knie.", "Schulter der Stützhand sackt ab: Den Boden wegdrücken."],
    l: "Einen Block unter die Stützhand stellen.", h: "Das hintere Knie beugen und den Fuß mit der oberen Hand greifen.",
    v: "Bei Knieproblemen das hintere Knie gut polstern." },
  bharadvaja: { s: ["Seitlich sitzen, beide Beine nach rechts angewinkelt, die Füße neben der rechten Hüfte.", "Den Oberkörper nach links drehen.", "Die rechte Hand an das linke Knie, die linke Hand hinter das Gesäß.", "Lang werden, mit dem Ausatmen drehen, halten und Seite wechseln."],
    f: ["Gesäß hebt auf einer Seite stark ab: Eine Decke unter die Sitzseite legen.", "In der Drehung zusammensacken: Brustbein bleibt gehoben."],
    l: "Auf einem Stuhl seitlich sitzen und an der Lehne drehen.", h: "Den hinteren Arm um den Rücken führen und den Oberarm greifen." },
  heelstwist: { s: ["Im Fersensitz aufrecht sitzen.", "Die rechte Hand hinter das Gesäß, die linke Hand an das rechte Knie.", "Einatmend lang werden, ausatmend nach rechts drehen.", "Halten und Seite wechseln."],
    f: ["Hüfte dreht mit: Die Knie bleiben nach vorne gerichtet.", "Rücken sinkt zusammen: Aufrichten und Schultern sinken lassen."],
    l: "Ein Kissen zwischen Gesäß und Fersen legen.", h: "Die Hände hinter dem Kopf verschränken und die Ellbogen mitdrehen.",
    v: "Bei Knieproblemen mit Kissen oder im Schneidersitz drehen." },
  halfpigeon: { s: ["Aus dem Vierfüßlerstand das rechte Knie hinter das rechte Handgelenk bringen, den rechten Fuß Richtung linke Hand.", "Das linke Bein lang nach hinten ausstrecken, Fußrücken am Boden.", "Becken gerade ausrichten, aufrichten oder mit langem Rücken nach vorne auf die Unterarme sinken.", "Ruhig atmen, langsam lösen und Seite wechseln."],
    f: ["Becken kippt zur Seite: Eine Decke unter die Gesäßseite des vorderen Beins legen.", "Schmerz im Knie: Den Fuß näher zum Körper holen oder die liegende Figur vier wählen."],
    l: "Ein Kissen unter die Hüfte legen oder die liegende Figur vier machen.", h: "Den vorderen Unterschenkel parallel zur Mattenkante legen oder in die Königstaube gehen.",
    v: "Bei Knieproblemen die liegende Variante wählen." },
  lizard: { s: ["Aus dem tiefen Ausfallschritt den vorderen Fuß an die Außenkante der Matte setzen.", "Beide Hände innen neben den vorderen Fuß.", "Hinteres Knie ablegen oder gestreckt lassen, Becken sinkt nach vorne unten.", "Wenn möglich auf die Unterarme sinken, halten und Seite wechseln."],
    f: ["Vorderes Knie kippt nach innen: Es zeigt über die Zehen.", "Schultern sinken zusammen: Brust nach vorne schieben."],
    l: "Die Hände auf Blöcke stützen und das hintere Knie ablegen.", h: "Die Unterarme auf den Boden bringen oder das vordere Knie nach außen sinken lassen.",
    v: "Bei Knie- oder Leistenproblemen vorsichtig." },
  boundangle: { s: ["Aufrecht sitzen, Fußsohlen aneinander legen, Fersen in Richtung Becken.", "Mit den Händen die Füße oder Knöchel halten.", "Knie sinken lassen, Wirbelsäule lang machen.", "Für mehr Dehnung mit langem Rücken leicht nach vorne neigen, ruhig atmen."],
    f: ["Knie nach unten drücken: Die Knie sinken von allein, nicht mit den Händen drücken.", "Runder Rücken: Auf eine Decke setzen."],
    l: "Auf eine Decke setzen und Kissen unter die Knie legen.", h: "Mit langem Rücken die Brust Richtung Füße bringen.",
    v: "Bei Leisten- oder Knieproblemen Kissen unter die Knie legen." },
  firelog: { s: ["Aufrecht sitzen, das linke Schienbein parallel zur Vorderkante der Matte legen.", "Das rechte Schienbein genau darauf legen, Knöchel über dem Knie.", "Füße aktiv gebeugt, Rücken lang.", "Für mehr Dehnung mit langem Rücken nach vorne neigen, halten und Seite wechseln."],
    f: ["Fuß hängt schlaff: Füße aktiv beugen, das schützt die Knie.", "Großer Abstand zwischen Knie und Fuß: Kissen in die Lücke legen."],
    l: "Die Beine einfach im Schneidersitz kreuzen oder Kissen unter das obere Knie legen.", h: "Mit den Unterarmen vor den Schienbeinen auf den Boden sinken.",
    v: "Bei Knieschmerzen sofort lösen." },
  cowface: { s: ["Im Sitzen ein Knie genau über das andere legen, Füße neben die Hüften.", "Den rechten Arm hoch nehmen, Ellbogen beugen, die Hand zwischen die Schulterblätter.", "Den linken Arm von unten hinter den Rücken führen und die Finger greifen.", "Aufrecht sitzen, ruhig atmen und Seite wechseln."],
    f: ["Mit Gewalt die Hände greifen: Einen Gurt oder ein Handtuch nehmen.", "Kopf nach vorne gedrückt: Der Hinterkopf schiebt leicht gegen den oberen Arm."],
    l: "Auf einem Kissen sitzen oder nur die Beinhaltung machen.", h: "Mit langem Rücken über die Knie nach vorne neigen.",
    v: "Bei Knie- oder Schulterproblemen vorsichtig." },
  happybaby: { s: ["Auf dem Rücken liegen, Knie zur Brust ziehen.", "Die Außenkanten der Füße greifen, Knie neben den Oberkörper.", "Fußsohlen zeigen zur Decke, Schienbeine senkrecht.", "Kreuzbein bleibt am Boden, sanft hin und her schaukeln oder still halten."],
    f: ["Kopf und Schultern heben ab: Lieber die Kniekehlen greifen.", "Becken rollt hoch: Die Füße weniger stark nach unten ziehen."],
    l: "Die Kniekehlen oder Schienbeine halten.", h: "Ein Bein strecken und das andere gebeugt halten.",
    v: "In der späten Schwangerschaft nicht lange auf dem Rücken liegen." },
  frog: { s: ["Aus dem Vierfüßlerstand die Knie weit zur Seite wandern lassen.", "Unterschenkel parallel, Knöchel auf einer Linie mit den Knien, Füße gebeugt.", "Auf die Unterarme sinken und das Becken langsam nach hinten schieben.", "Ruhig atmen, vorsichtig lösen."],
    f: ["Zu schnell zu weit: In kleinen Schritten öffnen.", "Ins Hohlkreuz fallen: Bauch leicht halten."],
    l: "Die Knie weniger weit öffnen und Decken unter die Knie legen.", h: "Die Brust zum Boden sinken lassen.",
    v: "Bei Knie-, Leisten- oder Hüftproblemen vorsichtig, die Knie gut polstern." },
  garland: { s: ["Füße etwas breiter als hüftbreit, Zehen leicht nach außen.", "Tief in die Hocke sinken, Fersen möglichst am Boden.", "Hände vor der Brust zusammenlegen, Ellbogen drücken die Knie sanft nach außen.", "Brustbein heben, Rücken lang, ruhig atmen."],
    f: ["Fersen heben ab: Eine gerollte Decke unter die Fersen legen.", "Rücken rund: Brust heben und die Knie mit den Ellbogen weiten."],
    l: "Auf einem Block sitzen oder eine Decke unter die Fersen legen.", h: "Die Arme um die Schienbeine führen und hinter dem Rücken binden.",
    v: "Bei Knieproblemen auf einem Block sitzen." },
  reclinedfigurefour: { s: ["Auf dem Rücken liegen, Knie gebeugt, Füße am Boden.", "Den rechten Knöchel über das linke Knie legen, rechter Fuß aktiv gebeugt.", "Das linke Bein anheben und hinter dem Oberschenkel oder am Schienbein greifen.", "Das Bein zur Brust ziehen, Kopf und Schultern bleiben entspannt, Seite wechseln."],
    f: ["Kopf hebt ab: Ein Kissen unter den Kopf oder das Bein weniger weit ziehen.", "Fuß hängt schlaff: Aktiv beugen, das schützt das Knie."],
    l: "Den unteren Fuß am Boden lassen.", h: "Das untere Bein strecken und weiter zur Brust ziehen." },
  halfsplit: { s: ["Aus dem tiefen Ausfallschritt das Becken nach hinten über das hintere Knie schieben.", "Das vordere Bein strecken, Zehen zeigen nach oben.", "Mit langem Rücken über das vordere Bein nach vorne beugen, Hände neben dem Bein.", "Ruhig atmen, halten und Seite wechseln."],
    f: ["Rücken stark rund: Die Hände auf Blöcke stellen und lang bleiben.", "Becken nicht über dem Knie: Hüfte steht senkrecht über dem hinteren Knie."],
    l: "Blöcke unter die Hände stellen und das vordere Knie leicht beugen.", h: "Die Unterarme neben das Bein legen oder in den Spagat gleiten.",
    v: "Bei Problemen mit den hinteren Oberschenkeln sanft dehnen." },
  splits: { s: ["Aus dem halben Spagat langsam das vordere Bein nach vorne und das hintere nach hinten gleiten lassen.", "Hände neben dem Becken auf Blöcken, Becken nach vorne ausgerichtet.", "Nur so tief sinken, wie es ohne Schmerz geht, gegebenenfalls einen Block unter das Becken.", "Ruhig atmen und vorsichtig mit den Händen wieder herauskommen."],
    f: ["Ohne Aufwärmen: Erst die Beine gut vorbereiten.", "Becken dreht zur Seite: Hüfte nach vorne ausrichten, auch wenn es weniger tief geht."],
    l: "Einen Block oder ein Kissen unter das Becken legen und dort ruhen.", h: "Die Arme über den Kopf strecken oder sich über das vordere Bein beugen.",
    v: "Bei Problemen mit den hinteren Oberschenkeln oder der Leiste sehr vorsichtig." },
  gate: { s: ["Aufrecht knien, das rechte Bein zur Seite strecken, Fuß flach am Boden.", "Einatmend den linken Arm heben.", "Ausatmend zur rechten Seite über das gestreckte Bein neigen, rechte Hand gleitet am Bein nach unten.", "Ruhig atmen, aufrichten und Seite wechseln."],
    f: ["Nach vorne kippen: Die Neigung geht nur zur Seite.", "Hüfte schiebt nach hinten: Hüfte bleibt über dem Knie."],
    l: "Eine Decke unter das Knie legen und die obere Hand an die Hüfte nehmen.", h: "Die Hand auf den Boden setzen und die Seitneigung vertiefen.",
    v: "Bei Knieproblemen das Knie gut polstern." },
  recboundangle: { s: ["Auf dem Rücken liegen, Fußsohlen aneinander, Knie zur Seite sinken lassen.", "Kissen oder Blöcke unter die Knie legen, damit nichts zieht.", "Arme seitlich ablegen oder eine Hand auf den Bauch, eine auf die Brust.", "Ruhig in den Bauch atmen und lange entspannen."],
    f: ["Knie ohne Unterstützung lange halten: Kissen unterlegen, damit die Leisten nicht überdehnen.", "Unterer Rücken im Hohlkreuz: Die Füße weiter vom Becken weg setzen."],
    l: "Ein Polster längs unter den Rücken legen und die Knie gut stützen.", h: "Die Füße näher zum Becken holen und ohne Kissen liegen.",
    v: "In der späten Schwangerschaft mit erhöhtem Oberkörper liegen." },
  easyseat: { s: ["Mit gekreuzten Unterschenkeln auf den Boden setzen, am besten auf die Kante einer gefalteten Decke.", "Die Knie liegen tiefer als die Hüften oder werden mit Kissen gestützt.", "Wirbelsäule aufrichten, Schultern locker, Hände auf den Knien.", "Ruhig atmen, nach einer Weile die Kreuzung der Beine wechseln."],
    f: ["Rücken sinkt zusammen: Höher sitzen, dann richtet sich das Becken von selbst auf.", "Knie hoch in der Luft: Kissen unter die Knie oder höher sitzen."],
    l: "Auf einem Stuhl oder mit dem Rücken an einer Wand sitzen.", h: "Ohne Unterlage aufrecht sitzen und länger halten." },
  lotus: { s: ["Im Sitzen den rechten Fuß mit der Sohle nach oben hoch auf den linken Oberschenkel legen.", "Dann den linken Fuß auf den rechten Oberschenkel legen.", "Beide Knie sinken Richtung Boden, Wirbelsäule aufrecht.", "Ruhig atmen, vorsichtig lösen und das andere Bein nach oben legen."],
    f: ["Mit Kraft hineinziehen: Die Bewegung kommt aus der Hüfte, nicht aus dem Knie.", "Schmerz im Knie: Sofort lösen und den halben Lotus oder Schneidersitz wählen."],
    l: "Den halben Lotus oder den Schneidersitz üben.", h: "Im Lotus nach vorne beugen oder länger sitzen.",
    v: "Bei Knie- oder Hüftproblemen nicht üben." },
  halflotus: { s: ["Im Schneidersitz beginnen.", "Einen Fuß mit der Sohle nach oben auf den gegenüberliegenden Oberschenkel legen.", "Der andere Fuß bleibt unter dem gegenüberliegenden Knie.", "Aufrecht sitzen, ruhig atmen und Seite wechseln."],
    f: ["Knie des oberen Beins schwebt hoch: Ein Kissen darunter legen.", "Fuß liegt auf dem Knie: Er liegt weiter oben in der Leiste."],
    l: "Den Fuß nur auf den Unterschenkel statt auf den Oberschenkel legen.", h: "In den vollen Lotus gehen.",
    v: "Bei Knieproblemen nicht üben." },
  thunderbolt: { s: ["Knien, Knie zusammen, Fußrücken flach am Boden.", "Das Gesäß auf die Fersen setzen.", "Wirbelsäule aufrichten, Hände auf die Oberschenkel.", "Ruhig atmen und sitzen bleiben."],
    f: ["Rücken sinkt zusammen: Aufrichten und die Schultern sinken lassen.", "Schmerz in Knie oder Fußrücken: Kissen oder Decke unterlegen."],
    l: "Ein Kissen zwischen Gesäß und Fersen und eine Decke unter die Schienbeine legen.", h: "Die Zehen aufstellen und auf den Fersen sitzen (Zehensitz).",
    v: "Bei Knieproblemen mit Kissen oder gar nicht üben." },
  hero: { s: ["Knien, Knie zusammen, Füße etwas breiter als die Hüften.", "Die Waden mit den Händen nach außen streichen.", "Das Gesäß zwischen die Fersen auf den Boden oder einen Block setzen.", "Aufrecht sitzen, ruhig atmen."],
    f: ["Füße zeigen nach außen: Sie zeigen gerade nach hinten.", "Schmerz im Knie: Höher sitzen, ein Block unter dem Gesäß hilft."],
    l: "Auf einem oder zwei Blöcken sitzen.", h: "Ohne Block sitzen oder nach hinten in den liegenden Helden gehen.",
    v: "Bei Knieproblemen nur mit hoher Unterlage oder gar nicht." },
  staff: { s: ["Mit gestreckten Beinen sitzen, Füße gebeugt, Zehen zur Decke.", "Hände neben den Hüften aufsetzen, Finger nach vorne.", "Wirbelsäule aufrichten, Brustbein heben.", "Oberschenkel aktiv, ruhig atmen und halten."],
    f: ["Runder Rücken: Auf eine Decke setzen.", "Schultern hochgezogen: Hände drücken leicht in den Boden, Schultern sinken."],
    l: "Auf einer gefalteten Decke sitzen oder die Knie leicht beugen.", h: "Die Hände vom Boden lösen und die Arme nach oben strecken." },
  accomplished: { s: ["Im Sitzen die linke Ferse nah an den Damm legen.", "Den rechten Fuß vor oder auf den linken Knöchel legen, Fersen übereinander.", "Knie sinken zum Boden, Wirbelsäule aufrecht.", "Hände auf den Knien, ruhig atmen und Seite wechseln."],
    f: ["Knie heben ab: Höher sitzen.", "Rücken sinkt zusammen: Auf die Kante einer Decke setzen."],
    l: "Die Füße voreinander auf den Boden legen statt übereinander.", h: "Länger sitzen, zum Beispiel für die Meditation.",
    v: "Bei Knie- oder Hüftproblemen Kissen nutzen." },
  lion: { s: ["Im Fersensitz oder Schneidersitz sitzen, Hände auf die Knie, Finger gespreizt.", "Tief durch die Nase einatmen.", "Ausatmend den Mund weit öffnen, die Zunge Richtung Kinn strecken und mit einem kräftigen Ha ausatmen.", "Blick nach oben, dann entspannen und wiederholen."],
    f: ["Nur halbherzig: Gesicht, Zunge und Finger dürfen ruhig kräftig mitmachen.", "Hals verkrampft: Den Ton aus dem Bauch kommen lassen."],
    l: "Ohne Ton ausatmen und nur Mund und Zunge öffnen.", h: "Mehrere Runden hintereinander machen." },
  child: { s: ["Knien, große Zehen berühren sich, Knie hüftbreit oder weiter.", "Das Gesäß Richtung Fersen sinken lassen.", "Oberkörper nach vorne ablegen, Stirn auf den Boden, Arme nach vorne oder neben den Körper.", "In den Rücken atmen und entspannen."],
    f: ["Stirn erreicht den Boden nicht: Ein Kissen oder die Fäuste unter die Stirn legen.", "Gesäß schwebt hoch: Ein Kissen zwischen Gesäß und Fersen legen."],
    l: "Ein Kissen längs unter den Oberkörper legen (gestützte Kindhaltung).", h: "Die Arme weit nach vorne strecken und die Hände in den Boden drücken.",
    v: "Bei Knieproblemen Decke unter die Knie und ein Kissen auf die Fersen. In der Schwangerschaft die Knie weit öffnen." },
  savasana: { s: ["Auf dem Rücken liegen, Beine etwas auseinander, Füße fallen locker nach außen.", "Arme neben dem Körper, Handflächen nach oben.", "Augen schließen, den Körper schwer werden lassen.", "Natürlich atmen, am Ende langsam bewegen, zur Seite rollen und aufrichten."],
    f: ["Zu schnell aufstehen: Erst Finger und Zehen bewegen, dann über die Seite hoch.", "Frieren: Eine Decke überlegen, ein kalter Körper entspannt schlecht."],
    l: "Eine Rolle unter die Knie legen, das entlastet den unteren Rücken.", h: "Ohne Hilfsmittel länger liegen und den Körper Stück für Stück bewusst entspannen.",
    v: "In der späten Schwangerschaft auf der linken Seite liegen." },
  recliningthero: { s: ["Im Heldensitz sitzen.", "Mit den Händen hinter dem Körper abstützen und langsam auf die Unterarme sinken.", "Wenn es gut geht, den Rücken ganz ablegen, Arme über den Kopf oder neben den Körper.", "Ruhig atmen, mit den Unterarmen wieder aufrichten."],
    f: ["Knie heben vom Boden ab: Mit Kissen unter dem Rücken höher bleiben.", "Hohlkreuz: Höher liegen, bis der untere Rücken entspannt ist."],
    l: "Ein Polster oder Kissen längs unter den Rücken legen.", h: "Ganz ohne Unterlage liegen und die Arme über den Kopf strecken.",
    v: "Bei Knie- oder Rückenproblemen nicht üben." },
  supinebigtoe: { s: ["Auf dem Rücken liegen, ein Bein gestreckt am Boden.", "Das andere Bein nach oben strecken und den großen Zeh oder einen Gurt um den Fuß halten.", "Das Bein sanft Richtung Oberkörper ziehen, Becken bleibt am Boden.", "Ruhig atmen, halten und Seite wechseln."],
    f: ["Unteres Bein hebt ab: Es bleibt lang am Boden, notfalls Knie beugen.", "Kopf und Schultern heben ab: Lieber einen Gurt nehmen."],
    l: "Das untere Knie aufstellen und einen Gurt nutzen.", h: "Das Bein zur Seite öffnen, das Becken bleibt dabei am Boden." },
  kneestochest: { s: ["Auf dem Rücken liegen.", "Beide Knie zur Brust ziehen und mit den Armen umarmen.", "Kopf und Schultern bleiben entspannt am Boden.", "Ruhig atmen, sanft hin und her wiegen oder kleine Kreise machen."],
    f: ["Kopf zieht nach oben: Der Kopf bleibt liegen, ein Kissen hilft.", "Zu fest ziehen: Nur sanft halten."],
    l: "Die Hände in die Kniekehlen legen.", h: "Kopf zur Brust heben und das Gesicht Richtung Knie bringen.",
    v: "In der Schwangerschaft die Knie weit öffnen." },
  windrelieving: { s: ["Auf dem Rücken liegen, beide Beine gestreckt.", "Ein Knie zur Brust ziehen und mit den Händen umfassen.", "Das andere Bein bleibt lang am Boden.", "Ruhig atmen, halten und Seite wechseln."],
    f: ["Das gestreckte Bein hebt ab: Es drückt leicht in den Boden.", "Schultern ziehen hoch: Schultern entspannt am Boden."],
    l: "Das gestreckte Bein aufstellen.", h: "Den Kopf zum Knie heben." },
  crocodile: { s: ["Auf dem Bauch liegen, Beine etwas auseinander, Fersen fallen nach innen.", "Die Arme verschränken und die Stirn auf die Unterarme legen.", "Den ganzen Körper schwer werden lassen.", "In den Bauch atmen und spüren, wie er sich gegen den Boden hebt und senkt."],
    f: ["Nacken verdreht: Die Stirn liegt gerade auf den Armen.", "Bauch angespannt: Bewusst locker lassen."],
    l: "Ein flaches Kissen unter den Bauch oder die Stirn legen.", h: "Länger liegen und die Atmung zählen.",
    v: "In der Schwangerschaft nicht auf dem Bauch liegen." },
  onelegbridge: { s: ["Aus der Brücke das Becken oben halten.", "Gewicht auf einen Fuß verlagern und das andere Bein zur Decke strecken.", "Becken bleibt waagerecht, Gesäß aktiv.", "Kurz halten, Fuß absetzen und Seite wechseln."],
    f: ["Becken sinkt auf einer Seite: Gesäß des Standbeins fester anspannen.", "Knie des Standbeins fällt nach außen: Es zeigt nach vorne."],
    l: "Das Bein nur angewinkelt anheben.", h: "Das Becken mit gestrecktem Bein langsam absenken und wieder heben.",
    v: "Bei Nackenproblemen nicht zu hoch gehen." },
  caterpillar: { s: ["Mit gestreckten Beinen sitzen, wenn nötig auf einer Decke.", "Locker nach vorne über die Beine sinken lassen, der Rücken darf rund sein.", "Kopf hängen lassen, Hände ablegen, wo sie hinkommen.", "3 bis 5 Minuten bleiben, dann langsam aufrollen."],
    f: ["Aktiv nach vorne ziehen: Im Yin locker lassen und nur hängen.", "Ziehen in den Kniekehlen: Knie beugen oder eine Rolle darunter legen."],
    l: "Eine Rolle unter die Knie legen und ein Kissen auf die Oberschenkel für den Oberkörper.", h: "Ohne Hilfsmittel länger bleiben.",
    v: "Bei Bandscheibenproblemen oder Ischias nicht rund nach vorne hängen." },
  yinbutterfly: { s: ["Fußsohlen aneinander legen, Füße etwas weiter vom Becken weg als beim Schmetterling.", "Die Knie zur Seite sinken lassen.", "Oberkörper locker nach vorne rund sinken lassen, Hände auf die Füße oder den Boden.", "3 bis 5 Minuten bleiben und mit den Händen aufrichten."],
    f: ["Mit Kraft nach unten drücken: Nur hängen lassen.", "Ziehen im unteren Rücken: Ein Kissen unter das Gesäß legen."],
    l: "Kissen unter die Knie und unter den Kopf legen.", h: "Die Füße näher zum Becken holen.",
    v: "Bei Ischias nicht rund nach vorne hängen." },
  halfbutterfly: { s: ["Sitzen, ein Bein gestreckt, die Fußsohle des anderen an die Innenseite des Oberschenkels.", "Locker über das gestreckte Bein nach vorne sinken.", "Kopf hängen lassen, Arme ablegen.", "3 Minuten bleiben, aufrollen und Seite wechseln."],
    f: ["Knie des gestreckten Beins überstreckt: Eine Rolle unter das Knie legen.", "Aktiv ziehen: Im Yin passiv bleiben."],
    l: "Eine Rolle unter das gestreckte Knie und ein Kissen auf das Bein legen.", h: "Über das gebeugte Knie zur Mitte sinken." },
  dragon: { s: ["Aus dem Vierfüßlerstand einen Fuß zwischen die Hände setzen, das hintere Knie liegt ab.", "Das Becken nach vorne unten sinken lassen.", "Hände auf Blöcke oder neben den Fuß, den Oberkörper entspannen.", "3 Minuten bleiben und Seite wechseln."],
    f: ["Hinteres Knie schmerzt: Eine Decke darunter legen.", "Hohlkreuz: Bauch leicht halten, Becken nur so tief wie angenehm."],
    l: "Die Hände auf Blöcke oder auf den vorderen Oberschenkel legen.", h: "Den vorderen Fuß zur Außenkante setzen und auf die Unterarme sinken (fliegender Drache).",
    v: "Bei Knieproblemen das hintere Knie gut polstern." },
  swan: { s: ["Wie bei der halben Taube ein Knie vorne ablegen, das andere Bein lang nach hinten.", "Becken mit Kissen gerade stützen.", "Locker auf die Unterarme oder ein Kissen nach vorne sinken.", "3 Minuten bleiben, vorsichtig lösen und Seite wechseln."],
    f: ["Becken hängt schief: Eine Decke unter die vordere Gesäßseite legen.", "Ziehen im Knie: Den vorderen Fuß näher zum Körper holen."],
    l: "Die liegende Figur vier in Rückenlage machen.", h: "Den Oberkörper ganz auf den Boden ablegen.",
    v: "Bei Knieproblemen die liegende Variante wählen." },
  saddle: { s: ["Im Fersensitz oder zwischen den Fersen sitzen.", "Langsam auf die Hände und dann auf die Unterarme nach hinten sinken.", "Wenn es geht, den Rücken auf ein Kissen ablegen.", "3 Minuten bleiben, mit den Unterarmen aufrichten und die Beine ausstrecken."],
    f: ["Knie heben stark ab: Höher bleiben und mehr Kissen nutzen.", "Ziehen im Knie: Sofort höher kommen oder lösen."],
    l: "Auf den Händen oder Unterarmen bleiben oder nur ein Bein anwinkeln.", h: "Ganz ohne Kissen liegen und die Arme über den Kopf legen.",
    v: "Bei Knie- oder Rückenproblemen nicht üben." },
  shoelace: { s: ["Im Sitzen ein Knie über das andere legen wie beim Kuhgesicht.", "Die Füße liegen neben den Hüften.", "Locker über die Knie nach vorne sinken.", "3 Minuten bleiben und Seite wechseln."],
    f: ["Gesäß hebt ab: Ein Kissen unter das Gesäß legen.", "Knie schmerzt: Das untere Bein ausstrecken."],
    l: "Das untere Bein gestreckt lassen oder auf einem Kissen sitzen.", h: "Den Oberkörper tiefer über die Knie sinken lassen.",
    v: "Bei Knieproblemen das untere Bein strecken." },
  seal: { s: ["Auf dem Bauch liegen, Hände etwas vor und neben den Schultern, Finger leicht ausgedreht.", "Die Arme strecken und den Oberkörper anheben.", "Rücken und Gesäß locker lassen, Schultern sinken.", "2 Minuten bleiben, ablegen und in der Bauchlage nachspüren."],
    f: ["Gesäß angespannt: Bewusst locker lassen.", "Druck im unteren Rücken: Die Hände weiter nach vorne setzen oder in die Sphinx gehen."],
    l: "In die Sphinx gehen.", h: "Die Hände näher zum Körper setzen.",
    v: "Bei Rückenproblemen eher die Sphinx wählen. Nicht in der Schwangerschaft." },
  dragonfly: { s: ["Im Sitzen die Beine weit grätschen.", "Locker nach vorne sinken lassen, Rücken darf rund sein.", "Kopf und Arme ablegen, wo es angenehm ist.", "3 bis 5 Minuten bleiben und mit den Händen aufrichten."],
    f: ["Ziehen in den Kniekehlen: Die Knie leicht beugen.", "Knie rollen nach innen: Kniescheiben zeigen nach oben."],
    l: "Auf einer Decke sitzen und ein Kissen vor sich legen.", h: "Die Brust weiter Richtung Boden sinken lassen.",
    v: "Bei Leisten- oder Adduktorenproblemen vorsichtig." },
  banana: { s: ["Auf dem Rücken liegen, Arme über den Kopf.", "Erst die Beine, dann den Oberkörper zur rechten Seite schieben, wie eine Banane.", "Das Gesäß bleibt in der Mitte, die linke Körperseite wird lang.", "3 Minuten bleiben und Seite wechseln."],
    f: ["Hüfte hebt ab: Beide Gesäßhälften bleiben am Boden.", "Zu weit gebogen: Nur so weit, wie es angenehm dehnt."],
    l: "Die Arme neben den Körper legen.", h: "Die Füße kreuzen und die Hände an die Ellbogen nehmen." },
  legsupwall: { s: ["Seitlich nah an eine Wand setzen.", "Beim Hinlegen die Beine an der Wand hochschwingen.", "Gesäß so nah an die Wand wie angenehm, Arme seitlich ablegen.", "5 Minuten oder länger bleiben, dann Knie beugen und zur Seite rollen."],
    f: ["Ziehen in den hinteren Oberschenkeln: Etwas weiter von der Wand weg.", "Beine schlafen ein: Die Füße bewegen oder die Beine kurz anwinkeln."],
    l: "Die Unterschenkel auf einen Stuhl legen statt an die Wand.", h: "Ein Kissen unter das Becken legen.",
    v: "Bei Augenproblemen wie grünem Star und in der späten Schwangerschaft nicht lange liegen." },
  supportedbridge: { s: ["Auf dem Rücken liegen, Knie gebeugt, Füße hüftbreit.", "Becken anheben und einen Block quer unter das Kreuzbein legen.", "Das Becken auf den Block sinken lassen, Arme locker.", "3 Minuten bleiben, Becken heben, Block entfernen und abrollen."],
    f: ["Block unter dem unteren Rücken: Er liegt unter dem flachen Knochen am Ende der Wirbelsäule.", "Zu hohe Stufe: Mit der niedrigsten Stufe beginnen."],
    l: "Den Block flach legen.", h: "Die Beine strecken oder den Block auf eine höhere Stufe stellen.",
    v: "Bei Schmerzen im unteren Rücken sofort lösen." },
  toesquat: { s: ["Im Fersensitz die Zehen aufstellen, sodass du auf den Fersen sitzt.", "Die Zehen sind unter dem Fuß gestreckt.", "Aufrecht sitzen und ruhig atmen.", "Kurz halten, dann die Fußrücken ablegen und die Füße ausschütteln."],
    f: ["Kleine Zehen knicken weg: Mit den Fingern unterstützen, bis alle Zehen aufgestellt sind.", "Zu lange gleich am Anfang: Langsam die Zeit steigern."],
    l: "Mit den Händen vor dem Körper auf den Boden stützen und Gewicht abgeben.", h: "Die Zeit verlängern.",
    v: "Bei Fußproblemen oder Gicht vorsichtig." },
  supportedchild: { s: ["Ein Polster oder zwei Kissen längs vor dich legen.", "Knien, Knie weit, große Zehen zusammen.", "Den Oberkörper auf das Polster legen, Kopf zur Seite drehen.", "4 Minuten oder länger bleiben, nach der Hälfte die Kopfseite wechseln."],
    f: ["Nacken immer zur gleichen Seite: Die Kopfseite wechseln.", "Polster zu niedrig: Höher bauen, bis du ganz entspannt liegst."],
    l: "Ein Kissen zusätzlich zwischen Gesäß und Fersen legen.", h: "Ohne Polster in die Kindhaltung gehen.",
    v: "Bei Knieproblemen die Knie mit einer Decke polstern." },
  nadishodhana: { s: ["Aufrecht sitzen, die rechte Hand vor das Gesicht.", "Mit dem Daumen das rechte Nasenloch schließen und links einatmen.", "Mit dem Ringfinger links schließen, rechts öffnen und ausatmen, dann rechts einatmen.", "Rechts schließen, links ausatmen: Das ist eine Runde. Ruhig und gleichmäßig weiter."],
    f: ["Zu kräftig atmen: Leise und fein atmen, ohne Anstrengung.", "Kopf neigt sich: Aufrecht bleiben, der Arm darf auf einem Kissen ruhen."],
    l: "Nur in der Vorstellung abwechseln, ohne die Nase zu verschließen.", h: "Die Ausatmung doppelt so lang wie die Einatmung machen.",
    v: "Bei verstopfter Nase nicht erzwingen." },
  ujjayi: { s: ["Aufrecht sitzen oder die Übung in die Haltungen mitnehmen.", "Durch die Nase einatmen und die Kehle leicht verengen, als würdest du flüstern.", "Auch durch die Nase ausatmen, mit dem gleichen leisen Rauschen.", "Ein- und Ausatmung gleich lang und gleichmäßig halten."],
    f: ["Zu laut oder gepresst: Das Rauschen ist leise, nur für dich hörbar.", "Mund geöffnet: Die Atmung geht durch die Nase."],
    l: "Erst mit offenem Mund ein leises Ha ausatmen, dann den Mund schließen.", h: "Die Atmung verlängern und durch die ganze Yoga-Einheit halten." },
  kapalabhati: { s: ["Aufrecht sitzen, Hände auf die Knie.", "Normal einatmen.", "Dann kurz und kräftig durch die Nase ausatmen, indem du den Bauch ruckartig einziehst, die Einatmung geschieht von selbst.", "Etwa 20 bis 30 Stöße als Runde, danach ruhig atmen und nachspüren."],
    f: ["Mit Brust und Schultern pumpen: Die Bewegung kommt nur aus dem Bauch.", "Zu schnell, bis zum Schwindel: Langsamer werden oder Pausen machen."],
    l: "Langsamer und mit weniger Stößen beginnen.", h: "Mehr Stöße pro Runde oder ein höheres Tempo.",
    v: "Nicht in der Schwangerschaft, bei Bluthochdruck, Herzproblemen, Epilepsie oder nach Bauchoperationen. Bei Schwindel aufhören." },
  bhastrika: { s: ["Aufrecht sitzen.", "Kräftig und gleich lang durch die Nase ein- und ausatmen, der Bauch bewegt sich aktiv mit.", "Etwa 10 Atemzüge als Runde.", "Danach tief einatmen, kurz halten und ruhig ausatmen, nachspüren."],
    f: ["Unregelmäßiger Rhythmus: Ein- und Ausatmung gleich kräftig.", "Weiter bei Schwindel: Sofort normal atmen."],
    l: "Langsamer und weniger kräftig atmen.", h: "Mehr Atemzüge pro Runde.",
    v: "Nicht in der Schwangerschaft, bei Bluthochdruck, Herzproblemen oder Epilepsie." },
  bhramari: { s: ["Aufrecht sitzen, Augen schließen.", "Mit den Zeigefingern sanft die Ohrknorpel verschließen.", "Tief durch die Nase einatmen.", "Mit geschlossenem Mund ausatmen und dabei gleichmäßig summen wie eine Biene, Vibration spüren."],
    f: ["Zu fest auf die Ohren drücken: Nur sanft verschließen.", "Summen gepresst: Locker und gleichmäßig summen."],
    l: "Ohne die Ohren zu verschließen summen.", h: "Die Ausatmung und das Summen verlängern.",
    v: "Bei Ohrentzündungen nicht die Ohren verschließen." },
  dirgha: { s: ["Bequem sitzen oder liegen, eine Hand auf den Bauch, eine auf die Brust.", "Einatmen: Erst hebt sich der Bauch, dann weiten sich die Rippen, zuletzt hebt sich die Brust leicht.", "Ausatmen in umgekehrter Reihenfolge: Brust, Rippen, Bauch.", "Ruhig und ohne Anstrengung einige Minuten weiter."],
    f: ["Nur in die Brust atmen: Bewusst im Bauch beginnen.", "Luft mit Kraft einziehen: Die Atmung fließt ruhig und weich."],
    l: "Nur die Bauchatmung üben.", h: "Die Ausatmung länger als die Einatmung machen." },
  boxbreath: { s: ["Aufrecht sitzen.", "4 Sekunden durch die Nase einatmen.", "4 Sekunden halten, 4 Sekunden ausatmen, 4 Sekunden halten: Das ist eine Runde.", "Gleichmäßig wiederholen."],
    f: ["Beim Halten verkrampfen: Locker halten, Schultern entspannt.", "Zu lange Zählzeiten: Kürzer beginnen, die Atmung soll angenehm bleiben."],
    l: "Mit 3 Sekunden pro Seite beginnen oder ohne Halten atmen.", h: "Auf 5 oder 6 Sekunden pro Seite verlängern.",
    v: "In der Schwangerschaft und bei Herzproblemen den Atem nicht anhalten." },
  sitali: { s: ["Aufrecht sitzen.", "Die Zunge herausstrecken und zu einem Röhrchen rollen.", "Durch die gerollte Zunge langsam einatmen, die Luft fühlt sich kühl an.", "Mund schließen und durch die Nase ausatmen, wiederholen."],
    f: ["Zunge lässt sich nicht rollen: Stattdessen durch die Zähne einatmen (Sitkari).", "Zu schnell: Langsam und ruhig atmen."],
    l: "Durch die leicht geöffneten Zähne einatmen.", h: "Nach dem Einatmen kurz halten.",
    v: "Nicht bei niedrigem Blutdruck, Asthma oder in kalter Umgebung." },
  meditation: { s: ["Bequem und aufrecht sitzen, auf Kissen, Hocker oder Stuhl.", "Augen schließen oder den Blick weich auf den Boden richten.", "Die Aufmerksamkeit auf den Atem richten, zum Beispiel auf das Heben und Senken des Bauchs.", "Wenn Gedanken kommen, sie wahrnehmen und freundlich zum Atem zurückkehren."],
    f: ["Gedanken wegdrücken wollen: Gedanken kommen, entscheidend ist das Zurückkehren.", "Verkrampft aufrecht: Aufrecht, aber entspannt, die Schultern sinken."],
    l: "Mit 3 Minuten beginnen oder eine angeleitete Meditation nutzen.", h: "Die Zeit auf 20 Minuten oder mehr steigern." },
  bodyscan: { s: ["In der Endentspannung auf dem Rücken liegen, zugedeckt.", "Die Aufmerksamkeit langsam durch den Körper wandern lassen, von den Zehen bis zum Scheitel.", "Jeden Bereich wahrnehmen und beim Ausatmen bewusst loslassen.", "Am Ende den ganzen Körper spüren, langsam bewegen und über die Seite aufstehen."],
    f: ["Einschlafen: Kein Problem, für mehr Wachheit die Hände auf den Bauch legen.", "Etwas erzwingen wollen: Nur wahrnehmen, nichts verändern müssen."],
    l: "Eine angeleitete Aufnahme nutzen und nur einzelne Körperteile durchgehen.", h: "Langsamer durch den Körper gehen und die Zeit verlängern." },
};
// BESCHREIBUNG>>
const YOGA_BY_ID = new Map([...YOGA_POSES, ...YOGA_FLOWS.map(f => ({ ...f, flow: true }))].map(p => [p.id, p]));
const yogaName = id => { const p = YOGA_BY_ID.get(id); return p ? p.de : id; };

const yogaKcalEst = (style, level, min) => {
  const st = YOGA_STYLES[style] || YOGA_STYLES.other, f = (YOGA_LEVELS[level] || YOGA_LEVELS.mid).f;
  const kg = typeof cardioKg === 'function' ? cardioKg() : 75;
  return Math.max(0, Math.round((st.met * f - 1) * kg * (min / 60) / 5) * 5);
};
const yogaOn = date => data.yoga.filter(y => y.date === date);
const yogaKcalOn = date => yogaOn(date).reduce((a, y) => a + (y.kcal || 0), 0);
function yogaWeek() {
  const d = new Date(todayISO() + 'T12:00:00'), monday = addDaysISO(todayISO(), -((d.getDay() + 6) % 7));
  const list = data.yoga.filter(y => y.date >= monday && y.date <= todayISO());
  return { n: list.length, min: list.reduce((a, y) => a + y.min, 0) };
}
function yogaStartHtml() {
  const w = yogaWeek();
  return `<button class="btn nav yoga-btn" data-action="yoga-open">🧘 Yoga eintragen
      <small>${w.n ? `Diese Woche: ${w.n}× | ${w.min} min` : 'Hatha, Vinyasa, Yin … auf Wunsch mit Übungen, Durchgängen und Zeiten'}</small></button>`;
}

/* ----- v345: Vergleich mit dem letzten Mal (gleicher Stil) und Bestwerte je Übung ----- */
function yogaPrev(style, date, exceptId, before) {
  let best = null, bi = -1;
  data.yoga.forEach((x, i) => {
    if (x.style !== style || x.id === exceptId || x.date > date) return;
    if (before != null && x.date === date && i >= before) return;
    if (!best || x.date > best.date || (x.date === best.date && i > bi)) { best = x; bi = i; }
  });
  return best;
}
const yogaPrevOf = y => yogaPrev(y.style, y.date, y.id, data.yoga.indexOf(y));
// je Übung: zuletzt (vor dem Datum, ohne die bearbeitete Einheit) und Bestwerte (längste Zeit, meiste Durchgänge)
function yogaItemHist(p, date, exceptId) {
  let last = null, lastDate = '', bestS = 0, bestN = 0;
  for (const y of data.yoga) {
    if (y.id === exceptId || y.date > date) continue;
    for (const i of y.items || []) if (i.p === p) {
      if (y.date >= lastDate) { last = i; lastDate = y.date; }
      if (i.s > bestS) bestS = i.s;
      if (i.n > bestN) bestN = i.n;
    }
  }
  return { last, lastDate, bestS, bestN };
}
const yogaItemTxt = (i, unitR) => [i.n ? (unitR ? `${i.n} Runden` : `${i.n}×`) : '', i.s ? `${i.s} s` : ''].filter(Boolean).join(' ');
let yogaCmpId = null;
function yogaCmpCard() {
  const y = yogaCmpId && data.yoga.find(x => x.id === yogaCmpId);
  if (!y) return '';
  const st = (YOGA_STYLES[y.style] || YOGA_STYLES.other).label, p = yogaPrevOf(y), rec = [];
  for (const i of y.items || []) {
    const h = yogaItemHist(i.p, y.date, y.id), pose = YOGA_BY_ID.get(i.p);
    if (!pose) continue;
    if (i.s && h.bestS && i.s > h.bestS) rec.push(`<span>${esc(pose.de)}</span>: <span>${i.s} s</span> <small class="hint">(bisher ${h.bestS} s)</small>`);
    else if (i.n && h.bestN && i.n > h.bestN) rec.push(`<span>${esc(pose.de)}</span>: <span>${i.n} ${pose.unit === 'r' && !pose.flow ? 'Runden' : 'Durchgänge'}</span> <small class="hint">(bisher ${h.bestN})</small>`);
  }
  if (!p) return `<div class="card cardio-cmp"><p><b>🧘 Erste Einheit ${esc(st)}</b></p><p class="hint nut-small">Ab dem nächsten Mal vergleicht die App mit dieser Einheit.</p>
    ${rec.map(r => `<p class="cardio-rec">🏆 ${r}</p>`).join('')}</div>`;
  const d = y.min - p.min;
  return `<div class="card cardio-cmp"><p><b>🧘 Vergleich mit dem letzten Mal</b> <small class="hint">${esc(st)} | ${fmtDate(p.date + 'T12:00:00')}</small></p>
      <p class="cardio-cmp-row">${typeof cardioArrow === 'function' ? cardioArrow(Math.sign(d)) : ''} <span>${d ? `${d > 0 ? '+' : '−'}${Math.abs(d)} min` : 'gleich lang'}</span>
        | <span>${(y.items || []).length} Übungen</span> <small class="hint">(letztes Mal ${(p.items || []).length})</small></p>
      ${rec.length ? `<p class="cardio-rec">🏆 <span>Neue Bestwerte</span></p>${rec.map(r => `<p class="cardio-rec-i">${r}</p>`).join('')}` : ''}</div>`;
}

/* ----- Eintragen ----- */
let yogaForm = null;   // { id?, date, style, level, min, kcal, own, items: [{ p, n: Text, s: Text }] }
let yogaFlowsOpen = false;
let yogaStyleTapped = false;  // v348: Erklärung zum Stil erst nach dem Antippen eines Stils
function yogaFormFresh(y) {
  if (y) return { id: y.id, date: y.date, style: y.style, level: y.level, min: String(y.min), kcal: y.own ? String(y.kcal) : '', own: !!y.own,
    items: (y.items || []).map(i => ({ p: i.p, n: i.n ? String(i.n) : '', s: i.s ? String(i.s) : '' })) };
  const last = data.yoga[data.yoga.length - 1];
  return { id: null, date: todayISO(), style: last ? last.style : 'hatha', level: 'mid', min: '45', kcal: '', own: false, items: [] };
}
// Richtzeit eines Ablaufs je Durchgang (Sekunden; Runden-Übungen mit etwa 10 s je Runde)
const yogaFlowSec = fl => fl.items.reduce((a, [id, v]) => { const p = YOGA_BY_ID.get(id); return a + (p && p.unit === 'r' ? v * 10 : v); }, 0);
// Zeit der Übungen in Sekunden (eingetragene Zeit, bei Abläufen sonst ihr Richtwert)
const yogaItemsSec = items => items.reduce((a, i) => {
  const p = YOGA_BY_ID.get(i.p), s = parseNum(i.s) > 0 ? parseNum(i.s) : p && p.flow ? yogaFlowSec(p) : 0;
  return a + s * (parseNum(i.n) > 0 ? parseNum(i.n) : 1);
}, 0);
function yogaEstText() {
  const f = yogaForm, min = parseNum(f.min) || Math.ceil(yogaItemsSec(f.items) / 60);
  if (!min || min <= 0) return 'Dauer eintragen, dann schätzt die App den Verbrauch.';
  return `Geschätzt: <b>ca. ${deNum(yogaKcalEst(f.style, f.level, min))} kcal</b> zusätzlich zum Grundumsatz (bei ${fmtNum(round1(typeof cardioKg === 'function' ? cardioKg() : 75))} kg Körpergewicht).`;
}

function yogaItemHtml(it, i) {
  const p = YOGA_BY_ID.get(it.p);
  if (!p) return '';
  const unitR = !p.flow && p.unit === 'r';
  const sub = p.flow ? `Ablauf mit ${p.items.length} Haltungen` : [p.sa, p.side ? 'je Seite' : ''].filter(Boolean).join(' | ');
  return `<div class="yg-item">
      <div class="yg-item-head"><span><b>${p.flow ? '🔁 ' : ''}${esc(p.de)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span>
        <button class="icon-btn danger" data-action="yoga-item-del" data-i="${i}" aria-label="Entfernen">✕</button></div>
      ${(h => h.last ? `<p class="hint nut-small yg-item-last"><span>Zuletzt ${esc(yogaItemTxt(h.last, unitR) || 'ohne Angaben')}</span>${h.bestS ? ` | <span>Bestzeit ${h.bestS} s</span>` : ''}${!h.bestS && h.bestN ? ` | <span>höchstens ${h.bestN}</span>` : ''}</p>` : '')(yogaItemHist(it.p, yogaForm.date || todayISO(), yogaForm.id))}
      <div class="yg-item-in">
        <label><span>${unitR ? 'Runden' : 'Durchgänge'}</span><input class="inp" type="text" inputmode="numeric" autocomplete="off" data-field="yoga-item" data-i="${i}" data-k="n" value="${esc(it.n)}" placeholder="–"></label>
        ${unitR ? '' : `<label><span>Sek. je Durchgang</span><input class="inp" type="text" inputmode="numeric" autocomplete="off" data-field="yoga-item" data-i="${i}" data-k="s" value="${esc(it.s)}" placeholder="${p.flow ? yogaFlowSec(p) : p.hold}"></label>`}
      </div></div>`;
}

function renderYoga() {
  if (!yogaForm) yogaForm = yogaFormFresh();
  const f = yogaForm;
  const lastWith = [...data.yoga].reverse().find(y => y.items && y.items.length && y.id !== f.id);
  const lp = yogaPrev(f.style, f.date || todayISO(), f.id);
  let h = `${yogaCmpCard()}<div class="card cardio-form yoga-form">
      <p class="lbl">Stil</p>
      <div class="variants yoga-styles">${Object.entries(YOGA_STYLES).map(([k, s]) => `<button class="vchip ${f.style === k ? 'on' : ''}" data-action="yoga-style" data-k="${k}">${s.label}</button>`).join('')}</div>
      ${lp ? `<p class="hint nut-small cardio-last"><b>Letztes Mal</b> <span>${fmtDate(lp.date + 'T12:00:00')}</span>: <span>${lp.min} min</span> | <span>${(YOGA_LEVELS[lp.level] || YOGA_LEVELS.mid).label}</span>${lp.items && lp.items.length ? ` | <span>${lp.items.length} Übungen</span>` : ''}</p>` : ''}
      ${yogaStyleTapped ? `<p class="hint nut-small yoga-style-desc">${esc((YOGA_STYLES[f.style] || YOGA_STYLES.other).desc)}</p>` : ''}
      <p class="lbl">Wie fordernd?</p>
      <div class="seg three">${Object.entries(YOGA_LEVELS).map(([k, l]) => `<button class="${f.level === k ? 'on' : ''}" data-action="yoga-level" data-k="${k}">${l.label}</button>`).join('')}</div>
      <label class="row"><span>Dauer (Minuten)</span>
        <input class="inp kg" type="text" inputmode="numeric" autocomplete="off" data-field="yoga-in" data-k="min" value="${esc(f.min)}"></label>
      <label class="row"><span>Datum</span><input class="inp date" type="date" data-field="yoga-in" data-k="date" value="${f.date}" max="${todayISO()}"></label>
      <p class="hint nut-small" id="yoga-est">${yogaEstText()}</p>
      <label class="row"><span>Eigener Wert (kcal)<br><small class="hint">freiwillig, z. B. von der Uhr</small></span>
        <input class="inp kg" type="text" inputmode="numeric" autocomplete="off" data-field="yoga-in" data-k="kcal" value="${esc(f.kcal)}" placeholder="–"></label>
    </div>
    <div class="card yoga-items">
      <h2>Übungen <small class="hint">freiwillig</small></h2>
      <p class="hint nut-small">Trag ein, was du gemacht hast, mit Durchgängen und Zeit je Übung. Beides kannst du auch weglassen.</p>
      ${f.items.map(yogaItemHtml).join('')}
      <div class="row yoga-add-row">
        <button class="btn" data-action="yoga-pick">＋ Übung</button>
        <button class="btn ${yogaFlowsOpen ? 'on' : ''}" data-action="yoga-flows-toggle" aria-expanded="${yogaFlowsOpen}">＋ Ablauf</button>
      </div>
      ${yogaFlowsOpen ? `<div class="variants yoga-flow-chips">${YOGA_FLOWS.map(fl => `<button class="vchip" data-action="yoga-add" data-p="${fl.id}">🔁 ${esc(fl.de)}</button>`).join('')}</div>` : ''}
      ${!f.items.length && lastWith ? `<button class="btn center yoga-last" data-action="yoga-last">↺ Übungen vom letzten Mal übernehmen<small>${fmtDate(lastWith.date + 'T12:00:00')}</small></button>` : ''}
    </div>
    <div class="row">${f.id ? '<button class="btn" data-action="yoga-cancel">Abbrechen</button>' : ''}
      <button class="btn primary" data-action="yoga-save">${f.id ? '✔ Speichern' : '＋ Eintragen'}</button></div>
    <button class="btn nav" data-action="yoga-lib">📖 Yoga-Übungen und Abläufe<small>${YOGA_POSES.length} Haltungen und Atemübungen mit Anleitung, ${YOGA_FLOWS.length} Abläufe</small></button>`;
  const list = [...data.yoga].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 40);
  h += list.length ? `<h2>Deine Einheiten</h2><ul class="list">${list.map(y => yogaRowHtml(y, true)).join('')}</ul>` : '<p class="hint">Noch keine Yoga-Einheiten eingetragen.</p>';
  return h + `<p class="hint nut-small explain">Die Kalorien sind Schätzwerte aus Stil, Anstrengung, Dauer und Körpergewicht (MET-Werte). Gezählt wird nur,
    was du zusätzlich zum Ruhezustand verbrauchst. Ob sie ins Tagesziel zählen, stellst du bei Cardio ein („Ins Tagesziel einrechnen?“).</p>`;
}

const yogaItemsText = items => (items || []).map(i => `${tr(yogaName(i.p))}${i.n ? ` ${i.n}×` : ''}${i.s ? ` ${i.s} s` : ''}`).join(', ');
function yogaRowHtml(y, edit = false) {
  const st = YOGA_STYLES[y.style] || YOGA_STYLES.other;
  const info = `<span>${fmtDate(y.date + 'T12:00:00')}</span> | <span>${y.min} min</span> | <span>${(YOGA_LEVELS[y.level] || YOGA_LEVELS.mid).label}</span> | <span>ca. ${deNum(y.kcal)} kcal</span>${y.own ? ' <span>(eigener Wert)</span>' : ''}`;
  if (!edit) return `<button class="btn nav" data-action="yoga-open-edit" data-id="${y.id}">🧘 <span>${st.label}</span><small>${info}</small></button>`;
  const p = yogaPrevOf(y), d = p ? y.min - p.min : 0;
  return `<li class="bw-row cardio-row yoga-row"><span>🧘 <span>${st.label}</span><small class="hint">${info}</small>${p && d ? `<small class="hint cardio-row-cmp">${cardioArrow(Math.sign(d))} <span>${d > 0 ? '+' : '−'}${Math.abs(d)} min</span></small>` : ''}${y.items && y.items.length
      ? `<small class="hint yoga-row-items">${esc(yogaItemsText(y.items))}</small>` : ''}</span>
      <button class="icon-btn" data-action="yoga-edit" data-id="${y.id}" aria-label="Bearbeiten">✎</button>
      <button class="icon-btn danger" data-action="yoga-del" data-id="${y.id}" aria-label="Löschen">✕</button></li>`;
}

/* ----- Übung auswählen und Bibliothek ----- */
let ygQ = '';            // Suchtext
let ygOpenCat = null;    // aufgeklappte Kategorie
let ygOpenPose = null;   // aufgeklappte Haltung in der Bibliothek
let ygLibTab = 'poses';  // 'poses' | 'flows'
const ygSearchStr = p => [p.de, p.sa, tr(p.de)].join(' ').toLowerCase();

// Liste nach Kategorien; pick = Auswahl fürs Eintragen (Antippen fügt hinzu), sonst Bibliothek (Antippen klappt auf)
function yogaPoseList(pick) {
  const q = ygQ.trim().toLowerCase(), chosen = pick ? new Set(yogaForm.items.map(i => i.p)) : null;
  let any = false;
  const h = YOGA_CATS.map(([c, label]) => {
    const ps = YOGA_POSES.filter(p => p.cat === c);
    if (!ps.length) return '';
    const hit = ps.filter(p => !q || ygSearchStr(p).includes(q));
    if (hit.length) any = true;
    const open = ygOpenCat === c;
    return `<div class="yg-cat" data-c="${c}" ${q && !hit.length ? 'hidden' : ''}>
      <button class="mg-sub-head" data-action="yoga-cat" data-c="${c}" aria-expanded="${open}"><span class="lbl">${label}</span>
        <span class="hint">${ps.length}</span><span class="chev">${open ? '▴' : '▾'}</span></button>
      <div class="yg-poses" ${open || q ? '' : 'hidden'}>${ps.map(p => {
        const on = chosen && chosen.has(p.id), det = !pick && ygOpenPose === p.id;
        return `<div class="yg-pose ${det ? 'open' : ''}" data-s="${esc(ygSearchStr(p))}" ${q && !ygSearchStr(p).includes(q) ? 'hidden' : ''}>
          <button class="yg-pose-btn ${on ? 'on' : ''}" data-action="${pick ? 'yoga-add' : 'yoga-pose'}" data-p="${p.id}" aria-pressed="${pick ? !!on : det}">
            <span><b>${esc(p.de)}</b><small>${[p.sa, YOGA_LVL[p.lvl], p.side ? 'je Seite' : ''].filter(Boolean).map(esc).join(' | ')}</small></span>
            <span class="yg-pose-r" aria-hidden="true">${pick ? (on ? '✓' : '＋') : (det ? '▴' : '▾')}</span></button>
          ${det ? yogaPoseDetail(p) : ''}</div>`;
      }).join('')}</div></div>`;
  }).join('');
  return h + `<p class="hint nut-small yg-none" ${q && !any ? '' : 'hidden'}>Nichts gefunden.</p>`;
}
// Bestwerte einer Haltung aus den Einheiten
function yogaPoseStats(id) {
  let n = 0, best = 0, last = null;
  for (const y of data.yoga) for (const i of y.items || []) if (i.p === id) { n++; if (i.s > best) best = i.s; if (!last || y.date > last) last = y.date; }
  return { n, best, last };
}
function yogaPoseDetail(p) {
  const st = yogaPoseStats(p.id);
  return `<div class="yg-detail">
      <p class="hint nut-small"><span>${YOGA_LVL[p.lvl]}</span> | <span>Richtwert ${p.hold} ${p.unit === 'r' ? 'Runden' : 'Sekunden'}${p.side ? ' je Seite' : ''}</span></p>
      ${typeof YOGA_DESC !== 'undefined' && YOGA_DESC[p.id] ? '' : `<p class="yg-how">${esc(p.how)}</p>`}
      <p class="hint nut-small">${esc(p.eff)}</p>
      ${(d => d ? `<p class="yg-sec">Ausführung</p><ol class="yg-steps">${d.s.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
        <p class="yg-sec">Häufige Fehler</p><ul class="yg-faults">${d.f.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <p class="yg-var"><span class="yg-var-l">Leichter:</span> <span>${esc(d.l)}</span></p>
        <p class="yg-var"><span class="yg-var-l">Schwerer:</span> <span>${esc(d.h)}</span></p>
        ${d.v ? `<p class="yg-warn"><span aria-hidden="true">⚠️</span> <span>${esc(d.v)}</span></p>` : ''}` : '')(typeof YOGA_DESC !== 'undefined' && YOGA_DESC[p.id])}
      ${st.n ? `<p class="hint nut-small yg-stat"><span>Bei dir: ${st.n}× eingetragen</span>${st.best ? ` | <span>längste Zeit ${st.best} s</span>` : ''} | <span>zuletzt ${fmtDate(st.last + 'T12:00:00')}</span></p>` : ''}
    </div>`;
}
function renderYogaPick() {
  if (!yogaForm) yogaForm = yogaFormFresh();
  return `<div class="card yg-pick"><p class="hint nut-small">Antippen fügt die Übung hinzu. Durchgänge und Zeit trägst du danach ein, wenn du magst.</p>
      <input class="inp" type="search" data-field="yoga-q" value="${esc(ygQ)}" placeholder="Suchen, z. B. Krieger" autocomplete="off">
      ${yogaPoseList(true)}</div>
    <button class="btn primary" data-action="yoga-pick-done">✔ Fertig (${yogaForm.items.length} ${yogaForm.items.length === 1 ? 'Übung' : 'Übungen'})</button>`;
}
function renderYogaLib() {
  let h = `<div class="seg two"><button class="${ygLibTab === 'poses' ? 'on' : ''}" data-action="yoga-libtab" data-k="poses">Übungen</button>
    <button class="${ygLibTab === 'flows' ? 'on' : ''}" data-action="yoga-libtab" data-k="flows">Abläufe</button></div>`;
  if (ygLibTab === 'flows') {
    return h + YOGA_FLOWS.map(fl => `<div class="card yg-flow"><h2>🔁 ${esc(fl.de)}</h2><p class="hint nut-small">${esc(fl.how)}</p>
      <p class="hint nut-small">Ein Durchgang dauert etwa ${Math.max(1, Math.round(yogaFlowSec(fl) / 60))} Minuten.</p>
      <ol class="yg-flow-list">${fl.items.map(([id, v]) => { const p = YOGA_BY_ID.get(id); return p ? `<li><span>${esc(p.de)}</span><small>${p.unit === 'r' ? `${v} Runden` : `${v} s`}${p.side ? ' je Seite' : ''}</small></li>` : ''; }).join('')}</ol></div>`).join('');
  }
  return h + `<div class="card yg-lib"><input class="inp" type="search" data-field="yoga-q" value="${esc(ygQ)}" placeholder="Suchen, z. B. Krieger" autocomplete="off">
      ${yogaPoseList(false)}</div>
    <p class="hint nut-small explain">Mach nur, was sich gut anfühlt. Bei Schmerzen, Schwindel, Bluthochdruck, Problemen mit Nacken oder Rücken
      und in der Schwangerschaft Umkehrhaltungen und starke Rückbeugen bitte nur nach ärztlicher Rücksprache oder mit Anleitung üben.</p>`;
}

/* ----- Statistik (Verlauf → Statistik → Yoga) ----- */
const yogaStat = { range: 91 };
function yogaBars() {
  const today = todayISO(), monday = addDaysISO(today, -((new Date(today + 'T12:00:00').getDay() + 6) % 7));
  const weeks = Array.from({ length: 12 }, (_, i) => { const from = addDaysISO(monday, -7 * (11 - i)), to = addDaysISO(from, 6);
    return { from, v: data.yoga.filter(y => y.date >= from && y.date <= to).reduce((a, y) => a + y.min, 0) }; });
  const max = Math.max(...weeks.map(w => w.v));
  if (!max) return '<p class="hint">In den letzten 12 Wochen keine Einheiten.</p>';
  const ticks = niceTicks(0, max).filter(t => t >= 0), top = ticks[ticks.length - 1];
  const W = 340, H = 180, L = 36, R = 6, T = 14, B = 24, pw = W - L - R, ph = H - T - B, Y = v => T + (1 - v / top) * ph, bw = pw / 12;
  let svg = `<svg class="chart-svg cardio-bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="Yoga pro Woche: Minuten">`;
  for (const t of ticks) svg += `<line class="c-grid" x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="c-text" x="${L - 6}" y="${Y(t) + 4}" text-anchor="end">${deNum(t)}</text>`;
  weeks.forEach((w, i) => {
    const x = L + i * bw + bw * .18;
    if (w.v) svg += `<rect class="c-bar ${i === 11 ? 'now' : ''}" x="${x}" y="${Y(w.v)}" width="${bw * .64}" height="${Math.max(1.5, Y(0) - Y(w.v))}" rx="3"/>
      <text class="c-val" x="${x + bw * .32}" y="${Y(w.v) - 3}" text-anchor="middle">${deNum(w.v)}</text>`;
    if (i % 3 === 2 || i === 11) svg += `<text class="c-text" x="${x + bw * .32}" y="${H - 7}" text-anchor="middle">${i === 11 ? 'diese' : w.from.slice(8, 10) + '.' + w.from.slice(5, 7) + '.'}</text>`;
  });
  return svg + '</svg><p class="hint cardio-unit">Minuten pro Woche, Beschriftung = Montag der Woche</p>';
}
function renderYogaStats() {
  const all = data.yoga, today = todayISO();
  const add = '<button class="btn primary cardio-add-btn" data-action="yoga-open">🧘 Yoga eintragen</button>';
  if (!all.length) return `<p class="hint">Noch keine Yoga-Einheiten eingetragen. Sobald du welche einträgst, siehst du hier Zeit pro Woche, deine Stile,
    die häufigsten Übungen und deine längsten Haltezeiten.</p>${add}`;
  const from = yogaStat.range ? addDaysISO(today, -(yogaStat.range - 1)) : '';
  const list = all.filter(y => y.date >= from && y.date <= today);
  const sum = k => list.reduce((a, y) => a + (y[k] || 0), 0);
  let h = `<div class="seg cardio-range">${CARDIO_RANGES.map(([l, d]) => `<button class="${yogaStat.range === d ? 'on' : ''}" data-action="yoga-range" data-d="${d}">${l}</button>`).join('')}</div>
    <div class="stats cardio-stats">
      <div class="stat"><span>Einheiten</span><b>${list.length}</b></div>
      <div class="stat"><span>Zeit</span><b>${fmtDur(sum('min'))}</b></div>
      <div class="stat"><span>Ø Dauer</span><b>${list.length ? Math.round(sum('min') / list.length) + ' min' : '–'}</b></div>
      <div class="stat"><span>Verbrannt</span><b>${deNum(sum('kcal'))} kcal</b></div>
    </div>
    <h2>Pro Woche</h2><div class="card cardio-chart">${yogaBars()}</div>`;
  const st = calGet('yoga');
  h += '<h2>Kalender</h2>' + calendarHtml('yoga', iso => all.some(y => y.date === iso) ? { cls: 'cd', sub: '🧘' } : null);
  if (st.sel) {
    const ys = all.filter(y => y.date === st.sel);
    h += `<div class="card cal-day"><p class="cal-day-head"><b>${fmtDate(st.sel + 'T12:00:00', true)}</b></p>
      ${ys.length ? ys.map(y => yogaRowHtml(y)).join('') : '<p class="hint">An diesem Tag kein Yoga.</p>'}</div>`;
  }
  const by = {};
  for (const y of list) (by[y.style] = by[y.style] || []).push(y);
  const styles = Object.entries(by).sort((a, b) => b[1].reduce((s, y) => s + y.min, 0) - a[1].reduce((s, y) => s + y.min, 0));
  if (styles.length) h += `<h2>Nach Stil</h2><ul class="list">${styles.map(([k, ys]) => `<li class="bw-row cardio-row"><span>🧘 ${(YOGA_STYLES[k] || YOGA_STYLES.other).label}
      <small class="hint">${ys.length}× | ${fmtDur(ys.reduce((s, y) => s + y.min, 0))}</small>
      <small class="hint cardio-best">🏆 <span>Längste Einheit:</span> <span>${fmtDur(Math.max(...data.yoga.filter(y => y.style === k).map(y => y.min)))}</span></small></span></li>`).join('')}</ul>`;
  // Übungen im Zeitraum: wie oft, Durchgänge, Zeit; längste Haltezeit
  const ex = {};
  for (const y of list) for (const i of y.items || []) {
    const e = ex[i.p] = ex[i.p] || { n: 0, r: 0, sec: 0, best: 0 };
    e.n++; e.r += i.n || 0; e.sec += (i.s || 0) * (i.n || 1); if (i.s > e.best) e.best = i.s;
  }
  const exs = Object.entries(ex).filter(([id]) => YOGA_BY_ID.has(id)).sort((a, b) => b[1].n - a[1].n || b[1].sec - a[1].sec);
  if (exs.length) h += `<h2>Häufigste Übungen</h2><ul class="list">${exs.slice(0, 15).map(([id, e]) => `<li class="bw-row cardio-row"><span>${YOGA_BY_ID.get(id).flow ? '🔁 ' : ''}${esc(yogaName(id))}
      <small class="hint"><span>${e.n}× eingetragen</span>${e.r ? ` | <span>${e.r} Durchgänge</span>` : ''}${e.sec ? ` | <span>${fmtDur(Math.round(e.sec / 60))}</span>` : ''}</small></span></li>`).join('')}</ul>`;
  const best = Object.entries(ex).filter(([id, e]) => e.best && YOGA_BY_ID.has(id) && !YOGA_BY_ID.get(id).flow).sort((a, b) => b[1].best - a[1].best);
  if (best.length) h += `<h2>Längste Haltezeiten</h2><ul class="list">${best.slice(0, 10).map(([id, e]) => `<li class="bw-row cardio-row"><span>${esc(yogaName(id))}
      <small class="hint">${e.best} Sekunden</small></span></li>`).join('')}</ul>`;
  return h + add;
}

views.yoga = { title: 'Yoga', tab: 'start', back: 'start', render: renderYoga };
views.yogapick = { title: 'Übung hinzufügen', tab: 'start', back: () => ['yoga', {}], render: renderYogaPick };
views.yogalib = { title: 'Yoga-Übungen', tab: 'start', back: () => ['yoga', {}], render: renderYogaLib };

// Suche: nur ein- und ausblenden (Eingabefeld behält den Fokus)
fields['yoga-q'] = el => {
  ygQ = el.value;
  const q = ygQ.trim().toLowerCase();
  let any = false;
  $view.querySelectorAll('.yg-cat').forEach(c => {
    let hit = false;
    c.querySelectorAll('.yg-pose').forEach(p => { const on = !q || p.dataset.s.includes(q); p.hidden = !on; if (on) hit = true; });
    c.querySelector('.yg-poses').hidden = q ? !hit : ygOpenCat !== c.dataset.c;
    c.hidden = !!q && !hit;
    if (hit) any = true;
  });
  const none = $view.querySelector('.yg-none');
  if (none) none.hidden = !q || any;
};
fields['yoga-in'] = el => { yogaForm[el.dataset.k] = el.value; const est = document.getElementById('yoga-est'); if (est) est.innerHTML = yogaEstText(); };
fields['yoga-item'] = el => { const it = yogaForm.items[Number(el.dataset.i)]; if (it) it[el.dataset.k] = el.value; const est = document.getElementById('yoga-est'); if (est) est.innerHTML = yogaEstText(); };

Object.assign(actions, {
  'yoga-open': () => { yogaForm = null; yogaFlowsOpen = false; yogaCmpId = null; yogaStyleTapped = false; go('yoga'); },
  'yoga-open-edit': el => { yogaForm = yogaFormFresh(data.yoga.find(y => y.id === el.dataset.id)); go('yoga'); },
  'yoga-style': el => { yogaForm.style = el.dataset.k; yogaCmpId = null; yogaStyleTapped = true; render(); },
  'yoga-level': el => { yogaForm.level = el.dataset.k; render(); },
  'yoga-cancel': () => { yogaForm = null; render(); },
  'yoga-pick': () => { ygQ = ''; ygOpenCat = null; go('yogapick'); },
  'yoga-pick-done': () => go('yoga'),
  'yoga-lib': () => { ygQ = ''; ygOpenCat = null; ygOpenPose = null; go('yogalib'); },
  'yoga-libtab': el => { ygLibTab = el.dataset.k; render(); },
  'yoga-cat': el => { ygOpenCat = ygOpenCat === el.dataset.c ? null : el.dataset.c; render(); },
  'yoga-pose': el => { ygOpenPose = ygOpenPose === el.dataset.p ? null : el.dataset.p; render(); },
  'yoga-flows-toggle': () => { yogaFlowsOpen = !yogaFlowsOpen; render(); },
  // Übung oder Ablauf hinzufügen (in der Auswahl: nochmal antippen nimmt sie wieder heraus)
  'yoga-add': el => {
    if (!yogaForm) yogaForm = yogaFormFresh();
    const p = el.dataset.p, i = yogaForm.items.findIndex(x => x.p === p);
    if (current.view === 'yogapick' && i >= 0) yogaForm.items.splice(i, 1);
    else yogaForm.items.push({ p, n: '', s: '' });
    if (current.view === 'yoga') yogaFlowsOpen = false;
    render();
  },
  'yoga-item-del': el => { const it = yogaForm.items[Number(el.dataset.i)]; if (it && !askOk(`„${yogaName(it.p)}“ entfernen?`)) return; yogaForm.items.splice(Number(el.dataset.i), 1); render(); },
  'yoga-last': () => {
    const last = [...data.yoga].reverse().find(y => y.items && y.items.length);
    if (last) yogaForm.items = last.items.map(i => ({ p: i.p, n: i.n ? String(i.n) : '', s: i.s ? String(i.s) : '' }));
    render();
  },
  'yoga-save': () => {
    const f = yogaForm;
    let min = parseNum(f.min);
    if (!(min > 0) && String(f.min).trim() === '') min = Math.ceil(yogaItemsSec(f.items) / 60);  // ohne Dauer: aus den Übungszeiten
    if (!min || min <= 0 || min > 600) { alert('Bitte eine Dauer zwischen 1 und 600 Minuten eintragen.'); return; }
    const ownK = String(f.kcal).trim() === '' ? null : parseNum(f.kcal);
    if (ownK != null && (ownK < 0 || ownK > 3000)) { alert('Bitte einen Kalorienwert zwischen 0 und 3.000 eintragen oder das Feld leer lassen.'); return; }
    const items = f.items.filter(i => YOGA_BY_ID.has(i.p)).map(i => {
      const n = parseNum(i.n), s = parseNum(i.s), o = { p: i.p };
      if (n > 0 && n < 1000) o.n = Math.round(n);
      if (s > 0 && s < 36000) o.s = Math.round(s);
      return o;
    });
    const entry = { id: f.id || uid(), date: f.date || todayISO(), style: f.style, level: f.level, min: Math.round(min),
      kcal: ownK != null ? Math.round(ownK) : yogaKcalEst(f.style, f.level, min), own: ownK != null, ...(items.length ? { items } : {}) };
    const i = data.yoga.findIndex(y => y.id === entry.id);
    if (i >= 0) data.yoga[i] = entry; else data.yoga.push(entry);
    saveData();
    const added = data.nutrition && data.nutrition.cardioAdd && entry.date === todayISO();
    toast(`🧘 Eingetragen: ${entry.min} min | ca. ${deNum(entry.kcal)} kcal${added ? ', Tagesziel erhöht' : ''}`);
    yogaForm = yogaFormFresh();
    yogaStyleTapped = false;
    yogaCmpId = entry.id;
    render();
    window.scrollTo(0, 0);
  },
  'yoga-edit': el => { yogaForm = yogaFormFresh(data.yoga.find(y => y.id === el.dataset.id)); render(); window.scrollTo(0, 0); },
  'yoga-del': el => {
    const y = data.yoga.find(x => x.id === el.dataset.id);
    if (!y || !askOk(`Yoga (${(YOGA_STYLES[y.style] || YOGA_STYLES.other).label}) vom ${fmtDate(y.date + 'T12:00:00')} löschen?`)) return;
    data.yoga = data.yoga.filter(x => x !== y);
    saveData(); render();
  },
  'yoga-range': el => { yogaStat.range = Number(el.dataset.d); render(); },
});
