import { readFile } from 'node:fs/promises';
import { listingSchemaErrors } from './listing-schema-validator.mjs';

const listings = JSON.parse(await readFile('data/castle-listings.json', 'utf8'));
const base = structuredClone(listings[0]);
const facility = base.travel_access.train_station;

base.location.precision = 'exact';
Object.assign(facility, {
    status: 'verified_facility',
    facility_name: 'Test station',
    distance_km: -1,
    travel_time_minutes: null,
    source_name: 'Test operator',
    source_url: 'https://example.com/facility',
    nearest_selection_method: 'Compared all candidate facilities against the exact property coordinates.',
    nearest_selection_source_url: 'https://example.com/nearest-evidence',
    estimate_method: 'Calculated route distance from exact property coordinates.',
    estimate_source_url: 'https://example.com/distance-evidence',
    last_checked_at: 'not-a-date',
});

const invalidValueErrors = listingSchemaErrors(base);
check(invalidValueErrors.some(error => error.includes('must be >= 0')), 'Canonical schema accepted a negative facility distance.');
check(invalidValueErrors.some(error => error.includes('must match format "date-time"')), 'Canonical schema accepted an invalid facility check timestamp.');

const missingNearestEvidence = structuredClone(base);
missingNearestEvidence.travel_access.train_station.distance_km = null;
missingNearestEvidence.travel_access.train_station.estimate_method = null;
missingNearestEvidence.travel_access.train_station.estimate_source_url = null;
missingNearestEvidence.travel_access.train_station.last_checked_at = '2026-07-31T00:00:00.000Z';
missingNearestEvidence.travel_access.train_station.nearest_selection_method = null;
missingNearestEvidence.travel_access.train_station.nearest_selection_source_url = null;
check(listingSchemaErrors(missingNearestEvidence).length > 0, 'Canonical schema accepted a named closest facility without nearest-selection evidence.');

const approximateVerified = structuredClone(missingNearestEvidence);
approximateVerified.location.precision = 'municipality';
approximateVerified.travel_access.train_station.nearest_selection_method = 'Test method';
approximateVerified.travel_access.train_station.nearest_selection_source_url = 'https://example.com/nearest-evidence';
check(listingSchemaErrors(approximateVerified).length > 0, 'Canonical schema accepted a named closest facility for an approximate property location.');

console.log('Canonical listing schema regression checks passed: invalid estimates, timestamps, and nearest claims are rejected.');

function check(condition, message) {
    if (!condition) throw new Error(message);
}
