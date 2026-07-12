# CONTEXT.md — Living Project State

> Read this at the start of EVERY Claude Code session, before writing any code.
> Update the checkboxes and the "Current step" line as you complete work.

## Current step

> **STEP 6 — not started.** Next action: Marketing/codeshare module — see `/prd/20-steps.md`
> Step 6. Step 5 (operating-flight module) is done: CRUD for flights + flight_legs at
> `apps/api/src/flights/`, leg invariants enforced service-side (`buildFlightLegs` in
> `flights.service.ts` — first leg dep = origin, last leg arr = dest, contiguous legs), NH 10
> CGK-BKK-LHR technical stop + point-to-point demo flights (S1-S6, S8) added to
> `packages/db/src/seed.ts` (BKK airport added too — missing from `15-seed-data.md`'s table but
> required by S7's route). S12's 3-flight chain composition is deliberately NOT seeded yet — its
> exact shape is ambiguous from `14-scenarios.md` alone and depends on the connection-validation
> service (Step 8) to pin down. Vitest specs at `apps/api/src/flights/flights.service.spec.ts`
> (`pnpm --filter api test`).

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
- [ ] Step 6 — Marketing/codeshare module (marketing→operating mapping, own-metal partners) **← start here**
- [ ] Step 7 — MCT rules module (CRUD + most-specific-first resolver)
- [ ] Step 7.5 — Interline-agreements module (carrier-pair gate + directional lookup)
- [ ] Step 8 — Connection-validation service (classify gap + interline gate + bagThroughChecked)

## Open questions (resolve before the step that needs them)

- [ ] Do we need `city_code` grouping on airports for multi-airport metros (NRT/HND → TYO)?
      **Decision: YES** — required for open-jaw detection and inter-airport MCT. Confirmed in `11-data-model.md`.
- [ ] Terminal-level MCT granularity in v1, or airport-pair only? **Decision: model the column,
      seed airport-pair rules only; terminal rules optional.** See `13-mct-rules.md`.
