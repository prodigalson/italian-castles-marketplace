#!/usr/bin/env node
// Bulk import Rio places via Google Places (New). For each entry:
// 1. Text search biased to Rio de Janeiro
// 2. Pull first photo, googleMapsUri, coords, formattedAddress
// 3. Merge with curated metadata below
// Writes to data/spots.json (preserves existing spots).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPOTS_PATH = path.join(__dirname, '..', 'data', 'spots.json');

// Load env (.env.local)
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const m = line.match(/^([A-Z_]+)="?(.*?)"?$/);
        if (m) process.env[m[1]] = m[2];
    }
}
const KEY = process.env.GOOGLE_PLACES_KEY;
if (!KEY) { console.error('GOOGLE_PLACES_KEY missing'); process.exit(1); }

// Rio center, biased within ~40km
const RIO = { lat: -22.9068, lon: -43.1729, radius: 40000 };

// Curated metadata per place. `q` is the search query, `name` is the magazine display name.
const PLACES = [
    { id: 'jardim-botanico-rio', q: 'Jardim Botanico Rio de Janeiro', name: 'JARDIM\nBOTANICO',
      desc: { en: 'A 140-hectare palace of palms and rainforest inside the city, planted by Dom Joao VI in 1808. Follow the imperial palm avenue, linger by the Vitoria regia pool, read a book under an ancient jequitiba.', it: 'Un palazzo di 140 ettari di palme e foresta pluviale in citta, piantato da Dom Joao VI nel 1808. Segui il viale delle palme imperiali, sostа alla vasca della Vitoria regia, leggi un libro sotto un antico jequitiba.', pt: 'Um palacio de 140 hectares de palmeiras e mata atlantica dentro da cidade, plantado por Dom Joao VI em 1808. Siga a alameda das palmeiras imperiais, demore-se no espelho das vitorias-regias, leia sob um jequitiba centenario.' },
      dateType: 'outdoor', vibe: 'romantic', priceRange: 1 },
    { id: 'cascatinha-taunay', q: 'Cascatinha Taunay Floresta da Tijuca', name: 'CASCATINHA\nTAUNAY',
      desc: { en: 'A 30-meter waterfall deep in the Tijuca rainforest, 15 minutes by car from Ipanema but a different planet. Shady, cool, a little loud, perfect for an afternoon escape.', it: 'Una cascata di 30 metri nel cuore della foresta di Tijuca, 15 minuti da Ipanema ma un altro pianeta. Ombrosa, fresca, un po\' rumorosa, perfetta per una fuga pomeridiana.', pt: 'Uma cachoeira de 30 metros no fundo da Floresta da Tijuca, 15 minutos de Ipanema mas outro planeta. Sombreada, fresca, um pouco barulhenta, perfeita para fugir a tarde.' },
      dateType: 'outdoor', vibe: 'romantic', priceRange: 1 },
    { id: 'museu-arte-moderna-rio', q: 'Museu de Arte Moderna do Rio MAM', name: 'MAM',
      desc: { en: 'Affonso Reidy\'s 1950s concrete masterpiece floating over the bay, Burle Marx gardens between the pillars. Always a good show, always an even better view.', it: 'Capolavoro di cemento anni \'50 di Affonso Reidy sospeso sulla baia, giardini di Burle Marx tra i pilastri. Sempre una bella mostra, sempre una vista ancora migliore.', pt: 'A obra-prima em concreto de Affonso Reidy dos anos 50 flutuando sobre a baia, jardins de Burle Marx entre os pilares. Sempre uma boa exposicao, sempre uma vista ainda melhor.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'pato-com-laranja', q: 'Pato com Laranja Santa Teresa Rio', name: 'PATO COM\nLARANJA',
      desc: { en: 'Tiny Santa Teresa bistro with a handful of tables and a menu built around slow-cooked duck. Wine list worth lingering over, candlelight doing most of the decorating.', it: 'Piccolo bistrot di Santa Teresa con pochi tavoli e un menu costruito attorno all\'anatra a cottura lenta. Carta dei vini da esplorare con calma, le candele fanno il resto dell\'arredo.', pt: 'Bistrozinho de Santa Teresa com meia duzia de mesas e um menu construido em torno do pato de cozimento lento. Carta de vinhos para se demorar, as velas fazem o resto da decoracao.' },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 3 },
    { id: 'museu-sacro-franciscano', q: 'Museu Sacro Franciscano Largo da Carioca Rio', name: 'MUSEU\nSACRO',
      desc: { en: 'The 17th-century Franciscan convent next to the golden church of Santo Antonio. Gilded wood, colonial silver, baroque silence in the middle of downtown chaos.', it: 'Il convento francescano del Seicento accanto alla chiesa dorata di Santo Antonio. Legni dorati, argenti coloniali, silenzio barocco nel caos del centro.', pt: 'O convento franciscano do seculo 17 ao lado da Igreja de Santo Antonio. Talha dourada, prataria colonial, silencio barroco no meio do caos do centro.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'ccbb-rio', q: 'Centro Cultural Banco do Brasil CCBB Rio', name: 'CCBB',
      desc: { en: 'A former bank turned cultural palace: rotunda ceiling, marble floors, a schedule that runs from Ming dynasty to contemporary cinema. Free most days, packed on weekends.', it: 'Una vecchia banca trasformata in palazzo della cultura: soffitti a rotonda, pavimenti in marmo, un programma che va dalla dinastia Ming al cinema contemporaneo. Gratis quasi sempre, affollato nei weekend.', pt: 'Um antigo banco virado palacio cultural: rotunda, pisos de marmore, programacao que vai da dinastia Ming ao cinema contemporaneo. De graca quase sempre, lotado nos fins de semana.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'mac-niteroi', q: 'Museu de Arte Contemporanea Niteroi', name: 'MAC\nNITEROI',
      desc: { en: 'Oscar Niemeyer\'s flying saucer perched over Guanabara Bay, with Rio spread across the water as the real exhibit. Take the ferry from Praca XV, arrive at sunset.', it: 'Il disco volante di Oscar Niemeyer sulla baia di Guanabara, con Rio sull\'altra sponda come vera mostra. Prendi il traghetto da Praca XV, arriva al tramonto.', pt: 'O disco voador de Oscar Niemeyer empoleirado sobre a Baia de Guanabara, com o Rio do outro lado como a exposicao verdadeira. Pegue a barca na Praca XV, chegue no por do sol.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 2 },
    { id: 'mar-rio', q: 'Museu de Arte do Rio MAR Praca Maua', name: 'MAR',
      desc: { en: 'Two buildings under one wave-shaped roof at Praca Maua. Shows are always about Rio itself: its carnival, its geography, its contradictions.', it: 'Due edifici sotto un tetto a onda in Praca Maua. Le mostre parlano sempre di Rio: carnevale, geografia, contraddizioni.', pt: 'Dois predios sob um teto em forma de onda na Praca Maua. As exposicoes sao sempre sobre o Rio: carnaval, geografia, contradicoes.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'museu-do-amanha', q: 'Museu do Amanha Rio', name: 'MUSEU\nDO AMANHA',
      desc: { en: 'Santiago Calatrava\'s white skeleton jutting into the bay, a science museum disguised as a spaceship. Sustainability, cosmos, anthropocene, all inside; sea breeze outside.', it: 'Lo scheletro bianco di Santiago Calatrava proteso sulla baia, un museo scientifico travestito da astronave. Sostenibilita, cosmo, antropocene dentro; brezza marina fuori.', pt: 'O esqueleto branco de Santiago Calatrava projetado sobre a baia, museu de ciencias disfarcado de nave. Sustentabilidade, cosmos, antropoceno dentro; brisa do mar la fora.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 2 },
    { id: 'lilia-rio', q: 'Lilia restaurante Centro Rio', name: 'LILIA',
      desc: { en: 'Lucio Vieira cooks an ever-changing tasting menu in a 15-seat dining room downtown. Hand-harvested seafood, caipirinha pairings, the most talked-about reservation in the city.', it: 'Lucio Vieira cucina un menu degustazione sempre diverso in una sala da 15 coperti in centro. Pesce pescato a mano, abbinamenti di caipirinha, la prenotazione piu chiacchierata della citta.', pt: 'Lucio Vieira cozinha um menu-degustacao sempre em mutacao em um salao de 15 lugares no centro. Frutos do mar de pesca artesanal, harmonizacao com caipirinha, a reserva mais disputada da cidade.' },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 4 },
    { id: 'prainha-beach', q: 'Prainha Beach Rio de Janeiro', name: 'PRAINHA',
      desc: { en: 'A crescent of green water surrounded by Atlantic forest, 40 minutes west of Ipanema and felt like another coast. Surfers in the morning, empty by late afternoon.', it: 'Una mezzaluna di acqua verde circondata dalla foresta atlantica, 40 minuti a ovest di Ipanema e sembra un\'altra costa. Surfisti al mattino, vuota nel tardo pomeriggio.', pt: 'Uma meia-lua de agua verde cercada pela mata atlantica, 40 minutos a oeste de Ipanema e parece outra costa. Surfistas de manha, vazia no fim da tarde.' },
      dateType: 'outdoor', vibe: 'casual', priceRange: 1 },
    { id: 'la-bicyclette', q: 'La Bicyclette Jardim Botanico Rio', name: 'LA\nBICYCLETTE',
      desc: { en: 'A French bakery hidden inside the Jardim Botanico. Croissants, tartes, strong coffee, and a garden table where you can actually hear the toucans.', it: 'Una boulangerie francese nascosta nel Jardim Botanico. Croissant, tartes, caffe forte e un tavolino in giardino dove senti davvero i tucani.', pt: 'Uma boulangerie francesa escondida dentro do Jardim Botanico. Croissants, tortas, cafe forte e uma mesa no jardim onde da pra ouvir os tucanos.' },
      dateType: 'coffee-pastry', vibe: 'romantic', priceRange: 2 },
    { id: 'galeria-movimento', q: 'Galeria Movimento Rio', name: 'GALERIA\nMOVIMENTO',
      desc: { en: 'Leblon gallery focused on contemporary Brazilian painters and sculptors, many mid-career and hitting their peak. Small rooms, careful curation, actual conversations.', it: 'Galleria a Leblon dedicata a pittori e scultori brasiliani contemporanei, spesso al massimo della carriera. Sale piccole, curatela attenta, conversazioni vere.', pt: 'Galeria do Leblon dedicada a pintores e escultores brasileiros contemporaneos, muitos no auge da carreira. Salas pequenas, curadoria cuidadosa, conversa de verdade.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'silvia-cintra-box-4', q: 'Silvia Cintra Box 4 gallery Rio', name: 'SILVIA\nCINTRA + BOX 4',
      desc: { en: 'One of Rio\'s most serious contemporary art programs, housed in a white-box Gavea space. Beatriz Milhazes, Luiz Zerbini, the heavyweights of Brazilian art.', it: 'Uno dei programmi d\'arte contemporanea piu seri di Rio, in uno spazio white box a Gavea. Beatriz Milhazes, Luiz Zerbini, i pesi massimi dell\'arte brasiliana.', pt: 'Um dos programas mais serios de arte contemporanea do Rio, em um white box na Gavea. Beatriz Milhazes, Luiz Zerbini, o primeiro time da arte brasileira.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'casa-horto', q: 'Casa Horto restaurante Rio', name: 'CASA\nHORTO',
      desc: { en: 'A converted Horto house with an open kitchen, courtyard garden, and a menu of Brazilian ingredients handled with Italian rigor. Midweek is quieter and just as good.', it: 'Una casa di Horto ristrutturata con cucina a vista, giardino interno e un menu di ingredienti brasiliani trattati con rigore italiano. Infrasettimanale e piu tranquillo e altrettanto buono.', pt: 'Uma casa do Horto reformada com cozinha aberta, jardim interno e um menu de ingredientes brasileiros tratados com rigor italiano. Meio de semana e mais calmo e igualmente bom.' },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 3 },
    { id: 'danielian-galeria', q: 'Danielian Galeria Gavea Rio', name: 'DANIELIAN\nGALERIA',
      desc: { en: 'A Gavea gallery with a long bench in the middle and a roster of painters you will want to sit with for a while. Good light, no pressure, genuine conversation.', it: 'Galleria a Gavea con una lunga panca al centro e una scuderia di pittori con cui vorrai sederti un po\'. Buona luce, nessuna pressione, conversazione vera.', pt: 'Galeria na Gavea com um banco comprido no meio e uma lista de pintores com quem voce vai querer sentar um tempo. Boa luz, sem pressao, conversa de verdade.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'ipanema-art-gallery', q: 'Ipanema Art Gallery Rio', name: 'IPANEMA\nART GALLERY',
      desc: { en: 'A small Ipanema space two blocks from the beach, rotating shows of young carioca artists. Sand on the floor, crisp walls, surprising prices.', it: 'Uno spazio piccolo a Ipanema a due isolati dalla spiaggia, mostre a rotazione di giovani artisti carioca. Sabbia sul pavimento, pareti pulite, prezzi sorprendenti.', pt: 'Um espaco pequeno em Ipanema a duas quadras da praia, mostras rotativas de jovens artistas cariocas. Areia no chao, paredes limpas, precos surpreendentes.' },
      dateType: 'cultural', vibe: 'casual', priceRange: 1 },
    { id: 'jardins-museu-republica', q: 'Jardins Museu da Republica Catete Rio', name: 'JARDINS\nDO CATETE',
      desc: { en: 'The gardens around the former presidential palace: royal palms, a lake, the agouti who live there, benches that hold you for an hour. Free, downtown, somehow secret.', it: 'I giardini attorno all\'ex palazzo presidenziale: palme reali, un laghetto, le agouti che ci vivono, panchine che ti trattengono un\'ora. Gratis, in centro, in qualche modo segreto.', pt: 'Os jardins do antigo palacio presidencial: palmeiras imperiais, um lago, as cutias que moram ali, bancos que te seguram uma hora. De graca, no centro, meio secreto.' },
      dateType: 'outdoor', vibe: 'romantic', priceRange: 1 },
    { id: 'museu-da-republica', q: 'Museu da Republica Catete Rio', name: 'MUSEU\nDA REPUBLICA',
      desc: { en: 'The neoclassical palace where Getulio Vargas killed himself in 1954, now a museum of Brazilian political history. The bullet hole is still there, his pajamas too.', it: 'Il palazzo neoclassico dove Getulio Vargas si suicido nel 1954, oggi museo di storia politica brasiliana. Il foro del proiettile c\'e ancora, e anche il suo pigiama.', pt: 'O palacio neoclassico onde Getulio Vargas se matou em 1954, hoje museu de historia politica brasileira. O furo da bala continua la, o pijama tambem.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'quartinho-bar', q: 'Quartinho bar Rio de Janeiro', name: 'QUARTINHO',
      desc: { en: 'A dozen stools, a marble counter, a bartender who actually listens. Natural wine, pickled things on toast, the best excuse to skip dinner.', it: 'Una dozzina di sgabelli, un banco di marmo, un barman che ascolta davvero. Vini naturali, conserve su crostini, la scusa migliore per saltare la cena.', pt: 'Uma duzia de banquinhos, balcao de marmore, um bartender que realmente escuta. Vinho natural, conservas sobre torrada, a melhor desculpa para pular o jantar.' },
      dateType: 'cocktail-bar', vibe: 'romantic', priceRange: 3 },
    { id: 'ruda-restaurante', q: 'Ruda restaurante Rio de Janeiro', name: 'RUDA',
      desc: { en: 'Brazilian cerrado and cocoa country on a plate, with a wine cellar heavy on small producers. Warm wood, candlelight, the kind of place where two hours disappear.', it: 'Il cerrado e la regione del cacao brasiliana nel piatto, con una cantina ricca di piccoli produttori. Legno caldo, candele, il posto dove due ore spariscono.', pt: 'Cerrado e pais do cacau no prato, com carta de vinhos pesada em pequenos produtores. Madeira quente, vela, o tipo de lugar em que duas horas somem.' },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 4 },
    { id: 'koral-restaurante', q: 'Koral restaurante Emiliano Copacabana', name: 'KORAL',
      desc: { en: 'The rooftop pool restaurant on top of the Emiliano, Copacabana beach below, Sugarloaf to the left. Seafood-forward, cocktails sharp, service on silent wheels.', it: 'Il ristorante a bordo piscina in cima all\'Emiliano, Copacabana sotto, il Pao di Zucchero a sinistra. Cucina di mare, cocktail affilati, servizio su ruote silenziose.', pt: 'O restaurante da piscina no topo do Emiliano, Copacabana embaixo, o Pao de Acucar a esquerda. Mao pesada em frutos do mar, drinks afiados, servico em rodinhas silenciosas.' },
      dateType: 'romantic-dinner', vibe: 'classic', priceRange: 4 },
    { id: 'posi-terrazza', q: 'Posi Terrazza rooftop Rio', name: 'POSI\nTERRAZZA',
      desc: { en: 'A Leblon rooftop with unexpectedly good pizza, unexpectedly great negroni, and the mountains lit pink at sunset. Book the bar, not a table.', it: 'Una terrazza a Leblon con pizza insospettabilmente buona, negroni insospettabilmente ottimo e le montagne rosate al tramonto. Prenota il bancone, non un tavolo.', pt: 'Um rooftop no Leblon com pizza inesperadamente boa, negroni inesperadamente otimo e os morros cor-de-rosa no por do sol. Reserve o balcao, nao mesa.' },
      dateType: 'cocktail-bar', vibe: 'festive', priceRange: 3 },
    { id: 'boa-praca', q: 'Boa Praca Botafogo Rio', name: 'BOA\nPRACA',
      desc: { en: 'Botafogo bakery-cafe on a shady square, tables spilling outside. Proper brunch, even more proper people-watching. Order the ovos mexidos.', it: 'Panetteria-caffe di Botafogo su una piazzetta ombrosa, tavoli che sbordano fuori. Brunch come si deve, gente-guardare ancora piu come si deve. Ordina gli ovos mexidos.', pt: 'Padaria-cafe de Botafogo em uma pracinha sombreada, mesas transbordando pra fora. Brunch de verdade, povo pra observar ainda mais de verdade. Peca os ovos mexidos.' },
      dateType: 'coffee-pastry', vibe: 'casual', priceRange: 2 },
    { id: 'boteco-belmonte', q: 'Boteco Belmonte Rio', name: 'BOTECO\nBELMONTE',
      desc: { en: 'Carioca botequim chain that refuses to feel like one. Empadas, ice-cold chopp, bar snacks worth the walk. Any of the branches works, the Flamengo one especially.', it: 'Catena di botequim carioca che rifiuta di sembrare una catena. Empadas, chopp ghiacciato, stuzzichini da bar che meritano il viaggio. Qualunque sede va bene, in particolare quella di Flamengo.', pt: 'Rede de botequim carioca que se recusa a parecer rede. Empadas, chopp gelado, petiscos que valem a caminhada. Qualquer filial serve, em especial a do Flamengo.' },
      dateType: 'aperitivo', vibe: 'casual', priceRange: 2 },
    { id: 'nosso-bar', q: 'Nosso bar Leblon Rio', name: 'NOSSO',
      desc: { en: 'A tiny Leblon bar with an open kitchen along one wall and ten seats along the other. Chef and bartender trade off every course; it works.', it: 'Un piccolo bar a Leblon con la cucina aperta su una parete e dieci coperti sull\'altra. Cuoco e barman si alternano a ogni portata; funziona.', pt: 'Um barzinho do Leblon com cozinha aberta em uma parede e dez lugares na outra. Chef e bartender se revezam a cada prato; funciona.' },
      dateType: 'cocktail-bar', vibe: 'romantic', priceRange: 3 },
    { id: 'slow-bakery', q: 'The Slow Bakery Botafogo Rio', name: 'THE SLOW\nBAKERY',
      desc: { en: 'Sourdough, cardamom buns, the kind of bakery queue you are happy to stand in. Botafogo location is sunlit, the Gavea one is calmer.', it: 'Pane a lievito madre, girelle al cardamomo, il tipo di coda da panetteria in cui sei felice di stare. La sede di Botafogo e piena di luce, quella di Gavea e piu tranquilla.', pt: 'Pao de fermentacao natural, pao de cardamomo, o tipo de fila de padaria em que voce e feliz de ficar. A unidade de Botafogo tem mais sol, a da Gavea e mais calma.' },
      dateType: 'coffee-pastry', vibe: 'casual', priceRange: 2 },
    { id: 'nara-roesler', q: 'Nara Roesler gallery Rio de Janeiro', name: 'NARA\nROESLER',
      desc: { en: 'Flagship Ipanema gallery in the Brazilian contemporary scene. If Tomie Ohtake or Antonio Dias is on the wall, get there before it closes.', it: 'Galleria di riferimento a Ipanema nel panorama contemporaneo brasiliano. Se c\'e Tomie Ohtake o Antonio Dias in mostra, corri prima che chiuda.', pt: 'Galeria de referencia em Ipanema no cenario contemporaneo brasileiro. Se tiver Tomie Ohtake ou Antonio Dias na parede, va antes de fechar.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'maska-rio', q: 'Maska restaurante Rio', name: 'MASKA',
      desc: { en: 'An Eastern Mediterranean kitchen in Botafogo: charred flatbreads, labneh, aged lamb over coals. The room is all warm terracotta and candles.', it: 'Cucina mediterranea orientale a Botafogo: pane piatto bruciacchiato, labneh, agnello frollato sulla brace. La sala e terracotta calda e candele.', pt: 'Cozinha do Mediterraneo oriental em Botafogo: paes achatados queimados, labneh, cordeiro maturado na brasa. A sala e toda terracota quente e velas.' },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 3 },
    { id: 'ariz-espumante', q: 'Ariz Bar de Espumante Rio', name: 'ARIZ',
      desc: { en: 'A sparkling-wine-only bar in Leblon, forty-something labels by the glass, small plates to match. Start standing, end sitting, never regret it.', it: 'Un bar di soli spumanti a Leblon, quaranta e passa etichette al calice, piattini in abbinamento. Inizia in piedi, finisci seduto, zero rimpianti.', pt: 'Um bar so de espumante no Leblon, quarenta e tantos rotulos na taca, pratinhos pra acompanhar. Comeca em pe, termina sentado, nunca se arrepende.' },
      dateType: 'cocktail-bar', vibe: 'festive', priceRange: 3 },
    { id: 'henriqueta', q: 'Henriqueta restaurante Rio', name: 'HENRIQUETA',
      desc: { en: 'A Gavea restaurant built inside a converted house, candlelit, with a short menu of Brazilian ingredients done precisely. The couvert alone is worth it.', it: 'Ristorante a Gavea in una casa riconvertita, a lume di candela, con un menu breve di ingredienti brasiliani precisissimi. Il couvert vale da solo.', pt: 'Restaurante na Gavea em uma casa reformada, a luz de velas, com menu curto de ingredientes brasileiros feitos com precisao. So o couvert ja vale.' },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 3 },
    { id: 'san-rio', q: 'San restaurante Rio de Janeiro', name: 'SAN',
      desc: { en: 'Japanese-Brazilian omakase in a Leblon basement: eight seats, two seatings a night, the chef cutting everything in front of you.', it: 'Omakase nippo-brasiliana in un seminterrato a Leblon: otto coperti, due turni a sera, lo chef che taglia tutto davanti a te.', pt: 'Omakase nipo-brasileiro num subsolo do Leblon: oito lugares, duas sessoes por noite, o chef cortando tudo na sua frente.' },
      dateType: 'romantic-dinner', vibe: 'classic', priceRange: 4 },
    { id: 'restaurante-emile', q: 'Restaurante Emile Rio', name: 'EMILE',
      desc: { en: 'A Leblon French bistro with white tablecloths, steak frites you will remember, and a maitre d\' who remembers you back. Old-school and proud of it.', it: 'Bistrot francese a Leblon con tovaglie bianche, una steak frites che ricorderai e un maitre che si ricorda di te. Vecchia scuola, e ne va fiero.', pt: 'Bistro frances no Leblon com toalhas brancas, steak frites memoravel e um maitre que se lembra de voce. Da velha guarda e orgulhoso disso.' },
      dateType: 'romantic-dinner', vibe: 'classic', priceRange: 4 },
    { id: 'elena-horto', q: 'Elena Horto restaurante Rio', name: 'ELENA\nHORTO',
      desc: { en: 'A Horto restaurant tucked against the forest, with an open-air dining room that feels borrowed from the Jardim Botanico next door. Italian soul, Brazilian produce.', it: 'Ristorante a Horto nascosto contro la foresta, sala all\'aperto che sembra presa in prestito dal Jardim Botanico accanto. Anima italiana, materia prima brasiliana.', pt: 'Restaurante no Horto encostado na mata, salao ao ar livre que parece emprestado do Jardim Botanico ao lado. Alma italiana, materia brasileira.' },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 3 },
    { id: 'vian-cocktail-bar', q: 'Vian Cocktail Bar Rio', name: 'VIAN',
      desc: { en: 'A dim Leblon cocktail den with a menu built like poetry, each drink titled and told. Low music, leather booths, serious intent.', it: 'Cocktail bar buio a Leblon con carta dei drink costruita come poesia, ogni bevuta ha un titolo e una storia. Musica bassa, divanetti di pelle, intenti seri.', pt: 'Coquetelaria escura no Leblon com menu construido como poesia, cada drink com titulo e historia. Musica baixa, sofas de couro, intencao seria.' },
      dateType: 'cocktail-bar', vibe: 'romantic', priceRange: 3 },
    { id: 'dengo-chocolates', q: 'Dengo Chocolates Rio', name: 'DENGO',
      desc: { en: 'Brazilian single-origin chocolate from cacao grown directly with small farmers in Bahia. The Ipanema cafe pairs every bar with a small coffee.', it: 'Cioccolato brasiliano a singola origine, cacao coltivato direttamente con piccoli agricoltori di Bahia. Il cafe di Ipanema abbina ogni tavoletta a un piccolo caffe.', pt: 'Chocolate brasileiro de origem unica, cacau cultivado direto com pequenos agricultores na Bahia. O cafe em Ipanema combina cada barra com um cafezinho.' },
      dateType: 'coffee-pastry', vibe: 'romantic', priceRange: 2 },
    { id: 'anita-schwartz', q: 'Anita Schwartz Galeria de Arte Rio', name: 'ANITA\nSCHWARTZ',
      desc: { en: 'A three-floor Gavea gallery in a modernist concrete building. Mid-to-senior Brazilian artists; ambitious, generous hanging.', it: 'Galleria a Gavea su tre piani in un edificio di cemento modernista. Artisti brasiliani di mezza carriera e senior; allestimenti ambiziosi e generosi.', pt: 'Galeria de tres andares na Gavea, em um predio modernista de concreto. Artistas brasileiros de meio e fim de carreira; montagens ambiciosas e generosas.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'gajos-douro', q: "Gajos d'Ouro Rio de Janeiro", name: "GAJOS\nD'OURO",
      desc: { en: 'A Copacabana Portuguese dining room that has not changed in forty years and has no intention of starting. Bacalhau, vinho verde, bolo de rolo, and a plastic-covered menu to match.', it: 'Sala da pranzo portoghese a Copacabana che non cambia da quarant\'anni e non intende iniziare. Bacalhau, vinho verde, bolo de rolo, e menu con copertina di plastica in tinta.', pt: 'Salao portugues em Copacabana que nao muda ha quarenta anos e nao pretende comecar. Bacalhau, vinho verde, bolo de rolo, e o cardapio plastificado combinando.' },
      dateType: 'romantic-dinner', vibe: 'classic', priceRange: 3 },
    { id: 'ocya-ilha', q: 'OCYA Ilha Rio de Janeiro', name: 'OCYA',
      desc: { en: 'A restaurant on an island in Guanabara Bay, reachable only by boat, lunch served with your feet in the sand. Seafood, white wine, no phone signal.', it: 'Ristorante su un\'isola della baia di Guanabara, raggiungibile solo in barca, pranzo coi piedi nella sabbia. Pesce, vino bianco, niente segnale telefonico.', pt: 'Restaurante em uma ilha na Baia de Guanabara, so de barco, almoco com o pe na areia. Frutos do mar, vinho branco, sem sinal de celular.' },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 4 },
    { id: 'rubaiyat-rio', q: 'Rubaiyat restaurante Rio de Janeiro', name: 'RUBAIYAT',
      desc: { en: 'Sprawling steakhouse in Leblon with a garden courtyard, ribeye from the family\'s own ranch, and a Sunday feijoada that turns into an event.', it: 'Grande steakhouse a Leblon con cortile-giardino, ribeye dal ranch di famiglia e una feijoada della domenica che diventa evento.', pt: 'Steakhouse grandona no Leblon com jardim interno, ancho da propria fazenda da familia e uma feijoada de domingo que vira programa.' },
      dateType: 'romantic-dinner', vibe: 'classic', priceRange: 4 },
    { id: 'real-gabinete', q: 'Real Gabinete Portugues de Leitura Rio', name: 'REAL\nGABINETE',
      desc: { en: 'A 19th-century Portuguese reading room in Centro: jacaranda shelves, stained-glass skylight, 350,000 books and complete silence. Free entry, one of the most photographed libraries in the world.', it: 'Sala di lettura portoghese ottocentesca in centro: scaffali di jacaranda, lucernario di vetri colorati, 350.000 libri e silenzio assoluto. Ingresso libero, una delle biblioteche piu fotografate al mondo.', pt: 'Sala de leitura portuguesa do seculo 19 no Centro: estantes de jacaranda, clarabolia de vitral, 350 mil livros e silencio absoluto. Entrada franca, uma das bibliotecas mais fotografadas do mundo.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'emporio-jardim', q: 'Emporio Jardim cafe Rio', name: 'EMPORIO\nJARDIM',
      desc: { en: 'Botafogo cafe with tall windows, shelves of pantry things for sale, and coffee you linger over. The kind of place where you break out your notebook.', it: 'Cafe di Botafogo con vetrate alte, scaffali di prodotti in vendita e caffe da sorseggiare con calma. Il posto dove tiri fuori il taccuino.', pt: 'Cafe em Botafogo com janelas altas, prateleiras de produtos a venda e cafe pra se demorar. O tipo de lugar em que voce puxa o caderno.' },
      dateType: 'coffee-pastry', vibe: 'romantic', priceRange: 2 },
    { id: 'morro-da-urca', q: 'Morro da Urca Rio', name: 'MORRO\nDA URCA',
      desc: { en: 'The first of the two cable cars up Sugarloaf. Half the altitude, half the line, more than half the view: the whole city unspooling south from your feet.', it: 'La prima delle due funivie del Pao di Zucchero. Meta altezza, meta coda, piu di meta panorama: l\'intera citta che si srotola a sud dai tuoi piedi.', pt: 'O primeiro dos dois bondinhos do Pao de Acucar. Metade da altitude, metade da fila, mais da metade da vista: a cidade inteira se abrindo ao sul dos seus pes.' },
      dateType: 'outdoor', vibe: 'romantic', priceRange: 2 },
    { id: 'copacabana-fort', q: 'Forte de Copacabana Rio', name: 'FORTE DE\nCOPACABANA',
      desc: { en: 'A 1908 fort at the east end of Copacabana beach, with a cafe terrace that has the most pointed view of the entire curve. Walk the ramparts, stay for the coffee.', it: 'Forte del 1908 all\'estremita est di Copacabana, con una terrazza-cafe dalla vista piu diretta sull\'intera curva. Cammina sulle mura, fermati per il caffe.', pt: 'Forte de 1908 no extremo leste de Copacabana, com cafe-terraco com a vista mais direta da curva inteira. Ande pelas muralhas, fique pro cafe.' },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'maria-e-o-boi', q: 'Maria e o Boi restaurante Rio', name: 'MARIA\nE O BOI',
      desc: { en: 'Grill-forward kitchen in Botafogo: open fire, aged beef, Brazilian wines you will not see elsewhere. Book a seat at the counter to watch the embers.', it: 'Cucina di griglia a Botafogo: fuoco aperto, carni frollate, vini brasiliani che non trovi altrove. Prenota al banco per guardare le braci.', pt: 'Cozinha ao redor do fogo em Botafogo: fogo aberto, carnes maturadas, vinhos brasileiros que voce nao ve em outro lugar. Reserve no balcao pra ver as brasas.' },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 3 },
    { id: 'marius-degustare', q: 'Marius Degustare Copacabana', name: 'MARIUS\nDEGUSTARE',
      desc: { en: 'A rodizio on Copacabana but the seafood version: lagostim, polvo, ostras, passing by on skewers until you surrender. Absolute chaos, absolute feast.', it: 'Un rodizio a Copacabana ma versione di mare: lagostino, polpo, ostriche, che sfilano su spiedini finche non ti arrendi. Caos totale, festa totale.', pt: 'Um rodizio em Copacabana mas versao mar: lagostim, polvo, ostra, passando nos espetos ate voce se render. Caos total, festa total.' },
      dateType: 'romantic-dinner', vibe: 'festive', priceRange: 4 },
    { id: 'malta-beef-club', q: 'Malta Beef Club Rio', name: 'MALTA\nBEEF CLUB',
      desc: { en: 'An Ipanema basement steakhouse styled like a speakeasy. Dry-aged beef, a tight wine list, cocktails with serious edges. Dress better than you think.', it: 'Steakhouse a Ipanema in seminterrato, stile speakeasy. Carni frollate a secco, carta dei vini stretta, cocktail con spigoli veri. Vestiti meglio di quanto pensi.', pt: 'Steakhouse num subsolo de Ipanema em clima de speakeasy. Carne maturada a seco, carta de vinhos curta, drinks com arestas de verdade. Vista-se melhor do que voce pensa.' },
      dateType: 'romantic-dinner', vibe: 'classic', priceRange: 4 },
    { id: 'botafogo-beach', q: 'Praia de Botafogo Rio', name: 'PRAIA DE\nBOTAFOGO',
      desc: { en: 'The crescent beach no one swims at but everyone walks along: Sugarloaf directly ahead, boats bobbing in front of you. Best at magic hour.', it: 'La spiaggia a mezzaluna dove nessuno fa il bagno ma tutti passeggiano: il Pao di Zucchero di fronte, le barche che dondolano. Meglio nell\'ora magica.', pt: 'A praia em meia-lua onde ninguem nada mas todo mundo caminha: o Pao de Acucar na sua frente, os barcos balancando. Melhor na golden hour.' },
      dateType: 'outdoor', vibe: 'romantic', priceRange: 1 },
    { id: 'arp-bar', q: 'Arp bar Rio de Janeiro', name: 'ARP BAR',
      desc: { en: 'A modernist-inspired cocktail bar in Ipanema, named after the sculptor, built around drinks that keep changing shape. Low light, high attention.', it: 'Cocktail bar ispirato al modernismo a Ipanema, intitolato allo scultore, costruito attorno a drink che cambiano forma. Luce bassa, attenzione alta.', pt: 'Coquetelaria de inspiracao modernista em Ipanema, em homenagem ao escultor, construida em torno de drinks que ficam mudando de forma. Luz baixa, atencao alta.' },
      dateType: 'cocktail-bar', vibe: 'romantic', priceRange: 3 },
    { id: 'sugarloaf-mountain', q: 'Pao de Acucar Sugarloaf Rio', name: 'PAO\nDE ACUCAR',
      desc: { en: 'The two-stage cable car up the granite monolith at the mouth of Guanabara Bay. Ride it at sunset with the city lights coming on beneath you.', it: 'La funivia a due tratte sul monolite di granito all\'imbocco della baia di Guanabara. Fallo al tramonto con le luci della citta che si accendono sotto.', pt: 'O bondinho em duas etapas pelo monolito de granito na boca da Baia de Guanabara. Va no por do sol com as luzes da cidade acendendo embaixo.' },
      dateType: 'outdoor', vibe: 'romantic', priceRange: 2 },
    { id: 'mocellin-steakhouse', q: 'Mocellin Steakhouse Rio', name: 'MOCELLIN',
      desc: { en: 'Old-school Barra steakhouse with a wood-panel dining room and a parade of cuts you have never seen cut that way before. Unapologetic, excellent.', it: 'Steakhouse vecchia scuola a Barra con sala con boiserie e una sfilata di tagli che non avevi mai visto tagliare cosi. Senza scuse, eccellente.', pt: 'Steakhouse da velha guarda em Barra com salao de madeira e um desfile de cortes que voce nunca viu cortar assim. Sem pedir desculpa, excelente.' },
      dateType: 'romantic-dinner', vibe: 'classic', priceRange: 4 },
    { id: 'assador', q: 'Assador restaurante Rio', name: 'ASSADOR',
      desc: { en: 'A Flamengo churrascaria with a rotating panoramic dining room, cuts brought to the table until you surrender, Sugarloaf changing color through the window.', it: 'Churrascaria a Flamengo con sala panoramica girevole, tagli portati al tavolo finche non ti arrendi, il Pao di Zucchero che cambia colore dietro i vetri.', pt: 'Churrascaria no Flamengo com salao panoramico giratorio, cortes chegando ate voce desistir, o Pao de Acucar mudando de cor pelo vidro.' },
      dateType: 'romantic-dinner', vibe: 'classic', priceRange: 3 },
    { id: 'trilha-morro-urca', q: 'Trilha do Morro da Urca Rio', name: 'TRILHA DO\nMORRO DA URCA',
      desc: { en: 'The forest trail up the first peak of Sugarloaf: forty minutes of tropical jungle, marmosets overhead, a summit bar waiting for you with cold beer.', it: 'Il sentiero nella foresta fino alla prima vetta del Pao di Zucchero: quaranta minuti di giungla tropicale, uistiti sulla testa, un bar in cima con birra fresca.', pt: 'A trilha na mata ate o primeiro pico do Pao de Acucar: quarenta minutos de mata tropical, saguis em cima de voce, um bar no topo te esperando com cerveja gelada.' },
      dateType: 'outdoor', vibe: 'casual', priceRange: 1 },
    { id: 'xian-rio', q: 'Xian restaurant Rio rooftop', name: 'XIAN',
      desc: { en: 'A pan-Asian rooftop in Ipanema, twelve floors up, with the Cristo framed perfectly between two buildings. Dumplings, dim sum, cocktails with teeth.', it: 'Pan-asiatico sul rooftop a Ipanema, dodici piani sopra, con il Cristo incorniciato tra due edifici. Dumpling, dim sum, cocktail con mordente.', pt: 'Pan-asiatico no rooftop de Ipanema, doze andares acima, com o Cristo emoldurado entre dois predios. Dumplings, dim sum, drinks com dente.' },
      dateType: 'romantic-dinner', vibe: 'festive', priceRange: 4 },
    { id: 'praia-vermelha', q: 'Praia Vermelha Urca Rio', name: 'PRAIA\nVERMELHA',
      desc: { en: 'A short curve of coarse red sand tucked between Sugarloaf and Urca hill. Calm water, easy walking trails at either end, the most protected beach in town.', it: 'Una breve curva di sabbia rossa grossa tra il Pao di Zucchero e il colle dell\'Urca. Acqua calma, sentieri facili alle estremita, la spiaggia piu protetta della citta.', pt: 'Uma curva curta de areia vermelha grossa entre o Pao de Acucar e o Morro da Urca. Mar calmo, trilhas faceis nas pontas, a praia mais protegida da cidade.' },
      dateType: 'outdoor', vibe: 'romantic', priceRange: 1 },
    { id: 'praia-barra-tijuca', q: 'Praia da Barra da Tijuca Rio', name: 'BARRA\nDA TIJUCA',
      desc: { en: '18 kilometres of open Atlantic, big surf, few buildings close to the sand. Rent a chair at posto 4, drive further west for empty water.', it: '18 chilometri di Atlantico aperto, onde grandi, pochi edifici vicini alla sabbia. Noleggia una sedia al posto 4, guida piu a ovest per acqua vuota.', pt: '18 quilometros de Atlantico aberto, mar grosso, poucos predios perto da areia. Alugue cadeira no posto 4, siga mais a oeste pra ter agua vazia.' },
      dateType: 'outdoor', vibe: 'casual', priceRange: 1 },
    { id: 'pedra-do-arpoador', q: 'Pedra do Arpoador Rio', name: 'PEDRA DO\nARPOADOR',
      desc: { en: 'The black rock between Ipanema and Copacabana where the whole city gathers to clap the sunset. Arrive 45 minutes early. Bring a coat of salt.', it: 'Lo scoglio nero tra Ipanema e Copacabana dove tutta la citta si riunisce per applaudire il tramonto. Arriva 45 minuti prima. Porta una crosta di sale.', pt: 'A pedra escura entre Ipanema e Copacabana onde a cidade inteira se reune pra aplaudir o por do sol. Chegue 45 minutos antes. Traga uma casca de sal.' },
      dateType: 'outdoor', vibe: 'romantic', priceRange: 1 },
    { id: 'lagoa-rodrigo-freitas', q: 'Lagoa Rodrigo de Freitas Rio', name: 'LAGOA',
      desc: { en: 'The freshwater lagoon ringed by a 7.5 km path, framed by Corcovado and Dois Irmaos. Rent a swan pedal boat, a bike, or a kiosk table; all correct.', it: 'La laguna d\'acqua dolce circondata da un anello di 7,5 km, incorniciata da Corcovado e Dois Irmaos. Noleggia un pedalo-cigno, una bici o un tavolino al chiosco; tutti corretti.', pt: 'A lagoa de agua doce cercada por 7,5 km de pista, emoldurada pelo Corcovado e Dois Irmaos. Alugue um pedalinho-cisne, uma bike ou uma mesa de quiosque; tudo certo.' },
      dateType: 'outdoor', vibe: 'romantic', priceRange: 1 },
    { id: 'praia-leblon', q: 'Praia do Leblon Rio', name: 'PRAIA DO\nLEBLON',
      desc: { en: 'The quieter, more family-ish end of the Ipanema-Leblon strip. Mirante do Leblon at the west end has the postcard view of Dois Irmaos.', it: 'L\'estremita piu tranquilla e familiare della fascia Ipanema-Leblon. Il Mirante do Leblon a ovest ha la vista da cartolina su Dois Irmaos.', pt: 'A ponta mais calma e familiar da faixa Ipanema-Leblon. O Mirante do Leblon na ponta oeste tem a vista de cartao postal dos Dois Irmaos.' },
      dateType: 'outdoor', vibe: 'casual', priceRange: 1 },
    { id: 'arpoador', q: 'Arpoador Rio de Janeiro', name: 'ARPOADOR',
      desc: { en: 'The neighborhood and beach crease where Ipanema meets Copacabana. Surf break to the right, Dois Irmaos straight ahead, the clapping rock behind you.', it: 'Il quartiere e l\'angolo di spiaggia dove Ipanema incontra Copacabana. Onde a destra, Dois Irmaos davanti, la pietra degli applausi alle spalle.', pt: 'O bairro e a ponta da praia onde Ipanema encontra Copacabana. Pico de surfe a direita, Dois Irmaos em frente, a pedra do aplauso atras.' },
      dateType: 'outdoor', vibe: 'casual', priceRange: 1 },
    { id: 'vista-chinesa', q: 'Vista Chinesa Rio de Janeiro', name: 'VISTA\nCHINESA',
      desc: { en: 'A Chinese-pagoda-style gazebo in the Tijuca forest with a clean view down the south zone: Lagoa, Corcovado shoulder, Ipanema, the ocean. Uber up, walk back down.', it: 'Un gazebo in stile pagoda cinese nella foresta di Tijuca con una vista pulita sulla zona sud: Lagoa, la spalla del Corcovado, Ipanema, l\'oceano. Uber in salita, a piedi in discesa.', pt: 'Um mirante em estilo pagode chines na Floresta da Tijuca com uma vista limpa da zona sul: Lagoa, ombro do Corcovado, Ipanema, o oceano. De Uber pra subir, a pe pra descer.' },
      dateType: 'outdoor', vibe: 'romantic', priceRange: 1 },
    { id: 'satyricon-rio', q: 'Satyricon Ipanema Rio', name: 'SATYRICON',
      desc: { en: 'Ipanema seafood institution since 1986. Whole fish baked in salt, handmade pasta, oysters on ice: expensive, correct, every time.', it: 'Istituzione di pesce a Ipanema dal 1986. Pesce intero al sale, pasta fatta in casa, ostriche sul ghiaccio: caro, corretto, ogni volta.', pt: 'Instituicao de frutos do mar em Ipanema desde 1986. Peixe inteiro na crosta de sal, massa caseira, ostras no gelo: caro, certo, sempre.' },
      dateType: 'romantic-dinner', vibe: 'classic', priceRange: 4 },
];

async function searchPlace(query) {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.photos,places.formattedAddress,places.googleMapsUri,places.addressComponents',
        },
        body: JSON.stringify({
            textQuery: query.replace(/\n/g, ' ') + ' Rio de Janeiro',
            maxResultCount: 1,
            locationBias: { circle: { center: { latitude: RIO.lat, longitude: RIO.lon }, radius: RIO.radius } },
        }),
    });
    if (!r.ok) { console.error('search fail', query, r.status); return null; }
    const d = await r.json();
    return (d.places || [])[0] || null;
}

async function resolvePhoto(photoName) {
    const r = await fetch(`https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1600&skipHttpRedirect=true&key=${KEY}`);
    if (!r.ok) return null;
    const d = await r.json();
    return d.photoUri || null;
}

function neighborhoodFromAddress(address, components) {
    if (components && components.length) {
        const sub = components.find(c => c.types?.includes('sublocality') || c.types?.includes('sublocality_level_1'));
        if (sub) return sub.longText || sub.shortText;
        const pol = components.find(c => c.types?.includes('political'));
        if (pol) return pol.longText || pol.shortText;
    }
    if (!address) return '';
    const parts = address.split(',').map(s => s.trim());
    // Heuristic: third-from-last part is usually the neighborhood
    return parts[parts.length - 3] || parts[0] || '';
}

async function run() {
    const spots = JSON.parse(fs.readFileSync(SPOTS_PATH, 'utf8'));
    const byId = new Map(spots.map(s => [s.id, s]));
    let added = 0, updated = 0, failed = 0;

    for (let i = 0; i < PLACES.length; i++) {
        const p = PLACES[i];
        process.stdout.write(`[${i+1}/${PLACES.length}] ${p.q} ... `);
        try {
            const place = await searchPlace(p.q);
            if (!place) { console.log('no match'); failed++; continue; }
            const photoRef = place.photos?.[0]?.name;
            const heroImage = photoRef ? (await resolvePhoto(photoRef)) : '';
            const hood = neighborhoodFromAddress(place.formattedAddress, place.addressComponents);
            const hoodEn = hood ? `${hood}, Rio de Janeiro` : 'Rio de Janeiro';
            const neighborhood = {
                en: hoodEn,
                it: hoodEn,
                pt: hoodEn,
            };
            const spot = {
                id: p.id,
                city: 'rio',
                name: p.name,
                neighborhood,
                description: p.desc,
                heroImage: heroImage || '',
                heroAlt: place.displayName?.text || p.name.replace(/\n/g, ' '),
                heroPosition: 'center center',
                mapsUrl: place.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.q)}`,
                dateType: p.dateType,
                vibe: p.vibe,
                priceRange: p.priceRange,
                lat: place.location?.latitude ?? null,
                lon: place.location?.longitude ?? null,
            };
            if (byId.has(p.id)) {
                Object.assign(byId.get(p.id), spot);
                updated++;
                console.log('updated', heroImage ? '(photo)' : '(no photo)');
            } else {
                spots.push(spot);
                byId.set(p.id, spot);
                added++;
                console.log('added', heroImage ? '(photo)' : '(no photo)');
            }
            // Throttle a hair so we don't slam the API
            await new Promise(r => setTimeout(r, 150));
        } catch (err) {
            console.log('err', err.message);
            failed++;
        }
    }

    fs.writeFileSync(SPOTS_PATH, JSON.stringify(spots, null, 2) + '\n');
    console.log(`\nDone. added=${added} updated=${updated} failed=${failed} total=${spots.length}`);
}

run().catch(e => { console.error(e); process.exit(1); });
