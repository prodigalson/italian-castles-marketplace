import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { listingSchemaErrors } from './listing-schema-validator.mjs';

const REQUIRED_PLACEHOLDER_LABEL = 'Editorial placeholder images.';
const CANONICAL_URL = 'https://castle.chingularity.com/';

const [listings, sources, siteImages, html, socialSource, socialOutput] = await Promise.all([
    readJson('data/castle-listings.json'),
    readJson('data/castle-source-status.json'),
    readJson('data/site-image-assets.json'),
    readFile('index.html', 'utf8'),
    readFile('assets/site-social-preview.svg', 'utf8'),
    readFile('public/og/cover.png'),
]);
const socialMetadata = await sharp(socialOutput).metadata();
const siteSourceContents = await Promise.all(siteImages.map(image => readFile(image.source_asset, 'utf8')));

const failures = [];
const activeCastles = listings.filter(listing => listing.asset_class === 'castle' && listing.status === 'active');
const activeMasserias = listings.filter(listing => listing.asset_class === 'masseria' && listing.status === 'active');
const ids = new Set(listings.map(listing => listing.id));

check(activeCastles.length >= 100, `Expected at least 100 active castles, found ${activeCastles.length}.`);
check(activeMasserias.length > 0, 'Expected active Puglia masseria inventory.');
check(ids.size === listings.length, `Expected unique canonical IDs, found ${listings.length - ids.size} duplicates.`);

for (const listing of listings) {
    for (const error of listingSchemaErrors(listing)) check(false, `${listing.id}: canonical schema ${error}`);
    check(listing.sources?.length > 0, `${listing.id}: missing source attribution.`);
    check(Boolean(listing.provenance?.last_checked_at), `${listing.id}: missing provenance last_checked_at.`);
    check(Boolean(listing.provenance?.notes), `${listing.id}: missing provenance notes.`);
    check(listing.inquiry_actions?.length > 0, `${listing.id}: missing source inquiry action.`);
    check(listing.images?.length > 0, `${listing.id}: missing compliant image or editorial substitute.`);
    check(Boolean(listing.travel_access?.train_station && listing.travel_access?.airport && listing.travel_access?.uber), `${listing.id}: missing travel/access panel data.`);

    for (const [kind, facility] of Object.entries({ train_station: listing.travel_access?.train_station, airport: listing.travel_access?.airport })) {
        if (!facility) continue;
        check(Boolean(facility.record_generated_at && facility.note), `${listing.id}: ${kind} lacks record date or verification note.`);
        const hasDistance = facility.distance_km !== null;
        const hasTravelTime = facility.travel_time_minutes !== null;
        const hasEstimate = hasDistance || hasTravelTime;
        const approximateLocation = !['exact', 'street'].includes(listing.location.precision);

        check(!(hasDistance && hasTravelTime), `${listing.id}: ${kind} mixes distance and travel-time estimates.`);
        check(!(approximateLocation && hasEstimate), `${listing.id}: ${kind} estimate requires exact or street-level location precision.`);
        check(!(approximateLocation && facility.status !== 'unknown_not_verified'), `${listing.id}: ${kind} nearest selection requires exact or street-level location precision.`);
        if (facility.status === 'verified_facility') {
            check(Boolean(facility.facility_name && facility.source_name && isHttpUrl(facility.source_url) && facility.last_checked_at), `${listing.id}: verified ${kind} lacks a facility name, source, or check timestamp.`);
            check(Boolean(facility.nearest_selection_method && isHttpUrl(facility.nearest_selection_source_url)), `${listing.id}: verified ${kind} lacks nearest-selection method or HTTP(S) evidence.`);
            if (hasEstimate) {
                check(Boolean(facility.estimate_method && isHttpUrl(facility.estimate_source_url)), `${listing.id}: ${kind} estimate lacks method or HTTP(S) evidence.`);
            } else {
                check(facility.estimate_method === null && facility.estimate_source_url === null, `${listing.id}: ${kind} carries estimate evidence without an estimate.`);
            }
        } else {
            check(facility.status === 'unknown_not_verified', `${listing.id}: unsupported ${kind} verification status.`);
            const factualFields = ['facility_name', 'distance_km', 'travel_time_minutes', 'source_name', 'source_url', 'nearest_selection_method', 'nearest_selection_source_url', 'estimate_method', 'estimate_source_url', 'last_checked_at'];
            check(factualFields.every(field => facility[field] === null), `${listing.id}: unverified ${kind} contains inferred facts.`);
        }
    }

    const uber = listing.travel_access?.uber;
    if (uber) {
        check(['available', 'limited_varies', 'not_available', 'check_app', 'unknown_not_verified'].includes(uber.status), `${listing.id}: unsupported Uber status.`);
        check(Boolean(uber.last_checked_at && uber.note), `${listing.id}: Uber status lacks check date or caveat.`);
        if (uber.status === 'unknown_not_verified') {
            check(uber.source_name === null && uber.source_url === null, `${listing.id}: unknown Uber status contains sourced claims.`);
        } else {
            check(Boolean(uber.source_name && isHttpUrl(uber.source_url)), `${listing.id}: Uber status lacks HTTP(S) source metadata.`);
        }
    }

    for (const source of listing.sources || []) {
        check(isHttpUrl(source.source_url), `${listing.id}: invalid original source URL.`);
        check(Boolean(source.source_name && source.attribution_label), `${listing.id}: incomplete source attribution.`);
        check(Boolean(source.last_checked_at && source.raw_payload_ref), `${listing.id}: incomplete source provenance.`);
    }

    for (const image of listing.images || []) {
        check(Boolean(image.credit && image.rights_basis && image.rights_note), `${listing.id}: incomplete image rights provenance.`);
        if (image.depiction_type === 'actual_property') {
            check(['partner_license', 'source_permission', 'owned'].includes(image.rights_basis), `${listing.id}: actual-property image lacks display rights.`);
        } else {
            check(image.depiction_type === 'editorial_placeholder', `${listing.id}: unsupported image depiction type.`);
            check(image.display_label === REQUIRED_PLACEHOLDER_LABEL, `${listing.id}: substitute image label must be exactly “${REQUIRED_PLACEHOLDER_LABEL}”`);
            check(!isHttpUrl(image.url), `${listing.id}: editorial substitute must use owned local artwork.`);
            check(image.alt.includes('does not depict the listed property'), `${listing.id}: placeholder alt text could imply a property-specific image.`);
        }
    }
}

