/* LockYourGains | © 2026 Alex Hundt | Alle Rechte vorbehalten – siehe LICENSE */
/* ---------- Ernährungstagebuch: Lebensmittel erfassen (Grundliste, Open Food Facts, Barcode, eigene) ----------
   data.foodLog = [{ id, date, meal: 'b'|'l'|'d'|'s', key, name, brand, g, per: [kcal, Eiweiß, Kohlenhydrate, Fett, Ballaststoffe, Zucker] je 100 g }]
   (Ballaststoffe/Zucker freiwillig: fehlen oder null = unbekannt, z. B. ältere Einträge – Anzeige ohne Tagesziel)
   (Nährwerte werden pro Eintrag mitgespeichert – spätere Änderungen am Lebensmittel ändern alte Tage nicht).
   data.foods = { key: Lebensmittel } – gemerkte Lebensmittel (zuletzt gegessen, Favoriten, eigene, aus Open Food Facts);
   bei Lebensmitteln der Grundliste nur { fav, last }.
   Die Tagessumme landet als data.intake-Eintrag mit src 'food' (Ist ↔ Soll, 14 Tage, gemessener Bedarf).
   data.foodClosed = { Datum: true } – abgeschlossene Tage (nur sie zählen für den gemessenen Bedarf);
   „Rest auffüllen“ legt einen Eintrag mit key 'fill' (meal 'f') an.
   data.foodMeals = [{ id, name, items: [{ key, name, brand, g, per }] }] – gespeicherte Mahlzeiten (Schnellauswahl). */

// Grundliste: [Name, kcal, Eiweiß, Kohlenhydrate, Fett] je 100 g, optional [Portion, Gramm]. Durchschnittswerte.
const FOOD_BASE = [
  // Getreide, Beilagen
  ['Haferflocken', 370, 13.5, 59, 7, '1 Portion', 50],
  ['Reis, roh', 350, 7, 78, 0.6, '1 Portion (roh)', 75],
  ['Reis, gekocht', 130, 2.7, 28, 0.3, '1 Portion', 200],
  ['Vollkornreis, roh', 350, 7.5, 74, 2.5, '1 Portion (roh)', 75],
  ['Nudeln, roh', 355, 12.5, 70, 1.5, '1 Portion (roh)', 100],
  ['Nudeln, gekocht', 150, 5.5, 30, 0.8, '1 Portion', 250],
  ['Vollkornnudeln, roh', 345, 13.5, 64, 2.5, '1 Portion (roh)', 100],
  ['Reisnudeln, roh', 365, 7.2, 82, 0.6, '1 Portion (roh)', 75],
  ['Mie-Nudeln, roh', 342, 13.2, 66, 2, '1 Portion (roh)', 75],
  ['Linsennudeln, roh', 340, 25, 46, 2, '1 Portion (roh)', 100],
  ['Kartoffeln, gekocht', 72, 2, 15, 0.1, '1 Kartoffel', 80],
  ['Süßkartoffel', 86, 1.6, 20, 0.1, '1 Süßkartoffel', 200],
  ['Pommes frites, zubereitet', 290, 3.5, 36, 14, '1 Portion', 150],
  ['Bratkartoffeln', 150, 2.5, 20, 6.5, '1 Portion', 200],
  ['Gnocchi', 152, 3.9, 32, 0.6, '1 Packung', 400],
  ['Kartoffelpüree, mit Milch', 90, 2, 13, 3.5, '1 Portion', 200],
  ['Couscous, roh', 360, 12, 72, 1.5, '1 Portion (roh)', 75],
  ['Bulgur, roh', 350, 12, 70, 1.5, '1 Portion (roh)', 75],
  ['Quinoa, roh', 368, 14, 64, 6, '1 Portion (roh)', 75],
  ['Hirse, roh', 360, 10.5, 69, 4, '1 Portion (roh)', 75],
  ['Polenta (Maisgrieß), roh', 330, 8.7, 63, 2.8, '1 Portion (roh)', 60],
  ['Buchweizen, roh', 339, 13.1, 62, 3.1, '1 Portion (roh)', 75],
  ['Grieß, roh', 330, 10, 69, 0.8],
  ['Weizenmehl', 340, 10, 72, 1],
  ['Cornflakes', 375, 7.5, 84, 0.9, '1 Portion', 30],
  ['Müsli, ohne Zuckerzusatz', 360, 10, 60, 7, '1 Portion', 50],
  ['Knuspermüsli (Crunchy)', 450, 8, 63, 17, '1 Portion', 50],
  ['Reiswaffel', 385, 8, 81, 3, '1 Reiswaffel', 8],
  ['Knäckebrot', 340, 10, 66, 1.5, '1 Scheibe', 10],
  // Brot, Backwaren
  ['Vollkornbrot', 215, 7, 38, 1.2, '1 Scheibe', 50],
  ['Mischbrot', 230, 6.5, 45, 1.3, '1 Scheibe', 45],
  ['Toastbrot (Weizen)', 260, 8, 47, 3.5, '1 Scheibe', 25],
  ['Vollkorntoast', 250, 9, 42, 4.5, '1 Scheibe', 25],
  ['Brötchen (Weizen)', 270, 9, 53, 1.5, '1 Brötchen', 55],
  ['Vollkornbrötchen', 245, 9.5, 42, 3, '1 Brötchen', 60],
  ['Eiweißbrot (Proteinbrot)', 226, 23.4, 11, 8.2, '1 Scheibe', 50],
  ['Laugenbrezel', 270, 8.5, 54, 2, '1 Brezel', 85],
  ['Croissant', 410, 8, 45, 21, '1 Croissant', 60],
  ['Baguette', 260, 8.5, 53, 1.3, '1 Stück', 50],
  ['Wrap (Weizentortilla)', 310, 8.5, 52, 7.5, '1 Wrap', 60],
  ['Fladenbrot', 270, 9, 55, 1.2, '1 Viertel', 100],
  ['Pfannkuchen', 215, 7, 26, 9, '1 Pfannkuchen', 80],
  // Milch und Milchprodukte
  ['Milch 3,5 %', 64, 3.3, 4.8, 3.5, '1 Glas (200 ml)', 200],
  ['Milch 1,5 %', 47, 3.4, 4.9, 1.5, '1 Glas (200 ml)', 200],
  ['Haferdrink', 45, 1, 6.5, 1.5, '1 Glas (200 ml)', 200],
  ['Sojadrink, ungesüßt', 39, 3, 2.5, 1.8, '1 Glas (200 ml)', 200],
  ['Sojajoghurt natur', 44, 4.2, 0.3, 2.7, '1 Portion', 150],
  ['Magerquark', 67, 12, 4, 0.3, '1 Becher', 250],
  ['Speisequark 20 %', 110, 12, 3.5, 5, '1 Becher', 250],
  ['Speisequark 40 %', 160, 11, 3, 11.5, '1 Becher', 250],
  ['Skyr natur', 63, 11, 4, 0.2, '1 Becher', 150],
  ['Joghurt natur 3,5 %', 66, 3.8, 4.5, 3.5, '1 Becher', 150],
  ['Joghurt natur 1,5 %', 47, 4, 4.5, 1.5, '1 Becher', 150],
  ['Griechischer Joghurt 10 %', 125, 4, 4, 10, '1 Portion', 150],
  ['Fruchtjoghurt', 95, 3.5, 14, 2.8, '1 Becher', 150],
  ['Hüttenkäse (körniger Frischkäse)', 100, 12.5, 2, 4.5, '1 Becher', 200],
  ['Frischkäse natur (Doppelrahm)', 230, 5.5, 3.5, 21.5, '1 Portion', 30],
  ['Frischkäse leicht', 150, 8, 4, 11, '1 Portion', 30],
  ['Gouda', 356, 25, 0, 28, '1 Scheibe', 25],
  ['Emmentaler', 380, 28.5, 0, 29.5, '1 Scheibe', 25],
  ['Mozzarella', 250, 18, 1, 19.5, '1 Kugel', 125],
  ['Mozzarella light', 165, 19, 1, 9.5, '1 Kugel', 125],
  ['Feta (Schafskäse)', 265, 17, 0.5, 21.5, '1 Portion', 50],
  ['Halloumi', 315, 21.5, 0.1, 25, '1 Packung', 225],
  ['Parmesan', 395, 33, 0, 29, '1 EL gerieben', 10],
  ['Harzer Käse', 125, 27, 0, 0.7, '1 Stück', 30],
  ['Butter', 741, 0.7, 0.6, 83, '1 TL', 5],
  ['Schlagsahne 30 %', 292, 2.4, 3.2, 30, '1 EL', 15],
  ['Saure Sahne 10 %', 117, 3, 4, 10, '1 EL', 15],
  ['Kochsahne 15 %', 165, 2.8, 4, 15, '1 Becher', 200],
  ['Schmand 24 %', 240, 2.5, 3.5, 24, '1 EL', 15],
  ['Crème fraîche', 300, 2.4, 2.6, 30, '1 EL', 15],
  ['Proteinpudding', 75, 10, 6, 1.5, '1 Becher', 200],
  ['Pudding (Schoko), fertig', 110, 3, 17, 3.2, '1 Becher', 125],
  // Eier
  ['Ei', 143, 12.6, 0.7, 9.5, '1 Ei (M)', 55],
  ['Eiklar', 48, 11, 0.7, 0.2, '1 Eiklar', 33],
  ['Spiegelei, in Fett gebraten', 190, 13.5, 0.7, 15, '1 Spiegelei', 60],
  // Fleisch, Wurst
  ['Hähnchenbrust, roh', 106, 23.5, 0, 1.2, '1 Portion', 150],
  ['Hähnchenbrust, gebraten', 155, 30, 0, 3.6, '1 Portion', 120],
  ['Putenbrust, roh', 105, 24, 0, 1, '1 Portion', 150],
  ['Putenhackfleisch, roh', 150, 20, 0, 7.5, '1 Portion', 125],
  ['Hähnchenschenkel mit Haut, roh', 190, 18, 0, 13, '1 Schenkel', 200],
  ['Hähnchenschenkel ohne Haut, roh', 120, 19.5, 0, 4.5, '1 Portion', 150],
  ['Rinderhackfleisch (20 % Fett), roh', 254, 17, 0, 20, '1 Portion', 125],
  ['Rinderhackfleisch mager (5 % Fett), roh', 137, 21, 0, 5, '1 Portion', 125],
  ['Hackfleisch gemischt, roh', 260, 18, 0, 21, '1 Portion', 125],
  ['Rindersteak (Hüfte, Rumpsteak), roh', 135, 22, 0, 5, '1 Steak', 200],
  ['Lammfleisch mager (Keule, Schulter), roh', 121, 19.8, 0, 4.6, '1 Portion', 150],
  ['Kalbsschnitzel, roh', 89, 20.7, 0, 0.7, '1 Schnitzel', 150],
  ['Rindfleisch mager (Gulasch, Schulter), roh', 128, 20.2, 0, 5.3, '1 Portion', 150],
  ['Schweinefilet, roh', 112, 21, 0, 3, '1 Portion', 150],
  ['Schweineschnitzel, roh', 106, 22, 0, 2, '1 Schnitzel', 150],
  ['Schweinenacken, roh', 200, 18, 0, 14.5, '1 Scheibe', 150],
  ['Kasseler', 140, 21, 0.5, 6, '1 Scheibe', 150],
  ['Schnitzel paniert, gebraten', 230, 18, 12, 12, '1 Schnitzel', 180],
  ['Frikadelle', 240, 15, 8, 16, '1 Frikadelle', 80],
  ['Gyros (Fleisch)', 220, 20, 1, 15, '1 Portion', 200],
  ['Rindergulasch', 120, 15, 3, 5, '1 Portion', 250],
  ['Frühstücksspeck (Bacon)', 330, 16, 0.5, 30, '1 Scheibe', 10],
  ['Kochschinken', 110, 19, 1, 3, '1 Scheibe', 20],
  ['Putenbrust-Aufschnitt', 105, 22, 1, 1.5, '1 Scheibe', 15],
  ['Beef Jerky (Trockenfleisch)', 280, 45, 12, 4, '1 Portion', 25],
  ['Bresaola (Rinderschinken)', 150, 32, 0.5, 2.6, '1 Packung', 80],
  ['Salami', 400, 22, 0.5, 34, '1 Scheibe', 10],
  ['Leberwurst', 300, 14, 1.5, 26.5, '1 Portion', 20],
  ['Fleischwurst (Lyoner)', 270, 12, 0.5, 24.5, '1 Scheibe', 20],
  ['Wiener Würstchen', 270, 13, 0.5, 24, '1 Würstchen', 50],
  ['Bratwurst', 290, 14, 0.5, 25.5, '1 Bratwurst', 100],
  ['Leberkäse', 290, 12, 0.5, 26, '1 Scheibe', 100],
  ['Currywurst mit Soße', 230, 10, 8, 17.5, '1 Portion', 250],
  ['Döner Kebab im Brot', 215, 11, 20, 10, '1 Döner', 350],
  // Fisch
  ['Lachs, roh', 200, 20, 0, 13, '1 Filet', 125],
  ['Forelle, roh', 136, 19, 0, 6.5, '1 Filet', 125],
  ['Räucherlachs', 170, 21.2, 0.2, 9.2, '1 Packung', 100],
  ['Thunfisch im eigenen Saft (abgetropft)', 110, 25, 0, 1, '1 Dose (abgetropft)', 120],
  ['Thunfisch in Öl (abgetropft)', 200, 24, 0, 11, '1 Dose (abgetropft)', 120],
  ['Seelachs, roh', 80, 18, 0, 0.9, '1 Filet', 125],
  ['Kabeljau, roh', 78, 18, 0, 0.7, '1 Filet', 125],
  ['Garnelen, roh', 75, 17, 0.5, 0.8, '1 Portion', 100],
  ['Fischstäbchen', 200, 13, 18, 8.5, '1 Fischstäbchen', 30],
  ['Matjesfilet', 255, 16, 0, 21.5, '1 Filet', 50],
  ['Makrele, geräuchert', 290, 19, 0, 24, '1 Filet', 100],
  ['Sushi (Maki)', 150, 4.5, 28, 2, '1 Stück', 25],
  // Hülsenfrüchte, Soja, Nüsse
  ['Linsen, roh', 320, 24, 48, 1.5, '1 Portion (roh)', 70],
  ['Linsen, gekocht', 115, 9, 16, 0.5, '1 Portion', 200],
  ['Kichererbsen (Dose, abgetropft)', 120, 7, 15, 2.5, '1 Dose (abgetropft)', 240],
  ['Kidneybohnen (Dose, abgetropft)', 100, 7, 14, 0.5, '1 Dose (abgetropft)', 250],
  ['Schwarze Bohnen (Dose, abgetropft)', 105, 7.5, 13, 0.5, '1 Dose (abgetropft)', 240],
  ['Weiße Bohnen (Dose, abgetropft)', 95, 6.5, 13, 0.5, '1 Dose (abgetropft)', 250],
  ['Erbsen (TK)', 80, 5.4, 10, 0.4, '1 Portion', 150],
  ['Edamame (TK)', 125, 11.5, 5, 5.5, '1 Portion', 100],
  ['Tofu natur', 125, 13, 1.5, 7.5, '1 Packung', 200],
  ['Räuchertofu', 160, 16, 2, 10, '1 Packung', 200],
  ['Seitan', 199, 28.4, 4, 7.2, '1 Packung', 200],
  ['Tempeh', 190, 19, 4, 11, '1 Packung', 200],
  ['Sojaschnetzel, trocken', 330, 50, 17, 1.5, '1 Portion (trocken)', 50],
  ['Falafel', 330, 13, 28, 18, '1 Falafel', 20],
  ['Hummus', 280, 7, 12, 22, '1 EL', 20],
  ['Erdnussbutter', 610, 25, 11, 50, '1 EL', 15],
  ['Tahin (Sesammus)', 595, 18, 0.7, 56, '1 EL', 15],
  ['Erdnüsse, geröstet', 610, 25, 11, 50, '1 Handvoll', 25],
  ['Mandeln', 600, 21, 5.5, 53, '1 Handvoll', 25],
  ['Walnüsse', 690, 15, 7, 65, '1 Handvoll', 25],
  ['Haselnüsse', 650, 15, 10.5, 61, '1 Handvoll', 25],
  ['Cashewkerne', 580, 18, 30, 44, '1 Handvoll', 25],
  ['Pistazien', 585, 20, 17, 46, '1 Handvoll', 25],
  ['Nussmischung (Studentenfutter)', 470, 13, 40, 29, '1 Handvoll', 30],
  ['Chiasamen', 470, 21, 4, 31, '1 EL', 12],
  ['Leinsamen', 500, 24, 2, 37, '1 EL', 10],
  ['Sonnenblumenkerne', 600, 22, 12, 50, '1 EL', 10],
  ['Kürbiskerne', 580, 30, 5, 49, '1 EL', 10],
  ['Kokosraspeln', 660, 6.5, 6.5, 63, '1 EL', 7],
  // Obst
  ['Apfel', 54, 0.3, 11.4, 0.2, '1 Apfel', 150],
  ['Banane', 90, 1.1, 20, 0.2, '1 Banane (geschält)', 120],
  ['Birne', 57, 0.4, 12.4, 0.1, '1 Birne', 150],
  ['Orange', 47, 1, 9, 0.2, '1 Orange (geschält)', 150],
  ['Mandarine, Clementine', 50, 0.7, 10, 0.3, '1 Stück (geschält)', 70],
  ['Kiwi', 59, 1, 11, 0.6, '1 Kiwi', 75],
  ['Erdbeeren', 32, 0.7, 5.5, 0.4, '1 Schälchen', 150],
  ['Heidelbeeren', 42, 0.6, 7.4, 0.6, '1 Schälchen', 125],
  ['Himbeeren', 38, 1.3, 4.8, 0.3, '1 Schälchen', 125],
  ['Weintrauben', 70, 0.7, 16, 0.2, '1 Portion', 125],
  ['Ananas', 55, 0.5, 12, 0.2, '1 Portion', 150],
  ['Mango', 62, 0.6, 13, 0.4, '½ Mango', 150],
  ['Wassermelone', 30, 0.6, 7, 0.2, '1 Stück', 250],
  ['Pfirsich, Nektarine', 42, 0.8, 9, 0.1, '1 Stück', 130],
  ['Kirschen', 63, 1, 13.3, 0.3, '1 Portion', 125],
  ['Pflaumen', 47, 0.6, 10.2, 0.2, '1 Pflaume', 35],
  ['Avocado', 165, 2, 1.9, 15.4, '½ Avocado', 70],
  ['Apfelmus, ungesüßt', 60, 0.3, 13.5, 0.1, '1 Portion', 100],
  ['Rosinen', 294, 2.5, 68, 0.5, '1 EL', 15],
  ['Datteln, getrocknet', 280, 2, 65, 0.5, '1 Dattel', 8],
  // Gemüse
  ['Brokkoli', 35, 3, 4, 0.4, '1 Portion', 200],
  ['Blumenkohl', 25, 2, 2.5, 0.3, '1 Portion', 200],
  ['Paprika', 31, 1, 5, 0.3, '1 Paprika', 150],
  ['Tomate', 18, 0.9, 2.6, 0.2, '1 Tomate', 100],
  ['Gurke', 12, 0.6, 1.8, 0.1, '1 Portion', 100],
  ['Karotte (Möhre)', 38, 0.9, 6.8, 0.2, '1 Karotte', 70],
  ['Zucchini', 17, 1.2, 2.2, 0.3, '1 Zucchini', 250],
  ['Aubergine', 22, 1.2, 2.5, 0.2, '1 Aubergine', 300],
  ['Spinat', 24, 2.9, 1.6, 0.4, '1 Portion', 150],
  ['Blattsalat (Kopfsalat, Eisberg, Feldsalat)', 14, 1, 1.6, 0.2, '1 Portion', 50],
  ['Rucola', 25, 2.6, 2, 0.7, '1 Portion', 30],
  ['Zwiebel', 40, 1.1, 7.6, 0.1, '1 Zwiebel', 80],
  ['Lauch (Porree)', 36, 2.1, 5, 0.2, '1 Stange', 200],
  ['Frühlingszwiebeln', 27, 1.9, 3, 0.2, '1 Bund', 100],
  ['Champignons', 22, 3, 2.3, 0.3, '1 Portion', 150],
  ['Mais (Dose, abgetropft)', 85, 2.9, 15, 1.2, '1 Dose (abgetropft)', 140],
  ['Grüne Bohnen', 30, 1.8, 4.5, 0.2, '1 Portion', 150],
  ['Kohlrabi', 25, 1.9, 3.7, 0.1, '1 Kohlrabi', 250],
  ['Fenchel', 27, 1.4, 3.4, 0.2, '1 Knolle', 250],
  ['Staudensellerie', 17, 1.2, 1.5, 0.1, '1 Stange', 50],
  ['Pak Choi, Chinakohl', 17, 1.8, 1.2, 0.2, '1 Portion', 150],
  ['Rosenkohl', 43, 3.4, 5.2, 0.3, '1 Portion', 150],
  ['Grünkohl', 53, 4.2, 3.3, 0.7, '1 Portion', 200],
  ['Weißkohl, Rotkohl', 27, 1.4, 4.2, 0.2, '1 Portion', 150],
  ['Sauerkraut', 20, 1.4, 2, 0.2, '1 Portion', 150],
  ['Spargel', 20, 2, 2, 0.2, '1 Portion', 250],
  ['Rote Bete, gekocht', 44, 1.7, 8.5, 0.2, '1 Knolle', 100],
  ['Kürbis (Hokkaido)', 45, 1.7, 8, 0.6, '1 Portion', 200],
  ['Gemüsemischung (TK)', 35, 2, 5, 0.4, '1 Portion', 200],
  ['Oliven', 145, 1.3, 1, 15, '5 Oliven', 20],
  ['Gewürzgurken', 20, 0.5, 3.5, 0.1, '1 Gurke', 30],
  // Fette, Soßen, Aufstriche
  ['Speiseöl (Olivenöl, Rapsöl, Sonnenblumenöl)', 884, 0, 0, 100, '1 EL', 10],
  ['Margarine', 720, 0.2, 0.5, 80, '1 TL', 5],
  ['Mayonnaise', 700, 1.1, 2, 76, '1 EL', 15],
  ['Ketchup', 102, 1.2, 23, 0.1, '1 EL', 15],
  ['Sweet-Chili-Soße', 220, 0.5, 52, 0.5, '1 EL', 15],
  ['Barbecue-Soße', 102, 1.5, 21.4, 0.6, '1 EL', 15],
  ['Senf', 85, 5.5, 5, 4.5, '1 TL', 5],
  ['Pesto (Basilikum)', 480, 5, 6, 48, '1 EL', 15],
  ['Passierte Tomaten (Passata)', 33, 1.5, 5, 0.2, '1 Portion', 100],
  ['Kokosmilch (light)', 75, 0.7, 2, 7, '1 Dose', 400],
  ['Tomatenmark', 81, 3.4, 13.2, 0.2, '1 EL', 15],
  ['Tomatensoße, fertig', 60, 1.5, 7.5, 2.5, '1 Portion', 125],
  ['Sojasoße', 70, 10, 6, 0, '1 EL', 15],
  ['Balsamico-Essig', 100, 0.5, 20, 0, '1 EL', 15],
  ['Honig', 310, 0.4, 76, 0, '1 TL', 10],
  ['Marmelade, Konfitüre', 250, 0.4, 60, 0.1, '1 Portion', 20],
  ['Nuss-Nougat-Creme', 540, 6.3, 57.5, 31, '1 Portion', 15],
  ['Zucker', 400, 0, 100, 0, '1 TL', 5],
  ['Ahornsirup', 260, 0, 67, 0.1, '1 EL', 20],
  ['Puddingpulver Vanille (Speisestärke)', 344, 0.4, 85, 0.1, '1 EL', 10],
  ['Süßungsmittel (Erythrit, Streusüße)', 0, 0, 0, 0, '1 EL', 10],
  ['Kakaopulver (ungesüßt)', 311, 25.5, 12.3, 11.2, '1 EL', 8],
  // Süßes, Snacks
  ['Vollmilchschokolade', 535, 7.5, 56, 30, '1 Reihe', 25],
  ['Zartbitterschokolade 70 %', 570, 9, 33, 43, '1 Reihe', 25],
  ['Gummibärchen', 343, 6.9, 77, 0.5, '1 Handvoll', 25],
  ['Butterkekse', 440, 7.5, 72, 13, '1 Keks', 8],
  ['Kartoffelchips', 530, 6, 50, 33, '1 Handvoll', 30],
  ['Salzstangen', 380, 10, 77, 3.5, '1 Handvoll', 30],
  ['Vanilleeis', 200, 3.5, 24, 10, '1 Kugel', 60],
  ['Rührkuchen, Marmorkuchen', 380, 5.5, 48, 18, '1 Stück', 70],
  ['Käsekuchen', 235, 7, 27, 11, '1 Stück', 120],
  ['Müsliriegel', 410, 6, 64, 13, '1 Riegel', 25],
  ['Proteinriegel', 360, 32, 30, 12, '1 Riegel', 55],
  // Getränke
  ['Orangensaft', 45, 0.7, 9.5, 0.2, '1 Glas (200 ml)', 200],
  ['Apfelsaft', 46, 0.1, 11, 0.1, '1 Glas (200 ml)', 200],
  ['Apfelschorle', 23, 0.1, 5.5, 0, '1 Glas (250 ml)', 250],
  ['Cola', 42, 0, 10.6, 0, '1 Dose (330 ml)', 330],
  ['Cola zero, Light-Getränke', 0.3, 0, 0, 0, '1 Dose (330 ml)', 330],
  ['Energy-Drink', 46, 0, 11, 0, '1 Dose (250 ml)', 250],
  ['Bier (Pils)', 42, 0.5, 3, 0, '1 Flasche (0,5 l)', 500],
  ['Weizenbier', 45, 0.5, 3.5, 0, '1 Flasche (0,5 l)', 500],
  ['Bier, alkoholfrei', 25, 0.4, 5.3, 0, '1 Flasche (0,5 l)', 500],
  ['Wein, trocken', 70, 0.1, 0.5, 0, '1 Glas (200 ml)', 200],
  ['Kaffee, schwarz', 2, 0.2, 0.3, 0, '1 Tasse (200 ml)', 200],
  ['Cappuccino, Milchkaffee', 35, 1.8, 2.7, 1.8, '1 Tasse (200 ml)', 200],
  ['Proteinpulver (Whey)', 385, 78, 7, 5, '1 Messlöffel', 30],
  ['Proteinpulver, vegan', 380, 75, 6, 6, '1 Messlöffel', 30],
  ['Wasser, Tee (ungesüßt)', 0, 0, 0, 0, '1 Glas (250 ml)', 250],
  // Gerichte
  ['Haferbrei (Porridge) mit Milch', 115, 4.6, 14, 4.1, '1 Schüssel', 300],
  ['Spaghetti Bolognese', 150, 7, 20, 4.5, '1 Teller', 400],
  ['Lasagne', 140, 7, 12, 7, '1 Portion', 400],
  ['Pizza Margherita', 230, 10, 30, 8, '1 Pizza', 350],
  ['Pizza Salami', 255, 11, 28, 11, '1 Pizza', 350],
  ['Hamburger', 245, 12, 30, 8.5, '1 Hamburger', 110],
  ['Cheeseburger', 260, 13, 27, 11, '1 Cheeseburger', 120],
  ['Linseneintopf', 90, 5, 10, 3, '1 Teller', 350],
  ['Kartoffelsalat mit Mayonnaise', 180, 1.8, 13, 13, '1 Portion', 200],
  ['Kartoffelsalat mit Essig und Öl', 95, 1.7, 13, 4, '1 Portion', 200],
];

