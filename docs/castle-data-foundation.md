# Italian Historic Estates Marketplace Data Foundation

Last checked: 2026-07-31

This document defines the compliant data foundation for an Italian castles and masserias marketplace. It is intentionally an ingestion plan, not a scraper implementation. Adapters must prefer licensed feeds, APIs, CRM exports, affiliate or partner access, and manual editorial fixtures. Public-page scraping is allowed only after source-specific robots.txt and terms review confirms it is permitted for the exact paths and use case.

## Compliance Baseline

- Do not bypass authentication, paywalls, bot checks, CAPTCHAs, JavaScript verification, rate limits, geofencing, or blocked API endpoints.
- Check robots.txt and source terms before each adapter release and at least monthly after launch. Treat a missing, blocked, ambiguous, or changed policy as a stop condition for automated collection.
- Prefer partner feeds, broker-provided XML/CSV, public syndication APIs, email alerts with permission, or manually entered fixtures over HTML extraction.
- Store only the minimum content needed to help a buyer evaluate and click through: source name, source URL, normalized facts, short attributed summary when licensed, and image URLs only when the source grants reuse or hotlink/display permission.
- Preserve attribution on every listing card and detail page. Every source record must retain its original listing URL and source-specific listing ID or a stable URL fingerprint.
- Use polite fetching for any permitted public collection: source-specific adapters, explicit allowlist paths, conservative concurrency of 1 per source, conditional requests, exponential backoff, retry caps, and cache TTLs.
- Keep a takedown workflow: mark the affected source record as removed, suppress non-licensed copied content, retain audit provenance, and re-run dedupe because the canonical representative may change.

## Source Inventory Plan

### Castle Sources

