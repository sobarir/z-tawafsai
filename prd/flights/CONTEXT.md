# CONTEXT.md — Living Project State

> Read this at the start of EVERY Claude Code session, before writing any code.
> Update the checkboxes and the "Current step" line as you complete work.

## Current step

> **Step 11 (v1.3) — OTA-style connecting-itinerary search: done.** `GET /flights/search`
> previously matched a single `flights` row by origin+dest+UTC-day only (see the Step 10 note
> below) — a route with no direct flight (e.g. CGK→JED on a date only served by one-stop hub
> routings) returned empty even though valid connections existed in the seed data. This step
> replaces the endpoint's response in place: it now returns `FlightItinerary[]` — direct flights
> *and* 1-stop itineraries gated by the existing `ConnectionsService.classify()` (Step 8's MCT +
> interline engine, reused as-is, zero duplicated validation logic). New shared type
> `flightItinerarySchema`/`FlightItinerary` (`flights`, `connections`, `stopCount`, `totalPrice`,
> `currency`, `departureTime`, `arrivalTime`, `totalDurationMinutes`). New
> `ConnectionsService.searchItineraries()` orchestrates two new `FlightsService` query helpers
> (`searchOutboundExcluding`, `searchInboundFromHubs`) plus `classify()` per candidate pair;
> `FlightsController`'s `search` route now calls `ConnectionsService` (wired via `forwardRef()`
> between `FlightsModule` and `ConnectionsModule` — no other consumer of the old direct-only
> shape existed, so this is a clean breaking change, not a second parallel endpoint). Only
> `connection` and `stopover` kinds are surfaced (`open_jaw`/`invalid`/`transit` are not valid
> single itineraries). **v1 scope limits (documented, not hard requirements):** max 1 stop (2
> flights) per itinerary; second-leg candidates are only considered within 72h of the first leg's
> arrival (`CONNECTION_SEARCH_WINDOW_HOURS`); legs must share currency (no conversion exists in
> this system — a non-issue today since all seed data is USD). Verified against live Postgres:
> CGK-JED 2026-08-05 now returns the 2 known directs plus a cheaper one-stop via CAI (MS977+MS653,
> $750 vs $775/$805 direct); CGK-JED 2026-08-08 (previously empty) now returns 6 one-stop
> itineraries via BOM/SIN/KUL/DXB/AUH/DOH. `/search` page rewritten to render itineraries with a
> connection divider (hub, layover duration, connection/stopover badge, interline + bag-through-
> check indicators); i18n keys added to all 6 locales. All quality gates green.
>
> **Step 10 (v1.2) — Realistic CGK↔JED/MED Umrah-corridor seed data: done.** Added 9 airports
> (JED, MED, KUL, DXB, AUH, CAI, BOM, HAK, MCT), 10 airlines (SV, MH, EK, EY, MS, AI, HU, WY, TR,
> 6E), 180 new `flights` rows across 26 route-patterns (direct GA/SV CGK-JED/CGK-MED, 9 transit
> hubs, plus a standalone SV JED-MED domestic connector), 8 new `mct_rules`, and 8 new
> `interline_agreements`, spanning Aug/Sep/Oct 2026 at 2-3 dates/month/route. Routing was
> researched (WebSearch) against real-world carrier coverage for the corridor rather than
> fabricated; prices are realistic estimates, not literal future fares. Design decision: MED is
> only reachable directly or via the 3 hubs whose carrier genuinely flies onward to MED (KUL/MH,
> DOH/QR, MCT/WY) — confirmed by reading `FlightsService.search()`, which matches a single
> `flights` row by origin+dest+UTC-day and never chains two flights into one itinerary, so a
> hub route that doesn't reach MED on its own metal simply isn't seeded as a MED itinerary. The
> other 6 hubs (SIN, DXB, AUH, CAI, BOM, HAK) reach JED only, plus riders can interline onto the
> new SV JED-MED connector. Full details and the known HAK/CAI date-alignment limitation:
> `15-seed-data.md`. Idempotency and live search/`connections/validate` behavior verified against
> Postgres; all quality gates green.
>
> **Step 9 (v1.1) — Flight pricing + OTA-style search: done.** Backend v1 (Steps 3–8, all S1–S18
> green) was already complete. This step added a single admin-managed, seeded `price`/`currency`
> per flight (`flights` table columns + `flights.dto/service/controller`), `GET /flights/search`
> (route + UTC-calendar-day match, `ACTIVE` only, sorted price-ascending — declared before
> `GET /flights/:id`, same ordering trick as `mct-rules`/`interline-agreements` `resolve`), a public
> `/search` page reachable by any signed-in user (built under **both** `@admin/search/page.tsx` and
> `@user/search/page.tsx` — the `(protected)` layout picks its rendered slot purely from the
> viewer's `dashboard.view:*` permission, not from which slot actually has a matching page, so a
> page that should be visible to every role must exist in every slot or the other role sees a blank
> `default.tsx`), and price/currency fields added to the existing admin Flights create/edit forms.
> Full quality gates green (typecheck/lint/test/`check:dupes`/`check:backbone` across the repo) plus
> end-to-end verification against live Postgres. No further step is queued; the next session should
> pick a new task explicitly.
>
> **Backend v1 (Steps 3–8) recap:** all done — the definition of done for v1
> (`00-overview.md` success criteria): **all of S1–S18 in `14-scenarios.md` are green**, plus
> lint/format/typecheck clean.
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

