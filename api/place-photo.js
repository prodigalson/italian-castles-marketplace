import { googlePlacesByListingId } from '../data/google-places.js';
import listings from '../data/castle-listings.json' with { type: 'json' };

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const STREET_VIEW_URL = 'https://maps.googleapis.com/maps/api/streetview';
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

async function findPlace(placeConfig, apiKey) {
    const searchResponse = await fetch(SEARCH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.location',
        },
        body: JSON.stringify({ textQuery: placeConfig.query, languageCode: 'en' }),
    });

    if (!searchResponse.ok) throw new Error('Google Places search failed.');
    const searchPayload = await searchResponse.json();
    return placeConfig.verified
        ? searchPayload.places?.find(candidate => candidate.displayName?.text === placeConfig.expectedName) || searchPayload.places?.[0]
        : searchPayload.places?.[0];
}

function streetViewParams(place, apiKey) {
    const location = place?.location;
    if (!Number.isFinite(location?.latitude) || !Number.isFinite(location?.longitude)) return null;

    return new URLSearchParams({
        location: `${location.latitude},${location.longitude}`,
        source: 'outdoor',
        radius: '100',
        return_error_code: 'true',
        key: apiKey,
    });
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
        const place = await findPlace(placeConfig, apiKey);
        const params = streetViewParams(place, apiKey);
        if (!place || !params) return res.status(404).json({ error: 'No mapped location is available for this place.' });

        if (req.query.image === '1') {
            params.set('size', '640x480');
            params.set('scale', '2');
            params.set('fov', '90');
            params.set('pitch', '5');
            const imageResponse = await fetch(`${STREET_VIEW_URL}?${params}`);
            if (!imageResponse.ok) return res.status(404).end();
            res.setHeader('Content-Type', imageResponse.headers.get('content-type') || 'image/jpeg');
            return res.status(200).send(Buffer.from(await imageResponse.arrayBuffer()));
        }

        const metadataResponse = await fetch(`${STREET_VIEW_URL}/metadata?${params}`);
        const metadata = metadataResponse.ok ? await metadataResponse.json() : null;
        if (metadata?.status !== 'OK') return res.status(404).json({ error: 'No verified outdoor Google Maps view is available for this place.' });

        return res.status(200).json({
            photoUrl: `/api/place-photo?listingId=${encodeURIComponent(listingId)}&image=1`,
            placeName: place.displayName?.text || placeConfig.expectedName,
            googleMapsUri: place.googleMapsUri || placeConfig.mapsUrl,
            imageKind: 'outdoor-street-view',
        });
    } catch {
        return res.status(502).json({ error: 'Google Places is temporarily unavailable.' });
    }
}
