#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const UA = 'AmoDoveAndiamo-BulkImport/1.0 (https://amodoveandiamo.vercel.app)';
const SPOTS_PATH = path.resolve('data/spots.json');

const NEW_PLACES = [
    'Eutopia', 'Osteria Afrodite', 'Il Baretto Milano', 'Waby Ristorante',
    'Taverna Trastevere Milano', "L'ile Douce Milano", 'Veramente', 'Roppongi Milano',
    'Bar Nico Milano', 'Sakeya Milano', 'SAN Milano', 'Atypique Milano',
    "bolo'bolo bar Milano", 'Onda Listening Bar Milano', 'Frida Milano',
    'Isola Rooftop Terrace Milano', 'Salmon Guru Milano', 'Baunilla Bosco Verticale',
    'Barragan Milano', 'Kagurazaka Saryo Milano', 'Bicchierino bar Milano',
    "Gallerie d'Italia Milano", 'Palazzo Cordusio Gran Melia', 'Al Cortile Milano',
    'Pasticceria Clivati Milano', 'Rumore Milano', 'Ronin Milano', 'Osaka Milano',
    'Miyabi Milano', 'Locanda Perbellini Bistrot Milano', 'Al Baretto San Marco Milano',
    'Osteria la Carbonaia Milano', 'Sogni Milano', 'Beefbar Milano',
    'Moebius Milano', 'Al Garghet Milano', 'Casa Fiori Chiari Milano',
    'Cru Arco Milano', 'LuBarino Milano', 'Lubar Milano', 'Bon Wei Milano',
    'Bacaro Montenapoleone Milano', 'Al Fresco Milano', 'Pasticceria Sissi Milano',
    'drinc.different Milano', 'IYO Milano', 'Langosteria bar Milano',
    'Dim sum Milano', 'El Porteno Prohibido Milano', 'Loste Cafe Milano',
    "Wicky's Innovative Japanese Cuisine", 'Ribot restaurant Milano',
    'Hostaria Terza Carboniaia Milano', 'Ristorante la Brisa Milano',
    'Serra di Quartiere Milano', 'Lacerba Milano', 'Flow Milano',
    'Marchesi 1824 Milano', 'Cantine Isola Milano', 'Fondazione Prada',
    'Bar Luce Milano', 'Pinacoteca di Brera', 'Trattoria Torre di Pisa Milano',
    'Kanpai Milano', 'Mudec Milano', 'Spirit de Milan', 'Triennale di Milano',
    'Mag Cafe Milano', 'Orsonero Coffee Milano', 'Paper Moon Giardino Milano',
    'Nottingham Forest Milano', 'Il Salumaio di Montenapoleone',
    'BA restaurant Milano', 'Pasticceria Adolfo Stefanelli Milano',
    'Rotonda della Besana Milano', 'Ta-hua Milano', 'Dal Bolognese Milano',
    'Chateau Dufan Milano', 'Ydun Milano', 'Iter Milano',
    'Teatro alla Scala Milano', 'Al Matarel Milano',
];

