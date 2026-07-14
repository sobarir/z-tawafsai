# 11 — Data Model (Drizzle spec)

Source of truth. Add these 8 tables + 2 enums to the existing
`packages/db/src/schema/app.ts` (copy the `post` pattern per `packages/db/AGENTS.md`) —
alongside the flights domain's `mctScope`/`legRole`/`flightStatus` enums and
`post`/`airports`/`airlines`/`flights`/`flightLegs`/`flightMarketing`/`mctRules`/
`interlineAgreements` tables already there (no naming collisions). Then run
`pnpm db:generate` to emit the migration. All money = integer minor units + currency. All IDs
ULID (via `createId()` from `@repo/db`) or natural key. Never UUID. All timestamps
`withTimezone: true`.

## Enums

```
listing_kind      : 'property' | 'package'
season_name       : 'standard' | 'peak' | 'ramadan' | 'hajj' | 'promo'
```

(`season_name` is a label only; the date window on `season` is what selects it.)

## 1. `currency` (reference, natural key)

| column         | type                        | constraints                  |
|----------------|-----------------------------|------------------------------|
| code           | char(3) PK                  | ISO-4217, e.g. 'USD','IDR','SAR' |
| minor_unit     | integer NOT NULL            | digits after decimal (2, or 0 for e.g. some) |
| symbol         | text NOT NULL               |                              |
| name           | text NOT NULL               |                              |

## 2. `fx_rate` (ULID)

Display conversion only. Rate stored as integer with fixed scale to avoid float.

| column         | type                        | constraints                  |
|----------------|-----------------------------|------------------------------|
| id             | text PK (ULID)              |                              |
| base_currency  | char(3) NOT NULL            | FK → currency.code           |
| quote_currency | char(3) NOT NULL            | FK → currency.code           |
| rate_ppm       | bigint NOT NULL             | rate × 1_000_000 (parts per million); converted = amount * rate_ppm / 1e6 |
| as_of          | timestamptz NOT NULL        |                              |

- UNIQUE `(base_currency, quote_currency)` — one current rate per pair.
- CHECK `base_currency <> quote_currency`.
- Index on `(base_currency, quote_currency)`.

## 3. `listing` (ULID) — the spine

| column         | type                        | constraints                  |
|----------------|-----------------------------|------------------------------|
| id             | text PK (ULID)              |                              |
| kind           | listing_kind NOT NULL       |                              |
| display_name   | text NOT NULL               |                              |
| destination    | text NOT NULL               | searchable (city/region)     |
| country_code   | char(2) NOT NULL            | ISO-3166-1 alpha-2           |
| hero_image_url | text NULL                   | single string, no media model|
| is_active      | boolean NOT NULL DEFAULT true|                             |
| created_at     | timestamptz NOT NULL DEFAULT now() |                       |

- Index on `destination`, index on `kind`, index on `(is_active, kind)`.

## 4. `property` (natural key: property_code), 1:1 with a property listing

| column         | type                        | constraints                  |
|----------------|-----------------------------|------------------------------|
| property_code  | text PK                     | stable human code, e.g. 'JED-HILT' |
| listing_id     | text NOT NULL               | FK → listing.id, UNIQUE      |
| star_rating    | integer NULL                | 1–5                          |
| address        | text NULL                   |                              |

