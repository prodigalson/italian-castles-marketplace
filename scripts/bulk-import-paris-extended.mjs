#!/usr/bin/env node
// Bulk import additional Paris places via Google Places (New).
// Same pattern as bulk-import-paris.mjs but for a long list with name-based
// heuristic classification (dateType / vibe / priceRange) — no curated copy.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPOTS_PATH = path.join(__dirname, '..', 'data', 'spots.json');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const m = line.match(/^([A-Z_]+)="?(.*?)"?$/);
        if (m) process.env[m[1]] = m[2];
    }
}
const KEY = process.env.GOOGLE_PLACES_KEY;
if (!KEY) { console.error('GOOGLE_PLACES_KEY missing'); process.exit(1); }

const PARIS = { lat: 48.8566, lon: 2.3522, radius: 15000 };

// User's full Paris list (one per line). The first 10 are skipped — already
// imported with curated multilingual descriptions by bulk-import-paris.mjs.
const RAW_LIST = `
Au Doux Raisin
bon esprit - craft beers & good spirits
Calibré
Big Shot coffee
Serpent à Plume
le Rosebud
Artazart
Crypte Archéologique de l'İle de la Cité
Cèpe & Figue
CASA CAFE
Grouvie
The Crying Tiger
FrenchParadox - Canard & Champagne
Seven Heaven • Coffee Lunch Brunch
Do et Riz
Jinchan Shokudo
FIKA
Torré Coffee Shop
Le Piaf Paris
Tiger
Gabriela
KB CaféShop
Noir - Coffee Shop & Torréfacteur
Frenchie Bar à Vins
Manie Café - Est. 1938
Mood Coffee Shop
Le 404
Goûte
Arnaud Nicolas
Ha Noi 1988
Terres de Café
Les Parisiens
laïzé sainte-avoye
Café d'Auteur « Specialty Coffee Paris »
Bistro Mee
Lolo cave à manger
Brasserie Dubillot
L'Avant Comptoir du Marché
La Gentiane
Musée Marmottan Monet
Le Temple Celeste (Cuisine familiale chinoise)
Mori Yoshida
Le Royal China
Le Bistrot des Fables
Café du Clown
Antipublic Library
Café Charlot
Glazed Pasteur
Les Antiquaires
Des gâteaux et du pain
La Pâtisserie Cyril Lignac - Paul Bert
Bistrot Paul Bert
HANDO Parisian Handroll
Musée d'Orsay
Delicatessen cave
Musée National Picasso-Paris
Restaurant Drouant
SO/ PARIS
Vla Léandre
Double Dragon
Steam Bar
Café de la Poste
Avant Comptoir de la Terre
Pacifique
Compagnie des Vins Surnaturels
GrandCœur
Kodawari Ramen Tsukiji
Louis Vuitton Foundation
ARTESANO specialty coffee roaster
Bofinger
Luxembourg Gardens
Le Relais De L'Entrecôte
Les Maquereaux
Deux fois plus de piment
PNY MARAIS
Le Grand Véfour
Partisan Café Artisanal
La Terrasse du 7
Bourse de Commerce - Pinault Collection
Le Chardenoux
FLOW Paris
Joayo Haussmann
BB Blanche
MAZE Paris
Encore là
Un Grain Décalé
Restaurant Pulcinella
Café A Paris
Liquiderie Bar
Rue Sainte-Marthe
Dalí Paris
Au Petit Rozey
Il Fico
La Bourse et La Vie
Lai'Tcha
Le Servan
The Centre Pompidou
Musée de l'Orangerie
Perruche Paris
Le Barav
L'Atalante Paris
Danico
Bar À Bulles
Palais de Tokyo
Palais de la Découverte
Musée des Arts Décoratifs Paris
My Noodles
Muqam Spécialités ouïghoures Paris
La Compagnie du Café
Square George Cain
Django Restaurant Paris
Atelier des Lumières
Saint Pearl
Griffon Paris
Bleu Cerise
Dirty Dick Paris
L'Alimentation Générale
Restaurant Kunitoraya
Télescope Café
Rosa Bonheur sur Seine
Rue Crémieux
Chez Julien
MOTORS COFFEE
Parc de Belleville
La Pâtisserie Cyril Lignac
Night Flight Paris
Trois Fois plus de Piment
Le Carreau du Temple
COMETS Café disques
Café Verlet
Happy Nouilles
Le Ruisseau Paris
Grande Mosquée de Paris
Rosa Bonheur Buttes Chaumont
Les Deux Magots
Parc des Buttes-Chaumont
Musée de la Vie romantique
Mandarin Oriental Paris
Angelina Paris
Prescription Cocktail Club
La Rotonde Stalingrad
Mariage Frères Rive Gauche
Le Fumoir
Lavomatic
La Perle Paris
Candelaria Paris
Little Red Door
Experimental Cocktail Club
Le Syndicat
Le Perchoir
Galerie Vivienne
Umami Matcha Café
Restaurant Amour
Mama Shelter Paris East
Le 1905
TORAYA Paris Store
Hôtel Particulier Montmartre
Grazie Paris
Bistrot Richelieu
Moonshiner Paris
The Hoxton Paris
Parc Monceau
Le Bon Marché
Arab World Institute
Le Comptoir Général
Chez Prune
Shakespeare & Company
Wild & The Moon Charlot
Le Procope
Chez Georges
Jugetsudo By Maruyama Nori
`.trim().split('\n').map(s => s.trim()).filter(Boolean);