const DISPLAY_NAMES = {
    "L'ile Douce Milano":"L'ILE DOUCE","bolo'bolo bar Milano":"BOLO'BOLO BAR",
    "Wicky's Innovative Japanese Cuisine":"WICKY'S","Gallerie d'Italia Milano":"GALLERIE D'ITALIA",
    "drinc.different Milano":"DRINC.DIFFERENT","Il Salumaio di Montenapoleone":"IL SALUMAIO\nDI MONTENAPOLEONE",
    "Bacaro Montenapoleone Milano":"BACARO\nMONTENAPOLEONE","Palazzo Cordusio Gran Melia":"PALAZZO\nCORDUSIO",
    "Kagurazaka Saryo Milano":"KAGURAZAKA\nSARYO","Isola Rooftop Terrace Milano":"ISOLA\nROOFTOP",
    "Hostaria Terza Carboniaia Milano":"HOSTARIA\nTERZA CARBONAIA","Locanda Perbellini Bistrot Milano":"LOCANDA\nPERBELLINI",
    "Al Baretto San Marco Milano":"AL BARETTO\nSAN MARCO","Pasticceria Adolfo Stefanelli Milano":"PASTICCERIA\nSTEFANELLI",
    "Rotonda della Besana Milano":"ROTONDA\nDELLA BESANA","Trattoria Torre di Pisa Milano":"TRATTORIA\nTORRE DI PISA",
    "Osteria la Carbonaia Milano":"OSTERIA\nLA CARBONAIA","Casa Fiori Chiari Milano":"CASA\nFIORI CHIARI",
    "Baunilla Bosco Verticale":"BAUNILLA\nBOSCO VERTICALE","Paper Moon Giardino Milano":"PAPER MOON\nGIARDINO",
    "Pasticceria Clivati Milano":"PASTICCERIA\nCLIVATI","Pasticceria Sissi Milano":"PASTICCERIA\nSISSI",
    "Taverna Trastevere Milano":"TAVERNA\nTRASTEVERE","Il Baretto Milano":"IL BARETTO",
    "Waby Ristorante":"WABY","Ristorante la Brisa Milano":"LA BRISA",
    "Nottingham Forest Milano":"NOTTINGHAM\nFOREST","Onda Listening Bar Milano":"ONDA\nLISTENING BAR",
    "Langosteria bar Milano":"LANGOSTERIA\nBAR","Teatro alla Scala Milano":"TEATRO\nALLA SCALA",
    "Marchesi 1824 Milano":"MARCHESI 1824","Pinacoteca di Brera":"PINACOTECA\nDI BRERA",
    "Fondazione Prada":"FONDAZIONE\nPRADA","Triennale di Milano":"TRIENNALE",
    "Bar Luce Milano":"BAR LUCE","Dal Bolognese Milano":"DAL BOLOGNESE",
    "Mag Cafe Milano":"MAG CAFE","Orsonero Coffee Milano":"ORSONERO\nCOFFEE",
    "Al Matarel Milano":"AL MATAREL","Al Garghet Milano":"AL GARGHET",
    "Al Fresco Milano":"AL FRESCO","Al Cortile Milano":"AL CORTILE",
    "Cantine Isola Milano":"CANTINE ISOLA","Spirit de Milan":"SPIRIT DE MILAN",
    "Salmon Guru Milano":"SALMON GURU","Loste Cafe Milano":"LOSTE CAFE",
    "El Porteno Prohibido Milano":"EL PORTENO\nPROHIBIDO","LuBarino Milano":"LUBARINO",
    "Lubar Milano":"LUBAR","Iter Milano":"ITER","Ydun Milano":"YDUN",
    "Chateau Dufan Milano":"CHATEAU DUFAN","BA restaurant Milano":"BA",
    "Ta-hua Milano":"TA-HUA","Bon Wei Milano":"BON WEI","Dim sum Milano":"DIM SUM",
    "Kanpai Milano":"KANPAI","Beefbar Milano":"BEEFBAR","Moebius Milano":"MOEBIUS",
    "Barragan Milano":"BARRAGAN","Ronin Milano":"RONIN","Osaka Milano":"OSAKA",
    "Miyabi Milano":"MIYABI","Roppongi Milano":"ROPPONGI","Sakeya Milano":"SAKEYA",
    "Atypique Milano":"ATYPIQUE","Frida Milano":"FRIDA","SAN Milano":"SAN",
    "Bar Nico Milano":"BAR NICO","Bicchierino bar Milano":"BICCHIERINO",
    "Veramente":"VERAMENTE","Eutopia":"EUTOPIA","Osteria Afrodite":"OSTERIA\nAFRODITE",
    "Cru Arco Milano":"CRU ARCO","Sogni Milano":"SOGNI","Ribot restaurant Milano":"RIBOT",
    "Rumore Milano":"RUMORE","Serra di Quartiere Milano":"SERRA\nDI QUARTIERE",
    "Lacerba Milano":"LACERBA","Flow Milano":"FLOW","IYO Milano":"IYO","Mudec Milano":"MUDEC",
};

