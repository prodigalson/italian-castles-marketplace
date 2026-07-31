// Vercel serverless endpoint for CRUD on data/spots.json via GitHub API.
// GET: returns current spots (public, used as live CMS refresh).
// POST/PUT/DELETE: require ADMIN_PASSWORD header, commit to GitHub.

const OWNER = 'prodigalson';
const REPO = 'amodoveandiamo';
const FILE_PATH = 'data/spots.json';
const BRANCH = 'main';

async function ghFetch(path, init = {}) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN not set');
    const res = await fetch(`https://api.github.com${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
    });
    return res;
}

async function loadSpots() {
    const res = await ghFetch(`/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`);
    if (!res.ok) {
        if (res.status === 404) return { spots: [], sha: null };
        throw new Error(`GitHub read failed: ${res.status}`);
    }
    const json = await res.json();
    const content = Buffer.from(json.content, 'base64').toString('utf8');
    return { spots: JSON.parse(content), sha: json.sha };
}

async function saveSpots(spots, sha, message) {
    const content = Buffer.from(JSON.stringify(spots, null, 2) + '\n', 'utf8').toString('base64');
    const body = { message, content, branch: BRANCH };
    if (sha) body.sha = sha;
    const res = await ghFetch(`/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`GitHub write failed: ${res.status} ${text}`);
    }
}

function requireAuth(req) {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return 'Server missing ADMIN_PASSWORD';
    const provided = req.headers['x-admin-password'];
    if (provided !== expected) return 'Unauthorized';
    return null;
}

function slugify(name) {
    return name.toLowerCase().replace(/\n/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeSpot(spot) {
    const out = { ...spot };
    if (!out.id) out.id = slugify(out.name || 'spot-' + Date.now());
    if (typeof out.neighborhood === 'string') {
        out.neighborhood = { en: out.neighborhood, it: out.neighborhood };
    }
    if (typeof out.description === 'string') {
        out.description = { en: out.description, it: out.description };
    }
    if (out.priceRange) out.priceRange = Number(out.priceRange);
    if (out.lat) out.lat = Number(out.lat);
    if (out.lon) out.lon = Number(out.lon);
    return out;
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    try {
        if (req.method === 'GET') {
            const { spots } = await loadSpots();
            return res.status(200).json(spots);
        }

        const authErr = requireAuth(req);
        if (authErr) return res.status(401).json({ error: authErr });

        if (req.method === 'POST' && req.body && req.body.probe === true) {
            return res.status(200).json({ ok: true });
        }

        if (req.method === 'POST') {
            const { spots, sha } = await loadSpots();
            const incoming = normalizeSpot(req.body);
            if (!incoming.name || !incoming.mapsUrl) {
                return res.status(400).json({ error: 'name and mapsUrl are required' });
            }
            if (spots.some(s => s.id === incoming.id)) {
                return res.status(409).json({ error: `Spot with id "${incoming.id}" already exists` });
            }
            spots.push(incoming);
            await saveSpots(spots, sha, `CMS: add ${incoming.name.replace(/\n/g, ' ')}`);
            return res.status(201).json(incoming);
        }

        if (req.method === 'PUT') {
            const { spots, sha } = await loadSpots();
            const incoming = normalizeSpot(req.body);
            const idx = spots.findIndex(s => s.id === incoming.id);
            if (idx < 0) return res.status(404).json({ error: 'Not found' });
            spots[idx] = incoming;
            await saveSpots(spots, sha, `CMS: update ${incoming.name.replace(/\n/g, ' ')}`);
            return res.status(200).json(incoming);
        }

        if (req.method === 'DELETE') {
            const id = (req.query && req.query.id) || (req.body && req.body.id);
            if (!id) return res.status(400).json({ error: 'id required' });
            const { spots, sha } = await loadSpots();
            const next = spots.filter(s => s.id !== id);
            if (next.length === spots.length) return res.status(404).json({ error: 'Not found' });
            await saveSpots(next, sha, `CMS: delete ${id}`);
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        return res.status(500).json({ error: String(err.message || err) });
    }
}
