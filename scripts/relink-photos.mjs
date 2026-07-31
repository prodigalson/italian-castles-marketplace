#!/usr/bin/env node
// One-time migration off expiring Google photo URLs.
//
// spots.json used to store the signed lh3.googleusercontent.com URL that Places
// returns from /media?skipHttpRedirect=true. Those expire, which is why every hero
// image has broken twice now. This rewrites each Google-hosted heroImage to point at
// /api/photo, which resolves the stable photo resource name on demand.
//
// Images from hosts that don't expire (Wikimedia et al) get downloaded and self-hosted
// under public/photos/ instead -- no API dependency needed for those.
//
// Safe to re-run: spots already migrated are skipped.
//
//   GOOGLE_PLACES_KEY=... node scripts/relink-photos.mjs [--dry-run] [--limit N]

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const KEY = process.env.GOOGLE_PLACES_KEY;
if (!KEY) { console.error('GOOGLE_PLACES_KEY not set'); process.exit(1); }

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = (() => {
    const i = process.argv.indexOf('--limit');
    return i > -1 ? parseInt(process.argv[i + 1], 10) : Infinity;
})();
const SPOTS = path.resolve('data/spots.json');
const PHOTO_DIR = path.resolve('public/photos');

const CONCURRENCY = 4;
const IMAGE_WIDTH = 1400;
const WEBP_QUALITY = 78;

// Sanity-check matches against the declared city, NOT against the stored lat/lon.
// A chunk of the Paris and Tokyo spots carry Milan coordinates -- the original
// fetch-photos.mjs hardcoded a Milan bias for every city -- so the stored coords are
// not trustworthy, while `city` is curated. Anything landing outside its city radius
// is a genuinely wrong venue.
const MAX_CITY_RADIUS_KM = 60;

const CITY = {
    milan:  { hint: 'Milan',          lat: 45.4642,   lon: 9.1916 },
    rio:    { hint: 'Rio de Janeiro', lat: -22.9068,  lon: -43.1729 },
    paris:  { hint: 'Paris',          lat: 48.8566,   lon: 2.3522 },
    tokyo:  { hint: 'Tokyo',          lat: 35.6762,   lon: 139.6503 },
};

const isGoogleHosted = (url) => /googleusercontent\.com/.test(url || '');
// Either destination counts as done: a downloaded file, or a proxied photo name.
const isLocal = (url) => (url || '').startsWith('/photos/') || (url || '').startsWith('/api/photo');
const clean = (s) => String(s || '').replace(/\n/g, ' ').trim();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Places and Wikimedia both rate-limit under concurrency; a bare fetch failure here
// is usually transient, so back off rather than marking the spot broken.
async function fetchRetry(url, init = {}, attempts = 3) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
        try {
            const res = await fetch(url, init);
            if (res.status === 429 || res.status >= 500) {
                lastErr = new Error(`HTTP ${res.status}`);
            } else {
                return res;
            }
        } catch (err) {
            lastErr = err;
        }
        await sleep(600 * 2 ** i);
    }
    throw lastErr;
}

function haversineKm(a, b, c, d) {
    const R = 6371, toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(c - a), dLon = toRad(d - b);
    const h = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

async function searchPlace(spot) {
    const bias = CITY[spot.city] || CITY.milan;

    // Only trust the stored coords to bias the search if they actually sit in the
    // right city -- biasing a Paris lookup at Milan coords is how you get a Milan bar.
    const stored = Number(spot.lat) && Number(spot.lon)
        ? haversineKm(bias.lat, bias.lon, Number(spot.lat), Number(spot.lon))
        : Infinity;
    const center = stored <= MAX_CITY_RADIUS_KM
        ? { latitude: Number(spot.lat), longitude: Number(spot.lon) }
        : { latitude: bias.lat, longitude: bias.lon };

    const body = {
        textQuery: `${clean(spot.name)} ${bias.hint}`,
        maxResultCount: 1,
        locationBias: { circle: { center, radius: 20000 } },
    };
    const res = await fetchRetry('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.photos,places.googleMapsUri',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`searchText ${res.status}: ${(await res.text()).slice(0, 120)}`);
    return (await res.json()).places?.[0] || null;
}

async function selfHost(spot) {
    const res = await fetchRetry(spot.heroImage, { headers: { 'User-Agent': 'amodoveandiamo/1.0 (contact: site admin)' } });
    if (!res.ok) throw new Error(`download ${res.status}`);
    const input = Buffer.from(await res.arrayBuffer());
    const out = path.join(PHOTO_DIR, `${spot.id}.webp`);
    if (!DRY_RUN) {
        fs.mkdirSync(PHOTO_DIR, { recursive: true });
        await sharp(input)
            .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY })
            .toFile(out);
    }
    return `/photos/${spot.id}.webp`;
}

