# 11 — Data Model

Target ORM: **Drizzle** (`drizzle-orm/pg-core`). Target DB: **PostgreSQL 16**.
Follow the conventions in `CLAUDE.md` exactly (ULID for supporting entities, natural keys for
domain entities, `timestamp({ withTimezone: true })`, integer minutes for durations).

## Enums (define these FIRST as `pgEnum`)

| Enum name       | Values                                                      | Used by                         |
| --------------- | ---------------------------------------------------------- | ------------------------------- |
| `mct_scope`     | `DD`, `DI`, `ID`, `II`                                      | `mct_rules.scope` (dom/intl combos) |
| `leg_role`      | `FULL`, `TECHNICAL_STOP`                                    | `flight_legs.role`              |
| `flight_status` | `ACTIVE`, `SUSPENDED`, `SEASONAL`                           | `flights.status`                |

> `connection_kind` (connection/stopover/open_jaw/transit/invalid) is **NOT** an enum column —
> it is a derived value returned by the validation service. Represent it as a Zod enum in the API
> layer only. Do not add it to any table.

## Entity 1 — `airports` (domain, natural key)

| Column       | Type                         | Constraints                          |
| ------------ | ---------------------------- | ------------------------------------ |
| airport_code | `varchar(3)`                 | PRIMARY KEY — IATA (JFK, NRT, HND)    |
| icao_code    | `varchar(4)`                 | nullable                             |
| name         | `varchar(100)`               | not null                             |
| city_code    | `varchar(3)`                 | not null — metro grouping (TYO, NYC)  |
| country_code | `varchar(2)`                 | not null — ISO-3166                   |
| timezone     | `varchar(50)`                | not null — IANA tz ('Asia/Tokyo')     |
| latitude     | `numeric(9,6)`               | nullable                             |
| longitude    | `numeric(9,6)`               | nullable                             |
| created_at   | `timestamp(tz)`              | not null default now()               |
| updated_at   | `timestamp(tz)`              | not null default now() `$onUpdate`    |

Indexes: `idx_airports_city_code` on `city_code` (critical — open-jaw + inter-airport MCT lookups).

## Entity 2 — `airlines` (domain, natural key)

| Column        | Type            | Constraints                          |
| ------------- | --------------- | ------------------------------------ |
| airline_code  | `varchar(2)`    | PRIMARY KEY — IATA (GA, NH, KL)       |
| icao_code     | `varchar(3)`    | nullable                             |
| name          | `varchar(100)`  | not null                             |
| country_code  | `varchar(2)`    | not null                             |
| created_at    | `timestamp(tz)` | not null default now()               |
| updated_at    | `timestamp(tz)` | not null default now() `$onUpdate`    |

## Entity 3 — `flights` (operating — the physical flight)

| Column            | Type            | Constraints                                        |
| ----------------- | --------------- | -------------------------------------------------- |
| id                | `varchar(26)`   | PK — `$defaultFn(() => ulid())`                     |
| operating_airline | `varchar(2)`    | not null → `airlines.airline_code`                 |
| flight_number     | `varchar(4)`    | not null                                           |
| origin_airport    | `varchar(3)`    | not null → `airports.airport_code` (overall route) |
| dest_airport      | `varchar(3)`    | not null → `airports.airport_code` (overall route) |
| departure_time    | `timestamp(tz)` | not null — overall scheduled departure             |
| arrival_time      | `timestamp(tz)` | not null — overall scheduled arrival               |
| aircraft_type     | `varchar(10)`   | nullable (e.g. '789', '77W')                        |
| status            | `flight_status` | not null default `ACTIVE`                          |
| created_at        | `timestamp(tz)` | not null default now()                             |
| updated_at        | `timestamp(tz)` | not null default now() `$onUpdate`                  |

Constraints/Indexes:
- CHECK `arrival_time > departure_time`.
- UNIQUE `(operating_airline, flight_number, departure_time)` — a physical flight is unique by
  carrier + number + departure instant.