const TYPE_HINTS = {
    "Gallerie d'Italia Milano":{dateType:'cultural',vibe:'classic',price:2},
    "Fondazione Prada":{dateType:'cultural',vibe:'classic',price:2},
    "Pinacoteca di Brera":{dateType:'cultural',vibe:'classic',price:2},
    "Mudec Milano":{dateType:'cultural',vibe:'classic',price:2},
    "Triennale di Milano":{dateType:'cultural',vibe:'classic',price:2},
    "Teatro alla Scala Milano":{dateType:'cultural',vibe:'classic',price:3},
    "Rotonda della Besana Milano":{dateType:'outdoor',vibe:'classic',price:1},
    "Marchesi 1824 Milano":{dateType:'coffee-pastry',vibe:'classic',price:3},
    "Pasticceria Clivati Milano":{dateType:'coffee-pastry',vibe:'casual',price:2},
    "Pasticceria Sissi Milano":{dateType:'coffee-pastry',vibe:'casual',price:2},
    "Pasticceria Adolfo Stefanelli Milano":{dateType:'coffee-pastry',vibe:'casual',price:2},
    "Orsonero Coffee Milano":{dateType:'coffee-pastry',vibe:'casual',price:2},
    "Bar Luce Milano":{dateType:'coffee-pastry',vibe:'classic',price:2},
    "Loste Cafe Milano":{dateType:'coffee-pastry',vibe:'casual',price:2},
    "Baunilla Bosco Verticale":{dateType:'coffee-pastry',vibe:'casual',price:2},
    "Kagurazaka Saryo Milano":{dateType:'coffee-pastry',vibe:'classic',price:2},
    "L'ile Douce Milano":{dateType:'coffee-pastry',vibe:'romantic',price:2},
    "Il Baretto Milano":{dateType:'cocktail-bar',vibe:'classic',price:3},
    "Nottingham Forest Milano":{dateType:'cocktail-bar',vibe:'festive',price:3},
    "Salmon Guru Milano":{dateType:'cocktail-bar',vibe:'festive',price:3},
    "Atypique Milano":{dateType:'cocktail-bar',vibe:'romantic',price:3},
    "Onda Listening Bar Milano":{dateType:'cocktail-bar',vibe:'romantic',price:3},
    "drinc.different Milano":{dateType:'cocktail-bar',vibe:'festive',price:3},
    "Sogni Milano":{dateType:'cocktail-bar',vibe:'romantic',price:3},
    "Barragan Milano":{dateType:'cocktail-bar',vibe:'casual',price:2},
    "Sakeya Milano":{dateType:'cocktail-bar',vibe:'classic',price:3},
    "bolo'bolo bar Milano":{dateType:'cocktail-bar',vibe:'casual',price:2},
    "Bar Nico Milano":{dateType:'cocktail-bar',vibe:'casual',price:2},
    "Frida Milano":{dateType:'cocktail-bar',vibe:'casual',price:2},
    "Bicchierino bar Milano":{dateType:'cocktail-bar',vibe:'casual',price:2},
    "Al Baretto San Marco Milano":{dateType:'cocktail-bar',vibe:'classic',price:2},
    "LuBarino Milano":{dateType:'cocktail-bar',vibe:'casual',price:2},
    "Lubar Milano":{dateType:'cocktail-bar',vibe:'casual',price:2},
    "Isola Rooftop Terrace Milano":{dateType:'cocktail-bar',vibe:'festive',price:3},
    "Palazzo Cordusio Gran Melia":{dateType:'cocktail-bar',vibe:'classic',price:4},
    "Cantine Isola Milano":{dateType:'aperitivo',vibe:'casual',price:2},
    "Cru Arco Milano":{dateType:'aperitivo',vibe:'classic',price:3},
    "Bacaro Montenapoleone Milano":{dateType:'aperitivo',vibe:'classic',price:3},
    "Ydun Milano":{dateType:'aperitivo',vibe:'casual',price:2},
    "Mag Cafe Milano":{dateType:'aperitivo',vibe:'casual',price:2},
    "Spirit de Milan":{dateType:'live-music',vibe:'festive',price:2},
    "IYO Milano":{dateType:'romantic-dinner',vibe:'classic',price:4},
    "Wicky's Innovative Japanese Cuisine":{dateType:'romantic-dinner',vibe:'classic',price:4},
    "Roppongi Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Miyabi Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Ronin Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Osaka Milano":{dateType:'romantic-dinner',vibe:'casual',price:2},
    "Kanpai Milano":{dateType:'romantic-dinner',vibe:'casual',price:2},
    "Bon Wei Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Dim sum Milano":{dateType:'casual-lunch',vibe:'casual',price:2},
    "Ta-hua Milano":{dateType:'casual-lunch',vibe:'casual',price:2},
    "BA restaurant Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Al Matarel Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Al Garghet Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Trattoria Torre di Pisa Milano":{dateType:'romantic-dinner',vibe:'casual',price:2},
    "Osteria Afrodite":{dateType:'romantic-dinner',vibe:'casual',price:2},
    "Taverna Trastevere Milano":{dateType:'romantic-dinner',vibe:'casual',price:2},
    "Osteria la Carbonaia Milano":{dateType:'romantic-dinner',vibe:'casual',price:2},
    "Hostaria Terza Carboniaia Milano":{dateType:'romantic-dinner',vibe:'casual',price:2},
    "Ristorante la Brisa Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Locanda Perbellini Bistrot Milano":{dateType:'romantic-dinner',vibe:'classic',price:4},
    "Dal Bolognese Milano":{dateType:'romantic-dinner',vibe:'classic',price:4},
    "Il Salumaio di Montenapoleone":{dateType:'romantic-dinner',vibe:'classic',price:4},
    "Paper Moon Giardino Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Ribot restaurant Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Al Cortile Milano":{dateType:'romantic-dinner',vibe:'romantic',price:3},
    "Al Fresco Milano":{dateType:'casual-lunch',vibe:'casual',price:3},
    "Casa Fiori Chiari Milano":{dateType:'romantic-dinner',vibe:'romantic',price:3},
    "Beefbar Milano":{dateType:'romantic-dinner',vibe:'classic',price:4},
    "Moebius Milano":{dateType:'romantic-dinner',vibe:'classic',price:4},
    "Waby Ristorante":{dateType:'romantic-dinner',vibe:'romantic',price:3},
    "Eutopia":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Veramente":{dateType:'romantic-dinner',vibe:'casual',price:3},
    "SAN Milano":{dateType:'romantic-dinner',vibe:'classic',price:4},
    "Iter Milano":{dateType:'romantic-dinner',vibe:'classic',price:4},
    "Chateau Dufan Milano":{dateType:'romantic-dinner',vibe:'festive',price:3},
    "Flow Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Lacerba Milano":{dateType:'romantic-dinner',vibe:'classic',price:3},
    "Rumore Milano":{dateType:'cocktail-bar',vibe:'festive',price:2},
    "Langosteria bar Milano":{dateType:'cocktail-bar',vibe:'classic',price:4},
    "El Porteno Prohibido Milano":{dateType:'casual-lunch',vibe:'casual',price:2},
    "Serra di Quartiere Milano":{dateType:'casual-lunch',vibe:'casual',price:2},
};

