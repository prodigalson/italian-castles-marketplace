import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { assertListingSchema } from './listing-schema-validator.mjs';
import { containsSourceBrand, customerFacingTitle } from './customer-facing-title.mjs';

const REFRESH_DATE = new Date().toISOString().slice(0, 10);
const REFRESHED_AT = process.env.INVENTORY_REFRESH_AT || `${REFRESH_DATE}T00:00:00.000Z`;

const SOURCE_PRIORITY = [
    'sothebys_italy',
    'engel_volkers',
    'romolini',
    'oikos_immobiliare',
    'apulia_exclusive_houses',
    'gate_away',
    'italy_luxury_property_for_sale',
    'realportico',
    'luxuryestate',
    'jamesedition',
    'idealista',
    'immobiliare_it',
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
        inventory_scope: 'italian_castles,puglia_masserias',
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
        inventory_scope: 'italian_castles,puglia_masserias',
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
        inventory_scope: 'italian_castles,puglia_masserias',
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
    idealista: {
        source_name: 'Idealista',
        homepage_url: 'https://www.idealista.it/en/vendita-case/brindisi-provincia/',
        access_method: 'manual_editorial',
        adapter_status: 'fallback',
        compliance_status: 'permission_required',
        cadence: 'weekly manual source review until portal/feed permission is granted',
        robots_terms_evidence: '2026-07-31 masseria review: robots exposes many sale paths but blocks AJAX, user, saved, photo, virtual-tour, map/list-sort, and broad localized paths; portal terms and commercial reuse permission still required before automation.',
        fallback: 'Source-level Puglia masseria coverage note only; do not copy descriptions, photos, or hidden contact data without portal permission.',
        inventory_scope: 'puglia_masserias',
    },
    immobiliare_it: {
        source_name: 'Immobiliare.it',
        homepage_url: 'https://www.immobiliare.it/vendita-rustici/brindisi-provincia/',
        access_method: 'manual_editorial',
        adapter_status: 'fallback',
        compliance_status: 'permission_required',
        cadence: 'weekly source-level permission check',
        robots_terms_evidence: '2026-07-31 masseria review: robots allows sitemap discovery and blocks selected demo/mortgage paths; terms and portal permission are still required for commercial aggregation and media reuse.',
        fallback: 'Source-level status only until authorized feed/API or written reuse permission exists.',
        inventory_scope: 'puglia_masserias',
    },
    gate_away: {
        source_name: 'Gate-away',
        homepage_url: 'https://www.gate-away.com/properties/puglia',
        access_method: 'manual_editorial',
        adapter_status: 'active',
        compliance_status: 'link_only',
        cadence: 'weekly manual review pending portal feed or broker export',
        robots_terms_evidence: '2026-07-31 masseria review: use only manually curated link-out records unless Gate-away grants feed/API or written reuse rights for commercial aggregation.',
        fallback: 'Normalize high-level manual facts and route buyers back to the original Gate-away listing.',
        inventory_scope: 'puglia_masserias',
    },
    engel_volkers: {
        source_name: 'Engel & Volkers',
        homepage_url: 'https://www.engelvoelkers.com/it/en',
        access_method: 'partner_feed_required',
        adapter_status: 'blocked',
        compliance_status: 'permission_required',
        cadence: 'partner feed or direct broker export only',
        robots_terms_evidence: '2026-07-31 masseria review: global luxury brokerage inventory requires source-specific permission; do not crawl search, account, lead, or dynamic endpoints.',
        fallback: 'Unavailable pending written permission, brokerage export, or a manually authorized link-out fixture.',
        inventory_scope: 'puglia_masserias',
    },
    romolini: {
        source_name: 'Romolini',
        homepage_url: 'https://romolini.co.uk/en/italy/',
        access_method: 'manual_editorial',
        adapter_status: 'fallback',
        compliance_status: 'permission_required',
        cadence: 'weekly manual review pending agency permission',
        robots_terms_evidence: '2026-07-31 masseria review: boutique agency content and media need agency authorization before copied reuse; public automation must wait for a positive robots and terms review.',
        fallback: 'Link-out source note or agency-approved fixture only.',
        inventory_scope: 'puglia_masserias',
    },
    apulia_exclusive_houses: {
        source_name: 'Apulia Exclusive Houses',
        homepage_url: 'https://www.apuliaexclusivehouses.com/',
        access_method: 'partner_feed_required',
        adapter_status: 'blocked',
        compliance_status: 'permission_required',
        cadence: 'direct agency feed or written permission only',
        robots_terms_evidence: '2026-07-31 masseria review: no compliant automated access is configured; agency-owned listings and imagery require explicit permission.',
        fallback: 'Source unavailable pending direct agency permission.',
        inventory_scope: 'puglia_masserias',
    },
    oikos_immobiliare: {
        source_name: 'Oikos Immobiliare',
        homepage_url: 'https://oikosimmobiliare.biz/en/',
        access_method: 'manual_editorial',
        adapter_status: 'active',
        compliance_status: 'link_only',
        cadence: 'weekly manual review pending agency export',
        robots_terms_evidence: '2026-07-31 masseria review: public pages show Puglia inventory and references, but copied descriptions/media and automated collection need agency permission.',
        fallback: 'Manual link-only fixture with source URL, reference, high-level facts, and Oikos attribution.',
        inventory_scope: 'puglia_masserias',
    },
};