| Source | Primary access method | Likely fields | Cadence | Attribution | Legal/terms risk | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| Castleist | Request partner/feed access or written permission for Italian castle listing reuse. Use public pages only as discovery if robots and terms permit. | Title, location, price or price-on-request, photos, description, source agent link, property type, size/land when present. | Daily partner/feed refresh; weekly manual review if no feed. | `Castleist` label and original listing URL on cards and detail pages. | Unknown until terms and robots review for the exact domain and listing paths. Treat as medium risk and do not scrape without written permission or a positive policy review. | Manual editorial fixture containing URL, high-level facts, and link-out only. |
| Castle Collector | Request marketplace/partnership export. Public site exposes country, price, beds, baths, area, build year, third-party listing status, agent/outreach flow. | Title, country/region/city, price, size, beds, baths, build year, listing type, third-party source, inquiry path. | Daily if feed/API; every 2-3 days for permitted public listing checks. | `Castle Collector` with original marketplace URL and, when available, external agent/source URL. | Terms must be reviewed before commercial reuse. Because it aggregates third-party listings, verify downstream source rights before copying photos/descriptions. | Link-only cards with normalized facts from licensed/manual review; route inquiries to Castle Collector or source agent. |
| ImmobiliareItaliano | Prefer broker/portal feed or written permission. Terms page exists and permits downloading information only for personal, non-commercial use unless otherwise authorized. | Title, municipality/province/region, price, rooms, size, land, photos, agency, phone/contact path, reference code. | Daily for feed; weekly compliance review. | `ImmobiliareItaliano` and original URL; show agency attribution if provided. | High for automated commercial aggregation without permission because terms restrict commercial copying/republication. | Manual link-out only; ingest source URL, price label, region/province, and last-checked status with no copied media unless licensed. |
| Italy Luxury Property for Sale | Identify operating domain and request direct data access from the site/operator before ingestion. If it is an agency site, negotiate permission for listings represented by that agency. | Luxury listing title, town/region, price or request, floor area, land, bedrooms, condition, amenities, photos, inquiry details. | Daily partner export; weekly manual refresh if small inventory. | Site/agency name and original listing URL; retain agency contact action. | Unknown until domain, robots, and terms are verified. Treat as high risk if no terms are findable. | Curated manual fixture with contact/link-out and no replicated long descriptions or photos. |
| Tranio | Request partner/API access. Robots currently disallow `*/castles/`, `/api/`, `/search/`, and many property categories for general crawlers, so castle scraping is not allowed. | Country/region/city, price, property type, area, land, bedrooms, source manager/contact, photos if licensed. | Daily partner feed only. | `Tranio` and original listing URL; no hidden rerouting of inquiries. | High for public scraping because robots blocks castle paths and API/search paths. | Partner feed, manual URL review, or exclude Tranio inventory with a transparent "source unavailable pending permission" note. |
| RealPortico | Prefer professional interfaces/import/export or written partnership. Public pages describe historic property listings and seller plans; verify exact robots and terms before any automated fetch. | Historic property type, country/region/place, price, area, land, description, photos, address visibility level, listing ID. | Daily partner interface; every 2-3 days if explicitly permitted. | `REALPORTICO` and original listing URL; preserve address precision chosen by source. | Medium until terms and robots are verified; address visibility settings require special care. | Manual listing fixture or source-level link-out when permission is unavailable. |
| JamesEdition | Ask for seller/API/partner access or use public pages only where robots and terms allow. Robots allow public pages but disallow member/seller/login, inquiry, map, AJAX/feed, and nearby-listing endpoints. Terms state JamesEdition aggregates public listings and provides takedown channels, while listing content remains owned by source agencies/sellers. | Title, price, location, property type, bedrooms, bathrooms, living area, land, amenities, images, seller, listing URL, seller inquiry URL. | Daily feed/API; public checks only if compliant and low rate. | `JamesEdition` plus original URL and seller/agency where displayed. | Medium: public pages are not globally blocked, but content rights remain with sellers and several dynamic endpoints are disallowed. Avoid copying full descriptions/photos without license. | Store facts plus source URL; use JamesEdition inquiry link; honor takedown requests immediately. |
| Sotheby's Italy | Use Sotheby's International Realty partner/IDX-style feed or written permission. Robots access currently presents bot verification in this runtime, and Sotheby's terms prohibit commercial distribution/exploitation without prior written permission. | Listing title, location, price/request, brokerage/agent, bedrooms, bathrooms, size, land, amenities, images, virtual tours, inquiry links. | Daily partner/IDX feed only. | `Sotheby's International Realty Italy` with original URL and brokerage/agent attribution. | High for scraping: automated access is blocked/verified and terms restrict commercial reuse. | Partner feed or hand-curated link-out cards with permission; otherwise mark source unavailable. |
| LuxuryEstate | Request professional/partner data access. Terms page says listings are published by advertisers, must be accurate/current, and content is protected; robots must be rechecked for exact paths before automated collection. | Title, country/region/city, price, property type, bedrooms/rooms, bathrooms, area, land, agency, images, amenities, listing URL. | Daily partner feed; every 2-3 days for permitted public status checks. | `LuxuryEstate` and original listing URL; include advertiser attribution when present. | Medium-high: advertiser-owned content and commercial reuse limits require permission for descriptions/images. | Link-only cards or manual fixtures until permission is secured. |
| Le Figaro Properties | Request Figaro Classifieds partner permission or feed. Terms prohibit extracting, storing, reproducing, or automatically collecting site content for commercial purposes without authorization. | Listing title, country/region/city, price, property type, bedrooms, surface, land, advertiser, photos, contact form URL. | Daily authorized feed only. | `Le Figaro Properties` and original URL; include advertiser/agency attribution. | High for scraping because terms explicitly restrict automated extraction and commercial/professional reuse. | Exclude from automated ingestion until authorized; provide a source-level link-out or manual authorized fixtures. |

### Puglia Masseria Sources

The Puglia masseria adapters use the same compliance baseline, source-record contract, cache/retry/rate-limit rules, stale/removed handling, provenance, and deterministic deduplication rules as castles. The current implementation is a compliant manual/link-only adapter set in `scripts/refresh-castle-inventory.mjs`; it does not scrape public listing pages or bypass access controls.

| Source | Primary access method | Likely fields | Cadence | Attribution | Legal/terms risk | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| Idealista | Request portal/API/feed permission for Puglia rural-property inventory. Public pages may be used only for manual discovery or automation after a positive path-level robots and terms review. | Title, municipality/province, price, rooms, floor area, land, agency, reference, listing URL, images if licensed. | Daily authorized feed; weekly manual permission/source review until authorized. | `Idealista` label, original listing URL, and agency attribution when licensed. | Medium-high: robots allows some sale paths but blocks AJAX, user, saved, photo, virtual-tour, map/list-sort, and broad localized paths; commercial reuse permission is still required. | Source-level status only; no copied descriptions, photos, or hidden contact details until portal permission exists. |
| Immobiliare.it | Request authorized feed/API or written commercial aggregation permission for Puglia rustici/masserie. | Title, location, price or request, size, rooms, land, agency, reference, listing URL, images if licensed. | Daily authorized feed; weekly source-level permission check. | `Immobiliare.it` label, original URL, and advertiser/agency attribution. | Medium-high: robots exposes sitemap discovery and blocks selected paths, but terms/portal permission are still needed for copied commercial reuse. | Source-level status only until authorized feed/API or written permission exists. |
| Gate-away | Prefer portal feed, broker export, or written permission; use manual link-only fixtures while rights are pending. | Title, region/province/municipality, price, bedrooms, bathrooms, surface, land, features, agency, source URL. | Daily feed if granted; weekly manual review pending feed. | `Gate-away` label and original listing URL on cards/detail pages. | Medium: public inventory is portal/agent content, so full descriptions and images require permission. | Manual link-only masseria records with high-level normalized facts and source link. |
| JamesEdition | Request seller/API/partner access or use link-only manual records where public page checks remain compliant. | Title, price/request, location, property type, beds/baths, area, land, seller, images, amenities, listing URL. | Daily feed/API; weekly manual link-only review while permission is pending. | `JamesEdition` plus original URL and seller/agency where available. | Medium: public pages are not globally blocked, but disallowed member/seller/login/inquiry/map/AJAX/feed endpoints and seller-owned content require care. | Store normalized facts plus source URL; use JamesEdition/source inquiry route. |
| LuxuryEstate | Request professional/partner data access. | Title, location, price/request, property type, rooms, area, land, advertiser, images, amenities, listing URL. | Daily partner feed; weekly manual review pending access. | `LuxuryEstate` and original URL; include advertiser attribution when present. | Medium-high: advertiser-owned content and commercial reuse limits require permission for descriptions/images. | Link-only records or manual fixtures until permission is secured. |
| Engel & Volkers | Request direct brokerage export, partner feed, or written permission from the relevant Italy office. | Title, brokerage/office, location, price/request, beds/baths, area, land, amenities, images, agent/contact route. | Partner feed or direct broker export only. | `Engel & Volkers` plus original office/listing URL and broker attribution. | High without permission: brokerage content, lead flows, and media must not be crawled or republished without authorization. | Mark source unavailable pending written permission or direct export. |
| Sotheby's Italy | Use Sotheby's International Realty partner/IDX-style feed or written permission. | Title, location, price/request, brokerage/agent, bedrooms, bathrooms, size, land, amenities, images, virtual tours, inquiry links. | Daily partner/IDX feed only. | `Sotheby's International Realty Italy` with original URL and brokerage/agent attribution. | High for scraping: automated access presented bot verification in this runtime, and terms restrict commercial distribution without prior written permission. | Partner feed or hand-curated link-out cards with permission; otherwise mark source unavailable. |
| Romolini | Request direct agency permission or export for Puglia masserie. | Title, location, price/request, property type, floor area, land, bedrooms, condition, amenities, agency reference, images, URL. | Daily agency export; weekly manual review while permission is pending. | `Romolini` with original URL and agency attribution. | Medium-high: boutique agency content and media require authorization before copied reuse; public automation needs a positive robots and terms review. | Source-level note or agency-approved link-only fixture. |
| Apulia Exclusive Houses | Request direct agency feed or written permission. | Title, town/province, price/request, bedrooms, bathrooms, floor area, land, pool/garden/tourism features, agency reference, URL. | Direct agency feed only until public policy is reviewed. | `Apulia Exclusive Houses` and original agency URL. | High until terms/robots and agency permission are verified. | Mark source unavailable pending direct agency permission. |
| Oikos Immobiliare | Prefer agency export or written permission; current adapter is manual/link-only. | Title, Puglia town/province, agency reference, price/request, beds/baths, floor area, land, features, source URL. | Daily agency export if granted; weekly manual link-only review pending export. | `Oikos Immobiliare` label, original URL, and Oikos reference when present. | Medium: public pages show Puglia listings, but copied descriptions/media and automated collection require agency permission. | Manual link-only fixture with source URL, reference, high-level facts, and attribution. |

