# CONTEXT.md — living state

> Update this at the end of every session. It is the memory between sessions so
> decisions are not re-litigated.

## Current step

This entire domain, plus the City reference entity, was built and **committed** in a single pass
(`5e0b3a6`, 2026-07-14) alongside unrelated hotel-search UI unification and a `catalog/*` →
`reference/*` route rename. There was no `prd/travel-packages/` folder at the time — this doc set
was scaffolded retroactively on 2026-07-16 to bring the domain's documentation in line with
AGENTS.md's "one PRD per domain" convention. Nothing here is aspirational; `00-overview.md`,
`11-data-model.md`, and `20-steps.md` describe what already exists in the codebase, verified
against the actual source (`apps/api/src/travel-packages/`, `apps/api/src/cities/`,
`packages/db/src/schema/app.ts`, `packages/shared/src/index.ts`) as of this scaffolding session.

Working tree is clean; nothing in this domain is pending commit.

## Confirmed decisions

- **Display/marketing product, not a booking engine** — one flat price + currency per package,
  set directly by an admin. No fares, no PNR, no seat/room inventory, no availability check
  against the underlying flight or property. See `00-overview.md` non-goals.
- **Public list is anonymous-readable** (`@AllowAnonymous()` on the `GET` routes) — the only
  anonymous-readable surface added by either the hotels or travel-packages domains so far; hotels
  search stays gated behind auth (see `/prd/hotels/CONTEXT.md`).
- **A package references exactly one Flight + one Property** — `flightId`/`propertyCode` are
  plain FKs, not a range or list; bundling multiple flights or properties into one package is out
  of scope.
- **City is shared reference data, not a travel-packages-owned entity** — it was introduced here
  because the same build pass needed it for `airports.city_code` and the hotels destination
  combobox. Do not treat this CONTEXT.md as authoritative for City's usage in other domains;
  cross-check `/prd/flights/` and `/prd/hotels/CONTEXT.md` if City's role there changes.
- **No search/filter on the public page** — deliberately a plain grid, matching the "curated
  catalog" framing rather than a query surface.

## Open questions

- Should City eventually get its own `prd/` domain folder (or move under a shared
  "reference-data" domain alongside currency/fx-rate) now that three domains (flights, hotels,
  travel-packages) depend on it? Not resolved — flagged, not blocking.
- `destination` on Property/Package is still a free-text column constrained only by a UI
  combobox, not a DB-level FK to `city`. Whether that should tighten to a real FK is open — not
  blocking, but a future data-integrity gap if someone bypasses the admin UI.
- Whether Travel Packages should eventually support more than one property or flight per package
  (multi-city itineraries) is unexplored — no signal either way yet.

## Progress checklist

See `20-steps.md` — all 9 retroactively-logged steps are complete and committed.

## Entity table (2 entities: 2 tables, 0 derived — plus dependencies on Flight/Property from other domains)

| # | Entity | Table | Key | Admin CRUD | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | City | `city` | city code (natural key) | `reference/cities` | Cross-domain reference data; also consumed by flights (`airports.city_code`) and hotels (destination combobox). |
| 2 | Travel Package | `travel_package` (Drizzle: `flightHotelPackage`) | ULID | `travel-packages/admin` | References one Flight (flights domain) + one Property (hotels domain). Public list at `/travel-packages`. |

## Definition of done: met

Backend (City CRUD, Travel Packages CRUD + enrichment), frontend (City admin, Travel Packages
admin + public list), contracts, migrations, and tests are all complete and committed as of
`5e0b3a6`. This session's only change is documentation (this `prd/travel-packages/` folder plus
updates to `prd/README.md` and `backbone.yml`'s `prd.domains` map) — no code changed.