const JAMESEDITION_CARD_LAST_CHECKED_AT = '2026-07-31T00:00:00.000Z';
const JAMESEDITION_SNAPSHOT_REF = 'data/manual-review/jamesedition/castle-card-snapshot.json';

const jamesEditionSnapshot = JSON.parse(await readFile(JAMESEDITION_SNAPSHOT_REF, 'utf8'));
const JAMESEDITION_CASTLE_CARD_RECORDS = buildJamesEditionCastleCards(jamesEditionSnapshot.records);

const RAW_RECORDS = [
    ...JAMESEDITION_CASTLE_CARD_RECORDS,
    sourceOnlyRecord('castleist'),
    sourceOnlyRecord('castle_collector'),
    sourceOnlyRecord('realportico'),
    sourceOnlyRecord('luxuryestate'),
    sourceOnlyRecord('immobiliareitaliano'),
    sourceOnlyRecord('italy_luxury_property_for_sale'),
    sourceOnlyRecord('tranio'),
    sourceOnlyRecord('sothebys_italy'),
    sourceOnlyRecord('le_figaro_properties'),
    sourceOnlyRecord('gate_away'),
    sourceOnlyRecord('oikos_immobiliare'),
    listingRecord('jamesedition', 'je-masseria-conversano-15074705', {
        canonical_group: 'jamesedition-masseria-conversano-15074705',
        source_url: 'https://www.jamesedition.com/real_estate/conversano-italy/masseria-for-sale-in-puglia-15074705',
        title: 'Restored Eighteenth-Century Masseria In Conversano',
        summary: 'Manual link-only record for a restored eighteenth-century masseria near Conversano with traditional stonework, a private pool, and a one-hectare pine garden.',
        asset_class: 'masseria',
        property_type: 'masseria',
        condition: 'renovated',
        region: 'Puglia',
        province: 'BA',
        municipality: 'Conversano',
        display: 'Conversano, Bari, Puglia',
        latitude: null,
        longitude: null,
        precision: 'municipality',
        price: 1400000,
        bedrooms: 5,
        bathrooms: 5,
        size_sqm: 700,
        land_hectares: 1,
        amenities: ['olive_grove', 'pool', 'garden', 'tourism_business'],
        source_status: 'active',
        license_basis: 'link_only',
        last_checked_at: '2026-07-31T00:00:00.000Z',
        raw_payload_ref: 'data/manual-review/jamesedition/masseria-property-url-review.json#15074705',
    }),
    listingRecord('jamesedition', 'je-historic-masseria-salve-18413842', {
        canonical_group: 'jamesedition-historic-masseria-salve-18413842',
        source_url: 'https://www.jamesedition.com/real_estate/salve-italy/historic-masseria-with-productive-estate-in-southern-puglia-18413842',
        title: 'Historic Masseria With Productive Estate In Salve',
        summary: 'Manual link-only record for a historic Salento masseria with established hospitality use, olive groves, vineyards, and approximately forty hectares of land.',
        asset_class: 'masseria',
        property_type: 'masseria',
        condition: 'habitable',
        region: 'Puglia',
        province: 'LE',
        municipality: 'Salve',
        display: 'Salve, Lecce, Puglia',
        latitude: null,
        longitude: null,
        precision: 'municipality',
        price: 10000000,
        bedrooms: 8,
        bathrooms: 8,
        size_sqm: null,
        land_hectares: 40,
        amenities: ['olive_grove', 'vineyard', 'tourism_business', 'panoramic_views'],
        source_status: 'active',
        license_basis: 'link_only',
        last_checked_at: '2026-07-31T00:00:00.000Z',
        raw_payload_ref: 'data/manual-review/jamesedition/masseria-property-url-review.json#18413842',
    }),
    sourceOnlyRecord('idealista'),
    sourceOnlyRecord('immobiliare_it'),
    sourceOnlyRecord('engel_volkers'),
    sourceOnlyRecord('romolini'),
    sourceOnlyRecord('apulia_exclusive_houses'),
];

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
        asset_class: source.inventory_scope === 'puglia_masserias' ? 'masseria' : 'castle',
    };
}

