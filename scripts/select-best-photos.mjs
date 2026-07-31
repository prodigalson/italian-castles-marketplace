#!/usr/bin/env node
// Re-picks each spot's hero from all of its Google photos instead of blindly taking
// the first one.
//
// Places exposes no per-photo ratings, so "best" here is the best available proxy:
// resolution and how well the aspect ratio fits the hero slot, with Google's own
// ordering (their relevance ranking) as the tiebreak. This reliably rejects the
// thumbnail-sized and extreme-panorama shots that photos[0] sometimes is.
//
// Uses the placeId stored by relink-photos.mjs -- one Place Details call per spot,
// no text search. Also bumps the heroImage URL to v=2: the proxy's output size went
// up, and without a new URL the CDN would keep serving the old 1400px rendition for
// up to 30 days.
//
//   GOOGLE_PLACES_KEY=... node scripts/select-best-photos.mjs [--dry-run]

import fs from 'fs';
import path from 'path';

const KEY = process.env.GOOGLE_PLACES_KEY;
if (!KEY) { console.error('GOOGLE_PLACES_KEY not set'); process.exit(1); }

const DRY_RUN = process.argv.includes('--dry-run');
const SPOTS = path.resolve('data/spots.json');
const CONCURRENCY = 6;
const VERSION = 'v=2';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The hero slot is roughly square-to-landscape (half viewport wide, full height on
// desktop; full width, half height on mobile) with object-fit: cover. Height 2400
// matches what api/photo.js requests from Google, so anything taller adds nothing.
function score(photo, index) {
    const w = photo.widthPx || 0;
    const h = photo.heightPx || 0;
    if (!w || !h) return 0;

    const res = Math.min(h, 2400) / 2400;

    const aspect = w / h;
    let fit;
    if (aspect >= 0.9 && aspect <= 1.9) fit = 1.0;        // fills the slot cleanly
    else if (aspect >= 0.7 && aspect <= 2.6) fit = 0.75;  // workable with cropping
    else fit = 0.4;                                       // tall phone shot / panorama

    // Google's ordering reflects their own quality/relevance ranking -- use it to
    // break ties rather than letting array position decide arbitrarily.
    const rank = (10 - Math.min(index, 9)) * 0.01;

    return res * fit + rank;
}

async function fetchPhotos(placeId, attempts = 3) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
        try {
            const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
                headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'photos' },
            });
            if (res.status === 429 || res.status >= 500) {
                lastErr = new Error(`HTTP ${res.status}`);
                await sleep(800 * 2 ** i);
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return (await res.json()).photos || [];
        } catch (err) {
            lastErr = err;
            await sleep(800 * 2 ** i);
        }
    }
    throw lastErr;
}

const spots = JSON.parse(fs.readFileSync(SPOTS, 'utf8'));
const results = { switched: 0, kept: 0, skipped: 0, failed: [] };

async function processSpot(spot) {
    const label = spot.name.replace(/\n/g, ' ');
    if (!spot.placeId || !spot.heroImage?.startsWith('/api/photo')) {
        results.skipped++;
        return;
    }

    try {
        const photos = await fetchPhotos(spot.placeId);
        if (!photos.length) { results.skipped++; return; }

        const best = photos
            .map((p, i) => ({ p, i, s: score(p, i) }))
            .sort((a, b) => b.s - a.s)[0];

        const changed = best.p.name !== spot.photoName;
        spot.photoName = best.p.name;
        spot.heroImage = `/api/photo?name=${encodeURIComponent(best.p.name)}&${VERSION}`;

        if (changed) {
            results.switched++;
            process.stderr.write(`  switched (#${best.i + 1}/${photos.length}, ${best.p.widthPx}x${best.p.heightPx})  ${label}\n`);
        } else {
            results.kept++;
        }
    } catch (err) {
        results.failed.push(`${label} (${err.message})`);
        process.stderr.write(`  FAIL  ${label} -- ${err.message}\n`);
    }
}

const queue = [...spots];
console.error(`Scoring photos for ${queue.length} spots${DRY_RUN ? ' (dry run)' : ''}...\n`);
await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length) await processSpot(queue.shift());
    })
);

if (!DRY_RUN) fs.writeFileSync(SPOTS, JSON.stringify(spots, null, 2) + '\n', 'utf8');

console.log(`\n=== SUMMARY ===`);
console.log(`Switched to a better photo: ${results.switched}`);
console.log(`Kept photo (rebased to ${VERSION}): ${results.kept}`);
console.log(`Skipped (no placeId/photos): ${results.skipped}`);
console.log(`Failed: ${results.failed.length}`);
if (results.failed.length) console.log('\n  ' + results.failed.join('\n  '));