// Ballaststoffe und Zucker (gesamt) je 100 g zur Grundliste: Werte des passenden Eintrags im Bundeslebensmittelschlüssel 4.0,
// ohne passenden Eintrag (Proteinpulver, -riegel, -pudding, Energy-Drink, Tomatensoße) grob geschätzt
const FOOD_BASE_FS = {
  'Haferflocken': [11, 0.7],
  'Reis, roh': [2.5, 0.3],
  'Reis, gekocht': [0.6, 0.1],
  'Vollkornreis, roh': [4, 0.7],
  'Nudeln, roh': [3.4, 2],
  'Nudeln, gekocht': [1.5, 0.8],
  'Vollkornnudeln, roh': [10.2, 2.8],
  'Kartoffeln, gekocht': [2, 0.7],
  'Süßkartoffel': [3.1, 5.5],
  'Pommes frites, zubereitet': [2.5, 1.6],
  'Bratkartoffeln': [3.3, 1.1],
  'Kartoffelpüree, mit Milch': [0.9, 1.7],
  'Couscous, roh': [6.2, 1.1],
  'Bulgur, roh': [6.7, 1.9],
  'Quinoa, roh': [9.7, 1.7],
  'Hirse, roh': [3.3, 0.6],
  'Grieß, roh': [4.1, 0.8],
  'Weizenmehl': [5.3, 0.3],
  'Cornflakes': [4.1, 0.7],
  'Müsli, ohne Zuckerzusatz': [10.4, 11.3],
  'Knuspermüsli (Crunchy)': [7.7, 19.2],
  'Reiswaffel': [3.6, 0.4],
  'Knäckebrot': [18.2, 1.8],
  'Vollkornbrot': [10, 0.8],
  'Mischbrot': [7.2, 0.7],
  'Toastbrot (Weizen)': [3.9, 3.7],
  'Vollkorntoast': [7.9, 1.6],
  'Brötchen (Weizen)': [3.6, 3.1],
  'Vollkornbrötchen': [9.8, 1.4],
  'Laugenbrezel': [3.7, 1.4],
  'Croissant': [2.6, 7.2],
  'Baguette': [3.7, 1.5],
  'Wrap (Weizentortilla)': [1.2, 1.3],
  'Fladenbrot': [3.3, 0.3],
  'Pfannkuchen': [2, 2.5],
  'Milch 3,5 %': [0, 4],
  'Milch 1,5 %': [0, 4.6],
  'Haferdrink': [0.5, 3.8],
  'Sojadrink, ungesüßt': [1.8, 0.4],
  'Magerquark': [0, 3.7],
  'Speisequark 20 %': [0, 3],
  'Speisequark 40 %': [0, 2.6],
  'Skyr natur': [0.2, 3.1],
  'Joghurt natur 3,5 %': [0, 4.1],
  'Joghurt natur 1,5 %': [0, 5.8],
  'Griechischer Joghurt 10 %': [0, 4.5],
  'Fruchtjoghurt': [1.1, 12.1],
  'Hüttenkäse (körniger Frischkäse)': [0, 3.6],
  'Frischkäse natur (Doppelrahm)': [0.6, 3.7],
  'Frischkäse leicht': [0, 3.2],
  'Gouda': [0, 0],
  'Emmentaler': [0, 0],
  'Mozzarella': [0, 0],
  'Mozzarella light': [0, 0],
  'Feta (Schafskäse)': [0, 0],
  'Parmesan': [0, 0.1],
  'Harzer Käse': [0, 0],
  'Butter': [0, 0.6],
  'Schlagsahne 30 %': [0, 3.3],
  'Saure Sahne 10 %': [0, 4.1],
  'Schmand 24 %': [0, 3],
  'Crème fraîche': [0, 2.5],
  'Proteinpudding': [0.5, 4],
  'Pudding (Schoko), fertig': [0.2, 12.1],
  'Ei': [0, 0.3],
  'Eiklar': [0, 0.4],
  'Spiegelei, in Fett gebraten': [0, 0.4],
  'Hähnchenbrust, roh': [0, 0],
  'Hähnchenbrust, gebraten': [0, 0],
  'Putenbrust, roh': [0, 0],
  'Hähnchenschenkel mit Haut, roh': [0, 0],
  'Rinderhackfleisch (20 % Fett), roh': [0, 0],
  'Rinderhackfleisch mager (5 % Fett), roh': [0, 0],
  'Hackfleisch gemischt, roh': [0, 0],
  'Rindersteak (Hüfte, Rumpsteak), roh': [0, 0],
  'Schweinefilet, roh': [0, 0],
  'Schweineschnitzel, roh': [0, 0],
  'Schweinenacken, roh': [0, 0],
  'Kasseler': [0, 0.6],
  'Schnitzel paniert, gebraten': [0.6, 0.5],
  'Frikadelle': [0.7, 0.8],
  'Gyros (Fleisch)': [0.3, 0.5],
  'Rindergulasch': [1.2, 4.5],
  'Frühstücksspeck (Bacon)': [0, 0.6],
  'Kochschinken': [0, 0.5],
  'Putenbrust-Aufschnitt': [0, 0],
  'Salami': [0.1, 0],
  'Leberwurst': [0.1, 0.2],
  'Fleischwurst (Lyoner)': [0, 0.2],
  'Wiener Würstchen': [0.3, 0.1],
  'Bratwurst': [0.1, 0],
  'Leberkäse': [0.1, 0],
  'Currywurst mit Soße': [0.7, 8],
  'Döner Kebab im Brot': [1.6, 1.1],
  'Lachs, roh': [0, 0],
  'Thunfisch im eigenen Saft (abgetropft)': [0, 0],
  'Thunfisch in Öl (abgetropft)': [0, 0],
  'Seelachs, roh': [0, 0],
  'Kabeljau, roh': [0, 0],
  'Garnelen, roh': [0, 0],
  'Fischstäbchen': [0.9, 1.1],
  'Matjesfilet': [0, 0],
  'Makrele, geräuchert': [0, 0],
  'Sushi (Maki)': [0.8, 0.4],
  'Linsen, roh': [17.6, 1.3],
  'Linsen, gekocht': [3, 0.4],
  'Kichererbsen (Dose, abgetropft)': [9.8, 1.2],
  'Kidneybohnen (Dose, abgetropft)': [11.2, 0.9],
  'Weiße Bohnen (Dose, abgetropft)': [8.8, 0.8],
  'Erbsen (TK)': [5.3, 5.4],
  'Edamame (TK)': [4.2, 1.3],
  'Tofu natur': [1.3, 0],
  'Räuchertofu': [1.3, 0],
  'Sojaschnetzel, trocken': [18.1, 13.5],
  'Falafel': [7.5, 1.7],
  'Hummus': [5.9, 0.7],
  'Erdnussbutter': [7.4, 11.7],
  'Erdnüsse, geröstet': [8.4, 4.9],
  'Mandeln': [10, 3.6],
  'Walnüsse': [4.6, 2.7],
  'Haselnüsse': [7.6, 3.9],
  'Cashewkerne': [3, 6.2],
  'Pistazien': [16.3, 6.6],
  'Nussmischung (Studentenfutter)': [6.2, 29.6],
  'Chiasamen': [40.2, 0.5],
  'Leinsamen': [22.7, 1.2],
  'Sonnenblumenkerne': [5.8, 3.5],
  'Kürbiskerne': [8.7, 1.3],
  'Kokosraspeln': [14.8, 7.1],
  'Apfel': [2.3, 10.5],
  'Banane': [2, 13.9],
  'Birne': [2.8, 10.1],
  'Orange': [2.2, 8.8],
  'Mandarine, Clementine': [1.7, 9.2],
  'Kiwi': [3.9, 10.1],
  'Erdbeeren': [2, 5.9],
  'Heidelbeeren': [4.9, 9.7],
  'Himbeeren': [4.7, 5.2],
  'Weintrauben': [0.6, 15.5],
  'Ananas': [1.4, 9.4],
  'Mango': [1.7, 11],
  'Wassermelone': [0.2, 6.7],
  'Pfirsich, Nektarine': [1.7, 7],
  'Kirschen': [1.9, 13.7],
  'Pflaumen': [1.7, 8.1],
  'Avocado': [4.1, 1.4],
  'Apfelmus, ungesüßt': [1.1, 11.1],
  'Rosinen': [5.4, 60.9],
  'Datteln, getrocknet': [11.2, 78.9],
  'Brokkoli': [3, 1.4],
  'Blumenkohl': [2.9, 2.2],
  'Paprika': [2.2, 6.2],
  'Tomate': [1.3, 3.2],
  'Gurke': [0.9, 2],
  'Karotte (Möhre)': [2.9, 6.4],
  'Zucchini': [1.1, 2],
  'Aubergine': [1.4, 2.7],
  'Spinat': [1.8, 0.8],
  'Blattsalat (Kopfsalat, Eisberg, Feldsalat)': [1.8, 1.6],
  'Rucola': [1.7, 0],
  'Zwiebel': [1.4, 6],
  'Champignons': [1.9, 0.2],
  'Mais (Dose, abgetropft)': [3.6, 6.2],
  'Grüne Bohnen': [1.9, 2.3],
  'Kohlrabi': [1.5, 3.7],
  'Rosenkohl': [4, 3.7],
  'Weißkohl, Rotkohl': [3, 4.4],
  'Sauerkraut': [2.1, 0.8],
  'Spargel': [1.3, 1.1],
  'Rote Bete, gekocht': [2.6, 10.4],
  'Kürbis (Hokkaido)': [0.8, 4.6],
  'Gemüsemischung (TK)': [2.9, 3.3],
  'Oliven': [1.6, 0],
  'Gewürzgurken': [0.9, 5.5],
  'Speiseöl (Olivenöl, Rapsöl, Sonnenblumenöl)': [0, 0],
  'Margarine': [0, 0],
  'Mayonnaise': [0.1, 0.4],
  'Ketchup': [1.8, 20.8],
  'Senf': [4.5, 2.8],
  'Pesto (Basilikum)': [2.1, 0.7],
  'Passierte Tomaten (Passata)': [1.8, 3.6],
  'Tomatensoße, fertig': [1.5, 5],
  'Sojasoße': [1.1, 4.9],
  'Balsamico-Essig': [0, 20],
  'Honig': [0, 70.8],
  'Marmelade, Konfitüre': [1.1, 56.3],
  'Nuss-Nougat-Creme': [3.5, 53.1],
  'Zucker': [0, 100],
  'Ahornsirup': [0, 59.9],
  'Vollmilchschokolade': [2.5, 51.4],
  'Zartbitterschokolade 70 %': [10.1, 30],
  'Gummibärchen': [1, 56.7],
  'Butterkekse': [2.4, 27.1],
  'Kartoffelchips': [4.8, 1.5],
  'Salzstangen': [4.2, 2.4],
  'Vanilleeis': [0.3, 18.1],
  'Rührkuchen, Marmorkuchen': [2, 20.6],
  'Käsekuchen': [1.3, 13.1],
  'Müsliriegel': [6.1, 18.7],
  'Proteinriegel': [6, 5],
  'Orangensaft': [0.3, 8.5],
  'Apfelsaft': [0.3, 9.6],
  'Apfelschorle': [0.2, 5.6],
  'Cola': [0, 10.3],
  'Cola zero, Light-Getränke': [0, 0],
  'Energy-Drink': [0, 11],
  'Bier (Pils)': [0, 0.1],
  'Weizenbier': [0, 0.1],
  'Bier, alkoholfrei': [0, 2.4],
  'Wein, trocken': [0, 0.7],
  'Kaffee, schwarz': [0.3, 0],
  'Cappuccino, Milchkaffee': [0.1, 4],
  'Proteinpulver (Whey)': [0, 5],
  'Proteinpulver, vegan': [5, 2],
  'Wasser, Tee (ungesüßt)': [0, 0],
  'Haferbrei (Porridge) mit Milch': [2.2, 4.2],
  'Spaghetti Bolognese': [1.2, 1.6],
  'Lasagne': [1.2, 3.1],
  'Pizza Margherita': [1.9, 1.6],
  'Pizza Salami': [1.7, 1.4],
  'Hamburger': [1.7, 3.7],
  'Cheeseburger': [1.2, 3.4],
  'Linseneintopf': [5.6, 1.7],
  'Kartoffelsalat mit Mayonnaise': [1.4, 1.1],
  'Kartoffelsalat mit Essig und Öl': [1.6, 1.2],
  'Puddingpulver Vanille (Speisestärke)': [1, 0],
  'Süßungsmittel (Erythrit, Streusüße)': [0, 0],
  'Kakaopulver (ungesüßt)': [29.7, 1],
  'Sweet-Chili-Soße': [1, 48],
  'Barbecue-Soße': [0.7, 19],
  'Kokosmilch (light)': [0.5, 1.5],
  'Tomatenmark': [4.7, 12.9],
  'Grünkohl': [8.4, 2.6],
  'Fenchel': [3.3, 3],
  'Staudensellerie': [2.6, 1.4],
  'Pak Choi, Chinakohl': [1.7, 1],
  'Lauch (Porree)': [2.2, 3.8],
  'Frühlingszwiebeln': [2.6, 2.8],
  'Tahin (Sesammus)': [8.2, 0.3],
  'Seitan': [2.1, 0.5],
  'Tempeh': [6, 0.5],
  'Schwarze Bohnen (Dose, abgetropft)': [8, 0.5],
  'Forelle, roh': [0, 0],
  'Räucherlachs': [0, 0.2],
  'Beef Jerky (Trockenfleisch)': [0.5, 10],
  'Bresaola (Rinderschinken)': [0, 0.5],
  'Lammfleisch mager (Keule, Schulter), roh': [0, 0],
  'Kalbsschnitzel, roh': [0, 0],
  'Rindfleisch mager (Gulasch, Schulter), roh': [0, 0],
  'Hähnchenschenkel ohne Haut, roh': [0, 0],
  'Putenhackfleisch, roh': [0, 0],
  'Kochsahne 15 %': [0, 4],
  'Halloumi': [0, 0],
  'Sojajoghurt natur': [0, 0.2],
  'Eiweißbrot (Proteinbrot)': [6.5, 3.9],
  'Gnocchi': [1.8, 0.4],
  'Reisnudeln, roh': [1.6, 0.3],
  'Mie-Nudeln, roh': [3.4, 1.6],
  'Linsennudeln, roh': [8, 2],
  'Polenta (Maisgrieß), roh': [9.4, 1.4],
  'Buchweizen, roh': [5.5, 1.1],
};

