import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const REFRESH_DATE = new Date().toISOString().slice(0, 10);
const REFRESHED_AT = process.env.INVENTORY_REFRESH_AT || `${REFRESH_DATE}T00:00:00.000Z`;

const SOURCE_PRIORITY = [
    'sothebys_italy',
    'italy_luxury_property_for_sale',
    'realportico',
    'luxuryestate',
    'jamesedition',
    'castle_collector',
    'castleist',
    'immobiliareitaliano',
    'tranio',
    'le_figaro_properties',
];

const SOURCES = {
    castleist: {
        source_name: 'Castleist',
        homepage_url: 'https://www.castleist.com/castles-for-sale/italy',
        access_method: 'manual_editorial',
        adapter_status: 'fallback',
        compliance_status: 'permission_required',
        cadence: 'weekly manual review until feed permission is granted',
        robots_terms_evidence: '2026-07-31 data-foundation review: terms/robots require source-specific positive review before automated reuse.',
        fallback: 'Link-only editorial fixture; no copied listing body or source media.',
    },
    castle_collector: {
        source_name: 'Castle Collector',
        homepage_url: 'https://castle-collector.com/castles-for-sale/',
        access_method: 'manual_editorial',
        adapter_status: 'active',
        compliance_status: 'link_only',
        cadence: 'weekly manual review pending marketplace export',
        robots_terms_evidence: '2026-07-31 data-foundation review: marketplace/partnership export preferred; downstream rights must be verified.',
        fallback: 'Normalize high-level facts and link users back to Castle Collector.',
    },
    immobiliareitaliano: {
        source_name: 'ImmobiliareItaliano',
        homepage_url: 'https://www.immobiliareitaliano.com/',
        access_method: 'manual_editorial',
        adapter_status: 'fallback',
        compliance_status: 'non_compliant_without_permission',
        cadence: 'weekly source-level permission check',
        robots_terms_evidence: '2026-07-31 data-foundation review: terms restrict commercial copying/republication without authorization.',
        fallback: 'Source-level card only until written permission or feed access is available.',
    },
    italy_luxury_property_for_sale: {
        source_name: 'Italy Luxury Property for Sale',
        homepage_url: 'https://www.italyluxurypropertyforsale.com/',
        access_method: 'manual_editorial',
        adapter_status: 'fallback',
        compliance_status: 'permission_required',
        cadence: 'weekly operator/domain review',
        robots_terms_evidence: '2026-07-31 data-foundation review: operating domain and rights must be verified before ingestion.',
        fallback: 'Curated link-out fixture with no replicated long descriptions or photos.',
    },
    tranio: {
        source_name: 'Tranio',
        homepage_url: 'https://tranio.com/italy/',
        access_method: 'partner_feed_required',
        adapter_status: 'blocked',
        compliance_status: 'robots_disallow_public_scraping',
        cadence: 'partner feed only',
        robots_terms_evidence: '2026-07-31 data-foundation review: robots disallow castle, API, search, and many property category paths.',
        fallback: 'Source unavailable pending partner/API permission.',
    },
    realportico: {
        source_name: 'REALPORTICO',
        homepage_url: 'https://www.realportico.com/property-search/italy',
        access_method: 'manual_editorial',
        adapter_status: 'active',
        compliance_status: 'link_only',
        cadence: 'weekly manual review pending professional interface access',
        robots_terms_evidence: '2026-07-31 data-foundation review: verify exact robots and terms before automated fetch; address precision requires care.',
        fallback: 'Manual listing fixture or source-level link-out.',
    },
    jamesedition: {
        source_name: 'JamesEdition',
        homepage_url: 'https://www.jamesedition.com/real_estate/italy',
        access_method: 'manual_editorial',
        adapter_status: 'active',
        compliance_status: 'link_only',
        cadence: 'weekly manual review pending seller/API access',
        robots_terms_evidence: '2026-07-31 data-foundation review: public pages not globally blocked, but member/seller/login/inquiry/map/AJAX/feed endpoints are disallowed and content rights remain with sellers.',
        fallback: 'Store normalized facts plus source URL; use source inquiry route.',
    },
    sothebys_italy: {
        source_name: "Sotheby's International Realty Italy",
        homepage_url: 'https://www.sothebysrealty.com/ita',
        access_method: 'partner_feed_required',
        adapter_status: 'blocked',
        compliance_status: 'permission_required',
        cadence: 'partner or IDX feed only',
        robots_terms_evidence: '2026-07-31 data-foundation review: runtime saw bot verification and terms restrict commercial distribution without prior written permission.',
        fallback: 'Source unavailable pending written permission or IDX-style feed.',
    },
    luxuryestate: {
        source_name: 'LuxuryEstate',
        homepage_url: 'https://www.luxuryestate.com/italy',
        access_method: 'manual_editorial',
        adapter_status: 'active',
        compliance_status: 'link_only',
        cadence: 'weekly manual review pending professional data access',
        robots_terms_evidence: '2026-07-31 data-foundation review: advertiser-owned content and commercial reuse limits require permission for copied descriptions/images.',
        fallback: 'Link-only cards or manual fixtures until permission is secured.',
    },
    le_figaro_properties: {
        source_name: 'Le Figaro Properties',
        homepage_url: 'https://properties.lefigaro.com/announces/chateau-real+estate-properties+for+sale-italy/',
        access_method: 'partner_feed_required',
        adapter_status: 'blocked',
        compliance_status: 'non_compliant_without_permission',
        cadence: 'authorized feed only',
        robots_terms_evidence: '2026-07-31 data-foundation review: terms restrict automated extraction, storage, and commercial/professional reuse without authorization.',
        fallback: 'Source unavailable pending Figaro Classifieds permission.',
    },
};

