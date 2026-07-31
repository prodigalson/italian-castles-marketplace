import { googlePlacesByListingId } from '../data/google-places.js';
import listings from '../data/castle-listings.json' with { type: 'json' };

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const listingsById = new Map(listings.map(listing => [listing.id, listing]));

function placeConfigForListing(listingId) {
    const verified = googlePlacesByListingId[listingId];
    if (verified) return { ...verified, verified: true };

    const listing = listingsById.get(listingId);
    if (!listing) return null;

    const query = [listing.canonical_title, listing.location?.display, 'Italy'].filter(Boolean).join(', ');
    return {
        query,
        expectedName: listing.canonical_title,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
        verified: false,
    };
}

function noStore(res) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('Vary', 'Accept-Encoding');
}

function choosePhoto(photos = []) {
    // Places returns photos in relevance order. Keep that ranking while preferring
    // the first landscape image so the catalogue can display it at full quality.
    return photos.find(photo => photo.widthPx >= photo.heightPx) || photos[0];
}

export default async function handler(req, res) {
    noStore(res);

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const listingId = Array.isArray(req.query.listingId) ? req.query.listingId[0] : req.query.listingId;
    const placeConfig = placeConfigForListing(listingId);
    if (!placeConfig) return res.status(404).json({ error: 'No inventory listing is configured for this request.' });

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
        || process.env.VITE_GOOGLE_MAPS_API_KEY
        || process.env.VITE_GOOGLE_MAPS_API;
    if (!apiKey) return res.status(503).json({ error: 'Google Places photos are not configured.' });

    try {
        const searchResponse = await fetch(SEARCH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.photos',
            },
            body: JSON.stringify({ textQuery: placeConfig.query, languageCode: 'en' }),
        });

        if (!searchResponse.ok) {
            return res.status(502).json({ error: 'Google Places search failed.' });
        }

        const searchPayload = await searchResponse.json();
        const place = placeConfig.verified
            ? searchPayload.places?.find(candidate => candidate.displayName?.text === placeConfig.expectedName) || searchPayload.places?.[0]
            : searchPayload.places?.[0];
        const photo = choosePhoto(place?.photos);
        if (!place || !photo) return res.status(404).json({ error: 'No Google Places photo is available for this place.' });

        const mediaResponse = await fetch(`https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=2400&maxHeightPx=1800&skipHttpRedirect=true`, {
            headers: { 'X-Goog-Api-Key': apiKey },
        });
        if (!mediaResponse.ok) return res.status(502).json({ error: 'Google Places photo lookup failed.' });

        const media = await mediaResponse.json();

        return res.status(200).json({
            photoUrl: media.photoUri,
            placeName: place.displayName?.text || placeConfig.expectedName,
            googleMapsUri: photo.googleMapsUri || place.googleMapsUri || placeConfig.mapsUrl,
        });
    } catch {
        return res.status(502).json({ error: 'Google Places is temporarily unavailable.' });
    }
}
