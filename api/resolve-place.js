const UA = 'AmoDoveAndiamo/1.0 (https://amodoveandiamo.vercel.app)';

const CITY_CONFIG = {
    milan: {
        label: 'Milan',
        labelIt: 'Milano',
        wikiHint: 'Milan',
        searchHint: 'Milan',
        wikiRegex: /milan/i,
        hoodSuffixRegex: /, Milan$/,
    },
    rio: {
        label: 'Rio de Janeiro',
        labelIt: 'Rio de Janeiro',
        wikiHint: 'Rio de Janeiro',
        searchHint: 'Rio de Janeiro',
        wikiRegex: /rio de janeiro|rio\b/i,
        hoodSuffixRegex: /, Rio de Janeiro$/,
    },
};

function cityCfg(city) {
    return CITY_CONFIG[city] || CITY_CONFIG.milan;
}

function requireAuth(req) {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return 'Server missing ADMIN_PASSWORD';
    if (req.headers['x-admin-password'] !== expected) return 'Unauthorized';
    return null;
}

async function resolveShortUrl(url) {
    if (!/goo\.gl|maps\.app\.goo\.gl/.test(url)) return url;
    try {
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        return res.url || url;
    } catch {
        return url;
    }
}

function parseMapsUrl(url) {
    const out = { name: null, lat: null, lon: null };
    const placeMatch = url.match(/\/place\/([^/@?]+)/);
    if (placeMatch) out.name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).trim();
    const coord =
        url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
        url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ||
        url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
        url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coord) { out.lat = parseFloat(coord[1]); out.lon = parseFloat(coord[2]); }
    if (!out.name) {
        const qMatch = url.match(/[?&]q=([^&]+)/);
        if (qMatch && !/^-?\d+\.\d+/.test(qMatch[1])) out.name = decodeURIComponent(qMatch[1].replace(/\+/g, ' ')).trim();
    }
    return out;
}

async function reverseGeocode(lat, lon, city) {
    const cfg = cityCfg(city);
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=16`,
            { headers: { 'User-Agent': UA, Accept: 'application/json' } });
        if (!res.ok) return null;
        const data = await res.json();
        const a = data.address || {};
        return {
            neighborhood: a.neighbourhood || a.suburb || a.city_district || a.quarter || a.district || '',
            city: a.city || a.town || a.village || cfg.label,
            displayName: data.display_name || '',
            name: data.name || null,
        };
    } catch { return null; }
}

async function searchNominatim(query, city) {
    const cfg = cityCfg(city);
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`,
            { headers: { 'User-Agent': UA, Accept: 'application/json' } });
        if (!res.ok) return null;
        const arr = await res.json();
        if (!arr.length) return null;
        const d = arr[0];
        const a = d.address || {};
        return {
            lat: parseFloat(d.lat), lon: parseFloat(d.lon),
            neighborhood: a.neighbourhood || a.suburb || a.city_district || a.quarter || '',
            city: a.city || a.town || cfg.label,
            displayName: d.display_name,
        };
    } catch { return null; }
}

async function wikipediaImage(placeName, city) {
    const cfg = cityCfg(city);
    try {
        const sRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(placeName + ' ' + cfg.wikiHint)}&format=json&srlimit=3`,
            { headers: { 'User-Agent': UA } });
        if (!sRes.ok) return null;
        const results = (await sRes.json())?.query?.search || [];
        if (!results.length) return null;
        const stem = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/o$|a$|e$|i$/g, '');
        const nameWords = placeName.split(/\s+/).map(stem).filter(w => w.length > 3);
        const match = results.find(r => {
            const titleStems = r.title.split(/\s+/).map(stem);
            const snippet = (r.snippet || '').toLowerCase();
            const overlap = nameWords.some(w => titleStems.some(t => t.includes(w) || w.includes(t)));
            const cityCtx = cfg.wikiRegex.test(r.title) || cfg.wikiRegex.test(snippet);
            return overlap && cityCtx;
        });
        if (!match) return null;
        const pRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&pithumbsize=2000&exintro=1&explaintext=1&titles=${encodeURIComponent(match.title)}&format=json`,
            { headers: { 'User-Agent': UA } });
        if (!pRes.ok) return null;
        const pData = await pRes.json();
        const page = Object.values(pData?.query?.pages || {})[0] || {};
        return { image: page.thumbnail?.source || null, extract: page.extract || null, title: page.title || null };
    } catch { return null; }
}

