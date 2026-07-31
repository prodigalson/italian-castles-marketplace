#!/usr/bin/env node
// Fetch real hero photos for every spot missing heroImage, using Google Places API (New).
// Uses text search with location bias if we have coords. Stores the public CDN URL
// returned by skipHttpRedirect=true (no API key exposed in spots.json).

import fs from 'fs';
import path from 'path';

const KEY = process.env.GOOGLE_PLACES_KEY;
if (!KEY) { console.error('GOOGLE_PLACES_KEY not set'); process.exit(1); }
const SPOTS = path.resolve('data/spots.json');
const MILAN_CENTER = { lat: 45.4642, lon: 9.1916 };
const SEARCH_RADIUS_M = 20000;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function searchPlace(name, lat, lon) {
    const body = {
        textQuery: `${name.replace(/\n/g, ' ')} Milan`,
        maxResultCount: 1,
        locationBias: {
            circle: {
                center: { latitude: lat || MILAN_CENTER.lat, longitude: lon || MILAN_CENTER.lon },
                radius: SEARCH_RADIUS_M,
            },
        },
    };
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.photos,places.formattedAddress,places.googleMapsUri',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`searchText ${res.status}: ${txt.slice(0, 200)}`);
    }
    const data = await res.json();
    return (data.places || [])[0] || null;
}

async function resolvePhotoUri(photoName) {
    const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1600&skipHttpRedirect=true&key=${KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.photoUri || null;
}

const spots = JSON.parse(fs.readFileSync(SPOTS, 'utf8'));
const missing = spots.filter(s => !s.heroImage);
console.log(`Processing ${missing.length} spots without heroImage...\n`);

let updated = 0;
let failed = [];
let noPhotos = [];

for (let i = 0; i < missing.length; i++) {
    const spot = missing[i];
    const display = spot.name.replace(/\n/g, ' ');
    process.stderr.write(`[${i+1}/${missing.length}] ${display}... `);

    try {
        const place = await searchPlace(spot.name, spot.lat, spot.lon);
        if (!place) { failed.push(display + ' (no match)'); process.stderr.write('NO MATCH\n'); await sleep(200); continue; }
        if (!place.photos || place.photos.length === 0) { noPhotos.push(display); process.stderr.write('NO PHOTOS\n'); await sleep(200); continue; }

        const uri = await resolvePhotoUri(place.photos[0].name);
        if (!uri) { failed.push(display + ' (photo resolve failed)'); process.stderr.write('RESOLVE FAIL\n'); await sleep(200); continue; }

        // Update the real spots array
        const real = spots.find(s => s.id === spot.id);
        real.heroImage = uri;
        real.heroAlt = display;
        // Also tighten the mapsUrl to the authoritative Google place URL
        if (place.googleMapsUri) real.mapsUrl = place.googleMapsUri;
        // And update coords from the confirmed place
        if (place.location) {
            real.lat = place.location.latitude;
            real.lon = place.location.longitude;
        }
        updated++;
        process.stderr.write('OK\n');
    } catch (err) {
        failed.push(display + ' (' + err.message + ')');
        process.stderr.write(`ERR ${err.message.slice(0, 80)}\n`);
    }
    await sleep(150); // Be polite to Google's API
}

fs.writeFileSync(SPOTS, JSON.stringify(spots, null, 2) + '\n', 'utf8');

console.log(`\n=== SUMMARY ===`);
console.log(`Updated: ${updated}`);
console.log(`Still missing (no photos in Places): ${noPhotos.length}`);
console.log(`Errors: ${failed.length}`);
if (noPhotos.length) console.log('\nNo photos available:\n  ' + noPhotos.join('\n  '));
if (failed.length) console.log('\nFailures:\n  ' + failed.join('\n  '));
