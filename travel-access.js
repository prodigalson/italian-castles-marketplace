export function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function safeHttpUrl(value) {
    if (typeof value !== 'string' || value.length === 0) return null;
    try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

function formatDate(value) {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function facilityDetail(facility) {
    if (!facility.name) return 'Unknown/Not verified';
    if (facility.distanceKm !== null) return `${facility.name} · ${facility.distanceKm} km`;
    if (facility.travelTimeMinutes !== null) return `${facility.name} · about ${facility.travelTimeMinutes} min`;
    return facility.name;
}

function accessMeta(item) {
    const timestamp = item.lastCheckedAt
        ? `Checked ${formatDate(item.lastCheckedAt)}`
        : item.recordGeneratedAt
            ? `Record refreshed ${formatDate(item.recordGeneratedAt)}`
            : 'Record date unavailable';
    const sourceUrl = safeHttpUrl(item.sourceUrl);
    if (!item.sourceName || !sourceUrl) return `<span>${escapeHtml(timestamp)} · No verified source</span>`;
    return `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(item.sourceName)}</a><span>${escapeHtml(timestamp)}</span>`;
}

function uberStatusLabel(status) {
    return {
        available: 'Available',
        limited_varies: 'Limited/varies',
        not_available: 'Not available',
        check_app: 'Check the Uber app',
        unknown_not_verified: 'Unknown/Not verified',
    }[status] || 'Unknown/Not verified';
}

export function buildTravelAccess(listing) {
    const access = listing.travelAccess;
    const panelId = `travel-access-${escapeHtml(listing.id)}`;
    return `
        <aside class="travel-access" aria-labelledby="${panelId}">
            <div class="travel-access-heading">
                <p>Getting there</p>
                <h3 id="${panelId}">Travel &amp; access</h3>
            </div>
            <dl class="travel-access-list">
                <div class="travel-access-item" data-travel-kind="trainStation">
                    <dt>Closest train station</dt>
                    <dd><strong>${escapeHtml(facilityDetail(access.trainStation))}</strong>${accessMeta(access.trainStation)}</dd>
                    <p>${escapeHtml(access.trainStation.note)}</p>
                </div>
                <div class="travel-access-item" data-travel-kind="airport">
                    <dt>Closest airport</dt>
                    <dd><strong>${escapeHtml(facilityDetail(access.airport))}</strong>${accessMeta(access.airport)}</dd>
                    <p>${escapeHtml(access.airport.note)}</p>
                </div>
                <div class="travel-access-item" data-travel-kind="uber">
                    <dt>Uber</dt>
                    <dd><strong>${escapeHtml(uberStatusLabel(access.uber.status))}</strong>${accessMeta(access.uber)}</dd>
                    <p>${escapeHtml(access.uber.note)}</p>
                </div>
            </dl>
        </aside>`;
}
