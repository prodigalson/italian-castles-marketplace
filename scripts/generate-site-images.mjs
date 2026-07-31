import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;

// Title outlines are pre-converted from Cormorant Garamond Italic — see
// scripts/social-title-outlines.py for why the font is not referenced by name.
const TITLE_UPEM = 1000;
const TITLE_ADVANCE = 8218;
const TITLE_SIZE = 96;
const TITLE_BASELINE = 322;

const heroPath = new URL('../public/images/rocca-calascio-hero.jpg', import.meta.url);
const titlePath = new URL('../assets/social-title-outlines.svg', import.meta.url);
const output = fileURLToPath(new URL('../public/og/cover.png', import.meta.url));

const [hero, titleSource] = await Promise.all([readFile(heroPath), readFile(titlePath, 'utf8')]);
const titleGlyphs = titleSource.match(/<g id="title">([\s\S]*?)<\/g>/)?.[1];
if (!titleGlyphs) throw new Error('assets/social-title-outlines.svg is missing its <g id="title"> glyph data.');

const titleScale = TITLE_SIZE / TITLE_UPEM;
const titleLeft = (WIDTH - TITLE_ADVANCE * titleScale) / 2;

// The card bakes its text in, which makes it an adaptation of a CC BY-SA photograph.
// Attribution therefore has to travel inside the image, and the card is BY-SA in turn.
const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1512" stop-opacity=".58"/>
      <stop offset=".45" stop-color="#0b1512" stop-opacity=".34"/>
      <stop offset="1" stop-color="#0b1512" stop-opacity=".8"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#scrim)"/>
  <g fill="#ffffff" transform="translate(${titleLeft.toFixed(1)} ${TITLE_BASELINE}) scale(${titleScale} -${titleScale})">${titleGlyphs}</g>
  <text x="${WIDTH / 2}" y="394" text-anchor="middle" fill="#ffffff" fill-opacity=".76"
        font-family="Helvetica, Arial, sans-serif" font-size="20" letter-spacing="7">FORTRESSES · PALAZZI · MASSERIE · VILLAS</text>
  <path d="M470 430h260" stroke="#bda66b" stroke-width="1.5"/>
  <text x="${WIDTH / 2}" y="484" text-anchor="middle" fill="#e6dcc2"
        font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="5">CASTLE.CHINGULARITY.COM</text>
  <text x="34" y="602" fill="#ffffff" fill-opacity=".6"
        font-family="Helvetica, Arial, sans-serif" font-size="15">Rocca Calascio, Abruzzo · Photo by Marcotigretti · CC BY-SA 4.0 · Not a listed property.</text>
</svg>`);

await sharp(hero)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
    .modulate({ brightness: 1.12, saturation: 0.86 })
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(output);

console.log(`Generated public/og/cover.png (${WIDTH}x${HEIGHT}) from the registered Rocca Calascio cover photograph.`);