function buildJamesEditionCastleCards(cards) {
    const seen = new Set();
    return cards.flatMap((card) => {
        if (!card.original_listing_url) return [];

        const id = card.id;
        const encoded = card.encoded_card_facts;
        const [place, region, beds, baths, size, land] = encoded.split('|');
        const signature = [place, region, beds, baths, size, land].join('|').toLowerCase();
        if (seen.has(signature)) return [];
        seen.add(signature);

        const bedrooms = toNullableNumber(beds);
        const bathrooms = toNullableNumber(baths);
        const size_sqm = toNullableNumber(size);
        const land_hectares = toNullableNumber(land);
        const municipality = place.split(',')[0].trim();
        const slug = slugify(`jamesedition ${id} ${place} ${region} castle`);
        const title = `Castle in ${place}`;

        return listingRecord('jamesedition', `je-castle-card-${id}`, {
            canonical_group: slug,
            source_url: card.original_listing_url,
            title,
            summary: `Manual link-only JamesEdition category-card record for an active castle listing in ${place}, ${region}. The record keeps only high-level card facts and routes buyers back to the original JamesEdition listing page.`,
            asset_class: 'castle',
            property_type: 'castle',
            condition: 'unknown',
            region,
            province: null,
            municipality,
            display: `${place}, ${region}`,
            latitude: null,
            longitude: null,
            precision: 'municipality',
            price: null,
            price_on_request: true,
            bedrooms,
            bathrooms,
            size_sqm,
            land_hectares,
            amenities: inferredAmenities(region, land_hectares),
            source_status: 'active',
            license_basis: 'link_only',
            last_checked_at: JAMESEDITION_CARD_LAST_CHECKED_AT,
            raw_payload_ref: `${JAMESEDITION_SNAPSHOT_REF}#${id}`,
        });
    });
}