// zusätzliche Suchbegriffe (Wortanfang des Namens genügt nicht immer, z. B. „Käse“ → Gouda)
const FOOD_TAGS = [
  ['käse', ['Gouda', 'Emmentaler', 'Mozzarella', 'Mozzarella light', 'Parmesan', 'Feta (Schafskäse)', 'Frischkäse natur (Doppelrahm)']],
  ['fisch', ['Lachs, roh', 'Thunfisch im eigenen Saft (abgetropft)', 'Thunfisch in Öl (abgetropft)', 'Seelachs, roh', 'Kabeljau, roh', 'Matjesfilet', 'Makrele, geräuchert', 'Garnelen, roh']],
  ['fleisch huhn hühnchen chicken', ['Hähnchenbrust, roh', 'Hähnchenbrust, gebraten', 'Hähnchenschenkel mit Haut, roh']],
  ['fleisch', ['Putenbrust, roh', 'Rindersteak (Hüfte, Rumpsteak), roh', 'Schweinefilet, roh', 'Schweineschnitzel, roh', 'Schweinenacken, roh', 'Rinderhackfleisch (20 % Fett), roh', 'Rinderhackfleisch mager (5 % Fett), roh']],
  ['wurst aufschnitt', ['Salami', 'Kochschinken', 'Putenbrust-Aufschnitt', 'Frühstücksspeck (Bacon)']],
  ['eier rührei', ['Ei', 'Spiegelei, in Fett gebraten']],
  ['pasta spaghetti', ['Nudeln, roh', 'Nudeln, gekocht', 'Vollkornnudeln, roh']],
  ['kartoffel', ['Pommes frites, zubereitet', 'Kartoffelchips']],
  ['joghurt', ['Skyr natur']],
  ['nüsse', ['Mandeln', 'Walnüsse', 'Haselnüsse', 'Cashewkerne', 'Pistazien', 'Erdnüsse, geröstet']],
  ['brot', ['Laugenbrezel', 'Croissant', 'Baguette', 'Knäckebrot']],
  ['shake protein eiweiß', ['Proteinpulver (Whey)', 'Proteinpulver, vegan']],
  ['schokolade süßigkeiten', ['Gummibärchen', 'Nuss-Nougat-Creme']],
  ['salat', ['Rucola']],
];
const FOOD_TAG_MAP = new Map();
for (const [words, names] of FOOD_TAGS) for (const n of names) FOOD_TAG_MAP.set(n, ((FOOD_TAG_MAP.get(n) || '') + ' ' + words).trim());

// Alle bekannten Mahlzeiten in Tagesreihenfolge (Kennung → [Symbol, Name]). v291 (User-Wunsch): Anzahl einstellbar ab „Standard“
// (data.mealCfg = { n: 2–6, names: { Kennung: eigener Name } }); ohne Einstellung bzw. im Modus Einfach die vier bisherigen.
const MEALS = { b: ['🌅', 'Frühstück'], m1: ['🍽️', 'Erste Mahlzeit'], s1: ['🥨', 'Snack vormittags'], l: ['☀️', 'Mittagessen'],
  s: ['🍎', 'Snacks'], m2: ['🍽️', 'Zweite Mahlzeit'], d: ['🌙', 'Abendessen'], late: ['🌛', 'Spätmahlzeit'] };
const MEAL_TPL = { 2: ['m1', 'm2'], 3: ['b', 'l', 'd'], 4: ['b', 'l', 'd', 's'], 5: ['b', 's1', 'l', 's', 'd'], 6: ['b', 's1', 'l', 's', 'd', 'late'] };
const mealOn = () => typeof feat === 'function' && feat('nut-meals');
const mealN = () => { const n = mealOn() && data.mealCfg ? data.mealCfg.n : 4; return MEAL_TPL[n] ? n : 4; };
const mealKeys = () => MEAL_TPL[mealN()];
// [Symbol, Name]: eigener Name (ab Standard), bei 5/6 Mahlzeiten heißen die Snacks nach der Tageszeit
const mealStdName = k => k === 's' && mealN() >= 5 ? 'Snack nachmittags' : (MEALS[k] || ['', 'Mahlzeit'])[1];
function mealInfo(k) {
  const own = mealOn() && data.mealCfg && data.mealCfg.names && (data.mealCfg.names[k] || '').trim();
  return [(MEALS[k] || ['🍽️'])[0], own || mealStdName(k)];
}
// Einstellung „Mahlzeiten“ (Tagebuch → „⚙ Mahlzeiten anpassen“ und Optionen → Profil & Ernährung)
function mealCfgCard() {
  if (!mealOn()) return '';
  const n = mealN(), names = (data.mealCfg && data.mealCfg.names) || {};
  return `<div class="card meal-cfg">
      <h2>🍽️ Mahlzeiten</h2>
      <p class="hint">Wie viele Mahlzeiten isst du meist am Tag? Danach richtet sich dein Ernährungstagebuch.</p>
      <div class="variants meal-n">${[2, 3, 4, 5, 6].map(x => `<button class="vchip ${n === x ? 'on' : ''}" data-action="meal-n" data-n="${x}">${x}</button>`).join('')}</div>
      <p class="lbl">Namen</p>
      ${mealKeys().map(k => `<label class="row meal-name"><span aria-hidden="true">${MEALS[k][0]}</span>
        <input class="inp" type="text" data-field="meal-name" data-k="${k}" autocomplete="off" maxlength="30"
          value="${esc((names[k] || '').trim())}" placeholder="${esc(mealStdName(k))}"></label>`).join('')}
      <p class="hint nut-small">Leer lassen heißt Standardname, z. B. „Pre-Workout“ oder „Nach dem Training“ geht auch. Bisher Eingetragenes bleibt
        erhalten: Tage mit anderen Mahlzeiten zeigen diese weiterhin an.</p>
    </div>`;
}
const mealLabel = k => mealInfo(k)[1];
// Mahlzeit, wenn keine angegeben ist: die letzte (bisher „Snacks“)
const mealDefault = () => { const ks = mealKeys(); return ks.includes('s') ? 's' : ks[ks.length - 1]; };
// Mahlzeiten eines Tages: die eingestellten plus alle, die an dem Tag schon Einträge oder einen Plan haben (nichts verschwindet)
function dayMealKeys(list, plan) {
  const keys = mealKeys();  // Reihenfolge der Vorlage (bei 4 wie bisher: Snacks zuletzt), weitere des Tages danach
  const extra = new Set([...list.map(e => e.meal), ...Object.keys(plan || {})].filter(k => k in MEALS && !keys.includes(k)));
  return [...keys, ...Object.keys(MEALS).filter(k => extra.has(k))];
}

const FOOD_BASE_LIST = FOOD_BASE.map(([name, kcal, p, c, f, pl, pg]) => (
  { key: 'b:' + name, name, brand: '', per: [kcal, p, c, f, ...(FOOD_BASE_FS[name] || [null, null])], portion: pl ? { label: pl, g: pg } : null, src: 'base', tags: FOOD_TAG_MAP.get(name) || '' }));
const FOOD_BASE_MAP = new Map(FOOD_BASE_LIST.map(f => [f.key, f]));
// Bundeslebensmittelschlüssel (bls.js, über 7000 Durchschnittswerte, key 'bls:' + BLS-Code): erst bei Bedarf aufbereitet
// Oberbegriffe je BLS-Hauptgruppe (1. Buchstabe des Codes) – damit „Obst“, „Fisch“, „Nudeln“ … auch passende Einträge finden
const BLS_GROUP_TAGS = { B: 'brot', C: 'getreide', D: 'kuchen gebäck', E: 'nudeln pasta', F: 'obst', G: 'gemüse',
  H: 'hülsenfrüchte nüsse', K: 'kartoffeln pilze', M: 'milchprodukte', N: 'getränke', P: 'alkohol', Q: 'fett öl',
  R: 'gewürze', S: 'süßigkeiten', T: 'fisch', U: 'fleisch', V: 'fleisch geflügel', W: 'wurst aufschnitt', X: 'gericht', Y: 'gericht' };
let foodBls = null;
// v306: bls.js steht nicht mehr in index.html, sondern wird nach dem Start nachgeladen (schnellerer Start).
// Wird die Liste vorher gebraucht, kommt sie leer zurück; sobald die Datei da ist, wird neu gezeichnet.
let blsWanted = false;
function blsEnsure() {
  if (typeof BLS_DATA === 'string') return Promise.resolve();
  return loadScript(i18nSrc('bls.js')).then(() => {
    foodBls = null;
    if (typeof i18nFoodReg === 'function' && typeof FOOD_EN !== 'undefined') i18nFoodReg();  // englische BLS-Namen
    if (blsWanted && typeof render === 'function') { blsWanted = false; try { render(); } catch (e) { /* nichts */ } }
  }).catch(() => { /* offline und nicht im Cache: beim nächsten Bedarf neu versuchen */ });
}
function foodBlsList() {
  if (foodBls) return foodBls;
  if (typeof BLS_DATA !== 'string') { blsWanted = true; blsEnsure(); return { list: [], map: new Map() }; }
  foodBls = { list: [], map: new Map() };
  for (const line of BLS_DATA.split('\n')) {
    const [code, name, kcal, p, c, f, fib, sug] = line.split('|');
    if (!name) continue;
    const tags = (BLS_GROUP_TAGS[code[0]] || '') + (/Fett i\. Tr\./.test(name) ? ' käse' : '');
    const it = { key: 'bls:' + code, name, brand: '', per: [+kcal, +p, +c, +f, +fib, +sug], portion: null, src: 'bls', tags };
    foodBls.list.push(it);
    foodBls.map.set(it.key, it);
  }
  return foodBls;
}
// fest eingebaut (Grundliste oder BLS): in data.foods nur { fav, last }
const foodBuiltin = f => f.src === 'base' || f.src === 'bls';
const FOOD_TEXT = new WeakMap();  // Suchtext je fest eingebautem Lebensmittel
const foodCache = new Map();  // Treffer aus Open Food Facts, die noch nicht gemerkt sind

let foodQuery = '';     // Suchtext beim Hinzufügen
let foodOnline = null;  // Online-Suche: { q, status: 'loading' | 'done' | 'error', hits }
let foodAmt = null;     // Menge-Seite: { for, g (Text), meal }
let foodForm = null;    // Formular „Eigenes Lebensmittel“

// Lebensmittel zu einem Schlüssel (Grundliste mit gemerkten Angaben wie Favorit, sonst gemerkt oder aus der Online-Suche)
function foodGet(key) {
  const m = data.foods[key];
  const b = FOOD_BASE_MAP.get(key) || (String(key).startsWith('bls:') ? foodBlsList().map.get(key) : null);
  if (b) return { ...b, fav: !!(m && m.fav), last: m && m.last };
  return m || foodCache.get(key) || null;
}

// Als „zuletzt gegessen“ merken (Grundliste: nur Zeitpunkt und Favorit)
function foodRemember(f, extra = {}) {
  const old = data.foods[f.key] || {};
  data.foods[f.key] = foodBuiltin(f)
    ? { fav: !!old.fav, last: Date.now(), ...extra }
    : { key: f.key, name: f.name, brand: f.brand || '', per: f.per, portion: f.portion || null, code: f.code || null,
        src: f.src, ...(f.mic ? { mic: f.mic } : {}), ...(f.supp ? { supp: true } : {}), fav: !!old.fav, last: Date.now(), ...extra };
}

const foodVal = (per, g) => per.map(v => (v || 0) * g / 100);
// Ballaststoffe und Zucker je 100 g eines Eintrags; ältere Einträge aus den festen Listen (Grundliste, BLS) bekommen sie
// aus der Liste nachgereicht. null = unbekannt (z. B. ältere Markenprodukte, eigene Lebensmittel ohne Angabe)
function foodFS(e) {
  const per = e.per || [];
  if (per[4] != null || per[5] != null) return [per[4] || 0, per[5] || 0];
  if (/^(b|bls):/.test(e.key || '')) {
    const f = foodGet(e.key);
    if (f && f.per[4] != null) return [f.per[4], f.per[5] || 0];
  }
  return null;
}
// Summe: kcal und Makros; dazu Ballaststoffe/Zucker der Einträge mit Angabe und miss = Einträge ohne (ohne „Aufgefüllt“)
function foodTotals(list) {
  const t = [0, 0, 0, 0];
  let fib = 0, sug = 0, miss = 0;
  for (const e of list) {
    foodVal(e.per.slice(0, 4), e.g).forEach((v, i) => { t[i] += v; });
    if (e.key === FOOD_FILL) continue;
    const fs = foodFS(e);
    if (!fs) { miss++; continue; }
    fib += fs[0] * e.g / 100;
    sug += fs[1] * e.g / 100;
  }
  return { kcal: t[0], p: t[1], c: t[2], f: t[3], fib, sug, miss };
}
const foodOn = date => data.foodLog.filter(e => e.date === date);

// Tagessumme in data.intake übernehmen (src 'food') bzw. entfernen, wenn der Tag leer ist
function foodSync(date) {
  const list = foodOn(date);
  if (list.length) {
    const t = foodTotals(list);
    saveIntake(date, { kcal: Math.round(t.kcal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f) }, 'food');
  } else if ((intakeOn(date) || {}).src === 'food') {
    data.intake = data.intake.filter(x => x.date !== date);
  }
}

const FOOD_FILL = 'fill';  // Eintrag „Nicht erfasst (aufgefüllt)“
const foodClosed = date => !!data.foodClosed[date];

// Änderung an einem abgeschlossenen Tag: wieder öffnen (Auffüllung passt dann nicht mehr) – true, wenn er zu war
function foodReopen(date) {
  if (!foodClosed(date)) return false;
  delete data.foodClosed[date];
  data.foodLog = data.foodLog.filter(e => !(e.date === date && e.key === FOOD_FILL));
  return true;
}
const foodReopenToast = () => toast('Tag wieder geöffnet. Schließ ihn am Ende neu ab');

// Rest bis zum Tagesziel (null ohne Ziel oder wenn nichts fehlt)
function foodRest(date) {
  const c = foodGoal(date);
  if (!c) return null;
  const t = foodTotals(foodOn(date).filter(e => e.key !== FOOD_FILL));
  const r = { kcal: Math.round(c.kcal - t.kcal), p: Math.max(0, Math.round(c.protein - t.p)), c: Math.max(0, Math.round(c.carbs - t.c)), f: Math.max(0, Math.round(c.fat - t.f)) };
  return r.kcal >= 50 ? r : null;
}

// Mahlzeiten, die an diesem Tag leer sind, aber sonst fast immer eingetragen werden (letzte 14 Tage mit Einträgen)
function foodUsualMissing(date) {
  const days = [];
  for (let i = 1; i <= 14; i++) { const d = addDaysISO(date, -i); const l = foodOn(d); if (l.length) days.push(l); }
  if (days.length < 5) return [];
  const today = foodOn(date);
  return mealKeys().filter(k => !today.some(e => e.meal === k)
    && days.filter(l => l.some(e => e.meal === k)).length / days.length >= 0.8).map(k => mealLabel(k));
}

// Tag abschließen (fill: Rest mit dem Tagesziel auffüllen)
function foodCloseDay(date, fill) {
  foodReopen(date);
  const r = fill ? foodRest(date) : null;
  if (r) data.foodLog.push({ id: uid(), date, meal: 'f', key: FOOD_FILL, name: 'Nicht erfasst (aufgefüllt)', brand: '', g: 100, per: [r.kcal, r.p, r.c, r.f] });
  data.foodClosed[date] = true;
  foodSync(date);
}

// vergangene Tage (letzte 7) mit Einträgen, die noch nicht abgeschlossen sind – neueste zuerst
function foodOpenDays() {
  if (nutPaused()) return [];  // Phase unterbrochen: keine Erinnerungen
  const out = [];
  for (let i = 1; i <= 7; i++) { const d = addDaysISO(todayISO(), -i); if (!foodClosed(d) && foodOn(d).length && !nutPausedOn(d)) out.push(d); }
  return out;
}