// Already imported in the first batch (with curated copy) — skip.
const SKIP_QUERIES = new Set([
    'au doux raisin', 'bon esprit', 'calibré', 'big shot coffee', 'serpent à plume',
    'le rosebud', 'artazart', "crypte archéologique de l'île de la cité",
    'cèpe & figue', 'casa cafe',
]);

function slugify(name) {
    return name
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/['"`«»·•]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Classify by name keywords. Heuristic, not perfect — but matches existing
// dateType / vibe / priceRange categories used by the magazine UI.
function classify(name) {
    const n = name.toLowerCase();

    // Museums, galleries, foundations, cultural sites
    if (/musée|museum|foundation|fondation|institute|institut|atelier des lumières|pompidou|orangerie|orsay|picasso|palais de tokyo|découverte|arts décoratifs|dalí|bourse de commerce|shakespeare|galerie vivienne|carreau du temple|crypte|arab world|antipublic library|atelier/.test(n)) {
        return { dateType: 'cultural', vibe: 'classic', priceRange: 1 };
    }
    // Parks, gardens, outdoor streets
    if (/parc|jardin|square|rue crémieux|terrasse|grande mosquée|rosa bonheur sur seine/.test(n)) {
        return { dateType: 'outdoor', vibe: 'romantic', priceRange: 1 };
    }
    // Hotel rooftops + perchoirs feel festive
    if (/le perchoir|night flight|so\/ paris|hôtel particulier|mama shelter|mandarin oriental|hoxton|le 1905|rotonde stalingrad|bar à bulles|perruche/.test(n)) {
        return { dateType: 'cocktail-bar', vibe: 'festive', priceRange: 3 };
    }
    // Tea salons / iconic pastry / chocolate / bakeries
    if (/angelina|mariage frères|toraya|mori yoshida|cyril lignac|des gâteaux et du pain|glazed|partisan café|verlet|umami matcha|télescope|kb café|fika|seven heaven|terres de café|motors coffee|big shot|noir.*coffee|torré|coffee shop|specialty coffee|artesano|coffee roaster|matcha|d'auteur|manie café|mood coffee|café charlot|café a paris|café du clown|café de la poste|café verlet|wild & the moon|chez prune|la compagnie du café|comets/.test(n)) {
        return { dateType: 'coffee-pastry', vibe: 'casual', priceRange: 2 };
    }
    // Asian: noodles / ramen / chinese / korean / japanese / vietnamese / uyghur / thai
    if (/ramen|noodles|nouilles|shokudo|jinchan|sushi|chinois|royal china|royal chinese|kodawari|kunitoraya|muqam|ha noi|temple celeste|crying tiger|hando|jugetsudo|django restaurant|lai.tcha|saint pearl|griffon|double dragon|pacifique|happy nouilles|piment|tiger\b|joayo|jinchan/.test(n)) {
        return { dateType: 'casual-lunch', vibe: 'casual', priceRange: 2 };
    }
    // Wine bars + small plates
    if (/cave à manger|cave|bar à vins|champagne|frenchparadox|compagnie des vins|delicatessen cave|avant comptoir|lolo|frenchie|gentiane|barav|prune|alimentation générale|liquiderie|la perle|maze|encore là|grouvie|piaf|gabriela|bistro mee|do et riz|goûte/.test(n)) {
        return { dateType: 'aperitivo', vibe: 'casual', priceRange: 2 };
    }
    // Cocktail bars / speakeasies
    if (/cocktail|moonshiner|danico|candelaria|experimental|prescription|syndicat|lavomatic|little red door|fumoir|steam bar|dirty dick|amour|atalante|bleu cerise/.test(n)) {
        return { dateType: 'cocktail-bar', vibe: 'romantic', priceRange: 3 };
    }
    // Brasseries / bistrots / restaurants
    if (/bistro|bistrot|brasserie|restaurant|chez |grand véfour|chardenoux|bourse et la vie|bofinger|relais de l|drouant|grandcœur|servan|maquereaux|pny|verfour|fables|antiquaires|paul bert|julien|procope|deux magots|pulcinella|il fico|grazie|arnaud nicolas|rouisseau|ruisseau|carreau du temple|comptoir général|petit rozey|terrasse du 7|404|vla léandre|bourse et la vie/.test(n)) {
        return { dateType: 'romantic-dinner', vibe: 'romantic', priceRange: 3 };
    }
    // Shops & department stores (consumed as cultural stroll)
    if (/bon marché|shakespeare|antipublic/.test(n)) {
        return { dateType: 'cultural', vibe: 'casual', priceRange: 2 };
    }
    // Fallback: treat unknown as aperitivo (safe, common date)
    return { dateType: 'aperitivo', vibe: 'casual', priceRange: 2 };
}

async function searchPlace(query) {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.photos,places.formattedAddress,places.googleMapsUri,places.addressComponents',
        },
        body: JSON.stringify({
            textQuery: query + ' Paris',
            maxResultCount: 1,
            locationBias: { circle: { center: { latitude: PARIS.lat, longitude: PARIS.lon }, radius: PARIS.radius } },
        }),
    });
    if (!r.ok) { return null; }
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
        const sub = components.find(c => c.types?.includes('sublocality_level_1') || c.types?.includes('sublocality'));
        if (sub) return sub.longText || sub.shortText;
    }
    if (!address) return '';
    const arrMatch = address.match(/750(0[1-9]|1[0-9]|20)\s+Paris/);
    if (arrMatch) {
        const n = parseInt(arrMatch[1], 10);
        return `${n}${n === 1 ? 'er' : 'e'} arr.`;
    }
    const parts = address.split(',').map(s => s.trim());
    return parts[parts.length - 3] || parts[0] || '';
}

