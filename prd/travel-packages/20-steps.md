# Build steps

> Retroactive log — this domain landed in a single commit (`5e0b3a6`, 2026-07-14) rather than a
> sequenced multi-session build. Steps are recorded here for the checklist shape `CONTEXT.md`
> expects, not because they happened as separate sessions.

- [x] **Step 1 — City reference entity.** Schema (`city` table, migration `0005`), Zod contracts
  (`citySchema`/`createCitySchema`/`updateCitySchema`), backend CRUD
  (`apps/api/src/cities/`), frontend admin CRUD (`apps/web/src/features/cities/`) at
  `(protected)/@admin/reference/cities`.
- [x] **Step 2 — Wire City into existing consumers.** `airports.city_code` gets an FK to
  `city.city_code` (migration `0006`, plus a unique index on `city.name`). Hotels' Property/Package
  admin forms switch their `destination` field from free text to a `ComboboxFormField` sourced
  from `useListCities()`.
- [x] **Step 3 — Travel Packages schema + backend.** `travel_package` table (migration `0007`,
  Drizzle export `flightHotelPackage` — see naming note in `00-overview.md`), Zod contracts
  (`flightHotelPackageSchema` + create/update), backend CRUD
  (`apps/api/src/travel-packages/`), `GET` endpoints marked `@AllowAnonymous()` for the public
  list/detail, response enrichment (`enrich()`) joining flight/airline/leg/airport/city/property/
  listing at read time.
- [x] **Step 4 — Admin frontend.** `apps/web/src/features/travel-packages/` admin CRUD screen at
  `(protected)/@admin/travel-packages/admin`, combobox pickers for flight/property/currency,
  sidebar nav entry under a new admin-only section.
- [x] **Step 5 — Public frontend.** `(public)/travel-packages/page.tsx` — anonymous-readable,
  plain grid of `isActive` packages (`TravelPackageList` → `TravelPackageCard`), no search/filter.
  Header nav link added (`/travel-packages`) alongside the existing top-nav items.
- [x] **Step 6 — Combobox rebuild.** The shared `Combobox` primitive was rebuilt on real shadcn
  `Command` (new `cmdk` dependency) to fix a pointer-events-inherited-from-Dialog bug — a
  prerequisite for the flight/property/city comboboxes introduced above to work correctly inside
  Dialog-based forms. See `[[feedback_use_shadcn_components]]`.
- [x] **Step 7 — Tests.** `cities.service.spec.ts` (CRUD + conflict-on-duplicate-name),
  `travel-packages.service.spec.ts` (CRUD against seeded GA402/JED-WFH fixtures, not-found path).
- [x] **Step 8 — Seed data.** 19 cities backing the existing seeded airports'
  `cityCode`s, seeded via idempotent `onConflictDoUpdate` in `packages/db/src/seed.ts`. No
  dedicated travel-package seed rows beyond what the spec creates and cleans up itself.
- [x] **Step 9 — Quality gates.** Landed alongside a `/code-review` pass and the hotel-search UI
  unification in the same commit; repo-root gates were green at commit time per the top-level
  session record (see `git log`/`git show 5e0b3a6` — no domain-specific gate log was kept
  separately from the commit itself).
