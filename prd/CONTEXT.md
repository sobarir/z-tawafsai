# CONTEXT.md — Living Project State

> Read this at the start of EVERY Claude Code session, before writing any code.
> Update the checkboxes and the "Current step" line as you complete work.

## Current step

> **STEP 8 — not started.** Next action: Connection-validation service — see `/prd/20-steps.md`
> Step 8. Step 7.5 (interline-agreements module) is done: CRUD (GET/POST/DELETE only — no PATCH,
> per `13-mct-rules.md`'s API surface) for `interline_agreements` at
> `apps/api/src/interline-agreements/`. Resolver `resolveInterline(inboundAirline,
> outboundAirline)` exposed as `GET /interline-agreements/resolve`, operationId `resolveInterline`
> (registered before `:id`): same carrier -> `{online:true, permitted:true,
> bagThroughChecked:true, agreementId:null}` with no DB lookup; otherwise a directional lookup —
> absence is a valid `{permitted:false}` result, NOT a 404 (matches the `InterlineResolution` type
> in `13-mct-rules.md` §A2/§B, which Step 8's classifier consumes directly).
> `InterlineAgreementsModule` exports `InterlineAgreementsService` for Step 8. Seeded GA->SQ,
> SQ->GA, GA->QR (bag=true), NH->KL (bag=false); deliberately NOT GA->AF (S15) or QR->GA (S17).
> Vitest specs at `apps/api/src/interline-agreements/interline-agreements.service.spec.ts` cover
> S13-S17 (`pnpm --filter api test`).
>
> Step 8 now has all 3 resolvers ready to wire together: `FlightMarketingService` (Step 6,
> marketing->operating), `MctRulesService.resolve()` (Step 7, NO_MCT_RULE on no match), and
> `InterlineAgreementsService.resolveInterline()` (Step 7.5, NO_INTERLINE on not-permitted). Build
> the classifier exactly per `13-mct-rules.md` §B's order: transit -> open_jaw -> interline gate ->
> MCT (NEGATIVE_GAP / NO_MCT_RULE / BELOW_MCT) -> connection/stopover. Then `POST
> /connections/validate` and `POST /connections/validate-chain`. Target: ALL of S1-S18 green
> (S12's 3-flight chain composition still needs to be decided/seeded — see the Step 5 note in git
> history and `packages/db/src/seed.ts` comments).

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
- [ ] Step 8 — Connection-validation service (classify gap + interline gate + bagThroughChecked) **← start here**

## Open questions (resolve before the step that needs them)

- [ ] Do we need `city_code` grouping on airports for multi-airport metros (NRT/HND → TYO)?
      **Decision: YES** — required for open-jaw detection and inter-airport MCT. Confirmed in `11-data-model.md`.
- [ ] Terminal-level MCT granularity in v1, or airport-pair only? **Decision: model the column,
      seed airport-pair rules only; terminal rules optional.** See `13-mct-rules.md`.
