# CONTEXT.md — living state

> Update this at the end of every session. It is the memory between sessions so
> decisions are not re-litigated.

## Current step

**2026-07-19 — seat inventory + booking records + flyer upload (this session).** A deliberate
scope expansion past the prior "catalog, not a booking engine" non-goal, confirmed with the product
owner. Three additions:

1. **Seat inventory per departure.** `travel_package_departure` gained a nullable `totalSeats`
   quota (null = untracked). The enriched departure response now carries computed
   `bookedSeats`/`remainingSeats` (aggregate only — never individual rows, since the list is
   anonymous-readable). `seatsNote` is kept as an optional free-text display override.
2. **Back-office booking records.** New `travel_package_booking` table (FK → departure, cascade;
   `customerName`, `pax`, `phone`, `notes`, `status` = confirmed|cancelled). Admin-only CRUD
   (`/travel-package-bookings`, session-gated). Confirmed pax count against the quota; the service
   rejects an overbooking inside a row-locked transaction. **Booking flow:** the public CTA opens a
   **WhatsApp** chat (`wa.me/<siteConfig.contact.phoneNumber>`); after the WhatsApp conversation an
   admin records the booking in the back-office. No public booking POST. Because bookings key off
   departure ids, the package write path now **upserts departures by id** (was delete+reinsert) and
   refuses to drop a departure that still has bookings.
3. **Flyer upload.** New `travel_package.flyerUrl`; real file upload via `POST /api/uploads/flyer`
   (`@fastify/multipart`, admin-only, image/PDF, 5 MiB cap) stored on **local disk**
   (`apps/api/uploads/`, gitignored) and served by `@fastify/static` at `/uploads`. New env:
   `API_PUBLIC_URL`, `UPLOADS_DIR`, `MAX_UPLOAD_BYTES`. A reusable `FileUploadFormField` (web) drives
   it. Storage is single-server local disk — revisit for multi-instance/serverless deploys (S3/R2).

Admin manages seats/bookings via a per-package drill-in dialog ("Manage seats & bookings" row
action → `travel-package-inventory-dialog.tsx`).

