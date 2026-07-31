# Launch Readiness QA

Date: 2026-07-31

Scope: Italian Castles for Sale marketplace MVP at `/`.

## Summary

Status: PER-153 release candidate passed locally; production rollout awaits review and merge.

The marketplace is expected to launch as a static Vite build with manual/link-only inventory, visible source attribution, source availability notes, last-checked timestamps, provenance notes, and source inquiry links.

## PER-153 Homepage And Image Evidence

- The cover now uses a locally served 3840×2560 photograph of Rocca Calascio in Abruzzo by Marcotigretti. Wikimedia Commons records the 6708×4472 original and the copyright holder's CC BY-SA 4.0 license. `data/site-image-assets.json` preserves the source page, download URL, original and delivered dimensions, local SHA-256, credit, license URL, responsive display treatment, and explicit non-listing status.
- The visible cover attribution links the creator/source page and license, and labels the photograph `Editorial hero, not a listed property.` The prior owned-artwork cover sentence is absent.
- The castle and Masserias headings and supporting copy match PER-153 exactly in the initial HTML and the interactive section model.
- All 104 displayed records retain property-level original listing links. Their current source records are link-only and do not document property-photo display permission, so no listing photo was copied or hotlinked. Each record stores the reviewed source URL, review timestamp, no-copy/no-hotlink decision, owned fallback rights, and the visible exact label `Editorial placeholder images.`
- Four castle fixtures and two Masseria fixtures backed only by country, category, or homepage URLs were removed. The Masserias inventory now uses two manually reviewed JamesEdition property pages whose image presence, image count, reuse-rights decision, and fallback selection are recorded in `data/manual-review/jamesedition/masseria-property-url-review.json`.
- Launch QA rejects known landing/category URLs and permits only source-specific property URL shapes for displayed records. It also rejects unregistered hero bytes, insufficient hero resolution, missing hero attribution/license/non-listing disclosure, missing exact copy, missing listing fallback reviews, remote fallback imagery, or Masseria records without a property-level image-presence and permission review.
- Local production-preview browser QA passed at 375×812, 768×1024, and 1280×720. Screenshots confirmed a sharp hero and subject-preserving crop at all three sizes; the 375×812 Masserias state rendered its exact heading/supporting copy without clipping. Computed checks reported the hero's 3840×2560 natural size, no horizontal overflow, no collisions among the title, supporting copy, section switch, attribution, and enter button, and no console errors. The mobile listing flow visibly rendered `Editorial placeholder images.` and retained its source links.
- Review-fix browser QA deep-linked both replacement Masseria records at 375×812 and 1280×720. Each rendered its reviewed property-level JamesEdition URL, exact fallback label, and updated facts with no horizontal overflow or console errors.

## Command Evidence

```bash
npm run inventory:refresh
npm run qa:launch
npm run build
npm audit --omit=dev
npm audit
```

Results on 2026-07-31:

- `npm run inventory:refresh` passed and wrote 104 canonical listings from 120 source records, including 102 active castle listings after dedupe and 2 active masserias.
- `npm run qa:launch` passed the inventory threshold, uniqueness, source/provenance, Masserias-source, image-rights, exact placeholder-label, and canonical-domain checks.
- `npm run build` passed with Vite 8.2.0 and generated `dist/index.html`, `dist/admin.html`, and the city HTML copies.
- `npm audit --omit=dev` passed with 0 vulnerabilities.
- `npm audit` passed with 0 vulnerabilities after the compatible Vite/PostCSS lockfile update.
- Local production preview returned `HTTP/1.1 200 OK` for `/`.

Built size evidence:

- `dist/index.html`: 12 KB on disk, 10.97 KB build output, 2.84 KB gzip.
- Main CSS bundle: 16 KB on disk, 12.95 KB build output, 3.39 KB gzip.
- Main JS bundle: 36 KB on disk, 36.83 KB build output, 9.53 KB gzip.
- `public/og/cover.png`: 23 KB, generated from owned castle-marketplace vector artwork at 1200×630.

