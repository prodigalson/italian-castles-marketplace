import { readFile } from 'node:fs/promises';
import listings from '../data/castle-listings.json' with { type: 'json' };
import { googlePlacesByListingId } from '../data/google-places.js';

const ids = new Set(listings.map(listing => listing.id));
for (const [listingId, place] of Object.entries(googlePlacesByListingId)) {
    if (!ids.has(listingId)) throw new Error(`Google Place mapping references missing listing: ${listingId}`);
    if (!place.query || !place.expectedName || !place.mapsUrl.startsWith('https://www.google.com/maps/')) {
        throw new Error(`Google Place mapping is incomplete: ${listingId}`);
    }
}

const [apiSource, travelSource, mainSource, terms, privacy] = await Promise.all([
    readFile('api/place-photo.js', 'utf8'),
    readFile('api/travel-access.js', 'utf8'),
    readFile('main.js', 'utf8'),
    readFile('terms.html', 'utf8'),
    readFile('privacy.html', 'utf8'),
]);

if (!apiSource.includes('GOOGLE_MAPS_API_KEY')
    || !apiSource.includes('VITE_GOOGLE_MAPS_API_KEY')
    || !apiSource.includes('VITE_GOOGLE_MAPS_API')) {
    throw new Error('Supported Places API environment variables are not kept server-side.');
}
if (!apiSource.includes('Cache-Control') || !apiSource.includes('no-store')) throw new Error('Places responses must not be cached.');
if (!apiSource.includes('placeConfigForListing') || !apiSource.includes('castle-listings.json')) {
    throw new Error('Google Places photo lookup must cover every inventory listing.');
}
if (!apiSource.includes('places.photos') || !apiSource.includes('choosePhoto(')) {
    throw new Error('Google Places ranked photos must be used for property imagery.');
}
if (apiSource.includes("source: 'outdoor'") || apiSource.includes("imageKind: 'outdoor-street-view'")) {
    throw new Error('The outdoor-only Street View restriction must remain disabled.');
}
for (const [file, source] of [['api/place-photo.js', apiSource], ['api/travel-access.js', travelSource]]) {
    if (!source.includes('if (!verified) return null;')) {
        throw new Error(`${file} must refuse to resolve a place for a listing with no verified mapping.`);
    }
}
if (apiSource.includes('|| searchPayload.places?.[0]') || travelSource.includes('|| payload.places?.[0]')) {
    throw new Error("Property lookups must not fall back to Google's first text-search result.");
}
if (!mainSource.includes('!listing.googlePlace?.verified')) {
    throw new Error('The client must not request Google imagery or travel distances for unverified listings.');
}
if (!mainSource.includes("textContent = 'Google Maps'")) throw new Error('Google Maps attribution is missing.');
if (!terms.includes('Google Maps Platform Terms of Service')) throw new Error('Terms do not incorporate Google Maps terms.');
if (!privacy.includes('Google Privacy Policy')) throw new Error('Privacy page does not reference Google privacy terms.');
if (!mainSource.includes("title: googlePlace?.expectedName")) throw new Error('Verified Google Place name is not used as the listing title.');

console.log(`Google Places configuration passed for all ${listings.length} listings (${Object.keys(googlePlacesByListingId).length} explicitly verified mapping).`);
