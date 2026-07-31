import { buildTravelAccess, escapeHtml, safeHttpUrl } from '../travel-access.js';

const maliciousText = `<img src=x onerror="alert('travel')">`;
const escaped = escapeHtml(maliciousText);

check(!escaped.includes('<img'), 'Travel text escaping left executable markup intact.');
check(escaped.includes('&lt;img') && escaped.includes('&quot;') && escaped.includes('&#039;'), 'Travel text escaping is incomplete.');
check(safeHttpUrl('javascript:alert(1)') === null, 'Unsafe javascript travel URL was accepted.');
check(safeHttpUrl('data:text/html,unsafe') === null, 'Unsafe data travel URL was accepted.');
check(safeHttpUrl('not a url') === null, 'Malformed travel URL was accepted.');
check(safeHttpUrl('https://www.rfi.it/it/stazioni.html')?.startsWith('https://'), 'Valid HTTPS travel URL was rejected.');

const maliciousFacility = {
    name: maliciousText,
    distanceKm: null,
    travelTimeMinutes: null,
    sourceName: maliciousText,
    sourceUrl: 'javascript:alert(1)',
    lastCheckedAt: null,
    recordGeneratedAt: '2026-07-31T00:00:00.000Z',
    note: maliciousText,
};
const rendered = buildTravelAccess({
    id: `unsafe\" onclick=\"alert(1)`,
    travelAccess: {
        trainStation: maliciousFacility,
        airport: maliciousFacility,
        uber: { ...maliciousFacility, status: 'check_app' },
    },
});
check(!rendered.includes('<img'), 'Integrated travel renderer emitted sourced markup.');
check(!rendered.includes('href="javascript:'), 'Integrated travel renderer emitted an unsafe sourced link.');
check(rendered.includes('&lt;img') && rendered.includes('Record refreshed Jul 31, 2026 · No verified source'), 'Integrated travel renderer did not safely render the malicious fixture.');

console.log('Travel rendering safety passed: the integrated panel escapes sourced text and accepts only HTTP(S) links.');

function check(condition, message) {
    if (!condition) throw new Error(message);
}
