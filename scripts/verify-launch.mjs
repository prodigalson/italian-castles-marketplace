import { readFile } from 'node:fs/promises';

const REQUIRED_PLACEHOLDER_LABEL = 'Editorial placeholder images.';
const CANONICAL_URL = 'https://castle.chingularity.com/';

const [listings, sources, html] = await Promise.all([
    readJson('data/castle-listings.json'),
    readJson('data/castle-source-status.json'),
    readFile('index.html', 'utf8'),
]);

const failures = [];
const activeCastles = listings.filter(listing => listing.asset_class === 'castle' && listing.status === 'active');
const activeMasserias = listings.filter(listing => listing.asset_class === 'masseria' && listing.status === 'active');
const ids = new Set(listings.map(listing => listing.id));

check(activeCastles.length >= 100, `Expected at least 100 active castles, found ${activeCastles.length}.`);
check(activeMasserias.length > 0, 'Expected active Puglia masseria inventory.');
check(ids.size === listings.length, `Expected unique canonical IDs, found ${listings.length - ids.size} duplicates.`);

for (const listing of listings) {
    check(listing.sources?.length > 0, `${listing.id}: missing source attribution.`);
    check(Boolean(listing.provenance?.last_checked_at), `${listing.id}: missing provenance last_checked_at.`);
    check(Boolean(listing.provenance?.notes), `${listing.id}: missing provenance notes.`);
    check(listing.inquiry_actions?.length > 0, `${listing.id}: missing source inquiry action.`);
    check(listing.images?.length > 0, `${listing.id}: missing compliant image or editorial substitute.`);

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

if (failures.length) {
    console.error(`Launch QA failed with ${failures.length} finding(s):`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
} else {
    console.log(`Launch QA passed: ${activeCastles.length} active castles, ${activeMasserias.length} active masserias, ${listings.length} unique canonical listings.`);
    console.log(`Image provenance passed: ${listings.length} listings use explicit actual-property or exactly labelled editorial imagery.`);
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