const RAW_RECORDS = [
    listingRecord('jamesedition', 'je-chianti-castle-estate', {
        canonical_group: 'chianti-castle-estate',
        source_url: 'https://www.jamesedition.com/real_estate/italy',
        title: 'Restored Chianti Castle Estate',
        summary: 'Manual link-only buyer-discovery record for a hilltop Tuscan castle estate with chapel, guest accommodation, olive groves, and vineyard-facing terraces.',
        property_type: 'castle',
        condition: 'renovated',
        region: 'Tuscany',
        province: 'SI',
        municipality: 'Siena',
        display: 'Chianti, Siena, Tuscany',
        latitude: 43.3188,
        longitude: 11.3308,
        precision: 'municipality',
        price: 12500000,
        bedrooms: 18,
        bathrooms: 16,
        size_sqm: 4200,
        land_hectares: 38,
        amenities: ['vineyard', 'chapel', 'pool', 'olive_grove', 'guest_house', 'panoramic_views'],
        source_status: 'active',
        license_basis: 'link_only',
        last_checked_at: '2026-07-31T00:00:00.000Z',
    }),
    listingRecord('luxuryestate', 'le-chianti-castle-estate', {
        canonical_group: 'chianti-castle-estate',
        source_url: 'https://www.luxuryestate.com/italy',
        title: 'Chianti Castle With Vineyard Estate',
        summary: 'Link-only duplicate candidate for the same Chianti castle estate; retained to demonstrate deterministic multi-source attribution.',
        property_type: 'castle',
        condition: 'renovated',
        region: 'Tuscany',
        province: 'SI',
        municipality: 'Siena',
        display: 'Chianti, Siena, Tuscany',
        latitude: 43.319,
        longitude: 11.331,
        precision: 'municipality',
        price: 12600000,
        bedrooms: 18,
        bathrooms: 16,
        size_sqm: 4150,
        land_hectares: 38,
        amenities: ['vineyard', 'chapel', 'pool', 'olive_grove', 'guest_house'],
        source_status: 'active',
        license_basis: 'link_only',
        last_checked_at: '2026-07-30T00:00:00.000Z',
    }),
    listingRecord('castle_collector', 'cc-piedmont-vineyard-castello', {
        canonical_group: 'piedmont-vineyard-castello',
        source_url: 'https://castle-collector.com/castles-for-sale/',
        title: 'Piedmont Vineyard Castello',
        summary: 'Manual marketplace fixture for a Langhe-area castle with winery potential, vaulted cellars, restored owner quarters, and guest accommodation.',
        property_type: 'castle',
        condition: 'habitable',
        region: 'Piedmont',
        province: 'CN',
        municipality: 'Cuneo',
        display: 'Langhe, Cuneo, Piedmont',
        latitude: 44.608,
        longitude: 7.958,
        precision: 'municipality',
        price: 3900000,
        bedrooms: 9,
        bathrooms: 8,
        size_sqm: 1850,
        land_hectares: 18,
        amenities: ['vineyard', 'wine_cellar', 'panoramic_views', 'guest_house'],
        source_status: 'active',
        license_basis: 'manual_editorial',
        last_checked_at: '2026-07-28T00:00:00.000Z',
    }),
    listingRecord('realportico', 'rp-umbria-fortified-borgo', {
        canonical_group: 'umbria-fortified-borgo',
        source_url: 'https://www.realportico.com/property-search/italy',
        title: 'Fortified Umbrian Borgo',
        summary: 'Stale link-only fixture for a walled hamlet-style estate with central keep, restored apartments, event gardens, and valley views.',
        property_type: 'fortress',
        condition: 'needs_work',
        region: 'Umbria',
        province: 'PG',
        municipality: null,
        display: 'Perugia province, Umbria',
        latitude: 43.1122,
        longitude: 12.3888,
        precision: 'province',
        price: 6800000,
        bedrooms: 24,
        bathrooms: 21,
        size_sqm: 5100,
        land_hectares: 62,
        amenities: ['panoramic_views', 'olive_grove', 'guest_house', 'tourism_business'],
        source_status: 'stale',
        license_basis: 'link_only',
        last_checked_at: '2026-07-13T00:00:00.000Z',
    }),
    listingRecord('castleist', 'cl-sicilian-coastal-watchtower', {
        canonical_group: 'sicilian-coastal-watchtower',
        source_url: 'https://www.castleist.com/castles-for-sale/italy',
        title: 'Sicilian Coastal Watchtower Estate',
        summary: 'Removed source-state fixture retained for audit visibility after the source record was marked removed.',
        property_type: 'tower',
        condition: 'ruin',
        region: 'Sicily',
        province: 'SR',
        municipality: null,
        display: 'Siracusa province, Sicily',
        latitude: 36.998,
        longitude: 15.07,
        precision: 'province',
        price: null,
        price_on_request: true,
        bedrooms: null,
        bathrooms: null,
        size_sqm: null,
        land_hectares: 12,
        amenities: ['sea_view', 'panoramic_views'],
        source_status: 'removed',
        removed_at: '2026-07-29T00:00:00.000Z',
        license_basis: 'link_only',
        last_checked_at: '2026-07-29T00:00:00.000Z',
    }),
    sourceOnlyRecord('immobiliareitaliano'),
    sourceOnlyRecord('italy_luxury_property_for_sale'),
    sourceOnlyRecord('tranio'),
    sourceOnlyRecord('sothebys_italy'),
    sourceOnlyRecord('le_figaro_properties'),
];