## Adapter Contract

Every source adapter must emit raw source records into a staging area before normalization. A source record has:

- `source_key`: stable enum for the source.
- `source_listing_id`: source ID when available, otherwise a URL fingerprint.
- `source_url`: canonical listing URL without tracking parameters.
- `retrieved_at`: ISO 8601 time for the fetch or manual review.
- `source_status`: `active`, `removed`, `stale`, `blocked`, or `permission_required`.
- `license_basis`: `partner_feed`, `api_terms`, `written_permission`, `manual_editorial`, or `link_only`.
- `raw_payload_ref`: pointer to the cached raw payload or manual review note.

Normalize source records into the canonical schema in `data/castle-listing.schema.json`. The schema includes `asset_class` (`castle` or `masseria`) so masserias and castles can coexist while retaining specific `property_type` values such as `castle`, `masseria`, `trullo`, or `farmhouse`. Validation failures must park the record for review; they must not silently drop unknown values or guess required fields.

## Canonical Listing Rules

- One canonical listing can have many `sources`. Source links are never collapsed or overwritten.
- `asset_class` identifies the marketplace inventory family. `property_type` keeps the specific property shape used for search, display, and dedupe conflict checks.
- `status` is marketplace visibility: `active`, `stale`, `removed`, `pending_permission`, or `archived`.
- `pricing.display` must be `asking_price`, `price_on_request`, `range`, `unknown`, or `sold_removed`. If a source says "price on request", keep `amount` null and set `price_on_request` true.
- Location may be approximate. Store the source's precision in `location.precision` and do not increase precision beyond what the source published or licensed.
- Images require explicit `rights_basis`. If rights are unclear, keep only source-page thumbnails where linking/display is permitted or omit images and rely on click-through.
- Inquiry actions can be `source_link`, `agent_email`, `agent_phone`, `contact_form`, or `partner_inquiry`. Do not expose scraped private contact data unless licensed and intentionally published for that purpose.

