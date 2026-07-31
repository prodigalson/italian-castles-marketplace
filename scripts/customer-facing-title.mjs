const SOURCE_BRAND_PATTERNS = [
    /james\s*edition/gi,
    /idealista/gi,
    /immobiliare\.it/gi,
    /immobiliare\s*italiano/gi,
    /gate[-\s]*away/gi,
    /luxury\s*estate/gi,
    /sotheby(?:'s|’s)?(?:\s+international\s+realty(?:\s+italy)?)?/gi,
    /engel\s*(?:&|and)\s*v(?:o|ö)lkers/gi,
    /romolini/gi,
    /apulia\s+exclusive\s+houses/gi,
    /oikos\s+immobiliare/gi,
    /castle\s+collector/gi,
    /castle\s*ist/gi,
    /realportico/gi,
    /tranio/gi,
    /le\s+figaro\s+properties/gi,
    /italy\s+luxury\s+property\s+for\s+sale/gi,
];

export function containsSourceBrand(value) {
    return SOURCE_BRAND_PATTERNS.some(pattern => {
        pattern.lastIndex = 0;
        return pattern.test(value || '');
    });
}

export function customerFacingTitle(value, { assetClass, location } = {}) {
    let title = String(value || '').normalize('NFKC');

    for (const pattern of SOURCE_BRAND_PATTERNS) {
        pattern.lastIndex = 0;
        title = title.replace(pattern, ' ');
    }

    title = title
        .replace(/\(\s*\)/g, ' ')
        .replace(/^\s*[-–—|:·]+\s*/g, '')
        .replace(/\s*[-–—|:·]+\s*$/g, '')
        .replace(/\s+([,.;:])/g, '$1')
        .replace(/\s{2,}/g, ' ')
        .trim();

    const cardLocation = title.match(/^castle\s+card\s*:\s*(.+)$/i)?.[1]?.trim();
    if (cardLocation) title = `Castle in ${cardLocation}`;

    if (!title) {
        const type = assetClass === 'masseria' ? 'Masseria' : 'Castle';
        title = location ? `${type} in ${location}` : type;
    }

    return title;
}
