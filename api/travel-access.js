import { googlePlacesByListingId } from '../data/google-places.js';
import listings from '../data/castle-listings.json' with { type: 'json' };

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.location';
const listingsById = new Map(listings.map(listing => [listing.id, listing]));

function noStore(res) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('Vary', 'Accept-Encoding');
}

async function searchPlaces(apiKey, body) {
    const response = await fetch(SEARCH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': FIELD_MASK,
        },
        body: JSON.stringify({ languageCode: 'en', regionCode: 'IT', ...body }),
    });
    if (!response.ok) throw new Error('Google Places search failed.');
    return response.json();
}

function listingConfig(listingId) {
    const listing = listingsById.get(listingId);
    if (!listing) return null;
    const verified = googlePlacesByListingId[listingId];
    return {
        listing,
        query: verified?.query || [listing.canonical_title, listing.location?.display, 'Italy'].filter(Boolean).join(', '),
        expectedName: verified?.expectedName || listing.canonical_title,
        verified: Boolean(verified),
    };
}

async function resolveProperty(apiKey, config) {
    const payload = await searchPlaces(apiKey, { textQuery: config.query });
    return config.verified
        ? payload.places?.find(place => place.displayName?.text === config.expectedName) || payload.places?.[0]
        : payload.places?.[0];
}

async function nearestFacility(apiKey, origin, type, query) {
    const payload = await searchPlaces(apiKey, {
        textQuery: query,
        includedType: type,
        strictTypeFiltering: true,
        rankPreference: 'DISTANCE',
        locationBias: {
            circle: {
                center: origin,
                radius: 50000,
            },
        },
    });
    const place = payload.places?.[0];
    if (!place?.location) return null;
    return {
        name: place.displayName?.text || place.formattedAddress || 'Google Maps result',
        address: place.formattedAddress || null,
        distanceKm: distanceKm(origin, place.location),
        googleMapsUri: place.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.displayName?.text || query)}`,
    };
}

function distanceKm(from, to) {
    const radians = degrees => degrees * Math.PI / 180;
    const earthRadiusKm = 6371;
    const latitudeDelta = radians(to.latitude - from.latitude);
    const longitudeDelta = radians(to.longitude - from.longitude);
    const a = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
    return Math.round((2 * earthRadiusKm * Math.asin(Math.sqrt(a))) * 10) / 10;
}

function uberUrl(location, propertyName, address) {
    const pickup = {
        latitude: location.latitude,
        longitude: location.longitude,
        addressLine1: propertyName,
        addressLine2: address || 'Italy',
    };
    return `https://m.uber.com/looking?pickup=${encodeURIComponent(JSON.stringify(pickup))}`;
}

export default async function handler(req, res) {
    noStore(res);
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const listingId = Array.isArray(req.query.listingId) ? req.query.listingId[0] : req.query.listingId;
    const config = listingConfig(listingId);
    if (!config) return res.status(404).json({ error: 'No inventory listing is configured for this request.' });

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
        || process.env.VITE_GOOGLE_MAPS_API_KEY
        || process.env.VITE_GOOGLE_MAPS_API;
    if (!apiKey) return res.status(503).json({ error: 'Google Maps travel lookup is not configured.' });

    try {
        const property = await resolveProperty(apiKey, config);
        if (!property?.location) return res.status(404).json({ error: 'No Google Maps location is available for this property.' });

        const [trainStation, airport] = await Promise.all([
            nearestFacility(apiKey, property.location, 'train_station', 'train station'),
            nearestFacility(apiKey, property.location, 'international_airport', 'international airport'),
        ]);

        return res.status(200).json({
            property: {
                name: property.displayName?.text || config.expectedName,
                address: property.formattedAddress || config.listing.location?.display || null,
                googleMapsUri: property.googleMapsUri || null,
            },
            trainStation,
            airport,
            uber: {
                label: 'Check Uber at this location',
                url: uberUrl(property.location, property.displayName?.text || config.expectedName, property.formattedAddress),
            },
            checkedAt: new Date().toISOString(),
        });
    } catch {
        return res.status(502).json({ error: 'Google Maps travel lookup is temporarily unavailable.' });
    }
}