// Verified-safe Wikipedia images (filename actually depicts the place)
const VERIFIED_WIKI = {
    "Fondazione Prada": true,
    "Pinacoteca di Brera": true,
    "Teatro alla Scala Milano": true,
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const slugify = (s) => s.toLowerCase().replace(/\n/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function displayName(query) {
    if (DISPLAY_NAMES[query]) return DISPLAY_NAMES[query];
    return query.toUpperCase().replace(/\s+MILANO?$/i, '').trim();
}

async function nominatim(query) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (!res.ok) return null;
    const arr = await res.json();
    if (!arr.length) return null;
    const d = arr[0];
    const a = d.address || {};
    return { lat: parseFloat(d.lat), lon: parseFloat(d.lon),
        neighborhood: a.neighbourhood || a.suburb || a.city_district || a.quarter || '',
        city: a.city || a.town || 'Milano' };
}

async function wikipedia(placeName) {
    try {
        const sRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(placeName + ' Milan')}&format=json&srlimit=3`,
            { headers: { 'User-Agent': UA } });
        if (!sRes.ok) return null;
        const results = (await sRes.json())?.query?.search || [];
        if (!results.length) return null;
        const stem = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/o$|a$|e$|i$/g, '');
        const nameWords = placeName.split(/\s+/).map(stem).filter(w => w.length > 3);
        const match = results.find(r => {
            const titleStems = r.title.split(/\s+/).map(stem);
            const snippet = (r.snippet || '').toLowerCase();
            return nameWords.some(w => titleStems.some(t => t.includes(w) || w.includes(t))) &&
                   (/milan/i.test(r.title) || /milan/i.test(snippet));
        });
        if (!match) return null;
        const pRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&pithumbsize=2000&exintro=1&explaintext=1&titles=${encodeURIComponent(match.title)}&format=json`,
            { headers: { 'User-Agent': UA } });
        if (!pRes.ok) return null;
        const page = Object.values((await pRes.json())?.query?.pages || {})[0] || {};
        return { image: page.thumbnail?.source || null, extract: page.extract || null };
    } catch { return null; }
}