- `idx_flights_origin_dep` on `(origin_airport, departure_time)`,
  `idx_flights_dest_arr` on `(dest_airport, arrival_time)` — for connection candidate search.

## Entity 4 — `flight_legs` (operating — takeoff/landing units)

A single-leg flight still gets **one** row (role `FULL`). A technical-stop flight gets ≥2 rows.

| Column          | Type            | Constraints                                     |
| --------------- | --------------- | ----------------------------------------------- |
| id              | `varchar(26)`   | PK — ULID                                        |
| flight_id       | `varchar(26)`   | not null → `flights.id` (ON DELETE CASCADE)      |
| leg_sequence    | `integer`       | not null — 1-based order within the flight       |
| role            | `leg_role`      | not null (`FULL` or `TECHNICAL_STOP`)            |
| dep_airport     | `varchar(3)`    | not null → `airports.airport_code`               |
| arr_airport     | `varchar(3)`    | not null → `airports.airport_code`               |
| departure_time  | `timestamp(tz)` | not null                                        |
| arrival_time    | `timestamp(tz)` | not null                                        |
| created_at      | `timestamp(tz)` | not null default now()                          |
| updated_at      | `timestamp(tz)` | not null default now() `$onUpdate`               |

Constraints/Indexes:
- UNIQUE `(flight_id, leg_sequence)`.
- CHECK `arrival_time > departure_time`.
- Invariant (enforce in service layer, assert in tests): the first leg's `dep_airport` = the
  flight's `origin_airport`, the last leg's `arr_airport` = the flight's `dest_airport`, and legs
  are contiguous (leg[n].arr_airport == leg[n+1].dep_airport).

## Entity 5 — `flight_marketing` (marketing / codeshare)

| Column               | Type            | Constraints                                   |
| -------------------- | --------------- | --------------------------------------------- |
| id                   | `varchar(26)`   | PK — ULID                                      |
| flight_id            | `varchar(26)`   | not null → `flights.id` (ON DELETE CASCADE)    |
| marketing_airline    | `varchar(2)`    | not null → `airlines.airline_code`             |
| marketing_number     | `varchar(4)`    | not null                                       |
| is_operating_carrier | `boolean`       | not null default false                         |
| created_at           | `timestamp(tz)` | not null default now()                         |
| updated_at           | `timestamp(tz)` | not null default now() `$onUpdate`             |

Constraints/Indexes:
- UNIQUE `(marketing_airline, marketing_number, flight_id)`.
- UNIQUE partial index: at most one `is_operating_carrier = true` per `flight_id`
  (`CREATE UNIQUE INDEX ... ON flight_marketing (flight_id) WHERE is_operating_carrier`).
- Invariant (service layer + test): the row where `is_operating_carrier = true` must have
  `marketing_airline == flights.operating_airline`. Own-metal: all marketing airlines exist in
  `airlines` (no external feed).

## Entity 6 — `mct_rules` (connection-time rules — NOT FK-linked to flights)

Matched at validation time, most-specific-first. See `13-mct-rules.md` for the resolver.

| Column               | Type            | Constraints                                       |
| -------------------- | --------------- | ------------------------------------------------- |
| id                   | `varchar(26)`   | PK — ULID                                          |
| arrival_airport      | `varchar(3)`    | not null → `airports.airport_code`                |
| departure_airport    | `varchar(3)`    | not null → `airports.airport_code` (≠ arrival ⇒ inter-airport) |
| scope                | `mct_scope`     | not null (`DD`/`DI`/`ID`/`II`)                     |
| arrival_airline      | `varchar(2)`    | nullable → `airlines` (NULL = any)                 |
| departure_airline    | `varchar(2)`    | nullable → `airlines` (NULL = any)                 |
| arrival_terminal     | `varchar(5)`    | nullable (NULL = any)                              |
| departure_terminal   | `varchar(5)`    | nullable (NULL = any)                              |
| mct_minutes          | `integer`       | not null — floor gap in minutes                    |
| max_connection_minutes | `integer`     | not null default 1440 — beyond ⇒ stopover          |
| created_at           | `timestamp(tz)` | not null default now()                             |
| updated_at           | `timestamp(tz)` | not null default now() `$onUpdate`                 |

