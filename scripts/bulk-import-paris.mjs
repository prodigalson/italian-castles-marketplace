#!/usr/bin/env node
// Bulk import Paris places via Google Places (New). For each entry:
// 1. Text search biased to Paris
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

// Paris center, biased within ~12km
const PARIS = { lat: 48.8566, lon: 2.3522, radius: 12000 };

const PLACES = [
    { id: 'au-doux-raisin', q: 'Au Doux Raisin wine bar Paris', name: 'AU DOUX\nRAISIN',
      desc: {
        en: "A small natural wine bar on the Mouffetard slope. Short pourable list, plates of cheese and saucisson, conversations that always run long.",
        fr: "Un petit bar a vin nature sur la pente de Mouffetard. Une carte courte qui se boit, des planches de fromage et de saucisson, et des conversations qui s'eternisent.",
        it: "Un piccolo bar a vino naturale sulla discesa di Mouffetard. Carta breve da bere, taglieri di formaggi e salumi, conversazioni che vanno sempre per le lunghe.",
        pt: "Um pequeno bar de vinhos naturais na ladeira da Mouffetard. Carta curta e bebivel, tabuas de queijos e embutidos, conversas que sempre se alongam."
      },
      dateType: 'aperitivo', vibe: 'casual', priceRange: 2 },
    { id: 'bon-esprit-paris', q: 'Bon Esprit craft beers good spirits Paris', name: 'BON\nESPRIT',
      desc: {
        en: "Craft beer and small-batch spirits, chosen with obvious affection. Sit at the counter, ask the bartender, end up with something you would never have ordered.",
        fr: "Bieres artisanales et spiritueux de petits producteurs, choisis avec passion. Installez-vous au comptoir, posez la question au barman, repartez avec ce que vous n'auriez jamais commande seul.",
        it: "Birre artigianali e distillati di piccole produzioni, scelti con cura evidente. Sedetevi al banco, chiedete al barista, finite per bere qualcosa che non avreste mai ordinato.",
        pt: "Cervejas artesanais e destilados de pequenos produtores, escolhidos com carinho. Sente no balcao, pergunte ao bartender, saia com algo que voce jamais teria pedido."
      },
      dateType: 'cocktail-bar', vibe: 'casual', priceRange: 2 },
    { id: 'calibre-paris', q: 'Calibre restaurant Paris', name: 'CALIBRE',
      desc: {
        en: "A modern bistro with a one-page daily menu and a serious natural wine list. Small room, candlelight, the kind of place that becomes 'our place' after two visits.",
        fr: "Un bistrot moderne avec une carte d'une page ecrite chaque jour et une vraie selection de vins nature. Petite salle, bougies, le genre d'endroit qui devient 'le notre' apres deux visites.",
        it: "Un bistrot moderno con un menu di una pagina riscritto ogni giorno e una carta dei vini naturali seria. Sala piccola, candele, il tipo di posto che diventa 'il nostro' dopo due volte.",
        pt: "Um bistro moderno com um menu de uma pagina escrito a cada dia e uma carta seria de vinhos naturais. Sala pequena, luz de vela, o tipo de lugar que vira 'o nosso' depois de duas visitas."
      },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 3 },
    { id: 'big-shot-coffee-paris', q: 'Big Shot Coffee Paris', name: 'BIG SHOT\nCOFFEE',
      desc: {
        en: "Specialty espresso, single-origin pour-overs, a pastry case that takes itself seriously. Stand at the bar like the locals, then take the long table by the window.",
        fr: "Espresso de specialite, filtres en origine unique, une vitrine de patisseries qui se prend au serieux. Buvez debout au comptoir comme les habitues, puis prenez la grande table pres de la fenetre.",
        it: "Espresso da specialty, filter di mono-origine, una vetrina di pasticceria seria. Bevi al banco come i locali, poi sposta tutto al tavolone vicino alla finestra.",
        pt: "Espresso especial, filtrados mono-origem, uma vitrine de patisseries levada a serio. Beba em pe no balcao como os locais, depois va para a mesa comprida perto da janela."
      },
      dateType: 'coffee-pastry', vibe: 'casual', priceRange: 2 },
    { id: 'serpent-a-plume-paris', q: 'Serpent a Plume Place des Vosges Paris', name: 'SERPENT\nA PLUME',
      desc: {
        en: "Tucked into the arcades of Place des Vosges. Velvet banquettes, low light, a tight cocktail menu, and the city's prettiest square framed in your window.",
        fr: "Niche sous les arcades de la Place des Vosges. Banquettes en velours, lumiere tamisee, une carte de cocktails resserree et la plus belle place de la ville encadree dans la fenetre.",
        it: "Annidato sotto i portici di Place des Vosges. Divanetti di velluto, luci basse, un menu di cocktail essenziale e la piazza piu bella della citta incorniciata dalla finestra.",
        pt: "Escondido sob os arcos da Place des Vosges. Banquetas de veludo, luz baixa, um menu de drinks enxuto e a praca mais bonita da cidade emoldurada na sua janela."
      },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 4 },
    { id: 'le-rosebud-paris', q: 'Le Rosebud Montparnasse Paris', name: 'LE\nROSEBUD',
      desc: {
        en: "Montparnasse classic since 1962. White-coated waiters, a perfect Martini, no playlist, no clock. The bar to go to when you want to disappear for an hour.",
        fr: "Classique de Montparnasse depuis 1962. Garcons en veste blanche, un Martini parfait, ni playlist ni horloge. Le bar ou aller quand on veut disparaitre une heure.",
        it: "Classico di Montparnasse dal 1962. Camerieri in giacca bianca, un Martini perfetto, niente playlist, niente orologio. Il bar dove andare quando si vuole sparire per un'ora.",
        pt: "Classico de Montparnasse desde 1962. Garcons de jaleco branco, um Martini perfeito, sem playlist, sem relogio. O bar para ir quando voce quer sumir por uma hora."
      },
      dateType: 'cocktail-bar', vibe: 'classic', priceRange: 3 },
    { id: 'artazart-paris', q: 'Artazart bookstore Canal Saint Martin Paris', name: 'ARTAZART',
      desc: {
        en: "The design bookstore on the Canal Saint-Martin. Photography monographs, type specimens, indie zines. Browse for an hour, walk along the water, browse again.",
        fr: "La librairie de design sur le Canal Saint-Martin. Monographies de photo, specimens typographiques, fanzines independants. Fouinez une heure, marchez le long de l'eau, revenez fouiner.",
        it: "La libreria di design sul Canal Saint-Martin. Monografie di fotografia, campioni tipografici, fanzine indipendenti. Curiosa per un'ora, cammina lungo l'acqua, torna a curiosare.",
        pt: "A livraria de design no Canal Saint-Martin. Monografias de fotografia, especimes tipograficos, zines independentes. Fucem por uma hora, andem pela margem, voltem para fucar mais."
      },
      dateType: 'cultural', vibe: 'casual', priceRange: 1 },
    { id: 'crypte-archeologique-paris', q: "Crypte Archeologique Ile de la Cite Paris", name: 'CRYPTE\nARCHEOLOGIQUE',
      desc: {
        en: "Two thousand years of Paris compressed into one underground room beneath the Notre-Dame parvis: Roman walls, medieval foundations, all preserved in situ. Twenty minutes; you will remember it.",
        fr: "Deux mille ans de Paris condenses dans une salle souterraine sous le parvis de Notre-Dame : remparts gallo-romains, fondations medievales, tout conserve en place. Vingt minutes, et on s'en souvient.",
        it: "Duemila anni di Parigi compressi in una sala sotterranea sotto il sagrato di Notre-Dame: mura romane, fondamenta medievali, tutto conservato in situ. Venti minuti, e te lo ricordi.",
        pt: "Dois mil anos de Paris condensados em uma sala subterranea sob o adro de Notre-Dame: muros romanos, fundacoes medievais, tudo preservado in situ. Vinte minutos, e voce lembra."
      },
      dateType: 'cultural', vibe: 'classic', priceRange: 1 },
    { id: 'cepe-et-figue-paris', q: 'Cepe et Figue restaurant Paris', name: 'CEPE\n& FIGUE',
      desc: {
        en: "A small kitchen built around mushrooms in autumn and figs in summer. Daily-written board, attentive service, an easy answer to 'where should we go.'",
        fr: "Une petite cuisine construite autour des cepes en automne et des figues en ete. Ardoise du jour, service attentif, une reponse facile a 'on va ou ?'",
        it: "Una piccola cucina costruita attorno ai funghi in autunno e ai fichi in estate. Lavagna del giorno, servizio attento, una risposta facile a 'dove andiamo?'",
        pt: "Uma cozinha pequena construida em torno de cogumelos no outono e figos no verao. Quadro do dia, servico atento, uma resposta facil para 'pra onde a gente vai?'"
      },
      dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 3 },
    { id: 'casa-cafe-paris', q: 'Casa Cafe Paris', name: 'CASA\nCAFE',
      desc: {
        en: "A neighborhood cafe with serious coffee, honest daytime food, and a window seat that feels yours by the second visit.",
        fr: "Un cafe de quartier avec du vrai cafe, une carte du midi sans pretention, et une place pres de la fenetre qui devient la votre des la deuxieme fois.",
        it: "Un cafe di quartiere con caffe serio, cucina diurna onesta e un tavolo vicino alla finestra che senti tuo dalla seconda volta.",
        pt: "Um cafe de bairro com cafe levado a serio, comida de dia honesta e um lugar perto da janela que parece seu na segunda visita."
      },
      dateType: 'coffee-pastry', vibe: 'casual', priceRange: 1 },
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
            textQuery: query.replace(/\n/g, ' '),
            maxResultCount: 1,
            locationBias: { circle: { center: { latitude: PARIS.lat, longitude: PARIS.lon }, radius: PARIS.radius } },
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
    // Prefer arrondissement (sublocality_level_1) for Paris
    if (components && components.length) {
        const sub = components.find(c => c.types?.includes('sublocality_level_1') || c.types?.includes('sublocality'));
        if (sub) return sub.longText || sub.shortText;
    }
    if (!address) return '';
    // Try to extract arrondissement from "75XXX Paris" postal code
    const arrMatch = address.match(/750(0[1-9]|1[0-9]|20)\s+Paris/);
    if (arrMatch) {
        const n = parseInt(arrMatch[1], 10);
        return `${n}${n === 1 ? 'er' : 'e'} arr.`;
    }
    const parts = address.split(',').map(s => s.trim());
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
            const hoodLabel = hood ? `${hood}, Paris` : 'Paris';
            const neighborhood = {
                en: hoodLabel,
                it: hoodLabel,
                pt: hoodLabel,
                fr: hoodLabel,
            };
            const spot = {
                id: p.id,
                city: 'paris',
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
