import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const [siteImages, committedPreview, deployedPreview, deployedHtml] = await Promise.all([
    readJson('data/site-image-assets.json'),
    readFile('public/og/cover.png'),
    readFile('dist/og/cover.png'),
    readFile('dist/index.html', 'utf8'),
]);

const socialImage = siteImages.find(image => image.usage === 'social_preview');
const committedHash = sha256(committedPreview);
const deployedHash = sha256(deployedPreview);
const expectedUrl = `https://castle.chingularity.com${socialImage.url}`;

if (committedHash !== socialImage.generated_sha256) fail('Committed social preview does not match its recorded provenance hash.');
if (deployedHash !== committedHash) fail('Built social preview bytes differ from the committed asset.');
if (!deployedHtml.includes(expectedUrl)) fail('Built HTML does not reference the registered production social preview URL.');

console.log(`Distribution QA passed: social preview preserved byte-for-byte (${deployedHash}).`);

function fail(message) {
    console.error(`Distribution QA failed: ${message}`);
    process.exit(1);
}

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

async function readJson(path) {
    return JSON.parse(await readFile(path, 'utf8'));
}
