// Serves a Google Places photo from its stable resource name.
//
// Places' /media endpoint hands back a signed lh3.googleusercontent.com URL that
// expires after a few weeks. Baking those into spots.json is what broke every hero
// image twice (see the June 12 "refresh 364 broken images" commit). Instead we store
// the photo resource name -- which is stable -- and resolve it here on demand.
//
// We stream the bytes rather than redirecting so the CDN caches the image itself;
// a cached 302 would still point at a URL that expires out from under us. Bytes get
// re-encoded to WebP on the way through -- Google's JPEGs run ~800KB at this size,
// which is far too heavy for a phone paging through spreads.

import sharp from 'sharp';

const NAME_RE = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;

// Fixed output size -- callers cannot pick dimensions, since a size param would only
// fragment the CDN cache and hand out a way to pull 5MP images on our API quota.
// The hero slot is full viewport height with object-fit: cover, so height is the
// binding dimension: 2160 covers a retina laptop at full bleed. (URLs carry a `v=`
// cache-buster; bump it in spots.json/fetch-photo.js if these sizes change, or the
// 30-day CDN cache keeps serving the old rendition.)
const SOURCE_HEIGHT = 2400;
const OUTPUT_MAX_WIDTH = 2560;
const OUTPUT_MAX_HEIGHT = 2160;
const WEBP_QUALITY = 80;

// Google's terms allow temporary caching of Places content for up to 30 days.
const CACHE_SECONDS = 30 * 24 * 60 * 60;

// Same heuristic as scripts/select-best-photos.mjs: no per-photo ratings exist, so
// rank by resolution and aspect fit, tiebroken by Google's own ordering.
function photoScore(photo, index) {
    const w = photo.widthPx || 0;
    const h = photo.heightPx || 0;
    if (!w || !h) return 0;
    const res = Math.min(h, SOURCE_HEIGHT) / SOURCE_HEIGHT;
    const aspect = w / h;
    const fit = aspect >= 0.9 && aspect <= 1.9 ? 1.0
        : aspect >= 0.7 && aspect <= 2.6 ? 0.75
        : 0.4;
    return res * fit + (10 - Math.min(index, 9)) * 0.01;
}

async function resolveMedia(name, key) {
    const r = await fetch(
        `https://places.googleapis.com/v1/${name}/media?maxHeightPx=${SOURCE_HEIGHT}&skipHttpRedirect=true&key=${key}`
    );
    if (!r.ok) return { status: r.status };
    const { photoUri } = await r.json();
    return { status: 200, photoUri };
}

// Photo reference tokens are re-issued by Google and a stored one can go stale --
// the slow-motion version of the expired-URL bug this endpoint exists to fix. The
// name embeds the place id, so on a rejected token we re-fetch the place's photos
// and serve the best current one instead of going dark.
async function refetchBestPhotoName(staleName, key) {
    const placeId = staleName.split('/')[1];
    const r = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
        headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'photos' },
    });
    if (!r.ok) return null;
    const photos = (await r.json()).photos || [];
    if (!photos.length) return null;
    return photos
        .map((p, i) => ({ name: p.name, s: photoScore(p, i) }))
        .sort((a, b) => b.s - a.s)[0].name;
}

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return res.status(405).json({ error: 'GET only' });
    }

    const key = process.env.GOOGLE_PLACES_KEY;
    if (!key) return res.status(500).json({ error: 'GOOGLE_PLACES_KEY not configured' });

    // Strict allowlist on the name: it is interpolated into an upstream URL, so
    // anything outside the documented shape gets rejected rather than proxied.
    const name = req.query?.name;
    if (typeof name !== 'string' || !NAME_RE.test(name)) {
        return res.status(400).json({ error: 'invalid photo name' });
    }

    try {
        let media = await resolveMedia(name, key);

        // 4xx from /media means the token itself was rejected (stale/re-issued),
        // not a transient blip -- self-heal via the place's current photo list.
        if (media.status >= 400 && media.status < 500) {
            const freshName = await refetchBestPhotoName(name, key);
            if (freshName && freshName !== name) media = await resolveMedia(freshName, key);
        }

        if (media.status !== 200) {
            // Don't let an upstream failure get cached for 30 days.
            res.setHeader('Cache-Control', 'public, max-age=60');
            return res.status(502).json({ error: `Places photo API ${media.status}` });
        }
        if (!media.photoUri) {
            res.setHeader('Cache-Control', 'public, max-age=60');
            return res.status(404).json({ error: 'no photo for that name' });
        }
        const { photoUri } = media;

        const imgRes = await fetch(photoUri);
        if (!imgRes.ok) {
            res.setHeader('Cache-Control', 'public, max-age=60');
            return res.status(502).json({ error: `photo fetch ${imgRes.status}` });
        }

        const original = Buffer.from(await imgRes.arrayBuffer());

        // Fall back to the original bytes if re-encoding fails for any reason --
        // a heavy image still beats a broken one.
        let buf = original;
        let type = imgRes.headers.get('content-type') || 'image/jpeg';
        try {
            buf = await sharp(original)
                .resize({
                    width: OUTPUT_MAX_WIDTH,
                    height: OUTPUT_MAX_HEIGHT,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({ quality: WEBP_QUALITY })
                .toBuffer();
            type = 'image/webp';
        } catch { /* keep the original */ }

        res.setHeader('Content-Type', type);
        res.setHeader('Content-Length', String(buf.length));
        res.setHeader(
            'Cache-Control',
            `public, max-age=3600, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`
        );
        return res.status(200).send(buf);
    } catch (err) {
        res.setHeader('Cache-Control', 'public, max-age=60');
        return res.status(500).json({ error: String(err?.message || err) });
    }
}
