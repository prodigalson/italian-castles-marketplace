import canonicalListings from './data/castle-listings.json';
import sourceStatuses from './data/castle-source-status.json';
import { buildTravelAccess } from './travel-access.js';
import { googlePlacesByListingId } from './data/google-places.js';

const hiddenSummaryPrefixes = [
    "Manual memory import from Ava's previously shared",
    'Manual link-only JamesEdition category-card record',
];

const listings = canonicalListings.map(normalizeListing);

let currentSpread = 0;
let isTransitioning = false;
let magazineOpen = false;
let displayedListings = [];

const state = {
    section: 'castle',
    search: '',
    sort: 'featured',
    filters: {
        region: 'any',
        province: 'any',
        propertyType: 'any',
        price: 'any',
        bedrooms: 'any',
        size: 'any',
        land: 'any',
        condition: 'any',
        amenity: 'any',
    },
};

const sections = {
    castle: {
        key: 'castle',
        query: 'castles',
        assetClass: 'castle',
        navLabel: 'Castles',
        title: 'Find your Castle to Buy',
        description: 'Browse Fortresses, castles, towers, and palazzi in Italy',
        detailKicker: 'Italian Castle Marketplace',
        detailFooter: 'Link-only castle fixture data for buyer discovery',
        noResults: 'No castle listings match these filters.',
        sourceScope: 'italian_castles',
    },
    masseria: {
        key: 'masseria',
        query: 'masserias',
        assetClass: 'masseria',
        navLabel: 'Masserias',
        title: 'Find your Masseria to Buy',
        description: 'Browse Masserias in Puglia that are for sale',
        detailKicker: 'Puglia Masseria Marketplace',
        detailFooter: 'Link-only masseria fixture data for buyer discovery',
        noResults: 'No masseria listings match these filters.',
        sourceScope: 'puglia_masserias',
    },
};

let filterOptions = buildFilterOptions(sectionListings());

const filterLabels = {
    any: 'Any',
    'under-5m': 'Under EUR 5M',
    '5m-10m': 'EUR 5M-10M',
    '10m-plus': 'EUR 10M+',
    request: 'Price on request',
    '5-plus': '5+',
    '10-plus': '10+',
    '1000-plus': '1,000+ sqm',
    '3000-plus': '3,000+ sqm',
    '25-plus': '25+ ha',
    unknown: 'Unknown',
};

const loader = document.getElementById('loader');
const cover = document.getElementById('cover');
const magazine = document.getElementById('magazine');
const navPrev = document.getElementById('nav-prev');
const navNext = document.getElementById('nav-next');
const enterBtn = document.getElementById('enter-btn');
const kbHint = document.getElementById('kb-hint');
const toolbar = document.getElementById('toolbar');
const noResults = document.getElementById('no-results');
const noResultsText = document.getElementById('no-results-text');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

