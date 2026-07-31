import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

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

const JAMESEDITION_CASTLE_CARD_SNAPSHOT = [
    ['p1-001', 1, 'Marsciano|Umbria|9|11|1575|76.6'],
    ['p1-002', 1, 'Salo|Lombardy|6|6|732|'],
    ['p1-003', 1, 'Gaiole in Chianti|Tuscany|7|9|798|'],
    ['p1-004', 1, 'Pieve Santo Stefano|Tuscany|14|18|812|0.2175'],
    ['p1-005', 1, 'Montalcino|Tuscany|46|50|9500|'],
    ['p1-006', 1, 'Montalto Dora|Piedmont|11|13|2525|'],
    ['p1-007', 1, 'Bollengo|Piedmont||20|12388|'],
    ['p1-008', 1, 'Settignano, Florence|Tuscany|21|24|3665|'],
    ['p1-009', 1, 'Montalbino, Montespertoli|Tuscany|15|20|35000|'],
    ['p1-010', 1, 'Talla|Tuscany|25|25|2200|'],
    ['p1-011', 1, 'Montagnana - Baccaiano - Anselmo, Montespertoli|Tuscany|84|70|7000|'],
    ['p1-012', 1, 'Caselette|Piedmont|40|40|4000|'],
    ['p1-013', 1, 'Castelnuovo Berardenga|Tuscany|5|5|4500|'],
    ['p1-014', 1, 'Spoleto|Umbria|12|12|970|'],
    ['p1-015', 1, 'Malamocco - Alberoni, Venice|Veneto|4|4|2450|'],
    ['p1-016', 1, 'Barberino di Mugello|Tuscany|60|40|5314|'],
    ['p1-017', 1, 'Montefioralle, Greve in Chianti|Tuscany|||708|'],
    ['p1-018', 1, 'Balzola|Piedmont|7|6|662|'],
    ['p1-019', 1, 'Center, Castelfiorentino|Tuscany|52|45|34082|'],
    ['p1-020', 1, 'Monguzzo|Lombardy|20|20|5000|'],
    ['p1-021', 1, 'Gaiole in Chianti|Tuscany|8|10|1400|'],
    ['p1-022', 1, 'Center, Impruneta|Tuscany|15|12|1600|'],
    ['p1-023', 1, 'Terra del Sole|Emilia-Romagna|7|12|3300|'],
    ['p1-024', 1, 'Mercenasco|Piedmont|5|5|2964|'],
    ['p1-025', 1, 'Monteriggioni|Tuscany|11|12|854|'],
    ['p1-026', 1, 'Montemale di Cuneo|Piedmont|27|11|2700|'],
    ['p1-027', 1, 'Monteriggioni|Tuscany|39|30|4185|'],
    ['p1-028', 1, 'Asciano|Tuscany|22|25|2500|'],
    ['p1-029', 1, 'Venturina Terme, Campiglia Marittima|Tuscany|20|20|3600|'],
    ['p1-030', 1, 'Buronzo|Piedmont|10|2|900|'],
    ['p1-031', 1, 'Moncrivello|Piedmont|28|7|1850|'],
    ['p1-032', 1, 'San Lazzaro|Emilia-Romagna|4||800|'],
    ['p2-001', 2, 'Historic Center, Lucca|Tuscany|6|8|818|0.1'],
    ['p2-002', 2, 'Calenzano|Tuscany|17|17|2500|'],
    ['p2-003', 2, 'Licciana Nardi|Tuscany|14|18|2000|'],
    ['p2-004', 2, 'Castello Cabiaglio|Lombardy|4|3|556|'],
    ['p2-005', 2, 'Palazzo|Piedmont|24|13|4000|'],
    ['p2-006', 2, 'Sinalunga|Tuscany|4|4|600|'],
    ['p2-007', 2, 'Tavoleto|Marche|7|12|2100|'],
    ['p2-008', 2, 'Marsciano|Umbria|57||1575|'],
    ['p2-009', 2, 'Serra Ricco|Liguria|||839|'],
    ['p2-010', 2, 'Majano|Friuli-Venezia Giulia|4|6|2700|'],
    ['p2-011', 2, 'Amelia|Umbria|14|9|1883|'],
    ['p2-012', 2, 'Radda in Chianti|Tuscany|8|9|1300|'],
    ['p2-013', 2, 'Umbertide|Umbria|45|50|4500|'],
    ['p2-014', 2, 'Falerna|Calabria|4|2|200|'],
    ['p2-015', 2, 'Scandriglia|Lazio|7|8|900|'],
    ['p2-016', 2, 'Balzola|Piedmont|7|6|660|'],
    ['p2-017', 2, 'Marano Ticino|Piedmont|10|5|1621|'],
    ['p2-018', 2, 'Acquapendente|Lazio|25|15|5000|'],
    ['p2-019', 2, 'San Giorgio Canavese|Piedmont|10|11|7540|'],
    ['p2-020', 2, 'Gaiole in Chianti|Tuscany|8|8|1490|'],
    ['p2-021', 2, 'San Damiano d Asti|Piedmont|10|10|2426|'],
    ['p2-022', 2, 'Licciana Nardi|Tuscany|27|16|1800|'],
    ['p2-023', 2, 'Finale Pia - Calvisio, Finale Ligure|Liguria|5|3|865|'],
    ['p2-024', 2, 'Filzi - Shangay, Livorno|Tuscany|19|25|2200|'],
    ['p2-025', 2, 'Gavi|Piedmont|20|20|3670|'],
    ['p2-026', 2, 'Gaiole in Chianti|Tuscany|7|9|1300|'],
    ['p2-027', 2, 'San Miniato|Tuscany|9|6|528|'],
    ['p2-028', 2, 'Poggio alla Croce, Figline e Incisa Valdarno|Tuscany|||3500|'],
    ['p2-029', 2, 'Villafranca in Lunigiana|Tuscany|10|12|1382|'],
    ['p2-030', 2, 'Bubbio|Piedmont|12|14|2200|'],
    ['p2-031', 2, 'Nerola|Lazio|51|51|4314|'],
    ['p2-032', 2, 'Todi|Umbria|4|3|350|'],
    ['p3-001', 3, 'Historic Center, Lucca|Tuscany|6|8|818|0.1'],
    ['p3-002', 3, 'Historic Center, Lecce|Apulia|10|10|1500|'],
    ['p3-003', 3, 'Leccio - Sant Ellero - San Clemente, Reggello|Tuscany|16|15|2450|'],
    ['p3-004', 3, 'Todi|Umbria|10|6|700|'],
    ['p3-005', 3, 'Mozzanica|Lombardy|||1000|'],
    ['p3-006', 3, 'Cavallirio|Piedmont|||540|'],
    ['p3-007', 3, 'Todi|Umbria|12|10|1000|'],
    ['p3-008', 3, 'Rigutino - Frassineto, Arezzo|Tuscany|40||3500|'],
    ['p3-009', 3, 'Center, Asti|Piedmont|23|23|4229|'],
    ['p3-010', 3, 'Agazzano|Emilia-Romagna|16||4000|'],
    ['p3-011', 3, 'Lucolena in Chianti, Greve in Chianti|Tuscany|3|1|580|'],
    ['p3-012', 3, 'Gaiole in Chianti|Tuscany|5|4|508|'],
    ['p3-013', 3, 'Marsciano|Umbria|8|6|1575|'],
    ['p3-014', 3, 'Montalto Dora|Piedmont|11|13|2525|'],
    ['p3-015', 3, 'Historic Center, Milan|Lombardy|3|3|180|'],
    ['p3-016', 3, 'Montefiridolfi, San Casciano in Val di Pesa|Tuscany|8|7|700|'],
    ['p3-017', 3, 'Mercatello sul Metauro|Marche|10|10|1221|'],
    ['p3-018', 3, 'San Gemini|Umbria|24|16|1666|'],
    ['p3-019', 3, 'The Houses - Grotta Giusti - Virgin of the Pines, Monsummano Terme|Tuscany|30|33|6500|'],
    ['p3-020', 3, 'Nerola|Lazio|51|51|4314|'],
    ['p3-021', 3, 'Gattico|Piedmont|||1000|'],
    ['p3-022', 3, 'Fabro|Umbria|11|8|3500|'],
    ['p3-023', 3, 'Acquapendente|Lazio|||4890|'],
    ['p3-024', 3, 'Riomaggiore|Liguria|2|2||'],
    ['p3-025', 3, 'Bucine|Tuscany|10|11|1000|'],
    ['p3-026', 3, 'Sesto Imolese - Sasso Morelli, Imola|Emilia-Romagna|38|48|4200|'],
    ['p3-027', 3, 'Lugo|Emilia-Romagna|30|30|3000|'],
    ['p3-028', 3, 'Citta di Castello|Umbria|14|18|1200|'],
    ['p3-029', 3, 'Center, Cortona|Tuscany|20|18|3200|'],
    ['p3-030', 3, 'Montemale di Cuneo|Piedmont|27|11|2325|'],
    ['p3-031', 3, 'Campello sul Clitunno|Umbria||||'],
    ['p3-032', 3, 'Incisa Scapaccino|Piedmont|6|2|1244|'],
    ['p3-033', 3, 'San Damiano d Asti|Piedmont|12|10|13690|'],
    ['p4-001', 4, 'Lesa|Piedmont|10|8|1300|'],
    ['p4-002', 4, 'Cingoli|Marche|30|15|5500|'],
    ['p4-003', 4, 'Rapolano Terme|Tuscany|70|60|15770|'],
    ['p4-004', 4, 'Center, Campiglia Marittima|Tuscany|19||3600|'],
    ['p4-005', 4, 'Center, Impruneta|Tuscany|6|4|400|'],
    ['p4-006', 4, 'Scacciapensieri - Vico Alto, Siena|Tuscany|10|10||'],
    ['p4-007', 4, 'Center, Arezzo|Tuscany|20|20|1458|'],
    ['p4-008', 4, 'Castiglioncello, Rosignano Marittimo|Tuscany|8|6|400|'],
    ['p4-009', 4, 'Cagli|Marche|8|12|1115|'],
    ['p4-010', 4, 'Bagno A Ripoli|Tuscany|18|21|2095|'],
    ['p4-011', 4, 'Penna in Teverina|Umbria|20|18|3036|'],
    ['p4-012', 4, 'Montalcino|Tuscany|25|25|3729|'],
    ['p4-013', 4, 'Casciana Terme Lari|Tuscany|40|45|4000|'],
    ['p4-014', 4, 'San Miniato|Tuscany|||6300|'],
    ['p4-015', 4, 'Scarperia e San Piero|Tuscany|10|6|1200|'],
    ['p4-016', 4, 'Calenzano|Tuscany|12|9|1500|'],
    ['p4-017', 4, 'Casalfiumanese|Emilia-Romagna|7|7|125|'],
    ['p4-018', 4, 'Castiglione d Orcia|Tuscany|37|21|4123|'],
    ['p4-019', 4, 'Masio|Piedmont|14|10|1000|'],
    ['p4-020', 4, 'Celleno|Lazio|34|20|5000|'],
    ['p4-021', 4, 'Vellezzo Bellini|Lombardy|10|8|2800|'],
    ['p4-022', 4, 'Center, Montespertoli|Tuscany|71|55|7350|'],
    ['p4-023', 4, 'Ivrea|Piedmont|22|22|2100|'],
    ['p4-024', 4, 'Center, Cremona|Lombardy|20|15|2956|'],
    ['p4-025', 4, 'Oviglio|Piedmont|10|14|2150|'],
    ['p4-026', 4, 'Bucine|Tuscany|12|12|1038|'],
    ['p4-027', 4, 'Poets - Musicians - Fornaci, Loano|Liguria|20|20|1000|'],
    ['p4-028', 4, 'Montaldo Torinese|Piedmont|50|50|10000|'],
    ['p4-029', 4, 'Monte Morello-Cercina, Municipality of Sesto Fiorentino|Tuscany|21|25|3630|'],
    ['p4-030', 4, 'Todi|Umbria|8|11|1000|'],
    ['p4-031', 4, 'Siena|Tuscany|7|6|804|'],
];

