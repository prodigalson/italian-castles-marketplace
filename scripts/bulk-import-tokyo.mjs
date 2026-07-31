#!/usr/bin/env node
// Bulk import Tokyo places via Google Places (New).
// 1. Text search biased to Tokyo
// 2. Pull first photo, googleMapsUri, coords, formattedAddress
// 3. Merge with curated metadata below (English descriptions; other langs fall back)

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

const TOKYO = { lat: 35.6762, lon: 139.6503, radius: 25000 };

// Display name -> { name (display, with optional \n for line break), dateType, vibe, price, desc }
// desc is English only; it/pt/fr will fall back via spot.description[lang] || spot.description.en.
const PLACES = [
    { q: 'Matsuya Ginza department store', name: 'MATSUYA\nGINZA', dateType: 'cultural', vibe: 'classic', price: 3,
      desc: "A Ginza department store with a basement food hall worth a slow loop. Browse the depachika together, pick out two bento, and eat them in the rooftop garden." },
    { q: 'Yayoi Kusama Museum Tokyo', name: 'YAYOI KUSAMA\nMUSEUM', dateType: 'cultural', vibe: 'classic', price: 2,
      desc: "Five floors devoted to one of the most photographed artists alive. Tickets are timed and sell out: book the late slot and end the afternoon in the Infinity Room." },
    { q: 'Mensho ramen Tokyo', name: 'MENSHO', dateType: 'casual-lunch', vibe: 'casual', price: 2,
      desc: "Tomoharu Shono's lamb-bone ramen shop in Korakuen. There will be a line; it moves. Order the Lamb Shoyu and watch them pull the noodles behind the counter." },
    { q: 'Sada Juro tempura Tokyo', name: 'SADA JURO', dateType: 'romantic-dinner', vibe: 'classic', price: 4,
      desc: "An intimate counter where each piece of tempura lands in front of you the moment it leaves the oil. Eight seats, one chef, one rhythm." },
    { q: 'Ota Memorial Museum of Art Tokyo', name: 'OTA MEMORIAL\nMUSEUM OF ART', dateType: 'cultural', vibe: 'classic', price: 1,
      desc: "A small museum dedicated entirely to ukiyo-e woodblock prints. Slippers, tatami corners, the kind of quiet that lets you actually look at a Hokusai." },
    { q: 'Common Aoyama Tokyo', name: 'COMMON', dateType: 'coffee-pastry', vibe: 'casual', price: 2,
      desc: "A clean Aoyama corner for specialty coffee and a small bite. Sit by the window, share a slice, watch the side street." },
    { q: 'Hamarikyu Gardens Tokyo', name: 'HAMARIKYU\nGARDENS', dateType: 'outdoor', vibe: 'romantic', price: 1,
      desc: "A former shogun's duck-hunting grounds folded inside the city. Walk the salt-water ponds, then take green tea in the floating tea house on the lake." },
    { q: 'Sushizanmai Tokyo', name: 'SUSHIZANMAI', dateType: 'casual-lunch', vibe: 'casual', price: 2,
      desc: "The friendly all-night sushi chain run by Mr. Tuna himself. Sit at the counter, point at the case, order the chutoro, and don't overthink it." },
    { q: 'Matsubaya Saryo wagashi tea Tokyo', name: 'MATSUBAYA\nSARYO', dateType: 'coffee-pastry', vibe: 'classic', price: 2,
      desc: "A wagashi tea room where the sweets are sculpted to the season. Order the matcha set and an anmitsu and slow the afternoon down by a full gear." },
    { q: 'Idemitsu Museum of Arts Tokyo', name: 'IDEMITSU\nMUSEUM OF ARTS', dateType: 'cultural', vibe: 'classic', price: 2,
      desc: "Tucked into the Teigeki Building with a long quiet view over the Imperial Palace moat. Ceramics, calligraphy, and one of the great tea-bowl collections in the world." },
    { q: 'Mori Art Museum Roppongi Tokyo', name: 'MORI\nART MUSEUM', dateType: 'cultural', vibe: 'classic', price: 3,
      desc: "On the 53rd floor of Roppongi Hills. Contemporary shows that consistently land, plus a Tokyo skyline that turns to neon during your visit." },
    { q: 'Roppongi Hills Tokyo', name: 'ROPPONGI\nHILLS', dateType: 'outdoor', vibe: 'classic', price: 2,
      desc: "The original 'city within a city' complex. Walk the plaza past the Maman spider, ride up to the Sky Deck at golden hour, end with a cocktail somewhere on Keyakizaka." },
    { q: 'Chanoha Ginza Itoen Tokyo', name: 'CHANOHA', dateType: 'coffee-pastry', vibe: 'classic', price: 2,
      desc: "Itoen's Ginza tea salon. A short menu of single-estate matcha and seasonal wagashi, served in real ceramics, with no rush at all." },
    { q: "THINK'A SAKE & COFFEE Tokyo", name: "THINK'A\nSAKE & COFFEE", dateType: 'cocktail-bar', vibe: 'casual', price: 2,
      desc: "Specialty coffee by day, a serious sake list by night, in the same small room with the same small staff. Ideal handoff between an afternoon and a date." },
    { q: 'Imperial Palace East National Gardens Tokyo', name: 'IMPERIAL PALACE\nEAST GARDENS', dateType: 'outdoor', vibe: 'classic', price: 1,
      desc: "The former Edo Castle keep and its surrounding gardens, free and open most days. Stone foundations, plum groves, a wide lawn that feels impossible in central Tokyo." },
    { q: 'ROAR COFFEE Tokyo Ginza', name: 'ROAR COFFEE\nGINZA', dateType: 'coffee-pastry', vibe: 'casual', price: 2,
      desc: "A tiny Ginza counter where the barista takes the espresso shot personally. Stand at the window with two cortados and watch the salarymen go by." },
    { q: 'Harenochi Katsu tonkatsu Tokyo', name: 'HARENOCHI\nKATSU', dateType: 'casual-lunch', vibe: 'casual', price: 2,
      desc: "A modern take on the tonkatsu set lunch: heritage pork, rice you can have refilled, cabbage with two house dressings. Bright room, no fuss." },
    { q: 'Karin Chinese Restaurant Hotel New Otani Tokyo', name: 'KARIN', dateType: 'romantic-dinner', vibe: 'classic', price: 4,
      desc: "Cantonese fine dining at Hotel New Otani with a private garden view. Crisp-skinned duck, attentive carts, the kind of dinner you remember the next morning." },
    { q: 'Hie Shrine Akasaka Tokyo', name: 'HIE\nSHRINE', dateType: 'cultural', vibe: 'classic', price: 1,
      desc: "Walk up the long red torii corridor that climbs the Akasaka hillside, then stand in the still courtyard at the top. Free, photogenic, oddly moving." },
    { q: 'teamLab Planets Toyosu Tokyo', name: 'TEAMLAB\nPLANETS', dateType: 'cultural', vibe: 'festive', price: 3,
      desc: "Walk barefoot through warm water, mirrored gardens, and rooms of floating light. Book the early slot, leave your socks at the entrance, surrender to it." },
    { q: 'Sushi Oshima Shinjuku Tokyo', name: 'SUSHI\nOSHIMA', dateType: 'romantic-dinner', vibe: 'classic', price: 3,
      desc: "A Kanazawa-style sushi counter in central Shinjuku. Sea bream, sweet shrimp, a proper omakase without the omakase price tag." },
    { q: 'Tajimaya Coffee Shinjuku Tokyo', name: 'TAJIMAYA\nCOFFEE', dateType: 'coffee-pastry', vibe: 'classic', price: 2,
      desc: "A 1969 Shinjuku kissaten that has not changed. Dark wood, smoke, a siphon coffee that takes its time, and a slice of cheesecake at the corner table." },
    { q: 'Daimaru Tokyo department store', name: 'DAIMARU\nTOKYO', dateType: 'cultural', vibe: 'casual', price: 2,
      desc: "The depachika beneath Tokyo Station. Hop through the bento counters, pick the prettiest packaging you can find, and eat in front of the brick facade." },
    { q: 'Nakamise-dori Street Asakusa Tokyo', name: 'NAKAMISE\nDORI', dateType: 'outdoor', vibe: 'festive', price: 1,
      desc: "The lantern-lined approach to Senso-ji, packed with grilled rice cakes, ningyo-yaki, and senbei. Walk it slowly, share everything you buy." },
    { q: 'Savoy Tomato and Cheese Azabujuban Tokyo', name: 'SAVOY\nTOMATO & CHEESE', dateType: 'casual-lunch', vibe: 'casual', price: 2,
      desc: "Tokyo's first true Neapolitan pizza counter, still doing two pies: marinara and margherita. Stand at the bar, split both." },
    { q: 'Coffee PUNKTO Tokyo', name: 'COFFEE\nPUNKTO', dateType: 'coffee-pastry', vibe: 'casual', price: 2,
      desc: "A minimal third-wave counter that takes the pour-over seriously without making a show of it. Two stools, a great filter coffee, an easy yes for a quiet morning." },
    { q: 'Shibuya Crossing Tokyo', name: 'SHIBUYA\nCROSSING', dateType: 'outdoor', vibe: 'festive', price: 1,
      desc: "The most famous intersection in the world. Walk it once at street level for the feeling, once from above (Starbucks or Mag's Park) for the photo." },
    { q: 'Meiji Jingu Shrine Tokyo', name: 'MEIJI\nJINGU', dateType: 'outdoor', vibe: 'classic', price: 1,
      desc: "A 170-acre forest in central Tokyo wrapped around the Meiji Shrine. Walk in under the wooden torii, leave the city sound behind, and don't talk much." },
    { q: 'Koffee Mameya Aoyama Tokyo', name: 'KOFFEE\nMAMEYA', dateType: 'coffee-pastry', vibe: 'classic', price: 2,
      desc: "An Aoyama coffee atelier with no tables and no menu. A barista in a white coat asks what you like, then chooses the bean. Quietly the best cup in the city." },
    { q: 'Gonpachi Nishi-Azabu Tokyo', name: 'GONPACHI\nNISHI-AZABU', dateType: 'romantic-dinner', vibe: 'festive', price: 3,
      desc: "The Kill Bill izakaya, on three theatrical wooden floors. Order the soba, the grilled skewers, and one too many sakes." },
    { q: 'Akihabara Electric Town Tokyo', name: 'AKIHABARA', dateType: 'outdoor', vibe: 'festive', price: 1,
      desc: "Eight blocks of arcades, anime megastores, retro game basements, and tiny tool shops. Lose two hours together and don't try to plan it." },
    { q: 'Tokyo National Museum Ueno Tokyo', name: 'TOKYO\nNATIONAL MUSEUM', dateType: 'cultural', vibe: 'classic', price: 2,
      desc: "The country's oldest and largest museum, in a leafy corner of Ueno Park. Skip the lobbies, walk straight to the Honkan: katanas, ceramics, scrolls." },
    { q: 'Charcoal Roast Coffee RIN Tokyo', name: 'CHARCOAL ROAST\nCOFFEE RIN', dateType: 'coffee-pastry', vibe: 'classic', price: 2,
      desc: "A kissaten that roasts beans over binchotan charcoal. The result is smoky, deep, and unmistakable. Order the blend, neat." },
    { q: 'WARP SHINJUKU bar Tokyo', name: 'WARP\nSHINJUKU', dateType: 'cocktail-bar', vibe: 'festive', price: 3,
      desc: "An immersive Shinjuku bar that goes full sci-fi. Order something blue, sit on the spaceship side of the room, take exactly one photo and stop." },
    { q: 'Hacienda Del Cielo Daikanyama Tokyo', name: 'HACIENDA\nDEL CIELO', dateType: 'cocktail-bar', vibe: 'romantic', price: 3,
      desc: "A Daikanyama rooftop with cactus, low lanterns, and a long Mexican menu. Book the terrace, order a paloma, sit through sunset." },
    { q: 'Afuri Shinjuku Lumine Tokyo', name: 'AFURI\nSHINJUKU', dateType: 'casual-lunch', vibe: 'casual', price: 2,
      desc: "The yuzu-shio ramen that converted half the city. Clear, citrus-bright broth and chashu blowtorched to order. Buy the ticket, slurp the bowl, leave." },
    { q: 'Aoyama Flower Market Tea House Aoyama Tokyo', name: 'AOYAMA FLOWER\nMARKET TEA HOUSE', dateType: 'coffee-pastry', vibe: 'romantic', price: 2,
      desc: "A glass tea house grown out of the back of an Aoyama florist. Sit inside the greenhouse with rose tea and a fruit tart, surrounded by everything that's blooming." },
    { q: 'Tonkatsu Maisen Aoyama Main Store Tokyo', name: 'TONKATSU\nMAISEN', dateType: 'casual-lunch', vibe: 'classic', price: 2,
      desc: "An old bathhouse converted into Tokyo's most-loved tonkatsu set lunch. Order the kurobuta, take the rice refill, do not skip the cabbage." },
    { q: 'Shinjuku Golden Gai Tokyo', name: 'SHINJUKU\nGOLDEN GAI', dateType: 'cocktail-bar', vibe: 'festive', price: 2,
      desc: "Six tiny alleys, two hundred bars, six seats each. Pick the one with a sign you don't understand and step inside. Repeat twice." },
    { q: 'Nezu Museum Aoyama Tokyo', name: 'NEZU\nMUSEUM', dateType: 'cultural', vibe: 'classic', price: 2,
      desc: "A Kengo Kuma building hiding a private collection of Japanese and East Asian art, plus a hill garden behind it. End with matcha in the garden cafe." },
    { q: 'Shinobazu Pond Ueno Park Tokyo', name: 'SHINOBAZU\nPOND', dateType: 'outdoor', vibe: 'romantic', price: 1,
      desc: "Rent a swan boat, paddle through the lotus, walk the island shrine in the middle. In summer the entire pond turns into a leaf canopy." },
    { q: 'code name MIXOLOGY akasaka Tokyo', name: 'CODE NAME\nMIXOLOGY', dateType: 'cocktail-bar', vibe: 'romantic', price: 3,
      desc: "A serious Akasaka cocktail bar where the menu reads like a culinary one. Tell the bartender a flavor you love, then watch them build it." },
    { q: 'Temma Curry Aoyama Tokyo', name: 'TEMMA\nCURRY', dateType: 'casual-lunch', vibe: 'casual', price: 2,
      desc: "A small Aoyama spice-curry counter with a daily rotating plate. Order the lamb keema with the achar set; the seat by the window is best." },
    { q: "Harajuku Owl's Forest cafe Tokyo", name: "HARAJUKU\nOWL'S FOREST", dateType: 'cultural', vibe: 'festive', price: 2,
      desc: "A Harajuku animal cafe built around a small flock of owls and a few cats. Touch only with the back of a finger; tip the keeper; do not stay long." },
    { q: 'Ueno Onshi Park Tokyo', name: 'UENO\nPARK', dateType: 'outdoor', vibe: 'casual', price: 1,
      desc: "Tokyo's biggest park, gifted to the city by the emperor. Cherry trees in spring, museums on the edges, food carts on the paths, a zoo in the middle." },
    { q: 'SAVOY Azabujuban Tokyo', name: 'SAVOY\nAZABUJUBAN', dateType: 'romantic-dinner', vibe: 'romantic', price: 2,
      desc: "The original Savoy pizza counter in Azabujuban. Twelve seats, one wood-fired oven, two pies. Book by phone or eat at the bar." },
    { q: 'Fioria Roppongi Tokyo', name: 'FIORIA\nROPPONGI', dateType: 'romantic-dinner', vibe: 'romantic', price: 4,
      desc: "A glasshouse Italian terrace tucked into Roppongi Hills, full of bougainvillea and candles. Book the outdoor table and order the burrata." },
    { q: 'Sakurai Japanese Tea Experience Tokyo', name: 'SAKURAI\nTEA', dateType: 'coffee-pastry', vibe: 'classic', price: 3,
      desc: "A modern tea house in Spiral Building where Sakurai-san serves an omakase of single-origin teas. Quiet, sequential, completely worth the time." },
    { q: 'Cedros Tokyo restaurant', name: 'CEDROS', dateType: 'romantic-dinner', vibe: 'romantic', price: 3,
      desc: "A tucked-away kitchen with a short seasonal menu and a wine list curated by the chef herself. Small room, warm light, easy second visit." },
    { q: 'Saza Coffee Marunouchi Tokyo', name: 'SAZA\nCOFFEE', dateType: 'coffee-pastry', vibe: 'classic', price: 2,
      desc: "An Ibaraki roaster with a deep blend menu and a serious siphon bar. Marunouchi outpost is the calmest; order the Charles Special." },
    { q: 'Tableaux Daikanyama Tokyo', name: 'TABLEAUX', dateType: 'romantic-dinner', vibe: 'classic', price: 4,
      desc: "Velvet booths, dim sconces, an Italian-leaning menu that has been quietly excellent since the late 90s. The kind of place you take someone to keep them." },
    { q: 'Arisugawa-no-miya Memorial Park Hiroo Tokyo', name: 'ARISUGAWA\nPARK', dateType: 'outdoor', vibe: 'romantic', price: 1,
      desc: "A small hill park in Hiroo with a stream, a stone bridge, and a public library at the top. Bring a takeaway coffee from Common; stay an hour." },
    { q: 'Imperial Palace Tokyo', name: 'IMPERIAL\nPALACE', dateType: 'cultural', vibe: 'classic', price: 1,
      desc: "The Emperor's residence on the site of Edo Castle. Loop the outer moat path on foot or bike; sunset light on Nijubashi bridge is the photo." },
    { q: 'Jazz Bar Samurai Shinjuku Tokyo', name: 'JAZZ BAR\nSAMURAI', dateType: 'live-music', vibe: 'romantic', price: 2,
      desc: "A Shinjuku jazz kissa packed wall-to-wall with maneki-neko cats and a sound system that takes itself seriously. Order a whisky and shut up." },
    { q: 'Harajuku Gyoza Lou Tokyo', name: 'HARAJUKU\nGYOZA LOU', dateType: 'casual-lunch', vibe: 'casual', price: 1,
      desc: "Two-item menu: yaki or sui gyoza, by the order of six. Beer and cucumber on the side. Cheap, fast, the right move after a long day in Harajuku." },
    { q: 'Mugi to Olive ramen Ginza Tokyo', name: 'MUGI\nTO OLIVE', dateType: 'casual-lunch', vibe: 'casual', price: 2,
      desc: "A Michelin-Bib Ginza ramen counter known for its clam-and-olive-oil broth. Order the W-soba and arrive before noon or at 9pm." },
    { q: 'The National Art Center Tokyo Roppongi', name: 'THE NATIONAL\nART CENTER', dateType: 'cultural', vibe: 'classic', price: 2,
      desc: "Kisho Kurokawa's glass wave of a building in Roppongi. No permanent collection, only ambitious rotating shows. End at the cafe on the floating cone." },
    { q: 'Cafe Kitsune Aoyama Tokyo', name: 'CAFE\nKITSUNE', dateType: 'coffee-pastry', vibe: 'casual', price: 2,
      desc: "The Aoyama original of the Kitsune cafe chain, behind a wooden lattice in a quiet residential side street. Fox madeleine, latte, twenty minutes on the bench out front." },
    { q: 'Uogashi Nihon-Ichi standing sushi bar Tokyo', name: 'UOGASHI\nNIHON-ICHI', dateType: 'casual-lunch', vibe: 'casual', price: 2,
      desc: "A chain of standing sushi bars where the chef hands each piece directly to you over the counter. Fast, cheap for the quality, an actual Tokyo handshake." },
    { q: 'Miyota Italian Tokyo', name: 'MIYOTA', dateType: 'romantic-dinner', vibe: 'romantic', price: 3,
      desc: "A tiny chef's-counter Italian where everything is plated in front of you. Pasta course is the one to wait for." },
    { q: 'Yoyogi Park Tokyo', name: 'YOYOGI\nPARK', dateType: 'outdoor', vibe: 'casual', price: 1,
      desc: "The closest thing Tokyo has to a flat, free, all-day park. Picnics, dog runs, drum circles, cherry blossom in spring. Bring a blanket and a konbini lunch." },
];

