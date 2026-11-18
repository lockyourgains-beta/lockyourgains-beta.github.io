/* LockYourGains | © 2026 Alex Hundt | Alle Rechte vorbehalten – siehe LICENSE */
/* ---------- Ernährungsplan erstellen lassen (v337, v338: Vorlieben, mehr Gerichte, Rest des Tages, Einkaufsliste) ----------
   Gerichte aus der Grundliste (FOOD_BASE, Schlüssel 'b:' + Name). Die App wählt je Wochentag und Mahlzeit ein Gericht und
   rechnet die Mengen an jedem Tag aus dem aktuellen Tagesziel (Kalorien, Eiweiß, Kohlenhydrate, Fett). Ändert sich das Ziel,
   passen sich die Mengen von selbst an. Ist an einem Tag schon etwas eingetragen, rechnet die App die übrigen Mahlzeiten so,
   dass der Tag trotzdem passt.
   data.mealPlan = { created, picks: { 0–6 (Mo = 0): { Mahlzeit: Rezept-ID | null } }, shop: { n: Tage, done: [Namen] } }
   data.mealPrefs = { diet: 'all'|'pesc'|'veg'|'vegan', no: [Kennungen aus MG_NO], ban: [Rezept-IDs] } (bleibt nach „Plan beenden“)
   Anders als beim importierten Plan (data.nutPlan) bleibt das Tagesziel das der App; der Plan schlägt nur vor, was man isst. */

