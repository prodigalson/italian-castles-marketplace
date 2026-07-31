import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(import.meta.dirname, 'index.html'),
                terms: resolve(import.meta.dirname, 'terms.html'),
                privacy: resolve(import.meta.dirname, 'privacy.html'),
            },
        },
    },
});