function slugify(name) {
    return name
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/['"`«»·•]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
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
            textQuery: query + ' Tokyo',
            maxResultCount: 1,
            locationBias: { circle: { center: { latitude: TOKYO.lat, longitude: TOKYO.lon }, radius: TOKYO.radius } },
        }),
    });
    if (!r.ok) return null;
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
        const sub = components.find(c => c.types?.includes('sublocality_level_2'))
                || components.find(c => c.types?.includes('sublocality_level_1'))
                || components.find(c => c.types?.includes('sublocality'))
                || components.find(c => c.types?.includes('neighborhood'));
        if (sub) return (sub.longText || sub.shortText || '').replace(/^(Chiyoda|Chuo|Minato|Shinjuku|Shibuya|Toshima|Taito|Sumida)\s+City$/i, '');
    }
    if (!address) return '';
    // Tokyo addresses commonly read "..., Tokyo 100-0001" -- pull the ward name.
    const m = address.match(/,\s*([A-Za-z\- ]+?)\s+City\s*,\s*Tokyo/);
    if (m) return m[1].trim();
    return '';
}

async function run() {
    const spots = JSON.parse(fs.readFileSync(SPOTS_PATH, 'utf8'));
    const byId = new Map(spots.map(s => [s.id, s]));
    let added = 0, skipped = 0, failed = 0;

    for (let i = 0; i < PLACES.length; i++) {
        const p = PLACES[i];
        const baseId = slugify(p.name.replace(/\n/g, ' ')) + '-tokyo';
        let id = baseId, dup = 1;
        while (byId.has(id)) { dup++; id = `${baseId}-${dup}`; }

        process.stdout.write(`[${i+1}/${PLACES.length}] ${p.q} ... `);
        try {
            const place = await searchPlace(p.q);
            if (!place) { console.log('no match'); failed++; continue; }
            const photoRef = place.photos?.[0]?.name;
            const heroImage = photoRef ? (await resolvePhoto(photoRef)) : '';
            const hood = neighborhoodFromAddress(place.formattedAddress, place.addressComponents);
            const hoodLabel = hood ? `${hood}, Tokyo` : 'Tokyo';
            const spot = {
                id,
                city: 'tokyo',
                name: p.name,
                neighborhood: { en: hoodLabel, it: hoodLabel, pt: hoodLabel, fr: hoodLabel },
                description: { en: p.desc || '', it: '', pt: '', fr: '' },
                heroImage: heroImage || '',
                heroAlt: place.displayName?.text || p.name.replace(/\n/g, ' '),
                heroPosition: 'center center',
                mapsUrl: place.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.q)}`,
                dateType: p.dateType,
                vibe: p.vibe,
                priceRange: p.price,
                lat: place.location?.latitude ?? null,
                lon: place.location?.longitude ?? null,
            };
            spots.push(spot);
            byId.set(id, spot);
            added++;
            console.log('added', heroImage ? '(photo)' : '(no photo)', '|', hoodLabel);
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
