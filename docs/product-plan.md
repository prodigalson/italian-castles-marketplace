# Italian Castles Marketplace Product Plan

## Reference Format Dependency

Use `https://github.com/prodigalson/amodoveandiamo` as the product-format source.
Runtime access was verified on 2026-07-31 with `git ls-remote`; `main` resolved
to `a93a8f153fe714a79bcf59f6fd3a7518ecccfcac`.

If future runtime access to the reference project fails, flag the dependency
immediately and proceed from the preserved facts in this document only.

Reference facts to preserve:

- Lightweight Vite app with `index.html`, `style.css`, `main.js`,
  `data/spots.json`, Vercel serverless APIs, and `vercel.json`.
- SEO/social metadata in the shell plus generated city or location pages for
  rich link previews and direct entry.
- Full-screen photographic cover with loader, large editorial serif title,
  uppercase sans metadata, and a clear enter action.
- Post-enter browsing as a magazine spread: image-led left page and structured
  details on the right.
- Subtle page transitions with arrow, keyboard, wheel, and touch/swipe
  navigation.
- Compact floating toolbar that opens a menu for filters, share, and
  admin-style actions.
- Pill-based filters over local JSON data, with an optional `/api/spots` live
  refresh path.

## Product Brief

Create a luxury real-estate browsing marketplace for Italian castles for sale.
The product should feel like an editorial magazine, not a dense property portal:
large photography, restrained typography, clear provenance, and fast sequential
browsing come first. The marketplace still needs practical buyer workflows:
search, sorting, filters, listing detail, image galleries, map/location context,
source attribution, original listing links, and inquiry/contact actions.

The site must aggregate and normalize active Italian castle listings from
feasible sources while being transparent about unavailable, stale, removed, or
non-compliant inventory.

## Target Personas

- International luxury buyer: wants a trustworthy shortlist of castles, clear
  location context, source links, and fast comparison without visiting many
  fragmented listing sites.
- Buyer representative or family-office researcher: needs provenance,
  last-checked data, price state, duplicate consolidation, and direct source
  links for diligence.
- Lifestyle browser: wants a beautiful, image-led experience with low-friction
  exploration before committing to inquiry.
- Marketplace operator: needs a maintainable source plan, clear compliance
  boundaries, and simple inventory refresh diagnostics.

## Key User Journeys

- First visit: land on a full-screen photographic cover, understand the luxury
  Italian castle offer, enter the magazine browsing experience, and move between
  properties with arrows, keyboard, wheel, or swipe.
- Explore and refine: search by name/location, sort by price or recency, and
  filter by region/province, price, property type, bedrooms, size, land area,
  condition, and amenities.
- Evaluate a property: open a detailed state or page with gallery, structured
  facts, map/location context, price state, source attribution, last checked
  time, provenance, and stale/removed status when relevant.
- Act on interest: follow the original source listing or inquiry/contact action
  without hiding who owns the listing relationship.
- Share: use the toolbar share action to copy or native-share a deep link to a
  listing or filtered view.

## MVP Scope

- Vite-based responsive web app that follows the reference site's cover,
  magazine spread, floating toolbar, pill filters, and navigation patterns.
- Local canonical JSON inventory consumed by the UI, with an optional API refresh
  path compatible with future Vercel serverless deployment.
- Search, sorting, and filters for required property attributes.
- Listing spread/card view plus detail view or deep-linked detail state.
- Image gallery, map/location context, inquiry/source links, and source
  attribution for every listing.
- Explicit labels for price-on-request, stale/removed listings, last-checked
  time, and data provenance.
- SEO/social metadata and generated region, city, or listing pages where
  practical.
- Documentation for setup, data refresh, and deployment by launch-readiness
  stage.

## Non-Goals

- No direct transaction, escrow, mortgage, or legal-advice workflow.
- No hidden scraping, CAPTCHA bypass, paywall bypass, or access-control bypass.
- No claim that inventory is complete when a source is unavailable or
  non-compliant.
- No user accounts, saved searches, alerts, or CRM workflow in the first MVP.
- No replacement for source brokers or agents; source attribution remains
  visible.

## Acceptance Criteria

- The first viewport is a photographic luxury cover with editorial serif title,
  concise metadata, loader behavior, and a clear enter action.
- After entry, browsing uses a magazine-like spread with property imagery as the
  dominant surface and structured listing details beside it.
- Arrow buttons, keyboard, wheel, and touch/swipe navigation work without
  accidental page scroll conflicts.
- Toolbar actions expose filters, share, and future admin-style controls in a
  compact floating menu.
- Filters are pill-based and cover region/province, price, property type,
  bedrooms, size, land area, condition, and amenities; search and sorting are
  available.
- Every visible listing includes source attribution, original source links,
  price state, last-checked time, provenance, and stale/removed indicators when
  applicable.
