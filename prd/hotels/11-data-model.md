# 11 — Data Model (Drizzle spec)

Source of truth. These 6 tables + 2 enums live in `packages/db/src/schema/app.ts` (copy the `post`
pattern per `packages/db/AGENTS.md`) — alongside the flights domain's `mctScope`/`legRole`/
`flightStatus` enums and `post`/`airports`/`airlines`/`flights`/`flightLegs`/`flightMarketing`/
`mctRules`/`interlineAgreements` tables already there (no naming collisions). All money = integer
minor units + currency. All IDs ULID (via `createId()` from `@repo/db`) or natural key. Never
UUID. All timestamps `timestamp({ withTimezone: true })`.

> **2026 revision**: the domain was originally `listing`-polymorphic (`kind = 'property' |
> 'package'`), where a `package` was a self-contained, season-total-priced multi-night deal with
> no flight attached. That concept has been removed — the hotels domain is lodging-only now. The
> `listing` spine table was merged directly into `property` (it existed only to support the
> property/package split); `kind` was repurposed into `property_type`, a lodging-type
> classification (`hotel` | `apartment` | `house`), not a search-polymorphism discriminant. See
> `CONTEXT.md` for the decision log. This is unrelated to the separate travel-packages domain's
> flight+hotel bundle (`flightHotelPackage` / DB table `travel_package`), which still exists and
> was not touched.

## Enums

```
property_type     : 'hotel' | 'apartment' | 'house'
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

## 3. `property` (natural key: property_code) — the spine

| column         | type                        | constraints                  |
|----------------|-----------------------------|------------------------------|
| property_code  | text PK                     | stable human code, e.g. 'JED-HILT' |
| type           | property_type NOT NULL      | hotel / apartment / house     |
| display_name   | text NOT NULL               |                              |
| destination    | text NOT NULL               | searchable (city/region)     |
| country_code   | char(2) NOT NULL            | ISO-3166-1 alpha-2           |
| hero_image_url | text NULL                   | single string, no media model|
| star_rating    | integer NULL                | 1–5                          |
| address        | text NULL                   |                              |
| distance_meters| integer NULL                | approx. distance to the property's relevant landmark (added 2026-07-18) |
| distance_note  | text NULL                   | free-text qualifier, e.g. 'Shuttle', '2 min walk' (added 2026-07-18) |
| contact_phone  | text NULL                   | added 2026-07-18             |
| contact_email  | text NULL                   | added 2026-07-18             |
| is_active      | boolean NOT NULL DEFAULT true|                             |
| created_at     | timestamptz NOT NULL DEFAULT now() |                       |

- CHECK `star_rating IS NULL OR (star_rating BETWEEN 1 AND 5)`.
- Index on `destination`, index on `type`, index on `(is_active, type)`.

## 4. `room_type` (ULID) — child of property

| column         | type                        | constraints                  |
|----------------|-----------------------------|------------------------------|
| id             | text PK (ULID)              |                              |
| property_code  | text NOT NULL               | FK → property.property_code  |
| name           | text NOT NULL               | e.g. 'Double','Quad'         |
| max_occupancy  | integer NOT NULL            |                              |

- UNIQUE `(property_code, name)`.
- Index on `property_code`.
- CHECK `max_occupancy > 0`.

## 5. `season` (ULID) — date window scoped to a property

| column         | type                        | constraints                  |
|----------------|-----------------------------|------------------------------|
| id             | text PK (ULID)              |                              |
| property_code  | text NOT NULL               | FK → property.property_code  |
| name           | season_name NOT NULL        | label                        |
| start_date     | date NOT NULL               | inclusive                    |
| end_date       | date NOT NULL               | exclusive                    |

- CHECK `end_date > start_date`.
- Non-overlap within a property: enforce with an EXCLUDE constraint using a
  daterange, `EXCLUDE USING gist (property_code WITH =, daterange(start_date,
  end_date) WITH &&)`. (Requires btree_gist.) Assert non-overlap in a test too.
- Index on `(property_code, start_date)`.

## 6. `rate_rule` (ULID) — the atomic price fact

| column          | type                       | constraints                  |
|-----------------|----------------------------|-------------------------------|
| id              | text PK (ULID)             |                              |
| property_code   | text NOT NULL              | FK → property.property_code  |
| season_id       | text **NULL**              | FK → season.id; NULL = the Standard (base) rate (2026-07-19) |
| room_type_id    | text NOT NULL              | FK → room_type.id            |
| min_occupancy   | integer NOT NULL           | band lower bound (inclusive) |
| max_occupancy   | integer NOT NULL           | band upper bound (inclusive) |
| amount          | integer NOT NULL           | minor units, always per-night |
| currency        | char(3) NOT NULL           | FK → currency.code (native)  |

- CHECK `max_occupancy >= min_occupancy`.
- CHECK `amount >= 0`.
- UNIQUE **NULLS NOT DISTINCT** `(property_code, season_id, room_type_id, min_occupancy, max_occupancy)`
  — one rule per band per room per season; `NULLS NOT DISTINCT` so two Standard
  (season-less) bands for the same property/room/occupancy still collide.
- `season_id` NULL = **Standard** rate, applied whenever no dated season covers the
  stay (or a matched season lacks a band). `season_name = 'standard'` is retired
  as a dated season — Standard is now the absence of a season.

## Cross-entity invariants (assert in tests, not FK-expressible)

- Every property has ≥1 `room_type`.
- Occupancy bands for a given (property, season, room_type) do not overlap and
  ideally tile the supported range.

## Schema-generation prompt (paste to kick off Step 3)

> Add to `packages/db/src/schema/app.ts` (copy the existing `post` table pattern used by the
> flights tables in the same file) the Drizzle schema for the 6 tables and 2 enums specified
> in `prd/hotels/11-data-model.md`, exactly: ULID PKs via `createId()` for supporting entities
> and natural keys for currency/property, all money as integer minor units plus a
> `currency` char(3), all timestamps `timestamp({ withTimezone: true })`, every FK indexed,
> every UNIQUE/CHECK as written, and the season EXCLUDE non-overlap constraint (enable
> btree_gist). Export `$inferSelect` and `$inferInsert` for all 6 tables. Then run
> `pnpm db:generate`. No UUIDs. No float money columns.
