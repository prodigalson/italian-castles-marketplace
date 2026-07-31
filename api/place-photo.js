import { googlePlacesByListingId } from '../data/google-places.js';

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';

function choosePhoto(photos = []) {
    return photos.find(photo => photo.widthPx >= photo.heightPx) || photos[0];
}

function noStore(res) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('Vary', 'Accept-Encoding');
}

export default async function handler(req, res) {
    noStore(res);

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const listingId = Array.isArray(req.query.listingId) ? req.query.listingId[0] : req.query.listingId;
    const placeConfig = googlePlacesByListingId[listingId];
    if (!placeConfig) return res.status(404).json({ error: 'No verified Google Place is configured for this listing.' });

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
        const place = searchPayload.places?.find(candidate => candidate.displayName?.text === placeConfig.expectedName)
            || searchPayload.places?.[0];
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
            authorAttributions: photo.authorAttributions || [],
        });
    } catch {
        return res.status(502).json({ error: 'Google Places is temporarily unavailable.' });
    }
}