// Zutat: [Name in der Grundliste, Menge in g, Rolle, Stückgewicht (0 = keins), Höchstmenge in g]
// Rolle: P = Eiweißquelle, C = Kohlenhydrate, F = Fett (diese Mengen passt die App an), X = Gemüse, Obst, Soße (bleibt fast gleich)
const MG_OIL = 'Speiseöl (Olivenöl, Rapsöl, Sonnenblumenöl)';
const MG_RECIPES_BASE = [
  // Frühstück
  { id: 'oats', cat: 'b', fam: 'overnightoats', name: 'Overnight Oats mit Skyr und Beeren', how: 'Am Abend alles verrühren und über Nacht in den Kühlschrank stellen.',
    items: [['Haferflocken', 60, 'C', 0, 130], ['Skyr natur', 150, 'P'], ['Milch 1,5 %', 100, 'X'], ['Heidelbeeren', 80, 'X'], ['Chiasamen', 10, 'F']] },
  { id: 'pancakes', cat: 'b', fam: 'pancakes', name: 'Protein-Pancakes mit Beeren', how: 'Alles außer den Beeren pürieren, in wenig Öl kleine Pancakes ausbacken und mit den Beeren essen.',
    items: [['Haferflocken', 50, 'C'], ['Banane', 60, 'C'], ['Eiklar', 100, 'P'], ['Proteinpulver (Whey)', 15, 'P'], ['Ei', 60, 'F', 60], ['Heidelbeeren', 60, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'scramble', cat: 'b', name: 'Rührei mit Vollkornbrot', how: 'Eier und Eiklar verquirlen und in wenig Öl stocken lassen. Mit Brot und Tomate essen.',
    items: [['Ei', 120, 'P', 60], ['Eiklar', 60, 'P'], ['Vollkornbrot', 80, 'C', 0, 200], ['Tomate', 100, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'skyrbowl', cat: 'b', name: 'Skyr-Bowl mit Müsli und Banane', how: 'Skyr in eine Schüssel geben, Müsli, Banane und Walnüsse darauf und mit Honig süßen.',
    items: [['Skyr natur', 250, 'P'], ['Müsli, ohne Zuckerzusatz', 50, 'C'], ['Banane', 80, 'C'], ['Walnüsse', 15, 'F'], ['Honig', 10, 'X']] },
  { id: 'quarkbread', cat: 'b', name: 'Vollkornbrot mit Quark und Schinken', how: 'Brot mit Frischkäse und Quark bestreichen, mit Schinken und Gurke belegen.',
    items: [['Vollkornbrot', 100, 'C', 0, 200], ['Magerquark', 120, 'P'], ['Kochschinken', 40, 'P'], ['Frischkäse leicht', 20, 'F'], ['Gurke', 80, 'X']] },
  { id: 'porridge', cat: 'b', fam: 'porridge', name: 'Protein-Porridge mit Erdnussbutter', how: 'Haferflocken in der Milch aufkochen, vom Herd nehmen und das Proteinpulver einrühren. Mit Banane und Erdnussbutter essen.',
    items: [['Haferflocken', 70, 'C', 0, 130], ['Banane', 60, 'C'], ['Milch 1,5 %', 250, 'X'], ['Proteinpulver (Whey)', 20, 'P'], ['Erdnussbutter', 15, 'F']] },
  { id: 'tofuscramble', cat: 'b', name: 'Tofu-Rührei mit Vollkornbrot', how: 'Tofu mit einer Gabel zerdrücken und in Öl anbraten, Spinat und Tomate kurz mitbraten. Mit Salz, Pfeffer und Kurkuma würzen, dazu Brot.',
    items: [['Tofu natur', 180, 'P'], ['Vollkornbrot', 80, 'C', 0, 200], ['Spinat', 60, 'X'], ['Tomate', 100, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'chia', cat: 'b', fam: 'chia', name: 'Chia-Pudding mit Mango', how: 'Chiasamen und Proteinpulver in die Milch rühren und mindestens 30 Minuten (oder über Nacht) quellen lassen. Mango darauf.',
    items: [['Chiasamen', 25, 'F'], ['Milch 1,5 %', 200, 'X'], ['Proteinpulver (Whey)', 25, 'P'], ['Mango', 150, 'C', 0, 350]] },
  { id: 'avocadobread', cat: 'b', name: 'Vollkornbrot mit Avocado und Räuchertofu', how: 'Avocado zerdrücken und aufs Brot streichen, mit Räuchertofu, Tomate und Rucola belegen.',
    items: [['Vollkornbrot', 100, 'C', 0, 200], ['Räuchertofu', 100, 'P'], ['Avocado', 50, 'F'], ['Tomate', 80, 'X'], ['Rucola', 20, 'X']] },
  { id: 'skyrfruit', cat: 'b', name: 'Skyr mit Erdbeeren, Banane und Kürbiskernen', how: 'Skyr glatt rühren, Obst klein schneiden und darauf geben, mit Kürbiskernen und Honig.',
    items: [['Skyr natur', 250, 'P'], ['Erdbeeren', 150, 'X'], ['Banane', 100, 'C', 0, 250], ['Kürbiskerne', 15, 'F'], ['Honig', 10, 'C']] },
  { id: 'omelette', cat: 'b', name: 'Gemüse-Omelett mit Feta und Reiswaffeln', how: 'Eier und Eiklar verquirlen, mit Paprika und Spinat in die Pfanne geben, Feta darüber bröseln und stocken lassen. Reiswaffeln dazu.',
    items: [['Ei', 120, 'P', 60], ['Eiklar', 90, 'P'], ['Paprika', 100, 'X'], ['Spinat', 50, 'X'], ['Feta (Schafskäse)', 20, 'F'], ['Reiswaffel', 24, 'C', 8, 64]] },
  { id: 'millet', cat: 'b', fam: 'porridge', name: 'Hirse-Porridge mit Apfel und Zimt', how: 'Hirse in der Milch etwa 15 Minuten köcheln lassen, vom Herd nehmen und das Proteinpulver einrühren. Mit Apfel, Zimt und Mandeln essen.',
    items: [['Hirse, roh', 60, 'C', 0, 130], ['Milch 1,5 %', 250, 'X'], ['Proteinpulver (Whey)', 20, 'P'], ['Apfel', 120, 'X'], ['Mandeln', 10, 'F']] },
  // Haupt­mahlzeiten
  { id: 'chickenrice', cat: 'm', name: 'Hähnchen mit Reis und Brokkoli', how: 'Reis kochen. Hähnchen in Stücken in Öl braten, Brokkoli dämpfen oder mitbraten.',
    items: [['Hähnchenbrust, roh', 170, 'P'], ['Reis, roh', 80, 'C', 0, 170], ['Brokkoli', 200, 'X'], [MG_OIL, 8, 'F']] },
  { id: 'chili', cat: 'm', fam: 'chili', name: 'Chili con Carne mit Reis', how: 'Zwiebel und Hack in Öl anbraten, Paprika, Tomaten, Bohnen und Mais dazugeben und 15 Minuten köcheln lassen. Mit Reis essen.',
    items: [['Rinderhackfleisch mager (5 % Fett), roh', 150, 'P'], ['Kidneybohnen (Dose, abgetropft)', 100, 'C'], ['Reis, roh', 60, 'C'], ['Passierte Tomaten (Passata)', 200, 'X'],
      ['Paprika', 100, 'X'], ['Zwiebel', 50, 'X'], ['Mais (Dose, abgetropft)', 50, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'salmon', cat: 'm', name: 'Lachs mit Süßkartoffel und grünen Bohnen', how: 'Süßkartoffel in Spalten mit Öl im Ofen backen (200 °C, etwa 25 Minuten), den Lachs die letzten 12 Minuten dazulegen. Bohnen kochen.',
    items: [['Lachs, roh', 140, 'P'], ['Süßkartoffel', 300, 'C', 0, 500], ['Grüne Bohnen', 150, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'bolognese', cat: 'm', fam: 'bolognese', name: 'Spaghetti Bolognese mit magerem Hack', how: 'Zwiebel, Karotte und Hack in Öl anbraten, Tomaten dazugeben und köcheln lassen. Mit Nudeln und Parmesan essen.',
    items: [['Nudeln, roh', 90, 'C', 0, 170], ['Rinderhackfleisch mager (5 % Fett), roh', 150, 'P'], ['Passierte Tomaten (Passata)', 200, 'X'], ['Zwiebel', 50, 'X'],
      ['Karotte (Möhre)', 60, 'X'], ['Parmesan', 10, 'F'], [MG_OIL, 5, 'F']] },
  { id: 'wrap', cat: 'm', fam: 'wrap', name: 'Puten-Wraps mit Joghurtsoße', how: 'Pute in Streifen braten und mit Gemüse und Joghurt in die Wraps rollen.',
    items: [['Wrap (Weizentortilla)', 120, 'C', 60], ['Putenbrust, roh', 150, 'P'], ['Paprika', 80, 'X'], ['Blattsalat (Kopfsalat, Eisberg, Feldsalat)', 40, 'X'],
      ['Tomate', 60, 'X'], ['Joghurt natur 1,5 %', 60, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'tunapasta', cat: 'm', name: 'Thunfisch-Nudelsalat', how: 'Nudeln kochen und abkühlen lassen, mit Thunfisch, Gemüse, Joghurt und Öl mischen.',
    items: [['Vollkornnudeln, roh', 80, 'C', 0, 170], ['Thunfisch im eigenen Saft (abgetropft)', 130, 'P'], ['Mais (Dose, abgetropft)', 60, 'X'], ['Tomate', 100, 'X'],
      ['Gurke', 100, 'X'], ['Joghurt natur 1,5 %', 60, 'X'], [MG_OIL, 8, 'F']] },
  { id: 'steak', cat: 'm', name: 'Steak mit Kartoffeln und Champignons', how: 'Steak von jeder Seite 2 bis 3 Minuten in Öl braten und kurz ruhen lassen. Champignons in der Pfanne braten, dazu Kartoffeln.',
    items: [['Rindersteak (Hüfte, Rumpsteak), roh', 180, 'P'], ['Kartoffeln, gekocht', 300, 'C', 0, 500], ['Champignons', 150, 'X'], [MG_OIL, 8, 'F']] },
  { id: 'tofucurry', cat: 'm', fam: 'wok', name: 'Tofu-Gemüse-Pfanne mit Reis', how: 'Tofu würfeln und in Öl knusprig braten, Gemüse dazugeben und mit Sojasoße abschmecken. Mit Reis essen.',
    items: [['Tofu natur', 200, 'P'], ['Reis, roh', 75, 'C', 0, 170], ['Gemüsemischung (TK)', 250, 'X'], ['Sojasoße', 15, 'X'], [MG_OIL, 8, 'F']] },
  { id: 'bowl', cat: 'm', fam: 'bowl', name: 'Hähnchen-Quinoa-Bowl mit Feta', how: 'Quinoa kochen, Hähnchen braten und mit Kichererbsen, Gurke, Tomate und Feta in einer Schüssel anrichten.',
    items: [['Hähnchenbrust, roh', 150, 'P'], ['Quinoa, roh', 60, 'C'], ['Kichererbsen (Dose, abgetropft)', 80, 'C'], ['Gurke', 100, 'X'], ['Tomate', 100, 'X'], ['Feta (Schafskäse)', 30, 'F']] },
  { id: 'pollock', cat: 'm', name: 'Seelachs mit Kartoffeln und Rahmspinat', how: 'Seelachs in Öl braten. Spinat dünsten und mit saurer Sahne verrühren, dazu Kartoffeln.',
    items: [['Seelachs, roh', 200, 'P'], ['Kartoffeln, gekocht', 300, 'C', 0, 500], ['Spinat', 200, 'X'], ['Saure Sahne 10 %', 40, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'pesto', cat: 'm', name: 'Pesto-Nudeln mit Hähnchen und Zucchini', how: 'Nudeln kochen, Hähnchen und Zucchini braten, Tomaten dazugeben und alles mit Pesto mischen.',
    items: [['Nudeln, roh', 80, 'C', 0, 170], ['Hähnchenbrust, roh', 150, 'P'], ['Zucchini', 150, 'X'], ['Tomate', 80, 'X'], ['Pesto (Basilikum)', 20, 'F']] },
  { id: 'lentilbolo', cat: 'm', fam: 'bolognese', name: 'Linsen-Bolognese mit Vollkornnudeln', how: 'Zwiebel und Karotte in Öl anbraten, Linsen und Tomaten mit etwas Wasser dazugeben und etwa 20 Minuten köcheln lassen. Mit Nudeln essen.',
    items: [['Linsen, roh', 70, 'P'], ['Vollkornnudeln, roh', 80, 'C', 0, 170], ['Passierte Tomaten (Passata)', 250, 'X'], ['Zwiebel', 50, 'X'], ['Karotte (Möhre)', 80, 'X'], [MG_OIL, 8, 'F']] },
  { id: 'soychili', cat: 'm', fam: 'chili', name: 'Sojaschnetzel-Chili mit Reis', how: 'Sojaschnetzel 10 Minuten in heißer Brühe einweichen und ausdrücken. Mit Zwiebel in Öl anbraten, Paprika, Tomaten, Bohnen und Mais dazugeben und köcheln lassen. Mit Reis essen.',
    items: [['Sojaschnetzel, trocken', 50, 'P'], ['Kidneybohnen (Dose, abgetropft)', 100, 'C'], ['Reis, roh', 60, 'C', 0, 170], ['Passierte Tomaten (Passata)', 200, 'X'],
      ['Paprika', 100, 'X'], ['Zwiebel', 50, 'X'], ['Mais (Dose, abgetropft)', 50, 'X'], [MG_OIL, 8, 'F']] },
  { id: 'tofubowl', cat: 'm', fam: 'bowl', name: 'Räuchertofu-Bowl mit Quinoa und Edamame', how: 'Quinoa kochen, Edamame kurz garen, Räuchertofu würfeln und anbraten. Mit Karotte, Gurke und Avocado anrichten.',
    items: [['Räuchertofu', 120, 'P'], ['Edamame (TK)', 80, 'P'], ['Quinoa, roh', 60, 'C', 0, 150], ['Karotte (Möhre)', 60, 'X'], ['Gurke', 100, 'X'], ['Avocado', 40, 'F']] },
  { id: 'chickpeacurry', cat: 'm', fam: 'curry', name: 'Kichererbsen-Spinat-Curry mit Reis', how: 'Zwiebel in Öl anbraten, Currypulver kurz mitrösten. Kichererbsen und Tomaten dazugeben, 10 Minuten köcheln lassen und den Spinat unterheben. Mit Reis essen.',
    items: [['Kichererbsen (Dose, abgetropft)', 200, 'P'], ['Reis, roh', 60, 'C', 0, 170], ['Spinat', 150, 'X'], ['Passierte Tomaten (Passata)', 150, 'X'], ['Zwiebel', 50, 'X'], [MG_OIL, 10, 'F']] },
  { id: 'falafel', cat: 'm', name: 'Falafel-Teller mit Bulgur und Hummus', how: 'Bulgur mit kochendem Wasser übergießen und 10 Minuten quellen lassen. Falafel im Ofen aufbacken und mit Salat, Tomate, Gurke und Hummus anrichten.',
    items: [['Falafel', 100, 'P'], ['Bulgur, roh', 50, 'C', 0, 130], ['Hummus', 40, 'F'], ['Tomate', 100, 'X'], ['Gurke', 100, 'X'], ['Blattsalat (Kopfsalat, Eisberg, Feldsalat)', 40, 'X']] },
  { id: 'potatoquark', cat: 'm', name: 'Pellkartoffeln mit Kräuterquark', how: 'Kartoffeln mit Schale kochen. Quark mit Kräutern, Salz und Öl glatt rühren, Gurke dazu.',
    items: [['Kartoffeln, gekocht', 350, 'C', 0, 500], ['Magerquark', 250, 'P'], [MG_OIL, 8, 'F'], ['Gurke', 150, 'X']] },
  { id: 'couscous', cat: 'm', name: 'Couscous-Salat mit Feta und Kichererbsen', how: 'Couscous mit kochendem Wasser übergießen und quellen lassen. Mit Kichererbsen, Gemüse, Feta, Öl und Zitrone mischen.',
    items: [['Couscous, roh', 60, 'C', 0, 150], ['Kichererbsen (Dose, abgetropft)', 120, 'P'], ['Feta (Schafskäse)', 40, 'F'], ['Paprika', 80, 'X'], ['Gurke', 80, 'X'], ['Tomate', 80, 'X'], [MG_OIL, 5, 'F']] },
  { id: 'shakshuka', cat: 'm', name: 'Shakshuka mit Vollkornbrot', how: 'Zwiebel und Paprika in Öl anbraten, Tomaten dazugeben und einköcheln lassen. Eier hineinschlagen, zugedeckt stocken lassen und Feta darüber geben. Mit Brot essen.',
    items: [['Ei', 180, 'P', 60], ['Passierte Tomaten (Passata)', 200, 'X'], ['Paprika', 100, 'X'], ['Zwiebel', 50, 'X'], ['Vollkornbrot', 80, 'C', 0, 200], ['Feta (Schafskäse)', 20, 'F'], [MG_OIL, 5, 'F']] },
  { id: 'shrimp', cat: 'm', name: 'Garnelen-Nudeln mit Zucchini und Tomaten', how: 'Nudeln kochen. Garnelen mit Knoblauch in Öl braten, Zucchini und Tomaten kurz mitbraten und alles mit den Nudeln mischen.',
    items: [['Garnelen, roh', 180, 'P'], ['Nudeln, roh', 80, 'C', 0, 170], ['Zucchini', 150, 'X'], ['Tomate', 100, 'X'], [MG_OIL, 10, 'F']] },
  { id: 'cod', cat: 'm', name: 'Kabeljau mit Reis, Erbsen und Karotten', how: 'Reis kochen. Kabeljau in Öl braten, Erbsen und Karotten dünsten.',
    items: [['Kabeljau, roh', 200, 'P'], ['Reis, roh', 70, 'C', 0, 170], ['Erbsen (TK)', 100, 'X'], ['Karotte (Möhre)', 80, 'X'], [MG_OIL, 8, 'F']] },
  { id: 'pork', cat: 'm', name: 'Schweinefilet mit Bulgur und Paprikagemüse', how: 'Bulgur quellen lassen. Schweinefilet in Medaillons schneiden und in Öl braten, Paprika und Zwiebel mitbraten.',
    items: [['Schweinefilet, roh', 170, 'P'], ['Bulgur, roh', 70, 'C', 0, 150], ['Paprika', 150, 'X'], ['Zwiebel', 50, 'X'], [MG_OIL, 8, 'F']] },
  // Snacks
  { id: 'quarkberry', cat: 's', name: 'Magerquark mit Himbeeren', how: 'Quark glatt rühren, Beeren und Mandeln darauf geben und mit Honig süßen.',
    items: [['Magerquark', 200, 'P'], ['Himbeeren', 100, 'X'], ['Honig', 10, 'C'], ['Mandeln', 10, 'F']] },
  { id: 'shake', cat: 's', fam: 'shake', name: 'Proteinshake mit Banane', how: 'Alles im Mixer oder Shaker mischen.',
    items: [['Proteinpulver (Whey)', 30, 'P'], ['Milch 1,5 %', 300, 'X'], ['Banane', 100, 'C']] },
  { id: 'ricecakes', cat: 's', name: 'Reiswaffeln mit Hüttenkäse', how: 'Reiswaffeln mit Hüttenkäse und Tomatenscheiben belegen.',
    items: [['Reiswaffel', 32, 'C', 8], ['Hüttenkäse (körniger Frischkäse)', 150, 'P'], ['Tomate', 80, 'X']] },
  { id: 'pudding', cat: 's', name: 'Proteinpudding mit Apfel und Mandeln', how: 'Apfel in Stücke schneiden und mit Pudding und Mandeln essen.',
    items: [['Proteinpudding', 200, 'P'], ['Apfel', 150, 'C'], ['Mandeln', 15, 'F']] },
  { id: 'cottagebread', cat: 's', name: 'Vollkornbrot mit Hüttenkäse', how: 'Brot mit Hüttenkäse belegen, Gurke dazu.',
    items: [['Vollkornbrot', 60, 'C'], ['Hüttenkäse (körniger Frischkäse)', 100, 'P'], ['Gurke', 60, 'X']] },
  { id: 'edamame', cat: 's', name: 'Edamame und Clementinen', how: 'Edamame in Salzwasser 4 Minuten kochen, mit etwas Salz bestreuen. Clementinen dazu.',
    items: [['Edamame (TK)', 150, 'P'], ['Mandarine, Clementine', 140, 'C', 0, 300]] },
  { id: 'hummus', cat: 's', name: 'Gemüsesticks mit Hummus und Reiswaffeln', how: 'Karotte und Paprika in Streifen schneiden und mit den Reiswaffeln in den Hummus dippen.',
    items: [['Hummus', 50, 'F'], ['Karotte (Möhre)', 100, 'X'], ['Paprika', 80, 'X'], ['Reiswaffel', 24, 'C', 8, 64]] },
  { id: 'eggs', cat: 's', name: 'Gekochte Eier mit Gurke und Reiswaffeln', how: 'Eier 8 bis 9 Minuten kochen, abschrecken und schälen. Mit Gurke und Reiswaffeln essen.',
    items: [['Ei', 120, 'P', 60], ['Gurke', 100, 'X'], ['Reiswaffel', 16, 'C', 8, 48]] },
  { id: 'turkeyroll', cat: 's', name: 'Vollkornbrot mit Putenbrust', how: 'Brot dünn mit Frischkäse bestreichen und mit Putenbrust und Gurke belegen.',
    items: [['Vollkornbrot', 60, 'C', 0, 150], ['Putenbrust-Aufschnitt', 60, 'P'], ['Frischkäse leicht', 15, 'F'], ['Gurke', 60, 'X']] },
  { id: 'caprese', cat: 's', name: 'Tomate-Mozzarella mit Vollkornbrot', how: 'Tomate und Mozzarella in Scheiben schneiden, mit Basilikum, Salz und Pfeffer. Brot dazu.',
    items: [['Mozzarella light', 125, 'P'], ['Tomate', 150, 'X'], ['Vollkornbrot', 40, 'C', 0, 120]] },
];
// Ergänzungen, falls die Gerichte das Tagesziel nicht erreichen (z. B. sehr hohe Kalorien): [Name, Grundmenge, Rolle, Stück, Höchstmenge]
// v338: Proteinpulver, falls das Eiweiß nicht reicht (v. a. vegetarisch und vegan; nicht bei „ohne Proteinpulver“)
const MG_FILL = [['Banane', 100, 'C', 0, 250], ['Reiswaffel', 16, 'C', 8, 64], ['Mandeln', 10, 'F', 0, 30], ['Proteinpulver (Whey)', 30, 'P', 0, 45]];
// v339: dazu die Gerichte aus rezepte.js (über 250, Format wie hier, Stückgewichte und Höchstmengen aus MG_UNIT und MG_MAX)
const MG_RECIPES = MG_RECIPES_BASE.concat(typeof MG_RECIPES_MORE !== 'undefined' ? MG_RECIPES_MORE : []);
const MG_BY_ID = new Map(MG_RECIPES.map(r => [r.id, r]));
const MG_SHARE = { b: 0.25, m: 0.35, s: 0.12 };
const MG_BOUNDS = { P: [0.6, 3], C: [0.5, 3.5], F: [0, 4] };
// v340 (User): verzehrübliche Portionen. Eiweißquellen bei Frühstück und Hauptgerichten nie unter dieser Grenze (Anteil der Rezeptmenge,
// je nach Tagesziel 0,8 bis 1,2, siehe mgPLo); Eiweiß darüber zählt nur schwach als Abweichung. Öl mindestens 5 g, wenn das Rezept damit brät.
const MG_P_OVER_W = 1.5;

/* ----- Vorlieben ----- */
// Kennzeichen der Zutaten: m Fleisch, f Fisch und Meeresfrüchte, d Milch, e Ei, n Nüsse und Erdnüsse, g Gluten, s Soja, w Proteinpulver, h Honig
// (vorsichtig: Haferflocken, Haferdrink und Falafel zählen als glutenhaltig, veganes Proteinpulver als sojahaltig, Eiweißbrot als gluten-, soja- und milchhaltig)
const MG_TAG = {
  'Haferflocken': 'g', 'Müsli, ohne Zuckerzusatz': 'gn', 'Knuspermüsli (Crunchy)': 'gn', 'Cornflakes': 'g', 'Vollkornbrot': 'g', 'Mischbrot': 'g', 'Toastbrot (Weizen)': 'g',
  'Vollkorntoast': 'g', 'Brötchen (Weizen)': 'g', 'Vollkornbrötchen': 'g', 'Baguette': 'g', 'Fladenbrot': 'g', 'Knäckebrot': 'g', 'Laugenbrezel': 'g',
  'Eiweißbrot (Proteinbrot)': 'gsd', 'Nudeln, roh': 'g', 'Vollkornnudeln, roh': 'g', 'Mie-Nudeln, roh': 'ge', 'Wrap (Weizentortilla)': 'g', 'Couscous, roh': 'g',
  'Bulgur, roh': 'g', 'Grieß, roh': 'g', 'Weizenmehl': 'g', 'Gnocchi': 'g', 'Haferdrink': 'g', 'Falafel': 'g', 'Seitan': 'g', 'Croissant': 'gd',
  'Skyr natur': 'd', 'Milch 1,5 %': 'd', 'Milch 3,5 %': 'd', 'Magerquark': 'd', 'Speisequark 20 %': 'd', 'Speisequark 40 %': 'd', 'Frischkäse leicht': 'd',
  'Frischkäse natur (Doppelrahm)': 'd', 'Joghurt natur 1,5 %': 'd', 'Joghurt natur 3,5 %': 'd', 'Griechischer Joghurt 10 %': 'd', 'Parmesan': 'd',
  'Feta (Schafskäse)': 'd', 'Halloumi': 'd', 'Gouda': 'd', 'Emmentaler': 'd', 'Mozzarella': 'd', 'Mozzarella light': 'd', 'Harzer Käse': 'd',
  'Hüttenkäse (körniger Frischkäse)': 'd', 'Saure Sahne 10 %': 'd', 'Schmand 24 %': 'd', 'Crème fraîche': 'd', 'Schlagsahne 30 %': 'd', 'Kochsahne 15 %': 'd',
  'Butter': 'd', 'Proteinpudding': 'd', 'Vollmilchschokolade': 'd', 'Zartbitterschokolade 70 %': 'd', 'Proteinriegel': 'dns',
  'Proteinpulver (Whey)': 'dw', 'Proteinpulver, vegan': 'ws', 'Pesto (Basilikum)': 'dn',
  'Ei': 'e', 'Eiklar': 'e', 'Mayonnaise': 'e',
  'Mandeln': 'n', 'Walnüsse': 'n', 'Haselnüsse': 'n', 'Cashewkerne': 'n', 'Pistazien': 'n', 'Erdnüsse, geröstet': 'n', 'Erdnussbutter': 'n',
  'Tofu natur': 's', 'Räuchertofu': 's', 'Tempeh': 's', 'Sojaschnetzel, trocken': 's', 'Sojadrink, ungesüßt': 's', 'Sojajoghurt natur': 's', 'Edamame (TK)': 's', 'Sojasoße': 'sg',
  'Hähnchenbrust, roh': 'm', 'Hähnchenbrust, gebraten': 'm', 'Hähnchenschenkel ohne Haut, roh': 'm', 'Putenbrust, roh': 'm', 'Putenhackfleisch, roh': 'm',
  'Rinderhackfleisch mager (5 % Fett), roh': 'm', 'Rinderhackfleisch (20 % Fett), roh': 'm', 'Rindersteak (Hüfte, Rumpsteak), roh': 'm',
  'Rindfleisch mager (Gulasch, Schulter), roh': 'm', 'Kalbsschnitzel, roh': 'm', 'Lammfleisch mager (Keule, Schulter), roh': 'm', 'Schweinefilet, roh': 'm',
  'Schweineschnitzel, roh': 'm', 'Kasseler': 'm', 'Kochschinken': 'm', 'Putenbrust-Aufschnitt': 'm', 'Frühstücksspeck (Bacon)': 'm',
  'Bresaola (Rinderschinken)': 'm', 'Beef Jerky (Trockenfleisch)': 'm',
  'Lachs, roh': 'f', 'Räucherlachs': 'f', 'Forelle, roh': 'f', 'Thunfisch im eigenen Saft (abgetropft)': 'f', 'Thunfisch in Öl (abgetropft)': 'f', 'Seelachs, roh': 'f',
  'Kabeljau, roh': 'f', 'Garnelen, roh': 'f',
  'Honig': 'h',
};
const MG_DIETS = [['all', 'Alles'], ['pesc', 'Pescetarisch'], ['veg', 'Vegetarisch'], ['vegan', 'Vegan']];
const MG_DIET_X = { all: '', pesc: 'm', veg: 'mf', vegan: 'mfdeh' };
const MG_NO = [['d', 'Milchprodukte'], ['e', 'Ei'], ['f', 'Fisch und Meeresfrüchte'], ['n', 'Nüsse und Erdnüsse'], ['g', 'Gluten'], ['s', 'Soja'], ['w', 'Proteinpulver']];
// Ersatz, wenn eine Zutat nicht zu den Vorlieben passt (der Reihe nach den ersten passenden)
const MG_SUB = { 'Milch 1,5 %': ['Sojadrink, ungesüßt', 'Haferdrink'], 'Milch 3,5 %': ['Sojadrink, ungesüßt', 'Haferdrink'], 'Proteinpulver (Whey)': ['Proteinpulver, vegan'],
  'Honig': ['Ahornsirup'], 'Mandeln': ['Kürbiskerne'], 'Walnüsse': ['Kürbiskerne'], 'Haselnüsse': ['Kürbiskerne'], 'Cashewkerne': ['Kürbiskerne'], 'Erdnüsse, geröstet': ['Kürbiskerne'],
  'Erdnussbutter': ['Tahin (Sesammus)'], 'Joghurt natur 1,5 %': ['Sojajoghurt natur'], 'Joghurt natur 3,5 %': ['Sojajoghurt natur'], 'Saure Sahne 10 %': ['Sojajoghurt natur'],
  'Kochsahne 15 %': ['Kokosmilch (light)'], 'Butter': [MG_OIL], 'Nudeln, roh': ['Linsennudeln, roh'], 'Vollkornnudeln, roh': ['Linsennudeln, roh'],
  'Couscous, roh': ['Quinoa, roh'], 'Bulgur, roh': ['Quinoa, roh'], 'Mie-Nudeln, roh': ['Reisnudeln, roh'], 'Gnocchi': ['Kartoffeln, gekocht'] };
// v339: Alternativen, falls man eine Zutat gerade nicht da hat (nur gut passende, die beste zuerst). Die Menge rechnet die App um.
const MG_ALT = {
  'Hähnchenbrust, roh': ['Putenbrust, roh', 'Hähnchenschenkel ohne Haut, roh'], 'Putenbrust, roh': ['Hähnchenbrust, roh', 'Hähnchenschenkel ohne Haut, roh'],
  'Hähnchenschenkel ohne Haut, roh': ['Hähnchenbrust, roh', 'Putenbrust, roh'], 'Hähnchenbrust, gebraten': ['Putenbrust-Aufschnitt'],
  'Putenhackfleisch, roh': ['Rinderhackfleisch mager (5 % Fett), roh'], 'Rinderhackfleisch mager (5 % Fett), roh': ['Putenhackfleisch, roh', 'Rinderhackfleisch (20 % Fett), roh', 'Sojaschnetzel, trocken'],
  'Rindersteak (Hüfte, Rumpsteak), roh': ['Schweinefilet, roh', 'Putenbrust, roh'], 'Rindfleisch mager (Gulasch, Schulter), roh': ['Lammfleisch mager (Keule, Schulter), roh', 'Schweineschnitzel, roh'],
  'Lammfleisch mager (Keule, Schulter), roh': ['Rindfleisch mager (Gulasch, Schulter), roh'], 'Kalbsschnitzel, roh': ['Schweineschnitzel, roh', 'Putenbrust, roh'],
  'Schweinefilet, roh': ['Schweineschnitzel, roh', 'Putenbrust, roh'], 'Schweineschnitzel, roh': ['Schweinefilet, roh', 'Putenbrust, roh'], 'Kasseler': ['Schweinefilet, roh'],
  'Kochschinken': ['Putenbrust-Aufschnitt', 'Bresaola (Rinderschinken)'], 'Putenbrust-Aufschnitt': ['Kochschinken', 'Bresaola (Rinderschinken)'],
  'Bresaola (Rinderschinken)': ['Putenbrust-Aufschnitt', 'Kochschinken'], 'Frühstücksspeck (Bacon)': ['Kochschinken'], 'Beef Jerky (Trockenfleisch)': ['Bresaola (Rinderschinken)'],
  'Lachs, roh': ['Forelle, roh', 'Seelachs, roh'], 'Forelle, roh': ['Lachs, roh', 'Seelachs, roh'], 'Seelachs, roh': ['Kabeljau, roh', 'Forelle, roh'],
  'Kabeljau, roh': ['Seelachs, roh', 'Forelle, roh'], 'Garnelen, roh': ['Kabeljau, roh', 'Hähnchenbrust, roh'], 'Räucherlachs': ['Thunfisch im eigenen Saft (abgetropft)'],
  'Thunfisch im eigenen Saft (abgetropft)': ['Thunfisch in Öl (abgetropft)', 'Hähnchenbrust, gebraten'], 'Thunfisch in Öl (abgetropft)': ['Thunfisch im eigenen Saft (abgetropft)'],
  'Ei': ['Eiklar'], 'Eiklar': ['Ei'],
  'Magerquark': ['Skyr natur', 'Speisequark 20 %'], 'Skyr natur': ['Magerquark', 'Speisequark 20 %'], 'Speisequark 20 %': ['Magerquark', 'Skyr natur'],
  'Hüttenkäse (körniger Frischkäse)': ['Magerquark', 'Frischkäse leicht'], 'Joghurt natur 1,5 %': ['Skyr natur', 'Joghurt natur 3,5 %', 'Sojajoghurt natur'],
  'Joghurt natur 3,5 %': ['Joghurt natur 1,5 %', 'Skyr natur'], 'Griechischer Joghurt 10 %': ['Joghurt natur 3,5 %', 'Skyr natur'], 'Sojajoghurt natur': ['Joghurt natur 1,5 %', 'Skyr natur'],
  'Proteinpudding': ['Skyr natur', 'Magerquark'], 'Milch 1,5 %': ['Milch 3,5 %', 'Sojadrink, ungesüßt', 'Haferdrink'], 'Milch 3,5 %': ['Milch 1,5 %', 'Sojadrink, ungesüßt'],
  'Sojadrink, ungesüßt': ['Milch 1,5 %', 'Haferdrink'], 'Haferdrink': ['Sojadrink, ungesüßt', 'Milch 1,5 %'],
  'Frischkäse leicht': ['Frischkäse natur (Doppelrahm)', 'Hüttenkäse (körniger Frischkäse)', 'Magerquark'], 'Frischkäse natur (Doppelrahm)': ['Frischkäse leicht'],
  'Feta (Schafskäse)': ['Mozzarella light', 'Halloumi'], 'Halloumi': ['Feta (Schafskäse)', 'Räuchertofu'], 'Parmesan': ['Emmentaler', 'Gouda'],
  'Mozzarella light': ['Mozzarella', 'Feta (Schafskäse)'], 'Mozzarella': ['Mozzarella light', 'Gouda'], 'Gouda': ['Emmentaler', 'Mozzarella light'], 'Emmentaler': ['Gouda', 'Mozzarella light'],
  'Saure Sahne 10 %': ['Joghurt natur 3,5 %', 'Kochsahne 15 %'], 'Kochsahne 15 %': ['Saure Sahne 10 %', 'Frischkäse leicht', 'Kokosmilch (light)'],
  'Kokosmilch (light)': ['Kochsahne 15 %'], 'Schlagsahne 30 %': ['Kochsahne 15 %'], 'Schmand 24 %': ['Saure Sahne 10 %', 'Crème fraîche'], 'Crème fraîche': ['Schmand 24 %', 'Saure Sahne 10 %'],
  'Proteinpulver (Whey)': ['Proteinpulver, vegan'], 'Proteinpulver, vegan': ['Proteinpulver (Whey)'],
  'Tofu natur': ['Räuchertofu', 'Tempeh'], 'Räuchertofu': ['Tofu natur', 'Tempeh'], 'Tempeh': ['Räuchertofu', 'Tofu natur'], 'Seitan': ['Räuchertofu', 'Tempeh'],
  'Sojaschnetzel, trocken': ['Seitan', 'Linsen, roh'], 'Edamame (TK)': ['Erbsen (TK)'],
  'Kichererbsen (Dose, abgetropft)': ['Weiße Bohnen (Dose, abgetropft)', 'Kidneybohnen (Dose, abgetropft)'], 'Kidneybohnen (Dose, abgetropft)': ['Schwarze Bohnen (Dose, abgetropft)', 'Weiße Bohnen (Dose, abgetropft)'],
  'Schwarze Bohnen (Dose, abgetropft)': ['Kidneybohnen (Dose, abgetropft)'], 'Weiße Bohnen (Dose, abgetropft)': ['Kichererbsen (Dose, abgetropft)', 'Kidneybohnen (Dose, abgetropft)'],
  'Linsen, roh': ['Linsen, gekocht'], 'Linsen, gekocht': ['Linsen, roh'],
  'Reis, roh': ['Vollkornreis, roh', 'Quinoa, roh', 'Hirse, roh'], 'Vollkornreis, roh': ['Reis, roh', 'Quinoa, roh'], 'Quinoa, roh': ['Bulgur, roh', 'Couscous, roh', 'Reis, roh'],
  'Bulgur, roh': ['Couscous, roh', 'Quinoa, roh', 'Reis, roh'], 'Couscous, roh': ['Bulgur, roh', 'Quinoa, roh'], 'Hirse, roh': ['Quinoa, roh', 'Reis, roh'],
  'Buchweizen, roh': ['Quinoa, roh', 'Hirse, roh'], 'Polenta (Maisgrieß), roh': ['Kartoffeln, gekocht', 'Couscous, roh'], 'Grieß, roh': ['Hirse, roh'],
  'Nudeln, roh': ['Vollkornnudeln, roh', 'Linsennudeln, roh'], 'Vollkornnudeln, roh': ['Nudeln, roh', 'Linsennudeln, roh'], 'Linsennudeln, roh': ['Vollkornnudeln, roh', 'Nudeln, roh'],
  'Mie-Nudeln, roh': ['Reisnudeln, roh', 'Nudeln, roh'], 'Reisnudeln, roh': ['Mie-Nudeln, roh', 'Reis, roh'], 'Gnocchi': ['Kartoffeln, gekocht', 'Nudeln, roh'],
  'Kartoffeln, gekocht': ['Süßkartoffel'], 'Süßkartoffel': ['Kartoffeln, gekocht'],
  'Vollkornbrot': ['Vollkorntoast', 'Mischbrot', 'Eiweißbrot (Proteinbrot)'], 'Mischbrot': ['Vollkornbrot'], 'Vollkorntoast': ['Vollkornbrot', 'Toastbrot (Weizen)'],
  'Toastbrot (Weizen)': ['Vollkorntoast'], 'Vollkornbrötchen': ['Brötchen (Weizen)', 'Vollkornbrot'], 'Brötchen (Weizen)': ['Vollkornbrötchen'],
  'Eiweißbrot (Proteinbrot)': ['Vollkornbrot'], 'Knäckebrot': ['Reiswaffel', 'Vollkornbrot'], 'Reiswaffel': ['Knäckebrot'], 'Wrap (Weizentortilla)': ['Fladenbrot'],
  'Fladenbrot': ['Wrap (Weizentortilla)', 'Baguette'], 'Baguette': ['Vollkornbrötchen', 'Fladenbrot'],
  'Haferflocken': ['Müsli, ohne Zuckerzusatz'], 'Müsli, ohne Zuckerzusatz': ['Haferflocken'], 'Knuspermüsli (Crunchy)': ['Müsli, ohne Zuckerzusatz'], 'Cornflakes': ['Müsli, ohne Zuckerzusatz'],
  'Banane': ['Apfel', 'Mango'], 'Apfel': ['Birne', 'Banane'], 'Birne': ['Apfel'], 'Heidelbeeren': ['Himbeeren', 'Erdbeeren'], 'Himbeeren': ['Heidelbeeren', 'Erdbeeren'],
  'Erdbeeren': ['Himbeeren', 'Heidelbeeren'], 'Kirschen': ['Himbeeren', 'Heidelbeeren'], 'Mango': ['Ananas', 'Pfirsich, Nektarine'], 'Ananas': ['Mango'],
  'Pfirsich, Nektarine': ['Mango', 'Apfel'], 'Kiwi': ['Orange', 'Mango'], 'Orange': ['Mandarine, Clementine', 'Kiwi'], 'Mandarine, Clementine': ['Orange'],
  'Weintrauben': ['Apfel'], 'Datteln, getrocknet': ['Rosinen'], 'Rosinen': ['Datteln, getrocknet'], 'Avocado': ['Hummus'],
  'Brokkoli': ['Blumenkohl', 'Grüne Bohnen', 'Zucchini'], 'Blumenkohl': ['Brokkoli'], 'Paprika': ['Zucchini', 'Tomate'], 'Tomate': ['Paprika', 'Gurke'],
  'Gurke': ['Tomate', 'Paprika', 'Kohlrabi'], 'Karotte (Möhre)': ['Kohlrabi', 'Paprika'], 'Zucchini': ['Aubergine', 'Paprika', 'Brokkoli'], 'Aubergine': ['Zucchini'],
  'Spinat': ['Grünkohl', 'Pak Choi, Chinakohl'], 'Blattsalat (Kopfsalat, Eisberg, Feldsalat)': ['Rucola', 'Spinat'], 'Rucola': ['Blattsalat (Kopfsalat, Eisberg, Feldsalat)', 'Spinat'],
  'Zwiebel': ['Frühlingszwiebeln', 'Lauch (Porree)'], 'Frühlingszwiebeln': ['Zwiebel', 'Lauch (Porree)'], 'Lauch (Porree)': ['Zwiebel', 'Frühlingszwiebeln'],
  'Champignons': ['Zucchini', 'Paprika'], 'Mais (Dose, abgetropft)': ['Erbsen (TK)', 'Paprika'], 'Erbsen (TK)': ['Edamame (TK)', 'Grüne Bohnen', 'Mais (Dose, abgetropft)'],
  'Grüne Bohnen': ['Brokkoli', 'Erbsen (TK)'], 'Kohlrabi': ['Zucchini', 'Karotte (Möhre)'], 'Rosenkohl': ['Brokkoli', 'Grüne Bohnen'], 'Weißkohl, Rotkohl': ['Pak Choi, Chinakohl'],
  'Sauerkraut': ['Weißkohl, Rotkohl'], 'Spargel': ['Grüne Bohnen', 'Brokkoli'], 'Rote Bete, gekocht': ['Karotte (Möhre)'], 'Kürbis (Hokkaido)': ['Süßkartoffel', 'Karotte (Möhre)'],
  'Gemüsemischung (TK)': ['Brokkoli', 'Paprika', 'Zucchini'], 'Pak Choi, Chinakohl': ['Spinat', 'Brokkoli', 'Weißkohl, Rotkohl'], 'Staudensellerie': ['Karotte (Möhre)', 'Lauch (Porree)'],
  'Fenchel': ['Staudensellerie', 'Zucchini'], 'Grünkohl': ['Spinat', 'Weißkohl, Rotkohl'], 'Gewürzgurken': ['Gurke'],
  [MG_OIL]: ['Butter'], 'Butter': [MG_OIL, 'Margarine'], 'Margarine': ['Butter', MG_OIL],
  'Passierte Tomaten (Passata)': ['Tomatensoße, fertig', 'Tomate'], 'Tomatensoße, fertig': ['Passierte Tomaten (Passata)'], 'Tomatenmark': ['Passierte Tomaten (Passata)'],
  'Honig': ['Ahornsirup'], 'Ahornsirup': ['Honig'], 'Marmelade, Konfitüre': ['Honig'], 'Erdnussbutter': ['Tahin (Sesammus)'], 'Tahin (Sesammus)': ['Erdnussbutter'],
  'Mandeln': ['Walnüsse', 'Haselnüsse', 'Kürbiskerne'], 'Walnüsse': ['Mandeln', 'Haselnüsse'], 'Haselnüsse': ['Mandeln', 'Walnüsse'], 'Cashewkerne': ['Erdnüsse, geröstet', 'Mandeln'],
  'Erdnüsse, geröstet': ['Cashewkerne', 'Mandeln'], 'Kürbiskerne': ['Sonnenblumenkerne'], 'Sonnenblumenkerne': ['Kürbiskerne'], 'Chiasamen': ['Leinsamen'], 'Leinsamen': ['Chiasamen'],
  'Zartbitterschokolade 70 %': ['Vollmilchschokolade'], 'Kartoffelpüree, mit Milch': ['Kartoffeln, gekocht', 'Süßkartoffel'], 'Weizenmehl': ['Haferflocken'],
  'Proteinriegel': ['Proteinpudding'], 'Kokosraspeln': ['Mandeln'], 'Apfelmus, ungesüßt': ['Apfel'], 'Barbecue-Soße': ['Ketchup'], 'Ketchup': ['Barbecue-Soße'], 'Mayonnaise': ['Joghurt natur 1,5 %', 'Saure Sahne 10 %'],
};
// Stückware: Gramm je Stück (Mengen werden auf ganze Stück gerundet)
const MG_UNIT = { 'Ei': 60, 'Wrap (Weizentortilla)': 60, 'Reiswaffel': 8, 'Brötchen (Weizen)': 55, 'Vollkornbrötchen': 60, 'Knäckebrot': 10, 'Vollkorntoast': 25,
  'Toastbrot (Weizen)': 25, 'Falafel': 20, 'Proteinriegel': 55 };
// Höchstmengen je Mahlzeit, wenn das Rezept keine eigene angibt (z. B. höchstens 500 g Kartoffeln)
const MG_MAX = { 'Kartoffeln, gekocht': 500, 'Süßkartoffel': 500, 'Gnocchi': 450, 'Reis, roh': 170, 'Vollkornreis, roh': 170, 'Nudeln, roh': 170, 'Vollkornnudeln, roh': 170,
  'Linsennudeln, roh': 170, 'Mie-Nudeln, roh': 150, 'Reisnudeln, roh': 150, 'Quinoa, roh': 150, 'Bulgur, roh': 150, 'Couscous, roh': 150, 'Hirse, roh': 130,
  'Buchweizen, roh': 130, 'Polenta (Maisgrieß), roh': 130, 'Grieß, roh': 120, 'Haferflocken': 130, 'Müsli, ohne Zuckerzusatz': 130, 'Vollkornbrot': 200, 'Mischbrot': 200,
  'Vollkorntoast': 150, 'Eiweißbrot (Proteinbrot)': 200, 'Vollkornbrötchen': 180, 'Brötchen (Weizen)': 165, 'Wrap (Weizentortilla)': 180, 'Fladenbrot': 200, 'Baguette': 200,
  'Reiswaffel': 64, 'Knäckebrot': 60, 'Banane': 250, 'Mango': 350, 'Apfel': 300, 'Mandarine, Clementine': 300, 'Honig': 30, 'Ahornsirup': 30, 'Datteln, getrocknet': 50,
  'Rosinen': 40, 'Kidneybohnen (Dose, abgetropft)': 300, 'Kichererbsen (Dose, abgetropft)': 300, 'Weiße Bohnen (Dose, abgetropft)': 300, 'Schwarze Bohnen (Dose, abgetropft)': 300,
  'Proteinpulver (Whey)': 60, 'Proteinpulver, vegan': 60, 'Ei': 300, 'Eiklar': 300, [MG_OIL]: 30, 'Butter': 30, 'Erdnussbutter': 40, 'Tahin (Sesammus)': 40, 'Mandeln': 40,
  'Walnüsse': 40, 'Cashewkerne': 40, 'Erdnüsse, geröstet': 40, 'Kürbiskerne': 40, 'Avocado': 150, 'Pesto (Basilikum)': 40, 'Feta (Schafskäse)': 80, 'Halloumi': 150,
  'Parmesan': 30, 'Chiasamen': 40, 'Hummus': 120, 'Kokosmilch (light)': 300, 'Kochsahne 15 %': 150, 'Frischkäse leicht': 80, 'Zartbitterschokolade 70 %': 25 };

function mgPrefs() {
  const p = data.mealPrefs || {};
  return { diet: MG_DIET_X[p.diet] != null ? p.diet : 'all', no: Array.isArray(p.no) ? p.no : [], ban: Array.isArray(p.ban) ? p.ban : [],
    fav: Array.isArray(p.fav) ? p.fav : [], repl: p.repl && typeof p.repl === 'object' ? p.repl : {} };
}
const mgPrefSig = () => { const p = mgPrefs(); return `${p.diet}|${p.no.join('')}|${p.ban.join(',')}|${JSON.stringify(p.repl)}`; };
const mgX = () => { const p = mgPrefs(); return MG_DIET_X[p.diet] + p.no.join(''); };
const mgOk = (name, x) => !!mgFood(name) && ![...(MG_TAG[name] || '')].some(t => x.includes(t));
// v339: Zutat durch eine andere ersetzen und die Menge umrechnen (Eiweißquellen nach Eiweiß, sonst nach Kalorien; Gemüse bleibt gleich)
function mgConv(it, to) {
  const a = mgFood(it.n), b = mgFood(to);
  let f = 1;
  if (a && b) {
    const [ka, pa] = a.per, [kb, pb] = b.per;
    if (it.role === 'P' && pa > 0 && pb > 0) f = pa / pb;
    else if ((it.role !== 'X' || ka > 100 || kb > 100) && ka > 0 && kb > 0) f = ka / kb;
  }
  f = Math.min(2.5, Math.max(0.4, f));
  const unit = MG_UNIT[to] || 0, g0 = it.g * f;
  return { n: to, g: unit ? Math.max(1, Math.round(g0 / unit)) * unit : Math.round(g0), role: it.role, unit,
    max: MG_MAX[to] || (it.max ? Math.round(it.max * f) : 0), sub: it.sub || it.n };
}
// Zutat als Objekt, falls nötig ersetzt (sub = ursprüngliche Zutat); null = passt nicht und kein Ersatz.
// Reihenfolge: passt die Zutat nicht zu den Vorlieben, kommt der Ersatz aus MG_SUB; danach „Immer ersetzen“ (mealPrefs.repl).
function mgResolve([n, g, role, unit, max], x) {
  let res = { n, g, role, unit: unit || MG_UNIT[n] || 0, max: max || MG_MAX[n] || 0, sub: null };
  if (!mgOk(n, x)) {
    const alt = (MG_SUB[n] || []).find(a => mgOk(a, x));
    if (!alt) return null;
    res = mgConv(res, alt);
  }
  const rp = mgPrefs().repl[res.n];
  if (rp && rp !== res.n && mgOk(rp, x)) res = { ...mgConv(res, rp), sub: res.sub || res.n };
  return res;
}
const mgItemCache = new Map();
// Zutaten eines Gerichts nach den Vorlieben; null = Gericht passt nicht (oder soll nicht mehr vorgeschlagen werden)
function mgItems(r) {
  const sig = mgPrefSig() + '|' + r.id;
  if (mgItemCache.has(sig)) return mgItemCache.get(sig);
  const x = mgX();
  let out = mgPrefs().ban.includes(r.id) ? null : [];
  if (out) for (const it of r.items) { const res = mgResolve(it, x); if (!res) { out = null; break; } out.push(res); }
  mgItemCache.set(sig, out);
  return out;
}
const mgAllowed = cat => MG_RECIPES.filter(r => r.cat === cat && mgItems(r));
const mgFills = () => { const x = mgX(); return MG_FILL.map(it => mgResolve(it, x)).filter(Boolean); };

const mgCat = k => k === 'b' ? 'b' : ['s', 's1', 'late'].includes(k) ? 's' : 'm';
const mgActive = () => !!(data.mealPlan && data.mealPlan.picks) && !(typeof nutPlanActive === 'function' && nutPlanActive());
const mgWd = date => (new Date(date + 'T12:00:00').getDay() + 6) % 7;  // Mo = 0
const mgFood = name => FOOD_BASE_MAP.get('b:' + name);
let mgDraft = null;     // Vorschlag, noch nicht übernommen: { picks, alt }
let mgSel = null;       // ausgewählter Tag in der Ansicht (Datum)
let mgPrefsOpen = null; // Karte „Vorlieben“ aufgeklappt (null = beim Vorschlag offen, sonst zu)
let mgAltOpen = null;   // aufgeklappte Alternativen: 'Mahlzeit|Zutat'
let mgFavOpen = false;  // Auswahl der Lieblingszutaten aufgeklappt
const mgSwapSeen = {};  // schon gezeigte Gerichte beim Tauschen je 'Wochentag|Mahlzeit' (nur in dieser Sitzung)
const mgPlanObj = () => mgDraft || data.mealPlan || null;
const mgPicks = () => (mgPlanObj() || {}).picks || null;
// Alternativen für einen Tag: { Mahlzeit: { Zutat: stattdessen } } (v339, „Gerade nicht da?“)
const mgDayAlt = date => { const p = mgPlanObj(); return (p && p.alt && p.alt[date]) || null; };

function mgShuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
// v339: Lieblingszutaten. Gerichte mit einer (oder mehr) davon kommen öfter vor.
const mgFavN = r => { const fav = mgPrefs().fav, its = mgItems(r) || []; return fav.length ? new Set(its.flatMap(i => [i.n, i.sub]).filter(n => n && fav.includes(n))).size : 0; };
const mgWeight = r => 1 + 3 * Math.min(2, mgFavN(r));
// zufällige Reihenfolge, Gerichte mit Lieblingszutaten eher vorne
const mgWOrder = list => list.map(r => ({ r, key: -Math.log(1 - Math.random()) / mgWeight(r) })).sort((a, b) => a.key - b.key).map(x => x.r);

// Gerichte für alle 7 Wochentage: aufeinanderfolgende Tage und Mahlzeiten am selben Tag möglichst verschieden
// (am selben Tag auch keine zwei Varianten desselben Gerichts, z. B. zweimal Geschnetzeltes)
function mgMakePicks() {
  const keys = mealKeys(), lists = {}, pos = {};
  for (const c of ['b', 'm', 's']) { lists[c] = mgWOrder(mgAllowed(c)).map(r => r.id); pos[c] = 0; }
  const picks = {};
  for (let wd = 0; wd < 7; wd++) {
    picks[wd] = {};
    const fams = [];
    for (const k of keys) {
      const c = mgCat(k), L = lists[c];
      if (!L.length) { picks[wd][k] = null; continue; }
      let t = 0;
      for (; t < L.length; t++) { const f = MG_BY_ID.get(L[(pos[c] + t) % L.length]).fam; if (!f || !fams.includes(f)) break; }
      if (t >= L.length) t = 0;
      const i = pos[c] % L.length, j = (pos[c] + t) % L.length;
      [L[i], L[j]] = [L[j], L[i]];
      const id = L[i];
      pos[c]++;
      picks[wd][k] = id;
      if (MG_BY_ID.get(id).fam) fams.push(MG_BY_ID.get(id).fam);
    }
  }
  return picks;
}

const mgValid = (id, k) => { const r = id && MG_BY_ID.get(id); return r && r.cat === mgCat(k) && mgItems(r) ? r : null; };
// Nach geänderten Vorlieben: nur die Gerichte ersetzen, die nicht mehr passen (selten genutzte zuerst, nicht doppelt am Tag)
function mgRepair(picks) {
  const keys = mealKeys(), use = {};
  for (let wd = 0; wd < 7; wd++) for (const k of keys) { const id = picks[wd] && picks[wd][k]; if (mgValid(id, k)) use[id] = (use[id] || 0) + 1; }
  for (let wd = 0; wd < 7; wd++) {
    picks[wd] = { ...(picks[wd] || {}) };
    const day = keys.map(k => mgValid(picks[wd][k], k) ? picks[wd][k] : null);
    keys.forEach((k, ki) => {
      if (day[ki]) return;
      const prev = picks[(wd + 6) % 7] && picks[(wd + 6) % 7][k];
      const list = mgAllowed(mgCat(k));
      const fams = day.filter(Boolean).map(id => MG_BY_ID.get(id).fam).filter(Boolean);
      let cand = list.filter(r => !day.includes(r.id) && r.id !== prev && !(r.fam && fams.includes(r.fam)));
      if (!cand.length) cand = list.filter(r => !day.includes(r.id));
      if (!cand.length) cand = list;
      const min = Math.min(...cand.map(r => use[r.id] || 0));
      const best = mgWOrder(cand.filter(r => (use[r.id] || 0) === min))[0];
      picks[wd][k] = best ? best.id : null;
      if (best) { day[ki] = best.id; use[best.id] = (use[best.id] || 0) + 1; }
    });
  }
  return picks;
}

// Gericht an einem Wochentag; fehlt eins oder passt es nicht mehr, nimmt die App ein passendes der Reihe nach (null = keins passt)
function mgPick(picks, wd, k) {
  const r = mgValid(picks && picks[wd] && picks[wd][k], k);
  if (r) return r;
  const list = mgAllowed(mgCat(k));
  return list.length ? list[(wd * 3 + mealKeys().indexOf(k)) % list.length] : null;
}

// Nährwerte einer Zutat bei g Gramm: [kcal, p, c, f]
const mgVal = (name, g) => { const f = mgFood(name); return f ? f.per.slice(0, 4).map(v => (v || 0) * g / 100) : [0, 0, 0, 0]; };
const mgKcalOf = its => its.reduce((s, i) => s + mgVal(i.n, i.g)[0], 0);

/* Mengen für einen Tag: Für jede Mahlzeit und Rolle (P, C, F) ein Faktor auf die Grundmenge. Gesucht sind Faktoren, mit denen
   der Tag Kalorien und Eiweiß möglichst genau trifft (Kohlenhydrate und Fett etwas weniger streng) und jede Mahlzeit grob
   ihren Anteil bekommt. Gelöst als kleines Ausgleichsproblem mit Grenzen (Koordinatenabstieg).
   slots: [{ k, r, its }], T: { kcal, protein, carbs, fat }, fills: Ergänzungen (aufgelöste Zutaten) */
function mgSolve(slots, T, fills, pLo = MG_BOUNDS.P[0]) {
  const rows = [];  // { t: Zielwert, w: Gewicht, a: Map(var → Beitrag), b: fester Beitrag }
  const tg = [T.kcal, T.protein, T.carbs, T.fat];
  const vars = [];
  const day = [0, 1, 2, 3].map(i => ({ t: Math.max(tg[i], 10), w: [10, 6, 1, 1][i], a: new Map(), b: 0 }));
  day[1].wOver = MG_P_OVER_W;  // mehr Eiweiß als das Ziel ist kaum ein Fehler
  const shareSum = slots.reduce((s, x) => s + MG_SHARE[mgCat(x.k)], 0);
  slots.forEach((sl, si) => {
    const want = T.kcal * MG_SHARE[mgCat(sl.k)] / shareSum;
    const base = Math.max(1, mgKcalOf(sl.its));
    sl.want = want;
    sl.xs = Math.min(1.6, Math.max(0.7, want / base));  // Gemüse und Obst wachsen etwas mit
    const meal = { t: Math.max(want, 50), w: 0.6, a: new Map(), b: 0 };
    for (const role of ['P', 'C', 'F']) {
      const its = sl.its.filter(i => i.role === role);
      if (!its.length) continue;
      const v = [0, 0, 0, 0];
      its.forEach(i => mgVal(i.n, i.g).forEach((x, n) => { v[n] += x; }));
      const j = vars.length;
      let lo = MG_BOUNDS[role][0];
      if (role === 'P' && mgCat(sl.k) !== 's') lo = pLo;
      const oil = role === 'F' && its.find(i => i.n === MG_OIL);
      if (oil) lo = Math.max(lo, Math.min(0.8, 5 / oil.g));
      const z = Math.min(MG_BOUNDS[role][1], Math.max(lo, want / base));  // Größe der ganzen Mahlzeit
      const hi = Math.min(MG_BOUNDS[role][1], ...its.map(i => i.max ? i.max / i.g : Infinity));  // z. B. höchstens 500 g Kartoffeln
      vars.push({ si, role, s: Math.min(z, hi), z: Math.min(z, hi), lo: Math.min(lo, hi), hi });
      v.forEach((x, n) => day[n].a.set(j, x));
      meal.a.set(j, v[0]);
    }
    const fix = [0, 0, 0, 0];
    sl.its.filter(i => i.role === 'X').forEach(i => mgVal(i.n, i.g * sl.xs).forEach((x, n) => { fix[n] += x; }));
    fix.forEach((x, n) => { day[n].b += x; });
    meal.b = fix[0];
    rows.push(meal);
  });
  // Ergänzungen beim Snack (sonst bei der letzten Mahlzeit), nur wenn die Gerichte allein das Ziel nicht erreichen
  const sIdx = slots.map(x => mgCat(x.k)).lastIndexOf('s');
  const fillSi = sIdx >= 0 ? sIdx : slots.length - 1;
  fills.forEach((it, fi) => {
    const j = vars.length;
    vars.push({ si: fillSi, role: 'E' + fi, s: 0, z: 0, lo: 0, hi: it.max / it.g, lam: it.role === 'P' ? 0.04 : 0.004 });  // Pulver nur, wenn es wirklich fehlt
    mgVal(it.n, it.g).forEach((x, n) => day[n].a.set(j, x));
  });
  rows.push(...day);
  // relativ zum Ziel rechnen, damit kcal und Gramm vergleichbar sind
  const R = rows.map(r => ({ w: r.w, wo: r.wOver, a: new Map([...r.a].map(([j, x]) => [j, x / r.t])), b: r.b / r.t }));
  const res = R.map(r => r.b + [...r.a].reduce((s, [j, x]) => s + x * vars[j].s, 0) - 1);
  const lam = 0.05;  // hält das Verhältnis der Zutaten nahe am Rezept
  for (let it = 0; it < 300; it++) {
    for (let j = 0; j < vars.length; j++) {
      const l = vars[j].lam || lam;
      let num = l * vars[j].z, den = l;  // zieht zur gleichmäßigen Vergrößerung des ganzen Gerichts (Ergänzungen: zu null)
      R.forEach((r, i) => { const a = r.a.get(j); if (!a) return; const w = r.wo != null && res[i] > 0 ? r.wo : r.w; num += w * a * (a * vars[j].s - res[i]); den += w * a * a; });
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
const mgLine = (name, g, extra) => {
  const v = mgVal(name, g);
  return { key: 'b:' + name, name, g, kcal: Math.round(v[0]), p: round1(v[1]), c: round1(v[2]), f: round1(v[3]), ...extra };
};

// Untergrenze für Eiweißquellen (Anteil der Rezeptmenge): bei 2400 kcal genau die Rezeptmenge, darunter bis 0,8, darüber bis 1,2.
// Ist an dem Tag schon viel eingetragen (wenig übrig), entsprechend kleiner.
function mgPLo(goal, T, keys, open) {
  let lo = Math.min(1.2, Math.max(0.8, goal.kcal / 2400));
  if (open.length < keys.length) {
    const sh = ks => ks.reduce((a, k) => a + MG_SHARE[mgCat(k)], 0);
    const ratio = T.kcal / Math.max(1, goal.kcal * sh(open) / sh(keys));
    if (ratio < 1) lo *= Math.max(0.5, ratio);
  }
  return lo;
}
const mgCache = new Map();
/* Plan eines Tages im Format von nutPlanDay (meals: { k: [{ key, name, g, kcal, p, c, f }] }) plus Gerichte und Summen.
   live: schon Eingetragenes berücksichtigen (Tagebuch, Planansicht). Dann fehlen die eingetragenen Mahlzeiten in meals,
   die übrigen sind auf den Rest des Tagesziels gerechnet; eaten = { keys, kcal, p, c, f, left } */
function mgDay(date = todayISO(), picks = mgPicks(), live = false) {
  if (!picks || typeof foodGoal !== 'function') return null;
  const goal = foodGoal(date);
  if (!goal || !goal.kcal) return null;
  const wd = mgWd(date), keys = mealKeys();
  let T = goal, open = keys, eaten = null;
  if (live) {
    const log = foodOn(date).filter(e => e.key !== FOOD_FILL);
    const done = keys.filter(k => log.some(e => e.meal === k));
    if (log.length && done.length < keys.length) {
      const t = foodTotals(log);
      T = { kcal: Math.max(0, goal.kcal - t.kcal), protein: Math.max(0, goal.protein - t.p), carbs: Math.max(0, goal.carbs - t.c), fat: Math.max(0, goal.fat - t.f) };
      eaten = { keys: done, kcal: t.kcal, p: t.p, c: t.c, f: t.f, left: T.kcal };
      open = keys.filter(k => !done.includes(k));
    }
  }
  const alt = mgDayAlt(date) || {};
  const sig = JSON.stringify([wd, keys, open, keys.map(k => (mgPick(picks, wd, k) || {}).id), mgPrefSig(), T.kcal, T.protein, T.carbs, T.fat, eaten && Math.round(eaten.kcal), unitLb(), alt]);
  if (mgCache.has(sig)) return mgCache.get(sig);
  const x = mgX();
  // „Gerade nicht da?“: für diesen Tag gewählte Alternativen einsetzen (dayAlt = an diesem Tag ersetzt)
  const slots = open.map(k => ({ k, r: mgPick(picks, wd, k) })).filter(s => s.r).map(s => ({ ...s,
    its: mgItems(s.r).map(i => { const a = alt[s.k] && alt[s.k][i.n]; return a && a !== i.n && mgOk(a, x) ? { ...mgConv(i, a), sub: i.n, dayAlt: true } : i; }) }));
  const fills = mgFills();
  const solved = slots.length ? mgSolve(slots, T, fills, mgPLo(goal, T, keys, open)) : [];
  const meals = {}, recipes = {}, tot = eaten ? [eaten.kcal, eaten.p, eaten.c, eaten.f] : [0, 0, 0, 0];
  for (const k of keys) recipes[k] = mgPick(picks, wd, k);
  for (const sl of solved) {
    meals[sl.k] = sl.its.map(i => mgLine(i.n, mgRound(i.g * (i.role === 'X' ? sl.xs : sl.f[i.role] != null ? sl.f[i.role] : 1), i.unit),
      { unit: i.unit || null, sub: i.sub, dayAlt: i.dayAlt || false })).filter(i => i.g >= 2);
    fills.forEach((it, fi) => {
      const s = sl.f['E' + fi];
      if (!(s > 0) || it.g * s < (it.unit || 15)) return;  // Kleinstmengen weglassen
      const g = mgRound(it.g * s, it.unit);
      const has = meals[sl.k].find(i => i.name === it.n);  // steckt schon im Gericht: Menge dort erhöhen
      if (has) Object.assign(has, mgLine(it.n, has.g + g, { unit: has.unit, sub: has.sub }));
      else meals[sl.k].push(mgLine(it.n, g, { unit: it.unit || null, sub: it.sub, extra: true }));
    });
    meals[sl.k].forEach(i => { tot[0] += i.kcal; tot[1] += i.p; tot[2] += i.c; tot[3] += i.f; });
  }
  const out = { label: 'Ernährungsplan', meals, recipes, goal, eaten, kcal: Math.round(tot[0]), p: Math.round(tot[1]), c: Math.round(tot[2]), f: Math.round(tot[3]) };
  if (mgCache.size > 80) mgCache.clear();
  mgCache.set(sig, out);
  return out;
}

/* ----- Ansicht ----- */

function mgDays(start = todayISO()) { return Array.from({ length: 7 }, (_, i) => addDaysISO(start, i)); }
const mgDayShort = d => d === todayISO() ? 'Heute' : new Date(d + 'T12:00:00').toLocaleDateString(LOCALE(), { weekday: 'short' }).replace('.', '');

// Kurzname einer Zutat für Knöpfe (Lieblingszutaten, Alternativen)
const MG_SHORT = { [MG_OIL]: 'Öl', 'Blattsalat (Kopfsalat, Eisberg, Feldsalat)': 'Blattsalat', 'Rinderhackfleisch mager (5 % Fett), roh': 'Rinderhack mager',
  'Rinderhackfleisch (20 % Fett), roh': 'Rinderhack', 'Rindersteak (Hüfte, Rumpsteak), roh': 'Rindersteak', 'Rindfleisch mager (Gulasch, Schulter), roh': 'Rindfleisch (Gulasch)',
  'Lammfleisch mager (Keule, Schulter), roh': 'Lammfleisch', 'Hüttenkäse (körniger Frischkäse)': 'Hüttenkäse', 'Thunfisch im eigenen Saft (abgetropft)': 'Thunfisch',
  'Thunfisch in Öl (abgetropft)': 'Thunfisch in Öl', 'Pak Choi, Chinakohl': 'Pak Choi', 'Mandarine, Clementine': 'Clementinen', 'Weißkohl, Rotkohl': 'Weißkohl',
  'Pfirsich, Nektarine': 'Pfirsich', 'Feta (Schafskäse)': 'Feta', 'Eiweißbrot (Proteinbrot)': 'Eiweißbrot', 'Bresaola (Rinderschinken)': 'Bresaola',
  'Beef Jerky (Trockenfleisch)': 'Beef Jerky', 'Tahin (Sesammus)': 'Tahin', 'Polenta (Maisgrieß), roh': 'Polenta', 'Wrap (Weizentortilla)': 'Wraps', 'Pesto (Basilikum)': 'Pesto',
  'Passierte Tomaten (Passata)': 'Passata', 'Müsli, ohne Zuckerzusatz': 'Müsli', 'Kartoffeln, gekocht': 'Kartoffeln', 'Karotte (Möhre)': 'Karotten', 'Lauch (Porree)': 'Lauch',
  'Gemüsemischung (TK)': 'Gemüsemischung', 'Knuspermüsli (Crunchy)': 'Knuspermüsli', 'Brötchen (Weizen)': 'Brötchen', 'Toastbrot (Weizen)': 'Toastbrot',
  'Kokosmilch (light)': 'Kokosmilch', 'Kakaopulver (ungesüßt)': 'Kakao', 'Sojadrink, ungesüßt': 'Sojadrink', 'Hähnchenschenkel ohne Haut, roh': 'Hähnchenschenkel',
  'Frischkäse natur (Doppelrahm)': 'Frischkäse', 'Hähnchenbrust, gebraten': 'Hähnchenbrust (gebraten)', 'Linsen, gekocht': 'Linsen (gekocht)', 'Rote Bete, gekocht': 'Rote Bete',
  'Kürbis (Hokkaido)': 'Kürbis', 'Frühstücksspeck (Bacon)': 'Bacon', 'Erdnüsse, geröstet': 'Erdnüsse', 'Datteln, getrocknet': 'Datteln', 'Apfelmus, ungesüßt': 'Apfelmus',
  'Proteinpulver (Whey)': 'Whey', 'Proteinpulver, vegan': 'Veganes Proteinpulver', 'Zartbitterschokolade 70 %': 'Zartbitterschokolade', 'Griechischer Joghurt 10 %': 'Griechischer Joghurt' };
const mgShort = n => MG_SHORT[n] || n.replace(/, (roh|trocken)$/, '').replace(/ \((Dose, abgetropft|TK)\)$/, '');

// Lieblingszutaten zur Auswahl: Zutaten, die in mindestens 3 Gerichten als Eiweiß-, Kohlenhydrat- oder Fettquelle vorkommen
const MG_FAV_SKIP = [MG_OIL, 'Honig', 'Ahornsirup'];  // nur zum Würzen/Süßen, keine echte Quelle
let mgFavCache = null;
function mgFavGroups() {
  if (mgFavCache) return mgFavCache;
  const cnt = {};
  for (const r of MG_RECIPES) for (const [n, , role] of r.items) if ('PCF'.includes(role) && !MG_FAV_SKIP.includes(n)) { const c = cnt[n] = cnt[n] || { P: 0, C: 0, F: 0 }; c[role]++; }
  const out = { P: [], C: [], F: [] };
  for (const [n, c] of Object.entries(cnt)) {
    const tot = c.P + c.C + c.F, role = ['P', 'C', 'F'].sort((a, b) => c[b] - c[a])[0];
    if (tot >= 3) out[role].push(n);
  }
  return (mgFavCache = out);
}
const MG_FAV_L = [['P', 'Eiweißquellen'], ['C', 'Kohlenhydratquellen'], ['F', 'Fettquellen']];

function mgPrefsCard() {
  const p = mgPrefs(), open = mgPrefsOpen == null ? !!mgDraft : mgPrefsOpen, x = mgX();
  const sum = [MG_DIETS.find(y => y[0] === p.diet)[1], ...MG_NO.filter(([k]) => p.no.includes(k)).map(([, l]) => 'ohne ' + l)];
  const favs = p.fav.filter(n => mgOk(n, x));
  if (favs.length) sum.push(favs.length === 1 ? '1 Lieblingszutat' : `${favs.length} Lieblingszutaten`);
  if (p.ban.length) sum.push(p.ban.length === 1 ? '1 Gericht ausgeschlossen' : `${p.ban.length} Gerichte ausgeschlossen`);
  let h = `<div class="card mg-prefs">
      <button class="mg-prefs-head" data-action="mg-prefs-toggle" aria-expanded="${open}"><b>⚙️ Vorlieben</b><span class="hint">${sum.join(' | ')}</span><span class="chev">${open ? '▴' : '▾'}</span></button>`;
  if (!open) return h + '</div>';
  const n = c => mgAllowed(c).length, fg = mgFavGroups();
  const sortL = a => a.slice().sort((u, v) => tr(mgShort(u)).localeCompare(tr(mgShort(v)), LOCALE()));
  h += `<p class="lbl mg-lbl">Ernährungsweise</p>
      <div class="variants">${MG_DIETS.map(([k, l]) => `<button class="vchip ${p.diet === k ? 'on' : ''}" data-action="mg-diet" data-k="${k}">${l}</button>`).join('')}</div>
      <p class="lbl mg-lbl">Ohne</p>
      <div class="variants mg-no">${MG_NO.filter(([k]) => !MG_DIET_X[p.diet].includes(k)).map(([k, l]) => `<button class="vchip ${p.no.includes(k) ? 'on' : ''}" data-action="mg-no" data-k="${k}">${l}</button>`).join('')}</div>
      <button class="mg-sub-head" data-action="mg-fav-toggle" aria-expanded="${mgFavOpen}"><span class="lbl">Lieblingszutaten</span>
        <span class="hint">${favs.length ? favs.map(m => esc(tr(mgShort(m)))).join(', ') : 'keine'}</span><span class="chev">${mgFavOpen ? '▴' : '▾'}</span></button>
      <p class="hint nut-small">Gerichte mit deinen Lieblingszutaten kommen öfter vor.${mgDraft ? '' : ' Das gilt für neu zusammengestellte und getauschte Gerichte.'}</p>
      ${!mgFavOpen ? '' : MG_FAV_L.map(([r, l]) => `<p class="hint nut-small mg-fav-l">${l}</p>
      <div class="variants mg-fav">${sortL(fg[r].filter(m => mgOk(m, x))).map(m => `<button class="vchip ${p.fav.includes(m) ? 'on' : ''}" data-action="mg-fav" data-n="${esc(m)}" aria-pressed="${p.fav.includes(m)}">${esc(mgShort(m))}</button>`).join('')}</div>`).join('')}`;
  const repl = Object.entries(p.repl);
  if (repl.length) h += `<p class="lbl mg-lbl">Immer ersetzen</p>
      <div class="mg-bans">${repl.map(([a, b]) => `<button class="vchip mg-ban-chip" data-action="mg-unrepl" data-n="${esc(a)}" aria-label="Nicht mehr ersetzen"><span>${esc(mgShort(b))} <small>statt ${esc(mgShort(a))}</small></span> ✕</button>`).join('')}</div>`;
  if (p.ban.length) h += `<p class="lbl mg-lbl">Nicht mehr vorschlagen</p>
      <div class="mg-bans">${p.ban.filter(id => MG_BY_ID.has(id)).map(id => `<button class="vchip mg-ban-chip" data-action="mg-unban" data-id="${id}" aria-label="Wieder vorschlagen"><span>${esc(MG_BY_ID.get(id).name)}</span> ✕</button>`).join('')}</div>`;
  h += `<p class="hint nut-small">Passend: ${n('b')} Frühstücke, ${n('m')} Hauptgerichte, ${n('s')} Snacks</p>
      <p class="hint nut-small">Wo es geht, ersetzt die App einzelne Zutaten, z. B. Milch durch Sojadrink. Haferflocken zählen hier als glutenhaltig.
        Bei Allergien prüf die Zutaten bitte trotzdem selbst.</p>
    </div>`;
  return h;
}

// Zutatenzeile im Gericht, mit ⇄ für Alternativen („Gerade nicht da?“)
function mgItemLi(k, i, items) {
  const base = i.dayAlt ? i.sub : i.name, x = mgX(), have = items.map(j => j.name);
  const opts = i.extra ? [] : [...(i.dayAlt ? [base] : []), ...(MG_ALT[base] || [])]
    .filter((m, ix, a) => a.indexOf(m) === ix && m !== i.name && mgOk(m, x) && !have.includes(m));
  const open = opts.length && mgAltOpen === `${k}|${base}`;
  let h = `<li class="${i.dayAlt ? 'mg-swapped' : ''}"><span class="mg-g">${amtTxt(i.g)}</span><span class="mg-n"><span>${esc(i.name)}</span>${i.unit ? ` <small>(${Math.round(i.g / i.unit)} Stück)</small>` : ''}${i.sub ? ` <small>statt ${esc(i.sub)}</small>` : ''}${i.extra ? ' <small>zusätzlich</small>' : ''}</span>${opts.length ? `<button class="mg-alt-btn ${open ? 'on' : ''}" data-action="mg-alt" data-k="${k}" data-b="${esc(base)}" aria-expanded="${!!open}" aria-label="Alternativen">⇄</button>` : ''}</li>`;
  if (open) h += `<li class="mg-alt-panel"><p class="hint nut-small">${i.dayAlt ? 'Andere Zutat nehmen:' : 'Gerade nicht da? Nimm stattdessen:'}</p>
      <div class="variants">${opts.map(m => `<button class="vchip" data-action="mg-alt-set" data-k="${k}" data-b="${esc(base)}" data-n="${esc(m)}">${m === base ? '↺ ' : ''}${esc(mgShort(m))}</button>`).join('')}</div>
      ${i.dayAlt ? `<button class="btn mg-alt-pin" data-action="mg-alt-pin" data-b="${esc(base)}" data-n="${esc(i.name)}">📌 In allen Gerichten so ersetzen</button>` : ''}
      <p class="hint nut-small">Die Menge rechnet die App passend um. Das gilt nur für diese Mahlzeit an diesem Tag.</p></li>`;
  return h;
}

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
  const d = mgDay(mgSel, mgPicks(), true);
  let h = `<div class="card mg-head">
      <h2>🍽️ ${mgDraft ? 'Vorschlag für deinen Ernährungsplan' : 'Dein Ernährungsplan'}</h2>
      <p class="hint nut-small">Die Mengen richten sich jeden Tag nach deinem Tagesziel. Ändert sich dein Ziel, passt die App sie von selbst an.
        Gefällt dir ein Gericht nicht, tausch es mit „⇄ Anderes Gericht“. Fehlt dir eine Zutat, tipp in ihrer Zeile auf ⇄.</p>
      ${mgDraft ? `<button class="btn primary" data-action="mg-accept">✔ Plan übernehmen</button>
        <p class="hint nut-small">Danach steht im Ernährungstagebuch bei jeder Mahlzeit, was geplant ist, und du trägst sie mit „✔ Wie geplant“ ein.</p>`
        : '<button class="btn nav" data-action="mg-shop">🛒 Einkaufsliste<small>Alle Zutaten für die nächsten Tage zusammengerechnet</small></button>'}
    </div>
    ${mgPrefsCard()}
    <div class="mg-days" role="tablist">${days.map(x => `<button class="mg-day ${x === mgSel ? 'on' : ''}" data-action="mg-day" data-d="${x}" role="tab"
      aria-selected="${x === mgSel}"><span>${mgDayShort(x)}</span><small>${new Date(x + 'T12:00:00').getDate()}.</small></button>`).join('')}</div>`;
  if (!d) return h + '<div class="card"><p class="hint">Für diesen Tag gibt es kein Tagesziel, z. B. weil dein Ernährungsziel unterbrochen ist.</p></div>';
  const g = d.goal;
  const dev = (a, b) => Math.abs(a - b) <= Math.max(b * 0.06, 8) ? '' : ' off';
  const devP = (a, b) => a >= b - Math.max(b * 0.06, 8) && a <= b * 1.3 ? '' : ' off';  // etwas mehr Eiweiß ist in Ordnung
  h += `<div class="card mg-sum">
      <div class="nut-goal-row food-sum"><span>Kalorien<b class="${dev(d.kcal, g.kcal)}">${nutKcal(d.kcal)}</b></span><span>Eiweiß<b class="${devP(d.p, g.protein)}">${d.p} g</b></span>
        <span>Kohlenh.<b class="${dev(d.c, g.carbs)}">${d.c} g</b></span><span>Fett<b class="${dev(d.f, g.fat)}">${d.f} g</b></span></div>
      <p class="hint nut-small">Tagesziel: ${nutKcal(g.kcal)} kcal | Eiweiß ${g.protein} g | Kohlenhydrate ${g.carbs} g | Fett ${g.fat} g</p>
      ${d.eaten ? `<p class="hint nut-small mg-rest">Schon eingetragen: ${nutKcal(Math.round(d.eaten.kcal))} kcal. Die übrigen Mahlzeiten sind so angepasst, dass der Tag trotzdem zu deinem Ziel passt.${d.eaten.left < g.kcal * 0.12 ? ' Dein Ziel ist fast erreicht, darum sind die Portionen klein.' : ''}</p>` : ''}
    </div>`;
  for (const k of mealKeys()) {
    const r = d.recipes[k], items = d.meals[k] || [];
    const [icon, label] = mealInfo(k);
    if (d.eaten && d.eaten.keys.includes(k)) {
      const kc = foodTotals(foodOn(mgSel).filter(e => e.meal === k)).kcal;
      h += `<div class="card mg-meal mg-done"><div class="food-meal-head"><b>${icon} ${esc(label)}</b><span class="hint">${nutKcal(Math.round(kc))} kcal</span></div>
        <p class="hint nut-small">✔ Schon im Tagebuch eingetragen</p></div>`;
      continue;
    }
    if (!r) {
      h += `<div class="card mg-meal"><div class="food-meal-head"><b>${icon} ${esc(label)}</b></div>
        <p class="hint nut-small">Für deine Vorlieben gibt es hier kein passendes Gericht. Lockere sie unter „Vorlieben“ oder trag selbst etwas ein.</p></div>`;
      continue;
    }
    const kc = items.reduce((s, i) => s + i.kcal, 0);
    h += `<div class="card mg-meal">
        <div class="food-meal-head"><b>${icon} ${esc(label)}</b><span class="hint">${nutKcal(kc)} kcal</span></div>
        <h3 class="mg-title">${esc(r.name)}</h3>
        <ul class="mg-items">${items.map(i => mgItemLi(k, i, items)).join('')}</ul>
        <p class="hint nut-small mg-how">${esc(r.how)}</p>
        <div class="row mg-btns"><button class="btn mg-swap" data-action="mg-swap" data-k="${k}">⇄ Anderes Gericht</button>
          <button class="btn mg-ban" data-action="mg-ban" data-k="${k}">🚫 Nicht mehr vorschlagen</button></div>
      </div>`;
  }
  h += `<p class="hint nut-small explain">Die Nährwerte sind Durchschnittswerte aus der Grundliste. Kleine Abweichungen vom Tagesziel entstehen durch
    das Runden der Mengen. Fleisch, Fisch und andere Eiweißquellen bleiben in üblichen Portionen, darum liegt das Eiweiß oft etwas über
    deinem Ziel. Bei Unverträglichkeiten oder Allergien prüf die Zutaten bitte selbst.</p>`;
  if (mgDraft) h += `<button class="btn" data-action="mg-reroll">🔀 Neu zusammenstellen</button>
    <button class="btn center" data-action="mg-cancel">Abbrechen</button>`;
  else h += `<button class="btn" data-action="mg-reroll">🔀 Neu zusammenstellen</button>
    <button class="btn danger" data-action="mg-end">Plan beenden</button>`;
  return h;
}

views.mealplan = { title: 'Ernährungsplan', tab: 'nutrition', render: renderMealPlan,
  back: p => p.from === 'food' ? ['food', { date: p.date }] : ['nutrition', {}] };

/* ----- Einkaufsliste ----- */
const MG_GROUPS = [
  ['Obst und Gemüse', ['Heidelbeeren', 'Banane', 'Tomate', 'Gurke', 'Brokkoli', 'Paprika', 'Zwiebel', 'Süßkartoffel', 'Grüne Bohnen', 'Karotte (Möhre)',
    'Blattsalat (Kopfsalat, Eisberg, Feldsalat)', 'Champignons', 'Gemüsemischung (TK)', 'Spinat', 'Zucchini', 'Himbeeren', 'Apfel', 'Kartoffeln, gekocht', 'Mango',
    'Avocado', 'Rucola', 'Erdbeeren', 'Mandarine, Clementine', 'Erbsen (TK)', 'Mais (Dose, abgetropft)']],
  ['Fleisch und Fisch', ['Hähnchenbrust, roh', 'Putenbrust, roh', 'Rinderhackfleisch mager (5 % Fett), roh', 'Rindersteak (Hüfte, Rumpsteak), roh', 'Kochschinken',
    'Schweinefilet, roh', 'Putenbrust-Aufschnitt', 'Lachs, roh', 'Thunfisch im eigenen Saft (abgetropft)', 'Seelachs, roh', 'Kabeljau, roh', 'Garnelen, roh']],
  ['Milchprodukte, Eier und Drinks', ['Skyr natur', 'Milch 1,5 %', 'Magerquark', 'Frischkäse leicht', 'Joghurt natur 1,5 %', 'Parmesan', 'Feta (Schafskäse)',
    'Hüttenkäse (körniger Frischkäse)', 'Saure Sahne 10 %', 'Proteinpudding', 'Mozzarella light', 'Ei', 'Eiklar', 'Sojadrink, ungesüßt', 'Haferdrink']],
  ['Brot, Getreide und Beilagen', ['Haferflocken', 'Müsli, ohne Zuckerzusatz', 'Vollkornbrot', 'Reis, roh', 'Nudeln, roh', 'Vollkornnudeln, roh', 'Wrap (Weizentortilla)',
    'Quinoa, roh', 'Couscous, roh', 'Bulgur, roh', 'Hirse, roh', 'Reiswaffel']],
  ['Hülsenfrüchte, Tofu und Nüsse', ['Kidneybohnen (Dose, abgetropft)', 'Kichererbsen (Dose, abgetropft)', 'Linsen, roh', 'Tofu natur', 'Räuchertofu',
    'Sojaschnetzel, trocken', 'Edamame (TK)', 'Falafel', 'Hummus', 'Mandeln', 'Walnüsse', 'Kürbiskerne', 'Chiasamen', 'Erdnussbutter']],
  ['Vorrat und Sonstiges', []],
];
const MG_GROUP_OF = new Map(MG_GROUPS.flatMap(([l, ns], gi) => ns.map(n => [n, gi])));
// v339: alle übrigen Zutaten nach ihrem Abschnitt in der Grundliste (food.js): [erstes Lebensmittel des Abschnitts, Gruppe]
const MG_GROUP_SECT = [['Haferflocken', 3], ['Milch 3,5 %', 2], ['Hähnchenbrust, roh', 1], ['Linsen, roh', 4], ['Apfel', 0], [MG_OIL, 5], ['Orangensaft', 2],
  ['Proteinpulver (Whey)', 5], ['Wasser, Tee (ungesüßt)', 2], ['Haferbrei (Porridge) mit Milch', 5]];
let mgGroupIdx = null;
function mgGroupOf(name) {
  if (MG_GROUP_OF.has(name)) return MG_GROUP_OF.get(name);
  if (!mgGroupIdx) {
    mgGroupIdx = new Map();
    let g = MG_GROUPS.length - 1;
    const start = new Map(MG_GROUP_SECT);
    for (const [n] of FOOD_BASE) { if (start.has(n)) g = start.get(n); mgGroupIdx.set(n, g); }
  }
  return mgGroupIdx.has(name) ? mgGroupIdx.get(name) : MG_GROUPS.length - 1;
}
const MG_ML = new Set(['Milch 1,5 %', 'Milch 3,5 %', 'Sojadrink, ungesüßt', 'Haferdrink']);
const MG_PACK = { Dose: ['Dose', 'Dosen'], Becher: ['Becher', 'Becher'], Packung: ['Packung', 'Packungen'] };

const mgShop = () => { const s = (data.mealPlan && data.mealPlan.shop) || {}; return { n: [3, 5, 7].includes(s.n) ? s.n : 7, done: Array.isArray(s.done) ? s.done : [] }; };
// Summe aller Zutaten der nächsten n Tage (heute: nur was noch nicht eingetragen ist)
function mgShopList() {
  const shop = mgShop(), days = mgDays(todayISO()).slice(0, shop.n), agg = new Map();
  for (const date of days) {
    const d = mgDay(date, mgPicks(), true);
    if (!d) continue;
    for (const k of Object.keys(d.meals)) for (const i of d.meals[k]) {
      const a = agg.get(i.name) || { name: i.name, g: 0, unit: i.unit };
      a.g += i.g;
      agg.set(i.name, a);
    }
  }
  const groups = MG_GROUPS.map(([label]) => ({ label, items: [] }));
  for (const a of agg.values()) groups[mgGroupOf(a.name)].items.push(a);
  groups.forEach(gr => gr.items.sort((x, y) => tr(x.name).localeCompare(tr(y.name), LOCALE())));  // nach dem angezeigten Namen (auch Englisch)
  return { days, groups: groups.filter(gr => gr.items.length) };
}
// Menge zum Einkaufen: leicht aufgerundet, Stückware in Stück, Getränke in ml, dazu ungefähr Dosen, Becher, Packungen
function mgShopAmt(a) {
  if (a.unit) return { amt: `${Math.round(a.g / a.unit)} Stück`, pack: '' };
  const g = a.g < 100 ? Math.ceil(a.g / 5) * 5 : a.g < 1000 ? Math.ceil(a.g / 10) * 10 : Math.ceil(a.g / 50) * 50;
  let amt = unitLb() ? amtTxt(g) : g >= 1000 ? `${fmtNum(Math.round(g / 100) / 10)} ${MG_ML.has(a.name) ? 'l' : 'kg'}` : `${g} ${MG_ML.has(a.name) ? 'ml' : 'g'}`;
  const f = mgFood(a.name), m = f && f.portion && f.portion.label.match(/^1 (Dose|Becher|Packung)\b/);
  let pack = '';
  if (m) { const n = Math.max(1, Math.ceil(g / f.portion.g - 0.15)); pack = `≈ ${n} ${MG_PACK[m[1]][n === 1 ? 0 : 1]}`; }
  return { amt, pack };
}
const mgDateShort = d => new Date(d + 'T12:00:00').toLocaleDateString(LOCALE(), { weekday: 'short', day: 'numeric', month: 'numeric' });

function renderMealShop() {
  if (!mgActive()) return `<div class="card"><h2>🛒 Einkaufsliste</h2><p class="hint">Die Einkaufsliste gibt es, sobald du einen Ernährungsplan übernommen hast.</p>
    <button class="btn primary" data-action="mg-open">🍽️ Zum Ernährungsplan</button></div>`;
  const shop = mgShop(), { days, groups } = mgShopList();
  let h = `<div class="card mg-shop-head"><h2>🛒 Einkaufsliste</h2>
      <div class="variants">${[3, 5, 7].map(n => `<button class="vchip ${shop.n === n ? 'on' : ''}" data-action="mg-shop-n" data-n="${n}">${n} Tage</button>`).join('')}</div>
      <p class="mg-shop-range"><span>${mgDateShort(days[0])}</span> <span>bis</span> <span>${mgDateShort(days[days.length - 1])}</span></p>
      <p class="hint nut-small">Mengen zusammengerechnet und leicht aufgerundet, roh bzw. abgetropft wie im Plan. Was heute schon eingetragen ist, fehlt.
        Antippen hakt ab.</p></div>`;
  if (!groups.length) return h + '<div class="card"><p class="hint">Für diese Tage ist nichts geplant.</p></div>';
  for (const gr of groups) {
    h += `<div class="card mg-shop"><h3>${gr.label}</h3>${gr.items.map(a => {
      const { amt, pack } = mgShopAmt(a), done = shop.done.includes(a.name);
      return `<button class="mg-shop-row ${done ? 'done' : ''}" data-action="mg-shop-tick" data-n="${esc(a.name)}" aria-pressed="${done}">
        <span class="mg-check" aria-hidden="true">${done ? '✓' : ''}</span><span class="mg-shop-n">${esc(a.name)}</span>
        <span class="mg-shop-a"><b>${amt}</b>${pack ? `<small>${pack}</small>` : ''}</span></button>`;
    }).join('')}</div>`;
  }
  h += `<button class="btn primary" data-action="mg-shop-share">📤 Liste teilen</button>`;
  if (shop.done.length) h += '<button class="btn center" data-action="mg-shop-reset">Häkchen entfernen</button>';
  return h;
}
views.mealshop = { title: 'Einkaufsliste', tab: 'nutrition', render: renderMealShop, back: () => ['mealplan', {}] };

// Knopf im Ernährungs-Reiter („Mehr“)
function mgOpenBtn() {
  if (typeof nutPlanActive === 'function' && nutPlanActive()) return '';
  return mgActive()
    ? '<button class="btn nav mg-open-btn" data-action="mg-open">🍽️ Dein Ernährungsplan<small>Gerichte für jeden Tag, passend zu deinem Tagesziel</small></button>'
    : '<button class="btn nav mg-open-btn" data-action="mg-open">🍽️ Ernährungsplan erstellen lassen<small>Die App stellt Gerichte für jeden Tag zusammen, passend zu deinen Kalorien und Makros</small></button>';
}

// Vorlieben geändert: nicht mehr passende Gerichte ersetzen
function mgPrefsSet(p) {
  data.mealPrefs = { ...mgPrefs(), ...p };
  mgItemCache.clear(); mgCache.clear();
  if (mgDraft) mgRepair(mgDraft.picks);
  if (data.mealPlan && data.mealPlan.picks) mgRepair(data.mealPlan.picks);
  saveData();
  render();
}

Object.assign(actions, {
  'mg-open': () => {
    mgSel = todayISO(); mgPrefsOpen = null; mgAltOpen = null;
    if (!data.mealPlan) mgDraft = null;
    else if (data.mealPlan.alt) {  // Alternativen vergangener Tage aufräumen
      const old = addDaysISO(todayISO(), -1);
      for (const d of Object.keys(data.mealPlan.alt)) if (d < old) delete data.mealPlan.alt[d];
    }
    go('mealplan');
  },
  'go-nutrition': () => go('nutrition'),
  // aus dem Tagebuch: Plan für diesen Tag ansehen (Gericht tauschen, Zubereitung)
  'mg-open-day': el => { mgDraft = null; mgSel = el.dataset.d; go('mealplan', { from: 'food', date: el.dataset.d }); },
  'mg-day': el => { mgSel = el.dataset.d; mgAltOpen = null; render(); },
  // anderes Gericht: zufällig (Lieblingszutaten eher), nicht schon heute geplant, keine zweite Variante desselben Gerichts am Tag,
  // und erst wieder ein schon gezeigtes, wenn alle durch sind
  'mg-swap': el => {
    const k = el.dataset.k, picks = mgPicks(), wd = mgWd(mgSel);
    const cur = mgPick(picks, wd, k);
    if (!cur) return;
    const other = mealKeys().filter(x => x !== k).map(x => mgPick(picks, wd, x)).filter(Boolean);
    const ids = other.map(r => r.id), fams = other.map(r => r.fam).filter(Boolean);
    const seen = mgSwapSeen[`${wd}|${k}`] = mgSwapSeen[`${wd}|${k}`] || new Set();
    seen.add(cur.id);
    const all = mgAllowed(cur.cat);
    let cand = all.filter(r => !seen.has(r.id) && !ids.includes(r.id) && !(r.fam && fams.includes(r.fam)));
    if (!cand.length) { seen.clear(); seen.add(cur.id); cand = all.filter(r => r.id !== cur.id && !ids.includes(r.id)); }
    if (!cand.length) return;
    picks[wd] = { ...(picks[wd] || {}), [k]: mgWOrder(cand)[0].id };
    mgAltOpen = null;
    if (!mgDraft) saveData();
    render();
  },
  // Alternativen zu einer Zutat auf- und zuklappen
  'mg-alt': el => { const id = `${el.dataset.k}|${el.dataset.b}`; mgAltOpen = mgAltOpen === id ? null : id; render(); },
  // Zutat für diese Mahlzeit an diesem Tag ersetzen (Auswahl der ursprünglichen Zutat = zurück)
  'mg-alt-set': el => {
    const p = mgPlanObj();
    if (!p) return;
    const { k, b, n } = el.dataset, alt = p.alt = p.alt || {}, day = alt[mgSel] = { ...(alt[mgSel] || {}) }, m = day[k] = { ...(day[k] || {}) };
    if (n === b) delete m[b]; else m[b] = n;
    if (!Object.keys(m).length) delete day[k];
    if (!Object.keys(day).length) delete alt[mgSel];
    mgCache.clear();
    if (!mgDraft) saveData();
    render();
  },
  // „In allen Gerichten so ersetzen“: wird zur Vorliebe (mealPrefs.repl), die Tagesauswahl dafür entfällt
  'mg-alt-pin': el => {
    const { b, n } = el.dataset, p = mgPlanObj();
    if (p && p.alt) for (const d of Object.keys(p.alt)) {
      for (const k of Object.keys(p.alt[d])) { if (p.alt[d][k][b] === n) delete p.alt[d][k][b]; if (!Object.keys(p.alt[d][k]).length) delete p.alt[d][k]; }
      if (!Object.keys(p.alt[d]).length) delete p.alt[d];
    }
    mgAltOpen = null;
    mgPrefsSet({ repl: { ...mgPrefs().repl, [b]: n } });
    toast('Wird jetzt in allen Gerichten ersetzt');
  },
  'mg-fav-toggle': () => { mgFavOpen = !mgFavOpen; render(); },
  'mg-unrepl': el => { const r = { ...mgPrefs().repl }; delete r[el.dataset.n]; mgPrefsSet({ repl: r }); },
  // Lieblingszutat an/aus: ein Vorschlag wird gleich neu zusammengestellt, ein übernommener Plan bleibt
  'mg-fav': el => {
    const f = mgPrefs().fav, n = el.dataset.n;
    data.mealPrefs = { ...mgPrefs(), fav: f.includes(n) ? f.filter(x => x !== n) : [...f, n] };
    if (mgDraft) mgDraft = { ...mgDraft, picks: mgMakePicks() };
    mgCache.clear();
    saveData();
    render();
  },
  'mg-ban': el => {
    const r = mgPick(mgPicks(), mgWd(mgSel), el.dataset.k);
    if (!r) return;
    mgPrefsSet({ ban: [...mgPrefs().ban, r.id] });
    toast('Gericht wird nicht mehr vorgeschlagen');
  },
  'mg-unban': el => mgPrefsSet({ ban: mgPrefs().ban.filter(id => id !== el.dataset.id) }),
  'mg-prefs-toggle': () => { mgPrefsOpen = !(mgPrefsOpen == null ? !!mgDraft : mgPrefsOpen); render(); },
  'mg-diet': el => mgPrefsSet({ diet: el.dataset.k }),
  'mg-no': el => { const no = mgPrefs().no, k = el.dataset.k; mgPrefsSet({ no: no.includes(k) ? no.filter(x => x !== k) : [...no, k] }); },
  'mg-reroll': () => {
    if (!mgDraft && !askOk('Alle Gerichte neu zusammenstellen?\n\nGetauschte Gerichte gehen dabei verloren.')) return;
    if (mgDraft) mgDraft = { picks: mgMakePicks() };
    else { data.mealPlan.picks = mgMakePicks(); saveData(); }
    render();
  },
  'mg-accept': () => {
    data.mealPlan = { created: todayISO(), picks: mgDraft.picks, ...(mgDraft.alt ? { alt: mgDraft.alt } : {}) };
    mgDraft = null;
    mgPrefsOpen = null;
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
  // Einkaufsliste
  'mg-shop': () => go('mealshop'),
  'mg-shop-n': el => { data.mealPlan.shop = { ...mgShop(), n: Number(el.dataset.n) }; saveData(); render(); },
  'mg-shop-tick': el => {
    const s = mgShop(), n = el.dataset.n;
    data.mealPlan.shop = { ...s, done: s.done.includes(n) ? s.done.filter(x => x !== n) : [...s.done, n] };
    saveData(); render();
  },
  'mg-shop-reset': () => { data.mealPlan.shop = { ...mgShop(), done: [] }; saveData(); render(); },
  'mg-shop-share': async () => {
    const shop = mgShop(), { days, groups } = mgShopList();
    const lines = [`${tr('Einkaufsliste')}: ${mgDateShort(days[0])} ${tr('bis')} ${mgDateShort(days[days.length - 1])}`];
    for (const gr of groups) {
      const its = gr.items.filter(a => !shop.done.includes(a.name));
      if (!its.length) continue;
      lines.push('', tr(gr.label));
      its.forEach(a => { const { amt, pack } = mgShopAmt(a); lines.push(`- ${tr(a.name)}: ${tr(amt)}${pack ? ` (${tr(pack)})` : ''}`); });
    }
    const text = lines.join('\n');
    if (navigator.share) {
      try { await navigator.share({ title: tr('Einkaufsliste'), text }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text); toast('Einkaufsliste kopiert ✔'); }
    catch (e) { uiCopy(text); }
  },
});