## Deterministic Deduplication

Deduplication runs in three stages and records evidence on the canonical listing.

1. Exact source identity
   - Same normalized `source_url` or same `(source_key, source_listing_id)` is the same source record.
   - If one source republishes another and exposes the original URL, retain both as source records but score them as one property candidate.

2. Strong property match
   - Same normalized title tokens after removing agency adjectives, plus same province/municipality, plus at least two of: price within 2%, living area within 5%, land area within 5%, bedroom count exact, coordinate distance under 1 km.
   - Confidence: `high`.

3. Probable property match
   - Same province/region and at least three of: distinctive name token, municipality, price within 5%, living area within 10%, land area within 10%, bedroom count within 1, overlapping amenities, coordinate distance under 5 km.
   - Confidence: `medium`; require editorial review before auto-merge in the UI.

Do not merge when region/province conflicts, both records have precise coordinates more than 10 km apart, or property type materially conflicts without an override.

Canonical record choice is deterministic:

1. Prefer a source with `license_basis` of `partner_feed`, `api_terms`, or `written_permission`.
2. Prefer the most recently checked active source.
3. Prefer the source with the most complete structured facts.
4. Prefer direct listing-owner/broker source over aggregator.
5. Tie-break by source priority configured in code, then lexicographic `source_key`.

Merged records keep all source links in `sources`. Stale and removed handling:

- If one source removes a listing but another active source remains, keep the canonical listing active and mark only that source record `removed`.
- If all sources are removed, set canonical `status` to `removed`, hide it from default browsing, preserve it for audit/dedupe, and show it only in admin/review views.
- If no source has been checked within the source cadence plus seven days, set `status` to `stale` until refreshed.
- If permission expires for the canonical representative, recompute representative fields from the next licensed active source or downgrade to link-only.

## Launch Readiness Checklist

- Each source has a dated robots and terms review.
- Each enabled adapter has an allowlist of permitted paths/endpoints and a rate-limit profile.
- Every listing validates against `data/castle-listing.schema.json`.
- Every canonical listing has at least one source URL and visible attribution.
- Search/filter fields are populated from canonical fields, not source-specific display strings.
- Takedown and removal flows are tested with source-level and canonical-level status changes.