function unique(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function activeSection() {
    return sections[state.section] || sections.castle;
}

function sectionListings() {
    return listings.filter(listing => listing.assetClass === activeSection().assetClass);
}

function buildFilterOptions(items) {
    return {
        region: ['any', ...unique(items.map(item => item.location.region))],
        province: ['any', ...unique(items.map(item => item.location.province))],
        propertyType: ['any', ...unique(items.map(item => item.propertyType))],
        price: ['any', 'under-5m', '5m-10m', '10m-plus', 'request'],
        bedrooms: ['any', '5-plus', '10-plus', 'unknown'],
        size: ['any', '1000-plus', '3000-plus', 'unknown'],
        land: ['any', '5-plus', '25-plus', 'unknown'],
        condition: ['any', ...unique(items.map(item => item.condition))],
        amenity: ['any', ...unique(items.flatMap(item => item.amenities))],
    };
}

function normalizeListing(listing) {
    const mapContext = listing.location.map_context || {};
    const mapQuery = encodeURIComponent(listing.location.display);
    const verifiedGooglePlace = googlePlacesByListingId[listing.id] || null;
    // `verified` gates Google imagery and travel distances. Unverified listings still get a
    // Maps *search* link, which is honest about being a guess, but never a resolved place.
    const googlePlace = verifiedGooglePlace
        ? { ...verifiedGooglePlace, verified: true }
        : {
            expectedName: listing.canonical_title,
            mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.canonical_title}, ${listing.location.display}, Italy`)}`,
            verified: false,
        };
    const summary = listing.summary || '';

    return {
        id: listing.id,
        status: listing.status,
        title: googlePlace?.expectedName || listing.canonical_title,
        summary: hiddenSummaryPrefixes.some(prefix => summary.startsWith(prefix)) ? '' : summary,
        assetClass: listing.asset_class || 'castle',
        propertyType: listing.property_type,
        condition: listing.condition || 'unknown',
        location: {
            ...listing.location,
            mapContext: {
                publicLabel: mapContext.public_label || displayText(listing.location.precision),
                nearbyContext: mapContext.nearby_context || [],
                showMap: mapContext.show_map !== false,
            },
        },
        pricing: {
            currency: listing.pricing.currency,
            amount: listing.pricing.amount,
            priceOnRequest: listing.pricing.price_on_request,
        },
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        sizeSqm: listing.size?.value ?? null,
        landHectares: listing.land_area?.value ?? null,
        amenities: listing.amenities || [],
        travelAccess: normalizeTravelAccess(listing.travel_access),
        googlePlace,
        images: (listing.images || []).map(image => ({
            url: image.url,
            alt: image.alt,
            credit: image.credit || image.caption || 'Image credit unavailable',
            depictionType: image.depiction_type || 'editorial_placeholder',
            displayLabel: image.display_label || (image.depiction_type === 'actual_property' ? '' : 'Editorial placeholder images.'),
            rightsBasis: displayText(image.rights_basis || 'unknown'),
            rightsNote: image.rights_note || 'Image rights not documented.',
        })),
        mapUrl: googlePlace.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
        sources: listing.sources.map(source => ({
            sourceKey: source.source_key,
            sourceName: source.source_name,
            sourceUrl: source.source_url,
            sourceStatus: source.source_status,
            lastCheckedAt: source.last_checked_at,
            attributionLabel: source.attribution_label || `Source: ${source.source_name}`,
            licenseBasis: source.license_basis,
        })),
        provenance: {
            lastCheckedAt: listing.provenance.last_checked_at,
            notes: listing.provenance.notes || '',
        },
        inquiryActions: listing.inquiry_actions.map(action => ({
            type: action.type,
            label: action.label,
            url: action.url,
            sourceKey: action.source_key,
        })),
        dedupe: listing.dedupe,
    };
}

function normalizeTravelAccess(access = {}) {
    const normalizeFacility = facility => ({
        status: facility?.status || 'unknown_not_verified',
        name: facility?.facility_name || null,
        distanceKm: facility?.distance_km ?? null,
        travelTimeMinutes: facility?.travel_time_minutes ?? null,
        sourceName: facility?.source_name || null,
        sourceUrl: facility?.source_url || null,
        lastCheckedAt: facility?.last_checked_at || null,
        recordGeneratedAt: facility?.record_generated_at || null,
        note: facility?.note || 'No verified travel data is available.',
    });

    return {
        trainStation: normalizeFacility(access.train_station),
        airport: normalizeFacility(access.airport),
        uber: {
            status: access.uber?.status || 'unknown_not_verified',
            sourceName: access.uber?.source_name || null,
            sourceUrl: access.uber?.source_url || null,
            lastCheckedAt: access.uber?.last_checked_at || null,
            note: access.uber?.note || 'Availability has not been verified.',
        },
    };
}

function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatNumber(value) {
    if (value === null || value === undefined) return 'Not disclosed';
    return new Intl.NumberFormat('en-US').format(value);
}

function formatPrice(listing) {
    if (listing.pricing.priceOnRequest) return 'Price on request';
    if (!listing.pricing.amount) return 'Price unavailable';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: listing.pricing.currency,
        maximumFractionDigits: 0,
    }).format(listing.pricing.amount).replace('EUR', 'EUR ');
}

