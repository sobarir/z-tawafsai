# Travel Packages — overview

> Retroactively documented: this domain was built and committed (`5e0b3a6`, 2026-07-14) before
> it had a `prd/` folder. **Expanded 2026-07-18** from a generic flight+hotel bundle into an
> umrah-shaped catalog (multi-city stays, package type, dated departures, included/excluded list).
> This doc describes what exists, not what's planned.

## What this is

Admin-curated, flat-priced **umrah/hajj packages**: one specific operating flight paired with one
or more **ordered city stays** (Makkah + Madinah for umrah; a third city for `umrah_plus`), plus a
dated departure schedule and an included/excluded list — a display/marketing product, not a
booking engine (no fares, no PNR, no seat inventory; consistent with the flights domain's "not a
booking engine" scope and the hotels domain's "search/display only" scope — see
`/prd/flights/00-overview.md` and `/prd/hotels/CONTEXT.md`).

## Goals

- Admin CRUD over travel packages, including their stays / departures / inclusions.
- **Marketing-agent model (2026-07-19):** the app owner resells packages from multiple umrah travel
  **providers** (`travel_provider`, admin CRUD). Each package names one provider and a per-seat
  commission (`feePerSeat`); an admin-only **earnings report** sums the agent's commission from
  confirmed bookings, by provider + currency.
- A public, anonymous-readable card listing at `/packages` so a visitor can browse curated
  deals without signing in.
- Enrich each package with derived display info (airline name, direct/transit, per-stay hotel
  details, departures, inclusions) computed server-side from the flight/leg/airline/airport/city
  and property reference tables — the client never re-derives this.

> **Scope note (2026-07-19):** two non-goals below were deliberately reversed — seat inventory and
> a (back-office) booking record now exist. See `CONTEXT.md`'s 2026-07-19 entry. What stays out:
> public self-service booking, occupancy-tiered pricing, fares/PNR/ticketing.

## Non-goals

- **No public self-service booking flow** — the public "Request this" CTA is a **WhatsApp deep
  link** (`wa.me`), never a booking POST. Bookings are recorded by staff in the admin after the
  WhatsApp conversation.
- No price computation and **no occupancy-tiered pricing** — `price`/`currency` are flat fields an
  admin sets directly per package, not Quad/Triple/Double bands and not derived from the flight's
  fare or the hotel's rate rules.
- **Seat inventory IS tracked** (reversed 2026-07-19) — `departure.totalSeats` is a real numeric
  quota, back-office `travel_package_booking` rows consume it, and the service rejects overbooking.
  Still out: fares/PNR/ticketing, DP/refund logic, and any public availability POST.
- No search/filter UI on the public page — it's a plain grid of all `isActive` packages
  (`travel-package-list.tsx`), not a query surface.
- A package still owns no flight or hotel records of its own — it references one existing Flight
  and existing Property rows via `travel_package_stay`.

## Relation to other domains

- Depends on **flights**: `flightId` FK → `flights.id` (the specific operating flight; one per
  package).
- Depends on **hotels**: each `travel_package_stay.propertyCode` FK → `property.property_code`
  (must be a lodging property). Two-plus stays per package (Makkah + Madinah, …); the package row
  itself no longer holds a single `propertyCode`.
- Introduces the **City** reference entity (`11-data-model.md`), which is also a dependency of
  `airports.city_code` (flights domain) and the `destination` combobox on hotels' Property/Package
  admin forms. City is genuinely cross-domain reference data, not owned exclusively by this
  domain — it's documented here because it was introduced in the same build pass as Travel
  Packages, not because Travel Packages is its home.

## Where it lives

- Backend: `apps/api/src/travel-packages/` (controller/service/dto/module), `apps/api/src/cities/`
  (City CRUD).
- Contracts: `packages/shared/src/index.ts` — `flightHotelPackageSchema` /
  `createFlightHotelPackageSchema` / `updateFlightHotelPackageSchema`, `citySchema` /
  `createCitySchema` / `updateCitySchema`.
- Frontend: `apps/web/src/features/travel-packages/` (admin CRUD + public card list),
  `apps/web/src/features/cities/` (admin CRUD). Routes: `(public)/(chrome)/packages/page.tsx`
  (public list, anonymous-readable — URL is `/packages`; the feature folder and API/DB domain
  keep the `travel-packages` name, only the public-facing route slug changed),
  `(protected)/@admin/travel-packages/admin/page.tsx` (admin CRUD, admin-only — no `@user`
  counterpart), `(protected)/@admin/reference/cities/page.tsx` (City admin, under the "Reference
  Data" sidebar section alongside currencies/fx-rates).
- DB: tables `travel_package`, `travel_package_stay`, `travel_package_departure`,
  `travel_package_inclusion`, `travel_package_itinerary_day`, and `city`. Migrations
  `0005_parallel_doorman.sql` (create `city`), `0006_outstanding_maginty.sql` (`airports.city_code`
  FK to `city` + unique index on `city.name`), `0007_lonely_bromley.sql` (create `travel_package`),
  `0014_special_ken_ellis.sql` (enums + four child tables + `type`/`meal_plan` columns),
  `0015_big_jubilee.sql` (drop the old single `property_code` column, after backfilling existing
  packages into `travel_package_stay`).
- i18n: `travelPackages` namespace (public card list) and `travelPackagesAdmin` namespace (admin
  form/table), all 6 locales.

## Former naming gotcha (resolved 2026-07-18 — kept for history)

The Drizzle schema used to have a second, unrelated export named `schema.travelPackage` — the
**hotels domain's `package` table** (the `kind=package` Listing variant, keyed by `packageCode`),
predating this feature. This feature's flight+hotel bundle entity was deliberately named
`schema.flightHotelPackage` (Postgres table `travel_package`) specifically to avoid colliding
with that pre-existing `schema.travelPackage` export.

**The collision this section used to warn about no longer exists**: the hotels domain's
`package` table (and `schema.travelPackage`) was removed on 2026-07-18 — see
`prd/hotels/CONTEXT.md`. `schema.flightHotelPackage` (Postgres table `travel_package`) is
untouched and remains this domain's table; there is no other `travelPackage`-named export to
confuse it with anymore.