// Karte „Tag noch nicht abgeschlossen“ (Ernährungs-Reiter und Tagebuch)
function foodOpenCard() {
  const open = foodOpenDays();
  if (!open.length) return '';
  const d = open[0];
  const label = d === addDaysISO(todayISO(), -1) ? 'Gestern' : new Date(d + 'T12:00:00').toLocaleDateString(LOCALE(), { weekday: 'long', day: 'numeric', month: 'numeric' });
  const t = foodTotals(foodOn(d));
  const rest = foodRest(d);
  const miss = foodUsualMissing(d);
  return `<div class="card food-opencard">
      <p><b>📋 ${label} ist noch nicht abgeschlossen</b></p>
      <p class="hint nut-small">Eingetragen: ${nutKcal(t.kcal)} kcal.${miss.length ? ` ${miss.join(' und ')} ${miss.length > 1 ? 'sind' : 'ist'} leer, sonst trägst du ${miss.length > 1 ? 'sie' : 'es'} fast immer ein.` : ''}
        Erst abgeschlossene Tage zählen für den gemessenen Bedarf.${open.length > 1 ? ` Noch ${open.length - 1} weitere${open.length > 2 ? '' : 'r'} Tag${open.length > 2 ? 'e' : ''} offen.` : ''}</p>
      <button class="btn primary" data-action="food-close" data-date="${d}" data-fill="0">✔ Alles eingetragen</button>
      ${rest ? `<button class="btn" data-action="food-close" data-date="${d}" data-fill="1">➕ Rest mit Tagesziel auffüllen (+${nutKcal(rest.kcal)} kcal)</button>` : ''}
      <button class="btn center" data-action="food-open" data-date="${d}">Tag ansehen</button>
    </div>`;
}

let foodCloseAsk = null;  // Datum, für das die Frage „Alles eingetragen?“ offen ist

function foodCloseHtml(date, list) {
  const real = list.filter(e => e.key !== FOOD_FILL);
  if (foodClosed(date)) {
    const fill = list.find(e => e.key === FOOD_FILL);
    return `<div class="card food-closed">
        <p><b>✔ Tag abgeschlossen</b>${fill ? ` | Rest aufgefüllt (${nutKcal(fill.per[0])} kcal)` : ''}</p>
        <button class="btn" data-action="food-reopen">Wieder öffnen</button></div>`;
  }
  // v335 (User-Wunsch): mit Einträgen schließt der Knopf direkt ab; die Nachfrage kommt nur, wenn der Tag offen bleibt (foodOpenCard am Folgetag)
  if (foodCloseAsk !== date) {
    return real.length ? `<button class="btn primary food-close-btn" data-action="food-close" data-fill="0">✔ Tag abschließen</button>`
      : `<button class="btn primary food-close-btn" data-action="food-close-ask">✔ Tag abschließen</button>`;
  }
  const rest = foodRest(date);
  const miss = foodUsualMissing(date);
  const c = foodGoal(date);
  return `<div class="card food-close">
      <p><b>Hast du ${date === todayISO() ? 'heute' : 'an diesem Tag'} alles eingetragen?</b></p>
      ${miss.length ? `<p class="food-miss">⚠️ ${miss.join(' und ')} ${miss.length > 1 ? 'sind' : 'ist'} leer, sonst trägst du ${miss.length > 1 ? 'sie' : 'es'} fast immer ein.</p>` : ''}
      <p class="hint nut-small">Eingetragen: ${nutKcal(foodTotals(real).kcal)} kcal${c ? ` | Tagesziel ${nutKcal(c.kcal)} kcal` : ''}.</p>
      ${real.length ? '<button class="btn primary" data-action="food-close" data-fill="0">✔ Ja, alles eingetragen</button>' : ''}
      ${rest ? `<button class="btn" data-action="food-close" data-fill="1">➕ Rest mit Tagesziel auffüllen (+${nutKcal(rest.kcal)} kcal)</button>
        <p class="hint nut-small">Für Tage, an denen du nicht alles aufgeschrieben hast: Die App ergänzt, was bis zu deinem Tagesziel fehlt
          (auch Eiweiß, Kohlenhydrate und Fett). So bleibt der gemessene Bedarf genau, statt durch fehlende Einträge zu niedrig zu werden.</p>` : ''}
      <button class="btn center" data-action="food-close-cancel">Abbrechen</button>
    </div>`;
}

const foodNum = v => fmtNum(round1(v));
const foodKcal = v => deNum(Math.round(v || 0));
function foodDayLabel(date) {
  const long = new Date(date + 'T12:00:00').toLocaleDateString(LOCALE(), { weekday: 'short', day: 'numeric', month: 'short' });
  const rel = date === todayISO() ? 'Heute' : date === addDaysISO(todayISO(), -1) ? 'Gestern' : '';
  return rel ? `${rel}<small>${long}</small>` : long;
}

// v364: Trainingstag im Tagebuch (Plus aus „Mehr Kalorien an Trainingstagen“, siehe nutForDay)
function foodTrainLine(date, c) {
  if (typeof nutTdKcal !== 'function' || !nutTdKcal()) return '';
  if (c.train) return `<p class="nut-cardio fe-train">🏋️ Trainingstag: +${c.train} kcal im Tagesziel, vor allem als Kohlenhydrate.</p>`;
  return date === todayISO() ? `<p class="nut-cardio off fe-train">🏋️ Startest du heute ein Training, kommen automatisch ${nutTdKcal()} kcal dazu.</p>` : '';
}

// Tagesziel (falls die Ernährung eingerichtet ist)
function foodGoal(date = todayISO()) {
  if (nutPausedOn(date)) return null;  // Phase unterbrochen: kein Tagesziel
  if (typeof nutPlanActive === 'function' && nutPlanActive()) return nutForDay(null, date);  // Ernährungsplan
  const n = data.nutrition;
  const kg = nutWeight();
  return n && nutReady(n) && kg != null ? nutForDay(nutCalc(n, kg), date) : null;  // inkl. Cardio (wenn eingerechnet)
}

/* v243 (User 2026-11-14): Gegessen im Stil der Tagesziel-Karte – große kcal-Zahl, Makro-Kacheln mit Fortschritt, Anteile-Balken.
   Ersetzt im Tagebuch die schlichten Balken; „Heute gegessen“ steht nicht mehr im Reiter Ernährung. */
function foodEatenHtml(date, c) {
  const v = foodDayVals(date) || { kcal: 0, p: 0, c: 0, f: 0, src: null };
  const hints = nutHintsOn();
  const ok = (val, goal, tol, lo) => hints && goal && val != null && (lo != null ? val >= lo : Math.abs(val / goal - 1) <= tol);
  const pct = (a, b) => b ? Math.min(100, Math.round((a || 0) / b * 100)) : 0;
  // v305 (User-Wunsch): Saldo je Spalte – wie viel bis zum Tagesziel fehlt bzw. wie viel man drüber ist
  const bal = (val, target, unit, tol, fmt) => {
    if (!target) return '';
    const d = Math.round(target - (val || 0));
    const over = d < 0 && tol != null && -d > target * tol;
    return `<em class="fe-left${over ? ' over' : ''}">${d > 0 ? `noch ${fmt(d)} ${unit}` : d < 0 ? `${fmt(-d)} ${unit} drüber` : 'genau erreicht'}</em>`;
  };
  const tile = (k, label, val, goal, tol, lo = null) => `<div class="nut-macro ${k} fe-tile"><span>${label}</span>
      <b>${val != null ? deNum(Math.round(val)) : '–'} g</b><small>von ${lo != null ? `${deNum(lo)}+` : deNum(goal)} g${ok(val, goal, tol, lo) ? ' ✓' : ''}${bal(val, lo != null ? lo : goal, 'g', lo != null ? null : tol, deNum)}</small>
      <i class="fe-bar" aria-hidden="true"><i style="width:${pct(val, lo != null ? lo : goal)}%"></i></i></div>`;
  const all = feat('nut-macros');
  // v328 (User): Eiweiß-Ziel = aktuelles Ziel (auch eigene Aufteilung), nicht die Untergrenze der Empfehlung; mehr ist weiter ok
  const tiles = [tile('p', 'Eiweiß', v.p, c.protein, 0, c.protein)].concat(all ? [tile('f', 'Fett', v.f, c.fat, 0.25), tile('c', 'Kohlenhydrate', v.c, c.carbs, 0.25)] : []);
  const mk = (v.p || 0) * 4 + (v.f || 0) * 9 + (v.c || 0) * 4;
  const split = all && mk > 0 ? `<div class="nut-bar" aria-hidden="true">${[['p', (v.p || 0) * 4], ['f', (v.f || 0) * 9], ['c', (v.c || 0) * 4]]
    .map(([k, x]) => `<div class="${k}" style="flex:${x}"></div>`).join('')}</div>
    <p class="hint nut-small fe-split">Anteile: Eiweiß ${Math.round((v.p || 0) * 400 / mk)} %, Fett ${Math.round((v.f || 0) * 900 / mk)} %, Kohlenhydrate ${Math.round((v.c || 0) * 400 / mk)} %</p>` : '';
  const src = v.src && v.src !== 'food' ? `<p class="hint nut-small">${{ health: 'Aus Health übernommen', auto: 'Mit dem Tagesziel nachgetragen' }[v.src] || 'Von Hand eingetragen'}</p>` : '';
  // v287 (User-Wunsch): Ziel direkt hinter der gegessenen Menge, gleich groß. v327: kein Stift mehr, angepasst wird über den Knopf darunter
  return `<span class="lbl">Gegessen${ok(v.kcal, c.kcal, 0.1) ? ' ✓' : ''}</span>
    <div class="nut-kcal-row fe-kcal"><b class="nut-kcal">${nutKcal(v.kcal || 0)} / ${nutKcal(c.kcal)} kcal</b></div>
    <div class="fe-kbar" aria-hidden="true"><div style="width:${pct(v.kcal, c.kcal)}%"></div></div>
    <p class="fe-kleft">${bal(v.kcal, c.kcal, 'kcal', 0.1, nutKcal)}</p>
    <div class="nut-macros${all ? '' : ' one'}">${tiles.join('')}</div>${split}${src}`;
}

// ohne Tagesziel: schlichte Tagessumme (mit Tagesziel zeigt das Tagebuch foodEatenHtml, v243)
function foodSumHtml(t) {
  return `<div class="nut-goal-row food-sum"><span>Kalorien<b>${nutKcal(t.kcal)}</b></span><span>Eiweiß<b>${Math.round(t.p)} g</b></span>
      <span>Kohlenh.<b>${Math.round(t.c)} g</b></span><span>Fett<b>${Math.round(t.f)} g</b></span></div>
    <p class="hint nut-small">Richte im Reiter „Ernährung“ dein Ernährungsziel und deine Angaben ein, dann siehst du hier dein Tagesziel.</p>`;
}

// Ballaststoffe und Zucker: nur zum Mitverfolgen – keine Tagesziele, aufklappbar ein paar grobe Richtwerte
function foodFsHtml(t, c) {
  const kcal = c && c.kcal ? Math.round(c.kcal / 100) * 100 : null;
  const miss = t.miss ? `<p class="hint nut-small">${t.miss === 1 ? '1 Eintrag hat' : `${t.miss} Einträge haben`} keine Angabe dazu
    (z. B. ältere Markenprodukte oder eigene Lebensmittel) und ${t.miss === 1 ? 'zählt' : 'zählen'} hier nicht mit.</p>` : '';
  return `<div class="food-fs"><span>🌾 Ballaststoffe <b>${Math.round(t.fib)} g</b></span><span>🍬 Zucker <b>${Math.round(t.sug)} g</b></span></div>
    ${miss}
    <details class="prog-help food-fs-help"><summary>ⓘ Grobe Richtwerte</summary>
      <p><b>Ballaststoffe:</b> Empfohlen sind mindestens 30 g am Tag; wer viel isst, orientiert sich grob an 10 g je 1.000 kcal${kcal > 3000
        ? ` (bei deinen rund ${fmtNum(kcal)} kcal also etwa ${Math.round(kcal / 100)} g)` : ''}. Viele kommen nur auf
        etwa 20 g. Gute Quellen: Vollkorn, Haferflocken, Hülsenfrüchte, Gemüse, Obst, Nüsse und Samen. Mehr ist meist gut.
        Langsam steigern und genug trinken, sonst kann es anfangs zwicken.</p>
      <p><b>Zucker:</b> Gezählt ist der gesamte Zucker, auch der aus Obst, Gemüse und Milch. Die Empfehlung, höchstens etwa 10 %
        der Kalorien als Zucker zu essen${kcal ? ` (bei dir rund ${Math.round(kcal / 40)} g)` : ' (bei 2.000 kcal rund 50 g)'},
        gilt nur für <i>zugesetzten</i> Zucker. Dazu zählen auch Honig, Sirup und Fruchtsaft. Den kann die App nicht getrennt
        ausweisen. Faustregel: Kommt der Zucker vor allem aus Obst und Milchprodukten, ist das unbedenklich; aus Süßigkeiten,
        Limo und Saft lohnt es sich, ihn im Blick zu behalten.</p>
      <p class="hint">Das sind keine Ziele, nur Anhaltspunkte. Die Werte sind Durchschnittswerte.</p>
    </details>`;
}

/* ----- Tagesansicht ----- */

function renderFood(p) {
  const date = p.date || todayISO();
  const list = foodOn(date);
  const yesterday = foodOn(addDaysISO(date, -1));
  const t = foodTotals(list);
  let h = `<div class="food-date">
      <button class="icon-btn" data-action="food-day" data-d="-1" aria-label="Vorheriger Tag">‹</button>
      <b>${foodDayLabel(date)}</b>
      <button class="icon-btn" data-action="food-day" data-d="1" ${date >= todayISO() ? 'disabled' : ''} aria-label="Nächster Tag">›</button>
    </div>
    <div class="row food-nav-btns"><button class="btn" data-action="food-cal">📅 Kalender</button>
      <button class="btn" data-action="food-stats">📊 Woche & Monat</button></div>
    <div class="card nut-intake food-eaten">${foodGoal(date) ? foodEatenHtml(date, foodGoal(date)) + foodTrainLine(date, foodGoal(date)) : foodSumHtml(t)}
      ${date === todayISO() && typeof nutGoalToolsHtml === 'function' ? nutGoalToolsHtml() : ''}</div>
    ${date === todayISO() ? foodOpenCard() : ''}`;
  // v336 (User-Wunsch): Mahlzeiten direkt unter Kalorien und Makros; Vitamine, Ballaststoffe/Zucker und „Aus Health“/„Von Hand“ darunter
  const extraHtml = `<div class="card food-extra">${typeof microBtnHtml === 'function' ? microBtnHtml() : ''}${list.some(e => e.key !== FOOD_FILL) ? foodFsHtml(t, foodGoal(date)) : ''}
      ${nutIntakeForm ? nutIntakeFormHtml() : `<div class="row fe-src-btns">${healthOn() ? '<button class="btn" data-action="health-paste">❤️ Aus Health</button>' : ''}
        <button class="btn" data-action="nut-intake-open" data-date="${date}">✏️ Von Hand</button></div>
      ${healthOn() ? healthPasteBox() + healthGuide() : ''}`}</div>`;
  const planDay = typeof nutPlanActive === 'function' && nutPlanActive() ? nutPlanDay(date)
    : typeof mgActive === 'function' && mgActive() ? mgDay(date, undefined, true) : null;  // v337 (v338: Rest des Tages neu gerechnet): von der App erstellter Plan (mealgen.js)
  const planMeals = (planDay && planDay.meals) || {};
  for (const k of dayMealKeys(list, planMeals)) {
    const [icon, label] = mealInfo(k);
    const items = list.filter(e => e.meal === k);
    const mt = foodTotals(items), kcal = mt.kcal;
    const prev = yesterday.filter(e => e.meal === k);
    // v356 (User-Wunsch): unter den Lebensmitteln klein die Summe der Mahlzeit mit Makros
    const sumHtml = items.some(e => !e.supp) ? `<p class="hint food-meal-sum">${nutKcal(kcal)} kcal | Eiweiß ${Math.round(mt.p)} g | KH ${Math.round(mt.c)} g | Fett ${Math.round(mt.f)} g</p>` : '';
    h += `<div class="card food-meal" data-meal="${k}">
        <div class="food-meal-head"><b>${icon} ${label}</b><span class="hint">${items.length ? nutKcal(kcal) + ' kcal' : ''}</span></div>
        ${items.map(e => `<div class="food-row">
          <button class="food-pick" data-action="food-entry" data-id="${e.id}">
            <span>${e.supp ? '💊 ' : ''}${esc(e.name)}<small>${e.brand ? esc(e.brand) + ' | ' : ''}${e.supp ? foodNum(e.g) + ' Stück' : amtTxt(e.g)}</small></span>
            <b>${e.supp ? 'Ergänzung' : foodKcal(foodVal(e.per, e.g)[0]) + ' kcal'}</b></button>
          <button class="icon-btn danger" data-action="food-del" data-id="${e.id}" aria-label="Entfernen">✕</button></div>`).join('')}
        ${sumHtml}
        ${!items.length && planMeals[k] && planDay.recipes && planDay.recipes[k] ? `<button class="mg-hint" data-action="mg-open-day" data-d="${date}">
            <span class="mg-hint-t">📋 ${esc(planDay.recipes[k].name)}</span><span class="mg-hint-i">${planMeals[k].map(i => `<span>${amtTxt(i.g)} <span>${esc(i.name)}</span></span>`).join(' | ')}</span></button>`
          : !items.length && planMeals[k] ? `<p class="hint nut-small np-plan-hint">📋 Plan: ${planMeals[k].map(i => `${esc(i.name)}${i.g ? ` ${amtTxt(i.g)}` : ''}`).join(' | ')}</p>` : ''}
        <div class="row">
          ${!items.length && planMeals[k] ? `<button class="btn primary" data-action="food-plan-meal" data-meal="${k}">✔ Wie geplant</button>` : ''}
          <button class="btn" data-action="food-add" data-meal="${k}">＋ Hinzufügen</button>
          ${!items.length && prev.length ? `<button class="btn" data-action="food-copy" data-meal="${k}">↺ Wie gestern</button>` : ''}
          ${items.length ? `<button class="btn food-save-btn" data-action="food-meal-save" data-meal="${k}">💾 Mahlzeit speichern</button>` : ''}
        </div>
      </div>`;
  }
  const fill = list.find(e => e.key === FOOD_FILL);
  if (fill) {
    const [kc, pr, ca, fa] = fill.per;
    h += `<div class="card food-meal food-fill">
        <div class="food-meal-head"><b>➕ Aufgefüllt bis zum Tagesziel</b><span class="hint">${nutKcal(kc)} kcal</span></div>
        <p class="hint nut-small">Nicht erfasst, geschätzt: Eiweiß ${pr} g | Kohlenhydrate ${ca} g | Fett ${fa} g</p></div>`;
  }
  h += extraHtml;
  h += waterHtml(date);
  h += foodCloseHtml(date, list);
  if (mealOn()) h += `<button class="link-btn meal-cfg-link" data-action="meal-cfg-open">⚙ Mahlzeiten anpassen</button>`;
  return h + `<p class="hint explain nut-small">Die Tagessumme zählt automatisch für deinen Tagesvergleich, die letzten 14 Tage und den gemessenen
    Bedarf. Werte der Grundliste sind Durchschnittswerte. Bei Markenprodukten ist der Barcode genauer.</p>`;
}