// Force long single-word lines to break across two display lines.
function formatName(name) {
    // Strip the user's annotation suffixes that aren't part of the venue name
    let n = name
        .replace(/\s*[-—]\s*[Ee]st\.?\s*\d+\s*$/, '')  // " - Est. 1938"
        .replace(/\s*[•·]\s*.+$/, '')                   // " • Coffee Lunch Brunch"
        .replace(/\s*\([^)]*\)\s*$/, '')                // trailing parens
        .replace(/«[^»]*»/g, '')                        // « ... »
        .replace(/\s+Paris\s*$/i, '')                   // trailing " Paris"
        .trim();
    // Replace " - " with newline so we get a natural break
    n = n.replace(/\s*-\s*/g, '\n');
    // Replace ampersand-only join with newline if line is long
    const upper = n.toUpperCase();
    return upper.length > 18 && !upper.includes('\n') ? upper.replace(/\s+/, '\n') : upper;
}

async function run() {
    const spots = JSON.parse(fs.readFileSync(SPOTS_PATH, 'utf8'));
    const byId = new Map(spots.map(s => [s.id, s]));
    let added = 0, skipped = 0, failed = 0;
    const seen = new Set();

    for (let i = 0; i < RAW_LIST.length; i++) {
        const raw = RAW_LIST[i];
        const dedupeKey = raw.toLowerCase().replace(/\s+/g, ' ').trim();
        if (seen.has(dedupeKey)) { skipped++; continue; }
        seen.add(dedupeKey);
        if (SKIP_QUERIES.has(dedupeKey)) { skipped++; continue; }

        let baseId = slugify(raw) + '-paris';
        let id = baseId;
        let dupCount = 1;
        while (byId.has(id)) { dupCount++; id = `${baseId}-${dupCount}`; }

        process.stdout.write(`[${i+1}/${RAW_LIST.length}] ${raw} ... `);
        try {
            const place = await searchPlace(raw);
            if (!place) { console.log('no match'); failed++; continue; }
            const photoRef = place.photos?.[0]?.name;
            const heroImage = photoRef ? (await resolvePhoto(photoRef)) : '';
            const hood = neighborhoodFromAddress(place.formattedAddress, place.addressComponents);
            const hoodLabel = hood ? `${hood}, Paris` : 'Paris';
            const cls = classify(raw);
            const spot = {
                id,
                city: 'paris',
                name: formatName(raw),
                neighborhood: { en: hoodLabel, it: hoodLabel, pt: hoodLabel, fr: hoodLabel },
                description: { en: '', it: '', pt: '', fr: '' },
                heroImage: heroImage || '',
                heroAlt: place.displayName?.text || raw,
                heroPosition: 'center center',
                mapsUrl: place.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw + ' Paris')}`,
                dateType: cls.dateType,
                vibe: cls.vibe,
                priceRange: cls.priceRange,
                lat: place.location?.latitude ?? null,
                lon: place.location?.longitude ?? null,
            };
            spots.push(spot);
            byId.set(id, spot);
            added++;
            console.log('added', heroImage ? '(photo)' : '(no photo)', '|', cls.dateType);
            await new Promise(r => setTimeout(r, 150));
        } catch (err) {
            console.log('err', err.message);
            failed++;
        }
    }

    fs.writeFileSync(SPOTS_PATH, JSON.stringify(spots, null, 2) + '\n');
    console.log(`\nDone. added=${added} skipped=${skipped} failed=${failed} total=${spots.length}`);
}

run().catch(e => { console.error(e); process.exit(1); });
