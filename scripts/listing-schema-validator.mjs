import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const schema = JSON.parse(await readFile(new URL('../data/castle-listing.schema.json', import.meta.url), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

export function listingSchemaErrors(listing) {
    if (validate(listing)) return [];
    return (validate.errors || []).map(error => {
        const path = error.instancePath || '/';
        return `${path} ${error.message}`;
    });
}

export function assertListingSchema(listing) {
    const errors = listingSchemaErrors(listing);
    if (errors.length) throw new Error(`${listing.id || 'unknown'} failed canonical schema: ${errors.join('; ')}`);
}
