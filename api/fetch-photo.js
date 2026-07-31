// Looks up a place via Google Places (New) and returns up to 8 photo URLs.
// Requires ADMIN_PASSWORD to prevent randoms burning through the API quota.

const MAX_PHOTOS = 8;

function requireAuth(req) {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return 'Server missing ADMIN_PASSWORD';
    if (req.headers['x-admin-password'] !== expected) return 'Unauthorized';
    return null;
}

// Point at our own proxy rather than the photoUri Google hands back. That URI is
// signed and expires after a few weeks, which is how every hero image in spots.json
// ended up broken -- twice. /api/photo re-resolves from the stable name on demand.
// v=2 marks the current proxy output size; keep in sync with select-best-photos.mjs.
function proxyUrl(photoName) {
    return `/api/photo?name=${encodeURIComponent(photoName)}&v=2`;
}

// Places has no per-photo ratings, so rank by the best available proxy: resolution
// and aspect fit for the hero slot, tiebroken by Google's own ordering. Mirrors
// scripts/select-best-photos.mjs.
function photoScore(photo, index) {
    const w = photo.widthPx || 0;
    const h = photo.heightPx || 0;
    if (!w || !h) return 0;
    const res = Math.min(h, 2400) / 2400;
    const aspect = w / h;
    const fit = aspect >= 0.9 && aspect <= 1.9 ? 1.0
        : aspect >= 0.7 && aspect <= 2.6 ? 0.75
        : 0.4;
    return res * fit + (10 - Math.min(index, 9)) * 0.01;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const authErr = requireAuth(req);
    if (authErr) return res.status(401).json({ error: authErr });

    const key = process.env.GOOGLE_PLACES_KEY;
    if (!key) return res.status(500).json({ error: 'GOOGLE_PLACES_KEY not configured' });

    const { query, lat, lon, city } = req.body || {};
    if (!query) return res.status(400).json({ error: 'query required' });

    const CITY_BIAS = {
        milan: { hint: 'Milan', lat: 45.4642, lon: 9.1916 },
        rio:   { hint: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
        paris: { hint: 'Paris', lat: 48.8566, lon: 2.3522 },
        tokyo: { hint: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    };
    const bias = CITY_BIAS[city] || CITY_BIAS.milan;

    try {
        const body = {
            textQuery: String(query).replace(/\n/g, ' ') + ' ' + bias.hint,
            maxResultCount: 1,
            locationBias: {
                circle: {
                    center: { latitude: Number(lat) || bias.lat, longitude: Number(lon) || bias.lon },
                    radius: 20000,
                },
            },
        };
        const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': key,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.photos,places.formattedAddress,places.googleMapsUri',
            },
            body: JSON.stringify(body),
        });
        if (!r.ok) {
            const txt = await r.text();
            return res.status(502).json({ error: `Places API ${r.status}`, detail: txt.slice(0, 200) });
        }
        const data = await r.json();
        const place = (data.places || [])[0];
        if (!place) return res.status(404).json({ error: 'No place matched' });
        if (!place.photos || !place.photos.length) {
            return res.status(200).json({
                heroImage: '',
                heroImages: [],
                matched: place.displayName?.text,
                noPhoto: true,
            });
        }

        // No /media calls needed here any more -- the proxy resolves lazily, so the
        // picker costs one search instead of one search plus eight photo lookups.
        // Best-scoring photo first, so the default pick is the strongest one.
        const photoNames = place.photos
            .map((p, i) => ({ name: p.name, s: photoScore(p, i) }))
            .sort((a, b) => b.s - a.s)
            .slice(0, MAX_PHOTOS)
            .map(p => p.name);
        const heroImages = photoNames.map(proxyUrl);

        return res.status(200).json({
            heroImage: heroImages[0] || '',
            heroImages,
            photoNames,
            placeId: place.id,
            matched: place.displayName?.text,
            mapsUrl: place.googleMapsUri || null,
            lat: place.location?.latitude ?? null,
            lon: place.location?.longitude ?? null,
        });
    } catch (err) {
        return res.status(500).json({ error: String(err.message || err) });
    }
}