function trimDesc(extract) {
    if (!extract) return '';
    const cleaned = extract.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
    const sentences = cleaned.split(/(?<=[.!?])\s+/);
    let out = sentences[0] || '';
    if (out.length < 120 && sentences[1]) out += ' ' + sentences[1];
    if (out.length > 260) out = out.slice(0, 257).replace(/\s+\S*$/, '') + '...';
    return out;
}

const existing = JSON.parse(fs.readFileSync(SPOTS_PATH, 'utf8'));
const existingIds = new Set(existing.map(s => s.id));
const added = [];
const withImage = [];
const withoutImage = [];

for (let i = 0; i < NEW_PLACES.length; i++) {
    const query = NEW_PLACES[i];
    const display = displayName(query);
    const id = slugify(display);
    if (existingIds.has(id)) { process.stderr.write(`[${i+1}/${NEW_PLACES.length}] ${query} (exists, skip)\n`); continue; }
    process.stderr.write(`[${i+1}/${NEW_PLACES.length}] ${query}... `);
    const geo = await nominatim(query + ', Italia');
    await sleep(1100);
    let wiki = null;
    if (VERIFIED_WIKI[query]) wiki = await wikipedia(query);
    const hint = TYPE_HINTS[query] || {};
    const hoodEn = geo?.neighborhood ? `${geo.neighborhood}, Milan` : 'Milan';
    const hoodIt = geo?.neighborhood ? `${geo.neighborhood}, Milano` : 'Milano';
    const mapsUrl = geo
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&ll=${geo.lat},${geo.lon}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    const spot = {
        id, name: display,
        neighborhood: { en: hoodEn, it: hoodIt },
        description: { en: trimDesc(wiki?.extract), it: '' },
        heroImage: wiki?.image || '',
        heroAlt: display.replace(/\n/g, ' '),
        heroPosition: 'center center',
        mapsUrl,
        dateType: hint.dateType || 'romantic-dinner',
        vibe: hint.vibe || 'casual',
        priceRange: hint.price || 2,
        lat: geo?.lat ?? null,
        lon: geo?.lon ?? null,
    };
    added.push(spot);
    existingIds.add(id);
    if (spot.heroImage) { withImage.push(display.replace(/\n/g, ' ')); process.stderr.write(`OK (with image)\n`); }
    else if (geo) { withoutImage.push(display.replace(/\n/g, ' ')); process.stderr.write(`OK\n`); }
    else { withoutImage.push(display.replace(/\n/g, ' ') + ' [NO GEO]'); process.stderr.write(`NO GEO\n`); }
}

const merged = [...existing, ...added];
fs.writeFileSync(SPOTS_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf8');
console.log(`\nAdded ${added.length}, total ${merged.length}`);
console.log(`With verified image (${withImage.length}): ${withImage.join(', ')}`);
console.log(`\nNeed image via admin: ${withoutImage.length}`);