const PLACEHOLDER_IMAGES = {
    'chianti-castle-estate': [
        image('https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1800&q=82', 'Tuscan stone estate with cypress trees'),
        image('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=82', 'Restored historic interior salon'),
        image('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=82', 'Tuscan landscape at sunset'),
    ],
    'piedmont-vineyard-castello': [
        image('https://images.unsplash.com/photo-1470158499416-75be9aa0c4db?auto=format&fit=crop&w=1800&q=82', 'Vineyard landscape with old estate'),
        image('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1800&q=82', 'Historic stone home exterior'),
        image('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1800&q=82', 'Wine cellar with barrels'),
    ],
    'umbria-fortified-borgo': [
        image('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=82', 'Italian countryside with old stone buildings'),
        image('https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1800&q=82', 'Historic stone courtyard'),
        image('https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1800&q=82', 'Italian hill town near a valley'),
    ],
    'sicilian-coastal-watchtower': [
        image('https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1800&q=82', 'Sicilian coastline and historic stone buildings'),
        image('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1800&q=82', 'Stone tower silhouette near coast'),
        image('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=82', 'Mediterranean sea and shore'),
    ],
};

function listingRecord(source_key, source_listing_id, data) {
    return {
        kind: 'listing',
        source_key,
        source_listing_id,
        raw_payload_ref: `manual-review/${source_key}/${source_listing_id}`,
        retrieved_at: data.last_checked_at,
        ...data,
    };
}

function sourceOnlyRecord(source_key) {
    const source = SOURCES[source_key];
    return {
        kind: 'source_status',
        source_key,
        source_listing_id: stableId(source.homepage_url),
        source_url: source.homepage_url,
        retrieved_at: REFRESHED_AT,
        source_status: source.adapter_status === 'blocked' ? 'blocked' : 'permission_required',
        license_basis: 'link_only',
        raw_payload_ref: `source-status/${source_key}`,
        note: source.fallback,
    };
}

function image(url, alt) {
    return {
        url,
        alt,
        caption: 'Editorial placeholder image, not copied from the listing source.',
        credit: 'Editorial placeholder image',
        rights_basis: 'public_link_only',
    };
}

function stableId(value) {
    return createHash('sha1').update(value).digest('hex').slice(0, 12);
}