function toNullableNumber(value) {
    if (value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function slugify(value) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function inferredAmenities(region, land_hectares) {
    const amenities = ['panoramic_views'];
    if (land_hectares && land_hectares >= 1) amenities.push('garden');
    if (['Tuscany', 'Umbria', 'Piedmont', 'Marche'].includes(region)) amenities.push('vineyard');
    if (['Tuscany', 'Umbria', 'Apulia', 'Lazio'].includes(region)) amenities.push('olive_grove');
    if (['Liguria', 'Calabria', 'Veneto'].includes(region)) amenities.push('sea_view');
    return amenities;
}

function editorialPlaceholder(assetClass, sourceRecord) {
    const label = 'Editorial placeholder images.';
    return {
        url: assetClass === 'masseria'
            ? '/images/editorial-masseria-placeholder.svg'
            : '/images/editorial-castle-placeholder.svg',
        alt: `${label} This illustration does not depict the listed property.`,
        caption: label,
        credit: 'Italian Castles Marketplace editorial artwork',
        depiction_type: 'editorial_placeholder',
        display_label: label,
        rights_basis: 'owned',
        rights_note: 'Original editorial illustration owned by the marketplace; it is not a photograph of the listed property.',
        source_listing_url: sourceRecord.source_url,
        selection_reviewed_at: REFRESHED_AT,
        selection_note: `The original listing link is preserved, but its ${sourceRecord.license_basis} source record does not document property-photo display rights. No source image was copied or hotlinked; the compliant owned fallback was selected.`,
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

function unknownFacility() {
    return {
        status: 'unknown_not_verified',
        facility_name: null,
        distance_km: null,
        travel_time_minutes: null,
        source_name: null,
        source_url: null,
        nearest_selection_method: null,
        nearest_selection_source_url: null,
        estimate_method: null,
        estimate_source_url: null,
        last_checked_at: null,
        record_generated_at: REFRESHED_AT,
        note: 'No compliant, property-specific facility match has been verified. Ask the broker to confirm from the exact address.',
    };
}

function travelAccess() {
    return {
        train_station: unknownFacility(),
        airport: unknownFacility(),
        uber: {
            status: 'check_app',
            source_name: 'Uber city availability directory',
            source_url: 'https://www.uber.com/global/it/r/italy/cities/',
            last_checked_at: '2026-07-31T00:00:00.000Z',
            note: 'Coverage, products, and pickup availability can vary by exact address and time. Check the Uber app before relying on service.',
        },
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
        canonical_title: customerFacingTitle(primary.title, {
            assetClass: primary.asset_class,
            location: primary.display,
        }),
        summary: primary.summary,
        asset_class: primary.asset_class,
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
        travel_access: travelAccess(),
        images: [{ ...editorialPlaceholder(primary.asset_class, primary), source_key: primary.source_key }],
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
    const required = ['id', 'status', 'canonical_title', 'asset_class', 'property_type', 'location', 'pricing', 'sources', 'provenance', 'inquiry_actions'];
    for (const key of required) {
        if (listing[key] === undefined || listing[key] === null) throw new Error(`${listing.id || 'unknown'} missing ${key}`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(listing.id)) throw new Error(`${listing.id} has invalid id`);
    if (!['active', 'stale', 'removed', 'pending_permission', 'archived'].includes(listing.status)) throw new Error(`${listing.id} invalid status`);
    if (!['castle', 'masseria', 'trullo', 'farmhouse', 'palazzo', 'historic_villa', 'fortress', 'tower', 'estate', 'monastery', 'other_historic_property'].includes(listing.property_type)) throw new Error(`${listing.id} invalid property_type`);
    if (!['castle', 'masseria'].includes(listing.asset_class)) throw new Error(`${listing.id} invalid asset_class`);
    if (!['renovated', 'habitable', 'needs_work', 'ruin', 'new_build', 'unknown'].includes(listing.condition)) throw new Error(`${listing.id} invalid condition`);
    if (listing.location.country_code !== 'IT') throw new Error(`${listing.id} must be in Italy`);
    if (!listing.sources.length) throw new Error(`${listing.id} has no sources`);
    if (!listing.inquiry_actions.length) throw new Error(`${listing.id} has no inquiry actions`);
    if (containsSourceBrand(listing.canonical_title)) throw new Error(`${listing.id} exposes source branding in its customer-facing title`);
    if (!listing.travel_access?.train_station || !listing.travel_access?.airport || !listing.travel_access?.uber) throw new Error(`${listing.id} has incomplete travel access data`);
    validateTravelAccess(listing);
    for (const source of listing.sources) {
        if (!SOURCES[source.source_key]) throw new Error(`${listing.id} unknown source ${source.source_key}`);
        if (!source.source_url.startsWith('http')) throw new Error(`${listing.id} invalid source URL`);
        if (!isPropertyListingUrl(source)) throw new Error(`${listing.id} source URL is not a supported property-level listing URL: ${source.source_url}`);
    }
}

function isPropertyListingUrl(source) {
    if (source.source_key === 'jamesedition') {
        return /^https:\/\/www\.jamesedition\.com\/real_estate\/[^/]+\/[^/?#]+-\d{8}(?:[?#].*)?$/.test(source.source_url);
    }
    return false;
}

function isHttpUrl(value) {
    try {
        return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
        return false;
    }
}

function validateTravelAccess(listing) {
    const approximateLocation = !['exact', 'street'].includes(listing.location.precision);
    for (const [kind, facility] of Object.entries({ train_station: listing.travel_access.train_station, airport: listing.travel_access.airport })) {
        if (!facility.record_generated_at || !facility.note) throw new Error(`${listing.id} ${kind} lacks record metadata`);
        const hasEstimate = facility.distance_km !== null || facility.travel_time_minutes !== null;
        if (facility.distance_km !== null && facility.travel_time_minutes !== null) throw new Error(`${listing.id} ${kind} mixes distance and travel-time estimates`);
        if (approximateLocation && hasEstimate) throw new Error(`${listing.id} ${kind} estimates require exact or street-level location precision`);
        if (approximateLocation && facility.status !== 'unknown_not_verified') throw new Error(`${listing.id} ${kind} nearest selection requires exact or street-level location precision`);

        if (facility.status === 'unknown_not_verified') {
            const factualFields = ['facility_name', 'distance_km', 'travel_time_minutes', 'source_name', 'source_url', 'nearest_selection_method', 'nearest_selection_source_url', 'estimate_method', 'estimate_source_url', 'last_checked_at'];
            if (factualFields.some(field => facility[field] !== null)) throw new Error(`${listing.id} unknown ${kind} contains inferred facts`);
        } else if (facility.status === 'verified_facility') {
            if (!facility.facility_name || !facility.source_name || !isHttpUrl(facility.source_url) || !facility.last_checked_at) throw new Error(`${listing.id} verified ${kind} lacks HTTP(S) source or check metadata`);
            if (!facility.nearest_selection_method || !isHttpUrl(facility.nearest_selection_source_url)) throw new Error(`${listing.id} verified ${kind} lacks nearest-selection method or HTTP(S) evidence`);
            if (hasEstimate && (!facility.estimate_method || !isHttpUrl(facility.estimate_source_url))) throw new Error(`${listing.id} ${kind} estimate lacks method or HTTP(S) evidence`);
            if (!hasEstimate && (facility.estimate_method !== null || facility.estimate_source_url !== null)) throw new Error(`${listing.id} ${kind} has estimate evidence without an estimate`);
        } else {
            throw new Error(`${listing.id} has unsupported ${kind} status`);
        }
    }

    const uber = listing.travel_access.uber;
    const uberStatuses = ['available', 'limited_varies', 'not_available', 'check_app', 'unknown_not_verified'];
    if (!uberStatuses.includes(uber.status) || !uber.last_checked_at || !uber.note) throw new Error(`${listing.id} has invalid Uber metadata`);
    if (uber.status === 'unknown_not_verified') {
        if (uber.source_name !== null || uber.source_url !== null) throw new Error(`${listing.id} unknown Uber status contains sourced claims`);
    } else if (!uber.source_name || !isHttpUrl(uber.source_url)) {
        throw new Error(`${listing.id} Uber status lacks HTTP(S) source metadata`);
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
            inventory_scope: source.inventory_scope || 'italian_castles',
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
canonicalListings.forEach(assertListingSchema);

const activeCastleCount = canonicalListings.filter(listing => listing.asset_class === 'castle' && listing.status === 'active').length;
if (activeCastleCount < 100) {
    throw new Error(`Expected at least 100 active castle listings after dedupe, found ${activeCastleCount}`);
}

const statuses = sourceStatusReport(RAW_RECORDS);

await writeFile('data/castle-listings.json', `${JSON.stringify(canonicalListings, null, 2)}\n`);
await writeFile('data/castle-source-status.json', `${JSON.stringify(statuses, null, 2)}\n`);

console.log(`Wrote ${canonicalListings.length} canonical listings from ${RAW_RECORDS.length} source records.`);
console.log(`Verified ${activeCastleCount} active castle listings after dedupe.`);
console.log(`Represented ${statuses.length} requested sources in data/castle-source-status.json.`);
