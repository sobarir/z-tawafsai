# Travel Packages — overview

> Retroactively documented: this domain was built and committed (`5e0b3a6`, 2026-07-14) before
> it had a `prd/` folder. This doc describes what exists, not what's planned.

## What this is

Admin-curated, flat-priced bundles that pair one specific operating flight with one specific
hotel property into a single sellable catalog item — a display/marketing product, not a booking
engine (no fares, no PNR, no seat inventory; consistent with the flights domain's "not a booking
engine" scope and the hotels domain's "search/display only" scope — see
`/prd/flights/00-overview.md` and `/prd/hotels/CONTEXT.md`).

## Goals

- Admin CRUD over travel packages.
- A public, anonymous-readable card listing at `/packages` so a visitor can browse curated
  deals without signing in.
- Enrich each package with derived display info (airline name, direct/transit, duration) computed
  server-side from the flight/leg/airline/airport/city reference tables — the client never
  re-derives this.

## Non-goals

- Not a booking flow — "Request this" is a `mailto:` stub, never a POST (mirrors the hotels
  `hotel-search` detail page CTA).
- No price computation — `price`/`currency` are flat fields an admin sets directly per package,
  not derived from the underlying flight's fare or the hotel's own rate rules.
- No search/filter UI on the public page — it's a plain grid of all `isActive` packages
  (`travel-package-list.tsx`), not a query surface.
- No independent inventory — a package references exactly one existing Flight and one existing
  Property; it does not own flight or hotel records of its own.

## Relation to other domains

- Depends on **flights**: `flightId` FK → `flights.id` (the specific operating flight).
- Depends on **hotels**: `propertyCode` FK → `property.property_code` (must be a `kind=property`
  listing — hotels' `package` entity is not eligible as the "hotel" side of a bundle, despite the
  name collision below).
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
- DB: table `travel_package` + table `city`. Migrations `0005_parallel_doorman.sql` (create
  `city`), `0006_outstanding_maginty.sql` (`airports.city_code` FK to `city` + unique index on
  `city.name`), `0007_lonely_bromley.sql` (create `travel_package`).
- i18n: `travelPackages` namespace (public card list) and `travelPackagesAdmin` namespace (admin
  form/table), all 6 locales.

## Naming gotcha (non-obvious — read before touching either table)

The Drizzle schema already had an unrelated export named `schema.travelPackage` — this is the
**hotels domain's `package` table** (the `kind=package` Listing variant, keyed by `packageCode`),
predating this feature. The *new* flight+hotel bundle entity added here is a different Postgres
table (`travel_package`) but its Drizzle export is named `schema.flightHotelPackage` specifically
to avoid colliding with the pre-existing `schema.travelPackage` export.

**`schema.travelPackage` ≠ the Travel Packages feature. `schema.flightHotelPackage` is the Travel
Packages feature.** Reading the wrong one silently type-checks against the wrong table.