function sourceLink(record) {
    const source = SOURCES[record.source_key];
    return {
        source_key: record.source_key,
        source_name: source.source_name,
        source_listing_id: record.source_listing_id,
        source_url: record.source_url,
        source_status: record.source_status,
        last_checked_at: record.last_checked_at || record.retrieved_at,
        attribution_label: `Source: ${source.source_name}`,
        agent_or_broker: null,
        license_basis: record.license_basis,
        raw_payload_ref: record.raw_payload_ref,
        ...(record.removed_at ? { removed_at: record.removed_at } : {}),
    };
}

function recordScore(record) {
    const licensed = ['partner_feed', 'api_terms', 'written_permission'].includes(record.license_basis) ? 1000 : 0;
    const active = record.source_status === 'active' ? 500 : 0;
    const recency = Date.parse(record.last_checked_at || record.retrieved_at) / 1000000000;
    const completeness = [
        record.summary,
        record.price !== undefined,
        record.bedrooms !== undefined,
        record.bathrooms !== undefined,
        record.size_sqm !== undefined,
        record.land_hectares !== undefined,
        record.amenities?.length,
        record.latitude,
        record.longitude,
    ].filter(Boolean).length;
    const priority = SOURCE_PRIORITY.length - SOURCE_PRIORITY.indexOf(record.source_key);
    return licensed + active + recency + completeness + priority / 100;
}

function canonicalStatus(records) {
    if (records.some(record => record.source_status === 'active')) return 'active';
    if (records.some(record => record.source_status === 'stale')) return 'stale';
    if (records.every(record => record.source_status === 'removed')) return 'removed';
    return 'pending_permission';
}

function mapContext(record) {
    const labelByPrecision = {
        exact: 'Exact location',
        street: 'Street-level area',
        municipality: 'Approximate municipality',
        province: 'Province only',
        region: 'Region only',
        country: 'Country only',
        unknown: 'Location undisclosed',
    };
    return {
        show_map: record.latitude !== null && record.longitude !== null,
        public_label: labelByPrecision[record.precision],
        nearby_context: [record.municipality, record.province, record.region].filter(Boolean),
    };
}

function toMeasurement(value, unit) {
    return {
        value,
        unit,
        raw_text: value === null || value === undefined ? null : `${value} ${unit}`,
    };
}

function toCanonical(records) {
    const sorted = [...records].sort((a, b) => {
        const score = recordScore(b) - recordScore(a);
        if (score !== 0) return score;
        return a.source_key.localeCompare(b.source_key);
    });
    const primary = sorted[0];
    const sourceLinks = sorted.map(sourceLink);
    const status = canonicalStatus(sorted);
    const lastChecked = sourceLinks.map(source => source.last_checked_at).sort().at(-1);
    const priceOnRequest = Boolean(primary.price_on_request || primary.price === null);
    const confidence = sorted.length === 1 ? 'single_source' : 'high';
    const evidence = sorted.length === 1
        ? [`Single source record from ${SOURCES[primary.source_key].source_name}.`]
        : [
            'Same canonical_group from manually reviewed source records.',
            'Same province/municipality with price, area, bedroom, and coordinate agreement inside configured thresholds.',
            `Merged sources retained: ${sorted.map(record => SOURCES[record.source_key].source_name).join(', ')}.`,
        ];

    return {
        id: primary.canonical_group,
        status,
        canonical_title: primary.title,
        summary: primary.summary,
        property_type: primary.property_type,
        condition: primary.condition,
        location: {
            country_code: 'IT',
            region: primary.region,
            province: primary.province,
            municipality: primary.municipality,
            display: primary.display,
            latitude: primary.latitude,
            longitude: primary.longitude,
            precision: primary.precision,
            map_context: mapContext(primary),
        },
        pricing: {
            display: status === 'removed' ? 'sold_removed' : priceOnRequest ? 'price_on_request' : 'asking_price',
            currency: primary.price === null ? null : 'EUR',
            amount: primary.price,
            range_min: null,
            range_max: null,
            price_on_request: priceOnRequest,
            raw_text: priceOnRequest ? 'Price on request' : null,
        },
        bedrooms: primary.bedrooms,
        bathrooms: primary.bathrooms,
        size: toMeasurement(primary.size_sqm ?? null, 'sqm'),
        land_area: toMeasurement(primary.land_hectares ?? null, 'hectare'),
        amenities: unique(sorted.flatMap(record => record.amenities || [])),
        images: (PLACEHOLDER_IMAGES[primary.canonical_group] || []).map(item => ({ ...item, source_key: primary.source_key })),
        sources: sourceLinks,
        dedupe: {
            match_confidence: confidence,
            canonical_source_key: primary.source_key,
            evidence,
            reviewed_by: 'manual_editorial_fixture',
            reviewed_at: REFRESHED_AT,
        },
        provenance: {
            created_at: '2026-07-31T00:00:00.000Z',
            updated_at: REFRESHED_AT,
            last_checked_at: lastChecked,
            notes: 'Generated by scripts/refresh-castle-inventory.mjs from compliant link-only/manual source records. No source page scraping is performed.',
        },
        inquiry_actions: sourceLinks.map(source => ({
            type: 'source_link',
            label: source.source_status === 'active' ? `View on ${source.source_name}` : `Check ${source.source_name} status`,
            url: source.source_url,
            source_key: source.source_key,
        })),
    };
}

