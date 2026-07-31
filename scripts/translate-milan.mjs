#!/usr/bin/env node
// Fill missing language descriptions for all 89 Milan spots.
// Overwrites empty strings; preserves existing non-empty text unless
// FORCE is set. The [object Object] bug for `ronin` is replaced.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPOTS_PATH = path.join(__dirname, '..', 'data', 'spots.json');
const FORCE_IDS = new Set(['ronin', 'fondazione-prada', 'pinacoteca-di-brera', 'teatro-alla-scala']);

// Description tuple per spot: [en, it, pt, fr]
const D = {
'bar-basso': [
  "The legendary birthplace of the Negroni Sbagliato. Low-lit, mid-century, unchanged for 60 years. Order the drink it invented and sit by the window.",
  "Il leggendario luogo di nascita del Negroni Sbagliato. Luci basse, arredi anni '60, invariato da 60 anni. Ordina il drink che qui e stato inventato.",
  "O lendario berco do Negroni Sbagliato. Luz baixa, decoracao dos anos 60, intacto ha 60 anos. Peca o drink que foi inventado aqui e sente na janela.",
  "Le berceau legendaire du Negroni Sbagliato. Lumiere tamisee, mobilier annees 60, inchange depuis 60 ans. Commandez le drink invente ici, asseyez-vous a la fenetre."
],
'trippa': [
  "Diego Rossi's nose-to-tail trattoria. Hand-written menu, wild combinations, zero pretension. Sit close at the small tables and share everything.",
  "La trattoria nose-to-tail di Diego Rossi. Menu scritto a mano, accostamenti arditi, zero pretese. Sedete vicini ai tavolini e condividete tutto.",
  "A trattoria nose-to-tail de Diego Rossi. Menu escrito a mao, combinacoes ousadas, zero pretensao. Sentem perto nas mesinhas e dividam tudo.",
  "La trattoria du nez-a-la-queue de Diego Rossi. Carte manuscrite, combinaisons audacieuses, zero pretention. Asseyez-vous serres aux petites tables et partagez tout."
],
'parco-sempione': [
  "Pack focaccia from Princi, walk in through the Castello, end at the Arco della Pace for sunset. Free, timeless, unbeatable.",
  "Prendi la focaccia da Princi, entra dal Castello, finisci all'Arco della Pace al tramonto. Gratis, senza tempo, imbattibile.",
  "Compre focaccia na Princi, entre pelo Castello, termine no Arco della Pace ao por do sol. Gratis, atemporal, imbativel.",
  "Prenez la focaccia chez Princi, entrez par le Castello, finissez a l'Arco della Pace au coucher du soleil. Gratuit, intemporel, imbattable."
],
'dry-milano': [
  "Pizza and cocktails, somehow both excellent. Sit at the bar, split a Marinara and two Martinis, and see where the night wants to go.",
  "Pizza e cocktail, entrambi eccellenti. Sedete al banco, dividete una Marinara e due Martini, e lasciate che la notte decida.",
  "Pizza e drinks, os dois excelentes, nao se sabe como. Sente no balcao, dividam uma Marinara e dois Martinis, deixem a noite decidir.",
  "Pizza et cocktails, les deux excellents on ne sait comment. Asseyez-vous au bar, partagez une Marinara et deux Martinis, laissez la nuit decider."
],
'bulgari-garden': [
  "The best-kept garden terrace in the center. Book ahead, wear something nice, and order the Bulgari Martini. Secret-feeling, but not a secret.",
  "La migliore terrazza-giardino del centro. Prenota, vestiti bene, ordina il Bulgari Martini. Da la sensazione di un segreto, ma non lo e.",
  "A melhor terraco-jardim do centro. Reserve, vista algo bonito, peca o Bulgari Martini. Tem cara de segredo, mas nao e.",
  "La meilleure terrasse-jardin du centre. Reservez, mettez quelque chose de bien, commandez le Bulgari Martini. L'impression d'un secret, sans en etre un."
],
'eutopia': [
  "A small dining room near Loreto where the kitchen plays in the gap between Italian and Mediterranean. Tight wine list, candle light, easy second visit.",
  "Una piccola sala vicino a Loreto dove la cucina si muove tra italiano e mediterraneo. Carta dei vini stretta, candele, ritorno facile.",
  "Uma sala pequena perto de Loreto onde a cozinha brinca entre o italiano e o mediterraneo. Carta de vinhos enxuta, luz de vela, segunda visita facil.",
  "Une petite salle pres de Loreto ou la cuisine joue entre italien et mediterraneen. Carte des vins resserree, bougies, deuxieme visite facile."
],
'osteria-afrodite': [
  "A neighborhood osteria with a hand-written menu and a clear love for fish. Order the catch of the day and the house white.",
  "Un'osteria di quartiere con il menu scritto a mano e un evidente amore per il pesce. Ordina il pescato del giorno e il bianco della casa.",
  "Uma osteria de bairro com menu escrito a mao e amor declarado por peixe. Peca o peixe do dia e o branco da casa.",
  "Une osteria de quartier avec une carte manuscrite et un amour declare pour le poisson. Commandez la peche du jour et le blanc maison."
],
'il-baretto': [
  "An old-school cocktail bar inside Palazzo Bagatti Valsecchi. Mahogany, low light, a Negroni made the way it has always been made.",
  "Un cocktail bar d'altri tempi dentro Palazzo Bagatti Valsecchi. Mogano, luci basse, un Negroni fatto come si e sempre fatto.",
  "Um cocktail bar a moda antiga dentro do Palazzo Bagatti Valsecchi. Mogno, luz baixa, um Negroni feito como sempre se fez.",
  "Un bar a cocktails a l'ancienne dans le Palazzo Bagatti Valsecchi. Acajou, lumiere tamisee, un Negroni fait comme on l'a toujours fait."
],
'waby': [
  "A Japanese-leaning kitchen with omakase counters and a discreet dining room. Sit at the bar, let them choose the order.",
  "Una cucina di ispirazione giapponese con banchi omakase e una sala discreta. Siedi al banco e lascia che scelgano loro l'ordine.",
  "Uma cozinha de inspiracao japonesa com balcao de omakase e uma sala discreta. Sente no balcao e deixe eles escolherem a ordem.",
  "Une cuisine d'inspiration japonaise avec comptoirs omakase et une salle discrete. Asseyez-vous au bar, laissez-les choisir l'ordre."
],
'taverna-trastevere': [
  "A Roman trattoria displaced into Milan. Cacio e pepe, abbacchio, carafes of frascati. Stay late.",
  "Una trattoria romana spostata a Milano. Cacio e pepe, abbacchio, caraffe di frascati. Resta fino a tardi.",
  "Uma trattoria romana transplantada para Milao. Cacio e pepe, abbacchio, jarras de frascati. Fique ate tarde.",
  "Une trattoria romaine transplantee a Milan. Cacio e pepe, abbacchio, pichets de frascati. Restez tard."
],
'l-ile-douce': [
  "A French patisserie tucked into a Milan side street. Croissants in the morning, eclairs after lunch, hot chocolate on cold days.",
  "Una patisserie francese nascosta in una via laterale milanese. Croissant al mattino, eclair dopo pranzo, cioccolata calda nei giorni freddi.",
  "Uma patisserie francesa escondida numa ruela de Milao. Croissants de manha, eclairs depois do almoco, chocolate quente nos dias frios.",
  "Une patisserie francaise nichee dans une petite rue de Milan. Croissants le matin, eclairs apres dejeuner, chocolat chaud les jours froids."
],
'veramente': [
  "A modern trattoria with strong sourcing and a short carta. Pasta course is the one to wait for.",
  "Una trattoria moderna con materie prime serie e una carta corta. La portata di pasta e quella che vale l'attesa.",
  "Uma trattoria moderna com bons fornecedores e uma carta curta. O prato de massa e o que vale a espera.",
  "Une trattoria moderne avec un sourcing serieux et une carte courte. Le plat de pates est celui qu'il faut attendre."
],
'roppongi': [
  "An izakaya-style Japanese kitchen in central Milan: sushi counter on one side, grill on the other. Order from both.",
  "Una cucina giapponese in stile izakaya nel centro di Milano: banco sushi da un lato, griglia dall'altro. Ordina da entrambi.",
  "Uma cozinha japonesa estilo izakaya no centro de Milao: balcao de sushi de um lado, grill do outro. Peca dos dois.",
  "Une cuisine japonaise type izakaya en plein Milan: comptoir a sushi d'un cote, grill de l'autre. Commandez aux deux."
],
'bar-nico': [
  "A small cocktail bar where the bartender will ask what you feel like, not what you want. Trust the answer.",
  "Un piccolo cocktail bar dove il barista ti chiede come ti senti, non cosa vuoi. Fidati della risposta.",
  "Um pequeno cocktail bar onde o bartender pergunta como voce esta, nao o que voce quer. Confie na resposta.",
  "Un petit bar a cocktails ou le bartender vous demande comment vous vous sentez, pas ce que vous voulez. Faites-lui confiance."
],
'sakeya': [
  "A sake bar with a serious list and small Japanese plates to match. Ask for a flight and let the staff guide you.",
  "Un sake bar con una carta seria e piccoli piatti giapponesi in abbinamento. Chiedi una degustazione e lasciati guidare.",
  "Um bar de sake com carta seria e pequenos pratos japoneses para acompanhar. Peca uma degustacao e deixe a equipe conduzir.",
  "Un bar a sake avec une vraie carte et de petits plats japonais pour accompagner. Demandez une degustation et laissez-vous guider."
],
'atypique': [
  "A dim bar with herbal-leaning cocktails and a record player that actually matters. Sit at the bar, talk quietly.",
  "Un bar in penombra con cocktail vegetali e un giradischi che conta sul serio. Siedi al banco, parlate piano.",
  "Um bar em penumbra com drinks vegetais e uma vitrola que importa de verdade. Sente no balcao, conversem baixo.",
  "Un bar tamise avec des cocktails vegetaux et une platine qui compte vraiment. Asseyez-vous au bar, parlez doucement."
],
'bolo-bolo-bar': [
  "A noisy little bar in Porta Venezia with stiff drinks and a crowd that knows everyone. Walk in for one, stay for three.",
  "Un piccolo bar rumoroso a Porta Venezia con drink generosi e una folla che si conosce. Entri per uno, ne fai tre.",
  "Um barzinho barulhento em Porta Venezia com drinks generosos e uma turma que se conhece. Entra para um, fica tres.",
  "Un petit bar bruyant a Porta Venezia avec des drinks genereux et une foule qui se connait. On entre pour un, on en prend trois."
],
'onda-listening-bar': [
  "A listening bar where the speakers are taken seriously. Low light, vinyl only, drinks built around the music.",
  "Un listening bar dove le casse sono prese sul serio. Luci basse, solo vinile, drink costruiti attorno alla musica.",
  "Um listening bar onde os alto-falantes sao levados a serio. Luz baixa, so vinil, drinks construidos em torno da musica.",
  "Un listening bar ou les enceintes sont prises au serieux. Lumiere basse, vinyle uniquement, drinks construits autour de la musique."
],
'frida': [
  "An Isola institution with a tree-shaded courtyard. Aperitivo runs long; dinner runs longer.",
  "Un'istituzione di Isola con un cortile alberato. L'aperitivo si allunga; la cena ancora di piu.",
  "Uma instituicao em Isola com um patio sombreado. O aperitivo se estica; o jantar mais ainda.",
  "Une institution d'Isola avec une cour ombragee par les arbres. L'aperitivo dure longtemps; le diner encore plus."
],
'isola-rooftop': [
  "A rooftop in Isola with skyline views in three directions and a list of negronis worth working through. Book sunset.",
  "Un rooftop a Isola con vista sullo skyline da tre lati e una lista di negroni che vale la pena attraversare. Prenota al tramonto.",
  "Um rooftop em Isola com vista do skyline em tres direcoes e uma carta de negronis que vale percorrer. Reserve para o por do sol.",
  "Un rooftop a Isola avec vue sur le skyline sur trois cotes et une liste de negronis a parcourir. Reservez au coucher du soleil."
],
'salmon-guru': [
  "The Madrid speakeasy that landed in Milan. Theatrical drinks, neon, a menu you read like a comic. Go festive or stay home.",
  "Lo speakeasy madrileno arrivato a Milano. Drink teatrali, neon, un menu che si legge come un fumetto. Vai in modalita festa o non andare.",
  "O speakeasy madrileno que aterrissou em Milao. Drinks teatrais, neon, um menu que se le como historia em quadrinhos. Va para festa ou nao va.",
  "Le speakeasy madrilene atterri a Milan. Drinks theatraux, neon, une carte qui se lit comme une BD. Mode fete obligatoire."
],
'baunilla-bosco-verticale': [
  "A bakery cafe under the Vertical Forest. Sourdough, banana bread, cardamom buns, a sunny seat outside on warm days.",
  "Un bakery cafe sotto il Bosco Verticale. Pane a lievitazione naturale, banana bread, brioche al cardamomo, un posto al sole nei giorni miti.",
  "Um cafe-padaria embaixo do Bosco Verticale. Pao de fermentacao natural, banana bread, brioches de cardamomo, um lugar ao sol nos dias amenos.",
  "Une boulangerie-cafe sous le Bosco Verticale. Pain au levain, banana bread, brioches a la cardamome, une place au soleil les jours doux."
],
'barragan': [
  "A neighborhood bar named for the architect: pink walls, mezcal back bar, plates of guacamole and tostadas. Casual perfection.",
  "Un bar di quartiere intitolato all'architetto: pareti rosa, mezcal alle spalle del bancone, guacamole e tostadas. Casual e perfetto.",
  "Um bar de bairro batizado em homenagem ao arquiteto: paredes rosas, mezcal no fundo do balcao, guacamole e tostadas. Casual e perfeito.",
  "Un bar de quartier baptise comme l'architecte: murs roses, mezcal au fond du bar, guacamole et tostadas. Decontracte et parfait."
],
'kagurazaka-saryo': [
  "A Japanese tea room with seasonal wagashi and a long matcha menu. Quiet, slow, exactly the date energy you wanted.",
  "Una sala da te giapponese con wagashi di stagione e una lunga carta del matcha. Silenziosa, lenta, esattamente l'energia da appuntamento giusta.",
  "Uma sala de cha japonesa com wagashi de estacao e uma longa carta de matcha. Silenciosa, lenta, exatamente o clima de encontro que voce queria.",
  "Un salon de the japonais avec wagashi de saison et une longue carte de matcha. Silencieux, lent, exactement l'energie de rendez-vous voulue."
],
'bicchierino': [
  "A pocket-sized wine bar with twenty seats and a curated by-the-glass list. Order a flight, share the boards, stay an hour.",
  "Un wine bar tascabile con venti posti e una carta al calice curata. Ordina una degustazione, dividetevi i taglieri, restate un'ora.",
  "Um wine bar de bolso com vinte lugares e uma carta de tacas curada. Peca uma degustacao, dividam as tabuas, fiquem uma hora.",
  "Un bar a vin de poche, vingt places, une carte au verre choisie. Commandez une degustation, partagez les planches, restez une heure."
],
'gallerie-d-italia': [
  "Intesa Sanpaolo's Piazza della Scala museum, free with the card. Italian sculpture and painting in palace rooms.",
  "Il museo di Intesa Sanpaolo in Piazza della Scala, gratis con la tessera. Scultura e pittura italiana in sale d'epoca.",
  "O museu da Intesa Sanpaolo na Piazza della Scala, gratis com o cartao. Escultura e pintura italianas em salas palacianas.",
  "Le musee d'Intesa Sanpaolo a la Piazza della Scala, gratuit avec la carte. Sculpture et peinture italiennes dans des salles de palais."
],
'palazzo-cordusio': [
  "The Gran Melia hotel bar inside a Belle Epoque palace. Tall ceilings, marble, an Espresso Martini done properly.",
  "Il bar del Gran Melia dentro un palazzo Belle Epoque. Soffitti alti, marmi, un Espresso Martini fatto come si deve.",
  "O bar do Gran Melia dentro de um palacio Belle Epoque. Pe-direito alto, marmore, um Espresso Martini bem feito.",
  "Le bar du Gran Melia dans un palais Belle Epoque. Plafonds hauts, marbre, un Espresso Martini fait comme il faut."
],
'al-cortile': [
  "A romantic dinner spot with a candlelit internal courtyard. Northern Italian classics, a long wine list, no rush.",
  "Un romantico ristorante con cortile interno illuminato a candele. Classici del Nord Italia, una lunga carta dei vini, niente fretta.",
  "Um restaurante romantico com patio interno iluminado por velas. Classicos do norte da Italia, uma carta de vinhos longa, sem pressa.",
  "Un restaurant romantique avec une cour interieure aux bougies. Classiques du nord de l'Italie, longue carte des vins, aucune precipitation."
],
'pasticceria-clivati': [
  "Old-school Milanese pasticceria. Take three baci di dama, two pasticcini, and a coffee at the counter.",
  "Pasticceria milanese all'antica. Prendi tre baci di dama, due pasticcini e un caffe al banco.",
  "Pasticceria milanesa a moda antiga. Pegue tres baci di dama, dois pasticcini e um cafe no balcao.",
  "Pasticceria milanaise a l'ancienne. Prenez trois baci di dama, deux pasticcini et un cafe au comptoir."
],
'rumore': [
  "A loud listening bar with a long bar, an open kitchen, and a vinyl wall. Order something with mezcal.",
  "Un listening bar rumoroso con bancone lungo, cucina a vista e un muro di vinili. Ordina qualcosa con mezcal.",
  "Um listening bar barulhento com balcao longo, cozinha aberta e uma parede de vinis. Peca algo com mezcal.",
  "Un listening bar bruyant avec un long bar, une cuisine ouverte et un mur de vinyles. Commandez quelque chose au mezcal."
],
'ronin': [
  "A Japanese kitchen built around grill and dashi, with a small counter facing the chef. Reserve early.",
  "Una cucina giapponese costruita su griglia e dashi, con un piccolo banco di fronte allo chef. Prenota presto.",
  "Uma cozinha japonesa construida em torno do grill e do dashi, com um balcao pequeno de frente para o chef. Reserve cedo.",
  "Une cuisine japonaise construite autour du grill et du dashi, avec un petit comptoir face au chef. Reservez tot."
],
'osaka': [
  "Honest, family-run Japanese cooking in Milan: gyoza, ramen, oyakodon. Cheap, fast, the right call after a long day.",
  "Cucina giapponese sincera e familiare a Milano: gyoza, ramen, oyakodon. Economica, veloce, perfetta dopo una giornata lunga.",
  "Cozinha japonesa honesta e familiar em Milao: gyoza, ramen, oyakodon. Barata, rapida, certa depois de um dia longo.",
  "Cuisine japonaise honnete et familiale a Milan: gyoza, ramen, oyakodon. Pas cher, rapide, le bon choix apres une longue journee."
],
'miyabi': [
  "Sushi and kaiseki with a serious omakase counter. Trust the chef; the difference is in the small choices.",
  "Sushi e kaiseki con un serio banco omakase. Fidati dello chef; la differenza la fanno le piccole scelte.",
  "Sushi e kaiseki com balcao de omakase serio. Confie no chef; a diferenca esta nas pequenas escolhas.",
  "Sushi et kaiseki avec un vrai comptoir omakase. Faites confiance au chef; la difference se joue dans les petits choix."
],
'locanda-perbellini': [
  "Bistrot version of the three-Michelin-star Perbellini. White tablecloths, classical dishes, perfect technique.",
  "La versione bistrot del tristellato Perbellini. Tovaglie bianche, piatti classici, tecnica impeccabile.",
  "A versao bistro do tri-estrelado Perbellini. Toalhas brancas, pratos classicos, tecnica impecavel.",
  "La version bistrot du tri-etoile Perbellini. Nappes blanches, plats classiques, technique impeccable."
],
'al-baretto-san-marco': [
  "A clubby bar tucked into San Marco with leather chairs and proper Negronis. Off-radar; that is the point.",
  "Un bar elegante nascosto a San Marco con poltrone in pelle e Negroni come si deve. Fuori dai radar; ed e il bello.",
  "Um bar elegante escondido em San Marco com poltronas de couro e Negronis bem feitos. Fora do radar; e esse e o ponto.",
  "Un bar club-style cache a San Marco avec fauteuils en cuir et vrais Negronis. Hors radar; c'est tout l'interet."
],
'osteria-la-carbonaia': [
  "A grill house that takes Tuscan beef seriously. Florentine on the bone for two, a glass of Brunello, finish.",
  "Una griglieria che prende sul serio la bistecca toscana. Fiorentina per due, un calice di Brunello, fine.",
  "Uma grelha que leva o boi toscano a serio. Fiorentina para dois, uma taca de Brunello, ponto.",
  "Une grilladerie qui prend le boeuf toscan au serieux. Bistecca pour deux, un verre de Brunello, c'est fini."
],
'sogni': [
  "A small dining room with a single tasting menu and a chef who plates each course personally. Sit by the kitchen.",
  "Una piccola sala con un solo menu degustazione e uno chef che impiatta personalmente ogni portata. Siedi vicino alla cucina.",
  "Uma sala pequena com um unico menu degustacao e um chef que empratada cada prato pessoalmente. Sente perto da cozinha.",
  "Une petite salle avec un seul menu degustation et un chef qui dresse chaque plat lui-meme. Asseyez-vous pres de la cuisine."
],
'beefbar': [
  "The international steakhouse chain with one of the best burgers in Milan. Order the kobe slider and the souffle potatoes.",
  "La catena internazionale di steakhouse con uno dei migliori burger di Milano. Ordina il kobe slider e le patate souffle.",
  "A rede internacional de steakhouses com um dos melhores hamburgueres de Milao. Peca o kobe slider e as batatas souffle.",
  "La chaine internationale de steakhouses avec l'un des meilleurs burgers de Milan. Commandez le kobe slider et les pommes souffles."
],
'moebius': [
  "Fine dining with two tasting menus, an open kitchen, and a long view from the counter seats. Book those.",
  "Alta cucina con due menu degustazione, cucina a vista e una bella visuale dai posti al banco. Prenotali.",
  "Alta cozinha com dois menus degustacao, cozinha aberta e uma boa vista dos lugares no balcao. Reserve esses.",
  "Haute cuisine avec deux menus degustation, cuisine ouverte et belle vue depuis les places au comptoir. Reservez-les."
],
'al-garghet': [
  "A storied trattoria in the south of the city. Risotto giallo, ossobuco, garden tables in summer.",
  "Una trattoria storica nel sud della citta. Risotto giallo, ossobuco, tavoli in giardino d'estate.",
  "Uma trattoria historica no sul da cidade. Risotto giallo, ossobuco, mesas no jardim no verao.",
  "Une trattoria historique au sud de la ville. Risotto giallo, ossobuco, tables au jardin en ete."
],
'casa-fiori-chiari': [
  "A romantic Brera dining room with a flower-filled courtyard. Quiet pasta, candlelight, slow night.",
  "Una romantica sala da pranzo a Brera con un cortile pieno di fiori. Paste tranquille, candele, serata lenta.",
  "Uma sala romantica em Brera com um patio cheio de flores. Massas tranquilas, luz de vela, noite lenta.",
  "Une salle romantique a Brera avec une cour fleurie. Pates tranquilles, bougies, soiree lente."
],
'cru-arco': [
  "A wine bar at the foot of the Arco della Pace with serious bottles and small plates. Outside table at sunset.",
  "Un wine bar ai piedi dell'Arco della Pace con bottiglie serie e piccoli piatti. Tavolo all'aperto al tramonto.",
  "Um wine bar aos pes do Arco della Pace com garrafas serias e pequenos pratos. Mesa fora ao por do sol.",
  "Un bar a vin au pied de l'Arco della Pace avec de vraies bouteilles et de petits plats. Table dehors au coucher du soleil."
],
'lubarino': [
  "The little sister of Lubar in the courtyard of GAM, with the same easy Italian-Sicilian menu and twice the speed.",
  "La sorellina di Lubar nel cortile della GAM, con lo stesso menu italo-siciliano e il doppio della velocita.",
  "A irma menor do Lubar no patio da GAM, com o mesmo menu italo-siciliano e o dobro da velocidade.",
  "La petite soeur de Lubar dans la cour de la GAM, avec la meme carte italo-sicilienne et deux fois plus vite."
],
'lubar': [
  "A Palermo-meets-Milan bar inside the GAM courtyard. Arancine, panelle, perfectly cold spritz under the trees.",
  "Un bar Palermo-meets-Milano nel cortile della GAM. Arancine, panelle, spritz freddi sotto gli alberi.",
  "Um bar Palermo-meets-Milao no patio da GAM. Arancine, panelle, spritz gelados sob as arvores.",
  "Un bar Palerme-rencontre-Milan dans la cour de la GAM. Arancine, panelle, spritz bien frais sous les arbres."
],
'bon-wei': [
  "The serious Chinese restaurant in Milan. Regional menus, attentive carts, an actual wine list.",
  "Il serio ristorante cinese di Milano. Menu regionali, carrelli attenti, una vera carta dei vini.",
  "O restaurante chines serio de Milao. Menus regionais, carrinhos atentos, uma carta de vinhos de verdade.",
  "Le vrai restaurant chinois de Milan. Menus regionaux, chariots attentifs, une vraie carte des vins."
],
'bacaro-montenapoleone': [
  "A small Venetian-style cicchetti bar tucked behind Montenapoleone. Order one of everything; share two ombre.",
  "Un piccolo bacaro veneziano nascosto dietro Montenapoleone. Ordina un cicchetto per ciascuno; condividete due ombre.",
  "Um pequeno bacaro veneziano escondido atras de Montenapoleone. Pecam um de cada cicchetto e dividam duas ombre.",
  "Un petit bacaro venitien cache derriere Montenapoleone. Commandez un de chaque cicchetto, partagez deux ombre."
],
'al-fresco': [
  "A bright Tortona room with a glassed-in garden and a long lunch menu. Pasta course, wine glass, easy afternoon.",
  "Una sala luminosa a Tortona con giardino chiuso a vetri e un lungo menu di pranzo. Una pasta, un calice, un pomeriggio facile.",
  "Uma sala iluminada em Tortona com jardim envidracado e um menu de almoco longo. Massa, taca, tarde tranquila.",
  "Une salle lumineuse a Tortona avec jardin sous verre et longue carte de dejeuner. Un plat de pates, un verre, un apres-midi facile."
],
'pasticceria-sissi': [
  "Tiny corner pasticceria in Porta Venezia with the best brioche-and-caffe in the area. Stand at the counter, eat fast.",
  "Piccolissima pasticceria d'angolo in Porta Venezia con la migliore brioche-e-caffe della zona. Resta al banco, mangia veloce.",
  "Pequena pasticceria de esquina em Porta Venezia com a melhor brioche-e-cafe da regiao. Fica no balcao, come rapido.",
  "Toute petite pasticceria de coin a Porta Venezia avec la meilleure brioche-cafe du quartier. Au comptoir, on mange vite."
],
'drinc-different': [
  "A modern Milanese cocktail bar where each drink has a story typeset on the menu. Theatrical, fun, very photographed.",
  "Un moderno cocktail bar milanese dove ogni drink ha una storia stampata sul menu. Teatrale, divertente, molto fotografato.",
  "Um cocktail bar moderno em Milao onde cada drink tem uma historia impressa no menu. Teatral, divertido, muito fotografado.",
  "Un bar a cocktails moderne a Milan ou chaque drink a une histoire imprimee sur la carte. Theatral, fun, tres photographie."
],
'iyo': [
  "Milan's first Michelin-starred Japanese restaurant. Counter, omakase, a list of sake that is worth its own visit.",
  "Il primo ristorante giapponese stellato di Milano. Banco, omakase, una carta dei sake che vale una visita a se.",
  "O primeiro restaurante japones com estrela Michelin de Milao. Balcao, omakase, uma carta de sake que merece visita propria.",
  "Le premier restaurant japonais etoile Michelin de Milan. Comptoir, omakase, une carte de sake qui justifie a elle seule la visite."
],
'langosteria-bar': [
  "Langosteria's bar room: oysters, crudo, champagne, no fuss. Drop in for an hour, leave full.",
  "Il bar della Langosteria: ostriche, crudo, champagne, niente fronzoli. Entra per un'ora, esci pieno.",
  "O bar da Langosteria: ostras, crudo, champanhe, sem firula. Entre por uma hora, saia satisfeito.",
  "Le bar de Langosteria: huitres, crudo, champagne, sans chichi. Entrez pour une heure, ressortez rassasies."
],
'dim-sum': [
  "A small Cantonese dim-sum kitchen in Porta Venezia. Steamer baskets, har gow, never empty.",
  "Una piccola cucina cantonese di dim-sum in Porta Venezia. Cestelli a vapore, har gow, sempre piena.",
  "Uma pequena cozinha cantonesa de dim sum em Porta Venezia. Cestos a vapor, har gow, nunca vazio.",
  "Une petite cuisine cantonaise a dim sum a Porta Venezia. Paniers vapeur, har gow, jamais vide."
],
'el-porteno-prohibido': [
  "An Argentine grill in the basement of Porta Venezia. Empanadas, choripan, malbec by the carafe.",
  "Una griglieria argentina in un seminterrato di Porta Venezia. Empanadas, choripan, malbec in caraffa.",
  "Uma churrascaria argentina no porao de Porta Venezia. Empanadas, choripan, malbec na jarra.",
  "Un grill argentin en sous-sol de Porta Venezia. Empanadas, choripan, malbec en carafe."
],
'loste-cafe': [
  "A bright corner cafe with serious pastries and a long espresso menu. The cinnamon bun is worth standing in line for.",
  "Un cafe d'angolo luminoso con pasticceria seria e una lunga carta dell'espresso. Il cinnamon bun vale la fila.",
  "Um cafe de esquina iluminado com confeitaria seria e uma longa carta de espressos. O cinnamon bun vale a fila.",
  "Un cafe de coin lumineux avec une vraie patisserie et une longue carte d'espressos. Le cinnamon bun vaut la queue."
],
'wicky-s': [
  "Hiroyuki Wicky Pricone's omakase counter, a benchmark for innovative Japanese in Milan. Sit at the bar and let him cook.",
  "Il banco omakase di Hiroyuki Wicky Pricone, riferimento del giapponese innovativo a Milano. Siedi al banco e lascialo cucinare.",
  "O balcao omakase de Hiroyuki Wicky Pricone, referencia do japones inovador em Milao. Sente no balcao e deixe ele cozinhar.",
  "Le comptoir omakase d'Hiroyuki Wicky Pricone, reference du japonais innovant a Milan. Asseyez-vous au comptoir et laissez-le cuisiner."
],
'ribot': [
  "A storied Milanese restaurant known for beef and risotto. White tablecloths, an old-world wine list, perfect cottoletta.",
  "Un ristorante storico milanese famoso per carne e risotto. Tovaglie bianche, una carta dei vini d'altri tempi, cotoletta perfetta.",
  "Um restaurante historico de Milao famoso por carne e risotto. Toalhas brancas, carta de vinhos a moda antiga, cotoletta perfeita.",
  "Un restaurant historique milanais celebre pour le boeuf et le risotto. Nappes blanches, carte des vins d'antan, cotoletta parfaite."
],
'hostaria-terza-carbonaia': [
  "Family-run trattoria with hand-rolled pasta and a wine list that rewards trust. Stay through the dolce.",
  "Trattoria familiare con pasta tirata a mano e una carta dei vini che premia la fiducia. Resta fino al dolce.",
  "Trattoria familiar com massa feita a mao e uma carta de vinhos que recompensa a confianca. Fique ate o doce.",
  "Trattoria familiale avec pates faites a la main et une carte des vins qui recompense la confiance. Restez jusqu'au dessert."
],
'la-brisa': [
  "A long-standing favorite tucked behind a leafy courtyard. Northern Italian classics, attentive service, the kind of dinner you replay.",
  "Un classico amato nascosto dietro un cortile alberato. Classici del Nord Italia, servizio attento, il tipo di cena che si riguarda dopo.",
  "Um classico amado escondido atras de um patio com arvores. Classicos do norte da Italia, servico atento, o tipo de jantar que voce repete na cabeca.",
  "Un classique aime cache derriere une cour arboree. Classiques du nord de l'Italie, service attentif, le genre de diner qu'on rejoue."
],
'serra-di-quartiere': [
  "A casual neighborhood spot built into a former greenhouse. Plant-leaning menu, brunch on weekends, garden out back.",
  "Un posto di quartiere informale ricavato da una vecchia serra. Menu vegetale, brunch nei weekend, giardino sul retro.",
  "Um lugar de bairro descontraido feito numa antiga estufa. Menu vegetal, brunch nos fins de semana, jardim nos fundos.",
  "Un endroit de quartier decontracte amenage dans une ancienne serre. Carte vegetale, brunch le weekend, jardin a l'arriere."
],
'lacerba': [
  "Futurist-themed dining room near Porta Romana with frescoed walls and Milanese classics. Order the risotto giallo.",
  "Sala da pranzo a tema futurista vicino Porta Romana con pareti affrescate e classici milanesi. Ordina il risotto giallo.",
  "Sala de jantar tematica futurista perto de Porta Romana com paredes em afrescos e classicos milaneses. Peca o risotto giallo.",
  "Salle a manger theme futuriste pres de Porta Romana avec murs a fresques et classiques milanais. Commandez le risotto giallo."
],
'flow': [
  "A small modern Italian kitchen with a tasting menu that changes each month. Eight tables, very controlled.",
  "Una piccola cucina italiana moderna con un menu degustazione che cambia ogni mese. Otto tavoli, molto controllata.",
  "Uma cozinha italiana moderna pequena com menu degustacao que muda todo mes. Oito mesas, muito controlada.",
  "Une petite cuisine italienne moderne avec un menu degustation qui change chaque mois. Huit tables, tres maitrise."
],
'marchesi-1824': [
  "Angelo Marchesi's 1824 pasticceria, now Prada-owned. Marble counters, gilded mirrors, the best panettone in Milan.",
  "La pasticceria Marchesi del 1824, oggi targata Prada. Banchi di marmo, specchi dorati, il miglior panettone di Milano.",
  "A pasticceria Marchesi de 1824, hoje da Prada. Balcoes de marmore, espelhos dourados, o melhor panettone de Milao.",
  "La pasticceria Marchesi de 1824, aujourd'hui propriete de Prada. Comptoirs en marbre, miroirs dores, le meilleur panettone de Milan."
],
'cantine-isola': [
  "A standing wine bar with a 50-page list and a counter of cicchetti. Three glasses each, four euros each, no fuss.",
  "Un wine bar in piedi con una carta da 50 pagine e un banco di cicchetti. Tre calici a testa, quattro euro l'uno, niente fronzoli.",
  "Um wine bar de pe com carta de 50 paginas e balcao de cicchetti. Tres tacas cada um, quatro euros cada, sem firula.",
  "Un bar a vin debout avec une carte de 50 pages et un comptoir de cicchetti. Trois verres chacun, quatre euros piece, sans chichi."
],
'fondazione-prada': [
  "Rem Koolhaas's golden tower and concrete galleries on the south side of Milan. The shows reward a full afternoon.",
  "La torre dorata di Rem Koolhaas e gli spazi di cemento a sud di Milano. Le mostre meritano un pomeriggio intero.",
  "A torre dourada de Rem Koolhaas e as galerias de concreto no sul de Milao. As exposicoes pedem uma tarde inteira.",
  "La tour doree de Rem Koolhaas et les galeries en beton au sud de Milan. Les expositions meritent un apres-midi entier."
],
'bar-luce': [
  "Wes Anderson's pastel-pink bar inside Fondazione Prada. Caffe, brioche, every surface photographable.",
  "Il bar rosa pastello di Wes Anderson dentro la Fondazione Prada. Caffe, brioche, ogni superficie fotografabile.",
  "O bar rosa pastel de Wes Anderson dentro da Fondazione Prada. Cafe, brioche, cada superficie fotografavel.",
  "Le bar rose pastel de Wes Anderson dans la Fondazione Prada. Cafe, brioche, chaque surface photographiable."
],
'pinacoteca-di-brera': [
  "Milan's flagship picture gallery: Mantegna's Dead Christ, Caravaggio's Supper, Piero della Francesca. Free with the card.",
  "La pinacoteca milanese per eccellenza: Cristo morto di Mantegna, Cena in Emmaus di Caravaggio, Piero della Francesca. Gratis con la tessera.",
  "A pinacoteca-mor de Milao: Cristo Morto de Mantegna, Ceia de Caravaggio, Piero della Francesca. Gratis com o cartao.",
  "La pinacotheque phare de Milan: Christ mort de Mantegna, Repas de Caravage, Piero della Francesca. Gratuit avec la carte."
],
'trattoria-torre-di-pisa': [
  "A 1950s Brera trattoria with red-checked tablecloths and a Tuscan-leaning menu. Order the ribollita and the steak.",
  "Una trattoria di Brera anni '50 con tovaglie a quadri rossi e cucina di matrice toscana. Ordina la ribollita e la fiorentina.",
  "Uma trattoria de Brera dos anos 50 com toalhas xadrez vermelhas e cozinha de pendor toscano. Peca a ribollita e a fiorentina.",
  "Une trattoria de Brera des annees 50 aux nappes a carreaux rouges et a la cuisine toscane. Commandez la ribollita et la bistecca."
],
'kanpai': [
  "A casual Japanese spot for tempura, gyoza, and grilled skewers. Long bar, friendly staff, easy weeknight.",
  "Un giapponese informale per tempura, gyoza e spiedini alla griglia. Banco lungo, staff cordiale, perfetto per la sera in settimana.",
  "Um japones descontraido para tempura, gyoza e espetinhos grelhados. Balcao longo, equipe simpatica, perfeito para meio de semana.",
  "Un japonais decontracte pour tempura, gyoza et brochettes grillees. Long bar, equipe sympa, parfait pour la semaine."
],
'mudec': [
  "The Museo delle Culture, a David Chipperfield building in Tortona with strong rotating shows.",
  "Il Museo delle Culture, edificio firmato David Chipperfield a Tortona con forti mostre temporanee.",
  "O Museu das Culturas, predio assinado por David Chipperfield em Tortona com boas mostras temporarias.",
  "Le Museo delle Culture, batiment de David Chipperfield a Tortona avec de fortes expositions temporaires."
],
'spirit-de-milan': [
  "A converted warehouse with live swing, jazz, and rockabilly. Order spaghetti at midnight; dance until 2.",
  "Un capannone trasformato con musica live swing, jazz e rockabilly. Ordina spaghetti a mezzanotte; balla fino alle 2.",
  "Um galpao reformado com musica ao vivo swing, jazz e rockabilly. Peca spaghetti a meia-noite; dance ate as 2.",
  "Un entrepot reconverti avec swing live, jazz et rockabilly. Commandez des spaghetti a minuit; dansez jusqu'a 2h."
],
'triennale': [
  "Design museum in Parco Sempione with permanent collection plus a cafe and rooftop terrace. Easy half-afternoon.",
  "Museo del design in Parco Sempione con collezione permanente, caffe e terrazza sul tetto. Mezzo pomeriggio facile.",
  "Museu de design no Parco Sempione com colecao permanente, cafe e terraco no topo. Meia tarde tranquila.",
  "Musee du design dans le Parco Sempione avec collection permanente, cafe et terrasse sur le toit. Un demi-apres-midi facile."
],
'mag-cafe': [
  "A vintage-styled cocktail spot in Navigli with a long aperitivo board. Sit on the canal at sunset.",
  "Un cocktail bar in stile vintage in Navigli con un lungo banco aperitivo. Siedi sul canale al tramonto.",
  "Um cocktail bar com pegada vintage nos Navigli e um longo balcao de aperitivo. Sente na beira do canal ao por do sol.",
  "Un bar a cocktails vintage dans les Navigli avec un long buffet d'aperitivo. Asseyez-vous au bord du canal au couchant."
],
'orsonero-coffee': [
  "Specialty coffee bar with a single bar and serious pour-overs. Bring a book; stand at the window.",
  "Specialty coffee bar con un solo banco e pour-over seri. Porta un libro; resta alla finestra.",
  "Specialty coffee bar com balcao unico e pour-overs serios. Leve um livro; fique na janela.",
  "Bar a cafe de specialite avec un seul comptoir et de vrais pour-overs. Apportez un livre; restez a la fenetre."
],
'paper-moon-giardino': [
  "Carpaccio, vitello tonnato, garden tables under a pergola. A Milanese institution since 1977.",
  "Carpaccio, vitello tonnato, tavoli in giardino sotto un pergolato. Un'istituzione milanese dal 1977.",
  "Carpaccio, vitello tonnato, mesas no jardim sob a pergola. Uma instituicao milanesa desde 1977.",
  "Carpaccio, vitello tonnato, tables dans le jardin sous une pergola. Une institution milanaise depuis 1977."
],
'nottingham-forest': [
  "Dario Comini's pioneering cocktail lab with one of the most awarded menus in Milan. Theatrical, but the drinks back it up.",
  "Il laboratorio pionieristico di Dario Comini con uno dei menu piu premiati di Milano. Teatrale, ma i drink lo sostengono.",
  "O laboratorio pioneiro de Dario Comini com um dos menus mais premiados de Milao. Teatral, mas os drinks sustentam.",
  "Le laboratoire pionnier de Dario Comini avec l'une des cartes les plus primees de Milan. Theatral, mais les drinks tiennent la promesse."
],
'il-salumaio-di-montenapoleone': [
  "A glassed-in courtyard restaurant in the heart of Quadrilatero. White-coated waiters, classical Italian, dressed-up lunches.",
  "Un ristorante con cortile chiuso a vetri nel cuore del Quadrilatero. Camerieri in giacca bianca, classici italiani, pranzi eleganti.",
  "Um restaurante com patio envidracado no coracao do Quadrilatero. Garcons de jaleco branco, classicos italianos, almocos elegantes.",
  "Un restaurant a cour vitree au coeur du Quadrilatero. Serveurs en veste blanche, classiques italiens, dejeuners habilles."
],
'ba': [
  "A respected Chinese fine-dining room with a long menu of regional dishes done seriously. Order family-style.",
  "Un rispettato ristorante cinese di alta cucina con un lungo menu regionale fatto sul serio. Ordina per condividere.",
  "Um respeitado restaurante chines de alta cozinha com um menu longo de pratos regionais bem feitos. Peca para dividir.",
  "Un restaurant chinois haut de gamme respecte avec une longue carte de plats regionaux faits serieusement. Commandez en partage."
],
'pasticceria-stefanelli': [
  "A small classic Milanese pasticceria with mignon by the kilo. Pick six, ask for them in a box, eat them on a bench.",
  "Una piccola pasticceria classica milanese con i mignon al chilo. Sceglietene sei, fateveli incartare, mangiateli su una panchina.",
  "Uma pequena pasticceria classica milanesa com mignons por quilo. Escolham seis, pecam para embalar, comam num banco.",
  "Une petite pasticceria classique milanaise avec des mignons au kilo. Choisissez-en six, faites-les emballer, mangez-les sur un banc."
],
'rotonda-della-besana': [
  "A baroque octagonal cloister in the heart of Porta Vittoria. Lie in the grass; the city forgets you here.",
  "Un chiostro ottagonale barocco nel cuore di Porta Vittoria. Sdraiati sull'erba; la citta qui ti dimentica.",
  "Um claustro barroco octogonal no coracao de Porta Vittoria. Deite na grama; a cidade esquece de voce aqui.",
  "Un cloitre baroque octogonal au coeur de Porta Vittoria. Allongez-vous dans l'herbe; la ville vous oublie ici."
],
'ta-hua': [
  "Honest Sichuan cooking in a small Chinatown room. Mapo tofu, twice-cooked pork, beer. Spicy, fast, cheap.",
  "Cucina sichuanese sincera in una piccola sala a Chinatown. Mapo tofu, twice-cooked pork, birra. Piccante, veloce, economica.",
  "Cozinha de Sichuan honesta numa salinha da Chinatown. Mapo tofu, twice-cooked pork, cerveja. Picante, rapido, barato.",
  "Cuisine du Sichuan honnete dans une petite salle de Chinatown. Mapo tofu, twice-cooked pork, biere. Pimente, rapide, pas cher."
],
'dal-bolognese': [
  "The Roman trattoria of the 70s scenesters, now Milanese. White tablecloths, tortellini in brodo, fur coats in winter.",
  "La trattoria romana dei vip anni '70, oggi anche milanese. Tovaglie bianche, tortellini in brodo, pellicce d'inverno.",
  "A trattoria romana dos vips dos anos 70, agora tambem em Milao. Toalhas brancas, tortellini in brodo, casacos de pele no inverno.",
  "La trattoria romaine des people des annees 70, desormais milanaise. Nappes blanches, tortellini in brodo, manteaux de fourrure l'hiver."
],
'chateau-dufan': [
  "A loud night-out spot for Champagne, oysters, and dancing on the chairs. Go festive or skip.",
  "Un locale serale chiassoso per Champagne, ostriche e ballare sulle sedie. O festoso o niente.",
  "Um lugar barulhento de noite para Champanhe, ostras e dancar nas cadeiras. Festa ou nada.",
  "Un spot de soiree bruyant pour Champagne, huitres et danse sur les chaises. C'est fete ou rien."
],
'ydun': [
  "A Nordic-tinted wine bar with hand-pulled coffees by day and natural wine by night. Short food menu, easy room.",
  "Un wine bar di gusto nordico con caffe filtri di giorno e vini naturali di sera. Carta cibo breve, sala accogliente.",
  "Um wine bar com toque nordico, cafes filtrados de dia e vinhos naturais de noite. Cardapio curto, ambiente acolhedor.",
  "Un bar a vin d'esprit nordique avec cafes filtres le jour et vins nature le soir. Petite carte food, salle agreable."
],
'teatro-alla-scala': [
  "Italy's most storied opera house, since 1778. Buy a gallery ticket two days ahead; dress one notch up.",
  "Il teatro d'opera piu importante d'Italia, dal 1778. Compra il biglietto della galleria due giorni prima; vestiti un livello sopra.",
  "O teatro de opera mais importante da Italia, desde 1778. Compre o ingresso da galeria com dois dias; vista um nivel acima.",
  "L'opera la plus prestigieuse d'Italie, depuis 1778. Achetez un billet de galerie deux jours avant; habillez-vous d'un cran au-dessus."
],
'al-matarel': [
  "A 1962 Milanese trattoria for ossobuco, mondeghili, and a glass of Bonarda. Old-school in the best sense.",
  "Una trattoria milanese del 1962 per ossobuco, mondeghili e un calice di Bonarda. All'antica nel senso migliore.",
  "Uma trattoria milanesa de 1962 para ossobuco, mondeghili e uma taca de Bonarda. A moda antiga no melhor sentido.",
  "Une trattoria milanaise de 1962 pour l'ossobuco, les mondeghili et un verre de Bonarda. A l'ancienne, dans le bon sens."
],
'ditta-artigianale': [
  "Florence's specialty coffee benchmark, newly landed on Corso Magenta. Viennoiserie in the morning, espresso tonic after lunch, wine later. Sit at the marble counter.",
  "Il riferimento fiorentino dello specialty coffee, sbarcato da poco in Corso Magenta. Viennoiserie al mattino, espresso tonic dopo pranzo, vino piu tardi. Siedi al banco di marmo.",
  "A referencia florentina do specialty coffee, recem-chegada ao Corso Magenta. Viennoiserie de manha, espresso tonic depois do almoco, vinho mais tarde. Sente no balcao de marmore.",
  "La reference florentine du cafe de specialite, fraichement arrivee sur le Corso Magenta. Viennoiserie le matin, espresso tonic apres dejeuner, vin plus tard. Asseyez-vous au comptoir de marbre."
],
'cafezal-solferino': [
  "The flagship that started Milan's third-wave coffee obsession. Brazilian beans, Italian rigor, counter seating tight against the window. Order a filter and watch Brera walk by.",
  "Il flagship che ha lanciato l'ossessione milanese per il caffe specialty. Chicchi brasiliani, rigore italiano, sgabelli stretti alla vetrina. Ordina un filtro e guarda passare Brera.",
  "O flagship que comecou a obsessao milanesa por specialty coffee. Graos brasileiros, rigor italiano, bancos colados na vitrine. Peca um filtrado e veja Brera passar.",
  "Le flagship qui a lance l'obsession milanaise pour le cafe de specialite. Grains bresiliens, rigueur italienne, tabourets serres contre la vitrine. Commandez un filtre et regardez passer Brera."
],
'cafezal-premuda': [
  "Cafezal's 450-square-meter hub: roastery, brunch kitchen, and coworking all under one roof. Come for the eggs and flat white, stay for the tasting flight downstairs.",
  "L'hub di Cafezal da 450 metri quadri: torrefazione, brunch e coworking sotto lo stesso tetto. Vieni per uova e flat white, resta per la degustazione al piano sotto.",
  "O hub de 450 metros quadrados da Cafezal: torrefacao, brunch e coworking sob o mesmo teto. Venha pelos ovos e o flat white, fique para a degustacao no andar de baixo.",
  "Le hub de 450 metres carres de Cafezal: torrefaction, brunch et coworking sous le meme toit. Venez pour les oeufs et le flat white, restez pour la degustation en bas."
],
'the-wilde': [
  "A Brera cocktail bar with a Victorian-leaning aesthetic and seasonal menus that change four times a year. Order from the latest chapter.",
  "Un cocktail bar di Brera con un'estetica vittoriana e menu stagionali che cambiano quattro volte all'anno. Ordina dall'ultimo capitolo.",
  "Um cocktail bar em Brera com estetica vitoriana e menus sazonais que mudam quatro vezes ao ano. Peca do ultimo capitulo.",
  "Un bar a cocktails de Brera a l'esthetique victorienne avec des cartes saisonnieres qui changent quatre fois par an. Commandez dans le dernier chapitre."
],
};

const spots = JSON.parse(fs.readFileSync(SPOTS_PATH, 'utf8'));
let updated = 0;
const missing = [];

for (const s of spots) {
    if (s.city !== 'milan') continue;
    const tup = D[s.id];
    if (!tup) { missing.push(s.id); continue; }
    if (typeof s.description !== 'object') s.description = { en: '', it: '', pt: '', fr: '' };
    const [en, it, pt, fr] = tup;
    const force = FORCE_IDS.has(s.id);
    if (force || !s.description.en) s.description.en = en;
    if (force || !s.description.it) s.description.it = it;
    if (force || !s.description.pt) s.description.pt = pt;
    if (force || !s.description.fr) s.description.fr = fr;
    updated++;
}

fs.writeFileSync(SPOTS_PATH, JSON.stringify(spots, null, 2) + '\n');
console.log(`Updated ${updated} Milan spots`);
if (missing.length) console.log(`Missing: ${missing.join(', ')}`);
