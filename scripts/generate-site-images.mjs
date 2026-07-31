import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const source = await readFile(new URL('../assets/site-social-preview.svg', import.meta.url));
const output = fileURLToPath(new URL('../public/og/cover.png', import.meta.url));

await sharp(source)
    .resize(1200, 630)
    .png({ compressionLevel: 9, palette: true })
    .toFile(output);

console.log('Generated public/og/cover.png from owned site-social-preview.svg artwork.');