- UNIQUE `(listing_id)` enforces 1:1.
- CHECK the referenced listing has `kind='property'` — enforced in seed/app
  layer (Postgres can't cross-check kind via FK); assert in a test.

## 5. `package` (natural key: package_code), 1:1 with a package listing

| column          | type                       | constraints                  |
|-----------------|----------------------------|------------------------------|
| package_code    | text PK                    | e.g. 'UMR-9D-ECO'            |
| listing_id      | text NOT NULL              | FK → listing.id, UNIQUE      |
| duration_nights | integer NOT NULL           | fixed scope of the package   |
| includes        | text NULL                  | free-text summary of bundle  |

- UNIQUE `(listing_id)` enforces 1:1.
- CHECK `duration_nights > 0`.

## 6. `room_type` (ULID) — child of property

| column         | type                        | constraints                  |
|----------------|-----------------------------|------------------------------|
| id             | text PK (ULID)              |                              |
| property_code  | text NOT NULL               | FK → property.property_code  |
| name           | text NOT NULL               | e.g. 'Double','Quad'         |
| max_occupancy  | integer NOT NULL            |                              |

- UNIQUE `(property_code, name)`.
- Index on `property_code`.
- CHECK `max_occupancy > 0`.

## 7. `season` (ULID) — date window scoped to a listing

| column         | type                        | constraints                  |
|----------------|-----------------------------|------------------------------|
| id             | text PK (ULID)              |                              |
| listing_id     | text NOT NULL               | FK → listing.id              |
| name           | season_name NOT NULL        | label                        |
| start_date     | date NOT NULL               | inclusive                    |
| end_date       | date NOT NULL               | exclusive                    |

- CHECK `end_date > start_date`.
- Non-overlap within a listing: enforce with an EXCLUDE constraint using a
  daterange, `EXCLUDE USING gist (listing_id WITH =, daterange(start_date,
  end_date) WITH &&)`. (Requires btree_gist.) Assert non-overlap in a test too.
- Index on `(listing_id, start_date)`.

## 8. `rate_rule` (ULID) — the atomic price fact

| column          | type                       | constraints                  |
|-----------------|----------------------------|------------------------------|
| id              | text PK (ULID)             |                              |
| listing_id      | text NOT NULL              | FK → listing.id              |
| season_id       | text NOT NULL              | FK → season.id               |
| room_type_id    | text NULL                  | FK → room_type.id; NULL for packages, required for properties |
| min_occupancy   | integer NOT NULL           | band lower bound (inclusive) |
| max_occupancy   | integer NOT NULL           | band upper bound (inclusive) |
| amount          | integer NOT NULL           | minor units. per-night (property) OR total (package) |
| currency        | char(3) NOT NULL           | FK → currency.code (native)  |

- CHECK `max_occupancy >= min_occupancy`.
- CHECK `amount >= 0`.
- Semantics of `amount` (per-night vs total) are determined by the parent
  listing's `kind`; document in code, assert in tests.
- UNIQUE `(listing_id, season_id, room_type_id, min_occupancy, max_occupancy)`
  — one rule per band per room per season. (NULL room_type_id treated distinct;
  add a partial UNIQUE for the package case: UNIQUE `(listing_id, season_id,
  min_occupancy, max_occupancy) WHERE room_type_id IS NULL`.)
- Index on `(listing_id, season_id)`.

## Cross-entity invariants (assert in tests, not FK-expressible)

- Every `kind='property'` listing has ≥1 `room_type` and every property
  `rate_rule` has a non-null `room_type_id`.
- Every `kind='package'` listing has package `rate_rule`s with `room_type_id`
  NULL.
- Occupancy bands for a given (listing, season[, room_type]) do not overlap and
  ideally tile the supported range.

## Schema-generation prompt (paste to kick off Step 3)

> Add to `packages/db/src/schema/app.ts` (copy the existing `post` table pattern used by the
> flights tables in the same file) the Drizzle schema for the 8 tables and 2 enums specified
> in `prd/hotels/11-data-model.md`, exactly: ULID PKs via `createId()` for supporting entities
> and natural keys for currency/property/package, all money as integer minor units plus a
> `currency` char(3), all timestamps `timestamp({ withTimezone: true })`, every FK indexed,
> every UNIQUE/CHECK as written, the season EXCLUDE non-overlap constraint (enable
> btree_gist), and the partial UNIQUE on `rate_rule` for the package (null room_type) case.
> Export `$inferSelect` and `$inferInsert` for all 8 tables. Then run `pnpm db:generate`. No
> UUIDs. No float money columns.
