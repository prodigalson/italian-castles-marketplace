import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const REQUIRED_PLACEHOLDER_LABEL = 'Editorial placeholder images.';
const CANONICAL_URL = 'https://castle.chingularity.com/';

const [listings, sources, siteImages, html, mainSource, socialSource, socialOutput] = await Promise.all([
    readJson('data/castle-listings.json'),
    readJson('data/castle-source-status.json'),
    readJson('data/site-image-assets.json'),
    readFile('index.html', 'utf8'),
    readFile('main.js', 'utf8'),
    readFile('assets/site-social-preview.svg', 'utf8'),
    readFile('public/og/cover.png'),
]);
const socialMetadata = await sharp(socialOutput).metadata();
const siteSourceContents = await Promise.all(siteImages.map(image => readFile(image.source_asset)));
const siteSourceMetadata = await Promise.all(siteSourceContents.map(content => sharp(content).metadata()));

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
            check(isHttpUrl(image.source_listing_url) && listing.sources.some(source => source.source_url === image.source_listing_url), `${listing.id}: fallback image review must preserve its original listing URL.`);
            check(Boolean(image.selection_reviewed_at && image.selection_note?.includes('does not document property-photo display rights')), `${listing.id}: fallback image lacks a documented permission review.`);
            check(image.selection_note?.includes('No source image was copied or hotlinked'), `${listing.id}: fallback image lacks a no-copy/no-hotlink provenance record.`);
        }
    }
}

const masseriaSources = sources.filter(source => source.inventory_scope.split(',').includes('puglia_masserias'));
check(masseriaSources.length === 10, `Expected all 10 required masseria sources, found ${masseriaSources.length}.`);
check(masseriaSources.every(source => source.source_name && source.compliance_status && source.robots_terms_evidence && source.fallback), 'Masseria source transparency is incomplete.');
check(html.includes(`<link rel="canonical" href="${CANONICAL_URL}">`), 'Canonical production URL is not castle.chingularity.com.');
check(!html.includes('italian-castles-marketplace.vercel.app'), 'Legacy Vercel URL remains in SEO/social metadata.');
check(html.includes('og:image') && html.includes('twitter:card') && html.includes('application/ld+json'), 'SEO/social metadata is incomplete.');
check(html.includes('Find your Castle to Buy'), 'Exact castle heading is missing.');
check(html.includes('Browse Fortresses, castles, towers, and palazzi in Italy'), 'Exact castle supporting copy is missing.');
check(!html.includes('Italian Castles Marketplace original artwork · Owned · Not a listed property.'), 'Removed homepage provenance copy remains in the page.');
check([
    "title: 'Find your Castle to Buy'",
    "description: 'Browse Fortresses, castles, towers, and palazzi in Italy'",
    "title: 'Find your Masseria to Buy'",
    "description: 'Browse Masserias in Puglia that are for sale'",
].every(copy => mainSource.includes(copy)), 'Exact castle and masseria section copy is missing from main.js.');

const coverImage = siteImages.find(image => image.usage === 'marketplace_cover');
const socialImage = siteImages.find(image => image.usage === 'social_preview');
for (const [index, image] of siteImages.entries()) {
    check(!isHttpUrl(image.url), `${image.id}: site imagery must use an owned local asset.`);
    check(Boolean(image.credit && image.rights_basis && image.rights_note), `${image.id}: incomplete image provenance.`);
    check(sha256(siteSourceContents[index]) === image.source_sha256, `${image.id}: source artwork does not match its recorded provenance hash.`);
}
check(Boolean(coverImage && socialImage), 'Cover and social-preview provenance records are required.');
check(html.includes(`<img src="${coverImage?.url}"`), 'Marketplace cover does not use its registered local asset.');
check(coverImage?.depiction_type === 'editorial_landmark', 'Marketplace cover must be registered as an editorial landmark photograph.');
check(coverImage?.display_label === 'Editorial hero, not a listed property.', 'Marketplace cover must explicitly state that it is not a listed property.');
check(coverImage?.rights_basis === 'CC BY-SA 4.0' && isHttpUrl(coverImage?.license_url), 'Marketplace cover must record its reusable license.');
check(isHttpUrl(coverImage?.source_page_url) && isHttpUrl(coverImage?.source_download_url), 'Marketplace cover must record source-page and download provenance.');
check(coverImage?.source_original_dimensions === '6708x4472' && coverImage?.delivered_dimensions === '3840x2560', 'Marketplace cover dimensions do not match recorded provenance.');
check(siteSourceMetadata[siteImages.indexOf(coverImage)]?.width === 3840 && siteSourceMetadata[siteImages.indexOf(coverImage)]?.height === 2560, 'Marketplace cover is not the expected high-resolution 3840x2560 asset.');
check(html.includes(coverImage?.source_page_url) && html.includes(coverImage?.license_url) && html.includes(coverImage?.credit), 'Marketplace cover lacks visible linked attribution and license provenance.');
check(html.includes('Editorial hero, not a listed property.'), 'Marketplace cover could be mistaken for a listed property.');
check(socialImage?.depiction_type === 'editorial_placeholder', 'Social preview must remain an explicit editorial placeholder.');
check(socialImage?.display_label === REQUIRED_PLACEHOLDER_LABEL, `Social preview label must be exactly “${REQUIRED_PLACEHOLDER_LABEL}”`);
check(socialImage?.rights_basis === 'owned', 'Social preview must retain owned rights provenance.');
const socialSourceContent = siteSourceContents[siteImages.indexOf(socialImage)].toString('utf8');
check(socialSourceContent.includes('<svg') && !socialSourceContent.includes('Amo Dove Andiamo'), 'Social source is not verified castle-marketplace vector artwork.');
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
    console.log(`Site image provenance passed: licensed photographic hero and owned social asset are registered and verified.`);
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