**2026-07-18 — umrah-model expansion.** The domain was reshaped from a
generic flight+hotel bundle into an umrah-shaped catalog: a package now has a `type`
(umrah / umrah_plus / hajj), one-or-more ordered city stays (`travel_package_stay`, Makkah +
Madinah), dated departures (`travel_package_departure`), an included/excluded list
(`travel_package_inclusion`), an optional day-by-day program (`travel_package_itinerary_day`), and
an optional `mealPlan`. The old single `property_code` column on `travel_package` was removed
(migration `0015`), after backfilling existing packages into a stay (migration `0015`'s data step).
Full stack touched: `packages/db` schema + seed, `packages/shared` contracts, `apps/api`
service/tests, regenerated hooks, `apps/web` admin form + card/columns/public list, all 6 locales.

Earlier history: the domain + City were originally built and committed in a single pass
(`5e0b3a6`, 2026-07-14); this doc set was scaffolded retroactively on 2026-07-16.

## Confirmed decisions

- **Flat pricing, no fares/PNR** — one flat price + currency per package, set directly by an admin.
  No occupancy-tiered pricing, no fares, no PNR/ticketing. Still holds.
- **Seat inventory IS now tracked (2026-07-19, reversed).** The earlier "no seat/room inventory, no
  availability check" line was deliberately reversed this session: departures carry a numeric
  `totalSeats` quota and back-office `travel_package_booking` records, with server-side overbooking
  rejection. It remains **back-office only** — no public self-service booking; the public CTA is a
  WhatsApp deep link and staff enter the booking. `seatsNote` survives as a display override.
- **A package has one Flight + one-or-more ordered Property stays** (reversed 2026-07-18 from the
  original "exactly one Property"). Stays live in `travel_package_stay` (Makkah + Madinah, plus a
  third city for umrah_plus); stay nights must sum to `durationNights` (enforced in the service).
  Multi-flight bundling is still out of scope — `flightId` stays 1:1.
- **Public list is anonymous-readable** (`@AllowAnonymous()` on the `GET` routes) — the only
  anonymous-readable surface added by either the hotels or travel-packages domains so far; hotels
  search stays gated behind auth (see `/prd/hotels/CONTEXT.md`).
- **City is shared reference data, not a travel-packages-owned entity** — it was introduced here
  because the same build pass needed it for `airports.city_code` and the hotels destination
  combobox. Do not treat this CONTEXT.md as authoritative for City's usage in other domains;
  cross-check `/prd/flights/` and `/prd/hotels/CONTEXT.md` if City's role there changes.
- **No search/filter on the public page** — deliberately a plain grid, matching the "curated
  catalog" framing rather than a query surface.
- **Public route renamed 2026-07-17**: `/travel-packages` → `/packages`. The URL read as
  misleading once the TawafSai landing page's own "Paket" (umrah packages) existed — `/packages`
  is meant as the general cross-domain explore page (umrah, travel, etc.), the landing page's
  "Paket" section only surfaces featured/discounted umrah packages. Feature folder
  (`apps/web/src/features/travel-packages/`), API domain, and DB table name are unchanged — only
  the public-facing route slug moved. See `prd/landing/CONTEXT.md`.

## Open questions

- Should City eventually get its own `prd/` domain folder (or move under a shared
  "reference-data" domain alongside currency/fx-rate) now that three domains (flights, hotels,
  travel-packages) depend on it? Not resolved — flagged, not blocking.
- `destination` on Property/Package is still a free-text column constrained only by a UI
  combobox, not a DB-level FK to `city`. Whether that should tighten to a real FK is open — not
  blocking, but a future data-integrity gap if someone bypasses the admin UI.
- ~~Whether Travel Packages should support more than one property per package~~ — **resolved
  2026-07-18**: multi-city stays shipped via `travel_package_stay`. Multi-*flight* per package
  remains unexplored (still 1:1).
- The day-by-day itinerary (`travel_package_itinerary_day`) is contract- and DB-supported but not
  yet exposed in the admin form — a follow-up UI item.

## Progress checklist

See `20-steps.md` — all 9 retroactively-logged steps are complete and committed.

## Entity table (2 top-level entities: 7 tables — plus dependencies on Flight/Property from other domains)

| # | Entity | Table | Key | Admin CRUD | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | City | `city` | city code (natural key) | `reference/cities` | Cross-domain reference data; also consumed by flights (`airports.city_code`) and hotels (destination combobox). |
| 2 | Travel Package | `travel_package` (Drizzle: `flightHotelPackage`) | ULID | `travel-packages/admin` | References one Flight + one-or-more Property stays. `flyerUrl` (uploaded). Public list at `/packages`. |
| 2a | — Stay | `travel_package_stay` | ULID | (via package form) | Ordered city stay → `property`. Nights sum to `durationNights`. |
| 2b | — Departure | `travel_package_departure` | ULID | (via package form) | Dated group departure; `totalSeats` quota (nullable), `seatsNote` display override. Upserted by id. |
| 2c | — Inclusion | `travel_package_inclusion` | ULID | (via package form) | Included/excluded line item. |
| 2d | — Itinerary day | `travel_package_itinerary_day` | ULID | (not yet in UI) | Day-by-day program. |
| 2e | — Booking | `travel_package_booking` | ULID | `travel-package-bookings` (admin-only) | Back-office reservation vs a departure; confirmed pax consume the quota. |

## Definition of done

The 2026-07-18 umrah-model expansion is complete across DB (schema + migrations `0014`/`0015` +
seed), contracts, API service + tests, regenerated hooks, web (admin form, card, columns, public
list), all 6 locales, and these PRD docs. Remaining follow-ups: surface the itinerary editor in the
admin form; provide real non-English translations for the new i18n keys (currently English
placeholders in the five non-`en` locales).