Indexes: `idx_mct_lookup` on `(arrival_airport, departure_airport, scope)` — the hot path.
CHECK `mct_minutes > 0`, `max_connection_minutes >= mct_minutes`.

## Entity 7 — `interline_agreements` (carrier-pair connection permission)

A directional gate: does inbound carrier X allow a through-ticketed interline connection onto
outbound carrier Y? Checked at validation time on **operating** carriers, only when they differ.

| Column               | Type            | Constraints                                       |
| -------------------- | --------------- | ------------------------------------------------- |
| id                   | `varchar(26)`   | PK — ULID                                          |
| inbound_airline      | `varchar(2)`    | not null → `airlines.airline_code`                |
| outbound_airline     | `varchar(2)`    | not null → `airlines.airline_code`                |
| bag_through_checked  | `boolean`       | not null default true — bags checked to final dest |
| created_at           | `timestamp(tz)` | not null default now()                            |
| updated_at           | `timestamp(tz)` | not null default now() `$onUpdate`                 |

Constraints/Indexes:
- UNIQUE `(inbound_airline, outbound_airline)` — one row per directed pair.
- CHECK `inbound_airline <> outbound_airline` — a carrier is always "online" with itself; don't
  store self-pairs.
- `idx_interline_lookup` on `(inbound_airline, outbound_airline)` — the hot path at validation.
- **Directional**: A→B and B→A are separate rows. Presence of one does not imply the other. If you
  want a symmetric agreement, seed both rows.

> This is the **v1 simple gate**: existence = permitted. No fare/segment scope, no effective dates.
> Those are deferred (see `00-overview.md` Non-Goals). `bag_through_checked` is the only attribute.

## Entity 8 — connection candidates (DERIVED — no base table)

Produced by the validation service (`13-mct-rules.md` / `14-scenarios.md`). Shape returned by API:

```ts
type ConnectionKind = 'connection' | 'stopover' | 'open_jaw' | 'transit' | 'invalid';
type ConnectionResult = {
  prevFlightId: string;
  nextFlightId: string;
  kind: ConnectionKind;
  gapMinutes: number | null;      // null for open_jaw / transit
  sameMetroInterAirport: boolean; // true for NRT→HND style
  isInterline: boolean;           // true when operating carriers differ
  bagThroughChecked: boolean;     // online ⇒ true; interline ⇒ per agreement; else false
  appliedMctRuleId: string | null;
  appliedInterlineId: string | null; // the agreement row used, if interline
  reason: string;                 // human-readable explanation (incl. NO_INTERLINE)
};
```

Optional (defer to a later phase): a materialized `connection_candidates` cache table with the same
columns + a `computed_at` timestamp. Not required for v1 correctness.

## Schema generation prompt (paste into the Step-3 kickoff)

> Generate `/src/db/schema.ts` with Drizzle for these 7 tables (airports, airlines, flights,
> flight_legs, flight_marketing, mct_rules, interline_agreements; connection candidates are derived
> — no table). Define the 3 `pgEnum`s first. Domain entities (airports, airlines) use natural
> `varchar` PKs; supporting entities use `varchar(26).$defaultFn(() => ulid())`. All timestamps
> `timestamp({ withTimezone: true })`; all durations `integer()` minutes. Add every UNIQUE, CHECK,
> partial index, and FK listed in `11-data-model.md` (including the `interline_agreements`
> `inbound <> outbound` CHECK and the `(inbound_airline, outbound_airline)` UNIQUE). Add
> `$onUpdate(() => new Date())` on all `updated_at`. Export `$inferSelect` / `$inferInsert` types
> for all 7 tables.