/* ----- Wasser (v316): data.water = { Datum: ml }, data.waterGoal = ml oder null (dann 35 ml je kg Körpergewicht) ----- */
const WATER_OZ = 29.5735;
function waterGoal() {
  if (data.waterGoal) return data.waterGoal;
  const bw = data.bodyweight.filter(b => b.kg != null).sort((a, b) => a.date.localeCompare(b.date)).pop();
  if (!bw) return 2000;
  return Math.min(4000, Math.max(1500, Math.round(bw.kg * 35 / 250) * 250));
}
const waterTxt = ml => unitLb() ? `${Math.round(ml / WATER_OZ)} oz` : `${fmtNum(Math.round(ml / 10) / 100)} l`;
const waterSteps = () => unitLb() ? [Math.round(8 * WATER_OZ), Math.round(16 * WATER_OZ)] : [250, 500];
// v317: Getränke aus dem Tagebuch zählen mit (g ≈ ml): BLS-Gruppe Getränke (ohne Pulver u. Ä.), Milch und Milchgetränke,
// Getränke der Grundliste (Portion in ml/l). Alkohol zählt nicht.
const WATER_NO = /pulver|granulat|konzentrat|sirup|extrakt|bohne|blätter/i;
function foodDrinkMl(e) {
  if (!e || e.supp || e.key === FOOD_FILL || !(e.g > 0)) return 0;
  const k = e.key || '', n = e.name || '';
  if (k.startsWith('bls:N')) return WATER_NO.test(n) && !/getränk/i.test(n) ? 0 : e.g;
  if (k.startsWith('bls:M')) return /^(h-)?(voll|roh)?milch|^buttermilch|kefir|milchgetränk|drink/i.test(n) && !/pulver|kondens|käse|joghurt/i.test(n) ? e.g : 0;
  if (k.startsWith('b:')) {
    const f = FOOD_BASE_MAP.get(k);
    return f && f.portion && /ml\)|\d l\)/.test(f.portion.label) && !/^(bier \(pils\)|weizenbier|wein)/i.test(n) ? e.g : 0;
  }
  return 0;
}
function waterDay(date) {
  const own = data.water[date] || 0, drinks = Math.round(foodOn(date).reduce((a, e) => a + foodDrinkMl(e), 0));
  return { own, drinks, total: own + drinks };
}
function waterHtml(date) {
  const { own, drinks, total: ml } = waterDay(date), goal = waterGoal(), pct = Math.min(100, Math.round(ml / goal * 100));
  const [s1, s2] = waterSteps();
  return `<div class="card food-meal water-card">
      <div class="food-meal-head"><b>💧 Wasser</b><span class="hint">${ml >= goal ? '✔ ' : ''}${waterTxt(ml)} von ${waterTxt(goal)}</span></div>
      <div class="water-bar${ml >= goal ? ' done' : ''}"><span style="width:${pct}%"></span></div>
      ${drinks ? `<p class="hint nut-small water-drinks">Davon ${waterTxt(drinks)} aus Getränken im Tagebuch</p>` : ''}
      <div class="row water-btns">
        <button class="btn" data-action="water-add" data-ml="${s1}">＋ ${waterTxt(s1)}</button>
        <button class="btn" data-action="water-add" data-ml="${s2}">＋ ${waterTxt(s2)}</button>
        <button class="btn" data-action="water-more">＋ Menge</button>
        <button class="icon-btn" data-action="water-add" data-ml="${-s1}" ${own ? '' : 'disabled'} aria-label="Ein Glas weniger">−</button>
      </div>
      <button class="link-btn water-goal-btn" data-action="water-goal">Tagesziel ${waterTxt(goal)}${data.waterGoal ? '' : ' (aus deinem Gewicht)'}, ändern</button>
    </div>`;
}
function waterSet(date, ml) {
  const before = waterDay(date).total, goal = waterGoal();
  ml = Math.max(0, Math.min(15000, Math.round(ml)));
  if (ml) data.water[date] = ml; else delete data.water[date];
  saveData();
  if (before < goal && waterDay(date).total >= goal) toast('💧 Wasserziel geschafft ✔');
  render();
}

/* ----- Hinzufügen: Suche ----- */

function foodHit(f) {
  return `<button class="btn nav food-hit" data-action="food-pick" data-key="${esc(f.key)}">
      <span class="lib-txt">${f.fav ? '⭐ ' : ''}${f.supp ? '💊 ' : ''}${esc(f.name)}<small>${f.brand ? esc(f.brand) + ' | ' : ''}${f.supp ? 'Nahrungsergänzung'
        : `je 100 g: ${foodKcal(f.per[0])} kcal | ${foodMacroMini(f.per)}`}</small></span></button>`;
}
// v257 (User 2026-11-14): Schnellansicht in der Suche mit allen Makros, nicht nur Eiweiß
function foodMacroMini(per) {
  const g = v => v == null || isNaN(v) ? '–' : foodNum(v) + ' g';
  return `Eiweiß ${g(per[1])} | KH ${g(per[2])} | Fett ${g(per[3])}`;
}

// Suchtext: Name, Name ohne Leerzeichen (so findet „Hähnchenbrust“ auch „Hähnchen Brust, ohne Haut, roh“ aus dem BLS),
// Zusatzbegriffe und alles zusammen (mit Marke)
// v279: auf Englisch zählt der englische Name (food-en.js), der deutsche bleibt zusätzlich im Suchtext
const FOOD_TAGS_EN = { brot: 'bread', getreide: 'grain cereal', kuchen: 'cake', 'gebäck': 'pastry baked goods', nudeln: 'noodles', pasta: 'pasta',
  obst: 'fruit', 'gemüse': 'vegetables', 'hülsenfrüchte': 'legumes pulses beans', 'nüsse': 'nuts', kartoffeln: 'potatoes', pilze: 'mushrooms',
  milchprodukte: 'dairy', 'getränke': 'drinks', alkohol: 'alcohol', fett: 'fat', 'öl': 'oil', 'gewürze': 'spices', 'süßigkeiten': 'sweets',
  fisch: 'fish', fleisch: 'meat', 'geflügel': 'poultry', wurst: 'sausage', aufschnitt: 'cold cuts', gericht: 'dish meal', 'käse': 'cheese' };
function foodText(f) {
  const en = LANG !== 'de' && typeof i18nFull === 'function' ? i18nFull(f.name) : null;
  const name = norm(en || f.name), compact = name.replace(/\s+/g, '');
  let tags = norm(f.tags || '');
  if (en) tags += ' ' + norm((f.tags || '').split(/\s+/).map(w => FOOD_TAGS_EN[w] || '').join(' '));
  return { name, compact, tags, text: name + ' ' + norm(f.brand || '') + ' ' + tags + ' ' + name.replace(/[\s,/()-]+/g, '') + (en ? ' ' + norm(f.name) : '') };
}
// Suchwort und seine Einzahl-Formen (der BLS nennt „Linse“, „Tomate“, „Kartoffel“ – gesucht wird oft „Linsen“ …)
function foodStems(w) {
  const v = [w];
  if (w.length >= 5 && w.endsWith('n')) v.push(w.slice(0, -1));
  if (w.length >= 6 && w.endsWith('en')) v.push(w.slice(0, -2));
  if (LANG !== 'de' && w.length >= 4 && w.endsWith('s')) v.push(w.slice(0, -1), w.endsWith('es') ? w.slice(0, -2) : w);  // eggs → egg, tomatoes → tomato
  return v;
}
const reEsc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Wie gut passt das (erste) Suchwort? Kleiner = besser. Im Deutschen steckt die Bedeutung am Wortende:
// „Butterkäse“ ist ein Käse, „Käsekuchen“ nicht – daher Wortende vor zusammengesetztem Wortanfang.
function foodWordScore(t, w, base) {
  const letter = ch => !!ch && /[a-z]/.test(ch);
  if (t.name.startsWith(w) && !letter(t.name[w.length])) return 0;        // „Apfel“, „Apfel roh“
  if (t.compact.startsWith(w) && !letter(t.compact[w.length])) return 0.1;  // „Hafer Flocken“ für „Haferflocken“
  if (base && new RegExp('(^|\\s)' + reEsc(w)).test(t.tags)) return 0.3;    // Zusatzbegriffe der Grundliste („Käse“ → Gouda)
  if (new RegExp(reEsc(w) + '($|[^a-z])').test(t.name)) return 0.5;         // Wortende: „Butterkäse“, „Rind Hackfleisch“
  if (t.name.startsWith(w)) return 0.6;                                    // zusammengesetzt: „Apfelsaft“
  if (new RegExp('(^|\\s)' + reEsc(w)).test(t.tags)) return 0.65;         // Oberbegriff der BLS-Gruppe
  if (new RegExp('(^|[\\s(,/-])' + reEsc(w)).test(t.name)) return 0.8;    // anderes Wort beginnt so
  return 2;
}
// Reihenfolge: eigene/gemerkte und Grundliste vor BLS; Favoriten und zuletzt Gegessenes nach oben;
// im BLS frische vor tiefgefrorenen Varianten; dann kürzere Namen zuerst
function foodSearch(q) {
  const words = norm(q).split(/\s+/).filter(Boolean).map(foodStems);
  if (!words.length) return [];
  const full = norm(q).trim().replace(/\s+/g, ' ');
  const hits = [];
  const check = (f, cached) => {
    const ver = LANG + (typeof I18N_FULL !== 'undefined' ? I18N_FULL.size : 0);  // neu nach Sprachwechsel / Laden von food-en.js
    let t = cached ? FOOD_TEXT.get(f) : null;
    if (!t || t.ver !== ver) { t = foodText(f); t.ver = ver; if (cached) FOOD_TEXT.set(f, t); }
    if (!words.every(v => v.some(w => t.text.includes(w)))) return;
    const g = cached ? foodGet(f.key) : f;
    const bls = f.src === 'bls';
    const ws = Math.min(...words[0].filter(w => t.text.includes(w)).map(w => foodWordScore(t, w, !bls)));
    const score = (t.name === full ? -0.3 : 0) + ws - (g.last ? 0.5 : 0) - (g.fav ? 0.5 : 0)
      + (bls ? 0.6 + (/tiefgefroren|\bfrozen\b/.test(t.name) ? 0.3 : 0) : 0);
    hits.push([score, g]);
  };
  for (const key of Object.keys(data.foods)) {
    const f = foodGet(key);
    if (f && !foodBuiltin(f)) check(f, false);
  }
  for (const f of FOOD_BASE_LIST) check(f, true);
  for (const f of foodBlsList().list) check(f, true);
  return hits.sort((a, b) => a[0] - b[0] || a[1].name.length - b[1].name.length).slice(0, 50).map(x => x[1]);
}

// Mahlzeit, zu der eine gespeicherte Mahlzeit gehört: gespeichert (ab v343), sonst am Namen erkennbar (Vorschlag beim Speichern)
function foodMealOf(m) {
  if (m.meal && MEALS[m.meal]) return m.meal;
  return Object.keys(MEALS).find(k => norm(m.name) === norm(mealLabel(k)) || norm(m.name) === norm(MEALS[k][1])) || null;
}
function foodMealRow(m) {
  const kcal = foodTotals(m.items).kcal;
  return `<div class="food-savedmeal">
      <button class="btn food-hit" data-action="food-meal-add" data-id="${m.id}">
        <span class="lib-txt">🍽️ ${esc(m.name)}<small>${m.items.length} Lebensmittel | ${nutKcal(kcal)} kcal | antippen zum Hinzufügen</small></span></button>
      <button class="icon-btn" data-action="food-meal-rename" data-id="${m.id}" aria-label="Umbenennen">✎</button>
      <button class="icon-btn danger" data-action="food-meal-delete" data-id="${m.id}" aria-label="Löschen">✕</button>
    </div>`;
}

function foodResults() {
  const q = foodQuery.trim();
  // v343 (User): zuerst die Mahlzeiten, die bei dieser Mahlzeit (z. B. Frühstück) gespeichert wurden, darunter die übrigen
  const cur = MEALS[current.params.meal] ? current.params.meal : null;
  const meals = data.foodMeals.filter(m => !q || norm(m.name).includes(norm(q)));
  const own = cur ? meals.filter(m => foodMealOf(m) === cur) : [], rest = meals.filter(m => !own.includes(m));
  const mealsHtml = meals.length ? `<p class="food-sec">🍽️ Gespeicherte Mahlzeiten</p>${own.map(foodMealRow).join('')}${own.length && rest.length
      ? `<p class="hint nut-small food-sec-sub">Von anderen Mahlzeiten</p>` : ''}${rest.map(foodMealRow).join('')}`
    : !q && !data.foodMeals.length ? `<p class="hint nut-small food-meal-tip">🍽️ Isst du etwas öfter? Trag die Mahlzeit einmal ein und tipp im Tagebuch
        auf „💾 Mahlzeit speichern“. Du gibst ihr einen eigenen Namen, danach steht sie hier ganz oben und ist mit einem Tipp eingetragen.</p>` : '';
  if (!q) {
    const known = Object.keys(data.foods).map(foodGet).filter(f => f && (f.last || f.fav));
    const favs = known.filter(f => f.fav).sort((a, b) => a.name.localeCompare(b.name, 'de'));
    const recent = known.filter(f => !f.fav).sort((a, b) => b.last - a.last).slice(0, 25);
    if (!favs.length && !recent.length) {
      return mealsHtml + `<p class="hint explain">Tipp den Namen ein, z. B. „Haferflocken“ oder „Skyr“. Die App sucht in über 7.000 Lebensmitteln
        mit Durchschnittswerten (eigene Grundliste und Bundeslebensmittelschlüssel), auf Wunsch auch online in Open Food Facts
        (viele Markenprodukte). Oder scanne den Barcode auf der Verpackung.</p>
        <p class="hint nut-small">Quelle der Durchschnittswerte u. a.: Max Rubner-Institut, Bundeslebensmittelschlüssel (BLS) 4.0.</p>`;
    }
    return mealsHtml + (favs.length ? `<p class="food-sec">⭐ Favoriten</p>${favs.map(foodHit).join('')}` : '')
      + (recent.length ? `<p class="food-sec">🕘 Zuletzt gegessen</p>${recent.map(foodHit).join('')}` : '');
  }
  const hits = foodSearch(q);
  let h = mealsHtml + (hits.length ? hits.map(foodHit).join('') : `<p class="hint">„${esc(q)}“ ist nicht in der Lebensmittelliste. Versuch es mit einem anderen Wort, z. B. nur „Brot“ statt „Dinkelvollkornbrot“.</p>`);
  const on = foodOnline && foodOnline.q === q ? foodOnline : null;
  h += '<p class="food-sec">🌐 Open Food Facts (online)</p>';
  if (!on) {
    h += `<button class="btn outline" data-action="food-online">„${esc(q)}“ online suchen</button>`;
  } else if (on.status === 'loading') {
    h += '<p class="hint">Suche läuft …</p>';
  } else if (on.status === 'error') {
    // v325: Meist liegt es nicht am Handy: Die Namenssuche von Open Food Facts ist gestört, die Barcode-Abfrage geht trotzdem
    h += navigator.onLine === false
      ? `<p class="hint">Du bist gerade offline. Die Online-Suche braucht Internet.</p>
        <button class="btn outline" data-action="food-online">Nochmal versuchen</button>`
      : `<p class="hint">Die Namenssuche von Open Food Facts ist gerade gestört. Das liegt nicht an deinem Internet. Mit dem Barcode
          findest du das Produkt trotzdem: scannen oder die Nummer unter dem Strichcode eintippen.</p>
        <div class="row"><button class="btn" data-action="food-scan">📷 Barcode scannen</button>
          <button class="btn" data-action="scan-type">🔢 Nummer eintippen</button></div>
        <button class="btn outline" data-action="food-online">Suche nochmal versuchen</button>`;
  } else {
    h += on.hits.length ? on.hits.map(foodHit).join('') : '<p class="hint">Online nichts gefunden. Leg das Lebensmittel einfach selbst an.</p>';
  }
  return h;
}

function foodRefresh() {
  const el = current.view === 'foodadd' && $view.querySelector('#food-results');
  if (el) el.innerHTML = foodResults();
}

function renderFoodAdd() {
  return `<input class="inp lib-search" type="search" enterkeyhint="search" data-field="food-q" autocomplete="off" autocorrect="off"
      spellcheck="false" placeholder="Lebensmittel suchen …" value="${esc(foodQuery)}">
    <div class="row food-tools">
      <button class="btn" data-action="food-scan">📷 Barcode</button>
      <button class="btn" data-action="food-own">＋ Eigenes</button>
      ${typeof feat === 'function' && feat('nut-micro') ? '<button class="btn" data-action="supp-new">💊 Ergänzung</button>' : ''}
    </div>
    <div id="food-results">${foodResults()}</div>`;
}

/* ----- Open Food Facts ----- */

const OFF_FIELDS = 'code,product_name,product_name_de,generic_name,brands,nutriments,serving_quantity';

// path ohne Host: erst die deutsche Seite (die Suche klappt aus dem Browser nur dort), dann die internationale
async function offFetch(path) {
  let err;
  for (const host of ['https://de.openfoodfacts.org', 'https://world.openfoodfacts.org']) {
    try { return await offFetchUrl(host + path); } catch (e) { err = e; }
  }
  throw err;
}

async function offFetchUrl(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok && r.status !== 404) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

// Produkt aus Open Food Facts -> Lebensmittel (null ohne Name oder Kalorien)
function offFood(p) {
  const n = p.nutriments || {};
  let kcal = n['energy-kcal_100g'];
  if (kcal == null && n.energy_100g != null) kcal = n.energy_100g / 4.184;  // nur kJ angegeben
  const name = String(p.product_name_de || p.product_name || p.generic_name || '').trim();
  const brands = Array.isArray(p.brands) ? p.brands.join(',') : String(p.brands || '');
  const r1 = v => round1(Number(v) || 0);
  const opt = v => (v == null || v === '' || isNaN(Number(v)) ? null : round1(Number(v)));  // fehlt = unbekannt
  const sq = parseFloat(p.serving_quantity);
  return {
    key: 'off:' + p.code, code: String(p.code), name, brand: brands.split(',')[0].trim(), src: 'off',
    per: [kcal == null ? null : Math.round(kcal), r1(n.proteins_100g), r1(n.carbohydrates_100g), r1(n.fat_100g),
      opt(n.fiber_100g), opt(n.sugars_100g)],
    portion: sq > 0 && sq < 2000 ? { label: '1 Portion', g: Math.round(sq) } : null,
    ...(typeof offMicro === 'function' && offMicro(n) ? { mic: offMicro(n) } : {}),  // v214: Mikros, soweit angegeben
  };
}
const offUsable = f => f.name && f.per[0] != null;

// v325: Die alte Suche (cgi/search.pl) antwortet im Nov. 2026 etwa jedes zweite Mal mit 503 (dann aber schnell) – daher
// bis zu 6 Versuche im Wechsel deutsch/international mit kurzer Pause. Die neue Suche (search.openfoodfacts.org) erlaubt
// noch keine Abfragen aus dem Browser (kein CORS): einmal je Sitzung probieren, damit es von selbst klappt, sobald sie freigegeben ist.
let offNewSearchDead = false;
async function offSearch(q) {
  if (!offNewSearchDead) {
    try {
      const j = await offFetchUrl(`https://search.openfoodfacts.org/search?q=${encodeURIComponent(q + ' countries_tags:"en:germany"')}`
        + `&langs=de&page_size=25&fields=${OFF_FIELDS}`);
      if (j && Array.isArray(j.hits)) return j.hits;
    } catch (e) { offNewSearchDead = true; }
  }
  const path = '/cgi/search.pl?search_simple=1&action=process&json=1&page_size=25'
    + '&sort_by=unique_scans_n&tagtype_0=countries&tag_contains_0=contains&tag_0=en:germany'
    + `&search_terms=${encodeURIComponent(q)}&fields=${OFF_FIELDS}`;
  const hosts = ['https://de.openfoodfacts.org', 'https://world.openfoodfacts.org'];
  let err;
  for (let i = 0; i < 6; i++) {
    if (i) await new Promise(r => setTimeout(r, 300 * i));
    try { return (await offFetchUrl(hosts[i % 2] + path)).products || []; } catch (e) { err = e; }
  }
  throw err;
}

