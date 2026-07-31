#!/usr/bin/env node
// Fill in IT/PT/FR translations for Tokyo spot descriptions.
// EN was written during bulk import; the other three languages were left
// empty and fell back to English. This script overwrites the empty
// strings with proper translations so the language switcher works.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPOTS_PATH = path.join(__dirname, '..', 'data', 'spots.json');

const T = {
'matsuya-ginza-tokyo': {
  it: "Un grande magazzino di Ginza con un food hall nel piano interrato che vale un giro lento. Curiosa la depachika insieme, scegli due bento, mangiali nel giardino sul tetto.",
  pt: "Uma loja de departamentos em Ginza com um food hall no subsolo que vale uma volta sem pressa. Passeie pela depachika juntos, escolham dois bento e comam no jardim do terraco.",
  fr: "Un grand magasin de Ginza avec un food hall au sous-sol qui merite une visite tranquille. Fouinez la depachika ensemble, choisissez deux bento, et mangez-les dans le jardin sur le toit."
},
'yayoi-kusama-museum-tokyo': {
  it: "Cinque piani dedicati a una delle artiste piu fotografate al mondo. I biglietti hanno orari fissi e si esauriscono: prenota lo slot tardo e chiudi il pomeriggio nella Infinity Room.",
  pt: "Cinco andares dedicados a uma das artistas mais fotografadas do mundo. Os ingressos sao por horario e esgotam: marque o slot mais tarde e termine a tarde na Infinity Room.",
  fr: "Cinq etages consacres a l'une des artistes les plus photographiees au monde. Les billets sont horodates et partent vite: reservez le creneau tardif et finissez l'apres-midi dans la Infinity Room."
},
'mensho-tokyo': {
  it: "Il ramen all'agnello di Tomoharu Shono a Korakuen. C'e la fila, ma scorre. Ordina il Lamb Shoyu e guardali tirare a mano i noodle dietro il banco.",
  pt: "O ramen de cordeiro de Tomoharu Shono em Korakuen. Vai ter fila; anda rapido. Peca o Lamb Shoyu e veja eles puxando o macarrao atras do balcao.",
  fr: "Le ramen d'agneau de Tomoharu Shono a Korakuen. Il y aura la queue, ca avance. Commandez le Lamb Shoyu et regardez-les tirer les nouilles derriere le comptoir."
},
'sada-juro-tokyo': {
  it: "Un counter intimo dove ogni pezzo di tempura ti arriva davanti nell'attimo in cui esce dall'olio. Otto posti, un solo chef, un solo ritmo.",
  pt: "Um balcao intimo onde cada pedaco de tempura cai na sua frente no instante em que sai do oleo. Oito lugares, um chef, um ritmo so.",
  fr: "Un comptoir intime ou chaque morceau de tempura atterrit devant vous a la seconde ou il sort de l'huile. Huit places, un chef, un seul rythme."
},
'ota-memorial-museum-of-art-tokyo': {
  it: "Un piccolo museo dedicato interamente alle stampe ukiyo-e. Pantofole, angoli con tatami, il tipo di silenzio che ti permette davvero di guardare un Hokusai.",
  pt: "Um museu pequeno dedicado inteiramente as gravuras ukiyo-e. Chinelos, cantos de tatami, o tipo de silencio que deixa voce de fato olhar para um Hokusai.",
  fr: "Un petit musee entierement dedie aux estampes ukiyo-e. Chaussons, coins en tatami, le genre de silence qui vous laisse vraiment regarder un Hokusai."
},
'common-tokyo': {
  it: "Un angolo pulito di Aoyama per uno specialty coffee e un piccolo morso. Siediti alla finestra, dividetevi una fetta, guardate la stradina laterale.",
  pt: "Um canto limpo de Aoyama para um specialty coffee e um lanche pequeno. Sente na janela, divida uma fatia, observe a rua lateral.",
  fr: "Un coin propre d'Aoyama pour un cafe de specialite et une petite bouchee. Asseyez-vous a la fenetre, partagez une part, regardez la rue."
},
'hamarikyu-gardens-tokyo': {
  it: "Le antiche riserve di caccia alle anatre di uno shogun, piegate dentro la citta. Cammina lungo gli stagni d'acqua salata, poi prendi il te verde nella sala da te galleggiante sul lago.",
  pt: "Antigos terrenos de caca a patos de um shogun, dobrados dentro da cidade. Caminhe pelos lagos de agua salgada e tome cha verde na casa de cha flutuante.",
  fr: "Les anciens domaines de chasse aux canards d'un shogun, replies a l'interieur de la ville. Marchez le long des etangs d'eau salee, puis prenez le the vert dans la maison de the flottante sur le lac."
},
'sushizanmai-tokyo': {
  it: "La catena di sushi amichevole e aperta tutta la notte gestita da Mr. Tuna in persona. Siediti al banco, indica nel banco frigo, ordina il chutoro e non pensarci troppo.",
  pt: "A rede simpatica de sushi 24h tocada pelo proprio Sr. Atum. Sente no balcao, aponte para a vitrine, peca o chutoro e nao pense demais.",
  fr: "La chaine de sushi sympathique et ouverte toute la nuit, tenue par Monsieur Thon lui-meme. Asseyez-vous au comptoir, pointez la vitrine, commandez le chutoro, ne reflechissez pas trop."
},
'matsubaya-saryo-tokyo': {
  it: "Una sala da te wagashi dove i dolci sono scolpiti secondo la stagione. Ordina il matcha set e un anmitsu e rallenta il pomeriggio di una marcia intera.",
  pt: "Uma sala de cha wagashi onde os doces sao esculpidos conforme a estacao. Peca o conjunto de matcha e um anmitsu e desacelere a tarde uma marcha inteira.",
  fr: "Un salon de the wagashi ou les sucreries sont sculptees selon la saison. Commandez le set matcha et un anmitsu, ralentissez l'apres-midi d'un cran entier."
},
'idemitsu-museum-of-arts-tokyo': {
  it: "Nascosto nel Teigeki Building con una lunga vista silenziosa sul fossato del Palazzo Imperiale. Ceramiche, calligrafia, e una delle piu grandi collezioni di ciotole da te al mondo.",
  pt: "Escondido no Teigeki Building com uma vista longa e silenciosa sobre o fosso do Palacio Imperial. Ceramicas, caligrafia e uma das maiores colecoes de tigelas de cha do mundo.",
  fr: "Cache dans le Teigeki Building avec une longue vue silencieuse sur les douves du Palais Imperial. Ceramiques, calligraphie, et l'une des plus grandes collections de bols a the au monde."
},
'mori-art-museum-tokyo': {
  it: "Al 53esimo piano di Roppongi Hills. Mostre contemporanee che colpiscono sempre, piu uno skyline di Tokyo che diventa neon durante la tua visita.",
  pt: "No 53o andar do Roppongi Hills. Exposicoes contemporaneas que sempre acertam, mais um skyline de Toquio que vira neon durante a sua visita.",
  fr: "Au 53e etage de Roppongi Hills. Des expositions contemporaines qui touchent juste a chaque fois, et un skyline de Tokyo qui passe au neon pendant votre visite."
},
'roppongi-hills-tokyo': {
  it: "Il complesso originale 'citta dentro la citta'. Attraversa la piazza superando il ragno Maman, sali allo Sky Deck all'ora d'oro, chiudi con un cocktail da qualche parte su Keyakizaka.",
  pt: "O complexo original 'cidade dentro da cidade'. Atravesse a praca passando pela aranha Maman, suba ate o Sky Deck na golden hour, encerre com um drink em algum lugar da Keyakizaka.",
  fr: "Le complexe original 'ville dans la ville'. Traversez la place en passant devant l'araignee Maman, montez au Sky Deck a l'heure doree, finissez avec un cocktail quelque part sur Keyakizaka."
},
'chanoha-tokyo': {
  it: "Il salone da te di Itoen a Ginza. Una carta breve di matcha mono-origine e wagashi di stagione, serviti in ceramiche vere, senza nessuna fretta.",
  pt: "O salao de cha da Itoen em Ginza. Carta curta de matcha de fazenda unica e wagashi sazonais, servidos em ceramica de verdade, sem pressa nenhuma.",
  fr: "Le salon de the d'Itoen a Ginza. Une carte courte de matcha mono-origine et de wagashi de saison, servis en vraie ceramique, sans aucune precipitation."
},
'thinka-sake-coffee-tokyo': {
  it: "Specialty coffee di giorno, una seria carta dei sake di sera, nella stessa piccola sala con lo stesso piccolo staff. Passaggio ideale tra un pomeriggio e una serata.",
  pt: "Specialty coffee de dia, uma carta seria de sake a noite, na mesma salinha com a mesma equipe pequena. Passagem ideal entre uma tarde e um date.",
  fr: "Cafe de specialite le jour, une vraie carte de sake le soir, dans la meme petite salle avec la meme petite equipe. Le pont parfait entre un apres-midi et un rendez-vous."
},
'imperial-palace-east-gardens-tokyo': {
  it: "L'antico mastio del Castello di Edo e i giardini intorno, gratuiti e aperti quasi sempre. Fondamenta di pietra, boschetti di prugno, un prato ampio che sembra impossibile nel centro di Tokyo.",
  pt: "A antiga fortaleza do Castelo de Edo e os jardins ao redor, gratis e abertos quase sempre. Fundacoes de pedra, bosques de ameixeira, um gramado largo que parece impossivel no centro de Toquio.",
  fr: "L'ancien donjon du chateau d'Edo et ses jardins, gratuits et ouverts presque tous les jours. Fondations de pierre, vergers de pruniers, une vaste pelouse qui semble impossible en plein centre de Tokyo."
},
'roar-coffee-ginza-tokyo': {
  it: "Un counter minuscolo a Ginza dove il barista si occupa dell'espresso in prima persona. Resta in piedi alla finestra con due cortado e guarda passare i salaryman.",
  pt: "Um balcao minusculo em Ginza onde o barista cuida do espresso pessoalmente. Fique em pe na janela com dois cortados e veja os salarymen passando.",
  fr: "Un minuscule comptoir de Ginza ou le barista tire l'espresso personnellement. Restez debout a la fenetre avec deux cortados et regardez passer les salarymen."
},
'harenochi-katsu-tokyo': {
  it: "Una versione moderna del set lunch tonkatsu: maiale di razza heritage, riso che puoi farti riempire, cavolo con due dressing della casa. Sala luminosa, niente fronzoli.",
  pt: "Uma releitura moderna do set lunch tonkatsu: porco de raca patrimonial, arroz que pode ser repetido, repolho com dois molhos da casa. Sala clara, sem firula.",
  fr: "Une relecture moderne du tonkatsu en formule: porc de race patrimoniale, riz a volonte, chou avec deux assaisonnements maison. Salle lumineuse, sans chichi."
},
'karin-tokyo': {
  it: "Alta cucina cantonese all'Hotel New Otani con vista su un giardino privato. Anatra dalla pelle croccante, carrelli attenti, il tipo di cena che ricordi la mattina dopo.",
  pt: "Alta cozinha cantonesa no Hotel New Otani com vista para um jardim privativo. Pato de pele crocante, carrinhos atentos, o tipo de jantar que voce lembra na manha seguinte.",
  fr: "Haute cuisine cantonaise a l'Hotel New Otani avec vue sur un jardin prive. Canard a peau croustillante, chariots attentifs, le genre de diner dont on se souvient le lendemain matin."
},
'hie-shrine-tokyo': {
  it: "Sali lungo il lungo corridoio di torii rossi che s'arrampica sulla collina di Akasaka, poi fermati nel cortile silenzioso in cima. Gratis, fotogenico, stranamente commovente.",
  pt: "Suba o longo corredor de torii vermelhos que sobe a encosta de Akasaka e pare no patio silencioso no topo. Gratis, fotogenico, estranhamente emocionante.",
  fr: "Montez le long corridor de torii rouges qui grimpe la colline d'Akasaka, puis arretez-vous dans la cour immobile au sommet. Gratuit, photogenique, etrangement emouvant."
},
'teamlab-planets-tokyo': {
  it: "Cammina scalzo nell'acqua tiepida, attraverso giardini specchiati e stanze di luce fluttuante. Prenota lo slot del mattino, lascia i calzini all'ingresso, lasciati andare.",
  pt: "Caminhe descalco em agua morna, jardins espelhados e salas de luz flutuante. Marque o slot da manha, deixe as meias na entrada, se entregue.",
  fr: "Marchez pieds nus dans l'eau tiede, des jardins en miroirs, des salles de lumiere flottante. Reservez le creneau du matin, laissez vos chaussettes a l'entree, laissez-vous aller."
},
'sushi-oshima-tokyo': {
  it: "Un counter sushi in stile Kanazawa nel centro di Shinjuku. Orata, gamberi dolci, un vero omakase senza il prezzo dell'omakase.",
  pt: "Um balcao de sushi estilo Kanazawa no centro de Shinjuku. Pargo, camarao doce, um omakase de verdade sem o preco de omakase.",
  fr: "Un comptoir a sushi de style Kanazawa en plein Shinjuku. Daurade, crevettes douces, un vrai omakase sans le prix de l'omakase."
},
'tajimaya-coffee-tokyo': {
  it: "Un kissaten di Shinjuku del 1969 che non e cambiato. Legno scuro, fumo, un caffe a sifone che prende il suo tempo, e una fetta di cheesecake al tavolo d'angolo.",
  pt: "Um kissaten de Shinjuku de 1969 que nao mudou. Madeira escura, fumaca, um cafe de sifao que leva o seu tempo, e uma fatia de cheesecake na mesa de canto.",
  fr: "Un kissaten de Shinjuku de 1969 qui n'a pas change. Bois sombre, fumee, un cafe siphon qui prend son temps, et une part de cheesecake a la table du coin."
},
'daimaru-tokyo-tokyo': {
  it: "La depachika sotto la Tokyo Station. Salta tra i banchi dei bento, scegli il packaging piu bello che trovi, mangiate davanti alla facciata in mattoni.",
  pt: "A depachika embaixo da Estacao de Toquio. Pule entre os balcoes de bento, escolha a embalagem mais bonita que achar, e coma de frente para a fachada de tijolos.",
  fr: "La depachika sous la gare de Tokyo. Sautez d'un comptoir a bento a l'autre, choisissez l'emballage le plus joli, mangez devant la facade de briques."
},
'nakamise-dori-tokyo': {
  it: "Il viale di lanterne che porta al Senso-ji, fitto di mochi grigliati, ningyo-yaki e senbei. Percorrilo piano, condividete tutto cio che comprate.",
  pt: "A alameda de lanternas que leva ao Senso-ji, repleta de mochi grelhado, ningyo-yaki e senbei. Caminhem devagar, dividam tudo o que comprarem.",
  fr: "L'allee bordee de lanternes qui mene au Senso-ji, pleine de mochi grilles, ningyo-yaki et senbei. Marchez doucement, partagez tout ce que vous achetez."
},
'savoy-tomato-cheese-tokyo': {
  it: "Il primo vero counter di pizza napoletana di Tokyo, ancora con due sole pizze: marinara e margherita. State al banco, dividetevele entrambe.",
  pt: "O primeiro verdadeiro balcao de pizza napolitana de Toquio, ainda com duas pizzas: marinara e margherita. Fiquem no balcao, dividam as duas.",
  fr: "Le premier vrai comptoir a pizza napolitaine de Tokyo, toujours avec deux pizzas: marinara et margherita. Restez au bar, partagez les deux."
},
'coffee-punkto-tokyo': {
  it: "Un counter third-wave minimale che prende sul serio il pour-over senza farne una scena. Due sgabelli, un grande filtro, un si facile per una mattina tranquilla.",
  pt: "Um balcao third-wave minimalista que leva o pour-over a serio sem fazer disso um espetaculo. Dois bancos, um filtro otimo, um sim facil para uma manha tranquila.",
  fr: "Un comptoir third-wave minimaliste qui prend le pour-over au serieux sans en faire des tonnes. Deux tabourets, un excellent filtre, un oui facile pour un matin tranquille."
},
'shibuya-crossing-tokyo': {
  it: "L'incrocio piu famoso del mondo. Attraversalo una volta a livello strada per sentirlo, una volta dall'alto (Starbucks o Mag's Park) per la foto.",
  pt: "O cruzamento mais famoso do mundo. Atravesse uma vez no nivel da rua para sentir, uma vez de cima (Starbucks ou Mag's Park) para a foto.",
  fr: "Le carrefour le plus celebre du monde. Traversez-le une fois au niveau de la rue pour la sensation, une fois d'en haut (Starbucks ou Mag's Park) pour la photo."
},
'meiji-jingu-tokyo': {
  it: "Un bosco di settanta ettari nel centro di Tokyo avvolto attorno al Santuario Meiji. Entra sotto il torii di legno, lascia indietro il rumore della citta, e parla poco.",
  pt: "Uma floresta de 70 hectares no centro de Toquio que envolve o Santuario Meiji. Entre sob o torii de madeira, deixe o som da cidade para tras, e falem pouco.",
  fr: "Une foret de 70 hectares en plein Tokyo enroulee autour du sanctuaire Meiji. Entrez sous le torii de bois, laissez le bruit de la ville derriere, et parlez peu."
},
'koffee-mameya-tokyo': {
  it: "Un atelier del caffe ad Aoyama senza tavoli e senza menu. Un barista in camice bianco ti chiede cosa ti piace, poi sceglie il chicco. Silenziosamente la tazza migliore della citta.",
  pt: "Um atelier de cafe em Aoyama sem mesas e sem menu. Um barista de jaleco branco pergunta o que voce gosta, depois escolhe o grao. Silenciosamente a melhor xicara da cidade.",
  fr: "Un atelier de cafe a Aoyama sans tables ni menu. Un barista en blouse blanche vous demande ce que vous aimez, puis choisit le grain. La meilleure tasse de la ville, en silence."
},
'gonpachi-nishi-azabu-tokyo': {
  it: "L'izakaya di Kill Bill, su tre teatrali piani di legno. Ordina la soba, gli spiedini alla griglia, e un sake di troppo.",
  pt: "A izakaya de Kill Bill, em tres andares teatrais de madeira. Peca a soba, os espetinhos grelhados, e um sake a mais.",
  fr: "L'izakaya de Kill Bill, sur trois etages en bois theatraux. Commandez les soba, les brochettes grillees, et un sake de trop."
},
'akihabara-tokyo': {
  it: "Otto isolati di sale giochi, megastore di anime, scantinati con videogame retro e piccoli negozi di utensili. Perdetevi due ore insieme e non provate a pianificarlo.",
  pt: "Oito quadras de fliperamas, megalojas de anime, lojas de jogos retro no porao e lojinhas de ferramentas. Percam duas horas juntos e nao tentem planejar.",
  fr: "Huit pates de maisons de salles d'arcade, megastores d'anime, sous-sols de jeux retro et minuscules boutiques d'outillage. Perdez deux heures ensemble sans rien planifier."
},
'tokyo-national-museum-tokyo': {
  it: "Il museo piu antico e piu grande del paese, in un angolo verde di Ueno Park. Salta le lobby, vai dritto all'Honkan: katane, ceramiche, rotoli.",
  pt: "O museu mais antigo e maior do pais, num canto arborizado do Parque Ueno. Pule os saguoes, va direto para o Honkan: katanas, ceramicas, pergaminhos.",
  fr: "Le plus ancien et le plus grand musee du pays, dans un coin verdoyant du parc d'Ueno. Sautez les halls, allez droit au Honkan: katanas, ceramiques, rouleaux."
},
'charcoal-roast-coffee-rin-tokyo': {
  it: "Un kissaten che tosta i chicchi sulla brace di binchotan. Il risultato e affumicato, profondo, inconfondibile. Ordina la miscela, liscia.",
  pt: "Um kissaten que torra os graos sobre carvao binchotan. O resultado e defumado, profundo, inconfundivel. Peca o blend, puro.",
  fr: "Un kissaten qui torrefie ses grains sur du charbon binchotan. Le resultat est fume, profond, inimitable. Commandez le blend, nature."
},
'warp-shinjuku-tokyo': {
  it: "Un bar immersivo di Shinjuku che spinge sulla sci-fi totale. Ordina qualcosa di blu, siediti sul lato astronave della sala, scatta esattamente una foto e basta.",
  pt: "Um bar imersivo de Shinjuku que vai full sci-fi. Peca algo azul, sente no lado nave da sala, tire exatamente uma foto e pare.",
  fr: "Un bar immersif de Shinjuku qui pousse la sci-fi a fond. Commandez quelque chose de bleu, asseyez-vous du cote vaisseau, prenez exactement une photo et arretez."
},
'hacienda-del-cielo-tokyo': {
  it: "Una terrazza a Daikanyama con cactus, lanterne basse e un lungo menu messicano. Prenota il terrazzo, ordina una paloma, resta per tutto il tramonto.",
  pt: "Um rooftop em Daikanyama com cactos, lanternas baixas e um cardapio mexicano longo. Reserve o terraco, peca uma paloma, fique ate o por do sol.",
  fr: "Un rooftop a Daikanyama avec cactus, lanternes basses et une longue carte mexicaine. Reservez la terrasse, commandez une paloma, restez jusqu'au coucher du soleil."
},
'afuri-shinjuku-tokyo': {
  it: "Il ramen yuzu-shio che ha convertito mezza citta. Brodo chiaro, brillante di agrumi, e chashu fiammato al momento. Compra il biglietto, fai rumore con la zuppa, vai.",
  pt: "O ramen yuzu-shio que converteu metade da cidade. Caldo claro, citrico brilhante, e chashu macaricado na hora. Compre o ticket, sorva o caldo, va embora.",
  fr: "Le ramen yuzu-shio qui a converti la moitie de la ville. Bouillon clair, citronne, chashu chalumeaute a la commande. Achetez le ticket, slurpez le bol, partez."
},
'aoyama-flower-market-tea-house-tokyo': {
  it: "Una sala da te di vetro nata sul retro di un fiorista di Aoyama. Siediti dentro la serra con un te alle rose e una crostata di frutta, circondato da tutto cio che e in fiore.",
  pt: "Uma casa de cha de vidro nascida nos fundos de uma floricultura de Aoyama. Sente dentro da estufa com cha de rosas e uma torta de frutas, rodeado por tudo o que esta florindo.",
  fr: "Une maison de the en verre nee a l'arriere d'un fleuriste d'Aoyama. Asseyez-vous dans la serre avec un the a la rose et une tarte aux fruits, entoures de tout ce qui fleurit."
},
'tonkatsu-maisen-tokyo': {
  it: "Un vecchio bagno pubblico trasformato nel set lunch tonkatsu piu amato di Tokyo. Ordina il kurobuta, prendi il riso bis, non saltare il cavolo.",
  pt: "Uma antiga casa de banho transformada no set lunch tonkatsu mais querido de Toquio. Peca o kurobuta, aceite o repete de arroz, nao pule o repolho.",
  fr: "Un ancien bain public converti en formule tonkatsu la plus aimee de Tokyo. Commandez le kurobuta, prenez le riz en plus, ne sautez pas le chou."
},
'shinjuku-golden-gai-tokyo': {
  it: "Sei vicoli minuscoli, duecento bar, sei posti ciascuno. Scegli quello con un'insegna che non capisci ed entra. Ripeti due volte.",
  pt: "Seis becos minusculos, duzentos bares, seis lugares cada. Escolha o que tem uma placa que voce nao entende e entre. Repita duas vezes.",
  fr: "Six ruelles minuscules, deux cents bars, six places chacun. Choisissez celui dont l'enseigne vous echappe et entrez. Recommencez deux fois."
},
'nezu-museum-tokyo': {
  it: "Un edificio di Kengo Kuma che nasconde una collezione privata di arte giapponese ed est-asiatica, piu un giardino in collina sul retro. Chiudi con un matcha nel cafe del giardino.",
  pt: "Um predio de Kengo Kuma que esconde uma colecao privada de arte japonesa e do leste asiatico, mais um jardim em colina nos fundos. Termine com matcha no cafe do jardim.",
  fr: "Un batiment de Kengo Kuma qui cache une collection privee d'art japonais et est-asiatique, plus un jardin en pente derriere. Finissez avec un matcha au cafe du jardin."
},
'shinobazu-pond-tokyo': {
  it: "Noleggia una barca a forma di cigno, pagaia tra i loti, fai il giro del piccolo santuario sull'isola in mezzo. D'estate lo stagno intero diventa una cupola di foglie.",
  pt: "Alugue um pedalinho cisne, reme entre os lotus, visite o pequeno santuario na ilha do meio. No verao, o lago todo vira um teto de folhas.",
  fr: "Louez un pedalo cygne, pagayez entre les lotus, visitez le petit sanctuaire de l'ile au milieu. L'ete, l'etang entier se transforme en canopee de feuilles."
},
'code-name-mixology-tokyo': {
  it: "Un serio cocktail bar di Akasaka dove la carta si legge come un menu di cucina. Di' al bartender un sapore che ami, poi guardalo costruirlo.",
  pt: "Um cocktail bar serio em Akasaka onde o menu se le como um menu de cozinha. Diga ao bartender um sabor que voce ama e veja ele construindo.",
  fr: "Un vrai bar a cocktails d'Akasaka dont la carte se lit comme une carte de cuisine. Donnez au bartender une saveur que vous aimez, puis regardez-le la construire."
},
'temma-curry-tokyo': {
  it: "Un piccolo counter di spice curry ad Aoyama con un piatto che cambia ogni giorno. Ordina il keema d'agnello con il set di achar; il posto vicino alla finestra e il migliore.",
  pt: "Um pequeno balcao de spice curry em Aoyama com prato rotativo todos os dias. Peca o keema de cordeiro com o conjunto de achar; o lugar perto da janela e o melhor.",
  fr: "Un petit comptoir de spice curry d'Aoyama avec un plat qui change chaque jour. Commandez le keema d'agneau avec le set d'achar; la place a la fenetre est la meilleure."
},
'harajuku-owls-forest-tokyo': {
  it: "Un animal cafe di Harajuku costruito attorno a un piccolo gruppo di gufi e qualche gatto. Tocca solo con il dorso del dito; dai una mancia al guardiano; non restare a lungo.",
  pt: "Um animal cafe em Harajuku construido em torno de um pequeno bando de corujas e alguns gatos. Toque apenas com as costas do dedo; deixe gorjeta para o tratador; nao fique muito tempo.",
  fr: "Un animal cafe d'Harajuku construit autour d'un petit groupe de hiboux et quelques chats. Touchez uniquement avec le dos du doigt; donnez un pourboire au gardien; ne restez pas longtemps."
},
'ueno-park-tokyo': {
  it: "Il parco piu grande di Tokyo, regalato alla citta dall'imperatore. Ciliegi in primavera, musei ai bordi, banchetti di cibo lungo i sentieri, uno zoo al centro.",
  pt: "O maior parque de Toquio, presenteado a cidade pelo imperador. Cerejeiras na primavera, museus nas bordas, carrinhos de comida nas trilhas, um zoo no meio.",
  fr: "Le plus grand parc de Tokyo, offert a la ville par l'empereur. Cerisiers au printemps, musees en peripherie, food carts sur les allees, un zoo au milieu."
},
'savoy-azabujuban-tokyo': {
  it: "Il counter originale della Savoy ad Azabujuban. Dodici posti, un forno a legna, due pizze. Prenota per telefono o mangia al banco.",
  pt: "O balcao original da Savoy em Azabujuban. Doze lugares, um forno a lenha, duas pizzas. Reserve por telefone ou coma no balcao.",
  fr: "Le comptoir original de Savoy a Azabujuban. Douze places, un four a bois, deux pizzas. Reservez par telephone ou mangez au bar."
},
'fioria-roppongi-tokyo': {
  it: "Una terrazza italiana in serra nascosta a Roppongi Hills, piena di buganvillee e candele. Prenota il tavolo all'aperto e ordina la burrata.",
  pt: "Um terraco italiano em estufa de vidro escondido no Roppongi Hills, cheio de buganvilias e velas. Reserve a mesa de fora e peca a burrata.",
  fr: "Une terrasse italienne sous serre cachee dans Roppongi Hills, pleine de bougainvilliers et de bougies. Reservez la table dehors et commandez la burrata."
},
'sakurai-tea-tokyo': {
  it: "Una sala da te moderna nello Spiral Building dove Sakurai-san serve un omakase di te mono-origine. Silenzioso, in sequenza, vale assolutamente il tempo.",
  pt: "Uma casa de cha moderna no Spiral Building onde Sakurai-san serve um omakase de chas de origem unica. Silencioso, sequencial, vale totalmente o tempo.",
  fr: "Une maison de the moderne dans le Spiral Building ou Sakurai-san sert un omakase de thes mono-origine. Silencieux, sequentiel, ca vaut totalement le coup."
},
'cedros-tokyo': {
  it: "Una cucina nascosta con un breve menu di stagione e una carta dei vini curata dalla chef stessa. Sala piccola, luce calda, ritorno facile.",
  pt: "Uma cozinha escondida com um menu sazonal curto e uma carta de vinhos curada pela propria chef. Sala pequena, luz quente, segunda visita facil.",
  fr: "Une cuisine cachee avec une courte carte de saison et une carte des vins choisie par la chef elle-meme. Petite salle, lumiere chaude, deuxieme visite facile."
},
'saza-coffee-tokyo': {
  it: "Un torrefattore di Ibaraki con un'ampia carta di blend e un serio bar a sifone. La sede di Marunouchi e la piu calma; ordina il Charles Special.",
  pt: "Um torrefador de Ibaraki com uma carta longa de blends e um bar de sifao serio. A unidade de Marunouchi e a mais calma; peca o Charles Special.",
  fr: "Un torrefacteur d'Ibaraki avec une longue carte de blends et un vrai bar a siphon. La succursale de Marunouchi est la plus calme; commandez le Charles Special."
},
'tableaux-tokyo': {
  it: "Divani in velluto, applique soffuse, un menu di ispirazione italiana che dalla fine degli anni '90 e silenziosamente eccellente. Il tipo di posto in cui porti qualcuno per tenerlo.",
  pt: "Banquetas de veludo, arandelas suaves, um menu de pendor italiano que vem sendo silenciosamente excelente desde o final dos anos 90. O tipo de lugar onde voce leva alguem pra ficar.",
  fr: "Banquettes en velours, appliques tamisees, une carte d'inspiration italienne discretement excellente depuis la fin des annees 90. Le genre d'endroit ou on emmene quelqu'un pour le garder."
},
'arisugawa-park-tokyo': {
  it: "Un piccolo parco in collina a Hiroo con un ruscello, un ponte in pietra e una biblioteca pubblica in cima. Porta un caffe da Common; resta un'ora.",
  pt: "Um pequeno parque em colina em Hiroo com um riacho, uma ponte de pedra e uma biblioteca publica no topo. Leve um cafe do Common; fique uma hora.",
  fr: "Un petit parc en colline a Hiroo avec un ruisseau, un pont de pierre et une bibliotheque publique au sommet. Apportez un cafe a emporter de chez Common; restez une heure."
},
'imperial-palace-tokyo': {
  it: "La residenza dell'Imperatore sul sito del Castello di Edo. Fai il giro del fossato esterno a piedi o in bici; la luce del tramonto sul ponte Nijubashi e la foto.",
  pt: "A residencia do Imperador no local do Castelo de Edo. De a volta no fosso externo a pe ou de bike; a luz do por do sol sobre a ponte Nijubashi e a foto.",
  fr: "La residence de l'Empereur sur le site du chateau d'Edo. Faites le tour des douves exterieures a pied ou en velo; la lumiere du couchant sur le pont Nijubashi, c'est la photo."
},
'jazz-bar-samurai-tokyo': {
  it: "Un jazz kissa di Shinjuku pieno da parete a parete di gatti maneki-neko e con un impianto audio che si prende sul serio. Ordina un whisky e taci.",
  pt: "Um jazz kissa de Shinjuku tomado de parede a parede por gatos maneki-neko e com um som que se leva a serio. Peca um whisky e fique calado.",
  fr: "Un jazz kissa de Shinjuku rempli mur a mur de chats maneki-neko et avec une chaine qui se prend au serieux. Commandez un whisky et taisez-vous."
},
'harajuku-gyoza-lou-tokyo': {
  it: "Menu di due voci: gyoza yaki o sui, da sei per ordine. Birra e cetriolo a parte. Economico, veloce, la mossa giusta dopo una lunga giornata ad Harajuku.",
  pt: "Cardapio com dois itens: gyoza yaki ou sui, no pedido de seis. Cerveja e pepino a parte. Barato, rapido, a jogada certa depois de um dia longo em Harajuku.",
  fr: "Carte a deux items: gyoza yaki ou sui, par commande de six. Biere et concombre a cote. Bon marche, rapide, le bon coup apres une longue journee a Harajuku."
},
'mugi-to-olive-tokyo': {
  it: "Un counter ramen Bib Gourmand a Ginza famoso per il brodo di vongole e olio d'oliva. Ordina il W-soba e arriva prima di mezzogiorno o alle 21.",
  pt: "Um balcao de ramen Bib Gourmand em Ginza famoso pelo caldo de vongole com azeite. Peca o W-soba e chegue antes do meio-dia ou as 21h.",
  fr: "Un comptoir a ramen Bib Gourmand a Ginza connu pour son bouillon palourdes-huile d'olive. Commandez le W-soba et arrivez avant midi ou a 21h."
},
'the-national-art-center-tokyo': {
  it: "L'onda di vetro di Kisho Kurokawa a Roppongi. Niente collezione permanente, solo mostre ambiziose a rotazione. Chiudi al caffe sul cono sospeso.",
  pt: "A onda de vidro de Kisho Kurokawa em Roppongi. Sem colecao permanente, so mostras ambiciosas em rotacao. Termine no cafe sobre o cone suspenso.",
  fr: "La vague de verre de Kisho Kurokawa a Roppongi. Pas de collection permanente, seulement des expositions ambitieuses tournantes. Finissez au cafe sur le cone suspendu."
},
'cafe-kitsune-tokyo': {
  it: "L'originale Aoyama della catena Kitsune, dietro una grata di legno in una via residenziale tranquilla. Madeleine a forma di volpe, latte, venti minuti sulla panchina davanti.",
  pt: "O original em Aoyama da rede Kitsune, atras de uma trelica de madeira numa ruazinha residencial calma. Madeleine de raposa, latte, vinte minutos no banco em frente.",
  fr: "L'original a Aoyama de la chaine Kitsune, derriere un treillis en bois dans une petite rue residentielle calme. Madeleine renard, latte, vingt minutes sur le banc devant."
},
'uogashi-nihon-ichi-tokyo': {
  it: "Una catena di sushi in piedi dove lo chef ti passa ogni pezzo direttamente sopra il banco. Veloce, economico per la qualita, una vera stretta di mano di Tokyo.",
  pt: "Uma rede de sushi em pe onde o chef entrega cada pedaco direto na sua mao por cima do balcao. Rapido, barato pelo nivel, um aperto de mao de Toquio de verdade.",
  fr: "Une chaine de bars a sushi debout ou le chef vous tend chaque piece directement par-dessus le comptoir. Rapide, pas cher pour la qualite, une vraie poignee de main de Tokyo."
},
'miyota-tokyo': {
  it: "Un piccolissimo counter italiano dove tutto viene impiattato davanti a te. La portata di pasta e quella che vale l'attesa.",
  pt: "Um balcao italiano minusculo onde tudo e empratado na sua frente. O prato de massa e o que vale a espera.",
  fr: "Un tout petit comptoir italien ou tout est dresse devant vous. Le plat de pates est celui qu'il faut attendre."
},
'yoyogi-park-tokyo': {
  it: "La cosa piu simile che Tokyo abbia a un parco piano, gratuito, aperto tutto il giorno. Picnic, aree per cani, cerchi di tamburi, fioritura dei ciliegi in primavera. Porta una coperta e un pranzo da konbini.",
  pt: "O mais perto que Toquio tem de um parque plano, gratis e aberto o dia todo. Piqueniques, areas para caes, rodas de tambor, sakura na primavera. Leve uma manta e um almoco de konbini.",
  fr: "Ce qui ressemble le plus a Tokyo a un parc plat, gratuit et ouvert toute la journee. Piqueniques, espaces chiens, cercles de tambours, sakura au printemps. Apportez une couverture et un dejeuner konbini."
},
};

const spots = JSON.parse(fs.readFileSync(SPOTS_PATH, 'utf8'));
let updated = 0;
const missing = [];

for (const s of spots) {
    if (s.city !== 'tokyo') continue;
    const tr = T[s.id];
    if (!tr) { missing.push(s.id); continue; }
    if (typeof s.description !== 'object') s.description = { en: s.description || '', it: '', pt: '', fr: '' };
    s.description.it = tr.it;
    s.description.pt = tr.pt;
    s.description.fr = tr.fr;
    updated++;
}

fs.writeFileSync(SPOTS_PATH, JSON.stringify(spots, null, 2) + '\n');
console.log(`Updated ${updated} Tokyo spots`);
if (missing.length) console.log(`Missing translations for: ${missing.join(', ')}`);
