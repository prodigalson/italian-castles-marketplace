# Launch Readiness QA

Date: 2026-07-31

Scope: Italian Castles for Sale marketplace MVP at `/`.

## Summary

Status: pass.

The marketplace is expected to launch as a static Vite build with manual/link-only castle inventory, visible source attribution, source availability notes, stale/removed labels, last-checked timestamps, provenance notes, and source inquiry links.

## Command Evidence

```bash
npm run inventory:refresh
npm run build
npm audit --omit=dev
npm audit
```

Results on 2026-07-31:

- `npm run inventory:refresh` passed and wrote 131 canonical listings from 144 source records, including 127 active castle listings after dedupe.
- `npm run build` passed with Vite 8.2.0 and generated `dist/index.html`, `dist/admin.html`, and the city HTML copies.
- `npm audit --omit=dev` passed with 0 vulnerabilities.
- `npm audit` passed with 0 vulnerabilities after the compatible Vite/PostCSS lockfile update.
- Local production preview returned `HTTP/1.1 200 OK` for `/`.

Built size evidence:

- `dist/index.html`: 12 KB on disk, 10.97 KB build output, 2.84 KB gzip.
- Main CSS bundle: 16 KB on disk, 12.95 KB build output, 3.39 KB gzip.
- Main JS bundle: 36 KB on disk, 36.83 KB build output, 9.53 KB gzip.
- `public/og/cover.jpg`: 172 KB.

## QA Evidence

Responsive:

- Browser viewport automation passed at `1440x1000` desktop and `390x844` mobile using the production preview.
- Desktop result: prior launch QA covered the browse flow, filters, source coverage, action buttons, horizontal overflow, and console errors. PER-148 refresh validation now covers the expanded 100+ active castle inventory.
- Mobile result: prior launch QA covered the same browse flow at mobile width. PER-148 refresh validation now covers the expanded 100+ active castle inventory.
- Static CSS review also passes for desktop and mobile breakpoints at `1024px`, `720px`, and `460px`; listing spreads collapse from two columns to one column, and mobile rules stack info cards, detail grids, action buttons, and source coverage rows.

Accessibility:

- Static check passed for `lang`, viewport, labelled search input, labelled sort select, image alt text, ARIA labels, and duplicate IDs.
- Keyboard handlers preserve native input/select/button/link behavior and skip page navigation while filter or menu controls are open.
- `prefers-reduced-motion: reduce` disables long transitions and animations.

SEO and social preview:

- Static check passed for description, canonical, Open Graph image tags, Twitter card tags, structured data, and `public/robots.txt`.
- Local preview served the built HTML with production asset references.

Trust and source transparency:

- Data validation passed: 131 canonical listings, 17 requested sources, listing statuses `active`, `stale`, and `removed`, with no missing attribution, provenance, last-checked, or inquiry fields.
- Source representation: 12 sources have listing records or source notes in the active product scope; JamesEdition contributes 127 castle listing records from the manual/link-only category-card snapshot, while permission/robots/partner-feed gaps remain represented as source-status-only rows.
- The filter panel Source Coverage section exposes permission, terms, robots, and link-only status in-product.

## Source Trust Checklist

- Pass: every canonical listing has at least one visible source link.
- Pass: every source link includes the source name, source status, and license basis.
- Pass: listing provenance includes the latest `last_checked_at` time and generator notes.
- Pass: removed and stale listings keep visible status labels.
- Pass: inquiry actions route to original source pages only.
- Pass: sources that are unavailable, non-compliant without permission, or blocked by robots are represented in `data/castle-source-status.json` and in the filter panel Source Coverage section.

## Known Gaps

- Inventory is not a live broker feed. It is a compliant link-only/manual fixture.
- JamesEdition card-snapshot records link back to the reviewed category source pages and preserve high-level card facts only; richer detail-page ingestion still needs partner/API or source-specific permission review.
- Castleist, ImmobiliareItaliano, Italy Luxury Property for Sale, Tranio, Sotheby's Italy, and Le Figaro Properties require written permission, a partner feed, or additional source review before richer ingestion.
- Placeholder editorial images are not copied from listing sources and should be replaced only with licensed media.