const spots = JSON.parse(fs.readFileSync(SPOTS, 'utf8'));

const results = { migrated: 0, selfHosted: 0, skipped: 0, review: [], failed: [] };

async function processSpot(spot) {
    const label = clean(spot.name);

    if (isLocal(spot.heroImage)) { results.skipped++; return; }

    // Non-Google hosts don't expire -- pull those down once and be done.
    if (spot.heroImage && !isGoogleHosted(spot.heroImage)) {
        try {
            spot.heroImage = await selfHost(spot);
            results.selfHosted++;
            process.stderr.write(`  self-hosted  ${label}\n`);
        } catch (err) {
            results.failed.push(`${label} (self-host: ${err.message})`);
            process.stderr.write(`  FAIL         ${label} -- ${err.message}\n`);
        }
        return;
    }

    try {
        const place = await searchPlace(spot);
        if (!place) {
            results.review.push(`${label} -- no Places match`);
            process.stderr.write(`  NO MATCH     ${label}\n`);
            return;
        }
        if (!place.photos?.length) {
            results.review.push(`${label} -- matched "${clean(place.displayName?.text)}" but it has no photos`);
            process.stderr.write(`  NO PHOTOS    ${label}\n`);
            return;
        }

        const bias = CITY[spot.city] || CITY.milan;
        if (place.location) {
            const fromCity = haversineKm(
                bias.lat, bias.lon, place.location.latitude, place.location.longitude
            );
            if (fromCity > MAX_CITY_RADIUS_KM) {
                results.review.push(
                    `${label} (${spot.city}) -- matched "${clean(place.displayName?.text)}" ` +
                    `${fromCity.toFixed(0)}km from the city centre, left unchanged`
                );
                process.stderr.write(`  OFF-CITY ${fromCity.toFixed(0)}km  ${label}\n`);
                return;
            }
        }

        // Keep the stable identifiers so a future refresh never needs a text search.
        spot.placeId = place.id;
        spot.photoName = place.photos[0].name;
        spot.heroImage = `/api/photo?name=${encodeURIComponent(place.photos[0].name)}`;
        spot.heroAlt = spot.heroAlt || label;
        if (place.googleMapsUri) spot.mapsUrl = place.googleMapsUri;
        if (place.location) {
            spot.lat = place.location.latitude;
            spot.lon = place.location.longitude;
        }
        results.migrated++;
        process.stderr.write(`  ok           ${label}\n`);
    } catch (err) {
        results.failed.push(`${label} (${err.message})`);
        process.stderr.write(`  FAIL         ${label} -- ${err.message}\n`);
    }
}

// Simple worker pool -- Places rate-limits aggressive parallelism.
const queue = spots.filter((s) => !isLocal(s.heroImage)).slice(0, LIMIT);
console.error(`Processing ${queue.length} spots${DRY_RUN ? ' (dry run)' : ''}...\n`);
await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length) await processSpot(queue.shift());
    })
);

if (!DRY_RUN) fs.writeFileSync(SPOTS, JSON.stringify(spots, null, 2) + '\n', 'utf8');

console.log(`\n=== SUMMARY ===`);
console.log(`Migrated to /api/photo: ${results.migrated}`);
console.log(`Self-hosted:            ${results.selfHosted}`);
console.log(`Already migrated:       ${results.skipped}`);
console.log(`Needs review:           ${results.review.length}`);
console.log(`Failed:                 ${results.failed.length}`);
if (results.review.length) console.log(`\nNeeds review:\n  ` + results.review.join('\n  '));
if (results.failed.length) console.log(`\nFailed:\n  ` + results.failed.join('\n  '));
