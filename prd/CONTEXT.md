# CONTEXT.md — Living Project State

> Read this at the start of EVERY Claude Code session, before writing any code.
> Update the checkboxes and the "Current step" line as you complete work.

## Current step

> **STEP 7 — not started.** Next action: MCT rules module — see `/prd/20-steps.md` Step 7.
> Step 6 (marketing/codeshare module) is done: CRUD for `flight_marketing` at
> `apps/api/src/flight-marketing/`, invariants enforced service-side
> (`assertOperatingCarrierInvariant` in `flight-marketing.service.ts` — the
> `is_operating_carrier=true` row's airline must equal the flight's operating airline, and only one
> such row may exist per flight). Resolver `resolveOperatingFlight(marketingAirline,
> marketingNumber)` exposed as `GET /flight-marketing/resolve`, operationId
> `getOperatingFlightByMarketing` (delegates to `FlightsService.findById`, now exported from
> `FlightsModule`). Note: the resolver takes no date, so it assumes at most one live marketing row
> per (airline, number) pair across all flights — fine for the v1 seed data, but a real recurring
> schedule would need a date param to disambiguate; flag this if Step 8 hits it. GA 874 CGK->NRT
> seeded with 3 marketing rows (GA 874 operating, NH 5502, KL 4062) per S10. Vitest specs at
> `apps/api/src/flight-marketing/flight-marketing.service.spec.ts` (`pnpm --filter api test`).

## Confirmed decisions (do not re-litigate)

- Scope: **schedule & inventory only** — no booking engine, no fares, no PNR, no seat inventory.
- Codeshare: **own-metal model only**, no external GDS/NDC in v1.
- ORM: Drizzle. DB: PostgreSQL 16. API: NestJS. IDs: ULID (`varchar(26)`) for supporting entities,
  natural keys for airports/airlines.
- Money: **not in scope** (no fares). If any price-like field sneaks in, stop and flag it.
- Data model centers on: **Journey/Segment/Leg + MCT** and **Codeshare (marketing vs operating)**.
- Interline: **simple carrier-pair gate** (directional agreement exists or not) + a
  `bagThroughChecked` flag on connection results. No fare/segment scope, no effective dates in v1.
  Interline is checked on **operating** carriers, and only when they differ (same carrier = online).

## Entities (7 tables total)

| Entity              | Type       | PK strategy                    | Confirmed |
| ------------------- | ---------- | ------------------------------ | :-------: |
| airports            | domain     | `varchar(3)` IATA code         |    [x]    |
| airlines            | domain     | `varchar(2)` IATA code         |    [x]    |
| flights             | operating  | `varchar(26)` ULID             |    [x]    |
| flight_legs         | operating  | `varchar(26)` ULID             |    [x]    |
| flight_marketing    | marketing  | `varchar(26)` ULID             |    [x]    |
| mct_rules           | rules      | `varchar(26)` ULID             |    [x]    |
| interline_agreements | agreement | `varchar(26)` ULID            |    [x]    |
| connection_candidates (view/derived, optional cache) | derived | n/a |    [ ]    |

## Progress checklist

- [x] Step 3 — Schema-first kickoff (schema.ts + enums + inferred types)
- [x] Step 4 — Reference-data module (airports, airlines CRUD + seed)
- [x] Step 5 — Operating-flight module (flights + legs, technical-stop support)
- [x] Step 6 — Marketing/codeshare module (marketing→operating mapping, own-metal partners)
- [ ] Step 7 — MCT rules module (CRUD + most-specific-first resolver) **← start here**
- [ ] Step 7.5 — Interline-agreements module (carrier-pair gate + directional lookup)
- [ ] Step 8 — Connection-validation service (classify gap + interline gate + bagThroughChecked)

## Open questions (resolve before the step that needs them)

- [ ] Do we need `city_code` grouping on airports for multi-airport metros (NRT/HND → TYO)?
      **Decision: YES** — required for open-jaw detection and inter-airport MCT. Confirmed in `11-data-model.md`.
- [ ] Terminal-level MCT granularity in v1, or airport-pair only? **Decision: model the column,
      seed airport-pair rules only; terminal rules optional.** See `13-mct-rules.md`.
