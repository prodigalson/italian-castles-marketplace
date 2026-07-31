#!/usr/bin/env node
// Generate per-city HTML pages from the built SPA so /paris, /milan, /rio
// each have city-specific titles, OG meta (for WhatsApp/iMessage/Twitter
// link previews), and load directly into the right city without a query.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const INDEX = path.join(DIST, 'index.html');

// Keep in sync with i18n.js CITIES (en label + cover image).
const CITIES = {
    milan: {
        label: 'Milan',
        title: 'Milan Date Spots',
        coverImage: 'https://amo.chingularity.com/og/milan.jpg',
        coverAlt: 'Amo Dove Andiamo? Milan',
        desc: 'Curated date spots in Milan for every kind of night out. From classic aperitivos to hidden trattorias.',
    },
    rio: {
        label: 'Rio de Janeiro',
        title: 'Rio de Janeiro Date Spots',
        coverImage: 'https://amo.chingularity.com/og/rio.jpg',
        coverAlt: 'Amo Dove Andiamo? Rio de Janeiro',
        desc: 'Curated date spots in Rio for every kind of night out. From Ipanema sunsets to Santa Teresa bistros.',
    },
    paris: {
        label: 'Paris',
        title: 'Paris Date Spots',
        coverImage: 'https://amo.chingularity.com/og/paris.jpg',
        coverAlt: 'Amo Dove Andiamo? Paris',
        desc: 'Curated date spots in Paris for every kind of night out. From cocktail bars to Marais bistros.',
    },
    tokyo: {
        label: 'Tokyo',
        title: 'Tokyo Date Spots',
        coverImage: 'https://amo.chingularity.com/og/tokyo.jpg',
        coverAlt: 'Amo Dove Andiamo? Tokyo',
        desc: 'Curated date spots in Tokyo for every kind of night out. From Ginza sushi counters to Shibuya listening bars.',
    },
};

function buildPage(template, key, city) {
    const url = `https://amo.chingularity.com/${key}`;
    let html = template;

    // <title>
    html = html.replace(
        /<title>[^<]*<\/title>/,
        `<title>Amo Dove Andiamo? | ${city.title}</title>`
    );

    // og:title
    html = html.replace(
        /<meta property="og:title"[^>]*>/,
        `<meta property="og:title" content="Amo Dove Andiamo? - ${city.title}">`
    );

    // og:description
    html = html.replace(
        /<meta property="og:description"[^>]*>/,
        `<meta property="og:description" content="${city.desc}">`
    );

    // og:image (full size, not the cropped one)
    html = html.replace(
        /<meta property="og:image"[^>]*>/,
        `<meta property="og:image" content="${city.coverImage}">`
    );

    // og:image:secure_url + og:image:alt
    html = html.replace(
        /<meta property="og:image:secure_url"[^>]*>/,
        `<meta property="og:image:secure_url" content="${city.coverImage}">`
    );
    html = html.replace(
        /<meta property="og:image:alt"[^>]*>/,
        `<meta property="og:image:alt" content="${city.coverAlt}">`
    );
    // twitter:image:alt
    html = html.replace(
        /<meta name="twitter:image:alt"[^>]*>/,
        `<meta name="twitter:image:alt" content="${city.coverAlt}">`
    );

    // og:url
    html = html.replace(
        /<meta property="og:url"[^>]*>/,
        `<meta property="og:url" content="${url}">`
    );

    // twitter:title
    html = html.replace(
        /<meta name="twitter:title"[^>]*>/,
        `<meta name="twitter:title" content="Amo Dove Andiamo? - ${city.title}">`
    );

    // twitter:description
    html = html.replace(
        /<meta name="twitter:description"[^>]*>/,
        `<meta name="twitter:description" content="${city.desc}">`
    );

    // twitter:image
    html = html.replace(
        /<meta name="twitter:image"[^>]*>/,
        `<meta name="twitter:image" content="${city.coverImage}">`
    );

    // meta description
    html = html.replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" content="${city.desc}">`
    );

    // canonical
    html = html.replace(
        /<link rel="canonical"[^>]*>/,
        `<link rel="canonical" href="${url}">`
    );

    // Inject inline script BEFORE main bundle that sets the city in localStorage.
    // The main script reads localStorage on init so this lands us on the right
    // city without a flash of the default city or a URL rewrite.
    const injection = `<script>try{localStorage.setItem('amoCity','${key}')}catch(e){}</script>`;
    html = html.replace(
        /<script type="module"/,
        `${injection}<script type="module"`
    );

    // Loader subtitle pre-JS
    html = html.replace(
        /<div class="loader-subtitle">[^<]*<\/div>/,
        `<div class="loader-subtitle">${city.title}</div>`
    );

    return html;
}

function main() {
    if (!fs.existsSync(INDEX)) {
        console.error('dist/index.html not found. Run `vite build` first.');
        process.exit(1);
    }
    const template = fs.readFileSync(INDEX, 'utf8');
    for (const [key, city] of Object.entries(CITIES)) {
        const html = buildPage(template, key, city);
        const out = path.join(DIST, `${key}.html`);
        fs.writeFileSync(out, html);
        console.log(`wrote dist/${key}.html (${html.length} bytes)`);
    }
}

main();