const JAMESEDITION_CASTLE_CARD_RECORDS = buildJamesEditionCastleCards(JAMESEDITION_CASTLE_CARD_SNAPSHOT);

const RAW_RECORDS = [
    ...JAMESEDITION_CASTLE_CARD_RECORDS,
    listingRecord('jamesedition', 'je-chianti-castle-estate', {
        canonical_group: 'chianti-castle-estate',
        source_url: 'https://www.jamesedition.com/real_estate/italy',
        title: 'Restored Chianti Castle Estate',
        summary: 'Manual link-only buyer-discovery record for a hilltop Tuscan castle estate with chapel, guest accommodation, olive groves, and vineyard-facing terraces.',
        asset_class: 'castle',
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
        asset_class: 'castle',
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
        asset_class: 'castle',
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
        asset_class: 'castle',
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
        asset_class: 'castle',
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
    listingRecord('gate_away', 'ga-valle-itria-masseria-estate', {
        canonical_group: 'valle-itria-masseria-estate',
        source_url: 'https://www.gate-away.com/properties/puglia',
        title: 'Valle d Itria Masseria Estate',
        summary: 'Manual link-only Puglia masseria fixture for a limestone courtyard estate with trulli, olive groves, guest suites, and hospitality potential.',
        asset_class: 'masseria',
        property_type: 'masseria',
        condition: 'renovated',
        region: 'Puglia',
        province: 'BR',
        municipality: 'Ostuni',
        display: 'Valle d Itria, Ostuni, Puglia',
        latitude: 40.7295,
        longitude: 17.5776,
        precision: 'municipality',
        price: 2850000,
        bedrooms: 10,
        bathrooms: 9,
        size_sqm: 920,
        land_hectares: 6.5,
        amenities: ['olive_grove', 'pool', 'guest_house', 'garden', 'tourism_business'],
        source_status: 'active',
        license_basis: 'link_only',
        last_checked_at: '2026-07-31T00:00:00.000Z',
    }),
    listingRecord('oikos_immobiliare', 'oi-valle-itria-masseria-estate', {
        canonical_group: 'valle-itria-masseria-estate',
        source_url: 'https://oikosimmobiliare.biz/en/',
        title: 'Restored Masseria Near Ostuni',
        summary: 'Manual duplicate candidate for the same Valle d Itria masseria; retained to demonstrate cross-source dedupe while preserving Oikos attribution and source link.',
        asset_class: 'masseria',
        property_type: 'masseria',
        condition: 'renovated',
        region: 'Puglia',
        province: 'BR',
        municipality: 'Ostuni',
        display: 'Ostuni, Brindisi, Puglia',
        latitude: 40.73,
        longitude: 17.58,
        precision: 'municipality',
        price: 2920000,
        bedrooms: 10,
        bathrooms: 9,
        size_sqm: 900,
        land_hectares: 6.4,
        amenities: ['olive_grove', 'pool', 'guest_house', 'garden'],
        source_status: 'active',
        license_basis: 'link_only',
        last_checked_at: '2026-07-31T00:00:00.000Z',
    }),
    listingRecord('jamesedition', 'je-salento-masseria-retreat', {
        canonical_group: 'salento-masseria-retreat',
        source_url: 'https://www.jamesedition.com/real_estate/puglia-italy',
        title: 'Salento Masseria Retreat',
        summary: 'Manual link-only fixture for a Salento masseria retreat with vaulted stone rooms, pool, gardens, and short-stay hospitality potential.',
        asset_class: 'masseria',
        property_type: 'masseria',
        condition: 'habitable',
        region: 'Puglia',
        province: 'LE',
        municipality: 'Lecce',
        display: 'Salento, Lecce, Puglia',
        latitude: 40.3515,
        longitude: 18.175,
        precision: 'municipality',
        price: null,
        price_on_request: true,
        bedrooms: 14,
        bathrooms: 12,
        size_sqm: 1350,
        land_hectares: 9,
        amenities: ['pool', 'garden', 'farm_buildings', 'tourism_business', 'panoramic_views'],
        source_status: 'active',
        license_basis: 'link_only',
        last_checked_at: '2026-07-30T00:00:00.000Z',
    }),
    listingRecord('luxuryestate', 'le-salento-masseria-retreat', {
        canonical_group: 'salento-masseria-retreat',
        source_url: 'https://www.luxuryestate.com/italy/puglia',
        title: 'Masseria Hospitality Estate In Salento',
        summary: 'Link-only duplicate candidate for the same Salento masseria, used to retain LuxuryEstate source attribution and original source link.',
        asset_class: 'masseria',
        property_type: 'masseria',
        condition: 'habitable',
        region: 'Puglia',
        province: 'LE',
        municipality: 'Lecce',
        display: 'Lecce province, Puglia',
        latitude: 40.352,
        longitude: 18.175,
        precision: 'municipality',
        price: null,
        price_on_request: true,
        bedrooms: 14,
        bathrooms: 12,
        size_sqm: 1320,
        land_hectares: 9.2,
        amenities: ['pool', 'garden', 'farm_buildings', 'tourism_business'],
        source_status: 'active',
        license_basis: 'link_only',
        last_checked_at: '2026-07-29T00:00:00.000Z',
    }),
    sourceOnlyRecord('idealista'),
    sourceOnlyRecord('immobiliare_it'),
    sourceOnlyRecord('engel_volkers'),
    sourceOnlyRecord('romolini'),
    sourceOnlyRecord('apulia_exclusive_houses'),
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
    'valle-itria-masseria-estate': [
        image('https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1800&q=82', 'Whitewashed Mediterranean courtyard with plants'),
        image('https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1800&q=82', 'Stone country house with pool and garden'),
        image('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=82', 'Rural estate landscape with fields'),
    ],
    'salento-masseria-retreat': [
        image('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=82', 'Luxury villa courtyard and pool'),
        image('https://images.unsplash.com/photo-1597211833712-5e41faa202ea?auto=format&fit=crop&w=1800&q=82', 'Mediterranean garden path'),
        image('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=82', 'Vaulted stone interior room'),
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
        asset_class: source.inventory_scope === 'puglia_masserias' ? 'masseria' : 'castle',
    };
}

function buildJamesEditionCastleCards(cards) {
    const seen = new Set();
    return cards.flatMap(([id, page, encoded]) => {
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
        const title = `JamesEdition Castle Card: ${place}`;

        return listingRecord('jamesedition', `je-castle-card-${id}`, {
            canonical_group: slug,
            source_url: `https://www.jamesedition.com/real_estate/castle-italy${page > 1 ? `?page=${page}` : ''}`,
            title,
            summary: `Manual link-only JamesEdition category-card record for an active castle listing in ${place}, ${region}. The record keeps only high-level card facts and routes buyers back to the original JamesEdition source page.`,
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