## PER-149 Final QA Evidence

- Repository separation: Git remote is `https://github.com/prodigalson/italian-castles-marketplace`; no Amo Dove Andiamo files or deployment settings were changed.
- Vercel separation: project `prodigalsons-projects/italian-castles-marketplace` (`prj_YZLhXSa3aXrqJTl8b87bnV6xzbt8`) owns `castle.chingularity.com`. The latest pre-PER-149 production deployment observed was `dpl_387wFAkQmmmyn8BqpkB9nHurJoCr`, status Ready, with the castle custom domain and project aliases attached.
- Historical pre-PER-153 domain health: `https://castle.chingularity.com/` returned HTTP 200 with successful TLS verification and no redirect. It served the castle marketplace, and the then-current Masserias detail flow loaded without console errors.
- Amo preservation: `https://amo.chingularity.com/` returned HTTP 200 with successful TLS verification and served `Amo Dove Andiamo? | Milan Date Spots`, confirming it remains the original separate project. Its existing missing `/favicon.ico` request returns 404; this repo does not own that asset and the application/API requests tested returned 200.
- Local production preview passed at `375x812`, `768x1024`, and `1280x720` with no horizontal overflow or console errors. The first castle, the 100th active expanded-inventory castle, and a Masserias deep link all rendered source links, provenance, and the exact placeholder label.
- Inventory verification: 104 unique canonical listings, including 102 active castles after dedupe and 2 active Puglia masserias. All displayed source URLs are property-level links; attribution, raw payload references, last-checked values, provenance notes, and inquiry actions passed validation.
- Source transparency: all 17 source status records passed validation, including all 10 required Masserias sources. Permission, terms, robots, and fallback evidence remains visible for unavailable sources.
- Image verification: no current source record grants copied property-photo display rights. All 104 listings therefore use owned local editorial illustrations, not remote stock or source photos. Every listing image records `editorial_placeholder`, credit, owned rights basis, and a rights note, and the UI visibly renders exactly `Editorial placeholder images.` The marketplace cover and social preview are also registered in `data/site-image-assets.json`; the cover displays its rights text, the social preview contains only castle-marketplace branding, and launch QA verifies the generated PNG dimensions and provenance hash.
- SEO/social verification: canonical, Open Graph URL/image, Twitter image, and JSON-LD production URLs now use `https://castle.chingularity.com/`; the legacy Vercel URL is rejected by `npm run qa:launch`.

Production deployment `dpl_9JrZ4vKjUs1sYkhxYWSe1RxMYiet` verified the corrected canonical metadata, exact labels, inventory, responsive flows, and domain separation. Its Sharp-generated PNG bytes differed from the committed provenance hash despite rendering the same artwork. The corrective build no longer regenerates social media during deployment: Vite copies the reviewed committed PNG, and `npm run qa:dist` fails unless the distribution copy is byte-for-byte identical to the registered asset. Source SVG hashes are also recorded and checked independently.

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

- Data validation passed: 104 active canonical listings and 17 requested source records, with no missing attribution, provenance, last-checked, or inquiry fields.
- Source representation: 12 sources have listing records or source notes in the active product scope; JamesEdition contributes 102 active castle listing records from `data/manual-review/jamesedition/castle-card-snapshot.json` after dedupe, each with a stable original listing URL, while permission/robots/partner-feed gaps remain represented as source-status-only rows.
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
- JamesEdition card-snapshot records link back to original listing pages, preserve high-level card facts only, and retain `raw_payload_ref` pointers into the committed manual-review snapshot; richer detail-page ingestion still needs partner/API or source-specific permission review.
- Castleist, ImmobiliareItaliano, Italy Luxury Property for Sale, Tranio, Sotheby's Italy, and Le Figaro Properties require written permission, a partner feed, or additional source review before richer ingestion.
- No actual-property photos are displayed because the current link-only sources do not grant reuse rights. Owned editorial substitutes are explicitly labelled; replace them only with actual-property media carrying documented partner, source, or owned display rights.
