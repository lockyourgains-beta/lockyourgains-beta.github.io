/* LockYourGains | © 2026 Alex Hundt | Alle Rechte vorbehalten – siehe LICENSE */
/* ---------- Yoga (v344): Einheiten eintragen wie Cardio, Übungsbibliothek, Abläufe, Statistik ----------
   data.yoga = [{ id, date: 'JJJJ-MM-TT', style, level: 'easy'|'mid'|'hard', min, kcal, own, items?: [{ p: Haltung/Ablauf, n?: Durchgänge, s?: Sekunden je Durchgang }] }]
   kcal = Mehrverbrauch gegenüber Ruhe wie bei Cardio: (MET × Faktor − 1) × kg × Stunden (MET nach dem Compendium of Physical Activities:
   Hatha 2,5, Sonnengruß/Vinyasa 3,3, Power 4,0, Nadisodhana/Atmung 2,0). Zählt mit Cardio ins Tagesziel, wenn „einrechnen“ an ist.
   Übungen und Abläufe sind freiwillig; Durchgänge und Zeit je Übung auch. */

const YOGA_STYLES = {
  hatha: { label: 'Hatha', met: 2.5 },
  vinyasa: { label: 'Vinyasa / Flow', met: 3.3 },
  power: { label: 'Power Yoga', met: 4.0 },
  ashtanga: { label: 'Ashtanga', met: 4.0 },
  yin: { label: 'Yin Yoga', met: 2.0 },
  restorative: { label: 'Restorative / Entspannung', met: 2.0 },
  hot: { label: 'Hot Yoga / Bikram', met: 3.5 },
  kundalini: { label: 'Kundalini', met: 2.5 },
  iyengar: { label: 'Iyengar', met: 2.5 },
  nidra: { label: 'Yoga Nidra / Meditation', met: 1.3 },
  other: { label: 'Sonstiges', met: 2.5 },
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
      <p class="yg-how">${esc(p.how)}</p>
      <p class="hint nut-small">${esc(p.eff)}</p>
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
  'yoga-open': () => { yogaForm = null; yogaFlowsOpen = false; yogaCmpId = null; go('yoga'); },
  'yoga-open-edit': el => { yogaForm = yogaFormFresh(data.yoga.find(y => y.id === el.dataset.id)); go('yoga'); },
  'yoga-style': el => { yogaForm.style = el.dataset.k; yogaCmpId = null; render(); },
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
  'yoga-item-del': el => { yogaForm.items.splice(Number(el.dataset.i), 1); render(); },
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