- Detail view includes gallery, location context, inquiry action, and a
  shareable URL.
- Desktop and mobile layouts avoid text overlap and preserve readable luxury
  editorial hierarchy.
- Accessibility basics pass: semantic controls, labels, focus visibility,
  keyboard support, alt text, color contrast, and reduced-motion consideration.
- SEO basics pass: title, description, canonical URL, Open Graph/Twitter tags,
  and generated pages or equivalent deep-link metadata for key entry points.
- Project verification passes. If no automated checks exist in an early slice,
  docs and structured data must be readable and valid.

## Prioritized Backlog

1. Reference/product foundation: preserve the reference app format, journeys,
   MVP scope, acceptance criteria, delivery plan, risks, analytics, QA, and
   launch criteria.
2. Data foundation: define source-by-source access/compliance plan, canonical
   listing schema, provenance model, stale/removed handling, and deterministic
   deduplication rules.
3. UI MVP: implement cover, magazine browsing, detail state, gallery, map
   context, search, sort, filters, source links, inquiry actions, responsive
   layout, and SEO metadata.
4. Inventory refresh: implement compliant source adapters or documented
   fallbacks, normalize output to the canonical schema, and deduplicate records.
5. Launch readiness: setup docs, refresh docs, deployment docs, responsive QA,
   accessibility QA, basic performance QA, SEO checks, and trust/provenance
   checks.

## Delivery Milestones

- Milestone 1: Product and reference plan complete.
- Milestone 2: Data plan, schema, and deduplication strategy complete.
- Milestone 3: Static UI MVP consumes fixture inventory and supports core browse,
  filter, sort, detail, share, and inquiry flows.
- Milestone 4: Repeatable compliant inventory refresh produces canonical data
  for every feasible source and transparent fallback statuses for the rest.
- Milestone 5: QA and launch documentation complete; deployable build passes.

## Dependencies

- Runtime access to the reference repository, or this document if access fails.
- Feasible source access via feeds, APIs, partner access, or terms-compliant
  scraping after robots.txt and source terms review.
- High-quality listing imagery with rights suitable for display or source-linked
  presentation.
- Map provider choice for location context.
- Hosting target compatible with Vite and optional Vercel-style APIs.

## Risks

- Source terms may prohibit scraping or reuse of listing images.
- Listings may be duplicated across brokers with inconsistent names, addresses,
  prices, and images.
- Price-on-request inventory reduces sort/filter usefulness unless clearly
  labeled.
- Stale or removed listings can erode trust if not surfaced prominently.
- Luxury buyers need provenance and source links; hiding source ownership would
  make the marketplace feel unreliable.
- The reference format is highly visual, so poor image quality or awkward crops
  will materially reduce perceived quality.

## Analytics

Track privacy-conscious events for:

- Cover enter.
- Listing navigation next/previous and input method where available.
- Search, sort, and filter changes.
- Detail opens and gallery interactions.
- Source link clicks.
- Inquiry/contact clicks.
- Share actions.
- Empty-result states.
- Stale/removed listing views.

Core launch metrics:

- Enter rate from cover.
- Listings viewed per session.
- Filter/search usage.
- Detail-open rate.
- Source or inquiry click-through rate.
- Share rate.
- Percentage of inventory with complete provenance and fresh checks.

## QA Plan

- Responsive: verify mobile, tablet, and desktop layouts; ensure controls,
  titles, filter pills, listing facts, and gallery content do not overlap.
- Accessibility: keyboard navigation, focus states, labels, semantic buttons,
  alt text, sufficient contrast, and reduced-motion behavior.
- Interaction: cover enter, next/previous arrows, keyboard arrows, wheel,
  swipe, toolbar menu, filter reset, search, sort, detail open/close, share, and
  external source/inquiry links.
- Data trust: every listing shows source attribution, original URL, price state,
  last checked, provenance, and stale/removed state when present.
- SEO/social: title, description, canonical, Open Graph, Twitter metadata, and
  generated pages or deep links.
- Performance: production build, image loading behavior, initial load budget,
  lazy gallery media, and no blocking live refresh failure.
- Compliance: robots/terms evidence exists before any adapter scrapes a source;
  unavailable/non-compliant sources render transparent fallback status.

## Launch Criteria

- A production build succeeds.
- MVP browse, search, sort, filter, detail, gallery, map, inquiry, share, and
  source-link flows pass QA on desktop and mobile.
- Inventory refresh is repeatable, schema-valid, and transparent about every
  requested source.
- Deduplication retains all source links and produces deterministic canonical
  records.
- Legal/compliance notes exist for every source before launch.
- SEO/social metadata is present for the homepage and key deep links.
- README or equivalent docs cover local setup, data refresh, and deployment.