const masseriaSources = sources.filter(source => source.inventory_scope.split(',').includes('puglia_masserias'));
check(masseriaSources.length === 10, `Expected all 10 required masseria sources, found ${masseriaSources.length}.`);
check(masseriaSources.every(source => source.source_name && source.compliance_status && source.robots_terms_evidence && source.fallback), 'Masseria source transparency is incomplete.');
check(html.includes(`<link rel="canonical" href="${CANONICAL_URL}">`), 'Canonical production URL is not castle.chingularity.com.');
check(!html.includes('italian-castles-marketplace.vercel.app'), 'Legacy Vercel URL remains in SEO/social metadata.');
check(html.includes('og:image') && html.includes('twitter:card') && html.includes('application/ld+json'), 'SEO/social metadata is incomplete.');

const coverImage = siteImages.find(image => image.usage === 'marketplace_cover');
const socialImage = siteImages.find(image => image.usage === 'social_preview');
for (const [index, image] of siteImages.entries()) {
    check(image.depiction_type === 'editorial_placeholder', `${image.id}: site image must be an explicit editorial placeholder.`);
    check(image.display_label === REQUIRED_PLACEHOLDER_LABEL, `${image.id}: site image label must be exactly “${REQUIRED_PLACEHOLDER_LABEL}”`);
    check(image.credit && image.rights_basis === 'owned' && image.rights_note, `${image.id}: incomplete owned image provenance.`);
    check(!isHttpUrl(image.url), `${image.id}: site imagery must use an owned local asset.`);
    check(siteSourceContents[index].includes('<svg') && !siteSourceContents[index].includes('Amo Dove Andiamo'), `${image.id}: source asset is not verified castle-marketplace vector artwork.`);
    check(sha256(siteSourceContents[index]) === image.source_sha256, `${image.id}: source artwork does not match its recorded provenance hash.`);
}
check(Boolean(coverImage && socialImage), 'Cover and social-preview provenance records are required.');
check(html.includes(`<img src="${coverImage?.url}"`), 'Marketplace cover does not use its registered local asset.');
check(html.includes(`class="cover-image-provenance"><strong>${REQUIRED_PLACEHOLDER_LABEL}</strong>`), 'Marketplace cover lacks visible rights/provenance text.');
check(!html.includes('commons.wikimedia.org'), 'Unregistered third-party cover imagery remains in the page.');
check(html.includes(`${CANONICAL_URL.slice(0, -1)}${socialImage?.url}`), 'Social metadata does not use its registered marketplace asset.');
check(html.includes('<meta property="og:image:type" content="image/png">'), 'Social preview MIME metadata does not match the PNG asset.');
check(socialSource.includes('Browse Italian Castles for Sale') && socialSource.includes(`>${REQUIRED_PLACEHOLDER_LABEL}</text>`), 'Social preview source must visibly render the exact placeholder label.');
check(!socialSource.includes('Amo Dove Andiamo'), 'Social preview source contains unrelated Amo branding.');
check(socialMetadata.width === 1200 && socialMetadata.height === 630 && socialMetadata.format === 'png', 'Generated social preview must be a 1200x630 PNG.');
check(sha256(socialOutput) === socialImage?.generated_sha256, 'Generated social preview does not match its recorded provenance hash.');

if (failures.length) {
    console.error(`Launch QA failed with ${failures.length} finding(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
} else {
    console.log(`Launch QA passed: ${activeCastles.length} active castles, ${activeMasserias.length} active masserias, ${listings.length} unique canonical listings.`);
    console.log(`Image provenance passed: ${listings.length} listings use explicit actual-property or exactly labelled editorial imagery.`);
    console.log(`Travel access passed: ${listings.length} listings have conservative train, airport, and Uber records.`);
    console.log(`Site image provenance passed: ${siteImages.length} owned cover/social assets are registered and verified.`);
    console.log(`Source transparency passed: ${sources.length} source records, including all ${masseriaSources.length} required masseria sources.`);
    console.log(`Canonical metadata passed: ${CANONICAL_URL}`);
}

function check(condition, message) {
    if (!condition) failures.push(message);
}

function isHttpUrl(value) {
    try {
        return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
        return false;
    }
}

async function readJson(path) {
    return JSON.parse(await readFile(path, 'utf8'));
}

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}
