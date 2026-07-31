#!/usr/bin/env node
// Add French translations for all 65 Rio spots (EN/IT/PT already exist).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPOTS_PATH = path.join(__dirname, '..', 'data', 'spots.json');

const FR = {
'confeitaria-colombo': "Un reve belle epoque depuis 1894. Vitraux belges, murs en miroir, comptoirs de marbre charges de petits gateaux. Prenez un cafe debout au bar comme les Cariocas.",
'jobi': "Le salon de Leblon depuis 1956. Chopp glace, empadinhas parfaites, des habitues qui viennent depuis cinquante ans. Le bar du quartier original; on ne fait pas mieux.",
'parque-lage': "Un manoir du XIXe siecle enveloppe de foret atlantique, le Corcovado se dressant juste derriere. Cafe dans la cour interieure, puis sentier de la cascade.",
'jardim-botanico-rio': "Un palais de 140 hectares de palmiers et de foret tropicale dans la ville, plante par Dom Joao VI en 1808. Allee des palmiers imperiaux, serre aux orchidees, ouistitis.",
'cascatinha-taunay': "Une cascade de 30 metres au coeur de la foret de Tijuca, a quinze minutes en voiture d'Ipanema mais a un monde de distance. Sentier court, baignade autorisee, ambiance preservee.",
'museu-arte-moderna-rio': "Le chef-d'oeuvre en beton d'Affonso Reidy (annees 50) flottant sur la baie, jardins de Burle Marx entre vous et la mer. Toujours une exposition qui en vaut la peine.",
'pato-com-laranja': "Un minuscule bistrot de Santa Teresa avec une poignee de tables et une carte construite autour du canard cuit lentement. Reservez une semaine a l'avance.",
'museu-sacro-franciscano': "Le couvent franciscain du XVIIe siecle a cote de l'eglise doree de Santo Antonio. Boiseries dorees, azulejos portugais bleus, dix minutes qui vous calment l'esprit.",
'ccbb-rio': "Une ancienne banque devenue palais culturel: plafond en rotonde, sols en marbre, une programmation qui va de Kubrick a Kandinsky. Entree gratuite, salon de the dans la cour.",
'mac-niteroi': "La soucoupe volante d'Oscar Niemeyer perchee au-dessus de la baie de Guanabara, avec Rio etale sur l'eau de l'autre cote. Prenez le ferry, marchez jusqu'au musee, repartez en taxi.",
'mar-rio': "Deux batiments sous un toit en forme de vague a la Praca Maua. Les expositions parlent toujours de Rio: la favela, la samba, l'esclavage, l'architecture. Soyez prets a apprendre.",
'museu-do-amanha': "Le squelette blanc de Santiago Calatrava avance dans la baie, un musee de la science deguise en cathedrale. Mieux a la tombee de la nuit quand les bassins reflexifs s'allument.",
'lilia-rio': "Lucio Vieira fait un menu degustation en constante evolution dans une salle de quinze couverts en centre-ville. Cocottes en terre, sauces longuement reduites, vinaigres maison.",
'prainha-beach': "Un croissant d'eau verte entoure de foret atlantique, a 40 minutes a l'ouest d'Ipanema et quelques pas en avant en bonheur. Vagues douces, voitures rares, peu de constructions.",
'la-bicyclette': "Une boulangerie francaise cachee dans le Jardim Botanico. Croissants, tartes, cafe corse, et une terrasse dans les arbres ou plus rien ne presse.",
'galeria-movimento': "Galerie de Leblon centree sur peintres et sculpteurs bresiliens contemporains, beaucoup en milieu de carriere et au bord de leur grand moment. Toujours quelqu'un sur place pour parler.",
'silvia-cintra-box-4': "L'un des programmes d'art contemporain les plus serieux de Rio, dans un white-box de Gavea. Entre deux expositions, demandez a voir la reserve; ils le font volontiers.",
'casa-horto': "Une maison de Horto transformee en restaurant a cuisine ouverte, jardin-cour interieure, et carte d'ingredients bresiliens manipules avec retenue. Reservez la table du coin.",
'danielian-galeria': "Une galerie de Gavea avec un long banc au milieu et une selection de peintres dont vous voudrez memoriser les noms. Pas pretentieux, juste bon.",
'ipanema-art-gallery': "Un petit espace d'Ipanema a deux rues de la plage, expositions tournantes de jeunes artistes cariocas. Vingt minutes en entrant, une demi-heure de plus si quelque chose accroche.",
'jardins-museu-republica': "Les jardins autour de l'ancien palais presidentiel: palmiers royaux, un lac, les agoutis qui vivent dans les buissons, et plus de silence que n'importe ou autour de Catete.",
'museu-da-republica': "Le palais neoclassique ou Getulio Vargas s'est suicide en 1954, aujourd'hui un musee d'histoire bresilienne du XXe siecle. Lourd, important, jamais bonde.",
'quartinho-bar': "Une douzaine de tabourets, un comptoir en marbre, un bartender qui ecoute vraiment. Vin nature, legumes confits, et un sentiment de soiree-decouverte chaque fois.",
'ruda-restaurante': "Cerrado bresilien et terres du cacao dans l'assiette, avec une cave a vin chargee de petits producteurs sud-americains. Asseyez-vous au comptoir, faites-les choisir le menu.",
'koral-restaurante': "Le restaurant de la piscine sur le toit de l'Emiliano, plage de Copacabana en bas, Sugarloaf a droite. Reservez le coucher de soleil, partagez la ceviche, faites-le durer.",
'posi-terrazza': "Un rooftop de Leblon avec une pizza etonnamment bonne, un negroni etonnamment grand, et la montagne juste la. Ne reservez pas, on entre par l'ascenseur a l'arriere.",
'boa-praca': "Boulangerie-cafe de Botafogo sur une place ombragee, tables debordant a l'exterieur. Brunch serieux, encore plus serieux a 17h. Allez-y le dimanche pour les bandes de chiens.",
'boteco-belmonte': "Une chaine de botequim carioca qui refuse de ressembler a une chaine. Empadas, chopp glace, snacks de bar dans le bon ordre. Prenez la table de coin et restez.",
'nosso-bar': "Un petit bar de Leblon avec une cuisine ouverte le long d'un mur et dix places le long de l'autre. La chef cuisine ce qu'elle a trouve ce matin-la. Faites-lui confiance.",
'slow-bakery': "Pain au levain, brioches a la cardamome, le genre de queue de boulangerie dans laquelle on est heureux d'attendre. Botafogo, terrasse a l'arriere, allez-y avant 11h.",
'nara-roesler': "Galerie phare d'Ipanema sur la scene contemporaine bresilienne. Si Tomie Ohtake ou Antonio Dias est expose, descendez de tout ce que vous etes en train de faire.",
'maska-rio': "Cuisine de Mediterranee orientale a Botafogo: pains plats grilles, labneh, agneau vieilli sur charbon. Demandez la formule degustation; laissez-les vous emporter.",
'ariz-espumante': "Un bar exclusivement bulles a Leblon, une quarantaine d'etiquettes au verre, petits plats pour suivre. Ils vous donneront a gouter avant que vous choisissiez.",
'henriqueta': "Un restaurant de Gavea installe dans une maison transformee, eclairage a la bougie, courte carte de plats bresiliens lents. Reservez sept jours a l'avance pour le vendredi soir.",
'san-rio': "Omakase nippo-bresilien dans un sous-sol de Leblon: huit places, deux services par soir, le chef coupe le poisson pendant que vous regardez. Reservez tot.",
'restaurante-emile': "Un bistrot francais de Leblon avec nappes blanches, steak frites qu'on retient, et un maitre d'hotel qui se souvient de votre nom au deuxieme passage.",
'elena-horto': "Un restaurant de Horto blotti contre la foret, avec une salle en plein air qui semble empruntee a la jungle. Brunch a la jacaree dans les arbres; verifiez deux fois la reservation.",
'vian-cocktail-bar': "Un bar a cocktails de Leblon en lumiere tamisee, carte construite comme un recueil, chaque drink avec un titre et une histoire. Musique basse, jamais bondee, parfait pour parler.",
'dengo-chocolates': "Chocolat bresilien d'origine unique, fait avec du cacao cultive directement avec de petits producteurs de Bahia. La boutique d'Ipanema fait des affogato; commandez-en deux.",
'anita-schwartz': "Une galerie de Gavea sur trois etages dans un batiment moderniste en beton. Artistes bresiliens en milieu ou fin de carriere; toujours quelque chose qui en vaut le voyage.",
'gajos-douro': "Une salle a manger portugaise de Copacabana qui n'a pas change en quarante ans et n'en a aucune intention. Bacalhau a bras, vinho verde glace, et une ardoise du jour ecrite a la main.",
'ocya-ilha': "Un restaurant sur une ile de la baie de Guanabara, accessible seulement par bateau, dejeuner servi les pieds dans le sable. Reservez le ferry, allez tot, restez la journee.",
'rubaiyat-rio': "Steakhouse tentaculaire a Leblon avec une cour-jardin, faux-filet du propre ranch de la famille, carte des vins qui se lit comme un atlas sud-americain. Reservez le coin terrasse.",
'real-gabinete': "Une salle de lecture portugaise du XIXe siecle au Centro: rayonnages en jacaranda, verriere en vitrail, peut-etre la plus belle bibliotheque dans laquelle vous entrerez cette annee.",
'emporio-jardim': "Cafe de Botafogo aux hautes fenetres, etageres d'epicerie a vendre, et un cafe sur lequel on s'attarde. Bonnes patisseries, salades plus longues a manger qu'elles n'ont l'air.",
'morro-da-urca': "Le premier des deux telepheriques du Sugarloaf. Moitie de l'altitude, moitie de la file, plus qu'assez de vue. Bar au sommet; restez pour le coucher du soleil.",
'copacabana-fort': "Un fort de 1908 a l'extremite est de la plage de Copacabana, avec une terrasse-cafe qui offre la plus belle vue de l'arc d'Ipanema. Allez-y avant midi, repartez par le sable.",
'maria-e-o-boi': "Cuisine tournee braseros a Botafogo: feu ouvert, boeuf vieilli, vins bresiliens que vous ne verrez nulle part ailleurs. Le boucher est sur place; demandez ce qu'il a coupe le matin.",
'marius-degustare': "Un rodizio a Copacabana mais en version fruits de mer: lagostim, poulpe, huitres passent sur de petites brochettes. Ouvre fort, en gris dans la salle a manger; arrivez affame.",
'malta-beef-club': "Une steakhouse au sous-sol d'Ipanema style speakeasy. Boeuf maturation longue, courte carte des vins, le genre d'endroit ou l'on commande un Negroni avant d'ouvrir le menu.",
'botafogo-beach': "La plage en croissant ou personne ne se baigne mais ou tout le monde se promene: Sugarloaf droit devant, bateaux a vous gauche, joggeurs et chiens partout sur le sable.",
'arp-bar': "Un bar a cocktails d'inspiration moderniste a Ipanema, baptise d'apres le sculpteur, construit autour de drinks qui ressemblent a des oeuvres. Reservez le mardi pour la salle calme.",
'sugarloaf-mountain': "Le telepherique en deux etapes jusqu'au monolithe de granit a l'entree de la baie de Guanabara. Montez au coucher du soleil pour la vue, restez pour la transition vers la nuit.",
'mocellin-steakhouse': "Steakhouse a l'ancienne a Barra avec une salle lambrissee de bois et un defile de morceaux que vous n'avez jamais vus. Demandez au serveur, dites-leur que vous restez longtemps.",
'assador': "Une churrascaria de Flamengo avec salle a manger panoramique tournante, morceaux apportes a la table jusqu'a ce que vous fassiez stop. Reservez un coucher de soleil sur la baie.",
'trilha-morro-urca': "Le sentier en foret jusqu'au premier sommet de Sugarloaf: quarante minutes de jungle tropicale, ouistitis, et une vue gratuite au bout. Bonnes chaussures, beaucoup d'eau.",
'xian-rio': "Un rooftop pan-asiatique d'Ipanema, douze etages plus haut, avec le Cristo parfaitement encadre entre deux poutres. Reservez le coucher du soleil, partagez tout, restez longtemps.",
'praia-vermelha': "Une courte courbe de sable rouge grossier blottie entre Sugarloaf et la colline d'Urca. Eau calme, acces facile, foret juste derriere. Idealement, allez-y un lundi.",
'praia-barra-tijuca': "18 kilometres d'Atlantique ouvert, grosses vagues, peu de batiments pres du sable. Louez une chaise au Pepe pour observer les surfeurs serieux.",
'pedra-do-arpoador': "Le rocher noir entre Ipanema et Copacabana ou toute la ville se rassemble pour applaudir le coucher de soleil. Arrivez quarante minutes en avance, asseyez-vous haut.",
'lagoa-rodrigo-freitas': "Le lagon d'eau douce entoure d'un chemin de 7,5 km, encadre par Corcovado et Dois Irmaos. Louez des velos, faites une fois le tour, arretez-vous au kiosque pour de l'eau de coco.",
'praia-leblon': "L'extremite plus calme, plus familiale de la bande Ipanema-Leblon. Mirante do Leblon a l'ouest pour le coucher de soleil, plage propre, eau plus paisible.",
'arpoador': "Le quartier et la plage-pli ou Ipanema rejoint Copacabana. Spot de surf a droite, plage a gauche, rocher au milieu. Le coeur geographique de la ville.",
'vista-chinesa': "Un belvedere de style pagode chinoise dans la foret de Tijuca avec une vue degagee sur la zone sud: Corcovado, Lagoa, Ipanema, l'Atlantique. Allez-y a velo si vous le pouvez.",
'satyricon-rio': "Institution des fruits de mer d'Ipanema depuis 1986. Poisson entier cuit en croute de sel, pates maison, huitres ouvertes a la table. Choisissez le poisson dans la vitrine glacee.",
};

const spots = JSON.parse(fs.readFileSync(SPOTS_PATH, 'utf8'));
let updated = 0;
const missing = [];

for (const s of spots) {
    if (s.city !== 'rio') continue;
    const fr = FR[s.id];
    if (!fr) { missing.push(s.id); continue; }
    if (typeof s.description !== 'object') s.description = { en: s.description || '', it: '', pt: '', fr: '' };
    s.description.fr = fr;
    updated++;
}

fs.writeFileSync(SPOTS_PATH, JSON.stringify(spots, null, 2) + '\n');
console.log(`Updated ${updated} Rio spots`);
if (missing.length) console.log(`Missing: ${missing.join(', ')}`);