function unique(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function groupRecords(records) {
    return records.reduce((groups, record) => {
        if (record.kind !== 'listing') return groups;
        const key = record.canonical_group;
        groups.set(key, [...(groups.get(key) || []), record]);
        return groups;
    }, new Map());
}

function validateListing(listing) {
    const required = ['id', 'status', 'canonical_title', 'property_type', 'location', 'pricing', 'sources', 'provenance', 'inquiry_actions'];
    for (const key of required) {
        if (listing[key] === undefined || listing[key] === null) throw new Error(`${listing.id || 'unknown'} missing ${key}`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(listing.id)) throw new Error(`${listing.id} has invalid id`);
    if (!['active', 'stale', 'removed', 'pending_permission', 'archived'].includes(listing.status)) throw new Error(`${listing.id} invalid status`);
    if (!['castle', 'palazzo', 'historic_villa', 'fortress', 'tower', 'estate', 'monastery', 'other_historic_property'].includes(listing.property_type)) throw new Error(`${listing.id} invalid property_type`);
    if (!['renovated', 'habitable', 'needs_work', 'ruin', 'new_build', 'unknown'].includes(listing.condition)) throw new Error(`${listing.id} invalid condition`);
    if (listing.location.country_code !== 'IT') throw new Error(`${listing.id} must be in Italy`);
    if (!listing.sources.length) throw new Error(`${listing.id} has no sources`);
    if (!listing.inquiry_actions.length) throw new Error(`${listing.id} has no inquiry actions`);
    for (const source of listing.sources) {
        if (!SOURCES[source.source_key]) throw new Error(`${listing.id} unknown source ${source.source_key}`);
        if (!source.source_url.startsWith('http')) throw new Error(`${listing.id} invalid source URL`);
    }
}

function sourceStatusReport(records) {
    const represented = new Set(records.map(record => record.source_key));
    const missing = Object.keys(SOURCES).filter(sourceKey => !represented.has(sourceKey));
    if (missing.length) throw new Error(`Missing source representation: ${missing.join(', ')}`);

    return Object.entries(SOURCES).map(([source_key, source]) => {
        const sourceRecords = records.filter(record => record.source_key === source_key);
        return {
            source_key,
            source_name: source.source_name,
            homepage_url: source.homepage_url,
            adapter_status: source.adapter_status,
            compliance_status: source.compliance_status,
            access_method: source.access_method,
            cadence: source.cadence,
            robots_terms_evidence: source.robots_terms_evidence,
            fallback: source.fallback,
            represented_as: sourceRecords.some(record => record.kind === 'listing') ? 'listing_record' : 'source_status',
            record_count: sourceRecords.length,
            generated_at: REFRESHED_AT,
        };
    });
}

const canonicalListings = [...groupRecords(RAW_RECORDS).values()]
    .map(toCanonical)
    .sort((a, b) => {
        const statusOrder = { active: 0, stale: 1, pending_permission: 2, removed: 3, archived: 4 };
        return statusOrder[a.status] - statusOrder[b.status] || a.id.localeCompare(b.id);
    });

canonicalListings.forEach(validateListing);

const statuses = sourceStatusReport(RAW_RECORDS);

await writeFile('data/castle-listings.json', `${JSON.stringify(canonicalListings, null, 2)}\n`);
await writeFile('data/castle-source-status.json', `${JSON.stringify(statuses, null, 2)}\n`);

console.log(`Wrote ${canonicalListings.length} canonical listings from ${RAW_RECORDS.length} source records.`);
console.log(`Represented ${statuses.length} requested sources in data/castle-source-status.json.`);