- Scope: **schedule & inventory, plus (v1.1) read-only price-aware search** — still no booking
  engine, no PNR, no seat inventory, no payment. See the price/search decision below.
- Codeshare: **own-metal model only**, no external GDS/NDC in v1.
- ORM: Drizzle. DB: PostgreSQL 16. API: NestJS. IDs: ULID (`varchar(26)`) for supporting entities,
  natural keys for airports/airlines.
- Money (**amended 2026-07-13, v1.1**): a **single flat price + currency per flight** is in scope —
  columns on `flights` (`price numeric(10,2)`, `currency varchar(3)`), admin-managed via the
  existing Schedule Admin screens, seeded for demo flights, used only for `GET /flights/search`
  display and price-ascending sort. Originally "not in scope" for v1; the user explicitly asked for
  OTA-style search with price, this was flagged against the Non-Goals below before being adopted
  (see `00-overview.md` Goal 7), and the scope stays narrow on purpose: still **no** fare classes,
  fare construction, dynamic/multi-class pricing, promotions, or payment — if any of those sneak in,
  stop and flag it again.
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
- [x] Step 9 (v1.1) — Flight pricing + OTA-style search (price/currency columns, `GET /flights/search`, public `/search` page, admin price management)
- [x] Step 10 (v1.2) — CGK↔JED/MED realistic seed data (26 route-patterns, 9 airports, 10 airlines, 180 flights, 8 MCT rules, 8 interline agreements)
- [x] Step 11 (v1.3) — OTA-style connecting-itinerary search (`GET /flights/search` returns direct + 1-stop `FlightItinerary[]`, gated by the existing `ConnectionsService.classify()`)

## Open questions (resolve before the step that needs them)

- [ ] Do we need `city_code` grouping on airports for multi-airport metros (NRT/HND → TYO)?
      **Decision: YES** — required for open-jaw detection and inter-airport MCT. Confirmed in `11-data-model.md`.
- [ ] Terminal-level MCT granularity in v1, or airport-pair only? **Decision: model the column,
      seed airport-pair rules only; terminal rules optional.** See `13-mct-rules.md`.
- [ ] v1.2's HAK/CAI seed dates don't always line up with the SV JED-MED connector's dates
      (known, documented limitation — see `15-seed-data.md`). Not blocking; revisit only if a
      future step needs every hub's MED itinerary demonstrable end-to-end on the same date.
