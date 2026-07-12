# CONTEXT.md — Living Project State

> Read this at the start of EVERY Claude Code session, before writing any code.
> Update the checkboxes and the "Current step" line as you complete work.

## Current step

> **Backend v1 complete.** All of Steps 3–8 from `/prd/20-steps.md` are done — the definition of
> done for v1 (`/prd/00-overview.md` success criteria): **all of S1–S18 in `14-scenarios.md` are
> green**, plus lint/format/typecheck clean. No further backend step is queued; the next session
> should pick a new task explicitly rather than assume there's a "next step."
>
> Step 8 (connection-validation service) added `apps/api/src/connections/`:
> `ConnectionsService.classify(prevFlightId, nextFlightId)` implements the `13-mct-rules.md` §B
> classifier exactly — transit -> open_jaw -> interline gate (via `InterlineAgreementsService`,
> Step 7.5) -> gap sign (`NEGATIVE_GAP`, checked before rule lookup so an unrelated airport pair
> with no rule still reports the right reason) -> MCT (via `MctRulesService.findApplicableRule()`,
> a new non-throwing variant added alongside the existing `resolve()`) -> connection/stopover.
> `POST /connections/validate` and `POST /connections/validate-chain` (both `@HttpCode(200)`,
> overriding Nest's POST-default 201 since these are read/compute endpoints, not creates).
> `resolveScope()` (domestic/international per leg, DD/DI/ID/II) and `minutesBetween()` are pure,
> directly unit-tested helpers. `AirportsModule` now exports `AirportsService` (needed for
> city_code/country_code lookups — open-jaw detection and scope determination).
>
> Seed additions for S9/S12–S18: AMS airport (KL 800's destination), 14 new flights, 1 new MCT
> rule (`HND`->`NRT` `DI` 240 — S12 junction 2). **Found and fixed a real PRD inconsistency**: the
> DOH/DOH II rule's `maxConnectionMinutes` is documented as 2880 in both `13-mct-rules.md`'s seed
> table and `15-seed-data.md`, but S3's 2730-min gap only classifies as `stopover` (as the scenario
> requires) if `maxConnectionMinutes=1440` — used 1440 since the scenario doc is the acceptance
> oracle. S12's 3-flight chain (previously deferred) is now fully specified: `GA10 CGK->NRT`,
> `GA11 NRT->HND` (junction 1, NRT/NRT ID, reuses an existing rule), `GA12 NRT->LHR` (junction 2,
> HND/NRT DI, the new rule) — note the actual airports touched deviate slightly from
> `14-scenarios.md`'s prose ("HND intl dep") because the existing NRT/HND rule's direction forced
> this specific routing; the *structural* assertion (same-airport then inter-airport) is exact.
>
> All 4 resolvers are now composed end-to-end and covered by
> `apps/api/src/connections/connections.service.spec.ts` (one test per scenario, S1–S9 and
> S11–S18; S10 remains covered by the Step 6 flight-marketing specs since it doesn't involve
> `classify()`). Full suite: 59/59 (`pnpm --filter api test`).

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
- [x] Step 7 — MCT rules module (CRUD + most-specific-first resolver)
- [x] Step 7.5 — Interline-agreements module (carrier-pair gate + directional lookup)
- [x] Step 8 — Connection-validation service (classify gap + interline gate + bagThroughChecked) — **backend v1 done, all S1-S18 green**

## Open questions (resolve before the step that needs them)

- [ ] Do we need `city_code` grouping on airports for multi-airport metros (NRT/HND → TYO)?
      **Decision: YES** — required for open-jaw detection and inter-airport MCT. Confirmed in `11-data-model.md`.
- [ ] Terminal-level MCT granularity in v1, or airport-pair only? **Decision: model the column,
      seed airport-pair rules only; terminal rules optional.** See `13-mct-rules.md`.