async function foodSearchOnline(q) {
  foodOnline = { q, status: 'loading', hits: [] };
  foodRefresh();
  try {
    const hits = (await offSearch(q)).map(offFood).filter(offUsable);
    hits.forEach(f => { if (!data.foods[f.key]) foodCache.set(f.key, f); });
    if (foodOnline && foodOnline.q === q) foodOnline = { q, status: 'done', hits: hits.map(f => foodGet(f.key) || f) };
  } catch (e) {
    if (foodOnline && foodOnline.q === q) foodOnline = { q, status: 'error', hits: [] };
  }
  foodRefresh();
}

// Barcode: erst bei den gemerkten Lebensmitteln, dann in Open Food Facts nachschlagen
async function foodByCode(code, scanned = false) {
  code = String(code).replace(/\D/g, '');
  if (!code) return;
  const p = { date: current.params.date, meal: current.params.meal };
  const known = Object.values(data.foods).find(f => f && f.code === code);
  if (known) { foodAmt = null; go('foodamt', { ...p, key: known.key }); return; }
  toast('Produkt wird gesucht …');
  let j;
  try {
    j = await offFetch(`/api/v2/product/${code}.json?fields=${OFF_FIELDS}`);
  } catch (e) {
    alert('Keine Verbindung zu Open Food Facts. Zum Nachschlagen eines Barcodes braucht die App Internet.');
    return;
  }
  const f = j && j.product ? offFood({ ...j.product, code }) : null;
  if (f && offUsable(f)) {
    foodCache.set(f.key, f);
    foodAmt = null;
    go('foodamt', { ...p, key: f.key });
    return;
  }
  const num = scanned ? `\n\nGescannte Nummer: ${code}. Stimmt sie nicht mit der Nummer unter dem Strichcode überein, tipp die Nummer lieber ein.` : '';
  alert((f ? `„${f.name || 'Dieses Produkt'}“ ist in Open Food Facts ohne Nährwerte eingetragen.`
    + '\n\nTrag die Werte einfach von der Verpackung ab (pro 100 g). Beim nächsten Scan kennt die App das Produkt.'
    : 'Dieses Produkt ist in Open Food Facts noch nicht eingetragen.\n\nTrag die Nährwerte einfach von der Verpackung ab (pro 100 g). Beim nächsten Scan kennt die App das Produkt.') + num);
  foodForm = foodFormFrom(f ? { ...f, key: null, per: f.per.map(v => v || null) } : { name: '', brand: '', per: [], code });
  go('foodown', p);
}

/* ----- Barcode-Scanner (Kamera) ----- */

let foodScan = null;  // { stop }
let foodScanTarget = null;  // v214: andere Verwendung des Codes (z. B. suppByCode), sonst foodByCode
const loadedScripts = {};
const loadScript = src => loadedScripts[src] || (loadedScripts[src] = new Promise((ok, fail) => {
  const s = document.createElement('script');
  s.src = src;
  s.onload = ok;
  s.onerror = () => { delete loadedScripts[src]; fail(new Error('Laden fehlgeschlagen: ' + src)); };
  document.head.appendChild(s);
}));

function foodScanClose() {
  if (foodScan) { try { foodScan.stop(); } catch (e) { /* schon beendet */ } }
  foodScan = null;
  const el = document.getElementById('scan');
  if (el) el.remove();
}

function foodScanDone(code) {
  if (!foodScan || foodScan.done) return;
  foodScan.done = true;
  if (navigator.vibrate) navigator.vibrate(60);
  foodScanClose();
  const to = foodScanTarget || foodByCode;
  foodScanTarget = null;
  to(code, true);
}

async function foodCodePrompt() {
  const code = await uiPrompt('Barcode-Nummer eintippen\n\nDie Ziffern unter dem Strichcode.', '', 'tel');
  const to = foodScanTarget || foodByCode;
  foodScanTarget = null;
  if (code && code.replace(/\D/g, '').length >= 6) to(code);
  else if (code) alert('Bitte die ganze Nummer eintippen (meist 13 Ziffern).');
}

// v325: Autofokus und (bei Handys mit mehreren Kameras) etwas Zoom, damit man nicht zu nah ran muss – nur wo das Handy es kann
function scanTune(stream) {
  const track = stream && stream.getVideoTracks && stream.getVideoTracks()[0];
  if (!track || typeof track.getCapabilities !== 'function') return;
  let cap = {};
  try { cap = track.getCapabilities() || {}; } catch (e) { return; }
  const adv = {};
  if (Array.isArray(cap.focusMode) && cap.focusMode.includes('continuous')) adv.focusMode = 'continuous';
  if (cap.zoom && cap.zoom.max >= 2) adv.zoom = Math.max(cap.zoom.min || 1, 2);
  if (Object.keys(adv).length) track.applyConstraints({ advanced: [adv] }).catch(() => {});
}

async function foodScanStart() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { foodCodePrompt(); return; }
  document.body.insertAdjacentHTML('beforeend', `<div class="scan" id="scan">
      <video playsinline muted autoplay></video><div class="scan-frame"></div>
      <p class="scan-msg">Barcode in den Rahmen halten, etwa 15 bis 20 cm Abstand</p>
      <div class="scan-btns"><button class="btn" data-action="scan-type">Nummer eintippen</button>
        <button class="btn" data-action="scan-close">Abbrechen</button></div></div>`);
  const video = document.querySelector('#scan video');
  const scan = foodScan = { stop: () => {} };
  const formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
  // v325: höhere Auflösung statt der üblichen 640 × 480 – kleine Barcodes werden sonst unscharf erkannt
  const cam = (w, h) => ({ video: { facingMode: { ideal: 'environment' }, width: { ideal: w }, height: { ideal: h } } });
  try {
    // Android/Chrome: eingebaute Erkennung; iPhone/Safari: Bibliothek ZXing (wird erst hier geladen)
    if ('BarcodeDetector' in window && (await BarcodeDetector.getSupportedFormats()).includes('ean_13')) {
      const stream = await navigator.mediaDevices.getUserMedia(cam(1920, 1080));
      scanTune(stream);
      let on = true;
      scan.stop = () => { on = false; stream.getTracks().forEach(t => t.stop()); };
      if (foodScan !== scan) { scan.stop(); return; }
      video.srcObject = stream;
      await video.play();
      const det = new BarcodeDetector({ formats });
      const loop = async () => {
        if (!on) return;
        try { const r = await det.detect(video); if (r.length) { foodScanDone(r[0].rawValue); return; } } catch (e) { /* nächstes Bild */ }
        setTimeout(loop, 150);
      };
      loop();
    } else {
      await loadScript('zxing.min.js');
      if (foodScan !== scan) return;
      const hints = new Map();
      hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS,
        [ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8, ZXing.BarcodeFormat.UPC_A, ZXing.BarcodeFormat.UPC_E]);
      hints.set(ZXing.DecodeHintType.TRY_HARDER, true);  // v325: gründlicher suchen
      const reader = new ZXing.BrowserMultiFormatReader(hints, 120);
      scan.stop = () => reader.reset();
      // v325: erst übernehmen, wenn zweimal hintereinander dieselbe Nummer gelesen wurde (ZXing verliest sich bei Unschärfe gelegentlich)
      let lastCode = null;
      await reader.decodeFromConstraints(cam(1280, 720), video, res => {
        if (!res) return;
        const c = res.getText();
        if (c === lastCode) foodScanDone(c); else lastCode = c;
      });
      if (foodScan !== scan) reader.reset();
      else if (video.srcObject) scanTune(video.srcObject);
    }
  } catch (e) {
    const wasOpen = foodScan === scan;
    foodScanClose();
    if (!wasOpen) return;
    alert(/NotAllowed|Permission/i.test(e && e.name + e.message)
      ? 'Die App darf die Kamera nicht benutzen. Du kannst den Zugriff in den Einstellungen erlauben oder die Barcode-Nummer eintippen.'
      : 'Die Kamera konnte nicht gestartet werden. Du kannst die Barcode-Nummer stattdessen eintippen.');
    foodCodePrompt();
  }
}

/* ----- Menge ----- */

function foodAmtSum(per, g) {
  const [kcal, p, c, f] = foodVal(per.slice(0, 4), g || 0);
  const fs = per[4] != null || per[5] != null;
  return `<div class="nut-goal-row food-sum"><span>Kalorien<b>${foodKcal(kcal)}</b></span><span>Eiweiß<b>${foodNum(p)} g</b></span>
    <span>Kohlenh.<b>${foodNum(c)} g</b></span><span>Fett<b>${foodNum(f)} g</b></span></div>
    ${fs ? `<p class="hint nut-small food-fs-amt">🌾 Ballaststoffe ${foodNum((per[4] || 0) * (g || 0) / 100)} g | 🍬 Zucker ${foodNum((per[5] || 0) * (g || 0) / 100)} g</p>` : ''}`;
}

// Nahrungsergänzung (v214): Menge in Stück, statt Makros die enthaltenen Nährstoffe
function suppMicText(f, n) {
  if (!f.mic || typeof MICROS === 'undefined') return '';
  // Folsäure wie auf der Packung (gespeichert als Folat-Äquivalent = doppelt, siehe microFromForm)
  return MICROS.filter(([k]) => f.mic[k] != null).map(([k, l, u]) => k === 'fol' ? `Folsäure ${microFmt(f.mic[k] * n / 200)} µg`
    : `${l} ${microFmt(f.mic[k] * n / 100)} ${u}`).join(' | ');
}
const foodAmtSumFor = (f, g) => f.supp ? `<p class="hint nut-small">${suppMicText(f, g || 0) || '–'}</p>` : foodAmtSum(f.per, g);

// Lebensmittel für die Menge-Seite: aus dem Eintrag (params.id) oder dem Schlüssel (params.key)
function foodAmtFood(p) {
  const e = p.id && data.foodLog.find(x => x.id === p.id);
  if (e) {
    const f = foodGet(e.key);
    const fs = foodFS(e);
    return { e, f: { ...(f || { key: e.key, src: 'own', portion: null }), name: e.name, brand: e.brand,
      per: [...e.per.slice(0, 4), ...(fs || [null, null])], ...(e.mic ? { mic: e.mic } : {}), ...(e.supp ? { supp: true } : {}) } };
  }
  return { e: null, f: p.key ? foodGet(p.key) : null };
}

function renderFoodAmt(p) {
  const { e, f } = foodAmtFood(p);
  if (!f) return '<p class="hint">Dieses Lebensmittel gibt es nicht mehr.</p>';
  const id = e ? e.id : f.key;
  if (!foodAmt || foodAmt.for !== id) {
    foodAmt = { for: id, g: e ? fmtNum(e.g) : String(f.portion ? f.portion.g : 100), meal: e ? e.meal : MEALS[p.meal] ? p.meal : mealDefault() };
  }
  const g = parseNum(foodAmt.g);
  const chips = f.supp ? [1, 2, 3].map(x => [`${x} Stück`, x])
    : [...(f.portion ? [[`${f.portion.label} (${amtTxt(f.portion.g)})`, f.portion.g], [`2 × (${amtTxt(f.portion.g * 2)})`, f.portion.g * 2]] : []),
      ...(unitLb() ? [1, 2, 4, 6, 8].map(oz => Math.round(oz * OZ_G * 10) / 10) : [50, 100, 150, 200, 250])  // v303: bei lb in oz
        .filter(x => !f.portion || (x !== f.portion.g && x !== f.portion.g * 2)).map(x => [amtTxt(x), x])];
  const [kcal, pr, ca, fa, fib, sug] = f.per;
  const fsTxt = fib != null || sug != null ? ` | Ballaststoffe ${foodNum(fib || 0)} g | Zucker ${foodNum(sug || 0)} g` : '';
  const src = f.src === 'off' ? ' | aus Open Food Facts' : f.src === 'base' ? ' | Durchschnittswert'
    : f.src === 'bls' ? ' | Durchschnittswert aus dem Bundeslebensmittelschlüssel (Max Rubner-Institut)' : ' | eigenes Lebensmittel';
  return `<div class="card food-amt">
      <p class="food-amt-name"><b>${esc(f.name)}</b>${f.brand ? `<small>${esc(f.brand)}</small>` : ''}</p>
      <p class="hint nut-small">${f.supp ? `💊 Nahrungsergänzung | je Stück: ${suppMicText(f, 1)}`
        : `je 100 g: ${foodKcal(kcal)} kcal | Eiweiß ${foodNum(pr)} g | Kohlenhydrate ${foodNum(ca)} g | Fett ${foodNum(fa)} g${fsTxt}${src}`}</p>
      <label class="row"><span>${f.supp ? 'Anzahl (Stück)' : unitLb() ? 'Menge in Unzen (oz)' : 'Menge in Gramm'}</span>
        <input class="inp kg" id="food-g" type="text" inputmode="decimal" autocomplete="off" data-field="food-g"${f.supp ? ' data-pcs="1"' : ''} value="${esc(foodAmt.g)}"></label>
      <div class="variants food-chips">${chips.map(([l, v]) => `<button class="vchip ${g === v ? 'on' : ''}" data-action="food-g-set" data-g="${v}">${l}</button>`).join('')}</div>
      <div id="food-sum">${foodAmtSumFor(f, g)}</div>
    </div>
    <div class="variants food-meals">${dayMealKeys([{ meal: foodAmt.meal }]).map(k => { const [icon, label] = mealInfo(k);
      return `<button class="vchip ${foodAmt.meal === k ? 'on' : ''}" data-action="food-meal" data-k="${k}">${icon} ${label}</button>`; }).join('')}</div>
    <button class="btn primary" data-action="food-save">${e ? '✔ Speichern' : '＋ Hinzufügen'}</button>
    <div class="row food-amt-more">
      <button class="btn" data-action="food-fav">${f.fav ? '⭐ Favorit' : '☆ Als Favorit merken'}</button>
      ${!foodBuiltin(f) ? `<button class="btn" data-action="${f.supp ? 'supp-edit' : 'food-own-edit'}">✎ Werte ändern</button>` : ''}
    </div>
    ${e ? `<button class="btn danger" data-action="food-del" data-id="${e.id}">Aus „${mealLabel(e.meal)}“ entfernen</button>` : ''}`;
}

/* ----- Eigenes Lebensmittel ----- */

function foodFormFrom(f) {
  const s = v => v == null ? '' : fmtNum(v);
  const per = f.per || [];
  return { key: f.key || null, name: f.name || '', brand: f.brand || '', code: f.code || null,
    kcal: s(per[0]), p: s(per[1]), c: s(per[2]), f: s(per[3]), fib: s(per[4]), sug: s(per[5]),
    pl: f.portion ? f.portion.label : '', pg: f.portion ? s(f.portion.g) : '',
    ...(typeof microToForm === 'function' ? microToForm(f.mic) : {}) };
}

function renderFoodOwn() {
  if (!foodForm) foodForm = foodFormFrom({ name: foodQuery.trim() });
  const f = foodForm;
  const inp = (k, ph, mode = 'decimal') => `<input class="inp kg" type="text" inputmode="${mode}" autocomplete="off" data-field="food-form" data-k="${k}" value="${esc(f[k])}" placeholder="${ph}">`;
  return `<div class="card food-form">
      <label class="lbl">Name<input class="inp" type="text" data-field="food-form" data-k="name" autocomplete="off" value="${esc(f.name)}" placeholder="z. B. Proteinbrot"></label>
      <label class="lbl">Marke <small class="hint">(freiwillig)</small><input class="inp" type="text" data-field="food-form" data-k="brand" autocomplete="off" value="${esc(f.brand)}"></label>
      ${f.code ? `<p class="hint nut-small">Barcode ${esc(f.code)}: Beim nächsten Scan erkennt die App das Produkt.</p>` : ''}
      <p class="food-sec">Nährwerte pro 100 g <small>(stehen auf der Verpackung)</small></p>
      <label class="row"><span>Kalorien (kcal)</span>${inp('kcal', 'kcal')}</label>
      <label class="row"><span>Eiweiß (g)</span>${inp('p', 'g')}</label>
      <label class="row"><span>Kohlenhydrate (g)</span>${inp('c', 'g')}</label>
      <label class="row"><span>Fett (g)</span>${inp('f', 'g')}</label>
      <label class="row"><span>Ballaststoffe (g) <small class="hint">freiwillig</small></span>${inp('fib', 'g')}</label>
      <label class="row"><span>davon Zucker (g) <small class="hint">freiwillig</small></span>${inp('sug', 'g')}</label>
      <p class="food-sec">Portion <small>(freiwillig)</small></p>
      <label class="row"><span>Bezeichnung</span><input class="inp food-pl" type="text" data-field="food-form" data-k="pl" autocomplete="off" value="${esc(f.pl)}" placeholder="z. B. 1 Scheibe"></label>
      <label class="row"><span>Gramm</span>${inp('pg', 'g')}</label>
      <p class="hint nut-small">Lässt du die Kalorien leer, rechnet die App sie aus den Makros aus (Eiweiß und Kohlenhydrate 4 kcal, Fett 9 kcal pro Gramm).</p>
      ${typeof microFormHtml === 'function' && feat('nut-micro') ? microFormHtml(f) : ''}
    </div>
    <button class="btn primary" data-action="food-own-save">✔ Speichern</button>
    ${f.key && (data.foods[f.key] || {}).src === 'own' ? '<button class="btn danger" data-action="food-own-del">Lebensmittel löschen</button>' : ''}`;
}

/* ----- Einbindung ----- */

views.food = { title: 'Ernährungstagebuch', tab: 'nutrition', back: 'nutrition', render: renderFood,
  after: () => {
    if (typeof nutPctUpdate === 'function') nutPctUpdate();  // v260: Makros in % auch im Tagebuch
    if (foodAnchor) requestAnimationFrame(foodAnchorRestore);  // v335: nach go() (scrollt nach oben) zurück zur Mahlzeit
  } };

/* v335 (User-Wunsch): Nach Eintragen, Ändern oder Löschen bleibt das Tagebuch an der Stelle, an der man war.
   foodAnchor merkt sich die Mahlzeit und wie weit ihre Karte vom oberen Rand entfernt war. */
let foodAnchor = null;
function foodAnchorSet(meal) {
  const c = meal && $view.querySelector(`.food-meal[data-meal="${meal}"]`);
  foodAnchor = c ? { date: current.params.date || todayISO(), meal, top: c.getBoundingClientRect().top, t: Date.now() } : null;
}
function foodAnchorRestore() {
  const a = foodAnchor;
  if (!a || current.view !== 'food') return;
  foodAnchor = null;
  if ((current.params.date || todayISO()) !== a.date || Date.now() - a.t > 6e5) return;
  const c = $view.querySelector(`.food-meal[data-meal="${a.meal2 || a.meal}"]`) || $view.querySelector(`.food-meal[data-meal="${a.meal}"]`);
  if (c) window.scrollTo(0, Math.max(0, c.getBoundingClientRect().top + window.scrollY - a.top));
}
views.foodadd = { title: p => MEALS[p.meal] ? mealLabel(p.meal) : 'Hinzufügen', tab: 'nutrition',
  back: p => ['food', { date: p.date }], render: renderFoodAdd };
