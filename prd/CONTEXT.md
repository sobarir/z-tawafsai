# CONTEXT.md — Living Project State

> Read this at the start of EVERY Claude Code session, before writing any code.
> Update the checkboxes and the "Current step" line as you complete work.

## Current step

> **STEP 7.5 — not started.** Next action: Interline-agreements module — see `/prd/20-steps.md`
> Step 7.5. Step 7 (MCT rules module) is done: CRUD for `mct_rules` at `apps/api/src/mct-rules/`,
> most-specific-first resolver `pickMostSpecificMctRule` (pure function, unit-tested directly) +
> `MctRulesService.resolve()` (DB-backed, throws `NotFoundException` for `NO_MCT_RULE`) exposed as
> `GET /mct-rules/resolve`, operationId `resolveMctRule` (registered before `:id`). Ranking: each
> non-NULL rule field must equal the candidate's value (NULL = wildcard), most non-NULL fields
> wins, ties broken by newest `updatedAt`. Seeded the minimum viable rule set from
> `13-mct-rules.md` plus the S11 pair (NRT/NRT II default mct=60 + NH-specific mct=45); idempotent
> upsert matches by full identity tuple since `mct_rules` has no unique constraint to target.
> `MctRulesModule` exports `MctRulesService` for Step 8 to consume directly. Vitest specs at
> `apps/api/src/mct-rules/mct-rules.service.spec.ts` (`pnpm --filter api test`).

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
- [ ] Step 7.5 — Interline-agreements module (carrier-pair gate + directional lookup) **← start here**
- [ ] Step 8 — Connection-validation service (classify gap + interline gate + bagThroughChecked)

## Open questions (resolve before the step that needs them)

- [ ] Do we need `city_code` grouping on airports for multi-airport metros (NRT/HND → TYO)?
      **Decision: YES** — required for open-jaw detection and inter-airport MCT. Confirmed in `11-data-model.md`.
- [ ] Terminal-level MCT granularity in v1, or airport-pair only? **Decision: model the column,
      seed airport-pair rules only; terminal rules optional.** See `13-mct-rules.md`.
