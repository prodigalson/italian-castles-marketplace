export const googlePlacesByListingId = Object.freeze({
    'jamesedition-p1-001-marsciano-umbria-castle': {
        query: "Rocca di S.Apollinare, 06055 Marsciano PG, Italy",
        expectedName: 'Rocca di S.Apollinare',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rocca%20di%20S.Apollinare%2C%2006055%20Marsciano%20PG%2C%20Italy',
    },
    'jamesedition-p1-002-salo-lombardy-castle': {
        query: 'Via Versine, 25087 Salò BS, Italy',
        expectedName: 'Castle in Salo',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Via%20Versine%2C%2025087%20Sal%C3%B2%20BS%2C%20Italy',
    },
});

// Listings whose unverified Google Places text-query match was reviewed and found to
// resolve to a different property. #30 deliberately restored the title-query fallback
// for coverage, so these ids opt out individually: no Places photo and no
// Places-derived travel figures, leaving the editorial placeholder and the record's
// own "not verified" copy in place. Promote an id into googlePlacesByListingId above
// once its real place is confirmed.
export const suppressedGooglePlaceListingIds = Object.freeze(new Set([
    'jamesedition-p1-011-montagnana-baccaiano-anselmo-montespertoli-tuscany-castle',
]));