views.foodamt = { title: p => p.id ? 'Eintrag ändern' : 'Menge', tab: 'nutrition',
  back: p => p.id ? ['food', { date: p.date }] : ['foodadd', { date: p.date, meal: p.meal }], render: renderFoodAmt };
views.foodown = { title: () => foodForm && foodForm.key ? 'Werte ändern' : 'Eigenes Lebensmittel', tab: 'nutrition',
  back: p => p.id || p.key ? ['foodamt', p] : ['foodadd', { date: p.date, meal: p.meal }], render: renderFoodOwn };

Object.assign(actions, {
  'food-open': el => { foodAnchor = null; go('food', { date: (el && el.dataset.date) || todayISO() }); },
  'food-day': el => {
    foodAnchor = null;
    const d = Number(el.dataset.d), date = addDaysISO(current.params.date || todayISO(), d);
    if (date <= todayISO()) { go('food', { date }); foodSlide(d); }
  },
  'food-add': el => {
    foodAnchorSet(el.dataset.meal);
    foodQuery = '';
    foodOnline = null;
    go('foodadd', { date: current.params.date || todayISO(), meal: el.dataset.meal });
  },
  'food-copy': el => {
    const date = current.params.date || todayISO();
    const prev = foodOn(addDaysISO(date, -1)).filter(e => e.meal === el.dataset.meal);
    const reopened = foodReopen(date);
    prev.forEach(e => data.foodLog.push({ ...e, id: uid(), date }));
    foodSync(date);
    saveData();
    if (reopened) foodReopenToast(); else toast(`${prev.length} Lebensmittel übernommen`);
    render();
  },
  'food-online': () => { const q = foodQuery.trim(); if (q) foodSearchOnline(q); },
  'food-pick': el => { foodAmt = null; go('foodamt', { date: current.params.date, meal: current.params.meal, key: el.dataset.key }); },
  'food-entry': el => { const fe = data.foodLog.find(x => x.id === el.dataset.id); foodAnchorSet(fe && fe.meal); foodAmt = null; go('foodamt', { date: current.params.date, id: el.dataset.id }); },
  'food-g-set': el => {
    foodAmt.g = el.dataset.g;
    render();
  },
  'food-meal': el => { foodAmt.meal = el.dataset.k; render(); },
  'food-save': () => {
    const p = current.params;
    const { e, f } = foodAmtFood(p);
    const g = parseNum(foodAmt.g);
    if (g == null || g <= 0 || g > 5000) { alert(f.supp ? 'Bitte eine Anzahl eintragen, z. B. 1.' : 'Bitte eine Menge zwischen 1 und 5.000 g eintragen.'); return; }
    const date = e ? e.date : p.date || todayISO();
    const reopened = foodReopen(date);
    if (e) {
      Object.assign(e, { g: round1(g), meal: foodAmt.meal });
    } else {
      data.foodLog.push({ id: uid(), date, meal: foodAmt.meal, key: f.key, name: f.name, brand: f.brand || '', g: round1(g), per: f.per,
        ...(f.mic ? { mic: f.mic } : {}), ...(f.supp ? { supp: true } : {}) });
    }
    if (f.src !== 'own' || data.foods[f.key]) foodRemember(f);
    foodCache.delete(f.key);
    foodSync(date);
    saveData();
    const foodAmt0 = foodAmt.meal;
    foodAmt = null;
    foodQuery = '';
    foodOnline = null;
    if (reopened && !f.supp) foodReopenToast(); else toast(e ? 'Gespeichert ✔' : `${f.name} hinzugefügt ✔`);
    if (foodAnchor) foodAnchor.meal2 = foodAmt0;  // v335: Eintrag ggf. in eine andere Mahlzeit verschoben
    go('food', { date });
  },
  'food-del': el => {
    const e = data.foodLog.find(x => x.id === el.dataset.id);
    if (!e || !askOk(`„${e.name}“ entfernen?`)) return;
    const reopened = foodReopen(e.date);
    data.foodLog = data.foodLog.filter(x => x !== e);
    foodSync(e.date);
    saveData();
    if (reopened) foodReopenToast();
    foodAnchorSet(e.meal);
    go('food', { date: e.date });
  },
  // Tag abschließen
  'food-close-ask': () => { foodCloseAsk = current.params.date || todayISO(); render(); },
  'food-close-cancel': () => { foodCloseAsk = null; render(); },
  'food-close': el => {
    const date = el.dataset.date || current.params.date || todayISO();
    const fill = el.dataset.fill === '1';
    foodCloseDay(date, fill);
    foodCloseAsk = null;
    saveData();
    toast(fill ? 'Tag abgeschlossen, Rest aufgefüllt ✔' : 'Tag abgeschlossen ✔');
    render();
  },
  'food-reopen': () => {
    const date = current.params.date || todayISO();
    if (!askOk('Tag wieder öffnen?' + (data.foodLog.some(e => e.date === date && e.key === FOOD_FILL) ? '\n\nDie Auffüllung bis zum Tagesziel wird dabei entfernt.' : ''))) return;
    foodReopen(date);
    foodSync(date);
    saveData();
    render();
  },
  // Wasser (v316)
  'water-add': el => { const date = current.params.date || todayISO(); waterSet(date, (data.water[date] || 0) + Number(el.dataset.ml)); },
  'water-more': async () => {
    const date = current.params.date || todayISO();
    const v = await uiPrompt(unitLb() ? 'Wie viel hast du getrunken? (in oz)' : 'Wie viel hast du getrunken? (in ml)', '', 'number');
    const n = parseNum(v);
    if (!(n > 0)) return;
    waterSet(date, (data.water[date] || 0) + (unitLb() ? n * WATER_OZ : n));
  },
  'water-goal': async () => {
    const lb = unitLb(), cur = data.waterGoal ? (lb ? String(Math.round(data.waterGoal / WATER_OZ)) : fmtNum(data.waterGoal / 1000)) : '';
    const v = await uiPrompt((lb ? 'Wasserziel pro Tag in oz' : 'Wasserziel pro Tag in Litern')
      + '\n\nLeer lassen: Die App rechnet es aus deinem Körpergewicht (35 ml je kg).', cur);
    if (v == null) return;
    if (!String(v).trim()) data.waterGoal = null;
    else {
      const n = parseNum(v);
      if (!(n > 0)) return;
      const ml = lb ? n * WATER_OZ : n < 20 ? n * 1000 : n;  // „2,5“ = Liter, „2500“ = ml
      data.waterGoal = Math.min(8000, Math.max(500, Math.round(ml / 10) * 10));
    }
    saveData();
    render();
  },
  // Mahlzeit speichern / aus der Schnellauswahl hinzufügen
  'food-meal-save': async el => {
    const date = current.params.date || todayISO();
    const k = el.dataset.meal;
    const items = foodOn(date).filter(e => e.meal === k).map(({ key, name, brand, g, per, mic, supp }) =>
      ({ key, name, brand, g, per, ...(mic ? { mic } : {}), ...(supp ? { supp } : {}) }));
    if (!items.length) return;
    const name = await uiPrompt(`Name für diese Mahlzeit (${items.length} Lebensmittel)`, mealLabel(k));
    if (!name || !name.trim()) return;
    data.foodMeals.push({ id: uid(), name: name.trim(), items, meal: k });  // v343: Mahlzeit, bei der sie gespeichert wurde
    saveData();
    toast(`„${name.trim()}“ gespeichert, beim Hinzufügen ganz oben`);
  },
  'food-meal-add': el => {
    const m = data.foodMeals.find(x => x.id === el.dataset.id);
    if (!m) return;
    const date = current.params.date || todayISO(), meal = MEALS[current.params.meal] ? current.params.meal : mealDefault();
    if (!foodMealOf(m)) m.meal = meal;  // ältere ohne Angabe: beim ersten Hinzufügen zuordnen
    const reopened = foodReopen(date);
    m.items.forEach(it => data.foodLog.push({ ...it, id: uid(), date, meal }));
    foodSync(date);
    saveData();
    foodQuery = '';
    foodOnline = null;
    if (reopened) foodReopenToast(); else toast(`${m.name} hinzugefügt ✔`);
    go('food', { date });
  },
  'food-meal-rename': async el => {
    const m = data.foodMeals.find(x => x.id === el.dataset.id);
    const name = m && await uiPrompt('Neuer Name für die Mahlzeit', m.name);
    if (!name || !name.trim()) return;
    m.name = name.trim();
    saveData();
    foodRefresh();
  },
  'food-meal-delete': el => {
    const m = data.foodMeals.find(x => x.id === el.dataset.id);
    if (!m || !askOk(`Gespeicherte Mahlzeit „${m.name}“ löschen?\n\nSchon eingetragene Tage bleiben, wie sie sind.`)) return;
    data.foodMeals = data.foodMeals.filter(x => x !== m);
    saveData();
    foodRefresh();
  },
  'food-fav': () => {
    const { f } = foodAmtFood(current.params);
    if (!f) return;
    const fav = !f.fav;
    if (data.foods[f.key]) data.foods[f.key].fav = fav;
    else { foodRemember(f, { fav }); data.foods[f.key].last = null; }
    saveData();
    toast(fav ? 'Als Favorit gemerkt ⭐' : 'Kein Favorit mehr');
    render();
  },
  'food-scan': () => foodScanStart(),
  'scan-close': () => foodScanClose(),
  'scan-type': () => { foodScanClose(); foodCodePrompt(); },
  'food-own': () => {
    foodForm = foodFormFrom({ name: foodQuery.trim() });
    go('foodown', { date: current.params.date, meal: current.params.meal });
  },
  'food-own-edit': () => {
    const { f } = foodAmtFood(current.params);
    foodForm = foodFormFrom(f);
    go('foodown', current.params);
  },
  'food-own-save': () => {
    const f = foodForm;
    const num = k => (String(f[k]).trim() === '' ? null : parseNum(f[k]));
    const per = [num('kcal'), num('p'), num('c'), num('f')];
    const fs = [num('fib'), num('sug')];
    if (!f.name.trim()) { alert('Bitte einen Namen eintragen.'); return; }
    if (per.some(v => v != null && (v < 0 || v > 1000)) || [...per.slice(1), ...fs].some(v => v != null && (v < 0 || v > 100))) {
      alert('Bitte die Werte pro 100 g eintragen: Kalorien bis 1.000, Eiweiß, Kohlenhydrate, Fett, Ballaststoffe und Zucker jeweils bis 100 g.');
      return;
    }
    if (per[0] == null && per.slice(1).every(v => v == null)) { alert('Bitte mindestens die Kalorien oder die Makros eintragen.'); return; }
    if (per[0] == null) per[0] = Math.round((per[1] || 0) * 4 + (per[2] || 0) * 4 + (per[3] || 0) * 9);
    const pg = num('pg');
    const mic = typeof microFromForm === 'function' ? microFromForm(f) : null;  // v214: freiwillige Mikros je 100 g
    if (mic && mic.error) { alert(mic.error); return; }
    const old = f.key ? foodGet(f.key) : null;
    const food = {
      key: f.key || 'own:' + uid(), name: f.name.trim(), brand: f.brand.trim(), code: f.code,
      src: old ? old.src : 'own', per: [...per.map(v => round1(v || 0)), ...fs.map(v => (v == null ? null : round1(v)))],
      portion: pg > 0 && pg < 5000 ? { label: f.pl.trim() || '1 Portion', g: round1(pg) } : null,
      ...(mic ? { mic } : old && old.mic && !feat('nut-micro') ? { mic: old.mic } : {}),
    };
    foodRemember(food, { fav: old ? !!old.fav : false });
    foodCache.delete(food.key);
    // geänderte Werte gelten auch für den gerade geöffneten Eintrag
    const p = current.params;
    const e = p.id && data.foodLog.find(x => x.id === p.id);
    if (e) { Object.assign(e, { name: food.name, brand: food.brand, per: food.per }); if (food.mic) e.mic = food.mic; else delete e.mic; foodSync(e.date); }
    saveData();
    foodForm = null;
    foodAmt = null;
    toast('Gespeichert ✔');
    go('foodamt', e ? { date: p.date, id: e.id } : { date: p.date, meal: p.meal, key: food.key });
  },
  'food-own-del': () => {
    const f = foodForm;
    if (!askOk(`„${f.name}“ aus deinen Lebensmitteln löschen?\n\nBereits eingetragene Mahlzeiten bleiben erhalten.`)) return;
    delete data.foods[f.key];
    saveData();
    foodForm = null;
    const p = current.params;
    go(p.id ? 'food' : 'foodadd', p.id ? { date: p.date } : { date: p.date, meal: p.meal });
  },
});

// Suche: nur die Trefferliste neu zeichnen, damit das Feld den Fokus behält
fields['food-q'] = el => { foodQuery = el.value; foodRefresh(); };
fields['food-g'] = el => {
  foodAmt.g = el.value;
  const { f } = foodAmtFood(current.params);
  const sum = $view.querySelector('#food-sum');
  if (f && sum) sum.innerHTML = foodAmtSumFor(f, parseNum(el.value));
  $view.querySelectorAll('.food-chips .vchip').forEach(b => b.classList.toggle('on', Number(b.dataset.g) === parseNum(el.value)));
};
fields['food-form'] = el => { foodForm[el.dataset.k] = el.value; };
fields['meal-name'] = el => {
  data.mealCfg = { n: mealN(), ...(data.mealCfg || {}) };
  data.mealCfg.names = { ...(data.mealCfg.names || {}), [el.dataset.k]: el.value.slice(0, 30) };
  saveData();
};
actions['meal-n'] = el => {
  data.mealCfg = { names: {}, ...(data.mealCfg || {}), n: Number(el.dataset.n) };
  saveData(); render();
};
actions['meal-cfg-open'] = () => go('mealcfg', { date: current.params.date || todayISO() });
views.mealcfg = { title: 'Mahlzeiten', tab: 'nutrition', back: p => ['food', { date: p.date }], render: () => mealCfgCard() };

// Eingabetaste im Suchfeld: online suchen
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.matches('[data-field="food-q"]')) return;
  e.preventDefault();
  e.target.blur();
  const q = foodQuery.trim();
  if (q) foodSearchOnline(q);
});

/* ---------- v218 (User 2026-11-12): Tagebuch oben im Ernährungs-Reiter, Kalender, Woche & Monat ---------- */

// Tageswerte: was in „Heute gegessen“ zählt (Tagebuch, Health oder von Hand); null = nichts erfasst
function foodDayVals(date) {
  const it = intakeOn(date);
  if (it && it.kcal != null) return { kcal: it.kcal, p: it.p, c: it.c, f: it.f, src: it.src };
  const list = foodOn(date);
  if (!list.length) return null;
  const t = foodTotals(list);
  return { kcal: Math.round(t.kcal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f), src: 'food' };
}
const foodShortDay = d => new Date(d + 'T12:00:00').toLocaleDateString(LOCALE(), { weekday: 'short', day: 'numeric', month: 'numeric' });

// Karte ganz oben im Ernährungs-Reiter
function foodTopCard() {
  const T = todayISO(), v = foodDayVals(T), c = foodGoal(T);
  return `<div class="card food-top">
      <button class="food-top-main primary" data-action="food-open"><span class="food-top-ic" aria-hidden="true">🍎</span>
        <span class="food-top-txt"><b>Essen eintragen</b><small>Ernährungstagebuch | ${v ? `heute ${nutKcal(v.kcal)}${c ? ` von ${nutKcal(c.kcal)}` : ''} kcal, Eiweiß ${v.p != null ? Math.round(v.p) : '–'} g`
          : 'heute noch nichts eingetragen'}</small></span><span class="food-top-chev" aria-hidden="true">›</span></button>
    </div>`;  // v243: Kalender und Woche & Monat nur noch im Tagebuch
}

