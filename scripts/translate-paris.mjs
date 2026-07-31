#!/usr/bin/env node
// Fill descriptions for all 160 empty Paris spots in EN/IT/PT/FR.
// The first 10 Paris spots already have curated descriptions and are skipped.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPOTS_PATH = path.join(__dirname, '..', 'data', 'spots.json');

const D = {
'grouvie-paris': [
  "A neighborhood natural wine bar with a short menu of plates and a long list by the glass. Sit at the counter, ask what the barman is drinking.",
  "Un wine bar di vino naturale di quartiere con una carta breve di piatti e una lunga lista al calice. Siedi al banco, chiedi cosa beve il barman.",
  "Um wine bar de vinho natural de bairro com cardapio curto e carta longa em tacas. Sente no balcao, pergunte o que o bartender esta bebendo.",
  "Un bar a vin nature de quartier avec une courte carte de plats et une longue liste au verre. Asseyez-vous au comptoir, demandez ce que boit le barman."
],
'the-crying-tiger-paris': [
  "A loud little Thai kitchen named after the dish. Order the seua rong hai, the larb, the green curry, and stay another round.",
  "Una piccola cucina thai chiassosa che porta il nome del piatto. Ordina il seua rong hai, il larb, il curry verde, e resta un altro giro.",
  "Uma cozinha tailandesa barulhentinha que leva o nome do prato. Peca o seua rong hai, o larb, o curry verde, e fique mais uma rodada.",
  "Une petite cuisine thai bruyante qui porte le nom du plat. Commandez le seua rong hai, le larb, le curry vert, restez un tour de plus."
],
'frenchparadox-canard-champagne-paris': [
  "Duck and champagne only, as the name says. Confit, magret, foie gras; coupes by the glass. Goes long, gets festive.",
  "Solo anatra e champagne, come dice il nome. Confit, magret, foie gras; coupes al calice. Si allunga, si festeggia.",
  "So pato e champanhe, como diz o nome. Confit, magret, foie gras; tacas em copo. Estica, vira festa.",
  "Canard et champagne uniquement, comme dit le nom. Confit, magret, foie gras; coupes au verre. Ca s'eternise, ca devient festif."
],
'seven-heaven-coffee-lunch-brunch-paris': [
  "A bright corner cafe doing weekend brunch right. Strong filter, eggs done well, a window seat if you arrive before 11.",
  "Un cafe d'angolo luminoso che fa il brunch del weekend come si deve. Filtro forte, uova fatte bene, posto in vetrina se arrivi prima delle 11.",
  "Um cafe de esquina iluminado que faz brunch de fim de semana certo. Filtrado forte, ovos bem feitos, lugar na janela se chegar antes das 11.",
  "Un cafe d'angle lumineux qui fait le brunch comme il faut. Filtre serieux, oeufs maitrises, place fenetre si vous arrivez avant 11h."
],
'do-et-riz-paris': [
  "An aperitivo-friendly counter that pivots between rice bowls and small plates with a glass of natural wine. Easy weekday move.",
  "Un banco perfetto per aperitivo che alterna bowl di riso e piccoli piatti con un calice di vino naturale. Mossa facile in settimana.",
  "Um balcao otimo para aperitivo que oscila entre bowls de arroz e pratos pequenos com uma taca de vinho natural. Jogada facil de semana.",
  "Un comptoir parfait pour l'aperitivo qui oscille entre bols de riz et petits plats avec un verre de vin nature. Bon plan de semaine."
],
'jinchan-shokudo-paris': [
  "A tiny Japanese shokudo with a short menu of rice bowls and noodles. Sit at the bar, slurp, leave fed.",
  "Un piccolo shokudo giapponese con una carta corta di bowl di riso e noodle. Siedi al banco, slurpa, esci sazio.",
  "Um pequeno shokudo japones com menu curto de bowls de arroz e macarrao. Sente no balcao, surva, saia satisfeito.",
  "Un petit shokudo japonais avec une courte carte de bols de riz et de nouilles. Asseyez-vous au bar, slurpez, repartez rassasies."
],
'fika-paris': [
  "Swedish cafe vibes in the Marais: kanelbullar, cardamom buns, drip coffee. The right pause mid-walk.",
  "Atmosfera da cafe svedese nel Marais: kanelbullar, brioche al cardamomo, caffe filtro. La pausa giusta a meta passeggiata.",
  "Clima de cafe sueco no Marais: kanelbullar, brioches de cardamomo, cafe filtrado. A pausa certa no meio do passeio.",
  "Ambiance cafe suedois dans le Marais: kanelbullar, brioches a la cardamome, cafe filtre. La bonne pause au milieu d'une balade."
],
'torre-coffee-shop-paris': [
  "Specialty coffee with three filters on the bar and a small pastry case. Two stools, a window seat, take it slow.",
  "Specialty coffee con tre filtri al banco e una piccola vetrinetta di pasticceria. Due sgabelli, un posto in vetrina, prenditela comoda.",
  "Specialty coffee com tres filtros no balcao e uma vitrine pequena de doces. Dois bancos, lugar na janela, sem pressa.",
  "Cafe de specialite avec trois filtres au comptoir et une petite vitrine a patisseries. Deux tabourets, place fenetre, prenez votre temps."
],
'le-piaf-paris-paris': [
  "An old-Paris brasserie crossed with a piano bar. Steak frites, a singer at 11, a Champagne coupe to close it.",
  "Una brasserie alla vecchia Parigi incrociata con un piano bar. Steak frites, una cantante alle 23, una coupe di champagne per chiudere.",
  "Uma brasserie do velho Paris cruzada com piano bar. Steak frites, uma cantora as 23h, uma taca de champanhe para fechar.",
  "Une brasserie a l'ancienne croisee avec un piano-bar. Steak frites, une chanteuse a 23h, une coupe de champagne pour finir."
],
'tiger-paris': [
  "A Thai-leaning kitchen on a Marais corner. Pad krapow, green curry, beer cold enough to hold the spice.",
  "Una cucina di matrice thai a un angolo del Marais. Pad krapow, curry verde, birra abbastanza fredda da tenere il piccante.",
  "Uma cozinha de pegada tailandesa numa esquina do Marais. Pad krapow, curry verde, cerveja gelada o suficiente para segurar a pimenta.",
  "Une cuisine d'inspiration thai a un coin du Marais. Pad krapow, curry vert, biere assez froide pour tenir le piment."
],
'gabriela-paris': [
  "A modern, low-key wine bar with a tight food menu and a Latin American playlist. Friendly room, late finish.",
  "Un wine bar moderno e tranquillo con una carta cibo essenziale e una playlist latinoamericana. Sala amichevole, chiusura tarda.",
  "Um wine bar moderno e tranquilo com menu de comida enxuto e playlist latino-americana. Sala simpatica, fechamento tardio.",
  "Un bar a vin moderne et discret avec une carte de plats serree et une playlist latino. Salle amicale, ca finit tard."
],
'kb-cafeshop-paris': [
  "A pioneer of Paris third-wave coffee in SoPi. Strong espresso, decent flat white, walk-by order energy.",
  "Un pioniere del third-wave coffee parigino in SoPi. Espresso forte, flat white decente, energia da ordine al volo.",
  "Um pioneiro do third-wave coffee parisiense em SoPi. Espresso forte, flat white decente, energia de pedido na correria.",
  "Un pionnier de la troisieme vague du cafe parisien a SoPi. Espresso costaud, flat white correct, energie de commande a la volee."
],
'noir-coffee-shop-torrefacteur-paris': [
  "An in-house roaster cafe with serious filters and a hands-off bar. Quiet morning, ten minutes flat.",
  "Un cafe con torrefazione interna, filtri seri e un bar che non insiste. Mattinata silenziosa, dieci minuti netti.",
  "Um cafe com torrefacao propria, filtros serios e um balcao discreto. Manha silenciosa, dez minutos certinhos.",
  "Un cafe avec torrefaction maison, vrais filtres et un comptoir discret. Matinee tranquille, dix minutes pile."
],
'frenchie-bar-a-vins-paris': [
  "Greg Marchand's natural wine bar opposite his restaurant. Small plates, big personality, no reservations.",
  "Il wine bar naturale di Greg Marchand di fronte al suo ristorante. Piccoli piatti, grande personalita, niente prenotazioni.",
  "O wine bar natural de Greg Marchand em frente ao restaurante dele. Pratos pequenos, personalidade grande, sem reservas.",
  "Le bar a vin nature de Greg Marchand face a son restaurant. Petits plats, grande personnalite, pas de reservation."
],
'manie-cafe-est-1938-paris': [
  "A 1938 corner cafe still doing it the right way. Cafe creme, croissant, watch the street through the window.",
  "Un cafe d'angolo del 1938 che continua a farlo come si deve. Cafe creme, croissant, guarda la strada dalla vetrina.",
  "Um cafe de esquina de 1938 que continua fazendo do jeito certo. Cafe creme, croissant, observe a rua pela janela.",
  "Un cafe de coin de 1938 qui le fait toujours comme il faut. Cafe creme, croissant, regardez la rue par la fenetre."
],
'mood-coffee-shop-paris': [
  "Soft music, soft light, a serious espresso bar. Park yourself for an hour and let Paris move outside.",
  "Musica soffusa, luce calda, un serio bar dell'espresso. Mettiti li per un'ora e lascia che Parigi scorra fuori.",
  "Musica suave, luz baixa, um bar de espresso serio. Estacione por uma hora e deixe Paris correr la fora.",
  "Musique douce, lumiere chaude, un vrai bar a espresso. Posez-vous une heure et laissez Paris bouger dehors."
],
'le-404-paris': [
  "A Moroccan-Berber restaurant in the Marais since the 90s. Tagine, couscous, mint tea poured high. Reserve.",
  "Un ristorante marocchino-berbero nel Marais dagli anni '90. Tagine, couscous, te alla menta versato dall'alto. Prenota.",
  "Um restaurante marroquino-berbere no Marais desde os anos 90. Tagine, cuscuz, cha de hortela despejado bem alto. Reserve.",
  "Un restaurant marocain-berbere du Marais depuis les annees 90. Tagine, couscous, the a la menthe verse haut. Reservez."
],
'goute-paris': [
  "A wine-and-cheese counter with a long ardoise. Pick three cheeses, order whichever bottle the staff suggests.",
  "Un banco vino-e-formaggio con una lunga ardoise. Scegli tre formaggi, ordina la bottiglia consigliata dallo staff.",
  "Um balcao de vinho e queijo com uma ardoise longa. Escolham tres queijos, peca a garrafa que a equipe sugerir.",
  "Un comptoir vin-fromage avec une longue ardoise. Choisissez trois fromages, commandez la bouteille que conseille l'equipe."
],
'arnaud-nicolas-paris': [
  "A romantic dining room from the eponymous charcutier. Pate en croute taken seriously, a tight French menu, a deep pour.",
  "Una romantica sala da pranzo del salumiere omonimo. Pate en croute fatto sul serio, carta francese essenziale, calici generosi.",
  "Uma sala romantica do charcutier homonimo. Pate en croute levado a serio, carta francesa enxuta, taca generosa.",
  "Une salle romantique du charcutier eponyme. Pate en croute pris au serieux, courte carte francaise, verre genereux."
],
'ha-noi-1988-paris': [
  "A Hanoi-style canteen for pho and bun cha. Order both, share, finish with cha ca if it is on.",
  "Una mensa stile Hanoi per pho e bun cha. Ordina entrambi, dividi, chiudi con un cha ca se c'e.",
  "Uma cantina estilo Hanoi para pho e bun cha. Pecam os dois, dividam, fechem com cha ca se tiver.",
  "Une cantine type Hanoi pour pho et bun cha. Commandez les deux, partagez, finissez par un cha ca s'il y en a."
],
'terres-de-cafe-paris': [
  "A roaster's cafe with serious single-origin filters and a knowledgeable bar. Buy a bag on the way out.",
  "Il cafe di un torrefattore con filtri seri di mono-origine e un bar competente. Compra un sacchetto in uscita.",
  "O cafe de um torrefador com filtros serios de origem unica e um balcao bem informado. Compre um saco na saida.",
  "Le cafe d'un torrefacteur avec de vrais filtres mono-origine et un comptoir cale. Achetez un sachet en partant."
],
'les-parisiens-paris': [
  "A bistrot inside the Pavillon Faubourg with a market-driven menu. Mid-century room, easy lunch, easy dinner.",
  "Un bistrot dentro il Pavillon Faubourg con menu di mercato. Sala mid-century, pranzo facile, cena facile.",
  "Um bistro dentro do Pavillon Faubourg com menu de mercado. Sala mid-century, almoco facil, jantar facil.",
  "Un bistrot dans le Pavillon Faubourg avec une carte du marche. Salle mid-century, dejeuner facile, diner facile."
],
'laize-sainte-avoye-paris': [
  "A Marais wine bar with a curated small list and plates to graze. Order three rounds, do not rush.",
  "Un wine bar nel Marais con una piccola lista curata e piatti da spizzicare. Ordina tre giri, niente fretta.",
  "Um wine bar no Marais com uma carta pequena e curada e pratos para beliscar. Pecam tres rodadas, sem pressa.",
  "Un bar a vin du Marais avec une petite carte choisie et des plats a picorer. Commandez trois tournees, ne vous pressez pas."
],
'cafe-dauteur-specialty-coffee-paris-paris': [
  "A specialty coffee bar with a writer's lamp on every table. Strong filter, slow pace, book-friendly.",
  "Un bar di specialty coffee con una lampada da scrittore su ogni tavolo. Filtro forte, ritmo lento, accoglie i libri.",
  "Um bar de specialty coffee com lampada de escritor em cada mesa. Filtrado forte, ritmo lento, amigavel para livros.",
  "Un bar a cafe de specialite avec une lampe d'ecrivain sur chaque table. Filtre serieux, rythme lent, ami des livres."
],
'bistro-mee-paris': [
  "A Korean wine bistro for grilled meats, kimchi, and natural wine. Tight room; book early.",
  "Un bistro coreano da carni grigliate, kimchi e vini naturali. Sala stretta; prenota presto.",
  "Um bistro coreano para carnes grelhadas, kimchi e vinhos naturais. Sala apertada; reserve cedo.",
  "Un bistrot coreen pour viandes grillees, kimchi et vins nature. Salle serree; reservez tot."
],
'lolo-cave-a-manger-paris': [
  "A cave a manger with two dozen seats, a long list, and plates that change with the morning's market. Trust the staff.",
  "Una cave a manger con due dozzine di posti, una lunga lista e piatti che cambiano col mercato del mattino. Fidati dello staff.",
  "Uma cave a manger com vinte e poucos lugares, carta longa e pratos que mudam com a feira da manha. Confie na equipe.",
  "Une cave a manger avec une vingtaine de places, une longue liste et des plats qui changent avec le marche du matin. Faites confiance a l'equipe."
],
'brasserie-dubillot-paris': [
  "A retro French brasserie from the Big Mamma group. Steak tartare, vol-au-vent, oeuf mayo. Loud, lit, fun.",
  "Una brasserie francese retro del gruppo Big Mamma. Steak tartare, vol-au-vent, oeuf mayo. Rumorosa, illuminata, divertente.",
  "Uma brasserie francesa retro do grupo Big Mamma. Steak tartare, vol-au-vent, oeuf mayo. Barulhento, iluminado, divertido.",
  "Une brasserie francaise retro du groupe Big Mamma. Steak tartare, vol-au-vent, oeuf mayo. Bruyant, eclaire, fun."
],
'lavant-comptoir-du-marche-paris': [
  "Yves Camdeborde's standing-only tapas comptoir near the marche. No reservations, hung ham, perfect croquetas.",
  "Il comptoir di tapas in piedi di Yves Camdeborde vicino al marche. Niente prenotazioni, prosciutti appesi, croquetas perfette.",
  "O comptoir de tapas em pe de Yves Camdeborde perto do marche. Sem reservas, presunto pendurado, croquetas perfeitas.",
  "Le comptoir a tapas debout d'Yves Camdeborde pres du marche. Pas de reservation, jambons suspendus, croquetas parfaites."
],
'la-gentiane-paris': [
  "A neighborhood spot for natural wine and a chalkboard menu of two starters, two plats, two desserts. Sit at the bar.",
  "Un posto di quartiere per vino naturale e una lavagna con due antipasti, due secondi, due dolci. Siedi al banco.",
  "Um lugar de bairro para vinho natural e um quadro com duas entradas, dois pratos, duas sobremesas. Sente no balcao.",
  "Un endroit de quartier pour le vin nature avec une ardoise de deux entrees, deux plats, deux desserts. Asseyez-vous au comptoir."
],
'musee-marmottan-monet-paris': [
  "The world's largest collection of Monet, including the actual Impression, soleil levant. Quiet, calm, off the tour grid.",
  "La piu grande collezione al mondo di Monet, compreso l'originale Impression, soleil levant. Silenzioso, calmo, fuori dai percorsi turistici.",
  "A maior colecao de Monet do mundo, incluindo o original Impression, soleil levant. Silencioso, calmo, fora do circuito turistico.",
  "La plus grande collection de Monet au monde, dont l'Impression, soleil levant lui-meme. Calme, silencieux, hors des circuits."
],
'le-temple-celeste-cuisine-familiale-chinoise-paris': [
  "A Chinese family kitchen with a hand-written menu and grandmother's recipes. Order the dumplings and the eggplant.",
  "Una cucina familiare cinese con menu scritto a mano e ricette della nonna. Ordina i ravioli e le melanzane.",
  "Uma cozinha chinesa familiar com menu manuscrito e receitas da avo. Pecam os ravioli e a berinjela.",
  "Une cuisine chinoise familiale avec carte manuscrite et recettes de grand-mere. Commandez les raviolis et l'aubergine."
],
'mori-yoshida-paris': [
  "A Japanese patissier in the 7e. Mille-feuille, paris-brest, mont blanc, each one a small precise sculpture.",
  "Un pasticciere giapponese nel 7e. Mille-feuille, paris-brest, mont blanc, ogni dolce una piccola scultura precisa.",
  "Um confeiteiro japones no 7e. Mille-feuille, paris-brest, mont blanc, cada doce uma pequena escultura precisa.",
  "Un patissier japonais dans le 7e. Mille-feuille, paris-brest, mont blanc, chacun une petite sculpture precise."
],
'le-royal-china-paris': [
  "Cantonese in the 8e with proper dim sum at lunch and a long menu of classics at dinner. Spin the lazy susan.",
  "Cantonese nell'8e con veri dim sum a pranzo e un lungo menu di classici a cena. Gira la lazy susan.",
  "Cantonesa no 8e com dim sum de verdade no almoco e um longo cardapio de classicos no jantar. Gire a lazy susan.",
  "Cantonais dans le 8e avec de vrais dim sum au dejeuner et une longue carte de classiques le soir. Tournez la lazy susan."
],
'le-bistrot-des-fables-paris': [
  "A small romantic bistrot with a hand-written carte and old-style French plates. Candlelight, two carafes.",
  "Un piccolo bistrot romantico con la carta scritta a mano e piatti francesi classici. Candele, due caraffe.",
  "Um pequeno bistro romantico com carta escrita a mao e pratos franceses a antiga. Luz de vela, duas jarras.",
  "Un petit bistrot romantique avec carte manuscrite et plats francais a l'ancienne. Bougies, deux pichets."
],
'cafe-du-clown-paris': [
  "A neighborhood cafe near Republique with strong filter and a window facing the street life. Stop for forty minutes.",
  "Un cafe di quartiere vicino a Republique con filtro forte e una vetrina sulla vita di strada. Fermati per quaranta minuti.",
  "Um cafe de bairro perto da Republique com filtrado forte e janela para a rua. Pare por quarenta minutos.",
  "Un cafe de quartier pres de Republique avec un bon filtre et une fenetre sur la vie de la rue. Posez-vous quarante minutes."
],
'antipublic-library-paris': [
  "A bookstore-gallery hybrid for art and photo books. Browse for an hour, leave with three things, walk to the canal.",
  "Un ibrido libreria-galleria per libri d'arte e fotografia. Curiosa per un'ora, esci con tre cose, cammina fino al canale.",
  "Um hibrido livraria-galeria para livros de arte e fotografia. Fucem por uma hora, saiam com tres coisas, andem ate o canal.",
  "Une librairie-galerie pour livres d'art et de photo. Fouinez une heure, repartez avec trois choses, marchez jusqu'au canal."
],
'cafe-charlot-paris': [
  "A red-awning Marais classic with terrace people-watching and a long breakfast menu. Eggs, cafe creme, slow morning.",
  "Un classico del Marais con tendalino rosso, terrazza per guardare la gente e una lunga carta colazione. Uova, cafe creme, mattinata lenta.",
  "Um classico do Marais com toldo vermelho, terraco para observar as pessoas e um longo menu de cafe da manha. Ovos, cafe creme, manha lenta.",
  "Un classique du Marais a store rouge, terrasse a regarder les gens et longue carte de petit-dejeuner. Oeufs, cafe creme, matinee lente."
],
'glazed-pasteur-paris': [
  "A modern donut and coffee counter in Pasteur. Five flavors a day, espresso, a window seat that pays off.",
  "Un banco moderno di donut e caffe a Pasteur. Cinque gusti al giorno, espresso, un posto in vetrina che ripaga.",
  "Um balcao moderno de donuts e cafe em Pasteur. Cinco sabores por dia, espresso, lugar na janela que vale a pena.",
  "Un comptoir moderne de donuts et cafe a Pasteur. Cinq parfums par jour, espresso, place fenetre qui en vaut la peine."
],
'les-antiquaires-paris': [
  "A romantic French bistrot with red banquettes and a market-driven menu. Reservation needed; ask for the back room.",
  "Un romantico bistrot francese con divanetti rossi e un menu di mercato. Servono prenotazioni; chiedi la sala in fondo.",
  "Um bistro frances romantico com banquetas vermelhas e menu de mercado. Reserva necessaria; peca a sala dos fundos.",
  "Un bistrot francais romantique aux banquettes rouges et carte du marche. Reservation indispensable; demandez la salle du fond."
],
'des-gateaux-et-du-pain-paris': [
  "Claire Damon's exacting patisserie. Seasonal tarts, hand-laminated viennoiserie, an espresso to wash it down.",
  "La patisserie esigente di Claire Damon. Tarte di stagione, viennoiserie laminata a mano, un espresso per chiudere.",
  "A patisserie rigorosa de Claire Damon. Tortas sazonais, viennoiseries laminadas a mao, um espresso para fechar.",
  "La patisserie exigeante de Claire Damon. Tartes de saison, viennoiserie laminee a la main, un espresso pour faire passer."
],
'la-patisserie-cyril-lignac-paul-bert-paris': [
  "Cyril Lignac's Bastille pastry shop. Tarte au citron, equinoxe, the perfect baba. Buy three, eat them on the curb.",
  "La pasticceria di Cyril Lignac alla Bastille. Tarte al limone, equinoxe, il baba perfetto. Comprane tre, mangiali sul marciapiede.",
  "A pasticceria de Cyril Lignac na Bastille. Tarte de limao, equinoxe, o baba perfeito. Comprem tres, comam na calcada.",
  "La patisserie de Cyril Lignac a la Bastille. Tarte au citron, equinoxe, le baba parfait. Achetez-en trois, mangez-les sur le trottoir."
],
'bistrot-paul-bert-paris': [
  "The bistrot Parisians keep recommending to each other. Steak au poivre, paris-brest, a carafe of red. Book a month ahead.",
  "Il bistrot che i parigini si raccomandano l'un l'altro. Steak au poivre, paris-brest, una caraffa di rosso. Prenota un mese prima.",
  "O bistro que os parisienses ficam indicando uns aos outros. Steak au poivre, paris-brest, uma jarra de tinto. Reserve com um mes.",
  "Le bistrot que les Parisiens se recommandent entre eux. Steak au poivre, paris-brest, un pichet de rouge. Reservez un mois a l'avance."
],
'hando-parisian-handroll-paris': [
  "A Japanese handroll counter where rice still steams when nori meets fish. Ten seats, ten rolls, gone in thirty minutes.",
  "Un counter giapponese di handroll dove il riso fuma ancora quando la nori incontra il pesce. Dieci posti, dieci roll, finiti in trenta minuti.",
  "Um balcao japones de handrolls onde o arroz ainda solta vapor quando a nori encontra o peixe. Dez lugares, dez rolls, em trinta minutos.",
  "Un comptoir japonais de handrolls ou le riz fume encore quand le nori rencontre le poisson. Dix places, dix rouleaux, plies en trente minutes."
],
'musee-dorsay-paris': [
  "The Impressionist museum in a former Belle Epoque train station. Skip to the top floor first: Van Gogh, Monet, Cezanne.",
  "Il museo degli impressionisti in un'ex stazione Belle Epoque. Salta dritto all'ultimo piano: Van Gogh, Monet, Cezanne.",
  "O museu dos impressionistas numa antiga estacao Belle Epoque. Va direto para o ultimo andar: Van Gogh, Monet, Cezanne.",
  "Le musee des impressionnistes dans une ancienne gare Belle Epoque. Foncez d'abord au dernier etage: Van Gogh, Monet, Cezanne."
],
'delicatessen-cave-paris': [
  "A wine shop with a back room that pours and plates. Charcuterie, a bottle off the shelf, no fuss.",
  "Una bottega di vini con una saletta sul retro che mesce e impiatta. Salumi, una bottiglia dal banco, niente fronzoli.",
  "Uma loja de vinhos com uma salinha dos fundos que serve em copo e prato. Charcutaria, garrafa da prateleira, sem firula.",
  "Un caviste avec un arriere-salle qui sert et dresse. Charcuterie, une bouteille prise au rayon, sans chichi."
],
'musee-national-picasso-paris-paris': [
  "Picasso's Marais museum, set in the Hotel Sale. The collection moves through every period; book the late slot.",
  "Il museo Picasso del Marais, dentro l'Hotel Sale. La collezione attraversa ogni periodo; prenota lo slot serale.",
  "O museu Picasso do Marais, dentro do Hotel Sale. A colecao percorre todos os periodos; marque o horario tarde.",
  "Le musee Picasso du Marais, dans l'hotel Sale. La collection traverse toutes les periodes; reservez le creneau tardif."
],
'restaurant-drouant-paris': [
  "The Goncourt's home restaurant since 1914. Velvet booths, foie gras en cocotte, an evening that feels literary.",
  "Il ristorante storico del Premio Goncourt dal 1914. Divanetti in velluto, foie gras en cocotte, una serata che sa di letteratura.",
  "O restaurante historico do Premio Goncourt desde 1914. Banquetas de veludo, foie gras en cocotte, uma noite com cara de literatura.",
  "Le restaurant des Goncourt depuis 1914. Banquettes de velours, foie gras en cocotte, une soiree litteraire."
],
'so-paris-paris': [
  "A high-rise hotel bar in the 4e with a panoramic terrace. Reserve the sunset; sit close to the window.",
  "Un bar d'hotel in altezza nel 4e con terrazza panoramica. Prenota il tramonto; siedi vicino alla vetrata.",
  "Um bar de hotel em altura no 4e com terraco panoramico. Reserve no por do sol; sente perto da vidraca.",
  "Un bar d'hotel en hauteur dans le 4e avec terrasse panoramique. Reservez au coucher du soleil; placez-vous pres de la baie vitree."
],
'vla-leandre-paris': [
  "A modern Parisian neo-bistrot with a market menu and a confident wine list. Ten tables, candlelight.",
  "Un moderno neo-bistrot parigino con menu di mercato e una carta dei vini sicura. Dieci tavoli, candele.",
  "Um neo-bistro parisiense moderno com menu de mercado e uma carta de vinhos confiante. Dez mesas, luz de vela.",
  "Un neo-bistrot parisien moderne avec une carte du marche et une vraie carte des vins. Dix tables, bougies."
],
'double-dragon-paris': [
  "A pan-Asian small plates spot for fried chicken, dumplings, and bao. Order three rounds; share a beer tower.",
  "Un piccolo posto pan-asiatico per pollo fritto, ravioli e bao. Ordina tre giri; condividete una torre di birra.",
  "Um lugar pan-asiatico de pratos pequenos para frango frito, dumplings e bao. Pecam tres rodadas; dividam uma torre de cerveja.",
  "Un spot pan-asiatique en petites portions pour poulet frit, dumplings et bao. Trois tournees; partagez une tour de biere."
],
'steam-bar-paris': [
  "A speakeasy-style cocktail room with a steam-engine theme. Smoke, copper, drinks that take ten minutes.",
  "Una sala cocktail in stile speakeasy con tema locomotiva a vapore. Fumo, rame, drink che richiedono dieci minuti.",
  "Uma sala de cocktails estilo speakeasy com tema de locomotiva a vapor. Fumaca, cobre, drinks que levam dez minutos.",
  "Une salle a cocktails type speakeasy a theme machine a vapeur. Fumee, cuivre, drinks qui prennent dix minutes."
],
'cafe-de-la-poste-paris': [
  "A Marais corner cafe with marble-topped tables and a paper-tablecloth lunch. Croque, salade, glass of red.",
  "Un cafe d'angolo nel Marais con tavoli di marmo e pranzo con tovaglietta di carta. Croque, salade, calice di rosso.",
  "Um cafe de esquina no Marais com mesas de marmore e almoco em toalha de papel. Croque, salade, taca de tinto.",
  "Un cafe de coin du Marais avec tables a marbre et dejeuner sur nappe en papier. Croque, salade, verre de rouge."
],
'avant-comptoir-de-la-terre-paris': [
  "Another Yves Camdeborde standing comptoir, focused on land over sea. Charcuterie hanging overhead; order what catches your eye.",
  "Un altro comptoir in piedi di Yves Camdeborde, concentrato su terra anziche mare. Salumi appesi sopra; ordina cio che ti colpisce.",
  "Outro comptoir em pe de Yves Camdeborde, focado em terra mais que mar. Charcutaria pendurada; peca o que chamar a atencao.",
  "Un autre comptoir debout d'Yves Camdeborde, axe terre plus que mer. Charcuterie au plafond; commandez ce qui vous parle."
],
'pacifique-paris': [
  "A pan-Pacific kitchen for raw fish, ceviche, and rice bowls. Long bar, easy energy, fast turnover.",
  "Una cucina pan-pacifica per pesce crudo, ceviche e bowl di riso. Bancone lungo, energia easy, ricambio rapido.",
  "Uma cozinha pan-pacifica para peixe cru, ceviche e bowls de arroz. Balcao longo, energia leve, rotatividade rapida.",
  "Une cuisine pan-Pacifique pour le poisson cru, le ceviche et les bols de riz. Long bar, ambiance facile, rotation rapide."
],
'compagnie-des-vins-surnaturels-paris': [
  "A natural wine bar from the Experimental Group. Twelve seats, three-glass flights, plates that go long.",
  "Un wine bar di vini naturali del gruppo Experimental. Dodici posti, degustazioni a tre calici, piatti che si allungano.",
  "Um wine bar de vinhos naturais do grupo Experimental. Doze lugares, flights de tres tacas, pratos que esticam.",
  "Un bar a vin nature du groupe Experimental. Douze places, degustations en trois verres, plats qui durent."
],
'grandc-ur-paris': [
  "A romantic Saint-Germain dining room with a cobbled courtyard and confident French cooking. Reserve outside.",
  "Una romantica sala da pranzo a Saint-Germain con un cortile in pietra e una sicura cucina francese. Prenota fuori.",
  "Uma sala romantica em Saint-Germain com patio de pedra e cozinha francesa segura. Reserve la fora.",
  "Une salle romantique a Saint-Germain avec une cour pavee et une cuisine francaise sure. Reservez dehors."
],
'kodawari-ramen-tsukiji-paris': [
  "A Tokyo-style ramen counter built like the Tsukiji fish market. Tonkotsu, gyoza, eat fast.",
  "Un counter ramen in stile Tokyo costruito come il mercato del pesce di Tsukiji. Tonkotsu, gyoza, mangia veloce.",
  "Um balcao de ramen estilo Toquio construido como o mercado de peixes de Tsukiji. Tonkotsu, gyoza, coma rapido.",
  "Un comptoir a ramen style Tokyo construit comme le marche aux poissons de Tsukiji. Tonkotsu, gyoza, mangez vite."
],
'louis-vuitton-foundation-paris': [
  "Frank Gehry's glass-sail building in the Bois de Boulogne. Contemporary shows, a long roof walk, a half-day commitment.",
  "L'edificio a vele di vetro di Frank Gehry nel Bois de Boulogne. Mostre contemporanee, un lungo percorso sul tetto, mezza giornata.",
  "O predio de velas de vidro de Frank Gehry no Bois de Boulogne. Mostras contemporaneas, uma longa caminhada no telhado, meio dia.",
  "Le batiment a voiles de verre de Frank Gehry au Bois de Boulogne. Expositions contemporaines, longue deambulation sur le toit, une demi-journee."
],
'artesano-specialty-coffee-roaster-paris': [
  "A small Latin-led specialty roastery in the 9e. Single origins, transparent menu, the kind of bar that asks questions.",
  "Una piccola torrefazione specialty di taglio latino nel 9e. Mono-origine, menu trasparente, un banco che fa domande.",
  "Uma pequena torrefacao specialty de pegada latina no 9e. Origens unicas, menu transparente, um balcao que faz perguntas.",
  "Une petite torrefaction de specialite de tradition latine dans le 9e. Mono-origine, carte transparente, un bar qui pose des questions."
],
'bofinger-paris': [
  "The 1864 brasserie next to Bastille, with a stained-glass cupola and the most beautiful banquettes in town. Choucroute, oysters.",
  "La brasserie del 1864 accanto alla Bastille, con cupola di vetro colorato e i divanetti piu belli della citta. Choucroute, ostriche.",
  "A brasserie de 1864 ao lado da Bastille, com cupula de vitrais e as banquetas mais bonitas da cidade. Choucroute, ostras.",
  "La brasserie de 1864 a cote de la Bastille, avec sa coupole en vitraux et les plus belles banquettes de la ville. Choucroute, huitres."
],
'luxembourg-gardens-paris': [
  "The 6e gardens of choice: gravel, chairs to drag, a pond for toy boats, the Medici fountain in the shade.",
  "I giardini del 6e per eccellenza: ghiaia, sedie da spostare, un laghetto per le barchette, la fontana Medicea all'ombra.",
  "Os jardins do 6e por excelencia: cascalho, cadeiras para arrastar, um lago para barquinhos, a fonte Medici a sombra.",
  "Le jardin du 6e par excellence: gravier, chaises a tirer, bassin pour les bateaux jouets, fontaine Medicis a l'ombre."
],
'le-relais-de-lentrecote-paris': [
  "Steak frites and one salad. No reservations, queue politely, eat, leave. There is genius in the limit.",
  "Steak frites e un'insalata. Niente prenotazioni, in coda con educazione, mangi, vai. C'e del genio nel limite.",
  "Steak frites e uma salada. Sem reservas, fila educada, come, sai. Tem genialidade no limite.",
  "Steak frites et une salade. Pas de reservation, queue polie, on mange, on sort. Le genie est dans la limite."
],
'les-maquereaux-paris': [
  "A modern bistrot with a fish-forward menu and a tight natural wine list. Plats du jour, easy night.",
  "Un moderno bistrot con menu di pesce e una stretta carta di vini naturali. Plats du jour, serata facile.",
  "Um bistro moderno com menu focado em peixe e uma carta enxuta de vinhos naturais. Plats du jour, noite facil.",
  "Un bistrot moderne avec carte tournee poisson et une carte courte de vins nature. Plats du jour, soiree facile."
],
'deux-fois-plus-de-piment-paris': [
  "Sichuan hand-pulled noodles, dan dan, twice-cooked pork. Numbers on the menu indicate spice; respect them.",
  "Sichuan: noodle tirati a mano, dan dan, maiale due cotture. I numeri sul menu indicano il piccante; rispettali.",
  "Sichuan: macarrao puxado a mao, dan dan, porco duas vezes cozido. Os numeros do menu indicam pimenta; respeite.",
  "Sichuan: nouilles tirees a la main, dan dan, porc deux cuissons. Les chiffres au menu indiquent le piment; respectez-les."
],
'pny-marais-paris': [
  "The original of the PNY burger group. Smashburgers, soft buns, a milkshake to chase. Loud and good.",
  "L'originale del gruppo burger PNY. Smashburger, panini soffici, un milkshake per chiudere. Rumoroso e buono.",
  "O original do grupo de hamburguer PNY. Smashburgers, paes macios, milkshake para fechar. Barulhento e bom.",
  "L'original du groupe burger PNY. Smashburgers, pains moelleux, milkshake pour finir. Bruyant et bon."
],
'le-grand-vefour-paris': [
  "An 18th-century palace dining room under the arcades of the Palais Royal. Frescoed ceilings, white gloves, the full deal.",
  "Una sala da pranzo settecentesca sotto i portici del Palais Royal. Soffitti affrescati, guanti bianchi, esperienza completa.",
  "Uma sala palaciana do seculo XVIII sob as galerias do Palais Royal. Tetos em afresco, luvas brancas, experiencia completa.",
  "Une salle palatiale du XVIIIe sous les arcades du Palais Royal. Plafonds peints, gants blancs, l'experience complete."
],
'partisan-cafe-artisanal-paris': [
  "A specialty cafe with three filters on the bar and a quiet table to write at. Bring a notebook.",
  "Un cafe specialty con tre filtri al banco e un tavolo silenzioso per scrivere. Porta un taccuino.",
  "Um cafe specialty com tres filtros no balcao e uma mesa silenciosa para escrever. Leve um caderno.",
  "Un cafe de specialite avec trois filtres au comptoir et une table tranquille pour ecrire. Apportez un carnet."
],
'la-terrasse-du-7-paris': [
  "A 7e rooftop with the Eiffel Tower one block to the south. Order the sunset; arrive forty-five minutes ahead.",
  "Un rooftop nel 7e con la Tour Eiffel un isolato a sud. Ordina il tramonto; arriva con quarantacinque minuti d'anticipo.",
  "Um rooftop no 7e com a Torre Eiffel a uma quadra ao sul. Marque o por do sol; chegue 45 minutos antes.",
  "Un rooftop dans le 7e avec la Tour Eiffel a une rue au sud. Reservez le coucher du soleil; arrivez quarante-cinq minutes en avance."
],
'bourse-de-commerce-pinault-collection-paris': [
  "Tadao Ando's concrete cylinder inside the old corn exchange, with the Pinault collection in rotation. Free first Saturday.",
  "Il cilindro di cemento di Tadao Ando dentro l'antica borsa del grano, con la collezione Pinault in rotazione. Gratis il primo sabato.",
  "O cilindro de concreto de Tadao Ando dentro da antiga bolsa do trigo, com a colecao Pinault em rotacao. Gratis no primeiro sabado.",
  "Le cylindre en beton de Tadao Ando dans l'ancienne bourse au ble, avec la collection Pinault en rotation. Gratuit le premier samedi."
],
'le-chardenoux-paris': [
  "Cyril Lignac's bistrot near the Bastille. Saucisson chaud, blanquette, perfectly worn marble bar.",
  "Il bistrot di Cyril Lignac vicino a Bastille. Saucisson chaud, blanquette, banco di marmo segnato dal tempo.",
  "O bistro de Cyril Lignac perto da Bastille. Saucisson chaud, blanquette, balcao de marmore perfeitamente patinado.",
  "Le bistrot de Cyril Lignac pres de la Bastille. Saucisson chaud, blanquette, comptoir de marbre patine."
],
'flow-paris-paris': [
  "A floating bar on the Seine near Les Invalides. Drinks in plastic, the city sliding past, water under the chairs.",
  "Un bar galleggiante sulla Senna vicino agli Invalides. Drink in plastica, la citta che scorre, l'acqua sotto le sedie.",
  "Um bar flutuante no Sena perto dos Invalides. Drinks em plastico, a cidade passando, agua embaixo das cadeiras.",
  "Un bar flottant sur la Seine pres des Invalides. Drinks en plastique, la ville qui defile, l'eau sous les chaises."
],
'joayo-haussmann-paris': [
  "Korean comfort food near Opera: bibimbap in stone bowls, kimchi pancakes, makgeolli. Cheap, fast, no fuss.",
  "Comfort food coreano vicino a Opera: bibimbap nella ciotola di pietra, pancake al kimchi, makgeolli. Economico, veloce, niente fronzoli.",
  "Comfort food coreano perto da Opera: bibimbap em tigela de pedra, panqueca de kimchi, makgeolli. Barato, rapido, sem firula.",
  "Comfort food coreen pres de l'Opera: bibimbap en bol de pierre, pancake au kimchi, makgeolli. Pas cher, rapide, sans chichi."
],
'bb-blanche-paris': [
  "A cool wine bar in Pigalle with bright food and a long natural list. Sit at the bar, ask, taste, decide.",
  "Un cool wine bar a Pigalle con cibo luminoso e una lunga carta naturale. Siedi al banco, chiedi, assaggia, decidi.",
  "Um wine bar descolado em Pigalle com comida vibrante e uma carta longa de naturais. Sente no balcao, pergunte, prove, escolha.",
  "Un bar a vin cool a Pigalle avec une cuisine fraiche et une longue carte nature. Au comptoir: demandez, goutez, choisissez."
],
'maze-paris-paris': [
  "A small bar in the 11e with cocktails built like puzzles and a music selection that rewards listening.",
  "Un piccolo bar nell'11e con cocktail costruiti come puzzle e una scelta musicale che premia l'ascolto.",
  "Um bar pequeno no 11e com drinks construidos como quebra-cabecas e uma selecao musical que recompensa quem escuta.",
  "Un petit bar dans le 11e avec des cocktails montes comme des puzzles et une selection musicale qui recompense l'ecoute."
],
'encore-la-paris': [
  "A modern wine bar with a market kitchen and a quiet hum. Plates change weekly; pours come generous.",
  "Un moderno wine bar con cucina di mercato e un brusio basso. I piatti cambiano ogni settimana; i calici arrivano generosi.",
  "Um wine bar moderno com cozinha de mercado e murmurio baixo. Pratos mudam semanalmente; tacas vem generosas.",
  "Un bar a vin moderne avec cuisine du marche et brouhaha discret. Plats changent chaque semaine; verres servis genereux."
],
'un-grain-decale-paris': [
  "Wine bar plus tiny restaurant with a daily-written menu and a serious by-the-glass program. Two stops in one room.",
  "Wine bar e piccolo ristorante con menu scritto ogni giorno e un serio programma al calice. Due fermate in una sola sala.",
  "Wine bar e mini-restaurante com menu escrito diariamente e um programa de tacas serio. Duas paradas em uma sala so.",
  "Bar a vin et petit restaurant avec carte ecrite chaque jour et un vrai programme au verre. Deux haltes dans une seule salle."
],
'restaurant-pulcinella-paris': [
  "A Napoli-leaning Italian for true pizza, fresh pasta, and stronger limoncello. Loud and warm.",
  "Un italiano di taglio napoletano per vera pizza, pasta fresca e limoncello tosto. Rumoroso e accogliente.",
  "Um italiano com pegada napolitana para pizza de verdade, massa fresca e limoncello forte. Barulhento e acolhedor.",
  "Un italien d'inspiration napolitaine pour vraie pizza, pates fraiches et limoncello plus fort. Bruyant et chaleureux."
],
'cafe-a-paris-paris': [
  "A cafe attached to a culture house with a garden terrace. Order brunch, stay through lunch, browse the shop.",
  "Un cafe annesso a una casa di cultura con terrazza in giardino. Ordina il brunch, resta per il pranzo, curiosa al bookshop.",
  "Um cafe anexo a uma casa de cultura com terraco no jardim. Peca brunch, fique para o almoco, passeie pela lojinha.",
  "Un cafe rattache a une maison de la culture avec terrasse au jardin. Brunch, prolongez sur le dejeuner, fouinez la boutique."
],
'liquiderie-bar-paris': [
  "A small neighborhood cocktail bar with a chalkboard menu and a relaxed bartender. Easy weeknight stop.",
  "Un piccolo cocktail bar di quartiere con menu su lavagna e un barista rilassato. Tappa facile in settimana.",
  "Um cocktail bar pequeno de bairro com menu em quadro e bartender tranquilo. Parada facil de semana.",
  "Un petit bar a cocktails de quartier avec ardoise et bartender detendu. Halte facile en semaine."
],
'rue-sainte-marthe-paris': [
  "A pedestrian street north of Republique lined with terraces. Pick the one that looks most alive; order a glass.",
  "Una via pedonale a nord di Republique piena di terrazze. Scegli quella piu viva; ordina un calice.",
  "Uma rua pedestrianalizada ao norte da Republique cheia de terracos. Escolha o mais animado; peca uma taca.",
  "Une rue pietonne au nord de Republique bordee de terrasses. Choisissez la plus vivante; commandez un verre."
],
'dali-paris-paris': [
  "A private museum on Montmartre dedicated to Dali sculpture and graphics. Compact, fun, perfect after Sacre-Coeur.",
  "Un museo privato a Montmartre dedicato a scultura e grafica di Dali. Compatto, divertente, perfetto dopo il Sacre-Coeur.",
  "Um museu privado em Montmartre dedicado a escultura e grafica de Dali. Compacto, divertido, perfeito apos o Sacre-Coeur.",
  "Un musee prive a Montmartre dedie a la sculpture et a la gravure de Dali. Compact, fun, parfait apres le Sacre-Coeur."
],
'au-petit-rozey-paris': [
  "A pocket-sized bistrot with a tight market menu and an even tighter wine list. Two services a night; reserve the late one.",
  "Un bistrot tascabile con menu di mercato essenziale e una carta dei vini ancora piu essenziale. Due turni a sera; prenota il secondo.",
  "Um bistro de bolso com menu de mercado enxuto e carta de vinhos ainda mais enxuta. Dois turnos por noite; reserve o segundo.",
  "Un bistrot de poche avec carte du marche serree et carte des vins encore plus serree. Deux services par soir; reservez le tardif."
],
'il-fico-paris': [
  "A tiny Italian dining room with a wood-fired oven and a single tasting menu. Six tables, a Tuscan wine list.",
  "Una piccolissima sala italiana con forno a legna e un solo menu degustazione. Sei tavoli, carta dei vini toscana.",
  "Uma minissala italiana com forno a lenha e um unico menu degustacao. Seis mesas, carta de vinhos toscana.",
  "Une toute petite salle italienne avec four a bois et un seul menu degustation. Six tables, carte des vins toscane."
],
'la-bourse-et-la-vie-paris': [
  "Daniel Rose's bourgeois bistrot near Bourse. Pot-au-feu, blanquette, the kind of dinner you talk about later.",
  "Il bistrot borghese di Daniel Rose vicino alla Bourse. Pot-au-feu, blanquette, il tipo di cena di cui parli dopo.",
  "O bistro burgues de Daniel Rose perto da Bourse. Pot-au-feu, blanquette, o tipo de jantar de que se fala depois.",
  "Le bistrot bourgeois de Daniel Rose pres de la Bourse. Pot-au-feu, blanquette, le genre de diner dont on reparle."
],
'laitcha-paris': [
  "A modern Chinese counter with hand-pulled noodles and dim sum. Small room, fast service, very good prices.",
  "Un counter cinese moderno con noodle tirati a mano e dim sum. Sala piccola, servizio veloce, prezzi ottimi.",
  "Um balcao chines moderno com macarrao puxado a mao e dim sum. Sala pequena, servico rapido, precos otimos.",
  "Un comptoir chinois moderne avec nouilles tirees a la main et dim sum. Petite salle, service rapide, prix tres doux."
],
'le-servan-paris': [
  "The Levha sisters' modern bistrot with subtle Asian inflections. Reserve a month ahead; take whatever they suggest.",
  "Il moderno bistrot delle sorelle Levha con sfumature asiatiche. Prenota con un mese di anticipo; prendi cio che suggeriscono.",
  "O bistro moderno das irmas Levha com toques asiaticos. Reserve com um mes de antecedencia; aceite o que sugerirem.",
  "Le bistrot moderne des soeurs Levha aux inflexions asiatiques. Reservez un mois a l'avance; prenez ce qu'elles suggerent."
],
'the-centre-pompidou-paris': [
  "Renzo Piano and Richard Rogers's inside-out building. Modern collection on level 5; the rooftop view is the bonus.",
  "L'edificio rovesciato di Renzo Piano e Richard Rogers. Collezione moderna al livello 5; la vista dal tetto e il bonus.",
  "O predio do avesso de Renzo Piano e Richard Rogers. Colecao moderna no nivel 5; a vista do telhado e o bonus.",
  "Le batiment a l'envers de Renzo Piano et Richard Rogers. Collection moderne au niveau 5; la vue depuis le toit, c'est le bonus."
],
'musee-de-lorangerie-paris': [
  "Two oval rooms holding the Nymphes panels Monet painted for France. Quiet, lit by skylight, twenty minutes that linger.",
  "Due sale ovali con le Ninfee dipinte da Monet per la Francia. Silenzio, luce dall'alto, venti minuti che restano.",
  "Duas salas ovais com as Ninfeias que Monet pintou para a Franca. Silencio, luz zenital, vinte minutos que ficam.",
  "Deux salles ovales abritant les Nympheas que Monet a peints pour la France. Calme, lumiere zenithale, vingt minutes qui restent."
],
'perruche-paris-paris': [
  "Printemps rooftop bar with a 360 view over the 9e. Sunset cocktails, casual food, the city tipped at your feet.",
  "Il bar sul tetto di Printemps con vista a 360 sul 9e. Cocktail al tramonto, cibo casual, la citta ai tuoi piedi.",
  "O rooftop bar do Printemps com vista 360 sobre o 9e. Drinks no por do sol, comida casual, a cidade aos seus pes.",
  "Le rooftop bar du Printemps avec vue a 360 sur le 9e. Cocktails au coucher du soleil, cuisine casual, la ville a vos pieds."
],
'le-barav-paris': [
  "A wine bar attached to a wine shop. Pick a bottle from the shelf, pay corkage, drink it at the counter with cheese.",
  "Un wine bar attiguo a un'enoteca. Scegli una bottiglia dallo scaffale, paga il tappo, bevila al banco con un tagliere.",
  "Um wine bar anexo a uma loja de vinhos. Pegue uma garrafa da prateleira, pague a rolha, beba no balcao com queijo.",
  "Un bar a vin attache a un caviste. Prenez une bouteille au rayon, payez le droit de bouchon, buvez-la au comptoir avec du fromage."
],
'latalante-paris-paris': [
  "A romantic 11e cocktail bar with low light and quiet music. Drinks named after films; pick the one you like best.",
  "Un romantico cocktail bar nell'11e con luce bassa e musica soffusa. Drink intitolati a film; scegli quello che preferisci.",
  "Um cocktail bar romantico no 11e com luz baixa e musica suave. Drinks com nomes de filmes; escolha o seu favorito.",
  "Un bar a cocktails romantique du 11e a la lumiere tamisee et musique douce. Drinks aux noms de films; choisissez votre prefere."
],
'danico-paris': [
  "A hidden cocktail bar behind a pasta restaurant. Dim, quiet, with a Negroni list that surprises.",
  "Un cocktail bar nascosto dietro a un ristorante di pasta. Buio, silenzioso, con una lista di Negroni che sorprende.",
  "Um cocktail bar escondido atras de um restaurante de massa. Escuro, silencioso, com uma carta de Negronis que surpreende.",
  "Un bar a cocktails cache derriere un restaurant de pates. Sombre, calme, avec une carte de Negroni qui surprend."
],
'bar-a-bulles-paris': [
  "The Machine du Moulin Rouge's secret garden, with low lights and a small bar. Festive, friendly, late.",
  "Il giardino segreto della Machine du Moulin Rouge, con luci basse e un piccolo bar. Festoso, amichevole, tardi.",
  "O jardim secreto da Machine du Moulin Rouge, com luz baixa e um pequeno bar. Festivo, simpatico, tarde.",
  "Le jardin secret de la Machine du Moulin Rouge, lumieres basses et petit bar. Festif, sympa, tard."
],
'palais-de-tokyo-paris': [
  "Europe's largest contemporary art space, opposite the Trocadero. Ambitious shows, late hours, a great cafe.",
  "Il piu grande spazio di arte contemporanea d'Europa, di fronte al Trocadero. Mostre ambiziose, orari tardi, ottimo cafe.",
  "O maior espaco de arte contemporanea da Europa, em frente ao Trocadero. Mostras ambiciosas, horarios estendidos, otimo cafe.",
  "Le plus grand espace d'art contemporain d'Europe, face au Trocadero. Expositions ambitieuses, horaires tardifs, un excellent cafe."
],
'palais-de-la-decouverte-paris': [
  "A science museum for kids and grown-ups: planetarium, electrostatic ball, chemistry shows. Closed for renovation; check.",
  "Un museo della scienza per bambini e adulti: planetario, palla elettrostatica, esperimenti di chimica. Chiuso per restauro; verifica.",
  "Um museu de ciencia para criancas e adultos: planetario, bola eletrostatica, espetaculos de quimica. Fechado para reforma; verifique.",
  "Un musee des sciences pour enfants et adultes: planetarium, boule electrostatique, demos de chimie. Ferme pour travaux; verifiez."
],
'musee-des-arts-decoratifs-paris-paris': [
  "Inside the Louvre wing on Rivoli, a deep collection of design and fashion. Strong rotating shows.",
  "Nell'ala del Louvre su Rivoli, una profonda collezione di design e moda. Forti mostre temporanee.",
  "Na ala do Louvre sobre a Rivoli, uma colecao profunda de design e moda. Mostras temporarias fortes.",
  "Dans l'aile du Louvre sur Rivoli, une collection riche de design et de mode. De fortes expositions temporaires."
],
'my-noodles-paris': [
  "A tiny Sichuan canteen for dan dan noodles, twice-cooked pork, dumplings. Cheap, spicy, walk-in only.",
  "Una piccola mensa sichuanese per noodle dan dan, maiale due cotture, ravioli. Economica, piccante, solo walk-in.",
  "Uma pequena cantina de Sichuan para dan dan, porco duas vezes cozido, dumplings. Barato, picante, so walk-in.",
  "Une petite cantine du Sichuan pour dan dan, porc deux cuissons, raviolis. Pas cher, pimente, sans reservation."
],
'muqam-specialites-ouighoures-paris-paris': [
  "Uyghur cooking in the 19e: hand-pulled laghman, pilaf, lamb skewers. A taste of Central Asia in Paris.",
  "Cucina uigura nel 19e: laghman tirati a mano, pilaf, spiedini di agnello. Un assaggio di Asia centrale a Parigi.",
  "Cozinha uigure no 19e: laghman puxado a mao, pilaf, espetinhos de cordeiro. Um gosto da Asia central em Paris.",
  "Cuisine ouighoure dans le 19e: laghman tires a la main, pilaf, brochettes d'agneau. Un gout d'Asie centrale a Paris."
],
'la-compagnie-du-cafe-paris': [
  "A specialty roaster cafe with a long espresso menu and a clean white-tile bar. Stand, sip, leave.",
  "Un cafe-torrefazione specialty con una lunga carta di espresso e un bar bianco a piastrelle. In piedi, bevi, vai.",
  "Um cafe-torrefacao specialty com longa carta de espressos e um balcao branco azulejado. Em pe, beba, va.",
  "Un cafe-torrefacteur de specialite avec longue carte d'espressos et un comptoir blanc carrele. Debout, on boit, on part."
],
'square-george-cain-paris': [
  "A small Marais square with statues and benches under tall trees. Perfect mid-walk pause.",
  "Una piccola piazza del Marais con statue e panchine sotto alberi alti. Perfetta pausa a meta passeggiata.",
  "Uma pequena praca do Marais com estatuas e bancos sob arvores altas. Pausa perfeita no meio do passeio.",
  "Une petite place du Marais avec statues et bancs sous de grands arbres. Pause parfaite au milieu d'une balade."
],
'django-restaurant-paris-paris': [
  "A small bistrot named for Django Reinhardt with a French menu and live music nights. Sit close to the band.",
  "Un piccolo bistrot intitolato a Django Reinhardt con menu francese e serate con musica dal vivo. Siedi vicino al gruppo.",
  "Um pequeno bistro batizado em homenagem a Django Reinhardt com menu frances e noites com musica ao vivo. Sente perto da banda.",
  "Un petit bistrot nomme d'apres Django Reinhardt avec carte francaise et soirees live. Asseyez-vous pres du groupe."
],
'atelier-des-lumieres-paris': [
  "Immersive projections in a former 19th-century foundry. Walk through paintings the size of the room.",
  "Proiezioni immersive in un'antica fonderia ottocentesca. Cammina dentro dipinti grandi quanto la stanza.",
  "Projecoes imersivas numa antiga fundicao do seculo XIX. Caminhe dentro de pinturas do tamanho da sala.",
  "Projections immersives dans une ancienne fonderie du XIXe. Marchez dans des tableaux a l'echelle de la salle."
],
'saint-pearl-paris': [
  "A French-Cantonese bistrot for dumplings, tea-smoked duck, and natural wine. Confident, fun, often full.",
  "Un bistrot franco-cantonese per ravioli, anatra al te affumicato e vino naturale. Sicuro, divertente, spesso pieno.",
  "Um bistro franco-cantones para dumplings, pato defumado em cha e vinhos naturais. Confiante, divertido, costuma lotar.",
  "Un bistrot franco-cantonais pour raviolis, canard fume au the et vin nature. Sur de lui, fun, souvent complet."
],
'griffon-paris-paris': [
  "A modern Parisian counter for casual lunch and small plates after work. Good wine, easy energy.",
  "Un moderno counter parigino per pranzo informale e piccoli piatti dopo lavoro. Buon vino, energia rilassata.",
  "Um balcao parisiense moderno para almoco descontraido e petiscos depois do trabalho. Bom vinho, energia leve.",
  "Un comptoir parisien moderne pour dejeuner casual et petits plats apres le travail. Bon vin, energie facile."
],
'bleu-cerise-paris': [
  "A small cocktail bar where the menu changes with the season. Soft music, soft light, a serious bartender.",
  "Un piccolo cocktail bar dove il menu cambia con la stagione. Musica e luce soffuse, barista serio.",
  "Um cocktail bar pequeno cujo menu muda com a estacao. Musica suave, luz baixa, bartender serio.",
  "Un petit bar a cocktails ou la carte change avec la saison. Musique douce, lumiere tamisee, bartender serieux."
],
'dirty-dick-paris-paris': [
  "A Polynesian tiki bar in Pigalle. Mai tais, painted skulls, a soundtrack to embrace. Festive, never quiet.",
  "Un tiki bar polinesiano a Pigalle. Mai tai, teschi dipinti, una colonna sonora da abbracciare. Festoso, mai silenzioso.",
  "Um tiki bar polinesio em Pigalle. Mai tais, caveiras pintadas, uma trilha sonora pra abracar. Festivo, nunca silencioso.",
  "Un bar tiki polynesien a Pigalle. Mai tais, cranes peints, une bande-son a embrasser. Festif, jamais silencieux."
],
'lalimentation-generale-paris': [
  "A long-standing wine bar near Saint-Ambroise with a market menu and a long natural list. Bar seats are the move.",
  "Uno storico wine bar vicino a Saint-Ambroise con menu di mercato e una lunga carta naturale. I posti al banco sono la scelta giusta.",
  "Um wine bar tradicional perto de Saint-Ambroise com menu de mercado e carta longa de naturais. Os lugares no balcao sao a melhor escolha.",
  "Un bar a vin historique pres de Saint-Ambroise avec carte du marche et une longue liste nature. Les places au comptoir, c'est le mouvement."
],
'restaurant-kunitoraya-paris': [
  "A serious udon counter in the 1er. Tempura, kakeudon, a tiny sake list. The room is loud and the noodles are right.",
  "Un serio counter di udon nel 1er. Tempura, kakeudon, una piccola carta dei sake. La sala e rumorosa e i noodle sono perfetti.",
  "Um balcao serio de udon no 1er. Tempura, kakeudon, uma pequena carta de sake. A sala e barulhenta e os noodles estao certos.",
  "Un vrai comptoir a udon dans le 1er. Tempura, kakeudon, une petite carte de sake. La salle est bruyante et les nouilles sont justes."
],
'telescope-cafe-paris': [
  "A small specialty cafe in the 1er. One-bar setup, perfect flat white, the right window for a notebook.",
  "Un piccolo cafe specialty nel 1er. Banco singolo, flat white perfetto, la finestra giusta per un taccuino.",
  "Um pequeno cafe specialty no 1er. Balcao unico, flat white perfeito, a janela certa para um caderno.",
  "Un petit cafe de specialite dans le 1er. Un comptoir, un flat white parfait, la bonne fenetre pour un carnet."
],
'rosa-bonheur-sur-seine-paris': [
  "A floating guinguette on the Seine in the 7e. Open-air dancing, cold rose, the bridge of Alexandre III in view.",
  "Una guinguette galleggiante sulla Senna nel 7e. Balli all'aperto, rose freddo, il ponte Alessandro III in vista.",
  "Uma guinguette flutuante no Sena no 7e. Danca ao ar livre, rose gelado, a ponte Alexandre III a vista.",
  "Une guinguette flottante sur la Seine dans le 7e. Danses en plein air, rose frais, le pont Alexandre III en vue."
],
'rue-cremieux-paris': [
  "A pastel-colored cobbled street near Gare de Lyon. Photogenic in a Sunday-afternoon way; respect the residents.",
  "Una via lastricata color pastello vicino a Gare de Lyon. Fotogenica con quel mood domenicale; rispetta i residenti.",
  "Uma rua de pedras coloridas em tons pasteis perto da Gare de Lyon. Fotogenica num clima de domingo a tarde; respeite os moradores.",
  "Une rue pavee aux maisons pastel pres de la Gare de Lyon. Photogenique facon dimanche apres-midi; respectez les habitants."
],
'chez-julien-paris': [
  "A romantic Marais bistrot with a garden facade and proper French cooking. Reserve a window or an outside table.",
  "Un romantico bistrot del Marais con facciata fiorita e cucina francese corretta. Prenota una finestra o un tavolo all'aperto.",
  "Um bistro romantico do Marais com fachada florida e cozinha francesa correta. Reserve uma janela ou mesa la fora.",
  "Un bistrot romantique du Marais a facade fleurie et cuisine francaise correcte. Reservez une fenetre ou une table dehors."
],
'motors-coffee-paris': [
  "A motorcycle-themed specialty cafe in the 17e. Strong espresso, a long bar, regulars who linger.",
  "Un cafe specialty a tema motociclistico nel 17e. Espresso forte, un bar lungo, abituali che si attardano.",
  "Um cafe specialty com tematica de motos no 17e. Espresso forte, balcao longo, regulares que se demoram.",
  "Un cafe de specialite theme motos dans le 17e. Espresso costaud, long bar, des habitues qui trainent."
],
'parc-de-belleville-paris': [
  "The Belleville park rises on a hill with the best free Paris-skyline view east of Sacre-Coeur. Picnic move.",
  "Il parco di Belleville sale su una collina con la migliore vista gratis dello skyline parigino a est del Sacre-Coeur. Buona idea per un picnic.",
  "O parque de Belleville sobe uma colina com a melhor vista gratis do skyline parisiense a leste do Sacre-Coeur. Bom para piquenique.",
  "Le parc de Belleville monte sur une colline avec la meilleure vue gratuite du skyline parisien a l'est du Sacre-Coeur. Idee piquenique."
],
'night-flight-paris-paris': [
  "An aviation-themed cocktail lounge in the 8e. Leather seats, runway sound, drinks that announce themselves.",
  "Un cocktail lounge a tema aviazione nell'8e. Sedute in pelle, suono da pista, drink che si annunciano.",
  "Um cocktail lounge com tematica aeronautica no 8e. Poltronas de couro, som de pista, drinks que se anunciam.",
  "Un lounge a cocktails theme aviation dans le 8e. Sieges en cuir, sons de piste, des drinks qui s'annoncent."
],
'trois-fois-plus-de-piment-paris': [
  "The bigger sister of Deux Fois with bigger spice. Same Sichuan menu, same rules; respect the numbers.",
  "La sorella maggiore di Deux Fois, piu piccante. Stesso menu sichuanese, stesse regole; rispetta i numeri.",
  "A irma maior do Deux Fois, com mais pimenta. Mesmo cardapio de Sichuan, mesmas regras; respeite os numeros.",
  "La grande soeur du Deux Fois, plus pimente. Meme carte du Sichuan, memes regles; respectez les chiffres."
],
'le-carreau-du-temple-paris': [
  "A 19th-century iron market converted into a culture house. Fairs, concerts, design markets; check the calendar.",
  "Un mercato ottocentesco in ferro convertito in casa di cultura. Fiere, concerti, mercati di design; controlla il calendario.",
  "Um mercado de ferro do seculo XIX convertido em casa de cultura. Feiras, shows, mercados de design; veja a agenda.",
  "Un marche en fer du XIXe converti en maison de la culture. Foires, concerts, salons de design; verifiez le programme."
],
'comets-cafe-disques-paris': [
  "A record-store cafe in the 11e. Specialty coffee, vinyl crates, a window seat to flip through records at.",
  "Un cafe-negozio di dischi nell'11e. Specialty coffee, casse di vinili, un posto in vetrina per sfogliare dischi.",
  "Um cafe-loja de discos no 11e. Specialty coffee, caixas de vinil, lugar na janela para folhear discos.",
  "Un cafe-disquaire dans le 11e. Cafe de specialite, bacs de vinyles, une place fenetre pour feuilleter."
],
'cafe-verlet-paris': [
  "An 1880s tea-and-coffee shop in the 1er. Polished wood, hundreds of teas, the kind of order you take all afternoon.",
  "Una bottega di te e caffe dell'Ottocento nel 1er. Legno lucido, centinaia di te, un ordine che dura tutto il pomeriggio.",
  "Uma loja de cha e cafe do final do seculo XIX no 1er. Madeira polida, centenas de chas, um pedido que se estende a tarde toda.",
  "Un magasin de the et cafe des annees 1880 dans le 1er. Bois patine, des centaines de thes, une commande qui dure tout l'apres-midi."
],
'happy-nouilles-paris': [
  "A Beijing-style noodle counter in the 3e. Hand-pulled noodles, jaja mian, beer. Cheap, fast, walk-in.",
  "Un counter di noodle in stile Pechino nel 3e. Noodle tirati a mano, jaja mian, birra. Economico, veloce, walk-in.",
  "Um balcao de noodles estilo Pequim no 3e. Macarrao puxado a mao, jaja mian, cerveja. Barato, rapido, sem reserva.",
  "Un comptoir a nouilles style Pekin dans le 3e. Nouilles tirees a la main, jaja mian, biere. Pas cher, rapide, sans reservation."
],
'le-ruisseau-paris-paris': [
  "A bistro in the 18e with a long bar and a French menu that reads like a love letter. Reserve the window.",
  "Un bistrot nel 18e con un lungo bancone e una carta francese che si legge come una lettera d'amore. Prenota la finestra.",
  "Um bistro no 18e com balcao longo e cardapio frances que se le como uma carta de amor. Reserve a janela.",
  "Un bistrot du 18e avec un long bar et une carte francaise qui se lit comme une lettre d'amour. Reservez la fenetre."
],
'grande-mosquee-de-paris-paris': [
  "The 1926 mosque in the 5e with a tiled courtyard, a tea room, and a hammam. Mint tea under the trees.",
  "La moschea del 1926 nel 5e con un cortile a piastrelle, una sala da te e un hammam. Te alla menta sotto gli alberi.",
  "A mesquita de 1926 no 5e com patio em azulejos, sala de cha e hammam. Cha de hortela sob as arvores.",
  "La mosquee de 1926 dans le 5e avec sa cour carrelee, son salon de the et son hammam. The a la menthe sous les arbres."
],
'rosa-bonheur-buttes-chaumont-paris': [
  "A guinguette inside Buttes-Chaumont with cold rose, open-air tables, and dance floors that fill at sunset.",
  "Una guinguette dentro Buttes-Chaumont con rose freddo, tavoli all'aperto e piste da ballo che si riempiono al tramonto.",
  "Uma guinguette dentro do Buttes-Chaumont com rose gelado, mesas ao ar livre e pistas de danca que enchem ao por do sol.",
  "Une guinguette dans Buttes-Chaumont avec rose frais, tables en plein air, et pistes qui se remplissent au coucher du soleil."
],
'les-deux-magots-paris': [
  "Saint-Germain's cafe of Hemingway and Sartre. Order a chocolat chaud, watch the tourists, become one.",
  "Il cafe di Saint-Germain di Hemingway e Sartre. Ordina un chocolat chaud, guarda i turisti, diventane uno.",
  "O cafe de Saint-Germain de Hemingway e Sartre. Peca um chocolat chaud, observe os turistas, vire um.",
  "Le cafe de Saint-Germain d'Hemingway et Sartre. Commandez un chocolat chaud, regardez les touristes, devenez-en un."
],
'parc-des-buttes-chaumont-paris': [
  "Paris's most dramatic park: a cliff, a lake, a temple on a peak, paths that climb. Stay through sunset.",
  "Il parco piu drammatico di Parigi: una rupe, un lago, un tempio sulla vetta, sentieri in salita. Resta fino al tramonto.",
  "O parque mais dramatico de Paris: um penhasco, um lago, um templo no topo, trilhas que sobem. Fique ate o por do sol.",
  "Le parc le plus theatral de Paris: une falaise, un lac, un temple en haut, des sentiers qui montent. Restez jusqu'au coucher du soleil."
],
'musee-de-la-vie-romantique-paris': [
  "A tucked-away museum in a 19th-century mansion near Pigalle. Romantic-era paintings, a rose-garden tea room.",
  "Un museo nascosto in una villa ottocentesca vicino a Pigalle. Dipinti dell'epoca romantica, una sala da te con roseto.",
  "Um museu escondido numa mansao do seculo XIX perto de Pigalle. Pinturas do romantismo, sala de cha com roseiral.",
  "Un musee niche dans un hotel particulier du XIXe pres de Pigalle. Peintures romantiques, salon de the dans la roseraie."
],
'mandarin-oriental-paris-paris': [
  "The Mandarin's bar and garden in the 1er. Reserve the courtyard table, order a Martini, stay through the second.",
  "Il bar e il giardino del Mandarin nel 1er. Prenota il tavolo nel cortile, ordina un Martini, resta per il secondo.",
  "O bar e jardim do Mandarin no 1er. Reserve a mesa do patio, peca um Martini, fique para o segundo.",
  "Le bar et le jardin du Mandarin dans le 1er. Reservez la table dans la cour, commandez un Martini, restez pour le deuxieme."
],
'angelina-paris-paris': [
  "The 1903 Rivoli tea room. Their chocolat chaud is famous for a reason; the mont-blanc, too.",
  "La sala da te del 1903 in Rivoli. Il loro chocolat chaud e famoso per un motivo; anche il mont-blanc.",
  "O salao de cha de 1903 na Rivoli. O chocolat chaud deles e famoso por um motivo; o mont-blanc tambem.",
  "Le salon de the de 1903 rue de Rivoli. Leur chocolat chaud est celebre pour une raison; le mont-blanc aussi."
],
'prescription-cocktail-club-paris': [
  "A speakeasy-style bar in the 6e with an old-world apothecary aesthetic. Drinks read like prescriptions; the staff knows.",
  "Un bar in stile speakeasy nel 6e con un'estetica da farmacia d'altri tempi. I drink si leggono come ricette; lo staff sa.",
  "Um bar estilo speakeasy no 6e com estetica de botica antiga. Drinks se leem como receitas; a equipe entende.",
  "Un bar speakeasy dans le 6e a l'esthetique d'apothicaire ancien. Les drinks se lisent comme des ordonnances; l'equipe sait."
],
'la-rotonde-stalingrad-paris': [
  "The 1788 rotunda turned bar and restaurant at Place Stalingrad, with a canal-side terrace.",
  "La rotonda del 1788 trasformata in bar e ristorante a Place Stalingrad, con terrazza sul canale.",
  "A rotunda de 1788 transformada em bar e restaurante na Place Stalingrad, com terraco no canal.",
  "La rotonde de 1788 transformee en bar-restaurant a la place Stalingrad, avec terrasse sur le canal."
],
'mariage-freres-rive-gauche-paris': [
  "The 1854 tea house empire's Rive Gauche shop. Hundreds of teas, dark wood, a tea room upstairs for the proper service.",
  "L'impero del te dal 1854 nella sede della Rive Gauche. Centinaia di te, legno scuro, una sala al piano superiore per il servizio completo.",
  "O imperio do cha desde 1854 na loja da Rive Gauche. Centenas de chas, madeira escura, sala de cha no andar de cima para o servico completo.",
  "L'empire du the depuis 1854, boutique de la Rive Gauche. Des centaines de thes, bois sombre, salon de the a l'etage pour le service complet."
],
'le-fumoir-paris': [
  "A library-bar across from the Louvre. Worn leather club chairs, a cocktail menu that respects the classics.",
  "Un bar-biblioteca di fronte al Louvre. Poltrone club in pelle vissute, un menu cocktail che rispetta i classici.",
  "Um bar-biblioteca em frente ao Louvre. Poltronas de couro gastas, menu de drinks que respeita os classicos.",
  "Un bar-bibliotheque face au Louvre. Fauteuils club en cuir use, une carte de cocktails qui respecte les classiques."
],
'lavomatic-paris': [
  "A cocktail bar hidden behind a laundromat front near Strasbourg-Saint-Denis. Push the right machine.",
  "Un cocktail bar nascosto dietro la vetrina di una lavanderia vicino Strasbourg-Saint-Denis. Spingi la macchina giusta.",
  "Um cocktail bar escondido atras de uma lavanderia perto de Strasbourg-Saint-Denis. Empurre a maquina certa.",
  "Un bar a cocktails cache derriere une laverie pres de Strasbourg-Saint-Denis. Poussez la bonne machine."
],
'la-perle-paris-paris': [
  "The Marais corner cafe that became famous twice and stayed itself anyway. Sit outside, order a Pastis.",
  "Il cafe d'angolo del Marais diventato famoso due volte rimanendo se stesso. Siedi fuori, ordina un Pastis.",
  "O cafe de esquina do Marais que ficou famoso duas vezes e seguiu sendo ele mesmo. Sente fora, peca um Pastis.",
  "Le cafe de coin du Marais devenu celebre deux fois en restant lui-meme. Asseyez-vous dehors, commandez un Pastis."
],
'candelaria-paris-paris': [
  "A taqueria up front, a hidden cocktail room in the back. Push through the door; order something with tequila.",
  "Una taqueria davanti, una sala cocktail nascosta dietro. Spingi la porta; ordina qualcosa con tequila.",
  "Uma taqueria na frente, uma sala de drinks escondida atras. Empurre a porta; peca algo com tequila.",
  "Une taqueria devant, une salle a cocktails cachee derriere. Poussez la porte; commandez quelque chose a la tequila."
],
'little-red-door-paris': [
  "A Marais bar consistently on the world's-best lists. Drinks built like artworks; book ahead.",
  "Un bar del Marais costantemente nelle liste dei migliori al mondo. Drink costruiti come opere d'arte; prenota.",
  "Um bar do Marais sempre nas listas dos melhores do mundo. Drinks construidos como obras de arte; reserve.",
  "Un bar du Marais sans cesse dans les classements mondiaux. Drinks construits comme des oeuvres; reservez."
],
'experimental-cocktail-club-paris': [
  "The bar that started the Paris cocktail revival in 2007. Still dim, still serious, still going late.",
  "Il bar che ha lanciato il revival cocktail parigino nel 2007. Ancora buio, ancora serio, ancora a tarda notte.",
  "O bar que comecou o revival de drinks em Paris em 2007. Ainda escuro, ainda serio, ainda ate tarde.",
  "Le bar qui a relance le cocktail parisien en 2007. Toujours tamise, toujours serieux, toujours tard."
],
'le-syndicat-paris': [
  "A self-declared 'defense of French spirits.' Cognac, calvados, armagnac, made into drinks you have never had.",
  "Un'autoproclamata 'difesa dei distillati francesi'. Cognac, calvados, armagnac, trasformati in drink che non hai mai bevuto.",
  "Uma autoproclamada 'defesa dos destilados franceses'. Conhaque, calvados, armagnac, transformados em drinks que voce nunca tomou.",
  "Une autoproclamee 'defense des spiritueux francais'. Cognac, calvados, armagnac, transformes en drinks inedits."
],
'le-perchoir-paris': [
  "An 11e rooftop with a long bar and the kind of view that justifies the climb. Reserve sunset; arrive early.",
  "Un rooftop nell'11e con un lungo banco e una vista che giustifica la salita. Prenota il tramonto; arriva presto.",
  "Um rooftop no 11e com balcao longo e a vista que justifica a subida. Reserve no por do sol; chegue cedo.",
  "Un rooftop dans le 11e avec long bar et la vue qui justifie la montee. Reservez au coucher du soleil; arrivez tot."
],
'galerie-vivienne-paris': [
  "The 1823 covered passage in the 2e. Mosaic floors, vaulted glass, a salon de the, a wine bar, a bookshop.",
  "Il passage coperto del 1823 nel 2e. Pavimenti a mosaico, volte di vetro, una sala da te, un wine bar, una libreria.",
  "A galeria coberta de 1823 no 2e. Pisos em mosaico, vidracas abobadadas, salao de cha, wine bar, livraria.",
  "Le passage couvert de 1823 dans le 2e. Sols en mosaique, verriere, salon de the, bar a vin, librairie."
],
'umami-matcha-cafe-paris': [
  "A tiny Marais cafe entirely about matcha. Lattes, soft serve, mochi. Twenty minutes, exactly enough.",
  "Un cafe minuscolo del Marais interamente dedicato al matcha. Latte, soft serve, mochi. Venti minuti, esattamente quanto basta.",
  "Um cafe minusculo do Marais inteiramente sobre matcha. Lattes, soft serve, mochi. Vinte minutos, exatamente o suficiente.",
  "Un tout petit cafe du Marais entierement consacre au matcha. Lattes, soft serve, mochi. Vingt minutes, juste ce qu'il faut."
],
'restaurant-amour-paris': [
  "The Hotel Amour's dining room in SoPi: bistro plates, candle-lit booths, a courtyard for warmer nights.",
  "La sala da pranzo dell'Hotel Amour in SoPi: piatti bistro, divanetti a lume di candela, cortile per le sere miti.",
  "A sala do Hotel Amour em SoPi: pratos de bistro, banquetas a luz de vela, patio para noites mais quentes.",
  "La salle de l'Hotel Amour a SoPi: plats bistrot, banquettes a la bougie, cour pour les soirs doux."
],
'mama-shelter-paris-east-paris': [
  "The Mama rooftop in the 20e. Drinks under the heaters, foosball, a hum of regulars. Festive and easy.",
  "Il rooftop di Mama nel 20e. Drink sotto i funghi riscaldanti, calcio balilla, un brusio di abituali. Festoso e facile.",
  "O rooftop do Mama no 20e. Drinks sob os aquecedores, pebolim, um murmurio de habitues. Festivo e descontraido.",
  "Le rooftop du Mama dans le 20e. Drinks sous les chauffages, babyfoot, un brouhaha d'habitues. Festif et facile."
],
'le-1905-paris': [
  "A 6e cocktail-and-supper club with live piano late. The room gets cheerful by 11; lean in.",
  "Un cocktail-supper club nel 6e con piano dal vivo a tarda sera. La sala si scalda dalle 23; lasciati andare.",
  "Um cocktail-supper club no 6e com piano ao vivo tarde. A sala anima depois das 23h; entre no clima.",
  "Un cocktail-supper club du 6e avec piano live tard. La salle s'anime apres 23h; laissez-vous porter."
],
'toraya-paris-store-paris': [
  "The Tokyo wagashi house in the 1er, since 1980. Sit upstairs with matcha and a precise piece of sweet bean.",
  "La casa giapponese di wagashi nel 1er, dal 1980. Siedi al piano sopra con il matcha e un dolce di fagioli preciso.",
  "A casa japonesa de wagashi no 1er, desde 1980. Sente no andar de cima com matcha e um doce de feijao preciso.",
  "La maison japonaise de wagashi dans le 1er, depuis 1980. Asseyez-vous a l'etage avec un matcha et un dolce de haricot precis."
],
'hotel-particulier-montmartre-paris': [
  "A secret hotel garden bar tucked off rue Lepic. Push through the gate, find the lawn, order a punch.",
  "Un bar segreto nel giardino di un hotel in disparte da rue Lepic. Spingi il cancello, trova il prato, ordina un punch.",
  "Um bar secreto no jardim de um hotel afastado da rue Lepic. Empurre o portao, encontre o gramado, peca um punch.",
  "Un bar secret dans le jardin d'un hotel en retrait de la rue Lepic. Poussez la grille, trouvez la pelouse, commandez un punch."
],
'grazie-paris-paris': [
  "A loud Marais pizzeria with serious cocktails. Sit at the bar, share a Margherita, order a third Negroni.",
  "Una rumorosa pizzeria del Marais con cocktail seri. Siedi al banco, dividi una Margherita, ordina un terzo Negroni.",
  "Uma pizzaria barulhenta do Marais com drinks serios. Sente no balcao, divida uma Margherita, peca um terceiro Negroni.",
  "Une pizzeria bruyante du Marais aux cocktails serieux. Asseyez-vous au bar, partagez une Margherita, commandez un troisieme Negroni."
],
'bistrot-richelieu-paris': [
  "A red-banquette bistrot near Palais Royal. Onion soup, steak tartare, oeuf mayo, no surprises.",
  "Un bistrot con divanetti rossi vicino al Palais Royal. Zuppa di cipolle, steak tartare, oeuf mayo, nessuna sorpresa.",
  "Um bistro de banquetas vermelhas perto do Palais Royal. Sopa de cebola, steak tartare, oeuf mayo, sem surpresas.",
  "Un bistrot a banquettes rouges pres du Palais Royal. Soupe a l'oignon, steak tartare, oeuf mayo, sans surprise."
],
'moonshiner-paris-paris': [
  "A speakeasy hidden in the back of a Bastille pizzeria. Push the cold-room door; bourbon menu, soft jazz.",
  "Uno speakeasy nascosto in fondo a una pizzeria della Bastille. Spingi la porta della cella; menu di bourbon, jazz soffuso.",
  "Um speakeasy escondido nos fundos de uma pizzaria da Bastille. Empurre a porta da camara fria; menu de bourbon, jazz suave.",
  "Un speakeasy cache au fond d'une pizzeria de la Bastille. Poussez la porte de la chambre froide; carte bourbon, jazz feutre."
],
'the-hoxton-paris-paris': [
  "The Hoxton hotel bar in a 18th-century townhouse. Reserve the back salon; order something a little too sweet.",
  "Il bar dell'hotel Hoxton in una casa settecentesca. Prenota il salone in fondo; ordina qualcosa di leggermente troppo dolce.",
  "O bar do hotel Hoxton numa casa do seculo XVIII. Reserve o salao do fundo; peca algo um pouco doce demais.",
  "Le bar de l'hotel Hoxton dans un hotel particulier du XVIIIe. Reservez le salon du fond; commandez quelque chose d'un peu trop sucre."
],
'parc-monceau-paris': [
  "The 8e's elegant park with a colonnade, a pond, statues of forgotten composers. Bring a book.",
  "L'elegante parco dell'8e con un colonnato, un laghetto, statue di compositori dimenticati. Porta un libro.",
  "O elegante parque do 8e com colunata, lago, estatuas de compositores esquecidos. Leve um livro.",
  "L'elegant parc du 8e avec colonnade, bassin, statues de compositeurs oublies. Apportez un livre."
],
'le-bon-marche-paris': [
  "The 7e's grand magasin with a serious food hall in the back (La Grande Epicerie). Browse, eat, browse.",
  "Il grande magazzino del 7e con una seria food hall sul retro (La Grande Epicerie). Curiosa, mangia, ricomincia.",
  "O grande magazine do 7e com uma food hall seria nos fundos (La Grande Epicerie). Passeie, coma, passeie.",
  "Le grand magasin du 7e avec une vraie epicerie a l'arriere (La Grande Epicerie). Fouinez, mangez, refouinez."
],
'arab-world-institute-paris': [
  "Jean Nouvel's mashrabiya-windowed building near Jussieu. Permanent collection, rotating shows, a rooftop with a view.",
  "L'edificio di Jean Nouvel con finestre mashrabiya vicino Jussieu. Collezione permanente, mostre temporanee, terrazza panoramica.",
  "O predio de Jean Nouvel com janelas mashrabiya perto da Jussieu. Colecao permanente, mostras rotativas, terraco com vista.",
  "Le batiment de Jean Nouvel aux moucharabiehs pres de Jussieu. Collection permanente, expos tournantes, toit-terrasse panoramique."
],
'le-comptoir-general-paris': [
  "A canal-side venue with a curated Africa-leaning bar, brunch, and rotating cultural programming. Always something on.",
  "Un locale sul canale con bar curato di taglio africano, brunch e programmazione culturale a rotazione. Succede sempre qualcosa.",
  "Um espaco no canal com bar curado de pegada africana, brunch e programacao cultural rotativa. Sempre tem algo rolando.",
  "Un lieu sur le canal avec un bar a influence africaine, brunch et programmation culturelle. Toujours quelque chose en cours."
],
'chez-prune-paris': [
  "A canal Saint-Martin cafe institution. Outside tables, croque madame, a glass of red, a long afternoon.",
  "Un'istituzione del Canal Saint-Martin. Tavoli all'aperto, croque madame, un calice di rosso, un lungo pomeriggio.",
  "Uma instituicao do Canal Saint-Martin. Mesas la fora, croque madame, taca de tinto, tarde longa.",
  "Une institution du canal Saint-Martin. Tables dehors, croque madame, un verre de rouge, un long apres-midi."
],
'shakespeare-company-paris': [
  "The English-language bookstore on Quai Notre-Dame, founded in 1951. Two narrow floors, a piano upstairs, ghosts.",
  "La libreria in lingua inglese sul Quai Notre-Dame, fondata nel 1951. Due piani stretti, un pianoforte sopra, fantasmi.",
  "A livraria de lingua inglesa no Quai Notre-Dame, fundada em 1951. Dois andares apertados, um piano em cima, fantasmas.",
  "La librairie anglophone du quai Notre-Dame, fondee en 1951. Deux etages etroits, un piano la-haut, des fantomes."
],
'wild-the-moon-charlot-paris': [
  "A plant-leaning cafe with cold-pressed juices, salads, and grain bowls. Easy lunch; healthy in a non-preachy way.",
  "Un cafe a base vegetale con succhi a freddo, insalate e bowl di cereali. Pranzo facile; salutista senza essere noioso.",
  "Um cafe vegetal com sucos prensados a frio, saladas e bowls. Almoco facil; saudavel sem ser chato.",
  "Un cafe vegetal aux jus presses a froid, salades et bols de cereales. Dejeuner facile; sain sans etre donneur de lecons."
],
'le-procope-paris': [
  "The 1686 cafe-restaurant where Voltaire and Robespierre ate. Coq au vin, candlelight, plaques on the walls.",
  "Il cafe-ristorante del 1686 dove mangiavano Voltaire e Robespierre. Coq au vin, candele, targhe alle pareti.",
  "O cafe-restaurante de 1686 onde Voltaire e Robespierre comiam. Coq au vin, luz de vela, placas nas paredes.",
  "Le cafe-restaurant de 1686 ou mangeaient Voltaire et Robespierre. Coq au vin, bougies, plaques sur les murs."
],
'chez-georges-paris': [
  "A Sentier bistrot from the 1960s that nobody has touched since. Steak au poivre, mille-feuille, a hand-written check.",
  "Un bistrot al Sentier degli anni '60 che nessuno ha mai toccato. Steak au poivre, mille-feuille, conto scritto a mano.",
  "Um bistro do Sentier dos anos 60 que ninguem mexeu. Steak au poivre, mille-feuille, conta escrita a mao.",
  "Un bistrot du Sentier des annees 60 que personne n'a touche depuis. Steak au poivre, mille-feuille, addition manuscrite."
],
'jugetsudo-by-maruyama-nori-paris': [
  "A Japanese tea-and-nori shop near Saint-Sulpice. Sit upstairs with a matcha and a piece of dorayaki.",
  "Una bottega giapponese di te e nori vicino a Saint-Sulpice. Siedi al piano sopra con un matcha e un dorayaki.",
  "Uma loja japonesa de cha e nori perto de Saint-Sulpice. Sente no andar de cima com matcha e um dorayaki.",
  "Une boutique japonaise de the et nori pres de Saint-Sulpice. Asseyez-vous a l'etage avec un matcha et un dorayaki."
],
};

const spots = JSON.parse(fs.readFileSync(SPOTS_PATH, 'utf8'));
let updated = 0;
const missing = [];

for (const s of spots) {
    if (s.city !== 'paris') continue;
    const tup = D[s.id];
    if (!tup) continue; // skip spots not in our map (they already have curated copy)
    if (typeof s.description !== 'object') s.description = { en: '', it: '', pt: '', fr: '' };
    const [en, it, pt, fr] = tup;
    if (!s.description.en) s.description.en = en;
    if (!s.description.it) s.description.it = it;
    if (!s.description.pt) s.description.pt = pt;
    if (!s.description.fr) s.description.fr = fr;
    updated++;
}

fs.writeFileSync(SPOTS_PATH, JSON.stringify(spots, null, 2) + '\n');
console.log(`Updated ${updated} Paris spots`);
