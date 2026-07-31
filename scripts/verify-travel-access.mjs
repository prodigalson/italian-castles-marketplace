import { escapeHtml, safeHttpUrl } from '../travel-access.js';

const maliciousText = `<img src=x onerror="alert('travel')">`;
const escaped = escapeHtml(maliciousText);

check(!escaped.includes('<img'), 'Travel text escaping left executable markup intact.');
check(escaped.includes('&lt;img') && escaped.includes('&quot;') && escaped.includes('&#039;'), 'Travel text escaping is incomplete.');
check(safeHttpUrl('javascript:alert(1)') === null, 'Unsafe javascript travel URL was accepted.');
check(safeHttpUrl('data:text/html,unsafe') === null, 'Unsafe data travel URL was accepted.');
check(safeHttpUrl('not a url') === null, 'Malformed travel URL was accepted.');
check(safeHttpUrl('https://www.rfi.it/it/stazioni.html')?.startsWith('https://'), 'Valid HTTPS travel URL was rejected.');

console.log('Travel rendering safety passed: sourced text is escaped and only HTTP(S) links are accepted.');

function check(condition, message) {
    if (!condition) throw new Error(message);
}