/* ----- Kalender ----- */
function renderFoodCal(p) {
  const month = p.month || todayISO().slice(0, 7);
  const [y, m] = month.split('-').map(Number);
  const first = new Date(y, m - 1, 1), days = new Date(y, m, 0).getDate(), lead = (first.getDay() + 6) % 7, T = todayISO();
  let cells = '';
  for (let i = 0; i < lead; i++) cells += '<span></span>';
  let n = 0, sum = 0;
  // v311: Tage ohne Eintrag, die der Ernährungs-Reiter zum Nachtragen meldet (nutGapDays), gelb markieren
  const gapSet = new Set(typeof nutGapDays === 'function' && typeof nutHintsOn === 'function' && nutHintsOn() ? nutGapDays() : []);
  const gapN = [...gapSet].filter(x => x.startsWith(month)).length;
  // v315: Phasenplan – künftige Tage zeigen das geplante Tagesziel, farbig je Phase (phaseplan.js)
  const pm = typeof ppDayMap === 'function' ? ppDayMap() : null;
  const kTxt = k => k >= 1000 ? fmtNum(Math.round(k / 100) / 10) + 'k' : String(Math.round(k));
  const planKeys = new Set();
  for (let d = 1; d <= days; d++) {
    const iso = `${month}-${String(d).padStart(2, '0')}`, v = foodDayVals(iso), fut = iso > T;
    const pl = fut && pm ? pm.get(iso) : null;
    if (pl) planKeys.add(pl.maint && pl.key !== 'after' && pl.key !== 'brk' ? 'maint' : pl.key);
    if (v) { n++; sum += v.kcal; }
    const cls = ['fcal-day', v ? 'has' : '', !v && gapSet.has(iso) ? 'gap' : '', foodClosed(iso) ? 'closed' : '', iso === T ? 'today' : '', fut ? 'future' : '',
      pl ? `plan pp-${pl.key}${pl.maint ? ' maint' : ''}` : ''].filter(Boolean).join(' ');
    cells += `<button class="${cls}" data-action="food-cal-day" data-d="${iso}" ${fut ? 'disabled' : ''}><b>${d}</b><small>${v ? kTxt(v.kcal) : pl ? kTxt(pl.kcal) : ''}</small></button>`;
  }
  const lastMonth = [T.slice(0, 7), pm && pm.last ? pm.last.slice(0, 7) : ''].sort().pop();
  const PP_LEG = { minicut: '⚡ Minicut', diet: '🔥 Diät', brk: '🧘 Diätpause', recomp: '⚖️ Body Recomposition', bulk: '💪 Aufbau', maint: 'Erhaltung (Deload bzw. nach dem Minicut, ungefähr)', after: '⚖️ Erhaltung nach dem Plan' };
  const planLegend = planKeys.size ? `<div class="pp-cal-leg"><p class="hint nut-small">Zahl an künftigen Tagen = geplantes Tagesziel laut deinem Phasenplan.</p>
      <div class="pp-cal-keys">${Object.keys(PP_LEG).filter(k => planKeys.has(k)).map(k => `<div class="pp-cal-key"><span class="pp-cal-dot pp-${k}" aria-hidden="true"></span><span>${PP_LEG[k]}</span></div>`).join('')}</div></div>` : '';
  const title = first.toLocaleDateString(LOCALE(), { month: 'long', year: 'numeric' });
  const lastDay = `${month}-${String(month === T.slice(0, 7) ? Number(T.slice(8)) : days).padStart(2, '0')}`;
  return `<div class="card fcal">
      <div class="mc-head"><button class="icon-btn" data-action="food-cal-month" data-d="-1" aria-label="Voriger Monat">‹</button>
        <b>${title}</b><button class="icon-btn" data-action="food-cal-month" data-d="1" ${month >= lastMonth ? 'disabled' : ''} aria-label="Nächster Monat">›</button></div>
      <div class="fcal-grid fcal-wd">${['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(x => `<span>${x}</span>`).join('')}</div>
      <div class="fcal-grid">${cells}</div>
      <p class="hint nut-small">Zahl = Kalorien des Tages (k = Tausend), Rahmen = Tag abgeschlossen. Tag antippen öffnet ihn im Tagebuch.</p>
      ${planLegend}
      ${gapN ? `<p class="fcal-gap-note">📝 ${gapN} Tag${gapN === 1 ? ' ohne Eintrag ist' : 'e ohne Eintrag sind'} gelb markiert. Tippe einen Tag an und trag ein, was du gegessen hast.</p>` : ''}
    </div>
    ${waterStatsHtml(Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`), 'cal:' + month)}
    <div class="card"><label class="row"><span>Zu Datum springen</span>
      <input class="inp date" type="date" data-field="food-cal-date" value="${T}" max="${T}"></label></div>
    ${n ? `<div class="card fcal-sum"><p>${n} Tag${n === 1 ? '' : 'e'} mit Einträgen | Ø <b>${nutKcal(sum / n)} kcal</b></p>
      <button class="btn" data-action="food-stats" data-range="month" data-end="${lastDay}">📊 Monat im Detail</button></div>` : ''}`;
}

/* ----- Woche & Monat ----- */
/* ----- Säulendiagramm je Tag (v237, User-Wunsch 2026-11-14: wie die Schritte in Apple Health) -----
   Eine Säule je Tag der Woche bzw. des Monats, darunter der Anfangsbuchstabe des Wochentags, gestrichelte Linie = Durchschnitt
   der erfassten Tage. Oben groß der Durchschnitt; Säule antippen zeigt dort den Wert dieses Tages (noch einmal tippen = zurück). */
const FOOD_BAR_METRICS = { kcal: { label: 'Kalorien', unit: 'kcal' }, p: { label: 'Eiweiß', unit: 'g' }, c: { label: 'Kohlenh.', unit: 'g' }, f: { label: 'Fett', unit: 'g' } };
const FOOD_WD = ['S', 'M', 'D', 'M', 'D', 'F', 'S'];
let foodBarSel = null;  // { key, i } – angetippte Säule
const foodBarFmt = (k, v) => k === 'kcal' ? `${nutKcal(v)} kcal` : `${Math.round(v)} g`;
function foodNiceStep(max) {
  const rough = max / 3, mag = Math.pow(10, Math.floor(Math.log10(Math.max(rough, 1e-9))));
  return [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= rough) || mag * 10;
}
function foodBarChart(days, metric, rangeKey) {
  const T = todayISO(), water = metric === 'w';
  const vals = days.map(d => { if (d > T) return null; if (water) return waterDay(d).total || null;
    const v = foodDayVals(d); return v && v[metric] != null && v[metric] > 0 ? v[metric] : null; });
  const have = vals.filter(v => v != null);
  if (!have.length) return '';
  const avg = have.reduce((a, b) => a + b, 0) / have.length;
  const step = foodNiceStep(Math.max(...have, avg)), top = Math.ceil(Math.max(...have, avg) / step) * step;
  const W = 340, H = 190, L = 4, R = 40, TOP = 8, B = 22, pw = W - L - R, ph = H - TOP - B, n = days.length, slot = pw / n;
  const bw = Math.max(3, slot * (n > 10 ? 0.62 : 0.56)), rad = Math.min(4, bw / 2);
  const y = v => TOP + ph - v / top * ph;
  const sel = foodBarSel && foodBarSel.key === rangeKey && vals[foodBarSel.i] != null ? foodBarSel.i : null;
  const M = water ? { label: 'Wasser' } : FOOD_BAR_METRICS[metric];
  let svg = '';
  for (let t = step; t <= top + 1e-9; t += step) {
    svg += `<line class="fb-grid" x1="${L}" x2="${L + pw}" y1="${y(t)}" y2="${y(t)}"/><text class="fb-tick" x="${W - 2}" y="${y(t) + 4}" text-anchor="end">${water ? (unitLb() ? Math.round(t / WATER_OZ) : fmtNum(round1(t / 1000))) : metric === 'kcal' ? deNum(t) : Math.round(t)}</text>`;
  }
  svg += `<line class="fb-base" x1="${L}" x2="${L + pw}" y1="${y(0)}" y2="${y(0)}"/>`;
  days.forEach((d, i) => {
    const v = vals[i], cx = L + slot * (i + 0.5), x0 = cx - bw / 2;
    if (v != null) {
      const yt = y(v), hgt = Math.max(rad, TOP + ph - yt);
      svg += `<path class="fb-bar${sel === i ? ' sel' : sel != null ? ' dim' : ''}" d="M${x0},${TOP + ph} V${TOP + ph - hgt + rad} Q${x0},${TOP + ph - hgt} ${x0 + rad},${TOP + ph - hgt} H${x0 + bw - rad} Q${x0 + bw},${TOP + ph - hgt} ${x0 + bw},${TOP + ph - hgt + rad} V${TOP + ph} Z"/>`;
    }
    const wd = new Date(d + 'T12:00:00').getDay();
    svg += `<text class="fb-day${d === T ? ' today' : ''}${n > 10 ? ' sm' : ''}" x="${cx}" y="${H - 6}" text-anchor="middle">${FOOD_WD[wd]}</text>`;
    if (v != null) svg += `<rect class="fb-hit" x="${L + slot * i}" y="${TOP}" width="${slot}" height="${ph + B}" data-action="food-bar" data-i="${i}" data-k="${rangeKey}"/>`;
  });
  svg += `<line class="fb-avg" x1="${L}" x2="${L + pw}" y1="${y(avg)}" y2="${y(avg)}"/>`;
  if (water) {  // Wasser: ohne Kennzahl-Auswahl, eingebettet in die aufklappbare Karte
    const head2 = sel != null
      ? `<small>${new Date(days[sel] + 'T12:00:00').toLocaleDateString(LOCALE(), { weekday: 'long', day: 'numeric', month: 'long' })}</small><b>${waterTxt(vals[sel])}</b>`
      : `<small>Ø pro Tag | ${have.length} von ${days.filter(d => d <= T).length} Tagen erfasst</small><b>${waterTxt(avg)}</b>`;
    return `<div class="fb-head">${head2}</div>
      <svg class="fb-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Wasser je Tag, Durchschnitt ${waterTxt(avg)}">${svg}</svg>`;
  }
  const head = sel != null
    ? `<small>${new Date(days[sel] + 'T12:00:00').toLocaleDateString(LOCALE(), { weekday: 'long', day: 'numeric', month: 'long' })}</small><b>${foodBarFmt(metric, vals[sel])}</b>`
    : `<small>Ø pro Tag | ${have.length} von ${days.filter(d => d <= T).length} Tagen erfasst</small><b>${foodBarFmt(metric, avg)}</b>`;
  return `<div class="card fbar"><div class="seg four fb-metric">${Object.entries(FOOD_BAR_METRICS).map(([k, m]) =>
      `<button class="${k === metric ? 'on' : ''}" data-action="food-bar-metric" data-k="${k}">${m.label}</button>`).join('')}</div>
    <div class="fb-head">${head}</div>
    <svg class="fb-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${M.label} je Tag, Durchschnitt ${foodBarFmt(metric, avg)}">${svg}</svg>
    <p class="hint nut-small"><span class="fb-key"></span> Durchschnitt der erfassten Tage. Säule antippen zeigt den Wert des Tages.</p></div>`;
}

// v317: Wasser in Kalender und Woche & Monat, zum Aufklappen (Zustand gilt für beide Ansichten)
let waterStatsOpen = false;
function waterStatsHtml(days, rangeKey) {
  const T = todayISO(), past = days.filter(d => d <= T), tot = past.map(d => waterDay(d).total), have = tot.filter(Boolean);
  if (!have.length) return '';
  const goal = waterGoal(), hit = have.filter(v => v >= goal).length;
  return `<div class="card fwater">
      <button class="fwater-head" data-action="water-stats-toggle" aria-expanded="${waterStatsOpen}">
        <span><b>💧 Wasser</b><small>Ø ${waterTxt(have.reduce((a, b) => a + b, 0) / have.length)} | Ziel an ${hit} von ${have.length} Tagen erreicht</small></span>
        <span class="chev" aria-hidden="true">▾</span></button>
      ${waterStatsOpen ? `<div class="fbar fwater-body">${foodBarChart(days, 'w', 'w:' + rangeKey)}
        <p class="hint nut-small"><span class="fb-key"></span> Durchschnitt der erfassten Tage. Tagesziel ${waterTxt(goal)}, Getränke aus dem Tagebuch zählen mit.</p></div>` : ''}
    </div>`;
}
actions['water-stats-toggle'] = () => { waterStatsOpen = !waterStatsOpen; render(); };

const foodWeekStart = d => { const x = new Date(d + 'T12:00:00'); return addDaysISO(d, -((x.getDay() + 6) % 7)); };
function foodRangeDays(range, end) {
  if (range === 'month') {
    const [y, m] = end.split('-').map(Number), n = new Date(y, m, 0).getDate();
    return Array.from({ length: n }, (_, i) => `${end.slice(0, 7)}-${String(i + 1).padStart(2, '0')}`);
  }
  const s = foodWeekStart(end);
  return Array.from({ length: 7 }, (_, i) => addDaysISO(s, i));
}
function renderFoodStats(p) {
  const range = p.range === 'month' ? 'month' : 'week', end = p.end || todayISO(), T = todayISO();
  const days = foodRangeDays(range, end), past = days.filter(d => d <= T);
  const rows = past.map(d => ({ d, v: foodDayVals(d) })), got = rows.filter(r => r.v);
  const goal = foodGoal(T);
  const avg = k => got.length ? got.reduce((a, r) => a + (r.v[k] || 0), 0) / got.length : null;
  const A = { kcal: avg('kcal'), p: avg('p'), c: avg('c'), f: avg('f') };
  const title = range === 'month' ? new Date(days[0] + 'T12:00:00').toLocaleDateString(LOCALE(), { month: 'long', year: 'numeric' })
    : `${foodShortDay(days[0])} – ${foodShortDay(days[6])}`;
  const next = addDaysISO(days[days.length - 1], 1);
  let h = `<div class="seg two"><button class="${range === 'week' ? 'on' : ''}" data-action="food-stats-range" data-r="week">Woche</button>
      <button class="${range === 'month' ? 'on' : ''}" data-action="food-stats-range" data-r="month">Monat</button></div>
    <div class="mc-head fstat-nav"><button class="icon-btn" data-action="food-stats-shift" data-d="-1" aria-label="Zurück">‹</button>
      <b>${title}</b><button class="icon-btn" data-action="food-stats-shift" data-d="1" ${next > T ? 'disabled' : ''} aria-label="Weiter">›</button></div>`;
  if (!got.length) return h + '<p class="hint">In diesem Zeitraum ist nichts eingetragen.</p>' + waterStatsHtml(days, `${range}:${days[0]}`);
  const kcalDiff = goal && A.kcal != null ? Math.round((A.kcal - goal.kcal) / 10) * 10 : null;
  const mk = A.p * 4 + A.c * 4 + A.f * 9;
  const pct = x => mk > 0 ? Math.round(x / mk * 100) : 0;
  h += `<div class="card fstat-sum"><h2>Ø pro Tag</h2>
      <div class="nut-goal-row food-sum"><span>Kalorien<b>${nutKcal(A.kcal)}</b></span><span>Eiweiß<b>${Math.round(A.p)} g</b></span>
        <span>Kohlenh.<b>${Math.round(A.c)} g</b></span><span>Fett<b>${Math.round(A.f)} g</b></span></div>
      <p class="hint nut-small">${got.length} von ${past.length} Tag${past.length === 1 ? '' : 'en'} erfasst${goal ? ` | Tagesziel (aktuell) ${nutKcal(goal.kcal)} kcal, Eiweiß ${Math.round(goal.protein)} g${kcalDiff != null ? ` | im Schnitt ${kcalDiff > 0 ? '+' : ''}${deNum(kcalDiff)} kcal` : ''}` : ''}
        | Anteile: Eiweiß ${pct(A.p * 4)} %, Kohlenhydrate ${pct(A.c * 4)} %, Fett ${pct(A.f * 9)} %</p></div>`;
  h += foodBarChart(days, FOOD_BAR_METRICS[p.metric] ? p.metric : 'kcal', `${range}:${days[0]}`);
  h += waterStatsHtml(days, `${range}:${days[0]}`);
  if (range === 'month') {
    const weeks = {};
    for (const r of got) { const w = foodWeekStart(r.d); (weeks[w] = weeks[w] || []).push(r.v); }
    h += `<div class="card"><h2>Wochen</h2><div class="fstat-table"><div class="fstat-row head"><span>Woche ab</span><span>kcal</span><span>E</span><span>KH</span><span>F</span></div>
      ${Object.entries(weeks).map(([w, vs]) => { const a = k => vs.reduce((s, v) => s + (v[k] || 0), 0) / vs.length;
        return `<div class="fstat-row"><span>${foodShortDay(w)}<small>${vs.length} Tg.</small></span><span>${nutKcal(a('kcal'))}</span><span>${Math.round(a('p'))}</span><span>${Math.round(a('c'))}</span><span>${Math.round(a('f'))}</span></div>`; }).join('')}
      </div></div>`;
  }
  const maxK = Math.max(goal ? goal.kcal * 1.3 : 0, ...got.map(r => r.v.kcal));
  h += `<div class="card"><h2>Tage</h2><div class="fstat-table">
      <div class="fstat-row head"><span>Tag</span><span>kcal</span><span>E</span><span>KH</span><span>F</span></div>
      ${rows.slice().reverse().map(r => r.v ? `<button class="fstat-row day" data-action="food-cal-day" data-d="${r.d}">
          <span>${foodShortDay(r.d)}${foodClosed(r.d) ? ' ✔' : ''}</span><span>${nutKcal(r.v.kcal)}</span><span>${r.v.p != null ? Math.round(r.v.p) : '–'}</span>
          <span>${r.v.c != null ? Math.round(r.v.c) : '–'}</span><span>${r.v.f != null ? Math.round(r.v.f) : '–'}</span>
          <i class="fstat-bar"><i style="width:${Math.min(100, Math.round(r.v.kcal / maxK * 100))}%"></i>${goal ? `<u style="left:${Math.round(goal.kcal / maxK * 100)}%"></u>` : ''}</i></button>`
        : `<div class="fstat-row empty"><span>${foodShortDay(r.d)}</span><span>–</span><span></span><span></span><span></span></div>`).join('')}
    </div><p class="hint nut-small">E = Eiweiß, KH = Kohlenhydrate, F = Fett (in g). Der Strich im Balken markiert dein Tagesziel. Tag antippen öffnet ihn.</p></div>`;
  if (typeof nutEntriesHtml === 'function') h += nutEntriesHtml();  // v299: Tageswerte der letzten 14 Tage (vorher Karte „Letzte Tage“)
  return h;
}

views.foodcal = { title: 'Kalender', tab: 'nutrition', back: p => [p.from || 'food', p.from === 'nutrition' ? {} : { date: p.date }], render: renderFoodCal };
views.foodstats = { title: 'Woche & Monat', tab: 'nutrition', back: p => [p.from || 'food', p.from === 'nutrition' ? {} : { date: p.date }], render: renderFoodStats };
const foodFrom = () => (current.view === 'nutrition' ? 'nutrition' : current.view === 'foodcal' || current.view === 'foodstats' ? current.params.from || 'food' : 'food');
actions['food-cal'] = () => { const d = current.params.date || todayISO(); go('foodcal', { month: d.slice(0, 7), from: foodFrom(), date: d }); };
actions['food-cal-month'] = el => {
  const [y, m] = current.params.month.split('-').map(Number), x = new Date(y, m - 1 + Number(el.dataset.d), 1);
  go('foodcal', { ...current.params, month: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}` });
};
actions['food-cal-day'] = el => go('food', { date: el.dataset.d });
fields['food-cal-date'] = el => { if (/^\d{4}-\d{2}-\d{2}$/.test(el.value) && el.value <= todayISO()) go('food', { date: el.value }); };
actions['food-stats'] = el => go('foodstats', { range: (el && el.dataset && el.dataset.range) || 'week', end: (el && el.dataset && el.dataset.end) || current.params.date || todayISO(), from: foodFrom(), date: current.params.date });
actions['food-stats-range'] = el => go('foodstats', { ...current.params, range: el.dataset.r });
actions['food-bar-metric'] = el => { foodBarSel = null; go('foodstats', { ...current.params, metric: el.dataset.k }); };
actions['food-bar'] = el => {
  const i = Number(el.dataset.i), k = el.dataset.k;
  foodBarSel = foodBarSel && foodBarSel.key === k && foodBarSel.i === i ? null : { key: k, i };
  render();
};
actions['food-stats-shift'] = el => {
  const p = current.params, d = Number(el.dataset.d), end = p.end || todayISO();
  let ne;
  if (p.range === 'month') { const [y, m] = end.split('-').map(Number), x = new Date(y, m - 1 + d, 1); ne = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-01`; }
  else ne = addDaysISO(end, 7 * d);
  if (ne > todayISO()) ne = todayISO();
  go('foodstats', { ...p, end: ne });
};

/* ----- v333 (User): Wischen im Tagebuch sichtbar machen ----------
   Die Tageswahl selbst macht swipeView (app.js) über die Pfeil-Knöpfe. Hier folgt die Seite dem Finger, der neue Tag gleitet
   herein (auch bei den Pfeilen), und am heutigen Tag federt sie zurück, mit kurzem Hinweis. */
function foodSlide(dir) {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $view.classList.remove('food-slide-l', 'food-slide-r');
  void $view.offsetWidth;  // Animation neu starten
  $view.classList.add(dir > 0 ? 'food-slide-l' : 'food-slide-r');
}
let foodDrag = null;
document.addEventListener('touchstart', e => {
  foodDrag = null;
  if (current.view !== 'food' || e.touches.length !== 1 || document.querySelector('.welcome, #tour')) return;
  if (e.target.closest && e.target.closest('textarea, input, select, .table-wrap, .quick-picks')) return;
  const t = e.touches[0];
  foodDrag = { x: t.clientX, y: t.clientY, on: false, date: current.params.date || todayISO(), dx: 0 };
}, { passive: true });
document.addEventListener('touchmove', e => {
  const d = foodDrag;
  if (!d || current.view !== 'food') return;
  const t = e.touches[0], dx = t.clientX - d.x, dy = t.clientY - d.y;
  if (!d.on) {
    if (Math.abs(dx) > 12 && Math.abs(dx) > 1.5 * Math.abs(dy)) d.on = true;
    else { if (Math.abs(dy) > 12) foodDrag = null; return; }
  }
  d.dx = dx;
  const end = dx < 0 && d.date >= todayISO();  // heute: weiter geht es nicht, nur leicht nachgeben
  $view.style.transition = 'none';
  $view.style.transform = `translateX(${Math.round(dx * (end ? 0.15 : 0.45))}px)`;
}, { passive: true });
const foodDragEnd = () => {
  const d = foodDrag;
  foodDrag = null;
  if (!d || !d.on) return;
  const moved = (current.params.date || todayISO()) !== d.date;
  $view.style.transition = moved ? 'none' : 'transform .2s ease';
  $view.style.transform = '';
  if (!moved && d.dx < -60 && d.date >= todayISO()) toast('Das ist heute. Nach rechts wischen zeigt die Tage davor.');
};
document.addEventListener('touchend', foodDragEnd, { passive: true });
document.addEventListener('touchcancel', foodDragEnd, { passive: true });