function trimDescription(extract) {
    if (!extract) return '';
    const cleaned = extract.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
    const sentences = cleaned.split(/(?<=[.!?])\s+/);
    let out = sentences[0] || '';
    if (out.length < 120 && sentences[1]) out += ' ' + sentences[1];
    if (out.length > 260) out = out.slice(0, 257).replace(/\s+\S*$/, '') + '...';
    return out;
}

function guessDateType(text) {
    const t = (text || '').toLowerCase();
    const rules = [
        [/\b(bar|cocktail|lounge|negroni|martini|speakeasy|enoteca)/, 'cocktail-bar'],
        [/\b(aperitivo|spritz)/, 'aperitivo'],
        [/\b(cafe|caffe|pasticceria|bakery|pastry|coffee|brioche|gelato)/, 'coffee-pastry'],
        [/\b(museum|museo|gallery|galleria|theater|theatre|teatro|opera|exhibition|mostra|duomo|castello|palazzo)/, 'cultural'],
        [/\b(park|parco|garden|giardino|rooftop|terrazza|piazza|navigli|canal)/, 'outdoor'],
        [/\b(club|dj|live|concert|music|jazz|dance)/, 'live-music'],
        [/\b(trattoria|osteria|restaurant|ristorante|pizzeria|dinner|fine dining)/, 'romantic-dinner'],
        [/\b(lunch|pranzo|deli|panini|bistrot|bistro)/, 'casual-lunch'],
    ];
    for (const [re, type] of rules) if (re.test(t)) return type;
    return 'romantic-dinner';
}

function guessVibe(dateType, text) {
    const t = (text || '').toLowerCase();
    if (/\b(romantic|candle|intimate|cozy)/.test(t)) return 'romantic';
    if (/\b(club|dj|live|dance|party)/.test(t)) return 'festive';
    if (/\b(historic|classic|traditional|1\d{3}|iconic)/.test(t)) return 'classic';
    if (dateType === 'romantic-dinner') return 'romantic';
    if (dateType === 'live-music') return 'festive';
    if (dateType === 'cultural' || dateType === 'coffee-pastry') return 'classic';
    return 'casual';
}

function slugify(s) {
    return (s || '').toLowerCase().replace(/\n/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const authErr = requireAuth(req);
    if (authErr) return res.status(401).json({ error: authErr });
    const { url, city: cityKey } = req.body || {};
    if (!url) return res.status(400).json({ error: 'url required' });
    const city = CITY_CONFIG[cityKey] ? cityKey : 'milan';
    const cfg = cityCfg(city);
    try {
        const finalUrl = await resolveShortUrl(url.trim());
        const parsed = parseMapsUrl(finalUrl);
        let geo = null;
        if (parsed.lat && parsed.lon) geo = await reverseGeocode(parsed.lat, parsed.lon, city);
        else if (parsed.name) { geo = await searchNominatim(parsed.name + ' ' + cfg.searchHint, city); if (geo) { parsed.lat = geo.lat; parsed.lon = geo.lon; } }
        const name = parsed.name || geo?.name || 'UNNAMED SPOT';
        const wiki = await wikipediaImage(name, city);
        const descSeed = [name, wiki?.extract, geo?.displayName].filter(Boolean).join(' ');
        const dateType = guessDateType(descSeed);
        const vibe = guessVibe(dateType, descSeed);
        const cityLabel = geo?.city || cfg.label;
        const hoodEn = geo?.neighborhood ? `${geo.neighborhood}, ${cityLabel}` : cityLabel;
        const hoodIt = hoodEn.replace(cfg.hoodSuffixRegex, `, ${cfg.labelIt}`);
        const description = trimDescription(wiki?.extract);
        return res.status(200).json({
            id: slugify(name),
            city,
            name: name.toUpperCase(),
            neighborhood: { en: hoodEn, it: hoodIt },
            description: { en: description, it: '' },
            heroImage: wiki?.image || '',
            heroAlt: name,
            heroPosition: 'center center',
            mapsUrl: finalUrl,
            dateType, vibe, priceRange: 2,
            lat: parsed.lat, lon: parsed.lon,
            _sources: {
                parsedFromUrl: { name: parsed.name, lat: parsed.lat, lon: parsed.lon },
                nominatim: geo,
                wikipedia: wiki ? { title: wiki.title, hasImage: !!wiki.image, hasExtract: !!wiki.extract } : null,
            },
        });
    } catch (err) {
        return res.status(500).json({ error: String(err.message || err) });
    }
}