function displayText(value) {
    return String(value).replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function statusTone(status) {
    if (status === 'active' || status === 'link_only') return 'ok';
    if (status === 'blocked' || status === 'non_compliant_without_permission' || status === 'robots_disallow_public_scraping') return 'blocked';
    return 'caution';
}

function primarySource(listing) {
    return listing.sources[0];
}

function matchesPrice(listing, value) {
    const amount = listing.pricing.amount;
    if (value === 'request') return listing.pricing.priceOnRequest;
    if (value === 'under-5m') return amount !== null && amount < 5000000;
    if (value === '5m-10m') return amount !== null && amount >= 5000000 && amount < 10000000;
    if (value === '10m-plus') return amount !== null && amount >= 10000000;
    return true;
}

function matchesThreshold(actual, value, thresholds) {
    if (value === 'unknown') return actual === null || actual === undefined;
    if (!thresholds[value]) return true;
    return actual !== null && actual !== undefined && actual >= thresholds[value];
}

function applyFilters() {
    const query = state.search.trim().toLowerCase();
    const filtered = sectionListings().filter(listing => {
        const source = primarySource(listing);
        const haystack = [
            listing.title,
            listing.summary,
            listing.assetClass,
            listing.propertyType,
            listing.condition,
            listing.location.region,
            listing.location.province,
            listing.location.display,
            source.sourceName,
            ...listing.amenities,
        ].join(' ').toLowerCase();

        if (query && !haystack.includes(query)) return false;
        if (state.filters.region !== 'any' && listing.location.region !== state.filters.region) return false;
        if (state.filters.province !== 'any' && listing.location.province !== state.filters.province) return false;
        if (state.filters.propertyType !== 'any' && listing.propertyType !== state.filters.propertyType) return false;
        if (state.filters.condition !== 'any' && listing.condition !== state.filters.condition) return false;
        if (state.filters.amenity !== 'any' && !listing.amenities.includes(state.filters.amenity)) return false;
        if (!matchesPrice(listing, state.filters.price)) return false;
        if (!matchesThreshold(listing.bedrooms, state.filters.bedrooms, { '5-plus': 5, '10-plus': 10 })) return false;
        if (!matchesThreshold(listing.sizeSqm, state.filters.size, { '1000-plus': 1000, '3000-plus': 3000 })) return false;
        if (!matchesThreshold(listing.landHectares, state.filters.land, { '5-plus': 5, '25-plus': 25 })) return false;
        return true;
    });

    return sortListings(filtered);
}

function sortListings(items) {
    const sorted = [...items];
    const priceValue = item => item.pricing.amount ?? Number.POSITIVE_INFINITY;
    if (state.sort === 'price-asc') sorted.sort((a, b) => priceValue(a) - priceValue(b));
    if (state.sort === 'price-desc') sorted.sort((a, b) => (b.pricing.amount ?? -1) - (a.pricing.amount ?? -1));
    if (state.sort === 'size-desc') sorted.sort((a, b) => (b.sizeSqm ?? -1) - (a.sizeSqm ?? -1));
    if (state.sort === 'land-desc') sorted.sort((a, b) => (b.landHectares ?? -1) - (a.landHectares ?? -1));
    if (state.sort === 'checked-desc') sorted.sort((a, b) => new Date(b.provenance.lastCheckedAt) - new Date(a.provenance.lastCheckedAt));
    return sorted;
}

function buildPills() {
    filterOptions = buildFilterOptions(sectionListings());
    Object.entries(filterOptions).forEach(([key, values]) => {
        const row = document.querySelector(`.pill-row[data-filter="${key}"]`);
        if (!row) return;
        row.innerHTML = values.map(value => `
            <button class="pill${value === state.filters[key] ? ' active' : ''}" data-value="${value}" type="button">${filterLabels[value] || displayText(value)}</button>
        `).join('');
    });
}

function buildSourceCoverage() {
    const list = document.getElementById('source-coverage-list');
    const summary = document.getElementById('source-coverage-summary');
    if (!list || !summary) return;

    const scope = activeSection().sourceScope;
    const relevantSources = sourceStatuses.filter(source =>
        String(source?.inventory_scope || '').split(',').includes(scope)
    );
    const representedListings = relevantSources.filter(source => source.represented_as === 'listing_record').length;
    const unavailable = relevantSources.filter(source => source.adapter_status === 'blocked' || source.represented_as === 'source_status').length;
    summary.textContent = `${representedListings} ${activeSection().navLabel.toLowerCase()} source records currently provide link-only listing coverage. ${unavailable} requested sources are shown as permission, terms, or robots gaps until authorized access is available.`;

    list.innerHTML = relevantSources.map(source => {
        const tone = statusTone(source.compliance_status);
        const label = source.represented_as === 'listing_record'
            ? `${source.record_count} listing ${source.record_count === 1 ? 'record' : 'records'}`
            : 'source note only';
        return `
            <article class="source-coverage-item source-coverage-${tone}">
                <div>
                    <strong>${source.source_name}</strong>
                    <span>${label} · ${displayText(source.compliance_status)}</span>
                </div>
                <a href="${source.homepage_url}" target="_blank" rel="noopener">Source</a>
            </article>
        `;
    }).join('');
}

function buildSpread(listing, index, total) {
    const section = sections[listing.assetClass] || activeSection();
    const statusClass = listing.status === 'active' ? 'status-active' : listing.status === 'stale' ? 'status-stale' : 'status-removed';
    const priceClass = listing.pricing.priceOnRequest ? 'price-request' : 'price-asking';
    const images = listing.images.slice(0, 3);
    const gallery = images.map((image, galleryIndex) => `
        <button class="gallery-thumb${galleryIndex === 0 ? ' active' : ''}" type="button" data-image="${image.url}" data-alt="${image.alt}" aria-label="View image ${galleryIndex + 1}: ${image.displayLabel || 'Actual property image'}">
            <img src="${image.url}" alt="" loading="lazy" decoding="async">
        </button>
    `).join('');
    const titleClass = listing.title.length > 38 ? ' t-tight' : '';
    const originalListingUrl = listing.sources.find(item => item.sourceUrl)?.sourceUrl
        || listing.inquiryActions.find(action => action.url)?.url
        || null;

    return `
    <article class="spread" data-index="${index}" id="${listing.id}" aria-label="${listing.title}">
        <div class="page-left" data-listing-id="${listing.id}">
            <img class="hero-image" src="${images[0].url}" alt="${images[0].alt}" loading="eager" fetchpriority="high" decoding="async">
            ${images[0].displayLabel ? `<div class="image-placeholder-label">${images[0].displayLabel}</div>` : ''}
            <div class="image-rights">${images[0].credit} · ${images[0].rightsBasis}<span>${images[0].rightsNote}</span></div>
            <div class="gallery-strip" aria-label="Image gallery">${gallery}</div>
        </div>
        <div class="page-right">
            <header class="folio">
                <span>${section.detailKicker}</span>
                <span>${index + 1} / ${total}</span>
            </header>
            <div class="info-layout">
                <div class="eyebrow-row">
                    <span>${section.navLabel}</span>
                    <span>${displayText(listing.propertyType)}</span>
                    <span>${listing.location.region}</span>
                </div>
                <h2 class="destination-title${titleClass}">
                    ${listing.title}
                    <span>${listing.location.display}</span>
                </h2>
                ${listing.summary ? `<p class="destination-description">${listing.summary}</p>` : ''}

                <div class="status-row">
                    <span class="price-label ${priceClass}">${formatPrice(listing)}</span>
                    <span class="listing-status ${statusClass}">${displayText(listing.status)}</span>
                </div>

                <div class="info-cards">
                    <div class="info-card">
                        <div class="info-card-label">Bedrooms</div>
                        <div class="info-card-value">${listing.bedrooms ?? 'Unknown'}</div>
                        <div class="info-card-sub">${listing.bathrooms ?? 'Unknown'} baths</div>
                    </div>
                    <div class="info-card">
                        <div class="info-card-label">Interior</div>
                        <div class="info-card-value">${formatNumber(listing.sizeSqm)}</div>
                        <div class="info-card-sub">sqm</div>
                    </div>
                    <div class="info-card">
                        <div class="info-card-label">Land</div>
                        <div class="info-card-value">${listing.landHectares ?? 'Unknown'}</div>
                        <div class="info-card-sub">hectares</div>
                    </div>
                    <div class="info-card">
                        <div class="info-card-label">Condition</div>
                        <div class="info-card-value">${displayText(listing.condition)}</div>
                        <div class="info-card-sub">${listing.location.mapContext.publicLabel}</div>
                    </div>
                </div>

                <div class="amenity-row">
                    ${listing.amenities.map(amenity => `<span>${displayText(amenity)}</span>`).join('')}
                </div>

                <div class="lower-detail-layout">
                    <div class="property-detail-stack">
                        <div class="detail-grid">
                            <div>
                                <h3>Map Context</h3>
                                <p>${listing.location.mapContext.nearbyContext.join(' · ') || listing.location.mapContext.publicLabel}</p>
                                <a class="text-link" href="${listing.mapUrl}" target="_blank" rel="noopener">Open in Google Maps</a>
                            </div>
                        </div>

                        <div class="action-row">
                            ${originalListingUrl ? `<a class="action-btn" href="${originalListingUrl}" target="_blank" rel="noopener">Original listing</a>` : ''}
                            <button class="action-btn secondary share-dest-btn" type="button" data-dest-index="${index}">Share</button>
                        </div>
                    </div>
                    ${buildTravelAccess(listing)}
                </div>
            </div>
            <footer class="folio folio-footer">
                <span>${section.detailFooter}</span>
            </footer>
        </div>
    </article>`;
}

function renderWindow(centerIndex) {
    const total = displayedListings.length;
    if (total === 0) {
        magazine.innerHTML = '';
        noResults.classList.add('visible');
        return;
    }
    noResults.classList.remove('visible');

    const start = Math.max(0, centerIndex - 1);
    const end = Math.min(total - 1, centerIndex + 1);
    const existing = new Set();
    magazine.querySelectorAll('.spread').forEach(el => existing.add(el.dataset.index));
    const needed = new Set();
    for (let i = start; i <= end; i++) needed.add(String(i));

    magazine.querySelectorAll('.spread').forEach(el => {
        if (!needed.has(el.dataset.index)) el.remove();
    });
    for (let i = start; i <= end; i++) {
        if (!existing.has(String(i))) {
            const div = document.createElement('div');
            div.innerHTML = buildSpread(displayedListings[i], i, total);
            magazine.appendChild(div.firstElementChild);
            const spread = magazine.querySelector(`.spread[data-index="${i}"]`);
            hydrateGooglePlacePhoto(spread, displayedListings[i]);
            hydrateGoogleTravelAccess(spread, displayedListings[i]);
        }
    }

    magazine.querySelectorAll('.spread').forEach(el => el.classList.remove('active'));
    const activeEl = magazine.querySelector(`.spread[data-index="${centerIndex}"]`);
    if (activeEl) activeEl.classList.add('active');
    syncNavigationPlacement(activeEl);
    wireListingButtons();
    updateUrl();
}

async function hydrateGoogleTravelAccess(spread, listing) {
    const panel = spread?.querySelector('.travel-access');
    if (!panel || !listing.googlePlace?.verified || panel.dataset.googleTravelState) return;
    panel.dataset.googleTravelState = 'loading';

    try {
        const response = await fetch(`/api/travel-access?listingId=${encodeURIComponent(listing.id)}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Google Maps travel lookup unavailable');
        const travel = await response.json();

        for (const kind of ['trainStation', 'airport']) {
            const facility = travel[kind];
            const item = panel.querySelector(`[data-travel-kind="${kind}"]`);
            if (!facility || !item) continue;
            const detail = document.createElement('strong');
            detail.textContent = `${facility.name} · ${facility.distanceKm} km`;
            const mapLink = document.createElement('a');
            mapLink.href = facility.googleMapsUri;
            mapLink.target = '_blank';
            mapLink.rel = 'noopener';
            mapLink.textContent = 'Open in Google Maps';
            const checked = document.createElement('span');
            checked.textContent = 'Nearest Google Maps match';
            item.querySelector('dd').replaceChildren(detail, mapLink, checked);
            item.querySelector('p').textContent = `${facility.address || facility.name} · Straight-line distance from the property’s Google location.`;
        }

        const uberItem = panel.querySelector('[data-travel-kind="uber"]');
        if (travel.uber?.url && uberItem) {
            const detail = document.createElement('strong');
            detail.textContent = travel.uber.label;
            const uberLink = document.createElement('a');
            uberLink.href = travel.uber.url;
            uberLink.target = '_blank';
            uberLink.rel = 'noopener';
            uberLink.textContent = 'Open Uber with this pickup location';
            const checked = document.createElement('span');
            checked.textContent = 'Exact Google Maps coordinates supplied';
            uberItem.querySelector('dd').replaceChildren(detail, uberLink, checked);
            uberItem.querySelector('p').textContent = 'Uber will show live product and driver availability for the property’s exact location and selected time.';
        }

        panel.dataset.googleTravelState = 'loaded';
    } catch {
        panel.dataset.googleTravelState = 'fallback';
    }
}

async function hydrateGooglePlacePhoto(spread, listing) {
    if (!spread || !listing.googlePlace?.verified || spread.dataset.googlePhotoState) return;
    spread.dataset.googlePhotoState = 'loading';

    try {
        const response = await fetch(`/api/place-photo?listingId=${encodeURIComponent(listing.id)}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Google Places photo unavailable');
        const placePhoto = await response.json();
        if (!placePhoto.photoUrl) throw new Error('Google Places returned no photo URL');

        const alt = `${placePhoto.placeName}, from Google Maps.`;
        const hero = spread.querySelector('.hero-image');
        hero.src = placePhoto.photoUrl;
        hero.alt = alt;

        const firstThumb = spread.querySelector('.gallery-thumb');
        if (firstThumb) {
            firstThumb.dataset.image = placePhoto.photoUrl;
            firstThumb.dataset.alt = alt;
            firstThumb.setAttribute('aria-label', `View Google Places photo of ${placePhoto.placeName}`);
            const thumbImage = firstThumb.querySelector('img');
            if (thumbImage) thumbImage.src = placePhoto.photoUrl;
        }

        spread.querySelector('.image-placeholder-label')?.remove();
        const rights = spread.querySelector('.image-rights');
        rights.replaceChildren();

        const mapsLink = document.createElement('a');
        mapsLink.href = placePhoto.googleMapsUri || listing.googlePlace.mapsUrl;
        mapsLink.target = '_blank';
        mapsLink.rel = 'noopener';
        mapsLink.translate = false;
        mapsLink.textContent = 'Google Maps';
        rights.append(mapsLink);

        const note = document.createElement('span');
        for (const [index, legal] of [['Terms', '/terms.html'], ['Privacy', '/privacy.html']].entries()) {
            if (index) note.append(document.createTextNode(' · '));
            const legalLink = document.createElement('a');
            legalLink.href = legal[1];
            legalLink.textContent = legal[0];
            note.append(legalLink);
        }
        rights.append(note);
        spread.dataset.googlePhotoState = 'loaded';
    } catch {
        spread.dataset.googlePhotoState = 'fallback';
    }
}

function syncNavigationPlacement(activeSpread = magazine.querySelector('.spread.active')) {
    const pageLeft = activeSpread?.querySelector('.page-left');
    if (window.matchMedia('(max-width: 720px)').matches && pageLeft) {
        pageLeft.append(navPrev, navNext, kbHint);
    } else {
        document.querySelector('main').append(navPrev, navNext, kbHint);
    }
}

function renderMagazine(list) {
    updateSectionChrome();
    displayedListings = list;
    currentSpread = 0;
    isTransitioning = false;
    magazine.innerHTML = '';
    if (list.length === 0) {
        noResults.classList.add('visible');
        return;
    }
    noResults.classList.remove('visible');
    renderWindow(0);
}

function wireListingButtons() {
    magazine.querySelectorAll('.share-dest-btn').forEach(btn => {
        btn.addEventListener('click', () => shareListing(displayedListings[Number(btn.dataset.destIndex)]));
    });
    magazine.querySelectorAll('.gallery-thumb').forEach(btn => {
        btn.addEventListener('click', () => {
            const spread = btn.closest('.spread');
            const hero = spread.querySelector('.hero-image');
            hero.src = btn.dataset.image;
            hero.alt = btn.dataset.alt;
            spread.querySelectorAll('.gallery-thumb').forEach(item => item.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function updateUrl() {
    if (!magazineOpen || !displayedListings[currentSpread]) return;
    const listing = displayedListings[currentSpread];
    const params = new URLSearchParams(window.location.search);
    params.set('listing', listing.id);
    params.set('section', activeSection().query);
    if (state.search) params.set('q', state.search);
    else params.delete('q');
    history.replaceState(null, '', `?${params.toString()}`);
}

async function shareListing(listing) {
    const activeListing = listing || displayedListings[currentSpread];
    const title = activeListing ? activeListing.title : 'Browse Italian Historic Estates';
    const section = activeListing ? sections[activeListing.assetClass] || activeSection() : activeSection();
    const url = activeListing ? `${window.location.origin}${window.location.pathname}?section=${section.query}&listing=${activeListing.id}` : window.location.href;
    const text = activeListing ? `${title} · ${formatPrice(activeListing)} · ${activeListing.location.display}` : 'Browse Italian Historic Estates';
    if (navigator.share) {
        try { await navigator.share({ title, text, url }); } catch {}
    } else {
        try { await navigator.clipboard.writeText(`${text}\n${url}`); } catch {}
    }
}

function initFilters() {
    const panel = document.getElementById('filter-panel');
    const backdrop = document.getElementById('filter-backdrop');
    const filterBtn = document.getElementById('filter-btn');
    const closeBtn = document.getElementById('close-filters');
    const resetBtn = document.getElementById('reset-filters');
    const clearBtn = document.getElementById('clear-btn');
    const noResultsReset = document.getElementById('no-results-reset');

    const openPanel = () => {
        panel.classList.add('open');
        backdrop.classList.add('visible');
        document.getElementById('menu-popover').classList.remove('open');
    };
    const closePanel = () => {
        panel.classList.remove('open');
        backdrop.classList.remove('visible');
    };

    filterBtn.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    backdrop.addEventListener('click', closePanel);
    searchInput.addEventListener('input', () => {
        state.search = searchInput.value;
        renderMagazine(applyFilters());
        updateFilterIndicator();
    });
    sortSelect.addEventListener('change', () => {
        state.sort = sortSelect.value;
        renderMagazine(applyFilters());
        updateFilterIndicator();
    });

    document.querySelectorAll('.pill-row').forEach(row => {
        row.addEventListener('click', event => {
            const pill = event.target.closest('.pill');
            if (!pill) return;
            row.querySelectorAll('.pill').forEach(item => item.classList.remove('active'));
            pill.classList.add('active');
            state.filters[row.dataset.filter] = pill.dataset.value;
            renderMagazine(applyFilters());
            updateFilterIndicator();
        });
    });

    [resetBtn, clearBtn, noResultsReset].forEach(btn => btn.addEventListener('click', resetFilters));
}

function resetFilterState() {
    state.search = '';
    state.sort = 'featured';
    Object.keys(state.filters).forEach(key => { state.filters[key] = 'any'; });
    searchInput.value = '';
    sortSelect.value = 'featured';
}

function resetFilters() {
    resetFilterState();
    buildPills();
    document.querySelectorAll('.pill-row').forEach(row => {
        row.querySelectorAll('.pill').forEach(item => item.classList.remove('active'));
        const any = row.querySelector('[data-value="any"]');
        if (any) any.classList.add('active');
    });
    renderMagazine(applyFilters());
    updateFilterIndicator();
}

function updateFilterIndicator() {
    const btn = document.getElementById('menu-toggle');
    const hasFilter = state.search || state.sort !== 'featured' || Object.values(state.filters).some(value => value !== 'any');
    btn.classList.toggle('has-filter', Boolean(hasFilter));
}

function updateSectionChrome() {
    const section = activeSection();
    document.body.dataset.section = section.key;
    document.querySelectorAll('[data-section-copy="title"]').forEach(el => { el.textContent = section.title; });
    document.querySelectorAll('[data-section-copy="description"]').forEach(el => { el.textContent = section.description; });
    document.querySelectorAll('.cover-bg [data-section-cover]').forEach(img => {
        const active = img.dataset.sectionCover === section.key;
        if (!active) {
            img.classList.remove('is-active');
            return;
        }
        // Fading in before the bitmap has painted shows an empty black cover, which is what
        // a cold /?section=masserias load used to do while its image was still arriving.
        if (img.complete && img.naturalWidth > 0) img.classList.add('is-active');
        else img.addEventListener('load', () => {
            if (img.dataset.sectionCover === activeSection().key) img.classList.add('is-active');
        }, { once: true });
    });
    // The castle credit is the unmarked default; every other section marks its own.
    document.querySelectorAll('.cover-image-credit').forEach(credit => {
        const creditSection = credit.dataset.sectionCredit || 'castle';
        credit.hidden = creditSection !== section.key;
        if (credit.hidden) credit.open = false;
    });
    document.querySelectorAll('[data-section-button]').forEach(btn => {
        const active = btn.dataset.sectionButton === section.key;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
    });
    if (noResultsText) noResultsText.textContent = section.noResults;
    document.title = section.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', section.description);
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach(meta => {
        meta.setAttribute('content', section.title);
    });
    document.querySelectorAll('meta[property="og:description"], meta[name="twitter:description"]').forEach(meta => {
        meta.setAttribute('content', section.description);
    });
    document.querySelectorAll('meta[property="og:site_name"], meta[property="og:image:alt"]').forEach(meta => {
        meta.setAttribute('content', section.title);
    });
}

function setSection(sectionKey, options = {}) {
    if (!sections[sectionKey]) return;
    const changed = state.section !== sectionKey;
    state.section = sectionKey;
    if (changed || options.resetFilters) resetFilterState();
    buildPills();
    buildSourceCoverage();
    renderMagazine(applyFilters());
    updateFilterIndicator();
    if (options.open) openMagazine();
}

function initSectionControls() {
    document.querySelectorAll('[data-section-button]').forEach(btn => {
        btn.addEventListener('click', () => setSection(btn.dataset.sectionButton, { resetFilters: true }));
    });
}

function initMenu() {
    const toggle = document.getElementById('menu-toggle');
    const popover = document.getElementById('menu-popover');
    toggle.addEventListener('click', event => {
        event.stopPropagation();
        const isOpen = popover.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', event => {
        if (!popover.contains(event.target) && event.target !== toggle) {
            popover.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

function openMagazine() {
    magazineOpen = true;
    cover.classList.add('hidden');
    magazine.classList.add('active');
    navPrev.classList.add('visible');
    navNext.classList.add('visible');
    toolbar.classList.add('visible');
    kbHint.classList.add('visible');
    renderWindow(currentSpread);
    setTimeout(() => kbHint.classList.remove('visible'), 4000);
}

function closeMagazine() {
    magazineOpen = false;
    cover.classList.remove('hidden');
    magazine.classList.remove('active');
    navPrev.classList.remove('visible');
    navNext.classList.remove('visible');
    toolbar.classList.remove('visible');
    kbHint.classList.remove('visible');
    const params = new URLSearchParams();
    params.set('section', activeSection().query);
    history.replaceState(null, '', `?${params.toString()}`);
}

function isInteractiveTarget(target) {
    return Boolean(target.closest('input, textarea, select, button, a, [contenteditable="true"], .filter-panel, .menu-popover'));
}

function isControlSurfaceOpen() {
    return Boolean(document.querySelector('.filter-panel.open, .menu-popover.open'));
}

function handleKey(event) {
    if (isControlSurfaceOpen()) return;
    if (isInteractiveTarget(event.target)) return;

    if (!magazineOpen) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openMagazine();
        }
        return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === ' ') {
        event.preventDefault();
        goNext();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        goPrev();
    } else if (event.key === 'Escape') {
        closeMagazine();
    }
}

function handleWheel(event) {
    if (!magazineOpen || window.innerWidth <= 1024) return;
    if (event.target.closest('.filter-panel, .menu-popover')) return;
    event.preventDefault();
    if (Math.abs(event.deltaY) > 30) event.deltaY > 0 ? goNext() : goPrev();
}

function goTo(index) {
    if (isTransitioning || index === currentSpread) return;
    if (index < 0 || index >= displayedListings.length) return;
    isTransitioning = true;
    currentSpread = index;
    renderWindow(index);
    setTimeout(() => { isTransitioning = false; }, 420);
}

function goNext() {
    const n = displayedListings.length;
    if (n > 0) goTo((currentSpread + 1) % n);
}

function goPrev() {
    const n = displayedListings.length;
    if (n > 0) goTo((currentSpread - 1 + n) % n);
}

function initDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const sectionParam = params.get('section');
    if (sectionParam === 'masserias' || sectionParam === 'masseria') state.section = 'masseria';
    if (sectionParam === 'castles' || sectionParam === 'castle') state.section = 'castle';

    const listingId = params.get('listing');
    if (listingId) {
        const deepLinkedListing = listings.find(item => item.id === listingId || slugify(item.title) === listingId);
        if (deepLinkedListing?.assetClass && sections[deepLinkedListing.assetClass]) state.section = deepLinkedListing.assetClass;
    }

    const query = params.get('q');
    if (query) {
        state.search = query;
        searchInput.value = query;
    }
    buildPills();
    buildSourceCoverage();
    renderMagazine(applyFilters());
    if (listingId) {
        const index = displayedListings.findIndex(item => item.id === listingId || slugify(item.title) === listingId);
        if (index >= 0) {
            currentSpread = index;
            setTimeout(() => {
                openMagazine();
                renderWindow(index);
            }, 800);
        }
    }
}

function initLoader() {
    let loaderDismissed = false;
    const dismissLoader = () => {
        if (loaderDismissed) return;
        loaderDismissed = true;
        const fill = document.querySelector('.loader-fill');
        if (fill) fill.style.width = '100%';
        setTimeout(() => loader.classList.add('hidden'), 600);
    };
    const coverImg = document.querySelector('.cover-bg img');
    if (coverImg && coverImg.complete && coverImg.naturalWidth > 0) dismissLoader();
    else if (coverImg) {
        coverImg.addEventListener('load', dismissLoader, { once: true });
        coverImg.addEventListener('error', dismissLoader, { once: true });
    }
    requestAnimationFrame(() => { document.querySelector('.loader-fill').style.width = '60%'; });
    setTimeout(dismissLoader, 2600);
}

function initTouch() {
    let touchStartX = 0;
    let touchStartY = 0;
    document.addEventListener('touchstart', event => {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }, { passive: true });
    document.addEventListener('touchend', event => {
        if (!magazineOpen) return;
        const dx = event.changedTouches[0].clientX - touchStartX;
        const dy = event.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) dx < 0 ? goNext() : goPrev();
    }, { passive: true });
}

function init() {
    initSectionControls();
    initDeepLink();
    initLoader();
    initMenu();
    initFilters();
    initTouch();
    enterBtn.addEventListener('click', openMagazine);
    navPrev.addEventListener('click', goPrev);
    navNext.addEventListener('click', goNext);
    window.addEventListener('resize', () => syncNavigationPlacement());
    document.getElementById('share-btn').addEventListener('click', () => shareListing());
    document.addEventListener('keydown', handleKey);
    document.addEventListener('wheel', handleWheel, { passive: false });
}

init();
